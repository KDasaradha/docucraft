"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="w-9 h-9 opacity-0" disabled aria-label="Toggle theme placeholder" />;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label="Toggle theme"
        className="w-9 h-9 relative overflow-hidden group"
      >
        <AnimatePresence initial={false} mode="wait">
          {theme === "light" ? (
            <motion.div
              key="sun"
              initial={{ y: -20, opacity: 0, rotate: -90, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
              exit={{ y: 20, opacity: 0, rotate: 90, scale: 0.8 }}
              transition={{ 
                duration: 0.3, 
                ease: "easeInOut",
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
              className="absolute flex items-center justify-center"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500 group-hover:text-amber-600 transition-colors" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ y: 20, opacity: 0, rotate: 90, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
              exit={{ y: -20, opacity: 0, rotate: -90, scale: 0.8 }}
              transition={{ 
                duration: 0.3, 
                ease: "easeInOut",
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
              className="absolute flex items-center justify-center"
            >
              <Moon className="h-[1.2rem] w-[1.2rem] text-blue-400 group-hover:text-blue-300 transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="sr-only">Toggle theme</span>
      </Button>
    </motion.div>
  )
}
