#!/bin/bash
set -euo pipefail

_modules_dir_a1b2c3d4e5f6g7h8i9j0() { echo "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"; }

source "$(_modules_dir_a1b2c3d4e5f6g7h8i9j0)/common.sh"

container_exists() {
  docker ps -a --format '{{.Names}}' | grep -q "^${IMAGE_NAME}$"
}

container_running() {
  docker ps --format '{{.Names}}' | grep -q "^${IMAGE_NAME}$"
}

ensure_image() {
  if ! docker image inspect "${FULL_IMAGE}" &>/dev/null; then
    log "WARN" "La imagen ${FULL_IMAGE} no existe localmente. Intentando pull..."
    docker pull "${FULL_IMAGE}" || handle_error "No se pudo descargar la imagen ${FULL_IMAGE}"
  fi
}

container_stop() {
  if ! container_exists; then
    log "WARN" "El contenedor '${IMAGE_NAME}' no existe"
    return 0
  fi
  log "INFO" "Deteniendo contenedor '${IMAGE_NAME}'..."
  if container_running; then
    docker stop "${IMAGE_NAME}" &>/dev/null || true
  else
    log "WARN" "El contenedor ya estaba detenido"
  fi
  log "SUCCESS" "Contenedor '${IMAGE_NAME}' detenido"
}

container_remove() {
  container_stop
  if ! container_exists; then
    return 0
  fi
  log "INFO" "Eliminando contenedor '${IMAGE_NAME}'..."
  docker rm "${IMAGE_NAME}" &>/dev/null || log "WARN" "El contenedor ya había sido eliminado"
  log "SUCCESS" "Contenedor '${IMAGE_NAME}' eliminado"
}

container_run() {
  local rm_flag="${1:-}"

  ensure_image
  if container_exists; then
    log "WARN" "El contenedor '${IMAGE_NAME}' ya existe. Reemplazando..."
    container_remove
  fi

  log "INFO" "Iniciando contenedor '${IMAGE_NAME}' en puerto 8080..."
  docker run -d ${rm_flag} \
    --name "${IMAGE_NAME}" \
    -p 8080:8080 \
    -e "SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}" \
    -e "JAVA_OPTS=${JAVA_OPTS}" \
    "${FULL_IMAGE}"

  log "SUCCESS" "Contenedor '${IMAGE_NAME}' iniciado"
}

container_start() {
  if ! container_exists; then
    handle_error "El contenedor '${IMAGE_NAME}' no existe. Ejecute 'run' primero."
  fi
  if container_running; then
    log "WARN" "El contenedor '${IMAGE_NAME}' ya está en ejecución"
    return 0
  fi
  log "INFO" "Iniciando contenedor existente '${IMAGE_NAME}'..."
  docker start "${IMAGE_NAME}" &>/dev/null
  log "SUCCESS" "Contenedor '${IMAGE_NAME}' iniciado"
}

container_build() {
  local no_cache="${1:-}"

  BACKEND_DIR="$(cd "$(_modules_dir_a1b2c3d4e5f6g7h8i9j0)/../../../../../apps/backend/banca-nacional-backend" && pwd)"
  DOCKERFILE_DIR="$(cd "$(_modules_dir_a1b2c3d4e5f6g7h8i9j0)/../../../../../infra/docker/backend/banca-nacional-backend" && pwd)"
  PROJECT_DIR="$(cd "$(_modules_dir_a1b2c3d4e5f6g7h8i9j0)/../../../.." && pwd)"
  DOCKERFILE_PATH=$(set_with_fallback "DOCKERFILE_PATH" "${DOCKERFILE_DIR}/Dockerfile")
  BUILD_CONTEXT=$(set_with_fallback "BUILD_CONTEXT" "${BACKEND_DIR}")

  if ! command -v mvn &>/dev/null; then
    handle_error "Maven no está instalado o no está en PATH"
  fi
  if ! command -v java &>/dev/null; then
    handle_error "Java no está instalado o no está en PATH"
  fi

  log "INFO" "=== Construyendo imagen Docker: ${FULL_IMAGE} ==="
  log "INFO" "Perfil: ${SPRING_PROFILES_ACTIVE} | Backend: ${BACKEND_DIR}"

  if [[ ! -d "$BACKEND_DIR" ]]; then
    handle_error "Directorio de backend no encontrado: ${BACKEND_DIR}"
  fi
  validate_file "${DOCKERFILE_PATH}" "Dockerfile no encontrado: ${DOCKERFILE_PATH}"
  validate_file "${BACKEND_DIR}/pom.xml" "pom.xml no encontrado en ${BACKEND_DIR}"

  log "INFO" "Ejecutando mvn clean package -DskipTests en ${BACKEND_DIR}"
  cd "$BACKEND_DIR"
  mvn clean package -DskipTests -B

  log "INFO" "Construyendo imagen Docker..."
  cd "$PROJECT_DIR"
  docker build ${no_cache} \
    -f "${DOCKERFILE_PATH}" \
    -t "${FULL_IMAGE}" \
    "${BUILD_CONTEXT}"

  log "SUCCESS" "Imagen construida exitosamente: ${FULL_IMAGE}"
}

container_logs() {
  if ! container_exists; then
    handle_error "El contenedor '${IMAGE_NAME}' no existe"
  fi
  docker logs "${IMAGE_NAME}"
}

container_tail() {
  if ! container_exists; then
    handle_error "El contenedor '${IMAGE_NAME}' no existe"
  fi
  docker logs -f "${IMAGE_NAME}"
}
