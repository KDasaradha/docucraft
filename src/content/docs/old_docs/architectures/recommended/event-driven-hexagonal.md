---
title: Event-Driven Hexagonal
description: Placeholder content for Recommended Event-Driven Hexagonal Architecture.
order: 1
---

# Recommended Event-Driven Hexagonal Architecture

Given the requirements and characteristics of your two applications, let’s analyze the best architecture for them, considering the technologies (**React**, **Next.js**, **TypeScript**, **Python**, **FastAPI**, **async**, **PostgreSQL**) and the modular, fully asynchronous nature of the applications. The applications are:

1. **Application 1**: A business-oriented system with modules for **User**, **User Profile**, **HRMS**, **Payroll**, **Chat**, and **Pipeline**.
2. **Application 2**: A **School ERP** software with modules for **User**, **User Profile**, **HQ**, **Admin**, **Libraries**, **Events**, and **Attendance**.

Both applications are **fully asynchronous**, have multiple modules, and share common modules (User, User Profile). Below, I’ll evaluate the architectural options based on your requirements, compare them, and recommend the best fit. I’ll also provide a high-level folder structure for the recommended architecture, tailored to your tech stack.

---

## **Key Requirements Analysis**
1. **Modularity**:
   - Both applications have distinct modules (e.g., HRMS, Payroll, Libraries, Events).
   - Common modules (User, User Profile) suggest potential for shared code or services.
   - Each module likely has its own business logic, database interactions, and UI components.
2. **Fully Asynchronous**:
   - The applications rely on asynchronous processing, likely for real-time features (e.g., Chat, Events) or high responsiveness (e.g., Pipeline, Attendance).
   - Asynchronous communication (e.g., via events or message queues) is critical.
3. **Scalability**:
   - Modules like Chat and Pipeline (App 1) or Events and Attendance (App 2) may experience variable loads, requiring independent scaling.
   - School ERP may have peak usage during specific times (e.g., exam periods).
4. **Technology Stack**:
   - **Frontend**: React, Next.js, TypeScript (server-side rendering, static generation, or client-side rendering).
   - **Backend**: Python, FastAPI (async-friendly), PostgreSQL (relational database).
   - Asynchronous Python libraries (e.g., `asyncio`, `aiokafka`) align with FastAPI.
5. **Real-Time Features**:
   - Chat (App 1) and Events (App 2) suggest real-time or near-real-time requirements, likely using WebSockets or event-driven mechanisms.
6. **Maintainability**:
   - Multiple modules require clear separation of concerns to avoid complexity.
   - Common modules (User, User Profile) should be reusable to reduce duplication.
7. **Team Expertise**:
   - Assuming your team is familiar with React, Next.js, FastAPI, and PostgreSQL, but may need guidance on advanced patterns like event-driven systems or hexagonal architecture.
8. **Deployment**:
   - Likely cloud-based (e.g., AWS, GCP) with containerization (Docker) and orchestration (Kubernetes) for scalability.

---

## **Architectural Options**
Based on the previous notes (Monolithic, Layered, Microservices, SOA, Event-Driven, Event-Driven Hexagonal), let’s evaluate the most relevant architectures:

### **1. Monolithic Architecture**
- **Description**: A single codebase with all modules (User, HRMS, etc.) tightly integrated, deployed as one unit.
- **Pros**:
  - Simple to develop and deploy initially.
  - Easier for small teams with limited distributed systems expertise.
  - Shared database (PostgreSQL) simplifies data access for common modules.
- **Cons**:
  - Poor scalability for modules like Chat or Events, as the entire app scales together.
  - Tight coupling makes it hard to isolate asynchronous workflows.
  - Adding new modules increases complexity, risking a "big ball of mud."
  - Not ideal for fully asynchronous systems due to synchronous tendencies.
- **Fit**: Poor. Monolithic architecture doesn’t align with the asynchronous, modular, and scalable needs of your applications.

