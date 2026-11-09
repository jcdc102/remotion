// Tema «adivina»: «Adivina el ruido» (concurso). Suena una falla real, la bocina 3D vibra,
// cuenta regresiva 3-2-1 para comentar y después la respuesta con la toma real de la pieza.
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { construirClips, momentoEnClip, type Clip, type GuionClips } from "../../doctor-auto/clips";
import { BarraProgreso, BotonFinal, Mezcla, MascotaVoz, type Efecto } from "../../doctor-auto/comunes";
import { ANTON, DEGRADADO, ROJO_DA } from "../../doctor-auto/constantes";
import { Rafaga, Sticker } from "../../doctor-auto/Emociones";
import { AcabadoPremium, TituloMascara } from "../../doctor-auto/premium";
import { ChipVidrio, Destello, Insignia, Legibilidad, Senal, Tomas, type Toma } from "../../doctor-auto/pro";
import { SubtitulosDA } from "../../doctor-auto/Texto";
import { Bocina3D, Escena3D } from "../../doctor-auto/tres";
import { Onomatopeya } from "../ruidos/Mundo";
import duraciones from "./duraciones.json";
import guionJson from "./guion.json";

const guion = guionJson as unknown as GuionClips;
const FPS = guion.fps;
const { clips, duracionTotal } = construirClips(guion, duraciones, 0.9);
export const DURACION_ADIVINA = duracionTotal;
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
const [L02, L03a, L04, L05a, L06, L07a, L07d, L08] = [c02, c03a, c04, c05a, c06, c07a, c07d, c08].map(limite);

// Tres rondas: pregunta (c0Xa), ruido + cuenta regresiva (antes de la voz de c0Xb) y respuesta.
const RONDAS = [
  { n: 1, pregunta: c03a, respuesta: c03b, extra: c03c, ruido: "chillido-banda", fin: L04, pieza: "LA BANDA", toma: "real/a1-banda.mp4" },
  { n: 2, pregunta: c05a, respuesta: c05b, extra: c05c, ruido: "clic-homocinetica", fin: L06, pieza: "JUNTA HOMOCINÉTICA", toma: "real/a2-homocinetica.mp4" },
  { n: 3, pregunta: c07a, respuesta: c07b, extra: c07c, ruido: "rechinido-frenos", fin: L07d, pieza: "LAS BALATAS", toma: "real/v4-freno.mp4" },
];
const ruidoDe = (c: Clip): [number, number] => [c.inicio, c.inicioAudio];

const TALLER = "real/i1-taller.png";
const TOMAS: Toma[] = ([
  { nombre: "Conductor escucha", archivo: "real/a3-conductor.mp4", desde: 0, hasta: L02, zoom: [1.0, 1.12], foco: [50, 40] },
  { nombre: "Taller intro", archivo: TALLER, desde: L02, hasta: L03a, zoom: [1.05, 1.15], foco: [50, 45], desenfoque: 8, filtro: "brightness(0.6)" },
  ...RONDAS.flatMap((r, k): Toma[] => [
    { nombre: `Pregunta ${r.n}`, archivo: TALLER, desde: limite(r.pregunta), hasta: r.respuesta.inicioAudio, zoom: [1.12, 1.3], foco: [50, 45], desenfoque: 10, filtro: `brightness(0.5) hue-rotate(${k * 25}deg)` },
    { nombre: `Respuesta ${r.n}`, archivo: r.toma, desde: r.respuesta.inicioAudio, hasta: r.fin, zoom: [1.0, 1.15], foco: [50, 42], velocidad: 0.92 },
  ]),
  { nombre: "Bucle 1", archivo: "real/a1-banda.mp4", desde: L04, hasta: L05a, zoom: [1.3, 1.35], foco: [50, 45], desenfoque: 10, filtro: "brightness(0.4)", velocidad: 0.5, inicioClip: 3 },
  { nombre: "Bucle 2", archivo: "real/a2-homocinetica.mp4", desde: L06, hasta: L07a, zoom: [1.3, 1.35], foco: [50, 45], desenfoque: 10, filtro: "brightness(0.4) hue-rotate(-20deg)", velocidad: 0.5, inicioClip: 3 },
  { nombre: "Marcador", archivo: TALLER, desde: L07d, hasta: L08, zoom: [1.15, 1.25], foco: [50, 50], desenfoque: 10, filtro: "brightness(0.55)" },
  { nombre: "Final", archivo: TALLER, desde: L08, hasta: duracionTotal, zoom: [1.05, 1.15], foco: [50, 45], desenfoque: 4, filtro: "brightness(0.75)" },
] as Toma[]).sort((a, b) => a.desde - b.desde);
const CORTES = TOMAS.slice(1).map((tm) => tm.desde);

