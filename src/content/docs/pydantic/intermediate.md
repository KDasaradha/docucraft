---
title: Pydantic - Intermediate
---

# Pydantic - Intermediate Concepts

Key topics for intermediate Pydantic include:

- Field Customization: `Field` function (alias, title, description, default_factory, examples)
- Validators: `@validator` decorator (pre, each_item, always)
- Root Validators: `@root_validator` decorator (pre, skip_on_failure)
- Data Conversion (e.g., str to int, automatic parsing of complex types)
- Nested Models
- Recursive Models
- Generic Models (`GenericModel`)
- Model Configuration: `model_config` (or `Config` class in Pydantic v1)
    - `extra`: 'ignore', 'allow', 'forbid'
    - `alias_generator`
    - `populate_by_name` (formerly `allow_population_by_field_name`)
    - `from_attributes` (formerly `orm_mode`) for ORM integration
- Helper Functions: `parse_obj_as`, `parse_raw_as`
- Pydantic Settings Management (`BaseSettings`)
