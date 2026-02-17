# Medical App Development Guide

## Project Overview
Microservice-driven medical application with Angular Ionic frontend and Spring Boot backend microservices.

## Tech Stack
### Frontend
- Angular 18+
- Ionic 8+
- TypeScript 5+
- RxJS for reactive programming
- Capacitor for mobile deployment

### Backend
- Spring Boot 3.3+
- Java 17+
- Spring Cloud Gateway (API Gateway)
- Spring Data JPA
- PostgreSQL (one database per service)
- Spring Cloud Config (configuration management)
- Eureka (service discovery) - optional
- RabbitMQ/Kafka for async messaging

### Testing
- Frontend: Jasmine, Karma, Cypress
- Backend: JUnit 5, Mockito, TestContainers, Spring Cloud Contract
- Minimum code coverage: 80%

## Architecture Principles

### Microservices Design
1. **Single Responsibility**: Each service handles one business domain
2. **Database per Service**: No shared databases between services
3. **API First**: Define OpenAPI specs before implementation
4. **Event-Driven**: Use message queues for async communication
5. **Resilience**: Implement circuit breakers, retries, and timeouts

### Project Services
1. **api-gateway**: Entry point, routing, authentication
2. **patient-service**: Patient registration, profiles, demographics
3. **appointment-service**: Scheduling, calendar management
4. **doctor-service**: Doctor profiles, specializations, availability
5. **medical-records-service**: Medical history, diagnoses, prescriptions
6. **billing-service**: Invoices, payments, insurance claims

## Code Standards

### Java/Spring Boot
- Use Java 17+ features (records, sealed classes, pattern matching)
- Follow RESTful conventions (GET, POST, PUT, DELETE)
- Use DTOs for API responses (never expose entities directly)
- Implement proper exception handling with @ControllerAdvice
- Use Lombok to reduce boilerplate
- Follow package structure:
  ```
  com.medical.{service-name}
  ├── controller
  ├── service
  ├── repository
  ├── entity
  ├── dto
  ├── mapper
  ├── exception
  └── config
  ```

### TypeScript/Angular
- Use strict mode in tsconfig.json
- Follow Angular style guide
- Use reactive forms over template-driven
- Implement proper error handling with HttpInterceptor
- Use services for business logic, components for presentation only
- Follow folder structure:
  ```
  src/app
  ├── core/         # Singleton services, guards, interceptors
  ├── shared/       # Shared components, directives, pipes
  ├── features/     # Feature modules (patients, appointments, etc.)
  └── models/       # TypeScript interfaces/types
  ```

### API Design
- Use versioning in URLs: `/api/v1/patients`
- Use plural nouns for resources
- Use HTTP status codes correctly:
  - 200: Success
  - 201: Created
  - 204: No Content
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 500: Internal Server Error
- Include pagination for list endpoints
- Use HATEOAS for resource links (optional)

## Testing Requirements

### Backend Testing
Each microservice must have:
- **Unit Tests**: Test individual methods with mocked dependencies (70%+ coverage)
- **Integration Tests**: Test with real database using TestContainers
- **Contract Tests**: Verify API contracts with Spring Cloud Contract
- **Component Tests**: Test the service in isolation with mocked external services

Example test structure:
```
src/test/java
├── unit/
│   ├── service/
│   └── mapper/
├── integration/
│   ├── repository/
│   └── controller/
└── contract/
```

### Frontend Testing
- **Unit Tests**: Test components, services, pipes (70%+ coverage)
- **Component Tests**: Test UI components with Cypress
- **E2E Tests**: Test complete user flows
- **Accessibility Tests**: Ensure WCAG 2.1 AA compliance

## Development Workflow

### When Adding New Features
1. Update OpenAPI specification first
2. Implement backend endpoint with tests
3. Implement frontend component with tests
4. Update docker-compose.yml if needed
5. Update documentation
6. Create git commit with conventional commit message

### Commit Message Format
Follow Conventional Commits:
```
feat(patient-service): add patient registration endpoint
fix(appointment): resolve double-booking issue
test(billing): add integration tests for invoice generation
docs(api): update patient API specification
```

## Security Guidelines
- Never commit secrets, API keys, or passwords
- Use environment variables for configuration
- Implement JWT authentication in API Gateway
- Validate all user inputs
- Use parameterized queries to prevent SQL injection
- Implement rate limiting
- Enable CORS properly (restrict origins in production)
- Sanitize data before logging (remove PII/PHI)

## Healthcare Compliance (HIPAA)
- Encrypt data at rest and in transit (TLS 1.2+)
- Implement audit logging for all data access
- Add patient consent management
- Implement data retention policies
- Follow minimum necessary principle
- Add access controls and role-based permissions

## Performance Guidelines
- Use caching where appropriate (Redis/Spring Cache)
- Implement database indexing
- Use connection pooling
- Optimize N+1 queries
- Implement lazy loading in frontend
- Use CDN for static assets

## Running the Application

### Local Development
```bash
# Start all services
./scripts/start-all-services.sh

# Or manually
docker-compose up -d postgres rabbitmq
cd backend/patient-service && ./mvnw spring-boot:run
cd frontend/medical-app-ui && npm start
```

### Running Tests
```bash
# Backend tests
./scripts/run-backend-tests.sh

# Frontend tests
cd frontend/medical-app-ui && npm test
```

## Helpful Commands

### Backend
```bash
# Create new microservice from template
cp -r backend/patient-service backend/new-service

# Run specific service
cd backend/{service-name} && ./mvnw spring-boot:run

# Run tests
./mvnw test

# Build Docker image
./mvnw spring-boot:build-image
```

### Frontend
```bash
# Run dev server
npm start

# Run tests
npm test

# Run e2e tests
npm run e2e

# Build for production
npm run build

# Run on mobile (iOS)
ionic capacitor run ios
```

## Common Tasks for Claude Code

### Creating New Microservice
"Create a new {service-name} microservice with CRUD operations for {entity}"

### Adding New Endpoint
"Add a new endpoint to {service-name} for {operation} with proper tests and OpenAPI documentation"

### Frontend Feature
"Create an Ionic page for {feature} with form validation, API integration, and component tests"

### Database Migration
"Create a Flyway migration for {service-name} to add {schema change}"

### Testing
"Add integration tests for {service/component} using TestContainers/Cypress"

## Notes for Claude Code
- Always read existing code before making changes
- Maintain consistency with existing patterns
- Write tests alongside implementation
- Update OpenAPI specs when changing APIs
- Follow the established folder structure
- Ask for clarification on healthcare-specific requirements
- Consider HIPAA compliance in all data handling
