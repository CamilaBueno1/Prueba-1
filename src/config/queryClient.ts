import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { Query, QueryClient } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

export const JORNADA_MS = 12 * 60 * 60 * 1000; // staleTime: lo consultado vale toda la jornada
export const MAX_AGE = 24 * 60 * 60 * 1000;    // cuánto vive la caché en disco

// gcTime >= maxAge: si la memoria descartara la consulta antes, el persister la borraría también del disco
export const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: MAX_AGE, retry: 0 } },
});

export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: '@medidores_cache',
  throttleTime: 500,
});

// ADR-003: el caché persistido se limita a fichas de medidores ya descargadas, con versión y tiempo de vida
export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister,
  maxAge: MAX_AGE,
  buster: 'v1',
  dehydrateOptions: {
    shouldDehydrateQuery: (q: Query) => q.queryKey[0] === 'meter' && q.state.status === 'success',
  },
};
