import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Edges, Line, Html, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

/*
  Système en configuration TRANSPORT sur le plateau du vélo (850 × 600 mm) :
  - 2 subs (425 × 559 × 600) côte à côte en base (425 + 425 = 850),
  - 2 têtes couchées sur le dos, HP vers le haut, côte à côte sur les subs,
  - 2 sangles à cliquet de maintien (le rack 3U se transporte séparément).
  Tout en mm, groupe à l'échelle 0.001.
*/

const PLAT = { w: 850, d: 600, t: 18 }
const SUB = { w: 425, h: 559, d: 600 }
const HEAD = { wf: 380, wb: 274.5, d: 278, h: 597 }

const headTopY = SUB.h + HEAD.d // 837 — dessus des têtes couchées

const WOOD_EDGE = '#5b4424'
const BLUE = '#2E54C8'
const STRAP = '#2b2926'

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
  _wood.repeat.set(1.2, 1.2)
  _wood.anisotropy = 4
  return _wood
}

function headGeom() {
  const s = new THREE.Shape()
  s.moveTo(-HEAD.wf / 2, HEAD.d / 2)
  s.lineTo(HEAD.wf / 2, HEAD.d / 2)
  s.lineTo(HEAD.wb / 2, -HEAD.d / 2)
  s.lineTo(-HEAD.wb / 2, -HEAD.d / 2)
  s.lineTo(-HEAD.wf / 2, HEAD.d / 2)
  const g = new THREE.ExtrudeGeometry(s, { depth: HEAD.h, bevelEnabled: false })
  g.translate(0, 0, -HEAD.h / 2)
  g.rotateX(Math.PI / 2)
  return g
}
const HEAD_GEOM = headGeom()

function Wood({ geometry, args, position, rotation }) {
  return (
    <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow>
      {args && <boxGeometry args={args} />}
      <meshStandardMaterial map={woodTexture()} color="#ffffff" roughness={0.78} metalness={0.04} side={THREE.DoubleSide} />
      <Edges threshold={20} color={WOOD_EDGE} />
    </mesh>
  )
}

function Sub({ x }) {
  const cy = SUB.h / 2
  const fz = SUB.d / 2
  return (
    <group position={[x, 0, 0]}>
      <Wood args={[SUB.w, SUB.h, SUB.d]} position={[0, cy, 0]} />
      <mesh position={[0, cy + 60, fz + 3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[180, 180, 6, 40]} />
        <meshStandardMaterial color="#202024" roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[0, cy + 60, fz + 8]} scale={[1, 1, 0.5]}>
        <sphereGeometry args={[55, 24, 18]} />
        <meshStandardMaterial color="#3a3c40" roughness={0.6} />
      </mesh>
      <mesh position={[0, cy - 200, fz + 2]}>
        <boxGeometry args={[300, 70, 6]} />
        <meshStandardMaterial color="#15140f" roughness={0.7} />
      </mesh>
    </group>
  )
}

// tête couchée sur le dos, façade (HP) vers le haut
function HeadFlat({ x }) {
  const cy = SUB.h + HEAD.d / 2 // 698
  const ty = headTopY // 837
  return (
    <group position={[x, 0, 0]}>
      <Wood geometry={HEAD_GEOM} rotation={[-Math.PI / 2, 0, 0]} position={[0, cy, 0]} />
      {/* pavillon */}
      <mesh position={[0, ty + 3, -185]}>
        <boxGeometry args={[265, 8, 165]} />
        <meshStandardMaterial color="#1b1b1e" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* HP 12" */}
      <mesh position={[0, ty + 2, 55]}>
        <cylinderGeometry args={[139, 139, 6, 40]} />
        <meshStandardMaterial color="#202024" roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[0, ty + 6, 55]} scale={[1, 0.5, 1]}>
        <sphereGeometry args={[40, 24, 18]} />
        <meshStandardMaterial color="#3a3c40" roughness={0.6} />
      </mesh>
      {/* évents */}
      {[-100, 100].map((dx) => (
        <mesh key={dx} position={[dx, ty + 2, 238]}>
          <cylinderGeometry args={[37.5, 37.5, 6, 28]} />
          <meshStandardMaterial color="#15140f" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// sangle à cliquet : passe sur le sommet et descend aux flancs jusqu'au plateau
function Strap({ z, topY }) {
  const W = 60
  const h = topY + 4
  const mat = <meshStandardMaterial color={STRAP} roughness={0.92} metalness={0.05} />
  return (
    <group>
      <mesh position={[0, topY + 4, z]} castShadow>
        <boxGeometry args={[PLAT.w + 6, 6, W]} />
        {mat}
      </mesh>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * (PLAT.w / 2 + 1), h / 2, z]} castShadow>
          <boxGeometry args={[6, h, W]} />
          {mat}
        </mesh>
      ))}
      {/* boucle / cliquet sur un flanc */}
      <mesh position={[PLAT.w / 2 + 6, h * 0.42, z]}>
        <boxGeometry args={[40, 86, W + 10]} />
        <meshStandardMaterial color="#6a6d72" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
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

function Tag({ position, children }) {
  return (
    <Html position={position} center zIndexRange={[30, 0]}>
      <span className="rig-tag">{children}</span>
    </Html>
  )
}

const VIEWS = {
  '3⁄4': [1.05, 1.0, 1.45],
  Face: [0, 0.55, 1.95],
  Côté: [1.95, 0.6, 0.15],
  Dessus: [0.2, 2.1, 0.45],
}
const TARGET = new THREE.Vector3(0, 0.45, 0)

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
    controls.target.lerp(TARGET, 0.12)
    controls.update()
    if (camera.position.distanceTo(anim.current.pos) < 0.01) anim.current.active = false
  })
  return null
}

