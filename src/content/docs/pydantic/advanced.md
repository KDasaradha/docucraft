---
title: Pydantic - Advanced
---

# Pydantic - Advanced Topics

Key topics for advanced Pydantic include:

- Custom Data Types and `GetJsonSchemaHandler` / `__get_pydantic_core_schema__`
- Advanced Validation with `@field_validator` and `@model_validator` (Pydantic v2)
- Data Serialization Customization:
    - `model_serializer` (Pydantic v2) or `json_encoders` in `Config` (Pydantic v1)
    - Controlling output: `include`, `exclude`, `exclude_unset`, `exclude_defaults`, `exclude_none`
    - `@computed_field` for dynamic attributes
- Strict Types and Coercion Control
- Dataclasses integration (`pydantic.dataclasses.dataclass`)
- Plugins and Ecosystem (e.g., `pydantic-settings`, `pydantic-extra-types`)
- Performance Considerations and Optimizations
- Using Pydantic with `TypedDict` and `NamedTuple`
- Generating JSON Schema (`.model_json_schema()`)
- Internationalization (i18n) with Pydantic errors
