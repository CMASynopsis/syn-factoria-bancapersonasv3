#!/bin/bash
set -euo pipefail

_runner_dir_f3a6e7b2c1d4e5f6a7b8() { echo "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"; }

ACTION="${1:-}"
[[ "$ACTION" =~ ^(--help|-h)$ ]] && {
  echo "Uso: $0 <action> [options]"
  echo ""
  echo "Acciones:"
  echo "  build         Compilar y construir imagen Docker (mvn package + docker build)"
  echo "  run           Crear e iniciar contenedor (pull + remove + run + tail)"
  echo "  start         Iniciar contenedor existente"
  echo "  stop          Detener contenedor"
  echo "  restart       Detener e iniciar contenedor"
  echo "  delete|remove Detener y eliminar contenedor"
  echo "  logs          Mostrar logs"
  echo "  tail          Seguir logs en tiempo real"
  echo ""
  echo "Opciones:"
  echo "  -p, --profile <dev|staging|prod>  Perfil de variables de entorno (default: dev)"
  echo "  --no-cache                         Construir sin cache de Docker (solo build)"
  echo "  --rm                               Eliminar contenedor al detenerlo (solo run)"
  echo "  -h, --help                         Muestra esta ayuda"
  exit 0
}

[ -z "$ACTION" ] && {
  echo "Error: Se requiere una accion. Use --help para ver las opciones." >&2
  exit 1
}

shift
source "$(_runner_dir_f3a6e7b2c1d4e5f6a7b8)/modules/common.sh"
source "$(_runner_dir_f3a6e7b2c1d4e5f6a7b8)/modules/container.sh"

PROFILE="dev"
RM_FLAG=""
NO_CACHE=""

for arg in "$@"; do
  case "${arg}" in
    -p|--profile) capture_profile=true ;;
    --no-cache) NO_CACHE="--no-cache" ;;
    --rm) RM_FLAG="--rm" ;;
    *)  if [[ "${capture_profile:-}" == "true" ]]; then
          PROFILE="${arg}"
          break
        fi
        ;;
  esac
done

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--profile) PROFILE="$2"; shift 2 ;;
    --no-cache) NO_CACHE="--no-cache"; shift ;;
    --rm) RM_FLAG="--rm"; shift ;;
    *) log "ERROR" "Argumento desconocido: $1"; exit 1 ;;
  esac
done

MODULE_NAME="docker-backend-${ACTION}"
LOG_MODULE_NAME="$MODULE_NAME"
check_docker
load_docker_env "${PROFILE}"

case "${ACTION}" in
  build)
    container_build "${NO_CACHE}"
    ;;
  run)
    container_run "${RM_FLAG}"
    log "INFO" "Mostrando logs en tiempo real (Ctrl+C para salir)..."
    container_tail
    ;;
  start)
    container_start
    ;;
  stop)
    container_stop
    ;;
  restart)
    container_stop
    container_start
    ;;
  delete|remove)
    container_remove
    ;;
  logs)
    container_logs
    ;;
  tail)
    container_tail
    ;;
  *)
    log "ERROR" "Accion desconocida: ${ACTION}. Use --help para ver las opciones."
    exit 1
    ;;
esac
