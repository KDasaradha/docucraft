---
title: Microservices
description: Placeholder content for Recommended Microservices Architecture.
order: 3
---

# Recommended Microservices Architecture

Yes, **Microservices Architecture** is a viable alternative to **Event-Driven Hexagonal Architecture** for your two applications, especially given the constraints you’ve outlined: **separate applications**, **multi-tenant database architecture**, **fully asynchronous requirements**, **team unfamiliarity with complex event-driven systems**, and **concerns about overhauling the backend folder structure**. Since you’re using **React**, **Next.js**, **TypeScript**, **Python**, **FastAPI**, **async**, and **PostgreSQL**, and both applications have multiple modules (App 1: User, User Profile, HRMS, Payroll, Chat, Pipeline; App 2: User, User Profile, HQ, Admin, Libraries, Events, Attendance), I’ll evaluate why Microservices Architecture is a suitable choice, compare it to the previously recommended **Modular Monolith with Async Layered Architecture** and **Event-Driven Hexagonal Architecture**, and provide a **folder structure** tailored to Microservices that minimizes disruption while supporting your requirements.

---

## **Why Microservices Architecture?**
Microservices Architecture organizes each module (e.g., HRMS, Libraries) as an independent service with its own FastAPI backend, PostgreSQL schema (for multi-tenancy), and dedicated functionality. Services communicate asynchronously (e.g., via REST APIs or lightweight queues like Redis) or synchronously (e.g., HTTP), aligning with your async requirements. Here’s why Microservices is a good fit:

1. **Modularity**:
   - Each module (e.g., User, HRMS, Libraries) is a separate service, ensuring clear boundaries and isolation.
   - Common modules (User, User Profile) can be shared services across both applications or duplicated per app to maintain separation.
2. **Asynchronous Support**:
   - FastAPI’s async endpoints handle real-time features (e.g., Chat via WebSockets, Events via async APIs).
   - Lightweight message queues (e.g., Redis) can support async workflows without the complexity of Kafka required for full EDA.
3. **Multi-Tenancy**:
   - Each service manages its own PostgreSQL schema (e.g., `tenant_1_hrms`, `tenant_2_libraries`), ensuring tenant isolation.
   - A tenant-aware API Gateway or middleware routes requests to the correct schema.
4. **Scalability**:
   - High-load modules (e.g., Chat, Events) can be scaled independently, unlike a monolith.
   - Kubernetes and Docker enable fine-grained scaling of services.
5. **Team Familiarity**:
   - Microservices with FastAPI and REST APIs are more familiar to teams than EDA’s event-driven patterns or hexagonal ports/adapters.
   - Requires less restructuring than EDA, as each service can reuse a similar structure to your existing backend.
6. **Real-Time Features**:
   - WebSockets in FastAPI handle Chat and Events, avoiding the need for complex event brokers.
   - Async APIs ensure responsiveness for Pipeline and Attendance.
7. **Maintainability**:
   - Services are small and focused, reducing complexity within each module.
   - An API Gateway simplifies frontend interactions, reducing client-side complexity.
8. **Path to Evolution**:
   - Start with a few services (e.g., User, Chat) and gradually split others (e.g., HRMS, Libraries).
   - Introduce a lightweight message broker (e.g., Redis) for async communication, with the option to adopt Kafka later for EDA.

**Trade-Offs Compared to Modular Monolith**:
- **Increased Complexity**: Managing multiple services, databases, and deployments is more complex than a single monolith.
- **Operational Overhead**: Requires tools like Kubernetes, service discovery, and monitoring (e.g., Prometheus).
- **Development Effort**: Each service needs its own setup (e.g., Dockerfile, tests), increasing initial effort.
- **Data Consistency**: Multi-tenant data across services requires careful coordination (e.g., eventual consistency for async operations).

**Trade-Offs Compared to Event-Driven Hexagonal**:
- **Simpler Implementation**: Microservices with REST or Redis are easier to implement than EDA’s Kafka-based event flows and hexagonal ports/adapters.
- **Less Restructuring**: Each service can reuse a familiar FastAPI structure, avoiding the need for `domain/`, `ports/`, and `adapters/` directories.
- **Lower Learning Curve**: No need for expertise in event-driven design, DDD, or hexagonal patterns.
- **Less Async Power**: Microservices may rely more on synchronous REST calls unless a message queue is added, whereas EDA is inherently async.

