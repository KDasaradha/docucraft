---
title: Next.js - Basic
---

# Next.js - Basic Concepts

Next.js is a popular open-source React framework for building full-stack web applications. It offers features like server-side rendering (SSR), static site generation (SSG), file-system based routing, API routes, image optimization, and more, making it a powerful choice for modern web development.

## Key Topics

### Introduction to Next.js
- **What it is**: A React framework providing structure, features, and optimizations for production-grade applications.
- **Key features**:
    - **Rendering Strategies**: Supports Server-Side Rendering (SSR), Static Site Generation (SSG), Incremental Static Regeneration (ISR), and Client-Side Rendering (CSR).
    - **Routing**: File-system based routing (Pages Router and App Router).
    - **API Routes/Route Handlers**: Easily create backend API endpoints.
    - **Developer Experience**: Fast refresh, built-in TypeScript support, ESLint integration.
    - **Performance**: Automatic code splitting, image optimization, font optimization.

### Project Setup: `create-next-app`
The recommended way to start a new Next.js project is by using `create-next-app`:
```bash
npx create-next-app@latest my-next-app
# Follow the prompts (e.g., TypeScript, ESLint, Tailwind CSS)
cd my-next-app
npm run dev
```
This command sets up a new Next.js project with a default structure and necessary dependencies.

### Pages Router vs. App Router (Basic Understanding)
Next.js has two main routing systems:
- **Pages Router**: The original routing system where files in the `pages` directory automatically become routes. (e.g., `pages/about.js` maps to `/about`).
- **App Router (Preferred for new projects)**: Introduced in Next.js 13, this system uses the `app` directory and leverages React Server Components. It offers more flexibility with layouts, nested routes, and server-first data fetching. (e.g., `app/dashboard/page.tsx` maps to `/dashboard`).

This guide will primarily focus on the **App Router**.

### App Router Basics (Preferred)

#### File-system Routing
- **`app` Directory**: Core of the App Router. Routes are defined by folders within this directory.
- **`page.tsx` (or `.js`)**: Special file that makes a route segment publicly accessible. The React component exported from `page.tsx` is rendered for that route.
  ```typescript jsx
  // app/about/page.tsx
  export default function AboutPage() {
    return <h1>About Us</h1>;
  }
  // This creates the /about route.
  ```
- **Route Segments**: Each folder in the `app` directory represents a route segment.
  - `app/dashboard/settings/page.tsx` maps to `/dashboard/settings`.

#### Layouts (`layout.tsx`) and Nested Layouts
- **`layout.tsx`**: A special file to define a UI that is shared across multiple pages. A layout accepts a `children` prop that will be populated with a child layout or a child page.
- **Root Layout**: The layout in `app/layout.tsx` is the root layout, required for all routes.
  ```typescript jsx
  // app/layout.tsx
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body>
          <nav>Global Navbar</nav>
          {children}
          <footer>Global Footer</footer>
        </body>
      </html>
    );
  }
  ```
- **Nested Layouts**: Layouts are nested by default. A layout in a subfolder (e.g., `app/dashboard/layout.tsx`) will wrap pages within that segment and be nested inside its parent layout(s).

#### Server Components and Client Components
- **Server Components (Default)**: Components in the App Router are React Server Components by default. They run on the server, can fetch data directly (using `async/await`), and do not send JavaScript to the client, leading to faster initial page loads.
- **Client Components (`"use client"`)**: To use React Hooks (like `useState`, `useEffect`), browser APIs, or event handlers, you must mark a component as a Client Component by adding the `"use client"` directive at the top of the file. These components are rendered on the server for the initial HTML (SSR/SSG) and then "hydrated" on the client to become interactive.
  ```typescript jsx
  // app/components/counter.tsx
  "use client"; // Marks this as a Client Component

  import { useState } from 'react';

  export default function Counter() {
    const [count, setCount] = useState(0);
    return (
      <div>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    );
  }
  ```

#### Linking and Navigation
- **`<Link>` Component**: Use the `next/link` component for client-side navigation between routes. This prevents full page reloads and provides a smoother user experience.
  ```typescript jsx
  // In a component
  import Link from 'next/link';

  function MyNav() {
    return (
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/about">About</Link></li>
        <li><Link href="/dashboard">Dashboard</Link></li>
      </ul>
    );
  }
  ```
- **`useRouter` Hook**: From `next/navigation`, this hook can be used in Client Components for programmatic navigation.
  ```typescript jsx
  // In a Client Component
  "use client";
  import { useRouter } from 'next/navigation';

  function GoHomeButton() {
    const router = useRouter();
    return <button onClick={() => router.push('/')}>Go Home</button>;
  }
  ```

### Basic Data Fetching in Server Components
Server Components can directly use `async/await` for data fetching. Next.js extends the native `fetch` API to provide automatic caching and revalidation.
```typescript jsx
// app/posts/page.tsx (Server Component by default)
async function getPosts() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5', {
    // next: { revalidate: 60 } // Optional: Revalidate data every 60 seconds (ISR)
    cache: 'no-store' // Optional: Opt-out of caching, always fetch fresh data
  });
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();
  return (
    <div>
      <h1>Posts</h1>
      <ul>
        {posts.map((post: any) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Static Assets: `public` Folder
Files in the `public` folder (e.g., images, favicons, `robots.txt`) are served statically from the root of your application.
- `public/my-image.png` is accessible at `/my-image.png`.

### CSS Styling
- **Global CSS**: Import CSS files in your root layout (`app/layout.tsx`). These styles apply globally.
  ```typescript jsx
  // app/layout.tsx
  import './globals.css'; // Your global stylesheet

  export default function RootLayout({ children }: { children: React.ReactNode }) { /* ... */ }
  ```
- **CSS Modules**: For component-scoped styles. Name files `[name].module.css`. Import the styles object and use it like `styles.className`.
  ```css
  /* app/components/Button.module.css */
  .primary {
    background-color: blue;
    color: white;
  }
  ```
  ```typescript jsx
  // app/components/Button.tsx
  import styles from './Button.module.css';

  export function Button({ children }: { children: React.ReactNode }) {
    return <button className={styles.primary}>{children}</button>;
  }
  ```
- **Tailwind CSS**: Popular utility-first CSS framework, often chosen during `create-next-app` setup.

### API Routes (App Router: Route Handlers)
Create backend API endpoints using Route Handlers. These are special files named `route.ts` (or `.js`) within the `app` directory. They export functions corresponding to HTTP methods (GET, POST, PUT, DELETE, etc.).
```typescript
// app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({ message: "Hello from API!" });
}

export async function POST(request: Request) {
  const data = await request.json();
  return NextResponse.json({ received: data, message: "Data received!" });
}
// This creates API endpoints at /api/hello for GET and POST requests.
```

### Running the Development Server and Building for Production
- **Development**: `npm run dev` (or `yarn dev`) starts the development server with fast refresh.
- **Production Build**: `npm run build` (or `yarn build`) creates an optimized production build of your application in the `.next` folder.
- **Start Production Server**: `npm start` (or `yarn start`) runs the production server using the build output.

These basic concepts form the foundation for building powerful applications with Next.js and its App Router.
