---
title: Data Structures
description: Placeholder content for Core Python Data Structures.
order: 4
---

# Core Python Data Structures

# Advanced Data Structures and Functional Programming

## Table of Contents

- [Core Python Data Structures](#core-python-data-structures)
- [Advanced Data Structures and Functional Programming](#advanced-data-structures-and-functional-programming)
  - [Table of Contents](#table-of-contents)
  - [Advanced Data Structures](#advanced-data-structures)
    - [Graphs](#graphs)
    - [Trees](#trees)
    - [Heaps](#heaps)
  - [Functional Programming Concepts](#functional-programming-concepts)
    - [Map](#map)
    - [Filter](#filter)
    - [Lambda Functions](#lambda-functions)
  - [Putting It All Together](#putting-it-all-together)
  - [Conclusion](#conclusion)
    - [Advanced Data Structuress](#advanced-data-structuress)
    - [Functional Programming Conceptss](#functional-programming-conceptss)
    - [Putting It All Togethers](#putting-it-all-togethers)
    - [Conclusions](#conclusions)

## Advanced Data Structures

### Graphs

- **Description**: A graph is a collection of nodes (or vertices) connected by edges. It can be directed or undirected.
- **Applications**: Social networks, routing algorithms, etc.
- **Implementation (Adjacency List)**:

    ```python
    class Graph:
        def __init__(self):
            self.graph = {}

        def add_edge(self, u, v):
            if u not in self.graph:
                self.graph[u] = []
            self.graph[u].append(v)

    g = Graph()
    g.add_edge(0, 1)
    g.add_edge(0, 2)
    g.add_edge(1, 2)
    print(g.graph)  # Output: {0: [1, 2], 1: [2]}
    ```

### Trees

- **Description**: A tree is a hierarchical data structure with nodes connected by edges. Each tree has a root node, and each node can have children.
- **Types**: Binary Trees, Binary Search Trees, AVL Trees, etc.
- **Implementation (Binary Tree)**:

    ```python
    class Node:
        def __init__(self, value):
            self.value = value
            self.left = None
            self.right = None

    class BinaryTree:
        def __init__(self):
            self.root = None

        def insert(self, value):
            if not self.root:
                self.root = Node(value)
            else:
                self._insert_recursively(self.root, value)

        def _insert_recursively(self, node, value):
            if value < node.value:
                if node.left is None:
                    node.left = Node(value)
                else:
                    self._insert_recursively(node.left, value)
            else:
                if node.right is None:
                    node.right = Node(value)
                else:
                    self._insert_recursively(node.right, value)

    tree = BinaryTree()
    tree.insert(10)
    tree.insert(5)
    tree.insert(15)
    ```

### Heaps

- **Description**: A heap is a special tree-based structure that satisfies the heap property. In a max heap, the parent node is greater than or equal to its children; in a min heap, the parent node is less than or equal to its children.
- **Applications**: Priority queues, scheduling algorithms.
- **Implementation (Min Heap)**:

    ```python
    import heapq

    class MinHeap:
        def __init__(self):
            self.heap = []

        def push(self, val):
            heapq.heappush(self.heap, val)

        def pop(self):
            return heapq.heappop(self.heap)

    min_heap = MinHeap()
    min_heap.push(3)
    min_heap.push(1)
    min_heap.push(2)
    print(min_heap.pop())  # Output: 1
    ```

## Functional Programming Concepts

### Map

- **Description**: The `map` function applies a given function to all items in an iterable (like a list) and returns a map object (which can be converted to a list).
- **Syntax**: `map(function, iterable)`
- **Example**:

    ```python
    def square(x):
        return x * x

    numbers = [1, 2, 3, 4, 5]
    squared_numbers = list(map(square, numbers))
    print(squared_numbers)  # Output: [1, 4, 9, 16, 25]
    ```

### Filter

- **Description**: The `filter` function creates an iterator from elements of an iterable for which a function returns true.
- **Syntax**: `filter(function, iterable)`
- **Example**:

    ```python
    def is_even(x):
        return x % 2 == 0

    numbers = [1, 2, 3, 4, 5, 6]
    even_numbers = list(filter(is_even, numbers))
    print(even_numbers)  # Output: [2, 4, 6]
    ```

### Lambda Functions

- **Description**: A `lambda` function is an anonymous function defined with the `lambda` keyword. It can take any number of arguments but can only have one expression.
- **Syntax**: `lambda arguments: expression`
- **Example**:

    ```python
    numbers = [1, 2, 3, 4, 5]
    squared_numbers = list(map(lambda x: x * x, numbers))
    print(squared_numbers)  # Output: [1, 4, 9, 16, 25]

    even_numbers = list(filter(lambda x: x % 2 == 0, numbers))
    print(even_numbers)  # Output: [2, 4]
    ```

## Putting It All Together

You can combine these functional programming concepts with advanced data structures for more complex tasks. Here’s an example that uses a graph and functional programming:

```python
class Graph:
    def __init__(self):
        self.graph = {}

    def add_edge(self, u, v):
        if u not in self.graph:
            self.graph[u] = []
        self.graph[u].append(v)

    def get_neighbors(self, u):
        return self.graph.get(u, [])

# Create a graph and add edges
g = Graph()
g.add_edge(1, 2)
g.add_edge(1, 3)
g.add_edge(2, 4)
g.add_edge(3, 4)

# Get neighbors for node 1 and filter for neighbors greater than 2
neighbors = g.get_neighbors(1)
filtered_neighbors = list(filter(lambda x: x > 2, neighbors))
print(filtered_neighbors)  # Output: [3]
```

## Conclusion

Understanding advanced data structures and functional programming concepts enhances your ability to solve complex problems efficiently. These tools are foundational in programming and computer science, making them essential for effective software development.

---

Absolutely! Let’s dive into **Advanced Data Structures** and **Functional Programming** concepts like `map`, `filter`, and `lambda`. We’ll cover key data structures, provide explanations, and include code snippets for better understanding.

### Advanced Data Structuress

1. **Graphs**
   - **Description**: A graph is a collection of nodes (or vertices) connected by edges. It can be directed or undirected.
   - **Applications**: Social networks, routing algorithms, etc.
   - **Implementation (Adjacency List)**:

     ```python
     class Graph:
         def __init__(self):
             self.graph = {}

         def add_edge(self, u, v):
             if u not in self.graph:
                 self.graph[u] = []
             self.graph[u].append(v)

     g = Graph()
     g.add_edge(0, 1)
     g.add_edge(0, 2)
     g.add_edge(1, 2)
     print(g.graph)  # Output: {0: [1, 2], 1: [2]}
     ```

2. **Trees**
   - **Description**: A tree is a hierarchical data structure with nodes connected by edges. Each tree has a root node, and each node can have children.
   - **Types**: Binary Trees, Binary Search Trees, AVL Trees, etc.
   - **Implementation (Binary Tree)**:

     ```python
     class Node:
         def __init__(self, value):
             self.value = value
             self.left = None
             self.right = None

     class BinaryTree:
         def __init__(self):
             self.root = None

         def insert(self, value):
             if not self.root:
                 self.root = Node(value)
             else:
                 self._insert_recursively(self.root, value)

         def _insert_recursively(self, node, value):
             if value < node.value:
                 if node.left is None:
                     node.left = Node(value)
                 else:
                     self._insert_recursively(node.left, value)
             else:
                 if node.right is None:
                     node.right = Node(value)
                 else:
                     self._insert_recursively(node.right, value)

     tree = BinaryTree()
     tree.insert(10)
     tree.insert(5)
     tree.insert(15)
     ```

3. **Heaps**
   - **Description**: A heap is a special tree-based structure that satisfies the heap property. In a max heap, the parent node is greater than or equal to its children; in a min heap, the parent node is less than or equal to its children.
   - **Applications**: Priority queues, scheduling algorithms.
   - **Implementation (Min Heap)**:

     ```python
     import heapq

     class MinHeap:
         def __init__(self):
             self.heap = []

         def push(self, val):
             heapq.heappush(self.heap, val)

         def pop(self):
             return heapq.heappop(self.heap)

     min_heap = MinHeap()
     min_heap.push(3)
     min_heap.push(1)
     min_heap.push(2)
     print(min_heap.pop())  # Output: 1
     ```

### Functional Programming Conceptss

1. **Map**
   - **Description**: The `map` function applies a given function to all items in an iterable (like a list) and returns a map object (which can be converted to a list).
   - **Syntax**: `map(function, iterable)`
   - **Example**:

     ```python
     def square(x):
         return x * x

     numbers = [1, 2, 3, 4, 5]
     squared_numbers = list(map(square, numbers))
     print(squared_numbers)  # Output: [1, 4, 9, 16, 25]
     ```

2. **Filter**
   - **Description**: The `filter` function creates an iterator from elements of an iterable for which a function returns true.
   - **Syntax**: `filter(function, iterable)`
   - **Example**:

     ```python
     def is_even(x):
         return x % 2 == 0

     numbers = [1, 2, 3, 4, 5, 6]
     even_numbers = list(filter(is_even, numbers))
     print(even_numbers)  # Output: [2, 4, 6]
     ```

3. **Lambda Functions**
   - **Description**: A `lambda` function is an anonymous function defined with the `lambda` keyword. It can take any number of arguments but can only have one expression.
   - **Syntax**: `lambda arguments: expression`
   - **Example**:

     ```python
     numbers = [1, 2, 3, 4, 5]
     squared_numbers = list(map(lambda x: x * x, numbers))
     print(squared_numbers)  # Output: [1, 4, 9, 16, 25]

     even_numbers = list(filter(lambda x: x % 2 == 0, numbers))
     print(even_numbers)  # Output: [2, 4]
     ```

### Putting It All Togethers

You can combine these functional programming concepts with advanced data structures for more complex tasks. Here’s an example that uses a graph and functional programming:

```python
class Graph:
    def __init__(self):
        self.graph = {}

    def add_edge(self, u, v):
        if u not in self.graph:
            self.graph[u] = []
        self.graph[u].append(v)

    def get_neighbors(self, u):
        return self.graph.get(u, [])

# Create a graph and add edges
g = Graph()
g.add_edge(1, 2)
g.add_edge(1, 3)
g.add_edge(2, 4)
g.add_edge(3, 4)

# Get neighbors for node 1 and filter for neighbors greater than 2
neighbors = g.get_neighbors(1)
filtered_neighbors = list(filter(lambda x: x > 2, neighbors))
print(filtered_neighbors)  # Output: [3]
```

### Conclusions

Understanding advanced data structures and functional programming concepts enhances your ability to solve complex problems efficiently. These tools are foundational in programming and computer science, making them essential for effective software development. Feel free to ask if you need further explanations or specific examples!

