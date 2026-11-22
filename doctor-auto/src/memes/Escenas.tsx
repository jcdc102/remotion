import { AbsoluteFill, random } from "remotion";
import { ANTON, POPPINS } from "../doctor-auto/constantes";

// Biblioteca de escenas en motion graphics 2D (vector plano premium) para los educativos.
// Cada escena recibe l = tiempo local (s) y d = duración del plano. Todo es SVG dibujado aquí.

const lim = (x: number) => Math.max(0, Math.min(1, x));
const suave = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const p = (l: number, a: number, b: number) => suave(lim((l - a) / (b - a)));
const ROJO = "#d7262c";
const ROJO_OSC = "#8f1418";
const AMARILLO = "#f5c518";
const AZUL = "#3f8cff";
const BLANCO = "#ffffff";

// ---------- fondo ----------
export const FondoAnim: React.FC<{ t: number; tono?: string }> = ({ t, tono = "40,46,62" }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 38%, rgba(${tono},1) 0%, #07080c 72%)` }} />
    <AbsoluteFill style={{ perspective: 900, perspectiveOrigin: "50% 40%" }}>
      <div style={{ position: "absolute", left: -800, right: -800, top: 1230, height: 1600, transform: "rotateX(72deg)", transformOrigin: "50% 0%", backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.08) 2px, transparent 2px)", backgroundSize: "120px 120px", backgroundPosition: `0px ${t * 120}px`, maskImage: "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)" }} />
    </AbsoluteFill>
    {Array.from({ length: 18 }).map((_, k) => {
      const x = random(`fx${k}`) * 1080;
      const v = 18 + random(`fv${k}`) * 40;
      const y = 1900 - ((t * v + random(`fy${k}`) * 1900) % 1900);
      const r = 2 + random(`fr${k}`) * 4;
      return <div key={k} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: k % 3 ? "rgba(255,255,255,0.3)" : "rgba(255,80,90,0.5)", filter: "blur(1px)" }} />;
    })}
  </AbsoluteFill>
);

// ---------- piezas ----------
const CARRO = "M70,300 L95,252 Q125,218 205,206 L335,196 Q405,142 475,122 Q565,102 655,114 Q725,124 795,182 L905,202 Q955,212 963,252 L967,294 Q963,305 943,305 L842,305 A72,72 0 0 0 698,305 L332,305 A72,72 0 0 0 188,305 L88,305 Q70,305 70,300 Z";
const VENTANA = "M365,196 Q425,152 485,137 L645,132 Q705,142 765,186 Z";

const Rueda: React.FC<{ cx: number; cy: number; r: number; giro: number; baja?: number }> = ({ cx, cy, r, giro, baja = 0 }) => (
  <g transform={`translate(${cx} ${cy}) scale(1 ${1 - 0.22 * baja}) translate(0 ${r * 0.22 * baja})`}>
    <circle r={r} fill="#15161a" />
    <circle r={r * 0.92} fill="none" stroke="#2a2c33" strokeWidth={r * 0.1} strokeDasharray={`${r * 0.18} ${r * 0.12}`} transform={`rotate(${giro})`} />
    <circle r={r * 0.58} fill="url(#rin)" />
    <g transform={`rotate(${giro})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <rect key={a} x={-r * 0.06} y={-r * 0.55} width={r * 0.12} height={r * 0.42} rx={r * 0.04} fill="#9aa0ab" transform={`rotate(${a})`} />
      ))}
    </g>
    <circle r={r * 0.14} fill="#c9ced6" />
  </g>
);

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="carroc" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ff4b4f" />
      <stop offset="1" stopColor={ROJO_OSC} />
    </linearGradient>
    <linearGradient id="vidrio" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#bfe2ff" />
      <stop offset="1" stopColor="#4c6c90" />
    </linearGradient>
    <radialGradient id="rin" cx="0.4" cy="0.35" r="0.8">
      <stop offset="0" stopColor="#eef1f5" />
      <stop offset="1" stopColor="#6c727d" />
    </radialGradient>
    <radialGradient id="sombra" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#000" stopOpacity="0.55" />
      <stop offset="1" stopColor="#000" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#f2f4f7" />
      <stop offset="1" stopColor="#9097a3" />
    </linearGradient>
    <filter id="brillo" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="10" />
    </filter>
  </defs>
);

// Auto lateral (ancho base 1040). giro = grados de las ruedas.
const Auto: React.FC<{ x: number; y: number; s: number; giro: number; baja?: number; luces?: number; ventanaAbierta?: number; tumbo?: number }> = ({ x, y, s, giro, baja = 0, luces = 0, ventanaAbierta = 0, tumbo = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tumbo} 520 300)`}>
    <ellipse cx={520} cy={385} rx={470} ry={34} fill="url(#sombra)" />
    <path d={CARRO} fill="url(#carroc)" />
    <path d={VENTANA} fill="url(#vidrio)" opacity={1 - 0.85 * ventanaAbierta} />
    <path d="M560,132 L560,190" stroke={ROJO_OSC} strokeWidth="10" />
    <path d="M110,262 L960,262" stroke="rgba(255,255,255,0.25)" strokeWidth="5" />
    <rect x={930} y={232} width={34} height={20} rx={8} fill={AMARILLO} />
    <rect x={72} y={238} width={30} height={22} rx={8} fill={luces > 0.5 ? "#ffb300" : "#7a1013"} />
    {luces > 0.5 ? <circle cx={84} cy={249} r={40} fill="#ffb300" opacity={0.5} filter="url(#brillo)" /> : null}
    <Rueda cx={260} cy={305} r={66} giro={giro} />
    <Rueda cx={770} cy={305} r={66} giro={giro} baja={baja} />
  </g>
);

