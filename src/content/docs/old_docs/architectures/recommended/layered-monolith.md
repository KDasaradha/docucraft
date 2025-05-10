---
title: Layered Monolith
description: Placeholder content for Recommended Layered Monolith Architecture.
order: 2
---

# Recommended Layered Monolith Architecture

Thank you for providing additional context about your applications, particularly the **multi-tenant database architecture** and the concern about the complexity of adopting **Event-Driven Architecture (EDA)** or **Event-Driven Hexagonal Architecture** due to the need for a complete backend folder structure overhaul and potential lack of team expertise. Given these constraints, I’ll reassess the architectural options, recommend a more practical approach, and propose a **folder structure** that aligns with your requirements while minimizing disruption. The goal is to balance your needs for **modularity**, **asynchronous processing**, **multi-tenancy**, and **team familiarity** with **React**, **Next.js**, **TypeScript**, **Python**, **FastAPI**, **async**, and **PostgreSQL**.

---

## **Updated Requirements Analysis**
1. **Separate Applications**:
   - **Application 1**: Business system with modules for **User**, **User Profile**, **HRMS**, **Payroll**, **Chat**, and **Pipeline**.
   - **Application 2**: School ERP with modules for **User**, **User Profile**, **HQ**, **Admin**, **Libraries**, **Events**, and **Attendance**.
   - Each application is independent, with no shared services between them, but both have common modules (User, User Profile).
2. **Multi-Tenant Database Architecture**:
   - Each application uses a **vendor or multi-tenant** approach, likely with separate PostgreSQL schemas or databases per tenant (e.g., per company in App 1, per school in App 2).
   - Tenant isolation is critical to ensure data separation and security.
3. **Fully Asynchronous**:
   - Both applications rely on asynchronous processing for real-time features (e.g., Chat, Events) and responsive workflows (e.g., Pipeline, Attendance).
   - FastAPI’s async capabilities are leveraged, but the team may not be familiar with advanced event-driven systems like Kafka.
4. **Team Constraints**:
   - The team lacks expertise in implementing EDA or Event-Driven Hexagonal Architecture effectively.
   - A complete overhaul of the backend folder structure is undesirable due to time, effort, and learning curve.
5. **Modularity**:
   - Each module (e.g., HRMS, Libraries) should be isolated to simplify development and maintenance.
   - Common modules (User, User Profile) should be reusable within each application.
6. **Scalability**:
   - Modules like Chat (App 1) and Events (App 2) may require independent scaling during peak usage.
7. **Technology Stack**:
   - **Frontend**: React, Next.js, TypeScript (likely using server-side rendering or API routes).
   - **Backend**: Python, FastAPI (async), PostgreSQL with multi-tenant schemas.
   - **Async**: Likely using `asyncio` and FastAPI’s async endpoints; message brokers (e.g., Kafka) are challenging due to expertise.
8. **Real-Time Features**:
   - Chat (App 1) and Events (App 2) require real-time updates, possibly via WebSockets or async APIs.
9. **Maintainability**:
   - The folder structure should be intuitive, leveraging FastAPI’s modular design and Next.js’s file-based routing.
   - Avoid complex patterns requiring significant retraining (e.g., hexagonal ports/adapters, Kafka event flows).

---

## **Reassessing Architectural Options**
Given the multi-tenant requirement, team constraints, and aversion to a complete backend restructuring, let’s reevaluate the architectures from the previous discussion, focusing on simplicity, async support, and multi-tenancy:

### **1. Monolithic Architecture**
- **Pros**:
  - Simple to implement and deploy, aligning with team familiarity.
  - Single FastAPI backend with modular routes for each module (e.g., `/hrms`, `/payroll`).
  - Multi-tenancy can be handled with tenant-specific schemas in PostgreSQL.
