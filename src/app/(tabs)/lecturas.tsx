import { router } from 'expo-router';
import { Alert, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { c, ui } from '@/constants/estilos';
import { borradorDeLectura } from '@/domain/fabrica';
import { fecha, hora, m3 } from '@/domain/formato';
import { Lectura } from '@/domain/tipos';
import { uriFoto } from '@/services/fotos';
import { sincronizar } from '@/services/sincronizacion';
import { useBorradorStore } from '@/store/borrador';
import { useLecturasStore } from '@/store/lecturas';
import { useRedStore } from '@/store/red';
import { useSesionStore } from '@/store/sesion';

const estadoVisible = (l: Lectura) =>
  l.estadoEnvio === 'enviada'
    ? {
        txt: l.requiereRevision ? 'Enviada · En revisión' : 'Enviada',
        color: l.requiereRevision ? c.alerta : c.ok,
        fondo: l.requiereRevision ? '#FEF3C7' : '#DCFCE7',
      }
    : l.estadoEnvio === 'enviando'
      ? { txt: 'Enviando…', color: c.acento, fondo: '#E6F0FA' }
      : l.ultimoError
        ? { txt: 'Error de envío · Reintentando', color: c.error, fondo: '#FEE2E2' }
        : { txt: 'Pendiente de verificar', color: c.alerta, fondo: '#FEF3C7' };

export default function MisLecturas() {
  const codigoTecnico = useSesionStore((s) => s.tecnico?.codigo);
  const todasLecturas = useLecturasStore((s) => s.lecturas);
  const lecturas = todasLecturas.filter((l) => l.tecnico === codigoTecnico);
  const enLinea = useRedStore((s) => s.enLinea);
  const pendientes = lecturas.filter((l) => l.estadoEnvio !== 'enviada').length;

  const corregir = (l: Lectura) => {
    const abrir = () => {
      useBorradorStore.getState().iniciar(borradorDeLectura(l));
      router.push('/registro/estado');
    };
    const actual = useBorradorStore.getState().borrador;
    if (actual && actual.idLocal !== l.idLocal) {
      Alert.alert(
        'Registro pendiente',
        'Tienes otro registro sin terminar. Si continúas, se descartará el anterior.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: abrir },
        ],
      );
    } else {
      abrir();
    }
  };

  return (
    <FlatList
      style={ui.pantalla}
      contentContainerStyle={ui.contenido}
      data={lecturas}
      keyExtractor={(l) => l.idLocal}
      ListHeaderComponent={
        lecturas.length > 0 && pendientes > 0 && enLinea ? (
          <Boton
            titulo="Sincronizar lecturas pendientes"
            tipo="borde"
            onPress={() => void sincronizar()}
          />
        ) : null
      }
      ListEmptyComponent={
        <View style={[ui.panel, { alignItems: 'center', paddingVertical: 40, gap: 8 }]}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: c.text }}>
            Sin lecturas registradas
          </Text>
          <Text style={{ color: c.textSecondary, textAlign: 'center', lineHeight: 20 }}>
            Consulta un medidor en la pestaña principal para registrar tu primera lectura del recorrido.
          </Text>
        </View>
      }
      renderItem={({ item: l }) => {
        const e = estadoVisible(l);
        const foto = uriFoto(l.fotoNombre);
        const nombreEstado =
          l.estadoMedidor === 'danado'
            ? 'Dañado'
            : l.estadoMedidor === 'inaccesible'
              ? 'Inaccesible'
              : 'Normal';

        return (
          <View style={s.tarjetaLectura}>
            <View style={[s.franjaSuperior, { backgroundColor: e.color }]} />
            <View style={s.cuerpoTarjeta}>
              <View style={s.filaCabecera}>
                <View>
                  <Text style={s.codigo}>{l.medidorCodigo}</Text>
                  <Text style={ui.etiquetaSecundaria}>
                    Estado: {nombreEstado} · {fecha(l.tomadaEn)} ({hora(l.tomadaEn)})
                  </Text>
                </View>
                <Text style={[ui.sello, { color: e.color, backgroundColor: e.fondo }]}>
                  {e.txt}
                </Text>
              </View>

              {l.estadoMedidor === 'inaccesible' && (
                <View style={s.cajaDetalle}>
                  <Text style={ui.etiquetaSecundaria}>Motivo de inaccesibilidad</Text>
                  <Text style={s.texto}>{l.motivo}</Text>
                </View>
              )}

              {l.estadoMedidor === 'danado' && (
                <View style={s.cajaDetalle}>
                  <Text style={ui.etiquetaSecundaria}>Daño reportado</Text>
                  <Text style={s.texto}>{l.descripcionDano}</Text>
                </View>
              )}

              {l.lectura != null && (
                <View style={s.grillaValores}>
                  <View style={s.celdaValor}>
                    <Text style={ui.etiquetaSecundaria}>Lectura</Text>
                    <Text style={s.valorDestacado}>{m3(l.lectura)}</Text>
                  </View>
                  <View style={s.celdaValor}>
                    <Text style={ui.etiquetaSecundaria}>Anterior</Text>
                    <Text style={s.valorSecundario}>{m3(l.referencia.lecturaAnterior)}</Text>
                  </View>
                  <View style={s.celdaValor}>
                    <Text style={ui.etiquetaSecundaria}>Consumo</Text>
                    <Text
                      style={[
                        s.valorDestacado,
                        { color: l.anomalo ? c.error : c.acento },
                      ]}>
                      {m3(l.consumo)}
                    </Text>
                  </View>
                </View>
              )}

              {l.anomalo && (
                <View style={s.badgeAnomalo}>
                  <Text style={s.badgeAnomaloTxt}>
                    Consumo anómalo (supera el triple del promedio mensual)
                  </Text>
                </View>
              )}

              {!!l.ultimoError && l.estadoEnvio !== 'enviada' && (
                <Text style={[s.texto, { color: c.error, fontWeight: '600' }]}>
                  Último intento: {l.ultimoError}
                </Text>
              )}

              {foto && (
                <Image
                  source={{ uri: foto }}
                  style={s.foto}
                  accessibilityLabel="Foto del medidor"
                />
              )}

              {l.estadoEnvio === 'pendiente' && (
                <Boton titulo="Corregir lectura" tipo="borde" onPress={() => corregir(l)} />
              )}
              {l.estadoEnvio === 'enviando' && (
                <Text style={s.nota}>Enviando a la oficina, espera un momento…</Text>
              )}
              {l.estadoEnvio === 'enviada' && (
                <Text style={s.nota}>Lectura confirmada en oficina (no editable).</Text>
              )}
            </View>
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  tarjetaLectura: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.linea,
    overflow: 'hidden',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  franjaSuperior: {
    height: 4,
    width: '100%',
  },
  cuerpoTarjeta: {
    padding: 16,
    gap: 12,
  },
  filaCabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  codigo: { fontSize: 19, fontWeight: '800', color: c.text },
  cajaDetalle: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.linea,
    gap: 2,
  },
  grillaValores: {
    flexDirection: 'row',
    gap: 8,
  },
  celdaValor: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.linea,
    alignItems: 'center',
    gap: 2,
  },
  valorDestacado: {
    fontSize: 14,
    fontWeight: '800',
    color: c.text,
  },
  valorSecundario: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textSecondary,
  },
  badgeAnomalo: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  badgeAnomaloTxt: {
    color: c.error,
    fontSize: 12,
    fontWeight: '700',
  },
  texto: { color: c.text, lineHeight: 20, fontSize: 14 },
  nota: { color: c.textSecondary, fontSize: 12 },
  foto: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
});
