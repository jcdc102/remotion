#!/bin/sh
# Efectos simples para el tema "pasar-corriente" (ffmpeg: sine, anoisesrc, aecho).
# Todos duran menos de 1 s, salvo motor-enciende y arranque-motor (hasta 2 s).
set -e
D=public/sfx
mkdir -p "$D"
f() { ffmpeg -nostdin -y -loglevel error "$@"; }
# whoosh: ruido rosa filtrado que sube y baja.
f -f lavfi -i "anoisesrc=d=0.55:c=pink:a=0.9" -af "bandpass=f=1100:w=1.3,afade=in:d=0.25,afade=out:st=0.25:d=0.3,volume=2" -ar 48000 -ac 2 $D/whoosh.wav
# chispazo: ráfaga de ruido blanco con crepitar y un poco de eco.
f -f lavfi -i "anoisesrc=d=0.45:c=white:a=1" -af "highpass=f=2500,volume='if(lt(mod(t,0.04),0.015),1,0.15)':eval=frame,afade=out:st=0.1:d=0.35,aecho=0.6:0.4:30:0.3,volume=1.6" -ar 48000 -ac 2 $D/chispazo.wav
# clac: golpe corto metálico (tono inarmónico + clic).
f -f lavfi -i "sine=f=1850:d=0.25" -f lavfi -i "sine=f=2930:d=0.25" -f lavfi -i "anoisesrc=d=0.25:c=white:a=0.8" -filter_complex "[0][1][2]amix=inputs=3,volume='exp(-28*t)*11':eval=frame,aecho=0.5:0.3:12:0.25" -ar 48000 -ac 2 $D/clac.wav
# pop: tono que baja rápido.
f -f lavfi -i "aevalsrc='0.8*sin(2*PI*(260*t+50*(1-exp(-40*t))*10))*exp(-25*t)':s=48000:d=0.25" -ac 2 $D/pop.wav
# clic: chasquido seco (llave).
f -f lavfi -i "anoisesrc=d=0.12:c=white:a=0.5" -af "highpass=f=1500,afade=out:d=0.1,volume=0.9" -ar 48000 -ac 2 $D/clic.wav
# tic-tac: cuatro clics alternando agudo y grave (0.9 s).
f -f lavfi -i "aevalsrc='0.8*sin(2*PI*(2600-1100*lt(mod(t,0.5),0.25))*t)*exp(-170*mod(t,0.25))':s=48000:d=0.9" -ac 2 $D/tic-tac.wav
# motor-enciende: arranque corto y motor que se estabiliza (1.8 s).
f -f lavfi -i "aevalsrc='0.5*(2*mod(t*(38+18*min(1,t/0.8)),1)-1)*(0.7+0.3*sin(2*PI*7*t))*min(1,t*6)':s=48000:d=1.8" -af "lowpass=f=900,afade=out:st=1.4:d=0.4,volume=1.5" -ac 2 $D/motor-enciende.wav
# arranque-motor: motor de arranque que gira y prende (2 s).
f -f lavfi -i "aevalsrc='0.5*(2*mod(t*(if(lt(t,0.8),20+10*t,55)),1)-1)*if(lt(t,0.8),pow(0.5+0.5*sin(2*PI*6*t),2),0.8)*min(1,t*10)':s=48000:d=2" -af "lowpass=f=1100,afade=out:st=1.6:d=0.4,volume=1.5" -ac 2 $D/arranque-motor.wav
# ding: campanita suave.
f -f lavfi -i "aevalsrc='0.5*(sin(2*PI*1320*t)+0.4*sin(2*PI*2640*t)+0.15*sin(2*PI*3960*t))*exp(-5*t)*min(1,t*200)':s=48000:d=0.9" -ac 2 $D/ding.wav
