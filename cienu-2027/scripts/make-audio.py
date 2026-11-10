"""Synthesizes the background music and extra SFX for the CIENU video.

120 BPM so one beat = 15 frames at 30 fps. The drop lands on beat 8 (frame 120),
right after "Convocatoria" is revealed. Run: python3 scripts/make-audio.py
"""
import wave
import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
DUR = 16.0
N = int(SR * DUR)
rng = np.random.default_rng(7)


def note_hz(n):  # MIDI -> Hz
    return 440 * 2 ** ((n - 69) / 12)


def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def highpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (cutoff / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X, len(x))


def add(buf, sig, t):
    i = int(t * SR)
    if i >= len(buf):
        return
    sig = sig[: len(buf) - i]
    buf[i : i + len(sig)] += sig


def env(length, decay, attack=0.004):
    t = np.arange(int(length * SR)) / SR
    return np.minimum(t / attack, 1) * np.exp(-t / decay), t


def marimba(n, length=0.6):
    e, t = env(length, 0.16)
    f = note_hz(n)
    return e * (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.03))


def bass(n, length=0.42):
    e, t = env(length, 0.18, 0.006)
    f = note_hz(n)
    return e * (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t))


def kick():
    e, t = env(0.35, 0.12, 0.001)
    freq = 50 + 110 * np.exp(-t / 0.03)
    return e * np.sin(2 * np.pi * np.cumsum(freq) / SR)


def clap():
    e, t = env(0.2, 0.05, 0.001)
    return highpass(rng.standard_normal(len(t)), 900) * e


def hat(length=0.06):
    e, t = env(length, 0.018, 0.001)
    return highpass(rng.standard_normal(len(t)), 7000) * e


def pad(notes, length):
    t = np.arange(int(length * SR)) / SR
    sig = np.zeros_like(t)
    for n in notes:
        for d in (-0.08, 0.08):
            f = note_hz(n) * 2 ** (d / 12)
            sig += 2 * ((t * f) % 1) - 1
    a = np.minimum(t / 0.25, 1) * np.minimum((length - t) / 0.3, 1)
    return lowpass(sig, 1400) * np.clip(a, 0, 1) / len(notes)


# C - G - Am - F, one chord per bar (4 beats); last bar resolves on C
prog = [
    (48, [60, 64, 67]),
    (43, [59, 62, 67]),
    (45, [60, 64, 69]),
    (41, [60, 65, 69]),
    (48, [60, 64, 67]),
    (43, [59, 62, 67]),
    (41, [60, 65, 69]),
    (48, [60, 64, 67]),
]
arp = [0, 1, 2, 1, 2, 0, 1, 2]  # 8th-note pattern over the chord tones

mel = np.zeros(N)
bas = np.zeros(N)
drm = np.zeros(N)
pds = np.zeros(N)

DROP = 8 * BEAT  # frame 120
for bar, (root, chord) in enumerate(prog):
    t0 = bar * 4 * BEAT
    last = bar == len(prog) - 1
    pds_len = 4 * BEAT + (1.0 if last else 0.1)
    add(pds, pad(chord, min(pds_len, DUR - t0)), t0)
    for k in range(8):
        t = t0 + k * BEAT / 2
        if last and k >= 2:
            break
        n = chord[arp[k]] + 12
        add(mel, marimba(n) * (0.9 if k % 2 == 0 else 0.6), t)
        if t >= DROP and k in (3, 7):  # sparkle notes an octave up
            add(mel, marimba(n + 12) * 0.25, t + BEAT / 4)
    if last:
        add(mel, marimba(72, 1.6) * 1.0, t0 + BEAT)
        add(mel, marimba(79, 1.6) * 0.6, t0 + BEAT)
        add(bas, bass(root, 1.2), t0 + BEAT)
        add(drm, kick(), t0 + BEAT)
        continue
    if t0 >= DROP:
        for k in (0, 1.5, 2, 3.5):  # tropical-house bounce
            add(bas, bass(root + (12 if k in (1.5, 3.5) else 0)), t0 + k * BEAT)
        for b in range(4):
            add(drm, kick() * 1.0, t0 + b * BEAT)
            add(drm, hat() * 0.35, t0 + b * BEAT + BEAT / 2)
            for s in range(4):  # shaker 16ths
                add(drm, hat(0.04) * (0.12 if s % 2 else 0.06), t0 + b * BEAT + s * BEAT / 4)
        add(drm, clap() * 0.45, t0 + 1 * BEAT)
        add(drm, clap() * 0.45, t0 + 3 * BEAT)
    elif bar == 1:  # build into the drop
        for b in range(4):
            add(drm, hat(0.04) * 0.1 * (b + 1), t0 + b * BEAT + BEAT / 2)

music = 0.42 * mel + 0.55 * bas + 0.55 * drm + 0.22 * pds
# Fade out at the end
t = np.arange(N) / SR
music *= np.clip((DUR - t) / 1.2, 0, 1)


def save(name, x, peak=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    data = (x * 32767).astype(np.int16)
    stereo = np.repeat(data[:, None], 2, axis=1)
    with wave.open(name, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(stereo.tobytes())


save('public/music.wav', music, 0.85)

# Riser: noise + rising tone over 1.2 s, ending at the drop
L = 1.2
tt = np.arange(int(L * SR)) / SR
sweep = np.sin(2 * np.pi * np.cumsum(300 + 1500 * (tt / L) ** 2) / SR)
riser = (0.5 * sweep + highpass(rng.standard_normal(len(tt)), 2500)) * (tt / L) ** 2
save('public/sfx/riser.wav', riser, 0.7)

# Impact: deep boom + noise burst
e, tt = env(1.4, 0.35, 0.001)
boom = e * np.sin(2 * np.pi * np.cumsum(40 + 80 * np.exp(-tt / 0.05)) / SR)
burst = lowpass(rng.standard_normal(len(tt)), 3000) * np.exp(-tt / 0.08)
save('public/sfx/impact.wav', boom + 0.4 * burst, 0.9)

# Pop: short bubbly blip for small elements
e, tt = env(0.15, 0.04, 0.001)
pop = e * np.sin(2 * np.pi * np.cumsum(500 + 900 * np.exp(-tt / 0.02)) / SR)
save('public/sfx/pop.wav', pop, 0.8)
print('ok')
