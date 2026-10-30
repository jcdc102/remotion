# Doctor Auto · Calaveritas del taller

Proyecto de Remotion con dos composiciones verticales (1080×1920, 30 fps):

- **Estructura8** (42 s): 8 piezas (gancho, introducción, cuerpo 1, bucle,
  cuerpo 2, bucle, cuerpo 3, llamado a la acción). El prop `tema` elige el guion:
  - `bateria` (por defecto): `src/estructura8/bateria/guion.json`, voz en
    `public/estructura8/bateria/voz.mp3`, mascota en `public/estructura8/bateria/`.
  - `dia-de-muertos`: `src/estructura8/guion.json`, voz en `public/estructura8/voz.mp3`.
- **Calaveritas** (16 s): primera versión corta.

Videos renderizados: `Estructura8-bateria.mp4` y `Estructura8.mp4` (Día de Muertos).

## Uso

```bash
npm i
npm run dev                                         # abre Remotion Studio
npx remotion render Estructura8 out/bateria.mp4 --props='{"tema":"bateria"}'
npx remotion render Estructura8 out/muertos.mp4 --props='{"tema":"dia-de-muertos"}'
```

## Cambiar el guion o la voz

1. Edita `src/estructura8/guion.json` o reemplaza `public/estructura8/voz.mp3`.
2. Vuelve a sincronizar: `node scripts/sincronizar.mjs bateria` (o sin argumento para `dia-de-muertos`).
   Detecta los silencios de la voz con ffmpeg y elige el inicio de cada pieza;
   si no hay silencios suficientes, escala los tiempos del JSON. El resultado
   queda en `src/estructura8/sincronia.json`.
3. Las palabras se reparten de forma uniforme dentro de cada tramo con voz para
   el resaltado palabra por palabra.

## Mascota (tema bateria)

`public/estructura8/bateria/mascota.png` es la imagen original con fondo verde.
**Por ahora es una mascota provisional**: reemplázala por la imagen real y
vuelve a quitar el fondo y a renderizar. Para quitar el fondo:

```bash
python3 scripts/quitar-fondo.py public/estructura8/bateria/mascota.png public/estructura8/bateria/mascota-transparente.png
```

El script toma el verde de los bordes, lo vuelve transparente, quita el reflejo
verde del contorno e informa cuántos píxeles verdes quedan (debe ser 0).
El campo `mascota.pose` del guion elige la imagen (`POSES` en `src/estructura8/Mascota.tsx`);
por ahora solo existe `pulgar`.

Los efectos de sonido se generan con `sh scripts/sonidos.sh` (sin archivos externos).

## Zonas seguras

Textos y subtítulos entre el 31% y el 60% de la altura. El 15% superior y el
25% inferior quedan libres de texto para la interfaz de TikTok.
