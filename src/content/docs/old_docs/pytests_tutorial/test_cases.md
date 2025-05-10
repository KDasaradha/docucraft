---
title: Test Cases
description: Placeholder content for Test Cases.
order: 6
---

# Test Cases

### **List of Basic Test Cases for FastAPI Multi-Tenant (Vendor-Based) Application**  

Here’s a structured list of **positive** and **negative** test cases that cover authentication, vendor management, and general API interactions.  

---

## **1️⃣ Basic Authentication & Authorization Test Cases**  
### ✅ **Positive Scenarios**  
✅ **Login with valid credentials** → Ensure API returns `200 OK` and JWT token.  
✅ **Access protected API with valid token** → Should return `200 OK`.  
✅ **Logout API works correctly** → Session/cookies should be cleared.  

### ❌ **Negative Scenarios**  
❌ **Login with invalid credentials** → Should return `401 Unauthorized`.  
❌ **Access API without token** → Should return `401 Unauthorized`.  
❌ **Access API with expired token** → Should return `401 Unauthorized`.  
❌ **Access API with invalid token** → Should return `403 Forbidden`.  

---

## **2️⃣ Vendor Management Test Cases (Multi-Tenant Setup)**  
### ✅ **Positive Scenarios**  
✅ **Create vendor with unique details** → Should return `200 OK` and vendor ID.  
✅ **Fetch vendor details after creation** → Should return correct vendor details.  
✅ **Update vendor details successfully** → Should return `200 OK`.  
✅ **Delete vendor and verify deletion** → Should return `204 No Content`.  

### ❌ **Negative Scenarios**  
❌ **Create vendor with duplicate name/email** → Should return `400 Bad Request` with validation error.  
❌ **Fetch vendor details with incorrect vendor ID** → Should return `404 Not Found`.  
❌ **Update vendor with invalid payload** → Should return `422 Unprocessable Entity`.  
❌ **Delete vendor that doesn’t exist** → Should return `404 Not Found`.  

---

## **3️⃣ API Test Cases for Different HTTP Methods**  

### **📌 POST API (Create a Resource)**
| Test Case | Expected Outcome |
|-----------|-----------------|
| ✅ Create a new resource with valid data | Returns `201 Created` with response data |
| ❌ Create with missing required fields | Returns `400 Bad Request` |
| ❌ Create with invalid data format | Returns `422 Unprocessable Entity` |
| ❌ Create duplicate entry | Returns `409 Conflict` |

### **📌 GET API (Fetch a Resource)**
| Test Case | Expected Outcome |
|-----------|-----------------|
| ✅ Fetch existing resource | Returns `200 OK` with correct data |
| ❌ Fetch non-existent resource | Returns `404 Not Found` |
| ❌ Fetch with invalid ID format | Returns `400 Bad Request` |
| ❌ Fetch resource without authentication (if required) | Returns `401 Unauthorized` |

### **📌 PUT API (Update a Resource)**
| Test Case | Expected Outcome |
|-----------|-----------------|
| ✅ Update an existing resource with valid data | Returns `200 OK` with updated data |
| ❌ Update non-existent resource | Returns `404 Not Found` |
| ❌ Update with missing required fields | Returns `400 Bad Request` |
| ❌ Update with invalid data type | Returns `422 Unprocessable Entity` |

### **📌 DELETE API (Remove a Resource)**
| Test Case | Expected Outcome |
|-----------|-----------------|
| ✅ Delete an existing resource | Returns `204 No Content` |
| ❌ Delete non-existent resource | Returns `404 Not Found` |
| ❌ Delete without required permissions | Returns `403 Forbidden` |

---

## **4️⃣ Advanced API Tests**
### ✅ **Positive Scenarios**
✅ **Pagination works correctly** → Should return correct number of items.  
✅ **Search functionality works with filters** → Should return expected results.  
✅ **Sorting works as expected** → Should return data in correct order.  

### ❌ **Negative Scenarios**
❌ **Invalid query parameters in search** → Should return `400 Bad Request`.  
❌ **Accessing endpoints with invalid HTTP methods** → Should return `405 Method Not Allowed`.  

---

### **Final Summary**
✔️ Covers **positive and negative scenarios** for authentication, vendor management, and API testing.  
✔️ Covers all **HTTP methods** (POST, GET, PUT, DELETE) with edge cases.  
✔️ Includes **multi-tenant (vendor-based)** test cases.  

Let me know if you need any refinements or additional test cases! 🚀

### **Comprehensive API Test Cases for FastAPI Multi-Tenant (Vendor-Based) Application**  
This list categorizes test cases based on **Positive & Negative scenarios** and covers various aspects like **functional correctness, input validation, security, authentication, authorization, concurrency, and edge cases**.  

---

