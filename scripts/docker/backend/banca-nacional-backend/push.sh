#!/bin/bash
set -euo pipefail

script_dir_f3a6e7b2c1d4e5f6a7b8() { echo "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"; }

# Source common module (carga log.sh, get.sh, check.sh, validate.sh transitivamente)
source "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/modules/common.sh"

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

MODULE_NAME="docker-backend-push"
LOG_MODULE_NAME="$MODULE_NAME"

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

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--profile) PROFILE="$2"; shift 2 ;;
    *) log "ERROR" "Argumento desconocido: $1"; exit 1 ;;
  esac
done

load_docker_env "${PROFILE}"
check_docker

log "INFO" "=== Subiendo imagen a registro: ${FULL_IMAGE} ==="

# Autenticación: priorizar docker login con credenciales, fallback a az acr login
if [[ -n "${REGISTRY_USERNAME}" && -n "${REGISTRY_PASSWORD}" ]]; then
  log "INFO" "Iniciando sesión en registro: ${REGISTRY_SERVER}"
  echo "${REGISTRY_PASSWORD}" | docker login "${REGISTRY_SERVER}" -u "${REGISTRY_USERNAME}" --password-stdin
elif command -v az &>/dev/null; then
  if ! az account show &>/dev/null; then
    handle_error "No hay sesión activa de Azure CLI. Configure REGISTRY_USERNAME/REGISTRY_PASSWORD o ejecute 'az login' primero."
  fi
  log "INFO" "Iniciando sesión en ACR: ${ACR_NAME}"
  az acr login --name "${ACR_NAME}"
else
  handle_error "No hay método de autenticación disponible. Configure REGISTRY_USERNAME/REGISTRY_PASSWORD o instale Azure CLI."
fi

if ! docker image inspect "${FULL_IMAGE}" &>/dev/null; then
  handle_error "La imagen ${FULL_IMAGE} no existe localmente. Ejecute build.sh primero."
fi

log "INFO" "Subiendo imagen: ${FULL_IMAGE}"
docker push "${FULL_IMAGE}"

if [[ "${IMAGE_TAG}" != "latest" ]]; then
  log "INFO" "Etiquetando y subiendo también como latest..."
  docker tag "${FULL_IMAGE}" "${REGISTRY_SERVER}/${IMAGE_NAME}:latest"
  docker push "${REGISTRY_SERVER}/${IMAGE_NAME}:latest"
fi

log "SUCCESS" "Imagen subida exitosamente: ${FULL_IMAGE}"
