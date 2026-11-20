import datetime as dt
import json
import sys

import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule

files = json.load(open(sys.argv[1]))
OUT = sys.argv[2]

FOLDER = {
    'resumen5preg': '1G-Ur965vuYBGyazH6gFIHSGJ2muN5SqM',
    '5pasos': '1qwqyH3QgDpcVtd6j09Kzozm5rW0hYttm',
    'glosario': '1gzuYiIPclU2bQ6XpJ0XMIVWOussTTug8',
    'lemas': '1KDWmFnxHpwokLcwVWYC-c3rTk2ARScU1',
    'noia': '18k8jmwAsqTyIGA1-RsJg4SUqdzG_763a',
    'mitos': '1XbpGo2WZhXouqBnfO5aYDc-yGjipD35G',
    'modalidad': '1qH7BFd-DkBWDCLWAFld7u5WKu8S7-vlF',
    'tutorial': '1XlRVN7s67oVi5eA4vneIWpU_VBP0v_Lp',
    '3pasos': '1owK-zu2v98yIlUuC8wURFcpB0SBEkTio',
    'quees': '16BoGHbKg3nSNd9x3IdywxUlcpLn7LCNe',
    'reels': '17CbFGe1eIAwF16j3C1sciby-pCYRBfX0',
    'raiz': '1qnBwNrbYJ1QYTgIFs3U2zh3c8117oU03',
}


def flink(i):
    return f'https://drive.google.com/file/d/{files[i]["id"]}/view'


def dlink(k):
    return f'https://drive.google.com/drive/folders/{FOLDER[k]}'


URL = 'https://cienu.cuc.udg.mx/convocatoria'
HT = '#CIENU2027 #IAenEducación #RIDMAE'
HTP = '#PreguntaCIENU #CIENU2027 #IAenEducación'

E1 = 'Tu ponencia, paso a paso'
E2 = 'La red que comparte'
E3 = 'Universidades aliadas'
E4 = 'Vallarta te espera'
E5 = 'IA en el aula'
E6 = 'Contenido RIDMAE'

LISTO = 'Video listo (convocatoria / ejes). Subir a Drive.'
VIDEO = 'Video por producir a partir del arte. Si no está listo, publicar el arte como imagen/carrusel.'
DISENAR = 'Arte por diseñar.'
EDITAR = 'Reel por editar: recorte 20-30 s, subtítulos, gancho y cierre CIENU.'


def preg(n, q, eje):
    return (
        f'{q} 🤔\n\nPregunta de la semana #{n:02d}. Te leemos en comentarios 👇 '
        f'Compartimos las mejores respuestas el viernes.\n\n'
        f'¿Ya tienes tu tema para el CIENU 2027? Resúmenes hasta el 16 de enero: {URL}\n\n{HTP}'
    )


