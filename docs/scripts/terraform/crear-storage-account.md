# Crear Storage Account para Estado Remoto de Terraform

## Requisitos del nombre

Azure Storage Account name rules:
- Solo **minúsculas y números** (sin guiones, sin puntos)
- Entre **3 y 24 caracteres**
- Globalmente único en Azure

## Creación manual (una sola vez por entorno)

```bash
# 1. Resource Group para el estado (no lo gestiona Terraform)
az group create \
  --name banca-nacional-tfstate \
  --location eastus

# 2. Storage Account (dev)
az storage account create \
  --name tfstatebancadev \
  --resource-group banca-nacional-tfstate \
  --sku Standard_LRS \
  --allow-blob-public-access false

# 3. Container para los archivos .tfstate
az storage container create \
  --name tfstate \
  --account-name tfstatebancadev
```

## Por entorno

| Entorno  | Storage Account      | Resource Group          | Container | Key Pattern                          |
|----------|----------------------|-------------------------|-----------|--------------------------------------|
| dev      | `tfstatebancadev`    | `banca-nacional-tfstate` | `tfstate` | `banca-nacional/terraform-dev.tfstate` |
| staging  | `tfstatebancastaging`| `banca-nacional-tfstate` | `tfstate` | `banca-nacional/terraform-staging.tfstate` |
| prod     | `tfstatebancaprod`   | `banca-nacional-tfstate` | `tfstate` | `banca-nacional/terraform-prod.tfstate` |

## Configuración en el perfil

El `scripts/terraform/profile.env` debe reflejar el storage account creado:

```bash
TF_STATE_BUCKET=tfstatebancadev
TF_STATE_CONTAINER=tfstate
TF_STATE_KEY=banca-nacional/terraform-dev.tfstate
```

Cada entorno usa su propio storage account para mantener el estado aislado.

## Backend config (HCL)

Los archivos en `infra/terraform/backend-configs/*.hcl` ya apuntan a estos valores:

```hcl
# dev.hcl
resource_group_name  = "banca-nacional-tfstate"
storage_account_name = "tfstatebancadev"
container_name       = "tfstate"
key                  = "banca-nacional/terraform-dev.tfstate"
```

## Inicializar Terraform

```bash
scripts/terraform/run.sh init --profile dev
```

Esto ejecuta `terraform init -reconfigure -backend-config=backend-configs/dev.hcl`.

## Notas

- Este Resource Group (`banca-nacional-tfstate`) se crea **manualmente** a propósito. Si Terraform lo gestionara, un `destroy` podría borrar el estado junto con la infraestructura.
- Los nombres de Storage Account no pueden tener guiones. El formato `tfstate{bancanacional}{entorno}` cumple las reglas de Azure.
- No exponer el container al público (`--allow-blob-public-access false`).
