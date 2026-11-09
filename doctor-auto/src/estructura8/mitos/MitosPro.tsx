// Tema «mitos» versión pro: estilo show de juego. Moneda 3D MITO/REALIDAD, tomas reales
// (ElevenLabs/Kling) de cada creencia, cuenta regresiva para adivinar, sello que cae en
// su palabra, música real y la voz DOCTOR AUTO.
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { construirClips, momentoEnClip, type Clip, type GuionClips } from "../../doctor-auto/clips";
import { BarraProgreso, BotonFinal, EtiquetaSeccion, Mezcla, MascotaVoz, type Efecto } from "../../doctor-auto/comunes";
import { POPPINS, PESO_POPPINS, ROJO_DA } from "../../doctor-auto/constantes";
import { Rafaga, Sticker } from "../../doctor-auto/Emociones";
import { AcabadoPremium, FranjaMascara, TituloMascara } from "../../doctor-auto/premium";
import { ChipVidrio, Destello, Insignia, Legibilidad, NumeroGrande, Senal, Tomas, type Toma } from "../../doctor-auto/pro";
import { SubtitulosDA } from "../../doctor-auto/Texto";
import { Escena3D, Moneda3D } from "../../doctor-auto/tres";
import { Sello, VERDE_REALIDAD } from "./Escenas";
import duraciones from "./duraciones.json";
import guionJson from "./guion.json";

const guion = guionJson as unknown as GuionClips;
const FPS = guion.fps;
const { clips, duracionTotal } = construirClips(guion, duraciones, 0);
export const DURACION_MITOS_PRO = duracionTotal;
const clip = (id: string) => clips.find((c) => c.id === id) as Clip;
const en = (c: Clip, frase: string) => Math.min(Math.max(momentoEnClip(c, frase), c.inicio), c.fin - 0.2);
const limite = (c: Clip) => c.inicio - guion.pausaEntreClipsSegundos / 2;
const resorte = (t: number, t0: number, damping = 13, stiffness = 180) =>
  t < t0 ? 0 : spring({ frame: Math.round((t - t0) * FPS), fps: FPS, config: { damping, stiffness } });
const suave = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const rampa = (t: number, a: number, b: number) => suave(Math.max(0, Math.min(1, (t - a) / (b - a))));