# (fecha, hora, arte, formato, eje, copy, notas)
D = dt.date
rows = [
    (D(2026, 11, 21), '12:00', flink(47), 'Reel', E6,
     'Detrás del CIENU hay una red de docentes e investigadores de México, América Latina, Andorra y España 🤝\n\n'
     'RIDMAE, CUCosta y CUAltos de la Universidad de Guadalajara organizamos la 6.ª edición del Congreso Internacional de Enseñanza Universitaria. '
     '¡Nos vemos del 9 al 12 de junio de 2027 en Puerto Vallarta!\n\n' + HT,
     'Arte de RIDMAE («Organizamos el CIENU»). ' + VIDEO),
    (D(2026, 11, 23), '13:00', flink(49) + '\n' + flink(50), 'Reel + Historia', E5,
     preg(1, '¿La IA va a cambiar tu forma de evaluar?', E5),
     'S01. Feed + historia con sticker de preguntas. Nota: la serie cae en lunes (renombrar «Miércoles de preguntas»). ' + VIDEO),
    (D(2026, 11, 23), '19:00', 'Video «Convocatoria CIENU 2027» (Remotion)', 'Reel', E1,
     '¡Ya está publicada la convocatoria del CIENU 2027! 🎉\n\n'
     '«Educación en la era de la inteligencia artificial: desafíos de la docencia, las profesiones y el conocimiento».\n'
     '📅 9 al 12 de junio de 2027\n📍 Puerto Vallarta, Jalisco (CUCosta, UdeG) · presencial y virtual\n'
     '📝 Envía tu resumen hasta el 16 de enero de 2027\n\n'
     f'Consulta las bases 👉 {URL}\n\n#YoPresentoEnCIENU ' + HT,
     LISTO + ' Fijar en la parte superior de la página.'),
    (D(2026, 11, 24), '13:00', flink(48), 'Historia', E2,
     '¿Desde dónde nos lees? 🌎 México, América Latina, Andorra, España… cuéntanos tu país y tu institución.',
     'Historia con sticker de encuesta/preguntas.'),
    (D(2026, 11, 24), '19:00', dlink('quees') + '\n+ ' + flink(78), 'Reel', E1,
     '¿Qué es el CIENU? 🎓 Te lo contamos en 5 láminas: quién lo organiza, para quién es y el tema 2027.\n\n'
     'Un encuentro para quienes enseñan, investigan y aprenden. Presencial en Puerto Vallarta o en línea desde tu país.\n\n'
     f'Resúmenes hasta el 16 de enero 👉 {URL}\n\n' + HT,
     'Carrusel de 5 láminas (la 5 está en «post de facebook»). ' + VIDEO),
    (D(2026, 11, 25), '13:00', flink(77), 'Reel', E1,
     'Si enseñas, investigas o aprendes, hay un lugar para ti en el CIENU 2027 🙌\n\n'
     '✅ Docentes de media superior y superior\n✅ Investigadoras e investigadores\n✅ Estudiantes de posgrado\n✅ Profesionales de la educación\n\n'
     f'De todas las disciplinas, nacionales e internacionales. Presencial o virtual.\n👉 {URL}\n\n' + HT,
     VIDEO),
    (D(2026, 11, 25), '19:00', 'Portada «EN VIVO» (por diseñar)', 'Imagen', E1,
     '🔴 MAÑANA EN VIVO · Jueves 26 de noviembre, 7:00 pm (hora del centro de México)\n\n'
     '«Cómo participar en el CIENU 2027»: convocatoria, ejes temáticos y cómo registrar tu resumen paso a paso. '
     'Trae tus dudas, las respondemos en vivo.\n\nActiva el recordatorio 🔔\n\n' + HT,
     DISENAR + ' Programar el evento en StreamYard/Facebook para que genere la liga de recordatorio.'),
    (D(2026, 11, 26), '09:00', flink(41), 'Imagen', E6,
     'Enseñar en la era de la inteligencia artificial también es aprender a hacer mejores preguntas. ✨\n\n¿Tú qué pregunta te haces hoy? 👇\n\n' + HT,
     'Frase de reflexión (RIDMAE). Hay dos archivos iguales en «FRASES».'),
    (D(2026, 11, 26), '19:00', 'Transmisión en vivo', 'Live', E1,
     '🔴 ¡Estamos EN VIVO! Resolvemos tus dudas sobre el CIENU 2027 y te mostramos cómo registrar tu resumen. Escríbenos tus preguntas en comentarios 👇\n\n' + HT,
     'Live 1. Después: cortar clips de preguntas frecuentes para reels.'),
    (D(2026, 11, 27), '13:00', flink(42), 'Historia', E5,
     '¿Usas IA en tus clases? Sí · No · A veces. Compartiremos los resultados.',
     'Historia con sticker de encuesta encima del recuadro guía.'),
    (D(2026, 11, 27), '19:00', flink(92), 'Reel', E1,
     'Cargando tu resumen… ⏳ Faltan 50 días para terminar de escribirlo.\n\n'
     f'Tu lugar en el CIENU 2027 empieza con un resumen de 200 a 250 palabras. Cierre: 16 de enero 👉 {URL}\n\n' + HT,
     VIDEO),
    (D(2026, 11, 28), '12:00', flink(94), 'Reel', E1,
     'Faltan 7 semanas para enviar tu resumen al CIENU 2027 🗓️\n\n'
     f'Empieza a escribirlo hoy. Consulta las bases 👉 {URL}\n\n' + HT,
     'Arte RIDMAE «Faltan 7 semanas» (hay otra versión en la misma carpeta). ' + VIDEO),
    (D(2026, 11, 30), '13:00', flink(51) + '\n' + flink(52), 'Reel + Historia', E5,
     preg(2, '¿Qué profesión se transformará primero con la IA?', E5), 'S02. ' + VIDEO),
    (D(2026, 11, 30), '19:00', 'Video «Ejes temáticos» con voz (Remotion)', 'Reel', E1,
     '¿Sobre qué puedes presentar en el CIENU 2027? 🧭 Hay 6 ejes temáticos y la IA atraviesa todos.\n\n'
     '1️⃣ Transformación de las profesiones\n2️⃣ Innovación curricular\n3️⃣ IA, innovación docente y evaluación\n'
     '4️⃣ Bienestar, inclusión y acompañamiento\n5️⃣ Investigación y transformación social\n6️⃣ Calidad, políticas y gobernanza\n\n'
     f'¿Cuál es el tuyo? 👇 Bases 👉 {URL}\n\n' + HT,
     LISTO),
    (D(2026, 12, 1), '19:00', dlink('3pasos'), 'Reel', E1,
     'Así de fácil: envía tu resumen en 3 pasos ✍️\n\n1️⃣ Regístrate en el gestor\n2️⃣ Elige tu modalidad: presencial o virtual\n3️⃣ Envía tu resumen antes del 16 de enero\n\n'
     'Gestor: https://cienu-cualtos.udg.mx · Dudas: cienu@cualtos.udg.mx\n\n' + HT,
     VIDEO),
    (D(2026, 12, 2), '19:00', dlink('mitos'), 'Reel', E1,
     '3 ideas que no deberían detenerte 🚫\n\n❌ «El CIENU es solo para investigadores»\n❌ «Si no vivo en México no puedo participar»\n❌ «Si no trabajo con IA, mi tema no cabe»\n\n'
     f'✅ La realidad, en el carrusel. Antes de decir «no es para mí», desliza 👉 {URL}\n\n' + HT,
     VIDEO),
    (D(2026, 12, 3), '19:00', dlink('modalidad'), 'Reel', E4,
     '¿Presencial o virtual? Las dos cuentan 💚❤️\n\n📍 Vive el CIENU en Puerto Vallarta: conoce el CUCosta y la ciudad, conversa cara a cara con colegas de varios países.\n'
     f'💻 O participa desde donde estés, sin gastos de viaje.\n\n👉 {URL}\n\n' + HT,
     VIDEO),
    (D(2026, 12, 4), '13:00', flink(46), 'Historia', E4,
     '¿Cómo vivirás el CIENU 2027? Presencial en Puerto Vallarta o virtual desde tu pantalla.',
     'Historia con sticker de encuesta.'),
    (D(2026, 12, 4), '19:00', flink(79), 'Reel', E4,
     'Nos vemos en Puerto Vallarta 🌅\n\n9 al 12 de junio de 2027 · CUCosta o en línea.\nPresenta tu ponencia frente al mar y quédate el fin de semana: el congreso termina el sábado 12.\n\n'
     f'Resúmenes hasta el 16 de enero 👉 {URL}\n\n#VallartaTeEspera ' + HT,
     'Foto de edición pasada. ' + VIDEO),
    (D(2026, 12, 5), '12:00', flink(84), 'Reel', E2,
     'Así se vive una ponencia en el CIENU 🎤 Ideas, preguntas y colegas que se vuelven red.\n\n¿Te imaginas presentando la tuya? 👇\n\n#YoPresentoEnCIENU ' + HT,
     EDITAR + ' (v3_reel2, 67 s).'),
    (D(2026, 12, 7), '13:00', flink(53) + '\n' + flink(54), 'Reel + Historia', E5,
     preg(3, '¿Se debería permitir usar IA en los exámenes?', E5), 'S03. ' + VIDEO),
    (D(2026, 12, 8), '19:00', dlink('tutorial'), 'Reel', E1,
     'Tutorial: envía tu resumen paso a paso en el gestor 💻\n\nTe mostramos cada pantalla: crear tu cuenta, verificar tu correo, elegir modalidad y enviar.\n\n'
     'Guárdalo para cuando lo vayas a hacer 📌\nGestor: https://cienu-cualtos.udg.mx\n\n' + HT,
     'Tutorial de 9 láminas. Ideal como video con voz en off (también para YouTube). ' + VIDEO),
    (D(2026, 12, 9), '19:00', dlink('glosario'), 'Reel', E5,
     'Glosario de IA para docentes · Vol. 1 📚\n\nPrompt, alucinación e IA generativa: tres términos que vas a escuchar en todas partes.\n\n¿Qué término agregamos al Vol. 2? 👇\n\n' + HT,
     VIDEO),
    (D(2026, 12, 10), '19:00', flink(80), 'Reel', E4,
     'Un congreso, dos formas de estar 🎓\n\n📍 Presencial en Puerto Vallarta\n💻 En línea, desde tu pantalla\n\n'
     f'Tú eliges. Envía tu resumen hasta el 16 de enero 👉 {URL}\n\n' + HT,
     VIDEO),
    (D(2026, 12, 11), '19:00', dlink('resumen5preg'), 'Reel', E1,
     '¿Te bloqueas al escribir tu resumen? ✍️ Respóndete estas 5 preguntas y tendrás tu primer borrador:\n\n'
     '1. ¿Qué problema o pregunta abordas?\n2. ¿Qué hiciste o propusiste?\n3. ¿Qué encontraste o aprendiste?\n4. ¿Por qué le importa a otros docentes?\n5. ¿En qué eje temático encaja?\n\n'
     f'Cierre: 16 de enero 👉 {URL}\n\n' + HT,
     VIDEO),
    (D(2026, 12, 13), '12:00', flink(9), 'Reel', E5,
     'Los desafíos de… la docencia 👩‍🏫 ¿Cómo enseñamos y evaluamos cuando la IA ya está en el aula?\n\n'
     'Ejes relacionados: IA, innovación docente y evaluación del aprendizaje · Innovación curricular.\n\n' + HT,
     'Lema 1 de 3. ' + VIDEO),
    (D(2026, 12, 14), '13:00', flink(55) + '\n' + flink(56), 'Reel + Historia', E5,
     preg(4, '¿Qué enseñas que ninguna IA puede reemplazar?', E5), 'S04. ' + VIDEO),
    (D(2026, 12, 15), '19:00', dlink('noia'), 'Reel', E5,
     'Lo que la IA (todavía) no puede hacer por ti 💡\n\n01 Conocer a tus estudiantes por su nombre\n02 Leer el silencio de un salón\n03 Inspirar a alguien a quedarse en la carrera\n'
     f'04 Presentar tu experiencia en el CIENU 2027\n\nEso solo lo puedes hacer tú 👉 {URL}\n\n' + HT,
     VIDEO),
    (D(2026, 12, 16), '19:00', dlink('5pasos'), 'Reel', E1,
     'Todo el proceso del CIENU 2027 en 5 pasos 🗺️\n\n1️⃣ Elige tu eje y tipo de contribución\n2️⃣ Registra tu resumen · hasta el 16 de enero\n3️⃣ Envía tu trabajo en extenso · 11 feb al 15 mar\n'
     '4️⃣ Atiende el dictamen · versión final hasta el 10 de mayo\n5️⃣ Inscríbete y participa · antes del 31 de mayo\n\n'
     f'Guárdalo 📌 👉 {URL}\n\n' + HT,
     VIDEO),
    (D(2026, 12, 17), '19:00', flink(74), 'Reel', E2,
     '¿Vas al CIENU 2027? Dilo con orgullo 🙌\n\nDescarga el marco «Yo voy al CIENU», agrega tu foto y compártelo etiquetándonos. Invita a tus coautores a presentar contigo.\n\n'
     '#YoPresentoEnCIENU ' + HT,
     'Marco para miembros con «[TU FOTO]». Compartir el archivo editable con la red. ' + VIDEO),
    (D(2026, 12, 18), '19:00', flink(81), 'Reel', E5,
     'La IA responde. La docencia pregunta. 🎤\n\nEn el CIENU 2027 seguimos la conversación sobre educación e inteligencia artificial. ¿Qué pregunta traerás tú?\n\n' + HT,
     'La foto dice «CIENU 2026 · Pachuca»: aclarar que es la edición pasada o cambiar la etiqueta. ' + VIDEO),
    (D(2026, 12, 19), '12:00', flink(85), 'Reel', E2,
     'Una ponencia puede cambiar cómo otros enseñan 💬 Así se vivió el CIENU.\n\nEste año, la voz puede ser la tuya 👉 ' + URL + '\n\n#YoPresentoEnCIENU ' + HT,
     EDITAR + ' (v3_reel4, 58 s).'),
    (D(2026, 12, 21), '13:00', flink(57) + '\n' + flink(58), 'Reel + Historia', E5,
     preg(5, '¿Cómo cuidas tu bienestar en el cierre de semestre?', E5), 'S05. Semana de vacaciones: frecuencia baja. ' + VIDEO),
    (D(2026, 12, 23), '12:00', flink(10), 'Reel', E5,
     'Los desafíos de… las profesiones 💼 ¿Qué competencias necesitarán los profesionales del futuro?\n\nEje relacionado: Transformación de las profesiones y competencias para el futuro.\n\n' + HT,
     'Lema 2 de 3. ' + VIDEO),
    (D(2026, 12, 28), '13:00', flink(59) + '\n' + flink(60), 'Reel + Historia', E5,
     preg(6, '¿Qué te enseñaron tus estudiantes este año?', E5), 'S06. ' + VIDEO),
    (D(2026, 12, 30), '12:00', flink(11), 'Reel', E5,
     'Los desafíos de… el conocimiento 🔬 ¿Cómo se produce y se comparte el conocimiento en la era de la IA?\n\nEje relacionado: Investigación, conocimiento y transformación social.\n\n' + HT,
     'Lema 3 de 3. ' + VIDEO),
    (D(2027, 1, 1), '11:00', flink(39), 'Reel', E1,
     '¡Feliz 2027! 🎉 Tu primer propósito académico del año:\n\n☐ Descansar en vacaciones ✔️\n☐ Enviar mi resumen al CIENU 2027 — antes del 16 de enero\n\n'
     f'👉 {URL}\n\n' + HT,
     VIDEO),
    (D(2027, 1, 1), '18:00', flink(86), 'Historia', E1,
     'Faltan 15 días para enviar tu resumen al CIENU 2027. Cierre: 16 de enero.',
     'Cuenta regresiva. Historia con enlace a la convocatoria.'),
    (D(2027, 1, 4), '13:00', flink(61) + '\n' + flink(62), 'Reel + Historia', E5,
     preg(7, 'Si rediseñaras tu plan de estudios, ¿qué quitarías primero?', E5), 'S07. ' + VIDEO),
    (D(2027, 1, 5), '13:00', 'Portada «EN VIVO» (por diseñar)', 'Historia', E1,
     '🔴 Este jueves 7 de enero, 7:00 pm: último live antes del cierre. Resolvemos tus dudas del resumen.',
     DISENAR + ' Repetir el aviso el jueves por la mañana.'),
    (D(2027, 1, 5), '19:00', flink(82), 'Reel', E5,
     '> buscar("congreso + IA + docencia")\n✓ CIENU 2027 encontrado\n✓ 9-12 junio 2027 · Puerto Vallarta\n✓ Presencial + virtual\n✓ Resúmenes hasta 16.01.2027\n\n'
     f'Búsqueda completada. Tu próximo paso 👉 {URL}\n\n' + HT,
     VIDEO),
    (D(2027, 1, 6), '19:00', flink(87), 'Reel', E1,
     f'⏳ Faltan 10 días para enviar tu resumen al CIENU 2027. Cierre: 16 de enero 👉 {URL}\n\n' + HT, VIDEO),
    (D(2027, 1, 7), '19:00', 'Transmisión en vivo', 'Live', E1,
     '🔴 EN VIVO · Último llamado: resolvemos tus dudas antes del cierre de resúmenes (16 de enero). ¡Pregunta en comentarios! 👇\n\n' + HT,
     'Live 2.'),
    (D(2027, 1, 8), '19:00', flink(83), 'Reel', E2,
     'Detrás de cada ponencia hay una comunidad 🤝 Colegas que se conocen, comparten y siguen colaborando después del congreso.\n\n'
     f'Súmate a la del CIENU 2027 👉 {URL}\n\n' + HT,
     'CORREGIR antes de publicar: el arte dice #CIENU2026. ' + VIDEO),
    (D(2027, 1, 9), '12:00', flink(88), 'Reel', E1,
     f'📆 Falta una semana para enviar tu resumen al CIENU 2027. ¿Ya lo tienes? 👉 {URL}\n\n' + HT, VIDEO),
    (D(2027, 1, 10), '12:00', flink(76), 'Reel', E6,
     'Somos RIDMAE: docentes e investigadores que comparten lo que saben 🌎 México, América Latina, Andorra y España.\n\n'
     'Una red para construir comunidad y conocimiento compartido sobre la enseñanza universitaria. Síguenos y súmate a la conversación.\n\n' + HT,
     VIDEO),
    (D(2027, 1, 11), '13:00', flink(63) + '\n' + flink(64), 'Reel + Historia', E5,
     preg(8, '¿La educación híbrida llegó para quedarse?', E5), 'S08. ' + VIDEO),
    (D(2027, 1, 12), '19:00', flink(93), 'Reel', E1,
     '📌 Guarda este post: 16.01.27\n\nFecha límite para enviar tu resumen al CIENU 2027 (23:59 h, hora del centro de México).\n\n'
     f'👉 {URL}\n\n' + HT,
     VIDEO),
    (D(2027, 1, 13), '19:00', flink(89), 'Reel', E1,
     f'⚠️ Solo faltan 3 días para enviar tu resumen. ¿Ya tienes el tuyo listo? 👉 {URL}\n\n' + HT, VIDEO),
    (D(2027, 1, 14), '19:00', flink(75), 'Reel', E2,
     '✅ ¿Ya enviaste tu resumen? ¡Cuéntalo! Comparte esta tarjeta con tu nombre e institución y etiqueta a tus colegas para que no se les pase.\n\n'
     'Nos vemos en Puerto Vallarta… o en línea.\n\n#YoPresentoEnCIENU ' + HT,
     'Tarjeta «Ya envié mi resumen» para que la compartan los ponentes. ' + VIDEO),
    (D(2027, 1, 15), '19:00', flink(90), 'Reel', E1,
     f'🚨 ¡Último día mañana! El viernes 16 de enero cierra el envío de resúmenes. No lo dejes para después 👉 {URL}\n\n' + HT, VIDEO),
    (D(2027, 1, 16), '10:00', 'Historia «HOY CIERRA» (por diseñar)', 'Historia', E1,
     'HOY cierra el envío de resúmenes del CIENU 2027 · 23:59 h (hora del centro de México).',
     DISENAR + ' Repetir historias a las 14:00 y 20:00. Opción: re-publicar el video de la convocatoria.'),
    (D(2027, 1, 18), '13:00', flink(65) + '\n' + flink(66), 'Reel + Historia', E5,
     preg(9, '¿Quién debería decidir las reglas de la IA en tu universidad?', E5).replace(
         '¿Ya tienes tu tema para el CIENU 2027? Resúmenes hasta el 16 de enero: ' + URL,
         'Sigue el CIENU 2027 · 9 al 12 de junio en Puerto Vallarta'),
     'S09. Ya cerró el envío de resúmenes: cambia el cierre del copy. ' + VIDEO),
    (D(2027, 1, 25), '13:00', flink(67) + '\n' + flink(68), 'Reel + Historia', E5,
     preg(10, '¿Tu investigación llega a quien más la necesita?', E5).replace(
         '¿Ya tienes tu tema para el CIENU 2027? Resúmenes hasta el 16 de enero: ' + URL,
         'Sigue el CIENU 2027 · 9 al 12 de junio en Puerto Vallarta'),
     'S10. CORREGIR: en el arte de feed la etiqueta del eje se encima con «Responde en los comentarios». ' + VIDEO),
    (D(2027, 2, 1), '13:00', flink(69) + '\n' + flink(70), 'Reel + Historia', E5,
     preg(11, '¿Qué le preguntarías a una IA sobre tu propia clase?', E5).replace(
         '¿Ya tienes tu tema para el CIENU 2027? Resúmenes hasta el 16 de enero: ' + URL,
         'Sigue el CIENU 2027 · 9 al 12 de junio en Puerto Vallarta'),
     'S11. ' + VIDEO),
    (D(2027, 2, 4), '19:00', flink(73), 'Reel', E2,
     '«[Frase del testimonio]» 💬\n\n— [Nombre], [cargo e institución, país]. Participó en el CIENU [año].\n\n#VocesCIENU ' + HT,
     'PENDIENTE: conseguir frase, nombre y foto reales (el arte tiene textos guía).'),
    (D(2027, 2, 8), '13:00', flink(71) + '\n' + flink(72), 'Reel + Historia', E5,
     preg(12, '¿Cuál fue la clase que te cambió la vida?', E5).replace(
         '¿Ya tienes tu tema para el CIENU 2027? Resúmenes hasta el 16 de enero: ' + URL,
         'Sigue el CIENU 2027 · 9 al 12 de junio en Puerto Vallarta'),
     'S12. ' + VIDEO),
    (D(2027, 2, 10), '19:00', 'Arte «Abre recepción de extensos» (por diseñar)', 'Reel', E1,
     '📄 Mañana abre la recepción de trabajos en extenso (11 de febrero al 15 de marzo). Si tu resumen fue pertinente, ¡es tu turno! '
     'Usa la plantilla oficial y envíalo sin datos de autoría.\n\nGestor: https://cienu-cualtos.udg.mx\n\n' + HT,
     DISENAR),
]

