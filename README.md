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

This project is fully Dockerized for a production-like environment using **Docker Compose Profiles**. The PostgreSQL database is automatically initialized and seeded via an SQL dump on startup.

> 💡 **Note on Database Initialization:** 
> For your convenience, the PostgreSQL database is automatically migrated and seeded using the `dump-fleetManagerDB-30-07-26.sql` file upon the first container initialization. 
> *If you prefer to run migrations and seeds manually via the NestJS CLI (`npm run migration:run` & `npm run seed` inside the `backend/` directory), please comment out the `init.sql` volume mapping in `docker-compose.yml` before starting the containers.*

### Option A: Run Everything via Docker (Production-Like)
To start the entire stack (Database, Redis, Backend, Frontend):
```bash
docker compose --profile apps up -d --build
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000` (Swagger UI at `/swagger`)

### Option B: Local Development (Run Apps Locally)
If you want to run the backend/frontend locally for development but use Docker for infrastructure (DB & Redis):

**1. Start Infrastructure Only:**
```bash
docker compose up -d
```

**2. Start Backend Locally:**
```bash
cd backend
npm install
npm run start:dev
```

**3. Start Frontend Locally:**
```bash
cd frontend
npm install
npm run dev
```

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
