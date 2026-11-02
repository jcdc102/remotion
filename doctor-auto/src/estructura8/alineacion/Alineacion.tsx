// Tema "alineacion" de Estructura8: sin tarjeta final de logo. El video termina
// con la pieza 8 (mascota grande, botón y último subtítulo) y un fundido de 5 fotogramas.
import { Audio } from "@remotion/media";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, Track, useCurrentFrame, useVideoConfig } from "remotion";
import { construirPiezas, momentoDe, porTipo, type Guion, type Pieza } from "../datos";
import { Mascota, type Ancla } from "../Mascota";
import { ANTON, DEGRADADO, FONDO, ROJO_DA } from "../../doctor-auto/constantes";
import { SubtitulosDA } from "../../doctor-auto/Texto";
import { TarjetaLogo } from "../Piezas";
import { Bucle, Cuerpo, Gancho, Introduccion, Llamado, momentoAviso } from "./Escenas";
import guion from "./guion.json";
import sincronia from "./sincronia.json";

const piezas = construirPiezas(guion as Guion, sincronia);
// Si tarjetaFinal es true se agregan 2 s de tarjeta con el logo al final.
const TARJETA = guion.tarjetaFinal ? 2 : 0;
export const DURACION_ALINEACION = guion.duracionSegundos + TARJETA;
const VOZ = staticFile("estructura8/alineacion/voz.mp3");
const sfx = (nombre: string) => staticFile(`estructura8/sfx/${nombre}.wav`);

const gancho = porTipo(piezas, "gancho");
const intro = porTipo(piezas, "introduccion");
const cuerpos = [0, 1, 2].map((n) => porTipo(piezas, "cuerpo", n));
const bucles = [0, 1].map((n) => porTipo(piezas, "bucle", n));
const cta = porTipo(piezas, "cta");

// Mascota a la derecha, entre el 48% y el 73% de la altura.
const DERECHA: Ancla = { x: 805, abajo: 1400, alto: 470 };
const CENTRO: Ancla = { x: 540, abajo: 1430, alto: 500 };
const anclaDe = (p: Pieza) => (p.mascota?.animacion === "grande-centro" ? CENTRO : DERECHA);

const MascotaAnimada: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const audio = useAudioData(VOZ);
  let boca = 0;
  if (audio) {
    const espectro = visualizeAudio({ fps, frame, audioData: audio, numberOfSamples: 32, smoothing: true });
    const bajos = espectro.slice(0, 12);
    const media = bajos.reduce((a, b) => a + b, 0) / bajos.length;
    boca = Math.max(0, Math.min(1, media * 30 - 0.08));
  }
  const i = Math.max(0, piezas.findIndex((p) => t >= p.inicio && t < p.fin));
  const indice = t >= cta.fin ? piezas.length - 1 : i;
  const p = piezas[indice];
  const m = p.mascota ?? { pose: "pulgar", animacion: "habla" };
  return (
    <Mascota
      pose={m.pose}
      animacion={m.animacion}
      globo={m.globo ?? null}
      frameLocal={frame - Math.round(p.inicio * fps)}
      t={t}
      boca={boca}
      ancla={anclaDe(p)}
      anclaAnterior={indice > 0 ? anclaDe(piezas[indice - 1]) : anclaDe(p)}
      objetivo={{ x: 770, y: 450 }}
      colorAcento={ROJO_DA}
      fuente={ANTON}
      espejoCompleto={false}
      globoArriba={812}
    />
  );
};

const BarraProgreso: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const avance = interpolate(frame / fps, [0, DURACION_ALINEACION], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 292, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.15)" }}>
      <div style={{ width: `${avance * 100}%`, height: "100%", borderRadius: 4, background: DEGRADADO }} />
    </div>
  );
};

// Marca de agua visible todo el video, debajo de la barra de progreso.
const MarcaDeAgua: React.FC = () => (
  <Img
    src={staticFile("logo-doctor-auto.png")}
    alt={guion.marcaDeAgua}
    style={{ position: "absolute", left: 80, top: 314, height: 34, opacity: 0.55 }}
  />
);

const Fundido: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacidad = interpolate(frame, [durationInFrames - 5, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "#000", opacity: opacidad }} />;
};

const desde = (s: number, fps: number) => Math.round(s * fps);

