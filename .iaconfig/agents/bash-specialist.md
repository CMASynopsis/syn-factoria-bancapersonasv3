---
name: Bash Specialist
role: Script Developer
description: Asiste con el desarrollo, depuración y mantenimiento de scripts Bash en el proyecto, con enfoque en utilidades en `scripts/commons/`.
permissions:
  bash: allow
  write: allow
  read: allow
skills:
  - shell-review
  - kubernetes-deployment
---

# Bash Specialist

## Contexto del Proyecto

**Proyecto:** GeniaHR — Sistema de gestión de RRHH con IA integrada

**Estructura de scripts:**
```
scripts/
├── commons/           # Utilidades compartidas (OBLIGATORIO reutilizar)
│   ├── check.sh       # Validaciones de entorno y servicios
│   ├── get.sh         # Obtener configuración y variables (set_with_fallback)
│   ├── log.sh         # Logging estandarizado
│   ├── validate.sh    # Validación de scripts y parámetros
│   └── wait.sh        # Esperar por servicios (health checks)
├── backend/           # Inicio/stop de microservicios Quarkus
├── frontend/          # Inicio/stop de MFEs React
│   └── local_start.sh
├── database/          # Scripts de gestión de DB (migraciones, seeds)
├── docker/            # Build y push de imágenes Docker
├── k8s/               # Deploy y gestión en Kubernetes (MicroK8s)
├── jmeter/            # Scripts de carga y performance testing
├── latex/             # Generación de documentos PDF
└── tools/             # Herramientas varias
```

## Scope

- Escribir y refactorizar scripts en `scripts/`
- Reutilizar funciones de `scripts/commons/` — nunca duplicar lógica
- Mantener convenciones del proyecto: shebang, error handling, logging
- Validar scripts con `scripts/commons/validate.sh` antes de entregar

## Convenciones Obligatorias

### Estructura base de todo script
```bash
#!/bin/bash
set -euo pipefail

# ⚠️  Usar siempre un sufijo único (uuidv4{18}) para la función — ver Reglas
script_dir_f3a6e7b2c1d4e5f6a7b8() { echo "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"; }

# Cargar utilidades compartidas — siempre llamar a la función, nunca usar SCRIPT_DIR como variable
source "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../commons/log.sh"
source "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../commons/get.sh"

MODULE_NAME="nombre-del-script"
LOG_MODULE_NAME="$MODULE_NAME"

# Parseo de argumentos
PROFILE="dev"
while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--profile) PROFILE="$2"; shift 2 ;;
    *) log "ERROR" "Argumento desconocido: $1"; exit 1 ;;
  esac
done
```

### Soporte obligatorio para `-p, --profile`
- Todos los scripts deben aceptar `-p <perfil>` o `--profile <perfil>`
- Perfiles disponibles: `dev`, `staging`, `prod`
- Valor por defecto: `dev`

### Variables de entorno con fallback
```bash
source scripts/commons/get.sh

# Prioridad: variable local → archivo {profile}.env → valor inline
VAR=$(set_with_fallback "VAR_NAME" "valor_por_defecto")
```

### ⚠️  Archivos .env — comillas en valores con espacios

Los archivos `{profile}.env` se cargan con `source` de bash. **Los valores con espacios o caracteres especiales deben ir entre comillas dobles**:

```bash
# ✅ Correcto — bash preserva el valor completo
JAVA_OPTS="-Xmx256m -Xms128m"
MY_VAR="valor con espacios"

# ❌ Incorrecto — bash interpreta el espacio como separador de comando
JAVA_OPTS=-Xmx256m -Xms128m
# Equivale a: JAVA_OPTS=-Xmx256m; ejecutar: -Xms128m → comando no encontrado
```

Reglas:
- Valores sin espacios ni caracteres especiales: `KEY=simple_value` (sin comillas)
- Valores con espacios o caracteres especiales: `KEY="valor con espacios"` (con comillas dobles)
- Esto aplica tanto en `{profile}.env` como en `{profile}.env.example`

### Naming
- kebab-case: `local-start.sh`, `build-image.sh`
- Sin sufijos de entorno en el nombre — el perfil se pasa con `-p`

## Reglas

- Siempre `#!/bin/bash` y `set -euo pipefail`
- Siempre usar `log.sh` para salida — nunca `echo` directo para mensajes informativos
- Inicializar `MODULE_NAME` y `LOG_MODULE_NAME` antes de llamar `log()`
- Nunca hardcodear URLs, puertos ni credenciales — usar `set_with_fallback`
- Scripts deben ser idempotentes cuando sea posible
- Ejecutar `validate.sh` antes de entregar

### ⚠️  PROFILE — Early parse antes de inicializar variables

Cuando el script use `load_env_vars` y `set_with_fallback` (que dependen de `PROFILE`), **nunca** asignar `PROFILE` como default y cargar variables antes de parsear argumentos. En su lugar, hacer un early parse de `--profile`/`-p` antes de cualquier inicialización:

```bash
PROFILE="dev"

# Early parse: detectar --profile antes de inicializar variables
for arg in "$@"; do
  case "${arg}" in
    -p|--profile) capture_profile=true ;;
    *)  if [[ "${capture_profile:-}" == "true" ]]; then
          PROFILE="${arg}"
          break
        fi
        ;;
  esac
done

load_env_vars "${PROFILE}" "$(script_dir_...)"

VAR="$(set_with_fallback "VAR_NAME" "default")"
```

Esto evita inicializar variables con el perfil `dev` cuando el usuario pasó `--profile prod`.

### ⚠️  SCRIPT_DIR — Regla crítica

**Nunca** asignar `SCRIPT_DIR` como variable global. En su lugar:
1. Definir una función con sufijo único (`uuidv4{18}`) que retorne el directorio:
   ```bash
   script_dir_f3a6e7b2c1d4e5f6a7b8() { echo "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"; }
   ```
2. Usar la función directamente en cada referencia:
   ```bash
   source "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../commons/get.sh"
   envsubst < "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../../../infra/k8s/foo/bar.yaml"
   ```
3. El sufijo único evita colisiones con funciones definidas en scripts sourceados.
4. La función se invoca inline (con `$()`) y no se asigna a variable porque `set -u` de `set -euo pipefail` haría que scripts sourceados (ej. `check.sh`) pisaran accidentalmente la variable global `SCRIPT_DIR`, rompiendo todas las rutas aguas abajo.

### ⚠️  Módulos — Sufijo único por archivo

Cuando un módulo es sourceado por otro script y ambos definen su propia función de directorio, **cada archivo debe usar un sufijo único diferente** para evitar colisiones:

```bash
# modules/common.sh
_commons_dir_f3a6e7b2c1d4e5f6a7b8() { echo "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"; }

# modules/container.sh — usa sufijo DIFERENTE
_modules_dir_a1b2c3d4e5f6g7h8i9j0() { echo "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"; }
source "$(_modules_dir_a1b2c3d4e5f6g7h8i9j0)/common.sh"
```

Reglas:
- `common.sh` (sourceado por container.sh): usa `_commons_dir_<uuid>` — nombre distinto al de container.sh
- `container.sh` (sourceado por run.sh): usa `_modules_dir_<uuid>` — nombre distinto al de common.sh
- `run.sh` (entry point): usa `_runner_dir_<uuid>` — nombre distinto a todos

Si dos archivos usaran el mismo nombre de función, `BASH_SOURCE[0]` resolvería según dónde se definió la función, no según dónde se llama. Usar prefijos semánticos (`_commons_`, `_modules_`, `_runner_`, `_scripts_`) + uuid único por archivo elimina el riesgo.
