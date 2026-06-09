# Banca Nacional — Syn Factoría

Plataforma bancaria moderna con arquitectura de microservicios y microfrontends, desplegada en Azure con infraestructura como código.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Java 21 + Spring Boot 3.3 |
| Frontend | Angular 21 |
| Base de datos | MySQL 8.0 (Azure Flexible Server) |
| Infraestructura | Terraform + Azure |
| Frontend hosting | Azure Static Web Apps (Free) |
| Backend hosting | Azure Container Apps (Consumption) |
| Contenedores | Azure Container Registry |
| Mensajería | Apache Kafka |
| API Contracts | OpenAPI 3.0 |
| Performance | JMeter |

## Estructura

```
apps/
├── backend/banca-nacional-backend/   # API REST (Spring Boot, Maven)
├── frontend/banca-nacional-frontend/ # SPA (Angular)
└── prototype/                        # Diseños y prototipos

infra/
├── terraform/    # IaC (Azure)
├── database/     # SQL scripts
├── docker/       # Dockerfiles
└── k8s/          # Kubernetes manifests

contracts/
├── openapi/      # Contratos de API (fuente de verdad)
└── schemas/      # JSON Schemas

scripts/          # Automatización (bash)
docs/             # Documentación técnica
tests/jmeter/     # Planes de prueba de performance
```

## Quick Start

```bash
# Backend
cd apps/backend/banca-nacional-backend
./mvnw spring-boot:run

# Frontend
cd apps/frontend/banca-nacional-frontend
npm install && npm start
```

## Infraestructura

Ver `infra/terraform/` para desplegar en Azure. Costo estimado: **~$33/mes** (dev scale-to-zero).

```bash
scripts/terraform/run.sh init --profile dev
scripts/terraform/run.sh plan --profile dev
scripts/terraform/run.sh apply --profile dev
```
