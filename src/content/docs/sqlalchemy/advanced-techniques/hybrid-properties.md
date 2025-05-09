---
title: SQLAlchemy Hybrid Attributes
---

# SQLAlchemy Hybrid Attributes

**Original Description**: Defining hybrid properties and methods in SQLAlchemy models for computed values accessible via Python or SQL expressions.

SQLAlchemy's **hybrid attributes** (properties and methods) allow you to define Python attributes on your mapped classes that can operate seamlessly at both the **Python object level** (instance level) and the **SQL expression level** (within database queries). This is incredibly useful for computed values, conditional logic, or custom comparisons that you want to use both when working with ORM objects in your application code and when filtering or ordering data in the database.

They are defined using the `@hybrid_property` and `@hybrid_method` decorators from `sqlalchemy.ext.hybrid`.

**1. Hybrid Properties (`@hybrid_property`)**

A hybrid property behaves like a regular Python property on an instance but can also generate a SQL expression for use in queries.

*   **Use Case**: Defining computed fields (e.g., `full_name` from `first_name` and `last_name`), boolean flags based on conditions, or custom representations of data.

*   **Structure**:
    *   Define a standard Python method decorated with `@hybrid_property`. This provides the instance-level behavior (the "getter").
    *   Optionally, define a class method decorated with `@{property_name}.expression`. This method receives the class itself and should return a SQLAlchemy SQL expression object (like `ColumnElement`) representing the equivalent logic for database queries.

*   **Example**: `full_name` property for a `User` model.

    ```python
    from sqlalchemy import Column, Integer, String, select, func
    from sqlalchemy.orm import declarative_base
    from sqlalchemy.ext.hybrid import hybrid_property

    Base = declarative_base()

    class User(Base):
        __tablename__ = 'users'
        id = Column(Integer, primary_key=True)
        first_name = Column(String(50))
        last_name = Column(String(50))

        @hybrid_property
        def full_name(self):
            """Instance-level getter: Concatenates first and last names."""
            if self.first_name and self.last_name:
                return f"{self.first_name} {self.last_name}"
            elif self.first_name:
                return self.first_name
            elif self.last_name:
                return self.last_name
            else:
                return None # Or ""

        @full_name.expression
        def full_name(cls):
            """Class-level SQL expression generator."""
            # Use database concatenation function (e.g., || for standard SQL/PostgreSQL, + for SQL Server, CONCAT for MySQL)
            # Using func.concat for better cross-dialect compatibility where available
            # Handling NULLs might require COALESCE or CASE depending on DB and exact needs
            
            # Simple concatenation assuming non-null (adjust if needed)
            # Use cls.first_name, cls.last_name to refer to columns at class level
            return func.concat(cls.first_name, ' ', cls.last_name) 
            # More robust example handling potential NULLs (PostgreSQL example):
            # return case(
            #     (and_(cls.first_name != None, cls.last_name != None), cls.first_name + ' ' + cls.last_name),
            #     (cls.first_name != None, cls.first_name),
            #     (cls.last_name != None, cls.last_name),
            #     else_=None
            # )

        # Optional: Setter for the hybrid property (if needed)
        @full_name.setter
        def full_name(self, value):
            """Instance-level setter: Splits value into first and last names."""
            if value is None:
                self.first_name = None
                self.last_name = None
            else:
                parts = value.split(" ", 1)
                self.first_name = parts[0]
                self.last_name = parts[1] if len(parts) > 1 else None
                
    # --- Usage ---
    # Instance level
    user_instance = User(first_name="John", last_name="Doe")
    print(user_instance.full_name) # Output: John Doe

    user_instance.full_name = "Jane Smith"
    print(user_instance.first_name, user_instance.last_name) # Output: Jane Smith
    
    # Query level (assuming a session is available)
    # Find users whose full name is 'John Doe'
    stmt = select(User).where(User.full_name == "John Doe") 
    john_does = session.execute(stmt).scalars().all()

    # Order users by full name
    stmt_ordered = select(User).order_by(User.full_name)
    users_ordered = session.execute(stmt_ordered).scalars().all() 
    ```

**2. Hybrid Methods (`@hybrid_method`)**

A hybrid method works like a regular Python method on an instance but can also generate a SQL expression (usually boolean) when called at the class level within a query.

*   **Use Case**: Implementing custom comparison logic, checking conditions involving parameters, or creating reusable filtering expressions.

*   **Structure**:
    *   Define a standard Python method decorated with `@hybrid_method`. This provides the instance-level behavior.
    *   Define a class method decorated with `@{method_name}.expression`. This method receives the class and any arguments passed to the method at the class level. It should return a SQLAlchemy SQL expression (often a boolean comparison).

*   **Example**: `is_active_recently` method for a `User` model with a `last_login` timestamp.

    ```python
    from sqlalchemy import Column, Integer, DateTime, select, func
    from sqlalchemy.orm import declarative_base
    from sqlalchemy.ext.hybrid import hybrid_method
    import datetime

    Base = declarative_base()

    class UserActivity(Base):
        __tablename__ = 'user_activity'
        id = Column(Integer, primary_key=True)
        username = Column(String)
        last_login = Column(DateTime)

        @hybrid_method
        def is_active_recently(self, days=7):
            """Instance-level check: Returns True if last_login is within `days`."""
            if not self.last_login:
                return False
            cutoff_date = datetime.datetime.utcnow() - datetime.timedelta(days=days)
            return self.last_login > cutoff_date

        @is_active_recently.expression
        def is_active_recently(cls, days=7):
            """Class-level SQL expression: Returns SQL condition for recent login."""
            # Assuming database uses UTC timestamps or handles timezones appropriately
            cutoff_date = datetime.datetime.utcnow() - datetime.timedelta(days=days)
            # Use cls.last_login to refer to the column
            return cls.last_login > cutoff_date 

    # --- Usage ---
    # Instance level
    user_active = UserActivity(last_login=datetime.datetime.utcnow() - datetime.timedelta(days=3))
    user_inactive = UserActivity(last_login=datetime.datetime.utcnow() - datetime.timedelta(days=10))
    
    print(f"User Active (default 7 days)? {user_active.is_active_recently()}")    # Output: True
    print(f"User Active (1 day)? {user_active.is_active_recently(days=1)}")      # Output: False
    print(f"User Inactive (default 7 days)? {user_inactive.is_active_recently()}") # Output: False

    # Query level (assuming a session)
    # Find users active in the last 3 days
    stmt_recent = select(UserActivity).where(UserActivity.is_active_recently(days=3))
    recent_users = session.execute(stmt_recent).scalars().all()

    # Find users NOT active in the last 30 days
    stmt_not_recent = select(UserActivity).where(~UserActivity.is_active_recently(days=30)) # Use ~ for negation
    dormant_users = session.execute(stmt_not_recent).scalars().all()
    ```

**Key Considerations:**

*   **Database Functions**: The `.expression` part often relies on database functions (e.g., `CONCAT`, date/time functions). Ensure the functions used are compatible with your target database dialect or use SQLAlchemy's generic `func` namespace where possible.
*   **Performance**: While powerful, complex expressions within hybrids can impact database performance if not indexed properly or if they prevent index usage. Analyze the generated SQL and query plans (`EXPLAIN ANALYZE`).
*   **Instance vs. Expression Logic**: Ensure the logic in the Python instance method and the SQL expression method are equivalent, otherwise you might get different results when querying versus accessing the attribute on a loaded object.

Hybrid attributes provide a powerful way to encapsulate logic related to your data models, making it accessible and consistent whether you're working with Python objects or building database queries.

    