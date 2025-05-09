---
title: Next.js - Intermediate
---

# Next.js - Intermediate Concepts

Key topics for intermediate Next.js include:

- **App Router In-depth:**
    - Route Groups `(group)` for organization
    - Dynamic Routes (`[slug]`, `[...catchAll]`, `[[...optionalCatchAll]]`)
    - `loading.tsx` and `error.tsx` files for UI boundaries
    - `template.tsx` vs `layout.tsx`
    - Parallel Routes and Intercepting Routes
    - Server Actions for form submissions and data mutations
    - Streaming UI with Suspense
- Data Fetching Strategies:
    - Server-Side Rendering (SSR) - dynamic rendering
    - Static Site Generation (SSG) - `generateStaticParams`
    - Incremental Static Regeneration (ISR) - `revalidate` option
    - Client-side data fetching (e.g., SWR, React Query) in Client Components
- Image Optimization (`next/image` component)
- Font Optimization (`next/font`)
- Environment Variables
- Middleware (`middleware.ts`)
- Route Handlers in-depth (Request and Response objects, dynamic handlers)
- SEO: Metadata API (`generateMetadata` function, static `metadata` object)
- Internationalization (i18n) routing and setup
