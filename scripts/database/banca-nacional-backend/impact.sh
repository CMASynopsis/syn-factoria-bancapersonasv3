#!/bin/bash
set -euo pipefail

# Script para impactar scripts SQL de banca-nacional-backend en MySQL
# Uso: ./impact.sh [--profile <perfil>] [--help]

show_help() {
  cat << EOF
Impacta scripts SQL de banca-nacional-backend en MySQL (Azure Flexible Server).

Uso: $(basename "$0") [OPCIONES]

Opciones:
  --profile <perfil>   Perfil de entorno a usar (default: dev)
  --help               Muestra esta ayuda

Perfiles disponibles:
  dev                  Desarrollo local / Azure dev
  staging              Entorno de staging
  prod                 Entorno de producción

Ejemplos:
  $(basename "$0") --profile dev
  $(basename "$0") --help

Archivo impactado:
  - infra/database/banca-nacional-backend/banca_db_mysql57.sql
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
DB_SCRIPTS_DIR="$PROJECT_DIR/infra/database/banca-nacional-backend"

# Cargar funciones helper
source "$SCRIPT_DIR/../../commons/get.sh"
source "$SCRIPT_DIR/../../commons/log.sh"
source "$SCRIPT_DIR/../modules/mysql_runner.sh"

# Configurar módulo de logging
MODULE_NAME="impact_banca_nacional_db"
LOG_MODULE_NAME="impact_banca_nacional_db"

# Parsear argumentos
PROFILE="dev"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile)
      PROFILE="$2"
      shift 2
      ;;
    --help|-h)
      show_help
      exit 0
      ;;
    *)
      echo "Opción inválida: $1"
      show_help
      exit 1
      ;;
  esac
done

# Cargar variables de entorno del perfil (busca <profile>.env en este directorio)
load_env_vars "$PROFILE" "$SCRIPT_DIR"

# Obtener valores con fallback
MYSQL_HOSTNAME=$(set_with_fallback "MYSQL_HOSTNAME" "localhost")
MYSQL_PORT=$(set_with_fallback "MYSQL_PORT" "3306")
MYSQL_USERNAME=$(set_with_fallback "MYSQL_USERNAME" "banca_admin")
MYSQL_PASSWORD=$(set_with_fallback "MYSQL_PASSWORD" "")
SQL_SCRIPT=$(set_with_fallback "SQL_SCRIPT" "infra/database/banca-nacional-backend/banca_db_mysql57.sql")

# Resolver ruta absoluta del SQL script
if [[ "$SQL_SCRIPT" = /* ]]; then
  SQL_SCRIPT_PATH="$SQL_SCRIPT"
else
  SQL_SCRIPT_PATH="$PROJECT_DIR/$SQL_SCRIPT"
fi

# Validar que el archivo SQL existe
if [[ ! -f "$SQL_SCRIPT_PATH" ]]; then
  handle_error "Script SQL no encontrado: $SQL_SCRIPT_PATH"
fi

# Log de inicio con información del perfil
log "INFO" "=== Impactando banca-nacional-backend con perfil: $PROFILE ==="
log "INFO" "Script SQL: $(basename "$SQL_SCRIPT_PATH")"
log "INFO" "Host: $MYSQL_HOSTNAME:$MYSQL_PORT"
log "INFO" "Usuario: $MYSQL_USERNAME"

# Verificar conexión
check_mysql_connection

# Ejecutar script SQL
run_mysql_file "$SQL_SCRIPT_PATH" "esquema banca-nacional-backend"

log "SUCCESS" "=== Proceso completado ==="
