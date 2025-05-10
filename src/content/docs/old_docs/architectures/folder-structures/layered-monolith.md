---
title: Layered Monolith
description: Placeholder content for Layered Monolith Folder Structures.
order: 6
---

# Layered Monolith Folder Structures

Below is a detailed sample folder structure for a **Layered Architecture** using **FastAPI (Python)** for the backend and **React (TypeScript)** for the frontend. The structure reflects the hierarchical organization of layers (Presentation, Business Logic, Data Access, and optionally Integration) within a single codebase, emphasizing separation of concerns and modularity. This example implements an e-commerce platform with features like customer management, product catalog, and order processing, organized into distinct layers. The notes include explanations of each directory/file and their roles in the layered architecture.

---

## **Overview of the Layered Architecture**
This example implements an e-commerce platform with the following layers:
1. **Presentation Layer**: A React/TypeScript frontend handling user interactions and UI rendering.
2. **Business Logic Layer**: A FastAPI backend implementing core business rules (e.g., order processing, customer authentication).
3. **Data Access Layer**: Manages database interactions using SQLAlchemy for a PostgreSQL database.
4. **Data Storage Layer**: A PostgreSQL database (not part of the codebase but referenced).
5. **Integration Layer**: Handles external API calls (e.g., payment processing), integrated into the business logic layer for simplicity.

The application is monolithic, with all layers in a single codebase, reflecting the typical implementation of layered architecture. The backend is organized into layers within the FastAPI project, while the frontend serves as the presentation layer, communicating with the backend via REST APIs.

---

## **Sample Folder Structure for Layered Architecture**

```
ecommerce-layered/
├── backend/                    # FastAPI backend (Business Logic, Data Access, Integration Layers)
│   ├── app/                    # Core application logic
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI entry point (Presentation Layer interface)
│   │   ├── config/             # Configuration settings
│   │   │   ├── __init__.py
│   │   │   ├── settings.py     # Environment variables (e.g., DB URL)
│   │   │   ├── database.py     # Database connection setup (SQLAlchemy)
│   │   ├── business/           # Business Logic Layer
│   │   │   ├── __init__.py
│   │   │   ├── services/       # Business logic services
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth_service.py # Authentication logic (JWT)
│   │   │   │   ├── customer_service.py # Customer-related logic
│   │   │   │   ├── product_service.py # Product-related logic
│   │   │   │   ├── order_service.py # Order-related logic
│   │   │   ├── dtos/           # Data Transfer Objects
│   │   │   │   ├── __init__.py
│   │   │   │   ├── customer_dto.py # DTOs for customer data
│   │   │   │   ├── product_dto.py # DTOs for product data
│   │   │   │   ├── order_dto.py # DTOs for order data
│   │   ├── data_access/        # Data Access Layer
│   │   │   ├── __init__.py
│   │   │   ├── models/         # Database models (SQLAlchemy)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── customer.py # Customer model
│   │   │   │   ├── product.py  # Product model
│   │   │   │   ├── order.py    # Order model
│   │   │   ├── repositories/   # Repository pattern for DB operations
│   │   │   │   ├── __init__.py
│   │   │   │   ├── customer_repository.py # Customer DB operations
│   │   │   │   ├── product_repository.py # Product DB operations
│   │   │   │   ├── order_repository.py # Order DB operations
│   │   ├── presentation/       # Presentation Layer (API routes)
│   │   │   ├── __init__.py
│   │   │   ├── routers/        # FastAPI routers
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py     # Auth endpoints (login, register)
│   │   │   │   ├── customers.py # Customer endpoints
│   │   │   │   ├── products.py  # Product endpoints
│   │   │   │   ├── orders.py    # Order endpoints
│   │   │   ├── schemas/        # Pydantic schemas for API validation
│   │   │   │   ├── __init__.py
│   │   │   │   ├── customer.py # Customer schemas
│   │   │   │   ├── product.py  # Product schemas
│   │   │   │   ├── order.py    # Order schemas
│   │   ├── integration/        # Integration Layer (external services)
│   │   │   ├── __init__.py
│   │   │   ├── payment_gateway.py # Integration with payment API (e.g., Stripe)
│   │   ├── utils/              # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── security.py     # Password hashing, JWT
│   │   │   ├── exceptions.py   # Custom exceptions
│   ├── tests/                  # Backend tests
│   │   ├── __init__.py
│   │   ├── test_auth.py
│   │   ├── test_customers.py
│   │   ├── test_products.py
│   │   ├── test_orders.py
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile              # Docker configuration
│   ├── .env                    # Environment variables
│
├── frontend/                   # React (TypeScript) frontend (Presentation Layer)
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
│   │   │   ├── order/          # Order components (OrderForm)
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
│   │   │   ├── customer.ts
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
├── docker-compose.yml          # Docker Compose for backend + frontend + DB
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore file
```

