// Fondo en movimiento (pack de movimiento): degradado rojo a #151515 que gira
// despacio, formas geométricas grandes (@remotion/shapes) que flotan con ruido
// (@remotion/noise) y un pulso suave opcional al ritmo de la música.
import { noise2D } from "@remotion/noise";
import { Circle, Rect, Triangle } from "@remotion/shapes";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FONDO, ROJO_DA } from "./constantes";

export const FondoMovimiento: React.FC<{ pulso: number }> = ({ pulso }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const angulo = 160 + Math.sin(t * 0.25) * 25;
  const deriva = (semilla: string, escala: number) => ({
    x: noise2D(semilla, t * 0.08, 0) * escala,
    y: noise2D(semilla, 0, t * 0.08) * escala,
  });
  const formas = [
    { id: "a", x: 120, y: 520, r: t * 4, el: <Circle radius={300} fill="none" stroke={ROJO_DA} strokeWidth={26} /> },
    { id: "b", x: 860, y: 1500, r: -t * 6, el: <Triangle length={520} direction="up" fill={ROJO_DA} cornerRadius={30} /> },
    { id: "c", x: 900, y: 360, r: t * 3, el: <Rect width={340} height={340} fill="none" stroke="#ffffff" strokeWidth={10} cornerRadius={40} /> },
    { id: "d", x: 160, y: 1650, r: -t * 2, el: <Circle radius={180} fill={ROJO_DA} /> },
  ];
  return (
    <AbsoluteFill style={{ background: FONDO, transform: `scale(${pulso})` }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(${angulo}deg, rgba(204,35,40,0.38) 0%, rgba(127,29,29,0.18) 35%, ${FONDO} 70%)`,
        }}
      />
      {formas.map((f) => {
        const d = deriva(f.id, 60);
        return (
          <div
            key={f.id}
            style={{
              position: "absolute",
              left: f.x + d.x,
              top: f.y + d.y,
              transform: `translate(-50%, -50%) rotate(${f.r}deg)`,
              opacity: 0.09,
            }}
          >
            {f.el}
          </div>
        );
      })}
      {/* Ruido sutil: manchas de luz que se mueven despacio. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + noise2D("luz-x", t * 0.1, 1) * 30}% ${45 + noise2D("luz-y", 1, t * 0.1) * 25}%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 45%)`,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// Pulso al ritmo (si hay bpm): 1.0 → 1.03 al inicio de cada latido.
export const pulsoBpm = (t: number, bpm: number | null) => {
  if (!bpm) return 1;
  const periodo = 60 / bpm;
  const fase = (t % periodo) / periodo;
  return 1 + 0.03 * Math.max(0, 1 - fase * 4);
};
