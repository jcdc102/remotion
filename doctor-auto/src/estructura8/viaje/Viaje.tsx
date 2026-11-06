// Tema «viaje»: «Antes de salir de viaje: 5 revisiones». 8 piezas, 15 clips de voz.
// Estilo premium (CLAUDE.md): cada entrada cae en su palabra, la cámara sigue lo
// importante con movimientos encadenados, las escenas cambian transformando un
// objeto en el siguiente (llanta → disco → copo → batería → cofre → luna;
// pluma → reloj → botón) y los textos se revelan desde máscaras.
import { Audio } from "@remotion/media";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, Img, Sequence, spring, staticFile, Track, useCurrentFrame, useVideoConfig } from "remotion";
import { construirClips, momentoEnClip, type Clip, type GuionClips } from "../../doctor-auto/clips";
import { ANTON, DEGRADADO, POPPINS, PESO_POPPINS, ROJO_DA } from "../../doctor-auto/constantes";
import { Rafaga, Sticker } from "../../doctor-auto/Emociones";
import { pulsoBpm } from "../../doctor-auto/Fondo";
import { AcabadoPremium, aPantalla, BarraRevela, crearCamara, Estudio, estiloCamara, FranjaMascara, Morfo, suave, TituloMascara, type Forma, type Toma } from "../../doctor-auto/premium";
import { SubtitulosDA } from "../../doctor-auto/Texto";
import { Mascota, type Ancla } from "../Mascota";
import { PANEL } from "../pasar-corriente/Diagrama";
import { Onomatopeya } from "../ruidos/Mundo";
import duraciones from "./duraciones.json";
import { anguloPluma, Bateria, Carretera, Cofre, COFRE, Freno, Frio, Llanta, Parabrisas, PIVOTE, PUNTOS, Reloj, RUEDA_R } from "./Escenas";
import guionJson from "./guion.json";

const guion = guionJson as unknown as GuionClips & { marcaDeAgua: string };
const FPS = guion.fps;
const { clips, duracionVoz, duracionTotal, hayMusica } = construirClips(guion, duraciones, 0);
export const DURACION_VIAJE = duracionTotal;
const BPM = guion.bpm ?? null;
const TOTAL_FRAMES = Math.ceil(duracionTotal * FPS);

const desde = (s: number) => Math.round(s * FPS);
const clip = (id: string) => clips.find((c) => c.id === id) as Clip;
const resorte = (t: number, t0: number, damping = 13, stiffness = 180) =>
  t < t0 ? 0 : spring({ frame: Math.round((t - t0) * FPS), fps: FPS, config: { damping, stiffness } });
const rampa = (t: number, a: number, b: number) => suave(Math.max(0, Math.min(1, (t - a) / (b - a))));
const en = (c: Clip, frase: string) => Math.min(Math.max(momentoEnClip(c, frase), c.inicio), c.fin - 0.2);

const [c01, c02, c03a, c03b, c03c, c04, c05a, c05b, c05c, c06, c07a, c07b, c07c, c07d, c08] = [
  "c01", "c02", "c03a", "c03b", "c03c", "c04", "c05a", "c05b", "c05c", "c06", "c07a", "c07b", "c07c", "c07d", "c08",
].map(clip);
const MEDIA_PAUSA = guion.pausaEntreClipsSegundos / 2;
const limite = (c: Clip) => c.inicio - MEDIA_PAUSA; // mitad de la pausa antes del clip

// ---------- Momentos (cada entrada cae en su palabra) ----------
const T = {
  viaje: en(c01, "viaje"),
  tirado: en(c01, "tirado"),
  cinco: en(c02, "cinco"),
  llantas: en(c03a, "llantas"),
  presion: en(c03a, "Presión"),
  dibujo: en(c03a, "dibujo"),
  lisas: en(c03b, "lisas"),
  frenos: en(c03c, "frenos"),
  rechinan: en(c03c, "rechinan"),
  vibran: en(c03c, "vibran"),
  frio: en(c04, "frío"),
  bateria: en(c05a, "batería"),
  tresAnos: en(c05a, "tres años"),
  arranca: en(c05b, "ya no arranca"),
  aceite: en(c05c, "aceite"),
  anti: en(c05c, "anticongelante"),
  nivel: en(c05c, "nivel"),
  noche: en(c06, "noche"),
  luces: en(c07a, "luces"),
  limpiadores: en(c07a, "limpiadores"),
  altas: en(c07b, "altas"),
  frenos2: en(c07b, "frenos"),
  direccionales: en(c07b, "direccionales"),
  sinRayar: en(c07c, "sin rayar"),
  treinta: en(c07d, "Treinta"),
  salvan: en(c07d, "salvan"),
};
// La cámara llega a la llanta justo al decir "llantas"; al parabrisas, poco después de empezar c07c.
const T_LLANTA = T.llantas + 0.12;
const T_PARABRISAS = c07c.inicio + 0.45;
const B = [limite(c03c), limite(c04), limite(c05a), limite(c05c), limite(c06), limite(c07d), limite(c08)];
const [B1, B2, B3, B4, B5, B6, B7] = B;
const T_PLUMA = T_PARABRISAS + 0.1;
const PASO_TARJETA = Math.min(0.22, (c02.fin - 0.5 - T.cinco) / 5);
const T_TARJETAS = [0, 1, 2, 3, 4].map((k) => T.cinco + k * PASO_TARJETA);
const T_NUBE = c01.fin + MEDIA_PAUSA; // la nube de humo tapa la pantalla y cambia de momento

