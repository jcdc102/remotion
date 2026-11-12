import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { Destello, Grano } from "./cine";
import { C, Reel, SANS, SERIF } from "./comun";
import { Camara, Transformar } from "./edicion";
import { Degradados, Desierto, Diente, Fuente, Titulo, VIDRIO } from "./Algodones";
import { DURACION_MAS_EN, DURACION_MAS_ES, PALABRAS_EN, PALABRAS_ES } from "./algodones-mas-tiempos";

// «Algodones es más que dentistas» / «Los Algodones is more than dentists» (1 min). Serie bilingüe para promover el destino.
// Datos: INEGI, DENUE, localidad Vicente Guerrero (Algodones), consultas del 7 nov 2026 (311 consultorios) y 11 nov 2026 (el resto);
// cantinas en los 60, cruces en temporada alta y Yuma a 10 minutos: Zermeño Flores y Cuevas Contreras (2020), pp. 115 y 121.
// Una sola pieza para los dos idiomas: cambian la voz, los textos y los tiempos (por palabra, con Whisper).
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const mezcla = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

type Idioma = "es" | "en";
type Texto = { texto: string; i: [number, number]; frase: string | null; fi: [number, number] | null; resaltar: string[] | null };
type Fila = { icono: string; n: number; texto: string; i: number };
type Guion = {
  P: number[];
  dur: number;
  voz: string;
  hook: Texto; total: Texto; dentistas: Texto; mas: Texto; cantinas: Texto; temporada: Texto; sonrisa: Texto; pregunta: Texto;
  i995: number;
  filas1: Fila[];
  filas2: Fila[];
  i4: number;
  i60: number;
  iOct: number;
  i6000: number;
  iYuma: number;
  meses: string[];
  iconos: [number, number, number];
  rotulos: { negocios: string; hoy: string; antes: string; cruces: string; yuma: string };
  fuenteInegi: string;
  fuenteZermeno: string;
  fuenteMixta: string;
  lugar: string;
};
const GUION: Record<Idioma, Guion> = {
  es: {
    P: PALABRAS_ES,
    dur: DURACION_MAS_ES,
    voz: "voz-algodones-mas-es.mp3",
    hook: { texto: "Todos conocen Los Algodones por sus dentistas…", i: [0, 7], frase: "pero el pueblo es mucho más que eso.", fi: [7, 15], resaltar: ["dentistas…"] },
    total: { texto: "Según el INEGI, aquí hay 995 negocios registrados.", i: [15, 23], frase: null, fi: null, resaltar: ["995"] },
    dentistas: { texto: "311 son consultorios dentales, pero también hay…", i: [23, 30], frase: null, fi: null, resaltar: ["311"] },
    mas: { texto: "Y hay más:", i: [47, 50], frase: "para que no batalles con los dólares.", fi: [66, 73], resaltar: ["más:"] },
    cantinas: { texto: "¿Sabes cuántos bares y cantinas quedan?", i: [73, 79], frase: "4. En los años 60, un testigo contó 48.", fi: [79, 88], resaltar: ["cantinas"] },
    temporada: { texto: "La mejor época para venir es de octubre a abril,", i: [88, 98], frase: "cuando cruzan unas 6,000 personas al día,", fi: [98, 105], resaltar: ["octubre", "abril,"] },
    sonrisa: { texto: "Así que si vienes por tu sonrisa…", i: [113, 120], frase: "quédate a comer unos tacos y llévate una artesanía.", fi: [120, 129], resaltar: ["sonrisa…"] },
    pregunta: { texto: "¿Ya conocías este lado de Algodones?", i: [129, 135], frase: null, fi: null, resaltar: ["lado"] },
    i995: 20,
    filas1: [
      { icono: "🦷", n: 311, texto: "consultorios dentales", i: 23 },
      { icono: "🎨", n: 81, texto: "tiendas de artesanías", i: 30 },
      { icono: "🍽️", n: 89, texto: "restaurantes y cafeterías", i: 34 },
      { icono: "👓", n: 36, texto: "lentes y ópticas", i: 38 },
      { icono: "💊", n: 29, texto: "farmacias", i: 45 },
    ],
    filas2: [
      { icono: "💍", n: 29, texto: "joyerías", i: 50 },
      { icono: "💇", n: 47, texto: "salones de belleza", i: 52 },
      { icono: "🏨", n: 12, texto: "lugares para hospedarte", i: 56 },
      { icono: "💱", n: 6, texto: "casas de cambio", i: 62 },
    ],
    i4: 79,
    i60: 83,
    iOct: 95,
    i6000: 101,
    iYuma: 109,
    meses: ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    iconos: [119, 124, 128],
    rotulos: { negocios: "negocios registrados", hoy: "hoy", antes: "en los años 60", cruces: "cruces al día en temporada alta", yuma: "🇺🇸 Yuma, a 10 minutos" },
    fuenteInegi: "Fuente: INEGI, DENUE (consultas del 7 y 11 de noviembre de 2026)",
    fuenteZermeno: "Fuente: Zermeño Flores y Cuevas Contreras (2020), Revista Cenário",
    fuenteMixta: "Fuentes: hoy, INEGI (DENUE 2026) · años 60, Zermeño y Cuevas (2020)",
    lugar: "📍 Vicente Guerrero (Los Algodones), Baja California",
  },
  en: {
    P: PALABRAS_EN,
    dur: DURACION_MAS_EN,
    voz: "voz-algodones-mas-en.mp3",
    hook: { texto: "Everyone knows Los Algodones for its dentists…", i: [0, 7], frase: "but the town is so much more than that.", fi: [7, 16], resaltar: ["dentists…"] },
    total: { texto: "According to INEGI, Mexico's statistics institute, there are 995 registered businesses here.", i: [16, 28], frase: null, fi: null, resaltar: ["995"] },
    dentistas: { texto: "311 are dental offices, but there are also…", i: [28, 36], frase: null, fi: null, resaltar: ["311"] },
    mas: { texto: "And there's more!", i: [51, 54], frase: "so you don't have to worry about pesos.", fi: [69, 77], resaltar: ["more!"] },
    cantinas: { texto: "Want to know how many bars and cantinas are left?", i: [77, 87], frase: "4. Back in the 60s, a local counted 48.", fi: [87, 96], resaltar: ["cantinas"] },
    temporada: { texto: "The best time to visit is October through April,", i: [96, 105], frase: "when about 6,000 people cross every day.", fi: [105, 112], resaltar: ["October", "April,"] },
    sonrisa: { texto: "So if you come for your smile…", i: [119, 126], frase: "stay for some tacos and take home a handcrafted souvenir.", fi: [126, 136], resaltar: ["smile…"] },
    pregunta: { texto: "Did you know this side of Algodones?", i: [136, 143], frase: null, fi: null, resaltar: ["side"] },
    i995: 24,
    filas1: [
      { icono: "🦷", n: 311, texto: "dental offices", i: 28 },
      { icono: "🎨", n: 81, texto: "craft shops", i: 36 },
      { icono: "🍽️", n: 89, texto: "restaurants & cafés", i: 39 },
      { icono: "👓", n: 36, texto: "eyewear & optical shops", i: 43 },
      { icono: "💊", n: 29, texto: "pharmacies", i: 49 },
    ],
    filas2: [
      { icono: "💍", n: 29, texto: "jewelry stores", i: 54 },
      { icono: "💇", n: 47, texto: "beauty salons", i: 57 },
      { icono: "🏨", n: 12, texto: "places to stay", i: 60 },
      { icono: "💱", n: 6, texto: "currency exchanges", i: 66 },
    ],
    i4: 87,
    i60: 91,
    iOct: 102,
    i6000: 107,
    iYuma: 115,
    meses: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    iconos: [125, 129, 134],
    rotulos: { negocios: "registered businesses", hoy: "today", antes: "in the 1960s", cruces: "crossings a day in high season", yuma: "🇺🇸 Yuma, 10 minutes away" },
    fuenteInegi: "Source: INEGI (Mexico's statistics institute), DENUE business directory, Nov 2026",
    fuenteZermeno: "Source: Zermeño Flores & Cuevas Contreras (2020), Revista Cenário",
    fuenteMixta: "Sources: today, INEGI (DENUE 2026) · 1960s, Zermeño & Cuevas (2020)",
    lugar: "📍 Vicente Guerrero (Los Algodones), Baja California, Mexico",
  },
};

