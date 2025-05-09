---
title: Custom ASGI Middleware in FastAPI/Starlette
---

# Custom ASGI Middleware in FastAPI/Starlette

**Original Description**: Developing custom ASGI middleware beyond FastAPI's standard middleware for low-level request/response handling.

While FastAPI provides the convenient `@app.middleware("http")` decorator and `BaseHTTPMiddleware` class for common middleware needs, sometimes you require lower-level access or need to implement middleware conforming directly to the ASGI (Asynchronous Server Gateway Interface) specification. This is particularly relevant if you need to interact with the raw ASGI `scope`, `receive`, and `send` awaitables, perhaps for handling non-HTTP protocols (like WebSockets at a deeper level) or implementing very specific, performance-critical transformations.

FastAPI is built on Starlette, and Starlette uses the ASGI standard. Therefore, writing pure ASGI middleware means creating something compatible with Starlette/ASGI, not just FastAPI's higher-level abstractions.

**ASGI Specification Overview:**

An ASGI application (or middleware) is typically an awaitable callable (like an `async` function or a class with an `async def __call__`) that takes three arguments:

1.  **`scope` (dict)**: A dictionary containing information about the incoming connection/request (e.g., type ('http', 'websocket'), path, headers, client address). The content depends on the connection type.
2.  **`receive` (awaitable callable)**: An awaitable function that the application calls to receive event messages from the client (e.g., HTTP request body chunks, WebSocket messages).
3.  **`send` (awaitable callable)**: An awaitable function that the application calls to send event messages back to the client (e.g., HTTP response start, response body chunks, WebSocket messages).

**Structure of Pure ASGI Middleware:**

A pure ASGI middleware wraps another ASGI application (the 'next app' in the chain, which could be another middleware or the final FastAPI/Starlette application). It receives the `scope`, `receive`, and `send` intended for the next app. It can then:

*   Inspect or modify the `scope` before passing it down.
*   Intercept, inspect, modify, or generate messages using its own `receive` and `send` functions that wrap the originals.

**Example: Simple ASGI Middleware to Add a Header**

```python
import typing
from fastapi import FastAPI

Scope = typing.MutableMapping[str, typing.Any]
Message = typing.MutableMapping[str, typing.Any]
Receive = typing.Callable[[], typing.Awaitable[Message]]
Send = typing.Callable[[Message], typing.Awaitable[None]]
ASGIApp = typing.Callable[[Scope, Receive, Send], typing.Awaitable[None]]


class PureASGIMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app # The next ASGI application in the chain

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        # Only act on HTTP requests
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # We need to wrap the 'send' awaitable to intercept response messages
        original_send = send
        has_sent_start = False # Flag to track if response start has been sent

        async def modified_send(message: Message):
            nonlocal has_sent_start
            
            # Intercept the first message ('http.response.start')
            if message["type"] == "http.response.start" and not has_sent_start:
                 has_sent_start = True
                 # Get existing headers (immutable tuple of bytes), convert to mutable list
                 headers = list(message.get("headers", [])) 
                 
                 # Add our custom header (encode header name/value to bytes)
                 headers.append((b"X-Pure-ASGI-Middleware", b"Processed"))
                 
                 # Update the headers in the message
                 message["headers"] = headers
                 print(f"Pure ASGI Middleware: Added header to {scope.get('path', '')}")

            # Call the original send function with the (potentially modified) message
            await original_send(message)

        # Call the next app in the chain, passing our modified_send
        await self.app(scope, receive, modified_send)

# --- FastAPI App Setup ---
app = FastAPI()

# Add the pure ASGI middleware
# IMPORTANT: Pure ASGI middleware is added differently than BaseHTTPMiddleware
# It wraps the entire application.
app.add_middleware(PureASGIMiddleware) 
# Note: Middleware order matters. Middlewares added first wrap outer layers.

@app.get("/")
async def root():
    return {"message": "Hello World"}

# To run: uvicorn main:app --reload
# Check the response headers for X-Pure-ASGI-Middleware
```

**Explanation:**

1.  **`__init__(self, app: ASGIApp)`**: The middleware takes the next ASGI application (`app`) in the chain as an argument during initialization.
2.  **`async def __call__(self, scope: Scope, receive: Receive, send: Send)`**: This is the main entry point conforming to the ASGI standard.
3.  **Scope Check**: It first checks if the connection type is `http`. If not, it passes the call directly to the next app without interference.
4.  **Wrapping `send`**: The core logic involves intercepting messages sent *back* to the client. We store the original `send` callable and define our own `async def modified_send`.
5.  **`modified_send` Logic**:
    *   It waits for the first message of type `http.response.start`. This message contains the status code and headers.
    *   It converts the immutable header tuple to a mutable list.
    *   It appends the custom header (remembering to encode to bytes).
    *   It updates the `headers` key in the message dictionary.
    *   Crucially, it calls the `original_send(message)` to actually send the (now modified) message down the chain towards the server/client.
6.  **Calling the Next App**: The middleware calls `await self.app(scope, receive, modified_send)`. Notice it passes the original `scope` and `receive`, but passes its *own* `modified_send` function. This ensures that when the underlying application (FastAPI/Starlette) calls `send`, it's actually calling our wrapper.
7.  **Adding Middleware**: Use `app.add_middleware(YourMiddlewareClass)` to add pure ASGI middleware. Don't use the `@app.middleware("http")` decorator.

**When to Use Pure ASGI Middleware:**

*   **Performance-Critical Logic**: For very simple operations where the overhead of `BaseHTTPMiddleware` (which constructs `Request` and `Response` objects) might be measurable (though often negligible).
*   **Handling Non-HTTP Protocols**: Directly interacting with WebSocket scopes (`scope['type'] == 'websocket'`) and messages (`websocket.connect`, `websocket.receive`, `websocket.send`, `websocket.close`) at the raw message level.
*   **Low-Level Request/Response Manipulation**: Intercepting or modifying raw ASGI messages (like streaming request bodies or response bodies piece-by-piece).
*   **Compatibility**: Writing middleware intended to work with any ASGI framework (Starlette, Quart, Django Channels), not just FastAPI.

**Compared to `BaseHTTPMiddleware` / `@app.middleware("http")`:**

*   **Complexity**: Pure ASGI middleware is more complex to write correctly, as you deal with the raw message protocol.
*   **Convenience**: `BaseHTTPMiddleware` is much more convenient for common HTTP tasks, providing easy access to `Request` and `Response` objects with helpful methods and attributes.
*   **Use Case**: Use FastAPI's `BaseHTTPMiddleware` or `@app.middleware("http")` for most standard HTTP middleware tasks (logging, authentication checks, adding headers, CORS). Use pure ASGI middleware only when you specifically need the lower-level control offered by the ASGI protocol itself.

    