# Pregunta de la semana: los viernes (historias + publicación en Facebook).
# Empieza hoy, viernes 20 de nov, con la S04 (decisión del equipo).
FRIDAY = {4: D(2026, 11, 20), 1: D(2026, 11, 27), 2: D(2026, 12, 4), 3: D(2026, 12, 11),
          5: D(2026, 12, 18), 6: D(2026, 12, 25), 7: D(2027, 1, 8), 8: D(2027, 1, 15),
          9: D(2027, 1, 22), 10: D(2027, 1, 29), 11: D(2027, 2, 5), 12: D(2027, 2, 12)}
MOVE = {(D(2026, 11, 27), '13:00'): D(2026, 11, 25), (D(2026, 12, 4), '13:00'): D(2026, 12, 3)}
new_rows = []
for (fecha, hora, arte, fmt, eje, copy, notas) in rows:
    if notas.startswith('S') and notas[1:3].isdigit():
        n = int(notas[1:3])
        fecha = FRIDAY[n]
        copy = copy.replace('las mejores respuestas el viernes', 'las mejores respuestas el próximo viernes')
        notas = (f'S{n:02d} · Viernes de preguntas: historia con sticker de preguntas + publicación en Facebook. '
                 'OJO: el arte trae impresa otra fecha; quitarla o actualizarla. ' + VIDEO)
    elif (fecha, hora) in MOVE and fmt == 'Historia':
        fecha = MOVE[(fecha, hora)]
    new_rows.append((fecha, hora, arte, fmt, eje, copy, notas))
