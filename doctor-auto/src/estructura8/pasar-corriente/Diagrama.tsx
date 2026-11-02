// Diagrama de dos autos vistos desde arriba (capós hacia arriba) con las
// baterías, la pieza de metal sin pintar y las cuatro pinzas.
// Coordenadas internas: 940 x 460, dibujadas al 90% (el panel ocupa x 117–963, y 352–766).
import { ANTON, ROJO_DA } from "../../doctor-auto/constantes";

export const PANEL = { x: 117, y: 352, ancho: 846, alto: 414, escala: 0.9 };
export const VISTA = "0 0 940 460";
const BUENO = 235;
const MUERTO = 705;

// Puntos de conexión (coordenadas del panel), en el orden de conexión.
export const DESTINOS = [
  { x: MUERTO - 80, y: 132, color: "roja" }, // 1: positivo de la muerta
  { x: BUENO - 80, y: 132, color: "roja" }, // 2: positivo de la buena
  { x: BUENO - 30, y: 132, color: "negra" }, // 3: negativo de la buena
  { x: MUERTO + 57, y: 168, color: "negra" }, // 4: metal sin pintar del motor muerto
] as const;
const ORIGEN = { roja: { x: 470, y: 250 }, negra: { x: 470, y: 290 } };
export const METAL_ABSOLUTO = { x: PANEL.x + DESTINOS[3].x * PANEL.escala, y: PANEL.y + DESTINOS[3].y * PANEL.escala };

const punto = (k: number, s: number) => {
  const d = DESTINOS[k];
  const o = ORIGEN[d.color];
  const c = { x: (o.x + d.x) / 2, y: Math.max(o.y, d.y) + 110 };
  const u = 1 - s;
  return {
    x: u * u * o.x + 2 * u * s * c.x + s * s * d.x,
    y: u * u * o.y + 2 * u * s * c.y + s * s * d.y,
    ruta: `M${o.x} ${o.y} Q${c.x} ${c.y} ${d.x} ${d.y}`,
    angulo: (Math.atan2(2 * u * (c.y - o.y) + 2 * s * (d.y - c.y), 2 * u * (c.x - o.x) + 2 * s * (d.x - c.x)) * 180) / Math.PI,
  };
};

const Pinza: React.FC<{ color: "roja" | "negra"; angulo: number; escala: number }> = ({ color, angulo, escala }) => {
  const relleno = color === "roja" ? ROJO_DA : "#111";
  return (
    <g transform={`rotate(${angulo}) scale(${escala})`}>
      <rect x={-46} y={-11} width={34} height={22} rx={6} fill={relleno} stroke="#fff" strokeWidth={3} />
      <path d="M-14 -11 L10 -6 L10 -1 L-14 -2 Z" fill={relleno} stroke="#fff" strokeWidth={2.5} />
      <path d="M-14 11 L10 6 L10 1 L-14 2 Z" fill={relleno} stroke="#fff" strokeWidth={2.5} />
    </g>
  );
};

