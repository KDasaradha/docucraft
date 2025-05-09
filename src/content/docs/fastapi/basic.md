---
title: FastAPI - Basic
---

# FastAPI - Basic Concepts

FastAPI is a modern, fast (high-performance) web framework for building APIs with Python 3.8+ based on standard Python type hints. It's designed to be easy to use, fast to code, and production-ready.

## Key Topics

### Introduction to FastAPI
- **What it is**: A Python web framework that leverages modern Python features (like type hints and `async/await`) to build APIs.
- **Key features**:
    - **Performance**: One of the fastest Python frameworks available, on par with NodeJS and Go, thanks to Starlette (for web parts) and Pydantic (for data parts).
    - **Type Hints**: Uses Python type hints for data validation, serialization, and automatic API documentation.
    - **Automatic Docs**: Automatically generates interactive API documentation (Swagger UI and ReDoc) based on your code and Pydantic models.
    - **Easy to Use**: Designed to be simple and intuitive, enabling rapid development.
    - **Asynchronous Support**: Built-in support for `async def` syntax, making it ideal for I/O-bound applications.
    - **Pydantic Integration**: Deep integration with Pydantic for robust data validation and settings management.

### Installation and Project Setup
1.  **Install FastAPI and Uvicorn (an ASGI server)**:
    ```bash
    pip install fastapi uvicorn[standard]
    ```
    The `[standard]` part installs Uvicorn with helpful extras.

2.  **Create a Python file** (e.g., `main.py`):
    This file will contain your FastAPI application code.

### Creating your first FastAPI application
A minimal FastAPI application looks like this:

```python
# main.py
from fastapi import FastAPI

# Create an instance of the FastAPI class
app = FastAPI()

# Define a path operation (route)
@app.get("/")  # Decorator for GET requests to the root path "/"
async def read_root():
    return {"message": "Hello World"}
```
- `app = FastAPI()`: Creates your FastAPI application instance.
- `@app.get("/")`: A decorator that tells FastAPI that the function below (`read_root`) handles `GET` requests to the path `/`.
- `async def read_root()`: An asynchronous path operation function. FastAPI can also work with regular `def` functions.
- `return {"message": "Hello World"}`: FastAPI automatically converts this dictionary to a JSON response.

### Path Operations (Routes)
Path operations are how you define API endpoints. You use decorators like `@app.get()`, `@app.post()`, `@app.put()`, `@app.delete()` to associate HTTP methods and paths with Python functions.

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/")
async def read_items():
    return [{"item_id": 1, "name": "Foo"}, {"item_id": 2, "name": "Bar"}]

@app.post("/items/")
async def create_item(item_name: str, item_price: float): # Example with simple query/form params
    return {"name": item_name, "price": item_price, "status": "created"}
```

### Path Parameters and Type Hints
Path parameters are parts of the URL path that are variable. You declare them using curly braces `{}` in the path and accept them as function arguments with type hints.

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/users/{user_id}")
async def read_user(user_id: int): # user_id from path, type-hinted as int
    return {"user_id": user_id, "username": f"user_{user_id}"}

@app.get("/files/{file_path:path}") # :path converter allows slashes in the parameter
async def read_file(file_path: str):
    return {"file_path": file_path}
```
FastAPI uses the type hints (e.g., `int`, `str`) for automatic data validation and conversion. If `user_id` in `/users/abc` is received, FastAPI returns a 422 error.

### Query Parameters
Query parameters are optional key-value pairs appended to the URL after a `?` (e.g., `/search?query=python&limit=10`). You declare them as function arguments that are not part of the path, with type hints and optional default values.

```python
from fastapi import FastAPI
from typing import Optional # For Python versions < 3.10, use Optional[str] for optional params

app = FastAPI()

@app.get("/search/")
async def search_items(query: str, limit: int = 10, skip: Optional[int] = None):
    # 'query' is required (no default value)
    # 'limit' is optional, defaults to 10
    # 'skip' is optional, defaults to None
    results = {"query": query, "limit": limit}
    if skip is not None:
        results["skip"] = skip
    results["items"] = [f"Result for {query} #{i}" for i in range(limit)]
    return results

# Example URL: /search/?query=fastapi&limit=5
# Example URL: /search/?query=pydantic (limit will be 10, skip will be None)
```
FastAPI validates query parameters based on their type hints and default values.

### Request Body (using Pydantic models)
For `POST`, `PUT`, `PATCH` requests, data is often sent in the request body, typically as JSON. FastAPI uses Pydantic models to define the structure and validation rules for request bodies.

```python
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr, Field # Field for extra validation/metadata
from typing import Optional

app = FastAPI()

# Define a Pydantic model
class Item(BaseModel):
    name: str = Field(..., min_length=3, description="The name of the item.")
    description: Optional[str] = Field(None, description="An optional description.")
    price: float = Field(..., gt=0, description="The price must be greater than zero.")
    is_offer: Optional[bool] = None

@app.post("/items/create")
async def create_new_item(item_payload: Item): # item_payload is type-hinted with the Pydantic model
    # FastAPI automatically parses the JSON request body,
    # validates it against the Item model, and converts it to an Item instance.
    # If validation fails, a 422 error is returned.
    return {"message": "Item created successfully", "item_details": item_payload}

# Example POST request body:
# {
#   "name": "Super Widget",
#   "price": 19.99,
#   "is_offer": true
# }
```

### Basic Data Validation with Pydantic
Pydantic handles data validation based on type hints and `Field` constraints in your models.
- **Type Validation**: Ensures data matches the declared type (e.g., `int`, `str`, `bool`).
- **Constraints**: `Field` allows specifying `min_length`, `max_length`, `gt` (greater than), `lt` (less than), `ge`, `le`, `pattern` (regex), etc.
- **Specific Types**: Pydantic offers types like `EmailStr`, `HttpUrl` for specific format validation.

If validation fails, FastAPI returns an HTTP 422 error with details about the validation issues.

### Returning Responses
FastAPI automatically converts the return value of your path operation functions into JSON responses by default.
- You can return dictionaries, lists, Pydantic models, numbers, strings.
- You can also control the HTTP status code.

```python
from fastapi import FastAPI, status # status for HTTP status codes
from pydantic import BaseModel

app = FastAPI()

class Message(BaseModel):
    detail: str

@app.get("/status-example", status_code=status.HTTP_200_OK) # Default is 200 anyway
async def get_status():
    return {"status": "OK"}

@app.post("/resources", status_code=status.HTTP_201_CREATED, response_model=Message)
async def create_resource():
    # ... creation logic ...
    return Message(detail="Resource created successfully")
```
`response_model` can be used to define the schema of the output, filtering and validating the data returned.

### Running the development server (Uvicorn)
Uvicorn is an ASGI server used to run FastAPI applications.
```bash
uvicorn main:app --reload
```
- `main`: The file `main.py` (or your Python module name).
- `app`: The `FastAPI` instance created in `main.py` (e.g., `app = FastAPI()`).
- `--reload`: Makes the server restart automatically on code changes (for development).

Access your API at `http://127.0.0.1:8000` by default.

### Automatic API Documentation
FastAPI automatically generates interactive API documentation using OpenAPI (formerly Swagger) and ReDoc.
- **Swagger UI**: Accessible at `/docs` (e.g., `http://127.0.0.1:8000/docs`). Allows you to view and interactively test your API endpoints directly in the browser.
- **ReDoc**: An alternative documentation UI, accessible at `/redoc` (e.g., `http://127.0.0.1:8000/redoc`).

This documentation is generated from your path operations, Pydantic models, type hints, and other metadata you provide.
