import { router } from 'expo-router';
import { Alert, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { c, ui } from '@/constants/estilos';
import { Fonts } from '@/constants/theme';
import { borradorDeLectura } from '@/domain/fabrica';
import { fecha, hora, m3 } from '@/domain/formato';
import { Lectura } from '@/domain/tipos';
import { uriFoto } from '@/services/fotos';
import { sincronizar } from '@/services/sincronizacion';
import { useBorradorStore } from '@/store/borrador';
import { useLecturasStore } from '@/store/lecturas';
import { useRedStore } from '@/store/red';

const estadoVisible = (l: Lectura) =>
  l.estadoEnvio === 'enviada'
    ? {
        txt: l.requiereRevision ? 'ENVIADA · REVISIÓN EN OFICINA' : 'ENVIADA Y VERIFICADA',
        color: l.requiereRevision ? c.alerta : c.ok,
      }
    : l.estadoEnvio === 'enviando'
      ? { txt: 'ENVIANDO A OFICINA…', color: c.acento }
      : l.ultimoError
        ? { txt: 'ERROR DE ENVÍO · SE REINTENTA', color: c.error }
        : { txt: 'PENDIENTE DE VERIFICAR', color: c.alerta };

export default function MisLecturas() {
  const lecturas = useLecturasStore((s) => s.lecturas);
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
        'Registro sin terminar',
        'Tienes otro registro a medias. Si continúas con esta corrección, el borrador anterior se descartará.',
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
        lecturas.length > 0 ? (
          <View style={s.resumenBarra}>
            <Text style={ui.etiqueta}>
              Total en bitácora: {lecturas.length} · Por sincronizar: {pendientes}
            </Text>
            {pendientes > 0 && enLinea && (
              <Boton
                titulo="Sincronizar pendientes ahora"
                tipo="borde"
                onPress={() => void sincronizar()}
              />
            )}
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={[ui.panel, { alignItems: 'center', paddingVertical: 32 }]}>
          <Text style={ui.etiqueta}>Bitácora vacía</Text>
          <Text style={{ color: c.textSecondary, textAlign: 'center', lineHeight: 21 }}>
            Aún no registraste lecturas en este dispositivo.{'\n'}Dirígete a la pestaña &ldquo;Consultar medidor&rdquo; para iniciar.
          </Text>
        </View>
      }
      renderItem={({ item: l }) => {
        const e = estadoVisible(l);
        const foto = uriFoto(l.fotoNombre);
        return (
          <View style={[ui.panel, { borderLeftWidth: 5, borderLeftColor: e.color }]}>
            <View style={s.fila}>
              <Text style={s.codigo}>{l.medidorCodigo}</Text>
              <Text style={[s.estado, { color: e.color, borderColor: e.color }]}>{e.txt}</Text>
            </View>

            <Text style={ui.etiqueta}>
              {l.estadoMedidor === 'danado' ? 'Dañado' : l.estadoMedidor} · Período {l.mes} ·{' '}
              {fecha(l.tomadaEn)} {hora(l.tomadaEn)}
            </Text>

            {l.estadoMedidor === 'inaccesible' && (
              <Text style={s.texto}>Motivo de inaccesibilidad: {l.motivo}</Text>
            )}
            {l.estadoMedidor === 'danado' && (
              <Text style={s.texto}>Reporte de daño: {l.descripcionDano}</Text>
            )}
            {l.lectura != null && (
              <Text style={s.texto}>
                Lectura actual: <Text style={{ fontWeight: '800' }}>{m3(l.lectura)}</Text>
                {l.referencia.lecturaAnterior != null
                  ? ` · Anterior: ${m3(l.referencia.lecturaAnterior)} (${fecha(l.referencia.fechaAnterior)}) · Consumo: ${m3(l.consumo)}`
                  : ' · Sin lectura anterior local para comparar'}
              </Text>
            )}

            {l.anomalo && (
              <Text style={[s.texto, { color: c.error, fontWeight: '800' }]}>
                ▲ Consumo anómalo (supera el triple del promedio mensual)
              </Text>
            )}

            {!!l.ultimoError && l.estadoEnvio !== 'enviada' && (
              <Text style={[s.texto, { color: c.error, fontWeight: '700' }]}>
                Último intento: {l.ultimoError}
              </Text>
            )}

            {foto && (
              <Image source={{ uri: foto }} style={s.foto} accessibilityLabel="Foto del medidor" />
            )}

            {l.estadoEnvio === 'pendiente' && (
              <Boton titulo="Corregir lectura pendiente" tipo="borde" onPress={() => corregir(l)} />
            )}
            {l.estadoEnvio === 'enviando' && (
              <Text style={s.nota}>Se está transmitiendo a la oficina: espera un momento.</Text>
            )}
            {l.estadoEnvio === 'enviada' && (
              <Text style={s.nota}>
                Confirmada en oficina (ID #{l.remotoId}): registro bloqueado contra edición (R10).
              </Text>
            )}
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  resumenBarra: { gap: 8 },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  codigo: { fontFamily: Fonts.mono, fontSize: 18, fontWeight: '800', color: c.text },
  estado: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    borderWidth: 1.5,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexShrink: 1,
  },
  texto: { color: c.text, lineHeight: 20, fontSize: 14 },
  nota: { color: c.textSecondary, fontStyle: 'italic', fontSize: 12 },
  foto: {
    width: '100%',
    height: 150,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: c.linea,
    backgroundColor: c.linea,
  },
});