### **2. Layered Architecture**
- **Description**: A single codebase organized into layers (Presentation, Business Logic, Data Access) for each module, with FastAPI handling async APIs.
- **Pros**:
  - Structured and familiar, with clear separation of concerns within the backend.
  - Supports async FastAPI endpoints for real-time features.
  - Reusable layers for common modules (User, User Profile).
- **Cons**:
  - Still monolithic in deployment, limiting scalability for high-load modules (e.g., Chat).
  - Asynchronous event-driven workflows (e.g., Pipeline, Events) are harder to implement within a layered structure.
  - Changes to one module may affect others due to shared codebase.
- **Fit**: Moderate. Layered architecture could work for a single codebase with async APIs, but it struggles with fully asynchronous, event-driven requirements and scalability.

### **3. Microservices Architecture**
- **Description**: Each module (e.g., User, HRMS, Libraries) is a separate service with its own FastAPI backend, PostgreSQL schema, and Next.js frontend routes. Services communicate via async APIs or a message broker.
- **Pros**:
  - Independent scaling for modules (e.g., scale Chat separately from HRMS).
  - Supports async communication (e.g., REST or Kafka) for real-time features.
  - Clear module boundaries reduce coupling.
  - Common modules (User, User Profile) can be shared services.
- **Cons**:
  - Increased complexity in managing multiple services, databases, and deployments.
  - Requires expertise in distributed systems (e.g., service discovery, monitoring).
  - Synchronous APIs (e.g., REST) may not fully leverage asynchronous requirements.
- **Fit**: Good. Microservices align with modularity and scalability but may need a message broker for fully asynchronous communication.

### **4. Service-Oriented Architecture (SOA)**
- **Description**: Coarse-grained services (e.g., HRMS, School ERP) with an Enterprise Service Bus (ESB) for communication, potentially using async messaging.
- **Pros**:
  - Supports integration of heterogeneous modules.
  - Async messaging via ESB aligns with asynchronous requirements.
- **Cons**:
  - ESB introduces complexity and overhead, overkill for your apps.
  - Coarse-grained services may not suit fine-grained modules like Chat or Events.
  - Less focus on domain-driven design compared to microservices or hexagonal.
- **Fit**: Poor. SOA is too heavy for your modular, domain-focused applications.

### **5. Event-Driven Architecture (EDA)**
- **Description**: Modules are services that communicate via events (e.g., Kafka), with FastAPI handling async event producers/consumers and Next.js for the frontend.
- **Pros**:
  - Ideal for fully asynchronous workflows (e.g., Chat messages, Event updates).
  - Loose coupling via events enables independent module development.
  - Scalable, as services process events independently.
  - Supports real-time features with Kafka or RabbitMQ.
- **Cons**:
  - Complex to design and debug event flows.
  - Eventual consistency may require careful handling (e.g., Attendance updates).
  - Requires infrastructure (e.g., Kafka) and expertise in event-driven systems.
- **Fit**: Very Good. EDA matches the asynchronous, real-time, and scalable needs of your applications.

### **6. Event-Driven Hexagonal Architecture**
- **Description**: Each module is a service with a hexagonal structure (domain core, ports, adapters) communicating via events (Kafka). FastAPI implements async adapters, and Next.js handles the frontend.
- **Pros**:
  - Combines EDA’s asynchronous, scalable benefits with hexagonal’s modularity and testability.
  - Domain-centric core aligns with complex modules (e.g., HRMS, Libraries).
  - Ports and adapters enable flexibility (e.g., swap PostgreSQL for another DB).
  - Supports real-time and async workflows (e.g., Chat, Events).
  - Reusable core for common modules (User, User Profile).
- **Cons**:
  - Highest complexity due to combining hexagonal and EDA patterns.
  - Steep learning curve for ports, adapters, and event-driven design.
  - Increased development time for defining ports and adapters.
- **Fit**: Excellent. Event-Driven Hexagonal Architecture is ideal for your modular, asynchronous, domain-driven applications, provided your team can handle the complexity.

---

