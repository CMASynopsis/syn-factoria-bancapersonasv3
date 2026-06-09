# Workflow: Build & Push Backend to ACR

Ubicación del workflow: `.github/workflows/build-banca-nacional-backend.yml`

---

## Propósito

Compila el backend `banca-nacional-backend` (Java 21 + Spring Boot) y publica su imagen Docker en el Azure Container Registry (ACR) cada vez que se actualiza la rama `develop`.

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

---

## Jobs

### `build-and-push`

Ejecuta en `ubuntu-latest` con permisos de lectura de contenido y escritura de paquetes.

#### Pasos

1. **Checkout repository** — `actions/checkout@v4`
2. **Set up JDK 21** — `actions/setup-java@v4` con cache de Maven
3. **Build with Maven** — Compila el JAR ejecutable:
   ```bash
   mvn clean package -DskipTests -B
   ```
4. **Set up Docker Buildx** — `docker/setup-buildx-action@v3`
5. **Log in to Azure Container Registry** — `azure/docker-login@v2` usando secrets del repositorio
6. **Build and push Docker image** — Construye la imagen con el Dockerfile multi-stage y publica dos tags:
   - `<acr-login-server>/banca-nacional-backend:develop-latest`
   - `<acr-login-server>/banca-nacional-backend:<commit-sha>`

---

## Secrets requeridos

Configúralos en **Settings → Secrets and variables → Actions** del repositorio.

| Secret | Descripción |
|--------|-------------|
| `ACR_LOGIN_SERVER` | Servidor del Azure Container Registry, ej. `bancaacr.azurecr.io` |
| `ACR_USERNAME` | Nombre de usuario del ACR (admin user) |
| `ACR_PASSWORD` | Contraseña del ACR (admin password) |

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
- El workflow está duplicado desde `pipelines/github/build-banca-nacional-backend.yml` (fuente de verdad del proyecto) hacia `.github/workflows/` para que GitHub lo detecte y ejecute.
