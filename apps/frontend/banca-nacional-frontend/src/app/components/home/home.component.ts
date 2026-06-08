import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CuentaService } from '../../services/cuenta.service';
import { TransferenciaService } from '../../services/transferencia.service';
import { Cuenta } from '../../models/cuenta.model';
import { Transferencia } from '../../models/transferencia.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, IconComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  readonly auth    = inject(AuthService);
  private cuenta   = inject(CuentaService);
  private transfer = inject(TransferenciaService);

  cuentas  = signal<Cuenta[]>([]);
  recientes = signal<Transferencia[]>([]);
  errorCuentas = signal('');
  errorTx      = signal('');

  patrimonio = computed(() =>
    this.cuentas().reduce((s, c) => s + c.saldoDisponible, 0)
  );

  firstName = computed(() => {
    const u = this.auth.user();
    return u?.nombres?.split(' ')[0] ?? '';
  });

  ngOnInit(): void {
    this.cuenta.listar().subscribe({
      next: d => this.cuentas.set(d),
      error: e => this.errorCuentas.set(e.error?.mensaje ?? 'Error al cargar cuentas.')
    });
    this.transfer.historial().subscribe({
      next: d => this.recientes.set(d.slice(0, 4)),
      error: e => this.errorTx.set(e.error?.mensaje ?? 'Error al cargar movimientos.')
    });
  }

  acctGradient(idx: number): string {
    const gs = [
      'linear-gradient(135deg,#2563EB,#4F7BFF)',
      'linear-gradient(135deg,#7C5CFF,#A78BFF)',
      'linear-gradient(135deg,#0E7490,#22D3EE)',
    ];
    return gs[idx % gs.length];
  }

  acctChipStyle(idx: number): string {
    const c = ['rgba(255,255,255,.22)', 'rgba(255,255,255,.18)', 'rgba(255,255,255,.20)'];
    return `background:${c[idx % c.length]}`;
  }

  fmt(n: number, moneda: string): string {
    const sym = moneda === 'USD' ? '$' : 'S/';
    return `${sym} ${n.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  }

  txSign(t: Transferencia): string {
    const user = this.auth.user();
    if (!user) return '+';
    const mine = this.cuentas().some(c => c.id === t.cuentaOrigenId);
    return mine ? '-' : '+';
  }

  txColor(t: Transferencia): string {
    return this.txSign(t) === '-' ? 'var(--negative)' : 'var(--positive)';
  }

  txLabel(t: Transferencia): string {
    if (t.titularDestino) return t.titularDestino;
    if (t.cuentaDestinoNumero) return `****${t.cuentaDestinoNumero.slice(-4)}`;
    return 'Transferencia';
  }

  txTypeLabel(t: Transferencia): string {
    return t.tipoTransferenciaDescripcion ?? t.tipoTransferencia ?? '';
  }
}
