// Línea de tiempo por clips de voz (motor común para los videos de Doctor Auto).
// Cada clip empieza cuando termina el anterior más la pausa. Si un clip trae
// "ruidoAntesDeLaVoz", su voz espera a que termine el ruido de la falla.
import { agrupar, marcarFrases, normalizar, repartirEnTramos, type Linea, type Palabra } from "../estructura8/datos";

export type MascotaClip = { pose: string; animacion: string; globo?: string };
export type ClipGuion = {
  id: string;
  archivo: string;
  texto: string;
  resaltar: string[];
  visual?: string;
  pantalla?: string;
  pantallaResaltar?: string[];
  aviso?: string;
  boton?: string;
  chips?: string[];
  ruido?: string;
  ruidoAntesDeLaVoz?: boolean;
  ruidoSegundos?: number; // duración del ruido antes de la voz (si falta, la del tema)
  sfx: string;
  mascota: MascotaClip;
};
export type GuionClips = {
  fps: number;
  bpm?: number;
  tarjetaFinal: boolean;
  marcaDeAgua: string;
  pausaEntreClipsSegundos: number;
  piezas: { id: number; tipo: string; clips: ClipGuion[] }[];
};
type Duraciones = {
  clips: Record<string, { duracion: number; inicioVoz: number; finVoz: number; tramos: number[][]; estimado: boolean }>;
  musica?: boolean;
};

export type Clip = ClipGuion & {
  pieza: number;
  tipo: string;
  inicio: number; // s en el video (incluye el ruido previo, si lo hay)
  inicioAudio: number; // s en que empieza el MP3 de la voz
  duracion: number;
  duracionAudio: number;
  fin: number;
  voz: [number, number];
  audioDisponible: boolean;
  palabras: Palabra[];
  lineas: Linea[];
};

export const construirClips = (g: GuionClips, d: Duraciones, duracionRuidoPrevio: number) => {
  let cursor = 0;
  const clips: Clip[] = g.piezas.flatMap((p) =>
    p.clips.map((c) => {
      const m = d.clips[c.id];
      const adelanto = c.ruidoAntesDeLaVoz ? (c.ruidoSegundos ?? duracionRuidoPrevio) : 0;
      const inicio = cursor;
      const inicioAudio = inicio + adelanto;
      const duracion = adelanto + m.duracion;
      cursor += duracion + g.pausaEntreClipsSegundos;
      const voz: [number, number] = [inicioAudio + m.inicioVoz, inicioAudio + m.finVoz];
      const tramos = m.tramos.map(([a, b]) => [inicioAudio + a, inicioAudio + b]);
      const palabras = marcarFrases(repartirEnTramos({ ...c, inicio: voz[0], fin: voz[1] }, tramos), c.resaltar);
      const lineas = agrupar(palabras).map((ws) => ({ palabras: ws, inicio: ws[0].inicio, fin: ws[ws.length - 1].fin }));
      return {
        ...c,
        pieza: p.id,
        tipo: p.tipo,
        inicio,
        inicioAudio,
        duracion,
        duracionAudio: m.duracion,
        fin: inicio + duracion,
        voz,
        audioDisponible: !m.estimado,
        palabras,
        lineas,
      };
    }),
  );
  const duracionVoz = clips[clips.length - 1].fin;
  return { clips, duracionVoz, duracionTotal: duracionVoz + (g.tarjetaFinal ? 2 : 0), hayMusica: d.musica === true };
};

// Momento (s en el video) en que se dice una palabra o frase del clip.
export const momentoEnClip = (c: Clip, frase: string) => {
  const partes = frase.split(/\s+/).map(normalizar).filter(Boolean);
  for (let i = 0; i + partes.length <= c.palabras.length; i++) {
    if (partes.every((x, k) => normalizar(c.palabras[i + k].texto) === x)) return c.palabras[i].inicio;
  }
  return c.inicioAudio + 0.3;
};
