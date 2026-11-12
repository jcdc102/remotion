import { loadFont } from "@remotion/google-fonts/Poppins";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const { fontFamily } = loadFont("normal", { weights: ["700", "800"], subsets: ["latin"] });

// Audio viral completo + tomas cortadas sobre las palabras + subtítulos del audio + remate.
type Toma = { archivo: string; desde: number; t0: number; t1: number; zoom: [number, number]; pos?: string };
type Sub = { t0: number; t1: number; texto: string };
export type AudioMemeProps = { audio: string; durAudio: number; titulo: string; tomas: Toma[]; subs: Sub[]; remate: string; subremate: string; fondoRemate: string };

const DUR_REMATE = 2.8;
export const duracionAudioMeme = (p: AudioMemeProps) => Math.round((p.durAudio + DUR_REMATE) * 30);

const contorno = "0 0 10px rgba(0,0,0,0.9), 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000";

export const AudioMeme: React.FC<AudioMemeProps> = ({ audio, durAudio, titulo, tomas, subs, remate, subremate, fondoRemate }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const finAudio = Math.round(durAudio * fps);
  const local = frame - finAudio;
  const entra = spring({ frame: local, fps, config: { damping: 13 } });
  const entraSub = spring({ frame: local - 12, fps, config: { damping: 14 } });
  const sub = subs.find((s) => t >= s.t0 && t < s.t1);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {tomas.map((toma, i) => {
        const de = Math.round(toma.t0 * fps);
        const largo = Math.round((toma.t1 - toma.t0) * fps);
        const l = frame - de;
        const golpe = spring({ frame: l, fps, config: { damping: 12, mass: 0.5 } });
        const escala = interpolate(l, [0, largo], toma.zoom, { extrapolateRight: "clamp" }) * (1 + 0.07 * (1 - golpe));
        const temblor = Math.max(0, 1 - l / 10) * 14;
        return (
          <Sequence key={i} from={de} durationInFrames={largo}>
            <AbsoluteFill style={{ transform: `translate(${Math.sin(l * 2.7) * temblor}px, ${Math.cos(l * 3.3) * temblor}px) scale(${escala})` }}>
              <OffthreadVideo src={staticFile(toma.archivo)} muted startFrom={Math.round(toma.desde * fps)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: toma.pos ?? "50% 50%" }} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <Sequence durationInFrames={finAudio}>
        <Audio src={staticFile(audio)} volume={1} />
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
          <div style={{ fontFamily, fontWeight: 800, fontSize: 64, lineHeight: 1.16, color: "white", textAlign: "center", padding: "0 70px", textShadow: contorno }}>{titulo}</div>
        </AbsoluteFill>
        {sub ? (
          <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380 }}>
            <div key={sub.t0} style={{ fontFamily, fontWeight: 800, fontSize: 70, lineHeight: 1.12, color: "#FFE14D", textAlign: "center", padding: "0 70px", textShadow: contorno, transform: `scale(${0.85 + 0.15 * spring({ frame: frame - Math.round(sub.t0 * fps), fps, config: { damping: 10 } })})` }}>
              {sub.texto}
            </div>
          </AbsoluteFill>
        ) : null}
      </Sequence>
      <Sequence from={finAudio}>
        <AbsoluteFill style={{ filter: "blur(18px) brightness(0.45)", transform: "scale(1.15)" }}><Img src={staticFile(fondoRemate)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 50px", gap: 36 }}>
          <div style={{ fontFamily, fontWeight: 800, fontSize: 66, color: "white", textAlign: "center", lineHeight: 1.12, transform: `scale(${0.6 + 0.4 * entra})`, opacity: entra, textShadow: "0 6px 24px rgba(0,0,0,0.6)", whiteSpace: "pre-line" }}>{remate}</div>
          <div style={{ fontFamily, fontWeight: 700, fontSize: 46, color: "#111", background: "white", borderRadius: 18, padding: "16px 30px", textAlign: "center", opacity: entraSub, transform: `translateY(${(1 - entraSub) * 40}px)` }}>{subremate}</div>
        </AbsoluteFill>
        <Audio src={staticFile("sfx/memes/boing.mp3")} volume={0.35} />
        <Audio src={staticFile("sfx/memes/musica.mp3")} volume={(f) => interpolate(f, [0, 8, 60, 84], [0, 0.3, 0.3, 0], { extrapolateRight: "clamp" })} />
      </Sequence>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 56, color: "rgba(255,255,255,0.8)", letterSpacing: -1, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>doctor auto</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const AUDIO_LLORAR: AudioMemeProps = {
  audio: "sfx/memes/deja-de-llorar.wav",
  durAudio: 11.5,
  titulo: "Yo cuando mi carro empieza a tirar anticongelante:",
  tomas: [
    { archivo: "real/k5-fuga.mp4", desde: 1.0, t0: 0, t1: 1.16, zoom: [1.0, 1.08] },
    { archivo: "real/k5-fuga.mp4", desde: 2.6, t0: 1.16, t1: 2.1, zoom: [1.35, 1.45] },
    { archivo: "real/m4-fuga.mp4", desde: 1.4, t0: 2.1, t1: 3.24, zoom: [1.05, 1.15] },
    { archivo: "real/k4-radiador.mp4", desde: 0.6, t0: 3.24, t1: 5.46, zoom: [1.05, 1.2] },
    { archivo: "real/k5-fuga.mp4", desde: 3.4, t0: 5.46, t1: 6.5, zoom: [1.5, 1.6] },
    { archivo: "real/v8-parabrisas.mp4", desde: 0.4, t0: 6.5, t1: 8.58, zoom: [1.05, 1.15] },
    { archivo: "real/v1-varado.mp4", desde: 0.8, t0: 8.58, t1: 11.5, zoom: [1.05, 1.3] },
  ],
  subs: [
    { t0: 0, t1: 1.9, texto: "¡Deja de llorar!" },
    { t0: 3.24, t1: 5.2, texto: "¡Deja de llorar!" },
    { t0: 5.46, t1: 6.3, texto: "¡Deja de llorar!" },
    { t0: 6.5, t1: 8.4, texto: "¡Límpiate las lágrimas y tranquilízate!" },
    { t0: 8.58, t1: 11.5, texto: "Porque si no, te voy a hacer llorar de verdad 😡" },
  ],
  remate: "¿Tu carro anda\n\"llorando\"? 💧\nEn Doctor Auto le\nrevisamos las fugas",
  subremate: "Sucursales en CDMX 🔧",
  fondoRemate: "real/v1-varado-fin.jpg",
};

export const AUDIO_TAKA: AudioMemeProps = {
  audio: "sfx/memes/taka-taka.wav",
  durAudio: 7.65,
  titulo: "Yo explicándole al mecánico el ruido que hace mi carro:",
  tomas: [
    { archivo: "mixkit/4521.mp4", desde: 2.0, t0: 0, t1: 1.92, zoom: [1.0, 1.08], pos: "30% 50%" },
    { archivo: "mixkit/24815.mp4", desde: 1.0, t0: 1.92, t1: 2.42, zoom: [1.1, 1.2], pos: "18% 50%" },
    { archivo: "mixkit/4716.mp4", desde: 2.0, t0: 2.42, t1: 2.74, zoom: [1.1, 1.2], pos: "40% 50%" },
    { archivo: "mixkit/13270.mp4", desde: 1.0, t0: 2.74, t1: 3.3, zoom: [1.1, 1.2], pos: "45% 50%" },
    { archivo: "mixkit/17675.mp4", desde: 12.0, t0: 3.3, t1: 3.78, zoom: [1.1, 1.2], pos: "60% 50%" },
    { archivo: "mixkit/13260.mp4", desde: 1.0, t0: 3.78, t1: 4.68, zoom: [1.05, 1.15], pos: "35% 50%" },
    { archivo: "mixkit/41937.mp4", desde: 1.0, t0: 4.68, t1: 5.5, zoom: [1.05, 1.15], pos: "60% 50%" },
    { archivo: "mixkit/64.mp4", desde: 3.0, t0: 5.5, t1: 6.5, zoom: [1.1, 1.25], pos: "45% 50%" },
    { archivo: "mixkit/1960.mp4", desde: 2.0, t0: 6.5, t1: 7.65, zoom: [1.0, 1.15] },
  ],
  subs: [
    { t0: 0, t1: 1.9, texto: "Resulta que de repente oímos..." },
    { t0: 1.92, t1: 4.6, texto: "¡Taka, taka, taka, taka!" },
    { t0: 4.68, t1: 5.3, texto: "Y dos..." },
    { t0: 5.3, t1: 7.65, texto: "¡Vau! ¡Vau!" },
  ],
  remate: "Tranqui 😎\nEn Doctor Auto sí\nentendemos el\n\"taka taka\"",
  subremate: "Diagnóstico por escáner · CDMX 🔧",
  fondoRemate: "mixkit/72-fin.jpg",
};
