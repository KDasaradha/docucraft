---
title: Monolithic
description: Placeholder content for Monolithic Folder Structures.
order: 1
---

# Monolithic Folder Structures

Below is a detailed sample folder structure for a **monolithic architecture** using **FastAPI (Python)** for the backend and **React (TypeScript)** for the frontend. The structure is designed to maintain modularity within the monolith, ensuring separation of concerns while keeping all components in a single codebase. The notes include explanations of each directory/file and their roles in the monolithic application.

---

## **Sample Folder Structure for Monolithic Architecture**

This example assumes a small e-commerce application with features like user authentication, product catalog, and order management. The structure is organized to promote maintainability and scalability within the monolithic paradigm.

```
ecommerce-monolith/
├── backend/                    # FastAPI backend codebase
│   ├── app/                    # Core application logic
│   │   ├── __init__.py         # Marks app as a Python package
│   │   ├── main.py             # Entry point for FastAPI application
│   │   ├── config/             # Configuration settings
│   │   │   ├── __init__.py
│   │   │   ├── settings.py     # Environment variables, database config
│   │   │   ├── database.py     # Database connection setup (e.g., SQLAlchemy)
│   │   ├── models/             # Database models (ORM)
│   │   │   ├── __init__.py
│   │   │   ├── user.py         # User model (e.g., id, email, password)
│   │   │   ├── product.py      # Product model (e.g., id, name, price)
│   │   │   ├── order.py        # Order model (e.g., id, user_id, total)
│   │   ├── schemas/            # Pydantic schemas for request/response validation
│   │   │   ├── __init__.py
│   │   │   ├── user.py         # User schemas (e.g., UserCreate, UserResponse)
│   │   │   ├── product.py      # Product schemas
│   │   │   ├── order.py        # Order schemas
│   │   ├── routers/            # API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # Authentication endpoints (e.g., login, register)
│   │   │   ├── users.py        # User-related endpoints (e.g., get user profile)
│   │   │   ├── products.py     # Product endpoints (e.g., list, create products)
│   │   │   ├── orders.py       # Order endpoints (e.g., create, list orders)
│   │   ├── services/           # Business logic (services layer)
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py # Authentication logic (e.g., JWT handling)
│   │   │   ├── user_service.py # User-related business logic
│   │   │   ├── product_service.py # Product-related business logic
│   │   │   ├── order_service.py # Order-related business logic
│   │   ├── utils/              # Utility functions
│   │   │   ├── __init__.py
│   │   │   ├── security.py     # Security utilities (e.g., password hashing)
│   │   │   ├── exceptions.py   # Custom exception handlers
│   ├── tests/                  # Backend tests
│   │   ├── __init__.py
│   │   ├── test_auth.py        # Tests for authentication endpoints
│   │   ├── test_users.py       # Tests for user endpoints
│   │   ├── test_products.py    # Tests for product endpoints
│   │   ├── test_orders.py      # Tests for order endpoints
│   ├── requirements.txt         # Python dependencies (e.g., fastapi, uvicorn)
│   ├── Dockerfile              # Docker configuration for backend
│   ├── .env                    # Environment variables (e.g., DB_URL, JWT_SECRET)
│
├── frontend/                   # React (TypeScript) frontend codebase
│   ├── public/                 # Static assets
│   │   ├── index.html          # Main HTML file
│   │   ├── favicon.ico         # Favicon
│   │   ├── manifest.json       # Web app manifest
│   ├── src/                    # React source code
│   │   ├── assets/             # Images, fonts, etc.
│   │   │   ├── images/         # Static images (e.g., logo.png)
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Generic components (e.g., Button, Modal)
│   │   │   ├── auth/           # Auth-related components (e.g., LoginForm)
│   │   │   ├── product/        # Product-related components (e.g., ProductCard)
│   │   │   ├── order/          # Order-related components (e.g., OrderSummary)
│   │   ├── pages/              # Page components (React Router routes)
│   │   │   ├── Home.tsx        # Homepage
│   │   │   ├── Login.tsx       # Login page
│   │   │   ├── Register.tsx    # Registration page
│   │   │   ├── Products.tsx    # Product listing page
│   │   │   ├── ProductDetail.tsx # Product detail page
│   │   │   ├── Orders.tsx      # Order history page
│   │   ├── services/           # API client services
│   │   │   ├── api.ts          # Axios or fetch setup for API calls
│   │   │   ├── authService.ts  # Auth-related API calls
│   │   │   ├── productService.ts # Product-related API calls
│   │   │   ├── orderService.ts  # Order-related API calls
│   │   ├── types/              # TypeScript interfaces
│   │   │   ├── user.ts         # User-related types
│   │   │   ├── product.ts      # Product-related types
│   │   │   ├── order.ts        # Order-related types
│   │   ├── utils/              # Utility functions
│   │   │   ├── auth.ts         # Auth helpers (e.g., token storage)
│   │   │   ├── formatters.ts   # Formatting helpers (e.g., currency)
│   │   ├── App.tsx             # Main app component (React Router setup)
│   │   ├── index.tsx           # Entry point for React
│   │   ├── styles/             # CSS or styled-components
│   │   │   ├── global.css      # Global styles
│   │   │   ├── theme.ts        # Theme configuration (if using styled-components)
│   ├── tests/                  # Frontend tests
│   │   ├── components/         # Component tests
│   │   ├── pages/              # Page tests
│   │   ├── services/           # API service tests
│   ├── package.json            # Node dependencies and scripts
│   ├── tsconfig.json           # TypeScript configuration
│   ├── Dockerfile              # Docker configuration for frontend
│   ├── .env                    # Frontend environment variables (e.g., API_URL)
│
├── docker-compose.yml          # Docker Compose for running backend + frontend
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore file
```

