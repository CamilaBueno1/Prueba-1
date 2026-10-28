import { Medidor } from '@/domain/tipos';

const URL_MEDIDORES = (process.env.EXPO_PUBLIC_MEDIDORES_URL ?? '').replace(/\/+$/, '');
const URL_LECTURAS = (process.env.EXPO_PUBLIC_LECTURAS_URL ?? '').replace(/\/+$/, '');

export interface LecturaRemota {
  id: string;
  idLocal: string;
}

// fetch con corte a los 10 s: si la señal muere en pleno envío no queda colgado.
// MockAPI responde 404 cuando un filtro no encuentra nada: se trata como "sin resultados".
async function pedir<T>(urlCompleta: string, init: RequestInit = {}): Promise<T | null> {
  const control = new AbortController();
  const corte = setTimeout(() => control.abort(), 10000);
  try {
    const r = await fetch(urlCompleta, {
      ...init,
      headers: { 'Content-Type': 'application/json' },
      signal: control.signal,
    });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()) as T;
  } finally {
    clearTimeout(corte);
  }
}

export const api = {
  // El filtro de MockAPI es "contiene": se exige igualdad exacta
  async buscarMedidor(codigo: string) {
    const lista = await pedir<Medidor[]>(`${URL_MEDIDORES}?codigo=${encodeURIComponent(codigo)}`);
    return lista?.find((m) => m.codigo === codigo) ?? null;
  },
  async buscarLecturaPorIdLocal(idLocal: string) {
    const lista = await pedir<LecturaRemota[]>(
      `${URL_LECTURAS}?idLocal=${encodeURIComponent(idLocal)}`,
    );
    return lista?.find((l) => l.idLocal === idLocal) ?? null;
  },
  async crearLectura(cuerpo: object) {
    const r = await pedir<LecturaRemota>(URL_LECTURAS, {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    });
    if (!r) throw new Error('El sistema de la oficina rechazó la lectura');
    return r;
  },
};
