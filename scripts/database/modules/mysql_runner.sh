#!/bin/bash
#location: scripts/database/modules/mysql_runner.sh

# Requiere: log.sh (log, handle_error)

check_mysql_connection() {
  if ! command -v mysql &> /dev/null; then
    handle_error "MySQL client (mysql) no está instalado"
  fi

  log "INFO" "Verificando conexión a MySQL en $MYSQL_HOSTNAME:$MYSQL_PORT..."

  if mysql -h "$MYSQL_HOSTNAME" -P "$MYSQL_PORT" \
          -u "$MYSQL_USERNAME" -p"$MYSQL_PASSWORD" \
          -e "SELECT 1" &> /dev/null; then
    log "SUCCESS" "Conexión exitosa a MySQL en $MYSQL_HOSTNAME:$MYSQL_PORT"
  else
    handle_error "No se pudo conectar a MySQL en $MYSQL_HOSTNAME:$MYSQL_PORT"
  fi
}

run_mysql_file() {
  local sql_file="$1"
  local description="$2"

  if [[ ! -f "$sql_file" ]]; then
    log "WARN" "Archivo SQL no encontrado: $sql_file (saltando $description)"
    return 0
  fi

  log "INFO" "Ejecutando $description: $(basename "$sql_file")..."

  if mysql -h "$MYSQL_HOSTNAME" -P "$MYSQL_PORT" \
           -u "$MYSQL_USERNAME" -p"$MYSQL_PASSWORD" \
           < "$sql_file"; then
    log "SUCCESS" "$description ejecutado correctamente"
  else
    handle_error "Error al ejecutar $description: $(basename "$sql_file")"
  fi
}
