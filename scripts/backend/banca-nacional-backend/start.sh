#!/bin/bash
set -euo pipefail

# ⚠️  Función con sufijo único — evitar colisiones con scripts sourceados
script_dir_f3a6e7b2c1d4e5f6a7b8() { echo "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"; }

source "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../../commons/log.sh"
source "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../../commons/get.sh"

MODULE_NAME="backend-start"
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

load_env_vars "${PROFILE}" "$(script_dir_f3a6e7b2c1d4e5f6a7b8)"

BACKEND_DIR="$(cd "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../../../apps/backend/banca-nacional-backend" && pwd)"

log "INFO" "=== Iniciando Backend (Spring Boot - BancaPersonasV3) ==="
log "INFO" "Perfil: ${PROFILE} | Directorio: ${BACKEND_DIR}"

if [[ ! -d "$BACKEND_DIR" ]]; then
  handle_error "Directorio de backend no encontrado: ${BACKEND_DIR}"
fi

cd "$BACKEND_DIR"

if [[ ! -f "pom.xml" ]]; then
  handle_error "No se encontró pom.xml en ${BACKEND_DIR}"
fi

mvn spring-boot:run