## **Recommended Architecture: Event-Driven Hexagonal Architecture**
**Event-Driven Hexagonal Architecture** is the best fit for your two applications due to the following reasons:
1. **Asynchronous Support**:
   - Fully asynchronous requirements (e.g., Chat, Events) are natively supported by EDA’s event-driven communication (Kafka) and FastAPI’s async capabilities.
2. **Modularity**:
   - Hexagonal architecture’s domain-centric core and ports/adapters ensure each module (e.g., HRMS, Libraries) is isolated and maintainable.
   - Common modules (User, User Profile) can be implemented as shared services with reusable cores.
3. **Scalability**:
   - EDA allows independent scaling of services (e.g., Chat during peak usage).
   - Hexagonal adapters enable flexible scaling of external integrations (e.g., PostgreSQL, Kafka).
4. **Real-Time Features**:
   - Kafka and FastAPI’s WebSocket support handle real-time needs (e.g., Chat, Event notifications).
5. **Domain-Driven Design**:
   - Modules like HRMS, Payroll, and Libraries benefit from hexagonal’s focus on domain logic and domain events (e.g., `PayrollProcessed`, `LibraryBookBorrowed`).
6. **Flexibility**:
   - Ports and adapters allow swapping technologies (e.g., PostgreSQL to MongoDB) without changing the core.
7. **Testability**:
   - Hexagonal’s isolated core and mocked ports simplify unit testing, critical for complex modules.
8. **Next.js Integration**:
   - Next.js supports async server-side rendering and API routes, aligning with FastAPI’s async APIs and event-driven workflows.

**Trade-Offs**:
- **Complexity**: The combination of EDA and hexagonal architecture is complex, requiring careful design of events, ports, and adapters.
- **Learning Curve**: Your team needs familiarity with DDD, hexagonal patterns, and event-driven systems (e.g., Kafka).
- **Infrastructure**: Kafka, PostgreSQL, and Kubernetes add operational overhead.

To mitigate complexity:
- Start with a **modular monolith** using hexagonal architecture for each application, then gradually extract modules into event-driven microservices as needed.
- Use managed services (e.g., AWS MSK for Kafka, RDS for PostgreSQL) to reduce infrastructure burden.
- Leverage libraries like `aiokafka` for Kafka integration and `pydantic` for event schemas.

---

## **High-Level Folder Structure for Event-Driven Hexagonal Architecture**

Below is a high-level folder structure for both applications, using **FastAPI** for backend services, **Next.js** with **TypeScript** for the frontend, and **Kafka** as the message broker. The structure assumes each module (e.g., HRMS, Libraries) is a separate service with a hexagonal architecture, and common modules (User, User Profile) are shared services. The structure is streamlined to balance modularity and simplicity.

