---
title: Async Testing
description: Placeholder content for Async Testing.
order: 2
---

# Async Testing

For **async APIs** in a FastAPI application (using Python, FastAPI, SQLAlchemy with async support, PostgreSQL, multi-tenant architecture), the testing approach with pytest shifts slightly due to the asynchronous nature of the APIs and database interactions. Below, I’ll adapt the previous advanced notes to focus on **async APIs**, highlighting changes in setup, fixtures, test writing, and tools while retaining the depth and structure you requested. I’ll assume you’re using **SQLAlchemy’s async engine** (e.g., `AsyncSession`) and an async-compatible PostgreSQL driver like `asyncpg`.

---

# Advanced Pytest Notes for FastAPI Async APIs

## 1. Introduction to Testing Async FastAPI APIs
FastAPI supports async endpoints natively with Python’s `async`/`await` syntax, which is ideal for I/O-bound operations like database queries or external API calls. Testing async APIs requires pytest with async support (`pytest-asyncio`), an async test client (e.g., `httpx.AsyncClient`), and adjustments to SQLAlchemy for async sessions. This guide adapts the previous sync-focused notes for your async FastAPI app with a multi-tenant architecture.

---

## 2. Project Structure
The structure remains largely the same as for sync APIs, with minor adjustments for async-specific files:

```
my_fastapi_app/
│
├── app/                    # Core application logic
│   ├── __init__.py
│   ├── main.py           # FastAPI app instantiation
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── crud/             # Async CRUD operations
│   ├── db/               # Async database engine, session factory
│   ├── routes/           # Async API routes
│   └── middleware/       # Async middleware (e.g., tenant resolution)
│
├── tests/                 # Test suite
│   ├── __init__.py
│   ├── conftest.py       # Async fixtures (DB, client)
│   ├── test_models/      # Model tests
│   ├── test_crud/        # Async CRUD tests
│   ├── test_routes/      # Async route tests
│   ├── test_db/          # Async DB interaction tests
│   └── utils/            # Test helpers
│
├── pytest.ini             # Pytest configuration with async support
├── .env                   # Environment variables
└── README.md
```

- **Key Difference**: The `crud/`, `db/`, and `routes/` modules now use async functions.

---

## 3. Pytest Configuration for Async
### 3.1. `pytest.ini`
Enable async testing with `pytest-asyncio`:

```ini
[pytest]
python_files = test_*.py
python_classes = Test*
python_functions = test_*
asyncio_mode = auto           ; Enable async support
markers =
    unit: Unit tests
    integration: Integration tests
    multi_tenant: Multi-tenant tests
addopts =
    -v
    --cov=app
    --cov-report=html
    --cov-fail-under=80
env =
    TEST_DATABASE_URL=postgresql+asyncpg://test_user:test_pass@localhost:5432/test_db
    ENV=test
```

- **`asyncio_mode = auto`**: Automatically detects and runs async tests.
- **`TEST_DATABASE_URL`**: Uses `asyncpg` (async PostgreSQL driver) instead of `psycopg2`.

### 3.2. Dependencies
Install async-specific packages:
```bash
pip install pytest pytest-asyncio pytest-cov httpx sqlalchemy[asyncio] asyncpg fastapi python-dotenv pytest-mock
```
- `pytest-asyncio`: Enables async test functions.
- `httpx`: Provides `AsyncClient` for async HTTP requests.
- `sqlalchemy[asyncio]`: Async SQLAlchemy support.
- `asyncpg`: Async PostgreSQL driver.

---

## 4. Advanced Async Fixtures in `conftest.py`
Async APIs require async fixtures for the database, session, and client.

