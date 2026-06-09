#!/bin/bash
set -euo pipefail

load_profile() {
  if [[ -n "${PROFILE_FILE}" ]]; then
    if [[ -f "${PROFILE_FILE}" ]]; then
      log "INFO" "Cargando configuración desde: ${PROFILE_FILE}"
      set -a
      source "${PROFILE_FILE}"
      set +a
    else
      handle_error "Archivo de perfil no encontrado: ${PROFILE_FILE}"
    fi
  else
    load_env_vars "${PROFILE}" "$(_terraform_dir_f3a6e7b2c1d4e5f6a7b8)/.."
  fi
}

resolve_profile() {
  TF_PROFILE="${TF_PROFILE:-${PROFILE}}"
  log "INFO" "Perfil activo: ${TF_PROFILE}"
}

export_azure_auth() {
  export ARM_SUBSCRIPTION_ID="${ARM_SUBSCRIPTION_ID:-}"
  export ARM_TENANT_ID="${ARM_TENANT_ID:-}"
  export ARM_CLIENT_ID="${ARM_CLIENT_ID:-}"
  export ARM_CLIENT_SECRET="${ARM_CLIENT_SECRET:-}"
}
