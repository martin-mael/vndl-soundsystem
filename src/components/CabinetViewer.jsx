import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Edges, Line, Html, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

/*
  Caisson subwoofer 15" — plan MrFlexy SMPS « bassreflex modifié »,
  largeur ramenée à 425 mm (interne 395 mm) pour tenir 2 caissons sur
  le plateau 850 mm du vélo cargo.

  Toutes les cotes sont en millimètres ; le groupe est mis à l'échelle
  0.001 pour passer en mètres dans la scène three.js.
*/

// --- Cotes externes (mm) ---
const W = 425
const H = 559
const D = 600
const T = 15

const halfW = W / 2 // 212.5
const halfH = H / 2 // 279.5
const halfD = D / 2 // 300

const ihw = halfW - T // 197.5 — flanc interne
const ihd = halfD - T // 285 — face avant du panneau arrière
const itop = halfH - T // 264.5
const ibot = -halfH + T // -264.5

const VENT_RECESS = 20 // l'évent est rongé de 20 mm à l'avant (comme les flancs)
const SLOT = 115
const shelfTopY = ibot + SLOT // -149.5
const shelfThk = T
const shelfFrontZ = halfD - VENT_RECESS // 280
const shelfBackZ = halfD - 250 // 50 (inchangé)
const shelfDepth = shelfFrontZ - shelfBackZ // 230
const shelfCenterY = shelfTopY - shelfThk / 2 // -157
const shelfBottomY = shelfCenterY - shelfThk / 2 // -164.5
const shelfCenterZ = (shelfFrontZ + shelfBackZ) / 2 // 165

// renfort vertical central sous la tablette (rongé de 20 mm aussi)
const braceBackZ = halfD - 235 // 65
const braceDepth = shelfFrontZ - braceBackZ // 215
const braceCenterZ = (shelfFrontZ + braceBackZ) / 2 // 172.5

const RECESS = 50
const baffleH = 414
const baffleBottomY = shelfTopY // -149.5
const baffleTopY = itop // 264.5
const baffleCenterY = (baffleBottomY + baffleTopY) / 2 // 57.5
const baffleFrontZ = halfD - RECESS // 250
const baffleCenterZ = baffleFrontZ - T / 2 // 242.5
const holeR = 349.5 / 2

const WOOD_EDGE = '#5b4424'
const BLUE = '#2E54C8'
const L = 18 // section des tasseaux

// ---------- Texture bouleau procédurale ----------
let _wood
function woodTexture() {
  if (_wood) return _wood
  const s = 512
  const c = document.createElement('canvas')
  c.width = c.height = s
  const x = c.getContext('2d')
  x.fillStyle = '#d9bd8f'
  x.fillRect(0, 0, s, s)
  for (let i = 0; i < 80; i++) {
    const gx = Math.random() * s
    x.beginPath()
    x.strokeStyle = `rgba(${(115 + Math.random() * 45) | 0},${(82 + Math.random() * 35) | 0},${
      (44 + Math.random() * 30) | 0
    },${0.04 + Math.random() * 0.12})`
    x.lineWidth = 1 + Math.random() * 2.4
    x.moveTo(gx, 0)
    for (let y = 0; y <= s; y += 14) {
      x.lineTo(gx + Math.sin(y * 0.02 + gx) * 6 + (Math.random() - 0.5) * 3, y)
    }
    x.stroke()
  }
  for (let i = 0; i < 2600; i++) {
    x.fillStyle = `rgba(${(160 + Math.random() * 60) | 0},${(120 + Math.random() * 40) | 0},${
      (70 + Math.random() * 30) | 0
    },0.03)`
    x.fillRect(Math.random() * s, Math.random() * s, 2, 1)
  }
  _wood = new THREE.CanvasTexture(c)
  _wood.wrapS = _wood.wrapT = THREE.RepeatWrapping
  _wood.repeat.set(1.6, 1.6)
  _wood.anisotropy = 4
  return _wood
}

