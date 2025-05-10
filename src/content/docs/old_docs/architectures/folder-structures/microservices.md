---
title: Microservices
description: Placeholder content for Microservices Folder Structures.
order: 2
---

# Microservices Folder Structures

Below is a detailed sample folder structure for a **Microservices Architecture** using **FastAPI (Python)** for the backend services and **React (TypeScript)** for the frontend. This structure reflects the distributed nature of microservices, with separate codebases for each service (e.g., User Service, Product Service, Order Service) and a shared frontend that communicates with these services via an **API Gateway**. The notes include explanations of each directory/file, their roles, and how they integrate into a microservices-based e-commerce application.

---

## **Overview of the Microservices Architecture**
This example implements an e-commerce platform with three microservices:
1. **User Service**: Handles user authentication, registration, and profiles.
2. **Product Service**: Manages product catalog and inventory.
3. **Order Service**: Processes orders and payments.

Additional components include:
- **API Gateway**: Routes client requests to the appropriate service and handles cross-cutting concerns (e.g., authentication).
- **Frontend**: A React/TypeScript application that interacts with the backend via the API Gateway.
- **Shared Infrastructure**: Configuration for Docker, Kubernetes, and message brokers (e.g., Kafka for event-driven communication).

Each microservice has its own codebase, database, and deployment pipeline, reflecting the principles of loose coupling and independent deployability. The folder structure is organized as separate repositories for clarity, but they can be managed in a single repository with proper separation if preferred.

---

## **Sample Folder Structure for Microservices Architecture**

```
ecommerce-microservices/
├── user-service/               # User Service (FastAPI)
│   ├── app/                    # Core application logic
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI entry point for User Service
│   │   ├── config/             # Configuration settings
│   │   │   ├── __init__.py
│   │   │   ├── settings.py     # Environment variables (e.g., DB URL)
│   │   │   ├── database.py     # Database connection (e.g., SQLAlchemy)
│   │   ├── models/             # Database models
│   │   │   ├── __init__.py
│   │   │   ├── user.py         # User model (id, email, password)
│   │   ├── schemas/            # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py         # User schemas (UserCreate, UserResponse)
│   │   ├── routers/            # API routes
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # Auth endpoints (login, register)
│   │   │   ├── users.py        # User endpoints (get profile)
│   │   ├── services/           # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py # Authentication logic (JWT)
│   │   │   ├── user_service.py # User-related logic
│   │   ├── utils/              # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── security.py     # Password hashing, JWT
│   │   │   ├── exceptions.py   # Custom exceptions
│   ├── tests/                  # Unit and integration tests
│   │   ├── __init__.py
│   │   ├── test_auth.py
│   │   ├── test_users.py
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile              # Docker configuration
│   ├── .env                    # Environment variables
│
├── product-service/            # Product Service (FastAPI)
│   ├── app/                    # Core application logic
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI entry point for Product Service
│   │   ├── config/             # Configuration settings
│   │   │   ├── __init__.py
│   │   │   ├── settings.py
│   │   │   ├── database.py     # MongoDB connection (e.g., Motor)
│   │   ├── models/             # Database models
│   │   │   ├── __init__.py
│   │   │   ├── product.py      # Product model (id, name, price)
│   │   ├── schemas/            # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── product.py      # Product schemas
│   │   ├── routers/            # API routes
│   │   │   ├── __init__.py
│   │   │   ├── products.py     # Product endpoints (list, create)
│   │   ├── services/           # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── product_service.py # Product-related logic
│   │   ├── utils/              # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── exceptions.py
│   ├── tests/                  # Tests
│   │   ├── __init__.py
│   │   ├── test_products.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env
│
├── order-service/              # Order Service (FastAPI)
│   ├── app/                    # Core application logic
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI entry point for Order Service
│   │   ├── config/             # Configuration settings
│   │   │   ├── __init__.py
│   │   │   ├── settings.py
│   │   │   ├── database.py     # Database connection
│   │   ├── models/             # Database models
│   │   │   ├── __init__.py
│   │   │   ├── order.py        # Order model (id, user_id, total)
│   │   ├── schemas/            # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── order.py        # Order schemas
│   │   ├── routers/            # API routes
│   │   │   ├── __init__.py
│   │   │   ├── orders.py       # Order endpoints (create, list)
│   │   ├── services/           # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── order_service.py # Order-related logic
│   │   ├── utils/              # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── exceptions.py
│   │   ├── events/             # Event handling (Kafka)
│   │   │   ├── __init__.py
│   │   │   ├── kafka_producer.py # Publishes events (e.g., OrderCreated)
│   │   │   ├── kafka_consumer.py # Consumes events
│   ├── tests/                  # Tests
│   │   ├── __init__.py
│   │   ├── test_orders.py
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
│   ├── src/                    # React source code
│   │   ├── assets/             # Images, fonts
│   │   │   ├── images/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Generic components (Button, Modal)
│   │   │   ├── auth/           # Auth components (LoginForm)
│   │   │   ├── product/        # Product components (ProductCard)
│   │   │   ├── order/          # Order components (OrderSummary)
│   │   ├── pages/              # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Orders.tsx
│   │   ├── services/           # API client services
│   │   │   ├── api.ts          # Axios setup
│   │   │   ├── authService.ts
│   │   │   ├── productService.ts
│   │   │   ├── orderService.ts
│   │   ├── types/              # TypeScript interfaces
│   │   │   ├── user.ts
│   │   │   ├── product.ts
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
│   │   ├── user-service.yaml
│   │   ├── product-service.yaml
│   │   ├── order-service.yaml
│   │   ├── api-gateway.yaml
│   │   ├── frontend.yaml
│   ├── docker-compose.yml       # Local development setup
│   ├── kafka/                  # Kafka configuration
│   │   ├── docker-compose.yml  # Kafka and Zookeeper
│
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore file
```

