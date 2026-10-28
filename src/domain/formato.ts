export const m3 = (n: number | null | undefined) =>
  n == null ? '—' : `${n.toLocaleString('es-EC', { maximumFractionDigits: 2 })} m³`;

export const fecha = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const hora = (v: string | number) =>
  new Date(v).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
