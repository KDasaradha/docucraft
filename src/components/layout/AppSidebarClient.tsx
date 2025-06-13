// src/components/layout/AppSidebarClient.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar as DesktopSidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
  SidebarMenuSkeleton,
  SheetClose,
  SheetTitle,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { SheetContent as MobileSheetContent } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import type { NavItem } from '@/lib/docs'; 
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  ExternalLink, 
  ChevronDown, 
  X, 
  ChevronRight, 
  Home, 
  BookOpen, 
  Bookmark, 
  Star, 
  History, 
  Settings, 
  Moon, 
  Sun, 
  PanelLeft,
  Sparkles,
  Lightbulb,
  Compass,
  Search,
  Bell,
  MessageSquare,
  HelpCircle,
  FileText,
  Zap,
  Rocket,
  Heart,
  Clock,
  Layers,
  Code,
  Cpu,
  Database,
  GitBranch,
  Palette,
  Gauge,
  BarChart,
  Workflow
} from 'lucide-react'; 
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { CompactSearchDialog } from '@/components/search/CompactSearchDialog';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { siteConfig } from '@/config/site.config';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface AppSidebarClientProps {
  navigationItems: NavItem[];
}

interface RecursiveNavItemProps {
  item: NavItem;
  level: number;
  isCollapsed: boolean;
  currentPath: string;
  onLinkClick: () => void;
  initialOpen?: boolean;
}

// Reduced menu item animations
const menuItemVariants = {
  initial: { opacity: 0, x: -5, scale: 0.98 },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { 
      duration: 0.2, 
      ease: "easeOut",
      type: "spring",
      stiffness: 200,
      damping: 25
    } 
  },
  exit: { 
    opacity: 0, 
    x: -5, 
    scale: 0.98,
    transition: { duration: 0.15, ease: "easeIn" } 
  },
  hover: {
    x: 2,
    scale: 1.01,
    transition: { duration: 0.15, ease: "easeOut" }
  }
};

