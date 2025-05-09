---
title: FastAPI - Hidden Gems
---

# FastAPI - Hidden Gems & Lesser-Known Features

Key hidden gems and lesser-known FastAPI features include:

- `Annotated` for advanced dependency injection and parameter metadata
- Using `response_model_exclude_unset`, `response_model_by_alias`
- `response_class` parameter for path operations
- `include_in_schema` parameter to hide paths/parameters from docs
- Path operation decorators as functions (e.g., `app.add_api_route`)
- Using `Union` or `Optional` in Pydantic models for flexible request bodies
- Utility functions in `fastapi.encoders` (e.g., `jsonable_encoder`)
- `APIRoute` class for custom route handling
- `Request` object access in path operations for low-level details
- `Response` object directly for fine-grained control
- Callback URLs in OpenAPI
- Support for `Enum` in path and query parameters
- Using `Annotated[..., Depends(...)]` for clearer dependency definitions
- Generating client code from OpenAPI schema
