
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
  const originalSlugForLog = slug.join('/'); // For logging the original input
  let processedSlugArray = [...slug];

  const contentBaseName = path.basename(contentDir); // e.g., "docs"

  // If contentDir is '.../docs' and the slug starts with 'docs' (e.g., ['docs', 'introduction']),
  // then we should process ['introduction'] relative to contentDir.
  if (processedSlugArray.length > 0 && processedSlugArray[0] === contentBaseName) {
    // console.warn(`[DocuCraft] Adjusting slug: original was '${originalSlugForLog}', using '${processedSlugArray.slice(1).join('/')}' relative to ${contentDir}`);
    processedSlugArray = processedSlugArray.slice(1);
  }
  
  // Handle case where processedSlugArray might become empty (e.g., original slug was just ['docs'])
  // This corresponds to the root of the contentDir (e.g. /docs page itself if index.md exists there)
  const currentSlugPath = processedSlugArray.join('/'); 

  const baseFilePathWithoutExt = path.join(contentDir, currentSlugPath);

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
    
    // Handle root /docs/ case specifically if processedSlugArray is empty and no direct .md file was found
    // This happens if slug was ['docs'] and became [], or was [] initially.
    if (processedSlugArray.length === 0 && !actualFilePath) {
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
      
      // Use processedSlugArray (which is now correctly relative to contentDir) for title generation
      const normalizedSlugArrayForTitle = processedSlugArray.length === 1 && processedSlugArray[0] === '' ? [] : processedSlugArray;

      let title = data.title;
      if (!title) {
        if (normalizedSlugArrayForTitle.length > 0 && normalizedSlugArrayForTitle[normalizedSlugArrayForTitle.length -1] !== '') {
           title = normalizedSlugArrayForTitle[normalizedSlugArrayForTitle.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else if (path.basename(actualFilePath, '.md') !== 'index' && path.basename(actualFilePath, '.md') !== '_index') {
            title = path.basename(actualFilePath, '.md').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else {
            const parentDirName = path.basename(path.dirname(actualFilePath));
            if (parentDirName !== contentBaseName) { // Compare with actual base dir name
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
    
    console.error(`[DocuCraft] Document not found. Original Slug: '${originalSlugForLog}', Processed Slug Path: '${currentSlugPath}', Base path tried: '${baseFilePathWithoutExt}', IsDirAttempt: ${isDirectoryAttempt}`);
    return null;
  } catch (error)
{
    console.error(`[DocuCraft] Error in getDocumentContent for original slug "${originalSlugForLog}":`, error);
    return null;
  }
}


export async function getAllMarkdownPaths(): Promise<string[][]> {
  const paths: string[][] = [];
  async function findMarkdownFiles(dir: string, currentSlugs: string[] = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    const isRootDocsDir = dir === contentDir;

    if (!isRootDocsDir) { // For subdirectories
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
    const doc = await getDocumentContent(slugArray); // getDocumentContent will now handle potentially prefixed slugs correctly
    if (doc) {
      // Determine the "clean" path for display based on how getDocumentContent processed it
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
  
  while (currentItem.items && currentItem.items.length > 0) {
    const folderSlugOriginal = currentItem.href.replace(/^\/docs\/?/, '').split('/').filter(s => s.length > 0);
    // getDocumentContent will handle if folderSlugOriginal is like ['docs', 'api'] or ['api']
    const folderDoc = await getDocumentContent(folderSlugOriginal);

    if (folderDoc) {
      break;
    }
    currentItem = currentItem.items[0];
  }
  
  if (!currentItem.href) {
     console.warn(`[DocuCraft] First navigation item resolved to an item without an href. Defaulting. Item: ${JSON.stringify(currentItem)}`);
     return '/docs/introduction';
  }

  return currentItem.href;
}

