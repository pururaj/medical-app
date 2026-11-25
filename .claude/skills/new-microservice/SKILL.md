---
name: new-microservice
description: Scaffold a new Spring Boot microservice in backend/ (modelled on lab-service) and wire it into every place the repo needs - parent pom, API gateway route, local + prod docker-compose, CI matrix, frontend proxy. Use when the user asks to create/add a new backend service or module (e.g. "create a radiology service", "add billing-service").
---

# New microservice

Reference implementation: `backend/lab-service` (newest, cleanest). Read it before generating anything.

## 1. Pick identifiers

Ask the user only for what you can't infer: the domain name and main entities.

| Thing | Convention | Example |
|---|---|---|
| Folder / artifactId | `<domain>-service` | `radiology-service` |
| Package | `com.medical.<domain>` | `com.medical.radiology` |
| URL prefix | `/api/v1/<domain>/...` (plural resources below it) | `/api/v1/radiology/scans` |
| DB name | `<domain>_db` | `radiology_db` |

**Ports** — check what's taken before choosing; never reuse:
```bash
grep -rhoE "port: *[0-9]{4}" backend/*/src/main/resources/application.yml | sort -u
grep -oE '"[0-9]{4}:5432"' docker-compose.yml
```
Known: gateway 8080, patient 8081, appointment 8082, doctor 8083, medical-records 8084, billing 8085, auth 8086, inventory 8087, pharmacy 8088, lab 8089. DB host ports 5432–5440 (lab = 5440). Next free service port is normally 8090, DB port 5441.

## 2. Generate the service

```
backend/<domain>-service/
├── Dockerfile                      # copy lab-service's, change jar name + EXPOSE
├── pom.xml                         # parent = medical-app-parent; same deps as lab-service
└── src/main/
    ├── java/com/medical/<domain>/
    │   ├── <Domain>ServiceApplication.java   # @SpringBootApplication + @EnableJpaAuditing
    │   ├── config/CorsConfig.java
    │   ├── controller/ entity/ dto/ repository/ service/
    └── resources/
        ├── application.yml         # port, datasource on the new DB port, ddl-auto: validate, flyway on
        └── db/migration/V1__init_<table>.sql
```

- Use `@SpringBootApplication(scanBasePackages = {"com.medical.<domain>", "com.medical.shared"})` + `@EnableJpaAuditing` so the shared `GlobalExceptionHandler` is registered. (lab-service uses a plain `@SpringBootApplication`, so the shared handler is likely not active there — don't copy that.)
- For the CRUD layers follow the `backend-crud` skill.
- Add test deps now (testcontainers postgresql + junit-jupiter, jacoco plugin) by copying from `backend/patient-service/pom.xml` — lab-service is missing them.

## 3. Wire it in (the step that usually gets forgotten)

Do every item; tick them off in your reply.

1. `backend/pom.xml` → add `<module><domain>-service</module>`.
2. `backend/api-gateway/src/main/resources/application.yml` → add a route block in the same shape as `lab-service` (Path predicate + RewritePath).
3. `docker-compose.yml` → add a `<domain>-db` postgres service (copy `inventory-db`, change container_name, POSTGRES_DB, host port, volume). Note: `lab-db` is currently missing here — offer to add it if you notice.
4. `docker-compose.services.yml` → add the service if other services are listed there.
5. `deploy/docker-compose.prod.yml` → add both `<domain>-db` and `<domain>-service` (copy the lab blocks; DB password stays `${DB_PASSWORD}`).
6. `.github/workflows/backend-ci-cd.yml` → add to the `-pl` module list, the artifact paths, the service matrix (name + port), and the deploy/pull lists (grep `lab-service` to find all spots).
7. Frontend needs no proxy change (`/api` already goes to the gateway) — just confirm the path is under `/api/v1/`.
8. Update the project memory / README port list.

## 4. Verify

Build only the new module + shared-library. Match the JDK image to `<java.version>` in `backend/pom.xml` (it was recently changed — don't assume 17):
```bash
cd backend && docker run --rm -v "$(pwd)":/app -v "$HOME/.m2":/root/.m2 -w /app maven:3.9-eclipse-temurin-<JAVA_VERSION> mvn -pl shared-library,<domain>-service -am package -DskipTests -q
```
Also check the Dockerfile base image uses the same Java version.

Suggested commit: `feat(<domain>-service): scaffold <domain> microservice`
