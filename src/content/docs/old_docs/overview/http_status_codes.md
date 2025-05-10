---
title: HTTP Status Codes
description: Placeholder content for HTTP Status Codes.
order: 4
---

# HTTP Status Codes

# HTTP Methods, Status Codes, and Customization

## HTTP Methods
HTTP defines a set of request methods to indicate the desired action to be performed for a given resource. Here is a complete list of HTTP methods:

### Safe and Idempotent Methods
1. **GET** – Retrieve data from the server (safe, idempotent, and cacheable).
2. **HEAD** – Retrieve headers of a resource without the response body (safe, idempotent, and cacheable).
3. **OPTIONS** – Retrieve allowed HTTP methods for a resource (safe and idempotent).

### Idempotent but Not Safe Methods
4. **PUT** – Update or create a resource (idempotent but not safe).
5. **DELETE** – Remove a resource (idempotent but not safe).
6. **TRACE** – Echoes the request received by the server for debugging purposes (idempotent but not safe).

### Non-Idempotent Methods
7. **POST** – Submit data to the server, often creating a new resource (not idempotent).
8. **PATCH** – Partially update an existing resource (not idempotent).
9. **CONNECT** – Establish a tunnel to the server, often used with HTTPS proxies (not idempotent).

## HTTP Status Codes
HTTP status codes are grouped into five categories:

### 1xx – Informational
- **100 Continue** – Server acknowledges request initiation.
- **101 Switching Protocols** – Switching to a new protocol (e.g., WebSockets).
- **102 Processing** – Server is still processing the request (WebDAV).
- **103 Early Hints** – Used with preload headers to optimize loading.

### 2xx – Success
- **200 OK** – Request succeeded.
- **201 Created** – Resource successfully created.
- **202 Accepted** – Request accepted but not yet processed.
- **203 Non-Authoritative Information** – Response modified by proxy.
- **204 No Content** – Successful request, but no response body.
- **205 Reset Content** – Reset the document view.
- **206 Partial Content** – Partial response for range requests.
- **207 Multi-Status** – Multiple status codes (WebDAV).
- **208 Already Reported** – Resource already reported (WebDAV).
- **226 IM Used** – Server applied instance-manipulations.

### 3xx – Redirection
- **300 Multiple Choices** – Multiple response choices.
- **301 Moved Permanently** – Resource moved permanently.
- **302 Found** – Temporary redirection.
- **303 See Other** – Redirect for GET request.
- **304 Not Modified** – Resource unchanged.
- **305 Use Proxy** – Resource must be accessed through a proxy (deprecated).
- **306 Unused** – Reserved for future use.
- **307 Temporary Redirect** – Temporary redirect preserving method.
- **308 Permanent Redirect** – Permanent redirect preserving method.

### 4xx – Client Errors
- **400 Bad Request** – Invalid request syntax.
- **401 Unauthorized** – Authentication required.
- **402 Payment Required** – Reserved for future use.
- **403 Forbidden** – Access to resource denied.
- **404 Not Found** – Resource not found.
- **405 Method Not Allowed** – HTTP method not allowed.
- **406 Not Acceptable** – Response format not acceptable.
- **407 Proxy Authentication Required** – Authentication required via proxy.
- **408 Request Timeout** – Request timed out.
- **409 Conflict** – Conflict in request.
- **410 Gone** – Resource permanently removed.
- **411 Length Required** – Missing required Content-Length header.
- **412 Precondition Failed** – Precondition failed.
- **413 Payload Too Large** – Request payload too large.
- **414 URI Too Long** – URI exceeds allowed length.
- **415 Unsupported Media Type** – Media type not supported.
- **416 Range Not Satisfiable** – Requested range not valid.
- **417 Expectation Failed** – Expectation in request headers cannot be met.
- **418 I'm a Teapot** – April Fool’s joke from RFC 2324.
- **421 Misdirected Request** – Request sent to an inappropriate server.
- **422 Unprocessable Entity** – Request is syntactically correct but semantically incorrect.
- **423 Locked** – Resource is locked.
- **424 Failed Dependency** – Dependent request failed.
- **425 Too Early** – Request replay risk.
- **426 Upgrade Required** – Client must upgrade protocol.
- **428 Precondition Required** – Missing precondition.
- **429 Too Many Requests** – Too many requests from the client.
- **431 Request Header Fields Too Large** – Headers too large.
- **451 Unavailable For Legal Reasons** – Censored content.

### 5xx – Server Errors
- **500 Internal Server Error** – Generic server error.
- **501 Not Implemented** – Method not supported.
- **502 Bad Gateway** – Invalid response from upstream server.
- **503 Service Unavailable** – Server is down.
- **504 Gateway Timeout** – Upstream server timeout.
- **505 HTTP Version Not Supported** – Unsupported HTTP version.
- **506 Variant Also Negotiates** – Transparent content negotiation error.
- **507 Insufficient Storage** – Insufficient server storage (WebDAV).
- **508 Loop Detected** – Infinite loop detected (WebDAV).
- **510 Not Extended** – Further extensions required.
- **511 Network Authentication Required** – Authentication required for network access.

