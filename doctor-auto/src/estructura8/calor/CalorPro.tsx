// Tema «calor»: «¿Se calentó tu auto en carretera? Haz esto». Guía de emergencia en 4
// pasos con tomas reales (ElevenLabs/Kling), cronómetro 3D, música real y la voz DOCTOR AUTO.
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { construirClips, momentoEnClip, type Clip, type GuionClips } from "../../doctor-auto/clips";
import { BarraProgreso, BotonFinal, EtiquetaSeccion, Mezcla, MascotaVoz, type Efecto } from "../../doctor-auto/comunes";
import { ROJO_DA } from "../../doctor-auto/constantes";
import { Rafaga, Sticker } from "../../doctor-auto/Emociones";
import { AcabadoPremium, FranjaMascara, TituloMascara } from "../../doctor-auto/premium";
import { ChipVidrio, Destello, Insignia, Legibilidad, NumeroGrande, Senal, Tomas, type Toma } from "../../doctor-auto/pro";
import { SubtitulosDA } from "../../doctor-auto/Texto";
import { Cronometro3D, Escena3D } from "../../doctor-auto/tres";
import { Onomatopeya } from "../ruidos/Mundo";
import duraciones from "./duraciones.json";
import guionJson from "./guion.json";

const guion = guionJson as unknown as GuionClips;
const FPS = guion.fps;
const { clips, duracionTotal } = construirClips(guion, duraciones, 0);
export const DURACION_CALOR = duracionTotal;
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
  carretera: en(c01, "carretera"),
  noHagas: en(c01, "No hagas esto"),
  aire: en(c03a, "aire"),
  calefaccion: en(c03a, "calefacción"),
  sacaCalor: en(c03b, "saca calor"),
  orillate: en(c03c, "oríllate"),
  apagalo: en(c03c, "apágalo"),
  nunca: en(c05a, "nunca abras"),
  quemar: en(c05b, "quemar"),
  treinta: en(c05c, "treinta"),
  anti: en(c07a, "anticongelante"),
  fuga: en(c07b, "fuga"),
  bomba: en(c07c, "bomba de agua"),
  termostato: en(c07c, "termostato"),
  pesos: en(c07d, "treinta mil pesos"),
};
const [L02, L03a, L03c, L04, L05a, L05c, L06, L07a, L07b, L07c, L07d, L08] = [c02, c03a, c03c, c04, c05a, c05c, c06, c07a, c07b, c07c, c07d, c08].map(limite);

