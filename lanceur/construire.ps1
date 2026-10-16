# Construit le lanceur des programmes exportés (BlocStudioLanceur.exe),
# puis le recopie, encodé en base64, dans js/lanceur-data.js pour que
# BlocStudio puisse l'utiliser sans serveur (y compris ouvert en file://).
#
# Utilisation : powershell -ExecutionPolicy Bypass -File lanceur\construire.ps1
# Aucun outil à installer : le compilateur C# fait partie de Windows.

$ErrorActionPreference = 'Stop'
$ici = $PSScriptRoot
$csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$sdk = Join-Path $ici 'sdk'
$icone = Join-Path $ici 'icone.ico'
$exe = Join-Path $ici 'BlocStudioLanceur.exe'

if (-not (Test-Path $icone)) { & (Join-Path $ici 'creer-icone.ps1') -Sortie $icone }

& $csc /nologo /target:winexe /platform:x64 /optimize+ "/out:$exe" "/win32icon:$icone" `
  "/reference:$sdk\Microsoft.Web.WebView2.Core.dll" `
  "/reference:$sdk\Microsoft.Web.WebView2.WinForms.dll" `
  /reference:System.Windows.Forms.dll /reference:System.Drawing.dll `
  "/resource:$sdk\Microsoft.Web.WebView2.Core.dll,Microsoft.Web.WebView2.Core.dll" `
  "/resource:$sdk\Microsoft.Web.WebView2.WinForms.dll,Microsoft.Web.WebView2.WinForms.dll" `
  "/resource:$sdk\WebView2Loader.dll,WebView2Loader.dll" `
  (Join-Path $ici 'Lanceur.cs')
if ($LASTEXITCODE -ne 0) { throw "La compilation du lanceur a échoué." }

$base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($exe))
$js = "// Généré par lanceur/construire.ps1 — ne pas modifier à la main.`n" +
      "window.BlocStudioLanceur = '$base64';`n"
[IO.File]::WriteAllText((Join-Path $ici '..\js\lanceur-data.js'), $js, (New-Object Text.UTF8Encoding $false))

"Lanceur construit : $exe ($((Get-Item $exe).Length) octets)"

# BlocStudio lui-même en application Windows, à la racine (à côté de index.html).
$studio = Join-Path $ici '..\BlocStudio.exe'
& $csc /nologo /target:winexe /platform:x64 /optimize+ "/out:$studio" "/win32icon:$icone" `
  "/reference:$sdk\Microsoft.Web.WebView2.Core.dll" `
  "/reference:$sdk\Microsoft.Web.WebView2.WinForms.dll" `
  /reference:System.Windows.Forms.dll /reference:System.Drawing.dll /reference:System.Web.Extensions.dll `
  "/resource:$sdk\Microsoft.Web.WebView2.Core.dll,Microsoft.Web.WebView2.Core.dll" `
  "/resource:$sdk\Microsoft.Web.WebView2.WinForms.dll,Microsoft.Web.WebView2.WinForms.dll" `
  "/resource:$sdk\WebView2Loader.dll,WebView2Loader.dll" `
  (Join-Path $ici 'Studio.cs')
if ($LASTEXITCODE -ne 0) { throw "La compilation de BlocStudio.exe a échoué." }
"BlocStudio construit : $((Resolve-Path $studio).Path) ($((Get-Item $studio).Length) octets)"
