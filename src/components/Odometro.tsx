import { StyleSheet, Text, View } from 'react-native';
import { c, ui } from '@/constants/estilos';
import { Fonts } from '@/constants/theme';

export function Odometro({ valor }: { valor: number | null }) {
  if (valor == null) {
    return (
      <View style={s.sinDatoCaja}>
        <Text style={ui.etiquetaSecundaria}>Sin lectura registrada</Text>
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
        <View style={s.unidadBadge}>
          <Text style={s.unidad}>m³</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  marco: {
    backgroundColor: '#F0F6FC',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  digito: {
    width: 28,
    height: 38,
    borderRadius: 6,
    backgroundColor: '#0A2540',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  decimal: {
    backgroundColor: c.rojoQuito,
    width: 36,
  },
  coma: {
    fontSize: 18,
    fontWeight: '800',
    color: c.rojoQuito,
  },
  txt: { color: '#FFFFFF', fontFamily: Fonts.mono, fontSize: 17, fontWeight: '700' },
  unidadBadge: {
    marginLeft: 6,
    backgroundColor: c.acento,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unidad: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sinDatoCaja: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
});