### Example `conftest.py`
```python
import os
import pytest
from fastapi.testclient import TestClient  # For sync fallback if needed
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.main import app
from app.db import get_db, Base  # Async dependency and base model

# Async test DB URL
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")

@pytest.fixture(scope="session")
async def test_engine():
    """Async engine for test database."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)  # Create tables
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)  # Cleanup
    await engine.dispose()

@pytest.fixture(scope="function")
async def test_db(test_engine):
    """Async session with rollback."""
    AsyncSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)
    async with AsyncSessionLocal() as db:
        yield db
        await db.rollback()  # Undo changes

@pytest.fixture(scope="function")
async def client(test_db):
    """Async HTTP client with overridden DB dependency."""
    async def override_get_db():
        try:
            yield test_db
        finally:
            await test_db.rollback()

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def tenant_headers():
    """Tenant-specific headers."""
    return {"X-Tenant-ID": "tenant1"}
```

- **Key Changes:**
  - **`create_async_engine`**: Async SQLAlchemy engine.
  - **`AsyncSession`**: Async session for database operations.
  - **`AsyncClient`**: Async HTTP client from `httpx`.
  - **`async with`**: Ensures proper async context management.

---

## 5. Writing Advanced Async Tests
### 5.1. Unit Tests
Unit tests for async CRUD logic use mocks, with async-aware testing.

#### Example: Testing Async CRUD
```python
# app/crud/user.py
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User

async def create_user(db: AsyncSession, name: str, tenant_id: str):
    user = User(name=name, tenant_id=tenant_id)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

# tests/test_crud/test_user.py
import pytest
from app.crud.user import create_user
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_create_user():
    db_mock = AsyncMock(spec=AsyncSession)
    user = await create_user(db_mock, name="John Doe", tenant_id="tenant1")
    
    assert user.name == "John Doe"
    assert user.tenant_id == "tenant1"
    db_mock.add.assert_called_once_with(user)
    await db_mock.commit.assert_awaited_once()
    await db_mock.refresh.assert_awaited_once_with(user)
```

- **`@pytest.mark.asyncio`**: Marks the test as async.
- **`AsyncMock`**: Mocks async methods (e.g., `commit`, `refresh`).

### 5.2. Integration Tests
Integration tests hit async endpoints with a real database.

#### Example: Testing an Async Route
```python
# app/routes/user.py
from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.user import create_user
from app.db import get_db

router = APIRouter()

@router.post("/users/")
async def create_user_route(name: str, tenant_id: str = Header(...), db: AsyncSession = Depends(get_db)):
    return await create_user(db, name, tenant_id)

# tests/test_routes/test_user.py
import pytest

@pytest.mark.asyncio
async def test_create_user_route(client, tenant_headers):
    payload = {"name": "Jane Doe"}
    response = await client.post("/users/", json=payload, headers=tenant_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Jane Doe"
    assert data["tenant_id"] == "tenant1"
```

- **`await client.post`**: Async HTTP request.

### 5.3. Multi-Tenant Testing
Test tenant isolation with async endpoints.

#### Example:
```python
@pytest.mark.asyncio
@pytest.mark.multi_tenant
async def test_tenant_isolation(client):
    headers1 = {"X-Tenant-ID": "tenant1"}
    headers2 = {"X-Tenant-ID": "tenant2"}
    
    await client.post("/users/", json={"name": "User1"}, headers=headers1)
    await client.post("/users/", json={"name": "User2"}, headers=headers2)
    
    resp1 = (await client.get("/users/", headers=headers1)).json()
    resp2 = (await client.get("/users/", headers=headers2)).json()
    
    assert len(resp1) == 1 and resp1[0]["name"] == "User1"
    assert len(resp2) == 1 and resp2[0]["name"] == "User2"
```

- **Advanced Tip**: Use async schema switching for tenant-specific DBs.

---

## 6. Advanced Async Testing Tools
### 6.1. `patch` and `monkeypatch` with Async
- **`patch`**: Works with `AsyncMock` for async functions.

#### Example:
```python
from unittest.mock import patch

@pytest.mark.asyncio
async def test_patched_service(client):
    with patch("app.crud.user.external_api_call", new_callable=AsyncMock, return_value={"status": "mocked"}):
        response = await client.get("/some-endpoint/")
        assert response.json()["status"] == "mocked"
```

