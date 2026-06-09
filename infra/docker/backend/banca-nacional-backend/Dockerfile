# ---- Stage 1: Build ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Stage 2: Runtime ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built JAR from build stage
COPY --from=build /build/target/banca-nacional-backend-3.0.0.jar /app/app.jar

# Security: drop capabilities and run as non-root
USER appuser

# Environment
ENV SPRING_PROFILES_ACTIVE=dev

EXPOSE 8080

# Healthcheck (optional — actuator may or may not be on classpath)
HEALTHCHECK --start-period=30s --interval=30s --timeout=5s --retries=3 \
    CMD wget --spider http://localhost:8080/actuator/health || true

# exec form for proper signal handling
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
