---
title: Service-Oriented Architecture
description: Placeholder content for Service-Oriented Architecture Folder Structures.
order: 3
---

# Service-Oriented Architecture Folder Structures

Below is a detailed sample folder structure for a **Service-Oriented Architecture (SOA)** using **FastAPI (Python)** for the backend services and **React (TypeScript)** for the frontend. This structure reflects SOA’s emphasis on coarse-grained, reusable services that integrate heterogeneous systems, often with an **Enterprise Service Bus (ESB)** or similar middleware for communication. The example implements an e-commerce platform with services for customer management, order management, and payment processing, orchestrated to support business processes. The notes include explanations of each directory/file and their roles in the SOA ecosystem.

---

## **Overview of the SOA Architecture**
This example implements an e-commerce platform with three SOA services:
1. **Customer Service**: Manages customer profiles, authentication, and accounts.
2. **Order Service**: Handles order creation, tracking, and fulfillment.
3. **Payment Service**: Processes payments and refunds.

Additional components include:
- **API Gateway**: Acts as a simplified ESB-like layer to route requests, transform data, and handle cross-cutting concerns (e.g., authentication). In a full SOA, a dedicated ESB (e.g., Mule ESB) would be used, but FastAPI is used here for simplicity.
- **Frontend**: A React/TypeScript application that interacts with services via the API Gateway.
- **Shared Infrastructure**: Configuration for Docker and orchestration, with optional support for a service registry or orchestration engine.

Each service is coarse-grained, aligning with business functions, and designed for reusability across applications (e.g., the Customer Service could be used by other systems). Services communicate via **REST** (for simplicity, though SOAP is common in traditional SOA) and are orchestrated to execute business processes (e.g., placing an order). The folder structure separates services into distinct directories, reflecting SOA’s distributed nature.

---

## **Sample Folder Structure for SOA Architecture**

```
ecommerce-soa/
├── customer-service/           # Customer Service (FastAPI)
│   ├── app/                    # Core application logic
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI entry point for Customer Service
│   │   ├── config/             # Configuration settings
│   │   │   ├── __init__.py
│   │   │   ├── settings.py     # Environment variables (e.g., DB URL)
│   │   │   ├── database.py     # Database connection (e.g., SQLAlchemy)
│   │   ├── models/             # Database models
│   │   │   ├── __init__.py
│   │   │   ├── customer.py     # Customer model (id, email, password)
│   │   ├── schemas/            # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── customer.py     # Customer schemas (CustomerCreate, CustomerResponse)
│   │   ├── routers/            # API routes
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # Auth endpoints (login, register)
│   │   │   ├── customers.py    # Customer endpoints (get profile, update)
│   │   ├── services/           # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py # Authentication logic (JWT)
│   │   │   ├── customer_service.py # Customer-related logic
│   │   ├── utils/              # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── security.py     # Password hashing, JWT
│   │   │   ├── exceptions.py   # Custom exceptions
│   ├── tests/                  # Unit and integration tests
│   │   ├── __init__.py
│   │   ├── test_auth.py
│   │   ├── test_customers.py
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile              # Docker configuration
│   ├── .env                    # Environment variables
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
│   │   │   ├── order.py        # Order model (id, customer_id, total)
│   │   ├── schemas/            # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── order.py        # Order schemas
│   │   ├── routers/            # API routes
│   │   │   ├── __init__.py
│   │   │   ├── orders.py       # Order endpoints (create, list, track)
│   │   ├── services/           # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── order_service.py # Order-related logic
│   │   ├── utils/              # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── exceptions.py
│   ├── tests/                  # Tests
│   │   ├── __init__.py
│   │   ├── test_orders.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env
│
├── payment-service/            # Payment Service (FastAPI)
│   ├── app/                    # Core application logic
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI entry point for Payment Service
│   │   ├── config/             # Configuration settings
│   │   │   ├── __init__.py
│   │   │   ├── settings.py
│   │   │   ├── database.py     # Database connection
│   │   ├── models/             # Database models
│   │   │   ├── __init__.py
│   │   │   ├── payment.py      # Payment model (id, order_id, amount)
│   │   ├── schemas/            # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── payment.py      # Payment schemas
│   │   ├── routers/            # API routes
│   │   │   ├── __init__.py
│   │   │   ├── payments.py     # Payment endpoints (process, refund)
│   │   ├── services/           # Business logic
│   │   │   └── __init__.py
│   │   │   ├── payment_service.py # Payment-related logic
│   │   ├── utils/              # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── exceptions.py
│   ├── tests/                  # Tests
│   │   ├── __init__.py
│   │   ├── test_payments.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env
│
├── api-gateway/                # API Gateway (FastAPI, acting as simplified ESB)
│   ├── app/                    # Core application logic
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI entry point for API Gateway
│   │   ├── config/             # Configuration
│   │   │   ├── __init__.py
│   │   │   ├── settings.py     # Service URLs, JWT settings
│   │   ├── routers/            # Routing logic
│   │   │   ├── __init__.py
│   │   │   ├── proxy.py        # Routes requests to services
│   │   ├── services/           # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── orchestration.py # Orchestrates multi-service workflows
│   │   ├── utils/              # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # JWT authentication
│   │   │   ├── proxy.py        # HTTP proxy logic
│   │   │   ├── transform.py    # Data transformation (e.g., JSON to XML)
│   ├── tests/                  # Tests
│   │   ├── __init__.py
│   │   ├── test_proxy.py
│   │   ├── test_orchestration.py
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
│   │   │   ├── order/          # Order components (OrderForm)
│   │   │   ├── payment/        # Payment components (PaymentForm)
│   │   ├── pages/              # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   ├── Payments.tsx
│   │   ├── services/           # API client services
│   │   │   ├── api.ts          # Axios setup
│   │   │   ├── authService.ts
│   │   │   ├── orderService.ts
│   │   │   ├── paymentService.ts
│   │   ├── types/              # TypeScript interfaces
│   │   │   ├── customer.ts
│   │   │   ├── order.ts
│   │   │   ├── payment.ts
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
│   │   ├── customer-service.yaml
│   │   ├── order-service.yaml
│   │   ├── payment-service.yaml
│   │   ├── api-gateway.yaml
│   │   ├── frontend.yaml
│   ├── docker-compose.yml       # Local development setup
│
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore file
```