**Mitigating Trade-Offs**:
- Use a **lightweight message queue** (e.g., Redis) for async tasks instead of Kafka to keep things simple.
- Implement an **API Gateway** to unify service access and handle tenant routing.
- Start with a **hybrid approach**: a modular monolith for less critical modules and microservices for high-load modules (e.g., Chat, Events).
- Leverage **managed services** (e.g., AWS RDS for PostgreSQL, AWS ElastiCache for Redis) to reduce operational burden.

---

## **Comparison of Architectures**
| **Aspect**               | **Modular Monolith (Async Layered)** | **Microservices** | **Event-Driven Hexagonal** |
|--------------------------|-------------------------------------|-------------------|---------------------------|
| **Codebase**             | Single per app                     | Multiple services | Multiple services         |
| **Coupling**             | Moderate (module packages)         | Loose (services)  | Very loose (events/ports) |
| **Communication**        | In-process, async APIs             | REST, async queues | Async events (Kafka)      |
| **Scalability**          | Scales entire app                 | Scales services   | Scales services/adapters  |
| **Complexity**           | Low                               | Moderate          | High                      |
| **Multi-Tenancy**        | Schema-based, middleware           | Schema per service | Schema per service        |
| **Async Support**        | FastAPI async, Redis               | FastAPI async, Redis | Kafka, FastAPI async      |
| **Team Familiarity**     | High                              | Moderate          | Low                       |
| **Folder Structure**     | Minimal changes                   | Service-based     | Major overhaul (ports, adapters) |
| **Real-Time Features**   | WebSockets, async APIs            | WebSockets, async APIs | WebSockets, events       |
| **Use Case**             | Quick development, moderate scale | Modular, scalable | Complex, async, domain-driven |

**Why Microservices Over Modular Monolith?**
- **Scalability**: Microservices allow independent scaling of Chat and Events, critical for peak loads, whereas a monolith scales everything together.
- **Modularity**: Services are more isolated than monolith packages, reducing coupling and enabling parallel development.
- **Async Flexibility**: Microservices can use Redis for async tasks, aligning with your async requirements without EDA’s complexity.

**Why Microservices Over Event-Driven Hexagonal?**
- **Simpler Learning Curve**: Microservices with REST or Redis are easier for your team to adopt than EDA’s Kafka and hexagonal patterns.
- **Less Restructuring**: Each service can reuse a familiar FastAPI structure, avoiding the need for `domain/`, `ports/`, and `adapters/`.
- **Lower Overhead**: No need for a complex message broker like Kafka, reducing infrastructure costs and expertise requirements.

---

## **Recommended Architecture: Microservices Architecture**
**Microservices Architecture** is the best choice for your two applications, balancing **modularity**, **asynchronous processing**, **multi-tenancy**, **scalability**, and **team familiarity**. Each module (e.g., HRMS, Libraries) becomes a FastAPI service with its own PostgreSQL schema for tenant isolation. Communication is primarily via **async REST APIs** (FastAPI) and **WebSockets** (for Chat, Events), with **Redis** for lightweight async task queues (e.g., notifications, background jobs). An **API Gateway** unifies frontend access and handles tenant routing. This approach avoids the complexity of EDA and hexagonal architecture while meeting your requirements.

---

## **Sample Folder Structure for Microservices Architecture**

Below is a folder structure for both applications, using **FastAPI** for backend services, **Next.js** with **TypeScript** for the frontend, **PostgreSQL** with multi-tenant schemas, and **Redis** for async tasks. The structure is designed to be modular, async-friendly, and familiar to your team, minimizing changes from a typical FastAPI setup. Each module is a separate service, and common modules (User, User Profile) are implemented per application to maintain separation.

