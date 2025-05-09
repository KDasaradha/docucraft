---
title: 2.3 Request Body and Pydantic Models
description: Learn about Request Body and Pydantic Models in FastAPI, focusing on data validation and serialization.
order: 3
---

# 2.3 Request Body and Pydantic Models

FastAPI leverages Pydantic models to define, validate, and document request bodies. When you declare a Pydantic model as a type hint for a path operation function parameter, FastAPI automatically:

1.  Reads the body of the request as JSON.
2.  Converts the corresponding types (if necessary).
3.  Validates the data. If the data is invalid, it will return a clear error, indicating exactly where and what the incorrect data was.
4.  Gives you the received data in the parameter.
5.  Includes the JSON Schema of your model in the OpenAPI path operation.

## Example

```python
from fastapi import FastAPI
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None

app = FastAPI()

@app.post("/items/")
async def create_item(item: Item):
    item_dict = item.model_dump()
    if item.tax:
        price_with_tax = item.price + item.tax
        item_dict.update({"price_with_tax": price_with_tax})
    return item_dict
```

In this example:
- `Item` is a Pydantic model.
- The `create_item` path operation expects a JSON body that conforms to the `Item` model.
- FastAPI handles the parsing, validation, and documentation.

Placeholder content for "Request Body and Pydantic Models". This section will cover how to define and use request bodies with Pydantic models for data validation and serialization in FastAPI.
