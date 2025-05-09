---
title: SQLAlchemy - Hidden Gems
---

# SQLAlchemy - Hidden Gems & Lesser-Known Features

Key hidden gems and lesser-known SQLAlchemy features include:

- `text()` construct for raw SQL with parameter binding
- `literal_column()` for SQL literals
- Window Functions support
- Common Table Expressions (CTEs)
- `baked_queries` for pre-compiled, highly optimized queries
- Using `inspect()` for runtime introspection of mappers, tables, and engines
- `TypeDecorator` for custom data types
- `@compiles` decorator for extending SQL compilation
- `sqlalchemy.dialects` for database-specific features (e.g., `postgresql.JSONB`, `mysql.LONGTEXT`)
- Session events like `before_flush`, `after_flush`
- Attribute events for tracking changes on ORM objects
- `update_session_configure` for fine-tuning session behavior
- `orm.with_parent` for querying based on parent object in a relationship
- `DeferredReflection` for reflecting tables at a later stage
