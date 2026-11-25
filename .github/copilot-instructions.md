# Copilot Instructions - Medical App Codebase

## Architecture Overview

This is a microservices-based medical application combining Angular 18 + Ionic 8 frontend with Spring Boot 3.3 backend services.

**Service Layer:**
- **API Gateway** (Port 8080): Spring Cloud Gateway - single entry point, handles routing & circuit breakers
- **Patient Service** (Port 8081): Patient CRUD, profiles, family members
- **Appointment Service** (Port 8082): Scheduling, calendar management
- **Doctor Service** (Port 8083): Doctor profiles, specializations
- **Medical Records Service** (Port 8084): Medical history, diagnoses
- **Billing Service** (Port 8085): Invoicing, payments
- **Auth Service** (Port 8086): Authentication/JWT tokens
- **Inventory Service** (Port 8087): Inventory management

**Infrastructure:** PostgreSQL (one database per service), RabbitMQ (async messaging), Redis (caching)

## Critical Developer Workflows

### Backend Build & Deployment
```bash
# Full backend build (all services + parent pom)
./scripts/build-backend.sh

# Start infrastructure (PostgreSQL, RabbitMQ, Redis, pgAdmin)
./scripts/start-infrastructure.sh

# Start individual services
./scripts/start-patient-service.sh
./scripts/start-api-gateway.sh
./scripts/start-frontend.sh
```

### Frontend Development
```bash
cd frontend/medical-app-ui
npm start              # Dev server at http://localhost:4200
npm test               # Run tests with coverage
ng build --prod        # Production build
```

### Testing
- Backend: `./scripts/run-backend-tests.sh` (JUnit 5, Mockito, TestContainers)
- Frontend: `npm test` (Jasmine/Karma) + `npm run playwright` (E2E)
- Minimum coverage: 80%

## Backend Code Patterns

### Service Architecture (com.medical.{service-name})
```
controller/          # @RestController with OpenAPI docs
service/             # @Service with business logic  
repository/          # @Repository extending JpaRepository
entity/              # JPA @Entity classes
dto/                 # Data transfer objects with validation
mapper/              # MapStruct mappers for DTO conversion
exception/           # Custom exceptions
config/              # Service-specific configuration
```

### API Response Pattern
All endpoints return wrapped responses via shared library:
```java
// Success response
ApiResponse.success("message", data)    // With data
ApiResponse.success(data)               // Implicit message

// Error responses use @ControllerAdvice with GlobalExceptionHandler
```

### DTO Requirements
- Use `@Data @Builder @NoArgsConstructor @AllArgsConstructor` (Lombok)
- Validate with Jakarta validation: `@NotNull`, `@Email`, `@Pattern`, `@Size`, `@Past`
- Never expose entities directly; always map to DTOs
- Request/Response DTOs kept separate from entity classes

### Pagination Pattern
```java
// Always paginate list endpoints
PageResponse<PatientDto> patients = service.getAllPatients(page, size, sortBy, sortDirection);
// Returns: { content: [...], totalElements, totalPages, pageNumber, pageSize }
```

### RESTful Conventions
- POST `/api/v1/{resource}` → Create (201 Created)
- GET `/api/v1/{resource}/{id}` → Read by ID (200)
- GET `/api/v1/{resource}` → List with pagination (200)
- GET `/api/v1/{resource}/search?keyword=...` → Search (200)
- PUT `/api/v1/{resource}/{id}` → Update (200)
- DELETE `/api/v1/{resource}/{id}` → Delete (204 No Content)

### OpenAPI Documentation
All controllers must have:
```java
@Tag(name = "Resource Name", description = "Description")
@Operation(summary = "What this does")
@ApiResponse(responseCode = "200", description = "Success response")
```

## Frontend Code Patterns

### Component Architecture (src/app/)
```
core/              # Singleton: guards, interceptors, services
  guards/          # authGuard for route protection
  interceptors/    # HttpInterceptor for auth headers, error handling
  services/        # API services (AuthService, ApiService)
features/          # Feature modules (patients, appointments, doctors)
  {feature}/
    {feature}.page.ts        # Standalone component (page container)
    {feature}.service.ts     # Feature-specific API service
    {feature}.routes.ts      # Child route definitions
shared/            # Shared components, pipes, directives
models/            # TypeScript interfaces
```

