// Diseño de las 8 piezas del tema "alineacion". Los momentos salen de las
// palabras de "resaltar" sincronizadas con la voz.
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { momentoDe, type Pieza } from "../datos";
import { sacudida } from "../Piezas";
import { Escenario, ZonaTexto } from "../bateria/Escenas";
import { ANTON, DEGRADADO, GRIS, POPPINS, PESO_POPPINS } from "../../doctor-auto/constantes";
import { TituloDA } from "../../doctor-auto/Texto";
import { AutoCenital, CorteYVolante, LlantaDesgaste, OdometroCalendarioManometro, Reloj } from "./Iconos";

const limitar = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useTiempo = (p: Pieza) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: p.inicio + frame / fps };
};
const resorte = (frame: number, fps: number, momento: number, inicio: number, damping = 12) =>
  spring({ frame: frame - Math.round((momento - inicio) * fps), fps, config: { damping } });

// Chip de señal: activo con el degradado rojo, inactivo en gris oscuro.
const Chip: React.FC<{ numero: number; texto: string; entrada: number; activo: boolean }> = ({ numero, texto, entrada, activo }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "8px 30px 8px 10px",
      borderRadius: 50,
      background: activo ? DEGRADADO : "#262626",
      boxShadow: "0 10px 20px rgba(0,0,0,0.45)",
      transform: `translateX(${(1 - entrada) * -900}px)`,
      fontFamily: POPPINS,
      fontWeight: PESO_POPPINS,
      fontSize: 46,
      color: activo ? "#fff" : GRIS,
    }}
  >
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        background: "#fff",
        color: "#151515",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: ANTON,
        fontSize: 36,
      }}
    >
      {numero}
    </div>
    {texto}
  </div>
);

// El aviso aparece en los últimos 2.6 s de la pieza (al menos 1.5 s después de empezar).
export const momentoAviso = (p: Pieza) => Math.max(p.inicio + 1.5, p.fin - 2.6);

// Aviso: franja roja de lado a lado con texto blanco.
const Franja: React.FC<{ texto: string; entrada: number }> = ({ texto, entrada }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 610,
      minHeight: 200,
      background: DEGRADADO,
      boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `translateX(${(1 - entrada) * -1100}px)`,
    }}
  >
    <div
      style={{
        // Corrido a la izquierda para no cruzarse con la flecha de la mascota.
        maxWidth: 680,
        marginRight: 140,
        padding: "18px 0",
        textAlign: "center",
        fontFamily: POPPINS,
        fontWeight: PESO_POPPINS,
        fontSize: 52,
        lineHeight: 1.2,
        color: "#fff",
      }}
    >
      {texto}
    </div>
  </div>
);

// 1 · Gancho
export const Gancho: React.FC<{ p: Pieza }> = ({ p }) => {
  const { frame, fps, t } = useTiempo(p);
  const icono = spring({ frame, fps, config: { damping: 9 } });
  const texto = resorte(frame, fps, p.inicio + 0.3, p.inicio, 9);
  const s = sacudida(t, momentoDe(p, p.resaltar[0]), 0.4, 14);
  return (
    <AbsoluteFill>
      <Escenario transform={`translateX(${(1 - icono) * 700}px) rotate(${(1 - icono) * 90}deg)`}>
        <LlantaDesgaste tamano={280} marca={0.5 + 0.5 * Math.sin(t * 7)} giro={t * 1.5} />
      </Escenario>
      <ZonaTexto style={{ transform: `translate(${s}px, 0) scale(${1.8 - 0.8 * texto})`, opacity: texto }}>
        <TituloDA texto={p.pantalla ?? ""} resaltar={p.resaltar} tamano={112} golpe={1 + 0.2 * (1 - resorte(frame, fps, momentoDe(p, p.resaltar[0]), p.inicio, 9))} />
      </ZonaTexto>
    </AbsoluteFill>
  );
};

// 2 · Introducción: chips uno por uno y el auto avanzando derecho.
export const Introduccion: React.FC<{ p: Pieza }> = ({ p }) => {
  const { frame, fps, t } = useTiempo(p);
  const chips = p.chips ?? [];
  const paso = (p.fin - p.inicio - 0.6) / Math.max(1, chips.length);
  const momentos = chips.map((_, k) => p.inicio + 0.2 + k * paso);
  const visibles = momentos.filter((m) => t >= m).length;
  return (
    <AbsoluteFill>
      <Escenario transform={`scale(${spring({ frame, fps, config: { damping: 12 } })})`}>
        <AutoCenital tamano={330} desvio={0} avance={t * 2} />
      </Escenario>
      <ZonaTexto>
        {chips.map((c, k) => (
          <Chip key={c} numero={k + 1} texto={c} entrada={resorte(frame, fps, momentos[k], p.inicio, 13)} activo={k === visibles - 1} />
        ))}
      </ZonaTexto>
    </AbsoluteFill>
  );
};

