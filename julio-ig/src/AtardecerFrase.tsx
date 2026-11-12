import { AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio, Video } from "@remotion/media";
import { Grano } from "./cine";
import { C, SANS, SERIF } from "./comun";

// Frase: «No todos los finales son tristes… algunos se ven así. Y mañana… vuelve a salir.»
// Toma propia de Julio (IMG_0417): atardecer en la playa, primeros 4 s en cámara lenta suave (public/tomas/atardecer-julio.mp4, 14 s).
// Voz «Julio» con 1.5 s de silencio al inicio (public/voz-atardecer.mp3). Tiempos por palabra con Whisper.
export const DURACION_ATARDECER = 420;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Línea que aparece palabra por palabra (desenfoque y subida), cada palabra en el fotograma en que se dice.
const Linea: React.FC<{ palabras: string[]; tiempos: number[]; tam: number; cursiva: boolean; color: string }> = ({ palabras, tiempos, tam, cursiva, color }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${tam * 0.28}px` }}>
      {palabras.map((p, i) => {
        const t = interpolate(frame, [tiempos[i] - 2, tiempos[i] + 14], [0, 1], clamp);
        return (
          <span key={i} style={{ fontFamily: SERIF, fontWeight: cursiva ? 600 : 700, fontStyle: cursiva ? "italic" : "normal", fontSize: tam, lineHeight: 1.2, color, opacity: t, filter: `blur(${(1 - t) * 10}px)`, transform: `translateY(${(1 - t) * 22}px)`, textShadow: "0 4px 30px rgba(40,10,20,0.55)" }}>
            {p}
          </span>
        );
      })}
    </div>
  );
};

export const AtardecerFrase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = interpolate(frame, [0, DURACION_ATARDECER], [1.0, 1.08]);
  const entrada = interpolate(frame, [0, 24], [0, 1], clamp);
  const subrayado = interpolate(frame, [165, 190], [0, 1], clamp);
  const firma = spring({ frame: frame - 300, fps, config: { damping: 20, mass: 1.2 } });
  const salida = interpolate(frame, [DURACION_ATARDECER - 20, DURACION_ATARDECER], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: entrada * salida }}>
        <AbsoluteFill style={{ transform: `scale(${zoom})`, filter: "contrast(1.06) saturate(1.12)" }}>
          <Video src={staticFile("tomas/atardecer-julio.mp4")} muted objectFit="cover" style={{ width: "100%", height: "100%" }} />
        </AbsoluteFill>
        {/* Tono cálido, velo suave detrás del texto y viñeta */}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(58,31,74,0.25), rgba(255,138,80,0.08))", mixBlendMode: "soft-light" }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 22% at 50% 36%, rgba(40,14,30,0.32) 0%, transparent 100%)" }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(14,10,24,0.35) 0%, transparent 18%, transparent 75%, rgba(10,8,18,0.5) 100%)" }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)" }} />

        <div style={{ position: "absolute", left: 70, right: 70, top: 470, display: "flex", flexDirection: "column", gap: 26 }}>
          <Linea palabras={["No", "todos", "los", "finales", "son", "tristes…"]} tiempos={[45, 53, 60, 67, 82, 86]} tam={60} cursiva={false} color={C.crema} />
          <div style={{ position: "relative", alignSelf: "center" }}>
            <Linea palabras={["algunos", "se", "ven", "así."]} tiempos={[119, 148, 165, 170]} tam={86} cursiva color={C.naranja} />
            <div style={{ position: "absolute", left: 0, bottom: -6, height: 4, width: `${subrayado * 100}%`, borderRadius: 2, background: `linear-gradient(90deg, ${C.naranja}, ${C.coral})` }} />
          </div>
          <div style={{ marginTop: 26 }}>
            <Linea palabras={["Y", "mañana…", "vuelve", "a", "salir."]} tiempos={[178, 209, 221, 248, 250]} tam={58} cursiva color={C.crema} />
          </div>
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 30, letterSpacing: 3, color: "rgba(255,244,230,0.85)", opacity: firma, transform: `translateY(${(1 - firma) * 20}px)`, textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>
          @julio.chaidez1
        </div>
      </AbsoluteFill>

      <Audio src={staticFile("voz-atardecer.mp3")} />
      <Audio src={staticFile("musica-reflexion-dar.mp3")} volume={(f) => 0.22 * interpolate(f, [0, 20, DURACION_ATARDECER - 45, DURACION_ATARDECER], [0, 1, 1, 0], clamp)} />
      <Audio src={staticFile("sfx/olas.wav")} volume={(f) => 0.14 * interpolate(f, [0, 20, DURACION_ATARDECER - 30, DURACION_ATARDECER], [0, 1, 1, 0], clamp)} />
      <Sequence from={163} durationInFrames={45}>
        <Audio src={staticFile("sfx/brillo.wav")} volume={0.3} />
      </Sequence>
      <Grano />
    </AbsoluteFill>
  );
};
