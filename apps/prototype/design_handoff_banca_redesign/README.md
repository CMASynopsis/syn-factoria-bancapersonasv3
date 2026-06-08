# Handoff: Rediseño de Banca por Internet — "Banco Digital"

## Overview
Modernización completa de la banca por internet (app web Angular servida en `localhost:4200`).
Cubre **login, dashboard (inicio), 3 flujos de transferencia (entre mis cuentas, mismo banco, otro banco vía CCI) con paso de revisión y pantalla de éxito, historial de movimientos y detalle de cuentas**.
La estética es un neobanco claro, moderno y con color: navegación lateral (sidebar) en escritorio que colapsa a barra inferior en móvil (responsive).

## About the Design Files
Los archivos de este paquete (`index.html`, `*.jsx`) son **referencias de diseño creadas en HTML/React** — prototipos que muestran el aspecto y el comportamiento deseados, **no código para copiar tal cual**.
La tarea es **recrear estos diseños dentro del codebase Angular existente**, usando sus patrones establecidos (componentes, servicios, routing, SCSS/Tailwind/Material si aplica). No se debe shippear el HTML directamente ni introducir React.

Mapa sugerido a Angular:
- Cada pantalla → un componente Angular standalone o de módulo (`login`, `home`, `transferencia-propia`, `transferencia-mismo-banco`, `transferencia-otro-banco`, `movimientos`).
- Sidebar / Topbar / BottomNav → componentes de layout reutilizables (un `shell` con `<router-outlet>`).
- Los 3 temas de color → un set de variables CSS (`:root`) intercambiables; el tema **Azul** es el definitivo por defecto (ver más abajo). Los temas Morado/Slate son opcionales.

## Fidelity
**Alta fidelidad (hifi).** Colores, tipografía, espaciado, radios y estados están definidos abajo con valores exactos. Recrear pixel-perfect usando las librerías del codebase.

---

## Design Tokens (TEMA DEFINITIVO = "Azul")

### Colores (CSS custom properties)
```css
:root {
  --bg:            #EDF1F8;  /* fondo app (gris azulado muy claro) */
  --surface:       #FFFFFF;  /* tarjetas, inputs, sidebar */
  --surface-2:     #F2F5FB;  /* inputs en reposo, fills suaves */
  --surface-3:     #E4EAF5;  /* chips/badges neutros, prefijos */
  --text:          #0E1526;  /* texto principal (navy casi negro) */
  --text-dim:      #4A546B;  /* texto secundario */
  --text-mute:     #8791A8;  /* placeholders, labels mute */
  --border:        #E0E6F1;
  --border-strong: #C8D1E2;
  --primary:       #2563EB;  /* azul de marca: botones, sidebar activo, links */
  --primary-2:     #4F7BFF;  /* fin de gradiente del primario */
  --on-primary:    #F0F5FF;  /* texto/icono sobre primario */
  --accent:        #7C5CFF;  /* morado de acento: highlights, CTA secundario */
  --on-accent:     #FFFFFF;
  --ring:          #3B7BFF;  /* focus ring */
  --positive:      #2563EB;  /* estado "Procesada" / éxito (AZUL, no verde) */
  --positive-bg:   #DEEAFE;
  --negative:      #E5484D;  /* errores de validación */
  --shadow:        18px 28px 60px -28px rgba(37,99,235,.32);
  --radius:        20px;     /* radio base (tarjetas/paneles) */
  --radius-sm:     13px;     /* inputs, botones, nav items */
  --radius-lg:     28px;
}
```

### Gradientes de las tarjetas de cuenta (en orden: cuenta 1, 2, 3)
```
Cuenta 1 (Ahorros PEN):  linear-gradient(145deg, #3B82F6, #1D4ED8)   /* azul */
Cuenta 2 (Ahorros USD):  linear-gradient(145deg, #8B6CFF, #5B34E0)   /* violeta */
Cuenta 3 (Corriente):    linear-gradient(145deg, #48566E, #1E293B)   /* slate */
chip de moneda: fondo rgba(255,255,255,.24), texto blanco
```

### Temas alternativos (opcionales, mismo esquema de variables)
- **Morado:** `--primary:#7C3AED; --primary-2:#A855F7; --accent:#3B82F6; --bg:#F1EDFA; --positive:#6D5CF6;`
- **Slate:**  `--primary:#334155; --primary-2:#475569; --accent:#2D7BFF; --bg:#EDF0F5; --positive:#2D7BFF;`
(Ver `theme.jsx` para los valores completos de cada uno.)

### Tipografía
- **Familia UI / títulos:** `Plus Jakarta Sans` (Google Fonts, pesos 400/500/600/700/800).
- **Familia números de cuenta / CCI:** `Space Mono` (mono, 400/700). Usar `font-variant-numeric: tabular-nums` en saldos.
- Escala usada:
  - H1 página: `30px / 800 / letter-spacing -0.025em / line-height 1.05`
  - H2 sección: `19px / 700 / -0.02em`
  - Eyebrow (rótulo): `12px / 700 / 0.1em / uppercase / color var(--text-mute)`
  - Body: `14–15px / 500–600`
  - Saldo grande (tarjeta): `30px / 800 / -0.03em`
  - Monto hero (revisión/éxito): `46–48px / 800 / -0.03em`
  - Label de campo: `13.5px / 700`
  - Hint de campo: `12px / 500 / color var(--text-mute)`

