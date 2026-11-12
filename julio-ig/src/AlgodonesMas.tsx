import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { Destello, Grano } from "./cine";
import { C, Reel, SANS, SERIF } from "./comun";
import { Camara, Transformar } from "./edicion";
import { Degradados, Desierto, Diente, Fuente, Titulo, VIDRIO } from "./Algodones";
import { DURACION_MAS_EN, DURACION_MAS_ES, PALABRAS_EN, PALABRAS_ES } from "./algodones-mas-tiempos";

// «Algodones es más que dentistas» / «Los Algodones is more than dentists». Serie bilingüe para promover el destino.
// Datos: INEGI, DENUE, localidad Vicente Guerrero (Algodones), consultas del 7 nov 2026 (311 consultorios) y 11 nov 2026 (el resto).
// Una sola pieza para los dos idiomas: cambian la voz, los textos y los tiempos (por palabra, con Whisper).
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const mezcla = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

type Idioma = "es" | "en";
type Texto = { texto: string; i: [number, number]; frase: string | null; fi: [number, number] | null; resaltar: string[] | null };
const GUION: Record<Idioma, {
  P: number[];
  dur: number;
  voz: string;
  t1: Texto; t2: Texto; t3: Texto; t4: Texto;
  filas: { icono: string; n: number; texto: string; i: number }[];
  total: string;
  iconos: [number, number, number];
  fuente: string;
  lugar: string;
}> = {
  es: {
    P: PALABRAS_ES,
    dur: DURACION_MAS_ES,
    voz: "voz-algodones-mas-es.mp3",
    t1: { texto: "Todos conocen Los Algodones por sus dentistas…", i: [0, 7], frase: "pero el pueblo es mucho más que eso.", fi: [7, 15], resaltar: ["dentistas…"] },
    t2: { texto: "Además de sus 311 consultorios, hay…", i: [15, 21], frase: null, fi: null, resaltar: ["311"] },
    t3: { texto: "Así que si vienes por tu sonrisa…", i: [38, 45], frase: "quédate a comer unos tacos y llévate una artesanía.", fi: [45, 54], resaltar: ["sonrisa…"] },
    t4: { texto: "¿Ya conocías este lado de Algodones?", i: [54, 60], frase: null, fi: null, resaltar: ["lado"] },
    filas: [
      { icono: "🦷", n: 311, texto: "consultorios dentales", i: 18 },
      { icono: "🎨", n: 81, texto: "tiendas de artesanías", i: 21 },
      { icono: "🍽️", n: 89, texto: "restaurantes y cafeterías", i: 25 },
      { icono: "👓", n: 36, texto: "lentes y ópticas", i: 29 },
      { icono: "💊", n: 29, texto: "farmacias", i: 36 },
    ],
    total: "995 negocios registrados en el pueblo",
    iconos: [44, 49, 53],
    fuente: "Fuente: INEGI, DENUE (consultas del 7 y 11 de noviembre de 2026)",
    lugar: "📍 Vicente Guerrero (Los Algodones), Baja California",
  },
  en: {
    P: PALABRAS_EN,
    dur: DURACION_MAS_EN,
    voz: "voz-algodones-mas-en.mp3",
    t1: { texto: "Everyone knows Los Algodones for its dentists…", i: [0, 7], frase: "but the town is so much more than that.", fi: [7, 16], resaltar: ["dentists…"] },
    t2: { texto: "Besides its 311 dental offices, there are…", i: [16, 23], frase: null, fi: null, resaltar: ["311"] },
    t3: { texto: "So if you come for your smile…", i: [38, 45], frase: "stay for some tacos and take home a handcrafted souvenir.", fi: [45, 55], resaltar: ["smile…"] },
    t4: { texto: "Did you know this side of Algodones?", i: [55, 62], frase: null, fi: null, resaltar: ["side"] },
    filas: [
      { icono: "🦷", n: 311, texto: "dental offices", i: 18 },
      { icono: "🎨", n: 81, texto: "craft shops", i: 23 },
      { icono: "🍽️", n: 89, texto: "restaurants & cafés", i: 26 },
      { icono: "👓", n: 36, texto: "eyewear & optical shops", i: 30 },
      { icono: "💊", n: 29, texto: "pharmacies", i: 36 },
    ],
    total: "995 registered businesses in town",
    iconos: [44, 48, 53],
    fuente: "Source: INEGI (Mexico's statistics institute), DENUE business directory, Nov 2026",
    lugar: "📍 Vicente Guerrero (Los Algodones), Baja California, Mexico",
  },
};

