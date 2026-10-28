import { calcular, mesDe } from './reglas';
import { Borrador, Lectura, Medidor } from './tipos';

// UUID v4. Se crea al EMPEZAR el registro, y es la clave que evita duplicados en la oficina.
export const nuevoId = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

export function borradorNuevo(codigo: string, m: Medidor | null): Borrador {
  return {
    idLocal: nuevoId(),
    modo: 'nuevo',
    paso: 'estado',
    codigo,
    direccion: m?.direccion ?? null,
    referencia: {
      lecturaAnterior: m?.ultimaLectura ?? null,
      fechaAnterior: m?.fechaUltimaLectura ?? null,
      promedio: m?.consumoPromedio ?? null,
    },
    estadoMedidor: 'normal',
    lectura: '',
    motivo: '',
    descripcionDano: '',
    revisionConfirmada: false,
    fotoNombre: null,
    tomadaEn: new Date().toISOString(),
  };
}

// R10: para corregir una lectura pendiente se vuelve a abrir el mismo formulario con sus datos
export function borradorDeLectura(l: Lectura): Borrador {
  return {
    idLocal: l.idLocal,
    modo: 'correccion',
    paso: 'estado',
    codigo: l.medidorCodigo,
    direccion: null,
    referencia: l.referencia,
    estadoMedidor: l.estadoMedidor,
    lectura: l.lectura == null ? '' : String(l.lectura),
    motivo: l.motivo ?? '',
    descripcionDano: l.descripcionDano ?? '',
    revisionConfirmada: l.revisionConfirmada,
    fotoNombre: l.fotoNombre,
    tomadaEn: l.tomadaEn,
  };
}

// Convierte el borrador en Lectura, dejando en null lo que no corresponde al estado elegido
export function lecturaDeBorrador(b: Borrador, tecnico: string): Lectura {
  const c = calcular(b);
  return {
    idLocal: b.idLocal,
    tecnico,
    medidorCodigo: b.codigo,
    mes: mesDe(new Date(b.tomadaEn)),
    estadoMedidor: b.estadoMedidor,
    lectura: c.lectura,
    motivo: b.estadoMedidor === 'inaccesible' ? b.motivo.trim() : null,
    descripcionDano: b.estadoMedidor === 'danado' ? b.descripcionDano.trim() : null,
    referencia: b.referencia,
    consumo: c.consumo,
    anomalo: c.anomalo,
    revisionConfirmada: c.anomalo && b.revisionConfirmada,
    fotoNombre: b.fotoNombre,
    tomadaEn: b.tomadaEn,
    verificada: false,
    requiereRevision: false,
    estadoEnvio: 'pendiente',
    remotoId: null,
    ultimoError: null,
  };
}
