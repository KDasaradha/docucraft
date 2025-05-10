---
title: Event-Driven Hexagonal
description: Placeholder content for Event-Driven Hexagonal Folder Structures.
order: 5
---

# Event-Driven Hexagonal Folder Structures

# **Sample Folder Structure for Event-Driven Hexagonal Architecture**

Below is a sample folder structure for an **Event-Driven Hexagonal Architecture** using **FastAPI (Python)** for the backend services and **React (TypeScript)** for the frontend. The structure adapts the EDA folder structure to incorporate hexagonal principles (ports, adapters, and domain-centric core) within each service. The example continues the e-commerce platform with Order, Inventory, and Notification Services, using Kafka as the message broker.

```
ecommerce-eda-hexagonal/
├── order-service/              # Order Service (FastAPI, Hexagonal)
│   ├── app/                    # Core application logic
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI entry point
│   │   ├── config/             # Configuration settings
│   │   │   ├── __init__.py
│   │   │   ├── settings.py     # Environment variables (e.g., DB URL, Kafka)
│   │   │   ├── database.py     # Database connection (SQLAlchemy)
│   │   ├── domain/             # Core (Domain Layer)
│   │   │   ├── __init__.py
│   │   │   ├── entities/       # Domain entities
│   │   │   │   ├── __init__.py
│   │   │   │   ├── order.py    # Order entity
│   │   │   ├── events/         # Domain events
│   │   │   │   ├── __init__.py
│   │   │   │   ├── order_placed.py # OrderPlacedEvent
│   │   │   ├── services/       # Domain services
│   │   │   │   ├── __init__.py
│   │   │   │   ├── order_service.py # Order business logic
│   │   ├── ports/              # Ports (Interfaces)
│   │   │   ├── __init__.py
│   │   │   ├── input/          # Input ports (use cases)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── order_use_case.py # CreateOrderUseCase
│   │   │   ├── output/         # Output ports
│   │   │   │   ├── __init__.py
│   │   │   │   ├── order_repository.py # OrderRepositoryPort
│   │   │   │   ├── event_publisher.py # EventPublisherPort
│   │   ├── adapters/           # Adapters
│   │   │   ├── __init__.py
│   │   │   ├── input/          # Input adapters
│   │   │   │   ├── __init__.py
│   │   │   │   ├── rest_api.py # REST API adapter
│   │   │   │   ├── kafka_consumer.py # Kafka consumer adapter
│   │   │   ├── output/         # Output adapters
│   │   │   │   ├── __init__.py
│   │   │   │   ├── sql_repository.py # PostgreSQL adapter
│   │   │   │   ├── kafka_producer.py # Kafka producer adapter
│   │   ├── schemas/            # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── order.py        # Order schemas
│   │   ├── utils/              # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── exceptions.py   # Custom exceptions
│   ├── tests/                  # Tests
│   │   ├── __init__.py
│   │   ├── test_domain.py
│   │   ├── test_adapters.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env
│
├── inventory-service/          # Inventory Service (FastAPI, Hexagonal)
│   ├── app/                    # Similar structure to Order Service
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config/
│   │   │   ├── settings.py
│   │   │   ├── database.py     # MongoDB connection (Motor)
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── product.py
│   │   │   ├── events/
│   │   │   │   ├── inventory_updated.py
│   │   │   ├── services/
│   │   │   │   ├── inventory_service.py
│   │   ├── ports/
│   │   │   ├── input/
│   │   │   │   ├── inventory_use_case.py
│   │   │   ├── output/
│   │   │   │   ├── product_repository.py
│   │   │   │   ├── event_publisher.py
│   │   ├── adapters/
│   │   │   ├── input/
│   │   │   │   ├── kafka_consumer.py
│   │   │   ├── output/
│   │   │   │   ├── mongo_repository.py
│   │   │   │   ├── kafka_producer.py
│   │   ├── schemas/
│   │   │   ├── product.py
│   │   ├── utils/
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env
│
├── notification-service/       # Notification Service (FastAPI, Hexagonal)
│   ├── app/                    # Simplified structure
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config/
│   │   │   ├── settings.py
│   │   ├── domain/
│   │   │   ├── services/
│   │   │   │   ├── notification_service.py
│   │   ├── ports/
│   │   │   ├── input/
│   │   │   │   ├── notification_use_case.py
│   │   ├── adapters/
│   │   │   ├── input/
│   │   │   │   ├── kafka_consumer.py
│   │   │   ├── output/
│   │   │   │   ├── email_adapter.py
│   │   ├── utils/
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env
│
├── api-gateway/                # API Gateway (FastAPI)
│   ├── app/
│   │   ├── __init__.py
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
├── frontend/                   # React (TypeScript) Frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   ├── manifest.json
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── auth/
│   │   │   ├── order/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── OrderDetail.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── orderService.ts
│   │   ├── types/
│   │   │   ├── customer.ts
│   │   │   ├── order.ts
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── styles/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env
│
├── infrastructure/
│   ├── kubernetes/
│   │   ├── order-service.yaml
│   │   ├── inventory-service.yaml
│   │   ├── notification-service.yaml
│   │   ├── api-gateway.yaml
│   │   ├── frontend.yaml
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
- **`ecommerce-eda-hexagonal/`**: Contains directories for each service, API Gateway, frontend, and infrastructure, reflecting the distributed nature of EDA with hexagonal organization within services.
- **`infrastructure/`**:
  - **`kubernetes/`**: YAML files for Kubernetes deployment.
  - **`kafka/`**: Docker Compose for Kafka and Zookeeper.
  - **`docker-compose.yml`**: Orchestrates all services for local development.
- **`README.md`**: Documents setup and architecture.
- **`.gitignore`**: Excludes `node_modules`, `__pycache__`, and `.env`.

### **Order Service (`order-service/`)**
Implements a hexagonal architecture, with a domain-centric core, ports, and adapters. Publishes `OrderPlaced` events and consumes `PaymentProcessed`. Uses FastAPI and PostgreSQL.

- **`app/`**:
  - **`main.py`**: FastAPI entry point, initializing REST API and Kafka consumers.
    ```python
    from fastapi import FastAPI
    from app.adapters.input.rest_api import router as rest_router
    from app.adapters.input.kafka_consumer import start_consumers
    import asyncio

    app = FastAPI(title="Order Service")
    app.include_router(rest_router, prefix="/orders", tags=["orders"])

    @app.on_event("startup")
    async def startup_event():
        asyncio.create_task(start_consumers())

    @app.get("/")
    def read_root():
        return {"message": "Order Service"}
    ```
  - **`config/`**:
    - **`settings.py`**: Environment variables (e.g., `KAFKA_BOOTSTRAP_SERVERS`).
    - **`database.py`**: PostgreSQL setup with SQLAlchemy.
  - **`domain/`** (Core):
    - **`entities/`**:
      - **`order.py`**: Order entity.
        ```python
        from dataclasses import dataclass
        from app.domain.events.order_placed import OrderPlacedEvent

        @dataclass
        class Order:
            id: int
            customer_id: int
            total: float

            def place(self) -> OrderPlacedEvent:
                return OrderPlacedEvent(order_id=self.id, customer_id=self.customer_id, total=self.total)
        ```
    - **`events/`**:
      - **`order_placed.py`**: Domain event.
        ```python
        from dataclasses import dataclass

        @dataclass
        class OrderPlacedEvent:
            order_id: int
            customer_id: int
            total: float
        ```
    - **`services/`**:
      - **`order_service.py`**: Business logic.
        ```python
        from app.domain.entities.order import Order
        from app.ports.output.order_repository import OrderRepositoryPort
        from app.ports.output.event_publisher import EventPublisherPort

        class OrderService:
            def __init__(self, repo: OrderRepositoryPort, publisher: EventPublisherPort):
                self.repo = repo
                self.publisher = publisher

            async def create_order(self, customer_id: int, total: float, items: list[dict]) -> Order:
                order = Order(id=0, customer_id=customer_id, total=total)
                saved_order = self.repo.save(order, items)
                event = saved_order.place()
                await self.publisher.publish(event)
                return saved_order
        ```
  - **`ports/`**:
    - **`input/`**:
      - **`order_use_case.py`**: Input port.
        ```python
        from abc import ABC, abstractmethod
        from app.domain.entities.order import Order

        class CreateOrderUseCase(ABC):
            @abstractmethod
            async def create_order(self, customer_id: int, total: float, items: list[dict]) -> Order:
                pass
        ```
    - **`output/`**:
      - **`order_repository.py`**: Output port.
        ```python
        from abc import ABC, abstractmethod
        from app.domain.entities.order import Order

        class OrderRepositoryPort(ABC):
            @abstractmethod
            def save(self, order: Order, items: list[dict]) -> Order:
                pass
        ```
      - **`event_publisher.py`**: Event publisher port.
        ```python
        from abc import ABC, abstractmethod
        from app.domain.events.order_placed import OrderPlacedEvent

        class EventPublisherPort(ABC):
            @abstractmethod
            async def publish(self, event: OrderPlacedEvent) -> None:
                pass
        ```
  - **`adapters/`**:
    - **`input/`**:
      - **`rest_api.py`**: REST adapter.
        ```python
        from fastapi import APIRouter, Depends
        from app.schemas.order import OrderCreate, OrderResponse
        from app.domain.services.order_service import OrderService
        from app.config.database import SessionLocal

        router = APIRouter()

        def get_db():
            db = SessionLocal()
            try:
                yield db
            finally:
                db.close()

        @router.post("/", response_model=OrderResponse)
        async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
            service = OrderService(...)  # Inject dependencies
            return await service.create_order(order.customer_id, order.total, order.items)
        ```
      - **`kafka_consumer.py`**: Kafka consumer adapter.
        ```python
        from aiokafka import AIOKafkaConsumer
        from app.config.settings import KAFKA_BOOTSTRAP_SERVERS
        import json

        async def start_consumers():
            consumer = AIOKafkaConsumer("payments", bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)
            await consumer.start()
            async for msg in consumer:
                event = json.loads(msg.value.decode())
                print(f"Consumed: {event}")
        ```
    - **`output/`**:
      - **`sql_repository.py`**: PostgreSQL adapter.
        ```python
        from sqlalchemy.orm import Session
        from app.ports.output.order_repository import OrderRepositoryPort
        from app.domain.entities.order import Order

        class SQLOrderRepository(OrderRepositoryPort):
            def __init__(self, db: Session):
                self.db = db

            def save(self, order: Order, items: list[dict]) -> Order:
                # Save to database
                return order
        ```
      - **`kafka_producer.py`**: Kafka producer adapter.
        ```python
        from aiokafka import AIOKafkaProducer
        from app.ports.output.event_publisher import EventPublisherPort
        from app.domain.events.order_placed import OrderPlacedEvent
        import json

        class KafkaEventPublisher(EventPublisherPort):
            def __init__(self, bootstrap_servers: str):
                self.producer = AIOKafkaProducer(bootstrap_servers=bootstrap_servers)

            async def publish(self, event: OrderPlacedEvent) -> None:
                await self.producer.start()
                event_data = {"eventType": "OrderPlaced", "orderId": event.order_id, "customerId": event.customer_id, "total": event.total}
                await self.producer.send_and_wait("orders", json.dumps(event_data).encode())
                await self.producer.stop()
        ```
  - **`schemas/`**, **`utils/`**: Similar to EDA structure.
- **`tests/`**, **`requirements.txt`**, **`Dockerfile`**, **`.env`**: Includes Kafka and SQLAlchemy dependencies.

### **Inventory Service (`inventory-service/`)**
Similar hexagonal structure, consumes `OrderPlaced` events, updates stock, and publishes `InventoryUpdated`. Uses FastAPI and MongoDB.

- **`app/`**:
  - **`domain/`**:
    - **`entities/product.py`**, **`events/inventory_updated.py`**, **`services/inventory_service.py`**: Define product entity, events, and logic.
  - **`ports/`**:
    - **`input/inventory_use_case.py`**, **`output/product_repository.py`**, **`output/event_publisher.py`**: Define use cases and repository/publisher ports.
  - **`adapters/`**:
    - **`input/kafka_consumer.py`**: Consumes `OrderPlaced`.
    - **`output/mongo_repository.py`**: MongoDB adapter.
    - **`output/kafka_producer.py`**: Publishes `InventoryUpdated`.
- **`tests/`**, **`requirements.txt`**, **`Dockerfile`**, **`.env`**: Includes MongoDB dependencies.

### **Notification Service (`notification-service/`)**
Simplified hexagonal structure, consumes `OrderPlaced` events to send emails. Uses FastAPI, no database.

- **`app/`**:
  - **`domain/services/notification_service.py`**: Notification logic.
  - **`ports/input/notification_use_case.py`**: Use case port.
  - **`adapters/input/kafka_consumer.py`**: Consumes events.
  - **`adapters/output/email_adapter.py`**: Sends emails.
- **`tests/`**, **`requirements.txt`**, **`Dockerfile`**, **`.env`**: Minimal dependencies.

### **API Gateway (`api-gateway/`)**
Routes frontend requests to the Order Service, similar to the EDA structure.

- **`app/`**:
  - **`main.py`**, **`config/`**, **`routers/`**, **`utils/`**: Same as EDA API Gateway.
- **`tests/`**, **`requirements.txt`**, **`Dockerfile`**, **`.env`**: Minimal dependencies.

### **Frontend (`frontend/`)**
React/TypeScript frontend, identical to the EDA structure, interacting with the API Gateway.

- **`public/`**, **`src/`**, **`tests/`**, **`package.json`**, **`tsconfig.json`**, **`Dockerfile`**, **`.env`**: Same as EDA frontend.

---

## **Running the Application**

### **Docker Compose Setup**
The `infrastructure/docker-compose.yml` is identical to the EDA structure, orchestrating services, databases, Kafka, and the frontend.

### **Steps to Run**
1. Install dependencies:
   - Backend services: `cd order-service && pip install -r requirements.txt` (repeat for others).
   - Frontend: `cd frontend && npm install`.
2. Set up environment variables in each `.env` file.
3. Run: `cd infrastructure && docker-compose up --build`.
4. Access:
   - Frontend: `http://localhost:3000`.
   - API Gateway: `http://localhost:8080/docs`.
   - Order Service: `http://localhost:8001/docs`.

