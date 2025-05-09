---
title: Pydantic Custom Validators
---

# Pydantic Custom Validators

**Original Topic Context (from section 8.1 Pydantic Custom Validators)**: Creating custom validators for complex data validation in Pydantic.

Pydantic provides powerful built-in validation for common types, but often, you need to implement custom validation logic specific to your application's requirements. Pydantic offers several decorators to create custom validators for individual fields or for the model as a whole.

In Pydantic V2, the primary decorators for custom validation are `@field_validator` (for field-specific validation) and `@model_validator` (for model-wide validation). In Pydantic V1, these were primarily `@validator` and `@root_validator`. This guide will focus on the Pydantic V2 syntax.

## Write a Pydantic model with a custom validator for email format.

While Pydantic has a built-in `EmailStr` type for email validation, let's create a custom validator for a simple string field to illustrate the concept. Suppose we want to ensure an email string not only looks like an email but also belongs to a specific domain (e.g., "example.com").

```python
from pydantic import BaseModel, field_validator, EmailStr, ValidationError

class UserRegistration(BaseModel):
    username: str
    email: str  # We'll apply a custom validator to this string field

    @field_validator("email")
    @classmethod
    def validate_email_domain(cls, value: str) -> str:
        # First, let's use Pydantic's EmailStr for basic format validation
        try:
            # This leverages Pydantic's internal email validation logic
            # If we just wanted to re-use EmailStr's validation, we could type hint `email: EmailStr`
            # But for custom logic on top, we validate explicitly here or use a regex.
            # For simplicity, we'll assume a basic check here.
            if "@" not in value or "." not in value.split("@")[-1]:
                 raise ValueError("Invalid email format")
        except ValueError as e: # Catches Pydantic's EmailStr validation error if it were used
            raise ValueError(f"Invalid email format: {e}")

        # Custom domain validation
        if not value.endswith("@example.com"):
            raise ValueError("Email must be from the 'example.com' domain.")
        
        return value.lower() # Optionally, normalize the value

# Example Usage:
try:
    user_ok = UserRegistration(username="john_doe", email="john.doe@example.com")
    print(f"User OK: {user_ok.model_dump_json(indent=2)}")
    # Output:
    # User OK: {
    #   "username": "john_doe",
    #   "email": "john.doe@example.com"
    # }
except ValidationError as e:
    print(f"Validation Error for OK user (should not happen): {e}")


try:
    user_bad_domain = UserRegistration(username="jane_doe", email="jane.doe@another.com")
    print(f"User Bad Domain: {user_bad_domain.model_dump_json(indent=2)}")
except ValidationError as e:
    print(f"\nValidation Error for Bad Domain:\n{e}")
    # Output:
    # Validation Error for Bad Domain:
    # 1 validation error for UserRegistration
    # email
    #   Value error, Email must be from the 'example.com' domain. [type=value_error, input_value='jane.doe@another.com', input_type=str]

try:
    user_bad_format = UserRegistration(username="test_user", email="test_user_no_at_sign.com")
    print(f"User Bad Format: {user_bad_format.model_dump_json(indent=2)}")
except ValidationError as e:
    print(f"\nValidation Error for Bad Format:\n{e}")
    # Output:
    # Validation Error for Bad Format:
    # 1 validation error for UserRegistration
    # email
    #   Value error, Invalid email format [type=value_error, input_value='test_user_no_at_sign.com', input_type=str]

```

**Explanation of `@field_validator`:**

*   **`@field_validator("email")`**: This decorator registers the `validate_email_domain` method as a validator for the `email` field. You can pass multiple field names if the same validation logic applies to them (e.g., `@field_validator("email", "backup_email")`).
*   **`@classmethod`**: Validators are typically class methods. The first argument `cls` refers to the model class itself.
*   **`value: str`**: The second argument is the value of the field being validated. Pydantic passes the field's value after any standard type coercion has occurred.
*   **Return Value**: The validator **must return the validated (and potentially transformed/normalized) value**. If it doesn't return a value, Pydantic will assume the field's value is `None` after validation.
*   **Raising `ValueError`**: If validation fails, the validator should raise a `ValueError` (or `TypeError`, or `AssertionError`). Pydantic catches these and converts them into `ValidationError` details. The message of the `ValueError` will be used in the error report.

