---
title: Colorful Syntax Test
---

# Colorful Syntax Highlighting Test

This page demonstrates the new vibrant, colorful syntax highlighting with different colors for various code elements.

## Python Example with Colorful Syntax

```python
# This is a green comment
def greet(name):
    """This is an orange docstring"""
    message = f"Hello, {name}!"  # Orange string
    print(message)  # Purple built-in function
    return True  # Blue keyword, orange boolean

# Variables and numbers
user_name = "World"  # Pink variable, orange string
age = 25  # Orange number
pi = 3.14159  # Orange number
is_active = True  # Orange boolean

# Class example
class Calculator:  # Blue keyword, cyan class name
    def __init__(self, value=0):  # Yellow function, blue keyword
        self.value = value  # Pink variable
    
    def add(self, num):  # Yellow function
        self.value += num  # Magenta operator
        return self.value  # Blue keyword

# List and dictionary
colors = ["red", "green", "blue"]  # Orange strings
person = {"name": "Alice", "age": 30}  # Blue properties, orange values

# Function call
calc = Calculator(10)  # Cyan class name
result = calc.add(5)  # Yellow function call
print(f"Result: {result}")  # Purple built-in, orange string
```

## JavaScript Example with Vibrant Colors

```javascript
// Green comment
const apiUrl = 'https://api.example.com';  // Blue keyword, orange string
let users = [];  // Blue keyword, pink variable

// Yellow function name, blue keywords
async function fetchUsers() {
    try {  // Blue keyword
        const response = await fetch(`${apiUrl}/users`);  // Orange template string
        const data = await response.json();  // Yellow function
        return data;  // Blue keyword
    } catch (error) {  // Blue keyword, pink variable
        console.error('Error:', error);  // Yellow function, orange string
        throw error;  // Blue keyword
    }
}

// Arrow function with destructuring
const processUser = ({ id, name, email }) => {  // Pink variable, blue properties
    return {  // Blue keyword
        id,  // Blue property
        displayName: name.toUpperCase(),  // Yellow function
        contact: email || 'No email'  // Magenta operator, orange string
    };
};

// Class with cyan name
class User {
    constructor(name, email) {  // Yellow function, blue keyword
        this.name = name;  // Pink variable
        this.email = email;  // Pink variable
        this.createdAt = new Date();  // Cyan class, yellow function
    }
    
    static fromJson(json) {  // Blue keyword, yellow function
        return new User(json.name, json.email);  // Blue keyword, cyan class
    }
}
```

## CSS Example with Rainbow Colors

```css
/* Green comment */
:root {
    --primary-color: #007acc;  /* Blue property, orange value */
    --secondary-color: #f0f0f0;  /* Blue property, orange value */
    --border-radius: 8px;  /* Blue property, orange value */
}

.button {  /* Yellow selector */
    background: linear-gradient(45deg, var(--primary-color), #005a9e);  /* Blue property, purple function */
    color: white;  /* Blue property, orange value */
    border: none;  /* Blue property, orange value */
    padding: 12px 24px;  /* Blue property, orange values */
    transition: all 0.3s ease;  /* Blue property, orange values */
    cursor: pointer;  /* Blue property, orange value */
}

.button:hover {  /* Yellow selector with pseudo-class */
    transform: translateY(-2px);  /* Blue property, purple function */
    box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);  /* Blue property, purple function */
}

@media (max-width: 768px) {  /* Blue at-rule, orange value */
    .grid-container {  /* Yellow selector */
        grid-template-columns: 1fr;  /* Blue property, orange value */
        padding: 1rem;  /* Blue property, orange value */
    }
}
```

## HTML Example with Vibrant Markup

```html
<!DOCTYPE html>
<html lang="en">  <!-- Blue tags, blue attributes, orange values -->
<head>
    <meta charset="UTF-8">  <!-- Blue attribute, orange value -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Colorful Syntax Demo</title>  <!-- Blue tags, orange content -->
    <link rel="stylesheet" href="styles.css">  <!-- Blue attributes, orange values -->
</head>
<body class="main-content">  <!-- Blue attribute, orange value -->
    <header class="hero-section">  <!-- Blue attribute, orange value -->
        <h1 id="main-title">Welcome!</h1>  <!-- Blue attribute, orange value -->
        <p class="description">This is colorful HTML!</p>
    </header>
    
    <main role="main">  <!-- Blue attribute, orange value -->
        <section id="content" data-section="primary">  <!-- Blue attributes, orange values -->
            <button type="button" onclick="handleClick()">  <!-- Blue attributes, orange values -->
                Click Me!
            </button>
        </section>
    </main>
</body>
</html>
```

## JSON Example with Distinct Colors

```json
{
    "name": "colorful-syntax-demo",  
    "version": "1.0.0",  
    "description": "Demonstrating vibrant syntax highlighting",  
    "main": "index.js",  
    "scripts": {  
        "start": "node index.js",  
        "dev": "nodemon index.js",  
        "test": "jest --watch",  
        "build": "webpack --mode production"  
    },
    "dependencies": {  
        "express": "^4.18.0",  
        "cors": "^2.8.5",  
        "dotenv": "^16.0.0"  
    },
    "keywords": ["syntax", "highlighting", "colors"],  
    "author": "Developer",  
    "license": "MIT",  
    "repository": {  
        "type": "git",  
        "url": "https://github.com/user/repo.git"  
    },
    "private": false,  
    "engines": {  
        "node": ">=16.0.0",  
        "npm": ">=8.0.0"  
    }
}
```

Now you should see:
- **Green** comments
- **Blue** keywords and properties  
- **Orange** strings and numbers
- **Yellow** function names
- **Purple** built-in functions
- **Cyan** class names
- **Magenta** operators
- **Pink** variables
- And more vibrant colors for different syntax elements!

The colors will automatically adjust between light and dark modes for optimal readability.