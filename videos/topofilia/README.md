# Serie Topofilia: difusión de investigación turística

Videos verticales (1080×1920) para millennials y Gen Z, basados en el artículo:

> López Ramos, J. L. y Huízar Sánchez, M. Á. (2026). *El alojamiento vacacional basado en
> plataformas digitales: causas, efectos e impactos en zonas de residencia local*. **Topofilia.
> Difusión Periódica de Arquitectura, Urbanismo y Territorios**, Año XIX, n.º 32, 178–203.
> ISSN 2594-0635.

## Plan de la serie (un video por mes)

| # | Título | Enfoque | Voz | Estado |
|---|--------|---------|-----|--------|
| 01 | Los números | Qué está pasando, con datos | Valeria (mujer) | Listo |
| 02 | El barrio | Humano: casas que se vuelven torres, la "zona de resistencia" | Andrés (hombre) | Pendiente |
| 03 | ¿Gentrificación o negocio? | Los 3 factores, "gentrificación conveniente" y "turistificación consecuente", con una pregunta a la audiencia | Diálogo entre las dos voces | Pendiente |

## Voces (ElevenLabs, diseñadas desde cero)

- **Valeria · Narradora Investigación**: `WuoSwUp0tcuLOSOCpLkq`. Mujer de unos 30 años, español mexicano neutro, cálida y segura.
- **Andrés · Narrador Investigación**: `nN88kfEjlRwtPs43m1ql`. Hombre de unos 35 años, español mexicano neutro, grave y con tono documental.

La narración se genera por escenas con el modelo `eleven_v4` y se guarda en `public/v1/s1.mp3 … s8.mp3`.
Los tiempos de cada frase (para los subtítulos) se midieron con detección de silencios y están en `src/v1/data.ts`.

## Uso

```bash
npm install
npm run dev          # Remotion Studio para previsualizar
npm run render:v1    # exporta out/v1-los-numeros.mp4
```

En servidores sin GPU, el 3D se renderiza por software con `--gl=swangle` (ya configurado en `remotion.config.ts`).

## Estructura

- `src/v1/City3D.tsx`: ciudad 3D (Three.js) que evoluciona durante el video: casas, pines de rentas, torres, polígono de estudio y las 8 zonas.
- `src/v1/Overlays.tsx`: textos, cifras y tarjetas de cada escena.
- `src/v1/V1LosNumeros.tsx`: composición principal, audio, subtítulos palabra por palabra y barra de progreso.
- `public/fonts`: tipografías Unbounded e Inter incluidas localmente.

## Pendiente

- Agregar el logo institucional (el espacio inferior de la tarjeta final está libre para eso).
- Música de fondo (opcional).
