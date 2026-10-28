import { Tecnico } from './tipos';

const TECNICOS = [
  { codigo: 'EMP-1001', clave: 'agua2026', nombre: 'Carlos Pilatuña' },
  { codigo: 'EMP-1002', clave: 'quito2026', nombre: 'María Quishpe' },
];

// Devuelve solo código y nombre: la clave NUNCA llega al almacenamiento (ADR-002)
export function autenticar(codigo: string, clave: string): Tecnico | null {
  const t = TECNICOS.find((x) => x.codigo === codigo.trim().toUpperCase() && x.clave === clave);
  return t ? { codigo: t.codigo, nombre: t.nombre } : null;
}
