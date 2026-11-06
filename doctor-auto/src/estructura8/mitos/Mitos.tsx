// Tema «mitos»: «¿Mito o realidad?». 8 piezas, 15 clips de voz, 4 creencias
// (3 mitos y 1 realidad). Estilo premium: cada creencia es una pregunta con cuenta
// regresiva; el sello MITO o REALIDAD cae en su palabra; las escenas cambian
// transformando un objeto (tarjeta → reloj → pantalla de la bomba; manual → ventila;
// tubería → moneda → llanta → calendario → botón).
import { Audio } from "@remotion/media";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, Img, Sequence, spring, staticFile, Track, useCurrentFrame, useVideoConfig } from "remotion";
import { construirClips, momentoEnClip, type Clip, type GuionClips } from "../../doctor-auto/clips";
import { ANTON, DEGRADADO, POPPINS, PESO_POPPINS, ROJO_DA } from "../../doctor-auto/constantes";
import { Rafaga, Sticker } from "../../doctor-auto/Emociones";
import { pulsoBpm } from "../../doctor-auto/Fondo";
import { AcabadoPremium, aPantalla, BarraRevela, crearCamara, Estudio, estiloCamara, FranjaMascara, Morfo, suave, TituloMascara, type Forma, type Toma } from "../../doctor-auto/premium";
import { SubtitulosDA } from "../../doctor-auto/Texto";
import { Mascota, type Ancla } from "../Mascota";
import { PANEL } from "../pasar-corriente/Diagrama";
import { Llanta, Reloj } from "../viaje/Escenas";
import duraciones from "./duraciones.json";
import { AireAC, Bomba, Cochera, Destellos, Moneda, PANTALLA_BOMBA, RELOJ_COCHERA, ROJO_MITO, Sello, Termometro, VENTILA, VERDE_REALIDAD } from "./Escenas";
import guionJson from "./guion.json";

const guion = guionJson as unknown as GuionClips & { marcaDeAgua: string };
const FPS = guion.fps;
const { clips, duracionVoz, duracionTotal, hayMusica } = construirClips(guion, duraciones, 0);
export const DURACION_MITOS = duracionTotal;
const BPM = guion.bpm ?? null;

const desde = (s: number) => Math.round(s * FPS);
const clip = (id: string) => clips.find((c) => c.id === id) as Clip;
const resorte = (t: number, t0: number, damping = 13, stiffness = 180) =>
  t < t0 ? 0 : spring({ frame: Math.round((t - t0) * FPS), fps: FPS, config: { damping, stiffness } });
const rampa = (t: number, a: number, b: number) => suave(Math.max(0, Math.min(1, (t - a) / (b - a))));
const en = (c: Clip, frase: string) => Math.min(Math.max(momentoEnClip(c, frase), c.inicio), c.fin - 0.2);

const [c01, c02, c03a, c03b, c03c, c04, c05a, c05b, c05c, c06, c07a, c07b, c07c, c07d, c08] = [
  "c01", "c02", "c03a", "c03b", "c03c", "c04", "c05a", "c05b", "c05c", "c06", "c07a", "c07b", "c07c", "c07d", "c08",
].map(clip);
const limite = (c: Clip) => c.inicio - guion.pausaEntreClipsSegundos / 2;

// ---------- Momentos ----------
const T = {
  adivina: en(c02, "Adivina"),
  diez: en(c03a, "diez minutos"),
  treinta: en(c03b, "treinta"),
  suave: en(c03b, "suave"),
  premium: en(c03c, "premium"),
  potencia: en(c03c, "potencia"),
  cualquier: en(c03c, "cualquier"),
  manual: en(c05a, "manual"),
  enfria: en(c05b, "enfría"),
  recargale: en(c05b, "recárgale"),
  fuga: en(c05c, "fuga"),
  reparala: en(c05c, "repárala"),
  cierto: en(c06, "cierto"),
  frias: en(c07a, "frías"),
  calientes: en(c07b, "Calientes"),
  demas: en(c07b, "más"),
  antes: en(c07c, "antes"),
  quince: en(c07d, "quince"),
};
// Sellos: caen justo cuando empieza la voz del veredicto.
const SELLOS = [
  { t0: c03b.voz[0], tipo: "mito" as const, hasta: limite(c03c) },
  { t0: c05a.voz[0], tipo: "mito" as const, hasta: limite(c05b) },
  { t0: c05c.voz[0], tipo: "mito" as const, hasta: limite(c06) },
  { t0: c07b.voz[0], tipo: "realidad" as const, hasta: limite(c07c) + 0.6 },
];
// Preguntas con cuenta regresiva (de la pregunta al sello).
const PREGUNTAS = [
  { desde: c03a.inicio + 0.2, hasta: SELLOS[0].t0 },
  { desde: c03c.inicio + 0.2, hasta: SELLOS[1].t0 },
  { desde: c05b.inicio + 0.2, hasta: SELLOS[2].t0 },
  { desde: c07a.inicio + 0.2, hasta: SELLOS[3].t0 },
];
const [B3a, B3c, B5b, B6, B7a, B7d, B8] = [c03a, c03c, c05b, c06, c07a, c07d, c08].map(limite);
const PASO_TARJETA = Math.min(0.22, (c02.fin - 0.4 - c02.inicio - 0.2) / 4);
const T_TARJETAS = [0, 1, 2, 3].map((k) => c02.inicio + 0.2 + k * PASO_TARJETA);
const T_COSTOSO = en(c01, "salir caro");

