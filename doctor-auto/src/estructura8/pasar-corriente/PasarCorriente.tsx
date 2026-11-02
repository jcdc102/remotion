// Tema "pasar-corriente": 8 piezas, 14 clips de voz separados. Un Sequence
// por clip con su <Audio> y toda su animación; cada animación empieza en el
// primer fotograma del clip y termina antes de que acabe.
import { Audio } from "@remotion/media";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, Track, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, POPPINS, PESO_POPPINS, ROJO_DA } from "../../doctor-auto/constantes";
import { Anillo, Rafaga, Sticker } from "../../doctor-auto/Emociones";
import { FondoMovimiento, pulsoBpm } from "../../doctor-auto/Fondo";
import { SubtitulosDA, TituloDA } from "../../doctor-auto/Texto";
import { presentacion, ROTACION, SONIDO_TRANSICION } from "../../doctor-auto/transiciones";
import { Mascota, type Ancla } from "../Mascota";
import { sacudida, TarjetaLogo } from "../Piezas";
import { clip, clips, DURACION_VOZ, FPS, momentoEnClip, TARJETA, type Clip } from "./datos";
import { DESTINOS, Diagrama, METAL_ABSOLUTO, PANEL, type EstadoDiagrama } from "./Diagrama";
import duraciones from "./duraciones.json";
import guion from "./guion.json";
import { ChispaEntrePinzas, LlavesFrenoLuces, OdometroBateria, PinzasGiran, RelojInterrogacion } from "./Visuales";

const limitar = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const desde = (s: number) => Math.round(s * FPS);
const resorte = (t: number, momento: number, damping = 10) =>
  t < momento ? 0 : spring({ frame: Math.round((t - momento) * FPS), fps: FPS, config: { damping } });
// Asegura que un momento caiga dentro del clip (deja margen antes del final).
const dentro = (c: Clip, s: number, margen = 0.15) => Math.min(Math.max(s, c.inicio), c.fin - margen);

// ---------- Tiempos de las animaciones (todo dentro de su clip) ----------
const c01 = clip("c01");
const c02 = clip("c02");
const c03 = clip("c03");
const c04 = clip("c04");
const c05 = ["c05a", "c05b", "c05c", "c05d"].map(clip);
const c06 = clip("c06");
const c07a = clip("c07a");
const c07b = clip("c07b");
const c07c = clip("c07c");
const c07d = clip("c07d");
const c08 = clip("c08");

// La chispa grande del gancho sale cuando la voz dice "chispas".
const T_CHISPA = dentro(c01, momentoEnClip(c01, c01.resaltar[0]), 0.5);
// Números 1–4 en c02, uno tras otro.
const PASO_NUMEROS = Math.min(0.5, (c02.duracion - 0.6) / 4);
const T_NUMEROS = [0, 1, 2, 3].map((k) => c02.inicio + 0.3 + k * PASO_NUMEROS);
// Cada pinza se cierra en la palabra de su terminal ("positivo", "positivo",
// "negativo", "metal"): el cable sale en el primer fotograma del clip.
const PALABRA_CIERRE = ["positivo", "positivo", "negativo", "metal"];
const T_CIERRE = c05.map((c, k) => dentro(c, Math.max(c.inicio + 0.35, momentoEnClip(c, PALABRA_CIERRE[k])), 0.3));
// En c07c se quitan en orden inverso: 4, 3, 2, 1.
const PASO_QUITAR = (c07c.duracion - 0.3) / 4;
const T_QUITAR = [3, 2, 1, 0].map((k, j) => ({ k, inicio: c07c.inicio + 0.15 + j * PASO_QUITAR, fin: c07c.inicio + 0.15 + (j + 0.8) * PASO_QUITAR }));
const T_ENCIENDE = [c07b.inicio + 0.3, dentro(c07b, c07b.inicio + 1.2, 0.1)];
// También hay punch-in cuando se cierra cada pinza.
const T_CIERRE_PUNCH = () => T_CIERRE;

// Dato clave en pantalla grande (pack de movimiento): "20 min" en c07d, 1 s,
// con cuenta rápida desde 0. Empieza cuando la voz dice "veinte minutos".
const T_DATO = Math.min(momentoEnClip(c07d, c07d.resaltar[0]), c07d.fin - 1.05);
// Momentos con "punch-in" de cámara (1.0 → 1.12 en 4 fotogramas).
const T_PUNCH = [T_CHISPA, ...T_CIERRE_PUNCH(), T_DATO];
const BPM: number | null = (guion as { bpm?: number }).bpm ?? null;