const PANEL = { x: 90, y: 720, w: 900, h: 640 };

const Recorrido: React.FC<{ idioma: Idioma }> = ({ idioma }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = GUION[idioma];
  const P = g.P;
  const tiempos = (t: Texto) => P.slice(t.i[0], t.i[1]);
  const tFrase = (t: Texto) => (t.fi ? P.slice(t.fi[0], t.fi[1]) : null);
  // Tramos
  const B = P[g.t2.i[0]] - 12; // datos
  const Cc = P[g.t3.i[0]] - 10; // sonrisa, tacos, artesanía
  const D = P[g.t4.i[0]] - 10; // pregunta

  // A. El diente brillante: aparece, late con «dentistas» y, con «más que eso», se transforma en el panel.
  const dienteE = spring({ frame: frame - 10, fps, config: { damping: 20, mass: 1.2 } });
  const late = 1 + 0.08 * Math.sin(mezcla(frame, P[6], P[6] + 14) * Math.PI);
  const encoge = mezcla(frame, P[g.t1.fi![0]], P[g.t1.fi![1] - 1]);

  // B. Panel de giros: la cámara sigue la fila que se está diciendo.
  const filaY = (k: number) => PANEL.y + 70 + k * 108;
  const camPuntos = [
    { f: B, x: 540, y: 960, s: 1 },
    ...g.filas.map((r, k) => ({ f: P[r.i] - 6, x: 550, y: 960 * 0.6 + (filaY(k) + 40) * 0.4, s: 1.06 })),
    { f: P[g.filas[4].i] + 30, x: 540, y: 1000, s: 1.0 },
    { f: Cc, x: 540, y: 1000, s: 1.0 },
  ];

  // C. Tres círculos: sonrisa → tacos → artesanía.
  const ICONOS = ["🦷", "🌮", "🎨"];
  const ancho = 250;

  return (
    <AbsoluteFill>
      <Degradados />

      {/* A */}
      {frame < B + 4 ? (
        <div style={{ position: "absolute", left: 540 - 180, top: 860, width: 360, height: 360, opacity: dienteE * (1 - mezcla(frame, B - 10, B)), transform: `scale(${dienteE * late * (1 - encoge * 0.45)}) translateY(${encoge * 60}px)`, filter: "drop-shadow(0 0 60px rgba(255,220,170,0.65))" }}>
          <Diente tam={360} color="brillo" />
        </div>
      ) : null}
      {/* Íconos de los otros giros que salen del diente con «mucho más» */}
      {frame < B + 4
        ? ["🎨", "🍽️", "👓", "💊", "🌮", "💍"].map((e, k) => {
            const a = (k / 6) * Math.PI * 2 - Math.PI / 2;
            const t = spring({ frame: frame - (P[g.t1.fi![0] + 5] + k * 3), fps, config: { damping: 14 } });
            const r = 250 * t;
            return (
              <div key={k} style={{ position: "absolute", left: 540 + Math.cos(a) * r - 45, top: 1040 + Math.sin(a) * r - 45, width: 90, height: 90, borderRadius: 45, ...VIDRIO, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, opacity: Math.min(1, t * 1.5) * (1 - mezcla(frame, B - 10, B)), transform: `scale(${t})` }}>
                {e}
              </div>
            );
          })
        : null}

      {/* B */}
      {frame >= B - 8 && frame < Cc + 30 ? (
        <Camara puntos={camPuntos}>
          <Transformar de={{ x: 540 - 100, y: 940, w: 200, h: 200, radio: 100, color: "rgba(255,244,230,0.9)" }} a={{ ...PANEL, radio: 40, color: "transparent" }} desde={B - 8} dur={22}>
            <div style={{ position: "relative", width: "100%", height: "100%", ...VIDRIO, borderRadius: 40, boxSizing: "border-box", opacity: 1 - mezcla(frame, Cc, Cc + 14) }}>
              {g.filas.map((r, k) => {
                const e = spring({ frame: frame - (P[r.i] - 4), fps, config: { damping: 20, mass: 1.2 } });
                const n = interpolate(frame, [P[r.i], P[r.i] + 18], [0, r.n], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
                const barra = (r.n / 311) * 330 * mezcla(frame, P[r.i], P[r.i] + 20);
                const activa = frame >= P[r.i] && (k === 4 || frame < P[g.filas[k + 1].i]);
                return (
                  <div key={k} style={{ position: "absolute", left: 34, right: 34, top: 50 + k * 108, height: 96, display: "flex", alignItems: "center", gap: 22, opacity: Math.min(1, e * 1.4), transform: `translateX(${(1 - e) * 60}px)` }}>
                    <div style={{ width: 80, height: 80, borderRadius: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, background: activa ? "linear-gradient(160deg, rgba(255,165,82,0.45), rgba(255,107,91,0.3))" : "rgba(255,244,230,0.08)", border: `1.5px solid ${activa ? "rgba(255,165,82,0.7)" : "rgba(255,244,230,0.15)"}` }}>{r.icono}</div>
                    <div style={{ width: 150, fontFamily: SERIF, fontWeight: 800, fontSize: 60, color: activa ? C.naranja : C.crema, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{Math.round(n)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.crema, lineHeight: 1.15 }}>{r.texto}</div>
                      <div style={{ marginTop: 8, height: 12, width: barra, borderRadius: 6, background: k === 0 ? "linear-gradient(90deg, #F3E8D8, #CDBBA2)" : `linear-gradient(90deg, ${C.naranja}, ${C.coral})`, boxShadow: activa ? "0 0 18px rgba(255,165,82,0.6)" : "none" }} />
                    </div>
                  </div>
                );
              })}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: 1, color: "rgba(255,244,230,0.75)", opacity: mezcla(frame, P[g.filas[4].i] + 24, P[g.filas[4].i] + 38) }}>{g.total}</div>
            </div>
          </Transformar>
        </Camara>
      ) : null}

      {/* C: el panel se encoge en el primer círculo; sonrisa → tacos → artesanía */}
      {frame >= Cc && frame < D + 20 ? (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - mezcla(frame, D, D + 16) }}>
          {ICONOS.map((ic, k) => {
            const t0 = P[g.iconos[k]] - 4;
            const e = spring({ frame: frame - t0, fps, config: { damping: 13 } });
            const x = 75 + k * (ancho + 40);
            const flecha = mezcla(frame, t0 - 10, t0 + 2);
            return (
              <div key={k}>
                {k > 0 ? <div style={{ position: "absolute", left: x - 40, top: 1000 + ancho / 2 - 3, width: 40 * flecha, height: 6, borderRadius: 3, background: C.naranja }} /> : null}
                <div style={{ position: "absolute", left: x, top: 1000, width: ancho, height: ancho, borderRadius: ancho / 2, ...VIDRIO, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 130, transform: `scale(${e})`, opacity: Math.min(1, e * 1.5), boxShadow: frame >= t0 + 4 && (k === 2 || frame < P[g.iconos[k + 1]] - 4) ? "0 0 60px rgba(255,165,82,0.55), inset 0 1px 0 rgba(255,255,255,0.22)" : VIDRIO.boxShadow }}>
                  {ic}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* D: la pregunta y el lugar */}
      {frame >= D ? (
        <div style={{ position: "absolute", left: 70, right: 70, top: 1000, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <div style={{ transform: `scale(${spring({ frame: frame - D - 6, fps, config: { damping: 14 } })})`, fontSize: 150 }}>🌵</div>
          <div style={{ ...VIDRIO, borderRadius: 40, padding: "16px 30px", fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.crema, textAlign: "center", opacity: mezcla(frame, D + 20, D + 34) }}>{g.lugar}</div>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: 2, color: "rgba(255,244,230,0.8)", opacity: mezcla(frame, D + 40, D + 54) }}>@julio.chaidez1</div>
        </div>
      ) : null}

      {/* Velo arriba para que los títulos se lean */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,9,22,0.8) 0%, rgba(7,9,22,0.5) 28%, transparent 40%)" }} />

      {[B - 8, Cc, D].map((d) => (
        <Sequence key={d} from={d} durationInFrames={16}>
          <Destello />
        </Sequence>
      ))}

      <Fuente texto={g.fuente} desde={P[g.filas[0].i]} hasta={Cc + 6} />

      <Titulo texto={g.t1.texto} tiempos={tiempos(g.t1)} resaltar={g.t1.resaltar} frase={g.t1.frase} tiemposFrase={tFrase(g.t1)} hasta={B} />
      <Titulo texto={g.t2.texto} tiempos={tiempos(g.t2)} resaltar={g.t2.resaltar} frase={null} tiemposFrase={null} hasta={Cc} />
      <Titulo texto={g.t3.texto} tiempos={tiempos(g.t3)} resaltar={g.t3.resaltar} frase={g.t3.frase} tiemposFrase={tFrase(g.t3)} hasta={D} />
      <Titulo texto={g.t4.texto} tiempos={tiempos(g.t4)} resaltar={g.t4.resaltar} frase={null} tiemposFrase={null} hasta={g.dur + 20} />
    </AbsoluteFill>
  );
};

const EscenaEs: React.FC = () => (
  <CameraMotionBlur shutterAngle={160} samples={5}>
    <Recorrido idioma="es" />
  </CameraMotionBlur>
);
const EscenaEn: React.FC = () => (
  <CameraMotionBlur shutterAngle={160} samples={5}>
    <Recorrido idioma="en" />
  </CameraMotionBlur>
);

export const AlgodonesMas: React.FC<{ idioma: Idioma }> = ({ idioma }) => {
  const g = GUION[idioma];
  const P = g.P;
  const B = P[g.t2.i[0]] - 12;
  const Cc = P[g.t3.i[0]] - 10;
  const D = P[g.t4.i[0]] - 10;
  const SONIDOS: [number, string, number][] = [
    [12, "pop", 0.3],
    [P[g.t1.fi![0] + 5], "brillo", 0.3],
    [B - 8, "whoosh", 0.35],
    ...g.filas.map((r): [number, string, number] => [P[r.i], "pop", 0.32]),
    [Cc, "whoosh", 0.35],
    [P[g.iconos[0]] - 4, "pop", 0.3],
    [P[g.iconos[1]] - 4, "ding", 0.3],
    [P[g.iconos[2]] - 4, "brillo", 0.35],
    [D, "whoosh", 0.35],
    [D + 20, "notificacion", 0.3],
  ];
  return (
    <>
      <Reel
        duracion={g.dur}
        fondo={<Desierto duracion={g.dur} enfoque={[[0, 30, g.dur - 60, g.dur], [3, 6, 6, 3]]} />}
        etiqueta={null}
        voz={g.voz}
        musica="musica-algodones.mp3"
        volumenMusica={0.16}
        sonidos={SONIDOS}
        escenas={[
          {
            desde: 0,
            dur: g.dur,
            Pieza: idioma === "es" ? EscenaEs : EscenaEn,
          },
        ]}
      />
      <Grano />
    </>
  );
};
