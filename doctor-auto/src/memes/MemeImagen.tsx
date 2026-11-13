import { AbsoluteFill, Img, staticFile } from "remotion";
import { POPPINS, ROJO_DA } from "../doctor-auto/constantes";

// Meme en imagen 4:5 (1080×1350): lienzo blanco, el meme al centro y la marca discreta.
export const MemeImagen: React.FC<{ archivo: string }> = ({ archivo }) => (
  <AbsoluteFill style={{ backgroundColor: "#ffffff", alignItems: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 64 }}>
      <div style={{ width: 12, height: 12, borderRadius: 6, background: ROJO_DA }} />
      <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 28, letterSpacing: "0.3em", color: "#1a1a1a" }}>DOCTOR AUTO</div>
    </div>
    <div style={{ marginTop: 40, width: 980, height: 1060, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile(archivo)} style={{ maxWidth: 980, maxHeight: 1060, borderRadius: 18, boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }} />
    </div>
    <div style={{ position: "absolute", bottom: 46, fontFamily: POPPINS, fontWeight: 700, fontSize: 24, color: "#8a8a8a" }}>El Doctor de tu auto · CDMX</div>
  </AbsoluteFill>
);
