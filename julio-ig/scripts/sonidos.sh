#!/bin/sh
# Genera los efectos de sonido con ffmpeg, sin archivos externos. Correr desde julio-ig/.
set -e
D=public/sfx
mkdir -p "$D"
f() { ffmpeg -nostdin -y -loglevel error "$@"; }
# Whoosh: ruido rosa filtrado que sube y baja (cambios de escena, avión).
f -f lavfi -i "anoisesrc=d=0.55:c=pink:a=0.8" -af "bandpass=f=1100:w=1.3,afade=in:d=0.28,afade=out:st=0.28:d=0.27,volume=2.2" -ar 48000 -ac 2 $D/whoosh.wav
# Pop: tono corto que baja (números, pines).
f -f lavfi -i "aevalsrc='0.7*sin(2*PI*(300*t+600*(1-exp(-40*t))))*exp(-25*t)':s=48000:d=0.25" -ac 2 $D/pop.wav
# Ding suave (algo bueno: día barato).
f -f lavfi -i "aevalsrc='0.5*(sin(2*PI*1320*t)+0.4*sin(2*PI*2640*t)+0.15*sin(2*PI*3960*t))*exp(-4*t)*min(1,t*200)':s=48000:d=1.2" -ac 2 $D/ding.wav
# Notificación: dos notas ascendentes tipo celular.
f -f lavfi -i "aevalsrc='0.4*(sin(2*PI*880*t)*lt(t,0.12)+sin(2*PI*1318*(t-0.12))*gte(t,0.12))*exp(-6*mod(t,0.12)-3*t)*min(1,t*300)':s=48000:d=0.6" -ac 2 $D/notificacion.wav
# Tachar: rayón rápido de marcador.
f -f lavfi -i "anoisesrc=d=0.3:c=white:a=0.6" -af "bandpass=f=3000:w=1,afade=in:d=0.05,afade=out:st=0.15:d=0.15,volume=1.6" -ar 48000 -ac 2 $D/tachar.wav
# Golpe suave: la maleta que cae.
f -f lavfi -i "aevalsrc='0.9*sin(2*PI*(55*t+40*(1-exp(-25*t))))*exp(-7*t)+0.2*(random(0)*2-1)*exp(-45*t)':s=48000:d=0.7" -ac 2 $D/golpe.wav
# Guardar: clic seco más un brillo agudo.
f -f lavfi -i "aevalsrc='0.6*(random(0)*2-1)*exp(-120*t)+0.3*gte(t,0.06)*(sin(2*PI*1760*(t-0.06))+0.6*sin(2*PI*2637*(t-0.06))+0.4*sin(2*PI*3520*(t-0.06)))*exp(-5*(t-0.06))':s=48000:d=1.0" -ac 2 $D/guardar.wav
# Olas: ruido rosa suave que sube y baja como el mar (fondo para reflexiones).
f -f lavfi -i "anoisesrc=d=20:c=pink:a=0.5" -af "lowpass=f=900,volume='0.35+0.3*sin(2*PI*t/6)':eval=frame,afade=in:d=1.5,afade=out:st=18:d=2" -ar 48000 -ac 2 $D/olas.wav
# Brillo: campanita suave y aguda (para remarcar una frase).
f -f lavfi -i "aevalsrc='0.25*min(1,t*300)*(sin(2*PI*1568*t)*exp(-2.5*t)+0.5*sin(2*PI*2349*t)*exp(-3*t)+0.3*sin(2*PI*3136*t)*exp(-3.5*t))':s=48000:d=1.8" -ac 2 $D/brillo.wav
