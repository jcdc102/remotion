// Mascota original: calavera de azúcar con gorra de mecánico.
const HUESO = "#f4ecd8";
const TINTA = "#2b1840";
const CUENCA = "#14071d";

export type PoseMano = "ninguna" | "dedo" | "senala";

export const Mano: React.FC<{ tamano: number }> = ({ tamano }) => (
  <svg width={tamano} height={tamano * 1.3} viewBox="0 0 120 156">
    {/* dedo índice levantado; los demás doblados */}
    <rect x={50} y={6} width={20} height={78} rx={10} fill={HUESO} stroke={TINTA} strokeWidth={5} />
    <line x1={52} y1={34} x2={68} y2={34} stroke={TINTA} strokeWidth={3} />
    <line x1={52} y1={58} x2={68} y2={58} stroke={TINTA} strokeWidth={3} />
    <rect x={22} y={70} width={78} height={62} rx={22} fill={HUESO} stroke={TINTA} strokeWidth={5} />
    {[0, 1, 2].map((k) => (
      <rect key={k} x={70 - k * 0 + 2} y={78 + k * 15} width={30} height={14} rx={7} fill={HUESO} stroke={TINTA} strokeWidth={4} />
    ))}
    <rect x={8} y={84} width={20} height={40} rx={10} fill={HUESO} stroke={TINTA} strokeWidth={5} transform="rotate(-20 18 104)" />
    <rect x={40} y={128} width={40} height={26} rx={6} fill="#1d3557" stroke={TINTA} strokeWidth={4} />
  </svg>
);

export const Calavera: React.FC<{
  boca: number;
  brillo: number;
  parpadeo: number;
  tamano: number;
}> = ({ boca, brillo, parpadeo, tamano }) => {
  const abre = boca * 26;
  const ojo = (cx: number, id: string) => (
    <g>
      <circle cx={cx} cy={132} r={34} fill="none" stroke="#ff3e9a" strokeWidth={5} strokeDasharray="7 6" />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <circle
          key={k}
          cx={cx + Math.cos((k / 6) * Math.PI * 2) * 42}
          cy={132 + Math.sin((k / 6) * Math.PI * 2) * 42}
          r={4}
          fill={k % 2 ? "#2ec4b6" : "#ffd23f"}
        />
      ))}
      <ellipse cx={cx} cy={132} rx={24} ry={26} fill={CUENCA} />
      <circle cx={cx} cy={134} r={10 + 10 * brillo} fill="#ff8c1a" opacity={brillo} filter="url(#brillo-cuenca)" />
      <circle cx={cx} cy={134} r={3 + 5 * brillo} fill="#ffe08a" opacity={brillo} />
      <clipPath id={id}>
        <ellipse cx={cx} cy={132} rx={25} ry={27} />
      </clipPath>
      <rect x={cx - 26} y={104} width={52} height={56 * parpadeo} fill={HUESO} clipPath={`url(#${id})`} />
    </g>
  );
  return (
    <svg width={tamano} height={tamano * 1.08} viewBox="0 0 240 260" style={{ overflow: "visible" }}>
      <defs>
        <filter id="brillo-cuenca" x="-1" y="-1" width="3" height="3">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      {/* cráneo y pómulos: primero los bordes, luego el relleno para unir formas */}
      <ellipse cx={120} cy={118} rx={92} ry={88} fill={TINTA} />
      <rect x={58} y={150} width={124} height={56} rx={26} fill={TINTA} />
      <ellipse cx={120} cy={118} rx={86} ry={82} fill={HUESO} />
      <rect x={64} y={150} width={112} height={50} rx={22} fill={HUESO} />
      {/* interior de la boca */}
      <rect x={80} y={176} width={80} height={14 + abre} rx={8} fill={CUENCA} />
      {/* dientes superiores */}
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <rect key={k} x={81 + k * 13} y={176} width={11} height={14} rx={2} fill="#fffaf0" stroke={TINTA} strokeWidth={2} />
      ))}
      {/* mandíbula móvil */}
      <g transform={`translate(0 ${abre})`}>
        <rect x={70} y={186} width={100} height={38} rx={18} fill={TINTA} />
        <rect x={75} y={189} width={90} height={32} rx={15} fill={HUESO} />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <rect key={k} x={81 + k * 13} y={186} width={11} height={12} rx={2} fill="#fffaf0" stroke={TINTA} strokeWidth={2} />
        ))}
        <circle cx={120} cy={210} r={5} fill="#ff3e9a" />
        <circle cx={104} cy={212} r={3} fill="#2ec4b6" />
        <circle cx={136} cy={212} r={3} fill="#2ec4b6" />
      </g>
      {ojo(84, "parpado-izq")}
      {ojo(156, "parpado-der")}
      {/* nariz de corazón invertido */}
      <path d="M120 172 L109 156 Q106 147 113 146 Q119 146 120 152 Q121 146 127 146 Q134 147 131 156 Z" fill={CUENCA} />
      {/* adornos en mejillas */}
      <path d="M44 160 q10 -12 20 0 q-10 12 -20 0" fill="#ff8c1a" />
      <path d="M176 160 q10 -12 20 0 q-10 12 -20 0" fill="#ff8c1a" />
      {/* gorra de mecánico */}
      <path d="M30 96 Q34 16 120 12 Q206 16 210 96 Z" fill="#1d3557" stroke={TINTA} strokeWidth={5} />
      <path d="M60 30 Q120 8 180 30" stroke="#2a4a7a" strokeWidth={6} fill="none" />
      <rect x={28} y={84} width={184} height={14} rx={6} fill="#14213d" />
      <path d="M40 94 Q120 122 200 94 L200 102 Q120 132 40 102 Z" fill="#14213d" stroke={TINTA} strokeWidth={4} />
      <circle cx={120} cy={52} r={20} fill="#ff9f1c" stroke={TINTA} strokeWidth={4} />
      {/* llave en el parche */}
      <g transform="rotate(-40 120 52)">
        <rect x={117} y={40} width={6} height={26} rx={2} fill={TINTA} />
        <path d="M112 38 a8 8 0 1 1 16 0 l-4 0 l0 6 l-8 0 l0 -6 z" fill={TINTA} />
      </g>
    </svg>
  );
};
