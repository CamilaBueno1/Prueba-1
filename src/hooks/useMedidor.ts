import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/aquaruta';
import { JORNADA_MS } from '@/config/queryClient';

// codigo === null significa "no se ha consultado nada": la consulta queda desactivada (R2)
export function useMedidor(codigo: string | null) {
  return useQuery({
    queryKey: ['meter', codigo],
    queryFn: () => api.buscarMedidor(codigo as string), // null = el sistema no conoce ese medidor
    enabled: codigo != null,
    // R3: lo ya consultado no se vuelve a descargar durante la jornada.
    // Un "no encontrado" (null) no se cachea: el medidor podría darse de alta después.
    staleTime: (query) => (query.state.data ? JORNADA_MS : 0),
  });
}
