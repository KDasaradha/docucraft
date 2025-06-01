---
title: API Reference
description: Detailed reference for all core API endpoints, including users and products.
order: 1
---

This page provides a detailed reference for all available API endpoints.

## Users API

### Get User

-   **Endpoint**: `GET /api/users/{userId}`
-   **Description**: Retrieves information about a specific user.
-   **Parameters**:
    -   `userId` (path): The ID of the user.
-   **Example Request**:
    ```http
    GET /api/users/123
    Authorization: Bearer <YOUR_ACCESS_TOKEN>
    ```
-   **Example Response** (`200 OK`):
    ```json
    {
      "id": "123",
      "username": "john.doe",
      "email": "john.doe@example.com",
      "createdAt": "2023-01-15T10:00:00Z"
    }
    ```

### Create User

-   **Endpoint**: `POST /api/users`
-   **Description**: Creates a new user.
-   **Request Body**:
    ```json
    {
      "username": "jane.doe",
      "email": "jane.doe@example.com",
      "password": "securepassword123"
    }
    ```
-   **Example Response** (`201 Created`):
    ```json
    {
      "id": "456",
      "username": "jane.doe",
      "email": "jane.doe@example.com",
      "createdAt": "2023-01-16T11:30:00Z"
    }
    ```

## Products API

Details for the Products API will be added soon. Stay tuned!

### List Products
- **Endpoint**: `GET /api/products`
- **Description**: Retrieves a list of available products. Supports pagination.
- **Query Parameters**:
    - `limit` (optional, integer, default: 10): Number of products per page.
    - `offset` (optional, integer, default: 0): Number of products to skip.
- **Example Request**:
    ```http
    GET /api/products?limit=5&offset=10
    ```
-   **Example Response** (`200 OK`):
    ```json
    {
      "data": [
        {
          "id": "prod_1",
          "name": "Awesome Gadget",
          "price": 49.99,
          "inStock": true
        },
        {
          "id": "prod_2",
          "name": "Super Widget",
          "price": 29.99,
          "inStock": false
        }
      ],
      "total": 150,
      "limit": 5,
      "offset": 10
    }
    ```
