// Visuales SVG del video «5 ruidos». Coordenadas del panel: 940 x 460.
import { ANTON, POPPINS, PESO_POPPINS, ROJO_DA } from "../../doctor-auto/constantes";
import { Chispa } from "../pasar-corriente/Diagrama";
import { Panel } from "../pasar-corriente/Visuales";

const HULE = "#1b1b1b";
const METAL = "#C8C8C8";
const AMARILLO = "#FFD43B";

// Zonas del auto (vista lateral, frente a la derecha) para cada ruido 1–5.
export const ZONAS = [
  { x: 770, y: 250 }, // 1 banda (motor)
  { x: 590, y: 380 }, // 2 homocinética (rueda delantera, lado interno)
  { x: 660, y: 270 }, // 3 suspensión (sobre la rueda delantera)
  { x: 690, y: 385 }, // 4 balero (centro de la rueda delantera)
  { x: 300, y: 365 }, // 5 frenos (rueda trasera)
];

// Ondas de sonido que salen de un punto.
export const Ondas: React.FC<{ x: number; y: number; fase: number; color: string; escala?: number }> = ({ x, y, fase, color, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    {[0, 0.33, 0.66].map((f) => {
      const p = (fase + f) % 1;
      return <circle key={f} r={20 + p * 90} fill="none" stroke={color} strokeWidth={8 * (1 - p) + 1} opacity={1 - p} />;
    })}
  </g>
);

export const AutoLateral: React.FC<{
  zona: number | null;
  fase: number;
  numeros: number[];
  dx?: number;
  dy?: number;
  escala?: number;
  colorOnda?: string;
}> = ({ zona, fase, numeros, dx = 0, dy = 0, escala = 1, colorOnda = ROJO_DA }) => (
  <g transform={`translate(${dx} ${dy}) scale(${escala})`}>
    <ellipse cx={500} cy={430} rx={380} ry={16} fill="#000" opacity={0.35} />
    {/* carrocería */}
    <path d="M140 360 L150 300 Q160 270 200 262 L330 250 L420 175 Q440 160 470 160 L640 160 Q670 160 690 178 L760 245 L860 262 Q890 268 895 300 L900 360 Z" fill="#3d3d3d" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
    <path d="M345 250 L430 186 Q445 176 465 176 L545 176 L545 250 Z" fill="#1f2a30" stroke="#9aa" strokeWidth={3} />
    <path d="M560 176 L635 176 Q655 176 670 190 L730 250 L560 250 Z" fill="#1f2a30" stroke="#9aa" strokeWidth={3} />
    <rect x={860} y={285} width={36} height={18} rx={6} fill="#FFF3B0" />
    <rect x={142} y={285} width={22} height={18} rx={5} fill={ROJO_DA} />
    {/* ruedas */}
    {[300, 690].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy={365} r={62} fill={HULE} stroke="#fff" strokeWidth={5} />
        <circle cx={cx} cy={365} r={30} fill={METAL} stroke="#555" strokeWidth={4} />
      </g>
    ))}
    {zona !== null ? (
      <g>
        <circle cx={ZONAS[zona].x} cy={ZONAS[zona].y} r={26} fill="none" stroke={AMARILLO} strokeWidth={6} />
        <Ondas x={ZONAS[zona].x} y={ZONAS[zona].y} fase={fase} color={colorOnda} />
      </g>
    ) : null}
    {ZONAS.map((z, k) => (
      <g key={k} transform={`translate(${z.x} ${z.y - 46}) scale(${numeros[k] ?? 0})`} opacity={(numeros[k] ?? 0) > 0.01 ? 1 : 0}>
        <circle r={22} fill={ROJO_DA} stroke="#fff" strokeWidth={4} />
        <text y={10} textAnchor="middle" fontFamily={ANTON} fontSize={28} fill="#fff">
          {k + 1}
        </text>
      </g>
    ))}
  </g>
);

