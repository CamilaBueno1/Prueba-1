import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Borrador } from '@/domain/tipos';
import { almacen } from './almacen';

interface BorradorState {
  borrador: Borrador | null;
  iniciar: (b: Borrador) => void;
  actualizar: (cambios: Partial<Borrador>) => void;
  descartar: () => void;
}

// `persist` escribe en disco CADA cambio: si la app se cierra a mitad del registro, no se pierde nada.
export const useBorradorStore = create<BorradorState>()(
  persist(
    (set) => ({
      borrador: null,
      iniciar: (b) => set({ borrador: b }),
      actualizar: (cambios) =>
        set((s) => (s.borrador ? { borrador: { ...s.borrador, ...cambios } } : s)),
      descartar: () => set({ borrador: null }),
    }),
    {
      name: '@draft_reading',
      version: 1,
      storage: createJSONStorage(() => almacen),
      partialize: (s) => ({ borrador: s.borrador }),
    },
  ),
);