// ---------- Cámaras ----------
const camMoneda = crearCamara([
  [0, 540, 560, 1.35],
  [T_COSTOSO, 540, 560, 1.0],
  [c02.inicio + 0.3, 540, 420, 0.75],
  [B3a, 540, 400, 0.72],
]);
const camCochera = crearCamara([
  [B3a, 540, 560, 1.0],
  [T.diez, RELOJ_COCHERA.cx - 60, RELOJ_COCHERA.cy + 60, 1.15],
  [SELLOS[0].t0, 540, 560, 1.0],
  [T.treinta, RELOJ_COCHERA.cx - 60, RELOJ_COCHERA.cy + 60, 1.1],
  [T.suave, 640, 680, 1.0],
  [B3c - 0.2, 540, 560, 1.0],
]);
const camBomba = crearCamara([
  [B3c, 540, 560, 0.8],
  [T.premium, 620, 720, 1.0],
  [T.potencia, 360, 660, 0.95],
  [c04.inicio + 0.1, PANTALLA_BOMBA.cx, PANTALLA_BOMBA.cy + 20, 1.5],
  [c04.fin, PANTALLA_BOMBA.cx, PANTALLA_BOMBA.cy + 20, 1.85],
  [SELLOS[1].t0, 540, 600, 0.85],
  [T.manual, 540, 700, 1.1],
  [B5b - 0.2, 540, 620, 1.0],
]);
const camAire = crearCamara([
  [B5b, 540, 480, 1.0],
  [T.enfria, 540, 480, 1.12],
  [T.recargale, 680, 600, 1.1],
  [SELLOS[2].t0, 540, 560, 1.0],
  [T.fuga, 600, 500, 1.15],
  [T.reparala, 650, 450, 1.1],
  [B6 - 0.2, 540, 500, 1.0],
]);
const camRealidad = crearCamara([
  [B6, 540, 560, 1.0],
  [T.cierto, 540, 560, 1.12],
  [B7a - 0.2, 540, 560, 1.0],
]);
const camLlanta = crearCamara([
  [B7a, 540, 560, 1.0],
  [T.frias, 720, 560, 1.1],
  [SELLOS[3].t0, 540, 560, 1.0],
  [T.demas, 380, 620, 1.15],
  [T.antes, 420, 600, 1.08],
  [B7d - 0.2, 540, 560, 1.0],
]);
const camCalendario = crearCamara([
  [B7d, 540, 560, 1.0],
  [T.quince, 540, 550, 1.08],
  [c07d.fin, 540, 560, 1.12],
  [B8 - 0.2, 540, 560, 1.0],
]);
const camCta = crearCamara([
  [B8, 540, 560, 1.1],
  [duracionTotal, 540, 560, 1.0],
]);

