---
title: Introduction to DocuCraft
description: >-
  Welcome to DocuCraft, a modern documentation platform designed for developers
  seeking clarity, speed, and customization in their technical documentation.
order: 1
---

# Introduction to DocuCraft

DocuCraft is a **modern, lightweight, and highly customizable** static site generator specifically designed for technical documentation. Built with the developer experience in mind, it aims to provide a clean, readable, and intuitive platform for both creating and consuming documentation.

## What Sets DocuCraft Apart

In a landscape filled with documentation tools, DocuCraft distinguishes itself through:

- **Developer-First Philosophy**: Every feature is designed with developers' needs at the forefront
- **Minimal Configuration**: Get started quickly without extensive setup
- **Maximum Flexibility**: Customize nearly every aspect when you need to
- **Performance Focus**: Lightning-fast page loads and optimized build times
- **Modern Tech Stack**: Built on Next.js, React, and TypeScript for a future-proof foundation

## Key Features

### Content Creation

- **Markdown-based**: Write content in familiar GitHub-Flavored Markdown with extended capabilities
- **MDX Support**: Embed React components directly in your documentation when needed
- **Frontmatter Control**: Organize and configure pages with simple YAML frontmatter
- **Asset Management**: Easily include images, diagrams, and other media with automatic optimization

### User Experience

- **Clean UI/UX**: Minimalist design with a focus on readability and reduced cognitive load
- **Customizable Theming**: Flexible light/dark modes with customizable color schemes
- **Responsive Design**: Perfect viewing experience across all devices and screen sizes
- **Accessibility**: WCAG-compliant components and keyboard navigation support

### Developer Tools

- **Syntax Highlighting**: Beautiful code blocks with support for 100+ programming languages
- **Code Tabs**: Switch between different code examples (e.g., different languages) in the same block
- **API Documentation**: Specialized components for API reference documentation
- **Diagrams as Code**: Create diagrams using Mermaid.js syntax directly in your Markdown

### Performance & Search

- **Intelligent Search**: Quickly find content with fuzzy matching and keyword highlighting
- **Fast Builds**: Optimized build process for quick development and deployment
- **Incremental Generation**: Only rebuild what changes for efficient updates
- **Optimized Assets**: Automatic image optimization and code splitting

## Why DocuCraft?

Existing documentation tools like Docusaurus, MkDocs, or Nextra are powerful, but can sometimes feel heavy or lack specific customization options that developers need. DocuCraft strives to be a "better" alternative by focusing on:

1. **Simplicity Without Sacrifice**: Easy to use without giving up powerful features
2. **Performance by Default**: Optimized for speed without requiring manual tuning
3. **Extensibility**: A plugin system that allows for custom functionality
4. **Community-Driven**: Built by developers, for developers, with active community input

## Code Examples

DocuCraft provides beautiful syntax highlighting for numerous programming languages:

```typescript
// TypeScript example
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

function getUserPermissions(user: User): string[] {
  const permissions: string[] = ['read'];
  
  switch (user.role) {
    case 'admin':
      return [...permissions, 'write', 'delete', 'manage'];
    case 'user':
      return [...permissions, 'write'];
    default:
      return permissions;
  }
}

// Usage
const currentUser: User = {
  id: 'u123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: 'admin'
};

console.log(getUserPermissions(currentUser));
// Output: ['read', 'write', 'delete', 'manage']
```

```python
# Python example
class DocumentationGenerator:
    """A class for generating documentation from code."""
    
    def __init__(self, source_dir, output_dir):
        self.source_dir = source_dir
        self.output_dir = output_dir
        self.files_processed = 0
    
    def generate(self, format='markdown'):
        """Generate documentation in the specified format.
        
        Args:
            format (str): Output format ('markdown', 'html', or 'pdf')
            
        Returns:
            int: Number of files processed
        """
        print(f"Generating {format} documentation...")
        
        # Implementation details...
        self.files_processed = 42
        
        return self.files_processed

# Usage
generator = DocumentationGenerator('./src', './docs')
files = generator.generate(format='markdown')
print(f"Processed {files} files")
```

## Interactive Components

DocuCraft supports interactive components through MDX integration:

```jsx
<Tabs>
  <Tab label="npm">
    npm install docucraft
  </Tab>
  <Tab label="yarn">
    yarn add docucraft
  </Tab>
  <Tab label="pnpm">
    pnpm add docucraft
  </Tab>
</Tabs>
```

## Document Organization

DocuCraft makes it easy to organize your documentation with:

- **Hierarchical Navigation**: Nested sections for logical content organization
- **Automatic Table of Contents**: Generated for each page based on headings
- **Related Pages**: Suggestions for further reading based on content relationships
- **Versioned Documentation**: Support for multiple versions of your documentation

## Getting Started

Ready to try DocuCraft? Check out the [Getting Started](./getting-started) guide to begin your documentation journey.

## Example Content Structure

- **Guides**: Step-by-step instructions for common tasks
  - Installation Guide
  - Configuration Guide
  - Deployment Guide
- **Concepts**: Explanations of core concepts and architecture
  - Architecture Overview
  - Design Principles
  - Core Components
- **API Reference**: Detailed API documentation
  - Endpoints
  - Parameters
  - Response Formats
- **Examples**: Code examples and use cases
  - Basic Examples
  - Advanced Examples
  - Real-world Applications