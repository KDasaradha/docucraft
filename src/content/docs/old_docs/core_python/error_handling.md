---
title: Error Handling
description: Placeholder content for Core Python Error Handling.
order: 3
---

# Core Python Error Handling


# **Error Handling in Python**

## Here’s a Markdown-friendly explanation on **Error Handling in Python** using `try-except-finally` blocks, and handling exceptions in **FastAPI** along with examples of raising custom errors

Python uses `try-except` blocks to handle exceptions, ensuring that the program can continue running or respond gracefully when an error occurs. Additionally, the `finally` block is used to execute code that should run regardless of an error occurring, such as closing files or releasing resources.

### **Basic Try-Except-Finally Structure**

```python
try:
    # Code that might raise an exception
    result = risky_operation()
except ExceptionType as e:
    # Handle the exception
    print(f"An error occurred: {e}")
finally:
    # Code that runs regardless of error
    clean_up_resources()
```

### **Example: Division with Error Handling**

```python
def divide_numbers(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        return "Error: Cannot divide by zero."
    except TypeError:
        return "Error: Please enter numbers only."
    else:
        return f"Result is {result}"
    finally:
        print("Execution completed.")

# Usage
print(divide_numbers(10, 0))  # Output: Error: Cannot divide by zero.
print(divide_numbers(10, 2))  # Output: Result is 5.0
```

- **try**: Runs code that may raise an exception.
- **except**: Catches and handles specific errors.
- **else**: Runs if no exception occurs in the try block.
- **finally**: Executes regardless of success or failure.

---

## **Error Handling in FastAPI**

In FastAPI, error handling can be managed through built-in exception classes, custom exception handling, and raising HTTP errors.

### **1. Handling HTTP Exceptions**

FastAPI provides `HTTPException` for returning standard HTTP errors with custom messages.

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    if item_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid item ID.")
    return {"item_id": item_id}
```

### **2. Custom Exception Handling**

You can create custom exceptions and use FastAPI’s exception handler to handle them.

```python
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

app = FastAPI()

class CustomException(Exception):
    def __init__(self, name: str):
        self.name = name

@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=418,
        content={"message": f"Oops! {exc.name} did something wrong."},
    )

@app.get("/cause_error")
async def cause_error(name: str):
    if name == "error":
        raise CustomException(name=name)
    return {"message": f"Hello, {name}"}
```

### **3. Using `try-except` in FastAPI Endpoints**

`try-except` blocks can be used within endpoints to catch specific errors and respond with appropriate messages.

```python
@app.get("/calculate")
async def calculate(a: int, b: int):
    try:
        result = a / b
    except ZeroDivisionError:
        raise HTTPException(status_code=400, detail="Division by zero is not allowed.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")
    return {"result": result}
```

### **4. Raising Validation Errors**

FastAPI automatically validates input based on request models, but you can also manually raise validation errors.

```python
from pydantic import BaseModel, ValidationError

class Item(BaseModel):
    name: str
    price: float

@app.post("/items/")
async def create_item(item: Item):
    try:
        return item
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
```

### **5. Using Middleware for Global Error Logging**

A FastAPI middleware can log errors globally, providing error details without repeating `try-except` in each endpoint.

```python
from starlette.middleware.base import BaseHTTPMiddleware
import logging

class ErrorLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        try:
            response = await call_next(request)
        except Exception as e:
            logging.error(f"Unhandled error: {e}")
            return JSONResponse(
                status_code=500, content={"message": "Internal Server Error"}
            )
        return response

app.add_middleware(ErrorLoggingMiddleware)
```

---

## **Summary of Error Handling Techniques**

- **Basic Error Handling**: Use `try-except-finally` for general error handling.
- **FastAPI Error Handling**:
  - Use `HTTPException` for common HTTP errors.
  - Define custom exceptions with FastAPI’s `@exception_handler`.
  - Raise `ValidationError` for input validation issues.
  - Add middleware for global error logging.

These techniques ensure your FastAPI application gracefully handles errors, improving user experience and making debugging easier.
