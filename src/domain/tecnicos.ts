import { Tecnico } from './tipos';

const TECNICOS = [
  { codigo: 'EMP-1001', clave: 'agua2026', nombre: 'Carlos Pilatuña' },
  { codigo: 'EMP-1002', clave: 'quito2026', nombre: 'María Quishpe' },
  { codigo: 'EMP-1003', clave: 'epmaps03', nombre: 'Diego Collahuazo' },
  { codigo: 'EMP-1004', clave: 'epmaps04', nombre: 'Fernanda Cevallos' },
  { codigo: 'EMP-1005', clave: 'epmaps05', nombre: 'Javier Simbaña' },
  { codigo: 'EMP-1006', clave: 'epmaps06', nombre: 'Valeria Andrade' },
];

// Devuelve solo código y nombre: la clave NUNCA llega al almacenamiento 
export function autenticar(codigo: string, clave: string): Tecnico | null {
  const t = TECNICOS.find(
    (x) => x.codigo === codigo.trim().toUpperCase() && x.clave === clave,
  );
  return t ? { codigo: t.codigo, nombre: t.nombre } : null;
}
