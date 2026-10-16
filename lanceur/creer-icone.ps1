# Dessine l'icône BlocStudio (un losange doré sur fond indigo) en plusieurs tailles
# et l'enregistre au format .ico (images PNG intégrées, format accepté depuis Windows Vista).
param([Parameter(Mandatory)] [string] $Sortie)

Add-Type -AssemblyName System.Drawing

function Dessiner([int] $taille) {
  $bmp = New-Object Drawing.Bitmap $taille, $taille
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([Drawing.Color]::Transparent)

  # Carré arrondi indigo
  $r = [Math]::Max(2, [int]($taille * 0.22))
  $chemin = New-Object Drawing.Drawing2D.GraphicsPath
  $d = $taille - 1
  $chemin.AddArc(0, 0, $r * 2, $r * 2, 180, 90)
  $chemin.AddArc($d - $r * 2, 0, $r * 2, $r * 2, 270, 90)
  $chemin.AddArc($d - $r * 2, $d - $r * 2, $r * 2, $r * 2, 0, 90)
  $chemin.AddArc(0, $d - $r * 2, $r * 2, $r * 2, 90, 90)
  $chemin.CloseFigure()
  $g.FillPath((New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(30, 27, 75))), $chemin)

  # Losange doré
  $c = $taille / 2; $m = $taille * 0.30
  $points = [Drawing.PointF[]]@(
    (New-Object Drawing.PointF $c, ($c - $m)), (New-Object Drawing.PointF ($c + $m), $c),
    (New-Object Drawing.PointF $c, ($c + $m)), (New-Object Drawing.PointF ($c - $m), $c))
  $g.FillPolygon((New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(251, 191, 36))), $points)
  $g.Dispose()

  $flux = New-Object IO.MemoryStream
  $bmp.Save($flux, [Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  return ,$flux.ToArray()
}

$tailles = 16, 24, 32, 48, 64, 256
$images = foreach ($t in $tailles) { ,(Dessiner $t) }

$sortieFlux = New-Object IO.MemoryStream
$w = New-Object IO.BinaryWriter $sortieFlux
$w.Write([UInt16]0); $w.Write([UInt16]1); $w.Write([UInt16]$tailles.Count)
$decalage = 6 + 16 * $tailles.Count
for ($i = 0; $i -lt $tailles.Count; $i++) {
  $t = $tailles[$i]; $octets = $images[$i]
  $w.Write([byte]($(if ($t -ge 256) { 0 } else { $t })))
  $w.Write([byte]($(if ($t -ge 256) { 0 } else { $t })))
  $w.Write([byte]0); $w.Write([byte]0)
  $w.Write([UInt16]1); $w.Write([UInt16]32)
  $w.Write([UInt32]$octets.Length); $w.Write([UInt32]$decalage)
  $decalage += $octets.Length
}
foreach ($octets in $images) { $w.Write($octets) }
$w.Flush()
[IO.File]::WriteAllBytes($Sortie, $sortieFlux.ToArray())
"Icône créée : $Sortie"
