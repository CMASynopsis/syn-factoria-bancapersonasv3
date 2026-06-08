# banca-nacional-frontend

Aplicación web de banca digital construida con Angular 21.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Angular 21 (standalone components) |
| Lenguaje | TypeScript 5.9 |
| Build | Angular CLI 21 (Vite) |
| Forms | Template-driven (`FormsModule`) |
| Estado | Signals (`signal`, `computed`) |
| HTTP | `HttpClient` con interceptors funcionales |
| Routing | Lazy loading con `loadComponent()` |
| Estilos | CSS plano con custom properties |
| Testing | Karma + Jasmine (setup presente, sin tests) |
| Dependencias externas | 0 (solo ecosistema Angular + RxJS) |

## Estructura

```
apps/frontend/banca-nacional-frontend/
├── angular.json
├── package.json
├── tsconfig.json
├── src/
│   ├── index.html                    # Entry HTML (carga Google Fonts)
│   ├── main.ts                       # bootstrapApplication()
│   ├── styles.css                    # Único archivo CSS (346 lines, design system completo)
│   └── app/
│       ├── app.component.ts          # <router-outlet/> raíz
│       ├── app.config.ts             # providers globales
│       ├── app.routes.ts             # Definición de rutas
│       ├── models/
│       │   ├── usuario.model.ts      # Usuario, LoginResponse
│       │   ├── cuenta.model.ts       # Cuenta
│       │   └── transferencia.model.ts# Transferencia, ApiResponse<T>
│       ├── services/
│       │   ├── auth.service.ts       # Login, logout, token management
│       │   ├── cuenta.service.ts     # CRUD cuentas
│       │   └── transferencia.service.ts # Transferencias + DTOs
│       ├── guards/
│       │   └── auth.guard.ts         # CanActivateFn funcional
│       ├── interceptors/
│       │   └── auth.interceptor.ts   # HttpInterceptorFn (JWT Bearer)
│       └── components/
│           ├── shell/                # Layout autenticado (sidebar + topbar + router-outlet)
│           ├── login/                # Pantalla de login pública
│           ├── home/                 # Dashboard principal
│           ├── navbar/               # Navbar legacy (fase 1)
│           ├── icon/                 # Iconos SVG inline
│           ├── cuentas/              # Mis cuentas
│           ├── movimientos/          # Historial de movimientos
│           ├── consulta-saldo/       # Legacy (redirige a /cuentas)
│           ├── consulta-saldo-filtrado/ # Legacy (redirige a /cuentas)
│           └── transferencia/
│               ├── propia/           # Entre cuentas propias
│               ├── mismo-banco/      # A cuentas del mismo banco
│               └── otro-banco/       # Transferencia interbancaria
```

## Routing

| Ruta | Componente | Guard |
|---|---|---|
| `/login` | `LoginComponent` | Público |
| `/home` | `HomeComponent` | Auth |
| `/cuentas` | `CuentasComponent` | Auth |
| `/movimientos` | `MovimientosComponent` | Auth |
| `/transferencia/propia` | `TransferenciaPropiaComponent` | Auth |
| `/transferencia/mismo-banco` | `TransferenciaMismoBancoComponent` | Auth |
| `/transferencia/otro-banco` | `TransferenciaOtroBancoComponent` | Auth |

- Las rutas autenticadas son hijas de `ShellComponent` (layout compartido).
- Las rutas legacy `/consulta/saldos` y `/consulta/saldos-filtrado` redirigen a `/cuentas`.

## Componentes

### ShellComponent
Layout principal autenticado: sidebar (marca, navegación, ayuda, cerrar sesión) + topbar (título, búsqueda, notificaciones, avatar) + `<router-outlet/>`. Incluye bottom nav para mobile (< 920px).

### LoginComponent
Split layout: panel decorativo izquierdo (marca, estadísticas) + formulario derecho. 
Valida campos, llama a `AuthService.login()`, redirige a `/home` en éxito.

### HomeComponent (Dashboard)
- Señales: `cuentas`, `recientes`, `patrimonio` (computed)
- Muestra saludo, patrimonio total, tarjetas de cuentas, acciones rápidas, últimas transferencias

