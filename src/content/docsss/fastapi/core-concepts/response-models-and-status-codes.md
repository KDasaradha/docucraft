---
title: 2.4 Response Models and Status Codes
description: Understanding how to define response models and set status codes in FastAPI.
order: 4
---

# 2.4 Response Models and Status Codes

FastAPI allows you to declare the model of the response that your API will return, and also to specify the HTTP status code for the response.

## Response Model

You can declare the `response_model` in any of the path operation decorators (`@app.get()`, `@app.post()`, etc.). This ensures that the response data conforms to the specified Pydantic model, filtering out any data not defined in the model. It also helps with data validation, serialization, and documentation.

```python
from fastapi import FastAPI
from pydantic import BaseModel

class ItemOut(BaseModel):
    name: str
    price: float

app = FastAPI()

@app.post("/items/", response_model=ItemOut)
async def create_item(name: str, price: float):
    # In a real app, you would save this to a database
    return {"name": name, "price": price, "secret_info": "this_is_hidden"}
```
In the example above, even though the returned dictionary includes `secret_info`, the client will only receive `name` and `price` because `ItemOut` is the `response_model`.

## Status Codes

You can specify the HTTP status code for the response using the `status_code` parameter in the path operation decorator.

```python
from fastapi import FastAPI, status

app = FastAPI()

@app.post("/items/", status_code=status.HTTP_201_CREATED)
async def create_item(name: str):
    return {"name": name}
```
FastAPI provides convenient access to common HTTP status codes via `fastapi.status`.

Placeholder content for "Response Models and Status Codes". This section will cover how to declare response models for data filtering and documentation, and how to set appropriate HTTP status codes for your API endpoints in FastAPI.
