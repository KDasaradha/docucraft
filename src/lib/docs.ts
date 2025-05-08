
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
  
  // Determine the base directory for content lookup.
  // If the slug is for a special file like 'custom_404', it might be in src/content/ directly.
  // Otherwise, it's in src/content/docs/.
  // For now, this function is primarily for 'docs' content.
  // The not-found.tsx handles 'custom_404.md' specifically if it's in 'src/content/docs'.
  
  const currentContentDir = contentDir; // Default to docs directory

  // If the slug starts with 'docs' (e.g. from an old URL structure or direct call), remove it.
  const contentBaseName = path.basename(currentContentDir); // e.g., "docs"
  if (processedSlugArray.length > 0 && processedSlugArray[0] === contentBaseName) {
    // console.warn(`[DocuCraft] Adjusting slug: original was '${originalSlugForLog}', using '${processedSlugArray.slice(1).join('/')}' relative to ${currentContentDir}`);
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
    
    if (processedSlugArray.length === 0 && !actualFilePath) { // Handles /docs or an empty slug array
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
        } else { // For index.md or _index.md
            const parentDirName = path.basename(path.dirname(actualFilePath));
             // Ensure parentDirName is not the base 'docs' directory itself unless it's the root /docs index.
            if (parentDirName !== contentBaseName || path.dirname(actualFilePath) === currentContentDir) {
                 title = parentDirName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                 if (title.toLowerCase() === contentBaseName && path.dirname(actualFilePath) === currentContentDir) {
                    // If it's the root index.md (e.g. /docs/index.md) and has no title, use a default.
                    title = "Documentation Home"; 
                 }
            } else {
                // Fallback if something is unexpected
                title = "Documentation"; 
            }
        }
      }
      
      // Correct filePath for index files at the root of /docs to be the full path to the index.md
      // For `src/content/docs/index.md`, filePath should be `/path/to/project/src/content/docs/index.md`
      // currentContentDir is `/path/to/project/src/content/docs`
      // actualFilePath is already the absolute path.

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
    return '/docs/introduction'; 
  }

  let currentItem = navItems[0];
  
  // Try to find the first actual page, not just a folder
  async function findFirstPage(item: NavItem): Promise<NavItem | null> {
    // Check if current item itself is a page (by checking if its href points to a resolvable document)
    const itemSlug = item.href.replace(/^\/docs\/?/, '').split('/').filter(s => s.length > 0);
    const itemDoc = await getDocumentContent(itemSlug);
    if (itemDoc) {
      return item; // This item is a page itself
    }

    // If it's a folder with items, recurse
    if (item.items && item.items.length > 0) {
      for (const subItem of item.items) {
        const page = await findFirstPage(subItem);
        if (page) return page;
      }
    }
    return null; // No page found in this branch
  }

  const firstPageItem = await findFirstPage(currentItem);

  if (firstPageItem && firstPageItem.href) {
    return firstPageItem.href;
  }
  
  // Fallback if the above logic doesn't find a clear page (e.g. only empty folders)
  // This part tries to resolve the original logic as a backup
  while (currentItem.items && currentItem.items.length > 0) {
    const folderSlugOriginal = currentItem.href.replace(/^\/docs\/?/, '').split('/').filter(s => s.length > 0);
    const folderDoc = await getDocumentContent(folderSlugOriginal);

    if (folderDoc) { // This means the folder itself has an index.md page
      break;
    }
    currentItem = currentItem.items[0]; // Go to the first item in the folder
  }
  
  if (!currentItem.href) {
     console.warn(`[DocuCraft] First navigation item resolved to an item without an href after fallback. Defaulting. Item: ${JSON.stringify(currentItem)}`);
     return '/docs/introduction';
  }

  return currentItem.href;
}
