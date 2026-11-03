# Videos de Instagram de Julio (@julio.chaidez1)

## Reglas para todos los videos
- Vertical 1080x1920, 30 fps. Español de México, tuteando.
- **Siempre con música de fondo** (instrumental, generada con vidIQ `vidiq_generate_music`), debajo de la voz:
  volumen 0.14, entrada de 0.5 s y salida de 1.5 s.
- **Siempre con efectos de sonido** (`sh scripts/sonidos.sh` los genera en `public/sfx/`), uno por animación:
  whoosh en cada cambio de escena, pop en números y pines, ding cuando algo sale bien, etc.
- Voz: el clon «Julio» de ElevenLabs. Antes de usarla, normalizarla con `loudnorm=I=-16:TP=-1.5:LRA=11`, porque cada toma sale con distinto volumen. Las escenas se alinean con las pausas de la voz (ffmpeg silencedetect).
- Al final, limitar picos a -1.5 dB: `alimiter=limit=0.84`.
- Colores de atardecer (noche #0E1B2E, morado #3A1F4A, coral #FF6B5B, naranja #FFA552, crema #FFF4E6),
  títulos en Playfair Display y texto en Poppins. Arriba: barra de progreso y «@julio.chaidez1 · <línea>» (por ejemplo «tips de viaje» o «turismo explicado #2»).
- Las piezas comunes (fondo, encabezado, texto animado, tarjeta visual, voz, música y efectos) están en `src/comun.tsx` (`<Reel>`); cada video sólo define sus escenas.
- Texto entre el 15% superior y el 25% inferior libres (interfaz de Instagram).
- Datos verificables únicamente; nada de «según la psicología» ni citas sin fuente.

## Datos y fuentes (regla obligatoria)
- Cada dato se verifica antes de usarlo y se anota en `fuentes.md`, con la fuente y la fecha en que se revisó.
- Orden de preferencia de las fuentes:
  1. Investigación académica revisada por pares: PASOS, Redalyc, SciELO, Dialnet, el repositorio de la UdeG (riudg.udg.mx) y otras revistas indexadas.
  2. Estadística oficial: INEGI, DataTur/Sectur, ONU Turismo, UNESCO, INAH.
  3. Los medios sólo sirven para encontrar el dato; después se confirma en la fuente 1 o 2.
- La fuente va en pantalla en el reel («Fuente: INEGI, 2026»).
- Si un dato no se puede confirmar, no se usa.
- Julio estudia en el CUCosta (UdeG, Puerto Vallarta). La Dra. María de los Ángeles Huízar Sánchez, investigadora y maestra suya, publica sobre turismo y patrimonio en Puerto Vallarta: su trabajo es una fuente prioritaria para temas locales. Se cita su artículo publicado; no se le atribuyen opiniones. Antes de etiquetarla, Julio le pide permiso.

## Líneas de contenido (6 por semana, lunes a sábado)
- 🌅 Frases (lun, mié, sáb): frase original en español sobre video propio de playa o atardecer. Nunca «según la psicología» ni citas sin fuente.
- 🎓 «Turismo explicado» (mar y jue), con episodios numerados: tipos de turismo, planificación turística, datos con fuente en pantalla y recomendaciones de profesional.
- ✈️ Tips de viaje (vie): consejos prácticos y verificables.
- «Siempre explorando»: descartada por ahora.
