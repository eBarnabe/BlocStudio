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

            // En-tête : largeur, hauteur et titre sur trois lignes, puis la page HTML.
            string[] parties = contenu.Split(new[] { '\n' }, 4);
            if (parties.Length < 4) return null;

            string empreinte;
            using (var md5 = MD5.Create())
            {
                empreinte = BitConverter.ToString(md5.ComputeHash(octets, debut, (int)longueur))
                    .Replace("-", "").Substring(0, 16).ToLowerInvariant();
            }

            return new Programme
            {
                Largeur = int.Parse(parties[0]),
                Hauteur = int.Parse(parties[1]),
                Titre = parties[2],
                Html = parties[3],
                Empreinte = empreinte
            };
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

        public FenetreProgramme(Programme p)
        {
            programme = p;
            Text = p.Titre;
            FormBorderStyle = FormBorderStyle.FixedSingle;
            MaximizeBox = false;
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = Color.FromArgb(240, 240, 240);
            try { Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch { }

            // Les tailles du programme sont en pixels « CSS » : on tient compte du zoom de Windows.
            float echelle;
            using (Graphics g = CreateGraphics()) echelle = g.DpiX / 96f;
            ClientSize = new Size((int)Math.Ceiling(p.Largeur * echelle), (int)Math.Ceiling(p.Hauteur * echelle));

            vue = new Microsoft.Web.WebView2.WinForms.WebView2 { Dock = DockStyle.Fill };
            Controls.Add(vue);
            Load += async (s, e) => await Demarrer();
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

            vue.CoreWebView2.Navigate(new Uri(page).AbsoluteUri);
        }

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
