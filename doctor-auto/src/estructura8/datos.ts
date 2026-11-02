// Todo el texto del video viene de guion.json; los tiempos, de sincronia.json
// (generado por scripts/sincronizar.mjs a partir de los silencios de voz.mp3).
import guion from "./guion.json";
import sincronia from "./sincronia.json";

export type TipoPieza = "gancho" | "introduccion" | "cuerpo" | "bucle" | "cta";

type PiezaGuion = {
  id: number;
  tipo: TipoPieza;
  inicio: number;
  fin: number;
  texto: string;
  resaltar: string[];
  pantalla?: string;
  lapidas?: string[];
  icono?: string;
  aviso?: string;
  boton?: string;
  chips?: string[];
  mascota?: { pose: string; animacion: string; globo?: string };
};

export type Guion = {
  titulo: string;
  tema: string;
  duracionSegundos: number;
  fps: number;
  piezas: unknown[];
};
type Sincronia = { duracionAudio: number; piezas: { id: number; inicio: number; fin: number; habla: number[][] }[] };

export type Palabra = {
  texto: string;
  inicio: number;
  fin: number;
  resaltada: boolean;
};

export type Linea = {
  palabras: Palabra[];
  inicio: number;
  fin: number;
};

export type Pieza = PiezaGuion & {
  habla: number[][];
  palabras: Palabra[];
  lineas: Linea[];
};

export const FPS = guion.fps;
export const DURACION = guion.duracionSegundos;

export const normalizar = (s: string) =>
  s.toLocaleLowerCase("es").replace(/[^\p{L}\p{N}]/gu, "");

export const esResaltada = (palabra: string, resaltar: string[]) =>
  resaltar.some((r) => normalizar(r) === normalizar(palabra));

// Asigna las palabras a los tramos con voz (entre pausas) buscando que cada
// tramo tenga una velocidad de habla parecida y que los cortes caigan en la
// puntuación. Dentro de cada tramo reparte las palabras de forma uniforme.
export const repartirEnTramos = (p: { texto: string; resaltar: string[]; inicio: number; fin: number }, habla: number[][]): Palabra[] => {
  const palabras = p.texto.split(/\s+/).filter(Boolean);
  const pesos = palabras.map((w) => normalizar(w).length + 1);
  const tramos = habla.length > 0 && habla.length <= palabras.length ? habla : [[p.inicio, p.fin]];
  const n = palabras.length;
  const m = tramos.length;
  const acum = [0];
  for (const w of pesos) acum.push(acum[acum.length - 1] + w);
  const totalVoz = tramos.reduce((x, [a, b]) => x + (b - a), 0);
  const media = acum[n] / totalVoz;
  const costo = (j: number, a: number, b: number) => {
    const ritmo = (acum[b] - acum[a]) / (tramos[j][1] - tramos[j][0]);
    const puntuacion = b < n && /[,.;:?!…]$/.test(palabras[b - 1]) ? -0.3 : 0;
    return Math.log(ritmo / media) ** 2 + puntuacion;
  };
  // dp[j][b]: mejor costo usando los primeros j tramos para las primeras b palabras.
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(Infinity));
  const previo = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(-1));
  dp[0][0] = 0;
  for (let j = 1; j <= m; j++) {
    for (let b = j; b <= n; b++) {
      for (let a = j - 1; a < b; a++) {
        const c = dp[j - 1][a] + costo(j - 1, a, b);
        if (c < dp[j][b]) {
          dp[j][b] = c;
          previo[j][b] = a;
        }
      }
    }
  }
  const cortes = [n];
  for (let j = m, b = n; j > 0; j--) {
    b = previo[j][b];
    cortes.unshift(b);
  }
  const resultado: Palabra[] = [];
  for (let j = 0; j < m; j++) {
    const [x, y] = tramos[j];
    const a = cortes[j];
    const b = cortes[j + 1];
    const peso = acum[b] - acum[a];
    for (let k = a; k < b; k++) {
      resultado.push({
        texto: palabras[k],
        inicio: x + ((acum[k] - acum[a]) / peso) * (y - x),
        fin: x + ((acum[k + 1] - acum[a]) / peso) * (y - x),
        resaltada: esResaltada(palabras[k], p.resaltar),
      });
    }
  }
  return resultado;
};

