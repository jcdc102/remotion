#!/bin/sh
# Corta la toma única de ElevenLabs (public/audio/ruidos/voz-completa.mp3, 41.2 s)
# en los 15 clips del guion «5 ruidos». Cada clip va del inicio al fin de su voz
# (ffmpeg silencedetect, n=-38dB, d=0.25) con 0.1 s de margen a cada lado.
# Las pausas 1.31–1.88 (c01) y 13.00–13.27 (c03c) quedan dentro de su clip.
set -e
E=public/audio/ruidos/voz-completa.mp3
corte() { ffmpeg -nostdin -y -loglevel error -i "$E" -ss "$2" -to "$3" -c:a libmp3lame -q:a 2 "public/audio/ruidos/$1.mp3"; }
corte c01  0.00  2.84
corte c02  3.44  5.67
corte c03a 6.02  7.86
corte c03b 8.04  10.40
corte c03c 10.89 14.66
corte c04  14.81 17.00
corte c05a 17.31 19.34
corte c05b 19.44 21.96
corte c05c 22.46 25.93
corte c06  26.24 28.05
corte c07a 28.12 30.64
corte c07b 30.84 33.46
corte c07c 33.74 35.63
corte c07d 36.01 38.26
corte c08  38.80 41.247
