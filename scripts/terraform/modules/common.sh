#!/bin/bash
set -euo pipefail

_terraform_dir_f3a6e7b2c1d4e5f6a7b8() { echo "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"; }

_COMMONS_DIR="$(_terraform_dir_f3a6e7b2c1d4e5f6a7b8)/../../commons"

source "${_COMMONS_DIR}/log.sh" 2>/dev/null || true
source "${_COMMONS_DIR}/get.sh" 2>/dev/null || true
source "${_COMMONS_DIR}/validate.sh" 2>/dev/null || true

MODULE_NAME="terraform-run"
LOG_MODULE_NAME="$MODULE_NAME"

PROJECT_ROOT="$(_terraform_dir_f3a6e7b2c1d4e5f6a7b8)/../../.."
TERRAFORM_DIR="${PROJECT_ROOT}/infra/terraform"
PROFILES_DIR="${TERRAFORM_DIR}/profiles"
BACKEND_CONFIGS_DIR="${TERRAFORM_DIR}/backend-configs"
