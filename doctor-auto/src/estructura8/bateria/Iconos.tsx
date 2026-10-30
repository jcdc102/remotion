// Íconos SVG del tema "bateria". Paleta: rojo, blanco y gris oscuro.
export const ROJO = "#D32F2F";
export const ROJO_CLARO = "#FF6B6B";
export const GRIS = "#263238";
export const GRIS_MEDIO = "#455A64";
const TINTA = "#000";

export const BateriaAlerta: React.FC<{ tamano: number; cargas: number; alerta: number }> = ({ tamano, cargas, alerta }) => (
  <svg width={tamano} height={tamano * 0.75} viewBox="0 0 240 180">
    <rect x={56} y={8} width={34} height={22} rx={5} fill={GRIS_MEDIO} stroke={TINTA} strokeWidth={6} />
    <rect x={150} y={8} width={34} height={22} rx={5} fill={GRIS_MEDIO} stroke={TINTA} strokeWidth={6} />
    <rect x={16} y={28} width={208} height={140} rx={20} fill={GRIS} stroke="#fff" strokeWidth={8} />
    {[0, 1, 2].map((k) => (
      <rect key={k} x={36 + k * 60} y={50} width={48} height={96} rx={8} fill={k < cargas ? ROJO : "#37474F"} stroke={TINTA} strokeWidth={4} />
    ))}
    <g opacity={alerta} transform="translate(120 98)">
      <circle r={42} fill="#fff" stroke={TINTA} strokeWidth={6} />
      <rect x={-7} y={-28} width={14} height={36} rx={5} fill={ROJO} />
      <circle cx={0} cy={20} r={8} fill={ROJO} />
    </g>
  </svg>
);

// Tablero con tacómetro; la aguja se mueve lento y la luz de batería parpadea.
export const Tablero: React.FC<{ tamano: number; angulo: number; luz: boolean; destello: number }> = ({
  tamano,
  angulo,
  luz,
  destello,
}) => {
  const marcas = Array.from({ length: 11 }, (_, k) => -120 + k * 24);
  return (
    <svg width={tamano} height={tamano * 0.68} viewBox="0 0 300 204">
      <rect x={6} y={6} width={288} height={192} rx={30} fill="#11161a" stroke="#fff" strokeWidth={7} />
      <circle cx={150} cy={120} r={86} fill="#1b2328" stroke={GRIS_MEDIO} strokeWidth={6} />
      {marcas.map((a, k) => {
        const r = (a - 90) * (Math.PI / 180);
        return (
          <line
            key={a}
            x1={150 + Math.cos(r) * 70}
            y1={120 + Math.sin(r) * 70}
            x2={150 + Math.cos(r) * 82}
            y2={120 + Math.sin(r) * 82}
            stroke={k >= 8 ? ROJO : "#fff"}
            strokeWidth={k % 2 ? 3 : 6}
          />
        );
      })}
      <g transform={`rotate(${angulo} 150 120)`}>
        <path d="M146 120 L150 46 L154 120 Z" fill={ROJO} stroke={TINTA} strokeWidth={2} />
      </g>
      <circle cx={150} cy={120} r={12} fill="#fff" stroke={TINTA} strokeWidth={4} />
      {/* luz de batería */}
      <g transform="translate(250 168)" opacity={luz ? 1 : 0.18}>
        <rect x={-22} y={-14} width={44} height={28} rx={4} fill={ROJO} />
        <rect x={-16} y={-20} width={8} height={6} fill={ROJO} />
        <rect x={8} y={-20} width={8} height={6} fill={ROJO} />
        <rect x={-14} y={-2} width={10} height={4} fill="#fff" />
        <rect x={4} y={-2} width={10} height={4} fill="#fff" />
        <rect x={7} y={-5} width={4} height={10} fill="#fff" />
      </g>
      {/* destello del "clic" */}
      <g opacity={destello} transform="translate(60 168)">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
          <line key={k} x1={0} y1={0} x2={Math.cos((k / 8) * Math.PI * 2) * 30} y2={Math.sin((k / 8) * Math.PI * 2) * 30} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
        ))}
        <circle r={10} fill={ROJO_CLARO} />
      </g>
    </svg>
  );
};

