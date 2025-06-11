// src/components/layout/AppHeader.tsx
"use client"; 

import React, { useEffect, useRef } from 'react'; 
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronRight } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { HeaderSearchDialog } from '@/components/search/HeaderSearchDialog';
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"; 
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AppHeader() {
  const { isMobile, toggleSidebar, state, isToggling } = useSidebar(); 
  const headerRef = useRef<HTMLElement>(null);

  // Add keyboard shortcut for toggling sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with Ctrl+B (common shortcut in many IDEs)
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // GSAP animation for header background on scroll
  useEffect(() => {
    if (typeof window !== "undefined" && headerRef.current) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "+=100",
          scrub: 0.3,
        }
      });

      // Animate header with backdrop blur and shadow
      tl.to(headerRef.current, {
        backdropFilter: "blur(12px)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
        borderBottomColor: "rgba(0, 0, 0, 0.1)",
        duration: 0.3,
      });

      // Dark mode support
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const updateForDarkMode = () => {
        if (darkModeQuery.matches) {
          tl.to(headerRef.current, {
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)",
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

  // Framer Motion variant for button hover/tap
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <motion.header
        ref={headerRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full border-b border-transparent backdrop-blur supports-[backdrop-filter]:bg-opacity-60", // Start with transparent border
          "bg-header text-header-foreground" // Renamed custom CSS variables
        )}
        style={{ 
          height: 'var(--header-height)',
          // Framer motion can also be used for initial animation
          // initial: { y: -100, opacity: 0 },
          // animate: { y: 0, opacity: 1 },
          // transition: { duration: 0.5, ease: "easeOut" }
        } as React.CSSProperties} 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      >
      <div className="container flex h-full items-center justify-between max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="mr-2"> 
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
                        "flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200",
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
          
          <div className={cn("flex items-center", isMobile ? "ml-0" : "")}>
            <Logo className="py-0 px-0" />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
            <HeaderSearchDialog />
          </motion.div>
          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
            <ThemeToggle />
          </motion.div>
        </div>
      </div>
    </motion.header>
    </TooltipProvider>
  );
}