// ---------- Escenas ----------
type Escena = { desde: number; hasta: number; camara: (t: number) => Toma; fondo: (t: number) => React.ReactNode; dibujo: (t: number) => React.ReactNode };
const giroMoneda = (t: number) => (t < c01.fin ? 1440 * (1 - (1 - t / c01.fin) ** 2) : 1440 + (t - c01.fin) * 140);
const giroRealidad = (t: number) => 900 * (1 - (1 - Math.min(1, Math.max(0, (t - B6) / (T.cierto + 0.1 - B6)))) ** 3);
const ESCENAS: Escena[] = [
  {
    desde: 0,
    hasta: B3a,
    camara: camMoneda,
    fondo: (t) => (
      <>
        <Estudio t={t} tono={["#3a1216", "#09090b"]} acento={ROJO_DA} />
        <Destellos t={t} color="#ffd27a" />
      </>
    ),
    dibujo: (t) => <Moneda cx={540} cy={560} r={220} giro={giroMoneda(t)} />,
  },
  {
    desde: B3a,
    hasta: B3c,
    camara: camCochera,
    fondo: () => null,
    dibujo: (t) => (
      <Cochera
        t={t}
        minutos={10 * rampa(t, c03a.inicio + 0.25, T.diez + 0.45)}
        resuelto={t >= SELLOS[0].t0 + 0.5 ? 1 : 0}
        avanza={760 * rampa(t, T.suave - 0.2, B3c + 0.2)}
        humo={1}
      />
    ),
  },
  {
    desde: B3c,
    hasta: B5b,
    camara: camBomba,
    fondo: (t) => <Estudio t={t} tono={["#2a2d36", "#08080a"]} acento={ROJO_DA} />,
    dibujo: (t) => (
      <Bomba
        t={t}
        premium={rampa(t, T.premium - 0.1, T.premium + 0.15)}
        litros={Math.min(c04.inicio, t) > B3c ? (Math.min(c04.inicio, t) - B3c) * 3.7 : 0}
        potencia={rampa(t, T.potencia - 0.1, T.cualquier + 0.3)}
        misterio={t >= c04.inicio - 0.1 && t < SELLOS[1].t0 ? 1 : 0}
        manual={resorte(t, T.manual - 0.15, 14)}
      />
    ),
  },
  {
    desde: B5b,
    hasta: B6,
    camara: camAire,
    fondo: (t) => <Estudio t={t} tono={["#3a1a12", "#08080a"]} acento="#ff7a2a" />,
    dibujo: (t) => <AireAC t={t} caliente={1} lata={rampa(t, T.recargale - 0.1, T.recargale + 0.4)} fuga={rampa(t, T.fuga - 0.25, T.fuga + 0.05)} reparado={rampa(t, T.reparala, T.reparala + 0.4)} />,
  },
  {
    desde: B6,
    hasta: B7a,
    camara: camRealidad,
    fondo: (t) => (
      <>
        <Estudio t={t} tono={["#10351f", "#050906"]} acento={VERDE_REALIDAD} />
        <Destellos t={t} color="#7dffb0" />
      </>
    ),
    dibujo: (t) => <Moneda cx={540} cy={560} r={220} giro={giroRealidad(t)} />,
  },
  {
    desde: B7a,
    hasta: B7d,
    camara: camLlanta,
    fondo: (t) => <Estudio t={t} tono={["#1a2a3a", "#06080b"]} acento="#4db8ff" />,
    dibujo: (t) => {
      const calor = rampa(t, SELLOS[3].t0 + 0.15, T.demas + 0.2) * (1 - rampa(t, c07c.inicio, c07c.inicio + 0.45));
      return (
        <>
          <Termometro t={t} calor={calor} />
          <Llanta t={t} giro={(t - B7a) * 40} profundidad={1} presion={resorte(t, B7a + 0.25)} aguja={1 + calor * (4 / 35)} lupa={0} />
        </>
      );
    },
  },
  {
    desde: B7d,
    hasta: B8,
    camara: camCalendario,
    fondo: (t) => <Estudio t={t} tono={["#3a1216", "#09090b"]} acento={ROJO_DA} />,
    dibujo: (t) => <Reloj t={t} avance={rampa(t, T.quince - 0.05, T.quince + 0.9)} />,
  },
  {
    desde: B8,
    hasta: Infinity,
    camara: camCta,
    fondo: (t) => (
      <>
        <Estudio t={t} tono={["#3a1216", "#09090b"]} acento={ROJO_DA} />
        <Destellos t={t} color="#ffd27a" />
      </>
    ),
    dibujo: (t) => <Moneda cx={540} cy={470} r={150} giro={(t - B8) * 200} />,
  },
];

// ---------- Transformaciones ----------
const RGBA = (h: string, a = 1): [number, number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), a];
const SIN: [number, number, number, number] = [0, 0, 0, 0];
const rect = (cx: number, cy: number, w: number, h: number, rx: number, relleno: string, a = 1): Forma => ({ cx, cy, w, h, rx, relleno: RGBA(relleno, a), borde: SIN, grosor: 0 });
const circulo = (cx: number, cy: number, r: number, relleno: string) => rect(cx, cy, r * 2, r * 2, r, relleno);
const anillo: Forma = { cx: 540, cy: 560, w: 460, h: 460, rx: 230, relleno: SIN, borde: RGBA(ROJO_DA), grosor: 22 };
const BOTON = { cx: 540, cy: 796, w: 640, h: 116 };
const TARJETA_1 = { cx: 50 + 113, cy: 340 + 90, w: 226, h: 180 };
const relojEn = (c: Toma) => {
  const p = aPantalla(c, RELOJ_COCHERA.cx, RELOJ_COCHERA.cy);
  return circulo(p.x, p.y, RELOJ_COCHERA.r * c.z, "#f4f1ea");
};
const pantallaBomba = (c: Toma) => {
  const p = aPantalla(c, PANTALLA_BOMBA.cx, PANTALLA_BOMBA.cy + 15);
  return rect(p.x, p.y, PANTALLA_BOMBA.w * c.z, (PANTALLA_BOMBA.h - 30) * c.z, 14, "#0d1410");
};
const rectEn = (c: Toma, cx: number, cy: number, w: number, h: number, rx: number, relleno: string) => {
  const p = aPantalla(c, cx, cy);
  return rect(p.x, p.y, w * c.z, h * c.z, rx * c.z, relleno);
};
type Transformacion = { t: number; de: Forma; a: Forma; sonido: string };
const TRANSFORMACIONES: Transformacion[] = [
  { t: B3a, de: rect(TARJETA_1.cx, TARJETA_1.cy, TARJETA_1.w, TARJETA_1.h, 26, "#5a5a62", 0.85), a: relojEn(camCochera(B3a)), sonido: "whoosh-a" },
  { t: B3c, de: relojEn(camCochera(B3c)), a: pantallaBomba(camBomba(B3c)), sonido: "whoosh-b" },
  { t: B5b, de: rectEn(camBomba(B5b), 540, 700, 580, 390, 14, "#fbf9f3"), a: rectEn(camAire(B5b), VENTILA.cx, VENTILA.cy, VENTILA.w, VENTILA.h, 30, "#0b0c0f"), sonido: "whoosh-c" },
  { t: B6, de: rectEn(camAire(B6), 540, 495, 960, 70, 35, "#8d939d"), a: circulo(540, 560, 220, ROJO_MITO), sonido: "whoosh-a" },
  { t: B7a, de: circulo(540, 560, 220, VERDE_REALIDAD), a: circulo(540, 560, 250, "#161618"), sonido: "whoosh-b" },
  { t: B7d, de: circulo(540, 560, 250, "#161618"), a: anillo, sonido: "whoosh-c" },
  { t: B8, de: anillo, a: rect(BOTON.cx, BOTON.cy, BOTON.w, BOTON.h, 46, ROJO_DA), sonido: "whoosh-a" },
];
const VENTANA_MORFO = 0.2;
// Golpe de cámara (1 → 1.1) cuando cae cada sello.
const golpe = (t: number) =>
  Math.max(
    1,
    ...SELLOS.map((s) => {
      const f = (t - s.t0) * FPS;
      if (f < 0 || f > 14) return 1;
      return f <= 3 ? 1 + 0.1 * (f / 3) : 1 + 0.1 * (1 - (f - 3) / 11);
    }),
  );

