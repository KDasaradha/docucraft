---
title: Response Models and Status Codes
---

# Response Models and Status Codes in FastAPI

**Original Description**: Defining response models and handling HTTP status codes in FastAPI to control output schemas.

FastAPI provides powerful mechanisms to control the structure of your API responses and the HTTP status codes they return. This is crucial for creating well-defined, predictable, and standards-compliant APIs.

## Create a FastAPI endpoint that returns a custom response model with a specific HTTP status code.

Here's an example of a FastAPI endpoint that uses a Pydantic model to define the response structure and specifies a custom HTTP status code for successful creation.

```python
# main.py
from fastapi import FastAPI, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

app = FastAPI()

# --- Pydantic Models ---
class ItemBase(BaseModel):
    name: str = Field(..., min_length=3, description="Name of the item")
    description: Optional[str] = Field(None, description="Optional description of the item")
    price: float = Field(..., gt=0, description="Price of the item")

class ItemCreate(ItemBase): # For request body when creating an item
    pass

class ItemResponse(ItemBase): # For the response when an item is returned
    id: int = Field(..., description="Unique identifier of the item")
    # You can add more fields here specific to the response, 
    # or exclude fields from ItemBase if needed using model_config.

    class Config:
        # Pydantic V1: orm_mode = True / Pydantic V2: from_attributes = True
        # This allows the model to be created from ORM objects directly (if you were using an ORM)
        # For this example, it's not strictly necessary as we are constructing from a dict-like object.
        from_attributes = True 
        # Pydantic V2: json_schema_extra / Pydantic V1: schema_extra
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Awesome Gadget",
                "description": "A truly awesome gadget for your daily needs.",
                "price": 49.99,
            }
        }

# In-memory "database" for demonstration
fake_items_db = []
current_item_id = 0

@app.post(
    "/items/",
    response_model=ItemResponse, # 1. Define the response model
    status_code=status.HTTP_201_CREATED, # 2. Specify the success status code
    summary="Create a new item",
    tags=["Items"]
)
async def create_item(item_payload: ItemCreate):
    """
    Create a new item with the following information:

    - **name**: Each item must have a name (min 3 chars).
    - **description**: Optional description.
    - **price**: Price of the item (must be > 0).
    """
    global current_item_id
    current_item_id += 1
    
    new_item_data = item_payload.model_dump()
    new_item_data["id"] = current_item_id
    
    fake_items_db.append(new_item_data)
    
    # FastAPI will take this dictionary (or ORM object if from_attributes=True and it's an ORM obj),
    # validate it against ItemResponse, and serialize it.
    return new_item_data 

# To run: uvicorn main:app --reload
# Then, go to http://127.0.0.1:8000/docs
# 1. Try the POST /items/ endpoint.
#    - Request body example: {"name": "My New Item", "price": 10.50}
#    - The response will be status 201 Created.
#    - The response body will match the ItemResponse schema, including the 'id'.
```

**Explanation:**

1.  **`response_model=ItemResponse`**:
    *   In the `@app.post()` decorator, the `response_model` parameter is set to our Pydantic model `ItemResponse`.
    *   This tells FastAPI:
        *   **Data Filtering and Serialization**: The data returned from the `create_item` function will be processed by `ItemResponse`. Only the fields defined in `ItemResponse` will be included in the final JSON response. If `create_item` returns extra fields not in `ItemResponse`, they will be excluded.
        *   **Data Validation (Output)**: FastAPI will validate that the returned data conforms to the `ItemResponse` model (types, constraints). If it doesn't, FastAPI will raise a server-side error because the application is not returning data as promised. This helps catch bugs in your response generation.
        *   **Documentation**: The `ItemResponse` model will be used in the OpenAPI schema (and thus in Swagger UI / ReDoc) to document the exact structure of the successful response body.

2.  **`status_code=status.HTTP_201_CREATED`**:
    *   The `status_code` parameter in the decorator specifies the HTTP status code to be sent when the path operation is successful.
    *   `status.HTTP_201_CREATED` (which is just an alias for the integer `201`) is the standard HTTP status code for indicating that a new resource has been successfully created as a result of a `POST` request.
    *   FastAPI provides common status codes in `fastapi.status` for convenience and readability.
    *   If you don't specify `status_code`, FastAPI defaults to `200 OK` for most operations. For `POST` operations that create a resource, explicitly setting `201 Created` is good practice.