```
ecommerce-microservices/
├── app1-business/                      # Application 1 (Business System)
│   ├── user-service/                   # User Service (FastAPI)
│   │   ├── src/
│   │   │   ├── __init__.py
│   │   │   ├── main.py                 # FastAPI entry point
│   │   │   ├── config/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── settings.py         # DB, Redis settings
│   │   │   │   ├── database.py         # Async PostgreSQL (SQLAlchemy)
│   │   │   ├── routes/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── user.py             # User routes (login, register)
│   │   │   ├── services/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── user_service.py     # User logic
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── user.py             # User SQLAlchemy models
│   │   │   ├── schemas/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── user.py             # User Pydantic schemas
│   │   │   ├── utils/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py             # JWT for tenant auth
│   │   │   │   ├── redis.py            # Async Redis client
│   │   ├── tests/
│   │   │   ├── test_user.py
│   │   ├── requirements.txt            # fastapi, sqlalchemy, redis
│   │   ├── Dockerfile
│   │   ├── .env
│   ├── user-profile-service/           # User Profile Service (similar)
│   ├── hrms-service/                   # HRMS Service
│   │   ├── src/
│   │   │   ├── main.py
│   │   │   ├── config/
│   │   │   │   ├── settings.py
│   │   │   │   ├── database.py
│   │   │   ├── routes/
│   │   │   │   ├── employee.py         # Employee routes
│   │   │   ├── services/
│   │   │   │   ├── hrms_service.py
│   │   │   ├── models/
│   │   │   │   ├── employee.py
│   │   │   ├── schemas/
│   │   │   │   ├── employee.py
│   │   │   ├── utils/
│   │   │   │   ├── auth.py
│   │   │   │   ├── redis.py
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   ├── .env
│   ├── payroll-service/                # Payroll Service (similar)
│   ├── chat-service/                   # Chat Service (WebSocket)
│   │   ├── src/
│   │   │   ├── main.py
│   │   │   ├── config/
│   │   │   ├── routes/
│   │   │   │   ├── chat.py             # WebSocket routes
│   │   │   ├── services/
│   │   │   │   ├── chat_service.py
│   │   │   ├── models/
│   │   │   │   ├── message.py
│   │   │   ├── schemas/
│   │   │   │   ├── message.py
│   │   │   ├── utils/
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   ├── .env
│   ├── pipeline-service/               # Pipeline Service
│   ├── frontend/                       # Next.js Frontend
│   │   ├── pages/
│   │   │   ├── index.tsx
│   │   │   ├── user/
│   │   │   │   ├── login.tsx
│   │   │   ├── hrms/
│   │   │   │   ├── employees.tsx
│   │   │   ├── chat/
│   │   │   │   ├── index.tsx
│   │   ├── components/
│   │   │   ├── user/
│   │   │   ├── hrms/
│   │   │   ├── chat/
│   │   ├── services/
│   │   │   ├── api.ts                  # Axios for API Gateway
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
│   ├── user-service/                   # User Service (similar to App 1)
│   ├── user-profile-service/           # User Profile Service
│   ├── hq-service/                     # HQ Service
│   ├── admin-service/                  # Admin Service
│   ├── libraries-service/              # Libraries Service
│   │   ├── src/
│   │   │   ├── main.py
│   │   │   ├── config/
│   │   │   │   ├── settings.py
│   │   │   │   ├── database.py
│   │   │   ├── routes/
│   │   │   │   ├── book.py             # Book routes
│   │   │   ├── services/
│   │   │   │   ├── library_service.py
│   │   │   ├── models/
│   │   │   │   ├── book.py
│   │   │   ├── schemas/
│   │   │   │   ├── book.py
│   │   │   ├── utils/
│   │   │   │   ├── auth.py
│   │   │   │   ├── redis.py
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   ├── .env
│   ├── events-service/                 # Events Service
│   ├── attendance-service/             # Attendance Service
│   ├── frontend/                       # Next.js Frontend
│   │   ├── pages/
│   │   │   ├── index.tsx
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
├── api-gateway/                        # API Gateway (FastAPI)
│   ├── src/
│   │   ├── main.py
│   │   ├── config/
│   │   │   ├── settings.py
│   │   ├── routes/
│   │   │   ├── proxy.py
│   │   ├── utils/
│   │   │   ├── auth.py
│   │   │   ├── proxy.py
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env
│
├── infrastructure/
│   ├── kubernetes/
│   │   ├── app1-user-service.yaml
│   │   ├── app1-hrms-service.yaml
│   │   ├── app2-libraries-service.yaml
│   │   ├── api-gateway.yaml
│   │   ├── app1-frontend.yaml
│   │   ├── app2-frontend.yaml
│   ├── docker-compose.yml
│   ├── postgres/
│   │   ├── init.sql
│
├── README.md
├── .gitignore
```

---

## **Explanation of Folder Structure**

### **Root Directory**
- **`ecommerce-microservices/`**: Organizes both applications, API Gateway, and infrastructure.
- **`app1-business/`**, **`app2-school-erp/`**: Separate directories for each application, with services and frontends.
- **`api-gateway/`**: Unifies service access and handles tenant routing.
- **`infrastructure/`**: Kubernetes manifests, Docker Compose, and PostgreSQL setup.
- **`postgres/init.sql`**: Initializes tenant schemas.
- **`README.md`**, **`.gitignore`**: Documentation and Git exclusions.

