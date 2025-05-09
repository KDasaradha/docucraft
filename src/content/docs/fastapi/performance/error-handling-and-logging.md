---
title: Error Handling and Logging in FastAPI
---

# Error Handling and Logging in FastAPI

**Original Description**: Best practices for handling errors gracefully and implementing effective logging in FastAPI applications.

Robust error handling and comprehensive logging are essential for building maintainable, debuggable, and reliable FastAPI applications.

**Error Handling Best Practices:**

1.  **Use `HTTPException` for Expected Client/Request Errors**:
    *   For errors caused by invalid client input or requests for non-existent resources (e.g., bad request data, item not found), raise `fastapi.HTTPException`.
    *   Specify the appropriate `status_code` (e.g., `400 Bad Request`, `404 Not Found`, `401 Unauthorized`, `403 Forbidden`, `422 Unprocessable Entity` - often handled automatically by Pydantic).
    *   Provide a clear `detail` message explaining the error to the client.
    *   **Example**:
        ```python
        from fastapi import FastAPI, HTTPException, status

        app = FastAPI()
        items = {"foo": "The Foo Wrestlers"}

        @app.get("/items/{item_id}")
        async def read_item(item_id: str):
            if item_id not in items:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, 
                    detail=f"Item with id '{item_id}' not found"
                )
            return {"item": items[item_id]}
        ```

2.  **Use Custom Exception Handlers for Application-Specific Errors**:
    *   Define custom exception classes for specific error conditions within your application's domain (e.g., `InsufficientFundsError`, `ProductOutOfStockError`).
    *   Create custom exception handlers using the `@app.exception_handler(CustomError)` decorator to translate these internal exceptions into appropriate HTTP responses (often using `JSONResponse` with a specific status code and detail message).
    *   This keeps your core business logic cleaner (just raising specific exceptions) and centralizes the HTTP response mapping.
    *   **Example**:
        ```python
        from fastapi import FastAPI, Request, status
        from fastapi.responses import JSONResponse

        class ItemAlreadyExistsError(Exception):
            def __init__(self, item_name: str):
                self.item_name = item_name

        app = FastAPI()

        @app.exception_handler(ItemAlreadyExistsError)
        async def item_already_exists_handler(request: Request, exc: ItemAlreadyExistsError):
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={"message": f"Item '{exc.item_name}' already exists."},
            )

        @app.post("/create-item/{item_name}")
        async def create_item(item_name: str):
            if item_name == "existing_item": # Simulate existing item
                 raise ItemAlreadyExistsError(item_name=item_name)
            return {"message": f"Item '{item_name}' created."}
        ```

3.  **Handle Unexpected Server Errors Gracefully**:
    *   Use a global exception handler (e.g., `@app.exception_handler(Exception)`) to catch any unhandled exceptions.
    *   Log the full traceback for debugging purposes.
    *   Return a generic `500 Internal Server Error` response to the client, avoiding leakage of sensitive stack trace information.

4.  **Leverage Pydantic Validation Errors**:
    *   FastAPI automatically handles Pydantic's `ValidationError` for request bodies, path parameters, and query parameters, returning detailed `422 Unprocessable Entity` responses. Rely on this built-in behavior.

5.  **Be Consistent**: Define a consistent error response format across your API (e.g., always include `{"detail": "error message"}` or a more structured format like `{"error": {"code": "ERR_CODE", "message": "..."}}`).

**Logging Best Practices:**

1.  **Use Python's Built-in `logging` Module**: It's flexible, standard, and integrates well with various tools and platforms. Avoid using simple `print()` statements for logging in production applications.

2.  **Configure Logging**:
    *   Set up logging configuration early in your application's lifecycle, ideally before the FastAPI app starts serving requests if possible, or using startup events/lifespan managers.
    *   Configure log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL) appropriately for different environments (e.g., DEBUG in development, INFO or WARNING in production).
    *   Use handlers to direct logs to different destinations (e.g., `StreamHandler` for console output, `FileHandler` for files, handlers for external logging services).
    *   Use formatters to define the structure of your log messages (e.g., timestamp, log level, module name, message).
    *   **Example (Basic Configuration)**:
        ```python
        # At the start of your application or in a config module
        import logging

        logging.basicConfig(
            level=logging.INFO, # Adjust level as needed
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

        # Get logger instance in your modules
        logger = logging.getLogger(__name__) 

        # Usage in code
        # logger.info("User %s logged in.", username)
        # logger.error("Database connection failed: %s", exc, exc_info=True) # Log exception info
        ```
    *   For more complex setups, consider using dictionary-based configuration (`logging.config.dictConfig`) often loaded from a YAML or JSON file.

3.  **Log Relevant Information**:
    *   **Requests/Responses**: Log key details about incoming requests (method, path, client IP - be mindful of privacy) and outgoing responses (status code, duration). Middleware is a good place for this.
    *   **Errors**: Log all exceptions, especially unhandled ones, with full tracebacks (`logger.error("...", exc_info=True)` or `logger.exception("...")`).
    *   **Business Logic Events**: Log significant events in your application flow (e.g., user creation, order processed, payment failed).
    *   **Debugging**: Use `logger.debug(...)` for detailed information useful only during development or troubleshooting.