```
ecommerce-eda-hexagonal/
├── shared-services/                    # Shared services (User, User Profile)
│   ├── user-service/                   # User Service (FastAPI, Hexagonal)
│   │   ├── app/
│   │   │   ├── main.py                 # FastAPI entry point
│   │   │   ├── config/
│   │   │   │   ├── settings.py         # DB, Kafka settings
│   │   │   │   ├── database.py         # PostgreSQL (SQLAlchemy)
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── user.py         # User entity
│   │   │   │   ├── events/
│   │   │   │   │   ├── user_created.py # UserCreatedEvent
│   │   │   │   ├── services/
│   │   │   │   │   ├── user_service.py # User logic
│   │   │   ├── ports/
│   │   │   │   ├── input/
│   │   │   │   │   ├── user_use_case.py # CreateUserUseCase
│   │   │   │   ├── output/
│   │   │   │   │   ├── user_repository.py # UserRepositoryPort
│   │   │   │   │   ├── event_publisher.py # EventPublisherPort
│   │   │   ├── adapters/
│   │   │   │   ├── input/
│   │   │   │   │   ├── rest_api.py     # REST adapter
│   │   │   │   │   ├── kafka_consumer.py # Kafka consumer
│   │   │   │   ├── output/
│   │   │   │   │   ├── sql_repository.py # PostgreSQL adapter
│   │   │   │   │   ├── kafka_producer.py # Kafka producer
│   │   │   ├── schemas/
│   │   │   │   ├── user.py             # Pydantic schemas
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   ├── .env
│   ├── user-profile-service/           # User Profile Service (similar structure)
│
├── app1-business/                      # Application 1 (Business System)
│   ├── hrms-service/                   # HRMS Service (FastAPI, Hexagonal)
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── config/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── employee.py
│   │   │   │   ├── events/
│   │   │   │   │   ├── employee_hired.py
│   │   │   │   ├── services/
│   │   │   │   │   ├── hrms_service.py
│   │   │   ├── ports/
│   │   │   │   ├── input/
│   │   │   │   │   ├── hrms_use_case.py
│   │   │   │   ├── output/
│   │   │   │   │   ├── hrms_repository.py
│   │   │   │   │   ├── event_publisher.py
│   │   │   ├── adapters/
│   │   │   │   ├── input/
│   │   │   │   │   ├── rest_api.py
│   │   │   │   │   ├── kafka_consumer.py
│   │   │   │   ├── output/
│   │   │   │   │   ├── sql_repository.py
│   │   │   │   │   ├── kafka_producer.py
│   │   │   ├── schemas/
│   │   │   │   ├── employee.py
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   ├── .env
│   ├── payroll-service/                # Payroll Service (similar structure)
│   ├── chat-service/                   # Chat Service (WebSocket support)
│   ├── pipeline-service/               # Pipeline Service (e.g., CI/CD workflows)
│   ├── frontend/                       # Next.js Frontend
│   │   ├── pages/
│   │   │   ├── index.tsx               # Home page
│   │   │   ├── hrms/
│   │   │   │   ├── employees.tsx       # Employee management
│   │   │   ├── payroll/
│   │   │   │   ├── salaries.tsx        # Payroll management
│   │   │   ├── chat/
│   │   │   │   ├── index.tsx           # Chat interface
│   │   │   ├── pipeline/
│   │   │   │   ├── index.tsx           # Pipeline dashboard
│   │   ├── components/
│   │   │   ├── hrms/
│   │   │   ├── payroll/
│   │   │   ├── chat/
│   │   ├── services/
│   │   │   ├── api.ts                  # Axios for API Gateway
│   │   │   ├── hrmsService.ts
│   │   │   ├── chatService.ts          # WebSocket client
│   │   ├── types/
│   │   │   ├── employee.ts
│   │   │   ├── chat.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── .env
│
├── app2-school-erp/                    # Application 2 (School ERP)
│   ├── libraries-service/              # Libraries Service (FastAPI, Hexagonal)
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── config/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── book.py
│   │   │   │   ├── events/
│   │   │   │   │   ├── book_borrowed.py
│   │   │   │   ├── services/
│   │   │   │   │   ├── library_service.py
│   │   │   ├── ports/
│   │   │   │   ├── input/
│   │   │   │   │   ├── library_use_case.py
│   │   │   │   ├── output/
│   │   │   │   │   ├── library_repository.py
│   │   │   │   │   ├── event_publisher.py
│   │   │   ├── adapters/
│   │   │   │   ├── input/
│   │   │   │   │   ├── rest_api.py
│   │   │   │   │   ├── kafka_consumer.py
│   │   │   │   ├── output/
│   │   │   │   │   ├── sql_repository.py
│   │   │   │   │   ├── kafka_producer.py
│   │   │   ├── schemas/
│   │   │   │   ├── book.py
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   ├── .env
│   ├── events-service/                 # Events Service (similar structure)
│   ├── attendance-service/             # Attendance Service
│   ├── hq-service/                     # HQ Service
│   ├── admin-service/                  # Admin Service
│   ├── frontend/                       # Next.js Frontend
│   │   ├── pages/
│   │   │   ├── index.tsx
│   │   │   ├── libraries/
│   │   │   │   ├── books.tsx           # Book management
│   │   │   ├── events/
│   │   │   │   ├── index.tsx           # Event management
│   │   │   ├── attendance/
│   │   │   │   ├── index.tsx           # Attendance tracking
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
│   ├── app/
│   │   ├── main.py
│   │   ├── config/
│   │   │   ├── settings.py
│   │   ├── routers/
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
│   │   ├── user-service.yaml
│   │   ├── hrms-service.yaml
│   │   ├── libraries-service.yaml
│   │   ├── api-gateway.yaml
│   │   ├── frontend-app1.yaml
│   │   ├── frontend-app2.yaml
│   ├── kafka/
│   │   ├── docker-compose.yml
│   ├── docker-compose.yml
│
├── README.md
├── .gitignore
```

