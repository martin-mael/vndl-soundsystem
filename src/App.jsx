import { lazy, Suspense } from 'react'
import CutPlan from './components/CutPlan.jsx'

const CabinetViewer = lazy(() => import('./components/CabinetViewer.jsx'))
const HeadViewer = lazy(() => import('./components/HeadViewer.jsx'))

// Pièces de coupe des têtes (CP 15 mm, dimensions internes du plan Celestion)
const HEAD_PIECES = [
  { name: 'Dessus / dessous', short: 'Dessus/dessous', w: 380, h: 300, qty: 2, color: '#d9c08a', fixed: true, trap: { front: 380, back: 274.5, depth: 278, curve: 22 } },
  {
    name: 'Façade',
    w: 380,
    h: 597,
    qty: 1,
    color: '#d2bd92',
    fixed: true,
    cutouts: [
      { type: 'rect', w: 265, h: 165, dx: 0, dy: -185 },
      { type: 'circle', d: 278, dx: 0, dy: 55 },
      { type: 'circle', d: 75, dx: -100, dy: 238 },
      { type: 'circle', d: 75, dx: 100, dy: 238 },
    ],
  },
  { name: 'Arrière', w: 274.5, h: 597, qty: 1, color: '#e0cfa6', fixed: true },
  { name: 'Flanc G/D', short: 'Flanc', w: 283, h: 597, qty: 2, color: '#cdb079', fixed: true },
]
const HEAD_EXTRAS = [
  '4 × tubes d’évent Ø75 (ID) × 165 mm (2 par tête)',
  'Filtre passif Celestion par tête : self 1,6 mH, self 0,16 mH, condos 10/8/3 µF, résistance 10 Ω 25 W',
  'Pavillon H1-9040P, moteur 1″ CDX1-1425, 12″ TF1225, 4 T-nuts M5 / Ø297 PCD',
]
const HEAD_NOTE =
  'Calepinage indicatif des 2 têtes (CP bouleau 15 mm, dimensions internes conservées du plan Celestion GA878). Dessus/dessous = trapèzes (380 av. → 274,5 arr., contour ocre = chute du flan rectangulaire). Façade : pavillon 265×165, HP Ø278, 2 évents Ø75. Flancs en biais débités droits (283 × 597). Cotes en mm.'

const DimLine = ({ className = '' }) => (
  <div className={`dimline ${className}`.trim()}>
    <span className="bar"></span>
  </div>
)

const Section = ({ id, num, title, children }) => (
  <section id={id}>
    <div className="sec-head">
      <span className="sec-num">{num}</span>
      <h2>{title}</h2>
    </div>
    <DimLine className="sec-divider" />
    {children}
  </section>
)

const Note = ({ tag, children }) => (
  <div className="note">
    <span className="tag">{tag}</span>
    <p>{children}</p>
  </div>
)

const Tip = ({ tag, children }) => (
  <div className="tip">
    <span className="tag">{tag}</span>
    <p>{children}</p>
  </div>
)

const heroSpecs = [
  { val: <><em>~2 050</em>&nbsp;€</>, lab: 'Budget total estimé' },
  { val: '850×600', lab: 'Plateau vélo (mm)' },
  { val: '2 + 2', lab: 'Subs + têtes' },
  { val: '35–150', lab: 'Bande sub (Hz)' },
]

const tocItems = [
  { href: '#systeme', label: 'Le système en bref' },
  { href: '#contrainte', label: 'La contrainte vélo' },
  { href: '#subs', label: 'Subwoofers 15″' },
  { href: '#tetes', label: 'Têtes deux-voies' },
  { href: '#pilotage', label: 'Pilotage & routage' },
  { href: '#dsp', label: 'Réglages DSP & presets' },
  { href: '#bom', label: "Liste d'achat (BOM)" },
  { href: '#limites', label: 'Limites assumées' },
  { href: '#montage', label: 'Séquence de montage' },
  { href: '#refs', label: 'Outils & références' },
]

const driverSpecs = [
  ['Fs', '42 Hz'],
  ['Qts', '0,44'],
  ['Vas', '105 L'],
  ['Sd', '0,091 m²'],
  ['Xmax', '8–9 mm'],
  ['Puissance', '700 W AES'],
  ['Sensibilité', '98 dB'],
  ['Ø extérieur', '388 mm'],
  ['Cercle perçage', '370 mm'],
  ['Découpe', '349,5 mm'],
  ['Profondeur', '142 mm'],
  ['Volume conseillé', '60 / 150 L'],
]