4.  **Structured Logging**:
    *   Consider outputting logs in a structured format like JSON. This makes logs much easier to parse, query, and analyze by log management systems (e.g., ELK stack, Datadog Logs, Splunk). Libraries like `python-json-logger` can help.

5.  **Contextual Logging**:
    *   Include contextual information in logs, such as request IDs, user IDs, or tenant IDs. This helps trace a single request or user activity through distributed systems or complex flows. Middleware or context variables (`contextvars`) can be used to manage this context.

6.  **Avoid Sensitive Data**: Be extremely careful not to log sensitive information like passwords, API keys, credit card numbers, or personally identifiable information (PII) unless absolutely necessary and properly secured/masked.

7.  **Performance**: Logging can have performance implications. Avoid excessive logging (especially synchronous file I/O) in performance-critical paths. Asynchronous logging handlers can mitigate some overhead.

By implementing robust error handling and effective logging, you significantly improve the ability to diagnose issues, monitor application health, and provide a better experience for both developers and end-users.

## How can custom exception handlers improve error responses in FastAPI?

Custom exception handlers provide several advantages over relying solely on `HTTPException` or default server errors:

1.  **Decoupling Business Logic from HTTP Concerns**:
    *   Your core application or service layer can raise specific, meaningful exceptions related to business rules (e.g., `InsufficientBalanceError`, `InvalidOperationError`) without needing to know about HTTP status codes or response formats.
    *   The exception handlers act as a translation layer, catching these specific exceptions and converting them into appropriate HTTP responses (`JSONResponse` with a specific status code and message). This leads to cleaner, more focused business logic.

2.  **Consistent Error Format**:
    *   You can define a standardized JSON structure for all your API error responses within the handlers. This makes the API more predictable and easier for clients to consume, as they always know how to parse error messages, regardless of the specific error type.
    *   **Example Standard Format**:
        ```json
        {
          "error": {
            "code": "INSUFFICIENT_FUNDS", // Application-specific error code
            "message": "The account balance is too low for this transaction.",
            "details": { // Optional extra details
              "required": 100.50,
              "available": 50.25
            }
          }
        }
        ```
        You can implement this structure consistently across all custom handlers.

3.  **Specific HTTP Status Codes**:
    *   While `HTTPException` allows setting status codes, custom handlers let you map your internal application exceptions to the most semantically correct HTTP status codes (e.g., mapping `ItemNotFoundError` to `404 Not Found`, `DuplicateItemError` to `409 Conflict`, `PermissionDeniedError` to `403 Forbidden`).

4.  **Centralized Error Handling Logic**:
    *   Instead of scattering `try...except` blocks that raise `HTTPException` throughout your endpoint code, you centralize the handling of specific application errors in dedicated handler functions. This makes the code easier to maintain and modify.

5.  **Improved Logging and Monitoring**:
    *   Exception handlers are an excellent place to log specific details about application errors before returning the response to the client. You can log the original exception, relevant request data, etc., providing valuable debugging information.

6.  **Hiding Internal Details**:
    *   Custom handlers prevent internal application exceptions and stack traces from leaking to the client (which often happens with unhandled exceptions resulting in a generic 500 error). They ensure clients only receive the well-formatted error response you define.

**In summary**: Custom exception handlers promote cleaner code, provide consistent and informative error responses to clients, allow for better mapping of application errors to HTTP semantics, and centralize error handling logic, ultimately leading to more robust and user-friendly APIs.

## What are the best practices for logging in a production FastAPI environment?

Effective logging in production is crucial for monitoring, troubleshooting, and security auditing. Key best practices include:

1.  **Use Structured Logging (JSON)**:
    *   **Why**: Machine-readable logs are essential for modern log management systems (ELK, Splunk, Datadog, etc.). JSON is a widely accepted standard.
    *   **How**: Use libraries like `python-json-logger` or configure Python's `logging.JSONFormatter` (available in newer Python versions) to format log records as JSON objects. Include standard fields like `timestamp`, `level`, `name` (logger name), `message`, and add custom contextual fields.

2.  **Configure Appropriate Log Level**:
    *   **Why**: Avoid excessive noise (DEBUG) while capturing essential information.
    *   **How**: Set the default log level to `INFO` or `WARNING` in production. Allow overriding via environment variables for temporary debugging if needed. `ERROR` and `CRITICAL` should always be captured.

3.  **Include Contextual Information**:
    *   **Why**: Helps trace requests and understand the context of a log event.
    *   **How**: Include relevant IDs like `request_id`, `correlation_id`, `user_id`, `tenant_id` in every log message related to a request. Use FastAPI middleware and `contextvars` to manage and inject this context into the logging scope.

