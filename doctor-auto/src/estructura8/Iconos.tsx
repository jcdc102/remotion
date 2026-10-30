// Íconos dibujados en SVG: batería, luz de motor, envase de aceite, lápida,
// cuenta con montos borrosos y cartón.
const TINTA = "#14071d";

export const Bateria: React.FC<{ tamano: number }> = ({ tamano }) => (
  <svg width={tamano} height={tamano * 0.8} viewBox="0 0 200 160">
    <rect x={44} y={12} width={28} height={20} rx={4} fill="#9a9aa8" stroke={TINTA} strokeWidth={5} />
    <rect x={128} y={12} width={28} height={20} rx={4} fill="#9a9aa8" stroke={TINTA} strokeWidth={5} />
    <rect x={18} y={30} width={164} height={116} rx={16} fill="#2b2d42" stroke={TINTA} strokeWidth={6} />
    <rect x={18} y={120} width={164} height={26} rx={10} fill="#43aa8b" stroke={TINTA} strokeWidth={6} />
    <rect x={50} y={48} width={16} height={5} fill="#ff4d4d" />
    <rect x={55.5} y={42.5} width={5} height={16} fill="#ff4d4d" />
    <rect x={134} y={48} width={16} height={5} fill="#e0e0e0" />
    {/* ojos de X */}
    {[70, 130].map((cx) => (
      <g key={cx} stroke="#f4ecd8" strokeWidth={8} strokeLinecap="round">
        <line x1={cx - 13} y1={74} x2={cx + 13} y2={100} />
        <line x1={cx + 13} y1={74} x2={cx - 13} y2={100} />
      </g>
    ))}
    <path d="M80 112 q10 -8 20 0 q10 8 20 0" stroke="#f4ecd8" strokeWidth={5} fill="none" strokeLinecap="round" />
  </svg>
);

export const LuzMotor: React.FC<{ tamano: number; brillo: number }> = ({ tamano, brillo }) => (
  <svg
    width={tamano}
    height={tamano * 0.8}
    viewBox="0 0 200 160"
    style={{ filter: `drop-shadow(0 0 ${8 + 30 * brillo}px rgba(255,176,0,${0.4 + 0.6 * brillo}))` }}
  >
    <path
      d="M52 46 h22 v-14 h44 v14 h20 l14 16 h14 v-14 h14 v72 h-14 v-14 h-14 l-16 20 h-74 l-12 -14 h-14 v16 h-12 v-62 h12 v16 h14 z"
      fill={brillo > 0.05 ? "#ffb000" : "#6b5a2a"}
      stroke={TINTA}
      strokeWidth={6}
      strokeLinejoin="round"
    />
    <rect x={70} y={66} width={70} height={10} rx={5} fill={TINTA} opacity={0.5} />
  </svg>
);

export const Aceite: React.FC<{ tamano: number; t: number }> = ({ tamano, t }) => (
  <svg width={tamano} height={tamano * 0.9} viewBox="0 0 200 180" style={{ overflow: "visible" }}>
    {/* gotas negras que caen de la boquilla */}
    {[0, 0.45, 0.9].map((fase) => {
      const c = (t * 0.9 + fase) % 1.35;
      const y = 46 + c * c * 160;
      return (
        <path
          key={fase}
          d={`M186 ${y} q-8 12 0 16 q8 -4 0 -16`}
          fill="#050505"
          stroke="#3a3a3a"
          strokeWidth={1.5}
          opacity={c < 1.2 ? 1 : 0}
        />
      );
    })}
    <ellipse cx={176} cy={176} rx={14 + (t % 6) * 4} ry={5 + (t % 6)} fill="#050505" />
    <path d="M60 64 Q36 40 60 30 Q80 26 86 52" stroke={TINTA} strokeWidth={8} fill="none" />
    <path d="M140 92 L186 40 L192 46 L150 104 Z" fill="#c9a227" stroke={TINTA} strokeWidth={5} strokeLinejoin="round" />
    <path d="M40 76 L150 76 L162 150 L28 150 Z" fill="#d9b23a" stroke={TINTA} strokeWidth={6} strokeLinejoin="round" />
    <rect x={78} y={60} width={34} height={18} rx={4} fill="#a07d1c" stroke={TINTA} strokeWidth={5} />
    <path d="M70 104 q24 -16 50 0 q-10 24 -25 26 q-15 -2 -25 -26" fill="#050505" />
  </svg>
);

