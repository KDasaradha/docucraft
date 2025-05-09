---
title: PostgreSQL - Hidden Gems
---

# PostgreSQL - Hidden Gems & Lesser-Known Features

Key hidden gems and lesser-known PostgreSQL features include:

- `FILTER` clause for aggregate functions (e.g., `COUNT(*) FILTER (WHERE condition)`)
- `LATERAL` joins for dependent subqueries
- Array data type and array functions/operators
- Range types (`INT4RANGE`, `NUMRANGE`, `DATERANGE`, etc.) and their operators
- HStore key-value store extension
- `LISTEN` and `NOTIFY` for asynchronous notifications
- Row-level triggers vs. Statement-level triggers
- `pg_stat_statements` for query performance analysis
- Advisory Locks for application-level locking
- Inheritance (table inheritance, though partitioning is often preferred now)
- `pg_try_advisory_lock` functions
- `DO` command for anonymous code blocks
- BRIN (Block Range INdexes) for very large tables with correlation
- Using `GENERATED ALWAYS AS IDENTITY` for auto-incrementing columns
- `UNLOGGED` tables for temporary, high-speed data
