// Escenas del video «¿Mito o realidad?»: moneda MITO/REALIDAD, cochera con reloj,
// bomba de gasolina con manual, ventila del aire con fuga, termómetro de llanta y sello.
import { random } from "remotion";
import { ANTON, POPPINS, PESO_POPPINS, ROJO_DA } from "../../doctor-auto/constantes";
import { AutoViaje } from "../viaje/Escenas";

const W = 1080;
const H = 1920;
const limitar01 = (x: number) => Math.max(0, Math.min(1, x));
export const ROJO_MITO = "#D1262C";
export const VERDE_REALIDAD = "#1FA45A";

// Textura de tinta para sellos y monedas.
const Tinta: React.FC<{ id: string }> = ({ id }) => (
  <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={4} result="ruido" />
    <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.25" result="huecos" />
    <feComposite in="SourceGraphic" in2="huecos" operator="in" />
  </filter>
);

// Moneda que gira (centro cx,cy; radio r). cara visible según el giro: MITO (rojo) o REALIDAD (verde).
export const Moneda: React.FC<{ cx: number; cy: number; r: number; giro: number }> = ({ cx, cy, r, giro }) => {
  const c = Math.cos((giro * Math.PI) / 180);
  const mito = c >= 0;
  const color = mito ? ROJO_MITO : VERDE_REALIDAD;
  const ancho = Math.max(0.04, Math.abs(c));
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <radialGradient id="moneda-brillo" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity={0.55} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy + r + 60} rx={r * 0.9} ry={r * 0.12} fill="#000" opacity={0.45} />
      <g transform={`translate(${cx} ${cy}) scale(${ancho} 1)`}>
        {/* canto */}
        <circle r={r} fill={mito ? "#7e1418" : "#0e5c32"} transform={`translate(${(c >= 0 ? -1 : 1) * 14 * (1 - ancho)} 0)`} />
        <circle r={r} fill={color} />
        <circle r={r - 18} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={8} />
        <circle r={r - 36} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} strokeDasharray="6 10" />
        <text y={mito ? r * 0.2 : r * 0.13} textAnchor="middle" fontFamily={ANTON} fontSize={mito ? r * 0.56 : r * 0.36} fill="#fff" letterSpacing={2}>
          {mito ? "MITO" : "REALIDAD"}
        </text>
        <text y={-r * 0.42} textAnchor="middle" fontSize={r * 0.26}>
          {mito ? "✗" : "✓"}
        </text>
        <circle r={r} fill="url(#moneda-brillo)" />
      </g>
    </svg>
  );
};

// Sello de goma circular (pantalla), con tinta irregular.
export const Sello: React.FC<{ cx: number; cy: number; r: number; tipo: "mito" | "realidad"; opacidad: number; giro: number }> = ({ cx, cy, r, tipo, opacidad, giro }) => {
  const color = tipo === "mito" ? ROJO_MITO : VERDE_REALIDAD;
  const texto = tipo === "mito" ? "MITO" : "REALIDAD";
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: opacidad }}>
      <defs>
        <Tinta id="tinta-sello" />
      </defs>
      <g transform={`translate(${cx} ${cy}) rotate(${giro}) scale(${r / 200})`} filter="url(#tinta-sello)">
        <circle r={196} fill={color} fillOpacity={0.16} stroke={color} strokeWidth={16} />
        <circle r={166} fill="none" stroke={color} strokeWidth={6} />
        <rect x={-210} y={-62} width={420} height={124} rx={10} fill={color} />
        <text y={tipo === "mito" ? 42 : 34} textAnchor="middle" fontFamily={ANTON} fontSize={tipo === "mito" ? 118 : 88} fill="#fff" letterSpacing={4}>
          {texto}
        </text>
        {[-1, 1].map((s) => (
          <text key={s} y={s * 118 + (s > 0 ? 18 : 6)} textAnchor="middle" fontFamily={ANTON} fontSize={30} fill={color} letterSpacing={10}>
            {s < 0 ? "DOCTOR AUTO" : "★ ★ ★"}
          </text>
        ))}
      </g>
    </svg>
  );
};

