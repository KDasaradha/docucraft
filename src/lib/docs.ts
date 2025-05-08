import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export interface NavItem {
  title: string;
  href: string;
  order?: number;
  items?: NavItem[];
}

const contentDir = path.join(process.cwd(), 'src', 'content', 'docs');
const rootContentDir = path.join(process.cwd(), 'src', 'content'); // For files like custom_404.md

async function getNavItemsRecursive(currentPath: string, basePath: string = ''): Promise<NavItem[]> {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  const items: NavItem[] = [];

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name);
    const relativePath = basePath ? path.join(basePath, entry.name) : entry.name;
    const hrefSafeRelativePath = relativePath.replace(/\\/g, '/');


    if (entry.isDirectory()) {
      let folderTitle = entry.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      let folderOrder = Infinity;
      let folderHref = `/docs/${hrefSafeRelativePath}`; 
      
      const indexMdPath = path.join(fullPath, 'index.md');
      const underscoreIndexMdPath = path.join(fullPath, '_index.md');
      
      let indexFileContentString: string | null = null;

      try {
        if ((await fs.stat(indexMdPath).catch(() => null))?.isFile()) {
          indexFileContentString = await fs.readFile(indexMdPath, 'utf-8');
        } else if ((await fs.stat(underscoreIndexMdPath).catch(() => null))?.isFile()) {
          indexFileContentString = await fs.readFile(underscoreIndexMdPath, 'utf-8');
        }
        
        if (indexFileContentString) {
            const { data } = matter(indexFileContentString);
            if (data.title) folderTitle = data.title;
            if (data.order !== undefined) folderOrder = Number(data.order);
        }
      } catch (e) { /* ignore, use defaults */ }
      
      items.push({
        title: folderTitle,
        href: folderHref,
        order: folderOrder,
        items: await getNavItemsRecursive(fullPath, hrefSafeRelativePath),
      });

    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const isIndexFile = entry.name === 'index.md' || entry.name === '_index.md';

      if (isIndexFile) {
        // If it's an index file directly under src/content/docs, it defines the /docs root page.
        if (currentPath === contentDir) {
          const fileContentString = await fs.readFile(fullPath, 'utf-8');
          const { data } = matter(fileContentString);
          const title = data.title || "Documentation Home"; // Default title for root /docs page
          const order = data.order !== undefined ? Number(data.order) : -Infinity; // Ensure it comes first
          items.push({
            title,
            href: '/docs', // This should be the href for the root docs page
            order,
          });
        }
        // For index files in subdirectories, they are handled by the directory logic above (href will be /docs/subdir)
        continue;
      }

      const fileContentString = await fs.readFile(fullPath, 'utf-8');
      const { data } = matter(fileContentString);
      const title = data.title || entry.name.replace(/\.md$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const order = data.order !== undefined ? Number(data.order) : Infinity;
      const pageSlug = hrefSafeRelativePath.replace(/\.md$/, '');
      
      items.push({
        title,
        // Ensure hrefs like /docs/page (not /docs/subfolder/index if it's an index file for the subfolder)
        href: pageSlug === '_index' || pageSlug === 'index' ? `/docs/${basePath}` : `/docs/${pageSlug}`,
        order,
      });
    }
  }
  
  // Sort items by order, then alphabetically by title
  return items.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.title.localeCompare(b.title));
}

export async function getNavigation(): Promise<NavItem[]> {
  return getNavItemsRecursive(contentDir);
}

export interface DocResult {
  content: string; // The actual Markdown content (body)
  title: string;
  description?: string;
  filePath: string; // Full path to the .md file
}

