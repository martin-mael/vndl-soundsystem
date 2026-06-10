# Système son audiophile transportable en vélo cargo — Dossier de construction

**Version 1 — juin 2026**

Deux subwoofers 15″ et deux têtes deux-voies, pilotés par DSP rackable, dimensionnés pour tenir sur le plateau d'un Douze (850 × 600 mm) et sonoriser 100 à 150 personnes en intérieur comme en extérieur — DJ, électro, disco, funk, reggae et petits concerts.

| Indicateur | Valeur |
|---|---|
| Budget total estimé | **~2 050 €** (marge ~950 € sous 3 000 €) |
| Plateau vélo | 850 × 600 mm (bordé, zéro débord) |
| Composition | 2 subs + 2 têtes |
| Bande sub | 35–150 Hz |

---

## Sommaire

1. [Le système en bref](#1-le-système-en-bref)
2. [La contrainte vélo](#2-la-contrainte-vélo)
3. [Subwoofers 15″](#3-subwoofers-15)
4. [Têtes deux-voies](#4-têtes-deux-voies)
5. [Pilotage & routage](#5-pilotage--routage)
6. [Réglages DSP & presets](#6-réglages-dsp--presets)
7. [Liste d'achat (BOM)](#7-liste-dachat-bom)
8. [Limites assumées](#8-limites-assumées)
9. [Séquence de montage](#9-séquence-de-montage)
10. [Outils & références](#10-outils--références)

---

## 1. Le système en bref

Le projet réconcilie trois objectifs apparemment contradictoires — qualité « audiophile », niveau PA pour 100-150 personnes, et double usage scène / studio — grâce à une seule décision d'architecture : un **système actif multi-voies piloté par DSP**. En maîtrisant le filtrage, l'alignement, l'égalisation et la limitation en numérique, on obtient à la fois la précision et la protection des composants, dans des éléments rackables et transportables.

**Composition retenue :**

- **2 subwoofers 15″** — caisson reflex à évent en fente d'après le plan MrFlexy SMPS « 15″ bassreflex modifié », driver **Beyma 15LX60V2/S** (cône traité étanche), contreplaqué bouleau 15 mm.
- **2 têtes deux-voies** — plan Celestion « BUILD THIS! Two-Way 12″ Ported » : 12″ TF1225 + moteur 1″ CDX1-1425 + pavillon H1-9040P, filtre passif interne.
- **Pilotage** — DSP **t.racks DSP 4x4 Mini Pro** (4 entrées / 4 sorties XLR, rack 1U, 3 presets en façade) + ampli **the t.amp TSA 4-300** (4×350 W / 8 Ω).
- **Mesure** — micro **miniDSP UMIK-1** + logiciel REW (gratuit) pour la calibration.

> **Principe** : les subs tournent en mono (somme L+R, grave centré, idéal en électro), les têtes en stéréo. Tout le filtrage sub/têtes se fait dans le DSP ; chaque tête garde son filtre passif interne entre le 12″ et le moteur.

---

## 2. La contrainte vélo

Le plateau du vélo cargo (Douze) mesure **850 × 600 mm** et il est bordé par le cadre : **aucun débord possible**. C'est cette contrainte qui dimensionne les subs.

- Deux caissons posés côte à côte le long des 850 mm → chacun doit faire **425 mm** de large (425 + 425 = 850 pile).
- La profondeur de chaque caisson est de **600 mm**, soit exactement la largeur du berceau.
- Les têtes viennent s'empiler par-dessus pour le transport.

Le plan d'origine fait 430 mm de large ; on rabote donc **5 mm par caisson**. Cette réduction est acoustiquement négligeable (~1 % de volume), mais elle a une conséquence directe sur le montage du haut-parleur (voir §3).

> **Option de confort** : à 425 + 425 = 850 mm pile, les caissons seront au contact dans le berceau. Pour 2-3 mm de jeu au chargement, on peut les faire à **424 mm** (848 au total) — le HP rentre toujours.

---

## 3. Subwoofers 15″

Caisson reflex à évent en fente, driver monté **par l'arrière (rear mount)**. Dimensions externes par caisson : **425 (l) × 559 (h) × 600 (p) mm**, contreplaqué bouleau **15 mm** partout.

Cohérence des cotes : 559 − 30 = 529 et 430 − 30 = 400 confirment le double-paroi de 15 mm ; 250 − 235 = 15 confirme l'épaisseur de la tablette d'évent.

### Liste de coupe — par caisson (15 mm)

> ×2 pour les deux subs. Largeur ramenée à 425 (ou 424). Cotes en mm.

| Panneau | Dimensions | Qté | Notes |
|---|---|---|---|
| Dessus + dessous | 425 × 600 | 2 | Panneaux pleins (le caisson repose dessus) |
| Flancs (G/D) | 600 × 529 | 2 | Entre dessus et dessous |
| Arrière | 395 × 529 | 1 | Plein |
| Façade (cadre) | 395 × 529 | 1 | Ouverture HP 414 (haut) + bouche d'évent 115 (bas) |
| Tablette d'évent | 395 × 250 | 1 | ~235 de portée libre ; placée à 115 du fond |
| Baffle HP interne | 395 × 414 | 1 | Perçage Ø349,5 ; reculé ~50 mm |

**Renforts** : tasseaux d'angle 18-20 mm collés (D3) le long de toutes les arêtes internes — **sauf** dans les deux angles façade/flanc au niveau du HP (voir avertissement ci-dessous). Le baffle reculé et la tablette d'évent servent déjà de renforts transversaux des grandes faces.

### Driver — Beyma 15LX60V2/S

| Paramètre | Valeur | Paramètre | Valeur |
|---|---|---|---|
| Fs | 42 Hz | Ø extérieur | 388 mm |
| Qts | 0,44 | Cercle de perçage | 370 mm |
| Vas | 105 L | Découpe (montage avant) | 349,5 mm |
| Sd | 0,091 m² | Profondeur | 142 mm |
| Xmax | 8–9 mm | Puissance | 700 W AES |
| Sensibilité | 98 dB | Volume conseillé | 60 / 150 L |

Choisi pour son **cône traité étanche** (usage extérieur/vélo) et son diamètre extérieur compact (388 mm). Accord visé **Fb ≈ 38-42 Hz**, évent en fente 395 × 115 mm sur ~250 de long, volume net estimé ~105 L.

> **⚠ Montage HP — point critique**
> Avec la largeur ramenée à 425, le baffle interne fait 395 mm : le saladier de 388 mm ne laisse que **3,5 mm de chaque côté**. On monte donc le HP **par l'arrière** — en façade on ne perce que la découpe de 349,5 mm, le baffle reste plein et solide, et le saladier se loge à l'intérieur. On fixe le HP *avant* de refermer la caisse, et on vérifie que les retours de flanc ne touchent pas le bord du saladier. Dans ces deux angles précis, pas de tasseau épais : un simple congé de colle.

> **À faire avant de découper**
> Saisir le volume net (~105 L) et l'évent (395 × 115 mm, ~250 long) dans **WinISD** avec les paramètres T/S du Beyma pour valider la courbe (on peut descendre l'accord vers 40 Hz pour lisser, au prix d'un peu de niveau). Après montage, vérifier l'accord réel au REW (creux d'impédance entre les deux bosses = Fb).

---

## 4. Têtes deux-voies

Plan officiel gratuit **Celestion « BUILD THIS! Two-Way 12″ Ported Cabinet »** — caisson bass-reflex fournissant **cotes de découpe + schéma de filtre passif + liste de composants**. On le construit en bouleau 15 mm (pour rester cohérent avec les subs).

- **12″ grave-médium** : Celestion TF1225
- **Moteur 1″** : Celestion CDX1-1425
- **Pavillon** : Celestion H1-9040P (90 × 40)
- **Filtre passif** interne (valeurs et implantation dans le PDF Celestion)

Côté DSP, chaque tête reçoit simplement un passe-haut à 90 Hz ; le filtre passif interne gère la coupure 12″/moteur (~1,6-2 kHz). Avantage : pas de filtre à concevoir soi-même.

> **À récupérer** : les valeurs exactes des composants de filtre, les cotes de découpe et le diamètre/longueur de l'évent des têtes viennent du PDF Celestion — à relever avant de commander selfs et condensateurs.

---

## 5. Pilotage & routage

**t.racks DSP 4x4 Mini Pro** — 4 entrées / 4 sorties XLR symétriques, boîtier rack 1U, 3 boutons de preset en façade, configuration par USB (PC Windows). Le format XLR + équerre rack en fait le bon choix face au Mini standard (jacks 6,35).

**the t.amp TSA 4-300** — ampli 4 canaux, 4×350 W / 8 Ω (4×550 W / 4 Ω), pontable en 2×1000 W / 8 Ω. Entrées XLR — se branche directement sur le Mini Pro.

### Matrice de routage

> Entrées : In1 = L, In2 = R (table DJ / interface).

| Sortie DSP | Ampli | Destination | Signal |
|---|---|---|---|
| Out 1 | Canal 1 | Sub gauche | Mono (L + R) |
| Out 2 | Canal 2 | Sub droit | Mono (L + R) |
| Out 3 | Canal 3 | Tête gauche | L |
| Out 4 | Canal 4 | Tête droite | R |

---

## 6. Réglages DSP & presets

### Réglages de base (communs aux 3 presets)

| Sortie | Filtres | Pente |
|---|---|---|
| Subs (Out 1/2) | HPF 30 Hz + LPF 90 Hz | Linkwitz-Riley 24 dB/oct |
| Têtes (Out 3/4) | HPF 90 Hz (pas de LPF) | Linkwitz-Riley 24 dB/oct |

- **Subsonic 30 Hz** : protège le Beyma de la surexcursion sous l'accord du reflex.
- **Polarité** : tout en normal au départ ; au raccord 90 Hz, inverser les subs si la mesure montre un creux.
- **Délai** : 0 ms au départ, puis mesure (REW) — souvent un petit délai sur les têtes pour aligner.
- **Limiteurs** : têtes attaque 1-2 ms / release 80 ms (protège le moteur 1″) ; subs attaque 10 ms / release 250 ms. **À régler serré** : le maillon fragile est le moteur de compression.
- **Structure de gain**, dans l'ordre : source → entrée DSP sans écrêter (pointes ~−6 dBFS) → gains ampli → filtres → polarité/délais → EQ → limiteurs en dernier.

### Les 3 presets (boutons façade)

> La topologie ne change pas ; seuls le niveau et la courbe tonale varient.

| Preset | Réglage |
|---|---|
| **1 — Intérieur (100-150)** | Léger low-shelf +2 dB sous 80 Hz ; si la salle « boome », −2 à 3 dB vers 100-160 Hz ; sub calé un poil sous les têtes. |
| **2 — Extérieur** | Pas de gain de salle → low-shelf +3 à 4 dB sous ~80 Hz, niveau global plus haut. Limiteurs d'autant plus importants. |
| **3 — Studio** | Cible plate, pas de courbe club, niveau bas, sub aligné pour le proche/moyen champ. Le preset « vérité » pour mixer. |

> **Calibration (une fois)** : avec REW + UMIK-1, mesurer les têtes seules, puis les subs seuls, puis le raccord à 90 Hz (ajuster délai/polarité pour une somme sans creux), puis l'EQ au PEQ, enfin les limiteurs. Sauvegarder en preset 1, dupliquer et ajuster pour 2 et 3.

---

## 7. Liste d'achat (BOM)

> Prix indicatifs (€), à confirmer chez les fournisseurs. PU = prix unitaire.

| Poste | Qté | PU | Total | Fournisseur |
|---|---:|---:|---:|---|
| Beyma 15LX60V2/S (sub 15″) | 2 | ~200 | 400 | SoundImports |
| Celestion TF1225 (12″) | 2 | ~110 | 220 | SoundImports |
| Celestion CDX1-1425 (moteur 1″) | 2 | ~60 | 120 | SoundImports |
| Celestion H1-9040P (pavillon) | 2 | ~30 | 60 | SoundImports |
| Composants filtre passif (2 têtes) | — | — | ~100 | SoundImports |
| Tubes d'évent (têtes) | 2 | — | ~15 | SoundImports |
| t.racks DSP 4x4 Mini Pro | 1 | ~155 | 155 | Thomann |
| the t.amp TSA 4-300 | 1 | ~159 | 159 | Thomann |
| miniDSP UMIK-1 | 1 | ~135 | 135 | SoundImports / Thomann |
| CP bouleau 15 mm — 2440×1220 | 4 | ~70 | ~280 | Négoce bois |
| Quincaillerie & finition* | — | — | ~383 | SoundImports / Thomann |
| Consommables atelier (colle D3, vis) | — | — | ~30 | Divers |
| **Total estimé** | | | **~2 057** | marge ~950 € sous 3 000 € |

*Quincaillerie : Speakon NL4 châssis ×6, câbles Speakon ×4, poignées encastrées ×8-10, coins de protection ×32, pieds ×8, grille perforée (2 têtes), T-nuts + boulons (6 HP), joint mousse d'étanchéité, ouate acoustique, Warnex ~5 kg + rouleau texturé.

> **Prix à surveiller** : le Beyma 15LX60V2/S est plutôt à **180-220 €** selon stock. Alternative non étanche et moins chère : FaitalPro 15FH520 (~150 €). Le PC Windows pour configurer le DSP est supposé déjà disponible (0 €).

---

## 8. Limites assumées

- **Puissance des subs.** L'ampli donne ~350 W par 8 Ω pour des Beyma de 700 W : confortable pour 100-150 personnes en intérieur, mais juste pour 200 ou en extérieur à fort niveau. Évolution n°1 : un ampli de basses dédié (ex. the t.amp E-1500, 2×850 W / 8 Ω) et, à terme, deux subs de plus.
- **Extension grave.** Caisson compact + Xmax 8 mm = grave **solide et punchy avec un F3 vers 50 Hz**, mais le sub-bass très profond (30-40 Hz) reste limité. C'est le prix de la portabilité vélo.
- **Double usage têtes.** Ce sont d'excellentes têtes PA et de bonnes principales en champ moyen + sub, mais pour du mixage très critique en proche-champ, des moniteurs dédiés resteraient plus précis.
- **À valider.** Volume net dans WinISD avant découpe ; valeurs de filtre depuis le PDF Celestion ; prix indicatifs à confirmer.

---

## 9. Séquence de montage

1. Valider le sub dans **WinISD** (volume net + évent) avec les T/S du Beyma. Ajuster l'accord si besoin.
2. Relever sur le PDF Celestion la **liste de coupe des têtes** et les **valeurs de filtre**, puis commander les composants.
3. **Calepiner et débiter** les 4 plaques de 15 mm (subs largeur 425 + têtes), en visant le minimum de chutes.
4. Monter les caisses subs : coller baffle reculé + tablette d'évent + tasseaux d'angle ; **monter le HP par l'arrière avant fermeture** ; soigner l'étanchéité (joint mousse, congés de colle).
5. Monter les têtes : filtre passif, ouate, évent ; visser HP et moteur.
6. Finition : Warnex, poignées, coins, embases Speakon, grilles.
7. Câbler le rack : Mini Pro → TSA 4-300 → Speakon vers les caissons.
8. Configurer le DSP : routage, filtres, polarité, délais à 0, **limiteurs conservateurs**.
9. Calibrer au REW + UMIK-1 (têtes seules, subs seuls, raccord, EQ, limiteurs) et sauvegarder les 3 presets.

---

## 10. Outils & références

### Outils nécessaires

- Atelier bois (scie de précision, défonceuse pour la découpe HP)
- PC Windows pour configurer le DSP Mini Pro
- Micro de mesure UMIK-1
- **REW** (Room EQ Wizard) — gratuit
- **WinISD** — simulation de caisson, gratuit
- Optimiseur de découpe (ex. OpenCutList pour SketchUp)

### Plans & sources

- Sub : plan MrFlexy SMPS « 15″ bassreflex modifié » (YouTube)
- Têtes : Celestion « BUILD THIS! Two-Way 12″ Ported » (celestion.com)
- Banque de plans : freespeakerplans.com
- Drivers & composants : soundimports.eu
- DSP, ampli, micro : thomann.de

---

*Document de travail. Tous les prix sont des ordres de grandeur à confirmer auprès des fournisseurs au moment de l'achat. Les cotes de découpe des têtes et les valeurs de filtre proviennent du plan Celestion d'origine ; le volume net des subs doit être validé en simulation (WinISD) avant toute découpe. Plans de caissons réutilisés à des fins de construction personnelle.*
