# Doctor Auto · Calaveritas del taller

Proyecto de Remotion con dos composiciones verticales (1080×1920, 30 fps):

- **Estructura8** (42 s): 8 piezas (gancho, introducción, cuerpo 1, bucle,
  cuerpo 2, bucle, cuerpo 3, llamado a la acción). El prop `tema` elige el guion:
  - `bateria`: `src/estructura8/bateria/guion.json`, voz en
    `public/estructura8/bateria/voz.mp3`, mascota en `public/estructura8/bateria/`.
  - `dia-de-muertos`: `src/estructura8/guion.json`, voz en `public/estructura8/voz.mp3`.
  - `alineacion` (40 s): `src/estructura8/alineacion/guion.json`, voz en
    `public/estructura8/alineacion/voz.mp3`. Sin tarjeta final de logo
    (`tarjetaFinal: false`): termina con la pieza 8 y un fundido de 5 fotogramas;
    la marca de agua queda visible todo el video.
  - `pasar-corriente` (por defecto): `src/estructura8/pasar-corriente/guion.json`, con un
    clip de voz por línea en `public/audio/` (c01.mp3 … c08.mp3). La duración es la suma
    de los clips más 0.4 s entre cada uno (`duraciones.json`).

Reglas de marca para todos los videos: `CLAUDE.md`. Colores y fuentes: `src/doctor-auto/constantes.ts`.
- **Calaveritas** (16 s): primera versión corta.

Videos renderizados: `Estructura8-pasar-corriente.mp4`, `Estructura8-alineacion.mp4`, `Estructura8-bateria.mp4` y
`Estructura8.mp4` (Día de Muertos).

## Uso

```bash
npm i
npm run dev                                         # abre Remotion Studio
npx remotion render Estructura8 out/bateria.mp4 --props='{"tema":"bateria"}'
npx remotion render Estructura8 out/muertos.mp4 --props='{"tema":"dia-de-muertos"}'
```

## Cambiar el guion o la voz

1. Edita `src/estructura8/guion.json` o reemplaza `public/estructura8/voz.mp3`.
2. Vuelve a sincronizar: `node scripts/sincronizar.mjs <tema>` (`bateria`, `alineacion`,
   o sin argumento para `dia-de-muertos`). Si la voz de una pieza dura más que su
   ventana en el guion, el script lo avisa (no acelera la voz).
   Detecta los silencios de la voz con ffmpeg y elige el inicio de cada pieza;
   si no hay silencios suficientes, escala los tiempos del JSON. El resultado
   queda en `src/estructura8/sincronia.json`.
3. Las palabras se reparten de forma uniforme dentro de cada tramo con voz para
   el resaltado palabra por palabra.

## Voz por clips (tema pasar-corriente)

1. Si llega una sola toma, `sh scripts/cortar-voz.sh` la corta en los 14 clips (a la mitad de cada pausa).
2. `node scripts/medir-clips.mjs` mide cada clip con ffprobe y silencedetect y escribe `duraciones.json`.
3. Renderiza y limita los picos a -1.5 dB sin bajar la voz:
   `sh scripts/limitar-picos.sh out/video.mp4 out/video-final.mp4`.

Efectos de este tema: `sh scripts/sfx-pasar-corriente.sh` (en `public/sfx/`).

## Mascota (tema bateria)

`public/estructura8/bateria/mascota.png` es la imagen original con fondo verde.
Para quitar el fondo:

```bash
python3 scripts/quitar-fondo.py public/estructura8/bateria/mascota.png public/estructura8/bateria/mascota-transparente.png
```

El script toma el verde de los bordes y vuelve transparente todo lo que es
dominantemente verde (los grises, blancos y rojos del personaje quedan opacos),
quita el reflejo verde del contorno e informa cuántos píxeles verdes quedan (debe ser 0).
El campo `mascota.pose` del guion elige la imagen (`POSES` en `src/estructura8/Mascota.tsx`);
por ahora solo existe `pulgar`.

Los efectos de sonido se generan con `sh scripts/sonidos.sh` (sin archivos externos).

## Zonas seguras

Textos y subtítulos entre el 31% y el 60% de la altura. El 15% superior y el
25% inferior quedan libres de texto para la interfaz de TikTok.
