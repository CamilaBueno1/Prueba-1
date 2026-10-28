import { zodResolver } from '@hookform/resolvers/zod';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Controller, Resolver, useForm, useWatch } from 'react-hook-form';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { Odometro } from '@/components/Odometro';
import { TecladoScroll } from '@/components/TecladoScroll';
import { c, ui } from '@/constants/estilos';
import { ValoresCodigo, esquemaCodigo } from '@/domain/esquemas';
import { borradorNuevo } from '@/domain/fabrica';
import { fecha, hora, m3 } from '@/domain/formato';
import { mesDe } from '@/domain/reglas';
import { Medidor } from '@/domain/tipos';
import { useMedidor } from '@/hooks/useMedidor';
import { sincronizar } from '@/services/sincronizacion';
import { useBorradorStore } from '@/store/borrador';
import { useLecturasStore } from '@/store/lecturas';
import { useSesionStore } from '@/store/sesion';

export default function Consultar() {
  const tecnico = useSesionStore((st) => st.tecnico);
  const borrador = useBorradorStore((st) => st.borrador);
  const iniciar = useBorradorStore((st) => st.iniciar);
  const descartar = useBorradorStore((st) => st.descartar);
  const lecturas = useLecturasStore((st) => st.lecturas);

  const [consultado, setConsultado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [oferta, setOferta] = useState(false);
  const [intentoEnvio, setIntentoEnvio] = useState(false);

  const { control, handleSubmit } = useForm<ValoresCodigo>({
    resolver: zodResolver(esquemaCodigo) as Resolver<ValoresCodigo>,
    mode: 'all',
    defaultValues: { codigo: '' },
  });
  const codigoEscrito = useWatch({ control, name: 'codigo' }) ?? '';

  // Validación 100% en tiempo real en cada tecla
  const validacionEnVivo = esquemaCodigo.safeParse({ codigo: codigoEscrito });
  const errorCodigoVivo =
    (codigoEscrito.length > 0 || intentoEnvio) && !validacionEnVivo.success
      ? validacionEnVivo.error.issues[0]?.message
      : undefined;

  const { data: medidor, isFetching, fetchStatus, error, dataUpdatedAt } = useMedidor(consultado);

  useFocusEffect(
    useCallback(() => {
      setOferta(useBorradorStore.getState().borrador != null);
      return () => setOferta(false);
    }, []),
  );

  const consultar = handleSubmit(
    (v) => {
      setIntentoEnvio(false);
      setAviso(null);
      setConsultado(v.codigo.trim());
    },
    () => {
      setIntentoEnvio(true);
      setAviso(null);
      setConsultado(null);
    },
  );

  const registrar = (m: Medidor | null) => {
    if (!consultado) return;
    const existente = useLecturasStore.getState().buscarPorMedidorMes(consultado, mesDe(new Date()));
    if (existente) {
      const esMia = existente.tecnico === tecnico?.codigo;
      setAviso(
        `El medidor ${consultado} ya cuenta con una lectura registrada en el período actual` +
          (esMia ? '. ' : ` (registrada por el operador ${existente.tecnico}). `) +
          (existente.estadoEnvio === 'enviada'
            ? 'La lectura ya fue enviada a la oficina y no admite cambios.'
            : esMia
              ? 'Aún se encuentra pendiente de envío: puedes corregirla desde la pestaña "Mis lecturas".'
              : 'Por regla de negocio (R10), no se puede registrar dos veces el mismo medidor en el mismo mes.'),
      );
      return;
    }
    iniciar(borradorNuevo(consultado, m));
    router.push('/registro/estado');
  };

  const continuar = () => {
    setOferta(false);
    router.push('/registro/estado');
    if (borrador?.paso === 'revision') router.push('/registro/revision');
  };

  const sinDatos =
    consultado != null &&
    medidor === undefined &&
    !isFetching &&
    (fetchStatus === 'paused' || !!error);

  const misLecturas = lecturas.filter((l) => l.tecnico === tecnico?.codigo);
  const enviadas = misLecturas.filter((l) => l.estadoEnvio === 'enviada').length;
  const pendientes = misLecturas.length - enviadas;

  return (
    <TecladoScroll desplazarAlAbrir={170}>
      {/* Banner Hero Corporativo Azul EPMAPS (sin imagen de logo) */}
      <View style={s.heroBienvenida}>
        <View style={s.circuloHero} pointerEvents="none" />
        <View style={s.filaHeroTop}>
          <View style={{ flex: 1 }}>
            <View style={s.badgeJornada}>
              <View style={s.puntoActivo} />
              <Text style={s.badgeJornadaTxt}>JORNADA EN CURSO</Text>
            </View>
            <Text style={s.saludo}>Bienvenido,</Text>
            <Text style={s.nombreOperador}>{tecnico?.nombre}</Text>
            <Text style={s.codigoOperador}>Operador {tecnico?.codigo}</Text>
          </View>
        </View>

        <View style={s.metricasBarra}>
          <View style={s.metricaCaja}>
            <Text style={s.metricaValor}>{misLecturas.length}</Text>
            <Text style={s.metricaEtiqueta}>Registradas</Text>
          </View>
          <View style={s.divisorMetrica} />
          <View style={s.metricaCaja}>
            <Text style={s.metricaValor}>{enviadas}</Text>
            <Text style={s.metricaEtiqueta}>Enviadas</Text>
          </View>
          <View style={s.divisorMetrica} />
          <View style={s.metricaCaja}>
            <Text style={[s.metricaValor, pendientes > 0 && { color: '#FDE047' }]}>
              {pendientes}
            </Text>
            <Text style={s.metricaEtiqueta}>Por enviar</Text>
          </View>
        </View>
      </View>

      {/* Tarjeta de Búsqueda */}
      <View style={s.tarjetaBusqueda}>
        <View style={s.franjaBicolor}>
          <View style={s.franjaRoja} />
          <View style={s.franjaAzul} />
        </View>
        <View style={s.cuerpoBusqueda}>
          <View style={{ gap: 4 }}>
            <Text style={s.tituloSeccion}>Consulta de medidor</Text>
            <Text style={ui.subtitulo}>
              Ingresa el código de la etiqueta para visualizar su ficha y registrar la lectura.
            </Text>
          </View>

          <Controller
            control={control}
            name="codigo"
            render={({ field }) => (
              <Campo
                etiqueta="Código del medidor"
                value={field.value}
                maxLength={10}
                placeholder="Ingrese el código (ej. MED-000101)"
                autoCapitalize="characters"
                autoCorrect={false}
                onBlur={field.onBlur}
                onChangeText={(t) => {
                  field.onChange(t);
                  setConsultado(null);
                  setAviso(null);
                }}
                error={errorCodigoVivo}
              />
            )}
          />
          <Boton titulo="Consultar medidor" onPress={consultar} cargando={isFetching} />
        </View>
      </View>

      {/* Aviso de lectura duplicada */}
      {!!aviso && (
        <View style={[ui.panel, s.panelAlerta]}>
          <View style={s.cabeceraAlerta}>
            <View style={s.indicadorAlerta} />
            <Text style={s.tituloAlerta}>Medidor ya registrado</Text>
          </View>
          <Text style={{ color: c.text, lineHeight: 20, fontSize: 14 }}>{aviso}</Text>
        </View>
      )}

      {/* Medidor no existe en MockAPI (404) */}
      {consultado != null && medidor === null && (
        <View style={[ui.panel, s.panelAlerta]}>
          <View style={s.cabeceraAlerta}>
            <View style={s.indicadorAlerta} />
            <Text style={s.tituloAlerta}>Medidor no encontrado</Text>
          </View>
          <Text style={{ color: c.text, lineHeight: 20, fontSize: 14 }}>
            No existe ningún medidor con el código {consultado} en el sistema de la oficina. Verifica los dígitos ingresados.
          </Text>
        </View>
      )}

      {/* Sin conexión y sin caché (R4) */}
      {sinDatos && (
        <View style={[ui.panel, s.panelAlerta]}>
          <View style={s.cabeceraAlerta}>
            <View style={s.indicadorAlerta} />
            <Text style={s.tituloAlerta}>
              {fetchStatus === 'paused'
                ? 'Sin conexión y sin datos en caché'
                : 'No se pudo conectar con el servidor'}
            </Text>
          </View>
          <Text style={{ color: c.textSecondary, lineHeight: 20, fontSize: 14 }}>
            Puedes registrar la lectura de {consultado} de todos modos: quedará marcada como pendiente de verificar y se comparará automáticamente al recuperar la señal.
          </Text>
          <Boton
            titulo="Registrar lectura sin datos del sistema"
            tipo="primario"
            onPress={() => registrar(null)}
          />
        </View>
      )}

      {/* Ficha Técnica del Medidor Encontrado */}
      {medidor && (
        <View style={s.fichaMedidor}>
          <View style={s.fichaCabecera}>
            <View>
              <Text style={s.fichaSub}>FICHA TÉCNICA DEL MEDIDOR</Text>
              <Text style={s.fichaCodigo}>{medidor.codigo}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <View style={s.badgeEstadoActivo}>
                <Text style={s.badgeEstadoTxt}>{medidor.estado}</Text>
              </View>
              <Text style={s.fichaHora}>Descargado {hora(dataUpdatedAt)}</Text>
            </View>
          </View>

          <View style={s.fichaCuerpo}>
            <View style={s.bloqueDireccion}>
              <Text style={ui.etiquetaSecundaria}>Dirección del predio</Text>
              <Text style={s.direccionValor}>{medidor.direccion}</Text>
            </View>

            <View style={s.grillaDatos}>
              <View style={s.celdaDato}>
                <Text style={ui.etiquetaSecundaria}>Sector</Text>
                <Text style={s.celdaValor}>{medidor.sector}</Text>
              </View>
              <View style={s.celdaDato}>
                <Text style={ui.etiquetaSecundaria}>N.º de cuenta</Text>
                <Text style={s.celdaValor}>{medidor.numeroCuenta}</Text>
              </View>
            </View>

            <View style={s.grillaDatos}>
              <View style={s.celdaDato}>
                <Text style={ui.etiquetaSecundaria}>Fecha anterior</Text>
                <Text style={s.celdaValor}>{fecha(medidor.fechaUltimaLectura)}</Text>
              </View>
              <View style={s.celdaDato}>
                <Text style={ui.etiquetaSecundaria}>Promedio mensual</Text>
                <Text style={[s.celdaValor, { color: c.acento }]}>
                  {m3(medidor.consumoPromedio)}
                </Text>
              </View>
            </View>

            <View style={s.bloqueOdometro}>
              <Text style={ui.etiquetaSecundaria}>Última lectura registrada en oficina</Text>
              <Odometro valor={medidor.ultimaLectura} />
            </View>

            <Boton
              titulo="Registrar nueva lectura"
              tipo="primario"
              onPress={() => registrar(medidor)}
            />
          </View>
        </View>
      )}

      {/* Modal de Recuperación de Borrador (R8) */}
      <Modal
        transparent
        visible={oferta}
        animationType="fade"
        onRequestClose={() => setOferta(false)}>
        <View style={s.fondoModal}>
          <View style={s.tarjetaModal}>
            <View style={s.franjaBicolor}>
              <View style={s.franjaRoja} />
              <View style={s.franjaAzul} />
            </View>
            <View style={{ padding: 22, gap: 14 }}>
              <Text style={s.etiquetaModal}>CAPTURA PENDIENTE</Text>
              <Text style={ui.titulo}>Registro sin terminar</Text>
              <Text style={{ color: c.textSecondary, lineHeight: 20, fontSize: 14 }}>
                Quedó a medias {borrador?.modo === 'correccion' ? 'la corrección' : 'el registro'} del medidor{' '}
                <Text style={{ fontWeight: '800', color: c.acento }}>{borrador?.codigo}</Text>. ¿Deseas continuar donde te quedaste o descartarlo?
              </Text>
              <Boton titulo="Continuar con el registro" tipo="primario" onPress={continuar} />
              <Boton
                titulo="Descartar borrador"
                tipo="peligro"
                onPress={() => {
                  setOferta(false);
                  descartar();
                  void sincronizar();
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </TecladoScroll>
  );
}

const s = StyleSheet.create({
  heroBienvenida: {
    backgroundColor: c.acento,
    borderRadius: 20,
    padding: 20,
    gap: 18,
    overflow: 'hidden',
    shadowColor: c.acento,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
  },
  circuloHero: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -50,
    right: -40,
  },
  filaHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeJornada: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  puntoActivo: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  badgeJornadaTxt: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  saludo: {
    color: '#BFDBFE',
    fontSize: 14,
    fontWeight: '600',
  },
  nombreOperador: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 1,
  },
  codigoOperador: {
    color: '#DBEAFE',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  metricasBarra: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 37, 64, 0.28)',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  metricaCaja: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divisorMetrica: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  metricaValor: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  metricaEtiqueta: {
    color: '#DBEAFE',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tarjetaBusqueda: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.linea,
    overflow: 'hidden',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  franjaBicolor: {
    flexDirection: 'row',
    height: 5,
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
  cuerpoBusqueda: {
    padding: 18,
    gap: 14,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: '800',
    color: c.text,
  },
  panelAlerta: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  cabeceraAlerta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicadorAlerta: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: c.alerta,
  },
  tituloAlerta: {
    color: c.alerta,
    fontWeight: '800',
    fontSize: 15,
  },
  fichaMedidor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.linea,
    overflow: 'hidden',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  fichaCabecera: {
    backgroundColor: '#0A2540',
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fichaSub: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  fichaCodigo: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  badgeEstadoActivo: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeEstadoTxt: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
  },
  fichaHora: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  fichaCuerpo: {
    padding: 18,
    gap: 14,
  },
  bloqueDireccion: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.linea,
    gap: 4,
  },
  direccionValor: {
    color: c.text,
    fontSize: 15,
    fontWeight: '700',
  },
  grillaDatos: {
    flexDirection: 'row',
    gap: 10,
  },
  celdaDato: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.linea,
    gap: 4,
  },
  celdaValor: {
    color: c.text,
    fontSize: 14,
    fontWeight: '700',
  },
  bloqueOdometro: {
    gap: 8,
    paddingVertical: 4,
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(10, 37, 64, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  tarjetaModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  etiquetaModal: {
    fontSize: 11,
    fontWeight: '800',
    color: c.acento,
    letterSpacing: 0.8,
  },
});
