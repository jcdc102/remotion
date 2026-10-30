// Sincroniza las 8 piezas de guion.json con voz.mp3 sin reconocimiento de voz:
// 1) mide la duración con ffprobe; 2) detecta silencios con silencedetect;
// 3) si hay silencios suficientes, elige los 7 cortes que mejor coinciden con
//    la proporción de texto de cada pieza; si no, escala los tiempos del JSON.
// Escribe src/estructura8/sincronia.json con el inicio/fin de cada pieza y
// los tramos con voz dentro de ella (para repartir las palabras).
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const audio = "public/estructura8/voz.mp3";
const guion = JSON.parse(readFileSync("src/estructura8/guion.json", "utf8"));
const piezas = guion.piezas;

const duracion = Number(
  execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audio]).toString(),
);
const err = execFileSync("sh", ["-c", `ffmpeg -nostdin -i ${audio} -af silencedetect=n=-38dB:d=0.25 -f null - 2>&1`]).toString();
const inicios = [...err.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
const fines = [...err.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
const silencios = inicios.map((s, i) => ({ s, e: fines[i] ?? duracion }));

// Tramos con voz = complemento de los silencios.
const habla = [];
let cursor = 0;
for (const { s, e } of silencios) {
  if (s - cursor > 0.05) habla.push([cursor, s]);
  cursor = e;
}
if (duracion - cursor > 0.05) habla.push([cursor, duracion]);

// Cada pieza debe tener una velocidad de habla (letras por segundo hablado)
// parecida a la media. Se eligen los 7 silencios que minimizan la desviación
// de esas velocidades; así las pausas dramáticas no desplazan el reparto.
const letras = piezas.map((p) => p.texto.replace(/[^\p{L}\p{N}]/gu, "").length);
const habladoAntes = (t) => habla.reduce((a, [x, y]) => a + Math.max(0, Math.min(y, t) - x), 0);
const hablado = habladoAntes(duracion);
const media = letras.reduce((a, b) => a + b, 0) / hablado;
const internos = silencios.filter((x) => x.e < duracion);
// Puntos de corte posibles: inicio, cada silencio interno y final.
const puntos = [0, ...internos.map((x) => habladoAntes(x.s)), hablado];
const centros = [0, ...internos.map((x) => (x.s + x.e) / 2), duracion];

let cortes;
const n = piezas.length;
if (internos.length >= n - 1) {
  const costoPieza = (i, a, b) => {
    const t = puntos[b] - puntos[a];
    return t <= 0 ? Infinity : Math.log(letras[i] / t / media) ** 2;
  };
  const m = puntos.length - 1;
  const costo = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(Infinity));
  const previo = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(-1));
  costo[0][0] = 0;
  for (let i = 1; i <= n; i++) {
    for (let b = i; b <= m; b++) {
      for (let a = i - 1; a < b; a++) {
        const c = costo[i - 1][a] + costoPieza(i - 1, a, b);
        if (c < costo[i][b]) { costo[i][b] = c; previo[i][b] = a; }
      }
    }
  }
  const indices = [];
  for (let i = n, b = m; i > 0; i--) { b = previo[i][b]; indices.unshift(b); }
  cortes = indices.slice(1).map((k) => centros[k]);
  console.log("Modo: silencios");
} else {
  const escala = duracion / guion.duracionSegundos;
  cortes = piezas.slice(1).map((p) => p.inicio * escala);
  console.log("Modo: escala proporcional");
}

const limites = [0, ...cortes, guion.duracionSegundos];
const resultado = {
  duracionAudio: Number(duracion.toFixed(3)),
  piezas: piezas.map((p, i) => {
    const inicio = limites[i];
    const fin = limites[i + 1];
    const tramos = habla
      .map(([a, b]) => [Math.max(a, inicio), Math.min(b, fin)])
      .filter(([a, b]) => b - a > 0.05)
      .map(([a, b]) => [Number(a.toFixed(3)), Number(b.toFixed(3))]);
    return { id: p.id, inicio: Number(inicio.toFixed(3)), fin: Number(fin.toFixed(3)), habla: tramos };
  }),
};
writeFileSync("src/estructura8/sincronia.json", JSON.stringify(resultado, null, 2) + "\n");
for (const p of resultado.piezas) console.log(p.id, p.inicio, "→", p.fin, JSON.stringify(p.habla));
