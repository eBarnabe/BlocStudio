# Construit le lanceur des applications Android (un .apk sans programme ni signature),
# puis le recopie, encodé en base64, dans js/lanceur-android-data.js : BlocStudio y ajoute
# le programme et le signe au moment de l'export (voir LISEZMOI.md et js/export-android.js).
#
# Utilisation : powershell -ExecutionPolicy Bypass -File lanceur\android\construire.ps1
# Il faut un JDK 17 (JAVA_HOME) et le SDK Android (ANDROID_HOME) avec « build-tools;34.0.0 »
# et « platforms;android-34 ». Seulement pour reconstruire le lanceur : l'export n'en a pas besoin.

$ErrorActionPreference = 'Stop'
$ici = $PSScriptRoot
$java = if ($env:JAVA_HOME) { $env:JAVA_HOME } else { "$env:LOCALAPPDATA\Programs\jdk-17" }
$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
$outils = "$sdk\build-tools\34.0.0"
$android = "$sdk\platforms\android-34\android.jar"
foreach ($f in "$java\bin\javac.exe", "$outils\aapt2.exe", $android) {
  if (-not (Test-Path $f)) { throw "Introuvable : $f (voir l'en-tête de ce script)." }
}
$env:JAVA_HOME = $java

$obj = Join-Path $ici 'obj'
if (Test-Path $obj) { Remove-Item $obj -Recurse -Force }
New-Item -ItemType Directory "$obj\classes", "$obj\dex" | Out-Null

# L'icône par défaut (remplacée à l'export) : le losange doré de BlocStudio sur fond indigo.
$icone = Join-Path $ici 'res\mipmap-xxxhdpi\ic_launcher.png'
if (-not (Test-Path $icone)) {
  Add-Type -AssemblyName System.Drawing
  New-Item -ItemType Directory -Force (Split-Path $icone) | Out-Null
  $t = 192
  $bmp = New-Object Drawing.Bitmap $t, $t
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([Drawing.Color]::FromArgb(30, 27, 75))
  $c = $t / 2; $m = $t * 0.30
  $points = [Drawing.PointF[]]@(
    (New-Object Drawing.PointF $c, ($c - $m)), (New-Object Drawing.PointF ($c + $m), $c),
    (New-Object Drawing.PointF $c, ($c + $m)), (New-Object Drawing.PointF ($c - $m), $c))
  $g.FillPolygon((New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(251, 191, 36))), $points)
  $g.Dispose()
  $bmp.Save($icone, [Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

function Verifier([string]$etape) { if ($LASTEXITCODE -ne 0) { throw "Échec : $etape" } }

# Ressources et manifeste. L'icône n'est pas recompressée : BlocStudio la remplace telle quelle.
& "$outils\aapt2.exe" compile --no-crunch --dir (Join-Path $ici 'res') -o "$obj\res.zip"; Verifier 'aapt2 compile'
& "$outils\aapt2.exe" link -o "$obj\lanceur.apk" -I $android --manifest (Join-Path $ici 'AndroidManifest.xml') `
  --min-sdk-version 24 --target-sdk-version 34 --version-code 1 --version-name 1.0 "$obj\res.zip"; Verifier 'aapt2 link'

# Code Java → classes.dex
$sources = Get-ChildItem (Join-Path $ici 'src') -Recurse -Filter *.java | ForEach-Object FullName
& "$java\bin\javac.exe" -nowarn -Xlint:-options -source 1.8 -target 1.8 -bootclasspath $android -encoding UTF-8 -d "$obj\classes" $sources
Verifier 'javac'
$classes = Get-ChildItem "$obj\classes" -Recurse -Filter *.class | ForEach-Object FullName
& "$outils\d8.bat" --release --min-api 24 --lib $android --output "$obj\dex" $classes; Verifier 'd8'

Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::Open("$obj\lanceur.apk", 'Update')
[void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "$obj\dex\classes.dex", 'classes.dex')
$zip.Dispose()

$apk = "$obj\lanceur.apk"
$base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($apk))
$js = "// Généré par lanceur/android/construire.ps1 — ne pas modifier à la main.`n" +
      "window.BlocStudioLanceurAndroid = '$base64';`n"
[IO.File]::WriteAllText((Join-Path $ici '..\..\js\lanceur-android-data.js'), $js, (New-Object Text.UTF8Encoding $false))
"Lanceur Android construit : $apk ($((Get-Item $apk).Length) octets)"