### 6.2. `AsyncMock`
- Mocks async methods explicitly.

#### Example:
```python
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_asyncmock_db():
    db = AsyncMock()
    db.query().filter().first.return_value = {"id": 1}
    result = await some_async_function(db)
    assert result["id"] == 1
```

### 6.3. `asyncio.gather` for Race Conditions
Test concurrency with async tasks.

#### Example:
```python
import asyncio

@pytest.mark.asyncio
async def test_race_condition(client, tenant_headers):
    async def create_user():
        return await client.post("/users/", json={"name": "RaceUser"}, headers=tenant_headers)
    
    tasks = [create_user() for _ in range(10)]
    results = await asyncio.gather(*tasks)
    
    assert all(r.status_code == 200 for r in results)
    users = (await client.get("/users/", headers=tenant_headers)).json()
    assert len(users) == 10
```

- **`asyncio.gather`**: Runs tasks concurrently, replacing `concurrent.futures`.

---

## 7. Best Practices for Async APIs
1. **Isolation**: Use async session rollback for test independence.
2. **Mocking**: Mock async I/O (e.g., DB, APIs) in unit tests.
3. **Concurrency**: Test race conditions with `asyncio.gather`.
4. **Timeouts**: Use `pytest-timeout` to catch hanging async calls.
5. **Coverage**: Ensure async paths are covered.

---

## 8. Common Async Scenarios
- **Authentication**: Mock async token validation.
- **DB Failures**: Use `AsyncMock` to simulate async errors.
- **Tenant Logic**: Test async middleware with multiple tenants.
- **Performance**: Use `pytest-asyncio` with `asyncio.sleep` for latency tests.

---

## 9. Learning Path for Async Testing
1. **Basics**: Test async routes with `AsyncClient`.
2. **Database**: Master async SQLAlchemy fixtures.
3. **Mocking**: Use `AsyncMock` and `patch` for async dependencies.
4. **Concurrency**: Experiment with `asyncio.gather`.
5. **Optimization**: Refine based on coverage and performance.

---

## Key Differences from Sync APIs
- **Engine**: `create_async_engine` vs. `create_engine`.
- **Session**: `AsyncSession` vs. sync `Session`.
- **Client**: `httpx.AsyncClient` vs. `TestClient`.
- **Tests**: `@pytest.mark.asyncio` and `await` everywhere.
- **Concurrency**: `asyncio.gather` vs. `concurrent.futures`.

This guide provides a comprehensive, advanced framework for testing async FastAPI APIs. Start with simple async route tests, then build up to complex scenarios like race conditions and tenant isolation. Let me know if you need more examples or clarifications!

For **async APIs** in a FastAPI application, the testing approach changes slightly because FastAPI supports asynchronous endpoints using `async def`, and you’ll need to adapt your tools and techniques to handle asynchronous code effectively. Since your app uses Python, FastAPI, SQLAlchemy, PostgreSQL, and a multi-tenant architecture, I’ll rewrite the previous testing sections (Unit Tests, Integration Tests, Mocking/Patching, and Concurrency Testing) to focus on **async APIs**. I’ll assume you’re using an async SQLAlchemy setup (e.g., `AsyncSession`) with an async PostgreSQL driver like `asyncpg`. Below, I’ll provide updated explanations and examples tailored for async APIs.

---

# Writing Tests for Async FastAPI Applications

## Prerequisites for Async Testing
- **Async Database**: Use `asyncpg` with SQLAlchemy’s async support (`sqlalchemy.ext.asyncio`).
- **Async Client**: Use `httpx.AsyncClient` instead of `TestClient` for async HTTP requests.
- **Pytest Async Support**: Enable async testing with `pytest-asyncio`.

### Setup
1. Install dependencies:
   ```bash
   pip install pytest pytest-asyncio httpx asyncpg sqlalchemy[asyncio]
   ```
2. Update `pytest.ini` to enable async:
   ```ini
   [pytest]
   asyncio_mode = auto
   ```