// Panel con el auto entero (gancho, introducción y CTA).
export const PanelAuto: React.FC<{ zona: number | null; fase: number; numeros: number[]; chips: string[] | null; chipsVisibles: number[] }> = ({
  zona,
  fase,
  numeros,
  chips,
  chipsVisibles,
}) => (
  <Panel>
    {chips ? (
      <>
        <AutoLateral zona={zona} fase={fase} numeros={numeros} dx={300} dy={40} escala={0.68} />
        {chips.map((c, k) => (
          <g key={c} transform={`translate(30 ${42 + k * 80}) scale(${chipsVisibles[k] ?? 0})`} opacity={(chipsVisibles[k] ?? 0) > 0.01 ? 1 : 0}>
            <rect width={300} height={62} rx={31} fill="#262626" stroke={ROJO_DA} strokeWidth={4} />
            <circle cx={31} cy={31} r={22} fill={ROJO_DA} />
            <text x={31} y={41} textAnchor="middle" fontFamily={ANTON} fontSize={28} fill="#fff">
              {k + 1}
            </text>
            <text x={66} y={41} fontFamily={POPPINS} fontWeight={PESO_POPPINS} fontSize={26} fill="#fff">
              {c}
            </text>
          </g>
        ))}
      </>
    ) : (
      <AutoLateral zona={zona} fase={fase} numeros={numeros} dx={-20} dy={0} />
    )}
  </Panel>
);

// 1 · Poleas y banda: la banda vibra; con "grietas" aparecen fisuras rojas.
export const PoleasBanda: React.FC<{ t: number; vibra: number; grietas: number }> = ({ t, vibra, grietas }) => {
  const poleas = [
    { x: 300, y: 150, r: 70 },
    { x: 640, y: 130, r: 48 },
    { x: 520, y: 330, r: 58 },
  ];
  const v = Math.sin(t * 80) * 6 * vibra;
  return (
    <Panel>
      <path
        d={`M300 80 L640 ${82 + v} A48 48 0 0 1 680 160 L568 ${348 + v} A58 58 0 0 1 470 362 L300 220 A70 70 0 0 1 300 80 Z`}
        fill="none"
        stroke="#111"
        strokeWidth={22}
        strokeLinejoin="round"
      />
      <path
        d={`M300 80 L640 ${82 + v} A48 48 0 0 1 680 160 L568 ${348 + v} A58 58 0 0 1 470 362 L300 220 A70 70 0 0 1 300 80 Z`}
        fill="none"
        stroke="#3a3a3a"
        strokeWidth={14}
        strokeDasharray="6 10"
      />
      {poleas.map((p, k) => (
        <g key={k} transform={`rotate(${t * 360 * (k === 0 ? 1 : 2)} ${p.x} ${p.y})`}>
          <circle cx={p.x} cy={p.y} r={p.r} fill={METAL} stroke="#fff" strokeWidth={5} />
          <circle cx={p.x} cy={p.y} r={p.r * 0.35} fill="#555" />
          <rect x={p.x - 4} y={p.y - p.r + 6} width={8} height={p.r * 0.5} fill="#777" />
        </g>
      ))}
      {[0, 1, 2, 3, 4].map((k) => (
        <path
          key={k}
          d={`M${380 + k * 50} ${92 + k * 3} l8 14 l-6 8 l9 12`}
          stroke={ROJO_DA}
          strokeWidth={5}
          fill="none"
          opacity={grietas > k / 5 ? 1 : 0}
        />
      ))}
      {vibra > 0 ? <Ondas x={470} y={88} fase={(t * 1.6) % 1} color={AMARILLO} escala={0.9} /> : null}
    </Panel>
  );
};

