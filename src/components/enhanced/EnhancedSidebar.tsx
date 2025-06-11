"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  Star, 
  StarOff, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Folder, 
  FolderOpen,
  Clock,
  TrendingUp,
  Filter,
  SortAsc,
  Bookmark,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  children?: NavItem[];
  icon?: React.ElementType;
  isNew?: boolean;
  isUpdated?: boolean;
  lastModified?: Date;
  category?: string;
}

interface BookmarkItem {
  path: string;
  title: string;
  timestamp: number;
  category?: string;
}

interface RecentItem {
  path: string;
  title: string;
  timestamp: number;
  visitCount: number;
}

// Bookmark management hook
const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-bookmarks');
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored));
      } catch {
        setBookmarks([]);
      }
    }
  }, []);
  
  const saveBookmarks = (newBookmarks: BookmarkItem[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem('sidebar-bookmarks', JSON.stringify(newBookmarks));
  };
  
  const addBookmark = (item: Omit<BookmarkItem, 'timestamp'>) => {
    const newBookmark = { ...item, timestamp: Date.now() };
    const filtered = bookmarks.filter(b => b.path !== item.path);
    saveBookmarks([newBookmark, ...filtered]);
  };
  
  const removeBookmark = (path: string) => {
    saveBookmarks(bookmarks.filter(b => b.path !== path));
  };
  
  const isBookmarked = (path: string) => {
    return bookmarks.some(b => b.path === path);
  };
  
  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
};

// Recent pages hook
const useRecentPages = () => {
  const [recentPages, setRecentPages] = useState<RecentItem[]>([]);
  const pathname = usePathname();
  
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-recent-pages');
    if (stored) {
      try {
        setRecentPages(JSON.parse(stored));
      } catch {
        setRecentPages([]);
      }
    }
  }, []);
  
  useEffect(() => {
    if (pathname) {
      const title = document.title || pathname;
      const existing = recentPages.find(p => p.path === pathname);
      
      let updated: RecentItem[];
      if (existing) {
        updated = recentPages.map(p => 
          p.path === pathname 
            ? { ...p, timestamp: Date.now(), visitCount: p.visitCount + 1 }
            : p
        );
      } else {
        const newItem: RecentItem = {
          path: pathname,
          title,
          timestamp: Date.now(),
          visitCount: 1
        };
        updated = [newItem, ...recentPages.slice(0, 9)]; // Keep only 10 recent items
      }
      
      setRecentPages(updated);
      localStorage.setItem('sidebar-recent-pages', JSON.stringify(updated));
    }
  }, [pathname, recentPages]);
  
  return recentPages.sort((a, b) => b.timestamp - a.timestamp);
};

// Scroll memory hook
const useSidebarScrollMemory = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-scroll-position');
    if (saved && scrollAreaRef.current) {
      const position = parseInt(saved);
      setScrollPosition(position);
      // Find the scrollable viewport within the ScrollArea
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (viewport) {
        viewport.scrollTop = position;
      }
    }
  }, []);
  
  const saveScrollPosition = useCallback((position: number) => {
    setScrollPosition(position);
    localStorage.setItem('sidebar-scroll-position', position.toString());
  }, []);
  
  // Set up scroll event listener
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
    
    const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!viewport) return;
    
    const handleScroll = () => {
      saveScrollPosition(viewport.scrollTop);
    };
    
    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [saveScrollPosition]);
  
  return { scrollPosition, saveScrollPosition, scrollAreaRef };
};

