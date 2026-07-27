# SkyOps Mission Control

SkyOps Mission Control is a modular monolith application designed to manage a fleet of industrial drones, their missions, and maintenance schedules. 

## Features
- **Fleet Management**: Register and manage drones with real-time status tracking.
- **Mission Planning**: State-machine driven mission scheduling with automated status progression.
- **Maintenance Tracking**: Automated tracking of flight hours and maintenance due dates.
- **Dashboard**: Real-time fleet health report, maintenance alerts, and mission view.
- **Pagination & Filtering**: Built-in capabilities to handle large datasets efficiently.

## Tech Stack
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Frontend**: React, Vite, Ant Design
- **Infrastructure**: Docker, Docker Compose
- **Testing**: Jest, Supertest

## Prerequisites
- Docker & Docker Compose
- Node.js (v18+)

## Setup & Run Instructions

### 1. Start the Database
The project uses PostgreSQL. Start the database container:
```bash
docker-compose up -d
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, run migrations, and seed the database:
```bash
cd backend
npm install
npm run migration:run
npm run seed
npm run start:dev
```
The backend API will be running on `http://localhost:3000`.

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, install dependencies, and start the app:
```bash
cd frontend
npm install
npm run dev
```
The frontend application will be running on `http://localhost:5173`.

## Architecture Decisions
- **Modular Monolith**: We chose a modular monolith architecture using NestJS modules (`Drones`, `Missions`, `Maintenance`, `Fleet`) to ensure separation of concerns while keeping deployment simple.
- **State Machine**: Mission statuses are strictly controlled via business rules to prevent invalid transitions (e.g., cannot skip `PRE_FLIGHT_CHECK`).
- **Migrations**: TypeORM migrations are used instead of `synchronize: true` to ensure production-readiness.

## Testing
To run the backend unit and E2E tests:
```bash
cd backend
npm run test
npm run test:e2e
```
