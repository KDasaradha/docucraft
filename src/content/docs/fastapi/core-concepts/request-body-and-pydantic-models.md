---
title: Request Body and Pydantic Models
---

# Request Body and Pydantic Models

**Original Description**: Using Pydantic models for request body validation and serialization in FastAPI.

When building APIs, you often need to receive data from clients in the request body, for example, when creating or updating resources (typically with `POST`, `PUT`, `PATCH` requests). FastAPI leverages Pydantic models to define the expected structure, data types, and validation rules for these request bodies.

## Write a Pydantic model for a user with fields for name, email, and age, and use it in a POST endpoint.

Here's how you can define a Pydantic model for a user and use it in a FastAPI `POST` endpoint:

```python
# main.py
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# 1. Define the Pydantic model
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="The full name of the user.")
    email: EmailStr = Field(..., description="The email address of the user.")
    age: Optional[int] = Field(None, gt=0, le=120, description="The age of the user (optional).")
    is_active: bool = Field(True, description="Whether the user account is active.")

    class Config:
        # Pydantic V1: schema_extra / Pydantic V2: json_schema_extra
        # For Pydantic V2, use model_config dictionary
        # model_config = {
        #     "json_schema_extra": {
        #         "examples": [
        #             {
        #                 "name": "John Doe",
        #                 "email": "johndoe@example.com",
        #                 "age": 30,
        #                 "is_active": True,
        #             }
        #         ]
        #     }
        # }
        # For Pydantic V1 compatibility or simplicity in example:
        schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "johndoe@example.com",
                "age": 30,
                "is_active": True,
            }
        }


app = FastAPI()

@app.post("/users/")
async def create_user(user_payload: UserCreate):
    """
    Create a new user.
    The request body should be a JSON object matching the UserCreate schema.
    """
    # At this point, user_payload is an instance of UserCreate.
    # FastAPI has already validated the incoming JSON request body against the UserCreate model.
    # If validation failed, FastAPI would have automatically returned a 422 error.
    
    print(f"Received user data: {user_payload.model_dump()}") 
    # model_dump() (Pydantic V2) or dict() (Pydantic V1) converts the model to a dictionary.

    # In a real application, you would save the user to a database here.
    # For example: new_user = database.create_user(user_payload)

    return {"message": "User created successfully", "user_details": user_payload}

# To run this:
# 1. Save as main.py
# 2. Run: uvicorn main:app --reload
# 3. Go to http://127.0.0.1:8000/docs
# 4. Find the POST /users/ endpoint and try it out with a JSON body like:
#    {
#      "name": "Jane Doe",
#      "email": "jane.doe@example.com",
#      "age": 28
#    }
#    (is_active will default to True if not provided)
```

**Explanation:**

1.  **`UserCreate(BaseModel)`**: We define a class `UserCreate` that inherits from Pydantic's `BaseModel`. This tells Pydantic that this class is a data model.
2.  **Fields with Type Hints**:
    *   `name: str`: Defines a field named `name` that must be a string. `Field(..., min_length=2, max_length=50)` adds validation constraints and a description. `...` as the first argument to `Field` makes it a required field.
    *   `email: EmailStr`: Defines an `email` field. `EmailStr` is a special Pydantic type that validates if the string is a valid email format.
    *   `age: Optional[int] = Field(None, gt=0, le=120)`: Defines an optional `age` field that must be an integer. `Optional[int]` is equivalent to `Union[int, None]`. If not provided in the request, it defaults to `None`. `gt=0` means "greater than 0", `le=120` means "less than or equal to 120".
    *   `is_active: bool = Field(True)`: Defines a boolean field `is_active` with a default value of `True`.
