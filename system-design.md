# 🏗️ System Design & Architecture

This document outlines the architectural decisions, design patterns, and domain boundaries established in the **SkyOps Fleet Manager** application.

## 1. High-Level Architecture: Modular Monolith
The backend is structured as a **Modular Monolith**. Instead of jumping directly into microservices (which introduces network latency, distributed transaction complexity, and deployment overhead for a system of this size), the codebase is strictly segregated by **Domain Modules**.

**Key Modules:**
- `DroneModule`: Manages drone inventory, statuses, and flight hours.
- `MissionModule`: Manages mission scheduling, state transitions, and overlapping validations.
- `MaintenanceModule`: Manages maintenance logs and technician notes.
- `ReportModule`: Handles cross-cutting queries for the Fleet Health dashboard without cluttering transactional business logic (CQRS pattern approach).

## 2. Event-Driven Communication (Choreography)
To enforce **Separation of Concerns (SoC)** and prevent tight coupling (Spaghetti Code) between modules, internal state changes are communicated via **Domain Events** using `@nestjs/event-emitter`.

**Example Flow (Flight Hours Exceeded):**
1. A mission completes. The `MissionModule` emits `MISSION_COMPLETED`.
2. The `DroneModule` listens to this event, adds flight hours to the drone, and checks if it exceeds 50 hours.
3. If it exceeds 50 hours, the `DroneModule` emits a `FLIGHT_HOURS_EXCEEDED` event.
4. An internal listener within the `DroneModule` catches this event and autonomously changes the drone's status to `MAINTENANCE`.

*Why?* By ensuring that the `DroneModule` manages its own state transitions instead of letting the `MaintenanceModule` forcefully update drone statuses, we maintain strict domain boundaries.

## 3. Domain-Driven Design (DDD) Principles
We applied several DDD tactical patterns to keep the business logic testable and framework-agnostic:
- **Rich Domain Logics**: Pure business rules (e.g., state-machine validation, overlapping date checks) are extracted into static `Logic` classes (e.g., `MissionLogic.ts`). This makes them 100% unit-testable without mocking databases.
- **DTOs and Mappers**: `@automapper/nestjs` is heavily utilized to prevent internal database Entities from leaking to the API presentation layer.
- **Dependency Injection**: Repositories and external services are injected via abstract Tokens (e.g., `DRONE_SERVICE_TOKEN`), respecting the Dependency Inversion Principle.

## 4. State Machine Validation
A drone mission follows a strict lifecycle: `PLANNED -> PRE_FLIGHT_CHECK -> IN_PROGRESS -> COMPLETED / ABORTED`.
- Transitions are strictly validated. You cannot abort a completed mission, and you cannot start a mission that hasn't passed the pre-flight check.
- **Idempotency**: Retrying a state transition returns a consistent response instead of corrupting the database.

## 5. Testing Strategy
- **Integration Tests with Testcontainers**: Mocking the database for E2E tests often hides SQL syntax errors and constraint violations. We use `@testcontainers/postgresql` to spin up a real Dockerized Postgres instance, run TypeORM migrations, execute the API calls via Supertest, and tear it down automatically.
- **Idempotent Test Data**: Hardcoded IDs are avoided (`SKY-INT1-${randomHex}`) to ensure E2E tests can be run safely in parallel on CI/CD pipelines without Unique Constraint violations.
- **Polling over Timeouts**: Asynchronous event handlers are asserted using active polling (`waitForCondition`) instead of flaky, hardcoded `setTimeout` delays.

## 6. Future Scalability Improvements
If the system scales to thousands of concurrent operations, the following would be implemented:
1. **Pessimistic/Optimistic Locking**: To prevent a race condition where two dispatchers schedule a mission for the same drone at the exact same millisecond.
2. **Transactional Outbox Pattern**: Currently, events are emitted immediately after a database `save()`. In a high-availability distributed system, events should be saved to an `Outbox` table within the same transaction to guarantee they are published to a message broker (At-Least-Once Delivery).