// 3, 5, 7 · Cuerpo
export const Cuerpo: React.FC<{ p: Pieza; orden: number; chip: string }> = ({ p, orden, chip }) => {
  const { frame, fps, t } = useTiempo(p);
  const [k1, k2, k3] = p.resaltar.map((r) => momentoDe(p, r));
  const tAviso = momentoAviso(p);
  const entrada = spring({ frame, fps, config: { damping: 12 } });
  const aviso = resorte(frame, fps, tAviso, p.inicio, 13);

  let escala = 1 + 0.1 * interpolate(t, [p.inicio, p.fin], [0, 1], limitar);
  if (t >= k1) escala += 0.08;
  let dx = 0;
  let icono: React.ReactNode;
  if (orden === 0) {
    // El auto se va desviando y se jala hacia un lado.
    const desvio =
      0.12 * interpolate(t, [p.inicio, k1], [0, 1], limitar) + 0.88 * interpolate(t, [k1, k2 + 0.6], [0, 1], limitar);
    icono = <AutoCenital tamano={340} desvio={desvio} avance={t * 2} />;
  } else if (orden === 1) {
    // Orilla gastada y luego el volante chueco.
    const orilla = interpolate(t, [k1, k1 + 0.6], [0, 1], limitar);
    const volante = k3 !== undefined ? resorte(frame, fps, k3, p.inicio, 10) : 0;
    dx = t < (k3 ?? Infinity) ? 70 : -70;
    if (t >= k2) escala += 0.05;
    icono = <CorteYVolante tamano={420} orilla={orilla} volante={volante} />;
  } else {
    // Odómetro, calendario y manómetro en secuencia.
    const a = resorte(frame, fps, k1, p.inicio, 10);
    const b = resorte(frame, fps, k2, p.inicio, 10);
    const c = k3 !== undefined ? resorte(frame, fps, k3, p.inicio, 10) : 0;
    icono = <OdometroCalendarioManometro tamano={430} a={a} b={b} c={c} t={t} />;
  }
  const temblor = sacudida(t, k2, 0.5, orden === 0 ? 14 : 6);

  return (
    <AbsoluteFill>
      <Escenario transform={`translate(${temblor + dx}px, ${(1 - entrada) * -200}px) scale(${escala * entrada})`}>{icono}</Escenario>
      {t < tAviso ? (
        <ZonaTexto>
          <Chip numero={orden + 1} texto={chip} entrada={entrada} activo />
        </ZonaTexto>
      ) : (
        <Franja texto={p.aviso ?? ""} entrada={aviso} />
      )}
    </AbsoluteFill>
  );
};

// 4 y 6 · Bucle
export const Bucle: React.FC<{ p: Pieza; orden: number }> = ({ p, orden }) => {
  const { frame, fps, t } = useTiempo(p);
  const entrada = spring({ frame, fps, config: { damping: 10 } });
  const pulso = 1 + 0.06 * Math.sin((t - p.inicio) * Math.PI * 2 * 1.6);
  const lupa = resorte(frame, fps, p.inicio + 0.8, p.inicio, 10);
  return (
    <AbsoluteFill>
      <Escenario transform={`scale(${entrada * (orden === 0 ? 1 + 0.25 * lupa : 1)})`}>
        {orden === 0 ? <LlantaDesgaste tamano={250} marca={lupa} giro={t * 0.6} /> : <Reloj tamano={250} t={t} />}
      </Escenario>
      <ZonaTexto style={{ transform: `scale(${entrada * pulso})` }}>
        <TituloDA texto={p.pantalla ?? ""} resaltar={p.resaltar} tamano={86} golpe={1 + 0.2 * (1 - resorte(frame, fps, p.inicio + 0.3, p.inicio, 9))} />
      </ZonaTexto>
    </AbsoluteFill>
  );
};

// 8 · Llamado a la acción: el auto ya va derecho y aparece el botón.
export const Llamado: React.FC<{ p: Pieza }> = ({ p }) => {
  const { frame, fps, t } = useTiempo(p);
  const boton = resorte(frame, fps, p.inicio + 0.15, p.inicio, 9);
  const meneo = sacudida(t, p.habla.length > 1 ? p.habla[1][0] : p.inicio + 1.5, 0.7, 6) + sacudida(t, p.fin - 2.4, 0.7, 6);
  const endereza = interpolate(t, [p.inicio, p.inicio + 1.2], [0.6, 0], limitar);
  return (
    <AbsoluteFill>
      <Escenario>
        <AutoCenital tamano={300} desvio={endereza} avance={t * 2} />
      </Escenario>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 600,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${boton}) rotate(${meneo}deg)`,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              background: DEGRADADO,
              borderRadius: 46,
              padding: "16px 46px 22px",
              fontFamily: ANTON,
              fontSize: 76,
              lineHeight: 1.1,
              color: "#fff",
              whiteSpace: "nowrap",
              boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
            }}
          >
            {p.boton}
          </div>
          <svg width={70} height={50} style={{ position: "absolute", left: 70, bottom: -40 }}>
            <path d="M0 0 L60 0 L8 46 Z" fill="#9b2020" />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};