### **Application 1 (`app1-business/`)**
- **Services**:
  - **`user-service/`**, **`user-profile-service/`**, **`hrms-service/`**, **`payroll-service/`**, **`pipeline-service/`**:
    - **Structure**: Each service is a FastAPI app with routes, services, models, and schemas.
    - **`main.py`**: FastAPI entry point.
      ```python
      from fastapi import FastAPI
      from src.routes.employee import router as employee_router
      from src.utils.auth import tenant_middleware

      app = FastAPI(title="HRMS Service")
      app.middleware("http")(tenant_middleware)
      app.include_router(employee_router, prefix="/employees", tags=["employees"])

      @app.get("/")
      async def root():
          return {"message": "HRMS Service"}
      ```
    - **`config/`**:
      - **`settings.py`**: Environment variables.
      - **`database.py`**: Async PostgreSQL.
        ```python
        from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
        from src.config.settings import DATABASE_URL

        engine = create_async_engine(DATABASE_URL)
        async_session = AsyncSession(engine)
        ```
    - **`routes/`**:
      - **`employee.py`**: Employee routes.
        ```python
        from fastapi import APIRouter, Depends
        from src.services.hrms_service import HrmsService
        from src.schemas.employee import EmployeeCreate

        router = APIRouter()

        async def get_service():
            return HrmsService()

        @router.post("/")
        async def create_employee(employee: EmployeeCreate, service: HrmsService = Depends(get_service)):
            return await service.create_employee(employee)
        ```
    - **`services/`**:
      - **`hrms_service.py`**: Business logic.
        ```python
        from sqlalchemy.ext.asyncio import AsyncSession
        from src.models.employee import Employee

        class HrmsService:
            async def create_employee(self, employee_data, tenant_schema: str):
                async with async_session() as db:
                    await db.execute(f"SET search_path TO {tenant_schema}")
                    employee = Employee(**employee_data.dict())
                    db.add(employee)
                    await db.commit()
                    return employee
        ```
    - **`models/`**, **`schemas/`**, **`utils/`**: SQLAlchemy models, Pydantic schemas, JWT/Redis utilities.
  - **`chat-service/`**:
    - Includes WebSocket routes.
      ```python
      from fastapi import WebSocket
      from src.services.chat_service import ChatService

      router = APIRouter()

      @router.websocket("/ws")
      async def websocket_endpoint(websocket: WebSocket):
          await websocket.accept()
          service = ChatService()
          await service.handle_connection(websocket)
      ```
- **Frontend**:
  - **Next.js**: Pages for each module (e.g., `/hrms/employees.tsx`).
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
  - **Chat**: WebSocket client.
    ```ts
    export function initWebSocket() {
        const ws = new WebSocket('ws://api-gateway:8080/chat/ws');
        ws.onmessage = (event) => console.log(event.data);
        return ws;
    }
    ```

### **Application 2 (`app2-school-erp/`)**
- **Services**:
  - **`user-service/`**, **`user-profile-service/`**, **`hq-service/`**, **`admin-service/`**, **`libraries-service/`**, **`events-service/`**, **`attendance-service/`**:
    - Similar structure to App 1 services, with module-specific routes, services, and models.
    - Example: `libraries-service` manages books.
      ```python
      # src/routes/book.py
      from fastapi import APIRouter, Depends
      from src.services.library_service import LibraryService
      from src.schemas.book import BookCreate

      router = APIRouter()

      async def get_service():
          return LibraryService()

      @router.post("/")
      async def create_book(book: BookCreate, service: LibraryService = Depends(get_service)):
          return await service.create_book(book)
      ```
- **Frontend**:
  - Next.js with pages like `/libraries/books.tsx`, similar to App 1.

### **API Gateway (`api-gateway/`)**
- Routes requests to services with tenant headers.
  ```python
  from fastapi import FastAPI, Request
  from src.utils.proxy import forward_request

  app = FastAPI(title="API Gateway")

  @app.post("/{service}/{path:path}")
  async def proxy_post(service: str, path: str, request: Request):
      tenant_id = request.headers.get("X-Tenant-ID", "default")
      return await forward_request(service, f"/{path}", method="POST", data=await request.json(), headers={"X-Tenant-ID": tenant_id})
  ```

