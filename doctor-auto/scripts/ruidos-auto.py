"""Sonidos de fallas del auto para el video «5 ruidos» (síntesis, sin derechos).

Uso: python3 scripts/ruidos-auto.py carpeta_salida
Genera chillido-banda, clic-homocinetica, golpe-suspension, zumbido-balero y
rechinido-frenos (.wav, 44.1 kHz, estéreo, pico -3 dB).
"""
import os
import sys
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(11)
salida = sys.argv[1]
os.makedirs(salida, exist_ok=True)


def t_(seg):
    return np.arange(int(seg * SR)) / SR


def pasabanda(x, centro, ancho):
    """Filtro pasa-banda sencillo en frecuencia (FFT)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= np.exp(-(((f - centro) / ancho) ** 2))
    return np.fft.irfft(X, len(x))


def guardar(nombre, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.7
    est = np.stack([x, np.roll(x, 40) * 0.95], 1)
    with wave.open(os.path.join(salida, nombre + ".wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((est * 32767).astype(np.int16).tobytes())


# 1. Chillido de banda: tono agudo que oscila (banda que patina), con armónicos.
t = t_(0.9)
f = 2300 + 250 * np.sin(2 * np.pi * 7 * t) + 400 * t
fase = 2 * np.pi * np.cumsum(f) / SR
x = np.sin(fase) + 0.5 * np.sin(2 * fase) + 0.25 * np.sin(3.01 * fase)
x *= np.minimum(1, t / 0.08) * (0.7 + 0.3 * np.sin(2 * np.pi * 3 * t)) * np.minimum(1, (0.9 - t) / 0.12)
x += 0.08 * pasabanda(rng.standard_normal(len(t)), 2500, 900)
guardar("chillido-banda", x)

# 2. Clic de homocinética: golpecitos metálicos rítmicos (~7 por segundo).
t = t_(1.0)
x = np.zeros_like(t)
for k, inicio in enumerate(np.arange(0.02, 0.95, 0.14)):
    i = int(inicio * SR)
    n = int(0.05 * SR)
    tt = np.arange(n) / SR
    golpe = rng.standard_normal(n) * np.exp(-tt * 140) + 0.8 * np.sin(2 * np.pi * 1900 * tt) * np.exp(-tt * 90)
    x[i : i + n] += golpe * (0.8 + 0.2 * (k % 2))
x = pasabanda(x, 2200, 1500)
guardar("clic-homocinetica", x)

# 3. Golpe de suspensión: "clonc" grave con un poco de metal, dos veces.
t = t_(0.9)
x = np.zeros_like(t)
for inicio, fuerza in ((0.0, 1.0), (0.38, 0.7)):
    i = int(inicio * SR)
    tt = t[: len(t) - i]
    golpe = (np.sin(2 * np.pi * (70 + 60 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 12)
             + 0.35 * np.sin(2 * np.pi * 870 * tt) * np.exp(-tt * 25)
             + 0.3 * rng.standard_normal(len(tt)) * np.exp(-tt * 60))
    x[i:] += golpe * fuerza
guardar("golpe-suspension", x)

# 4. Zumbido de balero: zumbido grave que sube con la velocidad + ruido de rodamiento.
t = t_(1.1)
f = 90 + 90 * (t / 1.1) ** 1.3
fase = 2 * np.pi * np.cumsum(f) / SR
x = np.sin(fase) + 0.6 * np.sin(2 * fase) + 0.4 * np.sin(3 * fase) + 0.25 * np.sin(5 * fase)
x *= (1 + 0.25 * np.sin(2 * np.pi * 11 * t))
x += 0.35 * pasabanda(rng.standard_normal(len(t)), 400, 250)
x *= np.minimum(1, t / 0.15) * (0.5 + 0.5 * t / 1.1) * np.minimum(1, (1.1 - t) / 0.1)
guardar("zumbido-balero", x)

# 5. Rechinido de frenos: chillido metálico muy agudo + raspado de metal contra metal.
t = t_(1.0)
f = 3900 + 180 * np.sin(2 * np.pi * 5 * t)
fase = 2 * np.pi * np.cumsum(f) / SR
chillido = np.sin(fase) + 0.4 * np.sin(1.5 * fase)
raspado = pasabanda(rng.standard_normal(len(t)), 1800, 1400) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 23 * t)))
x = 0.7 * chillido + 0.9 * raspado
x *= np.minimum(1, t / 0.06) * np.minimum(1, (1.0 - t) / 0.15)
guardar("rechinido-frenos", x)
print("ruidos listos en", salida)
