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
    son: 'son joué (nom, ou adresse web d\'un son ou d\'une radio)', volume: 'volume (%)', boucle: 'en boucle', enLecture: 'en train de jouer',
    intervalle: 'intervalle (secondes)', deplacable: 'déplaçable à la souris',
    sprite: 'sprite affiché (nom)', costume: 'n° du costume', nomCostume: 'nom du costume',
    vitesse: 'vitesse d\'animation (images/s)', miroir: 'retourné (miroir)', rotation: 'angle (degrés)',
    enAnimation: 'en train d\'être animé', direction: 'direction (degrés)',
    taille: 'taille (%)', transparence: 'transparence (%)',
    valeurs: 'valeurs (liste)', etiquettes: 'étiquettes (liste)', genre: 'genre (barres, courbe ou secteurs)',
    maxValeurs: 'nombre maximum de valeurs',
    motDePasse: 'caché (mot de passe)', chemin: 'chemin de l\'élément choisi',
    allumee: 'allumée', photo: 'dernière photo (image)', mouvement: 'mouvement vu (%)',
    seuilMouvement: 'seuil de mouvement (%)',
    contenu: 'contenu du fichier', nomFichier: 'nom du fichier', annule: 'annulé par l\'utilisateur',
    nomPropose: 'nom proposé pour enregistrer', typeFichier: 'type de fichier (texte, csv, image, son ou tous)',
    nombreFiches: 'nombre de fiches', champs: 'champs (liste)', memoriser: 'garder les fiches d\'une fois à l\'autre',
    adresse: 'adresse web', video: 'vidéo (adresse)', position: 'position (secondes)', duree: 'durée (secondes)',
    infobulle: 'infobulle (texte au survol)', gras: 'en gras', italique: 'en italique',
    alignement: 'alignement (gauche, centre ou droite)', bordure: 'bordure (aucune, simple ou creuse)',
    ajustement: 'ajustement (entiere, etiree ou recadree)', texteInvite: 'texte d\'invite (grisé)',
    lectureSeule: 'en lecture seule', longueurMax: 'longueur maximale (0 = sans limite)', trie: 'triée (ordre alphabétique)',
    couleurBordure: 'couleur du trait', epaisseur: 'épaisseur du trait', sens: 'sens de la ligne (horizontale, verticale, descendante ou montante)',
    heures: 'heures', minutes: 'minutes', collision: 'collisions (precise : au pixel près, ou rectangle)', orientation: 'orientation (horizontale ou verticale)', cliquable: 'cliquable (un clic choisit la valeur)',
    defilementY: 'défilement vertical (en pixels depuis le haut)', defilementX: 'défilement horizontal (en pixels depuis la gauche)',
    hauteurContenu: 'hauteur du contenu (tout ce qu\'on peut faire défiler)', largeurContenu: 'largeur du contenu',
    defilement: 'sens du défilement (vertical, horizontal ou deux)',
    solide: 'solide (sol, plateforme ou mur, pour la gravité)', vitesseY: 'vitesse de chute (négative : il monte)'
  };

  // Les propriétés proposées dépendent du type de contrôle choisi dans le bloc.
  const POSITION = ['visible', 'deplacable', 'x', 'y', 'largeur', 'hauteur', 'infobulle', 'solide'];
  const TEXTE = ['couleurTexte', 'couleurFond', 'taillePolice', 'gras', 'italique'];
  const PROPS_PAR_TYPE = {
    bouton: ['texte', ...TEXTE, 'alignement', 'active', ...POSITION],
    etiquette: ['texte', ...TEXTE, 'alignement', 'bordure', ...POSITION, 'direction', 'vitesseY'],
    zonetexte: ['texte', 'motDePasse', 'texteInvite', 'lectureSeule', 'longueurMax', ...TEXTE, 'alignement', 'active', ...POSITION],
    arborescence: ['texte', 'chemin', 'elements', ...TEXTE, ...POSITION],
    barreetat: ['texte', ...TEXTE, 'visible'],
    barreoutils: ['couleurTexte', 'couleurFond', 'taillePolice', 'visible'],
    menucontextuel: [],
    casecocher: ['texte', 'coche', ...TEXTE, 'active', ...POSITION],
    image: ['image', 'ajustement', 'bordure', 'couleurFond', ...POSITION, 'direction', 'vitesseY'],
    listederoulante: ['texte', 'numero', 'elements', 'trie', ...TEXTE, 'active', ...POSITION],
    curseur: ['valeur', 'min', 'max', 'pas', 'orientation', 'couleurBarre', 'couleurFond', 'active', ...POSITION],
    barreprogression: ['valeur', 'max', 'cliquable', 'couleurBarre', 'couleurFond', ...POSITION],
    zonedessin: ['couleurFond', ...POSITION],
    boutonradio: ['texte', 'coche', ...TEXTE, 'active', ...POSITION],
    cadre: ['texte', ...TEXTE, ...POSITION],
    panneau: ['defilementY', 'defilementX', 'hauteurContenu', 'largeurContenu', 'defilement', 'couleurFond', ...POSITION],
    zoneliste: ['texte', 'numero', 'elements', 'trie', ...TEXTE, 'active', ...POSITION],
    selecteurnombre: ['valeur', 'min', 'max', 'pas', ...TEXTE, 'active', ...POSITION],
    tableau: ['numero', 'texte', 'nombreLignes', 'colonnes', ...TEXTE, ...POSITION],
    date: ['texte', ...TEXTE, 'active', ...POSITION],
    heure: ['texte', 'heures', 'minutes', ...TEXTE, 'active', ...POSITION],
    forme: ['genre', 'couleurFond', 'couleurBordure', 'epaisseur', 'sens', ...POSITION, 'direction', 'vitesseY'],
    selecteurcouleur: ['texte', 'active', ...POSITION],
    navigateur: ['adresse', ...POSITION],
    onglets: ['numero', 'texte', 'elements', ...TEXTE, ...POSITION],
    graphique: ['valeurs', 'etiquettes', 'texte', 'genre', 'couleurBarre', 'maxValeurs', ...TEXTE, ...POSITION],
    interrupteur: ['coche', 'texte', ...TEXTE, 'active', ...POSITION],
    lien: ['texte', 'adresse', ...TEXTE, 'alignement', ...POSITION],
    video: ['enLecture', 'position', 'duree', 'volume', 'boucle', 'video', ...POSITION],
    son: ['son', 'enLecture', 'position', 'duree', 'volume', 'boucle'],
    minuteur: ['intervalle', 'active'],
    basedonnees: ['nombreFiches', 'champs', 'memoriser'],
    fichier: ['contenu', 'nomFichier', 'annule', 'nomPropose', 'typeFichier'],
    camera: ['allumee', 'mouvement', 'photo', 'miroir', 'seuilMouvement', ...POSITION],
    sprite: ['costume', 'nomCostume', 'sprite', 'vitesse', 'enAnimation', 'miroir', 'rotation', 'taille', 'transparence', 'collision', ...POSITION, 'direction', 'vitesseY']
  };
  // Propriétés que l'on peut lire mais pas modifier (absentes du bloc « mettre »).
  const LECTURE_SEULE = { arborescence: ['texte'], camera: ['photo', 'mouvement'], fichier: ['contenu', 'nomFichier', 'annule'], basedonnees: ['nombreFiches', 'champs'], onglets: ['texte'], tableau: ['texte', 'nombreLignes'], son: ['enLecture', 'duree'], video: ['enLecture', 'duree'], sprite: ['nomCostume', 'enAnimation'] };
  const LIBELLES_SPECIAUX = {
    listederoulante: { texte: 'élément choisi' },
    zoneliste: { texte: 'élément choisi' },
    boutonradio: { coche: 'sélectionné' },
    interrupteur: { coche: 'allumé' },
    onglets: { numero: 'n° de la page affichée', texte: 'titre de la page affichée', elements: 'titres des pages (liste)' },
    graphique: { texte: 'titre', couleurBarre: 'couleur des barres / de la courbe' },
    curseur: { couleurBarre: 'couleur du curseur' },
    cadre: { texte: 'titre' },
    tableau: { numero: 'n° de la ligne choisie', texte: 'ligne choisie (texte)' },
    date: { texte: 'date (jj/mm/aaaa)' },
    heure: { texte: 'heure (hh:mm)' },
    forme: { genre: 'forme (rectangle, arrondi, ovale, triangle ou ligne)', couleurFond: 'couleur de remplissage' },
    selecteurcouleur: { texte: 'couleur choisie' },
    minuteur: { active: 'en marche' },
    camera: { miroir: 'en miroir (comme dans une glace)' },
    arborescence: { texte: 'élément choisi', elements: 'tous les éléments (liste de chemins)' },
    barreetat: { texte: 'texte (cases séparées par |)' }
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

  const TYPES_CHANGE = ['zonetexte', 'casecocher', 'boutonradio', 'listederoulante', 'zoneliste',
    'curseur', 'selecteurnombre', 'tableau', 'date', 'heure', 'selecteurcouleur', 'navigateur', 'interrupteur', 'onglets', 'arborescence', 'panneau', 'barreprogression'];

  Blockly.Blocks['bs_quand_change'] = {
    init() {
      evenement(this, 'quand', TYPES_CHANGE, 'change');
      this.setTooltip("Exécuté quand on tape dans une zone de texte, coche une case, sélectionne un bouton radio, choisit dans une liste, change un nombre, une date ou une couleur, clique sur une ligne d'un tableau, sur une page d'onglets ou sur un élément d'une arborescence, ou quand un navigateur web a fini de charger une page, ou quand un panneau défilant défile, ou quand on clique sur une barre de progression « cliquable ».");
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

  Blockly.Blocks['bs_quand_fichier_depose'] = {
    init() {
      evenement(this, 'quand on dépose un fichier sur la fenêtre, avec', ['fichier']);
      this.setTooltip('Exécuté quand on fait glisser un fichier (depuis l\'Explorateur de Windows) sur la fenêtre du programme. Ensuite, « contenu du fichier » et « nom du fichier » le décrivent.');
    }
  };

  Blockly.Blocks['bs_quand_camera_mouvement'] = {
    init() {
      evenement(this, 'quand', ['camera'], 'voit bouger');
      this.setTooltip('Exécuté quand quelque chose bouge devant la caméra (au plus deux fois par seconde). Le « seuil de mouvement » (propriétés) règle la sensibilité : plus il est petit, plus la caméra réagit.');
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
    },
    onchange() { verifierImageDeFichier(this); }
  };

  // Le contenu d'un fichier lu comme du texte ne peut pas s'afficher dans une image : on prévient sur le bloc.
  function fichierLuEnTexte(bloc) {
    if (!bloc) return null;
    const contenu = (bloc.type === 'bs_lire' && bloc.getFieldValue('PROP') === 'contenu') || bloc.type === 'bs_fichier_contenu';
    if (!contenu) return null;
    const c = BlocStudio.controles().find(x => x.id === bloc.getFieldValue('CTRL'));
    return c && c.type === 'fichier' && !['image', 'tous'].includes(c.typeFichier || 'texte') ? c : null;
  }
  function verifierImageDeFichier(bloc) {
    if (bloc.isInFlyout || bloc.isDeadOrDying()) return;
    let texte = null;
    if (['image', 'texte'].includes(bloc.getFieldValue('PROP')) && typeDe(bloc.getFieldValue('CTRL')) === 'image') {
      const f = fichierLuEnTexte(bloc.getInputTargetBlock('VAL'));
      if (f) {
        texte = `« ${f.nom} » lit les fichiers comme du texte : l'image restera vide. Dans les propriétés de ${f.nom} ` +
          `(onglet Fenêtre, sous la fenêtre), choisissez « Type de fichier proposé : Image ». Ou plus simple : le bloc « ouvrir avec ${f.nom} un fichier dans … ».`;
      }
    }
    bloc.setWarningText(texte, 'fichier-image');
  }
  // Après un changement dans les propriétés (type de fichier…), l'éditeur revérifie tous les blocs.
  window.BlocStudioVerifier = ws => ws.getBlocksByType('bs_ecrire', false).forEach(verifierImageDeFichier);

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
        .appendField(new Blockly.FieldDropdown([...COULEURS.map(c => [c, c]), ['🎲 au hasard', 'hasard']]), 'COUL');
      this.setOutput(true, 'String');
      this.setColour(COULEUR_CONTROLES);
      this.setTooltip('Une couleur. On peut aussi écrire un code comme #ff8800. « 🎲 au hasard » : une couleur vive différente à chaque fois.');
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

  // ---------- Manette de jeu ----------

  const BOUTONS_MANETTE = [['A', 'a'], ['B', 'b'], ['X', 'x'], ['Y', 'y'],
    ['↑ croix (ou joystick gauche)', 'haut'], ['↓ croix (ou joystick gauche)', 'bas'],
    ['← croix (ou joystick gauche)', 'gauche'], ['→ croix (ou joystick gauche)', 'droite'],
    ['LB (gâchette haute gauche)', 'lb'], ['RB (gâchette haute droite)', 'rb'], ['LT (gâchette gauche)', 'lt'], ['RT (gâchette droite)', 'rt'],
    ['Start (menu)', 'start'], ['Select (vue)', 'select']];
  const champBoutonManette = () => new Blockly.FieldDropdown([['n\'importe quel bouton', 'toutes'], ...BOUTONS_MANETTE]);
  const COMME_CLAVIER = 'La croix et le joystick gauche font aussi les flèches du clavier, et le bouton A la touche Espace : ' +
    'un jeu prévu pour le clavier se joue déjà à la manette.';

  Blockly.Blocks['bs_quand_manette'] = {
    init() {
      this.appendDummyInput().appendField('quand le bouton').appendField(champBoutonManette(), 'BOUTON').appendField('de la manette est appuyé');
      this.appendStatementInput('DO');
      this.setColour(COULEUR_EVENEMENTS);
      this.hat = 'cap';
      this.setTooltip('Exécuté quand on appuie sur ce bouton d\'une manette de jeu (Xbox, PlayStation… branchée en USB ou en Bluetooth). ' +
        'Si la manette ne répond pas, appuyez une fois sur un de ses boutons : Windows ne la montre aux programmes qu\'ensuite. ' + COMME_CLAVIER);
    }
  };
  Blockly.Blocks['bs_manette_bouton'] = valeur(() => [
    'bouton', { champ: champBoutonManette(), nom: 'BOUTON' }, 'de la manette enfoncé ?'
  ], 'Boolean', COULEUR_ENTREES, 'Vrai tant que ce bouton de la manette est maintenu. ' + COMME_CLAVIER);
  Blockly.Blocks['bs_manette_joystick'] = valeur(() => [
    'joystick', { champ: new Blockly.FieldDropdown([['gauche ↔ (horizontal)', 'gx'], ['gauche ↕ (vertical)', 'gy'],
      ['droit ↔ (horizontal)', 'dx'], ['droit ↕ (vertical)', 'dy']]), nom: 'QUOI' }, 'de la manette'
  ], 'Number', COULEUR_ENTREES, 'Jusqu\'où le joystick est poussé, de -100 à 100 : ↔ -100 tout à gauche, 100 tout à droite ; ' +
    '↕ -100 tout en haut, 100 tout en bas ; 0 au repos. Pour avancer plus ou moins vite : « déplacer de x : joystick ÷ 10 ».');
  Blockly.Blocks['bs_manette_branchee'] = valeur(() => ['une manette est branchée ?'], 'Boolean', COULEUR_ENTREES,
    'Vrai si une manette de jeu est branchée (et qu\'on a déjà appuyé sur l\'un de ses boutons).');

  Blockly.Blocks['bs_se_touchent'] = valeur(() => [
    { champ: new Blockly.FieldDropdown(optionsControles(null, false, true)), nom: 'CTRL' }, 'touche',
    { champ: new Blockly.FieldDropdown(optionsControles(null, false, true)), nom: 'CTRL2' }, '?'
  ], 'Boolean', COULEUR_ENTREES, 'Vrai si les deux contrôles se chevauchent (et sont visibles). Parfait pour les jeux : le panier attrape-t-il la pièce ?');

  Blockly.Blocks['bs_cote_contact'] = valeur(() => [
    'de quel côté', { champ: new Blockly.FieldDropdown(optionsControles(null, false, true)), nom: 'CTRL' }, 'touche',
    { champ: new Blockly.FieldDropdown(optionsControles(null, false, true)), nom: 'CTRL2' }, '?'
  ], 'String', COULEUR_ENTREES, 'Pour les jeux de plateforme : « bas » s\'il est posé dessus, « haut » s\'il s\'y cogne la tête, « gauche » ou « droite » s\'il le touche par ce côté. Vide s\'ils ne se touchent pas.');
  Blockly.Blocks['bs_touche_couleur'] = valeur(() => [
    { champ: new Blockly.FieldDropdown(optionsControles(null, false, true)), nom: 'CTRL' }, 'touche la couleur',
    { nom: 'COUL' }, '?'
  ], 'Boolean', COULEUR_ENTREES, 'Vrai si une partie visible du contrôle est sur cette couleur : les murs d\'un labyrinthe dessiné, une flaque peinte dans une zone de dessin, une forme, une image…');

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

  Blockly.Blocks['bs_sprite_taille'] = instruction(() => [
    'mettre la taille de', SPRITE, { nom: 'VAL', libelle: 'à', check: 'Number' }, '%'
  ], COULEUR_SPRITES, 'Agrandit ou rétrécit le sprite autour de son centre : 100 % = taille normale, 200 % = deux fois plus grand, 50 % = moitié.');

  Blockly.Blocks['bs_sprite_grandir'] = instruction(() => [
    'changer la taille de', SPRITE, { nom: 'VAL', libelle: 'de', check: 'Number' }, '%'
  ], COULEUR_SPRITES, 'Ajoute ce nombre à la taille (un nombre négatif rétrécit). Dans une boucle, le sprite grossit petit à petit.');

  Blockly.Blocks['bs_sprite_transparence'] = instruction(() => [
    'mettre la transparence de', SPRITE, { nom: 'VAL', libelle: 'à', check: 'Number' }, '%'
  ], COULEUR_SPRITES, 'Rend le sprite plus ou moins transparent : 0 % = bien visible, 50 % = à moitié transparent (un fantôme !), 100 % = invisible.');

  Blockly.Blocks['bs_sprite_fondu'] = instruction(() => [
    'faire', { champ: new Blockly.FieldDropdown([['apparaître', 'apparaitre'], ['disparaître', 'disparaitre']]), nom: 'SENS' },
    SPRITE, { nom: 'SEC', libelle: 'en fondu pendant', check: 'Number' }, 'secondes'
  ], COULEUR_SPRITES, 'Montre ou cache le sprite en douceur ; le programme attend la fin du fondu. « disparaître » cache le sprite à la fin (comme « visible = faux »).');

  Blockly.Blocks['bs_sprite_changer'] = instruction(() => [
    'remplacer', SPRITE, 'par le sprite', { champ: new ChampSprite(), nom: 'SPRITE' }
  ], COULEUR_SPRITES, 'Affiche un autre sprite de la bibliothèque dans ce contrôle (en commençant par son premier costume).');

  Blockly.Blocks['bs_sprite_numero'] = valeur(() => ['n° du costume de', SPRITE], 'Number', COULEUR_SPRITES,
    'Le numéro du costume affiché (1 pour le premier).');

  // ---------- Fenêtres ----------

  const COULEUR_FENETRES = '#0e7490';

  // Les autres fenêtres du projet (désignées par leur identifiant, pour pouvoir les renommer).
  // `avecPrincipale` : la fenêtre principale est aussi proposée (identifiant '').
  class ChampFenetre extends Blockly.FieldDropdown {
    constructor(avecPrincipale) {
      super(function () {
        const options = BlocStudio.fenetres().map(f => ['🪟 ' + f.nom, f.id]);
        if (avecPrincipale) options.unshift(['🪟 principale', '']);
        else if (!options.length) options.push(['(aucune autre fenêtre)', '']);
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
  Blockly.Blocks['bs_fenetre_titre'] = instruction(() => ['mettre le titre de la fenêtre', { champ: new ChampFenetre(true), nom: 'FENETRE' }, { nom: 'VAL', libelle: 'à' }],
    COULEUR_FENETRES, 'Change le texte de la barre de titre de la fenêtre.');
  Blockly.Blocks['bs_fenetre_ouverte'] = valeur(() => ['la fenêtre', FENETRE(), 'est ouverte ?'], 'Boolean',
    COULEUR_FENETRES, 'Vrai si la fenêtre est affichée en ce moment.');

  // Taille des fenêtres (la principale comprise).
  const TOUTE_FENETRE = () => ({ champ: new ChampFenetre(true), nom: 'FENETRE' });
  Blockly.Blocks['bs_quand_fenetre_taille'] = {
    init() {
      this.appendDummyInput()
        .appendField('quand la fenêtre')
        .appendField(new ChampFenetre(true), 'FENETRE')
        .appendField('change de taille');
      this.appendStatementInput('DO');
      this.setColour(COULEUR_EVENEMENTS);
      this.hat = 'cap';
      this.setTooltip('Exécuté chaque fois que la fenêtre change de taille : quand on la tire par son bord (si elle est redimensionnable), quand on l\'agrandit, ou avec « changer la taille de la fenêtre ». Les contrôles suivent déjà leur ancrage ; ici, on peut faire le reste.');
    }
  };
  Blockly.Blocks['bs_fenetre_changer_taille'] = instruction(() => [
    'changer la taille de la fenêtre', TOUTE_FENETRE(), { nom: 'L', libelle: 'largeur', check: 'Number' }, { nom: 'H', libelle: 'hauteur', check: 'Number' }
  ], COULEUR_FENETRES, 'Donne une nouvelle taille (en pixels, sans la barre de titre ni les menus) à la fenêtre. Elle ne descend pas sous sa taille minimale ; les contrôles suivent leur ancrage.');
  Blockly.Blocks['bs_fenetre_dimension'] = valeur(() => [
    { champ: new Blockly.FieldDropdown([['largeur', 'largeur'], ['hauteur', 'hauteur']]), nom: 'QUOI' }, 'de la fenêtre', TOUTE_FENETRE()
  ], 'Number', COULEUR_FENETRES, 'La taille actuelle de la fenêtre en pixels (sans la barre de titre ni les menus).');

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
  Blockly.Blocks['bs_rebondir_sur'] = instruction(() => ['si', BOUGE, 'touche',
    { champ: new Blockly.FieldDropdown(optionsControles(null, false, true)), nom: 'CTRL2' }, ', rebondir',
    { champ: new Blockly.FieldDropdown([['normalement', 'normal'], ['en visant', 'viser']]), nom: 'MODE' }],
    COULEUR_MOUVEMENT, 'S\'il touche l\'autre contrôle, il repart dans l\'autre sens (comme sur un bord) et en est ressorti. ' +
    '« En visant » (casse-briques) : sur le dessus ou le dessous, il repart tout droit s\'il touche le milieu, et de plus en plus en biais vers les bouts. ' +
    'À mettre dans une boucle, après « avancer ».');
  Blockly.Blocks['bs_touche_bord'] = valeur(() => [BOUGE, 'touche un bord ?'], 'Boolean',
    COULEUR_MOUVEMENT, 'Vrai si le contrôle touche ou dépasse un bord de la fenêtre.');
  Blockly.Blocks['bs_distance'] = valeur(() => ['distance entre', BOUGE, 'et', { champ: champCible(false), nom: 'CIBLE' }], 'Number',
    COULEUR_MOUVEMENT, 'Distance en pixels entre le milieu du contrôle et la souris ou le milieu d\'un autre contrôle.');
  Blockly.Blocks['bs_direction'] = valeur(() => ['direction de', BOUGE], 'Number', COULEUR_MOUVEMENT, DIRECTIONS);

  // Gravité et saut (jeux de plateforme) : les contrôles « solides » font le sol, les plateformes et les murs.
  const SOLIDE = 'Cochez « Solide » dans les propriétés du sol, des plateformes et des murs (ou « mettre solide de … à vrai »).';
  Blockly.Blocks['bs_gravite'] = instruction(() => ['faire tomber', BOUGE, NB('FORCE', 'avec une gravité de'),
    { champ: new Blockly.FieldDropdown([['jusqu\'au bas de la fenêtre', 'bas'], ['et le laisser sortir par le bas', 'vide']]), nom: 'FOND' }],
    COULEUR_MOUVEMENT, 'À mettre dans une boucle (« répéter indéfiniment » avec « attendre 0.02 secondes ») : le contrôle tombe de plus en plus vite, ' +
    'se pose sur ce qui est solide, s\'y cogne la tête en sautant et ne traverse pas les murs. ' + SOLIDE + ' Gravité : 1 = normale, 0.5 = sur la Lune.');
  Blockly.Blocks['bs_sauter'] = instruction(() => ['faire sauter', BOUGE, NB('FORCE', 'avec une force de')],
    COULEUR_MOUVEMENT, 'Le contrôle s\'élance vers le haut, puis « faire tomber » le fait redescendre. Seulement s\'il est posé sur le sol (pas de saut en plein vol). ' +
    'Force 12 : un saut moyen ; plus grand = plus haut.');
  Blockly.Blocks['bs_au_sol'] = valeur(() => [BOUGE, 'est posé sur le sol ?'], 'Boolean',
    COULEUR_MOUVEMENT, 'Vrai si, au dernier « faire tomber », le contrôle s\'est posé sur quelque chose de solide (ou sur le bas de la fenêtre). ' +
    'Pratique pour changer de costume : en l\'air, il saute ; au sol, il marche.');

  Blockly.Blocks['bs_image_defiler'] = instruction(() => ['faire défiler l\'image de', { ctrl: ['image'] }, NB('DX', 'de x :'), NB('DY', 'y :')],
    COULEUR_MOUVEMENT, 'Un fond qui défile sans fin, pour un jeu de course ou de vaisseau : l\'image glisse dans son cadre et se répète. ' +
    'À mettre dans une boucle (avec « attendre 0.02 secondes ») : x négatif = vers la gauche, y positif = vers le bas. ' +
    'Le contrôle, lui, ne bouge pas. Astuce : une image « Étirée » qui remplit toute la fenêtre.');

  // ---------- Score et vies ----------

  Blockly.Blocks['bs_compteur_ajouter'] = instruction(() => [
    { nom: 'VAL', libelle: 'ajouter', check: 'Number' }, 'au nombre de', { ctrl: null, moi: true }
  ], COULEUR_CONTROLES, 'Pour un score, des vies, un niveau… Ajoute ce nombre (négatif pour enlever) au nombre écrit dans le contrôle : ' +
    'une étiquette « Score : 10 » devient « Score : 11 », le reste du texte ne change pas. ' +
    'Pour une barre de progression, un curseur ou un sélecteur de nombre : à sa valeur (une barre de vie !).');
  Blockly.Blocks['bs_compteur_valeur'] = valeur(() => ['nombre affiché par', { ctrl: null, moi: true }], 'Number',
    COULEUR_CONTROLES, 'Le nombre écrit dans le contrôle (12 pour « Score : 12 ») ; s\'il y en a plusieurs, le dernier. ' +
    'Pour une barre de progression, un curseur ou un sélecteur de nombre : sa valeur.');

  // ---------- Clones ----------

  const CLONABLES = ['sprite', 'image', 'etiquette', 'forme'];

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

  // Contrôles qui peuvent recevoir le curseur clavier.
  const FOCUSABLES = ['zonetexte', 'bouton', 'listederoulante', 'zoneliste', 'selecteurnombre', 'curseur', 'date', 'heure',
    'casecocher', 'boutonradio', 'interrupteur', 'selecteurcouleur'];
  Blockly.Blocks['bs_focus'] = instruction(() => ['placer le curseur clavier dans', { ctrl: FOCUSABLES }], COULEUR_CONTROLES,
    'Le clavier écrit désormais dans ce contrôle, sans avoir à cliquer dedans : pratique pour une zone de texte au démarrage, ou après « Effacer ». Pour un bouton, Entrée ou Espace le clique.');

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

  // ---------- Contrôle Fichier ----------

  const COULEUR_FICHIERS = '#a16207'; // comme la catégorie Mémoire, où ces blocs sont rangés
  const FICHIER = { ctrl: ['fichier'] };

  Blockly.Blocks['bs_fichier_ouvrir_avec'] = instruction(() => ['ouvrir un fichier avec', FICHIER], COULEUR_FICHIERS,
    'Montre la fenêtre « Ouvrir » de Windows ; le programme attend le choix. Ensuite : « contenu du fichier » (un texte, une image pour un contrôle Image, ou un son pour un contrôle Son), « nom du fichier », ou « annulé ? » si l\'utilisateur a fermé la fenêtre sans choisir.');

  Blockly.Blocks['bs_fichier_enregistrer_avec'] = instruction(() => [
    { nom: 'VAL', libelle: 'enregistrer le texte' }, 'avec', FICHIER
  ], COULEUR_FICHIERS, 'Montre la fenêtre « Enregistrer sous » de Windows, avec le nom proposé dans les propriétés du contrôle (ou celui du fichier ouvert).');

  Blockly.Blocks['bs_fichier_ouvrir_dans'] = instruction(() => [
    'ouvrir avec', FICHIER, 'un fichier dans', { ctrl: ['tableau', 'basedonnees', 'image', 'zonedessin', 'son'], nom: 'CIBLE' }
  ], COULEUR_FICHIERS, 'Raccourci : un fichier CSV (Excel) remplit un tableau ou une base de données ; une image s\'affiche dans un contrôle Image ou une zone de dessin ; un son (MP3, WAV…) va dans un contrôle Son, prêt à jouer.');

  Blockly.Blocks['bs_fichier_enregistrer_de'] = instruction(() => [
    'enregistrer', { ctrl: ['tableau', 'basedonnees', 'zonedessin', 'camera'], nom: 'CIBLE' }, 'dans un fichier avec', FICHIER
  ], COULEUR_FICHIERS, 'Raccourci : un tableau ou une base de données devient un fichier CSV (lisible par Excel), une zone de dessin ou la dernière photo d\'une caméra une image PNG.');

  // ---------- Caméra ----------

  const CAMERA = { ctrl: ['camera'] };

  Blockly.Blocks['bs_camera_ctrl'] = instruction(() => [
    { champ: new Blockly.FieldDropdown([['allumer', 'allumer'], ['éteindre', 'eteindre']]), nom: 'ACTION' },
    'la caméra', CAMERA
  ], COULEUR_CONTROLES, 'Allume ou éteint la webcam. La première fois, Windows (ou le navigateur) demande la permission. Par défaut, la caméra s\'allume toute seule au démarrage (voir ses propriétés).');

  Blockly.Blocks['bs_camera_photo'] = instruction(() => ['prendre une photo avec', CAMERA], COULEUR_CONTROLES,
    'Garde l\'image que la caméra voit en ce moment, cadrée comme à l\'écran. Ensuite : « mettre la photo de… dans… », ou « enregistrer … dans un fichier » avec un contrôle Fichier.');

  Blockly.Blocks['bs_camera_photo_dans'] = instruction(() => [
    'mettre la photo de', CAMERA, 'dans', { ctrl: ['image', 'zonedessin'], nom: 'CIBLE' }
  ], COULEUR_CONTROLES, 'Affiche la dernière photo dans un contrôle Image, ou la dessine dans une zone de dessin (on peut ensuite dessiner par-dessus).');

  Blockly.Blocks['bs_fichier_contenu'] = valeur(() => ['contenu du fichier de', FICHIER], null, COULEUR_FICHIERS,
    'Le texte du dernier fichier ouvert ou déposé (pour le type « Image » : l\'image, à mettre dans un contrôle Image).');

  Blockly.Blocks['bs_fichier_nom'] = valeur(() => ['nom du fichier de', FICHIER], 'String', COULEUR_FICHIERS,
    'Le nom du dernier fichier ouvert, enregistré ou déposé (par exemple « mes notes.txt »).');

  Blockly.Blocks['bs_fichier_annule'] = valeur(() => [FICHIER, ': annulé par l\'utilisateur ?'], 'Boolean', COULEUR_FICHIERS,
    'Vrai si, la dernière fois, l\'utilisateur a fermé la fenêtre « Ouvrir » ou « Enregistrer sous » sans choisir de fichier.');

  // ---------- Base de données ----------

  const COULEUR_BASE = '#b45309';
  const BASE = { ctrl: ['basedonnees'] };
  const champsDeBase = id => (BlocStudio.controles().find(c => c.id === id && c.type === 'basedonnees') || {}).champs || [];
  const OPERATIONS = [['=', 'egal'], ['≠', 'different'], ['contient', 'contient'], ['commence par', 'commence'],
    ['<', 'inferieur'], ['>', 'superieur'], ['≤', 'infegal'], ['≥', 'supegal']];

  // Liste des champs de la base choisie dans le même bloc. Accepte tout nom
  // (un champ renommé reste affiché au lieu d'être perdu).
  class ChampNomChamp extends Blockly.FieldDropdown {
    constructor() {
      super(function () {
        const bloc = this.getSourceBlock();
        const options = (bloc ? champsDeBase(bloc.getFieldValue('CTRL')) : []).map(c => [c, c]);
        const v = this.getValue();
        if (v && !options.some(o => o[1] === v)) options.push([v, v]);
        return options.length ? options : [['(aucun champ)', '']];
      });
    }
    doClassValidation_(v) { return typeof v === 'string' ? v : null; }
    doValueUpdate_(v) {
      this.generatedOptions = null;
      super.doValueUpdate_(v);
    }
  }

  // Quand on choisit une autre base, le champ choisi doit en faire partie.
  function suivreBase(bloc) {
    bloc.getField('CTRL').setValidator(function (id) {
      const champ = this.getSourceBlock().getField('CHAMP');
      const champs = champsDeBase(id);
      if (champ && champs.length && !champs.includes(champ.getValue())) champ.setValue(champs[0]);
      return id;
    });
    const champ = bloc.getField('CHAMP');
    if (champ && !champ.getValue()) champ.setValue(champsDeBase(bloc.getFieldValue('CTRL'))[0] || '');
  }
  const instructionBase = (morceaux, tooltip) => {
    const def = instruction(morceaux, COULEUR_BASE, tooltip);
    const init = def.init;
    def.init = function () { init.call(this); suivreBase(this); };
    return def;
  };
  const valeurBase = (morceaux, sortie, tooltip) => {
    const def = valeur(morceaux, sortie, COULEUR_BASE, tooltip);
    const init = def.init;
    def.init = function () { init.call(this); suivreBase(this); };
    return def;
  };
  const CHAMP = () => ({ champ: new ChampNomChamp(), nom: 'CHAMP' });
  const OPERATION = () => ({ champ: new Blockly.FieldDropdown(OPERATIONS), nom: 'OP' });

  // « ajouter une fiche » : une entrée par champ de la base choisie.
  Blockly.Blocks['bs_base_ajouter'] = {
    init() {
      this.appendDummyInput('TETE').appendField('ajouter une fiche à')
        .appendField(new Blockly.FieldDropdown(optionsControles(['basedonnees']), id => {
          this.majChamps(champsDeBase(id));
          return id;
        }), 'CTRL');
      this.champs = [];
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(COULEUR_BASE);
      this.setTooltip('Ajoute une fiche à la fin de la base : une valeur pour chaque champ (un champ laissé vide reste vide).');
      this.majChamps(champsDeBase(this.getFieldValue('CTRL')));
    },
    saveExtraState() { return { champs: this.champs.slice() }; },
    loadExtraState(etat) { this.majChamps((etat && etat.champs) || []); },
    // Refait les entrées en gardant les blocs branchés (retrouvés par le nom du champ).
    majChamps(noms) {
      if (JSON.stringify(noms) === JSON.stringify(this.champs)) return;
      const branches = this.champs.map((nom, i) => {
        const entree = this.getInput('V' + i);
        const cible = entree && entree.connection.targetBlock();
        if (cible && !cible.isShadow()) entree.connection.disconnect();
        return { nom, cible: cible && !cible.isShadow() ? cible : null };
      });
      this.champs.forEach((_, i) => this.removeInput('V' + i, true));
      this.champs = noms.slice();
      const restants = branches.filter(b => b.cible && !noms.includes(b.nom));
      noms.forEach((nom, i) => {
        const entree = this.appendValueInput('V' + i).setAlign(Blockly.inputs.Align.RIGHT).appendField(nom);
        const trouve = branches.find(b => b.nom === nom && b.cible) || restants.shift();
        if (trouve && trouve.cible) entree.connection.connect(trouve.cible.outputConnection);
        else entree.connection.setShadowState({ type: 'text', fields: { TEXT: '' } });
      });
    }
  };

  Blockly.Blocks['bs_base_modifier'] = instructionBase(() => [
    'dans', BASE, 'mettre le champ', CHAMP(), { nom: 'N', libelle: 'de la fiche n°', check: 'Number' }, { nom: 'VAL', libelle: 'à' }
  ], 'Change une valeur d\'une fiche. Le n° de fiche vient par exemple de « n° de la fiche choisie dans Tableau » ou d\'une recherche.');

  Blockly.Blocks['bs_base_supprimer'] = instructionBase(() => [
    { nom: 'N', libelle: 'supprimer la fiche n°', check: 'Number' }, 'de', BASE
  ], 'Enlève une fiche de la base. Les fiches suivantes prennent un numéro de moins.');

  Blockly.Blocks['bs_base_vider'] = instructionBase(() => ['effacer toutes les fiches de', BASE],
    'Enlève toutes les fiches de la base (attention : elles sont perdues).');

  Blockly.Blocks['bs_base_trier'] = instructionBase(() => [
    'trier', BASE, 'par', CHAMP(),
    { champ: new Blockly.FieldDropdown([['croissant (A → Z, 1 → 9)', 'croissant'], ['décroissant (Z → A, 9 → 1)', 'decroissant']]), nom: 'SENS' }
  ], 'Range les fiches de la base selon un champ. Les numéros des fiches changent.');

  Blockly.Blocks['bs_base_afficher'] = instructionBase(() => [
    'afficher les fiches de', BASE, 'dans le tableau', { ctrl: ['tableau'], nom: 'TAB' },
    { nom: 'NUMS', libelle: 'seulement les n° (liste, facultatif)' }
  ], 'Montre les fiches dans un Tableau, avec un titre de colonne par champ. Sans liste de n°, le tableau montre toutes les fiches et se met à jour tout seul. Avec une liste (le résultat d\'une recherche), il ne montre que ces fiches.');

  Blockly.Blocks['bs_base_remplir'] = instructionBase(() => [
    'remplir', BASE, { nom: 'VAL', libelle: 'avec le texte CSV' }
  ], 'Remplace toutes les fiches par celles d\'un texte CSV (une fiche par ligne, valeurs séparées par ;). Avec « texte d\'un fichier choisi », on peut importer un fichier Excel enregistré en CSV.');

  Blockly.Blocks['bs_base_champ'] = valeurBase(() => [
    CHAMP(), { nom: 'N', libelle: 'de la fiche n°', check: 'Number' }, 'de', BASE
  ], null, 'La valeur d\'un champ d\'une fiche.');

  Blockly.Blocks['bs_base_nombre'] = valeurBase(() => ['nombre de fiches de', BASE], 'Number',
    'Combien de fiches contient la base.');

  Blockly.Blocks['bs_base_chercher'] = valeurBase(() => [
    'n° des fiches de', BASE, 'où', CHAMP(), OPERATION(), { nom: 'VAL', libelle: '' }
  ], 'Array', 'Cherche les fiches qui correspondent : donne la liste de leurs numéros (vide si aucune). Les majuscules et les accents ne comptent pas. Pour les montrer : « afficher … seulement les n° ».');

  Blockly.Blocks['bs_base_premiere'] = valeurBase(() => [
    'n° de la première fiche de', BASE, 'où', CHAMP(), OPERATION(), { nom: 'VAL', libelle: '' }
  ], 'Number', 'Le numéro de la première fiche qui correspond, ou 0 s\'il n\'y en a aucune.');

  Blockly.Blocks['bs_base_colonne'] = valeurBase(() => ['toutes les valeurs du champ', CHAMP(), 'de', BASE], 'Array',
    'La liste des valeurs d\'un champ, fiche par fiche. Avec les blocs de Maths (« somme », « moyenne » d\'une liste), on calcule des totaux.');

  Blockly.Blocks['bs_base_csv'] = valeurBase(() => ['contenu de', BASE, 'en texte (CSV)'], 'String',
    'Toutes les fiches en texte CSV (la première ligne donne les champs) : à enregistrer dans un fichier, lisible par Excel.');

  Blockly.Blocks['bs_base_choisie'] = valeur(() => ['n° de la fiche choisie dans', { ctrl: ['tableau'] }], 'Number',
    COULEUR_BASE, 'Le numéro (dans la base) de la fiche sur laquelle on a cliqué dans le tableau, ou 0 si aucune ligne n\'est choisie.');

  // Après un changement des champs d'une base dans l'éditeur.
  window.BlocStudioBases = {
    rafraichir(espace) {
      for (const b of espace.getBlocksByType('bs_base_ajouter', false)) b.majChamps(champsDeBase(b.getFieldValue('CTRL')));
    }
  };

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

  // ---------- Menus contextuels et barres d'outils ----------

  // Les éléments d'un menu contextuel ou les boutons d'une barre d'outils, selon le contrôle choisi dans le bloc.
  class ChampElementDe extends Blockly.FieldDropdown {
    constructor(lireElements) {
      super(function () {
        const bloc = this.getSourceBlock();
        const c = bloc && BlocStudio.controles().find(x => x.id === bloc.getFieldValue('CTRL'));
        const options = c ? lireElements(c).map(e => [e, e]) : [];
        const v = this.getValue();
        if (v && !options.some(o => o[1] === v)) options.push([v, v]);
        if (!options.length) options.push(['(aucun élément)', '']);
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
  const ELEMENT_MENU = () => ({ champ: new ChampElementDe(c => BlocRuntime.elementsMenuContextuel(c.menu)), nom: 'ITEM' });
  const BOUTON_OUTIL = () => ({ champ: new ChampElementDe(c => BlocRuntime.elementsBarreOutils(c.boutons)), nom: 'ITEM' });
  const MENU_CTX = { ctrl: ['menucontextuel'] };
  const OUTILS = { ctrl: ['barreoutils'] };

  // Bloc « quand… » avec un contrôle (CTRL) et un de ses éléments (ITEM).
  function chapeauElement(avant, champElement, entre, types, tooltip) {
    return {
      init() {
        this.appendDummyInput()
          .appendField(avant).appendField(champElement().champ, 'ITEM')
          .appendField(entre).appendField(new Blockly.FieldDropdown(optionsControles(types)), 'CTRL');
        this.appendStatementInput('DO');
        this.setColour(COULEUR_EVENEMENTS);
        this.hat = 'cap';
        this.setTooltip(tooltip);
      }
    };
  }

  Blockly.Blocks['bs_quand_menu_contextuel'] = chapeauElement('quand on choisit', ELEMENT_MENU, 'dans', ['menucontextuel'],
    'Exécuté quand on choisit cet élément dans le menu qui s\'ouvre au clic droit. « nom du contrôle où … a été ouvert » dit sur quel contrôle on avait cliqué.');
  Blockly.Blocks['bs_menu_contextuel_source'] = valeur(() => ['nom du contrôle où', MENU_CTX, 'a été ouvert'], 'String', COULEUR_CONTROLES,
    'Le nom du contrôle sur lequel on a fait le clic droit (ou celui de la fenêtre). Utile quand plusieurs contrôles partagent le même menu.');
  Blockly.Blocks['bs_menu_contextuel_actif'] = instruction(() => [
    { champ: new Blockly.FieldDropdown([['activer', 'TRUE'], ['désactiver', 'FALSE']]), nom: 'ACTIF' },
    'l\'élément', ELEMENT_MENU(), 'de', MENU_CTX
  ], COULEUR_CONTROLES, 'Un élément désactivé est grisé : on ne peut plus le choisir.');
  Blockly.Blocks['bs_menu_contextuel_montrer'] = instruction(() => ['montrer le menu', MENU_CTX, 'à la souris'], COULEUR_CONTROLES,
    'Ouvre le menu là où se trouve la souris, sans clic droit : par exemple quand on clique sur un bouton « ⋯ ».');

  Blockly.Blocks['bs_quand_outil'] = chapeauElement('quand on clique sur', BOUTON_OUTIL, 'dans', ['barreoutils'],
    'Exécuté quand on clique sur ce bouton de la barre d\'outils.');
  Blockly.Blocks['bs_outil_actif'] = instruction(() => [
    { champ: new Blockly.FieldDropdown([['activer', 'TRUE'], ['désactiver', 'FALSE']]), nom: 'ACTIF' },
    'le bouton', BOUTON_OUTIL(), 'de', OUTILS
  ], COULEUR_CONTROLES, 'Un bouton désactivé est grisé : on ne peut plus cliquer dessus.');

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

  // ---------- Arborescence et barre d'état ----------

  const ARBRE = { ctrl: ['arborescence'] };
  const AIDE_CHEMIN = ' Un élément se désigne par son chemin : « Animaux › Chats » (ou « Animaux > Chats »).';

  Blockly.Blocks['bs_arbre_ajouter'] = instruction(() => [
    { nom: 'VAL', libelle: 'ajouter l\'élément' }, { nom: 'DANS', libelle: 'dans' }, 'de', ARBRE
  ], COULEUR_CONTROLES, 'Ajoute un élément, rangé dans un autre (laissez « dans » vide pour le premier niveau).' + AIDE_CHEMIN);

  Blockly.Blocks['bs_arbre_supprimer'] = instruction(() => [
    { nom: 'CHEMIN', libelle: 'supprimer l\'élément' }, 'de', ARBRE
  ], COULEUR_CONTROLES, 'Supprime un élément, avec tout ce qui est rangé dedans.' + AIDE_CHEMIN);

  Blockly.Blocks['bs_arbre_ctrl'] = instruction(() => [
    { champ: new Blockly.FieldDropdown([['tout déplier', 'deplier'], ['tout replier', 'replier'], ['vider', 'vider']]), nom: 'ACTION' },
    ARBRE
  ], COULEUR_CONTROLES, 'Ouvre ou ferme tous les dossiers de l\'arborescence, ou la vide.');

  Blockly.Blocks['bs_arbre_enfants'] = valeur(() => [
    { nom: 'CHEMIN', libelle: 'éléments rangés dans' }, 'de', ARBRE
  ], 'Array', COULEUR_CONTROLES, 'La liste des textes des éléments rangés directement dans celui-ci (vide = ceux du premier niveau).' + AIDE_CHEMIN);

  const BARRE_ETAT = { ctrl: ['barreetat'] };

  Blockly.Blocks['bs_barreetat_ecrire'] = instruction(() => [
    { nom: 'VAL', libelle: 'écrire' }, { nom: 'NUM', libelle: 'dans la case n°', check: 'Number' }, 'de', BARRE_ETAT
  ], COULEUR_CONTROLES, 'Change le texte d\'une case de la barre d\'état (1 = la plus large, à gauche). Les cases manquantes sont ajoutées.');

  Blockly.Blocks['bs_barreetat_case'] = valeur(() => [
    { nom: 'NUM', libelle: 'texte de la case n°', check: 'Number' }, 'de', BARRE_ETAT
  ], 'String', COULEUR_CONTROLES, 'Le texte d\'une case de la barre d\'état.');

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

  // ---------- Panneau défilant ----------

  const PANNEAU = { ctrl: ['panneau'] };
  Blockly.Blocks['bs_panneau_defiler'] = instruction(() => [
    '📜 faire défiler', PANNEAU,
    { champ: new Blockly.FieldDropdown([['tout en bas', 'bas'], ['tout en haut', 'haut'], ['tout à gauche', 'gauche'], ['tout à droite', 'droite']]), nom: 'QUOI' }
  ], COULEUR_CONTROLES, 'Fait défiler le panneau jusqu\'au bout. « tout en bas » : idéal après avoir ajouté un message ou une ligne.');
  Blockly.Blocks['bs_panneau_montrer'] = instruction(() => ['📜 faire défiler', PANNEAU, 'pour montrer', { ctrl: null, nom: 'CIBLE' }],
    COULEUR_CONTROLES, 'Fait défiler le panneau juste ce qu\'il faut pour qu\'on voie ce contrôle en entier (il doit être posé dans le panneau).');

  // ---------- Windows : presse-papiers, impression, notifications ----------

  const COULEUR_WINDOWS = '#475569';
  const AVEC_IMAGE = ['zonedessin', 'image', 'graphique', 'camera'];

  Blockly.Blocks['bs_copier'] = instruction(() => [{ nom: 'VAL', libelle: '📋 copier' }, 'dans le presse-papiers'],
    COULEUR_WINDOWS, 'Comme Ctrl+C : le texte peut ensuite être collé (Ctrl+V) dans n\'importe quel logiciel.');
  Blockly.Blocks['bs_copier_image'] = instruction(() => ['📋 copier l\'image de', { ctrl: AVEC_IMAGE }, 'dans le presse-papiers'],
    COULEUR_WINDOWS, 'Copie le dessin, l\'image, le graphique ou l\'image de la caméra : on peut ensuite la coller dans Paint, Word, un e-mail…');
  Blockly.Blocks['bs_presse_papiers'] = valeur(() => ['📋 texte du presse-papiers'], 'String',
    COULEUR_WINDOWS, 'Le texte copié en dernier (Ctrl+C), dans ce programme ou dans un autre logiciel. Vide s\'il n\'y a pas de texte.');

  Blockly.Blocks['bs_imprimer_texte'] = instruction(() => [{ nom: 'VAL', libelle: '🖨️ imprimer le texte' }],
    COULEUR_WINDOWS, 'Ouvre la boîte « Imprimer » de Windows avec ce texte. On peut aussi y choisir « Enregistrer au format PDF ».');
  Blockly.Blocks['bs_imprimer'] = instruction(() => ['🖨️ imprimer', { ctrl: null }],
    COULEUR_WINDOWS, 'Imprime un contrôle : tout le texte d\'une zone de texte, tout un tableau, un dessin, une image, un graphique… Le programme attend que la boîte « Imprimer » soit fermée.');
  Blockly.Blocks['bs_imprimer_fenetre'] = instruction(() => ['🖨️ imprimer la fenêtre', { champ: new ChampFenetre(true), nom: 'FENETRE' }],
    COULEUR_WINDOWS, 'Imprime la fenêtre telle qu\'on la voit (réduite si elle est plus large que la feuille).');

  Blockly.Blocks['bs_notification'] = instruction(() => [
    { nom: 'TITRE', libelle: '🔔 notification' },
    { nom: 'VAL', libelle: 'message' },
    { champ: new Blockly.FieldDropdown([['ℹ️ information', 'info'], ['⚠️ avertissement', 'avertissement'], ['❌ erreur', 'erreur'], ['sans icône', 'aucune']]), nom: 'ICONE' }
  ], COULEUR_WINDOWS, 'Affiche une notification de Windows en bas à droite de l\'écran, même si la fenêtre du programme est cachée ou réduite. Un clic dessus ramène le programme devant.');

  // ---------- Internet ----------

  const COULEUR_INTERNET = '#0369a1';
  Blockly.Blocks['bs_meteo'] = valeur(() => [
    { nom: 'VAL', libelle: '☀️ météo à' }, ':',
    { champ: new Blockly.FieldDropdown([['température (°C)', 'temperature'], ['température ressentie (°C)', 'ressenti'],
      ['temps qu\'il fait (texte)', 'description'], ['temps qu\'il fait (emoji)', 'emoji'], ['vent (km/h)', 'vent'],
      ['humidité (%)', 'humidite'], ['maximum du jour (°C)', 'max'], ['minimum du jour (°C)', 'min'], ['nom de la ville trouvée', 'ville'], ['ville trouvée ? (vrai ou faux)', 'trouvee']]), nom: 'QUOI' }
  ], null, COULEUR_INTERNET, 'La météo en ce moment dans cette ville (service Open-Meteo, gratuit). Il faut une connexion à Internet ; le programme attend la réponse.');
  Blockly.Blocks['bs_web_lire'] = valeur(() => [{ nom: 'VAL', libelle: '🌐 lire les données de' }], 'String', COULEUR_INTERNET,
    'Le contenu d\'une adresse Internet (souvent des données au format JSON). Le programme attend la réponse. Ensuite : « valeur … dans les données ».');
  Blockly.Blocks['bs_web_ouvrir'] = instruction(() => [{ nom: 'VAL', libelle: '🌐 ouvrir' }, 'dans le navigateur de l\'ordinateur'],
    COULEUR_INTERNET, 'Ouvre la page dans Edge, Chrome… (le navigateur habituel), en dehors du programme : pour Google, Facebook et les sites qui refusent de s\'afficher dans un Navigateur web.');
  Blockly.Blocks['bs_json_valeur'] = valeur(() => [
    { nom: 'CHEMIN', libelle: '🌐 valeur' }, { nom: 'VAL', libelle: 'dans les données' }
  ], null, COULEUR_INTERNET, 'Une information dans des données JSON, désignée par son chemin : « current.temperature_2m », ou « results.1.name » (les numéros de liste commencent à 1). Vide si elle n\'existe pas.');

  // ---------- Conversions ----------

  const COULEUR_CONVERSIONS = '#0f766e';
  const UNITES_TEMPS = [['secondes', 'secondes'], ['minutes', 'minutes'], ['heures', 'heures'], ['jours', 'jours'],
    ['semaines', 'semaines'], ['millisecondes', 'millisecondes']];
  const UNITES_DISTANCE = [['mètres', 'metres'], ['centimètres', 'centimetres'], ['millimètres', 'millimetres'],
    ['kilomètres', 'kilometres'], ['pouces', 'pouces'], ['pieds', 'pieds'], ['miles', 'miles']];
  const UNITES_MASSE = [['grammes', 'grammes'], ['kilogrammes', 'kilogrammes'], ['milligrammes', 'milligrammes'],
    ['tonnes', 'tonnes'], ['livres (lb)', 'livres'], ['onces (oz)', 'onces']];
  const UNITES_VOLUME = [['litres', 'litres'], ['millilitres', 'millilitres'], ['centilitres', 'centilitres'], ['décilitres', 'decilitres'],
    ['mètres cubes', 'metrescubes'], ['cuillères à café', 'cuillerescafe'], ['cuillères à soupe', 'cuillerescsoupe'], ['gallons (US)', 'gallons']];
  const UNITES_TEMPERATURE = [['°C (Celsius)', 'celsius'], ['°F (Fahrenheit)', 'fahrenheit'], ['K (kelvins)', 'kelvin']];
  // « convertir [n] [unité] en [unité] » : la seconde liste propose d'abord une autre unité que la première.
  const blocConvertir = (unites, tooltip) => valeur(() => [
    { nom: 'VAL', libelle: '🔁 convertir', check: 'Number' },
    { champ: new Blockly.FieldDropdown(unites), nom: 'DE' }, 'en',
    { champ: new Blockly.FieldDropdown([unites[1], unites[0], ...unites.slice(2)]), nom: 'VERS' }
  ], 'Number', COULEUR_CONVERSIONS, tooltip);
  Blockly.Blocks['bs_convertir_temps'] = blocConvertir(UNITES_TEMPS, 'Par exemple 90 secondes = 1,5 minute ; 2 heures = 120 minutes.');
  Blockly.Blocks['bs_convertir_distance'] = blocConvertir(UNITES_DISTANCE, 'Par exemple 1,5 kilomètre = 1500 mètres ; 1 pouce = 2,54 centimètres ; 1 mile = 1,609 kilomètre.');
  Blockly.Blocks['bs_convertir_masse'] = blocConvertir(UNITES_MASSE, 'Par exemple 1,5 kilogramme = 1500 grammes ; 1 livre ≈ 453,6 grammes ; 1 tonne = 1000 kilogrammes.');
  Blockly.Blocks['bs_convertir_volume'] = blocConvertir(UNITES_VOLUME, 'Par exemple 1 litre = 1000 millilitres = 100 centilitres ; une cuillère à café = 5 mL, à soupe = 15 mL ; 1 gallon US ≈ 3,785 litres.');
  Blockly.Blocks['bs_convertir_temperature'] = blocConvertir(UNITES_TEMPERATURE, 'Par exemple 20 °C = 68 °F ; 0 °C = 273,15 K ; 100 °F ≈ 37,8 °C.');
  Blockly.Blocks['bs_temps_texte'] = valeur(() => [
    { nom: 'VAL', libelle: '⏱️', check: 'Number' }, 'secondes en',
    { champ: new Blockly.FieldDropdown([['« m:ss » (3:33)', 'm:ss'], ['« h:mm:ss » (0:03:33)', 'h:mm:ss']]), nom: 'FORMAT' }
  ], 'String', COULEUR_CONVERSIONS, 'Un temps en secondes écrit comme sur un lecteur de musique ou un chronomètre : 213 → « 3:33 », 65 → « 1:05 ». Au-delà d\'une heure, les heures s\'ajoutent : « 1:02:05 ».');
  Blockly.Blocks['bs_temps_secondes'] = valeur(() => [{ nom: 'VAL', libelle: '⏱️ le temps' }, 'en secondes'], 'Number',
    COULEUR_CONVERSIONS, 'L\'inverse : « 3:33 » → 213 ; « 1:02:05 » → 3725 ; un simple nombre reste un nombre de secondes.');

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

  Blockly.Blocks['bs_format_nombre'] = {
    init() {
      this.appendValueInput('VAL').setCheck(['Number', 'String']);
      this.appendValueInput('DEC').setCheck('Number').appendField('écrit avec');
      this.appendDummyInput().appendField('chiffres après la virgule');
      this.setInputsInline(true);
      this.setOutput(true, 'String');
      this.setStyle('text_blocks');
      this.setTooltip('Le nombre écrit à la française, arrondi : 3.14159 avec 2 chiffres donne « 3,14 », 12.5 donne « 12,50 », ' +
        '1234567 avec 0 chiffre donne « 1 234 567 ». Pour un prix : « créer un texte avec » ce nombre et « € ». ' +
        '« nombre depuis » sait le relire pour calculer.');
    }
  };

  Blockly.Blocks['bs_texte_repete'] = {
    init() {
      this.appendValueInput('VAL');
      this.appendValueInput('FOIS').setCheck('Number').appendField('répété');
      this.appendDummyInput().appendField('fois');
      this.setInputsInline(true);
      this.setOutput(true, 'String');
      this.setStyle('text_blocks');
      this.setTooltip('Le texte écrit plusieurs fois de suite : « ❤️ » répété 3 fois donne « ❤️❤️❤️ ». Idéal pour montrer les vies qui restent.');
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

  Blockly.Blocks['bs_liste_melanger'] = {
    init() {
      this.appendValueInput('VAL').appendField('mélanger');
      this.setOutput(true, 'Array');
      this.setStyle('list_blocks');
      this.setTooltip('Une copie de la liste, dans un ordre au hasard (la liste elle-même ne change pas) : ' +
        'pour battre des cartes, poser les questions d\'un quiz dans le désordre… Avec un texte, ce sont ses lettres qui sont mélangées.');
    }
  };

  Blockly.Blocks['bs_chance'] = {
    init() {
      this.appendValueInput('VAL').setCheck('Number').appendField('au hasard, avec');
      this.appendDummyInput().appendField('% de chances ?');
      this.setInputsInline(true);
      this.setOutput(true, 'Boolean');
      this.setStyle('math_blocks');
      this.setTooltip('Vrai ou faux, au hasard : 50 % = pile ou face, 10 % = une fois sur dix environ, 100 % = toujours. ' +
        'Dans un « si » : « si au hasard, avec 5 % de chances, faire apparaître un bonus ».');
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

  // ---------- Bloc « si » : des boutons sur le bloc ----------
  // À la place de la petite roue de Blockly (une bulle où il fallait faire glisser « sinon si » dans « si ») :
  // « ＋ sinon si » et « ＋ sinon » en bas du bloc, et un « − » sur chaque partie pour l'enlever.
  const HAUTEUR_BOUTON_SI = 22;
  const boutonSi = (texte, largeur, taille = 13) => 'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${largeur}" height="${HAUTEUR_BOUTON_SI}">` +
    `<rect x=".75" y=".75" width="${largeur - 1.5}" height="${HAUTEUR_BOUTON_SI - 1.5}" rx="${HAUTEUR_BOUTON_SI / 2 - 1}" fill="#ffffff" fill-opacity=".3" stroke="#ffffff" stroke-width="1.5"/>` +
    `<text x="${largeur / 2}" y="${HAUTEUR_BOUTON_SI / 2 + taille * 0.36}" font-family="Segoe UI, sans-serif" font-size="${taille}" font-weight="700" fill="#ffffff" text-anchor="middle">${texte}</text></svg>`);
  const IMAGE_PLUS_SINON_SI = boutonSi('＋ sinon si', 88), IMAGE_PLUS_SINON = boutonSi('＋ sinon', 68), IMAGE_MOINS = boutonSi('−', 24, 17);
  const etatSi = b => { const s = b.saveExtraState && b.saveExtraState(true); return s ? JSON.stringify(s) : ''; };

  // Un changement de forme fait par un bouton : un seul « Ctrl+Z » l'annule, avec ce qu'il a déplacé.
  function changerForme(bloc, changer) {
    if (bloc.isInFlyout || !bloc.workspace || bloc.workspace.options.readOnly) return;
    const avant = etatSi(bloc);
    const groupe = Blockly.Events.getGroup(); // dans un clic de Blockly, un groupe est peut-être déjà ouvert
    if (!groupe) Blockly.Events.setGroup(true);
    try {
      const laches = changer() || [];
      Blockly.Events.fire(new Blockly.Events.BlockChange(bloc, 'mutation', null, avant, etatSi(bloc)));
      // Les blocs d'une partie enlevée ne sont pas perdus : ils restent à côté, détachés.
      for (const b of laches) if (b && !b.isDisposed() && !b.getParent()) b.moveBy(40, 30);
    } finally {
      if (!groupe) Blockly.Events.setGroup(false);
    }
  }
  const boutonBloc = (image, largeur, aide, action) => {
    const f = new Blockly.FieldImage(image, largeur, HAUTEUR_BOUTON_SI, aide, action);
    f.setTooltip(aide);
    return f;
  };
  const sansRoue = bloc => { if (bloc.getIcon(Blockly.icons.MutatorIcon.TYPE)) bloc.removeIcon(Blockly.icons.MutatorIcon.TYPE); };

  // « créer un texte avec » et « créer une liste avec » : « ＋ » ajoute une entrée, « − » enlève la dernière.
  const IMAGE_PLUS = boutonSi('＋', 24, 16);
  function boutonsEntrees(bloc, quoi) {
    if (bloc.getInput('BOUTONS_ENTREES')) bloc.removeInput('BOUTONS_ENTREES');
    const ligne = bloc.appendDummyInput('BOUTONS_ENTREES').setAlign(Blockly.inputs.Align.RIGHT);
    ligne.appendField(boutonBloc(IMAGE_PLUS, 24, `Ajouter ${quoi}`, () => changerForme(bloc, () => {
      bloc.itemCount_++;
      bloc.updateShape_();
    })));
    if (bloc.itemCount_ > 0) {
      ligne.appendField(boutonBloc(IMAGE_MOINS, 24, `Enlever la dernière entrée`, () => changerForme(bloc, () => {
        const lache = bloc.getInputTargetBlock('ADD' + (bloc.itemCount_ - 1));
        bloc.itemCount_--;
        bloc.updateShape_();
        return [lache];
      })));
    }
  }
  for (const [type, quoi] of [['text_join', 'un morceau de texte'], ['lists_create_with', 'un élément à la liste']]) {
    const initAvant = Blockly.Blocks[type].init;
    Blockly.Blocks[type].init = function () {
      initAvant.call(this);
      sansRoue(this);
      const majForme = this.updateShape_;
      this.updateShape_ = function () { majForme.call(this); boutonsEntrees(this, quoi); };
      boutonsEntrees(this, quoi);
    };
  }

  // Fonctions : « ＋ paramètre » demande son nom, « − » enlève le dernier ; les appels se mettent à jour.
  const IMAGE_PLUS_PARAMETRE = boutonSi('＋ paramètre', 98);
  function changerParametres(bloc, changer) {
    changerForme(bloc, () => {
      const etat = bloc.saveExtraState(true) || {};
      etat.params = changer((etat.params || []).slice());
      bloc.loadExtraState(etat); // met à jour le titre et les blocs qui appellent la fonction
    });
  }
  for (const type of ['procedures_defnoreturn', 'procedures_defreturn']) {
    const initAvant = Blockly.Blocks[type].init;
    Blockly.Blocks[type].init = function () {
      initAvant.call(this);
      sansRoue(this);
      const bloc = this;
      const moins = boutonBloc(IMAGE_MOINS, 24, 'Enlever le dernier paramètre', () =>
        changerParametres(bloc, params => params.slice(0, -1)));
      const plus = boutonBloc(IMAGE_PLUS_PARAMETRE, 98, 'Ajouter un paramètre : une valeur donnée à la fonction quand on l\'appelle', () => {
        if (bloc.isInFlyout || bloc.workspace.options.readOnly) return;
        Blockly.dialog.prompt('Nom du nouveau paramètre (par exemple : nombre, prénom, vitesse) :', '', nom => {
          nom = (nom || '').trim();
          if (!nom) return;
          if (bloc.arguments_.some(a => a.toLowerCase() === nom.toLowerCase())) {
            Blockly.dialog.alert(`La fonction a déjà un paramètre « ${nom} ».`);
            return;
          }
          changerParametres(bloc, params => [...params, { name: nom }]);
        });
      });
      this.inputList[0].appendField(plus, 'PLUS_PARAMETRE').appendField(moins, 'MOINS_PARAMETRE');
      const majParams = this.updateParams_;
      this.updateParams_ = function () { majParams.call(this); moins.setVisible(this.arguments_.length > 0); };
      moins.setVisible(this.arguments_.length > 0);
    };
  }

  // Change le nombre de « sinon si » ou le « sinon », en gardant les blocs déjà branchés ; Ctrl+Z l'annule.
  function changerSi(bloc, action, numero) {
    if (bloc.isInFlyout || !bloc.workspace || bloc.workspace.options.readOnly) return;
    const valeurs = [null], instructions = [null], laches = [];
    for (let i = 1; bloc.getInput('IF' + i); i++) {
      valeurs.push(bloc.getInput('IF' + i).connection.targetConnection);
      instructions.push(bloc.getInput('DO' + i).connection.targetConnection);
    }
    let sinon = bloc.getInput('ELSE') ? bloc.getInput('ELSE').connection.targetConnection : null;
    let avecSinon = !!bloc.getInput('ELSE');
    if (action === 'ajouterSinonSi') { valeurs.push(null); instructions.push(null); }
    if (action === 'ajouterSinon') avecSinon = true;
    if (action === 'enleverSinonSi') laches.push(...valeurs.splice(numero, 1), ...instructions.splice(numero, 1));
    if (action === 'enleverSinon') { laches.push(sinon); sinon = null; avecSinon = false; }
    const avant = etatSi(bloc);
    const groupe = Blockly.Events.getGroup(); // dans un clic de Blockly, un groupe est peut-être déjà ouvert
    if (!groupe) Blockly.Events.setGroup(true);
    try {
      bloc.elseifCount_ = valeurs.length - 1;
      bloc.elseCount_ = avecSinon ? 1 : 0;
      bloc.updateShape_();
      bloc.reconnectChildBlocks_(valeurs, instructions, sinon);
      Blockly.Events.fire(new Blockly.Events.BlockChange(bloc, 'mutation', null, avant, etatSi(bloc)));
      // Les blocs de la partie enlevée ne sont pas perdus : ils restent à côté, détachés.
      for (const c of laches) if (c && !c.getSourceBlock().getParent()) c.getSourceBlock().moveBy(40, 30);
    } finally {
      if (!groupe) Blockly.Events.setGroup(false);
    }
  }

  function boutonsSi(bloc) {
    const bouton = (image, largeur, aide, action, numero) => {
      const f = new Blockly.FieldImage(image, largeur, HAUTEUR_BOUTON_SI, aide, () => changerSi(bloc, action, numero));
      f.setTooltip(aide);
      return f;
    };
    for (let i = 1; bloc.getInput('IF' + i); i++) {
      bloc.getInput('IF' + i).appendField(bouton(IMAGE_MOINS, 24, 'Enlever ce « sinon si »', 'enleverSinonSi', i));
    }
    if (bloc.getInput('ELSE')) bloc.getInput('ELSE').appendField(bouton(IMAGE_MOINS, 24, 'Enlever le « sinon »', 'enleverSinon'));
    if (bloc.getInput('BOUTONS_SI')) bloc.removeInput('BOUTONS_SI');
    const ligne = bloc.appendDummyInput('BOUTONS_SI');
    ligne.appendField(bouton(IMAGE_PLUS_SINON_SI, 88, 'Ajouter une autre condition à tester (« sinon si »)', 'ajouterSinonSi'));
    if (!bloc.getInput('ELSE')) ligne.appendField(bouton(IMAGE_PLUS_SINON, 68, 'Ajouter ce qu\'il faut faire si aucune condition n\'est vraie (« sinon »)', 'ajouterSinon'));
  }

  const initSi = Blockly.Blocks['controls_if'].init;
  Blockly.Blocks['controls_if'].init = function () {
    initSi.call(this);
    if (this.getIcon(Blockly.icons.MutatorIcon.TYPE)) this.removeIcon(Blockly.icons.MutatorIcon.TYPE);
    const majForme = this.updateShape_;
    this.updateShape_ = function () { majForme.call(this); boutonsSi(this); };
    boutonsSi(this);
  };

  // ---------- Commentaire ----------
  // Un bloc qui ne fait rien : il explique les blocs qui le suivent (comme « ' » en Visual Basic).
  // Son texte est coupé en lignes pour rester lisible ; « ✎ » ouvre une boîte pour le modifier.
  const COULEUR_COMMENTAIRE = '#5f8a6a';
  const LARGEUR_COMMENTAIRE = 56; // caractères par ligne affichée
  const IMAGE_CRAYON = boutonSi('✎', 24, 15);
  const INTERLIGNE_COMMENTAIRE = 20; // pixels d'une ligne à la suivante
  const MARGE_COMMENTAIRE = 4;       // au-dessus et au-dessous du texte

  // Texte sur plusieurs lignes serrées, dans un seul champ (une rangée de bloc par ligne serait trop espacée).
  const mesure = document.createElement('canvas').getContext('2d');
  class ChampLignes extends Blockly.FieldLabel {
    render_() {
      const c = this.getConstants(), texte = this.textElement_;
      if (!texte) return;
      while (texte.firstChild) texte.removeChild(texte.firstChild);
      const marge = c.FIELD_BORDER_RECT_X_PADDING;
      mesure.font = `italic ${c.FIELD_TEXT_FONTWEIGHT} ${c.FIELD_TEXT_FONTSIZE}pt ${c.FIELD_TEXT_FONTFAMILY}`;
      let largeur = 0;
      const lignes = String(this.getValue()).split('\n');
      lignes.forEach((ligne, i) => {
        const morceau = Blockly.utils.dom.createSvgElement('tspan', { x: marge, dy: i ? INTERLIGNE_COMMENTAIRE : 0 }, texte);
        morceau.textContent = ligne.replace(/ /g, ' ') || ' ';
        largeur = Math.max(largeur, mesure.measureText(ligne).width);
      });
      this.size_.width = Math.ceil(largeur) + 2 * marge;
      this.size_.height = c.FIELD_TEXT_HEIGHT + INTERLIGNE_COMMENTAIRE * (lignes.length - 1) + 2 * MARGE_COMMENTAIRE;
      texte.setAttribute('x', marge);
      // 1re ligne : à la hauteur d'un texte d'une ligne ; les suivantes descendent avec « dy ».
      texte.setAttribute('y', MARGE_COMMENTAIRE + (c.FIELD_TEXT_BASELINE_CENTER ? c.FIELD_TEXT_HEIGHT / 2 : c.FIELD_TEXT_BASELINE));
    }
  }

  function lignesCommentaire(texte) {
    const lignes = [];
    for (const paragraphe of String(texte).split('\n')) {
      let ligne = '';
      for (const mot of paragraphe.split(/\s+/).filter(Boolean)) {
        if (ligne && (ligne + ' ' + mot).length > LARGEUR_COMMENTAIRE) { lignes.push(ligne); ligne = mot; }
        else ligne = ligne ? ligne + ' ' + mot : mot;
      }
      lignes.push(ligne);
    }
    return lignes;
  }

  // Petite boîte de saisie sur plusieurs lignes (Ctrl+Entrée : OK ; Échap : Annuler).
  function saisirCommentaire(texte, valider) {
    const voile = document.createElement('div');
    voile.className = 'bs-commentaire-voile';
    const boite = document.createElement('div');
    boite.className = 'bs-commentaire-boite';
    const titre = document.createElement('h3');
    titre.textContent = '💬 Commentaire';
    const zone = document.createElement('textarea');
    zone.value = texte;
    zone.rows = 6;
    zone.placeholder = 'Expliquez ce que font les blocs en dessous…';
    const boutons = document.createElement('div');
    boutons.className = 'bs-commentaire-boutons';
    const annuler = document.createElement('button');
    annuler.textContent = 'Annuler';
    annuler.className = 'secondaire';
    const ok = document.createElement('button');
    ok.textContent = 'OK';
    ok.className = 'principal';
    boutons.append(annuler, ok);
    boite.append(titre, zone, boutons);
    voile.appendChild(boite);
    document.body.appendChild(voile);
    const fermer = garder => {
      voile.remove();
      if (garder) valider(zone.value.replace(/\s+$/, ''));
    };
    ok.addEventListener('click', () => fermer(true));
    annuler.addEventListener('click', () => fermer(false));
    voile.addEventListener('pointerdown', e => { if (e.target === voile) fermer(false); });
    zone.addEventListener('keydown', e => {
      if (e.key === 'Escape') fermer(false);
      else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) fermer(true);
      e.stopPropagation(); // les raccourcis de Blockly (Suppr, Ctrl+Z…) ne doivent pas agir pendant la saisie
    });
    zone.focus();
    zone.select();
  }

  Blockly.Blocks['bs_commentaire'] = {
    init() {
      this.texte_ = 'Expliquez ici ce que font les blocs en dessous.';
      this.setColour(COULEUR_COMMENTAIRE);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('Un commentaire : il explique le programme et ne fait rien quand le programme tourne. ' +
        'Cliquez sur ✎ pour l\'écrire. Il peut aussi rester seul, à côté des blocs, comme une note.');
      this.suppressPrefixSuffix = true; // pas d'arrêt dessus en mode pas à pas
      this.majCommentaire_();
    },
    saveExtraState() { return { texte: this.texte_ }; },
    loadExtraState(etat) {
      this.texte_ = String((etat && etat.texte) || '');
      this.majCommentaire_();
    },
    majCommentaire_() {
      const lignes = lignesCommentaire(this.texte_ || '(commentaire vide)').join('\n');
      if (this.getField('TEXTE')) return this.setFieldValue(lignes, 'TEXTE');
      this.appendDummyInput('NOTE')
        .appendField(boutonBloc(IMAGE_CRAYON, 24, 'Modifier le commentaire', () => {
          if (this.isInFlyout || this.workspace.options.readOnly) return;
          saisirCommentaire(this.texte_, texte => changerForme(this, () => {
            this.texte_ = texte;
            this.majCommentaire_();
          }));
        }))
        .appendField(new ChampLignes(lignes, 'bs-commentaire-texte'), 'TEXTE');
    }
  };

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

  // Infobulles des blocs de Blockly, réécrites simplement (la traduction d'origine est souvent technique).
  Object.assign(Blockly.Msg, {
    // Logique
    CONTROLS_IF_TOOLTIP_1: 'Si la condition est vraie, les blocs de « faire » s\'exécutent. Boutons ＋ : ajouter « sinon si » ou « sinon ».',
    CONTROLS_IF_TOOLTIP_2: 'Si la condition est vraie, les blocs de « faire » s\'exécutent ; sinon, ce sont ceux de « sinon ».',
    CONTROLS_IF_TOOLTIP_3: 'Les conditions sont testées dans l\'ordre : seuls les blocs de la première condition vraie s\'exécutent.',
    CONTROLS_IF_TOOLTIP_4: 'Les conditions sont testées dans l\'ordre : seuls les blocs de la première condition vraie s\'exécutent ; si aucune n\'est vraie, ce sont ceux de « sinon ».',
    LOGIC_COMPARE_TOOLTIP_EQ: 'Vrai si les deux valeurs sont égales (5 = 5, « oui » = « oui »).',
    LOGIC_COMPARE_TOOLTIP_NEQ: 'Vrai si les deux valeurs sont différentes.',
    LOGIC_COMPARE_TOOLTIP_LT: 'Vrai si la première valeur est plus petite que la seconde (3 < 5).',
    LOGIC_COMPARE_TOOLTIP_LTE: 'Vrai si la première valeur est plus petite que la seconde, ou égale.',
    LOGIC_COMPARE_TOOLTIP_GT: 'Vrai si la première valeur est plus grande que la seconde (5 > 3).',
    LOGIC_COMPARE_TOOLTIP_GTE: 'Vrai si la première valeur est plus grande que la seconde, ou égale.',
    LOGIC_OPERATION_TOOLTIP_AND: 'Vrai seulement si les deux conditions sont vraies.',
    LOGIC_OPERATION_TOOLTIP_OR: 'Vrai si au moins une des deux conditions est vraie.',
    LOGIC_NEGATE_TOOLTIP: 'L\'inverse de la condition : vrai devient faux, et faux devient vrai.',
    LOGIC_BOOLEAN_TOOLTIP: 'La valeur vrai ou faux, au choix.',
    // Boucles
    CONTROLS_REPEAT_TOOLTIP: 'Répète les blocs à l\'intérieur le nombre de fois indiqué.',
    CONTROLS_WHILEUNTIL_TOOLTIP_WHILE: 'Répète les blocs tant que la condition est vraie (elle est vérifiée avant chaque tour).',
    CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL: 'Répète les blocs jusqu\'à ce que la condition devienne vraie.',
    CONTROLS_FOR_TOOLTIP: 'Compte du premier nombre jusqu\'au second (de 1 en 1, ou du pas choisi) : à chaque tour, la variable « %1 » vaut le nombre du moment, puis les blocs s\'exécutent.',
    CONTROLS_FOREACH_TOOLTIP: 'Pour chaque élément de la liste, l\'un après l\'autre : la variable « %1 » vaut cet élément, puis les blocs s\'exécutent.',
    CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK: 'Arrête la boucle tout de suite : le programme continue après la boucle.',
    CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE: 'Passe directement au tour suivant de la boucle, sans faire la fin de celui-ci.',
    // Maths
    MATH_NUMBER_TOOLTIP: 'Un nombre. Pour un nombre à virgule, écrivez-le avec un point : 2.5',
    MATH_ARITHMETIC_TOOLTIP_ADD: 'La somme des deux nombres (3 + 2 = 5).',
    MATH_ARITHMETIC_TOOLTIP_MINUS: 'Le premier nombre moins le second (5 − 2 = 3).',
    MATH_ARITHMETIC_TOOLTIP_MULTIPLY: 'Le produit des deux nombres (3 × 4 = 12).',
    MATH_ARITHMETIC_TOOLTIP_DIVIDE: 'Le premier nombre divisé par le second (10 ÷ 4 = 2,5).',
    MATH_ARITHMETIC_TOOLTIP_POWER: 'Le premier nombre à la puissance du second (2 ^ 3 = 2 × 2 × 2 = 8).',
    MATH_SINGLE_TOOLTIP_ROOT: 'La racine carrée du nombre (√9 = 3).',
    MATH_SINGLE_TOOLTIP_ABS: 'Le nombre sans son signe moins (−7 donne 7).',
    MATH_SINGLE_TOOLTIP_NEG: 'L\'opposé du nombre (7 donne −7, et −7 donne 7).',
    MATH_SINGLE_TOOLTIP_LN: 'Le logarithme naturel (ln) du nombre.',
    MATH_SINGLE_TOOLTIP_LOG10: 'Le logarithme décimal du nombre (log de 1000 = 3).',
    MATH_SINGLE_TOOLTIP_EXP: 'Le nombre e (environ 2,718) à la puissance du nombre.',
    MATH_SINGLE_TOOLTIP_POW10: '10 à la puissance du nombre (10^3 = 1000).',
    MATH_ROUND_TOOLTIP: 'Arrondit le nombre : à l\'entier le plus proche (2,6 → 3), au-dessus (2,1 → 3) ou au-dessous (2,9 → 2).',
    MATH_MODULO_TOOLTIP: 'Le reste de la division (17 ÷ 5 = 3, reste 2). Un reste de 0 : le premier nombre est un multiple du second.',
    MATH_IS_TOOLTIP: 'Vrai ou faux : le nombre est-il pair, impair, premier, entier, positif, négatif, ou divisible par un autre ?',
    MATH_RANDOM_INT_TOOLTIP: 'Un nombre entier au hasard entre les deux nombres, eux compris : comme un dé.',
    MATH_RANDOM_FLOAT_TOOLTIP: 'Un nombre à virgule au hasard, entre 0 et 1 (jamais 1).',
    MATH_ONLIST_TOOLTIP_SUM: 'La somme de tous les nombres de la liste.',
    MATH_ONLIST_TOOLTIP_MIN: 'Le plus petit nombre de la liste.',
    MATH_ONLIST_TOOLTIP_MAX: 'Le plus grand nombre de la liste.',
    MATH_ONLIST_TOOLTIP_AVERAGE: 'La moyenne des nombres de la liste.',
    MATH_ONLIST_TOOLTIP_MEDIAN: 'La valeur du milieu, quand on range les nombres de la liste dans l\'ordre.',
    MATH_ONLIST_TOOLTIP_MODE: 'La valeur qui revient le plus souvent dans la liste (une liste, s\'il y en a plusieurs à égalité).',
    MATH_ONLIST_TOOLTIP_STD_DEV: 'L\'écart type : il mesure à quel point les nombres de la liste sont dispersés.',
    MATH_ONLIST_TOOLTIP_RANDOM: 'Un élément de la liste, pris au hasard.',
    MATH_TRIG_TOOLTIP_SIN: 'Le sinus d\'un angle en degrés.',
    MATH_TRIG_TOOLTIP_COS: 'Le cosinus d\'un angle en degrés.',
    MATH_TRIG_TOOLTIP_TAN: 'La tangente d\'un angle en degrés.',
    MATH_TRIG_TOOLTIP_ASIN: 'L\'angle, en degrés, dont le sinus est ce nombre.',
    MATH_TRIG_TOOLTIP_ACOS: 'L\'angle, en degrés, dont le cosinus est ce nombre.',
    MATH_TRIG_TOOLTIP_ATAN: 'L\'angle, en degrés, dont la tangente est ce nombre.',
    MATH_CONSTANT_TOOLTIP: 'Une constante : π (3,14159…), e (2,71828…), φ le nombre d\'or (1,618…), √2 (1,414…), √½ (0,707…) ou ∞ (l\'infini).',
    // Texte
    TEXT_TEXT_TOOLTIP: 'Un texte : une lettre, un mot ou une phrase.',
    TEXT_JOIN_TOOLTIP: 'Colle des morceaux bout à bout pour faire un seul texte (pensez aux espaces : « Bonjour » + « Léa » donne « BonjourLéa »). Boutons ＋ et − : ajouter ou enlever un morceau.',
    TEXT_APPEND_TOOLTIP: 'Ajoute ce texte à la fin de la variable « %1 ».',
    TEXT_LENGTH_TOOLTIP: 'Le nombre de caractères du texte : lettres, chiffres, espaces et ponctuation compris.',
    TEXT_ISEMPTY_TOOLTIP: 'Vrai si le texte est vide (aucun caractère).',
    TEXT_INDEXOF_TOOLTIP: 'La position du morceau dans le texte (1 = au tout début), à sa première ou à sa dernière apparition ; %1 s\'il n\'y est pas.',
    TEXT_CHARAT_TOOLTIP: 'La lettre qui se trouve à cette position du texte.',
    LISTS_INDEX_FROM_START_TOOLTIP: 'Le nº 1 est le premier.',
    LISTS_INDEX_FROM_END_TOOLTIP: 'Le nº 1 est le dernier.',
    TEXT_GET_SUBSTRING_TOOLTIP: 'Un morceau du texte, entre les deux positions choisies.',
    TEXT_REPLACE_TOOLTIP: 'Remplace partout dans le texte un morceau par un autre.',
    TEXT_COUNT_TOOLTIP: 'Combien de fois un morceau de texte apparaît dans un autre.',
    TEXT_CHANGECASE_TOOLTIP: 'Le texte en MAJUSCULES, en minuscules, ou avec Une Majuscule À Chaque Mot.',
    TEXT_TRIM_TOOLTIP: 'Le texte sans ses espaces au début, à la fin, ou des deux côtés.',
    TEXT_REVERSE_TOOLTIP: 'Le texte à l\'envers (« abc » donne « cba »).',
    // Listes
    LISTS_CREATE_EMPTY_TOOLTIP: 'Une liste vide, à remplir ensuite.',
    LISTS_CREATE_WITH_TOOLTIP: 'Une liste faite de ces éléments, dans cet ordre. Boutons ＋ et − : ajouter ou enlever un élément.',
    LISTS_LENGTH_TOOLTIP: 'Le nombre d\'éléments de la liste.',
    LISTS_ISEMPTY_TOOLTIP: 'Vrai si la liste ne contient aucun élément.',
    LISTS_REPEAT_TOOLTIP: 'Une liste qui contient la même valeur, répétée le nombre de fois indiqué.',
    LISTS_GET_INDEX_TOOLTIP_GET_FROM: 'L\'élément qui se trouve à cette position dans la liste.',
    LISTS_GET_INDEX_TOOLTIP_GET_FIRST: 'Le premier élément de la liste.',
    LISTS_GET_INDEX_TOOLTIP_GET_LAST: 'Le dernier élément de la liste.',
    LISTS_GET_INDEX_TOOLTIP_GET_RANDOM: 'Un élément de la liste, pris au hasard.',
    LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FROM: 'L\'élément qui se trouve à cette position, retiré en même temps de la liste.',
    LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FIRST: 'Le premier élément, retiré en même temps de la liste.',
    LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_LAST: 'Le dernier élément, retiré en même temps de la liste.',
    LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_RANDOM: 'Un élément au hasard, retiré en même temps de la liste.',
    LISTS_GET_INDEX_TOOLTIP_REMOVE_FROM: 'Retire de la liste l\'élément qui se trouve à cette position.',
    LISTS_GET_INDEX_TOOLTIP_REMOVE_FIRST: 'Retire le premier élément de la liste.',
    LISTS_GET_INDEX_TOOLTIP_REMOVE_LAST: 'Retire le dernier élément de la liste.',
    LISTS_GET_INDEX_TOOLTIP_REMOVE_RANDOM: 'Retire un élément de la liste, pris au hasard.',
    LISTS_SET_INDEX_TOOLTIP_SET_FROM: 'Remplace l\'élément qui se trouve à cette position.',
    LISTS_SET_INDEX_TOOLTIP_SET_FIRST: 'Remplace le premier élément de la liste.',
    LISTS_SET_INDEX_TOOLTIP_SET_LAST: 'Remplace le dernier élément de la liste.',
    LISTS_SET_INDEX_TOOLTIP_SET_RANDOM: 'Remplace un élément de la liste, pris au hasard.',
    LISTS_SET_INDEX_TOOLTIP_INSERT_FROM: 'Insère l\'élément à cette position (les suivants se décalent d\'une place).',
    LISTS_SET_INDEX_TOOLTIP_INSERT_FIRST: 'Insère l\'élément au début de la liste.',
    LISTS_SET_INDEX_TOOLTIP_INSERT_LAST: 'Ajoute l\'élément à la fin de la liste.',
    LISTS_SET_INDEX_TOOLTIP_INSERT_RANDOM: 'Insère l\'élément à une place au hasard.',
    LISTS_INDEX_OF_TOOLTIP: 'La position de l\'élément dans la liste (1 = le premier), à sa première ou à sa dernière apparition ; %1 s\'il n\'y est pas.',
    LISTS_GET_SUBLIST_TOOLTIP: 'Une nouvelle liste faite d\'une partie de celle-ci, entre les deux positions choisies.',
    LISTS_SORT_TOOLTIP: 'Une copie de la liste rangée dans l\'ordre (nombres ou ordre alphabétique, croissant ou décroissant).',
    LISTS_REVERSE_TOOLTIP: 'Une copie de la liste à l\'envers : le dernier élément devient le premier.',
    LISTS_SPLIT_TOOLTIP_SPLIT: 'Découpe un texte en liste à chaque séparateur (« a,b,c » avec « , » donne a, b et c).',
    LISTS_SPLIT_TOOLTIP_JOIN: 'Colle les éléments d\'une liste en un seul texte, avec le séparateur entre chacun.',
    // Variables
    VARIABLES_SET_TOOLTIP: 'Range une valeur dans la variable (elle remplace l\'ancienne).',
    MATH_CHANGE_TOOLTIP: 'Ajoute ce nombre à la variable « %1 » (un nombre négatif l\'enlève).',
    VARIABLES_GET_TOOLTIP: 'La valeur rangée dans cette variable.',
    // Fonctions
    PROCEDURES_DEFNORETURN_TOOLTIP: 'Crée une fonction : des blocs regroupés sous un nom, à lancer avec son bloc de la catégorie Fonctions. « ＋ paramètre » : lui donner des valeurs.',
    PROCEDURES_DEFRETURN_TOOLTIP: 'Crée une fonction qui calcule une valeur et la renvoie : son bloc s\'utilise comme une valeur. « ＋ paramètre » : lui donner des valeurs.',
    PROCEDURES_IFRETURN_TOOLTIP: 'Si la condition est vraie, la fonction s\'arrête là et renvoie cette valeur.',
    PROCEDURES_CALLNORETURN_TOOLTIP: 'Lance la fonction « %1 » : ses blocs s\'exécutent, puis le programme continue.',
    PROCEDURES_CALLRETURN_TOOLTIP: 'Lance la fonction « %1 » et utilise la valeur qu\'elle renvoie.'
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

  const item = b => q(b.getFieldValue('ITEM'));
  gen.forBlock['bs_quand_menu_contextuel'] = b =>
    `app.quandMenuContextuel(${id(b)}, ${item(b)}, async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_menu_contextuel_source'] = b => [`app.sourceMenuContextuel(${id(b)})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_menu_contextuel_actif'] = b =>
    `app.activerMenuContextuel(${id(b)}, ${item(b)}, ${b.getFieldValue('ACTIF') === 'TRUE'});\n`;
  gen.forBlock['bs_menu_contextuel_montrer'] = b => `app.montrerMenuContextuel(${id(b)});\n`;
  gen.forBlock['bs_quand_outil'] = b =>
    `app.quandOutil(${id(b)}, ${item(b)}, async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_outil_actif'] = b => `app.activerOutil(${id(b)}, ${item(b)}, ${b.getFieldValue('ACTIF') === 'TRUE'});\n`;

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
  gen.forBlock['bs_arbre_ajouter'] = b => `app.arbre(${id(b)}, 'ajouter', ${val(b, 'VAL', "''")}, ${val(b, 'DANS', "''")});\n`;
  gen.forBlock['bs_arbre_supprimer'] = b => `app.arbre(${id(b)}, 'supprimer', ${val(b, 'CHEMIN', "''")});\n`;
  gen.forBlock['bs_arbre_ctrl'] = b => `app.arbre(${id(b)}, ${q(b.getFieldValue('ACTION'))});\n`;
  gen.forBlock['bs_arbre_enfants'] = b => [`app.enfantsArbre(${id(b)}, ${val(b, 'CHEMIN', "''")})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_barreetat_ecrire'] = b => `app.barreEtat(${id(b)}, ${val(b, 'NUM', '1')}, ${val(b, 'VAL', "''")});\n`;
  gen.forBlock['bs_barreetat_case'] = b => [`app.lireBarreEtat(${id(b)}, ${val(b, 'NUM', '1')})`, Order.FUNCTION_CALL];
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
  gen.forBlock['bs_panneau_defiler'] = b => `app.defilerPanneau(${id(b)}, ${q(b.getFieldValue('QUOI'))});\n`;
  gen.forBlock['bs_panneau_montrer'] = b => `app.defilerPanneau(${id(b)}, 'controle', ${codeCtrl(b.getFieldValue('CIBLE'))});\n`;
  gen.forBlock['bs_copier'] = b => `await app.copier(${val(b, 'VAL', "''")});\n`;
  gen.forBlock['bs_copier_image'] = b => `await app.copierImage(${id(b)});\n`;
  gen.forBlock['bs_presse_papiers'] = () => ['(await app.lirePressePapiers())', Order.ATOMIC];
  gen.forBlock['bs_imprimer_texte'] = b => `await app.imprimer('texte', ${val(b, 'VAL', "''")});\n`;
  gen.forBlock['bs_imprimer'] = b => `await app.imprimer('controle', ${id(b)});\n`;
  gen.forBlock['bs_imprimer_fenetre'] = b => `await app.imprimer('fenetre', ${q(b.getFieldValue('FENETRE'))});\n`;
  gen.forBlock['bs_notification'] = b =>
    `app.notifier(${val(b, 'TITRE', "''")}, ${val(b, 'VAL', "''")}, ${q(b.getFieldValue('ICONE'))});\n`;
  gen.forBlock['bs_meteo'] = b => [`(await app.meteo(${val(b, 'VAL', "''")}, ${q(b.getFieldValue('QUOI'))}))`, Order.ATOMIC];
  gen.forBlock['bs_web_ouvrir'] = b => `app.ouvrirNavigateur(${val(b, 'VAL', "''")});\n`;
  gen.forBlock['bs_web_lire'] = b => [`(await app.lireWeb(${val(b, 'VAL', "''")}))`, Order.ATOMIC];
  gen.forBlock['bs_json_valeur'] = b => [`app.valeurJson(${val(b, 'VAL', "''")}, ${val(b, 'CHEMIN', "''")})`, Order.FUNCTION_CALL];
  const genConvertir = grandeur => b =>
    [`app.convertir(${q(grandeur)}, ${val(b, 'VAL', '0')}, ${q(b.getFieldValue('DE'))}, ${q(b.getFieldValue('VERS'))})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_convertir_temps'] = genConvertir('temps');
  gen.forBlock['bs_convertir_distance'] = genConvertir('distance');
  gen.forBlock['bs_convertir_temperature'] = genConvertir('temperature');
  gen.forBlock['bs_convertir_masse'] = genConvertir('masse');
  gen.forBlock['bs_convertir_volume'] = genConvertir('volume');
  gen.forBlock['bs_temps_texte'] = b => [`app.tempsEnTexte(${val(b, 'VAL', '0')}, ${q(b.getFieldValue('FORMAT'))})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_temps_secondes'] = b => [`app.texteEnSecondes(${val(b, 'VAL', "''")})`, Order.FUNCTION_CALL];
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
  gen.forBlock['bs_cote_contact'] = b =>
    [`app.coteContact(${id(b)}, ${codeCtrl(b.getFieldValue('CTRL2'))})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_touche_couleur'] = b => [`app.toucheCouleur(${id(b)}, ${val(b, 'COUL', "'noir'")})`, Order.FUNCTION_CALL];
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
  gen.forBlock['bs_quand_camera_mouvement'] = b =>
    `app.quand(${id(b)}, 'mouvement', async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_camera_ctrl'] = b => `await app.camera(${id(b)}, ${q(b.getFieldValue('ACTION'))});\n`;
  gen.forBlock['bs_camera_photo'] = b => `await app.camera(${id(b)}, 'photo');\n`;
  gen.forBlock['bs_camera_photo_dans'] = b => `await app.camera(${id(b)}, 'photoDans', ${codeCtrl(b.getFieldValue('CIBLE'))});\n`;
  gen.forBlock['bs_quand_fichier_depose'] = b =>
    `app.quand(${id(b)}, 'depose', async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_fichier_ouvrir_avec'] = b => `await app.fichier(${id(b)}, 'ouvrir');\n`;
  gen.forBlock['bs_fichier_enregistrer_avec'] = b => `await app.fichier(${id(b)}, 'enregistrer', ${val(b, 'VAL', "''")});\n`;
  gen.forBlock['bs_fichier_ouvrir_dans'] = b => `await app.fichier(${id(b)}, 'ouvrirDans', ${codeCtrl(b.getFieldValue('CIBLE'))});\n`;
  gen.forBlock['bs_fichier_enregistrer_de'] = b => `await app.fichier(${id(b)}, 'enregistrerDe', ${codeCtrl(b.getFieldValue('CIBLE'))});\n`;
  gen.forBlock['bs_fichier_contenu'] = b => [`app.lire(${id(b)}, 'contenu')`, Order.FUNCTION_CALL];
  gen.forBlock['bs_fichier_nom'] = b => [`app.lire(${id(b)}, 'nomFichier')`, Order.FUNCTION_CALL];
  gen.forBlock['bs_fichier_annule'] = b => [`app.lire(${id(b)}, 'annule')`, Order.FUNCTION_CALL];
  const champBase = b => q(b.getFieldValue('CHAMP'));
  gen.forBlock['bs_base_ajouter'] = b => {
    const valeurs = b.champs.map((nom, i) => `${JSON.stringify(nom)}: ${val(b, 'V' + i, "''")}`);
    return `app.base(${id(b)}, 'ajouter', { ${valeurs.join(', ')} });\n`;
  };
  gen.forBlock['bs_base_modifier'] = b => `app.base(${id(b)}, 'modifier', ${val(b, 'N', '1')}, ${champBase(b)}, ${val(b, 'VAL', "''")});\n`;
  gen.forBlock['bs_base_supprimer'] = b => `app.base(${id(b)}, 'supprimer', ${val(b, 'N', '1')});\n`;
  gen.forBlock['bs_base_vider'] = b => `app.base(${id(b)}, 'vider');\n`;
  gen.forBlock['bs_base_trier'] = b => `app.base(${id(b)}, 'trier', ${champBase(b)}, ${q(b.getFieldValue('SENS'))});\n`;
  gen.forBlock['bs_base_afficher'] = b =>
    `app.base(${id(b)}, 'afficher', ${codeCtrl(b.getFieldValue('TAB'))}, ${val(b, 'NUMS', 'null')});\n`;
  gen.forBlock['bs_base_remplir'] = b => `app.base(${id(b)}, 'csv', ${val(b, 'VAL', "''")});\n`;
  gen.forBlock['bs_base_champ'] = b =>
    [`app.lireBase(${id(b)}, 'champ', ${val(b, 'N', '1')}, ${champBase(b)})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_base_nombre'] = b => [`app.lireBase(${id(b)}, 'nombre')`, Order.FUNCTION_CALL];
  gen.forBlock['bs_base_chercher'] = b =>
    [`app.lireBase(${id(b)}, 'chercher', ${champBase(b)}, ${q(b.getFieldValue('OP'))}, ${val(b, 'VAL', "''")})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_base_premiere'] = b =>
    [`app.lireBase(${id(b)}, 'premiere', ${champBase(b)}, ${q(b.getFieldValue('OP'))}, ${val(b, 'VAL', "''")})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_base_colonne'] = b => [`app.lireBase(${id(b)}, 'colonne', ${champBase(b)})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_base_csv'] = b => [`app.lireBase(${id(b)}, 'csv')`, Order.FUNCTION_CALL];
  gen.forBlock['bs_base_choisie'] = b => [`app.lireBase(${id(b)}, 'choisie')`, Order.FUNCTION_CALL];
  gen.forBlock['bs_sprite_taille'] = b => `app.ecrire(${id(b)}, 'taille', ${val(b, 'VAL', '100')});\n`;
  gen.forBlock['bs_sprite_grandir'] = b => `app.sprite(${id(b)}, 'grandir', ${val(b, 'VAL', '10')});\n`;
  gen.forBlock['bs_sprite_transparence'] = b => `app.ecrire(${id(b)}, 'transparence', ${val(b, 'VAL', '0')});\n`;
  gen.forBlock['bs_sprite_fondu'] = b => `await app.sprite(${id(b)}, ${q(b.getFieldValue('SENS'))}, ${val(b, 'SEC', '1')});\n`;
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
  gen.forBlock['bs_rebondir_sur'] = b => mv(b, 'rebondirSur', codeCtrl(b.getFieldValue('CTRL2')), q(b.getFieldValue('MODE') || 'normal'));
  gen.forBlock['bs_touche_bord'] = b => [`app.toucheBord(${id(b)})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_distance'] = b => [`app.distance(${id(b)}, ${q(b.getFieldValue('CIBLE'))})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_direction'] = b => [`app.lire(${id(b)}, 'direction')`, Order.FUNCTION_CALL];
  gen.forBlock['bs_gravite'] = b => mv(b, 'gravite', val(b, 'FORCE', '1'), q(b.getFieldValue('FOND') || 'bas'));
  gen.forBlock['bs_sauter'] = b => mv(b, 'sauter', val(b, 'FORCE', '12'));
  gen.forBlock['bs_au_sol'] = b => [`app.lire(${id(b)}, 'auSol')`, Order.FUNCTION_CALL];
  gen.forBlock['bs_image_defiler'] = b => `app.defilerImage(${id(b)}, ${val(b, 'DX', '0')}, ${val(b, 'DY', '0')});
`;
  gen.forBlock['bs_compteur_ajouter'] = b => `app.ajouterAuNombre(${id(b)}, ${val(b, 'VAL', '1')});\n`;
  gen.forBlock['bs_compteur_valeur'] = b => [`app.nombreAffiche(${id(b)})`, Order.FUNCTION_CALL];

  gen.forBlock['bs_quand_manette'] = b =>
    `app.quandManette(${q(b.getFieldValue('BOUTON'))}, async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_manette_bouton'] = b => [`app.boutonManette(${q(b.getFieldValue('BOUTON'))})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_manette_joystick'] = b => [`app.joystickManette(${q(b.getFieldValue('QUOI'))})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_manette_branchee'] = () => ['app.manetteBranchee()', Order.FUNCTION_CALL];

  const fen = b => q(b.getFieldValue('FENETRE'));
  gen.forBlock['bs_quand_fenetre'] = b =>
    `app.quandFenetre(${fen(b)}, ${q(b.getFieldValue('QUOI'))}, async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_fenetre_ouvrir'] = b => b.getFieldValue('MODE') === 'attendre'
    ? `await app.fenetre(${fen(b)}, 'ouvrir', true);\n` : `app.fenetre(${fen(b)}, 'ouvrir');\n`;
  gen.forBlock['bs_fenetre_fermer'] = b => `app.fenetre(${fen(b)}, 'fermer');\n`;
  gen.forBlock['bs_fenetre_titre'] = b => `app.fenetre(${fen(b)}, 'titre', ${val(b, 'VAL', "''")});\n`;
  gen.forBlock['bs_fenetre_ouverte'] = b => [`app.fenetreOuverte(${fen(b)})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_quand_fenetre_taille'] = b =>
    `app.quandFenetre(${fen(b)}, 'taille', async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_fenetre_changer_taille'] = b => `app.tailleFenetre(${fen(b)}, ${val(b, 'L', '0')}, ${val(b, 'H', '0')});\n`;
  gen.forBlock['bs_fenetre_dimension'] = b => [`app.lireTailleFenetre(${fen(b)}, ${q(b.getFieldValue('QUOI'))})`, Order.FUNCTION_CALL];

  gen.forBlock['bs_quand_clone'] = b => `app.quandClone(${id(b)}, async function (moi) {\n${corps(b)}});\n`;
  gen.forBlock['bs_creer_clone'] = b => `app.creerClone(${id(b)});\n`;
  gen.forBlock['bs_supprimer_clone'] = () => 'await app.supprimerClone(moi);\n';
  gen.forBlock['bs_supprimer_clones'] = b => `app.supprimerClones(${id(b)});\n`;
  gen.forBlock['bs_nombre_clones'] = b => [`app.nombreClones(${id(b)})`, Order.FUNCTION_CALL];

  gen.forBlock['bs_attendre'] = b =>`await app.attendre(${val(b, 'SEC', '1')});\n`;
  gen.forBlock['bs_toujours'] = b => `while (true) {\n${corps(b)}  await app.respirer();\n}\n`;

  gen.forBlock['bs_liste_ajouter'] = b => `app.ajouterElement(${id(b)}, ${val(b, 'VAL', "''")});\n`;
  gen.forBlock['bs_focus'] = b => `app.mettreFocus(${id(b)});\n`;
  gen.forBlock['bs_liste_vider'] = b => `app.viderListe(${id(b)});\n`;
  gen.forBlock['bs_liste_retirer'] = b => `app.retirerElement(${id(b)}, ${val(b, 'NUM', '1')});\n`;
  gen.forBlock['bs_radio_groupe'] = b => [`app.radioCoche(${q(b.getFieldValue('GROUPE'))})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_emoji'] = b => [q(b.getFieldValue('EMOJI')), Order.ATOMIC];
  gen.forBlock['bs_retour_ligne'] = () => ["'\\n'", Order.ATOMIC];
  gen.forBlock['bs_texte_repete'] = b => [`app.repeterTexte(${val(b, 'VAL', "''")}, ${val(b, 'FOIS', '1')})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_commentaire'] = b => b.texte_.split('\n').map(l => '// ' + l).join('\n') + '\n';

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

  gen.forBlock['bs_couleur'] = b => b.getFieldValue('COUL') === 'hasard'
    ? ['app.couleurHasard()', Order.FUNCTION_CALL] : [q(b.getFieldValue('COUL')), Order.ATOMIC];
  gen.forBlock['bs_format_nombre'] = b => [`app.formatNombre(${val(b, 'VAL', '0')}, ${val(b, 'DEC', '2')})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_liste_melanger'] = b => [`app.melanger(${val(b, 'VAL', '[]')})`, Order.FUNCTION_CALL];
  gen.forBlock['bs_chance'] = b => [`app.chance(${val(b, 'VAL', '50')})`, Order.FUNCTION_CALL];

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
  // En haut, les blocs généraux (comme dans Scratch) ; en bas, « Mes contrôles » : une catégorie par
  // fenêtre, et dedans une catégorie par contrôle, avec ses blocs déjà réglés sur lui (comme App Inventor).
  // Elle est reconstruite quand les contrôles du projet changent (voir majBoite dans app.js).

  const ombre = (type, champs) => ({ shadow: { type, fields: champs } });
  const texte = t => ombre('text', { TEXT: t });
  const nombre = n => ombre('math_number', { NUM: n });
  const couleurOmbre = () => ({ shadow: { type: 'bs_couleur' } });
  const listeTextes = (...valeurs) => ({
    block: {
      type: 'lists_create_with', extraState: { itemCount: valeurs.length },
      inputs: Object.fromEntries(valeurs.map((v, i) => ['ADD' + i, texte(v)]))
    }
  });
  const etiquette = text => ({ kind: 'label', text });

  const GENERAUX = [
    {
      kind: 'category', name: 'Événements', colour: COULEUR_EVENEMENTS, contents: [
        { kind: 'block', type: 'bs_quand_demarre' },
        { kind: 'block', type: 'bs_quand_touche' },
        { kind: 'block', type: 'bs_toutes_les', inputs: { SEC: nombre(1) } },
        etiquette('Messages entre les scripts'),
        { kind: 'block', type: 'bs_envoyer_message' },
        { kind: 'block', type: 'bs_quand_message' },
        etiquette('Les événements d\'un contrôle (« quand Bouton1 est cliqué »…) sont dans sa catégorie, en bas.')
      ]
    },
    {
      kind: 'category', name: 'Commentaires', colour: COULEUR_COMMENTAIRE, contents: [
        etiquette('Expliquez votre programme : un commentaire ne fait rien quand le programme tourne.'),
        { kind: 'block', type: 'bs_commentaire' },
        etiquette('Glissez-le au-dessus des blocs qu\'il explique (ou en premier dans un « quand… »).')
      ]
    },
    {
      kind: 'category', name: 'Clavier, souris et manette', colour: COULEUR_ENTREES, contents: [
        etiquette('Clavier'),
        { kind: 'block', type: 'bs_quand_touche' },
        { kind: 'block', type: 'bs_touche_enfoncee', fields: { TOUCHE: 'droite' } },
        { kind: 'block', type: 'bs_derniere_touche' },
        etiquette('Souris'),
        { kind: 'block', type: 'bs_quand_souris_fenetre' },
        { kind: 'block', type: 'bs_souris_fenetre' },
        { kind: 'block', type: 'bs_souris_fenetre', fields: { QUOI: 'y' } },
        { kind: 'block', type: 'bs_souris_enfoncee' },
        etiquette('Manette de jeu (la croix fait aussi les flèches, A la touche Espace)'),
        { kind: 'block', type: 'bs_quand_manette', fields: { BOUTON: 'a' } },
        { kind: 'block', type: 'bs_manette_bouton', fields: { BOUTON: 'a' } },
        { kind: 'block', type: 'bs_manette_joystick' },
        { kind: 'block', type: 'bs_manette_branchee' }
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
          inputs: { VAL: texte('Quelle couleur préfères-tu ?'), LISTE: listeTextes('Rouge', 'Vert', 'Bleu') }
        },
        { kind: 'block', type: 'bs_nombre' }
      ]
    },
    {
      kind: 'category', name: 'Windows', colour: COULEUR_WINDOWS, contents: [
        etiquette('Notifications'),
        { kind: 'block', type: 'bs_notification', inputs: { TITRE: texte('Rappel'), VAL: texte('C\'est l\'heure de la pause !') }, fields: { ICONE: 'info' } },
        etiquette('Presse-papiers'),
        { kind: 'block', type: 'bs_copier', inputs: { VAL: texte('Bonjour !') } },
        { kind: 'block', type: 'bs_presse_papiers' },
        { kind: 'block', type: 'bs_copier_image' },
        etiquette('Impression'),
        { kind: 'block', type: 'bs_imprimer_texte', inputs: { VAL: texte('Ma liste de courses') } },
        { kind: 'block', type: 'bs_imprimer' },
        { kind: 'block', type: 'bs_imprimer_fenetre', fields: { FENETRE: '' } }
      ]
    },
    {
      kind: 'category', name: 'Sons et temps', colour: COULEUR_SONS, contents: [
        { kind: 'button', text: '🎵 Importer un son…', callbackKey: 'importerSon' },
        { kind: 'button', text: '🎤 Enregistrer avec le micro…', callbackKey: 'enregistrerSon' },
        { kind: 'button', text: '🎹 Composer une musique 8 bits…', callbackKey: 'composerMusique' },
        { kind: 'block', type: 'bs_son' },
        { kind: 'block', type: 'bs_son_mode' },
        { kind: 'block', type: 'bs_son_arreter' },
        { kind: 'block', type: 'bs_sons_arreter' },
        { kind: 'block', type: 'bs_son_volume', fields: { SON: '*' }, inputs: { VOL: nombre(30) } },
        etiquette('Voix'),
        { kind: 'block', type: 'bs_dire', inputs: { VAL: texte('Bonjour, je suis ton ordinateur !') }, fields: { ATTENDRE: 'oui' } },
        { kind: 'block', type: 'bs_voix_regler', inputs: { VITESSE: nombre(1), HAUTEUR: nombre(1) } },
        { kind: 'block', type: 'bs_voix_taire' },
        etiquette('Musique et temps'),
        { kind: 'block', type: 'bs_note', inputs: { SEC: nombre(0.5) } },
        { kind: 'block', type: 'bs_attendre', inputs: { SEC: nombre(1) } },
        { kind: 'block', type: 'bs_maintenant' },
        { kind: 'block', type: 'bs_temps_texte', inputs: { VAL: nombre(213) } }
      ]
    },
    {
      kind: 'category', name: 'Mémoire', colour: COULEUR_MEMOIRE, contents: [
        { kind: 'block', type: 'bs_memoriser', inputs: { VAL: texte('Marie'), NOM: texte('prénom') } },
        { kind: 'block', type: 'bs_memoire', inputs: { NOM: texte('prénom') } },
        { kind: 'block', type: 'bs_oublier', inputs: { NOM: texte('prénom') } },
        { kind: 'block', type: 'bs_tout_oublier' },
        etiquette('Fichiers (pour plus de choix : un contrôle 📁 Fichier)'),
        { kind: 'block', type: 'bs_fichier_enregistrer', inputs: { VAL: texte('Bonjour !'), NOM: texte('mon fichier.txt') } },
        { kind: 'block', type: 'bs_fichier_ouvrir' }
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
        { kind: 'block', type: 'controls_for', inputs: { FROM: nombre(1), TO: nombre(10), BY: nombre(1) } },
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
        { kind: 'block', type: 'bs_format_nombre', inputs: { VAL: nombre(3.14159), DEC: nombre(2) } },
        { kind: 'block', type: 'math_modulo' },
        { kind: 'block', type: 'math_number_property' },
        { kind: 'block', type: 'math_random_int', inputs: { FROM: nombre(1), TO: nombre(100) } },
        { kind: 'block', type: 'math_random_float' },
        { kind: 'block', type: 'bs_chance', inputs: { VAL: nombre(50) } },
        { kind: 'block', type: 'bs_couleur', fields: { COUL: 'hasard' } },
        { kind: 'block', type: 'math_constrain', inputs: { VALUE: nombre(50), LOW: nombre(0), HIGH: nombre(100) } },
        { kind: 'block', type: 'math_on_list' },
        { kind: 'block', type: 'math_trig', inputs: { NUM: nombre(45) } },
        { kind: 'block', type: 'math_constant' }
      ]
    },
    {
      kind: 'category', name: 'Internet', colour: COULEUR_INTERNET, contents: [
        etiquette('Météo (il faut une connexion à Internet)'),
        { kind: 'block', type: 'bs_meteo', inputs: { VAL: texte('Paris') } },
        { kind: 'block', type: 'bs_meteo', inputs: { VAL: texte('Paris') }, fields: { QUOI: 'emoji' } },
        etiquette('Données d\'un service Internet'),
        { kind: 'block', type: 'bs_web_lire', inputs: { VAL: texte('https://api.open-meteo.com/v1/forecast?latitude=48.85&longitude=2.35&current=temperature_2m') } },
        { kind: 'block', type: 'bs_json_valeur', inputs: { CHEMIN: texte('current.temperature_2m') } },
        etiquette('Pages web'),
        { kind: 'block', type: 'bs_web_ouvrir', inputs: { VAL: texte('www.google.fr') } }
      ]
    },
    {
      kind: 'category', name: 'Conversions', colour: COULEUR_CONVERSIONS, contents: [
        etiquette('Temps'),
        { kind: 'block', type: 'bs_temps_texte', inputs: { VAL: nombre(213) } },
        { kind: 'block', type: 'bs_temps_secondes', inputs: { VAL: texte('3:33') } },
        { kind: 'block', type: 'bs_convertir_temps', inputs: { VAL: nombre(90) } },
        etiquette('Distances'),
        { kind: 'block', type: 'bs_convertir_distance', inputs: { VAL: nombre(1) }, fields: { DE: 'kilometres', VERS: 'metres' } },
        etiquette('Masses'),
        { kind: 'block', type: 'bs_convertir_masse', inputs: { VAL: nombre(1.5) }, fields: { DE: 'kilogrammes', VERS: 'grammes' } },
        etiquette('Volumes'),
        { kind: 'block', type: 'bs_convertir_volume', inputs: { VAL: nombre(1) }, fields: { DE: 'litres', VERS: 'centilitres' } },
        etiquette('Températures'),
        { kind: 'block', type: 'bs_convertir_temperature', inputs: { VAL: nombre(20) } }
      ]
    },
    {
      kind: 'category', name: 'Texte', categorystyle: 'text_category', contents: [
        { kind: 'block', type: 'text' },
        { kind: 'block', type: 'bs_emoji' },
        { kind: 'block', type: 'text_join' },
        { kind: 'block', type: 'bs_retour_ligne' },
        { kind: 'block', type: 'bs_texte_repete', inputs: { VAL: texte('❤️'), FOIS: nombre(3) } },
        { kind: 'block', type: 'bs_format_nombre', inputs: { VAL: nombre(3.14159), DEC: nombre(2) } },
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
        { kind: 'block', type: 'bs_nombre' },
        { kind: 'block', type: 'bs_couleur' }
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
        { kind: 'block', type: 'lists_getIndex', fields: { WHERE: 'RANDOM' } },
        { kind: 'block', type: 'lists_setIndex' },
        { kind: 'block', type: 'lists_indexOf' },
        { kind: 'block', type: 'lists_getSublist', inputs: { AT1: nombre(1), AT2: nombre(3) } },
        { kind: 'block', type: 'lists_sort' },
        { kind: 'block', type: 'bs_liste_melanger' },
        { kind: 'block', type: 'lists_reverse' },
        { kind: 'block', type: 'lists_split', inputs: { DELIM: texte(',') } }
      ]
    },
    { kind: 'category', name: 'Variables', categorystyle: 'variable_category', custom: 'VARIABLE' },
    { kind: 'category', name: 'Fonctions', categorystyle: 'procedure_category', custom: 'PROCEDURE' }
  ];

  // Avancé : les blocs où l'on choisit le contrôle dans une liste (utile avec « 👉 moi » dans les clones).
  const TOUS_LES_CONTROLES = {
    kind: 'category', name: 'Tous les contrôles', colour: COULEUR_CONTROLES, toolboxitemid: 'tous-les-controles', contents: [
      etiquette('Blocs où l\'on choisit le contrôle (et « 👉 moi » pour un clone)'),
      { kind: 'block', type: 'bs_ecrire', inputs: { VAL: texte('Bonjour') } },
      { kind: 'block', type: 'bs_lire' },
      { kind: 'block', type: 'bs_couleur' },
      { kind: 'block', type: 'bs_quand_clic' },
      { kind: 'block', type: 'bs_quand_change' },
      { kind: 'block', type: 'bs_quand_souris_ctrl' },
      { kind: 'block', type: 'bs_se_touchent' },
      { kind: 'block', type: 'bs_cote_contact' },
      { kind: 'block', type: 'bs_touche_couleur', inputs: { COUL: couleurOmbre() } },
      { kind: 'block', type: 'bs_rebondir_sur' },
      { kind: 'block', type: 'bs_gravite', inputs: { FORCE: nombre(1) } },
      { kind: 'block', type: 'bs_sauter', inputs: { FORCE: nombre(12) } },
      { kind: 'block', type: 'bs_au_sol' },
      { kind: 'block', type: 'bs_compteur_ajouter', inputs: { VAL: nombre(1) } },
      { kind: 'block', type: 'bs_compteur_valeur' },
      { kind: 'block', type: 'bs_placer', inputs: { X: nombre(0), Y: nombre(0) } },
      { kind: 'block', type: 'bs_glisser', inputs: { X: nombre(200), Y: nombre(100), SEC: nombre(1) } },
      { kind: 'block', type: 'bs_radio_groupe' },
      { kind: 'block', type: 'bs_supprimer_clone' }
    ]
  };

  // Valeur proposée dans « mettre … à » : celle du contrôle dans le concepteur, quand c'est possible.
  const PROPS_NOMBRE = ['x', 'y', 'largeur', 'hauteur', 'taillePolice', 'valeur', 'min', 'max', 'pas', 'numero', 'volume',
    'position', 'intervalle', 'costume', 'vitesse', 'rotation', 'direction', 'taille', 'transparence', 'seuilMouvement', 'maxValeurs', 'longueurMax', 'epaisseur', 'heures', 'minutes',
    'defilementX', 'defilementY', 'largeurContenu', 'hauteurContenu', 'vitesseY'];
  const PROPS_COULEUR = ['couleurTexte', 'couleurFond', 'couleurBarre', 'couleurBordure'];
  const PROPS_LISTE = ['elements', 'colonnes', 'valeurs', 'etiquettes', 'champs'];
  const PROPS_OUI_NON = ['visible', 'active', 'coche', 'deplacable', 'boucle', 'miroir', 'memoriser', 'motDePasse', 'allumee', 'cliquable',
    'gras', 'italique', 'lectureSeule', 'trie', 'solide'];
  // Propriétés à choix : la valeur proposée est un autre choix que celui par défaut.
  const CHOIX_PROPOSE = { alignement: 'centre', bordure: 'simple', ajustement: 'recadree', defilement: 'vertical', orientation: 'verticale', collision: 'rectangle' };

  function valeurProposee(c, prop) {
    if (PROPS_COULEUR.includes(prop)) return couleurOmbre();
    if (PROPS_LISTE.includes(prop)) return undefined;
    if (PROPS_NOMBRE.includes(prop)) {
      const v = Number(c[prop]);
      return nombre(Number.isFinite(v) ? v : prop === 'numero' ? 1 : prop === 'direction' ? 90 : 0);
    }
    if (PROPS_OUI_NON.includes(prop)) return ombre('logic_boolean', { BOOL: prop === 'visible' ? 'FALSE' : 'TRUE' });
    const v = typeof c[prop] === 'string' && c[prop].length < 60 ? c[prop] : CHOIX_PROPOSE[prop] || '';
    return texte(v);
  }

  function couleurDuType(type) {
    if (type === 'sprite') return COULEUR_SPRITES;
    if (type === 'zonedessin') return COULEUR_DESSIN;
    if (type === 'basedonnees') return COULEUR_BASE;
    if (type === 'fichier') return COULEUR_FICHIERS;
    if (type === 'son' || type === 'video') return COULEUR_SONS;
    if (type === 'minuteur') return COULEUR_EVENEMENTS;
    return COULEUR_CONTROLES;
  }

  // Un autre contrôle visible (un sprite de préférence), pour « si … touche …, rebondir ».
  function autreControle(c) {
    const autres = BlocStudio.controles().filter(x => x !== c && !BlocRuntime.INVISIBLES.includes(x.type));
    return (autres.find(x => x.type === 'sprite') || autres[0] || c).id;
  }

  // Les blocs d'un contrôle : ses événements, ses actions, puis ses propriétés (lire / mettre).
  function blocsDuControle(c) {
    const t = c.type;
    const b = (type, inputs, champs, autres) => Object.assign(
      { kind: 'block', type, fields: Object.assign({ CTRL: c.id }, champs) }, inputs && { inputs }, autres);
    const evenements = [], actions = [];
    const visible = !BlocRuntime.INVISIBLES.includes(t);

    if (TYPES_CHANGE.includes(t)) evenements.push(b('bs_quand_change'));
    if (t === 'zonedessin') evenements.push(b('bs_quand_glisse'));
    if (t === 'camera') evenements.push(b('bs_quand_camera_mouvement'));
    if (t === 'son' || t === 'video') evenements.push(b('bs_quand_son_fin'));
    if (t === 'minuteur') evenements.push(b('bs_quand_minuteur'));
    if (t === 'fichier') evenements.push(b('bs_quand_fichier_depose'));
    // Un bloc « quand… » tout prêt pour chaque élément du menu ou bouton de la barre.
    if (t === 'menucontextuel') BlocRuntime.elementsMenuContextuel(c.menu).forEach(e => evenements.push(b('bs_quand_menu_contextuel', null, { ITEM: e })));
    if (t === 'barreoutils') BlocRuntime.elementsBarreOutils(c.boutons).forEach(e => evenements.push(b('bs_quand_outil', null, { ITEM: e })));
    if (visible) evenements.push(b('bs_quand_clic'), b('bs_quand_souris_ctrl'));
    if (CLONABLES.includes(t)) evenements.push(b('bs_quand_clone'));

    const mouvement = () => [
      etiquette('Mouvement'),
      b('bs_avancer', { PAS: nombre(10) }),
      b('bs_deplacer', { DX: nombre(10), DY: nombre(0) }),
      b('bs_placer', { X: nombre(0), Y: nombre(0) }),
      b('bs_placer_sur'),
      b('bs_glisser', { X: nombre(200), Y: nombre(100), SEC: nombre(1) }),
      b('bs_orienter', { DIR: nombre(90) }),
      b('bs_orienter_vers'),
      b('bs_tourner_direction', { DEG: nombre(15) }),
      b('bs_direction'),
      b('bs_rebondir'),
      b('bs_rebondir_sur', null, { CTRL2: autreControle(c) }),
      b('bs_touche_bord'),
      b('bs_distance'),
      b('bs_se_touchent'),
      b('bs_cote_contact'),
      b('bs_touche_couleur', { COUL: couleurOmbre() }),
      etiquette('Gravité et saut (jeux de plateforme)'),
      b('bs_gravite', { FORCE: nombre(1) }),
      b('bs_sauter', { FORCE: nombre(12) }),
      b('bs_au_sol')
    ];
    const clones = () => [
      etiquette('Clones'),
      b('bs_creer_clone'),
      { kind: 'block', type: 'bs_supprimer_clone' },
      b('bs_supprimer_clones'),
      b('bs_nombre_clones')
    ];

    switch (t) {
      case 'sprite':
        actions.push(
          { kind: 'button', text: '🎨 Dessiner un sprite…', callbackKey: 'nouveauSprite', 'web-class': 'bouton-sprite' },
          { kind: 'button', text: '📁 Importer une image…', callbackKey: 'importerSprite', 'web-class': 'bouton-sprite' },
          etiquette('Costumes et animation'),
          b('bs_sprite_animer'), b('bs_sprite_arreter'), b('bs_sprite_suivant'),
          b('bs_sprite_costume', { VAL: nombre(1) }), b('bs_sprite_numero'),
          b('bs_sprite_changer'),
          etiquette('Orientation et effets'),
          b('bs_sprite_regarder'), b('bs_sprite_tourner', { DEG: nombre(15) }),
          b('bs_sprite_taille', { VAL: nombre(150) }), b('bs_sprite_grandir', { VAL: nombre(10) }),
          b('bs_sprite_transparence', { VAL: nombre(50) }), b('bs_sprite_fondu', { SEC: nombre(1) }),
          ...mouvement(), ...clones());
        break;
      case 'image':
        actions.push(etiquette('Fond qui défile'), b('bs_image_defiler', { DX: nombre(-2), DY: nombre(0) }), ...mouvement(), ...clones());
        break;
      case 'forme':
        actions.push(...mouvement(), ...clones());
        break;
      case 'etiquette':
        actions.push(etiquette('Score, vies…'), b('bs_compteur_ajouter', { VAL: nombre(1) }), b('bs_compteur_valeur'),
          ...mouvement(), ...clones());
        break;
      case 'barreprogression':
        actions.push(b('bs_compteur_ajouter', { VAL: nombre(-10) }), b('bs_compteur_valeur'));
        break;
      case 'zonedessin':
        actions.push(etiquette('Dessin'),
          b('bs_dessin_couleur', { VAL: couleurOmbre() }),
          b('bs_dessin_epaisseur', { VAL: nombre(3) }),
          b('bs_dessin_trait', { X1: nombre(10), Y1: nombre(10), X2: nombre(100), Y2: nombre(80) }),
          b('bs_dessin_rectangle', { X: nombre(20), Y: nombre(20), L: nombre(80), H: nombre(50) }),
          b('bs_dessin_cercle', { X: nombre(60), Y: nombre(60), R: nombre(30) }),
          b('bs_dessin_point', { X: nombre(50), Y: nombre(50) }),
          b('bs_dessin_texte', { TXT: texte('Bonjour'), X: nombre(10), Y: nombre(10), T: nombre(20) }),
          b('bs_dessin_effacer'),
          etiquette('Souris'),
          b('bs_souris'), b('bs_souris', null, { QUOI: 'y' }));
        break;
      case 'listederoulante': case 'zoneliste':
        actions.push(b('bs_liste_ajouter', { VAL: texte('Nouveau choix') }), b('bs_liste_retirer', { NUM: nombre(1) }), b('bs_liste_vider'));
        break;
      case 'tableau':
        actions.push(
          b('bs_tableau_ajouter', { LIGNE: listeTextes('Dupont', 'Marie') }),
          b('bs_tableau_supprimer', { NUM: nombre(1) }),
          b('bs_tableau_remplacer', { NUM: nombre(1), LIGNE: listeTextes('Dupont', 'Marie') }),
          b('bs_tableau_ecrire_cellule', { COL: texte('Nom'), NUM: nombre(1), VAL: texte('Martin') }),
          b('bs_tableau_vider'),
          b('bs_tableau_trier', { COL: texte('Nom') }),
          b('bs_tableau_cellule', { COL: texte('Nom'), NUM: nombre(1) }),
          b('bs_tableau_ligne', { NUM: nombre(1) }),
          b('bs_tableau_colonne', { COL: texte('Nom') }),
          b('bs_tableau_chercher', { COL: texte('Nom'), VAL: texte('Dupont') }),
          b('bs_base_choisie'),
          etiquette('Fichiers (CSV, lisible par Excel)'),
          b('bs_tableau_csv'), b('bs_tableau_remplir_csv'));
        break;
      case 'graphique':
        actions.push(b('bs_graphique_ajouter', { VAL: nombre(10), ETIQ: texte('Sam') }), b('bs_graphique_vider'));
        break;
      case 'panneau': {
        // « pour montrer » propose d'abord un contrôle posé dans ce panneau.
        const dedans = BlocStudio.controles().find(o => o.panneau === c.id);
        actions.push(b('bs_panneau_defiler'), b('bs_panneau_defiler', null, { QUOI: 'haut' }),
          b('bs_panneau_montrer', null, dedans ? { CIBLE: dedans.id } : {}));
        break;
      }
      case 'arborescence':
        actions.push(
          b('bs_arbre_ajouter', { VAL: texte('Chats'), DANS: texte('Animaux') }),
          b('bs_arbre_supprimer', { CHEMIN: texte('Animaux › Chats') }),
          b('bs_arbre_ctrl'),
          b('bs_arbre_enfants', { CHEMIN: texte('Animaux') }));
        break;
      case 'barreetat':
        actions.push(b('bs_barreetat_ecrire', { VAL: texte('Prêt'), NUM: nombre(1) }), b('bs_barreetat_case', { NUM: nombre(1) }));
        break;
      case 'camera':
        actions.push(b('bs_camera_ctrl'), b('bs_camera_ctrl', null, { ACTION: 'eteindre' }), b('bs_camera_photo'), b('bs_camera_photo_dans'));
        break;
      case 'son': case 'video':
        actions.push(b('bs_sonctrl'), b('bs_sonctrl', null, { ACTION: 'arreter' }));
        break;
      case 'minuteur':
        actions.push(b('bs_minuteur_ctrl'), b('bs_minuteur_ctrl', null, { ACTION: 'arreter' }));
        break;
      case 'boutonradio':
        actions.push({ kind: 'block', type: 'bs_radio_groupe', fields: { GROUPE: c.groupe || 'groupe1' } });
        break;
      case 'fichier':
        actions.push(
          b('bs_fichier_ouvrir_avec'), b('bs_fichier_contenu'),
          b('bs_fichier_enregistrer_avec', { VAL: texte('Bonjour !') }),
          b('bs_fichier_annule'), b('bs_fichier_nom'),
          etiquette('Raccourcis : un tableau, une base, une image, un dessin, une photo'),
          b('bs_fichier_ouvrir_dans'), b('bs_fichier_enregistrer_de'));
        break;
      case 'basedonnees':
        actions.push(
          etiquette('Ajouter et montrer'),
          b('bs_base_ajouter', null, null, { extraState: { champs: (c.champs || []).slice() } }),
          b('bs_base_afficher'),
          etiquette('Chercher'),
          b('bs_base_chercher', { VAL: texte('') }),
          b('bs_base_premiere', { VAL: texte('') }),
          etiquette('Lire et modifier une fiche'),
          b('bs_base_champ', { N: nombre(1) }),
          b('bs_base_modifier', { N: nombre(1), VAL: texte('') }),
          b('bs_base_supprimer', { N: nombre(1) }),
          etiquette('Toute la base'),
          b('bs_base_nombre'), b('bs_base_trier'), b('bs_base_colonne'), b('bs_base_vider'),
          etiquette('Fichiers (CSV, lisible par Excel)'),
          b('bs_base_csv'), b('bs_base_remplir'));
        break;
    }

    if (FOCUSABLES.includes(t)) actions.push(b('bs_focus'));
    if (t === 'menucontextuel') {
      const premier = BlocRuntime.elementsMenuContextuel(c.menu)[0] || '';
      actions.push(b('bs_menu_contextuel_source'), b('bs_menu_contextuel_montrer'),
        b('bs_menu_contextuel_actif', null, { ITEM: premier, ACTIF: 'FALSE' }), b('bs_menu_contextuel_actif', null, { ITEM: premier }));
    }
    if (t === 'barreoutils') {
      const premier = BlocRuntime.elementsBarreOutils(c.boutons)[0] || '';
      actions.push(b('bs_outil_actif', null, { ITEM: premier, ACTIF: 'FALSE' }), b('bs_outil_actif', null, { ITEM: premier }));
    }

    // Propriétés : « … de Bouton1 » et « mettre … de Bouton1 à … », pour chacune.
    const proprietes = [];
    const ecriture = proprietesPour(t, true).map(o => o[1]);
    for (const [, prop] of proprietesPour(t, false)) {
      proprietes.push(b('bs_lire', null, { PROP: prop }));
      if (ecriture.includes(prop)) {
        const v = valeurProposee(c, prop);
        proprietes.push(b('bs_ecrire', v ? { VAL: v } : undefined, { PROP: prop }));
      }
    }

    return [
      ...(evenements.length ? [etiquette('Événements'), ...evenements] : []),
      ...(actions.length && actions[0].kind !== 'label' && actions[0].kind !== 'button' ? [etiquette('Actions')] : []),
      ...actions,
      ...(proprietes.length ? [etiquette('Propriétés'), ...proprietes] : [])
    ];
  }

  // Une fenêtre : ses propres blocs, puis une catégorie par contrôle posé dessus.
  function categorieFenetre(f, principale, icones) {
    const contenu = [];
    if (principale) {
      contenu.push(
        { kind: 'button', text: '🪟 Créer une autre fenêtre…', callbackKey: 'nouvelleFenetre', 'web-class': 'bouton-fenetre' },
        { kind: 'block', type: 'bs_quand_demarre' },
        { kind: 'block', type: 'bs_fond_fenetre', inputs: { VAL: couleurOmbre() } },
        { kind: 'block', type: 'bs_fenetre_titre', fields: { FENETRE: '' }, inputs: { VAL: texte(f.titre || 'Mon programme') } });
      if (BlocRuntime.cheminsMenus(f.menus).length) {
        contenu.push(etiquette('Menus'), { kind: 'block', type: 'bs_quand_menu' }, { kind: 'block', type: 'bs_menu_actif' });
      }
    } else {
      const fen = (type, champs, inputs) => Object.assign({ kind: 'block', type, fields: Object.assign({ FENETRE: f.id }, champs) }, inputs && { inputs });
      contenu.push(
        fen('bs_fenetre_ouvrir'), fen('bs_fenetre_ouvrir', { MODE: 'attendre' }),
        fen('bs_fenetre_fermer'),
        fen('bs_quand_fenetre'), fen('bs_quand_fenetre', { QUOI: 'fermeture' }),
        fen('bs_fenetre_titre', null, { VAL: texte(f.titre || f.nom) }),
        fen('bs_fenetre_ouverte'));
    }
    // Sa taille : la principale a l'identifiant ''.
    const taille = (type, champs, inputs) => Object.assign({ kind: 'block', type, fields: Object.assign({ FENETRE: principale ? '' : f.id }, champs) }, inputs && { inputs });
    contenu.push(etiquette('Taille'),
      taille('bs_quand_fenetre_taille'),
      taille('bs_fenetre_dimension'), taille('bs_fenetre_dimension', { QUOI: 'hauteur' }),
      taille('bs_fenetre_changer_taille', null, { L: nombre(f.largeur), H: nombre(f.hauteur) }));
    const ctrls = BlocStudio.controles().filter(c => (c.fenetre || '') === (principale ? '' : f.id));
    if (!ctrls.length) contenu.push(etiquette('Posez des contrôles sur cette fenêtre (onglet Fenêtre) : chacun aura ici ses blocs.'));
    for (const c of ctrls) {
      contenu.push({
        kind: 'category', name: `${icones[c.type] || '🔹'} ${c.nom}`, colour: couleurDuType(c.type),
        toolboxitemid: 'ctrl-' + c.id, contents: blocsDuControle(c)
      });
    }
    return {
      kind: 'category', name: '🪟 ' + (principale ? 'Fenêtre principale' : f.nom), colour: COULEUR_FENETRES,
      toolboxitemid: 'fen-' + (principale ? 'principale' : f.id), expanded: 'true', contents: contenu
    };
  }

  // `icones` : l'icône de chaque type de contrôle (la même que dans la palette).
  window.BlocStudioBoite = function (icones) {
    return {
      kind: 'categoryToolbox',
      contents: [
        ...GENERAUX,
        { kind: 'sep' },
        categorieFenetre(BlocStudio.fenetre(), true, icones),
        ...BlocStudio.fenetres().map(f => categorieFenetre(f, false, icones)),
        TOUS_LES_CONTROLES
      ]
    };
  };
})();