4.  **Log Request/Response Summaries**:
    *   **Why**: Provides visibility into API traffic and performance.
    *   **How**: Use middleware to log key details for each request: timestamp, method, path, status code, response time (duration), client IP (consider privacy), request ID. Avoid logging full request/response bodies unless necessary for debugging specific issues (and be careful about sensitive data).

5.  **Log Errors and Exceptions Thoroughly**:
    *   **Why**: Essential for debugging failures.
    *   **How**: Log all unhandled exceptions with full tracebacks using `logger.exception()` or `logger.error(..., exc_info=True)`. Catch expected exceptions and log them appropriately (e.g., `logger.warning` or `logger.error` depending on severity). Include relevant context (like request ID).

6.  **Log Key Business Events**:
    *   **Why**: Provides insight into application behavior beyond errors.
    *   **How**: Log significant actions like user login/logout, resource creation/modification, payment processing attempts (success/failure), etc., typically at the `INFO` level.

7.  **Centralized Log Aggregation**:
    *   **Why**: Essential for searching, analyzing, and monitoring logs from multiple application instances or services.
    *   **How**: Configure logging handlers to send logs to a centralized system (e.g., Fluentd, Logstash, CloudWatch Logs, Datadog Agent). Avoid relying solely on local file logs in distributed environments.

8.  **Asynchronous Logging**:
    *   **Why**: Minimize the performance impact of logging I/O on your application's main threads/event loop.
    *   **How**: Use non-blocking handlers (like `logging.handlers.QueueHandler` with a `logging.handlers.QueueListener`) or libraries that support async logging if logging volume is high or destination is slow.

9.  **Avoid Sensitive Data**:
    *   **Why**: Security and privacy compliance.
    *   **How**: Scrutinize log messages and context data. Do NOT log passwords, API keys, full credit card numbers, excessive PII, etc. Use filtering or redaction if necessary.

10. **Log Rotation and Retention**:
    *   **Why**: Manage disk space usage for file-based logs. Comply with data retention policies.
    *   **How**: Use `logging.handlers.RotatingFileHandler` or `TimedRotatingFileHandler` for local file logs. Configure retention policies in your centralized logging system.

11. **Standardize Log Format Across Services**:
    *   **Why**: Simplifies querying and correlation in microservice environments.
    *   **How**: Agree on a common structured log schema (JSON fields) across different services in your organization.

By following these practices, you create a logging system that is informative, performant, secure, and invaluable for maintaining a healthy production application.

## How do you log exceptions with tracebacks in FastAPI?

Python's standard `logging` module makes it easy to log exceptions along with their full tracebacks.

There are two primary methods within the logger object:

1.  **`logger.exception(message, *args, **kwargs)`**:
    *   This is generally the preferred method for logging exceptions **inside an `except` block**.
    *   It logs a message with the level `ERROR`.
    *   Crucially, it **automatically includes the current exception information (type, value, traceback)** in the log record, similar to setting `exc_info=True`.
    *   **Example**:
        ```python
        import logging

        logger = logging.getLogger(__name__)

        try:
            result = 10 / 0 
        except ZeroDivisionError as e:
            logger.exception("An error occurred during division.") 
            # Or include contextual info: logger.exception("Failed processing data for user %s", user_id)
            # This will log the message AND the full traceback for the ZeroDivisionError.
        ```

2.  **`logger.error(message, *args, exc_info=True, **kwargs)`**:
    *   This method logs a message with the level `ERROR`.
    *   To include the exception traceback, you **must explicitly set `exc_info=True`**.
    *   This can be used both inside and outside `except` blocks, but when used inside an `except` block, it captures the current exception like `logger.exception`. If used outside an `except` block where there's no active exception, setting `exc_info=True` typically logs nothing extra or might cause issues depending on the logging setup.
    *   **Example (inside except block - equivalent to logger.exception)**:
        ```python
        import logging

        logger = logging.getLogger(__name__)

        try:
            result = 10 / 0
        except ZeroDivisionError as e:
            # Pass exc_info=True to include traceback
            logger.error("An error occurred during division.", exc_info=True) 
        ```

**Integration with FastAPI Exception Handlers:**

Exception handlers are a natural place to log exceptions before returning a response.

```python
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


app = FastAPI()

# Handler for Pydantic validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Log the detailed validation errors
    logger.warning("Request validation failed: %s", exc.errors(), exc_info=False) # Usually no need for full traceback here
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )

# Generic handler for unexpected errors
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Log the unexpected error with full traceback
    logger.error("Unhandled exception occurred for request %s", request.url.path, exc_info=True) 
    # Or use logger.exception("Unhandled exception...")

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."}, # Don't expose traceback to client
    )

@app.get("/divide")
async def divide(a: int, b: int):
    if b == 0:
        # You could raise HTTPException here, or a custom error caught by another handler
        # For demonstration, let it raise ZeroDivisionError to be caught by generic handler
        pass 
    return {"result": a / b}

```

**Key Takeaway**: Use `logger.exception("message")` or `logger.error("message", exc_info=True)` within your `except` blocks or exception handlers to ensure that the full traceback is captured in your logs, which is essential for debugging production issues.

    