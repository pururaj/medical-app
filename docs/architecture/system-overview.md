# System Architecture Overview

## High-Level Architecture

```
Client Layer (Web/Mobile)
         ↓
Angular Ionic Frontend (Port 4200)
         ↓
API Gateway (Port 8080)
         ↓
┌────────────────────────────────┐
│     Microservices Layer        │
│  - Patient Service     :8081   │
│  - Appointment Service :8082   │
│  - Doctor Service      :8083   │
│  - Medical Records     :8084   │
│  - Billing Service     :8085   │
└────────────────────────────────┘
         ↓                ↓
   PostgreSQL DBs    RabbitMQ
```

## Key Design Principles

### 1. Database per Service
Each microservice has its own PostgreSQL database for loose coupling.

### 2. API Gateway Pattern
Single entry point handling routing, authentication, and rate limiting.

### 3. Event-Driven Architecture
Services communicate asynchronously via RabbitMQ for notifications and updates.

### 4. Circuit Breaker Pattern
Resilience4j circuit breakers prevent cascading failures.

## Technology Stack

- **Frontend**: Angular 18, Ionic 8, TypeScript
- **Backend**: Spring Boot 3.3, Java 17
- **Database**: PostgreSQL 16
- **Message Queue**: RabbitMQ 3.13
- **Cache**: Redis 7
- **API Docs**: SpringDoc OpenAPI

## Communication Patterns

- **Synchronous**: REST/HTTP for CRUD operations
- **Asynchronous**: RabbitMQ for events and notifications

## Testing Strategy

- **Unit Tests**: JUnit 5, Mockito (Backend), Jasmine (Frontend)
- **Integration Tests**: TestContainers (Backend), Cypress (Frontend)
- **Component Tests**: Independent service testing
- **Coverage Target**: 80%+

## Deployment

- **Local**: Docker Compose
- **Production**: Kubernetes (planned)
