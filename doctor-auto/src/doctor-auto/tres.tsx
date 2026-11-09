// Objetos 3D reales (three.js con @remotion/three): moneda MITO/REALIDAD, llanta y
// batería, con luces de estudio, reflejos de un entorno y sombras suaves.
// Cada escena 3D recibe el tiempo "t" (s) y se dibuja a 1080×1920.
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { ROJO_DA } from "./constantes";

const W = 1080;
const H = 1920;

// Reflejos de estudio para los metales.
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

const Luces: React.FC<{ acento: string }> = ({ acento }) => (
  <>
    <ambientLight intensity={0.55} />
    <directionalLight position={[3, 5, 6]} intensity={2.2} />
    <pointLight position={[-4, 1, 3]} intensity={30} color={acento} distance={14} />
    <pointLight position={[4, -2, 2]} intensity={14} color="#ffd9a8" distance={12} />
    {/* luz de contorno por detrás para separar los objetos oscuros del fondo */}
    <pointLight position={[2.5, 3, -3]} intensity={60} color="#ffffff" distance={16} />
    <pointLight position={[-3, -2.5, -2]} intensity={40} color={acento} distance={14} />
  </>
);

// Lienzo 3D a pantalla completa con cámara de 35°.
export const Escena3D: React.FC<{ children: React.ReactNode; acento?: string; z?: number }> = ({ children, acento = ROJO_DA, z = 9 }) => (
  <ThreeCanvas width={W} height={H} style={{ position: "absolute", inset: 0 }} camera={{ fov: 35, position: [0, 0, z] }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, preserveDrawingBuffer: true }}>
    <Entorno />
    <Luces acento={acento} />
    {children}
  </ThreeCanvas>
);

// Textura de una cara de la moneda (texto grande y aro).
const caraMoneda = (texto: string, fondo: string, marca: string) => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const g = c.getContext("2d") as CanvasRenderingContext2D;
  const grad = g.createRadialGradient(400, 360, 60, 512, 512, 520);
  grad.addColorStop(0, "#ffffff22");
  grad.addColorStop(1, "#00000055");
  g.fillStyle = fondo;
  g.fillRect(0, 0, 1024, 1024);
  g.fillStyle = grad;
  g.fillRect(0, 0, 1024, 1024);
  g.strokeStyle = "#fff";
  g.lineWidth = 26;
  g.beginPath();
  g.arc(512, 512, 440, 0, Math.PI * 2);
  g.stroke();
  g.setLineDash([18, 26]);
  g.lineWidth = 8;
  g.beginPath();
  g.arc(512, 512, 390, 0, Math.PI * 2);
  g.stroke();
  g.setLineDash([]);
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `${texto.length > 5 ? 170 : 250}px Anton, Impact, sans-serif`;
  g.fillText(texto, 512, 560);
  g.font = "150px sans-serif";
  g.fillText(marca, 512, 300);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