---

## **Explanation of Folder Structure**

### **Root Directory**
- **`ecommerce-soa/`**: The root folder contains directories for each service, the API Gateway, the frontend, and shared infrastructure, reflecting SOA’s distributed yet enterprise-focused design.
- **`infrastructure/`**:
  - **`kubernetes/`**: YAML files for deploying services to a Kubernetes cluster.
  - **`docker-compose.yml`**: Orchestrates services for local development.
- **`README.md`**: Documents setup, architecture, and running instructions.
- **`.gitignore`**: Excludes files like `node_modules`, `__pycache__`, and `.env`.

### **Customer Service (`customer-service/`)**
Handles customer-related functionality (e.g., authentication, profiles). Uses FastAPI with PostgreSQL for relational data. Designed to be reusable across other applications (e.g., CRM, support systems).

- **`app/`**:
  - **`main.py`**: FastAPI entry point.
    ```python
    from fastapi import FastAPI
    from app.routers import auth, customers

    app = FastAPI(title="Customer Service")
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(customers.router, prefix="/customers", tags=["customers"])

    @app.get("/")
    def read_root():
        return {"message": "Customer Service"}
    ```
  - **`config/`**:
    - **`settings.py`**: Loads environment variables.
    - **`database.py`**: Sets up PostgreSQL with SQLAlchemy.
  - **`models/`**:
    - **`customer.py`**: Defines the Customer model.
      ```python
      from sqlalchemy import Column, Integer, String
      from app.config.database import Base

      class Customer(Base):
          __tablename__ = "customers"
          id = Column(Integer, primary_key=True)
          email = Column(String, unique=True)
          password = Column(String)
      ```
  - **`schemas/`**:
    - **`customer.py`**: Pydantic schemas.
      ```python
      from pydantic import BaseModel, EmailStr

      class CustomerCreate(BaseModel):
          email: EmailStr
          password: str

      class CustomerResponse(BaseModel):
          id: int
          email: EmailStr
      ```
  - **`routers/`**:
    - **`auth.py`**: Endpoints for login/register.
    - **`customers.py`**: Endpoints for customer profile management.
  - **`services/`**:
    - **`auth_service.py`**: JWT and password hashing.
    - **`customer_service.py`**: Business logic for customers.
  - **`utils/`**: Security and exception handling.