export const Lapida: React.FC<{
  ancho: number;
  numero: number;
  grieta: number;
  children: React.ReactNode;
}> = ({ ancho, numero, grieta, children }) => {
  const largoGrieta = 320;
  return (
    <div style={{ position: "relative", width: ancho, height: ancho * 1.3 }}>
      <svg width={ancho} height={ancho * 1.3} viewBox="0 0 300 390" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={`piedra-${numero}`} x1="0" x2="1">
            <stop offset="0" stopColor="#9a9cad" />
            <stop offset="1" stopColor="#5d5f72" />
          </linearGradient>
        </defs>
        <path
          d="M14 372 V150 Q14 12 150 12 Q286 12 286 150 V372 Z"
          fill={`url(#piedra-${numero})`}
          stroke="#1f1b2e"
          strokeWidth={8}
        />
        <rect x={0} y={362} width={300} height={28} rx={6} fill="#3d3a4f" stroke="#1f1b2e" strokeWidth={6} />
        <path d="M40 140 Q150 120 260 140" stroke="#4a4c5e" strokeWidth={4} fill="none" opacity={0.6} />
        <circle cx={150} cy={78} r={36} fill="#2b1840" stroke="#ff9f1c" strokeWidth={5} />
        <text x={150} y={94} textAnchor="middle" fontFamily="Lilita One" fontSize={46} fill="#fff4e0">
          {numero}
        </text>
        <path
          d="M196 22 L178 84 L206 140 L170 204 L198 262 L176 330"
          stroke="#120c1c"
          strokeWidth={7}
          fill="none"
          strokeLinejoin="round"
          strokeDasharray={largoGrieta}
          strokeDashoffset={(1 - grieta) * largoGrieta}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "36%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Recibo con montos borrosos: no muestra números reales.
export const Cuenta: React.FC<{ ancho: number }> = ({ ancho }) => (
  <div
    style={{
      width: ancho,
      height: ancho * 1.3,
      background: "#fbf6ea",
      clipPath:
        "polygon(0 0,100% 0,100% 94%,92% 100%,84% 94%,76% 100%,68% 94%,60% 100%,52% 94%,44% 100%,36% 94%,28% 100%,20% 94%,12% 100%,4% 94%,0 100%)",
      padding: ancho * 0.1,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: ancho * 0.07,
    }}
  >
    <div style={{ height: ancho * 0.08, width: "60%", background: "#2b1840", borderRadius: 6, alignSelf: "center" }} />
    {[0.8, 0.65, 0.75, 0.55].map((w, i) => (
      <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ height: ancho * 0.05, width: `${w * 60}%`, background: "#8a8496", borderRadius: 4 }} />
        <div style={{ height: ancho * 0.05, width: "22%", background: "#4a4458", borderRadius: 4, filter: "blur(5px)" }} />
      </div>
    ))}
    <div style={{ borderTop: "4px dashed #8a8496" }} />
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div style={{ height: ancho * 0.11, width: "55%", background: "#d00000", borderRadius: 6, filter: "blur(7px)" }} />
    </div>
  </div>
);

export const Carton: React.FC<{ ancho: number }> = ({ ancho }) => (
  <div
    style={{
      width: ancho,
      height: ancho * 0.75,
      background: "repeating-linear-gradient(90deg, #c49a6c 0 14px, #b88b5c 14px 18px)",
      border: "6px solid #7a5530",
      borderRadius: 8,
      position: "relative",
      boxShadow: "0 18px 30px rgba(0,0,0,0.5)",
    }}
  >
    <div style={{ position: "absolute", left: "-6%", right: "-6%", top: "42%", height: "16%", background: "rgba(230,215,170,0.85)", transform: "rotate(-6deg)" }} />
  </div>
);

export const Triangulo: React.FC<{ tamano: number }> = ({ tamano }) => (
  <svg width={tamano} height={tamano} viewBox="0 0 100 100">
    <path d="M50 8 L94 88 H6 Z" fill="#ffd60a" stroke={TINTA} strokeWidth={7} strokeLinejoin="round" />
    <rect x={45} y={34} width={10} height={30} rx={4} fill={TINTA} />
    <circle cx={50} cy={74} r={6} fill={TINTA} />
  </svg>
);