const TOMAS: Toma[] = [
  { nombre: "Medidor en rojo", archivo: "real/k1-medidor.mp4", desde: 0, hasta: L02, zoom: [1.0, 1.18], foco: [50, 45] },
  { nombre: "Auto echando vapor", archivo: "real/v1-varado.mp4", desde: L02, hasta: L03a, zoom: [1.05, 1.18], foco: [40, 45], inicioClip: 1.5 },
  { nombre: "Calefacción", archivo: "real/k2-calefaccion.mp4", desde: L03a, hasta: L03c, zoom: [1.0, 1.15], foco: [50, 45], velocidad: 0.9 },
  { nombre: "Orillarse", archivo: "real/k3-orillarse.mp4", desde: L03c, hasta: L04, zoom: [1.02, 1.12], foco: [50, 55] },
  { nombre: "Radiador (oscuro)", archivo: "real/k4-radiador.mp4", desde: L04, hasta: L05a, zoom: [1.25, 1.3], foco: [50, 45], desenfoque: 10, filtro: "brightness(0.45)", velocidad: 0.6 },
  { nombre: "Radiador con vapor", archivo: "real/k4-radiador.mp4", desde: L05a, hasta: L05c, zoom: [1.0, 1.18], foco: [50, 45], velocidad: 0.8, inicioClip: 0.6 },
  { nombre: "Esperar", archivo: "real/k3-orillarse.mp4", desde: L05c, hasta: L06, zoom: [1.15, 1.22], foco: [50, 55], velocidad: 0.4, inicioClip: 3, desenfoque: 12, filtro: "brightness(0.5)" },
  { nombre: "Fuga (oscuro)", archivo: "real/k5-fuga.mp4", desde: L06, hasta: L07a, zoom: [1.25, 1.3], foco: [50, 60], desenfoque: 10, filtro: "brightness(0.45)" },
  { nombre: "Depósito", archivo: "real/v6-cofre.mp4", desde: L07a, hasta: L07b, zoom: [1.1, 1.25], foco: [80, 65], inicioClip: 1.5 },
  { nombre: "Fuga", archivo: "real/k5-fuga.mp4", desde: L07b, hasta: L07c, zoom: [1.0, 1.14], foco: [50, 60], inicioClip: 1 },
  { nombre: "Bomba y termostato", archivo: "real/k6-bomba.mp4", desde: L07c, hasta: L07d, zoom: [1.0, 1.12], foco: [50, 45] },
  { nombre: "Dinero", archivo: "real/k6-bomba.mp4", desde: L07d, hasta: L08, zoom: [1.2, 1.3], foco: [50, 45], velocidad: 0.4, inicioClip: 2.5, desenfoque: 14, filtro: "brightness(0.45) saturate(0.6)" },
  { nombre: "Carretera feliz", archivo: "real/v2-carretera.mp4", desde: L08, hasta: duracionTotal, zoom: [1.05, 1.15], foco: [50, 50] },
];
const CORTES = TOMAS.slice(1).map((tm) => tm.desde);

const SECCIONES = [
  { n: 1, texto: "CALEFACCIÓN AL MÁXIMO", desde: L03a + 0.1, hasta: L03c },
  { n: 2, texto: "ORÍLLATE Y APÁGALO", desde: L03c + 0.1, hasta: L04 },
  { n: 3, texto: "NO ABRAS EL RADIADOR", desde: L05a + 0.1, hasta: L06 },
  { n: 4, texto: "REVISA EL ANTICONGELANTE", desde: L07a + 0.1, hasta: L07d },
];

const STICKERS = [
  { id: "c01", emoji: "🥵", x: 912, y: 560, t0: T.carretera, vida: 1.3 },
  { id: "c03b", emoji: "🤯", x: 912, y: 560, t0: T.sacaCalor, vida: 1.2 },
  { id: "c05b", emoji: "🔥", x: 912, y: 560, t0: T.quemar, vida: 1.1 },
  { id: "c07d", emoji: "💸", x: 912, y: 560, t0: T.pesos, vida: c07d.fin - T.pesos },
  { id: "c08", emoji: "💬", x: 912, y: 640, t0: c08.inicio + 0.5, vida: c08.duracion - 0.5 },
];

// Golpe rojo de alarma en el gancho y al decir "nunca".
const alarma = (t: number) => {
  const golpes = [0.05, T.nunca];
  return Math.max(0, ...golpes.map((g) => (t >= g && t < g + 0.45 ? 1 - (t - g) / 0.45 : 0)));
};

