import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { c, ui } from '@/constants/estilos';

type Props = TextInputProps & {
  etiqueta: string;
  error?: string;
  multilinea?: boolean;
  ayuda?: string;
  mostrarContador?: boolean;
};

function IconoOjo({ abierto }: { abierto: boolean }) {
  return (
    <View style={s.ojoContenedor} pointerEvents="none">
      <View style={s.ojoContorno}>
        <View style={s.ojoPupila} />
      </View>
      {!abierto && <View style={s.ojoTachado} />}
    </View>
  );
}

function reconstruirClave(realAnterior: string, textoNuevo: string): string {
  const mascaraAnterior = '•'.repeat(realAnterior.length);
  let ini = 0;
  while (
    ini < mascaraAnterior.length &&
    ini < textoNuevo.length &&
    textoNuevo[ini] === '•'
  ) {
    ini++;
  }
  let fin = 0;
  while (
    fin < mascaraAnterior.length - ini &&
    fin < textoNuevo.length - ini &&
    textoNuevo[textoNuevo.length - 1 - fin] === '•'
  ) {
    fin++;
  }
  const insertado = textoNuevo.slice(ini, textoNuevo.length - fin);
  return (
    realAnterior.slice(0, ini) +
    insertado +
    realAnterior.slice(realAnterior.length - fin)
  );
}

export function Campo({
  etiqueta,
  error,
  multilinea,
  ayuda,
  secureTextEntry,
  maxLength,
  mostrarContador = true,
  value,
  onChangeText,
  onFocus,
  onBlur,
  ...resto
}: Props) {
  const [enfocado, setEnfocado] = useState(false);
  const [mostrarClave, setMostrarClave] = useState(false);

  const esCampoClave = !!secureTextEntry;
  const ocultarTexto = esCampoClave && !mostrarClave;
  const textoReal = typeof value === 'string' ? value : '';
  const longitudActual = textoReal.length;
  const valorMostrado = ocultarTexto ? '•'.repeat(longitudActual) : textoReal;

  const manejarCambioTexto = (nuevo: string) => {
    if (!onChangeText) return;
    if (ocultarTexto) {
      onChangeText(reconstruirClave(textoReal, nuevo));
    } else {
      onChangeText(nuevo);
    }
  };

  return (
    <View style={s.contenedor}>
      <View style={s.filaEtiqueta}>
        <Text style={[ui.etiqueta, enfocado && { color: c.acento }]}>{etiqueta}</Text>
        {maxLength != null && mostrarContador && (
          <Text
            style={[
              s.contador,
              longitudActual >= maxLength && { color: c.alerta, fontWeight: '700' },
            ]}>
            {longitudActual}/{maxLength}
          </Text>
        )}
      </View>
      <View style={s.envoltura}>
        <TextInput
          {...resto}
          value={valorMostrado}
          onChangeText={manejarCambioTexto}
          maxLength={maxLength}
          secureTextEntry={false}
          autoCorrect={esCampoClave ? false : resto.autoCorrect}
          spellCheck={esCampoClave ? false : resto.spellCheck}
          autoComplete={esCampoClave ? 'off' : resto.autoComplete}
          importantForAutofill={esCampoClave ? 'no' : resto.importantForAutofill}
          multiline={multilinea}
          accessibilityLabel={etiqueta}
          placeholderTextColor="#94A3B8"
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
            esCampoClave && { paddingRight: 104 },
            multilinea && s.multilinea,
            enfocado && s.enfocado,
            !!error && s.conError,
            resto.editable === false && s.deshabilitado,
          ]}
        />
        {esCampoClave && (
          <Pressable
            onPress={() => setMostrarClave((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            hitSlop={8}
            style={({ pressed }) => [s.botonOjo, pressed && { opacity: 0.7 }]}>
            <IconoOjo abierto={mostrarClave} />
            <Text style={s.textoOjo}>{mostrarClave ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        )}
      </View>
      {!!ayuda && !error && <Text style={s.ayuda}>{ayuda}</Text>}
      {!!error && (
        <View style={s.filaError}>
          <View style={s.puntoError} />
          <Text style={ui.error}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  contenedor: { gap: 6 },
  filaEtiqueta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contador: {
    fontSize: 11,
    fontWeight: '600',
    color: c.textSecondary,
  },
  envoltura: {
    position: 'relative',
    justifyContent: 'center',
  },
  entrada: {
    width: '100%',
    minHeight: 52,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: c.text,
  },
  multilinea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  enfocado: {
    borderColor: c.acento,
    backgroundColor: '#FFFFFF',
  },
  conError: {
    borderColor: c.error,
    backgroundColor: '#FEF2F2',
  },
  deshabilitado: {
    backgroundColor: '#EEF2F6',
  },
  botonOjo: {
    position: 'absolute',
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#E6F0FA',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  ojoContenedor: {
    width: 18,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ojoContorno: {
    width: 16,
    height: 10,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: c.acento,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ojoPupila: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.acento,
  },
  ojoTachado: {
    position: 'absolute',
    width: 18,
    height: 1.8,
    backgroundColor: c.acento,
    transform: [{ rotate: '-35deg' }],
  },
  textoOjo: {
    fontSize: 12,
    fontWeight: '700',
    color: c.acento,
  },
  ayuda: { fontSize: 12, color: c.textSecondary },
  filaError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  puntoError: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: c.error,
  },
});