// Frente de auto con faros; "luz" de 0 a 1 controla el brillo de los haces.
export const FrenteAuto: React.FC<{ tamano: number; luz: number; ojo: number }> = ({ tamano, luz, ojo }) => (
  <svg width={tamano} height={tamano * 0.62} viewBox="0 0 320 200" style={{ overflow: "visible" }}>
    <defs>
      <radialGradient id="haz">
        <stop offset="0" stopColor="#fffbe6" stopOpacity={0.95} />
        <stop offset="1" stopColor="#fffbe6" stopOpacity={0} />
      </radialGradient>
    </defs>
    {[70, 250].map((cx) => (
      <ellipse key={cx} cx={cx} cy={150} rx={95} ry={55} fill="url(#haz)" opacity={luz} />
    ))}
    <path d="M40 120 Q50 52 100 44 L220 44 Q270 52 280 120 Z" fill={GRIS_MEDIO} stroke="#fff" strokeWidth={6} />
    <path d="M70 108 Q80 62 112 58 L208 58 Q240 62 250 108 Z" fill="#1b2328" />
    <rect x={20} y={110} width={280} height={66} rx={22} fill={ROJO} stroke="#fff" strokeWidth={6} />
    {[70, 250].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy={142} r={22} fill={`rgba(255,250,220,${0.2 + 0.8 * luz})`} stroke="#fff" strokeWidth={5} />
      </g>
    ))}
    <rect x={118} y={130} width={84} height={26} rx={6} fill="#1b2328" stroke="#fff" strokeWidth={4} />
    <rect x={36} y={174} width={40} height={22} rx={6} fill="#111" />
    <rect x={244} y={174} width={40} height={22} rx={6} fill="#111" />
    {/* ojo sobre el cofre: "se ve sin abrirlo" */}
    <g opacity={ojo} transform="translate(160 84)">
      <path d="M-40 0 Q0 -32 40 0 Q0 32 -40 0 Z" fill="#fff" stroke={TINTA} strokeWidth={5} />
      <circle r={12} fill={ROJO} />
      <circle r={5} fill={TINTA} />
    </g>
  </svg>
);