- **Cons**:
  - Poor scalability, as all modules scale together (e.g., Chat overload affects HRMS).
  - Asynchronous workflows are limited to FastAPI’s async endpoints, not true event-driven systems.
  - Tight coupling risks complexity as modules grow.
- **Fit**: Moderate. Suitable for quick development but struggles with scalability and advanced async needs.

### **2. Layered Architecture**
- **Pros**:
  - Structured, with separate layers (Presentation, Business, Data) for each module.
  - Supports FastAPI’s async endpoints for real-time features.
  - Multi-tenancy can be implemented in the Data layer (e.g., tenant-specific schemas).
  - Familiar structure, requiring minimal changes to existing backend code.
- **Cons**:
  - Still monolithic in deployment, limiting scalability.
  - Asynchronous event-driven workflows are harder to implement without a message broker.
  - Module interactions may lead to coupling within the codebase.
- **Fit**: Good. Layered architecture is practical for your team, supports async FastAPI, and aligns with multi-tenancy, but it’s not ideal for scalability.

### **3. Microservices Architecture**
- **Pros**:
  - Each module (e.g., HRMS, Libraries) as a separate FastAPI service with its own schema.
  - Supports async communication (e.g., REST or lightweight queues like Redis).
  - Scalable, allowing independent deployment of Chat or Events.
  - Multi-tenancy handled per service with tenant-specific schemas.
- **Cons**:
  - Increased complexity in managing multiple services and databases.
  - Requires some distributed systems knowledge (e.g., API Gateway, service discovery).
  - May require partial folder structure changes, though less drastic than EDA.
- **Fit**: Good. Microservices support modularity and scalability but may overwhelm the team without proper tooling.

### **4. Service-Oriented Architecture (SOA)**
- **Pros**:
  - Supports async messaging for some workflows.
  - Multi-tenancy can be implemented in services.
- **Cons**:
  - ESB complexity is overkill for your applications.
  - Coarse-grained services don’t align with fine-grained modules.
  - Significant learning curve for the team.
- **Fit**: Poor. SOA is too complex and not suited for your modular needs.

### **5. Event-Driven Architecture (EDA)**
- **Pros**:
  - Ideal for fully asynchronous workflows (e.g., Chat, Events).
  - Scalable and loosely coupled via events (e.g., Kafka).
  - Multi-tenancy can be handled with tenant-specific event topics or schemas.
- **Cons**:
  - Requires a complete folder structure overhaul (e.g., producers/consumers, Kafka integration).
  - Team lacks expertise in implementing EDA effectively (e.g., Kafka, event schemas).
  - High operational overhead (e.g., managing Kafka clusters).
  - Eventual consistency may complicate multi-tenant data consistency.
- **Fit**: Poor. EDA is powerful but impractical given the team’s expertise and resistance to restructuring.

### **6. Event-Driven Hexagonal Architecture**
- **Pros**:
  - Combines EDA’s async benefits with hexagonal’s modularity and testability.
  - Supports multi-tenancy and domain-driven modules (e.g., HRMS, Libraries).
- **Cons**:
  - Even more complex than EDA, requiring ports, adapters, and event-driven design.
  - Significant learning curve and folder structure overhaul.
  - Team unfamiliarity makes implementation risky.
- **Fit**: Poor. Too complex for your team’s current capabilities and goals.

---

## **Recommended Architecture: Modular Monolith with Async Layered Architecture**
Given your constraints—**multi-tenant database**, **team unfamiliarity with EDA**, **resistance to major folder structure changes**, and **fully asynchronous requirements**—a **Modular Monolith with Async Layered Architecture** is the best choice for both applications. Here’s why:

1. **Simplicity and Familiarity**:
   - A single FastAPI backend per application avoids the complexity of microservices or EDA.
   - Layered architecture (Presentation, Business, Data) is intuitive and aligns with FastAPI’s structure.
   - Minimal changes to existing backend code, reducing disruption.
