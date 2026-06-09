locals {
  environment = coalesce(var.environment, var.profile)
  name_prefix = "${var.project_name}-${local.environment}"
  tags = merge(var.tags, {
    Environment = local.environment
  })
}

data "azurerm_resource_group" "main" {
  name = var.resource_group_name
}

data "archive_file" "frontend_src" {
  type        = "zip"
  source_dir  = "${path.module}/../../apps/frontend/banca-nacional-frontend/src"
  output_path = "/tmp/frontend_src_${local.environment}.zip"
}

data "azurerm_client_config" "current" {}

resource "azurerm_container_registry" "main" {
  name                = replace("${var.project_name}acr${local.environment}", "/[^a-zA-Z0-9]/", "")
  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
  sku                 = var.acr_sku
  admin_enabled       = true
  tags                = local.tags

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_container_app_environment" "main" {
  name                       = "${var.project_name}-env-${local.environment}"
  resource_group_name        = data.azurerm_resource_group.main.name
  location                   = data.azurerm_resource_group.main.location
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  tags                       = local.tags
}

resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.project_name}-logs-${local.environment}"
  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.tags
}

resource "random_password" "mysql_password" {
  length  = 24
  special = false
}

resource "azurerm_mysql_flexible_server" "main" {
  name                   = "${var.project_name}-mysql-${replace(var.mysql_location, ".", "")}-${local.environment}"
  resource_group_name    = data.azurerm_resource_group.main.name
  location               = var.mysql_location
  administrator_login    = var.mysql_admin_user
  administrator_password = random_password.mysql_password.result
  sku_name               = var.mysql_sku_name
  storage {
    size_gb           = var.mysql_storage_size
    auto_grow_enabled = true
  }
  version = "8.0.21"
  tags    = local.tags

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_mysql_flexible_database" "main" {
  name                = "${var.project_name}_db"
  resource_group_name = data.azurerm_resource_group.main.name
  server_name         = azurerm_mysql_flexible_server.main.name
  charset             = "utf8"
  collation           = "utf8_unicode_ci"
}

# Allow access from any IP address (0.0.0.0 - 255.255.255.255)
resource "azurerm_mysql_flexible_server_firewall_rule" "allow_all" {
  name                = "AllowAll"
  resource_group_name = data.azurerm_resource_group.main.name
  server_name         = azurerm_mysql_flexible_server.main.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "255.255.255.255"
}

resource "azurerm_container_app" "backend" {
  name                = "${var.project_name}-be-${local.environment}"
  resource_group_name = data.azurerm_resource_group.main.name
  lifecycle {
    prevent_destroy = true
  }
  container_app_environment_id = azurerm_container_app_environment.main.id
  revision_mode                = "Single"
  tags                         = local.tags

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.main.id]
  }

  template {
    container {
      name   = "backend"
      image  = "${azurerm_container_registry.main.login_server}/${var.project_name}-backend:latest"
      cpu    = var.container_cpu
      memory = var.container_memory

      env {
        name  = "SPRING_DATASOURCE_URL"
        value = "jdbc:mysql://${azurerm_mysql_flexible_server.main.fqdn}:3306/banca_db?useSSL=true&serverTimezone=America/Lima&allowPublicKeyRetrieval=true"
      }
      env {
        name  = "SPRING_DATASOURCE_USERNAME"
        value = var.mysql_admin_user
      }
      env {
        name  = "SPRING_DATASOURCE_PASSWORD"
        value = random_password.mysql_password.result
      }
      env {
        name  = "APP_CORS_ALLOWED_ORIGINS"
        value = var.cors_allowed_origins
      }
      env {
        name  = "SPRING_PROFILES_ACTIVE"
        value = "azure"
      }
    }

    min_replicas = var.container_min_replicas
    max_replicas = var.container_max_replicas
  }

  ingress {
    target_port      = 8080
    external_enabled = true
    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  registry {
    server   = azurerm_container_registry.main.login_server
    identity = azurerm_user_assigned_identity.main.id
  }
}

resource "azurerm_user_assigned_identity" "main" {
  name                = "${var.project_name}-identity-${local.environment}"
  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
  tags                = local.tags
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.main.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.main.principal_id
}

# ---------------------------------------------------------------------------
# Storage Account para hosting estático del frontend (Angular)
# ---------------------------------------------------------------------------
resource "azurerm_storage_account" "frontend" {
  name                     = substr(replace("${var.project_name}fe${var.profile}", "/[^a-z0-9]/", ""), 0, 24)
  resource_group_name      = data.azurerm_resource_group.main.name
  location                 = data.azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  min_tls_version          = "TLS1_2"
  tags                     = local.tags

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_storage_account_static_website" "frontend" {
  storage_account_id = azurerm_storage_account.frontend.id
  index_document     = "index.html"
  error_404_document = "index.html"
}

resource "azurerm_role_assignment" "frontend_storage_blob_contributor" {
  scope                = azurerm_storage_account.frontend.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = data.azurerm_client_config.current.object_id
}

# ---------------------------------------------------------------------------
# Build y despliegue del frontend al contenedor $web
# ---------------------------------------------------------------------------
resource "terraform_data" "frontend_deploy" {
  triggers_replace = [
    data.archive_file.frontend_src.output_sha256
  ]

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-lc"]
    environment = {
      FRONTEND_DIR = "${path.module}/../../apps/frontend/banca-nacional-frontend"
    }
    command = <<-EOT
      docker run --rm \
        -v "$FRONTEND_DIR:/app" \
        -w /app \
        node:25-alpine \
        sh -c "sed -i \"s|API_BASE = '.*'|API_BASE = 'https://${azurerm_container_app.backend.ingress[0].fqdn}'|\" src/app/api.config.ts && npm install && npm run build" && \
      echo "Esperando propagación del rol Storage Blob Data Contributor..." && \
      sleep 60 && \
      az storage blob upload-batch \
        --account-name ${azurerm_storage_account.frontend.name} \
        --auth-mode login \
        --destination '$web' \
        --source "$FRONTEND_DIR/dist/banca-frontend/browser" \
        --overwrite
    EOT
  }

  depends_on = [
    azurerm_storage_account_static_website.frontend,
    azurerm_role_assignment.frontend_storage_blob_contributor,
  ]
}

resource "azurerm_consumption_budget_resource_group" "monthly" {
  name              = "${var.project_name}-budget-${local.environment}"
  resource_group_id = data.azurerm_resource_group.main.id
  amount            = var.budget_amount
  time_grain        = "Monthly"

  time_period {
    start_date = "${formatdate("YYYY-MM-01", timestamp())}T00:00:00Z"
  }

  notification {
    enabled        = true
    operator       = "EqualTo"
    threshold      = 90
    contact_emails = [var.budget_notification_email]
  }

  notification {
    enabled        = true
    operator       = "GreaterThan"
    threshold      = 100
    contact_emails = [var.budget_notification_email]
  }
}
