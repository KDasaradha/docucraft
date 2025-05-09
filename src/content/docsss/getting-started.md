---
title: Getting Started
description: Learn how to set up and use DocuCraft for your projects. This guide covers prerequisites, installation, and basic configuration.
order: 2
---

This guide will walk you through setting up DocuCraft and creating your first documentation site.

## Prerequisites

Ensure you have Node.js and pnpm installed on your system.

- Node.js (v18 or higher recommended)
- pnpm

## Installation

Currently, DocuCraft is integrated into this project. To "install" or use it, you would typically:

1.  Clone the repository (if it were a standalone tool).
2.  Navigate to the project directory.
3.  Install dependencies:
    ```bash
    pnpm install
    ```

## Project Structure

A typical DocuCraft project (or this app's content structure) might look like this:

```plaintext
.
├── src/
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── content/
│   │   └── docs/           # Your Markdown documentation files
│   │       ├── introduction.md
│   │       └── api/
│   │           └── _index.md  # Represents the API folder
│   │           └── reference.md
│   ├── lib/                # Utility functions
│   └── ...
├── public/                 # Static assets
└── package.json
```

## Writing Content

Documentation pages are written in Markdown and placed in the `src/content/docs` directory. You can organize your content into subdirectories.

### Frontmatter

Each Markdown file can include YAML frontmatter to define metadata like title, description, and display order:

```yaml
---
title: My Awesome Page
description: A brief description of this page.
order: 1 # Lower numbers appear first in navigation
---

# Page Content

Your Markdown content goes here...
```

### Folder Representation

To give a folder a title and order in the navigation, create an `_index.md` or `index.md` file within that folder. For example, `src/content/docs/api/_index.md` would define the "API" section in the navigation.

## Running the Development Server

To start the development server:

```bash
pnpm dev
```

This will typically start the Next.js development server, usually on `http://localhost:9002`.

## Building for Production

To build your static documentation site:

```bash
pnpm build
```

The output will be in the `.next` directory (standard Next.js build output). You can then deploy this to any static hosting provider.
