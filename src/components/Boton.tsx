import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { c } from '@/constants/estilos';

type Props = {
  titulo: string;
  onPress: () => void;
  tipo?: 'primario' | 'laton' | 'borde' | 'peligro';
  cargando?: boolean;
  deshabilitado?: boolean;
};

export function Boton({
  titulo,
  onPress,
  tipo = 'primario',
  cargando = false,
  deshabilitado = false,
}: Props) {
  const apagado = deshabilitado || cargando;
  const esSolido = tipo === 'primario' || tipo === 'laton';
  const txt = esSolido ? '#FFFFFF' : tipo === 'peligro' ? c.error : c.acento;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: apagado }}
      disabled={apagado}
      onPress={onPress}
      style={({ pressed }) => [
        s.base,
        s[tipo],
        esSolido && !apagado && s.sombraSolida,
        apagado && { opacity: 0.45 },
        pressed && !apagado && { opacity: 0.9, transform: [{ scale: 0.99 }] },
      ]}>
      {cargando ? (
        <ActivityIndicator color={txt} />
      ) : (
        <View style={s.fila}>
          <Text style={[s.txt, { color: txt }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  txt: {
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  primario: {
    backgroundColor: c.acento,
  },
  laton: {
    backgroundColor: c.acento,
  },
  sombraSolida: {
    shadowColor: c.acento,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  borde: {
    backgroundColor: '#F0F6FC',
    borderWidth: 1.5,
    borderColor: c.acento,
  },
  peligro: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
});
