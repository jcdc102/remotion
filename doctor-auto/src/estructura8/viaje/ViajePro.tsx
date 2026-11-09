// Tema «viaje» versión pro: tomas reales (ElevenLabs/Kling) a pantalla completa con
// movimiento constante, batería 3D y llanta 3D, música real, etiquetas sobre el video,
// textos desde máscara y la voz DOCTOR AUTO. Cada entrada cae en su palabra.
import { AbsoluteFill, Img, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { construirClips, momentoEnClip, type Clip, type GuionClips } from "../../doctor-auto/clips";
import { BarraProgreso, BotonFinal, EtiquetaSeccion, Mezcla, MascotaVoz, type Efecto } from "../../doctor-auto/comunes";
import { ROJO_DA } from "../../doctor-auto/constantes";
import { Rafaga, Sticker } from "../../doctor-auto/Emociones";
import { AcabadoPremium, FranjaMascara, TituloMascara } from "../../doctor-auto/premium";
import { ChipVidrio, Destello, Insignia, Legibilidad, NumeroGrande, Senal, Tomas, type Toma } from "../../doctor-auto/pro";
import { SubtitulosDA } from "../../doctor-auto/Texto";
import { Bateria3D, Escena3D, Llanta3D } from "../../doctor-auto/tres";
import { Onomatopeya } from "../ruidos/Mundo";
import duraciones from "./duraciones.json";
import guionJson from "./guion.json";

const guion = guionJson as unknown as GuionClips;
const FPS = guion.fps;
const { clips, duracionTotal } = construirClips(guion, duraciones, 0);
export const DURACION_VIAJE_PRO = duracionTotal;
const clip = (id: string) => clips.find((c) => c.id === id) as Clip;
const en = (c: Clip, frase: string) => Math.min(Math.max(momentoEnClip(c, frase), c.inicio), c.fin - 0.2);
const limite = (c: Clip) => c.inicio - guion.pausaEntreClipsSegundos / 2;
const resorte = (t: number, t0: number, damping = 13, stiffness = 180) =>
  t < t0 ? 0 : spring({ frame: Math.round((t - t0) * FPS), fps: FPS, config: { damping, stiffness } });
const suave = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const rampa = (t: number, a: number, b: number) => suave(Math.max(0, Math.min(1, (t - a) / (b - a))));

const [c01, c02, c03a, c03b, c03c, c04, c05a, c05b, c05c, c06, c07a, c07b, c07c, c07d, c08] = [
  "c01", "c02", "c03a", "c03b", "c03c", "c04", "c05a", "c05b", "c05c", "c06", "c07a", "c07b", "c07c", "c07d", "c08",
].map(clip);

const T = {
  viaje: en(c01, "viaje"),
  cinco: en(c02, "cinco"),
  presion: en(c03a, "Presión"),
  dibujo: en(c03a, "dibujo"),
  lisas: en(c03b, "lisas"),
  frenos: en(c03c, "frenos"),
  rechinan: en(c03c, "rechinan"),
  frio: en(c04, "frío"),
  tresAnos: en(c05a, "tres años"),
  arranca: en(c05b, "ya no arranca"),
  aceite: en(c05c, "aceite"),
  anti: en(c05c, "anticongelante"),
  noche: en(c06, "noche"),
  altas: en(c07b, "altas"),
  frenos2: en(c07b, "frenos"),
  direccionales: en(c07b, "direccionales"),
  sinRayar: en(c07c, "sin rayar"),
  treinta: en(c07d, "Treinta"),
  salvan: en(c07d, "salvan"),
};
const [L02, L03a, L03c, L04, L05a, L05b, L05c, L06, L07c, L07d, L08] = [c02, c03a, c03c, c04, c05a, c05b, c05c, c06, c07c, c07d, c08].map(limite);
// La llanta 3D gira sola hasta "Presión"; ahí entra la toma real del manómetro.
const T_LLANTA_REAL = T.presion - 0.05;

// ---------- Tomas reales (cada una con su movimiento de cámara) ----------
const TOMAS: Toma[] = [
  { nombre: "Auto varado", archivo: "real/v1-varado.mp4", desde: 0, hasta: L02, zoom: [1.0, 1.14], foco: [40, 45] },
  { nombre: "Carretera", archivo: "real/v2-carretera.mp4", desde: L02, hasta: L03a, zoom: [1.06, 1.18], foco: [45, 55], paneo: [20, -20] },
  { nombre: "Fondo llanta 3D", archivo: "real/i1-taller.png", desde: L03a, hasta: T_LLANTA_REAL, zoom: [1.1, 1.2], foco: [50, 50], desenfoque: 8, filtro: "brightness(0.8)" },
  { nombre: "Manómetro", archivo: "real/v3-llanta.mp4", desde: T_LLANTA_REAL, hasta: L03c, zoom: [1.0, 1.16], foco: [50, 42], velocidad: 1.05 },
  { nombre: "Disco de freno", archivo: "real/v4-freno.mp4", desde: L03c, hasta: L04, zoom: [1.02, 1.15], foco: [50, 40] },
  { nombre: "Frío", archivo: "real/v5-bateria-frio.mp4", desde: L04, hasta: L05a, zoom: [1.15, 1.25], foco: [60, 30], filtro: "hue-rotate(-8deg) brightness(0.9)" },
  { nombre: "Fondo batería 3D", archivo: "real/v5-bateria-frio.mp4", desde: L05a, hasta: L05b, zoom: [1.3, 1.4], foco: [60, 30], velocidad: 0.35, inicioClip: 1.6, desenfoque: 14, filtro: "brightness(0.5)" },
  { nombre: "No arranca", archivo: "real/v5-bateria-frio.mp4", desde: L05b, hasta: L05c, zoom: [1.0, 1.12], foco: [55, 35], velocidad: 1.1, inicioClip: 1.8 },
  { nombre: "Cofre", archivo: "real/v6-cofre.mp4", desde: L05c, hasta: L06, zoom: [1.02, 1.14], foco: [65, 35] },
  { nombre: "Noche con lluvia", archivo: "real/v7-noche-lluvia.mp4", desde: L06, hasta: L07c, zoom: [1.04, 1.2], foco: [70, 30], velocidad: 0.68 },
  { nombre: "Plumas", archivo: "real/v8-parabrisas.mp4", desde: L07c, hasta: L07d, zoom: [1.0, 1.1], foco: [50, 40] },
  { nombre: "Fondo dato", archivo: "real/v9-amanecer.mp4", desde: L07d, hasta: L08, zoom: [1.1, 1.18], foco: [50, 40], velocidad: 0.5, desenfoque: 12, filtro: "brightness(0.55)" },
  { nombre: "Amanecer", archivo: "real/v9-amanecer.mp4", desde: L08, hasta: duracionTotal, zoom: [1.0, 1.12], foco: [50, 45], inicioClip: 1.2 },
];
const CORTES = TOMAS.slice(1).map((tm) => tm.desde);

// ---------- Efectos visuales sobre las tomas ----------
const NIEVE = Array.from({ length: 70 }, (_, k) => ({ x: random(`n${k}`) * 1080, y: random(`m${k}`) * 1920, v: 80 + random(`v${k}`) * 160, r: 2 + random(`r${k}`) * 5 }));
const Nieve: React.FC<{ t: number; fuerza: number }> = ({ t, fuerza }) =>
  fuerza <= 0 ? null : (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: fuerza }}>
      <defs>
        <radialGradient id="escarcha-pro" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#dff4ff" stopOpacity={0} />
          <stop offset="1" stopColor="#dff4ff" stopOpacity={0.5} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#escarcha-pro)" />
      {NIEVE.map((n, k) => (
        <circle key={k} cx={(n.x + Math.sin(t + k) * 25) % 1080} cy={(n.y + t * n.v) % 1920} r={n.r} fill="#fff" opacity={0.7} />
      ))}
    </svg>
  );