**How `response_model` works:**

When your path operation function returns a value (e.g., a dictionary, a Pydantic model instance, an ORM object):
1.  FastAPI takes this return value.
2.  It uses the `response_model` (e.g., `ItemResponse`) to validate and serialize this value.
3.  This involves:
    *   Converting the return value into a dictionary if it's not already (e.g., if it's an ORM object and `from_attributes=True` (or `orm_mode=True` in Pydantic V1) is set in the model's config).
    *   Filtering out any fields present in the returned data but not defined in the `response_model`.
    *   Ensuring all fields in the `response_model` are present (or have defaults) and that their types match.
    *   Converting the validated data into a JSON string to be sent in the HTTP response body.

## How can you specify a response model in FastAPI to control the output schema?

As demonstrated in the example above, you specify a response model using the `response_model` parameter in the path operation decorator (e.g., `@app.get()`, `@app.post()`, etc.).

```python
from pydantic import BaseModel
from fastapi import FastAPI

app = FastAPI()

class UserPublic(BaseModel):
    id: int
    username: str
    email: EmailStr # Assuming EmailStr is imported

class UserInDB(UserPublic): # Internal model, might have more fields
    hashed_password: str

# ... (function to get user from DB) ...
def get_user_from_db(user_id: int) -> UserInDB | None:
    # Dummy implementation
    if user_id == 1:
        return UserInDB(id=1, username="john_doe", email="john@example.com", hashed_password="secretpassword")
    return None


@app.get("/users/{user_id}", response_model=UserPublic)
async def read_user(user_id: int):
    user_db_data = get_user_from_db(user_id)
    if not user_db_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # user_db_data is an instance of UserInDB (which includes hashed_password)
    # However, because response_model=UserPublic, FastAPI will:
    # 1. Convert user_db_data to a dict-like structure.
    # 2. Validate it against UserPublic.
    # 3. Serialize it, ONLY including fields from UserPublic.
    #    So, 'hashed_password' will NOT be in the JSON response.
    return user_db_data 
```

**Benefits of using `response_model`:**

*   **Data Privacy/Security**: Prevents accidental leakage of sensitive data (like `hashed_password` in the example) by ensuring only explicitly defined fields are returned.
*   **Clear API Contract**: Clients know exactly what structure to expect in the response.
*   **Automatic Output Validation**: Catches bugs where your endpoint might return data in an unexpected format.
*   **Automatic Documentation**: The response schema is accurately documented in OpenAPI/Swagger UI.
*   **Type Conversion and Serialization**: Handles conversion of complex data types (like `datetime` objects) to JSON-compatible formats.

You can use different Pydantic models for request bodies (`UserCreate`) and response bodies (`UserPublic`, `ItemResponse`) to precisely control the data flow in and out of your API.

## What is the purpose of the `status_code` parameter in FastAPI decorators?

The `status_code` parameter in FastAPI's path operation decorators (`@app.get()`, `@app.post()`, etc.) is used to define the **default HTTP status code** that will be sent in the response if the path operation executes successfully (i.e., without raising an `HTTPException` or an unhandled error).

**Key Purposes:**

1.  **Semantic HTTP Responses**: It allows you to return semantically correct HTTP status codes according to web standards. For example:
    *   `200 OK`: Standard response for successful `GET`, `PUT`, `PATCH`, or `DELETE` (if no content is returned or if the resource still exists after delete).
    *   `201 Created`: Indicates that a new resource has been successfully created (typically for `POST` requests).
    *   `204 No Content`: Indicates success but there is no content to return in the body (e.g., for a `DELETE` request that successfully removes a resource, or a `PUT` request that updates a resource without returning it).
    *   Other codes like `202 Accepted` (for asynchronous processing) can also be used.

2.  **API Contract and Documentation**: The specified `status_code` is included in the OpenAPI documentation, informing API clients what to expect for successful operations.

3.  **Clarity in Code**: Using constants from `fastapi.status` (e.g., `status.HTTP_201_CREATED`) makes the code more readable and less prone to errors than using raw integer codes.

**Example Usage:**