rows = sorted(new_rows, key=lambda x: (x[0], x[1]))

DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
MESES = {11: 'Noviembre 2026', 12: 'Diciembre 2026', 1: 'Enero 2027', 2: 'Febrero 2027'}

wb = openpyxl.Workbook()
wb.remove(wb.active)

dark = PatternFill('solid', fgColor='434343')
title_fill = PatternFill('solid', fgColor='3F3F3F')
blue = PatternFill('solid', fgColor='0B5394')
green = PatternFill('solid', fgColor='0E7C5A')
white_b = Font(bold=True, color='FFFFFF')
thin = Side(style='thin', color='D9D9D9')
border = Border(left=thin, right=thin, top=thin, bottom=thin)
wrap_top = Alignment(wrap_text=True, vertical='top')
center = Alignment(horizontal='center', vertical='center', wrap_text=True)

HEAD = ['Fecha', 'Día', 'Hora', 'Arte', 'Formato', 'Eje (estrategia)', 'Tipo', 'Copy', 'Estado (aprobación)', 'Publicación',
        'Total Reactions', 'Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry', 'Post Reach', 'Shares', 'Comments',
        'Interactions', 'Engagement Rate*', '# of plays', 'Notas / producción']
WIDTH = [12, 10, 7, 34, 14, 20, 11, 60, 13, 14, 9, 6, 6, 6, 6, 6, 6, 10, 8, 10, 11, 11, 9, 46]