---

## **Explanation of Folder Structure**

### **Root Directory**
- **`ecommerce-layered/`**: The root folder contains the backend (FastAPI with layered structure), frontend (React/TypeScript), and shared infrastructure, reflecting the monolithic nature of layered architecture.
- **`docker-compose.yml`**: Orchestrates the backend, frontend, and PostgreSQL database.
- **`README.md`**: Documents setup, architecture, and running instructions.
- **`.gitignore`**: Excludes files like `node_modules`, `__pycache__`, and `.env`.

### **Backend (`backend/`)**
The backend is implemented with **FastAPI**, organized into layers to enforce separation of concerns. The presentation layer exposes REST APIs, the business logic layer handles core functionality, the data access layer manages database interactions, and the integration layer handles external services.

- **`app/`**:
  - **`main.py`**: FastAPI entry point, initializing the app and mounting routers (part of the presentation layer).
    ```python
    from fastapi import FastAPI
    from app.presentation.routers import auth, customers, products, orders

    app = FastAPI(title="E-commerce Layered API")
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(customers.router, prefix="/customers", tags=["customers"])
    app.include_router(products.router, prefix="/products", tags=["products"])
    app.include_router(orders.router, prefix="/orders", tags=["orders"])

    @app.get("/")
    def read_root():
        return {"message": "E-commerce Layered API"}
    ```
  - **`config/`**:
    - **`settings.py`**: Loads environment variables (e.g., `DATABASE_URL`).
    - **`database.py`**: Sets up PostgreSQL with SQLAlchemy.
      ```python
      from sqlalchemy import create_engine
      from sqlalchemy.orm import sessionmaker
      from app.config.settings import DATABASE_URL

      engine = create_engine(DATABASE_URL)
      SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
      ```
  - **`business/`** (Business Logic Layer):
    - **`services/`**: Contains business logic for each feature.
      - **`auth_service.py`**: Handles authentication (e.g., JWT generation).
        ```python
        from app.data_access.repositories.customer_repository import CustomerRepository
        from app.utils.security import hash_password, verify_password

        class AuthService:
            def __init__(self, repo: CustomerRepository):
                self.repo = repo

            def register(self, email: str, password: str):
                hashed = hash_password(password)
                return self.repo.create_customer(email, hashed)
        ```
      - **`customer_service.py`**, **`product_service.py`**, **`order_service.py`**: Similar structure for respective features.
    - **`dtos/`**: Data Transfer Objects to transfer data between layers.
      - **`customer_dto.py`**: Defines DTO for customer data.
        ```python
        from dataclasses import dataclass

        @dataclass
        class CustomerDTO:
            id: int
            email: str
        ```
  - **`data_access/`** (Data Access Layer):
    - **`models/`**: SQLAlchemy models for database tables.
      - **`customer.py`**: Customer model.
        ```python
        from sqlalchemy import Column, Integer, String
        from app.config.database import Base

        class Customer(Base):
            __tablename__ = "customers"
            id = Column(Integer, primary_key=True)
            email = Column(String, unique=True)
            password = Column(String)
        ```
      - **`product.py`**, **`order.py`**: Similar models.
    - **`repositories/`**: Repository pattern for database operations.
      - **`customer_repository.py`**: Encapsulates customer DB operations.
        ```python
        from sqlalchemy.orm import Session
        from app.data_access.models.customer import Customer

        class CustomerRepository:
            def __init__(self, db: Session):
                self.db = db

            def create_customer(self, email: str, password: str):
                customer = Customer(email=email, password=password)
                self.db.add(customer)
                self.db.commit()
                self.db.refresh(customer)
                return customer
        ```
  - **`presentation/`** (Presentation Layer - API):
    - **`routers/`**: FastAPI routers for API endpoints.
      - **`customers.py`**: Customer endpoints.
        ```python
        from fastapi import APIRouter, Depends
        from app.business.services.customer_service import CustomerService
        from app.presentation.schemas.customer import CustomerCreate, CustomerResponse
        from app.config.database import SessionLocal

        router = APIRouter()

        def get_db():
            db = SessionLocal()
            try:
                yield db
            finally:
                db.close()

        @router.post("/", response_model=CustomerResponse)
        def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
            service = CustomerService(db)
            return service.create_customer(customer.email, customer.password)
        ```
      - **`auth.py`**, **`products.py`**, **`orders.py`**: Similar routers.
    - **`schemas/`**: Pydantic schemas for API validation.
      - **`customer.py`**: Customer schemas.
        ```python
        from pydantic import BaseModel, EmailStr

        class CustomerCreate(BaseModel):
            email: EmailStr
            password: str

        class CustomerResponse(BaseModel):
            id: int
            email: EmailStr
        ```
  - **`integration/`** (Integration Layer):
    - **`payment_gateway.py`**: Handles external API calls (e.g., Stripe).
      ```python
      import httpx

      class PaymentGateway:
          async def process_payment(self, order_id: int, amount: float):
              async with httpx.AsyncClient() as client:
                  response = await client.post("https://api.stripe.com/v1/charges", ...)
                  return response.json()
      ```
  - **`utils/`**: Security (e.g., JWT, password hashing) and exception handling.
