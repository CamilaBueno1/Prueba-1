import { useSyncExternalStore } from 'react';
import { useBorradorStore } from '@/store/borrador';
import { useLecturasStore } from '@/store/lecturas';
import { useSesionStore } from '@/store/sesion';

const stores = [useSesionStore, useLecturasStore, useBorradorStore];
const todosListos = () => stores.every((s) => s.persist.hasHydrated());

const suscribirHidratacion = (notificar: () => void) => {
  const bajas = stores.map((s) => s.persist.onFinishHydration(notificar));
  return () => bajas.forEach((baja) => baja());
};

// `persist` lee AsyncStorage de forma asíncrona. Hasta que termina, los stores están vacíos:
// si se navega antes, el registro pendiente "no existe". Este hook avisa cuando ya se puede. (ADR-001)
export function useHidratacion() {
  return useSyncExternalStore(suscribirHidratacion, todosListos, () => false);
}
