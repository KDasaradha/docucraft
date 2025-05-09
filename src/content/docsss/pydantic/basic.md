---
title: Basic Pydantic
description: Introduction to Pydantic for data validation and settings management.
order: 1
---

# Basic Pydantic

Pydantic is a data validation and settings management library using Python type annotations. It enforces type hints at runtime, and provides user-friendly errors when data is invalid.

This section covers the basic usage of Pydantic models for data validation.

```python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str = 'John Doe'
    signup_ts: datetime | None = None
    friends: list[int] = []

external_data = {
    'id': '123',
    'signup_ts': '2022-12-22 12:22',
    'friends': [1, 2, '3'],
}
user = User(**external_data)
print(user.id)
#> 123
print(repr(user.signup_ts))
#> datetime.datetime(2022, 12, 22, 12, 22)
print(user.friends)
#> [1, 2, 3]
```

Placeholder content for "Basic Pydantic".
