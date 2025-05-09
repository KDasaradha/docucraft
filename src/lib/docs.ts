
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
  isSection?: boolean; // Added to carry over the isSection flag
}

const contentDir = path.join(process.cwd(), 'src', 'content', 'docs');
const rootContentDir = path.join(process.cwd(), 'src', 'content'); // For files like custom_404.md

export interface DocResult {
  content: string;
  title: string;
  description?: string;
  order?: number;
  filePath: string;
}

async function processNavConfigItem(configItem: NavConfigItem): Promise<NavItem> {
  let fullHref: string;
  if (configItem.path) {
    if (configItem.path.startsWith('http') || configItem.path.startsWith('#')) {
      // External link or already an anchor for the same page
      fullHref = configItem.path;
    } else if (configItem.path.startsWith('/')) {
      // Already an absolute path (e.g. /docs/...)
      fullHref = configItem.path;
    } else if (configItem.path.includes('#')) {
      // Path with an anchor, make it relative to /docs/
      const [pathname, hash] = configItem.path.split('#');
      fullHref = `/docs/${pathname}#${hash}`;
    }
    else {
      // Relative path, assume relative to /docs/
      fullHref = `/docs/${configItem.path}`;
    }
  } else {
    fullHref = '#'; // No path, make it a non-link, useful for parent-only items
  }

  const navItem: NavItem = {
    title: configItem.title,
    href: fullHref,
    order: configItem.order,
    isExternal: configItem.isExternal,
    isSection: configItem.isSection,
  };

  // Fetch frontmatter for title/order override if it's a document path
  if (fullHref.startsWith('/docs/') && !fullHref.includes('#') && !configItem.isExternal) {
    const slugArray = fullHref.replace(/^\/docs\/?/, '').split('/').filter(Boolean);
    try {
      const doc = await getDocumentContent(slugArray);
      if (doc) {
        navItem.order = doc.order !== undefined ? doc.order : navItem.order;
        navItem.title = doc.title || navItem.title; // Prioritize frontmatter title
      }
    } catch (e) {
      // console.warn(`Could not fetch frontmatter for ${fullHref}, using order/title from config.`);
    }
  }

  if (configItem.children && configItem.children.length > 0) {
    navItem.items = await Promise.all(configItem.children.map(child => processNavConfigItem(child)));
    navItem.items.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.title.localeCompare(b.title));
  }

  return navItem;
}

export async function getNavigation(): Promise<NavItem[]> {
  const processedNav = await Promise.all(navigationConfig.map(processNavConfigItem));
  // Sort top-level items
  processedNav.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.title.localeCompare(b.title));
  return processedNav;
}