// Cochera fría al amanecer: reloj grande (540,410; r 120), auto con escarcha y escape.
export const RELOJ_COCHERA = { cx: 780, cy: 430, r: 110 };
export const Cochera: React.FC<{ t: number; minutos: number; resuelto: number; avanza: number; humo: number }> = ({ t, minutos, resuelto, avanza, humo }) => {
  const { cx, cy, r } = RELOJ_COCHERA;
  const aMin = (minutos % 1) * 360 * 60 / 60;
  const aHora = (minutos / 60) * 360;
  const lectura = resuelto > 0.5 ? "0:30" : `${Math.floor(minutos).toString().padStart(2, "0")}:00`;
  const colorLectura = resuelto > 0.5 ? "#3ddc84" : "#ff6b6b";
  const gases = Array.from({ length: 7 }, (_, k) => {
    const p = (t * 0.7 + k / 7) % 1;
    return { x: 140 + avanza - p * 180, y: 840 - p * 160, r: 18 + p * 70, o: (1 - p) * 0.4 * humo };
  });
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="pared" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b1d24" />
          <stop offset="1" stopColor="#0b0c10" />
        </linearGradient>
        <linearGradient id="puerta-luz" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb27a" />
          <stop offset="1" stopColor="#6a3a5c" />
        </linearGradient>
        <filter id="blur-cochera" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <rect width={W} height={H} fill="url(#pared)" />
      {/* puerta abierta al amanecer y su luz en el piso */}
      <rect x={760} y={480} width={320} height={460} fill="url(#puerta-luz)" opacity={0.85} />
      <path d="M760 940 L1080 940 L1080 1200 L520 1200 Z" fill="#ffb27a" opacity={0.12} filter="url(#blur-cochera)" />
      {/* repisas con herramientas */}
      <rect x={40} y={560} width={260} height={10} fill="#2c2f38" />
      {[60, 110, 170, 230].map((x, k) => (
        <rect key={x} x={x} y={500 - (k % 2) * 20} width={36} height={60 + (k % 2) * 20} rx={6} fill={k % 2 ? "#3a404c" : ROJO_DA} opacity={0.8} />
      ))}
      <rect y={920} width={W} height={H - 920} fill="#101116" />
      <rect y={920} width={W} height={6} fill="#2a2d36" />
      {/* auto */}
      <g transform={`translate(${avanza} 60)`}>
        <AutoViaje t={t} giro={avanza * 0.9} faros={0.6} altas={0} frenos={0} intermitente={0} humo={0} rebote={humo > 0 ? Math.sin(t * 30) * 1 : 0} />
      </g>
      {/* escarcha en el parabrisas */}
      <g opacity={1 - resuelto} transform={`translate(${avanza} 60)`}>
        <path d="M260 648 L368 574 L514 574 L514 648 Z M530 648 L530 574 L676 574 Q688 574 700 582 L786 648 Z" fill="#dff4ff" opacity={0.45} />
      </g>
      {gases.map((g, k) => (
        <circle key={k} cx={g.x} cy={g.y} r={g.r} fill="#cfd2da" opacity={g.o} />
      ))}
      {/* reloj */}
      <circle cx={cx} cy={cy + 8} r={r + 8} fill="#000" opacity={0.4} filter="url(#blur-cochera)" />
      <circle cx={cx} cy={cy} r={r} fill="#f4f1ea" stroke="#1d1f26" strokeWidth={12} />
      {Array.from({ length: 12 }, (_, k) => {
        const a = (k * 30 * Math.PI) / 180;
        return <line key={k} x1={cx + Math.cos(a) * (r - 22)} y1={cy + Math.sin(a) * (r - 22)} x2={cx + Math.cos(a) * (r - 8)} y2={cy + Math.sin(a) * (r - 8)} stroke="#1d1f26" strokeWidth={k % 3 === 0 ? 6 : 3} />;
      })}
      {/* arco de los minutos transcurridos */}
      <path d={arco(cx, cy, r - 34, -90, -90 + Math.min(359.9, (resuelto > 0.5 ? 0.5 : minutos) * 36))} fill="none" stroke={colorLectura} strokeWidth={14} strokeLinecap="round" opacity={0.85} />
      <line x1={cx} y1={cy} x2={cx + Math.cos(((aHora - 90) * Math.PI) / 180) * 55} y2={cy + Math.sin(((aHora - 90) * Math.PI) / 180) * 55} stroke="#1d1f26" strokeWidth={10} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + Math.cos(((aMin - 90) * Math.PI) / 180) * 88} y2={cy + Math.sin(((aMin - 90) * Math.PI) / 180) * 88} stroke={ROJO_DA} strokeWidth={6} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={10} fill="#1d1f26" />
      <rect x={cx - 74} y={cy + r + 18} width={148} height={56} rx={14} fill="#111" />
      <text x={cx} y={cy + r + 60} textAnchor="middle" fontFamily={ANTON} fontSize={40} fill={colorLectura}>
        {lectura}
      </text>
    </svg>
  );
};

