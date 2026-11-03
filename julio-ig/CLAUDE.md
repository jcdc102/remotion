# Videos de Instagram de Julio (@julio.chaidez1)

## Reglas para todos los videos
- Vertical 1080x1920, 30 fps. Español de México, tuteando.
- **Siempre con música de fondo** (instrumental, generada con vidIQ `vidiq_generate_music`), debajo de la voz:
  volumen 0.14, entrada de 0.5 s y salida de 1.5 s.
- **Siempre con efectos de sonido** (`sh scripts/sonidos.sh` los genera en `public/sfx/`), uno por animación:
  whoosh en cada cambio de escena, pop en números y pines, ding cuando algo sale bien, etc.
- Voz: el clon «Julio» de ElevenLabs. Las escenas se alinean con las pausas de la voz (ffmpeg silencedetect).
- Al final, limitar picos a -1.5 dB: `alimiter=limit=0.84`.
- Colores de atardecer (noche #0E1B2E, morado #3A1F4A, coral #FF6B5B, naranja #FFA552, crema #FFF4E6),
  títulos en Playfair Display y texto en Poppins. Arriba: barra de progreso y «@julio.chaidez1 · tips de viaje».
- Texto entre el 15% superior y el 25% inferior libres (interfaz de Instagram).
- Datos verificables únicamente; nada de «según la psicología» ni citas sin fuente.
