# get.sh

Funciones de obtención de rutas y carga de variables de entorno con fallback.

Es el módulo foundational de `scripts/commons/` — no tiene dependencias y es
utilizado por todos los demás scripts del proyecto.

## Location

```
scripts/commons/get.sh
```

## Dependencias

Ninguna. Es auto-contenido.

## Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `ENVIRONMENT` | `dev` | Perfil de entorno activo |

## Funciones

### `get_commons_dir`

Retorna la ruta absoluta al directorio `scripts/commons/`.

**Firma:**
```bash
get_commons_dir
```

**Output:** Ruta absoluta (stdout)

### `get_script_dir`

Retorna la ruta absoluta al directorio `scripts/`.

**Firma:**
```bash
get_script_dir
```

**Output:** Ruta absoluta (stdout)

**Implementación:** `dirname "$(get_commons_dir)"`

### `get_project_dir`

Retorna la ruta absoluta a la raíz del proyecto (un nivel arriba de `scripts/`).

**Firma:**
```bash
get_project_dir
```

**Output:** Ruta absoluta (stdout)

**Implementación:** `dirname "$(get_script_dir)"`

### `get_workspace_dir`

Retorna la ruta al directorio de trabajo para el entorno activo.

**Firma:**
```bash
get_workspace_dir
```

**Output:** `<project_root>/workspace/<ENVIRONMENT>`

### `load_env_vars`

Carga variables de entorno desde un archivo `<profile>.env`.

**Firma:**
```bash
load_env_vars [PROFILE] [SCRIPT_DIR]
```

| Argumento | Default | Descripción |
|-----------|---------|-------------|
| `$1` — profile | `master` | Nombre del perfil a cargar |
| `$2` — script_dir | `$(get_script_dir)` | Directorio donde buscar `<profile>.env` |

**Comportamiento:**
1. Construye ruta: `<script_dir>/<profile>.env`
2. Si el archivo existe, lo carga con `set -a` (exporta todas las variables)
3. NOTA: No procesa `profile.env.example` — ese archivo es solo referencia

**Prioridad de variables (usando `set_with_fallback`):**

| Orden | Fuente | Ejemplo |
|-------|--------|---------|
| 1 | Variable con prefijo `ENV_` | `ENV_MI_VAR` |
| 2 | Variable sin prefijo | `MI_VAR` |
| 3 | Valor inline default | pasado como argumento |

### `set_with_fallback`

Asigna una variable aplicando la cadena de prioridad completa.

**Firma:**
```bash
set_with_fallback <VAR_NAME> [INLINE_DEFAULT]
```

| Argumento | Default | Descripción |
|-----------|---------|-------------|
| `$1` — var_name | — | Nombre de la variable (ej: `API_KEY`) |
| `$2` — inline_default | — | Valor por defecto inline |

**Retorno:** El valor de mayor prioridad encontrado (stdout)

## Uso

```bash
source scripts/commons/get.sh

# Obtener rutas
commons=$(get_commons_dir)
scripts=$(get_script_dir)
project=$(get_project_dir)
workspace=$(get_workspace_dir)

# Cargar variables de entorno
load_env_vars "dev" "$(get_script_dir)"

# Variable con fallback
API_KEY=$(set_with_fallback "API_KEY" "default-key-123")
```
