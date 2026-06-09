# Workflow: Build & Push Backend to ACR

Ubicación del workflow: `.github/workflows/build-banca-nacional-backend.yml`

---

## Propósito

Compila el backend `banca-nacional-backend` (Java 21 + Spring Boot), publica su imagen Docker en el Azure Container Registry (ACR) y actualiza el **Azure Container App** para usar la nueva imagen cada vez que se actualiza la rama `develop`.

---

## Disparadores

| Evento | Condición |
|--------|-----------|
| `push` a `develop` | Solo si cambian archivos en:<br>`apps/backend/**`, `infra/docker/backend/**` o `contracts/**` |
| `workflow_dispatch` | Ejecución manual desde la pestaña **Actions** de GitHub |

---

## Variables de entorno

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `JAVA_VERSION` | `21` | Versión del JDK |
| `JAVA_DISTRIBUTION` | `temurin` | Distribución del JDK (Eclipse Temurin) |
| `BACKEND_DIR` | `apps/backend/banca-nacional-backend` | Directorio del proyecto Maven |
| `DOCKERFILE_PATH` | `infra/docker/backend/banca-nacional-backend/Dockerfile` | Ruta al Dockerfile multi-stage |
| `IMAGE_NAME` | `banca-nacional-backend` | Nombre de la imagen en el ACR |
| `AZURE_RESOURCE_GROUP` | `rg-geniarh-dev` | Resource Group donde Terraform desplegó la infraestructura |
| `AZURE_CONTAINER_APP` | `banca-nacional-be-development` | Nombre del Azure Container App del backend |

---

## Jobs

### `build`

Compila el proyecto Maven y valida que el JAR se genera correctamente.

| Propiedad | Valor |
|-----------|-------|
| Runner | `ubuntu-latest` |
| Permisos | `contents: read` |
| Dependencias | Ninguna |

#### Pasos

1. **Checkout repository** — `actions/checkout@v6`
2. **Set up JDK 21** — `actions/setup-java@v5` con cache de Maven
3. **Build with Maven** — Compila el JAR ejecutable:
   ```bash
   mvn clean package -DskipTests -B
   ```

---

### `docker`

Construye la imagen Docker con el Dockerfile multi-stage y la publica en el ACR.

| Propiedad | Valor |
|-----------|-------|
| Runner | `ubuntu-latest` |
| Permisos | `contents: read`, `packages: write` |
| Dependencias | `build` (debe completarse con éxito) |

#### Pasos

1. **Checkout repository** — `actions/checkout@v6`
2. **Set up Docker Buildx** — `docker/setup-buildx-action@v4`
3. **Log in to Azure Container Registry** — `docker/login-action@v3` usando secrets del repositorio
4. **Build and push Docker image** — Construye y publica dos tags:
   - `<acr-login-server>/banca-nacional-backend:develop-latest`
   - `<acr-login-server>/banca-nacional-backend:<commit-sha>`

---

### `deploy`

Actualiza el Azure Container App para que use la imagen recién publicada.

| Propiedad | Valor |
|-----------|-------|
| Runner | `ubuntu-latest` |
| Permisos | `contents: read` |
| Dependencias | `docker` (debe completarse con éxito) |

#### Pasos

1. **Log in to Azure** — `azure/login@v2` usando el Service Principal configurado en `AZURE_CREDENTIALS`
2. **Update Azure Container App** — Actualiza la imagen del Container App para que use el tag del commit:
   ```bash
   az containerapp update \
     --name banca-nacional-be-development \
     --resource-group rg-geniarh-dev \
     --image <acr-login-server>/banca-nacional-backend:<commit-sha>
   ```

---

## Secrets requeridos

Configúralos en **Settings → Secrets and variables → Actions** del repositorio.

| Secret | Descripción |
|--------|-------------|
| `ACR_LOGIN_SERVER` | Servidor del Azure Container Registry, ej. `bancanacionalacrdevelopment.azurecr.io` |
| `ACR_USERNAME` | Nombre de usuario del ACR (admin user) |
| `ACR_PASSWORD` | Contraseña del ACR (admin password) |
| `AZURE_CREDENTIALS` | JSON completo del Service Principal de Azure con permisos `Contributor` sobre el resource group |

> Ver [installation.md](installation.md) para instrucciones detalladas de cómo crear el Service Principal y registrar los secrets.

---

## Tags publicados

| Tag | Uso |
|-----|-----|
| `develop-latest` | Última versión estable de la rama `develop`; referencia fija para despliegues |
| `<commit-sha>` | Imagen inmutable vinculada a un commit específico; permite trazabilidad y rollback |

---

## Notas

- El contexto de build de Docker es `apps/backend/banca-nacional-backend/` (donde reside `pom.xml` y `src/`).
- El Dockerfile se referencia con la ruta absoluta `${{ github.workspace }}/${{ env.DOCKERFILE_PATH }}` para que Docker lo encuentre desde el contexto correcto.
- El Container App se actualiza con el tag `<commit-sha>` (inmutable) en lugar de `develop-latest` para garantizar que el despliegue sea reproducible y trazable.
