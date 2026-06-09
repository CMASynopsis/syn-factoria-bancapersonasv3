variable "profile" {
  description = "Deployment profile (dev/staging/prod) — selects .tfvars and backend-config"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.profile)
    error_message = "Profile must be one of: dev, staging, prod."
  }
}

variable "resource_group_name" {
  description = "Azure Resource Group where all resources are deployed"
  type        = string
  default     = "banca-rg"
}

variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "eastus2"
}

variable "mysql_location" {
  description = "Azure region for MySQL Flexible Server (separada porque eastus2 no soporta MySQL en esta sub)"
  type        = string
  default     = "westus2"
}

variable "project_name" {
  description = "Project identifier used in resource naming"
  type        = string
  default     = "banca-nacional"
}

variable "environment" {
  description = "Logical environment label (e.g., development, staging, production). Defaults to profile value."
  type        = string
  default     = null
}

variable "tags" {
  description = "Common Azure tags applied to every resource"
  type        = map(string)
  default = {
    Project   = "Banca-Nacional"
    ManagedBy = "Terraform"
  }
}

variable "mysql_admin_user" {
  description = "Administrator username for MySQL Flexible Server"
  type        = string
  default     = "banca_admin"
}

variable "backend_env_vars" {
  description = "Environment variables injected into the Container App (Spring Boot)"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "cors_allowed_origins" {
  description = "Allowed CORS origins for the backend (comma-separated)"
  type        = string
  default     = ""
}

variable "container_min_replicas" {
  description = "Minimum replicas for the Container App (0 = scale-to-zero)"
  type        = number
  default     = 0
}

variable "container_max_replicas" {
  description = "Maximum replicas for the Container App"
  type        = number
  default     = 3
}

variable "container_cpu" {
  description = "CPU cores allocated to the Container App container (e.g., 0.25, 0.5, 1.0)"
  type        = number
  default     = 0.25
}

variable "container_memory" {
  description = "Memory allocated to the Container App container (e.g., 0.5Gi, 1.0Gi, 2.0Gi)"
  type        = string
  default     = "0.5Gi"
}

variable "acr_sku" {
  description = "SKU for Azure Container Registry"
  type        = string
  default     = "Basic"
}

variable "mysql_sku_name" {
  description = "SKU name for MySQL Flexible Server (e.g., B_Standard_B1ms)"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "mysql_storage_size" {
  description = "Storage size in GB for MySQL Flexible Server"
  type        = number
  default     = 20
}

variable "budget_amount" {
  description = "Monthly budget alert amount in USD"
  type        = number
  default     = 50
}

variable "budget_notification_email" {
  description = "Email for budget alerts"
  type        = string
  default     = "elperez@synopsis.ws"
}


