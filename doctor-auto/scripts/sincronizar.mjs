// Sincroniza las 8 piezas de guion.json con voz.mp3 sin reconocimiento de voz:
// 1) mide la duración con ffprobe; 2) detecta silencios con silencedetect;
// 3) si hay silencios suficientes, elige los 7 cortes que mejor coinciden con
//    la proporción de texto de cada pieza; si no, escala los tiempos del JSON.
// Escribe src/estructura8/sincronia.json con el inicio/fin de cada pieza y
// los tramos con voz dentro de ella (para repartir las palabras).
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

// Uso: node scripts/sincronizar.mjs [tema]   (tema: dia-de-muertos | bateria)
const tema = process.argv[2] ?? "dia-de-muertos";
const carpeta = tema === "dia-de-muertos" ? "" : `${tema}/`;
const audio = `public/estructura8/${carpeta}voz.mp3`;
const salida = `src/estructura8/${carpeta}sincronia.json`;
const guion = JSON.parse(readFileSync(`src/estructura8/${carpeta}guion.json`, "utf8"));
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

// Asignación global: cada tramo con voz recibe palabras completas y seguidas
// del guion, buscando que todos los tramos tengan una velocidad parecida
// (sílabas por segundo). Una pieza solo puede empezar al inicio de un tramo.
const silabas = (w) => Math.max(1, (w.toLocaleLowerCase("es").match(/[aeiouáéíóúü]+/g) ?? []).length);
const palabras = piezas.flatMap((p, k) =>
  p.texto.split(/\s+/).filter(Boolean).map((w, i) => ({ w, pieza: k, primera: i === 0 })),
);
const n = palabras.length;
const m = habla.length;
const acum = [0];
for (const x of palabras) acum.push(acum[acum.length - 1] + silabas(x.w));
const hablado = habla.reduce((a, [x, y]) => a + (y - x), 0);
const media = acum[n] / hablado;
// Índices de palabra donde empieza cada pieza (menos la primera).
const iniciosPieza = new Set(palabras.map((x, i) => (x.primera && i > 0 ? i : -1)).filter((i) => i > 0));
const cruzaPieza = (a, b) => {
  for (let i = a + 1; i < b; i++) if (iniciosPieza.has(i)) return true;
  return false;
};

let cortes;
let tramoDePieza = null;
if (m <= n) {
  const costo = (j, a, b) => {
    if (cruzaPieza(a, b)) return Infinity;
    const ritmo = (acum[b] - acum[a]) / (habla[j][1] - habla[j][0]);
    const puntuacion = /[,.;:?!…]$/.test(palabras[b - 1].w) ? -0.2 : 0;
    return Math.log(ritmo / media) ** 2 + puntuacion;
  };
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(Infinity));
  const previo = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(-1));
  dp[0][0] = 0;
  for (let j = 1; j <= m; j++) {
    for (let b = j; b <= n; b++) {
      for (let a = j - 1; a < b; a++) {
        const c = dp[j - 1][a] + costo(j - 1, a, b);
        if (c < dp[j][b]) { dp[j][b] = c; previo[j][b] = a; }
      }
    }
  }
  if (Number.isFinite(dp[m][n])) {
    const limitesPalabra = [n];
    for (let j = m, b = n; j > 0; j--) { b = previo[j][b]; limitesPalabra.unshift(b); }
    // Tramo en el que empieza cada pieza.
    tramoDePieza = piezas.map((_, k) => limitesPalabra.findIndex((w) => w < n && palabras[w].pieza === k));
  }
}
if (tramoDePieza && tramoDePieza.every((j) => j >= 0)) {
  cortes = tramoDePieza.slice(1).map((j) => {
    const anterior = silencios.find((x) => Math.abs(x.e - habla[j][0]) < 1e-6);
    return anterior ? (anterior.s + anterior.e) / 2 : habla[j][0];
  });
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
writeFileSync(salida, JSON.stringify(resultado, null, 2) + "\n");
for (const p of resultado.piezas) console.log(p.id, p.inicio, "→", p.fin, JSON.stringify(p.habla));
