---
title: Getting Started
description: Learn how to set up and use DocuCraft for your projects. This guide covers prerequisites, installation, and basic configuration to get your documentation site up and running quickly.
order: 2
---

# Getting Started with DocuCraft

This comprehensive guide will walk you through setting up DocuCraft and creating your first documentation site. By the end, you'll have a fully functional documentation platform ready for your content.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher recommended)
- **pnpm** (our preferred package manager for faster, more efficient dependency management)

You can verify your installations by running:

```bash
node --version
pnpm --version
```

## Installation

Currently, DocuCraft is integrated into this project. To use it for your own documentation:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/docucraft.git my-docs
   cd my-docs
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Initialize your documentation structure:
   ```bash
   pnpm run init
   ```

## Project Structure

A typical DocuCraft project follows this structure:

```plaintext
.
├── src/
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── content/
│   │   └── docs/           # Your Markdown documentation files
│   │       ├── introduction.md
│   │       ├── getting-started.md
│   │       └── api/
│   │           ├── _index.md  # Represents the API folder in navigation
│   │           └── reference.md
│   ├── lib/                # Utility functions
│   └── styles/             # Global styles
├── public/                 # Static assets
├── config/                 # Configuration files
│   └── docucraft.config.js # Main configuration
└── package.json
```

## Configuration

DocuCraft can be configured through the `config/docucraft.config.js` file:

```javascript
// config/docucraft.config.js
module.exports = {
  // Site metadata
  title: 'My Project Documentation',
  description: 'Comprehensive documentation for My Project',
  
  // Navigation options
  navigation: {
    autoGenerate: true,  // Generate navigation from file structure
    depth: 3,            // Maximum nesting level
  },
  
  // Theme configuration
  theme: {
    primaryColor: '#008080',
    darkMode: true,
    logo: '/logo.svg',
  },
  
  // Search options
  search: {
    enabled: true,
    indexContent: true,
  }
};
```

## Writing Content

Documentation pages are written in Markdown and placed in the `src/content/docs` directory. You can organize your content into subdirectories to create a logical structure.

### Frontmatter

Each Markdown file can include YAML frontmatter to define metadata:

```yaml
---
title: My Awesome Page
description: A brief description of this page.
order: 1 # Lower numbers appear first in navigation
tags: [guide, beginner]
---

# Page Content

Your Markdown content goes here...
```

### Available Frontmatter Properties

| Property | Type | Description |
|----------|------|-------------|
| `title` | String | Page title (required) |
| `description` | String | Brief description for SEO and previews |
| `order` | Number | Position in navigation (lower numbers first) |
| `tags` | Array | Categorization tags for search and filtering |
| `draft` | Boolean | If true, page only shows in development |

### Folder Organization

To give a folder a title and order in the navigation, create an `_index.md` or `index.md` file within that folder:

```yaml
---
title: API Reference
description: Detailed API documentation
order: 3
---

# API Reference

This section contains detailed API documentation...
```

## Markdown Features

DocuCraft supports enhanced Markdown with:

- GitHub Flavored Markdown syntax
- Code blocks with syntax highlighting
- Tables, lists, and blockquotes
- Embedded images and diagrams
- Callouts for important information

### Code Block Example

```typescript
// This is a TypeScript code block with highlighting
function calculateTotal(items: Item[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}
```

### Callout Example

> [!NOTE]
> This is a note callout for important information.

> [!WARNING]
> This is a warning callout for critical information.

## Running the Development Server

To start the development server:

```bash
pnpm dev
```

This will start the Next.js development server on `http://localhost:9002`. The development server includes:

- Hot reloading for instant feedback
- Error highlighting
- Development-only features

## Building for Production

To build your static documentation site:

```bash
pnpm build
```

The output will be in the `.next` directory. You can then deploy this to any static hosting provider like Vercel, Netlify, or GitHub Pages.

## Deployment

DocuCraft generates static sites that can be deployed anywhere. Here are some common deployment options:

### Vercel (Recommended)

```bash
pnpm install -g vercel
vercel
```

### Netlify

Create a `netlify.toml` file:

```toml
[build]
  command = "pnpm build"
  publish = ".next"
```

### GitHub Pages

Use the GitHub Actions workflow provided in the repository.

## Next Steps

Now that you have DocuCraft set up, you might want to:

1. Customize the theme to match your brand
2. Add your documentation content
3. Configure navigation to suit your structure
4. Set up a custom domain for your documentation

Check out the [Customization](../customization/theming) guide for more advanced configuration options.