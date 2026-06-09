#!/bin/bash
# CMA Factoria — Azure Storage Account management for Terraform state
# Usage: ./storage-account.sh <action> [options]
#   Actions: create, show, list-keys, delete
#   Options: --profile <dev|staging|prod>, --auto-approve, --subscription <id>
set -euo pipefail

_sa_dir_c1d2e3f4a5b6c7d8e9f0() { echo "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"; }

source "$(_sa_dir_c1d2e3f4a5b6c7d8e9f0)/modules/common.sh"

PROFILE="dev"
PROFILE_FILE=""
AUTO_APPROVE=""
SUBSCRIPTION=""

source "$(_sa_dir_c1d2e3f4a5b6c7d8e9f0)/modules/env.sh"

MODULE_NAME="terraform-storage-account"

show_help() {
  cat <<'HELP'
Uso: ./storage-account.sh <accion> [opciones]

ACCIONES:
  create       Crear Resource Group + Storage Account + Container
  show         Mostrar detalles del Storage Account
  list-keys    Listar claves de acceso del Storage Account
  delete       Eliminar Storage Account (con confirmacion)

OPCIONES:
  -p, --profile <dev|staging|prod>   Perfil (default: dev)
  --auto-approve                      Omitir confirmacion en delete
  --subscription <id>                 Subscription ID de Azure
  -h, --help                          Mostrar esta ayuda

EJEMPLOS:
  ./storage-account.sh create --profile dev
  ./storage-account.sh show --profile staging
  ./storage-account.sh list-keys --profile prod
  ./storage-account.sh delete --profile dev --auto-approve
HELP
  exit 0
}

load_backend_config() {
  local profile="$1"
  local hcl_file="${BACKEND_CONFIGS_DIR}/${profile}.hcl"

  if [[ -f "${hcl_file}" ]]; then
    RG_NAME=$(grep -oP 'resource_group_name\s*=\s*"\K[^"]+' "${hcl_file}")
    SA_NAME=$(grep -oP 'storage_account_name\s*=\s*"\K[^"]+' "${hcl_file}")
    CONTAINER_NAME=$(grep -oP 'container_name\s*=\s*"\K[^"]+' "${hcl_file}")
  fi

  RG_NAME="${TF_STATE_RG:-${RG_NAME:-banca-nacional-tfstate}}"
  SA_NAME="${TF_STATE_BUCKET:-${SA_NAME:-}}"
  CONTAINER_NAME="${TF_STATE_CONTAINER:-${CONTAINER_NAME:-tfstate}}"

  if [[ -z "${SA_NAME}" ]]; then
    handle_error "Storage Account name not set. Define TF_STATE_BUCKET in profile.env or add storage_account_name to ${hcl_file}"
  fi
}

check_az_cli() {
  if ! command -v az &>/dev/null; then
    handle_error "Azure CLI no instalado. Instale desde: https://aka.ms/installazurecli"
  fi
}

check_az_login() {
  if ! az account show &>/dev/null; then
    handle_error "No hay sesion activa de Azure. Ejecute 'az login' primero."
  fi
}

confirm_destroy() {
  if [[ -n "${AUTO_APPROVE}" ]]; then
    return 0
  fi
  echo ""
  log "WARN" "═══════════════════════════════════════════════════════════════"
  log "WARN" "  Destruccion: ${SA_NAME} (${RG_NAME})"
  log "WARN" "  Todos los blobs de estado se perderan permanentemente."
  log "WARN" "═══════════════════════════════════════════════════════════════"
  echo ""
  read -r -p "Escriba el nombre del Storage Account para confirmar: " confirm
  if [[ "${confirm}" != "${SA_NAME}" ]]; then
    log "INFO" "Operacion cancelada."
    exit 0
  fi
}

# ── Argument parsing ──────────────────────────────────────────────────────────

ACTION="${1:-}"
[[ -z "${ACTION}" || "${ACTION}" =~ ^(--help|-h)$ ]] && show_help
shift 1 || true

VALID_ACTIONS="create show list-keys delete"
if ! echo "${VALID_ACTIONS}" | grep -qw "${ACTION}"; then
  echo "Error: Accion desconocida '${ACTION}'. Use --help para ver las opciones." >&2
  exit 1
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--profile)   PROFILE="$2"; shift 2 ;;
    --auto-approve) AUTO_APPROVE="--auto-approve"; shift ;;
    --subscription) SUBSCRIPTION="$2"; shift 2 ;;
    -h|--help)      show_help ;;
    *)
      echo "Error: Argumento desconocido: $1. Use --help." >&2
      exit 1
      ;;
  esac
done

# ── Main ──────────────────────────────────────────────────────────────────────

load_profile
resolve_profile
load_backend_config "${PROFILE}"
check_az_cli
check_az_login

if [[ -n "${SUBSCRIPTION}" ]]; then
  az account set --subscription "${SUBSCRIPTION}"
fi

case "${ACTION}" in
  create)
    log "INFO" "Creando infraestructura de estado para perfil '${PROFILE}'..."
    log "INFO" "  Resource Group : ${RG_NAME}"
    log "INFO" "  Storage Account: ${SA_NAME}"
    log "INFO" "  Container      : ${CONTAINER_NAME}"

    if az group exists --name "${RG_NAME}" &>/dev/null; then
      log "INFO" "Resource Group '${RG_NAME}' ya existe."
    else
      log "INFO" "Creando Resource Group '${RG_NAME}'..."
      az group create --name "${RG_NAME}" --location "${LOCATION:-eastus}"
      log "SUCCESS" "Resource Group creado."
    fi

    if az storage account show --name "${SA_NAME}" --resource-group "${RG_NAME}" &>/dev/null; then
      log "INFO" "Storage Account '${SA_NAME}' ya existe."
    else
      log "INFO" "Creando Storage Account '${SA_NAME}'..."
      az storage account create \
        --name "${SA_NAME}" \
        --resource-group "${RG_NAME}" \
        --sku Standard_LRS \
        --allow-blob-public-access false
      log "SUCCESS" "Storage Account creado."
    fi

    if az storage container show --name "${CONTAINER_NAME}" --account-name "${SA_NAME}" &>/dev/null; then
      log "INFO" "Container '${CONTAINER_NAME}' ya existe."
    else
      log "INFO" "Creando container '${CONTAINER_NAME}'..."
      az storage container create \
        --name "${CONTAINER_NAME}" \
        --account-name "${SA_NAME}"
      log "SUCCESS" "Container creado."
    fi

    log "SUCCESS" "Infraestructura de estado lista para perfil '${PROFILE}'."
    ;;

  show)
    log "INFO" "Detalles del Storage Account '${SA_NAME}':"
    az storage account show \
      --name "${SA_NAME}" \
      --resource-group "${RG_NAME}" \
      --query "{id:id, name:name, location:location, sku:sku.name, kind:kind, primaryEndpoint:primaryEndpoints.blob}" \
      --output table
    ;;

  list-keys)
    log "INFO" "Claves de acceso para '${SA_NAME}':"
    az storage account keys list \
      --account-name "${SA_NAME}" \
      --resource-group "${RG_NAME}" \
      --query "[].{KeyName:keyName, Value:value, Permissions:permissions}" \
      --output table
    ;;

  delete)
    log "WARN" "Preparando eliminacion de '${SA_NAME}'..."
    confirm_destroy
    log "WARN" "Eliminando Storage Account '${SA_NAME}'..."
    az storage account delete \
      --name "${SA_NAME}" \
      --resource-group "${RG_NAME}" \
      --yes
    log "SUCCESS" "Storage Account '${SA_NAME}' eliminado."
    ;;
esac
