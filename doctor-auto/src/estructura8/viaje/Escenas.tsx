// Escenas del video «Antes de salir de viaje: 5 revisiones».
// Carretera (mundo con parallax: atardecer, noche con lluvia y amanecer) y los
// primeros planos de cada pieza. Todo en coordenadas de escena 1080×1920.
import { random } from "remotion";
import { ANTON, POPPINS, PESO_POPPINS, ROJO_DA } from "../../doctor-auto/constantes";

const W = 1080;
const H = 1920;
const limitar01 = (x: number) => Math.max(0, Math.min(1, x));

// ---------- Colores ----------
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mezcla = (a: string, b: string, p: number) => {
  const x = hex(a);
  const y = hex(b);
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * limitar01(p))).join(",")})`;
};
// Color según la hora: atardecer → noche (n) y → amanecer (m).
const hora = (atardecer: string, noche: string, amanecer: string, n: number, m: number) => {
  const base = mezcla(atardecer, noche, n);
  return m > 0 ? mezcla(rgbHex(base), amanecer, m) : base;
};
const rgbHex = (rgb: string) => "#" + rgb.replace(/[^\d,]/g, "").split(",").map((v) => Number(v).toString(16).padStart(2, "0")).join("");

// ---------- Auto ----------
// Auto en coordenadas locales (0–880 × 0–380); ruedas en (210, 300) y (680, 300), radio 78.
export const AUTO = { x: 110, y: 482 };
export const RUEDA_R = 78;
export const PUNTOS = {
  ruedaDelantera: { x: AUTO.x + 680, y: AUTO.y + 300 },
  ruedaTrasera: { x: AUTO.x + 210, y: AUTO.y + 300 },
  faro: { x: AUTO.x + 830, y: AUTO.y + 210 },
  calavera: { x: AUTO.x + 44, y: AUTO.y + 210 },
  ventana: { x: AUTO.x + 560, y: AUTO.y + 128 },
  cofre: { x: AUTO.x + 770, y: AUTO.y + 172 },
};

const Rueda: React.FC<{ cx: number; cy: number; giro: number }> = ({ cx, cy, giro }) => (
  <g transform={`translate(${cx} ${cy})`}>
    <circle r={RUEDA_R} fill="#121214" />
    <circle r={70} fill="none" stroke="#25252a" strokeWidth={6} />
    <circle r={50} fill="url(#rin)" />
    <g transform={`rotate(${giro})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d="M-7 -12 L-11 -46 L11 -46 L7 -12 Z" fill="#2a2c31" transform={`rotate(${a})`} />
      ))}
    </g>
    <circle r={12} fill="#cfd3da" stroke="#555" strokeWidth={2} />
    <path d="M-60 -40 A72 72 0 0 1 20 -70" stroke="#fff" strokeOpacity={0.12} strokeWidth={5} fill="none" />
  </g>
);

export const AutoViaje: React.FC<{
  t: number;
  giro: number;
  faros: number;
  altas: number;
  frenos: number;
  intermitente: number; // 0/1 encendido en este fotograma
  humo: number;
  rebote: number;
}> = ({ t, giro, faros, altas, frenos, intermitente, humo, rebote }) => {
  const puffs = Array.from({ length: 9 }, (_, k) => {
    const p = (t * 0.55 + k / 9) % 1;
    return { x: 790 + Math.sin(k * 2.1 + t) * 30 - p * 120, y: 170 - p * 330, r: 24 + p * 90, o: (1 - p) * 0.5 * humo };
  });
  return (
    <g transform={`translate(${AUTO.x} ${AUTO.y + rebote})`}>
      <defs>
        <linearGradient id="carroceria" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0545a" />
          <stop offset="0.45" stopColor="#c21c24" />
          <stop offset="1" stopColor="#5e0b10" />
        </linearGradient>
        <linearGradient id="vidrio" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b4a63" />
          <stop offset="0.5" stopColor="#151b28" />
          <stop offset="1" stopColor="#0b0e15" />
        </linearGradient>
        <radialGradient id="rin" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#f2f4f7" />
          <stop offset="0.6" stopColor="#9aa1ab" />
          <stop offset="1" stopColor="#4d535c" />
        </radialGradient>
        <radialGradient id="cono-faro" cx="0" cy="0.5" r="1">
          <stop offset="0" stopColor="#fff6d6" stopOpacity={0.75} />
          <stop offset="1" stopColor="#fff6d6" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="brillo-rojo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff3b3b" stopOpacity={0.9} />
          <stop offset="1" stopColor="#ff3b3b" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="brillo-ambar" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffb020" stopOpacity={0.95} />
          <stop offset="1" stopColor="#ffb020" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* sombra */}
      <ellipse cx={450} cy={382} rx={440} ry={18} fill="#000" opacity={0.45} />
      {/* cono de luz de los faros (las altas lo alargan) */}
      <path d={`M840 205 L${1240 + 500 * altas} ${110 - 80 * altas} L${1240 + 500 * altas} ${330 + 60 * altas} Z`} fill="url(#cono-faro)" opacity={faros * (0.55 + 0.45 * altas)} />
      {/* parrilla de techo con maletas y un regalo */}
      <path d="M292 72 V58 M552 72 V58 M282 58 H566" stroke="#1d1d22" strokeWidth={7} strokeLinecap="round" />
      <rect x={300} y={10} width={112} height={48} rx={9} fill="#7a5233" />
      <rect x={300} y={10} width={112} height={48} rx={9} fill="none" stroke="#3f2a1a" strokeWidth={3} />
      <path d="M330 10 V58 M382 10 V58" stroke="#3f2a1a" strokeWidth={5} />
      <rect x={420} y={0} width={92} height={58} rx={9} fill="#3a4350" />
      <rect x={452} y={-8} width={28} height={10} rx={4} fill="#22272f" />
      <rect x={518} y={18} width={44} height={40} rx={4} fill={ROJO_DA} />
      <path d="M540 18 V58 M518 38 H562" stroke="#f5c542" strokeWidth={5} />
      <path d="M540 18 q-14 -16 -20 -2 q8 6 20 2 q14 -16 20 -2 q-8 6 -20 2" fill="none" stroke="#f5c542" strokeWidth={4} />
      {/* carrocería */}
      <path d="M28 300 L28 222 Q30 186 66 176 L128 164 L246 84 Q262 72 286 72 L556 72 Q584 72 602 86 L708 162 L808 180 Q852 188 860 222 L866 282 Q866 304 842 304 Z" fill="url(#carroceria)" />
      <rect x={28} y={272} width={838} height={32} rx={8} fill="#1b1b1f" />
      {/* reflejo largo sobre el hombro */}
      <path d="M70 186 L806 194" stroke="#fff" strokeOpacity={0.28} strokeWidth={4} strokeLinecap="round" />
      <path d="M262 84 L560 84" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} />
      {/* ventanas */}
      <path d="M150 166 L258 92 L404 92 L404 166 Z" fill="url(#vidrio)" stroke="#16161a" strokeWidth={6} />
      <path d="M420 166 L420 92 L566 92 Q578 92 590 100 L676 166 Z" fill="url(#vidrio)" stroke="#16161a" strokeWidth={6} />
      <path d="M200 160 L280 100 L300 100 L222 160 Z M460 160 L470 100 L486 100 L478 160 Z" fill="#fff" opacity={0.1} />
      {/* puertas, manijas y espejo */}
      <path d="M412 172 V266 M246 170 L240 262" stroke="#000" strokeOpacity={0.35} strokeWidth={3} />
      <rect x={322} y={184} width={34} height={8} rx={4} fill="#000" opacity={0.4} />
      <rect x={512} y={184} width={34} height={8} rx={4} fill="#000" opacity={0.4} />
      <path d="M636 150 l28 -4 l4 20 l-26 2 Z" fill="#a8161d" stroke="#16161a" strokeWidth={3} />
      {/* faro, calavera y direccionales */}
      <path d="M800 192 L852 200 Q858 214 852 226 L806 222 Z" fill={faros > 0.05 ? "#fffbe8" : "#d9d4c4"} />
      {faros > 0.05 ? <circle cx={834} cy={210} r={40 + 30 * altas} fill="#fff6d6" opacity={0.35 * faros + 0.3 * altas} /> : null}
      <path d="M30 196 L58 192 L60 226 L30 230 Z" fill={frenos > 0.05 ? "#ff2a2a" : faros > 0.05 ? "#b51616" : "#6e1212"} />
      {frenos > 0.05 || faros > 0.05 ? <circle cx={44} cy={212} r={50 * Math.max(frenos, faros * 0.4)} fill="url(#brillo-rojo)" opacity={Math.max(frenos, faros * 0.45)} /> : null}
      <rect x={836} y={232} width={22} height={10} rx={3} fill={intermitente ? "#ffb020" : "#7a5410"} />
      <rect x={30} y={236} width={20} height={10} rx={3} fill={intermitente ? "#ffb020" : "#7a5410"} />
      {intermitente ? (
        <>
          <circle cx={846} cy={237} r={42} fill="url(#brillo-ambar)" />
          <circle cx={40} cy={241} r={42} fill="url(#brillo-ambar)" />
        </>
      ) : null}
      {/* pasos de rueda y ruedas */}
      <circle cx={210} cy={300} r={92} fill="#0b0b0d" />
      <circle cx={680} cy={300} r={92} fill="#0b0b0d" />
      <path d="M118 300 A92 92 0 0 1 302 300 M588 300 A92 92 0 0 1 772 300" fill="none" stroke="#7d1015" strokeWidth={6} />
      <Rueda cx={210} cy={300} giro={giro} />
      <Rueda cx={680} cy={300} giro={giro} />
      {/* humo del cofre */}
      {puffs.map((p, k) => (
        <circle key={k} cx={p.x} cy={p.y} r={p.r} fill="#d9d9de" opacity={p.o} />
      ))}
    </g>
  );
};

