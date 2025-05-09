---
title: 2.2 Path and Query Parameters
description: How to define and use path and query parameters in FastAPI.
order: 2
---

# 2.2 Path and Query Parameters

FastAPI makes it easy to declare path parameters and query parameters with type hints.

**Path Parameters:**
Values that are part of the URL path.
```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}
```

**Query Parameters:**
Key-value pairs appended to the URL after a `?`.
```python
from fastapi import FastAPI

app = FastAPI()

fake_items_db = [{"item_name": "Foo"}, {"item_name": "Bar"}, {"item_name": "Baz"}]

@app.get("/items/")
async def read_item(skip: int = 0, limit: int = 10):
    return fake_items_db[skip : skip + limit]
```

Placeholder content for "Path and Query Parameters".
