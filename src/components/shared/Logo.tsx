// src/components/shared/Logo.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import { siteConfig } from '@/config/site.config';
import { cn } from '@/lib/utils';
import { BookMarked } from 'lucide-react'; 

export function Logo({ collapsed, className }: { collapsed?: boolean; className?: string }) {
  const logoSrc = siteConfig.assets.logo;
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link 
        href="/" 
        className={cn(
          "flex items-center gap-2.5 text-lg font-semibold text-primary hover:text-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
          className
        )}
        aria-label={`${siteConfig.name} homepage`}
      >
        {logoSrc ? (
           <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
           >
            <Image
              src={logoSrc} 
              alt={`${siteConfig.name} Logo`}
              width={collapsed ? 28 : 32} 
              height={collapsed ? 28 : 32}
              className="rounded-sm object-contain transition-all duration-300 ease-in-out"
              data-ai-hint="toothless dragon"
              priority 
            />
           </motion.div>
        ) : (
          <BookMarked className={cn("shrink-0 transition-all duration-300 ease-in-out", collapsed ? "h-7 w-7" : "h-8 w-8")} /> 
        )}
        <AnimatePresence>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="truncate"
            >
              {siteConfig.name}
            </motion.span>
          )}
        </AnimatePresence>
         {collapsed && <span className="sr-only">{siteConfig.name}</span>}
      </Link>
    </motion.div>
  );
}