// ---------- Carretera ----------
const montanas = (semilla: string, base: number, alto: number) => {
  const pts = Array.from({ length: 25 }, (_, k) => [k * 60, base - alto * (0.35 + 0.65 * random(`${semilla}${k % 24}`))]);
  return `M0 ${base + 400} ` + pts.map(([x, y]) => `L${x} ${y}`).join(" ") + ` L1440 ${base + 400} Z`;
};
const MONTE_LEJOS = montanas("ml", 700, 230);
const MONTE_MEDIO = montanas("mm", 720, 150);
const ESTRELLAS = Array.from({ length: 80 }, (_, k) => ({ x: random(`sx${k}`) * W, y: random(`sy${k}`) * 600, r: 0.8 + random(`sr${k}`) * 2, f: random(`sf${k}`) * 6 }));
const GOTAS = Array.from({ length: 140 }, (_, k) => ({ x: random(`gx${k}`) * 1300, y: random(`gy${k}`) * H, v: 1500 + random(`gv${k}`) * 900, l: 30 + random(`gl${k}`) * 40 }));
const COLORES_FOCOS = ["#ff4d4d", "#4dff88", "#ffd84d", "#4dc3ff", "#ff7ae0"];

const desplazar = (t: number, vel: number, largo: number) => -(((t * vel) % largo) + largo) % largo;