---

## **Key Features of the Structure**

1. **Hexagonal Organization**:
   - Each service has a domain-centric core (`domain/`), ports (`ports/`), and adapters (`adapters/`).
   - Example: `OrderService` is isolated, interacting via `CreateOrderUseCase` and `OrderRepositoryPort`.
2. **Event-Driven Communication**:
   - Services communicate via Kafka events (e.g., `OrderPlaced` triggers Inventory and Notification).
   - Adapters handle event publishing/consuming.
3. **Loose Coupling**:
   - Ports and events decouple the core from external systems and other services.
4. **Testability**:
   - The core is testable by mocking ports (e.g., mock `OrderRepositoryPort`).
5. **Polyglot Persistence**:
   - Order Service: PostgreSQL.
   - Inventory Service: MongoDB.
   - Notification Service: Stateless.
6. **Scalability**:
   - Services and adapters can be scaled independently, with Kafka handling event loads.
7. **Domain-Driven Design**:
   - Domain events (`OrderPlacedEvent`) align with DDD principles.

---

## **Sample Workflow**
- **Order Placement**:
  - Frontend sends POST to `/orders` via API Gateway.
  - API Gateway routes to Order Service’s REST adapter (`rest_api.py`).
  - REST adapter calls `CreateOrderUseCase`, which invokes `OrderService`.
  - `OrderService` creates an `Order`, saves it via `OrderRepositoryPort` (SQL adapter), and publishes `OrderPlacedEvent` via `EventPublisherPort` (Kafka adapter).
  - Inventory Service’s Kafka consumer adapter receives `OrderPlaced`, calls `UpdateInventoryUseCase`, updates stock, and publishes `InventoryUpdated`.
  - Notification Service’s Kafka consumer adapter receives `OrderPlaced` and sends an email.

---

## **Extending the Structure**
To add a Payment Service:
1. Create `payment-service/` with hexagonal structure (`domain/`, `ports/`, `adapters/`).
2. Define `Payment` entity, `PaymentProcessedEvent`, and `PaymentService`.
3. Add ports (`ProcessPaymentUseCase`, `PaymentRepositoryPort`, `EventPublisherPort`).
4. Implement adapters (Kafka consumer for `OrderPlaced`, MySQL repository, Kafka producer).
5. Update API Gateway and frontend if needed.
6. Update `docker-compose.yml` and Kubernetes manifests.

---

## **Comparison with EDA**
- **EDA**: Focuses on events and asynchronous communication, with less emphasis on internal structure.
- **Event-Driven Hexagonal**: Adds hexagonal structure (ports, adapters, domain core) for modularity and testability within services.
- **Folder Structure**: EDA has simpler service structures; hexagonal adds `domain/`, `ports/`, `adapters/`.
- **Use Case**: EDA suits general event-driven systems; hexagonal is ideal for domain-driven, complex applications.

---

If you need sample code for specific files (e.g., `order_service.py`, `rest_api.py`, `kafka_producer.py`), a diagram (via a canvas panel), or guidance on event sourcing, DDD, or scaling, let me know!
