---
title: Webhooks Guide
description: Learn how to configure and use webhooks with our API for real-time event notifications.
order: 2
---

Our API supports webhooks to notify your application about events in real-time. This guide explains how to set up and manage webhooks.

## What are Webhooks?

Webhooks are automated messages sent from apps when something happens. They have a message—or payload—which is sent to a unique URL, a webhook URL.

## Configuring Webhooks

To configure a webhook:

1.  **Provide an Endpoint URL**: This is the URL on your server that will receive the webhook POST requests.
2.  **Select Events**: Choose which events you want to be notified about (e.g., `order.created`, `user.updated`).
3.  **Secure Your Webhooks**: Verify webhook signatures to ensure requests are genuinely from DocuCraft.

### Example Payload (`order.created`)

When an order is created, you might receive a payload like this:

```json
{
  "event_id": "evt_123456789",
  "event_type": "order.created",
  "created_at": "2024-01-01T12:00:00Z",
  "data": {
    "order_id": "ord_abcdef",
    "customer_id": "cust_ghijkl",
    "amount": 9999,
    "currency": "usd",
    "items": [
      { "product_id": "prod_1", "quantity": 1 },
      { "product_id": "prod_2", "quantity": 2 }
    ]
  }
}
```

## Best Practices

-   **Respond Quickly**: Your endpoint should respond with a `2xx` status code as quickly as possible. Offload any complex processing to a background job.
-   **Handle Retries**: Our system may retry sending webhooks if your endpoint doesn't respond or returns an error.
-   **Idempotency**: Design your webhook handler to be idempotent. This means it can safely receive the same event multiple times without causing issues.
-   **Logging**: Keep detailed logs of incoming webhooks for debugging purposes.