// ---------- Recorrido del mundo (velocidad integrada por fotograma) ----------
const velMundo = (t: number) => {
  if (t < T_NUBE) return 0; // auto varado
  if (t < T_LLANTA) return 520 * rampa(t, T_NUBE, T_NUBE + 0.6);
  if (t < B5) return 260; // la llanta sigue girando en los primeros planos
  if (t < B7) return 380;
  return 600;
};
const RECORRIDO: number[] = [0];
for (let f = 1; f <= TOTAL_FRAMES + 1; f++) RECORRIDO.push(RECORRIDO[f - 1] + velMundo(f / FPS) / FPS);
const recorrido = (t: number) => RECORRIDO[Math.max(0, Math.min(RECORRIDO.length - 1, Math.round(t * FPS)))];

// ---------- Cámaras por escena ----------
const R = PUNTOS.ruedaDelantera;
const ZOOM_LLANTA = 250 / RUEDA_R; // la llanta del mundo llega al mismo tamaño que la del primer plano
const camTarde = crearCamara([
  [0, PUNTOS.cofre.x, PUNTOS.cofre.y + 20, 1.7],
  [T.viaje, 640, 610, 1.18],
  [T.tirado, 560, 640, 1.08],
  [c02.inicio + 0.3, 540, 610, 1.0],
  [c02.fin, 610, 650, 1.06],
  [c03a.inicio + 0.25, 690, 700, 1.45],
  [T_LLANTA, R.x, R.y, ZOOM_LLANTA],
]);
const camLlanta = crearCamara([
  [T_LLANTA, 540, 560, 1.0],
  [T_LLANTA + 0.35, 540, 560, 1.06],
  [T.presion, 430, 520, 1.1],
  [T.dibujo, 600, 430, 1.16],
  [c03b.inicio + 0.2, 560, 470, 1.1],
  [T.lisas + 0.2, 600, 420, 1.2],
  [B1 - 0.25, 540, 560, 1.0],
]);
const camFreno = crearCamara([
  [B1, 540, 560, 1.0],
  [B1 + 0.4, 540, 560, 1.05],
  [T.frenos, 620, 480, 1.12],
  [T.rechinan, 580, 500, 1.18],
  [T.vibran, 540, 560, 1.06],
  [B2 - 0.2, 540, 560, 1.0],
]);
const camFrio = crearCamara([
  [B2, 540, 560, 1.0],
  [T.frio, 540, 540, 1.1],
  [B3 - 0.2, 540, 560, 1.0],
]);
const camBateria = crearCamara([
  [B3, 540, 560, 1.0],
  [B3 + 0.4, 540, 560, 1.06],
  [T.tresAnos, 600, 520, 1.1],
  [c05b.inicio + 0.2, 480, 580, 1.04],
  [T.arranca, 540, 590, 1.2],
  [B4 - 0.25, 540, 560, 1.0],
]);
const camCofre = crearCamara([
  [B4, 540, 560, 1.0],
  [T.aceite, COFRE.bayoneta.x, COFRE.bayoneta.y - 160, 1.55],
  [T.anti, COFRE.deposito.x + 60, COFRE.deposito.y + 80, 1.6],
  [T.nivel, 640, 520, 1.15],
  [B5 - 0.25, COFRE.tapa.x, COFRE.tapa.y, 2.2],
]);
const LUNA = { x: 820, y: 250, r: 45 };
const camNoche = crearCamara([
  [B5, LUNA.x, LUNA.y, 2.2],
  [B5 + 0.5, 720, 420, 1.35],
  [T.noche, 560, 610, 1.0],
  [c07a.inicio + 0.3, 580, 630, 1.1],
  [c07b.inicio + 0.1, 620, 650, 1.04],
  [T.altas, PUNTOS.faro.x - 40, PUNTOS.faro.y, 1.85],
  [T.frenos2, PUNTOS.calavera.x + 60, PUNTOS.calavera.y, 1.85],
  [T.direccionales, 540, 640, 1.12],
  [c07c.inicio, 600, 620, 1.3],
  [T_PARABRISAS, PUNTOS.ventana.x, PUNTOS.ventana.y, 3.0],
]);
const camParabrisas = crearCamara([
  [T_PARABRISAS, 540, 560, 1.0],
  [T_PARABRISAS + 0.4, 540, 560, 1.07],
  [T.sinRayar, 540, 520, 1.1],
  [B6 - 0.2, 540, 560, 1.0],
]);
const camReloj = crearCamara([
  [B6, 540, 560, 1.0],
  [T.treinta, 540, 550, 1.08],
  [c07d.fin, 540, 560, 1.14],
  [B7 - 0.2, 540, 560, 1.0],
]);
const camAmanecer = crearCamara([
  [B7, 540, 600, 1.25],
  [c08.inicio + 0.6, 560, 620, 1.05],
  [duracionTotal, 600, 630, 1.0],
]);

