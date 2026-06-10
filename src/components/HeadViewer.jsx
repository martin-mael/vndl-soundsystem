import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Edges, Line, Html, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

/*
  Tête deux-voies — plan Celestion « BUILD THIS! Two-Way 12" Ported » (GA878).
  Caisson trapézoïdal portrait (flancs en biais), construit en CP bouleau 15 mm
  en conservant les dimensions internes du plan (vol. 44 L).

  Cotes internes (ID) : façade 350 (l) × 597 (h), arrière 244,5, profondeur 248.
  Tout en mm ; le groupe est mis à l'échelle 0.001 (mètres) dans la scène.
*/

const T = 15
const Wf_i = 350 // largeur interne avant
const Wb_i = 244.5 // largeur interne arrière
const D_i = 248 // profondeur interne
const H_i = 597 // hauteur interne

const Wf = Wf_i + 2 * T // 380
const Wb = Wb_i + 2 * T // 274.5
const D = D_i + 2 * T // 278
const Hh = H_i + 2 * T // 627

const halfH = Hh / 2 // 313.5
const halfD = D / 2 // 139
const xFront = Wf / 2 // 190
const xBack = Wb / 2 // 137.25

const baffleZ = halfD - T / 2 // 131.5
const backZ = -halfD + T / 2

const toe = Math.atan2(xFront - xBack, D) // ~10.75°
const sideLen = Math.hypot(xFront - xBack, D) // ~283
const sideX = (xFront + xBack) / 2 // 163.6

// implantation façade (centre baffle)
const HORN = { w: 265, h: 165, y: 185 }
const DRIVER = { d: 278, y: -55 }
const PORT = { d: 75, y: -238, dx: 100, len: 165 }

const WOOD_EDGE = '#5b4424'
const BLUE = '#2E54C8'

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
    x.strokeStyle = `rgba(${(115 + Math.random() * 45) | 0},${(82 + Math.random() * 35) | 0},${(44 + Math.random() * 30) | 0},${0.04 + Math.random() * 0.12})`
    x.lineWidth = 1 + Math.random() * 2.4
    x.moveTo(gx, 0)
    for (let y = 0; y <= s; y += 14) x.lineTo(gx + Math.sin(y * 0.02 + gx) * 6 + (Math.random() - 0.5) * 3, y)
    x.stroke()
  }
  _wood = new THREE.CanvasTexture(c)
  _wood.wrapS = _wood.wrapT = THREE.RepeatWrapping
  _wood.repeat.set(1.4, 1.4)
  _wood.anisotropy = 4
  return _wood
}

// dessus/dessous (plan) : trapèze à bord avant CURVÉ (R828), extrudé en épaisseur.
// Les coins avant restent au plan de la façade (z = halfD) ; seul le centre galbe.
const R_FRONT = 828
const sagF = R_FRONT - Math.sqrt(R_FRONT * R_FRONT - (Wf / 2) * (Wf / 2)) // ~22 mm
function trapGeom() {
  const s = new THREE.Shape()
  s.moveTo(-Wb / 2, -halfD) // arrière-gauche
  s.lineTo(Wb / 2, -halfD) // arrière-droit
  s.lineTo(Wf / 2, halfD) // coin avant-droit (plan façade)
  s.quadraticCurveTo(0, halfD + 2 * sagF, -Wf / 2, halfD) // bord avant galbé
  s.lineTo(-Wb / 2, -halfD)
  const g = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false, curveSegments: 24 })
  g.translate(0, 0, -T / 2)
  g.rotateX(Math.PI / 2)
  return g
}
const TRAP = trapGeom()