### Espaciado / radios / sombras
- Radio: tarjetas/paneles `var(--radius)` (20px), inputs/botones 14px, nav items 13px, tarjetas de cuenta 24px, pills/avatars 40–50%.
- Altura de controles: inputs `54px`, botones `50px`, icon-button `42px`.
- Sombra de elevación (hover en tarjetas): `var(--shadow)`.
- Ancho máximo de contenido: `1080px`, centrado, padding `36px 44px 120px`.
- Sidebar: ancho `264px`.

---

## Screens / Views

### 1. Login (`/login`)
- **Propósito:** autenticación.
- **Layout:** grid 2 columnas `1.05fr / 1fr`. Izquierda = panel de marca (gradiente `var(--primary) → var(--primary-2)`, texto claro, con círculos decorativos de radial-gradient del acento). Derecha = formulario centrado, ancho máx `420px`, fondo `var(--bg)`.
- **Panel de marca:** logo (cuadro 40px radio 12px con icono "sparkle") + "Banco Digital" + "BANCA EN LÍNEA SEGURA"; titular grande "Mueve tu dinero en segundos." (46px/800); párrafo; 3 mini-stats (Inmediato/Mismo banco, 24h/Interbancario, 256-bit/Cifrado); pie "Conexión segura SSL/TLS 256 bits" con candado.
- **Formulario:** título "Iniciar sesión", subtítulo; campo Usuario (`text`), campo Contraseña (`password`) con botón ojo para mostrar/ocultar; link "¿Olvidaste tu clave?"; botón primario full-width "Ingresar"; pie "¿Problemas para ingresar? Contáctanos".
- **Estado especial:** si viene de logout, mostrar nota informativa azul "Has cerrado sesión exitosamente. ¡Hasta pronto!" (icono check, fondo `--positive-bg`).
- **Móvil:** el panel de marca se oculta; solo el formulario.

### 2. Dashboard / Inicio (`/home`)
- **Propósito:** resumen de cuentas y accesos.
- **Layout (dentro del shell):** Topbar sticky (título "Inicio" + subtítulo, search, campana con punto, chip de usuario con avatar e iniciales). Contenido en `.page`.
- **Encabezado:** eyebrow "RESUMEN GENERAL", H1 "Hola, Juan Carlos 👋", línea "Patrimonio disponible en soles: **S/ 23,220.50**" (suma de cuentas PEN disponibles), y botón primario "Nueva transferencia" (icono +).
- **Mis cuentas:** grid 3 columnas (1 col en móvil) de tarjetas de cuenta. Cada tarjeta: tipo (AHORROS/CORRIENTE, uppercase), chip de moneda (PEN/USD), número enmascarado `•••• 0001` (mono), "Saldo disponible" + monto grande, "Saldo total: …". Hover: translateY(-3px). Link "Ver todas".
- **Accesos rápidos:** grid 4 columnas (2 en móvil). Tarjetas-botón con icono en chip de color (tinte de acento), título y descripción:
  - "Entre mis cuentas" → `/transferencia/propia`
  - "Mismo banco" → `/transferencia/mismo-banco`
  - "Otro banco (CCI)" → `/transferencia/otro-banco`
  - "Constancias" → `/movimientos`
- **Últimas operaciones:** tarjeta con filas (máx 4) + link "Ver historial".

### 3. Movimientos (`/movimientos`)
- Lista completa de operaciones con filtros (chips: Todas / Enviadas / Recibidas) y botón "Exportar".
- Cada fila: icono según tipo, destinatario + tipo, fecha, monto (con signo; entradas en `--positive` azul), badge de estado "Procesada".

### 4. Mis cuentas (`/cuentas`)
- Repite las 3 tarjetas de cuenta + una tabla con detalle (tipo, número completo en mono, saldo disponible, link "Transferir").

### 5–7. Transferencias (flujo de 3 pasos: Formulario → Revisión → Éxito)
Layout común: botón "Volver al inicio", encabezado con icono en cuadro primario + H1 + subtítulo, **sub-navegación** con 3 pills (Entre mis cuentas / Mismo banco / Otro banco (CCI)) para saltar entre variantes, y un grid `1fr / 360px`: **panel de formulario** (izq) + **panel de Resumen sticky** (der) que se actualiza en vivo (Desde, Hacia, Comisión, Total a debitar).

- **5. Entre mis cuentas (`/transferencia/propia`):**
  Cuenta origen (select), Cuenta destino (select, excluye la de origen), Monto, Glosa/Referencia (opcional). Nota informativa azul: "…se procesan de forma inmediata y sin costo adicional."
- **6. Mismo banco (`/transferencia/mismo-banco`):**
  Cuenta origen (select), Número de cuenta destino (13 dígitos, mono, hint), Monto, Glosa. Misma nota informativa.