// ---------- Helpers géométrie (prismes triangulaires) ----------
function prism(t0, t1) {
  const [A0, B0, C0] = t0
  const [A1, B1, C1] = t1
  const v = []
  const tri = (p, q, r) => v.push(...p, ...q, ...r)
  tri(A0, B0, C0)
  tri(A1, C1, B1)
  tri(A0, A1, B1)
  tri(A0, B1, B0)
  tri(B0, B1, C1)
  tri(B0, C1, C0)
  tri(C0, C1, A1)
  tri(C0, A1, A0)
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
  g.computeVertexNormals()
  return g
}
// tasseau vertical (axe Y)
const vBatten = (x, z, dx, dz, y0, y1) =>
  prism(
    [[x, y0, z], [x + dx * L, y0, z], [x, y0, z + dz * L]],
    [[x, y1, z], [x + dx * L, y1, z], [x, y1, z + dz * L]],
  )
// tasseau horizontal (axe X)
const hBattenX = (y, z, dy, dz, x0, x1) =>
  prism(
    [[x0, y, z], [x0, y + dy * L, z], [x0, y, z + dz * L]],
    [[x1, y, z], [x1, y + dy * L, z], [x1, y, z + dz * L]],
  )
// tasseau horizontal (axe Z)
const hBattenZ = (x, y, dx, dy, z0, z1) =>
  prism(
    [[x, y, z0], [x + dx * L, y, z0], [x, y + dy * L, z0]],
    [[x, y, z1], [x + dx * L, y, z1], [x, y + dy * L, z1]],
  )
// gousset plat horizontal (plaque triangulaire, épaisseur en Y)
const gussetH = (x, y, dx, zc, leg, thk = T) =>
  prism(
    [[x, y, zc], [x + dx * leg, y, zc], [x, y, zc + leg]],
    [[x, y + thk, zc], [x + dx * leg, y + thk, zc], [x, y + thk, zc + leg]],
  )
// Liste des tasseaux/renforts : { geom, cut } (cut=true → masqué en écorché)
const BATTENS = [
  // tasseaux d'angle verticaux (arrière)
  { geom: vBatten(-ihw, -ihd, 1, 1, ibot, itop) },
  { geom: vBatten(ihw, -ihd, -1, 1, ibot, itop) },
  // renforts arrière horizontaux (haut/bas)
  { geom: hBattenX(itop, -ihd, -1, 1, -(ihw - 22), ihw - 22), cut: true },
  { geom: hBattenX(ibot, -ihd, 1, 1, -(ihw - 22), ihw - 22) },
  // tasseaux le long des arêtes flanc/haut & flanc/bas
  { geom: hBattenZ(-ihw, itop, 1, -1, -(ihd - 22), 262), cut: true },
  { geom: hBattenZ(-ihw, ibot, 1, 1, -(ihd - 22), 262) },
  { geom: hBattenZ(ihw, itop, -1, -1, -(ihd - 22), 262), cut: true },
  { geom: hBattenZ(ihw, ibot, -1, 1, -(ihd - 22), 262), cut: true },
  // goussets de renfort arrière (coin flanc / panneau arrière)
  { geom: gussetH(-ihw, 120, 1, -ihd, 82) },
  { geom: gussetH(-ihw, -50, 1, -ihd, 82) },
  { geom: gussetH(ihw, 120, -1, -ihd, 82), cut: true },
  { geom: gussetH(ihw, -50, -1, -ihd, 82), cut: true },
]

// Flanc (600 × 529) avec déport avant : on ronge 20 mm dans le bord avant,
// de 50 mm du haut jusqu'à 50 mm du bas (transitions chanfreinées sur ces 50 mm).
// Profil dans le plan (z, y), extrudé sur l'épaisseur puis tourné en X.
function sideGeom() {
  const zF = halfD // 300 — avant
  const zB = -halfD // -300 — arrière
  const zN = halfD - 20 // 280 — bord avant rongé de 20 mm
  const m = 50 // transitions haut/bas
  const s = new THREE.Shape()
  s.moveTo(zB, ibot) // arrière-bas
  s.lineTo(zF, ibot) // bord bas → coin avant-bas
  s.lineTo(zN, ibot + m) // chanfrein bas (recul de 20 mm)
  s.lineTo(zN, itop - m) // arête avant rongée
  s.lineTo(zF, itop) // chanfrein haut → coin avant-haut
  s.lineTo(zB, itop) // bord haut → arrière
  s.lineTo(zB, ibot)
  const g = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false })
  g.translate(0, 0, -T / 2)
  return g
}
const SIDE = sideGeom()

