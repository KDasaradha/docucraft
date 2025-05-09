---
title: 17.1 Async Data Streaming with Async Generators
description: Utilizing async generators in FastAPI for efficient data streaming.
order: 1
---

# 17.1 Async Data Streaming with Async Generators

FastAPI supports streaming responses using async generators, which is useful for sending large amounts of data or for server-sent events (SSE).

This section explains:
- What async generators are and how they work in Python.
- How to use `StreamingResponse` with an async generator in FastAPI.
- Examples of streaming text, JSON, or other data formats.
- Use cases like live data feeds or large file downloads.

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio

app = FastAPI()

async def fake_data_streamer():
    for i in range(10):
        yield f"data: Event {i}\n\n"
        await asyncio.sleep(0.5)

@app.get("/stream")
async def stream_data():
    return StreamingResponse(fake_data_streamer(), media_type="text/event-stream")

```

Placeholder content for "Async Data Streaming with Async Generators".
