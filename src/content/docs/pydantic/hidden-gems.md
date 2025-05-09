---
title: Pydantic - Hidden Gems
---

# Pydantic - Hidden Gems & Lesser-Known Features

Key hidden gems and lesser-known Pydantic features include:

- `SecretStr` and `SecretBytes` for sensitive data
- `constr`, `conint`, `confloat`, `conlist`, `condate` for constrained types
- `PositiveInt`, `NegativeFloat`, `StrictBool`, etc.
- `AnyUrl`, `EmailStr`, `Json` and other specific type validators
- `model_construct()` for creating models without validation (use with caution)
- `model_copy()` for deep copying models
- `model_validate_json` and `model_validate_strings` (Pydantic v2)
- `RootModel` for validating non-mapping types at the root
- `TypeAdapter` for validating arbitrary types without a `BaseModel`
- `Field(..., validation_alias='...')` and `Field(..., serialization_alias='...')`
- Using `alias_priority` in `Field`
- `model_fields_set` to check which fields were explicitly set
- `model_config` settings like `validate_assignment`, `revalidate_models`
- `dump_mode='json'` vs `dump_mode='python'` in `model_dump`
- `warnings` argument in `model_dump`
