---
title: ASCII Diagrams
description: Placeholder content for ASCII Diagrams.
order: 8
---

# ASCII Diagrams

Since you’ve asked for **ASCII art** or **canvas panel diagrams** to complement the **MkDocs documentation** for your two applications (App 1: Business System, App 2: School ERP) and the discussed architectures (**Monolithic**, **Layered**, **Microservices**, **SOA**, **EDA**, **Event-Driven Hexagonal**) and software principles (**SOLID**, **DRY**, **KISS**, **YAGNI**, **SoC**, **LoD**), I’ll provide **ASCII art** representations for each architecture and principle to enhance the Markdown files in your `docs/` directory. These will serve as lightweight, text-based visual aids that can be directly embedded in the MkDocs documentation, complementing the **AI-generated image prompts** and detailed explanations already provided. Given the complexity of canvas panel diagrams (limited to simple shapes and requiring user confirmation for visualization), ASCII art is more practical for immediate inclusion in Markdown files, as it’s universally compatible and aligns with the text-based nature of MkDocs.

Below, I’ll:
1. Provide **ASCII art** for each architecture and principle, tailored to your applications’ context (**React**, **Next.js**, **TypeScript**, **Python**, **FastAPI**, **async**, **PostgreSQL**, **multi-tenant**).
2. Suggest how to embed these in the corresponding Markdown files from the `mkdocs.yml` structure.
3. Update the relevant Markdown files with instructions to include the ASCII art.
4. Explain why ASCII art is preferred over canvas panel diagrams in this case and offer further assistance if you prefer canvas panel sketches.

The ASCII art will be simple, focusing on key components (e.g., Frontend, Backend, PostgreSQL, Redis, Kafka) and interactions (e.g., HTTP, WebSocket, SQL), with labels to reflect **multi-tenancy** and **async** features. Each diagram will be concise to fit within Markdown files without overwhelming the reader.

---

## **Why ASCII Art Over Canvas Panel Diagrams?**
- **Compatibility**: ASCII art can be directly embedded in Markdown files and rendered in MkDocs, GitHub, or any text viewer, requiring no external tools or rendering.
- **Simplicity**: It’s lightweight and aligns with the text-based nature of MkDocs, avoiding the need for image hosting or generation.
- **Maintainability**: Easy to edit within Markdown files, unlike canvas panel diagrams, which are limited to basic shapes and require a separate visualization step.
- **Context**: Your request for AI-generated images is already addressed with detailed prompts, and ASCII art complements these as a quick, in-line visual aid.
- **Canvas Panel Limitations**: The canvas panel is better suited for interactive or dynamic visualizations, but it’s less practical for static documentation due to its simplicity and need for user confirmation.

If you later prefer canvas panel diagrams, I can open a canvas panel to sketch one or more architectures, but ASCII art is more immediate for your current needs.

---

## **ASCII Art for Architectures and Principles**

Below are the **ASCII art diagrams** for each architecture and principle, followed by instructions to embed them in the corresponding Markdown files from your `docs/` directory. Each diagram uses text characters to represent components, connections, and interactions, with labels for clarity. I’ve kept them compact to fit within Markdown files while capturing essential elements like **Frontend**, **Backend/Services**, **PostgreSQL (with tenant schemas)**, **Redis/Kafka**, and **async connections** (HTTP, WebSocket, events).

### **1. Architectures**

#### **Monolithic Architecture (docs/architectures/monolithic.md)**
**ASCII Art**:
```
+-----------------+
| App 1 Frontend  |
| (Next.js)       |
+-----------------+
    | HTTP
    | WebSocket
    v
+-----------------+
| App 1 Backend   |
| (FastAPI)       |
| [User|HRMS|Chat]|
+-----------------+
    | SQL
    v
+-----------------+
| PostgreSQL      |
| [tenant_1|ten_2]|
+-----------------+
    | Queue
    v
+[Redis]+
```
**Description**:
- Single backend box with modules, emphasizing monolithic structure.
- Arrows show async HTTP/WebSocket from Frontend and SQL to tenant schemas.
- Redis for lightweight async tasks.

