// src/components/layout/AppHeader.tsx
"use client"; 

import React, { useEffect, useRef } from 'react'; 
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { HeaderSearchDialog } from '@/components/search/HeaderSearchDialog';
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"; 
import { cn } from '@/lib/utils';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AppHeader() {
  const { isMobile } = useSidebar(); 
  const headerRef = useRef<HTMLElement>(null);

  // GSAP animation for header background on scroll
  useEffect(() => {
    if (typeof window !== "undefined" && headerRef.current) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "+=100", // Animate over the first 100px of scroll
          scrub: 0.5, // Smooth scrubbing
        }
      });

      // Animate background color and box-shadow
      // Note: GSAP directly animates style.backgroundColor. For HSL variables, direct manipulation is complex.
      // We'll use direct colors here or you can set up CSS classes and toggle them.
      // For simplicity, direct color animation or opacity change might be easier.
      // Let's try animating opacity of a background layer or box-shadow for a subtle effect.
      
      // Instead of direct background, let's animate a subtle shadow or border
      tl.to(headerRef.current, {
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)", // Light shadow for light mode
        // For dark mode, you'd need a different shadow color or conditional logic
        // This will be applied universally for now.
        borderBottomWidth: "1px",
        // borderColor: "hsl(var(--border))", // This would also need theme awareness
      });

      return () => {
        tl.kill(); // Cleanup GSAP animation on component unmount
      };
    }
  }, []);

  // Framer Motion variant for button hover/tap
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  return (
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
          <div className="md:hidden mr-2"> 
            {isMobile && (
              <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                <SidebarTrigger />
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
  );
}