export const Carretera: React.FC<{
  t: number;
  recorrido: number; // distancia acumulada (px) del mundo
  noche: number;
  amanecer: number;
  humo: number;
  intermitente: number;
  faros: number;
  altas: number;
  frenos: number;
  lluvia: number;
  relampago: number;
  avanceAuto: number;
  letrero: number | null; // x del letrero navideño, o null
  rebote: number;
}> = ({ t, recorrido, noche, amanecer, humo, intermitente, faros, altas, frenos, lluvia, relampago, avanceAuto, letrero, rebote }) => {
  const r = recorrido;
  const cieloArriba = hora("#22103a", "#03040b", "#253064", noche, amanecer);
  const cieloMedio = hora("#80304a", "#0b1230", "#c2607c", noche, amanecer);
  const horizonte = hora("#f39042", "#1d2348", "#ffc27a", noche, amanecer);
  const monteLejos = hora("#5e2a48", "#121731", "#7a4766", noche, amanecer);
  const monteMedio = hora("#3a1832", "#0b0f22", "#4f2a48", noche, amanecer);
  const campo = hora("#2b1620", "#080a14", "#3a2430", noche, amanecer);
  const asfalto = hora("#2b2a31", "#121318", "#34323a", noche, amanecer);
  const sol = noche < 0.9;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="cielo-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={cieloArriba} />
          <stop offset="0.55" stopColor={cieloMedio} />
          <stop offset="1" stopColor={horizonte} />
        </linearGradient>
        <radialGradient id="sol-v" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff1c4" />
          <stop offset="0.35" stopColor="#ffc46b" stopOpacity={0.9} />
          <stop offset="1" stopColor="#ff8a3c" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="lectura-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={0} />
          <stop offset="0.3" stopColor="#000" stopOpacity={0.45} />
          <stop offset="1" stopColor="#000" stopOpacity={0.6} />
        </linearGradient>
        <filter id="desenfoque-v" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="desenfoque-fuerte" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      <rect width={W} height={820} fill="url(#cielo-v)" />
      {/* estrellas y luna (de noche) */}
      <g opacity={noche}>
        {ESTRELLAS.map((e, k) => (
          <circle key={k} cx={e.x} cy={e.y} r={e.r} fill="#fff" opacity={0.3 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2 + e.f))} />
        ))}
        <circle cx={820} cy={250} r={110} fill="#f3e3c3" opacity={0.1} filter="url(#desenfoque-fuerte)" />
        <circle cx={820} cy={250} r={45} fill="#f3e3c3" />
        <circle cx={806} cy={240} r={8} fill="#d8c7a6" />
        <circle cx={832} cy={262} r={5} fill="#d8c7a6" />
      </g>
      {/* sol que se oculta (o sale, al amanecer) */}
      {sol ? <circle cx={amanecer > 0 ? 760 : 300} cy={amanecer > 0 ? 700 - 120 * amanecer : 640} r={260} fill="url(#sol-v)" opacity={1 - noche} /> : null}
      {/* montañas con parallax */}
      <g transform={`translate(${desplazar(0, 1, 1440) + -((r * 0.05) % 1440)} 0)`}>
        {[0, 1440].map((o) => (
          <path key={o} d={MONTE_LEJOS} transform={`translate(${o} 0)`} fill={monteLejos} />
        ))}
      </g>
      <g transform={`translate(${-((r * 0.12) % 1440)} 0)`}>
        {[0, 1440].map((o) => (
          <path key={o} d={MONTE_MEDIO} transform={`translate(${o} 0)`} fill={monteMedio} />
        ))}
      </g>
      {/* campo */}
      <rect y={760} width={W} height={60} fill={campo} />
      {/* letrero navideño con foquitos */}
      {letrero !== null ? (
        <g transform={`translate(${letrero} 0)`}>
          <rect x={-6} y={640} width={12} height={170} fill="#3b3f46" />
          <rect x={250} y={640} width={12} height={170} fill="#3b3f46" />
          <rect x={-40} y={520} width={340} height={140} rx={14} fill="#0f6b3a" stroke="#fff" strokeWidth={6} />
          <text x={130} y={585} textAnchor="middle" fontFamily={POPPINS} fontWeight={PESO_POPPINS} fontSize={40} fill="#fff">
            Guadalajara
          </text>
          <text x={130} y={636} textAnchor="middle" fontFamily={ANTON} fontSize={44} fill="#fff">
            120 km
          </text>
          {Array.from({ length: 22 }, (_, k) => {
            const per = k < 8 ? [-40 + k * 48.5, 516] : k < 11 ? [304, 516 + (k - 7) * 37] : k < 19 ? [304 - (k - 11) * 48.5, 664] : [-44, 664 - (k - 18) * 37];
            const on = Math.floor(t * 3 + k) % 2 === 0;
            const c = COLORES_FOCOS[k % COLORES_FOCOS.length];
            return (
              <g key={k}>
                <circle cx={per[0]} cy={per[1]} r={on ? 16 : 0} fill={c} opacity={0.35} filter="url(#desenfoque-v)" />
                <circle cx={per[0]} cy={per[1]} r={6} fill={on ? c : "#333"} />
              </g>
            );
          })}
        </g>
      ) : null}
      {/* carretera */}
      <rect y={800} width={W} height={220} fill={asfalto} />
      <rect y={800} width={W} height={6} fill="#4a4950" />
      {Array.from({ length: 7 }, (_, k) => (
        <rect key={k} x={((k * 240 - r) % 1680 + 1680) % 1680 - 240} y={902} width={130} height={10} rx={5} fill="#f2efe6" opacity={0.75} />
      ))}
      {/* reflejo del sol / luces en el asfalto */}
      <ellipse cx={amanecer > 0 ? 760 : 300} cy={930} rx={300} ry={40} fill="#ffb46b" opacity={0.18 * (1 - noche)} filter="url(#desenfoque-fuerte)" />
      <ellipse cx={AUTO.x + 450 + avanceAuto} cy={900} rx={420} ry={30} fill={ROJO_DA} opacity={0.18 + 0.15 * noche} filter="url(#desenfoque-v)" />
      {faros > 0 ? <ellipse cx={AUTO.x + 1100 + avanceAuto} cy={900} rx={320 + 160 * altas} ry={40} fill="#fff3c4" opacity={(0.18 + 0.15 * altas) * faros} filter="url(#desenfoque-fuerte)" /> : null}
      {/* auto */}
      <g transform={`translate(${avanceAuto} 0)`}>
        <AutoViaje t={t} giro={r * 0.9} faros={faros} altas={altas} frenos={frenos} intermitente={intermitente} humo={humo} rebote={rebote + (r > 0 ? Math.sin(t * 38) * 1.2 : 0)} />
      </g>
      {/* guardavía en primer plano (más rápido) */}
      <rect y={1020} width={W} height={50} fill={hora("#1c1114", "#07080c", "#24161c", noche, amanecer)} />
      <rect y={1030} width={W} height={20} fill="#8a8f98" opacity={0.85 - 0.4 * noche} />
      {Array.from({ length: 6 }, (_, k) => (
        <rect key={k} x={((k * 260 - r * 1.25) % 1560 + 1560) % 1560 - 260} y={1030} width={16} height={70} fill="#5d6169" opacity={0.9 - 0.4 * noche} />
      ))}
      {/* tierra con magueyes que pasan rápido y desenfocados */}
      <rect y={1070} width={W} height={H - 1070} fill={hora("#1a0f10", "#05060a", "#21151a", noche, amanecer)} />
      <g filter="url(#desenfoque-v)">
        {Array.from({ length: 5 }, (_, k) => {
          const x = ((k * 330 - r * 1.6) % 1650 + 1650) % 1650 - 300;
          return (
            <g key={k} transform={`translate(${x} ${1180 + (k % 2) * 60})`} fill={hora("#2e1a1a", "#0b0d12", "#3a2424", noche, amanecer)}>
              {[-60, -35, -12, 12, 35, 60].map((a) => (
                <path key={a} d="M0 0 Q-14 -70 0 -150 Q14 -70 0 0" transform={`rotate(${a})`} />
              ))}
            </g>
          );
        })}
      </g>
      {/* lluvia */}
      {lluvia > 0 ? (
        <g opacity={lluvia} stroke="#b9c8ff" strokeWidth={2.4} strokeLinecap="round">
          {GOTAS.map((g, k) => {
            const y = (g.y + t * g.v) % (H + 100) - 100;
            const x = (g.x - t * g.v * 0.18) % 1300;
            return <line key={k} x1={x} y1={y} x2={x - g.l * 0.18} y2={y + g.l} opacity={0.35} />;
          })}
          {Array.from({ length: 10 }, (_, k) => {
            const p = (t * 2 + k / 10) % 1;
            const x = (random(`sp${k}${Math.floor(t * 2 + k / 10)}`) * W);
            return <ellipse key={k} cx={x} cy={830 + (k % 4) * 45} rx={8 + 26 * p} ry={2 + 5 * p} fill="none" strokeOpacity={0.5 * (1 - p)} />;
          })}
        </g>
      ) : null}
      {/* oscurecido suave detrás de subtítulos y mascota */}
      <rect y={1000} width={W} height={H - 1000} fill="url(#lectura-v)" />
      {relampago > 0 ? <rect width={W} height={H} fill="#e8eeff" opacity={relampago * 0.7} /> : null}
    </svg>
  );
};

