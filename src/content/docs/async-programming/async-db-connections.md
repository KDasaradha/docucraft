---
title: Async Database Connections
---

# Asynchronous Database Connections

**Original Description**: Connecting to databases asynchronously using libraries like `asyncpg` for PostgreSQL or `aiomysql` for MySQL.

When building asynchronous applications, especially web servers like those using FastAPI, it's crucial that database interactions are also asynchronous to avoid blocking the event loop. Blocking database calls in an async application would negate the benefits of asynchronicity, leading to poor performance and responsiveness under load.

Libraries like `asyncpg` (for PostgreSQL) and `aiomysql` (for MySQL/MariaDB) provide Python DBAPI-compatible interfaces that work with `asyncio`, allowing you to `await` database operations. SQLAlchemy also supports `asyncio` through its `AsyncEngine` and `AsyncSession` when used with these async drivers.

**Key Concepts:**

1.  **Async DBAPI Driver**: You need a database driver specifically designed for asynchronous operations with `asyncio`.
    *   **PostgreSQL**: `asyncpg` is the most popular and highly performant choice.
    *   **MySQL/MariaDB**: `aiomysql` (built on PyMySQL) or `asyncmy` (a newer, potentially faster alternative).
    *   **SQLite**: `aiosqlite` provides an async interface for SQLite.

2.  **Async Connection Pool**: Just like synchronous applications benefit from connection pooling, async applications do too. Async drivers often provide their own connection pooling mechanisms.
    *   `asyncpg`: `asyncpg.create_pool()`
    *   `aiomysql`: `aiomysql.create_pool()`

3.  **`async` and `await`**: All database operations that involve I/O (connecting, executing queries, fetching results) must be `await`ed.

**Example using `asyncpg` (PostgreSQL Direct Driver Usage):**

First, install `asyncpg`: `pip install asyncpg`

```python
import asyncio
import asyncpg # PostgreSQL async driver

DATABASE_URL = "postgresql://user:password@host:port/database" 

async def fetch_users_direct():
    # Create a connection pool
    # In a real app, you'd create the pool once at startup and reuse it.
    pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=10)
    
    try:
        # Acquire a connection from the pool
        async with pool.acquire() as conn:
            # Execute a query
            rows = await conn.fetch("SELECT id, username, email FROM users WHERE is_active = $1 LIMIT $2", True, 5)
            
            users = []
            for row in rows:
                users.append(dict(row)) # Convert Record object to dict
            return users
    except Exception as e:
        print(f"Database error: {e}")
        return []
    finally:
        if pool:
            await pool.close() # Close the pool when done (e.g., on app shutdown)


async def insert_user_direct(username: str, email: str):
    pool = await asyncpg.create_pool(DATABASE_URL)
    try:
        async with pool.acquire() as conn:
            # For operations that don't return rows, use execute
            result = await conn.execute(
                "INSERT INTO users (username, email, hashed_password, is_active) VALUES ($1, $2, $3, $4) RETURNING id",
                username, email, "some_hashed_password", True
            )
            # 'RETURNING id' makes execute return the ID, parse result for it.
            # The result format depends on the driver and command.
            # For asyncpg execute returning values:
            if result:
                 # "INSERT 0 1" means 1 row inserted. If RETURNING, it's different.
                 # For RETURNING, you might need to parse `result` string or use fetchval for single value.
                inserted_id = await conn.fetchval(
                    "INSERT INTO users (username, email, hashed_password, is_active) VALUES ($1, $2, $3, $4) RETURNING id",
                    username + "_v2", email + "_v2", "hashed_v2", True
                ) # Example re-inserting to get ID
                return inserted_id
            return None # Or handle failure
    except Exception as e:
        print(f"Database error on insert: {e}")
        return None
    finally:
        if pool:
            await pool.close()


async def main_direct():
    # print("Inserting new user...")
    # new_user_id = await insert_user_direct("async_user_direct", "direct@example.com")
    # if new_user_id:
    #    print(f"Inserted user with ID: {new_user_id}")
        
    print("\nFetching users directly with asyncpg...")
    users = await fetch_users_direct()
    if users:
        for user in users:
            print(user)
    else:
        print("No users found or error occurred.")

if __name__ == "__main__":
    # Create dummy users table for asyncpg example if it doesn't exist
    # import psycopg2
    # try:
    #     conn_sync = psycopg2.connect(DATABASE_URL.replace("postgresql", "psycopg2")) # Use sync for setup
    #     cur = conn_sync.cursor()
    #     cur.execute("""
    #         CREATE TABLE IF NOT EXISTS users (
    #             id SERIAL PRIMARY KEY,
    #             username VARCHAR(50) UNIQUE NOT NULL,
    #             email VARCHAR(100) UNIQUE NOT NULL,
    #             hashed_password VARCHAR(255) NOT NULL,
    #             is_active BOOLEAN DEFAULT TRUE,
    #             registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    #         );
    #     """)
    #     cur.execute("INSERT INTO users (username, email, hashed_password) VALUES (%s, %s, %s) ON CONFLICT (username) DO NOTHING;",
    #                 ('test_async_user1', 'test_async1@example.com', 'hashed'))
    #     cur.execute("INSERT INTO users (username, email, hashed_password) VALUES (%s, %s, %s) ON CONFLICT (username) DO NOTHING;",
    #                 ('test_async_user2', 'test_async2@example.com', 'hashed'))
    #     conn_sync.commit()
    #     cur.close()
    #     conn_sync.close()
    # except Exception as e:
    #     print(f"Initial DB setup error: {e}")
        
    asyncio.run(main_direct())
```

