
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
      // For a folder, its href points to the folder path itself.
      // e.g., for 'api' folder, href is '/docs/api'
      let folderHref = `/docs/${hrefSafeRelativePath}`; 
      
      const indexMdPath = path.join(fullPath, 'index.md');
      const underscoreIndexMdPath = path.join(fullPath, '_index.md');
      
      let indexFileContentString: string | null = null;

      try {
        // Check for index.md first, then _index.md
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
        items: await getNavItemsRecursive(fullPath, hrefSafeRelativePath), // Recursive call for sub-items
      });

    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const isIndexFile = entry.name === 'index.md' || entry.name === '_index.md';

      if (isIndexFile) {
        // If this index file is at the ROOT of the docs directory (e.g., src/content/docs/_index.md)
        // it represents the main /docs page and should be included as a NavItem.
        if (currentPath === contentDir) {
          const fileContentString = await fs.readFile(fullPath, 'utf-8');
          const { data } = matter(fileContentString);
          const title = data.title || "Overview"; // Default title for root page
          // Default order to be very first, unless specified in frontmatter
          const order = data.order !== undefined ? Number(data.order) : -Infinity; 
          items.push({
            title,
            href: '/docs', // Special href for the root docs page
            order,
          });
        }
        // If it's an index file in a subdirectory (e.g., api/_index.md),
        // it defines the folder's NavItem metadata and is not a separate page in the nav list.
        // The directory processing part already handles creating a NavItem for the folder.
        // So, we 'continue' to avoid adding it as a distinct file item here.
        continue;
      }

      // For regular .md files (not index files in subdirectories)
      const fileContentString = await fs.readFile(fullPath, 'utf-8');
      const { data } = matter(fileContentString);
      const title = data.title || entry.name.replace(/\.md$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const order = data.order !== undefined ? Number(data.order) : Infinity;
      // hrefSafeRelativePath for 'introduction.md' is 'introduction.md'
      // .replace(/\.md$/, '') makes it 'introduction'
      const pageSlug = hrefSafeRelativePath.replace(/\.md$/, '');
      
      items.push({
        title,
        // Ensures href is /docs/slug or /docs for the root _index.md if processed here (though should be caught above)
        href: pageSlug === '_index' || pageSlug === 'index' ? `/docs/${basePath}` : `/docs/${pageSlug}`,
        order,
      });
    }
  }
  
  // Sort items by order, then by title
  return items.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.title.localeCompare(b.title));
}

export async function getNavigation(): Promise<NavItem[]> {
  return getNavItemsRecursive(contentDir);
}

export interface DocResult {
  content: string; // Markdown body
  title: string;
  description?: string;
  filePath: string; // Absolute path to the .md file
}

