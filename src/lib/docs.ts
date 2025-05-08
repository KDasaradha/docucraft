
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
        if (currentPath === contentDir) {
          const fileContentString = await fs.readFile(fullPath, 'utf-8');
          const { data } = matter(fileContentString);
          const title = data.title || "Overview";
          const order = data.order !== undefined ? Number(data.order) : -Infinity; 
          items.push({
            title,
            href: '/docs', 
            order,
          });
        }
        continue;
      }

      const fileContentString = await fs.readFile(fullPath, 'utf-8');
      const { data } = matter(fileContentString);
      const title = data.title || entry.name.replace(/\.md$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const order = data.order !== undefined ? Number(data.order) : Infinity;
      const pageSlug = hrefSafeRelativePath.replace(/\.md$/, '');
      
      items.push({
        title,
        href: pageSlug === '_index' || pageSlug === 'index' ? `/docs/${basePath}` : `/docs/${pageSlug}`,
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
  content: string; 
  title: string;
  description?: string;
  filePath: string; 
}

export async function getDocumentContent(slug: string[]): Promise<DocResult | null> {
  const originalSlugForLog = slug.join('/');
  const isCustomPage = slug.length === 1 && (slug[0] === 'custom_404');
  const currentContentDir = isCustomPage ? rootContentDir : contentDir;
  
  let processedSlugArray = [...slug]; 
  // Critical fix: If the slug accidentally contains "docs" as the first segment, remove it.
  // This handles cases where a slug like ["docs", "introduction"] might be passed.
  if (processedSlugArray.length > 1 && processedSlugArray[0].toLowerCase() === 'docs') {
    processedSlugArray.shift();
  } else if (processedSlugArray.length === 1 && processedSlugArray[0].toLowerCase() === 'docs') {
    // Handles case where slug is just ["docs"], meaning the root /docs page.
    processedSlugArray = [];
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
      
      let title = data.title;
      if (!title) {
        const fileName = path.basename(actualFilePath, '.md');
        if (fileName !== 'index' && fileName !== '_index' && processedSlugArray.length > 0 && processedSlugArray[processedSlugArray.length -1] !== '') {
           title = processedSlugArray[processedSlugArray.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else if (fileName !== 'index' && fileName !== '_index') { 
            title = fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else { 
            const parentDirName = path.basename(path.dirname(actualFilePath));
            const grandParentDirName = path.basename(path.dirname(path.dirname(actualFilePath)));

            if (parentDirName !== 'docs' && parentDirName !== 'content') {
                 title = parentDirName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            } else if (grandParentDirName !== 'content' && path.dirname(actualFilePath) === contentDir) { 
                title = data.site_name || "Documentation Home"; 
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
    
    console.warn(`[DocuCraft] Document not found. Original Slug: '${originalSlugForLog}', Processed Slug Array: '${processedSlugArray.join('/')}', Path for ${currentContentDir}: '${currentSlugPath}', Base path tried: '${baseFilePathWithoutExt}', IsDirAttempt: ${isDirectoryAttempt}`);
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
    return '/docs/introduction'; 
  }

  if (navItems[0] && navItems[0].href) {
    return navItems[0].href;
  }
  
  console.warn(`[DocuCraft] First navigation item was invalid or missing href. Defaulting. NavItems: ${JSON.stringify(navItems)}`);
  return '/docs/introduction'; 
}


function getAllPagesInOrder(navItems: NavItem[]): { href: string; title: string }[] {
    const pages: { href: string; title: string }[] = [];
    function recurse(items: NavItem[]) {
        for (const item of items) {
            pages.push({ href: item.href, title: item.title });
            if (item.items && item.items.length > 0) {
                recurse(item.items); 
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

  let currentHref = "/docs"; 
  if (currentSlugArray.length > 0) {
    const slugPath = currentSlugArray.join('/');
    currentHref = `/docs/${slugPath}`;
  }
  currentHref = currentHref.replace(/\/index$/, ''); 
  if (currentHref === '/docs/') currentHref = '/docs';


  const currentIndex = allPages.findIndex(page => {
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