---

## **Explanation of Folder Structure**

### **Root Directory**
- **`ecommerce-eda-hexagonal/`**: Organizes shared services, both applications, API Gateway, and infrastructure.
- **`shared-services/`**: Contains reusable services (User, User Profile) used by both applications.
- **`app1-business/`**: Application 1 with module-specific services and frontend.
- **`app2-school-erp/`**: Application 2 with module-specific services and frontend.
- **`api-gateway/`**: Routes frontend requests to services, handling authentication.
- **`infrastructure/`**: Kubernetes manifests, Kafka setup, and Docker Compose for local development.
- **`README.md`**, **`.gitignore`**: Documentation and Git exclusions.

### **Shared Services (`shared-services/`)**
- **`user-service/`**, **`user-profile-service/`**:
  - **Purpose**: Handle authentication, user data, and profiles for both applications.
  - **Structure**: Hexagonal architecture with domain core (`user_service.py`), ports (`user_use_case.py`), and adapters (`rest_api.py`, `kafka_producer.py`).
  - **Events**: Publishes `UserCreated` to notify other services (e.g., HRMS, Libraries).
  - **Database**: PostgreSQL with a shared schema.
  - **Example**: `user_service.py` creates a user and publishes `UserCreatedEvent`.

### **Application 1 (`app1-business/`)**
- **Services**:
  - **`hrms-service/`**: Manages employees, publishes `EmployeeHired`.
  - **`payroll-service/`**: Processes salaries, consumes `EmployeeHired`.
  - **`chat-service/`**: Real-time chat with WebSocket adapter, publishes `MessageSent`.
  - **`pipeline-service/`**: Manages CI/CD workflows, consumes `UserCreated`.
  - **Structure**: Each service follows hexagonal architecture with domain logic, ports, and async adapters (REST, Kafka, PostgreSQL).
- **Frontend**:
  - **Next.js**: Pages for each module (e.g., `/hrms/employees.tsx`).
  - **Services**: API clients (`hrmsService.ts`) and WebSocket client for chat.
  - **Async**: Uses Next.js API routes or server components for async data fetching.

### **Application 2 (`app2-school-erp/`)**
- **Services**:
  - **`libraries-service/`**: Manages books, publishes `BookBorrowed`.
  - **`events-service/`**: Tracks school events, publishes `EventScheduled`.
  - **`attendance-service/`**: Records attendance, consumes `EventScheduled`.
  - **`hq-service/`**, **`admin-service/`**: Manage school operations and admin tasks.
  - **Structure**: Similar hexagonal architecture with async adapters.
- **Frontend**:
  - **Next.js**: Pages for each module (e.g., `/libraries/books.tsx`).
  - **Async**: Server-side rendering for event lists, client-side for attendance updates.

### **API Gateway (`api-gateway/`)**
- Routes requests from both frontends to services (e.g., `/hrms` to `hrms-service`).
- Handles JWT authentication for secure access.
- Async FastAPI endpoints for responsiveness.

### **Infrastructure**
- **Kafka**: Manages events (e.g., topics: `users`, `hrms`, `libraries`).
- **PostgreSQL**: Per-service schemas or shared database with isolated tables.
- **Kubernetes**: Deploys services and frontends for scalability.
- **Docker Compose**: Local development with all components.

---

