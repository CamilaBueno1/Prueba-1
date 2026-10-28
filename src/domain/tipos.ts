export type EstadoMedidor = 'normal' | 'inaccesible' | 'danado';
export type EstadoEnvio = 'pendiente' | 'enviando' | 'enviada';

export interface Tecnico {
  codigo: string;
  nombre: string;
}

export interface Medidor {
  id: string;
  codigo: string;
  direccion: string;
  sector: string;
  numeroCuenta: string;
  estado: string;
  ultimaLectura: number;
  fechaUltimaLectura: string;
  consumoPromedio: number;
}

// Datos de comparación: vienen del sistema de la oficina (o son null si nunca se consultó sin señal)
export interface Referencia {
  lecturaAnterior: number | null;
  fechaAnterior: string | null;
  promedio: number | null;
}

// Una lectura registrada. Vive en UNA sola colección con un estado (ADR-002 corregido)
export interface Lectura {
  idLocal: string;                    // UUID: clave de idempotencia (ADR-007)
  tecnico: string;
  medidorCodigo: string;
  mes: string;                        // 'YYYY-MM': base de la regla "un medidor por mes" (R10)
  estadoMedidor: EstadoMedidor;
  lectura: number | null;
  motivo: string | null;
  descripcionDano: string | null;
  referencia: Referencia;
  consumo: number | null;
  anomalo: boolean;
  revisionConfirmada: boolean;
  fotoNombre: string | null;          // solo el nombre; la ruta se reconstruye (ADR-005)
  tomadaEn: string;
  verificada: boolean;                // R4: ya se comparó con la anterior del sistema
  requiereRevision: boolean;
  estadoEnvio: EstadoEnvio;
  remotoId: string | null;
  ultimoError: string | null;         // ADR-007: último fallo de envío, visible para el técnico
}

// Registro a medias (R8). Los campos de texto se guardan como texto, tal cual los escribe el técnico
export interface Borrador {
  idLocal: string;
  modo: 'nuevo' | 'correccion';
  paso: 'estado' | 'revision';
  codigo: string;
  direccion: string | null;
  referencia: Referencia;
  estadoMedidor: EstadoMedidor;
  lectura: string;
  motivo: string;
  descripcionDano: string;
  revisionConfirmada: boolean;
  fotoNombre: string | null;
  tomadaEn: string;
}

export interface ValoresPaso1 {
  estadoMedidor: EstadoMedidor;
  lectura: string;
  motivo: string;
  descripcionDano: string;
}
