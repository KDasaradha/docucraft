---
title: Pydantic with Schema Registry (e.g., Confluent)
---

# Pydantic with Schema Registry (e.g., Confluent Schema Registry)

**Original Description**: Integrating Pydantic models with schema registries like Confluent Schema Registry for data validation and schema evolution in event-driven architectures.

In event-driven architectures, especially those using Kafka, ensuring data consistency and managing schema evolution for messages (events) is crucial. A **Schema Registry** (like Confluent Schema Registry, Apicurio Registry, or AWS Glue Schema Registry) helps address this by:

*   Storing and versioning schemas (e.g., Avro, Protobuf, JSON Schema).
*   Allowing producers and consumers to validate that the data they send/receive conforms to a registered schema.
*   Enforcing compatibility rules for schema evolution (e.g., backward, forward, full compatibility).

Pydantic models can be used in conjunction with a schema registry to:

1.  **Define Message Structures**: Use Pydantic models to define the structure of your Python application's representation of the messages.
2.  **Convert to/from Registry Format**: Convert Pydantic models to the schema format used by the registry (e.g., Avro schema from a Pydantic model) and vice-versa.
3.  **Data Validation**: Use Pydantic for client-side validation before producing a message or after consuming a message, in addition to the registry's validation.

**Conceptual Integration Workflow (using Avro and Confluent Schema Registry as an example):**

1.  **Define Pydantic Model**: The Python representation of your event.
    ```python
    from pydantic import BaseModel, Field, EmailStr
    from typing import List, Optional
    import datetime

    class UserInteractionEvent(BaseModel):
        user_id: int = Field(..., description="Unique identifier for the user.")
        interaction_type: str = Field(..., examples=["CLICK", "VIEW", "PURCHASE"])
        target_item_id: Optional[str] = None
        timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
        session_id: Optional[str] = None
        details: Optional[dict] = None # Generic details
    ```