2. **Modularity**:
   - Each module (e.g., HRMS, Libraries) is organized as a separate package within the backend, ensuring isolation.
   - Common modules (User, User Profile) are reusable packages within each application.
3. **Asynchronous Support**:
   - FastAPI’s async endpoints handle real-time features (e.g., Chat via WebSockets, Events via async APIs).
   - Lightweight async queues (e.g., Redis) can be added for background tasks without requiring Kafka.
4. **Multi-Tenancy**:
   - PostgreSQL schemas per tenant (e.g., `tenant_1_hrms`, `tenant_2_libraries`) ensure data isolation.
   - FastAPI middleware handles tenant identification (e.g., via JWT or headers).
5. **Scalability**:
   - While not as scalable as microservices, containerization (Docker) and horizontal scaling (e.g., multiple FastAPI instances) handle moderate loads.
   - High-load modules (e.g., Chat) can use dedicated async workers or be extracted later.
6. **Next.js Integration**:
   - Next.js’s server-side rendering and API routes support async data fetching, aligning with FastAPI’s async APIs.
7. **Path to Evolution**:
   - Start as a modular monolith, then extract modules (e.g., Chat, Events) into microservices or EDA as team expertise grows.
   - Add a message broker (e.g., Redis, Kafka) for specific async workflows without a full EDA overhaul.

**Trade-Offs**:
- **Scalability**: Less flexible than microservices or EDA, as the entire app scales together.
- **Async Limitations**: Without a message broker, complex event-driven workflows (e.g., cross-module events) are harder to implement.
- **Coupling**: Modules share a codebase, risking some coupling, though mitigated by clear package boundaries.

To address trade-offs:
- Use **Redis** for lightweight async task queues (e.g., background notifications, pipeline tasks) instead of Kafka.
- Implement **WebSockets** for real-time features like Chat and Events.
- Design modules with **hexagonal-like modularity** (domain logic isolated from adapters) to ease future extraction to microservices.
- Use **PostgreSQL schema-based multi-tenancy** for simplicity and performance.

---

## **Sample Folder Structure for Modular Monolith with Async Layered Architecture**

Below is a folder structure for both applications, tailored to **FastAPI** for the backend, **Next.js** with **TypeScript** for the frontend, and **PostgreSQL** with **multi-tenant schemas**. The structure is designed to be intuitive, modular, and async-friendly, requiring minimal changes to existing code. Each application has a single FastAPI backend with module-specific packages and a Next.js frontend with module-specific pages.

