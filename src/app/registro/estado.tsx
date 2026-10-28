import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, Resolver, useForm, useWatch } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { Odometro } from '@/components/Odometro';
import { TecladoScroll } from '@/components/TecladoScroll';
import { c, ui } from '@/constants/estilos';
import { crearEsquemaPaso1 } from '@/domain/esquemas';
import { fecha } from '@/domain/formato';
import { Borrador, EstadoMedidor, ValoresPaso1 } from '@/domain/tipos';
import { useBorradorStore } from '@/store/borrador';

const OPCIONES: { id: EstadoMedidor; texto: string; desc: string }[] = [
  { id: 'normal', texto: 'Normal', desc: 'Medidor operativo y lectura visible' },
  { id: 'inaccesible', texto: 'Inaccesible', desc: 'Sin acceso al medidor (no registra lectura)' },
  { id: 'danado', texto: 'Dañado', desc: 'Avería física en el medidor (requiere foto)' },
];

export default function PasoEstado() {
  const borrador = useBorradorStore((s) => s.borrador);
  if (!borrador) return <Redirect href="/" />;
  return <Formulario borrador={borrador} />;
}

function Formulario({ borrador }: { borrador: Borrador }) {
  const actualizar = useBorradorStore((s) => s.actualizar);
  const esquema = useMemo(() => crearEsquemaPaso1(borrador.referencia), [borrador.referencia]);
  const [intentoContinuar, setIntentoContinuar] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
  } = useForm<ValoresPaso1>({
    resolver: zodResolver(esquema) as Resolver<ValoresPaso1>,
    mode: 'all',
    defaultValues: {
      estadoMedidor: borrador.estadoMedidor,
      lectura: borrador.lectura,
      motivo: borrador.motivo,
      descripcionDano: borrador.descripcionDano,
    },
  });
  const valores = useWatch({ control });
  const estado = valores.estadoMedidor ?? 'normal';
  const lecturaActual = valores.lectura ?? '';
  const motivoActual = valores.motivo ?? '';
  const danoActual = valores.descripcionDano ?? '';

  // Evaluación 100% en tiempo real con el esquema de Zod en cada tecla
  const validacionViva = esquema.safeParse({
    estadoMedidor: estado,
    lectura: lecturaActual,
    motivo: motivoActual,
    descripcionDano: danoActual,
  });

  const obtenerErrorCampo = (campo: 'lectura' | 'motivo' | 'descripcionDano', valor: string) => {
    if (validacionViva.success) return undefined;
    if (valor.length === 0 && !intentoContinuar) return undefined;
    return validacionViva.error.issues.find((i) => i.path.includes(campo))?.message;
  };

  const errorLectura = obtenerErrorCampo('lectura', lecturaActual);
  const errorMotivo = obtenerErrorCampo('motivo', motivoActual);
  const errorDano = obtenerErrorCampo('descripcionDano', danoActual);

  useFocusEffect(
    useCallback(() => {
      actualizar({ paso: 'estado' });
    }, [actualizar]),
  );

  useEffect(() => {
    actualizar({
      estadoMedidor: estado,
      lectura: lecturaActual,
      motivo: motivoActual,
      descripcionDano: danoActual,
    });
  }, [actualizar, estado, lecturaActual, motivoActual, danoActual]);

  const elegir = (id: EstadoMedidor) => {
    clearErrors();
    setIntentoContinuar(false);
    setValue('estadoMedidor', id);
    if (id === 'inaccesible') setValue('lectura', '');
  };

  const continuar = handleSubmit(
    () => {
      setIntentoContinuar(false);
      router.push('/registro/revision');
    },
    () => {
      setIntentoContinuar(true);
    },
  );

  return (
    <TecladoScroll desplazarAlAbrir="final">
      {/* Barra de Progreso de 2 Pasos */}
      <View style={s.barraPasos}>
        <View style={s.pasoItem}>
          <View style={[s.circuloPaso, s.circuloActivo]}>
            <Text style={s.numPasoActivo}>1</Text>
          </View>
          <Text style={s.txtPasoActivo}>Estado y lectura</Text>
        </View>
        <View style={s.lineaProgreso} />
        <View style={s.pasoItem}>
          <View style={s.circuloPaso}>
            <Text style={s.numPasoInactivo}>2</Text>
          </View>
          <Text style={s.txtPasoInactivo}>Revisión y foto</Text>
        </View>
      </View>

      {/* Ficha de referencia del medidor */}
      <View style={s.fichaReferencia}>
        <View style={s.cabeceraRef}>
          <View>
            <Text style={s.subRef}>MEDIDOR SELECCIONADO</Text>
            <Text style={s.codigo}>{borrador.codigo}</Text>
          </View>
          <View style={s.badgeModo}>
            <Text style={s.badgeModoTxt}>
              {borrador.modo === 'correccion' ? 'Corrección' : 'Nuevo registro'}
            </Text>
          </View>
        </View>

        <View style={s.cuerpoRef}>
          {!!borrador.direccion && (
            <Text style={{ color: c.textSecondary, fontSize: 14, fontWeight: '500' }}>
              {borrador.direccion}
            </Text>
          )}
          <Text style={ui.etiquetaSecundaria}>Lectura anterior registrada</Text>
          <Odometro valor={borrador.referencia.lecturaAnterior} />
          <Text style={{ color: c.textSecondary, fontSize: 12 }}>
            {borrador.referencia.fechaAnterior
              ? `Fecha de lectura anterior: ${fecha(borrador.referencia.fechaAnterior)}`
              : 'Sin lectura previa en el teléfono: se verificará al recuperar conexión.'}
          </Text>
        </View>
      </View>

      {/* Selector de Estado del Medidor */}
      <View style={ui.panel}>
        <Text style={s.tituloBloque}>Estado del medidor</Text>
        <View style={{ gap: 10 }}>
          {OPCIONES.map((o) => {
            const activo = estado === o.id;
            return (
              <Pressable
                key={o.id}
                onPress={() => elegir(o.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: activo }}
                style={[s.tarjetaEstado, activo && s.tarjetaEstadoActiva]}>
                <View style={[s.radioExterior, activo && s.radioExteriorActivo]}>
                  {activo && <View style={s.radioInterior} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.estadoTitulo, activo && { color: c.acento }]}>{o.texto}</Text>
                  <Text style={s.estadoDesc}>{o.desc}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={s.separador} />

        {estado === 'normal' && (
          <Controller
            control={control}
            name="lectura"
            render={({ field }) => (
              <Campo
                etiqueta="Lectura actual (m³)"
                value={field.value}
                maxLength={9}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                keyboardType="decimal-pad"
                placeholder="Ingrese la lectura actual"
                error={errorLectura}
              />
            )}
          />
        )}

        {estado === 'inaccesible' && (
          <>
            <Controller
              control={control}
              name="motivo"
              render={({ field }) => (
                <Campo
                  etiqueta="Motivo de inaccesibilidad"
                  value={field.value}
                  maxLength={150}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  multilinea
                  placeholder="Ingrese el motivo"
                  error={errorMotivo}
                />
              )}
            />
            <View style={s.avisoInfo}>
              <Text style={s.avisoInfoTxt}>
                En estado inaccesible no se habilita el ingreso de lectura numérica.
              </Text>
            </View>
          </>
        )}

        {estado === 'danado' && (
          <>
            <Controller
              control={control}
              name="descripcionDano"
              render={({ field }) => (
                <Campo
                  etiqueta="Descripción del daño"
                  value={field.value}
                  maxLength={150}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  multilinea
                  placeholder="Describa el daño del medidor"
                  error={errorDano}
                />
              )}
            />
            <Controller
              control={control}
              name="lectura"
              render={({ field }) => (
                <Campo
                  etiqueta="Lectura actual (m³) · Opcional"
                  value={field.value}
                  maxLength={9}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  keyboardType="decimal-pad"
                  placeholder="Ingrese la lectura si es visible (opcional)"
                  error={errorLectura}
                />
              )}
            />
          </>
        )}
      </View>

      <Boton titulo="Continuar al paso 2" tipo="primario" onPress={continuar} />
    </TecladoScroll>
  );
}

const s = StyleSheet.create({
  barraPasos: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.linea,
  },
  pasoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circuloPaso: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloActivo: {
    backgroundColor: c.acento,
  },
  numPasoActivo: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  numPasoInactivo: {
    color: c.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  txtPasoActivo: {
    color: c.text,
    fontWeight: '700',
    fontSize: 13,
  },
  txtPasoInactivo: {
    color: c.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  lineaProgreso: {
    flex: 1,
    height: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 12,
  },
  fichaReferencia: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.linea,
    overflow: 'hidden',
  },
  cabeceraRef: {
    backgroundColor: '#0A2540',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subRef: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  codigo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  badgeModo: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeModoTxt: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cuerpoRef: {
    padding: 18,
    gap: 8,
  },
  tituloBloque: {
    fontSize: 16,
    fontWeight: '800',
    color: c.text,
  },
  tarjetaEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: c.linea,
    backgroundColor: '#F8FAFC',
  },
  tarjetaEstadoActiva: {
    borderColor: c.acento,
    backgroundColor: '#F0F6FC',
  },
  radioExterior: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioExteriorActivo: {
    borderColor: c.acento,
  },
  radioInterior: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: c.acento,
  },
  estadoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: c.text,
  },
  estadoDesc: {
    fontSize: 12,
    color: c.textSecondary,
    marginTop: 2,
  },
  separador: {
    height: 1,
    backgroundColor: c.linea,
    marginVertical: 4,
  },
  avisoInfo: {
    backgroundColor: '#F0F6FC',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: c.acento,
  },
  avisoInfoTxt: {
    color: c.text,
    fontSize: 13,
    lineHeight: 18,
  },
});
