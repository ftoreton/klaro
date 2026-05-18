import type { Metier } from '@/lib/metier/types';

// ─────────────────────────────────────────────────────
// SEED — Électricité
// 8 étapes représentatives, dont :
// - 2 critiques (consignation, tests Consuel)
// - 3 importantes (tableau, raccordement, Consuel)
// - 3 normales (projet, circuits, prises)
// ─────────────────────────────────────────────────────

const electricite: Metier = {
  id: 'electricite',
  nom: 'Électricité',
  description_simple:
    "Installer ou rénover toute l'installation électrique d'un logement, du tableau aux prises, en passant par la mise en sécurité et le contrôle final.",

  etapes: [
    // ─── 1. Définir le projet ───────────────────────
    {
      id: 'elec-01',
      titre_simple: 'Définir le projet électrique',
      titre_technique: 'Schéma unifilaire et bilan de puissance',
      resume_simple:
        "Faire la liste de toutes les pièces, des prises et interrupteurs souhaités, et des appareils qui consommeront beaucoup (four, plaque, lave-linge…).",
      pourquoi_important:
        "Sans plan clair, on oublie systématiquement des prises, on sous-dimensionne les circuits et on doit refaire les murs.",
      niveau_criticite: 'normal',
      statut: 'todo',
      date_planifiee: null,
      photos: [],
      sous_taches: [
        { id: 'elec-01-st1', label: 'Lister les pièces du logement', done: false, niveau: 'debutant' },
        { id: 'elec-01-st2', label: 'Compter les prises et interrupteurs par pièce', done: false, niveau: 'debutant' },
        { id: 'elec-01-st3', label: 'Identifier les gros consommateurs (four, plaque, lave-linge…)', done: false, niveau: 'debutant' },
        { id: 'elec-01-st4', label: 'Réaliser le bilan de puissance avec coefficient de simultanéité', done: false, niveau: 'intermediaire' },
        { id: 'elec-01-st5', label: 'Dessiner le schéma unifilaire complet', done: false, niveau: 'expert' },
      ],
      erreurs_frequentes: [
        "Sous-estimer le nombre de prises dans la cuisine (compter 6 minimum, dont 4 sur le plan de travail).",
        "Oublier les circuits dédiés (lave-linge, lave-vaisselle, four, plaque) — chacun doit être seul sur son disjoncteur.",
      ],
      recommandations_simples: [
        "Prévoyez large : il est plus simple d'ajouter des prises maintenant que de les rajouter dans 5 ans.",
        "Pour chaque chambre : 3 prises minimum bien réparties, 1 point lumineux commandé en deux endroits si la pièce est traversante.",
      ],
      recommandations_techniques_DTU: [
        "NF C 15-100 § 7.3 : nombre minimum de socles 16 A par pièce — séjour 5, chambre 3, cuisine 6 (dont 4 sur plan de travail).",
        "Bilan de puissance : Σ puissances installées × coefficient de simultanéité (0,4 à 0,7 en logement).",
        "Section conducteurs : 1,5 mm² éclairage (8 points max), 2,5 mm² prises (8 socles 1,5 mm² ou 12 socles 2,5 mm²), 6 mm² four/plaque, 10 mm² chauffe-eau.",
      ],
      termes_techniques: [
        { terme: 'schéma unifilaire', definition_simple: "Plan qui représente chaque circuit électrique par une seule ligne. C'est la photo d'identité de ton installation." },
        { terme: 'bilan de puissance', definition_simple: 'Calcul qui additionne la puissance de tous les appareils pour dimensionner correctement le tableau et l\'abonnement.' },
        { terme: 'coefficient de simultanéité', definition_simple: "Pourcentage qui tient compte du fait qu'on n'utilise jamais tous les appareils en même temps (généralement 40 à 70 %)." },
        { terme: 'circuit dédié', definition_simple: "Circuit qui n'alimente qu'un seul appareil (par exemple le four), pour éviter les surcharges." },
      ],
      materiel_conseille: ['Plan du logement coté', 'Crayon + papier ou logiciel d\'archi', 'Liste exhaustive des équipements futurs'],
    },

    // ─── 2. CRITIQUE — Sécuriser et consigner ──────
    {
      id: 'elec-02',
      titre_simple: 'Couper le courant et le consigner',
      titre_technique: 'Mise hors tension, consignation et VAT',
      resume_simple:
        "Avant TOUTE intervention : couper l'électricité au tableau, mettre un cadenas et vérifier qu'il n'y a vraiment plus de courant avec un appareil de mesure.",
      pourquoi_important:
        "L'électricité tue. Une intervention sans consignation expose à l'électrocution. C'est l'étape où il n'y a aucune marge d'erreur possible.",
      niveau_criticite: 'critique',
      statut: 'todo',
      date_planifiee: null,
      photos: [],
      sous_taches: [
        { id: 'elec-02-st1', label: 'Couper le disjoncteur général au compteur', done: false, niveau: 'debutant' },
        { id: 'elec-02-st2', label: 'Apposer un cadenas et une étiquette "Travaux en cours, ne pas réenclencher"', done: false, niveau: 'debutant' },
        { id: 'elec-02-st3', label: 'Photographier le tableau cadenassé pour archive', done: false, niveau: 'debutant' },
        { id: 'elec-02-st4', label: 'Vérifier l\'absence de tension (VAT) sur chaque circuit avec un testeur certifié', done: false, niveau: 'intermediaire' },
        { id: 'elec-02-st5', label: 'Tester la VAT avant et après sur une source connue (méthode des trois vérifications)', done: false, niveau: 'expert' },
      ],
      erreurs_frequentes: [
        "Couper le disjoncteur sans cadenas — un autre occupant peut le remettre en service par erreur, électrocution.",
        "Croire qu'un disjoncteur coupé suffit sans VAT — un câble peut rester sous tension par erreur de bornage.",
      ],
      recommandations_simples: [
        "Investissez dans un VAT certifié (~30-80 €) — c'est l'outil qui sauve des vies.",
        "Travaillez à deux personnes minimum sur de l'électricité.",
      ],
      recommandations_techniques_DTU: [
        "NF C 18-510 : procédure de consignation obligatoire (séparation, condamnation, identification, VAT).",
        "VAT conforme NF EN 61243-3, à tester avant et après chaque mesure sur une source connue.",
        "Étiquetage explicite avec date, nom du consignateur, motif de la consignation.",
      ],
      termes_techniques: [
        { terme: 'consignation', definition_simple: "Procédure officielle qui rend une installation électrique impossible à remettre sous tension par erreur (cadenas + étiquette)." },
        { terme: 'VAT', definition_simple: "Vérification d'Absence de Tension. Petit appareil qui confirme qu'il n'y a vraiment plus de courant dans un câble." },
        { terme: 'disjoncteur général', definition_simple: "Le gros interrupteur en haut du tableau qui coupe TOUT le courant de la maison d'un coup." },
      ],
      materiel_conseille: ['Cadenas de consignation + clé personnelle', 'Étiquette "Travaux en cours"', 'VAT certifié NF EN 61243-3', 'Gants isolants classe 0'],
    },

    // ─── 3. Tableau électrique ─────────────────────
    {
      id: 'elec-03',
      titre_simple: 'Poser le tableau électrique',
      titre_technique: 'Installation de la GTL avec ETEL et tableau de répartition',
      resume_simple:
        "Installer le coffret central qui regroupe tous les disjoncteurs et différentiels du logement, dans un emplacement accessible.",
      pourquoi_important:
        "Le tableau est le cerveau de l'installation. Mal posé ou sous-dimensionné, il provoque déclenchements intempestifs et limite toute évolution future.",
      niveau_criticite: 'important',
      statut: 'todo',
      date_planifiee: null,
      photos: [],
      sous_taches: [
        { id: 'elec-03-st1', label: 'Définir l\'emplacement (entrée ou local technique, accessible)', done: false, niveau: 'debutant' },
        { id: 'elec-03-st2', label: 'Fixer le coffret au mur', done: false, niveau: 'debutant' },
        { id: 'elec-03-st3', label: 'Prévoir 20 % de réserve pour évolutions futures', done: false, niveau: 'debutant' },
        { id: 'elec-03-st4', label: 'Installer l\'ETEL aux bonnes dimensions (largeur 600 mm, du sol au plafond)', done: false, niveau: 'intermediaire' },
        { id: 'elec-03-st5', label: 'Choisir et placer les interrupteurs différentiels (types A, AC, F selon usages)', done: false, niveau: 'intermediaire' },
        { id: 'elec-03-st6', label: 'Installer les peignes horizontaux et verticaux selon plan', done: false, niveau: 'expert' },
      ],
      erreurs_frequentes: [
        "Tableau trop petit dès la pose — impossible d'ajouter un circuit dans 2 ans sans tout déposer.",
        "Tableau mal placé (cave humide, garage gel) — corrosion, déclenchements à répétition.",
      ],
      recommandations_simples: [
        "Choisissez un coffret avec 20 à 30 % de modules libres pour l'avenir.",
        "Étiquetez chaque disjoncteur dès la pose : 'Cuisine prises', 'Salon éclairage', etc.",
      ],
      recommandations_techniques_DTU: [
        "NF C 15-100 § 5 : ETEL (Espace Technique Électrique du Logement) de 600 mm de large minimum, sol au plafond.",
        "GTL (Gaine Technique Logement) : panneau de contrôle + tableau de répartition + tableau de communication.",
        "Différentiel 30 mA type A pour circuits avec composants électroniques (plaque, lave-linge), type AC pour autres, type F pour fortes harmoniques.",
        "Réserve minimum 20 % de modules libres dans le tableau (NF C 15-100 § 5.5).",
      ],
      termes_techniques: [
        { terme: 'GTL', definition_simple: "Gaine Technique Logement. C'est le coffrage vertical qui contient le tableau électrique et les arrivées de la maison." },
        { terme: 'ETEL', definition_simple: "L'espace réservé autour du tableau où on n'a pas le droit de mettre quoi que ce soit (pour pouvoir intervenir sans gêne)." },
        { terme: 'différentiel', definition_simple: "Disjoncteur intelligent qui coupe le courant dès qu'il détecte une fuite vers la terre (signe qu'un humain est en train de prendre le jus)." },
        { terme: 'peigne', definition_simple: "Barre métallique horizontale qui distribue le courant entre tous les disjoncteurs d'une rangée du tableau." },
      ],
      materiel_conseille: ['Coffret 4 rangées 13 modules minimum', 'Différentiels 30 mA types A et AC', 'Peignes horizontaux phase + neutre', 'Niveau à bulle', 'Étiquettes adhésives'],
    },

    // ─── 4. Tirage des circuits ────────────────────
    {
      id: 'elec-04',
      titre_simple: 'Tirer les fils dans les murs',
      titre_technique: 'Pose des gaines ICTA et tirage des conducteurs',
      resume_simple:
        "Faire passer les câbles électriques dans des gaines orange entre le tableau et chaque point d'utilisation (prise, interrupteur, plafonnier).",
      pourquoi_important:
        "Si une gaine est oubliée ou trop fine, il faut tout casser pour la rajouter. C'est l'étape la plus 'cachée' mais une des plus coûteuses à corriger après.",
      niveau_criticite: 'normal',
      statut: 'todo',
      date_planifiee: null,
      photos: [],
      sous_taches: [
        { id: 'elec-04-st1', label: 'Tracer le chemin des gaines au crayon sur les murs', done: false, niveau: 'debutant' },
        { id: 'elec-04-st2', label: 'Réaliser les saignées (mur) ou poser sur ossature', done: false, niveau: 'debutant' },
        { id: 'elec-04-st3', label: 'Poser les gaines ICTA aux bons diamètres', done: false, niveau: 'debutant' },
        { id: 'elec-04-st4', label: 'Étiqueter chaque câble côté tableau ET côté pièce au fur et à mesure', done: false, niveau: 'debutant' },
        { id: 'elec-04-st5', label: 'Respecter les sections selon usage (1,5 mm² éclairage, 2,5 mm² prises, 6 mm² four)', done: false, niveau: 'intermediaire' },
        { id: 'elec-04-st6', label: 'Respecter les règles de cheminement vertical/horizontal et les distances avec autres réseaux', done: false, niveau: 'expert' },
      ],
      erreurs_frequentes: [
        "Tirer un fil sans gaine ICTA — non conforme et impossible à remplacer plus tard.",
        "Ne pas étiqueter les câbles → au moment du raccordement au tableau, on ne sait plus quel fil va où.",
      ],
      recommandations_simples: [
        "Prends en photo chaque mur avant fermeture du placo. Tu béniras ces photos dans 5 ans.",
        "Tire 1 à 2 gaines vides en plus depuis le tableau vers chaque pièce — ça coûte 5 € et ça change tout pour l'avenir.",
      ],
      recommandations_techniques_DTU: [
        "Gaines ICTA Ø 16 mm pour 2 fils 1,5 mm², Ø 20 mm pour 3 fils 2,5 mm², Ø 25 mm pour 6 mm².",
        "Cheminement : horizontal à 30 cm du sol ou plafond, vertical d'aplomb des prises et interrupteurs.",
        "Distance minimale 3 cm entre gaines courants forts et courants faibles (téléphone, RJ45) en parallèle.",
        "Respect NF C 15-100 § 5.2 sur les passages encastrés et les protections mécaniques.",
      ],
      termes_techniques: [
        { terme: 'ICTA', definition_simple: "Tube ondulé orange dans lequel passent les fils électriques. Permet de remplacer un câble sans casser le mur." },
        { terme: 'saignée', definition_simple: "Tranchée creusée dans un mur (à la rainureuse) pour y faire passer les gaines avant de reboucher." },
        { terme: 'section', definition_simple: "Diamètre interne du fil de cuivre. Plus le fil transporte de courant, plus il doit être gros (1,5 / 2,5 / 6 / 10 mm²)." },
      ],
      materiel_conseille: ['Gaines ICTA Ø 16, 20, 25 mm', 'Conducteurs H07V-U sections 1,5 / 2,5 / 6 mm²', 'Aiguille à tirer les fils', 'Rainureuse + masque FFP3', 'Marqueurs et étiquettes'],
    },

    // ─── 5. Prises et interrupteurs ────────────────
    {
      id: 'elec-05',
      titre_simple: 'Poser les prises et interrupteurs',
      titre_technique: 'Pose des socles 16 A, mécanismes de commande et hauteurs réglementaires',
      resume_simple:
        "Installer toutes les prises électriques et tous les interrupteurs aux bonnes hauteurs réglementaires, avec un câblage propre.",
      pourquoi_important:
        "C'est la partie visible. Mal placée ou mal câblée, elle gâche l'esthétique de la pièce ou crée des dangers (mauvais branchement de la terre).",
      niveau_criticite: 'normal',
      statut: 'todo',
      date_planifiee: null,
      photos: [],
      sous_taches: [
        { id: 'elec-05-st1', label: 'Poser les boîtes d\'encastrement aux bonnes hauteurs', done: false, niveau: 'debutant' },
        { id: 'elec-05-st2', label: 'Aligner les boîtes au niveau à bulle', done: false, niveau: 'debutant' },
        { id: 'elec-05-st3', label: 'Câbler chaque prise : phase, neutre, terre (sens normalisé)', done: false, niveau: 'debutant' },
        { id: 'elec-05-st4', label: 'Visser les mécanismes au couple recommandé sans surserrer', done: false, niveau: 'intermediaire' },
        { id: 'elec-05-st5', label: 'Respecter les volumes en salle de bain (V0, V1, V2 et hors volumes)', done: false, niveau: 'intermediaire' },
        { id: 'elec-05-st6', label: 'Vérifier les classes IP des appareils selon le volume SDB', done: false, niveau: 'expert' },
      ],
      erreurs_frequentes: [
        "Inverser phase et neutre — l'appareil fonctionne, mais le différentiel est moins efficace en cas de défaut.",
        "Poser une prise à 3 cm du sol — inaccessible à un balai-brosse, jamais utilisée.",
      ],
      recommandations_simples: [
        "Hauteur standard : prises 25 cm du sol (5 cm minimum), interrupteurs 90-130 cm.",
        "En cuisine : prises au-dessus du plan de travail à 8-10 cm de hauteur du plan.",
      ],
      recommandations_techniques_DTU: [
        "NF C 15-100 § 7.1 : hauteurs réglementaires socles 16 A à 5 cm minimum du sol fini, 32 A à 12 cm.",
        "Interrupteurs : entre 90 et 130 cm du sol fini.",
        "Salle de bain : V0 (intérieur baignoire/douche) interdit, V1 IPX4 + transformateur séparation, V2 IPX4 + classe II, hors volumes IPX1.",
        "Boîtes d'encastrement : profondeur 40 mm minimum, alignement à ±2 mm.",
      ],
      termes_techniques: [
        { terme: 'phase', definition_simple: "Le fil 'sous tension' du courant alternatif (généralement rouge ou marron). C'est lui qui peut donner un choc." },
        { terme: 'neutre', definition_simple: "Le fil de retour du courant (généralement bleu). Au repos, il n'est pas sous tension." },
        { terme: 'volume SDB', definition_simple: "Zones autour de la baignoire/douche définissant ce qu'on a le droit d'installer (par sécurité électrique)." },
        { terme: 'IPX4', definition_simple: "Indice de protection : un appareil IPX4 résiste aux projections d'eau de toutes directions. Obligatoire en V1 SDB." },
      ],
      materiel_conseille: ['Boîtes d\'encastrement Ø 67 mm', 'Mécanismes prises 16 A 2P+T', 'Mécanismes interrupteurs simples et va-et-vient', 'Niveau à bulle 30 cm', 'Tournevis dynamométrique'],
    },

    // ─── 6. Raccordement final ─────────────────────
    {
      id: 'elec-06',
      titre_simple: 'Raccorder le tableau électrique',
      titre_technique: 'Câblage des départs et serrage au couple sur peignes et bornes',
      resume_simple:
        "Brancher tous les fils qui arrivent au tableau sur leur disjoncteur, dans le bon ordre, avec un serrage précis.",
      pourquoi_important:
        "Un câble mal serré chauffe, fait du faux contact, et finit par brûler. C'est une cause majeure d'incendie domestique d'origine électrique.",
      niveau_criticite: 'important',
      statut: 'todo',
      date_planifiee: null,
      photos: [],
      sous_taches: [
        { id: 'elec-06-st1', label: 'Identifier chaque câble grâce à l\'étiquetage de l\'étape précédente', done: false, niveau: 'debutant' },
        { id: 'elec-06-st2', label: 'Dénuder les câbles à la bonne longueur (pas plus, pas moins)', done: false, niveau: 'debutant' },
        { id: 'elec-06-st3', label: 'Brancher chaque circuit sur son disjoncteur dédié', done: false, niveau: 'debutant' },
        { id: 'elec-06-st4', label: 'Serrer chaque borne au couple recommandé (généralement 2-3 N·m)', done: false, niveau: 'intermediaire' },
        { id: 'elec-06-st5', label: 'Réaliser un peignage propre des fils à l\'intérieur du coffret', done: false, niveau: 'intermediaire' },
        { id: 'elec-06-st6', label: 'Étiqueter définitivement chaque disjoncteur côté face avant', done: false, niveau: 'debutant' },
      ],
      erreurs_frequentes: [
        "Serrer 'à la pince' sans tournevis dynamométrique — sous-serré ça chauffe, sur-serré ça écrase le fil.",
        "Plusieurs fils dans une borne prévue pour un seul — interdit, échauffement garanti.",
      ],
      recommandations_simples: [
        "Tournevis dynamométrique (~30 €) — c'est le seul moyen de garantir le bon serrage.",
        "Faites une photo du tableau câblé en gros plan pour archive.",
      ],
      recommandations_techniques_DTU: [
        "Couple de serrage selon constructeur (typiquement 2-3 N·m pour disjoncteurs modulaires).",
        "Une borne = un fil (sauf borniers spécifiques multi-fils).",
        "Section conducteurs adaptée au calibre du disjoncteur (1,5 mm² → 16 A max, 2,5 mm² → 20 A max, 6 mm² → 32 A).",
        "Conducteur de terre vert/jaune obligatoire sur tous les circuits, repère sur le bornier de terre du tableau.",
      ],
      termes_techniques: [
        { terme: 'couple de serrage', definition_simple: "Force exacte avec laquelle on visse une borne. Trop peu ça chauffe, trop fort ça écrase le fil." },
        { terme: 'borne', definition_simple: "Petit logement métallique d'un disjoncteur dans lequel on enfonce et serre le fil." },
        { terme: 'peignage', definition_simple: "Ranger les fils proprement à l'intérieur du tableau pour qu'ils soient parallèles et sans nœud." },
      ],
      materiel_conseille: ['Tournevis dynamométrique 0,5-5 N·m', 'Pince à dénuder automatique', 'Embouts de câblage', 'Goulottes de peignage', 'Étiquettes face avant'],
    },

    // ─── 7. CRITIQUE — Tests obligatoires ──────────
    {
      id: 'elec-07',
      titre_simple: 'Tester toute l\'installation',
      titre_technique: 'Mesures de continuité de terre, isolement et déclenchement différentiel',
      resume_simple:
        "Avant de remettre le courant en service, faire les mesures obligatoires : la terre est-elle bien connectée partout, y a-t-il des fuites, les différentiels coupent-ils bien ?",
      pourquoi_important:
        "Sans ces tests, on peut très bien avoir une installation 'qui marche' mais qui tue ou déclenche un incendie au premier défaut. Tests obligatoires pour le Consuel.",
      niveau_criticite: 'critique',
      statut: 'todo',
      date_planifiee: null,
      photos: [],
      sous_taches: [
        { id: 'elec-07-st1', label: 'Mesurer la résistance de la prise de terre (< 100 Ω avec différentiel 30 mA)', done: false, niveau: 'debutant' },
        { id: 'elec-07-st2', label: 'Tester le déclenchement de chaque différentiel avec son bouton test', done: false, niveau: 'debutant' },
        { id: 'elec-07-st3', label: 'Mesurer la continuité de terre sur chaque prise (< 2 Ω)', done: false, niveau: 'intermediaire' },
        { id: 'elec-07-st4', label: 'Mesurer l\'isolement de chaque circuit (> 0,5 MΩ)', done: false, niveau: 'intermediaire' },
        { id: 'elec-07-st5', label: 'Tester le déclenchement réel des différentiels avec un appareil de mesure', done: false, niveau: 'expert' },
        { id: 'elec-07-st6', label: 'Vérifier la sélectivité différentiel-disjoncteur sur défauts simulés', done: false, niveau: 'expert' },
      ],
      erreurs_frequentes: [
        "Ne tester que le bouton 'Test' du différentiel — il ne valide que le mécanisme, pas la sensibilité réelle.",
        "Oublier la mesure de terre — sans terre conforme, l'installation est dangereuse même si tout 'fonctionne'.",
      ],
      recommandations_simples: [
        "Faites tester par un pro ou louez un contrôleur d'installation (~80 €/jour).",
        "Photographiez chaque mesure pour archive — utile pour le Consuel et en cas de sinistre.",
      ],
      recommandations_techniques_DTU: [
        "NF C 15-100 § 6 : mesure de terre obligatoire — résistance < 100 Ω pour différentiel 30 mA.",
        "Isolement entre conducteurs et terre : > 0,5 MΩ sous 500 V continu (NF C 15-100 § 6.4).",
        "Continuité de terre sur chaque socle : < 2 Ω (idéalement < 1 Ω).",
        "Déclenchement différentiel à 30 mA en moins de 30 ms (test au contrôleur dédié).",
        "Sélectivité : un défaut sur un circuit ne doit déclencher QUE son différentiel, pas le général.",
      ],
      termes_techniques: [
        { terme: 'prise de terre', definition_simple: "Conducteur enfoncé dans le sol qui évacue le courant en cas de défaut. C'est ce qui empêche d'être électrocuté en touchant un appareil défectueux." },
        { terme: 'continuité de terre', definition_simple: "Test qui vérifie que le fil de terre arrive bien jusqu'à chaque prise sans coupure." },
        { terme: 'isolement', definition_simple: "Mesure qui vérifie qu'aucun courant ne 's'échappe' entre la phase et la terre par un défaut d'isolant." },
        { terme: 'sélectivité', definition_simple: "Quand un seul circuit a un défaut, seul son disjoncteur doit sauter — pas tout le tableau." },
      ],
      materiel_conseille: ['Contrôleur d\'installation (Chauvin Arnoux C.A 6116N ou équivalent)', 'Telluromètre ou pince de terre', 'Multimètre certifié', 'Tableau de relevés'],
    },

    // ─── 8. Consuel ─────────────────────────────────
    {
      id: 'elec-08',
      titre_simple: 'Préparer le Consuel',
      titre_technique: 'Demande d\'attestation Consuel et levée des réserves éventuelles',
      resume_simple:
        "Faire valider l'installation par l'organisme officiel (Consuel) avant la mise sous tension par Enedis. Sans ce papier, pas d'électricité dans la maison.",
      pourquoi_important:
        "Sans attestation Consuel, Enedis refuse la mise en service. C'est la seule porte d'entrée vers une mise en service légale en construction neuve ou rénovation totale.",
      niveau_criticite: 'important',
      statut: 'todo',
      date_planifiee: null,
      photos: [],
      sous_taches: [
        { id: 'elec-08-st1', label: 'Constituer le dossier (formulaire jaune ou vert selon cas)', done: false, niveau: 'debutant' },
        { id: 'elec-08-st2', label: 'Joindre le schéma unifilaire et le relevé des mesures', done: false, niveau: 'intermediaire' },
        { id: 'elec-08-st3', label: 'Envoyer le dossier au Consuel et payer les frais', done: false, niveau: 'debutant' },
        { id: 'elec-08-st4', label: 'Préparer l\'installation pour la visite (tableau accessible, étiquetages clairs)', done: false, niveau: 'debutant' },
        { id: 'elec-08-st5', label: 'Lever les éventuelles réserves émises par le contrôleur Consuel', done: false, niveau: 'intermediaire' },
      ],
      erreurs_frequentes: [
        "Demander le Consuel avant d'avoir fini les tests de l'étape précédente — visite ratée, frais à repayer.",
        "Schéma unifilaire absent ou incomplet — refus du dossier dès la réception.",
      ],
      recommandations_simples: [
        "Compte 4 à 8 semaines de délai entre la demande et la visite — anticipe par rapport à la date d'emménagement.",
        "Si tu passes par un électricien certifié, il peut faire le Consuel sans visite (formulaire jaune simplifié).",
      ],
      recommandations_techniques_DTU: [
        "Attestation Consuel obligatoire pour : neuf, rénovation totale, installation > 36 kVA.",
        "Formulaire jaune si artisan certifié, formulaire vert si auto-installation (visite obligatoire).",
        "Frais 2025 : ~140 € (vert) à ~165 € (vert avec visite).",
        "Délai de validité : 90 jours après émission, à transmettre à Enedis avec la demande de mise en service.",
      ],
      termes_techniques: [
        { terme: 'Consuel', definition_simple: "Organisme indépendant qui contrôle la conformité d'une installation électrique avant mise sous tension." },
        { terme: 'attestation Consuel', definition_simple: "Le papier officiel délivré après contrôle. Sans lui, Enedis ne branche rien." },
        { terme: 'formulaire jaune / vert', definition_simple: "Jaune = installation par pro certifié, pas de visite. Vert = auto-installation, visite obligatoire." },
      ],
      materiel_conseille: ['Schéma unifilaire à jour', 'Relevés de mesures de l\'étape 7', 'Photos du tableau et de l\'installation', 'Formulaire Consuel rempli'],
    },
  ],
};

export default electricite;
