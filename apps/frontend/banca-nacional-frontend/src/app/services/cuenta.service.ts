import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cuenta } from '../models/cuenta.model';
import { ApiResponse } from '../models/transferencia.model';
import { API_BASE } from '../api.config';

const API = `${API_BASE}/api/cuentas`;

@Injectable({ providedIn: 'root' })
export class CuentaService {

  private readonly http = inject(HttpClient);

  listar(tipo?: string): Observable<Cuenta[]> {
    const params: Record<string, string> = {};
    if (tipo && tipo !== 'TODAS') params['tipo'] = tipo;
    return this.http.get<ApiResponse<Cuenta[]>>(API, { params })
      .pipe(map(r => r.data));
  }
}
