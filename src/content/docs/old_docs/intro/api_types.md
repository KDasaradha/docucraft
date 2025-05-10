---
title: API Types
description: Placeholder content for API Types.
order: 2
---

# API Types

Below are detailed notes for the "Types of APIs" section, expanding on your provided content. These notes include an overview of RESTful APIs, GraphQL APIs, SOAP APIs, and WebSockets, along with their key differences, use cases, and sample code snippets (using FastAPI where applicable). This content is designed to fit into your MkDocs structure, such as in `intro/api_types.md`.

---

### Detailed Notes: Types of APIs

```markdown
# Types of APIs

APIs come in various flavors, each designed to solve specific problems in software communication. This section explores four major types—**RESTful APIs**, **GraphQL APIs**, **SOAP APIs**, and **WebSockets**—detailing their characteristics, differences, and practical use cases. Code snippets demonstrate how these can be implemented, with a focus on FastAPI where relevant.

---

## Overview of API Types

### RESTful APIs
- **Definition**: Representational State Transfer (REST) APIs use HTTP methods (GET, POST, PUT, DELETE) to interact with resources identified by URLs. They are stateless and typically return data in JSON or XML.
- **Key Features**:
  - Lightweight and scalable.
  - Resource-based (e.g., `/users/1` for a specific user).
  - Uses standard HTTP status codes (e.g., 200 OK, 404 Not Found).
- **Use Cases**:
  - Web and mobile apps needing simple CRUD operations.
  - Public APIs (e.g., Twitter API, GitHub API).
- **Pros**: Easy to implement, widely supported, cacheable.
- **Cons**: Over-fetching or under-fetching data can occur.

### GraphQL APIs
- **Definition**: A query language for APIs that lets clients request exactly the data they need, avoiding over- or under-fetching. Developed by Facebook, it uses a single endpoint.
- **Key Features**:
  - Flexible queries (e.g., ask for specific fields).
  - Strongly typed schema.
  - Single endpoint (e.g., `/graphql`).
- **Use Cases**:
  - Apps with complex data needs (e.g., social networks).
  - Frontend-driven development where clients dictate data structure.
- **Pros**: Reduces network trips, precise data retrieval.
- **Cons**: Steeper learning curve, caching is harder.

### SOAP APIs
- **Definition**: Simple Object Access Protocol (SOAP) is a protocol for exchanging structured data, typically via XML, over HTTP or SMTP. It’s more rigid than REST.
- **Key Features**:
  - Strict standards (WSDL for service definition).
  - Built-in security (WS-Security).
  - Supports stateful operations.
- **Use Cases**:
  - Enterprise systems (e.g., banking, telecom).
  - Legacy integrations requiring reliability.
- **Pros**: Robust security, error handling, and ACID compliance.
- **Cons**: Heavyweight, complex XML parsing.

### WebSockets
- **Definition**: A protocol for full-duplex (two-way) communication over a single TCP connection, ideal for real-time applications.
- **Key Features**:
  - Persistent connection (unlike HTTP’s request-response).
  - Low latency for continuous data exchange.
  - Event-driven (server can push data to clients).
- **Use Cases**:
  - Chat apps, live notifications, gaming.
  - Real-time dashboards (e.g., stock prices).
- **Pros**: Real-time updates, efficient for frequent communication.
- **Cons**: Resource-intensive, harder to scale.

---

## Key Differences

| Feature            | RESTful         | GraphQL         | SOAP            | WebSockets      |
|--------------------|-----------------|-----------------|-----------------|-----------------|
| **Protocol**       | HTTP            | HTTP            | HTTP/SMTP       | WebSocket (ws)  |
| **Data Format**    | JSON/XML        | JSON            | XML             | Any (often JSON)|
| **Communication**  | Request-Response| Request-Response| Request-Response| Full-Duplex     |
| **State**          | Stateless       | Stateless       | Stateful option | Persistent      |
| **Complexity**     | Simple          | Moderate        | High            | Moderate        |
| **Use Case**       | CRUD Operations | Flexible Queries| Enterprise      | Real-Time       |

---

## Code Snippets

### 1. RESTful API with FastAPI
A simple RESTful endpoint to manage users.

```python
from fastapi import FastAPI

app = FastAPI()

users = {"1": {"name": "Alice", "age": 25}}

@app.get("/users/{user_id}")
def get_user(user_id: str):
    return users.get(user_id, {"error": "User not found"})

