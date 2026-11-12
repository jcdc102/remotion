import { loadFont as cargarAnton } from "@remotion/google-fonts/Anton";
import { loadFont as cargarPoppins } from "@remotion/google-fonts/Poppins";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useEffect, useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const { fontFamily: ANTON } = cargarAnton();
const { fontFamily: POPPINS } = cargarPoppins("normal", { weights: ["700", "800"], subsets: ["latin"] });

// Motion graphics 3D sobre el audio "taka taka". Todo el arte es nuevo (carro y motor hechos aquí).
const DUR_AUDIO = 7.65;
const DUR_REMATE = 2.8;
export const DURACION_TAKA3D = Math.round((DUR_AUDIO + DUR_REMATE) * 30);

const TAKAS = [1.92, 2.42, 2.74, 3.3, 3.54, 3.78, 4.1];
const VAUS = [5.0, 6.1];
const ROJO = "#E11D2E";

const suave = (x: number) => Math.max(0, Math.min(1, x));
const golpeDesde = (t: number, t0: number, caida = 6) => (t >= t0 ? Math.exp(-(t - t0) * caida) : 0);

const Entorno: React.FC = () => {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
};

// Cámara: órbita al carro, clavado al cofre, frente al motor con sacudidas.
const Camara: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const sac = TAKAS.reduce((a, k) => a + golpeDesde(t, k, 9), 0) * 0.12 + VAUS.reduce((a, k) => a + golpeDesde(t, k, 4), 0) * 0.18;
  let pos: [number, number, number];
  let mira: [number, number, number];
  if (t < 1.92) {
    const a = interpolate(t, [0, 1.92], [0.5, 1.25]);
    const r = interpolate(t, [0, 1.5, 1.92], [10.5, 9.2, 3.2], { extrapolateRight: "clamp" });
    const y = interpolate(t, [0, 1.5, 1.92], [2.6, 2.3, 1.2]);
    pos = [Math.sin(a) * r, y, Math.cos(a) * r];
    mira = [interpolate(t, [1.5, 1.92], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), 0.1, 0];
  } else {
    const l = t - 1.92;
    const empuje = t > 4.68 && t < 5.5 ? interpolate(t, [4.68, 5.5], [0, 2.2]) : t >= 5.5 ? interpolate(t, [5.5, 7.65], [1.4, -1.5]) : 0;
    pos = [Math.sin(l * 0.35) * 2.0, 2.6 + Math.sin(l * 0.5) * 0.3, 12.5 - empuje];
    mira = [0, 1.3, 0];
  }
  camera.position.set(pos[0] + Math.sin(t * 61) * sac, pos[1] + Math.cos(t * 53) * sac, pos[2]);
  camera.lookAt(mira[0], mira[1], mira[2]);
  return null;
};

const Rueda: React.FC<{ x: number; z: number; giro: number }> = ({ x, z, giro }) => (
  <group position={[x, -0.28, z]} rotation={[Math.PI / 2, 0, 0]}>
    <group rotation={[0, giro, 0]}>
      <mesh>
        <cylinderGeometry args={[0.32, 0.32, 0.24, 32]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      <mesh position={[0, z > 0 ? 0.125 : -0.125, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.02, 6]} />
        <meshStandardMaterial color="#cfd3d8" metalness={1} roughness={0.25} />
      </mesh>
    </group>
  </group>
);

const Carro: React.FC<{ t: number }> = ({ t }) => {
  const susto = golpeDesde(t, 1.05, 5);
  const giro = -t * 14;
  return (
    <group position={[0, 0.15 + Math.sin(t * 30) * 0.01 + susto * 0.08, 0]} rotation={[0, 0, susto * 0.04]}>
      <mesh>
        <boxGeometry args={[2.4, 0.42, 1.1]} />
        <meshPhysicalMaterial color={ROJO} metalness={0.6} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[-0.15, 0.38, 0]}>
        <boxGeometry args={[1.3, 0.38, 1.0]} />
        <meshPhysicalMaterial color={ROJO} metalness={0.6} roughness={0.25} clearcoat={1} />
      </mesh>
      <mesh position={[-0.15, 0.39, 0]}>
        <boxGeometry args={[1.18, 0.3, 1.02]} />
        <meshPhysicalMaterial color="#0d1620" metalness={0.2} roughness={0.05} transmission={0} />
      </mesh>
      {[-0.33, 0.33].map((z) => (
        <mesh key={z} position={[1.205, 0.03, z]}>
          <boxGeometry args={[0.02, 0.1, 0.22]} />
          <meshStandardMaterial color="#fff6d5" emissive="#fff3c4" emissiveIntensity={3} />
        </mesh>
      ))}
      {[-0.33, 0.33].map((z) => (
        <mesh key={`r${z}`} position={[-1.205, 0.05, z]}>
          <boxGeometry args={[0.02, 0.08, 0.22]} />
          <meshStandardMaterial color="#ff2a2a" emissive="#ff1a1a" emissiveIntensity={2} />
        </mesh>
      ))}
      <Rueda x={0.78} z={0.52} giro={giro} />
      <Rueda x={0.78} z={-0.52} giro={giro} />
      <Rueda x={-0.78} z={0.52} giro={giro} />
      <Rueda x={-0.78} z={-0.52} giro={giro} />
    </group>
  );
};

