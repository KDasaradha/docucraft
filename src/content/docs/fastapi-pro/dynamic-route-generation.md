---
title: Dynamic Route Generation in FastAPI
---

# Dynamic Route Generation in FastAPI

**Original Description**: Techniques for dynamically generating FastAPI routes based on configuration, database schemas, or other sources at runtime or startup.

While FastAPI's primary way of defining routes is through decorators (`@app.get`, `@app.post`, etc.) on functions, which are typically defined when the Python module is imported, there are scenarios where you might want to generate routes dynamically. This could be based on external configuration, database schemas, plugins, or other sources determined at application startup or even runtime (though runtime route changes are complex and less common).

**Methods for Dynamic Route Generation:**

1.  **Generating Routes at Startup (Most Common & Recommended)**:
    *   **Concept**: Read configuration (e.g., from a YAML file, database table, environment variables) or introspect something (like available plugins or data models) *during application startup*. Based on this information, programmatically add routes to your FastAPI app or an `APIRouter`.
    *   **Mechanism**: Use `app.add_api_route()` or `router.add_api_route()`. This method allows you to define a route programmatically, specifying the path, endpoint function, HTTP methods, and other parameters usually handled by decorators.

    *   **Example: Generating routes from a configuration dictionary:**

        ```python
        from fastapi import FastAPI, APIRouter, Request
        from typing import Dict, Any, Callable

        app = FastAPI()
        dynamic_router = APIRouter()

        # --- Simulate dynamic configuration ---
        # This could be loaded from YAML, JSON, DB, etc. at startup
        DYNAMIC_ENDPOINTS_CONFIG: Dict[str, Dict[str, Any]] = {
            "dynamic_users": {
                "path": "/dynamic/users",
                "methods": ["GET"],
                "response_message": "List of dynamic users",
                "handler_name": "get_dynamic_users" # Name matching a handler function below
            },
            "dynamic_products": {
                "path": "/dynamic/products/{product_id}",
                "methods": ["GET", "POST"],
                "response_message": "Dynamic product endpoint",
                "handler_name": "handle_dynamic_product"
            },
            "admin_only": {
                 "path": "/dynamic/admin",
                 "methods": ["GET"],
                 "response_message": "Admin Area",
                 "handler_name": "get_admin_area",
                 "tags": ["Admin", "Dynamic"] # Example: Adding tags
            }
        }

        # --- Define potential handler functions ---
        # These functions need to exist and have compatible signatures 
        # for the routes being generated.
        
        async def get_dynamic_users(request: Request):
             # Logic to fetch users dynamically
            print(f"Handler 'get_dynamic_users' called for {request.url.path}")
            return {"message": DYNAMIC_ENDPOINTS_CONFIG["dynamic_users"]["response_message"], "users": []}

        async def handle_dynamic_product(product_id: int, request: Request):
             # Logic to handle GET/POST for a product
            print(f"Handler 'handle_dynamic_product' called for {request.url.path} (Method: {request.method})")
            if request.method == "GET":
                 return {"message": f"Details for dynamic product {product_id}", "product_id": product_id}
            elif request.method == "POST":
                 # In a real app, parse request body
                 return {"message": f"Created/Updated dynamic product {product_id}", "product_id": product_id}

        async def get_admin_area():
            print("Handler 'get_admin_area' called.")
            return {"message": "Welcome to the Dynamic Admin Area"}


        # Mapping handler names to functions
        HANDLER_MAP: Dict[str, Callable] = {
            "get_dynamic_users": get_dynamic_users,
            "handle_dynamic_product": handle_dynamic_product,
            "get_admin_area": get_admin_area
        }

        # --- Function to generate routes dynamically ---
        def generate_routes_from_config(router: APIRouter, config: Dict[str, Dict[str, Any]]):
            print("Generating dynamic routes...")
            for endpoint_name, details in config.items():
                path = details.get("path")
                methods = details.get("methods")
                handler_name = details.get("handler_name")
                tags = details.get("tags", ["Dynamic"]) # Default tag

                if not all([path, methods, handler_name]):
                    print(f"Warning: Skipping incomplete config for '{endpoint_name}'")
                    continue
                    
                handler_func = HANDLER_MAP.get(handler_name)
                if not handler_func:
                     print(f"Warning: Handler function '{handler_name}' not found for endpoint '{endpoint_name}'. Skipping.")
                     continue

                print(f"  Adding route: {methods} {path} -> {handler_name}")
                router.add_api_route(
                    path=path,
                    endpoint=handler_func,
                    methods=methods,
                    tags=tags,
                    name=endpoint_name # Optional: route name
                    # You can add other parameters like response_model, status_code etc.
                )

        # Generate the routes when the module loads or during startup event
        generate_routes_from_config(dynamic_router, DYNAMIC_ENDPOINTS_CONFIG)

        # Include the router containing dynamic routes
        app.include_router(dynamic_router)

        # --- Standard route for comparison ---
        @app.get("/static/route")
        async def static_route():
            return {"message": "This is a static route"}

        # To run: uvicorn main:app --reload
        # Access:
        # /dynamic/users (GET)
        # /dynamic/products/123 (GET, POST)
        # /dynamic/admin (GET)
        # /docs (See the dynamic routes listed under the "Dynamic" or "Admin" tag)
        ```

