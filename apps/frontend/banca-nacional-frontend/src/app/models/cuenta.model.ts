export interface Cuenta {
  id: number;
  numeroCuenta: string;
  numeroCuentaFormateado: string;
  tipoCuenta: string;
  moneda: string;
  saldo: number;
  saldoDisponible: number;
  estado: string;
  usuarioId: number;
  usuarioNombre: string;
  fechaApertura: string;
  cci: string;
}
