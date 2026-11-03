// Tema «ruidos»: «5 ruidos que tu auto NO debería hacer». 8 piezas, 15 clips de voz.
// Cada ruido real de la falla suena en la pausa justo antes de su clip (0.4 s),
// para que se oiga claro antes de que la voz lo explique.
import { Audio } from "@remotion/media";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, Track, useCurrentFrame, useVideoConfig } from "remotion";
import { construirClips, momentoEnClip, type Clip, type GuionClips } from "../../doctor-auto/clips";
import { ANTON, DEGRADADO, POPPINS, PESO_POPPINS, ROJO_DA } from "../../doctor-auto/constantes";
import { Rafaga, Sticker } from "../../doctor-auto/Emociones";
import { FondoMovimiento, pulsoBpm } from "../../doctor-auto/Fondo";
import { SubtitulosDA, TituloDA } from "../../doctor-auto/Texto";
import { presentacion, ROTACION, SONIDO_TRANSICION } from "../../doctor-auto/transiciones";
import { Mascota, type Ancla } from "../Mascota";
import { PANEL } from "../pasar-corriente/Diagrama";
import duraciones from "./duraciones.json";
import { AUTO, CalleNocturna, Onomatopeya, Radiografia, zonaEnPantalla } from "./Mundo";
import guionJson from "./guion.json";
import {
  DiscoBalata,
  DistanciaFrenado,
  PoleasBanda,
  Suspension,
  TresPiezas,
  VelocimetroBalero,
  VolanteJunta,
} from "./Visuales";

const guion = guionJson as unknown as GuionClips & { marcaDeAgua: string };
const FPS = guion.fps;
// Duración del ruido que suena antes de la primera línea (c01, "ruidoAntesDeLaVoz").
const RUIDO_PREVIO = 0.8;
const { clips, duracionVoz, duracionTotal, hayMusica } = construirClips(guion, duraciones, RUIDO_PREVIO);
export const DURACION_RUIDOS = duracionTotal;
const BPM = guion.bpm ?? null;

const limitar = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const desde = (s: number) => Math.round(s * FPS);
const resorte = (t: number, momento: number, damping = 10) =>
  t < momento ? 0 : spring({ frame: Math.round((t - momento) * FPS), fps: FPS, config: { damping, stiffness: 200 } });
const dentro = (c: Clip, s: number, margen = 0.15) => Math.min(Math.max(s, c.inicio), c.fin - margen);
const clip = (id: string) => clips.find((c) => c.id === id) as Clip;
const local = (c: Clip, t: number) => interpolate(t, [c.inicio, c.fin], [0, 1], limitar);

const c01 = clip("c01");
const c02 = clip("c02");
const c03b = clip("c03b");
const c03c = clip("c03c");
const c05b = clip("c05b");
const c05c = clip("c05c");
const c07b = clip("c07b");
const c07d = clip("c07d");
const c08 = clip("c08");

// ---------- Momentos clave (todos dentro de su clip) ----------
const PASO_NUM = Math.min(0.45, (c02.duracion - 0.5) / 5);
const T_NUM = [0, 1, 2, 3, 4].map((k) => c02.inicio + 0.2 + k * PASO_NUM);
const T_PIEZAS = c05b.resaltar.map((w) => dentro(c05b, momentoEnClip(c05b, w), 0.4));
const T_JUNTA = dentro(c03c, momentoEnClip(c03c, "juntas"), 0.4);
const T_BALERO = dentro(c05c, momentoEnClip(c05c, "balero"), 0.4);
const T_METAL = dentro(c07b, momentoEnClip(c07b, "metal"), 0.4);
const T_DATO = Math.min(momentoEnClip(c07d, c07d.resaltar[0]), c07d.fin - 1.05);
// El ruido de cada falla empieza 0.4 s antes de su clip (en la pausa); el de c01, al inicio.
const RUIDOS = clips.filter((c) => c.ruido).map((c) => ({ c, t: c.ruidoAntesDeLaVoz ? c.inicio : c.inicio - guion.pausaEntreClipsSegundos }));
// Punch-in de cámara: cuando entra cada ruido y en el dato grande.
const T_PUNCH = [...RUIDOS.map((r) => Math.max(r.c.inicio, r.t + 0.1)), T_DATO];

