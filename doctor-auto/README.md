# Doctor Auto · Calaveritas del taller

Proyecto de Remotion con dos composiciones verticales (1080×1920, 30 fps):

- **Estructura8** (42 s, tema `dia-de-muertos`): 8 piezas (gancho, introducción,
  cuerpo 1, bucle, cuerpo 2, bucle, cuerpo 3, llamado a la acción). Todo el texto
  sale de `src/estructura8/guion.json`.
- **Calaveritas** (16 s): primera versión corta.

El video renderizado está en `Estructura8.mp4`.

## Uso

```bash
npm i
npm run dev                                         # abre Remotion Studio
npx remotion render Estructura8 out/Estructura8.mp4 # renderiza el video
```

## Cambiar el guion o la voz

1. Edita `src/estructura8/guion.json` o reemplaza `public/estructura8/voz.mp3`.
2. Vuelve a sincronizar: `node scripts/sincronizar.mjs`.
   Detecta los silencios de la voz con ffmpeg y elige el inicio de cada pieza;
   si no hay silencios suficientes, escala los tiempos del JSON. El resultado
   queda en `src/estructura8/sincronia.json`.
3. Las palabras se reparten de forma uniforme dentro de cada tramo con voz para
   el resaltado palabra por palabra.

Los efectos de sonido se generan con `sh scripts/sonidos.sh` (sin archivos externos).

## Zonas seguras

Textos y subtítulos entre el 31% y el 60% de la altura. El 15% superior y el
25% inferior quedan libres de texto para la interfaz de TikTok.