---

## **Explanation of Folder Structure**

### **Root Directory**
- **`ecommerce-microservices/`**: The root folder contains separate directories for each microservice, the API Gateway, the frontend, and shared infrastructure. This reflects the distributed nature of microservices.
- **`infrastructure/`**: Contains configuration for orchestration (Kubernetes) and message brokers (Kafka).
  - **`kubernetes/`**: YAML files for deploying services to a Kubernetes cluster.
  - **`kafka/`**: Docker Compose for running Kafka and Zookeeper locally.
  - **`docker-compose.yml`**: Orchestrates all services for local development.
- **`README.md`**: Documents setup, architecture, and running instructions.
- **`.gitignore`**: Excludes files like `node_modules`, `__pycache__`, and `.env`.

### **User Service (`user-service/`)**
Handles user-related functionality (e.g., authentication, profiles). Uses FastAPI with PostgreSQL.

- **`app/`**:
  - **`main.py`**: FastAPI entry point for the User Service.
    ```python
    from fastapi import FastAPI
    from app.routers import auth, users

    app = FastAPI(title="User Service")
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(users.router, prefix="/users", tags=["users"])

    @app.get("/")
    def read_root():
        return {"message": "User Service"}
    ```
  - **`config/`**:
    - **`settings.py`**: Loads environment variables (e.g., `DATABASE_URL`).
    - **`database.py`**: Sets up PostgreSQL with SQLAlchemy.
  - **`models/`**:
    - **`user.py`**: Defines the User model.
      ```python
      from sqlalchemy import Column, Integer, String
      from app.config.database import Base

      class User(Base):
          __tablename__ = "users"
          id = Column(Integer, primary_key=True)
          email = Column(String, unique=True)
          password = Column(String)
      ```
  - **`schemas/`**:
    - **`user.py`**: Pydantic schemas for validation.
      ```python
      from pydantic import BaseModel, EmailStr

      class UserCreate(BaseModel):
          email: EmailStr
          password: str

      class UserResponse(BaseModel):
          id: int
          email: EmailStr
      ```
  - **`routers/`**:
    - **`auth.py`**: Endpoints for login/register.
    - **`users.py`**: Endpoints for user profile.
  - **`services/`**:
    - **`auth_service.py`**: Handles JWT generation and password hashing.
    - **`user_service.py`**: Business logic for user operations.
  - **`utils/`**: Security (e.g., `security.py` for hashing) and exceptions.
- **`tests/`**: Unit tests with `pytest`.
- **`requirements.txt`**: Dependencies (e.g., `fastapi`, `sqlalchemy`, `psycopg2`).
- **`Dockerfile`**: Containerizes the service.
- **`.env`**: Environment variables (e.g., `DATABASE_URL=postgresql://user:pass@db:5432/users`).

### **Product Service (`product-service/`)**
Manages product catalog and inventory. Uses FastAPI with MongoDB for flexibility with unstructured data.

- **`app/`**:
  - **`main.py`**: FastAPI entry point.
    ```python
    from fastapi import FastAPI
    from app.routers import products

    app = FastAPI(title="Product Service")
    app.include_router(products.router, prefix="/products", tags=["products"])

    @app.get("/")
    def read_root():
        return {"message": "Product Service"}
    ```
  - **`config/`**:
    - **`database.py`**: Sets up MongoDB with Motor (async driver).
  - **`models/`**:
    - **`product.py`**: Defines the Product model (MongoDB document).
  - **`schemas/`**:
    - **`product.py`**: Pydantic schemas.
      ```python
      from pydantic import BaseModel

      class ProductCreate(BaseModel):
          name: str
          price: float
          description: str | None

      class ProductResponse(BaseModel):
          id: str
          name: str
          price: float
      ```
  - **`routers/`**:
    - **`products.py`**: Endpoints for product CRUD operations.
  - **`services/`**:
    - **`product_service.py`**: Business logic for products.