- **`tests/`**: Unit and integration tests with `pytest`.
- **`requirements.txt`**: Dependencies (e.g., `fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`).
- **`Dockerfile`**: Containerizes the backend.
- **`.env`**: Environment variables (e.g., `DATABASE_URL=postgresql://user:pass@localhost:5432/ecommerce`).

### **Frontend (`frontend/`)**
The frontend is the **Presentation Layer**, implemented with **React** and **TypeScript**, using **React Router** for navigation and **Axios** for API calls to the backend.

- **`public/`**: Static assets like `index.html` and `favicon.ico`.
- **`src/`**:
  - **`assets/`**: Static files (e.g., images).
  - **`components/`**: Reusable UI components.
    - **`common/`**: Generic components (e.g., `Button.tsx`).
    - **`auth/`**: Auth components (e.g., `LoginForm.tsx`).
    - **`product/`**: Product components (e.g., `ProductCard.tsx`).
      ```tsx
      import React from 'react';
      import { Product } from '../types/product';

      interface Props {
          product: Product;
      }

      const ProductCard: React.FC<Props> = ({ product }) => {
          return (
              <div>
                  <h3>{product.name}</h3>
                  <p>${product.price}</p>
              </div>
          );
      };

      export default ProductCard;
      ```
    - **`order/`**: Order components (e.g., `OrderForm.tsx`).
  - **`pages/`**: Components representing full pages.
    - **`Products.tsx`**: Lists products.
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

      export default Products;
      ```
  - **`services/`**: API client logic.
    - **`api.ts`**: Axios setup for backend API.
      ```ts
      import axios from 'axios';

      const api = axios.create({
          baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
      });

      export default api;
      ```
    - **`productService.ts`**: Product API calls.
      ```ts
      import api from './api';
      import { Product } from '../types/product';

      export const getProducts = async (): Promise<Product[]> => {
          const response = await api.get('/products');
          return response.data;
      };
      ```
    - **`authService.ts`**, **`orderService.ts`**: Similar services.
  - **`types/`**: TypeScript interfaces.
    - **`product.ts`**: Product type.
      ```ts
      export interface Product {
          id: number;
          name: string;
          price: number;
          description?: string;
      }
      ```
  - **`utils/`**: Helpers (e.g., token storage, formatting).
  - **`styles/`**: Global styles and theme configuration.
  - **`App.tsx`**: Sets up React Router.
    ```tsx
    import React from 'react';
    import { BrowserRouter, Routes, Route } from 'react-router-dom';
    import Home from './pages/Home';
    import Login from './pages/Login';
    import Products from './pages/Products';

    const App: React.FC = () => {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/products" element={<Products />} />
                </Routes>
            </BrowserRouter>
        );
    };

    export default App;
    ```
  - **`index.tsx`**: Renders the React app.
- **`tests/`**: Unit tests with Jest and React Testing Library.
- **`package.json`**: Node dependencies (e.g., `react`, `react-router-dom`, `axios`).
- **`tsconfig.json`**: TypeScript configuration.
- **`Dockerfile`**: Containerizes the frontend.
- **`.env`**: Environment variables (e.g., `REACT_APP_API_URL=http://localhost:8000`).