// ---------- Escenas ----------
type Escena = { nombre: string; desde: number; hasta: number; camara: (t: number) => Toma; fondo: (t: number) => React.ReactNode; dibujo: (t: number) => React.ReactNode };
const intermitenteEn = (t: number, t0: number) => (t >= t0 && Math.floor((t - t0) * 3) % 2 === 0 ? 1 : 0);
const mundo = (t: number, o: Partial<React.ComponentProps<typeof Carretera>>) => (
  <Carretera t={t} recorrido={recorrido(t)} noche={0} amanecer={0} humo={0} intermitente={0} faros={0} altas={0} frenos={0} lluvia={0} relampago={0} avanceAuto={0} letrero={null} rebote={0} {...o} />
);
const relampago = (t: number) => {
  const l = t - c07a.inicio;
  if (l < 0 || l > 0.6) return 0;
  return Math.max(0, 1 - l / 0.12) + (l > 0.2 ? Math.max(0, 0.7 - (l - 0.2) / 0.15) : 0);
};
const ESCENAS: Escena[] = [
  {
    nombre: "Carretera al atardecer",
    desde: 0,
    hasta: T_LLANTA,
    camara: camTarde,
    fondo: () => null,
    dibujo: (t) =>
      mundo(t, {
        humo: t < T_NUBE ? 1 : 0,
        intermitente: t < T_NUBE ? intermitenteEn(t, 0) : 0,
        letrero: t > T_NUBE ? 1150 - (recorrido(t) - recorrido(T_NUBE)) * 0.95 : null,
      }),
  },
  {
    nombre: "Llanta",
    desde: T_LLANTA,
    hasta: B1,
    camara: camLlanta,
    fondo: (t) => <Estudio t={t} tono={["#3a1216", "#09090b"]} acento={ROJO_DA} />,
    dibujo: (t) => {
      const lisa = rampa(t, T.lisas - 0.1, T.lisas + 0.7);
      return (
        <Llanta
          t={t}
          giro={t < T.presion ? (t - T_LLANTA) * 220 + recorrido(T_LLANTA) * 0.9 : (T.presion - T_LLANTA) * 220 + recorrido(T_LLANTA) * 0.9}
          profundidad={1 - lisa}
          presion={resorte(t, T.presion - 0.05)}
          aguja={rampa(t, T.presion, T.presion + 0.6)}
          lupa={resorte(t, T.dibujo - 0.05)}
        />
      );
    },
  },
  {
    nombre: "Freno",
    desde: B1,
    hasta: B2,
    camara: camFreno,
    fondo: (t) => <Estudio t={t} tono={["#3b1a12", "#09090b"]} acento="#ff7a2a" />,
    dibujo: (t) => (
      <Freno
        t={t}
        giro={(t - B1) * 260 * Math.max(0.15, 1 - rampa(t, T.frenos, T.frenos + 0.8))}
        pinza={resorte(t, T.frenos, 12)}
        chispas={t >= T.rechinan && t < T.vibran + 0.3 ? 1 : 0}
        vibra={t >= T.vibran ? Math.max(0, 1 - (t - T.vibran) / 0.9) : 0}
        calor={rampa(t, T.rechinan, T.rechinan + 0.6) * 0.8}
      />
    ),
  },
  {
    nombre: "Frío",
    desde: B2,
    hasta: B3,
    camara: camFrio,
    fondo: (t) => <Estudio t={t} tono={["#17385a", "#04070d"]} acento="#7fd3ff" />,
    dibujo: (t) => <Frio t={t} crece={rampa(t, B2 + 0.12, B2 + 0.9)} escarcha={rampa(t, B2 + 0.2, T.frio + 0.5)} />,
  },
  {
    nombre: "Batería",
    desde: B3,
    hasta: B4,
    camara: camBateria,
    fondo: (t) => <Estudio t={t} tono={t < c05b.inicio ? ["#173450", "#05070c"] : ["#3a1216", "#09090b"]} acento={t < c05b.inicio ? "#7fd3ff" : ROJO_DA} />,
    dibujo: (t) => (
      <Bateria
        t={t}
        escarcha={1 - rampa(t, B4 - 0.4, B4)}
        carga={1 - 0.85 * rampa(t, c05b.inicio + 0.2, T.arranca)}
        llave={t > c05b.inicio ? rampa(t, c05b.inicio + 0.1, c05b.inicio + 0.35) : 0}
        tache={resorte(t, T.arranca, 10)}
        vibra={t > c05b.inicio + 0.3 && t < T.arranca ? 0.6 : 0}
      />
    ),
  },
  {
    nombre: "Cofre",
    desde: B4,
    hasta: B5,
    camara: camCofre,
    fondo: (t) => <Estudio t={t} tono={["#24262d", "#060608"]} acento="#3ddc84" />,
    dibujo: (t) => (
      <Cofre
        t={t}
        sacar={rampa(t, T.aceite - 0.15, T.aceite + 0.35)}
        aceite={rampa(t, T.aceite + 0.25, T.aceite + 0.8)}
        anti={rampa(t, T.anti, T.anti + 0.8)}
        checkAceite={resorte(t, T.nivel, 10)}
        checkAnti={resorte(t, T.nivel + 0.1, 10)}
      />
    ),
  },
  {
    nombre: "Carretera de noche",
    desde: B5,
    hasta: T_PARABRISAS,
    camara: camNoche,
    fondo: () => null,
    dibujo: (t) =>
      mundo(t, {
        noche: 1,
        faros: rampa(t, T.noche, T.noche + 0.08),
        altas: rampa(t, T.altas, T.altas + 0.1),
        frenos: t >= T.frenos2 && t < T.direccionales + 0.5 ? 1 : 0,
        intermitente: intermitenteEn(t, T.direccionales),
        lluvia: rampa(t, c07a.inicio - 0.1, c07a.inicio + 0.3),
        relampago: relampago(t),
      }),
  },
  {
    nombre: "Parabrisas",
    desde: T_PARABRISAS,
    hasta: B6,
    camara: camParabrisas,
    fondo: () => null,
    dibujo: (t) => <Parabrisas t={t} t0Pluma={T_PLUMA} activo={t >= T_PLUMA} />,
  },
  {
    nombre: "Reloj",
    desde: B6,
    hasta: B7,
    camara: camReloj,
    fondo: (t) => <Estudio t={t} tono={["#3a1216", "#09090b"]} acento={ROJO_DA} />,
    dibujo: (t) => <Reloj t={t} avance={rampa(t, T.treinta - 0.05, T.treinta + 0.9)} />,
  },
  {
    nombre: "Carretera al amanecer",
    desde: B7,
    hasta: Infinity,
    camara: camAmanecer,
    fondo: () => null,
    dibujo: (t) => mundo(t, { amanecer: 1, faros: 1 - rampa(t, B7, c08.fin), avanceAuto: 260 * rampa(t, B7, duracionTotal) }),
  },
];

