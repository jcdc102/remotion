// Mascota a partir de una imagen PNG transparente (ver scripts/quitar-fondo.py).
// Animaciones: entra-rebote, habla, voltea, susto, flecha-senala, duda,
// pulgar-final y grande-centro. "globo" muestra un globo de diálogo.
import { Img, interpolate, spring, staticFile, useVideoConfig } from "remotion";
import { estiloBorde } from "./Texto";

export type AnimacionMascota =
  | "entra-rebote"
  | "habla"
  | "voltea"
  | "susto"
  | "flecha-senala"
  | "duda"
  | "pulgar-final"
  | "grande-centro";

// Imagen por pose (campo "pose" del guion). Si una pose no existe, se usa "pulgar".
// Las poses nuevas se generaron con ElevenLabs a partir de mascota.png.
const POSES: Record<string, string> = {
  pulgar: "estructura8/bateria/mascota-transparente.png",
  senala: "estructura8/poses/mascota-senala-transparente.png",
  susto: "estructura8/poses/mascota-susto-transparente.png",
  duda: "estructura8/poses/mascota-duda-transparente.png",
};

export type Ancla = { x: number; abajo: number; alto: number };

export const Mascota: React.FC<{
  pose: string;
  animacion: string;
  globo: string | null;
  frameLocal: number;
  t: number;
  boca: number;
  ancla: Ancla;
  anclaAnterior: Ancla;
  objetivo: { x: number; y: number };
  colorAcento: string;
  fuente: string;
  espejoCompleto: boolean;
  globoArriba: number;
  pulso: number;
}> = ({ pose, animacion, globo, frameLocal, t, boca, ancla, anclaAnterior, objetivo, colorAcento, fuente, espejoCompleto, globoArriba, pulso }) => {
  const { fps } = useVideoConfig();
  const u = frameLocal / fps;
  const resorte = (retraso: number, damping: number) =>
    spring({ frame: frameLocal - Math.round(retraso * fps), fps, config: { damping } });

  // Traslado suave entre la posición anterior y la actual.
  const mueve = resorte(0, 14);
  const x = interpolate(mueve, [0, 1], [anclaAnterior.x, ancla.x]);
  const abajo = interpolate(mueve, [0, 1], [anclaAnterior.abajo, ancla.abajo]);
  const alto = interpolate(mueve, [0, 1], [anclaAnterior.alto, ancla.alto]);

  // Balanceo con la voz (siempre un poco; más fuerte en "habla").
  const fuerzaVoz = animacion === "habla" ? 1 : 0.4;
  // Respira siempre: 1.5% de escala y 1.5° de rotación, aunque no hable.
  let giro = Math.sin(t * 9) * boca * 6 * fuerzaVoz + Math.sin(t * 1.7) * 1.5;
  let dy = -boca * 14 * fuerzaVoz + Math.sin(t * 2.2) * 5;
  let dx = 0;
  let escala = (1 + boca * 0.03 * fuerzaVoz + Math.sin(t * 2.2) * 0.015) * pulso;
  let espejo = 1;
  let vuelta = 0;

  if (animacion === "entra-rebote") {
    dy += (1 - resorte(0.05, 7)) * 760;
  }
  if (animacion === "voltea") {
    // Giro hacia el contenido (izquierda). Con espejoCompleto se refleja la
    // imagen; si no, solo gira en 3D para no invertir el logo de la gorra.
    if (espejoCompleto) {
      espejo = interpolate(resorte(0.1, 12), [0, 1], [1, -1]);
    } else {
      vuelta = -38 * resorte(0.1, 12);
    }
  }
  // Susto o pregunta: se agranda a 1.15 y tiembla 6 fotogramas.
  if (animacion === "susto" || animacion === "duda") {
    escala *= 1 + 0.15 * resorte(0, 12);
    if (frameLocal >= 0 && frameLocal < 6) dx += Math.sin(frameLocal * 2.6) * 10;
  }
  if (animacion === "susto") {
    dy += -Math.abs(Math.sin(u * 30)) * 10 * Math.max(0, 1 - u / 0.8);
  }
  if (animacion === "duda") {
    giro += -11 * resorte(0, 12);
  }
  if (animacion === "pulgar-final") {
    escala *= 1 + 0.12 * resorte(0.1, 9) + 0.04 * Math.sin(u * 6);
  }

  const globoEntrada = resorte(0.35, 10);
  const signo = resorte(0.15, 8);
  const flecha = resorte(0.2, 12);
  const ancho = alto * 0.85;
  const cabeza = abajo - alto;

  return (
    <>
      {animacion === "flecha-senala" ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: flecha }}>
          {(() => {
            // Sale de la cabeza y sube por el borde derecho hasta el ícono,
            // sin cruzar la zona de textos.
            const x0 = x + ancho * 0.12;
            const y0 = cabeza - 10;
            const cx = 1010;
            const cy = (y0 + objetivo.y) / 2 + 40;
            const avance = flecha * (0.92 + 0.08 * Math.sin(u * 7));
            const punto = (k: number) => ({
              px: (1 - k) ** 2 * x0 + 2 * k * (1 - k) * cx + k * k * objetivo.x,
              py: (1 - k) ** 2 * y0 + 2 * k * (1 - k) * cy + k * k * objetivo.y,
            });
            const { px: x1, py: y1 } = punto(avance);
            const { px: xa, py: ya } = punto(avance * 0.94);
            const ang = Math.atan2(y1 - ya, x1 - xa);
            const qx = (1 - avance) * x0 + avance * cx;
            const qy = (1 - avance) * y0 + avance * cy;
            const punta = (k: number) => `${x1 + Math.cos(ang + k) * 46},${y1 + Math.sin(ang + k) * 46}`;
            return (
              <g>
                <path d={`M${x0} ${y0} Q${qx} ${qy} ${x1} ${y1}`} stroke="#000" strokeWidth={26} fill="none" strokeLinecap="round" />
                <path d={`M${x0} ${y0} Q${qx} ${qy} ${x1} ${y1}`} stroke={colorAcento} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray="28 18" strokeDashoffset={-u * 80} />
                <polygon points={`${x1},${y1} ${punta(Math.PI * 0.82)} ${punta(-Math.PI * 0.82)}`} fill={colorAcento} stroke="#000" strokeWidth={8} strokeLinejoin="round" />
              </g>
            );
          })()}
        </svg>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: x - ancho / 2 + dx,
          top: cabeza + dy,
          width: ancho,
          height: alto,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          transform: `rotate(${giro}deg) scale(${escala})`,
          transformOrigin: "50% 100%",
          filter: "drop-shadow(0 24px 30px rgba(0,0,0,0.55))",
        }}
      >
        <Img
          src={staticFile(POSES[pose] ?? POSES.pulgar)}
          style={{ height: alto, width: "auto", transform: `perspective(900px) rotateY(${vuelta}deg) scaleX(${espejo})` }}
        />
      </div>
      {animacion === "susto" ? (
        <>
          <div style={{ position: "absolute", left: x + ancho * 0.18, top: cabeza - 120 * signo, fontFamily: fuente, fontSize: 150, color: colorAcento, transform: `scale(${signo}) rotate(${Math.sin(u * 20) * 8}deg)`, ...estiloBorde(16) }}>
            !
          </div>
          {[0, 1].map((k) => {
            const c = (u * 1.2 + k * 0.5) % 1;
            return (
              <svg key={k} width={40} height={56} style={{ position: "absolute", left: x - ancho * (0.42 - k * 0.8), top: cabeza + 40 + c * 120, opacity: 1 - c }}>
                <path d="M20 2 Q36 30 20 52 Q4 30 20 2" fill="#7fd3ff" stroke="#000" strokeWidth={4} />
              </svg>
            );
          })}
        </>
      ) : null}
      {animacion === "duda" ? (
        <div style={{ position: "absolute", left: x + ancho * 0.2, top: cabeza - 140 + Math.sin(u * 4) * 10, fontFamily: fuente, fontSize: 140, color: "#fff", transform: `scale(${signo}) rotate(14deg)`, ...estiloBorde(16) }}>
          ?
        </div>
      ) : null}
      {globo ? (
        // Globo de diálogo sobre la cabeza, pegado a la derecha (dentro del 30%–60% de la altura).
        <div
          style={{
            position: "absolute",
            right: 70,
            top: globoArriba,
            maxWidth: 480,
            transform: `scale(${globoEntrada})`,
            transformOrigin: "90% 100%",
            background: "#fff",
            border: "7px solid #000",
            borderRadius: 34,
            padding: "14px 28px",
            fontFamily: fuente,
            fontSize: 54,
            lineHeight: 1.05,
            color: "#111",
            whiteSpace: "nowrap",
            boxShadow: "0 14px 26px rgba(0,0,0,0.45)",
          }}
        >
          {globo}
          <svg width={50} height={40} style={{ position: "absolute", right: 110, bottom: -36 }}>
            <path d="M4 0 L44 0 L36 36 Z" fill="#fff" stroke="#000" strokeWidth={7} strokeLinejoin="round" />
            <rect x={6} y={0} width={36} height={8} fill="#fff" />
          </svg>
        </div>
      ) : null}
    </>
  );
};
