# wait.sh

Funciones de espera para deployments en Kubernetes con logging integrado.

## Location

```
scripts/commons/wait.sh
```

## Dependencias

| Dependencia | Ruta |
|-------------|------|
| `log.sh` | `scripts/commons/log.sh` |

Debe cargarse después de `log.sh`.

## Funciones

### `wait_for_running_pod`

Espera a que un pod de Kubernetes alcance el estado `Running`, con timeout de 300 segundos.

**Firma:**
```bash
wait_for_running_pod
```

**Variables de entorno requeridas:**

| Variable | Descripción |
|----------|-------------|
| `NAME` | Nombre o patrón del pod a buscar |
| `NAMESPACE` | Namespace de Kubernetes donde buscar |

**Comportamiento:**
- Busca el pod usando `kubectl get pod -n $NAMESPACE | grep $NAME.*Running`
- Cada 10 segundos verifica si el pod aparece
- Timeout tras 300 segundos (5 minutos)

**Retorno:**

| Código | Significado |
|--------|-------------|
| 0 | Pod encontrado en estado Running |
| 1 | Timeout — el pod no alcanzó Running a tiempo |

### `wait_for_status_change`

Espera a que un estado cambie de valor actual a valor objetivo, con timeout configurable.

**Firma:**
```bash
wait_for_status_change
```

**Variables de entorno:**

| Variable | Default | Descripción |
|----------|---------|-------------|
| `TIMEOUT` | `300` | Timeout total en segundos |
| `MAX_ATTEMPTS` | `30` | Número máximo de intentos |
| `SLEEP_TIME` | `10` | Segundos entre cada intento |
| `CURRENT_STATUS` | `NONE` | Estado actual a evaluar |
| `TARGET_STATUS` | `OK` | Estado objetivo esperado |

**Comportamiento:**
- Evalúa si `$CURRENT_STATUS != $TARGET_STATUS` y `$CURRENT_STATUS != "NONE"`
- Si se cumple, retorna éxito asumiendo que el cambio ocurrió
- Timeout tras `$TIMEOUT` segundos

**Retorno:**

| Código | Significado |
|--------|-------------|
| 0 | Estado cambió al valor objetivo |
| 1 | Timeout sin cambio de estado |

### `wait_seconds`

Espera una cantidad fija de segundos con un mensaje opcional.

**Firma:**
```bash
wait_seconds <SECONDS> [MESSAGE]
```

| Argumento | Default | Descripción |
|-----------|---------|-------------|
| `$1` — seconds | — | Segundos a esperar (requerido) |
| `$2` — message | `"Esperando ${seconds} segundos..."` | Mensaje a mostrar |

## Uso

```bash
source scripts/commons/log.sh
source scripts/commons/wait.sh
MODULE_NAME="deploy"

# Espera simple
wait_seconds 5 "Preparando entorno..."

# Esperar pod en Kubernetes
NAME="mi-api"
NAMESPACE="default"
wait_for_running_pod

# Esperar cambio de estado
export CURRENT_STATUS="PENDING"
export TARGET_STATUS="COMPLETED"
export TIMEOUT=120
wait_for_status_change
```
