---
title: Sync Testing
description: Placeholder content for Sync Testing.
order: 1
---

# Sync Testing

Below is an advanced, in-depth version of the notes on using **pytest** for testing a **FastAPI** application with your specific architecture (Python, FastAPI, SQLAlchemy, PostgreSQL, multi-tenant database, synchronous sessions). This version is structured with clear sections, includes all topics you mentioned (e.g., `pytest.ini`, `conftest.py`, mocks, race conditions), and dives deeper into advanced techniques, use cases, and best practices. It assumes a solid understanding of Python and FastAPI and focuses on practical, production-ready testing strategies.

---

# Advanced Pytest Notes for FastAPI Applications

## 1. Introduction to Testing FastAPI with Pytest
Testing a FastAPI application with a multi-tenant architecture, SQLAlchemy ORM, PostgreSQL, and synchronous database sessions requires a robust strategy. Pytest is ideal due to its extensibility, fixture system, and support for both **unit tests** (isolating components) and **integration tests** (testing end-to-end flows). This guide covers setup, implementation, and advanced techniques tailored to your app’s needs.

---

## 2. Project Structure and Organization
A well-structured project ensures scalability and maintainability. Here’s an advanced layout:

```
my_fastapi_app/
│
├── app/                    # Core application logic
│   ├── __init__.py
│   ├── main.py           # FastAPI app instantiation
│   ├── models/           # SQLAlchemy models (e.g., User, Tenant)
│   ├── schemas/          # Pydantic schemas for validation/serialization
│   ├── crud/             # CRUD operations with tenant-aware logic
│   ├── db/               # Database engine, session factory, multi-tenant config
│   ├── routes/           # API route definitions
│   └── middleware/       # Custom middleware (e.g., tenant resolution)
│
├── tests/                 # Test suite
│   ├── __init__.py
│   ├── conftest.py       # Global fixtures (DB, client, mocks)
│   ├── test_models/      # Model validation and behavior tests
│   ├── test_crud/        # CRUD logic tests
│   ├── test_routes/      # API route tests
│   ├── test_db/          # Database interaction tests
│   └── utils/            # Test helpers (e.g., mock data generators)
│
├── pytest.ini             # Pytest configuration
├── .env                   # Environment variables (e.g., TEST_DATABASE_URL)
├── docker-compose.yml     # Optional: Test DB in Docker
└── README.md
```

- **Why This Structure?**
  - Separates concerns (models, routes, tests).
  - Facilitates multi-tenant testing with isolated test modules.
  - Supports scaling to include utilities and complex test cases.

---

## 3. Pytest Configuration
### 3.1. `pytest.ini`
The `pytest.ini` file customizes pytest’s behavior and environment:

```ini
[pytest]
python_files = test_*.py
python_classes = Test*
python_functions = test_*
asyncio_mode = auto           ; For potential async testing
markers =
    unit: Unit tests
    integration: Integration tests
    multi_tenant: Multi-tenant specific tests
addopts =
    -v                ; Verbose output
    --cov=app         ; Coverage for app/ directory
    --cov-report=html ; HTML coverage report
    --cov-fail-under=80 ; Fail if coverage < 80%
env =
    TEST_DATABASE_URL=postgresql://test_user:test_pass@localhost:5432/test_db
    ENV=test
```

- **Advanced Features:**
  - **`markers`**: Tag tests (e.g., `pytest -m unit`) for selective execution.
  - **`asyncio_mode`**: Prepares for async testing if needed later.
  - **`cov-fail-under`**: Enforces minimum coverage.

### 3.2. Dependencies
Install essential packages:
```bash
pip install pytest pytest-cov httpx sqlalchemy psycopg2-binary fastapi python-dotenv pytest-mock
```
- `httpx`: HTTP client for testing FastAPI routes.
- `pytest-mock`: Enhanced mocking utilities.
- `python-dotenv`: Load `.env` variables.

---

