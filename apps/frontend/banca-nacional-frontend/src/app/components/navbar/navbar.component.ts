import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {

  readonly auth = inject(AuthService);
  openMenu: string | null = null;

  toggle(menu: string): void {
    this.openMenu = this.openMenu === menu ? null : menu;
  }

  closeAll(): void {
    this.openMenu = null;
  }

  logout(): void {
    this.closeAll();
    this.auth.logout();
  }

  get iniciales(): string {
    const u = this.auth.user();
    if (!u) return '';
    return (u.nombres[0] ?? '') + (u.apellidos[0] ?? '');
  }
}
