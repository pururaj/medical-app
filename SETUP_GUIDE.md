# Medical App - Complete Setup Guide

This guide will help you install all prerequisites and run the medical app locally.

## 📋 Prerequisites to Install

### 1. Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Java 17
```bash
# Using Homebrew
brew install openjdk@17

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
java --version
```

Expected output:
```
openjdk 17.x.x
```

### 3. Install Maven
```bash
brew install maven

# Verify installation
mvn --version
```

Expected output:
```
Apache Maven 3.9.x
```

### 4. Install Node.js and npm
```bash
brew install node@20

# Verify installation
node --version
npm --version
```

Expected output:
```
v20.x.x
10.x.x
```

### 5. Install Docker Desktop for Mac
```bash
# Download from Docker website
# OR using Homebrew
brew install --cask docker

# After installation, open Docker Desktop application
# Wait for Docker to start (you'll see the whale icon in the menu bar)

# Verify installation
docker --version
docker compose version
```

Expected output:
```
Docker version 25.x.x
Docker Compose version v2.x.x
```

---

## 🚀 Running the Application

Once all prerequisites are installed, follow these steps:

### Step 1: Start Infrastructure Services

```bash
cd /Users/pururajharichandan/Documents/Practice/vs-dev/medical-app

# Start PostgreSQL, RabbitMQ, Redis
docker compose up -d

# Wait about 30 seconds for services to be ready
# Check status
docker compose ps
```

You should see all services running:
- patient-db
- appointment-db
- doctor-db
- medical-records-db
- billing-db
- rabbitmq
- redis
- pgadmin

### Step 2: Build Backend Services

```bash
# Build all backend services
cd backend

# Build parent POM and shared library
mvn clean install

# This will build:
# - shared-library
# - patient-service
# - api-gateway
```

### Step 3: Start Backend Services

**Terminal 1 - Patient Service:**
```bash
cd backend/patient-service
mvn spring-boot:run
```

Wait for this message:
```
Started PatientServiceApplication in X seconds
```

**Terminal 2 - API Gateway:**
```bash
cd backend/api-gateway
mvn spring-boot:run
```

Wait for this message:
```
Started ApiGatewayApplication in X seconds
```

### Step 4: Setup and Start Frontend

**Terminal 3 - Frontend:**
```bash
cd frontend/medical-app-ui

# Install dependencies (first time only)
npm install

# Start development server
npm start
```

Wait for:
```
✔ Browser application bundle generation complete.
** Angular Live Development Server is listening on localhost:4200 **
```

---

## 🔗 Access the Application

Once everything is running, you can access:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend App** | http://localhost:4200 | - |
| **API Gateway** | http://localhost:8080 | - |
| **Patient Service** | http://localhost:8081/api/v1/patients | - |
| **Swagger UI (Patient)** | http://localhost:8081/swagger-ui.html | - |
| **API Health Check** | http://localhost:8081/actuator/health | - |
| **RabbitMQ Management** | http://localhost:15672 | admin/admin |
| **pgAdmin** | http://localhost:5050 | admin@medicalapp.com/admin |

---

## 🧪 Testing the Application

### Test Patient Service API

**Create a patient:**
```bash
curl -X POST http://localhost:8081/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA"
  }'
```

**Get all patients:**
```bash
curl http://localhost:8081/api/v1/patients
```

**Get patient by ID:**
```bash
curl http://localhost:8081/api/v1/patients/1
```

**Search patients:**
```bash
curl "http://localhost:8081/api/v1/patients/search?keyword=john"
```

### Or Use Swagger UI

Open http://localhost:8081/swagger-ui.html in your browser and test all endpoints interactively.

---

## 🛑 Stopping the Application

### Stop Backend Services
Press `Ctrl+C` in each terminal running the backend services.

### Stop Infrastructure
```bash
cd /Users/pururajharichandan/Documents/Practice/vs-dev/medical-app
docker compose down
```

To also remove data volumes:
```bash
docker compose down -v
```

### Stop Frontend
Press `Ctrl+C` in the terminal running the frontend.

---

## 🐛 Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### Docker Not Running

Make sure Docker Desktop is running:
1. Open Docker Desktop application
2. Wait for the whale icon to appear in menu bar
3. Check status with: `docker ps`

### Database Connection Failed

1. Check if infrastructure is running:
   ```bash
   docker compose ps
   ```

2. Check database logs:
   ```bash
   docker logs patient-db
   ```

3. Restart infrastructure:
   ```bash
   docker compose down
   docker compose up -d
   ```

### Maven Build Fails

Clear Maven cache and rebuild:
```bash
cd backend
mvn clean install -U
```

### Node Modules Error

Delete node_modules and reinstall:
```bash
cd frontend/medical-app-ui
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Checking Service Health

### Backend Services Health
```bash
# Patient Service
curl http://localhost:8081/actuator/health

# API Gateway
curl http://localhost:8080/actuator/health
```

### Database Connections

Using pgAdmin (http://localhost:5050):
1. Login with: admin@medicalapp.com / admin
2. Add server:
   - Host: patient-db (or host.docker.internal for local)
   - Port: 5432
   - Database: patient_db
   - Username: postgres
   - Password: postgres

### RabbitMQ

Open http://localhost:15672:
- Login: admin / admin
- Check queues, exchanges, and connections

---

## 🎯 Quick Start Commands (After Prerequisites Installed)

```bash
# 1. Start infrastructure
cd /Users/pururajharichandan/Documents/Practice/vs-dev/medical-app
docker compose up -d

# 2. Build backend (one time)
cd backend
mvn clean install

# 3. Start patient service (Terminal 1)
cd backend/patient-service
mvn spring-boot:run

# 4. Start API gateway (Terminal 2)
cd backend/api-gateway
mvn spring-boot:run

# 5. Start frontend (Terminal 3)
cd frontend/medical-app-ui
npm install  # first time only
npm start

# 6. Open browser
open http://localhost:4200
open http://localhost:8081/swagger-ui.html
```

---

## 📚 Additional Resources

- **Swagger API Documentation**: http://localhost:8081/swagger-ui.html
- **Spring Boot Actuator**: http://localhost:8081/actuator
- **Docker Documentation**: https://docs.docker.com/
- **Angular Documentation**: https://angular.io/docs
- **Ionic Documentation**: https://ionicframework.com/docs

---

## ✅ Verification Checklist

After setup, verify everything is working:

- [ ] Java 17 installed: `java --version`
- [ ] Maven installed: `mvn --version`
- [ ] Node.js installed: `node --version`
- [ ] Docker running: `docker ps`
- [ ] Infrastructure started: `docker compose ps` (all healthy)
- [ ] Backend built: `mvn clean install` (BUILD SUCCESS)
- [ ] Patient service running: http://localhost:8081/actuator/health
- [ ] API Gateway running: http://localhost:8080/actuator/health
- [ ] Frontend running: http://localhost:4200
- [ ] Can create patient via Swagger UI
- [ ] Can see patient in API response

---

## 🎓 Next Steps

Once everything is running:

1. **Explore the APIs** using Swagger UI
2. **Create more microservices** using patient-service as template
3. **Build frontend features** connecting to the APIs
4. **Add authentication** with JWT
5. **Deploy to cloud** (AWS, Azure, GCP)

Enjoy building your medical app! 🚀
