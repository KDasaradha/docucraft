---
title: Comprehensive Code Block Test
---

# Comprehensive Code Block Test

This page tests ALL possible code block formats to ensure syntax highlighting works everywhere.

## 1. Fenced Code Blocks with Language

```python
print("Hello World")
def greet(name):
    return f"Hello, {name}!"
```

```javascript
console.log("Hello World");
const greet = (name) => `Hello, ${name}!`;
```

```typescript
interface User {
    name: string;
    age: number;
}
const user: User = { name: "John", age: 30 };
```

## 2. Fenced Code Blocks WITHOUT Language

```
print("Hello World")
const message = "This should still be highlighted"
function test() { return true; }
```

```
// This is a comment
let x = 42;
console.log(x);
```

## 3. Indented Code Blocks (4 spaces)

    print("Hello World")
    def calculate(x, y):
        return x + y
    
    result = calculate(5, 3)
    print(result)

## 4. Inline Code

Here is some `inline code` and `print("Hello")` and `const x = 42`.

## 5. Mixed Content

Regular text with `inline code` and then a block:

```python
# This is Python
def hello():
    print("Hello World")
    return True
```

More text and then code without language:

```
function hello() {
    console.log("Hello World");
    return true;
}
```

## 6. HTML Code

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <h1>Hello World</h1>
    <script>
        console.log("Hello from HTML!");
    </script>
</body>
</html>
```

## 7. CSS Code

```css
.button {
    background-color: #007acc;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.button:hover {
    background-color: #005a9e;
    transform: translateY(-2px);
}
```

## 8. JSON Code

```json
{
    "name": "Test Project",
    "version": "1.0.0",
    "dependencies": {
        "react": "^18.0.0",
        "next": "^13.0.0"
    },
    "scripts": {
        "dev": "next dev",
        "build": "next build"
    }
}
```

## 9. Shell/Bash Code

```bash
#!/bin/bash
echo "Hello World"
npm install
npm run build
docker build -t myapp .
docker run -p 3000:3000 myapp
```

## 10. SQL Code

```sql
SELECT users.name, users.email, COUNT(posts.id) as post_count
FROM users
LEFT JOIN posts ON users.id = posts.user_id
WHERE users.active = true
GROUP BY users.id, users.name, users.email
ORDER BY post_count DESC
LIMIT 10;
```

## 11. Plain Text Block

```text
This is just plain text
No syntax highlighting expected
But should still have nice styling
With proper background and colors
```

## 12. Unknown Language

```unknownlang
// This language doesn't exist
but it should still get styled
with basic text colors
and proper code block appearance
```

All these code blocks should have:
- ✅ Consistent background colors and styling
- ✅ VS Code-like syntax highlighting where applicable
- ✅ Language badges in the top-right corner
- ✅ Copy buttons that appear on hover
- ✅ Line numbers (where enabled)
- ✅ Proper colors for all token types