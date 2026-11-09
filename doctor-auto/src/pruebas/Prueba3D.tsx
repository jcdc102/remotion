// Composición de prueba del 3D (no se usa en los videos).
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Bateria3D, Escena3D, Llanta3D, Moneda3D } from "../doctor-auto/tres";

export const Prueba3D: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Img src={staticFile("real/i1-taller.png")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(6px) brightness(0.6)" }} />
      <Escena3D>
        <Moneda3D giro={t * 120 + 25} inclina={0.15} x={0} y={2.2} escala={0.9} />
        <Llanta3D giro={t * 90} orbita={0.5} x={-1.1} y={-1.2} escala={0.55} calor={0} />
        <Bateria3D giro={-0.5} x={1.3} y={-1.4} escala={0.45} carga={0.6} escarcha={0} />
      </Escena3D>
    </AbsoluteFill>
  );
};
