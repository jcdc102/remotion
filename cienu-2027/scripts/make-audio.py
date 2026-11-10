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


# Reggaeton / moombahton at 120 BPM in A minor: Am - F - C - G, one chord per bar
prog = [
    (33, [57, 60, 64]),
    (29, [57, 60, 65]),
    (36, [55, 60, 64]),
    (31, [55, 59, 62]),
    (33, [57, 60, 64]),
    (29, [57, 60, 65]),
    (36, [55, 60, 64]),
    (33, [57, 60, 64]),
]
# Catchy hook in 16th steps per bar: (step, midi, length in steps)
hook = [
    [(0, 76, 2), (3, 76, 1), (6, 74, 2), (8, 72, 2), (11, 74, 1), (14, 76, 2)],
    [(0, 77, 2), (3, 76, 1), (6, 74, 2), (8, 72, 4), (14, 69, 2)],
    [(0, 72, 2), (3, 72, 1), (6, 74, 2), (8, 76, 2), (11, 79, 1), (14, 76, 2)],
    [(0, 74, 2), (3, 74, 1), (6, 71, 2), (8, 74, 3), (12, 79, 4)],
]
S16 = BEAT / 4


def sub808(n, length, glide_to=None):
    t = np.arange(int(length * SR)) / SR
    f0 = note_hz(n)
    f = np.full_like(t, f0)
    if glide_to is not None:
        g = np.clip((t - (length - 0.08)) / 0.08, 0, 1)
        f = f0 * (note_hz(glide_to) / f0) ** g
    ph = 2 * np.pi * np.cumsum(f) / SR
    a = np.minimum(t / 0.005, 1) * np.clip((length - t) / 0.02, 0, 1) * (0.6 + 0.4 * np.exp(-t / 0.4))
    return np.tanh(2.2 * np.sin(ph)) * a


def lead(n, length):
    t = np.arange(int(length * SR)) / SR
    f = note_hz(n) * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(t / 0.15, 1))
    ph = np.cumsum(f) / SR
    saw = sum((-1) ** (k + 1) * np.sin(2 * np.pi * k * ph) / k for k in range(1, 9))
    sq = np.sign(np.sin(2 * np.pi * ph)) * 0.3
    a = np.minimum(t / 0.006, 1) * np.exp(-t / 0.35) * np.clip((length - t) / 0.03, 0, 1)
    return (saw + sq) * a


def snare():
    e, t = env(0.18, 0.045, 0.001)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.03)
    return highpass(rng.standard_normal(len(t)), 1500) * e * 0.8 + body * 0.6


def openhat():
    e, t = env(0.25, 0.08, 0.001)
    return highpass(rng.standard_normal(len(t)), 8000) * e


mel = np.zeros(N)
bas = np.zeros(N)
drm = np.zeros(N)
pds = np.zeros(N)
side = np.ones(N)  # sidechain pump for pads and lead

DROP = 8 * BEAT  # frame 120


def pump(t):
    i = int(t * SR)
    L = int(0.22 * SR)
    seg = side[i : i + L]
    curve = 0.35 + 0.65 * (np.arange(len(seg)) / L) ** 0.6
    side[i : i + len(seg)] = np.minimum(seg, curve)


for bar, (root, chord) in enumerate(prog):
    t0 = bar * 4 * BEAT
    last = bar == len(prog) - 1
    intro = t0 < DROP

    # Pad (filtered in the intro, open after the drop)
    p = pad([c + 12 for c in chord], min(4 * BEAT + 0.1, DUR - t0))
    if intro:
        p = lowpass(p, 500 + 600 * bar)
    add(pds, p, t0)

    if last:
        add(mel, lead(81, 1.4) * 0.7, t0 + BEAT)
        add(bas, sub808(root, 1.5), t0 + BEAT)
        add(drm, kick() * 1.1, t0 + BEAT)
        add(drm, snare() * 0.6, t0 + BEAT)
        add(drm, openhat() * 0.4, t0 + BEAT)
        continue

    if intro:
        # Intro: hook played softly an octave down, plus claps building up
        for st, n, ln in hook[bar % 4]:
            add(mel, lead(n - 12, ln * S16 + 0.05) * 0.35, t0 + st * S16)
        if bar == 1:
            # Snare roll that speeds up into the drop
            steps = list(range(0, 8, 2)) + list(range(8, 14)) + [14, 14.5, 15, 15.5]
            for i, st in enumerate(steps):
                if st >= 15:  # short gap right before the drop
                    break
                add(drm, snare() * (0.15 + 0.5 * i / len(steps)), t0 + st * S16)
        else:
            for b in (1, 3):
                add(drm, clap() * 0.3, t0 + b * BEAT)
        continue

    # Drop: dembow + 808 + hook
    for b in range(4):
        tb = t0 + b * BEAT
        add(drm, kick() * 1.1, tb)
        pump(tb)
        add(drm, hat(0.05) * 0.3, tb + 2 * S16)
        if b % 2 == 0:
            add(drm, snare() * 0.55, tb + 3 * S16)
        else:
            add(drm, snare() * 0.55, tb + 2 * S16)
        add(drm, hat(0.03) * 0.12, tb + 1 * S16)
        add(drm, hat(0.03) * 0.12, tb + 3 * S16)
    add(drm, openhat() * 0.3, t0 + 3.5 * BEAT)
    # Trap-style hi-hat roll at the end of every other bar
    if bar % 2 == 1:
        for k in range(6):
            add(drm, hat(0.025) * 0.18, t0 + 3 * BEAT + BEAT / 2 + k * BEAT / 12)

    nxt = prog[bar + 1][0] if bar + 1 < len(prog) else None
    add(bas, sub808(root, 2.4 * BEAT), t0)
    add(bas, sub808(root, 1.5 * BEAT, glide_to=nxt), t0 + 2.5 * BEAT)

    for st, n, ln in hook[bar % 4]:
        add(mel, lead(n, ln * S16 + 0.05) * 0.8, t0 + st * S16)
        add(mel, lead(n + 12, ln * S16 + 0.05) * 0.18, t0 + st * S16)

pds *= side
mel_p = mel * (0.6 + 0.4 * side)
music = 0.32 * mel_p + 0.45 * bas + 0.6 * drm + 0.16 * pds
t = np.arange(N) / SR
music *= np.clip((DUR - t) / 1.0, 0, 1)
music = np.tanh(music * 1.4) / 1.4  # gentle saturation / glue


def save(name, x, peak=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    data = (x * 32767).astype(np.int16)
    stereo = np.repeat(data[:, None], 2, axis=1)
    with wave.open(name, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(stereo.tobytes())


save('public/music.wav', music, 0.9)

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