// Bloques = piezas, con transición de 10 fotogramas dentro de la pausa de 0.4 s.
const T_TRANS = 10;
const BLOQUES = guion.piezas.map((pz, i) => {
  const lista = pz.clips.map((c) => clip(c.id));
  return { id: pz.id, tipo: pz.tipo, clips: lista, inicioFrame: desde(lista[0].inicio), transicion: ROTACION[(i - 1 + ROTACION.length) % ROTACION.length] };
});

// ---------- Elementos de pantalla ----------
const Franja: React.FC<{ texto: string }> = ({ texto }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 772, minHeight: 104, background: DEGRADADO, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 14px 30px rgba(0,0,0,0.5)" }}>
    <div style={{ maxWidth: 760, marginRight: 120, padding: "12px 0", textAlign: "center", fontFamily: POPPINS, fontWeight: PESO_POPPINS, fontSize: 40, lineHeight: 1.2, color: "#fff" }}>{texto}</div>
  </div>
);

// Dato grande "10,000 KM": casi todo el panel por 1 s, con cuenta rápida desde 0.
const DatoGrande: React.FC<{ t: number }> = ({ t }) => {
  const l = t - T_DATO;
  if (l < 0 || l > 1) return null;
  const entrada = spring({ frame: Math.round(l * FPS), fps: FPS, config: { damping: 12, stiffness: 200 } });
  const numero = Math.round(10000 * Math.min(1, l / 0.35)).toLocaleString("es-MX");
  return (
    <div
      style={{
        position: "absolute",
        left: PANEL.x,
        top: PANEL.y,
        width: PANEL.ancho,
        height: PANEL.alto,
        borderRadius: 27,
        background: DEGRADADO,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        transform: `scale(${0.7 + 0.3 * entrada})`,
        opacity: Math.min(1, entrada * 1.5) * (l > 0.88 ? (1 - l) / 0.12 : 1),
        boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
        fontFamily: ANTON,
        color: "#fff",
      }}
    >
      <span style={{ fontSize: 210, lineHeight: 1 }}>{numero}</span>
      <span style={{ fontSize: 100, lineHeight: 1, marginTop: 70 }}>KM</span>
    </div>
  );
};

// ---------- Escenas a pantalla completa ----------
const facil = (x: number) => 1 - (1 - x) ** 3;
// Clips que empiezan con la cámara "entrando" a una zona del auto antes del primer plano.
const ZOOM_A_ZONA: Record<string, number> = { c03a: 0, c03c: 1, c05a: 2, c07a: 4 };
const ONOMATOPEYAS: Record<string, { texto: string; x: number; y: number; giro: number }> = {
  c01: { texto: "¡RRRIIICH!", x: 380, y: 470, giro: -8 },
  c03a: { texto: "¡IIIIIH!", x: 760, y: 430, giro: 7 },
  c03c: { texto: "CLIC CLIC", x: 740, y: 420, giro: -6 },
  c04: { texto: "¡PUM!", x: 720, y: 470, giro: 8 },
  c05a: { texto: "¡CLONC!", x: 760, y: 430, giro: -7 },
  c05c: { texto: "ZZZUUUM", x: 560, y: 450, giro: -5 },
  c07a: { texto: "¡RRRIIICH!", x: 720, y: 420, giro: 6 },
};
const DUR_ZOOM = 0.45;