- **`tests/`**, **`requirements.txt`**, **`Dockerfile`**, **`.env`**: Similar to User Service, with MongoDB-specific dependencies (e.g., `pymongo`).

### **Order Service (`order-service/`)**
Processes orders and integrates with Kafka for event-driven communication. Uses FastAPI with MySQL.

- **`app/`**:
  - **`main.py`**: FastAPI entry point.
  - **`config/`**: MySQL connection setup.
  - **`models/`**:
    - **`order.py`**: Order model.
  - **`schemas/`**:
    - **`order.py`**: Order schemas.
  - **`routers/`**:
    - **`orders.py`**: Order endpoints.
  - **`services/`**:
    - **`order_service.py`**: Business logic (e.g., create order, fetch user/product data via REST).
  - **`events/`**:
    - **`kafka_producer.py`**: Publishes events (e.g., “OrderCreated”).
      ```python
      from aiokafka import AIOKafkaProducer
      import json

      async def publish_order_created(order_id: int):
          producer = AIOKafkaProducer(bootstrap_servers="kafka:9092")
          await producer.start()
          await producer.send_and_wait("orders", json.dumps({"order_id": order_id}).encode())
          await producer.stop()
      ```
    - **`kafka_consumer.py`**: Consumes events (if needed).
- **`tests/`**, **`requirements.txt`**, **`Dockerfile`**, **`.env`**: Includes Kafka dependencies (e.g., `aiokafka`).

### **API Gateway (`api-gateway/`)**
Routes requests to services and handles authentication. Uses FastAPI for simplicity.

- **`app/`**:
  - **`main.py`**: FastAPI entry point.
    ```python
    from fastapi import FastAPI, HTTPException
    from app.utils.proxy import forward_request
    from app.utils.auth import verify_jwt

    app = FastAPI(title="API Gateway")

    @app.get("/users/{path:path}", dependencies=[Depends(verify_jwt)])
    async def proxy_users(path: str):
        return await forward_request("user-service", path)

    @app.get("/products/{path:path}")
    async def proxy_products(path: str):
        return await forward_request("product-service", path)
    ```
  - **`config/`**: Service URLs and JWT settings.
  - **`routers/`**:
    - **`proxy.py`**: Routes requests to services.
  - **`utils/`**:
    - **`auth.py`**: JWT verification.
    - **`proxy.py`**: HTTP client to forward requests.
- **`tests/`**, **`requirements.txt`**, **`Dockerfile`**, **`.env`**: Minimal dependencies.

### **Frontend (`frontend/`)**
A React/TypeScript app that interacts with the API Gateway. Similar to the monolithic frontend but communicates with a single endpoint (API Gateway).

- **`public/`**: Static assets.
- **`src/`**:
  - **`components/`**:
    - **`auth/`**, **`product/`**, **`order/`**: Feature-specific components.
  - **`pages/`**:
    - **`Products.tsx`**: Fetches products via API Gateway.
      ```tsx
      import React, { useEffect, useState } from 'react';
      import { getProducts } from '../services/productService';
      import ProductCard from '../components/product/ProductCard';
      import { Product } from '../types/product';

      const Products: React.FC = () => {
          const [products, setProducts] = useState<Product[]>([]);
          useEffect(() => {
              getProducts().then(setProducts);
          }, []);
          return (
              <div>
                  <h1>Products</h1>
                  {products.map(product => (
                      <ProductCard key={product.id} product={product} />
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
    - **`productService.ts`**: API calls for products.
      ```ts
      import api from './api';
      import { Product } from '../types/product';

      export const getProducts = async (): Promise<Product[]> => {
          const response = await api.get('/products');
          return response.data;
      };
      ```
  - **`types/`**, **`utils/`**, **`styles/`**, **`App.tsx`**, **`index.tsx`**: Similar to monolithic frontend.
- **`tests/`**, **`package.json`**, **`tsconfig.json`**, **`Dockerfile`**, **`.env`**: Configured for API Gateway URL.

---

## **Running the Application**

### **Docker Compose Setup**
The `infrastructure/docker-compose.yml` orchestrates all services, databases, Kafka, and the frontend.

```yaml
version: '3.8'
services:
  user-service:
    build: ./user-service
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=postgresql://user:pass@user-db:5432/users
    depends_on:
      - user-db
  product-service:
    build: ./product-service
    ports:
      - "8002:8002"
    environment:
      - MONGODB_URL=mongodb://product-db:27017/products
    depends_on:
      - product-db
  order-service:
    build: ./order-service
    ports:
      - "8003:8003"
    environment:
      - DATABASE_URL=mysql://user:pass@order-db:3306/orders
    depends_on:
      - order-db
      - kafka
  api-gateway:
    build: ./api-gateway
    ports:
      - "8080:8080"
    environment:
      - USER_SERVICE_URL=http://user-service:8001
      - PRODUCT_SERVICE_URL=http://product-service:8002
      - ORDER_SERVICE_URL=http://order-service:8003
    depends_on:
      - user-service
      - product-service
      - order-service
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_GATEWAY_URL=http://api-gateway:8080
    depends_on:
      - api-gateway
  user-db:
    image: postgres:13
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=users
  product-db:
    image: mongo:5
  order-db:
    image: mysql:8
    environment:
      - MYSQL_USER=user
      - MYSQL_PASSWORD=pass
      - MYSQL_DATABASE=orders
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
  user-db-data:
  product-db-data:
  order-db-data:
