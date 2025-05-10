---
title: Requirements
description: Placeholder content for Application Architecture Requirements.
order: 1
---

# Application Architecture Requirements

# Requirements

## Applications
- **App 1: Business System**:
  - Modules: User, User Profile, HRMS, Payroll, Chat, Pipeline.
  - Real-time features: Chat (WebSocket).
- **App 2: School ERP**:
  - Modules: User, User Profile, HQ, Admin, Libraries, Events, Attendance.
  - Real-time features: Events, Attendance (WebSocket).

## Key Requirements
- **Multi-Tenant**: Separate PostgreSQL schemas per tenant (e.g., per company or school).
- **Fully Asynchronous**: Async processing for real-time features and responsiveness.
- **Modularity**: Isolated modules to simplify development and maintenance.
- **Scalability**: Independent scaling for high-load modules (e.g., Chat, Events).
- **Tech Stack**: React, Next.js, TypeScript, Python, FastAPI, async, PostgreSQL.
- **Team Constraints**: Limited expertise in complex patterns (e.g., EDA, hexagonal). Avoid major folder structure overhauls.
