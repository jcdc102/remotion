"""Música original (sin derechos) para los videos de Doctor Auto.

Electro-funk de taller a 120 BPM en mi menor: bombo, clap, hi-hats con swing,
bajo sincopado, acordes cortos y percusión metálica. Uso:
    python3 scripts/musica-sintetica.py salida.wav segundos
Después se comprime a volumen comercial (como una pista de música normal):
    ffmpeg -i salida.wav -af "acompressor=threshold=-26dB:ratio=6:attack=5:release=90:makeup=8,alimiter=limit=0.89:level=disabled,loudnorm=I=-9:TP=-1:LRA=5" public/musica.mp3
"""
import sys
import wave

import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
salida = sys.argv[1]
dur = float(sys.argv[2])
n = int(SR * (dur + 1))
mix = np.zeros((n, 2))
rng = np.random.default_rng(3)


def poner(señal, t, pan=0.0, vol=1.0):
    i = int(t * SR)
    if i >= n:
        return
    s = señal[: n - i] * vol
    mix[i : i + len(s), 0] += s * (1 - pan) ** 0.5
    mix[i : i + len(s), 1] += s * (1 + pan) ** 0.5


def env(lon, ataque, caida):
    t = np.arange(int(lon * SR)) / SR
    return np.minimum(1, t / max(ataque, 1e-4)) * np.exp(-t / caida)


def bombo():
    t = np.arange(int(0.35 * SR)) / SR
    f = 50 + 110 * np.exp(-t * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.95


def clap():
    lon = 0.22
    ruido = rng.uniform(-1, 1, int(lon * SR))
    t = np.arange(len(ruido)) / SR
    golpes = sum(np.exp(-np.maximum(0, t - d) * 60) * (t >= d) for d in (0, 0.011, 0.022))
    cola = np.exp(-t * 18)
    s = ruido * (0.6 * golpes + 0.5 * cola)
    # filtro pasa-altas sencillo
    return np.diff(np.concatenate([[0], s])) * 2.2


def hat(abierto=False):
    lon = 0.25 if abierto else 0.05
    ruido = rng.uniform(-1, 1, int(lon * SR))
    t = np.arange(len(ruido)) / SR
    s = np.diff(np.concatenate([[0], np.diff(np.concatenate([[0], ruido]))]))
    return s * np.exp(-t * (14 if abierto else 80)) * 0.5


def nota(m):
    return 440 * 2 ** ((m - 69) / 12)


def bajo(m, lon):
    t = np.arange(int(lon * SR)) / SR
    f = nota(m)
    sierra = 2 * ((t * f) % 1) - 1
    seno = np.sin(2 * np.pi * f * t)
    s = 0.55 * seno + 0.25 * sierra
    # filtro pasa-bajas de un polo con barrido rápido ("funk")
    corte = 300 + 1500 * np.exp(-t * 25)
    a = np.exp(-2 * np.pi * corte / SR)
    y = np.zeros_like(s)
    acc = 0.0
    for i in range(len(s)):
        acc = (1 - a[i]) * s[i] + a[i] * acc
        y[i] = acc
    return y * env(lon, 0.004, 0.18) * 1.6


def acorde(ms, lon):
    t = np.arange(int(lon * SR)) / SR
    s = sum(np.sign(np.sin(2 * np.pi * nota(m) * t)) * 0.18 + np.sin(2 * np.pi * nota(m) * t) * 0.3 for m in ms)
    return s * env(lon, 0.003, 0.07) * 0.5


def metal():
    t = np.arange(int(0.3 * SR)) / SR
    s = sum(np.sin(2 * np.pi * f * t) for f in (2380, 3510, 4870)) / 3
    return s * np.exp(-t * 16) * 0.35


PROG = [(40, [64, 67, 71, 74]), (43, [62, 67, 71, 74]), (45, [64, 67, 69, 72]), (47, [62, 66, 69, 71])]
# Patrón de bajo en semicorcheas (1 = nota, 2 = octava arriba).
PATRON_BAJO = [1, 0, 0, 1, 0, 0, 2, 0, 1, 0, 1, 0, 0, 2, 0, 1]
compases = int(dur / (4 * BEAT)) + 1
for c in range(compases):
    t0 = c * 4 * BEAT
    raiz, voces = PROG[c % 4]
    intro = c == 0
    for b in range(4):
        tb = t0 + b * BEAT
        poner(bombo(), tb, vol=0.9 if b in (0, 2) else 0.6)
        if b in (1, 3):
            poner(clap(), tb, pan=0.05, vol=0.6)
        for k in range(2):
            swing = 0.03 if k == 1 else 0
            poner(hat(), tb + k * BEAT / 2 + swing, pan=0.3, vol=0.5 if k == 0 else 0.35)
        poner(hat(True), tb + BEAT / 2 + 0.03, pan=-0.3, vol=0.18)
    if c % 2 == 1:
        poner(bombo(), t0 + 3.5 * BEAT, vol=0.5)
    if not intro:
        for k, v in enumerate(PATRON_BAJO):
            if v:
                poner(bajo(raiz + (12 if v == 2 else 0) - 12, BEAT / 4 * 0.9), t0 + k * BEAT / 4, vol=0.75)
        for k in (1.5, 2.75, 3.5):
            poner(acorde(voces, 0.16), t0 + k * BEAT, pan=-0.15 if k < 3 else 0.15, vol=0.55)
    poner(metal(), t0 + 3.75 * BEAT, pan=0.4, vol=0.5)

# Golpe final y recorte.
fin = dur
poner(bombo(), fin - 0.6, vol=1.0)
poner(acorde(PROG[0][1], 0.6), fin - 0.6, vol=0.8)
mix = mix[: int(dur * SR)]
mix /= np.max(np.abs(mix)) / 0.9
pcm = (mix * 32767).astype(np.int16)
with wave.open(salida, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"{salida}: {dur:.1f} s, {BPM} BPM")
