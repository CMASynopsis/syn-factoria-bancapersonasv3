# Despliegue en Azure — Banca Nacional

## Stack

| Capa     | Stack                                                                  |
| -------- | ---------------------------------------------------------------------- |
| Backend  | Java 21 + Spring Boot 3.3.5 + Maven → JAR                             |
| Frontend | Angular 21 + TypeScript + Signals → `dist/banca-frontend/` (SPA)       |
| BD       | MySQL 5.7 vía JDBC + HikariCP                                          |
| Auth     | JWT (jjwt 0.12.5) + Spring Security                                   |

---

## Arquitectura objetivo (menor costo)

```
Internet
   │
   ├── Azure Static Web Apps (Free) ─── Frontend Angular 21
   │       │
   │       └── /api/* → Azure Container Apps (Consumption) ─── Backend Spring Boot
   │                                                                    │
   │                                                                    └── Azure Database for MySQL (B1ms)
   │
   └── Azure Container Registry (Basic) ─── Imágenes Docker
```

---

## Backend — Azure Container Apps (Consumption)

### Dockerfile

Crear `apps/backend/banca-nacional-backend/Dockerfile`:

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Build + push

```bash
mvn clean package -DskipTests

az acr create --name bancaacr --resource-group banca-rg --sku Basic --admin-enabled true
az acr build --registry bancaacr --image banca-backend:latest --file Dockerfile .
```

### Crear Container App

```bash
az containerapp create \
  --name banca-backend \
  --resource-group banca-rg \
  --environment banca-env \
  --image bancaacr.azurecr.io/banca-backend:latest \
  --registry-server bancaacr.azurecr.io \
  --ingress external \
  --target-port 8080 \
  --env-vars \
    SPRING_DATASOURCE_URL="jdbc:mysql://banca-mysql.mysql.database.azure.com:3306/banca_db?useSSL=true" \
    SPRING_DATASOURCE_USERNAME="banca_user" \
    SPRING_DATASOURCE_PASSWORD="<password>" \
    APP_JWT_SECRET="<secret>" \
    APP_CORS_ALLOWED_ORIGINS="https://<frontend-url>" \
  --min-replicas 0 \
  --max-replicas 3 \
  --cpu 0.25 \
  --memory 0.5Gi
```

`--min-replicas 0` escala a cero cuando no hay tráfico. Conecta la app vía **Sticky Sessions** si se requiere estado de sesión, o configura el frontend para proxy inverso de `/api/*`.

### application.properties para Azure

Crear `src/main/resources/application-azure.properties`:

```properties
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
app.jwt.secret=${APP_JWT_SECRET}
app.cors.allowed-origins=${APP_CORS_ALLOWED_ORIGINS}
```

Activar con: `--spring.profiles.active=azure`

---

## Frontend — Azure Static Web Apps (Free)

### Build

```bash
npm install --legacy-peer-deps
npx ng build --configuration production
# Output: dist/banca-frontend/
```

### Vincular backend

En el frontend, configurar el proxy hacia el backend usando un  `proxy.conf.json` para desarrollo local y en producción configurar la ruta `/api` en Static Web Apps:

```json
{
  "/api/*": {
    "target": "https://banca-backend.<region>.azurecontainerapps.io",
    "changeOrigin": true
  }
}
```

### Despliegue con SWA CLI

```bash
npm install -g @azure/static-web-apps-cli

swa deploy \
  --app-location dist/banca-frontend \
  --output-location . \
  --api-location . \
  --deployment-token <token>
```

O desde Azure Portal: conectar repo → Static Web Apps detecta automáticamente Angular y configura el build.

La capa **Free** incluye:
-   SSL/TLS automático
-   CDN global (100 GB/mes)
-   Dominio personalizado
-   100.000 solicitudes/mes
-   250 MB de ancho de banda

---

## Base de datos — Azure Database for MySQL Flexible Server

```bash
az mysql flexible-server create \
  --name banca-mysql \
  --resource-group banca-rg \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 20 \
  --storage-auto-grow Enabled \
  --admin-user banca_admin \
  --admin-password "<password>" \
  --public-access 0.0.0.0 \
  --version 5.7
```

