import { z } from 'zod';
import { leerNumero } from './reglas';
import { Referencia } from './tipos';

const NUMERO = /^\d+([.,]\d{1,2})?$/;

// R2: MED- seguido de exactamente 6 dígitos. Se valida tal cual se escribe (después de quitar espacios).
export const esquemaCodigo = z.object({
  codigo: z
    .string()
    .trim()
    .max(10, 'El código no puede superar los 10 caracteres (MED-000000).')
    .regex(/^MED-\d{6}$/, 'El código debe ser MED- seguido de 6 dígitos (ej. MED-000101).'),
});
export type ValoresCodigo = z.input<typeof esquemaCodigo>;

// R5: tres estados, tres conjuntos de reglas. discriminatedUnion elige las reglas según `estadoMedidor`.
export function crearEsquemaPaso1(ref: Referencia) {
  const base = { lectura: z.string(), motivo: z.string(), descripcionDano: z.string() };
  const validarLecturaMinima = (v: string) => {
    if (ref.lecturaAnterior == null || v.trim() === '') return true;
    const n = leerNumero(v);
    return n == null || n >= ref.lecturaAnterior;
  };
  const msgMinimo = `La lectura no puede ser menor que la anterior (${ref.lecturaAnterior ?? ''}).`;

  return z.discriminatedUnion('estadoMedidor', [
    // Normal: la lectura es obligatoria
    z.object({
      ...base,
      estadoMedidor: z.literal('normal'),
      lectura: z
        .string()
        .trim()
        .min(1, 'La lectura actual es obligatoria.')
        .max(9, 'La lectura no puede superar 9 caracteres.')
        .regex(NUMERO, 'Ingrese un número válido con máximo 2 decimales (ej. 1262 o 1262.5).')
        .refine(validarLecturaMinima, msgMinimo),
    }),
    // Inaccesible: el motivo es obligatorio y no se registra lectura
    z.object({
      ...base,
      estadoMedidor: z.literal('inaccesible'),
      motivo: z
        .string()
        .trim()
        .min(5, 'Describa el motivo con al menos 5 caracteres.')
        .max(150, 'El motivo no puede superar los 150 caracteres.'),
      lectura: z.string().trim().max(0, 'Un medidor inaccesible no registra lectura.'),
    }),
    // Dañado: la descripción es obligatoria y la lectura es opcional (puede ir vacía)
    z.object({
      ...base,
      estadoMedidor: z.literal('danado'),
      descripcionDano: z
        .string()
        .trim()
        .min(5, 'Describa el daño con al menos 5 caracteres.')
        .max(150, 'La descripción no puede superar los 150 caracteres.'),
      lectura: z
        .string()
        .trim()
        .max(9, 'La lectura no puede superar 9 caracteres.')
        .refine(
          (v) => v === '' || NUMERO.test(v),
          'Ingrese un número válido o deje la lectura vacía.',
        )
        .refine(validarLecturaMinima, msgMinimo),
    }),
  ]);
}

// Condiciones de R6 y R7. Los valores `anomalo` y `fotoObligatoria` los calculan funciones puras del dominio.
export const esquemaRevision = z
  .object({
    anomalo: z.boolean(),
    fotoObligatoria: z.boolean(),
    revisionConfirmada: z.boolean(),
    fotoNombre: z.string().nullable(),
  })
  .refine((d) => !d.anomalo || d.revisionConfirmada, {
    error: 'Confirma que revisaste el medidor.',
    path: ['revisionConfirmada'],
  })
  .refine((d) => !d.fotoObligatoria || d.fotoNombre != null, {
    error: 'Agrega la foto del medidor.',
    path: ['fotoNombre'],
  });