### **Infrastructure**
- **`docker-compose.yml`**:
  ```yaml
  version: '3.8'
  services:
    app1-user-service:
      build: ./app1-business/user-service
      ports:
        - "8001:8001"
      environment:
        - DATABASE_URL=postgresql+asyncpg://user:pass@postgres:5432/app1_user
        - REDIS_URL=redis://redis:6379
      depends_on:
        - postgres
        - redis
    app1-hrms-service:
      build: ./app1-business/hrms-service
      ports:
        - "8002:8002"
      environment:
        - DATABASE_URL=postgresql+asyncpg://user:pass@postgres:5432/app1_hrms
    app1-chat-service:
      build: ./app1-business/chat-service
      ports:
        - "8003:8003"
    app1-frontend:
      build: ./app1-business/frontend
      ports:
        - "3001:3000"
    app2-libraries-service:
      build: ./app2-school-erp/libraries-service
      ports:
        - "8004:8004"
      environment:
        - DATABASE_URL=postgresql+asyncpg://user:pass@postgres:5432/app2_libraries
    app2-frontend:
      build: ./app2-school-erp/frontend
      ports:
        - "3002:3000"
    api-gateway:
      build: ./api-gateway
      ports:
        - "8080:8080"
      environment:
        - USER_SERVICE_URL=http://app1-user-service:8001
        - HRMS_SERVICE_URL=http://app1-hrms-service:8002
        - LIBRARIES_SERVICE_URL=http://app2-libraries-service:8004
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
  CREATE DATABASE app1_user;
  CREATE DATABASE app1_hrms;
  CREATE DATABASE app2_libraries;
  \c app1_user
  CREATE SCHEMA tenant_1;
  CREATE SCHEMA tenant_2;
  \c app1_hrms
  CREATE SCHEMA tenant_1;
  ```

---

## **Implementation Guidelines**
1. **Multi-Tenancy**:
   - Each service uses a tenant-specific schema (e.g., `tenant_1_hrms`).
   - API Gateway forwards `X-Tenant-ID` headers to services.
   - Service middleware sets the schema:
     ```python
     async def tenant_middleware(request: Request, call_next):
         tenant_id = request.headers.get("X-Tenant-ID", "default")
         request.state.tenant_schema = f"tenant_{tenant_id}"
         async with async_session() as db:
             await db.execute(f"SET search_path TO {request.state.tenant_schema}")
             response = await call_next(request)
         return response
     ```
2. **Asynchronous Processing**:
   - Use FastAPI’s async endpoints.
   - Queue background tasks with Redis:
     ```python
     from redis.asyncio import Redis
     async def queue_notification(redis: Redis, message: str):
         await redis.lpush("notifications", message)
     ```
3. **WebSocket for Chat**:
   - Implement in `chat-service`:
     ```python
     async def handle_connection(self, websocket: WebSocket):
         while True:
             data = await websocket.receive_text()
             await websocket.send_text(f"Message: {data}")
     ```
   - Frontend WebSocket client:
     ```ts
     const ws = new WebSocket('ws://api-gateway:8080/chat/ws');
     ws.onmessage = (event) => console.log(event.data);
     ```
4. **Next.js Async**:
   - Use server-side rendering:
     ```tsx
     export async function getServerSideProps() {
         const books = await getBooks();
         return { props: { books } };
     }
     ```
5. **Testing**:
   - Backend: `pytest-asyncio` for async tests.
   - Frontend: Jest and React Testing Library.
6. **Deployment**:
   - Docker for containerization.
   - Kubernetes for scaling.
   - Managed PostgreSQL and Redis.

---

## **Sample Workflow**
- **App 1: Creating an Employee**:
  - Frontend sends POST to `/hrms/employees` via API Gateway.
  - API Gateway routes to `hrms-service` with `X-Tenant-ID`.
  - `hrms_service.py` saves to `tenant_1.employees`.
  - Redis queues a notification.
- **App 2: Borrowing a Book**:
  - Frontend sends POST to `/libraries/borrow`.
  - API Gateway routes to `libraries-service`.
  - `library_service.py` saves to `tenant_2.books`.

---

## **Conclusion**
**Microservices Architecture** is an excellent choice for your applications, offering **modularity**, **scalability**, and **async support** while being simpler than Event-Driven Hexagonal Architecture. It supports **multi-tenancy** with tenant-specific schemas, leverages **FastAPI** and **Redis** for async workflows, and aligns with your team’s familiarity. The folder structure is service-based but familiar, requiring less restructuring than EDA. Start with key services (e.g., User, Chat) and expand gradually, using Redis for async tasks and WebSockets for real-time features. This approach meets your needs and provides a path to EDA if needed later.

If you need code samples (e.g., `hrms_service.py`, `chatService.ts`), a diagram, or help with specific modules, let me know!
