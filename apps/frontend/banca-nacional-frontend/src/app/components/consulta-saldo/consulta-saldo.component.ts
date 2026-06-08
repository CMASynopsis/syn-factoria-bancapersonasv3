import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { CuentaService } from '../../services/cuenta.service';
import { Cuenta } from '../../models/cuenta.model';

@Component({
  selector: 'app-consulta-saldo',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, DatePipe],
  templateUrl: './consulta-saldo.component.html'
})
export class ConsultaSaldoComponent implements OnInit {

  private readonly cuentaService = inject(CuentaService);
  cuentas = signal<Cuenta[]>([]);
  errorMsg = signal('');

  totalPEN = computed(() =>
    this.cuentas().filter(c => c.moneda === 'PEN').reduce((s, c) => s + c.saldoDisponible, 0)
  );
  totalUSD = computed(() =>
    this.cuentas().filter(c => c.moneda === 'USD').reduce((s, c) => s + c.saldoDisponible, 0)
  );

  ngOnInit(): void {
    this.cuentaService.listar().subscribe({
      next: data => this.cuentas.set(data),
      error: err => this.errorMsg.set(err.error?.mensaje ?? 'Error al cargar cuentas.')
    });
  }
}
