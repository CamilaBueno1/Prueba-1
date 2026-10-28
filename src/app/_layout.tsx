import { useIsRestoring } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BannerRed } from '@/components/BannerRed';
import { persistOptions, queryClient } from '@/config/queryClient';
import { c } from '@/constants/estilos';
import { useHidratacion } from '@/hooks/useHidratacion';
import { useVigilarRed } from '@/hooks/useVigilarRed';
import { iniciarSincronizacion } from '@/services/sincronizacion';
import { useSesionStore } from '@/store/sesion';

function Contenido() {
  const hidratado = useHidratacion();
  const restaurando = useIsRestoring();
  const tecnico = useSesionStore((s) => s.tecnico);

  useVigilarRed();

  useEffect(() => {
    if (!hidratado) return;
    return iniciarSincronizacion();
  }, [hidratado]);

  if (!hidratado || restaurando) {
    return (
      <View style={s.carga}>
        <ActivityIndicator color={c.acento} size="large" />
        <Text style={s.cargaTxt}>Cargando aplicación…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <StatusBar style="light" />
      <BannerRed />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.backgroundElement },
          headerTintColor: c.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerShadowVisible: false,
        }}>
        <Stack.Protected guard={!tecnico}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!!tecnico}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="registro/estado"
            options={{ title: 'Registrar lectura (Paso 1 de 2)' }}
          />
          <Stack.Screen
            name="registro/revision"
            options={{ title: 'Confirmar lectura (Paso 2 de 2)' }}
          />
        </Stack.Protected>
      </Stack>
    </View>
  );
}

export default function Raiz() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <Contenido />
    </PersistQueryClientProvider>
  );
}

const s = StyleSheet.create({
  carga: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  cargaTxt: {
    color: c.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
