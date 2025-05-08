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

    if (entry.isDirectory()) {
      let folderTitle = entry.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      let folderOrder = Infinity;
      let folderHref = `/docs/${relativePath}`; 
      
      const indexMdPath = path.join(fullPath, 'index.md');
      const underscoreIndexMdPath = path.join(fullPath, '_index.md');
      
      let indexFileContentString: string | null = null;

      try {
        if ((await fs.stat(indexMdPath).catch(() => null))?.isFile()) {
          indexFileContentString = await fs.readFile(indexMdPath, 'utf-8');
          folderHref = `/docs/${relativePath}`; 
        } else if ((await fs.stat(underscoreIndexMdPath).catch(() => null))?.isFile()) {
          indexFileContentString = await fs.readFile(underscoreIndexMdPath, 'utf-8');
          folderHref = `/docs/${relativePath}`; 
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
        items: await getNavItemsRecursive(fullPath, relativePath),
      });
    } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md' && entry.name !== '_index.md') {
      const fileContentString = await fs.readFile(fullPath, 'utf-8');
      const { data } = matter(fileContentString);
      const title = data.title || entry.name.replace(/\.md$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const order = data.order !== undefined ? Number(data.order) : Infinity;
      items.push({
        title,
        href: `/docs/${relativePath.replace(/\.md$/, '')}`,
        order,
      });
    }
  }
  
  return items.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
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
  const baseFilePath = path.join(contentDir, joinedSlug); 

  let actualFilePath: string | undefined;
  
  try {
    const stats = await fs.stat(baseFilePath).catch(() => null);

    if (stats && stats.isDirectory()) {
      const indexMdPath = path.join(baseFilePath, 'index.md');
      const underscoreIndexMdPath = path.join(baseFilePath, '_index.md');

      if ((await fs.stat(indexMdPath).catch(() => null))?.isFile()) {
        actualFilePath = indexMdPath;
      } else if ((await fs.stat(underscoreIndexMdPath).catch(() => null))?.isFile()) {
        actualFilePath = underscoreIndexMdPath;
      }
    } else {
      const mdFilePath = baseFilePath + '.md';
      if ((await fs.stat(mdFilePath).catch(() => null))?.isFile()) {
        actualFilePath = mdFilePath;
      }
    }

    if (actualFilePath) {
      const fileContentString = await fs.readFile(actualFilePath, 'utf-8');
      const { data, content: bodyContent } = matter(fileContentString);
      const title = data.title || slug[slug.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        content: bodyContent,
        title,
        description: data.description,
        filePath: actualFilePath,
      };
    }
    return null;
  } catch (error) {
    // console.error(`Error in getDocumentContent for slug "${slug.join('/')}":`, error);
    return null;
  }
}


export async function getAllMarkdownPaths(): Promise<string[][]> {
  const paths: string[][] = [];
  async function findMarkdownFiles(dir: string, currentSlugs: string[] = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const indexMdPath = path.join(entryPath, 'index.md');
        const underscoreIndexMdPath = path.join(entryPath, '_index.md');
        if ((await fs.stat(indexMdPath).catch(()=>null))?.isFile() || (await fs.stat(underscoreIndexMdPath).catch(()=>null))?.isFile()) {
            paths.push([...currentSlugs, entry.name]);
        }
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
  for (const slug of allPaths) {
    const doc = await getDocumentContent(slug);
    if (doc) {
      combinedContent += `\n\n## Page: /${slug.join('/')} (Title: ${doc.title})\n\n${doc.content}`;
    }
  }
  return combinedContent;
}

export async function getFirstDocPath(): Promise<string> {
  const navItems = await getNavigation();
  
  const introItem = navItems.find(item => item.title.toLowerCase() === 'introduction');
  if (introItem && introItem.href) {
    return introItem.href;
  }

  if (navItems.length > 0) {
    let firstItem = navItems[0];
    while (firstItem.items && firstItem.items.length > 0) {
      const nextItemInHierarchy = firstItem.items.find(subItem => subItem.order === 1 || !subItem.order) || firstItem.items[0];
      if (!nextItemInHierarchy) break; 

      const potentialIndexSlug = firstItem.href.replace('/docs/', '').split('/');
      if (potentialIndexSlug.join('') === "") { // Handle base /docs/ which might be an _index.md
         const rootIndexDoc = await getDocumentContent([]); // Check for /docs/_index.md or /docs/index.md
         if (rootIndexDoc) break; 
      } else {
        const indexDoc = await getDocumentContent(potentialIndexSlug);
        if(indexDoc) { 
          break; 
        }
      }
      firstItem = nextItemInHierarchy;
    }
    if (firstItem.href) {
      return firstItem.href;
    }
  }
  
  return '/docs/introduction'; 
}
