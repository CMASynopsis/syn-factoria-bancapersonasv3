# Script de Ciclo de Vida Terraform — `run.sh`

## Visión General

`scripts/terraform/run.sh` es el punto de entrada único para gestionar el ciclo de vida completo de la infraestructura Terraform del proyecto Banca Nacional. El script abstrae la complejidad de workspaces, backend remoto, archivos de perfil y variables de entorno en una interfaz simple de comandos.

Funcionalidades principales:

- Selección de perfil (`dev`/`staging`/`prod`) que determina automáticamente el archivo `.tfvars`, el backend-config `.hcl` y el workspace
- Gestión automática de workspaces (creación y selección)
- Confirmación interactiva antes de operaciones destructivas
- Argumento `--target` para operaciones sobre recursos específicos
- Carga de credenciales Azure desde archivo `profile.env` o variables de entorno
- Integración con utilidades compartidas (`log.sh`, `get.sh`, `validate.sh`)

---

## Prerrequisitos

- **Terraform** v1.5+ instalado y en PATH
- **Azure CLI** instalado y autenticado (`az login`), o un **Service Principal** configurado
- Acceso de red a Azure Storage para el estado remoto
- Ejecutar el script **desde la raíz del proyecto** (usa rutas relativas a `scripts/terraform/`)

---

## Inicio Rápido

```bash
# 1. Configurar credenciales (copiar plantilla y editar)
cp scripts/terraform/profile.env.example scripts/terraform/dev.env

# 2. Editar dev.env con los valores del Service Principal (o usar az login)

# 3. Inicializar Terraform
scripts/terraform/run.sh init --profile dev

# 4. Validar configuración
scripts/terraform/run.sh validate

# 5. Generar y revisar plan
scripts/terraform/run.sh plan --profile dev

# 6. Aplicar (con confirmación)
scripts/terraform/run.sh apply --profile dev
```

---

## Referencia de Comandos

| Comando | Descripción | Uso típico |
|---------|-------------|------------|
| `init` | Inicializa Terraform con el backend-config del perfil. Descarga providers. | Primera vez o después de cambiar `versions.tf` |
| `plan` | Genera un plan de ejecución con `-detailed-exitcode` (0 = sin cambios, 2 = cambios detectados) | Antes de cada `apply` |
| `apply` | Aplica los cambios en Azure. Incluye confirmación interactiva y gestión de workspace | Despliegue de infraestructura |
| `destroy` | Destruye todos los recursos del entorno. Requiere confirmación | Limpieza de entorno |
| `validate` | Valida la sintaxis y configuración de los archivos `.tf` | CI/CD o después de editar `.tf` |
| `fmt` | Formatea todos los archivos `.tf` con `terraform fmt -recursive` | Antes de commit |
| `output` | Muestra los outputs del estado de Terraform para el perfil activo | Consultar URLs, credenciales |
| `workspace` | Gestiona workspaces: `list`, `create <name>`, `select <name>`, `delete <name>` | Tareas avanzadas de estado |
| `console` | Abre la consola interactiva de Terraform para evaluar expresiones | Depuración de configuraciones |

### Detalle de cada comando

**`init`**
```bash
scripts/terraform/run.sh init --profile dev
```
Lee el archivo `backend-configs/<profile>.hcl` y ejecuta `terraform init -reconfigure -backend-config=<file>`. Si no existe el backend-config, inicializa con backend local.

**`plan`**
```bash
scripts/terraform/run.sh plan --profile dev
scripts/terraform/run.sh plan --profile prod --target azurerm_container_app.backend
```
Selecciona el workspace del perfil, carga el archivo `.tfvars` y ejecuta `terraform plan -detailed-exitcode`. El código de salida se interpreta: 0 = sin cambios, 2 = cambios detectados.

**`apply`**
```bash
scripts/terraform/run.sh apply --profile staging
scripts/terraform/run.sh apply --profile prod --auto-approve
```
Muestra un resumen visual con perfil y acción, pide confirmación `sí/no`, gestiona workspace y aplica.

**`destroy`**
```bash
scripts/terraform/run.sh destroy --profile dev --auto-approve
```
Igual que apply pero ejecuta `terraform destroy`. Misma confirmación interactiva.

---

## Sistema de Perfiles

### Selección de perfil

El flag `-p` o `--profile` selecciona el perfil activo. Por defecto es `dev`.

Cada perfil determina tres archivos automáticamente:

```
PROFILE=dev
  ├── infra/terraform/profiles/dev.tfvars       → variables
  ├── infra/terraform/backend-configs/dev.hcl   → backend remoto
  └── workspace: dev                             → workspace
```

### Archivo profile.env

El script carga variables de entorno desde `scripts/terraform/<profile>.env` usando `load_env_vars()` del helper `commons/get.sh`.

Ejemplo (`dev.env`):

