// Programmes d'exemple, accessibles depuis le bouton « 📚 Exemples ».
// Les blocs sont décrits avec de petites fonctions pour rester lisibles.
(function () {
  // ---------- Outils de construction ----------

  const I = b => ({ block: b });

  // Enchaîne des blocs instruction les uns sous les autres.
  function seq(...blocs) {
    blocs = blocs.flat().filter(Boolean);
    for (let i = blocs.length - 2; i >= 0; i--) blocs[i].next = I(blocs[i + 1]);
    return blocs[0];
  }
  const corps = blocs => I(seq(blocs));

  // Valeurs
  const n = v => ({ type: 'math_number', fields: { NUM: v } });
  const t = s => ({ type: 'text', fields: { TEXT: s } });
  const v = id => ({ type: 'variables_get', fields: { VAR: { id } } });
  const lire = (prop, id) => ({ type: 'bs_lire', fields: { PROP: prop, CTRL: id } });
  const joindre = (...p) => ({
    type: 'text_join', extraState: { itemCount: p.length },
    inputs: Object.fromEntries(p.map((x, i) => ['ADD' + i, I(x)]))
  });
  const calc = (op, a, b) => ({ type: 'math_arithmetic', fields: { OP: op }, inputs: { A: I(a), B: I(b) } });
  const compare = (op, a, b) => ({ type: 'logic_compare', fields: { OP: op }, inputs: { A: I(a), B: I(b) } });
  const ou = (a, b) => ({ type: 'logic_operation', fields: { OP: 'OR' }, inputs: { A: I(a), B: I(b) } });
  const hasard = (a, b) => ({ type: 'math_random_int', inputs: { FROM: I(n(a)), TO: I(n(b)) } });
  const vrai = b => ({ type: 'logic_boolean', fields: { BOOL: b ? 'TRUE' : 'FALSE' } });
  const couleur = c => ({ type: 'bs_couleur', fields: { COUL: c } });
  const souris = (quoi, id) => ({ type: 'bs_souris', fields: { QUOI: quoi, CTRL: id } });
  const confirmer = s => ({ type: 'bs_confirmer', inputs: { VAL: I(t(s)) } });
  const demanderNombre = x => ({ type: 'bs_demander_nombre', inputs: { VAL: I(x) } });

  // Instructions
  const fixer = (id, x) => ({ type: 'variables_set', fields: { VAR: { id } }, inputs: { VALUE: I(x) } });
  const ajouter = (id, x) => ({ type: 'math_change', fields: { VAR: { id } }, inputs: { DELTA: I(x) } });
  const ecrire = (id, prop, x) => ({ type: 'bs_ecrire', fields: { CTRL: id, PROP: prop }, inputs: { VAL: I(x) } });
  const message = (x, icone) => ({ type: 'bs_message', fields: { ICONE: icone || 'info' }, inputs: { VAL: I(x) } });
  const attendre = s => ({ type: 'bs_attendre', inputs: { SEC: I(n(s)) } });
  const si = (cond, alors, sinon) => {
    const b = { type: 'controls_if', inputs: { IF0: I(cond), DO0: corps(alors) } };
    if (sinon) {
      b.extraState = { hasElse: true };
      b.inputs.ELSE = corps(sinon);
    }
    return b;
  };
  const repeter = (fois, blocs) => ({ type: 'controls_repeat_ext', inputs: { TIMES: I(n(fois)), DO: corps(blocs) } });
  const tantQue = (cond, blocs) => ({ type: 'controls_whileUntil', fields: { MODE: 'WHILE' }, inputs: { BOOL: I(cond), DO: corps(blocs) } });
  const pour = (id, de, a, blocs) => ({
    type: 'controls_for', fields: { VAR: { id } },
    inputs: { FROM: I(n(de)), TO: I(n(a)), BY: I(n(1)), DO: corps(blocs) }
  });
  const retourLigne = () => ({ type: 'bs_retour_ligne' });
  const radioChoisi = g => ({ type: 'bs_radio_groupe', fields: { GROUPE: g } });
  const estVide = x => ({ type: 'text_isEmpty', inputs: { VALUE: I(x) } });
  const listeAjouter = (id, x) => ({ type: 'bs_liste_ajouter', fields: { CTRL: id }, inputs: { VAL: I(x) } });
  const listeRetirer = (id, x) => ({ type: 'bs_liste_retirer', fields: { CTRL: id }, inputs: { NUM: I(x) } });
  const listeVider = id => ({ type: 'bs_liste_vider', fields: { CTRL: id } });
  const toujours = blocs => ({ type: 'bs_toujours', inputs: { DO: corps(blocs) } });
  const dessin = (type, id, entrees, champs) => ({
    type, fields: Object.assign({ CTRL: id }, champs),
    inputs: Object.fromEntries(Object.entries(entrees || {}).map(([k, x]) => [k, I(x)]))
  });

  // Bloc quelconque : contrôle (ou null), entrées et champs.
  const bloc = (type, ctrl, entrees, champs) => ({
    type, fields: Object.assign(ctrl ? { CTRL: ctrl } : {}, champs),
    inputs: Object.fromEntries(Object.entries(entrees || {}).map(([k, x]) => [k, I(x)]))
  });
  const liste = (...p) => ({
    type: 'lists_create_with', extraState: { itemCount: p.length },
    inputs: Object.fromEntries(p.map((x, i) => ['ADD' + i, I(x)]))
  });

  // Événements
  let y = 0;
  function evtMenu(chemin, blocs) {
    const b = evt('bs_quand_menu', null, blocs);
    b.fields = { MENU: chemin };
    return b;
  }
  function evt(type, ctrl, blocs) {
    const b = { type, x: 20, y, inputs: { DO: corps(blocs) } };
    if (ctrl) b.fields = { CTRL: ctrl };
    y += 60 + 45 * JSON.stringify(blocs).split('"type"').length / 3;
    return b;
  }

  function projet(fenetre, controles, variables, evenements) {
    y = 0;
    const blocs = evenements();
    const p = {
      format: 'BlocStudio', version: 1,
      fenetre: Object.assign({ couleurFond: '#f0f0f0' }, fenetre),
      controles: controles.map((c, i) => Object.assign({
        id: 'c' + (i + 1), texte: '', x: 20, y: 20, largeur: 120, hauteur: 28,
        couleurTexte: '#000000', couleurFond: '', taillePolice: 14,
        visible: true, coche: false, image: ''
      }, c)),
      blocs: { blocks: { languageVersion: 0, blocks: blocs } },
      prochainId: controles.length + 1
    };
    if (variables.length) p.blocs.variables = variables.map(nom => ({ name: nom, id: 'v_' + nom }));
    return p;
  }

  const et = (a, b) => ({ type: 'logic_operation', fields: { OP: 'AND' }, inputs: { A: I(a), B: I(b) } });
  const non = a => ({ type: 'logic_negate', inputs: { BOOL: I(a) } });
  const fonction = (nom, blocs) => {
    const b = evt('procedures_defnoreturn', null, blocs);
    b.fields = { NAME: nom };
    b.inputs = { STACK: b.inputs.DO };
    return b;
  };
  // Événement dont les champs ne sont pas un contrôle (touche, action de la souris…).
  const evtChamps = (type, champs, blocs) => Object.assign(evt(type, null, blocs), { fields: champs });
  const appeler = nom => ({ type: 'procedures_callnoreturn', extraState: { name: nom } });

  // Costume de sprite dessiné pixel par pixel : `dessin(x, y)` renvoie la couleur (ou rien = transparent).
  function costume(taille, dessin) {
    const c = document.createElement('canvas');
    c.width = c.height = taille;
    const g = c.getContext('2d');
    for (let y = 0; y < taille; y++) {
      for (let x = 0; x < taille; x++) {
        const couleur = dessin(x, y);
        if (couleur) { g.fillStyle = couleur; g.fillRect(x, y, 1, 1); }
      }
    }
    return c.toDataURL('image/png');
  }

  // Pièce qui tourne sur elle-même : 6 costumes, de face puis de plus en plus de profil.
  function spritePiece() {
    const largeurs = [6.5, 5, 3, 1.2, 3, 5];
    const costumes = largeurs.map((rx, i) => ({
      nom: 'pièce ' + (i + 1),
      donnees: costume(16, (x, y) => {
        const dedans = (a, b) => ((a + 0.5 - 8) / rx) ** 2 + ((b + 0.5 - 8) / 7) ** 2 <= 1;
        if (!dedans(x, y)) return null;
        if (!dedans(x - 1, y) || !dedans(x + 1, y) || !dedans(x, y - 1) || !dedans(x, y + 1)) return '#8a5a00';
        if (rx > 2 && x + 0.5 < 8 - rx * 0.35) return '#fff3a0';          // reflet
        if (rx > 4 && x >= 7 && x <= 8 && y >= 5 && y <= 10) return '#c98f00'; // gravure
        return '#f5c518';
      })
    }));
    return { id: 'spr_piece', nom: 'Pièce', taille: 16, lisse: false, vitesse: 10, costumes };
  }

  // Panier en osier (24 × 24) : un trapèze tressé, ouvert en haut.
  function spritePanier() {
    const donnees = costume(24, (x, y) => {
      if (y < 9 || y > 22) return null;
      const retrait = Math.floor((y - 9) / 6); // les côtés se resserrent vers le bas
      if (x < retrait || x > 23 - retrait) return null;
      if (y <= 10) return y === 9 ? '#5c3412' : '#8b5a2b';                  // rebord
      if (y === 22 || x === retrait || x === 23 - retrait) return '#5c3412'; // contour
      return (Math.floor(x / 2) + Math.floor((y - 11) / 2)) % 2 ? '#c68642' : '#a0612b'; // tressage
    });
    return { id: 'spr_panier', nom: 'Panier', taille: 24, lisse: false, vitesse: 8, costumes: [{ nom: 'panier', donnees }] };
  }

  // Dessin en pixel art décrit par des lignes de caractères ('.' = transparent).
  const dessinTexte = (lignes, couleurs, miroir) =>
    costume(lignes.length, (x, y) => couleurs[lignes[y][miroir ? lignes.length - 1 - x : x]] || null);

  function spriteVaisseau() {
    const haut = [
      '.......rr.......', '......rrrr......', '......wwww......', '.....wwwwww.....',
      '.....wwbbww.....', '.....wbccbw.....', '.....wbccbw.....', '.....wwbbww.....',
      '....wwwwwwww....', '...rwwwwwwwwr...', '..rrwwwwwwwwrr..', '..rr.wwwwww.rr..',
      '..r..gggggg..r..'
    ];
    const couleurs = { r: '#ff004d', w: '#f1f5f9', b: '#1d2b53', c: '#29adff', g: '#94a3b8', o: '#ffa300', y: '#ffec27' };
    const flammes = [
      ['......oyyo......', '.......oo.......', '................'],
      ['.....oyyyyo.....', '......oyyo......', '.......oo.......']
    ];
    return {
      id: 'spr_vaisseau', nom: 'Vaisseau', taille: 16, lisse: false, vitesse: 8,
      costumes: flammes.map((f, i) => ({ nom: 'flammes ' + (i + 1), donnees: dessinTexte(haut.concat(f), couleurs) }))
    };
  }

  function spriteMeteorite() {
    const lignes = [
      '................', '.....dddddd.....', '...ddmmmmmmdd...', '..dmmmmmmmmmmd..',
      '..dmmkkmmmmmmd..', '.dmmmkkmmmmmmmd.', '.dmmmmmmmmkkmmd.', '.dmmmmmmmmkkmmd.',
      '.dmmkmmmmmmmmmd.', '.dmmmmmmmkmmmmd.', '..dmmmmmmmmmmd..', '..dmmmkkmmmmmd..',
      '...ddmmkkmmdd...', '.....dddddd.....', '................', '................'
    ];
    const couleurs = { d: '#5f574f', m: '#ab5236', k: '#7e2553' };
    return {
      id: 'spr_meteorite', nom: 'Météorite', taille: 16, lisse: false, vitesse: 4,
      costumes: [
        { nom: 'météorite 1', donnees: dessinTexte(lignes, couleurs) },
        { nom: 'météorite 2', donnees: dessinTexte(lignes, couleurs, true) }
      ]
    };
  }

  // Petit fantôme (2 costumes : le bas de sa robe ondule).
  function spriteFantome() {
    const haut = [
      '................', '.....wwwwww.....', '....wwwwwwww....', '...wwwwwwwwww...',
      '..wwwwwwwwwwww..', '..wwkkwwwwkkww..', '..wwkkwwwwkkww..', '..wpwwwwwwwwpw..',
      '..wwwwwkkwwwww..', '..wwwwkkkkwwww..', '..wwwwwkkwwwww..', '..wwwwwwwwwwww..',
      '..wwwwwwwwwwww..', '..wwwwwwwwwwww..'
    ];
    const bas = [['..www.wwww.www..', '..ww...ww...ww..'], ['..wwww.ww.wwww..', '...ww..ww..ww...']];
    const couleurs = { w: '#f1f5f9', k: '#1e1b4b', p: '#f9a8d4' };
    return {
      id: 'spr_fantome', nom: 'Fantôme', taille: 16, lisse: false, vitesse: 4,
      costumes: bas.map((b, i) => ({ nom: 'fantôme ' + (i + 1), donnees: dessinTexte(haut.concat(b), couleurs) }))
    };
  }

  // Musique un peu inquiétante (la mineur), écrite comme dans le studio 8 bits :
  // on peut la retoucher avec « 🎹 Modifier » dans le Sommaire.
  function musiqueFantomes() {
    const m = { version: 1, tempo: 112, mesures: 4, pistes: [{ notes: [] }, { notes: [] }, { notes: [] }, { notes: [] }] };
    const ajouter = (piste, p, h, d) => m.pistes[piste].notes.push([p, h, d]);
    [[0, 69, 4], [4, 72, 2], [6, 76, 2], [8, 75, 4], [12, 74, 4],
     [16, 72, 2], [18, 74, 2], [20, 72, 2], [22, 71, 2], [24, 69, 8],
     [32, 76, 4], [36, 77, 2], [38, 76, 2], [40, 75, 4], [44, 71, 4],
     [48, 72, 2], [50, 71, 2], [52, 69, 2], [54, 68, 2], [56, 69, 8]].forEach(n => ajouter(0, ...n));
    const accords = [[64, 60], [65, 62], [64, 59], [64, 60]]; // la mineur, ré mineur, mi, la mineur
    const basses = [45, 50, 52, 45];
    for (let i = 0; i < 4; i++) {
      for (let k = 0; k < 4; k++) ajouter(1, 16 * i + 4 * k + 2, accords[i][k % 2], 1);
      [[0, 0], [4, 12], [8, 0], [12, 7]].forEach(([p, ecart]) => ajouter(2, 16 * i + p, basses[i] + ecart, 2));
      ajouter(3, 16 * i, 0, 1); ajouter(3, 16 * i + 10, 0, 1); ajouter(3, 16 * i + 8, 1, 1);
      for (let p = 2; p < 16; p += 4) ajouter(3, 16 * i + p, 2, 1);
    }
    return m;
  }

  // Petite musique « 8 bits » fabriquée par le programme (6,4 s, à jouer en boucle) :
  // WAV mono 11 025 Hz sur 8 bits, pour rester léger.
  function musiqueDeFond() {
    const F = 11025, croche = 0.2;
    const melodie = [0, 4, 7, 12, 7, 4, 0, 4, 5, 9, 12, 17, 12, 9, 5, 9,
      7, 11, 14, 19, 14, 11, 7, 11, 0, 4, 7, 12, 16, 12, 7, 4];
    const basses = [0, 5, 7, 0];
    const n = Math.round(melodie.length * croche * F);
    const octets = new Uint8Array(44 + n);
    const vue = new DataView(octets.buffer);
    const texte = (pos, s) => [...s].forEach((c, i) => { octets[pos + i] = c.charCodeAt(0); });
    texte(0, 'RIFF'); vue.setUint32(4, 36 + n, true); texte(8, 'WAVEfmt ');
    vue.setUint32(16, 16, true); vue.setUint16(20, 1, true); vue.setUint16(22, 1, true);
    vue.setUint32(24, F, true); vue.setUint32(28, F, true); vue.setUint16(32, 1, true); vue.setUint16(34, 8, true);
    texte(36, 'data'); vue.setUint32(40, n, true);
    for (let i = 0; i < n; i++) {
      const t = i / F;
      const k = Math.floor(t / croche);
      const dansNote = (t - k * croche) / croche;
      const fm = 523.25 * Math.pow(2, melodie[k] / 12);
      const fb = 130.81 * Math.pow(2, basses[Math.floor(k / 8)] / 12);
      const carre = ((t * fm) % 1 < 0.5 ? 1 : -1) * 0.22 * Math.max(0, 1 - dansNote * 0.85);
      const triangle = (4 * Math.abs((t * fb) % 1 - 0.5) - 1) * 0.3;
      octets[44 + i] = 128 + Math.round((carre + triangle) * 127);
    }
    let binaire = '';
    for (let i = 0; i < octets.length; i += 0x8000) binaire += String.fromCharCode.apply(null, octets.subarray(i, i + 0x8000));
    return 'data:audio/wav;base64,' + btoa(binaire);
  }

  // ---------- Les exemples ----------

  const exemples = [
    {
      titre: '👋 Bonjour',
      description: 'Le tout premier programme : une question, un bouton, une réponse.',
      creer: () => projet(
        { titre: 'Mon premier programme', largeur: 440, hauteur: 190 },
        [
          { type: 'etiquette', nom: 'Question', texte: 'Quel est ton prénom ?', largeur: 300, taillePolice: 16 },
          { type: 'zonetexte', nom: 'Prenom', y: 54, largeur: 200, hauteur: 30 },
          { type: 'bouton', nom: 'BoutonBonjour', texte: 'Dire bonjour', x: 232, y: 54, largeur: 130, hauteur: 30 },
          { type: 'etiquette', nom: 'Resultat', y: 110, largeur: 400, hauteur: 40, taillePolice: 24, couleurTexte: '#4f46e5' }
        ],
        [],
        () => [
          evt('bs_quand_clic', 'c3', [
            si({ type: 'text_isEmpty', inputs: { VALUE: I(lire('texte', 'c2')) } },
              [message(t("Écris d'abord ton prénom !"), 'attention')],
              [ecrire('c4', 'texte', joindre(t('Bonjour '), lire('texte', 'c2'), t(' !')))])
          ])
        ])
    },
    {
      titre: '📋 Fiche d\'inscription',
      description: 'Un formulaire : boutons radio, cadre, sélecteur de nombre, texte sur plusieurs lignes.',
      creer: () => projet(
        { titre: 'Inscription au club', largeur: 440, hauteur: 390 },
        [
          { type: 'etiquette', nom: 'Titre', texte: 'Inscription au club', largeur: 400, hauteur: 32, taillePolice: 20 },
          { type: 'etiquette', nom: 'LibellePrenom', texte: 'Prénom', y: 58, largeur: 80 },
          { type: 'zonetexte', nom: 'Prenom', x: 110, y: 54, largeur: 200, hauteur: 28 },
          { type: 'etiquette', nom: 'LibelleAge', texte: 'Âge', y: 94, largeur: 80 },
          { type: 'selecteurnombre', nom: 'Age', x: 110, y: 90, largeur: 80, hauteur: 28, valeur: 12, min: 5, max: 99, pas: 1 },
          { type: 'cadre', nom: 'CadreActivite', texte: 'Activité', y: 128, largeur: 400, hauteur: 64 },
          { type: 'boutonradio', nom: 'Foot', texte: '⚽ Foot', x: 36, y: 156, largeur: 110, hauteur: 24, groupe: 'activite', coche: true },
          { type: 'boutonradio', nom: 'Danse', texte: '💃 Danse', x: 156, y: 156, largeur: 110, hauteur: 24, groupe: 'activite' },
          { type: 'boutonradio', nom: 'Musique', texte: '🎸 Musique', x: 276, y: 156, largeur: 120, hauteur: 24, groupe: 'activite' },
          { type: 'etiquette', nom: 'LibellePresentation', texte: 'Présente-toi en quelques mots :', y: 206, largeur: 300 },
          { type: 'zonetexte', nom: 'Presentation', y: 230, largeur: 400, hauteur: 90, multiligne: true },
          { type: 'bouton', nom: 'Valider', texte: '✔ Valider l\'inscription', y: 336, largeur: 200, hauteur: 34 }
        ],
        [],
        () => [
          evt('bs_quand_clic', 'c12', [
            si(estVide(lire('texte', 'c3')),
              [message(t('Merci d\'indiquer ton prénom.'), 'attention')],
              [message(joindre(
                t('Bienvenue au club, '), lire('texte', 'c3'), t(' !'), retourLigne(), retourLigne(),
                t('Âge : '), lire('valeur', 'c5'), t(' ans'), retourLigne(),
                t('Activité : '), radioChoisi('activite'), retourLigne(),
                t('Présentation : '), lire('texte', 'c11')), 'succes')])
          ])
        ])
    },
    {
      titre: '✅ Liste de tâches',
      description: 'Ajouter, terminer et effacer des tâches dans une zone de liste.',
      creer: () => projet(
        { titre: 'Ma liste de tâches', largeur: 380, hauteur: 330 },
        [
          { type: 'etiquette', nom: 'Titre', texte: 'Ma liste de tâches', largeur: 340, hauteur: 30, taillePolice: 20 },
          { type: 'zonetexte', nom: 'NouvelleTache', y: 54, largeur: 230, hauteur: 30 },
          { type: 'bouton', nom: 'Ajouter', texte: '➕ Ajouter', x: 260, y: 54, largeur: 100, hauteur: 30 },
          { type: 'zoneliste', nom: 'Taches', y: 94, largeur: 340, hauteur: 170, elements: ['Faire mes devoirs', 'Ranger ma chambre'] },
          { type: 'bouton', nom: 'Terminer', texte: '✔ Tâche terminée', y: 278, largeur: 160, hauteur: 32 },
          { type: 'bouton', nom: 'Vider', texte: '🗑️ Tout effacer', x: 200, y: 278, largeur: 160, hauteur: 32 }
        ],
        [],
        () => [
          evt('bs_quand_clic', 'c3', [
            si(estVide(lire('texte', 'c2')),
              [message(t('Écris d\'abord une tâche dans la case.'), 'attention')],
              [listeAjouter('c4', lire('texte', 'c2')), ecrire('c2', 'texte', t(''))])
          ]),
          evt('bs_quand_clic', 'c5', [
            si(compare('EQ', lire('numero', 'c4'), n(0)),
              [message(t('Clique d\'abord sur une tâche dans la liste.'), 'info')],
              [listeRetirer('c4', lire('numero', 'c4')), message(t('Bravo, une tâche de moins !'), 'succes')])
          ]),
          evt('bs_quand_clic', 'c6', [
            si(confirmer('Effacer toutes les tâches ?'), [listeVider('c4')])
          ])
        ])
    },
    {
      titre: '🎨 Mini-Paint',
      description: 'Un logiciel de dessin : couleurs, épaisseur du crayon, effacer, ouvrir une image et enregistrer son dessin en PNG.',
      creer: () => projet(
        { titre: 'Mini-Paint', largeur: 600, hauteur: 380 },
        [
          { type: 'zonedessin', nom: 'Toile', x: 10, y: 10, largeur: 420, hauteur: 360, couleurFond: '#ffffff' },
          { type: 'etiquette', nom: 'TitreCouleur', texte: 'Couleur', x: 450, y: 16 },
          { type: 'listederoulante', nom: 'Couleurs', x: 450, y: 40, largeur: 130,
            elements: ['noir', 'rouge', 'orange', 'jaune', 'vert', 'bleu', 'violet', 'rose', 'blanc'] },
          { type: 'etiquette', nom: 'TitreEpaisseur', texte: 'Épaisseur', x: 450, y: 90 },
          { type: 'curseur', nom: 'Epaisseur', x: 450, y: 114, largeur: 130, hauteur: 24, min: 1, max: 40, valeur: 5 },
          { type: 'bouton', nom: 'Effacer', texte: '🗑️ Tout effacer', x: 450, y: 170, largeur: 130, hauteur: 34 },
          { type: 'etiquette', nom: 'Aide', texte: 'Dessine avec la souris !\n(astuce : « blanc » sert de gomme)',
            x: 450, y: 300, largeur: 140, hauteur: 70, taillePolice: 12, couleurTexte: '#64748b' },
          { type: 'bouton', nom: 'Ouvrir', texte: '📂 Ouvrir une image', x: 450, y: 214, largeur: 130, hauteur: 34 },
          { type: 'bouton', nom: 'Enregistrer', texte: '💾 Enregistrer', x: 450, y: 256, largeur: 130, hauteur: 34 },
          { type: 'fichier', nom: 'FichierImage', typeFichier: 'image', nomPropose: 'mon dessin.png', largeur: 0, hauteur: 0 }
        ],
        [],
        () => [
          evt('bs_quand_demarre', null, [
            dessin('bs_dessin_couleur', 'c1', { VAL: lire('texte', 'c3') }),
            dessin('bs_dessin_epaisseur', 'c1', { VAL: lire('valeur', 'c5') })
          ]),
          evt('bs_quand_glisse', 'c1', [
            dessin('bs_dessin_trait', 'c1', {
              X1: souris('px', 'c1'), Y1: souris('py', 'c1'), X2: souris('x', 'c1'), Y2: souris('y', 'c1')
            })
          ]),
          evt('bs_quand_clic', 'c1', [
            dessin('bs_dessin_point', 'c1', { X: souris('x', 'c1'), Y: souris('y', 'c1') })
          ]),
          evt('bs_quand_change', 'c3', [
            dessin('bs_dessin_couleur', 'c1', { VAL: lire('texte', 'c3') })
          ]),
          evt('bs_quand_change', 'c5', [
            dessin('bs_dessin_epaisseur', 'c1', { VAL: lire('valeur', 'c5') })
          ]),
          evt('bs_quand_clic', 'c6', [
            si(confirmer('Effacer tout le dessin ?'), [dessin('bs_dessin_effacer', 'c1')])
          ]),
          evt('bs_quand_clic', 'c8', [bloc('bs_fichier_ouvrir_dans', 'c10', null, { CIBLE: 'c1' })]),
          evt('bs_quand_clic', 'c9', [bloc('bs_fichier_enregistrer_de', 'c10', null, { CIBLE: 'c1' })])
        ])
    },
    {
      titre: '📸 Photomaton',
      description: 'La webcam en direct : compte à rebours 3, 2, 1, photo, enregistrement en PNG, et un détecteur de mouvement.',
      creer: () => {
        // c1 Camera · c2 Photo (image) · c3 bouton Photo · c4 interrupteur · c5 bouton Enregistrer
        // c6 Compte (grand chiffre sur la caméra) · c7 Alerte · c8 FichierPhoto (invisible)
        const compte = x => [ecrire('c6', 'texte', t(x)), bloc('bs_son', null, null, { SON: 'bip' }), attendre(1)];
        return projet(
          { titre: 'Photomaton', largeur: 670, hauteur: 310, couleurFond: '#1e293b' },
          [
            { type: 'camera', nom: 'Camera', x: 10, y: 10, largeur: 320, hauteur: 240, miroir: true, allumerAuDemarrage: true, seuilMouvement: 10 },
            { type: 'image', nom: 'Photo', x: 340, y: 10, largeur: 320, hauteur: 240, couleurFond: '#334155' },
            { type: 'bouton', nom: 'BoutonPhoto', texte: '📸 Prendre une photo', x: 10, y: 262, largeur: 160, hauteur: 36 },
            { type: 'interrupteur', nom: 'Allumee', texte: 'Caméra allumée', coche: true, x: 180, y: 268, largeur: 150, hauteur: 26, couleurTexte: '#e2e8f0' },
            { type: 'bouton', nom: 'Enregistrer', texte: '💾 Enregistrer la photo', x: 340, y: 262, largeur: 170, hauteur: 36 },
            { type: 'etiquette', nom: 'Compte', texte: '', x: 130, y: 80, largeur: 80, hauteur: 90, taillePolice: 72,
              couleurTexte: '#ffffff', visible: false },
            { type: 'etiquette', nom: 'Alerte', texte: '', x: 520, y: 270, largeur: 140, hauteur: 24, couleurTexte: '#fbbf24' },
            { type: 'fichier', nom: 'FichierPhoto', typeFichier: 'image', nomPropose: 'ma photo.png', largeur: 0, hauteur: 0 }
          ],
          [],
          () => [
            evt('bs_quand_demarre', null, [ecrire('c5', 'active', vrai(false))]),
            evt('bs_quand_clic', 'c3', [
              ecrire('c3', 'active', vrai(false)),
              ecrire('c6', 'visible', vrai(true)),
              ...compte('3'), ...compte('2'), ...compte('1'),
              ecrire('c6', 'visible', vrai(false)),
              ecrire('c4', 'coche', vrai(true)), // la photo rallume la caméra si besoin
              bloc('bs_camera_photo', 'c1'),
              bloc('bs_son', null, null, { SON: 'succes' }),
              bloc('bs_camera_photo_dans', 'c1', null, { CIBLE: 'c2' }),
              ecrire('c5', 'active', vrai(true)),
              ecrire('c3', 'active', vrai(true))
            ]),
            evt('bs_quand_clic', 'c5', [
              bloc('bs_fichier_enregistrer_de', 'c8', null, { CIBLE: 'c1' }),
              si(non(bloc('bs_fichier_annule', 'c8')), [
                ecrire('c7', 'texte', joindre(t('💾 '), bloc('bs_fichier_nom', 'c8')))
              ])
            ]),
            evt('bs_quand_change', 'c4', [ecrire('c1', 'allumee', lire('coche', 'c4'))]),
            evt('bs_quand_camera_mouvement', 'c1', [
              ecrire('c7', 'texte', t('👀 Ça bouge !')),
              attendre(1),
              ecrire('c7', 'texte', t(''))
            ])
          ]);
      }
    },
    {
      titre: '📝 Bloc-notes',
      description: 'Un petit traitement de texte : menus Fichier › Nouveau, Ouvrir…, Enregistrer…, et glisser-déposer d\'un fichier.',
      creer: () => {
        // c1 Texte · c2 Etat (barre d'état) · c3 FichierTexte (contrôle Fichier, invisible)
        const etat = x => ecrire('c2', 'texte', x);
        const annule = () => bloc('bs_fichier_annule', 'c3');
        const nomFichier = () => bloc('bs_fichier_nom', 'c3');
        return projet(
          { titre: 'Bloc-notes', largeur: 520, hauteur: 380, couleurFond: '#f1f5f9', menus: 'Fichier\n  Nouveau\n  Ouvrir…\n  Enregistrer…' },
          [
            { type: 'zonetexte', nom: 'Texte', multiligne: true, x: 10, y: 10, largeur: 500, hauteur: 312, taillePolice: 15,
              couleurFond: '#ffffff', texte: 'Écrivez ici, puis Fichier › Enregistrer…\n\nAstuce : faites glisser un fichier texte sur la fenêtre pour l\'ouvrir.' },
            { type: 'etiquette', nom: 'Etat', texte: '📄 Nouveau document', x: 10, y: 330, largeur: 500, hauteur: 22, taillePolice: 13, couleurTexte: '#475569' },
            { type: 'fichier', nom: 'FichierTexte', typeFichier: 'texte', nomPropose: 'mes notes.txt', largeur: 0, hauteur: 0 }
          ],
          [],
          () => [
            evtMenu('Fichier › Nouveau', [
              si(confirmer('Effacer le texte pour commencer un nouveau document ?'), [
                ecrire('c1', 'texte', t('')),
                etat(t('📄 Nouveau document'))
              ])
            ]),
            evtMenu('Fichier › Ouvrir…', [
              bloc('bs_fichier_ouvrir_avec', 'c3'),
              si(non(annule()), [
                ecrire('c1', 'texte', bloc('bs_fichier_contenu', 'c3')),
                etat(joindre(t('📄 '), nomFichier()))
              ])
            ]),
            evtMenu('Fichier › Enregistrer…', [
              { type: 'bs_fichier_enregistrer_avec', fields: { CTRL: 'c3' }, inputs: { VAL: I(lire('texte', 'c1')) } },
              si(annule(),
                [etat(t('Enregistrement annulé.'))],
                [etat(joindre(t('💾 Enregistré : '), nomFichier()))])
            ]),
            evt('bs_quand_fichier_depose', 'c3', [
              ecrire('c1', 'texte', bloc('bs_fichier_contenu', 'c3')),
              etat(joindre(t('📄 '), nomFichier(), t(' (déposé)')))
            ])
          ]);
      }
    },
    {
      titre: '🧮 Quiz de calcul',
      description: '5 multiplications au hasard, un score et une barre de progression.',
      creer: () => projet(
        { titre: 'Quiz de calcul', largeur: 400, hauteur: 220 },
        [
          { type: 'etiquette', nom: 'Titre', texte: 'Tables de multiplication', largeur: 360, hauteur: 32, taillePolice: 22 },
          { type: 'bouton', nom: 'Commencer', texte: '▶ Commencer le quiz', y: 66, largeur: 200, hauteur: 36 },
          { type: 'barreprogression', nom: 'Progression', y: 122, largeur: 360, hauteur: 18, valeur: 0, max: 5, couleurBarre: '#4f46e5' },
          { type: 'etiquette', nom: 'Score', texte: 'Score : 0 / 5', y: 156, largeur: 360, hauteur: 30, taillePolice: 18 }
        ],
        ['score', 'a', 'b', 'question', 'reponse'],
        () => [
          evt('bs_quand_clic', 'c2', [
            ecrire('c2', 'active', vrai(false)),
            fixer('v_score', n(0)),
            ecrire('c4', 'texte', t('Score : 0 / 5')),
            pour('v_question', 1, 5, [
              ecrire('c3', 'valeur', calc('MINUS', v('v_question'), n(1))),
              fixer('v_a', hasard(2, 10)),
              fixer('v_b', hasard(2, 10)),
              fixer('v_reponse', demanderNombre(joindre(
                t('Question '), v('v_question'), t(' : combien font '), v('v_a'), t(' × '), v('v_b'), t(' ?')))),
              si(compare('EQ', v('v_reponse'), calc('MULTIPLY', v('v_a'), v('v_b'))),
                [ajouter('v_score', n(1)), message(t('Bravo, c\'est juste !'), 'succes')],
                [message(joindre(t('Raté… La bonne réponse était '), calc('MULTIPLY', v('v_a'), v('v_b'))), 'erreur')]),
              ecrire('c3', 'valeur', v('v_question')),
              ecrire('c4', 'texte', joindre(t('Score : '), v('v_score'), t(' / 5')))
            ]),
            message(joindre(t('Quiz terminé ! Ton score : '), v('v_score'), t(' sur 5.')), 'info'),
            ecrire('c2', 'active', vrai(true))
          ])
        ])
    },
    {
      titre: '⏱️ Compte à rebours',
      description: 'Choisis une durée avec le curseur, puis lance le minuteur.',
      creer: () => projet(
        { titre: 'Compte à rebours', largeur: 360, hauteur: 260 },
        [
          { type: 'etiquette', nom: 'Consigne', texte: 'Durée : 10 secondes', largeur: 320, taillePolice: 15 },
          { type: 'curseur', nom: 'Duree', y: 48, largeur: 320, hauteur: 24, min: 1, max: 60, valeur: 10 },
          { type: 'etiquette', nom: 'Affichage', texte: '10', y: 84, largeur: 320, hauteur: 80, taillePolice: 64, couleurTexte: '#1e1b4b' },
          { type: 'barreprogression', nom: 'Barre', y: 172, largeur: 320, hauteur: 16, valeur: 10, max: 10, couleurBarre: '#f59e0b' },
          { type: 'bouton', nom: 'Demarrer', texte: '▶ Démarrer', y: 204, largeur: 140, hauteur: 34 }
        ],
        ['reste'],
        () => [
          evt('bs_quand_change', 'c2', [
            ecrire('c1', 'texte', joindre(t('Durée : '), lire('valeur', 'c2'), t(' secondes'))),
            ecrire('c3', 'texte', lire('valeur', 'c2')),
            ecrire('c4', 'max', lire('valeur', 'c2')),
            ecrire('c4', 'valeur', lire('valeur', 'c2'))
          ]),
          evt('bs_quand_clic', 'c5', [
            ecrire('c5', 'active', vrai(false)),
            ecrire('c2', 'active', vrai(false)),
            fixer('v_reste', lire('valeur', 'c2')),
            ecrire('c4', 'max', v('v_reste')),
            tantQue(compare('GT', v('v_reste'), n(0)), [
              ecrire('c3', 'texte', v('v_reste')),
              ecrire('c4', 'valeur', v('v_reste')),
              attendre(1),
              ajouter('v_reste', n(-1))
            ]),
            ecrire('c3', 'texte', t('0')),
            ecrire('c4', 'valeur', n(0)),
            message(t('⏰ Le temps est écoulé !'), 'attention'),
            ecrire('c3', 'texte', lire('valeur', 'c2')),
            ecrire('c4', 'valeur', lire('valeur', 'c2')),
            ecrire('c5', 'active', vrai(true)),
            ecrire('c2', 'active', vrai(true))
          ])
        ])
    },
    {
      titre: '⚽ Balle qui rebondit',
      description: 'Une animation avec « répéter indéfiniment » et « attendre ».',
      creer: () => projet(
        { titre: 'Balle qui rebondit', largeur: 420, hauteur: 300 },
        [
          { type: 'zonedessin', nom: 'Terrain', x: 10, y: 10, largeur: 400, hauteur: 240, couleurFond: '#ecfdf5' },
          { type: 'etiquette', nom: 'Info', texte: 'Clique sur le terrain pour changer de couleur', x: 10, y: 262, largeur: 400, taillePolice: 13, couleurTexte: '#475569' }
        ],
        ['x', 'y', 'vx', 'vy'],
        () => [
          evt('bs_quand_demarre', null, [
            fixer('v_x', n(60)), fixer('v_y', n(60)), fixer('v_vx', n(4)), fixer('v_vy', n(3)),
            dessin('bs_dessin_couleur', 'c1', { VAL: couleur('rouge') }),
            toujours([
              dessin('bs_dessin_effacer', 'c1'),
              dessin('bs_dessin_cercle', 'c1', { X: v('v_x'), Y: v('v_y'), R: n(16) }, { PLEIN: 'TRUE' }),
              ajouter('v_x', v('v_vx')),
              ajouter('v_y', v('v_vy')),
              si(ou(compare('LT', v('v_x'), n(16)), compare('GT', v('v_x'), n(384))),
                [fixer('v_vx', calc('MINUS', n(0), v('v_vx')))]),
              si(ou(compare('LT', v('v_y'), n(16)), compare('GT', v('v_y'), n(224))),
                [fixer('v_vy', calc('MINUS', n(0), v('v_vy')))]),
              attendre(0.02)
            ])
          ]),
          evt('bs_quand_clic', 'c1', [
            dessin('bs_dessin_couleur', 'c1', {
              VAL: { type: 'lists_getIndex', fields: { MODE: 'GET', WHERE: 'RANDOM' }, inputs: { VALUE: I({
                type: 'lists_create_with', extraState: { itemCount: 5 },
                inputs: { ADD0: I(t('rouge')), ADD1: I(t('bleu')), ADD2: I(t('vert')), ADD3: I(t('orange')), ADD4: I(t('violet')) }
              }) } }
            })
          ])
        ])
    },
    {
      titre: '📇 Carnet d\'adresses',
      description: 'Un tableau qui garde ses contacts d\'une fois sur l\'autre, des menus, l\'export vers Excel.',
      creer: () => {
        const compteur = () => ecrire('c11', 'texte',
          joindre(lire('nombreLignes', 'c10'), t(' contact(s) · gardés automatiquement d\'une fois sur l\'autre')));
        const choisie = lire('numero', 'c10');
        const cellule = col => bloc('bs_tableau_cellule', 'c10', { COL: t(col), NUM: choisie });
        return projet(
          {
            titre: 'Carnet d\'adresses', largeur: 520, hauteur: 360,
            menus: 'Fichier\n  Exporter pour Excel (CSV)…\n  Importer un fichier CSV…\n  -\n  Tout effacer\nAide\n  À propos'
          },
          [
            { type: 'etiquette', nom: 'LibelleNom', texte: 'Nom', y: 14, largeur: 150, hauteur: 20 },
            { type: 'zonetexte', nom: 'Nom', y: 36, largeur: 150, hauteur: 28 },
            { type: 'etiquette', nom: 'LibellePrenom', texte: 'Prénom', x: 180, y: 14, largeur: 150, hauteur: 20 },
            { type: 'zonetexte', nom: 'Prenom', x: 180, y: 36, largeur: 150, hauteur: 28 },
            { type: 'etiquette', nom: 'LibelleTelephone', texte: 'Téléphone', x: 340, y: 14, largeur: 160, hauteur: 20 },
            { type: 'zonetexte', nom: 'Telephone', x: 340, y: 36, largeur: 160, hauteur: 28 },
            { type: 'bouton', nom: 'Ajouter', texte: '➕ Ajouter', y: 76, largeur: 120, hauteur: 30 },
            { type: 'bouton', nom: 'Supprimer', texte: '🗑️ Supprimer', x: 150, y: 76, largeur: 120, hauteur: 30 },
            { type: 'bouton', nom: 'Trier', texte: '🔤 Trier par nom', x: 280, y: 76, largeur: 140, hauteur: 30 },
            {
              type: 'tableau', nom: 'Contacts', y: 118, largeur: 480, hauteur: 196, memoriser: true,
              colonnes: ['Nom', 'Prénom', 'Téléphone'],
              lignes: [['Dupont', 'Marie', '06 12 34 56 78'], ['Martin', 'Lucas', '07 98 76 54 32']]
            },
            { type: 'etiquette', nom: 'Compteur', y: 324, largeur: 480, hauteur: 22, taillePolice: 13, couleurTexte: '#64748b' }
          ],
          ['contenu'],
          () => [
            evt('bs_quand_demarre', null, [compteur()]),
            evt('bs_quand_clic', 'c7', [
              si(estVide(lire('texte', 'c2')),
                [message(t('Écrivez au moins un nom.'), 'attention')],
                [
                  bloc('bs_tableau_ajouter', 'c10', { LIGNE: liste(lire('texte', 'c2'), lire('texte', 'c4'), lire('texte', 'c6')) }),
                  ecrire('c2', 'texte', t('')), ecrire('c4', 'texte', t('')), ecrire('c6', 'texte', t('')),
                  bloc('bs_son', null, null, { SON: 'succes' }),
                  compteur()
                ])
            ]),
            evt('bs_quand_change', 'c10', [
              ecrire('c2', 'texte', cellule('Nom')),
              ecrire('c4', 'texte', cellule('Prénom')),
              ecrire('c6', 'texte', cellule('Téléphone'))
            ]),
            evt('bs_quand_clic', 'c8', [
              si(compare('EQ', choisie, n(0)),
                [message(t('Cliquez d\'abord sur un contact dans le tableau.'))],
                [si(confirmer('Supprimer ce contact ?'), [
                  bloc('bs_tableau_supprimer', 'c10', { NUM: choisie }),
                  compteur()
                ])])
            ]),
            evt('bs_quand_clic', 'c9', [bloc('bs_tableau_trier', 'c10', { COL: t('Nom') }, { SENS: 'croissant' })]),
            evtMenu('Fichier › Exporter pour Excel (CSV)…', [
              bloc('bs_fichier_enregistrer', null, { VAL: bloc('bs_tableau_csv', 'c10'), NOM: t('contacts.csv') })
            ]),
            evtMenu('Fichier › Importer un fichier CSV…', [
              fixer('v_contenu', { type: 'bs_fichier_ouvrir' }),
              si({ type: 'logic_negate', inputs: { BOOL: I(estVide(v('v_contenu'))) } }, [
                bloc('bs_tableau_remplir_csv', 'c10', { VAL: v('v_contenu') }),
                compteur()
              ])
            ]),
            evtMenu('Fichier › Tout effacer', [
              si(confirmer('Effacer tous les contacts ?'), [bloc('bs_tableau_vider', 'c10'), compteur()])
            ]),
            evtMenu('Aide › À propos', [
              message(joindre(t('Carnet d\'adresses, créé avec BlocStudio.'), retourLigne(), retourLigne(),
                t('Les contacts sont gardés automatiquement : fermez le programme, relancez-le, ils sont toujours là !')))
            ])
          ]);
      }
    },
    {
      titre: '📚 Ma bibliothèque',
      description: 'Une base de données de livres : ajouter, chercher, trier, supprimer. Les livres sont gardés d\'une fois sur l\'autre.',
      creer: () => {
        // c1-c6 saisie · c7 Ajouter · c8 Supprimer · c9 Trier · c10-c11 recherche
        // c12 Livres (Tableau) · c13 Compteur · c14 Bibliotheque (Base de données)
        const ajouterFiche = valeurs => ({
          type: 'bs_base_ajouter', fields: { CTRL: 'c14' }, extraState: { champs: Object.keys(valeurs) },
          inputs: Object.fromEntries(Object.values(valeurs).map((x, i) => ['V' + i, I(x)]))
        });
        const recherche = () => lire('texte', 'c11');
        const choisie = () => bloc('bs_base_choisie', 'c12');
        return projet(
          { titre: 'Ma bibliothèque', largeur: 560, hauteur: 420, couleurFond: '#fffbeb' },
          [
            { type: 'etiquette', nom: 'LibelleTitre', texte: 'Titre', y: 14, largeur: 220, hauteur: 20 },
            { type: 'zonetexte', nom: 'Titre', y: 36, largeur: 220, hauteur: 28 },
            { type: 'etiquette', nom: 'LibelleAuteur', texte: 'Auteur', x: 250, y: 14, largeur: 180, hauteur: 20 },
            { type: 'zonetexte', nom: 'Auteur', x: 250, y: 36, largeur: 180, hauteur: 28 },
            { type: 'etiquette', nom: 'LibelleAnnee', texte: 'Année', x: 440, y: 14, largeur: 100, hauteur: 20 },
            { type: 'selecteurnombre', nom: 'Annee', x: 440, y: 36, largeur: 100, hauteur: 28, valeur: 2024, min: 1, max: 2100, pas: 1 },
            { type: 'bouton', nom: 'Ajouter', texte: '➕ Ajouter le livre', y: 76, largeur: 160, hauteur: 30 },
            { type: 'bouton', nom: 'Supprimer', texte: '🗑️ Supprimer', x: 190, y: 76, largeur: 120, hauteur: 30 },
            { type: 'bouton', nom: 'Trier', texte: '🔤 Trier par titre', x: 320, y: 76, largeur: 150, hauteur: 30 },
            { type: 'etiquette', nom: 'LibelleRecherche', texte: '🔍 Chercher un titre ou un auteur :', y: 124, largeur: 250, hauteur: 22 },
            { type: 'zonetexte', nom: 'Recherche', x: 270, y: 120, largeur: 270, hauteur: 28 },
            { type: 'tableau', nom: 'Livres', y: 158, largeur: 520, hauteur: 210, colonnes: [], lignes: [] },
            { type: 'etiquette', nom: 'Compteur', y: 378, largeur: 520, hauteur: 22, taillePolice: 13, couleurTexte: '#78716c' },
            {
              type: 'basedonnees', nom: 'Bibliotheque', largeur: 0, hauteur: 0, memoriser: true,
              champs: ['Titre', 'Auteur', 'Année'],
              fiches: [['Le Petit Prince', 'Antoine de Saint-Exupéry', 1943], ['Harry Potter à l\'école des sorciers', 'J. K. Rowling', 1997],
                ['Le Hobbit', 'J. R. R. Tolkien', 1937], ['Matilda', 'Roald Dahl', 1988]]
            }
          ],
          ['trouves'],
          () => [
            evt('bs_quand_demarre', null, [appeler('actualiser')]),
            // Montre toute la base, ou seulement les livres dont le titre ou l'auteur contient la recherche.
            fonction('actualiser', [
              si(estVide(recherche()),
                [bloc('bs_base_afficher', 'c14', null, { TAB: 'c12' })],
                [
                  fixer('v_trouves', bloc('bs_base_chercher', 'c14', { VAL: recherche() }, { CHAMP: 'Titre', OP: 'contient' })),
                  si(estVide(v('v_trouves')), [
                    fixer('v_trouves', bloc('bs_base_chercher', 'c14', { VAL: recherche() }, { CHAMP: 'Auteur', OP: 'contient' }))
                  ]),
                  bloc('bs_base_afficher', 'c14', { NUMS: v('v_trouves') }, { TAB: 'c12' })
                ]),
              ecrire('c13', 'texte', joindre(bloc('bs_base_nombre', 'c14'), t(' livre(s) dans la bibliothèque · gardés d\'une fois sur l\'autre')))
            ]),
            evt('bs_quand_clic', 'c7', [
              si(estVide(lire('texte', 'c2')),
                [message(t('Écrivez au moins le titre du livre.'), 'attention')],
                [
                  ajouterFiche({ Titre: lire('texte', 'c2'), Auteur: lire('texte', 'c4'), 'Année': lire('valeur', 'c6') }),
                  ecrire('c2', 'texte', t('')), ecrire('c4', 'texte', t('')),
                  bloc('bs_son', null, null, { SON: 'succes' }),
                  appeler('actualiser')
                ])
            ]),
            evt('bs_quand_clic', 'c8', [
              si(compare('EQ', choisie(), n(0)),
                [message(t('Cliquez d\'abord sur un livre dans le tableau.'), 'info')],
                [
                  si({ type: 'bs_confirmer', inputs: { VAL: I(joindre(t('Supprimer « '),
                    bloc('bs_base_champ', 'c14', { N: choisie() }, { CHAMP: 'Titre' }), t(' » ?'))) } }, [
                    bloc('bs_base_supprimer', 'c14', { N: choisie() }),
                    appeler('actualiser')
                  ])
                ])
            ]),
            evt('bs_quand_clic', 'c9', [
              bloc('bs_base_trier', 'c14', null, { CHAMP: 'Titre', SENS: 'croissant' }),
              appeler('actualiser')
            ]),
            evt('bs_quand_change', 'c11', [appeler('actualiser')])
          ]);
      }
    },
    {
      titre: '🪙 Attrape la pièce',
      description: 'Un vrai petit jeu : sprites animés, clavier ou souris, minuteur, musique de fond et record.',
      creer: () => {
        // c1 Score · c2 Vies · c3 Piece · c4 Panier · c5 Consigne · c6 Musique (Son) · c7 Chute (Minuteur)
        const score = () => ecrire('c1', 'texte', joindre(t('Score : '), v('v_score')));
        const vies = () => ecrire('c2', 'texte', joindre(t('Vies : '), v('v_vies')));
        const x = id => lire('x', id), yy = id => lire('y', id);
        const record = () => bloc('bs_nombre', null, { VAL: bloc('bs_memoire', null, { NOM: t('record') }) });
        const touche = nom => ({ type: 'bs_touche_enfoncee', fields: { TOUCHE: nom } });
        const p = projet(
          { titre: 'Attrape la pièce', largeur: 480, hauteur: 360, couleurFond: '#bae6fd' },
          [
            { type: 'etiquette', nom: 'Score', texte: 'Score : 0', x: 12, y: 8, largeur: 200, hauteur: 30, taillePolice: 20, couleurTexte: '#0c4a6e' },
            { type: 'etiquette', nom: 'Vies', texte: 'Vies : 3', x: 360, y: 8, largeur: 110, hauteur: 30, taillePolice: 20, couleurTexte: '#be123c' },
            { type: 'sprite', nom: 'Piece', sprite: 'spr_piece', costume: 0, anime: true, x: 216, y: -50, largeur: 48, hauteur: 48 },
            { type: 'sprite', nom: 'Panier', sprite: 'spr_panier', costume: 0, x: 204, y: 284, largeur: 72, hauteur: 72 },
            {
              type: 'etiquette', nom: 'Consigne', x: 40, y: 120, largeur: 400, hauteur: 110, taillePolice: 18, couleurTexte: '#0c4a6e',
              texte: 'Attrape les pièces avec le panier !\n\nFlèches ← → ou souris pour bouger.\nAppuie sur Espace (ou clique) pour commencer.'
            },
            { type: 'son', nom: 'Musique', son: 'son_musique', volume: 35, boucle: true, autoDemarrage: false, largeur: 0, hauteur: 0 },
            { type: 'minuteur', nom: 'Chute', intervalle: 0.03, active: false, largeur: 0, hauteur: 0 }
          ],
          ['score', 'vies', 'vitesse', 'enJeu'],
          () => [
            evt('bs_quand_demarre', null, [fixer('v_enJeu', vrai(false))]),
            evtChamps('bs_quand_touche', { TOUCHE: 'espace' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            evtChamps('bs_quand_souris_fenetre', { QUOI: 'clic' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            fonction('nouvelle partie', [
              fixer('v_score', n(0)), fixer('v_vies', n(3)), fixer('v_vitesse', n(3)), fixer('v_enJeu', vrai(true)),
              score(), vies(),
              ecrire('c5', 'visible', vrai(false)),
              appeler('replacer la pièce'),
              bloc('bs_minuteur_ctrl', 'c7', null, { ACTION: 'demarrer' }),
              bloc('bs_sonctrl', 'c6', null, { ACTION: 'jouer' })
            ]),
            fonction('replacer la pièce', [
              ecrire('c3', 'y', n(-50)),
              ecrire('c3', 'x', hasard(10, 420))
            ]),
            evt('bs_quand_minuteur', 'c7', [
              si(et(touche('gauche'), compare('GT', x('c4'), n(0))), [ecrire('c4', 'x', calc('MINUS', x('c4'), n(8)))]),
              si(et(touche('droite'), compare('LT', x('c4'), n(408))), [ecrire('c4', 'x', calc('ADD', x('c4'), n(8)))]),
              ecrire('c3', 'y', calc('ADD', yy('c3'), v('v_vitesse'))),
              si({ type: 'bs_se_touchent', fields: { CTRL: 'c4', CTRL2: 'c3' } }, [
                bloc('bs_son', null, null, { SON: 'piece' }),
                ajouter('v_score', n(1)), score(),
                ajouter('v_vitesse', n(0.3)),
                appeler('replacer la pièce')
              ]),
              si(compare('GT', yy('c3'), n(360)), [
                bloc('bs_son', null, null, { SON: 'erreur' }),
                ajouter('v_vies', n(-1)), vies(),
                appeler('replacer la pièce'),
                si(compare('LTE', v('v_vies'), n(0)), [appeler('fin de partie')])
              ])
            ]),
            evtChamps('bs_quand_souris_fenetre', { QUOI: 'bouge' }, [
              si(v('v_enJeu'), [ecrire('c4', 'x', calc('MINUS', { type: 'bs_souris_fenetre', fields: { QUOI: 'x' } }, n(36)))])
            ]),
            fonction('fin de partie', [
              bloc('bs_minuteur_ctrl', 'c7', null, { ACTION: 'arreter' }),
              bloc('bs_sonctrl', 'c6', null, { ACTION: 'arreter' }),
              fixer('v_enJeu', vrai(false)),
              si(compare('GT', v('v_score'), record()), [
                bloc('bs_memoriser', null, { VAL: v('v_score'), NOM: t('record') }),
                bloc('bs_son', null, null, { SON: 'succes' })
              ]),
              ecrire('c5', 'texte', joindre(t('Partie terminée ! Score : '), v('v_score'), retourLigne(),
                t('Record : '), record(), retourLigne(), retourLigne(),
                t('Espace (ou clic) pour rejouer.'))),
              ecrire('c5', 'visible', vrai(true))
            ])
          ]);
        p.sons = [{ id: 'son_musique', nom: 'musique du jeu', donnees: musiqueDeFond() }];
        p.sprites = [spritePiece(), spritePanier()];
        return p;
      }
    },
    {
      titre: '☄️ Pluie de météorites',
      description: 'Un jeu avec des clones : des météorites de plus en plus nombreuses, à éviter avec la souris ou les flèches.',
      creer: () => {
        // c1 Score · c2 Vaisseau · c3 Meteorite (cachée : ce sont ses clones qui tombent) · c4 Consigne · c5 Apparition (Minuteur)
        const score = () => ecrire('c1', 'texte', joindre(t('Score : '), v('v_score')));
        const record = () => bloc('bs_nombre', null, { VAL: bloc('bs_memoire', null, { NOM: t('record météorites') }) });
        const intervalle = () => lire('intervalle', 'c5');
        const bouger = dx => [
          si(v('v_enJeu'), [
            bloc('bs_deplacer', 'c2', { DX: n(dx), DY: n(0) }),
            bloc('bs_rebondir', 'c2') // garde le vaisseau dans la fenêtre
          ])
        ];
        const p = projet(
          { titre: 'Pluie de météorites', largeur: 480, hauteur: 360, couleurFond: '#0b1026' },
          [
            { type: 'etiquette', nom: 'Score', texte: 'Score : 0', x: 12, y: 8, largeur: 200, hauteur: 30, taillePolice: 20, couleurTexte: '#fde68a' },
            { type: 'sprite', nom: 'Vaisseau', sprite: 'spr_vaisseau', costume: 0, anime: true, x: 216, y: 296, largeur: 48, hauteur: 48 },
            { type: 'sprite', nom: 'Meteorite', sprite: 'spr_meteorite', costume: 0, anime: true, visible: false, x: 216, y: 60, largeur: 48, hauteur: 48 },
            {
              type: 'etiquette', nom: 'Consigne', x: 40, y: 110, largeur: 400, hauteur: 120, taillePolice: 18, couleurTexte: '#e0e7ff',
              texte: 'Évite les météorites !\n\nSouris ou flèches ← → pour piloter.\nAppuie sur Espace (ou clique) pour décoller.'
            },
            { type: 'minuteur', nom: 'Apparition', intervalle: 0.6, active: false, largeur: 0, hauteur: 0 }
          ],
          ['score', 'enJeu'],
          () => [
            evt('bs_quand_demarre', null, [fixer('v_enJeu', vrai(false))]),
            evtChamps('bs_quand_touche', { TOUCHE: 'espace' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            evtChamps('bs_quand_souris_fenetre', { QUOI: 'clic' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            fonction('nouvelle partie', [
              bloc('bs_supprimer_clones', 'c3'),
              fixer('v_score', n(0)), score(),
              fixer('v_enJeu', vrai(true)),
              ecrire('c4', 'visible', vrai(false)),
              ecrire('c5', 'intervalle', n(0.6)),
              bloc('bs_minuteur_ctrl', 'c5', null, { ACTION: 'demarrer' })
            ]),
            // Chaque « tic » fait apparaître une météorite, de plus en plus souvent.
            evt('bs_quand_minuteur', 'c5', [
              bloc('bs_creer_clone', 'c3'),
              ajouter('v_score', n(1)), score(),
              si(compare('GT', intervalle(), n(0.2)), [ecrire('c5', 'intervalle', calc('MINUS', intervalle(), n(0.01)))])
            ]),
            // La vie d'un clone : il apparaît en haut, tombe, et disparaît en bas.
            evt('bs_quand_clone', 'c3', [
              bloc('bs_placer', '__moi', { X: hasard(0, 432), Y: n(-48) }),
              bloc('bs_orienter', '__moi', { DIR: hasard(160, 200) }),
              ecrire('__moi', 'visible', vrai(true)),
              tantQue(v('v_enJeu'), [
                bloc('bs_avancer', '__moi', { PAS: calc('ADD', n(3), calc('DIVIDE', v('v_score'), n(15))) }),
                si({ type: 'bs_se_touchent', fields: { CTRL: '__moi', CTRL2: 'c2' } }, [appeler('fin de partie')]),
                si(compare('GT', lire('y', '__moi'), n(360)), [bloc('bs_supprimer_clone')]),
                attendre(0.02)
              ])
            ]),
            evtChamps('bs_quand_touche', { TOUCHE: 'gauche' }, bouger(-14)),
            evtChamps('bs_quand_touche', { TOUCHE: 'droite' }, bouger(14)),
            evtChamps('bs_quand_souris_fenetre', { QUOI: 'bouge' }, [
              si(v('v_enJeu'), [ecrire('c2', 'x', calc('MINUS', { type: 'bs_souris_fenetre', fields: { QUOI: 'x' } }, n(24)))])
            ]),
            fonction('fin de partie', [
              si(v('v_enJeu'), [
                fixer('v_enJeu', vrai(false)),
                bloc('bs_minuteur_ctrl', 'c5', null, { ACTION: 'arreter' }),
                bloc('bs_son', null, null, { SON: 'erreur' }),
                si(compare('GT', v('v_score'), record()), [
                  bloc('bs_memoriser', null, { VAL: v('v_score'), NOM: t('record météorites') })
                ]),
                ecrire('c4', 'texte', joindre(t('Boum ! Score : '), v('v_score'), retourLigne(),
                  t('Record : '), record(), retourLigne(), retourLigne(), t('Espace (ou clic) pour rejouer.'))),
                ecrire('c4', 'visible', vrai(true))
              ])
            ])
          ]);
        p.sprites = [spriteVaisseau(), spriteMeteorite()];
        return p;
      }
    },
    {
      titre: '👻 Chasse aux fantômes',
      description: 'Clique sur les fantômes avant qu\'ils ne deviennent trop gros ! Effets de sprite (taille, fondu) et musique composée dans le studio 8 bits.',
      creer: () => {
        // c1 Score · c2 Vies · c3 Fantome (caché : ce sont ses clones qui hantent la fenêtre)
        // c4 Consigne · c5 Apparition (Minuteur) · c6 Musique (Son)
        const score = () => ecrire('c1', 'texte', joindre(t('Score : '), v('v_score')));
        const vies = () => ecrire('c2', 'texte', joindre(t('Vies : '), v('v_vies')));
        const record = () => bloc('bs_nombre', null, { VAL: bloc('bs_memoire', null, { NOM: t('record fantômes') }) });
        const intervalle = () => lire('intervalle', 'c5');
        const fondu = (sens, secondes) => bloc('bs_sprite_fondu', '__moi', { SEC: n(secondes) }, { SENS: sens });
        // Un fantôme touché par un clic devient un peu transparent : c'est le signal qu'il est attrapé.
        const libre = () => compare('EQ', lire('transparence', '__moi'), n(0));
        const p = projet(
          { titre: 'Chasse aux fantômes', largeur: 480, hauteur: 360, couleurFond: '#1e1b4b' },
          [
            { type: 'etiquette', nom: 'Score', texte: 'Score : 0', x: 12, y: 8, largeur: 200, hauteur: 30, taillePolice: 20, couleurTexte: '#fde68a' },
            { type: 'etiquette', nom: 'Vies', texte: 'Vies : 3', x: 360, y: 8, largeur: 110, hauteur: 30, taillePolice: 20, couleurTexte: '#f9a8d4' },
            { type: 'sprite', nom: 'Fantome', sprite: 'spr_fantome', costume: 0, anime: true, visible: false, x: 208, y: 150, largeur: 64, hauteur: 64 },
            {
              type: 'etiquette', nom: 'Consigne', x: 40, y: 110, largeur: 400, hauteur: 130, taillePolice: 18, couleurTexte: '#e0e7ff',
              texte: 'Les fantômes envahissent le château !\n\nClique sur chaque fantôme avant qu\'il ne devienne trop gros.\nClique (ou appuie sur Espace) pour commencer.'
            },
            { type: 'minuteur', nom: 'Apparition', intervalle: 1.2, active: false, largeur: 0, hauteur: 0 },
            { type: 'son', nom: 'Musique', son: 'son_fantomes', volume: 40, boucle: true, autoDemarrage: false, largeur: 0, hauteur: 0 }
          ],
          ['score', 'vies', 'enJeu'],
          () => [
            evt('bs_quand_demarre', null, [fixer('v_enJeu', vrai(false))]),
            evtChamps('bs_quand_touche', { TOUCHE: 'espace' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            evtChamps('bs_quand_souris_fenetre', { QUOI: 'clic' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            fonction('nouvelle partie', [
              bloc('bs_supprimer_clones', 'c3'),
              fixer('v_score', n(0)), fixer('v_vies', n(3)), fixer('v_enJeu', vrai(true)),
              score(), vies(),
              ecrire('c4', 'visible', vrai(false)),
              ecrire('c5', 'intervalle', n(1.2)),
              bloc('bs_minuteur_ctrl', 'c5', null, { ACTION: 'demarrer' }),
              bloc('bs_sonctrl', 'c6', null, { ACTION: 'jouer' })
            ]),
            // Les fantômes arrivent de plus en plus souvent.
            evt('bs_quand_minuteur', 'c5', [
              bloc('bs_creer_clone', 'c3'),
              si(compare('GT', intervalle(), n(0.45)), [ecrire('c5', 'intervalle', calc('MINUS', intervalle(), n(0.03)))])
            ]),
            // La vie d'un fantôme : il apparaît tout petit, en fondu, puis grossit…
            evt('bs_quand_clone', 'c3', [
              bloc('bs_placer', '__moi', { X: hasard(20, 396), Y: hasard(50, 276) }), // il reste dans la fenêtre même à 160 %
              bloc('bs_sprite_taille', '__moi', { VAL: n(40) }),
              fondu('apparaitre', 0.5),
              tantQue(et(v('v_enJeu'), et(libre(), compare('LT', lire('taille', '__moi'), n(160)))), [
                bloc('bs_sprite_grandir', '__moi', { VAL: calc('ADD', n(0.8), calc('DIVIDE', v('v_score'), n(25))) }),
                attendre(0.05)
              ]),
              // … et s'il devient trop gros sans avoir été attrapé, il s'échappe.
              si(et(v('v_enJeu'), libre()), [
                bloc('bs_son', null, null, { SON: 'erreur' }),
                ajouter('v_vies', n(-1)), vies(),
                si(compare('LTE', v('v_vies'), n(0)), [appeler('fin de partie')]),
                fondu('disparaitre', 0.3),
                bloc('bs_supprimer_clone')
              ]),
              // Partie finie : les fantômes qui restent s'effacent doucement.
              si(non(v('v_enJeu')), [fondu('disparaitre', 1), bloc('bs_supprimer_clone')])
            ]),
            // Un clic sur un fantôme (un clone) : attrapé !
            evt('bs_quand_clic', 'c3', [
              si(et(v('v_enJeu'), libre()), [
                bloc('bs_sprite_transparence', '__moi', { VAL: n(10) }),
                bloc('bs_son', null, null, { SON: 'piece' }),
                ajouter('v_score', n(1)), score(),
                fondu('disparaitre', 0.25),
                bloc('bs_supprimer_clone')
              ])
            ]),
            fonction('fin de partie', [
              si(v('v_enJeu'), [
                fixer('v_enJeu', vrai(false)),
                bloc('bs_minuteur_ctrl', 'c5', null, { ACTION: 'arreter' }),
                bloc('bs_sonctrl', 'c6', null, { ACTION: 'arreter' }),
                si(compare('GT', v('v_score'), record()), [
                  bloc('bs_memoriser', null, { VAL: v('v_score'), NOM: t('record fantômes') }),
                  bloc('bs_son', null, null, { SON: 'succes' })
                ]),
                ecrire('c4', 'texte', joindre(t('Les fantômes ont gagné… Score : '), v('v_score'), retourLigne(),
                  t('Record : '), record(), retourLigne(), retourLigne(), t('Clique (ou Espace) pour rejouer.'))),
                ecrire('c4', 'visible', vrai(true))
              ])
            ])
          ]);
        const musique = musiqueFantomes();
        p.sons = [window.StudioMusique
          ? { id: 'son_fantomes', nom: 'musique des fantômes', musique,
              donnees: StudioMusique.enWav(StudioMusique.rendre(musique)) }
          : { id: 'son_fantomes', nom: 'musique des fantômes', donnees: musiqueDeFond() }];
        p.sprites = [spriteFantome()];
        return p;
      }
    },
    {
      titre: '🪟 Plusieurs fenêtres',
      description: 'Une fenêtre de réglages (OK / Annuler) et une fenêtre « À propos » : comment ouvrir d\'autres fenêtres et récupérer ce qu\'on y a saisi.',
      creer: () => {
        // Fenêtre principale : c1 Bonjour · c2 Reglages (bouton) · c3 Info
        // Fenêtre « Parametres » (f2) : c4 c5 prénom · c6 c7 couleur · c8 OK · c9 Annuler
        // Fenêtre « APropos » (f3) : c10 texte · c11 Fermer
        const ouvrir = (id, attendre) => bloc('bs_fenetre_ouvrir', null, null, { FENETRE: id, MODE: attendre ? 'attendre' : 'normal' });
        const fermer = id => bloc('bs_fenetre_fermer', null, null, { FENETRE: id });
        const p = projet(
          { titre: 'Mon programme personnalisé', largeur: 440, hauteur: 260, couleurFond: '#f0f9ff', menus: 'Aide\n À propos' },
          [
            { type: 'etiquette', nom: 'Bonjour', texte: 'Bonjour !', x: 20, y: 40, largeur: 400, hauteur: 50, taillePolice: 28, couleurTexte: '#0c4a6e' },
            { type: 'bouton', nom: 'Reglages', texte: '⚙️ Réglages…', x: 20, y: 120, largeur: 160, hauteur: 36 },
            { type: 'etiquette', nom: 'Info', texte: 'Clique sur « Réglages… » pour choisir ton prénom et ta couleur.', x: 20, y: 180, largeur: 400, hauteur: 40, couleurTexte: '#475569' },
            { fenetre: 'f2', type: 'etiquette', nom: 'TexteNom', texte: 'Ton prénom :', x: 20, y: 20, largeur: 120, hauteur: 24 },
            { fenetre: 'f2', type: 'zonetexte', nom: 'Prenom', texte: '', x: 140, y: 16, largeur: 160, hauteur: 30 },
            { fenetre: 'f2', type: 'etiquette', nom: 'TexteCouleur', texte: 'Couleur du fond :', x: 20, y: 66, largeur: 120, hauteur: 24 },
            { fenetre: 'f2', type: 'selecteurcouleur', nom: 'Couleur', texte: '#f0f9ff', x: 140, y: 60, largeur: 60, hauteur: 32 },
            { fenetre: 'f2', type: 'bouton', nom: 'OK', texte: 'OK', x: 120, y: 130, largeur: 90, hauteur: 32 },
            { fenetre: 'f2', type: 'bouton', nom: 'Annuler', texte: 'Annuler', x: 220, y: 130, largeur: 90, hauteur: 32 },
            { fenetre: 'f3', type: 'etiquette', nom: 'TexteAPropos', texte: 'Programme créé avec BlocStudio.\n\nCette fenêtre ne bloque pas le reste : on peut la déplacer et continuer à utiliser la fenêtre principale.', x: 16, y: 12, largeur: 268, hauteur: 100 },
            { fenetre: 'f3', type: 'bouton', nom: 'Fermer', texte: 'Fermer', x: 190, y: 116, largeur: 90, hauteur: 30 }
          ],
          ['valide'],
          () => [
            // La fenêtre de réglages bloque le reste du programme : les blocs qui suivent
            // attendent qu'on l'ait fermée, puis lisent ce qu'on y a saisi.
            evt('bs_quand_clic', 'c2', [
              fixer('v_valide', vrai(false)),
              ouvrir('f2', true),
              si(v('v_valide'), [
                si(estVide(lire('texte', 'c5')),
                  [ecrire('c1', 'texte', t('Bonjour !'))],
                  [ecrire('c1', 'texte', joindre(t('Bonjour '), lire('texte', 'c5'), t(' !')))]),
                bloc('bs_fond_fenetre', null, { VAL: lire('texte', 'c7') }),
                ecrire('c3', 'texte', t('✔ Réglages enregistrés.'))
              ], [
                ecrire('c3', 'texte', t('Réglages annulés : rien n\'a changé.'))
              ])
            ]),
            evt('bs_quand_clic', 'c8', [fixer('v_valide', vrai(true)), fermer('f2')]),
            evt('bs_quand_clic', 'c9', [fermer('f2')]),
            evtChamps('bs_quand_fenetre', { FENETRE: 'f2', QUOI: 'ouverture' }, [
              bloc('bs_fenetre_titre', null, { VAL: t('Réglages') }, { FENETRE: 'f2' })
            ]),
            evtMenu('Aide › À propos', [ouvrir('f3', false)]),
            evt('bs_quand_clic', 'c11', [fermer('f3')])
          ]);
        p.fenetres = [
          { id: 'f2', nom: 'Parametres', titre: 'Paramètres', largeur: 320, hauteur: 180, couleurFond: '#f8fafc' },
          { id: 'f3', nom: 'APropos', titre: 'À propos', largeur: 300, hauteur: 160, couleurFond: '#ffffff' }
        ];
        return p;
      }
    }
  ];

  window.BlocStudioExemples = exemples;
})();