## How do you chain multiple validators in a Pydantic model?

Pydantic executes validators for a field in the order they are defined in the class. If you have multiple `@field_validator` decorators for the same field, or a sequence of validators applied through other means, they will run sequentially.

**Example: Chaining validators for a password field**

Let's say we want a password to:
1.  Be at least 8 characters long.
2.  Contain at least one number.
3.  Contain at least one uppercase letter.

```python
import re
from pydantic import BaseModel, field_validator, ValidationError

class AccountCredentials(BaseModel):
    username: str
    password: str

    @field_validator("password")
    @classmethod
    def check_min_length(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return value

    @field_validator("password") # Applied to the result of check_min_length
    @classmethod
    def check_contains_number(cls, value: str) -> str:
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one number.")
        return value

    @field_validator("password") # Applied to the result of check_contains_number
    @classmethod
    def check_contains_uppercase(cls, value: str) -> str:
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter.")
        return value

# Example Usage
try:
    # Valid password
    creds1 = AccountCredentials(username="user1", password="StrongPassword123")
    print(f"Creds1 Valid: {creds1.password}")
except ValidationError as e:
    print(f"Creds1 Error: {e}")

try:
    # Invalid: Too short
    creds2 = AccountCredentials(username="user2", password="Short1")
    print(f"Creds2 Valid: {creds2.password}")
except ValidationError as e:
    print(f"\nCreds2 Error (Too short):\n{e.errors(include_url=False)}")
    # Output:
    # Creds2 Error (Too short):
    # [{'type': 'value_error', 'loc': ('password',), 'msg': 'Value error, Password must be at least 8 characters long.', 'input': 'Short1'}]


try:
    # Invalid: No number
    creds3 = AccountCredentials(username="user3", password="PasswordNoNum")
    print(f"Creds3 Valid: {creds3.password}")
except ValidationError as e:
    print(f"\nCreds3 Error (No number):\n{e.errors(include_url=False)}")
    # Output:
    # Creds3 Error (No number):
    # [{'type': 'value_error', 'loc': ('password',), 'msg': 'Value error, Password must contain at least one number.', 'input': 'PasswordNoNum'}]

try:
    # Invalid: No uppercase
    creds4 = AccountCredentials(username="user4", password="password123")
    print(f"Creds4 Valid: {creds4.password}")
except ValidationError as e:
    print(f"\nCreds4 Error (No uppercase):\n{e.errors(include_url=False)}")
    # Output:
    # Creds4 Error (No uppercase):
    # [{'type': 'value_error', 'loc': ('password',), 'msg': 'Value error, Password must contain at least one uppercase letter.', 'input': 'password123'}]
```

**Order of Execution:**

1.  `check_min_length` is called first. If it passes, it returns the password.
2.  `check_contains_number` is called next, receiving the password returned by `check_min_length`.
3.  `check_contains_uppercase` is called last, receiving the password returned by `check_contains_number`.

If any validator in the chain raises a `ValueError`, the subsequent validators for that field are not executed, and Pydantic reports the error from the failing validator.

**Alternative: Single Validator for Multiple Checks**

Often, it's cleaner to combine multiple checks into a single validator method if they are closely related:

```python
class AccountCredentialsSingleValidator(BaseModel):
    username: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, value: str) -> str:
        errors = []
        if len(value) < 8:
            errors.append("Password must be at least 8 characters long.")
        if not re.search(r"\d", value):
            errors.append("Password must contain at least one number.")
        if not re.search(r"[A-Z]", value):
            errors.append("Password must contain at least one uppercase letter.")
        
        if errors:
            raise ValueError("Password complexity requirements not met: " + " ".join(errors))
        return value

try:
    creds_single = AccountCredentialsSingleValidator(username="user_s", password="short")
except ValidationError as e:
    print(f"\nSingle Validator Error:\n{e.errors(include_url=False)}")
    # Output:
    # Single Validator Error:
    # [{'type': 'value_error', 'loc': ('password',), 'msg': 'Value error, Password complexity requirements not met: Password must be at least 8 characters long. Password must contain at least one number. Password must contain at least one uppercase letter.', 'input': 'short'}]
```
This approach can sometimes provide more consolidated error messages. The choice between chained validators and a single multi-check validator depends on the complexity and reusability of the validation logic.

## What are the performance considerations of custom validators?

While Pydantic is highly optimized, custom validators can introduce performance overhead if not written carefully. Here are some considerations:

1.  **Complexity of Validation Logic**: The more complex your validation function (e.g., involving regular expressions, database lookups, external API calls), the more time it will take.
    *   **Regex**: Complex regex patterns can be slow. Profile them if they are a bottleneck. Pre-compile regex patterns (`re.compile()`) if they are used frequently within a validator that's called many times (though for Pydantic validators, they are typically called once per field instantiation).
    *   **I/O Operations**: Avoid database queries or external API calls directly within synchronous Pydantic validators if possible, especially for models that are instantiated frequently. Such operations are blocking and can severely degrade performance. If needed, consider:
        *   Performing such checks in a separate step after initial Pydantic validation.
        *   Using asynchronous validation patterns if your framework supports them (Pydantic itself is primarily synchronous in its core validation path, but frameworks like FastAPI handle async dependencies separately).

2.  **Number of Validators**: Each validator adds a function call. While usually negligible, a very large number of fine-grained validators per field could accumulate overhead. Consolidating related checks into a single validator can sometimes be more efficient.

3.  **Data Transformation**: If validators also perform significant data transformations (e.g., complex string manipulations, object recreations), this will add to the processing time.

4.  **`mode` parameter in `@field_validator` (Pydantic V2)**:
    *   `mode='after'` (default): The validator runs after Pydantic's internal type validation and coercion. This is usually what you want.
    *   `mode='before'`: The validator runs *before* Pydantic's internal type validation. This allows you to preprocess the raw input value. It can be useful but means your validator needs to handle potentially diverse input types.
    *   `mode='plain'`: The validator receives the raw input and its output is used directly, bypassing Pydantic's core validation logic for this field. Use with caution.
    *   `mode='wrap'`: The validator is a "wrapping" validator that calls `handler()` to invoke the next validation step. This is more advanced and allows you to intercept and modify the validation process.
    The `mode` can impact performance as it changes when and how your code interacts with Pydantic's core logic.

5.  **Pydantic V1 `@validator(always=True)`**: If you were using Pydantic V1, `always=True` would cause the validator to run even if the field was not provided in the input (using its default value). This could be an unnecessary computation if the default value is always valid. In Pydantic V2, this behavior is more nuanced and often controlled by default values and whether the field is required.

**Best Practices for Performance:**

*   **Keep validators focused and efficient.**
*   **Profile your application**: If you suspect Pydantic validation is a bottleneck (which is rare for typical use cases unless validators are doing heavy I/O or computation), use a profiler to identify slow validators.
*   **Leverage Pydantic's built-in types**: Use types like `EmailStr`, `HttpUrl`, constrained types (`constr`, `conint`), etc., whenever possible, as their validation is implemented efficiently in Rust (via `pydantic-core`).
*   **Batch external checks**: If multiple fields need validation against an external system (e.g., checking if several IDs exist in a database), it's often more performant to do this in a single `@model_validator` or a separate service call after initial Pydantic validation, rather than multiple I/O calls in individual `@field_validator`s.

In most web application scenarios, the overhead of well-written custom validators is negligible compared to network latency or database query times. However, for very high-throughput systems or data-intensive batch processing, these considerations become more important.