# --- WorkFlow (calendar summary) ---
wf = wb.create_sheet('WorkFlow')
wf['A1'] = 'CALENDARIZACIÓN DE CONTENIDO · CIENU 2027 · Facebook'
wf['A1'].font = Font(bold=True, color='FFFFFF', size=16)
wf['A1'].fill = title_fill
wf['A1'].alignment = center
wf.merge_cells('A1:AH1')
wf.row_dimensions[1].height = 48
wf.column_dimensions['A'].width = 24
r = 3
for (y, m) in [(2026, 11), (2026, 12), (2027, 1), (2027, 2)]:
    sheet = MESES[m]
    ndays = (dt.date(y + (m == 12), m % 12 + 1, 1) - dt.date(y, m, 1)).days
    wf.cell(r, 2, sheet.upper()).font = white_b
    wf.cell(r, 2).fill = blue
    wf.cell(r, 2).alignment = center
    wf.merge_cells(start_row=r, start_column=2, end_row=r, end_column=ndays + 1)
    for d in range(1, ndays + 1):
        day = dt.date(y, m, d)
        col = d + 1
        c1 = wf.cell(r + 1, col, ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'][day.weekday()])
        c2 = wf.cell(r + 2, col, d)
        for c in (c1, c2):
            c.fill = dark
            c.font = Font(color='FFFFFF', size=9)
            c.alignment = center
        L = get_column_letter(col)
        f = wf.cell(r + 3, col, f"=COUNTIF('{sheet}'!$A:$A,DATE({y},{m},{d}))")
        f.alignment = center
        f.border = border
        wf.column_dimensions[L].width = 4
    wf.cell(r + 3, 1, 'Número de publicaciones').font = Font(bold=True)
    tcol = 33
    wf.cell(r + 2, tcol, 'TOTAL').font = Font(bold=True)
    wf.cell(r + 3, tcol, f'=SUM(B{r + 3}:{get_column_letter(ndays + 1)}{r + 3})').font = Font(bold=True)
    wf.column_dimensions[get_column_letter(tcol)].width = 8
    r += 6

# --- Monthly sheets ---
dv_tipo = '"Orgánico,Pagado"'
dv_estado = '"Aprobado,Pendiente,No aprobado,Descartado"'
dv_pub = '"Publicada,Pendiente,No publicada,Descartada"'
dv_formato = '"Reel,Reel + Historia,Carrusel,Imagen,Historia,Live,Video"'
dv_eje = f'"{E1},{E2},{E3},{E4},{E5},{E6}"'

for m, sheet in MESES.items():
    ws = wb.create_sheet(sheet)
    ws['A1'] = f'PARRILLA DE CONTENIDO · {sheet.upper()} · Facebook CIENU 2027'
    ws['A1'].font = Font(bold=True, color='FFFFFF', size=14)
    ws['A1'].fill = title_fill
    ws['A1'].alignment = center
    ws.merge_cells('A1:X1')
    ws.row_dimensions[1].height = 48
    ws['A2'] = 'Planning & control'
    ws.merge_cells('A2:J2')
    ws['K2'] = 'Performance'
    ws.merge_cells('K2:W2')
    ws['X2'] = 'Producción'
    for c, fill in (('A2', blue), ('K2', blue), ('X2', green)):
        ws[c].fill = fill
        ws[c].font = white_b
        ws[c].alignment = center
    for i, h in enumerate(HEAD, 1):
        c = ws.cell(3, i, h)
        c.fill = green if i == 24 else dark
        c.font = white_b
        c.alignment = center
        ws.column_dimensions[get_column_letter(i)].width = WIDTH[i - 1]
    ws.row_dimensions[3].height = 40
    ws.freeze_panes = 'D4'

    mrows = [x for x in rows if x[0].month == m]
    n = max(len(mrows), 1)
    for k, (fecha, hora, arte, fmt, eje, copy, notas) in enumerate(mrows):
        rr = 4 + k
        vals = [fecha, DIAS[fecha.weekday()], hora, arte, fmt, eje, 'Orgánico', copy, 'Pendiente', 'Pendiente']
        for i, v in enumerate(vals, 1):
            c = ws.cell(rr, i, v)
            c.alignment = wrap_top
            c.border = border
        ws.cell(rr, 1).number_format = 'dd/mm/yyyy'
        if arte.startswith('http'):
            ws.cell(rr, 4).hyperlink = arte.split('\n')[0]
            ws.cell(rr, 4).font = Font(color='0000FF', underline='single')
        ws.cell(rr, 11, f'=IF(COUNT(L{rr}:Q{rr})=0,"",SUM(L{rr}:Q{rr}))')
        ws.cell(rr, 21, f'=IF(COUNT(K{rr},S{rr},T{rr})=0,"",N(K{rr})+N(S{rr})+N(T{rr}))')
        ws.cell(rr, 22, f'=IF(N(R{rr})=0,"",U{rr}/R{rr})')
        ws.cell(rr, 22).number_format = '0.0%'
        for i in range(11, 24):
            ws.cell(rr, i).border = border
            ws.cell(rr, i).alignment = center
        c = ws.cell(rr, 24, notas)
        c.alignment = wrap_top
        c.border = border
        ws.row_dimensions[rr].height = 150
    last = 4 + n + 20
    for formula, col in ((dv_formato, 'E'), (dv_eje, 'F'), (dv_tipo, 'G'), (dv_estado, 'I'), (dv_pub, 'J')):
        dv = DataValidation(type='list', formula1=formula, allow_blank=True)
        ws.add_data_validation(dv)
        dv.add(f'{col}4:{col}{last}')

    # Colores automáticos según la opción elegida
    def paint(col, mapping):
        for value, (bg, fg) in mapping.items():
            ws.conditional_formatting.add(
                f'{col}4:{col}{last}',
                CellIsRule(operator='equal', formula=[f'"{value}"'],
                           fill=PatternFill('solid', start_color=bg, end_color=bg),
                           font=Font(bold=True, color=fg)))

    GREEN = ('B7E1CD', '0B5D3B')
    YELLOW = ('FCE8B2', '7F5F00')
    RED = ('F4C7C3', '990000')
    GRAY = ('D9D9D9', '434343')
    paint('G', {'Orgánico': ('CFE2F3', '0B5394'), 'Pagado': ('D9D2E9', '5B2C83')})
    paint('I', {'Aprobado': GREEN, 'Pendiente': YELLOW, 'No aprobado': RED, 'Descartado': GRAY})
    paint('J', {'Publicada': GREEN, 'Pendiente': YELLOW, 'No publicada': RED, 'Descartada': GRAY})
    paint('E', {'Reel': ('FDE2CF', '8A3B00'), 'Reel + Historia': ('FDE2CF', '8A3B00'),
                'Carrusel': ('E8EAF6', '283593'), 'Imagen': ('E0F2F1', '00695C'),
                'Historia': ('FCE4EC', 'AD1457'), 'Live': ('F4C7C3', '990000'), 'Video': ('FDE2CF', '8A3B00')})

# --- Guía ---
g = wb.create_sheet('Guía')
guide = [
    ('GUÍA DE LA PARRILLA', ''),
    ('Horarios', '13:00 (pausa de comida) y 19:00 (después de clases), hora del centro de México. Historias entre 9:00 y 13:00.'),
    ('Frecuencia', '5-6 publicaciones por semana hasta el 16 de enero; 3 por semana en vacaciones (21 dic-3 ene); 1-2 por semana después del cierre.'),
    ('Pregunta de la semana', 'Todos los viernes: historia con sticker de preguntas + publicación en Facebook. Empezó el 20 de nov con la S04. Las mejores respuestas se comparten el viernes siguiente, junto con la nueva pregunta. Los artes traen impresa otra fecha (lunes): quitarla o actualizarla.'),
    ('Formato', 'Todo se plantea como Reel (video). Mientras el video no esté listo, publicar el arte original como imagen o carrusel.'),
    ('Instagram', 'Publicar también en @cienuridmae desde Meta Business Suite (misma pieza y copy). El Instagram no publica desde junio de 2026.'),
    ('Hashtags base', '#CIENU2027 #IAenEducación #RIDMAE · Campañas: #YoPresentoEnCIENU #PreguntaCIENU #VallartaTeEspera'),
    ('Liga', f'{URL} (en Facebook va completa en el copy).'),
    ('Ejes (estrategias)', f'{E1} · {E2} · {E3} · {E4} · {E5} · {E6}'),
    ('Pendientes de arte', '1) S10 feed: texto encimado. 2) «Detrás de cada ponencia»: dice #CIENU2026. 3) «La IA responde»: foto con «CIENU 2026 · Pachuca». '
     '4) Testimonio con textos guía. 5) Por diseñar: portada de los lives, «HOY CIERRA», «Abre recepción de extensos». 6) Universidades aliadas: no hay artes todavía.'),
    ('Colores', 'Tipo: Orgánico = azul, Pagado = morado. Estado (aprobación) y Publicación: verde = Aprobado/Publicada, amarillo = Pendiente, rojo = No aprobado/No publicada, gris = Descartado(a). Formato: cada tipo de contenido tiene su color.'),
    ('Métricas', 'Llenar las columnas de Performance cada lunes con los datos de Meta Business Suite (7 días después de publicar). Engagement = Interactions / Post Reach.'),
    ('Material', dlink('raiz')),
]
for i, (k, v) in enumerate(guide, 1):
    g.cell(i, 1, k).font = Font(bold=True, color='FFFFFF' if i == 1 else '000000', size=14 if i == 1 else 11)
    g.cell(i, 2, v).alignment = Alignment(wrap_text=True, vertical='top')
    g.cell(i, 1).alignment = Alignment(vertical='top')
g['A1'].fill = title_fill
g.merge_cells('A1:B1')
g.column_dimensions['A'].width = 24
g.column_dimensions['B'].width = 110

wb.save(OUT)
print('rows', len(rows), {MESES[m]: sum(1 for x in rows if x[0].month == m) for m in MESES})