### Standalone Components & Lazy Loading
- All components use `@Component({ standalone: true })` (Angular 18)
- Routes use `loadComponent()` and `loadChildren()` for code splitting
- Lazy-load by feature module via `{feature}.routes.ts` files

### Reactive Forms Pattern
```typescript
// Use FormBuilder, not template-driven forms
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  phone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9]{10,20}$/)]]
});
```

### HTTP Error Handling
- Global HttpInterceptor in [core/interceptors](frontend/medical-app-ui/src/app/core/interceptors) catches errors
- Toast notifications via ToastService for user feedback
- Service methods return Observables; component subscribes via async pipe

### Route Guards
```typescript
// authGuard checks JWT token in localStorage
// All protected routes use: canActivate: [authGuard]
```

## Shared Library Pattern

[backend/shared-library](backend/shared-library) contains reusable components:
- `ApiResponse<T>` - Standardized API response wrapper
- `PageResponse<T>` - Pagination response structure
- Common DTOs used across services
- Custom exceptions

Import in services via:
```xml
<dependency>
    <groupId>com.medical</groupId>
    <artifactId>shared-library</artifactId>
</dependency>
```

## Testing Requirements

### Backend (Unit + Integration)
- **Unit Tests**: Mock dependencies, use `@ExtendWith(MockitoExtension.class)`
- **Integration Tests**: Use TestContainers for PostgreSQL, `@DataJpaTest`
- Test location: `src/test/java/{unit,integration,contract}/`
- Minimum: 80% coverage

### Frontend
- Component tests: Mock services, test user interactions
- E2E tests: Playwright for full workflows
- Location: `e2e/` folder with `*.spec.ts` files

## Key Dependencies & Versions

**Backend:**
- Spring Boot 3.3.0, Spring Cloud 2023.0.1
- Java 17, Maven 3.9+
- Lombok 1.18.32, MapStruct 1.5.5, SpringDoc 2.5.0
- TestContainers 1.19.8, Mockito

**Frontend:**
- Angular 18, TypeScript 5, RxJS 7.8
- Ionic 8, Capacitor 6
- Node.js 18+, npm 10+

## Configuration & Secrets

- **Backend**: `application.yml` in each service; use environment variables for secrets
- **Frontend**: `environment.ts` / `environment.prod.ts`; API_URL configurable per environment
- **Never commit**: `.env` files, API keys, passwords - use environment variables only

## Common Commands Reference

| Task | Command |
|------|---------|
| Build all backend | `./scripts/build-backend.sh` |
| Test backend | `./scripts/run-backend-tests.sh` |
| Start infrastructure | `./scripts/start-infrastructure.sh` |
| Start patient service | `./scripts/start-patient-service.sh` |
| Frontend dev server | `cd frontend/medical-app-ui && npm start` |
| Frontend tests | `npm test` (unit) + `npm run playwright` (E2E) |

## Debugging Tips

- **Patient Service logs**: Check for database migration errors (Flyway)
- **API Gateway issues**: Verify routing config in `application.yml`
- **Frontend API 404s**: Check API Gateway forwarding rules
- **RabbitMQ messages**: Inspect via management UI at http://localhost:15672 (admin/admin)
- **Database issues**: Use pgAdmin at http://localhost:5050

## Commit Message Format

Follow Conventional Commits:
```
feat(patient-service): add patient registration endpoint
fix(appointment): resolve double-booking issue
test(billing): add invoice generation tests
docs(api): update patient API specification
```

## When Adding New Features

1. **Backend**: Update API contract → implement endpoint → add tests → update OpenAPI docs
2. **Frontend**: Add component/service → add tests → integrate with feature routes
3. **Infrastructure**: Update `docker-compose.yml` if new services/databases needed
4. **Documentation**: Update README or CLAUDE.md with new endpoints/features