export async function getDocumentContent(slug: string[]): Promise<DocResult | null> {
  const originalSlugForLog = slug.join('/');
  // Determine if we are targeting the main content dir (src/content/docs) or the root content dir (src/content)
  // This function is primarily for 'docs', but needs to be aware for custom pages like 404.
  const isCustomPage = slug.length === 1 && (slug[0] === 'custom_404'); // Add other custom page slugs if any
  const currentContentDir = isCustomPage ? rootContentDir : contentDir;
  
  // If the slug is for a doc page, potentially remove 'docs' prefix if present.
  // For this app, slugs passed to getDocumentContent are relative to 'src/content/docs/',
  // so no 'docs' prefix in slug array.
  let processedSlugArray = [...slug]; 
  
  const currentSlugPath = processedSlugArray.join('/'); 
  const baseFilePathWithoutExt = path.join(currentContentDir, currentSlugPath);

  let actualFilePath: string | undefined;
  let isDirectoryAttempt = false;
  
  try {
    // Try treating the slug as a directory first (e.g., /docs/api -> /src/content/docs/api/)
    const stats = await fs.stat(baseFilePathWithoutExt).catch(() => null);
    if (stats && stats.isDirectory()) {
      isDirectoryAttempt = true;
      // Look for index.md or _index.md in this directory
      const indexMdPath = path.join(baseFilePathWithoutExt, 'index.md');
      const underscoreIndexMdPath = path.join(baseFilePathWithoutExt, '_index.md');

      if ((await fs.stat(indexMdPath).catch(() => null))?.isFile()) {
        actualFilePath = indexMdPath;
      } else if ((await fs.stat(underscoreIndexMdPath).catch(() => null))?.isFile()) {
        actualFilePath = underscoreIndexMdPath;
      }
    }

    // If not a directory or no index file found, try as a .md file (e.g., /docs/intro -> /src/content/docs/intro.md)
    if (!actualFilePath) {
      const mdFilePath = baseFilePathWithoutExt + '.md';
      if ((await fs.stat(mdFilePath).catch(() => null))?.isFile()) {
        actualFilePath = mdFilePath;
      }
    }
    
    // Handle root /docs page (slug is empty or [''])
    if (processedSlugArray.length === 0 && !actualFilePath && !isCustomPage) { 
        const rootIndexMdPath = path.join(contentDir, 'index.md'); // Specifically docs dir
        const rootUnderscoreIndexMdPath = path.join(contentDir, '_index.md'); // Specifically docs dir
        if ((await fs.stat(rootIndexMdPath).catch(() => null))?.isFile()) {
            actualFilePath = rootIndexMdPath;
        } else if ((await fs.stat(rootUnderscoreIndexMdPath).catch(() => null))?.isFile()) {
            actualFilePath = rootUnderscoreIndexMdPath;
        }
    }


    if (actualFilePath) {
      const fileContentString = await fs.readFile(actualFilePath, 'utf-8');
      const { data, content: bodyContent } = matter(fileContentString);
      
      let title = data.title;
      if (!title) {
        // Default title generation logic
        const fileName = path.basename(actualFilePath, '.md');
        if (fileName !== 'index' && fileName !== '_index' && processedSlugArray.length > 0 && processedSlugArray[processedSlugArray.length -1] !== '') {
           title = processedSlugArray[processedSlugArray.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else if (fileName !== 'index' && fileName !== '_index') { // A file like 'introduction.md'
            title = fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else { // An index file (e.g. api/index.md or root index.md)
            // Use parent directory name for title, unless it's the base 'docs' or 'content' directory
            const parentDirName = path.basename(path.dirname(actualFilePath));
            const grandParentDirName = path.basename(path.dirname(path.dirname(actualFilePath)));

            if (parentDirName !== 'docs' && parentDirName !== 'content') {
                 title = parentDirName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            } else if (grandParentDirName !== 'content' && path.dirname(actualFilePath) === contentDir) { // Root index.md in docs
                title = data.site_name || "Documentation Home"; 
            } else { // Fallback for other cases, e.g. custom_404.md in src/content
                title = data.site_name || "Documentation"; 
            }
        }
      }
      
      return {
        content: bodyContent,
        title,
        description: data.description,
        filePath: actualFilePath, 
      };
    }
    
    console.warn(`[DocuCraft] Document not found. Original Slug: '${originalSlugForLog}', Processed Slug Path for ${currentContentDir}: '${currentSlugPath}', Base path tried: '${baseFilePathWithoutExt}', IsDirAttempt: ${isDirectoryAttempt}`);
    return null;
  } catch (error) {
    console.error(`[DocuCraft] Error in getDocumentContent for original slug "${originalSlugForLog}":`, error);
    return null;
  }
}


export async function getAllMarkdownPaths(): Promise<string[][]> {
  const paths: string[][] = [];
  // This function explores only the 'docs' directory.
  async function findMarkdownFiles(dir: string, currentSlugs: string[] = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    const isRootDocsDir = dir === contentDir;

    // Check for index.md or _index.md in the current directory to make the directory itself a page
    // e.g. /docs/api based on /docs/api/index.md
    if (!isRootDocsDir) { 
        const indexMdPath = path.join(dir, 'index.md');
        const underscoreIndexMdPath = path.join(dir, '_index.md');
        if ((await fs.stat(indexMdPath).catch(()=>null))?.isFile() || (await fs.stat(underscoreIndexMdPath).catch(()=>null))?.isFile()) {
            paths.push([...currentSlugs]); // Slug for the folder itself
        }
    } else { // For the root of the /docs directory (src/content/docs)
        const rootIndexMdPath = path.join(dir, 'index.md');
        const rootUnderscoreIndexMdPath = path.join(dir, '_index.md');
         if ((await fs.stat(rootIndexMdPath).catch(()=>null))?.isFile() || (await fs.stat(rootUnderscoreIndexMdPath).catch(()=>null))?.isFile()) {
            paths.push([]); // Represents the /docs root page
        }
    }

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await findMarkdownFiles(entryPath, [...currentSlugs, entry.name]);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Only add if it's not an index file, as index files define their parent folder's page
        if (entry.name !== 'index.md' && entry.name !== '_index.md') {
            paths.push([...currentSlugs, entry.name.replace(/\.md$/, '')]);
        }
      }
    }
  }
  await findMarkdownFiles(contentDir);
  return paths;
}

export async function getAllDocumentationContent(): Promise<string> {
  const allPaths = await getAllMarkdownPaths();
  let combinedContent = "";
  for (const slugArray of allPaths) {
    const doc = await getDocumentContent(slugArray); 
    if (doc) {
      const pagePath = slugArray.length > 0 ? slugArray.join('/') : '(root)';
      combinedContent += `\n\n## Page: /docs/${pagePath} (Title: ${doc.title})\n\n${doc.content}`;
    }
  }
  return combinedContent;
}

export async function getFirstDocPath(): Promise<string> {
  const navItems = await getNavigation(); 

  if (navItems.length === 0) {
    console.warn("[DocuCraft] No navigation items found. Defaulting to /docs/introduction.");
    return '/docs/introduction'; // Fallback if no nav items
  }

  // The first item in the sorted navItems should be the first page.
  // This includes the root /docs page if it exists and is ordered first.
  if (navItems[0] && navItems[0].href) {
    return navItems[0].href;
  }
  
  // Fallback if the first nav item is somehow invalid
  console.warn(`[DocuCraft] First navigation item was invalid or missing href. Defaulting. NavItems: ${JSON.stringify(navItems)}`);
  return '/docs/introduction'; 
}


// Helper to flatten navigation items for prev/next links
function getAllPagesInOrder(navItems: NavItem[]): { href: string; title: string }[] {
    const pages: { href: string; title: string }[] = [];
    function recurse(items: NavItem[]) {
        for (const item of items) {
            // Add the item itself. This could be a page or a folder (which acts as a page via its index.md)
            pages.push({ href: item.href, title: item.title });
            // If the item has sub-items (it's a folder with content), recurse into them
            if (item.items && item.items.length > 0) {
                recurse(item.items); 
            }
        }
    }
    recurse(navItems); // navItems are already sorted by order and title
    return pages;
}

export async function getPrevNextDocs(currentSlugArray: string[]): Promise<{
  prev: { href: string; title: string } | null;
  next: { href: string; title: string } | null;
}> {
  const navItems = await getNavigation();
  const allPages = getAllPagesInOrder(navItems);

  // Construct the current page's href from the slug array
  // For root /docs, currentSlugArray is [], resulting in '/docs'
  // For /docs/foo, currentSlugArray is ['foo'], resulting in '/docs/foo'
  let currentHref = "/docs"; 
  if (currentSlugArray.length > 0) {
    const slugPath = currentSlugArray.join('/');
     // Ensure we don't end up with /docs// if slugPath is empty (shouldn't happen with current logic)
    currentHref = `/docs/${slugPath}`;
  }
  // Normalize hrefs that might end with /index if slug was for an index.md file explicitly, though getNavigation should prevent this.
  currentHref = currentHref.replace(/\/index$/, ''); 
  // Ensure root path is just /docs, not /docs/
  if (currentHref === '/docs/') currentHref = '/docs';


  const currentIndex = allPages.findIndex(page => {
    // Normalize page.href from allPages list as well for consistent matching
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


    