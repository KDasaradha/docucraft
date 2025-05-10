---
title: Overview
description: Placeholder content for Software Principles Overview.
order: 1
---

# Software Principles Overview

Since you’re developing two applications (App 1: Business System with modules like User, HRMS, Chat, etc.; App 2: School ERP with modules like Libraries, Events, Attendance) using **React**, **Next.js**, **TypeScript**, **Python**, **FastAPI**, **async**, **PostgreSQL**, and a **multi-tenant** architecture, and you’ve explored architectures like **Monolithic**, **Layered**, **Microservices**, **SOA**, **EDA**, and **Event-Driven Hexagonal**, understanding software architecture principles like **SOLID**, **DRY**, **KISS**, and others is crucial for designing maintainable, scalable, and efficient systems. These principles guide code organization, modularity, and system design, aligning with your concerns about team familiarity, modularity, and avoiding complex folder structure overhauls.

Below, I’ll provide concise **notes on key software architecture principles** (SOLID, DRY, KISS, and additional relevant principles like YAGNI, Separation of Concerns, and Law of Demeter), tailored to your context. Each principle will include:
- **Definition**: What the principle means.
- **Relevance**: How it applies to your applications and tech stack.
- **Example**: A practical example in FastAPI or Next.js.
- **Architecture Impact**: How it influences Monolithic, Microservices, or other architectures.

The notes are designed to be short, practical, and directly applicable to your asynchronous, multi-tenant applications, helping your team implement maintainable code without requiring advanced expertise in complex patterns like EDA.

---

## **Software Architecture Principles**

### **1. SOLID Principles**
SOLID is an acronym for five principles that promote object-oriented design, ensuring code is modular, maintainable, and extensible. These are critical for your modular applications, whether using a Monolith or Microservices.

#### **S - Single Responsibility Principle (SRP)**
- **Definition**: A class/module should have only one reason to change, meaning it should have a single responsibility.
- **Relevance**:
  - Ensures modules like HRMS or Libraries are focused, reducing complexity in FastAPI services or React components.
  - Supports multi-tenant isolation by keeping tenant-specific logic separate.
- **Example**:
  - In FastAPI, separate user authentication from profile management:
    ```python
    # user_service.py
    class UserService:
        async def register(self, user_data):
            # Only handles registration
            async with async_session() as db:
                user = User(**user_data.dict())
                db.add(user)
                await db.commit()
                return user

    # user_profile_service.py
    class UserProfileService:
        async def update_profile(self, user_id, profile_data):
            # Only handles profile updates
            async with async_session() as db:
                profile = await db.get(UserProfile, user_id)
                profile.update(profile_data)
                await db.commit()
                return profile
    ```
  - In React, a component for displaying employee data shouldn’t handle API calls:
    ```tsx
    // EmployeeList.tsx
    function EmployeeList({ employees }) {
        // Only renders employees
        return <div>{employees.map(emp => <div key={emp.id}>{emp.name}</div>)}</div>;
    }

    // EmployeeContainer.tsx
    function EmployeeContainer() {
        // Handles data fetching
        const [employees, setEmployees] = useState([]);
        useEffect(() => {
            fetchEmployees().then(setEmployees);
        }, []);
        return <EmployeeList employees={employees} />;
    }
    ```
- **Architecture Impact**:
  - **Monolith/Layered**: Encourages modular packages (e.g., `modules/hrms/`) with focused services.
  - **Microservices**: Each service (e.g., HRMS Service) has a single responsibility, reducing coupling.
  - **EDA/Hexagonal**: Domain core focuses on business logic, with adapters handling external concerns.

#### **O - Open/Closed Principle (OCP)**
- **Definition**: Classes/modules should be open for extension but closed for modification.
- **Relevance**:
  - Allows adding new features (e.g., new payroll rules, event types) without changing existing code.
  - Supports multi-tenant extensibility (e.g., tenant-specific configurations).