// Relámpago al empezar la parte de luces.
const relampago = (t: number) => {
  const l = t - c07a.inicio;
  if (l < 0 || l > 0.6) return 0;
  return Math.max(0, 1 - l / 0.12) + (l > 0.22 ? Math.max(0, 0.7 - (l - 0.22) / 0.15) : 0);
};

// Lista de las 5 revisiones (introducción): fichas de vidrio que suben a su palabra.
const FICHAS = ["🛞 Llantas", "🛑 Frenos", "🔋 Batería", "🛢️ Aceite", "💡 Luces"];
const T_FICHAS = FICHAS.map((_, k) => T.cinco + k * Math.min(0.2, (c02.fin - 0.4 - T.cinco) / 5));
const Fichas: React.FC<{ t: number }> = ({ t }) => (
  <>
    {FICHAS.map((f, k) => (
      <ChipVidrio key={f} t={t} t0={T_FICHAS[k]} t1={L03a + 0.05} texto={f} x={k % 2 === 0 ? 70 : 560} y={360 + Math.floor(k / 2) * 92 + (k === 4 ? 0 : 0)} tamano={36} />
    ))}
  </>
);

// Luces de la parte nocturna: fichas que se acumulan en su palabra.
const LUCES = [
  { texto: "💡 ALTAS ✓", t0: () => T.altas },
  { texto: "🔴 FRENOS ✓", t0: () => T.frenos2 },
  { texto: "🟠 DIRECCIONALES ✓", t0: () => T.direccionales },
];