- **`tests/`**: Unit tests with `pytest`.
- **`requirements.txt`**: Dependencies (e.g., `fastapi`, `sqlalchemy`, `psycopg2`).
- **`Dockerfile`**: Containerizes the service.
- **`.env`**: Environment variables (e.g., `DATABASE_URL=postgresql://user:pass@db:5432/customers`).

### **Order Service (`order-service/`)**
Manages order-related functionality (e.g., creation, tracking). Uses FastAPI with MySQL. Designed to orchestrate interactions with other services for order fulfillment.

- **`app/`**:
  - **`main.py`**: FastAPI entry point.
    ```python
    from fastapi import FastAPI
    from app.routers import orders

    app = FastAPI(title="Order Service")
    app.include_router(orders.router, prefix="/orders", tags=["orders"])

    @app.get("/")
    def read_root():
        return {"message": "Order Service"}
    ```
  - **`config/`**: MySQL connection setup.
  - **`models/`**:
    - **`order.py`**: Order model.
  - **`schemas/`**:
    - **`order.py`**: Order schemas.
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
    - **`orders.py`**: Endpoints for order CRUD and tracking.
  - **`services/`**:
    - **`order_service.py`**: Business logic, including REST calls to Customer and Payment Services.
- **`tests/`**, **`requirements.txt`**, **`Dockerfile`**, **`.env`**: Similar to Customer Service, with MySQL dependencies (e.g., `pymysql`).

### **Payment Service (`payment-service/`)**
Processes payments and refunds. Uses FastAPI with MongoDB for flexibility with transaction logs. Reusable for other payment-related applications.

- **`app/`**:
  - **`main.py`**: FastAPI entry point.
    ```python
    from fastapi import FastAPI
    from app.routers import payments

    app = FastAPI(title="Payment Service")
    app.include_router(payments.router, prefix="/payments", tags=["payments"])

    @app.get("/")
    def read_root():
        return {"message": "Payment Service"}
    ```
  - **`config/`**: MongoDB connection setup (e.g., Motor).
  - **`models/`**:
    - **`payment.py`**: Payment model (MongoDB document).
  - **`schemas/`**:
    - **`payment.py`**: Payment schemas.
      ```python
      from pydantic import BaseModel

      class PaymentCreate(BaseModel):
          order_id: int
          amount: float

      class PaymentResponse(BaseModel):
          id: str
          order_id: int
          amount: float
      ```
  - **`routers/`**:
    - **`payments.py`**: Endpoints for payment processing and refunds.
  - **`services/`**:
    - **`payment_service.py`**: Business logic for payments.
- **`tests/`**, **`requirements.txt`**, **`Dockerfile`**, **`.env`**: Includes MongoDB dependencies (e.g., `pymongo`).

### **API Gateway (`api-gateway/`)**
Acts as a simplified ESB, routing requests to services, handling authentication, and orchestrating workflows. In a traditional SOA, a full ESB (e.g., Mule ESB) would handle complex transformations and routing, but FastAPI is used here for simplicity.

- **`app/`**:
  - **`main.py`**: FastAPI entry point.
    ```python
    from fastapi import FastAPI, Depends
    from app.services.orchestration import place_order
    from app.utils.proxy import forward_request
    from app.utils.auth import verify_jwt

    app = FastAPI(title="API Gateway")

    @app.post("/orders", dependencies=[Depends(verify_jwt)])
    async def create_order(order_data: dict):
        return await place_order(order_data)

    @app.get("/customers/{path:path}", dependencies=[Depends(verify_jwt)])
    async def proxy_customers(path: str):
        return await forward_request("customer-service", path)

    @app.get("/payments/{path:path}")
    async def proxy_payments(path: str):
        return await forward_request("payment-service", path)
    ```
  - **`config/`**: Service URLs and JWT settings.
  - **`routers/`**:
    - **`proxy.py`**: Routes requests to services.
  - **`services/`**:
    - **`orchestration.py`**: Orchestrates multi-service workflows (e.g., order placement).
      ```python
      import httpx

      async def place_order(order_data: dict):
          async with httpx.AsyncClient() as client:
              # Verify customer
              customer = await client.get(
                  f"http://customer-service:8001/customers/{order_data['customer_id']}"
              )
              # Create order
              order = await client.post(
                  "http://order-service:8002/orders", json=order_data
              )
              # Process payment
              payment = await client.post(
                  "http://payment-service:8003/payments",
                  json={"order_id": order.json()["id"], "amount": order_data["total"]}
              )
              return {"order": order.json(), "payment": payment.json()}
      ```
  - **`utils/`**:
    - **`auth.py`**: JWT verification.
    - **`proxy.py`**: HTTP client for forwarding requests.
    - **`transform.py`**: Data transformation (e.g., JSON to XML for legacy integration).
