
// src/components/layout/AppSidebar.tsx

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  useSidebar,
  SidebarMenuSkeleton
} from '@/components/ui/sidebar';
import { Logo } from '@/components/shared/Logo';
import type { NavItem } from '@/lib/docs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface AppSidebarProps {
  navigationItems: NavItem[];
}

interface RecursiveNavItemProps {
  item: NavItem;
  level: number;
  isCollapsed: boolean;
  currentPath: string;
  onLinkClick: () => void; 
}

const RecursiveNavItem: React.FC<RecursiveNavItemProps> = ({ item, level, isCollapsed, currentPath, onLinkClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  // An item is active if its href matches the current path,
  // or if the current path starts with the item's href (for parent directories).
  // Special case: avoid matching root ('/docs') for all subpages if not intended.
  const isActive = item.href === currentPath || 
                   (item.href !== '/docs' && currentPath.startsWith(item.href) && (currentPath.length === item.href.length || currentPath[item.href.length] === '/'));


  useEffect(() => {
    if (isActive && item.items && item.items.length > 0) {
      setIsOpen(true);
    }
  }, [isActive, item.items]);

  const hasSubItems = item.items && item.items.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    setIsOpen(!isOpen);
  };
  
  const itemTitleContent = (
    <>
      <span className="truncate flex-grow">{item.title}</span>
      {item.href.startsWith('http') && !isCollapsed && (
        <ExternalLink className="ml-1 h-3 w-3 text-muted-foreground shrink-0" />
      )}
      {hasSubItems && !isCollapsed && (
        isOpen ? <ChevronDown className="ml-1 h-4 w-4 shrink-0" /> : <ChevronRight className="ml-1 h-4 w-4 shrink-0" />
      )}
    </>
  );

  const commonLinkProps = {
    href: item.href,
    onClick: onLinkClick,
    target: item.href.startsWith('http') ? '_blank' : undefined,
    rel: item.href.startsWith('http') ? 'noopener noreferrer' : undefined,
    className: "flex items-center w-full"
  };

  if (hasSubItems) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleToggle} // Button always toggles for folders
          className={cn(
            "w-full justify-start items-center", // Ensure items-center
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
            level > 0 && !isCollapsed && `pl-${4 + level * 2}`
          )}
          tooltip={isCollapsed ? item.title : undefined}
          aria-expanded={isOpen}
        >
           {/* For folders, the link part should still navigate if clicked directly, but toggle is primary */}
           <Link {...commonLinkProps} legacyBehavior>
            <a className="flex items-center flex-grow min-w-0"> {/* Ensure link takes space */}
              {itemTitleContent}
            </a>
          </Link>
        </SidebarMenuButton>
        {!isCollapsed && isOpen && (
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <RecursiveNavItem key={subItem.href} item={subItem} level={level + 1} isCollapsed={isCollapsed} currentPath={currentPath} onLinkClick={onLinkClick} />
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  }

  // Leaf node (no sub-items)
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild // Use asChild to pass props to the Link component
        className={cn(
          "w-full justify-start items-center", // Ensure items-center
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
          level > 0 && !isCollapsed && `pl-${4 + level * 2}`
        )}
        tooltip={isCollapsed ? item.title : undefined}
      >
        <Link {...commonLinkProps}>
          {itemTitleContent}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};


export default function AppSidebar({ navigationItems }: AppSidebarProps) {
  const { state: sidebarState, isMobile, setOpenMobile } = useSidebar(); 
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200); // Shorter delay
    return () => clearTimeout(timer);
  }, []);
  
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isCollapsed = !isMobile && sidebarState === 'collapsed';

  if (isLoading && !isMobile) { 
    return (
      <aside className={cn(
        "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200 ease-in-out fixed top-[var(--header-height)] bottom-0 left-0 z-40", // Added positioning
        isCollapsed ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]"
      )}>
         <div className={cn("p-4 border-b border-sidebar-border", isCollapsed && "p-2 flex justify-center")}>
          <Logo collapsed={isCollapsed} />
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {[...Array(navigationItems.length || 5)].map((_, i) => <SidebarMenuSkeleton key={i} showIcon={!isCollapsed} />)}
          </div>
        </ScrollArea>
      </aside>
    );
  }
  
  return (
    <Sidebar 
      collapsible={isMobile ? "offcanvas" : "icon"} 
      className="border-r bg-sidebar text-sidebar-foreground fixed top-[var(--header-height)] bottom-0 left-0 z-40" // Added positioning
      variant="sidebar"
      // side="left" // Default, but explicit
    >
       <SidebarHeader className={cn("p-4 border-b border-sidebar-border", isCollapsed && "p-2 flex justify-center")}>
        <Logo collapsed={isCollapsed} />
      </SidebarHeader>
      <SidebarContent asChild>
        <ScrollArea className="flex-1">
          <SidebarMenu className="p-2">
            {navigationItems.map((item) => (
              <RecursiveNavItem 
                key={item.href} 
                item={item} 
                level={0} 
                isCollapsed={isCollapsed} 
                currentPath={pathname}
                onLinkClick={handleLinkClick}
              />
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      {/* Footer can be added here if needed */}
    </Sidebar>
  );
}
