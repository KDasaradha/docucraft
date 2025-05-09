---
title: Path and Query Parameters in FastAPI
---

# Path and Query Parameters in FastAPI

**Original Description**: Handling path parameters, query parameters, and optional parameters in FastAPI endpoints.

FastAPI makes it intuitive to define and use path and query parameters by leveraging Python type hints. These parameters are common ways to pass data to API endpoints.

## Create a FastAPI endpoint that accepts a user ID as a path parameter and an optional query parameter for filtering.

Here's an example demonstrating both:

```python
# main.py
from fastapi import FastAPI

app = FastAPI()

# Path parameters are defined using curly braces {} in the path string
@app.get("/users/{user_id}")
async def read_user(user_id: int, active: bool | None = None):
    """
    Read a user by their ID.
    Optionally filter by active status.
    """
    user_data = {"user_id": user_id, "username": f"user{user_id}"}
    
    if active is not None: # Check if 'active' query parameter was provided
        user_data["is_active"] = active
        
    return user_data

# Example usage:
# - GET /users/123 -> {"user_id": 123, "username": "user123"}
# - GET /users/456?active=true -> {"user_id": 456, "username": "user456", "is_active": true}
# - GET /users/789?active=false -> {"user_id": 789, "username": "user789", "is_active": false}


@app.get("/items/{item_name}")
async def read_item_by_name(item_name: str, limit: int = 10, skip: int = 0):
    """
    Read an item by its name.
    Supports pagination with limit and skip query parameters.
    """
    # In a real application, you would fetch items based on item_name, skip, and limit
    return {
        "item_name": item_name,
        "description": f"Details for {item_name}",
        "pagination": {"limit": limit, "skip": skip}
    }

# Example usage:
# - GET /items/apple -> {"item_name": "apple", ..., "pagination": {"limit": 10, "skip": 0}}
# - GET /items/banana?limit=5 -> {"item_name": "banana", ..., "pagination": {"limit": 5, "skip": 0}}
# - GET /items/orange?skip=20&limit=5 -> {"item_name": "orange", ..., "pagination": {"limit": 5, "skip": 20}}
```

**Explanation:**

1.  **Path Parameter (`user_id: int`)**:
    *   In the decorator `@app.get("/users/{user_id}")`, the `{user_id}` part declares a path parameter named `user_id`.
    *   In the function signature `async def read_user(user_id: int, ...)`:
        *   The parameter `user_id` **must have the same name** as declared in the path.
        *   The type hint `int` tells FastAPI to expect an integer. FastAPI will automatically parse the value from the path string and convert it to an integer. If the conversion fails (e.g., `/users/abc`), FastAPI will return a 422 Unprocessable Entity error with a descriptive message.

2.  **Optional Query Parameter (`active: bool | None = None`)**:
    *   Query parameters are **not** declared in the path string of the decorator.
    *   They are defined as function parameters that are **not** part of the path parameters.
    *   `active: bool | None = None`:
        *   `active`: The name of the query parameter.
        *   `bool`: The expected type. FastAPI will attempt to convert the query string value (e.g., "true", "false", "1", "0") to a boolean.
        *   `| None = None` (or `Optional[bool] = None` in older Python versions): This makes the `active` query parameter **optional**. If the client doesn't provide it in the URL (e.g., `/users/123`), `active` will be `None` inside the function.
    *   Query parameters are appended to the URL after a `?`, like `?active=true`. Multiple query parameters are separated by `&`.

## How does FastAPI validate path and query parameters automatically?

FastAPI leverages Python type hints and Pydantic for automatic validation:

1.  **Type Conversion**:
    *   When a request comes in, FastAPI inspects the type hints of your path operation function's parameters.
    *   For **path parameters**, it extracts the corresponding segment from the URL path.
    *   For **query parameters**, it extracts the value from the URL's query string.
    *   It then attempts to **convert** these string values to the specified type hint (e.g., `int`, `float`, `bool`, `str`, `UUID`, `datetime`).
    *   **Example**: If `user_id: int` is defined and the path is `/users/123`, FastAPI converts `"123"` (string) to `123` (integer). If the path is `/users/abc`, this conversion fails.

2.  **Validation Error**:
    *   If the type conversion fails (e.g., trying to convert "abc" to an `int`), or if a required parameter is missing (see next question), FastAPI automatically returns an HTTP `422 Unprocessable Entity` error.
    *   The response body of this error is a JSON object detailing the validation issues, including the location (path, query, body), the parameter name, the type of error, and a human-readable message. This is extremely helpful for debugging and for API clients to understand what went wrong.

3.  **Pydantic Models (for more complex validation)**:
    *   While basic type hints cover many cases, you can achieve more complex validation for query parameters (and especially request bodies) by using Pydantic models.
    *   For path and query parameters specifically, FastAPI provides `Path` and `Query` utility functions that allow you to add more detailed validation constraints directly in the function signature.

    ```python
    from fastapi import FastAPI, Path, Query

    app = FastAPI()

    @app.get("/advanced_items/{item_id}")
    async def read_advanced_item(
        item_id: int = Path(..., title="The ID of the item", ge=1, le=1000),
        q: str | None = Query(None, min_length=3, max_length=50, pattern="^fixedquery$")
    ):
        results = {"item_id": item_id}
        if q:
            results.update({"q": q})
        return results
    ```
    *   `Path(..., ge=1, le=1000)`:
        *   `...` (Ellipsis) indicates the path parameter `item_id` is required.
        *   `ge=1` (greater than or equal to 1) and `le=1000` (less than or equal to 1000) add numerical constraints.
    *   `Query(None, min_length=3, max_length=50, pattern="^fixedquery$")`:
        *   `None` as the first argument means the query parameter `q` has a default value of `None`, making it optional.
        *   `min_length`, `max_length`, and `pattern` (regex) add string validation constraints.

This automatic validation is a significant advantage of FastAPI, reducing boilerplate code and ensuring data integrity at the API boundary.

## What happens if a required query parameter is missing in a FastAPI request?

If a query parameter is defined in your path operation function **without a default value**, FastAPI considers it **required**.

**Example of a required query parameter:**

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/search/")
async def search_items(term: str): # 'term' is a required query parameter
    return {"search_term": term, "results": ["item1", "item2"]}
```

In this example:
*   `term: str` does not have a default value (like `= None` or `= "default_value"`).

If a client makes a request to `/search/` **without** providing the `term` query parameter (e.g., just `GET /search/`), FastAPI will automatically respond with an HTTP `422 Unprocessable Entity` error.

The JSON response body would look something like this:

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": [
        "query",
        "term"
      ],
      "msg": "Field required",
      "input": null // or the actual query dict if other params were present
      // "url": "https://errors.pydantic.dev/2.5/v/missing" // Pydantic error URL (version may vary)
    }
  ]
}
```

**Key takeaways:**

*   **No Default Value = Required**: If a function parameter that is not a path parameter lacks a default value, it's treated as a required query parameter.
*   **Default Value = Optional**: If you provide a default value (e.g., `term: str = "default"`, or `term: str | None = None`), the query parameter becomes optional. If the client omits it, the function will use the default value.
*   **HTTP 422 Error**: Missing required parameters (path, query, or body) result in a 422 error, clearly indicating what was expected by the API.

This behavior ensures that your API endpoints receive the necessary data to function correctly, and clients get immediate, informative feedback if their requests are malformed.