// Moneda 3D: frente MITO (rojo), reverso REALIDAD (verde). giro en grados sobre el eje vertical.
export const Moneda3D: React.FC<{ giro: number; inclina: number; x: number; y: number; escala: number }> = ({ giro, inclina, x, y, escala }) => {
  const materiales = useMemo(() => {
    const canto = new THREE.MeshStandardMaterial({ color: "#d9b25a", metalness: 1, roughness: 0.25 });
    const frente = new THREE.MeshStandardMaterial({ map: caraMoneda("MITO", "#c4161d", "✗"), metalness: 0.45, roughness: 0.35 });
    const reverso = new THREE.MeshStandardMaterial({ map: caraMoneda("REALIDAD", "#16924f", "✓"), metalness: 0.45, roughness: 0.35 });
    return [canto, frente, reverso];
  }, []);
  return (
    <group position={[x, y, 0]} scale={escala} rotation={[inclina, (giro * Math.PI) / 180, 0]}>
      {/* El cilindro se gira para que sus tapas miren a la cámara. */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materiales}>
        <cylinderGeometry args={[1.6, 1.6, 0.22, 96]} />
      </mesh>
      {/* estrías del canto */}
      <mesh>
        <torusGeometry args={[1.6, 0.03, 8, 96]} />
        <meshStandardMaterial color="#f2d58a" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
};

// Llanta 3D con rin de rayos: gira sobre su eje (giro, grados) y se inclina (orbita).
export const Llanta3D: React.FC<{ giro: number; orbita: number; x: number; y: number; escala: number; calor: number }> = ({ giro, orbita, x, y, escala, calor }) => {
  const rayos = [0, 1, 2, 3, 4, 5];
  return (
    <group position={[x, y, 0]} scale={escala} rotation={[0.12, orbita, 0]}>
      <group rotation={[0, 0, (-giro * Math.PI) / 180]}>
        <mesh>
          <torusGeometry args={[1.45, 0.55, 48, 128]} />
          <meshStandardMaterial color="#26262a" roughness={0.55} metalness={0.1} emissive="#ff4a10" emissiveIntensity={calor * 0.35} />
        </mesh>
        {/* dibujo de la banda */}
        {Array.from({ length: 48 }, (_, k) => {
          const a = (k / 48) * Math.PI * 2;
          return (
            <mesh key={k} position={[Math.cos(a) * 1.98, Math.sin(a) * 1.98, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[0.1, 0.16, 0.9]} />
              <meshStandardMaterial color="#0b0b0c" roughness={0.9} />
            </mesh>
          );
        })}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.05, 1.05, 0.5, 64]} />
          <meshStandardMaterial color="#d7dde6" metalness={0.85} roughness={0.22} />
        </mesh>
        {rayos.map((k) => (
          <mesh key={k} rotation={[0, 0, (k / rayos.length) * Math.PI * 2]} position={[0, 0, 0.27]}>
            <boxGeometry args={[0.22, 1.9, 0.12]} />
            <meshStandardMaterial color="#2a2d33" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.12, 32]} />
          <meshStandardMaterial color={ROJO_DA} metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

// Batería 3D: caja con tapa, bornes y banda roja; "carga" (0–1) ilumina sus barras.
export const Bateria3D: React.FC<{ giro: number; x: number; y: number; escala: number; carga: number; escarcha: number }> = ({ giro, x, y, escala, carga, escarcha }) => {
  const colorCarga = carga > 0.6 ? "#3ddc84" : carga > 0.3 ? "#ffb020" : "#ff3b3b";
  return (
    <group position={[x, y, 0]} scale={escala} rotation={[0.35, giro, 0]}>
      <mesh>
        <boxGeometry args={[3, 1.9, 1.7]} />
        <meshStandardMaterial color="#26282e" roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[3.08, 0.16, 1.78]} />
        <meshStandardMaterial color={escarcha > 0.5 ? "#dff4ff" : "#3a3d45"} roughness={escarcha > 0.5 ? 0.9 : 0.4} />
      </mesh>
      <mesh position={[0, 0.25, 0.86]}>
        <boxGeometry args={[3.02, 0.5, 0.02]} />
        <meshStandardMaterial color={ROJO_DA} roughness={0.4} />
      </mesh>
      {[-0.95, 0.95].map((bx, k) => (
        <mesh key={bx} position={[bx, 1.3, 0]}>
          <cylinderGeometry args={[0.18, 0.2, 0.4, 24]} />
          <meshStandardMaterial color={k === 0 ? ROJO_DA : "#111"} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 5 }, (_, k) => (
        <mesh key={k} position={[-1.05 + k * 0.52, -0.45, 0.86]}>
          <boxGeometry args={[0.4, 0.5, 0.04]} />
          <meshStandardMaterial color={k < Math.round(carga * 5) ? colorCarga : "#2c2e34"} emissive={k < Math.round(carga * 5) ? colorCarga : "#000"} emissiveIntensity={0.9} />
        </mesh>
      ))}
    </group>
  );
};