const [c01, c02, c03a, c03b, c03c, c04, c05a, c05b, c05c, c06, c07a, c07b, c07c, c07d, c08] = [
  "c01", "c02", "c03a", "c03b", "c03c", "c04", "c05a", "c05b", "c05c", "c06", "c07a", "c07b", "c07c", "c07d", "c08",
].map(clip);
const T = {
  caro: en(c01, "salir caro"),
  diez: en(c03a, "diez minutos"),
  treinta: en(c03b, "treinta"),
  premium: en(c03c, "premium"),
  potencia: en(c03c, "potencia"),
  manual: en(c05a, "manual"),
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
const [L03a, L03c, L05a, L05b, L05c, L06, L07a, L07c, L07d, L08] = [c03a, c03c, c05a, c05b, c05c, c06, c07a, c07c, c07d, c08].map(limite);
const SELLOS = [
  { t0: c03b.voz[0], tipo: "mito" as const, hasta: L03c },
  { t0: c05a.voz[0], tipo: "mito" as const, hasta: L05b },
  { t0: c05c.voz[0], tipo: "mito" as const, hasta: L06 },
  { t0: c07b.voz[0], tipo: "realidad" as const, hasta: L07c + 0.5 },
];
const PREGUNTAS = [
  { desde: c03a.inicio + 0.2, hasta: SELLOS[0].t0 },
  { desde: c03c.inicio + 0.2, hasta: SELLOS[1].t0 },
  { desde: c05b.inicio + 0.2, hasta: SELLOS[2].t0 },
  { desde: c07a.inicio + 0.2, hasta: SELLOS[3].t0 },
];

// ---------- Tomas ----------
const TALLER = "real/i1-taller.png";
const TOMAS: Toma[] = [
  { nombre: "Taller (moneda)", archivo: TALLER, desde: 0, hasta: L03a, zoom: [1.05, 1.28], foco: [50, 45], desenfoque: 3, filtro: "brightness(0.8)" },
  { nombre: "Calentar motor", archivo: "real/m1-calentar.mp4", desde: L03a, hasta: L03c, zoom: [1.02, 1.16], foco: [45, 55], velocidad: 0.8 },
  { nombre: "Gasolinera", archivo: "real/m2-gasolinera.mp4", desde: L03c, hasta: L05a, zoom: [1.0, 1.3], foco: [50, 40], velocidad: 0.83 },
  { nombre: "Fondo manual", archivo: "real/m2-gasolinera.mp4", desde: L05a, hasta: L05b, zoom: [1.3, 1.4], foco: [50, 30], velocidad: 0.3, inicioClip: 3, desenfoque: 14, filtro: "brightness(0.5)" },
  { nombre: "Aire caliente", archivo: "real/m3-aire.mp4", desde: L05b, hasta: L05c, zoom: [1.0, 1.14], foco: [55, 50], velocidad: 0.9 },
  { nombre: "Fuga UV", archivo: "real/m4-fuga.mp4", desde: L05c, hasta: L06, zoom: [1.05, 1.22], foco: [50, 35] },
  { nombre: "Taller (realidad)", archivo: TALLER, desde: L06, hasta: L07a, zoom: [1.2, 1.3], foco: [50, 45], desenfoque: 3, filtro: "brightness(0.7) hue-rotate(95deg) saturate(0.8)" },
  { nombre: "Llanta caliente", archivo: "real/i2-llanta-caliente.png", desde: L07a, hasta: L07c, zoom: [1.0, 1.22], foco: [62, 62], paneo: [30, -30] },
  { nombre: "Manómetro en frío", archivo: "real/v3-llanta.mp4", desde: L07c, hasta: L07d, zoom: [1.05, 1.16], foco: [50, 42], filtro: "hue-rotate(-10deg)" },
  { nombre: "Taller (dato)", archivo: TALLER, desde: L07d, hasta: L08, zoom: [1.15, 1.25], foco: [50, 50], desenfoque: 12, filtro: "brightness(0.55)" },
  { nombre: "Taller (final)", archivo: TALLER, desde: L08, hasta: duracionTotal, zoom: [1.05, 1.15], foco: [50, 45], desenfoque: 4, filtro: "brightness(0.75)" },
];
const CORTES = TOMAS.slice(1).map((tm) => tm.desde);

// ---------- Moneda 3D ----------
const giroMoneda = (t: number) => {
  if (t < L03a) return t < c01.fin ? 1440 * (1 - (1 - t / c01.fin) ** 2) : 1440 + (t - c01.fin) * 140;
  if (t < L07a) return 900 * (1 - (1 - Math.min(1, Math.max(0, (t - L06) / (T.cierto + 0.1 - L06)))) ** 3); // cae en REALIDAD (900° = 180° + 2 vueltas)
  return (t - L08) * 200;
};
const MonedaEscena: React.FC<{ t: number }> = ({ t }) => {
  const enGancho = t < L03a + 0.2;
  const enRealidad = t >= L06 - 0.1 && t < L07a + 0.2;
  const enFinal = t >= L08 - 0.1;
  if (!enGancho && !enRealidad && !enFinal) return null;
  const inicio = enGancho ? 0 : enRealidad ? L06 : L08;
  const fin = enGancho ? L03a : enRealidad ? L07a : duracionTotal + 1;
  const entra = inicio === 0 ? 1 : resorte(t, inicio, 12);
  const sale = 1 - rampa(t, fin - 0.12, fin + 0.15);
  // En la introducción la moneda sube y se achica para dejar lugar a las 4 tarjetas.
  const sube = enGancho ? rampa(t, c02.inicio, c02.inicio + 0.5) : 0;
  const y = enFinal ? 1.3 : 1.25 - 0.75 * sube;
  const escala = (enFinal ? 0.4 : 0.6 - 0.18 * sube) * entra;
  return (
    <AbsoluteFill style={{ opacity: sale }}>
      <Escena3D acento={enRealidad ? VERDE_REALIDAD : ROJO_DA}>
        <Moneda3D giro={giroMoneda(t)} inclina={0.18 + 0.06 * Math.sin(t * 1.3)} x={0} y={y} escala={escala} />
      </Escena3D>
    </AbsoluteFill>
  );
};

// ---------- Gráficos ----------
const SelloAnimado: React.FC<{ t: number }> = ({ t }) => {
  const s = SELLOS.find((x) => t >= x.t0 && t < x.hasta);
  if (!s) return null;
  const l = t - s.t0;
  const cae = Math.min(1, l / 0.12);
  const escala = 2.4 - 1.4 * cae * cae;
  const va = rampa(t, s.t0 + 0.95, s.t0 + 1.3);
  const r = 200 * escala * (1 - va) + 58 * va;
  const sale = 1 - rampa(t, s.hasta - 0.15, s.hasta);
  return (
    <>
      {l < 0.18 ? <AbsoluteFill style={{ background: "#fff", opacity: 0.35 * (1 - l / 0.18) }} /> : null}
      <Sello cx={540 + (160 - 540) * va} cy={600 + (800 - 600) * va} r={r} tipo={s.tipo} opacidad={Math.min(1, cae * 1.5) * sale} giro={-12 + 4 * va} />
    </>
  );
};

const Pregunta: React.FC<{ t: number }> = ({ t }) => {
  const p = PREGUNTAS.find((x) => t >= x.desde && t < x.hasta + 0.1);
  if (!p) return null;
  const entra = resorte(t, p.desde);
  const queda = 1 - Math.max(0, Math.min(1, (t - p.desde) / (p.hasta - p.desde)));
  return (
    <div style={{ position: "absolute", left: 70, top: 436, overflow: "hidden", borderRadius: 22 }}>
      <div style={{ transform: `translateY(${(1 - entra) * 110}%)`, background: "rgba(20,20,24,0.45)", border: "2px solid rgba(255,255,255,0.3)", backdropFilter: "blur(16px)", borderRadius: 22, padding: "10px 22px 14px" }}>
        <div style={{ fontFamily: POPPINS, fontWeight: PESO_POPPINS, fontSize: 32, color: "#fff" }}>🤔 ¿MITO O REALIDAD?</div>
        <div style={{ marginTop: 8, height: 9, borderRadius: 5, background: "rgba(255,255,255,0.2)" }}>
          <div style={{ width: `${queda * 100}%`, height: "100%", borderRadius: 5, background: queda > 0.35 ? "#ffcf3a" : "#ff4d4d" }} />
        </div>
      </div>
    </div>
  );
};

const TARJETAS = ["1 🌡️ Calentar", "2 ⛽ Premium", "3 ❄️ Gas del aire", "4 🛞 Presión"];
const PASO = Math.min(0.22, (c02.fin - 0.4 - c02.inicio - 0.2) / 4);
const T_TARJETAS = TARJETAS.map((_, k) => c02.inicio + 0.2 + k * PASO);

const SECCIONES = [
  { n: 1, texto: "CALENTAR EL MOTOR", desde: L03a + 0.1, hasta: L03c },
  { n: 2, texto: "GASOLINA PREMIUM", desde: L03c + 0.1, hasta: L05b },
  { n: 3, texto: "GAS DEL AIRE", desde: L05b + 0.1, hasta: L06 },
  { n: 4, texto: "PRESIÓN DE LLANTAS", desde: L07a + 0.1, hasta: L07d },
];

// Calor que ondula sobre la llanta caliente.
const Calor: React.FC<{ t: number; fuerza: number }> = ({ t, fuerza }) =>
  fuerza <= 0 ? null : (
    <AbsoluteFill style={{ opacity: fuerza, mixBlendMode: "screen", background: `radial-gradient(ellipse at 62% ${64 + 2 * Math.sin(t * 5)}%, rgba(255,90,30,0.45) 0%, rgba(255,90,30,0) 45%)` }} />
  );

const STICKERS = [
  { id: "c01", emoji: "🤔", x: 912, y: 560, t0: c01.inicio + 0.4, vida: 1.3 },
  { id: "c04", emoji: "👀", x: 912, y: 560, t0: c04.inicio + 0.2, vida: 1.3 },
  { id: "c05c", emoji: "💸", x: 912, y: 560, t0: T.fuga + 0.1, vida: 1.2 },
  { id: "c07b", emoji: "🔥", x: 912, y: 560, t0: T.calientes, vida: 1.1 },
  { id: "c07d", emoji: "📅", x: 912, y: 560, t0: T.quince, vida: c07d.fin - T.quince },
  { id: "c08", emoji: "💬", x: 912, y: 640, t0: c08.inicio + 0.5, vida: c08.duracion - 0.5 },
];

// ---------- Sonido ----------
const D: Record<string, number> = {
  clac: 0.26, ding: 0.9, riser: 1.5, "tic-tac": 1.2, "motor-enciende": 1.6,
  "whoosh-a": 0.5, "whoosh-b": 0.48, "whoosh-c": 0.5, "mk-pop": 0.5, "mk-hit": 1.0, "mk-swipe": 0.7, "mk-whoosh-zoom": 0.8,
  "mitos/sello": 0.7, "mitos/moneda": 1.0, "mitos/chorro": 1.2, "mitos/ventila": 1.2, "mitos/goteo": 1.0, "mitos/zumbador": 0.55, "mitos/acierto": 0.9,
  "viaje/brillo": 0.9, "viaje/hielo": 1.0, "viaje/aire": 0.9,
};
const ef = (nombre: string, archivo: string, t: number, volumen: number | null = null): Efecto => ({ nombre, archivo, t, dur: D[archivo] ?? 0.5, volumen });
const WHOOSH = ["whoosh-a", "whoosh-b", "whoosh-c", "mk-whoosh-zoom"];
const EFECTOS: Efecto[] = [
  ef("Hit gancho", "mk-hit", 0),
  ef("Moneda gira", "mitos/moneda", 0.05, 0.4),
  ef("Título gancho", "mk-swipe", c01.inicio + 0.12),
  ef("Moneda cae", "mitos/moneda", c01.fin - 0.3, 0.35),
  ...CORTES.map((c, k) => ef(`Corte ${k + 1}`, WHOOSH[k % WHOOSH.length], c - 0.18)),
  ...T_TARJETAS.map((tt, k) => ef(`Pop tarjeta ${k + 1}`, "mk-pop", tt)),
  ...PREGUNTAS.map((p, k) => ef(`Tic-tac ${k + 1}`, "tic-tac", p.desde, 0.28)),
  ...SELLOS.flatMap((s, k) => [ef(`Sello ${k + 1}`, "mitos/sello", s.t0, 0.6), ef(`${s.tipo === "mito" ? "Zumbador" : "Acierto"} ${k + 1}`, s.tipo === "mito" ? "mitos/zumbador" : "mitos/acierto", s.t0 + 0.1, 0.35)]),
  ef("Motor", "motor-enciende", T.treinta + 0.3, 0.3),
  ef("Chorro premium", "mitos/chorro", T.premium, 0.35),
  ef("Riser bucle 1", "riser", c04.inicio - D.riser),
  ef("Título sorpresa", "mk-swipe", c04.inicio + 0.12),
  ef("Manual", "mk-swipe", T.manual - 0.1),
  ef("Ventila", "mitos/ventila", L05b + 0.1, 0.35),
  ef("Lata de gas", "clac", T.recargale),
  ef("Goteo fuga", "mitos/goteo", T.fuga, 0.45),
  ef("Reparación", "clac", T.reparala),
  ef("Ding reparada", "ding", T.reparala + 0.25),
  ef("Aviso dinero", "mk-swipe", c05c.inicio + 0.6),
  ef("Riser bucle 2", "riser", c06.inicio - D.riser),
  ef("Moneda realidad", "mitos/moneda", L06 + 0.1, 0.35),
  ef("Acierto moneda", "mitos/acierto", T.cierto, 0.35),
  ef("Título cierto", "mk-swipe", c06.inicio + 0.12),
  ef("Frío", "viaje/hielo", T.frias, 0.35),
  ef("Calor", "viaje/aire", T.calientes, 0.3),
  ef("Ding antes", "ding", T.antes + 0.1),
  ef("Hit 15 días", "mk-hit", T.quince),
  ef("Ding 15 días", "ding", T.quince + 0.12),
  ef("Botón", "mk-pop", c08.inicio + 0.3),
  ...STICKERS.map((s) => ef(`Sticker ${s.emoji}`, "mk-pop", s.t0)),
];

export const TemaMitosPro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / FPS;
  const lineas = clips.flatMap((c) => c.lineas);
  const titulo = clips.find((c) => c.pantalla && t >= c.inicio - 0.1 && t < c.fin + 0.4);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Tomas tomas={TOMAS} t={t} />
      <Calor t={t} fuerza={t >= SELLOS[3].t0 && t < L07c ? rampa(t, SELLOS[3].t0, T.demas) : 0} />
      <MonedaEscena t={t} />
      <Destello t={t} cortes={CORTES} />
      <Legibilidad />

      {TARJETAS.map((txt, k) => (
        <ChipVidrio key={txt} t={t} t0={T_TARJETAS[k]} t1={L03a + 0.05} texto={txt} x={k % 2 === 0 ? 70 : 560} y={360 + Math.floor(k / 2) * 92} tamano={34} />
      ))}
      <EtiquetaSeccion t={t} secciones={SECCIONES} />
      <Pregunta t={t} />
      <SelloAnimado t={t} />
      <Insignia t={t} t0={T.treinta} t1={L03c - 0.1} texto="30 SEGUNDOS ✓" x={560} y={790} color={VERDE_REALIDAD} />
      <Senal t={t} t0={T.diez} t1={SELLOS[0].t0} x={560} y={900} texto="⏱️ 10 MIN" lado="der" alto={-260} />
      <ChipVidrio t={t} t0={T.potencia} t1={L05a} texto="⚡ ¿MÁS POTENCIA?" x={560} y={540} />
      <NumeroGrande t={t} t0={T.manual - 0.05} t1={L05b} numero="87" unidad="OCTANOS · MAGNA ✓" arriba={430} />
      <ChipVidrio t={t} t0={T.manual + 0.4} t1={L05b} texto="📖 Premium solo si tu manual la pide" x={80} y={760} tamano={32} />
      <Senal t={t} t0={c05b.inicio + 0.4} t1={SELLOS[2].t0} x={560} y={900} texto="🌡️ 32°C ✗" lado="izq" alto={-300} color="#b3121a" />
      <Senal t={t} t0={T.fuga} t1={L06} x={600} y={760} texto="FUGA" lado="der" alto={-220} color="#16924f" />
      <Insignia t={t} t0={T.reparala} t1={L06 - 0.05} texto="REPÁRALA PRIMERO ✓" x={300} y={600} color={VERDE_REALIDAD} />
      <Senal t={t} t0={T.frias} t1={SELLOS[3].t0} x={760} y={1010} texto="❄️ EN FRÍO: 32 PSI" lado="izq" alto={-430} color="#1e6fd1" />
      <Senal t={t} t0={T.calientes} t1={L07c} x={760} y={1010} texto="🔥 CALIENTE: 36 PSI" lado="izq" alto={-430} color="#b3121a" />
      <Insignia t={t} t0={T.demas + 0.1} t1={L07c} texto="+4 PSI DE MÁS" x={560} y={790} />
      <Insignia t={t} t0={T.antes} t1={L07d - 0.05} texto="ANTES DE MANEJAR ✓" x={420} y={790} color={VERDE_REALIDAD} />
      <NumeroGrande t={t} t0={T.quince - 0.05} t1={L08} numero="15" unidad="DÍAS" arriba={440} />

      {titulo ? (
        <div style={{ position: "absolute", left: 50, right: 50, top: 724, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TituloMascara texto={titulo.pantalla ?? ""} resaltar={titulo.pantallaResaltar ?? []} t={t} t0={titulo.inicio + 0.12} t1={titulo.fin - 0.15} tamano={76} />
        </div>
      ) : null}
      {clips.filter((c) => c.aviso).map((c) => (
        <FranjaMascara key={c.id} texto={c.aviso ?? ""} t={t} t0={c.inicio + 0.6} t1={c.fin + 0.1} arriba={772} />
      ))}
      <BotonFinal t={t} t0={c08.inicio + 0.25} texto={c08.boton ?? "Comenta MITO 👇"} />
      <Rafaga x={540} y={796} t={t} t0={c08.inicio + 0.25} radio={320} color={ROJO_DA} lineas={16} />
      {STICKERS.map((s) => (
        <Sticker key={s.id} emoji={s.emoji} x={s.x} y={s.y} t={t} t0={s.t0} vida={s.vida} tamano={100} />
      ))}

      <MascotaVoz clips={clips} carpeta="audio/mitos" pausa={guion.pausaEntreClipsSegundos} bpm={guion.bpm ?? null} />
      <AcabadoPremium frame={frame} calidez={0.7} />
      <BarraProgreso />
      <Img src={staticFile("logo-doctor-auto.png")} alt="doctor auto" style={{ position: "absolute", left: 80, top: 308, height: 30, opacity: 0.6 }} />
      <SubtitulosDA lineas={lineas} desde={0} hasta={c08.inicio} arriba={885} alto={265} tamano={52} izquierda={70} derecha={520} sostenerFinal={false} />
      <SubtitulosDA lineas={lineas} desde={c08.inicio} hasta={Infinity} arriba={880} alto={80} tamano={46} izquierda={70} derecha={70} sostenerFinal />

      <Mezcla clips={clips} carpeta="audio/mitos" musica="real/musica-mitos.mp3" efectos={EFECTOS} total={durationInFrames / FPS} />
    </AbsoluteFill>
  );
};