const Copos: React.FC<{ l: number; n?: number }> = ({ l, n = 26 }) => (
  <g>
    {Array.from({ length: n }).map((_, k) => {
      const x = random(`cx${k}`) * 1080;
      const y = ((l * (60 + random(`cv${k}`) * 80) + random(`cy${k}`) * 1500) % 1500) + 250;
      const r = 4 + random(`cr${k}`) * 8;
      return (
        <g key={k} transform={`translate(${x + Math.sin(l + k) * 20} ${y}) rotate(${l * 40 + k * 20})`} opacity={0.75}>
          {[0, 60, 120].map((a) => (
            <line key={a} x1={-r} y1={0} x2={r} y2={0} stroke="#dff1ff" strokeWidth={2.5} transform={`rotate(${a})`} />
          ))}
        </g>
      );
    })}
  </g>
);

const Humo: React.FC<{ l: number; x: number; y: number; n?: number }> = ({ l, x, y, n = 6 }) => (
  <g>
    {Array.from({ length: n }).map((_, k) => {
      const f = ((l * 0.9 + k / n) % 1);
      return <circle key={k} cx={x - f * 160} cy={y - f * 60 + Math.sin(f * 6 + k) * 10} r={14 + f * 40} fill="#cfd6e0" opacity={0.45 * (1 - f)} />;
    })}
  </g>
);

const Reloj: React.FC<{ cx: number; cy: number; r: number; ang: number; color?: string }> = ({ cx, cy, r, ang, color = BLANCO }) => (
  <g transform={`translate(${cx} ${cy})`}>
    <circle r={r} fill="#14161c" stroke={color} strokeWidth={r * 0.08} />
    {Array.from({ length: 12 }).map((_, k) => (
      <line key={k} x1={0} y1={-r * 0.78} x2={0} y2={-r * 0.9} stroke={color} strokeWidth={r * 0.04} transform={`rotate(${k * 30})`} />
    ))}
    <line x1={0} y1={0} x2={0} y2={-r * 0.7} stroke={ROJO} strokeWidth={r * 0.07} strokeLinecap="round" transform={`rotate(${ang})`} />
    <circle r={r * 0.08} fill={color} />
  </g>
);

const Medidor: React.FC<{ cx: number; cy: number; r: number; v: number; etiqueta: string; color?: string }> = ({ cx, cy, r, v, etiqueta, color = ROJO }) => {
  const a = -120 + 240 * v;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill="#101217" stroke="#2c2f38" strokeWidth={r * 0.06} />
      <path d={`M${-r * 0.78 * Math.sin((120 * Math.PI) / 180)} ${r * 0.78 * Math.cos((120 * Math.PI) / 180) * -1 * -1} A${r * 0.78} ${r * 0.78} 0 1 1 ${r * 0.78 * Math.sin((120 * Math.PI) / 180)} ${r * 0.78 * Math.cos((120 * Math.PI) / 180) * -1 * -1}`} fill="none" stroke="#2c2f38" strokeWidth={r * 0.1} />
      {Array.from({ length: 9 }).map((_, k) => (
        <line key={k} x1={0} y1={-r * 0.62} x2={0} y2={-r * 0.74} stroke={k > 6 ? ROJO : "#c9ced6"} strokeWidth={r * 0.04} transform={`rotate(${-120 + k * 30})`} />
      ))}
      <line x1={0} y1={0} x2={0} y2={-r * 0.66} stroke={color} strokeWidth={r * 0.06} strokeLinecap="round" transform={`rotate(${a})`} />
      <circle r={r * 0.1} fill="#e9ecf0" />
      <text y={r * 0.45} textAnchor="middle" fontFamily={POPPINS} fontWeight={800} fontSize={r * 0.17} fill="#c9ced6">{etiqueta}</text>
    </g>
  );
};

const Llanta: React.FC<{ cx: number; cy: number; r: number; giro: number; texto?: string; resalte?: number; grietas?: number }> = ({ cx, cy, r, giro, texto, resalte = 0, grietas = 0 }) => (
  <g transform={`translate(${cx} ${cy})`}>
    <ellipse cx={0} cy={r * 1.05} rx={r * 0.9} ry={r * 0.12} fill="url(#sombra)" />
    <circle r={r} fill="#16171b" />
    <circle r={r * 0.97} fill="none" stroke="#262830" strokeWidth={r * 0.06} strokeDasharray={`${r * 0.12} ${r * 0.08}`} transform={`rotate(${giro})`} />
    <circle r={r * 0.82} fill="#1d1f25" />
    <defs>
      <path id={`arco-${cx}`} d={`M ${-r * 0.7} 0 A ${r * 0.7} ${r * 0.7} 0 0 1 ${r * 0.7} 0`} />
    </defs>
    {texto ? (
      <g transform={`rotate(${giro * 0.15})`}>
        <text fontFamily={ANTON} fontSize={r * 0.15} fill={resalte > 0 ? AMARILLO : "#7d828d"} letterSpacing={r * 0.01}>
          <textPath href={`#arco-${cx}`} startOffset="50%" textAnchor="middle">{texto}</textPath>
        </text>
      </g>
    ) : null}
    <circle r={r * 0.5} fill="url(#rin)" />
    <g transform={`rotate(${giro})`}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path key={a} d={`M${-r * 0.05} ${-r * 0.12} L${-r * 0.09} ${-r * 0.46} L${r * 0.09} ${-r * 0.46} L${r * 0.05} ${-r * 0.12} Z`} fill="#8c929d" transform={`rotate(${a})`} />
      ))}
    </g>
    <circle r={r * 0.12} fill="#d8dce2" />
    {grietas > 0
      ? Array.from({ length: 10 }).map((_, k) => {
          const a = (k / 10) * Math.PI * 2;
          const len = r * 0.12 * lim(grietas * 1.5 - k * 0.08);
          const x0 = Math.cos(a) * r * 0.86;
          const y0 = Math.sin(a) * r * 0.86;
          return <path key={k} d={`M${x0} ${y0} l${Math.cos(a + 0.5) * len} ${Math.sin(a + 0.5) * len} l${Math.cos(a - 0.4) * len * 0.7} ${Math.sin(a - 0.4) * len * 0.7}`} stroke="#e8a23a" strokeWidth={3} fill="none" />;
        })
      : null}
  </g>
);

