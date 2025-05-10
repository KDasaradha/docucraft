---
title: Event-Driven Architecture
description: Placeholder content for Event-Driven Architecture Folder Structures.
order: 4
---

# Event-Driven Architecture Folder Structures

Below is a detailed sample folder structure for an **Event-Driven Architecture (EDA)** using **FastAPI (Python)** for the backend services and **React (TypeScript)** for the frontend. The structure reflects EDA’s emphasis on asynchronous, loosely coupled components communicating via events, with a message broker (e.g., Kafka) managing event flows. This example implements an e-commerce platform with services for order processing, inventory management, and notifications, orchestrated through events. The notes include explanations of each directory/file and their roles in the EDA ecosystem.

---

## **Overview of the Event-Driven Architecture**
This example implements an e-commerce platform with the following components:
1. **Order Service**: Handles order creation and publishes events like "OrderPlaced."
2. **Inventory Service**: Consumes "OrderPlaced" events to update stock and publishes "InventoryUpdated" events.
3. **Notification Service**: Consumes "OrderPlaced" events to send email confirmations.
4. **Frontend**: A React/TypeScript application that interacts with the Order Service via REST APIs and displays results.

Additional components include:
- **Message Broker**: Apache Kafka for event routing and persistence.
- **API Gateway**: A FastAPI service routing frontend requests to the Order Service and potentially other services, simplifying client interactions.
- **Shared Infrastructure**: Configuration for Docker, Kubernetes, and Kafka.

Each service is an independent component, communicating asynchronously via Kafka events, reflecting EDA’s decentralized and scalable nature. The folder structure separates services into distinct directories, with the frontend acting as the user interface and the API Gateway providing a unified entry point.

---

## **Sample Folder Structure for Event-Driven Architecture**

```
ecommerce-eda/
├── order-service/              # Order Service (FastAPI, Producer/Consumer)
│   ├── app/                    # Core application logic
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI entry point for Order Service
│   │   ├── config/             # Configuration settings
│   │   │   ├── __init__.py
│   │   │   ├── settings.py     # Environment variables (e.g., DB URL, Kafka)
│   │   │   ├── database.py     # Database connection (SQLAlchemy)
│   │   ├── models/             # Database models
│   │   │   ├── __init__.py
│   │   │   ├── order.py        # Order model (id, customer_id, total)
│   │   ├── schemas/            # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── order.py        # Order schemas
│   │   ├── routers/            # API routes
│   │   │   ├── __init__.py
│   │   │   ├── orders.py       # Order endpoints (create, list)
│   │   ├── services/           # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── order_service.py # Order-related logic
│   │   ├── events/             # Event handling (Kafka)
│   │   │   ├── __init__.py
│   │   │   ├── producers.py    # Publishes events (e.g., OrderPlaced)
│   │   │   ├── consumers.py    # Consumes events (e.g., PaymentProcessed)
│   │   ├── utils/              # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── exceptions.py   # Custom exceptions
│   ├── tests/                  # Tests
│   │   ├── __init__.py
│   │   ├── test_orders.py
│   │   ├── test_events.py
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile              # Docker configuration
│   ├── .env                    # Environment variables
│
├── inventory-service/          # Inventory Service (FastAPI, Consumer/Producer)
│   ├── app/                    # Core application logic
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI entry point for Inventory Service
│   │   ├── config/             # Configuration settings
│   │   │   ├── __init__.py
│   │   │   ├── settings.py
│   │   │   ├── database.py     # MongoDB connection (Motor)
│   │   ├── models/             # Database models
│   │   │   ├── __init__.py
│   │   │   ├── product.py      # Product model (id, name, stock)
│   │   ├── schemas/            # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── product.py      # Product schemas
│   │   ├── routers/            # API routes (optional, for admin access)
│   │   │   ├── __init__.py
│   │   │   ├── products.py     # Product endpoints (list, update)
│   │   ├── services/           # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── inventory_service.py # Inventory-related logic
│   │   ├── events/             # Event handling
│   │   │   ├── __init__.py
│   │   │   ├── producers.py    # Publishes events (e.g., InventoryUpdated)
│   │   │   ├── consumers.py    # Consumes events (e.g., OrderPlaced)
│   │   ├── utils/              # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── exceptions.py
│   ├── tests/                  # Tests
│   │   ├── __init__.py
│   │   ├── test_inventory.py
│   │   ├── test_events.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env
│
├── notification-service/       # Notification Service (FastAPI, Consumer)
│   ├── app/                    # Core application logic
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI entry point for Notification Service
│   │   ├── config/             # Configuration settings
│   │   │   ├── __init__.py
│   │   │   ├── settings.py
│   │   ├── services/           # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── notification_service.py # Notification logic (e.g., email)
│   │   ├── events/             # Event handling
│   │   │   ├── __init__.py
│   │   │   ├── consumers.py    # Consumes events (e.g., OrderPlaced)
│   │   ├── utils/              # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── exceptions.py
│   ├── tests/                  # Tests
│   │   ├── __init__.py
│   │   ├── test_notifications.py
│   │   ├── test_events.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env
│
├── api-gateway/                # API Gateway (FastAPI)
│   ├── app/                    # Core application logic
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI entry point for API Gateway
│   │   ├── config/             # Configuration
│   │   │   ├── __init__.py
│   │   │   ├── settings.py     # Service URLs, JWT settings
│   │   ├── routers/            # Routing logic
│   │   │   ├── __init__.py
│   │   │   ├── proxy.py        # Routes requests to services
│   │   ├── utils/              # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # JWT authentication
│   │   │   ├── proxy.py        # HTTP proxy logic
│   ├── tests/                  # Tests
│   │   ├── __init__.py
│   │   ├── test_proxy.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env
│
├── frontend/                   # React (TypeScript) Frontend
│   ├── public/                 # Static assets
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   ├── manifest.json
│   │   ├── src/                # React source code
│   │   ├── assets/             # Images, fonts
│   │   │   ├── images/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Generic components (Button, Modal)
│   │   │   ├── auth/           # Auth components (LoginForm)
│   │   │   ├── order/          # Order components (OrderForm)
│   │   ├── pages/              # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── OrderDetail.tsx
│   │   ├── services/           # API client services
│   │   │   ├── api.ts          # Axios setup
│   │   │   ├── authService.ts
│   │   │   ├── orderService.ts
│   │   ├── types/              # TypeScript interfaces
│   │   │   ├── customer.ts
│   │   │   ├── order.ts
│   │   ├── utils/              # Utilities
│   │   │   ├── auth.ts
│   │   │   ├── formatters.ts
│   │   ├── App.tsx             # Main app with React Router
│   │   ├── index.tsx           # React entry point
│   │   ├── styles/             # CSS or styled-components
│   │   │   ├── global.css
│   │   │   ├── theme.ts
│   ├── tests/                  # Frontend tests
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env
│
├── infrastructure/             # Shared infrastructure
│   ├── kubernetes/             # Kubernetes manifests
│   │   ├── order-service.yaml
│   │   ├── inventory-service.yaml
│   │   ├── notification-service.yaml
│   │   ├── api-gateway.yaml
│   │   ├── frontend.yaml
│   ├── kafka/                  # Kafka configuration
│   │   ├── docker-compose.yml  # Kafka and Zookeeper
│   ├── docker-compose.yml       # Local development setup
│
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore file
```

