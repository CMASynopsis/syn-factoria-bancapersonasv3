#!/bin/bash
set -euo pipefail

_commons_dir_f3a6e7b2c1d4e5f6a7b8() { echo "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"; }

source "$(_commons_dir_f3a6e7b2c1d4e5f6a7b8)/../../../../commons/log.sh"
source "$(_commons_dir_f3a6e7b2c1d4e5f6a7b8)/../../../../commons/get.sh"
source "$(_commons_dir_f3a6e7b2c1d4e5f6a7b8)/../../../../commons/check.sh"
source "$(_commons_dir_f3a6e7b2c1d4e5f6a7b8)/../../../../commons/validate.sh"

load_docker_env() {
  local profile="${1:-dev}"
  load_env_vars "${profile}" "$(_commons_dir_f3a6e7b2c1d4e5f6a7b8)/.."

  ACR_NAME=$(set_with_fallback "ACR_NAME" "bancaacr")
  IMAGE_NAME=$(set_with_fallback "IMAGE_NAME" "banca-backend")
  IMAGE_TAG=$(set_with_fallback "IMAGE_TAG" "latest")
  JAVA_OPTS=$(set_with_fallback "JAVA_OPTS" "-Xmx256m -Xms128m")
  SPRING_PROFILES_ACTIVE=$(set_with_fallback "SPRING_PROFILES_ACTIVE" "${profile}")

  REGISTRY_SERVER=$(set_with_fallback "REGISTRY_SERVER" "${ACR_NAME}.azurecr.io")
  REGISTRY_USERNAME=$(set_with_fallback "REGISTRY_USERNAME" "")
  REGISTRY_PASSWORD=$(set_with_fallback "REGISTRY_PASSWORD" "")

  FULL_IMAGE="${REGISTRY_SERVER}/${IMAGE_NAME}:${IMAGE_TAG}"
}

check_docker() {
  if ! command -v docker &>/dev/null; then
    handle_error "Docker no está instalado o no está en PATH"
  fi
  MODULE_NAME="${MODULE_NAME:-docker-backend}"
  LOG_MODULE_NAME="$MODULE_NAME"
}
