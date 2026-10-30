// Íconos SVG del tema "alineacion" (paleta roja del tema "bateria").
import { GRIS, GRIS_MEDIO, ROJO, ROJO_CLARO } from "../bateria/Iconos";

const TINTA = "#000";
const HULE = "#1c2226";

// Llanta de frente con la banda gastada de un solo lado (izquierdo).
export const LlantaDesgaste: React.FC<{ tamano: number; marca: number; giro: number }> = ({ tamano, marca, giro }) => {
  const surcos = Array.from({ length: 9 }, (_, k) => k);
  return (
    <svg width={tamano * 0.7} height={tamano} viewBox="0 0 168 240">
      <rect x={14} y={8} width={140} height={224} rx={34} fill={HULE} stroke="#fff" strokeWidth={7} />
      <clipPath id="banda">
        <rect x={20} y={14} width={128} height={212} rx={30} />
      </clipPath>
      <g clipPath="url(#banda)">
        {surcos.map((k) => {
          const y = ((k * 28 + giro * 28) % 252) - 14;
          return (
            <g key={k}>
              {/* lado derecho: surcos profundos */}
              <path d={`M84 ${y} l26 10 l26 -10`} stroke="#3b464d" strokeWidth={9} fill="none" />
              {/* lado izquierdo: casi liso */}
              <path d={`M32 ${y} l26 10 l26 -10`} stroke="#283035" strokeWidth={3} fill="none" opacity={0.6} />
            </g>
          );
        })}
        <rect x={20} y={14} width={62} height={212} fill={ROJO} opacity={0.18 + 0.35 * marca} />
      </g>
      <line x1={84} y1={10} x2={84} y2={230} stroke="#fff" strokeWidth={2} strokeDasharray="6 8" opacity={0.5} />
    </svg>
  );
};

// Vista cenital: carril con línea punteada y un auto que se desvía.
export const AutoCenital: React.FC<{ tamano: number; desvio: number; avance: number }> = ({ tamano, desvio, avance }) => {
  const ancho = 300;
  const alto = 230;
  const x = 150 + desvio * 70;
  const angulo = desvio * 14;
  return (
    <svg width={tamano} height={(tamano * alto) / ancho} viewBox={`0 0 ${ancho} ${alto}`}>
      <rect x={0} y={0} width={ancho} height={alto} rx={22} fill="#2a3135" stroke="#fff" strokeWidth={6} />
      <line x1={40} y1={6} x2={40} y2={alto - 6} stroke="#fff" strokeWidth={5} />
      <line x1={260} y1={6} x2={260} y2={alto - 6} stroke="#fff" strokeWidth={5} />
      {/* línea de referencia del centro del carril */}
      <line x1={150} y1={6} x2={150} y2={alto - 6} stroke="#ffffff" strokeWidth={4} strokeDasharray="22 18" strokeDashoffset={-avance * 40} opacity={0.75} />
      {/* rastro del auto */}
      <path d={`M150 ${alto} Q150 150 ${x} 112`} stroke={ROJO_CLARO} strokeWidth={5} fill="none" strokeDasharray="8 8" opacity={0.8} />
      <g transform={`translate(${x} 104) rotate(${angulo})`}>
        <rect x={-34} y={-58} width={68} height={116} rx={20} fill={ROJO} stroke={TINTA} strokeWidth={5} />
        <rect x={-26} y={-38} width={52} height={26} rx={7} fill="#9fd3ff" stroke={TINTA} strokeWidth={3} />
        <rect x={-26} y={22} width={52} height={20} rx={6} fill="#9fd3ff" stroke={TINTA} strokeWidth={3} />
        {[-1, 1].map((s) => (
          <g key={s}>
            <rect x={s * 38 - 6} y={-46} width={12} height={22} rx={4} fill={TINTA} />
            <rect x={s * 38 - 6} y={24} width={12} height={22} rx={4} fill={TINTA} />
          </g>
        ))}
      </g>
    </svg>
  );
};