const SECCIONES = [
  { n: 1, texto: "LLANTAS", desde: L03a + 0.1, hasta: L03c },
  { n: 2, texto: "FRENOS", desde: L03c + 0.1, hasta: L04 },
  { n: 3, texto: "BATERÍA", desde: L05a + 0.1, hasta: L05c },
  { n: 4, texto: "ACEITE Y ANTICONGELANTE", desde: L05c + 0.1, hasta: L06 },
  { n: 5, texto: "LUCES Y LIMPIADORES", desde: c07a.inicio + 0.1, hasta: L07d },
];

const STICKERS = [
  { id: "c01", emoji: "🎄", x: 912, y: 560, t0: T.viaje, vida: 1.3 },
  { id: "c04", emoji: "🥶", x: 912, y: 560, t0: T.frio, vida: 1.2 },
  { id: "c05b", emoji: "😱", x: 912, y: 560, t0: T.arranca + 0.1, vida: 1.2 },
  { id: "c07a", emoji: "🌧️", x: 912, y: 560, t0: c07a.inicio + 0.35, vida: 1.3 },
  { id: "c07d", emoji: "✅", x: 912, y: 560, t0: T.salvan, vida: c07d.fin - T.salvan },
  { id: "c08", emoji: "💬", x: 912, y: 640, t0: c08.inicio + 0.5, vida: c08.duracion - 0.5 },
];

// ---------- Sonido ----------
const D: Record<string, number> = {
  clac: 0.26, clic: 0.2, ding: 0.9, riser: 1.5, "tic-tac": 1.2, foco: 0.6,
  "whoosh-a": 0.5, "whoosh-b": 0.48, "whoosh-c": 0.5, "mk-pop": 0.5, "mk-hit": 1.0, "mk-swipe": 0.7, "mk-whoosh-zoom": 0.8, "mk-error": 0.6, "mk-clic": 0.3,
  "viaje/aire": 0.9, "viaje/glu": 1.0, "viaje/hielo": 1.0, "viaje/marcha-falla": 1.6, "viaje/trueno": 2.2, "viaje/limpiador": 0.55, "viaje/brillo": 0.9, "viaje/lluvia": 3.0,
  "ruidos/rechinido-frenos": 1.0,
};
const ef = (nombre: string, archivo: string, t: number, volumen: number | null = null): Efecto => ({ nombre, archivo, t, dur: D[archivo] ?? 0.5, volumen });
const WHOOSH = ["whoosh-a", "whoosh-b", "whoosh-c", "mk-whoosh-zoom"];
const EFECTOS: Efecto[] = [
  ef("Hit gancho", "mk-hit", 0),
  ef("Vapor", "viaje/aire", 0.1, 0.4),
  ef("Título gancho", "mk-swipe", c01.inicio + 0.12),
  ...CORTES.map((c, k) => ef(`Corte ${k + 1}`, WHOOSH[k % WHOOSH.length], c - 0.18)),
  ...T_FICHAS.map((tt, k) => ef(`Pop ficha ${k + 1}`, "mk-pop", tt)),
  ef("Brillo llanta 3D", "viaje/brillo", L03a + 0.05, 0.3),
  ef("Aire presión", "viaje/aire", T.presion + 0.1, 0.4),
  ef("Dibujo", "clac", T.dibujo),
  ef("Lisas", "mk-error", T.lisas + 0.2, 0.3),
  ef("Aviso refacción", "mk-swipe", c03b.inicio + 0.6),
  ef("Rechinido", "ruidos/rechinido-frenos", T.rechinan, 0.45),
  ef("Riser bucle 1", "riser", c04.inicio - D.riser),
  ef("Hielo", "viaje/hielo", L04 + 0.1, 0.45),
  ef("Título frío", "mk-swipe", c04.inicio + 0.12),
  ef("Batería 3D", "viaje/brillo", L05a + 0.05, 0.3),
  ef("+3 años", "mk-pop", T.tresAnos),
  ef("Marcha que no arranca", "viaje/marcha-falla", c05b.inicio + 0.2, 0.5),
  ef("Hit no arranca", "mk-hit", T.arranca),
  ef("Aceite", "clac", T.aceite),
  ef("Glu-glu", "viaje/glu", T.anti, 0.45),
  ef("Aviso radiador", "mk-swipe", c05c.inicio + 0.6),
  ef("Riser bucle 2", "riser", c06.inicio - D.riser),
  ef("Título noche", "mk-swipe", c06.inicio + 0.12),
  ef("Trueno", "viaje/trueno", c07a.inicio, 0.5),
  ...[0, 1, 2].map((k) => ef(`Lluvia ${k + 1}`, "viaje/lluvia", L06 + k * 2.6, 0.18)),
  ef("Altas", "foco", T.altas),
  ef("Frenos", "clac", T.frenos2),
  ...[0, 1, 2, 3].map((k) => ef(`Direccional ${k + 1}`, "mk-clic", T.direccionales + k / 3, 0.22)),
  ef("Pluma 1", "viaje/limpiador", L07c + 0.3, 0.45),
  ef("Pluma 2", "viaje/limpiador", L07c + 1.3, 0.45),
  ef("Sin rayar", "ding", T.sinRayar + 0.2),
  ef("Hit 30", "mk-hit", T.treinta),
  ef("Ding 30", "ding", T.treinta + 0.12),
  ef("Tic-tac", "tic-tac", T.treinta + 0.3, 0.25),
  ef("Botón", "mk-pop", c08.inicio + 0.3),
  ...STICKERS.map((s) => ef(`Sticker ${s.emoji}`, "mk-pop", s.t0)),
  ...LUCES.map((l, k) => ef(`Ficha luz ${k + 1}`, "mk-pop", l.t0() + 0.05)),
];