```
ecommerce-modular-monolith/
├── app1-business/                      # Application 1 (Business System)
│   ├── backend/                        # FastAPI Backend
│   │   ├── src/
│   │   │   ├── __init__.py
│   │   │   ├── main.py                 # FastAPI entry point
│   │   │   ├── config/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── settings.py         # DB, Redis, JWT settings
│   │   │   │   ├── database.py         # Async PostgreSQL (SQLAlchemy)
│   │   │   ├── middleware/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── tenant.py           # Tenant identification middleware
│   │   │   ├── modules/
│   │   │   │   ├── user/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── routes.py       # User routes (login, register)
│   │   │   │   │   ├── services.py     # User business logic
│   │   │   │   │   ├── models.py       # User SQLAlchemy models
│   │   │   │   │   ├── schemas.py      # User Pydantic schemas
│   │   │   │   ├── user_profile/
│   │   │   │   │   ├── routes.py
│   │   │   │   │   ├── services.py
│   │   │   │   │   ├── models.py
│   │   │   │   │   ├── schemas.py
│   │   │   │   ├── hrms/
│   │   │   │   │   ├── routes.py       # HRMS routes
│   │   │   │   │   ├── services.py     # HRMS logic
│   │   │   │   │   ├── models.py       # Employee models
│   │   │   │   │   ├── schemas.py
│   │   │   │   ├── payroll/
│   │   │   │   │   ├── routes.py
│   │   │   │   │   ├── services.py
│   │   │   │   │   ├── models.py
│   │   │   │   │   ├── schemas.py
│   │   │   │   ├── chat/
│   │   │   │   │   ├── routes.py       # WebSocket routes
│   │   │   │   │   ├── services.py     # Chat logic
│   │   │   │   │   ├── models.py       # Message models
│   │   │   │   │   ├── schemas.py
│   │   │   │   ├── pipeline/
│   │   │   │   │   ├── routes.py
│   │   │   │   │   ├── services.py
│   │   │   │   │   ├── models.py
│   │   │   │   │   ├── schemas.py
│   │   │   ├── utils/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py             # JWT handling
│   │   │   │   ├── redis.py            # Async Redis client
│   │   ├── tests/
│   │   │   ├── test_user.py
│   │   │   ├── test_hrms.py
│   │   ├── requirements.txt            # Dependencies (fastapi, sqlalchemy, redis)
│   │   ├── Dockerfile
│   │   ├── .env
│   ├── frontend/                       # Next.js Frontend
│   │   ├── pages/
│   │   │   ├── index.tsx               # Home page
│   │   │   ├── user/
│   │   │   │   ├── login.tsx
│   │   │   │   ├── register.tsx
│   │   │   ├── hrms/
│   │   │   │   ├── employees.tsx       # Employee management
│   │   │   ├── payroll/
│   │   │   │   ├── salaries.tsx        # Payroll management
│   │   │   ├── chat/
│   │   │   │   ├── index.tsx           # Chat interface
│   │   │   ├── pipeline/
│   │   │   │   ├── index.tsx           # Pipeline dashboard
│   │   ├── components/
│   │   │   ├── user/
│   │   │   ├── hrms/
│   │   │   ├── chat/
│   │   ├── services/
│   │   │   ├── api.ts                  # Axios client
│   │   │   ├── userService.ts
│   │   │   ├── hrmsService.ts
│   │   │   ├── chatService.ts          # WebSocket client
│   │   ├── types/
│   │   │   ├── user.ts
│   │   │   ├── employee.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── .env
│
├── app2-school-erp/                    # Application 2 (School ERP)
│   ├── backend/                        # FastAPI Backend
│   │   ├── src/
│   │   │   ├── __init__.py
│   │   │   ├── main.py
│   │   │   ├── config/
│   │   │   │   ├── settings.py
│   │   │   │   ├── database.py
│   │   │   ├── middleware/
│   │   │   │   ├── tenant.py
│   │   │   ├── modules/
│   │   │   │   ├── user/
│   │   │   │   │   ├── routes.py
│   │   │   │   │   ├── services.py
│   │   │   │   │   ├── models.py
│   │   │   │   │   ├── schemas.py
│   │   │   │   ├── user_profile/
│   │   │   │   ├── hq/
│   │   │   │   │   ├── routes.py
│   │   │   │   │   ├── services.py
│   │   │   │   │   ├── models.py
│   │   │   │   │   ├── schemas.py
│   │   │   │   ├── admin/
│   │   │   │   ├── libraries/
│   │   │   │   │   ├── routes.py
│   │   │   │   │   ├── services.py
│   │   │   │   │   ├── models.py
│   │   │   │   │   ├── schemas.py
│   │   │   │   ├── events/
│   │   │   │   │   ├── routes.py
│   │   │   │   │   ├── services.py
│   │   │   │   │   ├── models.py
│   │   │   │   │   ├── schemas.py
│   │   │   │   ├── attendance/
│   │   │   │   │   ├── routes.py
│   │   │   │   │   ├── services.py
│   │   │   │   │   ├── models.py
│   │   │   │   │   ├── schemas.py
│   │   │   ├── utils/
│   │   │   │   ├── auth.py
│   │   │   │   ├── redis.py
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   ├── .env
│   ├── frontend/                       # Next.js Frontend
│   │   ├── pages/
│   │   │   ├── index.tsx
│   │   │   ├── user/
│   │   │   │   ├── login.tsx
│   │   │   ├── libraries/
│   │   │   │   ├── books.tsx
│   │   │   ├── events/
│   │   │   │   ├── index.tsx
│   │   │   ├── attendance/
│   │   │   │   ├── index.tsx
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── .env
│
├── infrastructure/
│   ├── kubernetes/
│   │   ├── app1-backend.yaml
│   │   ├── app1-frontend.yaml
│   │   ├── app2-backend.yaml
│   │   ├── app2-frontend.yaml
│   ├── docker-compose.yml              # Local development
│   ├── postgres/
│   │   ├── init.sql                   # Schema initialization
│
├── README.md
├── .gitignore
```