const PANEL = { x: 90, y: 720, w: 900, h: 640 };

// Tramos de cada idioma (fotogramas).
const tramos = (g: Guion) => {
  const P = g.P;
  return {
    total: P[g.total.i[0]] - 12,
    panel1: P[g.filas1[0].i] - 14,
    panel2: P[g.mas.i[0]] - 10,
    cantinas: P[g.cantinas.i[0]] - 10,
    temporada: P[g.temporada.i[0]] - 10,
    sonrisa: P[g.sonrisa.i[0]] - 10,
    pregunta: P[g.pregunta.i[0]] - 10,
  };
};

// Panel de vidrio con filas: ícono, número que cuenta, texto y barra.
const Panel: React.FC<{ filas: Fila[]; P: number[]; maximo: number; pie: string | null; pieDesde: number; sale: number }> = ({ filas, P, maximo, pie, pieDesde, sale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", ...VIDRIO, borderRadius: 40, boxSizing: "border-box", opacity: 1 - mezcla(frame, sale, sale + 14) }}>
      {filas.map((r, k) => {
        const e = spring({ frame: frame - (P[r.i] - 4), fps, config: { damping: 20, mass: 1.2 } });
        const n = interpolate(frame, [P[r.i], P[r.i] + 18], [0, r.n], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
        const barra = (r.n / maximo) * 330 * mezcla(frame, P[r.i], P[r.i] + 20);
        const activa = frame >= P[r.i] && (k === filas.length - 1 || frame < P[filas[k + 1].i]);
        return (
          <div key={k} style={{ position: "absolute", left: 34, right: 34, top: 50 + k * 108, height: 96, display: "flex", alignItems: "center", gap: 22, opacity: Math.min(1, e * 1.4), transform: `translateX(${(1 - e) * 60}px)` }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, background: activa ? "linear-gradient(160deg, rgba(255,165,82,0.45), rgba(255,107,91,0.3))" : "rgba(255,244,230,0.08)", border: `1.5px solid ${activa ? "rgba(255,165,82,0.7)" : "rgba(255,244,230,0.15)"}` }}>{r.icono}</div>
            <div style={{ width: 150, fontFamily: SERIF, fontWeight: 800, fontSize: 60, color: activa ? C.naranja : C.crema, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{Math.round(n)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.crema, lineHeight: 1.15 }}>{r.texto}</div>
              <div style={{ marginTop: 8, height: 12, width: barra, borderRadius: 6, background: r.n === 311 ? "linear-gradient(90deg, #F3E8D8, #CDBBA2)" : `linear-gradient(90deg, ${C.naranja}, ${C.coral})`, boxShadow: activa ? "0 0 18px rgba(255,165,82,0.6)" : "none" }} />
            </div>
          </div>
        );
      })}
      {pie ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: 1, color: "rgba(255,244,230,0.75)", opacity: mezcla(frame, pieDesde, pieDesde + 14) }}>{pie}</div> : null}
    </div>
  );
};