## 4. Advanced Fixtures in `conftest.py`
Fixtures are the backbone of reusable test setup. For your app, you’ll need fixtures for the database, session, tenant context, and FastAPI client.

### Example `conftest.py`
```python
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db import get_db, Base  # Dependency and base model
from app.middleware import set_tenant_context  # Hypothetical tenant middleware

# Load test DB URL
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")

@pytest.fixture(scope="session")
def test_engine():
    """Create and teardown test database schema."""
    engine = create_engine(TEST_DATABASE_URL, echo=False)
    Base.metadata.create_all(bind=engine)  # Create tables
    yield engine
    Base.metadata.drop_all(bind=engine)  # Cleanup

@pytest.fixture(scope="function")
def test_db(test_engine):
    """Provide a fresh DB session per test with rollback."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    db = TestingSessionLocal()
    yield db
    db.rollback()  # Undo changes
    db.close()

@pytest.fixture(scope="function")
def client(test_db):
    """FastAPI test client with overridden DB dependency."""
    def override_get_db():
        try:
            yield test_db
        finally:
            test_db.rollback()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def tenant_headers():
    """Simulate tenant-specific headers."""
    return {"X-Tenant-ID": "tenant1"}
```

- **Advanced Notes:**
  - **`scope="session"` vs. `"function"`**: Use `"session"` for expensive setups (e.g., DB schema) and `"function"` for per-test isolation.
  - **`rollback`**: Ensures test isolation without dropping tables repeatedly.
  - **`tenant_headers`**: Simplifies multi-tenant testing.

---

## 5. Writing Advanced Tests
### 5.1. Unit Tests
Unit tests isolate logic (e.g., CRUD, model methods) and mock dependencies.

#### Example: Testing CRUD with Mocks
```python
# app/crud/user.py
from sqlalchemy.orm import Session
from app.models.user import User

def create_user(db: Session, name: str, tenant_id: str):
    user = User(name=name, tenant_id=tenant_id)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# tests/test_crud/test_user.py
from app.crud.user import create_user
from unittest.mock import MagicMock

def test_create_user():
    db_mock = MagicMock()
    user = create_user(db_mock, name="John Doe", tenant_id="tenant1")
    
    assert user.name == "John Doe"
    assert user.tenant_id == "tenant1"
    db_mock.add.assert_called_once_with(user)
    db_mock.commit.assert_called_once()
    db_mock.refresh.assert_called_once_with(user)
```

- **Advanced Tip**: Use `MagicMock` to verify call counts and arguments.

### 5.2. Integration Tests
Integration tests validate API routes with real database interactions.

#### Example: Testing a Route
```python
# app/routes/user.py
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.crud.user import create_user
from app.db import get_db

router = APIRouter()

@router.post("/users/")
def create_user_route(name: str, tenant_id: str = Header(...), db: Session = Depends(get_db)):
    return create_user(db, name, tenant_id)

# tests/test_routes/test_user.py
def test_create_user_route(client, tenant_headers):
    payload = {"name": "Jane Doe"}
    response = client.post("/users/", json=payload, headers=tenant_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Jane Doe"
    assert data["tenant_id"] == "tenant1"
```

- **Advanced Tip**: Use parametrized fixtures for multiple tenants.

### 5.3. Multi-Tenant Testing
Ensure tenant isolation and data segregation.

#### Example:
```python
@pytest.mark.multi_tenant
def test_tenant_isolation(client):
    headers1 = {"X-Tenant-ID": "tenant1"}
    headers2 = {"X-Tenant-ID": "tenant2"}
    
    client.post("/users/", json={"name": "User1"}, headers=headers1)
    client.post("/users/", json={"name": "User2"}, headers=headers2)
    
    resp1 = client.get("/users/", headers=headers1).json()
    resp2 = client.get("/users/", headers=headers2).json()
    
    assert len(resp1) == 1 and resp1[0]["name"] == "User1"
    assert len(resp2) == 1 and resp2[0]["name"] == "User2"
```

