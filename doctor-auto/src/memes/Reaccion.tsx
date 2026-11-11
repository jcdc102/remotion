import { loadFont } from "@remotion/google-fonts/Poppins";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const { fontFamily } = loadFont("normal", { weights: ["700", "800"], subsets: ["latin"] });

// Clip real ajeno con su audio original + marca chica + remate de Doctor Auto al final.
export type ReaccionProps = { archivo: string; fondo: string; durClip: number; remate: string; subremate: string };

export const DUR_REMATE = 2.8;
export const duracionReaccion = (p: ReaccionProps) => Math.round((p.durClip + DUR_REMATE) * 30);

export const Reaccion: React.FC<ReaccionProps> = ({ archivo, fondo, durClip, remate, subremate }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const finClip = Math.round(durClip * fps);
  const local = frame - finClip;
  const entra = spring({ frame: local, fps, config: { damping: 13 } });
  const entraSub = spring({ frame: local - 12, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence durationInFrames={finClip}>
        <OffthreadVideo src={staticFile(archivo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Sequence>
      <Sequence from={finClip}>
        <AbsoluteFill style={{ filter: "blur(18px) brightness(0.45)", transform: "scale(1.1)" }}>
          <Img src={staticFile(fondo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 50px", gap: 36 }}>
          <div style={{ fontFamily, fontWeight: 800, fontSize: 66, color: "white", textAlign: "center", lineHeight: 1.12, transform: `scale(${0.6 + 0.4 * entra})`, opacity: entra, textShadow: "0 6px 24px rgba(0,0,0,0.6)", whiteSpace: "pre-line" }}>
            {remate}
          </div>
          <div style={{ fontFamily, fontWeight: 700, fontSize: 46, color: "#111", background: "white", borderRadius: 18, padding: "16px 30px", textAlign: "center", opacity: entraSub, transform: `translateY(${(1 - entraSub) * 40}px)` }}>
            {subremate}
          </div>
        </AbsoluteFill>
        <Audio src={staticFile("sfx/memes/boing.mp3")} volume={0.35} />
        <Audio src={staticFile("sfx/memes/musica.mp3")} volume={(f) => interpolate(f, [0, 8, 60, 84], [0, 0.3, 0.3, 0], { extrapolateRight: "clamp" })} />
      </Sequence>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 70 }}>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 56, color: "rgba(255,255,255,0.8)", letterSpacing: -1, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>doctor auto</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const REACCION_CHOQUE: ReaccionProps = {
  archivo: "real/ref-choque.mp4",
  fondo: "real/ref-choque-fin.jpg",
  durClip: 11.5,
  remate: "Tranqui 😎\nEn Doctor Auto\nlo dejamos como nuevo\nantes de que llegue\ntu papá",
  subremate: "Hojalatería y pintura · CDMX 🔧",
};
