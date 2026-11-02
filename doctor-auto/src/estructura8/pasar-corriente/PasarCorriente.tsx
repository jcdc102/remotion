// Tema "pasar-corriente": 8 piezas, 14 clips de voz separados. Un Sequence
// por clip con su <Audio> y toda su animación; cada animación empieza en el
// primer fotograma del clip y termina antes de que acabe.
import { Audio } from "@remotion/media";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, Track, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, FONDO, POPPINS, PESO_POPPINS, ROJO_DA } from "../../doctor-auto/constantes";
import { SubtitulosDA } from "../../doctor-auto/Texto";
import { Mascota, type Ancla } from "../Mascota";
import { sacudida, TarjetaLogo } from "../Piezas";
import { clip, clips, DURACION_VOZ, FPS, momentoEnClip, TARJETA, type Clip } from "./datos";
import { Diagrama, METAL_ABSOLUTO, type EstadoDiagrama } from "./Diagrama";
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

const Escena: React.FC<{ c: Clip }> = ({ c }) => {
  const frame = useCurrentFrame();
  const t = c.inicio + frame / FPS;
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
  return (
    <AbsoluteFill>
      {visual}
      {c.aviso ? <Franja texto={c.aviso} /> : null}
      {c.audioDisponible ? <Audio src={staticFile(`audio/${c.archivo}`)} volume={1} /> : null}
    </AbsoluteFill>
  );
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
const efecto = (nombre: string, archivo: string, t: number, dur: number, motivo: string): Efecto => ({ nombre, archivo, t, dur, motivo });
const D = { whoosh: 0.55, chispazo: 0.48, clac: 0.26, pop: 0.25, clic: 0.12, "tic-tac": 0.9, "motor-enciende": 1.8, "arranque-motor": 2, ding: 0.9 };
const EFECTOS: Efecto[] = [
  efecto("Whoosh gancho", "whoosh", c01.inicio + 0.3, D.whoosh, "0.3 s después del inicio del clip"),
  // Ligado a palabra: la chispa grande sale cuando se dice "chispas".
  efecto("Chispazo", "chispazo", T_CHISPA, D.chispazo, "palabra «chispas»"),
  // Ligado a la animación: un pop por cada número que aparece.
  ...T_NUMEROS.map((tn, k) => efecto(`Pop número ${k + 1}`, "pop", tn, D.pop, "aparición de cada número")),
  efecto("Clic llave", "clic", c03.inicio + 0.3, D.clic, "0.3 s después del inicio del clip"),
  efecto("Whoosh bucle", "whoosh", c04.inicio + 0.3, D.whoosh, "0.3 s después del inicio del clip"),
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
  efecto("Pop botón", "pop", c08.inicio + 0.3, D.pop, "0.3 s después del inicio del clip"),
];
// Corte seco + whoosh al empezar cada pieza (CLAUDE.md), salvo donde el clip ya tiene whoosh.
const WHOOSH_CORTE = guion.piezas
  .slice(1)
  .map((p) => clip(p.clips[0].id))
  .filter((c) => !c.sfx.startsWith("whoosh"))
  .map((c) => efecto(`Whoosh corte ${c.id}`, "whoosh", c.inicio, D.whoosh, "corte de pieza"));

const vozActiva = (t: number) => clips.some((c) => t >= c.voz[0] && t <= c.voz[1]);
// Efectos a 0.3; bajan a 0.15 mientras suena la voz.
const volumenEfecto = (inicio: number) => (f: number) => (vozActiva(inicio + f / FPS) ? 0.15 : 0.3);

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
  const lineas = clips.flatMap((c) => c.lineas);
  // La chispa corta de c05d suena junto con su clac, en otra pista para no encimarse.
  const chispaCorta = efecto("Chispa corta", "chispazo", T_CIERRE[3], D.chispazo, "palabra «metal»");
  return (
    <AbsoluteFill style={{ background: FONDO }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
      <Track name="Clips">
        {clips.map((c, k) => (
          <Sequence key={c.id} name={`${c.id} · ${c.tipo}`} from={desde(c.inicio)} durationInFrames={desde((clips[k + 1]?.inicio ?? DURACION_VOZ) - c.inicio)}>
            <Escena c={c} />
          </Sequence>
        ))}
      </Track>

      <MascotaAnimada />
      <BarraProgreso />
      <Img src={staticFile("logo-doctor-auto.png")} alt={guion.marcaDeAgua} style={{ position: "absolute", left: 80, top: 308, height: 30, opacity: 0.55 }} />

      {/* Subtítulos: columna izquierda (46%–60%); en el CTA, centrados (40%–47%) y el último se queda. */}
      <SubtitulosDA lineas={lineas} desde={0} hasta={c08.inicio} arriba={885} alto={265} tamano={52} izquierda={70} derecha={520} sostenerFinal={false} />
      <SubtitulosDA lineas={lineas} desde={c08.inicio} hasta={Infinity} arriba={790} alto={130} tamano={48} izquierda={70} derecha={70} sostenerFinal />

      {TARJETA > 0 ? (
        <Sequence name="Tarjeta logo" from={desde(DURACION_VOZ)} durationInFrames={desde(TARJETA)}>
          <TarjetaLogo />
        </Sequence>
      ) : null}

      <PistaEfectos nombre="Efectos" lista={EFECTOS} />
      <PistaEfectos nombre="Efectos 2" lista={[chispaCorta]} />
      <PistaEfectos nombre="Whoosh de corte" lista={WHOOSH_CORTE} />
    </AbsoluteFill>
  );
};