const arco = (cx: number, cy: number, r: number, desde: number, hasta: number) => {
  const a = (desde * Math.PI) / 180;
  const b = (hasta * Math.PI) / 180;
  return `M${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r} A${r} ${r} 0 ${hasta - desde > 180 ? 1 : 0} 1 ${cx + Math.cos(b) * r} ${cy + Math.sin(b) * r}`;
};

// Bomba de gasolina (pantalla de la bomba: centro 540,450; 360×150) con MAGNA y PREMIUM,
// barra de "potencia" con signo de pregunta y el manual del propietario.
export const BOMBA_DY = 100; // la bomba se dibuja 100 px más abajo para dejar libre la etiqueta
export const PANTALLA_BOMBA = { cx: 540, cy: 450 + BOMBA_DY, w: 360, h: 150 };
export const Bomba: React.FC<{ t: number; premium: number; litros: number; potencia: number; misterio: number; manual: number }> = ({ t, premium, litros, potencia, misterio, manual }) => {
  const p = { ...PANTALLA_BOMBA, cy: PANTALLA_BOMBA.cy - BOMBA_DY };
  const parpadeo = Math.floor(t * 4) % 2 === 0;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <g transform={`translate(0 ${BOMBA_DY})`}>
      <defs>
        <linearGradient id="bomba-cuerpo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e9eaee" />
          <stop offset="0.6" stopColor="#c7cad1" />
          <stop offset="1" stopColor="#8f939c" />
        </linearGradient>
        <filter id="blur-bomba" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <ellipse cx={540} cy={918} rx={300} ry={30} fill="#000" opacity={0.5} />
      <rect x={330} y={330} width={420} height={590} rx={30} fill="url(#bomba-cuerpo)" />
      <rect x={330} y={330} width={420} height={70} rx={30} fill={ROJO_DA} />
      <rect x={330} y={370} width={420} height={30} fill={ROJO_DA} />
      <text x={540} y={378} textAnchor="middle" fontFamily={ANTON} fontSize={34} fill="#fff" letterSpacing={6}>
        GASOLINA
      </text>
      {/* pantalla */}
      <rect x={p.cx - p.w / 2} y={p.cy - p.h / 2 + 30} width={p.w} height={p.h - 30} rx={14} fill="#0d1410" stroke="#2d3530" strokeWidth={6} />
      {misterio > 0.5 ? (
        <text x={p.cx} y={p.cy + 62} textAnchor="middle" fontFamily={ANTON} fontSize={86} fill="#ffcf3a" opacity={parpadeo ? 1 : 0.4}>
          ? ? ?
        </text>
      ) : (
        <>
          <text x={p.cx + 150} y={p.cy + 34} textAnchor="end" fontFamily={ANTON} fontSize={58} fill="#7dff9e">
            {litros.toFixed(2)}
          </text>
          <text x={p.cx - 150} y={p.cy + 34} fontFamily={POPPINS} fontWeight={PESO_POPPINS} fontSize={24} fill="#7dff9e">
            LITROS
          </text>
          <text x={p.cx} y={p.cy + 64} textAnchor="middle" fontFamily={POPPINS} fontWeight={PESO_POPPINS} fontSize={20} fill="#4f8f5f">
            {premium > 0.5 ? "PREMIUM · 91+ OCTANOS" : "MAGNA · 87 OCTANOS"}
          </text>
        </>
      )}
      {/* despachadores */}
      {[
        { x: 430, l: "MAGNA", c: "#1FA45A", on: 1 - premium },
        { x: 650, l: "PREMIUM", c: "#D1262C", on: premium },
      ].map((d) => (
        <g key={d.l}>
          {d.on > 0.5 ? <rect x={d.x - 90} y={600} width={180} height={220} rx={20} fill={d.c} opacity={0.35} filter="url(#blur-bomba)" /> : null}
          <rect x={d.x - 80} y={610} width={160} height={200} rx={18} fill="#2a2d34" stroke={d.on > 0.5 ? "#fff" : "#2a2d34"} strokeWidth={5} />
          <rect x={d.x - 80} y={610} width={160} height={54} rx={18} fill={d.c} />
          <text x={d.x} y={648} textAnchor="middle" fontFamily={ANTON} fontSize={30} fill="#fff">
            {d.l}
          </text>
          <path d={`M${d.x - 26} 690 h52 v40 l-14 26 v40 h-24 v-40 l-14 -26 Z`} fill="#111" />
        </g>
      ))}
      {/* barra de "potencia" con signo de pregunta */}
      {potencia > 0 ? (
        <g opacity={limitar01(potencia * 3) * (1 - manual)}>
          <rect x={150} y={380} width={70} height={440} rx={35} fill="#1b1d22" stroke="#3a3d45" strokeWidth={4} />
          <rect x={160} y={810 - 420 * potencia} width={50} height={420 * potencia} rx={25} fill="url(#potencia-g)" />
          <linearGradient id="potencia-g" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ffb020" />
            <stop offset="1" stopColor="#ff3b3b" />
          </linearGradient>
          <text x={185} y={360} textAnchor="middle" fontFamily={ANTON} fontSize={30} fill="#fff">
            POTENCIA
          </text>
          <text x={185} y={850 - 420 * potencia - 6} textAnchor="middle" fontFamily={ANTON} fontSize={64} fill="#ffcf3a" opacity={potencia > 0.85 ? 1 : 0}>
            ?
          </text>
        </g>
      ) : null}
      {/* manual del propietario que se abre */}
      {manual > 0 ? (
        <g transform={`translate(540 600) scale(${0.5 + 0.5 * manual}) rotate(${-6 * (1 - manual)})`} opacity={limitar01(manual * 2)}>
          <rect x={-300} y={-210} width={600} height={400} rx={18} fill="#000" opacity={0.4} filter="url(#blur-bomba)" />
          <rect x={-290} y={-200} width={290} height={390} rx={12} fill="#f6f3ea" />
          <rect x={0} y={-200} width={290} height={390} rx={12} fill="#fbf9f3" />
          <line x1={0} y1={-196} x2={0} y2={186} stroke="#d8d2c0" strokeWidth={6} />
          <text x={-145} y={-120} textAnchor="middle" fontFamily={ANTON} fontSize={38} fill={ROJO_DA}>
            MANUAL
          </text>
          <text x={-145} y={-80} textAnchor="middle" fontFamily={POPPINS} fontWeight={PESO_POPPINS} fontSize={22} fill="#555">
            del propietario
          </text>
          <text x={-145} y={30} textAnchor="middle" fontSize={110}>
            📖
          </text>
          {[-150, -110, -70].map((y) => (
            <rect key={y} x={30} y={y} width={220} height={10} rx={5} fill="#d9d3c3" />
          ))}
          <rect x={22} y={-30} width={246} height={90} rx={10} fill="#ffe680" opacity={limitar01((manual - 0.5) * 3)} />
          <text x={145} y={2} textAnchor="middle" fontFamily={POPPINS} fontWeight={PESO_POPPINS} fontSize={22} fill="#333">
            Gasolina:
          </text>
          <text x={145} y={44} textAnchor="middle" fontFamily={ANTON} fontSize={34} fill="#111">
            87 octanos mín.
          </text>
          {[100, 140].map((y) => (
            <rect key={y} x={30} y={y} width={220} height={10} rx={5} fill="#d9d3c3" />
          ))}
        </g>
      ) : null}
      </g>
    </svg>
  );
};