```bash
TF_PROFILE=dev
ARM_SUBSCRIPTION_ID=00000000-0000-0000-0000-000000000000
ARM_TENANT_ID=00000000-0000-0000-0000-000000000000
ARM_CLIENT_ID=00000000-0000-0000-0000-000000000000
ARM_CLIENT_SECRET=supersecret
```

**Mecanismo de carga**:
1. Si se usa `--profile-file <ruta>`, carga ese archivo directamente
2. Si no, busca `<directorio_del_script>/<perfil>.env` (ej. `scripts/terraform/dev.env`)
3. Las variables `ARM_*` quedan disponibles para el provider de AzureRM

> **Nota:** Si usas `az login`, no necesitas definir `ARM_CLIENT_ID` ni `ARM_CLIENT_SECRET`. El Azure CLI mantiene una sesión válida.

---

## Opciones

| Opción | Descripción | Ejemplo |
|--------|-------------|---------|
| `-p, --profile <name>` | Perfil de configuración (`dev`, `staging`, `prod`). Default: `dev` | `--profile prod` |
| `--auto-approve` | Omite la confirmación interactiva en `apply` y `destroy` | `--auto-approve` |
| `--target <resource>` | Apunta a un recurso específico. Acepta múltiples separados por coma | `--target azurerm_container_app.backend` |
| `--profile-file <ruta>` | Ruta alternativa al archivo de perfil | `--profile-file /path/custom.env` |
| `-h, --help` | Muestra la ayuda del script | `-h` |

### Uso combinado de opciones

```bash
scripts/terraform/run.sh apply --profile prod --target azurerm_container_app.backend,azurerm_static_site.frontend --auto-approve
```

---

## Ejemplos

### Flujo completo de inicialización (entorno nuevo)

```bash
# 1. Configurar credenciales
cp scripts/terraform/profile.env.example scripts/terraform/dev.env
# Editar dev.env con las credenciales

# 2. Inicializar
scripts/terraform/run.sh init --profile dev

# 3. Validar
scripts/terraform/run.sh validate

# 4. Planificar
scripts/terraform/run.sh plan --profile dev

# 5. Aplicar
scripts/terraform/run.sh apply --profile dev

# 6. Ver outputs
scripts/terraform/run.sh output --profile dev
```

### Plan diario (sin cambios)

```bash
scripts/terraform/run.sh plan --profile staging
# Exit code 0 → "Plan completado — Sin cambios"
```

### Actualizar solo el backend (Container App)

```bash
scripts/terraform/run.sh plan --profile prod --target azurerm_container_app.backend
scripts/terraform/run.sh apply --profile prod --target azurerm_container_app.backend --auto-approve
```

### Destruir entorno dev

```bash
scripts/terraform/run.sh destroy --profile dev --auto-approve
```

### Gestionar workspaces manualmente

```bash
scripts/terraform/run.sh workspace list
scripts/terraform/run.sh workspace create mi-workspace
scripts/terraform/run.sh workspace select prod
scripts/terraform/run.sh workspace delete mi-workspace
```

### Evaluar expresiones en consola interactiva

```bash
scripts/terraform/run.sh console --profile dev
> var.cors_allowed_origins
> azurerm_container_registry.main.login_server
> exit
```

### Usar con Service Principal personalizado

```bash
scripts/terraform/run.sh plan --profile dev --profile-file ~/secrets/mi-cliente.env
```

---

## Variables de Entorno

### Autenticación Azure (ARM_*)

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `ARM_SUBSCRIPTION_ID` | Con SP | ID de la suscripción de Azure |
| `ARM_TENANT_ID` | Con SP | ID del tenant de Azure AD |
| `ARM_CLIENT_ID` | Con SP | Client ID del Service Principal |
| `ARM_CLIENT_SECRET` | Con SP | Client Secret del Service Principal |

Si estas variables están vacías, Terraform usa la sesión activa de Azure CLI.

### Perfil (TF_PROFILE)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `TF_PROFILE` | `dev` | Perfil activo. Controla qué `.tfvars`, backend-config y workspace se usan |

### Debug

| Variable | Default | Descripción |
|----------|---------|-------------|
| `DEBUG_ENABLED` | `false` | Si es `true`, muestra logs de nivel DEBUG |
| `LOG_TO_FILE` | `false` | Si es `true`, guarda logs en `scripts/.logs/` |

---

## Notas Técnicas

- El script usa `set -euo pipefail` para fail-fast ante cualquier error.
- Las funciones internas usan sufijos únicos (`f3a6e7b2c1d4e5f6a7b8`) para evitar colisiones con otros scripts que se sourceen.
- `workspace list` captura subcomandos antes del parsing general de argumentos para evitar conflictos con el while loop.
- La función `build_target_args` convierte `--target "res.a,res.b"` en `-target=res.a -target=res.b`.
- Si no existe archivo de backend-config, el script cae a backend local con una advertencia.
