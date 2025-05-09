---
title: Async Middleware in FastAPI
---

# Async Middleware in FastAPI

**Original Description**: Writing asynchronous middleware in FastAPI for request and response processing without blocking.

Middleware in FastAPI allows you to process requests before they reach your path operation functions and process responses before they are sent back to the client. When working with an asynchronous framework like FastAPI, it's crucial that your middleware is also asynchronous if it performs any I/O operations, to avoid blocking the event loop.

**Creating Async Middleware:**

FastAPI middleware can be created as an `async` function or as a class with an `async def __call__` method. The middleware function receives the `request` object and a `call_next` function.

*   **`request: Request`**: The incoming HTTP request object.
*   **`call_next(request)`**: An awaitable function that you call to pass the request to the next middleware in the chain or to the actual path operation. You **must** `await call_next(request)` to get the response.

**Example: Async Middleware to Add a Custom Header and Measure Request Time**

```python
import time
import asyncio # For asyncio.sleep to simulate async work
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

@app.middleware("http") # Decorator to register middleware
async def timing_and_custom_header_middleware(request: Request, call_next):
    print(f"Middleware: Request received for {request.url.path}")
    
    start_time = time.monotonic()
    
    # Simulate some async I/O work in the middleware before processing the request
    # e.g., checking something in a cache or an external service
    await asyncio.sleep(0.01) 
    print("Middleware: Simulated async pre-processing complete.")

    # Process the request and get the response
    response = await call_next(request) # This calls the next middleware or the endpoint

    # Simulate some async I/O work after the response is generated
    # e.g., logging response details to an async service
    await asyncio.sleep(0.005)
    print("Middleware: Simulated async post-processing complete.")

    process_time = time.monotonic() - start_time
    response.headers["X-Process-Time"] = str(process_time) # Add custom header
    response.headers["X-Custom-Middleware-Header"] = "Hello from Async Middleware!"
    
    print(f"Middleware: Response for {request.url.path} processed in {process_time:.4f}s")
    return response


# Example of a custom middleware class (alternative way)
class AnotherAsyncMiddleware:
    def __init__(self, app, some_option="default_value"):
        self.app = app
        self.some_option = some_option

    async def __call__(self, request: Request, call_next):
        print(f"AnotherAsyncMiddleware: Pre-processing with option '{self.some_option}' for {request.url.path}")
        
        # You can modify the request here if needed, or its scope
        # request.state.custom_data = "Data set by middleware"

        response = await call_next(request)
        
        print(f"AnotherAsyncMiddleware: Post-processing for {request.url.path}")
        response.headers["X-Another-Middleware"] = "Processed by class-based middleware"
        return response

# Add class-based middleware (note: no decorator for this way)
# app.add_middleware(AnotherAsyncMiddleware, some_option="custom_config_value")
# IMPORTANT: If you use `app.add_middleware`, it's added to the *end* of the existing
# middleware stack (including Starlette's defaults). `@app.middleware("http")` adds
# to the *start* (executed earlier). For precise ordering, using `app.add_middleware`
# for all custom middleware in the desired order is more explicit.
# For this example, we will keep the decorator style for the first one.

@app.get("/")
async def read_root():
    print("Endpoint: read_root called.")
    # Access data set by middleware (if using class-based example with request.state)
    # custom_data = request.state.custom_data if hasattr(request.state, 'custom_data') else "N/A"
    # print(f"Endpoint: Custom data from middleware: {custom_data}")
    await asyncio.sleep(0.1) # Simulate endpoint work
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    print(f"Endpoint: read_item called for item_id {item_id}.")
    await asyncio.sleep(0.05) # Simulate endpoint work
    if item_id == 99:
        # Middleware still runs for exceptions handled by FastAPI
        raise HTTPException(status_code=404, detail="Item 99 not found")
    return {"item_id": item_id}

# To run: uvicorn main:app --reload
# Access http://127.0.0.1:8000/ and check response headers and console logs.
# Access http://127.0.0.1:8000/items/1
```

**Explanation:**

1.  **`@app.middleware("http")`**: This decorator registers the `timing_and_custom_header_middleware` function as HTTP middleware. It will be called for every HTTP request.
2.  **`async def ...`**: The middleware function is defined as an `async` function, allowing it to use `await`.
3.  **`await call_next(request)`**: This is the crucial part.
    *   It passes the `request` to the next processing step (another middleware or the target path operation).
    *   It `await`s the result, which is the `Response` object. The middleware's execution pauses here, allowing other tasks to run on the event loop (including the endpoint itself if it's async).
4.  **Modifying Response**: After `await call_next(request)` returns, the middleware has access to the `response` object and can modify it (e.g., add headers) before returning it.
5.  **Simulated Async Work**: `await asyncio.sleep(...)` is used to simulate non-blocking I/O operations within the middleware. In a real scenario, this could be an `await` on a cache lookup, an external API call for authentication/authorization, or an async logging operation.

**Why Async Middleware is Important:**

*   **Non-Blocking Behavior**: If middleware needs to perform I/O (e.g., database lookups for authentication, calls to an authorization service, logging to a remote service), making it `async` and using `await` for these operations prevents the entire server from blocking. The event loop can continue processing other requests while the middleware's I/O operation is pending.
*   **Consistency with FastAPI**: Since FastAPI is an async framework, using async middleware aligns with its design principles and allows seamless integration with async path operations and dependencies.
*   **Performance Under Load**: Non-blocking middleware contributes to the overall ability of the server to handle a high number of concurrent requests efficiently.

**Common Use Cases for Async Middleware:**

*   **Authentication/Authorization**: Checking tokens or permissions by calling an async database or external service.
*   **Logging**: Asynchronously logging request and response details to files or remote services.
*   **Custom Headers**: Adding or modifying request/response headers (e.g., CORS headers, security headers).
*   **Request Throttling/Rate Limiting**: Implementing rate limiting logic that might involve async lookups in a cache like Redis.
*   **Session Management**: Loading session data from an async store.
*   **Performance Monitoring**: Capturing request processing times, as shown in the example.
*   **Request/Response Transformation**: Modifying the request body before it hits the endpoint or the response body before it's sent (use with caution, especially for large bodies).

When writing middleware for FastAPI, always consider if it involves I/O. If it does, make it `async` to maintain the non-blocking nature of your application.

    