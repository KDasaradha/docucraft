---
title: Getting Started
---

# Getting Started with DevDocs++

Welcome to the Getting Started guide! This page will walk you through the basics of setting up and using DevDocs++.

## Prerequisites

Ensure you have Node.js (version 18.x or higher) and npm/yarn installed on your system.

## Installation (Conceptual)

If DevDocs++ were a package you could install (it's currently this demo application itself), you might do something like this:

```bash
# Using npm
npm install -g devdocs-cli

# Using yarn
yarn global add devdocs-cli
```

## Project Structure

A typical DevDocs++ project would have a structure similar to this:

```
my-docs/
├── content/
│   └── docs/                # Your Markdown files go here
│       ├── index.md
│       └── ...
├── public/
│   └── config.yml           # Site configuration
└── package.json
```

## Writing Content

Create your documentation pages as `.md` files within the `content/docs/` directory. You can use subdirectories to organize your content.

**Example: `content/docs/features/new-feature.md`**

```markdown
---
title: New Awesome Feature
---

# Documenting the New Awesome Feature

This feature allows users to do amazing things.

## How it works

```python
# example_script.py
def main():
    print("This is an awesome feature!")

if __name__ == "__main__":
    main()
```

## Configuration

To enable this feature, add the following to your `config.yml`:

```yaml
new_feature:
  enabled: true
  mode: "super"
```
This is a placeholder. The actual `config.yml` for DevDocs++ itself is in `public/config.yml`.
```

## Configuration

Site-wide settings, navigation, and theme options are managed in the `public/config.yml` file. Refer to the configuration documentation for more details.

## Running Locally

To preview your documentation site locally (within this demo environment):

1.  Ensure the Next.js development server is running:
    ```bash
    npm run dev
    ```
2.  Open your browser and navigate to `http://localhost:3000` (or the port specified).

## Building for Production

To generate the static site for deployment:

```bash
npm run build
```
The static files will be output to the `.next` directory (standard Next.js build output). You can then deploy this directory to any static hosting provider.
