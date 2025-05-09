---
title: Basic FastAPI Application
---

# Basic FastAPI Application

**Original Description**: Building a simple FastAPI application with basic routes and endpoints.

A basic FastAPI application involves importing the `FastAPI` class, creating an instance of it, and then defining "path operations" (also known as routes or endpoints) using decorators. These path operations are Python functions that handle incoming requests to specific URLs (paths) and HTTP methods.

## Write a basic FastAPI application with a single GET endpoint that returns a JSON response.

Here's a minimal "Hello World" example of a FastAPI application:

```python
# main.py
from fastapi import FastAPI

# 1. Create an instance of the FastAPI class
app = FastAPI()

# 2. Define a path operation decorator
@app.get("/")  # This tells FastAPI that the function below handles GET requests to the root path ("/")
async def read_root():
    # 3. The function returns data that will be automatically converted to JSON
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    # This endpoint demonstrates path parameters and optional query parameters
    # It will be accessible at URLs like /items/5 or /items/10?q=somequery
    response_data = {"item_id": item_id}
    if q:
        response_data["q"] = q
    return response_data
```

**Explanation:**

1.  **`from fastapi import FastAPI`**: Imports the main class needed to create your application.
2.  **`app = FastAPI()`**: Creates an instance of the `FastAPI` application. This `app` variable will be the main point of interaction for your API.
3.  **`@app.get("/")`**: This is a **decorator**.
    *   `@app`: Refers to the FastAPI instance created above.
    *   `.get`: Indicates that this path operation will respond to HTTP `GET` requests. FastAPI also provides decorators for other HTTP methods like `@app.post()`, `@app.put()`, `@app.delete()`, etc.
    *   `("/")`: Specifies the URL path for this operation. In this case, it's the root path of your application.
4.  **`async def read_root():`**: This is an **asynchronous function** that will be executed when a `GET` request is made to the `/` path.
    *   FastAPI can work with both regular `def` functions and `async def` functions. Using `async def` is beneficial for I/O-bound operations as it allows FastAPI to handle other requests while waiting for the operation to complete, improving concurrency.
5.  **`return {"message": "Hello World"}`**: FastAPI automatically converts Python dictionaries, lists, Pydantic models, and other compatible types into JSON responses.

## What is the role of the `@app.get()` decorator in FastAPI?

The `@app.get("/path")` decorator plays a crucial role in FastAPI:

1.  **Path Operation Registration**: It registers the function immediately following it as a handler for HTTP `GET` requests made to the specified URL `/path`.
2.  **HTTP Method Association**: The `.get` part specifically associates the function with the `GET` HTTP method. Similarly, `@app.post()`, `@app.put()`, etc., associate functions with their respective HTTP methods.
3.  **Documentation Generation**: FastAPI uses these decorators and the type hints in the decorated function to automatically generate OpenAPI (formerly Swagger) documentation for your API. This documentation includes information about the path, method, parameters, request body, and response models.
4.  **Data Validation and Serialization**: Based on the type hints in the function parameters and return type, FastAPI can automatically validate incoming request data and serialize outgoing response data.
5.  **Dependency Injection**: Decorators are also involved in FastAPI's powerful dependency injection system, allowing you to declare dependencies that FastAPI will manage and provide to your path operation functions.

In essence, decorators like `@app.get()` are the primary way you define the structure and behavior of your API endpoints in FastAPI.

## How can you run a FastAPI application using Uvicorn?

Uvicorn is an ASGI (Asynchronous Server Gateway Interface) server, which is necessary to run FastAPI applications. To run the `main.py` file (containing the FastAPI app shown above) with Uvicorn:

1.  **Install Uvicorn and FastAPI**:
    If you haven't already, install the necessary packages:
    ```bash
    pip install fastapi uvicorn[standard]
    ```
    The `[standard]` part installs Uvicorn with optional dependencies like `python-multipart` for form data and `uvloop` for better performance on Linux.

2.  **Run from the command line**:
    Navigate to the directory where your `main.py` file is located and run the following command:
    ```bash
    uvicorn main:app --reload
    ```
    Let's break down this command:
    *   **`uvicorn`**: The command to start the Uvicorn server.
    *   **`main:app`**:
        *   `main`: Refers to the Python file `main.py` (Python module).
        *   `app`: Refers to the `FastAPI` instance you created inside `main.py` (e.g., `app = FastAPI()`).
    *   **`--reload`**: This is an optional flag that tells Uvicorn to automatically restart the server whenever it detects changes in your code. This is very useful during development.

3.  **Access your API**:
    Once Uvicorn is running, it will typically output something like:
    ```
    INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
    INFO:     Started reloader process [xxxxx]
    INFO:     Started server process [yyyyy]
    INFO:     Waiting for application startup.
    INFO:     Application startup complete.
    ```
    You can now open your web browser and navigate to `http://127.0.0.1:8000` to see the `{"message": "Hello World"}` response.
    You can also access the auto-generated API documentation at `http://127.0.0.1:8000/docs` (Swagger UI) or `http://127.0.0.1:8000/redoc` (ReDoc UI).

## How do you run a FastAPI app using Uvicorn with custom host/port?

To run your FastAPI application on a specific host and port, you can use the `--host` and `--port` options with Uvicorn:

```bash
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

*   **`--host 0.0.0.0`**: This tells Uvicorn to listen on all available network interfaces. This is useful if you want to access the API from other devices on your network or if you're running it in a Docker container. If you use `127.0.0.1` (the default), it will only be accessible from your local machine.
*   **`--port 8080`**: This specifies that Uvicorn should listen on port `8080` instead of the default port `8000`.

After running this command, your API would be accessible at `http://<your-ip-address>:8080` or `http://localhost:8080`.
