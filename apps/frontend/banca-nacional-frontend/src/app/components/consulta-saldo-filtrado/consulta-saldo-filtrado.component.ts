import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { CuentaService } from '../../services/cuenta.service';
import { Cuenta } from '../../models/cuenta.model';

@Component({
  selector: 'app-consulta-saldo-filtrado',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FormsModule, DatePipe],
  templateUrl: './consulta-saldo-filtrado.component.html'
})
export class ConsultaSaldoFiltradoComponent implements OnInit {

  private readonly cuentaService = inject(CuentaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  cuentas = signal<Cuenta[]>([]);
  tipoFiltro = signal<string>('TODAS');
  errorMsg = signal('');

  totalPEN = computed(() =>
    this.cuentas().filter(c => c.moneda === 'PEN').reduce((s, c) => s + c.saldoDisponible, 0)
  );
  totalUSD = computed(() =>
    this.cuentas().filter(c => c.moneda === 'USD').reduce((s, c) => s + c.saldoDisponible, 0)
  );

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tipo = params['tipo'] || 'TODAS';
      this.tipoFiltro.set(tipo);
      this.cargar(tipo);
    });
  }

  onFiltroChange(tipo: string): void {
    this.router.navigate([], { queryParams: { tipo }, queryParamsHandling: 'merge' });
  }

  limpiarFiltro(): void {
    this.router.navigate([], { queryParams: {} });
  }

  private cargar(tipo: string): void {
    this.errorMsg.set('');
    this.cuentaService.listar(tipo).subscribe({
      next: data => this.cuentas.set(data),
      error: err => this.errorMsg.set(err.error?.mensaje ?? 'Error al cargar cuentas.')
    });
  }
}
