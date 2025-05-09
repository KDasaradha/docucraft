---
title: Kafka Integration with FastAPI
---

# Kafka Integration with FastAPI

**Original Description**: Using Kafka with FastAPI for asynchronous communication and event-driven architectures.

Integrating Apache Kafka with FastAPI enables asynchronous communication patterns, facilitating event-driven architectures and decoupling services. FastAPI applications can act as Kafka **producers** (publishing messages/events to Kafka topics) or **consumers** (subscribing to topics and processing messages).

**Why Use Kafka with FastAPI?**

*   **Decoupling**: Services communicate indirectly through Kafka topics. Producers don't need to know about consumers, and vice-versa. This reduces dependencies between services.
*   **Asynchronous Communication**: Producers can publish messages without waiting for consumers to process them, improving responsiveness.
*   **Event-Driven Architecture**: Enables building systems where services react to events published by other services, promoting loose coupling and flexibility.
*   **Scalability**: Kafka is designed for high throughput and horizontal scalability. Both producers and consumers can be scaled independently.
*   **Resilience/Fault Tolerance**: Kafka stores messages persistently in topics (distributed logs). If a consumer service is temporarily unavailable, messages remain in Kafka until the consumer recovers and processes them (based on consumer group offsets).
*   **Data Streaming**: Kafka is fundamentally a streaming platform, suitable for handling continuous streams of data.

**Common Integration Patterns:**

1.  **FastAPI as a Kafka Producer**:
    *   **Scenario**: A FastAPI endpoint performs an action (e.g., creates an order, updates user profile) and publishes an event message to a Kafka topic to notify other interested services.
    *   **Libraries**: `kafka-python` (pure Python), `confluent-kafka-python` (librdkafka bindings, often higher performance).

2.  **FastAPI as a Kafka Consumer**:
    *   **Scenario**: A FastAPI application (or more commonly, a separate background service potentially using FastAPI components) listens to Kafka topics, consumes messages, and performs actions based on those messages (e.g., sending notifications, updating a search index, triggering workflows).
    *   **Considerations**: Running a long-running Kafka consumer loop directly within a standard FastAPI request-response worker isn't ideal. Typically, consumers are run as separate processes or background tasks managed by tools like `supervisor`, `systemd`, Kubernetes deployments, or frameworks designed for stream processing. However, you *could* potentially use FastAPI's `lifespan` events or background tasks for simple consumer logic, being careful not to block the main application.

**Example: FastAPI as a Kafka Producer (using `kafka-python`)**

1.  **Install Library**: `pip install kafka-python`
2.  **Setup**: Ensure Kafka broker(s) are running (e.g., locally via Docker or a managed service).
3.  **FastAPI Code**:

    ```python
    # main_producer.py
    import os
    import json
    import logging
    from fastapi import FastAPI, HTTPException, Request
    from kafka import KafkaProducer
    from kafka.errors import KafkaError
    from pydantic import BaseModel

    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # Configuration
    KAFKA_BOOTSTRAP_SERVERS = os.environ.get('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
    ORDER_TOPIC = 'order_events'

    # Global producer instance (handle connection management)
    producer: KafkaProducer | None = None

    app = FastAPI(title="Order Service Producer")

    @app.on_event("startup")
    def startup_producer():
        global producer
        try:
            producer = KafkaProducer(
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                # Optional: add request_timeout_ms, retries, acks ('all', 1, 0)
                acks='all', # Ensure message is acknowledged by leader and replicas
                retries=3,
            )
            logger.info(f"KafkaProducer connected to {KAFKA_BOOTSTRAP_SERVERS}")
        except KafkaError as e:
            logger.error(f"Failed to initialize Kafka Producer: {e}")
            producer = None # Ensure it's None if connection fails

    @app.on_event("shutdown")
    def shutdown_producer():
        if producer:
            producer.close()
            logger.info("KafkaProducer connection closed.")

    class Order(BaseModel):
        order_id: int
        user_id: int
        product_id: int
        quantity: int
        status: str = "PENDING"

    def kafka_send_block(topic: str, value: dict):
        """Synchronous blocking send with error handling for use outside async endpoints if needed"""
        if not producer:
            logger.error("Kafka producer not initialized.")
            return False
        try:
            # send() is asynchronous but KafkaProducer handles batching/background sending.
            # flush() blocks until messages are sent or timeout.
            future = producer.send(topic, value=value)
            record_metadata = future.get(timeout=10) # Block until sent, with timeout
            logger.info(f"Message sent to {record_metadata.topic} partition {record_metadata.partition} offset {record_metadata.offset}")
            return True
        except KafkaError as e:
            logger.error(f"Failed to send message to Kafka topic {topic}: {e}")
            return False
        except Exception as e: # Catch other potential errors like timeout
            logger.error(f"An unexpected error occurred sending to Kafka: {e}")
            return False
            
    @app.post("/orders/", status_code=201)
    async def create_order(order: Order, request: Request): # Inject Request for potential context
        # 1. Persist order to database (ideally happens first)
        logger.info(f"Received order: {order.model_dump()}")
        # ... database logic ...
        order.status = "CREATED" # Update status after DB persistence

        # 2. Produce event to Kafka
        event_payload = {
            "event_type": "ORDER_CREATED",
            "order": order.model_dump(),
            "timestamp": request.headers.get("X-Request-Time", "N/A"), # Example context
            "request_id": request.headers.get("X-Request-ID", "N/A")
        }

        if kafka_send_block(ORDER_TOPIC, event_payload):
            return {"message": "Order created and event published.", "order": order}
        else:
            # Decide how to handle Kafka failure. Maybe the order creation should fail?
            # Or just log and monitor? Depends on requirements.
            # Here, we'll proceed but indicate the event failed.
            logger.warning(f"Order {order.order_id} created, but failed to publish Kafka event.")
            # Returning 201 but with a warning message
            # Alternatively, could return a 503 or other error if Kafka publishing is critical
            return {"message": "Order created BUT failed to publish event.", "order": order}

    ```
    *   **Producer Initialization**: Connect the producer on application startup.
    *   **Serialization**: Configure a value serializer (e.g., JSON).
    *   **Sending**: Use `producer.send(topic, value)`. While `send` itself might not block extensively (it adds to an internal buffer), calling `producer.flush()` or `future.get()` (as in `kafka_send_block`) ensures messages are actually sent before proceeding or confirming success, providing stronger guarantees but adding potential latency. Choose based on required guarantees.
    *   **Error Handling**: Implement robust error handling for Kafka connection issues or send failures.
    *   **Shutdown**: Close the producer gracefully on application shutdown.

