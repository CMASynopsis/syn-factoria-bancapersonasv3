import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Transferencia, ApiResponse } from '../models/transferencia.model';

const API = 'http://localhost:8080/api/transferencias';

export interface TransferenciaPropiaDTO {
  cuentaOrigenId: number;
  cuentaDestinoId: number;
  monto: number;
  glosa?: string;
}

export interface TransferenciaMismoBancoDTO {
  cuentaOrigenId: number;
  numeroCuentaDestino: string;
  monto: number;
  glosa?: string;
}

export interface TransferenciaOtroBancoDTO {
  cuentaOrigenId: number;
  cciDestino: string;
  titularDestino: string;
  bancoDestino: string;
  monto: number;
  glosa?: string;
}

@Injectable({ providedIn: 'root' })
export class TransferenciaService {

  private readonly http = inject(HttpClient);

  historial(): Observable<Transferencia[]> {
    return this.http.get<ApiResponse<Transferencia[]>>(API).pipe(map(r => r.data));
  }

  propia(dto: TransferenciaPropiaDTO): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${API}/propia`, dto);
  }

  mismoBanco(dto: TransferenciaMismoBancoDTO): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${API}/mismo-banco`, dto);
  }

  otroBanco(dto: TransferenciaOtroBancoDTO): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${API}/otro-banco`, dto);
  }
}
