
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
      let hasIndexPage = false;

      try {
        if ((await fs.stat(indexMdPath).catch(() => null))?.isFile()) {
          indexFileContentString = await fs.readFile(indexMdPath, 'utf-8');
          hasIndexPage = true;
        } else if ((await fs.stat(underscoreIndexMdPath).catch(() => null))?.isFile()) {
          indexFileContentString = await fs.readFile(underscoreIndexMdPath, 'utf-8');
          hasIndexPage = true;
        }
        
        if (indexFileContentString) {
            const { data } = matter(indexFileContentString);
            if (data.title) folderTitle = data.title;
            if (data.order !== undefined) folderOrder = Number(data.order);
        }
      } catch (e) { /* ignore */ }
      
      // If the folder itself has an index page, its href is set.
      // Otherwise, its href might not be directly navigable if it doesn't have children either,
      // but navigation structure might still want to list it.
      // For folders, the href points to the folder itself. The [...slug] page handles rendering index.md or _index.md.
      items.push({
        title: folderTitle,
        href: folderHref,
        order: folderOrder,
        items: await getNavItemsRecursive(fullPath, hrefSafeRelativePath),
      });

    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Skip index.md and _index.md as they are handled by their parent directory item.
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
  const joinedSlug = slug.join('/');
  // Normalize to handle potential empty initial slug component for root /docs page
  const normalizedSlugArray = slug.length === 1 && slug[0] === '' ? [] : slug;
  const currentSlugPath = normalizedSlugArray.join('/');

  const baseFilePathWithoutExt = path.join(contentDir, currentSlugPath);

  let actualFilePath: string | undefined;
  let isDirectoryAttempt = false;
  
  try {
    // Check if the slug points to a directory (e.g., /docs/api)
    // In this case, we look for index.md or _index.md within that directory.
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

    // If not a directory with an index file, or if slug doesn't point to a directory,
    // try appending .md (e.g., /docs/introduction.md)
    if (!actualFilePath) {
      const mdFilePath = baseFilePathWithoutExt + '.md';
      if ((await fs.stat(mdFilePath).catch(() => null))?.isFile()) {
        actualFilePath = mdFilePath;
      }
    }
    
    // Handle root /docs/ case specifically if slug is empty array
    if (normalizedSlugArray.length === 0 && !actualFilePath) {
        const rootIndexMdPath = path.join(contentDir, 'index.md');
        const rootUnderscoreIndexMdPath = path.join(contentDir, '_index.md');
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
        if (normalizedSlugArray.length > 0 && normalizedSlugArray[normalizedSlugArray.length -1] !== '') {
           title = normalizedSlugArray[normalizedSlugArray.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else if (path.basename(actualFilePath, '.md') !== 'index' && path.basename(actualFilePath, '.md') !== '_index') {
            title = path.basename(actualFilePath, '.md').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else {
            // Fallback for index files in subdirectories if title is missing in frontmatter
            const parentDirName = path.basename(path.dirname(actualFilePath));
            if (parentDirName !== 'docs') {
                 title = parentDirName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            } else {
                title = "Documentation"; // Default for root index if no title
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
    
    console.error(`[DocuCraft] Document not found. Slug: '${slug.join('/')}', Normalized: '${currentSlugPath}', Base path tried: '${baseFilePathWithoutExt}', IsDirAttempt: ${isDirectoryAttempt}`);
    return null;
  } catch (error) {
    console.error(`[DocuCraft] Error in getDocumentContent for slug "${slug.join('/')}":`, error);
    return null;
  }
}


export async function getAllMarkdownPaths(): Promise<string[][]> {
  const paths: string[][] = [];
  async function findMarkdownFiles(dir: string, currentSlugs: string[] = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    // Check for index.md or _index.md at the current directory level first
    // This is for generateStaticParams to correctly generate a path for the folder itself if it's a page
    if (currentSlugs.length > 0) { // Only for subdirectories, not the root 'docs' dir initially
        const indexMdPath = path.join(dir, 'index.md');
        const underscoreIndexMdPath = path.join(dir, '_index.md');
        if ((await fs.stat(indexMdPath).catch(()=>null))?.isFile() || (await fs.stat(underscoreIndexMdPath).catch(()=>null))?.isFile()) {
            paths.push([...currentSlugs]);
        }
    } else { // Special handling for root docs directory (src/content/docs)
        const rootIndexMdPath = path.join(dir, 'index.md');
        const rootUnderscoreIndexMdPath = path.join(dir, '_index.md');
         if ((await fs.stat(rootIndexMdPath).catch(()=>null))?.isFile() || (await fs.stat(rootUnderscoreIndexMdPath).catch(()=>null))?.isFile()) {
            paths.push([]); // Represents the /docs path
        }
    }

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // The check for directory index files is now done at the start of this function call for the 'dir'
        await findMarkdownFiles(entryPath, [...currentSlugs, entry.name]);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Regular markdown files (not index files)
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
  const navItems = await getNavigation(); // These are sorted by order

  if (navItems.length === 0) {
    console.warn("[DocuCraft] No navigation items found. Defaulting to /docs/introduction.");
    return '/docs/introduction'; // Default fallback
  }

  let currentItem = navItems[0];

  // If the first item is a folder, we need to see if it has an index page or if we should use its first child.
  while (currentItem.items && currentItem.items.length > 0) {
    // Check if the folder itself (currentItem) is a page by trying to get its content.
    // The slug for a folder like '/docs/api/' would be ['api']
    const folderSlug = currentItem.href.replace(/^\/docs\/?/, '').split('/').filter(s => s.length > 0);
    const folderDoc = await getDocumentContent(folderSlug);

    if (folderDoc) {
      // This folder has its own content page (index.md or _index.md), so it's a valid target.
      break;
    }
    // If the folder is not a page itself, and it has children, move to its first child.
    // This ensures we always point to an actual page.
    currentItem = currentItem.items[0];
  }
  
  if (!currentItem.href) {
     console.warn(`[DocuCraft] First navigation item resolved to an item without an href. Defaulting. Item: ${JSON.stringify(currentItem)}`);
     return '/docs/introduction';
  }

  return currentItem.href;
}
