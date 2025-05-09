---
title: 3.7 Multi-Tenant Architectures with SQLAlchemy
description: Implementing multi-tenancy in applications using SQLAlchemy, exploring different strategies.
order: 7
---

# 3.7 Multi-Tenant Architectures with SQLAlchemy

Multi-tenancy is an architecture where a single instance of a software application serves multiple tenants (customers or organizations). SQLAlchemy can be adapted to support various multi-tenancy strategies. The choice of strategy depends on factors like data isolation requirements, scalability, and complexity.

## Common Multi-Tenancy Strategies

1.  **Shared Database, Shared Schema (Discriminator Column)**:
    *   All tenants share the same database and tables.
    *   A `tenant_id` (or similar discriminator) column is added to each shared table to distinguish data belonging to different tenants.
    *   **SQLAlchemy Implementation**:
        *   Add `tenant_id` to your models.
        *   Modify queries to always filter by the current tenant's ID. This can often be automated using session events (e.g., `before_execute`) or query extension methods.
    *   **Pros**: Easiest to implement, lower operational overhead.
    *   **Cons**: Weaker data isolation, potential for "noisy neighbor" performance issues, complex queries if tenants have very different data access patterns.

2.  **Shared Database, Separate Schemas (Schema per Tenant)**:
    *   Each tenant has its own schema within a single database. Tables within each schema have the same structure.
    *   **SQLAlchemy Implementation**:
        *   The application connects to the database and then sets the `search_path` (for PostgreSQL) or equivalent for the current tenant's schema.
        *   SQLAlchemy models are defined once, but operate on the tables within the active schema.
        *   Session or connection events can be used to set the `search_path` dynamically.
    *   **Pros**: Good data isolation, relatively simple model definitions.
    *   **Cons**: Database-specific (PostgreSQL handles this well), managing many schemas can be complex, migrations need to be applied to all schemas.

3.  **Separate Databases (Database per Tenant)**:
    *   Each tenant has its own dedicated database.
    *   **SQLAlchemy Implementation**:
        *   The application dynamically configures the database connection (engine) based on the current tenant.
        *   A central "master" database might store tenant metadata and connection strings.
        *   Your SQLAlchemy models are defined once.
    *   **Pros**: Strongest data isolation, good scalability for individual tenants, easier to customize database settings per tenant.
    *   **Cons**: Higher operational overhead (managing many databases), more complex connection management, cross-tenant reporting is harder.

## Example: Discriminator Column (Simplified)

```python
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session, Mapped, mapped_column
from fastapi import Depends, FastAPI, HTTPException, Request

# Assume Base is defined as:
# class Base(DeclarativeBase):
#     pass
# For this example, let's define it
class Base(DeclarativeBase):
    pass

# Dummy function to get current tenant ID (replace with actual auth logic)
def get_current_tenant_id(request: Request) -> int:
    # In a real app, this would come from authentication (e.g., JWT token, session)
    tenant_id_header = request.headers.get("X-Tenant-ID")
    if not tenant_id_header:
        raise HTTPException(status_code=400, detail="X-Tenant-ID header missing")
    try:
        return int(tenant_id_header)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid X-Tenant-ID")


class Item(Base):
    __tablename__ = "tenant_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    tenant_id: Mapped[int] = mapped_column(Integer, index=True) # Discriminator

# app = FastAPI()
# DATABASE_URL = "sqlite:///./test_multitenant.db" # Example
# engine = create_engine(DATABASE_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base.metadata.create_all(bind=engine)

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# @app.post("/items_tenant/")
# def create_tenant_item(name: str, tenant_id: int = Depends(get_current_tenant_id), db: Session = Depends(get_db)):
#     db_item = Item(name=name, tenant_id=tenant_id)
#     db.add(db_item)
#     db.commit()
#     db.refresh(db_item)
#     return db_item

# @app.get("/items_tenant/")
# def list_tenant_items(tenant_id: int = Depends(get_current_tenant_id), db: Session = Depends(get_db)):
#     return db.query(Item).filter(Item.tenant_id == tenant_id).all()
```
**Note**: The FastAPI app part is commented out to keep the focus on SQLAlchemy aspects. A real implementation would require proper setup.

## Considerations:
-   **Data Isolation**: How strictly do tenants' data need to be separated?
-   **Scalability**: How will the system scale as the number of tenants and data per tenant grows?
-   **Customization**: Do tenants require different schema customizations?
-   **Operational Complexity**: How much effort is involved in managing the infrastructure (databases, schemas)?
-   **Migrations**: How will database schema migrations be applied across tenants?

Choosing the right multi-tenancy strategy is a critical architectural decision. SQLAlchemy's flexibility allows it to adapt to each of these patterns.

Placeholder content for "Multi-Tenant Architectures". This section will discuss strategies for building multi-tenant applications using SQLAlchemy, such as using a discriminator column, separate schemas, or separate databases per tenant.
