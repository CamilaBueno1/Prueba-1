import { AppState } from 'react-native';
import { api } from '@/api/aquaruta';
import { calcularConsumo, esAnomalo } from '@/domain/reglas';
import { Lectura } from '@/domain/tipos';
import { useLecturasStore } from '@/store/lecturas';
import { useRedStore } from '@/store/red';

let enCurso = false; // exclusión mutua: nunca hay dos envíos a la vez
let fallos = 0;
let temporizador: ReturnType<typeof setTimeout> | null = null;

const cuerpoRemoto = (l: Lectura) => ({
  idLocal: l.idLocal,
  tecnico: l.tecnico,
  medidorCodigo: l.medidorCodigo,
  mes: l.mes,
  estadoMedidor: l.estadoMedidor,
  lectura: l.lectura,
  motivo: l.motivo,
  descripcionDano: l.descripcionDano,
  lecturaAnterior: l.referencia.lecturaAnterior,
  fechaLecturaAnterior: l.referencia.fechaAnterior,
  promedioMensual: l.referencia.promedio,
  consumo: l.consumo,
  anomalo: l.anomalo,
  revisionConfirmada: l.revisionConfirmada,
  tieneFoto: !!l.fotoNombre,
  requiereRevision: l.requiereRevision,
  tomadaEn: l.tomadaEn,
  enviadaEn: new Date().toISOString(),
});

const mensajeDeError = (e: unknown) =>
  e instanceof Error && e.name === 'AbortError'
    ? 'La oficina no respondió a tiempo.'
    : 'No se pudo contactar con la oficina.';

// Reintento con espera creciente (5 s, 10 s, 20 s... máx. 60 s) SOLO después de un fallo. No es polling. (ADR-007)
function programarReintento() {
  if (temporizador) return;
  const espera = Math.min(60000, 5000 * 2 ** fallos);
  fallos++;
  temporizador = setTimeout(() => {
    temporizador = null;
    void sincronizar();
  }, espera);
}

async function enviarUna(l: Lectura) {
  let referencia = l.referencia;
  let consumo = l.consumo;
  let anomalo = l.anomalo;
  let requiereRevision = false;

  // 1) R4: se compara con la lectura anterior que tiene AHORA la oficina
  const sistema = await api.buscarMedidor(l.medidorCodigo);
  if (sistema) {
    referencia = {
      lecturaAnterior: sistema.ultimaLectura,
      fechaAnterior: sistema.fechaUltimaLectura,
      promedio: sistema.consumoPromedio,
    };
    consumo = calcularConsumo(l.lectura, sistema.ultimaLectura);
    anomalo = esAnomalo(consumo, sistema.consumoPromedio);
    requiereRevision =
      (anomalo && (!l.fotoNombre || !l.revisionConfirmada)) ||
      (consumo != null && consumo < 0);
  }
  const verificada = { referencia, consumo, anomalo, requiereRevision };

  // 2) R9: ¿ya llegó en un intento anterior cuya respuesta se perdió? Si sí, NO se vuelve a crear
  const yaLlego = await api.buscarLecturaPorIdLocal(l.idLocal);
  const remoto = yaLlego ?? (await api.crearLectura(cuerpoRemoto({ ...l, ...verificada })));
  useLecturasStore.getState().marcarEnviada(l.idLocal, remoto.id, verificada);
}

export async function sincronizar() {
  if (enCurso || !useRedStore.getState().enLinea) return;
  enCurso = true;
  try {
    let lectura = useLecturasStore.getState().reclamarSiguiente();
    while (lectura) {
      try {
        await enviarUna(lectura);
        fallos = 0;
      } catch (e) {
        // Vuelve a pendiente, guarda el motivo para mostrarlo y programa el reintento
        useLecturasStore.getState().liberar(lectura.idLocal, mensajeDeError(e));
        programarReintento();
        return;
      }
      lectura = useRedStore.getState().enLinea
        ? useLecturasStore.getState().reclamarSiguiente()
        : null;
    }
  } finally {
    enCurso = false;
  }
}

// Se llama cuando los stores ya están hidratados. Devuelve la función que desinstala todo.
export function iniciarSincronizacion(): () => void {
  useLecturasStore.getState().liberarTodasEnviando(); // un envío cortado por un cierre de la app vuelve a pendiente

  const bajaRed = useRedStore.subscribe((estado, previo) => {
    if (estado.enLinea && !previo.enLinea) void sincronizar(); // volvió la señal
  });
  const appState = AppState.addEventListener('change', (s) => {
    if (s === 'active') void sincronizar();
  });
  void sincronizar();

  return () => {
    bajaRed();
    appState.remove();
    if (temporizador) {
      clearTimeout(temporizador);
      temporizador = null;
    }
  };
}
