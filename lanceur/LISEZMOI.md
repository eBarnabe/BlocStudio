# Lanceur des applications Windows (.exe)

Quand on choisit **Exporter → Application Windows (.exe)**, BlocStudio prend
`BlocStudioLanceur.exe` (stocké en base64 dans `js/lanceur-data.js`) et colle
le programme à sa fin :

```
[BlocStudioLanceur.exe][largeur\nhauteur\ntitre\npage HTML — UTF-8][longueur : 8 octets][« BLOCSTD1 »]
```

Au démarrage, le lanceur relit la fin de son propre fichier et affiche la page
dans une fenêtre Windows grâce à **WebView2** (le moteur d'Edge, présent sur
Windows 10 et 11). Les DLL WebView2 sont intégrées à l'exécutable : il n'y a
rien d'autre à copier.

Ce que le lanceur écrit sur le disque, dans `%LOCALAPPDATA%\BlocStudio\` :
- `lanceur-<version>\WebView2Loader.dll` : extrait une seule fois ;
- `programmes\<empreinte>\index.html` : la page du programme, affichée sous
  l'adresse fictive `https://programme.blocstudio.example/` (pas en `file://` :
  les vidéos YouTube intégrées, par exemple, refusent les pages locales) ;
- `WebView2\` : le profil du moteur (cache…).

## BlocStudio.exe (l'éditeur en application Windows)

`BlocStudio.exe`, à la racine, affiche `index.html` dans une fenêtre WebView2
(le dossier est servi sous l'adresse fictive `https://blocstudio.example/`).
Les fichiers créés par « Enregistrer » et « Exporter » sont écrits par Windows
avec une boîte « Enregistrer sous » : contrairement aux téléchargements du
navigateur, ils ne portent pas la marque « venant d'Internet », qui bloque les
.exe (« Vos paramètres de sécurité Internet ont empêché l'ouverture… ») ou
déclenche SmartScreen. Le dialogue entre la page et la fenêtre est décrit en
tête de `Studio.cs`. Son profil (projet en cours…) est dans
`%LOCALAPPDATA%\BlocStudio\Studio\`.

`BlocStudio.exe` doit rester à côté de `index.html` (pour le bureau : un raccourci).

## Reconstruire

Uniquement si `Lanceur.cs` ou `Studio.cs` est modifié :

```
powershell -ExecutionPolicy Bypass -File lanceur\construire.ps1
```

Le compilateur C# utilisé fait partie de Windows (.NET Framework 4.x) : il n'y a
rien à installer. Le script régénère aussi `js/lanceur-data.js` et `BlocStudio.exe`.

## Fichiers

| Fichier | Rôle |
|---|---|
| `Lanceur.cs` | Code source du lanceur |
| `Studio.cs` | Code source de `BlocStudio.exe` (l'éditeur en application Windows) |
| `construire.ps1` | Compile le lanceur et `BlocStudio.exe`, met à jour `js/lanceur-data.js` |
| `creer-icone.ps1` | Dessine `icone.ico` (appelé par `construire.ps1` si l'icône manque) |
| `sdk\` | Kit WebView2 de Microsoft (paquet NuGet `Microsoft.Web.WebView2` 1.0.2903.40, DLL signées Microsoft, voir `LICENSE.txt`) |