// Ventila del aire acondicionado (centro 540,500; 520×220): aire caliente, lata de gas
// y después la tubería con la fuga (gotas verdes con tinte UV) que se repara.
export const VENTILA = { cx: 540, cy: 500, w: 520, h: 220 };
export const AireAC: React.FC<{ t: number; caliente: number; lata: number; fuga: number; reparado: number }> = ({ t, caliente, lata, fuga, reparado }) => {
  const v = VENTILA;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <filter id="blur-ac" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <linearGradient id="lata-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2f7fd8" />
          <stop offset="0.5" stopColor="#7fbfff" />
          <stop offset="1" stopColor="#1b4f8f" />
        </linearGradient>
      </defs>
      <g opacity={1 - fuga}>
        {/* tablero */}
        <rect x={60} y={330} width={960} height={520} rx={60} fill="#17181c" />
        <rect x={v.cx - v.w / 2} y={v.cy - v.h / 2} width={v.w} height={v.h} rx={30} fill="#0b0c0f" stroke="#3a3d45" strokeWidth={8} />
        {Array.from({ length: 6 }, (_, k) => (
          <rect key={k} x={v.cx - v.w / 2 + 24} y={v.cy - v.h / 2 + 22 + k * 31} width={v.w - 48} height={12} rx={6} fill="#2b2e35" transform={`rotate(${Math.sin(t * 2) * 2} ${v.cx} ${v.cy})`} />
        ))}
        {/* aire caliente que sale */}
        {Array.from({ length: 6 }, (_, k) => {
          const p = (t * 0.9 + k / 6) % 1;
          return (
            <path key={k} d={`M${v.cx - 200 + k * 80} ${v.cy - v.h / 2 - 10 - p * 160} q20 -20 0 -40 q-20 -20 0 -40`} stroke={caliente > 0.5 ? "#ff6b4a" : "#7fd3ff"} strokeWidth={8} fill="none" strokeLinecap="round" opacity={(1 - p) * 0.8} />
          );
        })}
        {/* temperatura */}
        <rect x={v.cx - 120} y={v.cy + v.h / 2 + 30} width={240} height={90} rx={20} fill="#0b0c0f" stroke="#3a3d45" strokeWidth={4} />
        <text x={v.cx} y={v.cy + v.h / 2 + 95} textAnchor="middle" fontFamily={ANTON} fontSize={60} fill={caliente > 0.5 ? "#ff6b4a" : "#7fd3ff"}>
          {caliente > 0.5 ? "🌡️ 32°C" : "❄️ 18°C"}
        </text>
        {/* lata de gas refrigerante */}
        {lata > 0 ? (
          <g transform={`translate(${880 - 140 * lata} 640) rotate(${12 - 12 * lata})`} opacity={limitar01(lata * 2)}>
            <rect x={-60} y={-130} width={120} height={230} rx={24} fill="url(#lata-g)" />
            <rect x={-24} y={-160} width={48} height={34} rx={8} fill="#333" />
            <rect x={-60} y={-60} width={120} height={70} fill="#fff" opacity={0.9} />
            <text y={-14} textAnchor="middle" fontFamily={ANTON} fontSize={32} fill="#1b4f8f">
              GAS
            </text>
            <path d="M0 -160 C 0 -230, -160 -200, -200 -140" stroke="#222" strokeWidth={10} fill="none" />
          </g>
        ) : null}
      </g>
      {/* tubería con la fuga */}
      {fuga > 0 ? (
        <g opacity={fuga}>
          <rect x={60} y={460} width={960} height={70} rx={35} fill="#8d939d" />
          <rect x={60} y={470} width={960} height={16} rx={8} fill="#fff" opacity={0.35} />
          {/* grieta y tinte UV */}
          <circle cx={560} cy={530} r={70} fill="#39ff8a" opacity={0.35 * (1 - reparado)} filter="url(#blur-ac)" />
          <path d="M540 470 l14 18 l-10 14 l18 26" stroke="#1b1d22" strokeWidth={6} fill="none" opacity={1 - reparado} />
          {Array.from({ length: 4 }, (_, k) => {
            const p = (t * 1.3 + k / 4) % 1;
            return <ellipse key={k} cx={556} cy={540 + p * 260} rx={10} ry={14} fill="#39ff8a" opacity={(1 - p) * (1 - reparado)} />;
          })}
          {/* abrazadera de reparación */}
          <g opacity={reparado} transform={`translate(${560} ${495}) scale(${0.6 + 0.4 * reparado})`}>
            <rect x={-60} y={-50} width={120} height={100} rx={14} fill={ROJO_DA} />
            <path d="M-60 -20 H60 M-60 20 H60" stroke="#7f1d1d" strokeWidth={6} />
          </g>
          {/* lupa "FUGA" */}
          <g transform="translate(790 330)" opacity={1 - reparado}>
            <circle r={90} fill="#0d0d10" stroke="#fff" strokeWidth={8} />
            <text y={18} textAnchor="middle" fontFamily={ANTON} fontSize={52} fill="#39ff8a">
              FUGA
            </text>
            <line x1={-64} y1={64} x2={-170} y2={150} stroke="#fff" strokeWidth={14} strokeLinecap="round" />
          </g>
          {reparado > 0 ? (
            <g transform={`translate(790 330) scale(${reparado})`}>
              <circle r={64} fill="#3ddc84" />
              <path d="M-28 2 L-8 22 L30 -20" stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ) : null}
        </g>
      ) : null}
    </svg>
  );
};