export default function App() {
  return (
    <>
      <header className="hero">
        <div className="wrap">
          <div className="eyebrow">Dossier de construction · v1 · juin 2026</div>
          <h1>
            Système son <span className="blueword">haute-fidélité</span>, transportable en vélo cargo.
          </h1>
          <p className="lede">
            Deux subwoofers 15″ et deux têtes deux-voies, pilotés par DSP rackable, dimensionnés
            pour tenir sur le plateau d'un Douze (850&nbsp;×&nbsp;600&nbsp;mm) et sonoriser 100 à
            150 personnes en intérieur comme en extérieur — DJ, électro, disco, funk, reggae et
            petits concerts.
          </p>
          <div className="specrow">
            {heroSpecs.map((s, i) => (
              <div className="spec" key={i}>
                <div className="val">{s.val}</div>
                <DimLine />
                <div className="lab">{s.lab}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className="grid">
          <nav className="toc" aria-label="Sommaire">
            <div className="tochead">Sommaire</div>
            <ol>
              {tocItems.map((t) => (
                <li key={t.href}>
                  <a href={t.href}>{t.label}</a>
                </li>
              ))}
            </ol>
          </nav>

          <main>
            <Section id="systeme" num="01" title="Le système en bref">
              <p>
                Le projet réconcilie trois objectifs qui semblent contradictoires — qualité
                haute-fidélité, niveau PA pour 100-150 personnes, et double usage scène / studio —
                grâce à une seule décision d'architecture : un{' '}
                <strong>système actif multi-voies piloté par DSP</strong>. En maîtrisant le
                filtrage, l'alignement, l'égalisation et la limitation en numérique, on obtient à la
                fois la précision et la protection des composants, dans des éléments rackables et
                transportables.
              </p>

              <h3>Composition retenue</h3>
              <ul>
                <li>
                  <strong>2 subwoofers 15″</strong> — caisson reflex à évent en fente d'après le
                  plan MrFlexy SMPS « 15″ bassreflex modifié », driver{' '}
                  <strong>Beyma 15LX60V2/S</strong> (cône traité étanche), contreplaqué bouleau
                  15&nbsp;mm.
                </li>
                <li>
                  <strong>2 têtes deux-voies</strong> — plan Celestion « BUILD THIS! Two-Way 12″
                  Ported » : 12″ TF1225 + moteur 1″ CDX1-1425 + pavillon H1-9040P, filtre passif
                  interne.
                </li>
                <li>
                  <strong>Pilotage</strong> — DSP <strong>t.racks DSP 4x4 Mini Pro</strong> (4
                  entrées / 4 sorties XLR, rack 1U, 3 presets en façade) + ampli{' '}
                  <strong>the t.amp TSA 4-300</strong> (4×350 W / 8&nbsp;Ω).
                </li>
                <li>
                  <strong>Mesure</strong> — micro <strong>miniDSP UMIK-1</strong> + logiciel REW
                  (gratuit) pour la calibration.
                </li>
              </ul>
              <Tip tag="Principe">
                Les subs tournent en mono (somme L+R, grave centré, idéal en électro), les têtes en
                stéréo. Tout le filtrage sub/têtes se fait dans le DSP ; chaque tête garde son filtre
                passif interne entre le 12″ et le moteur.
              </Tip>
            </Section>

            <Section id="contrainte" num="02" title="La contrainte vélo">
              <p>
                Le plateau du vélo cargo (Douze) mesure <strong>850 × 600 mm</strong> et il est
                bordé par le cadre : <strong>aucun débord possible</strong>. C'est cette contrainte
                qui dimensionne les subs.
              </p>
              <ul>
                <li>
                  Deux caissons posés côte à côte le long des 850 mm → chacun doit faire{' '}
                  <strong>425 mm</strong> de large (425 + 425 = 850 pile).
                </li>
                <li>
                  La profondeur de chaque caisson est de <strong>600 mm</strong>, soit exactement la
                  largeur du berceau.
                </li>
                <li>Les têtes viennent s'empiler par-dessus pour le transport.</li>
              </ul>
              <p>
                Le plan d'origine fait 430 mm de large ; on rabote donc <strong>5 mm par caisson</strong>.
                Cette réduction est acoustiquement négligeable (~1 % de volume), mais elle a une
                conséquence directe sur le montage du haut-parleur (voir §03).
              </p>
              <Note tag="Option de confort">
                À 425 + 425 = 850 mm pile, les caissons seront au contact dans le berceau. Pour 2-3
                mm de jeu au chargement, on peut les faire à <strong>424 mm</strong> (848 au total) —
                le HP rentre toujours.
              </Note>
            </Section>

            <Section id="subs" num="03" title="Subwoofers 15″">
              <p>
                Caisson reflex à évent en fente, driver monté{' '}
                <strong>par l'arrière (rear mount)</strong>. Dimensions externes par caisson :{' '}
                <span className="b mono">425 (l) × 559 (h) × 600 (p) mm</span>, contreplaqué bouleau{' '}
                <strong>15 mm</strong> partout. Cohérence des cotes : 559 − 30 = 529 et 430 − 30 =
                400 confirment le double-paroi de 15 mm.
              </p>

              <h3>Vue 3D du caisson</h3>
              <Suspense
                fallback={<div className="viewer-fallback">Chargement de la vue 3D…</div>}
              >
                <CabinetViewer />
              </Suspense>

              <h3>Liste de coupe — par caisson (15 mm)</h3>
              <div className="tablewrap">
                <table>
                  <caption>
                    ×2 pour les deux subs. Largeur ramenée à 425 (ou 424). Cotes en mm.
                  </caption>
                  <thead>
                    <tr>
                      <th>Panneau</th>
                      <th className="num">Dimensions</th>
                      <th className="num">Qté</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Dessus + dessous</td>
                      <td className="num">425 × 600</td>
                      <td className="num">2</td>
                      <td>Panneaux pleins (le caisson repose dessus)</td>
                    </tr>
                    <tr>
                      <td>Flancs (G/D)</td>
                      <td className="num">600 × 529</td>
                      <td className="num">2</td>
                      <td>Entre dessus et dessous</td>
                    </tr>
                    <tr>
                      <td>Arrière</td>
                      <td className="num">395 × 529</td>
                      <td className="num">1</td>
                      <td>Plein</td>
                    </tr>
                    <tr>
                      <td>Façade (cadre)</td>
                      <td className="num">395 × 529</td>
                      <td className="num">1</td>
                      <td>Ouverture HP 414 (haut) + bouche d'évent 115 (bas)</td>
                    </tr>
                    <tr>
                      <td>Tablette d'évent</td>
                      <td className="num">395 × 250</td>
                      <td className="num">1</td>
                      <td>~235 de portée libre ; placée à 115 du fond</td>
                    </tr>
                    <tr>
                      <td>Baffle HP interne</td>
                      <td className="num">395 × 414</td>
                      <td className="num">1</td>
                      <td>Perçage Ø349,5 ; reculé ~50 mm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                Renforts : <strong>tasseaux d'angle 18-20 mm</strong> collés (D3) le long de toutes
                les arêtes internes — sauf dans les deux angles façade/flanc au niveau du HP (voir
                avertissement). Le baffle reculé et la tablette d'évent servent déjà de renforts
                transversaux des grandes faces.
              </p>

              <h3>Plan de coupe (calepinage)</h3>
              <CutPlan />

              <h3>Driver — Beyma 15LX60V2/S</h3>
              <div className="specgrid">
                {driverSpecs.map(([k, v]) => (
                  <div key={k}>
                    <div className="k">{k}</div>
                    <div className="v">{v}</div>
                  </div>
                ))}
              </div>
              <p>
                Choisi pour son <strong>cône traité étanche</strong> (usage extérieur/vélo) et son
                diamètre extérieur compact (388 mm). Accord visé{' '}
                <span className="b mono">Fb ≈ 38-42 Hz</span>, évent en fente{' '}
                <span className="mono">395 × 115 mm</span> sur ~250 de long, volume net estimé ~105
                L.
              </p>

              <Note tag="Montage HP — point critique">
                Avec la largeur ramenée à 425, le baffle interne fait 395 mm : le saladier de 388 mm
                ne laisse que <strong>3,5 mm de chaque côté</strong>. On monte donc le HP{' '}
                <strong>par l'arrière</strong> — en façade on ne perce que la découpe de 349,5 mm, le
                baffle reste plein et solide, et le saladier se loge à l'intérieur. On fixe le HP{' '}
                <em>avant</em> de refermer la caisse, et on vérifie que les retours de flanc ne
                touchent pas le bord du saladier. Dans ces deux angles précis, pas de tasseau épais :
                un simple congé de colle.
              </Note>
              <Tip tag="À faire avant de découper">
                Saisir le volume net (~105 L) et l'évent (395 × 115 mm, ~250 long) dans{' '}
                <strong>WinISD</strong> avec les paramètres T/S du Beyma pour valider la courbe (on
                peut descendre l'accord vers 40 Hz pour lisser, au prix d'un peu de niveau). Après
                montage, vérifier l'accord réel au REW (creux d'impédance entre les deux bosses =
                Fb).
              </Tip>
            </Section>

            <Section id="tetes" num="04" title="Têtes deux-voies">
              <p>
                Plan officiel gratuit{' '}
                <strong>Celestion « BUILD THIS! Two-Way 12″ Ported Cabinet »</strong> — caisson
                bass-reflex fournissant{' '}
                <strong>cotes de découpe + schéma de filtre passif + liste de composants</strong>. On
                le construit en bouleau 15 mm (pour rester cohérent avec les subs).
              </p>
              <ul>
                <li>
                  <strong>12″ grave-médium</strong> : Celestion TF1225
                </li>
                <li>
                  <strong>Moteur 1″</strong> : Celestion CDX1-1425
                </li>
                <li>
                  <strong>Pavillon</strong> : Celestion H1-9040P (90×40)
                </li>
                <li>
                  <strong>Filtre passif</strong> interne (valeurs et implantation dans le PDF
                  Celestion)
                </li>
              </ul>
              <p>
                Côté DSP, chaque tête reçoit simplement un passe-haut à 90 Hz ; le filtre passif
                interne gère la coupure 12″/moteur (~1,6-2 kHz). Avantage : pas de filtre à concevoir
                soi-même.
              </p>
              <Note tag="À récupérer">
                Les <strong>valeurs exactes des composants de filtre</strong>, les{' '}
                <strong>cotes de découpe</strong> et le{' '}
                <strong>diamètre/longueur de l'évent</strong> des têtes viennent du PDF Celestion — à
                relever avant de commander selfs et condensateurs.
              </Note>

              <h3>Vue 3D de la tête</h3>
              <Suspense fallback={<div className="viewer-fallback">Chargement de la vue 3D…</div>}>
                <HeadViewer />
              </Suspense>

              <h3>Plan de coupe (calepinage)</h3>
              <CutPlan pieces={HEAD_PIECES} battens={[]} extras={HEAD_EXTRAS} note={HEAD_NOTE} subs={2} />
            </Section>

            <Section id="pilotage" num="05" title="Pilotage & routage">
              <div className="cols">
                <div>
                  <h3>t.racks DSP 4x4 Mini Pro</h3>
                  <p>
                    4 entrées / 4 sorties <strong>XLR</strong> symétriques, boîtier rack{' '}
                    <strong>1U</strong>, 3 boutons de preset en façade, configuration par USB (PC
                    Windows). Le format XLR + équerre rack en fait le bon choix face au Mini standard
                    (jacks 6,35).
                  </p>
                </div>
                <div>
                  <h3>the t.amp TSA 4-300</h3>
                  <p>
                    Ampli 4 canaux, <strong>4×350 W / 8&nbsp;Ω</strong> (4×550 W / 4&nbsp;Ω),
                    pontable en 2×1000 W / 8&nbsp;Ω. Entrées XLR — se branche directement sur le Mini
                    Pro.
                  </p>
                </div>
              </div>
              <h3>Matrice de routage</h3>
              <div className="tablewrap">
                <table>
                  <caption>Entrées : In1 = L, In2 = R (table DJ / interface).</caption>
                  <thead>
                    <tr>
                      <th>Sortie DSP</th>
                      <th>Ampli</th>
                      <th>Destination</th>
                      <th>Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Out 1</td>
                      <td>Canal 1</td>
                      <td>Sub gauche</td>
                      <td>Mono (L + R)</td>
                    </tr>
                    <tr>
                      <td>Out 2</td>
                      <td>Canal 2</td>
                      <td>Sub droit</td>
                      <td>Mono (L + R)</td>
                    </tr>
                    <tr>
                      <td>Out 3</td>
                      <td>Canal 3</td>
                      <td>Tête gauche</td>
                      <td>L</td>
                    </tr>
                    <tr>
                      <td>Out 4</td>
                      <td>Canal 4</td>
                      <td>Tête droite</td>
                      <td>R</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="dsp" num="06" title="Réglages DSP & presets">
              <h3>Réglages de base (communs aux 3 presets)</h3>
              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th>Sortie</th>
                      <th>Filtres</th>
                      <th>Pente</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Subs (Out 1/2)</td>
                      <td>HPF 30 Hz + LPF 90 Hz</td>
                      <td>Linkwitz-Riley 24 dB/oct</td>
                    </tr>
                    <tr>
                      <td>Têtes (Out 3/4)</td>
                      <td>HPF 90 Hz (pas de LPF)</td>
                      <td>Linkwitz-Riley 24 dB/oct</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ul>
                <li>
                  <strong>Subsonic 30 Hz</strong> : protège le Beyma de la surexcursion sous l'accord
                  du Cubo/reflex.
                </li>
                <li>
                  <strong>Polarité</strong> : tout en normal au départ ; au raccord 90 Hz, inverser
                  les subs si la mesure montre un creux.
                </li>
                <li>
                  <strong>Délai</strong> : 0 ms au départ, puis mesure (REW) — souvent un petit délai
                  sur les têtes pour aligner.
                </li>
                <li>
                  <strong>Limiteurs</strong> : têtes attaque 1-2 ms / release 80 ms (protège le
                  moteur 1″) ; subs attaque 10 ms / release 250 ms. <strong>À régler serré</strong> :
                  le maillon fragile est le moteur de compression.
                </li>
                <li>
                  <strong>Structure de gain</strong>, dans l'ordre : source → entrée DSP sans écrêter
                  (pointes ~−6 dBFS) → gains ampli → filtres → polarité/délais → EQ → limiteurs en
                  dernier.
                </li>
              </ul>

              <h3>Les 3 presets (boutons façade)</h3>
              <div className="tablewrap">
                <table>
                  <caption>
                    La topologie ne change pas ; seuls le niveau et la courbe tonale varient.
                  </caption>
                  <thead>
                    <tr>
                      <th>Preset</th>
                      <th>Réglage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1 — Intérieur (100-150)</td>
                      <td>
                        Léger low-shelf +2 dB sous 80 Hz ; si la salle « boome », −2 à 3 dB vers
                        100-160 Hz ; sub calé un poil sous les têtes.
                      </td>
                    </tr>
                    <tr>
                      <td>2 — Extérieur</td>
                      <td>
                        Pas de gain de salle → low-shelf +3 à 4 dB sous ~80 Hz, niveau global plus
                        haut. Limiteurs d'autant plus importants.
                      </td>
                    </tr>
                    <tr>
                      <td>3 — Studio</td>
                      <td>
                        Cible plate, pas de courbe club, niveau bas, sub aligné pour le proche/moyen
                        champ. Le preset « vérité » pour mixer.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <Tip tag="Calibration (une fois)">
                Avec REW + UMIK-1 : mesurer les têtes seules, puis les subs seuls, puis le raccord à
                90 Hz (ajuster délai/polarité pour une somme sans creux), puis l'EQ au PEQ, enfin les
                limiteurs. Sauvegarder en preset 1, dupliquer et ajuster pour 2 et 3.
              </Tip>
            </Section>

            <Section id="bom" num="07" title="Liste d'achat (BOM)">
              <div className="tablewrap">
                <table>
                  <caption>
                    Prix indicatifs (€), à confirmer chez les fournisseurs. PU = prix unitaire.
                  </caption>
                  <thead>
                    <tr>
                      <th>Poste</th>
                      <th className="num">Qté</th>
                      <th className="num">PU</th>
                      <th className="num">Total</th>
                      <th>Fournisseur</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Beyma 15LX60V2/S (sub 15″)</td>
                      <td className="num">2</td>
                      <td className="num">~200</td>
                      <td className="num">400</td>
                      <td>SoundImports</td>
                    </tr>
                    <tr>
                      <td>Celestion TF1225 (12″)</td>
                      <td className="num">2</td>
                      <td className="num">~110</td>
                      <td className="num">220</td>
                      <td>SoundImports</td>
                    </tr>
                    <tr>
                      <td>Celestion CDX1-1425 (moteur 1″)</td>
                      <td className="num">2</td>
                      <td className="num">~60</td>
                      <td className="num">120</td>
                      <td>SoundImports</td>
                    </tr>
                    <tr>
                      <td>Celestion H1-9040P (pavillon)</td>
                      <td className="num">2</td>
                      <td className="num">~30</td>
                      <td className="num">60</td>
                      <td>SoundImports</td>
                    </tr>
                    <tr>
                      <td>Composants filtre passif (2 têtes)</td>
                      <td className="num">—</td>
                      <td className="num">—</td>
                      <td className="num">~100</td>
                      <td>SoundImports</td>
                    </tr>
                    <tr>
                      <td>Tubes d'évent (têtes)</td>
                      <td className="num">2</td>
                      <td className="num">—</td>
                      <td className="num">~15</td>
                      <td>SoundImports</td>
                    </tr>
                    <tr>
                      <td>t.racks DSP 4x4 Mini Pro</td>
                      <td className="num">1</td>
                      <td className="num">~155</td>
                      <td className="num">155</td>
                      <td>Thomann</td>
                    </tr>
                    <tr>
                      <td>the t.amp TSA 4-300</td>
                      <td className="num">1</td>
                      <td className="num">~159</td>
                      <td className="num">159</td>
                      <td>Thomann</td>
                    </tr>
                    <tr>
                      <td>miniDSP UMIK-1</td>
                      <td className="num">1</td>
                      <td className="num">~135</td>
                      <td className="num">135</td>
                      <td>SoundImports / Thomann</td>
                    </tr>
                    <tr>
                      <td>CP bouleau 15 mm — 2440×1220</td>
                      <td className="num">4</td>
                      <td className="num">~70</td>
                      <td className="num">~280</td>
                      <td>Négoce bois</td>
                    </tr>
                    <tr>
                      <td>Quincaillerie & finition*</td>
                      <td className="num">—</td>
                      <td className="num">—</td>
                      <td className="num">~383</td>
                      <td>SoundImports / Thomann</td>
                    </tr>
                    <tr>
                      <td>Consommables atelier (colle D3, vis)</td>
                      <td className="num">—</td>
                      <td className="num">—</td>
                      <td className="num">~30</td>
                      <td>Divers</td>
                    </tr>
                    <tr className="total">
                      <td>Total estimé</td>
                      <td className="num"></td>
                      <td className="num"></td>
                      <td className="num">~2 057</td>
                      <td>marge ~950 € sous 3 000 €</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--ink-mute)' }}>
                * Quincaillerie : Speakon NL4 châssis ×6, câbles Speakon ×4, poignées encastrées
                ×8-10, coins de protection ×32, pieds ×8, grille perforée (2 têtes), T-nuts + boulons
                (6 HP), joint mousse d'étanchéité, ouate acoustique, Warnex ~5 kg + rouleau texturé.
              </p>
              <Note tag="Prix à surveiller">
                Le Beyma 15LX60V2/S est plutôt à <strong>180-220 €</strong> selon stock. Alternative
                non étanche et moins chère : FaitalPro 15FH520 (~150 €). Le PC Windows pour
                configurer le DSP est supposé déjà disponible (0 €).
              </Note>
            </Section>

            <Section id="limites" num="08" title="Limites assumées">
              <ul>
                <li>
                  <strong>Puissance des subs.</strong> L'ampli donne ~350 W par 8 Ω pour des Beyma de
                  700 W : confortable pour 100-150 personnes en intérieur, mais juste pour 200 ou en
                  extérieur à fort niveau. Évolution n°1 : un ampli de basses dédié (ex. the t.amp
                  E-1500, 2×850 W / 8 Ω) et, à terme, deux subs de plus.
                </li>
                <li>
                  <strong>Extension grave.</strong> Caisson compact + Xmax 8 mm = grave{' '}
                  <strong>solide et punchy avec un F3 vers 50 Hz</strong>, mais le sub-bass très
                  profond (30-40 Hz) reste limité. C'est le prix de la portabilité vélo.
                </li>
                <li>
                  <strong>Double usage têtes.</strong> Ce sont d'excellentes têtes PA et de bonnes
                  principales en champ moyen + sub, mais pour du mixage très critique en
                  proche-champ, des moniteurs dédiés resteraient plus précis.
                </li>
                <li>
                  <strong>À valider.</strong> Volume net dans WinISD avant découpe ; valeurs de
                  filtre depuis le PDF Celestion ; prix indicatifs à confirmer.
                </li>
              </ul>
            </Section>

            <Section id="montage" num="09" title="Séquence de montage">
              <ol className="steps">
                <li>
                  Valider le sub dans <strong>WinISD</strong> (volume net + évent) avec les T/S du
                  Beyma. Ajuster l'accord si besoin.
                </li>
                <li>
                  Relever sur le PDF Celestion la <strong>liste de coupe des têtes</strong> et les{' '}
                  <strong>valeurs de filtre</strong>, puis commander les composants.
                </li>
                <li>
                  <strong>Calepiner et débiter</strong> les 4 plaques de 15 mm (subs largeur 425 +
                  têtes), en visant le minimum de chutes.
                </li>
                <li>
                  Monter les caisses subs : coller baffle reculé + tablette d'évent + tasseaux
                  d'angle ; soigner l'étanchéité (joint mousse, congés de colle).
                </li>
                <li>Monter les têtes : filtre passif, ouate, évent ; visser HP et moteur.</li>
                <li>Finition : Warnex, poignées, coins, embases Speakon, grilles.</li>
                <li>Câbler le rack : Mini Pro → TSA 4-300 → Speakon vers les caissons.</li>
                <li>
                  Configurer le DSP : routage, filtres, polarité, délais à 0,{' '}
                  <strong>limiteurs conservateurs</strong>.
                </li>
                <li>
                  Calibrer au REW + UMIK-1 (têtes seules, subs seuls, raccord, EQ, limiteurs) et
                  sauvegarder les 3 presets.
                </li>
              </ol>
            </Section>

            <Section id="refs" num="10" title="Outils & références">
              <div className="cols">
                <div>
                  <h3>Outils nécessaires</h3>
                  <ul>
                    <li>Atelier bois (scie de précision, défonceuse pour la découpe HP)</li>
                    <li>PC Windows pour configurer le DSP Mini Pro</li>
                    <li>Micro de mesure UMIK-1</li>
                    <li>
                      <strong>REW</strong> (Room EQ Wizard) — gratuit
                    </li>
                    <li>
                      <strong>WinISD</strong> — simulation de caisson, gratuit
                    </li>
                    <li>Optimiseur de découpe (ex. OpenCutList pour SketchUp)</li>
                  </ul>
                </div>
                <div>
                  <h3>Plans & sources</h3>
                  <ul>
                    <li>Sub : plan MrFlexy SMPS « 15″ bassreflex modifié » (YouTube)</li>
                    <li>Têtes : Celestion « BUILD THIS! Two-Way 12″ Ported » (celestion.com)</li>
                    <li>Banque de plans : freespeakerplans.com</li>
                    <li>Drivers & composants : soundimports.eu</li>
                    <li>DSP, ampli, micro : thomann.de</li>
                  </ul>
                </div>
              </div>
            </Section>
          </main>
        </div>
      </div>

      <footer>
        <div className="wrap">
          <div className="sig">Dossier de construction — système son cargo</div>
          <p className="disc">
            Document de travail. Tous les prix sont des ordres de grandeur à confirmer auprès des
            fournisseurs au moment de l'achat. Les cotes de découpe des têtes et les valeurs de
            filtre proviennent du plan Celestion d'origine ; le volume net des subs doit être validé
            en simulation (WinISD) avant toute découpe. Plans de caissons réutilisés à des fins de
            construction personnelle.
          </p>
        </div>
      </footer>
    </>
  )
}
