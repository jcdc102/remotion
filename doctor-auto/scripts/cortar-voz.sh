#!/bin/sh
# Corta public/audio/voz-completa.mp3 (una sola toma de 38.2 s) en los 14 clips
# del guion. Cada corte va a la mitad de la pausa (ffmpeg silencedetect,
# n=-38dB) entre un clip y el siguiente. No cambia velocidad ni tono.
# La pausa de 1.48 s entre "chispas." y "Literal." queda dentro de c01.
set -e
E=public/audio/voz-completa.mp3
corte() { ffmpeg -nostdin -y -loglevel error -i "$E" -ss "$2" -to "$3" -c:a libmp3lame -q:a 2 "public/audio/$1.mp3"; }
corte c01  0      4.685   # pausa 4.55–4.82
corte c02  4.685  6.900   # pausa 6.78–7.02
corte c03  6.900  10.925  # pausa 10.69–11.16
corte c04  10.925 13.680  # pausa 13.35–14.01
corte c05a 13.680 16.055  # pausa 15.78–16.33
corte c05b 16.055 18.615  # pausa 18.27–18.96
corte c05c 18.615 21.045  # pausa 20.73–21.36
corte c05d 21.045 24.760  # pausa 24.42–25.10
corte c06  24.760 26.855  # pausa 26.58–27.13
corte c07a 26.855 29.245  # pausa 29.11–29.38
corte c07b 29.245 30.695  # pausa 30.54–30.85
corte c07c 30.695 32.765  # pausa 32.58–32.95
corte c07d 32.765 35.065  # pausa 34.80–35.33
corte c08  35.065 38.191
