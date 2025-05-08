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
      
      let indexContent: string | null = null;

      try {
        if ((await fs.stat(indexMdPath).catch(() => null))?.isFile()) {
          indexContent = await fs.readFile(indexMdPath, 'utf-8');
          folderHref = `/docs/${relativePath}`; 
        } else if ((await fs.stat(underscoreIndexMdPath).catch(() => null))?.isFile()) {
          indexContent = await fs.readFile(underscoreIndexMdPath, 'utf-8');
          folderHref = `/docs/${relativePath}`; 
        }
        
        if (indexContent) {
            const { data } = matter(indexContent);
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
      const fileContent = await fs.readFile(fullPath, 'utf-8');
      const { data } = matter(fileContent);
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

export async function getDocumentContent(slug: string[]): Promise<{ content: string; title: string; description?: string } | null> {
  const joinedSlug = slug.join('/');
  const baseFilePath = path.join(contentDir, joinedSlug); // e.g., .../docs/api or .../docs/api/reference

  try {
    const stats = await fs.stat(baseFilePath).catch(() => null);

    if (stats && stats.isDirectory()) {
      // Path is a directory, look for index.md or _index.md
      let directoryIndexPath: string | undefined;
      const indexMdPath = path.join(baseFilePath, 'index.md');
      const underscoreIndexMdPath = path.join(baseFilePath, '_index.md');

      if ((await fs.stat(indexMdPath).catch(() => null))?.isFile()) {
        directoryIndexPath = indexMdPath;
      } else if ((await fs.stat(underscoreIndexMdPath).catch(() => null))?.isFile()) {
        directoryIndexPath = underscoreIndexMdPath;
      }

      if (directoryIndexPath) {
        const fileContent = await fs.readFile(directoryIndexPath, 'utf-8');
        const { data, content } = matter(fileContent);
        const title = data.title || slug[slug.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return { content, title, description: data.description };
      } else {
        // Directory exists but contains no index.md or _index.md
        return null;
      }
    } else {
      // Path is not a directory (or doesn't exist as one). Try as a .md file.
      const mdFilePath = baseFilePath + '.md'; // e.g., .../docs/api/reference.md
      
      // Check if this .md file actually exists before reading
      if (!((await fs.stat(mdFilePath).catch(() => null))?.isFile())) {
        return null;
      }
      const fileContent = await fs.readFile(mdFilePath, 'utf-8');
      const { data, content } = matter(fileContent);
      const title = data.title || slug[slug.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return { content, title, description: data.description };
    }
  } catch (error) {
    // This catch is for unexpected errors during fs operations if not handled by .catch(()=>null)
    // console.error(`Unexpected error in getDocumentContent for slug "${slug.join('/')}":`, error);
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
     // Traverse to the first actual page if the top-level item is a folder
    while (firstItem.items && firstItem.items.length > 0) {
      const nextItem = firstItem.items.find(subItem => subItem.order === 1 || !subItem.order) || firstItem.items[0];
      if (!nextItem) break; 
      
      const potentialIndexSlug = firstItem.href.replace('/docs/', '').split('/');
      const indexDoc = await getDocumentContent(potentialIndexSlug);
      if(indexDoc) { // If the current folder's href points to a valid page, use it.
        break; 
      }
      firstItem = nextItem; // Otherwise, drill down.
    }
    if (firstItem.href) {
      return firstItem.href;
    }
  }
  
  return '/docs/introduction'; 
}

