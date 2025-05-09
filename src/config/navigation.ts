
export interface NavConfigItem {
  title: string;
  path?: string; // This will be the href, e.g., /docs/topic/page
  order?: number; // Order for sorting at the same level
  children?: NavConfigItem[];
  isExternal?: boolean; // For external links
  isSection?: boolean; // True if this item represents a section overview (maps to _index.md)
}

export const navigationConfig: NavConfigItem[] = [
  {
    title: "About",
    path: "/docs/about",
    order: 1,
  },
  {
    title: "Getting Started", // Top-level Getting Started from existing files
    path: "/docs/getting-started",
    order: 2,
  },
  {
    title: "Comprehensive Guide",
    path: "/docs/guides/comprehensive-fastapi-guide", // Parent links to the top overview page
    order: 3,
    children: [
      // Section 1
      {
        title: "1. Intro to APIs & FastAPI",
        path: "/docs/guides/comprehensive-fastapi-guide#1-introduction-to-apis-and-fastapi",
        order: 1,
      },
      {
        title: "1.1 What is an API?",
        path: "/docs/api-fundamentals/what-is-an-api",
        order: 2,
      },
      {
        title: "1.2 Types of APIs",
        path: "/docs/api-fundamentals/types-of-apis",
        order: 3,
      },
      {
        title: "1.3 REST API Principles",
        path: "/docs/api-fundamentals/rest-api-principles",
        order: 4,
      },
      {
        title: "1.4 Introduction to FastAPI",
        path: "/docs/fastapi/introduction/introduction-to-fastapi", // Actual file
        order: 5,
      },
      // Section 2
      {
        title: "2. Core FastAPI Concepts",
        path: "/docs/guides/comprehensive-fastapi-guide#2-core-fastapi-concepts",
        order: 6,
      },
      {
        title: "2.1 Basic FastAPI Application",
        path: "/docs/fastapi/core-concepts/basic-application",
        order: 7,
      },
      {
        title: "2.2 Path and Query Parameters",
        path: "/docs/fastapi/core-concepts/path-and-query-parameters",
        order: 8,
      },
      {
        title: "2.3 Request Body and Pydantic Models",
        path: "/docs/fastapi/core-concepts/request-body-and-pydantic-models",
        order: 9,
      },
      {
        title: "2.4 Response Models and Status Codes",
        path: "/docs/fastapi/core-concepts/response-models-and-status-codes",
        order: 10,
      },
      {
        title: "2.5 Async Endpoints",
        path: "/docs/fastapi/core-concepts/async-endpoints",
        order: 11,
      },
      // Section 3
      {
        title: "3. Database Handling with SQLAlchemy",
        path: "/docs/guides/comprehensive-fastapi-guide#3-database-handling-with-sqlalchemy",
        order: 12,
      },
      {
        title: "3.1 Introduction to SQLAlchemy",
        path: "/docs/sqlalchemy/introduction/introduction-to-sqlalchemy", // Actual file
        order: 13,
      },
      {
        title: "3.2 FastAPI with SQLAlchemy",
        path: "/docs/sqlalchemy/fastapi-integration/session-management",
        order: 14,
      },
      {
        title: "3.3 Pydantic and SQLAlchemy Integration",
        path: "/docs/sqlalchemy/pydantic-integration/pydantic-sqlalchemy-integration",
        order: 15,
      },
      {
        title: "3.4 SQLAlchemy Best Practices",
        path: "/docs/sqlalchemy/best-practices/general-best-practices",
        order: 16,
      },
      {
        title: "3.5 Table Creation Methods",
        path: "/docs/sqlalchemy/modeling/table-creation-methods",
        order: 17,
      },
      {
        title: "3.6 Utilizing Declarative Base Effectively",
        path: "/docs/sqlalchemy/modeling/declarative-base-usage",
        order: 18,
      },
      {
        title: "3.7 Multi-Tenant Architectures",
        path: "/docs/sqlalchemy/advanced-patterns/multi-tenancy",
        order: 19,
      },
      // Section 4
      {
        title: "4. Advanced FastAPI Features",
        path: "/docs/guides/comprehensive-fastapi-guide#4-advanced-fastapi-features",
        order: 20,
      },
      {
        title: "4.1 Dependency Injection",
        path: "/docs/fastapi/advanced-features/dependency-injection",
        order: 21,
      },
      {
        title: "4.2 Background Tasks",
        path: "/docs/fastapi/advanced-features/background-tasks",
        order: 22,
      },
      {
        title: "4.3 WebSockets",
        path: "/docs/fastapi/advanced-features/websockets",
        order: 23,
      },
      {
        title: "4.4 FastAPI Admin",
        path: "/docs/fastapi/ecosystem/fastapi-admin",
        order: 24,
      },
      {
        title: "4.5 Custom Middleware",
        path: "/docs/fastapi/advanced-features/custom-middleware",
        order: 25,
      },
      {
        title: "4.6 Event Handlers (Startup/Shutdown)",
        path: "/docs/fastapi/advanced-features/event-handlers",
        order: 26,
      },
      {
        title: "4.7 Custom APIRouter",
        path: "/docs/fastapi/routing/custom-apirouter",
        order: 27,
      },
      {
        title: "4.8 Dependency Overrides",
        path: "/docs/fastapi/testing/dependency-overrides",
        order: 28,
      },
      {
        title: "4.9 Custom Exception Handlers",
        path: "/docs/fastapi/error-handling/custom-exception-handlers",
        order: 29,
      },
      {
        title: "4.10 Streaming Responses",
        path: "/docs/fastapi/responses/streaming-responses",
        order: 30,
      },
      {
        title: "4.11 File Uploads",
        path: "/docs/fastapi/requests/file-uploads",
        order: 31,
      },
      {
        title: "4.12 OpenAPI Customization",
        path: "/docs/fastapi/openapi/customization",
        order: 32,
      },
      {
        title: "4.13 Server-Sent Events (SSE)",
        path: "/docs/fastapi/real-time/server-sent-events",
        order: 33,
      },
      {
        title: "4.14 Custom Response Classes",
        path: "/docs/fastapi/responses/custom-response-classes",
        order: 34,
      },
      {
        title: "4.15 Request Context",
        path: "/docs/fastapi/advanced-features/request-context",
        order: 35,
      },
      // Section 5
      {
        title: "5. FastAPI Security",
        path: "/docs/guides/comprehensive-fastapi-guide#5-fastapi-security",
        order: 36,
      },
      {
        title: "5.1 Security Mechanisms Overview",
        path: "/docs/fastapi/security/overview",
        order: 37,
      },
      {
        title: "5.2 Basic Authentication",
        path: "/docs/fastapi/security/basic-authentication",
        order: 38,
      },
      {
        title: "5.3 JWT Authentication",
        path: "/docs/fastapi/security/jwt-authentication",
        order: 39,
      },
      {
        title: "5.4 OAuth2 Authentication",
        path: "/docs/fastapi/security/oauth2-authentication",
        order: 40,
      },
      {
        title: "5.5 API Key Authentication",
        path: "/docs/fastapi/security/api-key-authentication",
        order: 41,
      },
      {
        title: "5.6 Rate Limiting",
        path: "/docs/fastapi/security/rate-limiting",
        order: 42,
      },
      {
        title: "5.7 CSRF Protection",
        path: "/docs/fastapi/security/csrf-protection",
        order: 43,
      },
      {
        title: "5.8 Advanced Security Techniques",
        path: "/docs/fastapi/security/advanced-techniques",
        order: 44,
      },
      {
        title: "5.9 Token Refresh Mechanisms",
        path: "/docs/fastapi/security/token-refresh",
        order: 45,
      },
      {
        title: "5.10 Secure Cookie-Based Authentication",
        path: "/docs/fastapi/security/cookie-authentication",
        order: 46,
      },
      {
        title: "5.11 Zero Trust Security Model",
        path: "/docs/fastapi/security/zero-trust",
        order: 47,
      },
      // Section 6
      {
        title: "6. Performance & Optimization",
        path: "/docs/guides/comprehensive-fastapi-guide#6-performance-and-optimization",
        order: 48,
      },
      {
        title: "6.1 Optimizing FastAPI Performance",
        path: "/docs/fastapi/performance/optimizing-fastapi-performance",
        order: 49,
      },
      {
        title: "6.2 Error Handling and Logging",
        path: "/docs/fastapi/performance/error-handling-and-logging",
        order: 50,
      },
      {
        title: "6.3 SQLAlchemy Performance Optimization",
        path: "/docs/sqlalchemy/performance/sqlalchemy-performance",
        order: 51,
      },
      // Section 7
      {
        title: "7. Advanced SQLAlchemy",
        path: "/docs/guides/comprehensive-fastapi-guide#7-advanced-sqlalchemy-techniques",
        order: 52,
      },
      {
        title: "7.1 Advanced Querying",
        path: "/docs/sqlalchemy/advanced-techniques/advanced-querying",
        order: 53,
      },
      {
        title: "7.2 Triggers and Views",
        path: "/docs/sqlalchemy/advanced-techniques/triggers-and-views",
        order: 54,
      },
      {
        title: "7.3 Hybrid Properties and Methods",
        path: "/docs/sqlalchemy/advanced-techniques/hybrid-properties",
        order: 55,
      },
      {
        title: "7.4 Inheritance Mapping",
        path: "/docs/sqlalchemy/advanced-techniques/inheritance-mapping",
        order: 56,
      },
      {
        title: "7.5 ORM Events",
        path: "/docs/sqlalchemy/advanced-techniques/orm-events",
        order: 57,
      },
      {
        title: "7.6 Async SQLAlchemy",
        path: "/docs/sqlalchemy/async/async-sqlalchemy",
        order: 58,
      },
      // Section 8
      {
        title: "8. Pydantic Advanced Features",
        path: "/docs/guides/comprehensive-fastapi-guide#8-pydantic-advanced-features",
        order: 59,
      },
      {
        title: "8.1 Custom Validators",
        path: "/docs/pydantic/advanced-features/custom-validators",
        order: 60,
      },
      {
        title: "8.2 Settings Management",
        path: "/docs/pydantic/advanced-features/settings-management",
        order: 61,
      },
      {
        title: "8.3 Complex Nested Models",
        path: "/docs/pydantic/advanced-features/complex-nested-models",
        order: 62,
      },
      {
        title: "8.4 Serialization Customization",
        path: "/docs/pydantic/advanced-features/serialization",
        order: 63,
      },
      {
        title: "8.5 Generic Models",
        path: "/docs/pydantic/advanced-features/generic-models",
        order: 64,
      },
      {
        title: "8.6 Dataclasses Integration",
        path: "/docs/pydantic/advanced-features/dataclasses",
        order: 65,
      },
      // Section 9
      {
        title: "9. Async Programming",
        path: "/docs/guides/comprehensive-fastapi-guide#9-async-programming",
        order: 66,
      },
      {
        title: "9.1 Sync vs. Async",
        path: "/docs/async-programming/sync-vs-async",
        order: 67,
      },
      {
        title: "9.2 Async DB Connections",
        path: "/docs/async-programming/async-db-connections",
        order: 68,
      },
      {
        title: "9.3 Async Middleware",
        path: "/docs/async-programming/async-middleware",
        order: 69,
      },
      {
        title: "9.4 Running Tasks Concurrently",
        path: "/docs/fastapi/performance/optimizing-fastapi-performance", // Reuses existing relevant section
        order: 70,
      },
      {
        title: "9.5 Async Generators",
        path: "/docs/data-streaming/async-generators", // Reuses existing relevant section
        order: 71,
      },
      // Section 10
      {
        title: "10. Integrations & Architectures",
        path: "/docs/guides/comprehensive-fastapi-guide#10-integrations-and-architectures",
        order: 72,
      },
      {
        title: "10.1 Third-Party Integrations",
        path: "/docs/integrations-and-architectures/third-party-integrations",
        order: 73,
      },
      {
        title: "10.2 GraphQL Integration",
        path: "/docs/integrations-and-architectures/graphql-integration",
        order: 74,
      },
      {
        title: "10.3 Microservices Architecture",
        path: "/docs/integrations-and-architectures/microservices-architecture",
        order: 75,
      },
      {
        title: "10.4 Celery Integration",
        path: "/docs/integrations-and-architectures/celery-integration",
        order: 76,
      },
      {
        title: "10.5 Kafka Integration",
        path: "/docs/integrations-and-architectures/kafka-integration",
        order: 77,
      },
      // Section 11
      {
        title: "11. Deployment & Testing",
        path: "/docs/guides/comprehensive-fastapi-guide#11-deployment-and-testing",
        order: 78,
      },
      {
        title: "11.1 Deploying FastAPI",
        path: "/docs/deployment-and-testing/deploying-fastapi",
        order: 79,
      },
      {
        title: "11.2 Testing FastAPI",
        path: "/docs/deployment-and-testing/testing-fastapi",
        order: 80,
      },
      {
        title: "11.3 Monitoring and Logging",
        path: "/docs/deployment-and-testing/monitoring-and-logging",
        order: 81,
      },
      {
        title: "11.4 Load Testing",
        path: "/docs/deployment-and-testing/load-testing",
        order: 82,
      },
      // Section 12
      {
        title: "12. FastAPI Pro-Level Features",
        path: "/docs/guides/comprehensive-fastapi-guide#12-fastapi-pro-level-features",
        order: 83,
      },
      {
        title: "12.1 Custom ASGI Middleware",
        path: "/docs/fastapi-pro/custom-asgi-middleware",
        order: 84,
      },
      {
        title: "12.2 HTTP/2 & gRPC",
        path: "/docs/fastapi-pro/http2-grpc",
        order: 85,
      },
      {
        title: "12.3 Dynamic Route Generation",
        path: "/docs/fastapi-pro/dynamic-route-generation",
        order: 86,
      },
      // Section 13
      {
        title: "13. API Versioning",
        path: "/docs/guides/comprehensive-fastapi-guide#13-api-versioning",
        order: 87,
      },
      {
        title: "13.1 Versioning Strategies",
        path: "/docs/api-versioning/strategies",
        order: 88,
      },
      // Section 14
      {
        title: "14. AI/ML Integration",
        path: "/docs/guides/comprehensive-fastapi-guide#14-ai-and-machine-learning-integration",
        order: 89,
      },
      {
        title: "14.1 Serving ML Models",
        path: "/docs/ai-ml-integration/serving-ml-models", // Actual file
        order: 90,
      },
      // Section 15
      {
        title: "15. Serverless Optimizations",
        path: "/docs/guides/comprehensive-fastapi-guide#15-serverless-optimizations",
        order: 91,
      },
      {
        title: "15.1 Optimizing for Serverless",
        path: "/docs/serverless-optimizations/optimizing-for-serverless",
        order: 92,
      },
      // Section 16
      {
        title: "16. Advanced Documentation",
        path: "/docs/guides/comprehensive-fastapi-guide#16-advanced-documentation-practices",
        order: 93,
      },
      {
        title: "16.1 Enhanced API Documentation",
        path: "/docs/advanced-documentation/enhanced-api-docs",
        order: 94,
      },
      // Section 17
      {
        title: "17. Data Streaming",
        path: "/docs/guides/comprehensive-fastapi-guide#17-data-streaming-with-async-generators",
        order: 95,
      },
      {
        title: "17.1 Async Data Streaming",
        path: "/docs/data-streaming/async-generators", // Actual file
        order: 96,
      },
      // Section 18
      {
        title: "18. FastAPI with Rust",
        path: "/docs/guides/comprehensive-fastapi-guide#18-fastapi-with-rust-extensions",
        order: 97,
      },
      {
        title: "18.1 Integrating Rust",
        path: "/docs/fastapi-with-rust/integrating-rust",
        order: 98,
      },
      // Section 19
      {
        title: "19. SQLAlchemy w/ Data Lakes",
        path: "/docs/guides/comprehensive-fastapi-guide#19-sqlalchemy-with-data-lakes",
        order: 99,
      },
      {
        title: "19.1 Querying Data Lakes",
        path: "/docs/sqlalchemy-with-datalakes/querying-data-lakes",
        order: 100,
      },
      // Section 20
      {
        title: "20. Pydantic w/ Schema Registry",
        path: "/docs/guides/comprehensive-fastapi-guide#20-pydantic-with-schema-registry",
        order: 101,
      },
      {
        title: "20.1 Schema Registry Integration",
        path: "/docs/pydantic-with-schema-registry/integration",
        order: 102,
      },
      // Section 21
      {
        title: "21. Async GraphQL Subs",
        path: "/docs/guides/comprehensive-fastapi-guide#21-async-graphql-subscriptions",
        order: 103,
      },
      {
        title: "21.1 Implementing GraphQL Subscriptions",
        path: "/docs/async-graphql-subscriptions/implementation",
        order: 104,
      },
      // Section 22
      {
        title: "22. FastAPI Edge Computing",
        path: "/docs/guides/comprehensive-fastapi-guide#22-fastapi-with-edge-computing",
        order: 105,
      },
      {
        title: "22.1 Deploying FastAPI on Edge Nodes",
        path: "/docs/fastapi-edge-computing/deployment",
        order: 106,
      },
      // Section 23
      {
        title: "23. Zero-Downtime Migrations",
        path: "/docs/guides/comprehensive-fastapi-guide#23-zero-downtime-db-migrations",
        order: 107,
      },
      {
        title: "23.1 Zero-Downtime DB Migrations",
        path: "/docs/sqlalchemy/migrations/zero-downtime",
        order: 108,
      },
      // Section 24
      {
        title: "24. FastAPI w/ Diff. Privacy",
        path: "/docs/guides/comprehensive-fastapi-guide#24-fastapi-with-differential-privacy",
        order: 109,
      },
      {
        title: "24.1 Implementing Differential Privacy",
        path: "/docs/fastapi/privacy/differential-privacy",
        order: 110,
      },
      // Section 25
      {
        title: "25. Pydantic Static Typing",
        path: "/docs/guides/comprehensive-fastapi-guide#25-pydantic-with-static-type-checking",
        order: 111,
      },
      {
        title: "25.1 Static Type Checking for Pydantic",
        path: "/docs/pydantic/type-checking/static-analysis",
        order: 112,
      },
    ],
  },
  {
    title: "Other Guides", // Changed from "Guides" to "Other Guides" to avoid conflict
    order: 4,
    isSection: true, // This indicates it should look for guides/_index.md
    path: "/docs/guides",
    children: [
      {
        title: "Getting Started", // This is different from the top-level "Getting Started"
        path: "/docs/guides/getting-started", // This should point to src/content/docs/guides/getting-started.md
        order: 1,
      },
      {
        title: "Advanced Topics",
        path: "/docs/guides/advanced-topics",
        order: 2,
      },
    ],
  },
  {
    title: "Python",
    order: 5,
    isSection: true,
    path: "/docs/python",
    children: [
      { title: "Basic Python", path: "/docs/python/basic", order: 1 },
      { title: "Intermediate Python", path: "/docs/python/intermediate", order: 2 },
      { title: "Advanced Python", path: "/docs/python/advanced", order: 3 },
      { title: "Pro Python", path: "/docs/python/pro", order: 4 },
      { title: "Python Hidden Gems", path: "/docs/python/hidden-gems", order: 5 },
    ],
  },
  {
    title: "FastAPI",
    order: 6,
    isSection: true,
    path: "/docs/fastapi",
    children: [
      { title: "Introduction", path: "/docs/fastapi/introduction", order: 1, isSection: true },
      { title: "Core Concepts", path: "/docs/fastapi/core-concepts", order: 2, isSection: true },
      { title: "Advanced Features", path: "/docs/fastapi/advanced-features", order: 3, isSection: true },
      { title: "Pro-Level Features", path: "/docs/fastapi-pro", order: 4, isSection: true }, // Assuming fastapi-pro is a directory
      { title: "Performance & Optimization", path: "/docs/fastapi/performance", order: 5, isSection: true },
      { title: "Security", path: "/docs/fastapi/security", order: 6, isSection: true },
      { title: "FastAPI Hidden Gems", path: "/docs/fastapi/hidden-gems", order: 7 },
    ],
  },
  {
    title: "SQLAlchemy",
    order: 7,
    isSection: true,
    path: "/docs/sqlalchemy",
    children: [
      { title: "Introduction", path: "/docs/sqlalchemy/introduction", order: 1, isSection: true },
      { title: "FastAPI Integration", path: "/docs/sqlalchemy/fastapi-integration", order: 2, isSection: true },
      { title: "Pydantic Integration", path: "/docs/sqlalchemy/pydantic-integration", order: 3, isSection: true },
      { title: "Modeling", path: "/docs/sqlalchemy/modeling", order: 4, isSection: true },
      { title: "Advanced Techniques", path: "/docs/sqlalchemy/advanced-techniques", order: 5, isSection: true },
      { title: "Performance & Optimization", path: "/docs/sqlalchemy/performance/sqlalchemy-performance", order: 6 }, // Points to specific file
      { title: "Advanced Patterns", path: "/docs/sqlalchemy/advanced-patterns", order: 7, isSection: true },
      { title: "Async", path: "/docs/sqlalchemy/async", order: 8, isSection: true },
      { title: "Migrations", path: "/docs/sqlalchemy/migrations", order: 9, isSection: true },
      { title: "Best Practices", path: "/docs/sqlalchemy/best-practices", order: 10, isSection: true },
      { title: "SQLAlchemy Hidden Gems", path: "/docs/sqlalchemy/hidden-gems", order: 11 },
    ],
  },
  {
    title: "Pydantic",
    order: 8,
    isSection: true,
    path: "/docs/pydantic",
    children: [
      { title: "Basic Pydantic", path: "/docs/pydantic/basic", order: 1 },
      { title: "Intermediate Pydantic", path: "/docs/pydantic/intermediate", order: 2 },
      { title: "Advanced Features", path: "/docs/pydantic/advanced-features", order: 3, isSection: true },
      { title: "Pro Pydantic", path: "/docs/pydantic/pro", order: 4 },
      { title: "Type Checking", path: "/docs/pydantic/type-checking", order: 5, isSection: true },
      { title: "Pydantic Hidden Gems", path: "/docs/pydantic/hidden-gems", order: 6 },
    ],
  },
  {
    title: "PostgreSQL",
    order: 9,
    isSection: true,
    path: "/docs/postgresql",
    children: [
      { title: "Basic PostgreSQL", path: "/docs/postgresql/basic", order: 1 },
      { title: "Intermediate PostgreSQL", path: "/docs/postgresql/intermediate", order: 2 },
      { title: "Advanced PostgreSQL", path: "/docs/postgresql/advanced", order: 3 },
      { title: "Pro PostgreSQL", path: "/docs/postgresql/pro", order: 4 },
      { title: "PostgreSQL Hidden Gems", path: "/docs/postgresql/hidden-gems", order: 5 },
    ],
  },
  {
    title: "MongoDB",
    order: 10,
    isSection: true,
    path: "/docs/mongodb",
    children: [
      { title: "Basic MongoDB", path: "/docs/mongodb/basic", order: 1 },
      { title: "Intermediate MongoDB", path: "/docs/mongodb/intermediate", order: 2 },
      { title: "Advanced MongoDB", path: "/docs/mongodb/advanced", order: 3 },
      { title: "Pro MongoDB", path: "/docs/mongodb/pro", order: 4 },
      { title: "MongoDB Hidden Gems", path: "/docs/mongodb/hidden-gems", order: 5 },
    ],
  },
];
