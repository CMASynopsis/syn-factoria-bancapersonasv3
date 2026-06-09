output "resource_group_name" {
  description = "Name of the Azure Resource Group"
  value       = data.azurerm_resource_group.main.name
}

output "container_registry_login_server" {
  description = "ACR login server URL"
  value       = azurerm_container_registry.main.login_server
}

output "container_app_url" {
  description = "Backend Container App URL"
  value       = "https://${azurerm_container_app.backend.latest_revision_fqdn}"
}

output "static_web_app_url" {
  description = "Frontend Static Web Apps URL"
  value       = "https://${azurerm_static_web_app.frontend.default_host_name}"
}

output "static_web_app_api_token" {
  description = "Deployment token for Static Web Apps"
  value       = azurerm_static_web_app.frontend.api_key
  sensitive   = true
}

output "mysql_server_fqdn" {
  description = "MySQL Flexible Server FQDN"
  value       = azurerm_mysql_flexible_server.main.fqdn
}

output "mysql_database_name" {
  description = "Created MySQL database name"
  value       = azurerm_mysql_flexible_database.main.name
}

output "mysql_admin_user" {
  description = "MySQL administrator username"
  value       = azurerm_mysql_flexible_server.main.administrator_login
}

output "mysql_admin_password" {
  description = "MySQL administrator password"
  value       = random_password.mysql_password.result
  sensitive   = true
}

output "jdbc_connection_string" {
  description = "Full JDBC connection string"
  value       = "jdbc:mysql://${azurerm_mysql_flexible_server.main.fqdn}:3306/${azurerm_mysql_flexible_database.main.name}?useSSL=true"
  sensitive   = true
}

output "identity_client_id" {
  description = "User-assigned managed identity client ID"
  value       = azurerm_user_assigned_identity.main.client_id
}
