// Visuales sueltos (fuera del diagrama de los dos autos). Todos se dibujan en el
// mismo panel gris oscuro y reciben "p" = avance dentro de su animación (0..1).
import { createContext, useContext } from "react";
import { ANTON, ROJO_DA } from "../../doctor-auto/constantes";
import { Reloj } from "../alineacion/Iconos";
import { Chispa, PANEL, Pinza, VISTA } from "./Diagrama";

// Por defecto el dibujo va en un panel gris; un tema puede usarlo a pantalla
// completa y sin fondo con <EstiloPanel.Provider>.
export const EstiloPanel = createContext({ fondo: true, x: PANEL.x, y: PANEL.y, ancho: PANEL.ancho, alto: PANEL.alto });

const Panel: React.FC<{ children: React.ReactNode; transform?: string }> = ({ children, transform }) => {
  const e = useContext(EstiloPanel);
  return (
    <svg
      width={e.ancho}
      height={e.alto}
      viewBox={VISTA}
      style={{ position: "absolute", left: e.x, top: e.y, transform, overflow: e.fondo ? "hidden" : "visible", borderRadius: e.fondo ? 27 : 0 }}
    >
      {e.fondo ? <rect x={0} y={0} width={940} height={460} rx={30} fill="#2A2A2A" /> : null}
      {children}
    </svg>
  );
};

// c01: dos pinzas que se acercan y sacan una chispa grande al tocarse.
export const ChispaEntrePinzas: React.FC<{ acerca: number; chispa: number; temblor: number }> = ({ acerca, chispa, temblor }) => {
  const sep = 300 * (1 - acerca) + 46;
  return (
    <Panel transform={`translate(${temblor}px, ${temblor * 0.4}px)`}>
      <g transform={`translate(${470 - sep} 230) scale(3)`}>
        <path d={`M-46 0 Q-120 40 -200 10`} stroke={ROJO_DA} strokeWidth={6} fill="none" />
        <Pinza color="roja" angulo={0} escala={1} />
      </g>
      <g transform={`translate(${470 + sep} 230) scale(3) rotate(180)`}>
        <path d={`M-46 0 Q-120 40 -200 10`} stroke="#fff" strokeWidth={9} fill="none" />
        <path d={`M-46 0 Q-120 40 -200 10`} stroke="#111" strokeWidth={6} fill="none" />
        <Pinza color="negra" angulo={0} escala={1} />
      </g>
      <circle cx={470} cy={230} r={40 + 90 * chispa} fill="#FFD43B" opacity={0.35 * chispa} />
      <Chispa x={470} y={226} tamano={120} opacidad={chispa} />
      <g transform="translate(470 236) rotate(180)">
        <Chispa x={0} y={0} tamano={90} opacidad={chispa} />
      </g>
    </Panel>
  );
};

// c03: llave que se apaga, freno de mano que sube y foco que se apaga.
export const LlavesFrenoLuces: React.FC<{ llave: number; freno: number; luces: number }> = ({ llave, freno, luces }) => (
  <Panel>
    <g transform="translate(170 230)" opacity={0.3 + 0.7 * Math.min(1, llave * 3)}>
      <circle r={90} fill="#1f1f1f" stroke="#fff" strokeWidth={4} />
      <g transform={`rotate(${-90 * llave})`}>
        <circle cy={-34} r={30} fill="#C8C8C8" stroke="#fff" strokeWidth={3} />
        <rect x={-9} y={-10} width={18} height={70} rx={4} fill="#C8C8C8" stroke="#fff" strokeWidth={3} />
        <rect x={9} y={30} width={12} height={8} fill="#C8C8C8" />
        <rect x={9} y={44} width={10} height={8} fill="#C8C8C8" />
      </g>
      <circle cx={-62} cy={-62} r={8} fill={llave > 0.9 ? ROJO_DA : "#4ade80"} />
    </g>
    <g transform="translate(470 300)" opacity={0.3 + 0.7 * Math.min(1, freno * 3)}>
      <rect x={-70} y={10} width={140} height={40} rx={12} fill="#1f1f1f" stroke="#fff" strokeWidth={4} />
      <g transform={`rotate(${-38 * freno} -50 20)`}>
        <rect x={-50} y={0} width={150} height={30} rx={15} fill="#555" stroke="#fff" strokeWidth={4} />
        <rect x={74} y={-4} width={36} height={38} rx={10} fill="#111" stroke="#fff" strokeWidth={3} />
      </g>
      <circle cx={0} cy={-120} r={34} fill="none" stroke={freno > 0.9 ? ROJO_DA : "#555"} strokeWidth={6} />
      <text x={0} y={-106} textAnchor="middle" fontFamily={ANTON} fontSize={40} fill={freno > 0.9 ? ROJO_DA : "#555"}>
        P
      </text>
    </g>
    <g transform="translate(770 220)" opacity={0.3 + 0.7 * Math.min(1, luces * 3)}>
      <circle r={70 * (1 - luces)} fill="#FFF3B0" opacity={0.35 * (1 - luces)} />
      <path d="M-40 -10 A40 40 0 1 1 40 -10 Q30 20 22 40 L-22 40 Q-30 20 -40 -10 Z" fill={luces > 0.5 ? "#555" : "#FFF3B0"} stroke="#fff" strokeWidth={4} />
      <rect x={-22} y={44} width={44} height={26} rx={5} fill="#888" stroke="#fff" strokeWidth={3} />
      <line x1={-50} y1={70} x2={50} y2={-70} stroke={ROJO_DA} strokeWidth={8} strokeLinecap="round" opacity={luces > 0.8 ? 1 : 0} />
    </g>
  </Panel>
);