// 2 · Volante girado, rueda con "clics" y la junta homocinética.
export const VolanteJunta: React.FC<{ giro: number; clic: number; junta: number }> = ({ giro, clic, junta }) => (
  <Panel>
    <g transform="translate(200 230)">
      <g transform={`rotate(${-120 * giro})`}>
        <circle r={110} fill="none" stroke="#555" strokeWidth={22} />
        <circle r={110} fill="none" stroke="#fff" strokeWidth={3} />
        <circle r={30} fill="#333" stroke="#fff" strokeWidth={4} />
        <path d="M-105 6 L-30 6 M30 6 L105 6 M0 30 L0 105" stroke="#555" strokeWidth={18} strokeLinecap="round" />
        <rect x={-8} y={-122} width={16} height={26} rx={4} fill={ROJO_DA} />
      </g>
    </g>
    <g transform={`translate(${520 + 180 * (1 - junta)} 230) rotate(${-25 * giro})`} opacity={1 - junta * 0.75}>
      <rect x={-50} y={-110} width={100} height={220} rx={30} fill={HULE} stroke="#fff" strokeWidth={5} />
      {Array.from({ length: 8 }, (_, k) => (
        <rect key={k} x={-46} y={-100 + k * 26} width={92} height={10} rx={3} fill="#333" />
      ))}
    </g>
    {/* "clics": destellos rítmicos junto a la rueda */}
    {[0, 1, 2].map((k) => (
      <g key={k} transform={`translate(${640 + k * 60} ${120 + (k % 2) * 40})`} opacity={clic > 0 && Math.floor(clic * 7 + k) % 2 === 0 ? 1 : 0}>
        <Chispa x={0} y={0} tamano={40} opacidad={1} />
      </g>
    ))}
    {/* junta homocinética: flecha + cubrepolvo (fuelle) con rotura */}
    <g transform={`translate(560 260) scale(${junta})`} opacity={junta}>
      <rect x={-260} y={-14} width={180} height={28} rx={10} fill={METAL} stroke="#fff" strokeWidth={4} />
      {Array.from({ length: 5 }, (_, k) => (
        <ellipse key={k} cx={-60 + k * 30} cy={0} rx={18} ry={40 - k * 4} fill="#222" stroke="#fff" strokeWidth={3} />
      ))}
      <circle cx={110} cy={0} r={46} fill={METAL} stroke="#fff" strokeWidth={4} />
      <path d="M-20 -30 l14 18 l-10 10 l16 14" stroke={ROJO_DA} strokeWidth={6} fill="none" />
    </g>
  </Panel>
);

// Bucle 1 · el auto pasa un tope y rebota.
export const TopeRebote: React.FC<{ p: number }> = ({ p }) => {
  const x = -380 + p * 900;
  const sobreTope = Math.max(0, 1 - Math.abs(x + 500 - 470) / 160);
  const rebote = -sobreTope * 40 + Math.sin(p * 40) * 6 * sobreTope;
  return (
    <Panel>
      <rect x={0} y={420} width={940} height={40} fill="#2f2f2f" />
      <path d="M400 422 Q470 360 540 422 Z" fill={AMARILLO} stroke="#111" strokeWidth={4} />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={415 + k * 40} y={392 - (k === 1 ? 14 : 0)} width={22} height={12} fill="#111" transform={`rotate(${(k - 1) * 18} ${426 + k * 40} 398)`} />
      ))}
      <AutoLateral zona={sobreTope > 0.3 ? 2 : null} fase={(p * 6) % 1} numeros={[]} dx={x} dy={30 + rebote} escala={0.55} />
    </Panel>
  );
};

// 3 · Suspensión: resorte y amortiguador que se comprimen con el golpe.
export const Suspension: React.FC<{ compresion: number; golpe: number }> = ({ compresion, golpe }) => {
  const alto = 170 - 60 * compresion;
  const vueltas = 7;
  const resorte = Array.from({ length: vueltas * 2 + 1 }, (_, k) => `${k === 0 ? "M" : "L"}${470 + (k % 2 === 0 ? -55 : 55)} ${90 + (k / (vueltas * 2)) * alto}`).join(" ");
  return (
    <Panel>
      <rect x={380} y={50} width={180} height={34} rx={8} fill="#555" stroke="#fff" strokeWidth={4} />
      <rect x={455} y={84} width={30} height={alto + 20} rx={8} fill={METAL} stroke="#fff" strokeWidth={4} />
      <path d={resorte} fill="none" stroke={ROJO_DA} strokeWidth={12} strokeLinecap="round" />
      <circle cx={470} cy={120 + alto + 90} r={80} fill={HULE} stroke="#fff" strokeWidth={5} />
      <circle cx={470} cy={120 + alto + 90} r={34} fill={METAL} />
      <g opacity={golpe} transform={`translate(470 ${120 + alto})`}>
        <Chispa x={-90} y={0} tamano={50} opacidad={1} />
        <Chispa x={90} y={0} tamano={50} opacidad={1} />
      </g>
    </Panel>
  );
};

