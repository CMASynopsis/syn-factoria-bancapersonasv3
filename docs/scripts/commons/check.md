# check.sh

Funciones de verificación de estado para deployments en AWS.

## Location

```
scripts/commons/check.sh
```

## Dependencias

| Dependencia | Ruta |
|-------------|------|
| `log.sh` | `scripts/commons/log.sh` |

## Funciones

### `check_aws_cli`

Verifica que AWS CLI esté instalado y disponible en el PATH.

**Firma:**
```bash
check_aws_cli
```

**Comportamiento:**
- Ejecuta `command -v aws`
- Si no encuentra el binario, llama a `handle_error` con instrucciones de instalación
- En caso exitoso, logea la versión con `log "DEBUG"`

**Retorno:**

| Código | Significado |
|--------|-------------|
| 0 | AWS CLI instalado y en PATH |
| 1 | Sale con `handle_error` si no está disponible |

### `check_aws_credentials`

Verifica que las credenciales AWS estén configuradas y sean válidas.

**Firma:**
```bash
check_aws_credentials [PROFILE]
```

| Argumento | Default | Descripción |
|-----------|---------|-------------|
| `$1` — profile | `default` | Perfil de AWS a verificar |

**Comportamiento:**
1. Verifica que el perfil exista con `aws configure list --profile`
2. Verifica que las credenciales funcionen con `aws sts get-caller-identity`
3. Si falla, muestra el mensaje de error devuelto por AWS CLI

### `check_aws_region`

Valida el formato de una región AWS.

**Firma:**
```bash
check_aws_region <REGION>
```

| Argumento | Descripción |
|-----------|-------------|
| `$1` — region | Región a validar (ej: `us-east-1`) |

**Validación:**
- No puede estar vacía
- Debe coincidir con el patrón: `^[a-z]{2}-[a-z]+-[0-9]+$`
- Ejemplos válidos: `us-east-1`, `eu-west-1`, `ap-southeast-2`

### `check_bucket_exists`

Verifica si un bucket S3 existe y se tiene acceso a él.

**Firma:**
```bash
check_bucket_exists <BUCKET_NAME> [PROFILE]
```

| Argumento | Default | Descripción |
|-----------|---------|-------------|
| `$1` — bucket_name | — | Nombre del bucket S3 |
| `$2` — profile | `default` | Perfil de AWS |

**Retorno:**

| Código | Significado |
|--------|-------------|
| 0 | Bucket existe y hay acceso |
| 1 | Bucket no existe o no hay acceso |

### `check_certificate_exists`

Verifica si existe un certificado ACM emitido para un dominio.

**Firma:**
```bash
check_certificate_exists <DOMAIN_NAME> [PROFILE]
```

| Argumento | Default | Descripción |
|-----------|---------|-------------|
| `$1` — domain_name | — | Nombre de dominio a buscar |
| `$2` — profile | `default` | Perfil de AWS |

**Comportamiento:**
1. Busca certificados en ACM (`us-east-1`) que coincidan con el dominio
2. Verifica que el estado del certificado sea `ISSUED`
3. Los certificados en estado `PENDING_VALIDATION` o `FAILED` se consideran no válidos

**Retorno:**

| Código | Significado |
|--------|-------------|
| 0 | Certificado encontrado y emitido |
| 1 | No se encontró certificado o no está emitido |

## Uso

```bash
source scripts/commons/check.sh
MODULE_NAME="deploy-aws"

# Verificar AWS CLI y credenciales
check_aws_cli
check_aws_credentials "prod-profile"
check_aws_region "us-east-1"

# Verificar recursos
if check_bucket_exists "mi-bucket-prod" "prod-profile"; then
  log "INFO" "Bucket existe"
fi

if check_certificate_exists "api.midominio.com" "prod-profile"; then
  log "INFO" "Certificado válido encontrado"
fi
```
