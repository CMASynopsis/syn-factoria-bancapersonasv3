# Infraestructura Terraform — Banca Nacional

## Visión General

Este directorio contiene la configuración de Terraform que gestiona toda la infraestructura en Azure para el proyecto **Banca Nacional**. El despliegue sigue una arquitectura de mínimo costo (~$33/mes) usando servicios serverless y burstables:

- **Frontend**: Azure Static Web Apps (Free)
- **Backend**: Azure Container Apps (Consumption, scale-to-zero)
- **Base de Datos**: Azure Database for MySQL Flexible Server (B1ms Burstable)
- **Contenedores**: Azure Container Registry (Basic)

Cada entorno (dev, staging, prod) se despliega como un workspace independiente con su propio estado remoto y archivo de variables.

---

## Diagrama de Arquitectura

```mermaid
%% Fuente: mermaid/architecture.mmd
%% Editarlo desde el archivo .mmd, no desde aquí
```

---

## Estructura de Archivos

| Archivo | Propósito |
|---------|-----------|
| `versions.tf` | Versión de Terraform (>= 1.5.0) y providers requeridos: `azurerm`, `random`, `local` |
| `variables.tf` | Declaración de todas las variables de entrada con tipo, descripción y valores por defecto |
| `main.tf` | Recursos de Azure: Resource Group, ACR, ACA Environment, Log Analytics, MySQL, Container App, Static Web App, Identity, Budget Alert |
| `outputs.tf` | Valores de salida: URLs, credenciales, cadenas de conexión |
| `.keep` | Archivo vacío para preservar el directorio en git |
| `profiles/dev.tfvars` | Variables específicas del entorno de desarrollo |
| `profiles/staging.tfvars` | Variables específicas del entorno de staging |
| `profiles/prod.tfvars` | Variables específicas del entorno de producción |
| `profiles/profile.tfvars.example` | Plantilla para crear nuevos archivos de perfil |
| `backend-configs/dev.hcl` | Configuración de estado remoto para el entorno dev |
| `backend-configs/staging.hcl` | Configuración de estado remoto para el entorno staging |
| `backend-configs/prod.hcl` | Configuración de estado remoto para el entorno prod |

---

## Variables de Entrada

| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `profile` | `string` | — | Perfil de despliegue (`dev`, `staging` o `prod`). Sin valor por defecto. |
| `resource_group_name` | `string` | `"banca-rg"` | Nombre del Resource Group de Azure |
| `location` | `string` | `"eastus"` | Región de Azure para todos los recursos |
| `project_name` | `string` | `"banca-nacional"` | Identificador usado como prefijo en los nombres de los recursos |
| `environment` | `string` | `null` | Etiqueta del entorno (development, staging, production). Si es null, se usa el valor de `profile` |
| `tags` | `map(string)` | `{Project: "Banca-Nacional", ManagedBy: "Terraform"}` | Tags de Azure aplicados a todos los recursos |
| `mysql_admin_user` | `string` | `"banca_admin"` | Usuario administrador de MySQL Flexible Server |
| `backend_env_vars` | `map(string)` | `{}` | Variables de entorno inyectadas en el Container App (sensitive) |
| `cors_allowed_origins` | `string` | `""` | Orígenes CORS permitidos (separados por coma) |
| `container_min_replicas` | `number` | `0` | Mínimo de réplicas del Container App (0 = scale-to-zero) |
| `container_max_replicas` | `number` | `3` | Máximo de réplicas del Container App |
| `acr_sku` | `string` | `"Basic"` | SKU de Azure Container Registry |
| `mysql_sku_name` | `string` | `"Standard_B1ms"` | SKU de MySQL Flexible Server |
| `mysql_storage_size` | `number` | `20` | Almacenamiento en GB para MySQL |
| `budget_amount` | `number` | `50` | Límite de alerta de presupuesto mensual en USD |

---

## Outputs

| Nombre | Descripción | Sensitivo |
|--------|-------------|-----------|
| `resource_group_name` | Nombre del Resource Group | No |
| `container_registry_login_server` | URL del servidor ACR | No |
| `container_app_url` | URL HTTPS del backend en Container Apps | No |
| `static_web_app_url` | URL HTTPS del frontend en Static Web Apps | No |
| `static_web_app_api_token` | Token de despliegue para Static Web Apps | **Sí** |
| `mysql_server_fqdn` | FQDN del servidor MySQL | No |
| `mysql_database_name` | Nombre de la base de datos creada | No |
| `mysql_admin_user` | Usuario administrador de MySQL | No |
| `mysql_admin_password` | Contraseña del administrador de MySQL | **Sí** |
| `jdbc_connection_string` | Cadena JDBC completa con SSL | **Sí** |
| `identity_client_id` | Client ID de la identidad administrada | No |

---

## Perfiles de Entorno

