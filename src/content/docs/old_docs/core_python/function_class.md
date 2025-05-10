---
title: Functions &amp; Classes
description: Placeholder content for Core Python Functions &amp; Classes.
order: 1
---

# Core Python Functions &amp; Classes

# **Functions and Classes in Python**

## Here’s a Markdown-friendly introduction to **Functions and Classes** in Python, with explanations and code snippets to help understand the concepts of methods, attributes, and efficient coding practices

### **Functions**

A function is a block of reusable code that performs a specific task. Functions allow you to organize and modularize code, making it more readable and reusable.

#### **Basic Function Syntax**

```python
def function_name(parameters):
    """Docstring explaining the function."""
    # Code block
    return result
```

#### **Example: Function for Adding Two Numbers**

```python
def add_numbers(a, b):
    """Return the sum of two numbers."""
    return a + b

# Usage
result = add_numbers(3, 5)
print(result)  # Output: 8
```

### **Classes**

A class is a blueprint for creating objects. It encapsulates data (attributes) and behavior (methods) together. Using classes, we can create multiple instances, each with their own unique data and functionality.

#### **Basic Class Syntax**

```python
class ClassName:
    """Docstring explaining the class."""
    
    def __init__(self, parameters):
        # Initialization method to set up object properties
        self.attribute = parameters

    def method(self):
        # Method performing some action
        pass
```

#### **Example: Creating a Simple `Person` Class**

```python
class Person:
    """A class to represent a person."""
    
    def __init__(self, name, age):
        self.name = name  # Attribute
        self.age = age    # Attribute

    def greet(self):
        """Method to greet with the person's name."""
        return f"Hello, my name is {self.name}."

# Creating an instance of Person
person1 = Person("Alice", 30)
print(person1.greet())  # Output: Hello, my name is Alice.
```

### **Understanding Methods and Attributes**

- **Attributes**: Variables that store the state or data of the class, defined in `__init__` (initializer) method.
- **Methods**: Functions defined inside a class that perform actions on the class’s attributes or other tasks.

#### **Example: Bank Account Class with Attributes and Methods**

```python
class BankAccount:
    """A class representing a bank account."""
    
    def __init__(self, owner, balance=0.0):
        self.owner = owner  # Attribute for account owner
        self.balance = balance  # Attribute for account balance

    def deposit(self, amount):
        """Method to deposit money into the account."""
        if amount > 0:
            self.balance += amount
            return f"Deposit successful! New balance: {self.balance}"
        return "Invalid deposit amount."

    def withdraw(self, amount):
        """Method to withdraw money from the account."""
        if 0 < amount <= self.balance:
            self.balance -= amount
            return f"Withdrawal successful! New balance: {self.balance}"
        return "Invalid or insufficient funds."

# Usage
account = BankAccount("John", 100.0)
print(account.deposit(50))      # Output: Deposit successful! New balance: 150.0
print(account.withdraw(75))     # Output: Withdrawal successful! New balance: 75.0
```

### **Efficient Practices for Functions and Classes**

1. **Use Descriptive Names**: Function and class names should clearly describe their purpose.
2. **Keep Functions Focused**: Each function should perform a single, specific task.
3. **Limit Class Responsibilities**: A class should encapsulate a single concept (Single Responsibility Principle).
4. **Write Docstrings**: Use docstrings to document classes and methods, making code more readable.
5. **Encapsulate Data**: Keep attributes private (prefix with `_`), providing access through methods as needed.

This approach to functions and classes enhances readability, modularity, and maintainability in Python applications.