// Navigation item component
const NavigationItem = ({ 
  item, 
  level = 0, 
  isExpanded, 
  onToggleExpand, 
  isBookmarked, 
  onBookmarkToggle, 
  searchQuery,
  currentPath 
}: {
  item: NavItem;
  level?: number;
  isExpanded: boolean;
  onToggleExpand: (href: string) => void;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  searchQuery: string;
  currentPath: string;
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = currentPath === item.href;
  const IconComponent = item.icon || (hasChildren ? (isExpanded ? FolderOpen : Folder) : FileText);
  
  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800/50 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      <div
        className={cn(
          "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200",
          isActive 
            ? "bg-primary/10 text-primary border border-primary/20" 
            : "hover:bg-muted/50 hover:border-border",
          level > 0 && "ml-4"
        )}
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-transparent"
            onClick={(e) => {
              e.preventDefault();
              onToggleExpand(item.href);
            }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-3 h-3" />
            </motion.div>
          </Button>
        )}
        
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 p-1 rounded",
          isActive ? "bg-primary/20" : "bg-muted/50 group-hover:bg-muted"
        )}>
          <IconComponent className={cn(
            "w-4 h-4",
            isActive ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link href={item.href} className="block">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "font-medium truncate text-sm",
                isActive ? "text-primary" : "text-foreground"
              )}>
                {highlightText(item.title, searchQuery)}
              </span>
              
              {/* Status badges */}
              {item.isNew && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  New
                </Badge>
              )}
              {item.isUpdated && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  Updated
                </Badge>
              )}
            </div>
            
            {/* Category */}
            {item.category && (
              <div className="text-xs text-muted-foreground">
                {item.category}
              </div>
            )}
          </Link>
        </div>
        
        {/* Bookmark button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            onBookmarkToggle();
          }}
        >
          {isBookmarked ? (
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
          ) : (
            <StarOff className="w-3 h-3" />
          )}
        </Button>
      </div>
      
      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-1">
              {item.children!.map(child => (
                <NavigationItem
                  key={child.href}
                  item={child}
                  level={level + 1}
                  isExpanded={isExpanded}
                  onToggleExpand={onToggleExpand}
                  isBookmarked={isBookmarked}
                  onBookmarkToggle={onBookmarkToggle}
                  searchQuery={searchQuery}
                  currentPath={currentPath}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Bookmarks section
const BookmarksSection = ({ 
  bookmarks, 
  onRemoveBookmark, 
  onNavigate 
}: {
  bookmarks: BookmarkItem[];
  onRemoveBookmark: (path: string) => void;
  onNavigate: (path: string) => void;
}) => {
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Bookmark className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No bookmarks yet</p>
        <p className="text-xs">Star pages to bookmark them</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {bookmarks.slice(0, 10).map((bookmark) => (
        <motion.div
          key={bookmark.path}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer group"
          onClick={() => onNavigate(bookmark.path)}
        >
          <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{bookmark.title}</div>
            {bookmark.category && (
              <div className="text-xs text-muted-foreground">{bookmark.category}</div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveBookmark(bookmark.path);
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </motion.div>
      ))}
    </div>
  );
};

// Recent pages section
const RecentPagesSection = ({ 
  recentPages, 
  onNavigate 
}: {
  recentPages: RecentItem[];
  onNavigate: (path: string) => void;
}) => {
  if (recentPages.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <History className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recent pages</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {recentPages.slice(0, 10).map((page) => (
        <motion.div
          key={page.path}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer"
          onClick={() => onNavigate(page.path)}
        >
          <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{page.title}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(page.timestamp).toLocaleDateString()} • {page.visitCount} visits
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Main enhanced sidebar component
export function EnhancedSidebar({ 
  navigationItems 
}: { 
  navigationItems: NavItem[] 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(navigationItems);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'title' | 'recent' | 'category'>('title');
  const [activeTab, setActiveTab] = useState('navigation');
  
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const recentPages = useRecentPages();
  const { scrollAreaRef, saveScrollPosition } = useSidebarScrollMemory();
  const pathname = usePathname();
  
  // Filter and sort navigation items
  useEffect(() => {
    let filtered = navigationItems;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const filterItems = (items: NavItem[]): NavItem[] => {
        return items.reduce((acc, item) => {
          const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
          const filteredChildren = item.children ? filterItems(item.children) : [];
          
          if (matchesSearch || filteredChildren.length > 0) {
            acc.push({
              ...item,
              children: filteredChildren.length > 0 ? filteredChildren : item.children
            });
            
            // Auto-expand sections with matches
            if (filteredChildren.length > 0) {
              setExpandedSections(prev => new Set([...prev, item.href]));
            }
          }
          
          return acc;
        }, [] as NavItem[]);
      };
      
      filtered = filterItems(navigationItems);
    }
    
    // Apply sorting
    const sortItems = (items: NavItem[]): NavItem[] => {
      return items.sort((a, b) => {
        switch (sortBy) {
          case 'recent':
            const aTime = a.lastModified?.getTime() || 0;
            const bTime = b.lastModified?.getTime() || 0;
            return bTime - aTime;
          case 'category':
            return (a.category || '').localeCompare(b.category || '');
          default:
            return a.title.localeCompare(b.title);
        }
      }).map(item => ({
        ...item,
        children: item.children ? sortItems(item.children) : undefined
      }));
    };
    
    setFilteredItems(sortItems(filtered));
  }, [searchQuery, navigationItems, sortBy]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('sidebar-search')?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const toggleExpanded = (href: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(href)) {
        newSet.delete(href);
      } else {
        newSet.add(href);
      }
      return newSet;
    });
  };
  
  const handleBookmarkToggle = (item: NavItem) => {
    if (isBookmarked(item.href)) {
      removeBookmark(item.href);
    } else {
      addBookmark({
        path: item.href,
        title: item.title,
        category: item.category
      });
    }
  };
  
  const handleNavigate = (path: string) => {
    window.location.href = path;
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="sidebar-search"
            placeholder="Filter navigation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{filteredItems.length} items</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘⇧F</kbd>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <SortAsc className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('title')}>
                Sort by Title
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('recent')}>
                Sort by Recent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('category')}>
                Sort by Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="navigation" className="text-xs">Navigation</TabsTrigger>
          <TabsTrigger value="bookmarks" className="text-xs">
            Bookmarks
            {bookmarks.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {bookmarks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="navigation" className="h-full m-0">
            <ScrollArea 
              ref={scrollAreaRef}
              className="h-full"
            >
              <div className="p-4 space-y-1">
                {filteredItems.map((item) => (
                  <NavigationItem
                    key={item.href}
                    item={item}
                    isExpanded={expandedSections.has(item.href)}
                    onToggleExpand={toggleExpanded}
                    isBookmarked={isBookmarked(item.href)}
                    onBookmarkToggle={() => handleBookmarkToggle(item)}
                    searchQuery={searchQuery}
                    currentPath={pathname}
                  />
                ))}
                
                {filteredItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No items found</p>
                    <p className="text-xs">Try adjusting your search</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="bookmarks" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <BookmarksSection
                  bookmarks={bookmarks}
                  onRemoveBookmark={removeBookmark}
                  onNavigate={handleNavigate}
                />
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="recent" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <RecentPagesSection
                  recentPages={recentPages}
                  onNavigate={handleNavigate}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>DevDocs++</span>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3" />
            <span>Enhanced</span>
          </div>
        </div>
      </div>
    </div>
  );
}