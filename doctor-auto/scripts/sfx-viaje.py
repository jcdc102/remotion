# Efectos del video «viaje» (síntesis, sin archivos externos). Uso: python3 scripts/sfx-viaje.py
import numpy as np, wave, os
R = 44100
O = "public/sfx/viaje"
os.makedirs(O, exist_ok=True)
rng = np.random.default_rng(7)
def guardar(n, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.89
    s = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(f"{O}/{n}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes(s.tobytes())
def t(d): return np.arange(int(R * d)) / R
def filtro(x, a):  # paso bajo de un polo
    y = np.zeros_like(x); p = 0
    for i, v in enumerate(x): p += a * (v - p); y[i] = p
    return y
def env(d, at, rel):
    tt = t(d); return np.minimum(1, tt / at) * np.clip((d - tt) / rel, 0, 1)
# Aire de llanta: siseo agudo
d = 0.9; n = rng.standard_normal(len(t(d))); x = n - filtro(n, 0.25); guardar("aire", x * env(d, 0.03, 0.4))
# Glu-glu: burbujas (senos con barrido rápido)
d = 1.0; x = np.zeros(len(t(d)))
for k in range(7):
    s = int(R * (0.05 + k * 0.13)); L = int(R * 0.09); tt = np.arange(L) / R
    f = 260 + 140 * rng.random(); x[s:s+L] += np.sin(2*np.pi*(f*tt + 900*tt**2)) * np.exp(-tt * 30)
guardar("glu", x)
# Hielo: crujidos (clics filtrados aleatorios) + brillo
d = 1.0; x = np.zeros(len(t(d)))
for k in range(60):
    s = int(rng.random() * (len(x) - 400)); L = 300; x[s:s+L] += rng.standard_normal(L) * np.exp(-np.arange(L) / 40) * rng.random()
x = x - filtro(x, 0.3); x += 0.15 * np.sin(2*np.pi*3200*t(d)) * np.exp(-t(d) * 4) * np.sin(2*np.pi*7*t(d))
guardar("hielo", x * env(d, 0.01, 0.3))
# Marcha que no arranca: rr-rr-rr que se debilita y clic final
d = 1.6; tt = t(d); f = 18 * (1 - 0.35 * tt / d)
ciclo = 0.5 + 0.5 * np.sign(np.sin(2*np.pi*np.cumsum(f)/R))
mot = (np.sin(2*np.pi*110*tt) + 0.6*np.sin(2*np.pi*220*tt) + 0.4*rng.standard_normal(len(tt))) * ciclo
mot = filtro(mot, 0.2) * np.clip(1.3 - tt / 1.2, 0, 1) * env(d, 0.02, 0.3)
c = np.zeros(len(tt)); s = int(R * 1.35); c[s:s+600] = rng.standard_normal(600) * np.exp(-np.arange(600) / 60) * 2
guardar("marcha-falla", mot + c)
# Lluvia: ruido rosa suave con gotas (3 s, en loop)
d = 3.0; n = rng.standard_normal(len(t(d))); x = filtro(n, 0.08) * 3 + (n - filtro(n, 0.5)) * 0.25
for k in range(140):
    s = int(rng.random() * (len(x) - 300)); x[s:s+300] += rng.standard_normal(300) * np.exp(-np.arange(300) / 30) * 0.8
guardar("lluvia", x)
# Trueno: retumbe grave
d = 2.2; n = rng.standard_normal(len(t(d))); x = filtro(filtro(n, 0.01), 0.02)
x *= np.exp(-t(d) * 1.6) * (1 + 0.6 * np.sin(2*np.pi*3*t(d))); x[:int(R*0.06)] += rng.standard_normal(int(R*0.06)) * 0.02
guardar("trueno", x * env(d, 0.02, 0.6))
# Limpiador: barrido de goma (ruido filtrado con resonancia que sube y baja)
d = 0.55; tt = t(d); n = rng.standard_normal(len(tt)); a = 0.05 + 0.25 * np.sin(np.pi * tt / d)
y = np.zeros_like(n); p = 0
for i, v in enumerate(n): p += a[i] * (v - p); y[i] = p
y += 0.3 * np.sin(2*np.pi*(180 + 120*np.sin(np.pi*tt/d))*tt) * np.sin(np.pi*tt/d)
guardar("limpiador", y * env(d, 0.03, 0.12))
# Shimmer premium para transformaciones (campanitas suaves)
d = 0.9; tt = t(d); x = sum(np.sin(2*np.pi*f*tt) * np.exp(-tt*(5 + k)) for k, f in enumerate([1568, 2093, 2637, 3136]))
x *= np.clip(tt / 0.01, 0, 1); guardar("brillo", x)
print("ok", sorted(os.listdir(O)))