#### **Layered Architecture (docs/architectures/layered.md)**
**ASCII Art**:
```
+-----------------+
| App 2 Frontend  |
| (Next.js)       |
+-----------------+
    | HTTP
    | WebSocket
    v
+-----------------+
| App 2 Backend   |
| [Presentation]  |
| [User|Lib|Events]|
| [Business]      |
| [Data]          |
+-----------------+
    | SQL
    v
+-----------------+
| PostgreSQL      |
| [tenant_1|ten_2]|
+-----------------+
    | Queue
    v
+[Redis]+
```
**Description**:
- Backend divided into layers (Presentation, Business, Data).
- Modules (User, Libraries, Events) shown in layers.
- WebSocket for Events, Redis for async tasks.

#### **Microservices Architecture (docs/architectures/microservices.md)**
**ASCII Art**:
```
+-----------------+
| App 1 Frontend  |
| (Next.js)       |
+-----------------+
    | HTTP
    | WebSocket
    v
+[API Gateway]+
    |      |      |
    v      v      v
+-----+ +-----+ +-----+
|User | |HRMS | |Chat |
|Serv | |Serv | |Serv |
+-----+ +-----+ +-----+
    |      |      | SQL
    v      v      v
+-----------------+
| PostgreSQL      |
| [ten_1_user|...]
+-----------------+
    | Queue
    v
+[Redis]+
```
**Description**:
- Multiple service boxes connected via API Gateway.
- Each service links to its tenant schema in PostgreSQL.
- WebSocket to Chat Service, Redis for async tasks.

#### **Service-Oriented Architecture (SOA) (docs/architectures/soa.md)**
**ASCII Art**:
```
+-----------------+
| App 2 Frontend  |
| (Next.js)       |
+-----------------+
    | HTTP
    | WebSocket
    v
+[ESB]-----------+
    |      |      |
    v      v      v
+-----+ +-----+ +-----+
|User | |Lib  | |Event|
|Serv | |Serv | |Serv |
+-----+ +-----+ +-----+
    |      |      | SQL
    v      v      v
+-----------------+
| PostgreSQL      |
| [ten_1_lib|...]|
+-----------------+
    | Queue
    v
+[Redis]+
```
**Description**:
- ESB as central hub, connecting coarse-grained services.
- WebSocket to Events Service, tenant schemas in PostgreSQL.

#### **Event-Driven Architecture (EDA) (docs/architectures/eda.md)**
**ASCII Art**:
```
+-----------------+
| App 1 Frontend  |
| (Next.js)       |
+-----------------+
    | HTTP
    | WebSocket
    v
+[API Gateway]+
    |      |      |
    v      v      v
+-----+ +-----+ +-----+
|User | |HRMS | |Chat |
|Serv | |Serv | |Serv |
+-----+ +-----+ +-----+
    |      |      | Events
    v      v      v
+[Kafka: users|hrms]+
    | SQL
    v
+-----------------+
| PostgreSQL      |
| [ten_1_user|...]
+-----------------+
```
**Description**:
- Kafka as central event hub, with topics for modules.
- Services publish/consume events, connect to tenant schemas.

#### **Event-Driven Hexagonal Architecture (docs/architectures/event-driven-hexagonal.md)**
**ASCII Art**:
```
+-----------------+
| App 2 Frontend  |
| (Next.js)       |
+-----------------+
    | HTTP
    | WebSocket
    v
+[API Gateway]+
    |      |      |
    v      v      v
+-----+ +-----+ +-----+
|User | |Lib  | |Event|
|[C|P|A]|Serv | |Serv |
+-----+ +-----+ +-----+
    |      |      | Events
    v      v      v
+[Kafka: lib|events]+
    | SQL
    v
+-----------------+
| PostgreSQL      |
| [ten_1_lib|...]|
+-----------------+
```
**Description**:
- Hexagonal services with Core (C), Ports (P), Adapters (A).
- Kafka for events, tenant schemas in PostgreSQL.

---

### **2. Software Principles**

#### **SOLID Principles (docs/principles/solid.md)**
**ASCII Art**:
```
+-----------------+
| SOLID           |
| S: Single Resp  |
| O: Open/Closed  |
| L: Liskov Subst |
| I: Interface Seg|
| D: Dep Inversion|
+-----------------+
    | Applied to
    v
+[FastAPI Service]+
    |      |
    v      v
+[Repo] [Routes]---+
    | SQL          |
    v              |
+[PostgreSQL]      |
                   v
+[Next.js Component]+
```
**Description**:
- SOLID principles as a box, applied to FastAPI services and Next.js components.
- Shows repository, routes, and PostgreSQL interactions.