// ---------- Primeros planos ----------
// Llanta de frente (centro 540,560; radio 250): dibujo, rin, manómetro y lupa.
export const Llanta: React.FC<{ t: number; giro: number; profundidad: number; presion: number; aguja: number; lupa: number }> = ({ t, giro, profundidad, presion, aguja, lupa }) => {
  const cx = 540;
  const cy = 560;
  const bloques = 40;
  const valvula = ((giro + 200) * Math.PI) / 180;
  const vx = cx + Math.cos(valvula) * 168;
  const vy = cy + Math.sin(valvula) * 168;
  const mmTexto = profundidad > 0.5 ? `${(3 * profundidad).toFixed(0)} mm ✓` : profundidad > 0.15 ? `${(3 * profundidad).toFixed(1)} mm` : "0 mm ✗";
  const colorMm = profundidad > 0.5 ? "#3ddc84" : profundidad > 0.15 ? "#ffb020" : "#ff4d4d";
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <radialGradient id="costado" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#38383d" />
          <stop offset="1" stopColor="#141416" />
        </radialGradient>
        <radialGradient id="rin-ll" cx="0.38" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#a9b0ba" />
          <stop offset="1" stopColor="#3f444c" />
        </radialGradient>
        <path id="arco-texto" d={`M${cx - 205} ${cy} A205 205 0 0 1 ${cx + 205} ${cy}`} />
      </defs>
      <ellipse cx={cx} cy={cy + 290} rx={300} ry={36} fill="#000" opacity={0.55} />
      <circle cx={cx} cy={cy} r={252} fill="#101012" />
      <g transform={`rotate(${giro} ${cx} ${cy})`}>
        {Array.from({ length: bloques }, (_, k) => (
          <rect key={k} x={cx - 9} y={cy - 252} width={18} height={4 + 22 * profundidad} rx={3} fill="#2a2a2f" transform={`rotate(${(k * 360) / bloques} ${cx} ${cy})`} />
        ))}
        <circle cx={cx} cy={cy} r={226} fill="url(#costado)" />
        <text fontFamily={POPPINS} fontWeight={PESO_POPPINS} fontSize={26} fill="#6d6d74" letterSpacing={6}>
          <textPath href="#arco-texto" startOffset="50%" textAnchor="middle">
            235/65 R17 · 104H
          </textPath>
        </text>
        <circle cx={cx} cy={cy} r={168} fill="url(#rin-ll)" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path key={a} d={`M${cx - 16} ${cy - 40} L${cx - 30} ${cy - 150} Q${cx} ${cy - 162} ${cx + 30} ${cy - 150} L${cx + 16} ${cy - 40} Z`} fill="#26282d" transform={`rotate(${a} ${cx} ${cy})`} />
        ))}
        <circle cx={cx} cy={cy} r={40} fill="#d7dbe1" stroke="#555a62" strokeWidth={4} />
        <text x={cx} y={cy + 13} textAnchor="middle" fontFamily={ANTON} fontSize={34} fill={ROJO_DA}>
          DA
        </text>
      </g>
      {/* gastado: brillo liso en la banda cuando ya no hay dibujo */}
      <circle cx={cx} cy={cy} r={244} fill="none" stroke="#9aa0aa" strokeOpacity={0.35 * (1 - profundidad)} strokeWidth={10} />
      <path d={`M${cx - 200} ${cy - 150} A250 250 0 0 1 ${cx + 60} ${cy - 246}`} stroke="#fff" strokeOpacity={0.18} strokeWidth={8} fill="none" />
      {/* manómetro */}
      {presion > 0 ? (
        <g opacity={limitar01(presion * 1.5)} transform={`translate(${262} ${640}) scale(${0.6 + 0.4 * presion})`}>
          <path d={`M0 100 C 40 200, ${vx - 262 - 80} ${vy - 640 + 40}, ${vx - 262} ${vy - 640}`} stroke="#1c1c1f" strokeWidth={14} fill="none" strokeLinecap="round" />
          <circle r={112} fill="#16171a" stroke="#c9ced6" strokeWidth={8} />
          <path d="M-74 52 A90 90 0 1 1 74 52" fill="none" stroke="#3a3c42" strokeWidth={12} />
          {/* zona verde 30–36 psi */}
          <path d={describirArco(0, 0, 90, -40, 8)} fill="none" stroke="#3ddc84" strokeWidth={12} />
          {Array.from({ length: 11 }, (_, k) => {
            const a = ((-210 + k * 24) * Math.PI) / 180;
            return <line key={k} x1={Math.cos(a) * 70} y1={Math.sin(a) * 70} x2={Math.cos(a) * 82} y2={Math.sin(a) * 82} stroke="#fff" strokeWidth={4} />;
          })}
          <g transform={`rotate(${-210 + aguja * 186})`}>
            <path d="M-6 0 L0 -82 L6 0 Z" fill={ROJO_DA} transform="rotate(90)" />
          </g>
          <circle r={12} fill="#c9ced6" />
          <text y={58} textAnchor="middle" fontFamily={ANTON} fontSize={38} fill="#fff">
            {Math.round(aguja * 35)} PSI
          </text>
        </g>
      ) : null}
      {/* lupa sobre el dibujo */}
      {lupa > 0 ? (
        <g opacity={limitar01(lupa * 1.5)}>
          <line x1={700} y1={430} x2={cx + 110} y2={cy - 228} stroke="#fff" strokeWidth={4} strokeDasharray="10 8" />
          <g transform={`translate(820 430) scale(${0.5 + 0.5 * lupa})`}>
            <circle r={128} fill="#0d0d10" stroke="#fff" strokeWidth={8} />
            <clipPath id="clip-lupa">
              <circle r={120} />
            </clipPath>
            <g clipPath="url(#clip-lupa)">
              <rect x={-130} y={10} width={260} height={130} fill="#1d1d21" />
              {[-100, -40, 20, 80].map((x) => (
                <rect key={x} x={x} y={10 - 70 * profundidad} width={44} height={70 * profundidad + 2} rx={6} fill="#2e2e34" />
              ))}
              <line x1={-120} y1={10 - 70} x2={120} y2={10 - 70} stroke="#3ddc84" strokeWidth={3} strokeDasharray="8 6" />
            </g>
            <rect x={-92} y={-112} width={184} height={50} rx={25} fill={colorMm} />
            <text y={-76} textAnchor="middle" fontFamily={ANTON} fontSize={36} fill="#101012">
              {mmTexto}
            </text>
          </g>
        </g>
      ) : null}
    </svg>
  );
};