// Fuerza del ruido en un instante (la bocina vibra y salen aros).
const fuerzaRuido = (t: number) => {
  const ventanas = [ruidoDe(c01), ...RONDAS.map((r) => ruidoDe(r.respuesta))];
  return ventanas.some(([a, b]) => t >= a && t < b) ? 0.7 + 0.3 * Math.abs(Math.sin(t * 23)) : 0;
};

// Cuenta regresiva 3-2-1 durante el ruido de cada ronda, con aro que se vacía.
const Cuenta: React.FC<{ t: number }> = ({ t }) => {
  const r = RONDAS.find((x) => t >= x.respuesta.inicio && t < x.respuesta.inicioAudio);
  if (!r) return null;
  const [a, b] = ruidoDe(r.respuesta);
  const paso = (b - a) / 3;
  const k = Math.min(2, Math.floor((t - a) / paso));
  const l = (t - a - k * paso) / paso;
  const golpe = 1 + 0.35 * (1 - Math.min(1, l * 4));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", width: 260, height: 260 }}>
        <svg width={260} height={260} style={{ position: "absolute", inset: 0 }}>
          <circle cx={130} cy={130} r={115} fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.25)" strokeWidth={14} />
          <circle cx={130} cy={130} r={115} fill="none" stroke={k === 2 ? "#ff4d4d" : "#ffcf3a"} strokeWidth={14} strokeDasharray={722} strokeDashoffset={722 * l} transform="rotate(-90 130 130)" strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 150, color: "#fff", transform: `scale(${golpe})`, textShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>{3 - k}</div>
      </div>
    </div>
  );
};

// Letrero "RUIDO #N" de cada ronda.
const LetreroRonda: React.FC<{ t: number }> = ({ t }) => {
  const r = RONDAS.find((x) => t >= limite(x.pregunta) + 0.1 && t < x.respuesta.inicio);
  if (!r) return null;
  const entra = resorte(t, limite(r.pregunta) + 0.1, 11);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 400, display: "flex", justifyContent: "center", transform: `scale(${entra})` }}>
      <div style={{ background: DEGRADADO, borderRadius: 20, padding: "8px 34px 14px", fontFamily: ANTON, fontSize: 78, color: "#fff", boxShadow: "0 16px 40px rgba(204,35,40,0.55)" }}>🔊 RUIDO #{r.n}</div>
    </div>
  );
};

// Respuesta: destello verde y letrero con la pieza.
const Respuesta: React.FC<{ t: number }> = ({ t }) => {
  const r = RONDAS.find((x) => t >= x.respuesta.inicioAudio && t < x.fin);
  if (!r) return null;
  const l = t - r.respuesta.inicioAudio;
  return (
    <>
      {l < 0.35 ? <AbsoluteFill style={{ background: "#3ddc84", opacity: 0.35 * (1 - l / 0.35), mixBlendMode: "screen" }} /> : null}
      <Insignia t={t} t0={r.respuesta.inicioAudio + 0.05} t1={r.fin - 0.05} texto={`✅ ${r.pieza}`} x={70} y={360} color="#16924f" />
    </>
  );
};

// Marcador final: tres casillas que se palomean.
const Marcador: React.FC<{ t: number }> = ({ t }) => {
  if (t < L07d || t > L08 + 0.1) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 430, display: "flex", justifyContent: "center", gap: 30 }}>
      {RONDAS.map((r, k) => {
        const e = resorte(t, L07d + 0.15 + k * 0.18, 10);
        return (
          <div key={r.n} style={{ width: 200, height: 220, borderRadius: 28, background: "rgba(20,20,24,0.5)", border: "3px solid rgba(255,255,255,0.35)", backdropFilter: "blur(14px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${e})` }}>
            <div style={{ fontFamily: ANTON, fontSize: 40, color: "#fff" }}>#{r.n}</div>
            <div style={{ fontSize: 100 }}>❓</div>
          </div>
        );
      })}
    </div>
  );
};

