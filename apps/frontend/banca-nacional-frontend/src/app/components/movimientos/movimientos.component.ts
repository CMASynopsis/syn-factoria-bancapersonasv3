import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CuentaService } from '../../services/cuenta.service';
import { TransferenciaService } from '../../services/transferencia.service';
import { Transferencia } from '../../models/transferencia.model';
import { Cuenta } from '../../models/cuenta.model';
import { IconComponent } from '../icon/icon.component';

type FilterKey = 'todas' | 'enviadas' | 'recibidas';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [DatePipe, IconComponent],
  templateUrl: './movimientos.component.html'
})
export class MovimientosComponent implements OnInit {
  private auth     = inject(AuthService);
  private cuenta   = inject(CuentaService);
  private transfer = inject(TransferenciaService);

  all    = signal<Transferencia[]>([]);
  cuentas = signal<Cuenta[]>([]);
  filter = signal<FilterKey>('todas');
  error  = signal('');

  list = computed(() => {
    const mine = new Set(this.cuentas().map(c => c.id));
    return this.all().filter(t => {
      if (this.filter() === 'enviadas')  return mine.has(t.cuentaOrigenId);
      if (this.filter() === 'recibidas') return t.cuentaDestinoId != null && mine.has(t.cuentaDestinoId);
      return true;
    });
  });

  ngOnInit(): void {
    this.cuenta.listar().subscribe({ next: d => this.cuentas.set(d) });
    this.transfer.historial().subscribe({
      next: d => this.all.set(d),
      error: e => this.error.set(e.error?.mensaje ?? 'Error al cargar movimientos.')
    });
  }

  setFilter(f: FilterKey): void { this.filter.set(f); }

  fmt(n: number, moneda: string): string {
    const sym = moneda === 'USD' ? '$' : 'S/';
    return `${sym} ${n.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  }

  txSign(t: Transferencia): string {
    const mine = new Set(this.cuentas().map(c => c.id));
    return mine.has(t.cuentaOrigenId) ? '-' : '+';
  }

  txColor(t: Transferencia): string {
    return this.txSign(t) === '-' ? 'var(--negative)' : 'var(--positive)';
  }

  txLabel(t: Transferencia): string {
    if (t.titularDestino) return t.titularDestino;
    if (t.cuentaDestinoNumero) return `****${t.cuentaDestinoNumero.slice(-4)}`;
    return 'Transferencia';
  }

  txIcon(t: Transferencia): string {
    return this.txSign(t) === '+' ? 'arrowin' : 'arrowright';
  }
}