export const TemaViajePro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / FPS;
  const lineas = clips.flatMap((c) => c.lineas);
  const titulo = clips.find((c) => c.pantalla && t >= c.inicio - 0.1 && t < c.fin + 0.4);
  const en3DLlanta = t >= L03a - 0.05 && t < T_LLANTA_REAL + 0.25;
  const en3DBateria = t >= L05a - 0.05 && t < L05b + 0.2;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Tomas tomas={TOMAS} t={t} />

      {/* Llanta 3D que entra girando y vuela hacia la cámara justo antes de la toma real */}
      {en3DLlanta ? (
        <AbsoluteFill style={{ opacity: 1 - rampa(t, T_LLANTA_REAL - 0.05, T_LLANTA_REAL + 0.2) }}>
          <Escena3D>
            <Llanta3D giro={(t - L03a) * 260} orbita={1.1 - 0.75 * resorte(t, L03a, 14)} x={0} y={0.6} escala={0.55 + 0.9 * rampa(t, T_LLANTA_REAL - 0.3, T_LLANTA_REAL + 0.2)} calor={0} />
          </Escena3D>
        </AbsoluteFill>
      ) : null}
      {/* Batería 3D con escarcha que gira y pierde carga */}
      {en3DBateria ? (
        <AbsoluteFill style={{ opacity: Math.min(resorte(t, L05a), 1 - rampa(t, L05b - 0.1, L05b + 0.15)) }}>
          <Escena3D acento="#7fd3ff">
            <Bateria3D giro={-0.7 + 0.9 * rampa(t, L05a, L05b)} x={0} y={0.45} escala={0.48 * resorte(t, L05a, 12)} carga={1 - 0.6 * rampa(t, T.tresAnos, L05b)} escarcha={1} />
          </Escena3D>
        </AbsoluteFill>
      ) : null}

      <Nieve t={t} fuerza={t >= L04 && t < L05b ? Math.min(rampa(t, L04, L04 + 0.3), 1 - rampa(t, L05b - 0.2, L05b)) : 0} />
      {t >= T.arranca && t < T.arranca + 0.5 ? <AbsoluteFill style={{ background: ROJO_DA, opacity: 0.35 * (1 - (t - T.arranca) / 0.5), mixBlendMode: "screen" }} /> : null}
      {relampago(t) > 0 ? <AbsoluteFill style={{ background: "#e8eeff", opacity: relampago(t) * 0.7 }} /> : null}
      <Destello t={t} cortes={CORTES} />
      <Legibilidad />

      {/* Etiquetas sobre las tomas, cada una en su palabra */}
      <Fichas t={t} />
      <EtiquetaSeccion t={t} secciones={SECCIONES} />
      <Senal t={t} t0={T.presion + 0.2} t1={T.dibujo} x={560} y={760} texto="35 PSI ✓" lado="der" alto={-170} />
      <Senal t={t} t0={T.dibujo} t1={c03b.inicio + 0.5} x={540} y={1010} texto="DIBUJO: 3 MM" lado="izq" alto={-120} />
      <Senal t={t} t0={T.lisas} t1={L03c} x={540} y={1010} texto="¿LISAS? ✗" lado="der" alto={-140} color="#b3121a" />
      <Senal t={t} t0={T.rechinan} t1={L04} x={540} y={720} texto="¿RECHINA O VIBRA?" lado="izq" alto={-230} />
      <Insignia t={t} t0={T.tresAnos} t1={L05b - 0.05} texto="+3 AÑOS = REVÍSALA" x={240} y={800} />
      <Senal t={t} t0={c05b.inicio + 0.2} t1={L05c} x={690} y={540} texto="🔋 BATERÍA DÉBIL" lado="izq" alto={140} color="#b3121a" />
      <Senal t={t} t0={T.aceite} t1={L06} x={760} y={430} texto="ACEITE ✓" lado="izq" alto={110} />
      <Senal t={t} t0={T.anti} t1={L06} x={900} y={760} texto="ANTICONGELANTE ✓" lado="izq" alto={-40} color="#16924f" />
      {LUCES.map((l, k) => (
        <ChipVidrio key={l.texto} t={t} t0={l.t0()} t1={L07c} texto={l.texto} x={70} y={440 + k * 88} tamano={36} />
      ))}
      <Senal t={t} t0={T.sinRayar} t1={L07d} x={420} y={760} texto="SIN RAYAR ✓" lado="der" alto={-200} color="#16924f" />
      <NumeroGrande t={t} t0={T.treinta - 0.05} t1={L08} numero="30" unidad="MINUTOS" arriba={440} />

      {titulo ? (
        <div style={{ position: "absolute", left: 50, right: 50, top: 724, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TituloMascara texto={titulo.pantalla ?? ""} resaltar={titulo.pantallaResaltar ?? []} t={t} t0={titulo.inicio + 0.12} t1={titulo.fin - 0.15} tamano={76} />
        </div>
      ) : null}
      {clips.filter((c) => c.aviso).map((c) => (
        <FranjaMascara key={c.id} texto={c.aviso ?? ""} t={t} t0={c.inicio + 0.6} t1={c.fin + 0.1} arriba={772} />
      ))}
      <Onomatopeya texto="¡PSSSH!" x={330} y={560} t={t} t0={0.15} vida={0.9} giro={-8} />
      <Onomatopeya texto="¡RIIICH!" x={760} y={470} t={t} t0={T.rechinan} vida={0.9} giro={7} />
      <Onomatopeya texto="RRR… ¡CLIC!" x={560} y={420} t={t} t0={c05b.inicio + 0.3} vida={0.9} giro={-5} />
      <Onomatopeya texto="¡SWISH!" x={700} y={460} t={t} t0={L07c + 0.35} vida={0.8} giro={6} />
      <BotonFinal t={t} t0={c08.inicio + 0.25} texto={c08.boton ?? "Comenta VIAJE 👇"} />
      <Rafaga x={540} y={796} t={t} t0={c08.inicio + 0.25} radio={320} color={ROJO_DA} lineas={16} />
      {STICKERS.map((s) => (
        <Sticker key={s.id} emoji={s.emoji} x={s.x} y={s.y} t={t} t0={s.t0} vida={s.vida} tamano={100} />
      ))}

      <MascotaVoz clips={clips} carpeta="audio/viaje" pausa={guion.pausaEntreClipsSegundos} bpm={guion.bpm ?? null} />
      <AcabadoPremium frame={frame} calidez={0.7} />
      <BarraProgreso />
      <Img src={staticFile("logo-doctor-auto.png")} alt="doctor auto" style={{ position: "absolute", left: 80, top: 308, height: 30, opacity: 0.6 }} />
      <SubtitulosDA lineas={lineas} desde={0} hasta={c08.inicio} arriba={885} alto={265} tamano={52} izquierda={70} derecha={520} sostenerFinal={false} />
      <SubtitulosDA lineas={lineas} desde={c08.inicio} hasta={Infinity} arriba={880} alto={80} tamano={46} izquierda={70} derecha={70} sostenerFinal />

      <Mezcla clips={clips} carpeta="audio/viaje" musica="real/musica-viaje.mp3" efectos={EFECTOS} total={durationInFrames / FPS} />
    </AbsoluteFill>
  );
};