- **Advanced Tip**: Use schema-based tenancy (e.g., separate DB schemas) and test schema switching.

---

## 6. Advanced Testing Tools and Techniques
### 6.1. `patch` and `monkeypatch`
- **`patch`**: Replaces objects in a namespace temporarily.
- **`monkeypatch`**: Modifies runtime behavior (e.g., env vars).

#### Example: Patching an External Service
```python
from unittest.mock import patch

def test_patched_service(client):
    with patch("app.crud.user.external_api_call", return_value={"status": "mocked"}):
        response = client.get("/some-endpoint/")
        assert response.json()["status"] == "mocked"
```

- **Use Case**: Mock third-party APIs or database failures.

### 6.2. `MagicMock` and `Mock`
- **`MagicMock`**: Dynamic mock with customizable behavior.

#### Example:
```python
from unittest.mock import MagicMock

def test_magicmock_db():
    db = MagicMock()
    db.query().filter().first.return_value = {"id": 1}
    result = some_function(db)
    assert result["id"] == 1
```

- **Use Case**: Simulate complex ORM queries.

### 6.3. `concurrent.futures` for Race Conditions
Test concurrency issues in multi-tenant apps.

#### Example:
```python
import concurrent.futures

def test_race_condition(client, tenant_headers):
    def create_user():
        return client.post("/users/", json={"name": "RaceUser"}, headers=tenant_headers)
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(create_user) for _ in range(10)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]
    
    assert all(r.status_code == 200 for r in results)
    assert len(client.get("/users/", headers=tenant_headers).json()) == 10
```

- **Use Case**: Detect duplicate entries or deadlocks.

---

## 7. Best Practices for Production-Ready Testing
1. **Isolation**: Use `rollback` or separate test DBs to prevent test interference.
2. **Mocking**: Mock external services, but test real DB interactions in integration tests.
3. **Coverage**: Aim for 80%+ coverage, focusing on critical paths.
4. **Parametrization**: Use `@pytest.mark.parametrize` for edge cases (e.g., invalid payloads).
5. **Logging**: Capture logs during tests to debug failures.

---

## 8. Common Scenarios and Advanced Solutions
- **Authentication**: Mock JWT tokens or override `Depends` with a fixture.
- **Database Failures**: Use `patch` to simulate connection errors.
- **Tenant Switching**: Test middleware with multiple `tenant_headers`.
- **Performance**: Use `pytest-benchmark` for route latency testing.

---

## 9. Learning and Mastery Path
1. **Basics**: Master route testing with `TestClient`.
2. **Database**: Integrate SQLAlchemy with fixtures.
3. **Mocking**: Experiment with `patch`, `MagicMock`, and `monkeypatch`.
4. **Concurrency**: Test race conditions with `concurrent.futures`.
5. **Coverage**: Refine tests based on `pytest-cov` reports.

---

This advanced guide equips you with the tools and knowledge to implement a robust test suite for your FastAPI app. Start with the basics, then layer in advanced techniques as you gain confidence. Let me know if you need specific code examples or deeper explanations!

Below is a rewritten and expanded version of your testing section, structured professionally and enriched with additional examples for **Unit Tests**, **Integration Tests**, **Mocking and Patching**, and **Concurrency Testing**. This version provides detailed explanations, multiple practical examples (three or more per section), and focuses on your FastAPI app with SQLAlchemy, PostgreSQL, and multi-tenant architecture. The goal is to give you a clear understanding of how to write and apply these tests effectively.

---

# Writing Tests for FastAPI Applications

## 5. Unit Tests
### Purpose
Unit tests validate individual components (e.g., functions, classes, utilities) in isolation, mocking out external dependencies like databases or APIs to focus on the logic.

### Tools
- **`unittest.mock`**: Core mocking library for Python.
- **`patch`**: Temporarily replaces objects or functions with mocks.
- **`MagicMock`**: A flexible mock object that can simulate complex behavior.