2.  **Using Custom `APIRoute` Classes (Advanced)**:
    *   **Concept**: You can create a subclass of `fastapi.routing.APIRoute` and override methods like `handle()` or `dependant` to customize how requests are matched and handled at a lower level. This could potentially allow for more complex runtime routing decisions, but it's intricate and often less maintainable.
    *   **Use Case**: Implementing highly specialized routing logic, like routing based on complex header patterns or integrating with external routing systems. This is rarely needed for typical dynamic route generation.

3.  **Mounting Sub-Applications**:
    *   **Concept**: You can dynamically create and mount entire FastAPI sub-applications using `app.mount()`. Each sub-app could represent a dynamically loaded plugin or feature set.
    *   **Use Case**: Plugin systems where each plugin provides its own set of endpoints under a specific path prefix.

    ```python
    from fastapi import FastAPI

    app = FastAPI()

    # Simulate dynamic loading of plugin apps
    plugin_configs = {
         "plugin_a": {"prefix": "/plugina", "module": "plugins.plugin_a"},
         "plugin_b": {"prefix": "/pluginb", "module": "plugins.plugin_b"},
    }

    for name, config in plugin_configs.items():
         try:
             # Dynamically import the plugin's module and get its app instance
             plugin_module = __import__(config["module"], fromlist=["app"])
             plugin_app = getattr(plugin_module, "app", None) # Assume plugin defines 'app = FastAPI()'
             if plugin_app:
                  app.mount(config["prefix"], plugin_app, name=name)
                  print(f"Mounted plugin '{name}' at {config['prefix']}")
             else:
                  print(f"Warning: Could not find 'app' instance in plugin '{name}'")
         except ImportError as e:
             print(f"Warning: Could not import plugin '{name}': {e}")

    @app.get("/")
    async def root():
         return {"message": "Main app. Check mounted plugin paths like /plugina/..."}
         
    # --- Example plugin_a.py ---
    # from fastapi import FastAPI
    # app = FastAPI()
    # @app.get("/")
    # async def plugin_a_root(): return {"plugin": "A"}
    ```

**Considerations:**

*   **Complexity**: Dynamic routing adds complexity compared to static decorator-based routing. Ensure the benefits outweigh the added maintenance overhead.
*   **Discoverability**: Dynamically generated routes might be harder to discover statically (e.g., by IDEs) unless well-documented or introspectable. FastAPI's automatic OpenAPI documentation helps significantly here if using `add_api_route`.
*   **Startup Time**: Generating many routes at startup can increase application initialization time.
*   **Error Handling**: Ensure robust error handling during the route generation process (e.g., handling missing handlers, invalid configuration).
*   **Maintainability**: Clearly document how routes are generated and where the corresponding handler logic resides.

For most use cases requiring dynamic routes (like CRUD endpoints for multiple models or routes based on configuration), generating them **at startup** using `app.add_api_route` based on configuration or introspection is the most practical and maintainable approach with FastAPI.

    