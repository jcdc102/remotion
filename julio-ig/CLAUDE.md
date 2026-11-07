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
  títulos en Playfair Display y texto en Poppins. Arriba: barra de progreso y «@julio.chaidez1» (con « · tips de viaje» en los tips).
- **Estilo visual (desde el reel de turistificación):** nada de fondo de un solo color. Fondo `<Mundo>` (`src/mundo.tsx`): paisaje animado de la bahía al atardecer, con sol que baja, nubes, aves, montañas y mar con olas. Cada escena lleva una ilustración animada de lo que se dice (calles, casas, torres, mapas, planos, gráficos), con emojis (Noto Color Emoji) como íconos, y pastillas con los datos clave.
- **Estilo premium con tomas reales (desde «Tipos de turismo»):** tomas de stock gratis de Pexels (vidIQ `vidiq_generate_broll`, sólo versiones HD de 720p o más) a pantalla completa, con zoom lento, color cálido, viñeta, grano de película, destello de luz en cada cambio y número grande por tema (`src/TiposDeTurismo.tsx`). Nunca poner el nombre de un lugar real sobre una toma que no es de ese lugar: para Puerto Vallarta, usar videos de Julio. Créditos de cada toma en `fuentes.md`. Recomprimir el final con `libx264 -crf 21`.
- **Reflexiones (desde «A veces das tanto…»):** 15 a 20 s, tomas de atardecer encadenadas con fundidos (sin cortes), frase al centro palabra por palabra con desenfoque, voz «Julio» suave, piano con `volumenMusica` 0.22, olas de fondo (`sfx/olas.wav`) y un brillo en la frase clave (`src/ReflexionDar.tsx`). Piezas de cine (toma, destello, grano) en `src/cine.tsx`.
- **Ritmo (pedido de Julio, desde «Los Algodones»):** que el video no se sienta apresurado. Agregar casi 1 s de pausa entre bloques de la voz y 0.5 s al inicio, escenas con fundidos suaves de 18 fotogramas, animaciones lentas (spring con damping 20 y mass 1.2) y tiempo para leer cada dato. La duración la decide el contenido (unos 50 s está bien).
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
- 🎓 Turismo (mar y jue), sin etiqueta «Turismo explicado #N» en pantalla (Julio la quitó): tipos de turismo, planificación turística, datos con fuente en pantalla y recomendaciones de profesional.
- ✈️ Tips de viaje (vie): consejos prácticos y verificables.
- «Siempre explorando»: descartada por ahora.