const D: Record<string, number> = {
  clac: 0.26, ding: 0.9, riser: 1.5, "tic-tac": 1.2, "mk-pop": 0.5, "mk-hit": 1.0, "mk-swipe": 0.7, "mk-whoosh-zoom": 0.8, "mk-error": 0.6,
  "whoosh-a": 0.5, "whoosh-b": 0.48, "whoosh-c": 0.5, "viaje/aire": 0.9, "viaje/brillo": 0.9, "mitos/goteo": 1.0, "mitos/ventila": 1.2, "mitos/zumbador": 0.55, "mitos/sello": 0.7, error: 0.6,
};
const ef = (nombre: string, archivo: string, t: number, volumen: number | null = null): Efecto => ({ nombre, archivo, t, dur: D[archivo] ?? 0.5, volumen });
const WHOOSH = ["whoosh-a", "whoosh-b", "whoosh-c", "mk-whoosh-zoom"];
const EFECTOS: Efecto[] = [
  ef("Hit gancho", "mk-hit", 0),
  ef("Alarma", "mitos/zumbador", 0.1, 0.3),
  ef("Título gancho", "mk-swipe", c01.inicio + 0.12),
  ef("No hagas esto", "mitos/sello", T.noHagas, 0.45),
  ...CORTES.map((c, k) => ef(`Corte ${k + 1}`, WHOOSH[k % WHOOSH.length], c - 0.18)),
  ef("Vapor del auto", "viaje/aire", L02 + 0.1, 0.35),
  ef("Perilla", "clac", T.aire),
  ef("Calefacción", "mitos/ventila", T.calefaccion, 0.35),
  ef("Orillarse", "clac", T.apagalo),
  ef("Riser bucle 1", "riser", c04.inicio - D.riser),
  ef("Título importante", "mk-swipe", c04.inicio + 0.12),
  ef("Nunca", "mk-hit", T.nunca),
  ef("Vapor radiador", "viaje/aire", L05a + 0.05, 0.5),
  ef("Quemar", "mk-error", T.quemar, 0.3),
  ef("Cronómetro", "viaje/brillo", L05c + 0.05, 0.3),
  ef("Tic-tac", "tic-tac", T.treinta, 0.3),
  ef("Aviso agua fría", "mk-swipe", c05c.inicio + 0.6),
  ef("Riser bucle 2", "riser", c06.inicio - D.riser),
  ef("Título seguido", "mk-swipe", c06.inicio + 0.12),
  ef("Anticongelante", "clac", T.anti),
  ef("Goteo", "mitos/goteo", T.fuga - 0.2, 0.45),
  ef("Bomba", "mk-pop", T.bomba),
  ef("Termostato", "mk-pop", T.termostato),
  ef("Hit dinero", "mk-hit", T.pesos),
  ef("Ding dinero", "ding", T.pesos + 0.12),
  ef("Botón", "mk-pop", c08.inicio + 0.3),
  ...STICKERS.map((s) => ef(`Sticker ${s.emoji}`, "mk-pop", s.t0)),
];