// Líneas de 3 a 7 palabras, cortando en la puntuación cuando se puede.
export const agrupar = (palabras: Palabra[]): Palabra[][] => {
  const frases: Palabra[][] = [];
  let actual: Palabra[] = [];
  for (const w of palabras) {
    actual.push(w);
    if (/[,.;:?!…]$/.test(w.texto)) {
      frases.push(actual);
      actual = [];
    }
  }
  if (actual.length > 0) frases.push(actual);

  const partidas: Palabra[][] = [];
  for (const f of frases) {
    if (f.length <= 7) {
      partidas.push(f);
    } else {
      const mitad = Math.ceil(f.length / 2);
      partidas.push(f.slice(0, mitad), f.slice(mitad));
    }
  }

  const lineas: Palabra[][] = [];
  for (let i = 0; i < partidas.length; i++) {
    const f = partidas[i];
    if (f.length >= 3) {
      lineas.push(f);
      continue;
    }
    const siguiente = partidas[i + 1];
    if (siguiente && f.length + siguiente.length <= 7) {
      partidas[i + 1] = [...f, ...siguiente];
    } else if (lineas.length > 0 && lineas[lineas.length - 1].length + f.length <= 7) {
      lineas[lineas.length - 1] = [...lineas[lineas.length - 1], ...f];
    } else {
      lineas.push(f);
    }
  }
  return lineas;
};

// Marca como resaltadas las palabras (o frases de varias palabras) de "resaltar".
export const marcarFrases = (palabras: Palabra[], resaltar: string[]) => {
  for (const frase of resaltar) {
    const partes = frase.split(/\s+/).map(normalizar).filter(Boolean);
    if (partes.length < 2) continue;
    for (let i = 0; i + partes.length <= palabras.length; i++) {
      if (partes.every((x, k) => normalizar(palabras[i + k].texto) === x)) {
        for (let k = 0; k < partes.length; k++) palabras[i + k].resaltada = true;
      }
    }
  }
  return palabras;
};

export const construirPiezas = (g: Guion, s: Sincronia): Pieza[] =>
  (g.piezas as PiezaGuion[]).map((p, i) => {
    const sinc = s.piezas[i];
    const conTiempos = { ...p, inicio: sinc.inicio, fin: sinc.fin };
    const palabras = marcarFrases(repartirEnTramos(conTiempos, sinc.habla), p.resaltar);
    const lineas = agrupar(palabras).map((ws) => ({
      palabras: ws,
      inicio: ws[0].inicio,
      fin: ws[ws.length - 1].fin,
    }));
    return { ...conTiempos, habla: sinc.habla, palabras, lineas };
  });

export const porTipo = (lista: Pieza[], tipo: TipoPieza, n = 0) =>
  lista.filter((p) => p.tipo === tipo)[n];

export const piezas: Pieza[] = construirPiezas(guion, sincronia);

export const piezaPorTipo = (tipo: TipoPieza, n = 0) =>
  piezas.filter((p) => p.tipo === tipo)[n];

// Momento en que se dice una palabra o frase de "resaltar" dentro de una pieza.
export const momentoDe = (p: Pieza, frase: string) => {
  const partes = frase.split(/\s+/).map(normalizar).filter(Boolean);
  for (let i = 0; i + partes.length <= p.palabras.length; i++) {
    if (partes.every((x, k) => normalizar(p.palabras[i + k].texto) === x)) return p.palabras[i].inicio;
  }
  return p.inicio;
};

// Inicio del último tramo con voz de la pieza (donde se dice el "aviso").
export const inicioUltimoTramo = (p: Pieza) =>
  p.habla.length > 0 ? p.habla[p.habla.length - 1][0] : p.inicio;
export const inicioSegundoTramo = (p: Pieza) =>
  p.habla.length > 1 ? p.habla[1][0] : p.inicio;
