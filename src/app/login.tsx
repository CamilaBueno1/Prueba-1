import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { TecladoScroll } from '@/components/TecladoScroll';
import { c } from '@/constants/estilos';
import { useSesionStore } from '@/store/sesion';

const FORMATO_EMP = /^EMP-\d{4}$/i;

export default function Login() {
  const iniciar = useSesionStore((s) => s.iniciar);
  const [codigo, setCodigo] = useState('');
  const [clave, setClave] = useState('');
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null);
  const [errorClave, setErrorClave] = useState<string | null>(null);

  const alCambiarCodigo = (t: string) => {
    setCodigo(t);
    setErrorClave(null);
    const limpio = t.trim();
    if (!limpio) {
      setErrorCodigo('El código de empleado es obligatorio.');
    } else if (!FORMATO_EMP.test(limpio)) {
      setErrorCodigo('Use el formato EMP- seguido de 4 dígitos.');
    } else {
      setErrorCodigo(null);
    }
  };

  const alCambiarClave = (t: string) => {
    setClave(t);
    if (!t) {
      setErrorClave('La contraseña es obligatoria.');
    } else if (t.length < 4) {
      setErrorClave('La contraseña debe tener al menos 4 caracteres.');
    } else {
      setErrorClave(null);
    }
  };

  const entrar = () => {
    const limpio = codigo.trim();
    if (!limpio || !FORMATO_EMP.test(limpio)) {
      setErrorCodigo('Use el formato EMP- seguido de 4 dígitos (ej. EMP-1001).');
      return;
    }
    if (!clave) {
      setErrorClave('Por favor, ingrese su contraseña.');
      return;
    }
    if (!iniciar(codigo, clave)) {
      setErrorClave('El código o la contraseña ingresados son incorrectos.');
    }
  };

  return (
    <TecladoScroll contentContainerStyle={s.scroll} desplazarAlAbrir={200}>
      {/* Cabecera Institucional Azul EPMAPS */}
      <View style={s.heroAzul}>
        <View style={s.circuloDecorativo1} pointerEvents="none" />
        <View style={s.circuloDecorativo2} pointerEvents="none" />

        <View style={s.insigniaSuperior}>
          <View style={s.puntoRojo} />
          <Text style={s.insigniaTxt}>SISTEMA DE GESTIÓN COMERCIAL EN CAMPO</Text>
        </View>

        <View style={s.logoTarjeta}>
          <Image
            source={require('../../assets/images/logo.jpg')}
            style={s.logo}
            resizeMode="contain"
            accessibilityLabel="Logotipo EPMAPS Agua de Quito"
          />
        </View>
      </View>

      {/* Tarjeta de Inicio de Sesión */}
      <View style={s.contenedorFormulario}>
        <View style={s.tarjetaFormulario}>
          <View style={s.franjaBicolor}>
            <View style={s.franjaRoja} />
            <View style={s.franjaAzul} />
          </View>

          <View style={s.cuerpoFormulario}>
            <View style={s.encabezadoSaludo}>
              <Text style={s.etiquetaAcceso}>PORTAL DE OPERADORES</Text>
              <Text style={s.bienvenido}>Bienvenido</Text>
              <Text style={s.sub}>
                Identifícate con tu credencial institucional para iniciar el registro de lecturas.
              </Text>
            </View>

            <Campo
              etiqueta="Código de empleado"
              value={codigo}
              maxLength={8}
              onChangeText={alCambiarCodigo}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="Ingrese su código"
              error={errorCodigo ?? undefined}
            />

            <Campo
              etiqueta="Contraseña"
              value={clave}
              maxLength={20}
              onChangeText={alCambiarClave}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Ingrese su contraseña"
              error={errorClave ?? undefined}
            />

            <View style={{ marginTop: 6 }}>
              <Boton titulo="Iniciar sesión" onPress={entrar} />
            </View>
          </View>
        </View>

        <View style={s.selloPie}>
          <View style={s.lineaPie} />
          <Text style={s.pie}>
            Prototipo académico · Caso de uso de EPMAPS, Quito. No es una aplicación oficial de la empresa.
          </Text>
        </View>
      </View>
    </TecladoScroll>
  );
}

const s = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: 0,
    paddingBottom: 32,
    gap: 18,
  },
  heroAzul: {
    backgroundColor: c.acento,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  circuloDecorativo1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    top: -60,
    right: -50,
  },
  circuloDecorativo2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -40,
    left: -40,
  },
  insigniaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  puntoRojo: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.rojoQuito,
  },
  insigniaTxt: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  logoTarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 190,
    height: 78,
  },
  contenedorFormulario: {
    paddingHorizontal: 18,
    gap: 18,
  },
  tarjetaFormulario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  franjaBicolor: {
    flexDirection: 'row',
    height: 6,
    width: '100%',
  },
  franjaRoja: {
    flex: 1,
    backgroundColor: c.rojoQuito,
  },
  franjaAzul: {
    flex: 2,
    backgroundColor: c.acento,
  },
  cuerpoFormulario: {
    padding: 22,
    gap: 16,
  },
  encabezadoSaludo: {
    gap: 4,
  },
  etiquetaAcceso: {
    fontSize: 11,
    fontWeight: '800',
    color: c.acento,
    letterSpacing: 1,
  },
  bienvenido: {
    fontSize: 25,
    fontWeight: '800',
    color: c.text,
  },
  sub: {
    color: c.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  selloPie: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  lineaPie: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  pie: {
    color: c.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