const Carretera: React.FC<{ t: number }> = ({ t }) => (
  <group position={[0, -0.6, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[60, 6]} />
      <meshStandardMaterial color="#20232a" roughness={0.9} />
    </mesh>
    {Array.from({ length: 16 }).map((_, i) => {
      const x = ((i * 3 - t * 9) % 48) + 24;
      return (
        <mesh key={i} position={[x - 24, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.4, 0.12]} />
          <meshStandardMaterial color="#f4f4f4" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>
      );
    })}
  </group>
);

const Engrane: React.FC<{ x: number; y: number; r: number; giro: number }> = ({ x, y, r, giro }) => (
  <group position={[x, y, -1.1]} rotation={[0, 0, giro]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[r, r, 0.18, 40]} />
      <meshStandardMaterial color="#9aa3ad" metalness={1} roughness={0.3} />
    </mesh>
    {Array.from({ length: 14 }).map((_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * (r + 0.08), Math.sin(a) * (r + 0.08), 0]} rotation={[0, 0, a]}>
          <boxGeometry args={[0.18, 0.12, 0.18]} />
          <meshStandardMaterial color="#9aa3ad" metalness={1} roughness={0.3} />
        </mesh>
      );
    })}
  </group>
);

const Motor: React.FC<{ t: number }> = ({ t }) => {
  const ydos = t >= 4.68 && t < 5.5;
  const humoT = t - 5.3;
  const tiembla = t >= 5.0 ? (0.03 + VAUS.reduce((a, k) => a + golpeDesde(t, k, 3), 0) * 0.08) : 0;
  const humo = useMemo(
    () =>
      Array.from({ length: 46 }).map((_, i) => {
        const s = Math.sin(i * 127.1) * 43758.5453;
        const r = s - Math.floor(s);
        const s2 = Math.sin(i * 311.7) * 23421.631;
        const r2 = s2 - Math.floor(s2);
        return { x: (r - 0.5) * 2.8, z: (r2 - 0.5) * 0.8, d: (i / 46) * 1.6, v: 0.6 + r2 * 0.9 };
      }),
    [],
  );
  return (
    <group position={[Math.sin(t * 47) * tiembla, Math.cos(t * 39) * tiembla, 0]}>
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[3.6, 1.3, 1.3]} />
        <meshStandardMaterial color="#6b7480" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, -1.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 3.8, 20]} />
        <meshStandardMaterial color="#c9ced4" metalness={1} roughness={0.2} />
      </mesh>
      {[-1.2, -0.4, 0.4, 1.2].map((x, i) => {
        const base = Math.sin(t * 9 + i * Math.PI * 0.5) * 0.12;
        const golpe = TAKAS.filter((_, k) => k % 4 === i).reduce((a, k) => a + golpeDesde(t, k, 7), 0) * 0.55;
        const y = 0.75 + base + golpe;
        const rojo = ydos && (i === 1 || i === 2);
        const pulso = rojo ? 2 + Math.sin(t * 18) * 1.2 : golpe * 6;
        return (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.37, 0.37, 0.45, 32, 1, true]} />
              <meshStandardMaterial color="#8a939e" metalness={0.6} roughness={0.3} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, y, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.36, 32]} />
              <meshStandardMaterial color={rojo ? "#ff3030" : "#e3e6ea"} metalness={0.9} roughness={0.2} emissive={rojo || golpe > 0.05 ? "#ff2a1a" : "#000"} emissiveIntensity={pulso} />
            </mesh>
            <mesh position={[0, (y - 1.35) / 2 - 0.1, 0]}>
              <boxGeometry args={[0.1, Math.max(0.2, y + 1.15), 0.1]} />
              <meshStandardMaterial color="#aeb4bb" metalness={1} roughness={0.3} />
            </mesh>
            <pointLight position={[0, 1.2, 0.6]} color="#ff3a1a" intensity={golpe * 40 + (rojo ? 18 : 0)} distance={4} />
          </group>
        );
      })}
      <Engrane x={-1.0} y={0.9} r={0.55} giro={t * 2.2} />
      <Engrane x={0.25} y={1.15} r={0.38} giro={-t * 3.2} />
      {humoT > 0
        ? humo.map((p, i) => {
            const l = humoT - p.d;
            if (l < 0) return null;
            const e = Math.min(1.1, 0.2 + l * p.v * 0.6);
            return (
              <mesh key={i} position={[p.x + Math.sin(l * 2 + i) * 0.2, Math.min(2.0, 1.0 + l * p.v * 0.8), p.z]} scale={e}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color="#e9ecef" transparent opacity={suave(0.45 - l * 0.2)} depthWrite={false} />
              </mesh>
            );
          })
        : null}
      <pointLight position={[0, 2.5, 1.5]} color="#ff1a1a" intensity={t >= 5.0 ? 12 + Math.sin(t * 14) * 10 : 0} distance={8} />
    </group>
  );
};