```python
from fastapi import FastAPI, status, HTTPException

app = FastAPI()

@app.post("/items", status_code=status.HTTP_201_CREATED)
async def create_item_endpoint(name: str):
    # ... logic to create item ...
    if not name: # Some arbitrary failure condition
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Name cannot be empty")
    return {"id": 1, "name": name} # Successful creation, returns 201

@app.get("/items/{item_id}", status_code=status.HTTP_200_OK)
async def get_item_endpoint(item_id: int):
    if item_id == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return {"id": item_id, "name": "Sample Item"} # Successful GET, returns 200

@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item_endpoint(item_id: int):
    # ... logic to delete item ...
    # If item_id was invalid, you might raise a 404 HTTPException here
    # If successful, FastAPI will automatically return a 204 response with no body.
    # The return value of this function (if any) will be ignored for 204.
    return None # Or simply no return statement
```

**Important Notes:**

*   **Default Status Code**: If `status_code` is not specified:
    *   For most operations, it defaults to `200 OK`.
    *   For path operations returning `None` and having no `response_model` that would generate a body, it might intelligently default to `204 No Content` in some cases, but it's better to be explicit.
*   **Overriding with `Response` Object**: You can override the default `status_code` by returning a `fastapi.responses.Response` object (or its subclasses like `JSONResponse`, `HTMLResponse`) directly from your path operation, and setting the `status_code` on that `Response` instance.
    ```python
    from fastapi.responses import JSONResponse
    
    @app.get("/custom-status")
    async def custom_status_endpoint():
        return JSONResponse(content={"message": "Accepted"}, status_code=202)
    ```
*   **`HTTPException`**: If you raise an `HTTPException` within your path operation, the status code from the `HTTPException` will be used, overriding the default `status_code` set in the decorator.

Using `status_code` appropriately is a key part of designing RESTful and understandable APIs.

## Create a FastAPI endpoint with a response model and a 201 status code.

This is exactly what was demonstrated in the first question of this section. Please refer to the `POST /items/` endpoint example provided under "Create a FastAPI endpoint that returns a custom response model with a specific HTTP status code."

Key parts from that example:

```python
# ... (ItemResponse model definition) ...

@app.post(
    "/items/",
    response_model=ItemResponse,         # Specifies the response schema
    status_code=status.HTTP_201_CREATED # Specifies the success status code
)
async def create_item(item_payload: ItemCreate):
    # ... (logic to create item_data) ...
    return item_data # This data will be validated against ItemResponse and returned with 201 status
```

## How do you exclude certain fields from a response model in FastAPI?

You have several ways to exclude fields from a Pydantic model when it's used as a `response_model` in FastAPI, or when serializing a Pydantic model instance in general.

**1. Using `response_model_exclude_unset`, `response_model_exclude_defaults`, `response_model_exclude_none` in the Decorator:**

These parameters in the path operation decorator control whether fields that were not explicitly set (i.e., they retain their default values) or fields that are `None` should be excluded from the response.

*   `response_model_exclude_unset=True`: Excludes fields that were not explicitly provided in the input data and for which the model used its default value.
*   `response_model_exclude_defaults=True`: Excludes fields that have their default value, regardless of whether they were set or not.
*   `response_model_exclude_none=True`: Excludes fields whose value is `None`.

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class Profile(BaseModel):
    username: str
    full_name: Optional[str] = None
    bio: Optional[str] = "Default bio"
    age: Optional[int] = None

@app.get(
    "/profiles/1",
    response_model=Profile,
    response_model_exclude_none=True, # Exclude 'full_name' and 'age' if they are None
    response_model_exclude_defaults=True # Exclude 'bio' if it's "Default bio"
)
async def get_profile():
    return Profile(username="coder1", full_name=None, age=None) 
    # Response: {"username": "coder1"} 
    # 'full_name' and 'age' are None, 'bio' has its default value.
```

**2. Using `response_model_exclude` or `response_model_include` in the Decorator:**

These parameters allow you to explicitly specify which fields to include or exclude.

*   `response_model_exclude: set[str] | dict[int | str, Any]`: A set of field names to exclude.
*   `response_model_include: set[str] | dict[int | str, Any]`: A set of field names to include (all others are excluded).

```python
class UserWithPassword(BaseModel):
    id: int
    username: str
    email: EmailStr
    hashed_password: str

