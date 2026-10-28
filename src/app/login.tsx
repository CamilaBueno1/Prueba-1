import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { c, ui } from '@/constants/estilos';
import { Fonts } from '@/constants/theme';
import { useSesionStore } from '@/store/sesion';

export default function Login() {
  const iniciar = useSesionStore((s) => s.iniciar);
  const [codigo, setCodigo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);

  const entrar = () => {
    if (!codigo.trim() || !clave) {
      setError('Escribe tu código de empleado y tu clave.');
      return;
    }
    if (!iniciar(codigo, clave)) {
      setError('Código o clave incorrectos.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={ui.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={ui.pantalla}
        contentContainerStyle={[ui.contenido, s.contenedor]}
        keyboardShouldPersistTaps="handled">
        <View style={s.cabeceraInstitucional}>
          <View style={s.franjaSuperior}>
            <Text style={s.marca}>AQUARUTA · CAMPO</Text>
            <Text style={s.selloDivision}>CATASTRO Y LECTURAS</Text>
          </View>
          <Text style={ui.titulo}>Terminal de Lectura Hidrométrica</Text>
          <Text style={s.sub}>
            Identifícate con tu credencial de operador para consultar medidores y registrar consumos mensuales en ruta.
          </Text>
        </View>

        <View style={ui.panel}>
          <View style={ui.panelCabecera}>
            <Text style={ui.etiqueta}>Credencial de operador técnico</Text>
            <Text style={[ui.sello, { color: c.acento, borderColor: c.acento }]}>RUTA QUITO</Text>
          </View>

          <Campo
            etiqueta="Código de empleado"
            value={codigo}
            onChangeText={(t) => {
              setCodigo(t);
              setError(null);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="EMP-1001"
          />

          <Campo
            etiqueta="Clave de acceso"
            value={clave}
            onChangeText={(t) => {
              setClave(t);
              setError(null);
            }}
            secureTextEntry
            autoCapitalize="none"
            placeholder="••••••••"
            error={error ?? undefined}
          />

          <Boton titulo="Iniciar jornada en campo" onPress={entrar} />
        </View>

        <View style={s.guiaCredenciales}>
          <Text style={ui.etiqueta}>Operadores habilitados para evaluación</Text>
          <Text style={s.credencialItem}>• EMP-1001 / agua2026 — Carlos Pilatuña</Text>
          <Text style={s.credencialItem}>• EMP-1002 / quito2026 — María Quishpe</Text>
        </View>

        <Text style={s.pie}>
          Prototipo académico · caso de uso de EPMAPS, Quito. No es una aplicación oficial de la empresa.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  contenedor: { flexGrow: 1, justifyContent: 'center' },
  cabeceraInstitucional: {
    backgroundColor: c.text,
    borderRadius: 6,
    padding: 16,
    borderLeftWidth: 5,
    borderLeftColor: c.laton,
    gap: 6,
  },
  franjaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  marca: {
    fontFamily: Fonts.mono,
    letterSpacing: 2.5,
    color: c.laton,
    fontWeight: '800',
    fontSize: 13,
  },
  selloDivision: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: '#A7C0C8',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  sub: { color: '#D5E0E4', fontSize: 13, lineHeight: 19 },
  guiaCredenciales: {
    backgroundColor: '#DCE5E8',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: c.linea,
    gap: 4,
  },
  credencialItem: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: c.text,
    fontWeight: '600',
  },
  pie: {
    color: c.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },
});
