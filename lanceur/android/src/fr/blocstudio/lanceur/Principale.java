package fr.blocstudio.lanceur;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.util.Base64;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

// Le lanceur des applications Android exportées par BlocStudio : une seule fenêtre, qui affiche la page
// du programme (assets/programme.html) dans le moteur web d'Android. Les réglages de la fenêtre
// (sens de l'écran, couleur de fond) sont dans assets/reglages.json. Voir LISEZMOI.md.
public class Principale extends Activity {
    // La page est servie sous une adresse https fictive plutôt qu'en file:// : certains sites
    // (vidéos YouTube intégrées…) refusent de s'afficher dans une page locale.
    static final String HOTE = "programme.blocstudio.example";

    static final int DEMANDE_MEDIAS = 1;
    static final int CHOIX_FICHIER = 2;
    static final int ENREGISTRER_FICHIER = 3;

    WebView vue;
    PermissionRequest demandeEnAttente; // la page attend la réponse de l'utilisateur (micro, caméra)
    ValueCallback<Uri[]> fichierAttendu;  // la page attend le fichier choisi dans la boîte « Ouvrir »
    byte[] contenuAEnregistrer;           // le fichier que la page enregistre, en attendant la boîte « Enregistrer »
    int numeroEnregistrement;
    boolean pleinEcran = true; // les barres du téléphone sont cachées dès le démarrage

    @Override
    protected void onCreate(Bundle etat) {
        super.onCreate(etat);
        JSONObject reglages = lireReglages();

        String sens = reglages.optString("orientation", "libre");
        if (sens.equals("paysage")) setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
        else if (sens.equals("portrait")) setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);

