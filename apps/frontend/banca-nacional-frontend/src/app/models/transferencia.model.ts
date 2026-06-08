export interface Transferencia {
  id: number;
  numeroOperacion: string;
  tipoTransferencia: string;
  tipoTransferenciaDescripcion: string;
  cuentaOrigenId: number;
  cuentaOrigenNumero: string;
  cuentaDestinoId?: number;
  cuentaDestinoNumero?: string;
  cuentaDestinoCci?: string;
  bancoDestino?: string;
  titularDestino?: string;
  monto: number;
  moneda: string;
  glosa?: string;
  estado: string;
  motivoRechazo?: string;
  fechaOperacion: string;
  fechaValor: string;
  usuarioId: number;
}

export interface ApiResponse<T> {
  exitoso: boolean;
  mensaje: string;
  data: T;
}