**Example: Basic Kafka Consumer (Conceptual - Run as separate process)**

```python
# consumer_service.py
import os
import json
import logging
from kafka import KafkaConsumer
from kafka.errors import KafkaError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

KAFKA_BOOTSTRAP_SERVERS = os.environ.get('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
ORDER_TOPIC = 'order_events'
CONSUMER_GROUP_ID = 'notification_service_group' # Important for scaling and offsets

def process_order_event(event: dict):
    """Placeholder for actual event processing logic."""
    event_type = event.get("event_type")
    order_data = event.get("order")
    
    if event_type == "ORDER_CREATED" and order_data:
        logger.info(f"Processing ORDER_CREATED event for order ID: {order_data.get('order_id')}")
        # E.g., Send email notification, update inventory, etc.
        # Simulate work
        import time
        time.sleep(1) 
        logger.info(f"Finished processing for order ID: {order_data.get('order_id')}")
    else:
        logger.warning(f"Received unknown event type or invalid data: {event}")

def run_consumer():
    consumer = None
    try:
        consumer = KafkaConsumer(
            ORDER_TOPIC,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            group_id=CONSUMER_GROUP_ID,
            value_deserializer=lambda v: json.loads(v.decode('utf-8')),
            auto_offset_reset='earliest', # Start reading at earliest message if no offset found
            enable_auto_commit=True, # Auto-commit offsets (easier) or False for manual control
            # consumer_timeout_ms=1000 # Optional: Stop iteration if no message for this duration
        )
        logger.info(f"KafkaConsumer connected and subscribed to topic '{ORDER_TOPIC}' with group '{CONSUMER_GROUP_ID}'")
        
        # Loop indefinitely, polling for messages
        for message in consumer:
            # message value and key are raw bytes -- decode if necessary!
            # value and key are already deserialized due to value_deserializer
            logger.debug(f"Received raw message: {message}")
            logger.info(f"Consumed message from partition {message.partition}, offset {message.offset}")
            process_order_event(message.value)
            # If enable_auto_commit=False, you'd call consumer.commit() here after successful processing

    except KafkaError as e:
        logger.error(f"Kafka Consumer error: {e}")
    except Exception as e:
        logger.error(f"An unexpected error occurred in consumer: {e}")
    finally:
        if consumer:
            consumer.close()
            logger.info("KafkaConsumer closed.")

if __name__ == "__main__":
    run_consumer()

```
*   **Run Separately**: `python consumer_service.py`
*   **Consumer Group**: `group_id` is essential. Kafka uses it to track which messages have been processed by a group of consumers. Multiple instances of a service using the same `group_id` will share the load of processing messages from the topic's partitions.
*   **Deserialization**: Configure a `value_deserializer`.
*   **Offset Management**: `auto_offset_reset` determines where to start reading if the consumer group has no committed offset. `enable_auto_commit=True` periodically commits the latest processed offset automatically in the background (simpler but risks message loss if a crash occurs after commit but before processing finishes). Manual commits (`enable_auto_commit=False`, `consumer.commit()`) offer more control ("at-least-once" or "exactly-once" processing semantics, depending on implementation).
*   **Processing Loop**: The `for message in consumer:` loop blocks until new messages arrive (or timeout).

**Considerations:**

*   **Schema Management**: For robust communication, use a schema registry (like Confluent Schema Registry) and Avro/Protobuf for message schemas instead of plain JSON.
*   **Error Handling**: Implement strategies for handling message processing failures (e.g., dead-letter queues).
*   **Idempotency**: Consumers should often be idempotent (processing the same message multiple times should not cause issues), as message delivery guarantees can sometimes lead to reprocessing.
*   **Async Consumers**: Libraries like `aiokafka` provide fully asynchronous consumer clients that integrate better with `asyncio`-based services if you choose to run consumer logic within an async framework.

Integrating Kafka provides powerful asynchronous capabilities but adds operational complexity compared to direct synchronous communication. Choose it when the benefits of decoupling, scalability, and event-driven patterns outweigh the added infrastructure requirements.

    