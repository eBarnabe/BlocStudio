# Tests automatiques de BlocStudio.
#
#   powershell -ExecutionPolicy Bypass -File tests\verifier.ps1
#
# Ouvre la vraie page de l'éditeur (index.html) dans Chrome ou Edge, sans fenêtre (« headless »),
# avec deux scripts en plus : tests\preparer.js (avant BlocStudio : fausse caméra, faux micro…)
# et tests\verifier.js (après : les tests). Il vérifie :
#   - que la page se charge sans erreur ;
#   - le moteur d'exécution (gravité, score, nombres, hasard, dates, dictionnaires, calendrier,
#     horloge, fond qui défile, manette) ;
#   - chaque exemple de la galerie : il s'ouvre, toutes ses catégories de blocs s'affichent,
#     il s'exécute (avec un appui sur Espace) sans erreur ;
#   - chaque projet .bstudio posé dans ce dossier tests\ : même chose.
# Code de sortie : 0 si tout passe, 1 sinon. Rien à installer (Chrome ou Edge suffit).

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$ici = $PSScriptRoot
$racine = Split-Path $ici -Parent

$navigateur = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $navigateur) { throw 'Ni Chrome ni Edge n''est installé : impossible de lancer les tests.' }

$dossierTemp = Join-Path $env:TEMP 'blocstudio-tests'
if (Test-Path $dossierTemp) { Remove-Item $dossierTemp -Recurse -Force }
New-Item -ItemType Directory $dossierTemp | Out-Null

$base = 'file:///' + ($racine -replace '\\', '/') + '/'
$index = [IO.File]::ReadAllText((Join-Path $racine 'index.html'), [Text.Encoding]::UTF8)
$utf8 = New-Object Text.UTF8Encoding $false

# Une page de test : index.html avec les scripts de test, ouverte dans un profil neuf.
# $avant : du JavaScript exécuté avant BlocStudio (mode, projet à charger…).
function Lancer-Tests([string]$nom, [string]$avant) {
  $tete = "<head><base href=""$base""><script>$avant</script><script src=""tests/preparer.js""></script>"
  $page = $index.Replace('<head>', $tete).Replace('</body>', '<script src="tests/verifier.js"></script></body>')
  $fichier = Join-Path $dossierTemp "$nom.html"
  [IO.File]::WriteAllText($fichier, $page, $utf8)
  $profil = Join-Path $dossierTemp "profil-$nom"
  $adresse = 'file:///' + ($fichier -replace '\\', '/')
  # Chrome écrit des messages sans importance sur sa sortie d'erreur : ils ne doivent pas arrêter le script.
  $ErrorActionPreference = 'Continue'
  $dom = & $navigateur --headless=new --disable-gpu --no-first-run --mute-audio --allow-file-access-from-files `
    "--user-data-dir=$profil" --virtual-time-budget=900000 --dump-dom $adresse 2>$null | Out-String
  $m = [regex]::Match($dom, '<pre id="resultats-tests">([\s\S]*?)</pre>')
  if (-not $m.Success) { return @("ÉCHEC   $nom : la page de test n'a rien répondu") }
  return [Net.WebUtility]::HtmlDecode($m.Groups[1].Value) -split "`n"
}

function Afficher([string[]]$lignes) {
  foreach ($l in $lignes) {
    if ($l.StartsWith('ÉCHEC')) { Write-Host $l -ForegroundColor Red }
    elseif ($l.StartsWith('RÉSULTAT')) { Write-Host $l -ForegroundColor Cyan }
    elseif ($l -ne 'FIN') { Write-Host $l }
  }
}

Write-Host "Navigateur : $navigateur`n"
$toutes = @()

Write-Host '== Éditeur, moteur et exemples' -ForegroundColor Cyan
$lignes = Lancer-Tests 'editeur' "window.__MODE = 'tout';"
Afficher $lignes
$toutes += $lignes

foreach ($f in Get-ChildItem $ici -Filter *.bstudio) {
  Write-Host "`n== Projet $($f.Name)" -ForegroundColor Cyan
  $json = [IO.File]::ReadAllText($f.FullName, [Text.Encoding]::UTF8)
  # Le projet est mis là où l'éditeur retrouve le dernier projet ouvert ; « </ » ne doit pas fermer la balise <script>.
  $texte = (ConvertTo-Json $json -Compress) -replace '</', '<\/'
  $lignes = Lancer-Tests ("projet-" + ($f.BaseName -replace '[^\w-]', '_')) "window.__MODE = 'projet'; localStorage.setItem('blocstudio.projet', $texte);"
  Afficher $lignes
  $toutes += $lignes
}

$echecs = @($toutes | Where-Object { $_.StartsWith('ÉCHEC') }).Count
$finis = @($toutes | Where-Object { $_ -eq 'FIN' }).Count
$attendus = 1 + @(Get-ChildItem $ici -Filter *.bstudio).Count
if ($finis -lt $attendus) { $echecs++; Write-Host "`nÉCHEC   une page de test ne s'est pas terminée" -ForegroundColor Red }
if ($echecs) { Write-Host "`n$echecs échec(s)." -ForegroundColor Red; exit 1 }
Write-Host "`nTout est bon." -ForegroundColor Green
exit 0
