// BlocStudio en application Windows (BlocStudio.exe, à côté de index.html).
//
// L'éditeur est affiché dans une fenêtre WebView2 (le moteur d'Edge). Les fichiers
// (projets, pages web, applications .exe) sont enregistrés directement par Windows
// avec une boîte « Enregistrer sous » : contrairement aux téléchargements du
// navigateur, ils ne sont pas marqués « venant d'Internet », donc ni bloqués
// ni signalés par SmartScreen.
//
// Dialogue avec la page (js/app.js) par messages JSON :
//   page → { id, action: "enregistrer", nom, donnees (base64) }  ← { id, chemin } ou { id, erreur }
//   page → { action: "lancer" | "dossier", chemin }  (uniquement un fichier enregistré ici)

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Web.Script.Serialization;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;

[assembly: AssemblyTitle("BlocStudio")]
[assembly: AssemblyProduct("BlocStudio")]
[assembly: AssemblyVersion("1.0.0.0")]

namespace BlocStudio
{
    static class Studio
    {
        [DllImport("user32.dll")]
        static extern bool SetProcessDPIAware();

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        static extern IntPtr LoadLibrary(string chemin);

        public static readonly string DossierDonnees = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "BlocStudio");

        public static readonly string DossierSite = Path.GetDirectoryName(Application.ExecutablePath);

        [STAThread]
        static int Main()
        {
            AppDomain.CurrentDomain.AssemblyResolve += ChargerDllIntegree;
            SetProcessDPIAware();
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            if (!File.Exists(Path.Combine(DossierSite, "index.html")))
            {
                MessageBox.Show("BlocStudio.exe doit rester dans le dossier de BlocStudio, à côté du fichier index.html.\n\n" +
                    "Pour le lancer depuis le bureau, créez plutôt un raccourci (clic droit → Envoyer vers → Bureau).",
                    "BlocStudio", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return 1;
            }

            PreparerChargeurNatif();
            Ouvrir();
            return 0;
        }

        // Méthode séparée : les types WebView2 ne doivent être chargés
        // qu'après l'installation de ChargerDllIntegree (voir Main).
        [System.Runtime.CompilerServices.MethodImpl(System.Runtime.CompilerServices.MethodImplOptions.NoInlining)]
        static void Ouvrir()
        {
            Application.Run(new FenetreStudio());
        }

        // Les DLL .NET de WebView2 sont des ressources de cet exécutable.
        static Assembly ChargerDllIntegree(object sender, ResolveEventArgs args)
        {
            string nom = new AssemblyName(args.Name).Name + ".dll";
            using (Stream flux = Assembly.GetExecutingAssembly().GetManifestResourceStream(nom))
            {
                if (flux == null) return null;
                var octets = new byte[flux.Length];
                flux.Read(octets, 0, octets.Length);
                return Assembly.Load(octets);
            }
        }

        // WebView2Loader.dll est une DLL native : même emplacement que pour les programmes exportés.
        static void PreparerChargeurNatif()
        {
            string dossier = Path.Combine(DossierDonnees, "lanceur-1.0.2903.40");
            string chemin = Path.Combine(dossier, "WebView2Loader.dll");
            if (!File.Exists(chemin))
            {
                Directory.CreateDirectory(dossier);
                using (Stream flux = Assembly.GetExecutingAssembly().GetManifestResourceStream("WebView2Loader.dll"))
                using (FileStream sortie = File.Create(chemin + ".tmp"))
                {
                    flux.CopyTo(sortie);
                }
                if (!File.Exists(chemin)) File.Move(chemin + ".tmp", chemin);
                else File.Delete(chemin + ".tmp");
            }
            LoadLibrary(chemin);
        }
    }

    class FenetreStudio : Form
    {
        // Nom d'hôte fictif sous lequel le dossier de BlocStudio est servi à la page.
        const string Hote = "blocstudio.example";

        readonly Microsoft.Web.WebView2.WinForms.WebView2 vue;
        readonly JavaScriptSerializer json = new JavaScriptSerializer { MaxJsonLength = int.MaxValue };
        readonly HashSet<string> fichiersEnregistres = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        string dernierDossier = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);

