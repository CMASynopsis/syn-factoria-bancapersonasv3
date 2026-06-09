# validate.sh

Funciones de validación para variables, archivos y configuración de AWS.

## Location

```
scripts/commons/validate.sh
```

## Dependencias

| Dependencia | Ruta |
|-------------|------|
| `get.sh` | `scripts/commons/get.sh` |
| `log.sh` | `scripts/commons/log.sh` |

Debe cargarse en orden: `get.sh` → `validate.sh`.

## Funciones

### `validate_dir`

Retorna la ruta absoluta del directorio donde está el script que se está ejecutando.

**Firma:**
```bash
validate_dir
```

**Output:** Ruta absoluta del directorio (stdout)

### `validate_required`

Valida que una variable no esté vacía.

**Firma:**
```bash
validate_required <VAR_NAME> <VAR_VALUE> [ERROR_MSG]
```

| Argumento | Default | Descripción |
|-----------|---------|-------------|
| `$1` — var_name | — | Nombre descriptivo de la variable |
| `$2` — var_value | — | Valor a validar |
| `$3` — error_msg | `"El parámetro $var_name es requerido"` | Mensaje de error personalizado |

**Retorno:** Sale con `handle_error` si el valor está vacío.

### `validate_file`

Valida que un archivo exista en el sistema de archivos.

**Firma:**
```bash
validate_file <FILE_PATH> [ERROR_MSG]
```

| Argumento | Default | Descripción |
|-----------|---------|-------------|
| `$1` — file_path | — | Ruta del archivo a validar |
| `$2` — error_msg | `"No se encontró el archivo: $file_path"` | Mensaje de error personalizado |

**Retorno:** Sale con `handle_error` si el archivo no existe.

### `validate_and_load_env`

Carga las variables del archivo `.env` ubicado en el directorio del script padre.

**Firma:**
```bash
validate_and_load_env
```

**Comportamiento:**
- Usa `get_script_dir` (de `get.sh`) para localizar el directorio del script
- Busca el archivo `$parent_dir/.env`
- Sale con error si el archivo no existe

### `validate_aws_config`

Valida la configuración de AWS CLI: instalación, credenciales y región.

**Firma:**
```bash
validate_aws_config [PROFILE] [REGION]
```

| Argumento | Default | Descripción |
|-----------|---------|-------------|
| `$1` — profile | `$AWS_PROFILE` o `default` | Perfil de AWS a validar |
| `$2` — region | — | Región a validar (opcional) |

**Validaciones:**
1. AWS CLI está instalado (`command -v aws`)
2. Credenciales funcionan (`aws sts get-caller-identity`)
3. Formato de región es válido (`us-east-1`, `eu-west-1`, etc.)

### `validate_s3_bucket`

Valida el nombre de un bucket S3 según las reglas de nomenclatura de AWS.

**Firma:**
```bash
validate_s3_bucket <BUCKET_NAME> [PROFILE]
```

| Argumento | Default | Descripción |
|-----------|---------|-------------|
| `$1` — bucket_name | — | Nombre del bucket a validar (requerido) |
| `$2` — profile | `$AWS_PROFILE` o `default` | Perfil AWS |

**Validaciones:**
- Solo caracteres minúsculas, números, puntos y guiones
- Debe comenzar y terminar con letra o número
- Máximo 63 caracteres

### `validate_aws_common_params`

Valida perfil AWS, región y nombre de bucket S3 en un solo paso.

**Firma:**
```bash
validate_aws_common_params <BUCKET_NAME> <REGION> [PROFILE]
```

| Argumento | Default | Descripción |
|-----------|---------|-------------|
| `$1` — bucket_name | — | Nombre del bucket S3 |
| `$2` — region | — | Región AWS |
| `$3` — profile | `$AWS_PROFILE` o `default` | Perfil AWS |

### `validate_and_load_env_module`

Carga un archivo de entorno específico desde un subdirectorio `terraform/`.

**Firma:**
```bash
validate_and_load_env_module <DIR> <ENVIRONMENT>
```

| Argumento | Descripción |
|-----------|-------------|
| `$1` — dir | Directorio base |
| `$2` — environment | Nombre del perfil (ej: `dev`, `prod`) |

**Comportamiento:**
- Busca `<get_script_dir>/terraform/<dir>/<environment>.env`
- Sale con error si el archivo no existe
- Carga las variables con `source`

## Uso

```bash
source scripts/commons/validate.sh

# Validar variables
validate_required "API_KEY" "$API_KEY" "API_KEY es obligatoria"

# Validar archivo
validate_file "/path/to/config.yml"

# Validar AWS
validate_aws_config "mi-perfil" "us-east-1"
validate_s3_bucket "mi-bucket-prod"
validate_aws_common_params "mi-bucket" "us-east-1" "prod-profile"
```
