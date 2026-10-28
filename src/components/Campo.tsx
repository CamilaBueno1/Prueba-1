import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { RADIO, c, ui } from '@/constants/estilos';

type Props = TextInputProps & {
  etiqueta: string;
  error?: string;
  multilinea?: boolean;
  ayuda?: string;
};

export function Campo({ etiqueta, error, multilinea, ayuda, onFocus, onBlur, ...resto }: Props) {
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={s.contenedor}>
      <Text style={ui.etiqueta}>{etiqueta}</Text>
      <TextInput
        {...resto}
        multiline={multilinea}
        accessibilityLabel={etiqueta}
        placeholderTextColor={c.textSecondary}
        onFocus={(e) => {
          setEnfocado(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setEnfocado(false);
          onBlur?.(e);
        }}
        style={[
          s.entrada,
          multilinea && s.multilinea,
          enfocado && s.enfocado,
          !!error && s.conError,
          resto.editable === false && s.deshabilitado,
        ]}
      />
      {!!ayuda && !error && <Text style={s.ayuda}>{ayuda}</Text>}
      {!!error && <Text style={ui.error}>▲ {error}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  contenedor: { gap: 5 },
  entrada: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: c.linea,
    borderRadius: RADIO,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 50,
    fontSize: 16,
    fontWeight: '600',
    color: c.text,
  },
  multilinea: { minHeight: 92, textAlignVertical: 'top' },
  enfocado: { borderColor: c.acento, backgroundColor: '#FAFCFD' },
  conError: { borderColor: c.error, backgroundColor: '#FFF8F7' },
  deshabilitado: { backgroundColor: c.backgroundSelected, color: c.textSecondary },
  ayuda: { fontSize: 12, color: c.textSecondary },
});
