---
title: Types of APIs
---

# Types of APIs

**Original Description**: APIs include REST, GraphQL, SOAP, and WebSocket, each with distinct features and use cases.

The landscape of Application Programming Interfaces (APIs) is diverse, with different types designed to address various communication needs and architectural styles. Understanding these types helps in choosing the right API approach for a specific project. The most common types include REST, GraphQL, SOAP, and WebSocket APIs.

## Compare RESTful APIs with GraphQL APIs in terms of data fetching and flexibility.

REST (Representational State Transfer) and GraphQL are two popular approaches for building web APIs, but they differ significantly in how clients request and receive data.

| Feature             | RESTful APIs                                                                  | GraphQL APIs                                                                    |
| :------------------ | :---------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| **Data Fetching**   | **Fixed Data Structure per Endpoint**: Each endpoint returns a predefined structure. Clients get all or nothing from that structure. | **Client-Specified Data**: Clients request exactly the data they need, and nothing more. |
| **Number of Requests** | **Multiple Endpoints/Requests**: Often requires fetching data from multiple endpoints to gather all necessary information for a complex view (over-fetching or under-fetching common). | **Single Request**: Can fetch all required data in a single request to a single GraphQL endpoint, even if data spans multiple resources. |
| **Over-fetching**   | **Common**: Endpoints may return more data than the client needs (e.g., a `/users/{id}` endpoint returning all user fields when only the name is needed). | **Avoided**: Clients explicitly ask for fields, so over-fetching is inherently prevented. |
| **Under-fetching**  | **Common**: A single endpoint might not provide all necessary related data, requiring subsequent requests (e.g., fetch user, then fetch user's posts). | **Avoided**: Clients can request nested resources and their specific fields in one query. |
| **Endpoint Structure**| Multiple URLs (endpoints) representing different resources (e.g., `/users`, `/posts`, `/comments`). | Typically a single endpoint (e.g., `/graphql`) that accepts GraphQL queries.         |
| **Versioning**      | Often versioned via URL path (e.g., `/v1/users`) or headers. Can be complex to manage multiple versions. | Can evolve schema by adding new fields/types without breaking existing clients. Deprecating fields is a common strategy. |
| **Caching**         | Leverages HTTP caching mechanisms effectively due to distinct URLs for resources (GET requests are cacheable). | More complex to cache at the HTTP level due to a single endpoint and POST requests for queries. Client-side caching or tools like Apollo Client are common. |
| **Schema/Type System**| No built-in schema definition language (often uses OpenAPI/Swagger for description). | Strong type system and schema definition language (SDL) are core to GraphQL. Schema is introspectable. |
| **Client-Side Complexity** | Simpler for basic requests; clients just hit URLs. More complex for orchestrating multiple calls. | Can require more sophisticated client libraries (e.g., Apollo, Relay) to manage queries, caching, and state, but simplifies data fetching logic. |
| **Learning Curve**  | Generally considered easier to grasp initially due to alignment with HTTP. | Steeper learning curve for both client and server-side due to its query language and schema concepts. |
| **Use Cases**       | Good for resource-oriented services, public APIs where simplicity of access is key, and where HTTP caching is critical. | Ideal for applications with complex data requirements, mobile apps (minimizing data transfer), microservices aggregation, and when clients need flexibility. |

**Flexibility:**

*   **GraphQL**: Offers high flexibility to the client. Clients can tailor requests to their exact data needs, reducing the amount of data transferred and simplifying client-side data handling. This is particularly beneficial for mobile applications or frontends with varying data requirements.
*   **REST**: Less flexible from the client's perspective regarding data shaping. The server dictates the response structure for each endpoint. While query parameters can offer some filtering or field selection, it's not as granular or powerful as GraphQL's query language.

## What are the key features of SOAP APIs, and when are they preferred over REST?

SOAP (Simple Object Access Protocol) is a protocol specification for exchanging structured information in the implementation of web services.

**Key Features of SOAP APIs:**

1.  **XML-Based**: SOAP messages are formatted in XML. This includes the envelope, header, and body of the message.
2.  **Protocol Neutrality**: While commonly used over HTTP/HTTPS, SOAP can theoretically operate over other transport protocols like SMTP (email), TCP, etc.
3.  **Standardized**: SOAP is a W3C standard with well-defined specifications for message structure, error handling, and extensions.
4.  **WS-\* Standards (Web Services Standards)**: SOAP is often used with a suite of related standards known as WS-\*, which provide advanced functionalities:
    *   **WS-Security (WSS)**: Offers robust security features like message integrity, confidentiality (encryption), and authentication (e.g., digital signatures, SAML tokens).
    *   **WS-ReliableMessaging**: Ensures messages are delivered reliably, even over unreliable networks, with features like acknowledgments and retries.
    *   **WS-Addressing**: Provides mechanisms for addressing messages beyond simple URLs, useful in asynchronous scenarios.
    *   **WS-AtomicTransaction**: Enables distributed transactions across multiple services.
5.  **Built-in Error Handling**: SOAP has a standardized `<Fault>` element within the message body for reporting errors.
6.  **Strict Contracts (WSDL)**: SOAP APIs are typically described by a WSDL (Web Services Description Language) file. WSDL is an XML-based language that provides a machine-readable description of the API's operations, data types, and how to interact with it. This allows for easier client stub generation.
7.  **Stateful Operations**: SOAP is better suited for stateful operations where context needs to be maintained across multiple requests, often managed through WS-\* standards.

**When SOAP APIs might be preferred over REST:**

1.  **Enterprise-Level Security Requirements**: When advanced, message-level security features like digital signatures, encryption of specific message parts, or complex identity federation (e.g., SAML) are mandatory. WS-Security provides more comprehensive options than typical token-based security in REST.
2.  **High Reliability and Guaranteed Delivery**: For critical operations where message delivery must be guaranteed, even in the face of network issues. WS-ReliableMessaging offers capabilities beyond what standard HTTP provides.
3.  **Distributed Transactions**: When operations need to be part of an ACID transaction spanning multiple services or systems (e.g., financial transactions). WS-AtomicTransaction is designed for this.
4.  **Asynchronous Processing and Complex Messaging Patterns**: When the communication pattern is not a simple request-response, or when different transport protocols beyond HTTP are needed.
5.  **Legacy Systems Integration**: Many existing enterprise systems, especially older ones, may already expose SOAP APIs. Integrating with them often means using SOAP.
6.  **Strict Contract and Formalism**: In environments where a highly formal, machine-readable contract (WSDL) is essential for tooling, code generation, and ensuring interoperability across diverse platforms (e.g., .NET and Java enterprise applications).
7.  **Operations with Side Effects Only**: If an operation strictly performs an action and doesn't necessarily return a "resource" in the RESTful sense, SOAP's RPC-like style can be a more natural fit.

It's important to note that REST APIs can also implement robust security, reliability, and other features, but SOAP often provides these through standardized, built-in mechanisms via the WS-\* stack, which can be beneficial in certain enterprise contexts. However, SOAP is generally considered more verbose and complex than REST.

## Explain how WebSockets differ from traditional HTTP-based APIs.

WebSockets provide a different communication paradigm compared to traditional HTTP-based APIs (like REST or GraphQL over HTTP).

| Feature             | Traditional HTTP-based APIs (e.g., REST)                    | WebSocket APIs                                                        |
| :------------------ | :---------------------------------------------------------- | :-------------------------------------------------------------------- |
| **Connection**      | **Stateless, Connectionless (per request)**: Each HTTP request is typically independent and opens/closes a connection (or reuses one from a pool). | **Stateful, Persistent Connection**: Establishes a long-lived, bidirectional connection between client and server. |
| **Communication**   | **Client-Initiated Request-Response**: Client sends a request, server sends a response. Server cannot send data without a client request. | **Bidirectional, Full-Duplex**: Both client and server can send messages to each other independently at any time once the connection is established. |
| **Latency**         | Higher latency per message due to connection setup overhead for each request (though HTTP Keep-Alive mitigates this somewhat). | Lower latency for subsequent messages after initial handshake because the connection is already open. |
| **Overhead**        | HTTP headers are sent with every request and response, adding overhead. | Minimal framing overhead per message after the initial HTTP handshake. |
| **Protocol Upgrade**| Standard HTTP/HTTPS.                                       | Starts as an HTTP request with an `Upgrade` header, then "upgrades" to the WebSocket protocol (ws:// or wss://). |
| **Data Format**     | Typically JSON or XML over HTTP.                            | Can send binary data or text frames (UTF-8). The payload format (e.g., JSON within a text frame) is application-defined. |
| **Use Cases**       | CRUD operations, resource-oriented services, stateless interactions, fetching data on demand. | Real-time applications: chat, live notifications, online gaming, collaborative editing, live data streaming (stock tickers). |
| **Server Push**     | Limited (e.g., HTTP Long Polling, Server-Sent Events are workarounds for server-initiated updates). | Native server push capability. Server can send data to client without an explicit client request. |
| **Scalability**     | Scales well horizontally due to statelessness.             | Managing persistent connections can be more resource-intensive on the server, requiring different scaling strategies. |

**In summary:**

*   **HTTP-based APIs** are well-suited for traditional client-server interactions where the client requests data or actions, and the server responds. They are stateless and rely on the request-response model.
*   **WebSocket APIs** are designed for real-time, interactive applications where low-latency, bidirectional communication is essential. Once a WebSocket connection is established, it remains open, allowing either the client or the server to send messages efficiently without the overhead of new HTTP requests.

## When would you choose SOAP over REST for an API?

As detailed in the SOAP features section, you would generally choose SOAP over REST in scenarios requiring:

1.  **Advanced Enterprise Security**: Message-level security (WS-Security) beyond standard HTTPS and token-based auth.
2.  **Guaranteed Message Reliability**: When WS-ReliableMessaging is needed for critical operations.
3.  **Distributed ACID Transactions**: For operations spanning multiple services (WS-AtomicTransaction).
4.  **Non-HTTP Transport Protocols**: If you need to use protocols like SMTP or MQ for message transport.
5.  **Integration with Legacy Systems**: If existing systems only expose SOAP interfaces.
6.  **Formal, Strict Contracts (WSDL)**: When machine-readable contracts and associated tooling (like client stub generation) are paramount, especially in heterogeneous enterprise environments.
7.  **Complex Asynchronous Messaging Patterns**: Where standard HTTP request-response is insufficient.

## Explain the use case for WebSocket APIs in real-time applications.

WebSocket APIs are ideal for applications that require **instantaneous, bidirectional communication** between the client and the server. Here are some specific use cases:

Here's a simple Python example demonstrating real-time functionality:

```python
# Simple WebSocket server example
import asyncio
import websockets
import json

# Store connected clients
connected_clients = set()

async def handle_client(websocket, path):
    """Handle incoming WebSocket connections"""
    print(f"New client connected: {websocket.remote_address}")
    connected_clients.add(websocket)
    
    try:
        async for message in websocket:
            data = json.loads(message)
            
            # Broadcast message to all connected clients
            if data['type'] == 'chat_message':
                response = {
                    'type': 'chat_message',
                    'user': data['user'],
                    'message': data['message'],
                    'timestamp': asyncio.get_event_loop().time()
                }
                
                # Send to all connected clients
                disconnected = set()
                for client in connected_clients:
                    try:
                        await client.send(json.dumps(response))
                    except websockets.exceptions.ConnectionClosed:
                        disconnected.add(client)
                
                # Remove disconnected clients
                connected_clients -= disconnected
                
    except websockets.exceptions.ConnectionClosed:
        print(f"Client disconnected: {websocket.remote_address}")
    finally:
        connected_clients.discard(websocket)

# Start the WebSocket server
async def main():
    server = await websockets.serve(handle_client, "localhost", 8765)
    print("WebSocket server started on ws://localhost:8765")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
```

1.  **Chat Applications**:
    *   Users can send messages, and they appear immediately for other participants in the chat room.
    *   The server can push new messages to all connected clients in real-time.
    *   Typing indicators ("User X is typing...") can be implemented efficiently.

2.  **Online Multiplayer Games**:
    *   Player movements, actions, and game state changes need to be communicated to all players with minimal delay.
    *   WebSockets allow the game server to continuously stream updates to all connected clients.

3.  **Live Notifications and Alerts**:
    *   Social media notifications (new likes, comments, messages).
    *   System alerts or monitoring dashboards that update in real-time as events occur.
    *   E-commerce sites showing live updates on limited-stock items or auction bids.

4.  **Real-Time Data Dashboards**:
    *   Financial trading platforms displaying live stock prices or market data.
    *   Analytics dashboards showing real-time website traffic or system performance metrics.
    *   IoT dashboards displaying live sensor data.

5.  **Collaborative Editing Tools**:
    *   Applications like Google Docs or Figma, where multiple users can edit a document simultaneously, and changes made by one user are instantly visible to others.
    *   WebSockets facilitate the transmission of fine-grained changes (e.g., character insertions/deletions, cursor movements).

6.  **Live Streaming (Signaling & Interactive Features)**:
    *   While video/audio data itself might use WebRTC or other streaming protocols, WebSockets are often used for the signaling part (setting up connections) and for interactive features like live comments, polls, or Q&A during a stream.

7.  **Sports Scores and Live Updates**:
    *   Displaying live scores, play-by-play updates, and statistics for sporting events as they happen.

In all these cases, the traditional HTTP request-response model would be inefficient. Constantly polling the server for updates (HTTP polling) creates significant overhead and latency. WebSockets provide a much more efficient and responsive solution by maintaining an open channel for data to flow freely in both directions.

## Code Examples for Different API Types

### REST API Example

```python
# Python example using FastAPI for REST API
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

class User(BaseModel):
    id: Optional[int] = None
    username: str
    email: str
    is_active: bool = True

# In-memory storage for demo
users_db = []

@app.get("/users", response_model=List[User])
async def get_users():
    """Get all users"""
    return users_db

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    """Get a specific user by ID"""
    for user in users_db:
        if user.id == user_id:
            return user
    raise HTTPException(status_code=404, detail="User not found")

@app.post("/users", response_model=User)
async def create_user(user: User):
    """Create a new user"""
    user.id = len(users_db) + 1
    users_db.append(user)
    return user

@app.put("/users/{user_id}", response_model=User)
async def update_user(user_id: int, user_data: User):
    """Update an existing user"""
    for i, user in enumerate(users_db):
        if user.id == user_id:
            user_data.id = user_id
            users_db[i] = user_data
            return user_data
    raise HTTPException(status_code=404, detail="User not found")

# Usage example
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### GraphQL API Example

```python
# GraphQL example using Strawberry
import strawberry
from typing import List, Optional

@strawberry.type
class User:
    id: int
    username: str
    email: str
    is_active: bool

@strawberry.type
class Query:
    @strawberry.field
    def users(self) -> List[User]:
        """Get all users"""
        return [
            User(id=1, username="john_doe", email="john@example.com", is_active=True),
            User(id=2, username="jane_smith", email="jane@example.com", is_active=True),
        ]
    
    @strawberry.field
    def user(self, id: int) -> Optional[User]:
        """Get user by ID"""
        users = self.users()
        return next((user for user in users if user.id == id), None)

@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_user(self, username: str, email: str) -> User:
        """Create a new user"""
        new_id = 3  # In real app, this would be generated
        return User(id=new_id, username=username, email=email, is_active=True)

schema = strawberry.Schema(query=Query, mutation=Mutation)

# GraphQL query example
"""
query GetUsers {
  users {
    id
    username
    email
    isActive
  }
}

query GetUser($userId: Int!) {
  user(id: $userId) {
    id
    username
    email
  }
}

mutation CreateUser($username: String!, $email: String!) {
  createUser(username: $username, email: $email) {
    id
    username
    email
    isActive
  }
}
"""
```

### WebSocket API Example

```python
# WebSocket example using FastAPI
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import json
import asyncio

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: dict = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.user_connections[user_id] = websocket
        await self.broadcast_message({
            "type": "user_joined",
            "user_id": user_id,
            "message": f"User {user_id} joined the chat"
        })

    def disconnect(self, websocket: WebSocket, user_id: str):
        self.active_connections.remove(websocket)
        if user_id in self.user_connections:
            del self.user_connections[user_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_message(self, message: dict):
        message_text = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(message_text)
            except:
                # Remove disconnected clients
                self.active_connections.remove(connection)

manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Broadcast message to all connected clients
            await manager.broadcast_message({
                "type": "chat_message",
                "user_id": user_id,
                "message": message_data.get("message", ""),
                "timestamp": asyncio.get_event_loop().time()
            })
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        await manager.broadcast_message({
            "type": "user_left",
            "user_id": user_id,
            "message": f"User {user_id} left the chat"
        })

# Client-side JavaScript example
@app.get("/")
async def get_chat_page():
    return HTMLResponse("""
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Chat</title>
</head>
<body>
    <div id="messages"></div>
    <input type="text" id="messageInput" placeholder="Type a message...">
    <button onclick="sendMessage()">Send</button>
    
    <script>
        const userId = prompt("Enter your username:");
        const ws = new WebSocket(`ws://localhost:8000/ws/${userId}`);
        
        ws.onmessage = function(event) {
            const data = JSON.parse(event.data);
            const messages = document.getElementById('messages');
            const messageElement = document.createElement('div');
            
            if (data.type === 'chat_message') {
                messageElement.innerHTML = `<strong>${data.user_id}:</strong> ${data.message}`;
            } else {
                messageElement.innerHTML = `<em>${data.message}</em>`;
                messageElement.style.color = 'gray';
            }
            
            messages.appendChild(messageElement);
            messages.scrollTop = messages.scrollHeight;
        };
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            
            if (message) {
                ws.send(JSON.stringify({
                    message: message
                }));
                input.value = '';
            }
        }
        
        document.getElementById('messageInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    </script>
</body>
</html>
    """)
```

### SOAP API Example

```python
# SOAP API example using spyne
from spyne import Application, rpc, ServiceBase, Unicode, Integer, ComplexModel
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication

class User(ComplexModel):
    id = Integer
    username = Unicode
    email = Unicode
    is_active = Unicode  # SOAP doesn't have boolean, using string

class UserService(ServiceBase):
    @rpc(Integer, _returns=User)
    def get_user(ctx, user_id):
        """Get user by ID"""
        # In real implementation, this would query a database
        return User(
            id=user_id,
            username=f"user_{user_id}",
            email=f"user{user_id}@example.com",
            is_active="true"
        )
    
    @rpc(Unicode, Unicode, _returns=User)
    def create_user(ctx, username, email):
        """Create a new user"""
        new_id = 123  # In real app, this would be generated
        return User(
            id=new_id,
            username=username,
            email=email,
            is_active="true"
        )
    
    @rpc(_returns=Unicode)
    def get_service_info(ctx):
        """Get service information"""
        return "User Management SOAP Service v1.0"

# Create SOAP application
application = Application(
    [UserService],
    'user.management.soap',
    in_protocol=Soap11(validator='lxml'),
    out_protocol=Soap11()
)

# WSDL will be available at: http://localhost:8000/soap?wsdl
soap_app = WsgiApplication(application)

# Example SOAP request XML:
"""
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:user="user.management.soap">
   <soap:Header/>
   <soap:Body>
      <user:get_user>
         <user:user_id>1</user:user_id>
      </user:get_user>
   </soap:Body>
</soap:Envelope>
"""
```

### JavaScript Client Examples

```javascript
// REST API Client
class RestApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    async getUsers() {
        try {
            const response = await fetch(`${this.baseUrl}/users`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }
    
    async createUser(userData) {
        try {
            const response = await fetch(`${this.baseUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
}

// GraphQL API Client
class GraphQLClient {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }
    
    async query(query, variables = {}) {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables
                })
            });
            
            const result = await response.json();
            
            if (result.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
            }
            
            return result.data;
        } catch (error) {
            console.error('GraphQL query error:', error);
            throw error;
        }
    }
    
    async getUsers() {
        const query = `
            query GetUsers {
                users {
                    id
                    username
                    email
                    isActive
                }
            }
        `;
        return await this.query(query);
    }
}

// WebSocket Client
class WebSocketClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.messageHandlers = new Map();
    }
    
    connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.url);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected');
                resolve();
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
            };
        });
    }
    
    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
        }
    }
    
    onMessage(type, handler) {
        this.messageHandlers.set(type, handler);
    }
    
    handleMessage(data) {
        const handler = this.messageHandlers.get(data.type);
        if (handler) {
            handler(data);
        }
    }
    
    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Usage examples
const restClient = new RestApiClient('http://localhost:8000');
const graphqlClient = new GraphQLClient('http://localhost:8000/graphql');
const wsClient = new WebSocketClient('ws://localhost:8000/ws/user123');

// Using the clients
async function demonstrateApiUsage() {
    try {
        // REST API usage
        const users = await restClient.getUsers();
        console.log('REST Users:', users);
        
        // GraphQL API usage
        const graphqlUsers = await graphqlClient.getUsers();
        console.log('GraphQL Users:', graphqlUsers);
        
        // WebSocket usage
        await wsClient.connect();
        wsClient.onMessage('chat_message', (data) => {
            console.log('New message:', data);
        });
        wsClient.sendMessage({ message: 'Hello from client!' });
        
    } catch (error) {
        console.error('API demonstration error:', error);
    }
}
```