---

## **Explanation of Folder Structure**

### **Root Directory**
- **`ecommerce-modular-monolith/`**: Organizes both applications and shared infrastructure.
- **`app1-business/`**, **`app2-school-erp/`**: Separate directories for each application, each with a backend and frontend.
- **`infrastructure/`**: Kubernetes manifests and Docker Compose for deployment.
- **`postgres/init.sql`**: Initializes tenant-specific schemas.
- **`README.md`**, **`.gitignore`**: Documentation and Git exclusions.

### **Backend (`app1-business/backend/`, `app2-school-erp/backend/`)**
- **Structure**: Single FastAPI backend per application, with a layered architecture (routes, services, models).
- **`main.py`**: FastAPI entry point, mounting module routes.
  ```python
  from fastapi import FastAPI
  from src.modules.user.routes import router as user_router
  from src.modules.hrms.routes import router as hrms_router
  from src.middleware.tenant import tenant_middleware

  app = FastAPI(title="Business System")
  app.middleware("http")(tenant_middleware)
  app.include_router(user_router, prefix="/user", tags=["user"])
  app.include_router(hrms_router, prefix="/hrms", tags=["hrms"])

  @app.get("/")
  async def root():
      return {"message": "Business System API"}
  ```
- **`config/`**:
  - **`settings.py`**: Environment variables (e.g., `DATABASE_URL`, `REDIS_URL`).
  - **`database.py`**: Async PostgreSQL setup.
    ```python
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from src.config.settings import DATABASE_URL

    engine = create_async_engine(DATABASE_URL)
    async_session = AsyncSession(engine)
    ```
- **`middleware/tenant.py`**: Identifies tenant from JWT or headers, sets schema.
  ```python
  from fastapi import Request
  from sqlalchemy import text

  async def tenant_middleware(request: Request, call_next):
      tenant_id = request.headers.get("X-Tenant-ID", "default")
      request.state.tenant_schema = f"tenant_{tenant_id}"
      async with async_session() as db:
          await db.execute(text(f"SET search_path TO {request.state.tenant_schema}"))
          response = await call_next(request)
      return response
  ```
- **`modules/`**:
  - Each module (e.g., `user/`, `hrms/`) has:
    - **`routes.py`**: FastAPI routes.
      ```python
      from fastapi import APIRouter, Depends
      from src.modules.hrms.services import HrmsService
      from src.modules.hrms.schemas import EmployeeCreate

      router = APIRouter()

      async def get_service():
          return HrmsService()

      @router.post("/employees")
      async def create_employee(employee: EmployeeCreate, service: HrmsService = Depends(get_service)):
          return await service.create_employee(employee)
      ```
    - **`services.py`**: Business logic, async database calls.
      ```python
      from sqlalchemy.ext.asyncio import AsyncSession
      from src.modules.hrms.models import Employee

      class HrmsService:
          async def create_employee(self, employee_data):
              async with async_session() as db:
                  employee = Employee(**employee_data.dict())
                  db.add(employee)
                  await db.commit()
                  return employee
      ```
    - **`models.py`**: SQLAlchemy models.
      ```python
      from sqlalchemy import Column, Integer, String
      from src.config.database import Base

      class Employee(Base):
          __tablename__ = "employees"
          id = Column(Integer, primary_key=True)
          name = Column(String)
      ```
    - **`schemas.py`**: Pydantic schemas.
      ```python
      from pydantic import BaseModel

      class EmployeeCreate(BaseModel):
          name: str
      ```
  - **`chat/`**: Includes WebSocket routes.
    ```python
    from fastapi import WebSocket
    from src.modules.chat.services import ChatService

    router = APIRouter()

    @router.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket):
        await websocket.accept()
        service = ChatService()
        await service.handle_connection(websocket)
    ```