3.  **`@app.post("/users/")`**: This decorator defines a `POST` endpoint.
4.  **`user_payload: UserCreate`**: The crucial part. By type-hinting the `user_payload` parameter with our `UserCreate` model, we instruct FastAPI to:
    *   Expect a JSON object in the request body.
    *   Parse this JSON.
    *   Validate the parsed data against the `UserCreate` model (checking types, required fields, and constraints like `min_length`, `EmailStr` format, `gt`, `le`).
    *   If validation is successful, create an instance of `UserCreate` and pass it to our `create_user` function as `user_payload`.
    *   If validation fails, FastAPI automatically returns an HTTP `422 Unprocessable Entity` error with a detailed JSON body explaining the validation errors.

## How does Pydantic ensure data validation in FastAPI?

Pydantic ensures data validation in FastAPI through a combination of its core features integrated seamlessly by FastAPI:

1.  **Type Hinting**: Pydantic uses Python type hints (`str`, `int`, `bool`, `List[str]`, custom Pydantic types like `EmailStr`, `HttpUrl`, etc.) to understand the expected data types for each field in a model.
2.  **Automatic Type Coercion**: When parsing input data (e.g., from a JSON request body), Pydantic attempts to coerce the input values to the types specified in the model. For example, if a field is type-hinted as `int` and the JSON contains `"123"` (a string), Pydantic will try to convert it to the integer `123`. If coercion fails (e.g., trying to convert `"abc"` to `int`), a validation error occurs.
3.  **Built-in and Custom Validators**:
    *   **Standard Validators**: Pydantic comes with built-in validation for standard Python types and many common complex types (e.g., URLs, UUIDs, datetimes).
    *   **Constrained Types**: Pydantic provides "constrained types" like `constr` (constrained string), `conint` (constrained integer), etc., and helper functions like `Field` allow specifying constraints (e.g., `min_length`, `max_length`, `gt`, `lt`, `pattern` for regex).
    *   **Custom Validators**: You can define custom validator methods within your Pydantic models using decorators like `@field_validator` (Pydantic V2) or `@validator` (Pydantic V1) for field-specific logic, and `@model_validator` (Pydantic V2) or `@root_validator` (Pydantic V1) for model-wide validation. These allow for complex business rule enforcement.
4.  **Error Reporting**: If any validation check fails (type mismatch, constraint violation, custom validator failure), Pydantic raises a `ValidationError`. FastAPI catches this exception and automatically transforms it into a user-friendly JSON response with an HTTP `422 Unprocessable Entity` status code. This response details:
    *   The location of the error (e.g., `body`, `query`, `path`).
    *   The specific field(s) that failed validation.
    *   The type of error (e.g., `value_error.missing`, `value_error.str.min_length`).
    *   A human-readable message.
5.  **Integration with FastAPI**: FastAPI uses Pydantic models declared as type hints in path operation parameters (for request bodies, query parameters that are models, etc.) and for `response_model`.
    *   **Request Bodies**: As seen in the example above.
    *   **Query Parameters**: You can also use Pydantic models for groups of query parameters by depending on them.
    *   **Response Models**: When `response_model` is set, FastAPI uses the Pydantic model to validate and serialize the data returned by your path operation, ensuring the output conforms to the defined schema.

This robust validation system ensures data integrity at the API boundaries, reduces boilerplate validation code in your application logic, and provides clear feedback to API clients.

## Explain the difference between Pydantic’s `BaseModel` and a regular Python class.

While both Pydantic's `BaseModel` and regular Python classes are fundamental building blocks in Python, `BaseModel` provides a rich set of features specifically designed for data validation, serialization, and settings management, which regular classes lack by default.

