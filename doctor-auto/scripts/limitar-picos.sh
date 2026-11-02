#!/bin/sh
# Limita los picos del audio final a -1.5 dB sin bajar el volumen general de la voz
# (la voz de origen ya llega a -0.1 dB por sí sola). El video se copia sin recodificar.
# Uso: sh scripts/limitar-picos.sh entrada.mp4 salida.mp4
set -e
ffmpeg -nostdin -y -loglevel error -i "$1" -c:v copy -af "alimiter=limit=0.84:attack=2:release=40:level=disabled" -c:a aac -b:a 256k "$2"
