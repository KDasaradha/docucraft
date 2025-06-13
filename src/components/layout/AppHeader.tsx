// src/components/layout/AppHeader.tsx
"use client"; 

import React, { useEffect, useRef, useState } from 'react'; 
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ChevronRight, 
  Bell, 
  User, 
  Search,
  Home,
  ChevronDown,
  Menu,
  Settings,
  HelpCircle,
  FileText,
  Folder,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  Users,
  Star,
  Bookmark,
  LayoutGrid
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ProfessionalSearchDialog } from '@/components/search/ProfessionalSearchDialog';
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"; 
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger, 
  TooltipProvider 
} from "@/components/ui/tooltip";
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
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from '@/lib/utils';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Type definitions
type BreadcrumbItem = {
  label: string;
  href: string;
};

type WorkspaceItem = {
  id: string;
  name: string;
  icon: React.ReactNode;
  color?: string;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
};

type SystemStatus = 'online' | 'degraded' | 'offline';

import type { NavItem } from '@/lib/docs';

interface AppHeaderProps {
  navigationItems?: NavItem[];
}

export default function AppHeader({ navigationItems = [] }: AppHeaderProps) {
  const { isMobile, toggleSidebar, state, isToggling } = useSidebar(); 
  const headerRef = useRef<HTMLElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const mainNavRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // State variables
  const [hasNotifications, setHasNotifications] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('online');
  const [activeTab, setActiveTab] = useState('documents');
  const [currentWorkspace, setCurrentWorkspace] = useState('personal');
  
  // Navigation and breadcrumbs
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { label: 'Home', href: '/' },
    { label: 'Documents', href: '/documents' },
    { label: 'Current Page', href: '#' }
  ]);
  
  // Workspaces
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([
    { 
      id: 'personal', 
      name: 'Personal Workspace', 
      icon: <User className="h-4 w-4 mr-2" />,
      color: 'bg-blue-500'
    },
    { 
      id: 'team', 
      name: 'Team Projects', 
      icon: <Users className="h-4 w-4 mr-2" />,
      color: 'bg-green-500'
    },
    { 
      id: 'client', 
      name: 'Client Documents', 
      icon: <Briefcase className="h-4 w-4 mr-2" />,
      color: 'bg-purple-500'
    }
  ]);
  
  // Main navigation items
  const [navItems, setNavItems] = useState<NavigationItem[]>([
    { label: 'Documents', href: '/documents', icon: <FileText className="h-4 w-4" />, active: true },
    // { label: 'Favorites', href: '/favorites', icon: <Star className="h-4 w-4" /> },
    // { label: 'Recent', href: '/recent', icon: <Clock className="h-4 w-4" /> },
    // { label: 'Shared', href: '/shared', icon: <Users className="h-4 w-4" /> }
  ]);
  
  // Simulate page loading progress for demo purposes
  useEffect(() => {
    // This would be replaced with actual navigation events in a real app
    const simulatePageLoad = () => {
      setIsLoading(true);
      setProgress(0);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsLoading(false);
            }, 200); // Keep progress bar visible briefly after completion
            return 100;
          }
          return newProgress;
        });
      }, 200);
      
      return () => clearInterval(interval);
    };
    
    // In a real app, you would hook this to router events
    // For demo, we'll trigger on initial load
    const timer = setTimeout(simulatePageLoad, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with Ctrl+B (common shortcut in many IDEs)
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      
      // Open search with Ctrl+K (common in modern web apps)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        // This will be used to trigger the search dialog
        document.querySelector<HTMLButtonElement>('[data-search-trigger]')?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Helper functions
  const handleWorkspaceChange = (workspaceId: string) => {
    setCurrentWorkspace(workspaceId);
    // In a real app, you would fetch data for the selected workspace
  };
  
  const handleNavItemClick = (href: string) => {
    // Update active nav item
    setNavItems(prev => 
      prev.map(item => ({
        ...item,
        active: item.href === href
      }))
    );
    
    // In a real app, you would navigate to the selected page
  };
  
  const getStatusColor = (status: SystemStatus) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'degraded':
        return 'text-amber-500';
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const getStatusIcon = (status: SystemStatus) => {
    switch (status) {
      case 'online':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'degraded':
        return <AlertCircle className="h-3 w-3" />;
      case 'offline':
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // GSAP animation for header background on scroll
  useEffect(() => {
    if (typeof window !== "undefined" && headerRef.current && topBarRef.current && mainNavRef.current) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "+=100",
          scrub: 0.3,
        }
      });

      // Animate top bar to shrink and fade on scroll
      tl.to(topBarRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.2,
      });
      
      // Animate main header with backdrop blur and shadow
      tl.to(mainNavRef.current, {
        backdropFilter: "blur(16px)",
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)",
        borderBottomWidth: "1px",
        borderBottomColor: "rgba(0, 0, 0, 0.1)",
        duration: 0.3,
      }, "-=0.1");

      // Dark mode support
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const updateForDarkMode = () => {
        if (darkModeQuery.matches) {
          tl.to(mainNavRef.current, {
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)",
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
          });
        }
      };

      darkModeQuery.addEventListener('change', updateForDarkMode);
      updateForDarkMode();

      return () => {
        tl.kill();
        darkModeQuery.removeEventListener('change', updateForDarkMode);
      };
    }
  }, []);

  // Framer Motion variants
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };
  
  const navItemVariants = {
    inactive: { 
      opacity: 0.7,
      y: 0,
      transition: { duration: 0.2 }
    },
    active: { 
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 }
    },
    hover: { 
      opacity: 1,
      y: -2,
      transition: { duration: 0.2 }
    },
    tap: { 
      y: 1,
      transition: { duration: 0.1 }
    }
  };
  
  const workspaceIndicatorVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };
  
  const topBarVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };
  
  const mainNavVariants = {
    initial: { y: -10, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.4,
        ease: "easeOut",
        delay: 0.1
      }
    }
  };

  // Function to handle notification click
  const handleNotificationClick = () => {
    setHasNotifications(false);
    setNotificationCount(0);
  };

  // Notification bell animation variants
  const bellVariants = {
    idle: { rotate: 0 },
    ring: { 
      rotate: [0, 15, -15, 10, -10, 5, -5, 0],
      transition: { 
        duration: 0.6, 
        ease: "easeInOut",
        repeat: 1,
        repeatDelay: 5
      }
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <motion.header
        ref={headerRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full",
          "flex flex-col",
          "overflow-hidden" // For progress bar
        )}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      >
        {/* Progress Bar for Page Loading */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              className="absolute top-0 left-0 h-0.5 bg-primary z-50"
              style={{ width: `${progress}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              ref={progressRef}
            />
          )}
        </AnimatePresence>
        
        {/* Top Bar - System Status, Help, Settings */}
        <motion.div 
          ref={topBarRef}
          className={cn(
            "w-full py-1 px-4 sm:px-6 lg:px-8",
            "bg-muted/50 text-muted-foreground text-xs",
            "border-b border-border/40",
            "flex items-center justify-between",
          )}
          variants={topBarVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left side - System status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className={cn(
                "flex items-center font-medium px-2 py-0.5 rounded-md text-xs", 
                systemStatus === 'online' ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : 
                systemStatus === 'degraded' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
              )}>
                {getStatusIcon(systemStatus)}
                <span className="ml-1.5">System {systemStatus}</span>
              </span>
            </div>
            
            {/* Workspace Selector */}
            <Separator orientation="vertical" className="h-3" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs px-2.5 gap-1.5 hover:bg-muted rounded-md font-medium"
                >
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={currentWorkspace}
                      className="flex items-center"
                      variants={workspaceIndicatorVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <span 
                        className={cn(
                          "h-2.5 w-2.5 rounded-full mr-1.5",
                          workspaces.find(w => w.id === currentWorkspace)?.color || "bg-blue-500"
                        )} 
                      />
                      {workspaces.find(w => w.id === currentWorkspace)?.name}
                    </motion.span>
                  </AnimatePresence>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={currentWorkspace} onValueChange={handleWorkspaceChange}>
                  {workspaces.map((workspace) => (
                    <DropdownMenuRadioItem 
                      key={workspace.id} 
                      value={workspace.id}
                      className="flex items-center py-1.5"
                    >
                      <span 
                        className={cn(
                          "h-2 w-2 rounded-full mr-2",
                          workspace.color
                        )} 
                      />
                      <span className="flex items-center">
                        {workspace.icon}
                        {workspace.name}
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Manage Workspaces
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Right side - Help, Settings, etc. */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <HelpCircle className="h-3.5 w-3.5" />
              <span className="sr-only">Help</span>
            </Button>
            
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Settings className="h-3.5 w-3.5" />
              <span className="sr-only">Settings</span>
            </Button>
            
            <Separator orientation="vertical" className="h-3" />
            
            <a href="#" className="text-xs hover:text-primary hover:underline transition-colors">
              Documentation
            </a>
          </div>
        </motion.div>
        
        {/* Main Navigation Bar */}
        <motion.div
          ref={mainNavRef}
          className={cn(
            "w-full border-b border-transparent backdrop-blur-md supports-[backdrop-filter]:bg-opacity-80",
            "bg-background text-foreground",
            "transition-all duration-300 ease-in-out",
          )}
          variants={mainNavVariants}
          initial="initial"
          animate="animate"
        >
          <div className="container flex h-14 items-center justify-between max-w-full px-4 sm:px-6 lg:px-8 bg-teal-300 dark:bg-cyan-300">
            {/* Left side - Logo, Sidebar Toggle, Navigation */}
            <div className="flex items-center gap-4">
              {/* Sidebar Toggle */}
              <div className="mr-1"> 
                {isMobile ? (
                  <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <SidebarTrigger />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="center">
                        Open sidebar menu
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                ) : (
                  <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={toggleSidebar}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200",
                            state === 'collapsed' ? "bg-accent/10" : "",
                            isToggling && "ring-2 ring-primary/50 scale-105"
                          )}
                          aria-label={state === 'collapsed' ? "Expand sidebar" : "Collapse sidebar"}
                          disabled={isToggling}
                        >
                          <motion.div
                            animate={{ 
                              rotate: state === 'collapsed' ? 180 : 0,
                              scale: isToggling ? [1, 1.2, 1] : 1
                            }}
                            transition={{ 
                              duration: isToggling ? 0.3 : 0.3,
                              ease: "easeInOut"
                            }}
                          >
                            <ChevronRight className={cn(
                              "h-4 w-4",
                              isToggling && "text-primary"
                            )} />
                          </motion.div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="center">
                        {state === 'collapsed' ? "Expand" : "Collapse"} sidebar <kbd className="ml-1 px-1 py-0.5 text-xs border rounded">Ctrl+B</kbd>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                )}
              </div>
              
              {/* Logo */}
              <div className={cn("flex items-center", isMobile ? "ml-0" : "")}>
                <Logo className="py-0 px-0" />
              </div>
              
              {/* Main Navigation Tabs */}
              {!isMobile && (
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="ml-6"
                >
                  <TabsList className="bg-transparent h-14 p-0">
                    {navItems.map((item) => (
                      <TabsTrigger
                        key={item.href}
                        value={item.href.replace('/', '')}
                        className={cn(
                          "h-full px-4 rounded-none data-[state=active]:bg-transparent",
                          "data-[state=active]:shadow-none relative overflow-hidden",
                          "border-b-2 border-transparent data-[state=active]:border-primary",
                          "transition-all duration-200"
                        )}
                        onClick={() => handleNavItemClick(item.href)}
                      >
                        <motion.div 
                          className="flex items-center gap-1.5"
                          variants={navItemVariants}
                          initial={item.active ? "active" : "inactive"}
                          animate={item.active ? "active" : "inactive"}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </motion.div>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}
            </div>
            
            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
              {/* Quick Actions Button */}
              {/* <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <FileText className="h-4 w-4" />
                          New
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Create New</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                            <FileText className="h-4 w-4" />
                            Document
                            <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                            <Folder className="h-4 w-4" />
                            Folder
                            <DropdownMenuShortcut>⌘⇧N</DropdownMenuShortcut>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                            <Upload className="h-4 w-4" />
                            Upload Files
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                            <Clock className="h-4 w-4" />
                            View Recent
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Create New
                  </TooltipContent>
                </Tooltip>
              </motion.div> */}
              
              {/* Enhanced Professional Search Dialog */}
              <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                <ProfessionalSearchDialog 
                  navigationItems={navigationItems}
                  placeholder="Search documentation..."
                  className="min-w-[200px] sm:min-w-[280px]"
                />
              </motion.div>
              
              {/* Notification Bell with Animation */}
              <motion.div 
                whileHover="hover" 
                whileTap="tap" 
                variants={buttonVariants}
                initial="idle"
                animate={hasNotifications ? "ring" : "idle"}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="relative"
                          onClick={handleNotificationClick}
                        >
                          <motion.div variants={bellVariants}>
                            <Bell className="h-4 w-4" />
                          </motion.div>
                          {notificationCount > 0 && (
                            <Badge 
                              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center bg-red-500 text-white"
                              aria-label={`${notificationCount} new notifications`}
                            >
                              {notificationCount}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[350px]">
                        <DropdownMenuLabel className="flex justify-between items-center">
                          <span>Notifications</span>
                          {notificationCount > 0 && (
                            <Badge variant="outline" className="ml-2">{notificationCount} New</Badge>
                          )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[350px] overflow-y-auto">
                          <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                            <div className="flex w-full justify-between">
                              <div className="font-medium">Document Updated</div>
                              <Badge variant="secondary" className="ml-2">New</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              "Project Overview.docx" was updated by John Doe
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              2 minutes ago
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                            <div className="flex w-full justify-between">
                              <div className="font-medium">New Comment</div>
                              <Badge variant="secondary" className="ml-2">New</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Jane Smith commented on your document
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              1 hour ago
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                            <div className="font-medium">Shared Document</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Alex Johnson shared "Q3 Report" with you
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              Yesterday
                            </div>
                          </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center text-primary">
                          View all notifications
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Notifications
                  </TooltipContent>
                </Tooltip>
              </motion.div>
              
              {/* Theme Toggle */}
              <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                <ThemeToggle />
              </motion.div>
              
              {/* User Profile Dropdown */}
              {/* <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2 pl-1 pr-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                            <AvatarFallback className="text-xs">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="hidden md:inline font-normal">John Doe</span>
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="flex items-center justify-start gap-2 p-2">
                          <div className="flex flex-col space-y-0.5">
                            <p className="text-sm font-medium">John Doe</p>
                            <p className="text-xs text-muted-foreground">john.doe@example.com</p>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                            <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">
                          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                          </svg>
                          <span>Log out</span>
                          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    User Profile
                  </TooltipContent>
                </Tooltip>
              </motion.div> */}
            </div>
          </div>
          
        </motion.div>
      </motion.header>
    </TooltipProvider>
  );
}