---

## **Running the Application**

### **Docker Compose Setup**
The `docker-compose.yml` orchestrates the backend, frontend, and PostgreSQL database.

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/ecommerce
    depends_on:
      - db
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:8000
    depends_on:
      - backend
  db:
    image: postgres:13
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=ecommerce
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

### **Steps to Run**
1. Install dependencies:
   - Backend: `cd backend && pip install -r requirements.txt`.
   - Frontend: `cd frontend && npm install`.
2. Set up environment variables in `backend/.env` and `frontend/.env`.
3. Run the application:
   - With Docker: `docker-compose up --build`.
   - Without Docker:
     - Start PostgreSQL (e.g., via Docker: `docker run -p 5432:5432 postgres:13`).
     - Start backend: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000`.
     - Start frontend: `cd frontend && npm start`.
4. Access the app:
   - Frontend: `http://localhost:3000`.
   - Backend API: `http://localhost:8000/docs` (FastAPI Swagger UI).

---

## **Key Features of the Structure**

1. **Layered Organization**:
   - **Presentation Layer**: Handled by the frontend (`frontend/`) and backend API routes (`backend/app/presentation/`).
   - **Business Logic Layer**: Encapsulated in `backend/app/business/` with services and DTOs.
   - **Data Access Layer**: Managed in `backend/app/data_access/` with models and repositories.
   - **Integration Layer**: Included in `backend/app/integration/` for external services.
2. **Separation of Concerns**:
   - Each layer has a clear responsibility, enforced by directory structure and interfaces.
   - Example: `CustomerService` (business) calls `CustomerRepository` (data access), not the database directly.
3. **Modularity**:
   - Layers are modular, allowing independent development and testing.
   - Example: The data access layer can be reused in another application.
4. **Single Codebase**:
   - The backend is a monolithic application, with all layers in one repository, typical of layered architecture.
5. **Type Safety**:
   - TypeScript ensures type safety in the frontend.
   - Pydantic schemas and DTOs enforce validation in the backend.
6. **Testing**:
   - Backend tests (`pytest`) cover each layer (e.g., unit tests for services, integration tests for repositories).
   - Frontend tests (Jest) cover components and API calls.
7. **Containerization**:
   - Docker and Docker Compose ensure consistent deployment across environments.

---

## **Sample Workflow**
- **Customer Registration**:
  - Frontend: `Register.tsx` sends POST to `/auth/register`.
  - Backend (Presentation): `auth.py` router validates input with `CustomerCreate` schema.
  - Backend (Business): `AuthService` processes registration, hashing the password.
  - Backend (Data Access): `CustomerRepository` saves the customer to the database.
  - Response flows back to the frontend.
- **Order Placement**:
  - Frontend: `Orders.tsx` sends POST to `/orders`.
  - Backend (Presentation): `orders.py` router validates input.
  - Backend (Business): `OrderService` validates customer and products, calculates totals, and calls `PaymentGateway` for payment.
  - Backend (Data Access): `OrderRepository` saves the order.
  - Backend (Integration): `PaymentGateway` processes payment via an external API.

---

## **Extending the Structure**
To add a new feature (e.g., inventory management):
1. **Backend**:
   - Add `inventory.py` in `data_access/models/` and `data_access/repositories/`.
   - Add `inventory_dto.py` in `business/dtos/` and `inventory_service.py` in `business/services/`.
   - Add `inventory.py` in `presentation/routers/` and `presentation/schemas/`.
2. **Frontend**:
   - Add `inventory/` in `components/` (e.g., `InventoryCard.tsx`).
   - Add `Inventory.tsx` in `pages/`.
   - Add `inventoryService.ts` in `services/`.
   - Update `App.tsx` to include an `/inventory` route.

---

## **Comparison with Other Architectures**
- **Monolith**: Layered architecture is often a way to organize a monolithic codebase, as seen here.
- **Microservices**: Layered architecture is single-codebase and less granular, while microservices split functionality into independent services.
- **SOA**: Layered architecture lacks the enterprise focus, ESB, and coarse-grained services of SOA.
- **Frontend**: Similar across architectures, but here it interacts with a single backend API.

---

If you need sample code for specific files (e.g., `main.py`, `CustomerService.py`, `Products.tsx`), a diagram of the architecture (via a canvas panel), or guidance on implementing a specific feature, let me know!