- **`utils/`**:
  - **`auth.py`**: JWT handling for tenant authentication.
  - **`redis.py`**: Async Redis client for background tasks.
    ```python
    from redis.asyncio import Redis
    from src.config.settings import REDIS_URL

    async def get_redis():
        return Redis.from_url(REDIS_URL)
    ```
- **`tests/`**, **`requirements.txt`**, **`Dockerfile`**, **`.env`**: Includes `fastapi`, `sqlalchemy[asyncio]`, `redis`.

### **Frontend (`app1-business/frontend/`, `app2-school-erp/frontend/`)**
- **Structure**: Next.js with file-based routing for modules.
- **`pages/`**:
  - Module-specific pages (e.g., `/hrms/employees.tsx`).
    ```tsx
    import { useState, useEffect } from 'react';
    import { getEmployees } from '@/services/hrmsService';

    export default function Employees() {
        const [employees, setEmployees] = useState([]);
        useEffect(() => {
            getEmployees().then(setEmployees);
        }, []);
        return (
            <div>
                <h1>Employees</h1>
                {employees.map(emp => <div key={emp.id}>{emp.name}</div>)}
            </div>
        );
    }
    ```
  - Chat page with WebSocket:
    ```tsx
    import { useEffect } from 'react';
    import { initWebSocket } from '@/services/chatService';

    export default function Chat() {
        useEffect(() => {
            const ws = initWebSocket();
            return () => ws.close();
        }, []);
        return <div>Chat Interface</div>;
    }
    ```
- **`services/`**:
  - **`api.ts`**: Axios client with tenant headers.
    ```ts
    import axios from 'axios';

    const api = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
        headers: { 'X-Tenant-ID': 'tenant_1' },
    });
    export default api;
    ```
  - **`chatService.ts`**: WebSocket client.
    ```ts
    export function initWebSocket() {
        const ws = new WebSocket('ws://localhost:8000/chat/ws');
        ws.onmessage = (event) => console.log(event.data);
        return ws;
    }
    ```
- **`components/`**, **`types/`**, **`tests/`**, **`package.json`**, **`tsconfig.json`**, **`Dockerfile`**, **`.env`**: Standard Next.js setup.

### **Infrastructure**
- **`docker-compose.yml`**:
  ```yaml
  version: '3.8'
  services:
    app1-backend:
      build: ./app1-business/backend
      ports:
        - "8001:8001"
      environment:
        - DATABASE_URL=postgresql+asyncpg://user:pass@postgres:5432/app1
        - REDIS_URL=redis://redis:6379
      depends_on:
        - postgres
        - redis
    app1-frontend:
      build: ./app1-business/frontend
      ports:
        - "3001:3000"
    app2-backend:
      build: ./app2-school-erp/backend
      ports:
        - "8002:8002"
      environment:
        - DATABASE_URL=postgresql+asyncpg://user:pass@postgres:5432/app2
      depends_on:
        - postgres
        - redis
    app2-frontend:
      build: ./app2-school-erp/frontend
      ports:
        - "3002:3000"
    postgres:
      image: postgres:13
      environment:
        - POSTGRES_USER=user
        - POSTGRES_PASSWORD=pass
      volumes:
        - ./infrastructure/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    redis:
      image: redis:6
  ```
