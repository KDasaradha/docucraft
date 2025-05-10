---
title: HTTP Method Tests
description: Placeholder content for HTTP Method Tests.
order: 7
---

# HTTP Method Tests

# API Test Cases

## General Considerations for All HTTP Methods
- **Authentication & Authorization**
  - Without API key
  - Invalid API key
  - Expired API key
  - No authentication token
  - Invalid authentication token
  - Expired authentication token
  - Insufficient permissions (e.g., user trying to access admin-only routes)
  
- **Header Validations**
  - Missing required headers
  - Invalid header values
  - Modified headers with invalid content
  
- **Security Tests**
  - SQL Injection
  - Cross-Site Scripting (XSS)
  - Cross-Site Request Forgery (CSRF)
  - Code injection attacks
  - XML External Entity (XXE) attacks
  
- **Performance & Rate Limiting**
  - Concurrent API requests
  - Rate limit enforcement
  - Load testing with multiple simultaneous requests
  
- **Localization & Encoding**
  - Whitespace characters
  - English language validation
  - Proper Unicode character support
  - Fields requiring only numbers
  - Fields requiring only alphabets
  - Fields requiring only alphabtes and special characters
  
## Test Cases per HTTP Method

### **POST (Create Resource)**
- **Valid Cases**
  - Valid request with all required fields
  - Valid request with optional fields
  - Valid request without optional fields
  
- **Invalid Cases**
  - Whitespace characters
  - Missing payload
  - Missing required fields in payload
  - Adding extra unwanted fields
  - Invalid field values (e.g., incorrect data types)
  - Minimum length field values
  - Maximum length field values
  - Fields not conforming to regex/pattern requirements
  - SQL Injection attempt in request fields
  - Script attacks in input fields
  - Database down scenario
  - Rate limit exceeded
  
### **PUT (Update Resource)**
- **Valid Cases**
  - Valid request with existing user ID
  - Updating only one field
  - Updating multiple fields
  - Valid request with optional values
  - Valid request without optional values
  
- **Invalid Cases**
  - Whitespace characters
  - Invalid user ID
  - Non-existing user ID
  - Blocked user ID
  - Missing payload
  - Removing certain fields from payload
  - Adding extra unwanted fields
  - Invalid field values (e.g., incorrect data types)
  - Minimum length field values
  - Maximum length field values
  - Fields not conforming to regex/pattern requirements
  - SQL Injection attempt in request fields
  - Script attacks in input fields
  - Database down scenario
  - Rate limit exceeded
  
### **GET (Retrieve Single Resource)**
- **Valid Cases**
  - Valid user ID
  - Existing user
  
- **Invalid Cases**
  - Invalid user ID
  - Non-existing user ID
  - Blocked user ID
  - SQL Injection attempt in query parameters
  - Script attacks in query parameters
  - Database down scenario
  - Rate limit exceeded
  
### **GET ALL (Retrieve Multiple Resources)**
- **Valid Cases**
  - Requesting all records with valid API key
  
- **Invalid Cases**
  - SQL Injection attempt in query parameters
  - Script attacks in query parameters
  - Database down scenario
  - Rate limit exceeded
  
### **DELETE (Soft/Hard Delete Resource)**
- **Valid Cases**
  - Valid user ID for deletion
  - Deleting an already deleted resource
  
- **Invalid Cases**
  - Invalid user ID
  - Non-existing user ID
  - Blocked user ID
  - SQL Injection attempt in request parameters
  - Script attacks in request parameters
  - Database down scenario
  - Rate limit exceeded
  
## **Additional Functional Test Cases (Use Case Specific)**
- **Business logic validation**
  - Checking required constraints based on business rules
  - Handling of specific edge cases (e.g., account verification before use)
  
- **State Transitions**
  - Ensuring correct workflow of resources (e.g., order creation, processing, completed states)
  
- **Concurrency Tests**
  - Simultaneous modifications on the same resource
  - Race conditions in data updates
  
- **Error Handling**
  - Proper HTTP status codes returned for all failure scenarios
  - Appropriate error messages for each type of failure

These test cases cover all major aspects of API validation, security, performance, and business logic handling.


Here’s a well-structured and comprehensive list of test cases for API endpoints categorized by HTTP methods. I've refined your test cases, added missing ones, and ensured clarity.  

---

### **POST (Create Resource)**
1. **Valid Requests**
   - Valid details (all required fields)
   - Valid details with optional values
   - Valid details without optional values  