## Customizing HTTP Status Codes
You can customize HTTP status codes in web frameworks like **FastAPI, Flask, Django**, etc.

### FastAPI Example
```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/custom-error")
def custom_error():
    raise HTTPException(status_code=422, detail="Invalid request parameters")
```

### Flask Example
```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/custom-error")
def custom_error():
    response = jsonify({"message": "Invalid request parameters"})
    response.status_code = 422
    return response
```

### Express.js Example (Node.js)
```javascript
const express = require("express");
const app = express();

app.get("/custom-error", (req, res) => {
    res.status(422).json({ message: "Invalid request parameters" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

### Django Example
```python
from django.http import JsonResponse
from django.views import View

class CustomErrorView(View):
    def get(self, request):
        return JsonResponse({"message": "Invalid request parameters"}, status=422)
```

## Conclusion
Understanding HTTP methods and status codes is crucial for building RESTful APIs. Custom status codes help in better error handling and client communication. Make sure to use appropriate status codes to maintain REST best practices and API usability.

### **What is Idempotence?**
Idempotence is a property of HTTP methods where making multiple identical requests has the same effect as making a single request. In other words, an **idempotent operation** produces the same result regardless of how many times it is executed.

#### **Idempotent vs. Non-Idempotent Methods**
| HTTP Method | Idempotent? | Description |
|------------|------------|-------------|
| **GET** | ✅ Yes | Retrieves data without modifying it. |
| **HEAD** | ✅ Yes | Retrieves headers only, without modifying the resource. |
| **OPTIONS** | ✅ Yes | Retrieves allowed HTTP methods, no modification. |
| **PUT** | ✅ Yes | Updates or creates a resource with the same result for identical requests. |
| **DELETE** | ✅ Yes | Removes a resource (repeating a DELETE request has no additional effect if already deleted). |
| **TRACE** | ✅ Yes | Returns request as received, does not modify anything. |
| **POST** | ❌ No | Creates a new resource each time it's called, leading to different results. |
| **PATCH** | ❌ No | Partially updates a resource; multiple calls can result in different outcomes. |
| **CONNECT** | ❌ No | Establishes a tunnel; each request can have different effects. |

---

## **How to Create Custom HTTP Status Codes**
HTTP defines standard status codes (1xx, 2xx, 3xx, 4xx, 5xx), but sometimes custom status codes are required for special cases.

### **1. Choosing a Custom Status Code**
- HTTP/1.1 allows custom **4xx** (client errors) and **5xx** (server errors) codes.
- Ensure your custom codes do not conflict with existing ones.
- **Best practice**: Use codes **above 599** for custom implementations.

### **2. Implementing Custom Status Codes in Different Frameworks**
Here’s how you can define and use custom HTTP status codes in different frameworks.

---

### **FastAPI**
```python
from fastapi import FastAPI, Response

app = FastAPI()

@app.get("/custom-status")
def custom_status():
    return Response(content="Custom Response", status_code=620)  # 620 is a custom status code
```

---

### **Flask**
```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/custom-status")
def custom_status():
    response = jsonify({"message": "Custom status code example"})
    response.status_code = 620  # Custom HTTP status code
    return response
```

---

### **Express.js (Node.js)**
```javascript
const express = require("express");
const app = express();

app.get("/custom-status", (req, res) => {
    res.status(620).json({ message: "Custom status code example" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

---

### **Django**
```python
from django.http import JsonResponse

def custom_status(request):
    return JsonResponse({"message": "Custom status code example"}, status=620)
```

---

## **Important Considerations for Custom Status Codes**
1. **Client Compatibility**  
   Many clients, proxies, and browsers only recognize standard HTTP status codes. Using custom codes may cause them to **ignore or mishandle responses**.
   
2. **REST API Best Practices**  
   Instead of creating custom status codes, use **existing ones with custom messages** when possible. For example:
   - **422 Unprocessable Entity** instead of **620 Validation Failed**.
   - **429 Too Many Requests** instead of **621 Rate Limit Exceeded**.

3. **Custom Headers as an Alternative**  
   If custom codes are problematic, return a standard status code (e.g., `400 Bad Request`) and include a **custom header**:
   ```http
   HTTP/1.1 400 Bad Request
   X-Custom-Status: 620
   ```

---

## **Conclusion**
- **Idempotence** ensures repeated requests yield the same result.
- Custom **HTTP status codes** are useful but should be used cautiously.
- **Best practice**: Stick to standard codes whenever possible and use custom headers if needed.

Would you like me to refine this into a proper document format for future reference? 🚀