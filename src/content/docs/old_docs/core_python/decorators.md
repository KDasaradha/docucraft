---
title: Decorators
description: Placeholder content for Core Python Decorators.
order: 2
---

# Core Python Decorators

## **Decorators in Python**

### **What is a Decorator?**

A decorator is a function that takes another function as an argument and extends or modifies its behavior without changing its actual code. Decorators are commonly used for **logging**, **access control**, **timing function execution**, and **memoization (caching)**.

Decorators are often applied with the `@decorator_name` syntax, just above the function definition.

### **Basic Decorator Structure**

```python
def decorator_function(original_function):
    def wrapper_function(*args, **kwargs):
        # Code to execute before the original function
        result = original_function(*args, **kwargs)
        # Code to execute after the original function
        return result
    return wrapper_function
```

### **Example: Simple Logging Decorator**

This decorator will print a message before and after the execution of any function it decorates.

```python
def log_decorator(func):
    """A decorator that logs function calls."""
    def wrapper(*args, **kwargs):
        print(f"Calling function '{func.__name__}'...")
        result = func(*args, **kwargs)
        print(f"Finished function '{func.__name__}'")
        return result
    return wrapper

@log_decorator
def say_hello():
    print("Hello!")

# Usage
say_hello()
# Output:
# Calling function 'say_hello'...
# Hello!
# Finished function 'say_hello'
```

### **Using Decorators with Arguments**

Decorators can also be useful for timing how long a function takes to execute. Here’s an example of a decorator that measures and prints execution time.

```python
import time

def timer_decorator(func):
    """A decorator that measures function execution time."""
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"{func.__name__} took {end_time - start_time:.4f} seconds to execute.")
        return result
    return wrapper

@timer_decorator
def example_function():
    time.sleep(2)  # Simulate a delay
    print("Function complete.")

# Usage
example_function()
# Output:
# Function complete.
# example_function took 2.000X seconds to execute.
```

### **Practical Example: Access Control Decorator**

Decorators are helpful for controlling access to specific parts of an application. Here’s an example of an `authenticated` decorator that allows access only if the user is authenticated.

```python
def authenticated(func):
    """A decorator that checks user authentication status."""
    def wrapper(user, *args, **kwargs):
        if not user.get("authenticated"):
            return "Access denied. User not authenticated."
        return func(user, *args, **kwargs)
    return wrapper

@authenticated
def view_account(user):
    return f"Welcome {user['name']}, here is your account information."

# Usage
user = {"name": "Alice", "authenticated": True}
print(view_account(user))  # Output: Welcome Alice, here is your account information.

user_not_authenticated = {"name": "Bob", "authenticated": False}
print(view_account(user_not_authenticated))  # Output: Access denied. User not authenticated.
```

### **Decorators with Arguments**

If you need to pass arguments to a decorator, you’ll need to nest the decorator inside another function.

```python
def repeat(n):
    """Decorator to repeat a function n times."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(n):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(3)
def greet():
    print("Hello!")

# Usage
greet()
# Output:
# Hello!
# Hello!
# Hello!
```

### **Summary of Decorator Use Cases**

- **Logging**: Track function calls for debugging.
- **Access Control**: Restrict access based on user status.
- **Timing**: Measure execution time for performance analysis.
- **Repetition**: Run a function multiple times automatically.

Using decorators can significantly enhance code readability and reusability, keeping functionality separate from application logic!

