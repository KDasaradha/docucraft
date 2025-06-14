export interface NavConfigItem {
  title: string;
  path?: string;
  order?: number;
  children?: NavConfigItem[];
  isExternal?: boolean;
  isSection?: boolean;
}

export const navigationConfig: NavConfigItem[] = [
  {
    title: "Home",
    path: "/docs/index",
    order: 1
  },
  {
    title: "About DevDocs++",
    path: "/docs/general/about",
    order: 2
  },
  {
    title: "🤖 AI Features Demo",
    path: "/ai-demo",
    order: 2.5
  },
  {
    title: "Main Comprehensive Guide",
    path: "/docs/guides/comprehensive-fastapi-guide",
    order: 3
  },
  {
    title: "Comprehensive Guide",
    order: 4,
    isSection: true,
    children: [
      {
        title: "1. Intro to APIs & FastAPI (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#1-introduction-to-apis-and-fastapi",
        order: 1,
        isSection: true,
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
        title: "1.4 Introduction to FastAPI (Core)",
        path: "/docs/fastapi/introduction/introduction-to-fastapi",
        order: 5,
      },
      {
        title: "2. Core FastAPI Concepts (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#2-core-fastapi-concepts",
        order: 6,
        isSection: true,
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
      {
        title: "3. Database Handling with SQLAlchemy (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#3-database-handling-with-sqlalchemy",
        order: 12,
        isSection: true,
      },
      {
        title: "3.1 Introduction to SQLAlchemy (Core)",
        path: "/docs/sqlalchemy/introduction/introduction-to-sqlalchemy",
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
      {
        title: "4. Advanced FastAPI Features (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#4-advanced-fastapi-features",
        order: 20,
        isSection: true,
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
      {
        title: "5. FastAPI Security (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#5-fastapi-security",
        order: 36,
        isSection: true,
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
      {
        title: "6. Performance & Optimization (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#6-performance-and-optimization",
        order: 48,
        isSection: true,
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
      {
        title: "7. Advanced SQLAlchemy (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#7-advanced-sqlalchemy-techniques",
        order: 52,
        isSection: true,
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
      {
        title: "8. Pydantic Advanced Features (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#8-pydantic-advanced-features",
        order: 59,
        isSection: true,
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
      {
        title: "9. Async Programming (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#9-async-programming",
        order: 66,
        isSection: true,
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
        path: "/docs/fastapi/performance/optimizing-fastapi-performance", // Reuses
        order: 70,
      },
      {
        title: "9.5 Async Generators",
        path: "/docs/data-streaming/async-generators", // Reuses
        order: 71,
      },
      {
        title: "10. Integrations & Architectures (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#10-integrations-and-architectures",
        order: 72,
        isSection: true,
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
      {
        title: "11. Deployment & Testing (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#11-deployment-and-testing",
        order: 78,
        isSection: true,
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
      {
        title: "12. FastAPI Pro-Level Features (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#12-fastapi-pro-level-features",
        order: 83,
        isSection: true,
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
      {
        title: "13. API Versioning (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#13-api-versioning",
        order: 87,
        isSection: true,
      },
      {
        title: "13.1 Versioning Strategies",
        path: "/docs/api-versioning/strategies",
        order: 88,
      },
      {
        title: "14. AI/ML Integration (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#14-ai-and-machine-learning-integration",
        order: 89,
        isSection: true,
      },
      {
        title: "14.1 Serving ML Models",
        path: "/docs/ai-ml-integration/serving-ml-models",
        order: 90,
      },
      {
        title: "15. Serverless Optimizations (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#15-serverless-optimizations",
        order: 91,
        isSection: true,
      },
      {
        title: "15.1 Optimizing for Serverless",
        path: "/docs/serverless-optimizations/optimizing-for-serverless",
        order: 92,
      },
      {
        title: "16. Advanced Documentation (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#16-advanced-documentation-practices",
        order: 93,
        isSection: true,
      },
      {
        title: "16.1 Enhanced API Documentation",
        path: "/docs/advanced-documentation/enhanced-api-docs",
        order: 94,
      },
      {
        title: "17. Data Streaming (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#17-data-streaming-with-async-generators",
        order: 95,
        isSection: true,
      },
      {
        title: "17.1 Async Data Streaming",
        path: "/docs/data-streaming/async-generators", // Reuses existing
        order: 96,
      },
      {
        title: "18. FastAPI with Rust (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#18-fastapi-with-rust-extensions",
        order: 97,
        isSection: true,
      },
      {
        title: "18.1 Integrating Rust",
        path: "/docs/fastapi-with-rust/integrating-rust",
        order: 98,
      },
      {
        title: "19. SQLAlchemy w/ Data Lakes (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#19-sqlalchemy-with-data-lakes",
        order: 99,
        isSection: true,
      },
      {
        title: "19.1 Querying Data Lakes",
        path: "/docs/sqlalchemy-with-datalakes/querying-data-lakes",
        order: 100,
      },
      {
        title: "20. Pydantic w/ Schema Registry (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#20-pydantic-with-schema-registry",
        order: 101,
        isSection: true,
      },
      {
        title: "20.1 Schema Registry Integration",
        path: "/docs/pydantic-with-schema-registry/integration",
        order: 102,
      },
      {
        title: "21. Async GraphQL Subs (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#21-async-graphql-subscriptions",
        order: 103,
        isSection: true,
      },
      {
        title: "21.1 Implementing GraphQL Subscriptions",
        path: "/docs/async-graphql-subscriptions/implementation",
        order: 104,
      },
      {
        title: "22. FastAPI Edge Computing (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#22-fastapi-with-edge-computing",
        order: 105,
        isSection: true,
      },
      {
        title: "22.1 Deploying FastAPI on Edge Nodes",
        path: "/docs/fastapi-edge-computing/deployment",
        order: 106,
      },
      {
        title: "23. Zero-Downtime Migrations (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#23-zero-downtime-db-migrations",
        order: 107,
        isSection: true,
      },
      {
        title: "23.1 Zero-Downtime DB Migrations",
        path: "/docs/sqlalchemy/migrations/zero-downtime",
        order: 108,
      },
      {
        title: "24. FastAPI w/ Diff. Privacy (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#24-fastapi-with-differential-privacy",
        order: 109,
        isSection: true,
      },
      {
        title: "24.1 Implementing Differential Privacy",
        path: "/docs/fastapi/privacy/differential-privacy",
        order: 110,
      },
      {
        title: "25. Pydantic Static Typing (Main)",
        path: "/docs/guides/comprehensive-fastapi-guide#25-pydantic-with-static-type-checking",
        order: 111,
        isSection: true,
      },
      {
        title: "25.1 Static Type Checking for Pydantic",
        path: "/docs/pydantic/type-checking/static-analysis",
        order: 112,
      },    ]
  },
  {
    title: "General Guides",
    order: 5,
    isSection: true,
    children: [
      { title: "General Documentation Overview", path: "/docs/general/index", order: 1 },
      { title: "Getting Started with DevDocs++", path: "/docs/general/getting-started", order: 2 },
      { title: "Introduction", path: "/docs/general/introduction", order: 3 },
      { title: "Blueprint", path: "/docs/general/blueprint", order: 4 },
      { title: "Advanced Topics in DevDocs++", path: "/docs/guides/advanced-topics", order: 5 }
    ]
  },
  {
    title: "Skills & Knowledge",
    order: 5.3,
    isSection: true,
    children: [
      { title: "Skills Overview", path: "/docs/skills/index", order: 1 },
      { title: "Knowledge Set", path: "/docs/skills/knowledge_set", order: 2 },
      { title: "Skill Set", path: "/docs/skills/skill_set", order: 3 },
      { title: "Backend Skills Set", path: "/docs/skills/backend_skills_set", order: 4 },
      { title: "Full Skill Audit and Learning Plan", path: "/docs/skills/skill_audit_learning_plan", order: 5 },
      { title: "AI Tools", path: "/docs/skills/ai_tools", order: 6 }
    ]
  },
  {
    title: "Comprehensive Guides",
    order: 5.5,
    isSection: true,
    children: [
      { title: "Guides Overview", path: "/docs/comprehensive-guides/index", order: 1 },
      { title: "Comprehensive FastAPI Guide", path: "/docs/comprehensive-guides/Comprehensive FastAPI, SQLAlchemy, Pydantic, and Async Programming Guide", order: 2 },
      { title: "Advanced FastAPI Enhancements", path: "/docs/comprehensive-guides/Advanced FastAPI, SQLAlchemy, Pydantic, and Async Programming Enhancements", order: 3 },
      { title: "Supplementary FastAPI Guide", path: "/docs/comprehensive-guides/Supplementary FastAPI, SQLAlchemy, Pydantic, and Async Programming Guide", order: 4 },
      { title: "Production-Level MkDocs", path: "/docs/comprehensive-guides/Production-Level MkDocs for FastAPI and Related Topics", order: 5 },
      { title: "FastAPI Guide Topics", path: "/docs/fastapi/guides/fastapi_guide_topics", order: 6 },
      { title: "FastAPI Questions", path: "/docs/fastapi/guides/fastapi_questions", order: 7 }
    ]
  },
  {
    title: "Quest Series",
    order: 5.7,
    isSection: true,
    children: [
      { title: "Quest Series Overview", path: "/docs/quests/index", order: 1 },
      { title: "Quest 1", path: "/docs/quests/quest1", order: 2 },
      { title: "Quest 2", path: "/docs/quests/quest2", order: 3 },
      { title: "Quest 3", path: "/docs/quests/quest3", order: 4 },
      { title: "Quest 4", path: "/docs/quests/quest4", order: 5 },
      { title: "Quest 5", path: "/docs/quests/quest5", order: 6 },
      { title: "Quest 6", path: "/docs/quests/quest6", order: 7 }
    ]
  },
  {
    title: "Python Language",
    order: 6,
    isSection: true,
    children: [
      { title: "Basic Python", path: "/docs/python/basic", order: 1 },
      { title: "Intermediate Python", path: "/docs/python/intermediate", order: 2 },
      { title: "Advanced Python", path: "/docs/python/advanced", order: 3 },
      { title: "Pro Python", path: "/docs/python/pro", order: 4 },
      { title: "Python Hidden Gems", path: "/docs/python/hidden-gems", order: 5 }
    ]
  },
  {
    title: "FastAPI Framework",
    order: 7,
    isSection: true,
    children: [
      { title: "Basic FastAPI", path: "/docs/fastapi/basic", order: 1 },
      { title: "Intermediate FastAPI", path: "/docs/fastapi/intermediate", order: 2 },
      { title: "Advanced FastAPI", path: "/docs/fastapi/advanced", order: 3 },
      { title: "Pro FastAPI", path: "/docs/fastapi/pro", order: 4 },
      { title: "FastAPI Hidden Gems", path: "/docs/fastapi/hidden-gems", order: 5 },
      { title: "Introduction to FastAPI", path: "/docs/fastapi/introduction", order: 6, isSection: true },
      { title: "Core FastAPI Concepts", path: "/docs/fastapi/core-concepts", order: 7, isSection: true },
      { title: "Advanced FastAPI Features", path: "/docs/fastapi/advanced-features", order: 8, isSection: true },
      { title: "FastAPI Routing", path: "/docs/fastapi/routing", order: 9, isSection: true },
      { title: "FastAPI Requests", path: "/docs/fastapi/requests", order: 10, isSection: true },
      { title: "FastAPI Responses", path: "/docs/fastapi/responses", order: 11, isSection: true },
      { title: "FastAPI Error Handling", path: "/docs/fastapi/error-handling", order: 12, isSection: true },
      { title: "FastAPI Testing", path: "/docs/fastapi/testing", order: 13, isSection: true },
      { title: "FastAPI Performance & Optimization", path: "/docs/fastapi/performance", order: 14, isSection: true },
      { title: "FastAPI Security", path: "/docs/fastapi/security", order: 15, isSection: true },
      { title: "FastAPI OpenAPI", path: "/docs/fastapi/openapi", order: 16, isSection: true },
      { title: "FastAPI Real-time", path: "/docs/fastapi/real-time", order: 17, isSection: true },
      { title: "FastAPI Privacy", path: "/docs/fastapi/privacy", order: 18, isSection: true },
      { title: "FastAPI Ecosystem", path: "/docs/fastapi/ecosystem", order: 19, isSection: true },
      { title: "FastAPI Pro-Level Features", path: "/docs/fastapi-pro", order: 20, isSection: true },
      { title: "FastAPI with Rust", path: "/docs/fastapi-with-rust", order: 21, isSection: true },
      { title: "FastAPI Edge Computing", path: "/docs/fastapi-edge-computing", order: 22, isSection: true }
    ]
  },
  {
    title: "SQLAlchemy ORM",
    order: 8,
    isSection: true,
    children: [
      { title: "Basic SQLAlchemy", path: "/docs/sqlalchemy/basic", order: 1 },
      { title: "Intermediate SQLAlchemy", path: "/docs/sqlalchemy/intermediate", order: 2 },
      { title: "Advanced SQLAlchemy", path: "/docs/sqlalchemy/advanced", order: 3 },
      { title: "Pro SQLAlchemy", path: "/docs/sqlalchemy/pro", order: 4 },
      { title: "SQLAlchemy Hidden Gems", path: "/docs/sqlalchemy/hidden-gems", order: 5 },
      { title: "Introduction to SQLAlchemy", path: "/docs/sqlalchemy/introduction", order: 6, isSection: true },
      { title: "FastAPI Integration with SQLAlchemy", path: "/docs/sqlalchemy/fastapi-integration", order: 7, isSection: true },
      { title: "Pydantic Integration with SQLAlchemy", path: "/docs/sqlalchemy/pydantic-integration", order: 8, isSection: true },
      { title: "SQLAlchemy Modeling", path: "/docs/sqlalchemy/modeling", order: 9, isSection: true },
      { title: "Advanced SQLAlchemy Techniques", path: "/docs/sqlalchemy/advanced-techniques", order: 10, isSection: true },
      { title: "SQLAlchemy Performance", path: "/docs/sqlalchemy/performance/sqlalchemy-performance", order: 11 },
      { title: "Advanced SQLAlchemy Patterns", path: "/docs/sqlalchemy/advanced-patterns", order: 12, isSection: true },
      { title: "Async SQLAlchemy", path: "/docs/sqlalchemy/async", order: 13, isSection: true },
      { title: "SQLAlchemy Migrations", path: "/docs/sqlalchemy/migrations", order: 14, isSection: true },
      { title: "SQLAlchemy Best Practices", path: "/docs/sqlalchemy/best-practices", order: 15, isSection: true },
      { title: "SQLAlchemy with Data Lakes", path: "/docs/sqlalchemy-with-datalakes", order: 16, isSection: true }
    ]
  },
  {
    title: "Pydantic Library",
    order: 9,
    isSection: true,
    children: [
      { title: "Basic Pydantic", path: "/docs/pydantic/basic", order: 1 },
      { title: "Intermediate Pydantic", path: "/docs/pydantic/intermediate", order: 2 },
      { title: "Advanced Pydantic", path: "/docs/pydantic/advanced", order: 3 },
      { title: "Pro Pydantic", path: "/docs/pydantic/pro", order: 4 },
      { title: "Pydantic Hidden Gems", path: "/docs/pydantic/hidden-gems", order: 5 },
      { title: "Pydantic Advanced Features", path: "/docs/pydantic/advanced-features", order: 6, isSection: true },
      { title: "Pydantic Type Checking", path: "/docs/pydantic/type-checking", order: 7, isSection: true },
      { title: "Pydantic with Schema Registry", path: "/docs/pydantic-with-schema-registry", order: 8, isSection: true }
    ]
  },
  {
    title: "PostgreSQL Database",
    order: 10,
    isSection: true,
    children: [
      { title: "Basic PostgreSQL", path: "/docs/postgresql/basic", order: 1 },
      { title: "Intermediate PostgreSQL", path: "/docs/postgresql/intermediate", order: 2 },
      { title: "Advanced PostgreSQL", path: "/docs/postgresql/advanced", order: 3 },
      { title: "Pro PostgreSQL", path: "/docs/postgresql/pro", order: 4 },
      { title: "PostgreSQL Hidden Gems", path: "/docs/postgresql/hidden-gems", order: 5 }
    ]
  },
  {
    title: "MongoDB Database",
    order: 11,
    isSection: true,
    children: [
      { title: "Basic MongoDB", path: "/docs/mongodb/basic", order: 1 },
      { title: "Intermediate MongoDB", path: "/docs/mongodb/intermediate", order: 2 },
      { title: "Advanced MongoDB", path: "/docs/mongodb/advanced", order: 3 },
      { title: "Pro MongoDB", path: "/docs/mongodb/pro", order: 4 },
      { title: "MongoDB Hidden Gems", path: "/docs/mongodb/hidden-gems", order: 5 }
    ]
  },
  {
    title: "JavaScript Language",
    order: 12,
    isSection: true,
    children: [
      { title: "Basic JavaScript", path: "/docs/javascript/basic", order: 1 },
      { title: "Intermediate JavaScript", path: "/docs/javascript/intermediate", order: 2 },
      { title: "Advanced JavaScript", path: "/docs/javascript/advanced", order: 3 },
      { title: "Pro JavaScript", path: "/docs/javascript/pro", order: 4 },
      { title: "JavaScript Hidden Gems", path: "/docs/javascript/hidden-gems", order: 5 }
    ]
  },
  {
    title: "React Framework",
    order: 13,
    isSection: true,
    children: [
      { title: "Basic React", path: "/docs/react/basic", order: 1 },
      { title: "Intermediate React", path: "/docs/react/intermediate", order: 2 },
      { title: "Advanced React", path: "/docs/react/advanced", order: 3 },
      { title: "Pro React", path: "/docs/react/pro", order: 4 },
      { title: "React Hidden Gems", path: "/docs/react/hidden-gems", order: 5 }
    ]
  },
  {
    title: "Next.js Framework",
    order: 14,
    isSection: true,
    children: [
      { title: "Basic Next.js", path: "/docs/nextjs/basic", order: 1 },
      { title: "Intermediate Next.js", path: "/docs/nextjs/intermediate", order: 2 },
      { title: "Advanced Next.js", path: "/docs/nextjs/advanced", order: 3 },
      { title: "Pro Next.js", path: "/docs/nextjs/pro", order: 4 },
      { title: "Next.js Hidden Gems", path: "/docs/nextjs/hidden-gems", order: 5 }
    ]
  },
  {
    title: "HTML Markup",
    order: 15,
    isSection: true,
    children: [
      { title: "Basic HTML", path: "/docs/html/basic", order: 1 },
      { title: "Intermediate HTML", path: "/docs/html/intermediate", order: 2 },
      { title: "Advanced HTML", path: "/docs/html/advanced", order: 3 },
      { title: "Pro HTML", path: "/docs/html/pro", order: 4 },
      { title: "HTML Hidden Gems", path: "/docs/html/hidden-gems", order: 5 }
    ]
  },
  {
    title: "CSS Styling",
    order: 16,
    isSection: true,
    children: [
      { title: "Basic CSS", path: "/docs/css/basic", order: 1 },
      { title: "Intermediate CSS", path: "/docs/css/intermediate", order: 2 },
      { title: "Advanced CSS", path: "/docs/css/advanced", order: 3 },
      { title: "Pro CSS", path: "/docs/css/pro", order: 4 },
      { title: "CSS Hidden Gems", path: "/docs/css/hidden-gems", order: 5 }
    ]
  },
  {
    title: "API Documentation",
    order: 16.5,
    isSection: true,
    children: [
      { title: "API Fundamentals", path: "/docs/api-fundamentals", order: 1, isSection: true },
      { title: "API Reference", path: "/docs/api/reference", order: 2 },
      { title: "API Webhooks", path: "/docs/api/webhooks", order: 3 },
      { title: "API Versioning", path: "/docs/api-versioning", order: 4, isSection: true }
    ]
  },
  {
    title: "Async Programming",
    order: 16.7,
    isSection: true,
    children: [
      { title: "Async Programming Overview", path: "/docs/async-programming", order: 1, isSection: true },
      { title: "Async GraphQL Subscriptions", path: "/docs/async-graphql-subscriptions", order: 2, isSection: true }
    ]
  },
  {
    title: "Data & Streaming",
    order: 16.8,
    isSection: true,
    children: [
      { title: "Data Streaming", path: "/docs/data-streaming", order: 1, isSection: true }
    ]
  },
  {
    title: "Deployment & Testing",
    order: 16.9,
    isSection: true,
    children: [
      { title: "Deployment and Testing", path: "/docs/deployment-and-testing", order: 1, isSection: true }
    ]
  },
  {
    title: "Integrations & Architecture",
    order: 17,
    isSection: true,
    children: [
      { title: "Integrations and Architectures", path: "/docs/integrations-and-architectures", order: 1, isSection: true },
      { title: "Serverless Optimizations", path: "/docs/serverless-optimizations", order: 2, isSection: true }
    ]
  },
  {
    title: "AI/ML Integration",
    order: 17.1,
    isSection: true,
    children: [
      { title: "AI/ML Integration", path: "/docs/ai-ml-integration", order: 1, isSection: true }
    ]
  },
  {
    title: "Advanced Documentation",
    order: 17.2,
    isSection: true,
    children: [
      { title: "Advanced Documentation", path: "/docs/advanced-documentation", order: 1, isSection: true }
    ]
  },
  {
    title: "Development Documents",
    order: 17.25,
    isSection: true,
    children: [
      { title: "Overview", path: "/docs/development-documents/index", order: 1 },
      { title: "Backend Development", path: "/docs/development-documents/backend-development", order: 2 },
      { title: "Frontend Development", path: "/docs/development-documents/frontend-development", order: 3 }
    ]
  },
  {
    title: "Project Documentation",
    order: 17.3,
    isSection: true,
    children: [
      { title: "Project Overview", path: "/docs/project-docs/index", order: 1 },
      { title: "Documentation Enhancements", path: "/docs/project-docs/DOCUMENTATION_ENHANCEMENTS", order: 2 },
      { title: "Features Guide", path: "/docs/project-docs/FEATURES_GUIDE", order: 3 },
      { title: "Missing Files Analysis", path: "/docs/project-docs/missing_files_analysis", order: 4 }
    ]
  },
  {
    title: "Software Product Documentation",
    order: 18,
    isSection: true,
    children: [
      { title: "Backend Documentation", path: "/docs/spd/backend", order: 1 },
      { title: "Frontend Documentation", path: "/docs/spd/frontend", order: 2 },
      { title: "Database Documentation", path: "/docs/spd/database", order: 3 },
      { title: "Additional Documentation", path: "/docs/spd/additional", order: 4 },
      { title: "Advanced Security Protocols", path: "/docs/spd/advanced_securtiy_protocols", order: 5 },
      { title: "DevSecOps Full-Stack", path: "/docs/spd/devsecops-full-stack", order: 6 }
    ]
  },
  {
    title: "Software Product Architecture",
    order: 19,
    isSection: true,
    children: [
      { title: "Stage 1", path: "/docs/spa/stage1", order: 1 },
      { title: "Stage 2", path: "/docs/spa/stage2", order: 2 },
      { title: "Stage 3", path: "/docs/spa/stage3", order: 3 },
      { title: "Stage 4", path: "/docs/spa/stage4", order: 4 },
      { title: "Stage 5", path: "/docs/spa/stage5", order: 5 },
      { title: "Stage 6", path: "/docs/spa/stage6", order: 6 }
    ]
  },
  {
    title: "Getting Started (New)",
    order: 21,
    isSection: true,
    children: [
      { title: "Introduction", path: "/docs/old_docs/overview/getting-started", order: 1 },
      { title: "FastAPI Guidelines", path: "/docs/old_docs/overview/fastapi-guide-info", order: 2 },
      { title: "HTML Indian Flag", path: "/docs/old_docs/overview/html_indian_flag", order: 3 },
      { title: "HTTP Status Codes", path: "/docs/old_docs/overview/http_status_codes", order: 4 },
      {
        title: "Skills",
        order: 5,
        isSection: true,
        children: [
          { title: "General Skill Set", path: "/docs/old_docs/skill_set", order: 1 },
          { title: "Backend Skills", path: "/docs/old_docs/backend_skills_set", order: 2 },
          { title: "AI Tools", path: "/docs/old_docs/ai_tools", order: 3 }
        ]
      }
    ]
  },
  {
    title: "Tutorials",
    order: 22,
    isSection: true,
    children: [
      {
        title: "Python Tutorials",
        order: 1,
        isSection: true,
        children: [
          { title: "Basics", path: "/docs/old_docs/tutorials/python_tut", order: 1 },
          { title: "Data Analysis", path: "/docs/old_docs/tutorials/python_data_analyst_tut", order: 2 },
          { title: "Tools", path: "/docs/old_docs/tutorials/python_tools", order: 3 },
          { title: "Testing", path: "/docs/old_docs/tutorials/python_testing", order: 4 }
        ]
      },
      {
        title: "Core Python Tutorials",
        order: 2,
        isSection: true,
        children: [
          { title: "Functions & Classes", path: "/docs/old_docs/core_python/function_class", order: 1 },
          { title: "Decorators", path: "/docs/old_docs/core_python/decorators", order: 2 },
          { title: "Error Handling", path: "/docs/old_docs/core_python/error_handling", order: 3 },
          { title: "Data Structures", path: "/docs/old_docs/core_python/advanced_data_structures", order: 4 },
          { title: "Object-Oriented Programming", path: "/docs/old_docs/core_python/oops", order: 5 },
          { title: "Code Optimization", path: "/docs/old_docs/core_python/code_optimization", order: 6 }
        ]
      },
      { title: "Web Development", path: "/docs/old_docs/tutorials/web_tut", order: 3 },
      { title: "AWS Tutorials", path: "/docs/old_docs/tutorials/aws_tut", order: 4 },
      { title: "DevSecOps Tutorials", path: "/docs/old_docs/tutorials/devsecops_tut", order: 5 },
      {
        title: "Containerization Tutorials",
        order: 6,
        isSection: true,
        children: [
          { title: "Docker & Kubernetes Roadmap", path: "/docs/old_docs/tutorials/docker_kubernetes_roadmap", order: 1 },
          { title: "Docker", path: "/docs/old_docs/tutorials/docker_tut", order: 2 },
          { title: "Kubernetes", path: "/docs/old_docs/tutorials/kubernetes_tut", order: 3 }
        ]
      },
      {
        title: "Version Control Tutorials",
        order: 7,
        isSection: true,
        children: [
          { title: "Git Roadmap", path: "/docs/old_docs/tutorials/git_roadmap", order: 1 },
          { title: "Git Tutorial", path: "/docs/old_docs/tutorials/git_tut", order: 2 }
        ]
      },
      { title: "Trending Technologies", path: "/docs/old_docs/tutorials/trending_tech_stack", order: 8 },
      { title: "Contributing Guidelines", path: "/docs/old_docs/tutorials/contributing", order: 9 }
    ]
  },
  {
    title: "FastAPI (User)",
    order: 23,
    isSection: true,
    children: [
      {
        title: "Guides",
        order: 1,
        isSection: true,
        children: [
          { title: "Introduction to APIs", path: "/docs/old_docs/intro/api", order: 1 },
          { title: "API Types", path: "/docs/old_docs/intro/api_types", order: 2 },
          { title: "REST API", path: "/docs/old_docs/intro/rest_api", order: 3 },
          { title: "FastAPI Introduction", path: "/docs/old_docs/intro/fastapi_intro", order: 4 },
          { title: "FastAPI Topics", path: "/docs/old_docs/fastapi_guide_topics", order: 5 }
        ]
      },
      {
        title: "Examples",
        order: 2,
        isSection: true,
        children: [
          { title: "Basic Application", path: "/docs/old_docs/examples/basic_fastapi", order: 1 },
          { title: "In-Memory Database", path: "/docs/old_docs/examples/in_memory_db", order: 2 },
          { title: "Raw SQL Database", path: "/docs/old_docs/examples/db_raw_sql", order: 3 },
          { title: "Boilerplate Reduction", path: "/docs/old_docs/examples/reduce_boilerplate", order: 4 }
        ]
      },
      {
        title: "Database",
        order: 3,
        isSection: true,
        children: [
          { title: "SQLAlchemy Introduction", path: "/docs/old_docs/database/sqlalchemy_intro", order: 1 },
          { title: "FastAPI with SQLAlchemy", path: "/docs/old_docs/database/sqlalchemy_fastapi", order: 2 },
          { title: "SQLAlchemy Best Practices", path: "/docs/old_docs/database/sqlalchemy_usage", order: 3 },
          { title: "Pydantic Introduction", path: "/docs/old_docs/database/pydantic_intro", order: 4 },
          { title: "Pydantic Integration", path: "/docs/old_docs/database/pydantic_sqlalchemy", order: 5 },
          { title: "Pydantic vs SQLAlchemy", path: "/docs/old_docs/database/pydantic_vs_sqlalchemy", order: 6 }
        ]
      },
      {
        title: "Async vs Sync",
        order: 4,
        isSection: true,
        children: [
          { title: "Execution Models", path: "/docs/old_docs/async/sync_vs_async", order: 1 },
          { title: "Database Connections", path: "/docs/old_docs/async/db_connections", order: 2 },
          { title: "Engine & Sessions", path: "/docs/old_docs/async/engine_sessions", order: 3 }
        ]
      },
      {
        title: "Database Queries",
        order: 5,
        isSection: true,
        children: [
          { title: "Overview", path: "/docs/old_docs/database_queries/queries_overview", order: 1 },
          {
            title: "Inserts",
            order: 2,
            isSection: true,
            children: [
              { title: "Single Table", path: "/docs/old_docs/database_queries/insert_single_table", order: 1 },
              { title: "Two Unrelated Tables", path: "/docs/old_docs/database_queries/insert_two_unrelated", order: 2 },
              { title: "Two Related Tables", path: "/docs/old_docs/database_queries/insert_two_related", order: 3 },
              { title: "Multiple Unrelated Tables", path: "/docs/old_docs/database_queries/insert_multiple_unrelated", order: 4 },
              { title: "Multiple Related Tables", path: "/docs/old_docs/database_queries/insert_multiple_related", order: 5 }
            ]
          },
          {
            title: "Fetches",
            order: 3,
            isSection: true,
            children: [
              { title: "Single Table", path: "/docs/old_docs/fetch_queries/fetch_single_table", order: 1 },
              { title: "Two Unrelated Tables", path: "/docs/old_docs/fetch_queries/fetch_two_unrelated", order: 2 },
              { title: "Two Related Tables", path: "/docs/old_docs/fetch_queries/fetch_two_related", order: 3 },
              { title: "Multiple Unrelated Tables", path: "/docs/old_docs/fetch_queries/fetch_multiple_unrelated", order: 4 },
              { title: "Multiple Related Tables", path: "/docs/old_docs/fetch_queries/fetch_multiple_related", order: 5 }
            ]
          }
        ]
      },
      {
        title: "Tables",
        order: 6,
        isSection: true,
        children: [
          { title: "Table Creation", path: "/docs/old_docs/tables/table_creation", order: 1 },
          { title: "Secure Practices", path: "/docs/old_docs/tables/secure_creation", order: 2 }
        ]
      },
      {
        title: "Naming Conventions",
        order: 7,
        isSection: true,
        children: [
          { title: "Project Structure", path: "/docs/old_docs/naming/project_structure", order: 1 },
          { title: "API Routes", path: "/docs/old_docs/naming/api_routes", order: 2 },
          { title: "Python Naming", path: "/docs/old_docs/naming/python_naming", order: 3 }
        ]
      },
      {
        title: "Advanced",
        order: 8,
        isSection: true,
        children: [
          { title: "Pydantic Settings", path: "/docs/old_docs/advanced/pydantic_settings", order: 1 },
          { title: "Request Handling", path: "/docs/old_docs/advanced/request_handling", order: 2 },
          { title: "Input/Output Management", path: "/docs/old_docs/advanced/input_output", order: 3 },
          { title: "Performance & Security", path: "/docs/old_docs/advanced/performance_security", order: 4 },
          { title: "Profiling & Memory", path: "/docs/old_docs/advanced/profile_memory", order: 5 }
        ]
      },
      {
        title: "Best Practices",
        order: 9,
        isSection: true,
        children: [
          { title: "Coding Guidelines", path: "/docs/old_docs/best_practices/fastapi_guidelines", order: 1 },
          { title: "CRUD Application", path: "/docs/old_docs/best_practices/crud_application", order: 2 },
          { title: "CRUD Operations", path: "/docs/old_docs/best_practices/sync_vs_async_crud", order: 3 }
        ]
      },
      {
        title: "Utilities",
        order: 10,
        isSection: true,
        children: [
          { title: "Essentials", path: "/docs/old_docs/utilities/fastapi_pydantic_sqlalchemy", order: 1 },
          { title: "Code Snippets", path: "/docs/old_docs/utilities/code_snippets", order: 2 }
        ]
      },
      { title: "Web Servers", path: "/docs/old_docs/web_servers/server_comparison", order: 11 },
      {
        title: "WebSockets",
        order: 12,
        isSection: true,
        children: [
          { title: "Introduction", path: "/docs/old_docs/websockets/websockets_intro", order: 1 },
          { title: "Implementation", path: "/docs/old_docs/websockets/websockets_integration", order: 2 }
        ]
      },
      {
        title: "Security",
        order: 13,
        isSection: true,
        children: [
          { title: "API Security", path: "/docs/old_docs/security/api_security", order: 1 },
          { title: "FastAPI Security", path: "/docs/old_docs/security/fastapi_security", order: 2 }
        ]
      },
      {
        title: "Authentication",
        order: 14,
        isSection: true,
        children: [
          { title: "Methods", path: "/docs/old_docs/auth/auth_methods", order: 1 },
          { title: "FastAPI Authentication", path: "/docs/old_docs/auth/fastapi_authentication", order: 2 }
        ]
      },
      { title: "Built-in Features", path: "/docs/old_docs/built_in/fastapi_methods", order: 15 },
      { title: "Additional Features", path: "/docs/old_docs/additional_features/built_in_utilities", order: 16 },
      {
        title: "Deployment",
        order: 17,
        isSection: true,
        children: [
          { title: "Cloud Deployment", path: "/docs/old_docs/deployment/cloud_deployment", order: 1 },
          { title: "Container Deployment", path: "/docs/old_docs/deployment/container_deployment", order: 2 }
        ]
      },
      { title: "Frontend Integration", path: "/docs/old_docs/frontend/frontend_integration", order: 18 },
      { title: "Advanced SQLAlchemy", path: "/docs/old_docs/advanced_sqlalchemy/advanced_operations", order: 19 }
    ]
  },
  {
    title: "Testing",
    order: 24,
    isSection: true,
    children: [
      { title: "Functional Testing", path: "/docs/old_docs/pytests_tutorial/functional_pytests", order: 1 },
      { title: "SQLite Sync", path: "/docs/old_docs/pytests_tutorial/sync_fastapi_sqlite", order: 2 },
      { title: "SQLAlchemy Sync", path: "/docs/old_docs/pytests_tutorial/sync_fastapi_sqlalchemy", order: 3 },
      { title: "SQLAlchemy Async", path: "/docs/old_docs/pytests_tutorial/async_fastapi_sqlalchemy", order: 4 },
      { title: "Pytest Commands", path: "/docs/old_docs/pytests_tutorial/pytests_commands", order: 5 },
      { title: "Test Cases", path: "/docs/old_docs/pytests_tutorial/test_cases", order: 6 },
      { title: "HTTP Method Tests", path: "/docs/old_docs/pytests_tutorial/http_method_test_cases", order: 7 },
      {
        title: "Implementation Guides",
        order: 8,
        isSection: true,
        children: [
          { title: "Sync Testing", path: "/docs/old_docs/pytests_tutorial/sync_test_implementation", order: 1 },
          { title: "Async Testing", path: "/docs/old_docs/pytests_tutorial/async_test_implementation", order: 2 }
        ]
      }
    ]
  },
  {
    title: "DevOps",
    order: 25,
    isSection: true,
    children: [
      { title: "Overview", path: "/docs/old_docs/learning_notes/devops/overview", order: 1 },
      { title: "Core Principles", path: "/docs/old_docs/learning_notes/devops/principles", order: 2 },
      { title: "Lifecycle Stages", path: "/docs/old_docs/learning_notes/devops/stages", order: 3 },
      { title: "Tools", path: "/docs/old_docs/learning_notes/devops/tools", order: 4 },
      {
        title: "CI/CD",
        order: 5,
        isSection: true,
        children: [
          { title: "Overview", path: "/docs/old_docs/learning_notes/ci-cd/overview", order: 1 },
          { title: "Workflow", path: "/docs/old_docs/learning_notes/ci-cd/process", order: 2 },
          { title: "Tools", path: "/docs/old_docs/learning_notes/ci-cd/tools", order: 3 },
          { title: "Pros and Cons", path: "/docs/old_docs/learning_notes/ci-cd/pros-cons", order: 4 },
          { title: "Notes", path: "/docs/old_docs/ci-cd-learn/cicd_notes", order: 5 },
          { title: "AWS Jenkins Pipeline", path: "/docs/old_docs/ci-cd-learn/aws_jenkins_pipeline", order: 6 },
          { title: "FastAPI CI/CD Pipeline", path: "/docs/old_docs/ci-cd-learn/fastapi_jenkins_pipeline", order: 7 }
        ]
      },
      {
        title: "Containerization",
        order: 6,
        isSection: true,
        children: [
          { title: "Docker Compose", path: "/docs/old_docs/ci-cd-learn/docker_compose", order: 1 },
          { title: "Docker Tutorial", path: "/docs/old_docs/tech_tutorials/docker_tut/basics", order: 2 },
          { title: "Kubernetes Tutorial", path: "/docs/old_docs/tech_tutorials/kubernetes_tut/basics", order: 3 }
        ]
      },
      {
        title: "Infrastructure",
        order: 7,
        isSection: true,
        children: [
          {
            title: "AWS",
            order: 1,
            isSection: true,
            children: [
              { title: "Introduction", path: "/docs/old_docs/aws/aws_intro", order: 1 },
              { title: "Beginner Guide", path: "/docs/old_docs/aws/aws_beginner", order: 2 },
              { title: "IAM", path: "/docs/old_docs/aws/aws_iam", order: 3 },
              { title: "S3", path: "/docs/old_docs/aws/aws_s3", order: 4 },
              { title: "Elastic Beanstalk", path: "/docs/old_docs/aws/elastic_beanstalk", order: 5 }
            ]
          },
          {
            title: "Infrastructure as Code",
            order: 2,
            isSection: true,
            children: [
              { title: "Terraform", path: "/docs/old_docs/devops_old/03-infrastructure/terraform", order: 1 },
              { title: "HashiCorp Vault Setup", path: "/docs/old_docs/hcv/vault_setup", order: 2 }
            ]
          }
        ]
      },
      {
        title: "Cloud Native",
        order: 8,
        isSection: true,
        children: [
          { title: "Helm", path: "/docs/old_docs/cloud_native/helm", order: 1 },
          { title: "Istio", path: "/docs/old_docs/cloud_native/istio", order: 2 }
        ]
      },
      {
        title: "Automation",
        order: 9,
        isSection: true,
        children: [
          { title: "Jenkins", path: "/docs/old_docs/devops_old/02-automation/jenkins", order: 1 },
          { title: "GitHub Actions", path: "/docs/old_docs/devops_old/02-automation/github-actions", order: 2 }
        ]
      },
      {
        title: "Monitoring",
        order: 10,
        isSection: true,
        children: [
          { title: "ELK Stack", path: "/docs/old_docs/devops_old/04-monitoring/elk-stack", order: 1 },
          { title: "Ansible", path: "/docs/old_docs/devops_old/04-monitoring/ansible", order: 2 }
        ]
      },
      {
        title: "Advanced Topics",
        order: 11,
        isSection: true,
        children: [
          { title: "GitOps with ArgoCD", path: "/docs/old_docs/devops_old/05-advanced/gitops-argocd", order: 1 },
          { title: "Microservices", path: "/docs/old_docs/devops_old/05-advanced/microservices", order: 2 },
          { title: "RabbitMQ", path: "/docs/old_docs/devops_old/05-advanced/rabbitmq", order: 3 }
        ]
      },
      { title: "Additional Notes", path: "/docs/old_docs/devops_old/additional-notes", order: 12 }
    ]
  },
  {
    title: "DevSecOps",
    order: 26,
    isSection: true,
    children: [
      { title: "Overview", path: "/docs/old_docs/learning_notes/devsecops/overview", order: 1 },
      { title: "Security Practices", path: "/docs/old_docs/learning_notes/devsecops/security-practices", order: 2 },
      { title: "Tools", path: "/docs/old_docs/learning_notes/devsecops/tools", order: 3 },
      {
        title: "Learning Path",
        order: 4,
        isSection: true,
        children: [
          { title: "Fundamentals (0-3 months)", path: "/docs/old_docs/tech_tutorials/devsecops_tut/fundamentals", order: 1 },
          {
            title: "Intermediate (3-6 months)",
            order: 2,
            isSection: true,
            children: [
              { title: "Version Control Security", path: "/docs/old_docs/tech_tutorials/devsecops_tut/version_control", order: 1 },
              { title: "CI/CD Pipeline Security", path: "/docs/old_docs/tech_tutorials/devsecops_tut/cicd_pipeline_security", order: 2 },
              { title: "Container Security", path: "/docs/old_docs/tech_tutorials/devsecops_tut/container_security", order: 3 },
              { title: "Cloud Security", path: "/docs/old_docs/tech_tutorials/devsecops_tut/cloud_security_compliance", order: 4 }
            ]
          },
          {
            title: "Advanced (6-12 months)",
            order: 3,
            isSection: true,
            children: [
              { title: "Security Testing", path: "/docs/old_docs/tech_tutorials/devsecops_tut/security_testing_automation", order: 1 },
              { title: "IaC Security", path: "/docs/old_docs/tech_tutorials/devsecops_tut/iac_security", order: 2 },
              { title: "Secrets Management", path: "/docs/old_docs/tech_tutorials/devsecops_tut/secrets_management", order: 3 },
              { title: "Incident Response", path: "/docs/old_docs/tech_tutorials/devsecops_tut/security_incident_response", order: 4 }
            ]
          },
          {
            title: "Expert (12+ months)",
            order: 4,
            isSection: true,
            children: [
              { title: "Threat Modeling", path: "/docs/old_docs/tech_tutorials/devsecops_tut/threat_modeling", order: 1 },
              { title: "Compliance & Governance", path: "/docs/old_docs/tech_tutorials/devsecops_tut/compliance_governance", order: 2 },
              { title: "Red Teaming", path: "/docs/old_docs/tech_tutorials/devsecops_tut/red_teaming", order: 3 },
              { title: "Kubernetes Security", path: "/docs/old_docs/tech_tutorials/devsecops_tut/kubernetes_cloud_security", order: 4 }
            ]
          }
        ]
      }
    ]
  },
  {
    title: "Application Architecture",
    order: 27,
    isSection: true,
    children: [
      { title: "Requirements", path: "/docs/old_docs/architectures/requirements", order: 1 },
      { title: "Architecture Types", path: "/docs/old_docs/architectures/types", order: 2 },
      {
        title: "Architectures",
        order: 3,
        isSection: true,
        children: [
          { title: "Monolithic", path: "/docs/old_docs/architectures/monolithic", order: 1 },
          { title: "Layered Monolith", path: "/docs/old_docs/architectures/layered", order: 2 },
          { title: "Microservices", path: "/docs/old_docs/architectures/microservices", order: 3 },
          { title: "Service-Oriented Architecture", path: "/docs/old_docs/architectures/soa", order: 4 },
          { title: "Event-Driven Architecture", path: "/docs/old_docs/architectures/eda", order: 5 },
          { title: "Event-Driven Hexagonal", path: "/docs/old_docs/architectures/event-driven-hexagonal", order: 6 }
        ]
      },
      {
        title: "Recommended Architectures",
        order: 4,
        isSection: true,
        children: [
          { title: "Event-Driven Hexagonal", path: "/docs/old_docs/architectures/recommended/event-driven-hexagonal", order: 1 },
          { title: "Layered Monolith", path: "/docs/old_docs/architectures/recommended/layered-monolith", order: 2 },
          { title: "Microservices", path: "/docs/old_docs/architectures/recommended/microservices", order: 3 }
        ]
      },
      {
        title: "Folder Structures",
        order: 5,
        isSection: true,
        children: [
          { title: "Monolithic", path: "/docs/old_docs/architectures/folder-structures/monolith", order: 1 },
          { title: "Microservices", path: "/docs/old_docs/architectures/folder-structures/microservices", order: 2 },
          { title: "Service-Oriented Architecture", path: "/docs/old_docs/architectures/folder-structures/soa", order: 3 },
          { title: "Event-Driven Architecture", path: "/docs/old_docs/architectures/folder-structures/eda", order: 4 },
          { title: "Event-Driven Hexagonal", path: "/docs/old_docs/architectures/folder-structures/event-driven-hexagonal", order: 5 },
          { title: "Layered Monolith", path: "/docs/old_docs/architectures/folder-structures/layered-monolith", order: 6 }
        ]
      },
      {
        title: "Software Principles",
        order: 6,
        isSection: true,
        children: [
          { title: "Overview", path: "/docs/old_docs/architectures/principles/principles", order: 1 },
          { title: "SOLID", path: "/docs/old_docs/architectures/principles/solid", order: 2 },
          { title: "DRY", path: "/docs/old_docs/architectures/principles/dry", order: 3 },
          { title: "KISS", path: "/docs/old_docs/architectures/principles/kiss", order: 4 },
          { title: "YAGNI", path: "/docs/old_docs/architectures/principles/yagni", order: 5 },
          { title: "Separation of Concerns", path: "/docs/old_docs/architectures/principles/soc", order: 6 },
          { title: "Law of Demeter", path: "/docs/old_docs/architectures/principles/lod", order: 7 }
        ]
      },
      { title: "Image Prompts", path: "/docs/old_docs/architectures/image-prompts", order: 7 },
      { title: "ASCII Diagrams", path: "/docs/old_docs/architectures/canvas-prompts", order: 8 }
    ]
  },
  {
    title: "AI Chat Notes",
    order: 28,
    isSection: true,
    children: [
      {
        title: "ChatGPT",
        order: 1,
        isSection: true,
        children: [
          { title: "CI/CD Enhancements", path: "/docs/old_docs/ai_chat/pipeline_next_level", order: 1 },
          { title: "GitHub Actions CI/CD", path: "/docs/old_docs/ai_chat/pipeline_full_github_actions", order: 2 },
          { title: "Production CI/CD Setup", path: "/docs/old_docs/ai_chat/pipeline_full_production", order: 3 },
          { title: "FastAPI CI/CD Pipeline", path: "/docs/old_docs/ai_chat/pipeline_github_actions", order: 4 },
          { title: "Terraform Setup", path: "/docs/old_docs/ai_chat/terraform_setup_guidelines", order: 5 }
        ]
      },
      {
        title: "Grok",
        order: 2,
        isSection: true,
        children: [
          { title: "Kong API Gateway Introduction", path: "/docs/old_docs/ai_chat/kong_api_gateway_intro", order: 1 },
          { title: "Kong API Gateway Setup", path: "/docs/old_docs/ai_chat/kong_api_gateway_setup", order: 2 },
          { title: "Caddy vs Nginx Reverse Proxy", path: "/docs/old_docs/ai_chat/caddy_nginx_reverse_proxy", order: 3 }
        ]
      }
    ]
  },
  {
    title: "Blog",
    path: "/docs/old_docs/blog/index",
    order: 29
  },
  {
    title: "Changelog",
    path: "/docs/old_docs/changelog",
    order: 30
  },
  {
    title: "About Project",
    order: 31,
    isSection: true,
    children: [
      { title: "License", path: "/docs/old_docs/about/license", order: 1 },
      { title: "Contributing", path: "/docs/old_docs/about/contributing", order: 2 },
      { title: "Contact", path: "/docs/old_docs/about/contact", order: 3 }
    ]
  },
  {
    title: "Error Page Info",
    order: 32,
    isSection: true,
    children: [
      { title: "Custom 404", path: "/docs/old_docs/custom_404", order: 1 }
    ]
  },
  {
    title: "Alternative Paradigms",
    order: 33,
    isSection: true,
    children: [
      { title: "GitOps", path: "/docs/old_docs/learning_notes/alternatives/gitops", order: 1 },
      { title: "NoOps", path: "/docs/old_docs/learning_notes/alternatives/noops", order: 2 },
      { title: "Platform Engineering", path: "/docs/old_docs/learning_notes/alternatives/platform-engineering", order: 3 },
      { title: "MLOps", path: "/docs/old_docs/learning_notes/alternatives/mlops", order: 4 },
      { title: "DataOps", path: "/docs/old_docs/learning_notes/alternatives/dataops", order: 5 },
      { title: "FinOps", path: "/docs/old_docs/learning_notes/alternatives/finops", order: 6 }
    ]
  },
  {
    title: "Additional Concepts",
    order: 33,
    isSection: true,
    children: [
      { title: "Observability", path: "/docs/old_docs/learning_notes/additional-concepts/observability", order: 1 },
      { title: "Progressive Delivery", path: "/docs/old_docs/learning_notes/additional-concepts/progressive-delivery", order: 2 },
      { title: "Value Stream Management", path: "/docs/old_docs/learning_notes/additional-concepts/value-stream-management", order: 3 },
      { title: "Policy as Code", path: "/docs/old_docs/learning_notes/additional-concepts/policy-as-code", order: 4 },
      { title: "Chaos Engineering", path: "/docs/old_docs/learning_notes/additional-concepts/chaos-engineering", order: 5 },
      { title: "Site Reliability Engineering", path: "/docs/old_docs/learning_notes/additional-concepts/sre", order: 6 }
    ]
  }
];