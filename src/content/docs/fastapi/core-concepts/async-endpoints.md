---
title: 2.5 Async Endpoints
description: Learn how to use async and await with FastAPI for concurrent programming.
order: 5
---

# 2.5 Async Endpoints

FastAPI is built on top of Starlette and Uvicorn, which provide asynchronous capabilities. This means you can define your path operation functions using `async def` to leverage Python's `async` and `await` syntax for non-blocking I/O operations.

## `async` and `await`

When you have I/O-bound operations (like network requests to external services, database operations, reading/writing files) that would normally block the execution of your code, you can use `async` and `await` to perform these operations concurrently.

FastAPI will run your `async def` path operation functions in an event loop.

```python
from fastapi import FastAPI
import asyncio

app = FastAPI()

async def slow_external_call():
    await asyncio.sleep(2) # Simulate a slow I/O operation
    return {"message": "Data from slow call"}

@app.get("/async-data")
async def get_async_data():
    # This call will not block the server from handling other requests
    result = await slow_external_call()
    return result

@app.get("/sync-but-can-call-async")
def get_sync_data_calling_async():
    # FastAPI is smart enough to run this in a threadpool if it calls async code
    # However, it's generally better to make the path operation async if it involves await.
    # This is a simplified example.
    # loop = asyncio.get_event_loop()
    # result = loop.run_until_complete(slow_external_call())
    # This direct call won't work as expected in a sync def without proper handling.
    # For true async operations, the endpoint itself should be async.
    return {"message": "Sync endpoint placeholder for calling async (see notes)"}

```

## Benefits
- **Improved Performance:** For I/O-bound tasks, async operations can significantly improve the throughput of your application, allowing it to handle more concurrent requests.
- **Responsiveness:** The server remains responsive to other requests while waiting for slow operations to complete.

## When to Use `async def`
- If your path operation function needs to `await` an I/O-bound operation (e.g., database query, HTTP request to another service).
- If you are using libraries that are designed to be used with `async/await` (e.g., `httpx`, `asyncpg`).

If your function is CPU-bound or uses blocking I/O libraries, FastAPI will automatically run it in an external threadpool to avoid blocking the event loop.

Placeholder content for "Async Endpoints". This section explains how to define asynchronous path operations in FastAPI using `async def`, and the benefits of doing so for I/O-bound tasks.
