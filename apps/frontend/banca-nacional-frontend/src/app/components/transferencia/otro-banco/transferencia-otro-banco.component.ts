import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CuentaService } from '../../../services/cuenta.service';
import { TransferenciaService } from '../../../services/transferencia.service';
import { Cuenta } from '../../../models/cuenta.model';
import { IconComponent } from '../../icon/icon.component';

type Step = 'form' | 'review' | 'success';

const BANCOS = [
  'BCP - Banco de Crédito del Perú', 'BBVA Perú', 'Interbank',
  'Scotiabank Perú', 'BanBif', 'Banco Pichincha',
  'Mibanco', 'Banco GNB Perú', 'Banco Falabella',
  'Banco Ripley', 'Caja Trujillo', 'Caja Arequipa', 'Caja Piura'
];

@Component({
  selector: 'app-transferencia-otro-banco',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  templateUrl: './transferencia-otro-banco.component.html'
})
export class TransferenciaOtroBancoComponent implements OnInit {
  private cuenta   = inject(CuentaService);
  private transfer = inject(TransferenciaService);

  readonly bancos = BANCOS;
  cuentas         = signal<Cuenta[]>([]);
  step            = signal<Step>('form');
  cuentaOrigenId  = '';
  bancoDestino    = '';
  cciDestino      = '';
  titularDestino  = '';
  monto           = '';
  glosa           = '';
  error           = signal('');
  loading         = signal(false);
  numeroOp        = signal('');

  cuentaOrigen = computed(() => this.cuentas().find(c => c.id === +this.cuentaOrigenId) ?? null);
  montoNum     = computed(() => parseFloat(this.monto.replace(',', '.')));
  currSym      = computed(() => this.cuentaOrigen()?.moneda === 'USD' ? '$' : 'S/');

  ngOnInit(): void {
    this.cuenta.listar().subscribe(d => this.cuentas.set(d));
  }

  fmt(n: number): string {
    return `${this.currSym()} ${n.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  }

  soloNumerosCci(e: Event): void {
    const el = e.target as HTMLInputElement;
    el.value = el.value.replace(/\D/g, '');
    this.cciDestino = el.value;
  }

  goReview(): void {
    this.error.set('');
    if (!this.cuentaOrigenId)                          { this.error.set('Seleccione una cuenta de origen.'); return; }
    if (!this.bancoDestino)                            { this.error.set('Seleccione el banco destino.'); return; }
    if (!this.cciDestino || this.cciDestino.length < 20) { this.error.set('Ingrese un CCI válido de 20 dígitos.'); return; }
    if (!this.titularDestino)                          { this.error.set('Ingrese el nombre del titular destino.'); return; }
    if (isNaN(this.montoNum()) || this.montoNum() <= 0) { this.error.set('Ingrese un monto válido mayor a cero.'); return; }
    this.step.set('review');
  }

  confirm(): void {
    this.loading.set(true);
    this.error.set('');
    this.transfer.otroBanco({
      cuentaOrigenId: +this.cuentaOrigenId,
      cciDestino: this.cciDestino,
      titularDestino: this.titularDestino,
      bancoDestino: this.bancoDestino,
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
    this.cuentaOrigenId = ''; this.bancoDestino = '';
    this.cciDestino = ''; this.titularDestino = '';
    this.monto = ''; this.glosa = '';
    this.error.set(''); this.numeroOp.set('');
    this.step.set('form');
  }
}
