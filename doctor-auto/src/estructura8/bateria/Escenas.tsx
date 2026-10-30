// Diseño de las 8 piezas del tema "bateria". Los momentos de cada efecto
// salen de las palabras de "resaltar" (sincronizadas con la voz).
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { inicioUltimoTramo, momentoDe, type Pieza } from "../datos";
import { sacudida } from "../Piezas";
import { estiloBorde, FUENTE, TextoPantalla } from "../Texto";
import {
  BateriaAlerta,
  Calendario,
  FrenteAuto,
  GloboComentario,
  GRIS,
  ROJO,
  ROJO_CLARO,
  Tablero,
  Terminal,
  VidaYTermometro,
} from "./Iconos";

const limitar = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useTiempo = (p: Pieza) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: p.inicio + frame / fps };
};
const resorte = (frame: number, fps: number, momento: number, inicio: number, damping = 12) =>
  spring({ frame: frame - Math.round((momento - inicio) * fps), fps, config: { damping } });

// Escenario de íconos: 300–590 px (16%–31%), sin texto.
const Escenario: React.FC<{ children: React.ReactNode; transform?: string }> = ({ children, transform }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 300,
      height: 290,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform,
      transformOrigin: "50% 50%",
    }}
  >
    {children}
  </div>
);

// Texto principal: 590–830 px (31%–43%).
const ZonaTexto: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      left: 70,
      right: 70,
      top: 590,
      height: 240,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      ...style,
    }}
  >
    {children}
  </div>
);

const Chip: React.FC<{ numero: number; texto: string; entrada: number; activo: boolean }> = ({ numero, texto, entrada, activo }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      padding: "8px 30px 8px 10px",
      borderRadius: 50,
      background: activo ? ROJO : GRIS,
      border: "6px solid #fff",
      boxShadow: "0 10px 20px rgba(0,0,0,0.45)",
      transform: `translateX(${(1 - entrada) * -900}px)`,
      fontFamily: FUENTE,
      fontSize: 50,
      color: "#fff",
    }}
  >
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        background: "#fff",
        color: ROJO,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 40,
      }}
    >
      {numero}
    </div>
    <span style={estiloBorde(8)}>{texto}</span>
  </div>
);

const Aviso: React.FC<{ texto: string; entrada: number; t: number }> = ({ texto, entrada, t }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 22,
      padding: "18px 30px",
      borderRadius: 28,
      background: "rgba(17,22,26,0.94)",
      border: `7px solid ${Math.floor(t * 3) % 2 === 0 ? ROJO : ROJO_CLARO}`,
      boxShadow: "0 20px 40px rgba(0,0,0,0.55)",
      transform: `scale(${0.6 + 0.4 * entrada})`,
      opacity: entrada,
      maxWidth: 650,
      boxSizing: "border-box",
      fontFamily: FUENTE,
      fontSize: 52,
      lineHeight: 1.1,
      color: "#fff",
    }}
  >
    <svg width={96} height={96} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
      <path d="M50 8 L94 88 H6 Z" fill={ROJO} stroke="#fff" strokeWidth={7} strokeLinejoin="round" />
      <rect x={45} y={34} width={10} height={30} rx={4} fill="#fff" />
      <circle cx={50} cy={74} r={6} fill="#fff" />
    </svg>
    <div style={estiloBorde(8)}>{texto}</div>
  </div>
);

// 1 · Gancho
export const Gancho: React.FC<{ p: Pieza }> = ({ p }) => {
  const { frame, fps, t } = useTiempo(p);
  const icono = spring({ frame, fps, config: { damping: 9 } });
  const texto = resorte(frame, fps, p.inicio + 0.3, p.inicio, 9);
  const s = sacudida(t, p.inicio + 0.35, 0.4, 14);
  return (
    <AbsoluteFill>
      <Escenario transform={`scale(${icono}) rotate(${s * 0.4}deg)`}>
        <BateriaAlerta tamano={330} cargas={1} alerta={Math.floor(t * 4) % 2 === 0 ? 1 : 0.15} />
      </Escenario>
      <ZonaTexto style={{ transform: `translate(${s}px, 0) scale(${1.8 - 0.8 * texto})`, opacity: texto }}>
        <TextoPantalla texto={p.pantalla ?? ""} resaltar={p.resaltar} color="#fff" colorResaltado={ROJO_CLARO} tamano={104} />
      </ZonaTexto>
    </AbsoluteFill>
  );
};