3. Use an async database URL (e.g., `postgresql+asyncpg://user:password@localhost:5432/test_db`).

---

## 5. Unit Tests for Async APIs
### Purpose
Test individual async components (e.g., CRUD functions, utilities) in isolation, mocking async dependencies.

### Tools
- **`pytest-asyncio`**: Runs async test functions.
- **`unittest.mock` with `AsyncMock`**: Mocks async functions (Python 3.8+).
- **`patch`**: Patches async dependencies.

### Examples
#### Example 1: Testing an Async Utility Function
```python
# app/utils.py
async def fetch_user_data(user_id: int):
    from app.crud.user import get_user_async  # Async dependency
    user = await get_user_async(user_id)
    return user.name

# tests/test_utils/test_utils.py
import pytest
from unittest.mock import AsyncMock, patch
from app.utils import fetch_user_data

@pytest.mark.asyncio
async def test_fetch_user_data():
    with patch("app.utils.get_user_async", new_callable=AsyncMock) as mock_get_user:
        mock_get_user.return_value = MagicMock(name="John Doe")
        result = await fetch_user_data(user_id=1)
        assert result == "John Doe"
        mock_get_user.assert_awaited_once_with(1)
```
- **Explanation**: Uses `AsyncMock` to mock an async dependency and tests the async utility.

#### Example 2: Testing an Async CRUD Function
```python
# app/crud/user.py
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User

async def create_user_async(db: AsyncSession, name: str, tenant_id: str):
    user = User(name=name, tenant_id=tenant_id)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

# tests/test_crud/test_user.py
import pytest
from unittest.mock import AsyncMock
from app.crud.user import create_user_async

@pytest.mark.asyncio
async def test_create_user_async():
    db_mock = AsyncMock()
    user = await create_user_async(db_mock, name="Alice", tenant_id="tenant1")
    
    assert user.name == "Alice"
    assert user.tenant_id == "tenant1"
    db_mock.commit.assert_awaited_once()
    db_mock.refresh.assert_awaited_once_with(user)
```
- **Explanation**: Mocks an `AsyncSession` to test async DB operations.

#### Example 3: Testing Async Tenant Validation
```python
# app/utils.py
async def validate_tenant_async(tenant_id: str):
    from app.db import get_tenant_async  # Async dependency
    tenant = await get_tenant_async(tenant_id)
    if not tenant:
        raise ValueError("Invalid tenant")
    return tenant.id

# tests/test_utils/test_utils.py
import pytest
from unittest.mock import AsyncMock, patch
from app.utils import validate_tenant_async

@pytest.mark.asyncio
async def test_validate_tenant_async_invalid():
    with patch("app.utils.get_tenant_async", new_callable=AsyncMock) as mock_get_tenant:
        mock_get_tenant.return_value = None
        with pytest.raises(ValueError, match="Invalid tenant"):
            await validate_tenant_async("tenantX")
        mock_get_tenant.assert_awaited_once_with("tenantX")
```
- **Explanation**: Tests async error handling with a mocked async dependency.

---

## 6. Integration Tests for Async APIs
### Purpose
Verify interactions between async API routes, async database sessions, and middleware.

### Tools
- **`httpx.AsyncClient`**: Makes async HTTP requests to FastAPI.
- **`pytest-asyncio`**: Runs async test cases.
- **Async Fixtures**: Set up async DB sessions.

### Updated `conftest.py` for Async
```python
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.main import app
from app.db import get_db, Base

TEST_DATABASE_URL = "postgresql+asyncpg://test_user:test_pass@localhost:5432/test_db"

@pytest.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest.fixture(scope="function")
async def test_db(test_engine):
    async_session = AsyncSession(test_engine, expire_on_commit=False)
    yield async_session
    await async_session.rollback()
    await async_session.close()

@pytest.fixture(scope="function")
async def client(test_db):
    async def override_get_db():
        yield test_db
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
```