// Las tres piezas de la suspensión, una por una.
export const TresPiezas: React.FC<{ a: number; b: number; c: number }> = ({ a, b, c }) => (
  <Panel>
    <g transform={`translate(170 220) scale(${a})`} opacity={a}>
      <circle r={90} fill="#222" stroke="#fff" strokeWidth={5} />
      <circle r={58} fill="#3a3a3a" />
      <circle r={30} fill={METAL} stroke="#fff" strokeWidth={4} />
    </g>
    <g transform={`translate(470 220) scale(${b})`} opacity={b}>
      <rect x={-20} y={-10} width={40} height={130} rx={10} fill={METAL} stroke="#fff" strokeWidth={4} />
      <circle cy={-50} r={58} fill={METAL} stroke="#fff" strokeWidth={5} />
      <path d="M-58 -50 Q0 -10 58 -50" fill="#222" stroke="#fff" strokeWidth={3} />
    </g>
    <g transform={`translate(770 220) scale(${c})`} opacity={c}>
      <rect x={-34} y={-150} width={68} height={170} rx={14} fill="#333" stroke="#fff" strokeWidth={5} />
      <rect x={-14} y={20} width={28} height={110} rx={6} fill={METAL} stroke="#fff" strokeWidth={4} />
      <circle cy={-160} r={20} fill="none" stroke="#fff" strokeWidth={6} />
      <circle cy={140} r={20} fill="none" stroke="#fff" strokeWidth={6} />
    </g>
  </Panel>
);

// 4 · Velocímetro que sube y balero en corte que gira.
export const VelocimetroBalero: React.FC<{ vel: number; balero: number; t: number }> = ({ vel, balero, t }) => (
  <Panel>
    <g transform={`translate(${250 - 60 * balero} 250)`}>
      <circle r={150} fill="#111" stroke="#fff" strokeWidth={6} />
      {Array.from({ length: 13 }, (_, k) => {
        const a = ((-210 + k * 20) * Math.PI) / 180;
        return <line key={k} x1={Math.cos(a) * 118} y1={Math.sin(a) * 118} x2={Math.cos(a) * 138} y2={Math.sin(a) * 138} stroke={k > 9 ? ROJO_DA : "#fff"} strokeWidth={k % 2 ? 4 : 8} />;
      })}
      <g transform={`rotate(${-120 + 240 * vel})`}>
        <path d="M-6 0 L0 -120 L6 0 Z" fill={ROJO_DA} />
      </g>
      <circle r={16} fill="#fff" />
      {/* ondas que crecen con la velocidad */}
      <Ondas x={0} y={0} fase={(t * (1 + 2 * vel)) % 1} color={AMARILLO} escala={0.6 + 0.9 * vel} />
    </g>
    <g transform={`translate(680 230) scale(${balero}) rotate(${t * 240})`} opacity={balero}>
      <circle r={130} fill={METAL} stroke="#fff" strokeWidth={6} />
      <circle r={100} fill="#2a2a2a" />
      {Array.from({ length: 10 }, (_, k) => (
        <circle key={k} cx={Math.cos((k / 10) * Math.PI * 2) * 82} cy={Math.sin((k / 10) * Math.PI * 2) * 82} r={16} fill={METAL} stroke="#fff" strokeWidth={3} />
      ))}
      <circle r={60} fill={METAL} stroke="#fff" strokeWidth={5} />
      <circle r={26} fill="#2a2a2a" />
    </g>
  </Panel>
);

// Bucle 2 · freno en alerta roja que late (2 pulsos por segundo como máximo).
export const FrenoAlerta: React.FC<{ t: number }> = ({ t }) => {
  const late = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.6);
  return (
    <Panel>
      <circle cx={470} cy={230} r={150 + 20 * late} fill={ROJO_DA} opacity={0.18 + 0.2 * late} />
      <g transform="translate(470 230)">
        <circle r={140} fill={METAL} stroke="#fff" strokeWidth={6} />
        {Array.from({ length: 12 }, (_, k) => (
          <circle key={k} cx={Math.cos((k / 12) * Math.PI * 2) * 100} cy={Math.sin((k / 12) * Math.PI * 2) * 100} r={9} fill="#777" />
        ))}
        <circle r={50} fill="#555" />
        <path d="M60 -150 Q180 0 60 150 L110 150 Q230 0 110 -150 Z" fill={ROJO_DA} stroke="#fff" strokeWidth={5} />
      </g>
      <g transform={`translate(760 120) scale(${0.9 + 0.1 * late})`}>
        <path d="M0 -60 L60 50 H-60 Z" fill={AMARILLO} stroke="#111" strokeWidth={6} strokeLinejoin="round" />
        <rect x={-6} y={-24} width={12} height={40} rx={4} fill="#111" />
        <circle cy={32} r={7} fill="#111" />
      </g>
    </Panel>
  );
};

