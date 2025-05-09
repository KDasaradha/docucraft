---
title: Async Endpoints in FastAPI
---

# Async Endpoints in FastAPI

**Original Description**: Writing asynchronous endpoints using `async def` for non-blocking operations.

FastAPI is built from the ground up to support asynchronous programming using Python's `async` and `await` keywords. This allows you to write highly concurrent and efficient I/O-bound applications.

## Write an async FastAPI endpoint that fetches data from an external API.

To demonstrate an async endpoint, we'll use the `httpx` library, which is a modern, async-capable HTTP client for Python. First, you'll need to install it: `pip install httpx`.

```python
# main.py
import httpx
from fastapi import FastAPI, HTTPException

app = FastAPI()

# External API URL (example: JSONPlaceholder for fake data)
EXTERNAL_API_URL_USERS = "https://jsonplaceholder.typicode.com/users"
EXTERNAL_API_URL_TODOS = "https://jsonplaceholder.typicode.com/todos"

# Define an async path operation function
@app.get("/external-users/{user_id}")
async def get_external_user(user_id: int):
    """
    Fetches a user from an external API asynchronously.
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{EXTERNAL_API_URL_USERS}/{user_id}")
            response.raise_for_status() # Raises an HTTPStatusError for 4xx/5xx responses
            user_data = response.json()
            return user_data
        except httpx.HTTPStatusError as exc:
            raise HTTPException(
                status_code=exc.response.status_code,
                detail=f"Error fetching user from external API: {exc.response.text}"
            )
        except httpx.RequestError as exc:
            # For network errors, timeouts, etc.
            raise HTTPException(
                status_code=503, # Service Unavailable
                detail=f"External API request failed: {exc}"
            )

@app.get("/combined-data/{user_id}")
async def get_combined_data(user_id: int):
    """
    Fetches user data and their todos from external APIs concurrently.
    """
    async with httpx.AsyncClient() as client:
        try:
            # Make two API calls concurrently
            user_response_task = client.get(f"{EXTERNAL_API_URL_USERS}/{user_id}")
            todos_response_task = client.get(f"{EXTERNAL_API_URL_TODOS}?userId={user_id}")

            user_response = await user_response_task
            todos_response = await todos_response_task
            
            user_response.raise_for_status()
            todos_response.raise_for_status()
            
            user_data = user_response.json()
            todos_data = todos_response.json()
            
            return {"user": user_data, "todos": todos_data}
        
        except httpx.HTTPStatusError as exc:
            # Simplified error handling for brevity
            raise HTTPException(
                status_code=exc.response.status_code,
                detail=f"Error fetching combined data: {exc.response.text}"
            )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"External API request failed for combined data: {exc}")

# To run: uvicorn main:app --reload
# Test endpoints:
# - http://127.0.0.1:8000/external-users/1
# - http://127.0.0.1:8000/combined-data/1
```

**Explanation:**

1.  **`async def get_external_user(...)`**: The keyword `async` before `def` declares this function as an asynchronous coroutine.
2.  **`httpx.AsyncClient()`**: We use `httpx.AsyncClient` which provides asynchronous methods for making HTTP requests. It's used within an `async with` block to ensure the client session session is properly closed.
3.  **`response = await client.get(...)`**: The `await` keyword pauses the execution of `get_external_user` here, allowing the event loop to work on other tasks while the HTTP request to the external API is in progress. Once the external API responds, execution resumes.
4.  **`response.raise_for_status()`**: This is a convenient way to check if the HTTP response indicated an error (status codes 400-599) and raise an `httpx.HTTPStatusError` if so.
5.  **Concurrent Calls (`get_combined_data`)**: In `get_combined_data`, we initiate two API calls (`user_response_task` and `todos_response_task`) without `await`ing them immediately. This allows both requests to be sent out and processed by the external server "concurrently" (or in parallel from the perspective of our service). Then, `await user_response_task` and `await todos_response_task` wait for their respective completions. This is more efficient than awaiting them sequentially. (For more complex scenarios with many concurrent tasks, `asyncio.gather` is often used.)

## When should you use `async def` instead of `def` in FastAPI endpoints?

You should use `async def` for your FastAPI path operation functions when your endpoint needs to perform **I/O-bound operations** and you want to achieve concurrency. I/O-bound operations are tasks where the program spends most of its time waiting for input/output operations to complete, rather than performing CPU-intensive computations.

**Use `async def` when your endpoint:**

1.  **Makes Network Requests**:
    *   Calls other external APIs (microservices, third-party services) using an async HTTP client (like `httpx`).
    *   Queries a database using an async database driver (e.g., `asyncpg` for PostgreSQL, `aiomysql` for MySQL, `motor` for MongoDB with `asyncio`).
2.  **Reads from or Writes to Files Asynchronously**: Using libraries like `aiofiles`.
3.  **Communicates over WebSockets**: If the endpoint itself is a WebSocket handler.
4.  **Uses `await` for other coroutines**: If it needs to call and `await` other `async` functions (e.g., helper functions that perform async I/O).
5.  **Needs to `await asyncio.sleep()`**: For example, to introduce a delay without blocking the entire server.
6.  **Interacts with Message Queues Asynchronously**: Using async libraries for RabbitMQ, Kafka, etc.

