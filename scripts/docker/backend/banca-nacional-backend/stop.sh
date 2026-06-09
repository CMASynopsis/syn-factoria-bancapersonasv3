#!/bin/bash
set -euo pipefail

script_dir_f3a6e7b2c1d4e5f6a7b8() { echo "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"; }

source "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../../../commons/log.sh"
source "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../../../commons/get.sh"
source "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../../../commons/check.sh"
source "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../../../commons/validate.sh"

for arg in "$@"; do
  case "${arg}" in
    --help|-h)
      echo "Uso: $0 [--profile <dev|staging|prod>]"
      echo "  -p, --profile   Perfil de variables de entorno (default: dev)"
      echo "  -h, --help      Muestra esta ayuda"
      exit 0
      ;;
  esac
done

MODULE_NAME="docker-backend-stop"
LOG_MODULE_NAME="$MODULE_NAME"

PROFILE="dev"

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

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--profile) PROFILE="$2"; shift 2 ;;
    *) log "ERROR" "Argumento desconocido: $1"; exit 1 ;;
  esac
done

load_env_vars "${PROFILE}" "$(script_dir_f3a6e7b2c1d4e5f6a7b8)"

IMAGE_NAME=$(set_with_fallback "IMAGE_NAME" "banca-backend")

if ! command -v docker &>/dev/null; then
  handle_error "Docker no está instalado o no está en PATH"
fi

log "INFO" "=== Deteniendo contenedor: ${IMAGE_NAME} ==="

if docker ps -a --format '{{.Names}}' | grep -q "^${IMAGE_NAME}$"; then
  log "INFO" "Deteniendo contenedor '${IMAGE_NAME}'..."
  docker stop "${IMAGE_NAME}" &>/dev/null || log "WARN" "El contenedor ya estaba detenido"
  log "INFO" "Eliminando contenedor '${IMAGE_NAME}'..."
  docker rm "${IMAGE_NAME}" &>/dev/null || log "WARN" "El contenedor ya había sido eliminado"
  log "SUCCESS" "Contenedor '${IMAGE_NAME}' detenido y eliminado"
else
  log "WARN" "No se encontró el contenedor '${IMAGE_NAME}'"
fi
