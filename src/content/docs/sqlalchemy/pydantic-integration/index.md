---
title: Pydantic and SQLAlchemy Integration
---

# Pydantic and SQLAlchemy Integration

Understand how to effectively combine Pydantic models with SQLAlchemy for robust data validation, serialization, and API development.

- [Integrating Pydantic with SQLAlchemy Models](./pydantic-sqlalchemy-integration.md)
  - Mapping Pydantic models to SQLAlchemy models for requests
  - Avoiding circular imports
  - Benefits of Pydantic for input validation
  - Handling nested relationships

# SQLAlchemy Pydantic Integration

This section explores the powerful combination of SQLAlchemy and Pydantic within FastAPI applications. Pydantic excels at data validation and defining clear API schemas, while SQLAlchemy manages database interactions through its ORM.

Key aspects of this integration include:

-   **Defining Pydantic Models from SQLAlchemy Models**: Using Pydantic's ORM mode (`from_attributes = True`) to automatically generate Pydantic schemas based on your SQLAlchemy table definitions. This reduces code duplication and ensures consistency between your API layer and database layer.
-   **Request Validation**: Using Pydantic models to validate incoming request data before it interacts with your SQLAlchemy models or database.
-   **Response Serialization**: Using Pydantic models as `response_model` in FastAPI to control the structure and content of API responses, often serializing data fetched via SQLAlchemy.
-   **Separation of Concerns**: Maintaining a clear distinction between database models (SQLAlchemy) and API data transfer objects (Pydantic).

By effectively integrating Pydantic with SQLAlchemy, you can build type-safe, well-documented, and maintainable APIs with FastAPI.