// Bloques = piezas. Cada transición dura 10 fotogramas y cae en la pausa de
// 0.4 s antes del primer clip del bloque, así termina justo cuando empieza su voz.
const T_TRANS = 10;
const BLOQUES = guion.piezas.map((pz, i) => {
  const lista = pz.clips.map((c) => clip(c.id));
  return { id: pz.id, tipo: pz.tipo, clips: lista, inicioFrame: desde(lista[0].inicio), transicion: ROTACION[(i - 1 + ROTACION.length) % ROTACION.length] };
});

const estadoDiagrama = (t: number): EstadoDiagrama => {
  const conexion = [0, 1, 2, 3].map((k) => {
    const c = c05[k];
    let s = t < c.inicio ? 0 : interpolate(t, [c.inicio, T_CIERRE[k]], [0, 1], limitar);
    const q = T_QUITAR.find((x) => x.k === k)!;
    if (t >= q.inicio) s = interpolate(t, [q.inicio, q.fin], [1, 0], limitar);
    return 1 - (1 - s) ** 2;
  });
  const cierre = T_CIERRE.map((tc) => (t < tc ? 1 : 1 + 0.35 * (1 - resorte(t, tc, 7))));
  const numeros = [0, 1, 2, 3].map((k) => {
    if (t >= c02.inicio && t < c02.fin + 0.4) return resorte(t, T_NUMEROS[k], 9);
    const q = T_QUITAR.find((x) => x.k === k)!;
    if (t >= c05[k].inicio && t < q.fin) return resorte(t, T_CIERRE[k], 9);
    return 0;
  });
  const quitar4 = T_QUITAR.find((x) => x.k === 3)!;
  return {
    conexion,
    cierre,
    numeros,
    equis: t >= c05[3].inicio && t < quitar4.fin ? resorte(t, c05[3].inicio + 0.1, 9) : 0,
    palomita: t >= T_CIERRE[3] && t < quitar4.fin ? resorte(t, T_CIERRE[3] + 0.05, 8) : 0,
    chispa: t >= T_CIERRE[3] ? Math.max(0, 1 - (t - T_CIERRE[3]) / 0.25) : 0,
    muertoEncendido: interpolate(t, T_ENCIENDE, [0, 1], limitar),
    ondas: t >= c07a.inicio && t < c07a.fin - 0.1 ? (t - c07a.inicio) * 1.3 + 0.001 : 0,
  };
};

// ---------- Escena de cada clip ----------
const CON_DIAGRAMA = new Set(["dos-autos-numeros", "pinza-roja-1", "pinza-roja-2", "pinza-negra-3", "pinza-negra-4-metal-x-palomita", "motor-bueno-ondas", "auto-muerto-enciende", "pinzas-se-quitan-4-3-2-1"]);

// Aviso: franja roja de lado a lado, texto blanco, visible todo el clip (40%–46% de la altura).
const Franja: React.FC<{ texto: string }> = ({ texto }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 772, minHeight: 104, background: DEGRADADO, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 14px 30px rgba(0,0,0,0.5)" }}>
    <div style={{ maxWidth: 760, marginRight: 120, padding: "12px 0", textAlign: "center", fontFamily: POPPINS, fontWeight: PESO_POPPINS, fontSize: 40, lineHeight: 1.2, color: "#fff" }}>{texto}</div>
  </div>
);

// Dato grande: casi todo el panel por 1 s, con cuenta rápida de 0 al número.
const DatoGrande: React.FC<{ t: number }> = ({ t }) => {
  const local = t - T_DATO;
  if (local < 0 || local > 1) return null;
  const entrada = spring({ frame: Math.round(local * FPS), fps: FPS, config: { damping: 12, stiffness: 200 } });
  const numero = Math.round(20 * Math.min(1, local / 0.35));
  return (
    <div
      style={{
        position: "absolute",
        left: 117,
        top: 352,
        width: 846,
        height: 414,
        borderRadius: 27,
        background: DEGRADADO,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        transform: `scale(${0.7 + 0.3 * entrada})`,
        opacity: Math.min(1, entrada * 1.5) * (local > 0.88 ? (1 - local) / 0.12 : 1),
        boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
        fontFamily: ANTON,
        color: "#fff",
      }}
    >
      <span style={{ fontSize: 300, lineHeight: 1 }}>{numero}</span>
      <span style={{ fontSize: 120, lineHeight: 1, marginTop: 90 }}>MIN</span>
    </div>
  );
};

