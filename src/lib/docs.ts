
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { navigationConfig, type NavConfigItem } from '@/config/navigation'; 
import { siteConfig } from '@/config/site.config';

export interface NavItem {
  title: string;
  href: string;
  order?: number;
  items?: NavItem[]; 
  isExternal?: boolean;
}

const contentDir = path.join(process.cwd(), 'src', 'content', 'docs');
const rootContentDir = path.join(process.cwd(), 'src', 'content');

export interface DocResult {
  content: string;
  title: string;
  description?: string;
  order?: number; 
  filePath: string;
}


async function processNavConfigItem(configItem: NavConfigItem): Promise<NavItem> {
  const navItem: NavItem = {
    title: configItem.title,
    href: configItem.path || '#', 
    order: configItem.order,
    isExternal: configItem.isExternal,
  };

  if (configItem.path && !configItem.path.includes('#') && !configItem.isExternal && !configItem.path.startsWith('http')) {
    const slugArray = configItem.path.replace(/^\/docs\/?/, '').split('/').filter(Boolean);
    try {
        const doc = await getDocumentContent(slugArray);
        if (doc && doc.order !== undefined) {
            navItem.order = doc.order;
        }
        // Ensure title from frontmatter is used if available, overriding config title
        if (doc && doc.title) {
            navItem.title = doc.title;
        }
    } catch (e) {
        // console.warn(`Could not fetch frontmatter for ${configItem.path}, using order/title from config.`);
    }
  }


  if (configItem.children && configItem.children.length > 0) {
    navItem.items = await Promise.all(configItem.children.map(processNavConfigItem));
    navItem.items.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.title.localeCompare(b.title));
  }

  return navItem;
}

export async function getNavigation(): Promise<NavItem[]> {
  const processedNav = await Promise.all(navigationConfig.map(processNavConfigItem));
  processedNav.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.title.localeCompare(b.title));
  return processedNav;
}