```

### **Steps to Run**
1. Install dependencies for each service:
   - Backend services: `cd user-service && pip install -r requirements.txt` (repeat for others).
   - Frontend: `cd frontend && npm install`.
2. Set up environment variables in each service’s `.env` file.
3. Run the application:
   - With Docker: `cd infrastructure && docker-compose up --build`.
   - Without Docker:
     - Start databases (PostgreSQL, MongoDB, MySQL) and Kafka.
     - Start each service: `cd user-service && uvicorn app.main:app --host 0.0.0.0 --port 8001` (repeat for others).
     - Start API Gateway: `cd api-gateway && uvicorn app.main:app --host 0.0.0.0 --port 8080`.
     - Start frontend: `cd frontend && npm start`.
4. Access the app:
   - Frontend: `http://localhost:3000`.
   - API Gateway: `http://localhost:8080/docs` (FastAPI Swagger UI).
   - Individual services: `http://localhost:8001/docs` (User), `8002/docs` (Product), `8003/docs` (Order).

---

## **Key Features of the Structure**

1. **Independent Services**:
   - Each microservice (`user-service`, `product-service`, `order-service`) has its own codebase, database, and deployment pipeline.
   - Services are loosely coupled, communicating via REST or Kafka.
2. **API Gateway**:
   - Centralizes client requests, routing them to appropriate services.
   - Handles authentication, reducing the burden on individual services.
3. **Event-Driven Communication**:
   - The Order Service uses Kafka to publish events (e.g., “OrderCreated”), which the Product Service can consume to update inventory.
4. **Polyglot Persistence**:
   - User Service: PostgreSQL (relational).
   - Product Service: MongoDB (document-based).
   - Order Service: MySQL (relational).
5. **Modularity**:
   - Each service follows a modular structure (routers, services, models) for maintainability.
   - The frontend is feature-organized, similar to the monolithic example.
6. **Scalability**:
   - Services can be scaled independently (e.g., more instances of Order Service during high demand).
   - Kubernetes manifests support production deployment.
7. **Type Safety**:
   - TypeScript in the frontend and Pydantic in the backend ensure robust validation.
8. **Testing**:
   - Each service has unit tests (`pytest` for backend, Jest for frontend).
   - Contract testing can be added for API interactions.

---

## **Sample Workflow**
- **User Registration**:
  - Frontend: `Register.tsx` sends POST to `/auth/register` via API Gateway.
  - API Gateway: Routes to User Service (`/auth/register`).
  - User Service: Validates with `UserCreate` schema, saves user, returns `UserResponse`.
- **Order Placement**:
  - Frontend: `Orders.tsx` sends POST to `/orders` via API Gateway.
  - API Gateway: Verifies JWT, routes to Order Service.
  - Order Service: Fetches user data (REST call to User Service), product data (REST call to Product Service), creates order, publishes “OrderCreated” event via Kafka.
  - Product Service: Consumes event, updates inventory.

---

## **Extending the Structure**
To add a new service (e.g., Payment Service):
1. Create a new directory (`payment-service/`) with the same structure as other services.
2. Define models, schemas, routers, and services for payments.
3. Add a database (e.g., PostgreSQL) and Kafka integration if needed.
4. Update the API Gateway to route `/payments` to the new service.
5. Update the frontend to include payment-related components and API calls.
6. Add Kubernetes manifests and update `docker-compose.yml`.

---

## **Comparison with Monolithic Structure**
- **Monolith**: Single codebase, single database, single deployment.
- **Microservices**: Multiple codebases, per-service databases, independent deployments.
- **Frontend**: Similar in both, but microservices frontend interacts with the API Gateway instead of a single backend.
- **Complexity**: Microservices require additional components (API Gateway, Kafka, service discovery), increasing setup effort.

---

If you need sample code for specific files (e.g., `main.py` for a service, `kafka_producer.py`, or `Products.tsx`), a diagram of the architecture (via a canvas panel), or guidance on implementing a specific feature (e.g., Kafka events, Kubernetes setup), let me know!
