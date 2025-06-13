---
title: Syntax Highlighting Demo
---

# Syntax Highlighting Demo

This page demonstrates various syntax highlighting examples with VS Code-like colors.

## Python Examples

```python
# This is a comment
def greet(name):
    """This function greets someone"""
    message = f"Hello, {name}!"
    print(message)
    return True

# Using the function
user_name = "World"
result = greet(user_name)

# Working with classes
class Calculator:
    def __init__(self):
        self.value = 0
    
    def add(self, num):
        self.value += num
        return self.value

# Numbers and operators
numbers = [1, 2, 3.14, 0xFF]
total = sum(numbers)
is_positive = total > 0
```

## JavaScript Examples

```javascript
// ES6+ features
const apiUrl = 'https://api.example.com';
const users = [];

async function fetchUsers() {
    try {
        const response = await fetch(`${apiUrl}/users`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

// Arrow functions and destructuring
const processUser = ({ id, name, email }) => {
    return {
        id,
        displayName: name.toUpperCase(),
        contact: email || 'No email provided'
    };
};

// Classes and inheritance
class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
        this.createdAt = new Date();
    }
    
    static fromJson(json) {
        return new User(json.name, json.email);
    }
}
```

## TypeScript Examples

```typescript
interface User {
    id: number;
    name: string;
    email?: string;
    roles: string[];
}

type UserRole = 'admin' | 'user' | 'guest';

class UserService {
    private users: User[] = [];
    
    constructor(private apiClient: ApiClient) {}
    
    async createUser<T extends User>(userData: Omit<T, 'id'>): Promise<T> {
        const newUser = {
            ...userData,
            id: Math.floor(Math.random() * 1000)
        } as T;
        
        this.users.push(newUser);
        return newUser;
    }
    
    findUsersByRole(role: UserRole): User[] {
        return this.users.filter(user => user.roles.includes(role));
    }
}

// Generic function example
function asyncMap<T, U>(
    items: T[], 
    mapper: (item: T) => Promise<U>
): Promise<U[]> {
    return Promise.all(items.map(mapper));
}
```

## CSS Examples

```css
/* Modern CSS with custom properties */
:root {
    --primary-color: #007acc;
    --secondary-color: #f0f0f0;
    --border-radius: 8px;
    --transition: all 0.3s ease;
}

.button {
    background: linear-gradient(45deg, var(--primary-color), #005a9e);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    padding: 12px 24px;
    transition: var(--transition);
    cursor: pointer;
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
}

/* Grid layout */
.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    padding: 2rem;
}

@media (max-width: 768px) {
    .grid-container {
        grid-template-columns: 1fr;
        padding: 1rem;
    }
}
```

## JSON Examples

```json
{
    "name": "my-project",
    "version": "1.0.0",
    "description": "A sample project with syntax highlighting",
    "main": "index.js",
    "scripts": {
        "start": "node index.js",
        "dev": "nodemon index.js",
        "test": "jest",
        "build": "webpack --mode production"
    },
    "dependencies": {
        "express": "^4.18.0",
        "cors": "^2.8.5",
        "dotenv": "^16.0.0"
    },
    "devDependencies": {
        "nodemon": "^2.0.15",
        "jest": "^28.0.0",
        "webpack": "^5.70.0"
    },
    "keywords": ["node", "express", "api"],
    "author": "Developer Name",
    "license": "MIT",
    "repository": {
        "type": "git",
        "url": "https://github.com/user/repo.git"
    }
}
```

## HTML Examples

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Syntax Highlighting Demo</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="main-header">
        <nav aria-label="Main navigation">
            <ul class="nav-list">
                <li><a href="#home" class="nav-link">Home</a></li>
                <li><a href="#about" class="nav-link">About</a></li>
                <li><a href="#contact" class="nav-link">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main class="content">
        <section id="hero" class="hero-section">
            <h1 class="hero-title">Welcome to Our Site</h1>
            <p class="hero-description">
                This is a demonstration of HTML syntax highlighting
                with proper semantic structure.
            </p>
            <button type="button" class="cta-button" onclick="handleClick()">
                Get Started
            </button>
        </section>
    </main>
    
    <script src="script.js" defer></script>
</body>
</html>
```

## Bash/Shell Examples

```bash
#!/bin/bash

# Environment setup
export NODE_ENV="production"
export PORT=3000
export DB_HOST="localhost"

# Function to check if service is running
check_service() {
    local service_name=$1
    if systemctl is-active --quiet "$service_name"; then
        echo "✅ $service_name is running"
        return 0
    else
        echo "❌ $service_name is not running"
        return 1
    fi
}

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Build the application
echo "Building application..."
npm run build

# Start services
services=("nginx" "postgresql" "redis")
for service in "${services[@]}"; do
    echo "Starting $service..."
    sudo systemctl start "$service"
    check_service "$service"
done

# Deploy application
if [ -f "docker-compose.yml" ]; then
    echo "Deploying with Docker Compose..."
    docker-compose up -d
else
    echo "Starting Node.js application..."
    pm2 start ecosystem.config.js
fi

echo "Deployment completed! 🚀"
```

## SQL Examples

```sql
-- Database schema creation
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Insert sample data
INSERT INTO users (username, email, password_hash) VALUES
    ('john_doe', 'john@example.com', '$2b$12$hashedpassword1'),
    ('jane_smith', 'jane@example.com', '$2b$12$hashedpassword2'),
    ('admin_user', 'admin@example.com', '$2b$12$hashedpassword3');

-- Complex query with joins and aggregations
SELECT 
    u.username,
    u.email,
    COUNT(p.id) as post_count,
    AVG(p.view_count) as avg_views,
    MAX(p.created_at) as latest_post
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.is_active = true
    AND u.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.username, u.email
HAVING COUNT(p.id) > 0
ORDER BY post_count DESC, avg_views DESC
LIMIT 10;

-- Update with conditional logic
UPDATE users 
SET 
    updated_at = CURRENT_TIMESTAMP,
    is_active = CASE 
        WHEN last_login < NOW() - INTERVAL '1 year' THEN false
        ELSE true
    END
WHERE id IN (
    SELECT id FROM users 
    WHERE created_at < NOW() - INTERVAL '2 years'
);
```

This demonstrates how proper language specification in code blocks enables rich syntax highlighting with different colors for keywords, strings, comments, functions, and other language elements.