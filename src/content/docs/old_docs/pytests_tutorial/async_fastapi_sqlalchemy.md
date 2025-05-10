---
title: SQLAlchemy Async
description: Placeholder content for SQLAlchemy Async.
order: 4
---

# SQLAlchemy Async

For your **asynchronous FastAPI app** that uses **async SQLAlchemy ORM with PostgreSQL**, here’s a **detailed guide** on how to implement **Pytest with a mocked database**.

---

# **1. Installing Required Packages**
Ensure you have installed the necessary dependencies:

```bash
pip install pytest pytest-asyncio httpx asyncpg sqlalchemy alembic
```

### **Package Explanation:**
- `pytest` → Runs the test cases.
- `pytest-asyncio` → Required for async tests.
- `httpx` → Simulates HTTP requests to FastAPI endpoints.
- `asyncpg` → PostgreSQL async driver.
- `sqlalchemy` → Async ORM for database interactions.
- `alembic` → Handles database migrations.

---

# **2. FastAPI Application Setup (Async)**
### **Folder Structure**
```
/async_fastapi_app
    ├── main.py
    ├── database.py
    ├── models.py
    ├── schemas.py
    ├── crud.py
    ├── test_main.py
```

---

### **File: `database.py` (Async SQLAlchemy Setup)**
```python
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Use environment variables for DB URLs (Set different URLs for tests)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost:5432/mydb")

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create async session
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

# Define Base class for models
Base = declarative_base()

# Dependency function for async database session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

---

### **File: `models.py` (Async SQLAlchemy ORM)**
```python
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.asyncio import AsyncAttrs
from database import Base

class User(AsyncAttrs, Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
```

---

### **File: `schemas.py` (Pydantic Schemas)**
```python
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True
```

---

### **File: `crud.py` (Async CRUD Operations)**
```python
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import User
from schemas import UserCreate

async def create_user(db: AsyncSession, user: UserCreate):
    new_user = User(name=user.name, email=user.email)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

async def get_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(User).filter(User.id == user_id))
    return result.scalars().first()
```

---

### **File: `main.py` (FastAPI Routes)**
```python
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db, engine, Base
from crud import create_user, get_user
from schemas import UserCreate, UserResponse

app = FastAPI()

# Create database tables
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("startup")
async def startup():
    await init_db()

