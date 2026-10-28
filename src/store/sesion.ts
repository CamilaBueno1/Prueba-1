import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { autenticar } from '@/domain/tecnicos';
import { Tecnico } from '@/domain/tipos';
import { almacen } from './almacen';

interface SesionState {
  tecnico: Tecnico | null;
  iniciar: (codigo: string, clave: string) => boolean;
  cerrar: () => void;
}

export const useSesionStore = create<SesionState>()(
  persist(
    (set) => ({
      tecnico: null,
      iniciar: (codigo, clave) => {
        const t = autenticar(codigo, clave);
        if (!t) return false;
        set({ tecnico: t });
        return true;
      },
      cerrar: () => set({ tecnico: null }),
    }),
    {
      name: '@auth_session',
      version: 1,
      storage: createJSONStorage(() => almacen),
      partialize: (s) => ({ tecnico: s.tecnico }), // solo se guarda el técnico, nunca funciones ni la clave
    },
  ),
);
