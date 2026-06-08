import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);

  username      = '';
  password      = '';
  showPwd       = signal(false);
  loading       = signal(false);
  errorMsg      = signal('');
  logoutSuccess = signal(false);

  constructor() {
    if (this.auth.isLoggedIn()) this.router.navigate(['/home']);
    this.route.queryParams.subscribe(p => this.logoutSuccess.set(p['logout'] === 'success'));
  }

  onSubmit(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMsg.set('Por favor complete todos los campos.');
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.username.trim(), this.password).subscribe({
      next: res => {
        if (res.exitoso) {
          this.router.navigate(['/home']).catch(() => this.loading.set(false));
        } else {
          this.errorMsg.set(res.mensaje);
          this.loading.set(false);
        }
      },
      error: err => {
        this.errorMsg.set(err.error?.mensaje ?? 'Error de conexión. Verifique que el servidor esté activo.');
        this.loading.set(false);
      }
    });
  }
}
