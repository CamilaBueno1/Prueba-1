import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { Odometro } from '@/components/Odometro';
import { SeccionFoto } from '@/components/SeccionFoto';
import { c, ui } from '@/constants/estilos';
import { crearEsquemaPaso1, esquemaRevision } from '@/domain/esquemas';
import { lecturaDeBorrador } from '@/domain/fabrica';
import { m3 } from '@/domain/formato';
import { calcular } from '@/domain/reglas';
import { sincronizar } from '@/services/sincronizacion';
import { useBorradorStore } from '@/store/borrador';
import { useLecturasStore } from '@/store/lecturas';
import { useSesionStore } from '@/store/sesion';

export default function PasoRevision() {
  const tecnico = useSesionStore((s) => s.tecnico);
  const b = useBorradorStore((s) => s.borrador);
  const actualizar = useBorradorStore((s) => s.actualizar);
  const descartar = useBorradorStore((s) => s.descartar);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      actualizar({ paso: 'revision' });
    }, [actualizar]),
  );

  if (!b || !tecnico) return <Redirect href="/" />;

  const calculo = calcular(b);
  const paso1Valido = crearEsquemaPaso1(b.referencia).safeParse({
    estadoMedidor: b.estadoMedidor,
    lectura: b.lectura,
    motivo: b.motivo,
    descripcionDano: b.descripcionDano,
  }).success;

  const revision = esquemaRevision.safeParse({
    anomalo: calculo.anomalo,
    fotoObligatoria: calculo.fotoObligatoria,
    revisionConfirmada: b.revisionConfirmada,
    fotoNombre: b.fotoNombre,
  });
  const falta: string[] = [];
  if (!paso1Valido) falta.push('Completa los datos del paso anterior.');
  if (!revision.success) falta.push(...revision.error.issues.map((i) => i.message));

  const guardar = () => {
    if (falta.length > 0) return;
    setError(null);
    const fila = lecturaDeBorrador(b, tecnico.codigo);
    const store = useLecturasStore.getState();

    if (b.modo === 'nuevo') {
      const r = store.agregar(fila);
      if (!r.ok) {
        setError(r.razon);
        return;
      }
    } else if (!store.corregir(fila)) {
      setError('Esta lectura ya fue enviada y no se puede modificar.');
      return;
    }
    descartar();
    void sincronizar();
    router.dismissAll();
    router.navigate('/lecturas');
  };

  return (
    <ScrollView style={ui.pantalla} contentContainerStyle={ui.contenido}>
      {/* Barra de Progreso de 2 Pasos (Paso 2 activo) */}
      <View style={s.barraPasos}>
        <View style={s.pasoItem}>
          <View style={[s.circuloPaso, s.circuloCompletado]}>
            <Text style={s.numPasoActivo}>1</Text>
          </View>
          <Text style={s.txtPasoInactivo}>Estado y lectura</Text>
        </View>
        <View style={[s.lineaProgreso, { backgroundColor: c.acento }]} />
        <View style={s.pasoItem}>
          <View style={[s.circuloPaso, s.circuloActivo]}>
            <Text style={s.numPasoActivo}>2</Text>
          </View>
          <Text style={s.txtPasoActivo}>Revisión y foto</Text>
        </View>
      </View>

      {/* Tarjeta de Balance de Consumo */}
      <View style={s.tarjetaBalance}>
        <View style={s.cabeceraBalance}>
          <View>
            <Text style={s.subBalance}>RESUMEN DE CONSUMO</Text>
            <Text style={s.codigo}>{b.codigo}</Text>
          </View>
          <View style={s.badgeEstado}>
            <Text style={s.badgeEstadoTxt}>
              {b.estadoMedidor === 'danado'
                ? 'Dañado'
                : b.estadoMedidor === 'inaccesible'
                  ? 'Inaccesible'
                  : 'Normal'}
            </Text>
          </View>
        </View>

        <View style={s.cuerpoBalance}>
          <Text style={ui.etiquetaSecundaria}>Lectura anterior</Text>
          <Odometro valor={b.referencia.lecturaAnterior} />

          <Text style={ui.etiquetaSecundaria}>Lectura actual capturada</Text>
          <Odometro valor={calculo.lectura} />

          <View style={s.grillaConsumo}>
            <View style={[s.celdaConsumo, calculo.anomalo && s.celdaConsumoAnomalo]}>
              <Text style={ui.etiquetaSecundaria}>Consumo del mes</Text>
              <Text style={[s.valorGrande, calculo.anomalo && { color: c.error }]}>
                {m3(calculo.consumo)}
              </Text>
            </View>
            <View style={s.celdaConsumo}>
              <Text style={ui.etiquetaSecundaria}>Promedio mensual</Text>
              <Text style={s.valorGrande}>{m3(b.referencia.promedio)}</Text>
            </View>
          </View>

          {b.referencia.lecturaAnterior == null && (
            <View style={s.avisoOffline}>
              <Text style={s.avisoOfflineTxt}>
                Sin lectura anterior en este teléfono: el consumo se calculará y verificará cuando se recupere la conexión.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Alerta de Consumo Anómalo (> 3x promedio) */}
      {calculo.anomalo && (
        <View style={[ui.panel, s.panelAnomalo]}>
          <View style={s.cabeceraAnomalo}>
            <View style={s.indicadorRojo} />
            <Text style={s.tituloAnomalo}>Consumo anómalo detectado</Text>
          </View>
          <Text style={{ color: c.text, lineHeight: 20, fontSize: 14 }}>
            El consumo calculado ({m3(calculo.consumo)}) supera el triple del promedio mensual ({m3(b.referencia.promedio)}). Por favor, verifica el medidor antes de continuar y adjunta la fotografía obligatoria.
          </Text>
          <Pressable
            onPress={() => actualizar({ revisionConfirmada: !b.revisionConfirmada })}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: b.revisionConfirmada }}
            style={[s.confirmar, b.revisionConfirmada && s.confirmarActivo]}>
            <View
              style={[
                s.caja,
                b.revisionConfirmada && { backgroundColor: c.acento, borderColor: c.acento },
              ]}>
              {b.revisionConfirmada && <View style={s.marcaCheck} />}
            </View>
            <Text style={{ flex: 1, color: c.text, fontWeight: '700', fontSize: 14 }}>
              Confirmo que revisé el medidor de agua
            </Text>
          </Pressable>
        </View>
      )}

      <SeccionFoto
        fotoNombre={b.fotoNombre}
        obligatoria={calculo.fotoObligatoria}
        idLocal={b.idLocal}
        alCambiar={(nombre) => actualizar({ fotoNombre: nombre })}
      />

      {falta.length > 0 && (
        <View style={s.cajaFaltantes}>
          <Text style={{ fontWeight: '700', color: c.error, fontSize: 13 }}>
            Requisitos pendientes para guardar:
          </Text>
          {falta.map((f) => (
            <View key={f} style={s.filaFalta}>
              <View style={s.puntoError} />
              <Text style={ui.error}>{f}</Text>
            </View>
          ))}
        </View>
      )}
      {!!error && <Text style={ui.error}>{error}</Text>}

      <Boton
        titulo={b.modo === 'correccion' ? 'Guardar corrección' : 'Guardar lectura'}
        tipo="primario"
        onPress={guardar}
        deshabilitado={falta.length > 0}
      />
    </ScrollView>
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
  circuloCompletado: {
    backgroundColor: c.ok,
  },
  circuloActivo: {
    backgroundColor: c.acento,
  },
  numPasoActivo: {
    color: '#FFFFFF',
    fontWeight: '800',
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
  tarjetaBalance: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.linea,
    overflow: 'hidden',
  },
  cabeceraBalance: {
    backgroundColor: '#0A2540',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subBalance: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  codigo: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginTop: 2 },
  badgeEstado: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeEstadoTxt: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cuerpoBalance: {
    padding: 18,
    gap: 12,
  },
  grillaConsumo: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  celdaConsumo: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.linea,
    gap: 4,
  },
  celdaConsumoAnomalo: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  valorGrande: { fontWeight: '800', fontSize: 18, color: c.text },
  avisoOffline: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  avisoOfflineTxt: { color: c.alerta, fontSize: 13, lineHeight: 18 },
  panelAnomalo: { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', borderWidth: 1.5 },
  cabeceraAnomalo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicadorRojo: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: c.error,
  },
  tituloAnomalo: { color: c.error, fontWeight: '800', fontSize: 16 },
  confirmar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 50,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  confirmarActivo: {
    borderColor: c.acento,
    backgroundColor: '#F0F6FC',
  },
  caja: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#64748B',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcaCheck: {
    width: 10,
    height: 6,
    borderLeftWidth: 2.2,
    borderBottomWidth: 2.2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
  cajaFaltantes: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
  },
  filaFalta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  puntoError: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: c.error,
  },
});