// Termómetro de llanta (derecha) y calor que sale de la llanta.
export const Termometro: React.FC<{ t: number; calor: number }> = ({ t, calor }) => {
  const nivel = 0.25 + 0.65 * calor;
  const color = calor > 0.5 ? "#ff4d3a" : "#4db8ff";
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <radialGradient id="calor-llanta" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.6" stopColor="#ff5a1f" stopOpacity={0} />
          <stop offset="0.92" stopColor="#ff5a1f" stopOpacity={0.6} />
          <stop offset="1" stopColor="#ff5a1f" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="frio-llanta" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.7" stopColor="#4db8ff" stopOpacity={0} />
          <stop offset="0.95" stopColor="#4db8ff" stopOpacity={0.35} />
          <stop offset="1" stopColor="#4db8ff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={540} cy={560} r={300} fill="url(#calor-llanta)" opacity={calor} />
      <circle cx={540} cy={560} r={290} fill="url(#frio-llanta)" opacity={1 - calor} />
      {calor > 0.05
        ? Array.from({ length: 5 }, (_, k) => {
            const p = (t * 0.8 + k / 5) % 1;
            return <path key={k} d={`M${400 + k * 70} ${300 - p * 140} q16 -18 0 -36 q-16 -18 0 -36`} stroke="#ff7a4a" strokeWidth={6} fill="none" strokeLinecap="round" opacity={(1 - p) * calor} />;
          })
        : null}
      <g transform="translate(930 560)">
        <rect x={-26} y={-200} width={52} height={330} rx={26} fill="#f2f2f2" stroke="#2a2d34" strokeWidth={6} />
        <circle cy={160} r={48} fill={color} stroke="#2a2d34" strokeWidth={6} />
        <rect x={-12} y={130 - 300 * nivel} width={24} height={300 * nivel + 10} rx={12} fill={color} />
        {[0, 1, 2, 3, 4].map((k) => (
          <line key={k} x1={-26} y1={-160 + k * 60} x2={-8} y2={-160 + k * 60} stroke="#2a2d34" strokeWidth={4} />
        ))}
        <text y={-220} textAnchor="middle" fontFamily={ANTON} fontSize={34} fill={color}>
          {calor > 0.5 ? "CALIENTE" : "FRÍA"}
        </text>
      </g>
    </svg>
  );
};

// Destellos de fondo para la escena de la moneda.
const DESTELLOS = Array.from({ length: 24 }, (_, k) => ({ a: random(`da${k}`) * Math.PI * 2, d: 260 + random(`dd${k}`) * 300, f: random(`df${k}`) }));
export const Destellos: React.FC<{ t: number; color: string }> = ({ t, color }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    {DESTELLOS.map((s, k) => {
      const p = (t * 0.4 + s.f) % 1;
      return <circle key={k} cx={540 + Math.cos(s.a + t * 0.2) * s.d} cy={560 + Math.sin(s.a + t * 0.2) * s.d * 0.8} r={3 + 5 * Math.sin(Math.PI * p)} fill={color} opacity={0.7 * Math.sin(Math.PI * p)} />;
    })}
  </svg>
);
