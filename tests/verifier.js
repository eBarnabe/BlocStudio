// Tests automatiques — chargé par verifier.ps1 APRÈS les scripts de BlocStudio, dans la vraie page de l'éditeur.
// Les résultats sont écrits dans <pre id="resultats-tests"> (une ligne par test), que verifier.ps1 relit.
//   window.__MODE === 'tout'   : chargement, moteur, boîte à outils, puis chaque exemple de la galerie
//   window.__MODE === 'projet' : seulement le projet déjà chargé (un fichier .bstudio, voir verifier.ps1)
(async function () {
  const sortie = document.createElement('pre');
  sortie.id = 'resultats-tests';
  document.body.appendChild(sortie);
  const lignes = [];
  let reussis = 0, echecs = 0;
  const ecrire = texte => { lignes.push(texte); sortie.textContent = lignes.join('\n'); };
  const ok = nom => { reussis++; ecrire('OK      ' + nom); };
  const ko = (nom, detail) => { echecs++; ecrire('ÉCHEC   ' + nom + ' : ' + detail); };
  const egal = (nom, obtenu, attendu) => JSON.stringify(obtenu) === JSON.stringify(attendu)
    ? ok(nom) : ko(nom, `obtenu ${JSON.stringify(obtenu)}, attendu ${JSON.stringify(attendu)}`);
  const vrai = (nom, condition, detail) => condition ? ok(nom) : ko(nom, detail || 'faux');
  const dort = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  // Un test qui lève une exception échoue (sans arrêter les suivants).
  async function essayer(nom, f) {
    try { await f(); } catch (e) { ko(nom, 'exception : ' + (e && e.message || e)); }
  }

  window.confirm = () => true;
  window.alert = m => ko('alerte inattendue', m);
  const erreursPage = [];
  window.addEventListener('error', e => erreursPage.push(e.message));
  window.addEventListener('unhandledrejection', e => erreursPage.push('promesse : ' + (e.reason && e.reason.message || e.reason)));

  await dort(800); // l'éditeur finit de s'installer

  // ---------------------------------------------------------------- Chargement
  egal('chargement de la page sans erreur', window.__erreursChargement, []);

  // ---------------------------------------------------------------- Exécuter le projet chargé
  async function executerProjet(nom) {
    const avant = erreursPage.length;
    $('btn-executer').click();
    await dort(1200);
    // Pour les jeux qui attendent Espace ou un clic avant de commencer.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
    await dort(1200);
    const erreur = $('erreur-exec');
    const message = erreur.hidden ? '' : erreur.textContent.replace(/\s+/g, ' ').replace('🧩 Voir le bloc', '').trim();
    $('btn-fermer-exec').click();
    await dort(100);
    const nouvelles = erreursPage.slice(avant);
    if (message) ko(nom + ' : exécution', message);
    else if (nouvelles.length) ko(nom + ' : exécution', nouvelles.join(' ; '));
    else ok(nom + ' : exécution sans erreur');
  }

  // Chaque catégorie de la boîte à outils s'ouvre et montre des blocs.
  async function verifierBoite(nom) {
    const ws = Blockly.getMainWorkspace();
    const boite = ws.getToolbox();
    const vides = [], erreurs = [];
    const parcourir = items => {
      for (const it of items) {
        if (!it.getName || !it.isSelectable || !it.isSelectable()) continue;
        try {
          boite.setSelectedItem(it);
          const flyout = boite.getFlyout();
          if (flyout && flyout.isVisible() && !flyout.getWorkspace().getTopBlocks(false).length &&
            !/Variables|Fonctions/.test(it.getName())) vides.push(it.getName());
        } catch (e) { erreurs.push(it.getName() + ' : ' + e.message); }
        if (it.getChildToolboxItems) parcourir(it.getChildToolboxItems());
      }
    };
    parcourir(boite.getToolboxItems().filter(it => !it.getParent || !it.getParent()));
    boite.clearSelection();
    if (erreurs.length) ko(nom + ' : boîte à outils', erreurs.join(' ; '));
    else if (vides.length) ko(nom + ' : boîte à outils', 'catégories vides : ' + vides.join(', '));
    else ok(nom + ' : boîte à outils');
  }

  if (window.__MODE === 'projet') {
    ok(`projet « ${BlocStudio.fenetre().titre} » ouvert (${BlocStudio.controles().length} contrôles, ` +
      `${Blockly.getMainWorkspace().getAllBlocks(false).length} blocs)`);
    document.querySelector('.onglet:nth-child(2)').click();
    await dort(300);
    await essayer('projet : boîte à outils', () => verifierBoite('projet'));
    await essayer('projet : exécution', () => executerProjet('projet'));
    ecrire(`RÉSULTAT : ${reussis} réussi(s), ${echecs} échec(s)`);
    ecrire('FIN');
    return;
  }

  // ---------------------------------------------------------------- Moteur d'exécution
  // Un petit programme lancé à part : « app » donne accès aux fonctions appelées par les blocs.
  function lancer(controles, fenetre) {
    const C = c => Object.assign({ texte: '', visible: true, couleurFond: '', taillePolice: 14 }, c, { nom: c.nom || c.id });
    const projet = {
      id: 'tests', sons: [], sprites: [], fenetres: [],
      fenetre: Object.assign({ titre: 'test', largeur: 400, hauteur: 300, couleurFond: '#ffffff', menus: '' }, fenetre),
      controles: controles.map(C)
    };
    const hote = document.createElement('div');
    hote.style.cssText = 'position:absolute;left:-5000px;top:0';
    document.body.appendChild(hote);
    let erreur = null;
    const exec = BlocRuntime.lancer(projet, 'window.__app = app;', hote, m => { erreur = m; });
    const app = window.__app;
    return { app, hote, erreur: () => erreur, fin: () => { exec.arreter(); hote.remove(); } };
  }

  await essayer('moteur : gravité et saut', async () => {
    const t = lancer([
      { id: 'j', type: 'forme', genre: 'rectangle', x: 100, y: 0, largeur: 20, hauteur: 20 },
      { id: 'sol', type: 'forme', genre: 'rectangle', x: 0, y: 200, largeur: 400, hauteur: 20, solide: true },
      { id: 'mur', type: 'forme', genre: 'rectangle', x: 200, y: 100, largeur: 20, hauteur: 100, solide: true }
    ]);
    const { app } = t;
    for (let i = 0; i < 60; i++) app.mouvement('j', 'gravite', 1, 'bas');
    egal('gravité : posé sur le sol', [app.lire('j', 'y'), app.lire('j', 'auSol')], [180, true]);
    for (let i = 0; i < 30; i++) { app.mouvement('j', 'deplacer', 4, 0); app.mouvement('j', 'gravite', 1, 'bas'); }
    egal('gravité : bloqué par un mur', app.lire('j', 'x'), 180);
    app.mouvement('j', 'sauter', 12);
    egal('saut : vitesse vers le haut', app.lire('j', 'vitesseY'), -12);
    app.mouvement('j', 'sauter', 12);
    for (let i = 0; i < 8; i++) app.mouvement('j', 'gravite', 1, 'bas');
    vrai('saut : en l\'air', app.lire('j', 'y') < 180 && !app.lire('j', 'auSol'), 'y = ' + app.lire('j', 'y'));
    for (let i = 0; i < 60; i++) app.mouvement('j', 'gravite', 1, 'bas');
    egal('saut : retombé', app.lire('j', 'y'), 180);
    app.ecrire('j', 'x', 300); app.ecrire('j', 'y', 250);
    for (let i = 0; i < 30; i++) app.mouvement('j', 'gravite', 1, 'vide');
    vrai('gravité : sort par le bas sans fond', app.lire('j', 'y') > 300, 'y = ' + app.lire('j', 'y'));
    egal('gravité : sans erreur', t.erreur(), null);
    t.fin();
  });

  await essayer('moteur : score et vies', async () => {
    const t = lancer([
      { id: 'score', type: 'etiquette', x: 0, y: 0, largeur: 100, hauteur: 20, texte: 'Score : 9' },
      { id: 'temps', type: 'etiquette', x: 0, y: 20, largeur: 100, hauteur: 20, texte: 'Temps 2,5 s' },
      { id: 'vide', type: 'etiquette', x: 0, y: 40, largeur: 100, hauteur: 20, texte: 'Points' },
      { id: 'barre', type: 'barreprogression', x: 0, y: 60, largeur: 100, hauteur: 10, valeur: 50, max: 100 }
    ]);
    const { app } = t;
    app.ajouterAuNombre('score', 1); app.ajouterAuNombre('temps', 0.1); app.ajouterAuNombre('vide', 5); app.ajouterAuNombre('barre', -10);
    egal('compteurs : ajouter au nombre', [app.lire('score', 'texte'), app.lire('temps', 'texte'), app.lire('vide', 'texte'), app.lire('barre', 'valeur')],
      ['Score : 10', 'Temps 2,6 s', 'Points 5', 40]);
    egal('compteurs : nombre affiché', [app.nombreAffiche('score'), app.nombreAffiche('temps'), app.nombreAffiche('barre')], [10, 2.6, 40]);
    egal('texte répété', [app.repeterTexte('❤️', 3), app.repeterTexte('x', -2)], ['❤️❤️❤️', '']);
    t.fin();
  });

  await essayer('moteur : nombres et hasard', async () => {
    const t = lancer([]);
    const { app } = t;
    egal('format de nombre', [app.formatNombre(3.14159, 2), app.formatNombre(1234567.891, 0), app.formatNombre('12,5', 2)],
      ['3,14', '1\u202f234\u202f568', '12,50']);
    egal('nombre depuis un nombre formaté', app.nombre(app.formatNombre(1234.5, 1)), 1234.5);
    egal('chances 0 % et 100 %', [app.chance(0), app.chance(100)], [false, true]);
    let n = 0;
    for (let i = 0; i < 10000; i++) if (app.chance(30)) n++;
    vrai('chances 30 % (sur 10 000 tirages)', n > 2700 && n < 3300, n + ' fois');
    const melange = app.melanger([1, 2, 3, 4, 5]);
    egal('mélanger garde les éléments', melange.slice().sort(), [1, 2, 3, 4, 5]);
    vrai('couleur au hasard', /^#[0-9a-f]{6}$/.test(app.couleurHasard()), app.couleurHasard());
    t.fin();
  });

  await essayer('moteur : dates', async () => {
    const t = lancer([]);
    const { app } = t;
    egal('jours entre deux dates', [app.joursEntre('01/01/2026', '25/12/2026'), app.joursEntre('25/12/2026', '2026-12-20')], [358, -5]);
    egal('date plus N jours (bissextile, année, heure d\'été)',
      [app.datePlusJours('28/02/2028', 1), app.datePlusJours('01/01/2026', -1), app.datePlusJours('29/03/2026', 1)],
      ['29/02/2028', '31/12/2025', '30/03/2026']);
    egal('jour de la semaine', [app.jourSemaine('14/07/2027'), app.jourSemaine('01/01/1970')], ['mercredi', 'jeudi']);
    let message = '';
    try { app.joursEntre('31/02/2026', '01/01/2026'); } catch (e) { message = e.message; }
    vrai('date impossible refusée', /n'est pas une date/.test(message), message);
    t.fin();
  });

  await essayer('moteur : dictionnaires', async () => {
    const t = lancer([]);
    const { app } = t;
    const d = app.dicoVide();
    app.dicoMettre(d, 'Marie', 12); app.dicoMettre(d, 'Lucas', 15); app.dicoMettre(d, 'Marie', 13);
    egal('dictionnaire : valeurs', [app.dicoValeur(d, 'Marie'), app.dicoValeur(d, 'Zoé'), app.dicoValeur(d, 'toString')], [13, '', '']);
    egal('dictionnaire : clés et contient', [app.dicoCles(d), app.dicoContient(d, 'Lucas'), app.dicoContient(d, 'Zoé')], [['Marie', 'Lucas'], true, false]);
    app.dicoRetirer(d, 'Marie');
    egal('dictionnaire : retirer', app.dicoCles(d), ['Lucas']);
    app.memoriser('test dico', d);
    egal('dictionnaire : mémorisé puis relu', app.dicoValeur(app.memoire('test dico'), 'Lucas'), 15);
    app.oublier('test dico');
    let message = '';
    try { app.dicoMettre('', 'a', 1); } catch (e) { message = e.message; }
    vrai('dictionnaire : message si la variable est vide', /n'est pas un dictionnaire/.test(message), message);
    t.fin();
  });

  await essayer('moteur : calendrier et horloge', async () => {
    let changes = [];
    const t = lancer([
      { id: 'cal', type: 'calendrier', x: 0, y: 0, largeur: 230, hauteur: 210, date: '2026-12-25' },
      { id: 'h', type: 'horloge', x: 240, y: 0, largeur: 120, hauteur: 120, genre: 'aiguilles' },
      { id: 'h2', type: 'horloge', x: 240, y: 130, largeur: 120, hauteur: 30, genre: 'chiffres', decalageHeures: 1 }
    ]);
    const { app, hote } = t;
    app.quand('cal', 'change', async () => { changes.push(app.lire('cal', 'texte')); });
    const cal = hote.querySelector('.bs-calendrier');
    const titre = () => cal.querySelector('.bs-cal-tete span').textContent;
    egal('calendrier : mois et date de départ', [titre(), app.lire('cal', 'texte')], ['décembre 2026', '25/12/2026']);
    const cases = [...cal.querySelector('.bs-cal-grille').children].slice(7);
    egal('calendrier : le 1er décembre 2026 est un mardi', cases.findIndex(e => e.dataset.date === '2026-12-01'), 1);
    cal.querySelector('[data-date="2026-12-03"]').click();
    await dort(50);
    egal('calendrier : un clic choisit le jour (« quand … change »)', changes, ['03/12/2026']);
    cal.querySelector('[data-nav="1"]').click();
    egal('calendrier : mois suivant', titre(), 'janvier 2027');
    app.ecrire('cal', 'texte', '14/07/2027');
    app.calendrier('cal', 'marquer', '20/07/2027', 'rouge');
    app.calendrier('cal', 'marquer', '21/07/2027', 'bleu');
    egal('calendrier : marques', cal.querySelectorAll('.bs-marque').length, 2);
    app.calendrier('cal', 'vider');
    egal('calendrier : marques effacées', cal.querySelectorAll('.bs-marque').length, 0);
    const avant = app.lire('h', 'texte');
    vrai('horloge : heure lue', /^\d\d:\d\d:\d\d$/.test(avant), avant);
    const [hh] = avant.split(':').map(Number);
    egal('horloge : décalage d\'une heure', Number(hote.querySelectorAll('.bs-horloge')[1].textContent.split(':')[0]), (hh + 1) % 24);
    await dort(1300);
    vrai('horloge : elle avance', app.lire('h', 'texte') !== avant, avant + ' → ' + app.lire('h', 'texte'));
    egal('calendrier et horloge : sans erreur', t.erreur(), null);
    t.fin();
  });

  await essayer('moteur : fond qui défile', async () => {
    const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const t = lancer([{ id: 'im', type: 'image', image: pixel, x: 0, y: 0, largeur: 200, hauteur: 100, ajustement: 'etiree' }]);
    const { app, hote } = t;
    app.defilerImage('im', -5, 2); app.defilerImage('im', -5, 2);
    const el = hote.querySelector('.bs-image');
    egal('image qui défile : position', el.style.backgroundPosition, 'calc(50% - 10px) calc(50% + 4px)');
    app.ecrire('im', 'couleurFond', '#ff0000');
    vrai('image qui défile : garde son image après un changement de couleur', el.style.backgroundImage.startsWith('url('), el.style.backgroundImage);
    const clone = app.creerClone('im');
    app.defilerImage(clone, -100, 0);
    egal('image qui défile : un clone défile seul', el.style.backgroundPosition, 'calc(50% - 10px) calc(50% + 4px)');
    t.fin();
  });

  await essayer('moteur : fichiers de tableur', async () => {
    const lignes = [['Nom', 'Code postal', 'Population', 'Note'], ['Bourg-en-Bresse', '01000', '41365', '3,5'], ['Zoé & <Cie>', '75001', 12, '-0,25']];
    const relu = await BlocRuntime.lireClasseur(await BlocRuntime.ecrireClasseur(lignes, 'Essai'));
    egal('Excel : écrit puis relu (« 01000 » reste un texte)', [relu[0].nom, relu[0].lignes],
      ['Essai', [['Nom', 'Code postal', 'Population', 'Note'], ['Bourg-en-Bresse', '01000', '41365', '3,5'], ['Zoé & <Cie>', '75001', '12', '-0,25']]]);
    const windows1252 = new Uint8Array([0x4e, 0x6f, 0x6d, 0x3b, 0x56, 0x69, 0x6c, 0x6c, 0x65, 0x0d, 0x0a, 0x5a, 0x6f, 0xe9, 0x3b, 0x41, 0xff]);
    egal('CSV enregistré par Excel (Windows-1252)', (await BlocRuntime.lireTableur(new File([windows1252], 'a.csv')))[0].lignes, [['Nom', 'Ville'], ['Zoé', 'Aÿ']]);
    egal('CSV : tabulations, et virgules dans un texte séparé par ;',
      [BlocRuntime.depuisCsv('a\tb\nc\td'), BlocRuntime.depuisCsv('Nom;Adresse\nDupont;12, rue de la Paix')],
      [[['a', 'b'], ['c', 'd']], [['Nom', 'Adresse'], ['Dupont', '12, rue de la Paix']]]);
  });

  await essayer('moteur : données JSON et gros tableau', async () => {
    const communes = Array.from({ length: 35000 }, (_, i) => ({ nom: 'Commune ' + (i + 1), codesPostaux: [String(10000 + i)], departement: { nom: 'Dép ' + (i % 100) } }));
    const json = JSON.stringify(communes);
    const t = lancer([
      { id: 't', type: 'tableau', x: 0, y: 0, largeur: 400, hauteur: 200, colonnes: ['Nom', 'Code postal', 'Département'], lignes: [] },
      { id: 'z', type: 'zonetexte', x: 0, y: 210, largeur: 200, hauteur: 30 }
    ]);
    const { app, hote } = t;
    const noms = app.valeursJson(json, 'nom');
    egal('liste des « nom » dans les données', [noms.length, noms[0], noms[34999]], [35000, 'Commune 1', 'Commune 35000']);
    egal('liste des « codesPostaux.1 » et « departement.nom »',
      [app.valeursJson(json, 'codesPostaux.1')[2], app.valeursJson(json, 'departement.nom')[101], app.valeurJson(json, '2.nom')], ['10002', 'Dép 1', 'Commune 2']);
    app.tableau('t', 'json', json, ['nom', 'codesPostaux.1', 'departement.nom']);
    const el = hote.querySelector('.bs-tableau');
    egal('tableau rempli avec des données JSON', [app.lire('t', 'nombreLignes'), app.lireTableau('t', 'ligne', 3)], [35000, ['Commune 3', 10002, 'Dép 2']]);
    app.tableau('t', 'cellule', 1, 2, '01000');
    egal('un code postal qui commence par 0 reste un texte', app.lireTableau('t', 'cellule', 1, 2), '01000');
    vrai('35 000 lignes : seules les lignes visibles sont dessinées', el.querySelectorAll('tr[data-n]').length < 100, el.querySelectorAll('tr[data-n]').length + ' lignes dessinées');
    app.ecrire('t', 'numero', 20000);
    await dort(50);
    vrai('choisir une ligne lointaine la fait voir', !!el.querySelector('tr[data-n="19999"].bs-choisie'), 'défilement : ' + el.scrollTop);
    app.ecrire('z', 'suggestions', noms);
    const liste = document.getElementById(hote.querySelector('.bs-zonetexte').getAttribute('list'));
    egal('zone de texte : 35 000 suggestions', [liste && liste.options.length, app.lire('z', 'suggestions').length], [35000, 35000]);
    t.fin();
  });

  await essayer('moteur : manette', async () => {
    const t = lancer([]);
    const { app } = t;
    const ancien = navigator.getGamepads;
    let pads = [];
    navigator.getGamepads = () => pads;
    const pad = (boutons, axes) => ({ connected: true, buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: boutons.includes(i) })), axes });
    const appuis = [];
    let repetitions = 0;
    app.quandManette('a', () => appuis.push('a'));
    app.quandTouche('droite', () => repetitions++);
    pads = [pad([0], [0.9, 0, 0, -0.4])];
    window.dispatchEvent(new Event('gamepadconnected'));
    await dort(100);
    egal('manette : boutons et joysticks', [app.manetteBranchee(), app.boutonManette('a'), app.joystickManette('gx'), app.joystickManette('dy')],
      [true, true, 90, -40]);
    egal('manette : joystick = flèche, A = Espace', [app.toucheEnfoncee('droite'), app.toucheEnfoncee('espace')], [true, true]);
    await dort(900);
    egal('manette : « quand le bouton A est appuyé » une seule fois', appuis, ['a']);
    vrai('manette : la flèche se répète si on garde le joystick poussé', repetitions > 5, repetitions + ' fois');
    pads = [pad([], [0, 0, 0, 0])];
    await dort(100);
    egal('manette : relâchée', [app.boutonManette('a'), app.toucheEnfoncee('droite')], [false, false]);
    pads = [];
    await dort(100);
    t.fin();
    navigator.getGamepads = ancien;
  });

  // ---------------------------------------------------------------- Boîte à outils et exemples
  document.querySelector('.onglet:nth-child(2)').click();
  await dort(300);
  for (const ex of window.BlocStudioExemples) {
    const nom = 'exemple « ' + ex.titre.replace(/^\S+\s/, '') + ' »';
    await essayer(nom, async () => {
      $('btn-exemples').click();
      await dort(100);
      const carte = [...document.querySelectorAll('.carte-exemple')].find(c => c.title.includes(ex.titre.replace(/^\S+\s/, '')));
      if (!carte) throw new Error('absent de la galerie');
      const avant = erreursPage.length;
      carte.click();
      await dort(400);
      if (erreursPage.length > avant) throw new Error('ouverture : ' + erreursPage.slice(avant).join(' ; '));
      document.querySelector('.onglet:nth-child(2)').click();
      await dort(200);
      await verifierBoite(nom);
      await executerProjet(nom);
    });
  }

  ecrire(`RÉSULTAT : ${reussis} réussi(s), ${echecs} échec(s)`);
  ecrire('FIN');
})();