const Escena: React.FC<{ t: number }> = ({ t }) => (
  <ThreeCanvas width={1080} height={1920} style={{ position: "absolute", inset: 0 }} camera={{ fov: 38, position: [0, 1.5, 6] }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, preserveDrawingBuffer: true }}>
    <Entorno />
    <ambientLight intensity={0.5} />
    <directionalLight position={[3, 6, 5]} intensity={2.4} />
    <pointLight position={[-4, 2, 3]} intensity={35} color={ROJO} distance={14} />
    <pointLight position={[3, 3, -3]} intensity={60} color="#ffffff" distance={16} />
    <Camara t={t} />
    {t < 1.92 ? (
      <>
        <Carro t={t} />
        <Carretera t={t} />
      </>
    ) : (
      <Motor t={t} />
    )}
  </ThreeCanvas>
);

// Explosión de cómic con texto.
const Burbuja: React.FC<{ texto: string; t: number; t0: number; x: number; y: number; rot: number; color: string; tam: number }> = ({ texto, t, t0, x, y, rot, color, tam }) => {
  const l = t - t0;
  if (l < 0 || l > 0.55) return null;
  const s = l < 0.08 ? interpolate(l, [0, 0.08], [0.3, 1.15]) : interpolate(l, [0.08, 0.16, 0.55], [1.15, 1, 0.95]);
  const o = interpolate(l, [0, 0.04, 0.42, 0.55], [0, 1, 1, 0]);
  const puntos = Array.from({ length: 24 })
    .map((_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const r = i % 2 ? 48 : 30;
      return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
    })
    .join(" ");
  return (
    <div style={{ position: "absolute", left: x, top: y, width: tam, height: tam, marginLeft: -tam / 2, marginTop: -tam / 2, transform: `rotate(${rot}deg) scale(${s})`, opacity: o }}>
      <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <polygon points={puntos} fill={color} stroke="#111" strokeWidth={2.5} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: tam * 0.24, color: "white", WebkitTextStroke: `${tam * 0.012}px #111`, textShadow: "4px 4px 0 #111" }}>{texto}</div>
    </div>
  );
};

