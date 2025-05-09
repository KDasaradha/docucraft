---
title: 2.1 Basic FastAPI Application
description: Learn how to create a minimal FastAPI application.
order: 1
---

# 2.1 Basic FastAPI Application

This page demonstrates the simplest way to create and run a FastAPI application.
We'll cover the initial setup and a basic "Hello World" example.

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return {"Hello": "World"}
```

Placeholder content for "Basic FastAPI Application".
