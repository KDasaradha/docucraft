---
title: Python - Basic
---

# Python - Basic Concepts

This section covers the fundamental concepts required to start programming in Python.

## Key Topics

### Variables and Data Types
Variables are used to store data. Python is dynamically typed, meaning you don't need to declare the type of a variable.
Common data types include:
- **Integers (`int`)**: Whole numbers, e.g., `10`, `-3`.
- **Floats (`float`)**: Numbers with a decimal point, e.g., `3.14`, `-0.001`.
- **Strings (`str`)**: Sequences of characters, e.g., `"Hello"`, `'Python'`.
- **Booleans (`bool`)**: `True` or `False`.
- **Lists (`list`)**: Ordered, mutable sequences, e.g., `[1, "apple", 3.0]`.
- **Tuples (`tuple`)**: Ordered, immutable sequences, e.g., `(1, "banana", 2.5)`.
- **Dictionaries (`dict`)**: Unordered (in Python < 3.7) collections of key-value pairs, e.g., `{"name": "Alice", "age": 30}`.
- **Sets (`set`)**: Unordered collections of unique items, e.g., `{1, 2, 3}`.

```python
# Variable assignment
age = 25
name = "Bob"
is_student = True
pi_value = 3.14159

# List
colors = ["red", "green", "blue"]

# Dictionary
person = {"city": "New York", "country": "USA"}

print(type(age))       # Output: <class 'int'>
print(type(name))      # Output: <class 'str'>
print(type(colors))    # Output: <class 'list'>
```

### Basic Operators
Operators perform operations on variables and values.
- **Arithmetic**: `+` (addition), `-` (subtraction), `*` (multiplication), `/` (division), `//` (floor division), `%` (modulus), `**` (exponentiation).
- **Assignment**: `=`, `+=`, `-=`, `*=`, `/=`, etc.
- **Comparison**: `==` (equal to), `!=` (not equal to), `>` (greater than), `<` (less than), `>=` (greater than or equal to), `<=` (less than or equal to).
- **Logical**: `and`, `or`, `not`.

```python
a = 10
b = 3

print(f"a + b = {a + b}")    # Output: a + b = 13
print(f"a / b = {a / b}")    # Output: a / b = 3.333...
print(f"a // b = {a // b}")  # Output: a // b = 3
print(f"a % b = {a % b}")    # Output: a % b = 1

is_greater = a > b       # True
is_active = True
is_admin = False
can_access = is_active and not is_admin # True
```

### Control Flow
Control flow statements direct the order of execution.
- **`if/elif/else` statements**: For conditional execution.
- **`for` loops**: For iterating over a sequence (like a list, tuple, string) or other iterable objects.
- **`while` loops**: For repeating a block of code as long as a condition is true.
- **`break`**: Exits the current loop.
- **`continue`**: Skips the rest of the current iteration and proceeds to the next.

```python
temperature = 22
if temperature > 30:
    print("It's hot!")
elif temperature > 20:
    print("It's warm.")
else:
    print("It's cool or cold.")

# for loop
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# while loop
count = 0
while count < 3:
    print(f"Count is {count}")
    count += 1
```

### Functions
Functions are blocks of reusable code that perform a specific task.
- **Defining functions**: Use the `def` keyword.
- **Arguments**: Values passed to a function.
- **Return values**: Functions can return a value using the `return` statement.
- **Scope**: Variables defined inside a function are local to that function unless declared `global`.

```python
def greet(name):
    """This function greets the person passed in as a parameter."""
    return f"Hello, {name}!"

message = greet("Alice")
print(message)  # Output: Hello, Alice!

def add_numbers(x, y=0): # y has a default value
    return x + y

sum1 = add_numbers(5, 3)    # Output: 8
sum2 = add_numbers(7)       # Output: 7 (y defaults to 0)
```

### Basic Input and Output
- **`print()`**: Displays output to the console.
- **`input()`**: Reads a line of text from user input (as a string).

```python
# print("Hello from Python!")

# user_name = input("Enter your name: ")
# print(f"Welcome, {user_name}!")
```

