"""Quita el fondo verde sólido de una imagen (chroma key) y guarda un PNG transparente.

Uso: python3 scripts/quitar-fondo.py entrada.png salida.png

- Toma el color de llave de los bordes de la imagen.
- Calcula la transparencia por distancia de croma (Cb/Cr), con borde suave.
- Quita el reflejo verde ("spill") en la franja del contorno.
- Recorta a lo visible y avisa si quedan píxeles verdes.
"""
import sys

import numpy as np
from PIL import Image, ImageFilter

entrada, salida = sys.argv[1], sys.argv[2]
img = np.asarray(Image.open(entrada).convert("RGB")).astype(np.float32)
alto, ancho, _ = img.shape


def croma(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    cb = -0.168736 * r - 0.331264 * g + 0.5 * b
    cr = 0.5 * r - 0.418688 * g - 0.081312 * b
    return cb, cr


borde = np.concatenate([img[0], img[-1], img[:, 0], img[:, -1]])
llave = np.median(borde, axis=0)
cb, cr = croma(img)
cbk, crk = croma(llave[None, None, :])
dist = np.sqrt((cb - cbk) ** 2 + (cr - crk) ** 2)
alfa = np.clip((dist - 28) / (60 - 28), 0, 1)

# Encoge 1 px el borde para eliminar el halo y suaviza la orilla.
mascara = Image.fromarray((alfa * 255).astype(np.uint8))
mascara = mascara.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
alfa = np.asarray(mascara).astype(np.float32) / 255

# Quita el verde en la franja del contorno (hasta 6 px del fondo).
fondo = Image.fromarray(((alfa < 0.5) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(13))
franja = (np.asarray(fondo) > 0) & (alfa > 0)
r, g, b = img[..., 0], img[..., 1], img[..., 2]
limite = np.maximum(r, b)
img[..., 1] = np.where(franja & (g > limite), limite, g)

rgba = np.dstack([img, alfa * 255]).clip(0, 255).astype(np.uint8)
salida_img = Image.fromarray(rgba, "RGBA")
caja = salida_img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
if caja:
    x0, y0, x1, y1 = caja
    pad = 6
    salida_img = salida_img.crop((max(0, x0 - pad), max(0, y0 - pad), min(ancho, x1 + pad), min(alto, y1 + pad)))
salida_img.save(salida)

a = np.asarray(salida_img).astype(np.int32)
verdes = int(((a[..., 3] > 25) & (a[..., 1] > np.maximum(a[..., 0], a[..., 2]) + 30) & (a[..., 1] > 90)).sum())
print(f"llave RGB={llave.astype(int).tolist()} tamaño={salida_img.size} píxeles verdes visibles={verdes}")
