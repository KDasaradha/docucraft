---
title: Functional Testing
description: Placeholder content for Functional Testing.
order: 1
---

# Functional Testing

Pytest is a popular testing framework in Python that makes it easy to write simple unit tests as well as complex functional tests. Below is a guide on how to implement Pytest for normal functions.

---

## **1. Install Pytest**
If you haven’t installed `pytest` yet, you can do so using pip:

```bash
pip install pytest
```

---

## **2. Writing a Simple Function**
Let's assume we have a Python module named `math_operations.py` with a simple function:

```python
# math_operations.py
def add(a: int, b: int) -> int:
    return a + b

def subtract(a: int, b: int) -> int:
    return a - b

def multiply(a: int, b: int) -> int:
    return a * b

def divide(a: int, b: int) -> float:
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b
```

---

## **3. Writing Tests for These Functions**
Create a separate file named `test_math_operations.py` in the same directory.

```python
# test_math_operations.py
import pytest
from math_operations import add, subtract, multiply, divide

def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
    assert add(0, 0) == 0

def test_subtract():
    assert subtract(5, 3) == 2
    assert subtract(0, 5) == -5

def test_multiply():
    assert multiply(4, 5) == 20
    assert multiply(0, 10) == 0

def test_divide():
    assert divide(10, 2) == 5.0
    assert divide(9, 3) == 3.0

    with pytest.raises(ValueError, match="Cannot divide by zero"):
        divide(10, 0)
```

---

## **4. Running the Pytest Tests**
To execute the test cases, run the following command in the terminal:

```bash
pytest
```

This will automatically discover all test files (files starting with `test_`) and execute the test functions.

### **To see more detailed output:**
```bash
pytest -v
```

### **To run a specific test file:**
```bash
pytest test_math_operations.py
```

### **To run a specific test function:**
```bash
pytest test_math_operations.py::test_add
```

---

## **5. Using Fixtures (For More Complex Tests)**
If you need to initialize data before running tests, you can use **pytest fixtures**:

```python
@pytest.fixture
def sample_numbers():
    return (10, 5)

def test_add_fixture(sample_numbers):
    a, b = sample_numbers
    assert add(a, b) == 15
```

---

## **6. Generating a Test Report**
To generate a test coverage report:

```bash
pytest --cov=math_operations
```

To generate an HTML report:

```bash
pytest --cov=math_operations --cov-report=html
```

---

## **7. Running Tests in Parallel**
To speed up tests, install `pytest-xdist`:

```bash
pip install pytest-xdist
```

Then, run tests in parallel:

```bash
pytest -n auto
```

---

This guide should help you get started with **pytest** for normal functions. Let me know if you need more details! 🚀