// ---------- Gráficos de emoción ----------
const enPanel = (x: number, y: number) => ({ x: PANEL.x + x * PANEL.escala, y: PANEL.y + y * PANEL.escala });
const CENTRO_PANEL = enPanel(470, 230);
const FAROS_MUERTO = enPanel(705, 106);
const ESQUINA_IZQ = { x: 168, y: 408 };
const ESQUINA_DER = { x: 912, y: 408 };
// Stickers (emoji) en las esquinas del panel: nunca tapan subtítulos ni mascota.
const STICKERS = [
  { id: "c01", emoji: "⚡", ...ESQUINA_DER, t0: T_CHISPA + 0.05, vida: 1.3 },
  { id: "c03", emoji: "⚠️", ...ESQUINA_IZQ, t0: c03.inicio + 0.15, vida: 1.5 },
  { id: "c04", emoji: "😱", ...ESQUINA_DER, t0: c04.inicio + 0.2, vida: 1.4 },
  { id: "c05d", emoji: "👍", ...ESQUINA_IZQ, t0: T_CIERRE[3] + 0.1, vida: 1.2 },
  { id: "c06", emoji: "🤔", ...ESQUINA_IZQ, t0: c06.inicio + 0.2, vida: 1.5 },
  { id: "c07b", emoji: "💡", ...ESQUINA_IZQ, t0: T_ENCIENDE[0] + 0.1, vida: 1.1 },
  { id: "c07d", emoji: "🔋", ...ESQUINA_DER, t0: c07d.inicio + 0.12, vida: Math.max(0.6, T_DATO - c07d.inicio - 0.2) },
  { id: "c08", emoji: "💬", x: 912, y: 640, t0: c08.inicio + 0.5, vida: c08.duracion - 0.5 },
];

const GraficosEmocion: React.FC<{ t: number }> = ({ t }) => (
  <>
    {/* Ráfaga amarilla en la chispa del gancho. */}
    <Rafaga x={CENTRO_PANEL.x} y={CENTRO_PANEL.y} t={t} t0={T_CHISPA} radio={170} color="#FFD43B" lineas={12} />
    {/* Anillo de energía en cada pinza al cerrarse. */}
    {T_CIERRE.map((tc, k) => {
      const d = enPanel(DESTINOS[k].x, DESTINOS[k].y);
      return <Anillo key={k} x={d.x} y={d.y} t={t} t0={tc} radio={46} color={k < 2 ? ROJO_DA : "#ffffff"} />;
    })}
    {/* Rayos de luz cuando se encienden los faros del auto muerto. */}
    <Rafaga x={FAROS_MUERTO.x} y={FAROS_MUERTO.y} t={t} t0={T_ENCIENDE[0]} radio={110} color="#FFF3B0" />
  </>
);

// Cámara: zoom lento 1.0 → 1.06 durante el clip y punch-in 1.0 → 1.12 en 4 fotogramas.
const camara = (c: Clip, t: number) => {
  const lento = 1 + 0.06 * interpolate(t, [c.inicio, c.fin], [0, 1], limitar);
  const punch = Math.max(
    1,
    ...T_PUNCH.map((k) => {
      const f = (t - k) * FPS;
      if (f < 0 || f > 16) return 1;
      return f <= 4 ? 1 + 0.12 * (f / 4) : 1 + 0.12 * (1 - (f - 4) / 12);
    }),
  );
  return lento * punch;
};

