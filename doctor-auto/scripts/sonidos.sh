#!/bin/sh
# Genera los efectos de sonido de Estructura8 con ffmpeg (sin archivos externos).
set -e
D=public/estructura8/sfx
mkdir -p "$D"
f() { ffmpeg -nostdin -y -loglevel error "$@"; }
# Golpe grave: caída de 140 Hz a 50 Hz con cola corta.
f -f lavfi -i "aevalsrc='0.9*sin(2*PI*(50*t+30*(1-exp(-25*t))))*exp(-4*t)+0.25*(random(0)*2-1)*exp(-40*t)':s=48000:d=1.2" -ac 2 $D/golpe.wav
# Campana: parciales inarmónicos con decaimiento.
f -f lavfi -i "aevalsrc='0.3*min(1,t*400)*(sin(2*PI*523*t)*exp(-1.2*t)+0.6*sin(2*PI*1046*t)*exp(-1.8*t)+0.5*sin(2*PI*1255*t)*exp(-2.2*t)+0.35*sin(2*PI*1570*t)*exp(-2.6*t)+0.3*sin(2*PI*261*t)*exp(-0.9*t))':s=48000:d=2.5" -ac 2 $D/campana.wav
# Whoosh: ruido rosa filtrado con subida y caída.
f -f lavfi -i "anoisesrc=d=0.6:c=pink:a=0.8" -af "bandpass=f=900:w=1.2,afade=in:d=0.3,afade=out:st=0.3:d=0.3,volume=2.5" -ar 48000 -ac 2 $D/whoosh.wav
# Apagado: tono que cae de 600 Hz a casi nada, como un motor que muere.
f -f lavfi -i "aevalsrc='0.6*sin(2*PI*200*(1-exp(-3*t)))*exp(-2.5*t)*(1+0.3*sin(2*PI*18*t))':s=48000:d=1.0" -ac 2 $D/apagado.wav
# Rasgado de papel: ruido con chasquidos irregulares.
f -f lavfi -i "aevalsrc='(random(0)*2-1)*pow(0.5+0.5*sin(2*PI*31*t+3*sin(2*PI*7*t)),6)*min(1,t*30)*exp(-1.8*t)':s=48000:d=0.8" -af "highpass=f=1200,volume=2" -ac 2 $D/rasgado.wav
# Riser: tono que sube con ruido creciente.
f -f lavfi -i "aevalsrc='(0.35*sin(2*PI*(150*t+250*t*t))+0.2*(random(0)*2-1))*pow(t/1.6,2)':s=48000:d=1.6" -af "afade=out:st=1.5:d=0.1" -ac 2 $D/riser.wav
# Pitido de alerta: dos pitidos cortos.
f -f lavfi -i "aevalsrc='0.35*(sin(2*PI*1100*t)+0.3*sin(2*PI*3300*t))*(lt(mod(t,0.24),0.12))*lt(t,0.46)':s=48000:d=0.6" -ac 2 $D/alerta.wav
# Latido lento: "pum-pum".
f -f lavfi -i "aevalsrc='0.9*sin(2*PI*48*t)*exp(-14*t)+0.7*sin(2*PI*44*(t-0.28))*exp(-14*(t-0.28))*gte(t,0.28)':s=48000:d=1.2" -ac 2 $D/latido.wav
# Caja registradora: clic mecánico + timbre "ching".
f -f lavfi -i "aevalsrc='0.5*(random(0)*2-1)*exp(-60*t)+0.4*gte(t,0.1)*(sin(2*PI*2093*(t-0.1))+0.7*sin(2*PI*2637*(t-0.1))+0.4*sin(2*PI*4186*(t-0.1)))*exp(-3*(t-0.1))':s=48000:d=1.3" -ac 2 $D/caja.wav
# Pop: tono que baja rápido.
f -f lavfi -i "aevalsrc='0.7*sin(2*PI*(300*t+60*(1-exp(-40*t))*10))*exp(-25*t)':s=48000:d=0.25" -ac 2 $D/pop.wav
# --- Tema "bateria" ---
# Arranque lento: motor de arranque que batalla ("rrr-rrr-rrr" que se va frenando).
f -f lavfi -i "aevalsrc='0.6*(2*mod(t*(70-25*t),1)-1)*pow(0.5+0.5*sin(2*PI*(5-1.8*t)*t),2)*min(1,t*20)*exp(-0.6*t)':s=48000:d=1.6" -af "lowpass=f=1800,volume=1.4" -ac 2 $D/arranque.wav
# Clic: chasquido seco del solenoide.
f -f lavfi -i "aevalsrc='0.9*(random(0)*2-1)*exp(-120*t)+0.6*sin(2*PI*1800*t)*exp(-90*t)':s=48000:d=0.3" -ac 2 $D/clic.wav
# Apagado de luces: zumbido eléctrico que baja y se corta.
f -f lavfi -i "aevalsrc='0.45*sin(2*PI*120*(1-exp(-2*t))/2*10)*(1+0.5*sin(2*PI*60*t))*exp(-3*t)':s=48000:d=0.9" -ac 2 $D/luces.wav
# Ding suave.
f -f lavfi -i "aevalsrc='0.5*(sin(2*PI*1320*t)+0.4*sin(2*PI*2640*t)+0.15*sin(2*PI*3960*t))*exp(-4*t)*min(1,t*200)':s=48000:d=1.2" -ac 2 $D/ding.wav
# --- Tema "alineacion" ---
# Chirrido suave de llanta: tono agudo con vibrato y ruido.
f -f lavfi -i "aevalsrc='(0.25*sin(2*PI*(2300*t+40*sin(2*PI*18*t)))+0.12*(random(0)*2-1))*min(1,t*8)*max(0,1-t/1.2)':s=48000:d=1.2" -af "bandpass=f=2400:w=1.5,volume=2" -ac 2 $D/chirrido.wav
# Tic tac: clics alternados (agudo y grave) cada 0.5 s.
f -f lavfi -i "aevalsrc='0.8*sin(2*PI*(2600-1000*lt(mod(t,1),0.5))*t)*exp(-180*mod(t,0.5))':s=48000:d=2" -ac 2 $D/tictac.wav