// c04: las cuatro pinzas giran y se acomodan en orden 1-2-3-4.
export const PinzasGiran: React.FC<{ p: number }> = ({ p }) => {
  const colores = ["roja", "roja", "negra", "negra"] as const;
  const inicio = [
    { x: 200, y: 120 },
    { x: 760, y: 340 },
    { x: 520, y: 90 },
    { x: 260, y: 360 },
  ];
  return (
    <Panel>
      {colores.map((c, k) => {
        const destino = { x: 200 + k * 180, y: 220 };
        const q = Math.min(1, Math.max(0, p * 1.25 - k * 0.08));
        const x = inicio[k].x + (destino.x - inicio[k].x) * q;
        const y = inicio[k].y + (destino.y - inicio[k].y) * q;
        return (
          <g key={k}>
            <g transform={`translate(${x} ${y}) scale(2.4)`}>
              <Pinza color={c} angulo={(1 - q) * 720 - 90} escala={1} />
            </g>
            <g transform={`translate(${destino.x} 360) scale(${q})`} opacity={q}>
              <circle r={26} fill="#fff" stroke="#000" strokeWidth={3} />
              <text y={12} textAnchor="middle" fontFamily={ANTON} fontSize={34} fill="#151515">
                {k + 1}
              </text>
            </g>
          </g>
        );
      })}
    </Panel>
  );
};

// c06: reloj con signo de interrogación.
export const RelojInterrogacion: React.FC<{ t: number; signo: number }> = ({ t, signo }) => (
  <Panel>
    <foreignObject x={330} y={60} width={280} height={280}>
      <Reloj tamano={280} t={t} />
    </foreignObject>
    <text x={660} y={250} fontFamily={ANTON} fontSize={200} fill={ROJO_DA} stroke="#fff" strokeWidth={6} paintOrder="stroke" transform={`rotate(12 660 250)`} opacity={signo}>
      ?
    </text>
  </Panel>
);

// c07d: odómetro que llega a 20 min y batería que se llena.
export const OdometroBateria: React.FC<{ p: number }> = ({ p }) => {
  const minutos = Math.round(20 * Math.min(1, p / 0.8));
  const carga = Math.min(1, p / 0.85);
  const barras = 5;
  return (
    <Panel>
      <g transform="translate(260 230)">
        <rect x={-180} y={-90} width={360} height={180} rx={24} fill="#111" stroke="#fff" strokeWidth={5} />
        <text x={-20} y={40} textAnchor="middle" fontFamily={ANTON} fontSize={120} fill="#fff">
          {String(minutos).padStart(2, "0")}
        </text>
        <text x={120} y={40} textAnchor="middle" fontFamily={ANTON} fontSize={48} fill={ROJO_DA}>
          min
        </text>
      </g>
      <g transform="translate(690 230)">
        <rect x={-150} y={-80} width={290} height={160} rx={20} fill="#1f1f1f" stroke="#fff" strokeWidth={5} />
        <rect x={140} y={-28} width={22} height={56} rx={6} fill="#fff" />
        {Array.from({ length: barras }, (_, k) => (
          <rect key={k} x={-132 + k * 54} y={-60} width={44} height={120} rx={8} fill={k < carga * barras - 0.01 ? "#22c55e" : "#333"} />
        ))}
      </g>
    </Panel>
  );
};

export { Panel };