const Escena: React.FC<{ c: Clip; t: number; primeroDelBloque: boolean }> = ({ c, t, primeroDelBloque }) => {
  let visual: React.ReactNode = null;
  if (c.visual && CON_DIAGRAMA.has(c.visual)) {
    visual = <Diagrama estado={estadoDiagrama(t)} escala={1} />;
  } else if (c.visual === "chispa-entre-pinzas") {
    const acerca = interpolate(t, [c.inicio, T_CHISPA], [0, 1], { ...limitar, easing: (x) => x * x });
    const chispa = t >= T_CHISPA ? Math.max(0, 1 - (t - T_CHISPA) / 0.45) : 0;
    visual = <ChispaEntrePinzas acerca={acerca} chispa={chispa} temblor={sacudida(t, T_CHISPA, 0.4, 16)} />;
  } else if (c.visual === "llaves-freno-luces") {
    const [a, b, d] = [c.resaltar[0], c.resaltar[1], "todo"].map((w) => dentro(c, momentoEnClip(c, w), 0.5));
    visual = (
      <LlavesFrenoLuces
        llave={interpolate(t, [c.inicio, a + 0.3], [0, 1], limitar)}
        freno={interpolate(t, [b, b + 0.4], [0, 1], limitar)}
        luces={interpolate(t, [d, d + 0.35], [0, 1], limitar)}
      />
    );
  } else if (c.visual === "pinzas-giran-y-se-ordenan") {
    visual = <PinzasGiran p={interpolate(t, [c.inicio, c.inicio + c.duracion * 0.8], [0, 1], limitar)} />;
  } else if (c.visual === "reloj-interrogacion") {
    visual = <RelojInterrogacion t={t - c.inicio} signo={resorte(t, c.inicio + 0.2, 8)} />;
  } else if (c.visual === "odometro-20-min-bateria-llena") {
    visual = <OdometroBateria p={interpolate(t, [c.inicio, c.inicio + c.duracion * 0.85], [0, 1], limitar)} />;
  } else if (c.boton) {
    // CTA: los dos autos ya encendidos, más chicos, y el botón de comentario.
    const boton = resorte(t, c.inicio + 0.3, 9);
    visual = (
      <>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, transform: "scale(0.62)", transformOrigin: "50% 330px" }}>
          <Diagrama estado={estadoDiagrama(c.inicio + 999)} escala={1} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", transform: `scale(${boton})` }}>
          <div style={{ background: DEGRADADO, borderRadius: 46, padding: "14px 44px 20px", fontFamily: ANTON, fontSize: 70, color: "#fff", whiteSpace: "nowrap", boxShadow: "0 18px 40px rgba(0,0,0,0.55)" }}>
            {c.boton}
          </div>
        </div>
      </>
    );
  }
  // Los íconos entran con rebote y un pequeño giro (solo al empezar un bloque).
  const rebote = primeroDelBloque ? resorte(t, c.inicio - 0.05, 9) : 1;
  // Con título en pantalla (gancho), el panel se encoge hacia arriba (352–600 px)
  // para dejar el título entre el 32% y el 45% de la altura.
  const conTitulo = Boolean(c.pantalla);
  return (
    <AbsoluteFill>
      {conTitulo ? (
        <div style={{ position: "absolute", left: 70, right: 70, top: 612, height: 250, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TituloDA texto={c.pantalla ?? ""} resaltar={c.pantallaResaltar ?? []} tamano={78} golpe={1 + 0.15 * Math.sin(Math.min(1, Math.max(0, (t - c.inicio - 1.2) / 0.3)) * Math.PI)} />
        </div>
      ) : null}
      <AbsoluteFill
        style={{
          transform: `${conTitulo ? "translateY(-4px) scale(0.6)" : ""} scale(${camara(c, t) * (0.85 + 0.15 * rebote)}) rotate(${(1 - rebote) * -4}deg)`,
          transformOrigin: conTitulo ? "540px 352px" : "540px 560px",
          filter: "drop-shadow(0 22px 26px rgba(0,0,0,0.55))",
        }}
      >
        {visual}
        <GraficosEmocion t={t} />
      </AbsoluteFill>
      {c.id === "c07d" ? <DatoGrande t={t} /> : null}
      {c.aviso ? <Franja texto={c.aviso} /> : null}
    </AbsoluteFill>
  );
};

// Un bloque (pieza) muestra la escena del clip activo con el tiempo global.
const Bloque: React.FC<{ indice: number; inicioFrame: number }> = ({ indice, inicioFrame }) => {
  const frame = useCurrentFrame();
  const t = (inicioFrame + frame) / FPS;
  const b = BLOQUES[indice];
  let activo = b.clips[0];
  for (const c of b.clips) if (t >= c.inicio) activo = c;
  return <Escena c={activo} t={t} primeroDelBloque={activo === b.clips[0]} />;
};

// ---------- Mascota ----------
const DERECHA: Ancla = { x: 805, abajo: 1430, alto: 455 };
const CENTRO: Ancla = { x: 540, abajo: 1430, alto: 500 };
const anclaDe = (c: Clip) => (c.mascota.animacion === "grande-centro" ? CENTRO : DERECHA);

const MascotaAnimada: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // Un useAudioData por clip (la lista es fija, así que el orden de los hooks no cambia).
  const datos = clips.map((c) => useAudioData(staticFile(c.audioDisponible ? `audio/${c.archivo}` : "estructura8/bateria/voz.mp3")));
  let i = clips.findIndex((c) => t >= c.inicio && t < c.fin + 0.4);
  if (i < 0) i = clips.length - 1;
  const c = clips[i];
  // Volumen real del clip activo; en los silencios entre clips queda quieta.
  let boca = 0;
  const audio = datos[i];
  if (c.audioDisponible && audio && t < c.fin) {
    const espectro = visualizeAudio({ fps: FPS, frame: frame - desde(c.inicio), audioData: audio, numberOfSamples: 32, smoothing: true });
    const bajos = espectro.slice(0, 12);
    boca = Math.max(0, Math.min(1, (bajos.reduce((a, b) => a + b, 0) / bajos.length) * 30 - 0.08));
  }
  return (
    <Mascota
      pose={c.mascota.pose}
      animacion={c.mascota.animacion}
      globo={c.mascota.globo ?? null}
      frameLocal={frame - desde(c.inicio)}
      t={t}
      boca={boca}
      ancla={anclaDe(c)}
      anclaAnterior={i > 0 ? anclaDe(clips[i - 1]) : anclaDe(c)}
      // Apunta al borde derecho del bloque de metal para no tapar la palomita.
      objetivo={{ x: METAL_ABSOLUTO.x + 50, y: METAL_ABSOLUTO.y - 10 }}
      colorAcento={ROJO_DA}
      fuente={ANTON}
      espejoCompleto={false}
      globoArriba={890}
      pulso={pulsoBpm(t, BPM)}
    />
  );
};