        public FenetreStudio()
        {
            Text = "BlocStudio";
            BackColor = Color.FromArgb(30, 27, 75);
            try { Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch { }

            float echelle;
            using (Graphics g = CreateGraphics()) echelle = g.DpiX / 96f;
            Rectangle zone = Screen.PrimaryScreen.WorkingArea;
            int largeur = Math.Min((int)(1440 * echelle), (int)(zone.Width * 0.94));
            int hauteur = Math.Min((int)(900 * echelle), (int)(zone.Height * 0.94));
            StartPosition = FormStartPosition.Manual;
            Bounds = new Rectangle(zone.Left + (zone.Width - largeur) / 2, zone.Top + (zone.Height - hauteur) / 2, largeur, hauteur);
            MinimumSize = new Size((int)(900 * echelle), (int)(560 * echelle));

            vue = new Microsoft.Web.WebView2.WinForms.WebView2 { Dock = DockStyle.Fill };
            Controls.Add(vue);
            Load += async (s, e) => await Demarrer();
            Activated += (s, e) => RendreClavier();
        }

        // Après une boîte de dialogue Windows (ou un passage par une autre application), WinForms
        // redonne le focus au contrôle WebView2 mais pas à la page : on pouvait alors cliquer dans
        // un champ sans pouvoir y écrire. On le lui redonne explicitement.
        void RendreClavier()
        {
            if (vue.CoreWebView2 == null || IsDisposed) return;
            BeginInvoke(new Action(() =>
            {
                if (IsDisposed || !ContainsFocus) return;
                ActiveControl = null;
                vue.Focus();
            }));
        }

        async System.Threading.Tasks.Task Demarrer()
        {
            try
            {
                // Les programmes testés peuvent jouer un son dès leur démarrage, comme une fois exportés.
                var env = await CoreWebView2Environment.CreateAsync(null, Path.Combine(Studio.DossierDonnees, "Studio"),
                    new CoreWebView2EnvironmentOptions("--autoplay-policy=no-user-gesture-required"));
                await vue.EnsureCoreWebView2Async(env);
            }
            catch (Exception e)
            {
                MoteurAbsent(e);
                return;
            }

            CoreWebView2 web = vue.CoreWebView2;
            web.Settings.AreDevToolsEnabled = false;
            web.Settings.IsStatusBarEnabled = false;
            web.Settings.IsZoomControlEnabled = false;
            web.Settings.AreBrowserAcceleratorKeysEnabled = false;
            web.Settings.AreDefaultScriptDialogsEnabled = false;

            web.SetVirtualHostNameToFolderMapping(Hote, Studio.DossierSite, CoreWebView2HostResourceAccessKind.Allow);
            web.WebMessageReceived += Recevoir;
            web.ScriptDialogOpening += BoiteDeDialogue;
            // Le micro sert à enregistrer des sons, la caméra au contrôle Caméra des programmes testés ;
            // la page est celle de BlocStudio, livrée avec l'application.
            web.PermissionRequested += (s, e) =>
            {
                if (e.PermissionKind == CoreWebView2PermissionKind.Microphone || e.PermissionKind == CoreWebView2PermissionKind.Camera
                    || e.PermissionKind == CoreWebView2PermissionKind.ClipboardRead)
                    e.State = CoreWebView2PermissionState.Allow;
            };
            web.DocumentTitleChanged += (s, e) =>
            {
                if (!string.IsNullOrEmpty(web.DocumentTitle)) Text = web.DocumentTitle;
            };
            web.NewWindowRequested += (s, e) =>
            {
                e.Handled = true;
                try { Process.Start(e.Uri); } catch { }
            };

            web.Navigate("https://" + Hote + "/index.html");
        }

        // prompt() : petite boîte de saisie (utilisée par exemple pour nommer une variable).
        // Renvoie null si l'utilisateur annule.
        string Demander(string message, string texteParDefaut)
        {
            using (Form boite = new Form())
            {
                boite.Text = "BlocStudio";
                boite.FormBorderStyle = FormBorderStyle.FixedDialog;
                boite.StartPosition = FormStartPosition.CenterParent;
                boite.MinimizeBox = false;
                boite.MaximizeBox = false;
                boite.ShowInTaskbar = false;
                boite.AutoScaleMode = AutoScaleMode.Dpi;
                boite.AutoScaleDimensions = new SizeF(96F, 96F);
                boite.Font = new Font("Segoe UI", 9.75F);
                boite.ClientSize = new Size(380, 130);

                Label libelle = new Label { Text = message, Location = new Point(14, 12), Size = new Size(352, 38) };
                TextBox saisie = new TextBox { Text = texteParDefaut ?? "", Location = new Point(14, 54), Width = 352 };
                Button ok = new Button { Text = "OK", DialogResult = DialogResult.OK, Location = new Point(196, 92), Size = new Size(82, 28) };
                Button annuler = new Button { Text = "Annuler", DialogResult = DialogResult.Cancel, Location = new Point(284, 92), Size = new Size(82, 28) };
                boite.Controls.AddRange(new Control[] { libelle, saisie, ok, annuler });
                boite.AcceptButton = ok;
                boite.CancelButton = annuler;
                boite.Shown += (s, a) => { saisie.Focus(); saisie.SelectAll(); };

                return boite.ShowDialog(this) == DialogResult.OK ? saisie.Text : null;
            }
        }

        // alert() et confirm() de la page : de vraies boîtes Windows titrées « BlocStudio ».
        void BoiteDeDialogue(object sender, CoreWebView2ScriptDialogOpeningEventArgs e)
        {
            CoreWebView2Deferral report = e.GetDeferral();
            BeginInvoke(new Action(() =>
            {
                try
                {
                    if (e.Kind == CoreWebView2ScriptDialogKind.Alert)
                    {
                        MessageBox.Show(this, e.Message, "BlocStudio", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    }
                    else if (e.Kind == CoreWebView2ScriptDialogKind.Confirm)
                    {
                        if (MessageBox.Show(this, e.Message, "BlocStudio", MessageBoxButtons.OKCancel,
                            MessageBoxIcon.Question) == DialogResult.OK) e.Accept();
                    }
                    else if (e.Kind == CoreWebView2ScriptDialogKind.Prompt)
                    {
                        string reponse = Demander(e.Message, e.DefaultText);
                        if (reponse != null) { e.ResultText = reponse; e.Accept(); }
                    }
                    else
                    {
                        e.Accept();
                    }
                }
                finally
                {
                    report.Complete();
                    RendreClavier();
                }
            }));
        }

        void Recevoir(object sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            // Un programme testé envoie du texte (« notification:… ») ; l'éditeur, des objets.
            string texte = null;
            try { texte = e.TryGetWebMessageAsString(); } catch { }
            if (texte != null)
            {
                if (texte.StartsWith("notification:")) BeginInvoke(new Action(() => Notifier(texte.Substring(13))));
                return;
            }
            Dictionary<string, object> message;
            try { message = json.Deserialize<Dictionary<string, object>>(e.WebMessageAsJson); }
            catch { return; }
            // La boîte « Enregistrer sous » est modale : on l'ouvre en dehors de l'événement WebView2.
            BeginInvoke(new Action(() => { Traiter(message); RendreClavier(); }));
        }

        // Le bloc « notification » : « ICONE\nTITRE\nMESSAGE ». Un clic dessus ramène BlocStudio devant.
        NotifyIcon bulle;
        void Notifier(string message)
        {
            string[] p = message.Split(new[] { '\n' }, 3);
            if (p.Length < 3) return;
            if (bulle == null)
            {
                bulle = new NotifyIcon { Icon = Icon ?? SystemIcons.Application, Text = "BlocStudio" };
                bulle.BalloonTipClicked += (s, e) => { Ramener(); bulle.Visible = false; };
                bulle.BalloonTipClosed += (s, e) => bulle.Visible = false;
                bulle.Click += (s, e) => Ramener();
                FormClosed += (s, e) => bulle.Dispose();
            }
            bulle.Visible = true;
            ToolTipIcon icone = p[0] == "info" ? ToolTipIcon.Info : p[0] == "avertissement" ? ToolTipIcon.Warning
                              : p[0] == "erreur" ? ToolTipIcon.Error : ToolTipIcon.None;
            bulle.ShowBalloonTip(6000, p[1].Length > 0 ? p[1] : "BlocStudio", p[2].Length > 0 ? p[2] : " ", icone);
        }

        void Ramener()
        {
            if (WindowState == FormWindowState.Minimized) WindowState = FormWindowState.Normal;
            Activate();
        }

        void Traiter(Dictionary<string, object> message)
        {
            string action = Texte(message, "action");
            string chemin = Texte(message, "chemin");
            if (action == "enregistrer")
            {
                Enregistrer(message);
            }
            else if (action == "lancer" && fichiersEnregistres.Contains(chemin) && File.Exists(chemin))
            {
                try
                {
                    Process.Start(new ProcessStartInfo(chemin)
                    {
                        UseShellExecute = true,
                        WorkingDirectory = Path.GetDirectoryName(chemin)
                    });
                }
                catch (Exception ex)
                {
                    MessageBox.Show(this, "Impossible de lancer le programme : " + ex.Message, "BlocStudio",
                        MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            else if (action == "dossier" && fichiersEnregistres.Contains(chemin))
            {
                try { Process.Start("explorer.exe", "/select,\"" + chemin + "\""); } catch { }
            }
        }

        void Enregistrer(Dictionary<string, object> message)
        {
            var reponse = new Dictionary<string, object> { { "id", message.ContainsKey("id") ? message["id"] : null } };
            string nom = Path.GetFileName(Texte(message, "nom") ?? "programme");
            string extension = Path.GetExtension(nom).ToLowerInvariant();

            using (var boite = new SaveFileDialog())
            {
                boite.Title = extension == ".exe" ? "Enregistrer l'application Windows"
                            : extension == ".html" ? "Enregistrer la page web"
                            : "Enregistrer le projet";
                boite.FileName = nom;
                boite.Filter = (extension == ".exe" ? "Application Windows (*.exe)|*.exe"
                              : extension == ".html" ? "Page web (*.html)|*.html"
                              : extension == ".bstudio" ? "Projet BlocStudio (*.bstudio)|*.bstudio"
                              : "Fichier|*" + extension) + "|Tous les fichiers (*.*)|*.*";
                boite.DefaultExt = extension.TrimStart('.');
                boite.AddExtension = true;
                boite.OverwritePrompt = true;
                if (Directory.Exists(dernierDossier)) boite.InitialDirectory = dernierDossier;

                if (boite.ShowDialog(this) == DialogResult.OK)
                {
                    try
                    {
                        File.WriteAllBytes(boite.FileName, Convert.FromBase64String(Texte(message, "donnees") ?? ""));
                        dernierDossier = Path.GetDirectoryName(boite.FileName);
                        fichiersEnregistres.Add(boite.FileName);
                        reponse["chemin"] = boite.FileName;
                    }
                    catch (Exception ex)
                    {
                        reponse["erreur"] = ex.Message;
                    }
                }
                else
                {
                    reponse["chemin"] = null;
                }
            }
            vue.CoreWebView2.PostWebMessageAsJson(json.Serialize(reponse));
        }

        static string Texte(Dictionary<string, object> message, string cle)
        {
            object valeur;
            return message.TryGetValue(cle, out valeur) ? valeur as string : null;
        }

        void MoteurAbsent(Exception e)
        {
            var reponse = MessageBox.Show(
                "BlocStudio a besoin de « Microsoft Edge WebView2 », qui ne semble pas installé sur cet ordinateur.\n\n" +
                "Oui : ouvrir la page de téléchargement de WebView2 (gratuit, Microsoft).\n" +
                "Non : ouvrir BlocStudio dans le navigateur.\n\n(" + e.Message + ")",
                "BlocStudio", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Warning);
            try
            {
                if (reponse == DialogResult.Yes) Process.Start("https://go.microsoft.com/fwlink/p/?LinkId=2124703");
                else if (reponse == DialogResult.No) Process.Start(Path.Combine(Studio.DossierSite, "index.html"));
            }
            catch { }
            Close();
        }
    }
}
