# Lanceur des applications Android (.apk)

Quand on choisit **Exporter → Application Android (.apk)**, BlocStudio prend le
lanceur Android (un .apk de 7 Ko, sans programme ni signature, stocké en base64
dans `js/lanceur-android-data.js`) et, sans aucun outil installé
(`js/export-android.js`) :

1. ajoute `assets/programme.html` (la page du programme, en mode « pour
   téléphone » : la fenêtre remplit l'écran) et `assets/reglages.json` (sens de
   l'écran : `paysage`, `portrait` ou `libre`, et couleur de fond) ;
2. remplace l'icône `res/mipmap-xxxhdpi-v4/ic_launcher.png` (192×192 : le
   premier émoji du titre, ou sa première lettre, sur le fond de la fenêtre) ;
3. change, dans le manifeste (XML binaire d'Android), le nom du paquet
   `fr.blocstudio.lanceur` → `fr.blocstudio.programme.p<identifiant du projet>`
   et le nom de l'application `BlocStudio Lanceur` → le titre de la fenêtre ;
4. réécrit le zip, aligné comme `zipalign`, et le signe avec la signature
   **v2** d'Android (Android 7 et plus récent).

La clé de signature (RSA 2048, certificat `CN=BlocStudio` valable 100 ans) est
créée au premier export et gardée dans le stockage du navigateur
(`localStorage`, clé `blocstudio.cleAndroid`). Une application exportée de
nouveau avec la même clé s'installe par-dessus l'ancienne version sans perdre
ses données. La clé est propre à chaque navigateur (BlocStudio.exe, Chrome,
le site en ligne…) : avec une autre clé, il faut d'abord désinstaller
l'application du téléphone.

Sur le téléphone, `Principale.java` affiche la page dans le moteur web
d'Android, sous l'adresse fictive `https://programme.blocstudio.example/`
(comme le lanceur Windows : certains sites refusent les pages locales). Les
liens vers d'autres sites s'ouvrent dans le navigateur du téléphone. Le bloc
« plein écran » cache les barres du téléphone (objet `BlocStudioAndroid`).

## Reconstruire

Uniquement si `Principale.java`, `AndroidManifest.xml` ou l'icône par défaut
est modifié :

```
powershell -ExecutionPolicy Bypass -File lanceur\android\construire.ps1
```

Il faut un JDK 17 (`JAVA_HOME`) et le SDK Android (`ANDROID_HOME`) avec
`build-tools;34.0.0` et `platforms;android-34`. Pas de Gradle : le script
appelle directement `aapt2`, `javac` et `d8`, puis régénère
`js/lanceur-android-data.js`. Le manifeste doit garder le nom complet de
l'activité (`fr.blocstudio.lanceur.Principale`) : un nom court suivrait le
nouveau nom de paquet.

Pour vérifier un .apk exporté : `apksigner verify --verbose fichier.apk` et
`aapt2 dump badging fichier.apk` (dans `build-tools\34.0.0`).

## Fichiers

| Fichier | Rôle |
|---|---|
| `AndroidManifest.xml` | Manifeste du lanceur |
| `src\fr\blocstudio\lanceur\Principale.java` | Code source du lanceur |
| `res\mipmap-xxxhdpi\ic_launcher.png` | Icône par défaut (dessinée par `construire.ps1` si elle manque) |
| `construire.ps1` | Construit le lanceur et met à jour `js/lanceur-android-data.js` |