@app.post("/users/{user_id}")
def create_user(user_id: str, name: str, age: int):
    users[user_id] = {"name": name, "age": age}
    return {"message": "User created", "data": users[user_id]}
```

- **Run**: `uvicorn main:app --reload`
- **Test**:
  - `curl -X POST "http://127.0.0.1:8000/users/2?name=Bob&age=30"`
  - `curl http://127.0.0.1:8000/users/2` → `{"name": "Bob", "age": 30}`

---

### 2. GraphQL API (Using Strawberry with FastAPI)
GraphQL requires a schema and resolver. Here’s a basic example.

```python
from fastapi import FastAPI
from strawberry import Schema, type, Query
from strawberry.fastapi import GraphQLRouter

app = FastAPI()

@type
class User:
    name: str
    age: int

@type
class Query:
    @staticmethod
    def user(name: str) -> User:
        return User(name=name, age=25)

schema = Schema(query=Query)
graphql_app = GraphQLRouter(schema)

app.include_router(graphql_app, prefix="/graphql")
```

- **Run**: `uvicorn main:app --reload`
- **Query** (via POST to `http://127.0.0.1:8000/graphql`):
  ```graphql
  query {
    user(name: "Alice") {
      name
      age
    }
  }
  ```
- **Response**: `{"data": {"user": {"name": "Alice", "age": 25}}}`

---

### 3. SOAP API (Using Zeep Client)
SOAP isn’t natively supported in FastAPI, so here’s a client example calling a public SOAP service.

```python
from zeep import Client

# Public SOAP service for number conversion
wsdl = "http://www.dataaccess.com/webservicesserver/numberconversion.wso?WSDL"
client = Client(wsdl)

result = client.service.NumberToWords(500)
print(result)  # Output: "five hundred"
```

- **Use Case**: Integrate with legacy SOAP services from a FastAPI app.

---

### 4. WebSockets with FastAPI
A real-time chat endpoint.

```python
from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Echo: {data}")
```

- **Run**: `uvicorn main:app --reload`
- **Test**: Use a WebSocket client (e.g., `wscat`):
  ```bash
  wscat -c ws://127.0.0.1:8000/ws
  # Type: "Hello" → Response: "Echo: Hello"
  ```

---

## Use Cases in Depth

- **RESTful**: Ideal for a blog app where you fetch posts (`GET /posts`), add comments (`POST /comments`), or update profiles (`PUT /users/1`).
- **GraphQL**: Perfect for a dashboard where users customize data (e.g., fetch only usernames and emails, not full profiles).
- **SOAP**: Suited for a banking app needing secure, transactional updates (e.g., fund transfers).
- **WebSockets**: Great for a live sports score app pushing updates to users instantly.

---

## Choosing the Right API Type
- **Simplicity**: Go with REST (e.g., FastAPI).
- **Flexibility**: Use GraphQL for client-driven queries.
- **Reliability**: Pick SOAP for enterprise-grade stability.
- **Real-Time**: Opt for WebSockets when latency matters.

Each type shines in its domain—FastAPI excels at REST and WebSockets, making it a versatile choice for modern apps!

---
```

---

### Explanation of the Notes
1. **Structure**: Organized into overview, differences table, code snippets, and use cases for clarity.
2. **Depth**: Each API type includes definition, features, pros/cons, and practical applications.
3. **Code Snippets**:
   - **REST**: Basic CRUD with FastAPI.
   - **GraphQL**: Integrated with FastAPI using Strawberry (a Python GraphQL library).
   - **SOAP**: Client-side example (FastAPI doesn’t natively support SOAP servers).
   - **WebSockets**: Real-time example with FastAPI’s built-in support.
4. **Comparison**: Table highlights key distinctions for quick reference.
5. **Tone**: Informative, technical, and aligned with your guide’s style.

---

### File Naming for MkDocs
- **Suggested Name**: `intro/api_types.md`
  - **Why**: Fits under "Introduction to APIs" and focuses on API types.
  - **Path**: `docs/intro/api_types.md`

Update your `mkdocs.yml`:
```yaml
nav:
  - Home: index.md
  - Introduction to APIs:
    - What is an API?: intro/api.md
    - Types of APIs: intro/api_types.md
  # Other sections...
```

---

### Feedback
- Want more examples (e.g., advanced GraphQL queries)?
- Need deeper explanations for any type?
- Should I adjust the code complexity?

Let me know how I can refine this further for your FastAPI Guide!