- **Example**:
  - In FastAPI, use dependency injection to extend functionality:
    ```python
    # payment_processor.py
    from abc import ABC, abstractmethod

    class PaymentProcessor(ABC):
        @abstractmethod
        async def process(self, amount: float):
            pass

    class SalaryProcessor(PaymentProcessor):
        async def process(self, amount: float):
            # Process salary payment
            return {"status": "processed", "amount": amount}

    class BonusProcessor(PaymentProcessor):
        async def process(self, amount: float):
            # Process bonus payment
            return {"status": "processed", "amount": amount * 1.1}

    # payroll_service.py
    class PayrollService:
        def __init__(self, processor: PaymentProcessor):
            self.processor = processor

        async def process_payroll(self, amount: float):
            return await self.processor.process(amount)
    ```
  - In Next.js, extend components with props or hooks:
    ```tsx
    // Button.tsx
    interface ButtonProps {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary';
    }

    function Button({ label, onClick, variant = 'primary' }) {
        return <button className={variant} onClick={onClick}>{label}</button>;
    }

    // Usage
    <Button label="Save" onClick={saveEmployee} variant="primary" />
    <Button label="Cancel" onClick={cancel} variant="secondary" />
    ```
- **Architecture Impact**:
  - **Monolith/Layered**: Use interfaces or abstract base classes to extend module behavior.
  - **Microservices**: New services can extend functionality without modifying existing ones.
  - **EDA/Hexagonal**: Ports define contracts, allowing new adapters to extend functionality.

#### **L - Liskov Substitution Principle (LSP)**
- **Definition**: Subclasses should be substitutable for their base classes without altering the program’s correctness.
- **Relevance**:
  - Ensures polymorphic behavior in module implementations (e.g., different event handlers).
  - Prevents unexpected behavior in multi-tenant logic.
- **Example**:
  - In FastAPI, ensure event handlers follow a common interface:
    ```python
    from abc import ABC, abstractmethod

    class EventHandler(ABC):
        @abstractmethod
        async def handle(self, event_data):
            pass

    class AttendanceEventHandler(EventHandler):
        async def handle(self, event_data):
            # Handle attendance event
            return {"type": "attendance", "data": event_data}

    class LibraryEventHandler(EventHandler):
        async def handle(self, event_data):
            # Handle library event
            return {"type": "library", "data": event_data}

    # events_service.py
    async def process_event(handler: EventHandler, event_data):
        return await handler.handle(event_data)
    ```
  - In React, use consistent props for interchangeable components:
    ```tsx
    interface CardProps {
        title: string;
        content: string;
    }

    function EmployeeCard({ title, content }: CardProps) {
        return <div><h2>{title}</h2><p>{content}</p></div>;
    }

    function BookCard({ title, content }: CardProps) {
        return <div><h2>{title}</h2><p>{content}</p></div>;
    }

    // Usage
    <EmployeeCard title="John Doe" content="Engineer" />
    <BookCard title="Python 101" content="Library Book" />
    ```
- **Architecture Impact**:
  - **Monolith/Layered**: Ensures module services are interchangeable.
  - **Microservices**: Services implementing common interfaces (e.g., event handlers) are substitutable.
  - **EDA/Hexagonal**: Ports ensure adapters can be swapped without breaking the core.

#### **I - Interface Segregation Principle (ISP)**
- **Definition**: Clients should not be forced to depend on interfaces they don’t use.
- **Relevance**:
  - Prevents bloated interfaces for modules like Chat or Pipeline.
  - Simplifies multi-tenant service implementations.
- **Example**:
  - In FastAPI, split interfaces for specific module needs:
    ```python
    from abc import ABC, abstractmethod

    class AuthRepository(ABC):
        @abstractmethod
        async def authenticate(self, credentials):
            pass

    class ProfileRepository(ABC):
        @abstractmethod
        async def get_profile(self, user_id):
            pass

    # user_service.py
    class UserService:
        def __init__(self, auth_repo: AuthRepository):
            self.auth_repo = auth_repo  # Only needs auth

    # user_profile_service.py
    class UserProfileService:
        def __init__(self, profile_repo: ProfileRepository):
            self.profile_repo = profile_repo  # Only needs profile
    ```
  - In React, avoid passing unused props:
    ```tsx
    interface UserFormProps {
        onSubmit: (data: { email: string }) => void;
    }

    interface ProfileFormProps {
        onUpdate: (data: { name: string }) => void;
    }

    function UserForm({ onSubmit }: UserFormProps) {
        return <form onSubmit={() => onSubmit({ email: "test@example.com" })}>...</form>;
    }

    function ProfileForm({ onUpdate }: ProfileFormProps) {
        return <form onSubmit={() => onUpdate({ name: "John" })}>...</form>;
    }
    ```