const Numero: React.FC<{ x: number; y: number; n: number; escala: number }> = ({ x, y, n, escala }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`} opacity={escala > 0.01 ? 1 : 0}>
    <circle r={19} fill="#fff" stroke="#000" strokeWidth={3} />
    <text y={9} textAnchor="middle" fontFamily={ANTON} fontSize={26} fill="#151515">
      {n}
    </text>
  </g>
);

const Chispa: React.FC<{ x: number; y: number; tamano: number; opacidad: number }> = ({ x, y, tamano, opacidad }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacidad}>
    {[-40, 10, 60].map((a) => (
      <line
        key={a}
        x1={Math.cos((a * Math.PI) / 180) * tamano * 0.25}
        y1={-Math.sin((a * Math.PI) / 180) * tamano * 0.25}
        x2={Math.cos((a * Math.PI) / 180) * tamano}
        y2={-Math.sin((a * Math.PI) / 180) * tamano}
        stroke="#FFD43B"
        strokeWidth={Math.max(4, tamano * 0.12)}
        strokeLinecap="round"
      />
    ))}
  </g>
);

const Auto: React.FC<{ cx: number; faros: number; tablero: number; metal: boolean }> = ({ cx, faros, tablero, metal }) => (
  <g>
    <defs>
      <radialGradient id={`haz-${cx}`} cx="0.5" cy="1" r="1">
        <stop offset="0" stopColor="#FFF3B0" stopOpacity={0.9} />
        <stop offset="1" stopColor="#FFF3B0" stopOpacity={0} />
      </radialGradient>
    </defs>
    {[-70, 70].map((dx) => (
      <ellipse key={dx} cx={cx + dx} cy={70} rx={46} ry={62} fill={`url(#haz-${cx})`} opacity={faros} />
    ))}
    <rect x={cx - 115} y={95} width={230} height={335} rx={60} fill="#3d3d3d" stroke="#fff" strokeWidth={4} />
    {[-70, 70].map((dx) => (
      <ellipse key={dx} cx={cx + dx} cy={106} rx={24} ry={11} fill={faros > 0.1 ? "#FFF3B0" : "#6b6b6b"} stroke="#fff" strokeWidth={2} />
    ))}
    <path d={`M${cx - 92} 238 L${cx + 92} 238 L${cx + 78} 282 L${cx - 78} 282 Z`} fill="#1b1b1b" stroke="#777" strokeWidth={2} />
    <rect x={cx - 80} y={286} width={160} height={92} rx={14} fill="#333" />
    <path d={`M${cx - 74} 384 L${cx + 74} 384 L${cx + 84} 410 L${cx - 84} 410 Z`} fill="#1b1b1b" />
    {/* tablero */}
    {[-40, 0, 40].map((dx, k) => (
      <circle key={dx} cx={cx + dx} cy={226} r={6} fill={["#4ade80", "#FFD43B", ROJO_DA][k]} opacity={0.15 + 0.85 * tablero} />
    ))}
    {/* batería en el capó */}
    <rect x={cx - 108} y={112} width={104} height={66} rx={9} fill="#555" stroke="#fff" strokeWidth={3} />
    {metal ? (
      // Pieza de metal sin pintar del motor, separada de la batería.
      <g>
        <rect x={cx + 25} y={140} width={66} height={56} rx={8} fill="#C8C8C8" stroke="#fff" strokeWidth={3} />
        <circle cx={cx + 38} cy={152} r={4} fill="#8a8a8a" />
        <circle cx={cx + 78} cy={184} r={4} fill="#8a8a8a" />
      </g>
    ) : null}
  </g>
);

const Terminales: React.FC<{ cx: number }> = ({ cx }) => (
  <g fontFamily={ANTON} fontSize={30} textAnchor="middle">
    <circle cx={cx - 80} cy={132} r={16} fill={ROJO_DA} stroke="#fff" strokeWidth={3} />
    <text x={cx - 80} y={143} fill="#fff">+</text>
    <circle cx={cx - 30} cy={132} r={16} fill="#111" stroke="#fff" strokeWidth={3} />
    <text x={cx - 30} y={142} fill="#fff">−</text>
  </g>
);

export type EstadoDiagrama = {
  conexion: number[]; // 0..1 por pinza (1 = conectada)
  cierre: number[]; // rebote al cerrar, 1 = reposo
  numeros: number[]; // escala de los números 1..4
  equis: number; // "X" roja sobre el negativo de la muerta
  palomita: number;
  chispa: number; // chispa corta en la pinza 4
  muertoEncendido: number; // 0 = atenuado (40%), 1 = encendido
  ondas: number; // fase de las ondas de energía (0 = sin ondas)
};