- **`postgres/init.sql`**: Creates tenant schemas.
  ```sql
  CREATE DATABASE app1;
  CREATE DATABASE app2;
  \c app1
  CREATE SCHEMA tenant_1;
  CREATE SCHEMA tenant_2;
  \c app2
  CREATE SCHEMA tenant_1;
  CREATE SCHEMA tenant_2;
  ```

---

## **Implementation Guidelines**
1. **Multi-Tenancy**:
   - Use schema-based multi-tenancy: each tenant has a schema (e.g., `tenant_1_hrms`).
   - Middleware sets the schema based on `X-Tenant-ID` or JWT claims.
   - Example: `SET search_path TO tenant_1` in SQL queries.
2. **Asynchronous Processing**:
   - Use FastAPI’s async endpoints for all routes.
   - For background tasks (e.g., sending notifications), use Redis with `redis-py`:
     ```python
     from redis.asyncio import Redis
     async def queue_notification(redis: Redis, message: str):
         await redis.lpush("notifications", message)
     ```
   - Process tasks with a worker:
     ```python
     async def notification_worker(redis: Redis):
         while True:
             message = await redis.brpop("notifications")
             print(f"Sending: {message}")
     ```
3. **WebSocket for Chat**:
   - Implement WebSocket routes in `chat/routes.py`.
   - Store messages in PostgreSQL with tenant-specific schemas.
   - Frontend uses WebSocket API for real-time updates.
4. **Next.js Async Features**:
   - Use server components or `getServerSideProps` for async data fetching:
     ```tsx
     export async function getServerSideProps() {
         const employees = await getEmployees();
         return { props: { employees } };
     }
     ```
5. **Testing**:
   - Backend: Use `pytest-asyncio` for async tests, mock tenant schemas.
   - Frontend: Jest and React Testing Library for components.
6. **Deployment**:
   - Containerize with Docker.
   - Deploy to Kubernetes for horizontal scaling.
   - Use managed PostgreSQL (e.g., AWS RDS) and Redis (e.g., AWS ElastiCache).

---

## **Sample Workflow**
- **App 1: Creating an Employee**:
  - Frontend (`/hrms/employees.tsx`) sends POST to `/hrms/employees` with `X-Tenant-ID: tenant_1`.
  - Middleware sets schema to `tenant_1`.
  - `hrms/routes.py` calls `HrmsService`, which saves to `tenant_1.employees`.
  - Background task queues notification via Redis.
- **App 2: Recording Attendance**:
  - Frontend (`/attendance/index.tsx`) sends POST to `/attendance`.
  - Middleware sets schema to `tenant_2`.
  - `attendance/routes.py` saves to `tenant_2.attendance`.
  - WebSocket notifies users of attendance updates.

---

## **Path to EDA (Future)**
If the team gains expertise, transition to **Event-Driven Architecture**:
1. Introduce **Redis** or **Kafka** for event-driven workflows (e.g., `EmployeeHired` event).
2. Refactor modules into separate services with hexagonal architecture.
3. Update folder structure to include `events/` for producers/consumers.
4. Use the previous EDA or Event-Driven Hexagonal structure as a guide.

---

## **Conclusion**
The **Modular Monolith with Async Layered Architecture** is the best choice for your applications, given the multi-tenant requirement, team expertise, and aversion to major restructuring. It supports **asynchronous processing** with FastAPI and Redis, **multi-tenancy** with PostgreSQL schemas, and **modularity** with isolated module packages. The folder structure is intuitive, leveraging FastAPI’s routing and Next.js’s file-based routing, minimizing changes to existing code. For real-time features like Chat, use WebSockets, and for background tasks, use Redis. This approach provides a solid foundation, with a clear path to EDA or microservices as your team’s capabilities grow.

If you need detailed code samples (e.g., `tenant.py`, `chat/routes.py`, `employees.tsx`), a diagram, or help with specific modules (e.g., multi-tenant setup, WebSocket implementation), let me know!