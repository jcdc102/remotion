// Mundo visual constante: fondo morado con viñeta, papel picado, pétalos,
// veladoras con luz parpadeante y grano de película. Todo con SVG y código.
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Bandera } from "../PapelPicado";
import { Petalos } from "../Petalos";

const COLORES = ["#ff3e9a", "#ff8c1a", "#ffd23f", "#2ec4b6", "#3a86ff", "#c77dff"];
const ANCHO = 150;

// Parpadeo suave tipo llama (suma de senos, determinista).
export const llama = (t: number, fase = 0) =>
  0.8 + 0.1 * Math.sin(t * 13 + fase) + 0.06 * Math.sin(t * 29 + fase * 2) + 0.04 * Math.sin(t * 47 + fase * 3);

export const Fondo: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(circle at 50% 42%, #2a0d3d 0%, #170722 55%, #0b0312 100%)",
    }}
  />
);

const Guirnalda: React.FC<{
  y: number;
  desfase: number;
  escala: number;
  t: number;
  entrada: number;
  rasgado: number;
}> = ({ y, desfase, escala, t, entrada, rasgado }) => {
  const { width } = useVideoConfig();
  const cantidad = 7;
  const separacion = width / cantidad;
  const caida = 40;
  const bajada = (1 - entrada) * -420;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${bajada}px)` }}>
      {rasgado < 0.05 ? (
        <svg width={width} height={y + caida + 10} style={{ position: "absolute", top: 0, left: 0 }}>
          <path
            d={`M-20 ${y} Q${width / 2} ${y + caida * 2} ${width + 20} ${y}`}
            stroke="#f6e7c8"
            strokeWidth={3}
            fill="none"
          />
        </svg>
      ) : null}
      {new Array(cantidad).fill(true).map((_, i) => {
        const x = separacion * (i + 0.5);
        const u = x / width;
        const yCuerda = y + caida * 4 * u * (1 - u);
        const giro = Math.sin(t * 2.2 + i * 0.9 + desfase) * 5;
        const color = COLORES[(i + Math.round(desfase)) % COLORES.length];
        const mitad = (lado: -1 | 1) => {
          const r = rasgado * (0.8 + ((i * 7) % 5) * 0.08);
          return (
            <div
              style={{
                position: "absolute",
                inset: 0,
                clipPath: lado < 0 ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)",
                transform: `translate(${lado * r * 70}px, ${r * r * 900}px) rotate(${lado * r * 50}deg)`,
                opacity: 1 - Math.max(0, r - 0.6) * 2.5,
              }}
            >
              <Bandera color={color} id={`e8-${y}-${i}-${lado}`} />
            </div>
          );
        };
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - (ANCHO * escala) / 2,
              top: yCuerda,
              width: ANCHO,
              height: 190,
              transform: `scale(${escala}) rotate(${giro}deg)`,
              transformOrigin: "top center",
              filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.35))",
            }}
          >
            {mitad(-1)}
            {mitad(1)}
          </div>
        );
      })}
    </div>
  );
};

export const PapelPicado: React.FC<{ tRasgado: number; tReentrada: number }> = ({
  tRasgado,
  tReentrada,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const reentrando = t >= tReentrada;
  // Cae al inicio (gancho) y vuelve a caer después de rasgarse.
  const entrada = spring({
    frame: reentrando ? frame - Math.round(tReentrada * fps) : frame,
    fps,
    config: { damping: 12 },
  });
  const rasgado =
    !reentrando && t >= tRasgado ? interpolate(t, [tRasgado, tRasgado + 1.4], [0, 1], { extrapolateRight: "clamp" }) : 0;
  return (
    <AbsoluteFill>
      <Guirnalda y={-6} desfase={0} escala={0.95} t={t} entrada={entrada} rasgado={rasgado} />
      <Guirnalda y={140} desfase={3} escala={0.8} t={t} entrada={entrada} rasgado={rasgado} />
    </AbsoluteFill>
  );
};

export const PetalosCayendo: React.FC = () => <Petalos cantidad={50} />;

const Vela: React.FC<{ x: number; alto: number; t: number; fase: number; luz: number }> = ({
  x,
  alto,
  t,
  fase,
  luz,
}) => {
  const f = llama(t, fase);
  return (
    <svg
      width={140}
      height={alto + 130}
      style={{ position: "absolute", left: x, bottom: 40, overflow: "visible" }}
    >
      <ellipse cx={70} cy={60} rx={70 * f} ry={80 * f} fill="#ff9f1c" opacity={0.45 * luz} style={{ filter: "blur(16px)" }} />
      <defs>
        <linearGradient id={`llama-${fase}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff6a00" />
          <stop offset="0.6" stopColor="#ffb703" />
          <stop offset="1" stopColor="#fff1b8" />
        </linearGradient>
      </defs>
      <g
        transform={`translate(70 92) rotate(${Math.sin(t * 7 + fase) * 4}) scale(${0.85 + 0.25 * f} ${0.8 + 0.4 * f}) translate(-70 -92)`}
        opacity={0.3 + 0.7 * luz}
      >
        <path d="M70 30 Q96 70 70 94 Q44 70 70 30" fill={`url(#llama-${fase})`} />
        <path d="M70 58 Q80 78 70 92 Q60 78 70 58" fill="#fffbe6" />
      </g>
      <rect x={66} y={88} width={8} height={14} fill="#2b1d12" />
      <rect x={30} y={100} width={80} height={alto} rx={8} fill="#f3e3c3" />
      <rect x={30} y={100} width={80} height={18} rx={8} fill="#fff6e3" />
      <path d={`M42 100 q4 30 0 ${alto * 0.5}`} stroke="#e8d3a8" strokeWidth={6} fill="none" />
    </svg>
  );
};

export const Veladoras: React.FC<{ luz: number }> = ({ luz }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = llama(t);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 100%, rgba(255,140,30,0.55) 0%, rgba(255,120,20,0) 60%)",
          opacity: (0.35 + 0.25 * f) * luz,
        }}
      />
      <Vela x={20} alto={190} t={t} fase={0} luz={luz} />
      <Vela x={150} alto={130} t={t} fase={2} luz={luz} />
      <Vela x={920} alto={170} t={t} fase={4} luz={luz} />
    </AbsoluteFill>
  );
};

export const Grano: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, opacity: 0.12, mixBlendMode: "overlay", pointerEvents: "none" }}
    >
      <filter id="grano-pelicula">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 60} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grano-pelicula)" />
    </svg>
  );
};

export const Vineta: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)",
      pointerEvents: "none",
    }}
  />
);
