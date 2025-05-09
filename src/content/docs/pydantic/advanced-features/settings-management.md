---
title: Pydantic Settings Management
---

# Pydantic Settings Management

**Original Description**: Using Pydantic for managing application settings from environment variables or configuration files.

Managing application settings (database URLs, API keys, feature flags, etc.) is a common requirement. Pydantic offers a dedicated utility, typically through the `pydantic-settings` library (previously part of Pydantic V1 as `BaseSettings`), to handle this robustly and type-safely.

It allows you to define your settings in a Pydantic model, and it automatically loads values from environment variables, `.env` files, and potentially other sources, performing validation along the way.

**Using `pydantic-settings` (Recommended for Pydantic V2 and newer V1)**

First, install the library: `pip install pydantic-settings`

**Steps:**

1.  **Import `BaseSettings`**: Import `BaseSettings` from `pydantic_settings`.
2.  **Define Settings Model**: Create a class that inherits from `BaseSettings`. Define fields with type hints, just like a regular Pydantic `BaseModel`.
3.  **Configure Loading (Optional but common)**: Use a nested `model_config` dictionary (Pydantic V2 style) or a `Config` class (Pydantic V1 style) within your settings model to customize loading behavior. Common settings include:
    *   `env_file = '.env'`: Specifies the `.env` file(s) to load environment variables from.
    *   `env_prefix = 'APP_'`: Specifies a prefix for environment variables (e.g., `APP_DATABASE_URL` maps to `database_url`).
    *   `case_sensitive = False`: Determines if environment variable matching is case-sensitive (default is usually `False`).
    *   `extra = 'ignore' | 'allow' | 'forbid'`: How to handle extra fields found during loading (same as `BaseModel`).

**Example:**

```python
# settings.py
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, PostgresDsn, RedisDsn, SecretStr # SecretStr masks value in logs/repr
from typing import Optional

# Assume you have a .env file in your project root:
# APP_DEBUG=True
# APP_DATABASE_URL=postgresql://user:secret_password@dbhost:5432/mydb
# APP_REDIS_URL=redis://localhost:6379/0
# APP_SECRET_KEY=my_super_secret_app_key

class AppSettings(BaseSettings):
    # Define settings fields with type hints and optional defaults
    debug: bool = Field(False, description="Enable debug mode")
    database_url: PostgresDsn = Field(..., description="Primary database connection string")
    redis_url: Optional[RedisDsn] = Field(None, description="Redis connection string (optional)")
    secret_key: SecretStr = Field(..., description="Application secret key") # Use SecretStr for sensitive values
    items_per_page: int = Field(10, gt=0, description="Default items per page") # Example with default and validation

    # Pydantic V2 style configuration
    model_config = SettingsConfigDict(
        env_file='.env',           # Load .env file if it exists
        env_file_encoding='utf-8', # Specify encoding
        env_prefix='APP_',         # Environment variables must start with APP_
        case_sensitive=False,      # Match APP_DEBUG or app_debug
        extra='ignore'             # Ignore extra env vars not defined in the model
    )
    
    # --- Pydantic V1 style configuration (alternative) ---
    # class Config:
    #     env_file = '.env'
    #     env_file_encoding = 'utf-8'
    #     env_prefix = 'APP_'
    #     case_sensitive = False
    #     extra = 'ignore'

# --- Usage ---

# Instantiate the settings object. Pydantic automatically loads values.
# It checks environment variables first, then .env file(s).
try:
    settings = AppSettings()

    # Access settings as attributes
    print(f"Debug Mode: {settings.debug}")
    print(f"Database URL User: {settings.database_url.username}") # Pydantic parses the DSN
    print(f"Redis URL: {settings.redis_url}")
    print(f"Secret Key: {settings.secret_key.get_secret_value()}") # Use .get_secret_value() to access SecretStr
    print(f"Items Per Page: {settings.items_per_page}")

    # Example: Check if required SECRET_KEY was loaded
    # (Pydantic raises ValidationError if required fields like database_url or secret_key are missing)

except ValidationError as e:
    print(f"Error loading settings: {e}")
    # Handle missing or invalid settings (e.g., exit application)

```

**Benefits of Using `BaseSettings`:**

1.  **Type Safety and Validation**: Settings are validated against the defined types and constraints (e.g., `PostgresDsn`, `gt=0`). Invalid or missing required settings will raise a `ValidationError` on startup, preventing runtime errors later.
2.  **Clear Definition**: Your application's settings are explicitly defined in one place (the `AppSettings` class), serving as documentation.
3.  **Multiple Sources**: Automatically loads from environment variables and `.env` files, following a clear priority order (environment variables typically override `.env` file values). Support for secrets files is also available.
4.  **Prefixing**: `env_prefix` helps avoid collisions between environment variables from different applications or system settings.
5.  **Case Insensitivity**: Simplifies deployment across different operating systems where environment variable case handling might differ.
6.  **Sensitive Data Handling**: `SecretStr` type prevents accidental logging or displaying of sensitive values like API keys or passwords.
7.  **Integration**: Easily integrate settings into FastAPI dependencies or other parts of your application by simply importing and instantiating the settings model.

