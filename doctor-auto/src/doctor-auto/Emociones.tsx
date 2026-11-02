// Gráficos de emoción (motion graphics): stickers con emoji que aparecen con
// resorte y un leve bamboleo, ráfagas de líneas y anillos de energía.
// Reciben el tiempo global "t" (s) y el momento "t0" en que aparecen.
import { spring } from "remotion";
import { ROJO_DA } from "./constantes";

const FPS = 30;
const resorte = (t: number, t0: number, damping = 10) =>
  t < t0 ? 0 : spring({ frame: Math.round((t - t0) * FPS), fps: FPS, config: { damping, stiffness: 200 } });

// Sticker: emoji en un círculo blanco con borde rojo y sombra. Dura "vida" segundos.
export const Sticker: React.FC<{ emoji: string; x: number; y: number; t: number; t0: number; vida: number; tamano: number }> = ({
  emoji,
  x,
  y,
  t,
  t0,
  vida,
  tamano,
}) => {
  const local = t - t0;
  if (local < 0 || local > vida) return null;
  const entra = resorte(t, t0, 8);
  const sale = local > vida - 0.18 ? Math.max(0, (vida - local) / 0.18) : 1;
  const bamboleo = Math.sin(local * 7) * 6 * Math.max(0, 1 - local / vida);
  return (
    <div
      style={{
        position: "absolute",
        left: x - tamano / 2,
        top: y - tamano / 2,
        width: tamano,
        height: tamano,
        borderRadius: "50%",
        background: "#fff",
        border: `6px solid ${ROJO_DA}`,
        boxShadow: "0 14px 24px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: tamano * 0.56,
        transform: `scale(${entra * sale}) rotate(${(1 - entra) * -30 + bamboleo}deg)`,
      }}
    >
      {emoji}
    </div>
  );
};

// Ráfaga: líneas que salen desde un punto y se desvanecen (0.45 s).
export const Rafaga: React.FC<{ x: number; y: number; t: number; t0: number; radio: number; color: string; lineas?: number }> = ({
  x,
  y,
  t,
  t0,
  radio,
  color,
  lineas = 10,
}) => {
  const p = (t - t0) / 0.45;
  if (p < 0 || p > 1) return null;
  const e = 1 - (1 - p) ** 3;
  return (
    <svg width={radio * 2.4} height={radio * 2.4} style={{ position: "absolute", left: x - radio * 1.2, top: y - radio * 1.2, overflow: "visible", pointerEvents: "none" }}>
      <g transform={`translate(${radio * 1.2} ${radio * 1.2})`} opacity={1 - p}>
        {Array.from({ length: lineas }, (_, k) => {
          const a = (k / lineas) * Math.PI * 2;
          const r1 = radio * (0.35 + 0.55 * e);
          const r2 = radio * (0.55 + 0.6 * e);
          return <line key={k} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2} stroke={color} strokeWidth={7} strokeLinecap="round" />;
        })}
      </g>
    </svg>
  );
};

// Anillo: círculo que se expande y se desvanece (0.5 s).
export const Anillo: React.FC<{ x: number; y: number; t: number; t0: number; radio: number; color: string }> = ({ x, y, t, t0, radio, color }) => {
  const p = (t - t0) / 0.5;
  if (p < 0 || p > 1) return null;
  const r = radio * (0.3 + 0.9 * (1 - (1 - p) ** 2));
  return (
    <svg width={radio * 3} height={radio * 3} style={{ position: "absolute", left: x - radio * 1.5, top: y - radio * 1.5, overflow: "visible", pointerEvents: "none" }}>
      <circle cx={radio * 1.5} cy={radio * 1.5} r={r} fill="none" stroke={color} strokeWidth={8 * (1 - p) + 2} opacity={1 - p} />
    </svg>
  );
};
