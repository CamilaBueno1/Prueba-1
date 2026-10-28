import { useIsRestoring } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BannerRed } from '@/components/BannerRed';
import { persistOptions, queryClient } from '@/config/queryClient';
import { c } from '@/constants/estilos';
import { Fonts } from '@/constants/theme';
import { useHidratacion } from '@/hooks/useHidratacion';
import { useVigilarRed } from '@/hooks/useVigilarRed';
import { iniciarSincronizacion } from '@/services/sincronizacion';
import { useSesionStore } from '@/store/sesion';

function Contenido() {
  const hidratado = useHidratacion();   // Zustand leyó el disco
  const restaurando = useIsRestoring(); // TanStack leyó su caché del disco
  const tecnico = useSesionStore((s) => s.tecnico);

  useVigilarRed();

  // La sincronización arranca SOLO cuando la cola ya se cargó del disco
  useEffect(() => {
    if (!hidratado) return;
    return iniciarSincronizacion();
  }, [hidratado]);

  // ADR-001: no se navega hasta tener los datos guardados (si no, el registro pendiente "no existe")
  if (!hidratado || restaurando) {
    return (
      <View style={s.carga}>
        <ActivityIndicator color={c.laton} size="large" />
        <Text style={s.cargaTxt}>RESTAURANDO DATOS DE CAMPO…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <StatusBar style="light" />
      {/* El banner está FUERA del Stack: aparece en todas las pantallas, incluido el login (R9) */}
      <BannerRed />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.backgroundElement },
          headerTintColor: c.text,
          headerTitleStyle: { fontWeight: '800', fontSize: 16 },
          headerShadowVisible: false,
        }}>
        <Stack.Protected guard={!tecnico}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!!tecnico}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="registro/estado"
            options={{ title: 'Registrar lectura · Paso 1 de 2' }}
          />
          <Stack.Screen
            name="registro/revision"
            options={{ title: 'Revisión y evidencia · Paso 2 de 2' }}
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
    backgroundColor: c.text,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  cargaTxt: {
    color: '#FFFFFF',
    fontFamily: Fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