const BocinaEscena: React.FC<{ t: number }> = ({ t }) => {
  const enQuiz = RONDAS.some((r) => t >= limite(r.pregunta) - 0.05 && t < r.respuesta.inicioAudio + 0.2);
  const enIntro = t >= L02 - 0.05 && t < L03a;
  const enFinal = t >= L08 - 0.05;
  if (!enQuiz && !enIntro && !enFinal) return null;
  const r = RONDAS.find((x) => t >= limite(x.pregunta) - 0.05 && t < x.respuesta.inicioAudio + 0.2);
  const inicio = r ? limite(r.pregunta) : enIntro ? L02 : L08;
  const fin = r ? r.respuesta.inicioAudio : enIntro ? L03a : duracionTotal + 1;
  const entra = resorte(t, inicio, 12);
  const sale = 1 - rampa(t, fin - 0.1, fin + 0.15);
  const y = enFinal ? 1.3 : 0.8;
  const escala = (enFinal ? 0.32 : 0.38) * entra;
  return (
    <AbsoluteFill style={{ opacity: sale }}>
      <Escena3D>
        <Bocina3D t={t} fuerza={fuerzaRuido(t)} giro={0.35 * Math.sin(t * 0.8)} x={0} y={y} escala={escala} />
      </Escena3D>
    </AbsoluteFill>
  );
};

const STICKERS = [
  { id: "c01", emoji: "🤔", x: 912, y: 560, t0: c01.inicioAudio + 0.2, vida: 1.3 },
  { id: "c04", emoji: "😏", x: 912, y: 560, t0: c04.inicio + 0.2, vida: 1.2 },
  { id: "c06", emoji: "⚠️", x: 912, y: 560, t0: c06.inicio + 0.2, vida: 1.2 },
  { id: "c07d", emoji: "🏆", x: 912, y: 560, t0: c07d.inicio + 0.1, vida: c07d.duracion },
  { id: "c08", emoji: "💬", x: 912, y: 640, t0: c08.inicio + 0.5, vida: c08.duracion - 0.5 },
];

const D: Record<string, number> = {
  clac: 0.26, ding: 0.9, riser: 1.5, "tic-tac": 1.2, "mk-pop": 0.5, "mk-hit": 1.0, "mk-swipe": 0.7, "mk-whoosh-zoom": 0.8,
  "whoosh-a": 0.5, "whoosh-b": 0.48, "whoosh-c": 0.5, "mitos/acierto": 0.9, "viaje/brillo": 0.9, "mk-clic": 0.3,
  "ruidos/chillido-banda": 0.9, "ruidos/clic-homocinetica": 1.0, "ruidos/rechinido-frenos": 1.0,
};
const ef = (nombre: string, archivo: string, t: number, volumen: number | null = null): Efecto => ({ nombre, archivo, t, dur: D[archivo] ?? 0.5, volumen });
const WHOOSH = ["whoosh-a", "whoosh-b", "whoosh-c", "mk-whoosh-zoom"];
const VOL_RUIDO: Record<string, number> = { "clic-homocinetica": 1, "chillido-banda": 0.7, "rechinido-frenos": 0.7 };
const EFECTOS: Efecto[] = [
  ef("Ruido gancho", "ruidos/rechinido-frenos", 0, 0.7),
  ef("Título gancho", "mk-swipe", c01.inicioAudio + 0.1),
  ...CORTES.map((c, k) => ef(`Corte ${k + 1}`, WHOOSH[k % WHOOSH.length], c - 0.18)),
  ...RONDAS.flatMap((r) => {
    const [a, b] = ruidoDe(r.respuesta);
    const paso = (b - a) / 3;
    return [
      ef(`Letrero ronda ${r.n}`, "mk-hit", limite(r.pregunta) + 0.1),
      ef(`Ruido ${r.n}`, `ruidos/${r.ruido}`, a, VOL_RUIDO[r.ruido]),
      ef(`Ruido ${r.n} otra vez`, `ruidos/${r.ruido}`, a + 1.2, VOL_RUIDO[r.ruido]),
      ...[0, 1, 2].map((k) => ef(`Cuenta ${r.n}-${3 - k}`, "mk-clic", a + k * paso + 0.02, 0.3)),
      ef(`Acierto ${r.n}`, "mitos/acierto", b, 0.4),
    ];
  }),
  ef("Riser bucle 1", "riser", c04.inicio - D.riser),
  ef("Título difícil", "mk-swipe", c04.inicio + 0.12),
  ef("Riser bucle 2", "riser", c06.inicio - D.riser),
  ef("Título peligroso", "mk-swipe", c06.inicio + 0.12),
  ...[0, 1, 2].map((k) => ef(`Marcador ${k + 1}`, "mk-pop", L07d + 0.15 + k * 0.18)),
  ef("Botón", "mk-pop", c08.inicio + 0.3),
  ...STICKERS.map((s) => ef(`Sticker ${s.emoji}`, "mk-pop", s.t0)),
];

