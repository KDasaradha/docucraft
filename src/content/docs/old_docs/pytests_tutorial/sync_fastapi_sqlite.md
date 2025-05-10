---
title: SQLite Sync
description: Placeholder content for SQLite Sync.
order: 2
---

# SQLite Sync

Here’s a detailed guide on how to write **Pytest tests for FastAPI routes** using **SQLite as a test database** in synchronous mode.

---

## **1. Install Required Packages**
Before running tests, make sure you have installed `pytest` and `httpx` (to test FastAPI routes):

```bash
pip install pytest httpx
```

---

## **2. Create a Simple FastAPI Application**
Let’s create a **FastAPI app with synchronous SQLite database**.

### **File: `main.py`**
```python
from fastapi import FastAPI, HTTPException, Depends
import sqlite3

app = FastAPI()

# Database connection function
def get_db():
    conn = sqlite3.connect("test.db")
    conn.row_factory = sqlite3.Row
    return conn

# Create a table (Run this once before testing)
def create_table():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )
    """)
    conn.commit()
    conn.close()

create_table()  # Ensure table exists

@app.post("/users/")
def create_user(name: str, db=Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("INSERT INTO users (name) VALUES (?)", (name,))
    db.commit()
    return {"id": cursor.lastrowid, "name": name}

@app.get("/users/{user_id}")
def get_user(user_id: int, db=Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user["id"], "name": user["name"]}
```

---

## **3. Writing Pytest for FastAPI Routes**
Now, let’s create a test file to test the FastAPI routes.

### **File: `test_main.py`**
```python
import pytest
from fastapi.testclient import TestClient
from main import app, get_db
import sqlite3

# Create a test client
client = TestClient(app)

# Override dependency to use an in-memory SQLite database for testing
def override_get_db():
    conn = sqlite3.connect(":memory:")  # Use in-memory database
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )
    """)
    conn.commit()
    return conn

# Apply dependency override
app.dependency_overrides[get_db] = override_get_db

def test_create_user():
    response = client.post("/users/", json={"name": "John Doe"})
    assert response.status_code == 200
    assert response.json()["name"] == "John Doe"

def test_get_user():
    # First, create a user
    response = client.post("/users/", json={"name": "Alice"})
    assert response.status_code == 200
    user_id = response.json()["id"]

    # Now, fetch the user
    response = client.get(f"/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Alice"

def test_get_user_not_found():
    response = client.get("/users/999")
    assert response.status_code == 404
    assert response.json() == {"detail": "User not found"}
```

---

## **4. Running the Tests**
Run all tests using:

```bash
pytest -v
```

Run a specific test:

```bash
pytest test_main.py::test_create_user
```

---

## **5. Explanation**
- **Test Client (`TestClient`)**: This simulates HTTP requests without needing a running server.
- **SQLite In-Memory DB**: The test database runs in memory (`":memory:"`), ensuring a fresh DB for each test.
- **Dependency Override (`app.dependency_overrides`)**: It replaces the actual database with the test in-memory DB.

This approach ensures **FastAPI routes** are tested with a clean, isolated environment. 🚀