// Terminal de batería con polvo (sulfatación) blanco, verde y azul.
export const Terminal: React.FC<{ tamano: number; polvo: number; t: number }> = ({ tamano, polvo, t }) => {
  const granos = Array.from({ length: 46 }, (_, k) => {
    const a = (k * 137.5 * Math.PI) / 180;
    const r = 18 + ((k * 29) % 52);
    return { x: 150 + Math.cos(a) * r * 1.3, y: 88 + Math.sin(a) * r * 0.7, c: ["#ffffff", "#7ddc8f", "#7fb8ff"][k % 3], s: 5 + (k % 4) * 2.5, k };
  });
  return (
    <svg width={tamano} height={tamano * 0.68} viewBox="0 0 300 204">
      <rect x={10} y={100} width={280} height={100} rx={14} fill={GRIS} stroke="#fff" strokeWidth={6} />
      <rect x={118} y={56} width={64} height={52} rx={8} fill="#9aa4ab" stroke={TINTA} strokeWidth={5} />
      <rect x={60} y={70} width={180} height={26} rx={10} fill="#b0702a" stroke={TINTA} strokeWidth={5} />
      <rect x={136} y={40} width={28} height={30} rx={4} fill="#c9ced2" stroke={TINTA} strokeWidth={4} />
      <path d="M10 150 H290" stroke={GRIS_MEDIO} strokeWidth={4} />
      {granos.map((g) => (
        <circle
          key={g.k}
          cx={g.x + Math.sin(t * 2 + g.k) * 1.5}
          cy={g.y}
          r={g.s * Math.min(1, Math.max(0, polvo * 1.6 - (g.k / 46) * 0.6))}
          fill={g.c}
          stroke="#1a1a1a"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
};

// Barra de vida (6 segmentos) y termómetro.
export const VidaYTermometro: React.FC<{ tamano: number; vida: number; calor: number; t: number }> = ({ tamano, vida, calor, t }) => {
  const segmentos = 6;
  return (
    <svg width={tamano} height={tamano * 0.6} viewBox="0 0 320 192">
      <g transform="translate(6 56)">
        <rect x={0} y={0} width={236} height={66} rx={14} fill="#11161a" stroke="#fff" strokeWidth={6} />
        {Array.from({ length: segmentos }, (_, k) => {
          const encendido = k < vida * segmentos;
          const ultimo = k === Math.ceil(vida * segmentos) - 1;
          return (
            <rect
              key={k}
              x={12 + k * 36}
              y={12}
              width={30}
              height={42}
              rx={5}
              fill={encendido ? (vida < 0.34 ? ROJO : "#fff") : "#2c3539"}
              opacity={ultimo && vida < 0.34 ? 0.5 + 0.5 * Math.sin(t * 12) : 1}
            />
          );
        })}
        <rect x={236} y={22} width={12} height={22} rx={3} fill="#fff" />
      </g>
      <g transform="translate(272 10)">
        <rect x={-14} y={0} width={28} height={140} rx={14} fill="#fff" stroke={TINTA} strokeWidth={5} />
        <rect x={-6} y={8 + (1 - calor) * 120} width={12} height={10 + calor * 120} rx={6} fill={ROJO} />
        <circle cx={0} cy={152} r={26} fill={ROJO} stroke={TINTA} strokeWidth={5} />
        {[30, 60, 90].map((y) => (
          <line key={y} x1={16} y1={y} x2={28} y2={y} stroke="#fff" strokeWidth={4} />
        ))}
      </g>
    </svg>
  );
};

// Calendario que pasa hojas (la edad de la batería).
export const Calendario: React.FC<{ tamano: number; hoja: number }> = ({ tamano, hoja }) => (
  <svg width={tamano} height={tamano * 0.8} viewBox="0 0 240 192" style={{ overflow: "visible" }}>
    <rect x={20} y={24} width={200} height={160} rx={16} fill="#fff" stroke={TINTA} strokeWidth={6} />
    <rect x={20} y={24} width={200} height={44} rx={16} fill={ROJO} stroke={TINTA} strokeWidth={6} />
    {[60, 180].map((x) => (
      <rect key={x} x={x - 7} y={8} width={14} height={34} rx={7} fill={GRIS} />
    ))}
    {Array.from({ length: 12 }, (_, k) => (
      <rect key={k} x={40 + (k % 4) * 42} y={84 + Math.floor(k / 4) * 30} width={30} height={20} rx={4} fill={k === 11 ? ROJO_CLARO : "#cfd8dc"} />
    ))}
    {/* hoja que se voltea */}
    <g transform={`translate(120 68) scale(1 ${Math.cos(hoja * Math.PI)}) translate(-120 -68)`}>
      <rect x={20} y={68} width={200} height={116} rx={10} fill="#eceff1" stroke={TINTA} strokeWidth={4} opacity={hoja > 0 && hoja < 1 ? 1 : 0} />
    </g>
  </svg>
);

// Globo de comentario con el texto del botón.
export const GloboComentario: React.FC<{ texto: string; fuente: string }> = ({ texto, fuente }) => (
  <div style={{ position: "relative", display: "inline-block" }}>
    <div
      style={{
        background: "#fff",
        border: "8px solid #000",
        borderRadius: 46,
        padding: "22px 44px",
        fontFamily: fuente,
        fontSize: 72,
        lineHeight: 1.05,
        color: "#111",
        whiteSpace: "nowrap",
        boxShadow: `0 16px 0 ${ROJO}, 0 26px 40px rgba(0,0,0,0.5)`,
      }}
    >
      {texto}
    </div>
    <svg width={70} height={56} style={{ position: "absolute", left: 60, bottom: -48 }}>
      <path d="M6 0 L60 0 L10 50 Z" fill="#fff" stroke="#000" strokeWidth={8} strokeLinejoin="round" />
      <rect x={8} y={0} width={50} height={9} fill="#fff" />
    </svg>
  </div>
);
