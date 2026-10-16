// Blocs propres à BlocStudio et leur traduction en JavaScript.
(function () {
  const gen = javascript.javascriptGenerator;
  const Order = javascript.Order;

  const COULEUR_EVENEMENTS = 40;
  const COULEUR_CONTROLES = 195;
  const COULEUR_INTERFACE = 15;

  const COULEUR_DESSIN = 75;

  const LIBELLES = {
    texte: 'texte', coche: 'coché', numero: 'numéro choisi', elements: 'éléments',
    valeur: 'valeur', min: 'minimum', max: 'maximum', pas: 'pas',
    visible: 'visible', active: 'activé',
    x: 'position X', y: 'position Y', largeur: 'largeur', hauteur: 'hauteur',
    couleurTexte: 'couleur du texte', couleurFond: 'couleur de fond',
    couleurBarre: 'couleur de la barre', taillePolice: 'taille du texte',
    image: 'image (adresse)', nombreLignes: 'nombre de lignes', colonnes: 'colonnes (liste)',
    son: 'son joué (nom)', volume: 'volume (%)', boucle: 'en boucle', enLecture: 'en train de jouer',
    intervalle: 'intervalle (secondes)', deplacable: 'déplaçable à la souris',
    sprite: 'sprite affiché (nom)', costume: 'n° du costume', nomCostume: 'nom du costume',
    vitesse: 'vitesse d\'animation (images/s)', miroir: 'retourné (miroir)', rotation: 'angle (degrés)',
    enAnimation: 'en train d\'être animé', direction: 'direction (degrés)',
    valeurs: 'valeurs (liste)', etiquettes: 'étiquettes (liste)', genre: 'genre (barres, courbe ou secteurs)',
    maxValeurs: 'nombre maximum de valeurs',
    adresse: 'adresse web', video: 'vidéo (adresse)', position: 'position (secondes)', duree: 'durée (secondes)'
  };

  // Les propriétés proposées dépendent du type de contrôle choisi dans le bloc.
  const POSITION = ['visible', 'deplacable', 'x', 'y', 'largeur', 'hauteur'];
  const TEXTE = ['couleurTexte', 'couleurFond', 'taillePolice'];
  const PROPS_PAR_TYPE = {
    bouton: ['texte', ...TEXTE, 'active', ...POSITION],
    etiquette: ['texte', ...TEXTE, ...POSITION, 'direction'],
    zonetexte: ['texte', ...TEXTE, 'active', ...POSITION],
    casecocher: ['texte', 'coche', ...TEXTE, 'active', ...POSITION],
    image: ['image', 'couleurFond', ...POSITION, 'direction'],
    listederoulante: ['texte', 'numero', 'elements', ...TEXTE, 'active', ...POSITION],
    curseur: ['valeur', 'min', 'max', 'active', ...POSITION],
    barreprogression: ['valeur', 'max', 'couleurBarre', 'couleurFond', ...POSITION],
    zonedessin: ['couleurFond', ...POSITION],
    boutonradio: ['texte', 'coche', ...TEXTE, 'active', ...POSITION],
    cadre: ['texte', ...TEXTE, ...POSITION],
    zoneliste: ['texte', 'numero', 'elements', ...TEXTE, 'active', ...POSITION],
    selecteurnombre: ['valeur', 'min', 'max', 'pas', ...TEXTE, 'active', ...POSITION],
    tableau: ['numero', 'texte', 'nombreLignes', 'colonnes', ...TEXTE, ...POSITION],
    date: ['texte', ...TEXTE, 'active', ...POSITION],
    selecteurcouleur: ['texte', 'active', ...POSITION],
    navigateur: ['adresse', ...POSITION],
    onglets: ['numero', 'texte', 'elements', ...TEXTE, ...POSITION],
    graphique: ['valeurs', 'etiquettes', 'texte', 'genre', 'couleurBarre', 'maxValeurs', ...TEXTE, ...POSITION],
    interrupteur: ['coche', 'texte', ...TEXTE, 'active', ...POSITION],
    lien: ['texte', 'adresse', ...TEXTE, ...POSITION],
    video: ['enLecture', 'position', 'duree', 'volume', 'boucle', 'video', ...POSITION],
    son: ['son', 'volume', 'boucle', 'enLecture'],
    minuteur: ['intervalle', 'active'],
    sprite: ['costume', 'nomCostume', 'sprite', 'vitesse', 'enAnimation', 'miroir', 'rotation', ...POSITION, 'direction']
  };
  // Propriétés que l'on peut lire mais pas modifier (absentes du bloc « mettre »).
  const LECTURE_SEULE = { onglets: ['texte'], tableau: ['texte', 'nombreLignes'], son: ['enLecture'], video: ['enLecture', 'duree'], sprite: ['nomCostume', 'enAnimation'] };
  const LIBELLES_SPECIAUX = {
    listederoulante: { texte: 'élément choisi' },
    zoneliste: { texte: 'élément choisi' },
    boutonradio: { coche: 'sélectionné' },
    interrupteur: { coche: 'allumé' },
    onglets: { numero: 'n° de la page affichée', texte: 'titre de la page affichée', elements: 'titres des pages (liste)' },
    graphique: { texte: 'titre', couleurBarre: 'couleur des barres / de la courbe' },
    cadre: { texte: 'titre' },
    tableau: { numero: 'n° de la ligne choisie', texte: 'ligne choisie (texte)' },
    date: { texte: 'date (jj/mm/aaaa)' },
    selecteurcouleur: { texte: 'couleur choisie' },
    minuteur: { active: 'en marche' }
  };

  function typeDe(id) {
    return BlocStudio.controles().find(c => c.id === id)?.type;
  }

  // « moi » désigne le contrôle de l'événement où se trouve le bloc (« quand un clone de Pièce… »).
  function typeDansBloc(bloc, id) {
    if (id !== '__moi') return typeDe(id);
    const racine = bloc && bloc.getRootBlock();
    return racine && racine !== bloc && racine.getField('CTRL') ? typeDe(racine.getFieldValue('CTRL')) : undefined;
  }

  function proprietesPour(type, ecriture) {
    let cles = PROPS_PAR_TYPE[type] || Object.keys(LIBELLES);
    if (ecriture) cles = cles.filter(k => !(LECTURE_SEULE[type] || []).includes(k));
    return cles.map(k => [LIBELLES_SPECIAUX[type]?.[k] || LIBELLES[k], k]);
  }

  // Liste déroulante des propriétés : elle s'adapte au contrôle choisi, mais
  // accepte toute propriété connue (utile pendant le chargement d'un projet).
  class ChampPropriete extends Blockly.FieldDropdown {
    constructor() {
      super(function () {
        const bloc = this.getSourceBlock();
        const options = proprietesPour(bloc ? typeDansBloc(bloc, bloc.getFieldValue('CTRL')) : undefined,
          bloc && bloc.type === 'bs_ecrire');
        const v = this.getValue();
        if (v && !options.some(o => o[1] === v)) options.push([LIBELLES[v] || v, v]);
        return options;
      });
    }
    doClassValidation_(v) {
      return v in LIBELLES ? v : null;
    }
    doValueUpdate_(v) {
      this.generatedOptions = null;
      super.doValueUpdate_(v);
    }
  }

  // Quand on change de contrôle, on garde la propriété si elle existe encore,
  // sinon on prend la première propriété du nouveau contrôle.
  function champControleAvecPropriete() {
    return new Blockly.FieldDropdown(optionsControles(null, true, true), function (id) {
      const bloc = this.getSourceBlock();
      const prop = bloc && bloc.getField('PROP');
      if (prop) {
        const options = proprietesPour(typeDansBloc(bloc, id), bloc.type === 'bs_ecrire');
        if (!options.some(o => o[1] === prop.getValue())) prop.setValue(options[0][1]);
        else prop.setValue(prop.getValue());
      }
      return id;
    });
  }

  const COULEURS = ['rouge', 'orange', 'jaune', 'vert', 'cyan', 'bleu', 'violet',
    'rose', 'marron', 'noir', 'gris', 'blanc', 'transparent'];

  // Liste des contrôles de la fenêtre, éventuellement filtrée par type.
  // Les blocs mémorisent l'identifiant interne, ce qui permet de renommer
  // un contrôle sans casser les blocs qui l'utilisent.
  // Sans liste de types, les contrôles invisibles (Son, Minuteur) sont écartés,
  // sauf si `avecInvisibles` : on ne « clique » pas sur un minuteur !
  // `avecMoi` : propose aussi « moi », le contrôle (ou le clone) qui a déclenché l'événement.
  function optionsControles(types, avecInvisibles, avecMoi) {
    return function () {
      const liste = BlocStudio.controles()
        .filter(c => types ? types.includes(c.type) : avecInvisibles || !BlocRuntime.INVISIBLES.includes(c.type))
        .map(c => [c.nom, c.id]);
      if (avecMoi) liste.push(['👉 moi', '__moi']);
      return liste.length ? liste : [['(aucun contrôle)', '']];
    };
  }

  function evenement(bloc, texteAvant, types, texteApres) {
    const input = bloc.appendDummyInput().appendField(texteAvant);
    if (types !== undefined) {
      input.appendField(new Blockly.FieldDropdown(optionsControles(types)), 'CTRL');
    }
    if (texteApres) input.appendField(texteApres);
    bloc.appendStatementInput('DO');
    bloc.setColour(COULEUR_EVENEMENTS);
    bloc.hat = 'cap';
  }

  Blockly.Blocks['bs_quand_demarre'] = {
    init() {
      evenement(this, 'quand la fenêtre démarre');
      this.setTooltip("Exécuté une seule fois, à l'ouverture du programme.");
    }
  };

  Blockly.Blocks['bs_quand_clic'] = {
    init() {
      evenement(this, 'quand', null, 'est cliqué');
      this.setTooltip("Exécuté chaque fois qu'on clique sur ce contrôle.");
    }
  };

  Blockly.Blocks['bs_quand_change'] = {
    init() {
      evenement(this, 'quand', ['zonetexte', 'casecocher', 'boutonradio', 'listederoulante', 'zoneliste',
        'curseur', 'selecteurnombre', 'tableau', 'date', 'selecteurcouleur', 'navigateur', 'interrupteur', 'onglets'], 'change');
      this.setTooltip("Exécuté quand on tape dans une zone de texte, coche une case, sélectionne un bouton radio, choisit dans une liste, change un nombre, une date ou une couleur, clique sur une ligne d'un tableau ou sur une page d'onglets, ou quand un navigateur web a fini de charger une page.");
    }
  };

  Blockly.Blocks['bs_quand_glisse'] = {
    init() {
      evenement(this, 'quand on fait glisser la souris dans', ['zonedessin']);
      this.setTooltip('Exécuté pendant que la souris bouge avec le bouton enfoncé. Parfait pour un programme de dessin.');
    }
  };

  Blockly.Blocks['bs_quand_minuteur'] = {
    init() {
      evenement(this, 'quand', ['minuteur'], 'sonne');
      this.setTooltip('Exécuté régulièrement, selon l\'intervalle du minuteur (réglé dans ses propriétés), tant qu\'il est en marche.');
    }
  };

  Blockly.Blocks['bs_quand_son_fin'] = {
    init() {
      evenement(this, 'quand', ['son', 'video'], 'se termine');
      this.setTooltip('Exécuté quand le son ou la vidéo arrive à sa fin (pas quand on l\'arrête ou le met en pause). Pratique pour enchaîner des musiques.');
    }
  };

  Blockly.Blocks['bs_toutes_les'] = {
    init() {
      this.appendValueInput('SEC').setCheck('Number').appendField('toutes les');
      this.appendDummyInput().appendField('secondes');
      this.appendStatementInput('DO');
      this.setInputsInline(true);
      this.setColour(COULEUR_EVENEMENTS);
      this.hat = 'cap';
      this.setTooltip('Exécuté régulièrement, sans jamais s\'arrêter. Pour pouvoir l\'arrêter ou changer son rythme, utilisez plutôt un contrôle Minuteur.');
    }
  };

  Blockly.Blocks['bs_ecrire'] = {
    init() {
      this.appendValueInput('VAL')
        .appendField('mettre')
        .appendField(new ChampPropriete(), 'PROP')
        .appendField('de')
        .appendField(champControleAvecPropriete(), 'CTRL')
        .appendField('à');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(COULEUR_CONTROLES);
      this.setTooltip("Change une propriété d'un contrôle de la fenêtre.");
    }
  };

  Blockly.Blocks['bs_lire'] = {
    init() {
      this.appendDummyInput()
        .appendField(new ChampPropriete(), 'PROP')
        .appendField('de')
        .appendField(champControleAvecPropriete(), 'CTRL');
      this.setOutput(true);
      this.setColour(COULEUR_CONTROLES);
      this.setTooltip("Donne la valeur d'une propriété d'un contrôle.");
    }
  };

  Blockly.Blocks['bs_fond_fenetre'] = {
    init() {
      this.appendValueInput('VAL').appendField('mettre la couleur de la fenêtre à');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(COULEUR_CONTROLES);
    }
  };

  Blockly.Blocks['bs_couleur'] = {
    init() {
      this.appendDummyInput()
        .appendField('couleur')
        .appendField(new Blockly.FieldDropdown(COULEURS.map(c => [c, c])), 'COUL');
      this.setOutput(true, 'String');
      this.setColour(COULEUR_CONTROLES);
      this.setTooltip('Une couleur. On peut aussi écrire un code comme #ff8800.');
    }
  };

  // ---------- Clavier et souris ----------

  const COULEUR_ENTREES = '#0d9488';
  const LETTRES = 'abcdefghijklmnopqrstuvwxyz'.split('').map(l => [l.toUpperCase(), l]);
  const CHIFFRES = '0123456789'.split('').map(c => [c, c]);
  const TOUCHES = [
    ['← flèche gauche', 'gauche'], ['→ flèche droite', 'droite'], ['↑ flèche haut', 'haut'], ['↓ flèche bas', 'bas'],
    ['espace', 'espace'], ['Entrée', 'entree'], ['Échap', 'echap'], ['⌫ effacement', 'effacement'],
    ...LETTRES, ...CHIFFRES
  ];
  const champTouche = () => new Blockly.FieldDropdown([['n\'importe quelle touche', 'toutes'], ...TOUCHES]);

  Blockly.Blocks['bs_quand_touche'] = {
    init() {
      this.appendDummyInput().appendField('quand la touche').appendField(champTouche(), 'TOUCHE').appendField('est appuyée');
      this.appendStatementInput('DO');
      this.setColour(COULEUR_EVENEMENTS);
      this.hat = 'cap';
      this.setTooltip('Exécuté quand on appuie sur cette touche (et répété si on la garde enfoncée). Les lettres sont ignorées pendant qu\'on écrit dans une zone de texte.');
    }
  };

  Blockly.Blocks['bs_quand_souris_ctrl'] = {
    init() {
      this.appendDummyInput()
        .appendField('quand on')
        .appendField(new Blockly.FieldDropdown([['double-clique sur', 'dblclic'], ['appuie sur', 'appui'],
          ['relâche le bouton sur', 'relache'], ['passe la souris sur', 'entre'], ['retire la souris de', 'sort']]), 'QUOI')
        .appendField(new Blockly.FieldDropdown(optionsControles(null)), 'CTRL');
      this.appendStatementInput('DO');
      this.setColour(COULEUR_EVENEMENTS);
      this.hat = 'cap';
      this.setTooltip('Réagit à la souris sur un contrôle : double-clic, bouton appuyé ou relâché, souris qui arrive dessus ou qui s\'en va.');
    }
  };

  Blockly.Blocks['bs_quand_souris_fenetre'] = {
    init() {
      this.appendDummyInput()
        .appendField('quand la souris')
        .appendField(new Blockly.FieldDropdown([['bouge', 'bouge'], ['clique', 'clic']]), 'QUOI')
        .appendField('dans la fenêtre');
      this.appendStatementInput('DO');
      this.setColour(COULEUR_EVENEMENTS);
      this.hat = 'cap';
      this.setTooltip('Réagit à la souris n\'importe où dans la fenêtre. Sa position est donnée par « souris position X / Y ».');
    }
  };

  Blockly.Blocks['bs_touche_enfoncee'] = valeur(() => [
    'touche', { champ: champTouche(), nom: 'TOUCHE' }, 'enfoncée ?'
  ], 'Boolean', COULEUR_ENTREES, 'Vrai tant que la touche est maintenue. Idéal dans un minuteur pour déplacer un personnage en douceur.');

  Blockly.Blocks['bs_derniere_touche'] = valeur(() => ['dernière touche appuyée'], 'String', COULEUR_ENTREES,
    'Le nom de la dernière touche : une lettre (« a »), un chiffre, ou gauche, droite, haut, bas, espace, entree, echap…');

  Blockly.Blocks['bs_souris_fenetre'] = valeur(() => [
    'souris', { champ: new Blockly.FieldDropdown([['position X', 'x'], ['position Y', 'y']]), nom: 'QUOI' }, 'dans la fenêtre'
  ], 'Number', COULEUR_ENTREES, 'Position de la souris dans la fenêtre, en pixels (0, 0 = coin en haut à gauche).');

  Blockly.Blocks['bs_souris_enfoncee'] = valeur(() => ['bouton de la souris enfoncé ?'], 'Boolean', COULEUR_ENTREES,
    'Vrai tant que le bouton de la souris est appuyé dans la fenêtre.');

  Blockly.Blocks['bs_se_touchent'] = valeur(() => [
    { champ: new Blockly.FieldDropdown(optionsControles(null, false, true)), nom: 'CTRL' }, 'touche',
    { champ: new Blockly.FieldDropdown(optionsControles(null, false, true)), nom: 'CTRL2' }, '?'
  ], 'Boolean', COULEUR_ENTREES, 'Vrai si les deux contrôles se chevauchent (et sont visibles). Parfait pour les jeux : le panier attrape-t-il la pièce ?');

  // ---------- Sprites ----------

  const COULEUR_SPRITES = '#7c3aed';
  const SPRITE = { ctrl: ['sprite'], moi: true };

  // Sprites de la bibliothèque du projet (désignés par leur identifiant, pour pouvoir
  // les renommer). Un sprite supprimé reste affiché au lieu d'être perdu.
  class ChampSprite extends Blockly.FieldDropdown {
    constructor() {
      super(function () {
        const options = BlocStudio.sprites().map(s => ['🎭 ' + s.nom, s.id]);
        if (!options.length) options.push(['(aucun sprite)', '']);
        const v = this.getValue();
        if (v && !options.some(o => o[1] === v)) options.push(['(sprite supprimé)', v]);
        return options;
      });
    }
    doClassValidation_(v) {
      return typeof v === 'string' ? v : null;
    }
    doValueUpdate_(v) {
      this.generatedOptions = null;
      super.doValueUpdate_(v);
    }
  }

  Blockly.Blocks['bs_sprite_costume'] = instruction(() => [
    'mettre le costume de', SPRITE, { nom: 'VAL', libelle: 'à' }
  ], COULEUR_SPRITES, 'Change l\'image affichée par le sprite : donnez le numéro du costume (1, 2…) ou son nom.');

  Blockly.Blocks['bs_sprite_suivant'] = instruction(() => ['costume suivant de', SPRITE],
    COULEUR_SPRITES, 'Passe au costume suivant (après le dernier, on revient au premier). Pratique pour animer un personnage seulement quand il bouge.');

  Blockly.Blocks['bs_sprite_animer'] = instruction(() => [
    'animer', SPRITE,
    { champ: new Blockly.FieldDropdown([['en boucle', 'boucle'], ['une fois (attendre la fin)', 'unefois']]), nom: 'MODE' }
  ], COULEUR_SPRITES, 'Fait défiler les costumes, à la vitesse choisie dans l\'éditeur de sprite. « une fois » : du premier au dernier costume, puis le programme continue (idéal pour une explosion).');

  Blockly.Blocks['bs_sprite_arreter'] = instruction(() => ['arrêter l\'animation de', SPRITE],
    COULEUR_SPRITES, 'Arrête l\'animation : le sprite garde le costume affiché à ce moment-là.');

  Blockly.Blocks['bs_sprite_regarder'] = instruction(() => [
    'faire regarder', SPRITE,
    { champ: new Blockly.FieldDropdown([['vers la gauche', 'gauche'], ['vers la droite', 'droite']]), nom: 'SENS' }
  ], COULEUR_SPRITES, 'Retourne le sprite comme dans un miroir. Dessinez vos personnages tournés vers la droite : « vers la gauche » les retourne.');

  Blockly.Blocks['bs_sprite_tourner'] = instruction(() => [
    'tourner', SPRITE, { nom: 'DEG', libelle: 'de', check: 'Number' }, 'degrés'
  ], COULEUR_SPRITES, 'Fait pivoter le sprite (sens des aiguilles d\'une montre). Pour choisir l\'angle exact : « mettre angle de … ».');

  Blockly.Blocks['bs_sprite_changer'] = instruction(() => [
    'remplacer', SPRITE, 'par le sprite', { champ: new ChampSprite(), nom: 'SPRITE' }
  ], COULEUR_SPRITES, 'Affiche un autre sprite de la bibliothèque dans ce contrôle (en commençant par son premier costume).');

  Blockly.Blocks['bs_sprite_numero'] = valeur(() => ['n° du costume de', SPRITE], 'Number', COULEUR_SPRITES,
    'Le numéro du costume affiché (1 pour le premier).');

  // ---------- Fenêtres ----------

  const COULEUR_FENETRES = '#0e7490';

  // Les autres fenêtres du projet (désignées par leur identifiant, pour pouvoir les renommer).
  class ChampFenetre extends Blockly.FieldDropdown {
    constructor() {
      super(function () {
        const options = BlocStudio.fenetres().map(f => ['🪟 ' + f.nom, f.id]);
        if (!options.length) options.push(['(aucune autre fenêtre)', '']);
        const v = this.getValue();
        if (v && !options.some(o => o[1] === v)) options.push(['(fenêtre supprimée)', v]);
        return options;
      });
    }
    doClassValidation_(v) {
      return typeof v === 'string' ? v : null;
    }
    doValueUpdate_(v) {
      this.generatedOptions = null;
      super.doValueUpdate_(v);
    }
  }
  const FENETRE = () => ({ champ: new ChampFenetre(), nom: 'FENETRE' });

  Blockly.Blocks['bs_quand_fenetre'] = {
    init() {
      this.appendDummyInput()
        .appendField('quand la fenêtre')
        .appendField(new ChampFenetre(), 'FENETRE')
        .appendField(new Blockly.FieldDropdown([['s\'ouvre', 'ouverture'], ['se ferme', 'fermeture']]), 'QUOI');
      this.appendStatementInput('DO');
      this.setColour(COULEUR_EVENEMENTS);
      this.hat = 'cap';
      this.setTooltip('Exécuté chaque fois que cette fenêtre s\'ouvre (pour préparer son contenu) ou se ferme (y compris avec sa croix ✕).');
    }
  };
  Blockly.Blocks['bs_fenetre_ouvrir'] = instruction(() => [
    'ouvrir la fenêtre', FENETRE(),
    { champ: new Blockly.FieldDropdown([['sans attendre', 'normal'], ['et attendre qu\'elle soit fermée', 'attendre']]), nom: 'MODE' }
  ], COULEUR_FENETRES, 'Affiche la fenêtre par-dessus la fenêtre principale. « et attendre qu\'elle soit fermée » : le reste du programme est bloqué et les blocs suivants attendent sa fermeture (idéal pour une fenêtre de réglages avec OK / Annuler).');
  Blockly.Blocks['bs_fenetre_fermer'] = instruction(() => ['fermer la fenêtre', FENETRE()],
    COULEUR_FENETRES, 'Cache la fenêtre. Ses contrôles gardent ce qu\'on y a écrit : on le retrouve si on la rouvre.');
  Blockly.Blocks['bs_fenetre_titre'] = instruction(() => ['mettre le titre de la fenêtre', FENETRE(), { nom: 'VAL', libelle: 'à' }],
    COULEUR_FENETRES, 'Change le texte de la barre de titre de la fenêtre.');
  Blockly.Blocks['bs_fenetre_ouverte'] = valeur(() => ['la fenêtre', FENETRE(), 'est ouverte ?'], 'Boolean',
    COULEUR_FENETRES, 'Vrai si la fenêtre est affichée en ce moment.');

  // ---------- Mouvement ----------

  const COULEUR_MOUVEMENT = '#2563eb';
  const BOUGE = { ctrl: null, moi: true };
  const NB = (nom, libelle) => ({ nom, libelle, check: 'Number' });

  // Une cible : la souris, un contrôle, ou (pour « placer ») un endroit au hasard.
  function champCible(avecHasard) {
    return new Blockly.FieldDropdown(function () {
      const options = [['🖱️ la souris', '__souris']];
      if (avecHasard) options.unshift(['🎲 un endroit au hasard', '__hasard']);
      return options.concat(BlocStudio.controles().filter(c => !BlocRuntime.INVISIBLES.includes(c.type)).map(c => [c.nom, c.id]));
    });
  }
  const DIRECTIONS = 'Direction en degrés, comme dans Scratch : 90 = vers la droite, -90 = vers la gauche, 0 = vers le haut, 180 = vers le bas.';

  Blockly.Blocks['bs_avancer'] = instruction(() => ['avancer', BOUGE, NB('PAS', 'de'), 'pas'],
    COULEUR_MOUVEMENT, 'Fait avancer le contrôle dans sa direction (vers la droite au départ). Un pas = un pixel.');
  Blockly.Blocks['bs_deplacer'] = instruction(() => ['déplacer', BOUGE, NB('DX', 'de x :'), NB('DY', 'y :')],
    COULEUR_MOUVEMENT, 'Déplace le contrôle : x positif = vers la droite, y positif = vers le bas.');
  Blockly.Blocks['bs_placer'] = instruction(() => ['placer', BOUGE, NB('X', 'à x :'), NB('Y', 'y :')],
    COULEUR_MOUVEMENT, 'Place le coin en haut à gauche du contrôle à cette position (0, 0 = coin en haut à gauche de la fenêtre).');
  Blockly.Blocks['bs_placer_sur'] = instruction(() => ['placer', BOUGE, 'sur', { champ: champCible(true), nom: 'CIBLE' }],
    COULEUR_MOUVEMENT, 'Place le contrôle au milieu de la souris ou d\'un autre contrôle, ou à un endroit au hasard dans la fenêtre.');
  Blockly.Blocks['bs_glisser'] = instruction(() => ['glisser', BOUGE, NB('X', 'vers x :'), NB('Y', 'y :'), NB('SEC', 'en'), 'secondes'],
    COULEUR_MOUVEMENT, 'Déplace le contrôle en douceur jusqu\'à cette position. Le programme attend qu\'il soit arrivé.');
  Blockly.Blocks['bs_orienter'] = instruction(() => ['orienter', BOUGE, NB('DIR', 'à'), 'degrés'],
    COULEUR_MOUVEMENT, 'Choisit la direction dans laquelle « avancer » fait aller le contrôle (son image ne tourne pas). ' + DIRECTIONS);
  Blockly.Blocks['bs_orienter_vers'] = instruction(() => ['orienter', BOUGE, 'vers', { champ: champCible(false), nom: 'CIBLE' }],
    COULEUR_MOUVEMENT, 'Tourne la direction du contrôle vers la souris ou vers un autre contrôle : avec « avancer », il le poursuit !');
  Blockly.Blocks['bs_tourner_direction'] = instruction(() => ['tourner la direction de', BOUGE, NB('DEG', 'de'), 'degrés'],
    COULEUR_MOUVEMENT, 'Change la direction (sens des aiguilles d\'une montre si le nombre est positif). ' + DIRECTIONS);
  Blockly.Blocks['bs_rebondir'] = instruction(() => ['si', BOUGE, 'touche un bord, rebondir'],
    COULEUR_MOUVEMENT, 'Si le contrôle sort de la fenêtre, il est remis dedans et repart dans l\'autre sens. À mettre dans une boucle, après « avancer ».');
  Blockly.Blocks['bs_touche_bord'] = valeur(() => [BOUGE, 'touche un bord ?'], 'Boolean',
    COULEUR_MOUVEMENT, 'Vrai si le contrôle touche ou dépasse un bord de la fenêtre.');
  Blockly.Blocks['bs_distance'] = valeur(() => ['distance entre', BOUGE, 'et', { champ: champCible(false), nom: 'CIBLE' }], 'Number',
    COULEUR_MOUVEMENT, 'Distance en pixels entre le milieu du contrôle et la souris ou le milieu d\'un autre contrôle.');
  Blockly.Blocks['bs_direction'] = valeur(() => ['direction de', BOUGE], 'Number', COULEUR_MOUVEMENT, DIRECTIONS);

  // ---------- Clones ----------

  const CLONABLES = ['sprite', 'image', 'etiquette'];

  Blockly.Blocks['bs_quand_clone'] = {
    init() {
      evenement(this, 'quand un clone de', CLONABLES, 'est créé');
      this.setTooltip('Exécuté pour chaque nouveau clone. Dans ces blocs, choisissez « 👉 moi » pour parler du clone lui-même (le placer, le faire avancer, le supprimer…).');
    }
  };
  Blockly.Blocks['bs_creer_clone'] = instruction(() => ['créer un clone de', { ctrl: CLONABLES, moi: true }],
    COULEUR_SPRITES, 'Crée une copie du contrôle, à la même place et avec la même apparence. Les clones réagissent aux mêmes événements que l\'original (« quand … est cliqué »…). Astuce : cachez l\'original et montrez chaque clone.');
  Blockly.Blocks['bs_supprimer_clone'] = instruction(() => ['supprimer ce clone'],
    COULEUR_SPRITES, 'Fait disparaître le clone (« moi ») et arrête ses blocs. À utiliser dans « quand un clone de … est créé ». Sans effet sur l\'original.');
  Blockly.Blocks['bs_supprimer_clones'] = instruction(() => ['supprimer tous les clones de', { ctrl: CLONABLES }],
    COULEUR_SPRITES, 'Fait disparaître tous les clones de ce contrôle (par exemple pour recommencer une partie).');
  Blockly.Blocks['bs_nombre_clones'] = valeur(() => ['nombre de clones de', { ctrl: CLONABLES }], 'Number',
    COULEUR_SPRITES, 'Combien de clones de ce contrôle existent en ce moment.');

  // ---------- Temps ----------

  Blockly.Blocks['bs_attendre'] = {
    init() {
      this.appendValueInput('SEC').setCheck('Number').appendField('attendre');
      this.appendDummyInput().appendField('secondes');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('loop_blocks');
      this.setTooltip('Met le programme en pause. On peut écrire 0.5 pour une demi-seconde.');
    }
  };

  Blockly.Blocks['bs_toujours'] = {
    init() {
      this.appendDummyInput().appendField('répéter indéfiniment');
      this.appendStatementInput('DO');
      this.setPreviousStatement(true);
      this.setStyle('loop_blocks');
      this.setTooltip('Répète les blocs sans jamais s\'arrêter (jusqu\'à la fermeture du programme). Idéal pour les animations, avec un bloc « attendre ».');
    }
  };

  // ---------- Listes déroulantes ----------

  const champCtrl = types => new Blockly.FieldDropdown(optionsControles(types));
  const LISTES = ['listederoulante', 'zoneliste'];

  Blockly.Blocks['bs_liste_ajouter'] = {
    init() {
      this.appendValueInput('VAL').appendField('ajouter');
      this.appendDummyInput().appendField('à la liste').appendField(champCtrl(LISTES), 'CTRL');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(COULEUR_CONTROLES);
      this.setTooltip('Ajoute un élément à la fin d\'une liste (déroulante ou zone de liste).');
    }
  };

  Blockly.Blocks['bs_liste_vider'] = {
    init() {
      this.appendDummyInput().appendField('vider la liste').appendField(champCtrl(LISTES), 'CTRL');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(COULEUR_CONTROLES);
      this.setTooltip('Retire tous les éléments d\'une liste.');
    }
  };

  Blockly.Blocks['bs_liste_retirer'] = {
    init() {
      this.appendValueInput('NUM').setCheck('Number').appendField('retirer l\'élément n°');
      this.appendDummyInput().appendField('de la liste').appendField(champCtrl(LISTES), 'CTRL');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(COULEUR_CONTROLES);
      this.setTooltip('Retire un élément d\'une liste. Astuce : utilisez « numéro choisi » pour retirer l\'élément sélectionné.');
    }
  };

  // ---------- Boutons radio ----------

  function optionsGroupes() {
    const groupes = [...new Set(BlocStudio.controles()
      .filter(c => c.type === 'boutonradio')
      .map(c => c.groupe || 'groupe1'))];
    return groupes.length ? groupes.map(g => [g, g]) : [['(aucun groupe)', '']];
  }

  Blockly.Blocks['bs_radio_groupe'] = {
    init() {
      this.appendDummyInput()
        .appendField('choix sélectionné du groupe')
        .appendField(new Blockly.FieldDropdown(optionsGroupes), 'GROUPE');
      this.setOutput(true, 'String');
      this.setColour(COULEUR_CONTROLES);
      this.setTooltip('Donne le texte du bouton radio sélectionné dans ce groupe (vide si aucun).');
    }
  };

  // Construit un bloc à partir de morceaux : texte, contrôle, entrée ou champ.
  //   'texte' · { ctrl: [types] } · { nom, libelle, check } · { champ, nom }
  function construire(bloc, morceaux, couleur, tooltip) {
    for (const m of morceaux) {
      if (typeof m === 'string') bloc.appendDummyInput().appendField(m);
      else if (m.ctrl !== undefined) {
        bloc.appendDummyInput().appendField(new Blockly.FieldDropdown(optionsControles(m.ctrl, false, m.moi)), m.nom || 'CTRL');
      }
      else if (m.champ) bloc.appendDummyInput().appendField(m.champ, m.nom);
      else bloc.appendValueInput(m.nom).setCheck(m.check === undefined ? null : m.check).appendField(m.libelle || '');
    }
    bloc.setInputsInline(true);
    bloc.setColour(couleur);
    bloc.setTooltip(tooltip);
  }

  function instruction(morceaux, couleur, tooltip) {
    return {
      init() {
        construire(this, morceaux(), couleur, tooltip);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      }
    };
  }

  function valeur(morceaux, sortie, couleur, tooltip) {
    return {
      init() {
        construire(this, morceaux(), couleur, tooltip);
        this.setOutput(true, sortie);
      }
    };
  }

  // ---------- Menus ----------

  function optionsMenus() {
    const chemins = BlocRuntime.cheminsMenus(BlocStudio.fenetre().menus);
    return chemins.length ? chemins.map(c => [c, c]) : [['(aucun menu)', '']];
  }

  // Accepte tout chemin : un menu renommé reste visible (« introuvable ») au lieu d'être perdu.
  class ChampMenu extends Blockly.FieldDropdown {
    constructor() {
      super(function () {
        const options = optionsMenus();
        const v = this.getValue();
        if (v && !options.some(o => o[1] === v)) options.push([v + ' (introuvable)', v]);
        return options;
      });
    }
    doClassValidation_(v) {
      return typeof v === 'string' ? v : null;
    }
    doValueUpdate_(v) {
      this.generatedOptions = null;
      super.doValueUpdate_(v);
    }
  }

  Blockly.Blocks['bs_quand_menu'] = {
    init() {
      this.appendDummyInput().appendField('quand on choisit le menu').appendField(new ChampMenu(), 'MENU');
      this.appendStatementInput('DO');
      this.setColour(COULEUR_EVENEMENTS);
      this.hat = 'cap';
      this.setTooltip('Exécuté quand on choisit cet élément dans la barre de menus. Les menus se créent dans les propriétés de la fenêtre.');
    }
  };

  Blockly.Blocks['bs_menu_actif'] = instruction(() => [
    { champ: new Blockly.FieldDropdown([['activer', 'TRUE'], ['désactiver', 'FALSE']]), nom: 'ACTIF' },
    'le menu', { champ: new ChampMenu(), nom: 'MENU' }
  ], COULEUR_CONTROLES, 'Un menu désactivé est grisé : on ne peut plus le choisir.');

  // ---------- Messages (comme dans Scratch) ----------

  // Propose les messages déjà utilisés dans le code, plus « Nouveau message… ».
  class ChampMessage extends Blockly.FieldDropdown {
    constructor(valeur) {
      super(function () {
        const bloc = this.getSourceBlock();
        let ws = bloc && bloc.workspace;
        if (ws && ws.isFlyout) ws = ws.targetWorkspace;
        const noms = new Set([this.getValue() || 'message1']);
        if (ws) {
          ws.getAllBlocks(false).filter(b => b.type === 'bs_quand_message' || b.type === 'bs_envoyer_message')
            .forEach(b => noms.add(b.getFieldValue('MSG')));
        }
        const options = [...noms].filter(Boolean).sort((a, b) => a.localeCompare(b, 'fr')).map(n => [n, n]);
        options.push(['➕ Nouveau message…', '__nouveau']);
        return options;
      }, function (v) {
        if (v !== '__nouveau') return v;
        const nom = (prompt('Nom du nouveau message :', '') || '').trim();
        return nom || null;
      });
      if (valeur) this.setValue(valeur);
    }
    doClassValidation_(v) {
      return typeof v === 'string' && v ? v : null;
    }
    doValueUpdate_(v) {
      this.generatedOptions = null;
      super.doValueUpdate_(v);
    }
  }

  Blockly.Blocks['bs_quand_message'] = {
    init() {
      this.appendDummyInput().appendField('📨 quand je reçois').appendField(new ChampMessage('message1'), 'MSG');
      this.appendStatementInput('DO');
      this.setColour(COULEUR_EVENEMENTS);
      this.hat = 'cap';
      this.setTooltip('Exécuté chaque fois que ce message est envoyé (avec « envoyer le message »). Plusieurs blocs peuvent recevoir le même message.');
    }
  };

  Blockly.Blocks['bs_envoyer_message'] = {
    init() {
      this.appendDummyInput()
        .appendField('📨 envoyer le message').appendField(new ChampMessage('message1'), 'MSG')
        .appendField(new Blockly.FieldDropdown([['sans attendre', 'non'], ['et attendre la fin', 'oui']]), 'ATTENDRE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(COULEUR_EVENEMENTS);
      this.setTooltip('Déclenche tous les blocs « quand je reçois » ce message. Avec « et attendre », la suite attend qu\'ils soient tous terminés.');
    }
  };

  // ---------- Tableaux ----------

  const TABLEAU = { ctrl: ['tableau'] };
  const COLONNE = libelle => ({ nom: 'COL', libelle });
  const NUMERO = libelle => ({ nom: 'NUM', libelle, check: 'Number' });

  Blockly.Blocks['bs_tableau_ajouter'] = instruction(() => [
    { nom: 'LIGNE', libelle: 'ajouter la ligne' }, 'au tableau', TABLEAU
  ], COULEUR_CONTROLES, 'Ajoute une ligne à la fin du tableau. Donnez une liste : une valeur par colonne.');

  Blockly.Blocks['bs_tableau_remplacer'] = instruction(() => [
    NUMERO('remplacer la ligne n°'), 'de', TABLEAU, { nom: 'LIGNE', libelle: 'par' }
  ], COULEUR_CONTROLES, 'Remplace toute une ligne par une nouvelle liste de valeurs.');

  Blockly.Blocks['bs_tableau_supprimer'] = instruction(() => [
    NUMERO('supprimer la ligne n°'), 'de', TABLEAU
  ], COULEUR_CONTROLES, 'Supprime une ligne. Astuce : « n° de la ligne choisie » donne la ligne sur laquelle on a cliqué.');

  const GRAPHIQUE = { ctrl: ['graphique'] };

  Blockly.Blocks['bs_graphique_ajouter'] = instruction(() => [
    { nom: 'VAL', libelle: 'ajouter la valeur', check: 'Number' }, { nom: 'ETIQ', libelle: 'avec l\'étiquette' },
    'au graphique', GRAPHIQUE
  ], COULEUR_CONTROLES, 'Ajoute une barre (ou un point à la courbe) à la fin du graphique. Avec « garder seulement les N dernières valeurs », les plus anciennes disparaissent : parfait pour suivre un score en direct.');

  Blockly.Blocks['bs_graphique_vider'] = instruction(() => ['vider le graphique', GRAPHIQUE],
    COULEUR_CONTROLES, 'Enlève toutes les valeurs du graphique.');

  Blockly.Blocks['bs_tableau_vider'] = instruction(() => ['vider le tableau', TABLEAU],
    COULEUR_CONTROLES, 'Supprime toutes les lignes (les titres des colonnes restent).');

  Blockly.Blocks['bs_tableau_ecrire_cellule'] = instruction(() => [
    'dans', TABLEAU, COLONNE('mettre la colonne'), NUMERO('de la ligne n°'), { nom: 'VAL', libelle: 'à' }
  ], COULEUR_CONTROLES, 'Change une seule case du tableau. La colonne se désigne par son titre ou par son numéro.');

  Blockly.Blocks['bs_tableau_trier'] = instruction(() => [
    'trier', TABLEAU, COLONNE('selon la colonne'),
    { champ: new Blockly.FieldDropdown([['croissant (A → Z, 1 → 9)', 'croissant'], ['décroissant (Z → A, 9 → 1)', 'decroissant']]), nom: 'SENS' }
  ], COULEUR_CONTROLES, 'Range les lignes dans l\'ordre d\'une colonne (alphabétique ou numérique).');

  Blockly.Blocks['bs_tableau_cellule'] = valeur(() => [
    COLONNE('colonne'), NUMERO('de la ligne n°'), 'de', TABLEAU
  ], null, COULEUR_CONTROLES, 'Le contenu d\'une case du tableau (un nombre si la case contient un nombre).');

  Blockly.Blocks['bs_tableau_ligne'] = valeur(() => [
    NUMERO('ligne n°'), 'de', TABLEAU, '(liste)'
  ], 'Array', COULEUR_CONTROLES, 'Toutes les valeurs d\'une ligne, sous forme de liste.');

  Blockly.Blocks['bs_tableau_colonne'] = valeur(() => [
    COLONNE('toutes les valeurs de la colonne'), 'de', TABLEAU
  ], 'Array', COULEUR_CONTROLES, 'La liste des valeurs d\'une colonne, de haut en bas. Pratique pour faire un total.');

  Blockly.Blocks['bs_tableau_chercher'] = valeur(() => [
    'n° de la ligne de', TABLEAU, COLONNE('où la colonne'), { nom: 'VAL', libelle: 'vaut' }
  ], 'Number', COULEUR_CONTROLES, 'Cherche une valeur dans une colonne (sans tenir compte des majuscules) et donne le numéro de la première ligne trouvée, ou 0.');

  Blockly.Blocks['bs_tableau_csv'] = valeur(() => ['contenu de', TABLEAU, 'en texte (CSV)'],
    'String', COULEUR_CONTROLES, 'Tout le tableau sous forme de texte CSV (lisible par Excel). À enregistrer dans un fichier .csv.');

  Blockly.Blocks['bs_tableau_remplir_csv'] = instruction(() => [
    'remplir', TABLEAU, { nom: 'VAL', libelle: 'avec le texte CSV' }
  ], COULEUR_CONTROLES, 'Remplace les lignes du tableau par celles d\'un texte CSV (par exemple lu dans un fichier).');

  // ---------- Mémoire et fichiers ----------

  const COULEUR_MEMOIRE = '#a16207';
  const NOM = libelle => ({ nom: 'NOM', libelle, check: 'String' });

  Blockly.Blocks['bs_memoriser'] = instruction(() => [
    { nom: 'VAL', libelle: 'mémoriser' }, NOM('sous le nom')
  ], COULEUR_MEMOIRE, 'Garde une valeur (texte, nombre ou liste) même après la fermeture du programme : on la retrouve au lancement suivant.');

  Blockly.Blocks['bs_memoire'] = valeur(() => [NOM('valeur mémorisée sous le nom')],
    null, COULEUR_MEMOIRE, 'Retrouve une valeur mémorisée (vide si rien n\'a été mémorisé sous ce nom).');

  Blockly.Blocks['bs_oublier'] = instruction(() => [NOM('oublier la valeur mémorisée sous le nom')],
    COULEUR_MEMOIRE, 'Efface une valeur mémorisée.');

  Blockly.Blocks['bs_tout_oublier'] = instruction(() => ['tout oublier (effacer toute la mémoire du programme)'],
    COULEUR_MEMOIRE, 'Efface toutes les valeurs mémorisées et le contenu des tableaux mémorisés.');

  Blockly.Blocks['bs_fichier_enregistrer'] = instruction(() => [
    { nom: 'VAL', libelle: 'enregistrer le texte' }, NOM('dans un fichier nommé')
  ], COULEUR_MEMOIRE, 'Propose d\'enregistrer un fichier sur l\'ordinateur. Finissez le nom par .txt, ou .csv pour un tableau.');

  Blockly.Blocks['bs_fichier_ouvrir'] = valeur(() => ['texte d\'un fichier choisi par l\'utilisateur'],
    'String', COULEUR_MEMOIRE, 'Ouvre la boîte « Ouvrir » et donne le contenu du fichier choisi (vide s\'il annule).');

  // ---------- Sons et temps ----------

  const COULEUR_SONS = '#db2777';

  const SONS_INTEGRES = [['🔔 bip', 'bip'], ['🎉 succès', 'succes'], ['💥 erreur', 'erreur'],
    ['🪙 pièce', 'piece'], ['👆 clic', 'clic'], ['🦘 saut', 'saut']];

  // Sons intégrés, puis sons importés dans le projet (désignés par leur identifiant,
  // pour pouvoir les renommer). Un son supprimé reste affiché au lieu d'être perdu.
  // `debut` : options placées en tête de liste (par exemple « tous les sons »).
  // `integres` : false pour ne proposer que les sons importés.
  class ChampSon extends Blockly.FieldDropdown {
    constructor(debut = [], integres = true) {
      super(function () {
        const importes = BlocStudio.sons().map(s => ['🎵 ' + s.nom, s.id]);
        const options = [...debut, ...(integres ? SONS_INTEGRES : []), ...importes];
        if (!options.length) options.push(['(aucun son importé)', '']);
        const v = this.getValue();
        if (v && !options.some(o => o[1] === v)) options.push(['(son supprimé)', v]);
        return options;
      });
    }
    doClassValidation_(v) {
      return typeof v === 'string' ? v : null;
    }
    doValueUpdate_(v) {
      this.generatedOptions = null;
      super.doValueUpdate_(v);
    }
  }

  Blockly.Blocks['bs_son'] = instruction(() => ['jouer le son', { champ: new ChampSon(), nom: 'SON' }],
    COULEUR_SONS, 'Joue un son. Le programme continue sans attendre la fin du son. Importez vos propres sons avec le bouton « Importer un son… ».');

  Blockly.Blocks['bs_son_mode'] = instruction(() => [
    'jouer le son', { champ: new ChampSon(), nom: 'SON' },
    { champ: new Blockly.FieldDropdown([['jusqu\'au bout', 'attendre'], ['en boucle (musique de fond)', 'boucle']]), nom: 'MODE' }
  ], COULEUR_SONS, '« jusqu\'au bout » : le programme attend la fin du son avant de continuer. « en boucle » : le son recommence sans fin, jusqu\'à « arrêter tous les sons ».');

  Blockly.Blocks['bs_sonctrl'] = instruction(() => [
    { champ: new Blockly.FieldDropdown([['jouer', 'jouer'], ['jouer jusqu\'au bout', 'attendre'], ['mettre en pause', 'pause'],
      ['reprendre', 'reprendre'], ['arrêter', 'arreter']]), nom: 'ACTION' },
    { ctrl: ['son', 'video'] }
  ], COULEUR_SONS, 'Commande un contrôle Son ou Vidéo. « reprendre » repart de l\'endroit de la pause. Son volume et « en boucle » se changent avec le bloc « mettre … ».');

  Blockly.Blocks['bs_minuteur_ctrl'] = instruction(() => [
    { champ: new Blockly.FieldDropdown([['démarrer', 'demarrer'], ['arrêter', 'arreter']]), nom: 'ACTION' },
    'le minuteur', { ctrl: ['minuteur'] }
  ], COULEUR_EVENEMENTS, 'Met en marche ou arrête un minuteur. Son intervalle se change avec le bloc « mettre intervalle de … ».');

  Blockly.Blocks['bs_sons_arreter'] = instruction(() => ['arrêter tous les sons'],
    COULEUR_SONS, 'Coupe les sons importés en train de jouer (par exemple une musique de fond), ainsi que la voix.');

  Blockly.Blocks['bs_son_arreter'] = instruction(() => ['arrêter le son', { champ: new ChampSon([], false), nom: 'SON' }],
    COULEUR_SONS, 'Coupe seulement ce son (par exemple la musique de fond) ; les autres continuent.');

  Blockly.Blocks['bs_son_volume'] = instruction(() => [
    'régler le volume de', { champ: new ChampSon([['🔊 tous les sons', '*']]), nom: 'SON' },
    { nom: 'VOL', libelle: 'à', check: 'Number' }, '%'
  ], COULEUR_SONS, '0 % = muet, 100 % = volume normal. Pratique pour baisser la musique de fond sous les bruitages. Agit aussi sur un son déjà en train de jouer.');

  Blockly.Blocks['bs_note'] = instruction(() => [
    'jouer la note',
    { champ: new Blockly.FieldDropdown([['do', 'do'], ['ré', 're'], ['mi', 'mi'], ['fa', 'fa'], ['sol', 'sol'],
      ['la', 'la'], ['si', 'si'], ['do aigu', 'do2']]), nom: 'NOTE' },
    { nom: 'SEC', libelle: 'pendant', check: 'Number' }, 'secondes'
  ], COULEUR_SONS, 'Joue une note de musique, puis attend qu\'elle soit finie. Enchaînez-les pour faire une mélodie !');

  Blockly.Blocks['bs_dire'] = instruction(() => [
    { nom: 'VAL', libelle: '🗣️ dire à voix haute' },
    { champ: new Blockly.FieldDropdown([['sans attendre', 'non'], ['et attendre la fin', 'oui']]), nom: 'ATTENDRE' }
  ], COULEUR_SONS, 'L\'ordinateur lit le texte avec une voix française. Avec « sans attendre », la suite du programme continue pendant qu\'il parle.');

  Blockly.Blocks['bs_voix_regler'] = instruction(() => [
    { nom: 'VITESSE', libelle: '🗣️ régler la voix : vitesse', check: 'Number' },
    { nom: 'HAUTEUR', libelle: 'hauteur', check: 'Number' }
  ], COULEUR_SONS, 'Vitesse : 1 = normale, 0.5 = lente, 2 = rapide. Hauteur : 1 = normale, 0 = très grave, 2 = très aiguë (voix de robot ou de souris !).');

  Blockly.Blocks['bs_voix_taire'] = instruction(() => ['🗣️ faire taire la voix'],
    COULEUR_SONS, 'Arrête immédiatement la phrase en cours (et celles qui attendaient leur tour).');

  Blockly.Blocks['bs_maintenant'] = valeur(() => [
    { champ: new Blockly.FieldDropdown([
      ['date du jour (jj/mm/aaaa)', 'date'], ['heure actuelle (hh:mm)', 'heure'], ['jour du mois', 'jour'],
      ['mois actuel', 'mois'], ['année actuelle', 'annee'], ['jour de la semaine', 'jourSemaine'],
      ['heures (nombre)', 'heures'], ['minutes (nombre)', 'minutes'], ['secondes (nombre)', 'secondes']]), nom: 'QUOI' }
  ], null, COULEUR_SONS, 'La date ou l\'heure de l\'ordinateur, au moment où le bloc est utilisé.');

  // ---------- Texte ----------

  Blockly.Blocks['bs_retour_ligne'] = {
    init() {
      this.appendDummyInput().appendField('↵ retour à la ligne');
      this.setOutput(true, 'String');
      this.setStyle('text_blocks');
      this.setTooltip('Un passage à la ligne, à utiliser dans « créer un texte avec » (pratique pour les zones de texte multilignes).');
    }
  };

  // Un émoji choisi dans le sélecteur d'émojis (js/emojis.js).
  class ChampEmoji extends Blockly.Field {
    constructor(valeur) {
      super(valeur || '😀');
      this.SERIALIZABLE = true;
      this.CURSOR = 'pointer';
    }
    doClassValidation_(v) {
      return typeof v === 'string' && v ? v : null;
    }
    showEditor_() {
      SelecteurEmoji.ouvrir(this.getSvgRoot(), e => this.setValue(e));
    }
  }
  Blockly.Blocks['bs_emoji'] = {
    init() {
      this.appendDummyInput().appendField('émoji').appendField(new ChampEmoji(), 'EMOJI');
      this.setOutput(true, 'String');
      this.setStyle('text_blocks');
      this.setTooltip('Un émoji, à utiliser comme un texte. Cliquez dessus pour en choisir un autre.');
    }
  };

  // Clic droit sur un bloc qui contient un texte : « Ajouter un émoji… » à la fin de ce texte.
  const champTexteDe = b => b.isEditable() &&
    b.inputList.flatMap(i => i.fieldRow).find(f => f instanceof Blockly.FieldTextInput);
  Blockly.ContextMenuRegistry.registry.register({
    id: 'bs_ajouter_emoji',
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    displayText: '😀 Ajouter un émoji…',
    preconditionFn: s => champTexteDe(s.block) ? 'enabled' : 'hidden',
    callback: s => {
      const champ = champTexteDe(s.block);
      SelecteurEmoji.ouvrir(champ.getSvgRoot(), e => {
        const v = champ.getValue();
        champ.setValue(v + (/[\p{L}\p{N}.,!?:;)»]$/u.test(v) ? ' ' : '') + e); // séparé du mot qui précède
      });
    },
    weight: 0
  });

  // ---------- Dessin ----------

  // Construit un bloc « dans [zone] … » avec des entrées numériques nommées.
  function blocDessin(bloc, debut, morceaux, tooltip) {
    bloc.appendDummyInput().appendField('dans').appendField(champCtrl(['zonedessin']), 'CTRL').appendField(debut);
    for (const m of morceaux) {
      if (typeof m === 'string') bloc.appendDummyInput().appendField(m);
      else if (m.champ) bloc.appendDummyInput().appendField(m.champ, m.nom);
      else bloc.appendValueInput(m.nom).setCheck(m.check === undefined ? 'Number' : m.check).appendField(m.libelle);
    }
    bloc.setInputsInline(true);
    bloc.setPreviousStatement(true);
    bloc.setNextStatement(true);
    bloc.setColour(COULEUR_DESSIN);
    bloc.setTooltip(tooltip);
  }

  const champPlein = () => ({ champ: new Blockly.FieldDropdown([['plein', 'TRUE'], ['vide', 'FALSE']]), nom: 'PLEIN' });

  Blockly.Blocks['bs_dessin_couleur'] = {
    init() {
      this.appendValueInput('VAL')
        .appendField('couleur du crayon de').appendField(champCtrl(['zonedessin']), 'CTRL').appendField(':');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(COULEUR_DESSIN);
      this.setTooltip('Choisit la couleur des prochains dessins.');
    }
  };

  Blockly.Blocks['bs_dessin_epaisseur'] = {
    init() {
      this.appendValueInput('VAL').setCheck('Number')
        .appendField('épaisseur du crayon de').appendField(champCtrl(['zonedessin']), 'CTRL').appendField(':');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(COULEUR_DESSIN);
      this.setTooltip('Choisit l\'épaisseur des traits, en pixels.');
    }
  };

  Blockly.Blocks['bs_dessin_effacer'] = {
    init() {
      this.appendDummyInput().appendField('effacer le dessin de').appendField(champCtrl(['zonedessin']), 'CTRL');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(COULEUR_DESSIN);
      this.setTooltip('Efface tout le contenu de la zone de dessin.');
    }
  };

  Blockly.Blocks['bs_dessin_trait'] = {
    init() {
      blocDessin(this, 'tracer un trait de', [
        { nom: 'X1', libelle: 'x' }, { nom: 'Y1', libelle: 'y' },
        'à', { nom: 'X2', libelle: 'x' }, { nom: 'Y2', libelle: 'y' }
      ], 'Trace une ligne droite entre deux points. (0, 0) est le coin en haut à gauche.');
    }
  };

  Blockly.Blocks['bs_dessin_rectangle'] = {
    init() {
      blocDessin(this, 'dessiner un rectangle', [
        champPlein(), { nom: 'X', libelle: 'x' }, { nom: 'Y', libelle: 'y' },
        { nom: 'L', libelle: 'largeur' }, { nom: 'H', libelle: 'hauteur' }
      ], 'Dessine un rectangle dont le coin en haut à gauche est en (x, y).');
    }
  };

  Blockly.Blocks['bs_dessin_cercle'] = {
    init() {
      blocDessin(this, 'dessiner un cercle', [
        champPlein(), 'centre', { nom: 'X', libelle: 'x' }, { nom: 'Y', libelle: 'y' },
        { nom: 'R', libelle: 'rayon' }
      ], 'Dessine un cercle autour du point (x, y).');
    }
  };

  Blockly.Blocks['bs_dessin_point'] = {
    init() {
      blocDessin(this, 'dessiner un point', [{ nom: 'X', libelle: 'x' }, { nom: 'Y', libelle: 'y' }],
        'Dessine un point rond, de la taille du crayon.');
    }
  };

  Blockly.Blocks['bs_dessin_texte'] = {
    init() {
      blocDessin(this, 'écrire', [
        { nom: 'TXT', libelle: '', check: null }, 'à', { nom: 'X', libelle: 'x' }, { nom: 'Y', libelle: 'y' },
        { nom: 'T', libelle: 'taille' }
      ], 'Écrit un texte dans le dessin, avec la couleur du crayon.');
    }
  };

  Blockly.Blocks['bs_souris'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['x', 'x'], ['y', 'y'], ['x précédent', 'px'], ['y précédent', 'py']
        ]), 'QUOI')
        .appendField('de la souris dans')
        .appendField(champCtrl(['zonedessin']), 'CTRL');
      this.setOutput(true, 'Number');
      this.setColour(COULEUR_DESSIN);
      this.setTooltip('Position de la souris dans la zone de dessin. « précédent » = position juste avant le dernier mouvement.');
    }
  };

  const ICONES = [
    ['ℹ️ information', 'info'],
    ['✅ succès', 'succes'],
    ['⚠️ attention', 'attention'],
    ['❌ erreur', 'erreur']
  ];

  Blockly.Blocks['bs_message'] = {
    init() {
      this.appendValueInput('VAL').appendField('afficher le message');
      this.appendDummyInput()
        .appendField('icône')
        .appendField(new Blockly.FieldDropdown(ICONES), 'ICONE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(COULEUR_INTERFACE);
      this.setTooltip('Ouvre une boîte avec un message. Le programme attend que l\'on clique sur OK.');
    }
  };

  Blockly.Blocks['bs_demander'] = {
    init() {
      this.appendValueInput('VAL').appendField('demander');
      this.setOutput(true, 'String');
      this.setColour(COULEUR_INTERFACE);
      this.setTooltip("Pose une question et donne le texte tapé par l'utilisateur (vide s'il annule).");
    }
  };

  Blockly.Blocks['bs_demander_nombre'] = {
    init() {
      this.appendValueInput('VAL').appendField('demander un nombre');
      this.setOutput(true, 'Number');
      this.setColour(COULEUR_INTERFACE);
      this.setTooltip("Pose une question et n'accepte qu'un nombre comme réponse (0 s'il annule).");
    }
  };

  Blockly.Blocks['bs_confirmer'] = {
    init() {
      this.appendValueInput('VAL').appendField('réponse oui / non à');
      this.setOutput(true, 'Boolean');
      this.setColour(COULEUR_INTERFACE);
      this.setTooltip('Pose une question avec les boutons Oui et Non. Donne vrai pour Oui, faux pour Non.');
    }
  };

  Blockly.Blocks['bs_choisir'] = {
    init() {
      this.appendValueInput('VAL').appendField('faire choisir, question');
      this.appendValueInput('LISTE').setCheck('Array').appendField('parmi la liste');
      this.setInputsInline(true);
      this.setOutput(true, 'String');
      this.setColour(COULEUR_INTERFACE);
      this.setTooltip("Affiche un bouton par élément de la liste et donne celui qu'on a choisi (vide s'il annule).");
    }
  };

  Blockly.Blocks['bs_nombre'] = {
    init() {
      this.appendValueInput('VAL').appendField('nombre depuis');
      this.setOutput(true, 'Number');
      this.setColour(COULEUR_INTERFACE);
      this.setTooltip('Transforme un texte comme "12" ou "3,5" en nombre pour pouvoir calculer.');
    }
  };

  // « contient ? » : une version par catégorie (Texte, Listes), seule la couleur change.
  const blocContient = style => ({
    init() {
      this.appendValueInput('DANS');
      this.appendValueInput('VAL').appendField('contient');
      this.appendDummyInput().appendField('?');
      this.setInputsInline(true);
      this.setOutput(true, 'Boolean');
      this.setStyle(style);
      this.setTooltip('Vrai si le texte contient ce morceau de texte (« Bonjour » contient « jour »), ou si la liste contient cet élément.');
    }
  });
  Blockly.Blocks['bs_contient'] = blocContient('text_blocks');
  Blockly.Blocks['bs_liste_contient'] = blocContient('list_blocks');

  // Libellés de Blockly plus parlants pour les débutants.
  Object.assign(Blockly.Msg, {
    LOGIC_TERNARY_CONDITION: 'si',
    LOGIC_TERNARY_IF_TRUE: 'alors',
    LOGIC_TERNARY_IF_FALSE: 'sinon',
    LOGIC_TERNARY_TOOLTIP: 'Donne la valeur « alors » si la condition est vraie, sinon la valeur « sinon ».',
    MATH_CHANGE_TITLE: 'augmenter %1 de %2',
    MATH_CONSTRAIN_TITLE: 'limiter %1 entre %2 et %3',
    MATH_CONSTRAIN_TOOLTIP: 'Garde le nombre entre le minimum et le maximum (pratique pour un score ou une position).',
    MATH_RANDOM_FLOAT_TITLE_RANDOM: 'nombre à virgule au hasard entre 0 et 1',
    MATH_ONLIST_OPERATOR_MODE: 'valeurs les plus fréquentes de la liste',
    TEXT_APPEND_TITLE: 'ajouter le texte %2 à la fin de %1',
    TEXT_COUNT_MESSAGE0: 'nombre de fois que %1 apparaît dans %2',
    TEXT_REVERSE_MESSAGE0: 'texte à l\'envers %1',
    TEXT_GET_SUBSTRING_START_FIRST: 'prendre le morceau depuis la première lettre',
    TEXT_GET_SUBSTRING_START_FROM_START: 'prendre le morceau depuis la lettre nº',
    TEXT_GET_SUBSTRING_START_FROM_END: 'prendre le morceau depuis la lettre nº (depuis la fin)',
    LISTS_REVERSE_MESSAGE0: 'liste à l\'envers %1',
    LISTS_GET_SUBLIST_START_FIRST: 'prendre la sous-liste depuis le début',
    LISTS_GET_SUBLIST_START_FROM_START: 'prendre la sous-liste depuis le nº',
    LISTS_GET_SUBLIST_START_FROM_END: 'prendre la sous-liste depuis le nº (depuis la fin)'
  });

  // ---------- Génération du code ----------

  const q = s => JSON.stringify(String(s));

  function corps(bloc) {
    return gen.statementToCode(bloc, 'DO');
  }

  // Les événements sont des fonctions « async » : elles peuvent attendre
  // (await) la réponse d'une boîte de dialogue.
  gen.forBlock['bs_quand_demarre'] = b =>
    `app.auDemarrage(async function (moi) {\n${corps(b)}});\n`;

  gen.forBlock['bs_quand_clic'] = b =>
    `app.quand(${q(b.getFieldValue('CTRL'))}, 'clic', async function (moi) {\n${corps(b)}});\n`;

  gen.forBlock['bs_quand_change'] = b =>
    `app.quand(${q(b.getFieldValue('CTRL'))}, 'change', async function (moi) {\n${corps(b)}});\n`;

  gen.forBlock['bs_quand_glisse'] = b =>
    `app.quand(${q(b.getFieldValue('CTRL'))}, 'glisser', async function (moi) {\n${corps(b)}});\n`;

  const val = (b, nom, defaut) => gen.valueToCode(b, nom, Order.NONE) || defaut;
  // « moi » devient la variable `moi` du gestionnaire d'événement.
  const codeCtrl = v => v === '__moi' ? 'moi' : q(v);
  const id = b => codeCtrl(b.getFieldValue('CTRL'));
  const plein = b => b.getFieldValue('PLEIN') === 'TRUE' ? 'true' : 'false';

  gen.forBlock['bs_quand_menu'] = b =>
    `app.quandMenu(${q(b.getFieldValue('MENU'))}, async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_menu_actif'] = b =>
    `app.activerMenu(${q(b.getFieldValue('MENU'))}, ${b.getFieldValue('ACTIF') === 'TRUE'});\n`;

  gen.forBlock['bs_quand_message'] = b =>
    `app.quandMessage(${q(b.getFieldValue('MSG'))}, async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_envoyer_message'] = b => (b.getFieldValue('ATTENDRE') === 'oui' ? 'await ' : '') +
    `app.envoyerMessage(${q(b.getFieldValue('MSG'))});\n`;

  const tab = (b, action, ...args) => `app.tableau(${id(b)}, '${action}'${args.map(a => ', ' + a).join('')});\n`;
  const lireTab = (b, quoi, ...args) => [`app.lireTableau(${id(b)}, '${quoi}'${args.map(a => ', ' + a).join('')})`, Order.FUNCTION_CALL];
  const col = b => val(b, 'COL', '1');
  const num = b => val(b, 'NUM', '1');
  gen.forBlock['bs_graphique_ajouter'] = b => `app.graphique(${id(b)}, 'ajouter', ${val(b, 'VAL', '0')}, ${val(b, 'ETIQ', "''")});\n`;
  gen.forBlock['bs_graphique_vider'] = b => `app.graphique(${id(b)}, 'vider');\n`;
  gen.forBlock['bs_tableau_ajouter'] = b => tab(b, 'ajouter', val(b, 'LIGNE', '[]'));
  gen.forBlock['bs_tableau_remplacer'] = b => tab(b, 'remplacer', num(b), val(b, 'LIGNE', '[]'));
  gen.forBlock['bs_tableau_supprimer'] = b => tab(b, 'supprimer', num(b));
  gen.forBlock['bs_tableau_vider'] = b => tab(b, 'vider');
  gen.forBlock['bs_tableau_ecrire_cellule'] = b => tab(b, 'cellule', num(b), col(b), val(b, 'VAL', "''"));
  gen.forBlock['bs_tableau_trier'] = b => tab(b, 'trier', col(b), q(b.getFieldValue('SENS')));
  gen.forBlock['bs_tableau_remplir_csv'] = b => tab(b, 'csv', val(b, 'VAL', "''"));
  gen.forBlock['bs_tableau_cellule'] = b => lireTab(b, 'cellule', num(b), col(b));
  gen.forBlock['bs_tableau_ligne'] = b => lireTab(b, 'ligne', num(b));
  gen.forBlock['bs_tableau_colonne'] = b => lireTab(b, 'colonne', col(b));
  gen.forBlock['bs_tableau_chercher'] = b => lireTab(b, 'chercher', val(b, 'VAL', "''"), col(b));
  gen.forBlock['bs_tableau_csv'] = b => lireTab(b, 'csv');

  gen.forBlock['bs_memoriser'] = b => `app.memoriser(${val(b, 'NOM', "''")}, ${val(b, 'VAL', "''")});\n`;
  gen.forBlock['bs_memoire'] = b => [`app.memoire(${val(b, 'NOM', "''")})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_oublier'] = b => `app.oublier(${val(b, 'NOM', "''")});\n`;
  gen.forBlock['bs_tout_oublier'] = () => 'app.toutOublier();\n';
  gen.forBlock['bs_fichier_enregistrer'] = b =>
    `await app.enregistrerFichier(${val(b, 'VAL', "''")}, ${val(b, 'NOM', "'fichier.txt'")});\n`;
  gen.forBlock['bs_fichier_ouvrir'] = () => ['(await app.ouvrirFichier())', Order.ATOMIC];

  gen.forBlock['bs_son'] = b => `app.son(${q(b.getFieldValue('SON'))});\n`;
  gen.forBlock['bs_son_mode'] = b => b.getFieldValue('MODE') === 'attendre'
    ? `await app.son(${q(b.getFieldValue('SON'))}, 'attendre');\n`
    : `app.son(${q(b.getFieldValue('SON'))}, 'boucle');\n`;
  gen.forBlock['bs_sons_arreter'] = () => 'app.arreterSons();\n';
  gen.forBlock['bs_sonctrl'] = b => (b.getFieldValue('ACTION') === 'attendre' ? 'await ' : '') +
    `app.sonCtrl(${id(b)}, ${q(b.getFieldValue('ACTION'))});\n`;
  gen.forBlock['bs_minuteur_ctrl'] = b => `app.minuteur(${id(b)}, ${q(b.getFieldValue('ACTION'))});\n`;
  gen.forBlock['bs_quand_minuteur'] = b =>
    `app.quand(${id(b)}, 'tic', async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_quand_son_fin'] = b =>
    `app.quand(${id(b)}, 'fin', async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_son_arreter'] = b => `app.arreterSon(${q(b.getFieldValue('SON'))});\n`;
  gen.forBlock['bs_son_volume'] = b => `app.volume(${q(b.getFieldValue('SON'))}, ${val(b, 'VOL', '100')});\n`;
  gen.forBlock['bs_note'] = b => `await app.note(${q(b.getFieldValue('NOTE'))}, ${val(b, 'SEC', '0.5')});\n`;
  gen.forBlock['bs_dire'] = b => (b.getFieldValue('ATTENDRE') === 'oui' ? 'await ' : '') +
    `app.dire(${val(b, 'VAL', "''")});\n`;
  gen.forBlock['bs_voix_regler'] = b => `app.reglerVoix(${val(b, 'VITESSE', '1')}, ${val(b, 'HAUTEUR', '1')});\n`;
  gen.forBlock['bs_voix_taire'] = () => 'app.taireVoix();\n';
  gen.forBlock['bs_maintenant'] = b => [`app.maintenant(${q(b.getFieldValue('QUOI'))})`, Order.FUNCTION_CALL];

  gen.forBlock['bs_quand_touche'] = b =>
    `app.quandTouche(${q(b.getFieldValue('TOUCHE'))}, async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_quand_souris_ctrl'] = b =>
    `app.quand(${id(b)}, ${q(b.getFieldValue('QUOI'))}, async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_quand_souris_fenetre'] = b =>
    `app.quandSouris(${q(b.getFieldValue('QUOI'))}, async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_touche_enfoncee'] = b => [`app.toucheEnfoncee(${q(b.getFieldValue('TOUCHE'))})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_derniere_touche'] = () => ['app.derniereTouche()', Order.FUNCTION_CALL];
  gen.forBlock['bs_souris_fenetre'] = b => [`app.sourisFenetre(${q(b.getFieldValue('QUOI'))})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_souris_enfoncee'] = () => ["app.sourisFenetre('enfonce')", Order.FUNCTION_CALL];
  gen.forBlock['bs_se_touchent'] = b =>
    [`app.seTouchent(${id(b)}, ${codeCtrl(b.getFieldValue('CTRL2'))})`, Order.FUNCTION_CALL];

  gen.forBlock['bs_sprite_costume'] = b => `app.sprite(${id(b)}, 'costume', ${val(b, 'VAL', '1')});\n`;
  gen.forBlock['bs_sprite_suivant'] = b => `app.sprite(${id(b)}, 'suivant');\n`;
  gen.forBlock['bs_sprite_animer'] = b => b.getFieldValue('MODE') === 'unefois'
    ? `await app.sprite(${id(b)}, 'animer', 'unefois');\n`
    : `app.sprite(${id(b)}, 'animer', 'boucle');\n`;
  gen.forBlock['bs_sprite_arreter'] = b => `app.sprite(${id(b)}, 'arreter');\n`;
  gen.forBlock['bs_sprite_regarder'] = b => `app.sprite(${id(b)}, 'regarder', ${q(b.getFieldValue('SENS'))});\n`;
  gen.forBlock['bs_sprite_tourner'] = b => `app.sprite(${id(b)}, 'tourner', ${val(b, 'DEG', '15')});\n`;
  gen.forBlock['bs_sprite_changer'] = b => `app.sprite(${id(b)}, 'changer', ${q(b.getFieldValue('SPRITE'))});\n`;
  gen.forBlock['bs_sprite_numero'] = b => [`app.lire(${id(b)}, 'costume')`, Order.FUNCTION_CALL];

  const mv = (b, action, ...args) => `app.mouvement(${id(b)}, '${action}'${args.map(a => ', ' + a).join('')});\n`;
  gen.forBlock['bs_avancer'] = b => mv(b, 'avancer', val(b, 'PAS', '10'));
  gen.forBlock['bs_deplacer'] = b => mv(b, 'deplacer', val(b, 'DX', '0'), val(b, 'DY', '0'));
  gen.forBlock['bs_placer'] = b => mv(b, 'placer', val(b, 'X', '0'), val(b, 'Y', '0'));
  gen.forBlock['bs_placer_sur'] = b => mv(b, 'placerSur', q(b.getFieldValue('CIBLE')));
  gen.forBlock['bs_glisser'] = b => 'await ' + mv(b, 'glisser', val(b, 'X', '0'), val(b, 'Y', '0'), val(b, 'SEC', '1'));
  gen.forBlock['bs_orienter'] = b => mv(b, 'orienter', val(b, 'DIR', '90'));
  gen.forBlock['bs_orienter_vers'] = b => mv(b, 'orienterVers', q(b.getFieldValue('CIBLE')));
  gen.forBlock['bs_tourner_direction'] = b => mv(b, 'tourner', val(b, 'DEG', '15'));
  gen.forBlock['bs_rebondir'] = b => mv(b, 'rebondir');
  gen.forBlock['bs_touche_bord'] = b => [`app.toucheBord(${id(b)})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_distance'] = b => [`app.distance(${id(b)}, ${q(b.getFieldValue('CIBLE'))})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_direction'] = b => [`app.lire(${id(b)}, 'direction')`, Order.FUNCTION_CALL];

  const fen = b => q(b.getFieldValue('FENETRE'));
  gen.forBlock['bs_quand_fenetre'] = b =>
    `app.quandFenetre(${fen(b)}, ${q(b.getFieldValue('QUOI'))}, async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_fenetre_ouvrir'] = b => b.getFieldValue('MODE') === 'attendre'
    ? `await app.fenetre(${fen(b)}, 'ouvrir', true);\n` : `app.fenetre(${fen(b)}, 'ouvrir');\n`;
  gen.forBlock['bs_fenetre_fermer'] = b => `app.fenetre(${fen(b)}, 'fermer');\n`;
  gen.forBlock['bs_fenetre_titre'] = b => `app.fenetre(${fen(b)}, 'titre', ${val(b, 'VAL', "''")});\n`;
  gen.forBlock['bs_fenetre_ouverte'] = b => [`app.fenetreOuverte(${fen(b)})`, Order.FUNCTION_CALL];

  gen.forBlock['bs_quand_clone'] = b => `app.quandClone(${id(b)}, async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_creer_clone'] = b => `app.creerClone(${id(b)});\n`;
  gen.forBlock['bs_supprimer_clone'] = () => 'await app.supprimerClone(moi);\n';
  gen.forBlock['bs_supprimer_clones'] = b => `app.supprimerClones(${id(b)});\n`;
  gen.forBlock['bs_nombre_clones'] = b => [`app.nombreClones(${id(b)})`, Order.FUNCTION_CALL];

  gen.forBlock['bs_attendre'] = b =>`await app.attendre(${val(b, 'SEC', '1')});\n`;
  gen.forBlock['bs_toujours'] = b => `while (true) {\n${corps(b)}  await app.respirer();\n}\n`;

  gen.forBlock['bs_liste_ajouter'] = b => `app.ajouterElement(${id(b)}, ${val(b, 'VAL', "''")});\n`;
  gen.forBlock['bs_liste_vider'] = b => `app.viderListe(${id(b)});\n`;
  gen.forBlock['bs_liste_retirer'] = b => `app.retirerElement(${id(b)}, ${val(b, 'NUM', '1')});\n`;
  gen.forBlock['bs_radio_groupe'] = b => [`app.radioCoche(${q(b.getFieldValue('GROUPE'))})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_emoji'] = b => [q(b.getFieldValue('EMOJI')), Order.ATOMIC];
  gen.forBlock['bs_retour_ligne'] = () => ["'\\n'", Order.ATOMIC];

  gen.forBlock['bs_dessin_couleur'] = b => `app.dessin(${id(b)}, 'couleur', ${val(b, 'VAL', "'noir'")});\n`;
  gen.forBlock['bs_dessin_epaisseur'] = b => `app.dessin(${id(b)}, 'epaisseur', ${val(b, 'VAL', '2')});\n`;
  gen.forBlock['bs_dessin_effacer'] = b => `app.dessin(${id(b)}, 'effacer');\n`;
  gen.forBlock['bs_dessin_trait'] = b =>
    `app.dessin(${id(b)}, 'trait', ${['X1', 'Y1', 'X2', 'Y2'].map(n => val(b, n, '0')).join(', ')});\n`;
  gen.forBlock['bs_dessin_rectangle'] = b =>
    `app.dessin(${id(b)}, 'rectangle', ${['X', 'Y', 'L', 'H'].map(n => val(b, n, '0')).join(', ')}, ${plein(b)});\n`;
  gen.forBlock['bs_dessin_cercle'] = b =>
    `app.dessin(${id(b)}, 'cercle', ${['X', 'Y', 'R'].map(n => val(b, n, '0')).join(', ')}, ${plein(b)});\n`;
  gen.forBlock['bs_dessin_point'] = b =>
    `app.dessin(${id(b)}, 'point', ${val(b, 'X', '0')}, ${val(b, 'Y', '0')});\n`;
  gen.forBlock['bs_dessin_texte'] = b =>
    `app.dessin(${id(b)}, 'texte', ${val(b, 'TXT', "''")}, ${val(b, 'X', '0')}, ${val(b, 'Y', '0')}, ${val(b, 'T', '16')});\n`;
  gen.forBlock['bs_souris'] = b =>
    [`app.souris(${id(b)}, ${q(b.getFieldValue('QUOI'))})`, Order.FUNCTION_CALL];

  gen.forBlock['bs_toutes_les'] = b => {
    const sec = gen.valueToCode(b, 'SEC', Order.NONE) || '1';
    return `app.toutesLes(${sec}, async function (moi) {\n${corps(b)}});\n`;
  };

  // Les fonctions créées avec les blocs « Fonctions » doivent aussi être async,
  // et leurs appels attendus, pour pouvoir contenir des boîtes de dialogue.
  for (const type of ['procedures_defreturn', 'procedures_defnoreturn']) {
    const original = gen.forBlock[type];
    gen.forBlock[type] = function (b, g) {
      const resultat = original.call(this, b, g);
      const nom = g.getProcedureName(b.getFieldValue('NAME'));
      const cle = '%' + nom;
      if (g.definitions_[cle]) {
        g.definitions_[cle] = g.definitions_[cle].replace('function ' + nom + '(', 'async function ' + nom + '(');
      }
      return resultat;
    };
  }
  {
    const avecRetour = gen.forBlock['procedures_callreturn'];
    gen.forBlock['procedures_callreturn'] = function (b, g) {
      const [code] = avecRetour.call(this, b, g);
      return ['(await ' + code + ')', Order.ATOMIC];
    };
    const sansRetour = gen.forBlock['procedures_callnoreturn'];
    gen.forBlock['procedures_callnoreturn'] = function (b, g) {
      // Blockly réutilise le générateur « avec retour » : on retire ses parenthèses.
      const code = sansRetour.call(this, b, g);
      const m = /^\(await (.*)\);\n$/s.exec(code);
      return m ? 'await ' + m[1] + ';\n' : 'await ' + code;
    };
  }

  gen.forBlock['bs_ecrire'] = b => {
    const val = gen.valueToCode(b, 'VAL', Order.NONE) || "''";
    return `app.ecrire(${id(b)}, ${q(b.getFieldValue('PROP'))}, ${val});\n`;
  };

  gen.forBlock['bs_lire'] = b =>
    [`app.lire(${id(b)}, ${q(b.getFieldValue('PROP'))})`, Order.FUNCTION_CALL];

  gen.forBlock['bs_fond_fenetre'] = b =>
    `app.fondFenetre(${gen.valueToCode(b, 'VAL', Order.NONE) || "''"});\n`;

  gen.forBlock['bs_couleur'] = b => [q(b.getFieldValue('COUL')), Order.ATOMIC];

  gen.forBlock['bs_message'] = b =>
    `await app.message(${gen.valueToCode(b, 'VAL', Order.NONE) || "''"}, ${q(b.getFieldValue('ICONE') || 'info')});\n`;

  gen.forBlock['bs_demander'] = b =>
    [`(await app.demander(${gen.valueToCode(b, 'VAL', Order.NONE) || "''"}))`, Order.ATOMIC];

  gen.forBlock['bs_demander_nombre'] = b =>
    [`(await app.demander(${gen.valueToCode(b, 'VAL', Order.NONE) || "''"}, 'nombre'))`, Order.ATOMIC];

  gen.forBlock['bs_confirmer'] = b =>
    [`(await app.confirmer(${gen.valueToCode(b, 'VAL', Order.NONE) || "''"}))`, Order.ATOMIC];

  gen.forBlock['bs_choisir'] = b => {
    const question = gen.valueToCode(b, 'VAL', Order.NONE) || "''";
    const liste = gen.valueToCode(b, 'LISTE', Order.NONE) || '[]';
    return [`(await app.choisir(${question}, ${liste}))`, Order.ATOMIC];
  };

  gen.forBlock['bs_nombre'] = b =>
    [`app.nombre(${gen.valueToCode(b, 'VAL', Order.NONE) || "''"})`, Order.FUNCTION_CALL];

  gen.forBlock['bs_contient'] = gen.forBlock['bs_liste_contient'] = b =>
    [`app.contient(${val(b, 'DANS', "''")}, ${val(b, 'VAL', "''")})`, Order.FUNCTION_CALL];

  // `app` désigne le moteur dans le code généré : une variable ne doit pas porter ce nom.
  gen.addReservedWords('app,moi');

  // Protège contre les boucles infinies qui bloqueraient la page.
  gen.INFINITE_LOOP_TRAP =
    'if (++app.boucles > 1000000) throw new Error("Boucle infinie ? Le programme a été arrêté.");\n';

  // ---------- Boîte à outils ----------

  const ombre = (type, champs) => ({ shadow: { type, fields: champs } });
  const texte = t => ombre('text', { TEXT: t });
  const nombre = n => ombre('math_number', { NUM: n });
  const listeTextes = (...valeurs) => ({
    block: {
      type: 'lists_create_with', extraState: { itemCount: valeurs.length },
      inputs: Object.fromEntries(valeurs.map((v, i) => ['ADD' + i, texte(v)]))
    }
  });

  window.BlocStudioToolbox = {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category', name: 'Événements', colour: COULEUR_EVENEMENTS, contents: [
          { kind: 'block', type: 'bs_quand_demarre' },
          { kind: 'block', type: 'bs_quand_clic' },
          { kind: 'block', type: 'bs_quand_change' },
          { kind: 'block', type: 'bs_quand_glisse' },
          { kind: 'block', type: 'bs_quand_menu' },
          { kind: 'block', type: 'bs_quand_fenetre' },
          { kind: 'block', type: 'bs_quand_touche' },
          { kind: 'block', type: 'bs_quand_minuteur' },
          { kind: 'block', type: 'bs_minuteur_ctrl' },
          { kind: 'block', type: 'bs_quand_son_fin' },
          { kind: 'block', type: 'bs_toutes_les', inputs: { SEC: nombre(1) } },
          { kind: 'label', text: 'Messages entre les scripts' },
          { kind: 'block', type: 'bs_envoyer_message' },
          { kind: 'block', type: 'bs_quand_message' }
        ]
      },
      {
        kind: 'category', name: 'Contrôles', colour: COULEUR_CONTROLES, contents: [
          { kind: 'block', type: 'bs_ecrire', inputs: { VAL: texte('Bonjour') } },
          { kind: 'block', type: 'bs_lire' },
          { kind: 'block', type: 'bs_couleur' },
          { kind: 'block', type: 'bs_fond_fenetre', inputs: { VAL: { shadow: { type: 'bs_couleur' } } } },
          { kind: 'label', text: 'Boutons radio' },
          { kind: 'block', type: 'bs_radio_groupe' },
          { kind: 'label', text: 'Listes' },
          { kind: 'block', type: 'bs_liste_ajouter', inputs: { VAL: texte('Nouveau choix') } },
          { kind: 'block', type: 'bs_liste_retirer', inputs: { NUM: nombre(1) } },
          { kind: 'block', type: 'bs_liste_vider' },
          { kind: 'label', text: 'Tableaux' },
          { kind: 'block', type: 'bs_tableau_ajouter', inputs: { LIGNE: listeTextes('Dupont', 'Marie') } },
          { kind: 'block', type: 'bs_tableau_supprimer', inputs: { NUM: nombre(1) } },
          { kind: 'block', type: 'bs_tableau_remplacer', inputs: { NUM: nombre(1), LIGNE: listeTextes('Dupont', 'Marie') } },
          { kind: 'block', type: 'bs_tableau_ecrire_cellule', inputs: { COL: texte('Nom'), NUM: nombre(1), VAL: texte('Martin') } },
          { kind: 'block', type: 'bs_tableau_vider' },
          { kind: 'block', type: 'bs_tableau_trier', inputs: { COL: texte('Nom') } },
          { kind: 'block', type: 'bs_tableau_cellule', inputs: { COL: texte('Nom'), NUM: nombre(1) } },
          { kind: 'block', type: 'bs_tableau_ligne', inputs: { NUM: nombre(1) } },
          { kind: 'block', type: 'bs_tableau_colonne', inputs: { COL: texte('Nom') } },
          { kind: 'block', type: 'bs_tableau_chercher', inputs: { COL: texte('Nom'), VAL: texte('Dupont') } },
          { kind: 'block', type: 'bs_tableau_csv' },
          { kind: 'block', type: 'bs_tableau_remplir_csv' },
          { kind: 'label', text: 'Graphiques' },
          { kind: 'block', type: 'bs_graphique_ajouter', inputs: { VAL: nombre(10), ETIQ: texte('Sam') } },
          { kind: 'block', type: 'bs_graphique_vider' },
          { kind: 'label', text: 'Menus' },
          { kind: 'block', type: 'bs_menu_actif' },
          { kind: 'label', text: 'Minuteurs et sons' },
          { kind: 'block', type: 'bs_minuteur_ctrl' },
          { kind: 'block', type: 'bs_sonctrl' }
        ]
      },
      {
        kind: 'category', name: 'Fenêtres', colour: COULEUR_FENETRES, contents: [
          { kind: 'button', text: '🪟 Créer une autre fenêtre…', callbackKey: 'nouvelleFenetre', 'web-class': 'bouton-fenetre' },
          { kind: 'block', type: 'bs_fenetre_ouvrir' },
          { kind: 'block', type: 'bs_fenetre_ouvrir', fields: { MODE: 'attendre' } },
          { kind: 'block', type: 'bs_fenetre_fermer' },
          { kind: 'block', type: 'bs_quand_fenetre' },
          { kind: 'block', type: 'bs_fenetre_titre', inputs: { VAL: texte('Nouveau titre') } },
          { kind: 'block', type: 'bs_fenetre_ouverte' }
        ]
      },
      {
        kind: 'category', name: 'Clavier et souris', colour: COULEUR_ENTREES, contents: [
          { kind: 'label', text: 'Clavier' },
          { kind: 'block', type: 'bs_quand_touche' },
          { kind: 'block', type: 'bs_touche_enfoncee', fields: { TOUCHE: 'droite' } },
          { kind: 'block', type: 'bs_derniere_touche' },
          { kind: 'label', text: 'Souris' },
          { kind: 'block', type: 'bs_quand_souris_ctrl' },
          { kind: 'block', type: 'bs_quand_souris_fenetre' },
          { kind: 'block', type: 'bs_souris_fenetre' },
          { kind: 'block', type: 'bs_souris_fenetre', fields: { QUOI: 'y' } },
          { kind: 'block', type: 'bs_souris_enfoncee' },
          { kind: 'label', text: 'Pour les jeux' },
          { kind: 'block', type: 'bs_se_touchent' },
          { kind: 'block', type: 'bs_ecrire', fields: { PROP: 'deplacable' }, inputs: { VAL: { shadow: { type: 'logic_boolean' } } } }
        ]
      },
      {
        kind: 'category', name: 'Sprites', colour: COULEUR_SPRITES, contents: [
          { kind: 'button', text: '🎨 Dessiner un sprite…', callbackKey: 'nouveauSprite', 'web-class': 'bouton-sprite' },
          { kind: 'button', text: '📁 Importer une image…', callbackKey: 'importerSprite', 'web-class': 'bouton-sprite' },
          { kind: 'label', text: 'Costumes et animation' },
          { kind: 'block', type: 'bs_sprite_animer' },
          { kind: 'block', type: 'bs_sprite_arreter' },
          { kind: 'block', type: 'bs_sprite_suivant' },
          { kind: 'block', type: 'bs_sprite_costume', inputs: { VAL: nombre(1) } },
          { kind: 'block', type: 'bs_sprite_numero' },
          { kind: 'label', text: 'Orientation' },
          { kind: 'block', type: 'bs_sprite_regarder' },
          { kind: 'block', type: 'bs_sprite_tourner', inputs: { DEG: nombre(15) } },
          { kind: 'label', text: 'Changer d\'image' },
          { kind: 'block', type: 'bs_sprite_changer' },
          { kind: 'label', text: 'Clones' },
          { kind: 'block', type: 'bs_quand_clone' },
          { kind: 'block', type: 'bs_creer_clone' },
          { kind: 'block', type: 'bs_supprimer_clone' },
          { kind: 'block', type: 'bs_supprimer_clones' },
          { kind: 'block', type: 'bs_nombre_clones' },
          { kind: 'label', text: 'Pour les jeux' },
          { kind: 'block', type: 'bs_se_touchent' }
        ]
      },
      {
        kind: 'category', name: 'Mouvement', colour: COULEUR_MOUVEMENT, contents: [
          { kind: 'block', type: 'bs_avancer', inputs: { PAS: nombre(10) } },
          { kind: 'block', type: 'bs_deplacer', inputs: { DX: nombre(10), DY: nombre(0) } },
          { kind: 'block', type: 'bs_placer', inputs: { X: nombre(0), Y: nombre(0) } },
          { kind: 'block', type: 'bs_placer_sur' },
          { kind: 'block', type: 'bs_glisser', inputs: { X: nombre(200), Y: nombre(100), SEC: nombre(1) } },
          { kind: 'label', text: 'Direction' },
          { kind: 'block', type: 'bs_orienter', inputs: { DIR: nombre(90) } },
          { kind: 'block', type: 'bs_orienter_vers' },
          { kind: 'block', type: 'bs_tourner_direction', inputs: { DEG: nombre(15) } },
          { kind: 'block', type: 'bs_direction' },
          { kind: 'label', text: 'Bords et distances' },
          { kind: 'block', type: 'bs_rebondir' },
          { kind: 'block', type: 'bs_touche_bord' },
          { kind: 'block', type: 'bs_distance' }
        ]
      },
      {
        kind: 'category', name: 'Dessin', colour: COULEUR_DESSIN, contents: [
          { kind: 'block', type: 'bs_dessin_couleur', inputs: { VAL: { shadow: { type: 'bs_couleur' } } } },
          { kind: 'block', type: 'bs_dessin_epaisseur', inputs: { VAL: nombre(3) } },
          { kind: 'block', type: 'bs_dessin_trait', inputs: { X1: nombre(10), Y1: nombre(10), X2: nombre(100), Y2: nombre(80) } },
          { kind: 'block', type: 'bs_dessin_rectangle', inputs: { X: nombre(20), Y: nombre(20), L: nombre(80), H: nombre(50) } },
          { kind: 'block', type: 'bs_dessin_cercle', inputs: { X: nombre(60), Y: nombre(60), R: nombre(30) } },
          { kind: 'block', type: 'bs_dessin_point', inputs: { X: nombre(50), Y: nombre(50) } },
          { kind: 'block', type: 'bs_dessin_texte', inputs: { TXT: texte('Bonjour'), X: nombre(10), Y: nombre(10), T: nombre(20) } },
          { kind: 'block', type: 'bs_dessin_effacer' },
          { kind: 'block', type: 'bs_souris' }
        ]
      },
      {
        kind: 'category', name: 'Dialogue', colour: COULEUR_INTERFACE, contents: [
          { kind: 'block', type: 'bs_message', inputs: { VAL: texte('Bonjour !') } },
          { kind: 'block', type: 'bs_demander', inputs: { VAL: texte('Comment tu t\'appelles ?') } },
          { kind: 'block', type: 'bs_demander_nombre', inputs: { VAL: texte('Quel âge as-tu ?') } },
          { kind: 'block', type: 'bs_confirmer', inputs: { VAL: texte('Veux-tu continuer ?') } },
          {
            kind: 'block', type: 'bs_choisir',
            inputs: {
              VAL: texte('Quelle couleur préfères-tu ?'),
              LISTE: {
                block: {
                  type: 'lists_create_with', extraState: { itemCount: 3 },
                  inputs: { ADD0: texte('Rouge'), ADD1: texte('Vert'), ADD2: texte('Bleu') }
                }
              }
            }
          },
          { kind: 'block', type: 'bs_nombre' }
        ]
      },
      {
        kind: 'category', name: 'Mémoire', colour: COULEUR_MEMOIRE, contents: [
          { kind: 'block', type: 'bs_memoriser', inputs: { VAL: texte('Marie'), NOM: texte('prénom') } },
          { kind: 'block', type: 'bs_memoire', inputs: { NOM: texte('prénom') } },
          { kind: 'block', type: 'bs_oublier', inputs: { NOM: texte('prénom') } },
          { kind: 'block', type: 'bs_tout_oublier' },
          { kind: 'label', text: 'Fichiers' },
          { kind: 'block', type: 'bs_fichier_enregistrer', inputs: { VAL: texte('Bonjour !'), NOM: texte('mon fichier.txt') } },
          { kind: 'block', type: 'bs_fichier_ouvrir' }
        ]
      },
      {
        kind: 'category', name: 'Sons et temps', colour: COULEUR_SONS, contents: [
          { kind: 'button', text: '🎵 Importer un son…', callbackKey: 'importerSon' },
          { kind: 'button', text: '🎤 Enregistrer avec le micro…', callbackKey: 'enregistrerSon' },
          { kind: 'button', text: '🎹 Composer une musique 8 bits…', callbackKey: 'composerMusique' },
          { kind: 'block', type: 'bs_son' },
          { kind: 'block', type: 'bs_son_mode' },
          { kind: 'label', text: 'Contrôles Son' },
          { kind: 'block', type: 'bs_sonctrl' },
          { kind: 'block', type: 'bs_quand_son_fin' },
          { kind: 'label', text: 'Sons de la bibliothèque' },
          { kind: 'block', type: 'bs_son_arreter' },
          { kind: 'block', type: 'bs_sons_arreter' },
          { kind: 'block', type: 'bs_son_volume', fields: { SON: '*' }, inputs: { VOL: nombre(30) } },
          { kind: 'label', text: 'Voix' },
          { kind: 'block', type: 'bs_dire', inputs: { VAL: texte('Bonjour, je suis ton ordinateur !') }, fields: { ATTENDRE: 'oui' } },
          { kind: 'block', type: 'bs_voix_regler', inputs: { VITESSE: nombre(1), HAUTEUR: nombre(1) } },
          { kind: 'block', type: 'bs_voix_taire' },
          { kind: 'label', text: 'Musique et temps' },
          { kind: 'block', type: 'bs_note', inputs: { SEC: nombre(0.5) } },
          { kind: 'block', type: 'bs_maintenant' }
        ]
      },
      { kind: 'sep' },
      {
        kind: 'category', name: 'Logique', categorystyle: 'logic_category', contents: [
          { kind: 'block', type: 'controls_if' },
          { kind: 'block', type: 'controls_if', extraState: { hasElse: true } },
          { kind: 'block', type: 'logic_compare' },
          { kind: 'block', type: 'logic_operation' },
          { kind: 'block', type: 'logic_negate' },
          { kind: 'block', type: 'logic_boolean' },
          { kind: 'block', type: 'logic_ternary' }
        ]
      },
      {
        kind: 'category', name: 'Boucles', categorystyle: 'loop_category', contents: [
          { kind: 'block', type: 'bs_attendre', inputs: { SEC: nombre(1) } },
          { kind: 'block', type: 'bs_toujours' },
          { kind: 'block', type: 'controls_repeat_ext', inputs: { TIMES: nombre(10) } },
          { kind: 'block', type: 'controls_whileUntil' },
          {
            kind: 'block', type: 'controls_for',
            inputs: { FROM: nombre(1), TO: nombre(10), BY: nombre(1) }
          },
          { kind: 'block', type: 'controls_forEach' },
          { kind: 'block', type: 'controls_flow_statements' }
        ]
      },
      {
        kind: 'category', name: 'Maths', categorystyle: 'math_category', contents: [
          { kind: 'block', type: 'math_number' },
          { kind: 'block', type: 'math_arithmetic', inputs: { A: nombre(1), B: nombre(1) } },
          { kind: 'block', type: 'math_single' },
          { kind: 'block', type: 'math_round' },
          { kind: 'block', type: 'math_modulo' },
          { kind: 'block', type: 'math_number_property' },
          { kind: 'block', type: 'math_random_int', inputs: { FROM: nombre(1), TO: nombre(100) } },
          { kind: 'block', type: 'math_random_float' },
          { kind: 'block', type: 'math_constrain', inputs: { VALUE: nombre(50), LOW: nombre(0), HIGH: nombre(100) } },
          { kind: 'block', type: 'math_on_list' },
          { kind: 'block', type: 'math_trig', inputs: { NUM: nombre(45) } },
          { kind: 'block', type: 'math_constant' }
        ]
      },
      {
        kind: 'category', name: 'Texte', categorystyle: 'text_category', contents: [
          { kind: 'block', type: 'text' },
          { kind: 'block', type: 'bs_emoji' },
          { kind: 'block', type: 'text_join' },
          { kind: 'block', type: 'bs_retour_ligne' },
          { kind: 'block', type: 'text_append', inputs: { TEXT: texte('') } },
          { kind: 'block', type: 'text_length' },
          { kind: 'block', type: 'text_isEmpty' },
          { kind: 'block', type: 'bs_contient', inputs: { VAL: texte('jour') } },
          { kind: 'block', type: 'text_indexOf', inputs: { FIND: texte('jour') } },
          { kind: 'block', type: 'text_charAt', inputs: { AT: nombre(1) } },
          { kind: 'block', type: 'text_getSubstring', inputs: { AT1: nombre(1), AT2: nombre(3) } },
          { kind: 'block', type: 'text_replace', inputs: { FROM: texte('a'), TO: texte('b') } },
          { kind: 'block', type: 'text_count', inputs: { SUB: texte('a') } },
          { kind: 'block', type: 'text_changeCase' },
          { kind: 'block', type: 'text_trim' },
          { kind: 'block', type: 'text_reverse' },
          { kind: 'block', type: 'bs_nombre' }
        ]
      },
      {
        kind: 'category', name: 'Listes', categorystyle: 'list_category', contents: [
          { kind: 'block', type: 'lists_create_empty' },
          { kind: 'block', type: 'lists_create_with' },
          { kind: 'block', type: 'lists_length' },
          { kind: 'block', type: 'lists_isEmpty' },
          { kind: 'block', type: 'lists_repeat', inputs: { NUM: nombre(5) } },
          { kind: 'block', type: 'bs_liste_contient' },
          { kind: 'block', type: 'lists_getIndex' },
          { kind: 'block', type: 'lists_setIndex' },
          { kind: 'block', type: 'lists_indexOf' },
          { kind: 'block', type: 'lists_getSublist', inputs: { AT1: nombre(1), AT2: nombre(3) } },
          { kind: 'block', type: 'lists_sort' },
          { kind: 'block', type: 'lists_reverse' },
          { kind: 'block', type: 'lists_split', inputs: { DELIM: texte(',') } }
        ]
      },
      { kind: 'sep' },
      { kind: 'category', name: 'Variables', categorystyle: 'variable_category', custom: 'VARIABLE' },
      { kind: 'category', name: 'Fonctions', categorystyle: 'procedure_category', custom: 'PROCEDURE' }
    ]
  };
})();
