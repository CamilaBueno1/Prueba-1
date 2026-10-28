import { Directory, File, Paths } from 'expo-file-system';

const carpeta = () => new Directory(Paths.document, 'fotos');

// La cámara deja la foto en `cache`, que Android puede vaciar. Se copia a `document`:
// dura hasta que se desinstale la app, aunque pasen días sin enviar la lectura.
// Se guarda solo el NOMBRE; la ruta completa se reconstruye al mostrarla. (ADR-005)
export function guardarFotoPermanente(uriTemporal: string, idLocal: string): string {
  const dir = carpeta();
  dir.create({ intermediates: true, idempotent: true });
  const nombre = `${idLocal}-${Date.now()}.jpg`;
  new File(uriTemporal).copy(new File(dir, nombre));
  return nombre;
}

export const uriFoto = (nombre: string | null) =>
  nombre ? new File(carpeta(), nombre).uri : null;
