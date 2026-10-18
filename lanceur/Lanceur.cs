// Lanceur des programmes BlocStudio exportés en .exe.
//
// BlocStudio colle le programme (une page HTML) à la fin de ce fichier .exe :
//   [lanceur.exe][programme en UTF-8][longueur du programme : 8 octets][« BLOCSTD1 »]
// Au démarrage, le lanceur relit la fin de son propre fichier, puis affiche
// le programme dans une vraie fenêtre Windows grâce à WebView2 (le moteur d'Edge).
//
// Les DLL de WebView2 sont incluses comme ressources : l'exécutable se suffit à lui-même.

using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Windows.Forms;

[assembly: AssemblyTitle("Programme BlocStudio")]
[assembly: AssemblyProduct("BlocStudio")]
[assembly: AssemblyVersion("1.0.0.0")]

namespace BlocStudio
{
    class Programme
    {
        public string Titre;
        public int Largeur;
        public int Hauteur;
        // Fenêtre redimensionnable, bouton Agrandir, agrandie au démarrage, taille minimale (0 = aucune).
        public bool Redimensionnable, Agrandir, Agrandie;
        public int LargeurMin, HauteurMin;
        public string Html;
        public string Empreinte;
    }

    static class Lanceur
    {
        const string Signature = "BLOCSTD1";

        [DllImport("user32.dll")]
        static extern bool SetProcessDPIAware();

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        static extern IntPtr LoadLibrary(string chemin);

        public static readonly string DossierDonnees = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "BlocStudio");

