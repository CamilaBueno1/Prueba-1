import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { Odometro } from '@/components/Odometro';
import { SeccionFoto } from '@/components/SeccionFoto';
import { c, ui } from '@/constants/estilos';
import { Fonts } from '@/constants/theme';
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

  // R6 y R7 se validan con Zod (ADR-006)
  const revision = esquemaRevision.safeParse({
    anomalo: calculo.anomalo,
    fotoObligatoria: calculo.fotoObligatoria,
    revisionConfirmada: b.revisionConfirmada,
    fotoNombre: b.fotoNombre,
  });
  const falta: string[] = [];
  if (!paso1Valido) falta.push('Completa los datos del paso 1.');
  if (!revision.success) falta.push(...revision.error.issues.map((i) => i.message));

  const guardar = () => {
    if (falta.length > 0) return;
    setError(null);
    const fila = lecturaDeBorrador(b, tecnico.codigo);
    const store = useLecturasStore.getState();

    if (b.modo === 'nuevo') {
      const r = store.agregar(fila); // R10: rechaza el duplicado del mes
      if (!r.ok) {
        setError(r.razon);
        return;
      }
    } else if (!store.corregir(fila)) {
      // R10: solo se corrige si sigue pendiente
      setError('Esta lectura ya fue enviada (o se está enviando) y no se puede corregir.');
      return;
    }
    descartar(); // el borrador ya cumplió su función
    void sincronizar(); // si hay señal, sale ahora mismo
    router.dismissAll();
    router.navigate('/lecturas');
  };

  return (
    <ScrollView style={ui.pantalla} contentContainerStyle={ui.contenido}>
      <View style={ui.panel}>
        <View style={ui.panelCabecera}>
          <View>
            <Text style={ui.etiqueta}>Balance hidrométrico · {b.codigo}</Text>
            <Text style={s.estadoTag}>
              ESTADO: {b.estadoMedidor === 'danado' ? 'DAÑADO' : b.estadoMedidor.toUpperCase()}
            </Text>
          </View>
          <Text style={[ui.sello, { color: c.acento, borderColor: c.acento }]}>PASO 2 DE 2</Text>
        </View>

        <Text style={ui.etiqueta}>Lectura anterior</Text>
        <Odometro valor={b.referencia.lecturaAnterior} />

        <Text style={ui.etiqueta}>Lectura actual capturada</Text>
        <Odometro valor={calculo.lectura} />

        <View style={s.separador} />

        <View style={s.fila}>
          <Text style={ui.etiqueta}>Consumo calculado del mes</Text>
          <Text style={[s.valor, calculo.anomalo && { color: c.error }]}>
            {m3(calculo.consumo)}
          </Text>
        </View>
        <View style={s.fila}>
          <Text style={ui.etiqueta}>Promedio histórico mensual</Text>
          <Text style={s.valor}>{m3(b.referencia.promedio)}</Text>
        </View>

        {b.referencia.lecturaAnterior == null && (
          <View style={s.avisoOffline}>
            <Text style={s.avisoOfflineTxt}>
              SIN LECTURA ANTERIOR EN TELÉFONO: El consumo se calculará y verificará contra el padrón de la oficina al recuperar la conexión (R4).
            </Text>
          </View>
        )}
      </View>

      {calculo.anomalo && (
        <View style={[ui.panel, s.panelAnomalo]}>
          <View style={ui.panelCabecera}>
            <Text style={s.tituloAnomalo}>ALERTA DE CONSUMO ANÓMALO (R6)</Text>
            <Text style={[ui.sello, { color: c.error, borderColor: c.error }]}>&gt; 3× PROMEDIO</Text>
          </View>
          <Text style={{ color: c.text, lineHeight: 20 }}>
            El consumo calculado ({m3(calculo.consumo)}) supera el triple del promedio mensual ({m3(b.referencia.promedio)}). Verifica físicamente las agujas y tambores del medidor antes de guardar. La fotografía de respaldo pasa a ser obligatoria.
          </Text>
          <Pressable
            onPress={() => actualizar({ revisionConfirmada: !b.revisionConfirmada })}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: b.revisionConfirmada }}
            style={s.confirmar}>
            <View style={[s.caja, b.revisionConfirmada && { backgroundColor: c.text }]}>
              {b.revisionConfirmada && (
                <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>✓</Text>
              )}
            </View>
            <Text style={{ flex: 1, color: c.text, fontWeight: '800' }}>
              Confirmo que revisé físicamente el medidor de agua y el valor es correcto
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
        <View style={[ui.panel, { borderColor: c.error, backgroundColor: '#FFF8F7' }]}>
          <Text style={ui.etiqueta}>Requisitos pendientes para habilitar guardado</Text>
          {falta.map((f) => (
            <Text key={f} style={ui.error}>
              • {f}
            </Text>
          ))}
        </View>
      )}
      {!!error && <Text style={ui.error}>▲ {error}</Text>}

      <Text style={{ color: c.textSecondary, fontSize: 13, lineHeight: 19 }}>
        Si no hay conexión en este punto de la ruta, la lectura quedará resguardada localmente como PENDIENTE DE VERIFICAR y se sincronizará automáticamente al recuperar señal.
      </Text>

      <Boton
        titulo={b.modo === 'correccion' ? 'Guardar corrección de lectura' : 'Guardar lectura en cola'}
        tipo="laton"
        onPress={guardar}
        deshabilitado={falta.length > 0}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  estadoTag: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    fontWeight: '800',
    color: c.text,
    marginTop: 2,
  },
  separador: { height: 1, backgroundColor: c.linea, marginVertical: 4 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  valor: { fontFamily: Fonts.mono, fontWeight: '800', fontSize: 16, color: c.text },
  avisoOffline: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: c.alerta,
    padding: 10,
    borderRadius: 4,
    marginTop: 4,
  },
  avisoOfflineTxt: { color: c.alerta, fontSize: 12, fontWeight: '700', lineHeight: 18 },
  panelAnomalo: { borderColor: c.error, borderWidth: 2, backgroundColor: '#FDF1F0' },
  tituloAnomalo: {
    fontFamily: Fonts.mono,
    color: c.error,
    fontWeight: '800',
    fontSize: 13,
  },
  confirmar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 50,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: c.text,
  },
  caja: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: c.text,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