| Feature                 | Regular Python Class                                       | Pydantic `BaseModel`                                                                 |
| :---------------------- | :--------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **Primary Purpose**     | General-purpose object-oriented programming, behavior.     | Data definition, validation, parsing, serialization, and settings management.       |
| **Data Validation**     | None by default. Requires manual implementation.           | Automatic validation based on type hints and `Field` constraints. Rich error reporting. |
| **Type Hinting**        | Used for static analysis and readability.                  | Actively used at runtime for validation and coercion.                               |
| **Type Coercion**       | No automatic coercion.                                     | Attempts to convert input data to declared types (e.g., `"1"` to `1` for `int`).     |
| **Initialization (`__init__`)** | You typically write a custom `__init__` method.     | `__init__` is automatically generated based on field definitions. Accepts keyword arguments. |
| **Serialization**       | Requires manual implementation (e.g., `to_dict` method).   | Built-in methods like `.model_dump()` (V2) / `.dict()` (V1) and `.model_dump_json()` (V2) / `.json()` (V1). |
| **Parsing**             | Requires manual implementation.                            | Can parse data from dictionaries (`model_validate` (V2) / `parse_obj` (V1)) or JSON strings (`model_validate_json` (V2) / `parse_raw` (V1)). |
| **Default Values**      | Can be set in `__init__` or as class attributes.          | Directly supported in field definitions, including `default_factory`.                 |
| **Required Fields**     | Managed by `__init__` signature.                          | Fields without defaults (or `...` in `Field`) are required; raises `ValidationError` if missing. |
| **Schema Generation**   | Not applicable.                                            | Can generate JSON Schema (`.model_json_schema()` (V2) / `.schema()` (V1)) and OpenAPI schemas (when used with FastAPI). |
| **Settings Management** | Not a primary feature.                                     | `pydantic-settings` (formerly `BaseSettings`) provides loading from env vars, .env files. |
| **Immutability**        | Mutable by default unless explicitly designed otherwise.   | Can be configured for immutability (`model_config = {"frozen": True}`).            |
| **Attribute Access**    | Standard attribute access.                                 | Standard attribute access. Also provides methods like `.model_fields_set` to see what was provided vs. defaulted. |
| **Performance**         | Standard Python performance.                               | Core validation/serialization in Rust (`pydantic-core`) makes it very fast for its tasks. |
| **Inheritance**         | Standard Python inheritance.                               | Supports model inheritance, with fields and validators being inherited.                |

**Example of a regular class:**

```python
class PlainUser:
    def __init__(self, name: str, email: str, age: int = None):
        if not isinstance(name, str) or len(name) < 2:
            raise ValueError("Name must be a string of at least 2 chars")
        # ... manual validation for email, age ...
        self.name = name
        self.email = email
        self.age = age

    def to_dict(self):
        return {"name": self.name, "email": self.email, "age": self.age}

# Manual instantiation and potential errors if not careful
# user = PlainUser(name="J", email="invalid") # Error prone
```

**Example of a Pydantic `BaseModel` (from previous question):**

```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    age: Optional[int] = Field(None, gt=0)

# Automatic parsing, validation, and rich error messages
# data = {"name": "J", "email": "invalid"}
# try:
#     user = UserCreate(**data)
# except ValidationError as e:
#     print(e.errors())
```

In essence, `BaseModel` supercharges Python classes for data-centric tasks, offering a declarative way to define data structures with powerful, automatic validation and serialization capabilities.

## Write a Pydantic model for a product (name, price, quantity) and use it in a POST endpoint.

This is very similar to the user example.

```python
# main.py
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional

# 1. Define the Pydantic model for Product
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100, description="Name of the product.")
    price: float = Field(..., gt=0, description="Price of the product (must be greater than 0).")
    quantity: int = Field(..., ge=0, description="Available quantity of the product (must be 0 or more).")
    description: Optional[str] = Field(None, max_length=500, description="Optional description of the product.")
    tags: Optional[list[str]] = Field(None, description="Optional list of tags for the product.")

    class Config:
        # Pydantic V1: schema_extra / Pydantic V2: json_schema_extra
        schema_extra = {
            "example": {
                "name": "Awesome Widget",
                "price": 19.99,
                "quantity": 150,
                "description": "An incredibly awesome widget.",
                "tags": ["gadget", "tech", "awesome"]
            }
        }

app = FastAPI()

@app.post("/products/")
async def create_product(product_data: ProductCreate):
    """
    Create a new product.
    """
    # product_data is an instance of ProductCreate, already validated.
    print(f"Creating product: {product_data.model_dump()}")

    # Here, you would typically save the product to a database
    # e.g., new_product = db_operations.save_product(product_data)

    return {"message": "Product created successfully", "product_details": product_data}

# To run: uvicorn main:app --reload
# Then POST to http://127.0.0.1:8000/products/ with a body like:
# {
#   "name": "Super Gadget",
#   "price": 29.95,
#   "quantity": 50,
#   "description": "Even more super than the awesome widget!",
#   "tags": ["electronics", "must-have"]
# }
```