        [STAThread]
        static int Main()
        {
            AppDomain.CurrentDomain.AssemblyResolve += ChargerDllIntegree;
            SetProcessDPIAware();
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            Programme programme;
            try
            {
                programme = LireProgramme();
            }
            catch (Exception e)
            {
                MessageBox.Show("Impossible de lire le programme : " + e.Message, "BlocStudio",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
                return 1;
            }
            if (programme == null)
            {
                MessageBox.Show("Ce lanceur ne contient aucun programme.\n\n" +
                    "Créez votre programme dans BlocStudio, puis utilisez « Exporter » → « Application Windows ».",
                    "BlocStudio", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return 1;
            }

            PreparerChargeurNatif();
            Ouvrir(programme);
            return 0;
        }

        // Méthode séparée : les types WebView2 ne doivent être chargés
        // qu'après l'installation de ChargerDllIntegree (voir Main).
        [System.Runtime.CompilerServices.MethodImpl(System.Runtime.CompilerServices.MethodImplOptions.NoInlining)]
        static void Ouvrir(Programme programme)
        {
            Application.Run(new FenetreProgramme(programme));
        }

        // Relit le programme collé à la fin de l'exécutable.
        static Programme LireProgramme()
        {
            byte[] octets = File.ReadAllBytes(Application.ExecutablePath);
            int fin = octets.Length;
            if (fin < 16 || Encoding.ASCII.GetString(octets, fin - 8, 8) != Signature) return null;

            long longueur = BitConverter.ToInt64(octets, fin - 16);
            if (longueur <= 0 || longueur > fin - 16) return null;
            int debut = (int)(fin - 16 - longueur);
            string contenu = Encoding.UTF8.GetString(octets, debut, (int)longueur);

            // En-tête : largeur, hauteur, titre et réglages de la fenêtre sur quatre lignes, puis la page HTML.
            string[] parties = contenu.Split(new[] { '\n' }, 5);
            if (parties.Length < 5) return null;

            string empreinte;
            using (var md5 = MD5.Create())
            {
                empreinte = BitConverter.ToString(md5.ComputeHash(octets, debut, (int)longueur))
                    .Replace("-", "").Substring(0, 16).ToLowerInvariant();
            }

            var programme = new Programme
            {
                Largeur = int.Parse(parties[0]),
                Hauteur = int.Parse(parties[1]),
                Titre = parties[2],
                Html = parties[4],
                Empreinte = empreinte
            };
            // Réglages « redim=1;agrandir=0;agrandie=0;min=300x200 ».
            foreach (string reglage in parties[3].Split(';'))
            {
                string[] r = reglage.Split('=');
                if (r.Length != 2) continue;
                if (r[0] == "redim") programme.Redimensionnable = r[1] == "1";
                if (r[0] == "agrandir") programme.Agrandir = r[1] == "1";
                if (r[0] == "agrandie") programme.Agrandie = r[1] == "1";
                if (r[0] == "min")
                {
                    string[] t = r[1].Split('x');
                    int l, h;
                    if (t.Length == 2 && int.TryParse(t[0], out l) && int.TryParse(t[1], out h))
                    {
                        programme.LargeurMin = l;
                        programme.HauteurMin = h;
                    }
                }
            }
            return programme;
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

        // WebView2Loader.dll est une DLL native : elle doit exister sur le disque.
        // On l'extrait une seule fois, puis on la charge avant la première utilisation.
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

    class FenetreProgramme : Form
    {
        readonly Programme programme;
        readonly Microsoft.Web.WebView2.WinForms.WebView2 vue;
        readonly float echelle;

        public FenetreProgramme(Programme p)
        {
            programme = p;
            Text = p.Titre;
            FormBorderStyle = p.Redimensionnable ? FormBorderStyle.Sizable : FormBorderStyle.FixedSingle;
            MaximizeBox = p.Agrandir;
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = Color.FromArgb(240, 240, 240);
            try { Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch { }

            // Les tailles du programme sont en pixels « CSS » : on tient compte du zoom de Windows.
            using (Graphics g = CreateGraphics()) echelle = g.DpiX / 96f;
            ClientSize = TailleEcran(p.Largeur, p.Hauteur);
            if (p.Redimensionnable && p.LargeurMin > 0) MinimumSize = SizeFromClientSize(TailleEcran(p.LargeurMin, p.HauteurMin));
            if (p.Agrandie) WindowState = FormWindowState.Maximized;

            vue = new Microsoft.Web.WebView2.WinForms.WebView2 { Dock = DockStyle.Fill };
            Controls.Add(vue);
            Load += async (s, e) => await Demarrer();
        }

        Size TailleEcran(int largeur, int hauteur)
        {
            return new Size((int)Math.Ceiling(largeur * echelle), (int)Math.Ceiling(hauteur * echelle));
        }

        // Le bloc « changer la taille de la fenêtre » envoie « taille:LARGEURxHAUTEUR » (en pixels CSS).
        void MessageRecu(string message)
        {
            if (message != null && message.StartsWith("notification:")) { Notifier(message.Substring(13)); return; }
            if (message != null && message.StartsWith("imprimer:")) { Imprimer(message.Substring(9)); return; }
            if (message == null || !message.StartsWith("taille:")) return;
            string[] t = message.Substring(7).Split('x');
            int l, h;
            if (t.Length != 2 || !int.TryParse(t[0], out l) || !int.TryParse(t[1], out h)) return;
            if (WindowState != FormWindowState.Normal) WindowState = FormWindowState.Normal;
            Size taille = TailleEcran(Math.Max(l, 100), Math.Max(h, 60));
            Rectangle ecran = Screen.FromControl(this).WorkingArea;
            ClientSize = new Size(Math.Min(taille.Width, ecran.Width), Math.Min(taille.Height, ecran.Height));
        }

        // Le bloc « notification » envoie « notification:ICONE\nTITRE\nMESSAGE » : une notification de Windows.
        // Un clic dessus ramène la fenêtre devant.
        NotifyIcon bulle;
        void Notifier(string message)
        {
            string[] p = message.Split(new[] { '\n' }, 3);
            if (p.Length < 3) return;
            if (bulle == null)
            {
                bulle = new NotifyIcon { Icon = Icon ?? SystemIcons.Application };
                bulle.BalloonTipClicked += (s, e) => { Ramener(); bulle.Visible = false; };
                bulle.BalloonTipClosed += (s, e) => bulle.Visible = false;
                bulle.Click += (s, e) => Ramener();
                FormClosed += (s, e) => bulle.Dispose();
            }
            bulle.Text = Text.Length > 63 ? Text.Substring(0, 63) : Text;
            bulle.Visible = true;
            ToolTipIcon icone = p[0] == "info" ? ToolTipIcon.Info : p[0] == "avertissement" ? ToolTipIcon.Warning
                              : p[0] == "erreur" ? ToolTipIcon.Error : ToolTipIcon.None;
            bulle.ShowBalloonTip(6000, p[1].Length > 0 ? p[1] : Text, p[2].Length > 0 ? p[2] : " ", icone);
        }

        // Les blocs « imprimer » envoient « imprimer:PAGE » : l'aperçu s'ouvre dans une fenêtre à part, assez grande
        // même si celle du programme est petite. Quand elle est fermée, on répond « imprime » au programme.
        async void Imprimer(string page)
        {
            string fichier = Path.Combine(Lanceur.DossierDonnees, "impression.html");
            try
            {
                File.WriteAllText(fichier, page, new UTF8Encoding(false));
                using (var fenetre = new Form())
                {
                    fenetre.Text = "Impression – " + Text;
                    fenetre.Icon = Icon;
                    fenetre.ShowInTaskbar = false;
                    fenetre.StartPosition = FormStartPosition.CenterScreen;
                    Rectangle ecran = Screen.FromControl(this).WorkingArea;
                    Size taille = TailleEcran(900, 700);
                    fenetre.ClientSize = new Size(Math.Min(taille.Width, ecran.Width - 40), Math.Min(taille.Height, ecran.Height - 40));
                    var apercu = new Microsoft.Web.WebView2.WinForms.WebView2 { Dock = DockStyle.Fill };
                    fenetre.Controls.Add(apercu);
                    fenetre.Show(this);
                    await apercu.EnsureCoreWebView2Async(vue.CoreWebView2.Environment);
                    apercu.CoreWebView2.Settings.AreDevToolsEnabled = false;
                    apercu.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
                    var chargee = new System.Threading.Tasks.TaskCompletionSource<bool>();
                    apercu.CoreWebView2.NavigationCompleted += (s, e) => chargee.TrySetResult(true);
                    apercu.CoreWebView2.Navigate(new Uri(fichier).AbsoluteUri);
                    await chargee.Task;
                    await apercu.CoreWebView2.ExecuteScriptAsync("window.print()"); // se termine quand l'aperçu est fermé
                }
            }
            catch { }
            finally
            {
                try { File.Delete(fichier); } catch { }
                try { vue.CoreWebView2.PostWebMessageAsString("imprime"); } catch { }
                Activate();
            }
        }

        void Ramener()
        {
            if (WindowState == FormWindowState.Minimized) WindowState = FormWindowState.Normal;
            Activate();
        }

        async System.Threading.Tasks.Task Demarrer()
        {
            string page = EcrirePage();
            try
            {
                // Une application de bureau peut jouer un son dès son démarrage (musique de fond…).
                var options = new Microsoft.Web.WebView2.Core.CoreWebView2EnvironmentOptions(
                    "--autoplay-policy=no-user-gesture-required");
                var env = await Microsoft.Web.WebView2.Core.CoreWebView2Environment.CreateAsync(
                    null, Path.Combine(Lanceur.DossierDonnees, "WebView2"), options);
                await vue.EnsureCoreWebView2Async(env);
            }
            catch (Exception e)
            {
                MoteurAbsent(page, e);
                return;
            }

            var reglages = vue.CoreWebView2.Settings;
            reglages.AreDevToolsEnabled = false;
            reglages.AreDefaultContextMenusEnabled = false;
            reglages.IsStatusBarEnabled = false;
            reglages.IsZoomControlEnabled = false;
            reglages.AreBrowserAcceleratorKeysEnabled = false;

            // Le bloc « texte du presse-papiers » : le programme est celui de l'utilisateur, on le laisse lire.
            vue.CoreWebView2.PermissionRequested += (s, e) =>
            {
                if (e.PermissionKind == Microsoft.Web.WebView2.Core.CoreWebView2PermissionKind.ClipboardRead)
                    e.State = Microsoft.Web.WebView2.Core.CoreWebView2PermissionState.Allow;
            };
            vue.CoreWebView2.WebMessageReceived += (s, e) =>
            {
                try { MessageRecu(e.TryGetWebMessageAsString()); } catch { }
            };
            vue.CoreWebView2.DocumentTitleChanged += (s, e) =>
            {
                if (!string.IsNullOrEmpty(vue.CoreWebView2.DocumentTitle)) Text = vue.CoreWebView2.DocumentTitle;
            };
            // Un lien qui voudrait ouvrir une nouvelle fenêtre s'ouvre dans le navigateur habituel.
            vue.CoreWebView2.NewWindowRequested += (s, e) =>
            {
                e.Handled = true;
                try { Process.Start(e.Uri); } catch { }
            };

            // La page est servie sous une adresse https fictive plutôt qu'en file:// :
            // certains sites (vidéos YouTube intégrées…) refusent de s'afficher dans une page locale.
            vue.CoreWebView2.SetVirtualHostNameToFolderMapping(Hote, Path.GetDirectoryName(page),
                Microsoft.Web.WebView2.Core.CoreWebView2HostResourceAccessKind.Allow);
            vue.CoreWebView2.Navigate("https://" + Hote + "/index.html");
        }

        const string Hote = "programme.blocstudio.example";

        // La page est écrite dans un dossier propre à ce programme (même contenu = même dossier).
        string EcrirePage()
        {
            string dossier = Path.Combine(Lanceur.DossierDonnees, "programmes", programme.Empreinte);
            Directory.CreateDirectory(dossier);
            string chemin = Path.Combine(dossier, "index.html");
            File.WriteAllText(chemin, programme.Html, new UTF8Encoding(false));
            return chemin;
        }

        void MoteurAbsent(string page, Exception e)
        {
            var reponse = MessageBox.Show(
                "Ce programme a besoin de « Microsoft Edge WebView2 », qui ne semble pas installé sur cet ordinateur.\n\n" +
                "Oui : ouvrir la page de téléchargement de WebView2 (gratuit, Microsoft).\n" +
                "Non : lancer quand même le programme dans le navigateur.\n\n(" + e.Message + ")",
                programme.Titre, MessageBoxButtons.YesNoCancel, MessageBoxIcon.Warning);
            try
            {
                if (reponse == DialogResult.Yes) Process.Start("https://go.microsoft.com/fwlink/p/?LinkId=2124703");
                else if (reponse == DialogResult.No) Process.Start(page);
            }
            catch { }
            Close();
        }
    }
}
