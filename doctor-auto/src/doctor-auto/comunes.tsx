// Piezas comunes de los videos "pro": mascota que habla con la voz, barra de progreso,
// etiqueta de sección, botón final y la mezcla de efectos y música.
import { Audio } from "@remotion/media";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { Sequence, spring, staticFile, Track, useCurrentFrame, useVideoConfig } from "remotion";
import { Mascota, type Ancla } from "../estructura8/Mascota";
import type { Clip } from "./clips";
import { ANTON, DEGRADADO, ROJO_DA } from "./constantes";
import { pulsoBpm } from "./Fondo";

const FPS = 30;
const desde = (s: number) => Math.round(s * FPS);
const suave = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const rampa = (t: number, a: number, b: number) => suave(Math.max(0, Math.min(1, (t - a) / (b - a))));
const resorte = (t: number, t0: number, damping = 13, stiffness = 180) =>
  t < t0 ? 0 : spring({ frame: Math.round((t - t0) * FPS), fps: FPS, config: { damping, stiffness } });

const DERECHA: Ancla = { x: 805, abajo: 1430, alto: 455 };
export const MascotaVoz: React.FC<{ clips: Clip[]; carpeta: string; pausa: number; bpm: number | null }> = ({ clips, carpeta, pausa, bpm }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // Un useAudioData por clip (la lista es fija, así que el orden de los hooks no cambia).
  const datos = clips.map((c) => useAudioData(staticFile(`${carpeta}/${c.archivo}`)));
  let i = clips.findIndex((c) => t >= c.inicio && t < c.fin + pausa);
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
      objetivo={{ x: 600, y: 560 }}
      colorAcento={ROJO_DA}
      fuente={ANTON}
      espejoCompleto={false}
      globoArriba={890}
      pulso={pulsoBpm(t, bpm)}
    />
  );
};

export const BarraProgreso: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 292, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.18)" }}>
      <div style={{ width: `${(frame / (durationInFrames - 1)) * 100}%`, height: "100%", borderRadius: 3, background: DEGRADADO, boxShadow: "0 0 12px rgba(204,35,40,0.9)" }} />
    </div>
  );
};

export type Seccion = { n: number; texto: string; desde: number; hasta: number };
export const EtiquetaSeccion: React.FC<{ t: number; secciones: Seccion[] }> = ({ t, secciones }) => {
  const s = secciones.find((x) => t >= x.desde && t < x.hasta);
  if (!s) return null;
  const sale = rampa(t, s.hasta - 0.2, s.hasta);
  return (
    <div style={{ position: "absolute", left: 70, top: 352, display: "flex", alignItems: "center", gap: 16, opacity: 1 - sale }}>
      <div style={{ width: 64, height: 64, borderRadius: 32, background: DEGRADADO, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 40, color: "#fff", transform: `scale(${resorte(t, s.desde)})`, boxShadow: "0 8px 24px rgba(204,35,40,0.6)" }}>{s.n}</div>
      <div style={{ overflow: "hidden", paddingTop: "0.2em", marginTop: "-0.2em" }}>
        <div style={{ transform: `translateY(${(1 - resorte(t, s.desde + 0.08)) * 120}%)`, fontFamily: ANTON, fontSize: 46, color: "#fff", letterSpacing: 2, textShadow: "0 4px 18px rgba(0,0,0,0.8)" }}>{s.texto}</div>
      </div>
    </div>
  );
};

// Botón final: entra creciendo desde el centro y late con la música.
export const BotonFinal: React.FC<{ t: number; t0: number; texto: string }> = ({ t, t0, texto }) => {
  if (t < t0) return null;
  const entra = resorte(t, t0, 10, 160);
  const pulso = 1 + 0.035 * Math.sin((t - t0) * Math.PI * 2);
  const sube = resorte(t, t0 + 0.12);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 738, display: "flex", justifyContent: "center", transform: `scale(${entra * pulso})` }}>
      <div style={{ background: DEGRADADO, borderRadius: 46, padding: "14px 46px 20px", overflow: "hidden", boxShadow: "0 18px 50px rgba(204,35,40,0.6)" }}>
        <div style={{ transform: `translateY(${(1 - sube) * 110}%)`, fontFamily: ANTON, fontSize: 70, color: "#fff", whiteSpace: "nowrap" }}>{texto}</div>
      </div>
    </div>
  );
};

// ---------- Mezcla ----------
export type Efecto = { nombre: string; archivo: string; t: number; dur: number; volumen: number | null };
export const desfasar = (lista: Efecto[]) => {
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

// Voz al frente; música real con ducking (0.16 → 0.08 bajo la voz, 0.24 sin voz en el primer
// y último segundo; entrada 0.4 s y salida 1.2 s); efectos a 0.45 (0.35 bajo la voz).
export const Mezcla: React.FC<{ clips: Clip[]; carpeta: string; musica: string; efectos: Efecto[]; total: number }> = ({ clips, carpeta, musica, efectos, total }) => {
  const vozActiva = (t: number) => clips.some((c) => t >= c.voz[0] && t <= c.voz[1]);
  const volumenMusica = (f: number) => {
    const t = f / FPS;
    const r = 5 / FPS;
    const duck = Math.max(0, ...clips.map(({ voz: [a, b] }) => (t < a - r || t > b + r ? 0 : t < a ? (t - (a - r)) / r : t > b ? 1 - (t - b) / r : 1)));
    let base = 0.16 - 0.08 * duck;
    if ((t < 1 && duck === 0) || t > total - 1) base = Math.max(base, 0.24);
    return base * Math.max(0, Math.min(1, t / 0.4, (total - t) / 1.2));
  };
  return (
    <>
      <Track name="Voz">
        {clips.map((c) => (
          <Sequence key={c.id} name={`Voz ${c.id}`} from={desde(c.inicioAudio)} durationInFrames={Math.ceil(c.duracionAudio * FPS)}>
            <Audio src={staticFile(`${carpeta}/${c.archivo}`)} volume={1} />
          </Sequence>
        ))}
      </Track>
      <Audio src={staticFile(musica)} volume={volumenMusica} />
      {repartirEnPistas(desfasar(efectos)).map((lista, k) => (
        <Track key={k} name={`Efectos ${k + 1}`}>
          {lista.map((e) => (
            <Sequence key={e.nombre} name={e.nombre} from={Math.max(0, desde(e.t))} durationInFrames={Math.max(1, desde(e.dur))}>
              <Audio src={staticFile(`sfx/${e.archivo}.wav`)} volume={(f) => e.volumen ?? (vozActiva(e.t + f / FPS) ? 0.35 : 0.45)} />
            </Sequence>
          ))}
        </Track>
      ))}
    </>
  );
};
