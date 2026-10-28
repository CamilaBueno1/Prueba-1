import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { c } from '@/constants/estilos';
import { Fonts } from '@/constants/theme';
import { useLecturasStore } from '@/store/lecturas';
import { useRedStore } from '@/store/red';

export function BannerRed() {
  // Dos selectores atómicos (ADR-004): este banner solo se redibuja si cambia la red o el conteo
  const enLinea = useRedStore((s) => s.enLinea);
  const pendientes = useLecturasStore(
    (s) => s.lecturas.filter((l) => l.estadoEnvio !== 'enviada').length,
  );
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={[
        s.barra,
        {
          paddingTop: top + 6,
          backgroundColor: enLinea ? c.text : c.alerta,
          borderBottomColor: enLinea ? c.acento : '#7C3704',
        },
      ]}
      accessibilityRole="header">
      <View style={s.izq}>
        <View style={[s.punto, { backgroundColor: enLinea ? '#5FD3B0' : '#FFE08A' }]} />
        <Text style={s.txt}>{enLinea ? 'EN LÍNEA · OFICINA' : 'SIN CONEXIÓN · MODO CAMPO'}</Text>
      </View>
      <View style={s.pastilla}>
        <Text style={s.txtPastilla}>
          {pendientes === 0
            ? 'COLA AL DÍA (0)'
            : pendientes === 1
              ? '1 POR ENVIAR'
              : `${pendientes} POR ENVIAR`}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 8,
    borderBottomWidth: 2,
  },
  izq: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  punto: { width: 9, height: 9, borderRadius: 5 },
  txt: {
    color: '#FFFFFF',
    fontFamily: Fonts.mono,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  pastilla: {
    backgroundColor: '#00000033',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  txtPastilla: {
    color: '#FFFFFF',
    fontFamily: Fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
