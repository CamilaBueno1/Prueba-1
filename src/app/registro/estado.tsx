import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { Controller, Resolver, useForm, useWatch } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { Odometro } from '@/components/Odometro';
import { c, ui } from '@/constants/estilos';
import { Fonts } from '@/constants/theme';
import { crearEsquemaPaso1 } from '@/domain/esquemas';
import { fecha } from '@/domain/formato';
import { Borrador, EstadoMedidor, ValoresPaso1 } from '@/domain/tipos';
import { useBorradorStore } from '@/store/borrador';

const OPCIONES: { id: EstadoMedidor; texto: string; sub: string }[] = [
  { id: 'normal', texto: 'NORMAL', sub: 'Operativo' },
  { id: 'inaccesible', texto: 'INACCESIBLE', sub: 'Sin acceso' },
  { id: 'danado', texto: 'DAÑADO', sub: 'Avería física' },
];

export default function PasoEstado() {
  const borrador = useBorradorStore((s) => s.borrador);
  if (!borrador) return <Redirect href="/" />;
  // Se separa en otro componente para que useForm no quede detrás de un return condicional
  return <Formulario borrador={borrador} />;
}

function Formulario({ borrador }: { borrador: Borrador }) {
  const actualizar = useBorradorStore((s) => s.actualizar);
  const esquema = useMemo(() => crearEsquemaPaso1(borrador.referencia), [borrador.referencia]);

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<ValoresPaso1>({
    resolver: zodResolver(esquema) as Resolver<ValoresPaso1>,
    defaultValues: {
      estadoMedidor: borrador.estadoMedidor,
      lectura: borrador.lectura,
      motivo: borrador.motivo,
      descripcionDano: borrador.descripcionDano,
    },
  });
  const valores = useWatch({ control });
  const estado = valores.estadoMedidor ?? 'normal';

  useFocusEffect(
    useCallback(() => {
      actualizar({ paso: 'estado' });
    }, [actualizar]),
  );

  // R8: cada cambio del formulario se copia al borrador persistente
  useEffect(() => {
    actualizar({
      estadoMedidor: valores.estadoMedidor ?? 'normal',
      lectura: valores.lectura ?? '',
      motivo: valores.motivo ?? '',
      descripcionDano: valores.descripcionDano ?? '',
    });
  }, [
    actualizar,
    valores.estadoMedidor,
    valores.lectura,
    valores.motivo,
    valores.descripcionDano,
  ]);

  const elegir = (id: EstadoMedidor) => {
    clearErrors();
    setValue('estadoMedidor', id);
    if (id === 'inaccesible') setValue('lectura', ''); // inaccesible: no se registra lectura (R5)
  };

  const continuar = handleSubmit(() => router.push('/registro/revision'));

  return (
    <ScrollView
      style={ui.pantalla}
      contentContainerStyle={ui.contenido}
      keyboardShouldPersistTaps="handled">
      <View style={ui.panel}>
        <View style={ui.panelCabecera}>
          <View>
            <Text style={ui.etiqueta}>
              {borrador.modo === 'correccion' ? 'Corrección de lectura' : 'Unidad en inspección'}
            </Text>
            <Text style={s.codigo}>{borrador.codigo}</Text>
          </View>
          <Text style={[ui.sello, { color: c.acento, borderColor: c.acento }]}>PASO 1 DE 2</Text>
        </View>

        {!!borrador.direccion && (
          <Text style={{ color: c.textSecondary, fontWeight: '600' }}>{borrador.direccion}</Text>
        )}

        <Text style={ui.etiqueta}>Lectura anterior de referencia</Text>
        <Odometro valor={borrador.referencia.lecturaAnterior} />
        <Text style={{ color: c.textSecondary, fontSize: 13, lineHeight: 18 }}>
          {borrador.referencia.fechaAnterior
            ? `Registrada en oficina el ${fecha(borrador.referencia.fechaAnterior)}`
            : 'Sin datos del sistema en este teléfono: la lectura se verificará al recuperar la conexión.'}
        </Text>
      </View>

      <View style={ui.panel}>
        <Text style={ui.etiqueta}>Condición física del medidor (R5)</Text>
        <View style={s.selector}>
          {OPCIONES.map((o) => {
            const activo = estado === o.id;
            return (
              <Pressable
                key={o.id}
                onPress={() => elegir(o.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: activo }}
                style={[s.opcion, activo && s.opcionActiva]}>
                <Text style={[s.opcionTxt, activo && { color: '#FFFFFF' }]}>{o.texto}</Text>
                <Text style={[s.opcionSub, activo && { color: '#D5E0E4' }]}>{o.sub}</Text>
              </Pressable>
            );
          })}
        </View>

        {estado === 'normal' && (
          <Controller
            control={control}
            name="lectura"
            render={({ field }) => (
              <Campo
                etiqueta="Lectura actual del odómetro (m³) · obligatoria"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                keyboardType="decimal-pad"
                placeholder="Ej. 1262"
                ayuda="Debe ser mayor o igual a la lectura anterior registrada."
                error={errors.lectura?.message}
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
                  etiqueta="Motivo de inaccesibilidad · obligatorio"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  multilinea
                  placeholder="Ej. Predio cerrado con candado, caja bajo vehículo estacionado o perro suelto"
                  error={errors.motivo?.message}
                />
              )}
            />
            <View style={s.avisoInaccesible}>
              <Text style={s.avisoInaccesibleTxt}>
                BLOQUEADO POR REGLA R5: Un medidor inaccesible no admite el ingreso de lectura numérica.
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
                  etiqueta="Descripción técnica del daño · obligatoria"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  multilinea
                  placeholder="Ej. Cúpula de vidrio rota, visor inundado o relojería trabada"
                  error={errors.descripcionDano?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="lectura"
              render={({ field }) => (
                <Campo
                  etiqueta="Lectura actual (m³) · opcional si es legible"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  keyboardType="decimal-pad"
                  placeholder="Dejar vacío si el visor es ilegible"
                  ayuda="En el siguiente paso se exigirá fotografía obligatoria de la avería."
                  error={errors.lectura?.message}
                />
              )}
            />
          </>
        )}
      </View>

      <Boton titulo="Continuar a revisión y evidencia" tipo="laton" onPress={continuar} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  codigo: {
    fontFamily: Fonts.mono,
    fontSize: 20,
    fontWeight: '800',
    color: c.text,
    letterSpacing: 1,
  },
  selector: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: c.text,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#F3F6F8',
  },
  opcion: {
    flex: 1,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: c.linea,
  },
  opcionActiva: { backgroundColor: c.text },
  opcionTxt: { fontFamily: Fonts.mono, fontWeight: '800', fontSize: 12, color: c.text },
  opcionSub: { fontSize: 10, color: c.textSecondary, marginTop: 1 },
  avisoInaccesible: {
    backgroundColor: '#F3F6F8',
    borderLeftWidth: 4,
    borderLeftColor: c.acento,
    padding: 10,
    borderRadius: 4,
  },
  avisoInaccesibleTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textSecondary,
    lineHeight: 18,
  },
});
