import { AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { Grano, Toma } from "./cine";
import { C, Reel, SANS, SERIF } from "./comun";

// Reflexión: «A veces das tanto…». Voz con 1 s de silencio al inicio (public/voz-reflexion-dar.mp3).
export const DURACION_REFLEXION_DAR = 510;

const SONIDOS: [number, string, number][] = [
  [190, "whoosh", 0.12],
  [372, "whoosh", 0.12],
  [335, "brillo", 0.35], // «cuidarlo»
];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Una línea que aparece palabra por palabra, desenfocada y subiendo.
const Linea: React.FC<{ texto: string; desde: number; tam: number; cursiva: boolean; color: string }> = ({ texto, desde, tam, cursiva, color }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${tam * 0.28}px` }}>
      {texto.split(" ").map((p, i) => {
        const t = interpolate(frame, [desde + i * 3, desde + i * 3 + 14], [0, 1], clamp);
        return (
          <span
            key={i}
            style={{
              fontFamily: SERIF,
              fontWeight: cursiva ? 600 : 700,
              fontStyle: cursiva ? "italic" : "normal",
              fontSize: tam,
              lineHeight: 1.2,
              color,
              opacity: t,
              filter: `blur(${(1 - t) * 10}px)`,
              transform: `translateY(${(1 - t) * 22}px)`,
              textShadow: "0 4px 30px rgba(0,0,0,0.55)",
            }}
          >
            {p}
          </span>
        );
      })}
    </div>
  );
};

// Toma con fundido de entrada y salida (para encadenar tomas sin cortes).
const Fundido: React.FC<{ desde: number; dur: number; children: React.ReactNode }> = ({ desde, dur, children }) => {
  const frame = useCurrentFrame();
  // La primera toma empieza visible y la última no se apaga al final.
  const fin = desde + dur >= DURACION_REFLEXION_DAR;
  const o = interpolate(frame, [desde, desde + 20, desde + dur - 20, desde + dur], [desde === 0 ? 1 : 0, 1, 1, fin ? 1 : 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Sequence from={desde} durationInFrames={dur}>
        {children}
      </Sequence>
    </AbsoluteFill>
  );
};

const Escena: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grupoA = interpolate(frame, [180, 198], [1, 0], clamp);
  const subrayado = interpolate(frame, [330, 352], [0, 1], clamp);
  const firma = spring({ frame: frame - 400, fps, config: { damping: 16 } });
  return (
    <AbsoluteFill>
      <Fundido desde={0} dur={215}>
        <Toma src="mar-atardecer.mp4" desde={2} dur={215} zoom={[1.0, 1.08]} mover={0} />
      </Fundido>
      <Fundido desde={195} dur={200}>
        <Toma src="mujer-playa.mp4" desde={1} dur={200} zoom={[1.1, 1.0]} mover={-20} />
      </Fundido>
      <Fundido desde={375} dur={135}>
        <Toma src="playa.mp4" desde={8} dur={155} zoom={[1.0, 1.06]} mover={10} />
      </Fundido>
      {/* Velo en el centro para que la frase se lea sobre cualquier toma */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 30% at 50% 47%, rgba(6,8,20,0.45) 0%, transparent 100%)" }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 700, display: "flex", flexDirection: "column", gap: 26, opacity: grupoA }}>
        <Linea texto="A veces das tanto…" desde={30} tam={84} cursiva color={C.crema} />
        <Linea texto="que se te olvida que tú también mereces recibir." desde={94} tam={56} cursiva={false} color={C.crema} />
      </div>
      {frame >= 205 ? (
        <div style={{ position: "absolute", left: 80, right: 80, top: 680, display: "flex", flexDirection: "column", gap: 30 }}>
          <Linea texto="No es que des demasiado." desde={211} tam={66} cursiva={false} color={C.crema} />
          <Linea texto="Es que se lo diste a quien" desde={276} tam={66} cursiva color={C.crema} />
          <div style={{ position: "relative", alignSelf: "center" }}>
            <Linea texto="no sabía cuidarlo." desde={300} tam={80} cursiva color={C.naranja} />
            <div style={{ position: "absolute", left: 0, bottom: -8, height: 4, width: `${subrayado * 100}%`, borderRadius: 2, background: `linear-gradient(90deg, ${C.naranja}, ${C.coral})` }} />
          </div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 30, letterSpacing: 3, color: "rgba(255,244,230,0.8)", opacity: firma }}>
        @julio.chaidez1
      </div>
    </AbsoluteFill>
  );
};

export const ReflexionDar: React.FC = () => (
  <>
    <Reel
      duracion={DURACION_REFLEXION_DAR}
      fondo={<AbsoluteFill style={{ background: "#000" }} />}
      etiqueta={null}
      voz="voz-reflexion-dar.mp3"
      musica="musica-reflexion-dar.mp3"
      volumenMusica={0.22}
      sonidos={SONIDOS}
      escenas={[{ desde: 0, dur: DURACION_REFLEXION_DAR, Pieza: Escena }]}
    />
    <Audio src={staticFile("sfx/olas.wav")} volume={0.12} />
    <Grano />
  </>
);
