// Moteur d'exécution de BlocStudio.
// Ce code sert à la fois dans l'éditeur (bouton ▶ Exécuter) et dans les
// programmes exportés : il est recopié tel quel via BlocRuntimeFactory.toString().
function BlocRuntimeFactory() {
  const COULEURS = {
    rouge: '#e53935', vert: '#43a047', bleu: '#1e88e5', jaune: '#fdd835',
    orange: '#fb8c00', violet: '#8e24aa', rose: '#ec407a', noir: '#000000',
    blanc: '#ffffff', gris: '#9e9e9e', marron: '#6d4c41', cyan: '#00acc1',
    transparent: 'transparent'
  };

  const STYLE = `
    .bs-ctrl { box-sizing: border-box; margin: 0; font-family: inherit; }
    .bs-bouton { cursor: pointer; border: 1px solid #adadad; border-radius: 4px;
      background: #e1e1e1; }
    .bs-bouton:hover:not(:disabled) { filter: brightness(0.95); }
    .bs-etiquette { overflow: hidden; white-space: pre-wrap; line-height: 1.3; }
    .bs-zonetexte { border: 1px solid #7a7a7a; padding: 2px 6px; background: #fff; }
    .bs-casecocher { display: flex; align-items: center; gap: 6px; cursor: pointer;
      user-select: none; }
    .bs-casecocher input { margin: 0; width: 16px; height: 16px; }
    .bs-listederoulante { border: 1px solid #7a7a7a; padding: 2px 4px; background: #fff; }
    .bs-navigateur { border: 1px solid #94a3b8; background: #fff; }
    video.bs-video { background: #000; object-fit: contain; }
    .bs-apercu { display: flex; flex-direction: column; overflow: hidden; color: #475569; }
    .bs-apercu > div:first-child { padding: 4px 8px; background: #e8ebf0; border-bottom: 1px solid #cbd5e1;
      font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bs-apercu > div:last-child { flex: 1; display: flex; align-items: center; justify-content: center;
      font-size: 40px; opacity: .35; }
    .bs-onglets { display: flex; flex-direction: column; }
    .bs-onglets-titres { display: flex; flex: none; gap: 2px; padding: 0 4px; overflow: hidden; }
    .bs-onglets-titres button { flex: none; margin-top: 3px; padding: 4px 12px; border: 1px solid #a3acb9;
      border-bottom: 0; border-radius: 6px 6px 0 0; background: #e8ebf0; color: inherit; font: inherit; cursor: pointer; }
    .bs-onglets-titres button.bs-actif { position: relative; top: 1px; margin-top: 0; padding-bottom: 6px; background: #fff; }
    .bs-onglets-corps { flex: 1; border: 1px solid #a3acb9; border-radius: 0 6px 6px 6px; background: #fff; }
    .bs-hors-page { display: none !important; }
    .bs-interrupteur { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
    .bs-interrupteur input { position: absolute; opacity: 0; width: 0; height: 0; margin: 0; }
    .bs-interrupteur i { position: relative; flex: none; width: 38px; height: 22px; border-radius: 11px;
      background: #cbd5e1; transition: background .15s; }
    .bs-interrupteur i::after { content: ''; position: absolute; left: 3px; top: 3px; width: 16px; height: 16px;
      border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.3); transition: transform .15s; }
    .bs-interrupteur input:checked + i { background: #16a34a; }
    .bs-interrupteur input:checked + i::after { transform: translateX(16px); }
    .bs-interrupteur input:focus-visible + i { outline: 2px solid #4f46e5; outline-offset: 2px; }
    .bs-lien { display: flex; align-items: center; text-decoration: underline; cursor: pointer; overflow: hidden; }
    .bs-boutonradio { display: flex; align-items: center; gap: 6px; cursor: pointer;
      user-select: none; }
    .bs-boutonradio input { margin: 0; width: 16px; height: 16px; }
    .bs-cadre { border: 1px solid #a3acb9; border-radius: 6px; padding: 0 8px;
      pointer-events: none; }
    .bs-cadre legend { padding: 0 4px; }
    textarea.bs-zonetexte { padding: 4px 6px; resize: none; line-height: 1.35; }
    .bs-zoneliste { border: 1px solid #7a7a7a; background: #fff; padding: 2px 0; }
    .bs-zoneliste option { padding: 3px 8px; }
    .bs-zoneliste option:checked { background: #4f46e5 linear-gradient(#4f46e5, #4f46e5); color: #fff; }
    .bs-selecteurnombre { border: 1px solid #7a7a7a; padding: 2px 4px 2px 8px; background: #fff; }
    .bs-curseur { accent-color: #4f46e5; cursor: pointer; }
    .bs-barreprogression { background: #e5e7eb; border: 1px solid #cbd5e1; border-radius: 4px;
      overflow: hidden; }
    .bs-barre { height: 100%; width: 0; transition: width .2s ease-out; }
    .bs-zonedessin { border: 1px solid #94a3b8; background: #fff; touch-action: none;
      cursor: crosshair; }
    .bs-tableau { border: 1px solid #7a7a7a; background: #fff; overflow: auto; }
    .bs-tableau table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: inherit; }
    .bs-tableau th { position: sticky; top: 0; padding: 4px 8px; background: #e8ebf0; text-align: left;
      font-weight: 600; border-bottom: 1px solid #c3c9d2; overflow: hidden; text-overflow: ellipsis;
      white-space: nowrap; }
    .bs-tableau td { padding: 3px 8px; border-bottom: 1px solid #eef0f3; overflow: hidden;
      text-overflow: ellipsis; white-space: nowrap; }
    .bs-tableau tbody tr { cursor: pointer; }
    .bs-tableau tbody tr:hover { background: #eef2ff; }
    .bs-tableau tbody tr.bs-choisie { background: #4f46e5; color: #fff; }
    .bs-date { border: 1px solid #7a7a7a; padding: 2px 6px; background: #fff; }
    .bs-selecteurcouleur { padding: 1px 2px; border: 1px solid #7a7a7a; background: #fff; cursor: pointer; }

    .bs-menus { position: relative; z-index: 10; display: flex; height: 26px; box-sizing: border-box;
      background: #fff; border-bottom: 1px solid #e2e5ea; font: 13px "Segoe UI", system-ui, sans-serif;
      color: #1f2937; user-select: none; }
    .bs-menu { position: relative; }
    .bs-menu-titre { display: flex; align-items: center; height: 100%; padding: 0 10px; cursor: default; }
    .bs-menu-titre:hover, .bs-menu.bs-ouvert > .bs-menu-titre { background: #e5e7eb; }
    .bs-menu-liste { display: none; position: absolute; top: 100%; left: 0; min-width: 170px;
      padding: 4px 0; background: #fff; border: 1px solid #cbd5e1; box-shadow: 0 8px 20px rgba(0,0,0,.15); }
    .bs-menu.bs-ouvert > .bs-menu-liste { display: block; }
    .bs-menu-item { padding: 5px 24px; white-space: nowrap; cursor: default; }
    .bs-menu-item:hover { background: #4f46e5; color: #fff; }
    .bs-menu-sep { height: 1px; margin: 4px 0; background: #e2e5ea; }
    .bs-inactif { color: #9ca3af; pointer-events: none; }

    .bs-dlg-voile { position: fixed; inset: 0; z-index: 5000; display: flex;
      align-items: center; justify-content: center; background: rgba(15,23,42,.35);
      font-family: "Segoe UI", system-ui, sans-serif; animation: bs-fondu .15s ease-out; }
    .bs-dlg { min-width: 300px; max-width: min(460px, 92vw); background: #fff; color: #1f2937;
      border-radius: 10px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,.3);
      animation: bs-apparition .18s ease-out; }
    .bs-dlg-titre { padding: 8px 14px; background: #e2e8f0; font-size: 13px; color: #334155; }
    .bs-dlg-corps { display: flex; gap: 14px; padding: 18px 18px 8px; }
    .bs-dlg-icone { flex-shrink: 0; width: 38px; height: 38px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 20px; font-weight: 700; }
    .bs-dlg-info { background: #2563eb; }
    .bs-dlg-succes { background: #16a34a; }
    .bs-dlg-attention { background: #f59e0b; }
    .bs-dlg-erreur { background: #dc2626; }
    .bs-dlg-question { background: #4f46e5; }
    .bs-dlg-contenu { flex: 1; min-width: 0; }
    .bs-dlg-texte { padding-top: 8px; font-size: 15px; line-height: 1.4;
      white-space: pre-wrap; overflow-wrap: anywhere; }
    .bs-dlg-saisie { width: 100%; box-sizing: border-box; margin-top: 12px; padding: 7px 9px;
      border: 1px solid #94a3b8; border-radius: 6px; font: inherit; font-size: 15px; }
    .bs-dlg-saisie:focus { outline: 2px solid #a5b4fc; border-color: #4f46e5; }
    .bs-dlg-saisie.bs-dlg-invalide { background: #fef2f2; border-color: #dc2626; }
    .bs-dlg-aide { min-height: 18px; margin-top: 4px; font-size: 12px; color: #dc2626; }
    .bs-dlg-choix { display: flex; flex-direction: column; gap: 6px; margin: 12px 0 4px; }
    .bs-dlg-choix button { padding: 8px 12px; text-align: left; border: 1px solid #c7d2fe;
      border-radius: 6px; background: #eef2ff; font: inherit; cursor: pointer; }
    .bs-dlg-choix button:hover, .bs-dlg-choix button:focus { background: #4f46e5; color: #fff; }
    .bs-dlg-pied { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 18px 16px; }
    .bs-dlg-pied button { min-width: 84px; padding: 7px 14px; border: 1px solid #cbd5e1;
      border-radius: 6px; background: #f1f5f9; font: inherit; cursor: pointer; }
    .bs-dlg-pied button:hover { background: #e2e8f0; }
    .bs-dlg-pied .bs-dlg-principal { background: #4f46e5; border-color: #4f46e5; color: #fff; }
    .bs-dlg-pied .bs-dlg-principal:hover { background: #4338ca; }
    .bs-fenetre { position: fixed; z-index: 4000; display: flex; flex-direction: column;
      border: 1px solid #94a3b8; border-radius: 8px; overflow: hidden; background: #fff;
      box-shadow: 0 16px 40px rgba(15,23,42,.3); animation: bs-apparition .15s ease-out; }
    .bs-fenetre-titre { display: flex; align-items: center; justify-content: space-between; height: 30px;
      padding: 0 4px 0 10px; background: #e2e8f0; font: 13px "Segoe UI", system-ui, sans-serif; color: #1f2937;
      cursor: move; user-select: none; }
    .bs-fenetre-fermer { width: 30px; height: 24px; border: 0; border-radius: 4px; background: transparent;
      font-size: 14px; cursor: pointer; }
    .bs-fenetre-fermer:hover { background: #dc2626; color: #fff; }
    .bs-fenetre-voile { position: fixed; inset: 0; background: rgba(15,23,42,.3); animation: bs-fondu .15s ease-out; }
    @keyframes bs-fondu { from { opacity: 0; } }
    @keyframes bs-apparition { from { opacity: 0; transform: scale(.94); } }
  `;

  const ICONES = { info: 'i', succes: '✓', attention: '!', erreur: '✕', question: '?' };

  // Affiche proprement une valeur (les listes deviennent « a, b, c »).
  function enTexte(v) {
    if (Array.isArray(v)) return v.map(enTexte).join(', ');
    if (v === true) return 'vrai';
    if (v === false) return 'faux';
    return v === undefined || v === null ? '' : String(v);
  }

  const IMAGE_VIDE = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
    '<rect width="100" height="100" rx="8" fill="#e3e8ef"/>' +
    '<circle cx="34" cy="36" r="10" fill="#9fb0c4"/>' +
    '<path d="M10 82 L38 52 L56 70 L70 58 L90 82 Z" fill="#9fb0c4"/></svg>');

  function injecterStyle() {
    if (document.getElementById('bs-runtime-style')) return;
    const s = document.createElement('style');
    s.id = 'bs-runtime-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function couleur(valeur) {
    const v = String(valeur).trim().toLowerCase();
    return COULEURS[v] || valeur;
  }

  // ---- Menus ----
  // Texte saisi dans les propriétés de la fenêtre : un menu par ligne,
  // ses éléments en dessous, décalés d'au moins un espace ; « - » = séparateur.
  const HAUTEUR_MENUS = 26;

  function lireMenus(texte) {
    const menus = [];
    for (const ligne of String(texte || '').split('\n')) {
      const titre = ligne.trim();
      if (!titre) continue;
      const parent = menus[menus.length - 1];
      if (/^\s/.test(ligne) && parent) {
        parent.items.push(titre === '-' ? { separateur: true } : { titre, chemin: parent.titre + ' › ' + titre });
      } else if (titre !== '-') {
        menus.push({ titre, chemin: titre, items: [] });
      }
    }
    return menus;
  }

  // Chemins des menus que l'on peut choisir (« Fichier › Ouvrir », ou un menu sans éléments).
  function cheminsMenus(texte) {
    const chemins = [];
    for (const m of lireMenus(texte)) {
      if (!m.items.length) chemins.push(m.chemin);
      for (const it of m.items) if (!it.separateur) chemins.push(it.chemin);
    }
    return chemins;
  }

  function creerBarreMenus(menus, surChoix) {
    injecterStyle();
    const barre = document.createElement('div');
    barre.className = 'bs-menus';
    let ouvert = null;
    const fermer = () => { if (ouvert) ouvert.classList.remove('bs-ouvert'); ouvert = null; };
    const ouvrir = menu => { fermer(); menu.classList.add('bs-ouvert'); ouvert = menu; };

    for (const m of menus) {
      const menu = document.createElement('div');
      menu.className = 'bs-menu';
      const titre = document.createElement('div');
      titre.className = 'bs-menu-titre';
      titre.textContent = m.titre;
      titre.dataset.chemin = m.chemin;
      menu.appendChild(titre);
      if (m.items.length) {
        const liste = document.createElement('div');
        liste.className = 'bs-menu-liste';
        for (const it of m.items) {
          const e = document.createElement('div');
          if (it.separateur) {
            e.className = 'bs-menu-sep';
          } else {
            e.className = 'bs-menu-item';
            e.textContent = it.titre;
            e.dataset.chemin = it.chemin;
            e.addEventListener('click', ev => { ev.stopPropagation(); fermer(); surChoix(it.chemin); });
          }
          liste.appendChild(e);
        }
        menu.appendChild(liste);
      }
      titre.addEventListener('click', ev => {
        ev.stopPropagation();
        if (!m.items.length) { fermer(); surChoix(m.chemin); }
        else if (ouvert === menu) fermer();
        else ouvrir(menu);
      });
      // Comme sous Windows : un menu ouvert, survoler les autres les ouvre.
      titre.addEventListener('pointerenter', () => { if (ouvert && ouvert !== menu && m.items.length) ouvrir(menu); });
      barre.appendChild(menu);
    }
    const ailleurs = e => {
      if (!barre.isConnected) document.removeEventListener('pointerdown', ailleurs, true);
      else if (!barre.contains(e.target)) fermer();
    };
    document.addEventListener('pointerdown', ailleurs, true);
    return barre;
  }

  // ---- Tableaux ----
  function rendreTableau(el, d) {
    const nbColonnes = Math.max(d.colonnes.length, ...d.lignes.map(l => l.length), 1);
    const table = document.createElement('table');
    const tr = table.appendChild(document.createElement('thead')).appendChild(document.createElement('tr'));
    for (let i = 0; i < nbColonnes; i++) {
      tr.appendChild(document.createElement('th')).textContent = d.colonnes[i] ?? '';
    }
    const corps = table.appendChild(document.createElement('tbody'));
    d.lignes.forEach((ligne, n) => {
      const r = corps.appendChild(document.createElement('tr'));
      if (n === d.choisie) r.className = 'bs-choisie';
      for (let i = 0; i < nbColonnes; i++) {
        const td = r.appendChild(document.createElement('td'));
        td.textContent = enTexte(ligne[i]);
        td.title = td.textContent;
      }
    });
    el.replaceChildren(table);
  }

  // Une cellule qui ressemble à un nombre est rendue comme un nombre (pour pouvoir calculer).
  function valeurCellule(v) {
    const s = enTexte(v).trim();
    return /^-?\d+([.,]\d+)?$/.test(s) ? Number(s.replace(',', '.')) : enTexte(v);
  }

  // Format CSV « à la française » (séparateur ;), lisible par Excel et LibreOffice.
  function versCsv(lignes) {
    const champ = v => {
      const s = enTexte(v);
      return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    return lignes.map(l => l.map(champ).join(';')).join('\r\n');
  }

  function depuisCsv(texte) {
    texte = String(texte ?? '').replace(/^﻿/, '');
    const separateur = (texte.split('\n')[0].match(/;/g) || []).length ||
      !(texte.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
    const lignes = [];
    let ligne = [], champ = '', guillemets = false;
    for (let i = 0; i < texte.length; i++) {
      const ch = texte[i];
      if (guillemets) {
        if (ch === '"' && texte[i + 1] === '"') { champ += '"'; i++; }
        else if (ch === '"') guillemets = false;
        else champ += ch;
      } else if (ch === '"') guillemets = true;
      else if (ch === separateur) { ligne.push(champ); champ = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && texte[i + 1] === '\n') i++;
        ligne.push(champ); lignes.push(ligne); ligne = []; champ = '';
      } else champ += ch;
    }
    if (champ !== '' || ligne.length) { ligne.push(champ); lignes.push(ligne); }
    return lignes.filter(l => l.some(c => c.trim() !== ''));
  }

  // ---- Dates ----
  // Les dates s'affichent « jj/mm/aaaa » ; le champ HTML utilise « aaaa-mm-jj ».
  function dateFrancaise(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
  }

  function dateIso(texte) {
    const s = enTexte(texte).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s);
    return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : '';
  }

  function aujourdhuiIso() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ---- Sons (synthétisés : aucun fichier à fournir) ----
  let audio = null;
  function contexteAudio() {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }

  // `sortie` : nœud vers lequel envoyer le son (réglage de volume) ; haut-parleurs par défaut.
  function bip(frequence, debut, duree, forme, sortie) {
    contexteAudio();
    const t = audio.currentTime + debut;
    const osc = audio.createOscillator();
    const volume = audio.createGain();
    osc.type = forme || 'sine';
    osc.frequency.value = frequence;
    volume.gain.setValueAtTime(0.0001, t);
    volume.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
    volume.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    osc.connect(volume).connect(sortie || audio.destination);
    osc.start(t);
    osc.stop(t + duree + 0.02);
  }

  // Chaque son intégré renvoie sa durée en secondes.
  const SONS = {
    bip: s => { bip(880, 0, 0.15, 'square', s); return 0.15; },
    succes: s => { [523, 659, 784, 1047].forEach((f, i) => bip(f, i * 0.09, 0.2, 'triangle', s)); return 0.47; },
    erreur: s => { bip(220, 0, 0.18, 'sawtooth', s); bip(165, 0.16, 0.3, 'sawtooth', s); return 0.46; },
    piece: s => { bip(988, 0, 0.08, 'square', s); bip(1319, 0.08, 0.3, 'square', s); return 0.38; },
    clic: s => { bip(1500, 0, 0.03, 'square', s); return 0.03; },
    saut: s => { [300, 450, 600, 750].forEach((f, i) => bip(f, i * 0.04, 0.08, 'square', s)); return 0.2; }
  };

  // Sons importés (fichiers MP3, WAV… rangés dans le projet sous forme d'adresse « data: »).
  // Chacun n'est décodé qu'une fois, au premier usage.
  const sonsDecodes = new Map();
  function decoderSon(donnees) {
    if (!sonsDecodes.has(donnees)) {
      const binaire = atob(donnees.slice(donnees.indexOf(',') + 1));
      const octets = new Uint8Array(binaire.length);
      for (let i = 0; i < binaire.length; i++) octets[i] = binaire.charCodeAt(i);
      const promesse = contexteAudio().decodeAudioData(octets.buffer);
      promesse.catch(() => sonsDecodes.delete(donnees));
      sonsDecodes.set(donnees, promesse);
    }
    return sonsDecodes.get(donnees);
  }

  // [début, fin] en secondes de la partie à jouer d'un son importé.
  function extraitSon(son, tampon) {
    const debut = Math.min(Math.max(0, Number(son.debut) || 0), tampon.duration);
    const fin = Number(son.fin) > debut ? Math.min(Number(son.fin), tampon.duration) : tampon.duration;
    return fin - debut > 0.01 ? [debut, fin] : [0, tampon.duration];
  }

  // Fin de la boucle d'un son joué en boucle. Une musique du studio 8 bits se termine par
  // un peu de silence (pour que ses dernières notes s'éteignent) : en boucle, on reprend
  // au début dès la fin de sa dernière mesure, sans ce blanc.
  function finBoucle(son, debut, fin) {
    const m = son.musique;
    if (!m || son.fin > son.debut || son.debut > 0) return fin; // pas une musique, ou découpée à la main
    const mesures = Number(m.mesures) * 240 / Number(m.tempo); // 16 doubles croches par mesure
    return mesures > 0.05 ? Math.min(fin, debut + mesures) : fin;
  }

  // ---- Sprites ----
  // Un sprite de la bibliothèque du projet : { id, nom, taille, lisse, vitesse, costumes: [{ nom, donnees }] }.
  // Ses costumes sont des images carrées (taille × taille pixels) ; on anime un sprite
  // en passant d'un costume à l'autre.
  function afficherSprite(el, d, sprite) {
    const costumes = (sprite && sprite.costumes) || [];
    const costume = costumes[d.costume] || costumes[0];
    const src = costume ? costume.donnees : IMAGE_VIDE;
    if (el.getAttribute('src') !== src) el.src = src;
    el.style.imageRendering = sprite && !sprite.lisse ? 'pixelated' : '';
    // Effets : taille (en %, 100 = normale) et transparence (0 = opaque, 100 = invisible).
    const k = echelleSprite(d);
    el.style.transform = `rotate(${Number(d.rotation) || 0}deg)` + (k !== 1 ? ` scale(${k})` : '') + (d.miroir ? ' scaleX(-1)' : '');
    el.style.opacity = d.transparence > 0 ? String(1 - Math.min(100, Number(d.transparence)) / 100) : '';
  }
  const echelleSprite = d => d.taille === undefined || d.taille === '' ? 1 : Math.min(10, Math.max(0, Number(d.taille) || 0) / 100);

  // Partie non transparente d'un costume (en fractions de sa taille), pour que
  // « … touche … ? » ignore les bords vides de l'image. null : costume entièrement vide.
  const contours = new Map();
  function contourCostume(donnees) {
    if (contours.has(donnees)) return contours.get(donnees);
    contours.set(donnees, undefined); // pas encore calculé : on utilise tout le rectangle
    const img = new Image();
    img.onload = () => {
      const L = img.naturalWidth, H = img.naturalHeight;
      if (!L || !H) return;
      const c = document.createElement('canvas');
      c.width = L;
      c.height = H;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      const px = g.getImageData(0, 0, L, H).data;
      let x0 = L, y0 = H, x1 = -1, y1 = -1;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < L; x++) {
          if (px[(y * L + x) * 4 + 3] > 32) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            y1 = y;
          }
        }
      }
      contours.set(donnees, x1 < 0 ? null : { x0: x0 / L, y0: y0 / H, x1: (x1 + 1) / L, y1: (y1 + 1) / H });
    };
    img.src = donnees;
    return undefined;
  }

  // Contrôles sans apparence : ils se posent dans le concepteur mais ne s'affichent
  // pas dans la fenêtre du programme (comme le Timer de Visual Basic).
  const INVISIBLES = ['son', 'minuteur', 'basedonnees'];

  // Nom simple d'une touche du clavier (e.key) : 'gauche', 'entree', 'a', '7', 'f2'…
  const NOMS_TOUCHES = {
    ArrowLeft: 'gauche', ArrowRight: 'droite', ArrowUp: 'haut', ArrowDown: 'bas', ' ': 'espace',
    Enter: 'entree', Escape: 'echap', Backspace: 'effacement', Delete: 'suppr', Tab: 'tab',
    Shift: 'maj', Control: 'ctrl', Alt: 'alt'
  };
  function nomTouche(cle) {
    if (!cle) return '';
    if (NOMS_TOUCHES[cle]) return NOMS_TOUCHES[cle];
    return cle.length === 1 ? cle.toLowerCase() : cle.toLowerCase().replace(/^f(\d+)$/, 'f$1');
  }

  const NOTES = { do: 262, re: 294, mi: 330, fa: 349, sol: 392, la: 440, si: 494, do2: 523 };

  // Crée l'élément HTML correspondant à un contrôle.
  // `prefixe` isole les groupes de boutons radio de chaque exécution
  // (sinon ceux de l'éditeur et ceux du programme lancé se mélangeraient).
  // `sprites` : la bibliothèque de sprites du projet (pour les contrôles Sprite).
  function creerElement(c, prefixe, sprites) {
    injecterStyle();
    let el;
    switch (c.type) {
      case 'boutonradio': {
        el = document.createElement('label');
        const rond = document.createElement('input');
        rond.type = 'radio';
        rond.name = (prefixe || 'bs') + '-' + (c.groupe || 'groupe1');
        rond.checked = !!c.coche;
        const span = document.createElement('span');
        span.textContent = c.texte;
        el.append(rond, span);
        break;
      }
      case 'cadre': {
        el = document.createElement('fieldset');
        const titre = document.createElement('legend');
        titre.textContent = c.texte;
        el.appendChild(titre);
        break;
      }
      case 'zoneliste':
        el = document.createElement('select');
        el.size = 2; // affichage en liste ouverte ; la hauteur réelle vient du contrôle
        remplirListe(el, c.elements || []);
        break;
      case 'selecteurnombre':
        el = document.createElement('input');
        el.type = 'number';
        el.min = c.min ?? 0;
        el.max = c.max ?? 100;
        el.step = c.pas ?? 1;
        el.value = c.valeur ?? 0;
        break;
      case 'bouton':
        el = document.createElement('button');
        el.textContent = c.texte;
        break;
      case 'etiquette':
        el = document.createElement('div');
        el.textContent = c.texte;
        break;
      case 'zonetexte':
        if (c.multiligne) {
          el = document.createElement('textarea');
        } else {
          el = document.createElement('input');
          el.type = 'text';
        }
        el.value = c.texte;
        break;
      case 'casecocher': {
        el = document.createElement('label');
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.checked = !!c.coche;
        const span = document.createElement('span');
        span.textContent = c.texte;
        el.append(box, span);
        break;
      }
      case 'image':
        el = document.createElement('img');
        el.src = c.image || IMAGE_VIDE;
        el.alt = c.nom;
        el.draggable = false;
        break;
      case 'sprite':
        el = document.createElement('img');
        el.alt = c.nom;
        el.draggable = false;
        afficherSprite(el, { costume: Number(c.costume) || 0, rotation: c.rotation, miroir: c.miroir, taille: c.taille, transparence: c.transparence },
          (sprites || []).find(s => s.id === c.sprite));
        break;
      case 'listederoulante':
        el = document.createElement('select');
        remplirListe(el, c.elements || []);
        break;
      case 'curseur':
        el = document.createElement('input');
        el.type = 'range';
        el.min = c.min ?? 0;
        el.max = c.max ?? 100;
        el.value = c.valeur ?? 50;
        break;
      case 'barreprogression':
        el = document.createElement('div');
        el.appendChild(document.createElement('div')).className = 'bs-barre';
        majBarre(el, c);
        break;
      case 'zonedessin':
        el = document.createElement('canvas');
        preparerDessin(el, c.largeur, c.hauteur);
        break;
      case 'tableau':
        el = document.createElement('div');
        rendreTableau(el, { colonnes: c.colonnes || [], lignes: c.lignes || [], choisie: -1 });
        break;
      case 'date':
        el = document.createElement('input');
        el.type = 'date';
        el.value = c.date || aujourdhuiIso();
        break;
      case 'navigateur':
        // Dans le concepteur : un simple aperçu (pas de chargement à chaque modification).
        if (prefixe === 'design') {
          el = apercu('🌐', adresseWeb(c.adresse) || 'page vide');
          break;
        }
        el = document.createElement('iframe');
        el.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
        el.allowFullscreen = true;
        el.referrerPolicy = 'strict-origin-when-cross-origin';
        el.src = adresseWeb(c.adresse) || 'about:blank';
        break;
      case 'onglets':
        el = document.createElement('div');
        el.appendChild(document.createElement('div')).className = 'bs-onglets-titres';
        el.appendChild(document.createElement('div')).className = 'bs-onglets-corps';
        titresOnglets(el, c.pages || [], c.page || 0);
        break;
      case 'graphique':
        el = document.createElement('canvas');
        dessinerGraphique(el, c);
        break;
      case 'interrupteur': {
        el = document.createElement('label');
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.checked = !!c.coche;
        const span = document.createElement('span');
        span.textContent = c.texte;
        el.append(box, document.createElement('i'), span);
        break;
      }
      case 'lien':
        el = document.createElement('a');
        el.textContent = c.texte;
        el.target = '_blank';
        el.rel = 'noopener';
        if (adresseWeb(c.adresse)) el.href = adresseWeb(c.adresse);
        break;
      case 'video':
        if (prefixe === 'design') {
          el = apercu('🎬', c.video ? (c.video.startsWith('data:') ? 'vidéo importée' : c.video) : 'aucune vidéo');
          break;
        }
        el = document.createElement('video');
        el.playsInline = true;
        el.preload = 'metadata';
        el.controls = c.barreVideo !== false;
        el.loop = !!c.boucle;
        el.volume = Math.min(1, Math.max(0, (c.volume ?? 100) / 100));
        if (c.video) el.src = c.video;
        break;
      case 'selecteurcouleur':
        el = document.createElement('input');
        el.type = 'color';
        el.value = /^#[0-9a-f]{6}$/i.test(couleur(c.texte)) ? couleur(c.texte) : '#4f46e5';
        break;
      default:
        el = document.createElement('div');
    }
    el.className = 'bs-ctrl bs-' + c.type + (el.className ? ' ' + el.className : '');
    appliquerStyle(el, c);
    return el;
  }

  const estCase = t => t === 'casecocher' || t === 'boutonradio' || t === 'interrupteur';

  // ---- Onglets : une barre de titres ; les contrôles posés sur une page ont `onglets` (id) et `page` ----
  function titresOnglets(el, pages, page) {
    el.firstChild.replaceChildren(...pages.map((titre, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = enTexte(titre);
      if (i === page) b.className = 'bs-actif';
      return b;
    }));
  }

  // ---- Graphique : barres, courbe ou secteurs ----
  const COULEURS_SECTEURS = ['#4f46e5', '#16a34a', '#f59e0b', '#dc2626', '#0891b2', '#db2777',
    '#7c3aed', '#65a30d', '#ea580c', '#475569'];
  const nombreLisible = v => (Math.round(v * 100) / 100).toLocaleString('fr-FR');

  // Un pas « rond » pour les graduations : 1, 2, 5, 10, 20, 50…
  function pasRond(x) {
    const p = Math.pow(10, Math.floor(Math.log10(x)));
    const m = x / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
  }

  function couper(ctx, texte, largeur) {
    if (ctx.measureText(texte).width <= largeur) return texte;
    while (texte.length > 1 && ctx.measureText(texte + '…').width > largeur) texte = texte.slice(0, -1);
    return texte + '…';
  }

  function dessinerGraphique(canvas, d) {
    const L = Number(d.largeur) || 10, H = Number(d.hauteur) || 10;
    canvas.width = 0; // repart d'un canevas vide
    preparerDessin(canvas, L, H);
    const ctx = canvas.getContext('2d');
    const valeurs = (d.valeurs || []).map(v => Number(v) || 0);
    const etiquettes = d.etiquettes || [];
    const taille = Math.max(9, (Number(d.taillePolice) || 14) - 2);
    const police = (gras, t = taille) => `${gras ? 'bold ' : ''}${t}px "Segoe UI", sans-serif`;
    const encre = couleur(d.couleurTexte || '#000000');
    ctx.textBaseline = 'middle';

    let haut = 8;
    if (d.texte) {
      ctx.font = police(true, taille + 2);
      ctx.fillStyle = encre;
      ctx.textAlign = 'center';
      ctx.fillText(couper(ctx, enTexte(d.texte), L - 10), L / 2, haut + (taille + 2) / 2);
      haut += taille + 12;
    }
    ctx.font = police(false);
    if (!valeurs.length) {
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('(aucune valeur)', L / 2, (haut + H) / 2);
      return;
    }
    const nom = i => etiquettes[i] !== undefined && etiquettes[i] !== '' ? enTexte(etiquettes[i]) : String(i + 1);

    if (d.genre === 'secteurs') {
      const total = valeurs.reduce((s, v) => s + Math.max(0, v), 0) || 1;
      const legende = Math.min(L * 0.45, 160);
      const r = Math.max(5, Math.min((L - legende - 20) / 2, (H - haut - 8) / 2));
      const cx = 10 + r, cy = haut + (H - haut - 8) / 2;
      let angle = -Math.PI / 2;
      valeurs.forEach((v, i) => {
        const part = Math.max(0, v) / total * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, angle, angle + part);
        ctx.closePath();
        ctx.fillStyle = COULEURS_SECTEURS[i % COULEURS_SECTEURS.length];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        angle += part;
      });
      const x = cx + r + 14, ligne = taille + 6;
      ctx.textAlign = 'left';
      valeurs.forEach((v, i) => {
        const y = cy - (valeurs.length - 1) * ligne / 2 + i * ligne;
        if (y < haut || y > H - 4) return;
        ctx.fillStyle = COULEURS_SECTEURS[i % COULEURS_SECTEURS.length];
        ctx.fillRect(x, y - 5, 10, 10);
        ctx.fillStyle = encre;
        const pourcent = Math.round(Math.max(0, v) / total * 100);
        ctx.fillText(couper(ctx, `${nom(i)} (${pourcent} %)`, L - x - 18), x + 15, y);
      });
      return;
    }

    // Barres ou courbe : graduations à gauche, étiquettes en bas.
    let min = Math.min(0, ...valeurs), max = Math.max(0, ...valeurs);
    if (max === min) max = min + 1;
    const pas = pasRond((max - min) / 4);
    min = Math.floor(min / pas) * pas;
    max = Math.ceil(max / pas) * pas;
    const graduations = [];
    for (let v = min; v <= max + pas / 2; v += pas) graduations.push(v);
    const gauche = 8 + Math.max(...graduations.map(v => ctx.measureText(nombreLisible(v)).width)) + 6;
    const droite = L - 8, bas = H - taille - 10;
    if (bas - haut < 10 || droite - gauche < 10) return;
    const y = v => bas - (v - min) / (max - min) * (bas - haut);

    ctx.textAlign = 'right';
    ctx.lineWidth = 1;
    for (const v of graduations) {
      ctx.strokeStyle = v === 0 ? '#64748b' : '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(gauche, Math.round(y(v)) + 0.5);
      ctx.lineTo(droite, Math.round(y(v)) + 0.5);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.fillText(nombreLisible(v), gauche - 6, y(v));
    }

    const n = valeurs.length, case_ = (droite - gauche) / n;
    const coul = couleur(d.couleurBarre || '#4f46e5');
    const centre = i => gauche + case_ * (i + 0.5);
    if (d.genre === 'courbe') {
      ctx.strokeStyle = coul;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      valeurs.forEach((v, i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, centre(i), y(v)));
      ctx.stroke();
      ctx.fillStyle = coul;
      if (case_ >= 6) valeurs.forEach((v, i) => { ctx.beginPath(); ctx.arc(centre(i), y(v), 3, 0, Math.PI * 2); ctx.fill(); });
    } else {
      ctx.fillStyle = coul;
      valeurs.forEach((v, i) => {
        const largeur = Math.max(1, case_ * 0.7);
        ctx.fillRect(centre(i) - largeur / 2, Math.min(y(v), y(0)), largeur, Math.abs(y(v) - y(0)));
      });
    }

    // Étiquettes : une sur k si elles ne tiennent pas toutes.
    ctx.fillStyle = encre;
    ctx.textAlign = 'center';
    const plusLarge = Math.max(...valeurs.map((v, i) => ctx.measureText(nom(i)).width));
    const k = Math.max(1, Math.ceil((Math.min(plusLarge, 80) + 6) / case_));
    for (let i = 0; i < n; i += k) ctx.fillText(couper(ctx, nom(i), case_ * k - 4), centre(i), bas + taille / 2 + 5);
  }

  // Aperçu dans le concepteur des contrôles lourds (page web, vidéo) : une barre de titre et une icône.
  function apercu(icone, texte) {
    const el = document.createElement('div');
    el.classList.add('bs-apercu');
    el.appendChild(document.createElement('div')).textContent = icone + ' ' + texte;
    el.appendChild(document.createElement('div')).textContent = icone;
    return el;
  }
  const estListe = t => t === 'listederoulante' || t === 'zoneliste';
  const aValeur = t => t === 'curseur' || t === 'selecteurnombre';

  // « wikipedia.org » → « https://wikipedia.org ». Les vidéos YouTube passent par
  // leur version « intégrable » : la page normale de YouTube refuse d'être affichée dans un autre site.
  function adresseWeb(v) {
    let a = enTexte(v).trim();
    if (!a) return '';
    if (!/^[a-z][a-z0-9+.-]*:/i.test(a)) a = 'https://' + a;
    const yt = a.match(/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
    return yt ? 'https://www.youtube.com/embed/' + yt[1] : a;
  }

  function remplirListe(select, elements) {
    select.innerHTML = '';
    for (const e of elements) {
      const o = document.createElement('option');
      o.textContent = enTexte(e);
      select.appendChild(o);
    }
  }

  function majBarre(el, c) {
    const max = Number(c.max ?? 100);
    const part = max > 0 ? Math.min(Math.max(Number(c.valeur ?? 0) / max, 0), 1) : 0;
    const barre = el.firstChild;
    barre.style.width = (part * 100) + '%';
    barre.style.background = couleur(c.couleurBarre || '#16a34a');
  }

  // Le dessin est net sur les écrans haute définition grâce à devicePixelRatio.
  // Si la zone change de taille, le dessin déjà fait est conservé.
  function preparerDessin(canvas, largeur, hauteur) {
    const ratio = window.devicePixelRatio || 1;
    let ancien = null;
    if (canvas.width && canvas.height) {
      ancien = document.createElement('canvas');
      ancien.width = canvas.width;
      ancien.height = canvas.height;
      ancien.getContext('2d').drawImage(canvas, 0, 0);
    }
    canvas.width = Math.round(largeur * ratio);
    canvas.height = Math.round(hauteur * ratio);
    const ctx = canvas.getContext('2d');
    if (ancien) ctx.drawImage(ancien, 0, 0);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function appliquerStyle(el, c) {
    Object.assign(el.style, {
      position: 'absolute',
      left: c.x + 'px', top: c.y + 'px',
      width: c.largeur + 'px', height: c.hauteur + 'px',
      color: couleur(c.couleurTexte || ''),
      background: c.couleurFond ? couleur(c.couleurFond) : '',
      fontSize: (c.taillePolice || 14) + 'px',
      display: c.visible === false ? 'none' : '',
      zIndex: c.type === 'cadre' || c.type === 'onglets' ? 0 : 1
    });
    if (c.type === 'image' || c.type === 'sprite') el.style.objectFit = 'contain';
  }

  // Lance un programme : construit la fenêtre dans `hote` puis exécute le code.
  // `options.enregistrer(nom, texte)` : façon d'enregistrer un fichier propre à l'hôte
  // (BlocStudio.exe) ; sinon, boîte « Enregistrer sous » du navigateur ou téléchargement.
  function lancer(projet, code, hote, surErreur, options) {
    options = options || {};
    const fenetre = projet.fenetre;
    const prefixe = 'bs' + Math.random().toString(36).slice(2, 8);
    hote.innerHTML = '';

    const actionsMenus = {};
    const menus = lireMenus(fenetre.menus);
    if (menus.length) {
      const barre = creerBarreMenus(menus, chemin => (actionsMenus[chemin] || []).forEach(f => f()));
      barre.style.width = fenetre.largeur + 'px';
      hote.appendChild(barre);
    }

    // Mémoire du programme : elle reste d'un lancement à l'autre (stockage du navigateur).
    const prefixeMemoire = 'bsmem.' + (projet.id || fenetre.titre || 'programme') + '.';
    const stockage = {
      lire(cle) {
        try { const s = localStorage.getItem(prefixeMemoire + cle); return s === null ? null : JSON.parse(s); } catch (e) { return null; }
      },
      ecrire(cle, valeur) {
        try { localStorage.setItem(prefixeMemoire + cle, JSON.stringify(valeur)); } catch (e) { /* stockage plein ou interdit */ }
      },
      effacer(cle) {
        try { localStorage.removeItem(prefixeMemoire + cle); } catch (e) { /* rien */ }
      },
      toutEffacer() {
        try {
          Object.keys(localStorage).filter(k => k.startsWith(prefixeMemoire)).forEach(k => localStorage.removeItem(k));
        } catch (e) { /* rien */ }
      }
    };

    const surface = document.createElement('div');
    surface.className = 'bs-surface';
    Object.assign(surface.style, {
      position: 'relative',
      width: fenetre.largeur + 'px', height: fenetre.hauteur + 'px',
      background: couleur(fenetre.couleurFond || '#f0f0f0'),
      overflow: 'hidden', fontFamily: 'Segoe UI, sans-serif'
    });
    hote.appendChild(surface);

    // ---- Autres fenêtres du programme ----
    // Elles s'ouvrent par-dessus la fenêtre principale ; leurs contrôles gardent leur
    // contenu quand on les ferme puis les rouvre.
    const fenetres = {};   // id → { def, el, surface, voile, ouverte, surOuverture, surFermeture, attentes }
    let plusHaut = 4000;   // la dernière fenêtre ouverte (ou cliquée) passe devant
    for (const def of projet.fenetres || []) {
      const el = document.createElement('div');
      el.className = 'bs-fenetre';
      el.style.display = 'none';
      const barre = document.createElement('div');
      barre.className = 'bs-fenetre-titre';
      const titre = document.createElement('span');
      titre.textContent = def.titre || def.nom;
      const fermer = document.createElement('button');
      fermer.className = 'bs-fenetre-fermer';
      fermer.textContent = '✕';
      fermer.title = 'Fermer';
      barre.append(titre, fermer);
      const s = document.createElement('div');
      s.className = 'bs-surface';
      Object.assign(s.style, {
        position: 'relative', width: def.largeur + 'px', height: def.hauteur + 'px',
        background: couleur(def.couleurFond || '#f0f0f0'), overflow: 'hidden', fontFamily: 'Segoe UI, sans-serif'
      });
      el.append(barre, s);
      document.body.appendChild(el);
      const f = fenetres[def.id] = { def, el, titre, surface: s, voile: null, ouverte: false, surOuverture: [], surFermeture: [], attentes: [] };
      fermer.addEventListener('click', () => fermerFenetre(f));
      el.addEventListener('pointerdown', () => { if (f.ouverte && !f.voile) el.style.zIndex = ++plusHaut; });
      // On déplace la fenêtre en la tenant par sa barre de titre.
      barre.addEventListener('pointerdown', e => {
        if (e.target === fermer) return;
        const depart = { x: e.clientX - el.offsetLeft, y: e.clientY - el.offsetTop };
        try { barre.setPointerCapture(e.pointerId); } catch (err) { /* pas grave */ }
        const bouger = ev => {
          el.style.left = Math.max(0, ev.clientX - depart.x) + 'px';
          el.style.top = Math.max(0, ev.clientY - depart.y) + 'px';
        };
        const lacher = () => { barre.removeEventListener('pointermove', bouger); barre.removeEventListener('pointerup', lacher); };
        barre.addEventListener('pointermove', bouger);
        barre.addEventListener('pointerup', lacher);
      });
    }
    // Fenêtre (principale ou autre) où se trouve un contrôle.
    const fenetreDe = d => (fenetres[d.fenetre] && fenetres[d.fenetre].def) || fenetre;

    function ouvrirFenetre(f, attendre) {
      if (arrete) return JAMAIS;
      if (!f.ouverte) {
        f.ouverte = true;
        // Centrée sur la fenêtre principale, un peu décalée si d'autres sont déjà ouvertes.
        const r = surface.getBoundingClientRect();
        const decalage = 24 * Object.values(fenetres).filter(x => x.ouverte && x !== f).length;
        f.el.style.left = Math.max(0, r.left + (r.width - f.def.largeur) / 2 + decalage) + 'px';
        f.el.style.top = Math.max(0, r.top + (r.height - f.def.hauteur - 30) / 2 + decalage) + 'px';
        f.el.style.display = '';
        f.surOuverture.forEach(h => h());
      }
      // « et attendre qu'elle soit fermée » : le reste du programme est inaccessible en attendant.
      if (attendre) {
        if (!f.voile) {
          f.voile = document.createElement('div');
          f.voile.className = 'bs-fenetre-voile';
          f.voile.style.zIndex = ++plusHaut;
          document.body.appendChild(f.voile);
        }
        f.el.style.zIndex = ++plusHaut;
        return new Promise(fini => f.attentes.push(fini)).then(() => arrete ? JAMAIS : undefined);
      }
      f.el.style.zIndex = ++plusHaut;
    }

    function fermerFenetre(f) {
      if (!f.ouverte) return;
      f.ouverte = false;
      f.el.style.display = 'none';
      if (f.voile) { f.voile.remove(); f.voile = null; }
      f.attentes.splice(0).forEach(fini => fini());
      f.surFermeture.forEach(h => h());
    }

    function laFenetre(id) {
      if (!fenetres[id]) throw new Error('Cette fenêtre n\'existe plus (elle a peut-être été supprimée).');
      return fenetres[id];
    }

    const elements = {};
    const donnees = {};
    for (const c of projet.controles) {
      // Contrôles invisibles (Son, Minuteur) : rien à afficher, seulement un état.
      if (INVISIBLES.includes(c.type)) {
        elements[c.id] = document.createElement('span');
        donnees[c.id] = Object.assign({}, c, { surEvenement: [], etat: 'arrete' });
        if (c.type === 'basedonnees') preparerBase(donnees[c.id]);
        continue;
      }
      const el = creerElement(c, prefixe, projet.sprites);
      (fenetres[c.fenetre] ? fenetres[c.fenetre].surface : surface).appendChild(el);
      elements[c.id] = el;
      const d = donnees[c.id] = Object.assign({}, c);
      if (c.type === 'sprite') d.costume = Math.max(0, Math.round(Number(c.costume) || 0));
      if (c.type === 'zonedessin') suivreSouris(el, d);
      if (c.type === 'tableau') preparerTableau(el, d);
      if (c.type === 'onglets') {
        d.pages = (c.pages || []).map(enTexte);
        d.page = Math.min(Math.max(0, Math.round(Number(c.page) || 0)), Math.max(0, d.pages.length - 1));
        el.addEventListener('click', e => {
          const b = e.target.closest('.bs-onglets-titres button');
          if (!b) return;
          const i = [...b.parentNode.children].indexOf(b);
          if (i === d.page) return;
          d.page = i;
          majOnglets(c.id);
          el.dispatchEvent(new Event('input')); // « quand Onglets1 change »
        });
      }
      if (c.type === 'graphique') {
        d.valeurs = (c.valeurs || []).map(v => Number(v) || 0);
        d.etiquettes = (c.etiquettes || []).map(enTexte);
        while (d.etiquettes.length < d.valeurs.length) d.etiquettes.push('');
      }
    }

    // Montre les contrôles de la page affichée, cache ceux des autres pages
    // (et tout le contenu si les onglets eux-mêmes sont cachés). Des onglets peuvent en contenir d'autres.
    function majOnglets(id) {
      const d = donnees[id], el = elements[id];
      el.querySelectorAll('.bs-onglets-titres button').forEach((b, i) => b.classList.toggle('bs-actif', i === d.page));
      const cache = el.style.display === 'none' || el.classList.contains('bs-hors-page');
      for (const cid in donnees) {
        const o = donnees[cid];
        if (o.onglets !== id || cid === id) continue;
        elements[cid].classList.toggle('bs-hors-page', cache || (Number(o.page) || 0) !== d.page);
        if (o.type === 'onglets') majOnglets(cid);
      }
    }
    for (const id in donnees) {
      const d = donnees[id];
      if (d.type === 'onglets' && !(d.onglets && donnees[d.onglets])) majOnglets(id); // les plus extérieurs d'abord
    }

    // ---- Base de données ----
    // Des fiches (une valeur par champ), numérotées à partir de 1 comme les lignes d'un tableau.
    // Avec « memoriser », elles sont retrouvées au lancement suivant. La mémoire repart de zéro
    // si l'on change les fiches de départ ; si l'on change seulement les champs, chaque valeur
    // mémorisée retrouve son champ par son nom.
    function valeurFiche(v) { return typeof v === 'number' ? v : enTexte(v); }

    // Noms de champs : ni les majuscules ni les accents ne comptent (« age » = « Âge »).
    function memeNom(a, b) { return enTexte(a).trim().localeCompare(enTexte(b).trim(), 'fr', { sensitivity: 'base' }) === 0; }

    function preparerBase(d) {
      d.cleMemoire = 'base.' + d.id + '.' + empreinte(JSON.stringify(d.fiches || []));
      d.champs = [...new Set((d.champs || []).map(c => enTexte(c).trim()).filter(c => c))];
      d.fiches = (d.fiches || []).map(f => d.champs.map((_, i) => valeurFiche(f[i] ?? '')));
      d.vues = new Set(); // tableaux qui montrent toutes les fiches (remis à jour à chaque changement)
      if (d.memoriser === false) return;
      const sauve = stockage.lire(d.cleMemoire);
      if (!sauve || !Array.isArray(sauve.fiches) || !Array.isArray(sauve.champs)) return;
      // Un champ renommé (même nombre de champs) garde ses valeurs : on le retrouve à sa place.
      const position = d.champs.map((c, i) => {
        const j = sauve.champs.findIndex(s => memeNom(s, c));
        return j < 0 && sauve.champs.length === d.champs.length ? i : j;
      });
      d.fiches = sauve.fiches.map(f => position.map(i => i < 0 ? '' : valeurFiche(f[i] ?? '')));
    }

    function baseModifiee(d) {
      if (d.memoriser !== false) stockage.ecrire(d.cleMemoire, { champs: d.champs, fiches: d.fiches });
      for (const t of d.vues) {
        if (donnees[t] && donnees[t].lienBase && donnees[t].lienBase.base === d.id) afficherBase(d, t, null);
        else d.vues.delete(t);
      }
    }

    function numFiche(d, numero) {
      const n = Math.round(Number(numero));
      if (!(n >= 1 && n <= d.fiches.length)) {
        throw new Error(`« ${d.nom} » n'a pas de fiche n° ${enTexte(numero)} (elle a ${d.fiches.length} fiche(s)).`);
      }
      return n - 1;
    }

    // Un champ se désigne par son nom (sans tenir compte des majuscules) ou par son numéro.
    function numChamp(d, champ) {
      const nom = enTexte(champ).trim();
      const i = d.champs.findIndex(c => memeNom(c, nom));
      if (i >= 0) return i;
      const n = Math.round(Number(nom));
      if (/^\d+$/.test(nom) && n >= 1 && n <= d.champs.length) return n - 1;
      throw new Error(`« ${d.nom} » n'a pas de champ « ${enTexte(champ)} » (ses champs : ${d.champs.join(', ') || 'aucun'}).`);
    }

    // Comparaison d'une valeur de fiche : en nombres si les deux en sont, sinon en texte
    // (sans tenir compte des majuscules ni des accents).
    function correspond(valeur, operation, cherche) {
      const a = valeurCellule(valeur), b = valeurCellule(cherche);
      const ta = enTexte(a).trim(), tb = enTexte(b).trim();
      const egal = ta.localeCompare(tb, 'fr', { sensitivity: 'base' }) === 0;
      const ordre = typeof a === 'number' && typeof b === 'number' ? a - b
        : ta.localeCompare(tb, 'fr', { numeric: true, sensitivity: 'base' });
      const simple = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      switch (operation) {
        case 'egal': return egal;
        case 'different': return !egal;
        case 'contient': return simple(ta).includes(simple(tb));
        case 'commence': return simple(ta).startsWith(simple(tb));
        case 'inferieur': return ordre < 0;
        case 'superieur': return ordre > 0;
        case 'infegal': return ordre <= 0;
        case 'supegal': return ordre >= 0;
      }
      return false;
    }

    function chercherFiches(d, champ, operation, valeur) {
      const i = numChamp(d, champ);
      const r = [];
      d.fiches.forEach((f, n) => { if (correspond(f[i], operation, valeur)) r.push(n + 1); });
      return r;
    }

    // Montre des fiches dans un tableau. `numeros` : les n° à montrer (null = toutes, et le
    // tableau suit alors la base). « n° de la fiche choisie » retrouve la fiche d'une ligne.
    function afficherBase(d, idTableau, numeros) {
      const el = ctrlDeType(idTableau, 'tableau', 'un tableau');
      const t = donnees[idTableau];
      const liste = numeros === null ? d.fiches.map((_, n) => n) : (Array.isArray(numeros) ? numeros : [numeros])
        .map(n => Math.round(Number(n)) - 1).filter(n => n >= 0 && n < d.fiches.length);
      const choisie = t.lienBase && t.lienBase.base === d.id && t.choisie >= 0 ? t.lienBase.numeros[t.choisie] : -1;
      t.colonnes = d.champs.slice();
      t.lignes = liste.map(n => d.fiches[n].map(enTexte));
      t.lienBase = { base: d.id, numeros: liste };
      t.choisie = liste.indexOf(choisie);
      if (numeros === null) d.vues.add(idTableau);
      else d.vues.delete(idTableau);
      rendreTableau(el, t);
    }

    // Un tableau « mémorisé » retrouve ses lignes au lancement suivant. La mémoire
    // repart de zéro si l'on change ses colonnes ou ses lignes de départ.
    function preparerTableau(el, d) {
      d.colonnes = (d.colonnes || []).map(enTexte);
      d.lignes = (d.lignes || []).map(l => l.map(enTexte));
      d.choisie = -1;
      d.cleMemoire = 'tableau.' + d.id + '.' + empreinte(JSON.stringify([d.colonnes, d.lignes]));
      if (d.memoriser) {
        const sauve = stockage.lire(d.cleMemoire);
        if (Array.isArray(sauve)) d.lignes = sauve;
      }
      rendreTableau(el, d);
      el.addEventListener('click', e => {
        const tr = e.target.closest('tbody tr');
        if (!tr || el.dataset.inactif) return;
        d.choisie = [...tr.parentNode.children].indexOf(tr);
        rendreTableau(el, d);
        el.dispatchEvent(new Event('input'));
      });
    }

    function empreinte(texte) {
      let h = 5381;
      for (let i = 0; i < texte.length; i++) h = (h * 33 + texte.charCodeAt(i)) | 0;
      return (h >>> 0).toString(36);
    }

    // Mémorise la position de la souris dans une zone de dessin
    // (et la position précédente, pour tracer des traits continus).
    function suivreSouris(el, d) {
      d.souris = { x: 0, y: 0, px: 0, py: 0 };
      const position = e => {
        const r = el.getBoundingClientRect();
        return [
          Math.round((e.clientX - r.left) * d.largeur / r.width),
          Math.round((e.clientY - r.top) * d.hauteur / r.height)
        ];
      };
      el.addEventListener('pointerdown', e => {
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* pas grave */ }
        const [x, y] = position(e);
        Object.assign(d.souris, { x, y, px: x, py: y });
      });
      el.addEventListener('pointermove', e => {
        const [x, y] = position(e);
        Object.assign(d.souris, { px: d.souris.x, py: d.souris.y, x, y });
      });
    }

    const minuteurs = [];
    const auDemarrage = [];
    const actionsMessages = {};   // nom du message → gestionnaires « quand je reçois »
    const reglageVoix = { vitesse: 1, hauteur: 1 };
    const phrasesEnCours = new Set();

    // L'erreur est rattachée au dernier bloc exécuté (connu seulement dans l'éditeur).
    function signaler(e) {
      const msg = (e && e.message) ? e.message : String(e);
      if (surErreur) surErreur(msg, suivi.bloc); else alert('Erreur : ' + msg);
    }

    // Les événements sont asynchrones : ils peuvent attendre la réponse
    // à une boîte de dialogue avant de continuer.
    // Quand le programme est arrêté, les attentes en cours ne se terminent
    // jamais : le code qui suivait ne s'exécute donc plus.
    let arrete = false;
    const attentes = new Set();
    const sonsProjet = new Map((projet.sons || []).map(s => [s.id, s]));
    const sonsEnCours = new Set();   // sons importés en train de jouer : { nom, source, volume }

    // Volumes : chaque son passe par son propre réglage, puis par le volume général du programme.
    const volumes = new Map();       // nom du son → volume entre 0 et 1
    let volumeGeneral = 1;
    let sortie = null;
    function sortieAudio() {
      if (!sortie) {
        contexteAudio();
        sortie = audio.createGain();
        sortie.gain.value = volumeGeneral;
        sortie.connect(audio.destination);
      }
      return sortie;
    }
    function volumeDe(nom) {
      const reglage = sortieAudio().context.createGain();
      reglage.gain.value = volumes.has(nom) ? volumes.get(nom) : 1;
      reglage.connect(sortie);
      return reglage;
    }

    // ---- Contrôle Son ----
    // d.etat : 'arrete', 'lecture' ou 'pause' ; d.lecture : la lecture en cours ;
    // d.position : où reprendre après une pause (en secondes depuis le début de l'extrait).
    const volumeCtrl = d => Math.min(100, Math.max(0, Number(d.volume ?? 100) || 0)) / 100;

    function jouerCtrlSon(d, position) {
      couperCtrlSon(d);
      const s = sonsProjet.get(d.son);
      if (!s || arrete) return Promise.resolve();
      const jeton = d.jeton = {};
      d.etat = 'lecture';
      return decoderSon(s.donnees).then(tampon => {
        if (arrete || d.jeton !== jeton) return;
        const [debut, fin] = extraitSon(s, tampon);
        const duree = fin - debut;
        const depuis = Math.min(Math.max(0, position || 0), Math.max(0, duree - 0.001));
        const source = audio.createBufferSource();
        source.buffer = tampon;
        source.loop = !!d.boucle;
        source.loopStart = debut;
        source.loopEnd = finBoucle(s, debut, fin);
        const volume = audio.createGain();
        volume.gain.value = volumeCtrl(d);
        volume.connect(sortieAudio());
        source.connect(volume);
        const lecture = d.lecture = { source, volume, duree, cycle: source.loopEnd - debut, depart: audio.currentTime - depuis };
        return new Promise(termine => {
          source.onended = () => {
            volume.disconnect();
            // Fin naturelle (pas un arrêt ni une pause) : événement « quand … se termine ».
            if (d.lecture === lecture) {
              d.lecture = null;
              d.etat = 'arrete';
              d.position = 0;
              d.surEvenement.forEach(f => f());
            }
            termine();
          };
          if (source.loop) source.start(0, debut + depuis);
          else {
            source.start(0, debut + depuis, duree - depuis);
            // Si le navigateur bloque le son (aucun clic encore), on n'attend pas indéfiniment.
            setTimeout(termine, (duree - depuis) * 1000 + 250);
          }
        });
      }, () => { throw new Error(`Le son « ${s.nom} » n'a pas pu être lu (fichier abîmé ou format inconnu).`); });
    }

    // Arrête la lecture sans déclencher « quand … se termine ».
    function couperCtrlSon(d) {
      d.jeton = null;
      const l = d.lecture;
      d.lecture = null;
      if (l) try { l.source.stop(); } catch (e) { /* déjà fini */ }
    }

    function ctrlSon(id, action) {
      ctrlDeType(id, 'son', 'un contrôle Son');
      const d = donnees[id];
      switch (action) {
        case 'jouer': jouerCtrlSon(d, 0).catch(signaler); break;
        case 'attendre': return jouerCtrlSon(d, 0).then(() => arrete ? JAMAIS : undefined);
        case 'pause':
          if (d.etat !== 'lecture') break;
          if (d.lecture) {
            const ecoule = audio.currentTime - d.lecture.depart;
            d.position = d.lecture.source.loop ? ecoule % d.lecture.cycle : ecoule;
          }
          couperCtrlSon(d);
          d.etat = 'pause';
          break;
        case 'reprendre':
          if (d.etat === 'pause') jouerCtrlSon(d, d.position).catch(signaler);
          else if (d.etat === 'arrete') jouerCtrlSon(d, 0).catch(signaler);
          break;
        case 'arreter':
          couperCtrlSon(d);
          d.etat = 'arrete';
          d.position = 0;
          break;
      }
    }

    // Une vidéo se commande comme un contrôle Son (jouer, pause, reprendre, arrêter).
    function ctrlVideo(id, action) {
      const el = elements[id];
      const jouer = () => el.play().catch(e => { if (e.name !== 'AbortError') signaler(new Error('Impossible de lire la vidéo de « ' + donnees[id].nom + ' ».')); });
      switch (action) {
        case 'jouer': case 'reprendre': jouer(); break;
        case 'pause': el.pause(); break;
        case 'arreter': el.pause(); el.currentTime = 0; break;
        case 'attendre':
          jouer();
          return new Promise(resoudre => el.addEventListener('ended', () => resoudre(), { once: true }))
            .then(() => arrete ? JAMAIS : undefined);
      }
    }

    function lireSon(d, prop) {
      switch (prop) {
        case 'son': return sonsProjet.get(d.son)?.nom ?? '';
        case 'volume': return Math.round(volumeCtrl(d) * 100);
        case 'boucle': return !!d.boucle;
        case 'enLecture': return d.etat === 'lecture';
      }
      return d[prop];
    }

    function ecrireSon(d, prop, valeur) {
      switch (prop) {
        case 'son': {
          // On désigne un son par son nom (celui du Sommaire).
          const nom = enTexte(valeur).trim();
          const s = [...sonsProjet.values()].find(x => x.nom === nom || x.id === nom);
          if (!s) throw new Error(`Il n'y a pas de son nommé « ${nom} » dans le projet.`);
          const rejouer = d.etat === 'lecture';
          couperCtrlSon(d);
          d.son = s.id;
          d.etat = 'arrete';
          d.position = 0;
          if (rejouer) jouerCtrlSon(d, 0).catch(signaler);
          break;
        }
        case 'volume':
          d.volume = Number(valeur) || 0;
          if (d.lecture) d.lecture.volume.gain.setTargetAtTime(volumeCtrl(d), audio.currentTime, 0.02);
          break;
        case 'boucle':
          d.boucle = !!valeur;
          if (d.lecture) d.lecture.source.loop = d.boucle;
          break;
      }
    }

    // ---- Contrôle Minuteur ----
    // Un tic n'est pas lancé tant que le précédent n'est pas terminé (par exemple
    // s'il attend la réponse à une boîte de dialogue) : ils ne s'empilent jamais.
    function demarrerMinuteur(d) {
      arreterMinuteur(d);
      const ms = Math.max(20, (Number(d.intervalle) || 1) * 1000);
      d.horloge = setInterval(async () => {
        if (d.occupe || arrete) return;
        d.occupe = true;
        try { await Promise.all(d.surEvenement.map(f => f())); } finally { d.occupe = false; }
      }, ms);
      minuteurs.push(d.horloge);
    }

    function arreterMinuteur(d) {
      clearInterval(d.horloge);
      d.horloge = null;
    }

    function ctrlMinuteur(id, action) {
      ctrlDeType(id, 'minuteur', 'un minuteur');
      const d = donnees[id];
      if (action === 'demarrer') demarrerMinuteur(d);
      else arreterMinuteur(d);
    }

    function lireMinuteur(d, prop) {
      if (prop === 'intervalle') return Number(d.intervalle) || 1;
      if (prop === 'active') return !!d.horloge;
      return d[prop];
    }

    function ecrireMinuteur(d, prop, valeur) {
      if (prop === 'intervalle') {
        d.intervalle = Math.max(0.02, Number(valeur) || 1);
        if (d.horloge) demarrerMinuteur(d); // le nouvel intervalle compte tout de suite
      } else if (prop === 'active') {
        if (valeur) { if (!d.horloge) demarrerMinuteur(d); } else arreterMinuteur(d);
      }
    }

    // ---- Contrôle Sprite ----
    // d.sprite : identifiant du sprite affiché ; d.costume : numéro du costume (à partir de 0) ;
    // d.animation : l'animation en cours ({ mode: 'boucle' ou 'unefois', horloge, fini }).
    const spritesProjet = new Map((projet.sprites || []).map(s => [s.id, s]));
    const animations = new Set();
    for (const s of spritesProjet.values()) for (const c of s.costumes || []) contourCostume(c.donnees);
    const PROPS_SPRITE = ['sprite', 'costume', 'nomCostume', 'vitesse', 'miroir', 'rotation', 'enAnimation', 'taille', 'transparence'];
    const PROPS_GRAPHIQUE = ['texte', 'valeurs', 'etiquettes', 'genre', 'couleurBarre', 'maxValeurs'];
    const spriteDe = d => spritesProjet.get(d.sprite);
    const costumesDe = d => (spriteDe(d) && spriteDe(d).costumes) || [];
    const majSprite = d => afficherSprite(elements[d.id], d, spriteDe(d));
    const vitesseDe = d => Math.min(60, Math.max(0.1, Number(d.vitesse ?? (spriteDe(d) && spriteDe(d).vitesse) ?? 8) || 8));

    // Passe d'un costume à l'autre ; « une fois » : du premier au dernier, puis s'arrête.
    function animerSprite(d, mode) {
      arreterAnimation(d);
      if (costumesDe(d).length < 2 || arrete) return Promise.resolve();
      return new Promise(fini => {
        const anim = d.animation = { mode, fini };
        if (mode === 'unefois') { d.costume = 0; majSprite(d); }
        anim.tic = () => {
          const n = costumesDe(d).length;
          if (arrete || !n) return;
          d.costume = (d.costume + 1) % n;
          majSprite(d);
          if (mode === 'unefois' && d.costume >= n - 1) arreterAnimation(d);
        };
        cadencer(d);
        animations.add(anim);
      });
    }

    function cadencer(d) {
      const anim = d.animation;
      clearInterval(anim.horloge);
      anim.horloge = setInterval(anim.tic, 1000 / vitesseDe(d));
    }

    function arreterAnimation(d) {
      const anim = d.animation;
      if (!anim) return;
      clearInterval(anim.horloge);
      animations.delete(anim);
      d.animation = null;
      anim.fini();
    }

    function lireSprite(d, prop) {
      switch (prop) {
        case 'sprite': return spriteDe(d) ? spriteDe(d).nom : '';
        case 'costume': return d.costume + 1;
        case 'nomCostume': return (costumesDe(d)[d.costume] || {}).nom || '';
        case 'vitesse': return vitesseDe(d);
        case 'miroir': return !!d.miroir;
        case 'rotation': return Number(d.rotation) || 0;
        case 'enAnimation': return !!d.animation;
        case 'taille': return Math.round(echelleSprite(d) * 1000) / 10;
        case 'transparence': return Math.min(100, Math.max(0, Number(d.transparence) || 0));
      }
    }

    function ecrireSprite(d, prop, valeur) {
      switch (prop) {
        case 'sprite': {
          // On désigne un sprite par son nom (celui du Sommaire).
          const nom = enTexte(valeur).trim();
          const s = [...spritesProjet.values()].find(x => x.nom === nom || x.id === nom);
          if (!s) throw new Error(`Il n'y a pas de sprite nommé « ${nom} » dans le projet.`);
          d.sprite = s.id;
          d.costume = 0;
          if (d.animation) cadencer(d); // la vitesse du nouveau sprite compte tout de suite
          break;
        }
        case 'costume': {
          // Un numéro (1, 2…, on reboucle après le dernier) ou le nom du costume.
          const costumes = costumesDe(d);
          if (!costumes.length) return;
          const texte = enTexte(valeur).trim();
          const n = Number(texte.replace(',', '.'));
          if (texte !== '' && Number.isFinite(n)) {
            d.costume = ((Math.round(n) - 1) % costumes.length + costumes.length) % costumes.length;
          } else {
            const i = costumes.findIndex(c => c.nom.toLowerCase() === texte.toLowerCase());
            if (i < 0) throw new Error(`Le sprite « ${spriteDe(d).nom} » n'a pas de costume nommé « ${texte} ».`);
            d.costume = i;
          }
          break;
        }
        case 'vitesse':
          d.vitesse = Math.max(0.1, Number(valeur) || 8);
          if (d.animation) cadencer(d);
          break;
        case 'miroir': d.miroir = !!valeur; break;
        case 'rotation': d.rotation = Number(valeur) || 0; break;
        case 'taille': d.taille = Math.min(1000, Math.max(0, Number(valeur) || 0)); break;
        case 'transparence': d.transparence = Math.min(100, Math.max(0, Number(valeur) || 0)); break;
        default: return;
      }
      majSprite(d);
    }

    function ctrlSprite(id, action, a) {
      ctrlDeType(id, 'sprite', 'un sprite');
      const d = donnees[id];
      switch (action) {
        case 'costume': ecrireSprite(d, 'costume', a); break;
        case 'suivant': {
          const n = costumesDe(d).length;
          if (n) { d.costume = (d.costume + 1) % n; majSprite(d); }
          break;
        }
        case 'animer': {
          const p = animerSprite(d, a);
          if (a === 'unefois') return p.then(() => arrete ? JAMAIS : undefined);
          break;
        }
        case 'arreter': arreterAnimation(d); break;
        case 'changer': ecrireSprite(d, 'sprite', a); break;
        case 'regarder': ecrireSprite(d, 'miroir', a === 'gauche'); break;
        case 'tourner': ecrireSprite(d, 'rotation', ((Number(d.rotation) || 0) + (Number(a) || 0)) % 360); break;
        case 'grandir': ecrireSprite(d, 'taille', lireSprite(d, 'taille') + (Number(a) || 0)); break;
        case 'apparaitre': case 'disparaitre':
          return Promise.resolve(fondu(d, action === 'apparaitre', Number(a) || 0)).then(() => arrete ? JAMAIS : undefined);
      }
    }

    // Fondu : « apparaître » part de l'invisible et revient à la transparence choisie ;
    // « disparaître » devient transparent, puis cache le sprite (sa transparence est remise ensuite).
    function fondu(d, apparait, secondes) {
      const el = elements[d.id], id = d.id;
      const visible = el.style.display !== 'none';
      const garde = d.fondu ? d.fondu.garde : lireSprite(d, 'transparence') >= 100 ? 0 : lireSprite(d, 'transparence');
      if (apparait === visible && !d.fondu) return; // déjà dans l'état voulu
      const depart = apparait ? (visible ? lireSprite(d, 'transparence') : 100) : lireSprite(d, 'transparence');
      const arrivee = apparait ? garde : 100;
      const duree = Math.max(0, secondes) * 1000, t0 = performance.now();
      const courant = d.fondu = { garde };
      if (apparait) el.style.display = '';
      return new Promise(fini => {
        const etape = () => {
          if (arrete || !donnees[id] || d.fondu !== courant) return fini(); // arrêté, clone supprimé ou nouveau fondu
          const k = duree ? Math.min(1, (performance.now() - t0) / duree) : 1;
          ecrireSprite(d, 'transparence', depart + (arrivee - depart) * k);
          if (k < 1) return requestAnimationFrame(etape);
          d.fondu = null;
          if (!apparait) {
            el.style.display = 'none';
            ecrireSprite(d, 'transparence', garde);
          }
          fini();
        };
        etape();
      });
    }

    // Rectangle occupé par un contrôle pour « … touche … ? ». Pour un sprite : seulement
    // la partie dessinée de son costume (l'image est un carré centré dans le contrôle).
    function zoneDe(id) {
      const d = donnees[id];
      const r = { x: d.x, y: d.y, l: d.largeur, h: d.hauteur };
      if (d.type !== 'sprite') return r;
      const costume = costumesDe(d)[d.costume];
      if (!costume) return r;
      const contour = contourCostume(costume.donnees);
      if (contour === null) return null; // costume vide : il ne touche rien
      const b = contour || { x0: 0, y0: 0, x1: 1, y1: 1 }; // contour pas encore calculé : tout le carré
      const cote = Math.min(r.l, r.h) * echelleSprite(d);
      const ox = r.x + (r.l - cote) / 2, oy = r.y + (r.h - cote) / 2;
      const x0 = d.miroir ? 1 - b.x1 : b.x0, x1 = d.miroir ? 1 - b.x0 : b.x1;
      return { x: ox + x0 * cote, y: oy + b.y0 * cote, l: (x1 - x0) * cote, h: (b.y1 - b.y0) * cote };
    }
    const JAMAIS = new Promise(() => {});

    function patienter(ms) {
      if (arrete) return JAMAIS;
      return new Promise(resoudre => {
        const t = setTimeout(() => { attentes.delete(t); resoudre(); }, ms);
        attentes.add(t);
      });
    }

    // ---- Suivi de l'exécution (dans l'éditeur seulement) ----
    // Le code généré pour l'éditeur appelle app.pas(id) avant chaque bloc : on sait ainsi
    // quel bloc s'exécute (pour l'allumer, ou pour situer une erreur). En mode « lent »
    // ou « pas à pas », le programme attend avant chaque bloc.
    const DELAI_LENT = 500;
    const suivi = { mode: options.modeSuivi || 'normal', bloc: null, instant: 0, file: [] };
    function relacher(tout) {
      (tout ? suivi.file.splice(0) : suivi.file.splice(0, 1)).forEach(a => a.reprendre());
    }

    let derniereRespiration = performance.now();

    function proteger(fn) {
      return async function (...args) {
        if (arrete) return;
        app.boucles = 0;
        try { await fn(...args); } catch (e) { if (!e.cloneSupprime) signaler(e); }
      };
    }

    // ---- Boîtes de dialogue ----
    // Une seule boîte à la fois : les suivantes attendent leur tour.
    let fileDialogues = Promise.resolve();
    const voiles = new Set();

    function dialogue(options) {
      const p = fileDialogues.then(() => afficherDialogue(options));
      fileDialogues = p.catch(() => {});
      return p;
    }

    function afficherDialogue({ icone, texte, champ, boutons, choix, annulation }) {
      return new Promise(resoudre => {
        const voile = document.createElement('div');
        voile.className = 'bs-dlg-voile';
        const boite = document.createElement('div');
        boite.className = 'bs-dlg';
        voile.appendChild(boite);

        const titre = document.createElement('div');
        titre.className = 'bs-dlg-titre';
        titre.textContent = fenetre.titre || 'Message';
        boite.appendChild(titre);

        const corps = document.createElement('div');
        corps.className = 'bs-dlg-corps';
        const ic = document.createElement('div');
        ic.className = 'bs-dlg-icone bs-dlg-' + icone;
        ic.textContent = ICONES[icone] || ICONES.info;
        const contenu = document.createElement('div');
        contenu.className = 'bs-dlg-contenu';
        const p = document.createElement('div');
        p.className = 'bs-dlg-texte';
        p.textContent = texte;
        contenu.appendChild(p);
        corps.append(ic, contenu);
        boite.appendChild(corps);

        let saisie = null;
        const aide = document.createElement('div');
        aide.className = 'bs-dlg-aide';
        if (champ) {
          saisie = document.createElement('input');
          saisie.type = 'text';
          saisie.className = 'bs-dlg-saisie';
          if (champ === 'nombre') saisie.inputMode = 'decimal';
          contenu.append(saisie, aide);
        }

        function fermer(valeur) {
          voile.remove();
          voiles.delete(voile);
          resoudre(valeur);
        }

        function valider(valeur) {
          if (champ === 'nombre' && valeur !== annulation) {
            const brut = saisie.value.trim().replace(',', '.');
            if (brut === '' || isNaN(Number(brut))) {
              aide.textContent = 'Merci d\'écrire un nombre, par exemple 12 ou 3,5.';
              saisie.classList.add('bs-dlg-invalide');
              saisie.focus();
              return;
            }
            fermer(Number(brut));
          } else if (champ && valeur !== annulation) {
            fermer(saisie.value);
          } else {
            fermer(valeur);
          }
        }

        if (choix) {
          const liste = document.createElement('div');
          liste.className = 'bs-dlg-choix';
          choix.forEach(option => {
            const b = document.createElement('button');
            b.textContent = option;
            b.addEventListener('click', () => fermer(option));
            liste.appendChild(b);
          });
          contenu.appendChild(liste);
        }

        const pied = document.createElement('div');
        pied.className = 'bs-dlg-pied';
        let principal = null;
        for (const def of boutons) {
          const b = document.createElement('button');
          b.textContent = def.libelle;
          if (def.principal) { b.className = 'bs-dlg-principal'; principal = b; }
          b.addEventListener('click', () => valider(def.valeur));
          pied.appendChild(b);
        }
        if (boutons.length) boite.appendChild(pied);

        voile.addEventListener('keydown', e => {
          e.stopPropagation();
          if (e.key === 'Escape') { e.preventDefault(); fermer(annulation); }
          else if (e.key === 'Enter' && principal && !(e.target.tagName === 'BUTTON' && e.target !== principal)) {
            e.preventDefault();
            principal.click();
          }
        });

        document.body.appendChild(voile);
        voiles.add(voile);
        (saisie || principal || boite.querySelector('button'))?.focus();
      });
    }

    function ctrl(id) {
      if (elements[id]) return elements[id];
      if (id === undefined) {
        throw new Error('« moi » ne s\'utilise que dans un événement d\'un contrôle, par exemple « quand un clone de … est créé » ou « quand … est cliqué ».');
      }
      // Un clone supprimé : les scripts qui l'utilisaient s'arrêtent, simplement.
      if (clonesSupprimes.has(id)) throw Object.assign(new Error('clone supprimé'), { cloneSupprime: true });
      throw new Error("Le contrôle n'existe plus (il a peut-être été supprimé).");
    }

    function ctrlDeType(id, type, libelle) {
      const el = ctrl(id);
      if (donnees[id].type !== type) throw new Error(`« ${donnees[id].nom} » n'est pas ${libelle}.`);
      return el;
    }

    function ctrlListe(id) {
      const el = ctrl(id);
      if (!estListe(donnees[id].type)) throw new Error(`« ${donnees[id].nom} » n'est pas une liste.`);
      return el;
    }

    const optionsListe = select => [...select.options].map(o => o.textContent);

    // Une ligne de tableau : une liste de valeurs (ou une seule valeur).
    const enLigne = v => (Array.isArray(v) ? v : [v]).map(enTexte);

    function numLigne(d, numero) {
      const n = Math.round(Number(numero));
      if (!(n >= 1 && n <= d.lignes.length)) {
        throw new Error(`« ${d.nom} » n'a pas de ligne n° ${enTexte(numero)} (il a ${d.lignes.length} ligne(s)).`);
      }
      return n - 1;
    }

    // Une colonne se désigne par son numéro (1, 2…) ou par son titre.
    function numColonne(d, colonne) {
      if (typeof colonne === 'number' || /^\d+$/.test(enTexte(colonne).trim())) {
        const n = Math.round(Number(colonne));
        if (n >= 1) return n - 1;
      }
      const titre = enTexte(colonne).trim().toLowerCase();
      const i = d.colonnes.findIndex(c => c.trim().toLowerCase() === titre);
      if (i < 0) throw new Error(`« ${d.nom} » n'a pas de colonne « ${enTexte(colonne)} ».`);
      return i;
    }

    // ---- Clavier ----
    // Les touches sont désignées par des noms simples : 'gauche', 'espace', 'entree', 'a', '7'…
    const nettoyages = [];
    function ecouter(cible, type, fn, options) {
      cible.addEventListener(type, fn, options);
      nettoyages.push(() => cible.removeEventListener(type, fn, options));
    }
    const touchesEnfoncees = new Set();
    const actionsTouches = {};       // nom de touche (ou 'toutes') → fonctions
    let derniereTouche = '';
    // Touches qui servent à écrire : ignorées quand on tape dans une zone de texte.
    const pourEcrire = t => t.length === 1 || t === 'espace' || t === 'effacement' || t === 'gauche' || t === 'droite';
    const dansChampTexte = () => {
      const a = document.activeElement;
      return a && (a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && !['checkbox', 'radio', 'range', 'color', 'button'].includes(a.type)));
    };
    ecouter(window, 'keydown', e => {
      if (arrete || document.querySelector('.bs-dlg-voile') || e.ctrlKey || e.altKey || e.metaKey) return;
      const touche = nomTouche(e.key);
      if (!touche || (dansChampTexte() && pourEcrire(touche))) return;
      touchesEnfoncees.add(touche);
      derniereTouche = touche;
      const actions = [...(actionsTouches[touche] || []), ...(actionsTouches.toutes || [])];
      if (!actions.length) return;
      // Évite que les flèches fassent défiler la page ou qu'Espace « clique » le bouton qui a le focus.
      if (!/^f\d+$/.test(touche)) e.preventDefault();
      actions.forEach(f => f());
    }, true);
    ecouter(window, 'keyup', e => touchesEnfoncees.delete(nomTouche(e.key)), true);
    ecouter(window, 'blur', () => touchesEnfoncees.clear()); // fenêtre quittée : plus rien n'est enfoncé

    // ---- Souris dans la fenêtre ----
    const souris = { x: 0, y: 0, enfonce: false };
    const actionsSouris = { bouge: [], clic: [] };
    const positionSouris = e => {
      const r = surface.getBoundingClientRect();
      souris.x = Math.round(e.clientX - r.left);
      souris.y = Math.round(e.clientY - r.top);
    };
    ecouter(surface, 'pointermove', e => { positionSouris(e); actionsSouris.bouge.forEach(f => f()); });
    ecouter(surface, 'pointerdown', e => { positionSouris(e); souris.enfonce = true; });
    ecouter(window, 'pointerup', () => { souris.enfonce = false; });
    ecouter(surface, 'click', e => { positionSouris(e); actionsSouris.clic.forEach(f => f()); });

    // Un événement très fréquent (souris qui bouge) n'est pas relancé tant que le précédent n'est pas fini.
    function sansEmpiler(h) {
      let occupe = false;
      return async () => {
        if (occupe) return;
        occupe = true;
        try { await h(); } finally { occupe = false; }
      };
    }

    // ---- Contrôles déplaçables à la souris ----
    for (const id in donnees) if (!INVISIBLES.includes(donnees[id].type)) rendreDeplacable(id);
    function rendreDeplacable(id) {
      const d = donnees[id], el = elements[id];
      if (d.deplacable) el.style.cursor = 'grab';
      let prise = null;
      ecouter(el, 'pointerdown', e => {
        if (!d.deplacable || arrete) return;
        prise = { x: e.clientX - d.x, y: e.clientY - d.y, bouge: false };
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* pas grave */ }
      });
      ecouter(el, 'pointermove', e => {
        if (!prise) return;
        prise.bouge = true;
        const f = fenetreDe(d);
        d.x = Math.round(Math.min(Math.max(e.clientX - prise.x, -d.largeur + 10), f.largeur - 10));
        d.y = Math.round(Math.min(Math.max(e.clientY - prise.y, -d.hauteur + 10), f.hauteur - 10));
        el.style.left = d.x + 'px';
        el.style.top = d.y + 'px';
      });
      let vientDeBouger = false;
      ecouter(el, 'pointerup', () => {
        vientDeBouger = !!(prise && prise.bouge);
        prise = null;
      });
      // Après un vrai déplacement, pas de « clic » parasite sur le contrôle lâché.
      ecouter(el, 'click', e => {
        if (vientDeBouger) e.stopImmediatePropagation();
        vientDeBouger = false;
      }, true);
    }

    // Les deux contrôles (ou l'un de leurs clones) se chevauchent-ils ? (contrôles visibles seulement)
    function seTouchent(id1, id2) {
      ctrl(id1);
      ctrl(id2);
      return famille(id1).some(a => famille(id2).some(b => seChevauchent(a, b)));
    }

    function seChevauchent(id1, id2) {
      ctrl(id1);
      ctrl(id2);
      if (id1 === id2 || elements[id1].style.display === 'none' || elements[id2].style.display === 'none') return false;
      const a = zoneDe(id1), b = zoneDe(id2);
      if (!a || !b) return false;
      return a.x < b.x + b.l && b.x < a.x + a.l && a.y < b.y + b.h && b.y < a.y + a.h;
    }

    // ---- Événements des contrôles ----
    const evenementsCtrl = {};   // id → [{ evenement, h }] : rebranchés sur chaque clone
    function brancher(id, evenement, h) {
      const el = elements[id], d = donnees[id];
      const appel = () => h(id); // le gestionnaire reçoit « moi » : le contrôle (ou le clone) concerné
      if (evenement === 'clic') el.addEventListener('click', appel);
      else if (evenement === 'dblclic') el.addEventListener('dblclick', appel);
      else if (evenement === 'appui') el.addEventListener('pointerdown', appel);
      else if (evenement === 'relache') el.addEventListener('pointerup', appel);
      else if (evenement === 'entre') el.addEventListener('pointerenter', appel);
      else if (evenement === 'sort') el.addEventListener('pointerleave', appel);
      else if (evenement === 'change') {
        if (d.type === 'navigateur') el.addEventListener('load', appel); // une page a fini de charger
        else if (estCase(d.type)) el.querySelector('input').addEventListener('change', appel);
        else el.addEventListener('input', appel);
      } else if (evenement === 'glisser') {
        el.addEventListener('pointermove', e => { if (e.buttons & 1) appel(); });
      }
    }

    // ---- Clones ----
    // Un clone est une copie d'un contrôle (dans son état du moment), avec les mêmes événements.
    // Ses identifiants : « c3#1 », « c3#2 »… ; d.original : le contrôle d'origine.
    const MAX_CLONES = 300;
    const CLONABLES = ['sprite', 'image', 'etiquette'];
    const actionsClones = {};    // id d'origine → « quand un clone de … est créé »
    const clonesSupprimes = new Set();
    let numeroClone = 0;

    // Le contrôle et tous ses clones (un clone ne représente que lui-même).
    function famille(id) {
      if (donnees[id].original) return [id];
      return [id, ...Object.keys(donnees).filter(c => donnees[c].original === id)];
    }

    function creerClone(id) {
      ctrl(id);
      const source = donnees[id];
      const original = source.original || id;
      if (!CLONABLES.includes(source.type)) throw new Error(`« ${source.nom} » ne peut pas être cloné : seuls les sprites, les images et les étiquettes le peuvent.`);
      if (app.nombreClones(original) >= MAX_CLONES) {
        throw new Error(`Trop de clones de « ${source.nom} » (${MAX_CLONES} au maximum). Pensez à supprimer ceux qui ne servent plus (« supprimer ce clone »).`);
      }
      const cid = original + '#' + (++numeroClone);
      const el = elements[id];
      const d = donnees[cid] = Object.assign({}, source, {
        id: cid, original, animation: null, glissement: null, fondu: null,
        texte: source.type === 'etiquette' ? el.textContent : source.texte,
        image: source.type === 'image' ? el.getAttribute('src') : source.image,
        visible: el.style.display !== 'none'
      });
      const copie = elements[cid] = creerElement(d, prefixe, projet.sprites);
      el.parentNode.appendChild(copie);
      if (d.type === 'sprite') {
        majSprite(d);
        if (source.animation && source.animation.mode === 'boucle') animerSprite(d, 'boucle');
      }
      rendreDeplacable(cid);
      for (const { evenement, h } of evenementsCtrl[original] || []) brancher(cid, evenement, h);
      for (const h of actionsClones[original] || []) h(cid);
      return cid;
    }

    function effacerClone(id) {
      const d = donnees[id];
      if (d.type === 'sprite') arreterAnimation(d);
      elements[id].remove();
      delete elements[id];
      delete donnees[id];
      clonesSupprimes.add(id);
    }

    // ---- Mouvement ----
    // Direction en degrés, comme dans Scratch : 90 = vers la droite, 0 = vers le haut,
    // 180 = vers le bas, -90 = vers la gauche.
    const normaliser = a => { a = ((Number(a) || 0) % 360 + 360) % 360; return a > 180 ? a - 360 : a; };
    const directionDe = d => d.direction === undefined ? 90 : Number(d.direction);
    const centre = id => { ctrl(id); const d = donnees[id]; return [d.x + d.largeur / 2, d.y + d.hauteur / 2]; };

    function poser(id, x, y) {
      const d = donnees[id], el = elements[id];
      d.x = Math.round(x * 100) / 100;
      d.y = Math.round(y * 100) / 100;
      el.style.left = d.x + 'px';
      el.style.top = d.y + 'px';
    }

    function mouvement(id, action, a, b, c) {
      ctrl(id);
      const d = donnees[id];
      const n = v => Number(v) || 0;
      switch (action) {
        case 'avancer': {
          const r = directionDe(d) * Math.PI / 180;
          poser(id, d.x + n(a) * Math.sin(r), d.y - n(a) * Math.cos(r));
          break;
        }
        case 'deplacer': poser(id, d.x + n(a), d.y + n(b)); break;
        case 'placer': poser(id, n(a), n(b)); break;
        case 'placerSur': {
          if (a === '__hasard') {
            const f = fenetreDe(d);
            poser(id, Math.random() * Math.max(0, f.largeur - d.largeur), Math.random() * Math.max(0, f.hauteur - d.hauteur));
          } else {
            const [x, y] = a === '__souris' ? [souris.x, souris.y] : centre(a);
            poser(id, x - d.largeur / 2, y - d.hauteur / 2);
          }
          break;
        }
        case 'glisser': return glisser(id, n(a), n(b), n(c));
        case 'orienter': d.direction = normaliser(a); break;
        case 'tourner': d.direction = normaliser(directionDe(d) + n(a)); break;
        case 'orienterVers': {
          const [x1, y1] = centre(id), [x2, y2] = a === '__souris' ? [souris.x, souris.y] : centre(a);
          if (x1 !== x2 || y1 !== y2) d.direction = normaliser(Math.atan2(x2 - x1, y1 - y2) * 180 / Math.PI);
          break;
        }
        case 'rebondir': {
          // Si le contrôle dépasse un bord en allant vers lui, il repart dans l'autre sens.
          const z = zoneDe(id), fenetre = fenetreDe(d);
          if (!z) break;
          const r = directionDe(d) * Math.PI / 180, vx = Math.sin(r), vy = -Math.cos(r);
          let dir = directionDe(d), dx = 0, dy = 0;
          if (z.x < 0) { dx = -z.x; if (vx < 0) dir = -dir; }
          else if (z.x + z.l > fenetre.largeur) { dx = fenetre.largeur - z.x - z.l; if (vx > 0) dir = -dir; }
          if (z.y < 0) { dy = -z.y; if (vy < 0) dir = 180 - dir; }
          else if (z.y + z.h > fenetre.hauteur) { dy = fenetre.hauteur - z.y - z.h; if (vy > 0) dir = 180 - dir; }
          d.direction = normaliser(dir);
          if (dx || dy) poser(id, d.x + dx, d.y + dy);
          break;
        }
      }
    }

    // Glisse en douceur jusqu'à (x, y) ; le programme attend la fin du trajet.
    function glisser(id, x, y, secondes) {
      const d = donnees[id];
      const depart = { x: d.x, y: d.y, t: performance.now() };
      const duree = Math.max(0, secondes) * 1000;
      const trajet = d.glissement = {};
      return new Promise(fini => {
        const etape = () => {
          if (arrete || !donnees[id] || d.glissement !== trajet) return; // programme arrêté, clone supprimé ou nouveau trajet
          const k = duree ? Math.min(1, (performance.now() - depart.t) / duree) : 1;
          poser(id, depart.x + (x - depart.x) * k, depart.y + (y - depart.y) * k);
          if (k < 1) requestAnimationFrame(etape);
          else { d.glissement = null; fini(); }
        };
        etape();
      });
    }

    const app = {
      quand(id, evenement, fn) {
        ctrl(id);
        const h = proteger(fn);
        // « quand Son1 se termine », « quand Minuteur1 sonne »
        if (evenement === 'fin' && donnees[id].type === 'video') return elements[id].addEventListener('ended', () => h(id));
        if (evenement === 'fin' || evenement === 'tic') return donnees[id].surEvenement.push(() => h(id));
        (evenementsCtrl[id] = evenementsCtrl[id] || []).push({ evenement, h });
        brancher(id, evenement, h);
      },
      // ---- Fenêtres ----
      // action : 'ouvrir' (attendre = true : jusqu'à ce qu'elle soit fermée), 'fermer', 'titre'.
      fenetre(id, action, valeur) {
        const f = laFenetre(id);
        if (action === 'ouvrir') return ouvrirFenetre(f, valeur);
        if (action === 'fermer') fermerFenetre(f);
        if (action === 'titre') f.titre.textContent = enTexte(valeur);
      },
      fenetreOuverte(id) { return laFenetre(id).ouverte; },
      quandFenetre(id, quoi, fn) {
        const f = laFenetre(id), h = proteger(fn);
        (quoi === 'ouverture' ? f.surOuverture : f.surFermeture).push(() => h());
      },
      // ---- Clones ----
      quandClone(id, fn) { (actionsClones[id] = actionsClones[id] || []).push(proteger(fn)); },
      creerClone,
      supprimerClone(id) {
        if (!donnees[id] || !donnees[id].original) return; // l'original ne se supprime pas
        effacerClone(id);
        return JAMAIS; // le script du clone s'arrête là
      },
      supprimerClones(id) {
        ctrl(id);
        const original = donnees[id].original || id;
        Object.keys(donnees).filter(c => donnees[c].original === original).forEach(effacerClone);
      },
      nombreClones(id) {
        ctrl(id);
        const original = donnees[id].original || id;
        return Object.values(donnees).filter(d => d.original === original).length;
      },
      // ---- Mouvement ----
      mouvement,
      toucheBord(id) {
        ctrl(id);
        const z = zoneDe(id), fenetre = fenetreDe(donnees[id]);
        return !!z && elements[id].style.display !== 'none' &&
          (z.x <= 0 || z.y <= 0 || z.x + z.l >= fenetre.largeur || z.y + z.h >= fenetre.hauteur);
      },
      distance(id, cible) {
        const [x1, y1] = centre(id), [x2, y2] = cible === '__souris' ? [souris.x, souris.y] : centre(cible);
        return Math.round(Math.hypot(x2 - x1, y2 - y1) * 10) / 10;
      },
      auDemarrage(fn) { auDemarrage.push(proteger(fn)); },

      // ---- Messages entre les scripts ----
      quandMessage(nom, fn) { (actionsMessages[nom] = actionsMessages[nom] || []).push(proteger(fn)); },
      // Les récepteurs démarrent au tour suivant : un message qui se renvoie lui-même
      // fait une boucle qui laisse respirer la page, au lieu de saturer la pile.
      // La promesse se termine quand tous les récepteurs ont fini (« et attendre »).
      async envoyerMessage(nom) {
        await patienter(0);
        await Promise.all((actionsMessages[nom] || []).map(h => h()));
      },

      // ---- Clavier et souris ----
      quandTouche(touche, fn) { (actionsTouches[touche] = actionsTouches[touche] || []).push(proteger(fn)); },
      toucheEnfoncee(touche) { return touche === 'toutes' ? touchesEnfoncees.size > 0 : touchesEnfoncees.has(touche); },
      derniereTouche() { return derniereTouche; },
      quandSouris(quoi, fn) { actionsSouris[quoi].push(quoi === 'bouge' ? sansEmpiler(proteger(fn)) : proteger(fn)); },
      sourisFenetre(quoi) { return quoi === 'enfonce' ? souris.enfonce : souris[quoi] ?? 0; },
      seTouchent,
      toutesLes(secondes, fn) {
        const ms = Math.max(20, Number(secondes) * 1000 || 1000);
        minuteurs.push(setInterval(sansEmpiler(proteger(fn)), ms));
      },

      // ---- Suivi de l'exécution ----
      // Vrai si le programme doit attendre avant ce bloc (modes « lent » et « pas à pas »).
      pas(id) {
        suivi.bloc = id;
        suivi.instant = performance.now();
        return suivi.mode !== 'normal';
      },
      attente() {
        if (arrete) return JAMAIS;
        if (suivi.mode === 'lent') return patienter(DELAI_LENT);
        const id = suivi.bloc;
        return new Promise(reprendre => suivi.file.push({ id, reprendre }));
      },
      lire(id, prop) {
        const el = ctrl(id);
        const d = donnees[id];
        if (d.type === 'son') return lireSon(d, prop);
        if (d.type === 'minuteur') return lireMinuteur(d, prop);
        if (d.type === 'basedonnees') {
          if (prop === 'nombreFiches') return d.fiches.length;
          if (prop === 'champs') return d.champs.slice();
          if (prop === 'memoriser') return d.memoriser !== false;
          return '';
        }
        if (d.type === 'sprite' && PROPS_SPRITE.includes(prop)) return lireSprite(d, prop);
        if (d.type === 'graphique' && PROPS_GRAPHIQUE.includes(prop)) {
          const v = d[prop];
          return Array.isArray(v) ? v.slice() : v ?? '';
        }
        if (d.type === 'onglets') {
          if (prop === 'numero') return d.page + 1;
          if (prop === 'texte') return d.pages[d.page] ?? '';
          if (prop === 'elements') return d.pages.slice();
        }
        switch (prop) {
          case 'texte':
            if (d.type === 'zonetexte') return el.value;
            if (estCase(d.type)) return el.querySelector('span').textContent;
            if (estListe(d.type)) return el.selectedIndex < 0 ? '' : el.options[el.selectedIndex].textContent;
            if (aValeur(d.type)) return el.value;
            if (d.type === 'barreprogression') return String(d.valeur);
            if (d.type === 'cadre') return el.firstChild.textContent;
            if (d.type === 'date') return dateFrancaise(el.value);
            if (d.type === 'selecteurcouleur') return el.value;
            if (d.type === 'tableau') return enTexte(d.lignes[d.choisie] || '');
            return el.textContent;
          case 'numero':
            if (d.type === 'tableau') return d.choisie + 1;
            return estListe(d.type) ? el.selectedIndex + 1 : 0;
          case 'nombreLignes': return d.type === 'tableau' ? d.lignes.length : 0;
          case 'colonnes': return d.type === 'tableau' ? d.colonnes.slice() : [];
          case 'elements': return estListe(d.type) ? optionsListe(el) : [];
          case 'valeur':
            if (aValeur(d.type)) return Number(el.value) || 0;
            return Number(d.valeur ?? 0);
          case 'min': return aValeur(d.type) ? Number(el.min) : 0;
          case 'pas': return d.type === 'selecteurnombre' ? Number(el.step) : 1;
          case 'max': return aValeur(d.type) ? Number(el.max) : Number(d.max ?? 100);
          case 'coche': return estCase(d.type) ? el.querySelector('input').checked : false;
          case 'visible': return el.style.display !== 'none';
          case 'deplacable': return !!d.deplacable;
          case 'direction': return directionDe(d);
          case 'adresse': return adresseWeb(d.adresse);
          case 'enLecture': return d.type === 'video' ? !el.paused && !el.ended : false;
          case 'position': return d.type === 'video' ? Math.round(el.currentTime * 10) / 10 : 0;
          case 'duree': return d.type === 'video' && isFinite(el.duration) ? Math.round(el.duration * 10) / 10 : 0;
          case 'volume': return d.type === 'video' ? Math.round(el.volume * 100) : 0;
          case 'boucle': return d.type === 'video' ? el.loop : false;
          case 'active': return !(el.disabled || el.querySelector?.('input')?.disabled);
          default: return d[prop];
        }
      },
      ecrire(id, prop, valeur) {
        const el = ctrl(id);
        const d = donnees[id];
        if (d.type === 'son') return ecrireSon(d, prop, valeur);
        if (d.type === 'minuteur') return ecrireMinuteur(d, prop, valeur);
        if (d.type === 'basedonnees') {
          if (prop === 'memoriser') {
            d.memoriser = !!valeur;
            if (d.memoriser) baseModifiee(d);
            else stockage.effacer(d.cleMemoire);
          }
          return;
        }
        if (d.type === 'sprite' && PROPS_SPRITE.includes(prop)) return ecrireSprite(d, prop, valeur);
        if (d.type === 'onglets' && (prop === 'numero' || prop === 'elements')) {
          if (prop === 'elements') {
            d.pages = (Array.isArray(valeur) ? valeur : enTexte(valeur).split('\n')).map(enTexte);
            titresOnglets(el, d.pages, d.page);
          }
          const n = prop === 'numero' ? Math.round(Number(valeur)) - 1 : d.page;
          d.page = Math.min(Math.max(0, n), Math.max(0, d.pages.length - 1));
          return majOnglets(id);
        }
        const avant = { x: d.x, y: d.y };
        if (d.type === 'graphique' && PROPS_GRAPHIQUE.includes(prop)) {
          const liste = Array.isArray(valeur) ? valeur : enTexte(valeur).split(/[\n;]/).map(e => e.trim()).filter(e => e);
          if (prop === 'valeurs') d.valeurs = liste.map(v => app.nombre(v));
          else if (prop === 'etiquettes') d.etiquettes = liste.map(enTexte);
          else if (prop === 'genre') d.genre = ['barres', 'courbe', 'secteurs'].includes(enTexte(valeur).trim()) ? enTexte(valeur).trim() : 'barres';
          else d[prop] = valeur;
          return dessinerGraphique(el, d);
        }
        switch (prop) {
          case 'texte':
            if (d.type === 'zonetexte') el.value = valeur;
            else if (estCase(d.type)) el.querySelector('span').textContent = valeur;
            else if (d.type === 'image') el.src = valeur;
            else if (estListe(d.type)) {
              const i = optionsListe(el).indexOf(enTexte(valeur));
              if (i >= 0) el.selectedIndex = i;
            } else if (aValeur(d.type) || d.type === 'barreprogression') app.ecrire(id, 'valeur', valeur);
            else if (d.type === 'cadre') el.firstChild.textContent = valeur;
            else if (d.type === 'date') el.value = dateIso(valeur);
            else if (d.type === 'selecteurcouleur') {
              const hex = couleur(enTexte(valeur));
              if (/^#[0-9a-f]{6}$/i.test(hex)) el.value = hex;
            } else if (d.type !== 'tableau') el.textContent = valeur;
            break;
          case 'numero':
            if (estListe(d.type)) el.selectedIndex = Math.round(Number(valeur)) - 1;
            if (d.type === 'tableau') {
              const n = Math.round(Number(valeur)) - 1;
              d.choisie = n >= 0 && n < d.lignes.length ? n : -1;
              rendreTableau(el, d);
            }
            break;
          case 'colonnes':
            if (d.type === 'tableau') {
              d.colonnes = (Array.isArray(valeur) ? valeur : enTexte(valeur).split('\n')).map(enTexte);
              rendreTableau(el, d);
            }
            break;
          case 'elements':
            if (estListe(d.type)) {
              remplirListe(el, Array.isArray(valeur) ? valeur : enTexte(valeur).split('\n'));
            }
            break;
          case 'valeur':
            if (aValeur(d.type)) el.value = Number(valeur);
            else if (d.type === 'barreprogression') { d.valeur = Number(valeur) || 0; majBarre(el, d); }
            break;
          case 'min':
            if (aValeur(d.type)) el.min = Number(valeur);
            break;
          case 'pas':
            if (d.type === 'selecteurnombre') el.step = Number(valeur);
            break;
          case 'max':
            if (aValeur(d.type)) el.max = Number(valeur);
            else if (d.type === 'barreprogression') { d.max = Number(valeur) || 0; majBarre(el, d); }
            break;
          case 'couleurBarre':
            if (d.type === 'barreprogression') { d.couleurBarre = valeur; majBarre(el, d); }
            break;
          case 'coche':
            if (estCase(d.type)) el.querySelector('input').checked = !!valeur;
            break;
          case 'visible': el.style.display = valeur ? '' : 'none'; break;
          case 'deplacable': d.deplacable = !!valeur; el.style.cursor = valeur ? 'grab' : ''; break;
          case 'direction': d.direction = normaliser(valeur); break;
          case 'active':
            if (estCase(d.type)) el.querySelector('input').disabled = !valeur;
            else el.disabled = !valeur;
            el.style.opacity = valeur ? '' : '0.5';
            break;
          case 'x': poser(id, Number(valeur) || 0, d.y); break;
          case 'y': poser(id, d.x, Number(valeur) || 0); break;
          case 'largeur':
            d.largeur = Number(valeur);
            el.style.width = d.largeur + 'px';
            if (d.type === 'zonedessin') preparerDessin(el, d.largeur, d.hauteur);
            break;
          case 'hauteur':
            d.hauteur = Number(valeur);
            el.style.height = d.hauteur + 'px';
            if (d.type === 'zonedessin') preparerDessin(el, d.largeur, d.hauteur);
            break;
          case 'couleurTexte': d.couleurTexte = valeur; el.style.color = couleur(valeur); break;
          case 'couleurFond': d.couleurFond = valeur; el.style.background = couleur(valeur); break;
          case 'taillePolice': d.taillePolice = Number(valeur); el.style.fontSize = d.taillePolice + 'px'; break;
          case 'image': if (d.type === 'image') el.src = valeur; break;
          // Redonner la même adresse recharge la page.
          case 'adresse':
            if (d.type === 'navigateur') { d.adresse = adresseWeb(valeur); el.src = d.adresse || 'about:blank'; }
            if (d.type === 'lien') { d.adresse = adresseWeb(valeur); if (d.adresse) el.href = d.adresse; else el.removeAttribute('href'); }
            break;
          case 'video': if (d.type === 'video') { d.video = enTexte(valeur); el.src = d.video; } break;
          case 'position': if (d.type === 'video') el.currentTime = Math.max(0, Number(valeur) || 0); break;
          case 'volume': if (d.type === 'video') el.volume = Math.min(1, Math.max(0, (Number(valeur) || 0) / 100)); break;
          case 'boucle': if (d.type === 'video') el.loop = !!valeur; break;
        }
        if (d.type === 'graphique') dessinerGraphique(el, d); // taille, couleurs du texte ou du fond
        if (d.type === 'onglets') {
          if (prop === 'visible') majOnglets(id);
          // Les contrôles posés sur les onglets se déplacent avec eux.
          if (prop === 'x' || prop === 'y') {
            for (const cid in donnees) {
              if (donnees[cid].onglets === id) poser(cid, donnees[cid].x + d.x - avant.x, donnees[cid].y + d.y - avant.y);
            }
          }
        }
      },
      graphique(id, action, valeur, etiquette) {
        const el = ctrlDeType(id, 'graphique', 'un graphique');
        const d = donnees[id];
        if (action === 'vider') {
          d.valeurs = [];
          d.etiquettes = [];
        } else {
          d.valeurs.push(app.nombre(valeur));
          d.etiquettes.push(enTexte(etiquette));
          const max = Math.round(Number(d.maxValeurs) || 0);
          if (max > 0 && d.valeurs.length > max) {
            d.valeurs.splice(0, d.valeurs.length - max);
            d.etiquettes.splice(0, d.etiquettes.length - max);
          }
        }
        dessinerGraphique(el, d);
      },
      message(texte, icone) {
        return dialogue({
          icone: icone || 'info', texte: enTexte(texte),
          boutons: [{ libelle: 'OK', valeur: undefined, principal: true }]
        });
      },
      demander(question, mode) {
        return dialogue({
          icone: 'question', texte: enTexte(question), champ: mode === 'nombre' ? 'nombre' : 'texte',
          annulation: mode === 'nombre' ? 0 : '',
          boutons: [
            { libelle: 'Annuler', valeur: mode === 'nombre' ? 0 : '' },
            { libelle: 'OK', valeur: true, principal: true }
          ]
        });
      },
      confirmer(question) {
        return dialogue({
          icone: 'question', texte: enTexte(question), annulation: false,
          boutons: [
            { libelle: 'Non', valeur: false },
            { libelle: 'Oui', valeur: true, principal: true }
          ]
        });
      },
      choisir(question, options) {
        const liste = (Array.isArray(options) ? options : [options]).map(enTexte);
        return dialogue({
          icone: 'question', texte: enTexte(question), choix: liste, annulation: '',
          boutons: [{ libelle: 'Annuler', valeur: '' }]
        });
      },
      nombre(v) {
        const n = parseFloat(String(v).replace(',', '.'));
        return isNaN(n) ? 0 : n;
      },
      // Une liste contient 3 même si l'élément est le texte "3" (saisi dans une zone de texte).
      contient(dans, valeur) {
        if (Array.isArray(dans)) return dans.some(e => e === valeur || enTexte(e) === enTexte(valeur));
        return enTexte(dans).includes(enTexte(valeur));
      },
      fondFenetre(valeur) { surface.style.background = couleur(valeur); },

      // ---- Temps ----
      attendre(secondes) {
        app.boucles = 0;
        return patienter(Math.max(0, Number(secondes) || 0) * 1000);
      },
      // Appelé à chaque tour d'une boucle « répéter indéfiniment » : laisse
      // régulièrement la page se redessiner pour qu'elle ne se fige jamais.
      respirer() {
        if (arrete) return JAMAIS;
        const maintenant = performance.now();
        if (maintenant - derniereRespiration < 15) return null;
        derniereRespiration = maintenant;
        return patienter(0);
      },

      // ---- Listes déroulantes ----
      ajouterElement(id, valeur) {
        const el = ctrlListe(id);
        const o = document.createElement('option');
        o.textContent = enTexte(valeur);
        el.appendChild(o);
      },
      viderListe(id) {
        ctrlListe(id).innerHTML = '';
      },
      retirerElement(id, numero) {
        const el = ctrlListe(id);
        const i = Math.round(Number(numero)) - 1;
        if (i >= 0 && i < el.options.length) el.remove(i);
      },
      radioCoche(groupe) {
        for (const id in donnees) {
          const d = donnees[id];
          if (d.type === 'boutonradio' && (d.groupe || 'groupe1') === groupe &&
              elements[id].querySelector('input').checked) {
            return elements[id].querySelector('span').textContent;
          }
        }
        return '';
      },

      // ---- Zones de dessin ----
      dessin(id, action, a, b, c, e, f) {
        const el = ctrlDeType(id, 'zonedessin', 'une zone de dessin');
        const d = donnees[id];
        const crayon = d.crayon || (d.crayon = { couleur: '#000000', epaisseur: 2 });
        const ctx = el.getContext('2d');
        ctx.strokeStyle = ctx.fillStyle = crayon.couleur;
        ctx.lineWidth = crayon.epaisseur;
        const n = Number;
        switch (action) {
          case 'couleur': crayon.couleur = couleur(enTexte(a)); break;
          case 'epaisseur': crayon.epaisseur = Math.max(0.5, n(a) || 1); break;
          case 'effacer': ctx.clearRect(0, 0, d.largeur, d.hauteur); break;
          case 'trait':
            ctx.beginPath();
            ctx.moveTo(n(a), n(b));
            ctx.lineTo(n(c), n(e));
            ctx.stroke();
            break;
          case 'rectangle':
            if (f) ctx.fillRect(n(a), n(b), n(c), n(e));
            else ctx.strokeRect(n(a), n(b), n(c), n(e));
            break;
          case 'cercle':
            ctx.beginPath();
            ctx.arc(n(a), n(b), Math.max(0, n(c)), 0, Math.PI * 2);
            if (e) ctx.fill(); else ctx.stroke();
            break;
          case 'point':
            ctx.beginPath();
            ctx.arc(n(a), n(b), crayon.epaisseur / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'texte':
            ctx.font = `${Math.max(6, n(e) || 16)}px "Segoe UI", sans-serif`;
            ctx.textBaseline = 'top';
            ctx.fillText(enTexte(a), n(b), n(c));
            break;
        }
      },
      souris(id, quoi) {
        ctrlDeType(id, 'zonedessin', 'une zone de dessin');
        return donnees[id].souris[quoi] ?? 0;
      },

      // ---- Menus ----
      quandMenu(chemin, fn) {
        (actionsMenus[chemin] = actionsMenus[chemin] || []).push(proteger(fn));
      },
      activerMenu(chemin, actif) {
        hote.querySelectorAll('.bs-menus [data-chemin]').forEach(e => {
          if (e.dataset.chemin === chemin) e.classList.toggle('bs-inactif', !actif);
        });
      },

      // ---- Tableaux ----
      tableau(id, action, a, b, c) {
        const el = ctrlDeType(id, 'tableau', 'un tableau');
        const d = donnees[id];
        d.lienBase = null;
        switch (action) {
          case 'ajouter': d.lignes.push(enLigne(a)); break;
          case 'remplacer': d.lignes[numLigne(d, a)] = enLigne(b); break;
          case 'supprimer': {
            const n = numLigne(d, a);
            d.lignes.splice(n, 1);
            if (d.choisie === n) d.choisie = -1;
            else if (d.choisie > n) d.choisie--;
            break;
          }
          case 'vider': d.lignes = []; d.choisie = -1; break;
          case 'cellule': {
            const ligne = d.lignes[numLigne(d, a)];
            const col = numColonne(d, b);
            while (ligne.length <= col) ligne.push('');
            ligne[col] = enTexte(c);
            break;
          }
          case 'trier': {
            const col = numColonne(d, a);
            const sens = b === 'decroissant' ? -1 : 1;
            const choisie = d.lignes[d.choisie];
            d.lignes.sort((x, y) => {
              const vx = valeurCellule(x[col] ?? ''), vy = valeurCellule(y[col] ?? '');
              const r = typeof vx === 'number' && typeof vy === 'number' ? vx - vy
                : enTexte(vx).localeCompare(enTexte(vy), 'fr', { numeric: true, sensitivity: 'base' });
              return r * sens;
            });
            d.choisie = choisie ? d.lignes.indexOf(choisie) : -1;
            break;
          }
          case 'csv': {
            let lignes = depuisCsv(a);
            const entete = lignes[0];
            if (entete && d.colonnes.length && entete.join('|').toLowerCase() === d.colonnes.join('|').toLowerCase()) {
              lignes = lignes.slice(1);
            }
            d.lignes = lignes;
            d.choisie = -1;
            break;
          }
        }
        rendreTableau(el, d);
        if (d.memoriser) stockage.ecrire(d.cleMemoire, d.lignes);
      },
      lireTableau(id, quoi, a, b) {
        ctrlDeType(id, 'tableau', 'un tableau');
        const d = donnees[id];
        switch (quoi) {
          case 'cellule': return valeurCellule(d.lignes[numLigne(d, a)][numColonne(d, b)] ?? '');
          case 'ligne': return d.lignes[numLigne(d, a)].map(valeurCellule);
          case 'colonne': {
            const col = numColonne(d, a);
            return d.lignes.map(l => valeurCellule(l[col] ?? ''));
          }
          case 'chercher': {
            const col = numColonne(d, b);
            const cherche = enTexte(a).trim().toLowerCase();
            return d.lignes.findIndex(l => enTexte(l[col]).trim().toLowerCase() === cherche) + 1;
          }
          case 'csv': return versCsv(d.colonnes.length ? [d.colonnes, ...d.lignes] : d.lignes);
        }
        return '';
      },

      // ---- Base de données ----
      base(id, action, a, b, c) {
        ctrlDeType(id, 'basedonnees', 'une base de données');
        const d = donnees[id];
        switch (action) {
          case 'ajouter': {
            // a : { champ: valeur } ; les champs absents restent vides.
            const fiche = d.champs.map(() => '');
            for (const [champ, v] of Object.entries(a || {})) fiche[numChamp(d, champ)] = valeurFiche(v);
            d.fiches.push(fiche);
            break;
          }
          case 'modifier': d.fiches[numFiche(d, a)][numChamp(d, b)] = valeurFiche(c); break;
          case 'supprimer': d.fiches.splice(numFiche(d, a), 1); break;
          case 'vider': d.fiches = []; break;
          case 'trier': {
            const i = numChamp(d, a), sens = b === 'decroissant' ? -1 : 1;
            d.fiches.sort((x, y) => {
              const vx = valeurCellule(x[i]), vy = valeurCellule(y[i]);
              const r = typeof vx === 'number' && typeof vy === 'number' ? vx - vy
                : enTexte(vx).localeCompare(enTexte(vy), 'fr', { numeric: true, sensitivity: 'base' });
              return r * sens;
            });
            break;
          }
          case 'csv': {
            // Une première ligne qui reprend les noms des champs est ignorée.
            let lignes = depuisCsv(a);
            const entete = lignes[0];
            if (entete && entete.join('|').toLowerCase() === d.champs.join('|').toLowerCase()) lignes = lignes.slice(1);
            d.fiches = lignes.map(l => d.champs.map((_, i) => valeurFiche(l[i] ?? '')));
            break;
          }
          case 'afficher': return afficherBase(d, a, b === undefined ? null : b);
        }
        baseModifiee(d);
      },
      lireBase(id, quoi, a, b, c) {
        if (quoi === 'choisie') {
          // n° de la fiche montrée sur la ligne choisie d'un tableau (0 : aucune).
          ctrlDeType(id, 'tableau', 'un tableau');
          const t = donnees[id];
          if (t.choisie < 0) return 0;
          return t.lienBase ? (t.lienBase.numeros[t.choisie] ?? -1) + 1 : t.choisie + 1;
        }
        ctrlDeType(id, 'basedonnees', 'une base de données');
        const d = donnees[id];
        switch (quoi) {
          case 'champ': return valeurCellule(d.fiches[numFiche(d, a)][numChamp(d, b)]);
          case 'nombre': return d.fiches.length;
          case 'chercher': return chercherFiches(d, a, b, c);
          case 'premiere': return chercherFiches(d, a, b, c)[0] || 0;
          case 'colonne': {
            const i = numChamp(d, a);
            return d.fiches.map(f => valeurCellule(f[i]));
          }
          case 'csv': return versCsv([d.champs, ...d.fiches]);
        }
        return '';
      },

      // ---- Mémoire ----
      memoriser(nom, valeur) { stockage.ecrire('v.' + enTexte(nom), valeur); },
      memoire(nom) { const v = stockage.lire('v.' + enTexte(nom)); return v === null ? '' : v; },
      oublier(nom) { stockage.effacer('v.' + enTexte(nom)); },
      toutOublier() { stockage.toutEffacer(); },

      // ---- Fichiers ----
      // Renvoie vrai si le fichier a été enregistré, faux si l'utilisateur a annulé.
      async enregistrerFichier(texte, nom) {
        nom = enTexte(nom).trim().replace(/[\\/:*?"<>|]+/g, '') || 'fichier';
        if (!/\.[a-z0-9]{1,5}$/i.test(nom)) nom += '.txt';
        // Un fichier .csv commence par une marque « UTF-8 » pour qu'Excel affiche bien les accents.
        const contenu = (/\.csv$/i.test(nom) ? '﻿' : '') + enTexte(texte);
        if (options.enregistrer) return !!(await options.enregistrer(nom, contenu));
        if (window.showSaveFilePicker) {
          try {
            const fichier = await window.showSaveFilePicker({ suggestedName: nom });
            const flux = await fichier.createWritable();
            await flux.write(contenu);
            await flux.close();
            return true;
          } catch (e) {
            if (e.name === 'AbortError') return false;
            // Sinon (navigateur qui refuse) : simple téléchargement, ci-dessous.
          }
        }
        const url = URL.createObjectURL(new Blob([contenu], { type: 'text/plain' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = nom;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return true;
      },
      // Renvoie le texte du fichier choisi (vide si l'utilisateur annule).
      async ouvrirFichier() {
        let texte = '';
        if (window.showOpenFilePicker) {
          try {
            const [fichier] = await window.showOpenFilePicker();
            texte = await (await fichier.getFile()).text();
            return texte.replace(/^﻿/, '');
          } catch (e) {
            if (e.name === 'AbortError') return '';
          }
        }
        texte = await new Promise(resoudre => {
          const choix = document.createElement('input');
          choix.type = 'file';
          choix.addEventListener('change', () => choix.files[0] ? choix.files[0].text().then(resoudre) : resoudre(''));
          choix.addEventListener('cancel', () => resoudre(''));
          choix.click();
        });
        return texte.replace(/^﻿/, '');
      },

      // ---- Sons et temps ----
      // mode : '' (le programme continue), 'attendre' (jusqu'au bout) ou 'boucle' (musique de fond).
      son(nom, mode) {
        if (arrete) return;
        const importe = sonsProjet.get(nom);
        if (!importe) {
          let duree = 0;
          try {
            const reglage = volumeDe(nom);
            duree = (SONS[nom] || SONS.bip)(reglage);
            setTimeout(() => reglage.disconnect(), duree * 1000 + 500);
          } catch (e) { /* pas de carte son */ }
          return mode === 'attendre' ? patienter(duree * 1000) : undefined;
        }
        const lecture = decoderSon(importe.donnees).then(tampon => {
          if (arrete) return;
          // Partie choisie dans l'éditeur de découpage (tout le son par défaut).
          const [debut, fin] = extraitSon(importe, tampon);
          const source = audio.createBufferSource();
          source.buffer = tampon;
          source.loop = mode === 'boucle';
          source.loopStart = debut;
          source.loopEnd = finBoucle(importe, debut, fin);
          const enCours = { nom, source, volume: volumeDe(nom) };
          source.connect(enCours.volume);
          sonsEnCours.add(enCours);
          return new Promise(termine => {
            source.onended = () => { sonsEnCours.delete(enCours); enCours.volume.disconnect(); termine(); };
            if (source.loop) source.start(0, debut);
            else source.start(0, debut, fin - debut);
            // Si le navigateur bloque le son (aucun clic encore), on n'attend pas indéfiniment.
            if (!source.loop) setTimeout(termine, (fin - debut) * 1000 + 250);
          });
        }, () => { throw new Error(`Le son « ${importe.nom} » n'a pas pu être lu (fichier abîmé ou format inconnu).`); });
        if (mode === 'attendre') return lecture.then(() => arrete ? JAMAIS : undefined);
        lecture.catch(signaler);
      },
      // ---- Voix (synthèse vocale du navigateur, voix de Windows dans WebView2) ----
      // La promesse se termine quand la phrase est dite (« et attendre la fin »).
      dire(texte) {
        const synthese = window.speechSynthesis;
        if (!synthese || arrete) return;
        const phrase = new SpeechSynthesisUtterance(enTexte(texte));
        phrase.lang = 'fr-FR';
        const voix = synthese.getVoices().filter(v => /^fr/i.test(v.lang));
        phrase.voice = voix.find(v => /^fr-FR/i.test(v.lang)) || voix[0] || null;
        phrase.rate = reglageVoix.vitesse;
        phrase.pitch = reglageVoix.hauteur;
        phrase.volume = volumeGeneral;
        phrasesEnCours.add(phrase); // garde la phrase en vie jusqu'au bout (sinon « onend » peut se perdre)
        return new Promise(resoudre => {
          phrase.onend = phrase.onerror = () => {
            phrasesEnCours.delete(phrase);
            if (!arrete) resoudre(); // programme arrêté : la suite ne s'exécute pas
          };
          synthese.speak(phrase);
        });
      },
      reglerVoix(vitesse, hauteur) {
        reglageVoix.vitesse = Math.min(10, Math.max(0.1, Number(vitesse) || 1));
        reglageVoix.hauteur = Math.min(2, Math.max(0, Number(hauteur ?? 1)));
      },
      taireVoix() {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      },
      arreterSons() {
        app.taireVoix();
        sonsEnCours.forEach(s => { try { s.source.stop(); } catch (e) { /* déjà fini */ } });
        sonsEnCours.clear();
        for (const id in donnees) if (donnees[id].type === 'son') ctrlSon(id, 'arreter');
      },
      // Arrête un seul son importé (par exemple la musique de fond), où qu'il en soit,
      // y compris s'il est joué par un contrôle Son.
      arreterSon(nom) {
        sonsEnCours.forEach(s => {
          if (s.nom !== nom) return;
          try { s.source.stop(); } catch (e) { /* déjà fini */ }
          sonsEnCours.delete(s);
        });
        for (const id in donnees) if (donnees[id].type === 'son' && donnees[id].son === nom) ctrlSon(id, 'arreter');
      },
      // Contrôles Son et Minuteur
      sonCtrl(id, action) {
        return ctrl(id) && donnees[id].type === 'video' ? ctrlVideo(id, action) : ctrlSon(id, action);
      },
      minuteur: ctrlMinuteur,
      sprite: ctrlSprite,
      // Volume en % (0 = muet, 100 = normal) d'un son, ou de tous les sons avec '*'.
      // Il s'applique aussi aux sons déjà en train de jouer.
      volume(nom, pourcent) {
        const v = Math.min(100, Math.max(0, Number(pourcent) || 0)) / 100;
        try {
          if (nom === '*') {
            volumeGeneral = v;
            if (sortie) sortie.gain.setTargetAtTime(v, audio.currentTime, 0.02);
          } else {
            volumes.set(nom, v);
            sonsEnCours.forEach(s => { if (s.nom === nom) s.volume.gain.setTargetAtTime(v, audio.currentTime, 0.02); });
          }
        } catch (e) { /* pas de carte son */ }
      },
      note(nom, secondes) {
        const duree = Math.max(0.05, Number(secondes) || 0.5);
        try { bip(NOTES[nom] || 440, 0, duree, 'triangle', sortieAudio()); } catch (e) { /* pas de carte son */ }
        return app.attendre(duree);
      },
      maintenant(quoi) {
        const d = new Date();
        const deux = n => String(n).padStart(2, '0');
        switch (quoi) {
          case 'date': return `${deux(d.getDate())}/${deux(d.getMonth() + 1)}/${d.getFullYear()}`;
          case 'heure': return `${deux(d.getHours())}:${deux(d.getMinutes())}`;
          case 'jour': return d.getDate();
          case 'mois': return d.getMonth() + 1;
          case 'annee': return d.getFullYear();
          case 'heures': return d.getHours();
          case 'minutes': return d.getMinutes();
          case 'secondes': return d.getSeconds();
          case 'jourSemaine': return ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][d.getDay()];
        }
        return '';
      },
      boucles: 0
    };

    try {
      app.boucles = 0;
      new Function('app', 'moi', code)(app, undefined);
      // Réglages « au démarrage » des contrôles invisibles, avant les blocs
      // « quand la fenêtre démarre » (qui peuvent ainsi les modifier).
      for (const id in donnees) {
        const d = donnees[id];
        if (d.type === 'son' && d.autoDemarrage) ctrlSon(id, 'jouer');
        if (d.type === 'minuteur' && d.active !== false) demarrerMinuteur(d);
        if (d.type === 'sprite' && d.anime) animerSprite(d, 'boucle');
      }
      auDemarrage.forEach(f => f());
    } catch (e) {
      signaler(e);
    }

    return {
      // Commandes du suivi, pour l'éditeur.
      suivi: {
        mode(m) {
          suivi.mode = m;
          if (m !== 'pas') relacher(true);
        },
        suivant() { relacher(false); },
        // bloc : le dernier exécuté ; enAttente : celui qui attend « bloc suivant ».
        etat() {
          return { mode: suivi.mode, bloc: suivi.bloc, instant: suivi.instant, enAttente: suivi.file.length ? suivi.file[0].id : null };
        }
      },
      // Valeurs des variables du programme (texte lisible), ou null si on ne peut pas les lire.
      variables() {
        try {
          if (!app.lireVariables) return null;
          const v = app.lireVariables();
          return Object.fromEntries(Object.entries(v).map(([nom, val]) => [nom, val === undefined ? undefined
            : typeof val === 'string' ? '« ' + val + ' »' : Array.isArray(val) ? '[' + enTexte(val) + ']' : enTexte(val)]));
        } catch (e) { return null; }
      },
      arreter() {
        arrete = true;
        nettoyages.forEach(f => f());
        app.arreterSons();
        if (sortie) sortie.disconnect(); // coupe aussi les bruitages et notes encore programmés
        attentes.forEach(clearTimeout);
        minuteurs.forEach(clearInterval);
        animations.forEach(a => clearInterval(a.horloge));
        voiles.forEach(v => v.remove());
        Object.values(fenetres).forEach(f => { f.el.remove(); if (f.voile) f.voile.remove(); });
        hote.innerHTML = '';
      }
    };
  }

  return { lancer, creerElement, appliquerStyle, couleur, lireMenus, cheminsMenus, creerBarreMenus, HAUTEUR_MENUS, decoderSon, extraitSon, contexteAudio, INVISIBLES };
}

const BlocRuntime = BlocRuntimeFactory();
