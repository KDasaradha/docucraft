---
title: Pydantic Complex Nested Models
---

# Pydantic Complex Nested Models

**Original Description**: Handling complex nested data structures and validation with Pydantic models.

Pydantic excels at defining and validating complex, nested data structures, such as those often found in JSON APIs or configuration files. You can nest Pydantic models within each other to represent intricate relationships.

**Defining Nested Models:**

You define nested models simply by using another Pydantic model as the type hint for a field.

```python
from pydantic import BaseModel, Field, HttpUrl, ValidationError
from typing import List, Optional

class Image(BaseModel):
    url: HttpUrl # Pydantic type for URL validation
    alt_text: Optional[str] = Field(None, max_length=100)

class ProductSpecification(BaseModel):
    weight_kg: Optional[float] = Field(None, gt=0)
    dimensions_cm: Optional[List[float]] = Field(None, min_length=3, max_length=3) # [length, width, height]
    color: Optional[str] = None

class Product(BaseModel):
    id: int
    name: str = Field(..., min_length=3)
    description: Optional[str] = None
    tags: List[str] = []
    images: List[Image] = [] # List of nested Image models
    specs: Optional[ProductSpecification] = None # Nested ProductSpecification model

# Example Usage:
product_data = {
    "id": 101,
    "name": "Super Gadget",
    "description": "An amazing gadget for all your needs.",
    "tags": ["tech", "gadget", "new"],
    "images": [
        {"url": "https://example.com/image1.jpg", "alt_text": "Gadget front view"},
        {"url": "https://example.com/image2.png"} # alt_text is optional
    ],
    "specs": {
        "weight_kg": 0.75,
        "dimensions_cm": [15.5, 10.0, 5.2],
        "color": "Metallic Gray"
    }
}

try:
    product = Product.model_validate(product_data) # Pydantic V2
    # product = Product.parse_obj(product_data) # Pydantic V1
    
    print(product.model_dump_json(indent=2)) # Pydantic V2
    # print(product.json(indent=2)) # Pydantic V1
    
    # Access nested data
    print(f"\nFirst image URL: {product.images[0].url}")
    if product.specs:
        print(f"Product color: {product.specs.color}")

except ValidationError as e:
    print(f"\nValidation Error:\n{e}")

# Example of invalid data
invalid_product_data = {
    "id": 102,
    "name": "SG", # Too short
    "images": [
        {"url": "not-a-valid-url"} # Invalid URL format
    ],
    "specs": {
        "dimensions_cm": [10, 5] # Incorrect number of dimensions
    }
}

try:
    invalid_product = Product.model_validate(invalid_product_data)
except ValidationError as e:
    print(f"\nValidation Error for invalid data:\n{e}")
    # Output will show errors for:
    # - name: string too short
    # - images.0.url: invalid URL format
    # - specs.dimensions_cm: list length mismatch

```

**How Nested Validation Works:**

*   When Pydantic validates a model (like `Product`), if it encounters a field whose type is another Pydantic model (like `images` which is `List[Image]` or `specs` which is `ProductSpecification`), it recursively attempts to validate the corresponding input data using that nested model's definition.
*   For lists of models (`List[Image]`), it iterates through the input list and validates each item against the `Image` model.
*   If any validation fails within a nested model (e.g., an invalid `url` in one of the `images`), the error is reported with a path indicating its location (e.g., `images.0.url`).
*   This recursive validation ensures the entire complex data structure conforms to your defined schema.

**Handling Nested Relationships (e.g., with SQLAlchemy):**

When integrating with ORMs like SQLAlchemy, you often need Pydantic models to represent nested relationships (e.g., a User response including a list of their Posts).

```python
# Assume SQLAlchemy models User and Post exist with a relationship
# models.py
# class User(Base): ... posts = relationship("Post", ...)
# class Post(Base): ... author = relationship("User", ...)

# schemas.py
from typing import List
from pydantic import BaseModel

# Define schemas first to handle potential circularity if needed
class PostResponseBasic(BaseModel): # Basic Post without nesting back to User
    id: int
    title: str
    class Config: from_attributes = True

class UserResponse(BaseModel):
    id: int
    username: str
    posts: List[PostResponseBasic] = [] # List of Pydantic models for posts

    class Config:
        from_attributes = True # For Pydantic V2, or orm_mode = True for V1

# When fetching a User ORM object that has its `posts` relationship loaded (e.g., via selectinload):
# user_orm_instance = session.query(User).options(selectinload(User.posts)).get(1)
# if user_orm_instance:
#     user_pydantic_response = UserResponse.model_validate(user_orm_instance) # V2
#     # user_pydantic_response = UserResponse.from_orm(user_orm_instance) # V1
#     print(user_pydantic_response.model_dump_json(indent=2))
```

Pydantic's `from_attributes = True` (or `orm_mode = True` in V1) configuration in the Pydantic model's `Config` is crucial here. It tells Pydantic to read attribute values directly from the SQLAlchemy ORM instance (e.g., `user_orm_instance.posts`) and then attempt to convert those (which would be a list of `Post` ORM objects) into the specified Pydantic schema (`PostResponseBasic`).

**Forward References for Circular Dependencies:**

If your nested models create a circular dependency (e.g., `UserResponse` includes `List[PostResponse]` and `PostResponse` includes `UserInPostResponse`), you need to use forward references (string literals for type hints) and potentially call `model_rebuild()` (Pydantic V2) or `update_forward_refs()` (Pydantic V1) after all models are defined.

```python
class UserInPostResponse(BaseModel): # Simplified User for Post
    id: int
    username: str
    class Config: from_attributes = True

class PostResponse(BaseModel):
    id: int
    title: str
    author: "UserInPostResponse" # Forward reference as string
    class Config: from_attributes = True

class UserResponseWithPosts(BaseModel):
    id: int
    username: str
    posts: List["PostResponse"] # Forward reference
    class Config: from_attributes = True

# Pydantic V2 often handles this automatically due to deferred model building.
# If not, or for Pydantic V1:
# PostResponse.model_rebuild()
# UserResponseWithPosts.model_rebuild()
# (or .update_forward_refs() for Pydantic V1)
```

Pydantic's ability to handle complex nesting with recursive validation and integrate smoothly with ORM relationships makes it exceptionally well-suited for modern API development and data processing tasks.

    