### Examples
#### Example 1: Testing a Utility Function
```python
# app/utils.py
def fetch_user_data(user_id: int):
    from app.crud.user import get_user  # Dependency
    return get_user(user_id).name

# tests/test_utils/test_utils.py
from unittest.mock import patch
from app.utils import fetch_user_data

def test_fetch_user_data():
    with patch("app.utils.get_user") as mock_get_user:
        mock_get_user.return_value = MagicMock(name="John Doe")
        result = fetch_user_data(user_id=1)
        assert result == "John Doe"
        mock_get_user.assert_called_once_with(1)
```
- **Explanation**: Mocks `get_user` to return a mock object with a `name` attribute, ensuring the utility function processes it correctly.

#### Example 2: Testing a CRUD Function
```python
# app/crud/user.py
from sqlalchemy.orm import Session
from app.models.user import User

def create_user(db: Session, name: str, tenant_id: str):
    user = User(name=name, tenant_id=tenant_id)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# tests/test_crud/test_user.py
from app.crud.user import create_user
from unittest.mock import MagicMock

def test_create_user():
    db_mock = MagicMock()
    user = create_user(db_mock, name="Alice", tenant_id="tenant1")
    
    assert user.name == "Alice"
    assert user.tenant_id == "tenant1"
    db_mock.add.assert_called_once()
    db_mock.commit.assert_called_once()
    db_mock.refresh.assert_called_once_with(user)
```
- **Explanation**: Uses `MagicMock` to simulate a database session, verifying method calls and return values.

#### Example 3: Testing Tenant Validation Logic
```python
# app/utils.py
def validate_tenant(tenant_id: str):
    from app.db import get_tenant  # Dependency
    tenant = get_tenant(tenant_id)
    if not tenant:
        raise ValueError("Invalid tenant")
    return tenant.id

# tests/test_utils/test_utils.py
from unittest.mock import patch
from app.utils import validate_tenant

def test_validate_tenant_invalid():
    with patch("app.utils.get_tenant") as mock_get_tenant:
        mock_get_tenant.return_value = None
        with pytest.raises(ValueError, match="Invalid tenant"):
            validate_tenant("tenantX")
        mock_get_tenant.assert_called_once_with("tenantX")
```
- **Explanation**: Simulates a missing tenant and checks for proper exception handling.

---

## 6. Integration Tests
### Purpose
Integration tests verify interactions between components (e.g., API routes, database, middleware) to ensure the system works as a whole.

### Tools
- **`TestClient`**: FastAPI’s test client for making HTTP requests.
- **`pytest fixtures`**: Setup/teardown for database, headers, etc.

### Examples
#### Example 1: Testing a Basic API Route
```python
# app/routes/user.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.crud.user import create_user

router = APIRouter()

@router.post("/users/")
def create_user_route(name: str, tenant_id: str = Header(...), db: Session = Depends(get_db)):
    return create_user(db, name, tenant_id)

# tests/test_routes/test_user.py
def test_create_user_route(client, tenant_headers):
    payload = {"name": "Bob"}
    response = client.post("/users/", json=payload, headers=tenant_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Bob"
    assert data["tenant_id"] == "tenant1"
```
- **Explanation**: Uses the `client` fixture to test the full route with a real DB session.

#### Example 2: Testing a Protected Route with Authentication
```python
# app/routes/user.py
from fastapi import APIRouter, Depends, Header
from app.auth import get_current_user

router = APIRouter()

@router.get("/users/")
def get_all_users(api_key: str = Header(...), user=Depends(get_current_user)):
    return [{"id": 1, "name": "Test User"}]

# tests/test_routes/test_user.py
def test_get_all_users(client, vendor_login):
    headers = {"api-key": "valid_key"}
    response = client.get("/users/", headers=headers, cookies=vendor_login["cookies"])
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert response.json()[0]["name"] == "Test User"
```
- **Explanation**: Tests an authenticated route with cookies from a `vendor_login` fixture.

