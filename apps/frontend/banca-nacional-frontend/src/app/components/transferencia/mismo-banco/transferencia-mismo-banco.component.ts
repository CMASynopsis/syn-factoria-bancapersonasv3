import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CuentaService } from '../../../services/cuenta.service';
import { TransferenciaService } from '../../../services/transferencia.service';
import { Cuenta } from '../../../models/cuenta.model';
import { IconComponent } from '../../icon/icon.component';

type Step = 'form' | 'review' | 'success';

@Component({
  selector: 'app-transferencia-mismo-banco',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  templateUrl: './transferencia-mismo-banco.component.html'
})
export class TransferenciaMismoBancoComponent implements OnInit {
  private cuenta   = inject(CuentaService);
  private transfer = inject(TransferenciaService);

  cuentas              = signal<Cuenta[]>([]);
  step                 = signal<Step>('form');
  cuentaOrigenId       = '';
  numeroCuentaDestino  = '';
  monto                = '';
  glosa                = '';
  error                = signal('');
  loading              = signal(false);
  numeroOp             = signal('');

  cuentaOrigen = computed(() => this.cuentas().find(c => c.id === +this.cuentaOrigenId) ?? null);
  montoNum     = computed(() => parseFloat(this.monto.replace(',', '.')));
  currSym      = computed(() => this.cuentaOrigen()?.moneda === 'USD' ? '$' : 'S/');

  ngOnInit(): void {
    this.cuenta.listar().subscribe(d => this.cuentas.set(d));
  }

  fmt(n: number): string {
    return `${this.currSym()} ${n.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  }

  soloNumeros(e: Event): void {
    const el = e.target as HTMLInputElement;
    el.value = el.value.replace(/\D/g, '');
    this.numeroCuentaDestino = el.value;
  }

  goReview(): void {
    this.error.set('');
    if (!this.cuentaOrigenId)         { this.error.set('Seleccione una cuenta de origen.'); return; }
    if (!this.numeroCuentaDestino)    { this.error.set('Ingrese el número de cuenta destino.'); return; }
    if (isNaN(this.montoNum()) || this.montoNum() <= 0) { this.error.set('Ingrese un monto válido mayor a cero.'); return; }
    this.step.set('review');
  }

  confirm(): void {
    this.loading.set(true);
    this.error.set('');
    this.transfer.mismoBanco({
      cuentaOrigenId: +this.cuentaOrigenId,
      numeroCuentaDestino: this.numeroCuentaDestino,
      monto: this.montoNum(),
      glosa: this.glosa
    }).subscribe({
      next: res => {
        this.loading.set(false);
        if (res.exitoso) { this.numeroOp.set(res.data); this.step.set('success'); }
        else { this.error.set(res.mensaje); this.step.set('form'); }
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Error al procesar la transferencia.');
        this.step.set('form');
      }
    });
  }

  reset(): void {
    this.cuentaOrigenId = ''; this.numeroCuentaDestino = '';
    this.monto = ''; this.glosa = '';
    this.error.set(''); this.numeroOp.set('');
    this.step.set('form');
  }
}
