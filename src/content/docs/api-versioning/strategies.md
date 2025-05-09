---
title: API Versioning Strategies in FastAPI
---

# API Versioning Strategies in FastAPI

**Original Description**: Implementing different API versioning strategies in FastAPI (URL path, query parameter, header).

API versioning is crucial for evolving your API over time without breaking existing clients that depend on older versions. When you introduce breaking changes (e.g., changing response formats, altering endpoint behavior, removing fields), you need a way for clients to continue using the old version while newer clients can adopt the new one.

FastAPI doesn't dictate a single versioning strategy, but its flexibility allows implementing common approaches easily.

**Common API Versioning Strategies:**

1.  **URL Path Versioning:**
    *   **Concept**: Include the API version directly in the URL path, typically as the first segment after the base URL.
    *   **Examples**:
        *   `https://api.example.com/v1/users/`
        *   `https://api.example.com/v2/users/`
    *   **Implementation in FastAPI**: Use separate `APIRouter` instances for each version and include them in the main app with a versioned prefix.

        ```python
        from fastapi import FastAPI, APIRouter

        app = FastAPI(title="Versioned API Demo")

        # --- Version 1 Router ---
        router_v1 = APIRouter(prefix="/v1", tags=["v1"])

        @router_v1.get("/items/{item_id}")
        async def read_item_v1(item_id: int):
            return {"version": "v1", "item_id": item_id, "data": f"Data for item {item_id} (V1 format)"}

        @router_v1.get("/legacy")
        async def read_legacy_v1():
             return {"version": "v1", "message": "This is a V1 legacy endpoint"}


        # --- Version 2 Router ---
        router_v2 = APIRouter(prefix="/v2", tags=["v2"])

        @router_v2.get("/items/{item_id}")
        async def read_item_v2(item_id: int, details: bool = False): # Added query param in v2
            response = {"version": "v2", "item_id": item_id, "info": f"Enhanced info for item {item_id} (V2)"}
            if details:
                response["details"] = {"extra": "Some V2 specific details"}
            return response

        # Note: The /legacy endpoint is removed in v2


        # --- Include routers in the main app ---
        app.include_router(router_v1)
        app.include_router(router_v2)

        @app.get("/")
        async def root():
            return {"message": "Welcome! API versions available at /v1 and /v2"}

        # To run: uvicorn main:app --reload
        # Access /v1/items/1, /v2/items/1, /v1/legacy, /v2/items/1?details=true
        # Check /docs - endpoints will be grouped by tags "v1" and "v2".
        ```
    *   **Pros**: Explicit and clear versioning visible directly in the URL. Easy for clients and developers to understand. Well-supported by browser caching and routing infrastructure. Arguably the most common and straightforward method.
    *   **Cons**: Can "pollute" the URL space. Managing routes across multiple version routers can require good organization.

2.  **Query Parameter Versioning:**
    *   **Concept**: Specify the API version using a query parameter in the URL.
    *   **Examples**:
        *   `https://api.example.com/users?version=1`
        *   `https://api.example.com/users?api-version=2.1`
    *   **Implementation in FastAPI**: You typically need middleware or dependencies to inspect the query parameter and route the request to the appropriate handler logic. This can become complex to manage cleanly within FastAPI's routing structure compared to path versioning. You might end up with large `if/elif` blocks in your endpoint based on the version parameter, or more complex dependency logic.

    *   **Pros**: Keeps the base URL clean.
    *   **Cons**: Less explicit than path versioning. Can make caching trickier if not handled carefully by caching layers. Can lead to more complex routing logic within the application code itself rather than using FastAPI's routing structure effectively. Generally less common for major versioning than path or header versioning.

3.  **Header Versioning:**
    *   **Concept**: Specify the API version using a custom HTTP header (e.g., `Accept-Version`, `X-API-Version`) or via the standard `Accept` header with a custom media type.
    *   **Examples**:
        *   `GET /users` with header `X-API-Version: 1`
        *   `GET /users` with header `Accept: application/vnd.example.v2+json`
    *   **Implementation in FastAPI**: Similar to query parameter versioning, this usually requires middleware or dependencies to read the header and direct the request accordingly.

        ```python
        # Conceptual Middleware for Header Versioning (Simplified)
        from fastapi import FastAPI, Request, Depends, Header
        from starlette.responses import JSONResponse
        from typing import Optional

        app = FastAPI()

        async def route_v1_logic(item_id: int):
             return {"version": "v1", "item_id": item_id, "data": "V1 data"}
             
        async def route_v2_logic(item_id: int):
             return {"version": "v2", "item_id": item_id, "info": "V2 info"}

        # --- Using a Dependency ---
        async def get_versioned_logic(item_id: int, x_api_version: Optional[str] = Header(None)):
            print(f"Header X-API-Version: {x_api_version}")
            if x_api_version == "2":
                return await route_v2_logic(item_id)
            else: # Default to v1 or handle error if version required
                return await route_v1_logic(item_id)

        @app.get("/items/{item_id}")
        async def read_item_via_header(response: dict = Depends(get_versioned_logic)):
            return response # Response generated by the selected versioned logic

        # --- Alternative using Middleware (More complex to route precisely) ---
        # @app.middleware("http")
        # async def header_version_middleware(request: Request, call_next):
        #     api_version = request.headers.get("x-api-version", "1") # Default to v1
        #     # Problem: How to call the *correct* endpoint function based on version?
        #     # Middleware runs *before* routing typically.
        #     # You might need to modify request scope or handle routing manually, which is complex.
        #     # Using dependencies (as above) is often cleaner for logic switching.
        #     response = await call_next(request)
        #     return response
        ```
    *   **Pros**: Keeps URLs clean. Some argue it's more "RESTful" as the URL identifies the resource, and the header specifies the representation (version).
    *   **Cons**: Version is not immediately visible in the URL, making it harder to test directly in a browser or share links. Requires clients to set headers correctly. Middleware implementation can be complex if needing to modify routing targets.

**Choosing a Strategy:**

*   **URL Path Versioning (`/v1/`, `/v2/`)** is generally the most common, explicit, and easiest to manage method, especially with FastAPI's `APIRouter`. It's recommended for most use cases, particularly for major version changes.
*   **Header Versioning** is a valid alternative, often preferred by API purists, but requires more effort from clients and potentially more complex server-side handling (middleware/dependencies) for routing logic.
*   **Query Parameter Versioning** is less common and often considered less clean for major versioning compared to the other two methods.

**Best Practices for Versioning:**

*   **Be Consistent**: Choose one strategy and apply it consistently across your API.
*   **Document Clearly**: Make sure your API documentation clearly explains how versioning works and how clients should specify the version. FastAPI's tagging with routers helps here for path versioning.
*   **Semantic Versioning**: Consider using semantic versioning (e.g., `v1`, `v2.1`) although major versions (`v1`, `v2`) are most common in API paths/headers.
*   **Deprecation Policy**: Have a clear policy for deprecating and eventually removing old API versions, communicating timelines to your clients.
*   **Code Organization**: Structure your code logically based on versions (e.g., separate modules or routers for v1 and v2 logic) to keep it maintainable.
*   **Testing**: Ensure your tests cover different API versions.

    