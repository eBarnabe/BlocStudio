// Export en application Android (.apk), sans aucun outil à installer : voir lanceur/android/LISEZMOI.md.
// Le lanceur (js/lanceur-android-data.js, chargé au premier export) est un .apk sans programme ni signature.
// On y ajoute la page du programme, ses réglages et son icône, on change le nom du paquet et le nom de
// l'application dans son manifeste, puis on signe le tout (signature « v2 » d'Android, en JavaScript)
// avec la clé de BlocStudio, créée au premier export et gardée dans le navigateur.
const BlocAndroid = (function () {
  'use strict';

  // Ce que le manifeste du lanceur contient, et que l'export remplace.
  const PAQUET_LANCEUR = 'fr.blocstudio.lanceur';
  const NOM_LANCEUR = 'BlocStudio Lanceur';
  const CLE_STOCKAGE = 'blocstudio.cleAndroid';

  const texte = s => new TextEncoder().encode(s);
  function concat(morceaux) {
    const r = new Uint8Array(morceaux.reduce((n, m) => n + m.length, 0));
    let p = 0;
    for (const m of morceaux) { r.set(m, p); p += m.length; }
    return r;
  }
  const u32 = n => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; };
  const u64 = n => { const b = new Uint8Array(8); new DataView(b.buffer).setUint32(0, n, true); return b; };
  const avecLongueur = b => concat([u32(b.length), b]); // « length-prefixed » des formats Android
  const base64 = octets => { let s = ''; for (let i = 0; i < octets.length; i += 0x8000) s += String.fromCharCode(...octets.subarray(i, i + 0x8000)); return btoa(s); };
  const depuisBase64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const flux = (octets, transformation) => new Response(new Blob([octets]).stream().pipeThrough(transformation)).arrayBuffer().then(b => new Uint8Array(b));

  // ---- Le lanceur ----
  function chargerLanceur() {
    if (window.BlocStudioLanceurAndroid) return Promise.resolve(depuisBase64(window.BlocStudioLanceurAndroid));
    return new Promise((resoudre, rejeter) => {
      const s = document.createElement('script');
      s.src = 'js/lanceur-android-data.js';
      s.onload = () => resoudre(depuisBase64(window.BlocStudioLanceurAndroid));
      s.onerror = () => rejeter(new Error(T('Fichier js/lanceur-android-data.js introuvable.')));
      document.head.appendChild(s);
    });
  }

  // ---- Zip ----
  // Les fichiers d'un zip, tels quels (encore compressés) : [{ nom, methode, crc, taille, donnees }].
  function lireZip(octets) {
    const v = new DataView(octets.buffer, octets.byteOffset, octets.byteLength);
    let fin = octets.length - 22;
    while (fin >= 0 && v.getUint32(fin, true) !== 0x06054b50) fin--;
    if (fin < 0) throw new Error('lanceur Android abîmé');
    const fichiers = [];
    let p = v.getUint32(fin + 16, true);
    for (let i = v.getUint16(fin + 10, true); i > 0; i--) {
      const lNom = v.getUint16(p + 28, true), local = v.getUint32(p + 42, true);
      const debut = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
      fichiers.push({
        nom: new TextDecoder().decode(octets.subarray(p + 46, p + 46 + lNom)),
        methode: v.getUint16(p + 10, true), crc: v.getUint32(p + 16, true), taille: v.getUint32(p + 24, true),
        donnees: octets.subarray(debut, debut + v.getUint32(p + 20, true))
      });
      p += 46 + lNom + v.getUint16(p + 30, true) + v.getUint16(p + 32, true);
    }
    return fichiers;
  }

  const contenu = f => f.methode === 0 ? Promise.resolve(f.donnees) : flux(f.donnees, new DecompressionStream('deflate-raw'));

  async function nouveauFichier(nom, octets, compresser) {
    return {
      nom, crc: BlocRuntime.crc32(octets), taille: octets.length,
      methode: compresser ? 8 : 0, donnees: compresser ? await flux(octets, new CompressionStream('deflate-raw')) : octets
    };
  }

  // Le zip, avec les fichiers non compressés alignés sur 4 octets (comme « zipalign » : Android les lit
  // directement dans le fichier). Renvoie ses trois parties, que la signature v2 sépare.
  function ecrireZip(fichiers) {
    const morceaux = [], central = [];
    let position = 0;
    for (const f of fichiers) {
      const nom = texte(f.nom);
      const avant = position + 30 + nom.length;
      const bourrage = f.methode === 0 ? (4 - avant % 4) % 4 : 0;
      const entete = (taille, d) => {
        const e = new DataView(new ArrayBuffer(taille));
        e.setUint16(d + 4, 20, true);              // version nécessaire
        e.setUint16(d + 8, f.methode, true);
        e.setUint16(d + 12, 0x21, true);           // date : 1er janvier 1980
        e.setUint32(d + 14, f.crc, true);
        e.setUint32(d + 18, f.donnees.length, true);
        e.setUint32(d + 22, f.taille, true);
        e.setUint16(d + 26, nom.length, true);
        return e;
      };
      const local = entete(30, 0);
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(28, bourrage, true);
      const c = entete(46, 2);
      c.setUint32(0, 0x02014b50, true);
      c.setUint16(4, 20, true);
      c.setUint32(42, position, true);
      morceaux.push(new Uint8Array(local.buffer), nom, new Uint8Array(bourrage), f.donnees);
      central.push(new Uint8Array(c.buffer), nom);
      position = avant + bourrage + f.donnees.length;
    }
    const repertoire = concat(central);
    const fin = new DataView(new ArrayBuffer(22));
    fin.setUint32(0, 0x06054b50, true);
    fin.setUint16(8, fichiers.length, true);
    fin.setUint16(10, fichiers.length, true);
    fin.setUint32(12, repertoire.length, true);
    fin.setUint32(16, position, true);
    return { fichiers: concat(morceaux), repertoire, fin: new Uint8Array(fin.buffer) };
  }

  // ---- Manifeste (XML binaire d'Android) ----
  // Seules ses chaînes de caractères changent : on réécrit sa « string pool », le reste est recopié.
  function remplacerChaines(manifeste, remplacements) {
    const v = new DataView(manifeste.buffer, manifeste.byteOffset, manifeste.byteLength);
    const p = v.getUint16(2, true); // la pool suit l'en-tête du fichier
    if (v.getUint16(p, true) !== 0x0001) throw new Error('manifeste du lanceur illisible');
    const tailleEntete = v.getUint16(p + 2, true), tailleChunk = v.getUint32(p + 4, true);
    const nb = v.getUint32(p + 8, true), nbStyles = v.getUint32(p + 12, true), drapeaux = v.getUint32(p + 16, true);
    const debutChaines = p + v.getUint32(p + 20, true), debutStyles = v.getUint32(p + 24, true);
    const utf8 = (drapeaux & 0x100) !== 0;
    const chaines = [];
    for (let i = 0; i < nb; i++) {
      let q = debutChaines + v.getUint32(p + tailleEntete + i * 4, true);
      if (utf8) {
        q += v.getUint8(q) & 0x80 ? 2 : 1; // longueur en UTF-16, puis en octets
        let n = v.getUint8(q);
        if (n & 0x80) { n = ((n & 0x7f) << 8) | v.getUint8(q + 1); q += 2; } else q += 1;
        chaines.push(new TextDecoder().decode(manifeste.subarray(q, q + n)));
      } else {
        let n = v.getUint16(q, true);
        if (n & 0x8000) { n = ((n & 0x7fff) << 16) | v.getUint16(q + 2, true); q += 4; } else q += 2;
        chaines.push(String.fromCharCode(...new Uint16Array(manifeste.slice(q, q + n * 2).buffer)));
      }
    }
    const longueur = (n, deuxOctets) => deuxOctets
      ? (n > 0x7fff ? [((n >> 16) | 0x8000) & 0xff, (n >> 24) | 0x80, n & 0xff, (n >> 8) & 0xff] : [n & 0xff, n >> 8])
      : (n > 0x7f ? [(n >> 8) | 0x80, n & 0xff] : [n]);
    const codees = chaines.map(s => remplacements[s] ?? s).map(s => {
      if (utf8) {
        const b = texte(s);
        return concat([new Uint8Array(longueur(s.length, false)), new Uint8Array(longueur(b.length, false)), b, new Uint8Array(1)]);
      }
      const b = new Uint8Array(s.length * 2 + 2);
      for (let i = 0; i < s.length; i++) { b[i * 2] = s.charCodeAt(i) & 0xff; b[i * 2 + 1] = s.charCodeAt(i) >> 8; }
      return concat([new Uint8Array(longueur(s.length, true)), b]);
    });
    const offsets = new Uint8Array(nb * 4), ov = new DataView(offsets.buffer);
    let o = 0;
    codees.forEach((c, i) => { ov.setUint32(i * 4, o, true); o += c.length; });
    let donnees = concat(codees);
    donnees = concat([donnees, new Uint8Array((4 - donnees.length % 4) % 4)]);
    const styles = nbStyles ? manifeste.subarray(p + debutStyles, p + tailleChunk) : new Uint8Array(0);
    const offsetsStyles = manifeste.subarray(p + tailleEntete + nb * 4, p + tailleEntete + nb * 4 + nbStyles * 4);
    const entete = manifeste.slice(p, p + tailleEntete), ev = new DataView(entete.buffer);
    const debut = tailleEntete + offsets.length + offsetsStyles.length;
    ev.setUint32(4, debut + donnees.length + styles.length, true);
    ev.setUint32(20, debut, true);
    ev.setUint32(24, nbStyles ? debut + donnees.length : 0, true);
    const pool = concat([entete, offsets, offsetsStyles, donnees, styles]);
    const resultat = concat([manifeste.subarray(0, p), pool, manifeste.subarray(p + tailleChunk)]);
    new DataView(resultat.buffer).setUint32(4, resultat.length, true);
    return resultat;
  }

  // ---- Clé et certificat ----
  // Une clé RSA créée une fois et gardée : une nouvelle version d'une application signée avec la même clé
  // s'installe par-dessus l'ancienne (sans perdre ses données). Le certificat est fabriqué ici (X.509, DER).
  const der = (etiquette, ...contenus) => {
    const c = concat(contenus), n = c.length;
    const l = n < 0x80 ? [n] : n < 0x100 ? [0x81, n] : n < 0x10000 ? [0x82, n >> 8, n & 0xff] : [0x83, n >> 16, (n >> 8) & 0xff, n & 0xff];
    return concat([new Uint8Array([etiquette, ...l]), c]);
  };
  const SHA256_RSA = der(0x30, der(0x06, new Uint8Array([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b])), der(0x05));
  const ALGO = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };

  async function creerCle() {
    const paire = await crypto.subtle.generateKey(Object.assign({ modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) }, ALGO), true, ['sign', 'verify']);
    const publique = new Uint8Array(await crypto.subtle.exportKey('spki', paire.publicKey));
    const nom = der(0x30, der(0x31, der(0x30, der(0x06, new Uint8Array([0x55, 0x04, 0x03])), der(0x0c, texte('BlocStudio')))));
    const date = (d, longue) => {
      const s = d.toISOString().replace(/[-:T]/g, '').slice(0, 14) + 'Z';
      return longue ? der(0x18, texte(s)) : der(0x17, texte(s.slice(2)));
    };
    const maintenant = new Date(), fin = new Date(maintenant);
    fin.setUTCFullYear(fin.getUTCFullYear() + 100);
    const serie = crypto.getRandomValues(new Uint8Array(8));
    serie[0] = (serie[0] & 0x7f) | 0x01;
    const tbs = der(0x30, der(0xa0, der(0x02, new Uint8Array([2]))), der(0x02, serie), SHA256_RSA, nom,
      der(0x30, date(maintenant, false), date(fin, true)), nom, publique);
    const signature = new Uint8Array(await crypto.subtle.sign(ALGO, paire.privateKey, tbs));
    const certificat = der(0x30, tbs, SHA256_RSA, der(0x03, new Uint8Array([0]), signature));
    const privee = new Uint8Array(await crypto.subtle.exportKey('pkcs8', paire.privateKey));
    return { privee: base64(privee), publique: base64(publique), certificat: base64(certificat) };
  }

  // La clé gardée (créée au premier export). `nouvelle` : vrai si elle vient d'être créée.
  async function cleDeSignature() {
    let cle = null, nouvelle = false;
    try { cle = JSON.parse(localStorage.getItem(CLE_STOCKAGE)); } catch (e) { /* stockage interdit */ }
    if (!cle || !cle.privee || !cle.certificat || !cle.publique) {
      cle = await creerCle();
      nouvelle = true;
      try { localStorage.setItem(CLE_STOCKAGE, JSON.stringify(cle)); } catch (e) { /* elle ne servira qu'une fois */ }
    }
    return {
      nouvelle,
      privee: await crypto.subtle.importKey('pkcs8', depuisBase64(cle.privee), ALGO, false, ['sign']),
      publique: depuisBase64(cle.publique), certificat: depuisBase64(cle.certificat)
    };
  }

  // ---- Sauvegarde de la clé ----
  // Sans la même clé, une nouvelle version d'une application ne s'installe pas par-dessus l'ancienne : on la
  // garde dans un fichier, pour la retrouver dans un autre navigateur, sur un autre ordinateur, ou après un nettoyage.
  const FORMAT_CLE = 'BlocStudio-cle-android';

  async function sauvegarderCle() {
    await cleDeSignature(); // la crée si aucun export n'a encore été fait
    let cle = null;
    try { cle = JSON.parse(localStorage.getItem(CLE_STOCKAGE)); } catch (e) { /* stockage interdit */ }
    if (!cle) throw new Error(T('Ce navigateur ne garde pas la clé (stockage bloqué).'));
    return JSON.stringify({ format: FORMAT_CLE, version: 1, privee: cle.privee, publique: cle.publique, certificat: cle.certificat }, null, 2);
  }

  // `remplacer()` est appelée (et doit renvoyer vrai) avant de remplacer une autre clé.
  // Renvoie 'identique', 'restauree' ou 'annulee'.
  async function restaurerCle(contenuFichier, remplacer) {
    let cle = null;
    try { cle = JSON.parse(contenuFichier); } catch (e) { /* pas du JSON */ }
    const invalide = () => new Error(T('Ce fichier n\'est pas une clé Android de BlocStudio.'));
    if (!cle || cle.format !== FORMAT_CLE || !cle.privee || !cle.publique || !cle.certificat) throw invalide();
    // La clé privée doit aller avec la clé publique du certificat : on signe un essai, puis on le vérifie.
    try {
      const privee = await crypto.subtle.importKey('pkcs8', depuisBase64(cle.privee), ALGO, false, ['sign']);
      const publique = await crypto.subtle.importKey('spki', depuisBase64(cle.publique), ALGO, false, ['verify']);
      const essai = texte('BlocStudio');
      if (!await crypto.subtle.verify(ALGO, publique, await crypto.subtle.sign(ALGO, privee, essai), essai)) throw invalide();
    } catch (e) { throw invalide(); }
    let actuelle = null;
    try { actuelle = JSON.parse(localStorage.getItem(CLE_STOCKAGE)); } catch (e) { /* aucune */ }
    if (actuelle && actuelle.certificat === cle.certificat) return 'identique';
    if (actuelle && actuelle.certificat && !remplacer()) return 'annulee';
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify({ privee: cle.privee, publique: cle.publique, certificat: cle.certificat }));
    return 'restauree';
  }

  // ---- Signature v2 (« APK Signature Scheme v2 ») ----
  // Empreinte SHA-256 du zip par morceaux de 1 Mo, signée, puis rangée dans un « APK Signing Block »
  // glissé entre les fichiers et le répertoire central du zip.
  async function signer(zip, cle) {
    const sha256 = async b => new Uint8Array(await crypto.subtle.digest('SHA-256', b));
    const fin = zip.fin.slice();
    new DataView(fin.buffer).setUint32(16, zip.fichiers.length, true); // le répertoire « commence » au bloc de signature
    const empreintes = [];
    for (const partie of [zip.fichiers, zip.repertoire, fin]) {
      for (let i = 0; i < partie.length; i += 1 << 20) {
        const morceau = partie.subarray(i, Math.min(partie.length, i + (1 << 20)));
        empreintes.push(await sha256(concat([new Uint8Array([0xa5]), u32(morceau.length), morceau])));
      }
    }
    const empreinte = await sha256(concat([new Uint8Array([0x5a]), u32(empreintes.length), ...empreintes]));
    const RSA_SHA256 = u32(0x0103);
    const donneesSignees = concat([
      avecLongueur(avecLongueur(concat([RSA_SHA256, avecLongueur(empreinte)]))),
      avecLongueur(avecLongueur(cle.certificat)),
      avecLongueur(new Uint8Array(0))
    ]);
    const signature = new Uint8Array(await crypto.subtle.sign(ALGO, cle.privee, donneesSignees));
    const signataire = concat([
      avecLongueur(donneesSignees),
      avecLongueur(avecLongueur(concat([RSA_SHA256, avecLongueur(signature)]))),
      avecLongueur(cle.publique)
    ]);
    const valeur = avecLongueur(avecLongueur(signataire));
    const paire = concat([u64(4 + valeur.length), u32(0x7109871a), valeur]);
    const taille = paire.length + 8 + 16;
    const bloc = concat([u64(taille), paire, u64(taille), texte('APK Sig Block 42')]);
    const finSignee = zip.fin.slice();
    new DataView(finSignee.buffer).setUint32(16, zip.fichiers.length + bloc.length, true);
    return concat([zip.fichiers, bloc, zip.repertoire, finSignee]);
  }

  // Un nom de paquet Android valide et propre au projet (il ne change pas quand on renomme le programme).
  const nomPaquet = id => 'fr.blocstudio.programme.p' + (String(id || '').toLowerCase().replace(/[^a-z0-9]/g, '') || 'sansnom');

  // L'application : { page (HTML), titre, id (du projet), reglages (objet), icone (PNG, 192×192) }.
  // Renvoie { apk: octets, nouvelleCle }.
  async function construire({ page, titre, id, reglages, icone }) {
    const lanceur = lireZip(await chargerLanceur());
    const cle = await cleDeSignature();
    const fichiers = [];
    for (const f of lanceur) {
      if (f.nom.startsWith('META-INF/')) continue;
      if (f.nom === 'AndroidManifest.xml') {
        const manifeste = remplacerChaines(await contenu(f), { [PAQUET_LANCEUR]: nomPaquet(id), [NOM_LANCEUR]: titre });
        fichiers.push(await nouveauFichier(f.nom, manifeste, true));
      } else if (/\/ic_launcher\.png$/.test(f.nom) && icone) {
        fichiers.push(await nouveauFichier(f.nom, icone, false));
      } else fichiers.push(f);
    }
    fichiers.push(await nouveauFichier('assets/programme.html', texte(page), true));
    fichiers.push(await nouveauFichier('assets/reglages.json', texte(JSON.stringify(reglages)), false));
    return { apk: await signer(ecrireZip(fichiers), cle), nouvelleCle: cle.nouvelle };
  }

  return { construire, nomPaquet, sauvegarderCle, restaurerCle };
})();