### Examples
#### Example 1: Testing an Async API Route
```python
# app/routes/user.py
from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.user import create_user_async
from app.db import get_db

router = APIRouter()

@router.post("/users/")
async def create_user_route(name: str, tenant_id: str = Header(...), db: AsyncSession = Depends(get_db)):
    return await create_user_async(db, name, tenant_id)

# tests/test_routes/test_user.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_user_route(client: AsyncClient, tenant_headers):
    payload = {"name": "Bob"}
    response = await client.post("/users/", json=payload, headers=tenant_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Bob"
    assert data["tenant_id"] == "tenant1"
```
- **Explanation**: Uses `AsyncClient` to test an async route with a real async DB.

#### Example 2: Testing an Async Protected Route
```python
# app/routes/user.py
from fastapi import Depends, Header
from app.auth import get_current_user_async

@router.get("/users/")
async def get_all_users(api_key: str = Header(...), user=Depends(get_current_user_async)):
    return [{"id": 1, "name": "Test User"}]

# tests/test_routes/test_user.py
import pytest

@pytest.mark.asyncio
async def test_get_all_users(client: AsyncClient, vendor_login):
    headers = {"api-key": "valid_key"}
    response = await client.get("/users/", headers=headers, cookies=vendor_login["cookies"])
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert response.json()[0]["name"] == "Test User"
```
- **Explanation**: Tests an async authenticated route with cookies.

#### Example 3: Testing Async Multi-Tenant Retrieval
```python
# app/routes/user.py
@router.get("/users/")
async def get_users(tenant_id: str = Header(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.tenant_id == tenant_id))
    return result.scalars().all()

# tests/test_routes/test_user.py
import pytest

@pytest.mark.asyncio
async def test_get_users_by_tenant(client: AsyncClient):
    await client.post("/users/", json={"name": "User1"}, headers={"X-Tenant-ID": "tenant1"})
    await client.post("/users/", json={"name": "User2"}, headers={"X-Tenant-ID": "tenant2"})
    
    response = await client.get("/users/", headers={"X-Tenant-ID": "tenant1"})
    assert response.status_code == 200
    users = response.json()
    assert len(users) == 1
    assert users[0]["name"] == "User1"
```
- **Explanation**: Verifies async tenant isolation.

---

## 7. Mocking and Patching for Async APIs
### Purpose
Simulate async dependencies (e.g., DB errors, external APIs) in async tests.

### Tools
- **`AsyncMock`**: Mocks async functions (Python 3.8+).
- **`patch`**: Patches async dependencies.

### Examples
#### Example 1: Simulating an Async Database Error
```python
# app/routes/user.py
@router.get("/users/")
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()

# tests/test_routes/test_user.py
import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_database_error(client: AsyncClient):
    with patch("app.routes.user.get_db", new_callable=AsyncMock) as mock_get_db:
        mock_db = AsyncMock()
        mock_db.execute.side_effect = Exception("Database error")
        mock_get_db.return_value = mock_db
        
        response = await client.get("/users/")
        assert response.status_code == 500
        assert "Database error" in response.text
```
- **Explanation**: Mocks an async DB failure.

#### Example 2: Mocking an Async External API
```python
# app/utils.py
import aiohttp
async def fetch_external_data_async():
    async with aiohttp.ClientSession() as session:
        async with session.get("https://api.example.com/data") as resp:
            return await resp.json()

# tests/test_utils/test_utils.py
import pytest
from unittest.mock import AsyncMock, patch
from app.utils import fetch_external_data_async

@pytest.mark.asyncio
async def test_fetch_external_data_async():
    with patch("app.utils.aiohttp.ClientSession.get", new_callable=AsyncMock) as mock_get:
        mock_response = AsyncMock()
        mock_response.json.return_value = {"key": "value"}
        mock_get.return_value.__aenter__.return_value = mock_response
        result = await fetch_external_data_async()
        assert result == {"key": "value"}
```
- **Explanation**: Mocks an async HTTP request with `aiohttp`.

