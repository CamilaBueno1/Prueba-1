import { StyleSheet } from 'react-native';
import { Colors } from './theme';

export const c = Colors.light;
export const RADIO = 12;

export const ui = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: c.background },
  contenido: { padding: 18, gap: 16, paddingBottom: 36 },
  titulo: { fontSize: 22, fontWeight: '700', color: c.text },
  subtitulo: { fontSize: 14, color: c.textSecondary, lineHeight: 20 },
  etiqueta: {
    fontSize: 13,
    fontWeight: '600',
    color: c.text,
  },
  etiquetaSecundaria: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textSecondary,
  },
  panel: {
    backgroundColor: c.backgroundElement,
    borderRadius: RADIO,
    borderWidth: 1,
    borderColor: c.linea,
    padding: 18,
    gap: 12,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  panelCabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.linea,
  },
  sello: {
    fontSize: 11,
    fontWeight: '700',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  error: { color: c.error, fontSize: 13, fontWeight: '600', marginTop: 4 },
});