// Etiquetas con línea que señalan cada zona del auto (introducción).
const Etiquetas: React.FC<{ chips: string[]; vis: number[] }> = ({ chips, vis }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    {chips.map((txt, k) => {
      const z = zonaEnPantalla(k);
      const lx = 120 + k * 175;
      const ly = k % 2 === 0 ? 350 : 425;
      const v = vis[k] ?? 0;
      return (
        <g key={txt} opacity={v > 0.01 ? 1 : 0}>
          <path d={`M${lx + 90} ${ly + 46} L${z.x} ${z.y - 30}`} stroke="#fff" strokeWidth={3} strokeDasharray="400" strokeDashoffset={400 * (1 - v)} />
          <g transform={`translate(${lx} ${ly}) scale(${v})`}>
            <rect x={-10} y={-4} width={200} height={50} rx={25} fill={ROJO_DA} stroke="#fff" strokeWidth={3} />
            <text x={90} y={30} textAnchor="middle" fontFamily={POPPINS} fontWeight={PESO_POPPINS} fontSize={22} fill="#fff">
              {`${k + 1}. ${txt}`}
            </text>
          </g>
        </g>
      );
    })}
  </svg>
);

const primerPlano = (c: Clip, t: number): React.ReactNode => {
  const p = local(c, t);
  switch (c.visual) {
    case "zona-motor-banda-vibra":
      return <PoleasBanda t={t} vibra={1} grietas={0} />;
    case "banda-con-grietas":
      return <PoleasBanda t={t} vibra={0.3} grietas={interpolate(p, [0.05, 0.75], [0, 1], limitar)} />;
    case "volante-girado-rueda-clics":
      return <VolanteJunta giro={resorte(t, c.inicio, 12)} clic={t < T_JUNTA ? t - c.inicio : 0} junta={resorte(t, T_JUNTA, 11)} />;
    case "zona-suspension-golpe": {
      const golpe = Math.max(0, 1 - (t - c.inicio - DUR_ZOOM) / 0.35);
      return <Suspension compresion={Math.min(1, golpe) * 0.9} golpe={Math.min(1, golpe)} />;
    }
    case "bujes-rotula-amortiguador-en-secuencia":
      return <TresPiezas a={resorte(t, T_PIEZAS[0], 9)} b={resorte(t, T_PIEZAS[1], 9)} c={resorte(t, T_PIEZAS[2], 9)} />;
    case "velocimetro-sube-balero-corte":
      return <VelocimetroBalero vel={0.9} balero={resorte(t, T_BALERO, 10)} t={t} />;
    case "zona-freno-disco-balata":
      return <DiscoBalata grosor={0.25} chispas={0} ondas={1} t={t} />;
    case "balata-acabada-chispas":
      return <DiscoBalata grosor={interpolate(t, [c.inicio, T_METAL], [0.25, 0], limitar)} chispas={t >= T_METAL ? 1 : 0} ondas={0} t={t} />;
    case "distancia-de-frenado-dos-autos":
      return <DistanciaFrenado p={interpolate(p, [0.05, 0.8], [0, 1], limitar)} />;
    case "dato-grande-10000-km":
      return <DiscoBalata grosor={1} chispas={0} ondas={0} t={t} />;
    default:
      return null;
  }
};

// Escena de calle según el clip (gancho, introducción, bucles, zumbido y CTA).
const calle = (c: Clip, t: number) => {
  const l = t - c.inicio;
  const base = { t, faseOnda: (t * 1.6) % 1, numeros: [] as number[], rebote: 0, alarma: 0, tope: null as number | null, autoX: 0 };
  switch (c.id) {
    case "c01":
      return <CalleNocturna {...base} vel={260} zona={4} />;
    case "c02": {
      const vis = T_NUM.map((tn) => resorte(t, tn, 9));
      return (
        <>
          <CalleNocturna {...base} vel={260 * Math.max(0, 1 - l / 0.8)} zona={null} numeros={vis} />
          <Etiquetas chips={c.chips ?? []} vis={vis} />
        </>
      );
    }
    case "c04": {
      const topeX = 1250 - l * 520;
      const golpeDe = (rx: number) => Math.max(0, 1 - Math.abs(topeX - rx) / 90);
      const rebote = -46 * Math.max(golpeDe(AUTO.x + 690 * AUTO.escala), golpeDe(AUTO.x + 300 * AUTO.escala));
      return <CalleNocturna {...base} vel={520} zona={null} rebote={rebote} tope={topeX} />;
    }
    case "c05c":
      return <CalleNocturna {...base} vel={260 + 700 * Math.min(1, l / 1.5)} zona={3} faseOnda={(t * 3) % 1} />;
    case "c06":
      return <CalleNocturna {...base} vel={120} zona={4} alarma={Math.min(1, l / 0.3)} />;
    default:
      return <CalleNocturna {...base} vel={0} zona={null} numeros={[1, 1, 1, 1, 1]} />;
  }
};

