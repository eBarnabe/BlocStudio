// BlocStudio — l'éditeur : concepteur de fenêtre, propriétés, blocs, fichiers.
(function () {
  const gen = javascript.javascriptGenerator;
  const CLE_STOCKAGE = 'blocstudio.projet';
  const GRILLE = 4;

  const TYPES = {
    bouton:     { prefixe: 'Bouton',    texte: 'Bouton',        largeur: 110, hauteur: 32 },
    etiquette:  { prefixe: 'Etiquette', texte: 'Étiquette',     largeur: 120, hauteur: 24 },
    zonetexte:  { prefixe: 'ZoneTexte', texte: '',              largeur: 170, hauteur: 30 },
    casecocher: { prefixe: 'Case',      texte: 'Case à cocher', largeur: 150, hauteur: 24 },
    image:      { prefixe: 'Image',     texte: '',              largeur: 100, hauteur: 100 },
    sprite: { prefixe: 'Sprite', texte: '', largeur: 64, hauteur: 64,
      defauts: { sprite: '', costume: 0, anime: false, miroir: false, rotation: 0 } },
    listederoulante: { prefixe: 'Liste', texte: '', largeur: 160, hauteur: 28,
      defauts: { elements: ['Choix 1', 'Choix 2', 'Choix 3'] } },
    curseur: { prefixe: 'Curseur', texte: '', largeur: 160, hauteur: 24,
      defauts: { valeur: 50, min: 0, max: 100 } },
    barreprogression: { prefixe: 'Barre', texte: '', largeur: 200, hauteur: 20,
      defauts: { valeur: 30, max: 100, couleurBarre: '#16a34a' } },
    zonedessin: { prefixe: 'Dessin', texte: '', largeur: 240, hauteur: 160,
      defauts: { couleurFond: '#ffffff' } },
    boutonradio: { prefixe: 'Radio', texte: 'Option', largeur: 150, hauteur: 24,
      defauts: { groupe: 'groupe1' } },
    cadre: { prefixe: 'Cadre', texte: 'Groupe', largeur: 220, hauteur: 140 },
    panneau: { prefixe: 'Panneau', texte: '', largeur: 240, hauteur: 160,
      defauts: { defilement: 'vertical', largeurContenu: 0, hauteurContenu: 400, couleurFond: '#ffffff' } },
    zoneliste: { prefixe: 'ZoneListe', texte: '', largeur: 160, hauteur: 120,
      defauts: { elements: ['Élément 1', 'Élément 2', 'Élément 3'] } },
    selecteurnombre: { prefixe: 'Nombre', texte: '', largeur: 90, hauteur: 28,
      defauts: { valeur: 0, min: 0, max: 100, pas: 1 } },
    tableau: { prefixe: 'Tableau', texte: '', largeur: 300, hauteur: 160,
      defauts: { colonnes: ['Nom', 'Prénom'], lignes: [['Dupont', 'Marie'], ['Martin', 'Lucas']], memoriser: false } },
    date: { prefixe: 'Date', texte: '', largeur: 150, hauteur: 28, defauts: { date: '' } },
    heure: { prefixe: 'Heure', texte: '', largeur: 110, hauteur: 28, defauts: { heure: '' } },
    forme: { prefixe: 'Forme', texte: '', largeur: 100, hauteur: 100,
      defauts: { genre: 'ovale', couleurFond: '#60a5fa', couleurBordure: '#1e3a8a', epaisseur: 2, sens: 'horizontale' } },
    selecteurcouleur: { prefixe: 'Couleur', texte: '#4f46e5', largeur: 60, hauteur: 30 },
    navigateur: { prefixe: 'Navigateur', texte: '', largeur: 400, hauteur: 260,
      defauts: { adresse: 'https://fr.wikipedia.org' } },
    onglets: { prefixe: 'Onglets', texte: '', largeur: 340, hauteur: 220,
      defauts: { pages: ['Page 1', 'Page 2', 'Page 3'], page: 0 } },
    graphique: { prefixe: 'Graphique', texte: 'Mon graphique', largeur: 320, hauteur: 200,
      defauts: { genre: 'barres', etiquettes: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'], valeurs: [3, 5, 2, 6, 4],
        couleurBarre: '#4f46e5', couleurFond: '#ffffff', maxValeurs: 0 } },
    interrupteur: { prefixe: 'Interrupteur', texte: 'Activé', largeur: 150, hauteur: 26 },
    lien: { prefixe: 'Lien', texte: 'Visiter le site', largeur: 140, hauteur: 24,
      defauts: { adresse: 'https://fr.wikipedia.org', couleurTexte: '#2563eb' } },
    video: { prefixe: 'Video', texte: '', largeur: 320, hauteur: 180,
      defauts: { video: '', barreVideo: true, boucle: false, volume: 100 } },
    camera: { prefixe: 'Camera', texte: '', largeur: 320, hauteur: 240,
      defauts: { miroir: true, allumerAuDemarrage: true, seuilMouvement: 10 } },
    arborescence: { prefixe: 'Arbre', texte: '', largeur: 200, hauteur: 180,
      defauts: { arbre: 'Animaux\n  Chats\n  Chiens\nPlantes\n  Fleurs\n  Arbres', deplie: true } },
    // Toujours collée en bas de sa fenêtre, sur toute la largeur (voir amarrerBarresEtat).
    barreetat: { prefixe: 'BarreEtat', texte: 'Prêt|', largeur: 300, hauteur: 24, defauts: { taillePolice: 12 } },
    // Toujours collée en haut de sa fenêtre (sous les menus), sur toute la largeur.
    barreoutils: { prefixe: 'BarreOutils', texte: '', largeur: 300, hauteur: 34,
      defauts: { boutons: '📄 Nouveau\n📂 Ouvrir\n💾 Enregistrer\n-\n✂️ Couper\n📋 Copier\n📌 Coller', iconesSeules: false, taillePolice: 13 } },
    // Contrôles invisibles : ils n'ont ni position ni taille à l'écran.
    son: { prefixe: 'Son', texte: '', largeur: 0, hauteur: 0,
      defauts: { son: '', volume: 100, boucle: false, autoDemarrage: false } },
    minuteur: { prefixe: 'Minuteur', texte: '', largeur: 0, hauteur: 0,
      defauts: { intervalle: 1, active: true } },
    fichier: { prefixe: 'Fichier', texte: '', largeur: 0, hauteur: 0,
      defauts: { typeFichier: 'texte', nomPropose: 'mon fichier.txt' } },
    menucontextuel: { prefixe: 'MenuContextuel', texte: '', largeur: 0, hauteur: 0,
      defauts: { menu: 'Copier\nColler\n-\nSupprimer' } },
    basedonnees: { prefixe: 'Base', texte: '', largeur: 0, hauteur: 0,
      defauts: { champs: ['Nom', 'Prénom', 'Téléphone'], fiches: [], memoriser: true } }
  };

  // Entrées de la palette qui créent un contrôle d'un autre type, déjà réglé.
  const VARIANTES = {
    motdepasse: { type: 'zonetexte', prefixe: 'MotDePasse', valeurs: { motDePasse: true } }
  };

  // Contrôles qui affichent du texte (taille et couleur du texte réglables).
  const AVEC_TEXTE = ['bouton', 'etiquette', 'zonetexte', 'casecocher', 'interrupteur', 'lien', 'graphique', 'onglets', 'listederoulante',
    'boutonradio', 'cadre', 'zoneliste', 'selecteurnombre', 'tableau', 'date', 'heure', 'arborescence', 'barreetat', 'barreoutils'];

  // Contrôles dont on peut aligner le texte (à gauche, au centre, à droite).
  const ALIGNABLES = ['bouton', 'etiquette', 'zonetexte', 'lien'];

  // Contrôles dont l'événement principal est « change » (pour le double-clic).
  const AVEC_CHANGE = ['zonetexte', 'casecocher', 'boutonradio', 'listederoulante', 'zoneliste',
    'curseur', 'selecteurnombre', 'tableau', 'date', 'heure', 'selecteurcouleur', 'navigateur', 'interrupteur', 'onglets', 'arborescence', 'panneau', 'barreprogression'];

  const NOMS_TYPES = {
    bouton: 'Bouton', etiquette: 'Étiquette', zonetexte: 'Zone de texte',
    casecocher: 'Case à cocher', image: 'Image', listederoulante: 'Liste déroulante',
    curseur: 'Curseur', barreprogression: 'Barre de progression', zonedessin: 'Zone de dessin',
    boutonradio: 'Bouton radio', cadre: 'Cadre', panneau: 'Panneau défilant', zoneliste: 'Zone de liste',
    selecteurnombre: 'Sélecteur de nombre', tableau: 'Tableau', date: 'Sélecteur de date',
    selecteurcouleur: 'Sélecteur de couleur', navigateur: 'Navigateur web', interrupteur: 'Interrupteur', lien: 'Lien', video: 'Vidéo', camera: 'Caméra', arborescence: 'Arborescence', barreetat: 'Barre d\'état', barreoutils: 'Barre d\'outils', menucontextuel: 'Menu contextuel', heure: 'Sélecteur d\'heure', forme: 'Forme', graphique: 'Graphique', onglets: 'Onglets', son: 'Son', minuteur: 'Minuteur', basedonnees: 'Base de données', fichier: 'Fichier', sprite: 'Sprite'
  };

  const estInvisible = c => BlocRuntime.INVISIBLES.includes(c.type);

  let projet;
  let selection = null;        // id du contrôle principal sélectionné, ou null pour la fenêtre
  const choisis = new Set();   // tous les contrôles sélectionnés (Ctrl+clic, rectangle de sélection)
  let blocsAPerimes = false;   // un contrôle a été renommé : il faut rafraîchir les blocs
  let workspace;
  let execution = null;

  window.BlocStudio = {
    // (avant le chargement du premier projet, la boîte à outils est construite sur un projet vide)
    controles: () => projet ? projet.controles : [], fenetre: () => projet ? projet.fenetre : projetVide().fenetre,
    sons: () => projet.sons, sprites: () => projet.sprites, fenetres: () => projet ? projet.fenetres : []
  };

  const $ = id => document.getElementById(id);

  // ---------------------------------------------------------------- Projets

  function projetVide() {
    return {
      format: 'BlocStudio', version: 1,
      id: nouvelId(),
      fenetre: { titre: 'Mon programme', largeur: 480, hauteur: 320, couleurFond: '#f0f0f0', menus: '' },
      controles: [],
      sons: [],
      sprites: [],
      fenetres: [],
      blocs: null,
      prochainId: 1
    };
  }

  // Identifiant du programme : sert à ranger sa mémoire (blocs « mémoriser », tableaux mémorisés).
  function nouvelId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function controle(type, id, nom, valeurs) {
    const t = TYPES[type];
    return Object.assign({
      id, type, nom,
      texte: t.texte,
      x: 20, y: 20, largeur: t.largeur, hauteur: t.hauteur,
      couleurTexte: '#000000', couleurFond: '', taillePolice: 14,
      visible: true, coche: false, image: ''
    }, structuredClone(t.defauts || {}), valeurs);
  }

  function nomUnique(prefixe) {
    for (let i = 1; ; i++) {
      const nom = prefixe + i;
      if (!projet.controles.some(c => c.nom === nom)) return nom;
    }
  }

  function chargerProjet(p) {
    workspace.getToolbox().clearSelection(); // sa catégorie ouverte désignait des contrôles de l'ancien projet
    projet = Object.assign(projetVide(), p);
    projet.fenetre = Object.assign({ menus: '' }, projet.fenetre);
    if (!Array.isArray(projet.sons)) projet.sons = [];
    if (!Array.isArray(projet.sprites)) projet.sprites = [];
    if (!Array.isArray(projet.fenetres)) projet.fenetres = [];
    fenetreActive = '';
    selection = null;
    choisis.clear();
    afficherConcepteur();
    afficherProprietes();
    workspace.clear();
    if (projet.blocs) {
      try {
        Blockly.serialization.workspaces.load(projet.blocs, workspace);
      } catch (e) {
        console.error(e);
        alert('Certains blocs n\'ont pas pu être chargés.');
      }
    }
    workspace.clearUndo();
    blocsAPerimes = false;
    majBoite();
    majCodeJs();
    repartirHistorique();
  }

  function chargerExemple(exemple) {
    chargerProjet(exemple.creer());
    workspace.cleanUp();
    workspace.scroll(0, 0);
    planifierSauvegarde();
  }

  function etatProjet() {
    projet.blocs = Blockly.serialization.workspaces.save(workspace);
    return projet;
  }

  let minuterieSauvegarde;
  let tropGrosSignale = false;
  function planifierSauvegarde() {
    // Une pause dans les modifications = une étape de l'historique (annuler / rétablir).
    clearTimeout(minuterieHistorique);
    minuterieHistorique = setTimeout(() => noterHistorique(), 500);
    clearTimeout(minuterieSauvegarde);
    minuterieSauvegarde = setTimeout(() => {
      try {
        localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etatProjet()));
        tropGrosSignale = false;
      } catch (e) {
        // Le plus souvent : trop de sons ou d'images pour la sauvegarde automatique (≈ 5 Mo).
        if (e.name === 'QuotaExceededError' && !tropGrosSignale) {
          tropGrosSignale = true;
          alert('Le projet est devenu trop gros pour la sauvegarde automatique (sons ou images trop lourds).\n\n' +
            'Pensez à l\'enregistrer vous-même avec 💾 Enregistrer, ou supprimez un son ou un sprite dans le Sommaire.');
        }
      }
    }, 400);
  }

  // ---------------------------------------------------------------- Concepteur

  // Fenêtre affichée dans le concepteur : '' pour la fenêtre principale, sinon l'identifiant
  // d'une autre fenêtre (projet.fenetres). Chaque contrôle sait dans quelle fenêtre il est (c.fenetre).
  let fenetreActive = '';
  const fenetreCourante = () => projet.fenetres.find(f => f.id === fenetreActive) || projet.fenetre;
  const dansFenetreActive = c => (c.fenetre || '') === fenetreActive;

  function changerFenetre(id) {
    fenetreActive = projet.fenetres.some(f => f.id === id) ? id : '';
    selection = null;
    choisis.clear();
    afficherConcepteur();
    afficherProprietes();
  }

  // Onglets au-dessus de la fenêtre : la principale, les autres, et « ➕ Nouvelle fenêtre ».
  function afficherOngletsFenetres() {
    const onglet = (texte, id, titre) => {
      const b = el('button', 'onglet-fenetre' + (id === fenetreActive ? ' actif' : ''), texte);
      b.title = titre;
      b.addEventListener('click', () => changerFenetre(id));
      if (id) b.addEventListener('dblclick', () => ouvrirEvenementFenetre(id));
      return b;
    };
    const nouvelle = el('button', 'onglet-fenetre onglet-nouvelle', '➕ Nouvelle fenêtre');
    nouvelle.title = 'Ajouter une fenêtre au programme (réglages, fiche, à propos…)';
    nouvelle.addEventListener('click', nouvelleFenetre);
    $('onglets-fenetres').replaceChildren(
      onglet('🪟 Fenêtre principale', '', 'La fenêtre qui s\'ouvre au lancement du programme'),
      ...projet.fenetres.map(f => onglet('🪟 ' + f.nom, f.id, 'Double-clic : écrire ce qui se passe quand elle s\'ouvre')),
      nouvelle);
  }

  function nouvelleFenetre() {
    let i = 2;
    while (projet.fenetres.some(f => f.nom === 'Fenetre' + i)) i++;
    const f = { id: 'f' + nouvelId(), nom: 'Fenetre' + i, titre: 'Fenêtre ' + i, largeur: 360, hauteur: 240, couleurFond: '#f0f0f0' };
    projet.fenetres.push(f);
    blocsAPerimes = true;
    afficherVue('vue-fenetre');
    changerFenetre(f.id);
    planifierSauvegarde();
    $('astuce').textContent = `🪟 Fenêtre « ${f.nom} » créée : posez-y des contrôles, puis ouvrez-la avec le bloc « ouvrir la fenêtre » (onglet Code, catégorie « 🪟 ${f.nom} »).`;
  }

  function supprimerFenetre(f) {
    const ctrls = projet.controles.filter(c => c.fenetre === f.id);
    const ids = new Set(ctrls.map(c => c.id));
    const lies = workspace.getAllBlocks(false).filter(b =>
      (b.getField('FENETRE') && b.getFieldValue('FENETRE') === f.id) || (b.getField('CTRL') && ids.has(b.getFieldValue('CTRL'))));
    const details = [ctrls.length && `${ctrls.length} contrôle(s)`, lies.length && `${lies.length} bloc(s) qui l'utilisent`].filter(Boolean);
    if (!confirm(`Supprimer la fenêtre « ${f.nom} »` + (details.length ? ` avec ${details.join(' et ')} ?` : ' ?'))) return;
    noterHistorique();
    const blocsAvant = supprimerBlocs(lies);
    projet.controles = projet.controles.filter(c => !ids.has(c.id));
    projet.fenetres = projet.fenetres.filter(x => x !== f);
    blocsAPerimes = true;
    changerFenetre('');
    noterHistorique(blocsAvant);
    planifierSauvegarde();
  }

  function ouvrirEvenementFenetre(id) {
    afficherVue('vue-code');
    let bloc = workspace.getBlocksByType('bs_quand_fenetre', false)
      .find(b => b.getFieldValue('FENETRE') === id && b.getFieldValue('QUOI') === 'ouverture');
    if (!bloc) bloc = nouveauBlocEnBas('bs_quand_fenetre', 'FENETRE', id);
    workspace.centerOnBlock(bloc.id);
    Blockly.common.setSelected(bloc);
  }

  // Une barre d'état occupe le bas de sa fenêtre, une barre d'outils le haut, sur toute la largeur
  // (même si la fenêtre change de taille).
  const AMARRES = ['barreetat', 'barreoutils'];
  function amarrerBarresEtat() {
    for (const c of projet.controles) {
      if (!AMARRES.includes(c.type)) continue;
      const f = (c.fenetre && projet.fenetres.find(x => x.id === c.fenetre)) || projet.fenetre;
      c.x = 0;
      c.y = c.type === 'barreoutils' ? 0 : Math.max(0, f.hauteur - c.hauteur);
      c.largeur = f.largeur;
    }
  }

  function afficherConcepteur() {
    amarrerBarresEtat();
    const f = fenetreCourante();
    $('titre-design').textContent = f.titre;
    const surface = $('surface-design');
    surface.style.width = f.largeur + 'px';
    surface.style.height = f.hauteur + 'px';
    surface.style.background = BlocRuntime.couleur(f.couleurFond || '#f0f0f0');
    surface.innerHTML = '';
    poserControlesDesign(surface);
    afficherInvisibles();
    afficherOngletsFenetres();

    // Barre de menus (fenêtre principale) : cliquer sur un élément mène à son code, comme dans Visual Basic.
    const menus = fenetreActive ? [] : BlocRuntime.lireMenus(f.menus);
    $('menus-design').replaceChildren(...(menus.length
      ? [BlocRuntime.creerBarreMenus(menus, ouvrirEvenementMenu)] : []));
  }

  function creerControleDesign(c) {
    const w = document.createElement('div');
    w.className = 'd-ctrl';
    w.dataset.id = c.id;
    w.title = c.nom + ' — double-clic pour écrire son code';
    w.appendChild(creerElementDesign(c));
    const poignee = document.createElement('div');
    poignee.className = 'poignee';
    w.appendChild(poignee);
    placer(w, c);

    w.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (e.button === 2) { if (!choisis.has(c.id)) selectionner(c.id); return; } // clic droit : menu
      if (e.button !== 0) return;
      if (e.ctrlKey || e.shiftKey) { selectionner(c.id, true); return; }
      // Sur la barre de défilement d'un panneau : on le fait défiler, sans le déplacer.
      if (c.type === 'panneau' && surBarreDefilement(e, w.firstChild)) { if (!choisis.has(c.id)) selectionner(c.id); return; }
      if (c.type === 'onglets') cliquerTitreOnglets(e, w, c);
      if (AMARRES.includes(c.type)) { selectionner(c.id); return; } // elle reste collée en bas (ou en haut)
      const dejaChoisi = choisis.has(c.id);
      if (!dejaChoisi) selectionner(c.id);
      deplacerOuRedimensionner(e, w, c, e.target === poignee && choisis.size === 1, dejaChoisi);
    });

    w.addEventListener('dblclick', e => { e.stopPropagation(); ouvrirEvenement(c); }); // pas aussi celui du panneau autour
    if (c.type === 'panneau') {
      const p = w.firstChild;
      p.addEventListener('scroll', () => { defilDesign[c.id] = { x: p.scrollLeft, y: p.scrollTop }; });
    }
    return w;
  }

  // ---- Panneau défilant ----
  // Un contrôle lâché dans un panneau en fait partie : `panneau` (id du panneau). Ses X et Y comptent alors
  // depuis le coin du contenu du panneau (comme dans Visual Basic), et il défile avec lui, dans le concepteur aussi.
  const defilDesign = {}; // id du panneau → { x, y } : où il est défilé dans le concepteur
  const panneauDe = c => c.panneau ? projet.controles.find(o => o.id === c.panneau && o.type === 'panneau') : null;
  function dansPanneau(c, p) {
    for (let o = panneauDe(c), n = 0; o && n < 50; o = panneauDe(o), n++) if (o === p) return true;
    return false;
  }
  const contenuDesign = id => elementDesign(id)?.querySelector(':scope > .bs-panneau > .bs-panneau-contenu');
  // La liste, plus tout ce qui est posé dans ses panneaux (et dans les panneaux de ceux-ci).
  const avecContenu = liste => [...liste,
    ...projet.controles.filter(o => !liste.includes(o) && liste.some(p => p.type === 'panneau' && dansPanneau(o, p)))];
  const surBarreDefilement = (e, p) => {
    const r = p.getBoundingClientRect();
    return e.clientX >= r.left + p.clientLeft + p.clientWidth || e.clientY >= r.top + p.clientTop + p.clientHeight;
  };

  function poserControlesDesign(surface) {
    const tous = projet.controles.filter(c => !estInvisible(c) && dansFenetreActive(c));
    const enveloppes = new Map(tous.map(c => [c.id, creerControleDesign(c)]));
    for (const c of tous) {
      const p = panneauDe(c);
      const dans = p && enveloppes.get(p.id);
      (dans ? dans.querySelector(':scope > .bs-panneau > .bs-panneau-contenu') : surface).appendChild(enveloppes.get(c.id));
    }
    for (const c of tous) if (c.type === 'panneau') majContenuDesign(c);
  }

  // Le contenu s'étend jusqu'au dernier contrôle (ou à la taille choisie) ; on retrouve où il était défilé.
  function majContenuDesign(p) {
    const contenu = contenuDesign(p.id);
    if (!contenu) return;
    const t = BlocRuntime.tailleContenuPanneau(p, projet.controles.filter(o => o.panneau === p.id && !estInvisible(o)));
    Object.assign(contenu.style, { width: t.largeur + 'px', height: t.hauteur + 'px' });
    const s = defilDesign[p.id];
    if (s) { contenu.parentNode.scrollLeft = s.x; contenu.parentNode.scrollTop = s.y; }
  }

  // Au début d'un déplacement : les contrôles tirés hors de leur panneau passent dans la fenêtre,
  // à l'endroit où on les voit (sinon le panneau les cacherait dès qu'ils sortent de son cadre).
  function sortirDesPanneaux(liste) {
    const surface = $('surface-design'), s = surface.getBoundingClientRect();
    for (const o of liste) {
      if (!o.panneau) continue;
      const w = elementDesign(o.id);
      if (!w) continue;
      const r = w.getBoundingClientRect();
      o.x = Math.round(r.left - s.left);
      o.y = Math.round(r.top - s.top);
      delete o.panneau;
      surface.appendChild(w);
      placer(w, o);
    }
  }

  // Après un déplacement : un contrôle lâché dans un panneau en fait partie (le plus intérieur, s'il y en a
  // plusieurs l'un dans l'autre), et ses X et Y se comptent depuis le coin du contenu, là où il est défilé.
  function rattacherAuxPanneaux(liste) {
    const s = $('surface-design').getBoundingClientRect();
    for (const c of liste) {
      if (estInvisible(c) || c.panneau || AMARRES.includes(c.type) || c.type === 'onglets') continue;
      const cx = s.left + c.x + c.largeur / 2, cy = s.top + c.y + c.hauteur / 2;
      let choix = null, profondeur = -1;
      for (const p of projet.controles) {
        if (p.type !== 'panneau' || p === c || dansPanneau(p, c) || !dansFenetreActive(p)) continue;
        const el = elementDesign(p.id)?.firstChild;
        if (!el || !el.getClientRects().length) continue; // caché (sur une autre page d'onglets)
        const r = el.getBoundingClientRect();
        const x0 = r.left + el.clientLeft, y0 = r.top + el.clientTop;
        if (cx < x0 || cx > x0 + el.clientWidth || cy < y0 || cy > y0 + el.clientHeight) continue;
        let n = 0;
        for (let o = panneauDe(p); o && n < 50; o = panneauDe(o)) n++;
        if (n >= profondeur) { choix = p; profondeur = n; } // à égalité, le dernier : celui de devant
      }
      if (!choix) continue;
      const cr = contenuDesign(choix.id).getBoundingClientRect();
      c.panneau = choix.id;
      c.x = Math.max(0, arrondir(s.left + c.x - cr.left));
      c.y = Math.max(0, arrondir(s.top + c.y - cr.top));
      delete c.onglets;
      delete c.page;
    }
  }

  const creerElementDesign = c =>
    BlocRuntime.creerElement(c.type === 'onglets' ? { ...c, page: pageVue(c) } : c, 'design', projet.sprites);

  // ---- Onglets ----
  // Un contrôle lâché sur une page d'onglets en fait partie : `onglets` (id des onglets) et `page` (n°).
  // Le concepteur ne montre que la page choisie (clic sur son titre) ; le programme fait de même.
  const HAUTEUR_TITRES_ONGLETS = 28;
  const pageDesign = {}; // id des onglets → page montrée dans le concepteur
  const pageVue = o => Math.min(pageDesign[o.id] ?? (o.page || 0), Math.max(0, (o.pages || []).length - 1));
  const ongletsDe = c => c.onglets ? projet.controles.find(o => o.id === c.onglets && o.type === 'onglets') : null;

  // Vrai si `c` est posé (directement ou non) sur les onglets `parent`.
  function estDans(c, parent) {
    for (let o = ongletsDe(c), n = 0; o && n < 50; o = ongletsDe(o), n++) if (o === parent) return true;
    return false;
  }

  function horsPage(c) {
    const o = ongletsDe(c);
    return !!o && ((c.page || 0) !== pageVue(o) || horsPage(o));
  }

  // Après un déplacement : un contrôle lâché sur des onglets rejoint la page affichée
  // (s'il était déjà sur ces onglets, il garde sa page) ; lâché ailleurs, il les quitte.
  function rattacherAuxOnglets(liste) {
    const tous = projet.controles.filter(o => o.type === 'onglets' && dansFenetreActive(o) && !horsPage(o) && !o.panneau);
    for (const c of liste) {
      if (estInvisible(c)) continue;
      if (c.panneau) { delete c.onglets; delete c.page; continue; } // il suit son panneau
      const cx = c.x + c.largeur / 2, cy = c.y + c.hauteur / 2;
      const o = tous.filter(o => o !== c && !estDans(o, c) && cx >= o.x && cx <= o.x + o.largeur &&
        cy >= o.y + HAUTEUR_TITRES_ONGLETS && cy <= o.y + o.hauteur).at(-1);
      if (!o) { delete c.onglets; delete c.page; }
      else if (c.onglets !== o.id) { c.onglets = o.id; c.page = pageVue(o); }
    }
  }

  // Remet à jour ce qui est montré ou caché dans le concepteur.
  function replacerTout() {
    for (const o of projet.controles) {
      const w = elementDesign(o.id);
      if (w) placer(w, o);
    }
  }

  function cliquerTitreOnglets(e, w, c) {
    const i = [...w.querySelectorAll('.bs-onglets-titres button')].findIndex(b => {
      const r = b.getBoundingClientRect();
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    });
    if (i < 0 || i === pageVue(c)) return;
    pageDesign[c.id] = i;
    w.firstChild.replaceWith(creerElementDesign(c));
    replacerTout();
  }

  // Un contrôle choisi ailleurs (liste des propriétés, Sommaire) : on affiche sa page.
  function montrerPageDe(id) {
    const c = projet.controles.find(x => x.id === id);
    let change = false;
    for (let x = c, o = c && ongletsDe(c), n = 0; o && n < 50; x = o, o = ongletsDe(o), n++) {
      if (pageVue(o) !== (x.page || 0)) { pageDesign[o.id] = x.page || 0; change = true; }
    }
    if (change) afficherConcepteur();
  }

  function proprietesOnglets(liste, c, maj) {
    champTexte(liste, 'Titres des pages (un par ligne)', (c.pages || []).join('\n'), v => {
      c.pages = v.split('\n').map(t => t.trim()).filter(t => t);
      if (!c.pages.length) c.pages = ['Page 1'];
      const derniere = c.pages.length - 1;
      c.page = Math.min(c.page || 0, derniere);
      // Les contrôles d'une page supprimée vont sur la dernière page.
      for (const o of projet.controles) if (o.onglets === c.id && (o.page || 0) > derniere) o.page = derniere;
      maj();
      replacerTout();
    }, true);
    const d = prop(liste, 'Page affichée au démarrage');
    const choix = document.createElement('select');
    (c.pages || []).forEach((t, i) => choix.add(new Option(`${i + 1}. ${t}`, String(i))));
    choix.value = String(c.page || 0);
    choix.addEventListener('change', () => {
      c.page = pageDesign[c.id] = Number(choix.value);
      maj();
      replacerTout();
    });
    d.appendChild(choix);
    const aide = document.createElement('p');
    aide.className = 'info-petit';
    aide.textContent = 'Cliquez sur le titre d\'une page pour l\'afficher, puis glissez-y des contrôles : ils en font partie et se déplacent avec les onglets.';
    liste.appendChild(aide);
  }

  // Bande « Contrôles invisibles » sous la fenêtre : un clic sélectionne, un double-clic ouvre le code.
  function afficherInvisibles() {
    const invisibles = projet.controles.filter(c => estInvisible(c) && dansFenetreActive(c));
    const bande = $('invisibles-design');
    bande.hidden = !invisibles.length;
    bande.style.width = (fenetreCourante().largeur + 2) + 'px';
    $('liste-invisibles').replaceChildren(...invisibles.map(c => {
      const puce = document.createElement('div');
      puce.className = 'd-invisible';
      puce.dataset.id = c.id;
      marquerSelection(puce);
      puce.title = c.nom + ' — double-clic pour écrire son code';
      puce.append(ICONES_TYPES[c.type] + ' ' + c.nom + ' ');
      const detail = document.createElement('small');
      detail.textContent = c.type === 'minuteur'
        ? `${String(c.intervalle).replace('.', ',')} s${c.active === false ? ', arrêté' : ''}`
        : c.type === 'basedonnees'
          ? `${(c.champs || []).length} champ(s), ${(c.fiches || []).length} fiche(s) au départ`
        : c.type === 'fichier'
          ? (TYPES_FICHIER_EDITEUR[c.typeFichier] || TYPES_FICHIER_EDITEUR.tous).split(' ')[0]
        : c.type === 'menucontextuel'
          ? `${BlocRuntime.elementsMenuContextuel(c.menu).length} élément(s), sur ${utilisateursMenu(c).length || 'aucun'} contrôle(s)`
          : (projet.sons.find(s => s.id === c.son)?.nom || 'aucun son');
      puce.appendChild(detail);
      puce.addEventListener('pointerdown', e => {
        e.stopPropagation();
        if (e.button === 2) { if (!choisis.has(c.id)) selectionner(c.id); return; }
        selectionner(c.id, e.ctrlKey || e.shiftKey);
      });
      puce.addEventListener('dblclick', () => ouvrirEvenement(c));
      return puce;
    }));
  }

  function placer(w, c) {
    Object.assign(w.style, {
      left: c.x + 'px', top: c.y + 'px',
      width: c.largeur + 'px', height: c.hauteur + 'px',
      zIndex: c.type === 'cadre' || c.type === 'onglets' || c.type === 'panneau' ? 0 : 1 // cadres, onglets et panneaux restent derrière
    });
    w.hidden = horsPage(c);
    w.classList.toggle('cache', c.visible === false);
    marquerSelection(w);
    if (c.type === 'panneau') majContenuDesign(c);
    const p = panneauDe(c);
    if (p) majContenuDesign(p);
  }

  const elementDesign = id => document.querySelector(`.d-ctrl[data-id="${id}"]`);
  const rectDe = c => ({ x: c.x, y: c.y, l: c.largeur, h: c.hauteur });
  const dedans = (o, cadre) => o.x >= cadre.x && o.y >= cadre.y &&
    o.x + o.largeur <= cadre.x + cadre.largeur && o.y + o.hauteur <= cadre.y + cadre.hauteur;
  function enveloppe(liste) {
    const x = Math.min(...liste.map(c => c.x)), y = Math.min(...liste.map(c => c.y));
    return { x, y, l: Math.max(...liste.map(c => c.x + c.largeur)) - x, h: Math.max(...liste.map(c => c.y + c.hauteur)) - y };
  }

  // Aimantation : le point de `points` le plus proche d'un bord ou d'un centre des autres
  // rectangles (à moins de SEUIL_AIMANT pixels) s'y colle. Renvoie le décalage et le guide à montrer.
  const SEUIL_AIMANT = 6;
  function aimanter(points, autres, axe) {
    let mieux = null;
    for (const r of autres) {
      const cibles = axe === 'x' ? [r.x, r.x + r.l / 2, r.x + r.l] : [r.y, r.y + r.h / 2, r.y + r.h];
      for (const cible of cibles) {
        for (const p of points) {
          const d = Math.round(cible - p);
          if (Math.abs(d) <= SEUIL_AIMANT && (!mieux || Math.abs(d) < Math.abs(mieux.decalage))) {
            mieux = { decalage: d, ligne: { axe, position: Math.round(cible) } };
          }
        }
      }
    }
    return mieux;
  }

  function montrerGuides(lignes) {
    const surface = $('surface-design');
    surface.querySelectorAll('.guide-aimant').forEach(g => g.remove());
    for (const l of lignes) {
      const g = el('div', 'guide-aimant ' + (l.axe === 'x' ? 'vertical' : 'horizontal'));
      g.style[l.axe === 'x' ? 'left' : 'top'] = l.position + 'px';
      surface.appendChild(g);
    }
  }

  // Déplace tous les contrôles sélectionnés (ou redimensionne le contrôle), en aimantant leurs
  // bords et leurs centres sur ceux des autres contrôles et de la fenêtre. Alt : sans aimant.
  function deplacerOuRedimensionner(e, w, c, redim, dejaChoisi) {
    const f = fenetreCourante();
    let bouges = redim ? [c] : selectionnes().filter(o => !estInvisible(o) && dansFenetreActive(o));
    // Ce qui est posé dans un panneau qui bouge suit déjà son panneau.
    if (!redim) bouges = bouges.filter(o => !bouges.some(p => p.type === 'panneau' && dansPanneau(o, p)));
    // Un cadre emporte avec lui les contrôles posés à l'intérieur.
    if (!redim) {
      for (const cadre of bouges.filter(o => o.type === 'cadre')) {
        for (const o of projet.controles) {
          if (!bouges.includes(o) && !estInvisible(o) && dansFenetreActive(o) && (o.panneau || '') === (cadre.panneau || '') &&
            dedans(o, cadre)) bouges.push(o);
        }
      }
    }
    if (!redim) {
      for (const onglets of bouges.filter(o => o.type === 'onglets')) {
        for (const o of projet.controles) if (!bouges.includes(o) && estDans(o, onglets)) bouges.push(o);
      }
    }
    // Dans un panneau, X et Y ne comptent pas depuis la fenêtre : on n'aimante qu'avec les contrôles de la fenêtre.
    let depart, boite, autres;
    const preparer = () => {
      depart = bouges.map(o => ({ o, x: o.x, y: o.y, w: elementDesign(o.id) }));
      boite = enveloppe(bouges);
      autres = redim && c.panneau ? [] : projet.controles.filter(o => !bouges.includes(o) && !estInvisible(o) && dansFenetreActive(o) && !o.panneau).map(rectDe);
      if (!(redim && c.panneau)) autres.push({ x: 0, y: 0, l: f.largeur, h: f.hauteur }); // les bords et le centre de la fenêtre
    };
    preparer();
    const origine = { x: e.clientX, y: e.clientY, l: c.largeur, h: c.hauteur };
    let bouge = false;
    try { w.setPointerCapture(e.pointerId); } catch (err) { /* pas grave */ }
    const bouger = ev => {
      const dx = ev.clientX - origine.x;
      const dy = ev.clientY - origine.y;
      if (!bouge && Math.abs(dx) + Math.abs(dy) < 3) return; // un simple clic ne déplace rien
      if (!bouge && !redim && bouges.some(o => o.panneau)) {
        sortirDesPanneaux(bouges);
        preparer();
        try { w.setPointerCapture(ev.pointerId); } catch (err) { /* pas grave */ }
      }
      bouge = true;
      const lignes = [];
      if (redim) {
        let l = Math.max(10, arrondir(origine.l + dx));
        let h = Math.max(10, arrondir(origine.h + dy));
        if (!ev.altKey) {
          const ax = aimanter([c.x + l], autres, 'x');
          if (ax && l + ax.decalage >= 10) { l += ax.decalage; lignes.push(ax.ligne); }
          const ay = aimanter([c.y + h], autres, 'y');
          if (ay && h + ay.decalage >= 10) { h += ay.decalage; lignes.push(ay.ligne); }
        }
        c.largeur = l;
        c.hauteur = h;
      } else {
        let x = borner(arrondir(boite.x + dx), 0, f.largeur - 10);
        let y = borner(arrondir(boite.y + dy), 0, f.hauteur - 10);
        if (!ev.altKey) {
          const ax = aimanter([x, x + boite.l / 2, x + boite.l], autres, 'x');
          if (ax) { x += ax.decalage; lignes.push(ax.ligne); }
          const ay = aimanter([y, y + boite.h / 2, y + boite.h], autres, 'y');
          if (ay) { y += ay.decalage; lignes.push(ay.ligne); }
        }
        for (const d of depart) {
          d.o.x = d.x + x - boite.x;
          d.o.y = d.y + y - boite.y;
          if (d.w) placer(d.w, d.o);
        }
      }
      placer(w, c);
      montrerGuides(lignes);
    };
    const lacher = () => {
      w.removeEventListener('pointermove', bouger);
      w.removeEventListener('pointerup', lacher);
      w.removeEventListener('pointercancel', lacher);
      montrerGuides([]);
      // Un simple clic sur un contrôle d'une sélection multiple ne garde que lui.
      if (!bouge && dejaChoisi && choisis.size > 1) return selectionner(c.id);
      if (bouge) {
        if (!redim) {
          rattacherAuxPanneaux(bouges);
          rattacherAuxOnglets(bouges);
          if (projet.controles.some(o => o.type === 'panneau')) afficherConcepteur();
          else replacerTout();
        }
        afficherProprietes();
        planifierSauvegarde();
      }
    };
    w.addEventListener('pointermove', bouger);
    w.addEventListener('pointerup', lacher);
    w.addEventListener('pointercancel', lacher);
  }

  const arrondir = v => Math.round(v / GRILLE) * GRILLE;
  const borner = (v, min, max) => Math.min(Math.max(v, min), max);

  function rafraichirControle(c) {
    if (estInvisible(c)) return afficherInvisibles();
    if (c.type === 'panneau') return afficherConcepteur(); // ses contrôles sont dedans
    const ancien = document.querySelector(`.d-ctrl[data-id="${c.id}"]`);
    if (ancien) ancien.replaceWith(creerControleDesign(c));
    const p = panneauDe(c);
    if (p) majContenuDesign(p);
  }

  function ajouterControle(type, x, y) {
    const n = projet.controles.length;
    const variante = VARIANTES[type];
    if (variante) type = variante.type;
    const c = controle(type, 'c' + projet.prochainId++, nomUnique(variante ? variante.prefixe : TYPES[type].prefixe), Object.assign({
      x: x ?? 20 + (n % 8) * 16,
      y: y ?? 20 + (n % 8) * 16
    }, variante && variante.valeurs));
    if (fenetreActive) c.fenetre = fenetreActive;
    c.x = borner(arrondir(c.x), 0, Math.max(0, fenetreCourante().largeur - 20));
    c.y = borner(arrondir(c.y), 0, Math.max(0, fenetreCourante().hauteur - 20));
    if (['etiquette', 'bouton', 'casecocher', 'interrupteur', 'lien'].includes(type)) c.texte = TYPES[type].texte;
    // Un nouveau contrôle Sprite affiche d'emblée le premier sprite de la bibliothèque.
    if (type === 'sprite' && projet.sprites.length) donnerSprite(c, projet.sprites[0]);
    projet.controles.push(c);
    if (AMARRES.includes(type)) amarrerBarresEtat();
    rattacherAuxPanneaux([c]);
    rattacherAuxOnglets([c]);
    if (estInvisible(c)) afficherInvisibles();
    else if (c.panneau) afficherConcepteur();
    else $('surface-design').appendChild(creerControleDesign(c));
    selectionner(c.id);
    planifierSauvegarde();
  }

  function supprimerControles(ids) {
    const liste = avecContenu(projet.controles.filter(c => ids.includes(c.id)));
    if (!liste.length) return;
    ids = liste.map(c => c.id);
    const lies = workspace.getAllBlocks(false).filter(b => b.getField('CTRL') && ids.includes(b.getFieldValue('CTRL')));
    const quoi = liste.length > 1 ? `ces ${liste.length} contrôles` : `« ${liste[0].nom} »`;
    if (lies.length && !confirm(`${lies.length} bloc(s) utilisent ${quoi}. Ils seront supprimés aussi. Continuer ?`)) return;
    noterHistorique();
    const blocsAvant = supprimerBlocs(lies);
    projet.controles = projet.controles.filter(c => !ids.includes(c.id));
    ids.forEach(id => elementDesign(id)?.remove());
    afficherInvisibles();
    selectionner(null);
    noterHistorique(blocsAvant);
    planifierSauvegarde();
  }

  // Supprime des blocs liés à ce qu'on supprime dans le concepteur. Renvoie les blocs d'avant,
  // pour que « Annuler » puisse les remettre.
  function supprimerBlocs(lies) {
    if (!lies.length) return null;
    const avant = Blockly.serialization.workspaces.save(workspace);
    Blockly.Events.setGroup(true);
    groupesInternes.add(Blockly.Events.getGroup());
    for (const b of lies) if (!b.isDeadOrDying()) b.dispose(true);
    Blockly.Events.setGroup(false);
    return avant;
  }

  // ---------------------------------------------------------------- Sélection

  // `selection` est le contrôle principal : ses propriétés sont affichées et il sert de référence
  // pour aligner. Ctrl+clic (ou Maj+clic) ajoute ou retire un contrôle de la sélection.
  const selectionnes = () => projet.controles.filter(c => choisis.has(c.id));

  function selectionner(id, basculer) {
    if (id) montrerPageDe(id);
    if (basculer && id) {
      if (choisis.has(id)) {
        choisis.delete(id);
        if (selection === id) selection = [...choisis].at(-1) ?? null;
      } else {
        choisis.add(id);
        selection = id;
      }
    } else {
      choisis.clear();
      if (id) choisis.add(id);
      selection = id || null;
    }
    majSelection();
  }

  function selectionnerPlusieurs(ids) {
    choisis.clear();
    ids.forEach(id => choisis.add(id));
    if (!choisis.has(selection)) selection = ids.at(-1) ?? null;
    majSelection();
  }

  const toutSelectionner = () => selectionnerPlusieurs(projet.controles.filter(dansFenetreActive).map(c => c.id));

  function marquerSelection(w) {
    const plusieurs = choisis.size > 1;
    w.classList.toggle('selection', choisis.has(w.dataset.id));
    w.classList.toggle('plusieurs', plusieurs);
    w.classList.toggle('principal', plusieurs && w.dataset.id === selection);
  }

  function majSelection() {
    document.querySelectorAll('.d-ctrl, .d-invisible').forEach(marquerSelection);
    afficherProprietes();
  }

  // Rectangle de sélection : on tire depuis un endroit vide de la fenêtre.
  function tirerRectangle(e) {
    const surface = $('surface-design');
    const r = surface.getBoundingClientRect();
    const depart = { x: e.clientX - r.left, y: e.clientY - r.top };
    const avant = (e.ctrlKey || e.shiftKey) ? [...choisis] : [];
    if (!avant.length) selectionner(null);
    let cadre = null;
    let derniers = '';
    try { surface.setPointerCapture(e.pointerId); } catch (err) { /* pas grave */ }
    const bouger = ev => {
      const x = ev.clientX - r.left, y = ev.clientY - r.top;
      if (!cadre) {
        if (Math.abs(x - depart.x) + Math.abs(y - depart.y) < 4) return;
        cadre = el('div', 'rectangle-selection');
        surface.appendChild(cadre);
      }
      const zone = { x: Math.min(x, depart.x), y: Math.min(y, depart.y), l: Math.abs(x - depart.x), h: Math.abs(y - depart.y) };
      Object.assign(cadre.style, { left: zone.x + 'px', top: zone.y + 'px', width: zone.l + 'px', height: zone.h + 'px' });
      const pris = projet.controles.filter(c => {
        if (estInvisible(c) || !dansFenetreActive(c)) return false;
        let x = c.x, y = c.y;
        if (c.panneau) { // dans un panneau : là où on le voit
          const w = elementDesign(c.id);
          if (!w || !w.getClientRects().length) return false;
          const q = w.getBoundingClientRect();
          x = q.left - r.left;
          y = q.top - r.top;
        }
        return x < zone.x + zone.l && x + c.largeur > zone.x && y < zone.y + zone.h && y + c.hauteur > zone.y;
      }).map(c => c.id);
      const ids = [...new Set([...avant, ...pris])];
      if (ids.join() !== derniers) {
        derniers = ids.join();
        selectionnerPlusieurs(ids);
      }
    };
    const lacher = () => {
      surface.removeEventListener('pointermove', bouger);
      surface.removeEventListener('pointerup', lacher);
      surface.removeEventListener('pointercancel', lacher);
      cadre?.remove();
    };
    surface.addEventListener('pointermove', bouger);
    surface.addEventListener('pointerup', lacher);
    surface.addEventListener('pointercancel', lacher);
  }

  // ---------------------------------------------------------------- Copier, coller, plans

  // Presse-papiers du concepteur : des copies des contrôles (sans leur code).
  let pressePapiers = null;   // { controles, fenetre, collages }

  function copier() {
    const liste = avecContenu(selectionnes());
    if (!liste.length) return;
    pressePapiers = { controles: structuredClone(liste), fenetre: fenetreActive, collages: 0 };
    $('astuce').textContent = (liste.length > 1 ? `📄 ${liste.length} contrôles copiés` : `📄 « ${liste[0].nom} » copié`) +
      ' : Ctrl+V pour coller, dans cette fenêtre ou dans une autre.';
  }

  function couper() {
    if (!choisis.size) return;
    copier();
    supprimerControles([...choisis]);
  }

  function coller(source = pressePapiers) {
    if (!source || !source.controles.length) return;
    // Dans la même fenêtre, chaque collage est un peu décalé ; dans une autre, à la même place.
    const decalage = source.fenetre === fenetreActive ? ++source.collages * 16 : 0;
    const f = fenetreCourante();
    const ids = [], nouveauxIds = {};
    for (const modele of source.controles) {
      const c = structuredClone(modele);
      c.id = nouveauxIds[modele.id] = 'c' + projet.prochainId++;
      c.nom = nomUnique(modele.nom.replace(/\d+$/, '') || TYPES[c.type].prefixe);
      if (fenetreActive) c.fenetre = fenetreActive; else delete c.fenetre;
      if (!estInvisible(c)) {
        c.x = borner(c.x + decalage, 0, Math.max(0, f.largeur - 20));
        c.y = borner(c.y + decalage, 0, Math.max(0, f.hauteur - 20));
      }
      if (c.type === 'boutonradio') c.coche = false; // un seul bouton sélectionné par groupe
      projet.controles.push(c);
      ids.push(c.id);
    }
    const colles = projet.controles.filter(c => ids.includes(c.id));
    for (const c of colles) {
      if (nouveauxIds[c.onglets]) c.onglets = nouveauxIds[c.onglets];
      else delete c.onglets; // collé seul : il rejoindra la page affichée là où il tombe
      // Dans un panneau : copié avec lui, ou collé seul dans le même panneau (s'il existe encore, dans cette fenêtre).
      if (nouveauxIds[c.panneau]) c.panneau = nouveauxIds[c.panneau];
      else if (!(c.panneau && source.fenetre === fenetreActive && projet.controles.some(o => o.id === c.panneau && o.type === 'panneau'))) delete c.panneau;
    }
    rattacherAuxOnglets(colles.filter(c => !ids.includes(c.onglets)));
    afficherConcepteur();
    selectionnerPlusieurs(ids);
    planifierSauvegarde();
  }

  function dupliquer() {
    const liste = avecContenu(selectionnes());
    if (liste.length) coller({ controles: structuredClone(liste), fenetre: fenetreActive, collages: 0 });
  }

  // Premier plan / arrière-plan : l'ordre des contrôles est celui de leur superposition.
  function changerPlan(devant) {
    const liste = selectionnes();
    const reste = projet.controles.filter(c => !choisis.has(c.id));
    projet.controles = devant ? [...reste, ...liste] : [...liste, ...reste];
    afficherConcepteur();
    planifierSauvegarde();
  }

  // Aligner, mettre à la même taille, répartir : sur le contrôle principal (entouré en plein).
  function arranger(action) {
    const liste = selectionnes().filter(c => !estInvisible(c));
    const ref = liste.find(c => c.id === selection) || liste[0];
    if (liste.length < 2) return;
    const milieu = (debut, taille, tailleRef) => Math.round(debut + (tailleRef - taille) / 2);
    const actions = {
      gauche: c => { c.x = ref.x; },
      centre: c => { c.x = milieu(ref.x, c.largeur, ref.largeur); },
      droite: c => { c.x = ref.x + ref.largeur - c.largeur; },
      haut: c => { c.y = ref.y; },
      milieu: c => { c.y = milieu(ref.y, c.hauteur, ref.hauteur); },
      bas: c => { c.y = ref.y + ref.hauteur - c.hauteur; },
      largeur: c => { c.largeur = ref.largeur; },
      hauteur: c => { c.hauteur = ref.hauteur; }
    };
    if (actions[action]) liste.forEach(actions[action]);
    else {
      // Espacer régulièrement, entre le premier et le dernier (qui ne bougent pas).
      const [pos, taille] = action === 'espacerH' ? ['x', 'largeur'] : ['y', 'hauteur'];
      const tries = [...liste].sort((a, b) => a[pos] - b[pos]);
      const debut = tries[0][pos];
      const fin = Math.max(...tries.map(c => c[pos] + c[taille]));
      const ecart = (fin - debut - tries.reduce((t, c) => t + c[taille], 0)) / (tries.length - 1);
      let p = debut;
      for (const c of tries) { c[pos] = Math.round(p); p += c[taille] + ecart; }
    }
    liste.forEach(c => { const w = elementDesign(c.id); if (w) placer(w, c); });
    afficherProprietes();
    planifierSauvegarde();
  }

  // ---------------------------------------------------------------- Menu du clic droit

  function menuContextuel(x, y, items) {
    fermerMenuContextuel();
    const menu = el('div', 'menu-contexte');
    menu.id = 'menu-contexte';
    for (const item of items) {
      if (item === '-') { menu.appendChild(el('hr')); continue; }
      const b = el('button');
      b.append(el('span', null, item.texte), el('kbd', null, item.touche || ''));
      b.disabled = item.actif === false;
      b.addEventListener('click', () => { fermerMenuContextuel(); item.action(); });
      menu.appendChild(b);
    }
    document.body.appendChild(menu);
    const r = menu.getBoundingClientRect();
    menu.style.left = Math.max(4, Math.min(x, innerWidth - r.width - 4)) + 'px';
    menu.style.top = Math.max(4, Math.min(y, innerHeight - r.height - 4)) + 'px';
  }

  function fermerMenuContextuel() {
    $('menu-contexte')?.remove();
  }

  function menuControles(x, y) {
    const liste = selectionnes();
    const seul = liste.length === 1 ? liste[0] : null;
    menuContextuel(x, y, [
      ...(seul ? [
        { texte: '🧩 Écrire son code', touche: 'double-clic', action: () => ouvrirEvenement(seul) },
        { texte: `🧰 Ses blocs (catégorie « ${seul.nom} »)`, action: () => montrerBlocsDe(seul) },
        (n => ({ texte: n ? `🔎 Voir les blocs qui l'utilisent (${n})` : '🔎 Aucun bloc ne l\'utilise encore',
          action: () => voirBlocsDuControle(seul), actif: n > 0 }))(blocsDuControle(seul.id).length),
        '-'] : []),
      { texte: '✂️ Couper', touche: 'Ctrl+X', action: couper },
      { texte: '📄 Copier', touche: 'Ctrl+C', action: copier },
      { texte: '📋 Coller', touche: 'Ctrl+V', action: () => coller(), actif: !!pressePapiers },
      { texte: '⧉ Dupliquer', touche: 'Ctrl+D', action: dupliquer },
      ...(liste.some(c => !estInvisible(c)) ? ['-',
        { texte: '⬆️ Mettre au premier plan', action: () => changerPlan(true) },
        { texte: '⬇️ Mettre à l\'arrière-plan', action: () => changerPlan(false) }] : []),
      '-',
      { texte: liste.length > 1 ? `🗑️ Supprimer les ${liste.length} contrôles` : '🗑️ Supprimer', touche: 'Suppr', action: () => supprimerControles([...choisis]) }
    ]);
  }

  function menuSurface(x, y) {
    menuContextuel(x, y, [
      { texte: '📋 Coller', touche: 'Ctrl+V', action: () => coller(), actif: !!pressePapiers },
      { texte: '☑️ Tout sélectionner', touche: 'Ctrl+A', action: toutSelectionner, actif: projet.controles.some(dansFenetreActive) },
      '-',
      { texte: '↶ Annuler', touche: 'Ctrl+Z', action: annuler, actif: peutAnnuler() },
      { texte: '↷ Rétablir', touche: 'Ctrl+Y', action: retablir, actif: historique.futur.length > 0 }
    ]);
  }

  // ---------------------------------------------------------------- Annuler / rétablir

  // L'historique garde des « photos » de la fenêtre et des contrôles (pas des sons ni des sprites).
  // Quand une modification a aussi supprimé des blocs, l'étape garde les blocs d'avant, tant qu'on
  // n'a pas modifié le code depuis (sinon « Annuler » effacerait ce travail).
  const historique = { passe: [], futur: [], etat: null };
  const MAX_HISTORIQUE = 80;
  const groupesInternes = new Set();   // groupes d'événements Blockly déclenchés par le concepteur
  let minuterieHistorique;
  const photo = () => JSON.stringify({ controles: projet.controles, fenetre: projet.fenetre, fenetres: projet.fenetres });
  const peutAnnuler = () => historique.passe.length > 0 || photo() !== historique.etat;

  function repartirHistorique() {
    clearTimeout(minuterieHistorique);
    historique.passe.length = 0;
    historique.futur.length = 0;
    historique.etat = photo();
    majBoutonsHistorique();
  }

  function noterHistorique(blocsAvant) {
    clearTimeout(minuterieHistorique);
    const etat = photo();
    if (etat === historique.etat) return;
    historique.passe.push({ etat: historique.etat, blocs: blocsAvant || null, vue: fenetreActive });
    if (historique.passe.length > MAX_HISTORIQUE) historique.passe.shift();
    historique.futur.length = 0;
    historique.etat = etat;
    majBoutonsHistorique();
  }

  function oublierBlocsHistorique() {
    for (const etape of [...historique.passe, ...historique.futur]) etape.blocs = null;
  }

  const annuler = () => parcourirHistorique(historique.passe, historique.futur);
  const retablir = () => parcourirHistorique(historique.futur, historique.passe);

  function parcourirHistorique(depuis, vers) {
    if (execution) return;
    noterHistorique(); // une modification en cours compte comme une étape
    const etape = depuis.pop();
    if (!etape) return;
    vers.push({ etat: historique.etat, blocs: etape.blocs ? Blockly.serialization.workspaces.save(workspace) : null, vue: etape.vue });
    const e = JSON.parse(etape.etat);
    projet.controles = e.controles;
    projet.fenetre = e.fenetre;
    projet.fenetres = e.fenetres;
    historique.etat = etape.etat;
    if (etape.blocs) {
      Blockly.Events.disable();
      try {
        workspace.clear();
        Blockly.serialization.workspaces.load(etape.blocs, workspace);
      } finally {
        Blockly.Events.enable();
      }
      workspace.clearUndo();
      majCodeJs();
    }
    blocsAPerimes = true;
    // On montre la fenêtre où la modification a eu lieu.
    fenetreActive = projet.fenetres.some(f => f.id === etape.vue) ? etape.vue : '';
    const restants = [...choisis].filter(id => projet.controles.some(c => c.id === id && dansFenetreActive(c)));
    choisis.clear();
    afficherConcepteur();
    selectionnerPlusieurs(restants);
    afficherVue('vue-fenetre');
    planifierSauvegarde();
    majBoutonsHistorique();
  }

  function majBoutonsHistorique() {
    const a = $('btn-annuler-design'), r = $('btn-retablir-design');
    if (!a) return;
    a.disabled = !historique.passe.length && !(projet && photo() !== historique.etat);
    r.disabled = !historique.futur.length;
  }

  // Comme dans Visual Basic : double-clic sur un contrôle = aller à son code.
  function ouvrirEvenement(c) {
    if (c.type === 'basedonnees') return montrerBlocsDe(c); // pas d'événement : on montre ses blocs
    const type = AVEC_CHANGE.includes(c.type) ? 'bs_quand_change'
      : c.type === 'zonedessin' ? 'bs_quand_glisse'
      : c.type === 'son' || c.type === 'video' ? 'bs_quand_son_fin'
      : c.type === 'minuteur' ? 'bs_quand_minuteur'
      : c.type === 'fichier' ? 'bs_quand_fichier_depose'
      : c.type === 'camera' ? 'bs_quand_camera_mouvement'
      : c.type === 'menucontextuel' ? 'bs_quand_menu_contextuel'
      : c.type === 'barreoutils' ? 'bs_quand_outil' : 'bs_quand_clic';
    afficherVue('vue-code');
    let bloc = workspace.getBlocksByType(type, false).find(b => b.getFieldValue('CTRL') === c.id);
    if (!bloc) {
      bloc = nouveauBlocEnBas(type, 'CTRL', c.id);
      // Menu contextuel, barre d'outils : le premier élément est déjà choisi.
      const elements = c.type === 'menucontextuel' ? BlocRuntime.elementsMenuContextuel(c.menu)
        : c.type === 'barreoutils' ? BlocRuntime.elementsBarreOutils(c.boutons) : [];
      if (elements.length) bloc.setFieldValue(elements[0], 'ITEM');
    }
    workspace.centerOnBlock(bloc.id);
    Blockly.common.setSelected(bloc);
  }

  // Crée un bloc « quand… » sous tous les autres.
  function nouveauBlocEnBas(type, champ, valeur) {
    const bas = workspace.getTopBlocks(false).reduce((m, b) => Math.max(m, b.getBoundingRectangle().bottom), 0);
    const bloc = workspace.newBlock(type);
    bloc.setFieldValue(valeur, champ);
    bloc.initSvg();
    bloc.render();
    bloc.moveBy(30, bas + 40);
    return bloc;
  }

  function ouvrirEvenementMenu(chemin) {
    afficherVue('vue-code');
    let bloc = workspace.getBlocksByType('bs_quand_menu', false).find(b => b.getFieldValue('MENU') === chemin);
    if (!bloc) bloc = nouveauBlocEnBas('bs_quand_menu', 'MENU', chemin);
    workspace.centerOnBlock(bloc.id);
    Blockly.common.setSelected(bloc);
  }

  // ---------------------------------------------------------------- Propriétés

  function afficherProprietes() {
    const liste = $('liste-proprietes');
    liste.innerHTML = '';
    const c = choisis.size > 1 ? null : projet.controles.find(x => x.id === selection);
    majBoutonsHistorique();

    // Liste de choix façon Visual Basic : la fenêtre puis tous les contrôles.
    const choix = $('choix-controle');
    choix.innerHTML = '';
    choix.add(new Option('🪟 ' + (fenetreActive ? fenetreCourante().nom : 'Fenêtre principale'), ''));
    projet.controles.filter(dansFenetreActive).sort((a, b) => a.nom.localeCompare(b.nom, 'fr')).forEach(x =>
      choix.add(new Option(`${ICONES_TYPES[x.type] || ''} ${x.nom} — ${NOMS_TYPES[x.type]}`, x.id)));
    choix.value = selection || '';
    $('btn-supprimer').hidden = !choisis.size;
    $('btn-supprimer').textContent = choisis.size > 1 ? `🗑️ Supprimer ces ${choisis.size} contrôles` : '🗑️ Supprimer ce contrôle';

    if (choisis.size > 1) return proprietesPlusieurs(liste, selectionnes());
    if (!c) {
      const f = fenetreCourante();
      if (f !== projet.fenetre) return proprietesAutreFenetre(liste, f);
      $('titre-proprietes').textContent = 'Fenêtre principale';
      champTexte(liste, 'Titre', f.titre, v => { f.titre = v; $('titre-design').textContent = v; });
      groupe(liste, [
        g => champNombre(g, 'Largeur', f.largeur, v => { f.largeur = Math.max(100, v); afficherConcepteur(); }),
        g => champNombre(g, 'Hauteur', f.hauteur, v => { f.hauteur = Math.max(60, v); afficherConcepteur(); })
      ]);
      champCouleur(liste, 'Couleur de fond', f.couleurFond, v => { f.couleurFond = v; afficherConcepteur(); });
      champsRedimensionnement(liste, f, true);
      champMenuContextuel(liste, f);
      champTexte(liste, "Menus — un par ligne ; leurs éléments en dessous, décalés d'un espace ; « - » pour un trait",
        f.menus, v => { f.menus = v; blocsAPerimes = true; afficherConcepteur(); }, true,
        'Fichier\n  Nouveau\n  -\n  Quitter\nAide\n  À propos');
      return;
    }

    $('titre-proprietes').textContent = NOMS_TYPES[c.type];
    const maj = () => { rafraichirControle(c); planifierSauvegarde(); };

    champTexte(liste, 'Nom (utilisé dans les blocs)', c.nom, (v, input) => {
      const valide = /^[A-Za-zÀ-ÖØ-öø-ÿ_][A-Za-zÀ-ÖØ-öø-ÿ0-9_]*$/.test(v) &&
        !projet.controles.some(x => x !== c && x.nom === v);
      input.classList.toggle('invalide', !valide);
      input.title = valide ? '' : 'Lettres, chiffres et _ seulement, sans espace, et pas deux fois le même nom.';
      if (valide) {
        c.nom = v;
        blocsAPerimes = true;
        const option = [...choix.options].find(o => o.value === c.id);
        if (option) option.text = `${ICONES_TYPES[c.type] || ''} ${c.nom} — ${NOMS_TYPES[c.type]}`;
        maj();
      }
    });
    const voirBlocs = el('button', 'bouton-ses-blocs', `🧰 Ses blocs (onglet Code)`);
    voirBlocs.title = 'Ouvre la catégorie de ce contrôle dans la boîte à outils : ses événements, ses actions et ses propriétés.';
    voirBlocs.addEventListener('click', () => montrerBlocsDe(c));
    liste.appendChild(voirBlocs);
    if (c.type === 'son') return proprietesSon(liste, c, maj);
    if (c.type === 'minuteur') return proprietesMinuteur(liste, c, maj);
    if (c.type === 'basedonnees') return proprietesBase(liste, c, maj);
    if (c.type === 'fichier') return proprietesFichier(liste, c, maj);
    if (c.type === 'menucontextuel') return proprietesMenuContextuel(liste, c, maj);
    if (c.type === 'barreoutils') {
      champTexte(liste, 'Boutons — un par ligne, en commençant par un emoji pour l\'icône ; « - » pour un trait',
        c.boutons || '', v => { c.boutons = v; blocsAPerimes = true; maj(); }, true, '📄 Nouveau\n💾 Enregistrer\n-\n✂️ Couper');
      champCase(liste, 'Icônes seules (le texte s\'affiche quand la souris passe dessus)', c.iconesSeules, v => { c.iconesSeules = v; maj(); });
      liste.appendChild(el('p', 'aide',
        'Toujours collée en haut de la fenêtre. Double-cliquez dessus pour écrire ce que fait un bouton ; ' +
        'ses blocs (bouton 🧰 ci-dessus) ont un « quand on clique sur … » tout prêt pour chaque bouton.'));
    }
    if (['bouton', 'etiquette', 'zonetexte', 'casecocher', 'boutonradio', 'cadre', 'interrupteur', 'lien'].includes(c.type)) {
      const multiligne = c.type === 'etiquette' || (c.type === 'zonetexte' && c.multiligne);
      champTexte(liste, c.type === 'cadre' ? 'Titre' : 'Texte', c.texte, v => { c.texte = v; maj(); }, multiligne);
    }
    if (c.type === 'zonetexte') {
      if (!c.motDePasse) {
        champCase(liste, 'Multiligne (plusieurs lignes)', c.multiligne, v => {
          c.multiligne = v;
          if (v && c.hauteur < 80) c.hauteur = 100;
          maj();
          afficherProprietes();
        });
      }
      if (!c.multiligne) {
        champCase(liste, 'Mot de passe (les lettres sont cachées par des •)', c.motDePasse, v => {
          c.motDePasse = v;
          maj();
          afficherProprietes();
        });
      }
      champTexte(liste, 'Texte d\'invite (grisé tant que la zone est vide)', c.texteInvite || '',
        v => { c.texteInvite = v; maj(); }, false, 'Tapez votre nom…');
      champCase(liste, 'Lecture seule (on peut lire et copier, pas écrire)', c.lectureSeule, v => { c.lectureSeule = v; maj(); });
      champNombre(liste, 'Longueur maximale, en lettres (0 = sans limite)', c.longueurMax || 0,
        v => { c.longueurMax = Math.max(0, Math.round(v)); maj(); });
    }
    if (c.type === 'arborescence') {
      champTexte(liste, 'Éléments — un par ligne ; décalez une ligne d\'espaces pour la ranger dans celle du dessus',
        c.arbre || '', v => { c.arbre = v; maj(); }, true, 'Animaux\n  Chats\n  Chiens\nPlantes');
      champCase(liste, 'Tout déplié au départ', c.deplie !== false, v => { c.deplie = v; maj(); });
      liste.appendChild(el('p', 'aide',
        'Comme l\'Explorateur de Windows : on déplie un dossier avec sa flèche ou un double-clic. ' +
        'Double-cliquez sur l\'arborescence pour réagir quand on choisit un élément ; « chemin de l\'élément choisi » ' +
        'donne par exemple « Animaux › Chats ».'));
    }
    if (c.type === 'barreetat') {
      champTexte(liste, 'Texte des cases, séparées par |', c.texte, v => { c.texte = v; maj(); }, false, 'Prêt|Page 1');
      liste.appendChild(el('p', 'aide',
        'Toujours collée en bas de la fenêtre. Pour changer une case pendant le programme : ' +
        '« écrire … dans la case n° … » (dans ses blocs : bouton 🧰 ci-dessus).'));
    }
    if (c.type === 'casecocher') champCase(liste, 'Coché', c.coche, v => { c.coche = v; maj(); });
    if (c.type === 'interrupteur') champCase(liste, 'Allumé', c.coche, v => { c.coche = v; maj(); });
    if (c.type === 'lien') {
      champTexte(liste, 'Adresse web (s\'ouvre dans le navigateur ; vide = simple texte cliquable)', c.adresse || '',
        v => { c.adresse = v.trim(); maj(); });
    }
    if (c.type === 'video') proprietesVideo(liste, c, maj);
    if (c.type === 'camera') {
      champCase(liste, 'S\'allume toute seule au démarrage', c.allumerAuDemarrage !== false, v => { c.allumerAuDemarrage = v; maj(); });
      champCase(liste, 'En miroir (comme dans une glace)', c.miroir !== false, v => { c.miroir = v; maj(); });
      champNombre(liste, 'Seuil de mouvement (%) : plus petit = plus sensible', c.seuilMouvement ?? 10,
        v => { c.seuilMouvement = Math.min(100, Math.max(1, v)); maj(); });
      liste.appendChild(el('p', 'aide',
        'La webcam s\'affiche quand le programme tourne ; la première fois, Windows demande la permission. ' +
        'Ses blocs (bouton 🧰 ci-dessus) : « prendre une photo avec… », « mettre la photo de… dans… » (une image ou une zone de dessin), ' +
        '« enregistrer … dans un fichier » avec un contrôle Fichier. Double-cliquez sur la caméra pour réagir quand elle voit bouger.'));
    }
    if (c.type === 'graphique') proprietesGraphique(liste, c, maj);
    if (c.type === 'onglets') proprietesOnglets(liste, c, maj);
    if (c.type === 'boutonradio') {
      champCase(liste, 'Sélectionné', c.coche, v => {
        // Dans un groupe, un seul bouton radio peut être sélectionné.
        if (v) {
          for (const o of projet.controles) {
            if (o !== c && o.type === 'boutonradio' && o.groupe === c.groupe && o.coche) {
              o.coche = false;
              rafraichirControle(o);
            }
          }
        }
        c.coche = v;
        maj();
      });
      champTexte(liste, 'Groupe (les boutons d\'un même groupe s\'excluent)', c.groupe, v => {
        c.groupe = v.trim() || 'groupe1';
        blocsAPerimes = true;
        maj();
      });
    }
    if (c.type === 'image') {
      champImage(liste, c, maj);
      champChoix(liste, 'Ajustement de l\'image', [['entiere', 'Entière'], ['etiree', 'Étirée'], ['recadree', 'Recadrée']],
        c.ajustement || 'entiere', v => { c.ajustement = v; maj(); });
    }
    if (c.type === 'image' || c.type === 'etiquette') {
      champChoix(liste, 'Bordure', [['aucune', 'Aucune'], ['simple', 'Simple'], ['creuse', 'Creuse']],
        c.bordure || 'aucune', v => { c.bordure = v; maj(); });
    }
    if (c.type === 'sprite') proprietesSprite(liste, c, maj);
    if (c.type === 'selecteurnombre') {
      groupe(liste, [
        g => champNombre(g, 'Minimum', c.min, v => { c.min = v; maj(); }),
        g => champNombre(g, 'Maximum', c.max, v => { c.max = v; maj(); }),
        g => champNombre(g, 'Pas', c.pas, v => { c.pas = v; maj(); }),
        g => champNombre(g, 'Valeur', c.valeur, v => { c.valeur = v; maj(); })
      ]);
    }
    if (c.type === 'listederoulante' || c.type === 'zoneliste') {
      champTexte(liste, 'Éléments (un par ligne)', (c.elements || []).join('\n'),
        v => { c.elements = v.split('\n').filter(e => e.trim() !== ''); maj(); }, true);
      champCase(liste, 'Triée par ordre alphabétique (même ce qu\'on ajoute ensuite)', c.trie, v => { c.trie = v; maj(); });
    }
    if (c.type === 'curseur') {
      groupe(liste, [
        g => champNombre(g, 'Minimum', c.min, v => { c.min = v; maj(); }),
        g => champNombre(g, 'Maximum', c.max, v => { c.max = v; maj(); }),
        g => champNombre(g, 'Pas', c.pas ?? 1, v => { c.pas = v > 0 ? v : 1; maj(); }),
        g => champNombre(g, 'Valeur', c.valeur, v => { c.valeur = v; maj(); })
      ]);
      champChoix(liste, 'Orientation', [['horizontale', '↔ Horizontale'], ['verticale', '↕ Verticale']], c.orientation || 'horizontale', v => {
        // On le tourne : la largeur et la hauteur s'échangent.
        if ((v === 'verticale') === (c.largeur > c.hauteur)) [c.largeur, c.hauteur] = [c.hauteur, c.largeur];
        c.orientation = v;
        maj();
        afficherProprietes();
      });
      champCouleur(liste, 'Couleur du curseur', c.couleurBarre || '#4f46e5', v => { c.couleurBarre = v; maj(); });
    }
    if (c.type === 'tableau') {
      champTexte(liste, 'Colonnes (une par ligne)', c.colonnes.join('\n'),
        v => { c.colonnes = v.split('\n').map(e => e.trim()).filter(e => e); maj(); }, true);
      champTexte(liste, 'Lignes de départ (une par ligne, valeurs séparées par ;)',
        c.lignes.map(l => l.join(' ; ')).join('\n'),
        v => { c.lignes = v.split('\n').filter(l => l.trim()).map(l => l.split(';').map(e => e.trim())); maj(); }, true);
      champCase(liste, 'Mémoriser le contenu (le retrouver au prochain lancement)', c.memoriser, v => { c.memoriser = v; maj(); });
    }
    if (c.type === 'date') {
      const d = prop(liste, "Date au départ (vide = aujourd'hui)");
      const i = document.createElement('input');
      i.type = 'date';
      i.value = c.date || '';
      i.addEventListener('input', () => { c.date = i.value; maj(); });
      d.appendChild(i);
    }
    if (c.type === 'heure') {
      const d = prop(liste, 'Heure au départ (vide = l\'heure qu\'il est)');
      const i = document.createElement('input');
      i.type = 'time';
      i.value = c.heure || '';
      i.addEventListener('input', () => { c.heure = i.value; maj(); });
      d.appendChild(i);
    }
    if (c.type === 'forme') {
      const d = prop(liste, 'Forme');
      const choix = document.createElement('select');
      [['rectangle', '▭ Rectangle'], ['arrondi', '▢ Rectangle arrondi'], ['ovale', '⬭ Ovale (ou cercle si elle est carrée)'],
        ['triangle', '△ Triangle'], ['ligne', '╱ Ligne']].forEach(([v, t]) => choix.add(new Option(t, v)));
      choix.value = c.genre || 'rectangle';
      choix.addEventListener('change', () => {
        // Devenue une ligne : un trait fin (horizontal par défaut) plutôt qu'un grand carré.
        if (choix.value === 'ligne' && c.genre !== 'ligne' && (c.sens || 'horizontale') === 'horizontale') c.hauteur = 12;
        c.genre = choix.value;
        maj();
        afficherProprietes();
      });
      d.appendChild(choix);
      if (c.genre === 'ligne') {
        champChoix(liste, 'Sens de la ligne', [['horizontale', '—'], ['verticale', '|'], ['descendante', '╲'], ['montante', '╱']],
          c.sens || 'horizontale', v => { c.sens = v; maj(); });
      }
      groupe(liste, [
        g => champNombre(g, 'Épaisseur du trait', c.epaisseur ?? 2, v => { c.epaisseur = Math.max(0, v); maj(); }),
        g => champCouleur(g, 'Couleur du trait', c.couleurBordure, v => { c.couleurBordure = v; maj(); })
      ]);
      if (c.genre !== 'ligne') {
        liste.appendChild(el('p', 'aide', 'Sa « couleur de fond » (plus bas) la remplit ; vide = transparente. Épaisseur 0 : pas de bord.'));
      }
    }
    if (c.type === 'navigateur') {
      champTexte(liste, 'Adresse web (ex. : fr.wikipedia.org, une vidéo YouTube, une carte Google Maps)', c.adresse || '',
        v => { c.adresse = v.trim(); maj(); });
      liste.appendChild(el('p', 'aide', 'Google, Facebook, Amazon… refusent de s\'afficher à l\'intérieur d\'un programme : ' +
        'le Navigateur web propose alors de les ouvrir dans le navigateur de l\'ordinateur (ou bloc « ouvrir … dans le navigateur », catégorie Internet).'));
    }
    if (c.type === 'selecteurcouleur') champCouleur(liste, 'Couleur choisie', c.texte, v => { c.texte = v; maj(); });
    if (c.type === 'barreprogression') {
      groupe(liste, [
        g => champNombre(g, 'Valeur', c.valeur, v => { c.valeur = v; maj(); }),
        g => champNombre(g, 'Maximum', c.max, v => { c.max = v; maj(); })
      ]);
      champCouleur(liste, 'Couleur de la barre', c.couleurBarre, v => { c.couleurBarre = v; maj(); });
      champCase(liste, 'Cliquable : un clic (ou un glisser) choisit la valeur, puis « quand … change »', c.cliquable,
        v => { c.cliquable = v; maj(); afficherProprietes(); });
      if (c.cliquable) {
        liste.appendChild(el('p', 'aide', 'Par exemple pour un lecteur de musique : dans « quand ' + c.nom +
          ' change », mettre la position du son à la valeur de ' + c.nom + ' (avec le maximum = la durée du son).'));
      }
    }

    if (c.type === 'panneau') {
      champChoix(liste, 'Défilement', [['vertical', '↕ Vertical'], ['horizontal', '↔ Horizontal'], ['deux', '✥ Les deux']],
        c.defilement || 'vertical', v => { c.defilement = v; maj(); });
      groupe(liste, [
        g => champNombre(g, 'Largeur du contenu', c.largeurContenu || 0, v => { c.largeurContenu = Math.max(0, v); maj(); }),
        g => champNombre(g, 'Hauteur du contenu', c.hauteurContenu || 0, v => { c.hauteurContenu = Math.max(0, v); maj(); })
      ]);
      liste.appendChild(el('p', 'aide',
        'Posez des contrôles dedans : ils défilent avec lui. Faites défiler le panneau (molette ou barre de défilement) ' +
        'pour en poser plus bas. Le contenu s\'agrandit tout seul jusqu\'au dernier contrôle ; « Hauteur du contenu » réserve de la place en plus.'));
    }
    if (panneauDe(c)) {
      liste.appendChild(el('p', 'aide', `Posé dans « ${panneauDe(c).nom} » : X et Y comptent depuis le coin de son contenu. ` +
        'Pour l\'en sortir, tirez-le hors du panneau.'));
    }
    groupe(liste, [
      g => champNombre(g, 'X', c.x, v => { c.x = v; maj(); }),
      g => champNombre(g, 'Y', c.y, v => { c.y = v; maj(); }),
      g => champNombre(g, 'Largeur', c.largeur, v => { c.largeur = Math.max(10, v); maj(); }),
      g => champNombre(g, 'Hauteur', c.hauteur, v => { c.hauteur = Math.max(10, v); maj(); })
    ]);
    if (AVEC_TEXTE.includes(c.type)) {
      champNombre(liste, 'Taille du texte', c.taillePolice, v => { c.taillePolice = Math.max(6, v); maj(); });
      groupe(liste, [
        g => champCase(g, 'Gras', c.gras, v => { c.gras = v; maj(); }),
        g => champCase(g, 'Italique', c.italique, v => { c.italique = v; maj(); })
      ]);
      if (ALIGNABLES.includes(c.type)) {
        champChoix(liste, 'Alignement du texte', [['gauche', '⇤ Gauche'], ['centre', '↔ Centre'], ['droite', '⇥ Droite']],
          c.alignement || (c.type === 'bouton' ? 'centre' : 'gauche'), v => { c.alignement = v; maj(); });
      }
      champCouleur(liste, 'Couleur du texte', c.couleurTexte, v => { c.couleurTexte = v; maj(); });
    }
    champCouleur(liste, 'Couleur de fond', c.couleurFond, v => { c.couleurFond = v; maj(); });
    champTexte(liste, 'Infobulle (petit texte montré quand la souris reste dessus)', c.infobulle || '',
      v => { c.infobulle = v; maj(); }, false, 'Cliquez ici pour…');
    champCase(liste, 'Visible au démarrage', c.visible !== false, v => { c.visible = v; maj(); });
    champCase(liste, 'Déplaçable à la souris (pendant le programme)', c.deplacable, v => { c.deplacable = v; maj(); });
    if (!AMARRES.includes(c.type)) champAncrage(liste, c.ancrage, v => { c.ancrage = v; });
    champMenuContextuel(liste, c);
  }

  function proprietesPlusieurs(liste, ctrls) {
    $('titre-proprietes').textContent = `${ctrls.length} contrôles sélectionnés`;
    const visibles = ctrls.filter(c => !estInvisible(c));
    const ref = visibles.find(c => c.id === selection) || visibles[0];
    const boutons = (parent, defs, classe) => {
      const zone = el('div', 'prop-boutons ' + classe);
      for (const [texte, action, titre, actif = true] of defs) {
        const b = el('button', null, texte);
        b.title = titre;
        b.disabled = !actif;
        b.addEventListener('click', () => arranger(action));
        zone.appendChild(b);
      }
      parent.appendChild(zone);
    };
    if (visibles.length > 1) {
      boutons(prop(liste, `Aligner sur « ${ref.nom} » (entouré en plein)`), [
        ['⇤ Gauche', 'gauche', 'Bords gauches alignés'],
        ['↔ Centre', 'centre', 'Centrés les uns sous les autres'],
        ['⇥ Droite', 'droite', 'Bords droits alignés'],
        ['⤒ Haut', 'haut', 'Bords du haut alignés'],
        ['↕ Milieu', 'milieu', 'Centrés sur une même ligne'],
        ['⤓ Bas', 'bas', 'Bords du bas alignés']
      ], 'alignements');
      boutons(prop(liste, 'Taille et espacement'), [
        ['Même largeur', 'largeur', `Largeur de « ${ref.nom} » pour tous`],
        ['Même hauteur', 'hauteur', `Hauteur de « ${ref.nom} » pour tous`],
        ['Espacer ↔', 'espacerH', 'Même espace entre eux, de gauche à droite (au moins 3 contrôles)', visibles.length > 2],
        ['Espacer ↕', 'espacerV', 'Même espace entre eux, de haut en bas (au moins 3 contrôles)', visibles.length > 2]
      ], 'tailles');
    }
    // Propriétés communes : changées pour tous à la fois.
    const pourTous = (liste2, f) => { liste2.forEach(c => { f(c); rafraichirControle(c); }); };
    const avecTexte = visibles.filter(c => AVEC_TEXTE.includes(c.type));
    if (avecTexte.length) {
      champNombre(liste, 'Taille du texte', avecTexte[0].taillePolice, v => pourTous(avecTexte, c => { c.taillePolice = Math.max(6, v); }));
      champCouleur(liste, 'Couleur du texte', avecTexte[0].couleurTexte, v => pourTous(avecTexte, c => { c.couleurTexte = v; }));
    }
    if (visibles.length) {
      champCouleur(liste, 'Couleur de fond', visibles[0].couleurFond, v => pourTous(visibles, c => { c.couleurFond = v; }));
      champCase(liste, 'Visibles au démarrage', visibles.every(c => c.visible !== false), v => pourTous(visibles, c => { c.visible = v; }));
      const ancres = visibles.filter(c => !AMARRES.includes(c.type));
      if (ancres.length) champAncrage(liste, ancres[0].ancrage, v => ancres.forEach(c => { c.ancrage = v; }));
    }
    liste.appendChild(el('p', 'aide',
      'Ctrl+clic : ajouter ou retirer un contrôle. Glissez l\'un d\'eux pour les déplacer tous ; ' +
      'flèches : déplacer au pixel près (Maj : de 10). Clic droit : copier, coller, dupliquer…'));
  }

  // Fenêtre que l'on peut agrandir ou rétrécir pendant le programme.
  function champsRedimensionnement(liste, f, principale) {
    champCase(liste, 'Redimensionnable (on peut tirer son bord pour changer sa taille)', f.redimensionnable, v => {
      f.redimensionnable = v;
      afficherProprietes();
    });
    if (f.redimensionnable) {
      groupe(liste, [
        g => champNombre(g, 'Largeur minimale', f.largeurMin ?? 100, v => { f.largeurMin = Math.max(100, v); }),
        g => champNombre(g, 'Hauteur minimale', f.hauteurMin ?? 60, v => { f.hauteurMin = Math.max(60, v); })
      ]);
    }
    if (principale) {
      champCase(liste, 'Bouton Agrandir dans la barre de titre (application .exe)', f.agrandir, v => { f.agrandir = v; });
      champCase(liste, 'Démarrer agrandie, sur tout l\'écran (application .exe)', f.agrandie, v => { f.agrandie = v; });
    }
    if (f.redimensionnable || f.agrandir || f.agrandie) {
      liste.appendChild(el('p', 'aide',
        'Quand la fenêtre change de taille, chaque contrôle suit les bords choisis dans sa propriété « Ancrage » ' +
        '(par défaut, il reste en haut à gauche). Pendant l\'essai dans BlocStudio, on la tire par la poignée ◢ de son coin.'));
    }
  }

  // Ancrage façon Visual Basic : les bords de la fenêtre (ou du conteneur) que le contrôle suit.
  // h : haut, b : bas, g : gauche, d : droite.
  function champAncrage(parent, valeur, surChange) {
    const d = prop(parent, 'Ancrage : quand la fenêtre change de taille, le contrôle suit les bords en bleu');
    let a = valeur ?? 'hg';
    const ligne = el('div', 'ligne');
    const boite = el('div', 'ancrage');
    boite.appendChild(el('span', 'ancrage-centre'));
    const explication = el('span', 'aide ancrage-texte');
    const cotes = [['h', 'haut', 'du haut'], ['b', 'bas', 'du bas'], ['g', 'gauche', 'gauche'], ['d', 'droite', 'droit']];
    const boutons = cotes.map(([l, classe, nom]) => {
      const b = el('button', 'ancrage-' + classe);
      b.type = 'button';
      b.title = 'Suivre le bord ' + nom;
      b.addEventListener('click', () => {
        a = 'hbgd'.split('').filter(x => x === l ? !a.includes(x) : a.includes(x)).join('');
        surChange(a);
        maj();
        planifierSauvegarde();
      });
      boite.appendChild(b);
      return [l, b];
    });
    const maj = () => {
      boutons.forEach(([l, b]) => b.classList.toggle('actif', a.includes(l)));
      explication.textContent = expliquerAncrage(a);
    };
    ligne.append(boite, explication);
    d.appendChild(ligne);
    maj();
  }

  function expliquerAncrage(a) {
    const g = a.includes('g'), d = a.includes('d'), h = a.includes('h'), b = a.includes('b');
    const parties = [
      g && d ? 's\'étire en largeur' : d ? 'reste collé à droite' : g ? '' : 'reste centré de gauche à droite',
      h && b ? 's\'étire en hauteur' : b ? 'reste collé en bas' : h ? '' : 'reste centré de haut en bas'
    ].filter(x => x);
    if (g && d && h && b) return 'Il s\'étire en largeur et en hauteur.';
    return parties.length ? 'Il ' + parties.join(' et ') + '.' : 'Il reste en haut à gauche (comme d\'habitude).';
  }

  function proprietesAutreFenetre(liste, f) {
    $('titre-proprietes').textContent = 'Autre fenêtre';
    champTexte(liste, 'Nom (utilisé dans les blocs)', f.nom, (v, input) => {
      const valide = /^[A-Za-zÀ-ÖØ-öø-ÿ_][A-Za-zÀ-ÖØ-öø-ÿ0-9_]*$/.test(v) && !projet.fenetres.some(x => x !== f && x.nom === v);
      input.classList.toggle('invalide', !valide);
      input.title = valide ? '' : 'Lettres, chiffres et _ seulement, sans espace, et pas deux fenêtres du même nom.';
      if (valide) {
        f.nom = v;
        blocsAPerimes = true;
        afficherOngletsFenetres();
        $('choix-controle').options[0].text = '🪟 ' + v;
      }
    });
    champTexte(liste, 'Titre', f.titre, v => { f.titre = v; $('titre-design').textContent = v; });
    const tropGrande = () => f.largeur > projet.fenetre.largeur || f.hauteur + 30 > projet.fenetre.hauteur;
    groupe(liste, [
      g => champNombre(g, 'Largeur', f.largeur, v => { f.largeur = Math.max(100, v); afficherConcepteur(); avertir(); }),
      g => champNombre(g, 'Hauteur', f.hauteur, v => { f.hauteur = Math.max(60, v); afficherConcepteur(); avertir(); })
    ]);
    const avertissement = el('p', 'aide avertissement', '⚠️ Plus grande que la fenêtre principale : dans l\'application .exe, elle serait coupée.');
    const avertir = () => { avertissement.hidden = !tropGrande(); };
    liste.appendChild(avertissement);
    avertir();
    champCouleur(liste, 'Couleur de fond', f.couleurFond, v => { f.couleurFond = v; afficherConcepteur(); });
    champsRedimensionnement(liste, f, false);
    champMenuContextuel(liste, f);
    liste.appendChild(el('p', 'aide',
      'Cette fenêtre s\'ouvre par-dessus la fenêtre principale avec le bloc « ouvrir la fenêtre » (onglet Code, catégorie « 🪟 ' + f.nom + ' »). ' +
      'Double-cliquez sur son onglet pour écrire ce qui se passe quand elle s\'ouvre.'));
    const supprimer = el('button', 'danger', '🗑️ Supprimer cette fenêtre');
    supprimer.addEventListener('click', () => supprimerFenetre(f));
    liste.appendChild(supprimer);
  }

  function proprietesSon(liste, c, maj) {
    const d = prop(liste, 'Son joué');
    const choix = document.createElement('select');
    choix.add(new Option('(aucun son)', ''));
    projet.sons.forEach(s => choix.add(new Option('🎵 ' + s.nom, s.id)));
    choix.value = projet.sons.some(s => s.id === c.son) ? c.son : '';
    choix.addEventListener('change', () => { c.son = choix.value; maj(); afficherProprietes(); });
    d.appendChild(choix);

    // Le son choisi s'écoute et se découpe ici ; on peut aussi en ajouter un nouveau.
    const boutons = document.createElement('div');
    boutons.className = 'prop-boutons';
    const bouton = (texte, action, actif = true) => {
      const b = document.createElement('button');
      b.textContent = texte;
      b.disabled = !actif;
      b.addEventListener('click', action);
      boutons.appendChild(b);
      return b;
    };
    const son = projet.sons.find(s => s.id === c.son);
    const ecoute = bouton('▶ Écouter', () => ecouterSon(son, ecoute), !!son);
    suivreEcoute(ecoute, son);
    bouton('✂️ Découper', () => ouvrirDecoupe(son), !!son);
    const choisir = s => { c.son = s.id; maj(); afficherProprietes(); };
    bouton('🎵 Importer…', () => importerSon(choisir));
    bouton('🎤 Enregistrer…', () => ouvrirMicro(choisir));
    bouton('🎹 Composer…', () => composerMusique(choisir));
    if (son && son.musique) bouton('🎹 Modifier la musique', () => modifierMusique(son));
    prop(liste, '').appendChild(boutons);

    const v = prop(liste, `Volume : ${c.volume ?? 100} %`);
    const curseur = document.createElement('input');
    curseur.type = 'range';
    curseur.min = 0;
    curseur.max = 100;
    curseur.value = c.volume ?? 100;
    curseur.addEventListener('input', () => {
      c.volume = Number(curseur.value);
      v.querySelector('label').textContent = `Volume : ${c.volume} %`;
      planifierSauvegarde();
    });
    v.appendChild(curseur);
    champCase(liste, 'Jouer en boucle (musique de fond)', c.boucle, val => { c.boucle = val; maj(); });
    champCase(liste, 'Jouer dès le démarrage du programme', c.autoDemarrage, val => { c.autoDemarrage = val; maj(); });
    liste.appendChild(el('p', 'aide',
      'Double-cliquez sur ce contrôle (sous la fenêtre) pour programmer « quand il se termine ». ' +
      'Ses autres blocs : bouton 🧰 ci-dessus.'));
  }

  function proprietesMinuteur(liste, c, maj) {
    const d = prop(liste, 'Intervalle (secondes entre deux « tics »)');
    const i = document.createElement('input');
    i.type = 'number';
    i.min = 0.05;
    i.step = 0.1;
    i.value = c.intervalle;
    i.addEventListener('input', () => {
      if (Number(i.value) > 0) { c.intervalle = Number(i.value); maj(); }
    });
    d.appendChild(i);
    champCase(liste, 'En marche dès le démarrage', c.active !== false, val => { c.active = val; maj(); });
    liste.appendChild(el('p', 'aide',
      'Double-cliquez sur ce contrôle (sous la fenêtre) pour programmer ce qu\'il fait à chaque « tic ». ' +
      'On peut le démarrer, l\'arrêter ou changer son intervalle avec des blocs.'));
  }

  const TYPES_FICHIER_EDITEUR = {
    texte: 'Texte (.txt)', csv: 'Tableur (.csv, lisible par Excel)', image: 'Image (PNG, JPG, GIF…)', son: 'Son (MP3, WAV, OGG…)', tous: 'Tous les fichiers'
  };

  // Menu qui s'ouvre au clic droit sur ce contrôle (ou sur le fond de cette fenêtre).
  function champMenuContextuel(liste, objet) {
    const menus = projet.controles.filter(m => m.type === 'menucontextuel');
    if (!menus.length) return;
    const d = prop(liste, 'Menu contextuel (au clic droit)');
    const choix = document.createElement('select');
    choix.add(new Option('(aucun)', ''));
    menus.forEach(m => choix.add(new Option('🖱️ ' + m.nom, m.id)));
    choix.value = menus.some(m => m.id === objet.menuContextuel) ? objet.menuContextuel : '';
    choix.addEventListener('change', () => {
      if (choix.value) objet.menuContextuel = choix.value; else delete objet.menuContextuel;
      afficherInvisibles();
      planifierSauvegarde();
    });
    d.appendChild(choix);
  }

  // Contrôles (et fenêtres) qui ouvrent ce menu contextuel.
  const utilisateursMenu = m => [projet.fenetre, ...projet.fenetres, ...projet.controles].filter(o => o.menuContextuel === m.id);

  function proprietesMenuContextuel(liste, c, maj) {
    champTexte(liste, 'Éléments du menu — un par ligne ; « - » pour un trait', c.menu || '',
      v => { c.menu = v; blocsAPerimes = true; maj(); afficherInvisibles(); }, true, 'Copier\nColler\n-\nSupprimer');
    const qui = utilisateursMenu(c).map(o => o === projet.fenetre ? 'la fenêtre principale' : o.nom);
    liste.appendChild(el('p', 'aide',
      (qui.length ? `Il s'ouvre au clic droit sur : ${qui.join(', ')}. ` : 'Il ne s\'ouvre encore nulle part. ') +
      'Pour qu\'un contrôle (ou une fenêtre) l\'ouvre au clic droit, choisissez ce menu dans sa propriété « Menu contextuel ». ' +
      'Double-cliquez sur le menu pour écrire ce que fait un élément ; ses blocs (bouton 🧰 ci-dessus) en ont un tout prêt pour chaque élément.'));
  }

  function proprietesFichier(liste, c, maj) {
    const d = prop(liste, 'Type de fichier proposé');
    const choix = document.createElement('select');
    for (const [v, t] of Object.entries(TYPES_FICHIER_EDITEUR)) choix.add(new Option(t, v));
    choix.value = c.typeFichier || 'texte';
    choix.addEventListener('change', () => {
      c.typeFichier = choix.value;
      // Le nom proposé prend l'extension qui va avec.
      const ext = { texte: '.txt', csv: '.csv', image: '.png', son: '.mp3' }[c.typeFichier];
      if (ext && c.nomPropose) c.nomPropose = c.nomPropose.replace(/\.[a-z0-9]{1,5}$/i, '') + ext;
      maj();
      afficherProprietes();
      afficherInvisibles();
    });
    d.appendChild(choix);
    champTexte(liste, 'Nom proposé pour enregistrer', c.nomPropose || '', v => { c.nomPropose = v; maj(); });
    liste.appendChild(el('p', 'aide',
      'Comme les boîtes « Ouvrir » et « Enregistrer sous » de Visual Basic. Ses blocs (bouton 🧰 ci-dessus) : ' +
      '« ouvrir un fichier avec… », puis « contenu du fichier » ; « enregistrer le texte … avec… » ; ' +
      'et des raccourcis pour un tableau ou une base (CSV), une image ou une zone de dessin (PNG). ' +
      'Double-cliquez sur ce contrôle pour réagir quand on dépose un fichier sur la fenêtre.'));
  }

  function proprietesBase(liste, c, maj) {
    champTexte(liste, 'Champs (un par ligne)', (c.champs || []).join('\n'), v => {
      const avant = c.champs || [];
      const apres = [...new Set(v.split('\n').map(e => e.trim()).filter(e => e))];
      // Les fiches de départ suivent leurs champs : retrouvés par leur nom, ou par leur place
      // quand le nombre de champs ne change pas (on est en train d'en renommer un).
      const place = apres.map((nom, i) => avant.includes(nom) ? avant.indexOf(nom) : avant.length === apres.length ? i : -1);
      c.fiches = (c.fiches || []).map(f => place.map(i => i < 0 ? '' : f[i] ?? ''));
      c.champs = apres;
      maj();
      BlocStudioBases.rafraichir(workspace);
      afficherInvisibles();
    }, true);
    champTexte(liste, 'Fiches de départ (une par ligne, valeurs séparées par ;)',
      (c.fiches || []).map(f => f.join(' ; ')).join('\n'), v => {
        c.fiches = v.split('\n').filter(l => l.trim()).map(l => l.split(';').map(e => e.trim()));
        maj();
        afficherInvisibles();
      }, true);
    champCase(liste, 'Garder les fiches d\'une fois à l\'autre', c.memoriser !== false, v => { c.memoriser = v; maj(); });
    liste.appendChild(el('p', 'aide',
      'Une base de données range des fiches : une valeur pour chaque champ. Ses blocs (bouton 🧰 ci-dessus) servent à ajouter, chercher, modifier ou supprimer des fiches, et « afficher … dans le tableau » pour les voir. ' +
      'Les fiches ajoutées pendant le programme sont gardées ; elles repartent des fiches de départ si vous changez celles-ci.'));
  }

  function prop(parent, libelle) {
    const d = document.createElement('div');
    d.className = 'prop';
    const l = document.createElement('label');
    l.textContent = libelle;
    d.appendChild(l);
    parent.appendChild(d);
    return d;
  }

  function groupe(parent, champs) {
    const g = document.createElement('div');
    g.className = 'prop-groupe';
    parent.appendChild(g);
    champs.forEach(f => f(g));
  }

  function champTexte(parent, libelle, valeur, surChange, multiligne, exemple) {
    const d = prop(parent, libelle);
    const i = document.createElement(multiligne ? 'textarea' : 'input');
    if (exemple) i.placeholder = exemple;
    if (!multiligne) i.type = 'text';
    else {
      // Assez haut pour voir toutes les lignes (dans la limite du raisonnable).
      const lignes = String(valeur || exemple || '').split('\n').length;
      const hauteur = Math.min(170, Math.max(50, lignes * 19 + 12));
      Object.assign(i.style, { width: '100%', minHeight: hauteur + 'px', font: 'inherit', fontSize: '14px' });
    }
    i.value = valeur ?? '';
    i.addEventListener('input', () => { surChange(i.value, i); planifierSauvegarde(); });
    d.appendChild(i);
    // Un émoji s'insère là où se trouve le curseur (sauf dans un nom, utilisé par les blocs).
    if (!libelle.startsWith('Nom')) {
      const b = el('button', 'bouton-emoji', '😀');
      b.type = 'button';
      b.title = 'Ajouter un émoji';
      b.addEventListener('click', () => SelecteurEmoji.ouvrir(b, e => SelecteurEmoji.inserer(i, e)));
      d.querySelector('label').appendChild(b);
    }
  }

  function champNombre(parent, libelle, valeur, surChange) {
    const d = prop(parent, libelle);
    const i = document.createElement('input');
    i.type = 'number';
    i.value = valeur;
    i.addEventListener('input', () => { if (i.value !== '') { surChange(Number(i.value)); planifierSauvegarde(); } });
    d.appendChild(i);
  }

  // Un choix parmi quelques possibilités, en boutons côte à côte. options : [[valeur, texte], …]
  function champChoix(parent, libelle, options, valeur, surChange) {
    const zone = el('div', 'prop-boutons prop-choix');
    const boutons = options.map(([v, texte]) => {
      const b = el('button', v === valeur ? 'actif' : null, texte);
      b.type = 'button';
      b.addEventListener('click', () => {
        boutons.forEach(x => x.classList.toggle('actif', x === b));
        surChange(v);
        planifierSauvegarde();
      });
      return b;
    });
    zone.append(...boutons);
    prop(parent, libelle).appendChild(zone);
  }

  function champCase(parent, libelle, valeur, surChange) {
    const d = prop(parent, '');
    const l = d.querySelector('label');
    l.style.cssText = 'display:flex;gap:6px;align-items:center;color:inherit;font-size:14px;cursor:pointer';
    const i = document.createElement('input');
    i.type = 'checkbox';
    i.checked = !!valeur;
    i.addEventListener('change', () => { surChange(i.checked); planifierSauvegarde(); });
    l.append(i, libelle);
  }

  function champCouleur(parent, libelle, valeur, surChange) {
    const d = prop(parent, libelle);
    const ligne = document.createElement('div');
    ligne.className = 'ligne';
    const choix = document.createElement('input');
    choix.type = 'color';
    const texte = document.createElement('input');
    texte.type = 'text';
    texte.placeholder = 'aucune, rouge, #ff8800…';
    texte.value = valeur || '';
    const synchro = () => {
      const hex = BlocRuntime.couleur(texte.value);
      if (/^#[0-9a-f]{6}$/i.test(hex)) choix.value = hex;
    };
    synchro();
    choix.addEventListener('input', () => { texte.value = choix.value; surChange(choix.value); planifierSauvegarde(); });
    texte.addEventListener('input', () => { synchro(); surChange(texte.value.trim()); planifierSauvegarde(); });
    ligne.append(choix, texte);
    d.appendChild(ligne);
  }

  function champImage(parent, c, maj) {
    const d = prop(parent, 'Image');
    const b = document.createElement('button');
    b.textContent = '📁 Choisir une image…';
    b.style.cssText = 'width:100%;padding:6px';
    const f = document.createElement('input');
    f.type = 'file';
    f.accept = 'image/*';
    f.hidden = true;
    b.addEventListener('click', () => f.click());
    f.addEventListener('change', () => {
      const fichier = f.files[0];
      if (!fichier) return;
      const r = new FileReader();
      r.onload = () => { c.image = r.result; maj(); };
      r.readAsDataURL(fichier);
    });
    d.append(b, f);
    champTexte(parent, '…ou adresse web de l\'image', c.image.startsWith('data:') ? '' : c.image, v => { c.image = v; maj(); });
  }

  function proprietesGraphique(liste, c, maj) {
    champTexte(liste, 'Titre', c.texte, v => { c.texte = v; maj(); });
    const d = prop(liste, 'Genre');
    const choix = document.createElement('select');
    for (const [valeur, libelle] of [['barres', '📊 Barres'], ['courbe', '📈 Courbe'], ['secteurs', '🥧 Secteurs (camembert)']]) {
      choix.add(new Option(libelle, valeur));
    }
    choix.value = c.genre || 'barres';
    choix.addEventListener('change', () => { c.genre = choix.value; maj(); });
    d.appendChild(choix);
    champTexte(liste, 'Valeurs de départ (une par ligne : étiquette ; nombre)',
      (c.valeurs || []).map((v, i) => `${(c.etiquettes || [])[i] ?? ''} ; ${v}`).join('\n'), v => {
        const lignes = v.split('\n').filter(l => l.trim()).map(l => {
          const morceaux = l.split(';');
          const nombre = parseFloat((morceaux.pop() || '').trim().replace(',', '.'));
          return [morceaux.join(';').trim(), isNaN(nombre) ? 0 : nombre];
        });
        c.etiquettes = lignes.map(l => l[0]);
        c.valeurs = lignes.map(l => l[1]);
        maj();
      }, true);
    champCouleur(liste, 'Couleur des barres / de la courbe', c.couleurBarre, v => { c.couleurBarre = v; maj(); });
    champNombre(liste, 'Garder seulement les N dernières valeurs (0 = toutes)', c.maxValeurs || 0,
      v => { c.maxValeurs = Math.max(0, Math.round(v)); maj(); });
  }

  // Une vidéo importée est rangée dans le projet : au-delà de quelques Mo,
  // la sauvegarde automatique ne suit plus (une adresse web n'a pas cette limite).
  const TAILLE_MAX_VIDEO = 3 * 1024 * 1024;

  function proprietesVideo(liste, c, maj) {
    const d = prop(liste, 'Vidéo');
    const b = document.createElement('button');
    b.textContent = '📁 Choisir une vidéo (MP4, WebM)…';
    b.style.cssText = 'width:100%;padding:6px';
    const f = document.createElement('input');
    f.type = 'file';
    f.accept = 'video/*';
    f.hidden = true;
    b.addEventListener('click', () => f.click());
    f.addEventListener('change', async () => {
      const fichier = f.files[0];
      if (!fichier) return;
      if (fichier.size > TAILLE_MAX_VIDEO &&
          !confirm(`Cette vidéo pèse ${(fichier.size / 1048576).toFixed(1)} Mo : le projet risque d'être trop gros ` +
            'pour la sauvegarde automatique (pensez à 💾 Enregistrer). Continuer ?')) return;
      c.video = await lireEnDataUrl(fichier);
      maj();
      afficherProprietes();
    });
    d.append(b, f);
    champTexte(liste, '…ou adresse web d\'un fichier vidéo (.mp4, .webm)', c.video.startsWith('data:') ? '' : c.video,
      v => { c.video = v.trim(); maj(); });
    champCase(liste, 'Afficher la barre de lecture', c.barreVideo !== false, v => { c.barreVideo = v; maj(); });
    champCase(liste, 'En boucle', c.boucle, v => { c.boucle = v; maj(); });
    champNombre(liste, 'Volume (%)', c.volume ?? 100, v => { c.volume = Math.min(100, Math.max(0, v)); maj(); });
  }

  // ---------------------------------------------------------------- Sprites

  // Taille d'affichage conseillée : les petits dessins en pixel art sont agrandis.
  const facteurSprite = s => Math.max(1, Math.round(64 / s.taille));

  function donnerSprite(c, s) {
    c.sprite = s.id;
    c.costume = 0;
    c.largeur = c.hauteur = s.taille * facteurSprite(s);
  }

  function miniatureSprite(s, classe) {
    const img = document.createElement('img');
    img.className = classe + (s.lisse ? '' : ' pixel');
    img.src = s.costumes[0]?.donnees || '';
    img.alt = '';
    return img;
  }

  function proprietesSprite(liste, c, maj) {
    const s = projet.sprites.find(x => x.id === c.sprite);
    const d = prop(liste, 'Sprite affiché');
    if (s) d.appendChild(miniatureSprite(s, 'apercu-sprite'));
    const choix = document.createElement('select');
    choix.add(new Option('(aucun sprite)', ''));
    projet.sprites.forEach(x => choix.add(new Option('🎭 ' + x.nom, x.id)));
    choix.value = s ? s.id : '';
    choix.addEventListener('change', () => {
      const nouveau = projet.sprites.find(x => x.id === choix.value);
      if (nouveau) donnerSprite(c, nouveau); else c.sprite = '';
      maj();
      afficherProprietes();
    });
    d.appendChild(choix);

    const boutons = document.createElement('div');
    boutons.className = 'prop-boutons';
    const bouton = (texte, action, actif = true) => {
      const b = document.createElement('button');
      b.textContent = texte;
      b.disabled = !actif;
      b.addEventListener('click', action);
      boutons.appendChild(b);
    };
    const choisir = nouveau => { donnerSprite(c, nouveau); maj(); afficherProprietes(); };
    bouton('🎨 Modifier', () => modifierSprite(s), !!s);
    bouton('➕ Dessiner…', () => nouveauSprite(choisir));
    bouton('📁 Importer…', () => importerSprite(choisir));
    prop(liste, '').appendChild(boutons);
    if (!s) {
      liste.appendChild(el('p', 'aide', 'Choisissez un sprite, dessinez-en un ou importez une image (PNG, JPG, GIF animé…).'));
      return;
    }

    const dc = prop(liste, 'Costume au démarrage');
    const costume = document.createElement('select');
    s.costumes.forEach((x, i) => costume.add(new Option(`${i + 1}. ${x.nom}`, i)));
    costume.value = Math.min(Number(c.costume) || 0, s.costumes.length - 1);
    costume.addEventListener('change', () => { c.costume = Number(costume.value); maj(); });
    dc.appendChild(costume);

    // Agrandissement « entier » : les pixels restent tous de la même taille.
    const dt = prop(liste, `Taille à l'écran (le dessin fait ${s.taille} × ${s.taille} pixels)`);
    const tailles = document.createElement('div');
    tailles.className = 'prop-boutons';
    for (const k of [1, 2, 3, 4, 6]) {
      const b = document.createElement('button');
      b.textContent = '×' + k;
      b.title = `${s.taille * k} × ${s.taille * k} pixels`;
      if (c.largeur === s.taille * k && c.hauteur === s.taille * k) b.className = 'actif';
      b.addEventListener('click', () => { c.largeur = c.hauteur = s.taille * k; maj(); afficherProprietes(); });
      tailles.appendChild(b);
    }
    dt.appendChild(tailles);
    champCase(liste, `Animé dès le démarrage (${s.costumes.length} costume${s.costumes.length > 1 ? 's' : ''}, ${s.vitesse || 8} images/s)`,
      c.anime, v => { c.anime = v; maj(); });
    champCase(liste, 'Retourné (miroir)', c.miroir, v => { c.miroir = v; maj(); });
    champNombre(liste, 'Angle (degrés)', c.rotation || 0, v => { c.rotation = v; maj(); });
    champNombre(liste, 'Taille (%, 100 = normale)', c.taille ?? 100, v => { c.taille = Math.max(0, v); maj(); });
    champNombre(liste, 'Transparence (%, 0 = opaque)', c.transparence || 0, v => { c.transparence = Math.min(100, Math.max(0, v)); maj(); });
  }

  function nomSpriteLibre(base) {
    base = (base || '').trim().slice(0, 30) || 'sprite';
    let nom = base;
    for (let i = 2; projet.sprites.some(s => s.nom === nom); i++) nom = `${base} ${i}`;
    return nom;
  }

  // Après toute modification de la bibliothèque : la fenêtre, les blocs et le Sommaire suivent.
  function apresChangementSprites() {
    blocsAPerimes = true;
    planifierSauvegarde();
    afficherConcepteur();
    afficherProprietes();
    if ($('vue-sommaire').classList.contains('actif')) afficherSommaire();
  }

  // `surAjout(sprite)` : appelé avec le nouveau sprite (par exemple pour le donner à un contrôle).
  // `fichier` : image à importer dans le nouveau sprite.
  async function nouveauSprite(surAjout, fichier) {
    const r = await EditeurSprite.ouvrir(null, {
      nomsPris: projet.sprites.map(s => s.nom),
      nom: nomSpriteLibre(fichier ? fichier.name.replace(/\.[^.]+$/, '') : 'sprite'),
      fichier
    });
    if (!r) return;
    const s = Object.assign({ id: 'spr_' + nouvelId() }, r);
    projet.sprites.push(s);
    apresChangementSprites();
    $('astuce').textContent = `🎭 Sprite « ${s.nom} » créé : posez un contrôle Sprite dans la fenêtre pour l'afficher.`;
    if (typeof surAjout === 'function') surAjout(s);
  }

  function importerSprite(surAjout) {
    const choix = document.createElement('input');
    choix.type = 'file';
    choix.accept = 'image/*,.bsprite';
    choix.addEventListener('change', () => {
      const fichier = choix.files[0];
      if (!fichier) return;
      if (/\.bsprite$/i.test(fichier.name)) importerFichierSprite(fichier, surAjout);
      else nouveauSprite(surAjout, fichier);
    });
    choix.click();
  }

  // ---- Exporter et réimporter les créations (sprites, musiques, sons) ----
  // .bsprite et .bmusique : des fichiers JSON qu'un autre projet BlocStudio sait réimporter.
  const nomDeFichier = nom => String(nom).replace(/[\\/:*?"<>|]+/g, '').trim() || 'sans nom';
  const octetsDataUrl = url => Uint8Array.from(atob(url.slice(url.indexOf(',') + 1)), c => c.charCodeAt(0));

  function chargerImage(url) {
    return new Promise((ok, erreur) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = erreur;
      img.src = url;
    });
  }

  // Costumes côte à côte dans un PNG. Un sprite en pixels est agrandi (sans flou) pour être bien visible.
  async function pngCostumes(s, costumes) {
    const k = s.lisse ? 1 : Math.max(1, Math.floor(256 / s.taille));
    const cote = s.taille * k;
    const toile = document.createElement('canvas');
    toile.width = cote * costumes.length;
    toile.height = cote;
    const g = toile.getContext('2d');
    g.imageSmoothingEnabled = !!s.lisse;
    for (let i = 0; i < costumes.length; i++) g.drawImage(await chargerImage(costumes[i].donnees), i * cote, 0, cote, cote);
    return octetsDataUrl(toile.toDataURL('image/png'));
  }

  function menuExporterSprite(ev, s) {
    const plusieurs = s.costumes.length > 1;
    menuContextuel(ev.clientX, ev.clientY, [
      ...s.costumes.slice(0, 8).map((c, i) => ({
        texte: `🖼️ ${plusieurs ? `Costume ${i + 1} « ${c.nom} »` : 'Image'} en PNG`,
        action: async () => telechargerOuSignaler(`${nomDeFichier(s.nom)}${plusieurs ? ' - ' + nomDeFichier(c.nom) : ''}.png`, await pngCostumes(s, [c]), 'image/png')
      })),
      ...(plusieurs ? [{
        texte: `🎞️ Tous les costumes côte à côte (planche PNG)`,
        action: async () => telechargerOuSignaler(`${nomDeFichier(s.nom)} - planche.png`, await pngCostumes(s, s.costumes), 'image/png')
      }] : []),
      '-',
      {
        texte: '📦 Sprite pour un autre projet (.bsprite)',
        action: () => {
          const { nom, taille, lisse, vitesse, costumes } = s;
          telechargerOuSignaler(nomDeFichier(s.nom) + '.bsprite',
            JSON.stringify({ format: 'BlocStudio-sprite', version: 1, sprite: { nom, taille, lisse, vitesse, costumes } }), 'application/json');
        }
      }
    ]);
  }

  async function importerFichierSprite(fichier, surAjout) {
    let s;
    try {
      const d = JSON.parse(await fichier.text());
      s = d && d.format === 'BlocStudio-sprite' && d.sprite;
      if (!s || !Array.isArray(s.costumes) || !s.costumes.length ||
        !s.costumes.every(c => typeof c.donnees === 'string' && c.donnees.startsWith('data:image/'))) throw new Error();
    } catch (e) {
      return alert(`« ${fichier.name} » n'est pas un sprite BlocStudio lisible.`);
    }
    const sprite = {
      id: 'spr_' + nouvelId(), nom: nomSpriteLibre(String(s.nom || fichier.name.replace(/\.[^.]+$/, ''))),
      taille: Math.max(1, Number(s.taille) || 32), lisse: !!s.lisse, vitesse: Number(s.vitesse) || 8,
      costumes: s.costumes.map((c, i) => ({ nom: String(c.nom || 'costume ' + (i + 1)), donnees: c.donnees }))
    };
    projet.sprites.push(sprite);
    apresChangementSprites();
    $('astuce').textContent = `🎭 Sprite « ${sprite.nom} » importé (${sprite.costumes.length} costume(s)).`;
    if (typeof surAjout === 'function') surAjout(sprite);
  }

  // WAV 16 bits mono d'une partie d'un son (pour un son découpé : on exporte ce qui est joué).
  function wavDepuisTampon(tampon, debut, fin) {
    const taux = tampon.sampleRate;
    const i0 = Math.floor(debut * taux), n = Math.max(0, Math.floor(fin * taux) - i0);
    const octets = new DataView(new ArrayBuffer(44 + n * 2));
    const texte = (pos, t) => [...t].forEach((c, i) => octets.setUint8(pos + i, c.charCodeAt(0)));
    texte(0, 'RIFF'); octets.setUint32(4, 36 + n * 2, true); texte(8, 'WAVEfmt ');
    octets.setUint32(16, 16, true); octets.setUint16(20, 1, true); octets.setUint16(22, 1, true);
    octets.setUint32(24, taux, true); octets.setUint32(28, taux * 2, true); octets.setUint16(32, 2, true); octets.setUint16(34, 16, true);
    texte(36, 'data'); octets.setUint32(40, n * 2, true);
    const canaux = Array.from({ length: tampon.numberOfChannels }, (_, c) => tampon.getChannelData(c));
    for (let i = 0; i < n; i++) {
      let v = 0;
      for (const canal of canaux) v += canal[i0 + i] || 0;
      octets.setInt16(44 + i * 2, Math.max(-1, Math.min(1, v / canaux.length)) * 32767, true);
    }
    return new Uint8Array(octets.buffer);
  }

  function menuExporterSon(ev, s) {
    const type = (s.donnees.match(/^data:([^;,]+)/) || [])[1] || 'audio/wav';
    const extension = { 'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/ogg': 'ogg', 'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a' }[type] || 'wav';
    const decoupe = s.fin > s.debut || s.debut > 0;
    menuContextuel(ev.clientX, ev.clientY, [
      { texte: `🔊 Le son en fichier ${extension.toUpperCase()}${decoupe ? ' (en entier)' : ''}`,
        action: () => telechargerOuSignaler(`${nomDeFichier(s.nom)}.${extension}`, octetsDataUrl(s.donnees), type) },
      ...(decoupe ? [{
        texte: '✂️ Seulement la partie découpée (WAV)',
        action: async () => {
          const tampon = await BlocRuntime.decoderSon(s.donnees);
          const [debut, fin] = BlocRuntime.extraitSon(s, tampon);
          telechargerOuSignaler(`${nomDeFichier(s.nom)} (extrait).wav`, wavDepuisTampon(tampon, debut, fin), 'audio/wav');
        }
      }] : []),
      ...(s.musique ? ['-', {
        texte: '🎹 La partition, pour un autre projet (.bmusique)',
        action: () => telechargerOuSignaler(nomDeFichier(s.nom) + '.bmusique',
          JSON.stringify({ format: 'BlocStudio-musique', version: 1, nom: s.nom, musique: s.musique }), 'application/json')
      }] : [])
    ]);
  }

  async function importerFichierMusique(fichier, surAjout) {
    let d;
    try {
      d = JSON.parse(await fichier.text());
      if (!d || d.format !== 'BlocStudio-musique' || !d.musique || !Array.isArray(d.musique.pistes)) throw new Error();
    } catch (e) {
      return alert(`« ${fichier.name} » n'est pas une musique BlocStudio lisible.`);
    }
    const s = ajouterSon(String(d.nom || fichier.name.replace(/\.[^.]+$/, '')),
      StudioMusique.enWav(StudioMusique.rendre(d.musique)), 'importé');
    s.musique = d.musique;
    planifierSauvegarde();
    if ($('vue-sommaire').classList.contains('actif')) afficherSommaire();
    if (typeof surAjout === 'function') surAjout(s);
  }

  async function modifierSprite(s) {
    const r = await EditeurSprite.ouvrir(s, { nomsPris: projet.sprites.filter(x => x !== s).map(x => x.nom) });
    if (!r) return;
    Object.assign(s, r);
    // Les contrôles gardent un costume qui existe encore.
    projet.controles.forEach(c => {
      if (c.type === 'sprite' && c.sprite === s.id && c.costume >= s.costumes.length) c.costume = 0;
    });
    apresChangementSprites();
  }

  function renommerSprite(s) {
    const nom = (prompt('Nouveau nom du sprite :', s.nom) || '').trim();
    if (!nom || nom === s.nom) return;
    if (projet.sprites.some(autre => autre.nom === nom)) return alert(`Il y a déjà un sprite nommé « ${nom} ».`);
    s.nom = nom;
    apresChangementSprites();
  }

  function supprimerSprite(s, utilisations) {
    const avertissement = utilisations
      ? `\n\nAttention : il est utilisé ${utilisations} fois (blocs ou contrôles Sprite), qui ne l'afficheront plus.` : '';
    if (!confirm(`Supprimer le sprite « ${s.nom} » ?${avertissement}`)) return;
    projet.sprites = projet.sprites.filter(autre => autre !== s);
    projet.controles.forEach(c => { if (c.type === 'sprite' && c.sprite === s.id) c.sprite = ''; });
    apresChangementSprites();
  }

  // ---------------------------------------------------------------- Sons importés

  const TAILLE_MAX_SON = 1.5 * 1024 * 1024;

  function lireEnDataUrl(fichier) {
    return new Promise((resoudre, rejeter) => {
      const r = new FileReader();
      r.onload = () => resoudre(r.result);
      r.onerror = () => rejeter(r.error);
      r.readAsDataURL(fichier);
    });
  }

  // `surAjout(son)` : appelé avec le son ajouté (par exemple pour le donner à un contrôle Son).
  function importerSon(surAjout) {
    const choix = document.createElement('input');
    choix.type = 'file';
    choix.accept = 'audio/*,.mp3,.wav,.ogg,.m4a,.bmusique';
    choix.addEventListener('change', async () => {
      const fichier = choix.files[0];
      if (!fichier) return;
      if (/\.bmusique$/i.test(fichier.name)) return importerFichierMusique(fichier, surAjout);
      if (fichier.size > TAILLE_MAX_SON) {
        alert(`Ce son est trop lourd (${(fichier.size / 1048576).toFixed(1)} Mo, maximum 1,5 Mo).\n\n` +
          'Choisissez un son plus court, ou réduisez-le avec un logiciel comme Audacity.');
        return;
      }
      let donnees;
      try {
        donnees = await lireEnDataUrl(fichier);
        await BlocRuntime.decoderSon(donnees);
      } catch (e) {
        alert(`« ${fichier.name} » n'est pas un son lisible. Essayez un fichier MP3 ou WAV.`);
        return;
      }
      const s = ajouterSon(fichier.name.replace(/\.[^.]+$/, ''), donnees, 'importé');
      if (typeof surAjout === 'function') surAjout(s);
    });
    choix.click();
  }

  function nomSonLibre(base) {
    base = base.trim() || 'son';
    let nom = base;
    for (let i = 2; projet.sons.some(s => s.nom === nom); i++) nom = `${base} ${i}`;
    return nom;
  }

  function ajouterSon(base, donnees, comment) {
    const nom = nomSonLibre(base);
    const son = { id: 'son_' + nouvelId(), nom, donnees };
    projet.sons.push(son);
    planifierSauvegarde();
    blocsAPerimes = true;
    if ($('vue-sommaire').classList.contains('actif')) afficherSommaire();
    $('astuce').textContent = `🎵 Son « ${nom} » ${comment} : choisissez-le dans un bloc « jouer le son » (catégorie Sons et temps).`;
    return son;
  }

  // ---- Musiques 8 bits (js/studio-musique.js) ----
  // La partition reste dans le son (`musique`) pour pouvoir la retoucher ;
  // `donnees` contient sa version WAV, jouée comme n'importe quel son.
  function composerMusique(surAjout) {
    StudioMusique.ouvrir({ nom: nomSonLibre('musique') }, r => {
      const s = ajouterSon(r.nom, r.donnees, 'composé');
      s.musique = r.musique;
      planifierSauvegarde();
      if ($('vue-sommaire').classList.contains('actif')) afficherSommaire(); // pour le bouton « Modifier »
      if (typeof surAjout === 'function') surAjout(s);
    });
  }

  function modifierMusique(s) {
    StudioMusique.ouvrir({ nom: s.nom, musique: s.musique, modification: true }, r => {
      s.musique = r.musique;
      s.donnees = r.donnees;
      delete s.debut; // l'ancien découpage ne correspond plus
      delete s.fin;
      planifierSauvegarde();
      if ($('vue-sommaire').classList.contains('actif')) afficherSommaire();
      afficherProprietes();
      $('astuce').textContent = `🎹 Musique « ${s.nom} » mise à jour.`;
    });
  }

  // ---- Enregistrement au micro ----
  // Le son enregistré est nettoyé (silences du début et de la fin retirés, volume
  // ajusté), puis rangé en WAV mono 22 kHz : ≈ 44 Ko par seconde.
  const DUREE_MAX_MICRO = 20;
  const micro = { flux: null, enregistreur: null, morceaux: [], contexte: null, animation: 0, debut: 0, donnees: null };

  function ouvrirMicro(surAjout) {
    micro.surAjout = typeof surAjout === 'function' ? surAjout : null;
    micro.donnees = null;
    $('micro-resultat').hidden = true;
    $('btn-micro-garder').disabled = true;
    $('micro-consigne').textContent = 'Cliquez sur le bouton rouge, parlez, chantez ou faites un bruit, puis cliquez à nouveau pour arrêter.';
    $('micro-temps').textContent = DUREE_MAX_MICRO + ' secondes maximum';
    $('micro').hidden = false;
  }

  function fermerMicro() {
    arreterMicro(false);
    arreterEcoute();
    $('micro').hidden = true;
  }

  async function demarrerEnregistrement() {
    arreterEcoute();
    try {
      micro.flux = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true } });
    } catch (e) {
      $('micro-consigne').textContent = e.name === 'NotFoundError'
        ? '⚠️ Aucun micro n\'a été trouvé. Branchez-en un (ou un casque avec micro), puis réessayez.'
        : '⚠️ BlocStudio n\'a pas pu utiliser le micro. Vérifiez dans les paramètres de Windows (Confidentialité → Microphone) qu\'il est autorisé.';
      return;
    }
    micro.morceaux = [];
    micro.enregistreur = new MediaRecorder(micro.flux);
    micro.enregistreur.ondataavailable = e => { if (e.data.size) micro.morceaux.push(e.data); };
    micro.enregistreur.onstop = () => traiterEnregistrement(new Blob(micro.morceaux, { type: micro.enregistreur.mimeType }));
    micro.enregistreur.start();
    micro.debut = performance.now();

    // Indicateur de niveau et minuterie.
    micro.contexte = new AudioContext();
    const analyse = micro.contexte.createAnalyser();
    analyse.fftSize = 1024;
    micro.contexte.createMediaStreamSource(micro.flux).connect(analyse);
    const echantillons = new Float32Array(analyse.fftSize);
    const suivre = () => {
      analyse.getFloatTimeDomainData(echantillons);
      let pic = 0;
      for (const v of echantillons) pic = Math.max(pic, Math.abs(v));
      $('micro-niveau').style.width = Math.min(100, Math.sqrt(pic) * 110) + '%';
      const ecoule = (performance.now() - micro.debut) / 1000;
      $('micro-temps').textContent = `🔴 ${ecoule.toFixed(1).replace('.', ',')} s / ${DUREE_MAX_MICRO} s maximum`;
      if (ecoule >= DUREE_MAX_MICRO) return arreterMicro(true);
      micro.animation = requestAnimationFrame(suivre);
    };
    suivre();

    $('btn-micro-enreg').classList.add('en-cours');
    $('btn-micro-enreg').title = 'Arrêter';
    $('micro-resultat').hidden = true;
    $('btn-micro-garder').disabled = true;
    $('micro-consigne').textContent = 'J\'écoute… Cliquez sur le bouton pour arrêter.';
  }

  // garder : false pour abandonner l'enregistrement en cours (fenêtre fermée).
  function arreterMicro(garder) {
    cancelAnimationFrame(micro.animation);
    if (micro.enregistreur && micro.enregistreur.state === 'recording') {
      if (!garder) micro.enregistreur.onstop = null;
      micro.enregistreur.stop();
    }
    if (micro.flux) micro.flux.getTracks().forEach(t => t.stop()); // éteint le voyant du micro
    if (micro.contexte) micro.contexte.close();
    micro.flux = micro.contexte = null;
    $('micro-niveau').style.width = '0';
    $('btn-micro-enreg').classList.remove('en-cours');
    $('btn-micro-enreg').title = 'Enregistrer';
  }

  async function traiterEnregistrement(blob) {
    $('micro-consigne').textContent = 'Préparation du son…';
    try {
      const decodeur = new AudioContext();
      let tampon;
      try { tampon = await decodeur.decodeAudioData(await blob.arrayBuffer()); } finally { decodeur.close(); }
      const donnees = await nettoyerSon(tampon);
      if (!donnees) {
        $('micro-consigne').textContent = '🤫 Je n\'ai rien entendu. Parlez plus près du micro, puis réessayez.';
        $('micro-temps').textContent = DUREE_MAX_MICRO + ' secondes maximum';
        return;
      }
      micro.donnees = donnees.url;
      $('micro-consigne').textContent = 'Voilà ! Écoutez le résultat. S\'il ne vous plaît pas, cliquez à nouveau sur le bouton rouge pour recommencer.';
      $('micro-temps').textContent = `Durée : ${donnees.duree.toFixed(1).replace('.', ',')} s`;
      $('micro-nom').value = nomSonLibre('enregistrement');
      $('micro-resultat').hidden = false;
      $('btn-micro-garder').disabled = false;
      $('micro-nom').select();
    } catch (e) {
      $('micro-consigne').textContent = '⚠️ L\'enregistrement n\'a pas pu être lu. Réessayez.';
    }
  }

  // Mono 22 050 Hz, silences du début et de la fin retirés, volume remonté si trop faible.
  // Renvoie null si l'enregistrement ne contient que du silence.
  async function nettoyerSon(tampon) {
    const FREQ = 22050;
    const hors = new OfflineAudioContext(1, Math.max(1, Math.ceil(tampon.duration * FREQ)), FREQ);
    const source = hors.createBufferSource();
    source.buffer = tampon;
    source.connect(hors.destination);
    source.start();
    const ech = (await hors.startRendering()).getChannelData(0);

    let pic = 0;
    for (const v of ech) pic = Math.max(pic, Math.abs(v));
    if (pic < 0.02) return null;
    const seuil = Math.max(0.015, pic * 0.06);
    let debut = 0, fin = ech.length - 1;
    while (debut < fin && Math.abs(ech[debut]) < seuil) debut++;
    while (fin > debut && Math.abs(ech[fin]) < seuil) fin--;
    const marge = Math.round(FREQ * 0.08);
    debut = Math.max(0, debut - marge);
    fin = Math.min(ech.length - 1, fin + marge * 2);

    const gain = Math.min(4, 0.9 / pic);
    const n = fin - debut + 1;
    const fondu = Math.min(Math.round(FREQ * 0.01), n >> 2); // évite les « clics » aux extrémités
    const octets = new DataView(new ArrayBuffer(44 + n * 2));
    const texte = (pos, t) => [...t].forEach((c, i) => octets.setUint8(pos + i, c.charCodeAt(0)));
    texte(0, 'RIFF'); octets.setUint32(4, 36 + n * 2, true); texte(8, 'WAVEfmt ');
    octets.setUint32(16, 16, true); octets.setUint16(20, 1, true); octets.setUint16(22, 1, true);
    octets.setUint32(24, FREQ, true); octets.setUint32(28, FREQ * 2, true);
    octets.setUint16(32, 2, true); octets.setUint16(34, 16, true);
    texte(36, 'data'); octets.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) {
      const enveloppe = Math.min(1, i / fondu, (n - 1 - i) / fondu);
      const v = Math.max(-1, Math.min(1, ech[debut + i] * gain * enveloppe));
      octets.setInt16(44 + i * 2, v * 32767, true);
    }
    return { url: 'data:audio/wav;base64,' + enBase64(new Uint8Array(octets.buffer)), duree: n / FREQ };
  }

  // Écoute dans l'éditeur : une seule à la fois, limitée à la partie choisie du son.
  let lectureEnCours = null;

  function arreterEcoute() {
    const lecture = lectureEnCours;
    if (!lecture) return;
    lectureEnCours = null;
    try { lecture.source.stop(); } catch (e) { /* déjà fini */ }
    finEcoute(lecture);
  }

  // `bouton` (facultatif) : le bouton « ▶ … » qui a lancé l'écoute ; il devient « ■ … »
  // pendant la lecture, et un nouveau clic l'arrête.
  function jouerExtrait(tampon, debut, fin, bouton, son) {
    arreterEcoute();
    const ctx = BlocRuntime.contexteAudio();
    const source = ctx.createBufferSource();
    source.buffer = tampon;
    source.connect(ctx.destination);
    const lecture = { source, depart: ctx.currentTime, debut, fin, son };
    source.onended = () => {
      if (lectureEnCours !== lecture) return;
      lectureEnCours = null;
      finEcoute(lecture);
    };
    source.start(0, debut, fin - debut);
    lectureEnCours = lecture;
    if (bouton) suivreEcoute(bouton, son);
  }

  // Le bouton affiche « ■ » tant que ce son s'écoute (même après un réaffichage du panneau).
  function suivreEcoute(bouton, son) {
    const lecture = lectureEnCours;
    if (!lecture || !son || lecture.son !== son) return;
    lecture.bouton = bouton;
    lecture.texte = bouton.textContent;
    bouton.textContent = lecture.texte === '▶ Écouter' ? '■ Arrêter' : lecture.texte.replace('▶', '■');
    bouton.title = 'Arrêter l\'écoute';
  }

  function finEcoute(lecture) {
    if (!lecture.bouton) return;
    lecture.bouton.textContent = lecture.texte;
    lecture.bouton.title = '';
  }

  async function ecouterSon(s, bouton) {
    if (bouton && lectureEnCours && lectureEnCours.son === s) return arreterEcoute();
    try {
      const tampon = await BlocRuntime.decoderSon(s.donnees);
      const [debut, fin] = BlocRuntime.extraitSon(s, tampon);
      jouerExtrait(tampon, debut, fin, bouton, s);
    } catch (e) {
      alert(`Le son « ${s.nom} » n'a pas pu être lu.`);
    }
  }

  // ---- Découpage : début et fin de la partie à jouer ----
  // Rien n'est effacé : le son garde son fichier d'origine et retient seulement
  // `debut` et `fin` (en secondes), que le moteur respecte en le jouant.
  const DUREE_MIN_EXTRAIT = 0.05;
  const MARGE_ONDE = 12;
  const decoupe = { son: null, tampon: null, debut: 0, fin: 0, pics: null, glisse: null, animation: 0 };

  async function ouvrirDecoupe(s) {
    let tampon;
    try { tampon = await BlocRuntime.decoderSon(s.donnees); } catch (e) {
      return alert(`Le son « ${s.nom} » n'a pas pu être lu.`);
    }
    Object.assign(decoupe, { son: s, tampon, glisse: null });
    [decoupe.debut, decoupe.fin] = BlocRuntime.extraitSon(s, tampon);
    $('decoupe-titre').textContent = `✂️ Découper « ${s.nom} »`;
    $('decoupe').hidden = false;

    // Dessin net sur les écrans à haute résolution.
    const toile = $('decoupe-onde');
    const ratio = window.devicePixelRatio || 1;
    toile.width = Math.round(toile.clientWidth * ratio);
    toile.height = Math.round(toile.clientHeight * ratio);
    decoupe.pics = calculerPics(tampon, toile.clientWidth - 2 * MARGE_ONDE);
    dessinerDecoupe();
  }

  function fermerDecoupe() {
    arreterEcoute();
    cancelAnimationFrame(decoupe.animation);
    $('decoupe').hidden = true;
  }

  // Volume maximal de chaque colonne de pixels (tous canaux confondus), ramené entre 0 et 1.
  function calculerPics(tampon, colonnes) {
    const pics = new Float32Array(colonnes);
    const n = tampon.length;
    for (let c = 0; c < tampon.numberOfChannels; c++) {
      const d = tampon.getChannelData(c);
      for (let x = 0; x < colonnes; x++) {
        const fin = Math.floor((x + 1) * n / colonnes);
        let m = pics[x];
        for (let i = Math.floor(x * n / colonnes); i < fin; i++) {
          const v = d[i] < 0 ? -d[i] : d[i];
          if (v > m) m = v;
        }
        pics[x] = m;
      }
    }
    let max = 0.01;
    for (const p of pics) if (p > max) max = p;
    return pics.map(p => p / max);
  }

  // Début et fin du son sans ses silences (même règle que pour les enregistrements au micro).
  function bornesSansBlancs(tampon) {
    let pic = 0;
    for (let c = 0; c < tampon.numberOfChannels; c++) {
      for (const v of tampon.getChannelData(c)) if (Math.abs(v) > pic) pic = Math.abs(v);
    }
    const seuil = Math.max(0.01, pic * 0.06);
    let debut = tampon.length, fin = 0;
    for (let c = 0; c < tampon.numberOfChannels; c++) {
      const d = tampon.getChannelData(c);
      let i = 0;
      while (i < d.length && Math.abs(d[i]) < seuil) i++;
      debut = Math.min(debut, i);
      let j = d.length - 1;
      while (j > 0 && Math.abs(d[j]) < seuil) j--;
      fin = Math.max(fin, j);
    }
    if (fin <= debut) return [0, tampon.duration];
    const f = tampon.sampleRate;
    return [Math.max(0, debut / f - 0.05), Math.min(tampon.duration, fin / f + 0.1)];
  }

  const enX = t => MARGE_ONDE + t / decoupe.tampon.duration * ($('decoupe-onde').clientWidth - 2 * MARGE_ONDE);
  const enTemps = x => Math.min(decoupe.tampon.duration, Math.max(0,
    (x - MARGE_ONDE) / ($('decoupe-onde').clientWidth - 2 * MARGE_ONDE) * decoupe.tampon.duration));
  const secondes = t => t.toFixed(2).replace('.', ',') + ' s';

  function dessinerDecoupe() {
    const toile = $('decoupe-onde');
    const g = toile.getContext('2d');
    const L = toile.clientWidth, H = toile.clientHeight;
    const ratio = toile.width / L;
    g.setTransform(ratio, 0, 0, ratio, 0, 0);
    g.clearRect(0, 0, L, H);
    const xDebut = enX(decoupe.debut), xFin = enX(decoupe.fin);
    const milieu = (H - 18) / 2;

    // Partie gardée
    g.fillStyle = '#fdf2f8';
    g.fillRect(xDebut, 0, xFin - xDebut, H - 18);

    // Forme du son : rose dans la partie gardée, grise ailleurs.
    decoupe.pics.forEach((p, i) => {
      const x = MARGE_ONDE + i;
      const h = Math.max(1, p * (milieu - 6));
      g.fillStyle = x >= xDebut && x <= xFin ? '#db2777' : '#cbd2e1';
      g.fillRect(x, milieu - h, 1, h * 2);
    });

    // Graduations en secondes
    const duree = decoupe.tampon.duration;
    const pas = [0.1, 0.25, 0.5, 1, 2, 5, 10, 30, 60].find(p => enX(p) - enX(0) >= 55) || 60;
    g.fillStyle = '#8a93a8';
    g.font = '11px "Segoe UI", sans-serif';
    g.textAlign = 'center';
    for (let t = 0; t <= duree + 1e-6; t += pas) {
      const x = enX(t);
      g.fillRect(x, H - 18, 1, 4);
      g.fillText(String(Math.round(t * 100) / 100).replace('.', ',') + ' s', Math.min(L - 14, Math.max(14, x)), H - 3);
    }

    // Poignées
    for (const x of [xDebut, xFin]) {
      g.fillStyle = '#be185d';
      g.fillRect(x - 1, 0, 2, H - 18);
      g.beginPath();
      g.moveTo(x, 2); g.lineTo(x + 7, 10); g.lineTo(x, 18); g.lineTo(x - 7, 10);
      g.closePath();
      g.fill();
    }

    // Tête de lecture
    if (lectureEnCours) {
      const ctx = BlocRuntime.contexteAudio();
      const t = lectureEnCours.debut + (ctx.currentTime - lectureEnCours.depart);
      if (t <= lectureEnCours.fin) {
        g.fillStyle = '#16a34a';
        g.fillRect(enX(t) - 1, 0, 2, H - 18);
      }
    }

    $('decoupe-infos').innerHTML = '';
    for (const [libelle, valeur] of [['Début', decoupe.debut], ['Fin', decoupe.fin], ['Durée', decoupe.fin - decoupe.debut]]) {
      const span = el('span', null, libelle + ' : ');
      span.appendChild(el('b', null, secondes(valeur)));
      $('decoupe-infos').appendChild(span);
    }
    $('decoupe-infos').appendChild(el('span', 'muet', `(son complet : ${secondes(duree)})`));
    $('btn-decoupe-ecouter').textContent = lectureEnCours ? '■ Arrêter' : '▶ Écouter';
  }

  function animerDecoupe() {
    cancelAnimationFrame(decoupe.animation);
    const image = () => {
      dessinerDecoupe();
      if (lectureEnCours && !$('decoupe').hidden) decoupe.animation = requestAnimationFrame(image);
    };
    image();
  }

  function brancherDecoupe() {
    const toile = $('decoupe-onde');
    const position = e => enTemps(e.clientX - toile.getBoundingClientRect().left);
    const deplacer = t => {
      if (decoupe.glisse === 'debut') decoupe.debut = Math.min(t, decoupe.fin - DUREE_MIN_EXTRAIT);
      else decoupe.fin = Math.max(t, decoupe.debut + DUREE_MIN_EXTRAIT);
      decoupe.debut = Math.max(0, decoupe.debut);
      decoupe.fin = Math.min(decoupe.tampon.duration, decoupe.fin);
      dessinerDecoupe();
    };
    toile.addEventListener('pointerdown', e => {
      const t = position(e);
      arreterEcoute();
      decoupe.glisse = Math.abs(t - decoupe.debut) <= Math.abs(t - decoupe.fin) ? 'debut' : 'fin';
      try { toile.setPointerCapture(e.pointerId); } catch (err) { /* pointeur déjà relâché */ }
      deplacer(t);
    });
    toile.addEventListener('pointermove', e => { if (decoupe.glisse) deplacer(position(e)); });
    const lacher = () => { decoupe.glisse = null; };
    toile.addEventListener('pointerup', lacher);
    toile.addEventListener('pointercancel', lacher);

    $('btn-decoupe-ecouter').addEventListener('click', () => {
      if (lectureEnCours) { arreterEcoute(); dessinerDecoupe(); return; }
      jouerExtrait(decoupe.tampon, decoupe.debut, decoupe.fin);
      animerDecoupe();
    });
    $('btn-decoupe-blancs').addEventListener('click', () => {
      [decoupe.debut, decoupe.fin] = bornesSansBlancs(decoupe.tampon);
      dessinerDecoupe();
    });
    $('btn-decoupe-tout').addEventListener('click', () => {
      decoupe.debut = 0;
      decoupe.fin = decoupe.tampon.duration;
      dessinerDecoupe();
    });
    $('btn-decoupe-annuler').addEventListener('click', fermerDecoupe);
    $('btn-decoupe-valider').addEventListener('click', () => {
      const s = decoupe.son;
      const entier = decoupe.debut < 0.005 && decoupe.fin > decoupe.tampon.duration - 0.005;
      if (entier) { delete s.debut; delete s.fin; } else {
        s.debut = Math.round(decoupe.debut * 1000) / 1000;
        s.fin = Math.round(decoupe.fin * 1000) / 1000;
      }
      fermerDecoupe();
      planifierSauvegarde();
      afficherSommaire();
    });
  }

  function renommerSon(s) {
    const nom = (prompt('Nouveau nom du son :', s.nom) || '').trim();
    if (!nom || nom === s.nom) return;
    if (projet.sons.some(autre => autre.nom === nom)) return alert(`Il y a déjà un son nommé « ${nom} ».`);
    s.nom = nom;
    blocsAPerimes = true;
    planifierSauvegarde();
    afficherSommaire();
  }

  function supprimerSon(s, utilisations) {
    const avertissement = utilisations
      ? `\n\nAttention : il est utilisé ${utilisations} fois (blocs ou contrôles Son), qui ne le joueront plus.` : '';
    if (!confirm(`Supprimer le son « ${s.nom} » ?${avertissement}`)) return;
    projet.sons = projet.sons.filter(autre => autre !== s);
    projet.controles.forEach(c => { if (c.type === 'son' && c.son === s.id) c.son = ''; });
    afficherInvisibles();
    blocsAPerimes = true;
    planifierSauvegarde();
    afficherSommaire();
  }

  // ---------------------------------------------------------------- Vues

  function afficherVue(id) {
    fermerMenuContextuel();
    if (id !== 'vue-code') fermerReperes();
    document.querySelectorAll('.onglet').forEach(o => o.classList.toggle('actif', o.dataset.vue === id));
    document.querySelectorAll('.vue').forEach(v => v.classList.toggle('actif', v.id === id));
    if (id === 'vue-code') {
      if (blocsAPerimes) rechargerBlocs();
      majBoite();
      window.BlocStudioVerifier(workspace);
      Blockly.svgResize(workspace);
      $('astuce').textContent = 'Glissez des blocs depuis les catégories à gauche, puis emboîtez-les sous un bloc « quand… ».';
    } else if (id === 'vue-sommaire') {
      afficherSommaire();
      $('astuce').textContent = 'Cliquez sur un élément pour le retrouver dans la fenêtre ou dans le code.';
    } else {
      $('astuce').textContent = 'Placez vos contrôles, puis double-cliquez sur l\'un d\'eux pour écrire son code.';
    }
  }

  // ---------------------------------------------------------------- Sommaire

  const ICONES_TYPES = {
    bouton: '🔘', etiquette: '🔤', zonetexte: '✏️', casecocher: '☑️', boutonradio: '◉',
    selecteurnombre: '🔢', image: '🖼️', listederoulante: '📋', zoneliste: '📃', cadre: '🔲', panneau: '📜',
    curseur: '🎚️', barreprogression: '📊', zonedessin: '🎨', tableau: '🗂️', date: '📅',
    selecteurcouleur: '🌈', navigateur: '🌐', interrupteur: '🔛', lien: '🔗', video: '🎬', camera: '📷', arborescence: '🌳', barreetat: '▂', barreoutils: '🛠️', menucontextuel: '🖱️', heure: '🕒', forme: '🔷', graphique: '📈', onglets: '📑', son: '🔊', minuteur: '⏱️', basedonnees: '🗃️', fichier: '📁', sprite: '🎭'
  };

  const EVENEMENTS = { bs_quand_clic: 'clic', bs_quand_change: 'change', bs_quand_glisse: 'glisser',
    bs_quand_son_fin: 'se termine', bs_quand_minuteur: 'sonne', bs_quand_fichier_depose: 'fichier déposé', bs_quand_camera_mouvement: 'voit bouger', bs_quand_souris_ctrl: 'souris', bs_quand_clone: 'cloné' };

  // Libellé court d'un événement de contrôle, pour le Sommaire.
  const libelleEvenement = b => b.type === 'bs_quand_souris_ctrl'
    ? { dblclic: 'double-clic', appui: 'bouton appuyé', relache: 'bouton relâché', entre: 'souris dessus', sort: 'souris partie' }[b.getFieldValue('QUOI')]
    : EVENEMENTS[b.type];

  function nomControle(id) {
    return projet.controles.find(c => c.id === id)?.nom ?? '?';
  }

  // Décrit en français le « bloc chapeau » où se trouve un bloc.
  function decrireRacine(bloc) {
    const r = bloc.getRootBlock();
    const ctrl = () => nomControle(r.getFieldValue('CTRL'));
    switch (r.type) {
      case 'bs_quand_demarre': return 'quand la fenêtre démarre';
      case 'bs_quand_clic': return `quand ${ctrl()} est cliqué`;
      case 'bs_quand_change': return `quand ${ctrl()} ${projet.controles.find(x => x.id === r.getFieldValue('CTRL'))?.type === 'panneau' ? 'défile' : 'change'}`;
      case 'bs_quand_glisse': return `quand on glisse dans ${ctrl()}`;
      case 'bs_quand_son_fin': return `quand ${ctrl()} se termine`;
      case 'bs_quand_minuteur': return `quand ${ctrl()} sonne`;
      case 'bs_quand_fichier_depose': return `quand on dépose un fichier (${ctrl()})`;
      case 'bs_quand_camera_mouvement': return `quand ${ctrl()} voit bouger`;
      case 'bs_quand_clone': return `quand un clone de ${ctrl()} est créé`;
      case 'bs_quand_fenetre': return `quand la fenêtre ${nomFenetre(r.getFieldValue('FENETRE'))} ${r.getField('QUOI').getText()}`;
      case 'bs_quand_fenetre_taille': return `quand la fenêtre ${nomFenetre(r.getFieldValue('FENETRE'))} change de taille`;
      case 'bs_quand_souris_ctrl': return `quand on ${r.getField('QUOI').getText()} ${ctrl()}`;
      case 'bs_quand_souris_fenetre': return `quand la souris ${r.getField('QUOI').getText()} dans la fenêtre`;
      case 'bs_quand_touche': return `quand la touche ${r.getField('TOUCHE').getText()} est appuyée`;
      case 'bs_toutes_les': return 'toutes les … secondes';
      case 'bs_quand_menu': return `quand on choisit le menu ${r.getFieldValue('MENU')}`;
      case 'bs_quand_menu_contextuel': return `quand on choisit ${r.getFieldValue('ITEM')} dans ${ctrl()}`;
      case 'bs_quand_outil': return `quand on clique sur ${r.getFieldValue('ITEM')} dans ${ctrl()}`;
      case 'bs_quand_message': return `quand je reçois ${r.getFieldValue('MSG')}`;
      case 'procedures_defnoreturn':
      case 'procedures_defreturn': return `fonction ${r.getFieldValue('NAME')}`;
      default: return 'blocs non reliés (inactifs)';
    }
  }

  // ---- Boîte à outils : une catégorie par fenêtre et par contrôle ----
  // On la reconstruit quand ce qu'elle montre a changé (contrôle ajouté, renommé, supprimé, fenêtre, menus…).
  let empreinteBoite = '';
  function empreinteDuProjet() {
    return JSON.stringify([projet.fenetre.menus, projet.fenetres.map(f => [f.id, f.nom, f.titre]),
      projet.controles.map(c => [c.id, c.nom, c.type, c.fenetre, c.groupe, c.champs, c.menu, c.boutons])]);
  }
  function majBoite() {
    const e = empreinteDuProjet();
    if (e === empreinteBoite) return;
    empreinteBoite = e;
    workspace.getToolbox().clearSelection();
    workspace.updateToolbox(window.BlocStudioBoite(ICONES_TYPES));
  }

  // Ouvre la catégorie d'un contrôle dans la boîte à outils (et la fenêtre qui la contient).
  function montrerBlocsDe(c) {
    afficherVue('vue-code');
    const boite = workspace.getToolbox();
    const item = boite.getToolboxItemById('ctrl-' + c.id);
    if (!item) return;
    const parent = item.getParent && item.getParent();
    if (parent && parent.setExpanded) parent.setExpanded(true);
    boite.setSelectedItem(item);
  }

  // ---- « Voir les blocs qui l'utilisent » ----
  // Tous les blocs qui désignent ce contrôle (dans n'importe quelle liste de contrôles du bloc).
  const CHAMPS_CONTROLE = ['CTRL', 'CTRL2', 'TAB', 'CIBLE'];
  function blocsDuControle(id) {
    return workspace.getAllBlocks(true).filter(b => CHAMPS_CONTROLE.some(n => b.getField(n) && b.getFieldValue(n) === id));
  }

  // Les blocs trouvés sont surlignés ; une petite barre passe d'un endroit (bloc « quand… ») à l'autre.
  const reperes = { blocs: [], racines: [], index: 0 };
  function voirBlocsDuControle(c) {
    afficherVue('vue-code'); // d'abord : elle peut recréer les blocs
    fermerReperes();
    reperes.blocs = blocsDuControle(c.id);
    reperes.racines = [...new Set(reperes.blocs.map(b => b.getRootBlock()))];
    if (!reperes.racines.length) return;
    reperes.blocs.forEach(b => marquerRepere(b, true));
    const barre = el('div', 'barre-reperes');
    barre.id = 'barre-reperes';
    const texte = el('span');
    const bouton = (t, titre, action) => {
      const b = el('button', null, t);
      b.title = titre;
      b.addEventListener('click', action);
      barre.appendChild(b);
    };
    barre.appendChild(el('span', 'barre-reperes-nom', `🔎 ${ICONES_TYPES[c.type] || ''} ${c.nom}`));
    bouton('◀', 'Endroit précédent', () => allerAuRepere(reperes.index - 1));
    barre.appendChild(texte);
    bouton('▶', 'Endroit suivant', () => allerAuRepere(reperes.index + 1));
    bouton('✕', 'Fermer (les blocs ne sont plus surlignés)', fermerReperes);
    reperes.texte = texte;
    $('vue-code').appendChild(barre);
    allerAuRepere(0);
  }

  function allerAuRepere(i) {
    reperes.racines = reperes.racines.filter(r => !r.isDisposed()); // des blocs ont pu être supprimés
    const n = reperes.racines.length;
    if (!n) return fermerReperes();
    reperes.index = (i + n) % n;
    const racine = reperes.racines[reperes.index];
    reperes.texte.textContent = `${decrireRacine(racine)} · ${reperes.index + 1} / ${n}`;
    // Centré ; mais un grand bloc garde son haut visible, sous la barre.
    workspace.centerOnBlock(racine.id);
    const haut = racine.getRelativeToSurfaceXY().y * workspace.scale + workspace.scrollY;
    if (haut < 60) workspace.scroll(workspace.scrollX, workspace.scrollY + 60 - haut);
  }

  // Contour jaune autour du bloc lui-même (pas des blocs qu'il contient).
  function marquerRepere(bloc, oui) {
    const chemin = bloc.pathObject && bloc.pathObject.svgPath;
    if (chemin) chemin.classList.toggle('bloc-repere', oui);
  }

  function fermerReperes() {
    for (const b of reperes.blocs) if (!b.isDisposed()) marquerRepere(b, false);
    reperes.blocs = [];
    reperes.racines = [];
    $('barre-reperes')?.remove();
  }

  function allerAuBloc(bloc) {
    afficherVue('vue-code');
    workspace.centerOnBlock(bloc.id);
    Blockly.common.setSelected(bloc);
  }

  function allerAuControle(id) {
    afficherVue('vue-fenetre');
    const c = projet.controles.find(x => x.id === id);
    if (c && (c.fenetre || '') !== fenetreActive) changerFenetre(c.fenetre || '');
    selectionner(id);
  }

  const nomFenetre = id => id === '' ? 'principale' : projet.fenetres.find(f => f.id === id)?.nom ?? '?';

  function el(tag, classe, texte) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texte !== undefined) e.textContent = texte;
    return e;
  }

  function puce(texte, surClic, classe) {
    const b = el('button', 'puce' + (classe ? ' ' + classe : ''), texte);
    b.addEventListener('click', surClic);
    return b;
  }

  // Une puce par « endroit » (bloc chapeau) où apparaissent les blocs donnés.
  function pucesEndroits(blocs) {
    const parRacine = new Map();
    for (const b of blocs) {
      const r = b.getRootBlock();
      if (!parRacine.has(r)) parRacine.set(r, b);
    }
    const cellule = el('td');
    if (!parRacine.size) cellule.appendChild(el('span', 'muet', '—'));
    for (const [, b] of parRacine) cellule.appendChild(puce(decrireRacine(b), () => allerAuBloc(b)));
    return cellule;
  }

  function sectionSommaire(parent, titre, compte, entetes, vide) {
    const s = el('section', 'carte');
    const h = el('h2', null, titre);
    h.appendChild(el('span', 'compte', compte));
    s.appendChild(h);
    parent.appendChild(s);
    if (vide) {
      s.appendChild(el('p', 'vide', vide));
      return null;
    }
    const table = el('table');
    const tr = el('tr');
    entetes.forEach(t => tr.appendChild(el('th', null, t)));
    table.appendChild(el('thead')).appendChild(tr);
    s.appendChild(table);
    return table.appendChild(el('tbody'));
  }

  function afficherSommaire() {
    if (blocsAPerimes) rechargerBlocs();
    const zone = $('sommaire');
    zone.innerHTML = '';
    const blocs = workspace.getAllBlocks(true);

    const intro = el('div', 'sommaire-titre');
    intro.appendChild(el('h1', null, projet.fenetre.titre || 'Mon programme'));
    intro.appendChild(el('p', 'muet',
      `Fenêtre de ${projet.fenetre.largeur} × ${projet.fenetre.hauteur} pixels · ${blocs.length} bloc(s) au total`));
    zone.appendChild(intro);

    // --- Contrôles ---
    const controles = [...projet.controles].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    const corpsCtrl = sectionSommaire(zone, 'Contrôles', controles.length,
      ['Nom', 'Type', 'Événements programmés', 'Utilisé dans'],
      controles.length ? null : 'Aucun contrôle pour l\'instant. Ajoutez-en depuis l\'onglet Fenêtre.');
    for (const c of controles) {
      const tr = el('tr');
      const nom = el('td');
      nom.appendChild(puce(`${ICONES_TYPES[c.type] || ''} ${c.nom}`, () => allerAuControle(c.id), 'puce-nom'));
      tr.appendChild(nom);
      tr.appendChild(el('td', 'muet', NOMS_TYPES[c.type] + (c.fenetre ? ' · 🪟 ' + nomFenetre(c.fenetre) : '')));

      const lies = blocs.filter(b => b.getField('CTRL') && b.getFieldValue('CTRL') === c.id);
      const evts = el('td');
      const chapeaux = lies.filter(b => EVENEMENTS[b.type]);
      if (!chapeaux.length) evts.appendChild(el('span', 'muet', 'aucun'));
      for (const b of chapeaux) evts.appendChild(puce('⚡ ' + libelleEvenement(b), () => allerAuBloc(b), 'puce-evt'));
      tr.appendChild(evts);

      tr.appendChild(pucesEndroits(lies.filter(b => !EVENEMENTS[b.type])));
      corpsCtrl?.appendChild(tr);
    }

    // --- Menus ---
    const chemins = BlocRuntime.cheminsMenus(projet.fenetre.menus);
    if (chemins.length) {
      const corpsMenus = sectionSommaire(zone, 'Menus', chemins.length, ['Menu', 'Événement programmé']);
      for (const chemin of chemins) {
        const tr = el('tr');
        tr.appendChild(el('td')).appendChild(puce('☰ ' + chemin, () => ouvrirEvenementMenu(chemin), 'puce-nom'));
        const evt = blocs.find(b => b.type === 'bs_quand_menu' && b.getFieldValue('MENU') === chemin);
        const td = tr.appendChild(el('td'));
        if (evt) td.appendChild(puce('⚡ choisi', () => allerAuBloc(evt), 'puce-evt'));
        else td.appendChild(el('span', 'muet', 'aucun'));
        corpsMenus.appendChild(tr);
      }
    }

    // --- Autres fenêtres ---
    if (projet.fenetres.length) {
      const corpsFen = sectionSommaire(zone, 'Autres fenêtres', projet.fenetres.length,
        ['Fenêtre', 'Taille', 'Événements programmés', 'Ouverte par']);
      for (const f of projet.fenetres) {
        const tr = el('tr');
        tr.appendChild(el('td')).appendChild(puce('🪟 ' + f.nom, () => { afficherVue('vue-fenetre'); changerFenetre(f.id); }, 'puce-nom'));
        tr.appendChild(el('td', 'muet', `${f.largeur} × ${f.hauteur} · ${projet.controles.filter(c => c.fenetre === f.id).length} contrôle(s)`));
        const evts = tr.appendChild(el('td'));
        const chapeaux = blocs.filter(b => b.type === 'bs_quand_fenetre' && b.getFieldValue('FENETRE') === f.id);
        if (!chapeaux.length) evts.appendChild(el('span', 'muet', 'aucun'));
        for (const b of chapeaux) evts.appendChild(puce('⚡ ' + b.getField('QUOI').getText(), () => allerAuBloc(b), 'puce-evt'));
        tr.appendChild(pucesEndroits(blocs.filter(b => b.type === 'bs_fenetre_ouvrir' && b.getFieldValue('FENETRE') === f.id)));
        corpsFen.appendChild(tr);
      }
    }

    // --- Sprites ---
    const corpsSprites = sectionSommaire(zone, 'Sprites', projet.sprites.length,
      ['Sprite (cliquer pour le modifier)', 'Costumes', 'Utilisé dans', ''],
      projet.sprites.length ? null : 'Aucun sprite pour l\'instant. Dessinez-en un ou importez une image : ce sont les personnages et objets de vos jeux.');
    for (const s of projet.sprites) {
      const usages = blocs.filter(b => b.getField('SPRITE') && b.getFieldValue('SPRITE') === s.id);
      const controles = projet.controles.filter(c => c.type === 'sprite' && c.sprite === s.id);
      const tr = el('tr');
      const nom = puce(' ' + s.nom, () => modifierSprite(s), 'puce-nom');
      nom.prepend(miniatureSprite(s, 'miniature-sprite'));
      tr.appendChild(el('td')).appendChild(nom);
      tr.appendChild(el('td', 'muet', `${s.costumes.length} · ${s.taille} × ${s.taille} px`));
      const endroits = tr.appendChild(pucesEndroits(usages));
      if (controles.length) endroits.querySelector('.muet')?.remove();
      controles.forEach(c => endroits.prepend(puce('🎭 ' + c.nom, () => allerAuControle(c.id))));
      const actions = tr.appendChild(el('td', 'actions-son'));
      actions.appendChild(puce('🎨 Modifier', () => modifierSprite(s)));
      actions.appendChild(puce('💾 Exporter…', e => menuExporterSprite(e, s)));
      actions.appendChild(puce('✏️ Renommer', () => renommerSprite(s)));
      actions.appendChild(puce('🗑️ Supprimer', () => supprimerSprite(s, usages.length + controles.length)));
      corpsSprites.appendChild(tr);
    }
    zone.lastElementChild.appendChild(puce('🎨 Dessiner un sprite…', nouveauSprite, 'puce-importer puce-sprite'));
    zone.lastElementChild.appendChild(puce('📁 Importer une image ou un sprite (.bsprite)…', importerSprite, 'puce-importer puce-sprite'));

    // --- Sons importés ---
    const corpsSons = sectionSommaire(zone, 'Sons', projet.sons.length,
      ['Son (cliquer pour écouter)', 'Taille', 'Utilisé dans', ''],
      projet.sons.length ? null : 'Aucun son pour l\'instant. Importez un fichier (MP3, WAV…) ou enregistrez-vous avec le micro.');
    for (const s of projet.sons) {
      const usages = blocs.filter(b => b.getField('SON') && b.getFieldValue('SON') === s.id);
      const controles = projet.controles.filter(c => c.type === 'son' && c.son === s.id);
      const tr = el('tr');
      const ecoute = tr.appendChild(el('td')).appendChild(puce('▶ ' + s.nom, () => ecouterSon(s, ecoute), 'puce-nom'));
      suivreEcoute(ecoute, s);
      tr.appendChild(el('td', 'muet', `${Math.max(1, Math.round(s.donnees.length * 0.75 / 1024))} Ko` +
        (s.fin > s.debut || s.debut > 0 ? ' · ✂️ découpé' : '') + (s.musique ? ' · 🎹 8 bits' : '')));
      const endroits = tr.appendChild(pucesEndroits(usages));
      if (controles.length) endroits.querySelector('.muet')?.remove();
      controles.forEach(c => endroits.prepend(puce('🔊 ' + c.nom, () => allerAuControle(c.id))));
      const actions = tr.appendChild(el('td', 'actions-son'));
      if (s.musique) actions.appendChild(puce('🎹 Modifier', () => modifierMusique(s)));
      actions.appendChild(puce('✂️ Découper', () => ouvrirDecoupe(s)));
      actions.appendChild(puce('💾 Exporter…', e => menuExporterSon(e, s)));
      actions.appendChild(puce('✏️ Renommer', () => renommerSon(s)));
      actions.appendChild(puce('🗑️ Supprimer', () => supprimerSon(s, usages.length + controles.length)));
      corpsSons.appendChild(tr);
    }
    zone.lastElementChild.appendChild(puce('🎵 Importer un son ou une musique (.bmusique)…', importerSon, 'puce-importer'));
    zone.lastElementChild.appendChild(puce('🎤 Enregistrer avec le micro…', ouvrirMicro, 'puce-importer'));
    zone.lastElementChild.appendChild(puce('🎹 Composer une musique 8 bits…', composerMusique, 'puce-importer'));

    // --- Variables ---
    const variables = workspace.getVariableMap().getAllVariables()
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    const corpsVar = sectionSommaire(zone, 'Variables', variables.length,
      ['Nom', 'Utilisations', 'Utilisée dans'],
      variables.length ? null : 'Aucune variable. Créez-en une dans la catégorie « Variables » de l\'onglet Code.');
    for (const v of variables) {
      const usages = blocs.filter(b => b.getVarModels().some(m => m.getId() === v.getId()));
      const tr = el('tr');
      tr.appendChild(el('td')).appendChild(el('span', 'puce puce-var', v.name));
      tr.appendChild(el('td', usages.length ? null : 'muet',
        usages.length ? `${usages.length} bloc(s)` : 'jamais utilisée'));
      tr.appendChild(pucesEndroits(usages));
      corpsVar?.appendChild(tr);
    }

    // --- Fonctions ---
    const definitions = blocs.filter(b => b.type === 'procedures_defnoreturn' || b.type === 'procedures_defreturn');
    const corpsFn = sectionSommaire(zone, 'Fonctions', definitions.length,
      ['Nom', 'Donne un résultat', 'Appelée dans'],
      definitions.length ? null : 'Aucune fonction. Les fonctions servent à regrouper des blocs que l\'on réutilise (catégorie « Fonctions »).');
    for (const d of definitions) {
      const nom = d.getFieldValue('NAME');
      const appels = blocs.filter(b => (b.type === 'procedures_callnoreturn' || b.type === 'procedures_callreturn') &&
        b.getProcedureCall() === nom);
      const tr = el('tr');
      tr.appendChild(el('td')).appendChild(puce('ƒ ' + nom, () => allerAuBloc(d), 'puce-nom'));
      tr.appendChild(el('td', 'muet', d.type === 'procedures_defreturn' ? 'oui' : 'non'));
      tr.appendChild(pucesEndroits(appels));
      corpsFn?.appendChild(tr);
    }
  }

  // Après un renommage, on recharge les blocs pour que les listes affichent les nouveaux noms.
  function rechargerBlocs() {
    const etat = Blockly.serialization.workspaces.save(workspace);
    const scroll = { x: workspace.scrollX, y: workspace.scrollY };
    Blockly.Events.disable();
    try {
      workspace.clear();
      Blockly.serialization.workspaces.load(etat, workspace);
    } finally {
      Blockly.Events.enable();
    }
    workspace.scroll(scroll.x, scroll.y);
    blocsAPerimes = false;
  }

  // ---------------------------------------------------------------- Code

  // Noms JavaScript des variables du programme, relevés pendant la génération du code.
  let nomsVariables = [];
  {
    const init = gen.init;
    gen.init = function (ws) {
      init.call(this, ws);
      nomsVariables = Blockly.Variables.allUsedVarModels(ws).map(v => [v.name, this.getVariableName(v.getId())]);
    };
  }

  // `avecSuivi` : code pour l'exécution dans l'éditeur, qui signale chaque bloc exécuté
  // (blocs allumés, mode lent, pas à pas, erreurs situées) et laisse lire les variables.
  function genererCode(avecSuivi) {
    if (blocsAPerimes) rechargerBlocs();
    if (!avecSuivi) return gen.workspaceToCode(workspace);
    // Les blocs « quand… » sont au premier niveau du programme, hors des fonctions « async ».
    for (const b of workspace.getTopBlocks(false)) b.suppressPrefixSuffix = true;
    gen.STATEMENT_PREFIX = 'if (app.pas(%1)) await app.attente();\n';
    let code;
    try { code = gen.workspaceToCode(workspace); } finally { gen.STATEMENT_PREFIX = null; }
    const lecture = nomsVariables.map(([nom, js]) => `${JSON.stringify(nom)}: ${js}`).join(', ');
    return code + `\napp.lireVariables = function () { return { ${lecture} }; };\n`;
  }

  function majCodeJs() {
    if ($('panneau-js').hidden) return;
    $('code-js').textContent = genererCode()
      .replace(/\n?if \(\+\+app\.boucles.*\n/g, '\n') || '// Aucun bloc pour l\'instant.';
  }

  // ---------------------------------------------------------------- Exécution

  // Suivi : « normal », « lent » (un bloc toutes les demi-secondes) ou « pas » (un bloc par clic).
  let modeSuivi = 'normal';
  let blocErreur = null;               // bloc où la dernière erreur s'est produite
  const blocsAvertis = new Set();      // blocs marqués d'un ⚠️ par une erreur
  let surligne = null;

  function executer() {
    if (execution) fermerExecution();
    blocsAvertis.forEach(b => { if (!b.isDeadOrDying()) b.setWarningText(null); });
    blocsAvertis.clear();
    window.BlocStudioVerifier(workspace); // l'effacement ci-dessus retire aussi ses avertissements
    const code = genererCode(true);
    $('titre-exec').textContent = projet.fenetre.titre;
    $('erreur-exec').hidden = true;
    $('execution').hidden = false;
    execution = BlocRuntime.lancer(projet, code, $('hote-exec'), signalerErreur, {
      modeSuivi,
      titre: texte => { $('titre-exec').textContent = texte; },
      // Dans BlocStudio.exe, les fichiers du programme passent par la boîte « Enregistrer sous » de Windows.
      enregistrer: hote ? (nom, texte) => telecharger(nom, texte, 'text/plain') : null
    });
    majBarreSuivi();
    requestAnimationFrame(suivreExecution);
  }

  function fermerExecution() {
    if (!execution) return;
    execution.arreter();
    execution = null;
    $('execution').hidden = true;
    coteACote(false);
    $('fenetre-exec').style.translate = '';
    surligner(null);
  }

  // Le bloc en cours d'exécution brille en jaune, comme dans Scratch.
  function surligner(id) {
    const ancien = surligne && workspace.getBlockById(surligne);
    if (ancien) ancien.getSvgRoot().classList.remove('bloc-actif');
    surligne = id;
    const bloc = id && workspace.getBlockById(id);
    if (bloc) bloc.getSvgRoot().classList.add('bloc-actif');
  }

  // L'erreur est rattachée à son bloc : il porte un ⚠️ et le bouton « Voir le bloc » y mène.
  function signalerErreur(msg, idBloc) {
    $('erreur-texte').textContent = '⚠️ ' + msg;
    $('erreur-exec').hidden = false;
    blocErreur = idBloc ? workspace.getBlockById(idBloc) : null;
    $('btn-erreur-bloc').hidden = !blocErreur;
    if (blocErreur) {
      blocErreur.setWarningText(msg);
      blocsAvertis.add(blocErreur);
    }
  }

  function voirBlocErreur() {
    if (!blocErreur || blocErreur.isDeadOrDying()) return;
    coteACote(true);
    montrerBloc(blocErreur, true);
    Blockly.common.setSelected(blocErreur);
  }

  // Fait défiler les blocs pour que celui-ci soit visible, hors de la fenêtre du programme
  // (en mode côte à côte, elle occupe le coin en bas à droite). `toujours` : même s'il est déjà visible.
  function montrerBloc(bloc, toujours) {
    const z = $('blockly').getBoundingClientRect();
    // Sans la liste des catégories, à gauche.
    const zone = { left: z.left + workspace.getMetricsManager().getAbsoluteMetrics().left, right: z.right, top: z.top, bottom: z.bottom };
    const fenetre = $('execution').classList.contains('cote-a-cote') && !$('execution').hidden
      ? $('fenetre-exec').getBoundingClientRect() : null;
    const r = bloc.pathObject.svgPath.getBoundingClientRect(); // le bloc seul, sans ceux qui suivent
    const libre = { gauche: zone.left + 10, droite: (fenetre ? fenetre.left : zone.right) - 10, haut: zone.top + 10, bas: zone.bottom - 10 };
    const visible = r.left >= libre.gauche && r.right <= libre.droite && r.top >= libre.haut && r.bottom <= libre.bas;
    if (visible && !toujours) return;
    // Centré dans la partie libre (à gauche de la fenêtre du programme) ; un bloc trop large
    // pour y tenir est aligné sur la gauche.
    const place = (debut, fin, taille) => taille <= fin - debut ? debut + (fin - debut - taille) / 2 : debut;
    const dx = place(libre.gauche, libre.droite, r.width) - r.left;
    const dy = place(libre.haut, libre.bas, r.height) - r.top;
    workspace.scroll(workspace.scrollX + dx, workspace.scrollY + dy);
  }

  // Côte à côte : le programme reste ouvert dans un coin, les blocs sont visibles derrière.
  function coteACote(oui) {
    $('execution').classList.toggle('cote-a-cote', oui);
    $('btn-cote-a-cote').classList.toggle('actif', oui);
    if (oui) afficherVue('vue-code');
  }

  function changerModeSuivi(mode) {
    modeSuivi = mode;
    if (execution) execution.suivi.mode(mode);
    if (mode !== 'normal') coteACote(true); // pour voir les blocs s'allumer
    majBarreSuivi();
  }

  function majBarreSuivi() {
    document.querySelectorAll('#vitesses-suivi button').forEach(b => b.classList.toggle('actif', b.dataset.mode === modeSuivi));
    $('btn-pas-suivant').hidden = modeSuivi !== 'pas';
  }

  // Pendant l'exécution : allume le bloc en cours, met à jour les variables.
  let derniereMajVariables = 0;
  function suivreExecution(maintenant) {
    if (!execution) return;
    const etat = execution.suivi.etat();
    // En vitesse normale, un bloc reste allumé un court instant après son exécution ;
    // en mode lent, jusqu'au bloc suivant.
    const id = etat.enAttente ||
      (etat.mode === 'lent' || (etat.mode === 'normal' && performance.now() - etat.instant < 250) ? etat.bloc : null);
    if (id !== surligne) {
      surligner(id);
      // Au ralenti, on suit le bloc qui s'exécute s'il sort de l'écran.
      const bloc = id && etat.mode !== 'normal' && $('vue-code').classList.contains('actif') && workspace.getBlockById(id);
      if (bloc) montrerBloc(bloc);
    }
    $('btn-pas-suivant').disabled = !etat.enAttente;
    if (!$('panneau-variables').hidden && maintenant - derniereMajVariables > 200) {
      derniereMajVariables = maintenant;
      afficherVariables(execution.variables());
    }
    requestAnimationFrame(suivreExecution);
  }

  function afficherVariables(valeurs) {
    const table = $('table-variables');
    const lignes = Object.entries(valeurs || {});
    if (!lignes.length) {
      const tr = el('tr');
      tr.appendChild(el('td', 'muet', 'Ce programme n\'a pas de variable.'));
      table.replaceChildren(tr);
      return;
    }
    table.replaceChildren(...lignes.map(([nom, valeur]) => {
      const tr = el('tr');
      tr.appendChild(el('th', null, nom));
      tr.appendChild(el('td', valeur === undefined ? 'muet' : null, valeur === undefined ? '(vide)' : valeur));
      return tr;
    }));
  }

  // La fenêtre du programme se déplace en la tenant par sa barre de titre.
  function brancherFenetreExec() {
    const fenetre = $('fenetre-exec');
    const barre = fenetre.querySelector('.titre-fenetre');
    barre.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      const [dx, dy] = (fenetre.style.translate || '0px 0px').split(' ').map(v => parseFloat(v) || 0);
      const depart = { x: e.clientX - dx, y: e.clientY - dy };
      barre.setPointerCapture(e.pointerId);
      const bouger = ev => { fenetre.style.translate = `${ev.clientX - depart.x}px ${ev.clientY - depart.y}px`; };
      const lacher = () => {
        barre.removeEventListener('pointermove', bouger);
        barre.removeEventListener('pointerup', lacher);
      };
      barre.addEventListener('pointermove', bouger);
      barre.addEventListener('pointerup', lacher);
    });
    document.querySelectorAll('#vitesses-suivi button').forEach(b =>
      b.addEventListener('click', () => changerModeSuivi(b.dataset.mode)));
    $('btn-pas-suivant').addEventListener('click', () => execution && execution.suivi.suivant());
    $('btn-variables').addEventListener('click', () => {
      const p = $('panneau-variables');
      p.hidden = !p.hidden;
      $('btn-variables').classList.toggle('actif', !p.hidden);
      if (!p.hidden && execution) afficherVariables(execution.variables());
    });
    $('btn-cote-a-cote').addEventListener('click', () =>
      coteACote(!$('execution').classList.contains('cote-a-cote')));
    $('btn-erreur-bloc').addEventListener('click', voirBlocErreur);
  }

  // ---------------------------------------------------------------- Fichiers

  // Dans l'application Windows (BlocStudio.exe, voir lanceur/Studio.cs), les fichiers
  // sont enregistrés par Windows plutôt que téléchargés : ils ne sont alors pas
  // marqués « venant d'Internet » (fichiers bloqués, avertissement SmartScreen…).
  const hote = window.chrome && window.chrome.webview;
  const reponsesHote = new Map();
  let numeroDemande = 0;
  if (hote) {
    hote.addEventListener('message', e => {
      const resoudre = reponsesHote.get(e.data && e.data.id);
      if (resoudre) { reponsesHote.delete(e.data.id); resoudre(e.data); }
    });
  }

  function demanderHote(message) {
    return new Promise(resoudre => {
      const id = ++numeroDemande;
      reponsesHote.set(id, resoudre);
      hote.postMessage({ ...message, id });
    });
  }

  function enBase64(octets) {
    let s = '';
    for (let i = 0; i < octets.length; i += 0x8000) s += String.fromCharCode.apply(null, octets.subarray(i, i + 0x8000));
    return btoa(s);
  }

  // Renvoie le chemin choisi (application Windows), '' (navigateur) ou null (annulé).
  async function telecharger(nom, contenu, type) {
    if (hote) {
      const octets = typeof contenu === 'string' ? new TextEncoder().encode(contenu) : contenu;
      const r = await demanderHote({ action: 'enregistrer', nom, donnees: enBase64(octets) });
      if (r.erreur) throw new Error(r.erreur);
      return r.chemin || null;
    }
    const url = URL.createObjectURL(new Blob([contenu], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = nom;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return '';
  }

  function telechargerOuSignaler(nom, contenu, type) {
    return telecharger(nom, contenu, type).catch(e => {
      alert("Impossible d'enregistrer le fichier : " + e.message);
      return null;
    });
  }

  function nomFichier() {
    return (projet.fenetre.titre || 'programme').replace(/[\\/:*?"<>|]+/g, '').trim() || 'programme';
  }

  function enregistrer() {
    telechargerOuSignaler(nomFichier() + '.bstudio', JSON.stringify(etatProjet(), null, 2), 'application/json');
  }

  function ouvrir(fichier) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const p = JSON.parse(r.result);
        if (p.format !== 'BlocStudio') throw new Error();
        chargerProjet(p);
        planifierSauvegarde();
      } catch (e) {
        alert("Ce fichier n'est pas un projet BlocStudio valide.");
      }
    };
    r.readAsText(fichier);
  }

  // Page HTML autonome contenant le programme et son moteur d'exécution.
  // `pourExe` : la page remplit exactement la fenêtre Windows du lanceur.
  function genererPageAutonome(pourExe) {
    const code = genererCode();
    // Seuls les sons réellement utilisés (par les blocs ou par un contrôle Son) sont emportés.
    const sons = projet.sons.filter(s => code.includes(JSON.stringify(s.id)) ||
      projet.controles.some(c => c.type === 'son' && c.son === s.id));
    const sprites = projet.sprites.filter(s => code.includes(JSON.stringify(s.id)) ||
      projet.controles.some(c => c.type === 'sprite' && c.sprite === s.id));
    const donnees = { id: projet.id, fenetre: projet.fenetre, fenetres: projet.fenetres, controles: projet.controles, sons, sprites };
    const json = s => JSON.stringify(s).replace(/</g, '\\u003c');
    const titre = projet.fenetre.titre.replace(/[<&]/g, ch => ch === '<' ? '&lt;' : '&amp;');
    const style = pourExe
      ? `html, body { margin: 0; height: 100%; overflow: hidden; background: ${BlocRuntime.couleur(projet.fenetre.couleurFond || '#f0f0f0')}; }`
      : `html, body { margin: 0; height: 100%; }
  body { display: flex; align-items: center; justify-content: center; background: #dfe3ea; }
  #app { box-shadow: 0 10px 30px rgba(0,0,0,.2); }`;
    return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${titre}</title>
<style>
  ${style}
  #erreur { position: fixed; bottom: 0; left: 0; right: 0; padding: 8px; background: #fef2f2; color: #b91c1c; font: 13px sans-serif; display: none; }
</style>
</head>
<body>
<div id="app"></div>
<div id="erreur"></div>
<script>
// Programme créé avec BlocStudio
${BlocRuntimeFactory.toString()}
const BlocRuntime = BlocRuntimeFactory();
BlocRuntime.lancer(${json(donnees)}, ${json(code)}, document.getElementById('app'), function (msg) {
  const e = document.getElementById('erreur');
  e.textContent = 'Erreur : ' + msg;
  e.style.display = 'block';
}, { remplir: ${!!pourExe} });
</script>
</body>
</html>
`;
  }

  // Page web : il suffit de double-cliquer dessus pour lancer le programme dans le navigateur.
  function exporterHtml() {
    telechargerOuSignaler(nomFichier() + '.html', genererPageAutonome(false), 'text/html');
  }

  // Le lanceur (≈ 1 Mo) n'est chargé qu'au premier export en .exe.
  function chargerLanceur() {
    if (window.BlocStudioLanceur) return Promise.resolve(window.BlocStudioLanceur);
    return new Promise((resoudre, rejeter) => {
      const s = document.createElement('script');
      s.src = 'js/lanceur-data.js';
      s.onload = () => resoudre(window.BlocStudioLanceur);
      s.onerror = () => rejeter(new Error('Fichier js/lanceur-data.js introuvable.'));
      document.head.appendChild(s);
    });
  }

  // Application Windows : le lanceur, suivi du programme et d'une petite « signature ».
  // Format lu par lanceur/Lanceur.cs :
  //   [lanceur.exe][largeur\nhauteur\ntitre\noptions\nhtml en UTF-8][longueur sur 8 octets][« BLOCSTD1 »]
  // options : « redim=1;agrandir=1;agrandie=0;min=300x200 » (fenêtre Windows redimensionnable…).
  async function construireExe() {
    const base64 = await chargerLanceur();
    const binaire = atob(base64);
    const lanceur = new Uint8Array(binaire.length);
    for (let i = 0; i < binaire.length; i++) lanceur[i] = binaire.charCodeAt(i);

    const f = projet.fenetre;
    const titre = (f.titre || 'Mon programme').replace(/[\r\n]+/g, ' ');
    const hauteur = f.hauteur + (BlocRuntime.lireMenus(f.menus).length ? BlocRuntime.HAUTEUR_MENUS : 0);
    const menus = hauteur - f.hauteur;
    const reglages = [`redim=${f.redimensionnable ? 1 : 0}`, `agrandir=${f.agrandir ? 1 : 0}`, `agrandie=${f.agrandie ? 1 : 0}`,
      `min=${Math.round(f.largeurMin ?? 100)}x${Math.round((f.hauteurMin ?? 60) + menus)}`].join(';');
    const programme = new TextEncoder().encode(
      `${Math.round(f.largeur)}\n${Math.round(hauteur)}\n${titre}\n${reglages}\n${genererPageAutonome(true)}`);

    const fin = new Uint8Array(16);
    const vue = new DataView(fin.buffer);
    vue.setUint32(0, programme.length, true); // longueur sur 64 bits, little-endian
    vue.setUint32(4, 0, true);
    fin.set(new TextEncoder().encode('BLOCSTD1'), 8);

    const exe = new Uint8Array(lanceur.length + programme.length + fin.length);
    exe.set(lanceur, 0);
    exe.set(programme, lanceur.length);
    exe.set(fin, lanceur.length + programme.length);
    return exe;
  }

  let cheminExe = '';

  async function exporterExe() {
    try {
      const exe = await construireExe();
      const chemin = await telecharger(nomFichier() + '.exe', exe, 'application/vnd.microsoft.portable-executable');
      if (chemin === null) return; // enregistrement annulé
      cheminExe = chemin;
      $('info-exe-nom').textContent = nomFichier() + '.exe';
      $('info-exe-chemin').textContent = chemin;
      $('info-exe').hidden = false;
    } catch (e) {
      alert("L'export en application Windows a échoué : " + e.message);
    }
  }

  window.BlocStudio.construireExe = construireExe;

  // ---------------------------------------------------------------- Démarrage

  function demarrer() {
    // Blockly doit être injecté dans une zone visible pour bien se dimensionner.
    $('vue-code').classList.add('actif');
    workspace = Blockly.inject('blockly', {
      toolbox: window.BlocStudioBoite(ICONES_TYPES),
      renderer: 'zelos',
      media: 'lib/blockly/media/',
      sounds: false,
      trashcan: true,
      grid: { spacing: 25, length: 3, colour: '#d8dce6', snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.8, maxScale: 2, minScale: 0.4 },
      // Molette : défiler (Maj + molette : de côté) ; Ctrl + molette : zoomer.
      move: { scrollbars: true, drag: true, wheel: true }
    });
    $('vue-code').classList.remove('actif');
    workspace.registerButtonCallback('importerSon', importerSon);
    workspace.registerButtonCallback('enregistrerSon', ouvrirMicro);
    workspace.registerButtonCallback('composerMusique', composerMusique);
    workspace.registerButtonCallback('nouveauSprite', nouveauSprite);
    workspace.registerButtonCallback('importerSprite', importerSprite);
    workspace.registerButtonCallback('nouvelleFenetre', nouvelleFenetre);

    workspace.addChangeListener(Blockly.Events.disableOrphans);
    workspace.addChangeListener(e => {
      if (e.isUiEvent) return;
      if (!groupesInternes.has(e.group)) oublierBlocsHistorique();
      planifierSauvegarde();
      majCodeJs();
    });

    let sauve = null;
    try { sauve = JSON.parse(localStorage.getItem(CLE_STOCKAGE)); } catch (e) { /* rien */ }
    if (sauve && sauve.format === 'BlocStudio') chargerProjet(sauve);
    else chargerExemple(BlocStudioExemples[0]);
    afficherVue('vue-fenetre');
    brancherInterface();
  }

  // ---- Palette : les contrôles rangés par thème, dans l'ordre alphabétique, avec une recherche ----
  const THEMES_PALETTE = [
    ['✏️ Texte', ['etiquette', 'lien', 'motdepasse', 'zonetexte']],
    ['🔘 Boutons et choix', ['bouton', 'boutonradio', 'casecocher', 'curseur', 'interrupteur', 'listederoulante', 'selecteurcouleur',
      'date', 'heure', 'selecteurnombre', 'zoneliste']],
    ['📊 Données', ['arborescence', 'barreprogression', 'basedonnees', 'graphique', 'tableau']],
    ['🖼️ Images et dessin', ['forme', 'image', 'sprite', 'zonedessin']],
    ['🎬 Sons, vidéos et web', ['camera', 'navigateur', 'son', 'video']],
    ['🧱 Mise en page', ['barreetat', 'barreoutils', 'cadre', 'menucontextuel', 'onglets', 'panneau']],
    ['⚙️ Outils', ['fichier', 'minuteur']]
  ];
  // Autres mots qui les font trouver, dont leur nom dans Visual Basic.
  const MOTS_PALETTE = {
    bouton: 'Button', etiquette: 'Label texte', zonetexte: 'TextBox saisie', motdepasse: 'TextBox PasswordChar secret',
    casecocher: 'CheckBox', boutonradio: 'RadioButton option', selecteurnombre: 'NumericUpDown', image: 'PictureBox photo',
    forme: 'Shape Line ligne cercle rectangle triangle ovale', sprite: 'personnage jeu animation costume',
    listederoulante: 'ComboBox', zoneliste: 'ListBox', arborescence: 'TreeView arbre', cadre: 'GroupBox Frame',
    panneau: 'Panel défilement scroll', onglets: 'TabControl pages', curseur: 'TrackBar slider volume',
    barreprogression: 'ProgressBar', zonedessin: 'dessin canvas peinture', tableau: 'DataGridView grille Excel',
    graphique: 'Chart courbe histogramme', date: 'DateTimePicker calendrier', heure: 'DateTimePicker horloge',
    selecteurcouleur: 'ColorDialog', navigateur: 'WebBrowser internet page', interrupteur: 'switch',
    lien: 'LinkLabel internet', video: 'MediaPlayer film', camera: 'webcam photo', barreetat: 'StatusStrip',
    barreoutils: 'ToolStrip', son: 'musique mp3 bruit', minuteur: 'Timer chronomètre', menucontextuel: 'ContextMenuStrip clic droit',
    basedonnees: 'fiches enregistrer', fichier: 'OpenFileDialog SaveFileDialog ouvrir enregistrer'
  };

  function organiserPalette() {
    const palette = document.querySelector('.palette');
    const outils = [...palette.querySelectorAll('.outil')];
    const aide = palette.querySelector('.aide');
    const nomOutil = o => o.lastChild.textContent.trim();
    const recherche = el('input', 'palette-recherche');
    recherche.type = 'search';
    recherche.placeholder = '🔍 Chercher…';
    recherche.title = 'Son nom, à quoi il sert, ou son nom dans Visual Basic (TextBox, Timer…). Entrée : l\'ajouter à la fenêtre.';
    palette.querySelector('h3').after(recherche);
    const rangés = new Set();
    const sections = [];
    // Thèmes repliés (un clic sur leur titre) : BlocStudio s'en souvient d'une fois sur l'autre.
    const CLE_REPLIES = 'blocstudio.palette.replies';
    let replies = new Set();
    try { replies = new Set(JSON.parse(localStorage.getItem(CLE_REPLIES)) || []); } catch (e) { /* rien de mémorisé */ }
    const memoriserReplies = () => { try { localStorage.setItem(CLE_REPLIES, JSON.stringify([...replies])); } catch (e) { /* tant pis */ } };
    for (const [nom, types] of [...THEMES_PALETTE, ['🧩 Autres', null]]) {
      const liste = outils.filter(o => !rangés.has(o) && (!types || types.includes(o.dataset.type)))
        .sort((a, b) => nomOutil(a).localeCompare(nomOutil(b), 'fr', { sensitivity: 'base', ignorePunctuation: true })); // « d'heure » après « de date »
      if (!liste.length) continue;
      const titre = el('h3', 'palette-theme');
      titre.append(el('span', 'palette-fleche'), el('span', null, nom), el('small', 'palette-nombre', `(${liste.length})`));
      titre.tabIndex = 0;
      titre.title = 'Cliquer pour replier ou déplier ce thème';
      const basculer = () => {
        if (replies.has(nom)) replies.delete(nom); else replies.add(nom);
        memoriserReplies();
        filtrer();
      };
      titre.addEventListener('click', basculer);
      titre.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); basculer(); } });
      aide.before(titre, ...liste);
      liste.forEach(o => {
        rangés.add(o);
        const type = VARIANTES[o.dataset.type]?.type || o.dataset.type;
        o.dataset.mots = sansAccents(`${nomOutil(o)} ${MOTS_PALETTE[o.dataset.type] || ''} ${nom}`);
        if (estInvisible({ type })) {
          o.appendChild(el('small', null, 'invisible'));
          o.title = (o.title ? o.title + '. ' : '') + 'Invisible : il ne se voit pas dans la fenêtre du programme, il travaille en coulisses.';
        }
      });
      sections.push({ nom, titre, liste });
    }
    const rien = el('p', 'aide palette-rien', 'Aucun contrôle ne correspond.');
    rien.hidden = true;
    aide.before(rien);
    // Pendant une recherche, on montre ce qui correspond, même dans un thème replié.
    function filtrer() {
      const mots = sansAccents(recherche.value).split(/\s+/).filter(Boolean);
      let trouves = 0;
      for (const s of sections) {
        const replie = !mots.length && replies.has(s.nom);
        let n = 0;
        s.liste.forEach(o => {
          const ok = mots.every(m => o.dataset.mots.includes(m));
          o.hidden = !ok || replie;
          if (ok) n++;
        });
        s.titre.hidden = !n;
        s.titre.classList.toggle('replie', replie);
        trouves += n;
      }
      rien.hidden = trouves > 0;
    }
    filtrer();
    recherche.addEventListener('input', filtrer);
    recherche.addEventListener('keydown', e => {
      if (e.key === 'Escape') { recherche.value = ''; filtrer(); }
      if (e.key === 'Enter') {
        const premier = palette.querySelector('.outil:not([hidden])'); // le premier affiché
        if (premier) { ajouterControle(premier.dataset.type); recherche.value = ''; filtrer(); }
      }
    });
  }

  // ---- Galerie des exemples : des cartes rangées par thème, avec une recherche ----
  const THEMES_EXEMPLES = [['debut', '🌱 Pour débuter'], ['applications', '🗂️ Applications'], ['jeux', '🎮 Jeux'],
    ['multimedia', '🎨 Images, sons et caméra']];
  const sansAccents = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function ouvrirGalerie() {
    $('galerie-recherche').value = '';
    remplirGalerie();
    $('galerie').hidden = false;
    $('galerie-contenu').scrollTop = 0;
    $('galerie-recherche').focus();
  }

  function fermerGalerie() {
    $('galerie').hidden = true;
  }

  function remplirGalerie() {
    // Tous les mots cherchés doivent se trouver dans le titre, la description ou le thème.
    const mots = sansAccents($('galerie-recherche').value).split(/\s+/).filter(Boolean);
    const contenu = $('galerie-contenu');
    contenu.replaceChildren();
    const themes = THEMES_EXEMPLES.map(([t]) => t);
    for (const [theme, nom] of THEMES_EXEMPLES) {
      const liste = BlocStudioExemples.filter(ex => (themes.includes(ex.theme) ? ex.theme : 'debut') === theme &&
        mots.every(m => sansAccents(`${ex.titre} ${ex.description} ${nom}`).includes(m)));
      if (!liste.length) continue;
      contenu.appendChild(el('h3', 'galerie-theme', nom));
      const grille = el('div', 'galerie-grille');
      for (const ex of liste) {
        const [icone, ...titre] = ex.titre.split(' ');
        const carte = el('button', 'carte-exemple');
        carte.title = 'Ouvrir l\'exemple « ' + titre.join(' ') + ' »';
        carte.append(el('span', 'carte-icone', icone), el('strong', null, titre.join(' ')), el('span', 'carte-desc', ex.description));
        carte.addEventListener('click', () => ouvrirExemple(ex));
        grille.appendChild(carte);
      }
      contenu.appendChild(grille);
    }
    if (!contenu.children.length) {
      contenu.appendChild(el('p', 'aide', `Aucun exemple ne correspond à « ${$('galerie-recherche').value.trim()} ».`));
    }
  }

  function ouvrirExemple(ex) {
    fermerGalerie();
    const nom = ex.titre.replace(/^\S+\s/, '');
    if (projet.controles.length && !confirm(`Ouvrir l'exemple « ${nom} » ? Il remplacera le projet actuel (pensez à l'enregistrer avant).`)) return;
    chargerExemple(ex);
    afficherVue('vue-fenetre');
  }

  function brancherInterface() {
    document.querySelectorAll('.onglet').forEach(o =>
      o.addEventListener('click', () => afficherVue(o.dataset.vue)));

    // Palette : rangée par thème ; glisser-déposer ou simple clic.
    organiserPalette();
    document.querySelectorAll('.outil').forEach(o => {
      o.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', o.dataset.type));
      o.addEventListener('click', () => ajouterControle(o.dataset.type));
    });
    const surface = $('surface-design');
    surface.addEventListener('dragover', e => { e.preventDefault(); surface.classList.add('survol'); });
    surface.addEventListener('dragleave', () => surface.classList.remove('survol'));
    surface.addEventListener('drop', e => {
      e.preventDefault();
      surface.classList.remove('survol');
      const type = e.dataTransfer.getData('text/plain');
      if (!TYPES[type] && !VARIANTES[type]) return;
      const r = surface.getBoundingClientRect();
      ajouterControle(type, e.clientX - r.left, e.clientY - r.top);
    });
    surface.addEventListener('pointerdown', e => { if (e.button === 0) tirerRectangle(e); });
    document.querySelector('.fenetre-design .titre-fenetre').addEventListener('click', () => selectionner(null));
    $('btn-supprimer').addEventListener('click', () => supprimerControles([...choisis]));
    $('btn-annuler-design').addEventListener('click', annuler);
    $('btn-retablir-design').addEventListener('click', retablir);
    // Clic droit : menu des contrôles (couper, copier, coller…) ou de la fenêtre.
    const surMenu = e => {
      e.preventDefault();
      const cible = e.target.closest('.d-ctrl, .d-invisible');
      if (cible) {
        if (!choisis.has(cible.dataset.id)) selectionner(cible.dataset.id);
        menuControles(e.clientX, e.clientY);
      } else {
        menuSurface(e.clientX, e.clientY);
      }
    };
    surface.addEventListener('contextmenu', surMenu);
    $('liste-invisibles').addEventListener('contextmenu', surMenu);
    document.addEventListener('pointerdown', e => { if (!e.target.closest('.menu-contexte')) fermerMenuContextuel(); }, true);
    window.addEventListener('blur', fermerMenuContextuel);
    window.addEventListener('resize', fermerMenuContextuel);
    $('choix-controle').addEventListener('change', e => selectionner(e.target.value || null));

    // Galerie des exemples
    $('btn-exemples').addEventListener('click', ouvrirGalerie);
    $('btn-galerie-fermer').addEventListener('click', fermerGalerie);
    $('galerie').addEventListener('pointerdown', e => { if (e.target === $('galerie')) fermerGalerie(); }); // clic à côté
    $('galerie').addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); fermerGalerie(); }
      // Entrée dans la recherche : s'il ne reste qu'un exemple, on l'ouvre.
      if (e.key === 'Enter' && e.target === $('galerie-recherche')) {
        const cartes = $('galerie-contenu').querySelectorAll('.carte-exemple');
        if (cartes.length === 1) cartes[0].click();
      }
    });
    $('galerie-recherche').addEventListener('input', remplirGalerie);
    remplirGalerie();

    $('btn-nouveau').addEventListener('click', () => {
      if (confirm('Commencer un nouveau projet ? Pensez à enregistrer le projet actuel avant.')) {
        chargerProjet(projetVide());
        planifierSauvegarde();
      }
    });
    $('btn-ouvrir').addEventListener('click', () => $('fichier').click());
    $('fichier').addEventListener('change', e => {
      if (e.target.files[0]) ouvrir(e.target.files[0]);
      e.target.value = '';
    });
    $('btn-enregistrer').addEventListener('click', enregistrer);
    const menuExport = $('menu-export');
    $('btn-exporter').addEventListener('click', e => {
      e.stopPropagation();
      menuExport.hidden = !menuExport.hidden;
    });
    document.addEventListener('click', e => {
      if (!menuExport.hidden && !menuExport.contains(e.target)) menuExport.hidden = true;
    });
    $('export-exe').addEventListener('click', () => { menuExport.hidden = true; exporterExe(); });
    $('export-html').addEventListener('click', () => { menuExport.hidden = true; exporterHtml(); });
    $('btn-fermer-info-exe').addEventListener('click', () => { $('info-exe').hidden = true; });
    $('btn-lancer-exe').addEventListener('click', () => {
      $('info-exe').hidden = true;
      hote.postMessage({ action: 'lancer', chemin: cheminExe });
    });
    $('btn-dossier-exe').addEventListener('click', () => hote.postMessage({ action: 'dossier', chemin: cheminExe }));
    if (hote) document.body.classList.add('dans-hote');
    $('btn-micro-enreg').addEventListener('click', () => {
      if (micro.enregistreur && micro.enregistreur.state === 'recording') arreterMicro(true);
      else demarrerEnregistrement();
    });
    $('btn-micro-ecouter').addEventListener('click', () => ecouterSon({ nom: $('micro-nom').value, donnees: micro.donnees }));
    $('btn-micro-annuler').addEventListener('click', fermerMicro);
    $('btn-micro-garder').addEventListener('click', () => {
      const donnees = micro.donnees;
      const surAjout = micro.surAjout;
      fermerMicro();
      const s = ajouterSon($('micro-nom').value, donnees, 'enregistré');
      if (surAjout) surAjout(s);
    });
    $('micro-nom').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-micro-garder').click(); });
    brancherDecoupe();
    $('btn-executer').addEventListener('click', executer);
    brancherFenetreExec();
    $('btn-fermer-exec').addEventListener('click', fermerExecution);

    // Infobulles des blocs : on peut les couper ; BlocStudio s'en souvient.
    const CLE_INFOBULLES = 'blocstudio.infobulles';
    const majInfobulles = sans => {
      document.body.classList.toggle('sans-infobulles', sans);
      $('btn-infobulles').textContent = sans ? '💬 Infobulles : non' : '💬 Infobulles : oui';
    };
    let sansInfobulles = false;
    try { sansInfobulles = localStorage.getItem(CLE_INFOBULLES) === 'non'; } catch (e) { /* rien de mémorisé */ }
    majInfobulles(sansInfobulles);
    $('btn-infobulles').addEventListener('click', () => {
      sansInfobulles = !sansInfobulles;
      majInfobulles(sansInfobulles);
      try { localStorage.setItem(CLE_INFOBULLES, sansInfobulles ? 'non' : 'oui'); } catch (e) { /* tant pis */ }
    });

    $('btn-voir-js').addEventListener('click', () => {
      const p = $('panneau-js');
      p.hidden = !p.hidden;
      $('vue-code').classList.toggle('js-ouvert', !p.hidden);
      $('btn-voir-js').textContent = p.hidden ? '</> Voir le code' : '✕ Masquer le code';
      Blockly.svgResize(workspace);
      majCodeJs();
    });

    document.addEventListener('keydown', e => {
      if (document.querySelector('.bs-dlg-voile')) return; // une boîte de dialogue gère le clavier
      if (document.querySelector('.modale:not([hidden])')) return; // micro, découpage, éditeur de sprite
      const dansChamp = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
      if (e.key === 'F5') { e.preventDefault(); executer(); return; }
      if (e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); enregistrer(); return; }
      if (e.key === 'F10' && execution) { e.preventDefault(); changerModeSuivi('pas'); execution.suivi.suivant(); return; }
      if (e.defaultPrevented) return; // touche utilisée par le programme en cours (Échap dans un jeu…)
      if (e.key === 'Escape' && execution) { fermerExecution(); return; }
      if (e.key === 'Escape' && $('menu-contexte')) { fermerMenuContextuel(); return; }
      const conceptActif = $('vue-fenetre').classList.contains('actif');
      if (!conceptActif || dansChamp || execution) return;
      if (e.ctrlKey || e.metaKey) {
        const raccourci = {
          z: e.shiftKey ? retablir : annuler, y: retablir,
          c: copier, x: couper, v: () => coller(), d: dupliquer, a: toutSelectionner
        }[e.key.toLowerCase()];
        if (raccourci) { e.preventDefault(); raccourci(); }
        return;
      }
      if (e.key === 'Escape') { selectionner(null); return; }
      if (!choisis.size) return;
      if (e.key === 'Delete') { supprimerControles([...choisis]); return; }
      const pas = e.shiftKey ? 10 : 1;
      const deplacement = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, -pas], ArrowDown: [0, pas] }[e.key];
      if (deplacement) {
        e.preventDefault();
        const choisisVisibles = selectionnes().filter(o => !estInvisible(o));
        // Ce qui est dans un panneau qui bouge suit déjà son panneau.
        for (const c of choisisVisibles.filter(o => !choisisVisibles.some(p => p.type === 'panneau' && dansPanneau(o, p)))) {
          c.x += deplacement[0];
          c.y += deplacement[1];
          const w = elementDesign(c.id);
          if (w) placer(w, c);
        }
        afficherProprietes();
        planifierSauvegarde();
      }
    });
  }

  demarrer();
})();
