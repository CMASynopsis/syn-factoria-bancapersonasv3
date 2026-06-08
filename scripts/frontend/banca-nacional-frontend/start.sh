#!/bin/bash
set -euo pipefail

# ⚠️  Función con sufijo único — evitar colisiones con scripts sourceados
script_dir_f3a6e7b2c1d4e5f6a7b8() { echo "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"; }

source "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../../commons/log.sh"
source "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../../commons/get.sh"

MODULE_NAME="frontend-start"
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

FRONTEND_DIR="$(cd "$(script_dir_f3a6e7b2c1d4e5f6a7b8)/../../../apps/frontend/banca-nacional-frontend" && pwd)"

log "INFO" "=== Iniciando Frontend (Angular - BancaPersonasV3) ==="
log "INFO" "Perfil: ${PROFILE} | Directorio: ${FRONTEND_DIR}"

if [[ ! -d "$FRONTEND_DIR" ]]; then
  handle_error "Directorio de frontend no encontrado: ${FRONTEND_DIR}"
fi

cd "$FRONTEND_DIR"

if [[ ! -f "package.json" ]]; then
  handle_error "No se encontró package.json en ${FRONTEND_DIR}"
fi

npx ng serve --open
