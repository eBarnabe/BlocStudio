# Logiciels et services utilisés par BlocStudio

Le code de BlocStudio est sous [licence MIT](LICENSE). Les logiciels ci-dessous, livrés dans ce dépôt ou utilisés par lui, gardent leur propre licence. Merci à leurs auteurs.

## Livrés avec BlocStudio

### Blockly 11.2.1

La bibliothèque qui dessine les blocs, les fait s'emboîter et les traduit en JavaScript.

- Auteur : Google LLC
- Licence : Apache 2.0 (texte complet dans [`lib/blockly/LICENSE`](lib/blockly/LICENSE))
- Fichiers : `lib/blockly/` (version compilée, avec la traduction française `msg/fr.js`)
- Site : https://developers.google.com/blockly · code source : https://github.com/google/blockly

### Kit WebView2 de Microsoft 1.0.2903.40

Il permet à `BlocStudio.exe` et aux applications exportées en .exe d'afficher leur page avec le moteur d'Edge (paquet NuGet `Microsoft.Web.WebView2`).

- Auteur : Microsoft Corporation
- Licence : licence de type BSD (texte complet dans [`lanceur/sdk/LICENSE.txt`](lanceur/sdk/LICENSE.txt))
- Fichiers : `lanceur/sdk/` (`Microsoft.Web.WebView2.Core.dll`, `Microsoft.Web.WebView2.WinForms.dll`, `WebView2Loader.dll`). Ces DLL sont aussi intégrées à `BlocStudio.exe`, à `lanceur/BlocStudioLanceur.exe` et donc à chaque application exportée.
- Site : https://developer.microsoft.com/microsoft-edge/webview2/

Le moteur WebView2 lui-même (« Microsoft Edge WebView2 Runtime ») n'est pas livré : il fait partie de Windows 10 et 11.

## Services utilisés par les programmes

### Open-Meteo

Les blocs **Météo** (catégorie Internet) interrogent ce service gratuit, sans inscription :
- `api.open-meteo.com` pour la météo ;
- `geocoding-api.open-meteo.com` pour trouver une ville.

Seuls le nom de la ville demandée, puis ses coordonnées, lui sont envoyés.

- Données : Open-Meteo.com, sous licence [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Un programme qui affiche ces données doit citer la source, par exemple « Météo : Open-Meteo.com ».
- Conditions d'utilisation : https://open-meteo.com/en/terms (usage non commercial gratuit)

### Sites affichés par les programmes

Les contrôles **Navigateur web**, **Vidéo** et **Lien** affichent ou ouvrent les sites choisis par l'auteur du programme : Wikipédia, YouTube, Google Maps… Ces sites ont leurs propres conditions d'utilisation. BlocStudio n'en livre aucun contenu.