Crear esquema:

```bash
mysql -h banca-mysql.mysql.database.azure.com -u banca_admin -p < infra/database/banca_db_mysql57.sql
```

---

## CI/CD (GitHub Actions — mínimo presupuesto)

Dos workflows independientes, ejecutándose solo en push a `main`:

### backend.yml

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths: ['apps/backend/**']

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      - run: mvn clean package -DskipTests
        working-directory: apps/backend/banca-nacional-backend
      - uses: azure/docker-login@v2
        with:
          login-server: ${{ secrets.ACR_LOGIN_SERVER }}
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}
      - run: |
          docker build -t ${{ secrets.ACR_LOGIN_SERVER }}/banca-backend:latest .
          docker push ${{ secrets.ACR_LOGIN_SERVER }}/banca-backend:latest
        working-directory: apps/backend/banca-nacional-backend
      - run: |
          az containerapp update \
            --name banca-backend \
            --resource-group banca-rg \
            --image ${{ secrets.ACR_LOGIN_SERVER }}/banca-backend:latest
```

### frontend.yml

```yaml
name: Deploy Frontend
on:
  push:
    branches: [main]
    paths: ['apps/frontend/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci && npx ng build --configuration production
        working-directory: apps/frontend/banca-nacional-frontend
      - uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.SWA_TOKEN }}
          action: upload
          app_location: apps/frontend/banca-nacional-frontend/dist/banca-frontend
```

---

## FinOps — Presupuesto Mínimo Absoluto

### Costos estimados por mes (USD)

| Servicio                            | SKU / Plan         | Costo/mes   |
| ----------------------------------- | ------------------ | ----------- |
| Static Web Apps                     | Free               | **$0**      |
| Container Apps (Backend)            | Consumption        | **~$15**    |
| Azure Database for MySQL            | B1ms Burstable     | **~$13**    |
| Container Registry                  | Basic              | **$5**      |
| GitHub Actions                      | Free (2000 min/mes)| **$0**      |
| **Total**                           |                    | **~$33**    |

### Desglose Backend (Container Apps Consumption)

| Concepto                | Costo aproximado |
| ----------------------- | ---------------- |
| vCPU 0.25 (por segundo) | ~$7.50           |
| Memoria 0.5Gi (base)    | ~$3.00           |
| Ejecuciones             | ~$1.00           |
| Transferencia de datos  | ~$0.50           |
| Subtotal                | ~$12.00-15.00    |

Se escala a cero (`minReplicas: 0`) fuera de horario laboral — un entorno de desarrollo sin tráfico nocturno o de fin de semana cuesta **cerca de $0** en cómputo.

### Cómo reducir aún más

| Estrategia                                  | Ahorro     | Nuevo total |
| ------------------------------------------- | ---------- | ----------- |
| **Backend en Azure Functions Consumption**  | -$10       | ~$23        |
| **MySQL en B1s VM autogestionada**          | -$5        | ~$28        |
| **Todo en una VM B1s ($8/mes)**             | -$25       | ~$8         |
| **Solo Static Web Apps + Functions**        | -$13 (BD)  | $0-5        |

> **Recomendación mínima:** Static Web Apps (Free) + Container Apps (Consumption, scale-to-zero) + MySQL B1ms. Por ~$33/mes tienes un entorno productivo cloud-native con HA básica, SSL automático y escalado elástico. Es el punto óptimo entre _menor costo_ y _menor carga operativa_.

### Tracking de costos

```bash
# Budget alert mensual
az consumption budget create \
  --budget-name banca-monthly \
  --amount 50 \
  --time-grain monthly \
  --start-date $(date +%Y-%m-01) \
  --category cost

# Etiquetar recursos para tracking
az resource tag --tags Project=Banca-Nacional Environment=Production \
  --ids /subscriptions/<sub>/resourceGroups/banca-rg
```

Para monitoreo diario: [Cost Management + Billing](https://portal.azure.com/#view/Microsoft_Azure_Cost/Menu) en Azure Portal — configurar vista por `resourceGroup` y `Environment` tag.