---

## **Explanation of Folder Structure**

### **Root Directory**
- **`ecommerce-monolith/`**: The root folder contains both backend and frontend codebases, reflecting the monolithic architecture where all components are managed in a single repository.
- **`docker-compose.yml`**: Defines services for running the FastAPI backend, React frontend, and database (e.g., PostgreSQL) together.
- **`README.md`**: Documents setup instructions, dependencies, and how to run the project.
- **`.gitignore`**: Excludes unnecessary files (e.g., `node_modules`, `__pycache__`, `.env`) from version control.

### **Backend (`backend/`)**
The backend is built with **FastAPI**, a modern Python framework for building APIs. The structure is modular to keep the monolith maintainable.

- **`app/`**: Core application directory.
  - **`main.py`**: FastAPI application entry point. Initializes the app, mounts routers, and sets up middleware.
    ```python
    from fastapi import FastAPI
    from app.routers import auth, users, products, orders

    app = FastAPI()
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(users.router, prefix="/users", tags=["users"])
    app.include_router(products.router, prefix="/products", tags=["products"])
    app.include_router(orders.router, prefix="/orders", tags=["orders"])

    @app.get("/")
    def read_root():
        return {"message": "E-commerce Monolith API"}
    ```
  - **`config/`**: Stores configuration files.
    - **`settings.py`**: Loads environment variables (e.g., database URL, JWT secret).
    - **`database.py`**: Sets up database connection (e.g., SQLAlchemy with PostgreSQL).
  - **`models/`**: Defines database models using an ORM (e.g., SQLAlchemy).
    - Example (`user.py`):
      ```python
      from sqlalchemy import Column, Integer, String
      from app.config.database import Base

      class User(Base):
          __tablename__ = "users"
          id = Column(Integer, primary_key=True, index=True)
          email = Column(String, unique=True, index=True)
          password = Column(String)
      ```
  - **`schemas/`**: Pydantic models for request/response validation.
    - Example (`user.py`):
      ```python
      from pydantic import BaseModel, EmailStr

      class UserCreate(BaseModel):
          email: EmailStr
          password: str

      class UserResponse(BaseModel):
          id: int
          email: EmailStr
      ```
  - **`routers/`**: Defines API endpoints, grouped by functionality.
    - Example (`products.py`):
      ```python
      from fastapi import APIRouter, Depends
      from app.schemas.product import ProductCreate, ProductResponse
      from app.services.product_service import create_product

      router = APIRouter()

      @router.post("/", response_model=ProductResponse)
      def create_new_product(product: ProductCreate):
          return create_product(product)
      ```
  - **`services/`**: Contains business logic, keeping routers thin.
    - Example (`product_service.py`):
      ```python
      from app.models.product import Product
      from app.schemas.product import ProductCreate
      from app.config.database import Session

      def create_product(product: ProductCreate):
          db = Session()
          db_product = Product(**product.dict())
          db.add(db_product)
          db.commit()
          db.refresh(db_product)
          return db_product
      ```
  - **`utils/`**: Utility functions (e.g., password hashing, JWT generation).
  - **`tests/`**: Unit and integration tests using `pytest`.
- **`requirements.txt`**: Lists Python dependencies (e.g., `fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`).
- **`Dockerfile`**: Containerizes the FastAPI app.
- **`.env`**: Stores sensitive variables (e.g., `DATABASE_URL=postgresql://user:pass@localhost:5432/ecommerce`).

