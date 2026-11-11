import { loadFont } from "@remotion/google-fonts/Poppins";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const { fontFamily } = loadFont("normal", { weights: ["700", "800"], subsets: ["latin"] });

// Persona recortada (cuadro por cuadro) sobre un fondo nuevo, con texto arriba y remate de Doctor Auto.
export type RecorteProps = {
  cuadros: number;
  carpeta: string;
  fondo: string;
  velocidadFondo: number;
  texto: string;
  musica: string;
  remate: string;
  subremate: string;
};

const DUR_REMATE = 2.8;
export const duracionRecorte = (p: RecorteProps) => p.cuadros + Math.round(DUR_REMATE * 30);

export const Recorte: React.FC<RecorteProps> = ({ cuadros, carpeta, fondo, velocidadFondo, texto, musica, remate, subremate }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.min(frame, cuadros - 1) + 1;
  const entraTexto = spring({ frame: frame - 4, fps, config: { damping: 14 } });
  const local = frame - cuadros;
  const entra = spring({ frame: local, fps, config: { damping: 13 } });
  const entraSub = spring({ frame: local - 12, fps, config: { damping: 14 } });
  const zoomFondo = interpolate(frame, [0, cuadros], [1.15, 1.3]);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ transform: `scale(${zoomFondo})`, filter: local >= 0 ? "blur(18px) brightness(0.45)" : "none" }}>
        <OffthreadVideo src={staticFile(fondo)} muted playbackRate={velocidadFondo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <Sequence durationInFrames={cuadros}>
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
          <Img src={staticFile(`${carpeta}/f${String(n).padStart(4, "0")}.png`)} style={{ width: 1080, filter: "drop-shadow(0 0 30px rgba(0,0,0,0.55))" }} />
        </AbsoluteFill>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
          <div
            style={{
              fontFamily,
              fontWeight: 800,
              fontSize: 62,
              lineHeight: 1.18,
              color: "white",
              textAlign: "center",
              padding: "0 70px",
              textShadow: "0 0 10px rgba(0,0,0,0.9), 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000",
              opacity: entraTexto,
              transform: `translateY(${(1 - entraTexto) * 30}px)`,
            }}
          >
            {texto}
          </div>
        </AbsoluteFill>
        <Audio src={staticFile("sfx/memes/tono-llamada.mp3")} volume={0.7} />
        <Audio src={staticFile(musica)} volume={(f) => interpolate(f, [0, 10, cuadros - 15, cuadros], [0, 0.75, 0.75, 0], { extrapolateRight: "clamp" })} />
      </Sequence>
      <Sequence from={cuadros}>
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
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 56, color: "rgba(255,255,255,0.8)", letterSpacing: -1, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>doctor auto</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const RECORTE_CHOQUE: RecorteProps = {
  cuadros: 345,
  carpeta: "cut",
  fondo: "real/v1-varado.mp4",
  velocidadFondo: 0.43,
  texto: "Yo marcándole a mi papá para decirle que choqué su coche que agarré sin permiso 😭",
  musica: "sfx/memes/violin.mp3",
  remate: "Tranqui 😎\nEn Doctor Auto\nlo dejamos como nuevo\nantes de que llegue\ntu papá",
  subremate: "Hojalatería y pintura · CDMX 🔧",
};
