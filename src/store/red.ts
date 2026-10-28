import { create } from 'zustand';

interface RedState {
  enLinea: boolean;
  setEnLinea: (v: boolean) => void;
}

export const useRedStore = create<RedState>()((set) => ({
  enLinea: false, // hasta leer el estado real, se asume sin conexión
  setEnLinea: (v) => set({ enLinea: v }),
}));