export const TemaAlineacion: React.FC = () => {
  const { fps } = useVideoConfig();
  const dur = (p: Pieza) => desde(p.fin, fps) - desde(p.inicio, fps);
  const chips = intro.chips ?? [];
  const lineas = piezas.flatMap((p) => p.lineas);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: FONDO }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />

      <Track name="Piezas">
        <Sequence name="1 Gancho" from={desde(gancho.inicio, fps)} durationInFrames={dur(gancho)}>
          <Gancho p={gancho} />
        </Sequence>
        <Sequence name="2 Introducción" from={desde(intro.inicio, fps)} durationInFrames={dur(intro)}>
          <Introduccion p={intro} />
        </Sequence>
        <Sequence name="3 Cuerpo 1" from={desde(cuerpos[0].inicio, fps)} durationInFrames={dur(cuerpos[0])}>
          <Cuerpo p={cuerpos[0]} orden={0} chip={chips[0] ?? ""} />
        </Sequence>
        <Sequence name="4 Bucle" from={desde(bucles[0].inicio, fps)} durationInFrames={dur(bucles[0])}>
          <Bucle p={bucles[0]} orden={0} />
        </Sequence>
        <Sequence name="5 Cuerpo 2" from={desde(cuerpos[1].inicio, fps)} durationInFrames={dur(cuerpos[1])}>
          <Cuerpo p={cuerpos[1]} orden={1} chip={chips[1] ?? ""} />
        </Sequence>
        <Sequence name="6 Bucle" from={desde(bucles[1].inicio, fps)} durationInFrames={dur(bucles[1])}>
          <Bucle p={bucles[1]} orden={1} />
        </Sequence>
        <Sequence name="7 Cuerpo 3" from={desde(cuerpos[2].inicio, fps)} durationInFrames={dur(cuerpos[2])}>
          <Cuerpo p={cuerpos[2]} orden={2} chip={chips[2] ?? ""} />
        </Sequence>
        <Sequence name="8 Llamado a la acción" from={desde(cta.inicio, fps)} durationInFrames={dur(cta)}>
          <Llamado p={cta} />
        </Sequence>
      </Track>

      <MascotaAnimada />
      <BarraProgreso />
      <MarcaDeAgua />

      {/* Subtítulos a la izquierda de la mascota (44%–59%); en el llamado, centrados (39%–47%)
          y el último se queda hasta el final. */}
      <SubtitulosDA lineas={lineas} desde={0} hasta={cta.inicio} arriba={845} alto={290} tamano={56} izquierda={70} derecha={480} sostenerFinal={false} />
      <SubtitulosDA lineas={lineas} desde={cta.inicio} hasta={Infinity} arriba={755} alto={140} tamano={50} izquierda={70} derecha={70} sostenerFinal />

      {guion.tarjetaFinal ? (
        <Sequence name="Tarjeta logo" from={desde(guion.duracionSegundos, fps)} durationInFrames={desde(TARJETA, fps)}>
          <TarjetaLogo />
        </Sequence>
      ) : (
        <Fundido />
      )}

      {/* La voz original viene casi a 0 dB; se baja un poco para dejar margen a los efectos. */}
      <Audio src={VOZ} volume={0.85} />

      {/* Efectos de sonido (generados con scripts/sonidos.sh). Sin música. */}
      {/* Transiciones: corte seco con whoosh al empezar cada pieza (2 a 8). */}
      <Track name="Whoosh de corte">
        {piezas.slice(1).map((p) => (
          <Sequence key={p.id} name={`Whoosh pieza ${p.id}`} from={desde(p.inicio, fps)} durationInFrames={desde(0.6, fps)}>
            <Audio src={sfx("whoosh")} volume={0.55} />
          </Sequence>
        ))}
      </Track>
      <Track name="Efectos">
        {/* Pieza 1: whoosh al entrar el gancho */}
        <Sequence name="Whoosh" from={0} durationInFrames={desde(0.6, fps)}>
          <Audio src={sfx("whoosh")} volume={0.8} />
        </Sequence>
        {/* Pieza 3: chirrido suave de llanta cuando la voz dice "jala" */}
        <Sequence name="Chirrido" from={desde(momentoDe(cuerpos[0], cuerpos[0].resaltar[0]), fps)} durationInFrames={desde(1.2, fps)}>
          <Audio src={sfx("chirrido")} volume={0.45} />
        </Sequence>
        {/* Pieza 6: tic tac del reloj */}
        <Sequence name="Tic tac" from={desde(bucles[1].inicio, fps)} durationInFrames={desde(2, fps)}>
          <Audio src={sfx("tictac")} volume={0.7} />
        </Sequence>
        {/* Pieza 7: ding cuando aparece la franja de aviso */}
        <Sequence name="Ding" from={desde(momentoAviso(cuerpos[2]), fps)} durationInFrames={desde(1.2, fps)}>
          <Audio src={sfx("ding")} volume={0.6} />
        </Sequence>
        {/* Pieza 8: pop cuando aparece el botón */}
        <Sequence name="Pop" from={desde(cta.inicio + 0.15, fps)} durationInFrames={desde(0.25, fps)}>
          <Audio src={sfx("pop")} volume={0.8} />
        </Sequence>
      </Track>
    </AbsoluteFill>
  );
};
