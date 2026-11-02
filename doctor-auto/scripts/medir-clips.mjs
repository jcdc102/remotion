// Mide cada clip de voz (public/audio/<archivo>) con ffprobe y detecta el
// silencio al inicio y al final con silencedetect. Escribe
// src/estructura8/pasar-corriente/duraciones.json.
// Si falta un archivo, estima su duración por número de palabras y lo marca
// como "estimado" (el video no incluye ese audio hasta que exista).
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const carpeta = "src/estructura8/pasar-corriente";
const guion = JSON.parse(readFileSync(`${carpeta}/guion.json`, "utf8"));
const clips = guion.piezas.flatMap((p) => p.clips);
const resultado = { pausaEntreClipsSegundos: guion.pausaEntreClipsSegundos, clips: {} };

for (const c of clips) {
  const ruta = `public/audio/${c.archivo}`;
  if (!existsSync(ruta)) {
    const palabras = c.texto.split(/\s+/).length;
    const duracion = Number((0.35 + palabras * 0.36).toFixed(3));
    resultado.clips[c.id] = { duracion, inicioVoz: 0.1, finVoz: Number((duracion - 0.1).toFixed(3)), tramos: [[0.1, Number((duracion - 0.1).toFixed(3))]], estimado: true };
    continue;
  }
  const duracion = Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", ruta]).toString(),
  );
  const log = execFileSync("sh", ["-c", `ffmpeg -nostdin -i "${ruta}" -af silencedetect=n=-38dB:d=0.08 -f null - 2>&1`]).toString();
  const inicios = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const fines = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  // Silencio al inicio: uno que empieza en 0. Al final: uno que llega al final
  // del archivo (el codificador MP3 agrega ~0.04 s de relleno, por eso la tolerancia).
  // Se usa el borde real del silencio para que las palabras caigan con la voz.
  let inicioVoz = 0;
  let finVoz = duracion;
  inicios.forEach((s, i) => {
    const e = fines[i] ?? duracion;
    if (s < 0.02) inicioVoz = e;
    if (e >= duracion - 0.08) finVoz = s;
  });
  // Tramos con voz dentro del clip (pausas internas de al menos 0.25 s).
  const tramos = [];
  let cursor = inicioVoz;
  inicios.forEach((s, i) => {
    const e = fines[i] ?? duracion;
    if (s > inicioVoz + 0.01 && e < finVoz - 0.01 && e - s >= 0.25) {
      tramos.push([Number(cursor.toFixed(3)), Number(s.toFixed(3))]);
      cursor = e;
    }
  });
  tramos.push([Number(cursor.toFixed(3)), Number(finVoz.toFixed(3))]);
  resultado.clips[c.id] = {
    duracion: Number(duracion.toFixed(3)),
    inicioVoz: Number(inicioVoz.toFixed(3)),
    finVoz: Number(finVoz.toFixed(3)),
    tramos,
    estimado: false,
  };
}

const ids = Object.keys(resultado.clips);
const total = ids.reduce((a, id) => a + resultado.clips[id].duracion, 0) + resultado.pausaEntreClipsSegundos * (ids.length - 1);
resultado.totalSegundos = Number(total.toFixed(3));
writeFileSync(`${carpeta}/duraciones.json`, JSON.stringify(resultado, null, 2) + "\n");
const faltan = ids.filter((id) => resultado.clips[id].estimado);
console.log(`Total: ${total.toFixed(2)} s (${Math.ceil(total * guion.fps)} fotogramas)`);
if (faltan.length) console.log(`FALTAN (duración estimada): ${faltan.join(", ")}`);
