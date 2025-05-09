---
title: 3.2 FastAPI with SQLAlchemy (Session Management)
description: Managing SQLAlchemy sessions effectively within a FastAPI application.
order: 2
---

# 3.2 FastAPI with SQLAlchemy (Session Management)

Integrating SQLAlchemy with FastAPI requires careful management of database sessions. A common pattern is to create a new session for each request and ensure it's closed after the request is processed, whether it succeeds or fails.

## Dependency for Session Management

FastAPI's dependency injection system is ideal for managing database sessions. You can create a dependency that provides a database session and ensures it's properly closed.

### Example: Session Dependency

```python
from fastapi import FastAPI, Depends
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = "sqlite:///./test.db" # Replace with your actual database URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define a simple model
class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, index=True)

Base.metadata.create_all(bind=engine) # Create tables

app = FastAPI()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/items/")
def create_item(name: str, description: str, db: Session = Depends(get_db)):
    db_item = Item(name=name, description=description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/items/{item_id}")
def read_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
```

### Explanation:
1.  **`DATABASE_URL`**: Configuration for your database connection.
2.  **`engine`**: The SQLAlchemy engine that manages database connections.
3.  **`SessionLocal`**: A factory for creating database sessions.
4.  **`Base`**: The declarative base for your ORM models.
5.  **`get_db` Dependency**:
    *   Creates a new `SessionLocal` instance (a database session).
    *   `yield db`: Provides this session to the path operation function.
    *   `finally: db.close()`: Ensures the session is closed after the request is handled, even if errors occur.
6.  **Path Operations**: Use `db: Session = Depends(get_db)` to inject the session into your endpoint functions.

This pattern ensures that each request gets its own isolated database session, which is a good practice for web applications to avoid issues with shared state or connection leaks.

Placeholder content for "FastAPI with SQLAlchemy (Session Management)". This section will detail strategies for managing SQLAlchemy database sessions within FastAPI applications, typically using the dependency injection system.
