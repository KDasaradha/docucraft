---
title: Monitoring and Logging in FastAPI
---

# Monitoring and Logging in FastAPI

**Original Description**: Setting up monitoring and logging for FastAPI applications to track performance and errors.

Effective monitoring and logging are essential for understanding the health, performance, and behavior of your FastAPI application in production. They allow you to detect issues proactively, diagnose problems quickly, and gain insights into usage patterns.

**1. Logging:**

(Refer to the detailed "Error Handling and Logging in FastAPI" section under "FastAPI Performance" for best practices).

**Key Logging Goals:**

*   **Capture Errors**: Log all exceptions, especially unhandled ones, with full tracebacks.
*   **Track Requests**: Log basic information about each incoming request (method, path, status code, duration, client IP). Middleware is ideal for this.
*   **Record Business Events**: Log significant application-level events.
*   **Provide Context**: Include request IDs, user IDs, etc., to correlate log entries.
*   **Structure for Analysis**: Use structured logging (JSON) for easy parsing by log aggregation tools.
*   **Centralize Logs**: Send logs from all application instances to a central system (ELK Stack, Datadog, Splunk, CloudWatch Logs, etc.).

**Example Logging Middleware:**

```python
import time
import logging
import uuid
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
import contextvars # For managing request context

# Basic logging setup (configure more robustly in real app)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Context variable for request ID
request_id_var = contextvars.ContextVar('request_id', default='N/A')

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        token = request_id_var.set(request_id) # Set context var

        start_time = time.monotonic()
        
        # Log request start
        logger.info(
            "Request started: %s %s client=%s request_id=%s",
            request.method,
            request.url.path,
            request.client.host if request.client else "N/A",
            request_id,
        )

        try:
            response = await call_next(request)
            duration = time.monotonic() - start_time
            response.headers["X-Request-ID"] = request_id # Inject request ID into response header
            response.headers["X-Process-Time"] = f"{duration:.4f}"
            
            # Log request completion
            logger.info(
                "Request finished: %s %s status=%d duration=%.4fs request_id=%s",
                request.method,
                request.url.path,
                response.status_code,
                duration,
                request_id,
            )
        except Exception as e:
            duration = time.monotonic() - start_time
            # Log unhandled exceptions that bubble up to the middleware
            logger.exception(
                 "Unhandled exception during request: %s %s duration=%.4fs request_id=%s",
                 request.method,
                 request.url.path,
                 duration,
                 request_id
            )
            # Re-raise the exception so FastAPI's default/custom handlers can process it
            raise e 
        finally:
             # Reset context var after request processing
            request_id_var.reset(token)

        return response

app = FastAPI()
app.add_middleware(LoggingMiddleware) # Add the middleware

# Now, loggers elsewhere can potentially access request_id_var.get()
# (though passing context explicitly or using log filters is often cleaner)

@app.get("/")
async def root():
    current_request_id = request_id_var.get() # Get request ID from context var
    logger.info(f"Processing root endpoint for request_id={current_request_id}")
    return {"message": "Hello World"}

```
*(Note: Proper configuration of logging formatters and handlers is needed to automatically include `request_id` in all logs if using contextvars.)*

**2. Monitoring:**

Monitoring focuses on collecting and visualizing metrics about the application's performance and health over time.

**Key Monitoring Areas:**

*   **Application Metrics**:
    *   **Request Rate**: Number of requests per second/minute.
    *   **Error Rate**: Percentage or count of requests resulting in errors (e.g., 4xx, 5xx status codes).
    *   **Latency/Duration**: Average, median, and percentile (e.g., p95, p99) response times for endpoints.
    *   **Saturation**: How "busy" the service is (e.g., CPU utilization, memory usage, connection pool usage, event loop blocking time).
*   **System Metrics**: CPU usage, memory usage, disk I/O, network I/O of the underlying servers or containers.
*   **Dependency Metrics**: Performance and error rates of databases, caches, external APIs your application relies on.

**Tools and Techniques:**

*   **Application Performance Monitoring (APM) Tools**:
    *   **Examples**: Datadog APM, New Relic, Dynatrace, Sentry Performance, Elastic APM, OpenTelemetry collectors.
    *   **How**: These tools typically use agents or libraries that automatically instrument your FastAPI application (and common libraries like `httpx`, SQLAlchemy) to collect detailed traces of requests as they flow through your application and interact with dependencies. They provide dashboards for visualizing metrics, identifying slow endpoints/queries, and tracing errors. OpenTelemetry is an open standard gaining traction.
*   **Prometheus & Grafana**:
    *   **Prometheus**: An open-source time-series database and monitoring system. It scrapes metrics exposed by applications over HTTP.
    *   **Grafana**: An open-source visualization tool used to create dashboards from data sources like Prometheus.
    *   **Integration**: Use Python libraries like `prometheus-fastapi-instrumentator` or `starlette-prometheus` to automatically expose standard metrics (request counts, duration histograms, etc.) from your FastAPI app on a `/metrics` endpoint for Prometheus to scrape.
    ```python
    # Example using prometheus-fastapi-instrumentator
    # pip install prometheus-fastapi-instrumentator

    from fastapi import FastAPI
    from prometheus_fastapi_instrumentator import Instrumentator

    app = FastAPI()

    # Expose metrics at /metrics
    Instrumentator().instrument(app).expose(app) 

    @app.get("/")
    async def root():
        return {"message": "Hello"}
        
    # Run FastAPI, then configure Prometheus to scrape http://<your-app>/metrics
    # Build Grafana dashboards based on Prometheus data.
    ```
*   **Health Checks**: Implement a dedicated `/health` endpoint that checks the status of the application and its critical dependencies (e.g., database connectivity). Monitoring systems can periodically poll this endpoint to determine if the application instance is healthy.
    ```python
    from fastapi import FastAPI, Response, status

    app = FastAPI()
    
    @app.get("/health", status_code=status.HTTP_200_OK)
    async def health_check():
        # Add checks for critical dependencies (DB, cache, etc.) here
        # If a check fails, return appropriate status code (e.g., 503 Service Unavailable)
        # try:
        #     await check_db_connection()
        # except Exception:
        #     return Response(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content="Database connection failed")
            
        return {"status": "healthy"}
    ```
*   **Cloud Provider Monitoring**: AWS CloudWatch, Google Cloud Monitoring, Azure Monitor provide built-in monitoring for resources deployed on their platforms (VMs, databases, load balancers, serverless functions).

**Combining Logging and Monitoring:**

*   Logs provide detailed event-based information for debugging specific errors or requests.
*   Metrics provide aggregated views of performance and health over time, useful for dashboards and alerting.
*   Often, metrics can be derived from logs (e.g., counting log entries with `status=500` to get an error rate).
*   APM tools often correlate traces, metrics, and logs automatically.

By implementing both detailed logging and comprehensive monitoring, you gain the necessary observability to operate your FastAPI application reliably in production.

    