| Parámetro | Dev | Staging | Prod |
|-----------|-----|---------|------|
| Resource Group | `rg-ibm-modernizacion-dev` | `rg-ibm-modernizacion-staging` | `rg-ibm-modernizacion-prod` |
| Location | `eastus` | `eastus` | `eastus` |
| Environment | `development` | `staging` | `production` |
| min_replicas | `0` (scale-to-zero) | `1` | `1` |
| max_replicas | `1` | `2` | `3` |
| CORS origins | `http://localhost:4200,https://localhost:4200` | `https://staging.banca-nacional.app` | `https://banca-nacional.app,https://www.banca-nacional.app` |
| ACR SKU | Basic | Basic | Basic |
| MySQL SKU | Standard_B1ms | Standard_B1ms | Standard_B1ms |
| MySQL Storage | 20 GB | 32 GB | 64 GB |
| Budget Alert | $30 USD | $40 USD | $50 USD |
| Root Log Level | DEBUG | INFO | WARN |
| Spring Profile | `azure,dev` | `azure,staging` | `azure,prod` |

### Diferencias clave entre entornos

- **Dev**: Scale-to-zero (`min_replicas = 0`). Sin tráfico nocturno, el backend escala a cero y no genera costo de cómputo. Storage mínimo (20 GB). Budget más bajo ($30). Logging en DEBUG para depuración.
- **Staging**: Una réplica mínima siempre activa. Storage intermedio (32 GB). Budget moderado ($40). Logging en INFO.
- **Prod**: Una réplica mínima siempre activa, hasta 3 en picos. Storage mayor (64 GB). Budget de $50. Logging en WARN. CORS con dominios reales.

---

## Estado Remoto (Backend)

Cada entorno tiene su propio archivo de estado almacenado en Azure Storage, aislado por `key`:

| Perfil | Storage Account | Container | Key (state file) |
|--------|----------------|-----------|------------------|
| Dev | `tfstatebancadev` | `tfstate` | `banca-nacional/terraform-dev.tfstate` |
| Staging | `tfstatebancastaging` | `tfstate` | `banca-nacional/terraform-staging.tfstate` |
| Prod | `tfstatebancaprod` | `tfstate` | `banca-nacional/terraform-prod.tfstate` |

Todas las cuentas de storage pertenecen al Resource Group `banca-nacional-tfstate`. Este Resource Group se crea manualmente (no lo gestiona Terraform) para evitar el borrado accidental del estado.

---

## Prerrequisitos

1. **Azure CLI** instalado y logueado:
   ```bash
   az login
   az account set --subscription "<subscription-id>"
   ```

2. **Terraform** v1.5 o superior:
   ```bash
   terraform version  # >= 1.5.0
   ```

3. **Service Principal** (alternativa a `az login`): Crear SP y exportar variables:
   ```bash
   export ARM_SUBSCRIPTION_ID="..."
   export ARM_TENANT_ID="..."
   export ARM_CLIENT_ID="..."
   export ARM_CLIENT_SECRET="..."
   ```

4. **Storage Account para estado**: Crear manualmente (una vez):
   ```bash
   az group create --name banca-nacional-tfstate --location eastus
   az storage account create --name tfstatebancadev --resource-group banca-nacional-tfstate --sku Standard_LRS
   az storage container create --name tfstate --account-name tfstatebancadev
   ```

---

## Flujo de Trabajo

### 1. Inicializar (primera vez)
```bash
scripts/terraform/run.sh init --profile dev
```
Selecciona el backend-config correspondiente y descarga los providers.

### 2. Validar configuración
```bash
scripts/terraform/run.sh validate
```

### 3. Generar plan
```bash
scripts/terraform/run.sh plan --profile dev
```
Muestra los cambios que se aplicarán. Usar `--target` para limitar a un recurso:
```bash
scripts/terraform/run.sh plan --profile dev --target azurerm_container_app.backend
```

### 4. Aplicar
```bash
scripts/terraform/run.sh apply --profile dev --auto-approve
```
Solicita confirmación interactiva a menos que se use `--auto-approve`.

### 5. Ver outputs
```bash
scripts/terraform/run.sh output --profile dev
```

---

## Costos Estimados (por mes)

| Servicio | SKU / Plan | Costo/mes |
|----------|------------|-----------|
| Static Web Apps | Free | **$0** |
| Container Apps (Backend) | Consumption (scale-to-zero) | **~$15** |
| Azure Database for MySQL | B1ms Burstable | **~$13** |
| Container Registry | Basic | **~$5** |
| **Total** | | **~$33** |

> El entorno **dev** escala a cero sin tráfico, por lo que su costo real puede estar muy por debajo de los $33, acercándose al costo fijo de MySQL + ACR (~$18).

---

## Limpieza

Para destruir todos los recursos de un entorno:

```bash
scripts/terraform/run.sh destroy --profile dev --auto-approve
```

**Advertencias:**
- El Resource Group completo se elimina con todos sus recursos.
- La base de datos MySQL se borra permanentemente.
- Las imágenes en ACR se pierden.
- Los archivos de estado remoto **no** se eliminan automáticamente. Para limpiarlos:
  ```bash
  az storage blob delete --container-name tfstate --name "banca-nacional/terraform-dev.tfstate" --account-name tfstatebancadev
  ```
