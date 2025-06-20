---
title: SQLAlchemy with FastAPI
---

# SQLAlchemy with FastAPI

Learn how to integrate SQLAlchemy into your FastAPI applications for database interactions.

- [Session Management in FastAPI](./session-management.md)
  - Setting up database sessions
  - Role of `SessionLocal`
  - Using `yield` in dependencies for session lifecycle

This section focuses on the practical aspects of using SQLAlchemy within your FastAPI applications. Key topics include:

-   **Session Management**: Efficiently handling database sessions per request using FastAPI's dependency injection.
-   **CRUD Operations**: Implementing Create, Read, Update, and Delete operations for your SQLAlchemy models.
-   **Structuring Your Application**: Best practices for organizing your database-related code, models, and schemas.
-   **Asynchronous Operations**: Leveraging async capabilities with SQLAlchemy for improved performance (covered in more detail under Async SQLAlchemy).

Proper integration ensures your FastAPI application can reliably and performantly interact with your relational database.