- **7. Otro banco / CCI (`/transferencia/otro-banco`):**
  Agrupado en 3 bloques: **Datos de origen** (Cuenta origen). **Datos del destinatario** (Banco destino select, CCI de 20 dígitos mono con hint, Nombre del titular). **Datos de la operación** (Monto con hint "Límite: S/ 50,000.00 por operación", Glosa). Nota de **advertencia ámbar** (`fondo #FFF6E5, texto #7A5A12`): "…se procesan en el próximo ciclo de liquidación. El plazo de acreditación es de hasta 24 horas hábiles. Verifica bien los datos antes de confirmar."

- **Input de monto (todas):** caja grande con símbolo de moneda (`S/` o `$` según moneda de la cuenta origen) y número a 38px/800.
- **Paso Revisión:** monto hero centrado, resumen de Desde/Hacia/Glosa/"Disponible después", nota de seguridad, botones "Editar" (ghost) y "Confirmar y transferir" (acento/morado).
- **Paso Éxito:** check azul en círculo, "Transferencia exitosa", monto, mensaje (inmediato vs. hasta 24h hábiles para CCI), bloque con N° de operación, botones "Constancia" y "Ir al inicio".

---

## Interactions & Behavior
- **Navegación:** sidebar/bottom-nav cambian de ruta; "Transferencias" queda activo en cualquiera de los 3 flujos.
- **Validación de transferencia (botón "Continuar" deshabilitado hasta cumplir):**
  - origen seleccionado; monto > 0; monto ≤ saldo disponible del origen (si excede → mensaje rojo "El monto supera el saldo disponible").
  - propia: destino ≠ origen. mismo banco: 13 dígitos. CCI: banco + 20 dígitos + nombre (>2 chars).
- **Sanitización de inputs:** monto solo `[0-9.]`; cuenta destino `[0-9-]`; CCI solo dígitos (máx 20).
- **Estados:** hover en tarjetas/botones (translateY + sombra), focus ring en inputs (`box-shadow 0 0 0 4px` del ring al ~22%), botón "Ingresar" muestra "Ingresando…" ~700ms antes de entrar.
- **Éxito:** al confirmar se antepone la nueva operación al historial (`Movimientos` la muestra arriba).
- **Responsive:** breakpoint principal `920px` (sidebar→bottom-nav, grids a 1 col, formulario y resumen en una columna). `540px` ajusta tamaños.
- **Reduced motion:** respetar `prefers-reduced-motion` (sin animaciones que oculten contenido).

## State Management
- Sesión: `logged` (bool), `justLoggedOut` (bool para la nota de login).
- Navegación: ruta actual (usar Angular Router en el codebase real).
- Datos: lista de cuentas, lista de transacciones (mutable: se le antepone la nueva al confirmar). En la app real provienen de servicios/endpoints existentes — aquí son mock (`data.jsx`).
- Tweak de tema: `theme` ('azul' | 'morado' | 'slate') y `radius`. En producción basta con fijar el tema Azul.

## Datos de ejemplo (de `data.jsx`)
- Cuentas: Ahorros PEN `123-456-789-0001` (disp. 14,920.50 / total 15,420.50); Ahorros USD `123-456-789-0003` ($2,500.00); Corriente PEN `123-456-789-0002` (8,300.00).
- Bancos destino (CCI): BCP, Interbank, BBVA, Scotiabank, BanBif, Banco Pichincha, Banco Falabella, Mibanco.
- Usuario: Juan Carlos García López (iniciales JC, usuario `jgarcia`).

## Assets
- **Fuentes:** Google Fonts (Plus Jakarta Sans, Space Mono).
- **Iconos:** set propio de iconos de línea (stroke 1.9, 24×24) definido en `ui.jsx` (`ICONS`): home, swap, bank, globe, clock, card, user, bell, eye/eyeoff, check, chevron, arrow, plus, logout, shield, lock, download, search, sparkle. En el codebase, reemplazar por la librería de iconos existente (p. ej. Material Icons, Lucide) manteniendo el trazo fino.
- No hay imágenes raster; las decoraciones son gradientes/círculos CSS.

## Files (referencias de diseño en este paquete)
- `index.html` — base, todas las variables CSS y clases de componentes (la fuente de verdad de estilos).
- `theme.jsx` — los 3 temas (valores exactos de cada variable + gradientes de tarjetas).
- `data.jsx` — datos mock y formateadores de moneda (`money`, `signed`).
- `ui.jsx` — componentes compartidos: Icon, Button, Field, Badge, AccountCard, Sidebar, Topbar, BottomNav.
- `screens-auth.jsx` — Login.
- `screens-home.jsx` — Dashboard, Movimientos, Mis cuentas.
- `screens-transfer.jsx` — los 3 flujos + Revisión + Éxito.
- `app.jsx` — router/estado + panel de tweaks de tema.

> Para ver los prototipos: abrir `index.html` en un navegador. Usuario/clave vienen precargados; "Ingresar" entra directo.
