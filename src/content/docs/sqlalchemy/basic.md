---
title: SQLAlchemy - Basic
---

# SQLAlchemy - Basic Concepts

SQLAlchemy is a powerful SQL toolkit and Object Relational Mapper (ORM) for Python. It provides developers with the flexibility to work with databases at different levels of abstraction, from raw SQL-like expressions to high-level object-oriented interactions.

## Key Topics

### Introduction to SQLAlchemy: Core and ORM
SQLAlchemy consists of two main components:
- **SQLAlchemy Core**: Provides the SQL Expression Language, a Pythonic way to construct SQL queries and manage database schema. It's closer to raw SQL but offers database dialect abstraction and improved safety.
- **SQLAlchemy ORM (Object Relational Mapper)**: Builds upon the Core to map Python classes (models) to database tables and database rows to Python objects. This allows developers to interact with the database using object-oriented paradigms.

You can use either Core or ORM, or both, depending on your needs.

### Installation
Install SQLAlchemy using pip:
```bash
pip install sqlalchemy
# For specific database backends, you'll also need a DBAPI driver, e.g., for PostgreSQL:
# pip install psycopg2-binary
# For SQLite (often built-in with Python), no extra driver needed.
# For MySQL:
# pip install pymysql  # or mysqlclient
```

### Connecting to a Database (Engine, Connection URL)
The **Engine** is the starting point for any SQLAlchemy application. It establishes database connectivity using a **Connection URL**.
The URL format is typically: `dialect+driver://username:password@host:port/database`

```python
from sqlalchemy import create_engine

# SQLite (in-memory)
# engine = create_engine("sqlite:///:memory:") 

# SQLite (file-based)
# The connect_args are only for SQLite to allow multi-threaded access (like from FastAPI)
engine = create_engine("sqlite:///./my_database.db", connect_args={"check_same_thread": False})

# PostgreSQL (requires psycopg2 or asyncpg driver)
# engine_pg = create_engine("postgresql://user:password@localhost:5432/mydatabase")

# MySQL (requires pymysql or mysqlclient driver)
# engine_mysql = create_engine("mysql+pymysql://user:password@localhost:3306/mydatabase")

print("Engine created successfully.")
```

### SQLAlchemy Core

#### Defining Tables with `Table` metadata
In Core, you define table structures using the `Table` object, associated with a `MetaData` object.

```python
from sqlalchemy import MetaData, Table, Column, Integer, String, ForeignKey

metadata_obj = MetaData() # Collection of Table objects and their associated schema constructs

users_table = Table(
    "users_core", metadata_obj, # Table name and metadata object
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("name", String(50), nullable=False),
    Column("email", String(100), unique=True)
)

addresses_table = Table(
    "addresses_core", metadata_obj,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer, ForeignKey("users_core.id"), nullable=False),
    Column("email_address", String, nullable=False),
    Column("street", String)
)

# To create these tables in the database:
# metadata_obj.create_all(engine) 
# print("Tables created via Core.")
```

#### Basic SQL Expressions (select, insert, update, delete)
SQLAlchemy Core allows you to build SQL queries programmatically.

```python
from sqlalchemy import insert, select, update, delete

# Insert
stmt_insert = insert(users_table).values(name="John Core", email="john.core@example.com")

# Select
stmt_select = select(users_table).where(users_table.c.name == "John Core")
# users_table.c accesses columns of the table

# Update
stmt_update = (
    update(users_table)
    .where(users_table.c.email == "john.core@example.com")
    .values(name="John Core Updated")
)

# Delete
stmt_delete = delete(users_table).where(users_table.c.name == "NonExistent User")
```

#### Executing statements
You execute these statements using a `Connection` object obtained from the engine.