---

## **Explanation of Folder Structure**

### **Root Directory**
- **`ecommerce-eda/`**: The root folder contains directories for each service, the API Gateway, the frontend, and shared infrastructure, reflecting EDA’s distributed, event-driven nature.
- **`infrastructure/`**:
  - **`kubernetes/`**: YAML files for deploying services to a Kubernetes cluster.
  - **`kafka/`**: Docker Compose for running Kafka and Zookeeper locally.
  - **`docker-compose.yml`**: Orchestrates all services for local development.
- **`README.md`**: Documents setup, architecture, and running instructions.
- **`.gitignore`**: Excludes files like `node_modules`, `__pycache__`, and `.env`.

### **Order Service (`order-service/`)**
Handles order creation, publishes "OrderPlaced" events, and consumes events like "PaymentProcessed." Uses FastAPI with PostgreSQL.

- **`app/`**:
  - **`main.py`**: FastAPI entry point, including API routes and event consumers.
    ```python
    from fastapi import FastAPI
    from app.routers import orders
    from app.events.consumers import start_consumers
    import asyncio

    app = FastAPI(title="Order Service")
    app.include_router(orders.router, prefix="/orders", tags=["orders"])

    @app.on_event("startup")
    async def startup_event():
        asyncio.create_task(start_consumers())

    @app.get("/")
    def read_root():
        return {"message": "Order Service"}
    ```
  - **`config/`**:
    - **`settings.py`**: Loads environment variables (e.g., `KAFKA_BOOTSTRAP_SERVERS`).
    - **`database.py`**: Sets up PostgreSQL with SQLAlchemy.
  - **`models/`**:
    - **`order.py`**: Order model.
      ```python
      from sqlalchemy import Column, Integer, Float
      from app.config.database import Base

      class Order(Base):
          __tablename__ = "orders"
          id = Column(Integer, primary_key=True)
          customer_id = Column(Integer)
          total = Column(Float)
      ```
  - **`schemas/`**:
    - **`order.py`**: Pydantic schemas.
      ```python
      from pydantic import BaseModel

      class OrderCreate(BaseModel):
          customer_id: int
          total: float
          items: list[dict]

      class OrderResponse(BaseModel):
          id: int
          customer_id: int
          total: float
      ```
  - **`routers/`**:
    - **`orders.py`**: Endpoints for order creation.
      ```python
      from fastapi import APIRouter, Depends
      from app.services.order_service import OrderService
      from app.schemas.order import OrderCreate, OrderResponse
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
          service = OrderService(db)
          return await service.create_order(order)
      ```
  - **`services/`**:
    - **`order_service.py`**: Business logic, publishing events.
      ```python
      from app.events.producers import publish_order_placed
      from app.data_access.repositories.order_repository import OrderRepository

      class OrderService:
          def __init__(self, db: Session):
              self.repo = OrderRepository(db)

          async def create_order(self, order_data: OrderCreate):
              order = self.repo.create_order(order_data)
              await publish_order_placed(order.id, order.customer_id, order.total)
              return order
      ```
  - **`events/`**:
    - **`producers.py`**: Publishes events to Kafka.
      ```python
      from aiokafka import AIOKafkaProducer
      import json
      from app.config.settings import KAFKA_BOOTSTRAP_SERVERS

      async def publish_order_placed(order_id: int, customer_id: int, total: float):
          producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)
          await producer.start()
          event = {"eventType": "OrderPlaced", "orderId": order_id, "customerId": customer_id, "total": total}
          await producer.send_and_wait("orders", json.dumps(event).encode())
          await producer.stop()
      ```
    - **`consumers.py`**: Consumes events (e.g., "PaymentProcessed").
      ```python
      from aiokafka import AIOKafkaConsumer
      from app.config.settings import KAFKA_BOOTSTRAP_SERVERS

      async def start_consumers():
          consumer = AIOKafkaConsumer("payments", bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)
          await consumer.start()
          async for msg in consumer:
              print(f"Consumed: {msg.value.decode()}")
      ```
  - **`utils/`**: Exception handling.