### CuentasComponent
Lista de cuentas con selección. Panel detalle con saldo disponible, CCI, moneda, fecha apertura.

### MovimientosComponent
Historial de transferencias con filtros: Todas / Enviadas / Recibidas. Usa `computed` para filtrar.

### TransferenciaPropiaComponent / MismoBancoComponent / OtroBancoComponent
Asistente 3 pasos: `form → review → success` (manejado con señal `Step`). 
- **Propia**: select de cuenta origen y destino (valida que sean distintas)
- **Mismo banco**: input text para número de cuenta destino
- **Otro banco**: select de banco + CCI + titular destino

### IconComponent
Librería de 27 iconos SVG inline. Inputs: `name`, `size`, `sw` (stroke-width).
Sin dependencias externas de iconos.

## Servicios

### AuthService (`providedIn: root`)
| Método | HTTP | Descripción |
|---|---|---|
| `login(username, password)` | `POST /api/auth/login` | Autentica, almacena token + user en localStorage |
| `logout()` | — | Limpia sesión, redirige a `/login?logout=success` |
| `getToken()` | — | Retorna token desde localStorage |

Estado: `_user` (signal) restaurado desde `localStorage('banca_user')` al recargar.

### CuentaService (`providedIn: root`)
| Método | HTTP |
|---|---|
| `listar(tipo?)` | `GET /api/cuentas?tipo=...` |

### TransferenciaService (`providedIn: root`)
| Método | HTTP |
|---|---|
| `historial()` | `GET /api/transferencias` |
| `propia(dto)` | `POST /api/transferencias/propia` |
| `mismoBanco(dto)` | `POST /api/transferencias/mismo-banco` |
| `otroBanco(dto)` | `POST /api/transferencias/otro-banco` |

Exporta interfaces DTO: `TransferenciaPropiaDTO`, `TransferenciaMismoBancoDTO`, `TransferenciaOtroBancoDTO`.

## Flujo de autenticación

1. `LoginComponent` envía `POST /api/auth/login` con username + password
2. Backend retorna `ApiResponse<LoginResponse>` con `token` (JWT) + datos del usuario
3. `AuthService` guarda en localStorage: `banca_token` y `banca_user`
4. `AuthGuard` (CanActivateFn) verifica `auth.isLoggedIn()` (señal computada de `_user !== null`)
5. `AuthInterceptor` (HttpInterceptorFn) agrega header `Authorization: Bearer <token>` a toda request
6. `Logout` limpia localStorage y señal, redirige a `/login?logout=success`

## Sistema de diseño (CSS)

Archivo único `styles.css` con **design tokens** mediante custom properties en `:root`:

- **Colores**: Paleta azul (`--primary: #2563EB`) con variantes, texto, bordes, estados (positivo/negativo)
- **Tipografía**: Plus Jakarta Sans (UI) + Space Mono (monospace) via Google Fonts
- **Radios**: `--radius: 20px`, `--radius-sm: 13px`, `--radius-lg: 28px`
- **Sombras**: Sombra azul translúcida para tarjetas
- **Sin preprocesador**: CSS plano, organizado por secciones (reset, tokens, sidebar, topbar, buttons, fields, accounts, transactions, login, responsive)

### Responsive
- **Desktop**: Sidebar fijo + topbar + contenido
- **< 920px**: Sidebar oculto, bottom nav aparece, cuentas a 1 columna
- **< 540px**: Ajustes de padding y tamaño de fuente

## API

Todas las rutas apuntan a `http://localhost:8080/api/`:
- `POST /api/auth/login` → `ApiResponse<LoginResponse>`
- `GET /api/cuentas` → `ApiResponse<Cuenta[]>`
- `GET /api/transferencias` → `ApiResponse<Transferencia[]>`
- `POST /api/transferencias/propia` → `ApiResponse<string>`
- `POST /api/transferencias/mismo-banco` → `ApiResponse<string>`
- `POST /api/transferencias/otro-banco` → `ApiResponse<string>`

## Desarrollo local

```bash
cd apps/frontend/banca-nacional-frontend
npm install
npx ng serve --open   # http://localhost:4200
```

## Build

```bash
npx ng build
# output: apps/frontend/banca-nacional-frontend/dist/
```