- **Architecture Impact**:
  - **Monolith/Layered**: Reduces module dependencies within the codebase.
  - **Microservices**: Services expose only necessary APIs, reducing bloat.
  - **EDA/Hexagonal**: Ports are specific to use cases, avoiding oversized interfaces.

#### **D - Dependency Inversion Principle (DIP)**
- **Definition**: High-level modules should not depend on low-level modules; both should depend on abstractions.
- **Relevance**:
  - Decouples business logic from infrastructure (e.g., database, Redis).
  - Simplifies testing and multi-tenant schema switching.
- **Example**:
  - In FastAPI, use dependency injection for repositories:
    ```python
    from abc import ABC, abstractmethod

    class UserRepository(ABC):
        @abstractmethod
        async def save(self, user):
            pass

    class SQLUserRepository(UserRepository):
        async def save(self, user):
            async with async_session() as db:
                db.add(user)
                await db.commit()

    # user_service.py
    class UserService:
        def __init__(self, repo: UserRepository):
            self.repo = repo

        async def create_user(self, user_data):
            user = User(**user_data.dict())
            await self.repo.save(user)
            return user
    ```
  - In React, use hooks to abstract data fetching:
    ```tsx
    // useUser.ts
    import { useState, useEffect } from 'react';

    export function useUser(userId: string) {
        const [user, setUser] = useState(null);
        useEffect(() => {
            fetchUser(userId).then(setUser);
        }, [userId]);
        return user;
    }

    // UserProfile.tsx
    function UserProfile({ userId }: { userId: string }) {
        const user = useUser(userId); // Depends on abstraction
        return <div>{user?.name}</div>;
    }
    ```
- **Architecture Impact**:
  - **Monolith/Layered**: Enables swapping database implementations.
  - **Microservices**: Services depend on abstract interfaces, not concrete implementations.
  - **EDA/Hexagonal**: Ports and adapters inherently follow DIP, decoupling core logic.

---

### **2. DRY (Don’t Repeat Yourself)**
- **Definition**: Avoid duplicating code or logic; reuse common functionality through abstraction.
- **Relevance**:
  - Reduces code duplication in common modules (User, User Profile) across App 1 and App 2.
  - Simplifies maintenance in multi-tenant systems by centralizing shared logic.
- **Example**:
  - In FastAPI, create a reusable tenant middleware:
    ```python
    # utils/tenant.py
    async def tenant_middleware(request: Request, call_next):
        tenant_id = request.headers.get("X-Tenant-ID", "default")
        request.state.tenant_schema = f"tenant_{tenant_id}"
        async with async_session() as db:
            await db.execute(f"SET search_path TO {request.state.tenant_schema}")
            response = await call_next(request)
        return response

    # user/routes.py and hrms/routes.py
    app.middleware("http")(tenant_middleware)  # Reused across modules
    ```
  - In Next.js, create a reusable API client:
    ```ts
    // services/api.ts
    import axios from 'axios';

    export const apiClient = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        headers: { 'X-Tenant-ID': 'tenant_1' },
    });

    // services/hrmsService.ts
    import { apiClient } from './api';
    export async function getEmployees() {
        return (await apiClient.get('/hrms/employees')).data;
    }

    // services/libraryService.ts
    import { apiClient } from './api';
    export async function getBooks() {
        return (await apiClient.get('/libraries/books')).data;
    }
    ```
- **Architecture Impact**:
  - **Monolith/Layered**: Centralizes utilities (e.g., `utils/`) for reuse across modules.
  - **Microservices**: Shared libraries or API Gateway middleware reduce duplication.
  - **EDA/Hexagonal**: Common adapters or event schemas are reused across services.

---

### **3. KISS (Keep It Simple, Stupid)**
- **Definition**: Keep designs and code as simple as possible, avoiding unnecessary complexity.
- **Relevance**:
  - Aligns with your team’s limited expertise in complex patterns like EDA or hexagonal architecture.
  - Ensures maintainable code for async, multi-tenant systems.