const CapaEscena: React.FC<{ e: Escena; t: number; opacidad: number }> = ({ e, t, opacidad }) => (
  <AbsoluteFill style={{ opacity: opacidad }}>
    {e.fondo(t)}
    <div style={estiloCamara(e.camara(t), t)}>{e.dibujo(t)}</div>
  </AbsoluteFill>
);

const Escenario: React.FC<{ t: number }> = ({ t }) => {
  const i = ESCENAS.findIndex((e) => t >= e.desde && t < e.hasta);
  const e = ESCENAS[i < 0 ? ESCENAS.length - 1 : i];
  const k = ESCENAS.indexOf(e);
  const anterior = k > 0 && t - e.desde < 4 / FPS ? ESCENAS[k - 1] : null;
  const mezcla = anterior ? (t - e.desde) / (4 / FPS) : 1;
  const tr = TRANSFORMACIONES.find((x) => Math.abs(t - x.t) <= VENTANA_MORFO);
  const opMorfo = tr ? Math.min(1, (VENTANA_MORFO - Math.abs(t - tr.t)) / 0.06) : 0;
  return (
    <AbsoluteFill style={{ transform: `scale(${golpe(t)})`, transformOrigin: "540px 600px" }}>
      {anterior ? <CapaEscena e={anterior} t={t} opacidad={1} /> : null}
      <CapaEscena e={e} t={t} opacidad={mezcla} />
      {tr ? <Morfo de={tr.de} a={tr.a} p={(t - (tr.t - VENTANA_MORFO)) / (2 * VENTANA_MORFO)} opacidad={opMorfo} /> : null}
    </AbsoluteFill>
  );
};

// ---------- Gráficos sobre la escena ----------
// Sello: cae grande con un golpe, se queda y después se encoge a una insignia (movimiento encadenado).
const SelloAnimado: React.FC<{ t: number }> = ({ t }) => {
  const s = SELLOS.find((x) => t >= x.t0 && t < x.hasta);
  if (!s) return null;
  const l = t - s.t0;
  const cae = Math.min(1, l / 0.12);
  const escala = 2.4 - 1.4 * (cae * cae);
  const va = rampa(t, s.t0 + 0.95, s.t0 + 1.3);
  const cx = 540 + (160 - 540) * va;
  const cy = 560 + (800 - 560) * va;
  const r = (200 * escala) * (1 - va) + 58 * va;
  const sale = 1 - rampa(t, s.hasta - 0.15, s.hasta);
  return (
    <>
      {l < 0.18 ? <AbsoluteFill style={{ background: "#fff", opacity: 0.3 * (1 - l / 0.18) }} /> : null}
      <Sello cx={cx} cy={cy} r={r} tipo={s.tipo} opacidad={Math.min(1, cae * 1.5) * sale} giro={-12 + 4 * va} />
    </>
  );
};

