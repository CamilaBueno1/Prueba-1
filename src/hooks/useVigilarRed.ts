import { onlineManager } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { useEffect } from 'react';
import { useRedStore } from '@/store/red';

const hayInternet = (s: Network.NetworkState) =>
  !!s.isConnected && s.isInternetReachable !== false;

export function useVigilarRed() {
  useEffect(() => {
    const aplicar = (s: Network.NetworkState) => {
      const online = hayInternet(s);
      useRedStore.getState().setEnLinea(online);
      onlineManager.setOnline(online); // TanStack Query también debe saber si hay red
    };
    let activo = true;
    Network.getNetworkStateAsync()
      .then((s) => {
        if (activo) aplicar(s);
      })
      .catch(() => {});
    const suscripcion = Network.addNetworkStateListener(aplicar);
    return () => {
      activo = false;
      suscripcion.remove(); // ADR-007: se desinstala el listener
    };
  }, []);
}
