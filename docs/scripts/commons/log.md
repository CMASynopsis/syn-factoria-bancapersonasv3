# log.sh

Funciones de logging con colores para la terminal y soporte de persistencia en archivo.

## Location

```
scripts/commons/log.sh
```

## Funciones

### `log`

Imprime un mensaje con formato, color y nivel de severidad.

**Firma:**
```bash
log <LEVEL> <MESSAGE>
```

**Niveles:**

| Nivel | Color | Descripción |
|-------|-------|-------------|
| `INFO` | Azul | Información general |
| `SUCCESS` | Verde | Operación exitosa |
| `WARN` | Amarillo | Advertencia |
| `ERROR` | Rojo | Error crítico |
| `DEBUG` | Cyan | Depuración (omitido si `DEBUG_ENABLED != true`) |
| `UNKNOWN` | Sin color | Nivel no reconocido |

**Comportamiento:**
- Los mensajes siempre se escriben a **stderr** (fd 2)
- Incluye timestamp ISO 8601, nombre del módulo, nivel y mensaje
- Si `LOG_TO_FILE=true`, también persiste en `scripts/.logs/<module>_<timestamp>_<exec_id>.log`

### `handle_error`

Logea un mensaje de error y termina el script.

**Firma:**
```bash
handle_error <MESSAGE> [EXIT_CODE]
```

| Argumento | Default | Descripción |
|-----------|---------|-------------|
| `$1` — message | — | Mensaje de error |
| `$2` — exit_code | `1` | Código de salida |

### `handle_aws_config_error`

Muestra un error específico de configuración AWS con ayuda contextual.

**Firma:**
```bash
handle_aws_config_error <ISSUE>
```

| Argumento | Descripción |
|-----------|-------------|
| `$1` — issue | `no_credentials`, `no_cli`, `invalid_region`, `permissions` |

### `log_progress`

Muestra un spinner de progreso durante una operación.

**Firma:**
```bash
log_progress <MESSAGE> [DURATION]
```

| Argumento | Default | Descripción |
|-----------|---------|-------------|
| `$1` — message | — | Mensaje a mostrar |
| `$2` — duration | `3` | Duración en segundos |

### `generate_random_id`

Genera un código aleatorio de 12 caracteres alfanuméricos (A-Z, 0-9).

**Firma:**
```bash
generate_random_id
```

**Output:** String de 12 caracteres (stdout)

## Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `DEBUG_ENABLED` | `false` | Si es `true`, habilita mensajes `DEBUG` |
| `LOG_TO_FILE` | `false` | Si es `true`, persiste logs en archivo |
| `MODULE_NAME` | — | Nombre del módulo para los mensajes |
| `LOG_MODULE_NAME` | `$MODULE_NAME` | Para sobrescribir el nombre en archivo de log |
| `LOG_EXEC_ID` | auto-generado | ID único de 12 caracteres por ejecución |
| `LOG_TIMESTAMP` | auto-generado | Timestamp `YYYYMMDD_HHMMSS` |

## Uso

```bash
source scripts/commons/log.sh
MODULE_NAME="mi-script"

log "INFO" "Iniciando proceso..."
log "SUCCESS" "Proceso completado"
log "ERROR" "Algo salió mal"

handle_error "Fallo crítico" 2

# Con debug habilitado
export DEBUG_ENABLED=true
log "DEBUG" "Valor de variable: $VAR"
```

## Dependencias

Ninguna. Es auto-contenido.

## Archivos de Log

Cuando `LOG_TO_FILE=true`, los archivos se guardan en:

```
scripts/.logs/<LOG_MODULE_NAME>_<LOG_TIMESTAMP>_<LOG_EXEC_ID>.log
```

Cada línea contiene (sin colores ANSI):
```
<timestamp> - <module> - <level> - <message>
```