export async function getDocumentContent(slug: string[]): Promise<DocResult | null> {
  const isCustom404Page = slug.length === 1 && slug[0] === 'custom_404';
  const baseDir = isCustom404Page ? rootContentDir : contentDir;
  
  // Normalize slug array: filter out empty strings that might result from splitting paths like "/"
  const normalizedSlugArray = slug.filter(Boolean); 
  const slugPath = normalizedSlugArray.join(path.sep);

  let fullPath: string | undefined;
  const potentialPaths: string[] = [];

  if (isCustom404Page) {
    potentialPaths.push(path.join(baseDir, `${slugPath}.md`));
  } else {
    if (normalizedSlugArray.length === 0) { // Root /docs page
      potentialPaths.push(path.join(baseDir, 'index.md'));
      potentialPaths.push(path.join(baseDir, '_index.md'));
    } else {
      // Attempt 1: As a direct .md file (e.g., /docs/category/document.md)
      potentialPaths.push(path.join(baseDir, `${slugPath}.md`));
      // Attempt 2: As an index.md file in a directory (e.g., /docs/category/document/index.md)
      potentialPaths.push(path.join(baseDir, slugPath, 'index.md'));
      // Attempt 3: As an _index.md file in a directory (e.g., /docs/category/document/_index.md)
      potentialPaths.push(path.join(baseDir, slugPath, '_index.md'));
    }
  }
  
  for (const p of potentialPaths) {
    try {
      // Check if file exists and is a file
      const stats = await fs.stat(p).catch(() => null);
      if (stats && stats.isFile()) {
        fullPath = p;
        break;
      }
    } catch {
      // Continue to next potential path
    }
  }

  if (!fullPath) {
    console.warn(`[DocuCraft] Document not found for slug: ["${slug.join('", "')}"] (normalized: "${slugPath}"). Tried paths: ${potentialPaths.join(', ')}`);
    return null;
  }

  try {
    const fileContentString = await fs.readFile(fullPath, 'utf-8');
    const { data, content: bodyContent } = matter(fileContentString);

    let title = data.title;
    if (!title) {
      // Intelligent title generation if not in frontmatter
      const fileName = path.basename(fullPath, '.md');
      if (fileName !== 'index' && fileName !== '_index') {
        // Use the last part of the slug or the filename itself
        title = normalizedSlugArray.length > 0 
          ? normalizedSlugArray[normalizedSlugArray.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
          : fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      } else {
        // For index files, use the parent directory name
        const parentDirName = path.basename(path.dirname(fullPath));
        // Ensure parentDirName is not the base content directory itself (e.g., 'docs' or 'content')
        if (parentDirName && parentDirName !== path.basename(baseDir)) {
          title = parentDirName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else {
          title = siteConfig.name; // Fallback for root index.md
        }
      }
    }
    
    return {
      content: bodyContent,
      title,
      description: data.description,
      order: data.order !== undefined ? Number(data.order) : undefined,
      filePath: fullPath,
    };
  } catch (error) {
    console.error(`[DocuCraft] Error reading or parsing document at "${fullPath}" for slug ["${slug.join('", "')}"]:`, error);
    return null;
  }
}


export async function getAllMarkdownPaths(): Promise<string[][]> {
  const paths: string[][] = [];
  
  function extractPathsFromConfig(items: NavConfigItem[]) {
    for (const item of items) {
      if (item.path && !item.path.includes('#') && !item.isExternal && !item.path.startsWith('http')) {
        const slugArray = item.path.replace(/^\/docs\/?/, '').split('/').filter(Boolean);
        paths.push(slugArray);
      }
      if (item.children) {
        extractPathsFromConfig(item.children);
      }
    }
  }

  extractPathsFromConfig(navigationConfig);
  
  const uniquePathStrings = new Set(paths.map(p => p.join('/')));
  const uniquePaths = Array.from(uniquePathStrings).map(pStr => pStr === '' ? [] : pStr.split('/'));
  
  // Ensure root path `[]` is included if /docs is in navigationConfig and not yet present
  const hasRootPath = navigationConfig.some(item => item.path === '/docs' || item.path === '/docs/');
  const rootPathExists = uniquePaths.some(p => p.length === 0);

  if (hasRootPath && !rootPathExists) {
    uniquePaths.push([]);
  }
  
  return uniquePaths;
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
    return '/docs/introduction'; // Fallback
  }

  function findFirstValidPath(items: NavItem[]): string | null {
    for (const item of items) {
      // Ensure href is a valid document path, not an anchor or external link
      if (item.href && item.href !== '#' && !item.href.includes('#') && !item.isExternal && !item.href.startsWith('http')) {
        return item.href;
      }
      if (item.items && item.items.length > 0) {
        const childPath = findFirstValidPath(item.items);
        if (childPath) return childPath;
      }
    }
    return null;
  }

  const firstPath = findFirstValidPath(navItems);
  if (firstPath) {
    return firstPath;
  }
  
  console.warn(`[DocuCraft] First valid navigation item href not found. Defaulting to /docs/introduction. NavItems: ${JSON.stringify(navItems)}`);
  return '/docs/introduction'; // Fallback
}


function getAllPagesInOrder(navItems: NavItem[]): { href: string; title: string }[] {
    const pages: { href: string; title: string }[] = [];
    function recurse(items: NavItem[]) {
        for (const item of items) {
            if (item.href && item.href !== '#' && !item.href.startsWith('http') && !item.href.includes('#') && !item.isExternal) {
              pages.push({ href: item.href, title: item.title });
            }
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
  const normalizedCurrentSlug = currentSlugArray.filter(Boolean).join('/');
  if (normalizedCurrentSlug) {
    currentHref = `/docs/${normalizedCurrentSlug}`;
  }
  
  // Normalize hrefs for comparison (remove trailing /index or /_index)
  const normalizeHref = (href: string) => href.replace(/\/(index|_index)$/, '') || '/docs';

  const normalizedCurrentPageHref = normalizeHref(currentHref);

  const currentIndex = allPages.findIndex(page => normalizeHref(page.href) === normalizedCurrentPageHref);

  if (currentIndex === -1) {
    console.warn(`[getPrevNextDocs] Current href "${currentHref}" (normalized: "${normalizedCurrentPageHref}", from slug: "${currentSlugArray.join('/')}") not found in flattened navigation. All page hrefs:`, allPages.map(p => ({orig: p.href, norm: normalizeHref(p.href)})));
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const next = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  return { prev, next };
}
