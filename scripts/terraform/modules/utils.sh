#!/bin/bash
set -euo pipefail

build_target_args() {
  local target_val="$1"
  local args=""
  if [[ -n "${target_val}" ]]; then
    IFS=',' read -ra TARGETS <<< "${target_val}"
    for t in "${TARGETS[@]}"; do
      args="${args} -target=${t}"
    done
  fi
  echo "${args}"
}

cd_terraform() {
  cd "${TERRAFORM_DIR}" || handle_error "No se pudo acceder a ${TERRAFORM_DIR}"
  log "DEBUG" "Directorio de trabajo: $(pwd)"
}

check_profile_files() {
  local tfvars_file="${PROFILES_DIR}/${TF_PROFILE}.tfvars"
  local backend_file="${BACKEND_CONFIGS_DIR}/${TF_PROFILE}.hcl"

  if [[ -f "${tfvars_file}" ]]; then
    log "DEBUG" "Archivo de variables encontrado: ${tfvars_file}"
  else
    log "WARN" "Archivo de variables no encontrado (se omitirá): ${tfvars_file}"
  fi

  if [[ -f "${backend_file}" ]]; then
    log "DEBUG" "Archivo de backend encontrado: ${backend_file}"
  else
    log "WARN" "Archivo de backend no encontrado (se usará backend por defecto): ${backend_file}"
  fi
}

ensure_workspace() {
  local ws_name="${TF_PROFILE}"
  local ws_list
  ws_list=$(terraform workspace list 2>/dev/null || true)

  if echo "${ws_list}" | grep -qw "${ws_name}"; then
    log "INFO" "Seleccionando workspace existente: ${ws_name}"
    terraform workspace select "${ws_name}"
  else
    log "INFO" "Creando y seleccionando workspace: ${ws_name}"
    terraform workspace new "${ws_name}"
  fi
}

confirm_action() {
  local action_desc="$1"
  if [[ -n "${AUTO_APPROVE}" ]]; then
    return 0
  fi
  echo ""
  log "WARN" "═══════════════════════════════════════════════════════════════"
  log "WARN" "  Acción: ${action_desc}"
  log "WARN" "  Perfil : ${TF_PROFILE}  |  Directorio: ${TERRAFORM_DIR}"
  log "WARN" "═══════════════════════════════════════════════════════════════"
  echo ""
  read -r -p "¿Desea continuar? (sí/no): " respuesta
  if [[ ! "${respuesta}" =~ ^(s|si|sí|y|yes)$ ]]; then
    log "INFO" "Operación cancelada por el usuario."
    exit 0
  fi
}

check_prerequisites() {
  if ! command -v terraform &>/dev/null; then
    handle_error "Terraform no está instalado o no está en PATH. Instálelo desde: https://developer.hashicorp.com/terraform/downloads"
  fi
  if [[ ! -d "${TERRAFORM_DIR}" ]]; then
    handle_error "Directorio de Terraform no encontrado: ${TERRAFORM_DIR}. Ejecute este script desde la raíz del proyecto."
  fi
  log "INFO" "Terraform version: $(terraform version -json 2>/dev/null | python3 -c 'import sys,json; print(json.load(sys.stdin)["terraform_version"])' 2>/dev/null || terraform version 2>&1 | head -1)"
}
