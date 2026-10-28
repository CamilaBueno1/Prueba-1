import { Tabs } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { c } from '@/constants/estilos';
import { Fonts } from '@/constants/theme';
import { useBorradorStore } from '@/store/borrador';
import { useLecturasStore } from '@/store/lecturas';
import { useSesionStore } from '@/store/sesion';

export default function DisposicionTabs() {
  const cerrar = useSesionStore((s) => s.cerrar);
  const descartar = useBorradorStore((s) => s.descartar);
  const totalLecturas = useLecturasStore((s) => s.lecturas.length);

  const salir = () =>
    Alert.alert(
      'Finalizar turno',
      'Tus lecturas pendientes quedan resguardadas en el teléfono y se enviarán cuando haya señal.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            descartar();
            cerrar();
          },
        },
      ],
    );

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: c.backgroundElement,
          borderBottomWidth: 1.5,
          borderBottomColor: c.linea,
        },
        headerTitleStyle: { fontWeight: '800', color: c.text, fontSize: 17 },
        headerRight: () => (
          <Pressable
            onPress={salir}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            style={s.botonSalir}>
            <Text style={s.txtSalir}>CERRAR TURNO</Text>
          </Pressable>
        ),
        tabBarActiveTintColor: c.text,
        tabBarInactiveTintColor: c.textSecondary,
        tabBarActiveBackgroundColor: c.backgroundSelected,
        tabBarLabelStyle: {
          fontFamily: Fonts.mono,
          fontWeight: '800',
          fontSize: 12,
          letterSpacing: 0.8,
        },
        tabBarIconStyle: { display: 'none' },
        tabBarStyle: {
          backgroundColor: c.backgroundElement,
          borderTopWidth: 1.5,
          borderTopColor: c.linea,
          height: 58,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 6,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Consulta Catastral de Medidor',
          tabBarLabel: '1 · CONSULTAR MEDIDOR',
        }}
      />
      <Tabs.Screen
        name="lecturas"
        options={{
          title: 'Bitácora de Lecturas en Ruta',
          tabBarLabel:
            totalLecturas > 0 ? `2 · MIS LECTURAS (${totalLecturas})` : '2 · MIS LECTURAS',
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  botonSalir: {
    marginRight: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: c.error,
    backgroundColor: '#FFF5F5',
  },
  txtSalir: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    color: c.error,
    letterSpacing: 0.6,
  },
});
