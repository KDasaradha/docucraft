---
title: SQLAlchemy Sync
description: Placeholder content for SQLAlchemy Sync.
order: 3
---

# SQLAlchemy Sync

Since your **FastAPI app** is developed using **SQLAlchemy, Pydantic, and PostgreSQL** and everything is **synchronous**, here's how you can implement **proper Pytest cases** for your **FastAPI routes**.

---

## **1. Install Required Packages**
Make sure you have installed the necessary dependencies:

```bash
pip install pytest httpx psycopg2 sqlalchemy fastapi
```

---

## **2. Sample FastAPI Application**
Let's assume your **FastAPI app** manages users and is built with **SQLAlchemy (synchronous mode), Pydantic, and PostgreSQL**.

### **Folder Structure**
```
/fastapi_app
    ├── main.py
    ├── models.py
    ├── database.py
    ├── schemas.py
    ├── test_main.py
```

---

### **File: `database.py`** (Synchronous Database Connection)
```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres:password@localhost:5432/test_db"

# Create the database engine
engine = create_engine(DATABASE_URL)

# Create a session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define the Base class for models
Base = declarative_base()

# Function to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

### **File: `models.py`** (SQLAlchemy ORM Model)
```python
from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
```

---

### **File: `schemas.py`** (Pydantic Schemas)
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

### **File: `main.py`** (FastAPI Application)
```python
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db, engine
from models import Base, User
from schemas import UserCreate, UserResponse

app = FastAPI()

# Create database tables
Base.metadata.create_all(bind=engine)