export async function getDocumentContent(slug: string[]): Promise<DocResult | null> {
  const originalSlugForLog = slug.join('/');
  // Determine if we're trying to load a special custom page (e.g., custom_404.md)
  const isCustomPage = slug.length === 1 && (slug[0] === 'custom_404');
  const currentContentDir = isCustomPage ? rootContentDir : contentDir;
  
  // Make a mutable copy of the slug array for processing
  let processedSlugArray = [...slug]; 

  // Handle cases where 'docs' might be incorrectly part of the slug array
  // e.g. if slug is ['docs', 'introduction'], it should be ['introduction']
  // e.g. if slug is ['docs'], it should be [] (for root /docs page)
  if (processedSlugArray.length > 0 && processedSlugArray[0].toLowerCase() === 'docs') {
    processedSlugArray.shift();
  }

  const currentSlugPath = processedSlugArray.join('/'); 
  const baseFilePathWithoutExt = path.join(currentContentDir, currentSlugPath);

  let actualFilePath: string | undefined;
  let isDirectoryAttempt = false;
  
  try {
    // Check if the path is a directory.
    // If so, look for index.md or _index.md inside it.
    const stats = await fs.stat(baseFilePathWithoutExt).catch(() => null);
    if (stats && stats.isDirectory()) {
      isDirectoryAttempt = true;
      const indexMdPath = path.join(baseFilePathWithoutExt, 'index.md');
      const underscoreIndexMdPath = path.join(baseFilePathWithoutExt, '_index.md');

      if ((await fs.stat(indexMdPath).catch(() => null))?.isFile()) {
        actualFilePath = indexMdPath;
      } else if ((await fs.stat(underscoreIndexMdPath).catch(() => null))?.isFile()) {
        actualFilePath = underscoreIndexMdPath;
      }
    }

    // If not a directory or no index file found, try adding .md extension to the path.
    if (!actualFilePath) {
      const mdFilePath = baseFilePathWithoutExt + '.md';
      if ((await fs.stat(mdFilePath).catch(() => null))?.isFile()) {
        actualFilePath = mdFilePath;
      }
    }
    
    // Special case: If slug is empty (i.e., for /docs root), try to load index.md or _index.md from contentDir.
    if (processedSlugArray.length === 0 && !actualFilePath && !isCustomPage) { 
        const rootIndexMdPath = path.join(contentDir, 'index.md'); 
        const rootUnderscoreIndexMdPath = path.join(contentDir, '_index.md'); 
        if ((await fs.stat(rootIndexMdPath).catch(()=>null))?.isFile()) {
            actualFilePath = rootIndexMdPath;
        } else if ((await fs.stat(rootUnderscoreIndexMdPath).catch(()=>null))?.isFile()) {
            actualFilePath = rootUnderscoreIndexMdPath;
        }
    }


    if (actualFilePath) {
      const fileContentString = await fs.readFile(actualFilePath, 'utf-8');
      const { data, content: bodyContent } = matter(fileContentString);
      
      // Determine title: use frontmatter, or derive from filename/directory.
      let title = data.title;
      if (!title) {
        const fileName = path.basename(actualFilePath, '.md');
        // For non-index files, use the slug segment or filename.
        if (fileName !== 'index' && fileName !== '_index' && processedSlugArray.length > 0 && processedSlugArray[processedSlugArray.length -1] !== '') {
           title = processedSlugArray[processedSlugArray.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else if (fileName !== 'index' && fileName !== '_index') { // File not an index, but at root or custom_404
            title = fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else { // It's an index file (index.md or _index.md)
            // Try to get title from parent directory name.
            const parentDirName = path.basename(path.dirname(actualFilePath));
            const grandParentDirName = path.basename(path.dirname(path.dirname(actualFilePath))); // To check if parent is 'docs'

            if (parentDirName !== 'docs' && parentDirName !== 'content') { // If parent is a content subdir
                 title = parentDirName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            } else if (grandParentDirName !== 'content' && path.dirname(actualFilePath) === contentDir) { // If index.md is in src/content/docs
                title = data.site_name || "Documentation Home"; // Use site_name from frontmatter or a default.
            } else { // Fallback (e.g. for custom_404.md in src/content/)
                title = data.site_name || "Documentation"; // General fallback
            }
        }
      }
      
      return {
        content: bodyContent,
        title,
        description: data.description,
        filePath: actualFilePath, // Return the actual file path found
      };
    }
    
    // If no file was found after all checks, log and return null.
    console.warn(`[DocuCraft] Document not found. Original Slug: '${originalSlugForLog}', Processed Slug Array: '${processedSlugArray.join('/')}', CurrentContentDir: '${currentContentDir}', Base path tried: '${baseFilePathWithoutExt}', IsDirAttempt: ${isDirectoryAttempt}`);
    return null;
  } catch (error) {
    console.error(`[DocuCraft] Error in getDocumentContent for original slug "${originalSlugForLog}":`, error);
    return null;
  }
}


// Function to get all possible markdown file paths for generateStaticParams.
// It returns an array of slug arrays, e.g., [['introduction'], ['api', 'reference']].
export async function getAllMarkdownPaths(): Promise<string[][]> {
  const paths: string[][] = [];
  async function findMarkdownFiles(dir: string, currentSlugs: string[] = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    const isRootDocsDir = dir === contentDir;

    // For subdirectories: if it has an index.md or _index.md, add the directory path to `paths`.
    // This represents a page for the directory itself (e.g., /docs/api).
    if (!isRootDocsDir) { 
        const indexMdPath = path.join(dir, 'index.md');
        const underscoreIndexMdPath = path.join(dir, '_index.md');
        if ((await fs.stat(indexMdPath).catch(()=>null))?.isFile() || (await fs.stat(underscoreIndexMdPath).catch(()=>null))?.isFile()) {
            paths.push([...currentSlugs]); 
        }
    } else { // For the root /docs directory (contentDir)
        // If there's an index.md or _index.md, add an empty array `[]` to paths.
        // This represents the root /docs page.
        const rootIndexMdPath = path.join(dir, 'index.md');
        const rootUnderscoreIndexMdPath = path.join(dir, '_index.md');
         if ((await fs.stat(rootIndexMdPath).catch(()=>null))?.isFile() || (await fs.stat(rootUnderscoreIndexMdPath).catch(()=>null))?.isFile()) {
            paths.push([]); // Represents the root /docs page
        }
    }

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Recursively search in subdirectories.
        await findMarkdownFiles(entryPath, [...currentSlugs, entry.name]);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // For regular .md files (not index files), add their path to `paths`.
        if (entry.name !== 'index.md' && entry.name !== '_index.md') {
            paths.push([...currentSlugs, entry.name.replace(/\.md$/, '')]);
        }
      }
    }
  }
  await findMarkdownFiles(contentDir);
  return paths;
}

// Helper to get all content as a single string for AI search.
export async function getAllDocumentationContent(): Promise<string> {
  const allPaths = await getAllMarkdownPaths();
  let combinedContent = "";
  for (const slugArray of allPaths) {
    const doc = await getDocumentContent(slugArray); // Use the processed slug array
    if (doc) {
      // Construct a user-friendly path for display in search results
      const pagePath = slugArray.length > 0 ? slugArray.join('/') : '(root)';
      combinedContent += `\n\n## Page: /docs/${pagePath} (Title: ${doc.title})\n\n${doc.content}`;
    }
  }
  return combinedContent;
}

// Gets the path of the first document in the navigation.
// This is used for the homepage redirect.
export async function getFirstDocPath(): Promise<string> {
  const navItems = await getNavigation(); 

  if (navItems.length === 0) {
    console.warn("[DocuCraft] No navigation items found. Defaulting to /docs/introduction.");
    return '/docs/introduction'; // Fallback if no nav items
  }

  // Attempt to get the href of the first item.
  if (navItems[0] && navItems[0].href) {
    return navItems[0].href;
  }
  
  // Log and fallback if the first item is somehow invalid.
  console.warn(`[DocuCraft] First navigation item was invalid or missing href. Defaulting. NavItems: ${JSON.stringify(navItems)}`);
  return '/docs/introduction'; // Fallback for safety
}


// Helper to flatten the navigation structure for prev/next links.
function getAllPagesInOrder(navItems: NavItem[]): { href: string; title: string }[] {
    const pages: { href: string; title: string }[] = [];
    function recurse(items: NavItem[]) {
        for (const item of items) {
            // Add the item itself
            pages.push({ href: item.href, title: item.title });
            // If the item has children, recurse into them
            if (item.items && item.items.length > 0) {
                recurse(item.items); // Recurse on children
            }
        }
    }
    recurse(navItems); 
    return pages;
}

// Determines the previous and next documents for navigation.
export async function getPrevNextDocs(currentSlugArray: string[]): Promise<{
  prev: { href: string; title: string } | null;
  next: { href: string; title: string } | null;
}> {
  const navItems = await getNavigation();
  const allPages = getAllPagesInOrder(navItems);

  // Construct the current page's href from the slug array.
  // Normalize it: /docs for root, /docs/slug, /docs/folder/slug.
  // Remove trailing 'index' if present.
  let currentHref = "/docs"; // Default for root /docs page
  if (currentSlugArray.length > 0) {
    // Handle slugs that might still have 'docs' from somewhere
    const relevantSlugParts = currentSlugArray[0]?.toLowerCase() === 'docs' ? currentSlugArray.slice(1) : currentSlugArray;
    if (relevantSlugParts.length > 0) {
      const slugPath = relevantSlugParts.join('/');
      currentHref = `/docs/${slugPath}`;
    }
  }
  currentHref = currentHref.replace(/\/index$/, ''); // /docs/foo/index -> /docs/foo
  if (currentHref === '/docs/') currentHref = '/docs'; // Normalize /docs/ to /docs


  // Find the index of the current page in the flattened list.
  const currentIndex = allPages.findIndex(page => {
    // Normalize page.href as well for comparison
    let pageHrefNormalized = page.href.replace(/\/index$/, '');
    if (pageHrefNormalized === '/docs/') pageHrefNormalized = '/docs';
    return pageHrefNormalized === currentHref;
  });

  if (currentIndex === -1) {
    console.warn(`[getPrevNextDocs] Current href "${currentHref}" (from slug: "${currentSlugArray.join('/')}") not found in flattened navigation. All page hrefs:`, allPages.map(p => p.href));
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const next = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  return { prev, next };
}
