import { StyleSheet } from 'react-native';
import { Colors, Fonts } from './theme';

export const c = Colors.light;
export const RADIO = 6;

export const ui = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: c.background },
  contenido: { padding: 16, gap: 14, paddingBottom: 32 },
  titulo: { fontSize: 21, fontWeight: '800', color: c.text, letterSpacing: -0.3 },
  subtitulo: { fontSize: 13, color: c.textSecondary, lineHeight: 19 },
  etiqueta: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: c.textSecondary,
    textTransform: 'uppercase',
  },
  panel: {
    backgroundColor: c.backgroundElement,
    borderRadius: RADIO,
    borderWidth: 1.5,
    borderColor: c.linea,
    padding: 15,
    gap: 10,
  },
  panelCabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.linea,
  },
  sello: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    borderWidth: 1.5,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    textTransform: 'uppercase',
  },
  error: { color: c.error, fontSize: 13, fontWeight: '700', marginTop: 4 },
});