@app.post("/users/", response_model=UserResponse)
async def create_user_route(user: UserCreate, db: AsyncSession = Depends(get_db)):
    new_user = await create_user(db, user)
    return new_user

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user_route(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

---

# **3. Implementing Pytest for FastAPI (Using Mocked DB)**

## **Using an In-Memory Mock Database for Testing**
We **mock** the database by overriding the `get_db()` dependency using an **in-memory SQLite database**.

---

### **File: `test_main.py`**
```python
import pytest
import asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from database import get_db, Base
from main import app

# Use an in-memory SQLite test database
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create async engine for testing
test_engine = create_async_engine(TEST_DATABASE_URL, echo=True)
TestingSessionLocal = sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)

# Override get_db function to use the test database
async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function", autouse=True)
async def setup_test_db():
    """Fixture to create and clean the database before and after each test."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_create_user():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/users/", json={"name": "John Doe", "email": "john@example.com"})
        assert response.status_code == 200
        assert response.json()["name"] == "John Doe"

@pytest.mark.asyncio
async def test_get_user():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Create a user first
        response = await client.post("/users/", json={"name": "Alice", "email": "alice@example.com"})
        assert response.status_code == 200
        user_id = response.json()["id"]

        # Now, fetch the user
        response = await client.get(f"/users/{user_id}")
        assert response.status_code == 200
        assert response.json()["name"] == "Alice"

@pytest.mark.asyncio
async def test_get_user_not_found():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/users/999")
        assert response.status_code == 404
        assert response.json() == {"detail": "User not found"}
```

---

# **4. Running the Tests**
Run all tests:

```bash
pytest -v
```

Run a specific test:

```bash
pytest test_main.py::test_create_user
```

Run tests with **async support**:

```bash
pytest --asyncio-mode=auto
```

---

# **5. Explanation of the Setup**
✅ **Using an In-Memory Mock Database (`sqlite+aiosqlite:///:memory:`)**  
- It allows running tests without affecting the real PostgreSQL database.

✅ **Using `pytest-asyncio` to Run Async Tests**  
- Each test function is **async**, and we use `@pytest.mark.asyncio` to support it.

✅ **Using Dependency Override (`app.dependency_overrides`)**  
- This replaces the real database session with a **mocked session**.

✅ **Using `AsyncClient` for HTTP Requests**  
- FastAPI’s `TestClient` doesn’t support async, so we use **httpx.AsyncClient**.

✅ **Using a Fixture (`setup_test_db`)**  
- Before **each test**, we **create the database**.
- After the test, we **drop the tables** to reset the database.

---

# **6. Generating Test Coverage Reports**
To see test coverage:

```bash
pytest --cov=main --cov-report=html
```

To run tests **in parallel**:

```bash
pytest -n auto
```

---

### 🚀 **Final Thoughts**
This **full-fledged Pytest setup** ensures:
- **Realistic testing** using an **async database**.
- **Proper isolation** with a **mocked database**.
- **Efficient test execution** using `pytest-asyncio`.

Now your **async FastAPI app** has **fully tested routes** with **mocked PostgreSQL DB**! 🚀

### **Full-Fledged Pytest Setup for an Async FastAPI App Using a Mock PostgreSQL Database**  

Since you want to use **PostgreSQL as a mock database** for testing **async FastAPI routes with SQLAlchemy**, here’s a **detailed guide** on how to set up Pytest for it.

---

# **1. Install Required Packages**
First, install all necessary dependencies:

```bash
pip install pytest pytest-asyncio httpx asyncpg sqlalchemy alembic psycopg2-binary
```

- `pytest` → Runs test cases.
- `pytest-asyncio` → Handles async test cases.
- `httpx` → Async HTTP client for testing FastAPI routes.
- `asyncpg` → Asynchronous PostgreSQL driver.
- `sqlalchemy` → ORM for database queries.
- `alembic` → Handles database migrations.
- `psycopg2-binary` → Required for PostgreSQL connections.

---

# **2. Setting Up the Async FastAPI App with PostgreSQL**
We will structure the app as follows:

```
/async_fastapi_app
    ├── main.py
    ├── database.py
    ├── models.py
    ├── schemas.py
    ├── crud.py
    ├── test_main.py
```

---

## **2.1. Setting Up the Async PostgreSQL Database Connection**
### **File: `database.py`**
```python
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Use environment variables for database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost:5432/mydb")
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost:5433/test_db")

# Detect if running tests
if "pytest" in os.getenv("RUNNING_TESTS", ""):
    DATABASE_URL = TEST_DATABASE_URL

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create async session
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

# Define Base class for models
Base = declarative_base()

# Dependency function for async database session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

💡 **Key Notes:**
- `DATABASE_URL` is used for **production**.
- `TEST_DATABASE_URL` is used for **mock PostgreSQL testing**.
- We **override** the database URL when running tests.

---

## **2.2. Define Models (SQLAlchemy ORM)**
### **File: `models.py`**
```python
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.asyncio import AsyncAttrs
from database import Base

class User(AsyncAttrs, Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
```

---

## **2.3. Define Pydantic Schemas**
### **File: `schemas.py`**
```python
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True
```

---

## **2.4. Async CRUD Operations**
### **File: `crud.py`**
```python
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import User
from schemas import UserCreate

async def create_user(db: AsyncSession, user: UserCreate):
    new_user = User(name=user.name, email=user.email)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

async def get_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(User).filter(User.id == user_id))
    return result.scalars().first()
```

---

## **2.5. FastAPI Routes**
### **File: `main.py`**
```python
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db, engine, Base
from crud import create_user, get_user
from schemas import UserCreate, UserResponse

app = FastAPI()

# Create database tables on startup
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("startup")
async def startup():
    await init_db()

@app.post("/users/", response_model=UserResponse)
async def create_user_route(user: UserCreate, db: AsyncSession = Depends(get_db)):
    new_user = await create_user(db, user)
    return new_user

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user_route(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

---

# **3. Setting Up Pytest with Mock PostgreSQL**
We will use a **test PostgreSQL database** running on **port 5433**.

### **Run a PostgreSQL container for testing:**
```bash
docker run --name test-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=test_db -p 5433:5432 -d postgres
```

---

### **File: `test_main.py`**
```python
import pytest
import asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from database import get_db, Base, TEST_DATABASE_URL
from main import app

# Create test PostgreSQL engine
test_engine = create_async_engine(TEST_DATABASE_URL, echo=True)
TestingSessionLocal = sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)

# Override get_db function to use test database
async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function", autouse=True)
async def setup_test_db():
    """Creates and cleans the database before and after each test."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_create_user():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/users/", json={"name": "John Doe", "email": "john@example.com"})
        assert response.status_code == 200
        assert response.json()["name"] == "John Doe"

@pytest.mark.asyncio
async def test_get_user():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/users/", json={"name": "Alice", "email": "alice@example.com"})
        assert response.status_code == 200
        user_id = response.json()["id"]

        response = await client.get(f"/users/{user_id}")
        assert response.status_code == 200
        assert response.json()["name"] == "Alice"

@pytest.mark.asyncio
async def test_get_user_not_found():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/users/999")
        assert response.status_code == 404
        assert response.json() == {"detail": "User not found"}
```

---

# **4. Running the Tests**
### **Set Environment Variable for Testing**
```bash
export RUNNING_TESTS="pytest"
```

### **Run Tests**
```bash
pytest -v --asyncio-mode=auto
```

---

# **5. Generating Test Coverage Reports**
```bash
pytest --cov=main --cov-report=html
```

---

## 🚀 **Final Thoughts**
✅ Uses **PostgreSQL as the mock database** instead of SQLite.  
✅ Ensures **realistic testing** for async SQLAlchemy queries.  
✅ Uses **pytest fixtures** to create and destroy the database per test.  
✅ **FastAPI’s dependency injection** makes it easy to swap databases.  

Now you have a **full-fledged Pytest setup for an async FastAPI app using a mock PostgreSQL database**! 🎯🚀