---
title: Load Testing FastAPI Applications
---

# Load Testing FastAPI Applications

**Original Description**: Techniques and tools for load testing FastAPI applications to ensure performance under stress.

Load testing is the process of simulating realistic user load on your application to identify performance bottlenecks, determine capacity limits, and ensure reliability under stress before deploying to production or encountering peak traffic. For FastAPI applications, load testing helps verify that your async architecture and optimizations translate into real-world performance.

**Why Load Test FastAPI?**

*   **Identify Bottlenecks**: Discover which parts of your application (specific endpoints, database queries, external API calls, middleware) slow down under load.
*   **Determine Capacity**: Understand the maximum number of concurrent users or requests per second (RPS) your current infrastructure can handle before performance degrades significantly (latency increases, error rates rise).
*   **Validate Scalability**: Test how well your application scales when resources (CPU, RAM, database connections, workers/instances) are added.
*   **Assess Resilience**: See how the application behaves under heavy load, including error handling and recovery.
*   **Catch Regressions**: Regularly run load tests (e.g., in CI/CD) to catch performance regressions introduced by code changes.
*   **Optimize Configuration**: Fine-tune settings like the number of Uvicorn/Gunicorn workers, database connection pool sizes, cache configurations, etc., based on test results.

**Load Testing Tools:**

Several tools can be used for load testing web APIs like those built with FastAPI:

1.  **Locust**:
    *   **Description**: An open-source, Python-based load testing tool. You define user behavior in Python code. Scales well for distributed testing. Has a web UI for monitoring tests.
    *   **Pros**: Easy to use (Python code), scalable, good community support, real-time web UI.
    *   **Cons**: Primarily focused on RPS and response times; simulating complex user state might require more effort than some other tools.

2.  **k6**:
    *   **Description**: An open-source load testing tool focused on developer experience, written in Go, with test scripts written in JavaScript (ES2015+).
    *   **Pros**: Modern, performant, good scripting capabilities (JavaScript), integrates well with CI/CD, supports checks and thresholds for pass/fail criteria. Offers cloud execution options.
    *   **Cons**: Requires writing tests in JavaScript.

3.  **JMeter**:
    *   **Description**: A popular, feature-rich open-source load testing tool from Apache, written in Java. Uses a GUI for test plan creation (can also run via CLI).
    *   **Pros**: Very mature, extensive features (protocols, listeners, assertions), large community.
    *   **Cons**: GUI can be complex, XML-based test plans, can be resource-intensive compared to Locust/k6.

4.  **wrk / wrk2**:
    *   **Description**: Command-line HTTP benchmarking tools focused on generating high load from a single machine. `wrk2` adds coordination latency measurement.
    *   **Pros**: Very high throughput generation, simple to use for basic endpoint benchmarking.
    *   **Cons**: Limited scripting capabilities, less flexible for complex scenarios, primarily measures throughput and latency basics.

5.  **Hey**:
    *   **Description**: Another simple command-line HTTP load generator, written in Go.
    *   **Pros**: Easy to use, fast.
    *   **Cons**: Limited scripting and scenario complexity.

**Load Testing Process:**

1.  **Define Objectives**: What are you trying to achieve? (e.g., Ensure average response time under 200ms for 500 concurrent users, find the breaking point RPS, validate a new caching strategy).
2.  **Identify Key Scenarios**: Which endpoints or user flows are most critical or expected to receive the most traffic? (e.g., login, product search, create order, read item details).
3.  **Create Test Scripts**: Using your chosen tool (Locust, k6, etc.), write scripts that simulate user behavior:
    *   Make HTTP requests to your FastAPI endpoints (GET, POST, PUT, DELETE).
    *   Include realistic headers (e.g., `Content-Type`, `Authorization` if needed).
    *   Send appropriate request bodies (JSON).
    *   Handle responses, potentially extracting data for subsequent requests (e.g., getting an item ID after creation to then request it).
    *   Add "think time" (pauses) between requests to simulate real users more accurately.
4.  **Configure Load Profile**: Define how the load will be applied:
    *   **Number of Concurrent Users/Virtual Users (VUs)**: How many simulated users access the app simultaneously.
    *   **Ramp-up Period**: Gradually increase the number of users to the target level.
    *   **Duration**: How long the test should run at peak load.
    *   **Requests Per Second (RPS)**: Some tools allow targeting a specific RPS rate.
5.  **Prepare Test Environment**:
    *   Use an environment that closely resembles production (same infrastructure specs, network configuration, database size/state). **Avoid load testing directly against your production environment unless carefully planned and monitored.**
    *   Ensure your load generation machine(s) have sufficient resources and network bandwidth so they don't become the bottleneck themselves. Consider distributed testing for high loads.
    *   Ensure monitoring (application metrics, system metrics, database metrics) is in place for the target environment.
6.  **Execute the Test**: Run your load testing script(s).
7.  **Monitor and Collect Results**: Observe key metrics during the test using both the load testing tool's reporting and your application/system monitoring tools:
    *   **Load Tool Metrics**: Concurrent users, RPS, response times (min, max, avg, percentiles like p95, p99), success/failure rates.
    *   **Application/Server Metrics**: CPU utilization, memory usage, network I/O, error rates (e.g., 5xx status codes), event loop blocking (if measurable).
    *   **Database Metrics**: Query latency, connection counts, CPU/memory usage.
8.  **Analyze Results**:
    *   Did the application meet the performance objectives?
    *   Where did bottlenecks occur (high latency endpoints, high error rates, saturated CPU/memory/DB)?
    *   Correlate load testing tool results with application/system monitoring data.
    *   Identify areas for optimization.
9.  **Iterate**: Make changes to your code, configuration, or infrastructure based on the analysis, and re-run the load test to verify improvements.

**Example (Conceptual Locustfile - `locustfile.py`):**

```python
from locust import HttpUser, task, between
import random

class FastAPIUser(HttpUser):
    wait_time = between(0.5, 2.5) # Simulate think time between 0.5 and 2.5 seconds
    host = "http://127.0.0.1:8000" # Target FastAPI app

    # Example task weights - users are more likely to read items
    @task(10) 
    def read_item(self):
        # Assume items with names like "Item 1", "Item 2", ... exist
        item_name = f"Item {random.randint(1, 100)}" 
        # Use self.client which is an HttpSession instance (like requests)
        self.client.get(f"/items/{item_name}", name="/items/[item_name]") # Name groups URLs in stats

    @task(2)
    def create_item(self):
        item_id = random.randint(1000, 9999)
        item_name = f"Locust Item {item_id}"
        self.client.post(
            "/items/",
            json={"name": item_name, "price": round(random.uniform(1, 100), 2)},
            name="/items/" 
        )
        
    @task(1)
    def view_root(self):
        self.client.get("/")

    def on_start(self):
        # Optional: Code to run when a user starts (e.g., login)
        print("New user starting...")
        # self.client.post("/login", json={"username": "testuser", "password": "password"})
        pass
```

**To run Locust:**
1.  `pip install locust`
2.  `locust -f locustfile.py`
3.  Open your browser to `http://localhost:8089` (default Locust UI port).
4.  Configure the number of users and spawn rate, then start the test.

Load testing is an iterative process essential for building performant and reliable FastAPI applications that can handle real-world traffic.

    