const POS = [
  { x: 300, y: 900, rot: -12 },
  { x: 780, y: 1150, rot: 10 },
  { x: 330, y: 1350, rot: 6 },
  { x: 760, y: 820, rot: -8 },
  { x: 540, y: 1250, rot: 14 },
  { x: 290, y: 1080, rot: -16 },
  { x: 770, y: 1000, rot: 8 },
];
const COLORES = ["#FFD60A", "#FF5A1F", "#FFD60A", "#E11D2E", "#FF5A1F", "#FFD60A", "#E11D2E"];

export const Taka3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const finAudio = Math.round(DUR_AUDIO * fps);
  const local = frame - finAudio;
  const entra = spring({ frame: local, fps, config: { damping: 13 } });
  const entraSub = spring({ frame: local - 12, fps, config: { damping: 14 } });
  const destello = interpolate(t, [1.86, 1.92, 2.05], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ydos = t >= 4.68 && t < 5.5 ? spring({ frame: frame - Math.round(4.68 * fps), fps, config: { damping: 9 } }) : 0;
  const contorno = "0 0 10px rgba(0,0,0,0.9), 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000";
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #2a2f3a 0%, #0b0d12 70%)" }}>
      {t < DUR_AUDIO ? <Escena t={t} /> : null}
      <AbsoluteFill style={{ backgroundColor: "white", opacity: destello }} />
      <Sequence durationInFrames={finAudio}>
        <Audio src={staticFile("sfx/memes/taka-taka.wav")} />
      </Sequence>
      <Sequence from={Math.round(1.75 * fps)} durationInFrames={30}>
        <Audio src={staticFile("sfx/mk-whoosh-zoom.wav")} volume={0.5} />
      </Sequence>
      {t < DUR_AUDIO ? (
        <>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
            <div style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 64, lineHeight: 1.16, color: "white", textAlign: "center", padding: "0 70px", textShadow: contorno }}>Yo explicándole al mecánico el ruido que hace mi carro:</div>
          </AbsoluteFill>
          {t < 1.9 ? (
            <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380 }}>
              <div style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 68, color: "#FFE14D", textAlign: "center", padding: "0 70px", textShadow: contorno }}>Resulta que de repente oímos...</div>
            </AbsoluteFill>
          ) : null}
          {TAKAS.map((k, i) => (
            <Burbuja key={k} texto="¡TAKA!" t={t} t0={k} x={POS[i].x} y={POS[i].y} rot={POS[i].rot} color={COLORES[i]} tam={360} />
          ))}
          {ydos > 0 ? (
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 500 }}>
              <div style={{ fontFamily: ANTON, fontSize: 200, color: "white", WebkitTextStroke: "6px #111", textShadow: "8px 8px 0 #E11D2E", transform: `scale(${ydos})` }}>Y DOS...</div>
            </AbsoluteFill>
          ) : null}
          {VAUS.map((k, i) => (
            <Burbuja key={k} texto="¡VAU!" t={t} t0={k} x={i ? 560 : 520} y={i ? 1180 : 1050} rot={i ? 9 : -7} color="#E11D2E" tam={620} />
          ))}
        </>
      ) : null}
      <Sequence from={finAudio}>
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #3a0d12 0%, #0b0d12 75%)" }} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 50px", gap: 36 }}>
          <div style={{ fontSize: 150, transform: `rotate(${(1 - entra) * -90}deg) scale(${entra})` }}>🔧</div>
          <div style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 66, color: "white", textAlign: "center", lineHeight: 1.12, transform: `scale(${0.6 + 0.4 * entra})`, opacity: entra, whiteSpace: "pre-line" }}>{"Tranqui 😎\nEn Doctor Auto sí\nentendemos el\n\"taka taka\""}</div>
          <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 46, color: "#111", background: "white", borderRadius: 18, padding: "16px 30px", opacity: entraSub, transform: `translateY(${(1 - entraSub) * 40}px)` }}>Diagnóstico por escáner · CDMX</div>
        </AbsoluteFill>
        <Audio src={staticFile("sfx/memes/boing.mp3")} volume={0.35} />
        <Audio src={staticFile("sfx/memes/musica.mp3")} volume={(f) => interpolate(f, [0, 8, 60, 84], [0, 0.3, 0.3, 0], { extrapolateRight: "clamp" })} />
      </Sequence>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 56, color: "rgba(255,255,255,0.8)", letterSpacing: -1 }}>doctor auto</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