- **`tests/`**, **`requirements.txt`**, **`Dockerfile`**, **`.env`**: Includes Kafka dependencies (e.g., `aiokafka`).

### **Inventory Service (`inventory-service/`)**
Consumes "OrderPlaced" events to update stock and publishes "InventoryUpdated" events. Uses FastAPI with MongoDB for flexibility.

- **`app/`**:
  - **`main.py`**: FastAPI entry point, primarily for event consumers and optional admin APIs.
    ```python
    from fastapi import FastAPI
    from app.routers import products
    from app.events.consumers import start_consumers
    import asyncio

    app = FastAPI(title="Inventory Service")
    app.include_router(products.router, prefix="/products", tags=["products"])

    @app.on_event("startup")
    async def startup_event():
        asyncio.create_task(start_consumers())

    @app.get("/")
    def read_root():
        return {"message": "Inventory Service"}
    ```
  - **`config/`**: MongoDB connection setup (Motor).
  - **`models/`**, **`schemas/`**, **`routers/`**, **`services/`**: Similar to Order Service, but for inventory.
  - **`events/`**:
    - **`consumers.py`**: Consumes "OrderPlaced" events.
      ```python
      from aiokafka import AIOKafkaConsumer
      from app.services.inventory_service import InventoryService
      from app.config.settings import KAFKA_BOOTSTRAP_SERVERS
      import json

      async def start_consumers():
          consumer = AIOKafkaConsumer("orders", bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)
          await consumer.start()
          async for msg in consumer:
              event = json.loads(msg.value.decode())
              if event["eventType"] == "OrderPlaced":
                  service = InventoryService()
                  await service.update_inventory(event["orderId"], event["items"])
      ```
    - **`producers.py`**: Publishes "InventoryUpdated" events.
- **`tests/`**, **`requirements.txt`**, **`Dockerfile`**, **`.env`**: Includes MongoDB dependencies (e.g., `pymongo`).

### **Notification Service (`notification-service/`)**
Consumes "OrderPlaced" events to send emails. Uses FastAPI with minimal dependencies (no database).

