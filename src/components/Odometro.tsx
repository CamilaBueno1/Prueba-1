import { StyleSheet, Text, View } from 'react-native';
import { c, ui } from '@/constants/estilos';
import { Fonts } from '@/constants/theme';

export function Odometro({ valor }: { valor: number | null }) {
  if (valor == null) {
    return (
      <View style={s.sinDatoCaja}>
        <Text style={ui.etiqueta}>SIN REGISTRO NUMÉRICO EN SISTEMA</Text>
      </View>
    );
  }
  const entero = String(Math.trunc(valor)).padStart(6, '0');
  const dec = valor % 1 ? String(Math.round((valor % 1) * 100)).padStart(2, '0') : null;

  return (
    <View style={s.marco} accessibilityLabel={`${valor} metros cúbicos`}>
      <View style={s.fila}>
        {entero.split('').map((d, i) => (
          <View key={i} style={s.digito}>
            <Text style={s.txt}>{d}</Text>
          </View>
        ))}
        {dec && (
          <>
            <Text style={s.coma}>,</Text>
            <View style={[s.digito, s.decimal]}>
              <Text style={s.txt}>{dec}</Text>
            </View>
          </>
        )}
        <View style={s.unidadCaja}>
          <Text style={s.unidad}>m³</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  marco: {
    backgroundColor: '#F3F6F8',
    borderWidth: 1.5,
    borderColor: c.linea,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  digito: {
    width: 26,
    height: 36,
    borderRadius: 3,
    backgroundColor: c.text,
    borderBottomWidth: 2,
    borderBottomColor: '#061318',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decimal: {
    backgroundColor: c.error,
    borderBottomColor: '#7A1712',
    width: 36,
  },
  coma: {
    fontFamily: Fonts.mono,
    fontSize: 18,
    fontWeight: '800',
    color: c.error,
    marginHorizontal: 1,
  },
  txt: { color: '#F4E9D0', fontFamily: Fonts.mono, fontSize: 18, fontWeight: '800' },
  unidadCaja: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: c.backgroundSelected,
    borderRadius: 4,
  },
  unidad: { fontFamily: Fonts.mono, fontSize: 12, fontWeight: '800', color: c.text },
  sinDatoCaja: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: c.background,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: c.linea,
    alignSelf: 'flex-start',
  },
});