export const TemaAdivina: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / FPS;
  const lineas = clips.flatMap((c) => c.lineas);
  const titulo = clips.find((c) => c.pantalla && t >= c.inicioAudio - 0.1 && t < c.fin + 0.4);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Tomas tomas={TOMAS} t={t} />
      <BocinaEscena t={t} />
      <Destello t={t} cortes={CORTES} />
      <Legibilidad />

      <ChipVidrio t={t} t0={c02.inicio + 0.2} t1={L03a + 0.05} texto="🔊 3 ruidos · ¿cuántos adivinas?" x={70} y={360} />
      <LetreroRonda t={t} />
      <Cuenta t={t} />
      <Respuesta t={t} />
      <Senal t={t} t0={RONDAS[0].respuesta.inicioAudio + 0.4} t1={L04} x={540} y={760} texto="FLOJA O GASTADA" lado="der" alto={-260} />
      <Insignia t={t} t0={en(c03c, "deja de cargar")} t1={L04 - 0.05} texto="🔋 SIN CARGA" x={560} y={790} color="#b3121a" />
      <Senal t={t} t0={RONDAS[1].respuesta.inicioAudio + 0.4} t1={L06} x={520} y={820} texto="CLIC AL DAR VUELTA" lado="der" alto={-320} />
      <Insignia t={t} t0={en(c05c, "dejar tirado")} t1={L06 - 0.05} texto="🚗 TE DEJA TIRADO" x={480} y={790} color="#b3121a" />
      <Senal t={t} t0={RONDAS[2].respuesta.inicioAudio + 0.4} t1={L07d} x={540} y={720} texto="METAL CONTRA METAL" lado="izq" alto={-240} color="#b3121a" />
      <Marcador t={t} />

      {titulo ? (
        <div style={{ position: "absolute", left: 50, right: 50, top: 724, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TituloMascara texto={titulo.pantalla ?? ""} resaltar={titulo.pantallaResaltar ?? []} t={t} t0={titulo.inicioAudio + 0.1} t1={titulo.fin - 0.15} tamano={76} />
        </div>
      ) : null}
      <Onomatopeya texto="¡RRRIIICH!" x={540} y={520} t={t} t0={0.05} vida={0.85} giro={-7} />
      {RONDAS.map((r) => (
        <Onomatopeya key={r.n} texto={r.n === 1 ? "¡IIIIIH!" : r.n === 2 ? "CLIC CLIC" : "¡RRRIIICH!"} x={r.n === 2 ? 300 : 780} y={600} t={t} t0={r.respuesta.inicio + 0.05} vida={0.9} giro={r.n === 2 ? -8 : 7} />
      ))}
      <BotonFinal t={t} t0={c08.inicio + 0.25} texto={c08.boton ?? "Comenta tu puntaje 👇"} />
      <Rafaga x={540} y={796} t={t} t0={c08.inicio + 0.25} radio={320} color={ROJO_DA} lineas={16} />
      {STICKERS.map((s) => (
        <Sticker key={s.id} emoji={s.emoji} x={s.x} y={s.y} t={t} t0={s.t0} vida={s.vida} tamano={100} />
      ))}

      <MascotaVoz clips={clips} carpeta="audio/adivina" pausa={guion.pausaEntreClipsSegundos} bpm={guion.bpm ?? null} />
      <AcabadoPremium frame={frame} calidez={0.7} />
      <BarraProgreso />
      <Img src={staticFile("logo-doctor-auto.png")} alt="doctor auto" style={{ position: "absolute", left: 80, top: 308, height: 30, opacity: 0.6 }} />
      <SubtitulosDA lineas={lineas} desde={0} hasta={c08.inicio} arriba={885} alto={265} tamano={52} izquierda={70} derecha={520} sostenerFinal={false} />
      <SubtitulosDA lineas={lineas} desde={c08.inicio} hasta={Infinity} arriba={880} alto={80} tamano={46} izquierda={70} derecha={70} sostenerFinal />

      <Mezcla clips={clips} carpeta="audio/adivina" musica="real/musica-adivina.mp3" efectos={EFECTOS} total={durationInFrames / FPS} />
    </AbsoluteFill>
  );
};