- **`app/`**:
  - **`main.py`**: FastAPI entry point for event consumers.
  - **`services/`**:
    - **`notification_service.py`**: Sends emails.
      ```python
      class NotificationService:
          async def send_order_confirmation(self, order_id: int, customer_id: int):
              # Simulate email sending
              print(f"Sending email for order {order_id} to customer {customer_id}")
      ```
  - **`events/`**:
    - **`consumers.py`**: Consumes "OrderPlaced" events.
      ```python
      from aiokafka import AIOKafkaConsumer
      from app.services.notification_service import NotificationService
      import json

      async def start_consumers():
          consumer = AIOKafkaConsumer("orders", bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)
          await consumer.start()
          async for msg in consumer:
              event = json.loads(msg.value.decode())
              if event["eventType"] == "OrderPlaced":
                  service = NotificationService()
                  await service.send_order_confirmation(event["orderId"], event["customerId"])
      ```
- **`tests/`**, **`requirements.txt`**, **`Dockerfile`**, **`.env`**: Minimal dependencies.

### **API Gateway (`api-gateway/`)**
Routes frontend requests to the Order Service and handles authentication. Simplifies client interactions in an EDA context.

- **`app/`**:
  - **`main.py`**: FastAPI entry point.
    ```python
    from fastapi import FastAPI, Depends
    from app.utils.proxy import forward_request
    from app.utils.auth import verify_jwt

    app = FastAPI(title="API Gateway")

    @app.post("/orders", dependencies=[Depends(verify_jwt)])
    async def proxy_orders(data: dict):
        return await forward_request("order-service", "/orders", method="POST", data=data)

    @app.get("/orders/{path:path}", dependencies=[Depends(verify_jwt)])
    async def proxy_orders_get(path: str):
        return await forward_request("order-service", f"/orders/{path}")
    ```
  - **`config/`**, **`routers/`**, **`utils/`**: Similar to microservices gateway.
- **`tests/`**, **`requirements.txt`**, **`Dockerfile`**, **`.env`**: Minimal dependencies.

### **Frontend (`frontend/`)**
A React/TypeScript app interacting with the API Gateway, similar to microservices but tailored for EDA’s asynchronous workflows.

- **`public/`**: Static assets.
- **`src/`**:
  - **`components/`**, **`pages/`**:
    - **`Orders.tsx`**: Creates and lists orders.
      ```tsx
      import React, { useEffect, useState } from 'react';
      import { createOrder, getOrders } from '../services/orderService';
      import OrderForm from '../components/order/OrderForm';
      import { Order } from '../types/order';

      const Orders: React.FC = () => {
          const [orders, setOrders] = useState<Order[]>([]);
          useEffect(() => {
              getOrders().then(setOrders);
          }, []);
          const handleCreate = async (orderData: any) => {
              await createOrder(orderData);
              setOrders(await getOrders());
          };
          return (
              <div>
                  <h1>Orders</h1>
                  <OrderForm onSubmit={handleCreate} />
                  {orders.map(order => (
                      <div key={order.id}>{order.id} - ${order.total}</div>
                  ))}
              </div>
          );
      };
      ```
  - **`services/`**:
    - **`api.ts`**: Axios setup for API Gateway.
      ```ts
      import axios from 'axios';

      const api = axios.create({
          baseURL: process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080',
      });

      export default api;
      ```
    - **`orderService.ts`**: Order API calls.
      ```ts
      import api from './api';
      import { Order } from '../types/order';

      export const createOrder = async (order: any): Promise<Order> => {
          const response = await api.post('/orders', order);
          return response.data;
      };
      ```
  - **`types/`**, **`utils/`**, **`styles/`**, **`App.tsx`**, **`index.tsx`**: Similar to microservices frontend.
- **`tests/`**, **`package.json`**, **`tsconfig.json`**, **`Dockerfile`**, **`.env`**: Configured for API Gateway URL.

---

## **Running the Application**

### **Docker Compose Setup**
The `infrastructure/docker-compose.yml` orchestrates all services, databases, Kafka, and the frontend.

```yaml
version: '3.8'
services:
  order-service:
    build: ./order-service
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=postgresql://user:pass@order-db:5432/orders
      - KAFKA_BOOTSTRAP_SERVERS=kafka:9092
    depends_on:
      - order-db
      - kafka
  inventory-service:
    build: ./inventory-service
    ports:
      - "8002:8002"
    environment:
      - MONGODB_URL=mongodb://inventory-db:27017/inventory
      - KAFKA_BOOTSTRAP_SERVERS=kafka:9092
    depends_on:
      - inventory-db
      - kafka
  notification-service:
    build: ./notification-service
    ports:
      - "8003:8003"
    environment:
      - KAFKA_BOOTSTRAP_SERVERS=kafka:9092
    depends_on:
      - kafka
  api-gateway:
    build: ./api-gateway
    ports:
      - "8080:8080"
    environment:
      - ORDER_SERVICE_URL=http://order-service:8001
    depends_on:
      - order-service
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_GATEWAY_URL=http://api-gateway:8080
    depends_on:
      - api-gateway
  order-db:
    image: postgres:13
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=orders
  inventory-db:
    image: mongo:5
  kafka:
    image: confluentinc/cp-kafka:7.0.1
    depends_on:
      - zookeeper
    environment:
      - KAFKA_BROKER_ID=1
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092
  zookeeper:
    image: confluentinc/cp-zookeeper:7.0.1
    environment:
      - ZOOKEEPER_CLIENT_PORT=2181
volumes:
  order-db-data:
  inventory-db-data:
```

