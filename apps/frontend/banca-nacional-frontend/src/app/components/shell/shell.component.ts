import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './shell.component.html'
})
export class ShellComponent {
  private router = inject(Router);
  auth = inject(AuthService);

  initials = computed(() => {
    const u = this.auth.user();
    return u ? (u.nombres[0] ?? '') + (u.apellidos[0] ?? '') : '';
  });

  firstName = computed(() => this.auth.user()?.nombres ?? '');

  isTransfer = computed(() => this.router.url.startsWith('/transferencia'));

  get pageTitle(): string {
    const url = this.router.url;
    if (url.startsWith('/home'))          return 'Inicio';
    if (url.startsWith('/cuentas'))       return 'Mis cuentas';
    if (url.startsWith('/movimientos'))   return 'Movimientos';
    if (url.startsWith('/transferencia')) return 'Transferencias';
    return 'Banco Digital';
  }

  get pageSubtitle(): string {
    const url = this.router.url;
    if (url.startsWith('/home'))          return 'Bienvenido de vuelta';
    if (url.startsWith('/cuentas'))       return 'Detalle de tus productos';
    if (url.startsWith('/movimientos'))   return 'Historial de operaciones';
    if (url.startsWith('/transferencia')) return 'Envío de fondos';
    return '';
  }

  logout() { this.auth.logout(); }
}