// Baffle interne percé
function baffleGeom() {
  const w = 395 / 2
  const h = baffleH / 2
  const shape = new THREE.Shape()
  shape.moveTo(-w, -h)
  shape.lineTo(w, -h)
  shape.lineTo(w, h)
  shape.lineTo(-w, h)
  shape.lineTo(-w, -h)
  const hole = new THREE.Path()
  hole.absarc(0, 0, holeR, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const g = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false })
  g.translate(0, 0, -T / 2)
  return g
}
const BAFFLE = baffleGeom()

// ---------- Meshes bois ----------
function WoodMesh({ geometry, args, position, rotation, scale, hidden }) {
  if (hidden) return null
  return (
    <mesh
      geometry={geometry}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    >
      {args && <boxGeometry args={args} />}
      <meshStandardMaterial
        map={woodTexture()}
        color="#ffffff"
        roughness={0.76}
        metalness={0.04}
        side={THREE.DoubleSide}
      />
      <Edges threshold={20} color={WOOD_EDGE} />
    </mesh>
  )
}

function Driver() {
  return (
    <group position={[0, baffleCenterY, baffleCenterZ + T / 2]}>
      <mesh position={[0, 0, -8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[194, 194, 8, 56]} />
        <meshStandardMaterial color="#202024" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, -1]}>
        <torusGeometry args={[185, 9, 16, 56]} />
        <meshStandardMaterial color="#161619" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0, 5]}>
        <torusGeometry args={[156, 16, 16, 64]} />
        <meshStandardMaterial color="#3a3c40" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, -35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[148, 46, 92, 64, 1, true]} />
        <meshStandardMaterial color="#7e8186" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 12]} scale={[1, 1, 0.6]}>
        <sphereGeometry args={[48, 32, 24]} />
        <meshStandardMaterial color="#8c8f93" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0, -74]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[72, 72, 70, 40]} />
        <meshStandardMaterial color="#1c1c1f" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0, -112]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[42, 48, 16, 28]} />
        <meshStandardMaterial color="#0f0f11" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

function Dim({ a, b, t = [0, 0, 0], label }) {
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
  const aPos = [a[0] + t[0], a[1] + t[1], a[2] + t[2]]
  const aNeg = [a[0] - t[0], a[1] - t[1], a[2] - t[2]]
  const bPos = [b[0] + t[0], b[1] + t[1], b[2] + t[2]]
  const bNeg = [b[0] - t[0], b[1] - t[1], b[2] - t[2]]
  return (
    <group>
      <Line points={[a, b]} color={BLUE} lineWidth={1.3} />
      <Line points={[aNeg, aPos]} color={BLUE} lineWidth={1.3} />
      <Line points={[bNeg, bPos]} color={BLUE} lineWidth={1.3} />
      <Html position={mid} center zIndexRange={[20, 0]}>
        <span className="dim3d">{label}</span>
      </Html>
    </group>
  )
}

const dims = [
  { a: [-halfW, -halfH - 21, halfD], b: [halfW, -halfH - 21, halfD], t: [0, 9, 0], label: '425' },
  { a: [-halfW - 28, -halfH, halfD], b: [-halfW - 28, halfH, halfD], t: [9, 0, 0], label: '559' },
  { a: [halfW + 28, -halfH - 21, -halfD], b: [halfW + 28, -halfH - 21, halfD], t: [0, 9, 0], label: '600' },
  { a: [-197.5, -halfH - 50, halfD], b: [197.5, -halfH - 50, halfD], t: [0, 9, 0], label: '395' },
  { a: [-halfW, halfH, halfD + 6], b: [-halfW, itop, halfD + 6], t: [9, 0, 0], label: '15' },
  { a: [-halfW - 6, ibot, halfD + 6], b: [-halfW - 6, shelfTopY, halfD + 6], t: [9, 0, 0], label: '115' },
  { a: [halfW + 6, baffleBottomY, halfD + 6], b: [halfW + 6, baffleTopY, halfD + 6], t: [9, 0, 0], label: '414' },
  { a: [90, itop + 14, halfD], b: [90, itop + 14, baffleFrontZ], t: [0, 9, 0], label: '50' },
]

const VIEWS = {
  'Face': [0, 0.05, 1.0],
  '3⁄4': [0.62, 0.46, 0.86],
  'Côté': [1.0, 0.08, 0.04],
  'Arrière': [0.28, 0.36, -0.95],
}
const ZERO = new THREE.Vector3(0, 0, 0)