export async function getDocumentContent(slug: string[]): Promise<DocResult | null> {
  const isCustom404Page = slug.length === 1 && slug[0] === 'custom_404';
  const baseDir = isCustom404Page ? rootContentDir : contentDir;
  
  const normalizedSlugArray = slug.filter(Boolean); 
  const slugPath = normalizedSlugArray.join(path.sep);

  let fullPath: string | undefined;
  const potentialPaths: string[] = [];

  if (isCustom404Page) {
    // For custom_404.md, which is directly in src/content/
    potentialPaths.push(path.join(baseDir, `${slugPath}.md`));
  } else {
    if (normalizedSlugArray.length === 0) { // Root /docs page e.g. /docs/index.md or /docs/_index.md
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
    // console.warn(`[DocuCraft] Document not found for slug: ["${slug.join('", "')}"] (normalized: "${slugPath}"). Tried paths: ${potentialPaths.join(', ')}`);
    return null;
  }

  try {
    const fileContentString = await fs.readFile(fullPath, 'utf-8');
    const { data, content: bodyContent } = matter(fileContentString);

    let title = data.title;
    if (!title) {
      const fileName = path.basename(fullPath, '.md');
      if (fileName !== 'index' && fileName !== '_index') {
        title = normalizedSlugArray.length > 0 
          ? normalizedSlugArray[normalizedSlugArray.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
          : fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      } else {
        const parentDirName = path.basename(path.dirname(fullPath));
        if (parentDirName && parentDirName !== path.basename(baseDir) && parentDirName !== 'docs' && parentDirName !== 'content') {
          title = parentDirName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else {
          title = siteConfig.name; 
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
    // console.error(`[DocuCraft] Error reading or parsing document at "${fullPath}" for slug ["${slug.join('", "')}"]:`, error);
    return null;
  }
}


export async function getAllMarkdownPaths(): Promise<string[][]> {
  const navItems = await getNavigation(); // Use the processed navigation items
  const paths: string[][] = [];

  function extractPathsFromNavItems(items: NavItem[]) {
    for (const item of items) {
      // Only consider paths that are meant to be documents and not external or anchor links
      if (item.href && item.href.startsWith('/docs/') && !item.href.includes('#') && !item.isExternal) {
        // slugArray should be relative to /docs, so remove /docs/ prefix
        const slugArray = item.href.replace(/^\/docs\/?/, '').split('/').filter(Boolean);
        paths.push(slugArray);
      }
      if (item.items && item.items.length > 0) {
        extractPathsFromNavItems(item.items);
      }
    }
  }

  extractPathsFromNavItems(navItems);
  
  const uniquePathStrings = new Set(paths.map(p => p.join('/')));
  const uniquePaths = Array.from(uniquePathStrings).map(pStr => pStr === '' ? [] : pStr.split('/'));
  
  // Ensure root path `[]` (for /docs/index.md or /docs/_index.md) is included if defined in navItems
  const hasRootPathInNav = navItems.some(item => item.href === '/docs' || item.href === '/docs/');
  const rootPathExistsInUnique = uniquePaths.some(p => p.length === 0);

  if (hasRootPathInNav && !rootPathExistsInUnique) {
      // This case should be handled if item.href is '/docs' and slugArray becomes []
      // The check `pStr === '' ? []` already handles this.
  }
  
  return uniquePaths;
}

export async function getAllDocumentationContent(): Promise<string> {
  const allPaths = await getAllMarkdownPaths();
  let combinedContent = "";
  for (const slugArray of allPaths) {
    const doc = await getDocumentContent(slugArray);
    if (doc) {
      const pagePath = slugArray.length > 0 ? slugArray.join('/') : '(root: index or _index)';
      combinedContent += `\n\n## Page: /docs/${pagePath} (Title: ${doc.title})\n\n${doc.content}`;
    }
  }
  return combinedContent;
}

export async function getFirstDocPath(): Promise<string> {
  const navItems = await getNavigation(); 
  if (navItems.length === 0) {
    // console.warn("[DocuCraft] No navigation items found. Defaulting to /docs/introduction.");
    return '/docs/introduction'; // Fallback
  }

  function findFirstValidPath(items: NavItem[]): string | null {
    for (const item of items) {
      if (item.href && item.href.startsWith('/docs/') && !item.href.includes('#') && !item.isExternal) {
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
  
  // console.warn(`[DocuCraft] First valid navigation item href not found. Defaulting to /docs/introduction.`);
  return '/docs/introduction'; // Fallback
}


function getAllPagesInOrder(navItems: NavItem[]): { href: string; title: string }[] {
    const pages: { href: string; title: string }[] = [];
    function recurse(items: NavItem[]) {
        for (const item of items) {
            // Only include actual document pages for prev/next navigation
            if (item.href && item.href.startsWith('/docs/') && !item.href.includes('#') && !item.isExternal) {
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
  
  const normalizeHref = (href: string) => {
    let norm = href.replace(/\/(index|_index)$/, '');
    if (norm === '/docs/') norm = '/docs'; // Handle case where /docs/index becomes /docs/ then normalize to /docs
    return norm || '/docs'; // Ensure root like /docs if original was /docs/index
  };


  const normalizedCurrentPageHref = normalizeHref(currentHref);

  const currentIndex = allPages.findIndex(page => normalizeHref(page.href) === normalizedCurrentPageHref);

  if (currentIndex === -1) {
    // console.warn(`[getPrevNextDocs] Current href "${currentHref}" (normalized: "${normalizedCurrentPageHref}", from slug: "${currentSlugArray.join('/')}") not found in flattened navigation.`);
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const next = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  return { prev, next };
}