export const TemaCalor: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / FPS;
  const lineas = clips.flatMap((c) => c.lineas);
  const titulo = clips.find((c) => c.pantalla && t >= c.inicio - 0.1 && t < c.fin + 0.4);
  const enCrono = t >= L05c - 0.05 && t < L06 + 0.2;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Tomas tomas={TOMAS} t={t} />
      {enCrono ? (
        <AbsoluteFill style={{ opacity: Math.min(resorte(t, L05c), 1 - rampa(t, L06 - 0.12, L06 + 0.15)) }}>
          <Escena3D>
            <Cronometro3D giro={-0.6 + 0.9 * rampa(t, L05c, L06)} avance={rampa(t, T.treinta, T.treinta + 1.1)} x={0} y={1.05} escala={0.42 * resorte(t, L05c, 12)} />
          </Escena3D>
        </AbsoluteFill>
      ) : null}
      {alarma(t) > 0 ? <AbsoluteFill style={{ background: ROJO_DA, opacity: 0.35 * alarma(t), mixBlendMode: "screen" }} /> : null}
      <Destello t={t} cortes={CORTES} />
      <Legibilidad />

      <EtiquetaSeccion t={t} secciones={SECCIONES} />
      <Senal t={t} t0={T.carretera} t1={L02} x={540} y={760} texto="🌡️ ZONA ROJA" lado="der" alto={-220} color="#b3121a" />
      <ChipVidrio t={t} t0={c02.inicio + 0.3} t1={L03a + 0.05} texto="🛟 4 pasos para salvar tu motor" x={70} y={440} />
      <Insignia t={t} t0={T.aire} t1={T.calefaccion} texto="❄️ AIRE: APAGADO" x={300} y={790} />
      <Insignia t={t} t0={T.calefaccion} t1={L03c - 0.05} texto="🔥 CALEFACCIÓN: AL MÁXIMO" x={170} y={790} />
      <ChipVidrio t={t} t0={T.sacaCalor} t1={L03c} texto="Le quita calor al motor 🤯" x={70} y={440} />
      <Senal t={t} t0={T.orillate} t1={L04} x={540} y={900} texto="⚠️ INTERMITENTES" lado="izq" alto={-330} />
      <Insignia t={t} t0={T.apagalo} t1={L04 - 0.05} texto="🔑 APÁGALO" x={600} y={790} />
      <Insignia t={t} t0={T.nunca} t1={L05c - 0.05} texto="✋ NUNCA LO ABRAS CALIENTE" x={150} y={790} color="#b3121a" />
      <Senal t={t} t0={c05b.inicio + 0.2} t1={L05c} x={540} y={700} texto="+100 °C" lado="der" alto={-200} color="#b3121a" />
      <Senal t={t} t0={T.anti} t1={L07b} x={870} y={1250} texto="NIVEL: MIN – MAX" lado="izq" alto={-700} color="#16924f" />
      <Senal t={t} t0={T.fuga} t1={L07c} x={540} y={1000} texto="💧 FUGA" lado="der" alto={-360} color="#16924f" />
      <ChipVidrio t={t} t0={T.bomba} t1={L07d} texto="🔧 Bomba de agua" x={70} y={440} />
      <ChipVidrio t={t} t0={T.termostato} t1={L07d} texto="🌡️ Termostato" x={70} y={530} />
      <NumeroGrande t={t} t0={T.pesos - 0.05} t1={L08} numero="$30,000" unidad="O MÁS" arriba={440} />

      {titulo ? (
        <div style={{ position: "absolute", left: 50, right: 50, top: 724, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TituloMascara texto={titulo.pantalla ?? ""} resaltar={titulo.pantallaResaltar ?? []} t={t} t0={titulo.inicio + 0.12} t1={titulo.fin - 0.15} tamano={76} />
        </div>
      ) : null}
      {clips.filter((c) => c.aviso).map((c) => (
        <FranjaMascara key={c.id} texto={c.aviso ?? ""} t={t} t0={c.inicio + 0.6} t1={c.fin + 0.1} arriba={772} />
      ))}
      <Onomatopeya texto="¡PSSSHHH!" x={560} y={500} t={t} t0={L05a + 0.1} vida={1} giro={-6} />
      <BotonFinal t={t} t0={c08.inicio + 0.25} texto={c08.boton ?? "Comenta CALOR 👇"} />
      <Rafaga x={540} y={796} t={t} t0={c08.inicio + 0.25} radio={320} color={ROJO_DA} lineas={16} />
      {STICKERS.map((s) => (
        <Sticker key={s.id} emoji={s.emoji} x={s.x} y={s.y} t={t} t0={s.t0} vida={s.vida} tamano={100} />
      ))}

      <MascotaVoz clips={clips} carpeta="audio/calor" pausa={guion.pausaEntreClipsSegundos} bpm={guion.bpm ?? null} />
      <AcabadoPremium frame={frame} calidez={0.9} />
      <BarraProgreso />
      <Img src={staticFile("logo-doctor-auto.png")} alt="doctor auto" style={{ position: "absolute", left: 80, top: 308, height: 30, opacity: 0.6 }} />
      <SubtitulosDA lineas={lineas} desde={0} hasta={c08.inicio} arriba={885} alto={265} tamano={52} izquierda={70} derecha={520} sostenerFinal={false} />
      <SubtitulosDA lineas={lineas} desde={c08.inicio} hasta={Infinity} arriba={880} alto={80} tamano={46} izquierda={70} derecha={70} sostenerFinal />

      <Mezcla clips={clips} carpeta="audio/calor" musica="real/musica-calor.mp3" efectos={EFECTOS} total={durationInFrames / FPS} />
    </AbsoluteFill>
  );
};