This example demonstrates creating a `ProductCreate` model with fields like `name`, `price` (a float greater than 0), `quantity` (an integer greater than or equal to 0), and optional `description` and `tags`. The FastAPI `POST` endpoint `/products/` expects a JSON request body matching this Pydantic model.

## How does Pydantic handle invalid input in FastAPI?

As mentioned before, when FastAPI receives a request body for an endpoint that expects a Pydantic model, it performs the following:

1.  **Parsing**: It attempts to parse the request body (e.g., from JSON) into a Python dictionary.
2.  **Validation with Pydantic**: It passes this dictionary to the Pydantic model for validation. Pydantic checks:
    *   **Missing required fields**: If a field without a default value is not provided.
    *   **Incorrect data types**: E.g., providing a string where an integer is expected (after attempting coercion).
    *   **Constraint violations**: E.g., a string shorter than `min_length`, a number outside `gt`/`lt` bounds, a value not matching a regex `pattern`.
    *   **Custom validator failures**: If any custom validators you defined raise `ValueError`, `TypeError`, or `AssertionError`.
3.  **Automatic HTTP 422 Response**:
    *   If Pydantic's validation fails for any reason, Pydantic raises a `ValidationError`.
    *   FastAPI catches this `ValidationError` **automatically**.
    *   It then sends an HTTP `422 Unprocessable Entity` response back to the client.
    *   The body of this 422 response is a JSON object that provides detailed information about the validation errors. This makes it easy for clients to understand what was wrong with their request.

**Example of a 422 Error Response Body:**

If you send an invalid request to the `/users/` endpoint from the first example, like:

```json
{
  "name": "J", // Too short (min_length=2)
  "email": "not-an-email", // Invalid email format
  "age": -5 // Fails gt=0 constraint
}
```

FastAPI (via Pydantic) would respond with a 422 status code and a JSON body similar to this:

```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "name"],
      "msg": "String should have at least 2 characters",
      "input": "J",
      "ctx": {"min_length": 2}
      // Pydantic V2 also includes "url": "https://errors.pydantic.dev/..."
    },
    {
      "type": "value_error", // Pydantic V2 might show more specific email error type
      "loc": ["body", "email"],
      "msg": "value is not a valid email address", // Message can vary
      "input": "not-an-email"
    },
    {
      "type": "greater_than",
      "loc": ["body", "age"],
      "msg": "Input should be greater than 0",
      "input": -5,
      "ctx": {"gt": 0}
    }
  ]
}
```

This structured error response is extremely helpful for API clients to programmatically understand and display errors, or for developers to debug issues.

## Explain the difference between Pydantic’s `BaseModel` and Python dataclasses.

Pydantic's `BaseModel` and Python's built-in `dataclasses` (introduced in Python 3.7 via the `dataclasses` module) both aim to reduce boilerplate when creating classes that primarily store data. However, they have different primary focuses and feature sets.