### **Steps to Run**
1. Install dependencies for each service:
   - Backend services: `cd order-service && pip install -r requirements.txt` (repeat for others).
   - Frontend: `cd frontend && npm install`.
2. Set up environment variables in each service’s `.env` file.
3. Run the application:
   - With Docker: `cd infrastructure && docker-compose up --build`.
   - Without Docker:
     - Start databases (PostgreSQL, MongoDB) and Kafka.
     - Start each service: `cd order-service && uvicorn app.main:app --host 0.0.0.0 --port 8001` (repeat for others).
     - Start API Gateway: `cd api-gateway && uvicorn app.main:app --host 0.0.0.0 --port 8080`.
     - Start frontend: `cd frontend && npm start`.
4. Access the app:
   - Frontend: `http://localhost:3000`.
   - API Gateway: `http://localhost:8080/docs`.
   - Individual services: `http://localhost:8001/docs` (Order), `8002/docs` (Inventory).

---

## **Key Features of the Structure**

1. **Event-Driven Communication**:
   - Services communicate via Kafka events (e.g., "OrderPlaced" triggers Inventory and Notification Services).
   - Loose coupling ensures services are independent.
2. **Independent Services**:
   - Each service (`order-service`, `inventory-service`, `notification-service`) has its own codebase, database, and deployment.
3. **Message Broker**:
   - Kafka handles event routing and persistence, enabling scalability and fault tolerance.
4. **Polyglot Persistence**:
   - Order Service: PostgreSQL (relational).
   - Inventory Service: MongoDB (document-based).
   - Notification Service: No database (stateless).
5. **API Gateway**:
   - Simplifies frontend interactions by routing requests to the Order Service.
   - Handles authentication, reducing service complexity.
6. **Choreography**:
   - Services react to events independently (e.g., Inventory and Notification Services both consume "OrderPlaced").
7. **Scalability**:
   - Services can be scaled independently (e.g., more Inventory Service instances during peak demand).
   - Kubernetes manifests support production deployment.
8. **Type Safety**:
   - TypeScript in the frontend and Pydantic in the backend ensure robust validation.

---

## **Sample Workflow**
- **Order Placement**:
  - Frontend: `Orders.tsx` sends POST to `/orders` via API Gateway.
  - API Gateway: Verifies JWT, routes to Order Service.
  - Order Service: Creates order, saves to PostgreSQL, publishes "OrderPlaced" to Kafka.
  - Inventory Service: Consumes "OrderPlaced," updates stock in MongoDB, publishes "InventoryUpdated."
  - Notification Service: Consumes "OrderPlaced," sends email confirmation.
- **Order Status Update**:
  - A Payment Service (not shown) could publish "PaymentProcessed."
  - Order Service consumes it to update order status.

---

## **Extending the Structure**
To add a new service (e.g., Payment Service):
1. Create a new directory (`payment-service/`) with the same structure.
2. Define models, schemas, and services for payments.
3. Add a database (e.g., MySQL) and Kafka consumer/producer logic.
4. Update the API Gateway to route `/payments` if needed.
5. Update the frontend to include payment-related components and API calls.
6. Add Kubernetes manifests and update `docker-compose.yml`.

---

## **Comparison with Other Architectures**
- **Monolith/Layered**: Single codebase, synchronous calls, less scalable.
- **Microservices**: Similar to EDA but may use synchronous APIs; EDA emphasizes events.
- **SOA**: Uses coarse-grained services and ESB; EDA is more lightweight and event-focused.
- **Frontend**: Similar across architectures, but EDA frontend interacts with an API Gateway and expects asynchronous outcomes.

---

If you need sample code for specific files (e.g., `producers.py`, `consumers.py`, `Orders.tsx`), a diagram of the architecture (via a canvas panel), or guidance on implementing event sourcing, a specific feature, or scaling Kafka, let me know!