// Arco SVG (grados, 0 = derecha, sentido horario).
export const describirArco = (cx: number, cy: number, r: number, desde: number, hasta: number) => {
  const a = (desde * Math.PI) / 180;
  const b = (hasta * Math.PI) / 180;
  const grande = Math.abs(hasta - desde) > 180 ? 1 : 0;
  const giro = hasta > desde ? 1 : 0;
  return `M${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r} A${r} ${r} 0 ${grande} ${giro} ${cx + Math.cos(b) * r} ${cy + Math.sin(b) * r}`;
};

// Disco de freno (centro 540,560; radio 215) con caliper rojo, chispas y vibración.
const AGUJEROS = Array.from({ length: 36 }, (_, k) => ({ a: (k % 12) * 30 + Math.floor(k / 12) * 10, r: 120 + Math.floor(k / 12) * 30 }));
const CHISPAS = Array.from({ length: 26 }, (_, k) => ({ a: -70 + random(`ca${k}`) * 50, v: 300 + random(`cv${k}`) * 500, f: random(`cf${k}`) }));
export const Freno: React.FC<{ t: number; giro: number; pinza: number; chispas: number; vibra: number; calor: number }> = ({ t, giro, pinza, chispas, vibra, calor }) => {
  const cx = 540;
  const cy = 560;
  const dx = Math.sin(t * 90) * 7 * vibra;
  const dy = Math.cos(t * 77) * 5 * vibra;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <radialGradient id="disco" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#f4f6f9" />
          <stop offset="0.55" stopColor="#a9afb8" />
          <stop offset="1" stopColor="#5b616a" />
        </radialGradient>
        <radialGradient id="calor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.55" stopColor="#ff6a00" stopOpacity={0} />
          <stop offset="0.85" stopColor="#ff6a00" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ff2a00" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy + 270} rx={260} ry={32} fill="#000" opacity={0.5} />
      <g transform={`translate(${dx} ${dy})`}>
        <g transform={`rotate(${giro} ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={215} fill="url(#disco)" />
          {Array.from({ length: 24 }, (_, k) => (
            <path key={k} d={`M${cx} ${cy - 205} Q${cx + 26} ${cy - 175} ${cx + 18} ${cy - 140}`} stroke="#6f757e" strokeWidth={3} fill="none" opacity={0.6} transform={`rotate(${k * 15} ${cx} ${cy})`} />
          ))}
          {AGUJEROS.map((h, k) => (
            <circle key={k} cx={cx + Math.cos((h.a * Math.PI) / 180) * h.r} cy={cy + Math.sin((h.a * Math.PI) / 180) * h.r} r={8} fill="#3d4148" />
          ))}
          <circle cx={cx} cy={cy} r={96} fill="#5a5f67" stroke="#2e3137" strokeWidth={6} />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={cx + Math.cos((a * Math.PI) / 180) * 56} cy={cy + Math.sin((a * Math.PI) / 180) * 56} r={12} fill="#24272c" />
          ))}
          <circle cx={cx} cy={cy} r={28} fill="#2a2d33" />
        </g>
        <circle cx={cx} cy={cy} r={215} fill="url(#calor)" opacity={calor} />
        <path d={describirArco(cx, cy, 214, -150, -60)} stroke="#fff" strokeOpacity={0.3} strokeWidth={6} fill="none" />
        {/* caliper: aprieta (pinza) acercándose al centro */}
        <g transform={`translate(${-14 * pinza} ${14 * pinza})`}>
          <path d={`${describirArco(cx, cy, 250, -70, -8)} L${cx + Math.cos((-8 * Math.PI) / 180) * 150} ${cy + Math.sin((-8 * Math.PI) / 180) * 150} ${describirArco(cx, cy, 150, -8, -70).replace(/^M[^A]+/, "")} Z`} fill={ROJO_DA} stroke="#5e0b10" strokeWidth={6} />
          <text x={cx + 150} y={cy - 120} fontFamily={ANTON} fontSize={44} fill="#fff" transform={`rotate(50 ${cx + 150} ${cy - 120})`}>
            DA
          </text>
        </g>
        {chispas > 0
          ? CHISPAS.map((c, k) => {
              const p = (t * 2.2 + c.f) % 1;
              const a = (c.a * Math.PI) / 180;
              const x0 = cx + Math.cos(a) * 210;
              const y0 = cy + Math.sin(a) * 210;
              const x = x0 + Math.cos(a + 0.9) * c.v * p;
              const y = y0 + Math.sin(a + 0.9) * c.v * p + 400 * p * p;
              return <line key={k} x1={x} y1={y} x2={x - Math.cos(a + 0.9) * 26} y2={y - Math.sin(a + 0.9) * 26} stroke="#ffd36b" strokeWidth={4} strokeLinecap="round" opacity={chispas * (1 - p)} />;
            })
          : null}
      </g>
    </svg>
  );
};

// Copo de nieve que crece desde un círculo (centro 540,560), escarcha en las orillas y nieve.
const NIEVE = Array.from({ length: 50 }, (_, k) => ({ x: random(`nx${k}`) * W, y: random(`ny${k}`) * H, v: 60 + random(`nv${k}`) * 120, r: 2 + random(`nr${k}`) * 5 }));
export const Frio: React.FC<{ t: number; crece: number; escarcha: number }> = ({ t, crece, escarcha }) => {
  const cx = 540;
  const cy = 560;
  const largo = 230 * crece;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="escarcha-v" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#dff4ff" stopOpacity={0} />
          <stop offset="1" stopColor="#dff4ff" stopOpacity={0.55} />
        </radialGradient>
        <filter id="brillo-hielo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {NIEVE.map((n, k) => (
        <circle key={k} cx={(n.x + Math.sin(t + k) * 20) % W} cy={(n.y + t * n.v) % H} r={n.r} fill="#fff" opacity={0.55} />
      ))}
      <g filter="url(#brillo-hielo)" stroke="#e9f8ff" strokeLinecap="round" fill="none" transform={`rotate(${t * 6} ${cx} ${cy})`}>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <g key={a} transform={`rotate(${a} ${cx} ${cy})`}>
            <line x1={cx} y1={cy} x2={cx} y2={cy - largo} strokeWidth={14} />
            {[0.45, 0.72].map((f) => (
              <g key={f}>
                <line x1={cx} y1={cy - largo * f} x2={cx - 60 * crece} y2={cy - largo * f - 60 * crece} strokeWidth={10} />
                <line x1={cx} y1={cy - largo * f} x2={cx + 60 * crece} y2={cy - largo * f - 60 * crece} strokeWidth={10} />
              </g>
            ))}
          </g>
        ))}
        <circle cx={cx} cy={cy} r={120 - 70 * crece} fill="#dff4ff" fillOpacity={1 - crece * 0.6} strokeWidth={8} />
      </g>
      <rect width={W} height={H} fill="url(#escarcha-v)" opacity={escarcha} />
      {Array.from({ length: 18 }, (_, k) => {
        const lado = k % 4;
        const p = random(`fp${k}`);
        const x0 = lado === 0 ? p * W : lado === 1 ? W : lado === 2 ? p * W : 0;
        const y0 = lado === 0 ? 280 : lado === 1 ? 280 + p * 1100 : lado === 2 ? 1380 : 280 + p * 1100;
        const a = Math.atan2(560 - y0, 540 - x0) + (random(`fa${k}`) - 0.5);
        const l = 160 * escarcha * (0.6 + random(`fl${k}`));
        return <line key={k} x1={x0} y1={y0} x2={x0 + Math.cos(a) * l} y2={y0 + Math.sin(a) * l} stroke="#f1fbff" strokeWidth={3} opacity={0.6} />;
      })}
    </svg>
  );
};

// Batería (cara frontal centrada en 540,590; 460×300) con escarcha, carga y llave.
export const Bateria: React.FC<{ t: number; escarcha: number; carga: number; llave: number; tache: number; vibra: number }> = ({ t, escarcha, carga, llave, tache, vibra }) => {
  const dx = Math.sin(t * 80) * 6 * vibra;
  const barras = 5;
  const llenas = Math.round(carga * barras);
  const colorCarga = carga > 0.6 ? "#3ddc84" : carga > 0.3 ? "#ffb020" : "#ff4d4d";
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="bat-frente" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#363941" />
          <stop offset="1" stopColor="#1a1b20" />
        </linearGradient>
      </defs>
      <ellipse cx={560} cy={790} rx={330} ry={34} fill="#000" opacity={0.5} />
      <g transform={`translate(${dx} 0)`}>
        <path d="M310 440 L360 380 L820 380 L770 440 Z" fill="#4a4e57" />
        <path d="M770 440 L820 380 L820 680 L770 740 Z" fill="#17181c" />
        <rect x={310} y={440} width={460} height={300} rx={18} fill="url(#bat-frente)" />
        {/* bornes */}
        <rect x={410} y={360} width={46} height={34} rx={6} fill="#c9ced6" />
        <rect x={404} y={350} width={58} height={16} rx={5} fill={ROJO_DA} />
        <rect x={680} y={360} width={46} height={34} rx={6} fill="#c9ced6" />
        <rect x={674} y={350} width={58} height={16} rx={5} fill="#111" />
        <text x={433} y={340} textAnchor="middle" fontFamily={ANTON} fontSize={40} fill="#fff">
          +
        </text>
        <text x={703} y={340} textAnchor="middle" fontFamily={ANTON} fontSize={40} fill="#fff">
          –
        </text>
        {/* etiqueta */}
        <rect x={310} y={480} width={460} height={86} fill={ROJO_DA} />
        <text x={540} y={540} textAnchor="middle" fontFamily={ANTON} fontSize={52} fill="#fff" letterSpacing={4}>
          12V · 60Ah
        </text>
        {/* carga */}
        {Array.from({ length: barras }, (_, k) => (
          <rect key={k} x={352 + k * 78} y={618} width={64} height={76} rx={10} fill={k < llenas ? colorCarga : "#2c2e34"} opacity={k < llenas ? 1 : 0.8} />
        ))}
        <path d="M330 452 H750" stroke="#fff" strokeOpacity={0.15} strokeWidth={4} />
        {/* escarcha */}
        <g opacity={escarcha}>
          <path d="M310 440 L360 380 L820 380 L770 440 Z" fill="#e6f7ff" opacity={0.7} />
          {Array.from({ length: 14 }, (_, k) => (
            <path key={k} d={`M${330 + k * 32} 442 l${8 - (k % 3) * 4} ${18 + (k % 4) * 10} l6 -${8 + (k % 3) * 6}`} stroke="#f2fbff" strokeWidth={4} fill="none" />
          ))}
          <rect x={310} y={440} width={460} height={300} rx={18} fill="#dff4ff" opacity={0.18} />
        </g>
      </g>
      {/* llave que gira */}
      {llave > 0 ? (
        <g transform={`translate(190 600) rotate(${-30 + 75 * Math.min(1, llave)})`} opacity={limitar01(llave * 3)}>
          <circle r={56} fill="#c9ced6" stroke="#6f757e" strokeWidth={6} />
          <circle r={16} fill="#2a2d33" />
          <rect x={40} y={-14} width={110} height={28} rx={6} fill="#c9ced6" />
          <path d="M120 14 v14 M136 14 v20" stroke="#c9ced6" strokeWidth={10} />
        </g>
      ) : null}
      {/* tache rojo: no arranca */}
      {tache > 0 ? (
        <g transform={`translate(540 590) scale(${0.4 + 0.6 * tache}) rotate(${-8 * (1 - tache)})`} opacity={limitar01(tache * 2)}>
          <circle r={190} fill="none" stroke="#ff3b3b" strokeWidth={26} />
          <path d="M-110 -110 L110 110 M110 -110 L-110 110" stroke="#ff3b3b" strokeWidth={30} strokeLinecap="round" />
        </g>
      ) : null}
    </svg>
  );
};

// Cofre visto desde arriba en "radiografía": batería, bayoneta de aceite y depósito de anticongelante.
export const COFRE = { bateria: { cx: 250, cy: 470, w: 150, h: 100 }, bayoneta: { x: 600, y: 470 }, tapa: { x: 800, y: 392, r: 22 }, deposito: { x: 740, y: 400, w: 120, h: 170 } };
export const Cofre: React.FC<{ t: number; sacar: number; aceite: number; anti: number; checkAceite: number; checkAnti: number }> = ({ t, sacar, aceite, anti, checkAceite, checkAnti }) => {
  const b = COFRE.bateria;
  const d = COFRE.deposito;
  const varilla = 260 * sacar;
  const nivelY = d.y + d.h - (d.h - 30) * (0.25 + 0.65 * anti);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="anti-liq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dffb5" />
          <stop offset="1" stopColor="#13a85a" />
        </linearGradient>
        <linearGradient id="aceite-liq" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffcf5a" />
          <stop offset="1" stopColor="#b8780f" />
        </linearGradient>
      </defs>
      {/* hueco del motor */}
      <rect x={110} y={320} width={860} height={520} rx={40} fill="#121317" stroke="#3a3d45" strokeWidth={6} />
      <rect x={180} y={336} width={720} height={44} rx={10} fill="#25272d" />
      {Array.from({ length: 30 }, (_, k) => (
        <line key={k} x1={196 + k * 23.5} y1={342} x2={196 + k * 23.5} y2={374} stroke="#3c3f47" strokeWidth={4} />
      ))}
      {/* motor */}
      <rect x={380} y={480} width={340} height={260} rx={30} fill="#3a3d45" stroke="#565a63" strokeWidth={6} />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={420 + k * 100} y={520} width={70} height={180} rx={14} fill="#2b2d33" />
      ))}
      <text x={550} y={730} textAnchor="middle" fontFamily={ANTON} fontSize={30} fill="#7d828c" letterSpacing={6}>
        DOCTOR AUTO
      </text>
      {/* batería pequeña */}
      <rect x={b.cx - b.w / 2} y={b.cy - b.h / 2} width={b.w} height={b.h} rx={10} fill="#2b2d33" stroke="#4a4e57" strokeWidth={4} />
      <rect x={b.cx - b.w / 2} y={b.cy - 14} width={b.w} height={26} fill={ROJO_DA} />
      <rect x={b.cx - 52} y={b.cy - b.h / 2 - 12} width={22} height={14} rx={3} fill={ROJO_DA} />
      <rect x={b.cx + 30} y={b.cy - b.h / 2 - 12} width={22} height={14} rx={3} fill="#111" />
      {/* bayoneta de aceite: sale hacia arriba y muestra el nivel */}
      <g>
        <line x1={COFRE.bayoneta.x} y1={COFRE.bayoneta.y} x2={COFRE.bayoneta.x} y2={COFRE.bayoneta.y - varilla} stroke="#c9ced6" strokeWidth={10} strokeLinecap="round" />
        {sacar > 0.6 ? (
          <g opacity={limitar01((sacar - 0.6) * 3)}>
            <line x1={COFRE.bayoneta.x} y1={COFRE.bayoneta.y - varilla + 20} x2={COFRE.bayoneta.x} y2={COFRE.bayoneta.y - varilla + 20 + 100 * aceite} stroke="url(#aceite-liq)" strokeWidth={14} strokeLinecap="round" />
            {[
              { y: 30, l: "MAX" },
              { y: 110, l: "MIN" },
            ].map((m) => (
              <g key={m.l}>
                <line x1={COFRE.bayoneta.x - 24} y1={COFRE.bayoneta.y - varilla + m.y} x2={COFRE.bayoneta.x + 24} y2={COFRE.bayoneta.y - varilla + m.y} stroke="#fff" strokeWidth={3} />
                <text x={COFRE.bayoneta.x - 34} y={COFRE.bayoneta.y - varilla + m.y + 8} textAnchor="end" fontFamily={POPPINS} fontWeight={PESO_POPPINS} fontSize={22} fill="#fff">
                  {m.l}
                </text>
              </g>
            ))}
          </g>
        ) : null}
        <circle cx={COFRE.bayoneta.x} cy={COFRE.bayoneta.y - varilla} r={22} fill="none" stroke="#ffcf3a" strokeWidth={10} />
      </g>
      {/* depósito de anticongelante */}
      <rect x={d.x} y={d.y} width={d.w} height={d.h} rx={22} fill="#e9f3f7" fillOpacity={0.18} stroke="#d8e6ec" strokeWidth={5} />
      <clipPath id="clip-deposito">
        <rect x={d.x + 4} y={d.y + 4} width={d.w - 8} height={d.h - 8} rx={18} />
      </clipPath>
      <g clipPath="url(#clip-deposito)">
        <path d={`M${d.x} ${nivelY + Math.sin(t * 6) * 4} Q${d.x + d.w / 2} ${nivelY - 8 + Math.sin(t * 6 + 1) * 4} ${d.x + d.w} ${nivelY + Math.sin(t * 6 + 2) * 4} V${d.y + d.h} H${d.x} Z`} fill="url(#anti-liq)" opacity={0.9} />
        {Array.from({ length: 6 }, (_, k) => {
          const p = (t * 0.8 + k / 6) % 1;
          return <circle key={k} cx={d.x + 20 + ((k * 37) % (d.w - 40))} cy={d.y + d.h - p * (d.y + d.h - nivelY)} r={5} fill="#fff" opacity={0.5 * (1 - p) * anti} />;
        })}
      </g>
      {[
        { y: d.y + 40, l: "MAX" },
        { y: d.y + d.h - 34, l: "MIN" },
      ].map((m) => (
        <g key={m.l}>
          <line x1={d.x + d.w - 30} y1={m.y} x2={d.x + d.w + 6} y2={m.y} stroke="#fff" strokeWidth={3} />
          <text x={d.x + d.w + 14} y={m.y + 8} fontFamily={POPPINS} fontWeight={PESO_POPPINS} fontSize={22} fill="#fff">
            {m.l}
          </text>
        </g>
      ))}
      <circle cx={COFRE.tapa.x} cy={COFRE.tapa.y} r={COFRE.tapa.r} fill="#f2c14e" stroke="#9c7520" strokeWidth={4} />
      {/* palomitas */}
      {[
        { x: COFRE.bayoneta.x + 70, y: COFRE.bayoneta.y - 200, v: checkAceite },
        { x: d.x - 40, y: d.y + 30, v: checkAnti },
      ].map((c, k) =>
        c.v > 0 ? (
          <g key={k} transform={`translate(${c.x} ${c.y}) scale(${c.v})`}>
            <circle r={30} fill="#3ddc84" />
            <path d="M-13 1 L-4 11 L14 -10" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ) : null,
      )}
    </svg>
  );
};

// Parabrisas de noche con lluvia: gotas y pluma que limpia (pivote 540,860; largo 470).
export const PIVOTE = { x: 540, y: 860, largo: 470 };
const GOTAS_VIDRIO = Array.from({ length: 130 }, (_, k) => ({ x: 80 + random(`vx${k}`) * 920, y: 330 + random(`vy${k}`) * 520, r: 5 + random(`vr${k}`) * 12, f: random(`vf${k}`) }));
export const anguloPluma = (t: number, t0: number) => {
  // Barridos de 0.9 s: de -78° a 78° y de regreso (0 = vertical).
  const l = Math.max(0, t - t0);
  const p = (l / 0.9) % 2;
  const ida = p < 1 ? p : 2 - p;
  return -78 + 156 * (0.5 - 0.5 * Math.cos(Math.PI * ida));
};
export const Parabrisas: React.FC<{ t: number; t0Pluma: number; activo: boolean }> = ({ t, t0Pluma, activo }) => {
  const ang = activo ? anguloPluma(t, t0Pluma) : -78;
  const rad = ((ang - 90) * Math.PI) / 180;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="noche-vidrio" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0f22" />
          <stop offset="1" stopColor="#1b1f33" />
        </linearGradient>
        <filter id="bokeh-vidrio" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <rect width={W} height={H} fill="url(#noche-vidrio)" />
      {/* luces de la carretera desenfocadas detrás del vidrio */}
      <g filter="url(#bokeh-vidrio)">
        {Array.from({ length: 14 }, (_, k) => (
          <circle key={k} cx={(k * 97 + t * 40) % 1180 - 50} cy={560 + (k % 3) * 40} r={26 + (k % 4) * 10} fill={k % 3 === 0 ? "#ff3b3b" : k % 3 === 1 ? "#ffd27a" : "#fff3c4"} opacity={0.45} />
        ))}
      </g>
      {/* gotas: desaparecen cuando pasa la pluma y vuelven poco a poco */}
      {GOTAS_VIDRIO.map((g, k) => {
        const a = (Math.atan2(g.x - PIVOTE.x, PIVOTE.y - g.y) * 180) / Math.PI;
        const dist = Math.hypot(g.x - PIVOTE.x, g.y - PIVOTE.y);
        let hace = 99;
        if (activo && dist < PIVOTE.largo && dist > 90) {
          for (let s = 0; s < 40; s++) {
            const t1 = t - s / 30;
            const t2 = t1 - 1 / 30;
            if (t2 < t0Pluma) break;
            const a1 = anguloPluma(t1, t0Pluma);
            const a2 = anguloPluma(t2, t0Pluma);
            if ((a1 - a) * (a2 - a) <= 0) {
              hace = s / 30;
              break;
            }
          }
        }
        const vuelve = Math.min(1, Math.max(0, (hace - 0.25 - g.f * 0.9) / 0.5));
        return (
          <g key={k} opacity={vuelve}>
            <circle cx={g.x} cy={g.y} r={g.r} fill="#cfe0ff" opacity={0.28} />
            <circle cx={g.x - g.r * 0.3} cy={g.y - g.r * 0.3} r={g.r * 0.35} fill="#fff" opacity={0.7} />
          </g>
        );
      })}
      {/* tablero oscuro abajo */}
      <path d={`M0 900 Q540 840 1080 900 V1920 H0 Z`} fill="#050608" />
      {/* pluma */}
      <g>
        <line x1={PIVOTE.x} y1={PIVOTE.y} x2={PIVOTE.x + Math.cos(rad) * PIVOTE.largo} y2={PIVOTE.y + Math.sin(rad) * PIVOTE.largo} stroke="#0c0d10" strokeWidth={18} strokeLinecap="round" />
        <line x1={PIVOTE.x + Math.cos(rad) * 120} y1={PIVOTE.y + Math.sin(rad) * 120} x2={PIVOTE.x + Math.cos(rad) * PIVOTE.largo} y2={PIVOTE.y + Math.sin(rad) * PIVOTE.largo} stroke="#3a3d45" strokeWidth={6} strokeLinecap="round" />
        <circle cx={PIVOTE.x} cy={PIVOTE.y} r={22} fill="#1d1f24" stroke="#4a4e57" strokeWidth={4} />
      </g>
    </svg>
  );
};

// Reloj de 30 minutos (centro 540,560; radio 230): el arco rojo llena media vuelta.
export const Reloj: React.FC<{ t: number; avance: number }> = ({ t, avance }) => {
  const cx = 540;
  const cy = 560;
  const fin = -90 + 180 * avance;
  const cabeza = ((fin * Math.PI) / 180);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <filter id="brillo-reloj" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx={cx} cy={cy} r={230} fill="none" stroke="#ffffff" strokeOpacity={0.12} strokeWidth={22} />
      {Array.from({ length: 12 }, (_, k) => {
        const a = (k * 30 * Math.PI) / 180;
        return <line key={k} x1={cx + Math.cos(a) * 190} y1={cy + Math.sin(a) * 190} x2={cx + Math.cos(a) * 205} y2={cy + Math.sin(a) * 205} stroke="#fff" strokeOpacity={0.5} strokeWidth={4} />;
      })}
      {avance > 0.001 ? <path d={describirArco(cx, cy, 230, -90, Math.max(-89.9, fin))} fill="none" stroke={ROJO_DA} strokeWidth={22} strokeLinecap="round" filter="url(#brillo-reloj)" /> : null}
      {avance > 0.001 ? <circle cx={cx + Math.cos(cabeza) * 230} cy={cy + Math.sin(cabeza) * 230} r={18 + 3 * Math.sin(t * 10)} fill="#fff" filter="url(#brillo-reloj)" /> : null}
    </svg>
  );
};
