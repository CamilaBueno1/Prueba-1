import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { RADIO, c } from '@/constants/estilos';
import { Fonts } from '@/constants/theme';

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
  const txt =
    tipo === 'primario'
      ? '#FFFFFF'
      : tipo === 'laton'
        ? '#0E2A33'
        : tipo === 'peligro'
          ? c.error
          : c.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: apagado }}
      disabled={apagado}
      onPress={onPress}
      style={({ pressed }) => [
        s.base,
        s[tipo],
        apagado && { opacity: 0.42 },
        pressed && !apagado && { transform: [{ translateY: 1 }], opacity: 0.92 },
      ]}>
      {cargando ? (
        <ActivityIndicator color={txt} />
      ) : (
        <Text style={[s.txt, { color: txt }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: RADIO,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: {
    fontFamily: Fonts.mono,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  primario: { backgroundColor: c.text, borderWidth: 1.5, borderColor: c.text },
  laton: { backgroundColor: c.laton, borderWidth: 1.5, borderColor: '#A66E18' },
  borde: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: c.text },
  peligro: { backgroundColor: '#FFF5F5', borderWidth: 1.5, borderColor: c.error },
});