export const Diagrama: React.FC<{ estado: EstadoDiagrama; escala: number }> = ({ estado, escala }) => {
  const opacidadMuerto = 0.4 + 0.6 * estado.muertoEncendido;
  return (
    <svg
      width={PANEL.ancho}
      height={PANEL.alto}
      viewBox={VISTA}
      style={{ position: "absolute", left: PANEL.x, top: PANEL.y, transform: `scale(${escala})`, transformOrigin: "50% 0%" }}
    >
      <rect x={0} y={0} width={940} height={460} rx={30} fill="#2A2A2A" />
      <Auto cx={BUENO} faros={1} tablero={1} metal={false} />
      <g opacity={opacidadMuerto}>
        <Auto cx={MUERTO} faros={estado.muertoEncendido} tablero={estado.muertoEncendido} metal />
      </g>
      <Terminales cx={BUENO} />
      <Terminales cx={MUERTO} />
      {/* etiquetas sobre cada auto */}
      {[
        { cx: BUENO, texto: "BUENO" },
        { cx: MUERTO, texto: "MUERTO" },
      ].map((e) => (
        <text key={e.texto} x={e.cx} y={346} textAnchor="middle" fontFamily={ANTON} fontSize={44} fill="#fff" stroke="#000" strokeWidth={6} paintOrder="stroke">
          {e.texto}
        </text>
      ))}
      {/* cables y pinzas */}
      {DESTINOS.map((d, k) => {
        const s = estado.conexion[k];
        if (s <= 0.001) return null;
        const p = punto(k, s);
        const colorCable = d.color === "roja" ? ROJO_DA : "#111";
        return (
          <g key={k}>
            {d.color === "negra" ? (
              <path d={p.ruta} stroke="#fff" strokeWidth={11} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - s} strokeLinecap="round" />
            ) : null}
            <path d={p.ruta} stroke={colorCable} strokeWidth={7} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - s} strokeLinecap="round" />
            <g transform={`translate(${p.x} ${p.y})`}>
              <Pinza color={d.color} angulo={p.angulo} escala={estado.cierre[k]} />
            </g>
          </g>
        );
      })}
      {/* ondas de energía del bueno al muerto, a lo largo del cable rojo */}
      {estado.ondas > 0
        ? [0, 0.33, 0.66].map((f) => {
            const fase = (estado.ondas + f) % 1;
            const desde = punto(1, 1 - Math.min(1, fase * 2));
            const hasta = punto(0, Math.max(0, fase * 2 - 1));
            const q = fase < 0.5 ? desde : hasta;
            return <circle key={f} cx={q.x} cy={q.y} r={10 + 6 * Math.sin(fase * Math.PI)} fill="none" stroke="#FFD43B" strokeWidth={5} opacity={0.9} />;
          })
        : null}
      {DESTINOS.map((d, k) => (
        <Numero key={k} x={d.x + 28} y={d.y - 30} n={k + 1} escala={estado.numeros[k]} />
      ))}
      {/* X roja sobre el negativo de la batería muerta */}
      <g transform={`translate(${MUERTO - 30} 132) scale(${estado.equis})`} opacity={estado.equis > 0.01 ? 1 : 0}>
        <line x1={-20} y1={-20} x2={20} y2={20} stroke={ROJO_DA} strokeWidth={9} strokeLinecap="round" />
        <line x1={20} y1={-20} x2={-20} y2={20} stroke={ROJO_DA} strokeWidth={9} strokeLinecap="round" />
      </g>
      {/* palomita verde en el metal */}
      <g transform={`translate(${MUERTO + 58} 214) scale(${estado.palomita})`} opacity={estado.palomita > 0.01 ? 1 : 0}>
        <circle r={20} fill="#22c55e" stroke="#fff" strokeWidth={3} />
        <path d="M-9 0 L-2 8 L11 -8" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <Chispa x={DESTINOS[3].x + 6} y={DESTINOS[3].y - 8} tamano={34} opacidad={estado.chispa} />
    </svg>
  );
};

export { Chispa, Pinza };