// ---------- Transformaciones entre escenas ----------
const RGBA = (h: string, a = 1): [number, number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), a];
const SIN: [number, number, number, number] = [0, 0, 0, 0];
const circulo = (cx: number, cy: number, r: number, relleno: string, a = 1): Forma => ({ cx, cy, w: r * 2, h: r * 2, rx: r, relleno: RGBA(relleno, a), borde: SIN, grosor: 0 });
const BOTON = { cx: 540, cy: 796, w: 660, h: 116 };
const tapaPantalla = aPantalla(camCofre(B5 - 0.01), COFRE.tapa.x, COFRE.tapa.y);
const lunaPantalla = aPantalla(camNoche(B5), LUNA.x, LUNA.y);
type Transformacion = { t: number; de: Forma; a: Forma; sonido: string };
const TRANSFORMACIONES: Transformacion[] = [
  { t: B1, de: circulo(540, 560, 250, "#161618"), a: circulo(540, 560, 215, "#b9bec7"), sonido: "whoosh-a" },
  { t: B2, de: circulo(540, 560, 215, "#b9bec7"), a: circulo(540, 560, 120, "#dff4ff"), sonido: "whoosh-b" },
  { t: B3, de: circulo(540, 560, 120, "#dff4ff"), a: { cx: 540, cy: 590, w: 460, h: 300, rx: 18, relleno: RGBA("#2b2d33"), borde: SIN, grosor: 0 }, sonido: "whoosh-c" },
  {
    t: B4,
    de: { cx: 540, cy: 590, w: 460, h: 300, rx: 18, relleno: RGBA("#2b2d33"), borde: SIN, grosor: 0 },
    a: { cx: COFRE.bateria.cx, cy: COFRE.bateria.cy, w: COFRE.bateria.w, h: COFRE.bateria.h, rx: 10, relleno: RGBA("#2b2d33"), borde: SIN, grosor: 0 },
    sonido: "whoosh-a",
  },
  { t: B5, de: circulo(tapaPantalla.x, tapaPantalla.y, COFRE.tapa.r * camCofre(B5).z, "#f2c14e"), a: circulo(lunaPantalla.x, lunaPantalla.y, LUNA.r * camNoche(B5).z, "#f3e3c3"), sonido: "whoosh-b" },
  {
    t: B6,
    de: { cx: PIVOTE.x, cy: PIVOTE.y, w: PIVOTE.largo * 2, h: PIVOTE.largo * 2, rx: PIVOTE.largo, relleno: RGBA("#cfe0ff", 0.12), borde: RGBA("#ffffff", 0.8), grosor: 6 },
    a: { cx: 540, cy: 560, w: 460, h: 460, rx: 230, relleno: SIN, borde: RGBA(ROJO_DA), grosor: 22 },
    sonido: "whoosh-c",
  },
  {
    t: B7,
    de: { cx: 540, cy: 560, w: 460, h: 460, rx: 230, relleno: SIN, borde: RGBA(ROJO_DA), grosor: 22 },
    a: { cx: BOTON.cx, cy: BOTON.cy, w: BOTON.w, h: BOTON.h, rx: 46, relleno: RGBA(ROJO_DA), borde: SIN, grosor: 0 },
    sonido: "whoosh-a",
  },
];
const VENTANA_MORFO = 0.2; // s antes y después del límite

const CapaEscena: React.FC<{ e: Escena; t: number; opacidad: number }> = ({ e, t, opacidad }) => (
  <AbsoluteFill style={{ opacity: opacidad }}>
    {e.fondo(t)}
    <div style={estiloCamara(e.camara(t), t)}>{e.dibujo(t)}</div>
  </AbsoluteFill>
);

