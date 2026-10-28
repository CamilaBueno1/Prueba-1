import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLecturasStore } from '@/store/lecturas';
import { useRedStore } from '@/store/red';
import { useSesionStore } from '@/store/sesion';

export function BannerRed() {
  const enLinea = useRedStore((s) => s.enLinea);
  const codigoTecnico = useSesionStore((s) => s.tecnico?.codigo);
  const pendientes = useLecturasStore(
    (s) =>
      s.lecturas.filter(
        (l) =>
          l.estadoEnvio !== 'enviada' &&
          (!codigoTecnico || l.tecnico === codigoTecnico),
      ).length,
  );
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={[
        s.barra,
        {
          paddingTop: top + 6,
          backgroundColor: enLinea ? '#003A70' : '#9A3412',
        },
      ]}
      accessibilityRole="header">
      <View style={s.izq}>
        <View style={[s.anillo, { borderColor: enLinea ? '#4ADE8055' : '#FDE04755' }]}>
          <View style={[s.punto, { backgroundColor: enLinea ? '#4ADE80' : '#FDE047' }]} />
        </View>
        <Text style={s.txt}>{enLinea ? 'Conectado a EPMAPS' : 'Modo sin conexión'}</Text>
      </View>
      <View style={s.pastilla}>
        <Text style={s.txtPastilla}>
          {pendientes === 0
            ? 'Sincronizado (0 pendientes)'
            : pendientes === 1
              ? '1 lectura por enviar'
              : `${pendientes} lecturas por enviar`}
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
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  izq: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  anillo: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  punto: { width: 6, height: 6, borderRadius: 3 },
  txt: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pastilla: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  txtPastilla: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