// façade percée (HP + pavillon + 2 évents)
function baffleGeom() {
  const s = new THREE.Shape()
  s.moveTo(-Wf / 2, -H_i / 2)
  s.lineTo(Wf / 2, -H_i / 2)
  s.lineTo(Wf / 2, H_i / 2)
  s.lineTo(-Wf / 2, H_i / 2)
  s.lineTo(-Wf / 2, -H_i / 2)
  const driver = new THREE.Path()
  driver.absarc(0, DRIVER.y, DRIVER.d / 2, 0, Math.PI * 2, true)
  s.holes.push(driver)
  const horn = new THREE.Path()
  horn.moveTo(-HORN.w / 2, HORN.y - HORN.h / 2)
  horn.lineTo(-HORN.w / 2, HORN.y + HORN.h / 2)
  horn.lineTo(HORN.w / 2, HORN.y + HORN.h / 2)
  horn.lineTo(HORN.w / 2, HORN.y - HORN.h / 2)
  horn.lineTo(-HORN.w / 2, HORN.y - HORN.h / 2)
  s.holes.push(horn)
  for (const sx of [-1, 1]) {
    const p = new THREE.Path()
    p.absarc(sx * PORT.dx, PORT.y, PORT.d / 2, 0, Math.PI * 2, true)
    s.holes.push(p)
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false })
  g.translate(0, 0, -T / 2)
  return g
}
const BAFFLE = baffleGeom()

// pavillon (cône tronqué rectangulaire) : bouche avant 265×165 → gorge arrière
function hornGeom() {
  const depth = 130
  const f = [
    [-HORN.w / 2, -HORN.h / 2, depth / 2],
    [HORN.w / 2, -HORN.h / 2, depth / 2],
    [HORN.w / 2, HORN.h / 2, depth / 2],
    [-HORN.w / 2, HORN.h / 2, depth / 2],
  ]
  const b = [
    [-30, -22, -depth / 2],
    [30, -22, -depth / 2],
    [30, 22, -depth / 2],
    [-30, 22, -depth / 2],
  ]
  const v = []
  const tri = (a, b2, c) => v.push(...a, ...b2, ...c)
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4
    tri(f[i], f[j], b[j])
    tri(f[i], b[j], b[i])
  }
  tri(b[0], b[2], b[1])
  tri(b[0], b[3], b[2])
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
  g.computeVertexNormals()
  return g
}
const HORN_GEOM = hornGeom()

function WoodMesh({ geometry, args, position, rotation, hidden }) {
  if (hidden) return null
  return (
    <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow>
      {args && <boxGeometry args={args} />}
      <meshStandardMaterial map={woodTexture()} color="#ffffff" roughness={0.76} metalness={0.04} side={THREE.DoubleSide} />
      <Edges threshold={20} color={WOOD_EDGE} />
    </mesh>
  )
}

function Driver() {
  return (
    <group position={[0, DRIVER.y, baffleZ]}>
      <mesh position={[0, 0, -2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[150, 150, 8, 48]} />
        <meshStandardMaterial color="#202024" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, 4]}>
        <torusGeometry args={[124, 13, 16, 56]} />
        <meshStandardMaterial color="#3a3c40" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, -26]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[118, 36, 70, 56, 1, true]} />
        <meshStandardMaterial color="#7e8186" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 10]} scale={[1, 1, 0.6]}>
        <sphereGeometry args={[38, 28, 20]} />
        <meshStandardMaterial color="#8c8f93" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0, -64]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[58, 58, 56, 32]} />
        <meshStandardMaterial color="#1c1c1f" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

