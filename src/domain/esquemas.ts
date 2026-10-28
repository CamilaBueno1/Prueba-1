import { z } from 'zod';
import { leerNumero } from './reglas';
import { Referencia } from './tipos';

const NUMERO = /^\d+([.,]\d+)?$/;

// R2: MED- seguido de exactamente 6 dígitos. Se valida tal cual se escribe (después de quitar espacios).
export const esquemaCodigo = z.object({
  codigo: z
    .string()
    .trim()
    .regex(/^MED-\d{6}$/, 'El código debe ser MED- seguido de 6 dígitos (ej. MED-000123).'),
});
export type ValoresCodigo = z.input<typeof esquemaCodigo>;

// R5: tres estados, tres conjuntos de reglas. discriminatedUnion elige las reglas según `estadoMedidor`.
export function crearEsquemaPaso1(ref: Referencia) {
  const base = { lectura: z.string(), motivo: z.string(), descripcionDano: z.string() };
  return z
    .discriminatedUnion('estadoMedidor', [
      // Normal: la lectura es obligatoria
      z.object({
        ...base,
        estadoMedidor: z.literal('normal'),
        lectura: z
          .string()
          .trim()
          .regex(NUMERO, 'La lectura es obligatoria: escribe solo números (ej. 1262).'),
      }),
      // Inaccesible: el motivo es obligatorio y no se registra lectura
      z.object({
        ...base,
        estadoMedidor: z.literal('inaccesible'),
        motivo: z.string().trim().min(1, 'El motivo es obligatorio.'),
        lectura: z.string().trim().max(0, 'Un medidor inaccesible no registra lectura.'),
      }),
      // Dañado: la descripción es obligatoria y la lectura es opcional (puede ir vacía)
      z.object({
        ...base,
        estadoMedidor: z.literal('danado'),
        descripcionDano: z.string().trim().min(1, 'La descripción del daño es obligatoria.'),
        lectura: z
          .string()
          .trim()
          .refine((v) => v === '' || NUMERO.test(v), 'Escribe un número válido o deja la lectura vacía.'),
      }),
    ])
    // Un medidor no retrocede: la lectura no puede ser menor que la anterior
    .refine(
      (d) => {
        if (d.estadoMedidor === 'inaccesible' || ref.lecturaAnterior == null) return true;
        const n = leerNumero(d.lectura);
        return n == null || n >= ref.lecturaAnterior;
      },
      { error: `No puede ser menor que la lectura anterior (${ref.lecturaAnterior ?? ''}).`, path: ['lectura'] },
    );
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
