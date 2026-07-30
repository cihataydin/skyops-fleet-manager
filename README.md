# 🚁 SkyOps Fleet Mission Control & Maintenance Tracker

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)

An enterprise-grade **Modular Monolith** application designed to manage a fleet of industrial drones, schedule aerial inspection missions, and automate maintenance tracking. This project was built to replace spreadsheets and manual operations, ensuring compliance with aviation regulations and robust mission state-machine tracking.

📖 **[Read the System Design & Architecture Deep-Dive](./system-design.md)**

---

## ✨ Features & Requirements Met

1. **Drone Registry**
   - Full CRUD operations for drone fleet.
   - Strict `SKY-XXXX-XXXX` serial number validation.
   - Automated maintenance scheduling (every 50 flight hours or 90 days).
   - Drone state transitions (`AVAILABLE`, `IN_MISSION`, `MAINTENANCE`, `RETIRED`).
2. **Mission Management**
   - Strict State-Machine tracking: `PLANNED -> PRE_FLIGHT_CHECK -> IN_PROGRESS -> COMPLETED / ABORTED`.
   - Automated flight hour logging upon mission completion.
   - Overlapping mission prevention mechanism.
3. **Maintenance Tracker**
   - Maintenance log creation triggering drone status updates.
   - Decoupled, event-driven module updates.
4. **Dashboard & Fleet Health**
   - Real-time fleet health aggregation, overdue maintenance alerts, and upcoming mission counts.

---

## 🚀 Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL, Event Emitter, Automapper, Class-Validator
- **Frontend**: React, Vite, Ant Design (TypeScript)
- **Infrastructure**: Docker, Docker Compose
- **Testing**: Jest, Supertest, **Testcontainers** (for true isolated DB integration tests)

---

## 🛠️ Setup & Run Instructions

### 1. Start the Infrastructure (Database)
The project relies on PostgreSQL. Start it via Docker Compose:
```bash
docker-compose up -d
```

### 2. Backend Setup
Navigate to the backend, install dependencies, run TypeORM migrations, and seed the database with realistic test data:
```bash
cd backend
npm install
npm run migration:run
npm run seed
npm run start:dev
```
*The backend API will be running on `http://localhost:3000` (Swagger UI at `/swagger`).*

### 3. Frontend Setup
In a new terminal window, start the React application:
```bash
cd frontend
npm install
npm run dev
```
*The frontend application will be running on `http://localhost:5173`.*

---

## 🧪 Testing

This project takes testing seriously, utilizing **Testcontainers** to spin up isolated PostgreSQL instances for integration tests, preventing test pollution and flaky assertions.

To run the backend tests:
```bash
cd backend

# Run Unit Tests
npm run test

# Run Integration & E2E Tests (Requires Docker daemon to be running)
npm run test:e2e
```
