// Estructura8 · tema "dia-de-muertos". 8 piezas leídas de guion.json,
// sincronizadas con voz.mp3 (ver scripts/sincronizar.mjs).
import { Audio } from "@remotion/media";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  staticFile,
  Track,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";
import { Calavera, Mano, type PoseMano } from "./Calavera";
import {
  DURACION,
  inicioUltimoTramo,
  momentoDe,
  piezaPorTipo,
  piezas,
  type Pieza,
} from "./datos";
import { Fondo, Grano, PapelPicado, PetalosCayendo, Veladoras, Vineta } from "./Mundo";
import { Bucle, Cuerpo, Gancho, Introduccion, Llamado, TarjetaLogo } from "./Piezas";
import { Subtitulos } from "./Subtitulos";
import { TemaBateria } from "./bateria/Bateria";
import { TemaAlineacion } from "./alineacion/Alineacion";
import { TemaPasarCorriente } from "./pasar-corriente/PasarCorriente";
import { TemaRuidos } from "./ruidos/Ruidos";
import { TemaViajePro } from "./viaje/ViajePro";
import { TemaMitosPro } from "./mitos/MitosPro";
import { TemaCalor } from "./calor/CalorPro";
import { TemaAdivina } from "./adivina/AdivinaPro";

const VOZ = staticFile("estructura8/voz.mp3");
const sfx = (nombre: string) => staticFile(`estructura8/sfx/${nombre}.wav`);

const gancho = piezaPorTipo("gancho");
const intro = piezaPorTipo("introduccion");
const cuerpos = [0, 1, 2].map((n) => piezaPorTipo("cuerpo", n));
const bucles = [0, 1].map((n) => piezaPorTipo("bucle", n));
const cta = piezaPorTipo("cta");
const T_LOGO = DURACION - 2;

type Pose = { x: number; y: number; tamano: number; mano: PoseMano };
// Posición de la calavera por pieza (centro del cráneo). Nunca en el 15%
// superior ni en el 25% inferior.
const RINCON: Pose = { x: 190, y: 1290, tamano: 230, mano: "ninguna" };
const poseDe = (p: Pieza): Pose => {
  if (p.tipo === "gancho") return { x: 540, y: 455, tamano: 300, mano: "ninguna" };
  if (p === bucles[0]) return { x: 540, y: 455, tamano: 290, mano: "dedo" };
  if (p.tipo === "cta") return { x: 210, y: 450, tamano: 250, mano: "senala" };
  return RINCON;
};

const Mascota: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const audio = useAudioData(VOZ);

  // Boca según el volumen de la voz.
  let boca = 0;
  if (audio) {
    const espectro = visualizeAudio({ fps, frame, audioData: audio, numberOfSamples: 32, smoothing: true });
    const bajos = espectro.slice(0, 12);
    const media = bajos.reduce((a, b) => a + b, 0) / bajos.length;
    boca = Math.max(0, Math.min(1, media * 30 - 0.08));
  }

  const i = Math.max(0, piezas.findIndex((p) => t >= p.inicio && t < p.fin));
  const actual = poseDe(piezas[i]);
  const anterior = i > 0 ? poseDe(piezas[i - 1]) : actual;
  const mezcla = spring({ frame: frame - Math.round(piezas[i].inicio * fps), fps, config: { damping: 14 } });
  const x = interpolate(mezcla, [0, 1], [anterior.x, actual.x]);
  const y = interpolate(mezcla, [0, 1], [anterior.y, actual.y]);
  const tamano = interpolate(mezcla, [0, 1], [anterior.tamano, actual.tamano]);

  // Entrada de golpe en el gancho.
  const golpe = spring({ frame, fps, config: { damping: 9, mass: 0.7 } });
  const zoom = t < intro.inicio ? interpolate(golpe, [0, 1], [3.2, 1]) : 1;

  const ciclo = (frame + 40) % 97;
  const parpadeo = ciclo < 6 ? 1 - Math.abs(ciclo - 3) / 3 : 0;
  const brillo = t < intro.inicio ? 1 : piezas[i] === bucles[1] ? 0.9 : 0.35 + 0.65 * boca;
  const flota = Math.sin(t * 2.4) * 6;
  const mano = spring({ frame: frame - Math.round(piezas[i].inicio * fps) - 6, fps, config: { damping: 10 } });
  const alto = tamano * 1.08;

  if (t >= T_LOGO) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - tamano / 2,
        top: y - alto / 2 + flota,
        width: tamano,
        height: alto,
        transform: `scale(${zoom})`,
        opacity: Math.min(1, golpe * 2),
        filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.6))",
      }}
    >
      <Calavera boca={boca} brillo={brillo} parpadeo={parpadeo} tamano={tamano} />
      {actual.mano === "dedo" ? (
        <div
          style={{
            position: "absolute",
            left: tamano * 0.88,
            top: tamano * (0.05 + (1 - mano) * 0.6),
            opacity: mano,
            transform: `rotate(${10 + Math.sin(t * 6) * 6}deg)`,
          }}
        >
          <Mano tamano={tamano * 0.42} />
        </div>
      ) : null}
      {actual.mano === "senala" ? (
        <div
          style={{
            position: "absolute",
            left: tamano * 0.82,
            top: tamano * 0.55,
            opacity: mano,
            transform: `rotate(${135 + Math.sin(t * 5) * 8}deg) translateY(${(1 - mano) * 40}px)`,
          }}
        >
          <Mano tamano={tamano * 0.42} />
        </div>
      ) : null}
    </div>
  );
};