## **✅ 1. Positive Test Cases (Expected Behavior)**
### **📌 Authentication & Authorization**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Login with valid credentials | Functional | Verify that the correct credentials return a JWT token. |
| Access API with a valid token | Authorization | Ensure that a logged-in user can access protected routes. |
| Logout successfully | Functional | Ensure user session and token are invalidated after logout. |
| Token refresh works correctly | Functional | Verify that token renewal works when a valid refresh token is used. |
| API key authentication works | Security | Ensure API key authentication is correctly implemented. |

### **📌 Vendor Database Management**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Create a new vendor with valid data | Functional | Ensure a vendor can be created successfully. |
| Fetch vendor details | Functional | Verify that correct vendor details are returned. |
| Update vendor information | Functional | Ensure that updates are correctly saved in the database. |
| Delete a vendor account | Functional | Confirm that a vendor can be removed successfully. |

### **📌 API CRUD Operations**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Create resource with correct input | Functional | Ensure that a new resource is created successfully. |
| Fetch existing resource | Functional | Verify correct data is returned for an existing resource. |
| Update existing resource | Functional | Confirm that updates are applied correctly. |
| Delete existing resource | Functional | Verify that deleted resources are removed from the system. |
| List all resources | Functional | Ensure pagination and filtering work correctly. |

### **📌 Input Validation**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Send request with correct data type | Data Validation | Ensure API correctly handles valid input data. |
| Validate correct email format in registration | Data Validation | Ensure the API accepts valid email formats. |
| Validate numeric fields | Data Validation | Ensure numeric fields accept only numbers. |

### **📌 Security Tests**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Send request with a valid JWT token | Security | Ensure a valid token is accepted. |
| Send request with correct API key | Security | Verify correct API key authentication. |

---

## **❌ 2. Negative Test Cases (Unexpected Behavior)**
### **📌 Authentication & Authorization**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Login with invalid credentials | Security | Ensure incorrect credentials return `401 Unauthorized`. |
| Access API without token | Security | Ensure API rejects requests without authentication. |
| Access API with expired token | Security | Verify expired tokens return `401 Unauthorized`. |
| Access API with invalid token | Security | Ensure an invalid token returns `403 Forbidden`. |
| Access admin API as a regular user | Security | Confirm that unauthorized access attempts are denied. |

### **📌 Vendor Management**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Create vendor with duplicate email | Data Integrity | Ensure the API prevents duplicate vendor accounts. |
| Fetch non-existent vendor | Functional | Verify that requesting an invalid vendor returns `404 Not Found`. |
| Update vendor with invalid data | Data Validation | Ensure that invalid data is rejected with `422 Unprocessable Entity`. |
| Delete a vendor that does not exist | Functional | Ensure deleting a non-existent vendor returns `404 Not Found`. |

### **📌 API CRUD Operations**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Create resource with missing fields | Data Validation | Ensure API rejects requests with missing required fields. |
| Create resource with invalid data type | Data Validation | Verify API rejects incorrect data formats (e.g., string instead of number). |
| Fetch resource with incorrect ID format | Functional | Ensure invalid ID format returns `400 Bad Request`. |
| Update non-existent resource | Functional | Verify updating a non-existent resource returns `404 Not Found`. |
| Delete resource without permission | Security | Confirm unauthorized deletions return `403 Forbidden`. |

### **📌 Input Validation**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Input missing required fields | Validation | Ensure API correctly validates missing fields. |
| Input exceeding field length | Validation | Confirm API rejects values longer than allowed. |
| Input incorrect email format | Validation | Verify API rejects invalid emails. |

### **📌 Security Tests**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Attempt SQL Injection | Security | Ensure API prevents SQL injection attacks. |
| Attempt Cross-Site Scripting (XSS) | Security | Confirm API correctly sanitizes user inputs. |
| Send API request with an invalid API key | Security | Ensure incorrect API keys return `403 Forbidden`. |
| Test rate limiting (send multiple requests quickly) | Security | Ensure rate limits prevent abuse. |
| Check for sensitive data exposure in responses | Security | Confirm API does not expose sensitive data (e.g., passwords). |

### **📌 Edge Cases**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Use large input payloads | Performance | Ensure API handles large payloads correctly. |
| Use special characters in input fields | Functional | Ensure API correctly processes special characters. |
| Send concurrent requests (race conditions) | Performance | Test API behavior under concurrent requests. |

---

## **Final Thoughts**
This structured **test case list** ensures that your **FastAPI multi-tenant (vendor-based) application** is **fully tested** for correctness, security, validation, and robustness. 🚀  

Would you like detailed **pytest implementations** for some of these cases? 🤔

Yes! There are **many more possible test cases** depending on **business logic, edge cases, performance constraints, and security concerns.** Here’s an **expanded list** covering even more aspects of API testing:

---

