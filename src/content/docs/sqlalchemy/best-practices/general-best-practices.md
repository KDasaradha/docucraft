---
title: General SQLAlchemy Best Practices
---

# General SQLAlchemy Best Practices

**Original Description**: Best practices for efficient and secure SQLAlchemy usage in FastAPI applications.

Using SQLAlchemy effectively involves understanding its core concepts, managing sessions appropriately, writing efficient queries, and being mindful of security.

## What are the best practices for managing database sessions in a FastAPI application?

Proper session management is critical for reliability and performance in a FastAPI (or any web) application using SQLAlchemy.

1.  **Session-per-Request Pattern**:
    *   **Practice**: Create a new SQLAlchemy `Session` for each incoming API request. This session is used for all database operations within that request's lifecycle.
    *   **Rationale**: Isolates the unit of work for each request, preventing interference between concurrent requests. Simplifies transaction management and error handling for a single request.
    *   **Implementation**: Use FastAPI's dependency injection system. Create a dependency (e.g., `get_db`) that `yields` a session and ensures it's closed in a `finally` block.
        ```python
        # database.py
        from sqlalchemy.orm import Session
        from .main_db_setup import SessionLocal # Your configured sessionmaker

        def get_db():
            db = SessionLocal()
            try:
                yield db
            finally:
                db.close()
        
        # main.py (FastAPI endpoint)
        # from fastapi import Depends
        # @app.get("/items/")
        # def read_items(db: Session = Depends(get_db)):
        #     # Use db session
        #     pass
        ```

2.  **Explicit Transaction Management**:
    *   **Practice**: While the session-per-request often implies a transaction per request, be explicit about when you `commit()` or `rollback()`.
    *   **Rationale**: Clearly defines the boundaries of your atomic operations.
    *   **Implementation**:
        *   Commit after all operations for a request are successful.
        *   Rollback if any operation within the request fails (often handled by a custom exception handler or the `try...except` block in the session dependency).
        ```python
        # In an endpoint or CRUD function
        # try:
        #     # ... multiple db operations ...
        #     db.commit()
        # except Exception:
        #     db.rollback()
        #     raise
        ```
        The `get_db` dependency with `try...finally` typically handles closing, but commits/rollbacks are often application-logic specific or managed in a higher-level part of the dependency if all requests should be transactional.

3.  **Close Sessions Promptly**:
    *   **Practice**: Ensure sessions are closed after each request, whether it succeeds or fails.
    *   **Rationale**: Releases database connections back to the pool, preventing connection exhaustion under load.
    *   **Implementation**: The `finally: db.close()` in the `get_db` dependency handles this.

4.  **Use `autocommit=False`, `autoflush=False`**:
    *   **Practice**: When creating your `sessionmaker` (e.g., `SessionLocal`), set `autocommit=False` and `autoflush=False`.
    *   **Rationale**:
        *   `autocommit=False`: Gives you explicit control over transaction boundaries. You decide when to call `db.commit()`.
        *   `autoflush=False`: Prevents the session from automatically issuing SQL to the database before `commit()`. This can be useful to batch operations or avoid unnecessary database chatter. You can call `db.flush()` manually if needed (e.g., to get a database-generated ID before committing).
    *   **Implementation**:
        ```python
        # SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        ```

