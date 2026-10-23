// BlocStudio — éditeur de sprites : dessin en pixel art, costumes (pour animer),
// import d'images (y compris les GIF animés, découpés en costumes).
// EditeurSprite.ouvrir(sprite, options) → promesse du sprite modifié, ou null si annulé.
// Un sprite : { nom, taille, lisse, vitesse, costumes: [{ nom, donnees }] } (donnees : image PNG « data: »).
(function () {
  const TAILLES = [16, 24, 32, 48, 64, 96, 128];
  const ZONE = 416;              // côté de la grille à l'écran, en pixels
  const MAX_COSTUMES = 40;
  const MAX_HISTORIQUE = 60;
  const TRANSPARENT = [0, 0, 0, 0];
  const PALETTE = [
    '#000000', '#5f574f', '#94a3b8', '#c2c3c7', '#ffffff', '#7e2553', '#ff004d', '#ff77a8',
    '#ffccaa', '#e0a96d', '#ab5236', '#8b4513', '#ffa300', '#f5c518', '#ffec27', '#fde68a',
    '#065f46', '#008751', '#00e436', '#1d2b53', '#1e40af', '#29adff', '#7c3aed', '#83769c'
  ];
  const OUTILS = [
    ['crayon', '✏️', 'Crayon (clic droit : gomme)'],
    ['gomme', '🧽', 'Gomme'],
    ['remplir', '🪣', 'Pot de peinture : remplit une zone de la même couleur'],
    ['pipette', '💧', 'Pipette : reprend la couleur d\'un pixel'],
    ['ligne', '╱', 'Ligne droite'],
    ['rect', '▭', 'Rectangle'],
    ['rectPlein', '■', 'Rectangle plein'],
    ['ellipse', '◯', 'Ellipse'],
    ['ellipsePleine', '⬤', 'Ellipse pleine'],
    ['zone', '🎯', 'Zone de collision : tracez le rectangle qui compte pour les blocs « touche… » (clic droit : toute l\'image)']
  ];
  const ACTIONS = [
    ['annuler', '↶', 'Annuler (Ctrl+Z)'],
    ['retablir', '↷', 'Rétablir (Ctrl+Y)'],
    ['miroirH', '⇋', 'Retourner le costume (gauche ↔ droite)'],
    ['miroirV', '⇵', 'Retourner le costume (haut ↔ bas)'],
    ['gauche', '←', 'Décaler le dessin d\'un pixel vers la gauche'],
    ['droite', '→', 'Décaler le dessin d\'un pixel vers la droite'],
    ['haut', '↑', 'Décaler le dessin d\'un pixel vers le haut'],
    ['bas', '↓', 'Décaler le dessin d\'un pixel vers le bas'],
    ['vider', '🗑️', 'Effacer tout le costume']
  ];

  const $ = id => document.getElementById(id);

  // État de l'éditeur. Chaque costume garde ses pixels (RGBA) pendant l'édition.
  // `zone` : zone de collision du sprite, { x0, y0, x1, y1 } en fractions du costume (null : toute l'image).
  const e = {
    ouvert: false, N: 32, lisse: false, vitesse: 8, costumes: [], courant: 0, zone: null,
    outil: 'crayon', couleur: [0, 0, 0, 255], epaisseur: 1, symetrie: false, oignon: true,
    histo: [], refaire: [], trace: null, survol: null, cellule: 13,
    lecture: true, image: 0, horloge: 0, nomsPris: [], resoudre: null
  };
  const tampon = document.createElement('canvas'); // un costume à sa taille réelle, pour l'afficher agrandi

  // ---------------------------------------------------------------- Pixels

  const vide = N => new Uint8ClampedArray(N * N * 4);
  const enRgba = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).concat(255);
  const enHex = c => '#' + c.slice(0, 3).map(v => v.toString(16).padStart(2, '0')).join('');
  const courant = () => e.costumes[e.courant];

  function lirePx(px, x, y) {
    const i = (y * e.N + x) * 4;
    return [px[i], px[i + 1], px[i + 2], px[i + 3]];
  }

  function poserPx(px, x, y, c) {
    if (x < 0 || y < 0 || x >= e.N || y >= e.N) return;
    px.set(c, (y * e.N + x) * 4);
  }

  // Le crayon a une épaisseur (carré de pixels) ; en dessin symétrique, il agit aussi de l'autre côté.
  function pinceau(px, x, y, c) {
    const d = Math.floor((e.epaisseur - 1) / 2);
    for (let j = 0; j < e.epaisseur; j++) {
      for (let i = 0; i < e.epaisseur; i++) {
        poserPx(px, x - d + i, y - d + j, c);
        if (e.symetrie) poserPx(px, e.N - 1 - (x - d + i), y - d + j, c);
      }
    }
  }

  function ligne(px, x0, y0, x1, y1, c) {
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      pinceau(px, x0, y0, c);
      if (x0 === x1 && y0 === y1) return;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  function rectangle(px, x0, y0, x1, y1, c, plein) {
    const [xa, xb] = [Math.min(x0, x1), Math.max(x0, x1)], [ya, yb] = [Math.min(y0, y1), Math.max(y0, y1)];
    for (let y = ya; y <= yb; y++) {
      for (let x = xa; x <= xb; x++) {
        if (plein || x === xa || x === xb || y === ya || y === yb) pinceau(px, x, y, c);
      }
    }
  }

  // Ellipse inscrite dans le rectangle (x0, y0)–(x1, y1) : on garde les pixels dont le centre est dedans.
  function ellipse(px, x0, y0, x1, y1, c, plein) {
    const [xa, xb] = [Math.min(x0, x1), Math.max(x0, x1)], [ya, yb] = [Math.min(y0, y1), Math.max(y0, y1)];
    const cx = (xa + xb + 1) / 2, cy = (ya + yb + 1) / 2, rx = (xb - xa + 1) / 2, ry = (yb - ya + 1) / 2;
    const dedans = (x, y) => x >= xa && x <= xb && y >= ya && y <= yb &&
      ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;
    for (let y = ya; y <= yb; y++) {
      for (let x = xa; x <= xb; x++) {
        if (!dedans(x, y)) continue;
        const bord = !dedans(x - 1, y) || !dedans(x + 1, y) || !dedans(x, y - 1) || !dedans(x, y + 1);
        if (plein || bord) pinceau(px, x, y, c);
      }
    }
  }

  // Pot de peinture : remplit les pixels voisins de la même couleur (et leur reflet en dessin symétrique).
  function remplir(px, x, y, c) {
    const zone = (x0, y0) => {
      const cible = lirePx(px, x0, y0);
      if (cible.every((v, i) => v === c[i])) return;
      const pile = [[x0, y0]];
      while (pile.length) {
        const [a, b] = pile.pop();
        if (a < 0 || b < 0 || a >= e.N || b >= e.N) continue;
        const i = (b * e.N + a) * 4;
        if (px[i] !== cible[0] || px[i + 1] !== cible[1] || px[i + 2] !== cible[2] || px[i + 3] !== cible[3]) continue;
        px.set(c, i);
        pile.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]);
      }
    };
    zone(x, y);
    if (e.symetrie) zone(e.N - 1 - x, y);
  }

  function transformer(action) {
    const N = e.N, src = courant().px, px = vide(N);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        let sx = x, sy = y;
        if (action === 'miroirH') sx = N - 1 - x;
        if (action === 'miroirV') sy = N - 1 - y;
        // Décalages « en boucle » : ce qui sort d'un côté revient de l'autre.
        if (action === 'gauche') sx = (x + 1) % N;
        if (action === 'droite') sx = (x - 1 + N) % N;
        if (action === 'haut') sy = (y + 1) % N;
        if (action === 'bas') sy = (y - 1 + N) % N;
        const i = (sy * N + sx) * 4;
        px.set(src.subarray(i, i + 4), (y * N + x) * 4);
      }
    }
    courant().px = action === 'vider' ? vide(N) : px;
  }

  // Changement de taille : chaque costume est agrandi ou réduit (pixels nets).
  function redimensionner(px, A, B) {
    const r = vide(B);
    for (let y = 0; y < B; y++) {
      for (let x = 0; x < B; x++) {
        const i = (Math.floor(y * A / B) * A + Math.floor(x * A / B)) * 4;
        r.set(px.subarray(i, i + 4), (y * B + x) * 4);
      }
    }
    return r;
  }

  function versCanvas(px, N) {
    const c = document.createElement('canvas');
    c.width = c.height = N;
    c.getContext('2d').putImageData(new ImageData(px, N, N), 0, 0);
    return c;
  }

  function dansTampon(px) {
    if (tampon.width !== e.N) tampon.width = tampon.height = e.N;
    tampon.getContext('2d').putImageData(new ImageData(px, e.N, e.N), 0, 0);
    return tampon;
  }

  // Dessine une image dans un carré N × N, centrée ; réduite si elle est trop grande.
  function enPixels(source, l, h, N, lisse) {
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = !!lisse;
    g.imageSmoothingQuality = 'high';
    const k = Math.min(1, N / l, N / h);
    const L = Math.max(1, Math.round(l * k)), H = Math.max(1, Math.round(h * k));
    g.drawImage(source, Math.floor((N - L) / 2), Math.floor((N - H) / 2), L, H);
    return g.getImageData(0, 0, N, N).data;
  }

  async function chargerCostume(donnees, N) {
    const img = new Image();
    img.src = donnees;
    await img.decode();
    return enPixels(img, img.naturalWidth, img.naturalHeight, N, true);
  }

  // ---------------------------------------------------------------- Import d'images

  // Toutes les images d'un fichier : plusieurs pour un GIF animé (si le navigateur sait les lire).
  async function cadresDepuisFichier(fichier) {
    if (window.ImageDecoder && /gif|webp|png/.test(fichier.type)) {
      try {
        const lecteur = new ImageDecoder({ data: await fichier.arrayBuffer(), type: fichier.type });
        await lecteur.tracks.ready;
        const n = Math.min(lecteur.tracks.selectedTrack.frameCount, MAX_COSTUMES);
        const cadres = [];
        let duree = 0;
        for (let i = 0; i < n; i++) {
          const { image } = await lecteur.decode({ frameIndex: i });
          const c = document.createElement('canvas');
          c.width = image.displayWidth;
          c.height = image.displayHeight;
          c.getContext('2d').drawImage(image, 0, 0);
          duree += image.duration || 0;
          image.close();
          cadres.push({ source: c, l: c.width, h: c.height });
        }
        lecteur.close();
        if (cadres.length) return { cadres, vitesse: n > 1 && duree ? Math.round(n * 1e6 / duree) : null };
      } catch (err) { /* on se contente de la première image, ci-dessous */ }
    }
    const image = await createImageBitmap(fichier);
    return { cadres: [{ source: image, l: image.width, h: image.height }], vitesse: null };
  }

  // Une petite image garde ses pixels nets (pixel art) ; une grande est réduite en douceur.
  async function lireImage(fichier) {
    const { cadres, vitesse } = await cadresDepuisFichier(fichier);
    const m = Math.max(...cadres.map(c => Math.max(c.l, c.h)));
    return {
      cadres, vitesse,
      taille: TAILLES.find(t => t >= m) || TAILLES[TAILLES.length - 1],
      lisse: m > TAILLES[TAILLES.length - 1]
    };
  }

  function choisirFichier() {
    return new Promise(resoudre => {
      const choix = document.createElement('input');
      choix.type = 'file';
      choix.accept = 'image/*';
      choix.addEventListener('change', () => resoudre(choix.files[0] || null));
      choix.click();
    });
  }

  async function importer(fichier) {
    let image;
    try { image = await lireImage(fichier); } catch (err) {
      alert(`« ${fichier.name} » n'est pas une image lisible. Essayez un fichier PNG, JPG ou GIF.`);
      return;
    }
    memoriser();
    // Dans un sprite encore vierge, l'image impose sa taille ; sinon elle s'adapte au sprite.
    const vierge = e.costumes.length === 1 && courant().px.every(v => v === 0);
    if (vierge) {
      e.N = image.taille;
      e.lisse = image.lisse;
      if (image.vitesse) e.vitesse = Math.min(30, Math.max(1, image.vitesse));
      e.costumes = [];
    }
    const base = fichier.name.replace(/\.[^.]+$/, '').slice(0, 20) || 'image';
    const premier = e.costumes.length;
    for (const [i, c] of image.cadres.entries()) {
      if (e.costumes.length >= MAX_COSTUMES) break;
      e.costumes.push({
        nom: nomCostumeLibre(image.cadres.length > 1 ? `${base} ${i + 1}` : base),
        px: enPixels(c.source, c.l, c.h, e.N, image.lisse || e.lisse)
      });
    }
    e.courant = Math.min(premier, e.costumes.length - 1);
    majTout();
    demarrerApercu();
  }

  // ---------------------------------------------------------------- Costumes et historique

  function nomCostumeLibre(base) {
    const pris = new Set(e.costumes.map(c => c.nom));
    if (base && !pris.has(base)) return base;
    for (let i = 1; ; i++) {
      const nom = (base || 'costume') + (base ? ' ' + (i + 1) : i);
      if (!pris.has(nom)) return nom;
    }
  }

  function photo() {
    return { N: e.N, lisse: e.lisse, courant: e.courant, zone: e.zone, costumes: e.costumes.map(c => ({ nom: c.nom, px: c.px.slice() })) };
  }

  function retrouver(p) {
    Object.assign(e, { N: p.N, lisse: p.lisse, courant: p.courant, zone: p.zone, costumes: p.costumes });
    majTout();
  }

  // À appeler juste avant chaque modification, pour pouvoir l'annuler.
  function memoriser() {
    e.histo.push(photo());
    if (e.histo.length > MAX_HISTORIQUE) e.histo.shift();
    e.refaire = [];
  }

  function annuler() {
    if (!e.histo.length) return;
    e.refaire.push(photo());
    retrouver(e.histo.pop());
  }

  function retablir() {
    if (!e.refaire.length) return;
    e.histo.push(photo());
    retrouver(e.refaire.pop());
  }

  function actionCostume(action) {
    if (action === 'nouveau' || action === 'dupliquer') {
      if (e.costumes.length >= MAX_COSTUMES) return alert(`${MAX_COSTUMES} costumes au maximum.`);
      memoriser();
      e.costumes.splice(e.courant + 1, 0, {
        nom: nomCostumeLibre(),
        px: action === 'nouveau' ? vide(e.N) : courant().px.slice()
      });
      e.courant++;
    } else if (action === 'supprimer') {
      if (e.costumes.length < 2) return;
      memoriser();
      e.costumes.splice(e.courant, 1);
      e.courant = Math.min(e.courant, e.costumes.length - 1);
    } else {
      const autre = e.courant + (action === 'avant' ? -1 : 1);
      if (autre < 0 || autre >= e.costumes.length) return;
      memoriser();
      [e.costumes[e.courant], e.costumes[autre]] = [e.costumes[autre], e.costumes[e.courant]];
      e.courant = autre;
    }
    majTout();
  }

  // ---------------------------------------------------------------- Affichage

  function damier(g, L, H, pas) {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, L, H);
    g.fillStyle = '#e8ebf1';
    for (let y = 0; y < H; y += pas) {
      for (let x = (y / pas) % 2 ? pas : 0; x < L; x += pas * 2) g.fillRect(x, y, pas, pas);
    }
  }

  function dessiner() {
    const toile = $('es-toile');
    const g = toile.getContext('2d');
    const N = e.N, cell = e.cellule, L = cell * N;
    const ratio = toile.width / L;
    g.setTransform(ratio, 0, 0, ratio, 0, 0);
    damier(g, L, L, 8);
    g.imageSmoothingEnabled = false;
    // « Pelure d'oignon » : le costume précédent en transparence, pour dessiner le suivant bien aligné.
    if (e.oignon && e.courant > 0) {
      g.globalAlpha = 0.25;
      g.drawImage(dansTampon(e.costumes[e.courant - 1].px), 0, 0, L, L);
      g.globalAlpha = 1;
    }
    g.drawImage(dansTampon(courant().px), 0, 0, L, L);

    if (cell >= 6) {
      g.strokeStyle = 'rgba(15, 23, 42, .08)';
      g.lineWidth = 1;
      g.beginPath();
      for (let i = 1; i < N; i++) {
        g.moveTo(i * cell + 0.5, 0); g.lineTo(i * cell + 0.5, L);
        g.moveTo(0, i * cell + 0.5); g.lineTo(L, i * cell + 0.5);
      }
      g.stroke();
    }
    if (e.symetrie) {
      g.fillStyle = 'rgba(124, 58, 237, .55)';
      g.fillRect(L / 2 - 1, 0, 2, L);
    }
    // Zone de collision : cadre pointillé rouge ; avec l'outil 🎯, le reste de l'image est voilé.
    if (e.zone) {
      const z = e.zone, x = z.x0 * L, y = z.y0 * L, l = (z.x1 - z.x0) * L, h = (z.y1 - z.y0) * L;
      if (e.outil === 'zone') {
        g.fillStyle = 'rgba(15, 23, 42, .35)';
        g.fillRect(0, 0, L, y);
        g.fillRect(0, y + h, L, L - y - h);
        g.fillRect(0, y, x, h);
        g.fillRect(x + l, y, L - x - l, h);
      }
      g.strokeStyle = '#dc2626';
      g.lineWidth = 2;
      g.setLineDash([6, 4]);
      g.strokeRect(x + 1, y + 1, l - 2, h - 2);
      g.setLineDash([]);
    }
    // Pixels que le crayon va toucher
    if (e.survol && !e.trace) {
      const ep = ['crayon', 'gomme', 'ligne', 'rect', 'rectPlein', 'ellipse', 'ellipsePleine'].includes(e.outil) ? e.epaisseur : 1;
      const d = Math.floor((ep - 1) / 2);
      g.strokeStyle = '#7c3aed';
      g.lineWidth = 2;
      const cadre = x => g.strokeRect((x - d) * cell + 1, (e.survol.y - d) * cell + 1, ep * cell - 2, ep * cell - 2);
      cadre(e.survol.x);
      if (e.symetrie && ep === 1) cadre(N - 1 - e.survol.x);
    }
  }

  function dessinerVignette(canvas, px) {
    const g = canvas.getContext('2d');
    damier(g, canvas.width, canvas.height, 6);
    g.imageSmoothingEnabled = e.lisse;
    g.drawImage(dansTampon(px), 0, 0, canvas.width, canvas.height);
  }

  function majVignette() {
    const v = $('es-liste-costumes').children[e.courant];
    if (v) dessinerVignette(v.querySelector('canvas'), courant().px);
  }

  function majCostumes() {
    $('es-liste-costumes').replaceChildren(...e.costumes.map((c, i) => {
      const b = document.createElement('button');
      b.className = 'es-vignette' + (i === e.courant ? ' actif' : '');
      b.title = c.nom;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 52;
      const numero = document.createElement('span');
      numero.textContent = i + 1;
      b.append(canvas, numero);
      b.addEventListener('click', () => { e.courant = i; majTout(); });
      dessinerVignette(canvas, c.px);
      return b;
    }));
    $('es-liste-costumes').children[e.courant]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    $('es-nom-costume').value = courant().nom;
    $('es-costume-numero').textContent = `Costume ${e.courant + 1} sur ${e.costumes.length}`;
    $('es-c-supprimer').disabled = e.costumes.length < 2;
    $('es-c-avant').disabled = e.courant === 0;
    $('es-c-apres').disabled = e.courant === e.costumes.length - 1;
  }

  function majOutils() {
    document.querySelectorAll('#es-outils [data-outil]').forEach(b => b.classList.toggle('actif', b.dataset.outil === e.outil));
    $('es-a-annuler').disabled = !e.histo.length;
    $('es-a-retablir').disabled = !e.refaire.length;
    const hex = enHex(e.couleur);
    $('es-couleur').style.background = hex;
    $('es-couleur-perso').value = hex;
    document.querySelectorAll('#es-palette button').forEach(b => b.classList.toggle('actif', b.dataset.couleur === hex));
    majZone();
  }

  function majZone() {
    const z = e.zone, N = e.N;
    $('es-zone-texte').textContent = z
      ? `Pixels ${Math.round(z.x0 * N)} à ${Math.round(z.x1 * N) - 1} en x, ${Math.round(z.y0 * N)} à ${Math.round(z.y1 * N) - 1} en y.`
      : 'Toute l\'image. Avec l\'outil 🎯, tracez un rectangle pour la réduire.';
    $('es-zone-tout').disabled = !z;
  }

  // Zone de collision tracée de la case (x0, y0) à la case (x, y), bords compris.
  function tracerZone(t, x, y) {
    const N = e.N;
    e.zone = {
      x0: Math.min(t.x0, x) / N, y0: Math.min(t.y0, y) / N,
      x1: (Math.max(t.x0, x) + 1) / N, y1: (Math.max(t.y0, y) + 1) / N
    };
    // Toute l'image : pas besoin de zone.
    if (e.zone.x0 === 0 && e.zone.y0 === 0 && e.zone.x1 === 1 && e.zone.y1 === 1) e.zone = null;
  }

  function majTout() {
    const toile = $('es-toile');
    e.cellule = Math.max(1, Math.floor(ZONE / e.N));
    const L = e.cellule * e.N;
    const ratio = window.devicePixelRatio || 1;
    toile.style.width = toile.style.height = L + 'px';
    if (toile.width !== Math.round(L * ratio)) toile.width = toile.height = Math.round(L * ratio);
    $('es-taille').value = e.N;
    $('es-nets').checked = !e.lisse;
    $('es-vitesse').value = e.vitesse;
    $('es-vitesse-texte').textContent = e.vitesse + ' images/s';
    dessiner();
    majCostumes();
    majOutils();
    dessinerApercu();
  }

  // ---- Aperçu animé ----
  function dessinerApercu() {
    const c = $('es-apercu');
    const ratio = window.devicePixelRatio || 1;
    const L = c.clientWidth || 112;
    if (c.width !== Math.round(L * ratio)) c.width = c.height = Math.round(L * ratio);
    const g = c.getContext('2d');
    g.setTransform(ratio, 0, 0, ratio, 0, 0);
    damier(g, L, L, 8);
    g.imageSmoothingEnabled = e.lisse;
    const n = e.lecture ? e.image % e.costumes.length : e.courant;
    g.drawImage(dansTampon(e.costumes[n].px), 0, 0, L, L);
  }

  function demarrerApercu() {
    clearInterval(e.horloge);
    e.image = 0;
    e.horloge = setInterval(() => {
      if (e.lecture) e.image = (e.image + 1) % e.costumes.length;
      dessinerApercu();
    }, 1000 / e.vitesse);
    $('es-lecture').textContent = e.lecture ? '⏸' : '▶';
    $('es-lecture').title = e.lecture ? 'Arrêter l\'aperçu' : 'Voir l\'animation';
    dessinerApercu();
  }

  // ---------------------------------------------------------------- Souris sur la grille

  function cellule(ev) {
    const r = $('es-toile').getBoundingClientRect();
    return {
      x: Math.min(e.N - 1, Math.max(0, Math.floor((ev.clientX - r.left) / r.width * e.N))),
      y: Math.min(e.N - 1, Math.max(0, Math.floor((ev.clientY - r.top) / r.height * e.N)))
    };
  }

  function forme(t, x, y) {
    const px = courant().px;
    px.set(t.base);
    if (t.outil === 'ligne') ligne(px, t.x0, t.y0, x, y, t.c);
    else if (t.outil === 'rect' || t.outil === 'rectPlein') rectangle(px, t.x0, t.y0, x, y, t.c, t.outil === 'rectPlein');
    else ellipse(px, t.x0, t.y0, x, y, t.c, t.outil === 'ellipsePleine');
  }

  function brancherToile() {
    const toile = $('es-toile');
    toile.addEventListener('contextmenu', ev => ev.preventDefault());
    toile.addEventListener('pointerdown', ev => {
      ev.preventDefault();
      const { x, y } = cellule(ev);
      if (e.outil === 'zone') {
        memoriser();
        if (ev.button === 2) e.zone = null;
        else {
          e.trace = { outil: 'zone', x0: x, y0: y };
          tracerZone(e.trace, x, y);
          try { toile.setPointerCapture(ev.pointerId); } catch (err) { /* pas grave */ }
        }
        dessiner();
        majOutils();
        return;
      }
      const outil = ev.button === 2 ? 'gomme' : e.outil;
      const c = outil === 'gomme' ? TRANSPARENT : e.couleur;
      const px = courant().px;
      if (outil === 'pipette') {
        const pris = lirePx(px, x, y);
        if (pris[3] === 0) e.outil = 'gomme';
        else { e.couleur = [pris[0], pris[1], pris[2], 255]; e.outil = 'crayon'; }
        majOutils();
        return;
      }
      memoriser();
      if (outil === 'remplir') remplir(px, x, y, c);
      else if (outil === 'crayon' || outil === 'gomme') {
        pinceau(px, x, y, c);
        e.trace = { outil, c, x, y };
      } else {
        e.trace = { outil, c, x0: x, y0: y, base: px.slice() };
        forme(e.trace, x, y);
      }
      try { toile.setPointerCapture(ev.pointerId); } catch (err) { /* pas grave */ }
      dessiner();
      majOutils();
      if (!e.trace) majVignette();
    });
    toile.addEventListener('pointermove', ev => {
      const { x, y } = cellule(ev);
      e.survol = { x, y };
      $('es-position').textContent = `x ${x} · y ${y}`;
      const t = e.trace;
      if (t && t.outil === 'zone') { tracerZone(t, x, y); majZone(); }
      else if (t && (t.outil === 'crayon' || t.outil === 'gomme')) {
        ligne(courant().px, t.x, t.y, x, y, t.c);
        t.x = x;
        t.y = y;
      } else if (t) forme(t, x, y);
      dessiner();
    });
    const lacher = () => {
      if (!e.trace) return;
      e.trace = null;
      majVignette();
      dessiner();
    };
    toile.addEventListener('pointerup', lacher);
    toile.addEventListener('pointercancel', lacher);
    toile.addEventListener('pointerleave', () => {
      e.survol = null;
      $('es-position').textContent = '';
      dessiner();
    });
  }

  // ---------------------------------------------------------------- Interface

  function construire() {
    const outils = $('es-outils');
    const bouton = (texte, titre, action, attributs) => {
      const b = document.createElement('button');
      b.textContent = texte;
      b.title = titre;
      Object.assign(b.dataset, attributs || {});
      b.addEventListener('click', action);
      outils.appendChild(b);
      return b;
    };
    for (const [outil, icone, titre] of OUTILS) {
      bouton(icone, titre, () => { e.outil = outil; majOutils(); }, { outil });
    }
    outils.appendChild(document.createElement('hr'));
    for (const [action, icone, titre] of ACTIONS) {
      const b = bouton(icone, titre, () => {
        if (action === 'annuler') return annuler();
        if (action === 'retablir') return retablir();
        memoriser();
        transformer(action);
        dessiner();
        majVignette();
        majOutils();
      });
      b.id = 'es-a-' + action;
    }

    $('es-palette').replaceChildren(...PALETTE.map(hex => {
      const b = document.createElement('button');
      b.style.background = hex;
      b.dataset.couleur = hex;
      b.title = hex;
      b.addEventListener('click', () => {
        e.couleur = enRgba(hex);
        if (e.outil === 'gomme' || e.outil === 'pipette') e.outil = 'crayon';
        majOutils();
      });
      return b;
    }));
    $('es-couleur-perso').addEventListener('input', ev => {
      e.couleur = enRgba(ev.target.value);
      if (e.outil === 'gomme' || e.outil === 'pipette') e.outil = 'crayon';
      majOutils();
    });

    $('es-taille').replaceChildren(...TAILLES.map(t => new Option(`${t} × ${t}`, t)));
    $('es-taille').addEventListener('change', ev => {
      const B = Number(ev.target.value);
      if (B === e.N) return;
      memoriser();
      for (const c of e.costumes) c.px = redimensionner(c.px, e.N, B);
      e.N = B;
      majTout();
    });
    $('es-epaisseur').addEventListener('change', ev => { e.epaisseur = Number(ev.target.value); });
    $('es-symetrie').addEventListener('change', ev => { e.symetrie = ev.target.checked; dessiner(); });
    $('es-oignon').addEventListener('change', ev => { e.oignon = ev.target.checked; dessiner(); });
    $('es-nets').addEventListener('change', ev => { e.lisse = !ev.target.checked; majTout(); });
    $('es-vitesse').addEventListener('input', ev => {
      e.vitesse = Number(ev.target.value);
      $('es-vitesse-texte').textContent = e.vitesse + ' images/s';
      demarrerApercu();
    });
    $('es-lecture').addEventListener('click', () => { e.lecture = !e.lecture; demarrerApercu(); });
    $('es-zone-tout').addEventListener('click', () => {
      memoriser();
      e.zone = null;
      dessiner();
      majOutils();
    });

    $('es-c-nouveau').addEventListener('click', () => actionCostume('nouveau'));
    $('es-c-dupliquer').addEventListener('click', () => actionCostume('dupliquer'));
    $('es-c-supprimer').addEventListener('click', () => actionCostume('supprimer'));
    $('es-c-avant').addEventListener('click', () => actionCostume('avant'));
    $('es-c-apres').addEventListener('click', () => actionCostume('apres'));
    $('es-nom-costume').addEventListener('input', ev => {
      courant().nom = ev.target.value.trim() || courant().nom;
      $('es-liste-costumes').children[e.courant].title = courant().nom;
    });
    $('es-importer').addEventListener('click', async () => {
      const fichier = await choisirFichier();
      if (fichier) importer(fichier);
    });
    $('es-annuler').addEventListener('click', () => {
      if (e.histo.length && !confirm('Abandonner les modifications de ce sprite ?')) return;
      fermer(null);
    });
    $('es-valider').addEventListener('click', valider);
    $('es-nom').addEventListener('input', () => { $('es-erreur').textContent = ''; });

    document.addEventListener('keydown', ev => {
      if (!e.ouvert || !(ev.ctrlKey || ev.metaKey) || /^(INPUT|TEXTAREA)$/.test(ev.target.tagName)) return;
      const k = ev.key.toLowerCase();
      if (k === 'z' && !ev.shiftKey) { ev.preventDefault(); annuler(); }
      else if (k === 'y' || (k === 'z' && ev.shiftKey)) { ev.preventDefault(); retablir(); }
    });
    brancherToile();
  }

  // ---------------------------------------------------------------- Ouverture et fermeture

  async function ouvrir(sprite, options = {}) {
    if (e.ouvert) return null;
    e.ouvert = true;
    const N = TAILLES.includes(sprite && sprite.taille) ? sprite.taille : 32;
    Object.assign(e, {
      N, lisse: !!(sprite && sprite.lisse), vitesse: (sprite && sprite.vitesse) || 8,
      courant: 0, histo: [], refaire: [], trace: null, survol: null, lecture: true,
      nomsPris: options.nomsPris || [], zone: zoneValide(sprite && sprite.zone)
    });
    e.costumes = [];
    for (const c of (sprite && sprite.costumes) || []) {
      try { e.costumes.push({ nom: c.nom, px: await chargerCostume(c.donnees, N) }); } catch (err) { /* image abîmée */ }
    }
    if (!e.costumes.length) e.costumes = [{ nom: 'costume1', px: vide(N) }];
    $('es-titre').textContent = sprite ? '🎨 Modifier un sprite' : '🎨 Nouveau sprite';
    $('es-nom').value = (sprite && sprite.nom) || options.nom || 'sprite';
    $('es-erreur').textContent = '';
    $('editeur-sprite').hidden = false;
    majTout();
    demarrerApercu();
    const resultat = new Promise(r => { e.resoudre = r; });
    if (options.fichier) await importer(options.fichier);
    e.histo = []; // l'import de départ ne compte pas comme une modification
    majOutils();
    return resultat;
  }

  function zoneValide(z) {
    if (!z || ![z.x0, z.y0, z.x1, z.y1].every(v => typeof v === 'number' && v >= 0 && v <= 1)) return null;
    return z.x1 > z.x0 && z.y1 > z.y0 ? { x0: z.x0, y0: z.y0, x1: z.x1, y1: z.y1 } : null;
  }

  function valider() {
    const nom = $('es-nom').value.trim();
    if (!nom) { $('es-erreur').textContent = 'Donnez un nom à ce sprite.'; return $('es-nom').focus(); }
    if (e.nomsPris.includes(nom)) {
      $('es-erreur').textContent = `Il y a déjà un sprite nommé « ${nom} ».`;
      return $('es-nom').focus();
    }
    fermer({
      nom, taille: e.N, lisse: e.lisse, vitesse: e.vitesse, zone: e.zone,
      costumes: e.costumes.map(c => ({ nom: c.nom, donnees: versCanvas(c.px, e.N).toDataURL('image/png') }))
    });
  }

  function fermer(resultat) {
    clearInterval(e.horloge);
    $('editeur-sprite').hidden = true;
    e.ouvert = false;
    const r = e.resoudre;
    e.resoudre = null;
    if (r) r(resultat);
  }

  construire();
  window.EditeurSprite = { ouvrir, choisirFichier, zoneValide, TAILLES };
})();