// Tarro de cantina.
const Tarro: React.FC<{ tam: number }> = ({ tam }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <path d="M16 9 h2.5 a2 2 0 0 1 2 2 v4 a2 2 0 0 1 -2 2 H16" fill="none" stroke="#F0D9B0" strokeWidth="1.8" />
    <rect x="4" y="6" width="12" height="15" rx="2" fill="url(#gCervezaMas)" />
    <rect x="6" y="9" width="1.4" height="9" rx="0.7" fill="rgba(255,255,255,0.55)" />
    <path d="M3.6 7.5 Q3.4 3.4 6.8 4.2 Q8 2 10.5 3.3 Q13 1.9 14.6 4.1 Q17.2 4 16.4 7.5 Z" fill="#FFF8EC" />
  </svg>
);

const Recorrido: React.FC<{ idioma: Idioma }> = ({ idioma }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = GUION[idioma];
  const P = g.P;
  const T = tramos(g);
  const tiempos = (t: Texto) => P.slice(t.i[0], t.i[1]);
  const tFrase = (t: Texto) => (t.fi ? P.slice(t.fi[0], t.fi[1]) : null);

  // A. El diente brillante y los giros que salen de él.
  const dienteE = spring({ frame: frame - 10, fps, config: { damping: 20, mass: 1.2 } });
  const late = 1 + 0.08 * Math.sin(mezcla(frame, P[6], P[6] + 14) * Math.PI);
  const encoge = mezcla(frame, P[g.hook.fi![0]], P[g.hook.fi![1] - 1]);
  const saleA = 1 - mezcla(frame, T.total - 10, T.total);

  // B. 995 negocios.
  const n995 = interpolate(frame, [P[g.i995], P[g.i995] + 26], [0, 995], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const e995 = spring({ frame: frame - (P[g.i995] - 6), fps, config: { damping: 18, mass: 1.2 } });

  // C. Panel 1: la cámara sigue la fila que se está diciendo.
  const filaY = (k: number) => PANEL.y + 70 + k * 108;
  const camPuntos = [
    { f: T.panel1, x: 540, y: 960, s: 1 },
    ...g.filas1.map((r, k) => ({ f: P[r.i] - 6, x: 550, y: 960 * 0.6 + (filaY(k) + 40) * 0.4, s: 1.06 })),
    { f: P[g.filas1[4].i] + 30, x: 540, y: 1000, s: 1.0 },
    { f: T.panel2, x: 540, y: 1000, s: 1.0 },
  ];

  // E. Cantinas: 4 brillan hoy; en los 60 eran 48.
  const QUEDAN = [9, 22, 27, 38];

  // F. Temporada.
  const altaE = mezcla(frame, P[g.iOct], P[g.iOct] + 20);
  const n6000 = interpolate(frame, [P[g.i6000], P[g.i6000] + 22], [0, 6000], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });

  const ICONOS = ["🦷", "🌮", "🎨"];
  const ancho = 250;
  const visible = (a: number, b: number) => frame >= a - 10 && frame < b + 20;

  return (
    <AbsoluteFill>
      <Degradados />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="gCervezaMas" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFD27A" />
            <stop offset="1" stopColor="#D9782A" />
          </linearGradient>
        </defs>
      </svg>

      {/* A. Gancho */}
      {frame < T.total + 4 ? (
        <>
          <div style={{ position: "absolute", left: 540 - 180, top: 860, width: 360, height: 360, opacity: dienteE * saleA, transform: `scale(${dienteE * late * (1 - encoge * 0.45)}) translateY(${encoge * 60}px)`, filter: "drop-shadow(0 0 60px rgba(255,220,170,0.65))" }}>
            <Diente tam={360} color="brillo" />
          </div>
          {["🎨", "🍽️", "👓", "💊", "🌮", "💍"].map((e, k) => {
            const a = (k / 6) * Math.PI * 2 - Math.PI / 2;
            const t = spring({ frame: frame - (P[g.hook.fi![0] + 5] + k * 3), fps, config: { damping: 14 } });
            const r = 250 * t;
            return (
              <div key={k} style={{ position: "absolute", left: 540 + Math.cos(a) * r - 45, top: 1040 + Math.sin(a) * r - 45, width: 90, height: 90, borderRadius: 45, ...VIDRIO, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, opacity: Math.min(1, t * 1.5) * saleA, transform: `scale(${t})` }}>
                {e}
              </div>
            );
          })}
        </>
      ) : null}

      {/* B. 995 negocios: el diente se vuelve un sello con el total */}
      {visible(T.total, T.panel1) ? (
        <Transformar de={{ x: 540 - 100, y: 940, w: 200, h: 200, radio: 100, color: "rgba(255,244,230,0.9)" }} a={{ x: 190, y: 800, w: 700, h: 500, radio: 250, color: "transparent" }} desde={T.total - 8} dur={22}>
          <div style={{ width: "100%", height: "100%", ...VIDRIO, borderRadius: 250, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 1 - mezcla(frame, T.panel1 - 4, T.panel1 + 8) }}>
            <div style={{ fontSize: 70, opacity: mezcla(frame, P[g.total.i[0]], P[g.total.i[0]] + 12) }}>🏪</div>
            <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 170, lineHeight: 1, color: C.naranja, transform: `scale(${e995})`, fontVariantNumeric: "tabular-nums", textShadow: "0 0 40px rgba(255,165,82,0.45)" }}>{Math.round(n995)}</div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.crema, opacity: mezcla(frame, P[g.i995 + 1], P[g.i995 + 1] + 12) }}>{g.rotulos.negocios}</div>
          </div>
        </Transformar>
      ) : null}

      {/* C. Panel 1 */}
      {visible(T.panel1, T.panel2) ? (
        <Camara puntos={camPuntos}>
          <Transformar de={{ x: 190, y: 800, w: 700, h: 500, radio: 250, color: "rgba(46,50,92,0.7)" }} a={{ ...PANEL, radio: 40, color: "transparent" }} desde={T.panel1 - 4} dur={20}>
            <Panel filas={g.filas1} P={P} maximo={311} pie={null} pieDesde={0} sale={T.panel2 - 6} />
          </Transformar>
        </Camara>
      ) : null}

      {/* D. Panel 2: y hay más */}
      {visible(T.panel2, T.cantinas) ? (
        <Transformar de={{ ...PANEL, radio: 40, color: "rgba(46,50,92,0.7)" }} a={{ x: PANEL.x, y: PANEL.y + 20, w: PANEL.w, h: 520, radio: 40, color: "transparent" }} desde={T.panel2 - 6} dur={18}>
          <Panel filas={g.filas2} P={P} maximo={47} pie={null} pieDesde={0} sale={T.cantinas - 6} />
        </Transformar>
      ) : null}

      {/* E. Cantinas: 48 tarros, quedan 4 */}
      {visible(T.cantinas, T.temporada) ? (
        <div style={{ position: "absolute", left: 130, top: 740, width: 820, height: 620, borderRadius: 40, ...VIDRIO, opacity: mezcla(frame, T.cantinas - 4, T.cantinas + 12) * (1 - mezcla(frame, T.temporada - 6, T.temporada + 8)) }}>
          {Array.from({ length: 48 }).map((_, i) => {
            const queda = QUEDAN.includes(i);
            const aparece = queda ? spring({ frame: frame - (P[g.i4] - 4 + QUEDAN.indexOf(i) * 3), fps, config: { damping: 12 } }) : mezcla(frame, P[g.i60] + i * 0.4, P[g.i60] + 8 + i * 0.4);
            return (
              <div key={i} style={{ position: "absolute", left: 40 + (i % 8) * 94, top: 34 + Math.floor(i / 8) * 76, opacity: queda ? Math.min(1, aparece * 1.5) : aparece * 0.28, transform: `scale(${queda ? aparece * 1.1 : 1})`, filter: queda ? "drop-shadow(0 0 18px rgba(255,190,90,0.95))" : "grayscale(1)" }}>
                <Tarro tam={64} />
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 24, display: "flex", justifyContent: "center", gap: 24, fontFamily: SANS, fontWeight: 600, fontSize: 28 }}>
            <div style={{ ...VIDRIO, borderRadius: 40, padding: "10px 24px", color: C.naranja, opacity: mezcla(frame, P[g.i4], P[g.i4] + 10) }}>{`🍺 4 · ${g.rotulos.hoy}`}</div>
            <div style={{ ...VIDRIO, borderRadius: 40, padding: "10px 24px", color: "rgba(255,244,230,0.7)", opacity: mezcla(frame, P[g.i60 + 4], P[g.i60 + 4] + 10) }}>{`48 · ${g.rotulos.antes}`}</div>
          </div>
        </div>
      ) : null}

      {/* F. Temporada: calendario, cruces y Yuma */}
      {visible(T.temporada, T.sonrisa) ? (
        <div style={{ position: "absolute", left: 110, top: 760, width: 860, opacity: mezcla(frame, T.temporada - 4, T.temporada + 12) * (1 - mezcla(frame, T.sonrisa - 6, T.sonrisa + 8)) }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
            {g.meses.map((mes, k) => {
              const alta = k >= 9 || k <= 3;
              const e = spring({ frame: frame - (T.temporada + k * 2), fps, config: { damping: 18 } });
              return (
                <div key={k} style={{ height: 110, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 800, fontSize: 52, transform: `scale(${e})`, ...(alta && altaE > 0.5 ? { background: `linear-gradient(160deg, ${C.naranja}, ${C.coral})`, color: C.noche, boxShadow: "0 0 30px rgba(255,165,82,0.5)" } : { ...VIDRIO, color: "rgba(255,244,230,0.55)" }) }}>
                  {mes}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 40, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 18, opacity: mezcla(frame, P[g.i6000] - 4, P[g.i6000] + 8) }}>
            <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 110, color: C.crema, fontVariantNumeric: "tabular-nums" }}>~{Math.round(n6000).toLocaleString("en-US")}</span>
          </div>
          <div style={{ textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 30, color: "rgba(255,244,230,0.85)", opacity: mezcla(frame, P[g.i6000] + 8, P[g.i6000] + 20) }}>{g.rotulos.cruces}</div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 26, transform: `scale(${spring({ frame: frame - (P[g.iYuma] - 4), fps, config: { damping: 13 } })})` }}>
            <div style={{ ...VIDRIO, borderRadius: 40, padding: "14px 30px", fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.crema }}>{g.rotulos.yuma}</div>
          </div>
        </div>
      ) : null}

      {/* G. Sonrisa → tacos → artesanía */}
      {visible(T.sonrisa, T.pregunta) ? (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - mezcla(frame, T.pregunta, T.pregunta + 16) }}>
          {ICONOS.map((ic, k) => {
            const t0 = P[g.iconos[k]] - 4;
            const e = spring({ frame: frame - t0, fps, config: { damping: 13 } });
            const x = 75 + k * (ancho + 40);
            const flecha = mezcla(frame, t0 - 10, t0 + 2);
            const brilla = frame >= t0 + 4 && (k === 2 || frame < P[g.iconos[k + 1]] - 4);
            return (
              <div key={k}>
                {k > 0 ? <div style={{ position: "absolute", left: x - 40, top: 1000 + ancho / 2 - 3, width: 40 * flecha, height: 6, borderRadius: 3, background: C.naranja }} /> : null}
                <div style={{ position: "absolute", left: x, top: 1000, width: ancho, height: ancho, borderRadius: ancho / 2, ...VIDRIO, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 130, transform: `scale(${e})`, opacity: Math.min(1, e * 1.5), boxShadow: brilla ? "0 0 60px rgba(255,165,82,0.55), inset 0 1px 0 rgba(255,255,255,0.22)" : VIDRIO.boxShadow }}>
                  {ic}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* H. Pregunta y lugar */}
      {frame >= T.pregunta ? (
        <div style={{ position: "absolute", left: 70, right: 70, top: 1000, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <div style={{ transform: `scale(${spring({ frame: frame - T.pregunta - 6, fps, config: { damping: 14 } })})`, fontSize: 150 }}>🌵</div>
          <div style={{ ...VIDRIO, borderRadius: 40, padding: "16px 30px", fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.crema, textAlign: "center", opacity: mezcla(frame, T.pregunta + 20, T.pregunta + 34) }}>{g.lugar}</div>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: 2, color: "rgba(255,244,230,0.8)", opacity: mezcla(frame, T.pregunta + 40, T.pregunta + 54) }}>@julio.chaidez1</div>
        </div>
      ) : null}

      {/* Velo arriba para que los títulos se lean */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,9,22,0.8) 0%, rgba(7,9,22,0.5) 28%, transparent 40%)" }} />

      {[T.total - 8, T.panel1 - 4, T.panel2 - 6, T.cantinas, T.temporada, T.sonrisa, T.pregunta].map((d) => (
        <Sequence key={d} from={d} durationInFrames={16}>
          <Destello />
        </Sequence>
      ))}

      <Fuente texto={g.fuenteInegi} desde={P[g.i995]} hasta={T.cantinas} />
      <Fuente texto={g.fuenteMixta} desde={T.cantinas + 4} hasta={T.temporada} />
      <Fuente texto={g.fuenteZermeno} desde={T.temporada + 4} hasta={T.sonrisa + 6} />

      <Titulo texto={g.hook.texto} tiempos={tiempos(g.hook)} resaltar={g.hook.resaltar} frase={g.hook.frase} tiemposFrase={tFrase(g.hook)} hasta={T.total} />
      <Titulo texto={g.total.texto} tiempos={tiempos(g.total)} resaltar={g.total.resaltar} frase={null} tiemposFrase={null} hasta={T.panel1} />
      <Titulo texto={g.dentistas.texto} tiempos={tiempos(g.dentistas)} resaltar={g.dentistas.resaltar} frase={null} tiemposFrase={null} hasta={T.panel2} />
      <Titulo texto={g.mas.texto} tiempos={tiempos(g.mas)} resaltar={g.mas.resaltar} frase={g.mas.frase} tiemposFrase={tFrase(g.mas)} hasta={T.cantinas} />
      <Titulo texto={g.cantinas.texto} tiempos={tiempos(g.cantinas)} resaltar={g.cantinas.resaltar} frase={g.cantinas.frase} tiemposFrase={tFrase(g.cantinas)} hasta={T.temporada} />
      <Titulo texto={g.temporada.texto} tiempos={tiempos(g.temporada)} resaltar={g.temporada.resaltar} frase={g.temporada.frase} tiemposFrase={tFrase(g.temporada)} hasta={T.sonrisa} />
      <Titulo texto={g.sonrisa.texto} tiempos={tiempos(g.sonrisa)} resaltar={g.sonrisa.resaltar} frase={g.sonrisa.frase} tiemposFrase={tFrase(g.sonrisa)} hasta={T.pregunta} />
      <Titulo texto={g.pregunta.texto} tiempos={tiempos(g.pregunta)} resaltar={g.pregunta.resaltar} frase={null} tiemposFrase={null} hasta={g.dur + 20} />
    </AbsoluteFill>
  );
};

const EscenaEs: React.FC = () => (
  <CameraMotionBlur shutterAngle={160} samples={5}>
    <Recorrido idioma="es" />
  </CameraMotionBlur>
);
const EscenaEn: React.FC = () => (
  <CameraMotionBlur shutterAngle={160} samples={5}>
    <Recorrido idioma="en" />
  </CameraMotionBlur>
);

export const AlgodonesMas: React.FC<{ idioma: Idioma }> = ({ idioma }) => {
  const g = GUION[idioma];
  const P = g.P;
  const T = tramos(g);
  const SONIDOS: [number, string, number][] = [
    [12, "pop", 0.3],
    [P[g.hook.fi![0] + 5], "brillo", 0.3],
    [T.total - 8, "whoosh", 0.35],
    [P[g.i995], "golpe", 0.3],
    [T.panel1 - 4, "whoosh", 0.3],
    ...[...g.filas1, ...g.filas2].map((r): [number, string, number] => [P[r.i], "pop", 0.3]),
    [T.panel2 - 6, "whoosh", 0.3],
    [T.cantinas, "whoosh", 0.35],
    [P[g.i4], "ding", 0.3],
    [T.temporada, "whoosh", 0.35],
    [P[g.iOct], "brillo", 0.3],
    [P[g.i6000], "pop", 0.32],
    [P[g.iYuma] - 4, "pop", 0.3],
    [T.sonrisa, "whoosh", 0.35],
    [P[g.iconos[0]] - 4, "pop", 0.3],
    [P[g.iconos[1]] - 4, "ding", 0.3],
    [P[g.iconos[2]] - 4, "brillo", 0.35],
    [T.pregunta, "whoosh", 0.35],
    [T.pregunta + 20, "notificacion", 0.3],
  ];
  return (
    <>
      <Reel
        duracion={g.dur}
        fondo={<Desierto duracion={g.dur} enfoque={[[0, 30, g.dur - 60, g.dur], [3, 6, 6, 3]]} />}
        etiqueta={null}
        voz={g.voz}
        musica="musica-algodones-historia.mp3"
        volumenMusica={0.16}
        sonidos={SONIDOS}
        escenas={[{ desde: 0, dur: g.dur, Pieza: idioma === "es" ? EscenaEs : EscenaEn }]}
      />
      <Grano />
    </>
  );
};