5.  **Scoped Sessions (Less common with FastAPI's dependency injection)**:
    *   SQLAlchemy provides `scoped_session` for managing sessions in more traditional multi-threaded environments where passing sessions explicitly might be cumbersome.
    *   With FastAPI's dependency injection, the per-request session provided by `Depends(get_db)` is generally cleaner and more explicit.

6.  **Async Sessions (`AsyncSession`)**:
    *   **Practice**: If using async database drivers (like `asyncpg`) and `async def` endpoints for database operations, use SQLAlchemy's `AsyncSession` and an async session dependency.
    *   **Rationale**: Ensures non-blocking database operations.
    *   **Implementation**:
        ```python
        # from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
        # async_engine = create_async_engine(...)
        # AsyncSessionLocal = sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)

        # async def get_async_db():
        #     async with AsyncSessionLocal() as session:
        #         try:
        #             yield session
        #             await session.commit() # Commit successful requests (optional, can be in endpoint)
        #         except Exception:
        #             await session.rollback()
        #             raise
        #         # Session is automatically closed by `async with`
        ```

## How can you prevent SQL injection when using SQLAlchemy?

SQLAlchemy, when used correctly, provides strong protection against SQL injection vulnerabilities, primarily through **parameter binding**.

1.  **Use SQLAlchemy's Expression Language (Core) or ORM**:
    *   **Practice**: Construct queries using SQLAlchemy's objects and methods rather than manually concatenating SQL strings with user input.
    *   **Rationale**: SQLAlchemy automatically handles parameterization. When you do `filter(User.name == user_supplied_name)`, SQLAlchemy generates SQL like `WHERE users.name = ?` (or `$1`, `%s` depending on DB dialect) and passes `user_supplied_name` as a separate parameter to the database driver. The driver then safely incorporates the value, treating it as data, not executable SQL code.
    *   **Example (ORM)**:
        ```python
        # SAFE: uses parameter binding
        user_input = "Robert'; DROP TABLE students; --" # Malicious input
        user = session.query(User).filter(User.name == user_input).first()

        # UNSAFE: manual string concatenation (DO NOT DO THIS)
        # raw_sql = f"SELECT * FROM users WHERE name = '{user_input}'" 
        # result = session.execute(text(raw_sql)) 
        ```

2.  **Use the `text()` Construct with Bound Parameters for Raw SQL**:
    *   **Practice**: If you absolutely must use raw SQL snippets (e.g., for complex database-specific functions), use `sqlalchemy.text()` and bind parameters using the `:param_name` syntax.
    *   **Rationale**: This ensures that even within raw SQL, user-supplied values are treated as data.
    *   **Example**:
        ```python
        from sqlalchemy import text
        user_input = "Alice"
        # SAFE:
        stmt = text("SELECT * FROM users WHERE username = :name_param AND status = :status_param")
        results = session.execute(stmt, {"name_param": user_input, "status_param": "active"}).fetchall()

        # UNSAFE:
        # stmt_unsafe = text(f"SELECT * FROM users WHERE username = '{user_input}'") 
        ```

3.  **Avoid Using `literal_column()` with User Input**:
    *   `literal_column()` is used to embed a Python string directly into the SQL query *as is*, without parameter binding. This is dangerous if the string comes from untrusted user input. Only use it for truly literal, static values.

4.  **Be Cautious with `order_by()` on User Input**:
    *   If you allow users to specify column names for ordering, validate the input against a list of allowed column names to prevent injection of arbitrary SQL into the `ORDER BY` clause.
    *   **Example**:
        ```python
        allowed_sort_columns = {"username": User.username, "email": User.email}
        sort_by_param = request.query_params.get("sort_by", "username")
        sort_direction_param = request.query_params.get("direction", "asc")

        if sort_by_param not in allowed_sort_columns:
            raise HTTPException(status_code=400, detail="Invalid sort column")
        
        sort_column = allowed_sort_columns[sort_by_param]
        
        if sort_direction_param == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        ```

5.  **Database Permissions**:
    *   Follow the principle of least privilege for your database user. The application's database user should only have the permissions it absolutely needs (e.g., SELECT, INSERT, UPDATE, DELETE on specific tables, but not DROP TABLE or administrative privileges).

By adhering to these practices, especially by consistently using SQLAlchemy's expression language and ORM features for query construction, you largely mitigate the risk of SQL injection.

## Explain how to use SQLAlchemy’s `relationship()` for handling foreign keys.

SQLAlchemy's `relationship()` function is a cornerstone of the ORM. It defines how mapped classes (and thus their corresponding database tables) are related to each other. It typically works in conjunction with `ForeignKey` constraints defined in your table schema.

`relationship()` doesn't create foreign key constraints in the database; `ForeignKey` does that. Instead, `relationship()` tells SQLAlchemy how to:
1.  Load related objects (e.g., load all posts for a given user).
2.  Persist changes across related objects (e.g., when adding a post to a user's `posts` collection, SQLAlchemy can automatically set the `post.author_id`).
3.  Navigate between objects in Python code (e.g., `user.posts` or `post.author`).

**Common Relationship Patterns:**

1.  **One-to-Many / Many-to-One (Most Common)**:
    *   One "parent" record can be related to many "child" records.
    *   The "many" side (child table) typically holds the foreign key referencing the "one" side (parent table).

    ```python
    from sqlalchemy import Column, Integer, String, ForeignKey
    from sqlalchemy.orm import relationship, declarative_base

    Base = declarative_base()

    class User(Base):
        __tablename__ = "users"
        id = Column(Integer, primary_key=True)
        username = Column(String)
        # 'posts' collection on User (one-to-many)
        # SQLAlchemy will look for a ForeignKey in the Post model pointing back to User.
        posts = relationship("Post", back_populates="author") 
                                    # "Post" is the string name of the related class
                                    # back_populates="author" links this to the 'author' relationship on Post

    class Post(Base):
        __tablename__ = "posts"
        id = Column(Integer, primary_key=True)
        title = Column(String)
        author_id = Column(Integer, ForeignKey("users.id")) # ForeignKey constraint
        # 'author' attribute on Post (many-to-one)
        author = relationship("User", back_populates="posts")
                                    # "User" is the string name of the related class
                                    # back_populates="posts" links this to the 'posts' relationship on User
    ```
    *   **`User.posts`**: An attribute on a `User` instance that will hold a list of related `Post` objects.
    *   **`Post.author`**: An attribute on a `Post` instance that will hold the related `User` object.
    *   **`back_populates`**: This is crucial for **bidirectional relationships**. It tells SQLAlchemy that `User.posts` and `Post.author` are two sides of the same relationship. When you append a `Post` to `user.posts`, `post.author` will be automatically set to that `user` (and vice-versa, depending on how you modify the relationship).

2.  **Many-to-Many**:
    *   Requires an **association table** (also called a join table or link table) that holds foreign keys to both related tables.
    ```python
    from sqlalchemy import Table, Column, Integer, String, ForeignKey
    from sqlalchemy.orm import relationship, declarative_base

    Base = declarative_base()

    # Association table for Post <-> Tag many-to-many relationship
    post_tags_table = Table('post_tags', Base.metadata,
        Column('post_id', Integer, ForeignKey('posts_many.id'), primary_key=True),
        Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
    )

    class PostMany(Base): # Renamed to avoid conflict with previous Post
        __tablename__ = 'posts_many'
        id = Column(Integer, primary_key=True)
        title = Column(String)
        tags = relationship(
            "Tag",
            secondary=post_tags_table, # Specifies the association table
            back_populates="posts"
        )

    class Tag(Base):
        __tablename__ = 'tags'
        id = Column(Integer, primary_key=True)
        name = Column(String, unique=True)
        posts = relationship(
            "PostMany",
            secondary=post_tags_table,
            back_populates="tags"
        )
    ```
    *   **`secondary=post_tags_table`**: This tells `relationship()` to use the `post_tags_table` to manage the many-to-many link.

3.  **One-to-One**:
    *   Can be implemented as a one-to-many relationship where the "many" side is constrained to have at most one record related to the parent.
    *   Use `uselist=False` on the "one" side's `relationship()` to indicate it holds a scalar attribute (a single object) rather than a list.
    ```python
    class UserProfile(Base):
        __tablename__ = 'user_profiles'
        id = Column(Integer, ForeignKey('users_one.id'), primary_key=True) # FK to User
        bio = Column(String)
        user = relationship("UserOne", back_populates="profile", uselist=False)

    class UserOne(Base): # Renamed to avoid conflict
        __tablename__ = 'users_one'
        id = Column(Integer, primary_key=True)
        username = Column(String)
        # Ensure profile.user_id is unique for a true one-to-one via DB constraint
        profile = relationship("UserProfile", back_populates="user", uselist=False, 
                               cascade="all, delete-orphan") 
    ```
    *   `uselist=False` on both sides indicates a scalar relationship.
    *   A `UNIQUE` constraint on `UserProfile.id` (which is also the foreign key) is often used at the database level to enforce the one-to-one nature.

**Key Parameters for `relationship()`:**

*   **`argument`**: The class name (often as a string for forward references) or mapped class itself.
*   **`back_populates`**: Name of the corresponding relationship attribute on the other class for bidirectional linking.
*   **`secondary`**: For many-to-many, specifies the association table.
*   **`primaryjoin` / `secondaryjoin`**: For complex join conditions not automatically inferred from foreign keys.
*   **`lazy`**: Controls how related objects are loaded (e.g., `"select"` (default lazy), `"joined"` (joinedload), `"selectin"` (selectinload), `"dynamic"` (returns a Query object), `False` or `"noload"` (disables loading unless explicitly set via options), `"raise"` (raises an error if accessed without eager loading)).
*   **`cascade`**: Defines how operations (like delete, save-update) on a parent object should cascade to related child objects (e.g., `"all, delete-orphan"`).
*   **`uselist`**: Set to `False` for one-to-one or many-to-one relationships to indicate the attribute holds a single related object, not a list.

`relationship()` is a powerful tool that allows SQLAlchemy to manage the complexities of relational data, providing an intuitive object-oriented interface for developers.

## What are the differences between declarative, imperative, and hybrid table creation methods in SQLAlchemy?

These terms relate to how you define your database schema (tables and their mappings to Python classes) in SQLAlchemy, particularly with the ORM.

1.  **Declarative Mapping (Most Common)**:
    *   **Concept**: You define Python classes that inherit from a base class (created by `declarative_base()`). SQLAlchemy introspects these classes, their `__tablename__` attribute, and `Column` attributes to automatically generate the `Table` metadata and the mapping between the class and the table.
    *   **Characteristics**:
        *   Combines table definition and class mapping in one place.
        *   Pythonic and often considered more readable for ORM usage.
        *   The `Table` object is created implicitly by SQLAlchemy.
    *   **Example**:
        ```python
        from sqlalchemy import Column, Integer, String
        from sqlalchemy.orm import declarative_base

        Base = declarative_base()

        class User(Base):
            __tablename__ = 'users'
            id = Column(Integer, primary_key=True)
            name = Column(String)
            # Table metadata and mapping are inferred from this class definition.
        ```

2.  **Imperative Mapping (Classical or Explicit Mapping)**:
    *   **Concept**: You first define your database tables explicitly using SQLAlchemy Core's `Table` construct. Then, separately, you define your Python classes and use the `mapper()` function (or `registry.map_imperatively()` in newer SQLAlchemy) to explicitly link (map) the class to the `Table` object.
    *   **Characteristics**:
        *   Clear separation between schema definition (`Table`) and class mapping.
        *   More verbose than declarative.
        *   Offers fine-grained control over the mapping process.
        *   Can be useful when mapping classes to pre-existing tables or when the class structure and table structure differ significantly.
    *   **Example**:
        ```python
        from sqlalchemy import Table, Column, Integer, String, MetaData
        from sqlalchemy.orm import registry # For SQLAlchemy 2.0 style

        metadata_obj = MetaData()
        mapper_registry = registry(metadata=metadata_obj) # Or just registry()

        users_table = Table('users', metadata_obj,
            Column('id', Integer, primary_key=True),
            Column('name', String)
        )

        class User:  # A plain Python class
            pass

        # Explicitly map the User class to the users_table
        mapper_registry.map_imperatively(User, users_table)
        ```

3.  **Hybrid Table Creation / Hybrid Declarative (Less common terminology, often refers to extending Declarative)**:
    *   The term "hybrid" isn't a formally distinct mapping style in SQLAlchemy like Declarative or Imperative. It usually implies mixing aspects or using advanced features within one of these primary styles.
    *   **Mixing Core and ORM**: You might use Declarative for most models but then use SQLAlchemy Core `Table` objects directly for certain queries or operations, or map some classes imperatively while others are declarative.
    *   **Extending Declarative with `__table_args__`**: Within a Declarative class definition, you can use `__table_args__` to specify more complex table-level DDL constructs (like multi-column constraints, database-specific options) that aren't directly tied to individual `Column` definitions.
        ```python
        from sqlalchemy import UniqueConstraint

        class Product(Base):
            __tablename__ = 'products'
            id = Column(Integer, primary_key=True)
            name = Column(String)
            vendor_id = Column(Integer, ForeignKey('vendors.id'))

            __table_args__ = (
                UniqueConstraint('name', 'vendor_id', name='uq_product_name_vendor'),
                {'mysql_engine': 'InnoDB'} # Database-specific argument
            )
        ```
    *   **Using `__table__` directly in Declarative**: You can explicitly define a `Table` object and assign it to `__table__` in a Declarative class, giving more control similar to imperative mapping but within the Declarative style.
        ```python
        metadata_obj = MetaData()
        class MyData(Base):
            __table__ = Table('mydata', metadata_obj, # Use a pre-existing metadata or share
                Column('id', Integer, primary_key=True),
                Column('data', String)
            )
        ```

**Summary of Differences:**

| Feature                  | Declarative                                      | Imperative (Classical)                            |
| :----------------------- | :----------------------------------------------- | :------------------------------------------------ |
| **Schema & Mapping**     | Combined in class definition. `Table` is implicit. | `Table` defined first, then class mapped to it. |
| **Verbosity**            | Less verbose, more Pythonic.                     | More verbose, explicit.                           |
| **Separation of Concerns** | Less separation between class and table def.     | Clear separation.                                 |
| **Control**              | Good control, with extensions via `__table_args__`. | Maximum control over mapping.                   |
| **Common Usage**         | Most common and recommended for new projects.    | Older style, or for complex/existing schemas.     |

Most modern SQLAlchemy applications use the **Declarative** system due to its conciseness and ease of use. Imperative mapping remains available for specific scenarios requiring more explicit control or when working with existing database schemas that don't neatly fit the declarative model.

## How can you ensure secure table creation to prevent SQL injection?

SQL injection during *table creation* (DDL - Data Definition Language) is less common than during data manipulation (DML - SELECT, INSERT, UPDATE, DELETE) because table names, column names, and data types are usually defined by developers in code, not directly from user input. However, if any part of your DDL generation involves dynamic string formatting with untrusted input, vulnerabilities can arise.

SQLAlchemy's schema definition constructs (`Table`, `Column`, etc.) are designed to generate DDL safely.

**Best Practices for Secure Table Creation with SQLAlchemy:**

1.  **Use SQLAlchemy's Schema Constructs**:
    *   **Practice**: Define tables, columns, constraints, and indexes using SQLAlchemy's objects (`Table`, `Column`, `Index`, `ForeignKey`, `UniqueConstraint`, etc.) rather than trying to build `CREATE TABLE` strings manually.
    *   **Rationale**: SQLAlchemy handles the correct quoting and escaping of identifiers (table names, column names) according to the database dialect.
    *   **Example**:
        ```python
        from sqlalchemy import Table, Column, Integer, String, MetaData

        metadata = MetaData()
        my_table = Table('my_secure_table', metadata,
            Column('id', Integer, primary_key=True),
            Column('user_comment', String(255)) # Column name is fixed
        )
        # When Base.metadata.create_all(engine) or Alembic runs, SQLAlchemy
        # generates "CREATE TABLE my_secure_table (id INTEGER..., user_comment VARCHAR(255)...)"
        # safely.
        ```

2.  **Do Not Use User Input Directly for Identifiers**:
    *   **Practice**: Table names, column names, constraint names, and data types should generally be hardcoded or come from trusted configuration sources, not directly from untrusted user input.
    *   **Rationale**: If you were to, for example, create table names based on user input like `Table(user_supplied_table_name, metadata, ...)`, and `user_supplied_table_name` was something like `malicious_table; DROP DATABASE other_db; --`, you could have a DDL injection if the input isn't rigorously sanitized and validated (which is hard to do perfectly). SQLAlchemy's quoting helps but it's best to avoid dynamic identifiers from untrusted sources.

3.  **Sanitize and Validate if Dynamic Identifiers Are Unavoidable**:
    *   **Practice**: If there's an absolute need to use dynamic names for tables or columns (e.g., in some multi-tenant sharding schemes or highly dynamic EAV models, though these are advanced and complex), ensure the input is strictly validated against an allow-list of characters or patterns and properly escaped if SQLAlchemy's default quoting isn't sufficient for some reason.
    *   **Rationale**: Prevents malicious characters or SQL commands from being injected into identifiers.
    *   **Note**: This is an advanced and generally discouraged pattern.

4.  **Use Migration Tools (Alembic)**:
    *   **Practice**: Manage your schema changes, including table creation, using a migration tool like Alembic. Alembic scripts typically use SQLAlchemy's schema constructs.
    *   **Rationale**: Provides version control for your schema, allows for review of generated DDL, and promotes a structured approach to schema evolution.

5.  **Principle of Least Privilege for DDL Operations**:
    *   **Practice**: The database user account used for schema migrations or initial `create_all` should have DDL privileges (like `CREATE TABLE`), but the regular application user (used for day-to-day DML) should have more restricted permissions (SELECT, INSERT, UPDATE, DELETE on specific tables only).
    *   **Rationale**: Limits the potential damage if the application user credentials are compromised.

SQLAlchemy's design inherently makes DDL generation quite safe when using its schema definition objects. The main risk would arise if you circumvent these mechanisms and resort to manual string formatting for DDL statements with untrusted input, which should be avoided.

## Write a SQLAlchemy model with secure constraints (e.g., unique, not null) for a `Product` table.

```python
from sqlalchemy import create_engine, Column, Integer, String, Numeric, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import sessionmaker, declarative_base, relationship

DATABASE_URL = "sqlite:///./products_example.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Name: Required, indexed for searching, max length
    name = Column(String(200), nullable=False, index=True)
    
    # SKU (Stock Keeping Unit): Required, unique, indexed for lookups, specific format/length
    sku = Column(String(50), unique=True, nullable=False, index=True)
    
    description = Column(String, nullable=True) # Optional description
    
    # Price: Required, must be positive. Numeric for precision.
    price = Column(Numeric(10, 2), nullable=False) 
    # Note: For a CHECK constraint like price > 0, you might need to add it
    # via __table_args__ or directly in the DB, as `nullable=False` only ensures it's not NULL.
    # Some databases might allow CHECK constraints directly on Column definition.

    # Stock Quantity: Required, non-negative
    stock_quantity = Column(Integer, nullable=False, default=0)
    # Similar to price, a CHECK constraint for stock_quantity >= 0 is good practice.

    is_active = Column(Boolean, nullable=False, default=True, server_default='t') # Active by default

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    category = relationship("Category", back_populates="products")

    # Example of a multi-column unique constraint
    # __table_args__ = (
    #     UniqueConstraint('name', 'category_id', name='uq_product_name_category'),
    #     # Example CHECK constraint (syntax can be database-specific)
    #     # CheckConstraint('price > 0', name='ck_product_price_positive'),
    #     # CheckConstraint('stock_quantity >= 0', name='ck_stock_quantity_non_negative'),
    # )

    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}', sku='{self.sku}', price={self.price})>"

# Create tables
Base.metadata.create_all(bind=engine)

# Example of adding a CHECK constraint using Alembic or raw SQL (PostgreSQL example):
# ALTER TABLE products ADD CONSTRAINT ck_product_price_positive CHECK (price > 0);
# ALTER TABLE products ADD CONSTRAINT ck_stock_quantity_non_negative CHECK (stock_quantity >= 0);

if __name__ == "__main__":
    db = SessionLocal()
    try:
        # Create a category
        cat1 = db.query(Category).filter_by(name="Electronics").first()
        if not cat1:
            cat1 = Category(name="Electronics")
            db.add(cat1)
            db.commit()
            db.refresh(cat1)

        # Example of adding a product
        product1 = Product(
            name="Super Smartphone X",
            sku="SSPX-001",
            description="The latest and greatest smartphone.",
            price=999.99, # Numeric will handle this
            stock_quantity=100,
            is_active=True,
            category_id=cat1.id # Link to category
        )
        db.add(product1)
        db.commit()
        print(f"Added product: {product1}")

        # Try adding a duplicate SKU - should fail if DB constraint is active
        try:
            product_dup_sku = Product(name="Another Phone", sku="SSPX-001", price=799.00, stock_quantity=50, category_id=cat1.id)
            db.add(product_dup_sku)
            db.commit()
        except Exception as e: # Catches IntegrityError from SQLAlchemy/DBAPI
            print(f"\nError adding product with duplicate SKU: {e}")
            db.rollback()

        # Try adding product with non-positive price (if CHECK constraint exists)
        # product_bad_price = Product(name="Cheap Phone", sku="CP-001", price=-5.00, stock_quantity=10, category_id=cat1.id)
        # db.add(product_bad_price)
        # try:
        #     db.commit()
        # except Exception as e:
        #     print(f"\nError adding product with bad price: {e}")
        #     db.rollback()


    finally:
        db.close()
```

**Security-Related Constraints and Features in this Model:**

*   **`nullable=False`**: Ensures that `name`, `sku`, `price`, `stock_quantity`, `is_active`, and `category_id` cannot be NULL in the database. This enforces data completeness.
*   **`unique=True`**:
    *   `sku = Column(String(50), unique=True, ...)`: Enforces that each product must have a unique SKU. The database will prevent duplicate SKUs.
    *   `Category.name = Column(String(100), unique=True, ...)`: Ensures category names are unique.
*   **`String(length)`**: `String(200)` for `name`, `String(50)` for `sku`. While not strictly a security constraint against injection (SQLAlchemy handles that), it helps define data boundaries and can prevent overly long inputs if some systems have limitations.
*   **`Numeric(10, 2)` for `price`**: Using `Numeric` (or `Decimal`) is crucial for financial values to avoid floating-point inaccuracies. `(10, 2)` means up to 10 total digits, with 2 after the decimal point.
*   **`ForeignKey("categories.id")`**: Enforces referential integrity. A product must belong to a valid category that exists in the `categories` table.
*   **`default` and `server_default`**:
    *   `stock_quantity = Column(Integer, ..., default=0)`: Python-side default.
    *   `is_active = Column(Boolean, ..., default=True, server_default='t')`: Has both a Python-side default and a database-side default (`server_default`). The `server_default` is often more robust as it's applied by the database itself if the application doesn't provide a value.
*   **`index=True`**: While primarily for performance, indexes on unique columns also help the database enforce uniqueness constraints more efficiently.
*   **`CHECK` Constraints (Commented Out, Best Added via Migrations/Direct DDL)**:
    *   Constraints like `price > 0` or `stock_quantity >= 0` are best enforced at the database level using `CHECK` constraints. SQLAlchemy can define these via `__table_args__` or they can be added using migration tools like Alembic or raw SQL. This provides a strong guarantee that invalid data (like negative prices) cannot enter the database, regardless of application-level validation.

This model demonstrates defining common secure constraints. In a real application, these would typically be managed and applied through a migration tool like Alembic to track schema changes over time. The application layer (e.g., using Pydantic in FastAPI) would provide an additional layer of validation before data even reaches SQLAlchemy.

Adhering to best practices when using SQLAlchemy can lead to more maintainable, performant, and robust applications. Here are some general guidelines:

1.  **Session Management**:
    *   Use a session per request (or per unit of work). In web applications like FastAPI, this is often managed via a dependency.
    *   Ensure sessions are always closed, even if errors occur (e.g., using `try...finally` blocks).
    *   Avoid long-lived sessions as they can consume resources and lead to stale data.

2.  **Querying**:
    *   Be explicit with what you load. Use options like `joinedload`, `selectinload` to manage relationship loading and avoid N+1 query problems.
    *   Use `with_entities` to select specific columns if you don't need full ORM objects, which can be more efficient.
    *   Understand the difference between `filter()` and `filter_by()`. `filter()` is more flexible and allows for complex SQL expressions.
    *   Leverage SQLAlchemy's SQL Expression Language for complex queries rather than raw SQL where possible for better portability and integration with the ORM.

3.  **Transactions**:
    *   Understand SQLAlchemy's transaction semantics. By default, a session operates within a transaction that is committed with `db.commit()` or rolled back with `db.rollback()`.
    *   Group related database operations within a single transaction to ensure data consistency.

4.  **Model Definition**:
    *   Define clear relationships (one-to-one, one-to-many, many-to-many) with appropriate `back_populates` or `backref` arguments.
    *   Use constraints (e.g., `CheckConstraint`, `UniqueConstraint`) at the database level to enforce data integrity.
    *   Consider using `alembic` for database schema migrations.

5.  **Performance**:
    *   Profile your database queries. Tools like SQLAlchemy's built-in logging or external profilers can help identify slow queries.
    *   Use database indexes appropriately on columns frequently used in `WHERE` clauses, `JOIN` conditions, and `ORDER BY` clauses.
    *   For bulk operations (inserts, updates), explore SQLAlchemy's bulk methods or Core expression language for better performance.

6.  **Asynchronous Operations (SQLAlchemy 1.4+ / 2.0)**:
    *   When working in an async environment (like FastAPI with `async def`), use SQLAlchemy's async support (e.g., `AsyncSession`, `AsyncEngine`) and `await` database calls.

7.  **Error Handling**:
    *   Handle SQLAlchemy exceptions gracefully (e.g., `IntegrityError`, `NoResultFound`).

8.  **Code Organization**:
    *   Separate your SQLAlchemy models, session management, and CRUD operations into distinct modules or layers (e.g., a repository pattern or service layer).

Following these practices will help you make the most of SQLAlchemy's powerful features while keeping your database interactions efficient and manageable.

Placeholder content for "SQLAlchemy Best Practices". This section will outline recommended practices for using SQLAlchemy, covering session management, querying, transactions, model definitions, and performance considerations.
