#!/bin/sh
# Prepara los efectos de Mixkit (public/sfx/mixkit/) para el video:
# quita el silencio inicial, recorta a una duración máxima con fundido corto,
# iguala el pico a -6 dB y los guarda como public/sfx/mk-<uso>.wav (48 kHz, estéreo).
set -e
D=public/sfx
prep() { # origen destino max_segundos
  tmp="$D/$2.tmp.wav"
  ffmpeg -nostdin -y -loglevel error -i "$D/mixkit/$1.wav" -af "silenceremove=start_periods=1:start_threshold=-50dB,atrim=0:$3,afade=out:st=$(awk -v m="$3" 'BEGIN{print m-0.08}'):d=0.08" -ar 48000 -ac 2 "$tmp"
  pico=$(ffmpeg -nostdin -i "$tmp" -af volumedetect -f null - 2>&1 | sed -n 's/.*max_volume: \(-*[0-9.]*\) dB.*/\1/p')
  ffmpeg -nostdin -y -loglevel error -i "$tmp" -af "volume=$(awk -v p="$pico" 'BEGIN{printf "%.2f", -6 - p}')dB" "$D/$2.wav"
  rm "$tmp"
}
prep electric-buzz-glitch    mk-chispazo     0.9   # chispa grande (c01) y corta (c05d)
prep arcade-retro-game-over  mk-error        1.0   # "X" roja sobre el negativo de la muerta
prep fast-double-click       mk-clic         0.45  # llave (c03)
prep hard-pop-click          mk-pop          0.5   # íconos, globos, números y botón
prep select-click            mk-aterriza     0.35  # cada pinza que se acomoda (c04)
prep cinematic-glass-hit     mk-hit          1.0   # impacto del gancho y del "20 min"
prep fast-whoosh-transition  mk-whoosh-slide 0.7   # transición slide
prep fast-small-sweep        mk-swipe        0.7   # transición wipe
prep fast-swipe-zoom         mk-whoosh-zoom  0.8   # transición zoom-through
