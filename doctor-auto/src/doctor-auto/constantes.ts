// Doctor Auto México: constantes de marca para todos los videos.
import { loadFont as cargarAnton } from "@remotion/google-fonts/Anton";
import { loadFont as cargarPoppins } from "@remotion/google-fonts/Poppins";

// Rojo Doctor Auto, muestreado (mediana de píxeles rojos) del logo:
// logo = #CC2328, mascota.png = #CC212F. Se usa el del logo.
export const ROJO_DA = "#CC2328";
export const ROJO_MASCOTA = "#CC212F";
export const ROJO_OSCURO = "#7F1D1D";
export const FONDO = "#151515";
export const BLANCO = "#FFFFFF";
export const GRIS = "#9E9E9E";
export const DEGRADADO = `linear-gradient(135deg, ${ROJO_DA} 0%, ${ROJO_OSCURO} 100%)`;

// Tipografía (Google Fonts): títulos y palabras clave en Anton;
// subtítulos y texto de apoyo en Poppins SemiBold.
export const { fontFamily: ANTON } = cargarAnton("normal", { weights: ["400"], subsets: ["latin"] });
export const { fontFamily: POPPINS } = cargarPoppins("normal", { weights: ["600"], subsets: ["latin"] });
export const PESO_POPPINS = 600;
