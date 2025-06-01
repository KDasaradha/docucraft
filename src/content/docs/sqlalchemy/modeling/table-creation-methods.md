---
title: 3.5 Table Creation Methods
description: Different methods for creating database tables with SQLAlchemy, including declarative mapping and Core Table objects.
order: 5
---

# 3.5 Table Creation Methods

SQLAlchemy provides multiple ways to define and create database tables. The two primary approaches are using the ORM's Declarative system and using SQLAlchemy Core's `Table` objects directly.

## 1. Declarative System (ORM)

This is the most common approach when using the ORM. You define Python classes that inherit from a declarative base (e.g., `DeclarativeBase` or one created by `declarative_base()`). SQLAlchemy maps these classes to database tables.

```python
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, sessionmaker, DeclarativeBase

DATABASE_URL = "sqlite:///./test_declarative.db"
engine = create_engine(DATABASE_URL)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users_declarative"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    
    # Example of a relationship
    # items = relationship("Item", back_populates="owner") 

# class Item(Base):
#     __tablename__ = "items_declarative"
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String, index=True)
#     owner_id = Column(Integer, ForeignKey("users_declarative.id"))
#     owner = relationship("User", back_populates="items")

# To create all tables defined that inherit from Base:
Base.metadata.create_all(bind=engine)
```
-   **`Base.metadata.create_all(bind=engine)`**: This command inspects all classes that inherit from `Base` and issues `CREATE TABLE` statements to the database connected via `engine` for any tables that do not already exist.

## 2. SQLAlchemy Core `Table` Objects

You can also define tables using SQLAlchemy Core's `Table` construct. This approach is closer to raw SQL and is often used when not fully utilizing the ORM or when integrating with existing database schemas.

```python
from sqlalchemy import create_engine, Table, Column, Integer, String, MetaData, ForeignKey

DATABASE_URL = "sqlite:///./test_core_table.db"
engine = create_engine(DATABASE_URL)
metadata_obj = MetaData() # A MetaData object is a container for Table objects

# Define a user table
user_table = Table(
    "users_core",
    metadata_obj,
    Column("id", Integer, primary_key=True, index=True),
    Column("name", String(50), index=True), # Specify length for String if needed
    Column("email", String, unique=True, index=True),
)

# Define an item table with a foreign key
# item_table = Table(
#     "items_core",
#     metadata_obj,
#     Column("id", Integer, primary_key=True, index=True),
#     Column("title", String),
#     Column("owner_id", Integer, ForeignKey("users_core.id"))
# )


# To create all tables associated with metadata_obj:
metadata_obj.create_all(bind=engine)
```
-   **`MetaData`**: A container object that keeps together many different features of a database (or multiple databases) being described.
-   **`Table(...)`**: Defines the structure of a table.
-   **`metadata_obj.create_all(bind=engine)`**: Creates all tables defined within this `MetaData` object.

## Choosing a Method

-   **Declarative System**: Generally preferred when using the SQLAlchemy ORM, as it integrates smoothly with mapping Python objects to database rows. It's more Pythonic and often easier to manage for complex object models.
-   **Core `Table` Objects**: Useful for scenarios where you need more direct control over SQL, working with existing databases without full ORM mapping, or for schema migration tools.

Both methods use the `MetaData` object (implicitly in Declarative, explicitly in Core) to group table definitions. The `create_all()` method is then used to issue the DDL to the database. For production applications, schema migrations are typically handled by tools like Alembic rather than `create_all()` directly in application code.

Placeholder content for "Table Creation Methods". This section will discuss various ways to define and create database tables using SQLAlchemy, such as the declarative system and Core `Table` objects.