function CameraRig({ view }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const anim = useRef({ active: false, pos: new THREE.Vector3() })
  useEffect(() => {
    anim.current.pos.set(...VIEWS[view])
    anim.current.active = true
  }, [view])
  useFrame(() => {
    if (!anim.current.active || !controls) return
    camera.position.lerp(anim.current.pos, 0.12)
    controls.target.lerp(ZERO, 0.12)
    controls.update()
    if (camera.position.distanceTo(anim.current.pos) < 0.008) anim.current.active = false
  })
  return null
}

function Scene({ cut, showDims, view }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#ffffff', '#b08d57', 0.5]} />
      <directionalLight position={[0.7, 1.1, 0.9]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-0.9, 0.5, -0.6]} intensity={0.4} />

      <group scale={0.001}>
        {/* coque */}
        <WoodMesh args={[W, T, D]} position={[0, halfH - T / 2, 0]} hidden={cut} />
        <WoodMesh args={[W, T, D]} position={[0, -halfH + T / 2, 0]} />
        <WoodMesh geometry={SIDE} rotation={[0, -Math.PI / 2, 0]} position={[-halfW + T / 2, 0, 0]} />
        <WoodMesh
          geometry={SIDE}
          rotation={[0, -Math.PI / 2, 0]}
          position={[halfW - T / 2, 0, 0]}
          hidden={cut}
        />
        <WoodMesh args={[W - 2 * T, H - 2 * T, T]} position={[0, 0, -halfD + T / 2]} />

        {/* tablette d'évent + baffle + renfort central */}
        <WoodMesh args={[395, shelfThk, shelfDepth]} position={[0, shelfCenterY, shelfCenterZ]} />
        <WoodMesh geometry={BAFFLE} position={[0, baffleCenterY, baffleCenterZ]} />
        <WoodMesh
          args={[T, shelfBottomY - ibot, braceDepth]}
          position={[0, (ibot + shelfBottomY) / 2, braceCenterZ]}
        />

        {/* tasseaux & renforts */}
        {BATTENS.map((b, i) => (
          <WoodMesh key={i} geometry={b.geom} hidden={cut && b.cut} />
        ))}

        {/* haut-parleur */}
        <Driver />

        {showDims && dims.map((d, i) => <Dim key={i} {...d} />)}
      </group>

      <ContactShadows position={[0, -0.286, 0]} scale={1.3} blur={2.4} opacity={0.35} far={0.6} />
      <CameraRig view={view} />
      <OrbitControls target={[0, 0, 0]} enablePan={false} minDistance={0.5} maxDistance={2.2} enableDamping makeDefault />
    </>
  )
}

export default function CabinetViewer() {
  const [cut, setCut] = useState(false)
  const [showDims, setShowDims] = useState(true)
  const [view, setView] = useState('3⁄4')

  return (
    <figure className="viewer">
      <div className="viewer-stage">
        <div className="viewer-controls">
          <div className="viewer-group">
            {Object.keys(VIEWS).map((v) => (
              <button
                key={v}
                type="button"
                className={view === v ? 'is-on' : ''}
                aria-pressed={view === v}
                onClick={() => setView(v)}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="viewer-group">
            <button type="button" className={showDims ? 'is-on' : ''} aria-pressed={showDims} onClick={() => setShowDims((v) => !v)}>
              Cotes
            </button>
            <button type="button" className={cut ? 'is-on' : ''} aria-pressed={cut} onClick={() => setCut((v) => !v)}>
              Écorché
            </button>
          </div>
        </div>
        <Canvas shadows dpr={[1, 2]} camera={{ position: VIEWS['3⁄4'], fov: 35 }} gl={{ antialias: true }}>
          <Scene cut={cut} showDims={showDims} view={view} />
        </Canvas>
      </div>
      <figcaption className="viewer-cap">
        Caisson sub 15″ — 425 (l) × 559 (h) × 600 (p) mm, interne 395 mm. HP Beyma monté par
        l'arrière, baffle reculé de 50 mm, évent en fente (bouche 115 mm), tasseaux d'angle, renforts
        arrière, goussets de flanc et renfort central (235 mm). Glisser pour pivoter, molette pour
        zoomer. Cotes en mm.
      </figcaption>
    </figure>
  )
}
