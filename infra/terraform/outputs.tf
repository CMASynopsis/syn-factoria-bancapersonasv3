output "resource_group_name" {
  description = "Name of the Azure Resource Group"
  value       = data.azurerm_resource_group.main.name
}

output "container_registry_login_server" {
  description = "ACR login server URL"
  value       = azurerm_container_registry.main.login_server
}

output "container_app_url" {
  description = "Backend Container App stable URL (ingress FQDN)"
  value       = "https://${azurerm_container_app.backend.ingress[0].fqdn}"
}

output "frontend_storage_account_name" {
  description = "Storage Account name hosting the frontend static site"
  value       = azurerm_storage_account.frontend.name
}

output "frontend_static_website_url" {
  description = "Primary endpoint URL for the frontend static website"
  value       = azurerm_storage_account.frontend.primary_web_endpoint
}

output "frontend_static_website_host" {
  description = "Host name of the frontend static website"
  value       = azurerm_storage_account.frontend.primary_web_host
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
