// Línea de tiempo del tema "pasar-corriente": un Sequence por clip de voz.
// Cada clip empieza cuando termina el anterior más la pausa entre clips.
import { agrupar, marcarFrases, normalizar, repartirEnTramos, type Linea, type Palabra } from "../datos";
import duraciones from "./duraciones.json";
import guion from "./guion.json";

export type MascotaClip = { pose: string; animacion: string; globo?: string };
export type ClipGuion = {
  id: string;
  archivo: string;
  texto: string;
  resaltar: string[];
  visual?: string;
  aviso?: string;
  boton?: string;
  sfx: string;
  mascota: MascotaClip;
};

export type Clip = ClipGuion & {
  // (palabras con tiempos absolutos en segundos)
  pieza: number;
  tipo: string;
  inicio: number; // segundos en el video
  duracion: number;
  fin: number;
  voz: [number, number]; // tramo con voz, en segundos del video
  audioDisponible: boolean;
  palabras: Palabra[];
  lineas: Linea[];
};

export const FPS = guion.fps;
export const PAUSA = guion.pausaEntreClipsSegundos;
export const TARJETA = guion.tarjetaFinal ? 2 : 0;
const tabla = duraciones.clips as Record<string, { duracion: number; inicioVoz: number; finVoz: number; tramos: number[][]; estimado: boolean }>;

let cursor = 0;
export const clips: Clip[] = guion.piezas.flatMap((p) =>
  (p.clips as ClipGuion[]).map((c) => {
    const d = tabla[c.id];
    const inicio = cursor;
    cursor += d.duracion + PAUSA;
    const voz: [number, number] = [inicio + d.inicioVoz, inicio + d.finVoz];
    // Palabras repartidas de forma uniforme dentro de los tramos con voz del clip
    // (sin los silencios del inicio y del final, ni las pausas internas).
    const tramos = d.tramos.map(([a, b]) => [inicio + a, inicio + b]);
    const palabras = marcarFrases(repartirEnTramos({ ...c, inicio: voz[0], fin: voz[1] }, tramos), c.resaltar);
    const lineas = agrupar(palabras).map((ws) => ({ palabras: ws, inicio: ws[0].inicio, fin: ws[ws.length - 1].fin }));
    return {
      ...c,
      pieza: p.id,
      tipo: p.tipo,
      inicio,
      duracion: d.duracion,
      fin: inicio + d.duracion,
      voz,
      audioDisponible: !d.estimado,
      palabras,
      lineas,
    };
  }),
);

// Duración del video: suma de los clips más las pausas entre ellos (+ tarjeta si aplica).
export const DURACION_VOZ = clips[clips.length - 1].fin;
export const DURACION_PASAR_CORRIENTE = DURACION_VOZ + TARJETA;
export const clip = (id: string) => clips.find((c) => c.id === id) as Clip;

// Momento (s en el video) en que se dice una palabra o frase del clip.
export const momentoEnClip = (c: Clip, frase: string) => {
  const partes = frase.split(/\s+/).map(normalizar).filter(Boolean);
  for (let i = 0; i + partes.length <= c.palabras.length; i++) {
    if (partes.every((x, k) => normalizar(c.palabras[i + k].texto) === x)) return c.palabras[i].inicio;
  }
  return c.inicio + 0.3;
};