// Nube de humo que crece desde el cofre, tapa la pantalla y se disipa (cambio de momento).
const NUBES = Array.from({ length: 16 }, (_, k) => ({ a: (k / 16) * Math.PI * 2, d: 0.5 + (k % 3) * 0.25, r: 180 + (k % 4) * 60 }));
const Nube: React.FC<{ t: number }> = ({ t }) => {
  const p = (t - (T_NUBE - 0.3)) / 0.75;
  if (p < 0 || p > 1) return null;
  const crece = suave(Math.min(1, p / 0.45));
  const disipa = Math.max(0, (p - 0.5) / 0.5);
  const origen = aPantalla(camTarde(T_NUBE - 0.3), PUNTOS.cofre.x, PUNTOS.cofre.y - 40);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="nube-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
      </defs>
      <g filter="url(#nube-blur)" opacity={1 - disipa}>
        {NUBES.map((n, k) => (
          <circle key={k} cx={origen.x + (540 - origen.x) * crece + Math.cos(n.a) * 900 * n.d * crece} cy={origen.y + (800 - origen.y) * crece + Math.sin(n.a) * 1100 * n.d * crece} r={n.r * (0.3 + 1.6 * crece) * (1 + disipa * 0.6)} fill="#e6e4e8" />
        ))}
      </g>
    </svg>
  );
};

const Escenario: React.FC<{ t: number }> = ({ t }) => {
  const i = ESCENAS.findIndex((e) => t >= e.desde && t < e.hasta);
  const e = ESCENAS[i < 0 ? ESCENAS.length - 1 : i];
  const k = ESCENAS.indexOf(e);
  // Fundido de 4 fotogramas con la escena anterior (en las transformaciones lo tapa el objeto).
  const anterior = k > 0 && t - e.desde < 4 / FPS ? ESCENAS[k - 1] : null;
  const mezcla = anterior ? (t - e.desde) / (4 / FPS) : 1;
  const tr = TRANSFORMACIONES.find((x) => Math.abs(t - x.t) <= VENTANA_MORFO);
  const opMorfo = tr ? Math.min(1, (VENTANA_MORFO - Math.abs(t - tr.t)) / 0.06) : 0;
  return (
    <AbsoluteFill>
      {anterior ? <CapaEscena e={anterior} t={t} opacidad={1} /> : null}
      <CapaEscena e={e} t={t} opacidad={mezcla} />
      {tr ? <Morfo de={tr.de} a={tr.a} p={(t - (tr.t - VENTANA_MORFO)) / (2 * VENTANA_MORFO)} opacidad={opMorfo} /> : null}
      <Nube t={t} />
    </AbsoluteFill>
  );
};

// ---------- Textos y gráficos sobre la escena ----------
const SECCIONES = [
  { n: 1, texto: "LLANTAS", desde: T_LLANTA + 0.1, hasta: B1 },
  { n: 2, texto: "FRENOS", desde: B1 + 0.2, hasta: B2 },
  { n: 3, texto: "BATERÍA", desde: B3 + 0.2, hasta: B4 },
  { n: 4, texto: "ACEITE Y ANTICONGELANTE", desde: B4 + 0.2, hasta: B5 },
  { n: 5, texto: "LUCES Y LIMPIADORES", desde: T.luces, hasta: B6 },
];
// Etiqueta de sección: el número entra con resorte y el nombre sale desde su máscara.
const EtiquetaSeccion: React.FC<{ t: number }> = ({ t }) => {
  const s = SECCIONES.find((x) => t >= x.desde && t < x.hasta);
  if (!s) return null;
  const entra = resorte(t, s.desde);
  const sale = rampa(t, s.hasta - 0.2, s.hasta);
  return (
    <div style={{ position: "absolute", left: 70, top: 352, display: "flex", alignItems: "center", gap: 16, opacity: 1 - sale }}>
      <div style={{ width: 64, height: 64, borderRadius: 32, background: DEGRADADO, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 40, color: "#fff", transform: `scale(${entra})`, boxShadow: "0 8px 24px rgba(204,35,40,0.5)" }}>{s.n}</div>
      <div style={{ overflow: "hidden" }}>
        <div style={{ transform: `translateY(${(1 - resorte(t, s.desde + 0.08)) * 110}%)`, fontFamily: ANTON, fontSize: 44, color: "#fff", letterSpacing: 2, textShadow: "0 4px 18px rgba(0,0,0,0.7)" }}>{s.texto}</div>
      </div>
    </div>
  );
};

