---
title: Advanced Topics
---

# Advanced Topics in DevDocs++

This section covers more advanced customization and features of DevDocs++.

## Customizing the Theme

DevDocs++ uses Tailwind CSS and CSS variables for theming. You can customize the theme by:

1.  **Modifying `tailwind.config.ts`**: Adjust base colors, fonts, and other Tailwind settings.
2.  **Overriding CSS Variables**: In `src/app/globals.css`, you can modify the HSL values for light and dark themes defined in the `:root` and `.dark` selectors.

   ```css
   /* Example: Changing the primary color for light theme */
   :root {
     --primary: 210 40% 50%; /* A new blue shade */
     /* ... other variables */
   }
   ```

## Adding Custom Components to Markdown

While DevDocs++ uses server-side rendering for Markdown to HTML (including syntax highlighting), if you needed to embed custom React components within your Markdown (a more advanced feature typically requiring MDX), you would:

1.  Install an MDX processor for Next.js (e.g., `@next/mdx`).
2.  Configure Next.js to handle `.mdx` files.
3.  Import and use your custom React components directly in your `.mdx` files.

```mdx
---
title: Page with Custom Component
---
import { MyCustomButton } from '@/components/my-custom-button';

# Using Custom Components

Here is a custom button:

<MyCustomButton label="Click Me!" />
```
**Note**: This demo primarily focuses on Markdown rendering. Full MDX support is an extension.

## Search Indexing

DevDocs++ uses Lunr.js for client-side search. The search index is built from all your Markdown files.

- The content in `rawContent` (from `src/lib/markdown.ts`) is indexed.
- Titles are given a higher boost in search results.

For very large documentation sites, consider server-side search solutions like Algolia or MeiliSearch for better performance. This would involve:
- A build step to push your content to the search service.
- Modifying the `SearchBar` component to query the external service API.

## Extending Navigation

The navigation menu is generated from `public/config.yml`. You can create nested structures:

```yaml
nav:
  - title: Basics
    children:
      - title: Introduction
        path: intro
      - title: Installation
        path: installation
  - title: API Reference
    path: api/index
```

## Syntax Highlighting Themes

Syntax highlighting is handled by `rehype-prism-plus`. To change the PrismJS theme:

1.  Currently, DevDocs++ uses a theme implicitly styled by `globals.css` and Tailwind.
2.  To use a specific PrismJS theme (e.g., `prism-okaidia.css`, `prism-tomorrow.css`):
    - Install the theme: `npm install prismjs` (if not already, though `rehype-prism-plus` might include it).
    - Import the desired CSS file in `src/app/layout.tsx` or `src/app/globals.css`. For example, in `globals.css`:
      ```css
      @import 'prismjs/themes/prism-tomorrow.css';
      ```
    - You might need to adjust your Tailwind configuration or custom styles to ensure compatibility, especially regarding background colors of code blocks. The `CodeBlock` component styles should also be considered.

## Deployment

Since DevDocs++ is a Next.js application, you can deploy it to any platform that supports Node.js or static site hosting (if fully exported).

- **Vercel**: Ideal for Next.js, offers seamless deployment.
- **Netlify**: Good for static sites and Next.js.
- **AWS Amplify, Google Firebase, Azure Static Web Apps**: Other cloud options.
- **Self-hosted**: Deploy on your own server using Node.js.

For a fully static export (if all pages are SSG-compatible):
```bash
npm run build
# then, if your next.config.js has `output: 'export'`
# npx serve out
```
However, this demo uses dynamic routes and server components, so a Node.js environment is generally preferred for deployment unless fully optimized for export.
