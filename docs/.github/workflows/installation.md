# Instalación y configuración de GitHub Actions

Guía para configurar los secrets y parámetros necesarios que consumen los workflows del repositorio.

---

## 1. Secrets de Azure Container Registry (ACR)

El workflow `build-banca-nacional-backend.yml` requiere acceso al ACR para publicar imágenes Docker.

### 1.1 Obtener los valores desde Azure

Ejecuta los siguientes comandos desde Azure CLI (autenticado con `az login`):

```bash
# Nombre del ACR (ajústalo si usaste otro)
ACR_NAME="bancaacr"

# Servidor de login
az acr show \
  --name $ACR_NAME \
  --query "loginServer" \
  --output tsv

# Usuario administrador
az acr credential show \
  --name $ACR_NAME \
  --query "username" \
  --output tsv

# Contraseña administrador
az acr credential show \
  --name $ACR_NAME \
  --query "passwords[0].value" \
  --output tsv
```

> **Requisito:** El ACR debe tener el usuario administrador habilitado. Si no es así, actívalo con:
> ```bash
> az acr update --name $ACR_NAME --admin-enabled true
> ```

### 1.2 Registrar los secrets en GitHub

1. Ve al repositorio en GitHub.
2. Navega a **Settings → Secrets and variables → Actions**.
3. Haz clic en **New repository secret**.
4. Crea los siguientes secrets:

| Nombre del secret | Valor | Descripción |
|-------------------|-------|-------------|
| `ACR_LOGIN_SERVER` | `bancaacr.azurecr.io` | Servidor del Azure Container Registry |
| `ACR_USERNAME` | `<nombre-de-usuario>` | Usuario administrador del ACR |
| `ACR_PASSWORD` | `<contraseña>` | Contraseña del usuario administrador |

---

## 2. Secret de Azure Service Principal

El workflow actualiza el **Azure Container App** tras publicar la imagen. Para ello necesita un Service Principal con permisos sobre el resource group donde Terraform desplegó la infraestructura.

### 2.1 Crear el Service Principal

> **Nota:** El comando `az ad sp create-for-rbac --sdk-auth` presenta un bug conocido con Python 3.14 en ciertas versiones de Azure CLI. Usa el procedimiento por pasos separados que se indica a continuación.

Desde Azure CLI ejecuta:

```bash
APP_NAME="github-actions-banca-dev"
SUBSCRIPTION="39f6d339-f9c9-4dbc-92a3-e8ee0f6b1bcf"
RG="rg-geniarh-dev"
SCOPE="/subscriptions/$SUBSCRIPTION/resourceGroups/$RG"

# 1. Crear App Registration
APP_ID=$(az ad app create --display-name "$APP_NAME" --query "appId" -o tsv)

# 2. Crear Service Principal
SP_ID=$(az ad sp create --id "$APP_ID" --query "id" -o tsv)

# 3. Crear Client Secret
CLIENT_SECRET=$(az ad app credential reset --id "$APP_ID" --display-name "github-actions" --query "password" -o tsv)

# 4. Asignar rol Contributor sobre el resource group
az role assignment create \
  --assignee "$SP_ID" \
  --role contributor \
  --scope "$SCOPE"
```

### 2.2 Construir el JSON de AZURE_CREDENTIALS

Después de ejecutar los pasos anteriores, arma el JSON con los valores obtenidos:

```bash
TENANT_ID=$(az account show --query "tenantId" -o tsv)

cat <<EOF
{
  "clientId": "$APP_ID",
  "clientSecret": "$CLIENT_SECRET",
  "subscriptionId": "$SUBSCRIPTION",
  "tenantId": "$TENANT_ID",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
EOF
```

> **Importante:** Guarda el `clientSecret` en un lugar seguro. No se podrá recuperar después.

### 2.3 Registrar el secret en GitHub

Crea un nuevo repository secret llamado **`AZURE_CREDENTIALS`** y pega el JSON completo como valor.

---

## 3. Variables de entorno del workflow

Las siguientes variables están definidas directamente en el workflow (`env:`). Si necesitas personalizarlas, edita el archivo en `.github/workflows/build-banca-nacional-backend.yml`:

| Variable | Valor por defecto | Cuándo cambiarla |
|----------|-------------------|------------------|
| `JAVA_VERSION` | `21` | Si se actualiza el proyecto a otra versión de Java |
| `JAVA_DISTRIBUTION` | `temurin` | Si se requiere otra distribución de JDK (ej. `zulu`, `corretto`) |
| `BACKEND_DIR` | `apps/backend/banca-nacional-backend` | Si se mueve el código del backend |
| `DOCKERFILE_PATH` | `infra/docker/backend/banca-nacional-backend/Dockerfile` | Si se reubica el Dockerfile |
| `IMAGE_NAME` | `banca-nacional-backend` | Si se requiere otro nombre de imagen en el ACR |
| `AZURE_RESOURCE_GROUP` | `rg-geniarh-dev` | Si cambia el resource group de Terraform |
| `AZURE_CONTAINER_APP` | `banca-nacional-be-development` | Si cambia el nombre del Container App |

---

## 4. Verificación

Una vez configurados los secrets, prueba el workflow:

### 4.1 Ejecución manual

1. Ve a la pestaña **Actions** del repositorio.
2. Selecciona el workflow **Build & Push Backend to ACR**.
3. Haz clic en **Run workflow**.
4. Selecciona la rama `develop` y confirma.

### 4.2 Verificar la imagen en ACR

```bash
# Listar tags de la imagen
az acr repository show-tags \
  --name bancanacionalacrdevelopment \
  --repository banca-nacional-backend \
  --output table
```

Deberías ver al menos dos tags:
- `develop-latest`
- `<commit-sha>` del último push

### 4.3 Verificar el Container App

```bash
az containerapp show \
  --name banca-nacional-be-development \
  --resource-group rg-geniarh-dev \
  --query properties.template.containers[0].image \
  -o tsv
```

Debería mostrar la imagen con el tag del último commit.

---

## 5. Solución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `denied: requested access to the resource is denied` | Credenciales de ACR incorrectas | Revisa `ACR_LOGIN_SERVER`, `ACR_USERNAME` y `ACR_PASSWORD` en los secrets |
| `unauthorized: authentication required` | Usuario administrador deshabilitado | Habilita el admin del ACR con `az acr update --name <acr> --admin-enabled true` |
| `Could not find artifact ...` | Maven no encuentra dependencias | Verifica que `pom.xml` esté en `apps/backend/banca-nacional-backend/` |
| `Cannot locate specified Dockerfile` | Ruta del Dockerfile incorrecta | Revisa que `DOCKERFILE_PATH` apunte al archivo correcto |
| `ERROR: (AuthorizationFailed) ...` | Service Principal sin permisos | Verifica que el SP tenga rol `Contributor` sobre `rg-geniarh-dev` |
| `ERROR: (ResourceNotFound) ...` | Nombre de Container App o RG incorrecto | Revisa `AZURE_CONTAINER_APP` y `AZURE_RESOURCE_GROUP` en el workflow |

---

## 6. Referencias

- [Documentación del workflow backend](build-banca-nacional-backend.md)
- [Despliegue en Azure](../../architecture/azure-deployment.md)
- [Dockerfile del backend](../../../infra/docker/backend/banca-nacional-backend/Dockerfile)