**When you might use regular `def` (synchronous function):**

1.  **CPU-Bound Tasks**: If the endpoint performs computationally intensive tasks that keep the CPU busy (e.g., complex calculations, image processing with a synchronous library, machine learning inference with a synchronous model). Making such an endpoint `async` without offloading the CPU-bound work to a separate thread or process pool won't provide concurrency benefits and might even hinder performance due to event loop overhead.
2.  **Only Synchronous Libraries Available**: If you are interacting with libraries that only offer synchronous APIs (e.g., a traditional blocking database driver or an old SDK).
3.  **Very Simple, Quick Operations**: For endpoints that do minimal work and return quickly without any I/O (e.g., returning a fixed piece of data or a very simple calculation).

**FastAPI's Handling of Sync Endpoints:**

It's important to note that FastAPI is smart about handling regular `def` (synchronous) path operations. If you declare an endpoint with `def`, FastAPI will run it in an **external thread pool** and `await` it internally. This prevents a blocking synchronous endpoint from freezing the entire server's event loop.

So, you *can* use `def` for I/O-bound operations with blocking libraries, and FastAPI will make it work without completely stalling. However, for optimal performance and resource utilization with I/O-bound tasks, `async def` with non-blocking async libraries is generally preferred because it avoids the overhead of switching to and managing a thread pool for each such request.

**Rule of Thumb:**
*   If your code involves `await` (for I/O operations), your function *must* be `async def`.
*   If your code is I/O-bound and you have async libraries available, use `async def`.
*   If your code is CPU-bound or only uses sync libraries, `def` is fine, and FastAPI will handle it. For long-running CPU-bound tasks in a `def` endpoint, consider offloading to a background task or process pool to avoid blocking the thread pool worker for too long.

## How does FastAPI handle concurrent requests with async endpoints?

FastAPI, running on an ASGI server like Uvicorn, handles concurrent requests with `async` endpoints primarily through Python's `asyncio` event loop. Here's a simplified explanation:

1.  **Single Process, Single Event Loop (Typically)**:
    *   By default, Uvicorn often runs a single Python process (though it can be configured to run multiple worker processes for CPU utilization across cores).
    *   Within each process, there's a single `asyncio` event loop. This event loop is responsible for managing and executing asynchronous tasks (coroutines).

2.  **Receiving Requests**:
    *   The ASGI server (Uvicorn) listens for incoming network connections (HTTP requests).
    *   When a new request arrives, Uvicorn passes it to the FastAPI application.

3.  **Task Creation**:
    *   FastAPI identifies the appropriate `async def` path operation function for the request.
    *   This `async` function (coroutine) is scheduled as a task on the event loop.

4.  **Cooperative Multitasking**:
    *   The event loop runs one task at a time.
    *   When an `async` task (your endpoint code) reaches an `await` expression for an I/O-bound operation (e.g., `await client.get(...)` or `await db.execute(...)` with an async driver), it **yields control back to the event loop**.
    *   This means the task is paused at that `await` point, but the event loop is now free to pick up and run another pending task (e.g., another incoming request that has been scheduled, or a previously paused task whose I/O operation has completed).

5.  **Handling Multiple Requests**:
    *   If multiple requests arrive close together, each corresponding `async` endpoint function becomes a task on the event loop.
    *   The event loop can switch between these tasks rapidly whenever one of them `await`s an I/O operation.
    *   For example:
        *   Request A starts, makes an external API call, and `await`s the response.
        *   Event loop pauses Request A, picks up Request B.
        *   Request B starts, queries a database asynchronously, and `await`s the result.
        *   Event loop pauses Request B.
        *   If the external API for Request A responds, the event loop can resume Request A.
        *   And so on.

6.  **No True Parallelism (in a single thread)**:
    *   It's crucial to understand that within a single Python process and a single event loop, the code is not running in true parallel (simultaneously on multiple CPU cores). Instead, it's **concurrent** – tasks are interleaved, making progress while others are waiting for I/O.
    *   This is highly effective for I/O-bound workloads because CPU cores are not sitting idle waiting for network or disk operations.