### String Manipulation
Strings are immutable sequences of characters.
- **Slicing**: Access parts of a string, e.g., `my_string[start:end]`.
- **Methods**: Built-in functions for strings, e.g., `.upper()`, `.lower()`, `.split()`, `.join()`, `.find()`, `.replace()`.
- **f-strings (Formatted String Literals)**: A convenient way to embed expressions inside string literals.

```python
text = "Python is fun!"
print(text[0:6])      # Output: Python
print(text.upper())   # Output: PYTHON IS FUN!
print(text.split(' ')) # Output: ['Python', 'is', 'fun!']

name = "World"
greeting = f"Hello, {name.upper()} and {2*2}!" # Output: Hello, WORLD and 4!
print(greeting)
```

### List Methods and Operations
Lists are ordered, mutable collections.
- **Accessing elements**: By index, e.g., `my_list[0]`.
- **Slicing**: `my_list[start:end]`.
- **Methods**: `.append()`, `.insert()`, `.remove()`, `.pop()`, `.sort()`, `.reverse()`, `len()`.

```python
numbers = [1, 2, 3, 4, 5]
numbers.append(6)
print(numbers)        # Output: [1, 2, 3, 4, 5, 6]
numbers.insert(0, 0)
print(numbers)        # Output: [0, 1, 2, 3, 4, 5, 6]
popped_element = numbers.pop()
print(popped_element) # Output: 6
print(len(numbers))   # Output: 6
```

### Dictionary Methods and Operations
Dictionaries store key-value pairs.
- **Accessing values**: By key, e.g., `my_dict['key']` or `my_dict.get('key')`.
- **Adding/Updating items**: `my_dict['new_key'] = value`.
- **Methods**: `.keys()`, `.values()`, `.items()`, `.pop()`.

```python
student = {"name": "Carol", "age": 22, "major": "Physics"}
print(student["name"])     # Output: Carol
print(student.get("grade", "N/A")) # Output: N/A (grade key doesn't exist)

student["age"] = 23
student["grade"] = "A"
print(student)           # Output: {'name': 'Carol', 'age': 23, 'major': 'Physics', 'grade': 'A'}

for key, value in student.items():
    print(f"{key}: {value}")
```

### Introduction to Modules and Packages
Modules are files containing Python definitions and statements. Packages are collections of modules.
- **`import` statement**: To use functionality from a module.
- **Standard Library**: Python comes with a rich standard library (e.g., `math` for mathematical functions, `random` for random number generation, `datetime` for dates and times).

```python
import math
print(math.sqrt(16))  # Output: 4.0

from random import randint
print(randint(1, 10)) # Output: A random integer between 1 and 10

import datetime
now = datetime.datetime.now()
print(now.strftime("%Y-%m-%d %H:%M:%S"))
```

### Comments and Docstrings
- **Comments**: Start with `#` and are ignored by the interpreter. Used for explaining code.
- **Docstrings**: Multi-line strings (`"""..."""` or `'''...'''`) used as the first statement in a module, function, class, or method definition. They document what the code does.

```python
# This is a single-line comment

def my_function():
    """
    This is a docstring.
    It explains what the function does.
    """
    pass # Placeholder for function body
```

### Understanding Python's Dynamic Typing
Python checks types at runtime, not during compilation. A variable can hold different types of data at different times.

```python
my_var = 10
print(my_var, type(my_var)) # Output: 10 <class 'int'>

my_var = "Hello"
print(my_var, type(my_var)) # Output: Hello <class 'str'>
```

### Basic Error Types and Reading Tracebacks
Common error types (exceptions) include `SyntaxError`, `TypeError`, `NameError`, `IndexError`, `KeyError`, `ValueError`. A traceback shows the sequence of calls that led to an error, which is crucial for debugging.

```python
# Example causing a TypeError
# result = "5" + 3 # This will raise a TypeError

# Example causing an IndexError
# my_list = [1, 2]
# print(my_list[5]) # This will raise an IndexError
```

### Running Python Scripts
Python scripts are typically saved with a `.py` extension and run from the command line using `python script_name.py`.

This foundation will allow you to build more complex Python programs and explore further topics.
