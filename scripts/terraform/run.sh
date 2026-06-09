#!/bin/bash
# CMA Factoria — Terraform Lifecycle Management Script
# Description: Inicializa, planifica, aplica y gestiona infraestructura Terraform
# Usage: ./run.sh <action> [options]
#   Actions: init, plan, apply, destroy, validate, fmt, output, workspace, console
#   Options: --profile <dev|staging|prod>, --auto-approve, --target <resource>,
#            --profile-file <path>
set -euo pipefail

_runner_dir_b0b1c2d3e4f5a6b7c8d9() { echo "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"; }

source "$(_runner_dir_b0b1c2d3e4f5a6b7c8d9)/modules/common.sh"
source "$(_runner_dir_b0b1c2d3e4f5a6b7c8d9)/modules/args.sh"
source "$(_runner_dir_b0b1c2d3e4f5a6b7c8d9)/modules/env.sh"
source "$(_runner_dir_b0b1c2d3e4f5a6b7c8d9)/modules/utils.sh"
source "$(_runner_dir_b0b1c2d3e4f5a6b7c8d9)/modules/actions.sh"

show_help() {
  cat <<'HELP'
Uso: ./run.sh <accion> [opciones]

ACCIONES:
  init         Inicializar Terraform con backend config del perfil
  plan         Generar plan de ejecución
  apply        Aplicar cambios en la infraestructura
  destroy      Destruir recursos gestionados por Terraform
  validate     Validar configuración de Terraform
  fmt          Formatear archivos .tf
  output       Mostrar outputs de Terraform
  workspace    Gestionar workspaces (list|create|select|delete)
  console      Abrir consola interactiva de Terraform

OPCIONES:
  -p, --profile <dev|staging|prod>   Perfil de configuración (default: dev)
  --auto-approve                      Omitir confirmación en apply/destroy
  --target <recurso>                  Apuntar a un recurso específico
  --profile-file <ruta>               Ruta alternativa al archivo de perfil
  -h, --help                          Mostrar esta ayuda

EJEMPLOS:
  ./run.sh init --profile dev
  ./run.sh plan --profile staging
  ./run.sh apply --profile prod --auto-approve
  ./run.sh plan --profile dev --target azurerm_container_app.backend
  ./run.sh workspace list
  ./run.sh destroy --profile dev --auto-approve
HELP
  exit 0
}

[[ -z "${ACTION}" || "${ACTION}" =~ ^(--help|-h)$ ]] && show_help

load_profile
resolve_profile
export_azure_auth
check_prerequisites
cd_terraform

case "${ACTION}" in
  init)     action_init ;;
  plan)     action_plan ;;
  apply)    action_apply ;;
  destroy)  action_destroy ;;
  validate) action_validate ;;
  fmt)      action_fmt ;;
  output)   action_output ;;
  workspace) action_workspace ;;
  console)  action_console ;;
esac
