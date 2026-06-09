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

## 2. Variables de entorno del workflow

Las siguientes variables están definidas directamente en el workflow (`env:`). Si necesitas personalizarlas, edita el archivo del pipeline en:

- `pipelines/github/build-banca-nacional-backend.yml`
- `.github/workflows/build-banca-nacional-backend.yml`

| Variable | Valor por defecto | Cuándo cambiarla |
|----------|-------------------|------------------|
| `JAVA_VERSION` | `21` | Si se actualiza el proyecto a otra versión de Java |
| `JAVA_DISTRIBUTION` | `temurin` | Si se requiere otra distribución de JDK (ej. `zulu`, `corretto`) |
| `BACKEND_DIR` | `apps/backend/banca-nacional-backend` | Si se mueve el código del backend |
| `DOCKERFILE_PATH` | `infra/docker/backend/banca-nacional-backend/Dockerfile` | Si se reubica el Dockerfile |
| `IMAGE_NAME` | `banca-nacional-backend` | Si se requiere otro nombre de imagen en el ACR |

---

## 3. Verificación

Una vez configurados los secrets, prueba el workflow:

### 3.1 Ejecución manual

1. Ve a la pestaña **Actions** del repositorio.
2. Selecciona el workflow **Build & Push Backend to ACR**.
3. Haz clic en **Run workflow**.
4. Selecciona la rama `develop` y confirma.

### 3.2 Verificar la imagen en ACR

```bash
# Listar tags de la imagen
az acr repository show-tags \
  --name bancaacr \
  --repository banca-nacional-backend \
  --output table
```

Deberías ver al menos dos tags:
- `develop-latest`
- `<commit-sha>` del último push

---

## 4. Solución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `denied: requested access to the resource is denied` | Credenciales de ACR incorrectas | Revisa `ACR_LOGIN_SERVER`, `ACR_USERNAME` y `ACR_PASSWORD` en los secrets |
| ` unauthorized: authentication required` | Usuario administrador deshabilitado | Habilita el admin del ACR con `az acr update --name <acr> --admin-enabled true` |
| `Could not find artifact ...` | Maven no encuentra dependencias | Verifica que `pom.xml` esté en `apps/backend/banca-nacional-backend/` |
| `Cannot locate specified Dockerfile` | Ruta del Dockerfile incorrecta | Revisa que `DOCKERFILE_PATH` apunte al archivo correcto |

---

## 5. Referencias

- [Documentación del workflow backend](build-banca-nacional-backend.md)
- [Despliegue en Azure](../../architecture/azure-deployment.md)
- [Dockerfile del backend](../../../infra/docker/backend/banca-nacional-backend/Dockerfile)
