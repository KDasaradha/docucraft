---
title: Celery Integration with FastAPI
---

# Celery Integration with FastAPI

**Original Description**: Using Celery with FastAPI for handling background tasks and asynchronous processing.

Integrating Celery with FastAPI allows you to offload tasks that are time-consuming, resource-intensive, or don't need to be completed within the immediate request-response cycle. This keeps your API endpoints responsive and delegates heavier work to background worker processes.

**Why Use Celery with FastAPI?**

*   **Improved API Responsiveness**: Prevent long-running tasks (e.g., sending emails, generating reports, complex calculations, video processing) from blocking your API response. The API can quickly acknowledge the request and queue the task for background processing.
*   **Distributed Task Execution**: Celery workers can run on separate machines, allowing you to scale your background processing power independently of your API servers.
*   **Reliability and Retries**: Celery provides mechanisms for task retries on failure, ensuring tasks eventually complete even if transient issues occur.
*   **Scheduling**: Celery Beat allows scheduling tasks to run periodically (e.g., nightly cleanup jobs).
*   **Monitoring**: Tools like Flower provide visibility into Celery tasks and workers.

**Steps for Integration:**

1.  **Install Celery and a Message Broker Client**:
    You need Celery and a Python client library for your chosen message broker (Redis or RabbitMQ are common).
    ```bash
    pip install celery "redis[redis]" # Using Redis as the broker and result backend
    # OR
    # pip install celery librabbitmq # Using RabbitMQ (may need C library)
    ```

2.  **Configure Celery Application**:
    Create a Python module (e.g., `worker/celery_app.py`) to configure your Celery instance.

    ```python
    # worker/celery_app.py
    import os
    from celery import Celery

    # Use environment variables for broker/backend URLs in production
    broker_url = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
    result_backend_url = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

    # Create Celery instance
    celery = Celery(
        __name__, # Use the module name, helps Celery find tasks
        broker=broker_url,
        backend=result_backend_url,
        include=['worker.tasks'] # List of modules where tasks are defined
    )

    # Optional Celery configuration
    celery.conf.update(
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
        # Optional: Task routing, rate limits, etc.
        # task_routes = {
        #     'worker.tasks.send_email': {'queue': 'emails'},
        # },
    )

    # Optional: Autodiscover tasks from modules listed in 'include'
    # celery.autodiscover_tasks() # Can be used instead of explicit 'include' if structure allows

    ```

3.  **Define Celery Tasks**:
    Create another module (e.g., `worker/tasks.py`, matching the `include` path in the config) to define your background tasks using the `@celery.task` decorator.

    ```python
    # worker/tasks.py
    import time
    import random
    from .celery_app import celery # Import the configured Celery instance

    @celery.task(bind=True, max_retries=3, default_retry_delay=5) # Example retry config
    def process_data_task(self, self, data: dict): # `bind=True` gives access to `self` (the task instance)
        """Simulates processing some data."""
        try:
            task_id = self.request.id
            print(f"Task {task_id}: Starting data processing for: {data.get('user_id')}")
            
            # Simulate processing time
            processing_time = random.uniform(2, 6)
            time.sleep(processing_time)

            # Simulate potential failure
            if random.random() < 0.1: # 10% chance of failure
                 print(f"Task {task_id}: Simulating failure...")
                 raise ValueError("A simulated processing error occurred")

            result = {"processed": True, "user_id": data.get('user_id'), "time_taken": processing_time}
            print(f"Task {task_id}: Data processing complete.")
            return result
        except Exception as exc:
            print(f"Task {task_id}: Processing failed. Retrying if possible...")
            # Retry the task automatically based on max_retries and default_retry_delay
            # self.retry() could also take specific args like `countdown=10`
            raise self.retry(exc=exc)


    @celery.task
    def send_email_task(recipient: str, subject: str, body: str):
        """Simulates sending an email."""
        print(f"Task send_email_task: Preparing to send email to {recipient}...")
        time.sleep(3) # Simulate network delay
        print(f"Task send_email_task: Email supposedly sent to {recipient} with subject '{subject}'.")
        return {"status": "success", "recipient": recipient}

    ```

4.  **Trigger Tasks from FastAPI**:
    Import your task functions into your FastAPI application and call `.delay()` or `.apply_async()` to queue them.

    ```python
    # main.py (FastAPI app)
    from fastapi import FastAPI, HTTPException, status
    from pydantic import BaseModel, EmailStr
    
    # Import tasks defined in worker/tasks.py
    from worker.tasks import process_data_task, send_email_task

    app = FastAPI()

    class UserData(BaseModel):
        user_id: int
        payload: str

    class EmailSchema(BaseModel):
        recipient: EmailStr
        subject: str
        body: str

    @app.post("/process-data")
    async def submit_data_processing(data: UserData):
        """Submits data for background processing via Celery."""
        task = process_data_task.delay(data.model_dump()) # Use model_dump() for Pydantic V2
        print(f"Queued data processing task {task.id} for user {data.user_id}")
        return {"message": "Data submitted for processing.", "task_id": task.id}

    @app.post("/send-notification")
    async def send_notification_email(email_data: EmailSchema):
        """Sends an email in the background via Celery."""
        task = send_email_task.delay(
            recipient=email_data.recipient, 
            subject=email_data.subject, 
            body=email_data.body
        )
        print(f"Queued email task {task.id} to {email_data.recipient}")
        # Don't wait for email sending, return immediately
        return {"message": "Email notification queued.", "task_id": task.id}
        
    @app.get("/task-status/{task_id}")
    async def get_task_status(task_id: str):
        """Check the status and result of a Celery task (requires result backend)."""
        # Import AsyncResult from celery.result
        from celery.result import AsyncResult
        task_result = AsyncResult(task_id, app=send_email_task.app) # Use app from one of the tasks

        response = {
            "task_id": task_id,
            "status": task_result.status,
            "result": None,
        }
        
        if task_result.successful():
            response["result"] = task_result.get()
        elif task_result.failed():
            # Get the traceback/error message
            try:
                # Getting the result of a failed task raises the original exception
                task_result.get() 
            except Exception as e:
                 # If you stored the exception info properly in backend, you might get it here
                 response["result"] = f"Task failed: {type(e).__name__} - {str(e)}"
                 # For more detail, you might need to inspect task_result.traceback
        elif task_result.status in ['PENDING', 'STARTED', 'RETRY']:
             response["result"] = f"Task is in state: {task_result.status}"

        return response

    ```