const BarraProgreso: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 292, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.15)" }}>
      <div style={{ width: `${(frame / (durationInFrames - 1)) * 100}%`, height: "100%", borderRadius: 4, background: DEGRADADO }} />
    </div>
  );
};

// ---------- Efectos de sonido ----------
type Efecto = { nombre: string; archivo: string; t: number; dur: number; motivo: string };
const efecto = (nombre: string, archivo: string, t: number, dur: number, motivo: string): Efecto => ({
  nombre,
  archivo,
  t,
  dur: (D as Record<string, number>)[archivo] ?? dur,
  motivo,
});
const D = {
  whoosh: 0.55, chispazo: 0.48, clac: 0.26, pop: 0.25, clic: 0.12, "tic-tac": 0.9, "motor-enciende": 1.8, "arranque-motor": 2, ding: 0.9,
  rebote: 0.5, zumbido: 0.9, trinquete: 0.35, foco: 0.37, aterriza: 0.15, cable: 0.4, error: 0.34, check: 0.4, encendido: 0.62, carga: 0.9, conteo: 0.8,
  "whoosh-a": 0.4, "whoosh-b": 0.48, "whoosh-c": 0.45, swipe: 0.3, hit: 0.7, riser: 1.5,
  // Efectos de Mixkit (preparados con scripts/importar-sfx-mixkit.sh).
  "mk-chispazo": 0.9, "mk-error": 1.0, "mk-clic": 0.35, "mk-pop": 0.5, "mk-aterriza": 0.35, "mk-hit": 1.0,
  "mk-whoosh-slide": 0.7, "mk-swipe": 0.7, "mk-whoosh-zoom": 0.8,
};
const EFECTOS: Efecto[] = [
  efecto("Whoosh gancho", "mk-whoosh-slide", c01.inicio + 0.3, D["mk-whoosh-slide"], "0.3 s después del inicio del clip"),
  // Ligado a palabra: la chispa grande sale cuando se dice "chispas".
  efecto("Chispazo", "mk-chispazo", T_CHISPA, D.chispazo, "palabra «chispas»"),
  // Ligado a la animación: un pop por cada número que aparece.
  ...T_NUMEROS.map((tn, k) => efecto(`Pop número ${k + 1}`, "mk-pop", tn, D.pop, "aparición de cada número")),
  efecto("Clic llave", "mk-clic", c03.inicio + 0.3, D.clic, "0.3 s después del inicio del clip"),
  // (El whoosh de c04 lo da su transición de entrada.)
  // Ligado a palabra: cada clac suena cuando la pinza se cierra en su terminal.
  ...T_CIERRE.map((tc, k) => efecto(`Clac pinza ${k + 1}`, "clac", tc, D.clac, `palabra «${PALABRA_CIERRE[k]}»`)),
  efecto("Tic tac", "tic-tac", c06.inicio + 0.3, D["tic-tac"], "0.3 s después del inicio del clip"),
  efecto("Motor enciende", "motor-enciende", c07a.inicio + 0.3, D["motor-enciende"], "0.3 s después del inicio del clip"),
  // Ligado a palabra: el arranque suena al decir "arranca".
  efecto("Arranque motor", "arranque-motor", dentro(c07b, momentoEnClip(c07b, "arranca"), 0.2), D["arranque-motor"], "palabra «arranca»"),
  // Ligado a la animación: un clac por cada pinza que se quita (4, 3, 2, 1).
  ...T_QUITAR.map((q) => efecto(`Clac quitar ${q.k + 1}`, "clac", q.fin, D.clac, "cada pinza que se quita")),
  // Ligado a palabra: el ding suena al decir "veinte minutos".
  efecto("Ding", "ding", dentro(c07d, momentoEnClip(c07d, c07d.resaltar[0]), 0.2), D.ding, "palabra «veinte minutos»"),
  efecto("Pop botón", "mk-pop", c08.inicio + 0.3, D.pop, "0.3 s después del inicio del clip"),
];
// Pack de movimiento: cada transición lleva su whoosh (distinto por tipo; swipe en los wipes).
const WHOOSH_CORTE = BLOQUES.slice(1).map((b) =>
  efecto(`Transición ${b.transicion} → pieza ${b.id}`, SONIDO_TRANSICION[b.transicion], (b.inicioFrame - T_TRANS) / FPS, 0.45, "inicio de la transición"),
);
const PACK: Efecto[] = [
  // Impacto grave en el gancho y en el número grande.
  efecto("Hit gancho", "mk-hit", c01.inicio, D.hit, "entra el gancho"),
  efecto("Hit 20 min", "mk-hit", T_DATO, D.hit, "aparece el número grande"),
  // Riser de 1.5 s que termina justo cuando empieza cada bucle.
  ...BLOQUES.filter((b) => b.tipo === "bucle").map((b) => efecto(`Riser antes de pieza ${b.id}`, "riser", b.inicioFrame / FPS - D.riser, D.riser, "sube hasta el bucle")),
  // Pop cuando entran los íconos de un bloque nuevo.
  ...[c03, c04, c06, c07a].map((c) => efecto(`Pop íconos ${c.id}`, "mk-pop", c.inicio + 0.08, D.pop, "entran los íconos")),
  // Pop cuando aparece cada sticker de emoción.
  ...STICKERS.map((st) => efecto(`Pop sticker ${st.emoji}`, "mk-pop", st.t0, D["mk-pop"], "aparece el sticker")),
  // Pop cuando aparece cada globo de la mascota.
  ...clips.filter((c) => c.mascota.globo).map((c) => efecto(`Pop globo ${c.id}`, "mk-pop", c.inicio + 0.35, D.pop, "aparece el globo")),
];