2. **Authentication & Authorization**
   - Missing API key
   - Invalid API key
   - Missing authentication token
   - Expired authentication token
   - Unauthorized access (insufficient permissions)

3. **Payload Validations**
   - Missing payload (empty request body)
   - Payload with only required fields
   - Payload missing required fields
   - Payload with additional/unknown fields
   - Invalid data types in fields
   - Min-length constraint validation
   - Max-length constraint validation
   - Invalid enum values
   - Fields with special characters
   - Regex pattern validation  

4. **Security & Exploit Protection**
   - SQL injection attempts
   - Cross-site scripting (XSS) attacks
   - Cross-site request forgery (CSRF) attacks
   - Command injection attempts
   - File upload security checks (if applicable)  

5. **Header Validations**
   - Missing required headers
   - Invalid headers
   - Modified headers with incorrect values  

6. **Concurrency & Performance**
   - Hitting API multiple times simultaneously
   - High concurrency request testing
   - Rate limit enforcement  

7. **Failure & Edge Cases**
   - Database server down
   - Unexpected server crashes
   - Handling extremely large payloads  

---

### **PUT (Update Resource)**
1. **Valid Requests**
   - Update with valid details
   - Update with optional values
   - Update with only required values
   - Update single field
   - Update multiple fields  

2. **Authentication & Authorization**
   - Missing API key
   - Invalid API key
   - Missing authentication token
   - Expired authentication token
   - Unauthorized access (insufficient permissions)  

3. **Resource Existence**
   - Valid user ID (existing resource)
   - Invalid user ID (malformed)
   - Non-existing user ID
   - Updating blocked/disabled user  

4. **Payload Validations**
   - Missing payload (empty request body)
   - Payload missing required fields
   - Payload with additional/unknown fields
   - Invalid data types in fields
   - Min-length constraint validation
   - Max-length constraint validation
   - Invalid enum values
   - Regex pattern validation  

5. **Security & Exploit Protection**
   - SQL injection attempts
   - Cross-site scripting (XSS) attacks
   - Cross-site request forgery (CSRF) attacks
   - Command injection attempts  

6. **Header Validations**
   - Missing required headers
   - Invalid headers
   - Modified headers with incorrect values  

7. **Concurrency & Performance**
   - Hitting API multiple times simultaneously
   - High concurrency request testing
   - Rate limit enforcement  

8. **Failure & Edge Cases**
   - Database server down
   - Unexpected server crashes
   - Handling extremely large payloads  

---

### **GET (Retrieve Single Resource)**
1. **Valid Requests**
   - Fetch existing resource by valid ID  

2. **Authentication & Authorization**
   - Missing API key
   - Invalid API key
   - Missing authentication token
   - Expired authentication token
   - Unauthorized access (insufficient permissions)  

3. **Resource Existence**
   - Valid user ID (existing resource)
   - Invalid user ID (malformed)
   - Non-existing user ID
   - Fetching blocked/disabled user  

4. **Security & Exploit Protection**
   - SQL injection attempts
   - Cross-site scripting (XSS) attacks  

5. **Header Validations**
   - Missing required headers
   - Invalid headers  

6. **Concurrency & Performance**
   - Hitting API multiple times simultaneously
   - High concurrency request testing
   - Rate limit enforcement  

7. **Failure & Edge Cases**
   - Database server down
   - Unexpected server crashes  

---

### **GET (Retrieve All Resources)**
1. **Authentication & Authorization**
   - Missing API key
   - Invalid API key
   - Missing authentication token
   - Expired authentication token
   - Unauthorized access (insufficient permissions)  

2. **Filtering, Sorting, and Pagination**
   - Fetch with default parameters
   - Fetch with custom sorting
   - Fetch with pagination (valid/invalid page numbers)
   - Fetch with filtering parameters  

3. **Security & Exploit Protection**
   - SQL injection attempts
   - Cross-site scripting (XSS) attacks  

4. **Header Validations**
   - Missing required headers
   - Invalid headers  

5. **Concurrency & Performance**
   - Hitting API multiple times simultaneously
   - High concurrency request testing
   - Rate limit enforcement  

6. **Failure & Edge Cases**
   - Database server down
   - Unexpected server crashes
   - Fetching a very large dataset  

---

### **DELETE (Soft/Hard Delete)**
1. **Valid Requests**
   - Delete an existing user/resource (soft delete)
   - Delete an existing user/resource (hard delete)  

