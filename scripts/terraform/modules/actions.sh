#!/bin/bash
set -euo pipefail

action_init() {
  log "INFO" "Inicializando Terraform (perfil: ${TF_PROFILE})..."
  local backend_file="${BACKEND_CONFIGS_DIR}/${TF_PROFILE}.hcl"
  if [[ -f "${backend_file}" ]]; then
    log "INFO" "Usando backend config: ${backend_file}"
    terraform init -reconfigure -backend-config="${backend_file}"
  else
    log "WARN" "No se encontró backend-config para el perfil '${TF_PROFILE}'."
    log "WARN" "Inicializando con backend por defecto (local)."
    terraform init -reconfigure
  fi
  log "SUCCESS" "Terraform inicializado correctamente (perfil: ${TF_PROFILE})"
}

action_plan() {
  log "INFO" "Generando plan de Terraform (perfil: ${TF_PROFILE})..."
  check_profile_files
  local tfvars_file="${PROFILES_DIR}/${TF_PROFILE}.tfvars"
  local target_args
  target_args=$(build_target_args "${TARGET}")
  ensure_workspace
  if [[ -f "${tfvars_file}" ]]; then
    # shellcheck disable=SC2086
    terraform plan ${target_args} -var-file="${tfvars_file}" -detailed-exitcode
  else
    # shellcheck disable=SC2086
    terraform plan ${target_args} -detailed-exitcode
  fi
  local plan_exit=$?
  if [[ ${plan_exit} -eq 0 ]]; then
    log "SUCCESS" "Plan completado — Sin cambios"
  elif [[ ${plan_exit} -eq 2 ]]; then
    log "SUCCESS" "Plan completado — Cambios detectados"
  else
    handle_error "El plan falló con código de salida: ${plan_exit}" "${plan_exit}"
  fi
}

action_apply() {
  log "INFO" "Aplicando cambios en Terraform (perfil: ${TF_PROFILE})..."
  check_profile_files
  confirm_action "APPLY"
  local tfvars_file="${PROFILES_DIR}/${TF_PROFILE}.tfvars"
  local target_args
  target_args=$(build_target_args "${TARGET}")
  ensure_workspace
  if [[ -f "${tfvars_file}" ]]; then
    # shellcheck disable=SC2086
    terraform apply ${AUTO_APPROVE} ${target_args} -var-file="${tfvars_file}"
  else
    # shellcheck disable=SC2086
    terraform apply ${AUTO_APPROVE} ${target_args}
  fi
  log "SUCCESS" "Apply completado exitosamente (perfil: ${TF_PROFILE})"
}

action_destroy() {
  log "WARN" "Preparando destrucción de recursos (perfil: ${TF_PROFILE})..."
  check_profile_files
  confirm_action "DESTROY"
  local tfvars_file="${PROFILES_DIR}/${TF_PROFILE}.tfvars"
  local target_args
  target_args=$(build_target_args "${TARGET}")
  ensure_workspace
  if [[ -f "${tfvars_file}" ]]; then
    # shellcheck disable=SC2086
    terraform destroy ${AUTO_APPROVE} ${target_args} -var-file="${tfvars_file}"
  else
    # shellcheck disable=SC2086
    terraform destroy ${AUTO_APPROVE} ${target_args}
  fi
  log "SUCCESS" "Destroy completado (perfil: ${TF_PROFILE})"
}

action_validate() {
  log "INFO" "Validando configuración de Terraform..."
  terraform validate
  log "SUCCESS" "Validación completada"
}

action_fmt() {
  log "INFO" "Formateando archivos .tf en ${TERRAFORM_DIR}..."
  terraform fmt -recursive
  log "SUCCESS" "Formateo completado"
}

action_output() {
  log "INFO" "Mostrando outputs de Terraform (perfil: ${TF_PROFILE})..."
  ensure_workspace
  terraform output
}

action_workspace() {
  local ws_subcommand="${WS_SUBCOMMAND:-list}"
  local ws_name="${WS_NAME:-${TF_PROFILE}}"
  case "${ws_subcommand}" in
    list)
      terraform workspace list
      ;;
    create)
      log "INFO" "Creando workspace: ${ws_name}"
      terraform workspace new "${ws_name}"
      log "SUCCESS" "Workspace '${ws_name}' creado"
      ;;
    select)
      log "INFO" "Seleccionando workspace: ${ws_name}"
      terraform workspace select "${ws_name}"
      log "SUCCESS" "Workspace '${ws_name}' seleccionado"
      ;;
    delete)
      log "WARN" "Eliminando workspace: ${ws_name}"
      terraform workspace delete "${ws_name}"
      log "SUCCESS" "Workspace '${ws_name}' eliminado"
      ;;
    *)
      log "ERROR" "Subcomando de workspace desconocido: ${ws_subcommand}"
      log "INFO" "Subcomandos válidos: list, create, select, delete"
      exit 1
      ;;
  esac
}

action_console() {
  log "INFO" "Abriendo consola interactiva de Terraform (perfil: ${TF_PROFILE})..."
  log "INFO" "Escriba 'exit' para salir de la consola."
  ensure_workspace
  local tfvars_file="${PROFILES_DIR}/${TF_PROFILE}.tfvars"
  if [[ -f "${tfvars_file}" ]]; then
    terraform console -var-file="${tfvars_file}"
  else
    terraform console
  fi
}