```python
# Example execution (should be run after metadata_obj.create_all(engine))
# with engine.connect() as connection:
#     # Insert
#     result_insert = connection.execute(stmt_insert)
#     connection.commit() # Important for DML statements
#     print(f"Inserted row ID (if available): {result_insert.inserted_primary_key}")

#     # Select
#     result_select = connection.execute(stmt_select)
#     for row in result_select:
#         print(f"Selected row: ID={row.id}, Name={row.name}, Email={row.email}")

#     # Update
#     connection.execute(stmt_update)
#     connection.commit()

#     # Delete (example, might not delete anything if condition doesn't match)
#     connection.execute(stmt_delete)
#     connection.commit()
```

#### Working with Results
Results from `connection.execute()` for `SELECT` statements are iterable and provide row-like objects where columns can be accessed by name or index.

### SQLAlchemy ORM

#### Declaring Mapped Classes (Declarative Base)
The Declarative system is the typical way to define ORM models. Classes inherit from a `Base` created by `declarative_base()`.

```python
from sqlalchemy.orm import declarative_base, sessionmaker, Session # Import Session for type hinting
from sqlalchemy import Column, Integer, String # Re-import for ORM model

Base = declarative_base() # Create the base for our ORM models

class UserORM(Base):
    __tablename__ = "users_orm" # Table name

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50))
    email = Column(String(100), unique=True, nullable=False)

    def __repr__(self):
        return f"<UserORM(id={self.id}, name='{self.name}')>"

# Create table in DB (if not exists)
# Base.metadata.create_all(bind=engine)
# print("ORM tables created.")
```

#### Defining Table Metadata in ORM
Table metadata (columns, types, constraints) is defined directly as class attributes using `Column` objects within the mapped class.

#### Creating a Session
The `Session` is the ORM's handle to the database. It's how you interact with ORM objects and persist them.
`sessionmaker` is a factory for creating `Session` objects.

```python
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# To get a session instance:
# db_session: Session = SessionLocal()
# ... use db_session ...
# db_session.close()
```

#### Basic CRUD Operations: Adding, Updating, Deleting Objects
- **Adding (Create)**: Create an instance of your model and add it to the session.
- **Updating (Update)**: Query an object, modify its attributes.
- **Deleting (Delete)**: Query an object and pass it to `session.delete()`.
- All changes are typically staged in the session and sent to the DB upon `session.commit()`.

#### Querying: Basic filtering (`filter_by`, `filter`), fetching all (`all()`), first (`first()`)
SQLAlchemy ORM provides a `Query` object (in older versions) or uses `select()` statements with ORM entities (in newer SQLAlchemy 2.0 style) for fetching data.

```python
# Example ORM operations (run after Base.metadata.create_all(engine))
# db: Session = SessionLocal() # Get a session

# try:
#     # Create
#     new_user_orm = UserORM(name="Alice ORM", email="alice.orm@example.com")
#     db.add(new_user_orm)
#     db.commit()
#     db.refresh(new_user_orm) # Get ID and other DB-generated values
#     print(f"Created ORM user: {new_user_orm}")

#     # Read (Query)
#     # SQLAlchemy 1.x style Query:
#     # user_queried = db.query(UserORM).filter(UserORM.email == "alice.orm@example.com").first()
#     # SQLAlchemy 2.0 style select:
#     stmt_select_orm = select(UserORM).where(UserORM.email == "alice.orm@example.com")
#     user_queried = db.execute(stmt_select_orm).scalars().first()

#     if user_queried:
#         print(f"Queried ORM user: {user_queried.name}")

#         # Update
#         user_queried.name = "Alice ORM Updated"
#         db.commit()
#         print(f"Updated ORM user name: {user_queried.name}")

#         # Delete
#         # db.delete(user_queried)
#         # db.commit()
#         # print(f"Deleted ORM user: {user_queried.name}")

#     all_orm_users_stmt = select(UserORM)
#     all_orm_users = db.execute(all_orm_users_stmt).scalars().all()
#     print(f"All ORM users: {all_orm_users}")

# except Exception as e:
#     db.rollback()
#     print(f"An error occurred with ORM operations: {e}")
# finally:
#     db.close()
```

SQLAlchemy offers a comprehensive way to interact with databases, allowing developers to choose the level of abstraction that best fits their needs, from writing SQL-like expressions with Core to working with Python objects via the ORM.