const SECCIONES = [
  { n: 1, texto: "CALENTAR EL MOTOR", desde: B3a + 0.15, hasta: B3c },
  { n: 2, texto: "GASOLINA PREMIUM", desde: B3c + 0.2, hasta: B5b },
  { n: 3, texto: "GAS DEL AIRE", desde: B5b + 0.2, hasta: B6 },
  { n: 4, texto: "PRESIÓN DE LLANTAS", desde: B7a + 0.2, hasta: B7d },
];
const EtiquetaSeccion: React.FC<{ t: number }> = ({ t }) => {
  const s = SECCIONES.find((x) => t >= x.desde && t < x.hasta);
  if (!s) return null;
  const sale = rampa(t, s.hasta - 0.2, s.hasta);
  return (
    <>
    {/* sombra suave detrás de las etiquetas para que siempre se lean sobre la escena */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, height: 260, opacity: 1 - sale, background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0) 100%)" }} />
    <div style={{ position: "absolute", left: 70, top: 352, display: "flex", alignItems: "center", gap: 16, opacity: 1 - sale }}>
      <div style={{ width: 64, height: 64, borderRadius: 32, background: DEGRADADO, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 40, color: "#fff", transform: `scale(${resorte(t, s.desde)})`, boxShadow: "0 8px 24px rgba(204,35,40,0.5)" }}>{s.n}</div>
      <div style={{ overflow: "hidden", paddingTop: "0.2em", marginTop: "-0.2em" }}>
        <div style={{ transform: `translateY(${(1 - resorte(t, s.desde + 0.08)) * 120}%)`, fontFamily: ANTON, fontSize: 44, color: "#fff", letterSpacing: 2, textShadow: "0 4px 18px rgba(0,0,0,0.7)" }}>{s.texto}</div>
      </div>
    </div>
    </>
  );
};

