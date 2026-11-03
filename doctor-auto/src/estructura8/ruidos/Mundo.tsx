// Mundo animado a pantalla completa para «5 ruidos»: ciudad nocturna con
// parallax, calle, el auto manejando, onomatopeyas y la "radiografía" de la pieza.
import { random } from "remotion";
import { ANTON, ROJO_DA } from "../../doctor-auto/constantes";
import { EstiloPanel } from "../pasar-corriente/Visuales";
import { AutoLateral, ZONAS } from "./Visuales";

const W = 1080;
const H = 1920;
// Posición del auto en pantalla (coordenadas de AutoLateral → pantalla).
export const AUTO = { x: 150, y: 330, escala: 0.92 };
export const zonaEnPantalla = (k: number) => ({ x: AUTO.x + ZONAS[k].x * AUTO.escala, y: AUTO.y + ZONAS[k].y * AUTO.escala });
const PISO = AUTO.y + 427 * AUTO.escala; // donde tocan las llantas

const edificios = (semilla: string, n: number, alturaMax: number) =>
  Array.from({ length: n }, (_, k) => ({
    x: k * (W / n) * 2.2,
    ancho: 90 + random(`${semilla}-a-${k}`) * 120,
    alto: 120 + random(`${semilla}-h-${k}`) * alturaMax,
    ventanas: Array.from({ length: 18 }, (_, v) => random(`${semilla}-v-${k}-${v}`) > 0.55),
  }));
const LEJOS = edificios("lejos", 10, 260);
const CERCA = edificios("cerca", 8, 200);
const ESTRELLAS = Array.from({ length: 60 }, (_, k) => ({ x: random(`ex${k}`) * W, y: random(`ey${k}`) * 520, r: 1 + random(`er${k}`) * 2.2, f: random(`ef${k}`) * 6 }));

const Ciudad: React.FC<{ capa: typeof LEJOS; t: number; vel: number; base: number; color: string; luz: string }> = ({ capa, t, vel, base, color, luz }) => {
  const largo = W * 2.2;
  const dx = -((t * vel) % largo);
  return (
    <g transform={`translate(${dx} 0)`}>
      {[0, largo].map((off) =>
        capa.map((b, k) => (
          <g key={`${off}-${k}`} transform={`translate(${b.x + off} ${base - b.alto})`}>
            <rect width={b.ancho} height={b.alto} fill={color} />
            {b.ventanas.map((on, v) =>
              on ? <rect key={v} x={12 + (v % 3) * ((b.ancho - 30) / 3)} y={16 + Math.floor(v / 3) * 26} width={14} height={12} fill={luz} opacity={0.75} /> : null,
            )}
          </g>
        )),
      )}
    </g>
  );
};

