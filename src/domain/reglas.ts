import { Borrador, EstadoMedidor } from './tipos';

// "1262,5" y "1262.5" son válidos. Cualquier otra cosa devuelve null.
export function leerNumero(texto: string): number | null {
  const t = texto.trim().replace(',', '.');
  return /^\d+(\.\d+)?$/.test(t) ? Number(t) : null;
}

// R6: consumo del mes. Si no hay lectura anterior no se puede calcular (queda null).
export const calcularConsumo = (lectura: number | null, anterior: number | null) =>
  lectura == null || anterior == null ? null : Math.round((lectura - anterior) * 100) / 100;

// R6: anómalo si SUPERA el triple del promedio. Exactamente el triple NO lo es.
export const esAnomalo = (consumo: number | null, promedio: number | null) =>
  consumo != null && promedio != null && consumo > 3 * promedio;

// R7: foto obligatoria solo con medidor dañado o consumo anómalo
export const fotoObligatoria = (estado: EstadoMedidor, anomalo: boolean) =>
  estado === 'danado' || anomalo;

export const mesDe = (f: Date) => `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;

// Cálculo derivado del borrador, usado por el paso 2 y al guardar
export function calcular(b: Borrador) {
  const lectura = b.estadoMedidor === 'inaccesible' ? null : leerNumero(b.lectura);
  const consumo = calcularConsumo(lectura, b.referencia.lecturaAnterior);
  const anomalo = esAnomalo(consumo, b.referencia.promedio);
  return { lectura, consumo, anomalo, fotoObligatoria: fotoObligatoria(b.estadoMedidor, anomalo) };
}
