// BlocStudio en plusieurs langues.
//
// Les textes du code restent écrits en français ; chacun passe par T() : T('Annuler') donne « Cancel » en anglais.
// La phrase française sert de clé, et un texte qui n'est pas encore traduit s'affiche simplement en français.
// Les traductions sont dans js/langues/<code>.js (BlocLangues.ajouter('en', { 'Annuler': 'Cancel', … })).
//
// Un texte avec des valeurs : T('« {nom} » n\'est pas une image.', { nom }) ; l'ordre des mots peut changer d'une
// langue à l'autre, les {…} suivent.
//
// Un mot qui se traduit de plusieurs façons reçoit un contexte : T('de', 'de combien') cherche d'abord
// « de ‹de combien› » dans le dictionnaire (« by » : tourner de 15 degrés), puis « de » (« of »).
//
// La langue est choisie dans l'éditeur (menu 🌐) et mémorisée ; par défaut, celle de l'ordinateur.
// Changer de langue recharge la page : les blocs, la boîte à outils et la page sont construits dans la langue choisie.
const BlocLangues = (function () {
  const LANGUES = { fr: 'Français', en: 'English' };
  const CLE = 'blocstudio.langue';
  const dictionnaires = {};

  function langueChoisie() {
    let l = null;
    try { l = localStorage.getItem(CLE); } catch (e) { /* stockage interdit */ }
    if (LANGUES[l]) return l;
    const systeme = String(navigator.language || 'fr').slice(0, 2).toLowerCase();
    return LANGUES[systeme] ? systeme : 'fr';
  }
  const langue = langueChoisie();
  document.documentElement.lang = langue;

  // Recopiée telle quelle dans les programmes exportés (voir pourExport).
  function traduire(dico, texte, valeurs) {
    const trouve = cle => dico && Object.prototype.hasOwnProperty.call(dico, cle) && dico[cle];
    let contexte = null;
    if (typeof valeurs === 'string') { contexte = valeurs; valeurs = null; }
    let t = (contexte && trouve(texte + ' ‹' + contexte + '›')) || trouve(texte) || texte;
    if (valeurs) t = t.replace(/\{(\w+)\}/g, (m, k) => Object.prototype.hasOwnProperty.call(valeurs, k) ? valeurs[k] : m);
    return t;
  }
  const T = (texte, valeurs) => traduire(dictionnaires[langue], texte, valeurs);

  function ajouter(code, traductions) {
    dictionnaires[code] = Object.assign(dictionnaires[code] || {}, traductions);
  }

  function changer(code) {
    if (!LANGUES[code] || code === langue) return;
    try { localStorage.setItem(CLE, code); } catch (e) { /* stockage interdit */ }
    location.reload();
  }

  // Les textes écrits directement dans la page (index.html) : chaque morceau de texte, et les attributs
  // title, placeholder, aria-label et alt, sont traduits s'ils figurent dans le dictionnaire.
  // Un texte écrit sur plusieurs lignes dans index.html est cherché avec ses espaces regroupés en un seul.
  function traduirePage(racine) {
    if (langue === 'fr') return;
    const marche = document.createTreeWalker(racine || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.parentNode && /^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const textes = [];
    while (marche.nextNode()) textes.push(marche.currentNode);
    for (const n of textes) {
      const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(n.nodeValue);
      if (!m[2]) continue;
      const cle = m[2].replace(/\s+/g, ' ');
      const t = T(cle);
      if (t !== cle) n.nodeValue = m[1] + t + m[3];
    }
    for (const e of (racine || document.body).querySelectorAll('[title], [placeholder], [aria-label], [alt]')) {
      for (const a of ['title', 'placeholder', 'aria-label', 'alt']) {
        if (e.hasAttribute(a)) e.setAttribute(a, T(e.getAttribute(a)));
      }
    }
    document.title = T(document.title);
  }

  // Chargé pendant la lecture de la page : le fichier de langue de Blockly, puis celui de BlocStudio.
  function ecrireScripts() {
    document.write(`<script src="lib/blockly/msg/${langue}.js"><\/script>`);
    if (langue !== 'fr') document.write(`<script src="js/langues/${langue}.js"><\/script>`);
  }

  // Les conventions de la langue pour les nombres et les dates (« 1 234,5 » en français, « 1,234.5 » en anglais).
  const LOCALES = { fr: 'fr-FR', en: 'en-US' };
  const locale = () => LOCALES[langue] || 'fr-FR';
  // Un nombre écrit avec le séparateur décimal de la langue, sans séparer les milliers (« 0,5 » / « 0.5 »).
  const nombre = v => Number(v).toLocaleString(locale(), { useGrouping: false, maximumFractionDigits: 10 });

  // Le début du script d'un programme exporté : la langue de l'éditeur et T(), avec les seules traductions
  // dont se sert `source` : celles dont le texte y est écrit en entier entre '…' (l'apostrophe y est \',
  // le retour à la ligne \n), dans T('…') ou dans une liste traduite ensuite (['lundi', …].map(j => T(j))).
  function pourExport(source) {
    const dico = {};
    for (const [cle, t] of Object.entries(dictionnaires[langue] || {})) {
      const texte = cle.replace(/ ‹[^›]*›$/, '');
      const ecrit = texte.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\n/g, '\\n');
      if (source.includes('\'' + ecrit + '\'')) dico[cle] = t;
    }
    const json = v => JSON.stringify(v).replace(/</g, '\\u003c');
    return `const BlocLangues = (function () {
  ${traduire.toString()}
  const dico = ${json(dico)};
  return { T: (texte, valeurs) => traduire(dico, texte, valeurs), langue: () => ${json(langue)}, locale: () => ${json(locale())} };
})();
const T = BlocLangues.T;`;
  }

  return { LANGUES, T, ajouter, changer, traduirePage, ecrireScripts, langue: () => langue, locale, nombre, pourExport,
    dictionnaire: code => dictionnaires[code] || {} };
})();
const T = BlocLangues.T;