// Reduced submenu animations
const subMenuVariants = {
  open: { 
    height: 'auto', 
    opacity: 1,
    transition: { 
      duration: 0.25, 
      ease: "easeOut",
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  closed: { 
    height: 0, 
    opacity: 0, 
    transition: { 
      duration: 0.2, 
      ease: "easeIn",
      staggerChildren: 0.02,
      staggerDirection: -1
    }
  }
};

// Reduced sidebar section animations
const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const normalizePath = (p: string | undefined): string => {
  if (!p) return '#'; // Handle undefined href gracefully
  let normalized = p.replace(/\/(index|_index)(\.mdx?)?$/, '');
  if (normalized.endsWith('/') && normalized.length > 1 && normalized !== '/docs/') { 
    normalized = normalized.slice(0, -1);
  }
   // Ensure /docs/index or /docs/_index becomes /docs
  if (normalized === '/docs/index' || normalized === '/docs/_index') {
    return '/docs';
  }
  return normalized || '/docs'; // Default to /docs if path becomes empty (e.g. from /docs/ only)
};

// First, let's split the component into smaller parts to reduce complexity
interface ItemTitleContentProps {
  item: NavItem;
  isCollapsed: boolean;
  isMobile: boolean;
  isOpen: boolean;
}

const ItemTitleContent: React.FC<ItemTitleContentProps> = ({ item, isCollapsed, isMobile, isOpen }) => {
  // Determine icon based on item title or path
  const getItemIcon = () => {
    const title = item.title.toLowerCase();
    const href = item.href?.toLowerCase() || '';
    
    if (href.includes('/api')) return <Code className="h-4 w-4 text-blue-500" />;
    if (href.includes('/guide')) return <BookOpen className="h-4 w-4 text-green-500" />;
    if (href.includes('/tutorial')) return <Lightbulb className="h-4 w-4 text-amber-500" />;
    if (href.includes('/reference')) return <FileText className="h-4 w-4 text-purple-500" />;
    if (title.includes('getting started')) return <Rocket className="h-4 w-4 text-red-500" />;
    if (title.includes('config')) return <Settings className="h-4 w-4 text-gray-500" />;
    if (title.includes('database')) return <Database className="h-4 w-4 text-blue-600" />;
    if (title.includes('deploy')) return <Cpu className="h-4 w-4 text-indigo-500" />;
    if (title.includes('theme')) return <Palette className="h-4 w-4 text-pink-500" />;
    if (title.includes('performance')) return <Gauge className="h-4 w-4 text-orange-500" />;
    if (title.includes('analytics')) return <BarChart className="h-4 w-4 text-blue-400" />;
    if (title.includes('workflow')) return <Workflow className="h-4 w-4 text-teal-500" />;
    
    // Default icon for sections
    if (item.isSection) return <Layers className="h-4 w-4 text-sidebar-foreground/70" />;
    
    // Default icon for regular items
    return <FileText className="h-4 w-4 text-sidebar-foreground/70" />;
  };

  return (
    <>
      {/* Icon based on item type */}
      {!isCollapsed && !isMobile && (
        <div className="mr-2.5 shrink-0 flex items-center justify-center w-5">
          {getItemIcon()}
        </div>
      )}
      
      {/* Item title */}
      <span className={cn(
        "truncate flex-grow",
        item.isSection && "font-semibold text-sm",
        isCollapsed && !isMobile && "sr-only"
      )}>{item.title}</span>
      
      {/* External link indicator */}
      {item.isExternal && (!isCollapsed || isMobile) && (
        <ExternalLink className="ml-1.5 h-3.5 w-3.5 text-sidebar-foreground/60 shrink-0" />
      )}
      
      {/* New badge for recently added items */}
      {item.title.toLowerCase().includes('new') && (!isCollapsed || isMobile) && (
        <Badge variant="outline" className="ml-2 text-[0.65rem] py-0 h-4 px-1.5 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
          NEW
        </Badge>
      )}
      
      {/* Dropdown indicator for items with children */}
      {item.items && item.items.length > 0 && (!isCollapsed || isMobile) && (
        <motion.div 
          animate={{ rotate: isOpen ? 0 : -90 }} 
          transition={{ duration: 0.2, ease: "easeInOut" }} 
          className={cn("ml-auto shrink-0", isCollapsed && !isMobile && "hidden")}
        >
          <ChevronDown className="h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity duration-150" />
        </motion.div>
      )}
    </>
  );
};

interface SectionHeaderProps {
  item: NavItem;
  isCollapsed: boolean;
  isMobile: boolean;
  level: number;
}

interface BreadcrumbProps {
  navigationItems: NavItem[];
  currentPath: string;
  isCollapsed: boolean;
  isMobile: boolean;
}

const findPathToItem = (items: NavItem[], targetPath: string, currentPath: NavItem[] = []): NavItem[] | null => {
  for (const item of items) {
    const normalizedItemHref = normalizePath(item.href);
    const normalizedTargetPath = normalizePath(targetPath);
    
    if (normalizedItemHref === normalizedTargetPath && normalizedItemHref !== "#") {
      return [...currentPath, item];
    }
    
    if (item.items && item.items.length > 0) {
      const result = findPathToItem(item.items, targetPath, [...currentPath, item]);
      if (result) return result;
    }
  }
  return null;
};

const SidebarBreadcrumb: React.FC<BreadcrumbProps> = ({ navigationItems, currentPath, isCollapsed, isMobile }) => {
  const pathItems = findPathToItem(navigationItems, currentPath);
  
  if (!pathItems || pathItems.length === 0 || isCollapsed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-3 py-2 border-b border-sidebar-border/30 bg-sidebar-accent/10 backdrop-blur-sm"
    >
      <div className="flex items-center gap-1 text-xs text-sidebar-foreground/70 overflow-x-auto sidebar-scroll pb-1">
        <Home className="h-3 w-3 shrink-0" />
        {pathItems.map((item, index) => (
          <React.Fragment key={item.href || item.title}>
            <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />
            <Link 
              href={item.href || '#'} 
              className={cn(
                "truncate hover:text-sidebar-foreground transition-colors whitespace-nowrap",
                index === pathItems.length - 1 ? 
                  "text-sidebar-accent-foreground font-medium" : 
                  "text-sidebar-foreground/70"
              )}
              title={item.title}
            >
              {item.title}
            </Link>
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ item, isCollapsed, isMobile, level }) => (
  <motion.div 
    variants={menuItemVariants}
    className={cn(
      "px-4 pt-6 pb-2.5 text-xs font-semibold text-sidebar-foreground/80 tracking-wider uppercase select-none truncate",
      "border-b border-sidebar-border/30 mb-3",
      level > 0 && "pt-4 pb-2 text-sidebar-foreground/70 border-b-0 mb-2",
      isCollapsed && !isMobile && "text-center px-1 text-[0.6rem] py-2 border-b-0 flex justify-center"
    )}
  >
    {isCollapsed && !isMobile ? (
      <div className="w-6 h-6 rounded-full bg-sidebar-accent/50 flex items-center justify-center text-[0.6rem] font-bold">
        {item.title.substring(0,1).toUpperCase()}
      </div>
    ) : (
      <div className="flex items-center gap-2.5 w-full">
        <Layers className="h-4 w-4 text-sidebar-foreground/70 shrink-0" />
        <span className="truncate font-medium">{item.title}</span>
        {level === 0 && (
          <div className="flex-1 h-px bg-gradient-to-r from-sidebar-border/40 to-transparent ml-1.5" />
        )}
      </div>
    )}
  </motion.div>
);

// Refactor RecursiveNavItem for lower cognitive complexity and robust type usage
const RecursiveNavItem: React.FC<RecursiveNavItemProps> = ({
  item,
  level,
  isCollapsed,
  currentPath,
  onLinkClick,
  initialOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const { isMobile } = useSidebar();

  const normalizedItemHref = normalizePath(item.href);
  const normalizedCurrentPath = normalizePath(currentPath);
  const isDirectlyActive = normalizedItemHref === normalizedCurrentPath && normalizedItemHref !== "#";
  const hasSubItems = (item.items?.length ?? 0) > 0;

  useEffect(() => {
    if (hasSubItems && normalizedCurrentPath.startsWith(normalizedItemHref + "/")) {
      setIsOpen(true);
    }
  }, [hasSubItems, normalizedCurrentPath, normalizedItemHref]);

  const isActiveAncestor =
    normalizedItemHref !== '#' &&
    normalizedCurrentPath.startsWith(normalizedItemHref + '/') && 
    hasSubItems;

  // Check if this item is in the active path (breadcrumb-style highlighting)
  const isInActivePath = 
    normalizedItemHref !== '#' &&
    (normalizedCurrentPath.startsWith(normalizedItemHref + '/') || isDirectlyActive);
  
  useEffect(() => {
    if (isActiveAncestor && !isOpen) setIsOpen(true);
  }, [isActiveAncestor, isOpen]);

  const isFolderLink = item.href && !item.href.startsWith('http') && !item.href.startsWith('#') && !item.isExternal;
  const isPureSectionHeader = item.isSection && level === 0 && !hasSubItems && (!item.href || item.href === '#');
  const isSubSectionHeader = item.isSection && level > 0 && !isFolderLink && !hasSubItems;

  if (isPureSectionHeader || isSubSectionHeader) {
    return <SectionHeader item={item} isCollapsed={isCollapsed} isMobile={isMobile} level={level} />;
  }
  
  const handleToggleOrNavigate = (e: React.MouseEvent) => {
    if (hasSubItems && (!item.href || item.href === '#' || (item.isSection && !isFolderLink))) {
      setIsOpen(!isOpen);
      if (item.isSection && !isFolderLink && item.href === '#') {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    if (item.href && item.href !== '#') onLinkClick();
  };

  const buttonContent = (
    <SidebarMenuButton
      onClick={handleToggleOrNavigate}
      tooltip={isCollapsed && !isMobile ? item.title : undefined}
      aria-expanded={isOpen}
      isActive={isDirectlyActive}
      level={level}
      className={cn(
        "sidebar-item-hover",
        isCollapsed && !isMobile && "justify-center",
        // Enhanced active state styling
        isDirectlyActive && "ring-1 ring-sidebar-ring/30 shadow-sm font-medium",
        // Breadcrumb-style highlighting for ancestor items
        isInActivePath && !isDirectlyActive && "bg-sidebar-accent/20 text-sidebar-accent-foreground/90",
        // Improved hover states
        "transition-all duration-150 ease-in-out",
        "hover:shadow-sm hover:scale-[1.01]",
        // Better focus states
        "focus-visible:ring-1 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1",
        // Consistent spacing
        "my-0.5 rounded-md"
      )}
      hasSubItems={hasSubItems}
      isOpen={isOpen}
    >
      <ItemTitleContent 
        item={item} 
        isCollapsed={isCollapsed} 
        isMobile={isMobile} 
        isOpen={isOpen} 
      />
    </SidebarMenuButton>
  );

  return (
    <motion.li 
      variants={menuItemVariants} 
      className={cn(
        "list-none relative",
        // Add visual indicator for active path
        isDirectlyActive && "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-sidebar-primary before:rounded-r-full sidebar-active-indicator",
        isInActivePath && !isDirectlyActive && "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-sidebar-accent-foreground/40 before:rounded-r-full"
      )}
      whileHover="hover"
      transition={{ duration: 0.15 }}
    >
      {item.href && item.href !== '#' ? (
        <Link 
          href={item.href} 
          target={item.isExternal ? '_blank' : undefined}
          rel={item.isExternal ? 'noopener noreferrer' : undefined}
          passHref 
          legacyBehavior
        >
          {React.cloneElement(buttonContent, { 'aria-current': isDirectlyActive ? 'page' : undefined })}
        </Link>
      ) : (
        React.cloneElement(buttonContent, { 
          'aria-current': isDirectlyActive ? 'page' : undefined,
          role: hasSubItems ? 'button' : 'heading',
          'aria-level': level + 2
        })
      )}
      {(!isCollapsed || isMobile) && hasSubItems && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.ul
              variants={subMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className={cn(
                "submenu-list relative",
                // Enhanced submenu styling
                "ml-3 border-l border-sidebar-border/40 pl-3 space-y-0.5 py-1",
                // Add subtle background for active submenu
                isInActivePath && "border-l-sidebar-accent-foreground/30 bg-sidebar-accent/5"
              )}
            >
              {item.items?.map((subItem, index) => (
                <RecursiveNavItem
                  key={`${subItem.href || subItem.title}-${index}`}
                  item={subItem}
                  level={level + 1}
                  isCollapsed={isCollapsed}
                  currentPath={currentPath}
                  onLinkClick={onLinkClick}
                  initialOpen={subItem.href ? currentPath.startsWith(normalizePath(subItem.href)) : false}
                />
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      )}
    </motion.li>
  );
};

// New component for quick access buttons with enhanced styling
const QuickAccessButtons: React.FC<{isCollapsed: boolean}> = ({ isCollapsed }) => {
  const { setTheme, theme } = useTheme();
  
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);
  
  return (
    <div className={cn(
      "flex gap-1 mt-2 px-2",
      isCollapsed ? "flex-col items-center" : "flex-row flex-wrap justify-center"
    )}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 bg-sidebar-accent/10 border-sidebar-border/50 hover:bg-sidebar-accent/20 sidebar-toggle-button"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Toggle theme</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 bg-sidebar-accent/10 border-sidebar-border/50 hover:bg-sidebar-accent/20 sidebar-toggle-button"
              asChild
            >
              <Link href="/docs">
                <Compass className="h-4 w-4" />
                <span className="sr-only">Documentation home</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Documentation home</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 bg-sidebar-accent/10 border-sidebar-border/50 hover:bg-sidebar-accent/20 sidebar-toggle-button"
              asChild
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                <span className="sr-only">Home page</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Home page</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 bg-sidebar-accent/10 border-sidebar-border/50 hover:bg-sidebar-accent/20 sidebar-toggle-button"
              asChild
            >
              <Link href="/help">
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Help center</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Help center</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

// New component for bookmarks section with enhanced styling
const BookmarksSection: React.FC<{isCollapsed: boolean}> = ({ isCollapsed }) => {
  // This would be connected to a real bookmarking system in a full implementation
  const bookmarks = [
    { title: "Getting Started", href: "/docs/introduction", icon: <Rocket className="h-3.5 w-3.5 text-red-500" /> },
    { title: "API Reference", href: "/docs/api", icon: <Code className="h-3.5 w-3.5 text-blue-500" /> },
    { title: "Configuration", href: "/docs/configuration", icon: <Settings className="h-3.5 w-3.5 text-gray-500" /> },
  ];
  
  if (isCollapsed) return null;
  
  return (
    <motion.div 
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="px-3 py-2 mt-2"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-2">
        <Bookmark className="h-3.5 w-3.5" />
        <span>Bookmarks</span>
        <div className="flex-1 h-px bg-gradient-to-r from-sidebar-border/30 to-transparent" />
      </div>
      <ul className="space-y-1">
        {bookmarks.map((bookmark, index) => (
          <motion.li 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link 
              href={bookmark.href}
              className="text-xs text-sidebar-foreground/80 hover:text-sidebar-foreground flex items-center gap-1.5 py-1.5 px-2 rounded-md hover:bg-sidebar-accent/20 transition-colors sidebar-item-hover"
            >
              {bookmark.icon}
              <span className="truncate">{bookmark.title}</span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

// New component for recent pages section with enhanced styling
const RecentPagesSection: React.FC<{isCollapsed: boolean}> = ({ isCollapsed }) => {
  // This would be connected to a real history system in a full implementation
  const recentPages = [
    { title: "Installation Guide", href: "/docs/installation", timestamp: "2 hours ago" },
    { title: "Configuration", href: "/docs/configuration", timestamp: "Yesterday" },
    { title: "Deployment", href: "/docs/deployment", timestamp: "3 days ago" },
  ];
  
  if (isCollapsed) return null;
  
  return (
    <motion.div 
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.1 }}
      className="px-3 py-2"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-2">
        <History className="h-3.5 w-3.5" />
        <span>Recent Pages</span>
        <div className="flex-1 h-px bg-gradient-to-r from-sidebar-border/30 to-transparent" />
      </div>
      <ul className="space-y-1">
        {recentPages.map((page, index) => (
          <motion.li 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <Link 
              href={page.href}
              className="text-xs text-sidebar-foreground/80 hover:text-sidebar-foreground flex items-center gap-1.5 py-1.5 px-2 rounded-md hover:bg-sidebar-accent/20 transition-colors sidebar-item-hover group"
            >
              <div className="flex-1 min-w-0">
                <div className="truncate">{page.title}</div>
                <div className="text-[0.65rem] text-sidebar-foreground/50 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{page.timestamp}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove from history"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove from history</span>
              </Button>
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

// New component for progress tracking
const ProgressTracker: React.FC<{isCollapsed: boolean}> = ({ isCollapsed }) => {
  if (isCollapsed) return null;
  
  return (
    <motion.div 
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.2 }}
      className="px-3 py-2"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-2">
        <Gauge className="h-3.5 w-3.5" />
        <span>Your Progress</span>
        <div className="flex-1 h-px bg-gradient-to-r from-sidebar-border/30 to-transparent" />
      </div>
      <div className="bg-sidebar-accent/10 rounded-lg p-3 border border-sidebar-border/30">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium">Documentation</span>
          <span className="text-xs text-sidebar-foreground/70">65%</span>
        </div>
        <Progress value={65} className="h-1.5 mb-3" />
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium">API Reference</span>
          <span className="text-xs text-sidebar-foreground/70">40%</span>
        </div>
        <Progress value={40} className="h-1.5 mb-3" />
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium">Tutorials</span>
          <span className="text-xs text-sidebar-foreground/70">80%</span>
        </div>
        <Progress value={80} className="h-1.5" />
      </div>
    </motion.div>
  );
};

// New component for featured content with enhanced styling
const FeaturedContent: React.FC<{isCollapsed: boolean}> = ({ isCollapsed }) => {
  if (isCollapsed) return null;
  
  return (
    <motion.div 
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.3 }}
      className="px-3 py-3 mt-2"
    >
      <div className="rounded-lg bg-gradient-to-br from-sidebar-accent/30 to-sidebar-accent/10 p-3 border border-sidebar-border/30 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h4 className="text-sm font-medium">Featured Guide</h4>
        </div>
        <p className="text-xs text-sidebar-foreground/80 mb-2">
          Learn how to get the most out of our documentation system with interactive examples.
        </p>
        <Button size="sm" variant="outline" className="w-full text-xs h-7 group" asChild>
          <Link href="/docs/guide">
            <Lightbulb className="h-3 w-3 mr-1 group-hover:text-amber-500 transition-colors" />
            <span>Read Guide</span>
            <ChevronRight className="h-3 w-3 ml-auto opacity-70 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

// New component for notifications
const NotificationsSection: React.FC<{isCollapsed: boolean}> = ({ isCollapsed }) => {
  if (isCollapsed) return null;
  
  return (
    <motion.div 
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.4 }}
      className="px-3 py-2"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-2">
        <Bell className="h-3.5 w-3.5" />
        <span>Notifications</span>
        <Badge variant="outline" className="ml-auto text-[0.65rem] py-0 h-4 px-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
          3 New
        </Badge>
      </div>
      <ul className="space-y-1">
        <motion.li 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-sidebar-accent/10 rounded-md p-2 border border-sidebar-border/30"
        >
          <div className="flex items-start gap-2">
            <div className="bg-blue-500/20 rounded-full p-1 mt-0.5">
              <Zap className="h-3 w-3 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">New API Documentation</p>
              <p className="text-[0.65rem] text-sidebar-foreground/70 mt-0.5">
                Check out the latest API endpoints and examples.
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Button variant="ghost" size="sm" className="h-6 text-[0.65rem] px-2">
                  Dismiss
                </Button>
                <Button variant="outline" size="sm" className="h-6 text-[0.65rem] px-2" asChild>
                  <Link href="/docs/api">View</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.li>
      </ul>
    </motion.div>
  );
};

// New component for user profile section with enhanced styling
const UserProfileSection: React.FC<{isCollapsed: boolean}> = ({ isCollapsed }) => {
  const { setTheme, theme } = useTheme();
  
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 border-t border-sidebar-border/30 bg-sidebar-accent/10 sidebar-footer",
      isCollapsed && "justify-center"
    )}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
            <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
              <AvatarImage src={siteConfig.assets.logo} alt={siteConfig.author} />
              <AvatarFallback>{siteConfig.author.substring(0, 2)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{siteConfig.author}</p>
              <p className="text-xs leading-none text-muted-foreground">
                user@example.com
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bookmark className="mr-2 h-4 w-4" />
              <span>Bookmarks</span>
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sun className="mr-2 h-4 w-4" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-2">
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light">
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <Laptop className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem>
              <Languages className="mr-2 h-4 w-4" />
              <span>Language</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{siteConfig.author}</p>
          <p className="text-xs text-sidebar-foreground/60 truncate">User</p>
        </div>
      )}
    </div>
  );
};

// New component for sidebar toggle button with enhanced styling
const SidebarToggleButton: React.FC = () => {
  const { toggleSidebar, state } = useSidebar();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="h-8 w-8 absolute -right-4 top-20 bg-sidebar border border-sidebar-border rounded-full shadow-sm z-50 hover:bg-sidebar-accent/50 sidebar-toggle-button"
      aria-label={state === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <PanelLeft className={cn(
        "h-4 w-4 transition-transform duration-150",
        state === 'collapsed' ? "rotate-180" : "rotate-0"
      )} />
    </Button>
  );
};

// New component for sidebar tabs
const SidebarTabs: React.FC<{
  navigationItems: NavItem[];
  isCollapsed: boolean;
  currentPath: string;
  onLinkClick: () => void;
}> = ({ navigationItems, isCollapsed, currentPath, onLinkClick }) => {
  if (isCollapsed) return null;
  
  return (
    <Tabs defaultValue="navigation" className="w-full">
      <TabsList className="grid grid-cols-3 h-9 mb-2">
        <TabsTrigger value="navigation" className="text-xs">Navigation</TabsTrigger>
        <TabsTrigger value="bookmarks" className="text-xs">Bookmarks</TabsTrigger>
        <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="navigation" className="mt-0 p-0">
        <SidebarMenu>
          {navigationItems.map((item, index) => (
            <RecursiveNavItem
              key={`${item.href || item.title}-${item.order}-${index}`}
              item={item}
              level={0}
              isCollapsed={isCollapsed}
              currentPath={currentPath}
              onLinkClick={onLinkClick}
              initialOpen={!!(item.href && currentPath.startsWith(normalizePath(item.href)))}
            />
          ))}
        </SidebarMenu>
      </TabsContent>
      
      <TabsContent value="bookmarks" className="mt-0 p-0">
        <div className="p-3">
          <BookmarksSection isCollapsed={isCollapsed} />
          <RecentPagesSection isCollapsed={isCollapsed} />
        </div>
      </TabsContent>
      
      <TabsContent value="settings" className="mt-0 p-0">
        <div className="p-3 space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Display Settings</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="dense-mode" className="text-xs">Dense Mode</Label>
                <Switch id="dense-mode" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-icons" className="text-xs">Show Icons</Label>
                <Switch id="show-icons" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-collapse" className="text-xs">Auto-collapse Sections</Label>
                <Switch id="auto-collapse" />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium mb-2">Theme</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="h-8 justify-start text-xs">
                <Sun className="h-3.5 w-3.5 mr-1" />
                Light
              </Button>
              <Button variant="outline" size="sm" className="h-8 justify-start text-xs">
                <Moon className="h-3.5 w-3.5 mr-1" />
                Dark
              </Button>
              <Button variant="outline" size="sm" className="h-8 justify-start text-xs">
                <Laptop className="h-3.5 w-3.5 mr-1" />
                System
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium mb-2">Font Size</h3>
            <div className="flex items-center">
              <Button variant="outline" size="sm" className="h-7 px-2">
                <Minus className="h-3 w-3" />
              </Button>
              <div className="flex-1 text-center text-xs">Medium</div>
              <Button variant="outline" size="sm" className="h-7 px-2">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

// New component for mini search
const MiniSearch: React.FC<{isCollapsed: boolean}> = ({ isCollapsed }) => {
  if (isCollapsed) return null;
  
  return (
    <div className="px-4 py-3 mb-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/60" />
        <Input 
          type="search"
          placeholder="Quick search..."
          className="h-9 pl-9 pr-3 text-sm bg-sidebar-accent/15 border-sidebar-border/60 rounded-md focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>
    </div>
  );
};

// New component for sidebar header with logo
const SidebarHeaderWithLogo: React.FC<{isCollapsed: boolean}> = ({ isCollapsed }) => {
  return (
    <div className="flex items-center gap-2 px-3">
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={siteConfig.assets.logo} alt={siteConfig.name} />
          <AvatarFallback>{siteConfig.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
      </div>
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold truncate">{siteConfig.name}</h2>
          <p className="text-xs text-sidebar-foreground/60 truncate">Documentation</p>
        </div>
      )}
    </div>
  );
};

// Missing icon components
const User = ({ className, ...props }: React.ComponentProps<typeof Bookmark>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-user", className)}
    {...props}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogOut = ({ className, ...props }: React.ComponentProps<typeof Bookmark>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-log-out", className)}
    {...props}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const Laptop = ({ className, ...props }: React.ComponentProps<typeof Bookmark>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-laptop", className)}
    {...props}
  >
    <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
  </svg>
);

const Languages = ({ className, ...props }: React.ComponentProps<typeof Bookmark>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-languages", className)}
    {...props}
  >
    <path d="m5 8 6 6" />
    <path d="m4 14 6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="m22 22-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>
);

const Plus = ({ className, ...props }: React.ComponentProps<typeof Bookmark>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-plus", className)}
    {...props}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const Minus = ({ className, ...props }: React.ComponentProps<typeof Bookmark>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-minus", className)}
    {...props}
  >
    <path d="M5 12h14" />
  </svg>
);

export default function AppSidebarClient({ navigationItems }: Readonly<AppSidebarClientProps>) {
  const { isMobile, setOpenMobile, isResizing, state: sidebarStateHook, collapsible: collapsibleTypeHook, defaultOpen: contextDefaultOpen, initialCollapsible: contextInitialCollapsible } = useSidebar();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("navigation");

  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Add smooth scroll to active item when page loads
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        const activeElement = document.querySelector('[aria-current="page"]');
        if (activeElement) {
          activeElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, isLoading]);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isCollapsed = !isMobile && sidebarStateHook === "collapsed";
  
  // Animated sidebar content with staggered animations
  const sidebarMenuContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-col h-full"
    >
      {/* Mini search for filtering navigation */}
      {/* <MiniSearch isCollapsed={isCollapsed} /> */}
      
      {/* Main navigation menu */}
      <SidebarMenu className={cn(isCollapsed ? "px-1.5" : "px-3", "pt-1")}> 
        {navigationItems.map((item, index) => (
          <RecursiveNavItem
            key={`${item.href || item.title}-${item.order}-${index}`}
            item={item}
            level={0}
            isCollapsed={isCollapsed}
            currentPath={pathname}
            onLinkClick={handleLinkClick}
            initialOpen={!!(item.href && pathname.startsWith(normalizePath(item.href)))}
          />
        ))}
      </SidebarMenu>
      
      {/* Quick access buttons */}
      <QuickAccessButtons isCollapsed={isCollapsed} />
      
      {/* Divider */}
      {!isCollapsed && <div className="sidebar-section-divider mx-3 my-3" />}
      
      {/* Bookmarks section */}
      <BookmarksSection isCollapsed={isCollapsed} />
      
      {/* Recent pages section */}
      <RecentPagesSection isCollapsed={isCollapsed} />
      
      {/* Progress tracker */}
      <ProgressTracker isCollapsed={isCollapsed} />
      
      {/* Featured content */}
      <FeaturedContent isCollapsed={isCollapsed} />
      
      {/* Notifications */}
      <NotificationsSection isCollapsed={isCollapsed} />
      
      {/* Spacer to push user profile to bottom */}
      <div className="flex-1" />
    </motion.div>
  );
  
  // Skeleton loader for sidebar
  const sidebarSkeleton = (
    <div className={cn("p-2 space-y-0.5", isCollapsed && "px-1.5")}>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <SidebarMenuSkeleton key={i} showText={!isCollapsed} />
        </motion.div>
      ))}
    </div>
  );

  // Main sidebar structure
  const sidebarStructure = (
    <>
      <SidebarBreadcrumb 
        navigationItems={navigationItems}
        currentPath={pathname}
        isCollapsed={isCollapsed}
        isMobile={isMobile}
      />

      <SidebarHeader className={cn(
        isMobile && "justify-between", 
        "p-3 border-b border-sidebar-border flex items-center gap-2",
        "bg-gradient-to-b from-sidebar-accent/20 to-transparent"
      )}>  
        {/* <SidebarHeaderWithLogo isCollapsed={isCollapsed} /> */}
        
        {!isCollapsed && !isMobile && (
          <CompactSearchDialog 
            navigationItems={navigationItems} 
            onNavigate={handleLinkClick}
            className="w-full"
            placeholder="Quick search..."
          />
        )}
        
        {isMobile && (
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close menu</span>
            </Button>
          </SheetClose>
        )}
      </SidebarHeader>
      
      <SidebarContent className={cn("flex-1", isResizing && "!cursor-ew-resize", "sidebar-scroll")}>
        <ScrollArea className="h-full"> 
          {isLoading ? sidebarSkeleton : sidebarMenuContent}
        </ScrollArea>
      </SidebarContent>
      
      {/* User profile section */}
      <SidebarFooter className="p-0">
        <UserProfileSection isCollapsed={isCollapsed} />
      </SidebarFooter>
      
      {/* Sidebar toggle button */}
      {!isMobile && !isCollapsed && <SidebarToggleButton />}
    </>
  );

  // Loading state
  if (isLoading) { 
    // Use context values for initialCollapsible and defaultOpen
    const initialCollapsibleFromContext = contextInitialCollapsible;
    const defaultOpenFromContext = contextDefaultOpen;
    return (
      <aside className={cn(
        "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground fixed top-[var(--header-height)] bottom-0 left-0 z-30 sidebar-enhanced",
        initialCollapsibleFromContext === 'icon' && !defaultOpenFromContext ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]" 
      )}>
         <SidebarHeader className={cn(
           "p-3 border-b border-sidebar-border flex items-center", 
           initialCollapsibleFromContext === 'icon' && !defaultOpenFromContext && "justify-center",
           "bg-gradient-to-b from-sidebar-accent/20 to-transparent"
         )}>
          <div className="animate-pulse rounded-full bg-sidebar-accent/30 h-8 w-8"></div>
          {!(initialCollapsibleFromContext === 'icon' && !defaultOpenFromContext) && (
            <div className="ml-2 flex-1 space-y-2">
              <div className="animate-pulse h-3 bg-sidebar-accent/30 rounded w-24"></div>
              <div className="animate-pulse h-2 bg-sidebar-accent/20 rounded w-16"></div>
            </div>
          )}
        </SidebarHeader>
        <ScrollArea className="flex-1">
          {sidebarSkeleton}
        </ScrollArea>
      </aside>
    );
  }
  
  // Mobile sidebar
  if (isMobile) {
    return (
      <MobileSheetContent side="left" className={cn("p-0 flex flex-col w-[var(--sidebar-width)]")}>
        <SheetTitle className="sr-only">Main Menu</SheetTitle> 
        {sidebarStructure}
      </MobileSheetContent>
    );
  }

  // Desktop sidebar
  return (
    <DesktopSidebar 
      className={cn(
        "fixed top-[var(--header-height)] bottom-0 left-0 z-30",
        "shadow-lg shadow-sidebar-border/10 sidebar-enhanced"
      )}
      collapsibleType={collapsibleTypeHook} 
    >
      {sidebarStructure}
    </DesktopSidebar>
  );
}