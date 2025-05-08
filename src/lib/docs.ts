
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
      } catch (e) { /* ignore */ }
      
      items.push({
        title: folderTitle,
        href: folderHref,
        order: folderOrder,
        items: await getNavItemsRecursive(fullPath, hrefSafeRelativePath),
      });

    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      if (entry.name === 'index.md' || entry.name === '_index.md') {
        continue;
      }
      const fileContentString = await fs.readFile(fullPath, 'utf-8');
      const { data } = matter(fileContentString);
      const title = data.title || entry.name.replace(/\.md$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const order = data.order !== undefined ? Number(data.order) : Infinity;
      items.push({
        title,
        href: `/docs/${hrefSafeRelativePath.replace(/\.md$/, '')}`,
        order,
      });
    }
  }
  
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
  let processedSlugArray = [...slug];
  
  const currentContentDir = contentDir; 
  
  const contentBaseName = path.basename(currentContentDir); 
  if (processedSlugArray.length > 0 && processedSlugArray[0] === contentBaseName) {
    processedSlugArray = processedSlugArray.slice(1);
  }
  
  const currentSlugPath = processedSlugArray.join('/'); 
  const baseFilePathWithoutExt = path.join(currentContentDir, currentSlugPath);

  let actualFilePath: string | undefined;
  let isDirectoryAttempt = false;
  
  try {
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

    if (!actualFilePath) {
      const mdFilePath = baseFilePathWithoutExt + '.md';
      if ((await fs.stat(mdFilePath).catch(() => null))?.isFile()) {
        actualFilePath = mdFilePath;
      }
    }
    
    if (processedSlugArray.length === 0 && !actualFilePath) { 
        const rootIndexMdPath = path.join(currentContentDir, 'index.md');
        const rootUnderscoreIndexMdPath = path.join(currentContentDir, '_index.md');
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
        const fileName = path.basename(actualFilePath, '.md');
        if (fileName !== 'index' && fileName !== '_index' && processedSlugArray.length > 0 && processedSlugArray[processedSlugArray.length -1] !== '') {
           title = processedSlugArray[processedSlugArray.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else if (fileName !== 'index' && fileName !== '_index') {
            title = fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else { 
            const parentDirName = path.basename(path.dirname(actualFilePath));
            if (parentDirName !== contentBaseName || path.dirname(actualFilePath) === currentContentDir) {
                 title = parentDirName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                 if (title.toLowerCase() === contentBaseName && path.dirname(actualFilePath) === currentContentDir) {
                    title = data.site_name || "Documentation Home"; 
                 }
            } else {
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
    
    console.warn(`[DocuCraft] Document not found. Original Slug: '${originalSlugForLog}', Processed Slug for docs: '${currentSlugPath}', Base path tried: '${baseFilePathWithoutExt}', IsDirAttempt: ${isDirectoryAttempt}`);
    return null;
  } catch (error) {
    console.error(`[DocuCraft] Error in getDocumentContent for original slug "${originalSlugForLog}":`, error);
    return null;
  }
}


export async function getAllMarkdownPaths(): Promise<string[][]> {
  const paths: string[][] = [];
  async function findMarkdownFiles(dir: string, currentSlugs: string[] = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    const isRootDocsDir = dir === contentDir;

    if (!isRootDocsDir) { 
        const indexMdPath = path.join(dir, 'index.md');
        const underscoreIndexMdPath = path.join(dir, '_index.md');
        if ((await fs.stat(indexMdPath).catch(()=>null))?.isFile() || (await fs.stat(underscoreIndexMdPath).catch(()=>null))?.isFile()) {
            paths.push([...currentSlugs]);
        }
    } else { 
        const rootIndexMdPath = path.join(dir, 'index.md');
        const rootUnderscoreIndexMdPath = path.join(dir, '_index.md');
         if ((await fs.stat(rootIndexMdPath).catch(()=>null))?.isFile() || (await fs.stat(rootUnderscoreIndexMdPath).catch(()=>null))?.isFile()) {
            paths.push([]); 
        }
    }

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await findMarkdownFiles(entryPath, [...currentSlugs, entry.name]);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
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
      let displayPathSegments = [...slugArray];
      const contentBaseName = path.basename(contentDir);
      if (slugArray.length > 0 && slugArray[0] === contentBaseName) {
        displayPathSegments = slugArray.slice(1);
      }
      const pagePath = displayPathSegments.length > 0 ? displayPathSegments.join('/') : '(root)';

      combinedContent += `\n\n## Page: /docs/${pagePath} (Title: ${doc.title})\n\n${doc.content}`;
    }
  }
  return combinedContent;
}

export async function getFirstDocPath(): Promise<string> {
  const navItems = await getNavigation(); 

  if (navItems.length === 0) {
    console.warn("[DocuCraft] No navigation items found. Defaulting to /docs/introduction.");
    // Attempt to locate a root index.md or _index.md as a fallback first
    const rootIndexMdPath = path.join(contentDir, 'index.md');
    const rootUnderscoreIndexMdPath = path.join(contentDir, '_index.md');
    if ((await fs.stat(rootIndexMdPath).catch(() => null))?.isFile() || (await fs.stat(rootUnderscoreIndexMdPath).catch(() => null))?.isFile()) {
      return '/docs';
    }
    return '/docs/introduction'; 
  }

  async function findFirstPageRecursive(items: NavItem[]): Promise<NavItem | null> {
    for (const item of items) {
      // Check if the item itself is a page (e.g., it doesn't primarily serve as a folder with items)
      // Or if it's a folder with an index page, its href should be valid
      const itemSlug = item.href.replace(/^\/docs\/?/, '').split('/').filter(s => s.length > 0);
      const doc = await getDocumentContent(itemSlug);
      if (doc) { // If the href resolves to an actual document, it's a candidate
        return item;
      }
      // If it has sub-items, recurse into them
      if (item.items && item.items.length > 0) {
        const firstSubPage = await findFirstPageRecursive(item.items);
        if (firstSubPage) {
          return firstSubPage;
        }
      }
    }
    return null;
  }

  const firstPageItem = await findFirstPageRecursive(navItems);

  if (firstPageItem && firstPageItem.href) {
    return firstPageItem.href;
  }
  
  console.warn(`[DocuCraft] Could not determine a valid first page from navigation structure. Defaulting. NavItems: ${JSON.stringify(navItems)}`);
  const rootIndexMdPath = path.join(contentDir, 'index.md');
  const rootUnderscoreIndexMdPath = path.join(contentDir, '_index.md');
  if ((await fs.stat(rootIndexMdPath).catch(() => null))?.isFile() || (await fs.stat(rootUnderscoreIndexMdPath).catch(() => null))?.isFile()) {
    return '/docs';
  }
  return '/docs/introduction'; // Final fallback
}


// Helper to flatten navigation items for prev/next links
function getAllPagesInOrder(navItems: NavItem[]): { href: string; title: string }[] {
    const pages: { href: string; title: string }[] = [];
    function recurse(items: NavItem[]) {
        for (const item of items) {
            // Add the item itself, as getNavigation ensures items have valid hrefs
            // (either to a direct .md file or an _index.md for a folder)
            pages.push({ href: item.href, title: item.title });
            if (item.items && item.items.length > 0) {
                recurse(item.items); // Recurse into sub-items
            }
        }
    }
    recurse(navItems);
    return pages;
}

export async function getPrevNextDocs(currentSlugArray: string[]): Promise<{
  prev: { href: string; title: string } | null;
  next: { href: string; title: string } | null;
}> {
  const navItems = await getNavigation();
  const allPages = getAllPagesInOrder(navItems);

  let currentHref = "/docs"; // Default for empty slug array (e.g. /docs root page)
  if (currentSlugArray.length > 0) {
    const slugPath = currentSlugArray.join('/');
    if (slugPath && slugPath !== '.') { // Ensure slugPath is not empty or just a dot
        currentHref = `/docs/${slugPath}`;
    }
  }
  // Normalize hrefs that might end with /index if slug was for an index.md file explicitly
  currentHref = currentHref.replace(/\/index$/, '');
  if (currentHref === '/docs/') currentHref = '/docs';


  const currentIndex = allPages.findIndex(page => {
    const pageHrefNormalized = page.href.replace(/\/index$/, '');
    return pageHrefNormalized === currentHref || page.href === currentHref;
  });

  if (currentIndex === -1) {
    console.warn(`[getPrevNextDocs] Current href "${currentHref}" (from slug: "${currentSlugArray.join('/')}") not found in flattened navigation. All page hrefs:`, allPages.map(p => p.href));
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const next = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  return { prev, next };
}
