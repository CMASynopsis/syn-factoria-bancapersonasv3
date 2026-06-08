import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CuentaService } from '../../services/cuenta.service';
import { Cuenta } from '../../models/cuenta.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-cuentas',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './cuentas.component.html'
})
export class CuentasComponent implements OnInit {
  private cuenta = inject(CuentaService);

  cuentas  = signal<Cuenta[]>([]);
  selected = signal<Cuenta | null>(null);
  error    = signal('');

  ngOnInit(): void {
    this.cuenta.listar().subscribe({
      next: d => { this.cuentas.set(d); if (d.length) this.selected.set(d[0]); },
      error: e => this.error.set(e.error?.mensaje ?? 'Error al cargar cuentas.')
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

  select(c: Cuenta): void {
    this.selected.set(c);
  }
}