// 5 · Disco y balata: la balata se adelgaza hasta metal contra metal (con chispas).
export const DiscoBalata: React.FC<{ grosor: number; chispas: number; ondas: number; t: number }> = ({ grosor, chispas, ondas, t }) => (
  <Panel>
    <g transform="translate(400 230)">
      <g transform={`rotate(${t * 300})`}>
        <circle r={170} fill={METAL} stroke="#fff" strokeWidth={6} />
        {Array.from({ length: 14 }, (_, k) => (
          <circle key={k} cx={Math.cos((k / 14) * Math.PI * 2) * 125} cy={Math.sin((k / 14) * Math.PI * 2) * 125} r={10} fill="#888" />
        ))}
        <circle r={60} fill="#666" />
      </g>
      {/* caliper con balata */}
      <rect x={120} y={-90} width={130} height={180} rx={24} fill={ROJO_DA} stroke="#fff" strokeWidth={6} />
      <rect x={120 - 34 * grosor - 6} y={-70} width={34 * grosor + 6} height={140} rx={6} fill="#4a3b2a" stroke="#fff" strokeWidth={3} />
      <rect x={114} y={-74} width={10} height={148} fill="#999" />
      {ondas > 0 ? <Ondas x={100} y={0} fase={(t * 2) % 1} color={AMARILLO} /> : null}
      <g opacity={chispas}>
        {[-50, -10, 30].map((y, k) => (
          <g key={y} transform={`translate(110 ${y}) rotate(${150 + k * 20 + Math.sin(t * 30 + k) * 10})`}>
            <Chispa x={0} y={0} tamano={60} opacidad={1} />
          </g>
        ))}
      </g>
    </g>
    <g transform="translate(780 230)">
      <text textAnchor="middle" y={-40} fontFamily={ANTON} fontSize={44} fill="#fff">
        {Math.round(grosor * 10)} mm
      </text>
      <rect x={-70} y={-10} width={140} height={22} rx={11} fill="#333" />
      <rect x={-70} y={-10} width={140 * grosor} height={22} rx={11} fill={grosor < 0.3 ? ROJO_DA : "#22c55e"} />
    </g>
  </Panel>
);

// Distancia de frenado: dos autos (vista superior), el de balatas gastadas frena más lejos.
export const DistanciaFrenado: React.FC<{ p: number }> = ({ p }) => {
  const e = 1 - (1 - Math.min(1, p)) ** 3;
  const bueno = 80 + 430 * e;
  const malo = 80 + 690 * e;
  const auto = (x: number, y: number, color: string) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-60} y={-30} width={120} height={60} rx={18} fill={color} stroke="#fff" strokeWidth={4} />
      <rect x={10} y={-22} width={30} height={44} rx={6} fill="#9fd3ff" />
    </g>
  );
  return (
    <Panel>
      {[150, 310].map((y) => (
        <g key={y}>
          <rect x={0} y={y - 60} width={940} height={120} fill="#2f2f2f" />
          <line x1={0} y1={y} x2={940} y2={y} stroke="#fff" strokeWidth={4} strokeDasharray="30 24" opacity={0.4} />
        </g>
      ))}
      {auto(bueno, 150, "#22c55e")}
      {auto(malo, 310, ROJO_DA)}
      <line x1={bueno + 60} y1={230} x2={malo + 60} y2={230} stroke={AMARILLO} strokeWidth={6} opacity={e} />
      <path d={`M${malo + 60} 230 l-18 -12 v24 Z`} fill={AMARILLO} opacity={e} />
    </Panel>
  );
};