const Etiqueta: React.FC<{ x: number; y: number; texto: string; o: number; color?: string; tam?: number }> = ({ x, y, texto, o, color = ROJO, tam = 46 }) => (
  <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * o})`} opacity={o}>
    <rect x={-texto.length * tam * 0.3 - 24} y={-tam * 0.85} width={texto.length * tam * 0.6 + 48} height={tam * 1.35} rx={tam * 0.35} fill={color} />
    <text y={tam * 0.2} textAnchor="middle" fontFamily={ANTON} fontSize={tam} fill={BLANCO}>{texto}</text>
  </g>
);

const Bateria: React.FC<{ x: number; y: number; carga: number; escarcha: number; l: number }> = ({ x, y, carga, escarcha, l }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={250} rx={300} ry={30} fill="url(#sombra)" />
    <rect x={-260} y={-180} width={520} height={420} rx={40} fill="#1d2027" stroke="#3a3e48" strokeWidth={8} />
    <rect x={-200} y={-230} width={90} height={60} rx={12} fill={ROJO} />
    <rect x={110} y={-230} width={90} height={60} rx={12} fill="#2b2e36" />
    <text x={-155} y={-120} textAnchor="middle" fontFamily={ANTON} fontSize={70} fill={ROJO}>+</text>
    <text x={155} y={-120} textAnchor="middle" fontFamily={ANTON} fontSize={70} fill="#c9ced6">−</text>
    {[0, 1, 2, 3, 4].map((k) => (
      <rect key={k} x={-200 + k * 84} y={-40} width={66} height={200} rx={14} fill={k / 5 < carga ? (carga < 0.35 ? ROJO : "#2fd36b") : "#2b2e36"} />
    ))}
    {escarcha > 0 ? <rect x={-260} y={-180} width={520} height={420} rx={40} fill="#cfe9ff" opacity={0.28 * escarcha} /> : null}
    {escarcha > 0
      ? Array.from({ length: 14 }).map((_, k) => (
          <circle key={k} cx={-240 + random(`bf${k}`) * 480} cy={-160 + random(`bg${k}`) * 380} r={6 + random(`bh${k}`) * 10} fill="#eef8ff" opacity={escarcha * 0.6} />
        ))
      : null}
    {carga < 0.35 ? <path d={`M20 -150 L-30 0 L20 0 L-20 150`} stroke={AMARILLO} strokeWidth={14} fill="none" strokeLinejoin="round" opacity={0.5 + 0.5 * Math.sin(l * 14)} transform="translate(0 -360) scale(0.7)" /> : null}
  </g>
);

const Bomba: React.FC<{ x: number; y: number; l: number }> = ({ x, y, l }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={330} rx={240} ry={28} fill="url(#sombra)" />
    <rect x={-170} y={-260} width={300} height={590} rx={36} fill={ROJO} />
    <rect x={-130} y={-210} width={220} height={140} rx={16} fill="#101217" />
    <text x={-20} y={-125} textAnchor="middle" fontFamily={ANTON} fontSize={70} fill={AMARILLO}>${(Math.floor(l * 97) % 1000).toString().padStart(3, "0")}</text>
    <rect x={-130} y={-40} width={220} height={60} rx={12} fill={ROJO_OSC} />
    <path d="M130 -60 Q230 -60 230 60 L230 200" stroke="#14161c" strokeWidth={22} fill="none" strokeLinecap="round" />
    <rect x={200} y={190} width={60} height={110} rx={14} fill="#2b2e36" />
  </g>
);

const Documento: React.FC<{ x: number; y: number; s: number; rot: number; lineas: number }> = ({ x, y, s, rot, lineas }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-170} y={-220} width={340} height={440} rx={22} fill="#f5f6f8" />
    <rect x={-130} y={-180} width={160} height={28} rx={8} fill={ROJO} />
    {Array.from({ length: 6 }).map((_, k) => (
      <rect key={k} x={-130} y={-120 + k * 50} width={260 * lim(lineas * 6 - k)} height={18} rx={6} fill="#c9ced6" />
    ))}
  </g>
);

const Triangulo: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 -110 L105 80 L-105 80 Z" fill="none" stroke={ROJO} strokeWidth={26} strokeLinejoin="round" />
    <path d="M0 -60 L60 50 L-60 50 Z" fill="none" stroke="#ffb300" strokeWidth={10} strokeLinejoin="round" />
    <rect x={-70} y={80} width={140} height={14} rx={6} fill="#2b2e36" />
  </g>
);

const Grua: React.FC<{ x: number; y: number; s: number; giro: number }> = ({ x, y, s, giro }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={420} cy={330} rx={430} ry={30} fill="url(#sombra)" />
    <rect x={0} y={150} width={560} height={110} rx={18} fill="#e9ecf0" />
    <path d="M560 260 L560 120 Q560 80 600 80 L720 80 Q760 80 790 130 L840 200 L840 260 Z" fill={AMARILLO} />
    <path d="M610 100 L710 100 Q735 100 755 130 L790 180 L610 180 Z" fill="url(#vidrio)" />
    <path d="M60 150 L330 40" stroke="#2b2e36" strokeWidth={22} strokeLinecap="round" />
    <path d="M330 40 L330 110" stroke="#2b2e36" strokeWidth={8} />
    <rect x={620} y={40} width={110} height={30} rx={10} fill="#ffb300" />
    <Rueda cx={140} cy={270} r={58} giro={giro} />
    <Rueda cx={700} cy={270} r={58} giro={giro} />
  </g>
);

const Telefono: React.FC<{ x: number; y: number; l: number }> = ({ x, y, l }) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin(l * 30) * 4 * (l < 1.2 ? 1 : 0)})`}>
    <rect x={-130} y={-250} width={260} height={500} rx={40} fill="#14161c" stroke="#3a3e48" strokeWidth={8} />
    <rect x={-108} y={-210} width={216} height={400} rx={18} fill="#1f9d55" />
    <text y={-60} textAnchor="middle" fontFamily={POPPINS} fontWeight={800} fontSize={34} fill={BLANCO}>Llamando…</text>
    <text y={0} textAnchor="middle" fontFamily={ANTON} fontSize={52} fill={BLANCO}>GRÚA 24/7</text>
    {[0, 1, 2].map((k) => (
      <circle key={k} cx={0} cy={110} r={30 + ((l * 60 + k * 30) % 90)} fill="none" stroke={BLANCO} strokeWidth={4} opacity={1 - ((l * 60 + k * 30) % 90) / 90} />
    ))}
  </g>
);