Using `pydantic-settings` provides a robust, standardized, and type-safe way to manage application configuration, improving reliability and developer experience.

## How does Pydantic load settings from environment variables?

`pydantic-settings` (and the older `BaseSettings` in Pydantic V1) follows a specific logic to load values for the fields defined in your settings model:

1.  **Initialization Arguments**: If you explicitly pass values when initializing the `BaseSettings` subclass (e.g., `AppSettings(database_url=...)`), these values take the highest priority. This is less common for settings management but possible.

2.  **Environment Variables**:
    *   It checks the actual environment variables set in the process (e.g., those exported in your shell or set by your deployment system).
    *   It looks for environment variables whose names **match the field names** defined in your settings model.
    *   **Case Sensitivity**: Controlled by `model_config['case_sensitive']` (V2) or `Config.case_sensitive` (V1). If `False` (default), it performs a case-insensitive match (e.g., `DATABASE_URL` in the environment matches `database_url` field).
    *   **Prefix**: If `model_config['env_prefix']` (V2) or `Config.env_prefix` (V1) is set (e.g., `APP_`), it looks for environment variables like `APP_DATABASE_URL` to match the `database_url` field.
    *   Values found in environment variables take precedence over values found in `.env` files.

3.  **.env File(s)**:
    *   If `model_config['env_file']` (V2) or `Config.env_file` (V1) is specified, Pydantic attempts to load the specified file(s) (e.g., `.env`). It uses a library like `python-dotenv` behind the scenes.
    *   It reads the key-value pairs from the `.env` file.
    *   It then applies the same matching logic (case sensitivity, prefix) as with system environment variables to map the keys from the `.env` file to the fields in your settings model.
    *   If a setting is defined *both* in the system environment and in the `.env` file, the value from the system environment **wins**.

4.  **Secrets Directory (Advanced)**:
    *   You can specify `model_config['secrets_dir']` (V2) or `Config.secrets_dir` (V1). If set, Pydantic looks for files within that directory whose names match the setting field names. The content of the file is read as the setting value. This is common in containerized environments like Docker Swarm or Kubernetes for mounting secrets as files.

5.  **Default Values**: If a value is not found through any of the above methods, Pydantic uses the default value defined for the field in the model (e.g., `debug: bool = False`).

6.  **Validation**: After attempting to load a value from these sources, Pydantic validates the final value against the field's type hint and any constraints.
    *   If a required field (one without a default value and not `Optional`) is not found in any source, a `ValidationError` is raised.
    *   If a value is found but cannot be coerced to the correct type or fails validation constraints, a `ValidationError` is raised.

This layered approach provides flexibility, allowing you to set defaults in code, override them with `.env` files for development, and further override them with actual environment variables for production deployments.

## Explain the use of `SecretStr` for sensitive settings.

`pydantic.SecretStr` is a specialized string type provided by Pydantic designed explicitly for handling sensitive data like passwords, API keys, or tokens.

**Key Features and Benefits:**

1.  **Masked Representation**: When a `SecretStr` instance is printed or included in the representation (`repr()`) of its parent model, the actual secret value is masked (e.g., shown as `'**********'`).
    ```python
    from pydantic import BaseModel, SecretStr

    class Credentials(BaseModel):
        username: str
        api_key: SecretStr

    creds = Credentials(username="user", api_key="my-secret-api-key-123")
    print(creds) 
    # Output: Credentials(username='user', api_key=SecretStr('**********')) 
    # Note: The actual secret value is NOT printed.
    
    print(creds.model_dump_json(indent=2))
    # Output:
    # {
    #   "username": "user",
    #   "api_key": "**********" 
    # }
    ```
    This prevents accidental leakage of sensitive information through logging, debugging output, or serialization if not handled carefully.

2.  **Explicit Access**: To get the actual secret value, you **must explicitly call** the `.get_secret_value()` method.
    ```python
    secret = creds.api_key.get_secret_value()
    print(secret) 
    # Output: my-secret-api-key-123 

    # Accessing it directly as a string might work in some contexts due to __str__
    # but .get_secret_value() is the documented and safe way.
    # print(str(creds.api_key)) # Also outputs: my-secret-api-key-123
    ```
    This forces developers to be intentional when accessing the raw secret, reducing the chances of accidental exposure.

3.  **Type Safety**: It still functions as a string for validation purposes and when the actual value is retrieved using `.get_secret_value()`. Pydantic ensures the loaded value is a string.

**When to Use `SecretStr` (and `SecretBytes`):**

Use `SecretStr` for any configuration setting or model field that holds sensitive text data:
*   Database passwords
*   API keys or tokens
*   Encryption keys (though `SecretBytes` might be more appropriate if they are raw bytes)
*   Client secrets

Pydantic also provides `SecretBytes` for sensitive binary data.

By using `SecretStr`, you add a layer of protection against accidental disclosure of sensitive configuration values within your application.

    