#### Example 3: Testing Multi-Tenant Data Retrieval
```python
# app/routes/user.py
@router.get("/users/")
def get_users(tenant_id: str = Header(...), db: Session = Depends(get_db)):
    return db.query(User).filter(User.tenant_id == tenant_id).all()

# tests/test_routes/test_user.py
def test_get_users_by_tenant(client):
    # Seed data
    client.post("/users/", json={"name": "User1"}, headers={"X-Tenant-ID": "tenant1"})
    client.post("/users/", json={"name": "User2"}, headers={"X-Tenant-ID": "tenant2"})
    
    response = client.get("/users/", headers={"X-Tenant-ID": "tenant1"})
    assert response.status_code == 200
    users = response.json()
    assert len(users) == 1
    assert users[0]["name"] == "User1"
```
- **Explanation**: Verifies tenant isolation in data retrieval.

---

## 7. Mocking and Patching
### Purpose
Mocking and patching simulate external behavior (e.g., database errors, API responses) to test how the app handles it.

### Tools
- **`patch`**: Replaces objects/functions during a test.
- **`MagicMock`**: Creates mock objects with customizable behavior.

### Use Cases
- Simulate database errors, missing data, or external service responses.

### Examples
#### Example 1: Simulating a Database Error
```python
# app/routes/user.py
@router.get("/users/")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# tests/test_routes/test_user.py
from unittest.mock import patch

def test_database_error(client):
    with patch("app.routes.user.get_db") as mock_get_db:
        mock_db = MagicMock()
        mock_db.query.side_effect = Exception("Database error")
        mock_get_db.return_value = mock_db
        
        response = client.get("/users/")
        assert response.status_code == 500
        assert "Database error" in response.text
```
- **Explanation**: Mocks a DB failure and checks error handling.

#### Example 2: Mocking an External API Call
```python
# app/utils.py
import requests
def fetch_external_data():
    response = requests.get("https://api.example.com/data")
    return response.json()

# tests/test_utils/test_utils.py
from unittest.mock import patch
from app.utils import fetch_external_data

def test_fetch_external_data():
    with patch("app.utils.requests.get") as mock_get:
        mock_get.return_value = MagicMock(json=lambda: {"key": "value"})
        result = fetch_external_data()
        assert result == {"key": "value"}
        mock_get.assert_called_once_with("https://api.example.com/data")
```
- **Explanation**: Avoids real HTTP requests by mocking `requests.get`.

#### Example 3: Simulating Missing Data
```python
# app/crud/user.py
def get_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    return user

# tests/test_crud/test_user.py
from unittest.mock import MagicMock

def test_get_user_not_found():
    db_mock = MagicMock()
    db_mock.query().filter().first.return_value = None
    
    with pytest.raises(ValueError, match="User not found"):
        get_user(db_mock, user_id=999)
```
- **Explanation**: Uses `MagicMock` to simulate a missing user and test error handling.

---

## 8. Concurrency Testing
### Purpose
Concurrency tests simulate multiple users or processes accessing resources simultaneously to detect race conditions or contention issues.

### Tools
- **`concurrent.futures`**: Executes tasks in parallel using threads or processes.

### Use Cases
- Test race conditions, resource locking, or multi-tenant data integrity.

### Examples
#### Example 1: Testing Concurrent User Creation
```python
# tests/test_routes/test_user.py
from concurrent.futures import ThreadPoolExecutor

def test_concurrent_user_creation(client, tenant_headers):
    def create_user(i):
        return client.post("/users/", json={"name": f"User{i}"}, headers=tenant_headers)
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(create_user, range(10)))
    
    assert all(r.status_code == 200 for r in results)
    users = client.get("/users/", headers=tenant_headers).json()
    assert len(users) == 10
```
- **Explanation**: Simulates 10 concurrent user creations and checks for duplicates or failures.

