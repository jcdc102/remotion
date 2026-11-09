# Doctor Auto México: reglas para TODOS los videos

## Formato
- Vertical 1080x1920, 30 fps, para TikTok, Reels y Facebook.
- Duración: 40 a 45 s.
- Estructura obligatoria: las 8 piezas (gancho, introducción, cuerpo 1, bucle, cuerpo 2, bucle, cuerpo 3, CTA). Se lee de guion.json.
- Idioma: español de México, con acentos y signos de apertura.
- Campo tarjetaFinal: si es false, el video termina en el CTA sin logo final; si es true, agrega 2 s de tarjeta con el logo.

## Escenas
Gancho visual en los primeros 3 s, cambio visual al menos cada 3 s, re-enganche a mitad del video, pago final en el último tercio.

## Colores
- Rojo Doctor Auto: tómalo con un muestreo de color del logo y de mascota.png (aprox. #D32F2F). Guarda el valor exacto en un archivo de constantes (`src/doctor-auto/constantes.ts`: logo #CC2328, mascota #CC212F).
- Fondo: #151515
- Blanco: #FFFFFF
- Degradado de acento: rojo a rojo oscuro (aprox. #D32F2F a #7F1D1D), para botones, franjas de aviso y fondos.
- Gris secundario: #9E9E9E

## Tipografía (Google Fonts, con @remotion/google-fonts)
- Títulos y palabras clave: Anton
- Subtítulos y texto de apoyo: Poppins SemiBold
- Subtítulos en blanco con borde negro.

## Estilo
Dinámico, limpio, de taller moderno. Nada saturado de efectos.

## Animaciones
- Cinéticas: cada palabra entra con un resorte corto (spring) y las palabras resaltadas hacen un pequeño golpe de zoom.
- Resaltado: la palabra clave va sobre una cápsula roja redondeada con texto blanco, no con cambio de color.
- Transiciones con corte seco más whoosh, no fundidos largos.
- Barra de progreso fina arriba.

## Zonas seguras
- Subtítulos y texto principal entre 30% y 60% de la altura.
- Dejar libre el 15% superior y el 25% inferior.
- La mascota va a la derecha, entre 45% y 75% de la altura.

## Mascota
Usa mascota.png (o las poses nuevas si existen) con fondo transparente. Animaciones: entra-rebote, habla (sincronizada con el volumen de la voz), voltea, susto, flecha-senala, duda, pulgar-final, grande-centro.

## Sonido
Solo voz y efectos de sonido. Sin música; la música de tendencia se agrega en TikTok.

## Marca de agua
"doctor auto" pequeña, en una esquina fuera de las zonas de la interfaz, todo el video.

## Entrega
Antes de renderizar el video completo, renderiza un solo fotograma (still) del gancho y otro del cuerpo 1 y muéstramelos para aprobar el estilo. Luego renderiza el MP4, guárdalo en la rama doctor-auto y envíalo.

---

## PACK DE MOVIMIENTO (aplica a TODOS los videos)

> Sustituye la regla anterior de "sin música": ahora la música (musica.mp3) se mezcla dentro de Remotion.

Objetivo: que el video se sienta energético, llamativo y premium, nunca estático. Todo cambio visual lleva un sonido, y ningún efecto debe tapar los subtítulos ni la mascota.

### Texto cinético
- Cada palabra de los subtítulos entra con un resorte corto: spring con damping 12 y stiffness 200, subiendo desde 20 px abajo y de 0.8 a 1 de escala.
- La palabra resaltada va sobre una cápsula roja redondeada que se dibuja de izquierda a derecha en 6 fotogramas y la palabra hace un golpe de zoom a 1.15 y vuelve a 1.
- Títulos grandes (gancho y bucles): letras en Anton que entran una por una con 2 fotogramas de retraso, con un leve temblor al caer.
- Números y datos clave (3 a 6 años, 20 min, 10,000 km): pantalla casi completa por 1 segundo, con cuenta rápida desde 0 hasta el número.

### Cámara y gráficos
- Zoom lento constante (de 1.0 a 1.06) durante cada clip, y un "punch-in" de 1.0 a 1.12 en 4 fotogramas cuando aparece el dato importante.
- Fondo con degradado rojo a #151515 que se mueve despacio, con formas geométricas grandes (@remotion/shapes) y ruido sutil (@remotion/noise) en movimiento. Sin fondos planos quietos.
- Profundidad: sombra suave bajo cada elemento gráfico, y los íconos entran con rebote y un pequeño giro.
- Dibujos de líneas (pinzas, flechas, cables) que se "dibujan solos" con stroke-dashoffset.
- Desenfoque de movimiento (@remotion/motion-blur, CameraMotionBlur) en las transiciones rápidas, si el render lo soporta sin volverse muy lento.

### Transiciones
- Usa TransitionSeries de @remotion/transitions entre bloques. Rota entre slide, wipe, flip y un zoom-through. Nunca la misma dos veces seguidas.
- Duración de cada transición: 8 a 12 fotogramas (menos de 0.4 s).
- Cada transición lleva un whoosh distinto.
- Evita destellos de blanco puro y parpadeos rápidos (más de 3 por segundo).

### Mascota con más vida
- Respira siempre: balanceo de 1 a 2% de escala y rotación de 1 a 2 grados, aunque no hable.
- Entradas y salidas con rebote o "pop". Cuando hace una pregunta o se asusta, se agranda a 1.15 y tiembla 6 fotogramas.
- Sus globos de diálogo aparecen con resorte y llevan un sonido de pop.

### Ritmo con la música
- Si guion.json trae el campo "bpm", calcula el pulso: un latido cada (60 / bpm) segundos.
- En cada latido, la mascota y el fondo hacen un pulso suave de 1.0 a 1.03. No muevas el texto con el pulso para que se siga leyendo.

### Sonido
Capas: voz, efectos y música, mezcladas dentro de Remotion.
- Voz: volumen 1.0, siempre al frente.
- Música (musica.mp3, en loop con fundido de entrada de 0.5 s y salida de 1 s): volumen base 0.12. Mientras suena la voz, baja a 0.07 con una transición de 5 fotogramas; en los silencios entre clips sube de nuevo a 0.12. En el primer segundo del gancho y en el último segundo del CTA puede subir a 0.2.
- Efectos: volumen entre 0.35 y 0.5, un poco por debajo de la voz.
- Cada elemento que entra en pantalla tiene su sonido: whoosh en transiciones, pop en íconos y globos, "swipe" en wipes, impacto grave ("hit") en el gancho y en los números grandes, riser (subida) de 1 a 2 s antes de cada bucle abierto, clac metálico al conectar piezas, "ding" en cada dato correcto, tic-tac en preguntas.
- Evita que dos efectos suenen exactamente al mismo tiempo; desfásalos 2 o 3 fotogramas.
- Pico final: no mayor a -1 dB. Si hay clipping, baja música y efectos, no la voz.

### Revisión antes de entregar
Renderiza dos fotogramas (gancho y un cuerpo) y un tramo de 5 s con audio para que yo apruebe movimiento y mezcla. Después renderiza el video completo.

---

## REGLA FIJA: SIEMPRE EFECTOS DE SONIDO

Todos los videos llevan efectos de sonido, aunque el guion no los pida o el campo "sfx" venga vacío.
- Cada elemento que entra en pantalla tiene su sonido: whoosh en transiciones (uno distinto por tipo), pop en íconos, stickers y globos, impacto ("hit") en el gancho y en los números grandes, riser antes de cada bucle, clac al conectar piezas, ding en cada dato correcto, tic-tac en preguntas.
- Usar primero los efectos de Mixkit del usuario (public/sfx/mk-*.wav); si falta uno, generarlo con ffmpeg o síntesis y guardarlo en public/sfx/.
- Volumen de efectos entre 0.35 y 0.5 (por debajo de la voz); dos efectos nunca al mismo tiempo (desfase de 2–3 fotogramas).
- Antes de entregar: revisar que no haya un cambio visual sin sonido y que el pico final no pase de -1 dB.

---

## DISEÑO BASE (aprobado): ESCENAS ANIMADAS A PANTALLA COMPLETA

Nada de "fondo de un color con la información enfrente".
- Cada pieza ocurre en un mundo ilustrado y en movimiento que ocupa toda la pantalla (ejemplo: ciudad nocturna con parallax, calle mojada con reflejos, el auto manejando).
- Cuando se habla de una pieza, la cámara entra a esa zona del auto y corta a un primer plano tipo "radiografía" a pantalla completa (rejilla técnica en movimiento, línea de escaneo, marcos de HUD).
- Onomatopeyas animadas para cada ruido o golpe; etiquetas con líneas que señalan las partes.
- La mitad de abajo también se mueve (piso, reflejos, banqueta), oscurecida un poco detrás de subtítulos y mascota para que se lean.
- Referencia: src/estructura8/ruidos/Mundo.tsx y Ruidos.tsx.

---

## ESTILO PREMIUM (obligatorio en TODOS los videos)

El video debe verse premium: acabado de comercial, no de plantilla. Cinco reglas de edición:

1. **Sincroniza las entradas con la narración.** Cada elemento (título, ícono, pieza, dato, flecha) entra en el fotograma exacto en que la voz dice su palabra, usando los tiempos por palabra de los clips. Nada entra "porque sí" ni antes de que se mencione.
2. **La cámara sigue lo importante.** Hay una cámara virtual que siempre se mueve hacia lo que se está explicando: acercamientos suaves, paneos y seguimiento del objeto (la llanta que gira, el nivel que sube, la luz que se enciende). Nunca una toma totalmente quieta; curvas de aceleración suaves (sin movimientos lineales).
3. **Encadena los movimientos.** El final de un movimiento es el inicio del siguiente: la cámara no se detiene entre escenas, el objeto que sale empuja al que entra, y las animaciones se traslapan unos fotogramas en vez de ir una tras otra con pausas muertas.
4. **Transforma un objeto para introducir la siguiente escena.** Las transiciones principales son de transformación: un objeto de la escena se convierte en el de la siguiente (la llanta se vuelve el reloj del medidor, el faro se vuelve la luna, el círculo de la batería se vuelve el ícono siguiente). Los barridos y deslizamientos quedan solo como apoyo.
5. **Revela el texto desde una máscara.** Los títulos y datos grandes no aparecen con fundido: salen desde una máscara (sube desde detrás de una línea, se descubre con una barra o forma que pasa, o aparece dentro de la silueta de un objeto).

Acabado premium:
- Profundidad: varias capas con parallax, desenfoque de fondo en primeros planos, sombras suaves, brillos y reflejos.
- Iluminación: luces de acento (rojo de marca), viñeta ligera, grano fino de película, gradación de color cálida y con contraste.
- Tipografía limpia con mucho aire; pocos elementos a la vez; movimientos con resorte suave, sin rebotes exagerados.
- Elementos reales: cuando ayude a que se entienda o se vea mejor, integrar video, fotos u objetos reales (por ejemplo, tomas del taller del cliente, piezas reales recortadas) mezclados con la animación, con la misma gradación de color.

---

## ESTILO COOL 3D (obligatorio en TODOS los videos)

Público: conductores mexicanos de 25 a 55 años (dueños de auto de uso diario, familias, trabajadores) que ven TikTok/Reels/Facebook. El video debe entretener como contenido, no parecer anuncio.
- Se ve pro, premium y en 3D: objetos 3D reales (@remotion/three) con luces, reflejos y sombras; capas con profundidad y cámara que se mueve en 3D.
- Fondo siempre acorde a lo que se dice y en movimiento constante: nunca un fondo fijo ni de un color.
- Tomas reales cuando ayuden: clips de video e imágenes reales (generadas en ElevenLabs con modelos de video/imagen, o tomas del taller del cliente) mezclados con los gráficos 3D, con la misma gradación de color.
- Música de fondo real (ElevenLabs Music, instrumental, 120 BPM, del ánimo del tema), con ducking bajo la voz.
- Ritmo entretenido: un cambio visual cada 1–2 s, humor ligero y frases del día a día, ganchos y re-enganches claros.
- El estilo puede variar entre videos (cinemático, show de juego, documental, etc.), siempre pro.
- Voz: la voz "DOCTOR AUTO" de ElevenLabs (voice_id m4FLfO3mc8RTRVJVmA9C, modelo eleven_v3), toma única cortada por palabras con scripts/cortar-por-palabras.py.