- **`tests/`**, **`requirements.txt`**, **`Dockerfile`**, **`.env`**: Minimal dependencies.

### **Frontend (`frontend/`)**
A React/TypeScript app that interacts with the API Gateway, similar to the microservices frontend but tailored for SOA’s business-focused services.

- **`public/`**: Static assets.
- **`src/`**:
  - **`components/`**:
    - **`auth/`**, **`order/`**, **`payment/`**: Feature-specific components.
  - **`pages/`**:
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
    - **`orderService.ts`**: API calls for orders.
      ```ts
      import api from './api';
      import { Order } from '../types/order';

      export const createOrder = async (order: any): Promise<Order> => {
          const response = await api.post('/orders', order);
          return response.data;
      };

      export const getOrders = async (): Promise<Order[]> => {
          const response = await api.get('/orders');
          return response.data;
      };
      ```
  - **`types/`**, **`utils/`**, **`styles/`**, **`App.tsx`**, **`index- **`index.tsx`**: Similar to the microservices frontend.
- **`tests/`**, **`package.json`**, **`tsconfig.json`**, **`Dockerfile`**, **`.env`**: Configured for API Gateway URL.

---

## **Running the Application**

### **Docker Compose Setup**
The `infrastructure/docker-compose.yml` orchestrates all services and databases.

```yaml
version: '3.8'
services:
  customer-service:
    build: ./customer-service
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=postgresql://user:pass@customer-db:5432/customers
    depends_on:
      - customer-db
  order-service:
    build: ./order-service
    ports:
      - "8002:8002"
    environment:
      - DATABASE_URL=mysql://user:pass@order-db:3306/orders
    depends_on:
      - order-db
  payment-service:
    build: ./payment-service
    ports:
      - "8003:8003"
    environment:
      - MONGODB_URL=mongodb://payment-db:27017/payments
    depends_on:
      - payment-db
  api-gateway:
    build: ./api-gateway
    ports:
      - "8080:8080"
    environment:
      - CUSTOMER_SERVICE_URL=http://customer-service:8001
      - ORDER_SERVICE_URL=http://order-service:8002
      - PAYMENT_SERVICE_URL=http://payment-service:8003
    depends_on:
      - customer-service
      - order-service
      - payment-service
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_GATEWAY_URL=http://api-gateway:8080
    depends_on:
      - api-gateway
  customer-db:
    image: postgres:13
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=customers
  order-db:
    image: mysql:8
    environment:
      - MYSQL_USER=user
      - MYSQL_PASSWORD=pass
      - MYSQL_DATABASE=orders
  payment-db:
    image: mongo:5
volumes:
  customer-db-data:
  order-db-data:
  payment-db-data:
```

### **Steps to Run**
1. Install dependencies for each service:
   - Backend services: `cd customer-service && pip install -r requirements.txt` (repeat for others).
   - Frontend: `cd frontend && npm install`.
2. Set up environment variables in each service’s `.env` file.
3. Run the application:
   - With Docker: `cd infrastructure && docker-compose up --build`.
   - Without Docker:
     - Start databases (PostgreSQL, MySQL, MongoDB).
     - Start each service: `cd customer-service && uvicorn app.main:app --host 0.0.0.0 --port 8001` (repeat for others).
     - Start API Gateway: `cd api-gateway && uvicorn app.main:app --host 0.0.0.0 --port 8080`.
     - Start frontend: `cd frontend && npm start`.
4. Access the app:
   - Frontend: `http://localhost:3000`.
   - API Gateway: `http://localhost:8080/docs` (FastAPI Swagger UI).
   - Individual services: `http://localhost:8001/docs` (Customer), `8002/docs` (Order), `8003/docs` (Payment).

