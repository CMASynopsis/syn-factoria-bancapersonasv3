import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'cuentas',
        loadComponent: () => import('./components/cuentas/cuentas.component').then(m => m.CuentasComponent)
      },
      {
        path: 'movimientos',
        loadComponent: () => import('./components/movimientos/movimientos.component').then(m => m.MovimientosComponent)
      },
      {
        path: 'transferencia/propia',
        loadComponent: () => import('./components/transferencia/propia/transferencia-propia.component').then(m => m.TransferenciaPropiaComponent)
      },
      {
        path: 'transferencia/mismo-banco',
        loadComponent: () => import('./components/transferencia/mismo-banco/transferencia-mismo-banco.component').then(m => m.TransferenciaMismoBancoComponent)
      },
      {
        path: 'transferencia/otro-banco',
        loadComponent: () => import('./components/transferencia/otro-banco/transferencia-otro-banco.component').then(m => m.TransferenciaOtroBancoComponent)
      },
      { path: 'consulta/saldos',          redirectTo: '/cuentas' },
      { path: 'consulta/saldos-filtrado', redirectTo: '/cuentas' },
    ]
  },
  { path: '**', redirectTo: 'home' }
];