// Escena de la calle de noche con el auto. "alarma" tiñe todo de rojo con luces que barren.
export const CalleNocturna: React.FC<{
  t: number;
  vel: number; // velocidad de la escena (0 = auto detenido)
  zona: number | null;
  faseOnda: number;
  numeros: number[];
  rebote: number; // desplazamiento vertical del auto (tope)
  alarma: number;
  tope: number | null; // posición x del tope en pantalla, o null
  autoX: number; // desplazamiento horizontal del auto
}> = ({ t, vel, zona, faseOnda, numeros, rebote, alarma, tope, autoX }) => {
  const vibra = vel > 0 ? Math.sin(t * 40) * 1.5 : 0;
  const humo = Array.from({ length: 5 }, (_, k) => {
    const p = (t * 1.4 + k / 5) % 1;
    return { x: AUTO.x + 130 * AUTO.escala - p * 160 + autoX, y: PISO - 40 - p * 40, r: 14 + p * 30, o: (1 - p) * 0.35 * Math.min(1, vel / 200 + 0.3) };
  });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07070c" />
          <stop offset="0.55" stopColor="#1a0b10" />
          <stop offset="1" stopColor="#4a1216" />
        </linearGradient>
        <linearGradient id="suelo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c1c1f" />
          <stop offset="1" stopColor="#0c0c0d" />
        </linearGradient>
        <filter id="borroso" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <pattern id="asfalto" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform={`translate(${-(t * vel) % 24} 0)`}>
          <circle cx={4} cy={6} r={1.4} fill="#555" />
          <circle cx={16} cy={18} r={1.1} fill="#444" />
          <circle cx={19} cy={4} r={0.9} fill="#666" />
        </pattern>
        <linearGradient id="lectura" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={0} />
          <stop offset="0.25" stopColor="#000" stopOpacity={0.35} />
          <stop offset="1" stopColor="#000" stopOpacity={0.15} />
        </linearGradient>
        <radialGradient id="faro" cx="0" cy="0.5" r="1">
          <stop offset="0" stopColor="#FFF3B0" stopOpacity={0.55} />
          <stop offset="1" stopColor="#FFF3B0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={PISO + 10} fill="url(#cielo)" />
      {ESTRELLAS.map((e, k) => (
        <circle key={k} cx={e.x} cy={e.y} r={e.r} fill="#fff" opacity={0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + e.f))} />
      ))}
      <circle cx={860} cy={360} r={46} fill="#f3e3c3" opacity={0.85} />
      <Ciudad capa={LEJOS} t={t} vel={vel * 0.15} base={PISO - 60} color="#16090d" luz="#ffb46b" />
      <Ciudad capa={CERCA} t={t} vel={vel * 0.35} base={PISO - 30} color="#0d0608" luz="#ff8a5c" />
      {/* postes de luz que pasan */}
      {Array.from({ length: 4 }, (_, k) => {
        const x = ((k * 420 - t * vel * 0.8) % 1680 + 1680) % 1680 - 300;
        return (
          <g key={k}>
            <path d={`M${x} ${PISO} V${PISO - 330} h50`} stroke="#2a2a2e" strokeWidth={10} fill="none" />
            <path d={`M${x + 50} ${PISO - 330} l-90 330 h220 Z`} fill="#ffcf7a" opacity={0.08} />
            <circle cx={x + 52} cy={PISO - 322} r={10} fill="#ffe2a0" />
          </g>
        );
      })}
      {/* calle */}
      <rect y={PISO - 10} width={W} height={H - PISO + 10} fill="url(#suelo)" />
      <rect y={PISO - 10} width={W} height={12} fill="#3a3a40" />
      {Array.from({ length: 8 }, (_, k) => {
        const x = ((k * 200 - t * vel) % 1600 + 1600) % 1600 - 200;
        return <rect key={k} x={x} y={PISO + 60} width={110} height={12} rx={6} fill="#e8e8e8" opacity={0.7} />;
      })}
      {/* textura del asfalto */}
      <rect y={PISO} width={W} height={H - PISO} fill="url(#asfalto)" opacity={0.5} />
      {/* reflejos de los postes y las ventanas en el piso mojado */}
      {Array.from({ length: 4 }, (_, k) => {
        const x = ((k * 420 - t * vel * 0.8) % 1680 + 1680) % 1680 - 300 + 52;
        return <ellipse key={k} cx={x} cy={PISO + 260} rx={34} ry={230} fill="#ffcf7a" opacity={0.1} filter="url(#borroso)" />;
      })}
      {Array.from({ length: 9 }, (_, k) => {
        const x = ((k * 150 - t * vel * 0.35) % 1350 + 1350) % 1350 - 100;
        return <rect key={k} x={x} y={PISO + 40} width={18} height={180 + (k % 3) * 60} fill={k % 2 ? "#ff8a5c" : "#ffb46b"} opacity={0.08} filter="url(#borroso)" />;
      })}
      {/* charcos con ondas */}
      {[
        { x: 260, y: PISO + 330, f: 0 },
        { x: 820, y: PISO + 520, f: 0.5 },
      ].map((c, k) => {
        const x = ((c.x - t * vel) % 1400 + 1400) % 1400 - 160;
        const fase = (t * 0.8 + c.f) % 1;
        return (
          <g key={k}>
            <ellipse cx={x} cy={c.y} rx={150} ry={26} fill="#2b2f3a" opacity={0.7} />
            <ellipse cx={x} cy={c.y} rx={40 + 110 * fase} ry={7 + 18 * fase} fill="none" stroke="#9fb4ff" strokeOpacity={0.35 * (1 - fase)} strokeWidth={3} />
          </g>
        );
      })}
      {/* banqueta que pasa */}
      <rect y={H - 380} width={W} height={380} fill="#2a2a2e" />
      <rect y={H - 380} width={W} height={18} fill="#4a4a50" />
      {Array.from({ length: 7 }, (_, k) => {
        const x = ((k * 220 - t * vel * 1.3) % 1540 + 1540) % 1540 - 220;
        return <rect key={k} x={x} y={H - 362} width={6} height={362} fill="#1c1c20" />;
      })}
      {/* oscurecido suave detrás de subtítulos y mascota para que se lean */}
      <rect y={PISO + 120} width={W} height={H - PISO - 120} fill="url(#lectura)" />
      {/* reflejo rojo del auto en el piso mojado */}
      <ellipse cx={AUTO.x + 520 * AUTO.escala + autoX} cy={PISO + 30} rx={360} ry={28} fill={ROJO_DA} opacity={0.12} />
      {tope !== null ? (
        <g>
          <path d={`M${tope - 80} ${PISO + 2} Q${tope} ${PISO - 60} ${tope + 80} ${PISO + 2} Z`} fill="#FFD43B" stroke="#111" strokeWidth={5} />
          {[-40, 0, 40].map((d) => (
            <rect key={d} x={tope + d - 12} y={PISO - 34 + Math.abs(d) * 0.55} width={24} height={14} fill="#111" />
          ))}
        </g>
      ) : null}
      {humo.map((h, k) => (
        <circle key={k} cx={h.x} cy={h.y} r={h.r} fill="#9a9aa2" opacity={h.o} />
      ))}
      <g transform={`translate(${autoX} ${rebote + vibra})`}>
        <path d={`M${AUTO.x + 895 * AUTO.escala} ${AUTO.y + 294 * AUTO.escala} l360 -110 v230 Z`} fill="url(#faro)" />
        <g transform={`translate(${AUTO.x} ${AUTO.y}) scale(${AUTO.escala})`}>
          <AutoLateral zona={zona} fase={faseOnda} numeros={numeros} giroRueda={t * vel * 1.2} />
        </g>
      </g>
      {/* alarma: luces rojas que barren */}
      <g opacity={alarma}>
        <rect width={W} height={H} fill={ROJO_DA} opacity={0.18 + 0.1 * Math.sin(t * Math.PI * 2 * 1.5)} />
        {[0, 1].map((k) => (
          <path key={k} d="M540 260 L-200 0 L-200 520 Z" fill={ROJO_DA} opacity={0.22} transform={`rotate(${(t * 120 + k * 180) % 360} 540 260)`} />
        ))}
      </g>
    </svg>
  );
};

