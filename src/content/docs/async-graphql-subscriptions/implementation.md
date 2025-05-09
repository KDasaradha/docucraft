---
title: Async GraphQL Subscriptions with FastAPI
---

# Async GraphQL Subscriptions with FastAPI (e.g., using Strawberry)

**Original Description**: Implementing asynchronous GraphQL subscriptions in FastAPI for real-time data updates using WebSockets.

GraphQL Subscriptions allow clients to receive real-time updates from the server when specific events occur. They are typically implemented over WebSockets. Libraries like Strawberry, when used with FastAPI, can support asynchronous subscriptions.

**Key Concepts:**

1.  **Subscription Operation**: A type of GraphQL operation (alongside Query and Mutation) that establishes a persistent connection (usually WebSocket) and receives a stream of events.
2.  **Async Generators**: On the server-side (FastAPI/Strawberry), subscription fields are typically implemented as asynchronous Python generators (`async def my_sub(): yield ...`). Each `yield` from the generator sends an event to the subscribed client.
3.  **WebSocket Protocol**: Strawberry's FastAPI integration often uses a standard GraphQL over WebSocket protocol (like `graphql-ws` or `subscriptions-transport-ws`) to handle the communication.
4.  **Event Source**: The async generator needs a way to listen for or generate events. This could be:
    *   Polling a database.
    *   Listening to a message queue (Redis Pub/Sub, Kafka, RabbitMQ).
    *   Internal application events.
    *   A simple `asyncio.sleep` for periodic updates in demos.

**Example using Strawberry with FastAPI:**