---

## **Key Features of the Structure**

1. **Coarse-Grained Services**:
   - Services (Customer, Order, Payment) are aligned with business functions, larger than microservices but reusable across applications.
   - Example: Customer Service could be used by a CRM or support system.
2. **API Gateway as Simplified ESB**:
   - Routes requests, handles authentication, and orchestrates workflows, mimicking ESB functionality.
   - Supports data transformation (e.g., JSON to XML for legacy integration).
3. **Orchestration**:
   - The API Gateway orchestrates multi-service workflows (e.g., order placement involves Customer, Order, and Payment Services).
   - In a full SOA, a BPEL engine or ESB would handle orchestration.
4. **Polyglot Persistence**:
   - Customer Service: PostgreSQL (relational).
   - Order Service: MySQL (relational).
   - Payment Service: MongoDB (document-based).
5. **Reusability**:
   - Services are designed with standardized interfaces (REST) for use in other systems.
   - Example: Payment Service could integrate with external billing apps.
6. **Modularity**:
   - Each service follows a modular structure (routers, services, models) for maintainability.
   - The frontend is feature-organized, similar to microservices.
7. **Scalability**:
   - Services can be scaled independently, though less granular than microservices.
   - Kubernetes manifests support production deployment.
8. **Type Safety**:
   - TypeScript in the frontend and Pydantic in the backend ensure robust validation.

---

## **Sample Workflow**
- **Customer Registration**:
  - Frontend: `Register.tsx` sends POST to `/auth/register` via API Gateway.
  - API Gateway: Routes to Customer Service (`/auth/register`).
  - Customer Service: Validates with `CustomerCreate` schema, saves customer, returns `CustomerResponse`.
- **Order Placement**:
  - Frontend: `Orders.tsx` sends POST to `/orders` via API Gateway.
  - API Gateway: Verifies JWT, orchestrates workflow:
    - Calls Customer Service to verify customer.
    - Calls Order Service to create order.
    - Calls Payment Service to process payment.
  - Returns combined response to frontend.

---

## **Extending the Structure**
To add a new service (e.g., Inventory Service):
1. Create a new directory (`inventory-service/`) with the same structure as other services.
2. Define models, schemas, routers, and services for inventory management.
3. Add a database (e.g., PostgreSQL) and configure it.
4. Update the API Gateway to route `/inventory` to the new service and include it in orchestration workflows.
5. Update the frontend to include inventory-related components and API calls.
6. Add Kubernetes manifests and update `docker-compose.yml`.

---

## **Comparison with Monolithic and Microservices Structures**
- **Monolith**: Single codebase, single database, single deployment.
- **SOA**: Multiple coarse-grained services, per-service or shared databases, independent deployments, with ESB-like orchestration.
- **Microservices**: Multiple fine-grained services, per-service databases, lightweight communication (no ESB), highly autonomous.
- **Frontend**: Similar across all, but SOA frontend interacts with an API Gateway that orchestrates business processes.
- **Complexity**: SOA is more complex than monolith but less distributed than microservices due to centralized governance and ESB.

---

## **Notes on SOA-Specific Considerations**
- **SOAP vs. REST**: This example uses REST for simplicity, but traditional SOA often uses SOAP with WSDL for enterprise-grade services. To implement SOAP, replace FastAPI routers with a SOAP framework (e.g., `zeep` or `suds` in Python) and define WSDL files.
- **ESB**: The API Gateway simplifies ESB functionality. For a full SOA, integrate a dedicated ESB (e.g., Mule ESB) to handle complex routing, transformation, and orchestration.
- **Service Registry**: Not included here but could be added (e.g., using a UDDI-like system or Eureka) to catalog services.
- **Orchestration**: The API Gateway handles basic orchestration; a BPEL engine (e.g., Apache ODE) could be added for complex workflows.

---

If you need sample code for specific files (e.g., `main.py` for a service, `orchestration.py`, or `Orders.tsx`), a diagram of the architecture (via a canvas panel), or guidance on implementing SOAP, a full ESB, or a specific feature, let me know!