5.  **Run Celery Workers**:
    In your terminal, navigate to the directory containing your FastAPI app and the `worker` directory, and start the Celery worker(s). Make sure your broker (Redis/RabbitMQ) is running.

    ```bash
    # Ensure broker (e.g., Redis server) is running
    # redis-server & 

    # Start celery worker (use the module path to your Celery app instance)
    celery -A worker.celery_app worker --loglevel=info 

    # Or run multiple workers (concurrency)
    # celery -A worker.celery_app worker --loglevel=info -c 4 
    ```

6.  **Run FastAPI Application**:
    Start your FastAPI server as usual.
    ```bash
    uvicorn main:app --reload 
    ```

Now, when you hit the `/process-data` or `/send-notification` endpoints in FastAPI, the tasks will be sent to the message broker and picked up by the running Celery workers for execution in the background. You can monitor the worker logs to see task processing. You can also optionally use the `/task-status/{task_id}` endpoint to check results if you configured a result backend.

## What message brokers are commonly used with Celery?

Celery requires a message broker to handle the communication between your application (the producer) and the Celery workers (the consumers). The broker receives task messages from your app and holds them until a worker is ready to process them.

The most commonly used message brokers with Celery are:

1.  **Redis**:
    *   **Description**: An in-memory data structure store, often used as a cache, database, and message broker.
    *   **Pros**: Very fast (in-memory), relatively simple to set up and manage, widely used and well-supported by Celery. Good choice if you're already using Redis for caching. Handles basic queueing well. Supports result backend storage easily.
    *   **Cons**: Primarily in-memory, so persistence requires configuration (AOF/RDB snapshots) and may not be as robust as disk-based brokers for message durability if Redis crashes without proper persistence setup. Less feature-rich in terms of complex routing and queueing protocols compared to RabbitMQ. Can consume significant RAM under heavy load.

2.  **RabbitMQ**:
    *   **Description**: A mature, robust, and feature-rich message broker that implements protocols like AMQP (Advanced Message Queuing Protocol).
    *   **Pros**: Highly reliable, persistent messaging (messages are typically stored on disk), supports complex routing scenarios (direct, topic, fanout exchanges), excellent management UI, supports message acknowledgments and confirmations for guaranteed delivery. Often considered the most robust choice for critical task queueing.
    *   **Cons**: More complex to set up and manage than Redis. Can have slightly higher latency than Redis due to disk persistence (though usually negligible for typical background tasks). Requires understanding AMQP concepts (exchanges, queues, bindings).

3.  **Amazon SQS (Simple Queue Service)**:
    *   **Description**: A fully managed message queuing service from AWS.
    *   **Pros**: Highly scalable, reliable, pay-as-you-go pricing, no infrastructure management required. Good choice if already heavily invested in the AWS ecosystem. Celery has experimental support.
    *   **Cons**: Potential for vendor lock-in. Configuration and monitoring might differ from Redis/RabbitMQ. Latency might be slightly higher than self-hosted brokers depending on network. Celery support might lag behind Redis/RabbitMQ sometimes.

**Other Options (Less Common with Celery or for specific use cases):**

*   **Kafka**: While Kafka *can* be used, Celery's primary model is task queues, whereas Kafka is fundamentally a distributed event log/streaming platform. Using Kafka as a Celero broker is less common and might not leverage Kafka's core strengths optimally compared to dedicated task queue brokers.
*   **Database Broker (SQLAlchemy/Django ORM - Experimental)**: Celery has experimental support for using a relational database as a broker. **This is generally NOT recommended for production** due to performance limitations and polling overhead.
*   **ZooKeeper**: Can be used but is less common now.

**Choosing a Broker:**

*   **Redis**: Often the default choice for simplicity and speed, especially if high message durability isn't the absolute top priority or if persistence is properly configured. Great if already using Redis.
*   **RabbitMQ**: The preferred choice when message durability, complex routing, guaranteed delivery, and protocol features (AMQP) are paramount. Ideal for critical tasks and complex microservice communication patterns.
*   **SQS**: A strong contender if you are deploying on AWS and prefer a managed service.

For most typical FastAPI + Celery integrations, both **Redis** and **RabbitMQ** are excellent and well-supported choices.

    