const Escena: React.FC<{ c: Clip; t: number; primeroDelBloque: boolean }> = ({ c, t }) => {
  const l = t - c.inicio;
  const conTitulo = Boolean(c.pantalla);
  const ono = ONOMATOPEYAS[c.id];
  const tOno = c.ruidoAntesDeLaVoz ? c.inicio + 0.05 : c.inicio + 0.02;
  const zonaZoom = ZOOM_A_ZONA[c.id];
  const enZoom = zonaZoom !== undefined && l < DUR_ZOOM;
  const plano = primerPlano(c, t);
  const usaCalle = plano === null || enZoom || (c.id === "c05c" && t < T_BALERO);
  let fondo: React.ReactNode;
  if (enZoom) {
    const z = zonaEnPantalla(zonaZoom);
    const k = facil(Math.max(0, l) / DUR_ZOOM);
    fondo = (
      <AbsoluteFill style={{ transform: `scale(${1 + 2.4 * k})`, transformOrigin: `${z.x}px ${z.y}px` }}>
        <CalleNocturna t={t} vel={200} zona={zonaZoom} faseOnda={(t * 2) % 1} numeros={[]} rebote={0} alarma={0} tope={null} autoX={0} />
      </AbsoluteFill>
    );
  } else if (usaCalle) {
    fondo = calle(c, t);
  } else {
    const inicioPP = zonaZoom !== undefined ? c.inicio + DUR_ZOOM : c.id === "c05c" ? T_BALERO : c.inicio;
    fondo = (
      <Radiografia t={t} entrada={resorte(t, inicioPP - 0.05, 12)}>
        {plano}
      </Radiografia>
    );
  }
  if (c.boton) {
    const boton = resorte(t, c.inicio + 0.3, 9);
    return (
      <AbsoluteFill>
        {fondo}
        <div style={{ position: "absolute", left: 0, right: 0, top: 738, display: "flex", justifyContent: "center", transform: `scale(${boton})` }}>
          <div style={{ background: DEGRADADO, borderRadius: 46, padding: "14px 44px 20px", fontFamily: ANTON, fontSize: 70, color: "#fff", whiteSpace: "nowrap", boxShadow: "0 18px 40px rgba(0,0,0,0.55)" }}>
            {c.boton}
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  // Punch-in de cámara (1.0 → 1.12 en 4 fotogramas) cuando entra un ruido o el dato grande.
  const punch = Math.max(
    1,
    ...T_PUNCH.map((k) => {
      const f = (t - k) * FPS;
      if (f < 0 || f > 16) return 1;
      return f <= 4 ? 1 + 0.12 * (f / 4) : 1 + 0.12 * (1 - (f - 4) / 12);
    }),
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${punch})`, transformOrigin: "540px 600px" }}>{fondo}</AbsoluteFill>
      {conTitulo ? (
        <div style={{ position: "absolute", left: 60, right: 60, top: 730, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TituloDA texto={c.pantalla ?? ""} resaltar={c.pantallaResaltar ?? []} tamano={70} golpe={1} />
        </div>
      ) : null}
      {ono ? <Onomatopeya texto={ono.texto} x={ono.x} y={ono.y} t={t} t0={tOno} vida={0.9} giro={ono.giro} /> : null}
      {c.id === "c07d" ? <DatoGrande t={t} /> : null}
      {c.aviso ? <Franja texto={c.aviso} /> : null}
    </AbsoluteFill>
  );
};

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
const enPanel = (x: number, y: number) => ({ x: PANEL.x + x * PANEL.escala, y: PANEL.y + y * PANEL.escala });
// A dónde apunta la flecha de la mascota en cada clip.
const OBJETIVOS: Record<string, { x: number; y: number }> = {
  c03b: enPanel(640, 110),
  c05b: enPanel(800, 120),
  c05c: enPanel(800, 160),
  c07b: enPanel(560, 200),
};

const MascotaAnimada: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // Un useAudioData por clip (la lista es fija, así que el orden de los hooks no cambia).
  const datos = clips.map((c) => useAudioData(staticFile(`audio/ruidos/${c.archivo}`)));
  let i = clips.findIndex((c) => t >= c.inicio && t < c.fin + 0.4);
  if (i < 0) i = clips.length - 1;
  const c = clips[i];
  let boca = 0;
  const audio = datos[i];
  if (c.audioDisponible && audio && t >= c.inicioAudio && t < c.fin) {
    const espectro = visualizeAudio({ fps: FPS, frame: frame - desde(c.inicioAudio), audioData: audio, numberOfSamples: 32, smoothing: true });
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
      objetivo={OBJETIVOS[c.id] ?? enPanel(700, 200)}
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

// ---------- Stickers de emoción ----------
const ESQUINA_IZQ = { x: 168, y: 408 };
const ESQUINA_DER = { x: 912, y: 408 };
const STICKERS = [
  { id: "c01", emoji: "🔊", ...ESQUINA_DER, t0: c01.inicio + 0.15, vida: 1.6 },
  { id: "c04", emoji: "😬", ...ESQUINA_DER, t0: clip("c04").inicio + 0.2, vida: 1.4 },
  { id: "c06", emoji: "⚠️", ...ESQUINA_IZQ, t0: clip("c06").inicio + 0.2, vida: 1.4 },
  { id: "c07b", emoji: "🔥", ...ESQUINA_IZQ, t0: T_METAL + 0.05, vida: 1.2 },
  { id: "c07d", emoji: "✅", ...ESQUINA_DER, t0: c07d.inicio + 0.12, vida: Math.max(0.6, T_DATO - c07d.inicio - 0.2) },
  { id: "c08", emoji: "💬", x: 912, y: 640, t0: c08.inicio + 0.5, vida: c08.duracion - 0.5 },
];

// ---------- Sonido ----------
type Efecto = { nombre: string; archivo: string; t: number; dur: number; volumen: number | null };
const D: Record<string, number> = {
  clac: 0.26, ding: 0.9, riser: 1.5, "whoosh-b": 0.48,
  "mk-chispazo": 0.9, "mk-pop": 0.5, "mk-hit": 1.0, "mk-whoosh-slide": 0.7, "mk-swipe": 0.7, "mk-whoosh-zoom": 0.8,
  "ruidos/chillido-banda": 0.9, "ruidos/clic-homocinetica": 1.0, "ruidos/golpe-suspension": 0.9, "ruidos/zumbido-balero": 1.1, "ruidos/rechinido-frenos": 1.0,
};
const efecto = (nombre: string, archivo: string, t: number, volumen: number | null = null): Efecto => ({ nombre, archivo, t, dur: D[archivo] ?? 0.5, volumen });

// Los ruidos reales de las fallas, a 0.55 (más fuertes que los efectos normales).
// Los clics y el golpe son sonidos cortos y espaciados: van más fuertes para que se distingan.
const VOLUMEN_RUIDO: Record<string, number> = { "clic-homocinetica": 1, "golpe-suspension": 0.85 };
const EFECTOS_RUIDO = RUIDOS.map((r) => efecto(`Ruido ${r.c.ruido} (${r.c.id})`, `ruidos/${r.c.ruido}`, r.t, VOLUMEN_RUIDO[r.c.ruido ?? ""] ?? 0.55));
const EFECTOS: Efecto[] = [
  // Impacto del gancho, junto con el primer ruido.
  efecto("Hit gancho", "mk-hit", c01.inicio),
  // Un pop por cada número de zona (ligado a la animación).
  ...T_NUM.map((tn, k) => efecto(`Pop zona ${k + 1}`, "mk-pop", tn)),
  // c03a y c05c: su sfx "whoosh" lo sustituye el ruido de la falla, que es la entrada del clip.
  efecto("Clac banda", "clac", c03b.inicio + 0.3),
  efecto("Pop clics", "mk-pop", c03c.inicio + 0.3),
  // Riser de 1.5 s que termina justo cuando empieza cada bucle (c04 y c06).
  ...BLOQUES.filter((b) => b.tipo === "bucle").map((b) => efecto(`Riser antes de pieza ${b.id}`, "riser", b.inicioFrame / FPS - D.riser)),
  efecto("Hit golpe", "mk-hit", clip("c05a").inicio + 0.3),
  // Un pop por cada pieza (ligado a su palabra: bujes, rótulas, amortiguadores).
  ...T_PIEZAS.map((tp, k) => efecto(`Pop pieza ${k + 1}`, "mk-pop", tp)),
  efecto("Hit frenos", "mk-hit", clip("c07a").inicio + 0.3),
  // Ligado a palabra: las chispas salen al decir "metal".
  efecto("Chispas balata", "mk-chispazo", T_METAL),
  efecto("Swipe distancia", "mk-swipe", clip("c07c").inicio + 0.3),
  // Dato grande: impacto + ding al decir "diez mil".
  efecto("Hit 10,000 km", "mk-hit", T_DATO),
  efecto("Ding 10,000 km", "ding", T_DATO + 0.1),
  efecto("Pop botón", "mk-pop", c08.inicio + 0.3),
  // Pops de stickers y globos.
  ...STICKERS.map((st) => efecto(`Pop sticker ${st.emoji}`, "mk-pop", st.t0)),
  ...clips.filter((c) => c.mascota.globo).map((c) => efecto(`Pop globo ${c.id}`, "mk-pop", c.inicio + 0.35)),
];
// Transiciones con whoosh, salvo las que entran a un bloque que empieza con un ruido
// (piezas 3, 5 y 7): ahí el ruido de la falla hace de sonido de transición.
const CON_RUIDO_AL_ENTRAR = new Set(BLOQUES.filter((b) => b.clips[0].ruido).map((b) => b.id));
const WHOOSH_CORTE = BLOQUES.slice(1)
  .filter((b) => !CON_RUIDO_AL_ENTRAR.has(b.id))
  .map((b) => efecto(`Transición ${b.transicion} → pieza ${b.id}`, SONIDO_TRANSICION[b.transicion], (b.inicioFrame - T_TRANS) / FPS));

const vozActiva = (t: number) => clips.some((c) => t >= c.voz[0] && t <= c.voz[1]);
const volumenEfecto = (e: Efecto) => (f: number) => e.volumen ?? (vozActiva(e.t + f / FPS) ? 0.35 : 0.45);
const desfasar = (lista: Efecto[]) => {
  const orden = [...lista].sort((a, b) => a.t - b.t);
  for (let i = 1; i < orden.length; i++) {
    if (orden[i].t - orden[i - 1].t < 2 / FPS) orden[i] = { ...orden[i], t: orden[i - 1].t + 3 / FPS };
  }
  return orden;
};
const repartirEnPistas = (lista: Efecto[]) => {
  const pistas: Efecto[][] = [];
  for (const e of lista) {
    const libre = pistas.find((p) => p[p.length - 1].t + p[p.length - 1].dur <= e.t);
    if (libre) libre.push(e);
    else pistas.push([e]);
  }
  return pistas;
};

// Música: base 0.12, baja a 0.07 con voz o con un ruido de falla (rampa de 5 fotogramas),
// 0.2 en el primer segundo del gancho y en el último del CTA; entrada 0.5 s y salida 1 s.
const TRAMOS_DUCK: [number, number][] = [...clips.map((c) => c.voz), ...RUIDOS.map((r) => [r.t, r.t + D[`ruidos/${r.c.ruido}`]] as [number, number])];
const volumenMusica = (total: number) => (f: number) => {
  const t = f / FPS;
  const rampa = 5 / FPS;
  const duck = Math.max(
    0,
    ...TRAMOS_DUCK.map(([a, b]) => {
      if (t < a - rampa || t > b + rampa) return 0;
      if (t < a) return (t - (a - rampa)) / rampa;
      if (t > b) return 1 - (t - b) / rampa;
      return 1;
    }),
  );
  let base = 0.12 - 0.05 * duck;
  if ((t < 1 && duck === 0) || t > total - 1) base = Math.max(base, 0.2);
  return base * Math.max(0, Math.min(1, t / 0.5, (total - t) / 1));
};

export const TemaRuidos: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / FPS;
  const lineas = clips.flatMap((c) => c.lineas);
  const efectos = desfasar([...EFECTOS, ...WHOOSH_CORTE]);
  const series = (
    <TransitionSeries>
      {BLOQUES.flatMap((b, i) => {
        const inicio = i === 0 ? 0 : b.inicioFrame - T_TRANS;
        const siguiente = BLOQUES[i + 1];
        const duracion = siguiente ? siguiente.inicioFrame - b.inicioFrame + (i === 0 ? 0 : T_TRANS) : durationInFrames - inicio;
        const partes = [];
        if (i > 0) {
          partes.push(<TransitionSeries.Transition key={`tr-${b.id}`} presentation={presentacion(b.transicion, i)} timing={linearTiming({ durationInFrames: T_TRANS })} />);
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
      <Rafaga x={540} y={700} t={t} t0={c08.inicio + 0.3} radio={300} color={ROJO_DA} lineas={14} />

      <MascotaAnimada />
      <BarraProgreso />
      <Img src={staticFile("logo-doctor-auto.png")} alt={guion.marcaDeAgua} style={{ position: "absolute", left: 80, top: 308, height: 30, opacity: 0.55 }} />

      <SubtitulosDA lineas={lineas} desde={0} hasta={c08.inicio} arriba={885} alto={265} tamano={52} izquierda={70} derecha={520} sostenerFinal={false} />
      <SubtitulosDA lineas={lineas} desde={c08.inicio} hasta={Infinity} arriba={850} alto={80} tamano={46} izquierda={70} derecha={70} sostenerFinal />

      {/* Voz: cada clip en su momento exacto (después del ruido previo si lo hay), volumen 1.0. */}
      <Track name="Voz">
        {clips.map((c) =>
          c.audioDisponible ? (
            <Sequence key={c.id} name={`Voz ${c.id}`} from={desde(c.inicioAudio)} durationInFrames={Math.ceil(c.duracionAudio * FPS)}>
              <Audio src={staticFile(`audio/ruidos/${c.archivo}`)} volume={1} />
            </Sequence>
          ) : null,
        )}
      </Track>
      <Track name="Ruidos de fallas">
        {EFECTOS_RUIDO.map((e) => (
          <Sequence key={e.nombre} name={e.nombre} from={desde(e.t)} durationInFrames={Math.max(1, desde(e.dur))}>
            <Audio src={staticFile(`sfx/${e.archivo}.wav`)} volume={e.volumen ?? 0.55} />
          </Sequence>
        ))}
      </Track>
      {hayMusica ? <Audio src={staticFile("musica.mp3")} loop volume={volumenMusica(durationInFrames / FPS)} /> : null}
      {repartirEnPistas(efectos).map((lista, k) => (
        <Track key={k} name={`Efectos ${k + 1}`}>
          {lista.map((e) => (
            <Sequence key={e.nombre} name={e.nombre} from={desde(e.t)} durationInFrames={Math.max(1, desde(e.dur))}>
              <Audio src={staticFile(`sfx/${e.archivo}.wav`)} volume={volumenEfecto(e)} />
            </Sequence>
          ))}
        </Track>
      ))}
    </AbsoluteFill>
  );
};

export { duracionVoz };
