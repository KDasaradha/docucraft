# 🚀 DocuCraft

[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **A modern, comprehensive documentation platform for developers** - Built with Next.js, TypeScript, and AI-powered features. Transform your technical documentation into an engaging, searchable, and beautifully designed knowledge hub.

---

## ✨ Features

### 🎨 **Modern Design**
- **Beautiful UI/UX** - Clean, professional interface inspired by GitBook and MkDocs
- **Responsive Design** - Seamless experience across all devices
- **Dark/Light Mode** - Automatic theme switching with system preference detection
- **Professional Typography** - Optimized for readability and code presentation

### 📚 **Content Management**
- **Markdown-First** - Write documentation in familiar Markdown format
- **Syntax Highlighting** - Beautiful code blocks with Prism.js integration
- **Enhanced Code Blocks** - Copy functionality, language detection, and line numbers
- **Table of Contents** - Auto-generated navigation for long documents
- **Cross-References** - Internal linking and navigation between docs

### 🔍 **Advanced Search**
- **Fast Search** - Instant content discovery across all documentation
- **Multiple Search Interfaces** - Header, sidebar, compact, and professional search dialogs
- **Keyboard Shortcuts** - Quick access with customizable hotkeys
- **Content Indexing** - Comprehensive search across titles, content, and metadata

### 🤖 **AI Integration**
- **Google AI (Genkit)** - Powered by advanced AI capabilities
- **Intelligent Content** - AI-assisted documentation features
- **Development Flows** - Automated development assistance
- **Smart Navigation** - AI-enhanced content discovery

### 🛠️ **Developer Experience**
- **TypeScript First** - Full type safety and IntelliSense support
- **Component-Based** - Modular architecture with reusable components
- **Hot Reload** - Instant development feedback with Turbopack
- **Error Boundaries** - Graceful error handling and user feedback
- **Performance Optimized** - Built for speed and scalability

### 📱 **Navigation & UX**
- **Intelligent Sidebar** - Collapsible navigation with section organization
- **Reading Progress** - Visual progress indicator for long documents
- **Mobile-First** - Touch-friendly navigation and responsive breakpoints
- **Keyboard Navigation** - Full accessibility support
- **Enhanced Routing** - Smooth transitions and deep linking

---

## 🏗️ **Architecture**

DocuCraft is built with modern web technologies and follows best practices for maintainability and performance:

```
📁 src/
├── 📁 app/              # Next.js App Router
├── 📁 components/       # Reusable UI components
│   ├── 📁 docs/         # Documentation-specific components
│   ├── 📁 layout/       # Layout components (header, footer, sidebar)
│   ├── 📁 search/       # Search functionality
│   ├── 📁 shared/       # Common components
│   └── 📁 ui/           # shadcn/ui components
├── 📁 content/          # Markdown documentation files
│   └── 📁 docs/         # Organized documentation content
├── 📁 config/           # Site configuration
├── 📁 hooks/            # Custom React hooks
├── 📁 lib/              # Utility functions and helpers
└── 📁 ai/               # AI integration and flows
```

---

## 🚀 **Quick Start**

### Prerequisites
- **Node.js** 18.0 or later
- **pnpm** (recommended) or npm
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KDasaradha/docucraft.git
   cd docucraft
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:9002
   ```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration (if using Firebase features)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Google AI Configuration
GOOGLE_AI_API_KEY=your_google_ai_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:9002
```

---

## 📖 **Documentation Content**

DocuCraft organizes documentation into logical sections:

### 🎯 **Core Sections**
- **General Documentation** - Getting started guides and introduction
- **Skills & Knowledge** - Developer skills and learning resources  
- **API Fundamentals** - REST API principles and best practices
- **FastAPI** - Comprehensive FastAPI documentation and guides
- **Database Technologies** - SQLAlchemy, PostgreSQL, MongoDB guides
- **Frontend Technologies** - React, Next.js, HTML, CSS, JavaScript
- **DevOps & Deployment** - CI/CD, containerization, cloud deployment

### 📋 **Content Types**
- **Tutorials** - Step-by-step learning guides
- **References** - API documentation and code examples
- **Guides** - Best practices and architectural patterns
- **Quests** - Progressive learning challenges
- **Code Examples** - Real-world implementation samples

---

## ⚙️ **Configuration**

### Site Configuration
Edit `src/config/site.config.ts` to customize your documentation site:

```typescript
export const siteConfig = {
  name: "Your Documentation Site",
  fullName: "Your Full Site Name", 
  description: "Your site description",
  author: "Your Name",
  url: "https://your-domain.com",
  repo: {
    name: "your-repo",
    url: "https://github.com/username/repo",
    edit_uri: "edit/main/src/content/docs/",
  },
  // ... more configuration options
};
```

### Navigation Setup
Customize navigation in `src/config/navigation.ts`:

```typescript
export const navigation = [
  {
    title: "Getting Started",
    href: "/docs/general/getting-started",
    items: [
      // ... sub-navigation items
    ]
  },
  // ... more sections
];
```

---

## 🛠️ **Development**

### Available Scripts

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm dev:genkit       # Start AI development server

# Building
pnpm build            # Build for production
pnpm build:force      # Force build ignoring errors
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm typecheck        # TypeScript type checking
```

### Adding Content

1. **Create a new markdown file** in `src/content/docs/`
2. **Add frontmatter** with title and description
3. **Update navigation** in `src/config/navigation.ts`
4. **Test locally** with `pnpm dev`

Example document structure:
```markdown
---
title: Your Document Title
description: Brief description of the content
---

# Your Document Title

Your content here...
```

### Custom Components

DocuCraft includes custom components for enhanced documentation:

```jsx
import { CodeBlock } from '@/components/docs/EnhancedCodeBlock';
import { TableOfContents } from '@/components/docs/TableOfContents';

// Use in your documentation
<CodeBlock language="typescript" showLineNumbers>
  // Your code here
</CodeBlock>
```

---

## 🎨 **Customization**

### Theming
- Built on **Tailwind CSS** for easy customization
- **CSS Variables** for consistent color schemes
- **shadcn/ui** components for cohesive design
- **Custom animations** with Framer Motion

### Styling
Edit `src/app/globals.css` and `tailwind.config.ts` to customize the appearance:

```css
/* Custom CSS variables */
:root {
  --primary: your-primary-color;
  --secondary: your-secondary-color;
  /* ... more variables */
}
```

---

## 🔧 **Tech Stack**

### **Core Technologies**
- **[Next.js 15.2.3](https://nextjs.org/)** - React framework with App Router
- **[React 18.3.1](https://reactjs.org/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 3.4.1](https://tailwindcss.com/)** - Utility-first CSS

### **UI & Components**
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React components
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible components
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

### **Content & Markdown**
- **[Gray Matter](https://github.com/jonschlinkert/gray-matter)** - Frontmatter parsing
- **[React Markdown](https://github.com/remarkjs/react-markdown)** - Markdown rendering
- **[Prism.js](https://prismjs.com/)** - Syntax highlighting
- **[Remark GFM](https://github.com/remarkjs/remark-gfm)** - GitHub Flavored Markdown

### **AI & Advanced Features**
- **[Google AI (Genkit)](https://firebase.google.com/products/genkit)** - AI integration
- **[TanStack Query](https://tanstack.com/query)** - Data fetching and caching
- **[Firebase](https://firebase.google.com/)** - Backend services (optional)

---

## 📊 **Performance**

DocuCraft is optimized for performance:

- **⚡ Fast Loading** - Next.js optimization and code splitting
- **🔍 SEO Ready** - Server-side rendering and meta tags
- **📱 Mobile Optimized** - Responsive design and touch interactions
- **♿ Accessible** - WCAG compliant with keyboard navigation
- **🚀 Edge Ready** - Deployable to Vercel Edge Network

---

## 🚀 **Deployment**

### Vercel (Recommended)
1. **Connect your repository** to Vercel
2. **Configure environment variables**
3. **Deploy automatically** on push to main branch

### Manual Deployment
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **[Next.js](https://nextjs.org/)** - The React framework for production
- **[Vercel](https://vercel.com/)** - Deployment and hosting platform
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful and accessible components
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[MkDocs](https://www.mkdocs.org/)** - Inspiration for documentation structure

---

## 📞 **Support & Contact**

- **📧 Email** - [kdasaradha525@gmail.com](mailto:kdasaradha525@gmail.com)
- **🐙 GitHub** - [@KDasaradha](https://github.com/KDasaradha)
- **💼 LinkedIn** - [Connect with me](https://www.linkedin.com/in/dasaradha-rami-reddy-kesari-b8471417b)
- **🌐 Website** - [https://night-fury.vercel.app](https://night-fury.vercel.app)

---

<div align="center">
  <p><strong>Built with ❤️ by <a href="https://github.com/KDasaradha">KDasaradha</a></strong></p>
  <p><em>Making documentation beautiful, one commit at a time.</em></p>
</div>
