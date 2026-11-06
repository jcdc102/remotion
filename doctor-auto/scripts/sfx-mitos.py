# Efectos del video «mitos» (síntesis). Uso: python3 scripts/sfx-mitos.py
import numpy as np, wave, os
R = 44100; O = "public/sfx/mitos"; os.makedirs(O, exist_ok=True); rng = np.random.default_rng(11)
def guardar(n, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.89
    with wave.open(f"{O}/{n}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
def t(d): return np.arange(int(R * d)) / R
def filtro(x, a):
    y = np.zeros_like(x); p = 0
    for i, v in enumerate(x): p += a * (v - p); y[i] = p
    return y
# Sello: golpe grave + chasquido de goma
d = 0.7; tt = t(d); x = np.sin(2*np.pi*(70 + 90*np.exp(-tt*25))*tt) * np.exp(-tt*9)
n = rng.standard_normal(len(tt)); x += (n - filtro(n, 0.2)) * np.exp(-tt*60) * 0.8; guardar("sello", x)
# Moneda: tintineo metálico
d = 1.0; tt = t(d); x = sum(np.sin(2*np.pi*f*tt) * np.exp(-tt*k) for f, k in [(2950, 5), (4130, 7), (5520, 9), (7380, 12)])
x *= (1 + 0.4*np.sin(2*np.pi*18*tt)); guardar("moneda", x)
# Chorro de gasolina: ruido filtrado con gorgoteo
d = 1.2; tt = t(d); n = rng.standard_normal(len(tt)); x = filtro(n, 0.12) * (1 + 0.5*np.sin(2*np.pi*11*tt + 3*np.sin(2*np.pi*3*tt)))
x *= np.minimum(1, tt/0.05) * np.clip((d-tt)/0.2, 0, 1); guardar("chorro", x)
# Ventila: soplido suave que sube
d = 1.2; tt = t(d); n = rng.standard_normal(len(tt)); x = filtro(n, 0.04) * 4 + (n - filtro(n, 0.6)) * 0.08
x *= np.minimum(1, tt/0.3) * np.clip((d-tt)/0.3, 0, 1); guardar("ventila", x)
# Goteo: tres gotas
d = 1.0; x = np.zeros(len(t(d)))
for k, s in enumerate([0.05, 0.4, 0.75]):
    L = int(R*0.12); tt = np.arange(L)/R; i = int(R*s); x[i:i+L] += np.sin(2*np.pi*(900 + 1400*tt/0.12)*tt) * np.exp(-tt*40)
guardar("goteo", x)
# Zumbador "mito": dos tonos graves disonantes
d = 0.55; tt = t(d); x = np.sign(np.sin(2*np.pi*155*tt)) * 0.5 + np.sign(np.sin(2*np.pi*163*tt)) * 0.5
x = filtro(x, 0.25) * np.minimum(1, tt/0.01) * np.clip((d-tt)/0.08, 0, 1); guardar("zumbador", x)
# Acierto "realidad": arpegio brillante
d = 0.9; x = np.zeros(len(t(d)))
for k, f in enumerate([1047, 1319, 1568, 2093]):
    i = int(R*k*0.07); L = len(x) - i; tt = np.arange(L)/R; x[i:] += np.sin(2*np.pi*f*tt) * np.exp(-tt*5) * 0.6
guardar("acierto", x)
print(sorted(os.listdir(O)))