// Llanta en corte (orilla gastada) y volante inclinado con línea vertical.
export const CorteYVolante: React.FC<{ tamano: number; orilla: number; volante: number }> = ({ tamano, orilla, volante }) => (
  <svg width={tamano} height={tamano * 0.62} viewBox="0 0 340 210">
    {/* corte de llanta: la orilla izquierda está más baja (gastada) */}
    <g transform="translate(16 30)">
      <path
        d={`M10 150 L10 ${50 + 36 * orilla} Q14 ${28 + 30 * orilla} 40 ${24 + 26 * orilla} L120 18 Q146 20 150 46 L150 150 Z`}
        fill={HULE}
        stroke="#fff"
        strokeWidth={6}
      />
      <path d="M26 150 L26 70 M134 150 L134 60" stroke={GRIS_MEDIO} strokeWidth={6} />
      <rect x={30} y={100} width={100} height={50} rx={6} fill={GRIS} stroke="#fff" strokeWidth={4} />
      <circle cx={40} cy={34 + 30 * orilla} r={22} fill="none" stroke={ROJO_CLARO} strokeWidth={5} opacity={orilla} />
    </g>
    {/* volante con línea de referencia */}
    <g transform="translate(250 108)">
      <line x1={0} y1={-98} x2={0} y2={98} stroke="#fff" strokeWidth={4} strokeDasharray="10 8" />
      <g transform={`rotate(${volante * 14})`}>
        <circle r={74} fill="none" stroke={GRIS_MEDIO} strokeWidth={16} />
        <circle r={74} fill="none" stroke="#000" strokeWidth={3} />
        <circle r={20} fill={GRIS} stroke="#fff" strokeWidth={4} />
        <path d="M-70 4 L-20 4 M20 4 L70 4 M0 20 L0 70" stroke={GRIS_MEDIO} strokeWidth={14} strokeLinecap="round" />
        <rect x={-6} y={-82} width={12} height={20} rx={3} fill={ROJO} />
      </g>
    </g>
  </svg>
);

// Reloj con manecillas que giran rápido.
export const Reloj: React.FC<{ tamano: number; t: number }> = ({ tamano, t }) => (
  <svg width={tamano} height={tamano} viewBox="0 0 200 200">
    <circle cx={100} cy={100} r={88} fill="#fff" stroke={TINTA} strokeWidth={8} />
    <circle cx={100} cy={100} r={80} fill="none" stroke={ROJO} strokeWidth={6} />
    {Array.from({ length: 12 }, (_, k) => (
      <line key={k} x1={100} y1={28} x2={100} y2={k % 3 === 0 ? 46 : 38} stroke={TINTA} strokeWidth={k % 3 === 0 ? 7 : 4} transform={`rotate(${k * 30} 100 100)`} />
    ))}
    <line x1={100} y1={100} x2={100} y2={58} stroke={TINTA} strokeWidth={9} strokeLinecap="round" transform={`rotate(${t * 120} 100 100)`} />
    <line x1={100} y1={100} x2={100} y2={36} stroke={ROJO} strokeWidth={6} strokeLinecap="round" transform={`rotate(${t * 900} 100 100)`} />
    <circle cx={100} cy={100} r={9} fill={TINTA} />
  </svg>
);

// Odómetro, calendario y manómetro; cada uno entra con su propio valor (0 a 1).
export const OdometroCalendarioManometro: React.FC<{ tamano: number; a: number; b: number; c: number; t: number }> = ({ tamano, a, b, c, t }) => {
  const digitos = [0, 1, 0, 0, 0, 0];
  return (
    <svg width={tamano} height={tamano * 0.4} viewBox="0 0 400 160" style={{ overflow: "visible" }}>
      <g transform={`translate(66 80) scale(${a})`} opacity={a}>
        <rect x={-62} y={-40} width={124} height={80} rx={14} fill="#11161a" stroke="#fff" strokeWidth={5} />
        <clipPath id="odo">
          <rect x={-52} y={-22} width={104} height={44} rx={6} />
        </clipPath>
        <g clipPath="url(#odo)">
          {digitos.map((d, k) => {
            const rueda = k === 1 ? (1 - Math.min(1, a)) * 9 : 0;
            return (
              <text key={k} x={-44 + k * 17.5} y={10 - rueda * 30} fontFamily="Lilita One" fontSize={28} fill={k === 1 ? ROJO_CLARO : "#fff"} textAnchor="middle">
                {d}
              </text>
            );
          })}
        </g>
      </g>
      <g transform={`translate(200 80) scale(${b})`} opacity={b}>
        <rect x={-50} y={-52} width={100} height={104} rx={12} fill="#fff" stroke={TINTA} strokeWidth={5} />
        <rect x={-50} y={-52} width={100} height={30} rx={12} fill={ROJO} stroke={TINTA} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, k) => (
          <rect key={k} x={-36 + (k % 3) * 26} y={-10 + Math.floor(k / 3) * 28} width={20} height={18} rx={3} fill={k === 5 ? ROJO_CLARO : "#cfd8dc"} />
        ))}
      </g>
      <g transform={`translate(334 80) scale(${c})`} opacity={c}>
        <circle r={54} fill="#fff" stroke={TINTA} strokeWidth={6} />
        <path d="M-38 24 A44 44 0 1 1 38 24" fill="none" stroke={GRIS_MEDIO} strokeWidth={8} />
        <path d="M22 -38 A44 44 0 0 1 38 24" fill="none" stroke={ROJO} strokeWidth={8} />
        <line x1={0} y1={0} x2={0} y2={-38} stroke={ROJO} strokeWidth={6} strokeLinecap="round" transform={`rotate(${-120 + c * 150 + Math.sin(t * 9) * 3})`} />
        <circle r={7} fill={TINTA} />
        <rect x={-10} y={52} width={20} height={16} fill={GRIS_MEDIO} stroke={TINTA} strokeWidth={4} />
      </g>
    </svg>
  );
};
