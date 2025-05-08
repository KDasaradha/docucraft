
import { getDocumentContent } from '@/lib/docs';
import MarkdownRenderer from '@/components/docs/MarkdownRenderer';
import { siteConfig } from '@/config/site.config';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import { SidebarProvider } from '@/components/ui/sidebar';


// This is a basic structure. Styling needs to be applied.
export default async function NotFound() {
  let content = `
# 404 - Page Not Found

We're sorry, but the page you were looking for could not be found.
You can try heading back to the homepage.
  `;
  let docTitle = "Page Not Found";

  try {
    // The slug for custom_404.md would be ['custom_404'] relative to src/content/
    // However, getDocumentContent expects slugs relative to src/content/docs/
    // So we place custom_404.md in src/content/ and read it directly or adjust getDocumentContent.
    // For simplicity, let's assume custom_404.md is meant to be at src/content/docs/custom_404.md
    // If it's truly in src/content/, we'd need a separate reader or adjust getDocumentContent's base path.

    // For this implementation, we'll assume the file is at 'src/content/custom_404.md'
    // and read it directly without using getDocumentContent for simplicity,
    // as getDocumentContent is tailored for the 'docs' subdirectory.
    
    // A more robust solution might involve:
    // 1. Placing custom_404.md in src/content/docs/ so getDocumentContent can find it.
    // 2. Modifying getDocumentContent to accept a base directory parameter.
    // 3. Reading it directly (less ideal as it bypasses frontmatter parsing logic in getDocumentContent).

    // Let's try to use getDocumentContent by providing a slug that points to custom_404.md if it were in docs.
    // This is a bit of a workaround.
    const notFoundDocSlug = siteConfig.error_pages['404_page'].replace(/\.md$/, '');
    const doc = await getDocumentContent([notFoundDocSlug]);


    if (doc) {
      content = doc.content;
      docTitle = doc.title;
    } else {
        console.warn(`[NotFoundPage] Custom 404 markdown file "${siteConfig.error_pages['404_page']}" not found or failed to load. Using default content.`);
    }
  } catch (error) {
    console.error("Error loading custom 404 page content:", error);
  }

  return (
    <SidebarProvider defaultOpen={true}> {/* For header/footer consistency */}
        <div className="flex flex-col min-h-screen">
            <AppHeader /> {/* Assuming AppHeader doesn't need navigation items */}
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 pt-[var(--header-height)] text-center">
                <main className="container max-w-3xl">
                    <MarkdownRenderer content={content} />
                    <div className="mt-8">
                        <Button asChild variant="default">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Go to Homepage
                            </Link>
                        </Button>
                    </div>
                </main>
            </div>
            <AppFooter />
        </div>
    </SidebarProvider>
  );
}

export const metadata = {
  title: `Page Not Found | ${siteConfig.name}`,
};
