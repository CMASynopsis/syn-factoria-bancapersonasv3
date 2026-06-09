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
      echo "Uso: $0 [--profile <dev|staging|prod>] [--no-cache]"
      echo "  -p, --profile   Perfil de variables de entorno (default: dev)"
      echo "  --no-cache      Construir sin cache de Docker"
      echo "  -h, --help      Muestra esta ayuda"
      exit 0
      ;;
  esac
done

MODULE_NAME="docker-backend-build"
LOG_MODULE_NAME="$MODULE_NAME"

PROFILE="dev"
NO_CACHE=""

for arg in "$@"; do
  case "${arg}" in
    -p|--profile) capture_profile=true ;;
    --no-cache) NO_CACHE="--no-cache" ;;
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
    *) log "ERROR" "Argumento desconocido: $1"; exit 1 ;;
  esac
done

load_env_vars "${PROFILE}" "$(script_dir_f3a6e7b2c1d4e5f6a7b8)"

BACKEND_DIR="$(cd "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../../../../apps/backend/banca-nacional-backend" && pwd)"
DOCKERFILE_DIR="$(cd "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../../../../infra/docker/backend/banca-nacional-backend" && pwd)"
PROJECT_DIR="$(cd "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../../.." && pwd)"

ACR_NAME=$(set_with_fallback "ACR_NAME" "bancaacr")
IMAGE_NAME=$(set_with_fallback "IMAGE_NAME" "banca-backend")
IMAGE_TAG=$(set_with_fallback "IMAGE_TAG" "latest")
DOCKERFILE_PATH=$(set_with_fallback "DOCKERFILE_PATH" "${DOCKERFILE_DIR}/Dockerfile")
BUILD_CONTEXT=$(set_with_fallback "BUILD_CONTEXT" "${BACKEND_DIR}")

if ! command -v docker &>/dev/null; then
  handle_error "Docker no está instalado o no está en PATH"
fi

if ! command -v mvn &>/dev/null; then
  handle_error "Maven no está instalado o no está en PATH"
fi

if ! command -v java &>/dev/null; then
  handle_error "Java no está instalado o no está en PATH"
fi

log "INFO" "=== Construyendo imagen Docker: ${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${IMAGE_TAG} ==="
log "INFO" "Perfil: ${PROFILE} | Backend: ${BACKEND_DIR}"

if [[ ! -d "$BACKEND_DIR" ]]; then
  handle_error "Directorio de backend no encontrado: ${BACKEND_DIR}"
fi

validate_file "${DOCKERFILE_PATH}" "Dockerfile no encontrado: ${DOCKERFILE_PATH}"
validate_file "${BACKEND_DIR}/pom.xml" "pom.xml no encontrado en ${BACKEND_DIR}"

log "INFO" "Ejecutando mvn clean package -DskipTests en ${BACKEND_DIR}"
cd "$BACKEND_DIR"
mvn clean package -DskipTests -B

log "INFO" "Construyendo imagen Docker: ${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${IMAGE_TAG}"
cd "$PROJECT_DIR"

docker build ${NO_CACHE} \
  -f "${DOCKERFILE_PATH}" \
  -t "${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${IMAGE_TAG}" \
  "${BUILD_CONTEXT}"

log "SUCCESS" "Imagen construida exitosamente: ${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${IMAGE_TAG}"