2.  **Generate Schema for Registry (e.g., Avro)**:
    *   You need a way to convert your Pydantic model into an Avro schema (`.avsc` file content or dictionary).
    *   Libraries like `pydantic-avro` ([https://github.com/godatadriven/pydantic-avro](https://github.com/godatadriven/pydantic-avro)) can help automate this.
    *   Manually define the Avro schema if the Pydantic model is complex or if precise Avro feature control is needed.
    ```python
    # Example using pydantic-avro (conceptual)
    # from pydantic_avro import PydanticAvroSchema
    #
    # avro_schema_str = PydanticAvroSchema(UserInteractionEvent).avro_schema()
    # print(avro_schema_str) 
    # This would generate something like:
    # {
    #   "type": "record",
    #   "name": "UserInteractionEvent",
    #   "namespace": "com.example.events", // Often configured separately
    #   "fields": [
    #     {"name": "user_id", "type": "long"}, // pydantic int often maps to long
    #     {"name": "interaction_type", "type": "string"},
    #     {"name": "target_item_id", "type": ["null", "string"], "default": null},
    #     {"name": "timestamp", "type": {"type": "long", "logicalType": "timestamp-micros"}},
    #     {"name": "session_id", "type": ["null", "string"], "default": null},
    #     {"name": "details", "type": ["null", {"type": "map", "values": "string"}], "default": null} // Simplified dict mapping
    #   ]
    # }
    ```

3.  **Register Schema**: Register the generated Avro schema with the Confluent Schema Registry under a specific subject name (e.g., `user-interaction-event-value`). The registry assigns a schema ID.

4.  **Producer (FastAPI or other Python app)**:
    *   Use a Kafka client library that integrates with the Schema Registry (e.g., `confluent-kafka-python` with its `AvroSerializer`).
    *   When producing a message:
        1.  Create an instance of your Pydantic model.
        2.  The `AvroSerializer` (configured with the Schema Registry URL and subject name strategy) will:
            *   Fetch the latest schema ID for the subject (or a specific version).
            *   Serialize your Pydantic model instance into Avro binary format.
            *   Prepend the Avro binary data with a "magic byte" and the schema ID.
        3.  Send this binary payload to Kafka.

    ```python
    # producer_example.py (using confluent_kafka)
    # pip install confluent-kafka pydantic
    from confluent_kafka import Producer
    from confluent_kafka.serialization import StringSerializer, SerializationContext, MessageField
    from confluent_kafka.schema_registry import SchemaRegistryClient
    from confluent_kafka.schema_registry.avro import AvroSerializer
    import os

    # SCHEMA_REGISTRY_URL = os.environ.get('SCHEMA_REGISTRY_URL', 'http://localhost:8081')
    # KAFKA_BOOTSTRAP_SERVERS = os.environ.get('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
    # TOPIC_NAME = 'user_interactions'

    # # UserInteractionEvent Pydantic model defined as above

    # schema_registry_conf = {'url': SCHEMA_REGISTRY_URL}
    # schema_registry_client = SchemaRegistryClient(schema_registry_conf)

    # # For pydantic-avro generated schema string:
    # # avro_schema_str = PydanticAvroSchema(UserInteractionEvent).avro_schema_to_string()
    # # For this example, assume avro_schema_str is the schema string
    # avro_schema_str = """ ... your avro schema json string ... """ # Replace with actual schema

    # avro_serializer = AvroSerializer(schema_registry_client, avro_schema_str,
    #                                  # Optional: Define a to_dict function if model is not dict-like
    #                                  # to_dict=lambda obj, ctx: obj.model_dump() for Pydantic V2
    #                                  lambda obj, ctx: obj.dict() # for Pydantic V1
    #                                 )
    # producer_conf = {'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS}
    # producer = Producer(producer_conf)

    # def produce_event(event_data: UserInteractionEvent):
    #     try:
    #         producer.produce(topic=TOPIC_NAME,
    #                          key=str(event_data.user_id), # Example key
    #                          value=avro_serializer(event_data, SerializationContext(TOPIC_NAME, MessageField.VALUE)),
    #                          on_delivery=delivery_report)
    #         producer.poll(0) # Trigger delivery
    #     except Exception as e:
    #         print(f"Error producing message: {e}")

    # def delivery_report(err, msg):
    #     if err is not None:
    #         print(f"Message delivery failed: {err}")
    #     else:
    #         print(f"Message delivered to {msg.topic()} [{msg.partition()}] at offset {msg.offset()}")
            
    # # Example usage:
    # # if __name__ == "__main__":
    # #    test_event = UserInteractionEvent(user_id=123, interaction_type="CLICK", target_item_id="prod_abc")
    # #    produce_event(test_event)
    # #    producer.flush() # Wait for all messages to be delivered
    ```

5.  **Consumer (FastAPI background service or other Python app)**:
    *   Use a Kafka client library with Schema Registry integration (e.g., `confluent-kafka-python` with `AvroDeserializer`).
    *   When consuming a message:
        1.  The `AvroDeserializer` reads the magic byte and schema ID from the binary payload.
        2.  It fetches the corresponding schema from the Schema Registry (caching it locally).
        3.  It deserializes the Avro binary data into a dictionary (or a generated class if using specific Avro tooling).
        4.  You can then validate this dictionary and convert it into your Pydantic model instance for further processing and type safety within your application.

    ```python
    # consumer_example.py (using confluent_kafka)
    # from confluent_kafka import Consumer
    # from confluent_kafka.schema_registry.avro import AvroDeserializer
    # # ... other imports and Pydantic UserInteractionEvent model ...

    # # avro_deserializer = AvroDeserializer(schema_registry_client) # Schema string not needed for deserializer
    # consumer_conf = {
    #     'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
    #     'group.id': 'my_pydantic_consumer_group',
    #     'auto.offset.reset': 'earliest',
    #     # No direct value_deserializer here, AvroDeserializer handles raw bytes
    # }
    # consumer = Consumer(consumer_conf)
    # consumer.subscribe([TOPIC_NAME])

    # try:
    #     while True:
    #         msg = consumer.poll(1.0) # Poll for messages
    #         if msg is None: continue
    #         if msg.error():
    #             print(f"Consumer error: {msg.error()}")
    #             continue

    #         # Deserialize using AvroDeserializer
    #         # The deserializer needs the schema to be available in the registry
    #         # It will use the schema ID embedded in the message.
    #         try:
    #             # Assuming avro_deserializer is configured to return dicts
    #             deserialized_value_dict = avro_deserializer(msg.value(), SerializationContext(msg.topic(), MessageField.VALUE))
    #             # Now, parse the dictionary into your Pydantic model
    #             event_obj = UserInteractionEvent.model_validate(deserialized_value_dict) # Pydantic V2
    #             # event_obj = UserInteractionEvent.parse_obj(deserialized_value_dict) # Pydantic V1
                    
    #             print(f"Consumed and validated event: {event_obj}")
    #             # ... process event_obj ...
    #         except Exception as e:
    #             print(f"Error deserializing or validating message: {e}")
    #             # Handle poison pills or malformed messages

    # except KeyboardInterrupt:
    #     pass
    # finally:
    #     consumer.close()
    ```

**Benefits:**

*   **Data Contract Enforcement**: Ensures that producers and consumers adhere to a defined schema, reducing integration issues.
*   **Schema Evolution Management**: The registry enforces compatibility rules (backward, forward, full), allowing schemas to evolve without breaking existing producers or consumers immediately.
*   **Type Safety in Python**: Pydantic models provide type safety and auto-completion for message data within your Python application code after deserialization.
*   **Centralized Schema Definition**: Schemas are stored and versioned centrally.
*   **Reduced Boilerplate**: Serializer/deserializer libraries handle the complexities of interacting with the registry and Avro/Protobuf encoding.

**Challenges:**

*   **Tooling**: Requires setting up and managing a Schema Registry.
*   **Schema Conversion**: Converting between Pydantic models and registry schema formats (Avro, Protobuf) can sometimes be tricky, especially with complex Pydantic types or features not directly mappable. Libraries like `pydantic-avro` aim to simplify this.
*   **Learning Curve**: Teams need to understand schema registry concepts and the chosen serialization format (Avro, Protobuf).

Integrating Pydantic with a Schema Registry is highly beneficial for robust, maintainable, and evolvable event-driven systems, particularly those built around Kafka. It brings the data validation and developer experience strengths of Pydantic to the world of schematized message passing.

    