@app.post("/users/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(name=user.name, email=user.email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

---

## **3. Writing Pytest Cases**
Now, let's create **proper Pytest cases** for this FastAPI application.

### **File: `test_main.py`**
```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import get_db, Base
from main import app

# Create a test database (Use SQLite for testing)
TEST_DATABASE_URL = "sqlite:///./test.db"

# Set up the test database engine
engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the test database tables
Base.metadata.create_all(bind=engine)

# Dependency override for database session
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Override the actual DB dependency with test DB
app.dependency_overrides[get_db] = override_get_db

# Create a test client
client = TestClient(app)

# Test user creation
def test_create_user():
    response = client.post("/users/", json={"name": "John Doe", "email": "john@example.com"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "John Doe"
    assert data["email"] == "john@example.com"

# Test fetching user by ID
def test_get_user():
    # First, create a user
    response = client.post("/users/", json={"name": "Alice", "email": "alice@example.com"})
    assert response.status_code == 200
    user_id = response.json()["id"]

    # Now, fetch the user
    response = client.get(f"/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Alice"

# Test fetching a non-existent user
def test_get_user_not_found():
    response = client.get("/users/999")
    assert response.status_code == 404
    assert response.json() == {"detail": "User not found"}

# Test duplicate email registration
def test_create_duplicate_user():
    response = client.post("/users/", json={"name": "Bob", "email": "bob@example.com"})
    assert response.status_code == 200

    response = client.post("/users/", json={"name": "Bob Duplicate", "email": "bob@example.com"})
    assert response.status_code == 400
    assert response.json() == {"detail": "Email already registered"}
```

---

## **4. Running the Tests**
Run all tests:

```bash
pytest -v
```

Run a specific test:

```bash
pytest test_main.py::test_create_user
```

---

## **5. Explanation of the Test Setup**
- **Test Database (`sqlite:///./test.db`)**: Instead of using PostgreSQL for testing, we use **SQLite**.
- **Dependency Override (`app.dependency_overrides`)**: We replace the actual database with a **test database session**.
- **`TestClient(app)`**: Simulates HTTP requests to the FastAPI routes.
- **Assertions**:
  - Check response status codes.
  - Validate returned data.
  - Ensure duplicate users are not allowed.

---

## **6. Generating Test Reports**
To get a detailed test coverage report, run:

```bash
pytest --cov=main --cov-report=html
```

This will generate an **HTML test coverage report**.

---

## **7. Running Tests in Parallel**
To speed up tests, install `pytest-xdist`:

```bash
pip install pytest-xdist
```

Run tests in parallel:

```bash
pytest -n auto
```

---

## **Final Thoughts**
- **FastAPI's dependency injection** makes it easy to swap the actual DB with a test DB.
- **Using SQLite for testing** ensures tests are fast and independent.
- **TestClient** helps in making HTTP requests without needing to start the FastAPI server.
- **Proper test cases** check API responses, database interactions, and error handling.

This setup provides a **clean, isolated, and efficient** way to test **synchronous FastAPI routes** with SQLAlchemy and PostgreSQL. 🚀

Yes, you **can** use PostgreSQL as the test database for Pytest instead of SQLite. However, it’s usually recommended to use a **separate PostgreSQL test database** to ensure that tests do not interfere with the production database.

---

## **1. Setting Up a Separate PostgreSQL Test Database**
### **Option 1: Use a Temporary PostgreSQL Database**
- You can create a separate test database like `test_db` and clean up data after tests.
- This requires a running PostgreSQL instance.

### **Option 2: Use PostgreSQL in Docker**
- You can run a separate PostgreSQL container for testing.
- Example Docker command to run a PostgreSQL test database:

```bash
docker run --name test-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=test_db -p 5433:5432 -d postgres
```
- This runs PostgreSQL on **port 5433**, so it doesn’t interfere with your production database.

---

## **2. Update Your FastAPI Application to Use a Test Database**
Modify the `database.py` to allow switching between the production and test databases.

### **File: `database.py`**
```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Switch between test and production databases using an environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/mydb")
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "postgresql://postgres:password@localhost:5433/test_db")

# Detect if running tests
if "pytest" in os.getenv("RUNNING_TESTS", ""):
    DATABASE_URL = TEST_DATABASE_URL

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

Set an **environment variable** in the terminal before running tests:

```bash
export RUNNING_TESTS="pytest"
```

Or for Windows:

```powershell
$env:RUNNING_TESTS="pytest"
```

---

## **3. Writing Pytest Cases Using PostgreSQL**
Now, let’s write tests that will use the **PostgreSQL test database**.

### **File: `test_main.py`**
```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import get_db, Base, TEST_DATABASE_URL
from main import app

# Set up a separate PostgreSQL test database
engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the test database tables before running tests
Base.metadata.create_all(bind=engine)

# Override the get_db function to use the test database
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Apply the override
app.dependency_overrides[get_db] = override_get_db

# Create a test client
client = TestClient(app)

@pytest.fixture(scope="function")
def setup_test_db():
    """This fixture clears the database before each test"""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_create_user(setup_test_db):
    response = client.post("/users/", json={"name": "John Doe", "email": "john@example.com"})
    assert response.status_code == 200
    assert response.json()["name"] == "John Doe"

def test_get_user(setup_test_db):
    # Create a user first
    response = client.post("/users/", json={"name": "Alice", "email": "alice@example.com"})
    assert response.status_code == 200
    user_id = response.json()["id"]

    # Fetch the user
    response = client.get(f"/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Alice"

def test_get_user_not_found(setup_test_db):
    response = client.get("/users/999")
    assert response.status_code == 404
    assert response.json() == {"detail": "User not found"}

def test_create_duplicate_user(setup_test_db):
    response = client.post("/users/", json={"name": "Bob", "email": "bob@example.com"})
    assert response.status_code == 200

    response = client.post("/users/", json={"name": "Bob Duplicate", "email": "bob@example.com"})
    assert response.status_code == 400
    assert response.json() == {"detail": "Email already registered"}
```

---

## **4. Running the Tests with PostgreSQL**
### **Run All Tests**
```bash
pytest -v
```

### **Run a Specific Test**
```bash
pytest test_main.py::test_create_user
```

### **Using Docker (If PostgreSQL Is Running in a Container)**
Ensure that the **PostgreSQL test container** is running on **port 5433**, then run:

```bash
TEST_DATABASE_URL="postgresql://postgres:password@localhost:5433/test_db" pytest -v
```

---

## **5. Explanation of the Setup**
1. **Using PostgreSQL for Testing**:
   - We create a separate **test database (`test_db`)**.
   - We use **PostgreSQL instead of SQLite** for more accurate testing.

2. **Environment Variable Switch**:
   - `RUNNING_TESTS="pytest"` ensures the app connects to **TEST_DATABASE_URL** during tests.

3. **Fixtures (`setup_test_db`)**:
   - **Before each test**, it **clears the database** (`drop_all()`, `create_all()`).
   - This ensures **tests do not interfere with each other**.

4. **Dependency Override (`app.dependency_overrides`)**:
   - The test database **replaces the actual database** so that tests **don't affect production data**.

---

## **6. Generating Test Reports**
For coverage reports:

```bash
pytest --cov=main --cov-report=html
```

To run tests in parallel:

```bash
pytest -n auto
```

---

## **7. Final Thoughts**
✅ **PostgreSQL as the test database** ensures consistency with production.  
✅ **Pytest fixtures** help maintain a clean test database.  
✅ **Using a Docker-based PostgreSQL test database** keeps tests isolated.  
✅ **FastAPI’s dependency injection** makes swapping databases easy.  

This setup is **robust, scalable, and production-ready**! 🚀