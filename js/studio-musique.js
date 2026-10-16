// Studio de musique 8 bits : une grille de notes (façon piano à rouleau) sur quatre pistes,
// comme les consoles de jeu d'autrefois (deux ondes carrées, un triangle, un bruit).
// La partition est gardée dans le projet (pour la retoucher) et rendue en WAV 8 bits :
// le résultat est un son comme les autres (« jouer le son », contrôle Son, export…).
(function () {
  const TAUX = 22050;            // échantillons par seconde du WAV produit
  const PAS_PAR_MESURE = 16;     // une case = une double croche
  const HAUTEUR_LIGNE = 16;
  const LARGEUR_CASE = 20;
  const TRAINE = 0.3;            // secondes ajoutées à la fin (les dernières notes s'éteignent)
  const NOMS_NOTES = ['do', 'do#', 'ré', 'ré#', 'mi', 'fa', 'fa#', 'sol', 'sol#', 'la', 'la#', 'si'];

  // Rangées de bas en haut : notes MIDI (60 = do du milieu), ou sons de batterie.
  const notes = (de, a) => Array.from({ length: a - de + 1 }, (_, i) => de + i);
  const PISTES = [
    { nom: 'Mélodie', icone: '🎵', onde: 'carre', rapport: 0.5, gain: 0.22, couleur: '#4f46e5', rangees: notes(60, 84) },
    { nom: 'Accompagnement', icone: '🎶', onde: 'carre', rapport: 0.25, gain: 0.16, couleur: '#0891b2', rangees: notes(55, 79) },
    { nom: 'Basse', icone: '🎸', onde: 'triangle', gain: 0.32, couleur: '#16a34a', rangees: notes(36, 60) },
    { nom: 'Batterie', icone: '🥁', onde: 'bruit', gain: 0.3, couleur: '#ea580c', rangees: [0, 1, 2],
      libelles: ['Grosse caisse', 'Caisse claire', 'Charleston'] }
  ];

  const nomNote = h => NOMS_NOTES[h % 12] + (Math.floor(h / 12) - 1);
  const frequence = h => 440 * Math.pow(2, (h - 69) / 12);

  function musiqueVide() {
    return { version: 1, tempo: 120, mesures: 4, pistes: PISTES.map(() => ({ notes: [] })) };
  }

  // Une petite mélodie entraînante pour découvrir le studio.
  function musiqueExemple() {
    const m = musiqueVide();
    m.tempo = 140;
    const ajouter = (piste, p, h, d) => m.pistes[piste].notes.push([p, h, d]);
    [[0, 72, 2], [2, 76, 2], [4, 79, 2], [6, 76, 2], [8, 77, 2], [10, 81, 2], [12, 79, 4],
     [16, 76, 2], [18, 79, 2], [20, 84, 2], [22, 83, 2], [24, 84, 6], [30, 79, 2],
     [32, 81, 2], [34, 79, 2], [36, 77, 2], [38, 76, 2], [40, 74, 2], [42, 76, 2], [44, 77, 4],
     [48, 76, 2], [50, 74, 2], [52, 71, 2], [54, 74, 2], [56, 72, 8]].forEach(n => ajouter(0, ...n));
    [[0, 64, 4], [8, 65, 4], [16, 64, 4], [24, 67, 4], [32, 65, 4], [40, 67, 4], [48, 67, 4], [56, 64, 8]]
      .forEach(n => ajouter(1, ...n));
    [[0, 48, 2], [4, 55, 2], [8, 53, 2], [12, 55, 2], [16, 48, 2], [20, 55, 2], [24, 52, 2], [28, 55, 2],
     [32, 53, 2], [36, 57, 2], [40, 55, 2], [44, 53, 2], [48, 55, 2], [52, 50, 2], [56, 48, 4], [60, 43, 2]]
      .forEach(n => ajouter(2, ...n));
    for (let p = 0; p < 64; p += 2) ajouter(3, p, 2, 1);
    for (let p = 0; p < 64; p += 8) { ajouter(3, p, 0, 1); ajouter(3, p + 4, 1, 1); }
    return m;
  }

  // ---------------------------------------------------------------- Synthèse

  function duree(m) {
    return m.mesures * PAS_PAR_MESURE * dureePas(m) + TRAINE;
  }
  const dureePas = m => 60 / m.tempo / 4;

  // Calcule les échantillons (entre -1 et 1) de toute la musique.
  function rendre(m) {
    const sortie = new Float32Array(Math.ceil(duree(m) * TAUX));
    const dp = dureePas(m);
    m.pistes.forEach((piste, i) => {
      const def = PISTES[i];
      for (const [p, h, d] of piste.notes) {
        const debut = Math.round(p * dp * TAUX);
        if (def.onde === 'bruit') batterie(sortie, debut, h, def.gain);
        else tonalite(sortie, debut, d * dp, frequence(h), def);
      }
    });
    // Limiteur doux : quand toutes les pistes jouent fort ensemble, le son s'arrondit au lieu de saturer.
    const k = Math.tanh(1.2);
    for (let i = 0; i < sortie.length; i++) sortie[i] = Math.max(-1, Math.min(1, Math.tanh(1.2 * sortie[i]) / k * 0.9));
    return sortie;
  }

  function tonalite(sortie, debut, tenue, f, def) {
    const attaque = 0.004, relache = 0.04;
    const n = Math.min(sortie.length - debut, Math.ceil((tenue + relache) * TAUX));
    let phase = 0;
    for (let k = 0; k < n; k++) {
      const t = k / TAUX;
      phase = (phase + f / TAUX) % 1;
      let v;
      if (def.onde === 'triangle') {
        const tri = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
        v = Math.round((tri + 1) * 7.5) / 7.5 - 1; // 16 paliers, comme la puce d'une console
      } else {
        v = phase < def.rapport ? 1 : -1;
      }
      // Enveloppe : attaque brève, petite décroissance, puis extinction après la note.
      let e = t < attaque ? t / attaque : 0.75 + 0.25 * Math.exp(-(t - attaque) * 12);
      if (t > tenue) e *= Math.max(0, 1 - (t - tenue) / relache);
      sortie[debut + k] += v * e * def.gain;
    }
  }

  // Batterie : 0 = grosse caisse, 1 = caisse claire, 2 = charleston (bruit pseudo-aléatoire d'une console).
  function batterie(sortie, debut, sorte, gain) {
    const longueur = [0.18, 0.14, 0.05][sorte] || 0.1;
    const n = Math.min(sortie.length - debut, Math.ceil(longueur * TAUX));
    let registre = 1, phase = 0, precedent = 0, bruit = 0;
    for (let k = 0; k < n; k++) {
      const t = k / TAUX;
      if (k % 2 === 0) { // registre à décalage sur 15 bits
        const bit = (registre ^ (registre >> 1)) & 1;
        registre = (registre >> 1) | (bit << 14);
        bruit = registre & 1 ? 1 : -1;
      }
      let v;
      if (sorte === 0) {
        phase = (phase + (45 + 110 * Math.exp(-t * 30)) / TAUX) % 1;
        v = Math.sin(phase * Math.PI * 2) * Math.exp(-t * 18);
      } else if (sorte === 1) {
        phase = (phase + 185 / TAUX) % 1;
        v = (bruit * 0.7 + (phase < 0.5 ? 0.3 : -0.3)) * Math.exp(-t * 25);
      } else {
        v = (bruit - precedent) * 0.5 * Math.exp(-t * 70); // garde surtout les aigus
        precedent = bruit;
      }
      sortie[debut + k] += v * gain * 1.4;
    }
  }

  // WAV mono, 8 bits non signés : authentiquement « 8 bits », et deux fois plus léger que du 16 bits.
  function enWav(echantillons) {
    const octets = new Uint8Array(44 + echantillons.length);
    const vue = new DataView(octets.buffer);
    const texte = (pos, s) => [...s].forEach((c, i) => octets[pos + i] = c.charCodeAt(0));
    texte(0, 'RIFF'); vue.setUint32(4, 36 + echantillons.length, true); texte(8, 'WAVE');
    texte(12, 'fmt '); vue.setUint32(16, 16, true); vue.setUint16(20, 1, true); vue.setUint16(22, 1, true);
    vue.setUint32(24, TAUX, true); vue.setUint32(28, TAUX, true); vue.setUint16(32, 1, true); vue.setUint16(34, 8, true);
    texte(36, 'data'); vue.setUint32(40, echantillons.length, true);
    for (let i = 0; i < echantillons.length; i++) octets[44 + i] = Math.round((echantillons[i] + 1) * 127.5);
    let binaire = '';
    for (let i = 0; i < octets.length; i += 0x8000) binaire += String.fromCharCode.apply(null, octets.subarray(i, i + 0x8000));
    return 'data:audio/wav;base64,' + btoa(binaire);
  }

  // ---------------------------------------------------------------- Fenêtre du studio

  const etat = { musique: null, piste: 0, surFin: null, modifie: false, lecture: null, glisse: null, construit: false };
  const $ = id => document.getElementById(id);

  function el(tag, classe, texte) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texte !== undefined) e.textContent = texte;
    return e;
  }

  function construire() {
    const voile = el('div', 'voile modale');
    voile.id = 'studio-musique';
    voile.hidden = true;
    voile.innerHTML = `
      <div class="info-boite studio-boite">
        <h2>🎹 Studio de musique 8 bits</h2>
        <div class="studio-barre">
          <div id="studio-pistes" class="studio-pistes"></div>
          <label>Tempo <input id="studio-tempo" type="number" min="60" max="240" step="5"></label>
          <label>Mesures <select id="studio-mesures">
            <option value="1">1</option><option value="2">2</option><option value="4">4</option><option value="8">8</option>
          </select></label>
        </div>
        <div class="studio-barre">
          <button id="studio-jouer" class="studio-jouer">▶ Écouter</button>
          <label class="studio-case"><input id="studio-boucle" type="checkbox" checked> en boucle</label>
          <span class="studio-espace"></span>
          <button id="studio-exemple" class="secondaire-petit">🎲 Mélodie d'exemple</button>
          <button id="studio-effacer" class="secondaire-petit">🗑️ Effacer la piste</button>
        </div>
        <div class="studio-grille">
          <canvas id="studio-touches"></canvas>
          <div id="studio-defile" class="studio-defile"><canvas id="studio-notes"></canvas></div>
        </div>
        <p class="info-petit">Cliquez pour poser une note, glissez vers la droite pour l'allonger, cliquez sur une note pour l'effacer.
          Les notes des autres pistes sont affichées en transparence. Barre d'espace : écouter / arrêter.</p>
        <div class="studio-bas">
          <label>Nom de la musique <input id="studio-nom" maxlength="40"></label>
          <div class="info-actions">
            <button id="studio-annuler" class="secondaire">Annuler</button>
            <button id="studio-garder">Garder cette musique</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(voile);

    $('studio-tempo').addEventListener('change', () => {
      etat.musique.tempo = Math.min(240, Math.max(60, Math.round(Number($('studio-tempo').value) || 120)));
      $('studio-tempo').value = etat.musique.tempo;
      modifie();
    });
    $('studio-mesures').addEventListener('change', () => {
      etat.musique.mesures = Number($('studio-mesures').value);
      modifie();
      dessiner();
    });
    $('studio-jouer').addEventListener('click', basculerLecture);
    $('studio-boucle').addEventListener('change', () => { if (etat.lecture) etat.lecture.source.loop = $('studio-boucle').checked; });
    $('studio-exemple').addEventListener('click', () => {
      if (aDesNotes() && !confirm('Remplacer toute la musique par la mélodie d\'exemple ?')) return;
      etat.musique = musiqueExemple();
      modifie();
      afficherReglages();
    });
    $('studio-effacer').addEventListener('click', () => {
      const piste = etat.musique.pistes[etat.piste];
      if (!piste.notes.length || !confirm(`Effacer toutes les notes de la piste « ${PISTES[etat.piste].nom} » ?`)) return;
      piste.notes = [];
      modifie();
      dessiner();
    });
    $('studio-annuler').addEventListener('click', () => fermer(false));
    $('studio-garder').addEventListener('click', () => fermer(true));
    voile.addEventListener('keydown', e => {
      if (e.key === 'Escape') fermer(false);
      if (e.key === ' ' && !/INPUT|SELECT|BUTTON/.test(e.target.tagName)) { e.preventDefault(); basculerLecture(); }
    });

    const grille = $('studio-notes');
    grille.addEventListener('pointerdown', appui);
    grille.addEventListener('pointermove', glisser);
    grille.addEventListener('pointerup', () => { etat.glisse = null; });
    grille.addEventListener('pointercancel', () => { etat.glisse = null; });
    $('studio-defile').addEventListener('scroll', () => dessinerTouches());
    etat.construit = true;
  }

  const aDesNotes = () => etat.musique.pistes.some(p => p.notes.length);

  function modifie() {
    etat.modifie = true;
    // On entend tout de suite le changement, sans revenir au début.
    if (etat.lecture) {
      const t = positionLecture(etat.lecture);
      arreterLecture();
      demarrerLecture(t);
    }
  }

  // options : { musique, nom, modification } ; surFin({ nom, musique, donnees }) si on garde la musique.
  function ouvrir(options, surFin) {
    if (!etat.construit) construire();
    etat.musique = options.musique ? structuredClone(options.musique) : musiqueVide();
    while (etat.musique.pistes.length < PISTES.length) etat.musique.pistes.push({ notes: [] });
    etat.surFin = surFin;
    etat.modifie = false;
    etat.piste = 0;
    $('studio-nom').value = options.nom || 'musique';
    $('studio-nom').disabled = !!options.modification;
    $('studio-nom').title = options.modification ? 'Pour renommer la musique, utilisez « ✏️ Renommer » dans le Sommaire.' : '';
    $('studio-musique').hidden = false;
    afficherReglages();
    $('studio-jouer').focus();
  }

  function afficherReglages() {
    $('studio-tempo').value = etat.musique.tempo;
    $('studio-mesures').value = String(etat.musique.mesures);
    $('studio-pistes').replaceChildren(...PISTES.map((p, i) => {
      const b = el('button', 'studio-piste' + (i === etat.piste ? ' actif' : ''), `${p.icone} ${p.nom}`);
      b.style.setProperty('--couleur-piste', p.couleur);
      b.addEventListener('click', () => { etat.piste = i; afficherReglages(); });
      return b;
    }));
    dessiner();
  }

  function fermer(garder) {
    if (garder) {
      if (!aDesNotes()) return alert('La musique est vide : posez au moins une note dans la grille.');
      const nom = $('studio-nom').value.trim();
      if (!nom) return alert('Donnez un nom à la musique.');
      arreterLecture();
      etat.surFin({ nom, musique: structuredClone(etat.musique), donnees: enWav(rendre(etat.musique)) });
    } else if (etat.modifie && aDesNotes() && !confirm('Fermer le studio sans garder les changements ?')) {
      return;
    }
    arreterLecture();
    $('studio-musique').hidden = true;
  }

  // ---- Grille ----

  const pisteCourante = () => PISTES[etat.piste];
  const nombrePas = () => etat.musique.mesures * PAS_PAR_MESURE;

  function dessiner() {
    const def = pisteCourante(), lignes = def.rangees.length;
    const L = nombrePas() * LARGEUR_CASE, H = lignes * HAUTEUR_LIGNE;
    const toile = $('studio-notes');
    preparer(toile, L, H);
    const ctx = toile.getContext('2d');
    const y = rangee => (lignes - 1 - rangee) * HAUTEUR_LIGNE;

    // Fond : touches noires plus sombres, une ligne par temps, une ligne forte par mesure.
    for (let r = 0; r < lignes; r++) {
      const h = def.rangees[r];
      ctx.fillStyle = def.onde !== 'bruit' && [1, 3, 6, 8, 10].includes(h % 12) ? '#e8ebf2' : (r % 2 ? '#f8f9fc' : '#ffffff');
      ctx.fillRect(0, y(r), L, HAUTEUR_LIGNE);
    }
    for (let p = 0; p <= nombrePas(); p++) {
      ctx.fillStyle = p % PAS_PAR_MESURE === 0 ? '#94a3b8' : p % 4 === 0 ? '#cbd5e1' : '#eef0f5';
      ctx.fillRect(p * LARGEUR_CASE - (p % PAS_PAR_MESURE === 0 ? 1 : 0), 0, p % PAS_PAR_MESURE === 0 ? 2 : 1, H);
    }

    // Les autres pistes, en transparence (si leurs notes tombent dans les rangées affichées).
    etat.musique.pistes.forEach((piste, i) => {
      if (i === etat.piste || PISTES[i].onde === 'bruit' || def.onde === 'bruit') return;
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = PISTES[i].couleur;
      for (const [p, h, d] of piste.notes) {
        const r = def.rangees.indexOf(h);
        if (r >= 0) ctx.fillRect(p * LARGEUR_CASE + 1, y(r) + 2, d * LARGEUR_CASE - 2, HAUTEUR_LIGNE - 4);
      }
      ctx.globalAlpha = 1;
    });

    ctx.fillStyle = def.couleur;
    ctx.strokeStyle = 'rgba(0,0,0,.35)';
    for (const [p, h, d] of etat.musique.pistes[etat.piste].notes) {
      const r = def.rangees.indexOf(h);
      if (r < 0 || p >= nombrePas()) continue;
      ctx.beginPath();
      ctx.roundRect(p * LARGEUR_CASE + 1, y(r) + 1, Math.min(d, nombrePas() - p) * LARGEUR_CASE - 2, HAUTEUR_LIGNE - 2, 3);
      ctx.fill();
      ctx.stroke();
    }

    // Curseur de lecture.
    if (etat.lecture && etat.lecture.pas >= 0) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(etat.lecture.pas * LARGEUR_CASE, 0, 2, H);
    }
    dessinerTouches();
  }

  function dessinerTouches() {
    const def = pisteCourante(), lignes = def.rangees.length;
    const toile = $('studio-touches');
    const largeur = def.onde === 'bruit' ? 100 : 54;
    preparer(toile, largeur, lignes * HAUTEUR_LIGNE);
    const ctx = toile.getContext('2d');
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.textBaseline = 'middle';
    for (let r = 0; r < lignes; r++) {
      const h = def.rangees[r], haut = (lignes - 1 - r) * HAUTEUR_LIGNE;
      const noire = def.onde !== 'bruit' && [1, 3, 6, 8, 10].includes(h % 12);
      ctx.fillStyle = noire ? '#334155' : '#ffffff';
      ctx.fillRect(0, haut, largeur, HAUTEUR_LIGNE);
      ctx.fillStyle = '#d5dbe5';
      ctx.fillRect(0, haut + HAUTEUR_LIGNE - 1, largeur, 1);
      ctx.fillStyle = noire ? '#ffffff' : (h % 12 === 0 ? '#1f2937' : '#6b7280');
      ctx.fillText(def.libelles ? def.libelles[h] : nomNote(h), 6, haut + HAUTEUR_LIGNE / 2);
    }
  }

  function preparer(toile, largeur, hauteur) {
    const ratio = window.devicePixelRatio || 1;
    toile.width = Math.round(largeur * ratio);
    toile.height = Math.round(hauteur * ratio);
    toile.style.width = largeur + 'px';
    toile.style.height = hauteur + 'px';
    toile.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function caseSous(e) {
    const r = $('studio-notes').getBoundingClientRect();
    const lignes = pisteCourante().rangees.length;
    return {
      pas: Math.max(0, Math.min(nombrePas() - 1, Math.floor((e.clientX - r.left) / LARGEUR_CASE))),
      rangee: lignes - 1 - Math.max(0, Math.min(lignes - 1, Math.floor((e.clientY - r.top) / HAUTEUR_LIGNE)))
    };
  }

  function appui(e) {
    const { pas, rangee } = caseSous(e);
    const def = pisteCourante(), h = def.rangees[rangee];
    const liste = etat.musique.pistes[etat.piste].notes;
    const touchee = liste.findIndex(([p, hn, d]) => hn === h && pas >= p && pas < p + d);
    if (touchee >= 0) {
      liste.splice(touchee, 1);
    } else {
      const note = [pas, h, 1];
      liste.push(note);
      if (def.onde !== 'bruit') {
        etat.glisse = note;
        e.target.setPointerCapture(e.pointerId);
      }
      ecouterNote(h);
    }
    modifie();
    dessiner();
  }

  function glisser(e) {
    if (!etat.glisse) return;
    const d = Math.max(1, caseSous(e).pas - etat.glisse[0] + 1);
    if (d !== etat.glisse[2]) { etat.glisse[2] = d; dessiner(); }
  }

  // ---- Écoute ----

  function contexte() {
    return BlocRuntime.contexteAudio();
  }

  function jouerTampon(echantillons, boucle, depuis = 0) {
    const ctx = contexte();
    const tampon = ctx.createBuffer(1, echantillons.length, TAUX);
    tampon.copyToChannel(echantillons, 0);
    const source = ctx.createBufferSource();
    source.buffer = tampon;
    source.loop = boucle;
    if (boucle) source.loopEnd = duree(etat.musique) - TRAINE;
    source.connect(ctx.destination);
    source.start(0, depuis);
    return source;
  }

  function ecouterNote(h) {
    const m = musiqueVide();
    m.mesures = 1;
    m.pistes[etat.piste].notes.push([0, h, 2]);
    const echantillons = rendre(m).subarray(0, Math.ceil((2 * dureePas(m) + 0.15) * TAUX));
    jouerTampon(echantillons, false);
  }

  function basculerLecture() {
    if (etat.lecture) arreterLecture(); else demarrerLecture();
  }

  // Position (en secondes) dans la musique, en tenant compte de la boucle.
  function positionLecture(lecture) {
    const t = contexte().currentTime - lecture.depart;
    return lecture.source.loop ? t % (duree(etat.musique) - TRAINE) : t;
  }

  function demarrerLecture(depuis = 0) {
    if (!aDesNotes()) return;
    depuis = depuis < duree(etat.musique) - TRAINE ? depuis : 0;
    const source = jouerTampon(rendre(etat.musique), $('studio-boucle').checked, depuis);
    const lecture = etat.lecture = { source, depart: contexte().currentTime - depuis, pas: -1, animation: 0 };
    source.onended = () => { if (etat.lecture === lecture) arreterLecture(); };
    $('studio-jouer').textContent = '⏹ Arrêter';
    const dp = dureePas(etat.musique);
    const suivre = () => {
      if (etat.lecture !== lecture) return;
      const t = positionLecture(lecture);
      const pas = Math.min(nombrePas(), Math.floor(t / dp));
      if (pas !== lecture.pas) {
        lecture.pas = pas;
        dessiner();
        // Le curseur reste visible : la grille défile avec lui.
        const defile = $('studio-defile'), x = pas * LARGEUR_CASE;
        if (x < defile.scrollLeft || x > defile.scrollLeft + defile.clientWidth - 40) defile.scrollLeft = Math.max(0, x - 40);
      }
      lecture.animation = requestAnimationFrame(suivre);
    };
    suivre();
  }

  function arreterLecture() {
    const lecture = etat.lecture;
    if (!lecture) return;
    etat.lecture = null;
    cancelAnimationFrame(lecture.animation);
    try { lecture.source.stop(); } catch (e) { /* déjà fini */ }
    $('studio-jouer').textContent = '▶ Écouter';
    dessiner();
  }

  window.StudioMusique = { ouvrir, rendre, enWav, musiqueExemple, TAUX };
})();
