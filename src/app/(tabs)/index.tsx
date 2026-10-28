import { zodResolver } from '@hookform/resolvers/zod';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Controller, Resolver, useForm } from 'react-hook-form';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { Odometro } from '@/components/Odometro';
import { c, ui } from '@/constants/estilos';
import { Fonts } from '@/constants/theme';
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

const Fila = ({ t, v }: { t: string; v: string }) => (
  <View style={s.fila}>
    <Text style={ui.etiqueta}>{t}</Text>
    <Text style={s.valor}>{v}</Text>
  </View>
);

export default function Consultar() {
  const tecnico = useSesionStore((st) => st.tecnico);
  const borrador = useBorradorStore((st) => st.borrador);
  const iniciar = useBorradorStore((st) => st.iniciar);
  const descartar = useBorradorStore((st) => st.descartar);

  const [consultado, setConsultado] = useState<string | null>(null); // código que SÍ pasó la validación
  const [aviso, setAviso] = useState<string | null>(null);
  const [oferta, setOferta] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ValoresCodigo>({
    resolver: zodResolver(esquemaCodigo) as Resolver<ValoresCodigo>,
    defaultValues: { codigo: '' },
  });
  const { data: medidor, isFetching, fetchStatus, error, dataUpdatedAt } = useMedidor(consultado);

  // R8: cada vez que esta pantalla toma el foco (también al abrir la app) se ofrece continuar o descartar
  useFocusEffect(
    useCallback(() => {
      setOferta(useBorradorStore.getState().borrador != null);
      return () => setOferta(false);
    }, []),
  );

  // R2: solo un código válido llega a setConsultado. Si falla, se borra lo que hubiera en pantalla.
  // Se recorta espacios laterales (.trim()), pero no se fuerza mayúsculas porque med-123456 no cumple R2 (ADR-003).
  const consultar = handleSubmit(
    (v) => {
      setAviso(null);
      setConsultado(v.codigo.trim());
    },
    () => {
      setAviso(null);
      setConsultado(null);
    },
  );

  const registrar = (m: Medidor | null) => {
    if (!consultado) return;
    const existente = useLecturasStore.getState().buscarPorMedidorMes(consultado, mesDe(new Date()));
    if (existente) {
      // R10: un medidor no se registra dos veces en el mismo mes
      setAviso(
        `${consultado} ya tiene una lectura registrada este mes (${existente.mes}). ` +
          (existente.estadoEnvio === 'enviada'
            ? 'Ya fue enviada a la oficina y no se puede modificar.'
            : 'Aún está pendiente: puedes corregirla en la pestaña "Mis lecturas".'),
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

  return (
    <ScrollView
      style={ui.pantalla}
      contentContainerStyle={ui.contenido}
      keyboardShouldPersistTaps="handled">
      <View style={s.fichaOperador}>
        <View>
          <Text style={ui.etiqueta}>Operador en turno</Text>
          <Text style={s.nombreOperador}>{tecnico?.nombre}</Text>
        </View>
        <Text style={[ui.sello, { color: c.text, borderColor: c.linea, backgroundColor: '#FFF' }]}>
          {tecnico?.codigo}
        </Text>
      </View>

      <View style={ui.panel}>
        <View style={ui.panelCabecera}>
          <Text style={ui.etiqueta}>Identificación de unidad en terreno</Text>
          <Text style={[ui.sello, { color: c.acento, borderColor: c.acento }]}>FORMATO MED-000000</Text>
        </View>

        <Controller
          control={control}
          name="codigo"
          render={({ field }) => (
            <Campo
              etiqueta="Código del medidor (etiqueta física)"
              value={field.value}
              placeholder="MED-000123"
              autoCapitalize="characters"
              autoCorrect={false}
              onBlur={field.onBlur}
              onChangeText={(t) => {
                field.onChange(t);
                setConsultado(null);
                setAviso(null);
              }}
              ayuda="Ingresa el prefijo MED- seguido de exactamente 6 dígitos."
              error={errors.codigo?.message}
            />
          )}
        />
        <Boton titulo="Consultar ficha del medidor" onPress={consultar} cargando={isFetching} />
      </View>

      {!!aviso && (
        <View style={[ui.panel, s.panelAlerta]}>
          <Text style={s.tituloAlerta}>REGISTRO DUPLICADO EN EL MES ACTUAL</Text>
          <Text style={{ color: c.text, fontWeight: '600', lineHeight: 20 }}>{aviso}</Text>
        </View>
      )}

      {consultado != null && medidor === null && (
        <View style={[ui.panel, s.panelAlerta]}>
          <Text style={s.tituloAlerta}>MEDIDOR NO REGISTRADO EN PADRÓN</Text>
          <Text style={{ color: c.text, lineHeight: 20 }}>
            No existe un medidor con el código {consultado} en el sistema central de la oficina. Verifica los 6 dígitos de la placa metálica.
          </Text>
        </View>
      )}

      {sinDatos && (
        <View style={[ui.panel, s.panelAlerta]}>
          <View style={ui.panelCabecera}>
            <Text style={s.tituloAlerta}>
              {fetchStatus === 'paused'
                ? 'SIN CONEXIÓN Y SIN FICHA EN CACHÉ'
                : 'SERVICIO DE OFICINA NO DISPONIBLE'}
            </Text>
            <Text style={[ui.sello, { color: c.alerta, borderColor: c.alerta }]}>MODO CAMPO</Text>
          </View>
          <Text style={{ color: c.text, lineHeight: 20 }}>
            No se pudo descargar la ficha catastral de {consultado}. Puedes levantar la lectura en modo offline: quedará marcada como{' '}
            <Text style={{ fontWeight: '800' }}>PENDIENTE DE VERIFICAR</Text> y se contrastará contra el sistema cuando vuelva la señal.
          </Text>
          <Boton
            titulo="Registrar lectura sin datos del sistema"
            tipo="laton"
            onPress={() => registrar(null)}
          />
        </View>
      )}

      {medidor && (
        <View style={ui.panel}>
          <View style={ui.panelCabecera}>
            <View>
              <Text style={ui.etiqueta}>Ficha catastral del medidor</Text>
              <Text style={s.codigo}>{medidor.codigo}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text
                style={[
                  ui.sello,
                  { color: c.ok, borderColor: c.ok, backgroundColor: '#EEF7F1' },
                ]}>
                {medidor.estado.toUpperCase()}
              </Text>
              <Text style={[ui.etiqueta, { color: c.laton, fontSize: 10 }]}>
                Descarga · {hora(dataUpdatedAt)}
              </Text>
            </View>
          </View>

          <Fila t="Dirección predial" v={medidor.direccion} />
          <Fila t="Sector / Parroquia" v={medidor.sector} />
          <Fila t="N.º de cuenta contrato" v={medidor.numeroCuenta} />
          <Fila t="Estado en padrón" v={medidor.estado} />
          <Fila t="Fecha última lectura" v={fecha(medidor.fechaUltimaLectura)} />

          <View style={s.bloqueOdometro}>
            <Text style={ui.etiqueta}>Última lectura registrada en oficina</Text>
            <Odometro valor={medidor.ultimaLectura} />
          </View>

          <Fila t="Consumo promedio mensual" v={m3(medidor.consumoPromedio)} />

          <Boton
            titulo="Iniciar registro de lectura"
            tipo="laton"
            onPress={() => registrar(medidor)}
          />
        </View>
      )}

      <Modal
        transparent
        visible={oferta}
        animationType="fade"
        onRequestClose={() => setOferta(false)}>
        <View style={s.fondo}>
          <View style={[ui.panel, { gap: 12, borderColor: c.laton, borderWidth: 2 }]}>
            <View style={ui.panelCabecera}>
              <Text style={ui.etiqueta}>Recuperación de sesión de captura</Text>
              <Text style={[ui.sello, { color: c.alerta, borderColor: c.alerta }]}>
                BORRADOR ACTIVO
              </Text>
            </View>
            <Text style={ui.titulo}>Registro sin terminar</Text>
            <Text style={{ color: c.textSecondary, lineHeight: 20 }}>
              Quedó en curso {borrador?.modo === 'correccion' ? 'la corrección' : 'el levantamiento'} del medidor{' '}
              <Text style={{ fontWeight: '800', color: c.text }}>{borrador?.codigo}</Text> (paso:{' '}
              {borrador?.paso === 'revision' ? '2 de 2 · Revisión' : '1 de 2 · Estado y lectura'}). ¿Deseas retomar donde te quedaste o descartarlo?
            </Text>
            <Boton titulo="Continuar con el registro" tipo="laton" onPress={continuar} />
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
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  fichaOperador: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#DCE5E8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: c.linea,
  },
  nombreOperador: { fontSize: 15, fontWeight: '800', color: c.text },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderColor: c.linea,
  },
  valor: { color: c.text, fontWeight: '700', flexShrink: 1, textAlign: 'right', fontSize: 14 },
  codigo: {
    fontFamily: Fonts.mono,
    fontSize: 21,
    fontWeight: '800',
    color: c.text,
    letterSpacing: 1,
  },
  bloqueOdometro: {
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderColor: c.linea,
  },
  panelAlerta: {
    borderColor: c.alerta,
    backgroundColor: '#FFFBEB',
  },
  tituloAlerta: {
    fontFamily: Fonts.mono,
    color: c.alerta,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  fondo: {
    flex: 1,
    backgroundColor: '#0E2A33CC',
    justifyContent: 'center',
    padding: 20,
  },
});
