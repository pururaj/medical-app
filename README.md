# Medical App - Microservices Architecture

A comprehensive medical application built with Angular Ionic frontend and Spring Boot microservices backend.

## 🏗️ Architecture

This application follows a microservices architecture pattern with:

- **Frontend**: Angular 18 + Ionic 8 (Mobile-first PWA)
- **Backend**: Spring Boot 3.3 microservices
- **API Gateway**: Spring Cloud Gateway
- **Databases**: PostgreSQL (one per service)
- **Message Queue**: RabbitMQ
- **Cache**: Redis

## 📁 Project Structure

```
medical-app/
├── frontend/
│   └── medical-app-ui/          # Angular Ionic app
├── backend/
│   ├── api-gateway/             # Spring Cloud Gateway (Port 8080)
│   ├── patient-service/         # Patient management (Port 8081)
│   ├── appointment-service/     # Appointments (Port 8082)
│   ├── doctor-service/          # Doctor profiles (Port 8083)
│   ├── medical-records-service/ # Medical history (Port 8084)
│   ├── billing-service/         # Billing & payments (Port 8085)
│   └── shared-library/          # Common DTOs, exceptions
├── scripts/                     # Helper scripts
├── docs/                        # Documentation
├── docker-compose.yml           # Infrastructure
└── CLAUDE.md                    # Claude Code guidelines
```

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+
- Docker & Docker Compose

### 1. Start Infrastructure

```bash
./scripts/start-infrastructure.sh
```

### 2. Build Backend

```bash
./scripts/build-backend.sh
```

### 3. Start Services

```bash
./scripts/start-patient-service.sh
./scripts/start-api-gateway.sh
```

### 4. Setup Frontend

```bash
./scripts/setup-frontend.sh
./scripts/start-frontend.sh
```

## 📊 Microservices

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 8080 | Entry point, routing |
| Patient Service | 8081 | Patient management |
| Appointment Service | 8082 | Appointment scheduling |
| Doctor Service | 8083 | Doctor profiles |
| Medical Records | 8084 | Medical history |
| Billing Service | 8085 | Billing & payments |

## 🔗 Service URLs

- **Frontend**: http://localhost:4200
- **API Gateway**: http://localhost:8080
- **Swagger (Patient)**: http://localhost:8081/swagger-ui.html
- **RabbitMQ Management**: http://localhost:15672 (admin/admin)
- **pgAdmin**: http://localhost:5050 (admin@medicalapp.com/admin)

## 🧪 Testing

```bash
# Backend tests
./scripts/run-backend-tests.sh

# Frontend tests
cd frontend/medical-app-ui
npm test
```

## 📚 Documentation

- [CLAUDE.md](CLAUDE.md) - Claude Code development guide
- [Architecture](docs/architecture/system-overview.md) - System architecture
- [API Documentation](http://localhost:8081/swagger-ui.html) - API specs

## 🛠️ Development with Claude Code

This project is optimized for development with Claude Code. The [CLAUDE.md](CLAUDE.md) file contains comprehensive guidelines for:

- Code standards and conventions
- Testing requirements
- Security guidelines (HIPAA compliance)
- Common development tasks
- Project-specific patterns

### Example Claude Code Prompts

```
"Add a new endpoint to patient-service for searching patients by name"

"Create appointment-service with CRUD operations for appointments"

"Implement a patient registration form in the frontend with validation"

"Add integration tests for patient-service using TestContainers"

"Create a Flyway migration to add a new column to patients table"
```

## 🔒 Security

- JWT authentication (API Gateway)
- HTTPS/TLS in production
- Input validation
- SQL injection prevention
- HIPAA compliance considerations

## 📝 License

Apache 2.0

---

**Built with Claude Code** 🤖
