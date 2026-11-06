# Corta una toma única de ElevenLabs en un clip por línea del guion, usando los
# tiempos por palabra de la transcripción (words.json de ElevenLabs Scribe).
# Cada corte cae en el punto más silencioso entre la última palabra de una línea y
# la primera de la siguiente. Uso:
#   python3 scripts/cortar-por-palabras.py <tema> <toma.mp3> <words.json>
import json, re, subprocess, sys, wave, array
tema, toma, palabras_f = sys.argv[1:4]
guion = json.load(open(f"src/estructura8/{tema}/guion.json", encoding="utf-8"))
lineas = [(c["id"], c["texto"]) for p in guion["piezas"] for c in p["clips"]]
norm = lambda s: re.sub(r"[^a-záéíóúñü0-9]", "", s.lower())
palabras = [w for w in json.load(open(palabras_f))["words"] if w.get("type", "word") == "word" and not w["text"].startswith("[") and not w["text"].endswith("]") and norm(w["text"])]
# Reparte las palabras de la transcripción entre las líneas (en orden).
k = 0
rangos = []
for cid, texto in lineas:
    n = len([w for w in texto.split() if norm(w)])
    grupo = palabras[k : k + n]
    esperadas = [norm(w) for w in texto.split() if norm(w)]
    if [norm(w["text"]) for w in grupo] != esperadas:
        print(f"AVISO {cid}: transcripción {[w['text'] for w in grupo]} ≠ guion {texto}")
    rangos.append((cid, grupo[0]["start"], grupo[-1]["end"]))
    k += n
# Audio a muestras para buscar el punto más silencioso.
tmp = "/tmp/claude-0/-home-user-remotion/7f8bfb28-f828-58c8-ab18-e845e5c68f93/scratchpad/toma.wav"
subprocess.run(["ffmpeg", "-nostdin", "-y", "-loglevel", "error", "-i", toma, "-ac", "1", "-ar", "16000", tmp], check=True)
w = wave.open(tmp); muestras = array.array("h", w.readframes(w.getnframes())); R = 16000
dur = len(muestras) / R
def mas_quieto(a, b):
    paso = int(0.01 * R); mejor, tm = None, (a + b) / 2
    i = int(a * R)
    while i + paso <= int(b * R):
        e = sum(abs(x) for x in muestras[i : i + paso])
        if mejor is None or e < mejor: mejor, tm = e, (i + paso / 2) / R
        i += paso
    return tm
cortes = [0.0]
for (_, _, fin), (_, ini, _) in zip(rangos, rangos[1:]):
    cortes.append(mas_quieto(min(fin, ini) - 0.03, max(ini, fin) + 0.03) if ini - fin < 0.06 else mas_quieto(fin, ini))
cortes.append(dur)
def bordes_voz(a, b):
    # Primer y último instante con voz dentro de [a, b] (silencedetect a -40 dB).
    out = subprocess.run(["ffmpeg", "-nostdin", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", toma, "-af", "silencedetect=n=-40dB:d=0.08", "-f", "null", "-"], capture_output=True, text=True).stderr
    ini = [float(x) for x in re.findall(r"silence_start: ([-\d.]+)", out)]
    fin = [float(x) for x in re.findall(r"silence_end: ([-\d.]+)", out)]
    largo = b - a
    v0, v1 = 0.0, largo
    if ini and ini[0] <= 0.02 and fin: v0 = fin[0]
    if ini and (len(fin) < len(ini) or fin[-1] >= largo - 0.02): v1 = ini[-1]
    return a + max(0.0, v0 - 0.05), a + min(largo, v1 + 0.06)
for i, (cid, ini, fin) in enumerate(rangos):
    a, b = bordes_voz(cortes[i], cortes[i + 1])
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-loglevel", "error", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", toma,
                    "-af", "afade=t=in:d=0.012,areverse,afade=t=in:d=0.02,areverse", "-ar", "44100", "-ac", "2", "-c:a", "libmp3lame", "-q:a", "2",
                    f"public/audio/{tema}/{cid}.mp3"], check=True)
    print(f"{cid}: {a:6.2f}–{b:6.2f} ({b - a:4.2f} s)  voz {ini:.2f}–{fin:.2f}")
