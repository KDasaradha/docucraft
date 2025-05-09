---
title: Next.js - Hidden Gems
---

# Next.js - Hidden Gems & Lesser-Known Features

Key hidden gems and lesser-known Next.js features include:

- Route Handlers: `NextResponse.json()`, `NextResponse.redirect()`, working with `Request` objects.
- `redirect` and `notFound` functions for programmatic navigation/error handling in Server Components.
- `headers()` and `cookies()` functions for accessing request headers/cookies in Server Components.
- Using `searchParams` prop in page components for easy access to URL query parameters.
- `generateViewport` function for dynamic viewport configuration.
- `generateSitemaps` for creating multiple sitemaps.
- `instrumentation.ts` for OpenTelemetry and custom instrumentation.
- Route Segment Config options (e.g., `export const dynamic = 'force-dynamic'`).
- `@` (at-symbol) for absolute imports is configured by default.
- `next.config.js` options like `images.remotePatterns`, `experimental` flags.
- `beforeFiles` and `afterFiles` in `rewrites` for advanced routing control.
- Using `unstable_noStore` to opt-out of caching for specific data fetches.
- `taintObjectReference` and `taintUniqueValue` for experimental data tainting to prevent accidental client exposure.