// Pregunta: cápsula de vidrio "¿MITO O REALIDAD?" con barra que se vacía hasta el veredicto.
const Pregunta: React.FC<{ t: number }> = ({ t }) => {
  const p = PREGUNTAS.find((x) => t >= x.desde && t < x.hasta + 0.1);
  if (!p) return null;
  const entra = resorte(t, p.desde);
  const queda = 1 - Math.max(0, Math.min(1, (t - p.desde) / (p.hasta - p.desde)));
  return (
    <div style={{ position: "absolute", left: 70, top: 436, overflow: "hidden", borderRadius: 22 }}>
      <div style={{ transform: `translateY(${(1 - entra) * 110}%)`, background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.28)", backdropFilter: "blur(14px)", borderRadius: 22, padding: "10px 22px 14px" }}>
        <div style={{ fontFamily: POPPINS, fontWeight: PESO_POPPINS, fontSize: 30, color: "#fff" }}>🤔 ¿MITO O REALIDAD?</div>
        <div style={{ marginTop: 8, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.2)" }}>
          <div style={{ width: `${queda * 100}%`, height: "100%", borderRadius: 4, background: queda > 0.35 ? "#ffcf3a" : "#ff4d4d" }} />
        </div>
      </div>
    </div>
  );
};

const TARJETAS = [
  { e: "🌡️", l: "Calentar" },
  { e: "⛽", l: "Premium" },
  { e: "❄️", l: "Gas del aire" },
  { e: "🛞", l: "Presión" },
];
const Tarjetas: React.FC<{ t: number }> = ({ t }) => {
  if (t < T_TARJETAS[0] || t > B3a + VENTANA_MORFO) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 340, display: "flex", justifyContent: "space-between" }}>
      {TARJETAS.map((c, k) => {
        const entra = resorte(t, T_TARJETAS[k], 12);
        // La tarjeta 1 se convierte en el reloj (transformación); las demás salen por su máscara.
        const sale = k === 0 ? 0 : rampa(t, B3a - 0.3 + k * 0.03, B3a - 0.05 + k * 0.03);
        const oculta = k === 0 && t >= B3a - VENTANA_MORFO + 0.06;
        return (
          <div key={c.l} style={{ width: 226, height: 180, overflow: "hidden", borderRadius: 26, opacity: oculta ? 0 : 1 }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 26,
                background: "rgba(255,255,255,0.12)",
                border: "2px solid rgba(255,255,255,0.28)",
                backdropFilter: "blur(14px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transform: `translateY(${(1 - entra) * 105 - sale * 105}%)`,
              }}
            >
              <span style={{ fontFamily: ANTON, fontSize: 28, color: ROJO_DA, background: "#fff", borderRadius: 14, padding: "0 12px" }}>{k + 1}</span>
              <span style={{ fontSize: 56 }}>{c.e}</span>
              <span style={{ fontFamily: POPPINS, fontWeight: PESO_POPPINS, fontSize: 24, color: "#fff" }}>{c.l}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Insignia: React.FC<{ t: number; t0: number; t1: number; texto: string; x: number; y: number; color: string }> = ({ t, t0, t1, texto, x, y, color }) =>
  t >= t0 && t < t1 ? (
    <div style={{ position: "absolute", left: x, top: y, opacity: 1 - rampa(t, t1 - 0.15, t1) }}>
      <BarraRevela t={t} t0={t0}>
        <div style={{ background: "#fff", color, fontFamily: ANTON, fontSize: 50, padding: "6px 24px 10px", borderRadius: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.45)", whiteSpace: "nowrap" }}>{texto}</div>
      </BarraRevela>
    </div>
  ) : null;

const DatoCalendario: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.quince - 0.05 || t > B8) return null;
  const sube = resorte(t, T.quince + 0.25);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 410, height: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${camCalendario(t).z})`, opacity: 1 - rampa(t, B8 - 0.12, B8) }}>
      <BarraRevela t={t} t0={T.quince - 0.05}>
        <div style={{ fontFamily: ANTON, fontSize: 200, lineHeight: 1, color: "#fff", padding: "0 10px", textShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>15</div>
      </BarraRevela>
      <div style={{ overflow: "hidden", paddingTop: "0.2em", marginTop: "-0.2em" }}>
        <div style={{ transform: `translateY(${(1 - sube) * 120}%)`, fontFamily: ANTON, fontSize: 64, color: ROJO_DA, letterSpacing: 8 }}>DÍAS</div>
      </div>
    </div>
  );
};

const Boton: React.FC<{ t: number }> = ({ t }) => {
  if (t < B8 + VENTANA_MORFO - 0.04) return null;
  const pulso = 1 + 0.03 * Math.sin((t - B8) * Math.PI * 2);
  const texto = resorte(t, B8 + VENTANA_MORFO - 0.05);
  return (
    <div style={{ position: "absolute", left: BOTON.cx - BOTON.w / 2, top: BOTON.cy - BOTON.h / 2, width: BOTON.w, height: BOTON.h, transform: `scale(${pulso})` }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 46, background: DEGRADADO, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 18px 50px rgba(204,35,40,0.55)" }}>
        <div style={{ transform: `translateY(${(1 - texto) * 110}%)`, fontFamily: ANTON, fontSize: 66, color: "#fff", whiteSpace: "nowrap" }}>{c08.boton}</div>
      </div>
    </div>
  );
};

// ---------- Mascota ----------
const DERECHA: Ancla = { x: 805, abajo: 1430, alto: 455 };
const MascotaAnimada: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const datos = clips.map((c) => useAudioData(staticFile(`audio/mitos/${c.archivo}`)));
  let i = clips.findIndex((c) => t >= c.inicio && t < c.fin + guion.pausaEntreClipsSegundos);
  if (i < 0) i = clips.length - 1;
  const c = clips[i];
  let boca = 0;
  const audio = datos[i];
  if (c.audioDisponible && audio && t >= c.inicioAudio && t < c.fin) {
    const espectro = visualizeAudio({ fps: FPS, frame: frame - desde(c.inicioAudio), audioData: audio, numberOfSamples: 32, smoothing: true });
    const bajos = espectro.slice(0, 12);
    boca = Math.max(0, Math.min(1, (bajos.reduce((a, b) => a + b, 0) / bajos.length) * 30 - 0.08));
  }
  return (
    <Mascota
      pose={c.mascota.pose}
      animacion={c.mascota.animacion}
      globo={c.mascota.globo ?? null}
      frameLocal={frame - desde(c.inicio)}
      t={t}
      boca={boca}
      ancla={DERECHA}
      anclaAnterior={DERECHA}
      objetivo={{ x: PANEL.x + 700 * PANEL.escala, y: PANEL.y + 200 * PANEL.escala }}
      colorAcento={ROJO_DA}
      fuente={ANTON}
      espejoCompleto={false}
      globoArriba={890}
      pulso={pulsoBpm(t, BPM)}
    />
  );
};

const BarraProgreso: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 292, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.15)" }}>
      <div style={{ width: `${(frame / (durationInFrames - 1)) * 100}%`, height: "100%", borderRadius: 3, background: DEGRADADO, boxShadow: "0 0 12px rgba(204,35,40,0.8)" }} />
    </div>
  );
};

const ESQ_DER = { x: 912, y: 560 };
const STICKERS = [
  { id: "c01", emoji: "🤔", x: 912, y: 420, t0: c01.inicio + 0.4, vida: 1.3 },
  { id: "c04", emoji: "👀", x: 912, y: 420, t0: c04.inicio + 0.2, vida: 1.3 },
  { id: "c05c", emoji: "💸", ...ESQ_DER, t0: T.fuga + 0.1, vida: 1.2 },
  { id: "c07b", emoji: "🔥", ...ESQ_DER, t0: T.calientes, vida: 1.1 },
  { id: "c07d", emoji: "📅", x: 912, y: 420, t0: T.quince, vida: c07d.fin - T.quince },
  { id: "c08", emoji: "💬", x: 912, y: 640, t0: c08.inicio + 0.5, vida: c08.duracion - 0.5 },
];

// ---------- Sonido ----------
type Efecto = { nombre: string; archivo: string; t: number; dur: number; volumen: number | null };
const D: Record<string, number> = {
  clac: 0.26, ding: 0.9, riser: 1.5, "tic-tac": 1.2, "motor-enciende": 1.6,
  "whoosh-a": 0.5, "whoosh-b": 0.48, "whoosh-c": 0.5,
  "mk-pop": 0.5, "mk-hit": 1.0, "mk-swipe": 0.7, "mk-whoosh-zoom": 0.8,
  "mitos/sello": 0.7, "mitos/moneda": 1.0, "mitos/chorro": 1.2, "mitos/ventila": 1.2, "mitos/goteo": 1.0, "mitos/zumbador": 0.55, "mitos/acierto": 0.9,
  "viaje/brillo": 0.9, "viaje/hielo": 1.0, "viaje/aire": 0.9,
};
const efecto = (nombre: string, archivo: string, t: number, volumen: number | null = null): Efecto => ({ nombre, archivo, t, dur: D[archivo] ?? 0.5, volumen });
const EFECTOS: Efecto[] = [
  efecto("Hit gancho", "mk-hit", 0),
  efecto("Moneda gira", "mitos/moneda", 0.05, 0.4),
  efecto("Título gancho", "mk-swipe", c01.inicio + 0.12),
  efecto("Moneda cae", "mitos/moneda", c01.fin - 0.3, 0.35),
  ...T_TARJETAS.map((tt, k) => efecto(`Pop tarjeta ${k + 1}`, "mk-pop", tt)),
  // Cuenta regresiva de cada pregunta.
  ...PREGUNTAS.map((p, k) => efecto(`Tic-tac pregunta ${k + 1}`, "tic-tac", p.desde, 0.28)),
  // Cada sello: golpe de goma + zumbador (mito) o campanita (realidad).
  ...SELLOS.flatMap((s, k) => [efecto(`Sello ${k + 1}`, "mitos/sello", s.t0, 0.6), efecto(`${s.tipo === "mito" ? "Zumbador" : "Acierto"} ${k + 1}`, s.tipo === "mito" ? "mitos/zumbador" : "mitos/acierto", s.t0 + 0.1, 0.35)]),
  efecto("Motor arranca", "motor-enciende", T.suave - 0.3, 0.3),
  efecto("Chorro premium", "mitos/chorro", T.premium, 0.35),
  efecto("Potencia", "mk-whoosh-zoom", T.potencia),
  efecto("Riser bucle 1", "riser", c04.inicio - D.riser),
  efecto("Título sorpresa", "mk-swipe", c04.inicio + 0.12),
  efecto("Manual", "mk-swipe", T.manual - 0.1),
  efecto("Ventila", "mitos/ventila", B5b + 0.1, 0.35),
  efecto("Lata de gas", "clac", T.recargale),
  efecto("Goteo fuga", "mitos/goteo", T.fuga, 0.45),
  efecto("Reparación", "clac", T.reparala),
  efecto("Ding reparada", "ding", T.reparala + 0.25),
  efecto("Aviso dinero", "mk-swipe", c05c.inicio + 0.6),
  efecto("Riser bucle 2", "riser", c06.inicio - D.riser),
  efecto("Moneda realidad", "mitos/moneda", B6 + 0.1, 0.35),
  efecto("Acierto moneda", "mitos/acierto", T.cierto, 0.35),
  efecto("Título cierto", "mk-swipe", c06.inicio + 0.12),
  efecto("Frío", "viaje/hielo", T.frias, 0.35),
  efecto("Calor", "viaje/aire", T.calientes, 0.3),
  efecto("Ding antes de manejar", "ding", T.antes + 0.1),
  efecto("Hit 15 días", "mk-hit", T.quince),
  efecto("Ding 15 días", "ding", T.quince + 0.12),
  efecto("Botón", "mk-pop", B8 + VENTANA_MORFO),
  ...TRANSFORMACIONES.flatMap((x, k) => [efecto(`Transformación ${k + 1}`, x.sonido, x.t - 0.2), efecto(`Brillo transformación ${k + 1}`, "viaje/brillo", x.t + 0.1, 0.25)]),
  ...STICKERS.map((st) => efecto(`Pop sticker ${st.emoji}`, "mk-pop", st.t0)),
  ...clips.filter((c) => c.mascota.globo).map((c) => efecto(`Pop globo ${c.id}`, "mk-pop", c.inicio + 0.35)),
];
const vozActiva = (t: number) => clips.some((c) => t >= c.voz[0] && t <= c.voz[1]);
const volumenEfecto = (e: Efecto) => (f: number) => e.volumen ?? (vozActiva(e.t + f / FPS) ? 0.35 : 0.45);
const desfasar = (lista: Efecto[]) => {
  const orden = [...lista].sort((a, b) => a.t - b.t);
  for (let i = 1; i < orden.length; i++) {
    if (orden[i].t - orden[i - 1].t < 2 / FPS) orden[i] = { ...orden[i], t: orden[i - 1].t + 3 / FPS };
  }
  return orden;
};
const repartirEnPistas = (lista: Efecto[]) => {
  const pistas: Efecto[][] = [];
  for (const e of lista) {
    const libre = pistas.find((p) => p[p.length - 1].t + p[p.length - 1].dur <= e.t);
    if (libre) libre.push(e);
    else pistas.push([e]);
  }
  return pistas;
};
const volumenMusica = (total: number) => (f: number) => {
  const t = f / FPS;
  const r = 5 / FPS;
  const duck = Math.max(0, ...clips.map(({ voz: [a, b] }) => (t < a - r || t > b + r ? 0 : t < a ? (t - (a - r)) / r : t > b ? 1 - (t - b) / r : 1)));
  let base = 0.12 - 0.05 * duck;
  if ((t < 1 && duck === 0) || t > total - 1) base = Math.max(base, 0.2);
  return base * Math.max(0, Math.min(1, t / 0.5, (total - t) / 1));
};
const RAPIDOS: [number, number][] = TRANSFORMACIONES.map((x) => [x.t - VENTANA_MORFO, x.t + VENTANA_MORFO]);

export const TemaMitos: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / FPS;
  const lineas = clips.flatMap((c) => c.lineas);
  const rapido = RAPIDOS.some(([a, b]) => t >= a && t <= b);
  const escenario = <Escenario t={t} />;
  const titulo = clips.find((c) => c.pantalla && t >= c.inicio - 0.1 && t < c.fin + 0.4);
  return (
    <AbsoluteFill style={{ background: "#08080a" }}>
      {rapido ? (
        <CameraMotionBlur samples={5} shutterAngle={180}>
          {escenario}
        </CameraMotionBlur>
      ) : (
        escenario
      )}
      <Tarjetas t={t} />
      <EtiquetaSeccion t={t} />
      <Pregunta t={t} />
      <SelloAnimado t={t} />
      <Insignia t={t} t0={T.treinta} t1={B3c - 0.1} texto="30 SEGUNDOS ✓" x={560} y={790} color={VERDE_REALIDAD} />
      <Insignia t={t} t0={T.demas + 0.1} t1={c07c.inicio} texto="+4 PSI DE MÁS" x={560} y={790} color={ROJO_MITO} />
      <Insignia t={t} t0={T.antes} t1={B7d - 0.1} texto="EN FRÍO ✓" x={600} y={790} color={VERDE_REALIDAD} />
      <DatoCalendario t={t} />
      {titulo ? (
        <div style={{ position: "absolute", left: 50, right: 50, top: 724, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TituloMascara texto={titulo.pantalla ?? ""} resaltar={titulo.pantallaResaltar ?? []} t={t} t0={titulo.inicio + 0.12} t1={titulo.fin - 0.15} tamano={74} />
        </div>
      ) : null}
      {clips.filter((c) => c.aviso).map((c) => (
        <FranjaMascara key={c.id} texto={c.aviso ?? ""} t={t} t0={c.inicio + 0.6} t1={c.fin + 0.1} arriba={772} />
      ))}
      <Boton t={t} />
      <Rafaga x={540} y={796} t={t} t0={B8 + VENTANA_MORFO} radio={320} color={ROJO_DA} lineas={16} />
      {STICKERS.map((st) => (
        <Sticker key={st.id} emoji={st.emoji} x={st.x} y={st.y} t={t} t0={st.t0} vida={st.vida} tamano={100} />
      ))}

      <MascotaAnimada />
      <AcabadoPremium frame={frame} calidez={0.8} />
      <BarraProgreso />
      <Img src={staticFile("logo-doctor-auto.png")} alt={guion.marcaDeAgua} style={{ position: "absolute", left: 80, top: 308, height: 30, opacity: 0.55 }} />

      <SubtitulosDA lineas={lineas} desde={0} hasta={c08.inicio} arriba={885} alto={265} tamano={52} izquierda={70} derecha={520} sostenerFinal={false} />
      <SubtitulosDA lineas={lineas} desde={c08.inicio} hasta={Infinity} arriba={880} alto={80} tamano={46} izquierda={70} derecha={70} sostenerFinal />

      <Track name="Voz">
        {clips.map((c) =>
          c.audioDisponible ? (
            <Sequence key={c.id} name={`Voz ${c.id}`} from={desde(c.inicioAudio)} durationInFrames={Math.ceil(c.duracionAudio * FPS)}>
              <Audio src={staticFile(`audio/mitos/${c.archivo}`)} volume={1} />
            </Sequence>
          ) : null,
        )}
      </Track>
      {hayMusica ? <Audio src={staticFile("musica.mp3")} loop volume={volumenMusica(durationInFrames / FPS)} /> : null}
      {repartirEnPistas(desfasar(EFECTOS)).map((lista, k) => (
        <Track key={k} name={`Efectos ${k + 1}`}>
          {lista.map((e) => (
            <Sequence key={e.nombre} name={e.nombre} from={Math.max(0, desde(e.t))} durationInFrames={Math.max(1, desde(e.dur))}>
              <Audio src={staticFile(`sfx/${e.archivo}.wav`)} volume={volumenEfecto(e)} />
            </Sequence>
          ))}
        </Track>
      ))}
    </AbsoluteFill>
  );
};

export { duracionVoz };