#### **DRY (docs/principles/dry.md)**
**ASCII Art**:
```
+[Utils: tenant_middleware]+
    |      |
    v      v
+[User Service] [HRMS Service]+
    |      |
    v      v
+[PostgreSQL: ten_1|ten_2]+
    | Applied to
    v
+[Next.js: apiClient]+
```
**Description**:
- Centralized `tenant_middleware` reused across services.
- `apiClient` reused in Next.js, showing code reuse.

#### **KISS (docs/principles/kiss.md)**
**ASCII Art**:
```
+[Simple Route]-------+
| @router.post(...)   |
| async create(...)   |
+---------------------+ HTTP
    |                    v
    v               [Frontend]
+[PostgreSQL]
```
**Description**:
- Simple FastAPI route and PostgreSQL, emphasizing minimal complexity.
- Direct HTTP to Frontend.

#### **YAGNI (docs/principles/yagni.md)**
**ASCII Art**:
```
+[Redis Queue]-------+
| Simple Async Task  |
| queue_notification |
+--------------------+ Queue
    |                   v
    v               [Service]
+[PostgreSQL]
```
**Description**:
- Redis for simple async tasks, avoiding complex Kafka.
- Service connects to PostgreSQL.

#### **Separation of Concerns (SoC) (docs/principles/soc.md)**
**ASCII Art**:
```
+[Routes]-----[Services]-----[Models]+
| @router     | HrmsService  | Employee |
| async       | async create | SQLAlchemy|
+------------+--------------+---------+
    | HTTP          | SQL
    v               v
[Frontend]    [PostgreSQL]
```
**Description**:
- Routes, Services, Models separated in FastAPI.
- HTTP to Frontend, SQL to PostgreSQL.

#### **Law of Demeter (LoD) (docs/principles/lod.md)**
**ASCII Art**:
```
+[UserService]-----[UserRepo]+
| get_user()       | get()    |
| repo.get()       | SQL      |
+-------------------+---------+
    | HTTP              | SQL
    v                   v
[Frontend]        [PostgreSQL]
```
**Description**:
- UserService only calls UserRepo’s methods, not its internals.
- HTTP to Frontend, SQL to PostgreSQL.

---

## **Embedding ASCII Art in Markdown Files**