7.  **Scaling with Multiple Workers**:
    *   To leverage multiple CPU cores, you typically run multiple Uvicorn worker processes (e.g., using Gunicorn as a process manager for Uvicorn workers, or Uvicorn's own `--workers` option). Each worker process will have its own event loop and can handle a set of concurrent requests. A load balancer (like Nginx) would distribute incoming requests among these worker processes.

**Benefits of this Model:**

*   **High Concurrency**: Can handle many thousands of simultaneous connections with relatively low memory overhead per connection compared to traditional thread-based models for I/O-bound tasks.
*   **Efficiency for I/O-Bound Workloads**: CPU is not wasted waiting for I/O.
*   **Responsive Applications**: Even under load, the application can remain responsive to new requests because the event loop isn't blocked by long-waiting operations.

This cooperative multitasking model is the foundation of FastAPI's ability to deliver high performance for web APIs that primarily deal with network communication and database interactions.

## What is the difference between synchronous and asynchronous endpoints in FastAPI? / Provide an example of a synchronous and an asynchronous FastAPI endpoint.

The primary difference lies in how they handle operations, especially I/O-bound ones, and how FastAPI executes them.

**Synchronous (`def`) Endpoints:**

*   **Execution**: When a request hits a synchronous endpoint, FastAPI runs it in a separate thread from an external thread pool. This prevents the synchronous (potentially blocking) code from freezing the main asyncio event loop.
*   **Blocking Behavior**: If a synchronous endpoint performs a blocking I/O operation (e.g., using the standard `requests.get()` or a synchronous database call), the thread executing that endpoint will block until the I/O operation completes. During this time, that specific thread cannot do any other work.
*   **Concurrency Model**: Concurrency is achieved by the thread pool. If you have many concurrent requests to synchronous, blocking endpoints, you might exhaust the threads in the pool, leading to requests waiting for an available thread.
*   **Use Cases**:
    *   CPU-bound tasks.
    *   Using synchronous libraries that don't have async alternatives.
    *   Simple, quick operations with no significant I/O.

**Asynchronous (`async def`) Endpoints:**

*   **Execution**: Asynchronous endpoints are coroutines that run directly on the asyncio event loop managed by the ASGI server (e.g., Uvicorn).
*   **Non-Blocking Behavior**: When an `async` endpoint encounters an `await` for an I/O-bound operation (using an async library), it yields control to the event loop. The event loop can then work on other tasks. The endpoint resumes when the awaited operation completes.
*   **Concurrency Model**: Concurrency is achieved through cooperative multitasking on the single event loop (per process). It can handle many concurrent I/O-bound operations efficiently without needing many threads.
*   **Use Cases**:
    *   I/O-bound tasks (network calls, database operations with async drivers, file I/O with async libraries).
    *   Applications requiring high concurrency and responsiveness.

**Example:**

Let's illustrate with a simple example that simulates work.

```python
# main.py
import time
import asyncio
from fastapi import FastAPI

app = FastAPI()

# --- Synchronous Endpoint ---
@app.get("/sync-task/")
def run_sync_task():
    """
    A synchronous endpoint that simulates some blocking work.
    FastAPI runs this in a separate thread from a thread pool.
    """
    print("Sync task started...")
    time.sleep(2)  # Simulates a blocking I/O operation or CPU-bound work
    print("Sync task finished.")
    return {"message": "Synchronous task completed after 2 seconds."}

# --- Asynchronous Endpoint ---
@app.get("/async-task/")
async def run_async_task():
    """
    An asynchronous endpoint that simulates non-blocking I/O work.
    This runs on the main event loop.
    """
    print("Async task started...")
    await asyncio.sleep(2)  # Simulates an async, non-blocking I/O operation
    print("Async task finished.")
    return {"message": "Asynchronous task completed after 2 seconds."}

# --- Asynchronous Endpoint with Blocking Call (BAD PRACTICE) ---
@app.get("/async-blocking-task/")
async def run_async_blocking_task():
    """
    An ASYNC endpoint that makes a SYNCHRONOUS blocking call.
    This is BAD PRACTICE as it will block the event loop.
    """
    print("Async blocking task started...")
    time.sleep(2) # This is a sync/blocking sleep, it will block the event loop!
    print("Async blocking task finished.")
    return {"message": "Async task with blocking call completed (event loop was blocked)."}

# To run: uvicorn main:app --reload
# Try accessing these endpoints in quick succession:
# 1. http://127.0.0.1:8000/sync-task/
# 2. http://127.0.0.1:8000/async-task/
# 3. http://127.0.0.1:8000/async-blocking-task/

# If you call /async-task/ multiple times quickly, you'll see the "Async task started..."
# messages appear rapidly, and then after ~2 seconds, the "Async task finished." messages
# will appear as each task completes. The server remains responsive to new /async-task/ requests
# while others are "sleeping".

# If you call /sync-task/ multiple times quickly, each request will occupy a thread from
# the thread pool for ~2 seconds. The server remains responsive because these are offloaded.

# If you call /async-blocking-task/ multiple times quickly, you'll observe that the
# server becomes unresponsive for 2 seconds after each call, because time.sleep() blocks
# the entire event loop. New requests (even to other async endpoints) will be stalled.
```

**Key Takeaway on Differences:**

*   **`def` (Sync)**: FastAPI runs it in a thread pool. Good for CPU-bound work or using blocking libraries. The thread blocks during I/O.
*   **`async def` (Async)**: Runs on the event loop. Ideal for I/O-bound work with `async` libraries. Yields control during `await` on I/O, allowing other tasks to run.
*   **Critical Point**: **Never call blocking I/O operations directly inside an `async def` path operation without `await`ing an async version of that operation.** Doing so will block the entire event loop, negating the benefits of `asyncio`. If you must use blocking code within an `async def` function (e.g., a library that doesn't have an async API), FastAPI provides `fastapi.concurrency.run_in_threadpool` to correctly offload it to the thread pool.