| Feature                 | Python `dataclass`                                         | Pydantic `BaseModel`                                                                    |
| :---------------------- | :--------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **Primary Focus**       | Convenience for creating classes that store data (like C structs). Auto-generates methods like `__init__`, `__repr__`, `__eq__`. | Data validation, parsing, serialization, settings management, and type enforcement at runtime. |
| **Data Validation**     | No built-in runtime validation based on type hints. Type hints are for static analysis. | **Core feature**: Runtime validation and coercion based on type hints and explicit constraints. |
| **Type Coercion**       | No. Type hints are not enforced at runtime by default.      | Yes, attempts to convert input data to the declared field types.                       |
| **Error Handling**      | Standard Python attribute/type errors if types are misused without manual checks. | Raises `ValidationError` with detailed error messages if validation fails.          |
| **Serialization/Parsing**| No built-in methods for complex serialization (e.g., to JSON) or parsing from dict/JSON. | Built-in `.model_dump()`, `.model_dump_json()`, `model_validate()`, `model_validate_json()`. |
| **Configuration**       | Limited (e.g., `@dataclass(frozen=True)` for immutability). | Extensive configuration via `model_config` (V2) or nested `Config` class (V1) for behavior like extra fields, ORM mode, etc. |
| **Performance**         | Generally good for simple data storage; it's standard Python. | Highly performant for validation/serialization due to Rust core (`pydantic-core`).     |
| **Dependencies**        | Part of Python's standard library (since 3.7).             | Third-party library (needs to be installed).                                          |
| **Ecosystem**           | General Python.                                            | Widely used in API frameworks (FastAPI), data processing, settings management.         |
| **Nested Structures**   | Supports nesting dataclasses, but validation is not recursive by default. | Handles nested Pydantic models with recursive validation and serialization.            |
| **JSON Schema**         | No built-in support.                                       | Can generate JSON Schema.                                                              |

**When to use Python `dataclass`:**

*   When you need a simple, lightweight way to bundle data together within your application.
*   When runtime validation is not a primary concern, or you handle it separately.
*   For internal data structures where you trust the data sources.
*   When you want to avoid adding external dependencies.

**Example of a Python `dataclass`:**

```python
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class DataclassUser:
    name: str
    email: str # No built-in email validation
    age: Optional[int] = None
    is_active: bool = True
    tags: list[str] = field(default_factory=list)

user_dc = DataclassUser(name="Dataclass User", email="user@example.com")
print(user_dc)
# Output: DataclassUser(name='Dataclass User', email='user@example.com', age=None, is_active=True, tags=[])

# No validation for:
# user_invalid_dc = DataclassUser(name=123, email="not-really-an-email") # No runtime error by default
```

**When to use Pydantic `BaseModel`:**

*   When dealing with external data sources (API requests, file inputs, environment variables) where data integrity is crucial.
*   When you need robust runtime data validation and type coercion.
*   For defining clear data schemas for APIs (request/response bodies).
*   When you need easy serialization to/from JSON or dictionaries.
*   For settings management.
*   When working with FastAPI, as it's deeply integrated.

**Pydantic also offers `pydantic.dataclasses.dataclass`:**

Pydantic provides its own `dataclass` decorator (`from pydantic.dataclasses import dataclass`) that combines the convenience of Python's `dataclass` syntax with Pydantic's validation capabilities. This can be a good middle ground if you prefer the `dataclass` API but still want Pydantic's runtime checks.

```python
from pydantic.dataclasses import dataclass as pydantic_dataclass
from pydantic import EmailStr, ValidationError
from typing import Optional

@pydantic_dataclass
class PydanticDataclassUser:
    name: str
    email: EmailStr # Pydantic's validation will apply
    age: Optional[int] = None

try:
    user_pdc = PydanticDataclassUser(name="Valid User", email="valid@example.com")
    print(user_pdc)
    user_invalid_pdc = PydanticDataclassUser(name="Test", email="not-an-email")
except ValidationError as e:
    print(f"\nValidation Error for PydanticDataclassUser:\n{e}")
```

In summary, `dataclasses` are for convenient data grouping with some auto-generated methods, while Pydantic `BaseModel` is a powerful tool for data validation, parsing, and serialization, making it ideal for handling data at the boundaries of your application.
