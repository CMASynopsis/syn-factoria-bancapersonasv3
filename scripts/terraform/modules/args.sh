#!/bin/bash
set -euo pipefail

ACTION="${1:-}"
shift 1 || true

VALID_ACTIONS="init plan apply destroy validate fmt output workspace console"
if [[ -n "${ACTION}" ]] && ! [[ "${ACTION}" =~ ^(--help|-h)$ ]]; then
  if ! echo "${VALID_ACTIONS}" | grep -qw "${ACTION}"; then
    echo "Error: Acción desconocida '${ACTION}'. Use --help para ver las opciones." >&2
    exit 1
  fi
fi

PROFILE="dev"
PROFILE_FILE=""
AUTO_APPROVE=""
TARGET=""
WS_SUBCOMMAND=""
WS_NAME=""

if [[ "${ACTION}" == "workspace" ]]; then
  WS_SUBCOMMAND="${1:-list}"
  shift 1 || true
  if [[ $# -gt 0 ]] && [[ ! "$1" =~ ^-- ]]; then
    WS_NAME="$1"
    shift 1 || true
  fi
fi

for arg in "$@"; do
  case "${arg}" in
    -p|--profile) capture_profile=true ;;
    --auto-approve) ;;
    --target) capture_target=true ;;
    --profile-file) capture_profile_file=true ;;
    *)
      if [[ "${capture_profile:-}" == "true" ]]; then
        PROFILE="${arg}"
        capture_profile=false
      elif [[ "${capture_target:-}" == "true" ]]; then
        TARGET="${arg}"
        capture_target=false
      elif [[ "${capture_profile_file:-}" == "true" ]]; then
        PROFILE_FILE="${arg}"
        capture_profile_file=false
      fi
      ;;
  esac
done

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--profile)
      PROFILE="$2"
      shift 2
      ;;
    --auto-approve)
      AUTO_APPROVE="--auto-approve"
      shift
      ;;
    --target)
      TARGET="$2"
      shift 2
      ;;
    --profile-file)
      PROFILE_FILE="$2"
      shift 2
      ;;
    -h|--help)
      ACTION=""
      shift
      ;;
    *)
      echo "Error: Argumento desconocido: $1. Use --help para ver las opciones." >&2
      exit 1
      ;;
  esac
done