        int fond = Color.WHITE;
        try { fond = Color.parseColor(reglages.optString("fond", "#ffffff")); } catch (IllegalArgumentException e) { }
        getWindow().setStatusBarColor(fond);
        getWindow().setNavigationBarColor(fond);
        // L'encoche de la caméra : la page passe dessous, et ce qui en dépasse a la couleur de fond.
        getWindow().setBackgroundDrawable(new ColorDrawable(fond));
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams attributs = getWindow().getAttributes();
            attributs.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(attributs);
        }

        vue = new WebView(this);
        vue.setBackgroundColor(fond);
        WebSettings s = vue.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);           // « mémoire du programme » (localStorage)
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setTextZoom(100);                     // la fenêtre garde sa mise en page, quelle que soit la taille des polices du téléphone
        vue.addJavascriptInterface(new Pont(), "BlocStudioAndroid");
        vue.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest demande) { demanderMedias(demande); }

            // Boîte « Ouvrir » (contrôle Ouvrir un fichier, blocs « ouvrir un fichier », importer…).
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> rappel, FileChooserParams parametres) {
                if (fichierAttendu != null) fichierAttendu.onReceiveValue(null);
                fichierAttendu = rappel;
                try {
                    startActivityForResult(parametres.createIntent(), CHOIX_FICHIER);
                } catch (Exception e) {
                    fichierAttendu = null;
                    return false;
                }
                return true;
            }
        });
        vue.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest demande) {
                Uri adresse = demande.getUrl();
                if (!HOTE.equals(adresse.getHost())) return null;
                String chemin = adresse.getPath();
                if (chemin == null || chemin.equals("/") || chemin.equals("/index.html")) {
                    try {
                        return new WebResourceResponse("text/html", "utf-8", getAssets().open("programme.html"));
                    } catch (Exception e) { }
                }
                return new WebResourceResponse("text/plain", "utf-8", 404, "Introuvable", null, null);
            }

            // Un lien vers un autre site s'ouvre dans le navigateur du téléphone.
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest demande) {
                Uri adresse = demande.getUrl();
                if (HOTE.equals(adresse.getHost()) || !demande.isForMainFrame()) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, adresse)); } catch (Exception e) { }
                return true;
            }
        });
        setContentView(vue);
        appliquerPleinEcran(true);
        vue.loadUrl("https://" + HOTE + "/index.html");
    }

    // Micro et caméra (blocs « micro », contrôle Caméra) : Android demande d'abord l'autorisation à
    // l'utilisateur, une fois pour toutes ; la page ne reçoit que ce qu'il a accepté.
    void demanderMedias(PermissionRequest demande) {
        List<String> manquantes = new ArrayList<String>();
        for (String ressource : demande.getResources()) {
            String autorisation = autorisationPour(ressource);
            if (autorisation != null && checkSelfPermission(autorisation) != PackageManager.PERMISSION_GRANTED)
                manquantes.add(autorisation);
        }
        if (manquantes.isEmpty()) { repondre(demande); return; }
        if (demandeEnAttente != null) demandeEnAttente.deny();
        demandeEnAttente = demande;
        requestPermissions(manquantes.toArray(new String[0]), DEMANDE_MEDIAS);
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] autorisations, int[] reponses) {
        if (code != DEMANDE_MEDIAS || demandeEnAttente == null) return;
        PermissionRequest demande = demandeEnAttente;
        demandeEnAttente = null;
        repondre(demande);
    }

    // Accorde à la page les ressources autorisées (aucune : refus, la page affiche son message d'erreur).
    void repondre(PermissionRequest demande) {
        List<String> accordees = new ArrayList<String>();
        for (String ressource : demande.getResources()) {
            String autorisation = autorisationPour(ressource);
            if (autorisation != null && checkSelfPermission(autorisation) == PackageManager.PERMISSION_GRANTED)
                accordees.add(ressource);
        }
        if (accordees.isEmpty()) demande.deny();
        else demande.grant(accordees.toArray(new String[0]));
    }

    static String autorisationPour(String ressource) {
        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(ressource)) return android.Manifest.permission.RECORD_AUDIO;
        if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(ressource)) return android.Manifest.permission.CAMERA;
        return null;
    }

    JSONObject lireReglages() {
        try (InputStream entree = getAssets().open("reglages.json")) {
            ByteArrayOutputStream octets = new ByteArrayOutputStream();
            byte[] tampon = new byte[4096];
            for (int n; (n = entree.read(tampon)) > 0; ) octets.write(tampon, 0, n);
            return new JSONObject(octets.toString("UTF-8"));
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    @Override
    protected void onActivityResult(int code, int resultat, Intent donnees) {
        if (code == CHOIX_FICHIER && fichierAttendu != null) {
            fichierAttendu.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultat, donnees));
            fichierAttendu = null;
        } else if (code == ENREGISTRER_FICHIER) {
            String nom = "";
            Uri adresse = donnees == null ? null : donnees.getData();
            if (resultat == RESULT_OK && adresse != null && contenuAEnregistrer != null) {
                try (OutputStream sortie = getContentResolver().openOutputStream(adresse)) {
                    sortie.write(contenuAEnregistrer);
                    nom = nomDuFichier(adresse);
                } catch (Exception e) {
                    nom = "";
                }
            }
            contenuAEnregistrer = null;
            vue.evaluateJavascript("window.BlocStudioEnregistre && window.BlocStudioEnregistre("
                + numeroEnregistrement + ", " + JSONObject.quote(nom) + ")", null);
        }
    }

    // Le nom que l'utilisateur a donné au fichier dans la boîte « Enregistrer ».
    String nomDuFichier(Uri adresse) {
        try (Cursor c = getContentResolver().query(adresse, new String[] { OpenableColumns.DISPLAY_NAME }, null, null, null)) {
            if (c != null && c.moveToFirst() && c.getString(0) != null) return c.getString(0);
        } catch (Exception e) { }
        return "fichier";
    }

    // Appelé par la page : le bloc « plein écran » cache ou remontre les barres du téléphone, et
    // « enregistrer » ouvre la boîte « Enregistrer » du téléphone (le moteur web ne sait pas télécharger).
    class Pont {
        @JavascriptInterface
        public void enregistrer(final int numero, final String nom, final String type, final String base64) {
            runOnUiThread(new Runnable() {
                public void run() {
                    if (contenuAEnregistrer != null) // une boîte est déjà ouverte : la précédente demande est annulée
                        vue.evaluateJavascript("window.BlocStudioEnregistre(" + numeroEnregistrement + ", '')", null);
                    contenuAEnregistrer = Base64.decode(base64, Base64.DEFAULT);
                    numeroEnregistrement = numero;
                    Intent choix = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                    choix.addCategory(Intent.CATEGORY_OPENABLE);
                    choix.setType(type == null || type.isEmpty() ? "application/octet-stream" : type);
                    choix.putExtra(Intent.EXTRA_TITLE, nom);
                    try {
                        startActivityForResult(choix, ENREGISTRER_FICHIER);
                    } catch (Exception e) {
                        contenuAEnregistrer = null;
                        vue.evaluateJavascript("window.BlocStudioEnregistre(" + numero + ", '')", null);
                    }
                }
            });
        }

        @JavascriptInterface
        public void pleinEcran(final boolean oui) {
            runOnUiThread(new Runnable() {
                public void run() { appliquerPleinEcran(oui); }
            });
        }
    }

    @SuppressWarnings("deprecation")
    void appliquerPleinEcran(boolean oui) {
        pleinEcran = oui;
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c == null) return;
            if (oui) {
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                c.hide(WindowInsets.Type.systemBars());
            } else {
                c.show(WindowInsets.Type.systemBars());
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(oui
                ? View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                  | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                : 0);
        }
    }

    // Revenu dans l'application : le plein écran est remis (Android remontre les barres entre-temps).
    @Override
    public void onWindowFocusChanged(boolean actif) {
        super.onWindowFocusChanged(actif);
        if (actif && pleinEcran) appliquerPleinEcran(true);
    }

    // Le programme s'arrête de tourner (sons, minuteurs) quand on quitte l'application, et reprend au retour.
    @Override
    protected void onPause() {
        super.onPause();
        vue.onPause();
        vue.pauseTimers();
    }

    @Override
    protected void onResume() {
        super.onResume();
        vue.onResume();
        vue.resumeTimers();
    }

    @Override
    protected void onDestroy() {
        vue.destroy();
        super.onDestroy();
    }
}