// Efectos adicionales, cada uno ligado a un momento de la animación de su clip.
const momentosLlaves = ["apaga", "freno", "todo"].map((w) => dentro(c03, momentoEnClip(c03, w), 0.5));
const EXTRAS: Efecto[] = [
  // c01: la mascota entra con rebote y las pinzas zumban antes de la chispa.
  efecto("Rebote mascota", "rebote", c01.inicio + 0.35, D.rebote, "la mascota toca el piso al entrar"),
  efecto("Zumbido pinzas", "zumbido", Math.max(c01.inicio + 0.4, T_CHISPA - D.zumbido), D.zumbido, "las pinzas se acercan hasta la chispa"),
  // c03: freno de mano (trinquete) y luces que se apagan (foco), con su palabra.
  efecto("Freno de mano", "trinquete", momentosLlaves[1], D.trinquete, "palabra «freno»"),
  efecto("Foco se apaga", "foco", momentosLlaves[2], D.foco, "palabra «todo»"),
  // c04: cada pinza al acomodarse en su lugar.
  ...[0, 1, 2, 3].map((k) =>
    efecto(`Pinza ${k + 1} se acomoda`, "mk-aterriza", c04.inicio + c04.duracion * 0.8 * ((1 + 0.08 * k) / 1.25), D.aterriza, "la pinza llega a su lugar"),
  ),
  // c05a–c05d: el cable se desliza desde el primer fotograma del clip.
  ...c05.map((c, k) => efecto(`Cable ${k + 1}`, "cable", c.inicio + 0.05, D.cable, "el cable empieza a moverse")),
  // c05d: "X" roja sobre el negativo y palomita verde en el metal.
  efecto("Error X", "mk-error", c05[3].inicio + 0.12, D.error, "aparece la X roja"),
  // Dato correcto: ding con la palomita verde.
  efecto("Palomita", "ding", T_CIERRE[3] + 0.05, D.ding, "aparece la palomita verde"),
  // c07a: zumbido de las ondas de energía; c07b: faros y tablero que se encienden.
  efecto("Ondas de energía", "zumbido", c07a.inicio + 0.2, D.zumbido, "empiezan las ondas"),
  efecto("Encendido", "encendido", T_ENCIENDE[0], D.encendido, "se encienden faros y tablero"),
  // c07d: el odómetro cuenta y la batería se llena.
  efecto("Odómetro", "conteo", c07d.inicio + 0.05, D.conteo, "el odómetro empieza a contar"),
  efecto("Carga", "carga", c07d.inicio + 0.2, D.carga, "la batería se llena"),
];

