// Tema "bateria" de Estructura8: 8 piezas de guion.json sincronizadas con voz.mp3.
import { Audio } from "@remotion/media";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { AbsoluteFill, interpolate, Sequence, staticFile, Track, useCurrentFrame, useVideoConfig } from "remotion";
import { construirPiezas, momentoDe, porTipo, type Guion, type Pieza } from "../datos";
import { Mascota, type Ancla } from "../Mascota";
import { Grano, Vineta } from "../Mundo";
import { TarjetaLogo } from "../Piezas";
import { Subtitulos } from "../Subtitulos";
import { FUENTE } from "../Texto";
import guion from "./guion.json";
import sincronia from "./sincronia.json";
import { Bucle, Cuerpo, FondoBateria, Gancho, Introduccion, Llamado } from "./Escenas";
import { ROJO, ROJO_CLARO } from "./Iconos";

const piezas = construirPiezas(guion as Guion, sincronia);
const DURACION = guion.duracionSegundos;
const T_LOGO = DURACION - 2;
const VOZ = staticFile("estructura8/bateria/voz.mp3");
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
  if (t >= T_LOGO) return null;
  const i = Math.max(0, piezas.findIndex((p) => t >= p.inicio && t < p.fin));
  const p = piezas[i];
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
      anclaAnterior={i > 0 ? anclaDe(piezas[i - 1]) : anclaDe(p)}
      objetivo={{ x: 770, y: 450 }}
      colorAcento={ROJO}
      fuente={FUENTE}
      espejoCompleto
      globoArriba={812}
    />
  );
};

const BarraProgreso: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t >= T_LOGO) return null;
  const avance = interpolate(t, [0, T_LOGO], [0, 1]);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 292, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.15)" }}>
      <div style={{ width: `${avance * 100}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${ROJO}, #fff)` }} />
    </div>
  );
};

const desde = (s: number, fps: number) => Math.round(s * fps);

export const TemaBateria: React.FC = () => {
  const { fps } = useVideoConfig();
  const dur = (p: Pieza) => desde(p.fin, fps) - desde(p.inicio, fps);
  const chips = intro.chips ?? [];
  const lineas = piezas.flatMap((p) => p.lineas);
  return (
    <AbsoluteFill>
      <FondoBateria />
      <BarraProgreso />

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

      {/* Subtítulos a la izquierda de la mascota (44%–59%); en el llamado, centrados (40%–47%). */}
      <Subtitulos lineas={lineas} desde={0} hasta={cta.inicio} colorResaltado={ROJO_CLARO} arriba={845} alto={290} tamano={64} izquierda={70} derecha={480} sostenerFinal={false} />
      <Subtitulos lineas={lineas} desde={cta.inicio} hasta={T_LOGO} colorResaltado={ROJO_CLARO} arriba={755} alto={140} tamano={54} izquierda={70} derecha={70} sostenerFinal={false} />

      <Sequence name="Tarjeta logo" from={desde(T_LOGO, fps)} durationInFrames={desde(2, fps)}>
        <TarjetaLogo />
      </Sequence>

      <Vineta />
      <Grano />

      <Audio src={VOZ} />

      {/* Efectos de sonido (generados con scripts/sonidos.sh). Sin música. */}
      <Track name="Efectos">
        {/* Pieza 3: arranque lento "rrr" cuando la voz dice "lento" */}
        <Sequence name="Arranque lento" from={desde(momentoDe(cuerpos[0], cuerpos[0].resaltar[0]), fps)} durationInFrames={desde(1.6, fps)}>
          <Audio src={sfx("arranque")} volume={0.7} />
        </Sequence>
        {/* Pieza 3: clic cuando la voz dice "clic" */}
        <Sequence name="Clic" from={desde(momentoDe(cuerpos[0], cuerpos[0].resaltar[1]), fps)} durationInFrames={desde(0.3, fps)}>
          <Audio src={sfx("clic")} volume={0.9} />
        </Sequence>
        {/* Pieza 5: apagado de luces cuando la voz dice "tenues" */}
        <Sequence name="Apagado de luces" from={desde(momentoDe(cuerpos[1], cuerpos[1].resaltar[0]), fps)} durationInFrames={desde(0.9, fps)}>
          <Audio src={sfx("luces")} volume={0.7} />
        </Sequence>
        {/* Pieza 7: ding cuando aparece el aviso (después de "calor") */}
        <Sequence name="Ding" from={desde(momentoDe(cuerpos[2], cuerpos[2].resaltar[1]) + 0.6, fps)} durationInFrames={desde(1.2, fps)}>
          <Audio src={sfx("ding")} volume={0.6} />
        </Sequence>
        {/* Pieza 8: pop cuando aparece el globo de comentario */}
        <Sequence name="Pop" from={desde(cta.inicio + 0.15, fps)} durationInFrames={desde(0.25, fps)}>
          <Audio src={sfx("pop")} volume={0.8} />
        </Sequence>
      </Track>
    </AbsoluteFill>
  );
};