**Using Asynchronous SQLAlchemy (SQLAlchemy 1.4+ / 2.0):**

SQLAlchemy provides an `asyncio` extension that allows its ORM and Core components to work with async DBAPI drivers.

First, install SQLAlchemy (if not already) and the async driver:
`pip install sqlalchemy asyncpg` (for PostgreSQL)
`pip install sqlalchemy "aiomysql" ` (for MySQL)

```python
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, Boolean, select, text

ASYNC_DATABASE_URL = "postgresql+asyncpg://user:password@host:port/database"
# For MySQL: "mysql+aiomysql://user:password@host:port/database"
# For SQLite (async): "sqlite+aiosqlite:///./test_async_sqlalchemy.db"

# Create an async engine
# In a real app, do this once at startup.
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=False) # echo=True for SQL logging

# Create a base for declarative models
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"

# AsyncSession factory
# expire_on_commit=False is often recommended for web apps to access objects after commit
AsyncSessionLocal = sessionmaker(
    bind=async_engine, class_=AsyncSession, expire_on_commit=False
)

async def create_tables():
    async with async_engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all) # Optional: drop tables
        await conn.run_sync(Base.metadata.create_all)

async def add_user_sqlalchemy(username: str, email: str):
    async with AsyncSessionLocal() as session: # Create an async session
        async with session.begin(): # Start a transaction (optional, can commit explicitly)
            new_user = User(username=username, email=email, hashed_password="some_hash")
            session.add(new_user)
            # await session.commit() # Commit if not using session.begin()
        # The user is committed when the 'async with session.begin()' block exits
        # Or after await session.commit()
        await session.refresh(new_user) # To get DB-generated values like ID
        return new_user

async def get_active_users_sqlalchemy():
    async with AsyncSessionLocal() as session:
        stmt = select(User).where(User.is_active == True).limit(5)
        result = await session.execute(stmt)
        users = result.scalars().all() # Get User ORM objects
        return users

async def main_sqlalchemy():
    await create_tables() # Ensure tables exist
    
    print("Adding user with SQLAlchemy...")
    added_user = await add_user_sqlalchemy("async_sqla_user", "sqla@example.com")
    if added_user:
        print(f"Added user: {added_user}")

    print("\nFetching active users with SQLAlchemy...")
    active_users = await get_active_users_sqlalchemy()
    if active_users:
        for user in active_users:
            print(user)
    else:
        print("No active users found.")
    
    # Important: Dispose of the engine when the application shuts down
    await async_engine.dispose()

if __name__ == "__main__":
    asyncio.run(main_sqlalchemy())
```

**Key points for Asynchronous SQLAlchemy:**
*   **Async Engine**: Use `create_async_engine`. The connection URL must specify the async driver (e.g., `postgresql+asyncpg`).
*   **AsyncSession**: Use `sqlalchemy.ext.asyncio.AsyncSession`.
*   **`async with AsyncSessionLocal() as session:`**: This is the standard pattern for getting and managing an async session.
*   **`await session.execute(...)`**: Queries are executed asynchronously.
*   **`await session.commit()`**: Committing transactions is an async operation.
*   **`await session.refresh(...)`**, **`await session.flush(...)`**: These are also async.
*   **`await conn.run_sync(...)`**: For running synchronous SQLAlchemy DDL operations (like `Base.metadata.create_all`) within an async context.

**Integration with FastAPI:**

When using async SQLAlchemy with FastAPI, you'd create an `AsyncSessionLocal` factory and provide sessions via an async dependency:

```python
# database.py (for FastAPI with async SQLAlchemy)
# ... (engine, Base, AsyncSessionLocal definitions as above) ...

async def get_async_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit() # Optional: commit at the end of successful request
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close() # Though context manager usually handles this

# main.py (FastAPI endpoint)
# from fastapi import Depends
# from sqlalchemy.ext.asyncio import AsyncSession

# @app.post("/users_async/", response_model=UserSchema) # Assuming UserSchema Pydantic model
# async def create_user_endpoint(user_data: UserCreateSchema, db: AsyncSession = Depends(get_async_db)):
#     new_user = User(username=user_data.username, ...)
#     db.add(new_user)
#     # await db.commit() # Or commit in the dependency
#     # await db.refresh(new_user)
#     return new_user
```
(Note: Committing within the dependency `get_async_db` after `yield` is a common pattern to ensure the transaction scope covers the entire request, but explicit commits in the endpoint after successful operations are also fine.)

By using async database drivers and SQLAlchemy's asyncio extension, your FastAPI application can perform database operations without blocking the event loop, maintaining high concurrency and responsiveness.

    