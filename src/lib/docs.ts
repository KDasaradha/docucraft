
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { navigationConfig, type NavConfigItem } from '@/config/navigation'; // Import from new config

export interface NavItem {
  title: string;
  href: string;
  order?: number;
  items?: NavItem[]; // Changed from children back to items to match AppSidebarClient
  isExternal?: boolean;
}

const contentDir = path.join(process.cwd(), 'src', 'content', 'docs');
const rootContentDir = path.join(process.cwd(), 'src', 'content');

export interface DocResult {
  content: string;
  title: string;
  description?: string;
  order?: number; // Added order to DocResult
  filePath: string;
}


// Function to transform NavConfigItem to NavItem, potentially fetching order from frontmatter
async function processNavConfigItem(configItem: NavConfigItem): Promise<NavItem> {
  const navItem: NavItem = {
    title: configItem.title,
    href: configItem.path || '#', // Default href if path is undefined
    order: configItem.order,
    isExternal: configItem.isExternal,
  };

  // If path exists and it's not an anchor link, try to get order from frontmatter
  if (configItem.path && !configItem.path.includes('#') && !configItem.isExternal) {
    const slugArray = configItem.path.replace(/^\/docs\/?/, '').split('/').filter(Boolean);
    if (slugArray.length > 0 || configItem.path === '/docs') { // Check if it's a content page or root /docs
        try {
            const doc = await getDocumentContent(slugArray.length > 0 ? slugArray : []); // Pass empty for root /docs
            if (doc && doc.order !== undefined) {
                navItem.order = doc.order;
            }
        } catch (e) {
            // console.warn(`Could not fetch frontmatter for ${configItem.path}, using order from config.`);
        }
    }
  }


  if (configItem.children && configItem.children.length > 0) {
    navItem.items = await Promise.all(configItem.children.map(processNavConfigItem));
    // Sort children by their order
    navItem.items.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.title.localeCompare(b.title));
  }

  return navItem;
}

export async function getNavigation(): Promise<NavItem[]> {
  const processedNav = await Promise.all(navigationConfig.map(processNavConfigItem));
  // Sort top-level items by their order
  processedNav.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.title.localeCompare(b.title));
  return processedNav;
}


export async function getDocumentContent(slug: string[]): Promise<DocResult | null> {
  const originalSlugForLog = slug.join('/');
  const isCustomPage = slug.length === 1 && slug[0] === 'custom_404';
  const currentContentDir = isCustomPage ? rootContentDir : contentDir;
  
  let processedSlugArray = [...slug]; 

  // Correctly handle root /docs page (slug array is empty or [''])
  let slugPathForFile = processedSlugArray.filter(Boolean).join('/');
  
  let baseFilePathWithoutExt: string;
  let actualFilePath: string | undefined;
  let isDirectoryAttempt = false;

  if (slugPathForFile === '' || slugPathForFile === '/') { // Root /docs page
    baseFilePathWithoutExt = currentContentDir; // Base is contentDir itself
    isDirectoryAttempt = true; // Treat as directory to look for index.md or _index.md
  } else {
    baseFilePathWithoutExt = path.join(currentContentDir, slugPathForFile);
  }

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

    if (!actualFilePath && slugPathForFile !== '') { // Don't add .md if slugPathForFile is empty (root)
      const mdFilePath = baseFilePathWithoutExt + '.md';
      if ((await fs.stat(mdFilePath).catch(() => null))?.isFile()) {
        actualFilePath = mdFilePath;
      }
    }
    
    // This specific check for root /docs index.md or _index.md might be redundant if the above logic handles it
    // It was intended for the case where slug is []
    if (processedSlugArray.length === 0 && slugPathForFile === '' && !actualFilePath && !isCustomPage) { 
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
            if (parentDirName !== path.basename(contentDir) && parentDirName !== path.basename(rootContentDir)) {
                 title = parentDirName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            } else {
                title = data.site_name || "Documentation Home";
            }
        }
      }
      
      return {
        content: bodyContent,
        title,
        description: data.description,
        order: data.order !== undefined ? Number(data.order) : undefined,
        filePath: actualFilePath,
      };
    }
    
    console.warn(`[DocuCraft] Document not found. Original Slug: '${originalSlugForLog}', Processed Slug Array for File: '${slugPathForFile}', Base path tried: '${baseFilePathWithoutExt}', IsDirAttempt: ${isDirectoryAttempt}`);
    return null;
  } catch (error) {
    console.error(`[DocuCraft] Error in getDocumentContent for original slug "${originalSlugForLog}":`, error);
    return null;
  }
}


export async function getAllMarkdownPaths(): Promise<string[][]> {
  const paths: string[][] = [];
  
  // Helper function to extract file paths from NavConfigItem recursively
  function extractPathsFromConfig(items: NavConfigItem[], currentPathParts: string[] = []) {
    for (const item of items) {
      if (item.path && !item.path.includes('#') && !item.isExternal) {
        // Convert href path to slug array
        // e.g., /docs/category/page -> ['category', 'page']
        // e.g., /docs -> []
        const slugArray = item.path.replace(/^\/docs\/?/, '').split('/').filter(Boolean);
        paths.push(slugArray);
      }
      if (item.children) {
        // For children, the parent's path part is already included if it's a directory structure
        // This logic might need refinement based on how paths are structured in config
        extractPathsFromConfig(item.children, currentPathParts);
      }
    }
  }

  extractPathsFromConfig(navigationConfig);

  // Deduplicate paths
  const uniquePaths = Array.from(new Set(paths.map(p => p.join('/'))))
    .map(pStr => pStr.split('/').filter(Boolean));
  
  // Ensure root path `[]` is included if /docs is in navigationConfig
  if (navigationConfig.some(item => item.path === '/docs')) {
    if (!uniquePaths.some(p => p.length === 0)) {
      uniquePaths.push([]);
    }
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
    return '/docs/introduction';
  }

  function findFirstValidPath(items: NavItem[]): string | null {
    for (const item of items) {
      if (item.href && item.href !== '#') {
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
  
  console.warn(`[DocuCraft] First valid navigation item href not found. Defaulting. NavItems: ${JSON.stringify(navItems)}`);
  return '/docs/introduction';
}


function getAllPagesInOrder(navItems: NavItem[]): { href: string; title: string }[] {
    const pages: { href: string; title: string }[] = [];
    function recurse(items: NavItem[]) {
        for (const item of items) {
            if (item.href && item.href !== '#' && !item.href.startsWith('http') && !item.href.includes('#')) {
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
  if (currentSlugArray.length > 0 && !(currentSlugArray.length === 1 && currentSlugArray[0] === '')) {
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
