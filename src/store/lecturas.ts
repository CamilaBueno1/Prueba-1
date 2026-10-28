import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Lectura } from '@/domain/tipos';
import { almacen } from './almacen';
import { useBorradorStore } from './borrador';

interface LecturasState {
  lecturas: Lectura[];
  buscarPorMedidorMes: (codigo: string, mes: string) => Lectura | undefined;
  agregar: (l: Lectura) => { ok: true } | { ok: false; razon: string };
  corregir: (l: Lectura) => boolean;
  reclamarSiguiente: () => Lectura | null;
  liberar: (idLocal: string, error?: string) => void;
  liberarTodasEnviando: () => void;
  marcarEnviada: (
    idLocal: string,
    remotoId: string,
    v: Pick<Lectura, 'referencia' | 'consumo' | 'anomalo' | 'requiereRevision'>,
  ) => void;
}

// Cada acción lee con get() y escribe con set() SIN await entre medio.
// Como JavaScript es de un solo hilo, esa secuencia no se puede intercalar con otra:
// es la "atomicidad" que aquí reemplaza a las transacciones de una base de datos.
export const useLecturasStore = create<LecturasState>()(
  persist(
    (set, get) => ({
      lecturas: [],

      buscarPorMedidorMes: (codigo, mes) =>
        get().lecturas.find((l) => l.medidorCodigo === codigo && l.mes === mes),

      // R10: un medidor no puede registrarse dos veces en el mismo mes
      agregar: (l) => {
        if (get().buscarPorMedidorMes(l.medidorCodigo, l.mes)) {
          return { ok: false, razon: 'Ya existe una lectura de este medidor en este mes.' };
        }
        set((s) => ({ lecturas: [l, ...s.lecturas] }));
        return { ok: true };
      },

      // R10: solo se corrige si SIGUE pendiente (una enviada o en envío no se toca)
      corregir: (nueva) => {
        const actual = get().lecturas.find((l) => l.idLocal === nueva.idLocal);
        if (!actual || actual.estadoEnvio !== 'pendiente') return false;
        set((s) => ({
          lecturas: s.lecturas.map((l) =>
            l.idLocal === nueva.idLocal
              ? {
                  ...nueva,
                  estadoEnvio: 'pendiente',
                  remotoId: null,
                  verificada: false,
                  requiereRevision: false,
                  ultimoError: null,
                }
              : l,
          ),
        }));
        return true;
      },

      // Toma la más antigua pendiente (que no esté siendo editada en este instante) y la pasa a 'enviando' en un solo paso
      reclamarSiguiente: () => {
        const idEditando =
          useBorradorStore.getState().borrador?.modo === 'correccion'
            ? useBorradorStore.getState().borrador?.idLocal
            : null;
        const siguiente = get()
          .lecturas.filter((l) => l.estadoEnvio === 'pendiente' && l.idLocal !== idEditando)
          .sort((a, b) => a.tomadaEn.localeCompare(b.tomadaEn))[0];
        if (!siguiente) return null;
        set((s) => ({
          lecturas: s.lecturas.map((l) =>
            l.idLocal === siguiente.idLocal ? { ...l, estadoEnvio: 'enviando' } : l,
          ),
        }));
        return { ...siguiente, estadoEnvio: 'enviando' };
      },

      // Un envío fallido vuelve a pendiente y guarda el motivo para mostrarlo
      liberar: (idLocal, error) =>
        set((s) => ({
          lecturas: s.lecturas.map((l) =>
            l.idLocal === idLocal && l.estadoEnvio === 'enviando'
              ? { ...l, estadoEnvio: 'pendiente', ultimoError: error ?? l.ultimoError ?? null }
              : l,
          ),
        })),

      // Si la app se cerró en pleno envío, esas lecturas vuelven a pendiente
      liberarTodasEnviando: () =>
        set((s) => ({
          lecturas: s.lecturas.map((l) =>
            l.estadoEnvio === 'enviando' ? { ...l, estadoEnvio: 'pendiente' } : l,
          ),
        })),

      marcarEnviada: (idLocal, remotoId, v) =>
        set((s) => ({
          lecturas: s.lecturas.map((l) =>
            l.idLocal === idLocal
              ? { ...l, ...v, estadoEnvio: 'enviada', remotoId, verificada: true, ultimoError: null }
              : l,
          ),
        })),
    }),
    {
      name: '@lecturas_cola',
      version: 1,
      storage: createJSONStorage(() => almacen),
      partialize: (s) => ({ lecturas: s.lecturas }),
    },
  ),
);