function Scene({ view, showDims, showTags }) {
  const subX = SUB.w / 2
  const headX = 195
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#ffffff', '#b08d57', 0.5]} />
      <directionalLight position={[1, 1.5, 1]} intensity={1.15} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-1.2} shadow-camera-right={1.2} shadow-camera-top={1.6} shadow-camera-bottom={-0.3} />
      <directionalLight position={[-1, 0.6, -0.7]} intensity={0.4} />

      <group scale={0.001}>
        <mesh position={[0, -PLAT.t / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[PLAT.w, PLAT.t, PLAT.d]} />
          <meshStandardMaterial color="#3b3f45" roughness={0.7} metalness={0.2} />
          <Edges threshold={20} color="#15161a" />
        </mesh>

        <Sub x={-subX} />
        <Sub x={subX} />
        <HeadFlat x={-headX} />
        <HeadFlat x={headX} />

        <Strap z={-160} topY={headTopY} />
        <Strap z={210} topY={headTopY} />

        {showTags && (
          <>
            <Tag position={[-subX, 230, PLAT.d / 2 + 30]}>Sub D</Tag>
            <Tag position={[subX, 230, PLAT.d / 2 + 30]}>Sub G</Tag>
            <Tag position={[-headX, headTopY + 70, 55]}>Tête D</Tag>
            <Tag position={[headX, headTopY + 70, 55]}>Tête G</Tag>
          </>
        )}

        {showDims && (
          <>
            <Dim a={[-PLAT.w / 2, -PLAT.t - 24, PLAT.d / 2]} b={[PLAT.w / 2, -PLAT.t - 24, PLAT.d / 2]} t={[0, 12, 0]} label="850" />
            <Dim a={[PLAT.w / 2 + 24, -PLAT.t - 24, -PLAT.d / 2]} b={[PLAT.w / 2 + 24, -PLAT.t - 24, PLAT.d / 2]} t={[0, 12, 0]} label="600" />
            <Dim a={[-PLAT.w / 2 - 30, 0, PLAT.d / 2]} b={[-PLAT.w / 2 - 30, SUB.h, PLAT.d / 2]} t={[12, 0, 0]} label="559" />
            <Dim a={[-PLAT.w / 2 - 30, 0, -PLAT.d / 2]} b={[-PLAT.w / 2 - 30, headTopY, -PLAT.d / 2]} t={[12, 0, 0]} label="837" />
          </>
        )}
      </group>

      <ContactShadows position={[0, -0.02, 0]} scale={1.7} blur={2.6} opacity={0.4} far={0.9} />
      <CameraRig view={view} />
      <OrbitControls target={TARGET} enablePan={false} minDistance={0.8} maxDistance={4} enableDamping makeDefault />
    </>
  )
}

export default function RigViewer() {
  const [view, setView] = useState('3⁄4')
  const [showDims, setShowDims] = useState(true)
  const [showTags, setShowTags] = useState(true)

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
            <button type="button" className={showTags ? 'is-on' : ''} aria-pressed={showTags} onClick={() => setShowTags((v) => !v)}>
              Repères
            </button>
            <button type="button" className={showDims ? 'is-on' : ''} aria-pressed={showDims} onClick={() => setShowDims((v) => !v)}>
              Cotes
            </button>
          </div>
        </div>
        <Canvas shadows dpr={[1, 2]} camera={{ position: VIEWS['3⁄4'], fov: 38 }} gl={{ antialias: true }}>
          <Scene view={view} showDims={showDims} showTags={showTags} />
        </Canvas>
      </div>
      <figcaption className="viewer-cap">
        Configuration transport sur le plateau du Douze (850 × 600 mm) : 2 subs côte à côte en base
        (425 + 425 = 850 pile), 2 têtes couchées HP vers le haut par-dessus, le tout maintenu par
        2 sangles. Hauteur totale ~837 mm. Le flight case 3U se transporte séparément. Glisser pour
        pivoter.
      </figcaption>
    </figure>
  )
}