// 2 · Introducción: los tres chips entran uno por uno.
export const Introduccion: React.FC<{ p: Pieza }> = ({ p }) => {
  const { frame, fps, t } = useTiempo(p);
  const chips = p.chips ?? [];
  const paso = (p.fin - p.inicio - 0.6) / Math.max(1, chips.length);
  const momentos = chips.map((_, k) => p.inicio + 0.2 + k * paso);
  const visibles = momentos.filter((m) => t >= m).length;
  const pulso = 1 + 0.05 * Math.sin(t * 6);
  return (
    <AbsoluteFill>
      <Escenario transform={`scale(${pulso})`}>
        <BateriaAlerta tamano={300} cargas={visibles} alerta={0} />
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
  // El aviso aparece después de la palabra clave principal de cada señal.
  const tAviso = orden === 0 ? k2 + 0.5 : orden === 1 ? k3 + 1.0 : k2 + 0.6;
  const entrada = spring({ frame, fps, config: { damping: 12 } });
  const aviso = resorte(frame, fps, tAviso, p.inicio, 12);

  let escala = 1 + 0.1 * interpolate(t, [p.inicio, p.fin], [0, 1], limitar);
  if (t >= k1) escala += 0.08;
  if (t >= k2) escala += 0.06;
  const temblor = sacudida(t, k2, 0.5, orden === 0 ? 18 : 8);

  let icono: React.ReactNode;
  if (orden === 0) {
    // Tablero: la aguja sube lento, batalla en "lento" y cae en "clic".
    let angulo = -110 + 25 * interpolate(t, [p.inicio, k1], [0, 1], limitar);
    if (t >= k1) angulo = -85 + 18 * Math.abs(Math.sin((t - k1) * 3.2));
    const caida = interpolate(t, [k2, k2 + 0.35], [0, 1], limitar);
    angulo = angulo * (1 - caida) + -120 * caida;
    const destello = t >= k2 ? Math.max(0, 1 - (t - k2) * 2.5) : 0;
    icono = <Tablero tamano={360} angulo={angulo} luz={Math.floor(t * 3) % 2 === 0} destello={destello} />;
  } else if (orden === 1) {
    // Faros que se atenúan, parpadeo del tablero y luego el polvo en la terminal.
    if (t < k3) {
      let luz = interpolate(t, [k1, k1 + 0.5], [1, 0.3], limitar);
      if (t >= k2) luz = Math.floor(t * 9) % 2 === 0 ? 0.75 : 0.12;
      icono = <FrenteAuto tamano={380} luz={luz} ojo={0} />;
    } else {
      const polvo = interpolate(t, [k3, k3 + 1.6], [0, 1], limitar);
      icono = (
        <div style={{ transform: `scale(${1.15 - 0.15 * resorte(frame, fps, k3, p.inicio, 12)})` }}>
          <Terminal tamano={380} polvo={polvo} t={t} />
        </div>
      );
    }
  } else {
    // Barra de vida que baja con los años y termómetro que sube con el calor.
    const vida = interpolate(t, [k1, k2], [1, 0.17], limitar);
    const calor = interpolate(t, [k2, k2 + 1], [0.15, 1], limitar);
    const prueba = k3 !== undefined && t >= k3 ? 1 + 0.06 * Math.sin((t - k3) * 12) : 1;
    icono = (
      <div style={{ transform: `scale(${prueba})` }}>
        <VidaYTermometro tamano={400} vida={vida} calor={calor} t={t} />
      </div>
    );
  }

  return (
    <AbsoluteFill>
      <Escenario transform={`translate(${temblor}px, ${(1 - entrada) * -200}px) scale(${escala * entrada})`}>{icono}</Escenario>
      <ZonaTexto>
        {t < tAviso ? (
          <Chip numero={orden + 1} texto={chip} entrada={entrada} activo />
        ) : (
          <Aviso texto={p.aviso ?? ""} entrada={aviso} t={t} />
        )}
      </ZonaTexto>
    </AbsoluteFill>
  );
};

// 4 y 6 · Bucle
export const Bucle: React.FC<{ p: Pieza; orden: number }> = ({ p, orden }) => {
  const { frame, fps, t } = useTiempo(p);
  const entrada = spring({ frame, fps, config: { damping: 10 } });
  const pulso = 1 + 0.06 * Math.sin((t - p.inicio) * Math.PI * 2 * 1.6);
  const ojo = resorte(frame, fps, p.inicio + 0.6, p.inicio, 10);
  return (
    <AbsoluteFill>
      <Escenario transform={`scale(${entrada})`}>
        {orden === 0 ? (
          <FrenteAuto tamano={380} luz={1} ojo={ojo} />
        ) : (
          <Calendario tamano={300} hoja={((t - p.inicio) * 1.4) % 1} />
        )}
      </Escenario>
      <ZonaTexto style={{ transform: `scale(${entrada * pulso})` }}>
        <TextoPantalla texto={p.pantalla ?? ""} resaltar={p.resaltar} color="#fff" colorResaltado={ROJO_CLARO} tamano={92} />
      </ZonaTexto>
    </AbsoluteFill>
  );
};

// 8 · Llamado a la acción: globo de comentario (30%–40% de la altura).
export const Llamado: React.FC<{ p: Pieza }> = ({ p }) => {
  const { frame, fps, t } = useTiempo(p);
  const globo = resorte(frame, fps, p.inicio + 0.15, p.inicio, 9);
  const meneo = sacudida(t, inicioUltimoTramo(p), 0.7, 6) + sacudida(t, p.fin - 4.5, 0.7, 6);
  return (
    <AbsoluteFill>
      <Escenario transform={`scale(${1 + 0.04 * Math.sin(t * 5)})`}>
        <BateriaAlerta tamano={260} cargas={3} alerta={0} />
      </Escenario>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 600,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${globo}) rotate(${meneo}deg)`,
        }}
      >
        <GloboComentario texto={p.boton ?? ""} fuente={FUENTE} />
      </div>
    </AbsoluteFill>
  );
};

export const FondoBateria: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #232a30 0%, #14181c 55%, #0a0c0e 100%)" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 78% 70%, rgba(211,47,47,${0.28 + 0.06 * Math.sin(t * 2)}) 0%, rgba(211,47,47,0) 45%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 46px)",
          backgroundPosition: `${(t * 20) % 46}px 0`,
        }}
      />
      <AbsoluteFill style={{ border: `0 solid ${GRIS}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 6, background: ROJO, opacity: 0.6 }} />
    </AbsoluteFill>
  );
};