const BarraProgreso: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < intro.inicio || t >= T_LOGO) return null;
  const avance = interpolate(t, [intro.inicio, T_LOGO], [0, 1]);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 296, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.15)" }}>
      <div style={{ width: `${avance * 100}%`, height: "100%", borderRadius: 5, background: "linear-gradient(90deg, #ff8c1a, #ffd60a)" }} />
    </div>
  );
};

const VeladorasAnimadas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const b = bucles[1];
  // En el segundo bucle las veladoras se atenúan.
  const luz = interpolate(t, [b.inicio, b.inicio + 0.4, b.fin - 0.1, b.fin + 0.4], [1, 0.15, 0.15, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <Veladoras luz={luz} />;
};

const desde = (s: number, fps: number) => Math.round(s * fps);

// Tema "dia-de-muertos".
const DiaDeMuertos: React.FC = () => {
  const { fps } = useVideoConfig();
  const dur = (p: Pieza) => desde(p.fin, fps) - desde(p.inicio, fps);
  return (
    <AbsoluteFill>
      <Fondo />
      <VeladorasAnimadas />
      <PetalosCayendo />
      <PapelPicado tRasgado={bucles[0].inicio} tReentrada={cuerpos[1].inicio} />
      <BarraProgreso />

      <Track name="Piezas">
        <Sequence name="1 Gancho" from={desde(gancho.inicio, fps)} durationInFrames={dur(gancho)}>
          <Gancho p={gancho} />
        </Sequence>
        <Sequence name="2 Introducción" from={desde(intro.inicio, fps)} durationInFrames={dur(intro)}>
          <Introduccion p={intro} />
        </Sequence>
        <Sequence name="3 Cuerpo 1" from={desde(cuerpos[0].inicio, fps)} durationInFrames={dur(cuerpos[0])}>
          <Cuerpo p={cuerpos[0]} orden={0} />
        </Sequence>
        <Sequence name="4 Bucle" from={desde(bucles[0].inicio, fps)} durationInFrames={dur(bucles[0])}>
          <Bucle p={bucles[0]} orden={0} />
        </Sequence>
        <Sequence name="5 Cuerpo 2" from={desde(cuerpos[1].inicio, fps)} durationInFrames={dur(cuerpos[1])}>
          <Cuerpo p={cuerpos[1]} orden={1} />
        </Sequence>
        <Sequence name="6 Bucle" from={desde(bucles[1].inicio, fps)} durationInFrames={dur(bucles[1])}>
          <Bucle p={bucles[1]} orden={1} />
        </Sequence>
        <Sequence name="7 Cuerpo 3" from={desde(cuerpos[2].inicio, fps)} durationInFrames={dur(cuerpos[2])}>
          <Cuerpo p={cuerpos[2]} orden={2} />
        </Sequence>
        <Sequence name="8 Llamado a la acción" from={desde(cta.inicio, fps)} durationInFrames={dur(cta)}>
          <Llamado p={cta} />
        </Sequence>
      </Track>

      <Mascota />
      <Subtitulos lineas={piezas.flatMap((p) => p.lineas)} desde={0} hasta={T_LOGO} colorResaltado="#ffd60a" arriba={950} alto={200} tamano={80} izquierda={70} derecha={70} sostenerFinal={false} />

      <Sequence name="Tarjeta logo" from={desde(T_LOGO, fps)} durationInFrames={desde(2, fps)}>
        <TarjetaLogo />
      </Sequence>

      <Vineta />
      <Grano />

      <Audio src={VOZ} />

      {/* Efectos de sonido. Entre corchetes, el segundo pedido en el guion;
          el momento real sale de la voz para que coincida con lo que se dice. */}
      <Track name="Efectos">
        {/* [0 s] golpe grave al entrar la calavera */}
        <Sequence name="Golpe" from={0} durationInFrames={desde(1.2, fps)}>
          <Audio src={sfx("golpe")} volume={0.9} />
        </Sequence>
        {/* [3–7 s] un whoosh por cada lápida que aparece */}
        {[0, 1, 2].map((k) => (
          <Sequence key={k} name={`Whoosh lápida ${k + 1}`} from={desde(intro.inicio + 0.1 + k, fps)} durationInFrames={desde(0.6, fps)}>
            <Audio src={sfx("whoosh")} volume={0.8} />
          </Sequence>
        ))}
        {/* [12 s] apagado cuando la voz dice "arrancó" */}
        <Sequence name="Apagado" from={desde(momentoDe(cuerpos[0], cuerpos[0].resaltar[1]), fps)} durationInFrames={desde(1, fps)}>
          <Audio src={sfx("apagado")} volume={0.7} />
        </Sequence>
        {/* [15 s] rasgado del papel picado al empezar el bucle */}
        <Sequence name="Rasgado" from={desde(bucles[0].inicio, fps)} durationInFrames={desde(0.8, fps)}>
          <Audio src={sfx("rasgado")} volume={0.6} />
        </Sequence>
        {/* [22 s] pitido de alerta al aparecer el aviso rojo */}
        <Sequence name="Alerta" from={desde(inicioUltimoTramo(cuerpos[1]), fps)} durationInFrames={desde(0.6, fps)}>
          <Audio src={sfx("alerta")} volume={0.6} />
        </Sequence>
        {/* [26 s] latido lento cuando se apagan las veladoras */}
        <Sequence name="Latido" from={desde(bucles[1].inicio, fps)} durationInFrames={desde(1.2, fps)}>
          <Audio src={sfx("latido")} volume={0.9} />
        </Sequence>
        {/* [34 s] caja registradora cuando la voz dice "cobrar" */}
        <Sequence name="Caja registradora" from={desde(momentoDe(cuerpos[2], cuerpos[2].resaltar[1]), fps)} durationInFrames={desde(1.3, fps)}>
          <Audio src={sfx("caja")} volume={0.6} />
        </Sequence>
        {/* [38 s] pop cuando aparece el globo de comentario */}
        <Sequence name="Pop" from={desde(cta.inicio + 0.15, fps)} durationInFrames={desde(0.25, fps)}>
          <Audio src={sfx("pop")} volume={0.8} />
        </Sequence>
      </Track>
      <Track name="Efectos 2">
        {/* [0 s] campana junto con el golpe */}
        <Sequence name="Campana" from={0} durationInFrames={desde(2.5, fps)}>
          <Audio src={sfx("campana")} volume={0.45} />
        </Sequence>
        {/* [15 s] riser que sube durante el bucle */}
        <Sequence name="Riser" from={desde(bucles[0].inicio, fps)} durationInFrames={desde(1.6, fps)}>
          <Audio src={sfx("riser")} volume={0.6} />
        </Sequence>
      </Track>
    </AbsoluteFill>
  );
};

export type TemaEstructura8 = "dia-de-muertos" | "bateria" | "alineacion" | "pasar-corriente" | "ruidos" | "viaje" | "mitos" | "calor" | "adivina";

// Estructura8: misma estructura de 8 piezas con distintos temas.
export const Estructura8: React.FC<{ tema: TemaEstructura8 }> = ({ tema }) => {
  if (tema === "bateria") return <TemaBateria />;
  if (tema === "alineacion") return <TemaAlineacion />;
  if (tema === "pasar-corriente") return <TemaPasarCorriente />;
  if (tema === "ruidos") return <TemaRuidos />;
  if (tema === "viaje") return <TemaViajePro />;
  if (tema === "mitos") return <TemaMitosPro />;
  if (tema === "calor") return <TemaCalor />;
  if (tema === "adivina") return <TemaAdivina />;
  return <DiaDeMuertos />;
};
