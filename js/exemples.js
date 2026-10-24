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
    let numero = 0; // c1, c2… dans l'ordre, sans compter les contrôles qui ont déjà leur identifiant
    const p = {
      format: 'BlocStudio', version: 1,
      fenetre: Object.assign({ couleurFond: '#f0f0f0' }, fenetre),
      controles: controles.map(c => Object.assign({
        id: c.id || 'c' + (++numero), texte: '', x: 20, y: 20, largeur: 120, hauteur: 28,
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

  // Commentaires (bloc « 💬 ») : `note` se glisse parmi les blocs, au-dessus de ceux qu'elle explique ;
  // `presentation` reste seule, en haut du programme, pour en donner l'idée générale.
  const note = texte => ({ type: 'bs_commentaire', extraState: { texte } });
  function presentation(texte) {
    const b = { type: 'bs_commentaire', x: 20, y, extraState: { texte } };
    y += 40 + 32 * Math.ceil(texte.length / 56);
    return b;
  }

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

  // Casse-briques : raquette (barre au milieu d'un carré de 32), balle (disque de 16) et brique
  // (barre de 16, un costume par couleur de rangée). Les bords vides ne comptent pas dans les collisions.
  function spriteRaquette() {
    const donnees = costume(32, (x, y) => {
      if (y < 13 || y > 18 || ((y === 13 || y === 18) && (x === 0 || x === 31))) return null;
      if (x <= 2 || x >= 29) return '#f472b6';
      return y === 13 ? '#e0f2fe' : y === 18 ? '#0369a1' : '#38bdf8';
    });
    return { id: 'spr_raquette', nom: 'Raquette', taille: 32, lisse: false, vitesse: 8, costumes: [{ nom: 'raquette', donnees }] };
  }

  function spriteBalle() {
    const donnees = costume(16, (x, y) => {
      const d = (x + 0.5 - 8) ** 2 + (y + 0.5 - 8) ** 2;
      if (d > 25) return null;
      return (x + 0.5 - 6.5) ** 2 + (y + 0.5 - 6.5) ** 2 <= 2.5 ? '#ffffff' : d > 16 ? '#94a3b8' : '#e2e8f0';
    });
    return { id: 'spr_balle', nom: 'Balle', taille: 16, lisse: false, vitesse: 8, costumes: [{ nom: 'balle', donnees }] };
  }

  function spriteBrique() {
    const teintes = [
      ['rouge', '#ff8fab', '#ff004d', '#9f0035'], ['orange', '#ffd08a', '#ffa300', '#b45309'],
      ['jaune', '#fff7a8', '#ffec27', '#b8a000'], ['vert', '#9dffb0', '#00e436', '#008751'],
      ['bleu', '#a8e4ff', '#29adff', '#1e40af']
    ];
    const costumes = teintes.map(([nom, clair, base, fonce]) => ({
      nom,
      donnees: costume(16, (x, y) => {
        if (y < 5 || y > 10) return null;
        if (y === 10 || x === 15) return fonce;
        return y === 5 || x === 0 ? clair : base;
      })
    }));
    return { id: 'spr_brique', nom: 'Brique', taille: 16, lisse: false, vitesse: 8, costumes };
  }

  // Ciel étoilé (240 × 180, fond transparent) : des étoiles placées « au hasard », toujours les mêmes.
  function imageEtoiles() {
    const c = document.createElement('canvas');
    c.width = 240;
    c.height = 180;
    const g = c.getContext('2d');
    let graine = 7;
    const hasard = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 90; i++) {
      const grosse = hasard() < 0.15;
      g.fillStyle = ['#ffffff', '#c7d2fe', '#fde68a', '#94a3b8'][Math.floor(hasard() * 4)];
      g.fillRect(Math.floor(hasard() * 240), Math.floor(hasard() * 180), grosse ? 2 : 1, grosse ? 2 : 1);
    }
    return c.toDataURL('image/png');
  }

  // Petit héros à casquette, tourné vers la droite : deux costumes de marche, puis un de saut.
  function spriteHeros() {
    const haut = [
      '................', '.....rrrrrr.....', '....rrrrrrrrrr..', '....sssssss.....',
      '....ssksssks....', '....sssssssss...', '.....sssssss....', '......ssss......',
      '....bbrbbrbb....', '...sbbbbbbbbs...', '...sbbbbbbbbs...', '.....bbbbbb.....'
    ];
    const jambes = [
      ['marche 1', ['.....bb..bb.....', '.....bb..bb.....', '....nnn..nnn....', '................']],
      ['marche 2', ['....bb....bb....', '...bb......bb...', '..nnn......nnn..', '................']],
      ['saut', ['.....bb..bb.....', '....bb....bb....', '...nn......nn...', '................']]
    ];
    const couleurs = { r: '#e11d48', s: '#fcd5b5', k: '#1e293b', b: '#2563eb', n: '#7c2d12' };
    return {
      id: 'spr_heros', nom: 'Héros', taille: 16, lisse: false, vitesse: 8,
      costumes: jambes.map(([nom, j]) => ({ nom, donnees: dessinTexte(haut.concat(j), couleurs) }))
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
      theme: 'debut',
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
          presentation('Le tout premier programme : quand on clique sur le bouton, il lit le prénom écrit dans la case et répond « Bonjour … ! ».'),
          evt('bs_quand_clic', 'c3', [
            note('Clic sur « Dire bonjour » : si la case Prenom est vide, on prévient. Sinon, on écrit « Bonjour » + le prénom dans l\'étiquette Resultat.'),
            si({ type: 'text_isEmpty', inputs: { VALUE: I(lire('texte', 'c2')) } },
              [message(t("Écris d'abord ton prénom !"), 'attention')],
              [ecrire('c4', 'texte', joindre(t('Bonjour '), lire('texte', 'c2'), t(' !')))])
          ])
        ])
    },
    {
      titre: '📋 Fiche d\'inscription',
      theme: 'debut',
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
          presentation('Un formulaire : quand on valide, le programme rassemble tout ce qui a été saisi dans un seul message.'),
          evt('bs_quand_clic', 'c12', [
            note('Le prénom est obligatoire. Ensuite, « créer un texte avec » colle les morceaux : prénom, âge, activité (le bouton radio coché du groupe « activite ») et présentation.'),
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
      theme: 'applications',
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
          presentation('Une zone de liste (Taches) qu\'on remplit et qu\'on vide avec trois boutons.'),
          evt('bs_quand_clic', 'c3', [
            note('➕ Ajouter : la tâche écrite dans la case va à la fin de la liste, puis la case est vidée pour la suivante.'),
            si(estVide(lire('texte', 'c2')),
              [message(t('Écris d\'abord une tâche dans la case.'), 'attention')],
              [listeAjouter('c4', lire('texte', 'c2')), ecrire('c2', 'texte', t(''))])
          ]),
          evt('bs_quand_clic', 'c5', [
            note('✔ Terminée : « numéro choisi » vaut 0 si aucune tâche n\'est sélectionnée ; sinon, on retire celle-là.'),
            si(compare('EQ', lire('numero', 'c4'), n(0)),
              [message(t('Clique d\'abord sur une tâche dans la liste.'), 'info')],
              [listeRetirer('c4', lire('numero', 'c4')), message(t('Bravo, une tâche de moins !'), 'succes')])
          ]),
          evt('bs_quand_clic', 'c6', [
            note('🗑️ Tout effacer : on demande d\'abord confirmation.'),
            si(confirmer('Effacer toutes les tâches ?'), [listeVider('c4')])
          ])
        ])
    },
    {
      titre: '🎨 Mini-Paint',
      theme: 'multimedia',
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
          presentation('Un logiciel de dessin. Quand la souris bouge avec le bouton enfoncé, la Toile trace un petit trait entre l\'ancienne position de la souris et la nouvelle : mis bout à bout, ces traits font le dessin.'),
          evt('bs_quand_demarre', null, [
            note('Au départ, le crayon prend la couleur et l\'épaisseur choisies à droite.'),
            dessin('bs_dessin_couleur', 'c1', { VAL: lire('texte', 'c3') }),
            dessin('bs_dessin_epaisseur', 'c1', { VAL: lire('valeur', 'c5') })
          ]),
          evt('bs_quand_glisse', 'c1', [
            note('Un trait de l\'ancienne position de la souris (px, py) à la nouvelle (x, y).'),
            dessin('bs_dessin_trait', 'c1', {
              X1: souris('px', 'c1'), Y1: souris('py', 'c1'), X2: souris('x', 'c1'), Y2: souris('y', 'c1')
            })
          ]),
          evt('bs_quand_clic', 'c1', [
            note('Un simple clic dessine un point.'),
            dessin('bs_dessin_point', 'c1', { X: souris('x', 'c1'), Y: souris('y', 'c1') })
          ]),
          evt('bs_quand_change', 'c3', [
            note('Nouvelle couleur choisie dans la liste : le crayon change.'),
            dessin('bs_dessin_couleur', 'c1', { VAL: lire('texte', 'c3') })
          ]),
          evt('bs_quand_change', 'c5', [
            note('Le curseur règle l\'épaisseur du crayon.'),
            dessin('bs_dessin_epaisseur', 'c1', { VAL: lire('valeur', 'c5') })
          ]),
          evt('bs_quand_clic', 'c6', [
            note('On demande avant d\'effacer, pour ne pas perdre un dessin par erreur.'),
            si(confirmer('Effacer tout le dessin ?'), [dessin('bs_dessin_effacer', 'c1')])
          ]),
          evt('bs_quand_clic', 'c8', [note('Le contrôle Fichier fait tout : la fenêtre « Ouvrir » de Windows, puis l\'image posée dans la Toile.'), bloc('bs_fichier_ouvrir_dans', 'c10', null, { CIBLE: 'c1' })]),
          evt('bs_quand_clic', 'c9', [note('Enregistre le dessin de la Toile dans une image PNG.'), bloc('bs_fichier_enregistrer_de', 'c10', null, { CIBLE: 'c1' })])
        ])
    },
    {
      titre: '🔐 Carnet secret',
      theme: 'applications',
      description: 'Un mot de passe pour entrer, des pages rangées dans une arborescence, une barre d\'état. Les notes sont gardées d\'une fois sur l\'autre.',
      creer: () => {
        // c1-c4 : l'entrée (étiquette, mot de passe, interrupteur « Montrer », bouton Entrer)
        // c5 Pages (arborescence) · c6 Note · c7 Garder · c8 Verrouiller · c9 Etat (barre d'état) · c10 Notes (base)
        const entree = ['c1', 'c2', 'c3', 'c4'], carnet = ['c5', 'c6', 'c7', 'c8'];
        const montrer = (ids, oui) => ids.map(id => ecrire(id, 'visible', vrai(oui)));
        const etat = (num, x) => bloc('bs_barreetat_ecrire', 'c9', { VAL: x, NUM: n(num) });
        const chemin = () => lire('chemin', 'c5');
        const ficheDeLaPage = () => bloc('bs_base_premiere', 'c10', { VAL: chemin() }, { CHAMP: 'Page', OP: 'egal' });
        return projet(
          { titre: 'Carnet secret', largeur: 560, hauteur: 350, couleurFond: '#f5f3ff' },
          [
            { type: 'etiquette', nom: 'Invitation', texte: '🔐 Mot de passe :', x: 90, y: 120, largeur: 130, hauteur: 28, taillePolice: 15 },
            { type: 'zonetexte', nom: 'MotDePasse', motDePasse: true, x: 220, y: 118, largeur: 160, hauteur: 30 },
            { type: 'interrupteur', nom: 'Montrer', texte: 'Montrer', x: 390, y: 122, largeur: 100, hauteur: 26 },
            { type: 'bouton', nom: 'Entrer', texte: '🔓 Entrer', x: 220, y: 160, largeur: 160, hauteur: 34 },
            { type: 'arborescence', nom: 'Pages', x: 10, y: 10, largeur: 190, hauteur: 300, visible: false, deplie: true,
              arbre: 'École\n  Devoirs\n  Copains\nMaison\n  Cachettes\n  Liste de cadeaux\nIdées\n  Inventions\n  Histoires' },
            { type: 'zonetexte', nom: 'Note', multiligne: true, x: 210, y: 10, largeur: 340, hauteur: 258, couleurFond: '#ffffff', visible: false },
            { type: 'bouton', nom: 'Garder', texte: '💾 Garder la note', x: 210, y: 276, largeur: 160, hauteur: 34, visible: false },
            { type: 'bouton', nom: 'Verrouiller', texte: '🔒 Verrouiller', x: 410, y: 276, largeur: 140, hauteur: 34, visible: false },
            { type: 'barreetat', nom: 'Etat', texte: '🔒 Verrouillé|Astuce : le mot de passe est 1234', x: 0, y: 326, largeur: 560, hauteur: 24, taillePolice: 12 },
            {
              type: 'basedonnees', nom: 'Notes', largeur: 0, hauteur: 0, memoriser: true, champs: ['Page', 'Note'],
              fiches: [['Maison › Cachettes', 'La clé du coffre est sous le pot de fleurs 🌼'], ['Idées › Inventions', 'Un robot qui range ma chambre 🤖']]
            }
          ],
          ['numero'],
          () => [
            presentation('Deux « écrans » dans la même fenêtre : l\'entrée (mot de passe) et le carnet. On passe de l\'un à l\'autre en cachant certains contrôles et en montrant les autres. Les notes sont rangées dans la base de données Notes : une fiche par page.'),
            evt('bs_quand_change', 'c3', [note('L\'interrupteur « Montrer » affiche le mot de passe en clair, ou le cache.'), ecrire('c2', 'motDePasse', non(lire('coche', 'c3')))]),
            evt('bs_quand_clic', 'c4', [
              note('Le bon mot de passe cache l\'entrée et montre le carnet. Sinon : un son d\'erreur, et la case est vidée.'),
              si(compare('EQ', lire('texte', 'c2'), t('1234')),
                [
                  ...montrer(entree, false), ...montrer(carnet, true),
                  ecrire('c6', 'texte', t('')),
                  etat(1, t('🔓 Carnet ouvert')), etat(2, t('Choisissez une page à gauche')),
                  bloc('bs_son', null, null, { SON: 'succes' })
                ],
                [
                  bloc('bs_son', null, null, { SON: 'erreur' }),
                  etat(2, t('❌ Mauvais mot de passe, essayez encore')),
                  ecrire('c2', 'texte', t(''))
                ])
            ]),
            // Une page choisie : on cherche sa note dans la base.
            evt('bs_quand_change', 'c5', [
              note('Une page choisie dans l\'arborescence : on cherche sa fiche dans la base (0 = pas encore de note) et on affiche sa note.'),
              fixer('v_numero', ficheDeLaPage()),
              si(compare('EQ', v('v_numero'), n(0)),
                [ecrire('c6', 'texte', t(''))],
                [ecrire('c6', 'texte', bloc('bs_base_champ', 'c10', { N: v('v_numero') }, { CHAMP: 'Note' }))]),
              etat(2, joindre(t('📄 '), chemin()))
            ]),
            evt('bs_quand_clic', 'c7', [
              note('💾 Garder : si la page n\'a pas encore de fiche, on en ajoute une ; sinon, on modifie sa note.'),
              si(estVide(chemin()),
                [message(t('Choisissez d\'abord une page dans la liste de gauche.'), 'info')],
                [
                  fixer('v_numero', ficheDeLaPage()),
                  si(compare('EQ', v('v_numero'), n(0)),
                    [{
                      type: 'bs_base_ajouter', fields: { CTRL: 'c10' }, extraState: { champs: ['Page', 'Note'] },
                      inputs: { V0: I(chemin()), V1: I(lire('texte', 'c6')) }
                    }],
                    [bloc('bs_base_modifier', 'c10', { N: v('v_numero'), VAL: lire('texte', 'c6') }, { CHAMP: 'Note' })]),
                  etat(2, joindre(t('💾 Note gardée : '), chemin()))
                ])
            ]),
            evt('bs_quand_clic', 'c8', [
              note('🔒 Verrouiller : le carnet disparaît, l\'entrée revient.'),
              ...montrer(carnet, false), ...montrer(entree, true),
              ecrire('c2', 'texte', t('')),
              etat(1, t('🔒 Verrouillé')), etat(2, t('À bientôt !'))
            ])
          ]);
      }
    },
    {
      titre: '📸 Photomaton',
      theme: 'multimedia',
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
            presentation('La caméra filme en direct. Le bouton lance un compte à rebours, prend la photo et la montre à droite ; on peut ensuite l\'enregistrer.'),
            evt('bs_quand_demarre', null, [note('Pas encore de photo : rien à enregistrer, le bouton est grisé.'), ecrire('c5', 'active', vrai(false))]),
            evt('bs_quand_clic', 'c3', [
              note('Le bouton est grisé pendant le compte à rebours, pour ne pas le relancer. Puis 3, 2, 1 : un chiffre et un bip par seconde.'),
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
              note('« annulé ? » est vrai si on a fermé la fenêtre « Enregistrer » sans choisir de fichier.'),
              bloc('bs_fichier_enregistrer_de', 'c8', null, { CIBLE: 'c1' }),
              si(non(bloc('bs_fichier_annule', 'c8')), [
                ecrire('c7', 'texte', joindre(t('💾 '), bloc('bs_fichier_nom', 'c8')))
              ])
            ]),
            evt('bs_quand_change', 'c4', [note('L\'interrupteur allume ou éteint la caméra.'), ecrire('c1', 'allumee', lire('coche', 'c4'))]),
            evt('bs_quand_camera_mouvement', 'c1', [
              note('La caméra compare chaque image à la précédente : si assez de pixels changent, c\'est un mouvement.'),
              ecrire('c7', 'texte', t('👀 Ça bouge !')),
              attendre(1),
              ecrire('c7', 'texte', t(''))
            ])
          ]);
      }
    },
    {
      titre: '📝 Bloc-notes',
      theme: 'applications',
      description: 'Un petit traitement de texte : menus Fichier, barre d\'outils, menu au clic droit sur le texte, glisser-déposer d\'un fichier. On peut agrandir la fenêtre : le texte suit (ancrage).',
      creer: () => {
        // c1 Texte · c2 Etat · c3 FichierTexte (contrôle Fichier, invisible)
        // c4 Outils (barre d'outils) · c5 MenuTexte (menu contextuel du texte, invisible)
        // Menus et barre d'outils font la même chose : ils envoient un message, et le travail est fait une seule fois.
        const etat = x => ecrire('c2', 'texte', x);
        const annule = () => bloc('bs_fichier_annule', 'c3');
        const nomFichier = () => bloc('bs_fichier_nom', 'c3');
        const envoyer = m => bloc('bs_envoyer_message', null, null, { MSG: m, ATTENDRE: 'non' });
        const quandMessage = (m, blocs) => Object.assign(evt('bs_quand_message', null, blocs), { fields: { MSG: m } });
        const quandOutil = (bouton, blocs) => Object.assign(evt('bs_quand_outil', 'c4', blocs), { fields: { CTRL: 'c4', ITEM: bouton } });
        const quandMenuTexte = (element, blocs) => Object.assign(evt('bs_quand_menu_contextuel', 'c5', blocs), { fields: { CTRL: 'c5', ITEM: element } });
        const casse = c => ({ type: 'text_changeCase', fields: { CASE: c }, inputs: { TEXT: I(lire('texte', 'c1')) } });
        return projet(
          {
            titre: 'Bloc-notes', largeur: 520, hauteur: 380, couleurFond: '#f1f5f9', menus: 'Fichier\n  Nouveau\n  Ouvrir…\n  Enregistrer…',
            redimensionnable: true, agrandir: true, largeurMin: 300, hauteurMin: 200
          },
          [
            // Le texte s'étire avec la fenêtre ; la ligne d'état reste collée en bas. Clic droit : son menu (MenuTexte).
            { type: 'zonetexte', nom: 'Texte', multiligne: true, ancrage: 'hbgd', menuContextuel: 'c5', x: 10, y: 44, largeur: 500, hauteur: 278, taillePolice: 15,
              couleurFond: '#ffffff', texte: 'Écrivez ici, puis 💾 Enregistrer.\n\nAstuces : faites un clic droit sur le texte, ou glissez un fichier texte sur la fenêtre pour l\'ouvrir.' },
            { type: 'etiquette', nom: 'Etat', ancrage: 'bgd', texte: '📄 Nouveau document', x: 10, y: 330, largeur: 500, hauteur: 22, taillePolice: 13, couleurTexte: '#475569' },
            { type: 'fichier', nom: 'FichierTexte', typeFichier: 'texte', nomPropose: 'mes notes.txt', largeur: 0, hauteur: 0 },
            { type: 'barreoutils', nom: 'Outils', boutons: '📄 Nouveau\n📂 Ouvrir\n💾 Enregistrer', x: 0, y: 0, largeur: 520, hauteur: 34, taillePolice: 13 },
            { type: 'menucontextuel', nom: 'MenuTexte', menu: '🔠 MAJUSCULES\n🔡 minuscules\n-\n🧹 Tout effacer', largeur: 0, hauteur: 0 }
          ],
          [],
          () => [
            presentation('Le menu Fichier et la barre d\'outils font la même chose : chacun envoie juste un message (« nouveau », « ouvrir », « enregistrer »). Le travail n\'est écrit qu\'une fois, dans « quand je reçois … ».'),
            evtMenu('Fichier › Nouveau', [envoyer('nouveau')]),
            evtMenu('Fichier › Ouvrir…', [envoyer('ouvrir')]),
            evtMenu('Fichier › Enregistrer…', [envoyer('enregistrer')]),
            quandOutil('📄 Nouveau', [envoyer('nouveau')]),
            quandOutil('📂 Ouvrir', [envoyer('ouvrir')]),
            quandOutil('💾 Enregistrer', [envoyer('enregistrer')]),
            quandMessage('nouveau', [
              note('On demande avant d\'effacer le texte.'),
              si(confirmer('Effacer le texte pour commencer un nouveau document ?'), [
                ecrire('c1', 'texte', t('')),
                etat(t('📄 Nouveau document'))
              ])
            ]),
            quandMessage('ouvrir', [
              note('La fenêtre « Ouvrir » de Windows. Si on n\'a pas annulé, le contenu du fichier va dans le texte et son nom dans la ligne d\'état.'),
              bloc('bs_fichier_ouvrir_avec', 'c3'),
              si(non(annule()), [
                ecrire('c1', 'texte', bloc('bs_fichier_contenu', 'c3')),
                etat(joindre(t('📄 '), nomFichier()))
              ])
            ]),
            quandMessage('enregistrer', [
              note('La fenêtre « Enregistrer sous », puis le texte est écrit dans le fichier choisi.'),
              { type: 'bs_fichier_enregistrer_avec', fields: { CTRL: 'c3' }, inputs: { VAL: I(lire('texte', 'c1')) } },
              si(annule(),
                [etat(t('Enregistrement annulé.'))],
                [etat(joindre(t('💾 Enregistré : '), nomFichier()))])
            ]),
            quandMenuTexte('🔠 MAJUSCULES', [note('Le menu du clic droit sur le texte (menu contextuel MenuTexte).'), ecrire('c1', 'texte', casse('UPPERCASE'))]),
            quandMenuTexte('🔡 minuscules', [ecrire('c1', 'texte', casse('LOWERCASE'))]),
            quandMenuTexte('🧹 Tout effacer', [
              si(confirmer('Effacer tout le texte ?'), [ecrire('c1', 'texte', t(''))])
            ]),
            evt('bs_quand_fichier_depose', 'c3', [
              note('Un fichier glissé sur la fenêtre est ouvert directement.'),
              ecrire('c1', 'texte', bloc('bs_fichier_contenu', 'c3')),
              etat(joindre(t('📄 '), nomFichier(), t(' (déposé)')))
            ])
          ]);
      }
    },
    {
      titre: '💬 Messagerie',
      theme: 'applications',
      description: 'Une discussion avec Robi, un petit robot : chaque message est une bulle (un clone) ajoutée dans un panneau défilant, qui descend tout en bas.',
      creer: () => {
        // c1 Fil (panneau défilant) · c2 Bulle (dans le panneau, cachée : ce sont ses clones qu'on voit)
        // c3 Saisie · c4 Envoyer
        const minuscules = x => ({ type: 'text_changeCase', fields: { CASE: 'LOWERCASE' }, inputs: { TEXT: I(x) } });
        const contient = mot => ({ type: 'bs_contient', inputs: { DANS: I(minuscules(v('v_texte'))), VAL: I(t(mot)) } });
        const auHasard = (...phrases) => ({ type: 'lists_getIndex', fields: { MODE: 'GET', WHERE: 'RANDOM' }, inputs: { VALUE: I(liste(...phrases.map(t))) } });
        const titre = s => bloc('bs_fenetre_titre', null, { VAL: t(s) }, { FENETRE: '' });
        // Une ligne de bulle pour environ 28 lettres.
        const lignes = { type: 'math_round', fields: { OP: 'ROUNDUP' }, inputs: { NUM: I(calc('DIVIDE', { type: 'text_length', inputs: { VALUE: I(v('v_texte')) } }, n(28))) } };
        return projet(
          { titre: 'Messagerie', largeur: 400, hauteur: 340, couleurFond: '#f0f2f5' },
          [
            { type: 'panneau', nom: 'Fil', x: 10, y: 10, largeur: 380, hauteur: 276, couleurFond: '#e5ddd5', defilement: 'vertical', largeurContenu: 0, hauteurContenu: 0 },
            { type: 'etiquette', nom: 'Bulle', panneau: 'c1', visible: false, alignement: 'centre', x: 8, y: 10, largeur: 220, hauteur: 33, couleurFond: '#ffffff' },
            { type: 'zonetexte', nom: 'Saisie', texteInvite: 'Écris un message… (Entrée pour envoyer)', x: 10, y: 296, largeur: 288, hauteur: 32 },
            { type: 'bouton', nom: 'Envoyer', texte: 'Envoyer ➤', x: 306, y: 296, largeur: 84, hauteur: 32, couleurFond: '#25d366', couleurTexte: '#ffffff', gras: true }
          ],
          ['texte', 'deMoi', 'prochainY'],
          () => [
            presentation('Chaque message est une bulle : un clone de l\'étiquette Bulle (cachée), posé dans le panneau défilant Fil. La variable prochainY retient où poser la bulle suivante.'),
            evt('bs_quand_demarre', null, [
              note('Robi dit bonjour : on prépare le texte de sa bulle, puis on la crée.'),
              fixer('v_prochainY', n(10)),
              fixer('v_deMoi', vrai(false)),
              fixer('v_texte', t('Salut ! Je suis Robi 🤖. Écris-moi quelque chose !')),
              bloc('bs_creer_clone', 'c2'),
              bloc('bs_focus', 'c3')
            ]),
            evt('bs_quand_clic', 'c4', [appeler('envoyer')]),
            evtChamps('bs_quand_touche', { TOUCHE: 'entree' }, [note('Entrée envoie le message, comme le bouton.'), appeler('envoyer')]),
            // Ma bulle, puis la réponse de Robi une seconde plus tard.
            fonction('envoyer', [
              note('Ma bulle d\'abord, puis la réponse de Robi une seconde plus tard (« Robi écrit… » dans la barre de titre en attendant).'),
              si(non(estVide(lire('texte', 'c3'))), [
                fixer('v_texte', lire('texte', 'c3')),
                fixer('v_deMoi', vrai(true)),
                bloc('bs_creer_clone', 'c2'),
                ecrire('c3', 'texte', t('')),
                bloc('bs_focus', 'c3'),
                titre('Robi écrit…'),
                attendre(1),
                appeler('réponse de Robi'),
                fixer('v_deMoi', vrai(false)),
                bloc('bs_creer_clone', 'c2'),
                titre('Messagerie')
              ])
            ]),
            // Robi cherche des mots dans le message (en minuscules) ; sinon, il répond au hasard.
            fonction('réponse de Robi', [
              note('Robi cherche des mots dans le message (mis en minuscules pour trouver aussi « Bonjour ») ; sinon, il répond une phrase au hasard.'),
              si(ou(contient('bonjour'), contient('salut')), [fixer('v_texte', t('Salut ! 👋 Comment ça va ?'))], [
                si(contient('?'), [fixer('v_texte', t('Bonne question… Je dirais oui ! 🤔'))], [
                  fixer('v_texte', auHasard('Ah oui ? Raconte !', 'Trop bien ! 😄', 'Intéressant…', 'Je suis d\'accord ! 👍', 'Hi hi 😊'))
                ])
              ])
            ]),
            // Chaque bulle est un clone : à droite et en vert pour moi, à gauche et en blanc pour Robi.
            evt('bs_quand_clone', 'c2', [
              note('Une nouvelle bulle : son texte, sa hauteur (une ligne pour environ 28 lettres), à droite en vert pour moi ou à gauche en blanc pour Robi. Puis le fil descend tout en bas.'),
              ecrire('__moi', 'texte', v('v_texte')),
              ecrire('__moi', 'hauteur', calc('ADD', n(14), calc('MULTIPLY', n(19), lignes))),
              si(v('v_deMoi'),
                [ecrire('__moi', 'x', n(136)), ecrire('__moi', 'couleurFond', t('#dcf8c6'))],
                [ecrire('__moi', 'x', n(8)), ecrire('__moi', 'couleurFond', t('#ffffff'))]),
              ecrire('__moi', 'y', v('v_prochainY')),
              ecrire('__moi', 'visible', vrai(true)),
              ajouter('v_prochainY', calc('ADD', lire('hauteur', '__moi'), n(8))),
              bloc('bs_panneau_defiler', 'c1', null, { QUOI: 'bas' })
            ])
          ]);
      }
    },
    {
      titre: '🌦️ Météo',
      theme: 'applications',
      description: 'La météo en ce moment dans la ville de son choix, lue sur Internet (il faut une connexion) : température, temps qu\'il fait, vent…',
      creer: () => {
        // c1 Ville · c2 Voir · c3 Emoji · c4 Temperature · c5 Details · c6 Lieu
        const meteo = quoi => bloc('bs_meteo', null, { VAL: lire('texte', 'c1') }, { QUOI: quoi });
        const arrondi = x => ({ type: 'math_round', fields: { OP: 'ROUND' }, inputs: { NUM: I(x) } });
        return projet(
          { titre: 'Météo', largeur: 420, hauteur: 290, couleurFond: '#e0f2fe' },
          [
            { type: 'zonetexte', nom: 'Ville', texte: 'Paris', texteInvite: 'Une ville…', x: 16, y: 16, largeur: 250, hauteur: 32, taillePolice: 16 },
            { type: 'bouton', nom: 'Voir', texte: '🔍 Voir la météo', x: 274, y: 16, largeur: 130, hauteur: 32, couleurFond: '#0369a1', couleurTexte: '#ffffff', gras: true },
            { type: 'etiquette', nom: 'Emoji', texte: '', alignement: 'centre', x: 16, y: 92, largeur: 110, hauteur: 90, taillePolice: 60 },
            { type: 'etiquette', nom: 'Temperature', texte: '', x: 134, y: 104, largeur: 270, hauteur: 60, taillePolice: 42, couleurTexte: '#0c4a6e', gras: true },
            { type: 'etiquette', nom: 'Details', texte: '', x: 16, y: 190, largeur: 388, hauteur: 90, taillePolice: 14, couleurTexte: '#334155' },
            { type: 'etiquette', nom: 'Lieu', texte: '', x: 16, y: 60, largeur: 388, hauteur: 26, taillePolice: 15, couleurTexte: '#0c4a6e', gras: true }
          ],
          [],
          () => [
            presentation('Le bloc « météo à … » demande la météo sur Internet (service Open-Meteo) pour la ville écrite dans la case.'),
            evt('bs_quand_demarre', null, [note('Au lancement, on montre déjà la météo de la ville écrite dans la case.'), appeler('afficher la météo')]),
            evt('bs_quand_clic', 'c2', [appeler('afficher la météo')]),
            evtChamps('bs_quand_touche', { TOUCHE: 'entree' }, [appeler('afficher la météo')]),
            // Chaque « météo à … » lit Internet ; les suivants, dans les 5 minutes, réutilisent la même réponse.
            fonction('afficher la météo', [
              note('« trouvée ? » est faux si la ville est inconnue (ou sans Internet). Sinon, on lit chaque information : ville, emoji, température, vent…'),
              ecrire('c3', 'texte', t('⏳')),
              ecrire('c4', 'texte', t('')),
              ecrire('c5', 'texte', t('Je demande la météo sur Internet…')),
              si(meteo('trouvee'), [
                ecrire('c6', 'texte', joindre(t('📍 '), meteo('ville'))),
                ecrire('c3', 'texte', meteo('emoji')),
                ecrire('c4', 'texte', joindre(arrondi(meteo('temperature')), t(' °C'))),
                ecrire('c5', 'texte', joindre(
                  meteo('description'), t(', ressenti '), arrondi(meteo('ressenti')), t(' °C'), retourLigne(),
                  t('💨 Vent : '), arrondi(meteo('vent')), t(' km/h   💧 Humidité : '), meteo('humidite'), t(' %'), retourLigne(),
                  t('📈 Aujourd\'hui : de '), arrondi(meteo('min')), t(' à '), arrondi(meteo('max')), t(' °C')))
              ], [
                ecrire('c6', 'texte', t('')),
                ecrire('c3', 'texte', t('🤷')),
                ecrire('c5', 'texte', joindre(t('Je ne trouve pas la ville « '), lire('texte', 'c1'), t(' ». Vérifiez son orthographe.')))
              ])
            ])
          ]);
      }
    },
    {
      titre: '🧮 Quiz de calcul',
      theme: 'debut',
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
          presentation('Une boucle « pour » pose 5 questions : la variable question compte de 1 à 5. La barre de progression montre où on en est.'),
          evt('bs_quand_clic', 'c2', [
            note('Le bouton est grisé pendant le quiz, et le score repart de 0.'),
            ecrire('c2', 'active', vrai(false)),
            fixer('v_score', n(0)),
            ecrire('c4', 'texte', t('Score : 0 / 5')),
            pour('v_question', 1, 5, [
              ecrire('c3', 'valeur', calc('MINUS', v('v_question'), n(1))),
              note('Deux nombres au hasard entre 2 et 10, puis on demande le résultat de leur multiplication.'),
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
      theme: 'debut',
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
          presentation('Le curseur choisit la durée ; une boucle compte à rebours, une seconde à la fois.'),
          evt('bs_quand_change', 'c2', [
            note('Le curseur bouge : on met à jour le texte, le grand chiffre et la barre.'),
            ecrire('c1', 'texte', joindre(t('Durée : '), lire('valeur', 'c2'), t(' secondes'))),
            ecrire('c3', 'texte', lire('valeur', 'c2')),
            ecrire('c4', 'max', lire('valeur', 'c2')),
            ecrire('c4', 'valeur', lire('valeur', 'c2'))
          ]),
          evt('bs_quand_clic', 'c5', [
            note('Pendant le décompte, le bouton et le curseur sont grisés. La variable reste diminue de 1 chaque seconde, jusqu\'à 0.'),
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
      theme: 'jeux',
      description: 'Une animation avec « répéter indéfiniment » et « attendre ».',
      creer: () => projet(
        { titre: 'Balle qui rebondit', largeur: 420, hauteur: 300 },
        [
          { type: 'zonedessin', nom: 'Terrain', x: 10, y: 10, largeur: 400, hauteur: 240, couleurFond: '#ecfdf5' },
          { type: 'etiquette', nom: 'Info', texte: 'Clique sur le terrain pour changer de couleur', x: 10, y: 262, largeur: 400, taillePolice: 13, couleurTexte: '#475569' }
        ],
        ['x', 'y', 'vx', 'vy'],
        () => [
          presentation('Une animation dessinée : à chaque tour de boucle, on efface, on dessine la balle, puis on la déplace de vx et vy. Au bord, la vitesse change de signe : la balle repart dans l\'autre sens.'),
          evt('bs_quand_demarre', null, [
            fixer('v_x', n(60)), fixer('v_y', n(60)), fixer('v_vx', n(4)), fixer('v_vy', n(3)),
            dessin('bs_dessin_couleur', 'c1', { VAL: couleur('rouge') }),
            toujours([
              note('Une image de l\'animation : 50 par seconde, grâce à « attendre 0,02 ».'),
              dessin('bs_dessin_effacer', 'c1'),
              dessin('bs_dessin_cercle', 'c1', { X: v('v_x'), Y: v('v_y'), R: n(16) }, { PLEIN: 'TRUE' }),
              ajouter('v_x', v('v_vx')),
              ajouter('v_y', v('v_vy')),
              note('Bord gauche ou droit : vx change de signe. Bord du haut ou du bas : vy.'),
              si(ou(compare('LT', v('v_x'), n(16)), compare('GT', v('v_x'), n(384))),
                [fixer('v_vx', calc('MINUS', n(0), v('v_vx')))]),
              si(ou(compare('LT', v('v_y'), n(16)), compare('GT', v('v_y'), n(224))),
                [fixer('v_vy', calc('MINUS', n(0), v('v_vy')))]),
              attendre(0.02)
            ])
          ]),
          evt('bs_quand_clic', 'c1', [
            note('Clic sur le terrain : une couleur au hasard dans la liste.'),
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
      theme: 'applications',
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
            presentation('Le tableau Contacts a sa case « garder » cochée : son contenu est retrouvé au prochain lancement. Le menu Fichier l\'exporte au format CSV, que lit Excel.'),
            evt('bs_quand_demarre', null, [compteur()]),
            evt('bs_quand_clic', 'c7', [
              note('➕ Ajouter : une ligne avec les trois cases, puis on les vide.'),
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
              note('Clic sur une ligne du tableau : ses valeurs reviennent dans les cases.'),
              ecrire('c2', 'texte', cellule('Nom')),
              ecrire('c4', 'texte', cellule('Prénom')),
              ecrire('c6', 'texte', cellule('Téléphone'))
            ]),
            evt('bs_quand_clic', 'c8', [
              note('« numéro choisi » vaut 0 si aucune ligne n\'est sélectionnée.'),
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
              note('« ouvrir un fichier » donne un texte vide si on annule.'),
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
      theme: 'applications',
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
            presentation('Les livres sont rangés dans une base de données (Bibliotheque) ; le tableau Livres ne fait que les montrer. La fonction actualiser remplit le tableau, avec ou sans recherche.'),
            evt('bs_quand_demarre', null, [appeler('actualiser')]),
            // Montre toute la base, ou seulement les livres dont le titre ou l'auteur contient la recherche.
            fonction('actualiser', [
              note('Recherche vide : toute la base. Sinon, on cherche dans les titres, puis dans les auteurs si aucun titre ne correspond.'),
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
              note('Une nouvelle fiche : titre, auteur et année.'),
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
              note('« fiche choisie » : celle de la ligne sélectionnée dans le tableau (0 = aucune).'),
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
            evt('bs_quand_change', 'c11', [note('La recherche se refait à chaque lettre tapée.'), appeler('actualiser')])
          ]);
      }
    },
    {
      titre: '🪙 Attrape la pièce',
      theme: 'jeux',
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
            presentation('Le minuteur Chute fait avancer le jeu : toutes les 0,03 seconde, la pièce descend et on regarde si le panier la touche. La variable enJeu vaut vrai pendant une partie.'),
            evt('bs_quand_demarre', null, [fixer('v_enJeu', vrai(false))]),
            evtChamps('bs_quand_touche', { TOUCHE: 'espace' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            evtChamps('bs_quand_souris_fenetre', { QUOI: 'clic' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            fonction('nouvelle partie', [
              note('Tout remettre à zéro, puis démarrer le minuteur et la musique.'),
              fixer('v_score', n(0)), fixer('v_vies', n(3)), fixer('v_vitesse', n(3)), fixer('v_enJeu', vrai(true)),
              score(), vies(),
              ecrire('c5', 'visible', vrai(false)),
              appeler('replacer la pièce'),
              bloc('bs_minuteur_ctrl', 'c7', null, { ACTION: 'demarrer' }),
              bloc('bs_sonctrl', 'c6', null, { ACTION: 'jouer' })
            ]),
            fonction('replacer la pièce', [
              note('La pièce repart d\'en haut (au-dessus de la fenêtre), à un endroit au hasard.'),
              ecrire('c3', 'y', n(-50)),
              ecrire('c3', 'x', hasard(10, 420))
            ]),
            evt('bs_quand_minuteur', 'c7', [
              note('Les flèches enfoncées déplacent le panier, sans sortir de la fenêtre. Puis la pièce descend ; elle tombe un peu plus vite à chaque pièce attrapée.'),
              si(et(touche('gauche'), compare('GT', x('c4'), n(0))), [ecrire('c4', 'x', calc('MINUS', x('c4'), n(8)))]),
              si(et(touche('droite'), compare('LT', x('c4'), n(408))), [ecrire('c4', 'x', calc('ADD', x('c4'), n(8)))]),
              ecrire('c3', 'y', calc('ADD', yy('c3'), v('v_vitesse'))),
              si({ type: 'bs_se_touchent', fields: { CTRL: 'c4', CTRL2: 'c3' } }, [
                bloc('bs_son', null, null, { SON: 'piece' }),
                ajouter('v_score', n(1)), score(),
                ajouter('v_vitesse', n(0.3)),
                appeler('replacer la pièce')
              ]),
              note('Pièce ratée (sortie par le bas) : une vie de moins.'),
              si(compare('GT', yy('c3'), n(360)), [
                bloc('bs_son', null, null, { SON: 'erreur' }),
                ajouter('v_vies', n(-1)), vies(),
                appeler('replacer la pièce'),
                si(compare('LTE', v('v_vies'), n(0)), [appeler('fin de partie')])
              ])
            ]),
            evtChamps('bs_quand_souris_fenetre', { QUOI: 'bouge' }, [
              note('Le panier suit la souris (on retire la moitié de sa largeur pour le centrer).'),
              si(v('v_enJeu'), [ecrire('c4', 'x', calc('MINUS', { type: 'bs_souris_fenetre', fields: { QUOI: 'x' } }, n(36)))])
            ]),
            fonction('fin de partie', [
              note('Le record est gardé en mémoire d\'une fois sur l\'autre.'),
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
      theme: 'jeux',
      description: 'Un jeu avec des clones : des météorites de plus en plus nombreuses, à éviter avec la souris ou les flèches.',
      creer: () => {
        // c1 Score · c2 Vaisseau · c3 Meteorite (cachée : ce sont ses clones qui tombent) · c4 Consigne · c5 Apparition (Minuteur)
        // c0 Etoiles : le ciel qui défile, posé en premier pour être derrière tout le reste
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
            { id: 'c0', type: 'image', nom: 'Etoiles', image: imageEtoiles(), ajustement: 'etiree', x: 0, y: 0, largeur: 480, hauteur: 360 },
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
            presentation('Un jeu avec des clones : Meteorite reste cachée, ce sont ses copies qui tombent. Le minuteur Apparition en crée une à chaque tic, de plus en plus souvent.'),
            evt('bs_quand_demarre', null, [
              fixer('v_enJeu', vrai(false)),
              note('Le ciel étoilé défile vers le bas, sans fin : le vaisseau a l\'air d\'avancer. Plus vite pendant la partie.'),
              toujours([
                bloc('bs_image_defiler', 'c0', { DX: n(0), DY: { type: 'logic_ternary', inputs: { IF: I(v('v_enJeu')), THEN: I(n(3)), ELSE: I(n(1)) } } }),
                attendre(0.02)
              ])
            ]),
            evtChamps('bs_quand_touche', { TOUCHE: 'espace' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            evtChamps('bs_quand_souris_fenetre', { QUOI: 'clic' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            fonction('nouvelle partie', [
              note('Plus aucune météorite, score à zéro, et le minuteur démarre.'),
              bloc('bs_supprimer_clones', 'c3'),
              fixer('v_score', n(0)), score(),
              fixer('v_enJeu', vrai(true)),
              ecrire('c4', 'visible', vrai(false)),
              ecrire('c5', 'intervalle', n(0.6)),
              bloc('bs_minuteur_ctrl', 'c5', null, { ACTION: 'demarrer' })
            ]),
            // Chaque « tic » fait apparaître une météorite, de plus en plus souvent.
            evt('bs_quand_minuteur', 'c5', [
              note('Chaque tic : une météorite de plus, un point, et le minuteur accélère (jusqu\'à une toutes les 0,2 seconde).'),
              bloc('bs_creer_clone', 'c3'),
              ajouter('v_score', n(1)), score(),
              si(compare('GT', intervalle(), n(0.2)), [ecrire('c5', 'intervalle', calc('MINUS', intervalle(), n(0.01)))])
            ]),
            // La vie d'un clone : il apparaît en haut, tombe, et disparaît en bas.
            evt('bs_quand_clone', 'c3', [
              note('La vie d\'un clone : il apparaît en haut à un endroit au hasard, tombe un peu en biais et disparaît en bas. « 👉 moi » désigne ce clone-là.'),
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
            evtChamps('bs_quand_touche', { TOUCHE: 'gauche' }, [note('Les flèches déplacent le vaisseau ; « rebondir » le garde dans la fenêtre.'), ...bouger(-14)]),
            evtChamps('bs_quand_touche', { TOUCHE: 'droite' }, bouger(14)),
            evtChamps('bs_quand_souris_fenetre', { QUOI: 'bouge' }, [
              si(v('v_enJeu'), [ecrire('c2', 'x', calc('MINUS', { type: 'bs_souris_fenetre', fields: { QUOI: 'x' } }, n(24)))])
            ]),
            fonction('fin de partie', [
              note('« si enJeu » évite de finir deux fois quand deux météorites touchent le vaisseau en même temps.'),
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
      theme: 'jeux',
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
            presentation('Les fantômes sont des clones de Fantome (caché). Un fantôme attrapé devient un peu transparent : c\'est le signal, pour sa propre boucle, qu\'il doit s\'arrêter.'),
            evt('bs_quand_demarre', null, [fixer('v_enJeu', vrai(false))]),
            evtChamps('bs_quand_touche', { TOUCHE: 'espace' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            evtChamps('bs_quand_souris_fenetre', { QUOI: 'clic' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            fonction('nouvelle partie', [
              note('Tout remettre à zéro, puis démarrer le minuteur et la musique.'),
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
              note('Un fantôme de plus, et le prochain arrivera un peu plus vite.'),
              bloc('bs_creer_clone', 'c3'),
              si(compare('GT', intervalle(), n(0.45)), [ecrire('c5', 'intervalle', calc('MINUS', intervalle(), n(0.03)))])
            ]),
            // La vie d'un fantôme : il apparaît tout petit, en fondu, puis grossit…
            evt('bs_quand_clone', 'c3', [
              note('Il apparaît petit et en fondu, puis grossit tant que la partie continue, qu\'il n\'est pas attrapé et qu\'il fait moins de 160 %.'),
              bloc('bs_placer', '__moi', { X: hasard(20, 396), Y: hasard(50, 276) }), // il reste dans la fenêtre même à 160 %
              bloc('bs_sprite_taille', '__moi', { VAL: n(40) }),
              fondu('apparaitre', 0.5),
              tantQue(et(v('v_enJeu'), et(libre(), compare('LT', lire('taille', '__moi'), n(160)))), [
                bloc('bs_sprite_grandir', '__moi', { VAL: calc('ADD', n(0.8), calc('DIVIDE', v('v_score'), n(25))) }),
                attendre(0.05)
              ]),
              // … et s'il devient trop gros sans avoir été attrapé, il s'échappe.
              note('Trop gros sans avoir été attrapé : il s\'échappe, une vie de moins.'),
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
              note('Un clic sur un fantôme : attrapé ! Il devient transparent à 10 %, ce qui arrête sa boucle.'),
              si(et(v('v_enJeu'), libre()), [
                bloc('bs_sprite_transparence', '__moi', { VAL: n(10) }),
                bloc('bs_son', null, null, { SON: 'piece' }),
                ajouter('v_score', n(1)), score(),
                fondu('disparaitre', 0.25),
                bloc('bs_supprimer_clone')
              ])
            ]),
            fonction('fin de partie', [
              note('Le record est gardé en mémoire d\'une fois sur l\'autre.'),
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
      titre: '🧱 Casse-briques',
      theme: 'jeux',
      description: 'Casse toutes les briques avec la balle ! Rebond « en visant » sur la raquette : touche-la près du bout pour envoyer la balle en biais.',
      creer: () => {
        // c1 Score · c2 Vies · c3 Raquette · c4 Balle · c5 Brique (cachée : ce sont ses clones qui forment le mur)
        // c6 Consigne
        const score = () => ecrire('c1', 'texte', joindre(t('Score : '), v('v_score')));
        const vies = () => ecrire('c2', 'texte', joindre(t('Vies : '), v('v_vies')));
        const record = () => bloc('bs_nombre', null, { VAL: bloc('bs_memoire', null, { NOM: t('record casse-briques') }) });
        const rebond = (qui, sur, mode) => ({ type: 'bs_rebondir_sur', fields: { CTRL: qui, CTRL2: sur, MODE: mode } });
        const bouger = dx => [
          si(v('v_enJeu'), [
            bloc('bs_deplacer', 'c3', { DX: n(dx), DY: n(0) }),
            bloc('bs_rebondir', 'c3') // garde la raquette dans la fenêtre
          ])
        ];
        const finir = (texte, son) => [
          fixer('v_enJeu', vrai(false)),
          ecrire('c4', 'visible', vrai(false)),
          bloc('bs_son', null, null, { SON: son }),
          si(compare('GT', v('v_score'), record()), [
            bloc('bs_memoriser', null, { VAL: v('v_score'), NOM: t('record casse-briques') })
          ]),
          ecrire('c6', 'texte', joindre(t(texte), v('v_score'), retourLigne(),
            t('Record : '), record(), retourLigne(), retourLigne(), t('Clique (ou Espace) pour rejouer.'))),
          ecrire('c6', 'visible', vrai(true))
        ];
        const p = projet(
          { titre: 'Casse-briques', largeur: 480, hauteur: 360, couleurFond: '#0f172a' },
          [
            { type: 'etiquette', nom: 'Score', texte: 'Score : 0', x: 12, y: 6, largeur: 200, hauteur: 28, taillePolice: 18, couleurTexte: '#fde68a' },
            { type: 'etiquette', nom: 'Vies', texte: 'Vies : 3', x: 370, y: 6, largeur: 100, hauteur: 28, taillePolice: 18, couleurTexte: '#f9a8d4' },
            { type: 'sprite', nom: 'Raquette', sprite: 'spr_raquette', costume: 0, x: 192, y: 290, largeur: 96, hauteur: 96 },
            { type: 'sprite', nom: 'Balle', sprite: 'spr_balle', costume: 0, visible: false, x: 224, y: 300, largeur: 32, hauteur: 32 },
            { type: 'sprite', nom: 'Brique', sprite: 'spr_brique', costume: 0, visible: false, x: 20, y: 35, largeur: 48, hauteur: 48 },
            {
              type: 'etiquette', nom: 'Consigne', x: 40, y: 150, largeur: 400, hauteur: 130, taillePolice: 18, couleurTexte: '#e0e7ff',
              texte: 'Casse toutes les briques !\n\nSouris ou flèches ← → pour la raquette.\nTouche-la près du bout pour viser.\nClique (ou appuie sur Espace) pour commencer.'
            }
          ],
          ['score', 'vies', 'enJeu', 'briques', 'vitesse', 'ligne', 'colonne'],
          () => [
            presentation('Le mur est fait de clones de Brique. Chaque brique surveille elle-même la balle : touchée, elle la fait rebondir et disparaît. La balle, elle, ne s\'occupe que des bords et de la raquette.'),
            evt('bs_quand_demarre', null, [fixer('v_enJeu', vrai(false))]),
            evtChamps('bs_quand_touche', { TOUCHE: 'espace' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            evtChamps('bs_quand_souris_fenetre', { QUOI: 'clic' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            fonction('nouvelle partie', [
              bloc('bs_supprimer_clones', 'c5'),
              fixer('v_score', n(0)), fixer('v_vies', n(3)), fixer('v_briques', n(0)), fixer('v_enJeu', vrai(true)),
              score(), vies(),
              ecrire('c6', 'visible', vrai(false)),
              // Le mur : 5 rangées de 8 briques. On place l'original (caché), puis on le clone.
              note('Le mur : 5 rangées de 8 briques. On place l\'original (caché), on lui met le costume de sa rangée (5 couleurs), puis on le clone.'),
              pour('v_ligne', 1, 5, [
                pour('v_colonne', 1, 8, [
                  bloc('bs_placer', 'c5', {
                    X: calc('ADD', n(20), calc('MULTIPLY', calc('MINUS', v('v_colonne'), n(1)), n(56))),
                    Y: calc('ADD', n(35), calc('MULTIPLY', calc('MINUS', v('v_ligne'), n(1)), n(24)))
                  }),
                  bloc('bs_sprite_costume', 'c5', { VAL: v('v_ligne') }),
                  bloc('bs_creer_clone', 'c5'),
                  ajouter('v_briques', n(1))
                ])
              ]),
              appeler('servir'),
              // La balle avance ; si elle passe sous la raquette, une vie est perdue.
              note('La boucle du jeu : la balle avance. Sous la raquette, une vie est perdue ; sinon, elle rebondit sur les bords, et sur la raquette « en visant ».'),
              tantQue(v('v_enJeu'), [
                bloc('bs_avancer', 'c4', { PAS: v('v_vitesse') }),
                si(compare('GT', lire('y', 'c4'), n(322)), [appeler('balle perdue')], [
                  bloc('bs_rebondir', 'c4'),
                  rebond('c4', 'c3', 'viser')
                ]),
                attendre(0.02)
              ])
            ]),
            fonction('servir', [
              note('La balle repart du milieu de la raquette, vers le haut, un peu au hasard.'),
              bloc('bs_placer', 'c4', { X: calc('ADD', lire('x', 'c3'), n(32)), Y: n(300) }),
              bloc('bs_orienter', 'c4', { DIR: hasard(-40, 40) }),
              fixer('v_vitesse', n(5)),
              ecrire('c4', 'visible', vrai(true)),
              attendre(0.6)
            ]),
            fonction('balle perdue', [
              ajouter('v_vies', n(-1)), vies(),
              si(compare('LTE', v('v_vies'), n(0)), finir('Perdu ! Score : ', 'erreur'), [
                bloc('bs_son', null, null, { SON: 'erreur' }),
                appeler('servir')
              ])
            ]),
            // Chaque brique surveille la balle : touchée, elle la renvoie et disparaît.
            evt('bs_quand_clone', 'c5', [
              note('Chaque brique : touchée par la balle, elle la renvoie (« si Balle touche 👉 moi, rebondir »), compte les points, puis se supprime.'),
              ecrire('__moi', 'visible', vrai(true)),
              tantQue(v('v_enJeu'), [
                si({ type: 'bs_se_touchent', fields: { CTRL: '__moi', CTRL2: 'c4' } }, [
                  rebond('c4', '__moi', 'normal'),
                  bloc('bs_son', null, null, { SON: 'clic' }),
                  ajouter('v_score', n(10)), score(),
                  ajouter('v_vitesse', n(0.1)),
                  ajouter('v_briques', n(-1)),
                  si(compare('EQ', v('v_briques'), n(0)), finir('Bravo, toutes les briques sont cassées ! Score : ', 'succes')),
                  bloc('bs_supprimer_clone')
                ]),
                attendre(0.02)
              ])
            ]),
            evtChamps('bs_quand_touche', { TOUCHE: 'gauche' }, bouger(-20)),
            evtChamps('bs_quand_touche', { TOUCHE: 'droite' }, bouger(20)),
            evtChamps('bs_quand_souris_fenetre', { QUOI: 'bouge' }, [
              note('La raquette suit la souris ; « rebondir » la garde dans la fenêtre.'),
              si(v('v_enJeu'), [
                ecrire('c3', 'x', calc('MINUS', { type: 'bs_souris_fenetre', fields: { QUOI: 'x' } }, n(48))),
                bloc('bs_rebondir', 'c3')
              ])
            ])
          ]);
        p.sprites = [spriteRaquette(), spriteBalle(), spriteBrique()];
        return p;
      }
    },
    {
      titre: '🍄 Plateformes',
      theme: 'jeux',
      description: 'Cours, saute de plateforme en plateforme et ramasse les pièces, sans tomber dans le trou ni toucher le fantôme. Gravité, saut, score, vies… et ça se joue aussi à la manette !',
      creer: () => {
        // c1 Score · c2 Vies · c3 Héros · c4-c5 le sol (avec un trou au milieu) · c6-c9 plateformes
        // c10 Pièce · c11 Fantôme · c12 Consigne
        const touche = k => ({ type: 'bs_touche_enfoncee', fields: { TOUCHE: k } });
        const auSol = () => bloc('bs_au_sol', 'c3');
        const pieces = () => bloc('bs_compteur_valeur', 'c1');
        const record = () => bloc('bs_nombre', null, { VAL: bloc('bs_memoire', null, { NOM: t('record plateformes') }) });
        const vies = () => ecrire('c2', 'texte', bloc('bs_texte_repete', null, { VAL: t('❤️'), FOIS: v('v_vies') }));
        const choix = (...nombres) => ({
          type: 'lists_getIndex', fields: { MODE: 'GET', WHERE: 'FROM_START' },
          inputs: { VALUE: I(liste(...nombres.map(n))), AT: I(v('v_place')) }
        });
        const solide = (nom, x, y, l, h, genre, fond, trait) =>
          ({ type: 'forme', nom, genre, x, y, largeur: l, hauteur: h, couleurFond: fond, couleurBordure: trait, epaisseur: 2, solide: true });
        const p = projet(
          { titre: 'Plateformes', largeur: 480, hauteur: 360, couleurFond: '#7dd3fc' },
          [
            { type: 'etiquette', nom: 'Score', texte: 'Pièces : 0', x: 12, y: 6, largeur: 200, hauteur: 28, taillePolice: 18, gras: true, couleurTexte: '#713f12' },
            { type: 'etiquette', nom: 'Vies', texte: '❤️❤️❤️', x: 360, y: 6, largeur: 110, hauteur: 28, taillePolice: 18, alignement: 'droite' },
            { type: 'sprite', nom: 'Héros', sprite: 'spr_heros', costume: 0, x: 48, y: 60, largeur: 40, hauteur: 40 },
            solide('SolGauche', 0, 320, 200, 40, 'rectangle', '#22c55e', '#14532d'),
            solide('SolDroit', 280, 320, 200, 40, 'rectangle', '#22c55e', '#14532d'),
            solide('Plateforme1', 60, 245, 110, 16, 'arrondi', '#d97706', '#78350f'),
            solide('Plateforme2', 200, 180, 100, 16, 'arrondi', '#d97706', '#78350f'),
            solide('Plateforme3', 330, 115, 110, 16, 'arrondi', '#d97706', '#78350f'),
            solide('Plateforme4', 30, 110, 90, 16, 'arrondi', '#d97706', '#78350f'),
            { type: 'sprite', nom: 'Pièce', sprite: 'spr_piece', costume: 0, x: 101, y: 211, largeur: 28, hauteur: 28 },
            { type: 'sprite', nom: 'Fantôme', sprite: 'spr_fantome', costume: 0, x: 300, y: 284, largeur: 36, hauteur: 36, transparence: 20 },
            {
              type: 'etiquette', nom: 'Consigne', x: 50, y: 120, largeur: 380, hauteur: 160, taillePolice: 16, couleurTexte: '#ffffff',
              couleurFond: '#1e3a8a', alignement: 'centre',
              texte: 'Ramasse un maximum de pièces !\n\n← → pour courir, Espace ou ↑ pour sauter.\nAttention au fantôme et au trou !\n' +
                'À la manette : la croix et le bouton A.\n\nEspace, Entrée ou clic pour commencer.'
            }
          ],
          ['vies', 'enJeu', 'place'],
          () => [
            presentation('Le sol et les plateformes sont des formes « solides » (case cochée dans leurs propriétés). Le héros tombe avec « faire tomber … avec une gravité » : il se pose sur ce qui est solide. « faire sauter » ne marche que s\'il est posé.'),
            evt('bs_quand_demarre', null, [
              fixer('v_enJeu', vrai(false)),
              bloc('bs_sprite_animer', 'c10', null, { MODE: 'boucle' }),
              bloc('bs_sprite_animer', 'c11', null, { MODE: 'boucle' }),
              note('Le fantôme fait des allers-retours d\'un bord à l\'autre de la fenêtre (il vole au-dessus du trou).'),
              bloc('bs_orienter', 'c11', { DIR: n(90) }),
              toujours([
                si(v('v_enJeu'), [bloc('bs_avancer', 'c11', { PAS: n(2) }), bloc('bs_rebondir', 'c11')]),
                attendre(0.02)
              ])
            ]),
            evtChamps('bs_quand_touche', { TOUCHE: 'espace' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            evtChamps('bs_quand_touche', { TOUCHE: 'entree' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            evtChamps('bs_quand_souris_fenetre', { QUOI: 'clic' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            evtChamps('bs_quand_manette', { BOUTON: 'start' }, [si(non(v('v_enJeu')), [appeler('nouvelle partie')])]),
            fonction('nouvelle partie', [
              note('« ajouter … au nombre de Score » change le nombre écrit dans l\'étiquette : « Pièces : 0 » devient « Pièces : 1 ».'),
              ecrire('c1', 'texte', t('Pièces : 0')),
              fixer('v_vies', n(3)), vies(),
              ecrire('c12', 'visible', vrai(false)),
              bloc('bs_placer', 'c11', { X: n(300), Y: n(284) }),
              appeler('remettre le héros'),
              appeler('placer la pièce'),
              fixer('v_enJeu', vrai(true)),
              note('La boucle du jeu : courir, sauter, tomber (gravité), puis regarder ce que le héros touche.'),
              tantQue(v('v_enJeu'), [
                si(touche('gauche'), [
                  bloc('bs_deplacer', 'c3', { DX: n(-4), DY: n(0) }),
                  bloc('bs_sprite_regarder', 'c3', null, { SENS: 'gauche' })
                ]),
                si(touche('droite'), [
                  bloc('bs_deplacer', 'c3', { DX: n(4), DY: n(0) }),
                  bloc('bs_sprite_regarder', 'c3', null, { SENS: 'droite' })
                ]),
                si(et(ou(touche('espace'), touche('haut')), auSol()), [
                  bloc('bs_son', null, null, { SON: 'saut' }),
                  bloc('bs_sauter', 'c3', { FORCE: n(13) })
                ]),
                bloc('bs_gravite', 'c3', { FORCE: n(1) }, { FOND: 'vide' }),
                ecrire('c3', 'x', { type: 'math_constrain', inputs: { VALUE: I(lire('x', 'c3')), LOW: I(n(0)), HIGH: I(n(440)) } }),
                note('Le costume : « saut » en l\'air ; au sol, les deux costumes de marche alternent selon sa position.'),
                si(non(auSol()), [bloc('bs_sprite_costume', 'c3', { VAL: n(3) })], [
                  bloc('bs_sprite_costume', 'c3', {
                    VAL: calc('ADD', { type: 'math_modulo', inputs: {
                      DIVIDEND: I({ type: 'math_round', fields: { OP: 'ROUND' }, inputs: { NUM: I(calc('DIVIDE', lire('x', 'c3'), n(12))) } }),
                      DIVISOR: I(n(2)) } }, n(1))
                  })
                ]),
                si(compare('GT', lire('y', 'c3'), n(360)), [appeler('perdre une vie')]),
                si({ type: 'bs_se_touchent', fields: { CTRL: 'c3', CTRL2: 'c11' } }, [appeler('perdre une vie')]),
                si({ type: 'bs_se_touchent', fields: { CTRL: 'c3', CTRL2: 'c10' } }, [
                  bloc('bs_son', null, null, { SON: 'piece' }),
                  bloc('bs_compteur_ajouter', 'c1', { VAL: n(1) }),
                  appeler('placer la pièce')
                ]),
                attendre(0.02)
              ])
            ]),
            fonction('remettre le héros', [
              note('Il repart en haut à gauche, sur la plateforme la plus haute, loin du fantôme.'),
              bloc('bs_placer', 'c3', { X: n(48), Y: n(60) }),
              ecrire('c3', 'vitesseY', n(0))
            ]),
            fonction('placer la pièce', [
              note('Une des 6 places, au hasard : au-dessus d\'une plateforme ou du sol.'),
              fixer('v_place', hasard(1, 6)),
              bloc('bs_placer', 'c10', { X: choix(101, 236, 371, 61, 86, 366), Y: choix(211, 146, 81, 76, 286, 286) })
            ]),
            fonction('perdre une vie', [
              ajouter('v_vies', n(-1)), vies(),
              bloc('bs_son', null, null, { SON: 'erreur' }),
              si(compare('LTE', v('v_vies'), n(0)), [
                fixer('v_enJeu', vrai(false)),
                si(compare('GT', pieces(), record()), [
                  bloc('bs_memoriser', null, { VAL: pieces(), NOM: t('record plateformes') })
                ]),
                ecrire('c12', 'texte', joindre(t('Perdu ! Pièces ramassées : '), pieces(), retourLigne(),
                  t('Record : '), record(), retourLigne(), retourLigne(), t('Espace, Entrée ou clic pour rejouer.'))),
                ecrire('c12', 'visible', vrai(true))
              ], [
                appeler('remettre le héros'),
                attendre(0.5)
              ])
            ])
          ]);
        p.sprites = [spriteHeros(), spritePiece(), spriteFantome()];
        return p;
      }
    },
    {
      titre: '🪟 Plusieurs fenêtres',
      theme: 'debut',
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
            presentation('Trois fenêtres : la principale, Parametres et APropos. « ouvrir … et attendre » met le programme en pause jusqu\'à la fermeture : idéal pour une boîte OK / Annuler.'),
            // La fenêtre de réglages bloque le reste du programme : les blocs qui suivent
            // attendent qu'on l'ait fermée, puis lisent ce qu'on y a saisi.
            evt('bs_quand_clic', 'c2', [
              note('La variable valide dira si on a fermé avec OK (vrai) ou avec Annuler (faux).'),
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
            evt('bs_quand_clic', 'c8', [note('OK : on retient que les réglages sont validés, puis on ferme.'), fixer('v_valide', vrai(true)), fermer('f2')]),
            evt('bs_quand_clic', 'c9', [fermer('f2')]),
            evtChamps('bs_quand_fenetre', { FENETRE: 'f2', QUOI: 'ouverture' }, [
              bloc('bs_fenetre_titre', null, { VAL: t('Réglages') }, { FENETRE: 'f2' })
            ]),
            evtMenu('Aide › À propos', [note('« ouvrir » sans attendre : la fenêtre À propos ne bloque rien.'), ouvrir('f3', false)]),
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