const vozActiva = (t: number) => clips.some((c) => t >= c.voz[0] && t <= c.voz[1]);
// Efectos entre 0.35 y 0.5, un poco por debajo de la voz: 0.45 en silencio, 0.35 con voz.
const volumenEfecto = (inicio: number) => (f: number) => (vozActiva(inicio + f / FPS) ? 0.35 : 0.45);

// Dos efectos nunca empiezan en el mismo instante: se desfasan 3 fotogramas.
const desfasar = (lista: Efecto[]) => {
  const orden = [...lista].sort((a, b) => a.t - b.t);
  for (let i = 1; i < orden.length; i++) {
    if (orden[i].t - orden[i - 1].t < 2 / FPS) orden[i] = { ...orden[i], t: orden[i - 1].t + 3 / FPS };
  }
  return orden;
};

// Música (opcional): en loop, entrada 0.5 s y salida 1 s. Base 0.12; baja a 0.07
// mientras suena la voz (rampa de 5 fotogramas); 0.2 en el primer segundo del
// gancho y en el último segundo del CTA.
const HAY_MUSICA = (duraciones as { musica?: boolean }).musica === true;
const volumenMusica = (total: number) => (f: number) => {
  const t = f / FPS;
  const rampa = 5 / FPS;
  const voz = Math.max(
    0,
    ...clips.map((c) => {
      if (t < c.voz[0] - rampa || t > c.voz[1] + rampa) return 0;
      if (t < c.voz[0]) return (t - (c.voz[0] - rampa)) / rampa;
      if (t > c.voz[1]) return 1 - (t - c.voz[1]) / rampa;
      return 1;
    }),
  );
  let base = 0.12 - 0.05 * voz;
  if (t < 1 || t > total - 1) base = Math.max(base, 0.2);
  const fundido = Math.min(1, t / 0.5, (total - t) / 1);
  return base * Math.max(0, fundido);
};

// Reparte los efectos en pistas para que ninguno se encime con otro en la misma pista.
const repartirEnPistas = (lista: Efecto[]) => {
  const pistas: Efecto[][] = [];
  for (const e of [...lista].sort((a, b) => a.t - b.t)) {
    const libre = pistas.find((p) => p[p.length - 1].t + p[p.length - 1].dur <= e.t);
    if (libre) libre.push(e);
    else pistas.push([e]);
  }
  return pistas;
};

const PistaEfectos: React.FC<{ nombre: string; lista: Efecto[] }> = ({ nombre, lista }) => (
  <Track name={nombre}>
    {lista.map((e) => (
      <Sequence key={e.nombre} name={e.nombre} from={desde(e.t)} durationInFrames={Math.max(1, desde(e.dur))}>
        <Audio src={staticFile(`sfx/${e.archivo}.wav`)} volume={volumenEfecto(e.t)} />
      </Sequence>
    ))}
  </Track>
);