function Ports() {
  return (
    <>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * PORT.dx, PORT.y, baffleZ - PORT.len / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[PORT.d / 2, PORT.d / 2, PORT.len, 32, 1, true]} />
          <meshStandardMaterial color="#3a3a3d" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

function Dim({ a, b, t = [0, 0, 0], label }) {
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
  const aP = [a[0] + t[0], a[1] + t[1], a[2] + t[2]]
  const aN = [a[0] - t[0], a[1] - t[1], a[2] - t[2]]
  const bP = [b[0] + t[0], b[1] + t[1], b[2] + t[2]]
  const bN = [b[0] - t[0], b[1] - t[1], b[2] - t[2]]
  return (
    <group>
      <Line points={[a, b]} color={BLUE} lineWidth={1.3} />
      <Line points={[aN, aP]} color={BLUE} lineWidth={1.3} />
      <Line points={[bN, bP]} color={BLUE} lineWidth={1.3} />
      <Html position={mid} center zIndexRange={[20, 0]}>
        <span className="dim3d">{label}</span>
      </Html>
    </group>
  )
}

const dims = [
  { a: [-Wf_i / 2, -halfH - 22, halfD + 8], b: [Wf_i / 2, -halfH - 22, halfD + 8], t: [0, 9, 0], label: '350' },
  { a: [-Wf / 2 - 26, -H_i / 2, halfD], b: [-Wf / 2 - 26, H_i / 2, halfD], t: [9, 0, 0], label: '597' },
  { a: [Wf / 2 + 26, -halfH - 22, halfD], b: [Wf / 2 + 26, -halfH - 22, -halfD], t: [0, 9, 0], label: '248' },
  { a: [-Wb_i / 2, -halfH - 22, -halfD - 8], b: [Wb_i / 2, -halfH - 22, -halfD - 8], t: [0, 9, 0], label: '244,5' },
]

const VIEWS = {
  Face: [0, 0.05, 1.1],
  '3⁄4': [0.6, 0.42, 0.92],
  Côté: [1.05, 0.06, 0.05],
  Arrière: [0.3, 0.34, -1.0],
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
        {/* dessus / dessous (trapèzes) */}
        <WoodMesh geometry={TRAP} position={[0, halfH - T / 2, 0]} hidden={cut} />
        <WoodMesh geometry={TRAP} position={[0, -halfH + T / 2, 0]} />
        {/* façade percée */}
        <WoodMesh geometry={BAFFLE} position={[0, 0, baffleZ]} />
        {/* arrière */}
        <WoodMesh args={[Wb, H_i, T]} position={[0, 0, backZ]} />
        {/* flancs en biais */}
        <WoodMesh args={[T, H_i, sideLen]} position={[-sideX, 0, 0]} rotation={[0, -toe, 0]} hidden={cut} />
        <WoodMesh args={[T, H_i, sideLen]} position={[sideX, 0, 0]} rotation={[0, toe, 0]} />
        {/* HP + pavillon + évents */}
        <Driver />
        <mesh geometry={HORN_GEOM} position={[0, HORN.y, baffleZ - 65]}>
          <meshStandardMaterial color="#1b1b1e" roughness={0.5} metalness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <Ports />

        {showDims && dims.map((d, i) => <Dim key={i} {...d} />)}
      </group>

      <ContactShadows position={[0, -0.32, 0]} scale={1.3} blur={2.4} opacity={0.35} far={0.7} />
      <CameraRig view={view} />
      <OrbitControls target={[0, 0, 0]} enablePan={false} minDistance={0.55} maxDistance={2.4} enableDamping makeDefault />
    </>
  )
}

export default function HeadViewer() {
  const [cut, setCut] = useState(false)
  const [showDims, setShowDims] = useState(true)
  const [view, setView] = useState('3⁄4')

  return (
    <figure className="viewer">
      <div className="viewer-stage">
        <div className="viewer-controls">
          <div className="viewer-group">
            {Object.keys(VIEWS).map((v) => (
              <button key={v} type="button" className={view === v ? 'is-on' : ''} aria-pressed={view === v} onClick={() => setView(v)}>
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
        Tête deux-voies — caisson trapézoïdal portrait, façade 350 × 597 mm (interne), profondeur 248,
        arrière 244,5 (flancs en biais ~11°), CP bouleau 15 mm, volume 44 L. Pavillon H1-9040P en haut,
        12″ TF1225 au centre, 2 évents Ø75 × 165 en bas. Glisser pour pivoter, molette pour zoomer.
        Cotes en mm.
      </figcaption>
    </figure>
  )
}
