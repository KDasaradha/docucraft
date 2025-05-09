---
title: Data Streaming with Async Generators
---

# Data Streaming with Async Generators

**Original Description**: Using asynchronous generators with FastAPI's `StreamingResponse` for efficient data streaming.

FastAPI's `StreamingResponse` allows you to send response content piece by piece, without loading the entire response into memory first. This is ideal for large files, real-time data feeds, or responses generated incrementally. Asynchronous generators (`async def` functions using `yield`) are a natural and Pythonic way to produce the content chunks for `StreamingResponse`.

**How Async Generators Work:**

An async generator is defined like an `async` function but uses the `yield` keyword one or more times to produce a sequence of values. When awaited in a loop (e.g., `async for item in async_generator():`), the generator executes until it hits a `yield`, produces the value, pauses its state, and allows the loop to process the value. On the next iteration, the generator resumes from where it paused.

**Using Async Generators with `StreamingResponse`:**

1.  **Define an Async Generator Function**: This function will `yield` chunks of data (usually `bytes` or `str`). It can perform async operations (like reading from a file, database, or external API) between yields.
2.  **Create `StreamingResponse`**: Instantiate `StreamingResponse`, passing your async generator function (or the result of calling it) as the `content` argument.
3.  **Set Media Type**: Specify the appropriate `media_type` (e.g., `text/csv`, `application/json-seq`, `text/event-stream`, `application/octet-stream`).

**Example 1: Streaming a Large CSV File**

Assume you have a potentially large dataset you want to stream as CSV without loading it all into memory.

```python
import asyncio
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import io # For simulating an in-memory CSV or reading line-by-line

app = FastAPI()

# Simulate generating rows of data asynchronously (e.g., from DB cursor)
async def generate_large_csv_data():
    yield "id,name,value\n" # Header row
    for i in range(1000): # Simulate 1000 data rows
        # In reality, this could be `await fetch_row_from_db(i)`
        await asyncio.sleep(0.001) # Simulate async I/O delay per row
        name = f"Item {i}"
        value = i * i
        yield f"{i},{name},{value}\n" # Yield one CSV row at a time

@app.get("/stream-csv")
async def stream_csv():
    """Streams a large CSV file generated asynchronously."""
    
    # Pass the async generator function directly to StreamingResponse
    # FastAPI/Starlette will iterate over it asynchronously.
    return StreamingResponse(
        content=generate_large_csv_data(), 
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=large_data.csv"} # Prompt download
    )

# To run: uvicorn main:app --reload
# Access http://127.0.0.1:8000/stream-csv in your browser or with curl.
# The download will start immediately, and the server won't load all 1000 rows into memory at once.
```

**Example 2: Streaming JSON Lines (or JSON Sequence)**

Useful for streaming a sequence of JSON objects. Each object is on its own line.

```python
import asyncio
import json
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List

app = FastAPI()

class EventData(BaseModel):
    event_id: int
    type: str
    payload: dict

# Simulate an async source of events
async def generate_json_events():
    for i in range(50):
        await asyncio.sleep(0.05) # Simulate delay between events
        event = EventData(
            event_id=i,
            type="MEASUREMENT",
            payload={"value": i * 10, "unit": "cm"}
        )
        # Yield each event as a JSON string followed by a newline
        # Use model_dump_json for Pydantic V2
        yield event.model_dump_json() + "\n" 
        # yield event.json() + "\n" # For Pydantic V1

@app.get("/stream-json-events")
async def stream_json_events():
    """Streams a sequence of JSON events, one per line."""
    return StreamingResponse(
        content=generate_json_events(),
        # Common media types for JSON sequences/lines:
        # media_type="application/json-seq" 
        media_type="application/x-ndjson" # Newline Delimited JSON is also common
        # media_type="text/plain" # Or just plain text if consumers expect simple lines
    )
```

**Example 3: Server-Sent Events (SSE)**

SSE is a specific streaming protocol built on HTTP where the server pushes updates to the client over a persistent connection. While `StreamingResponse` can be used, dedicated SSE libraries or Starlette's `EventSourceResponse` often provide more convenient helpers for formatting SSE messages correctly. However, an async generator can still be the source.

```python
import asyncio
import datetime
from fastapi import FastAPI, Request
# Using Starlette's EventSourceResponse for proper SSE formatting
from starlette.responses import EventSourceResponse 

app = FastAPI()

async def generate_sse_updates():
    """Async generator producing data for SSE."""
    count = 0
    while True:
        # Simulate generating an update
        await asyncio.sleep(1) # Wait 1 second
        now = datetime.datetime.now().isoformat()
        count += 1
        
        # Data to be sent (can be simple string or JSON string)
        data_payload = json.dumps({"time": now, "count": count})
        
        # Yield data formatted for SSE (can be simplified with EventSourceResponse)
        # yield f"id: {count}\n" # Optional event ID
        # yield f"event: message\n" # Optional event type
        # yield f"data: {data_payload}\n\n" # Data field, followed by double newline

        # When using EventSourceResponse, just yield the dictionary or string payload
        yield {"id": count, "event": "update", "data": data_payload} 
        
        # How to stop? Check request disconnect or add stop condition
        # Example: if count > 10: break 


@app.get("/sse-updates")
async def sse_endpoint(request: Request): # Inject request to check for disconnect
    """Endpoint for Server-Sent Events."""
    
    # Wrap generator to handle client disconnect
    async def event_generator():
        try:
            async for event_data in generate_sse_updates():
                if await request.is_disconnected():
                    print("SSE Client disconnected.")
                    break # Stop sending events if client disconnects
                yield event_data 
        except asyncio.CancelledError:
             print("SSE task cancelled.") # Generator task cancelled
             raise
             
    return EventSourceResponse(event_generator())

```

**Benefits of Using Async Generators for Streaming:**

*   **Memory Efficiency**: Data is generated and sent in chunks, avoiding loading the entire response content into memory. Crucial for large datasets or infinite streams.
*   **Responsiveness (Time to First Byte)**: The client starts receiving the first chunks of data much sooner, as the server doesn't wait to generate the entire response before sending.
*   **Natural Fit for Async I/O**: Async generators seamlessly integrate `await` calls for fetching data from databases, files, or external services incrementally.
*   **Clean Code**: Provides a clean and Pythonic way to represent a sequence of data produced over time or from a large source.

When dealing with large responses or real-time data feeds in FastAPI, leveraging `StreamingResponse` with asynchronous generators is the standard and most efficient approach.

    