## **Implementation Guidelines**
1. **Start with a Modular Monolith**:
   - For each application, begin with a single FastAPI backend using hexagonal architecture (one service with module-specific domains).
   - Example: `app1-business/backend/` with `domain/hrms/`, `domain/payroll/`.
   - Extract to microservices as complexity grows.
2. **Event Design**:
   - Define domain events (e.g., `EmployeeHired`, `BookBorrowed`) and integration events for Kafka.
   - Use `pydantic` for event schemas:
     ```python
     from pydantic import BaseModel

     class EmployeeHiredEvent(BaseModel):
         employee_id: int
         name: str
         timestamp: str
     ```
3. **Kafka Integration**:
   - Use `aiokafka` for async producers/consumers:
     ```python
     from aiokafka import AIOKafkaProducer
     async def publish_event(event: EmployeeHiredEvent):
         producer = AIOKafkaProducer(bootstrap_servers="kafka:9092")
         await producer.start()
         await producer.send_and_wait("hrms", event.json().encode())
         await producer.stop()
     ```
4. **WebSocket for Chat**:
   - Implement a WebSocket adapter in `chat-service`:
     ```python
     from fastapi import WebSocket
     async def websocket_endpoint(websocket: WebSocket):
         await websocket.accept()
         while True:
             data = await websocket.receive_text()
             await websocket.send_text(f"Message: {data}")
     ```
   - Frontend: Use `WebSocket` API in `chatService.ts`.
5. **Next.js Async Features**:
   - Use server components or API routes for async data fetching:
     ```tsx
     // pages/hrms/employees.tsx
     import { getEmployees } from '@/services/hrmsService';
     export async function getServerSideProps() {
         const employees = await getEmployees();
         return { props: { employees } };
     }
     ```
6. **Database**:
   - Use PostgreSQL with SQLAlchemy for async queries:
     ```python
     from sqlalchemy.ext.asyncio import AsyncSession
     async def save_employee(db: AsyncSession, employee):
         await db.execute("INSERT INTO employees ...", employee)
     ```
   - Separate schemas for each service (e.g., `hrms`, `libraries`).
7. **Testing**:
   - Unit test domain logic by mocking ports.
   - Integration test adapters with `pytest-asyncio` and Kafka test containers.
   - Frontend tests with Jest and React Testing Library.
8. **Deployment**:
   - Containerize with Docker.
   - Deploy to Kubernetes with Helm charts for scalability.
   - Use managed Kafka (e.g., AWS MSK) and PostgreSQL (e.g., AWS RDS).

---

## **Sample Workflow**
- **App 1: Hiring an Employee**:
  - Frontend (`/hrms/employees.tsx`) sends POST to `/hrms/employees` via API Gateway.
  - API Gateway routes to `hrms-service`’s REST adapter.
  - REST adapter calls `HrmsUseCase`, which invokes `HrmsService` to create an employee and emit `EmployeeHiredEvent`.
  - `EmployeeHired` is saved to PostgreSQL and published to Kafka.
  - `payroll-service` consumes `EmployeeHired` to initialize payroll.
- **App 2: Borrowing a Book**:
  - Frontend (`/libraries/books.tsx`) sends POST to `/libraries/borrow`.
  - API Gateway routes to `libraries-service`.
  - `LibraryService` emits `BookBorrowedEvent`, saved and published to Kafka.
  - `events-service` consumes `BookBorrowed` to log a library event.

---

## **Conclusion**
**Event-Driven Hexagonal Architecture** is the best choice for your two applications, balancing modularity, asynchronous processing, scalability, and domain-driven design. It supports your tech stack (FastAPI, Next.js, PostgreSQL) and handles real-time features like Chat and Events. To manage complexity, start with a modular monolith per application, then extract services as needed. Use Kafka for events, SQLAlchemy for async database access, and Next.js for flexible frontend rendering. The provided folder structure organizes modules as hexagonal services, ensuring maintainability and scalability.

If you need detailed code samples (e.g., `hrms_service.py`, `chatService.ts`), a diagram, or guidance on specific modules (e.g., Chat WebSocket implementation), let me know!
