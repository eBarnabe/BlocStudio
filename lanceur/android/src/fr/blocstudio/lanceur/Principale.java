package fr.blocstudio.lanceur;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

// Le lanceur des applications Android exportées par BlocStudio : une seule fenêtre, qui affiche la page
// du programme (assets/programme.html) dans le moteur web d'Android. Les réglages de la fenêtre
// (sens de l'écran, couleur de fond) sont dans assets/reglages.json. Voir LISEZMOI.md.
public class Principale extends Activity {
    // La page est servie sous une adresse https fictive plutôt qu'en file:// : certains sites
    // (vidéos YouTube intégrées…) refusent de s'afficher dans une page locale.
    static final String HOTE = "programme.blocstudio.example";

    WebView vue;
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
        vue.addJavascriptInterface(new Pont(), "BlocStudioAndroid");
        vue.setWebChromeClient(new WebChromeClient());
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

    // Appelé par la page (bloc « plein écran ») : cache ou remontre les barres du téléphone.
    class Pont {
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