#### Example 2: Testing Resource Contention
```python
# app/routes/counter.py
from fastapi import APIRouter
router = APIRouter()
counter = 0

@router.post("/increment/")
def increment_counter():
    global counter
    temp = counter
    temp += 1
    counter = temp
    return {"counter": counter}

# tests/test_routes/test_counter.py
from concurrent.futures import ThreadPoolExecutor

def test_concurrent_counter(client):
    def increment():
        return client.post("/increment/")
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(increment, range(100)))
    
    final_count = client.post("/increment/").json()["counter"]
    assert final_count == 101  # Should be 100 increments + 1 final call
```
- **Explanation**: Tests a shared counter for race conditions (without locks, this may fail).

#### Example 3: Testing Multi-Tenant Concurrency
```python
# tests/test_routes/test_user.py
from concurrent.futures import ThreadPoolExecutor

def test_concurrent_multi_tenant(client):
    headers1 = {"X-Tenant-ID": "tenant1"}
    headers2 = {"X-Tenant-ID": "tenant2"}
    
    def create_user(headers):
        return client.post("/users/", json={"name": "ConcurrentUser"}, headers=headers)
    
    with ThreadPoolExecutor(max_workers=4) as executor:
        results = []
        results.extend(executor.map(lambda _: create_user(headers1), range(2)))
        results.extend(executor.map(lambda _: create_user(headers2), range(2)))
    
    assert all(r.status_code == 200 for r in results)
    assert len(client.get("/users/", headers=headers1).json()) == 2
    assert len(client.get("/users/", headers=headers2).json()) == 2
```
- **Explanation**: Ensures tenant isolation under concurrent access.

---

## Key Takeaways
- **Unit Tests**: Isolate logic with mocks; test edge cases and errors.
- **Integration Tests**: Validate full flows with real DB interactions.
- **Mocking/Patching**: Simulate failures or external systems for controlled testing.
- **Concurrency**: Use `concurrent.futures` to stress-test shared resources.

These examples provide a solid foundation for writing tests tailored to your FastAPI app. Experiment with them, adjust payloads/headers as needed, and let me know if you’d like further clarification!


### 4. **Writing Tests**

#### **Unit Tests**

- **Purpose**: Test individual components (e.g., functions, classes) in isolation.
- **Tools**: `unittest.mock`, `patch`, `MagicMock`.
- **Example**: Test a utility function.

```python
from unittest.mock import patch

def test_utility_function():
    # Mock dependencies and test the function
    with patch('app.utils.some_function') as mock_function:
        mock_function.return_value = "mocked_value"
        result = utility_function()
        assert result == "expected_value"
```

#### **Integration Tests**

- **Purpose**: Test interactions between different parts of the application.
- **Tools**: `TestClient`, `pytest` fixtures.
- **Example**: Test an API route.

```python
def test_get_all_users(client, vendor_login):
    headers = {
        "accept": "application/json",
        "api-key": API_KEY,
    }
    response = client.get("/user/apiv2/get-all-users/", headers=headers, cookies=vendor_login["cookies"])
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

### 5. **Mocking and Patching**

- **`patch`**: Temporarily replace objects with mock objects.
- **`MagicMock`**: Create flexible mock objects with arbitrary behavior.
- **Use Cases**: Simulate database errors, missing data, or external service responses.

```python
from unittest.mock import patch, MagicMock

def test_database_error(client, vendor_login):
    with patch('app.routes.your_routes.get_vendor_db') as mock_get_db:
        mock_get_db.side_effect = Exception("Database error")
        response = client.get("/user/apiv2/get-all-users/", headers={"api-key": API_KEY}, cookies=vendor_login["cookies"])
        assert response.status_code == 500
```

### 6. **Concurrency Testing**

- **`concurrent.futures`**: Test race conditions and concurrent access.
- **Use Cases**: Simulate multiple users accessing the same resource.

```python
from concurrent.futures import ThreadPoolExecutor

def test_concurrent_access(client, vendor_login):
    def access_route():
        return client.get("/user/apiv2/get-all-users/", headers={"api-key": API_KEY}, cookies=vendor_login["cookies"])

    with ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(access_route, range(5)))

    for response in results:
        assert response.status_code == 200
```
---