To include the ASCII art in the MkDocs documentation, add each diagram to its respective Markdown file within a **code block** using triple backticks (```) with the `text` language identifier. This ensures proper rendering in the Material theme. Below, I’ll show how to update key files with the ASCII art, assuming you’re editing the files from the previous `mkdocs.yml` structure.

### **Example Updates to Markdown Files**

#### **docs/architectures/monolithic.md**
**Updated Content**:
```markdown
# Monolithic Architecture

## Description
A single codebase for all modules, deployed as one unit.

## Diagram
```text
+-----------------+
| App 1 Frontend  |
| (Next.js)       |
+-----------------+
    | HTTP
    | WebSocket
    v
+-----------------+
| App 1 Backend   |
| (FastAPI)       |
| [User|HRMS|Chat]|
+-----------------+
    | SQL
    v
+-----------------+
| PostgreSQL      |
| [tenant_1|ten_2]|
+-----------------+
    | Queue
    v
+[Redis]+
```

## Pros
- Simple to develop and deploy.
- Shared PostgreSQL schemas for multi-tenancy.

## Cons
- Poor scalability (entire app scales together).
- Tight coupling complicates async workflows.

## Fit
Poor. Limited scalability and async support for Chat and Events.

## Example
```python
# main.py
from fastapi import FastAPI
app = FastAPI()
app.include_router(user_router, prefix="/user")
app.include_router(hrms_router, prefix="/hrms")
```
```

#### **docs/principles/solid.md**
**Updated Content**:
```markdown
# SOLID Principles

## Diagram
```text
+-----------------+
| SOLID           |
| S: Single Resp  |
| O: Open/Closed  |
| L: Liskov Subst |
| I: Interface Seg|
| D: Dep Inversion|
+-----------------+
    | Applied to
    v
+[FastAPI Service]+
    |      |
    v      v
+[Repo] [Routes]---+
    | SQL          |
    v              |
+[PostgreSQL]      |
                   v
+[Next.js Component]+
```

## Single Responsibility Principle (SRP)
- **Definition**: A class/module has one responsibility.
- **Example**:
```python
# user_service.py
class UserService:
    async def register(self, user_data):
        async with async_session() as db:
            user = User(**user_data.dict())
            db.add(user)
            await db.commit()
```

## Open/Closed Principle (OCP)
...

## Liskov Substitution Principle (LSP)
...

## Interface Segregation Principle (ISP)
...

## Dependency Inversion Principle (DIP)
...
```

**Similar Updates**:
- Apply the same pattern to other architecture files (`layered.md`, `microservices.md`, etc.) and principle files (`dry.md`, `kiss.md`, etc.) by adding the ASCII art under a `## Diagram` section after the `# Heading`.
- Ensure the code block uses ```text to maintain alignment in MkDocs’ Material theme.

---

## **Instructions to Embed All ASCII Art**
1. **Edit Markdown Files**:
   - Open each file in `docs/` (e.g., `docs/architectures/monolithic.md`, `docs/principles/solid.md`).
   - Add a `## Diagram` section near the top, just below the `# Heading` or `## Description`.
   - Paste the corresponding ASCII art within a ```text code block.
2. **Preview Changes**:
   - Run `mkdocs serve` and check `http://localhost:8000` to ensure the diagrams render correctly.
   - The Material theme preserves ASCII art alignment with a monospaced font.
3. **Commit to Version Control**:
   - Add the updated files to your Git repository for team access.
   - Example: `git add docs/ && git commit -m "Added ASCII art diagrams"`.
4. **Optional Enhancements**:
   - Adjust ASCII art size if needed (e.g., reduce module labels like `ten_2` to `t2` for compactness).
   - Add notes below diagrams to explain key elements (e.g., “WebSocket for Chat real-time features”).

---

## **Sample Full File Example**
To illustrate, here’s the complete updated `docs/architectures/microservices.md` with ASCII art:

```markdown
# Microservices Architecture

## Description
Each module (e.g., HRMS, Libraries) is a separate FastAPI service with its own PostgreSQL schema.

## Diagram
```text
+-----------------+
| App 1 Frontend  |
| (Next.js)       |
+-----------------+
    | HTTP
    | WebSocket
    v
+[API Gateway]+
    |      |      |
    v      v      v
+-----+ +-----+ +-----+
|User | |HRMS | |Chat |
|Serv | |Serv | |Serv |
+-----+ +-----+ +-----+
    |      |      | SQL
    v      v      v
+-----------------+
| PostgreSQL      |
| [ten_1_user|...]
+-----------------+
    | Queue
    v
+[Redis]+
```

## Pros
- Independent scaling (e.g., Chat, Events).
- Supports async APIs and WebSockets.
- Clear module boundaries.

## Cons
- Increased complexity in managing services.
- Requires distributed systems knowledge.

## Fit
Good. Scalable and modular, simpler than EDA.

## Example
```python
# hrms_service/main.py
from fastapi import FastAPI
app = FastAPI(title="HRMS Service")
app.include_router(employee_router, prefix="/employees")
```
```

---

## **Additional Notes**
- **Integration with AI Images**: Once you generate AI images using the prompts from `docs/image-prompts.md`, you can reference them in the Markdown files (e.g., `![Microservices Diagram](images/microservices.png)`), but ASCII art provides an immediate, text-based alternative.
- **Scalability**: ASCII art is lightweight and won’t increase the MkDocs site’s build time, unlike images.
- **Team Accessibility**: The diagrams are viewable in any text editor or browser, making them ideal for quick reference during development.
- **Customization**: If you want more detailed ASCII art (e.g., showing specific tenant schemas or WebSocket flows), I can refine the diagrams.

---

## **If You Prefer Canvas Panel Diagrams**
If you’d rather have **canvas panel diagrams** instead of or in addition to ASCII art:
- I can open a canvas panel to sketch one or more architectures (e.g., Microservices) using basic shapes (boxes, arrows, labels).
- These would be described as text-based instructions (e.g., “Draw a box labeled ‘App 1 Frontend’ connected to ‘API Gateway’ with an arrow labeled ‘HTTP’”).
- Limitations: Canvas panel is less precise than ASCII art for static documentation and requires manual conversion to images or code for MkDocs.
- Please confirm if you want this, and specify which architecture(s) to sketch.

---

## **Questions**
- Do you want me to provide a script to automate adding the ASCII art to all Markdown files?
- Would you like refined ASCII art (e.g., more compact or detailed for specific modules like Chat)?
- Should I proceed with canvas panel sketches for any architecture or principle? If so, which ones?
- Do you need help with MkDocs setup (e.g., installing dependencies, running `mkdocs serve`)?
- Are there additional diagrams or sections to include in the documentation?

Let me know your preferences, and I’ll assist further!