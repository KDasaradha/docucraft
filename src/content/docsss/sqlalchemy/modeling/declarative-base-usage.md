---
title: 3.6 Utilizing Declarative Base Effectively
description: Best practices and advanced techniques for using SQLAlchemy's declarative base to define ORM models.
order: 6
---

# 3.6 Utilizing Declarative Base Effectively

SQLAlchemy's Declarative system provides a powerful way to define ORM mapped classes. The "declarative base" is a central part of this system. In modern SQLAlchemy (2.0+), you typically use `DeclarativeBase` as a superclass for your models. In older versions (1.x), `declarative_base()` function was used to create this base class.

## Basic Usage (SQLAlchemy 2.0+)

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user_account" # Standard SQLAlchemy way

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    fullname: Mapped[str | None] # Type annotation implies String, can be explicit

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, name={self.name!r}, fullname={self.fullname!r})"

```
-   `DeclarativeBase`: All your mapped classes should inherit from a common base class that is a subclass of `DeclarativeBase`.
-   `__tablename__`: Specifies the database table name.
-   `Mapped[...]` and `mapped_column(...)`: Modern type-annotated way to define columns, integrating with Mypy and other type checkers.

## Mixins for Reusable Columns/Logic

Mixins are a great way to share common columns or methods across multiple models without using traditional inheritance that would imply a shared table or joined-table inheritance.

```python
from sqlalchemy import create_engine, Column, Integer, DateTime, func
from sqlalchemy.orm import DeclarativeBase, sessionmaker

class Base(DeclarativeBase):
    pass

# Mixin for timestamp columns
class TimestampMixin:
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class MyTable(Base, TimestampMixin): # Inherit from Base and the Mixin
    __tablename__ = "my_table_with_timestamps"
    id = Column(Integer, primary_key=True)
    # ... other columns

# engine = create_engine("sqlite:///:memory:")
# Base.metadata.create_all(engine)
```
- The `TimestampMixin` adds `created_at` and `updated_at` columns to any model that includes it.

## Abstract Base Classes

If you want to define a common set of columns or methods for a group of models, but you don't want the base class itself to be mapped to a table, you can make it an abstract base class.

```python
class Asset(Base): # Assume Base is DeclarativeBase
    __abstract__ = True # This class will not be mapped to a table

    id = Column(Integer, primary_key=True)
    type = Column(String(50))
    __mapper_args__ = {
        'polymorphic_identity': 'asset', # For polymorphic loading
        'polymorphic_on': type
    }

class PhysicalAsset(Asset):
    __tablename__ = 'physical_assets'
    id = Column(Integer, ForeignKey('asset.id'), primary_key=True) # Using Asset's id
    location = Column(String(100))
    __mapper_args__ = {
        'polymorphic_identity': 'physical_asset',
    }
```
- `__abstract__ = True`: Prevents SQLAlchemy from creating a table for `Asset`.
- This is useful for implementing table-per-subclass inheritance patterns or just sharing common attributes without a dedicated table for the base.

## Customizing Metadata

You can associate a `MetaData` object with your declarative base. This is useful if you want to control naming conventions or other schema-level configurations.

```python
from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

# Define a naming convention for constraints
convention = {
  "ix": "ix_%(column_0_label)s",
  "uq": "uq_%(table_name)s_%(column_0_name)s",
  "ck": "ck_%(table_name)s_%(constraint_name)s",
  "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
  "pk": "pk_%(table_name)s"
}

metadata_obj = MetaData(naming_convention=convention)

class BaseWithCustomMetadata(DeclarativeBase):
    metadata = metadata_obj # Associate custom metadata

# Models inheriting from BaseWithCustomMetadata will use this metadata and its naming convention
# class AnotherUser(BaseWithCustomMetadata):
#    __tablename__ = "another_user"
#    id = Column(Integer, primary_key=True)
#    name = Column(String, unique=True)
```

Effective use of the declarative base, mixins, abstract classes, and metadata customization allows for clean, maintainable, and powerful ORM model definitions in SQLAlchemy.

Placeholder content for "Utilizing Declarative Base Effectively". This section will cover best practices for working with SQLAlchemy's declarative base, including mixins, abstract base classes, and customizing metadata.
