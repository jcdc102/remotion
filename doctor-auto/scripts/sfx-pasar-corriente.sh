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
# --- Efectos adicionales ---
# rebote: "boing" corto para la entrada de la mascota.
f -f lavfi -i "aevalsrc='0.6*sin(2*PI*(180*t+120*sin(2*PI*9*t)/(2*PI*9)*exp(-4*t)*10))*exp(-6*t)':s=48000:d=0.5" -ac 2 $D/rebote.wav
# zumbido: zumbido eléctrico que crece (60 Hz con armónicos y chisporroteo).
f -f lavfi -i "aevalsrc='(0.35*sin(2*PI*120*t)+0.2*sin(2*PI*240*t)+0.12*sin(2*PI*360*t))*min(1,t*1.4)':s=48000:d=0.9" -f lavfi -i "anoisesrc=d=0.9:c=white:a=0.15" -filter_complex "[1]highpass=f=3000,volume='0.4*t':eval=frame[n];[0][n]amix=inputs=2,afade=out:st=0.8:d=0.1,volume=2" -ac 2 $D/zumbido.wav
# trinquete: freno de mano subiendo ("crrk").
f -f lavfi -i "aevalsrc='0.7*(random(0)*2-1)*exp(-120*mod(t,0.055))':s=48000:d=0.35" -af "bandpass=f=2200:w=1,volume=2" -ac 2 $D/trinquete.wav
# foco: foco que se apaga ("tink" con caída).
f -f lavfi -i "aevalsrc='0.5*sin(2*PI*(1600-900*t)*t)*exp(-9*t)':s=48000:d=0.35" -af "aecho=0.6:0.3:20:0.3" -ac 2 $D/foco.wav
# aterriza: golpecito suave al acomodarse cada pinza.
f -f lavfi -i "aevalsrc='0.7*sin(2*PI*700*t)*exp(-45*t)+0.3*(random(0)*2-1)*exp(-80*t)':s=48000:d=0.15" -ac 2 $D/aterriza.wav
# cable: el cable se desliza ("ziip").
f -f lavfi -i "anoisesrc=d=0.4:c=pink:a=0.8" -af "highpass=f=1500,lowpass=f=6000,volume='0.3+2*t':eval=frame,afade=in:d=0.05,afade=out:st=0.3:d=0.1,volume=1.5" -ar 48000 -ac 2 $D/cable.wav
# error: zumbido grave corto para la "X" roja.
f -f lavfi -i "aevalsrc='0.35*(2*mod(110*t,1)-1)*lt(mod(t,0.18),0.13)':s=48000:d=0.34" -af "lowpass=f=1500,volume=1.4" -ac 2 $D/error.wav
# check: dos notas que suben para la palomita verde.
f -f lavfi -i "aevalsrc='0.45*(sin(2*PI*880*t)*lt(t,0.12)+sin(2*PI*1320*t)*gte(t,0.12))*exp(-6*mod(t,0.12))':s=48000:d=0.4" -ac 2 $D/check.wav
# encendido: tono que sube (faros y tablero que se encienden).
f -f lavfi -i "aevalsrc='0.35*sin(2*PI*(300*t+900*t*t))*min(1,t*10)':s=48000:d=0.6" -af "afade=out:st=0.45:d=0.15,aecho=0.5:0.3:25:0.25,volume=1.5" -ac 2 $D/encendido.wav
# carga: barrido ascendente de batería que se llena.
f -f lavfi -i "aevalsrc='0.3*sin(2*PI*(400*t+500*t*t))*(0.6+0.4*sin(2*PI*14*t))':s=48000:d=0.9" -af "afade=in:d=0.1,afade=out:st=0.75:d=0.15,volume=1.4" -ac 2 $D/carga.wav
# conteo: tics rápidos del odómetro.
f -f lavfi -i "aevalsrc='0.5*sin(2*PI*3000*t)*exp(-200*mod(t,0.045))':s=48000:d=0.8" -af "afade=out:st=0.6:d=0.2" -ac 2 $D/conteo.wav
# Iguala el pico de los efectos adicionales a -6 dB.
for x in rebote zumbido trinquete foco aterriza cable error check encendido carga conteo; do
  pico=$(ffmpeg -nostdin -i "$D/$x.wav" -af volumedetect -f null - 2>&1 | sed -n 's/.*max_volume: \(-*[0-9.]*\) dB.*/\1/p')
  ganancia=$(awk -v p="$pico" 'BEGIN{printf "%.2f", -6 - p}')
  f -i "$D/$x.wav" -af "volume=${ganancia}dB" "$D/$x.tmp.wav" && mv "$D/$x.tmp.wav" "$D/$x.wav"
done
