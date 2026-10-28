import { Tabs } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { c, ui } from '@/constants/estilos';
import { useBorradorStore } from '@/store/borrador';
import { useLecturasStore } from '@/store/lecturas';
import { useSesionStore } from '@/store/sesion';

export default function DisposicionTabs() {
  const tecnico = useSesionStore((s) => s.tecnico);
  const cerrar = useSesionStore((s) => s.cerrar);
  const descartar = useBorradorStore((s) => s.descartar);
  const todasLecturas = useLecturasStore((s) => s.lecturas);
  const totalLecturas = todasLecturas.filter((l) => l.tecnico === tecnico?.codigo).length;

  const [modalSalir, setModalSalir] = useState(false);

  const confirmarSalida = () => {
    setModalSalir(false);
    descartar();
    cerrar();
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: c.backgroundElement,
            borderBottomWidth: 1,
            borderBottomColor: c.linea,
          },
          headerTitleStyle: { fontWeight: '800', color: c.text, fontSize: 17 },
          headerRight: () => (
            <Pressable
              onPress={() => setModalSalir(true)}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
              style={({ pressed }) => [s.botonSalir, pressed && { opacity: 0.75 }]}>
              <Text style={s.txtSalir}>Cerrar sesión</Text>
            </Pressable>
          ),
          tabBarActiveTintColor: c.acento,
          tabBarInactiveTintColor: c.textSecondary,
          tabBarActiveBackgroundColor: '#F0F6FC',
          tabBarLabelStyle: {
            fontWeight: '700',
            fontSize: 13,
          },
          tabBarIconStyle: { display: 'none' },
          tabBarStyle: {
            backgroundColor: c.backgroundElement,
            borderTopWidth: 1,
            borderTopColor: c.linea,
            height: 60,
            paddingHorizontal: 10,
            paddingVertical: 6,
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            marginHorizontal: 4,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Panel de Lecturas',
            tabBarLabel: 'Consultar medidor',
          }}
        />
        <Tabs.Screen
          name="lecturas"
          options={{
            title: 'Historial de Lecturas',
            tabBarLabel: totalLecturas > 0 ? `Mis lecturas (${totalLecturas})` : 'Mis lecturas',
          }}
        />
      </Tabs>

      <Modal
        transparent
        visible={modalSalir}
        animationType="fade"
        onRequestClose={() => setModalSalir(false)}>
        <View style={s.fondoModal}>
          <View style={s.tarjetaModal}>
            <View style={s.franjaBicolor}>
              <View style={s.franjaRoja} />
              <View style={s.franjaAzul} />
            </View>

            <View style={s.cuerpoModal}>
              <Text style={ui.titulo}>Cerrar sesión</Text>
              <Text style={s.textoAviso}>
                ¿Estás seguro de que deseas salir? Tus lecturas pendientes se conservarán en el teléfono.
              </Text>

              <View style={s.filaBotones}>
                <View style={{ flex: 1 }}>
                  <Boton
                    titulo="Cancelar"
                    tipo="borde"
                    onPress={() => setModalSalir(false)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Boton
                    titulo="Cerrar sesión"
                    tipo="peligro"
                    onPress={confirmarSalida}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  botonSalir: {
    marginRight: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  txtSalir: {
    fontSize: 12,
    fontWeight: '700',
    color: c.error,
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(10, 37, 64, 0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  tarjetaModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: c.linea,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 5,
  },
  franjaBicolor: {
    flexDirection: 'row',
    height: 5,
    width: '100%',
  },
  franjaRoja: {
    flex: 1,
    backgroundColor: c.rojoQuito,
  },
  franjaAzul: {
    flex: 2,
    backgroundColor: c.acento,
  },
  cuerpoModal: {
    padding: 20,
    gap: 12,
  },
  textoAviso: {
    fontSize: 14,
    lineHeight: 20,
    color: c.textSecondary,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
});
