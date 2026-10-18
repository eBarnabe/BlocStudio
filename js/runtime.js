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
    video.bs-camera { background: #1e293b; object-fit: cover; }
    .bs-barreetat { display: flex; background: #f0f0f0; border-top: 1px solid #c8c8c8; color: #333; }
    .bs-barreetat > span { flex: 1; min-width: 0; display: flex; align-items: center; padding: 0 8px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-left: 1px solid #d4d4d4; }
    .bs-barreetat > span:first-child { flex: 2; border-left: 0; }
    .bs-arborescence { border: 1px solid #7a7a7a; background: #fff; overflow: auto; padding: 2px 0; user-select: none; }
    .bs-arborescence ul { list-style: none; margin: 0; padding: 0; }
    .bs-arborescence ul ul { padding-left: 16px; }
    .bs-arborescence li.bs-ferme > ul { display: none; }
    .bs-noeud { display: flex; align-items: center; gap: 4px; padding: 1px 6px 1px 2px; white-space: nowrap; cursor: default; }
    .bs-noeud:hover { background: #e5f3ff; }
    .bs-noeud.bs-choisi { background: #cce8ff; }
    .bs-fleche { width: 14px; flex: none; text-align: center; font-size: 10px; color: #64748b; }
    video.bs-camera.bs-miroir { transform: scaleX(-1); }
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
    .bs-panneau { border: 1px solid #a3acb9; overflow: hidden auto; }
    .bs-panneau-contenu { position: relative; min-width: 100%; min-height: 100%; }
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
    .bs-date, .bs-heure { border: 1px solid #7a7a7a; padding: 2px 6px; background: #fff; }
    .bs-forme svg { display: block; width: 100%; height: 100%; overflow: visible; }
    .bs-notifications { position: absolute; right: 10px; bottom: 10px; z-index: 100001; display: flex; flex-direction: column; gap: 8px;
      align-items: flex-end; pointer-events: none; }
    .bs-notification { display: flex; gap: 10px; width: 260px; max-width: calc(100vw - 40px); padding: 10px 12px; border-radius: 8px;
      background: #1f2937; color: #f9fafb; font: 13px "Segoe UI", sans-serif; box-shadow: 0 6px 20px rgba(0,0,0,.35);
      pointer-events: auto; cursor: pointer; transition: opacity .4s, transform .4s; }
    .bs-notification.bs-cachee { opacity: 0; transform: translateY(10px); }
    .bs-notification strong { display: block; margin-bottom: 2px; }
    .bs-notification div { white-space: pre-wrap; overflow-wrap: anywhere; }
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
    .bs-menu-contextuel { position: fixed; z-index: 100000; min-width: 170px; padding: 4px 0; background: #fff;
      border: 1px solid #cbd5e1; border-radius: 4px; box-shadow: 0 8px 20px rgba(0,0,0,.18);
      font: 13px "Segoe UI", system-ui, sans-serif; color: #1f2937; user-select: none; animation: bs-fondu .1s ease-out; }
    .bs-barreoutils { display: flex; align-items: center; gap: 2px; padding: 0 4px; background: #f8fafc;
      border-bottom: 1px solid #e2e5ea; overflow: hidden; user-select: none; }
    .bs-outil { display: flex; align-items: center; gap: 5px; height: calc(100% - 6px); padding: 0 8px; border: 1px solid transparent;
      border-radius: 4px; background: transparent; font: inherit; color: inherit; cursor: pointer; white-space: nowrap; }
    .bs-outil:hover:not(:disabled) { background: #e0e7ff; border-color: #c7d2fe; }
    .bs-outil:active:not(:disabled) { background: #c7d2fe; }
    .bs-outil:disabled { opacity: .4; cursor: default; }
    .bs-outil-icone { font-size: 1.2em; line-height: 1; }
    .bs-outil-sep { width: 1px; align-self: stretch; margin: 6px 3px; background: #cbd5e1; }

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
    .bs-poignee { position: absolute; right: 0; bottom: 0; width: 14px; height: 14px; z-index: 3000; cursor: nwse-resize;
      touch-action: none; background: linear-gradient(135deg, transparent 50%, #94a3b8 50%, #94a3b8 58%, transparent 58%,
      transparent 70%, #94a3b8 70%, #94a3b8 78%, transparent 78%); }
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

  // ---- Panneau défilant ----
  // Ses contrôles sont dans son contenu : leurs X et Y comptent depuis le coin du contenu, qui s'étend
  // (au moins) jusqu'à MARGE_PANNEAU pixels après le dernier, ou jusqu'à la taille de contenu choisie.
  const MARGE_PANNEAU = 10;
  const SENS_DEFILEMENT = { vertical: ['hidden', 'auto'], horizontal: ['auto', 'hidden'], deux: ['auto', 'auto'] };
  function sensDefilement(el, sens) {
    const [x, y] = SENS_DEFILEMENT[sens] || SENS_DEFILEMENT.vertical;
    el.style.overflowX = x;
    el.style.overflowY = y;
  }
  // Taille du contenu d'un panneau, d'après ses contrôles (des objets avec x, y, largeur, hauteur).
  function tailleContenuPanneau(p, enfants) {
    let l = Number(p.largeurContenu) || 0, h = Number(p.hauteurContenu) || 0;
    for (const o of enfants) {
      l = Math.max(l, (Number(o.x) || 0) + (Number(o.largeur) || 0) + MARGE_PANNEAU);
      h = Math.max(h, (Number(o.y) || 0) + (Number(o.hauteur) || 0) + MARGE_PANNEAU);
    }
    return { largeur: Math.round(l), hauteur: Math.round(h) };
  }

  // ---- Heures « hh:mm » ----
  // Accepte « 9:5 », « 14h30 », « 7 h », ou un nombre d'heures ; '' si ce n'est pas une heure.
  function heureNormale(v) {
    const m = /^\s*(\d{1,2})\s*(?:[:h]\s*(\d{1,2})?)?\s*$/i.exec(enTexte(v ?? ''));
    if (!m) return '';
    const h = Number(m[1]), mn = Number(m[2] || 0);
    if (h > 23 || mn > 59) return '';
    return String(h).padStart(2, '0') + ':' + String(mn).padStart(2, '0');
  }
  function maintenantHeure() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  // ---- Formes : rectangle, arrondi, ovale (en CSS), triangle et ligne (en SVG) ----
  const GENRES_FORME = ['rectangle', 'arrondi', 'ovale', 'triangle', 'ligne'];
  const SENS_LIGNE = { horizontale: [0, 50, 100, 50], verticale: [50, 0, 50, 100], descendante: [0, 0, 100, 100], montante: [0, 100, 100, 0] };
  function rendreForme(el, c) {
    const genre = GENRES_FORME.includes(c.genre) ? c.genre : 'rectangle';
    const trait = couleur(c.couleurBordure || '#1e3a8a');
    const ep = Math.max(0, Number(c.epaisseur ?? 2) || 0);
    const fond = c.couleurFond ? couleur(c.couleurFond) : 'transparent';
    el.replaceChildren();
    if (genre !== 'triangle' && genre !== 'ligne') {
      Object.assign(el.style, {
        background: fond, border: ep ? `${ep}px solid ${trait}` : 'none',
        borderRadius: genre === 'ovale' ? '50%' : genre === 'arrondi' ? '14px' : '0'
      });
      return;
    }
    Object.assign(el.style, { background: 'transparent', border: 'none', borderRadius: '0' });
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    let f;
    if (genre === 'triangle') {
      f = document.createElementNS(ns, 'polygon');
      f.setAttribute('points', '50,0 100,100 0,100');
      f.setAttribute('fill', fond);
      f.setAttribute('stroke-linejoin', 'round');
    } else {
      f = document.createElementNS(ns, 'line');
      const [x1, y1, x2, y2] = SENS_LIGNE[c.sens] || SENS_LIGNE.horizontale;
      Object.entries({ x1, y1, x2, y2 }).forEach(([k, v]) => f.setAttribute(k, v));
      f.setAttribute('stroke-linecap', 'round');
    }
    f.setAttribute('stroke', ep ? trait : 'none');
    f.setAttribute('stroke-width', genre === 'ligne' ? Math.max(1, ep) : ep);
    f.setAttribute('vector-effect', 'non-scaling-stroke'); // l'épaisseur ne change pas avec la taille
    svg.appendChild(f);
    el.appendChild(svg);
  }

  // ---- Menu contextuel : un élément par ligne, « - » pour un trait ----
  function lireMenuContextuel(texte) {
    return String(texte || '').split('\n').map(l => l.trim()).filter(l => l)
      .map(l => l === '-' ? { separateur: true } : { cle: l });
  }
  const elementsMenuContextuel = texte => lireMenuContextuel(texte).filter(e => !e.separateur).map(e => e.cle);

  // ---- Barre d'outils : un bouton par ligne (« 💾 Enregistrer »), « - » pour un trait ----
  // Le premier mot sert d'icône s'il ne contient ni lettre ni chiffre (un emoji, un symbole).
  function lireBarreOutils(texte) {
    return String(texte || '').split('\n').map(l => l.trim()).filter(l => l).map(l => {
      if (l === '-') return { separateur: true };
      const m = /^(\S+)\s+(.+)$/u.exec(l);
      return m && !/[\p{L}\p{N}]/u.test(m[1]) ? { cle: l, icone: m[1], texte: m[2] }
        : !/[\p{L}\p{N}]/u.test(l) ? { cle: l, icone: l, texte: '' } : { cle: l, icone: '', texte: l };
    });
  }
  const elementsBarreOutils = texte => lireBarreOutils(texte).filter(e => !e.separateur).map(e => e.cle);

  function rendreBarreOutils(el, c) {
    el.replaceChildren(...lireBarreOutils(c.boutons).map(o => {
      if (o.separateur) return Object.assign(document.createElement('span'), { className: 'bs-outil-sep' });
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'bs-outil';
      b.dataset.cle = o.cle;
      if (o.icone) b.appendChild(Object.assign(document.createElement('span'), { className: 'bs-outil-icone', textContent: o.icone }));
      if (o.texte && !(c.iconesSeules && o.icone)) b.appendChild(document.createTextNode(o.texte));
      if (o.texte && c.iconesSeules && o.icone) b.title = o.texte;
      return b;
    }));
  }

  // ---- Tableaux ----
  // ---- Barre d'état : des cases séparées par « | » ----
  function remplirBarreEtat(el, cases) {
    el.replaceChildren(...cases.map(t => {
      const s = document.createElement('span');
      s.textContent = enTexte(t);
      return s;
    }));
  }

  // ---- Arborescence ----
  // « Animaux\n  Chats\n  Chiens\nPlantes » : un élément par ligne, décalé d'espaces pour le ranger
  // dans celui du dessus. Chaque élément : { texte, enfants, ouvert }.
  function lireArbre(texte) {
    const racine = { enfants: [] }, pile = [{ retrait: -1, noeud: racine }];
    for (const ligne of String(texte || '').split('\n')) {
      const t = ligne.trim();
      if (!t) continue;
      const retrait = ligne.length - ligne.trimStart().length;
      while (pile.length > 1 && pile[pile.length - 1].retrait >= retrait) pile.pop();
      const n = { texte: t, enfants: [], ouvert: false };
      pile[pile.length - 1].noeud.enfants.push(n);
      pile.push({ retrait, noeud: n });
    }
    return racine.enfants;
  }

  function toutOuvrir(noeuds, ouvert) {
    for (const n of noeuds) { n.ouvert = ouvert; toutOuvrir(n.enfants, ouvert); }
  }

  // Dessine l'arbre ; chaque ligne garde son élément (ligne.noeud).
  function rendreArbre(el, noeuds, choisi) {
    const liste = elements => {
      const ul = document.createElement('ul');
      for (const n of elements) {
        const li = document.createElement('li');
        if (n.enfants.length && !n.ouvert) li.className = 'bs-ferme';
        const ligne = document.createElement('div');
        ligne.className = 'bs-noeud' + (n === choisi ? ' bs-choisi' : '');
        ligne.noeud = n;
        const fleche = document.createElement('span');
        fleche.className = 'bs-fleche';
        fleche.textContent = n.enfants.length ? (n.ouvert ? '▾' : '▸') : '';
        const texte = document.createElement('span');
        texte.textContent = (n.enfants.length ? (n.ouvert ? '📂 ' : '📁 ') : '📄 ') + n.texte;
        ligne.append(fleche, texte);
        li.appendChild(ligne);
        if (n.enfants.length) li.appendChild(liste(n.enfants));
        ul.appendChild(li);
      }
      return ul;
    };
    el.replaceChildren(liste(noeuds));
  }

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
  const INVISIBLES = ['son', 'minuteur', 'basedonnees', 'fichier', 'menucontextuel'];

  // Contrôle Fichier : ce que montrent les boîtes « Ouvrir » et « Enregistrer sous ».
  const TYPES_FICHIER = {
    texte: { accept: '.txt,text/plain', extension: '.txt', mime: 'text/plain', description: 'Texte' },
    csv: { accept: '.csv,text/csv', extension: '.csv', mime: 'text/csv', description: 'Tableur (CSV)' },
    image: { accept: 'image/*', extension: '.png', mime: 'image/png', description: 'Image' },
    son: { accept: 'audio/*,.mp3,.wav,.ogg,.m4a', extension: '.mp3', mime: 'audio/mpeg', description: 'Son' },
    tous: { accept: '', extension: '.txt', mime: 'application/octet-stream', description: 'Fichier' }
  };

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
        remplirListe(el, c.elements || [], c.trie);
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
          el.type = c.motDePasse ? 'password' : 'text';
        }
        el.placeholder = c.texteInvite || '';
        el.readOnly = !!c.lectureSeule;
        if (Number(c.longueurMax) > 0) el.maxLength = Math.round(Number(c.longueurMax));
        el.value = c.texte;
        break;
      case 'barreetat':
        el = document.createElement('div');
        remplirBarreEtat(el, String(c.texte ?? '').split('|'));
        break;
      case 'arborescence': {
        el = document.createElement('div');
        const noeuds = lireArbre(c.arbre);
        if (c.deplie !== false || prefixe === 'design') toutOuvrir(noeuds, true);
        rendreArbre(el, noeuds, null);
        break;
      }
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
        remplirListe(el, c.elements || [], c.trie);
        break;
      case 'curseur':
        el = document.createElement('input');
        el.type = 'range';
        el.min = c.min ?? 0;
        el.max = c.max ?? 100;
        el.step = c.pas || 1;
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
      case 'heure':
        el = document.createElement('input');
        el.type = 'time';
        el.value = heureNormale(c.heure) || maintenantHeure();
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
      case 'panneau':
        el = document.createElement('div');
        el.appendChild(document.createElement('div')).className = 'bs-panneau-contenu';
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
      case 'camera':
        // Dans le concepteur : un aperçu (la caméra ne s'allume que pendant l'exécution).
        if (prefixe === 'design') {
          el = apercu('📷', 'Caméra : image en direct quand le programme tourne');
          break;
        }
        el = document.createElement('video');
        el.playsInline = true;
        el.muted = true;
        if (c.miroir !== false) el.classList.add('bs-miroir');
        break;
      case 'barreoutils':
        el = document.createElement('div');
        rendreBarreOutils(el, c);
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
    if (c.type === 'forme') rendreForme(el, c);
    if (c.type === 'panneau') sensDefilement(el, c.defilement);
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

  // Ordre alphabétique « naturel » (« Élément 2 » avant « Élément 10 »), sans tenir compte des majuscules ni des accents.
  const ordreAlpha = (a, b) => a.localeCompare(b, 'fr', { numeric: true, sensitivity: 'base' });

  function remplirListe(select, elements, trie) {
    select.innerHTML = '';
    const textes = elements.map(enTexte);
    if (trie) textes.sort(ordreAlpha);
    for (const e of textes) {
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
      zIndex: c.type === 'cadre' || c.type === 'onglets' || c.type === 'panneau' ? 0 : 1
    });
    if (c.type === 'sprite') el.style.objectFit = 'contain';
    appliquerApparence(el, c);
  }

  // Apparence réglable : infobulle, gras, italique, alignement du texte, bordure, ajustement d'une image.
  const ALIGNEMENTS = { gauche: 'left', centre: 'center', droite: 'right' };
  const BORDURES = { aucune: '', simple: '1px solid #64748b', creuse: '2px inset #e2e8f0' };
  const AJUSTEMENTS = { entiere: 'contain', etiree: 'fill', recadree: 'cover' };
  const ALIGNABLES = ['bouton', 'etiquette', 'zonetexte', 'lien'];

  function appliquerApparence(el, c) {
    el.title = c.infobulle ? enTexte(c.infobulle) : '';
    el.style.fontWeight = c.gras ? 'bold' : '';
    el.style.fontStyle = c.italique ? 'italic' : '';
    if (ALIGNABLES.includes(c.type)) {
      const a = ALIGNEMENTS[c.alignement] || '';
      el.style.textAlign = a;
      if (c.type === 'lien') el.style.justifyContent = a === 'center' ? 'center' : a === 'right' ? 'flex-end' : '';
    }
    if (c.type === 'etiquette' || c.type === 'image') el.style.border = BORDURES[c.bordure] || '';
    if (c.type === 'image') el.style.objectFit = AJUSTEMENTS[c.ajustement] || 'contain';
  }

  // Valeur d'une propriété d'apparence, ramenée à ce qu'elle peut valoir.
  function valeurApparence(prop, valeur) {
    const choix = v => enTexte(v).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    switch (prop) {
      case 'gras': case 'italique': return !!valeur;
      case 'infobulle': return enTexte(valeur);
      case 'alignement': { const v = choix(valeur); return ALIGNEMENTS[v] ? v : v === 'centree' || v === 'milieu' ? 'centre' : 'gauche'; }
      case 'bordure': { const v = choix(valeur); return BORDURES[v] !== undefined ? v : 'aucune'; }
      case 'ajustement': { const v = choix(valeur); return AJUSTEMENTS[v] ? v : 'entiere'; }
    }
  }
  const PROPS_APPARENCE = ['infobulle', 'gras', 'italique', 'alignement', 'bordure', 'ajustement'];

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
    let barreMenus = null;
    if (menus.length) {
      barreMenus = creerBarreMenus(menus, chemin => (actionsMenus[chemin] || []).forEach(f => f()));
      barreMenus.style.width = fenetre.largeur + 'px';
      hote.appendChild(barreMenus);
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

    // Taille actuelle de chaque fenêtre ('' : la principale) : elle change quand on la redimensionne.
    const tailles = { '': { largeur: fenetre.largeur, hauteur: fenetre.hauteur } };
    const principale = { def: fenetre, surface, barreMenus, ouverte: true, surTaille: [] };

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
      const f = fenetres[def.id] = { def, el, titre, surface: s, voile: null, ouverte: false, surOuverture: [], surFermeture: [], surTaille: [], attentes: [] };
      tailles[def.id] = { largeur: def.largeur, hauteur: def.hauteur };
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
    // Taille de la fenêtre (principale ou autre) où se trouve un contrôle.
    const idFenetreDe = d => fenetres[d.fenetre] ? d.fenetre : '';
    const fenetreDe = d => tailles[idFenetreDe(d)];

    // ---- Fenêtres redimensionnables ----
    // Change la taille d'une fenêtre (sans descendre sous sa taille minimale) ; ses contrôles suivent leur ancrage.
    function redimensionner(f, largeur, hauteur) {
      const idF = f === principale ? '' : f.def.id, t = tailles[idF];
      const l = Math.round(Math.max(Number(f.def.largeurMin) || 100, Number(largeur) || 0));
      const h = Math.round(Math.max(Number(f.def.hauteurMin) || 60, Number(hauteur) || 0));
      const dl = l - t.largeur, dh = h - t.hauteur;
      if (!dl && !dh) return;
      t.largeur = l;
      t.hauteur = h;
      f.surface.style.width = l + 'px';
      f.surface.style.height = h + 'px';
      if (f.barreMenus) f.barreMenus.style.width = l + 'px';
      suivreAncrages(idF, dl, dh);
      f.surTaille.forEach(fn => fn());
    }

    // Comme l'« Anchor » de Visual Basic : un contrôle garde sa distance aux bords où il est ancré
    // (h : haut, b : bas, g : gauche, d : droite ; par défaut en haut à gauche). Ancré des deux côtés,
    // il s'étire ; d'aucun côté, il reste centré. Un contrôle posé sur des onglets ou dans un cadre
    // suit les bords de ce conteneur plutôt que ceux de la fenêtre.
    function suivreAncrages(idF, dl, dh) {
      const ids = Object.keys(donnees).filter(id => !INVISIBLES.includes(donnees[id].type) && idFenetreDe(donnees[id]) === idF);
      const cadres = ids.filter(id => donnees[id].type === 'cadre');
      const parentDe = id => {
        const d = donnees[id];
        if (d.panneau && ids.includes(d.panneau)) return d.panneau;
        if (d.onglets && ids.includes(d.onglets)) return d.onglets;
        const cx = d.x + d.largeur / 2, cy = d.y + d.hauteur / 2;
        return cadres.filter(p => {
          const c = donnees[p];
          return p !== id && c.largeur * c.hauteur > d.largeur * d.hauteur &&
            cx >= c.x && cx <= c.x + c.largeur && cy >= c.y && cy <= c.y + c.hauteur;
        }).sort((a, b) => donnees[a].largeur * donnees[a].hauteur - donnees[b].largeur * donnees[b].hauteur)[0];
      };
      const parents = Object.fromEntries(ids.map(id => [id, parentDe(id)]));
      const ecarts = {};
      const suivre = (debut, fin, decalage, etirement) =>
        debut && fin ? [decalage, etirement] : fin ? [decalage + etirement, 0] : debut ? [decalage, 0] : [decalage + etirement / 2, 0];
      const ecartDe = (id, profondeur = 0) => {
        if (ecarts[id]) return ecarts[id];
        const p = parents[id];
        let e = p && profondeur < 20 ? ecartDe(p, profondeur + 1) : { x: 0, y: 0, l: dl, h: dh };
        // Dans un panneau, les positions comptent depuis son contenu : seul son changement de taille compte.
        if (p && p === donnees[id].panneau) e = { x: 0, y: 0, l: e.l, h: e.h };
        const a = donnees[id].type === 'barreetat' ? 'bgd' : donnees[id].type === 'barreoutils' ? 'hgd' : String(donnees[id].ancrage ?? 'hg');
        const [x, l] = suivre(a.includes('g'), a.includes('d'), e.x, e.l);
        const [y, h] = suivre(a.includes('h'), a.includes('b'), e.y, e.h);
        return (ecarts[id] = { x, y, l, h });
      };
      ids.forEach(id => ecartDe(id));
      for (const id of ids) {
        const d = donnees[id], e = ecarts[id];
        if (e.x || e.y) poser(id, d.x + e.x, d.y + e.y);
        // Ce qui ne peut pas être retiré (taille déjà nulle) est gardé pour quand la fenêtre regrandit.
        d.reste = d.reste || { largeur: 0, hauteur: 0 };
        for (const [prop, ecart] of [['largeur', e.l], ['hauteur', e.h]]) {
          if (!ecart) continue;
          const voulu = d[prop] + ecart + d.reste[prop], v = Math.max(0, voulu);
          d.reste[prop] = voulu - v;
          if (v !== d[prop]) app.ecrire(id, prop, v);
        }
      }
    }

    // Poignée dans le coin en bas à droite, pour tirer la fenêtre à la souris.
    function ajouterPoignee(f) {
      const p = document.createElement('div');
      p.className = 'bs-poignee';
      p.title = 'Tirer pour changer la taille de la fenêtre';
      f.surface.appendChild(p);
      p.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        const t = tailles[f === principale ? '' : f.def.id];
        const depart = { x: e.clientX, y: e.clientY, l: t.largeur, h: t.hauteur };
        try { p.setPointerCapture(e.pointerId); } catch (err) { /* pas grave */ }
        const bouger = ev => redimensionner(f, depart.l + ev.clientX - depart.x, depart.h + ev.clientY - depart.y);
        const lacher = () => { p.removeEventListener('pointermove', bouger); p.removeEventListener('pointerup', lacher); };
        p.addEventListener('pointermove', bouger);
        p.addEventListener('pointerup', lacher);
      });
    }

    // Dans l'application .exe, la page remplit la fenêtre Windows : on suit sa taille.
    const dansExe = !!options.remplir;
    function remplirFenetreWindows() {
      if (window.innerWidth > 0 && window.innerHeight > 0) {
        redimensionner(principale, window.innerWidth, window.innerHeight - (barreMenus ? HAUTEUR_MENUS : 0));
      }
    }

    function ouvrirFenetre(f, attendre) {
      if (arrete) return JAMAIS;
      if (!f.ouverte) {
        f.ouverte = true;
        // Centrée sur la fenêtre principale, un peu décalée si d'autres sont déjà ouvertes.
        const r = surface.getBoundingClientRect();
        const decalage = 24 * Object.values(fenetres).filter(x => x.ouverte && x !== f).length;
        const t = tailles[f.def.id];
        f.el.style.left = Math.max(0, r.left + (r.width - t.largeur) / 2 + decalage) + 'px';
        f.el.style.top = Math.max(0, r.top + (r.height - t.hauteur - 30) / 2 + decalage) + 'px';
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
      if (id === '') return principale;
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
        if (c.type === 'menucontextuel') Object.assign(donnees[c.id], { actions: {}, inactifs: new Set(), source: '' });
        continue;
      }
      const el = creerElement(c, prefixe, projet.sprites);
      (fenetres[c.fenetre] ? fenetres[c.fenetre].surface : surface).appendChild(el);
      elements[c.id] = el;
      const d = donnees[c.id] = Object.assign({}, c);
      if (c.type === 'sprite') d.costume = Math.max(0, Math.round(Number(c.costume) || 0));
      if (c.type === 'zonedessin') suivreSouris(el, d);
      if (c.type === 'tableau') preparerTableau(el, d);
      if (c.type === 'camera') d.surEvenement = [];
      if (c.type === 'barreetat') d.cases = String(c.texte ?? '').split('|');
      if (c.type === 'barreoutils') {
        d.surOutil = {};
        el.addEventListener('click', e => {
          const b = e.target.closest('.bs-outil');
          if (b && !b.disabled) (d.surOutil[b.dataset.cle] || []).forEach(f => f());
        });
      }
      if (c.type === 'arborescence') preparerArbre(el, d);
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

    // Panneaux défilants : chaque contrôle posé dedans rejoint son contenu (des panneaux peuvent en contenir d'autres).
    const estPanneau = id => !!donnees[id] && donnees[id].type === 'panneau';
    for (const id in donnees) {
      const d = donnees[id];
      if (!d.panneau) continue;
      if (estPanneau(d.panneau) && d.panneau !== id && !INVISIBLES.includes(d.type)) elements[d.panneau].firstChild.appendChild(elements[id]);
      else delete d.panneau;
    }
    function majPanneau(id) {
      if (!estPanneau(id)) return;
      const enfants = Object.values(donnees).filter(o => o.panneau === id && !INVISIBLES.includes(o.type));
      const t = tailleContenuPanneau(donnees[id], enfants);
      Object.assign(elements[id].firstChild.style, { width: t.largeur + 'px', height: t.hauteur + 'px' });
    }
    // Un contrôle qui bouge ou grandit dans un panneau : le contenu s'agrandit s'il le faut (sans tout recalculer).
    function agrandirPanneau(d) {
      if (!d.panneau || !estPanneau(d.panneau)) return;
      const s = elements[d.panneau].firstChild.style;
      const l = d.x + d.largeur + MARGE_PANNEAU, h = d.y + d.hauteur + MARGE_PANNEAU;
      if (l > (parseFloat(s.width) || 0)) s.width = Math.round(l) + 'px';
      if (h > (parseFloat(s.height) || 0)) s.height = Math.round(h) + 'px';
    }
    for (const id in donnees) majPanneau(id);

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
        d.duree = duree;
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
        // Arrêté : depuis le début, ou depuis la position qu'on lui a donnée (« mettre position de … à »).
        case 'jouer': jouerCtrlSon(d, d.etat === 'arrete' ? d.position || 0 : 0).catch(signaler); break;
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

    // Un son ouvert avec un contrôle Fichier : on peut donner son contenu, ou simplement le nom du fichier ouvert.
    // Il est ajouté aux sons du programme (une seule fois) et se joue comme les autres.
    function sonDeFichier(valeur) {
      const texte = enTexte(valeur);
      const f = Object.values(donnees).find(x => x.type === 'fichier' && x.contenu && (x.contenu === texte || x.nomFichier === texte.trim()));
      if (f && f.luEnTexte) {
        throw new Error(`« ${f.nom} » a lu « ${f.nomFichier} » comme du texte : il ne peut pas se jouer. ` +
          `Dans les propriétés de ${f.nom}, choisissez « Type de fichier proposé : Son ».`);
      }
      const adresse = f ? f.contenu : texte;
      if (!/^data:/.test(adresse)) return null;
      let s = [...sonsProjet.values()].find(x => x.donnees === adresse);
      if (!s) {
        s = { id: 'fichier' + sonsProjet.size, nom: f ? f.nomFichier : 'son du fichier', donnees: adresse };
        sonsProjet.set(s.id, s);
      }
      return s;
    }

    // Durée du son choisi, en secondes : connue une fois le son décodé (0 en attendant, ou sans son).
    function preparerDuree(d) {
      d.duree = 0;
      const s = sonsProjet.get(d.son);
      if (!s) return;
      const jeton = d.jetonDuree = {};
      decoderSon(s.donnees).then(tampon => {
        if (d.jetonDuree !== jeton) return; // un autre son a été choisi entre-temps
        const [debut, fin] = extraitSon(s, tampon);
        d.duree = fin - debut;
      }, () => { /* l'erreur sera signalée à la lecture */ });
    }

    // Où en est la lecture, en secondes depuis le début.
    function positionSon(d) {
      if (d.etat === 'lecture' && d.lecture) {
        const ecoule = audio.currentTime - d.lecture.depart;
        return d.lecture.source.loop ? ecoule % d.lecture.cycle : Math.min(ecoule, d.lecture.duree);
      }
      return d.position || 0;
    }

    function lireSon(d, prop) {
      switch (prop) {
        case 'duree': return Math.round((d.duree || 0) * 100) / 100;
        case 'position': return Math.round(positionSon(d) * 100) / 100;
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
          const s = [...sonsProjet.values()].find(x => x.nom === nom || x.id === nom) || sonDeFichier(valeur);
          if (!s) throw new Error(`Il n'y a pas de son nommé « ${nom} » dans le projet (ni de fichier son ouvert avec ce nom).`);
          const rejouer = d.etat === 'lecture';
          couperCtrlSon(d);
          d.son = s.id;
          d.etat = 'arrete';
          d.position = 0;
          preparerDuree(d);
          if (rejouer) jouerCtrlSon(d, 0).catch(signaler);
          break;
        }
        // Aller à un endroit de la chanson (en secondes) : en lecture, elle continue de là.
        case 'position': {
          const p = Math.max(0, Number(valeur) || 0);
          if (d.etat === 'lecture') jouerCtrlSon(d, p).catch(signaler);
          else d.position = d.duree ? Math.min(p, d.duree) : p;
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

    // ---- Menus contextuels (clic droit) ----
    let menuOuvert = null;
    const pointeur = { x: 0, y: 0 }; // dernière position de la souris dans la page
    ecouter(document, 'pointermove', e => { pointeur.x = e.clientX; pointeur.y = e.clientY; }, true);
    ecouter(document, 'pointerdown', e => {
      pointeur.x = e.clientX; pointeur.y = e.clientY;
      if (menuOuvert && !menuOuvert.contains(e.target)) fermerMenuContextuel();
    }, true);
    ecouter(document, 'keydown', e => { if (e.key === 'Escape') fermerMenuContextuel(); });

    function fermerMenuContextuel() {
      if (menuOuvert) menuOuvert.remove();
      menuOuvert = null;
    }

    // source : nom du contrôle (ou de la fenêtre) sur lequel on a cliqué.
    function ouvrirMenuContextuel(idMenu, source, x, y) {
      fermerMenuContextuel();
      const m = donnees[idMenu];
      if (!m || arrete) return;
      m.source = source;
      const boite = document.createElement('div');
      boite.className = 'bs-menu-contextuel';
      for (const it of lireMenuContextuel(m.menu)) {
        const e = document.createElement('div');
        if (it.separateur) e.className = 'bs-menu-sep';
        else {
          e.className = 'bs-menu-item' + (m.inactifs.has(it.cle) ? ' bs-inactif' : '');
          e.textContent = it.cle;
          e.addEventListener('click', () => { fermerMenuContextuel(); (m.actions[it.cle] || []).forEach(f => f()); });
        }
        boite.appendChild(e);
      }
      boite.addEventListener('contextmenu', e => e.preventDefault());
      document.body.appendChild(boite);
      // Le menu reste dans la page : il s'ouvre vers la gauche ou vers le haut s'il le faut.
      const r = boite.getBoundingClientRect();
      boite.style.left = Math.max(0, x + r.width > innerWidth ? x - r.width : x) + 'px';
      boite.style.top = Math.max(0, y + r.height > innerHeight ? y - r.height : y) + 'px';
      menuOuvert = boite;
    }

    // Le clic droit sur ce contrôle ouvre son menu contextuel (propriété « menuContextuel »).
    function brancherMenuContextuel(id) {
      const d = donnees[id];
      if (!d.menuContextuel || INVISIBLES.includes(d.type)) return;
      ecouter(elements[id], 'contextmenu', e => {
        if (!donnees[d.menuContextuel]) return;
        e.preventDefault();
        e.stopPropagation();
        ouvrirMenuContextuel(d.menuContextuel, d.nom, e.clientX, e.clientY);
      });
    }
    // Clic droit sur le fond d'une fenêtre : son propre menu contextuel.
    function brancherMenuFenetre(def, s, nom) {
      if (!def.menuContextuel) return;
      ecouter(s, 'contextmenu', e => {
        if (e.target !== s || !donnees[def.menuContextuel]) return;
        e.preventDefault();
        ouvrirMenuContextuel(def.menuContextuel, nom, e.clientX, e.clientY);
      });
    }

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
        else if (d.type === 'panneau') el.addEventListener('scroll', appel); // il défile
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
    const CLONABLES = ['sprite', 'image', 'etiquette', 'forme'];
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
      if (!CLONABLES.includes(source.type)) throw new Error(`« ${source.nom} » ne peut pas être cloné : seuls les sprites, les images, les étiquettes et les formes le peuvent.`);
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
      brancherMenuContextuel(cid);
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
      agrandirPanneau(d);
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

    // ---- Fichiers ----
    // Boîte « Enregistrer sous » (ou téléchargement). Renvoie le nom choisi, ou '' si l'utilisateur annule.
    async function enregistrerSous(contenu, nom, type) {
      const t = TYPES_FICHIER[type] || TYPES_FICHIER.tous;
      nom = enTexte(nom).trim().replace(/[\\/:*?"<>|]+/g, '') || 'fichier';
      if (!/\.[a-z0-9]{1,5}$/i.test(nom)) nom += t.extension;
      // Un fichier .csv commence par une marque « UTF-8 » pour qu'Excel affiche bien les accents.
      if (typeof contenu === 'string' && /\.csv$/i.test(nom)) contenu = '\ufeff' + contenu;
      if (options.enregistrer) return (await options.enregistrer(nom, contenu)) === null ? '' : nom;
      if (window.showSaveFilePicker) {
        try {
          const extension = (nom.match(/\.[a-z0-9]+$/i) || [t.extension])[0].toLowerCase();
          const fichier = await window.showSaveFilePicker({
            suggestedName: nom,
            types: [{ description: t.description, accept: { [t.mime === 'application/octet-stream' ? 'text/plain' : t.mime]: [extension] } }]
          });
          const flux = await fichier.createWritable();
          await flux.write(contenu);
          await flux.close();
          return fichier.name;
        } catch (e) {
          if (e.name === 'AbortError') return '';
          // Sinon (navigateur qui refuse) : simple téléchargement, ci-dessous.
        }
      }
      const url = URL.createObjectURL(new Blob([contenu], { type: t.mime }));
      const a = document.createElement('a');
      a.href = url;
      a.download = nom;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return nom;
    }

    // Boîte « Ouvrir » : le fichier choisi, ou null si l'utilisateur annule.
    function choisirFichierAOuvrir(type) {
      return new Promise(resoudre => {
        const choix = document.createElement('input');
        choix.type = 'file';
        choix.accept = (TYPES_FICHIER[type] || TYPES_FICHIER.tous).accept;
        choix.addEventListener('change', () => resoudre(choix.files[0] || null));
        choix.addEventListener('cancel', () => resoudre(null));
        choix.click();
      });
    }

    // Avec « Tous les fichiers », une image ou un son se lit en « adresse », le reste en texte.
    function luEnAdresse(type, fichier) {
      return type === 'image' || type === 'son' || (type === 'tous' && /^(image|audio)\//.test(fichier.type));
    }

    // Une image ou un son se lit en « adresse » (data:…), utilisable par un contrôle Image ou Son ; le reste en texte.
    function lireContenu(fichier, enImage) {
      if (enImage) {
        return new Promise((ok, erreur) => {
          const r = new FileReader();
          r.onload = () => ok(r.result);
          r.onerror = () => erreur(r.error);
          r.readAsDataURL(fichier);
        });
      }
      return fichier.text().then(t => t.replace(/^\ufeff/, ''));
    }

    function chargerImage(url) {
      return new Promise((ok, erreur) => {
        const img = new Image();
        img.onload = () => ok(img);
        img.onerror = () => erreur(new Error('Ce fichier n\'est pas une image lisible.'));
        img.src = url;
      });
    }

    // Image d'une zone de dessin, sur sa couleur de fond (blanc par défaut), à sa taille dans la fenêtre.
    function pngDeDessin(id) {
      const d = donnees[id], toile = elements[id];
      const sortie = document.createElement('canvas');
      sortie.width = Math.round(d.largeur);
      sortie.height = Math.round(d.hauteur);
      const g = sortie.getContext('2d');
      g.fillStyle = d.couleurFond ? couleur(d.couleurFond) : '#ffffff';
      g.fillRect(0, 0, sortie.width, sortie.height);
      g.drawImage(toile, 0, 0, sortie.width, sortie.height);
      return octetsDataUrl(sortie.toDataURL('image/png'));
    }

    function octetsDataUrl(url) {
      return Uint8Array.from(atob(url.slice(url.indexOf(',') + 1)), c => c.charCodeAt(0));
    }

    // ---- Presse-papiers et impression ----
    // L'image que montre un contrôle (zone de dessin, graphique, image, caméra), dans une toile.
    async function toileDe(id) {
      ctrl(id);
      const d = donnees[id], el = elements[id];
      let source = el, l = d.largeur, h = d.hauteur;
      if (d.type === 'image') {
        source = await chargerImage(el.src);
        l = source.naturalWidth; h = source.naturalHeight;
      } else if (d.type === 'camera') {
        if (!el.videoWidth) throw new Error(`« ${d.nom} » n'est pas allumée : utilisez d'abord le bloc « allumer ${d.nom} ».`);
        l = el.videoWidth; h = el.videoHeight;
      } else if (d.type !== 'zonedessin' && d.type !== 'graphique') {
        throw new Error(`« ${d.nom} » ne montre pas d'image : choisissez une zone de dessin, une image, un graphique ou une caméra.`);
      }
      const toile = document.createElement('canvas');
      toile.width = Math.max(1, Math.round(l));
      toile.height = Math.max(1, Math.round(h));
      const g = toile.getContext('2d');
      if (d.type === 'zonedessin') {
        g.fillStyle = d.couleurFond ? couleur(d.couleurFond) : '#ffffff';
        g.fillRect(0, 0, toile.width, toile.height);
      }
      g.drawImage(source, 0, 0, toile.width, toile.height);
      return toile;
    }

    // Copie d'un morceau de la fenêtre pour l'imprimer : les dessins deviennent des images,
    // les zones de saisie gardent ce qu'on y a écrit.
    function copieImprimable(el) {
      const copie = el.cloneNode(true);
      const avant = [el, ...el.querySelectorAll('*')], apres = [copie, ...copie.querySelectorAll('*')];
      avant.forEach((o, i) => {
        const c = apres[i];
        if (o instanceof HTMLCanvasElement || (o instanceof HTMLVideoElement && o.videoWidth)) {
          const img = document.createElement('img');
          let toile = o;
          if (o instanceof HTMLVideoElement) {
            toile = document.createElement('canvas');
            toile.width = o.videoWidth; toile.height = o.videoHeight;
            toile.getContext('2d').drawImage(o, 0, 0);
          }
          try { img.src = toile.toDataURL('image/png'); } catch (e) { /* image d'un autre site : on la laisse vide */ }
          img.className = c.className;
          img.style.cssText = c.style.cssText;
          c.replaceWith(img);
        } else if (o instanceof HTMLTextAreaElement) {
          c.textContent = o.value;
        } else if (o instanceof HTMLInputElement) {
          if (o.type === 'checkbox' || o.type === 'radio') c.toggleAttribute('checked', o.checked);
          else c.setAttribute('value', o.value);
        } else if (o instanceof HTMLSelectElement) {
          [...c.options].forEach((opt, k) => opt.toggleAttribute('selected', o.options[k] && o.options[k].selected));
        } else if (o instanceof HTMLIFrameElement) {
          const p = document.createElement('div');
          p.style.cssText = c.style.cssText + ';border:1px solid #999;display:flex;align-items:center;justify-content:center';
          p.textContent = '🌐 ' + (o.src || 'page web');
          c.replaceWith(p);
        }
      });
      return copie;
    }

    // Ce qu'on imprime pour un contrôle : tout son texte, tout son tableau, ou ce qu'il montre.
    async function pageDeControle(id) {
      ctrl(id);
      const d = donnees[id], el = elements[id];
      if (INVISIBLES.includes(d.type)) throw new Error(`« ${d.nom} » ne se voit pas dans la fenêtre : il n'y a rien à imprimer.`);
      if (d.type === 'zonetexte' && !d.motDePasse) return pageDeTexte(el.value);
      if (['zonedessin', 'graphique', 'image', 'camera'].includes(d.type)) {
        const img = document.createElement('img');
        img.src = (await toileDe(id)).toDataURL('image/png');
        return img;
      }
      const copie = copieImprimable(el);
      Object.assign(copie.style, { position: 'relative', left: '0', top: '0', transform: 'none' });
      if (d.type === 'tableau') Object.assign(copie.style, { height: 'auto', overflow: 'visible' });
      return copie;
    }

    function pageDeTexte(texte) {
      const p = document.createElement('pre');
      p.className = 'bs-impression-texte';
      p.textContent = enTexte(texte);
      return p;
    }

    // Une fenêtre telle qu'on la voit, réduite si elle est plus large que la feuille.
    function pageDeFenetre(f) {
      const copie = copieImprimable(f.surface);
      const t = tailles[f === principale ? '' : f.def.id];
      Object.assign(copie.style, { position: 'relative', left: '0', top: '0', width: t.largeur + 'px', height: t.hauteur + 'px', border: '1px solid #999' });
      const cadre = document.createElement('div');
      cadre.style.zoom = Math.min(1, 680 / Math.max(1, t.largeur));
      cadre.appendChild(copie);
      return cadre;
    }

    // La page est mise dans un cadre caché, puis la boîte « Imprimer » de Windows s'ouvre.
    async function imprimerPage(titre, contenu) {
      const cadre = document.createElement('iframe');
      cadre.className = 'bs-impression';
      cadre.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
      document.body.appendChild(cadre);
      const doc = cadre.contentDocument;
      doc.open();
      doc.write('<!doctype html><html><head><meta charset="utf-8"><title></title><style>' + STYLE +
        ' body { margin: 0; font-family: "Segoe UI", sans-serif; color: #000; background: #fff; }' +
        ' .bs-impression-texte { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font: 12pt "Segoe UI", sans-serif; }' +
        ' img { max-width: 100%; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
        '</style></head><body></body></html>');
      doc.close();
      doc.title = enTexte(titre);
      doc.body.appendChild(doc.adoptNode(contenu));
      await Promise.all([...doc.images].map(i => i.decode().catch(() => {})));
      // Application Windows : sa fenêtre peut être petite, l'aperçu s'ouvre dans une fenêtre « Impression » à part.
      const webview = window.chrome && window.chrome.webview;
      if (dansExe && webview) {
        const page = '<!doctype html>' + doc.documentElement.outerHTML;
        cadre.remove();
        const fini = new Promise(ok => attentesImpression.push(ok));
        webview.postMessage('imprimer:' + page);
        return fini;
      }
      try {
        cadre.contentWindow.focus();
        cadre.contentWindow.print(); // attend que la boîte « Imprimer » soit fermée
      } finally {
        setTimeout(() => cadre.remove(), 1000);
      }
    }

    // L'application Windows répond « imprime » quand sa fenêtre « Impression » est fermée.
    const attentesImpression = [];
    if (dansExe && window.chrome && window.chrome.webview) {
      window.chrome.webview.addEventListener('message', e => {
        if (e.data === 'imprime') attentesImpression.splice(0).forEach(ok => ok());
      });
    }

    // Bulle de notification dans un coin de la fenêtre (quand on n'est pas dans une application Windows).
    const ICONES_NOTIFICATION = { info: 'ℹ️', avertissement: '⚠️', erreur: '❌', aucune: '🔔' };
    function bulleNotification(titre, texte, icone) {
      let pile = principale.surface.querySelector(':scope > .bs-notifications');
      if (!pile) {
        pile = document.createElement('div');
        pile.className = 'bs-notifications';
        principale.surface.appendChild(pile);
      }
      const bulle = document.createElement('div');
      bulle.className = 'bs-notification bs-cachee';
      const i = document.createElement('span');
      i.textContent = ICONES_NOTIFICATION[icone] || ICONES_NOTIFICATION.aucune;
      const corps = document.createElement('span');
      const t = document.createElement('strong');
      t.textContent = titre;
      const m = document.createElement('div');
      m.textContent = texte;
      corps.append(t, m);
      bulle.append(i, corps);
      pile.appendChild(bulle);
      requestAnimationFrame(() => bulle.classList.remove('bs-cachee'));
      const fermer = () => { bulle.classList.add('bs-cachee'); setTimeout(() => bulle.remove(), 400); };
      bulle.addEventListener('click', fermer);
      setTimeout(fermer, 6000);
    }

    // Une image dans une zone de dessin : ajustée à la zone, sans être déformée.
    async function dessinerImage(id, url) {
      const img = await chargerImage(url);
      const d = donnees[id], g = elements[id].getContext('2d');
      const k = Math.min(d.largeur / img.width, d.hauteur / img.height);
      const l = img.width * k, h = img.height * k;
      g.clearRect(0, 0, d.largeur, d.hauteur);
      g.drawImage(img, (d.largeur - l) / 2, (d.hauteur - h) / 2, l, h);
    }

    // Les « sortes » de contrôles qu'on peut remplir depuis un fichier, ou enregistrer.
    const AVEC_FICHIER_CSV = ['tableau', 'basedonnees'];
    const AVEC_FICHIER_IMAGE = ['image', 'zonedessin'];
    const AVEC_FICHIER_SON = ['son'];

    // Le contenu d'un fichier lu comme du texte n'est pas une image : on le dit clairement plutôt que d'afficher du vide.
    function verifierImage(id, valeur) {
      const f = Object.values(donnees).find(x => x.type === 'fichier' && x.luEnTexte && x.contenu && x.contenu === valeur);
      if (f) {
        throw new Error(`« ${f.nom} » a lu « ${f.nomFichier} » comme du texte : il ne peut pas s'afficher dans « ${donnees[id].nom} ». ` +
          `Dans les propriétés de ${f.nom}, choisissez « Type de fichier proposé : Image ».`);
      }
    }

    async function ctrlFichier(id, action, a, b) {
      ctrlDeType(id, 'fichier', 'un contrôle Fichier');
      const d = donnees[id];
      const nomPropose = () => d.nomFichier || d.nomPropose || '';
      switch (action) {
        case 'ouvrir': {
          const f = await choisirFichierAOuvrir(d.typeFichier);
          d.annule = !f;
          if (!f) return;
          d.nomFichier = f.name;
          const enAdresse = luEnAdresse(d.typeFichier, f);
          d.luEnTexte = !enAdresse;
          d.contenu = await lireContenu(f, enAdresse);
          return;
        }
        case 'enregistrer': {
          const nom = await enregistrerSous(enTexte(a), nomPropose(), d.typeFichier);
          d.annule = !nom;
          if (nom) d.nomFichier = nom;
          return;
        }
        // a : contrôle à remplir (tableau ou base : un CSV ; image ou zone de dessin : une image).
        case 'ouvrirDans': {
          ctrl(a);
          const cible = donnees[a];
          const enImage = AVEC_FICHIER_IMAGE.includes(cible.type), enSon = AVEC_FICHIER_SON.includes(cible.type);
          if (!enImage && !enSon && !AVEC_FICHIER_CSV.includes(cible.type)) {
            throw new Error(`On ne peut pas ouvrir un fichier dans « ${cible.nom} » : choisissez un tableau, une base de données, une image, une zone de dessin ou un son.`);
          }
          const f = await choisirFichierAOuvrir(enImage ? 'image' : enSon ? 'son' : 'csv');
          d.annule = !f;
          if (!f) return;
          d.nomFichier = f.name;
          d.luEnTexte = !(enImage || enSon);
          d.contenu = await lireContenu(f, enImage || enSon);
          if (enSon) return app.ecrire(a, 'son', d.contenu);
          if (cible.type === 'tableau') app.tableau(a, 'csv', d.contenu);
          else if (cible.type === 'basedonnees') app.base(a, 'csv', d.contenu);
          else if (cible.type === 'image') app.ecrire(a, 'image', d.contenu);
          else await dessinerImage(a, d.contenu);
          return;
        }
        // a : contrôle à enregistrer (tableau ou base en CSV, zone de dessin en PNG).
        case 'enregistrerDe': {
          ctrl(a);
          const cible = donnees[a];
          const base = (nomPropose() || cible.nom).replace(/\.[a-z0-9]{1,5}$/i, '');
          let nom;
          if (cible.type === 'zonedessin') nom = await enregistrerSous(pngDeDessin(a), base + '.png', 'image');
          else if (cible.type === 'tableau') nom = await enregistrerSous(app.lireTableau(a, 'csv'), base + '.csv', 'csv');
          else if (cible.type === 'basedonnees') nom = await enregistrerSous(app.lireBase(a, 'csv'), base + '.csv', 'csv');
          else if (cible.type === 'camera') {
            if (!cible.photo) throw new Error(`« ${cible.nom} » n'a pas encore pris de photo (bloc « prendre une photo avec… »).`);
            nom = await enregistrerSous(octetsDataUrl(cible.photo), base + '.png', 'image');
          }
          else throw new Error(`On ne peut pas enregistrer « ${cible.nom} » dans un fichier : choisissez un tableau, une base de données, une zone de dessin ou une caméra.`);
          d.annule = !nom;
          if (nom) d.nomFichier = nom;
          return;
        }
      }
    }

    function lireFichierCtrl(d, prop) {
      switch (prop) {
        case 'contenu': return d.contenu ?? '';
        case 'nomFichier': return d.nomFichier || '';
        case 'annule': return !!d.annule;
        case 'nomPropose': return d.nomPropose || '';
        case 'typeFichier': return d.typeFichier || 'texte';
      }
      return '';
    }

    // Glisser-déposer un fichier sur la fenêtre : « quand un fichier est déposé, avec Fichier1 ».
    hote.addEventListener('dragover', e => {
      if (Object.values(donnees).some(d => d.type === 'fichier' && d.surEvenement.length)) e.preventDefault();
    });
    hote.addEventListener('drop', async e => {
      const recepteurs = Object.values(donnees).filter(d => d.type === 'fichier' && d.surEvenement.length);
      const f = e.dataTransfer && e.dataTransfer.files[0];
      if (!recepteurs.length || !f) return;
      e.preventDefault();
      for (const d of recepteurs) {
        try {
          d.luEnTexte = !luEnAdresse(d.typeFichier, f);
          d.contenu = await lireContenu(f, !d.luEnTexte);
          d.nomFichier = f.name;
          d.annule = false;
          d.surEvenement.forEach(h => h());
        } catch (err) { signaler(err); }
      }
    });

    // ---- Arborescence ----
    function preparerArbre(el, d) {
      d.noeuds = lireArbre(d.arbre);
      if (d.deplie !== false) toutOuvrir(d.noeuds, true);
      d.choisi = null;
      rendreArbre(el, d.noeuds, null); // les lignes affichées doivent désigner ces éléments-là
      const ligneDe = e => e.target.closest('.bs-noeud');
      el.addEventListener('click', e => {
        const ligne = ligneDe(e);
        if (!ligne) return;
        const n = ligne.noeud;
        // La flèche déplie ou replie ; ailleurs, on choisit l'élément.
        if (e.target.classList.contains('bs-fleche')) {
          n.ouvert = !n.ouvert;
          rendreArbre(el, d.noeuds, d.choisi);
          return;
        }
        if (d.choisi === n) return;
        d.choisi = n;
        rendreArbre(el, d.noeuds, d.choisi);
        el.dispatchEvent(new Event('input')); // « quand Arbre1 change »
      });
      el.addEventListener('dblclick', e => {
        const ligne = ligneDe(e);
        if (!ligne || !ligne.noeud.enfants.length) return;
        ligne.noeud.ouvert = !ligne.noeud.ouvert;
        rendreArbre(el, d.noeuds, d.choisi);
      });
    }

    // « Animaux › Chats » (ou « Animaux > Chats ») → les textes de chaque niveau.
    const partiesChemin = chemin => enTexte(chemin).split(/\s*[›>]\s*/).map(s => s.trim()).filter(Boolean);

    // Élément désigné par son chemin, avec la liste qui le contient.
    function trouverNoeud(d, chemin) {
      let liste = d.noeuds, noeud = null, parent = null;
      for (const p of partiesChemin(chemin)) {
        parent = noeud;
        noeud = liste.find(n => n.texte === p) || liste.find(n => memeNom(n.texte, p));
        if (!noeud) return null;
        liste = noeud.enfants;
      }
      return noeud && { noeud, dans: parent ? parent.enfants : d.noeuds };
    }

    function noeudExistant(d, chemin) {
      const r = trouverNoeud(d, chemin);
      if (!r) throw new Error(`Il n'y a pas d'élément « ${enTexte(chemin)} » dans « ${d.nom} ».`);
      return r;
    }

    // Chemin d'un élément : « Animaux › Chats ».
    function cheminDe(noeuds, cible, avant) {
      for (const n of noeuds) {
        const ici = avant ? avant + ' › ' + n.texte : n.texte;
        if (n === cible) return ici;
        const plus = cheminDe(n.enfants, cible, ici);
        if (plus) return plus;
      }
      return '';
    }

    function tousLesChemins(noeuds, avant) {
      return noeuds.flatMap(n => {
        const ici = avant ? avant + ' › ' + n.texte : n.texte;
        return [ici, ...tousLesChemins(n.enfants, ici)];
      });
    }

    // Choisit un élément (et déplie ceux qui le contiennent pour qu'on le voie).
    function choisirNoeud(id, chemin) {
      const d = donnees[id];
      if (!enTexte(chemin).trim()) d.choisi = null;
      else {
        d.choisi = noeudExistant(d, chemin).noeud;
        let liste = d.noeuds;
        for (const p of partiesChemin(chemin)) {
          const n = liste.find(x => x.texte === p) || liste.find(x => memeNom(x.texte, p));
          if (n !== d.choisi) n.ouvert = true;
          liste = n.enfants;
        }
      }
      rendreArbre(elements[id], d.noeuds, d.choisi);
    }

    // Ajoute un élément (et ceux qui manquent sur son chemin) : « Animaux › Chats › Persan ».
    function ajouterChemin(d, chemin) {
      let liste = d.noeuds, n = null;
      for (const p of partiesChemin(chemin)) {
        if (n) n.ouvert = n.ouvert || d.deplie !== false;
        n = liste.find(x => x.texte === p);
        if (!n) { n = { texte: p, enfants: [], ouvert: d.deplie !== false }; liste.push(n); }
        liste = n.enfants;
      }
      return n;
    }

    function ctrlArbre(id, action, a, b) {
      const el = ctrlDeType(id, 'arborescence', 'une arborescence');
      const d = donnees[id];
      switch (action) {
        // a : texte du nouvel élément ; b : chemin de l'élément qui le contient ('' = premier niveau).
        case 'ajouter': {
          const texte = enTexte(a).trim();
          if (!texte) throw new Error('Il faut un texte pour le nouvel élément.');
          const dans = enTexte(b).trim() ? noeudExistant(d, b).noeud : null;
          (dans ? dans.enfants : d.noeuds).push({ texte, enfants: [], ouvert: d.deplie !== false });
          if (dans) dans.ouvert = true;
          break;
        }
        case 'supprimer': {
          const r = noeudExistant(d, a);
          if (d.choisi && (d.choisi === r.noeud || cheminDe(r.noeud.enfants, d.choisi))) d.choisi = null;
          r.dans.splice(r.dans.indexOf(r.noeud), 1);
          break;
        }
        case 'vider': d.noeuds = []; d.choisi = null; break;
        case 'deplier': toutOuvrir(d.noeuds, true); break;
        case 'replier': toutOuvrir(d.noeuds, false); break;
      }
      rendreArbre(el, d.noeuds, d.choisi);
    }

    // Textes des éléments rangés dans `chemin` ('' = ceux du premier niveau).
    function enfantsArbre(id, chemin) {
      ctrlDeType(id, 'arborescence', 'une arborescence');
      const d = donnees[id];
      const liste = enTexte(chemin).trim() ? noeudExistant(d, chemin).noeud.enfants : d.noeuds;
      return liste.map(n => n.texte);
    }

    function lireArbreCtrl(d, prop) {
      switch (prop) {
        case 'texte': return d.choisi ? d.choisi.texte : '';
        case 'chemin': return d.choisi ? cheminDe(d.noeuds, d.choisi) : '';
        case 'elements': return tousLesChemins(d.noeuds);
      }
    }

    function ecrireArbreCtrl(id, prop, valeur) {
      const d = donnees[id];
      if (prop === 'chemin') return choisirNoeud(id, valeur);
      // Une liste de chemins (« Animaux › Chats »…), ou un texte de lignes décalées comme dans les propriétés.
      d.noeuds = [];
      d.choisi = null;
      if (Array.isArray(valeur)) valeur.forEach(c => ajouterChemin(d, c));
      else {
        d.noeuds = lireArbre(enTexte(valeur));
        if (d.deplie !== false) toutOuvrir(d.noeuds, true);
      }
      rendreArbre(elements[id], d.noeuds, null);
    }

    // ---- Barre d'état ----
    function caseBarre(id, numero) {
      ctrlDeType(id, 'barreetat', 'une barre d\'état');
      const n = Math.round(Number(numero));
      if (!(n >= 1 && n <= 10)) throw new Error('Une barre d\'état a des cases numérotées de 1 à 10.');
      return n - 1;
    }

    // ---- Caméra ----
    function erreurCamera(e, nom) {
      switch (e && e.name) {
        case 'NotAllowedError': case 'SecurityError':
          return new Error(`La caméra de « ${nom} » n'est pas autorisée : acceptez son utilisation quand Windows (ou le navigateur) le demande.`);
        case 'NotFoundError': case 'OverconstrainedError':
          return new Error('Aucune caméra n\'a été trouvée sur cet ordinateur.');
        case 'NotReadableError': case 'AbortError':
          return new Error('La caméra est déjà utilisée par un autre logiciel (Teams, Zoom, l\'appli Caméra…). Fermez-le, puis réessayez.');
      }
      return e instanceof Error ? e : new Error(String(e));
    }

    async function allumerCamera(id) {
      const d = donnees[id], el = elements[id];
      if (d.flux) return;
      if (!d.allumage) {
        d.allumage = (async () => {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('La caméra n\'est pas disponible ici (ouvrez le programme dans Edge, ou exportez-le en application Windows).');
          }
          let flux;
          try {
            flux = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
          } catch (e) { throw erreurCamera(e, d.nom); }
          if (arrete) { flux.getTracks().forEach(p => p.stop()); return; }
          d.flux = flux;
          el.srcObject = flux;
          await el.play().catch(() => {});
          if (!el.videoWidth) await new Promise(ok => el.addEventListener('loadeddata', ok, { once: true }));
          surveillerMouvement(d, el);
        })().finally(() => { d.allumage = null; });
      }
      return d.allumage;
    }

    function eteindreCamera(d, el) {
      if (d.flux) d.flux.getTracks().forEach(p => p.stop());
      d.flux = null;
      clearInterval(d.guet);
      d.mouvement = 0;
      d.vignette = null;
      if (el) el.srcObject = null;
    }

    // Mouvement : on compare une petite image (32 × 24) avec la précédente, 10 fois par seconde.
    // « mouvement » = pourcentage de points qui ont changé ; au-delà du seuil, l'événement se déclenche.
    function surveillerMouvement(d, el) {
      const petite = document.createElement('canvas');
      petite.width = 32;
      petite.height = 24;
      const g = petite.getContext('2d', { willReadFrequently: true });
      let dernier = 0;
      d.guet = setInterval(() => {
        if (!d.flux || !el.videoWidth) return;
        g.drawImage(el, 0, 0, 32, 24);
        const px = g.getImageData(0, 0, 32, 24).data;
        const gris = new Uint8Array(32 * 24);
        for (let i = 0; i < gris.length; i++) gris[i] = (px[i * 4] * 3 + px[i * 4 + 1] * 6 + px[i * 4 + 2]) / 10;
        if (d.vignette) {
          let changes = 0;
          for (let i = 0; i < gris.length; i++) if (Math.abs(gris[i] - d.vignette[i]) > 25) changes++;
          d.mouvement = Math.round(changes * 100 / gris.length);
          const seuil = Math.max(1, Number(d.seuilMouvement ?? 10));
          if (d.mouvement >= seuil && Date.now() - dernier > 700) {
            dernier = Date.now();
            d.surEvenement.forEach(h => h());
          }
        }
        d.vignette = gris;
      }, 100);
      minuteurs.push(d.guet);
    }

    // La photo a le même cadrage que l'image affichée (le contrôle coupe les bords qui dépassent).
    async function prendrePhoto(id) {
      const d = donnees[id], el = elements[id];
      await allumerCamera(id);
      if (!d.flux) return;
      const sl = el.videoWidth, sh = el.videoHeight;
      const r = d.largeur > 0 && d.hauteur > 0 ? d.largeur / d.hauteur : sl / sh;
      const l = Math.round(sl / sh > r ? sh * r : sl), h = Math.round(sl / sh > r ? sh : sl / r);
      const toile = document.createElement('canvas');
      toile.width = l;
      toile.height = h;
      const g = toile.getContext('2d');
      if (d.miroir !== false) { g.translate(l, 0); g.scale(-1, 1); }
      g.drawImage(el, (sl - l) / 2, (sh - h) / 2, l, h, 0, 0, l, h);
      d.photo = toile.toDataURL('image/png');
    }

    async function ctrlCamera(id, action, a) {
      ctrlDeType(id, 'camera', 'une caméra');
      const d = donnees[id];
      switch (action) {
        case 'allumer': return allumerCamera(id);
        case 'eteindre': return eteindreCamera(d, elements[id]);
        case 'photo': return prendrePhoto(id);
        // a : contrôle Image ou zone de dessin qui reçoit la dernière photo.
        case 'photoDans': {
          ctrl(a);
          const cible = donnees[a];
          if (cible.type !== 'image' && cible.type !== 'zonedessin') {
            throw new Error(`On ne peut pas mettre une photo dans « ${cible.nom} » : choisissez une image ou une zone de dessin.`);
          }
          if (!d.photo) throw new Error(`« ${d.nom} » n'a pas encore pris de photo (bloc « prendre une photo avec… »).`);
          if (cible.type === 'image') app.ecrire(a, 'image', d.photo);
          else await dessinerImage(a, d.photo);
        }
      }
    }

    function lireCamera(d, prop) {
      switch (prop) {
        case 'allumee': return !!d.flux;
        case 'photo': return d.photo || '';
        case 'mouvement': return d.mouvement || 0;
        case 'miroir': return d.miroir !== false;
        case 'seuilMouvement': return Number(d.seuilMouvement ?? 10);
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
        if (evenement === 'fin' || evenement === 'tic' || evenement === 'depose' || evenement === 'mouvement') return donnees[id].surEvenement.push(() => h(id));
        (evenementsCtrl[id] = evenementsCtrl[id] || []).push({ evenement, h });
        brancher(id, evenement, h);
      },
      // ---- Fenêtres ----
      // action : 'ouvrir' (attendre = true : jusqu'à ce qu'elle soit fermée), 'fermer', 'titre'.
      fenetre(id, action, valeur) {
        const f = laFenetre(id);
        if (action === 'ouvrir') return ouvrirFenetre(f, valeur);
        if (action === 'fermer') fermerFenetre(f);
        if (action === 'titre') {
          const texte = enTexte(valeur);
          // La fenêtre principale : dans BlocStudio, la barre de titre de l'exécution ; ailleurs, le titre de la page
          // (celui de la fenêtre Windows dans une application exportée).
          if (f !== principale) f.titre.textContent = texte;
          else if (options.titre) options.titre(texte);
          else document.title = texte;
        }
      },
      fenetreOuverte(id) { return laFenetre(id).ouverte; },
      quandFenetre(id, quoi, fn) {
        const f = laFenetre(id), h = proteger(fn);
        (quoi === 'taille' ? f.surTaille : quoi === 'ouverture' ? f.surOuverture : f.surFermeture).push(() => h());
      },
      // La fenêtre principale d'un .exe : c'est la fenêtre Windows qui change de taille (la page suit).
      tailleFenetre(id, largeur, hauteur) {
        const f = laFenetre(id);
        const l = Math.max(Number(f.def.largeurMin) || 100, app.nombre(largeur));
        const h = Math.max(Number(f.def.hauteurMin) || 60, app.nombre(hauteur));
        const webview = window.chrome && window.chrome.webview;
        if (f === principale && dansExe && webview) {
          webview.postMessage(`taille:${Math.round(l)}x${Math.round(h + (barreMenus ? HAUTEUR_MENUS : 0))}`);
        } else redimensionner(f, l, h);
      },
      lireTailleFenetre(id, quoi) {
        laFenetre(id);
        return tailles[id][quoi === 'hauteur' ? 'hauteur' : 'largeur'];
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
        if (d.type === 'fichier') return lireFichierCtrl(d, prop);
        if (d.type === 'camera' && ['allumee', 'photo', 'mouvement', 'miroir', 'seuilMouvement'].includes(prop)) return lireCamera(d, prop);
        if (d.type === 'arborescence' && ['texte', 'chemin', 'elements'].includes(prop)) return lireArbreCtrl(d, prop);
        if (d.type === 'barreetat' && prop === 'texte') return d.cases.join('|');
        if (prop === 'motDePasse') return !!d.motDePasse;
        if (PROPS_APPARENCE.includes(prop)) {
          if (prop === 'alignement') return d.alignement || (d.type === 'bouton' ? 'centre' : 'gauche');
          if (prop === 'bordure') return d.bordure || 'aucune';
          if (prop === 'ajustement') return d.ajustement || 'entiere';
          return valeurApparence(prop, d[prop] ?? '');
        }
        if (d.type === 'zonetexte') {
          if (prop === 'texteInvite') return el.placeholder;
          if (prop === 'lectureSeule') return el.readOnly;
          if (prop === 'longueurMax') return el.maxLength > 0 ? el.maxLength : 0;
        }
        if (prop === 'trie') return !!d.trie;
        if (d.type === 'panneau') {
          if (prop === 'defilementX') return Math.round(el.scrollLeft);
          if (prop === 'defilementY') return Math.round(el.scrollTop);
          if (prop === 'defilement') return SENS_DEFILEMENT[d.defilement] ? d.defilement : 'vertical';
          if (prop === 'largeurContenu') return Math.round(el.scrollWidth);
          if (prop === 'hauteurContenu') return Math.round(el.scrollHeight);
        }
        if (d.type === 'heure' && (prop === 'heures' || prop === 'minutes')) {
          const [h, m] = (el.value || '0:0').split(':').map(Number);
          return prop === 'heures' ? h : m;
        }
        if (d.type === 'forme') {
          if (prop === 'genre') return GENRES_FORME.includes(d.genre) ? d.genre : 'rectangle';
          if (prop === 'sens') return SENS_LIGNE[d.sens] ? d.sens : 'horizontale';
          if (prop === 'epaisseur') return Number(d.epaisseur ?? 2) || 0;
          if (prop === 'couleurBordure') return d.couleurBordure || '#1e3a8a';
        }
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
            if (d.type === 'heure') return el.value;
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
          case 'pas': return d.type === 'selecteurnombre' || d.type === 'curseur' ? Number(el.step) || 1 : 1;
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
        if (d.type === 'arborescence' && ['chemin', 'elements'].includes(prop)) return ecrireArbreCtrl(id, prop, valeur);
        if (d.type === 'barreetat' && prop === 'texte') {
          d.cases = enTexte(valeur).split('|');
          return remplirBarreEtat(el, d.cases);
        }
        if (prop === 'motDePasse') {
          d.motDePasse = !!valeur;
          if (el.tagName === 'INPUT') el.type = d.motDePasse ? 'password' : 'text';
          return;
        }
        if (PROPS_APPARENCE.includes(prop)) {
          d[prop] = valeurApparence(prop, valeur);
          return appliquerApparence(el, d);
        }
        if (d.type === 'zonetexte') {
          if (prop === 'texteInvite') { el.placeholder = enTexte(valeur); return; }
          if (prop === 'lectureSeule') { el.readOnly = !!valeur; return; }
          if (prop === 'longueurMax') {
            const n = Math.round(Number(valeur) || 0);
            if (n > 0) el.maxLength = n; else el.removeAttribute('maxlength');
            return;
          }
        }
        if (d.type === 'panneau' && ['defilementX', 'defilementY', 'defilement', 'largeurContenu', 'hauteurContenu'].includes(prop)) {
          if (prop === 'defilementX') el.scrollLeft = Number(valeur) || 0;
          else if (prop === 'defilementY') el.scrollTop = Number(valeur) || 0;
          else if (prop === 'defilement') {
            const sens = enTexte(valeur).trim().toLowerCase().replace('les deux', 'deux');
            d.defilement = SENS_DEFILEMENT[sens] ? sens : 'vertical';
            sensDefilement(el, d.defilement);
          } else {
            d[prop] = Math.max(0, Number(valeur) || 0);
            majPanneau(id);
          }
          return;
        }
        if (d.type === 'heure' && (prop === 'heures' || prop === 'minutes')) {
          const [h, m] = (el.value || '0:0').split(':').map(Number);
          const n = Math.round(Number(valeur) || 0);
          el.value = heureNormale(prop === 'heures' ? `${((n % 24) + 24) % 24}:${m}` : `${h}:${Math.min(59, Math.max(0, n))}`);
          return;
        }
        if (d.type === 'forme' && ['genre', 'sens', 'epaisseur', 'couleurBordure'].includes(prop)) {
          const choix = enTexte(valeur).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (prop === 'genre') d.genre = { cercle: 'ovale', rond: 'ovale', ellipse: 'ovale', carre: 'rectangle' }[choix] || (GENRES_FORME.includes(choix) ? choix : 'rectangle');
          if (prop === 'sens') d.sens = SENS_LIGNE[choix] ? choix : 'horizontale';
          if (prop === 'epaisseur') d.epaisseur = Math.max(0, Number(valeur) || 0);
          if (prop === 'couleurBordure') d.couleurBordure = enTexte(valeur);
          return rendreForme(el, d);
        }
        if (prop === 'trie' && estListe(d.type)) {
          d.trie = !!valeur;
          if (d.trie) {
            const choisi = el.selectedIndex < 0 ? null : el.options[el.selectedIndex].textContent;
            remplirListe(el, optionsListe(el), true);
            el.selectedIndex = choisi === null ? -1 : optionsListe(el).indexOf(choisi);
          }
          return;
        }
        if (d.type === 'camera') {
          if (prop === 'allumee') { (valeur ? allumerCamera(id) : Promise.resolve(eteindreCamera(d, el))).catch(signaler); return; }
          if (prop === 'miroir') { d.miroir = !!valeur; el.classList.toggle('bs-miroir', d.miroir); return; }
          if (prop === 'seuilMouvement') { d.seuilMouvement = Math.min(100, Math.max(1, Number(valeur) || 10)); return; }
        }
        if (d.type === 'fichier') {
          if (prop === 'nomPropose') d.nomPropose = enTexte(valeur);
          if (prop === 'typeFichier') d.typeFichier = TYPES_FICHIER[enTexte(valeur).trim().toLowerCase()] ? enTexte(valeur).trim().toLowerCase() : 'tous';
          return;
        }
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
            else if (d.type === 'image') { verifierImage(id, valeur); el.src = valeur; }
            else if (estListe(d.type)) {
              const i = optionsListe(el).indexOf(enTexte(valeur));
              if (i >= 0) el.selectedIndex = i;
            } else if (aValeur(d.type) || d.type === 'barreprogression') app.ecrire(id, 'valeur', valeur);
            else if (d.type === 'cadre') el.firstChild.textContent = valeur;
            else if (d.type === 'date') el.value = dateIso(valeur);
            else if (d.type === 'heure') {
              const h = heureNormale(valeur);
              if (!h) throw new Error(`« ${enTexte(valeur)} » n'est pas une heure : écrivez-la comme 14:30.`);
              el.value = h;
            }
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
              remplirListe(el, Array.isArray(valeur) ? valeur : enTexte(valeur).split('\n'), d.trie);
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
            if (d.type === 'selecteurnombre' || d.type === 'curseur') el.step = Number(valeur) > 0 ? Number(valeur) : 'any';
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
          case 'image': if (d.type === 'image') { verifierImage(id, valeur); el.src = valeur; } break;
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
        if (prop === 'largeur' || prop === 'hauteur') agrandirPanneau(d);
        if (d.type === 'forme' && prop === 'couleurFond') rendreForme(el, d);
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
        // Liste triée : l'élément prend sa place dans l'ordre alphabétique.
        const avant = donnees[id].trie ? [...el.options].find(x => ordreAlpha(x.textContent, o.textContent) > 0) : null;
        el.insertBefore(o, avant || null);
      },
      // Le curseur clavier (le « focus ») va dans ce contrôle : on peut taper directement dedans.
      mettreFocus(id) {
        const el = ctrl(id);
        const cible = el.matches('input, textarea, select, button') ? el : el.querySelector('input, textarea, select, button');
        if (cible) cible.focus();
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
      quandMenuContextuel(id, cle, fn) {
        ctrlDeType(id, 'menucontextuel', 'un menu contextuel');
        const m = donnees[id];
        (m.actions[cle] = m.actions[cle] || []).push(proteger(fn));
      },
      activerMenuContextuel(id, cle, actif) {
        ctrlDeType(id, 'menucontextuel', 'un menu contextuel');
        if (actif) donnees[id].inactifs.delete(cle); else donnees[id].inactifs.add(cle);
      },
      // Nom du contrôle (ou de la fenêtre) sur lequel le menu a été ouvert ; '' s'il a été ouvert par un bloc.
      sourceMenuContextuel(id) {
        ctrlDeType(id, 'menucontextuel', 'un menu contextuel');
        return donnees[id].source;
      },
      montrerMenuContextuel(id) {
        ctrlDeType(id, 'menucontextuel', 'un menu contextuel');
        ouvrirMenuContextuel(id, '', pointeur.x, pointeur.y);
      },

      // ---- Barres d'outils ----
      quandOutil(id, cle, fn) {
        ctrlDeType(id, 'barreoutils', 'une barre d\'outils');
        const d = donnees[id];
        (d.surOutil[cle] = d.surOutil[cle] || []).push(proteger(fn));
      },
      activerOutil(id, cle, actif) {
        const el = ctrlDeType(id, 'barreoutils', 'une barre d\'outils');
        el.querySelectorAll('.bs-outil').forEach(b => { if (b.dataset.cle === cle) b.disabled = !actif; });
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
        return !!(await enregistrerSous(enTexte(texte), nom, 'texte'));
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
      // ---- Panneau défilant ----
      // quoi : 'haut', 'bas', 'gauche', 'droite', ou 'controle' (cible : un contrôle posé dans le panneau).
      defilerPanneau(id, quoi, cible) {
        ctrlDeType(id, 'panneau', 'un panneau défilant');
        const el = elements[id];
        let x = el.scrollLeft, y = el.scrollTop;
        if (quoi === 'haut') y = 0;
        else if (quoi === 'bas') y = el.scrollHeight;
        else if (quoi === 'gauche') x = 0;
        else if (quoi === 'droite') x = el.scrollWidth;
        else {
          ctrl(cible);
          // Position du contrôle dans le contenu du panneau (il peut être dans un panneau lui-même dans celui-ci).
          let o = donnees[cible], cx = 0, cy = 0, n = 0;
          const t = { l: o.largeur, h: o.hauteur };
          while (o && o.panneau !== id && n++ < 50) {
            cx += o.x; cy += o.y;
            o = estPanneau(o.panneau) ? donnees[o.panneau] : null;
          }
          if (!o) throw new Error(`« ${donnees[cible].nom} » n'est pas posé dans « ${donnees[id].nom} ».`);
          cx += o.x; cy += o.y;
          // On fait défiler juste ce qu'il faut pour le voir en entier.
          if (cy < el.scrollTop) y = cy - MARGE_PANNEAU;
          else if (cy + t.h > el.scrollTop + el.clientHeight) y = cy + t.h + MARGE_PANNEAU - el.clientHeight;
          if (cx < el.scrollLeft) x = cx - MARGE_PANNEAU;
          else if (cx + t.l > el.scrollLeft + el.clientWidth) x = cx + t.l + MARGE_PANNEAU - el.clientWidth;
        }
        el.scrollTo(Math.max(0, x), Math.max(0, y));
      },
      // ---- Presse-papiers, impression, notifications ----
      async copier(valeur) {
        const texte = enTexte(valeur);
        try {
          await navigator.clipboard.writeText(texte);
          return;
        } catch (e) { /* autre méthode, ci-dessous */ }
        const actif = document.activeElement;
        const zone = document.createElement('textarea');
        zone.value = texte;
        zone.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.appendChild(zone);
        zone.select();
        const ok = document.execCommand('copy');
        zone.remove();
        if (actif && actif.focus) actif.focus();
        if (!ok) throw new Error('Windows n\'a pas permis de copier le texte dans le presse-papiers.');
      },
      async lirePressePapiers() {
        try {
          return await navigator.clipboard.readText();
        } catch (e) {
          throw new Error('Windows n\'a pas permis de lire le presse-papiers (la fenêtre du programme doit être active).');
        }
      },
      async copierImage(id) {
        const toile = await toileDe(id);
        const png = await new Promise(ok => toile.toBlob(ok, 'image/png'));
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
        } catch (e) {
          throw new Error('Windows n\'a pas permis de copier l\'image dans le presse-papiers.');
        }
      },
      // quoi : 'texte' (a = le texte), 'controle' (a = son id) ou 'fenetre' (a = son id, '' = principale).
      async imprimer(quoi, a) {
        if (arrete) return;
        let titre = principale.def.titre || 'Programme', page;
        if (quoi === 'texte') page = pageDeTexte(a);
        else if (quoi === 'controle') { page = await pageDeControle(a); titre = donnees[a].nom; }
        else {
          const f = laFenetre(a);
          page = pageDeFenetre(f);
          titre = f.def.titre || f.def.nom || titre;
        }
        await imprimerPage(titre, page);
      },
      notifier(titre, texte, icone) {
        if (arrete) return;
        const t = enTexte(titre).trim() || principale.def.titre || 'Programme', m = enTexte(texte);
        const genre = ICONES_NOTIFICATION[icone] ? icone : 'aucune';
        const webview = window.chrome && window.chrome.webview;
        // Dans BlocStudio ou dans une application exportée : une vraie notification de Windows.
        if (webview) webview.postMessage(`notification:${genre}\n${t.replace(/\n/g, ' ')}\n${m}`);
        else bulleNotification(t, m, genre);
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
      fichier: ctrlFichier,
      camera: ctrlCamera,
      arbre: ctrlArbre,
      enfantsArbre,
      // Barre d'état : écrire dans la case n° (1, 2, 3…) ; les cases manquantes sont ajoutées.
      barreEtat(id, numero, texte) {
        const i = caseBarre(id, numero), d = donnees[id];
        while (d.cases.length <= i) d.cases.push('');
        d.cases[i] = enTexte(texte);
        remplirBarreEtat(elements[id], d.cases);
      },
      lireBarreEtat(id, numero) {
        return donnees[id].cases[caseBarre(id, numero)] ?? '';
      },
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
        if (d.type === 'son') preparerDuree(d);
        if (d.type === 'son' && d.autoDemarrage) ctrlSon(id, 'jouer');
        if (d.type === 'minuteur' && d.active !== false) demarrerMinuteur(d);
        if (d.type === 'camera' && d.allumerAuDemarrage !== false) allumerCamera(id).catch(signaler);
        if (d.type === 'sprite' && d.anime) animerSprite(d, 'boucle');
      }
      for (const id in donnees) brancherMenuContextuel(id);
      brancherMenuFenetre(fenetre, surface, 'fenêtre');
      Object.values(fenetres).forEach(f => brancherMenuFenetre(f.def, f.surface, f.def.nom));
      if (dansExe) {
        ecouter(window, 'resize', remplirFenetreWindows);
        remplirFenetreWindows(); // fenêtre déjà agrandie au démarrage
      } else if (fenetre.redimensionnable) ajouterPoignee(principale);
      Object.values(fenetres).forEach(f => { if (f.def.redimensionnable) ajouterPoignee(f); });
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
        fermerMenuContextuel();
        Object.values(donnees).forEach(d => { if (d.type === 'camera') eteindreCamera(d); });
        Object.values(fenetres).forEach(f => { f.el.remove(); if (f.voile) f.voile.remove(); });
        hote.innerHTML = '';
      }
    };
  }

  return { lancer, creerElement, appliquerStyle, couleur, lireMenus, cheminsMenus, creerBarreMenus, HAUTEUR_MENUS,
    elementsMenuContextuel, elementsBarreOutils, decoderSon, extraitSon, contexteAudio, INVISIBLES,
    tailleContenuPanneau, sensDefilement };
}

const BlocRuntime = BlocRuntimeFactory();