// Onomatopeya: palabra grande que estalla con resorte, tiembla y se va.
export const Onomatopeya: React.FC<{ texto: string; x: number; y: number; t: number; t0: number; vida: number; giro: number }> = ({ texto, x, y, t, t0, vida, giro }) => {
  const l = t - t0;
  if (l < 0 || l > vida) return null;
  const entra = Math.min(1, l / 0.12);
  const escala = 0.4 + 0.75 * entra - 0.15 * Math.max(0, Math.min(1, (l - 0.12) / 0.15));
  const sale = l > vida - 0.2 ? (vida - l) / 0.2 : 1;
  const tiembla = Math.sin(l * 70) * 5 * Math.max(0, 1 - l / 0.5);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translate(${tiembla}px, 0) rotate(${giro}deg) scale(${escala})`,
        opacity: sale,
        fontFamily: ANTON,
        fontSize: 120,
        lineHeight: 1,
        color: "#FFD43B",
        WebkitTextStroke: "12px #000",
        paintOrder: "stroke fill",
        textShadow: `0 10px 0 ${ROJO_DA}, 0 18px 30px rgba(0,0,0,0.6)`,
        whiteSpace: "nowrap",
      }}
    >
      {texto}
    </div>
  );
};

// Radiografía: fondo técnico a pantalla completa (rejilla que se mueve, línea de
// escaneo, marcos de HUD y brillo rojo) con la pieza grande al centro.
export const Radiografia: React.FC<{ t: number; entrada: number; children: React.ReactNode }> = ({ t, entrada, children }) => {
  const escaneo = 300 + ((t * 260) % 620);
  return (
    <>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="brillo-rx" cx="0.5" cy="0.32" r="0.6">
            <stop offset="0" stopColor="#5a1418" />
            <stop offset="0.6" stopColor="#14090b" />
            <stop offset="1" stopColor="#08080a" />
          </radialGradient>
          <pattern id="rejilla" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 20) % 60} ${(t * 12) % 60})`}>
            <path d="M60 0 H0 V60" fill="none" stroke="#ff6b6b" strokeOpacity={0.12} strokeWidth={2} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#brillo-rx)" />
        <rect width={W} height={H} fill="url(#rejilla)" />
        <rect x={0} y={escaneo} width={W} height={4} fill="#ff6b6b" opacity={0.35} />
        <rect x={0} y={escaneo - 60} width={W} height={60} fill="#ff6b6b" opacity={0.05} />
        {/* marcos de HUD */}
        {[
          [70, 330, 1, 1],
          [1010, 330, -1, 1],
          [70, 860, 1, -1],
          [1010, 860, -1, -1],
        ].map(([x, y, sx, sy], k) => (
          <path key={k} d={`M${x} ${y + sy * 60} V${y} H${x + sx * 60}`} stroke="#fff" strokeOpacity={0.7} strokeWidth={5} fill="none" />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${1.25 - 0.25 * entrada})`, transformOrigin: "540px 600px", opacity: Math.min(1, entrada * 2) }}>
        <EstiloPanel.Provider value={{ fondo: false, x: 30, y: 340, ancho: 1020, alto: 500 }}>{children}</EstiloPanel.Provider>
      </div>
    </>
  );
};
