// Sélecteur d'émojis de BlocStudio : une petite fenêtre avec des catégories, une recherche
// en français et les émojis récents. Utilisée dans les propriétés et dans les blocs.
//   SelecteurEmoji.ouvrir(ancre, surChoix) — ancre : un élément ou { x, y } (coordonnées écran).

(function () {
  // Chaque ligne : l'émoji puis des mots pour le retrouver (le premier sert de nom).
  const CATEGORIES = [
    ['Visages', '😀', `
😀 sourire content heureux joie
😃 rire content heureux
😄 rire yeux content
😁 grand sourire dents
😆 mort de rire
😅 rire gêné sueur
🤣 pleurer de rire mdr
😂 larmes de joie mdr
🙂 sourire léger
🙃 à l'envers tête
😉 clin d'œil
😊 sourire timide rougir
😇 ange auréole sage
🥰 amoureux cœurs
😍 yeux cœurs amour
🤩 étoiles waouh super
😘 bisou baiser
😋 miam délicieux langue
😛 langue tirer
😜 langue clin d'œil fou
🤪 fou délire
😎 lunettes de soleil cool
🤓 intello lunettes
🥳 fête anniversaire
🤔 réfléchir penser hmm
🤗 câlin
🤫 chut silence secret
🤭 oups main bouche
😐 neutre bof
😑 blasé
😶 sans bouche muet
🙄 yeux au ciel
😏 malin sourire en coin
😬 grimace gêne
😌 soulagé calme
😴 dormir sommeil dodo
🤤 baver
😷 masque malade
🤒 fièvre thermomètre malade
🤕 blessé bandage
🤢 nausée vert malade
🤮 vomir
🤧 éternuer mouchoir rhume
🥵 chaud canicule
🥶 froid gelé
😵 étourdi
🤯 tête qui explose choqué
😲 étonné surpris
😮 bouche ouverte surpris
😯 ébahi
😳 rougir gêné
🥺 supplier yeux mignons
😢 triste larme
😭 pleurer sanglots
😱 peur cri horreur
😨 effrayé
😰 anxieux sueur
😤 fâché vapeur
😡 colère rouge furieux
😠 en colère fâché
🤬 jurons insultes
😈 diable coquin
👿 démon méchant
💀 crâne mort
☠️ tête de mort pirate danger
💩 caca crotte
🤡 clown
👻 fantôme halloween
👽 extraterrestre alien
🤖 robot
🎃 citrouille halloween
😺 chat sourire
😻 chat amoureux
🙈 singe ne rien voir
🙉 singe ne rien entendre
🙊 singe ne rien dire`],
    ['Personnes', '👋', `
👋 salut coucou main bonjour au revoir
🤚 main levée
✋ main stop
🖐️ main doigts écartés cinq
👌 ok parfait
✌️ victoire paix deux
🤞 croiser les doigts chance
🤟 je t'aime
🤘 rock cornes
🤙 appelle-moi
👈 gauche montrer
👉 droite montrer
👆 haut montrer
👇 bas montrer
☝️ index un attention
👍 pouce bien oui j'aime
👎 pouce bas non pas bien
✊ poing
👊 coup de poing
👏 applaudir bravo
🙌 hourra mains levées
👐 mains ouvertes
🤝 poignée de main accord
🙏 merci prière s'il te plaît
✍️ écrire
💪 muscle fort biceps
🦾 bras robot
🧠 cerveau intelligence
👀 yeux regarder
👁️ œil
👂 oreille écouter
👃 nez sentir
👄 bouche
🦷 dent
👶 bébé
🧒 enfant
👦 garçon
👧 fille
🧑 personne
👨 homme
👩 femme
🧓 personne âgée
👴 grand-père papi
👵 grand-mère mamie
👮 policier police
👷 ouvrier chantier casque
💂 garde
🕵️ détective espion
👩‍⚕️ médecin docteur
👨‍🍳 cuisinier chef
👩‍🎓 diplômée étudiante
👨‍🏫 professeur maître école
👩‍💻 informaticienne ordinateur programmeuse
👨‍🔬 scientifique chercheur
👩‍🚀 astronaute espace
👨‍🚒 pompier
🧙 magicien sorcier
🧚 fée
🧛 vampire
🧜 sirène
🧞 génie
🧟 zombie
🦸 super-héros
🦹 méchant super-vilain
🤴 prince
👸 princesse
🎅 père noël
🤶 mère noël
🏃 courir course
🚶 marcher
💃 danser danseuse
🕺 danseur
👪 famille
❤️‍🔥 cœur en feu
💏 bisou couple
💑 couple amoureux`],
    ['Animaux et nature', '🐶', `
🐶 chien toutou
🐱 chat minou
🐭 souris
🐹 hamster
🐰 lapin
🦊 renard
🐻 ours
🐼 panda
🐨 koala
🐯 tigre
🦁 lion
🐮 vache
🐷 cochon
🐸 grenouille
🐵 singe
🐔 poule
🐧 manchot pingouin
🐦 oiseau
🐤 poussin
🦆 canard
🦅 aigle
🦉 hibou chouette
🦇 chauve-souris
🐺 loup
🐗 sanglier
🐴 cheval
🦄 licorne
🐝 abeille
🐛 chenille
🦋 papillon
🐌 escargot
🐞 coccinelle
🐜 fourmi
🕷️ araignée
🦂 scorpion
🐢 tortue
🐍 serpent
🦎 lézard
🐉 dragon
🐲 dragon tête
🦖 dinosaure t-rex
🦕 dinosaure diplodocus
🐙 pieuvre poulpe
🦑 calamar
🦀 crabe
🐠 poisson tropical
🐟 poisson
🐬 dauphin
🐳 baleine
🦈 requin
🐊 crocodile
🐘 éléphant
🦒 girafe
🦓 zèbre
🦘 kangourou
🐪 chameau
🐑 mouton
🐐 chèvre
🦌 cerf
🐕 chien
🐈 chat
🐇 lapin
🐿️ écureuil
🦔 hérisson
🐾 empreintes pattes
🌵 cactus
🎄 sapin noël
🌲 sapin arbre
🌳 arbre
🌴 palmier
🌱 pousse plante
🌿 herbe feuille
🍀 trèfle chance
🍁 feuille d'érable automne
🍂 feuilles mortes automne
🍄 champignon
🌷 tulipe fleur
🌹 rose fleur
🌻 tournesol fleur
🌼 fleur
🌸 fleur de cerisier
💐 bouquet fleurs
🌍 terre monde planète
🌙 lune croissant nuit
⭐ étoile
🌟 étoile brillante
✨ étincelles magie
⚡ éclair foudre électricité
🔥 feu flamme
💧 goutte eau
🌊 vague mer océan
☀️ soleil beau temps
🌤️ soleil nuage
⛅ nuageux
☁️ nuage
🌧️ pluie
⛈️ orage
❄️ flocon neige froid
☃️ bonhomme de neige
🌈 arc-en-ciel
🌪️ tornade
☔ parapluie pluie`],
    ['Nourriture', '🍎', `
🍎 pomme rouge fruit
🍏 pomme verte
🍐 poire
🍊 orange mandarine
🍋 citron
🍌 banane
🍉 pastèque
🍇 raisin
🍓 fraise
🫐 myrtilles
🍒 cerises
🍑 pêche
🥭 mangue
🍍 ananas
🥥 noix de coco
🥝 kiwi
🍅 tomate
🍆 aubergine
🥑 avocat
🥦 brocoli
🥕 carotte
🌽 maïs
🌶️ piment
🥒 concombre
🥔 pomme de terre patate
🍞 pain
🥐 croissant
🥖 baguette
🧀 fromage
🥚 œuf
🍳 œuf au plat cuisine
🥞 crêpes pancakes
🧇 gaufre
🥓 bacon lard
🍗 cuisse de poulet
🍖 viande
🌭 hot-dog
🍔 hamburger
🍟 frites
🍕 pizza
🥪 sandwich
🌮 taco
🌯 burrito
🥗 salade
🍝 spaghetti pâtes
🍜 nouilles soupe
🍲 ragoût marmite
🍣 sushi
🍤 crevette
🍙 boulette de riz
🍚 riz
🍦 glace cornet
🍨 glace coupe
🍩 donut beignet
🍪 cookie biscuit
🎂 gâteau d'anniversaire
🍰 part de gâteau
🧁 cupcake
🥧 tarte
🍫 chocolat
🍬 bonbon
🍭 sucette
🍯 miel
🥛 lait verre
☕ café chaud
🍵 thé
🧃 jus de fruit brique
🥤 soda gobelet
🧋 bubble tea
🍼 biberon
🧂 sel
🍽️ assiette repas
🍴 couverts
🥄 cuillère`],
    ['Activités', '⚽', `
⚽ football ballon foot
🏀 basket ballon
🏈 football américain
⚾ baseball
🎾 tennis
🏐 volley
🏉 rugby
🎱 billard
🏓 ping-pong tennis de table
🏸 badminton
🥅 but cage
🏒 hockey
⛳ golf
🏹 arc tir à l'arc
🎣 pêche
🥊 boxe gant
🥋 judo karaté
🛹 skateboard
🛼 roller patins
⛸️ patin à glace
🎿 ski
🏂 snowboard
🏊 natation nager
🚴 vélo cyclisme
🧗 escalade
🤸 gymnastique roue
🏆 trophée coupe victoire
🥇 médaille d'or premier
🥈 médaille d'argent deuxième
🥉 médaille de bronze troisième
🏅 médaille
🎖️ décoration
🎫 ticket billet
🎪 cirque chapiteau
🎭 théâtre masques
🎨 peinture palette art
🎬 cinéma clap film
🎤 micro chanter karaoké
🎧 casque musique écouter
🎼 partition
🎹 piano clavier
🥁 batterie tambour
🎷 saxophone
🎺 trompette
🎸 guitare
🎻 violon
🎲 dé jeu hasard
♟️ échecs pion
🎯 cible fléchettes
🎳 bowling
🎮 manette jeu vidéo
🕹️ joystick arcade
🧩 puzzle pièce
🧸 nounours peluche
🪀 yoyo
🪁 cerf-volant
🎉 fête confettis bravo
🎊 confettis
🎈 ballon de baudruche fête
🎁 cadeau
🎀 ruban nœud
🎆 feu d'artifice
🎇 cierge magique
🧨 pétard`],
    ['Voyages', '🚗', `
🚗 voiture auto
🚕 taxi
🚙 4x4
🚌 bus autobus
🚎 trolleybus
🏎️ voiture de course formule 1
🚓 voiture de police
🚑 ambulance
🚒 camion de pompiers
🚐 minibus
🚚 camion
🚜 tracteur
🛵 scooter
🏍️ moto
🚲 vélo bicyclette
🛴 trottinette
🚨 gyrophare alerte
🚦 feu tricolore
🚧 travaux
⛽ essence station
🚂 locomotive train
🚆 train
🚇 métro
🚊 tramway
🚝 monorail
✈️ avion
🛫 décollage
🛬 atterrissage
🚁 hélicoptère
🚀 fusée espace
🛸 soucoupe volante ovni
🛰️ satellite
⛵ voilier bateau
🚤 hors-bord vedette
🛥️ yacht
🚢 paquebot navire
⚓ ancre
🗺️ carte
🧭 boussole
🏔️ montagne neige
⛰️ montagne
🌋 volcan
🏕️ camping tente
🏖️ plage parasol
🏝️ île déserte
🏜️ désert
🏠 maison
🏡 maison jardin
🏢 immeuble bureau
🏫 école
🏥 hôpital
🏦 banque
🏪 magasin supérette
🏰 château
🏯 château japonais
🗼 tour
🗽 statue de la liberté
⛪ église
🎡 grande roue
🎢 montagnes russes
🎠 manège
⛲ fontaine
🌃 nuit étoilée ville
🌅 lever de soleil
🌄 lever de soleil montagne
🌌 voie lactée galaxie
🪐 planète saturne
🌠 étoile filante`],
    ['Objets', '💡', `
💡 ampoule idée
🔦 lampe de poche
🕯️ bougie
📱 téléphone portable smartphone
💻 ordinateur portable
🖥️ ordinateur écran
⌨️ clavier
🖱️ souris ordinateur
🖨️ imprimante
💾 disquette enregistrer sauvegarder
💿 cd disque
📷 appareil photo
📸 photo flash
📹 caméra vidéo
🎥 caméra cinéma
📺 télévision télé
📻 radio
⏰ réveil alarme
⏱️ chronomètre
⏳ sablier temps
⌛ sablier fini
🕐 horloge heure
📅 calendrier date
📆 calendrier
🔋 pile batterie
🔌 prise électrique
💰 sac d'argent
💵 billet dollar
💶 billet euro
🪙 pièce de monnaie
💳 carte bancaire
💎 diamant pierre précieuse
🔑 clé
🗝️ vieille clé
🔒 cadenas fermé verrouillé
🔓 cadenas ouvert
🔨 marteau
🪛 tournevis
🔧 clé à molette outil
⚙️ engrenage réglages paramètres
🧲 aimant
🧪 tube à essai chimie
🔬 microscope
🔭 télescope
💊 médicament pilule
💉 seringue vaccin
🩹 pansement
🧹 balai
🧺 panier
🧻 papier toilette
🧼 savon
🛁 baignoire bain
🚿 douche
🛏️ lit
🛋️ canapé
🚪 porte
🪑 chaise
🎒 sac à dos cartable
👓 lunettes
🕶️ lunettes de soleil
👕 t-shirt
👖 jean pantalon
👗 robe
👟 basket chaussure
👑 couronne roi reine
🎩 chapeau haut-de-forme
🧢 casquette
☂️ parapluie
✏️ crayon
🖊️ stylo
🖍️ crayon de couleur
🖌️ pinceau
📝 mémo notes écrire
📖 livre ouvert lire
📚 livres
📓 cahier
📒 carnet
📃 page
📄 document feuille
📋 presse-papiers liste
📌 punaise épingle
📎 trombone
✂️ ciseaux couper
📏 règle
📐 équerre
📦 carton colis paquet
📫 boîte aux lettres
✉️ enveloppe lettre courrier
📧 e-mail courriel
📢 haut-parleur annonce
📣 mégaphone
🔔 cloche sonnerie notification
🔕 silence pas de son
🎵 note de musique
🎶 notes de musique
🔊 son fort volume
🔇 muet sans son
🔍 loupe chercher
🗑️ poubelle supprimer
🧸 ours en peluche
🪄 baguette magique
🔮 boule de cristal
🧿 amulette`],
    ['Symboles', '❤️', `
❤️ cœur rouge amour
🧡 cœur orange
💛 cœur jaune
💚 cœur vert
💙 cœur bleu
💜 cœur violet
🖤 cœur noir
🤍 cœur blanc
🤎 cœur marron
💔 cœur brisé
💕 deux cœurs
💖 cœur étincelant
💗 cœur qui grandit
💘 cœur flèche cupidon
💝 cœur cadeau
💯 cent parfait
✅ coche valider oui correct
☑️ case cochée
✔️ coche
❌ croix non faux erreur
❎ croix verte
➕ plus ajouter
➖ moins enlever
✖️ multiplier fois
➗ diviser
❓ question point d'interrogation
❔ question blanc
❗ exclamation attention
‼️ double exclamation
⚠️ attention danger avertissement
🚫 interdit
⛔ sens interdit stop
🛑 stop panneau
🔞 interdit aux moins de 18 ans
♻️ recyclage
✳️ astérisque
💤 dodo sommeil zzz
💬 bulle parole message
💭 bulle pensée
🗯️ bulle colère
💥 boum explosion
💫 étourdi étoiles
💦 gouttes eau sueur
💨 vent vite
🕳️ trou
⬆️ flèche haut
⬇️ flèche bas
⬅️ flèche gauche
➡️ flèche droite
↗️ flèche haut droite
↘️ flèche bas droite
↙️ flèche bas gauche
↖️ flèche haut gauche
↔️ flèche gauche droite
↕️ flèche haut bas
🔄 recommencer boucle
🔁 répéter
🔀 mélanger aléatoire
▶️ lecture jouer play
⏸️ pause
⏹️ stop arrêt
⏺️ enregistrer
⏭️ suivant
⏮️ précédent
⏩ avance rapide
⏪ retour rapide
🔼 haut triangle
🔽 bas triangle
🔴 rond rouge
🟠 rond orange
🟡 rond jaune
🟢 rond vert
🔵 rond bleu
🟣 rond violet
⚫ rond noir
⚪ rond blanc
🟥 carré rouge
🟧 carré orange
🟨 carré jaune
🟩 carré vert
🟦 carré bleu
🟪 carré violet
⬛ carré noir
⬜ carré blanc
🔶 losange orange
🔷 losange bleu
🔺 triangle rouge
♠️ pique carte
♥️ cœur carte
♦️ carreau carte
♣️ trèfle carte
🃏 joker
🀄 mahjong
🔢 chiffres nombres
🔤 lettres alphabet abc
🆗 ok
🆕 nouveau new
🆓 gratuit free
🆒 cool
🆘 sos au secours
ℹ️ information
🅰️ a
🅱️ b
#️⃣ dièse
0️⃣ zéro 0
1️⃣ un 1
2️⃣ deux 2
3️⃣ trois 3
4️⃣ quatre 4
5️⃣ cinq 5
6️⃣ six 6
7️⃣ sept 7
8️⃣ huit 8
9️⃣ neuf 9
🔟 dix 10
©️ copyright
®️ marque déposée
™️ marque
🏁 drapeau à damiers arrivée course
🚩 drapeau rouge
🏳️ drapeau blanc
🏴‍☠️ drapeau pirate
🇫🇷 france drapeau
🇧🇪 belgique drapeau
🇨🇭 suisse drapeau
🇨🇦 canada québec drapeau
🇪🇺 europe drapeau
🇬🇧 royaume-uni angleterre drapeau
🇺🇸 états-unis amérique drapeau
🇪🇸 espagne drapeau
🇮🇹 italie drapeau
🇩🇪 allemagne drapeau
🇯🇵 japon drapeau`]
  ];

  const LISTE = CATEGORIES.map(([nom, icone, texte]) => ({
    nom, icone,
    emojis: texte.trim().split('\n').map(ligne => {
      const espace = ligne.indexOf(' ');
      const mots = ligne.slice(espace + 1).trim();
      return { e: ligne.slice(0, espace), nom: mots.split(' ')[0], mots };
    })
  }));
  const TOUS = LISTE.flatMap(c => c.emojis);

  const CLE_RECENTS = 'blocstudio.emojis-recents';
  function lireRecents() {
    try { return JSON.parse(localStorage.getItem(CLE_RECENTS)) || []; } catch (e) { return []; }
  }
  function noterRecent(emoji) {
    const r = [emoji, ...lireRecents().filter(x => x !== emoji)].slice(0, 24);
    try { localStorage.setItem(CLE_RECENTS, JSON.stringify(r)); } catch (e) { /* pas grave */ }
  }

  // « cœur » se trouve en tapant « coeur », « fusee » trouve « fusée »…
  const simplifier = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/æ/g, 'ae');

  const STYLE = `
    .se-panneau { position: fixed; z-index: 6000; width: 352px; display: flex; flex-direction: column;
      background: #fff; border: 1px solid #d5dbe5; border-radius: 10px; box-shadow: 0 14px 40px rgba(15,23,42,.25);
      font-family: 'Segoe UI', sans-serif; color: #1f2937; overflow: hidden; }
    .se-recherche { margin: 8px; padding: 7px 10px; border: 1px solid #d5dbe5; border-radius: 7px; font: inherit; font-size: 14px; }
    .se-recherche:focus { outline: 2px solid #a5b4fc; border-color: #6366f1; }
    .se-categories { display: flex; padding: 0 6px; border-bottom: 1px solid #e5e7eb; }
    .se-categories button { flex: 1; min-width: 0; padding: 4px 0 6px; border: 0; border-bottom: 3px solid transparent; background: none;
      font-size: 19px; cursor: pointer; filter: grayscale(.6); }
    .se-categories button:hover { filter: none; }
    .se-categories button.actif { border-bottom-color: #6366f1; filter: none; }
    .se-titre { padding: 6px 10px 2px; font-size: 12px; font-weight: 600; color: #6b7280; }
    .se-grille { height: 232px; overflow-y: auto; overflow-x: hidden; padding: 2px 6px 6px; display: grid;
      grid-template-columns: repeat(8, minmax(0, 1fr)); align-content: start; }
    .se-grille button { height: 40px; min-width: 0; padding: 0; border: 0; border-radius: 6px; background: none; font-size: 25px; cursor: pointer;
      font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif; }
    .se-grille button:hover, .se-grille button:focus { background: #eef2ff; outline: none; }
    .se-vide { grid-column: 1 / -1; padding: 20px 8px; text-align: center; color: #6b7280; font-size: 13px; }
    .se-pied { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 4px 12px;
      border-top: 1px solid #e5e7eb; background: #f8fafc; font-size: 13px; color: #475569; }
    .se-pied b { font-size: 26px; font-weight: normal; }
  `;

  let panneau = null;
  let fermerActuel = null;

  function fermer() {
    if (fermerActuel) fermerActuel();
  }

  function ouvrir(ancre, surChoix) {
    fermer();
    if (!document.getElementById('style-selecteur-emoji')) {
      const st = document.createElement('style');
      st.id = 'style-selecteur-emoji';
      st.textContent = STYLE;
      document.head.appendChild(st);
    }
    const focusAvant = document.activeElement;
    panneau = document.createElement('div');
    panneau.className = 'se-panneau';
    panneau.addEventListener('pointerdown', e => e.stopPropagation());
    panneau.addEventListener('mousedown', e => { if (e.target.tagName !== 'INPUT') e.preventDefault(); }); // garde le focus dans la recherche

    const recherche = document.createElement('input');
    recherche.className = 'se-recherche';
    recherche.placeholder = '🔎 Chercher : chat, cœur, fusée, étoile…';
    const categories = document.createElement('div');
    categories.className = 'se-categories';
    const titre = document.createElement('div');
    titre.className = 'se-titre';
    const grille = document.createElement('div');
    grille.className = 'se-grille';
    const pied = document.createElement('div');
    pied.className = 'se-pied';
    pied.textContent = 'Cliquez sur un émoji pour l\'ajouter.';
    panneau.append(recherche, categories, titre, grille, pied);

    let categorie = lireRecents().length ? -1 : 0; // -1 : récents
    const montrer = (liste, texteTitre) => {
      titre.textContent = texteTitre;
      grille.replaceChildren();
      if (!liste.length) {
        const vide = document.createElement('div');
        vide.className = 'se-vide';
        vide.textContent = 'Aucun émoji trouvé. Essayez un autre mot (animal, sport, nourriture…).';
        grille.appendChild(vide);
      }
      for (const item of liste) {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = item.e;
        b.title = item.nom;
        const apercu = () => {
          pied.replaceChildren();
          const grand = document.createElement('b');
          grand.textContent = item.e;
          pied.append(grand, item.nom);
        };
        b.addEventListener('mouseenter', apercu);
        b.addEventListener('focus', apercu);
        b.addEventListener('click', () => choisir(item.e));
        grille.appendChild(b);
      }
      grille.scrollTop = 0;
    };
    const afficherCategorie = () => {
      [...categories.children].forEach((b, i) => b.classList.toggle('actif', i - 1 === categorie));
      if (categorie === -1) {
        const recents = lireRecents().map(e => TOUS.find(x => x.e === e) || { e, nom: e, mots: '' });
        montrer(recents, 'Utilisés récemment');
      } else {
        montrer(LISTE[categorie].emojis, LISTE[categorie].nom);
      }
    };
    [{ nom: 'Récents', icone: '🕘' }, ...LISTE].forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = c.icone;
      b.title = c.nom;
      b.addEventListener('click', () => { recherche.value = ''; categorie = i - 1; afficherCategorie(); });
      categories.appendChild(b);
    });
    recherche.addEventListener('input', () => {
      const mots = simplifier(recherche.value).split(/\s+/).filter(Boolean);
      if (!mots.length) return afficherCategorie();
      [...categories.children].forEach(b => b.classList.remove('actif'));
      // Les mots exacts d'abord (« chat » avant « château »), puis les débuts de mots, puis le reste.
      const score = x => {
        const m = simplifier(x.mots), liste = m.split(/[\s'-]+/);
        if (!mots.every(mot => m.includes(mot))) return -1;
        return mots.reduce((t, mot) => t + (liste.includes(mot) ? 0 : liste.some(w => w.startsWith(mot)) ? 1 : 2), 0);
      };
      const trouves = TOUS.map(x => [x, score(x)]).filter(([, n]) => n >= 0).sort((a, b) => a[1] - b[1]).map(([x]) => x);
      montrer(trouves, `Résultats pour « ${recherche.value.trim()} »`);
    });
    recherche.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); grille.querySelector('button')?.click(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); grille.querySelector('button')?.focus(); }
    });
    grille.addEventListener('keydown', e => {
      const boutons = [...grille.querySelectorAll('button')];
      const i = boutons.indexOf(document.activeElement);
      if (i < 0) return;
      const pas = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -8, ArrowDown: 8 }[e.key];
      if (pas) {
        e.preventDefault();
        if (i + pas < 0) recherche.focus();
        else boutons[Math.min(boutons.length - 1, i + pas)]?.focus();
      }
    });

    function choisir(emoji) {
      noterRecent(emoji);
      fermer();
      surChoix(emoji);
    }

    const surClavier = e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fermer(); }
      else e.stopPropagation(); // les raccourcis de BlocStudio ne réagissent pas pendant la recherche
    };
    const surClicDehors = e => { if (!panneau.contains(e.target)) fermer(); };
    panneau.addEventListener('keydown', surClavier);
    setTimeout(() => document.addEventListener('pointerdown', surClicDehors, true));
    window.addEventListener('resize', fermer);
    fermerActuel = () => {
      document.removeEventListener('pointerdown', surClicDehors, true);
      window.removeEventListener('resize', fermer);
      panneau.remove();
      panneau = null;
      fermerActuel = null;
      if (focusAvant && document.contains(focusAvant)) focusAvant.focus();
    };

    document.body.appendChild(panneau);
    afficherCategorie();
    // Placé sous l'ancre (ou au-dessus s'il n'y a pas la place), sans sortir de l'écran.
    const r = ancre instanceof Element ? ancre.getBoundingClientRect() : { left: ancre.x, right: ancre.x, top: ancre.y, bottom: ancre.y };
    const l = panneau.offsetWidth, h = panneau.offsetHeight;
    panneau.style.left = Math.max(6, Math.min(r.left, innerWidth - l - 6)) + 'px';
    panneau.style.top = (r.bottom + 6 + h <= innerHeight ? r.bottom + 6 : Math.max(6, r.top - h - 6)) + 'px';
    recherche.focus();
  }

  // Insère un émoji à la place du curseur d'un champ, comme si on l'avait tapé, avec une espace
  // pour le séparer d'un mot qui le touche (mais pas d'un autre émoji : ⭐⭐⭐).
  function inserer(champ, texte) {
    const debut = champ.selectionStart ?? champ.value.length;
    const fin = champ.selectionEnd ?? champ.value.length;
    const mot = /[\p{L}\p{N}.,!?:;)»]/u;
    if (debut > 0 && mot.test(champ.value[debut - 1])) texte = ' ' + texte;
    if (fin < champ.value.length && mot.test(champ.value[fin])) texte += ' ';
    champ.focus();
    champ.setRangeText(texte, debut, fin, 'end');
    champ.dispatchEvent(new Event('input', { bubbles: true }));
  }

  window.SelecteurEmoji = { ouvrir, fermer, inserer, nombre: TOUS.length };
})();
