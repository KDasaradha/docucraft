---
title: Object-Oriented Programming
description: Placeholder content for Core Python Object-Oriented Programming.
order: 5
---

# Core Python Object-Oriented Programming

# Object-Oriented Programming (OOP)

## Table of Contents

- [Core Python Object-Oriented Programming](#core-python-object-oriented-programming)
- [Object-Oriented Programming (OOP)](#object-oriented-programming-oop)
  - [Table of Contents](#table-of-contents)
  - [Introduction to OOP](#introduction-to-oop)
  - [Core Principles of OOP](#core-principles-of-oop)
    - [Encapsulation](#encapsulation)
    - [Inheritance](#inheritance)
    - [Polymorphism](#polymorphism)
  - [Advanced OOP Principles](#advanced-oop-principles)
    - [Abstraction](#abstraction)
    - [Composition vs. Inheritance](#composition-vs-inheritance)
    - [Method Overriding and Overloading](#method-overriding-and-overloading)
  - [Example Implementations](#example-implementations)
  - [Conclusion](#conclusion)

## Introduction to OOP

Object-Oriented Programming (OOP) is a programming paradigm that uses "objects" to represent data and methods to manipulate that data. OOP aims to increase the modularity and reusability of code by organizing software around these objects.

## Core Principles of OOP

### Encapsulation

- **Description**: Encapsulation is the bundling of data (attributes) and methods (functions) that operate on the data into a single unit or class. It restricts direct access to some of an object's components and can prevent the accidental modification of data.
- **Implementation**:

    ```python
    class BankAccount:
        def __init__(self, owner, balance=0):
            self.owner = owner
            self.__balance = balance  # Private attribute

        def deposit(self, amount):
            if amount > 0:
                self.__balance += amount
            else:
                raise ValueError("Deposit amount must be positive.")

        def withdraw(self, amount):
            if 0 < amount <= self.__balance:
                self.__balance -= amount
            else:
                raise ValueError("Invalid withdrawal amount.")

        def get_balance(self):
            return self.__balance

    account = BankAccount("Alice", 100)
    account.deposit(50)
    print(account.get_balance())  # Output: 150
    ```

### Inheritance

- **Description**: Inheritance allows a new class (child class) to inherit attributes and methods from an existing class (parent class). This promotes code reusability and establishes a relationship between classes.
- **Implementation**:

    ```python
    class Animal:
        def speak(self):
            return "Animal speaks"

    class Dog(Animal):
        def speak(self):
            return "Woof!"

    class Cat(Animal):
        def speak(self):
            return "Meow!"

    dog = Dog()
    cat = Cat()
    print(dog.speak())  # Output: Woof!
    print(cat.speak())  # Output: Meow!
    ```

### Polymorphism

- **Description**: Polymorphism allows objects of different classes to be treated as objects of a common superclass. The actual method that gets executed is determined at runtime, enabling a single interface to represent different underlying forms (data types).
- **Implementation**:

    ```python
    def animal_sound(animal):
        print(animal.speak())

    animal_sound(dog)  # Output: Woof!
    animal_sound(cat)  # Output: Meow!
    ```

## Advanced OOP Principles

### Abstraction

- **Description**: Abstraction is the concept of hiding complex implementation details and showing only the essential features of an object. It allows focusing on what an object does instead of how it does it.
- **Implementation**:

    ```python
    from abc import ABC, abstractmethod

    class Shape(ABC):
        @abstractmethod
        def area(self):
            pass

    class Circle(Shape):
        def __init__(self, radius):
            self.radius = radius

        def area(self):
            return 3.14 * self.radius * self.radius

    circle = Circle(5)
    print(circle.area())  # Output: 78.5
    ```

### Composition vs. Inheritance

- **Description**: Composition is a design principle where a class is composed of one or more objects of other classes, allowing for more flexible designs. Inheritance should be used when there is an "is-a" relationship, while composition is preferred for "has-a" relationships.
- **Implementation (Composition)**:

    ```python
    class Engine:
        def start(self):
            return "Engine starting..."

    class Car:
        def __init__(self):
            self.engine = Engine()  # Composition

        def start(self):
            return self.engine.start()

    car = Car()
    print(car.start())  # Output: Engine starting...
    ```

### Method Overriding and Overloading

- **Method Overriding**: Allows a subclass to provide a specific implementation of a method that is already defined in its superclass.

    ```python
    class Animal:
        def speak(self):
            return "Animal speaks"

    class Dog(Animal):
        def speak(self):  # Overriding the speak method
            return "Woof!"

    dog = Dog()
    print(dog.speak())  # Output: Woof!
    ```

- **Method Overloading**: Python does not support method overloading directly. However, you can use default parameters or variable-length arguments to achieve similar behavior.

    ```python
    class MathOperations:
        def add(self, a, b, c=0):  # Default parameter for overloading
            return a + b + c

    math_ops = MathOperations()
    print(math_ops.add(2, 3))       # Output: 5
    print(math_ops.add(2, 3, 4))    # Output: 9
    ```

## Example Implementations

Here’s a comprehensive example that combines the core principles of OOP:

```python
class Vehicle:
    def __init__(self, brand):
        self.brand = brand

    def info(self):
        return f"This vehicle is a {self.brand}"

class Car(Vehicle):
    def __init__(self, brand, model):
        super().__init__(brand)
        self.model = model

    def info(self):
        return f"This car is a {self.brand} {self.model}"

class Bike(Vehicle):
    def __init__(self, brand):
        super().__init__(brand)

# Using polymorphism
def vehicle_info(vehicle):
    print(vehicle.info())

car = Car("Toyota", "Camry")
bike = Bike("Yamaha")

vehicle_info(car)  # Output: This car is a Toyota Camry
vehicle_info(bike)  # Output: This vehicle is a Yamaha
```

## Conclusion

Object-Oriented Programming (OOP) is a powerful paradigm that helps in designing flexible and maintainable software. Understanding and applying the principles of encapsulation, inheritance, polymorphism, and abstraction allows developers to create well-structured code. Utilizing these advanced concepts can lead to improved reusability and easier debugging.