- **Example**:
  - In FastAPI, use straightforward async endpoints instead of complex event-driven flows:
    ```python
    # hrms/routes.py
    from fastapi import APIRouter, Depends
    from .services import HrmsService

    router = APIRouter()

    async def get_service():
        return HrmsService()

    @router.post("/employees")
    async def create_employee(employee: EmployeeCreate, service: HrmsService = Depends(get_service)):
        return await service.create_employee(employee)  # Simple, direct
    ```
  - In Next.js, avoid over-engineering state management:
    ```tsx
    // EmployeeList.tsx
    import { useState, useEffect } from 'react';
    import { getEmployees } from '@/services/hrmsService';

    export default function EmployeeList() {
        const [employees, setEmployees] = useState([]);
        useEffect(() => {
            getEmployees().then(setEmployees); // Simple fetch
        }, []);
        return <div>{employees.map(emp => <div key={emp.id}>{emp.name}</div>)}</div>;
    }
    ```
- **Architecture Impact**:
  - **Monolith/Layered**: Simplest to implement, ideal for quick development.
  - **Microservices**: Keeps services small and focused, avoiding over-complexity.
  - **EDA/Hexagonal**: Challenges KISS due to inherent complexity, so avoid unless necessary.

---

### **4. YAGNI (You Aren’t Gonna Need It)**
- **Definition**: Don’t add functionality or complexity until it’s actually needed.
- **Relevance**:
  - Prevents over-engineering (e.g., adopting Kafka prematurely for async tasks).
  - Focuses development on current needs (e.g., Chat, Events) in your multi-tenant apps.
- **Example**:
  - In FastAPI, avoid building a full event-driven system when Redis suffices:
    ```python
    # utils/redis.py
    from redis.asyncio import Redis

    async def queue_notification(message: str):
        redis = Redis.from_url("redis://redis:6379")
        await redis.lpush("notifications", message)  # Simple queue
        await redis.close()
    ```
  - In Next.js, don’t add complex state management (e.g., Redux) for simple apps:
    ```tsx
    // Chat.tsx
    import { useState } from 'react';

    export default function Chat() {
        const [messages, setMessages] = useState([]); // Simple state
        return <div>{messages.map(msg => <div>{msg}</div>)}</div>;
    }
    ```
- **Architecture Impact**:
  - **Monolith/Layered**: Encourages starting with a simple structure, adding complexity only as needed.
  - **Microservices**: Start with a few services (e.g., User, Chat), not all modules.
  - **EDA/Hexagonal**: Avoids premature adoption of Kafka or hexagonal patterns.

---

### **5. Separation of Concerns (SoC)**
- **Definition**: Divide a system into distinct sections, each addressing a specific concern (e.g., UI, business logic, data access).
- **Relevance**:
  - Aligns with your modular requirements, ensuring HRMS, Libraries, etc., are independent.
  - Supports multi-tenant isolation by separating tenant logic.
- **Example**:
  - In FastAPI, separate routes, services, and models:
    ```python
    # hrms/routes.py
    from fastapi import APIRouter
    from .services import HrmsService

    router = APIRouter()

    @router.post("/employees")
    async def create_employee(employee: EmployeeCreate, service: HrmsService = Depends()):
        return await service.create_employee(employee)

    # hrms/services.py
    class HrmsService:
        async def create_employee(self, employee_data):
            async with async_session() as db:
                employee = Employee(**employee_data.dict())
                db.add(employee)
                await db.commit()
                return employee

    # hrms/models.py
    from sqlalchemy import Column, Integer, String
    class Employee(Base):
        __tablename__ = "employees"
        id = Column(Integer, primary_key=True)
        name = Column(String)
    ```
  - In Next.js, separate UI and data fetching:
    ```tsx
    // EmployeeList.tsx
    function EmployeeList({ employees }) {
        return <div>{employees.map(emp => <div key={emp.id}>{emp.name}</div>)}</div>;
    }

    // EmployeeContainer.tsx
    function EmployeeContainer() {
        const [employees, setEmployees] = useState([]);
        useEffect(() => {
            getEmployees().then(setEmployees);
        }, []);
        return <EmployeeList employees={employees} />;
    }
    ```
- **Architecture Impact**:
  - **Monolith/Layered**: Layers (Presentation, Business, Data) enforce SoC.
  - **Microservices**: Each service handles a specific concern (e.g., HRMS vs. Chat).
  - **EDA/Hexagonal**: Core, ports, and adapters inherently separate concerns.

---

### **6. Law of Demeter (LoD)**
- **Definition**: A module should only communicate with its immediate dependencies, not their internal components (“Don’t talk to strangers”).
- **Relevance**:
  - Reduces coupling in async, multi-tenant systems.
  - Simplifies debugging and maintenance in FastAPI services or React components.