#### Example 3: Simulating Missing Data in Async CRUD
```python
# app/crud/user.py
async def get_user_async(db: AsyncSession, user_id: int):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("User not found")
    return user

# tests/test_crud/test_user.py
import pytest
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_get_user_async_not_found():
    db_mock = AsyncMock()
    db_mock.execute.return_value.scalar_one_or_none.return_value = None
    
    with pytest.raises(ValueError, match="User not found"):
        await get_user_async(db_mock, user_id=999)
```
- **Explanation**: Tests async error handling with a mock DB.

---

## 8. Concurrency Testing for Async APIs
### Purpose
Test race conditions and concurrent access in async endpoints.

### Tools
- **`asyncio.gather`**: Runs multiple async tasks concurrently (preferred over `concurrent.futures` for async).
- **`concurrent.futures`**: Still usable for thread-based concurrency if needed.

### Examples
#### Example 1: Testing Concurrent Async User Creation
```python
# tests/test_routes/test_user.py
import pytest
import asyncio

@pytest.mark.asyncio
async def test_concurrent_user_creation(client: AsyncClient, tenant_headers):
    async def create_user(i):
        return await client.post("/users/", json={"name": f"User{i}"}, headers=tenant_headers)
    
    tasks = [create_user(i) for i in range(10)]
    results = await asyncio.gather(*tasks)
    
    assert all(r.status_code == 200 for r in results)
    users = (await client.get("/users/", headers=tenant_headers)).json()
    assert len(users) == 10
```
- **Explanation**: Uses `asyncio.gather` to run async requests concurrently.

#### Example 2: Testing Async Resource Contention
```python
# app/routes/counter.py
from fastapi import APIRouter
router = APIRouter()
counter = 0

@router.post("/increment/")
async def increment_counter():
    global counter
    temp = counter
    await asyncio.sleep(0.01)  # Simulate async delay
    temp += 1
    counter = temp
    return {"counter": counter}

# tests/test_routes/test_counter.py
import pytest
import asyncio

@pytest.mark.asyncio
async def test_concurrent_counter(client: AsyncClient):
    async def increment():
        return await client.post("/increment/")
    
    tasks = [increment() for _ in range(100)]
    results = await asyncio.gather(*tasks)
    
    final_count = (await client.post("/increment/")).json()["counter"]
    assert final_count == 101  # May fail without proper locking
```
- **Explanation**: Tests an async counter for race conditions.

#### Example 3: Testing Async Multi-Tenant Concurrency
```python
# tests/test_routes/test_user.py
import pytest
import asyncio

@pytest.mark.asyncio
async def test_concurrent_multi_tenant(client: AsyncClient):
    headers1 = {"X-Tenant-ID": "tenant1"}
    headers2 = {"X-Tenant-ID": "tenant2"}
    
    async def create_user(headers):
        return await client.post("/users/", json={"name": "ConcurrentUser"}, headers=headers)
    
    tasks = [create_user(headers1), create_user(headers1), create_user(headers2), create_user(headers2)]
    results = await asyncio.gather(*tasks)
    
    assert all(r.status_code == 200 for r in results)
    assert len((await client.get("/users/", headers=headers1)).json()) == 2
    assert len((await client.get("/users/", headers=headers2)).json()) == 2
```
- **Explanation**: Ensures tenant isolation under async concurrent access.

---

## Key Differences from Sync APIs
1. **Async Functions**: Use `async def` and `await` in routes and tests.
2. **Client**: Replace `TestClient` with `httpx.AsyncClient`.
3. **Database**: Use `AsyncSession` and `asyncpg` instead of sync sessions.
4. **Concurrency**: Prefer `asyncio.gather` over `concurrent.futures` for async tasks.
5. **Mocking**: Use `AsyncMock` for async dependencies.

These examples adapt your sync testing approach to async APIs, leveraging Python’s async ecosystem. Test them in your environment, and let me know if you need further adjustments!