// ---------- escenas ----------
type E = { l: number; d: number };

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <Defs />
    {children}
  </svg>
);

const ESCENAS: Record<string, React.FC<E>> = {
  // ----- calentar motor -----
  frio: ({ l }) => (
    <Svg>
      <Copos l={l} />
      <Auto x={20 + Math.sin(l * 30) * 2} y={760} s={1.0} giro={0} />
      <Humo l={l} x={110} y={1010} n={8} />
      <Reloj cx={840} cy={640} r={105} ang={l * 360} />
      <Etiqueta x={840} y={800} texto="10 MIN" o={p(l, 0.3, 0.7)} />
    </Svg>
  ),
  mito: ({ l }) => {
    const inc = Math.sin(l * 2.2) * 12 * (1 - p(l, 2.2, 3.2)) - 14 * p(l, 2.2, 3.2);
    return (
      <Svg>
        <g transform="translate(540 900)">
          <rect x={-12} y={-40} width={24} height={360} rx={10} fill="#3a3e48" />
          <rect x={-160} y={320} width={320} height={40} rx={16} fill="#3a3e48" />
          <g transform={`rotate(${inc})`}>
            <rect x={-420} y={-60} width={840} height={22} rx={10} fill="#c9ced6" />
            <g transform="translate(-330 -40)">
              <rect x={-150} y={-150} width={300} height={130} rx={24} fill={ROJO} />
              <text y={-62} textAnchor="middle" fontFamily={ANTON} fontSize={78} fill={BLANCO}>MITO</text>
            </g>
            <g transform="translate(330 -40)">
              <rect x={-150} y={-150} width={300} height={130} rx={24} fill="#1f9d55" />
              <text y={-62} textAnchor="middle" fontFamily={ANTON} fontSize={66} fill={BLANCO}>VERDAD</text>
            </g>
          </g>
        </g>
      </Svg>
    );
  },
  arranque: ({ l }) => (
    <Svg>
      <g transform="translate(540 820)">
        <circle r={230} fill="#16181e" stroke="#3a3e48" strokeWidth={14} />
        <circle r={170} fill={p(l, 0.6, 0.9) > 0.5 ? ROJO : "#2b2e36"} />
        {p(l, 0.6, 0.9) > 0.5 ? <circle r={230} fill={ROJO} opacity={0.35} filter="url(#brillo)" /> : null}
        <text y={-10} textAnchor="middle" fontFamily={ANTON} fontSize={64} fill={BLANCO}>ENGINE</text>
        <text y={60} textAnchor="middle" fontFamily={ANTON} fontSize={50} fill={BLANCO}>START</text>
      </g>
      <Medidor cx={540} cy={1280} r={150} v={0.12 + 0.18 * p(l, 0.9, 1.5) - 0.05 * p(l, 1.5, 2.4)} etiqueta="RPM ×1000" />
    </Svg>
  ),
  cronometro: ({ l }) => (
    <Svg>
      <g transform="translate(540 1180)">
        <rect x={-40} y={-330} width={80} height={60} rx={14} fill="#c9ced6" />
        <Reloj cx={0} cy={0} r={250} ang={p(l, 0, 2.6) * 360} color="#e9ecf0" />
      </g>
    </Svg>
  ),
  manejo: ({ l }) => (
    <Svg>
      <g transform={`translate(${-((l * 900) % 240)} 0)`}>
        {Array.from({ length: 8 }).map((_, k) => (
          <rect key={k} x={k * 240} y={1150} width={140} height={14} rx={6} fill="rgba(255,255,255,0.5)" />
        ))}
      </g>
      <g transform={`translate(${-((l * 300) % 400)} 0)`} opacity={0.5}>
        {Array.from({ length: 5 }).map((_, k) => (
          <g key={k} transform={`translate(${k * 400 + 100} 640)`}>
            <rect x={0} y={0} width={90} height={260} rx={10} fill="#2b3040" />
            <rect x={110} y={80} width={70} height={180} rx={10} fill="#232838" />
          </g>
        ))}
      </g>
      <Auto x={20} y={760} s={1.0} giro={l * 400} />
      <Medidor cx={820} cy={520} r={130} v={0.15 + 0.4 * p(l, 0.5, 5.5)} etiqueta="TEMP" color={AZUL} />
      <Etiqueta x={820} y={700} texto="SUAVE" o={p(l, 2.8, 3.2)} color="#1f9d55" />
    </Svg>
  ),
  bateria: ({ l, d }) => (
    <Svg>
      <Copos l={l} n={16} />
      <Bateria x={540} y={900} carga={1 - 0.8 * p(l, 1.0, d - 1.5)} escarcha={p(l, 0.3, 1.5)} l={l} />
      <Etiqueta x={540} y={1300} texto="+3 AÑOS" o={p(l, 2.0, 2.4)} />
    </Svg>
  ),
  // ----- llanta -----
  llanta: ({ l }) => (
    <Svg>
      <Llanta cx={540} cy={900} r={360} giro={l * 120} />
      <g transform={`translate(780 640) rotate(-12) scale(${p(l, 1.2, 1.6)})`}>
        <rect x={-170} y={-70} width={340} height={140} rx={16} fill="none" stroke={ROJO} strokeWidth={10} />
        <text y={22} textAnchor="middle" fontFamily={ANTON} fontSize={64} fill={ROJO}>CADUCA</text>
      </g>
    </Svg>
  ),
  lupa: ({ l }) => {
    const x = 380 + 300 * p(l, 0.3, 2.8);
    return (
      <Svg>
        <Llanta cx={540} cy={900} r={400} giro={0} texto="205/55 R16 91V · DOT 2321" />
        <g transform={`translate(${x} 700)`}>
          <circle r={130} fill="rgba(191,226,255,0.15)" stroke="#e9ecf0" strokeWidth={18} />
          <rect x={80} y={80} width={40} height={180} rx={18} fill={ROJO} transform="rotate(-45 100 170)" />
        </g>
      </Svg>
    );
  },
  costado: ({ l }) => (
    <Svg>
      <Llanta cx={540} cy={1500} r={720} giro={-10 + l * 1.5} texto="205/55 R16" resalte={1} />
    </Svg>
  ),
  dot: ({ l }) => (
    <Svg>
      <Llanta cx={540} cy={1500} r={720} giro={-14 + l * 1.2} texto="DOT  X9  2321" resalte={1} />
    </Svg>
  ),
  envejece: ({ l, d }) => {
    const anio = 2021 + Math.floor(10 * p(l, 0.5, d - 1));
    return (
      <Svg>
        <Llanta cx={540} cy={1020} r={300} giro={0} grietas={p(l, 1.0, d - 1)} />
        <g transform="translate(540 560)">
          <rect x={-200} y={-90} width={400} height={170} rx={24} fill="#f5f6f8" />
          <rect x={-200} y={-90} width={400} height={50} rx={20} fill={ROJO} />
          <text y={50} textAnchor="middle" fontFamily={ANTON} fontSize={90} fill="#14161c">{anio}</text>
        </g>
      </Svg>
    );
  },
  // ----- gasolina -----
  bomba: ({ l }) => (
    <Svg>
      <Bomba x={430} y={900} l={l} />
      {Array.from({ length: 8 }).map((_, k) => {
        const f = (l * 0.8 + k / 8) % 1;
        return (
          <g key={k} transform={`translate(${720 + f * 200 + Math.sin(k) * 60} ${1200 - f * 700}) rotate(${f * 90 + k * 30})`} opacity={1 - f}>
            <rect x={-50} y={-26} width={100} height={52} rx={8} fill="#2fa35a" />
            <text y={14} textAnchor="middle" fontFamily={ANTON} fontSize={34} fill="#d8ffe6">$</text>
          </g>
        );
      })}
    </Svg>
  ),
  tanque: ({ l }) => (
    <Svg>
      <Medidor cx={540} cy={900} r={330} v={0.9 - 0.85 * p(l, 0.3, 2.2)} etiqueta="E  ⛽  F" />
    </Svg>
  ),
  llantaBaja: ({ l }) => (
    <Svg>
      <Medidor cx={540} cy={640} r={170} v={0.8 - 0.55 * p(l, 0.5, 2.5)} etiqueta="PSI" />
      <g transform="translate(540 1130)">
        <g transform={`scale(1 ${1 - 0.14 * p(l, 0.5, 2.5)}) translate(0 ${40 * p(l, 0.5, 2.5)})`}>
          <Llanta cx={0} cy={0} r={230} giro={0} />
        </g>
      </g>
      <Etiqueta x={800} y={900} texto="MÁS ESFUERZO" o={p(l, 2.6, 3.0)} />
    </Svg>
  ),
  cajuela: ({ l }) => (
    <Svg>
      <Auto x={20} y={980 + 18 * p(l, 1.2, 3.5)} s={1.0} giro={0} />
      {[0, 1, 2, 3, 4].map((k) => {
        const e = p(l, 0.3 + k * 0.5, 0.7 + k * 0.5);
        return <rect key={k} x={140 + (k % 2) * 120} y={1020 - Math.floor(k / 2) * 110 - (1 - e) * 600} width={110} height={100} rx={10} fill={["#b9824a", "#a06d3b", "#c79257"][k % 3]} stroke="#7a5128" strokeWidth={5} opacity={e} />;
      })}
      <Etiqueta x={760} y={700} texto="+ PESO" o={p(l, 2.6, 3.0)} />
    </Svg>
  ),
  acelerones: ({ l }) => {
    const tumbo = Math.sin(l * 9) * 4;
    return (
      <Svg>
        {Array.from({ length: 10 }).map((_, k) => (
          <rect key={k} x={((k * 230 - l * 1400) % 1300) + 1100 - 1300} y={700 + (k % 5) * 90} width={180} height={8} rx={4} fill="rgba(255,255,255,0.35)" />
        ))}
        <Auto x={20} y={760} s={1.0} giro={l * 900} tumbo={tumbo} />
        {Array.from({ length: 6 }).map((_, k) => {
          const f = (l * 1.4 + k / 6) % 1;
          return <path key={k} d="M0 -26 Q20 4 0 24 Q-20 4 0 -26 Z" fill={AMARILLO} transform={`translate(${120 - f * 120} ${1080 + f * 120})`} opacity={1 - f} />;
        })}
      </Svg>
    );
  },
  esperando: ({ l, d }) => (
    <Svg>
      <Auto x={20} y={860 + Math.sin(l * 40) * 1.5} s={1.0} giro={0} />
      <Humo l={l} x={110} y={1110} n={8} />
      <Reloj cx={300} cy={560} r={110} ang={l * 200} />
      <Medidor cx={780} cy={560} r={130} v={0.7 - 0.5 * p(l, 0.5, d)} etiqueta="E  ⛽  F" />
    </Svg>
  ),
  ventanas: ({ l }) => (
    <Svg>
      {Array.from({ length: 8 }).map((_, k) => (
        <path key={k} d={`M${1100 - ((l * 500 + k * 160) % 1300)} ${820 + k * 22} q 40 -12 80 0`} stroke="rgba(220,240,255,0.55)" strokeWidth={6} fill="none" />
      ))}
      <Auto x={20} y={760} s={1.0} giro={l * 200} ventanaAbierta={p(l, 0.3, 1.2)} />
      <Etiqueta x={540} y={620} texto="CIUDAD · VENTANAS" o={p(l, 2.8, 3.3)} color="#1f9d55" tam={50} />
    </Svg>
  ),
  carretera: ({ l }) => (
    <Svg>
      {Array.from({ length: 12 }).map((_, k) => (
        <path key={k} d={`M${1100 - ((l * 1400 + k * 140) % 1300)} ${780 + (k % 6) * 40} l 140 0`} stroke="rgba(220,240,255,0.5)" strokeWidth={6} />
      ))}
      <Auto x={20} y={760} s={1.0} giro={l * 900} />
      <g transform="translate(820 560)">
        <circle r={110} fill="#14161c" stroke={AZUL} strokeWidth={10} />
        {[0, 60, 120].map((a) => (
          <line key={a} x1={-60} y1={0} x2={60} y2={0} stroke="#bfe2ff" strokeWidth={12} strokeLinecap="round" transform={`rotate(${a + l * 30})`} />
        ))}
      </g>
      <Etiqueta x={540} y={1300} texto="CARRETERA · A/C" o={p(l, 0.4, 0.8)} color={AZUL} tam={50} />
    </Svg>
  ),
  // ----- ponchadura -----
  ponchada: ({ l }) => {
    const b = p(l, 0.6, 1.0);
    return (
      <Svg>
        {Array.from({ length: 10 }).map((_, k) => (
          <rect key={k} x={((k * 230 - l * 1000 * (1 - 0.6 * b)) % 1300) + 1100 - 1300} y={1150} width={140} height={12} rx={5} fill="rgba(255,255,255,0.5)" />
        ))}
        <Auto x={20} y={760} s={1.0} giro={l * 700} baja={b} tumbo={b * Math.sin(l * 25) * 3} />
        {b > 0 ? (
          <g transform="translate(790 1060)" opacity={1 - p(l, 1.4, 2.2)}>
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <line key={k} x1={0} y1={0} x2={Math.cos(k) * 120 * b} y2={-Math.abs(Math.sin(k)) * 120 * b} stroke={AMARILLO} strokeWidth={8} strokeLinecap="round" />
            ))}
          </g>
        ) : null}
        <Etiqueta x={790} y={700} texto="¡PSSST!" o={p(l, 0.6, 0.9) * (1 - p(l, 2.0, 2.4))} />
      </Svg>
    );
  },
  intermitentes: ({ l }) => {
    const on = Math.floor(l * 2.6) % 2 === 0;
    return (
      <Svg>
        <g transform="translate(540 900)">
          <ellipse cx={0} cy={300} rx={460} ry={36} fill="url(#sombra)" />
          <path d="M-420 260 L-420 40 Q-410 -60 -300 -110 L-200 -250 Q-150 -300 -60 -300 L60 -300 Q150 -300 200 -250 L300 -110 Q410 -60 420 40 L420 260 Z" fill="url(#carroc)" />
          <path d="M-250 -110 L-170 -240 L170 -240 L250 -110 Z" fill="url(#vidrio)" />
          <rect x={-140} y={60} width={280} height={70} rx={10} fill="#f5f6f8" />
          <text y={110} textAnchor="middle" fontFamily={ANTON} fontSize={48} fill="#14161c">CDMX</text>
          {[-1, 1].map((s) => (
            <g key={s}>
              <rect x={s * 300 - 80} y={-40} width={160} height={70} rx={20} fill={on ? "#ffb300" : "#6a1013"} />
              {on ? <circle cx={s * 300} cy={-5} r={110} fill="#ffb300" opacity={0.45} filter="url(#brillo)" /> : null}
            </g>
          ))}
          <rect x={-330} y={260} width={120} height={70} rx={16} fill="#15161a" />
          <rect x={210} y={260} width={120} height={70} rx={16} fill="#15161a" />
        </g>
      </Svg>
    );
  },
  volante: ({ l }) => (
    <Svg>
      <g transform={`translate(540 820) rotate(${Math.sin(l * 6) * 6 * (1 - p(l, 1.5, 3))})`}>
        <circle r={320} fill="none" stroke="#1d2027" strokeWidth={70} />
        <circle r={320} fill="none" stroke="#2b2e36" strokeWidth={12} />
        <rect x={-300} y={-30} width={600} height={60} rx={20} fill="#1d2027" />
        <rect x={-35} y={0} width={70} height={300} rx={20} fill="#1d2027" />
        <circle r={110} fill="#2b2e36" />
        <text y={20} textAnchor="middle" fontFamily={ANTON} fontSize={56} fill={ROJO}>DA</text>
        {[-1, 1].map((s) => (
          <ellipse key={s} cx={s * 320} cy={-40} rx={70} ry={110} fill="#d9a77c" />
        ))}
      </g>
      <g transform="translate(540 1400)">
        <rect x={-90} y={-120 + 60 * p(l, 2.0, 4.5)} width={180} height={260} rx={30} fill="#3a3e48" transform={`rotate(${-20 + 20 * p(l, 2.0, 4.5)})`} />
        <text y={200} textAnchor="middle" fontFamily={POPPINS} fontWeight={800} fontSize={36} fill="#c9ced6">ACELERADOR</text>
      </g>
    </Svg>
  ),
  orillarse: ({ l }) => {
    const x = 470 + 330 * p(l, 1.0, 3.6);
    const on = Math.floor(l * 2.6) % 2 === 0;
    return (
      <Svg>
        <rect x={180} y={300} width={720} height={1500} fill="#2a2d35" />
        <rect x={830} y={300} width={90} height={1500} fill="#3a3e48" />
        {[0, 1].map((c) =>
          Array.from({ length: 9 }).map((_, k) => <rect key={`${c}-${k}`} x={415 + c * 220} y={((k * 200 + l * 400) % 1600) + 250} width={14} height={110} rx={5} fill="rgba(255,255,255,0.7)" />),
        )}
        <rect x={826} y={300} width={8} height={1500} fill={AMARILLO} />
        <g transform={`translate(${x} 1150) rotate(${12 * Math.sin(p(l, 1.0, 3.6) * Math.PI)})`}>
          <rect x={-70} y={-140} width={140} height={280} rx={40} fill="url(#carroc)" />
          <rect x={-55} y={-90} width={110} height={70} rx={14} fill="url(#vidrio)" />
          {[-1, 1].map((s) => (
            <rect key={s} x={s * 45 - 18} y={118} width={36} height={22} rx={8} fill={on ? "#ffb300" : "#6a1013"} />
          ))}
        </g>
        {Array.from({ length: 3 }).map((_, k) => (
          <path key={k} d="M0 0 L40 40 L0 80" stroke={AMARILLO} strokeWidth={14} fill="none" strokeLinecap="round" transform={`translate(${620 + k * 50} 900)`} opacity={(Math.floor(l * 3) % 3 === k ? 1 : 0.25) * (1 - p(l, 3.6, 4.2))} />
        ))}
      </Svg>
    );
  },
  triangulo: ({ l }) => (
    <Svg>
      <Auto x={330} y={760} s={0.72} giro={0} luces={Math.floor(l * 2.6) % 2 === 0 ? 1 : 0} />
      <Triangulo x={180 - 0 * l} y={1060} s={p(l, 3.6, 4.2)} />
      <g opacity={p(l, 4.0, 4.4)}>
        <line x1={260} y1={1170} x2={560} y2={1170} stroke={BLANCO} strokeWidth={5} strokeDasharray="14 10" />
        <text x={410} y={1230} textAnchor="middle" fontFamily={ANTON} fontSize={44} fill={BLANCO}>VARIOS METROS</text>
      </g>
      <g transform="translate(540 560)" opacity={p(l, 0.9, 1.3) * (1 - p(l, 3.4, 3.8))}>
        <rect x={-360} y={-70} width={720} height={130} rx={24} fill={ROJO} />
        <text y={20} textAnchor="middle" fontFamily={ANTON} fontSize={64} fill={BLANCO}>✕ LADO DEL TRÁFICO</text>
      </g>
    </Svg>
  ),
  grua: ({ l, d }) => (
    <Svg>
      <g opacity={1 - p(l, 2.6, 3.0)}>
        <Telefono x={540} y={850} l={l} />
      </g>
      <g opacity={p(l, 2.8, 3.2)}>
        <Grua x={-900 + 940 * p(l, 3.0, d - 1.5)} y={900} s={1.1} giro={l * 500} />
        <Etiqueta x={540} y={640} texto="TU VIDA VALE MÁS" o={p(l, 5.8, 6.2)} />
      </g>
    </Svg>
  ),
  // ----- auto usado -----
  maquillaje: ({ l }) => (
    <Svg>
      <Auto x={20} y={760} s={1.0} giro={0} />
      {Array.from({ length: 10 }).map((_, k) => {
        const f = (l * 1.6 + k / 10) % 1;
        return <path key={k} d="M0 -22 L6 -6 L22 0 L6 6 L0 22 L-6 6 L-22 0 L-6 -6 Z" fill={AMARILLO} transform={`translate(${150 + random(`mk${k}`) * 800} ${780 + random(`ml${k}`) * 260}) scale(${Math.sin(f * Math.PI)})`} />;
      })}
      <g transform={`translate(${200 + 600 * p(l, 0.2, 1.8)} 760) rotate(30)`}>
        <rect x={-14} y={0} width={28} height={180} rx={12} fill="#3a3e48" />
        <ellipse cx={0} cy={-30} rx={44} ry={60} fill="#f2c6a4" />
      </g>
    </Svg>
  ),
  lista: ({ l }) => (
    <Svg>
      <g transform="translate(540 960)">
        <rect x={-300} y={-420} width={600} height={820} rx={36} fill="#f5f6f8" />
        <rect x={-110} y={-460} width={220} height={80} rx={20} fill="#3a3e48" />
        {[0, 1, 2, 3, 4].map((k) => {
          const e = p(l, 0.3 + k * 0.5, 0.6 + k * 0.5);
          return (
            <g key={k} transform={`translate(-230 ${-300 + k * 140})`}>
              <rect x={0} y={-40} width={80} height={80} rx={18} fill={e > 0.5 ? "#1f9d55" : "#d5d9df"} />
              {e > 0.5 ? <path d="M18 0 L34 18 L64 -18" stroke={BLANCO} strokeWidth={12} fill="none" strokeLinecap="round" /> : null}
              <rect x={110} y={-14} width={330 * e} height={28} rx={10} fill="#c9ced6" />
            </g>
          );
        })}
      </g>
    </Svg>
  ),
  pantalla: ({ l }) => (
    <Svg>
      <g transform="translate(540 980)" opacity={0.9}>
        <rect x={-420} y={-300} width={840} height={540} rx={30} fill="#14161c" stroke="#3a3e48" strokeWidth={10} />
        <rect x={-520} y={240} width={1040} height={50} rx={20} fill="#3a3e48" />
      </g>
    </Svg>
  ),
  papeles: ({ l }) => (
    <Svg>
      {[0, 1, 2].map((k) => (
        <Documento key={k} x={330 + k * 210} y={1350 - 40 * p(l, k * 0.3, k * 0.3 + 0.6)} s={0.7} rot={-14 + k * 14} lineas={p(l, 0.3 + k * 0.3, 1.2 + k * 0.3)} />
      ))}
    </Svg>
  ),
  odometro: ({ l }) => {
    const km = Math.floor(12000 * p(l, 0.3, 1.8));
    return (
      <Svg>
        <g transform="translate(540 650)">
          <rect x={-360} y={-110} width={720} height={220} rx={30} fill="#101217" stroke="#3a3e48" strokeWidth={8} />
          <text y={40} textAnchor="middle" fontFamily={ANTON} fontSize={120} fill={AMARILLO} letterSpacing={10}>{km.toLocaleString("es-MX")} km</text>
        </g>
        <g transform="translate(540 1220)">
          <rect x={-260} y={-180} width={200} height={300} rx={34} fill="#2b2e36" />
          <rect x={60} y={-180} width={200} height={300} rx={34} fill="#2b2e36" />
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={-240} y={-150 + k * 66} width={160} height={14} rx={6} fill="#1a1c22" opacity={1 - 0.8 * p(l, 2.2, 4)} />
          ))}
          <ellipse cx={-160} cy={-30} rx={70} ry={100} fill="#8a8f99" opacity={0.6 * p(l, 2.2, 4)} />
          <ellipse cx={160} cy={-30} rx={70} ry={100} fill="#8a8f99" opacity={0.6 * p(l, 2.2, 4)} />
        </g>
        <Etiqueta x={540} y={1530} texto="¿NO CUADRA?" o={p(l, 5.6, 6.0)} />
      </Svg>
    );
  },
  fuga: ({ l, d }) => (
    <Svg>
      <Auto x={20} y={700} s={1.0} giro={0} />
      {Array.from({ length: 5 }).map((_, k) => {
        const f = (l * 1.2 + k / 5) % 1;
        return <path key={k} d="M0 -18 Q14 4 0 18 Q-14 4 0 -18 Z" fill="#141414" transform={`translate(${560} ${1010 + f * 120})`} opacity={1 - f * 0.5} />;
      })}
      <ellipse cx={560} cy={1140} rx={60 + 160 * p(l, 0.3, d)} ry={12 + 28 * p(l, 0.3, d)} fill="#0b0b0b" opacity={0.9} />
      <g transform={`translate(${760 - 200 * p(l, 1.0, 2.0)} 1240)`}>
        <circle r={90} fill="rgba(191,226,255,0.15)" stroke="#e9ecf0" strokeWidth={14} />
        <rect x={56} y={56} width={30} height={130} rx={14} fill={ROJO} transform="rotate(-45 70 120)" />
      </g>
    </Svg>
  ),
  mecanico: ({ l }) => (
    <Svg>
      <g transform="translate(540 820)">
        <circle r={260} fill="#14161c" stroke={ROJO} strokeWidth={14} />
        <g transform={`rotate(${-30 + 30 * Math.sin(l * 4)})`}>
          <path d="M-30 -180 L30 -180 L30 120 L-30 120 Z" fill="url(#metal)" />
          <path d="M-90 -230 Q-90 -150 0 -150 Q90 -150 90 -230 L40 -230 L40 -190 L-40 -190 L-40 -230 Z" fill="url(#metal)" />
        </g>
      </g>
      {Array.from({ length: 7 }).map((_, k) => {
        const e = p(l, 3.8 + k * 0.18, 4.3 + k * 0.18);
        return <ellipse key={k} cx={280 + k * 85} cy={1350 - (1 - e) * 400} rx={40} ry={16} fill={AMARILLO} stroke="#b88a00" strokeWidth={4} opacity={e} />;
      })}
      <Etiqueta x={540} y={1250} texto="AHORRAS $$$" o={p(l, 4.4, 4.8)} color="#1f9d55" />
    </Svg>
  ),
  // ----- cierre de marca -----
  cta: ({ l }) => (
    <Svg>
      <g transform={`translate(540 860) scale(${0.85 + 0.15 * p(l, 0, 0.6)})`}>
        <circle r={300} fill={ROJO} opacity={0.18} filter="url(#brillo)" />
        <path d="M0 -260 L220 -170 L220 40 Q220 200 0 280 Q-220 200 -220 40 L-220 -170 Z" fill={ROJO} />
        <path d="M0 -200 L170 -130 L170 40 Q170 160 0 220 Q-170 160 -170 40 L-170 -130 Z" fill="none" stroke={BLANCO} strokeWidth={8} opacity={0.6} />
        <g transform={`rotate(${-20 + 10 * Math.sin(l * 2)})`}>
          <path d="M-18 -110 L18 -110 L18 90 L-18 90 Z" fill={BLANCO} />
          <path d="M-56 -140 Q-56 -90 0 -90 Q56 -90 56 -140 L26 -140 L26 -116 L-26 -116 L-26 -140 Z" fill={BLANCO} />
        </g>
      </g>
    </Svg>
  ),
};

export const Escena: React.FC<{ nombre: string; l: number; d: number; t: number }> = ({ nombre, l, d, t }) => {
  const C = ESCENAS[nombre];
  return (
    <AbsoluteFill>
      <FondoAnim t={t} />
      {C ? <C l={l} d={d} /> : null}
    </AbsoluteFill>
  );
};
