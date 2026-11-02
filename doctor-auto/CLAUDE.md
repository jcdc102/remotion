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
