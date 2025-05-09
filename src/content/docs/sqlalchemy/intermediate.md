---
title: SQLAlchemy - Intermediate
---

# SQLAlchemy - Intermediate Concepts

Key topics for intermediate SQLAlchemy include:

- SQLAlchemy Core:
    - More SQL Expressions: Joins, Group By, Order By, Aliases
    - Working with Schemas and Reflections
    - Transactions
- SQLAlchemy ORM:
    - Relationships: One-to-Many, Many-to-One, Many-to-Many (`relationship()`, `backref`, `back_populates`)
    - Advanced Querying:
        - `Query` object methods (`join`, `outerjoin`, `options`, `subquery`)
        - Filtering with operators (`==`, `!=`, `>`, `<`, `like`, `in_`, `and_`, `or_`, `not_`)
        - Eager Loading vs. Lazy Loading of relationships (`selectinload`, `joinedload`, `subqueryload`)
    - Session Management: Lifecycle, transactions, flushing, committing, rolling back
    - Working with SQLAlchemy events
    - Migrations (basics with Alembic)
    - Hybrid Attributes and Properties