### **Frontend (`frontend/`)**
The frontend is built with **React** and **TypeScript**, using **React Router** for navigation and **Axios** for API calls.

- **`public/`**: Static assets like `index.html` and `favicon.ico`.
- **`src/`**: Core frontend code.
  - **`assets/`**: Static files like images or fonts.
  - **`components/`**: Reusable UI components, organized by feature.
    - Example (`product/ProductCard.tsx`):
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
  - **`pages/`**: Components representing full pages, mapped to routes.
    - Example (`Products.tsx`):
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
  - **`services/`**: API client logic for interacting with the backend.
    - Example (`productService.ts`):
      ```ts
      import axios from 'axios';
      import { Product } from '../types/product';

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

      export const getProducts = async (): Promise<Product[]> => {
          const response = await axios.get(`${API_URL}/products/`);
          return response.data;
      };
      ```
  - **`types/`**: TypeScript interfaces for type safety.
    - Example (`product.ts`):
      ```ts
      export interface Product {
          id: number;
          name: string;
          price: number;
          description?: string;
      }
      ```
  - **`utils/`**: Helper functions (e.g., token management, data formatting).
  - **`styles/`**: Global styles and theme configuration.
  - **`App.tsx`**: Sets up React Router and main layout.
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
- **`tests/`**: Unit tests for components and services using Jest and React Testing Library.
- **`package.json`**: Lists Node dependencies (e.g., `react`, `react-router-dom`, `axios`, `typescript`).
- **`tsconfig.json`**: Configures TypeScript settings.
- **`Dockerfile`**: Containerizes the React app.
- **`.env`**: Stores frontend environment variables (e.g., `REACT_APP_API_URL=http://localhost:8000`).

---

## **Running the Application**

### **Docker Compose Setup**
The `docker-compose.yml` orchestrates the backend, frontend, and database.

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
   - Backend: `cd backend && pip install -r requirements.txt`
   - Frontend: `cd frontend && npm install`
2. Set up environment variables in `backend/.env` and `frontend/.env`.
3. Run the application:
   - With Docker: `docker-compose up --build`
   - Without Docker:
     - Start PostgreSQL (e.g., via Docker: `docker run -p 5432:5432 postgres:13`).
     - Start backend: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000`
     - Start frontend: `cd frontend && npm start`
4. Access the app:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000/docs` (FastAPI Swagger UI)

---

## **Key Features of the Structure**

1. **Modularity**:
   - The backend uses a modular structure (routers, services, models) to keep the monolith maintainable.
   - The frontend organizes components and services by feature (e.g., auth, products).
2. **Separation of Concerns**:
   - Backend: Separates models, schemas, and services for clear responsibilities.
   - Frontend: Separates UI components, API services, and types for reusability.
3. **Scalability Within Monolith**:
   - The structure allows adding new features (e.g., reviews, cart) by creating new routers, services, and components.
   - Modular design eases potential refactoring to microservices later.
4. **Type Safety**:
   - TypeScript ensures type safety in the frontend.
   - Pydantic schemas enforce validation in the backend.
5. **Testing**:
   - Backend tests use `pytest` for unit and integration testing.
   - Frontend tests use Jest and React Testing Library for components and API calls.
6. **Containerization**:
   - Docker and Docker Compose simplify deployment and ensure consistency across environments.

---

## **Sample Workflow**
- **User Registration**:
  - Frontend: User submits data via `Register.tsx` → Calls `authService.register()` → Sends POST to `/auth/register`.
  - Backend: `auth.py` router validates input with `UserCreate` schema → `auth_service.py` hashes password and saves user to database → Returns `UserResponse`.
- **Product Listing**:
  - Frontend: `Products.tsx` fetches products via `productService.getProducts()` → Renders `ProductCard` components.
  - Backend: `products.py` router queries database via `product_service.py` → Returns list of products.

---

## **Extending the Structure**
To add a new feature (e.g., shopping cart):
1. **Backend**:
   - Add `cart.py` in `models/`, `schemas/`, `routers/`, and `services/`.
   - Define endpoints (e.g., `/cart/add`, `/cart/view`).
2. **Frontend**:
   - Add `cart/` in `components/` (e.g., `CartItem.tsx`).
   - Add `Cart.tsx` in `pages/`.
   - Add `cartService.ts` in `services/` for API calls.
   - Update `App.tsx` to include a `/cart` route.

---

If you need sample code for specific files (e.g., `main.py`, `Products.tsx`), a diagram of the architecture (via a canvas panel), or guidance on implementing a specific feature, let me know!