- **Example**:
  - In FastAPI, services shouldn’t access repository internals:
    ```python
    # user_service.py
    class UserService:
        def __init__(self, repo: UserRepository):
            self.repo = repo

        async def get_user(self, user_id):
            return await self.repo.get(user_id)  # Doesn't access repo's DB session

    # user_repository.py
    class UserRepository:
        async def get(self, user_id):
            async with async_session() as db:
                return await db.get(User, user_id)
    ```
  - In React, components shouldn’t access nested props directly:
    ```tsx
    // UserProfile.tsx
    function UserProfile({ user }) {
        return <div>{user.name}</div>; // Not user.profile.name
    }

    // App.tsx
    function App() {
        const user = { name: "John", profile: { details: "..." } };
        return <UserProfile user={user} />;
    }
    ```
- **Architecture Impact**:
  - **Monolith/Layered**: Reduces module interdependencies within the codebase.
  - **Microservices**: Services communicate via APIs, not internal structures.
  - **EDA/Hexagonal**: Adapters shield the core from external system details.

---

## **Applying Principles to Your Context**
- **Multi-Tenancy**:
  - **SRP, SoC**: Isolate tenant logic in middleware or dedicated services.
  - **DRY**: Reuse tenant identification logic across modules or services.
  - **KISS, YAGNI**: Use simple schema-based multi-tenancy instead of complex tenant isolation strategies.
- **Asynchronous Processing**:
  - **SOLID, SoC**: Separate async tasks (e.g., Redis queues, WebSockets) from synchronous logic.
  - **KISS, YAGNI**: Use Redis for async tasks instead of Kafka unless event-driven workflows are critical.
  - **DRY**: Centralize async utilities (e.g., Redis client) for reuse.
- **Team Familiarity**:
  - **KISS, YAGNI**: Favor simpler architectures (e.g., Microservices over EDA) to reduce learning curves.
  - **SOLID, DRY**: Promote reusable, modular code to ease maintenance for less experienced developers.
- **Modularity**:
  - **SRP, SoC, ISP**: Ensure modules (e.g., HRMS, Libraries) are independent and focused.
  - **DRY, LoD**: Minimize duplication and coupling between modules or services.

---

## **Architecture-Specific Guidance**
- **Monolith/Layered (Recommended Earlier)**:
  - **SOLID**: Use layered structure (Presentation, Business, Data) to enforce SRP and SoC.
  - **DRY, KISS**: Centralize utilities and keep module logic simple.
  - **YAGNI**: Avoid premature microservices or event-driven features.
- **Microservices (Your Recent Preference)**:
  - **SOLID, SoC**: Each service has a single responsibility, communicating via APIs.
  - **DRY**: Share common utilities (e.g., tenant middleware) via a library or API Gateway.
  - **KISS, LoD**: Keep services small and limit inter-service dependencies.
- **EDA/Hexagonal (Considered but Complex)**:
  - **SOLID, SoC**: Hexagonal structure enforces separation of concerns.
  - **DRY**: Reuse event schemas and adapters.
  - **YAGNI, KISS**: Avoid unless async event-driven workflows are critical, given team expertise.

---

## **Conclusion**
The principles **SOLID**, **DRY**, **KISS**, **YAGNI**, **Separation of Concerns**, and **Law of Demeter** provide a foundation for designing your applications. They ensure **modularity** (e.g., isolated HRMS, Libraries modules), **asynchronous compatibility** (e.g., FastAPI async, Redis), **multi-tenant support** (e.g., tenant schemas), and **maintainability** for your team. **Microservices Architecture**, your recent preference, benefits from these principles by keeping services focused (SRP), reusable (DRY), simple (KISS), and loosely coupled (LoD, SoC). Start with **SOLID** and **KISS** to guide your FastAPI services and Next.js components, using **DRY** to avoid duplication in tenant logic and **YAGNI** to prevent over-engineering.

If you need:
- **Code examples** for a specific principle (e.g., DIP in FastAPI, DRY in Next.js).
- **Diagrams** illustrating these principles in your architecture (I can provide prompts or ASCII art).
- **Guidance** on applying principles to a specific module (e.g., Chat, Events).
- **Further notes** on other principles (e.g., GRASP, CAP theorem), let me know!

What would you like to explore next?