export const TemaPasarCorriente: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / FPS;
  const lineas = clips.flatMap((c) => c.lineas);
  // La chispa corta de c05d suena junto con su clac.
  const chispaCorta = efecto("Chispa corta", "mk-chispazo", T_CIERRE[3], D.chispazo, "palabra «metal»");
  const efectos = desfasar([...EFECTOS, chispaCorta, ...WHOOSH_CORTE, ...EXTRAS, ...PACK]);

  // Duración de cada bloque dentro de TransitionSeries (ver BLOQUES).
  const series = (
    <TransitionSeries>
      {BLOQUES.flatMap((b, i) => {
        const inicio = i === 0 ? 0 : b.inicioFrame - T_TRANS;
        const siguiente = BLOQUES[i + 1];
        const duracion = siguiente ? siguiente.inicioFrame - b.inicioFrame + (i === 0 ? 0 : T_TRANS) : durationInFrames - inicio;
        const partes = [];
        if (i > 0) {
          partes.push(
            <TransitionSeries.Transition key={`tr-${b.id}`} presentation={presentacion(b.transicion, i)} timing={linearTiming({ durationInFrames: T_TRANS })} />,
          );
        }
        partes.push(
          <TransitionSeries.Sequence key={`b-${b.id}`} name={`Pieza ${b.id} · ${b.tipo}`} durationInFrames={duracion}>
            <Bloque indice={i} inicioFrame={inicio} />
          </TransitionSeries.Sequence>,
        );
        return partes;
      })}
    </TransitionSeries>
  );
  // Desenfoque de movimiento solo durante las transiciones (para no hacer lento el render).
  const enTransicion = BLOQUES.slice(1).some((b) => frame >= b.inicioFrame - T_TRANS - 1 && frame <= b.inicioFrame + 1);

  return (
    <AbsoluteFill>
      <FondoMovimiento pulso={pulsoBpm(t, BPM)} />
      {enTransicion ? (
        <CameraMotionBlur samples={6} shutterAngle={180}>
          {series}
        </CameraMotionBlur>
      ) : (
        series
      )}

      {STICKERS.map((st) => (
        <Sticker key={st.id} emoji={st.emoji} x={st.x} y={st.y} t={t} t0={st.t0} vida={st.vida} tamano={104} />
      ))}
      {/* Ráfaga roja alrededor del botón del CTA. */}
      <Rafaga x={540} y={700} t={t} t0={c08.inicio + 0.3} radio={300} color={ROJO_DA} lineas={14} />

      <MascotaAnimada />
      <BarraProgreso />
      <Img src={staticFile("logo-doctor-auto.png")} alt={guion.marcaDeAgua} style={{ position: "absolute", left: 80, top: 308, height: 30, opacity: 0.55 }} />

      {/* Subtítulos: columna izquierda (46%–60%); en el CTA, centrados (41%–48%) y el último se queda. */}
      <SubtitulosDA lineas={lineas} desde={0} hasta={c08.inicio} arriba={885} alto={265} tamano={52} izquierda={70} derecha={520} sostenerFinal={false} />
      <SubtitulosDA lineas={lineas} desde={c08.inicio} hasta={Infinity} arriba={790} alto={130} tamano={48} izquierda={70} derecha={70} sostenerFinal />

      {TARJETA > 0 ? (
        <Sequence name="Tarjeta logo" from={desde(DURACION_VOZ)} durationInFrames={desde(TARJETA)}>
          <TarjetaLogo />
        </Sequence>
      ) : null}

      {/* Voz: cada clip en su momento exacto, volumen 1.0. */}
      <Track name="Voz">
        {clips.map((c) =>
          c.audioDisponible ? (
            <Sequence key={c.id} name={`Voz ${c.id}`} from={desde(c.inicio)} durationInFrames={Math.ceil(c.duracion * FPS)}>
              <Audio src={staticFile(`audio/${c.archivo}`)} volume={1} />
            </Sequence>
          ) : null,
        )}
      </Track>
      {HAY_MUSICA ? <Audio src={staticFile("musica.mp3")} loop volume={volumenMusica(durationInFrames / FPS)} /> : null}

      {repartirEnPistas(efectos).map((lista, k) => (
        <PistaEfectos key={k} nombre={`Efectos ${k + 1}`} lista={lista} />
      ))}
    </AbsoluteFill>
  );
};