1.  **Install Strawberry with WebSocket support**:
    `pip install "strawberry-graphql[fastapi,websockets]"`
    (You'll also need an ASGI server that supports WebSockets well, like Uvicorn).

2.  **Define Subscription in Strawberry Schema**:

    ```python
    # graphql_schema.py
    import strawberry
    import asyncio
    import datetime
    from typing import AsyncGenerator # For type hinting the async generator

    # Dummy event store (in a real app, this would be a message queue or event bus)
    # This simple list is NOT suitable for production as it's not shared across workers/instances
    # and not persistent. Use Redis Pub/Sub, Kafka, etc., for real applications.
    _event_queue = asyncio.Queue() 

    async def _publish_event(message: str):
        """Helper to simulate publishing an event to our simple queue."""
        timestamp = datetime.datetime.utcnow().isoformat()
        await _event_queue.put(f"{timestamp}: {message}")

    @strawberry.type
    class Message:
        content: str
        timestamp: str

    @strawberry.type
    class Subscription:
        @strawberry.subscription
        async def count(self, target: int = 5) -> AsyncGenerator[int, None]:
            """Counts from 0 up to (but not including) target, yielding each number."""
            print(f"Subscription 'count' started with target {target}")
            for i in range(target):
                await asyncio.sleep(1) # Simulate work or delay between events
                print(f"Subscription 'count' yielding: {i}")
                yield i
            print(f"Subscription 'count' finished for target {target}")

        @strawberry.subscription
        async def real_time_messages(self) -> AsyncGenerator[str, None]:
            """
            Yields messages as they are published to an internal (demo) event queue.
            In a real app, this would subscribe to Redis Pub/Sub, Kafka, etc.
            """
            print("Client subscribed to 'real_time_messages'")
            # Create a local queue for this specific subscriber to get messages from the shared queue
            # This is a simplistic approach. A more robust solution would use a broadcast pattern.
            # For a shared _event_queue, multiple subscribers would compete for messages.
            # This example demonstrates a more direct yield from a conceptual event source.
            
            # A better pattern for multiple subscribers to a single source:
            # Use a central broadcaster that manages individual subscriber queues.
            # For simplicity here, we'll imagine each call to this gets a "fresh" listen
            # or that _event_queue is handled by some external broadcaster.
            
            # This demo will just use a local queue to show the yielding mechanism
            local_q = asyncio.Queue()

            # Simulate putting some messages onto our "global" queue that this function might pick up
            # This part is just for demo. Normally, events come from elsewhere.
            async def _dummy_publisher_for_demo(q_ref):
                await _publish_event("Server started a new process!") # Publish to global queue
                await _publish_event("User X just signed up.")
                # These won't be directly picked by this subscription in current simple form
                # without a proper broadcaster. Let's put into local_q for demo.
                await q_ref.put("Direct message for this subscriber!")
                await asyncio.sleep(2)
                await q_ref.put("Another direct message after 2s!")


            # This task is just to simulate events being pushed for THIS subscriber's local queue
            # In a real app, you'd connect to an external event stream.
            publisher_task = asyncio.create_task(_dummy_publisher_for_demo(local_q))


            try:
                while True:
                    # Wait for a message from the local queue
                    message = await local_q.get()
                    print(f"Subscription 'real_time_messages' yielding: {message}")
                    yield message # Yield the message to the client
                    local_q.task_done() # Mark task as done for the queue
                    
                    # How to stop? This loop is infinite.
                    # Client disconnect should be handled by Strawberry/FastAPI to cancel the generator.
            except asyncio.CancelledError:
                print("Subscription 'real_time_messages' was cancelled (client disconnected).")
                # Clean up publisher_task if it's still running and tied to this subscription
                if not publisher_task.done():
                    publisher_task.cancel()
                raise # Re-raise CancelledError to ensure proper cleanup
            finally:
                print("Subscription 'real_time_messages' finished or was cancelled.")

    # Add Query and Mutation if needed (not strictly required for just subscriptions)
    @strawberry.type
    class Query:
        @strawberry.field
        def hello(self) -> str:
            return "World. Subscriptions are available."

    # Create schema, including the Subscription type
    schema = strawberry.Schema(query=Query, subscription=Subscription)
    ```

3.  **Mount Strawberry GraphQL App in FastAPI**:
    The `GraphQLRouter` from Strawberry will handle WebSocket connections for subscriptions automatically if WebSockets are enabled in your ASGI server.

    ```python
    # main.py
    from fastapi import FastAPI
    from strawberry.fastapi import GraphQLRouter
    from .graphql_schema import schema, _publish_event # Import schema and publisher for demo

    app = FastAPI()

    # Create the GraphQL router, Strawberry handles WebSocket connections for subscriptions
    graphql_app = GraphQLRouter(
        schema,
        graphiql=True # GraphiQL UI also supports subscriptions
    )

    app.include_router(graphql_app, prefix="/graphql")

    # Dummy endpoint to trigger a message for the real_time_messages subscription (for demo)
    @app.post("/publish-message")
    async def publish_message_endpoint(message: str):
        await _publish_event(message) # Publish to the shared queue
        return {"status": "Message published to internal queue", "message_sent": message}

    # To run: uvicorn main:app --reload
    # Open http://127.0.0.1:8000/graphql in your browser.
    #
    # In GraphiQL, you can run subscriptions:
    #
    # Subscription 1 (Counter):
    # subscription {
    #   count(target: 7)
    # }
    #
    # Subscription 2 (Real-time messages - try POSTing to /publish-message via curl/Postman):
    # subscription {
    #   realTimeMessages
    # }
    #
    # To test publishing from another terminal:
    # curl -X POST "http://127.0.0.1:8000/publish-message?message=HelloFromCurl" -d ""
    ```

**Explanation and Key Points:**

*   **`AsyncGenerator[ReturnType, None]`**: The type hint for a subscription resolver. It yields `ReturnType` and doesn't expect to receive anything back via `send()` from the client (hence `None`).
*   **`yield`**: Each time the async generator `yield`s a value, Strawberry sends that value as an event to all subscribed clients for that particular subscription field and active operation.
*   **Client Disconnection**: When a client disconnects from a subscription, FastAPI/Strawberry should detect this and the `asyncio.CancelledError` will typically be raised in your async generator, allowing you to perform cleanup (e.g., unsubscribing from a message queue, closing resources). The `try...except asyncio.CancelledError...finally` block is important for this.
*   **Event Source**: The `real_time_messages` example uses a very simple in-memory `asyncio.Queue` for demonstration. **This is not suitable for production** because:
    *   It's not shared between multiple Uvicorn worker processes.
    *   Messages are lost if the application restarts.
    *   It doesn't easily support multiple subscribers getting the same message (fan-out).
*   **Production Event Sources**: For real-world applications, you would integrate with a proper pub/sub system:
    *   **Redis Pub/Sub**: Your async generator would subscribe to a Redis channel.
    *   **Kafka/RabbitMQ**: Your async generator (or a helper task) would consume messages from a topic/queue.
    *   **Database Change Streams/Notifications**: E.g., PostgreSQL `LISTEN/NOTIFY`.
*   **Scalability and State**: Managing subscription state (which client is subscribed to what) and fanning out messages to multiple subscribers across potentially multiple server instances requires careful architecture, often involving a message broker like Redis. Strawberry or other libraries might offer utilities or patterns for this ("Broadcasting").
*   **GraphiQL Support**: Modern versions of GraphiQL (which Strawberry often bundles) support executing subscription operations directly in the browser UI, making testing easy.

Asynchronous GraphQL subscriptions provide a powerful mechanism for building real-time features in your FastAPI applications, leveraging the async capabilities of both frameworks. Remember to choose a robust event source suitable for your production needs.

    