2. **Authentication & Authorization**
   - Missing API key
   - Invalid API key
   - Missing authentication token
   - Expired authentication token
   - Unauthorized access (insufficient permissions)  

3. **Resource Existence**
   - Valid user ID (existing resource)
   - Invalid user ID (malformed)
   - Non-existing user ID
   - Deleting a blocked/disabled user
   - Deleting an already deleted resource  

4. **Security & Exploit Protection**
   - SQL injection attempts
   - Cross-site scripting (XSS) attacks
   - Cross-site request forgery (CSRF) attacks  

5. **Header Validations**
   - Missing required headers
   - Invalid headers  

6. **Concurrency & Performance**
   - Hitting API multiple times simultaneously
   - High concurrency request testing
   - Rate limit enforcement  

7. **Failure & Edge Cases**
   - Database server down
   - Unexpected server crashes  

---

### **Additional Test Cases for All Methods**
1. **Response Validations**
   - Correct HTTP status codes (200, 201, 400, 401, 403, 404, 409, 429, 500, etc.)
   - Proper error messages and response structure  

2. **Logging & Monitoring**
   - Ensure sensitive data is not logged in responses or errors
   - Verify logging of all API calls for debugging  

3. **Versioning & Deprecation**
   - Test API versioning (if applicable)
   - Handle deprecated endpoints gracefully  

---

This revised test case list ensures robust coverage for any API. 

To improve your ability to assign proper HTTP status codes and write appropriate error messages, follow these steps:

### **1. Learn Standard HTTP Status Codes**
Familiarize yourself with the most common status codes:

#### **Success Codes (2xx)**
- `200 OK` – Request was successful (GET, PUT, DELETE).
- `201 Created` – Resource was successfully created (POST).
- `202 Accepted` – Request is accepted for processing but not completed yet.
- `204 No Content` – Request was successful, but no response body is needed.

#### **Client Error Codes (4xx)**
- `400 Bad Request` – Invalid request (missing or incorrect parameters).
- `401 Unauthorized` – Authentication required (invalid/missing token).
- `403 Forbidden` – Authenticated but not allowed to access the resource.
- `404 Not Found` – Resource does not exist.
- `405 Method Not Allowed` – HTTP method is not supported (e.g., sending POST to a GET endpoint).
- `409 Conflict` – Duplicate entry or conflicting request.
- `422 Unprocessable Entity` – Request is syntactically correct but invalid (e.g., failed validation).

#### **Server Error Codes (5xx)**
- `500 Internal Server Error` – Unexpected error on the server.
- `502 Bad Gateway` – Server is acting as a gateway and received an invalid response.
- `503 Service Unavailable` – Server is overloaded or under maintenance.
- `504 Gateway Timeout` – Request took too long.

### **2. Use Proper Error Messages**
- Be clear and specific about what went wrong.
- Avoid exposing internal details (e.g., SQL queries or stack traces).
- Provide actionable feedback to the client.

#### **Examples of Good Error Messages**
- `400 Bad Request`:  
  ```json
  { "error": "Invalid email format. Please provide a valid email address." }
  ```
- `401 Unauthorized`:  
  ```json
  { "error": "Missing authentication token. Please log in." }
  ```
- `403 Forbidden`:  
  ```json
  { "error": "You do not have permission to access this resource." }
  ```
- `404 Not Found`:  
  ```json
  { "error": "User with ID 123 not found." }
  ```
- `422 Unprocessable Entity`:  
  ```json
  { "error": "Username must be at least 6 characters long." }
  ```
- `500 Internal Server Error`:  
  ```json
  { "error": "An unexpected error occurred. Please try again later." }
  ```

### **3. Use Tools to Validate Your API**
- **Postman** – Test your API responses.
- **Swagger (OpenAPI)** – Define proper response codes and messages.
- **FastAPI & Flask Error Handling** – Use built-in mechanisms to return proper HTTP responses.

### **4. Read API Best Practices**
- Refer to REST API guidelines from companies like **Stripe, GitHub, or Google**.
- Follow **RFC 9110 (HTTP Semantics)** for proper status codes.

### **5. Practice with Real Scenarios**
- Create a cheat sheet of common status codes.
- Try debugging API responses when using services like GitHub, AWS, or Stripe.

Would you like an automated way to enforce proper error handling in your FastAPI or Flask projects? I can suggest middleware or helper functions for that! 🚀