// Tarjetas de vidrio con las 5 revisiones (introducción).
const TARJETAS = [
  { e: "🛞", l: "Llantas" },
  { e: "🛑", l: "Frenos" },
  { e: "🔋", l: "Batería" },
  { e: "🛢️", l: "Aceite" },
  { e: "💡", l: "Luces" },
];
const Tarjetas: React.FC<{ t: number }> = ({ t }) => {
  if (t < T_TARJETAS[0] || t > c03a.inicio + 0.3) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 340, display: "flex", justifyContent: "space-between" }}>
      {TARJETAS.map((c, k) => {
        const entra = resorte(t, T_TARJETAS[k], 12);
        const sale = rampa(t, c02.fin - 0.05 + k * 0.03, c02.fin + 0.25 + k * 0.03);
        return (
          <div key={c.l} style={{ width: 182, height: 170, overflow: "hidden", borderRadius: 26 }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 26,
                background: "rgba(255,255,255,0.12)",
                border: "2px solid rgba(255,255,255,0.28)",
                backdropFilter: "blur(14px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transform: `translateY(${(1 - entra) * 105 - sale * 105}%)`,
                boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
              }}
            >
              <span style={{ fontSize: 64 }}>{c.e}</span>
              <span style={{ fontFamily: POPPINS, fontWeight: PESO_POPPINS, fontSize: 26, color: "#fff" }}>{c.l}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// "+3 AÑOS" y "30 MIN": revelados con barra roja.
const Insignia: React.FC<{ t: number; t0: number; t1: number; texto: string; x: number; y: number }> = ({ t, t0, t1, texto, x, y }) =>
  t >= t0 && t < t1 ? (
    <div style={{ position: "absolute", left: x, top: y, opacity: 1 - rampa(t, t1 - 0.15, t1) }}>
      <BarraRevela t={t} t0={t0}>
        <div style={{ background: "#fff", color: ROJO_DA, fontFamily: ANTON, fontSize: 52, padding: "6px 26px 10px", borderRadius: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.45)" }}>{texto}</div>
      </BarraRevela>
    </div>
  ) : null;

const DatoReloj: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.treinta - 0.05 || t > B7) return null;
  const sube = resorte(t, T.treinta + 0.25);
  const c = camReloj(t);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 560 - 150, height: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${c.z})`, opacity: 1 - rampa(t, B7 - 0.12, B7) }}>
      <BarraRevela t={t} t0={T.treinta - 0.05}>
        <div style={{ fontFamily: ANTON, fontSize: 200, lineHeight: 1, color: "#fff", padding: "0 10px", textShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>30</div>
      </BarraRevela>
      <div style={{ overflow: "hidden" }}>
        <div style={{ transform: `translateY(${(1 - sube) * 110}%)`, fontFamily: ANTON, fontSize: 64, color: ROJO_DA, letterSpacing: 8 }}>MIN</div>
      </div>
    </div>
  );
};

const Boton: React.FC<{ t: number }> = ({ t }) => {
  if (t < B7 + VENTANA_MORFO - 0.04) return null;
  const pulso = 1 + 0.03 * Math.sin((t - B7) * Math.PI * 2 * (BPM ? BPM / 60 / 2 : 1));
  const texto = resorte(t, B7 + VENTANA_MORFO - 0.05);
  return (
    <div style={{ position: "absolute", left: BOTON.cx - BOTON.w / 2, top: BOTON.cy - BOTON.h / 2, width: BOTON.w, height: BOTON.h, transform: `scale(${pulso})` }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 46, background: DEGRADADO, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 18px 50px rgba(204,35,40,0.55)" }}>
        <div style={{ transform: `translateY(${(1 - texto) * 110}%)`, fontFamily: ANTON, fontSize: 66, color: "#fff", whiteSpace: "nowrap" }}>{c08.boton}</div>
      </div>
    </div>
  );
};

const ONOMATOPEYAS = [
  { texto: "¡PSSSH!", t0: 0.15, x: 640, y: 430, giro: -8 },
  { texto: "¡RIIICH!", t0: T.rechinan, x: 760, y: 420, giro: 7 },
  { texto: "RRR… ¡CLIC!", t0: c05b.inicio + 0.35, x: 560, y: 330, giro: -5 },
  { texto: "¡SWISH!", t0: T_PLUMA + 0.2, x: 700, y: 420, giro: 6 },
];

// ---------- Mascota ----------
const DERECHA: Ancla = { x: 805, abajo: 1430, alto: 455 };
const MascotaAnimada: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const datos = clips.map((c) => useAudioData(staticFile(`audio/viaje/${c.archivo}`)));
  let i = clips.findIndex((c) => t >= c.inicio && t < c.fin + guion.pausaEntreClipsSegundos);
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
      ancla={DERECHA}
      anclaAnterior={DERECHA}
      objetivo={{ x: PANEL.x + 700 * PANEL.escala, y: PANEL.y + 200 * PANEL.escala }}
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
    <div style={{ position: "absolute", left: 80, right: 80, top: 292, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.15)" }}>
      <div style={{ width: `${(frame / (durationInFrames - 1)) * 100}%`, height: "100%", borderRadius: 3, background: DEGRADADO, boxShadow: "0 0 12px rgba(204,35,40,0.8)" }} />
    </div>
  );
};

// ---------- Stickers ----------
const ESQ_DER = { x: 912, y: 420 };
const STICKERS = [
  { id: "c01", emoji: "🎄", ...ESQ_DER, t0: T.viaje, vida: 1.3 },
  { id: "c04", emoji: "🥶", ...ESQ_DER, t0: T.frio, vida: 1.2 },
  { id: "c05b", emoji: "😱", ...ESQ_DER, t0: T.arranca + 0.1, vida: 1.2 },
  { id: "c07a", emoji: "🌧️", ...ESQ_DER, t0: c07a.inicio + 0.35, vida: 1.3 },
  { id: "c07d", emoji: "✅", ...ESQ_DER, t0: T.salvan, vida: c07d.fin - T.salvan },
  { id: "c08", emoji: "💬", x: 912, y: 640, t0: c08.inicio + 0.5, vida: c08.duracion - 0.5 },
];

// ---------- Sonido ----------
type Efecto = { nombre: string; archivo: string; t: number; dur: number; volumen: number | null };
const D: Record<string, number> = {
  clac: 0.26, clic: 0.2, ding: 0.9, riser: 1.5, "tic-tac": 1.2, foco: 0.6, "motor-enciende": 1.6,
  "whoosh-a": 0.5, "whoosh-b": 0.48, "whoosh-c": 0.5,
  "mk-pop": 0.5, "mk-hit": 1.0, "mk-swipe": 0.7, "mk-whoosh-zoom": 0.8, "mk-error": 0.6, "mk-clic": 0.3,
  "viaje/aire": 0.9, "viaje/glu": 1.0, "viaje/hielo": 1.0, "viaje/marcha-falla": 1.6, "viaje/trueno": 2.2, "viaje/limpiador": 0.55, "viaje/brillo": 0.9,
  "ruidos/rechinido-frenos": 1.0,
};
const efecto = (nombre: string, archivo: string, t: number, volumen: number | null = null): Efecto => ({ nombre, archivo, t, dur: D[archivo] ?? 0.5, volumen });
const clicsIntermitente = (t0: number, t1: number, nombre: string) => {
  const lista: Efecto[] = [];
  for (let k = 0; t0 + k / 3 < t1; k++) lista.push(efecto(`${nombre} ${k + 1}`, "mk-clic", t0 + k / 3, 0.22));
  return lista;
};
const EFECTOS: Efecto[] = [
  efecto("Hit gancho", "mk-hit", 0),
  efecto("Vapor del cofre", "viaje/aire", 0.08, 0.4),
  ...clicsIntermitente(0.2, T_NUBE - 0.2, "Intermitentes"),
  efecto("Título gancho", "mk-swipe", c01.inicio + 0.12),
  efecto("Nube de humo", "mk-whoosh-zoom", T_NUBE - 0.35),
  efecto("Motor arranca", "motor-enciende", T_NUBE, 0.3),
  ...T_TARJETAS.map((tt, k) => efecto(`Pop tarjeta ${k + 1}`, "mk-pop", tt)),
  efecto("Cámara a la llanta", "mk-whoosh-zoom", c03a.inicio),
  efecto("Brillo llanta", "viaje/brillo", T_LLANTA),
  efecto("Aire presión", "viaje/aire", T.presion, 0.4),
  efecto("Lupa dibujo", "clac", T.dibujo),
  efecto("Llanta lisa", "mk-error", T.lisas + 0.3, 0.3),
  efecto("Aviso refacción", "mk-swipe", c03b.inicio + 0.6),
  efecto("Rechinido", "ruidos/rechinido-frenos", T.rechinan, 0.45),
  efecto("Pinza", "clac", T.frenos),
  ...BLOQUES_BUCLE().map((t0, k) => efecto(`Riser bucle ${k + 1}`, "riser", t0 - D.riser)),
  efecto("Hielo", "viaje/hielo", B2 + 0.1, 0.45),
  efecto("Título frío", "mk-swipe", c04.inicio + 0.12),
  efecto("+3 años", "mk-pop", T.tresAnos),
  efecto("Marcha que no arranca", "viaje/marcha-falla", c05b.inicio + 0.3, 0.5),
  efecto("Hit no arranca", "mk-hit", T.arranca),
  efecto("Bayoneta", "clac", T.aceite),
  efecto("Glu-glu", "viaje/glu", T.anti, 0.45),
  efecto("Ding niveles", "ding", T.nivel),
  efecto("Aviso radiador", "mk-swipe", c05c.inicio + 0.6),
  efecto("Título noche", "mk-swipe", c06.inicio + 0.12),
  efecto("Faros", "foco", T.noche),
  efecto("Trueno", "viaje/trueno", c07a.inicio, 0.5),
  efecto("Altas", "foco", T.altas),
  efecto("Frenos", "clac", T.frenos2),
  ...clicsIntermitente(T.direccionales, c07b.fin, "Direccional"),
  efecto("Cámara al parabrisas", "mk-whoosh-zoom", c07c.inicio),
  ...[0, 1, 2].map((k) => efecto(`Pluma ${k + 1}`, "viaje/limpiador", T_PLUMA + k * 0.9, 0.45)).filter((e) => e.t < B6),
  efecto("Tic-tac", "tic-tac", T.treinta + 0.1, 0.3),
  efecto("Hit 30 min", "mk-hit", T.treinta),
  efecto("Ding 30 min", "ding", T.treinta + 0.12),
  efecto("Botón", "mk-pop", B7 + VENTANA_MORFO),
  ...TRANSFORMACIONES.flatMap((x, k) => [efecto(`Transformación ${k + 1}`, x.sonido, x.t - 0.2), efecto(`Brillo transformación ${k + 1}`, "viaje/brillo", x.t + 0.1, 0.25)]),
  ...STICKERS.map((st) => efecto(`Pop sticker ${st.emoji}`, "mk-pop", st.t0)),
  ...clips.filter((c) => c.mascota.globo).map((c) => efecto(`Pop globo ${c.id}`, "mk-pop", c.inicio + 0.35)),
];
function BLOQUES_BUCLE() {
  return [c04.inicio, c06.inicio];
}
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
// Música: 0.12, baja a 0.07 con voz; 0.2 en el primer y último segundo; entrada 0.5 s y salida 1 s.
const volumenMusica = (total: number) => (f: number) => {
  const t = f / FPS;
  const r = 5 / FPS;
  const duck = Math.max(
    0,
    ...clips.map(({ voz: [a, b] }) => (t < a - r || t > b + r ? 0 : t < a ? (t - (a - r)) / r : t > b ? 1 - (t - b) / r : 1)),
  );
  let base = 0.12 - 0.05 * duck;
  if ((t < 1 && duck === 0) || t > total - 1) base = Math.max(base, 0.2);
  return base * Math.max(0, Math.min(1, t / 0.5, (total - t) / 1));
};
// Desenfoque de movimiento en los cambios rápidos: transformaciones, nube y llegadas de cámara.
const RAPIDOS: [number, number][] = [
  ...TRANSFORMACIONES.map((x) => [x.t - VENTANA_MORFO, x.t + VENTANA_MORFO] as [number, number]),
  [T_LLANTA - 0.3, T_LLANTA + 0.1],
  [T_PARABRISAS - 0.3, T_PARABRISAS + 0.1],
  [T_NUBE - 0.3, T_NUBE + 0.2],
];

export const TemaViaje: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / FPS;
  const lineas = clips.flatMap((c) => c.lineas);
  const rapido = RAPIDOS.some(([a, b]) => t >= a && t <= b);
  const escenario = <Escenario t={t} />;
  const titulo = clips.find((c) => c.pantalla && t >= c.inicio - 0.1 && t < c.fin + 0.4);
  return (
    <AbsoluteFill style={{ background: "#08080a" }}>
      {rapido ? (
        <CameraMotionBlur samples={5} shutterAngle={180}>
          {escenario}
        </CameraMotionBlur>
      ) : (
        escenario
      )}

      <Tarjetas t={t} />
      <EtiquetaSeccion t={t} />
      <Insignia t={t} t0={T.tresAnos} t1={B4 - 0.1} texto="+3 AÑOS" x={610} y={790} />
      <DatoReloj t={t} />
      {titulo ? (
        <div style={{ position: "absolute", left: 50, right: 50, top: 724, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TituloMascara texto={titulo.pantalla ?? ""} resaltar={titulo.pantallaResaltar ?? []} t={t} t0={titulo.inicio + 0.12} t1={titulo.fin - 0.15} tamano={74} />
        </div>
      ) : null}
      {clips.filter((c) => c.aviso).map((c) => (
        <FranjaMascara key={c.id} texto={c.aviso ?? ""} t={t} t0={c.inicio + 0.6} t1={c.fin + 0.1} arriba={772} />
      ))}
      {ONOMATOPEYAS.map((o) => (
        <Onomatopeya key={o.texto} texto={o.texto} x={o.x} y={o.y} t={t} t0={o.t0} vida={0.9} giro={o.giro} />
      ))}
      <Boton t={t} />
      <Rafaga x={540} y={796} t={t} t0={B7 + VENTANA_MORFO} radio={320} color={ROJO_DA} lineas={16} />
      {STICKERS.map((st) => (
        <Sticker key={st.id} emoji={st.emoji} x={st.x} y={st.y} t={t} t0={st.t0} vida={st.vida} tamano={100} />
      ))}

      <MascotaAnimada />
      <AcabadoPremium frame={frame} calidez={t < B5 || t > B7 ? 1 : 0.4} />
      <BarraProgreso />
      <Img src={staticFile("logo-doctor-auto.png")} alt={guion.marcaDeAgua} style={{ position: "absolute", left: 80, top: 308, height: 30, opacity: 0.55 }} />

      <SubtitulosDA lineas={lineas} desde={0} hasta={c08.inicio} arriba={885} alto={265} tamano={52} izquierda={70} derecha={520} sostenerFinal={false} />
      <SubtitulosDA lineas={lineas} desde={c08.inicio} hasta={Infinity} arriba={880} alto={80} tamano={46} izquierda={70} derecha={70} sostenerFinal />

      <Track name="Voz">
        {clips.map((c) =>
          c.audioDisponible ? (
            <Sequence key={c.id} name={`Voz ${c.id}`} from={desde(c.inicioAudio)} durationInFrames={Math.ceil(c.duracionAudio * FPS)}>
              <Audio src={staticFile(`audio/viaje/${c.archivo}`)} volume={1} />
            </Sequence>
          ) : null,
        )}
      </Track>
      <Track name="Lluvia">
        <Sequence name="Lluvia" from={desde(c07a.inicio - 0.1)} durationInFrames={desde(B6 - c07a.inicio + 0.1)}>
          <Audio src={staticFile("sfx/viaje/lluvia.wav")} loop volume={(f) => 0.22 * Math.min(1, f / 8, (desde(B6 - c07a.inicio + 0.1) - f) / 8)} />
        </Sequence>
      </Track>
      {hayMusica ? <Audio src={staticFile("musica.mp3")} loop volume={volumenMusica(durationInFrames / FPS)} /> : null}
      {repartirEnPistas(desfasar(EFECTOS)).map((lista, k) => (
        <Track key={k} name={`Efectos ${k + 1}`}>
          {lista.map((e) => (
            <Sequence key={e.nombre} name={e.nombre} from={Math.max(0, desde(e.t))} durationInFrames={Math.max(1, desde(e.dur))}>
              <Audio src={staticFile(`sfx/${e.archivo}.wav`)} volume={volumenEfecto(e)} />
            </Sequence>
          ))}
        </Track>
      ))}
    </AbsoluteFill>
  );
};

export { duracionVoz, anguloPluma };
