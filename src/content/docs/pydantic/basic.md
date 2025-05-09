---
title: Pydantic - Basic
---

# Pydantic - Basic Concepts

Pydantic is a Python library for data validation and settings management using Python type hints. It enforces type hints at runtime and provides user-friendly errors when data is invalid. It's a core component of FastAPI for request/response validation and serialization.

## Key Topics

### Introduction to Pydantic
- **Data Validation**: Pydantic ensures that data conforms to a defined structure and type. If data is invalid, it raises clear, informative errors.
- **Settings Management**: Can be used to load and validate application settings from environment variables or configuration files (often via `pydantic-settings`).
- **Type Hint Powered**: Leverages standard Python type hints for defining data schemas.
- **Fast**: Core validation logic is implemented in Rust (via `pydantic-core` in Pydantic V2), making it highly performant.
- **Serialization/Deserialization**: Easily converts data to/from JSON and Python dictionaries.
- **IDE Friendly**: Excellent autocompletion and static analysis support due to type hints.

### Installation
Install Pydantic using pip:
```bash
pip install pydantic
# For settings management (recommended for V2 and newer V1):
pip install pydantic-settings
# For specific data types like email or URL validation:
pip install email-validator pydantic[email] # for EmailStr
# pydantic[url] is usually included by default for HttpUrl
```

### Creating Basic Models: Inheriting from `BaseModel`
Pydantic models are defined by creating classes that inherit from `pydantic.BaseModel`.

```python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool = True # Field with a default value
```
- `id`, `name`, `email`, `is_active` are fields of the model.
- Type hints (`int`, `str`, `bool`) define the expected data types.
- `is_active` has a default value of `True`.

### Basic Field Types
Pydantic supports standard Python types and provides many custom types for validation:
- Standard Python types: `str`, `int`, `float`, `bool`, `list`, `tuple`, `dict`, `set`, `bytes`, `datetime`, `date`, `time`, `timedelta`, `UUID`, etc.
- `List[SomeType]`, `Tuple[SomeType, ...]`, `Dict[KeyType, ValueType]`, `Set[SomeType]`.
- Pydantic specific types: `EmailStr`, `HttpUrl`, `FilePath`, `DirectoryPath`, `Json`, `SecretStr`, `SecretBytes`, constrained types (`constr`, `conint`).

### Optional Fields
Fields can be marked as optional, meaning they don't have to be provided when creating a model instance.
- **`Optional[T]` or `Union[T, None]` (Python 3.9+) / `T | None` (Python 3.10+)**:
  ```python
  from typing import Optional # For Python < 3.10
  
  class Item(BaseModel):
      name: str
      description: Optional[str] = None # description is optional and defaults to None
      # or for Python 3.10+
      # description: str | None = None 
      price: float
  ```
  If `description` is not provided, it will be `None`.

### Default Values for Fields
You can provide default values for fields directly in the class definition. If a field has a default value, it becomes optional.

```python
class Configuration(BaseModel):
    host: str = "localhost"
    port: int = 8000
    debug_mode: bool = False
```
- `config = Configuration()` will create an instance with `host="localhost"`, `port=8000`, `debug_mode=False`.
- `config = Configuration(port=8080)` will override the port.

### Data Parsing from Dictionaries and JSON
Pydantic models can be created from dictionaries using keyword arguments or the `model_validate()` method (Pydantic V2) / `parse_obj()` (Pydantic V1). They can also parse JSON strings using `model_validate_json()` (V2) / `parse_raw()` (V1).

```python
from pydantic import BaseModel

class Book(BaseModel):
    title: str
    author: str
    year: int

# From dictionary
book_data_dict = {"title": "1984", "author": "George Orwell", "year": 1949}
book1 = Book(**book_data_dict) # Using keyword arguments
# Pydantic V2:
book2 = Book.model_validate(book_data_dict)
# Pydantic V1:
# book2 = Book.parse_obj(book_data_dict)
print(book1.title) # Output: 1984

# From JSON string
json_string = '{"title": "Brave New World", "author": "Aldous Huxley", "year": 1932}'
# Pydantic V2:
book_from_json = Book.model_validate_json(json_string)
# Pydantic V1:
# book_from_json = Book.parse_raw(json_string)
print(book_from_json.author) # Output: Aldous Huxley
```
During parsing, Pydantic performs validation and type coercion.

### Data Serialization to Dictionaries and JSON
Pydantic models can be easily converted back to Python dictionaries or JSON strings.
- **`.model_dump()` (Pydantic V2) / `.dict()` (Pydantic V1)**: Converts the model to a dictionary.
- **`.model_dump_json()` (Pydantic V2) / `.json()` (Pydantic V1)**: Converts the model to a JSON string.

```python
book_instance = Book(title="Dune", author="Frank Herbert", year=1965)

# To dictionary
book_dict_output = book_instance.model_dump() # Pydantic V2
# book_dict_output = book_instance.dict() # Pydantic V1
print(book_dict_output) 
# Output: {'title': 'Dune', 'author': 'Frank Herbert', 'year': 1965}

# To JSON string
book_json_output = book_instance.model_dump_json(indent=2) # Pydantic V2, with pretty printing
# book_json_output = book_instance.json(indent=2) # Pydantic V1
print(book_json_output)
# Output:
# {
#   "title": "Dune",
#   "author": "Frank Herbert",
#   "year": 1965
# }
```

### Basic Validation Errors (`ValidationError`)
If data provided to a Pydantic model does not conform to its schema, Pydantic raises a `ValidationError`. This exception contains detailed information about the errors.

```python
from pydantic import BaseModel, ValidationError, PositiveInt

class Product(BaseModel):
    id: PositiveInt # Must be a positive integer
    name: str
    price: float

invalid_data = {"id": -5, "name": "Gadget", "price": "not-a-float"}

try:
    product = Product.model_validate(invalid_data) # Pydantic V2
    # product = Product.parse_obj(invalid_data) # Pydantic V1
except ValidationError as e:
    print("Validation Failed!")
    print(e.errors()) # List of error details
    # For Pydantic V2, e.json(indent=2) is also helpful:
    # print(e.json(indent=2))
```
Output for `e.errors()` might look like:
```
[
    {'type': 'greater_than', 'loc': ('id',), 'msg': 'Input should be greater than 0', 'input': -5, 'ctx': {'gt': 0}},
    {'type': 'float_parsing', 'loc': ('price',), 'msg': 'Input should be a valid A', 'input': 'not-a-float'}
]
```
This structured error reporting is very useful for API clients and debugging.

### Accessing Model Fields
You access the data in a Pydantic model instance using standard attribute access.
```python
user = User(id=1, name="Test User", email="test@example.com")
print(user.name)      # Output: Test User
print(user.is_active) # Output: True (default value)
```
Pydantic provides a robust foundation for data handling in Python applications, especially when dealing with external data sources or defining clear data contracts.