## **✅ 1. More Positive Test Cases**
### **📌 API Behavior & Data Consistency**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Retrieve vendor list with pagination | Functional | Ensure pagination works correctly with large datasets. |
| Retrieve vendor list with filtering & sorting | Functional | Verify filtering parameters work correctly. |
| Fetch vendor using valid `vendor_id` from session | Functional | Ensure the session correctly holds and returns `vendor_id`. |
| Retrieve resource with specific query parameters | Functional | Verify API handles query params correctly. |
| Handle concurrent logins with the same account | Functional | Ensure sessions are properly maintained when logging in from multiple devices. |

### **📌 Multi-Tenant Specific Cases**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Create a vendor, then create another with a different `vendor_id` | Multi-Tenancy | Verify that vendors have isolated databases. |
| Switch between different vendor databases dynamically | Multi-Tenancy | Ensure API correctly switches between tenant databases. |
| Ensure vendor cannot access another vendor's data | Security | Confirm cross-tenant data isolation. |

### **📌 Data Import & Export**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Upload vendor data via CSV | Functional | Ensure bulk uploads work correctly. |
| Export vendor data as JSON/CSV | Functional | Verify export feature produces correct data format. |

### **📌 Performance Testing**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| API response time under normal load | Performance | Ensure API responds within acceptable limits. |
| API behavior under high load | Load Testing | Verify system stability under high traffic. |

---

## **❌ 2. More Negative Test Cases**
### **📌 Authentication & Authorization**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Login with deactivated vendor account | Security | Ensure blocked vendors cannot log in. |
| Try to access another vendor’s data after login | Security | Verify tenant isolation is enforced. |
| Try login with an invalid email format | Validation | Ensure login fails for improperly formatted emails. |

### **📌 Multi-Tenant Specific Cases**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Try to create a vendor with a reserved `vendor_id` | Multi-Tenancy | Ensure reserved vendor IDs are blocked. |
| Try to access APIs before a vendor is created | Multi-Tenancy | Verify API returns `403 Forbidden` when no vendor exists. |
| Access the vendor API without selecting a tenant | Multi-Tenancy | Ensure API requires vendor selection. |

### **📌 Edge Cases in Input Validation**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Pass an empty JSON payload | Validation | Ensure API correctly handles empty requests. |
| Input negative values in numeric fields | Validation | Ensure API rejects negative values where not applicable. |
| Input extremely long text fields | Validation | Verify API enforces max length constraints. |
| Send API request without required headers | Functional | Ensure API rejects missing headers. |

### **📌 Security & Attack Scenarios**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Try to inject SQL via API request | Security | Ensure SQL Injection protection works. |
| Try to modify session cookies manually | Security | Verify cookie-based authentication prevents tampering. |
| Attempt Cross-Site Request Forgery (CSRF) | Security | Ensure CSRF tokens prevent attacks. |
| Try to brute-force login API | Security | Ensure rate-limiting mechanisms block repeated failed attempts. |
| Use an expired API key | Security | Verify expired API keys are rejected. |

### **📌 Concurrent Requests & Race Conditions**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Multiple users updating the same resource simultaneously | Concurrency | Verify database integrity under concurrent updates. |
| High-frequency vendor creation | Concurrency | Ensure vendor registration remains stable under high load. |
| Simultaneous login and logout requests | Concurrency | Test session handling under rapid state changes. |

---

## **📌 3. Test Cases Based on HTTP Methods**
These apply to **all APIs** that perform CRUD operations.

| **Method** | **Test Case** | **Purpose** |
|-----------|--------------|------------|
| **POST** | Create resource with valid input | Ensure successful creation. |
| **POST** | Create resource with missing/invalid input | Verify input validation errors. |
| **POST** | Create resource that already exists | Ensure API returns `409 Conflict`. |
| **GET** | Fetch resource that exists | Verify correct data retrieval. |
| **GET** | Fetch resource that does not exist | Ensure API returns `404 Not Found`. |
| **GET** | Fetch data with invalid query params | Verify API handles invalid queries correctly. |
| **PUT** | Update resource with valid input | Ensure update works correctly. |
| **PUT** | Update resource with missing fields | Ensure validation enforces required fields. |
| **PUT** | Update resource that does not exist | Ensure API returns `404 Not Found`. |
| **DELETE** | Delete existing resource | Ensure successful deletion. |
| **DELETE** | Delete resource that does not exist | Verify API returns `404 Not Found`. |
| **DELETE** | Delete without proper authorization | Ensure unauthorized requests are rejected. |

---

## **📌 4. Advanced Edge Cases**
| **Test Case** | **Type** | **Purpose** |
|--------------|---------|------------|
| Database connection failure | Resilience | Ensure API handles DB downtime gracefully. |
| API response when external dependency (third-party API) is down | Resilience | Verify fallback mechanism. |
| API response for extremely large requests | Performance | Test API handling of large payloads. |
| API request with excessive concurrent requests | Load Testing | Ensure API rate limits prevent overload. |

---

### **Conclusion**
🚀 **This is a complete API test case list covering every aspect of your multi-tenant FastAPI application!**  
Would you like **pytest implementations** for these? 😃