@app.get("/users/me", response_model=UserWithPassword, response_model_exclude={"hashed_password"})
async def get_current_user():
    # In a real app, you'd fetch the current user with their hashed password
    return UserWithPassword(id=1, username="current_user", email="me@example.com", hashed_password="supersecret")
    # Response will NOT include 'hashed_password'
```

**3. Defining a Different Pydantic Model for the Response:**

This is often the cleanest and most recommended approach for significant differences between internal data structures and API responses. Create a separate Pydantic model that only contains the fields you want to expose.

```python
class UserInternal(BaseModel): # Model for internal use / database
    id: int
    username: str
    email: EmailStr
    hashed_password: str
    role: str

class UserPublicResponse(BaseModel): # Model specifically for API responses
    id: int
    username: str
    email: EmailStr
    # 'hashed_password' and 'role' are intentionally omitted

@app.get("/users/{user_id}", response_model=UserPublicResponse)
async def get_user_public_info(user_id: int):
    # internal_user_data: UserInternal = fetch_user_from_db(user_id)
    internal_user_data = UserInternal(id=user_id, username="test", email="test@example.com", hashed_password="secret", role="admin")
    return internal_user_data # FastAPI will use UserPublicResponse to serialize
    # Response: {"id": user_id, "username": "test", "email": "test@example.com"}
```

**4. Using `model_dump(exclude=..., include=...)` when returning a model instance (Less common for `response_model` directly):**

If you are not relying on `response_model` but are manually creating a `JSONResponse` with a Pydantic model, you can control serialization there. However, when `response_model` is used, FastAPI handles this.

```python
from fastapi.responses import JSONResponse

class MyData(BaseModel):
    a: int
    b: str
    c: Optional[int] = None

@app.get("/manual-serialize")
async def manual_serialize_data():
    data_instance = MyData(a=1, b="hello", c=None)
    # Manually serialize, excluding 'c' if it's None
    return JSONResponse(content=data_instance.model_dump(exclude_none=True))
```

**Recommendation:**
For clarity, security, and maintainability, **defining separate Pydantic models for API responses (`response_model`)** is generally the best approach if you need to systematically exclude fields or reshape data. For minor, one-off exclusions, `response_model_exclude` or `response_model_exclude_none` can be convenient.

## What is the role of the `response_model` parameter in FastAPI?

The `response_model` parameter in FastAPI's path operation decorators plays a critical role in defining and enforcing the schema of the data returned by your API endpoint. Its primary functions are:

1.  **Data Filtering**: It ensures that only the fields defined in the specified Pydantic model are included in the final HTTP response. If your path operation function returns more data (e.g., a dictionary or an ORM object with extra fields), those extra fields will be filtered out. This is crucial for:
    *   **Preventing data leakage**: Avoiding accidental exposure of sensitive or internal-use-only data.
    *   **API contract adherence**: Ensuring the response strictly adheres to the documented schema.

2.  **Data Validation (Output Validation)**: FastAPI uses the `response_model` to validate the data *before* sending it to the client. If the data returned by your function does not conform to the schema of the `response_model` (e.g., wrong types, missing required fields if the model expects them), FastAPI will raise a server-side error. This helps catch bugs in your application logic where you might be returning incorrectly structured data.

3.  **Data Serialization**: It handles the conversion of your Python data (dictionaries, Pydantic model instances, ORM objects if `from_attributes=True` is configured) into a JSON response. This includes converting Python data types (like `datetime`, `UUID`) into their appropriate JSON representations.

4.  **Automatic API Documentation**: The schema of the `response_model` is automatically included in the OpenAPI specification for your API. This means tools like Swagger UI and ReDoc will accurately display the expected response structure for that endpoint, making it clear to API consumers what data they will receive.

5.  **Type Safety and Developer Experience**:
    *   It provides type hints for the response, which can be used by static analysis tools and IDEs for better code understanding and autocompletion when working with the endpoint's return values internally.
    *   It enforces a clear contract for what the endpoint should return, improving code maintainability.

**In summary, `response_model` is essential for:**
*   **Security**: Controlling what data is exposed.
*   **Reliability**: Ensuring responses are correctly structured.
*   **Clarity**: Clearly documenting the API's output.
*   **Productivity**: Automating serialization and documentation.

By using `response_model`, you create more robust, secure, and well-documented APIs.
