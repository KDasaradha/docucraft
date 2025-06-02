"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['⌘', 'K'], description: 'Open search', category: 'Navigation' },
  { keys: ['⌘', '/'], description: 'Toggle sidebar', category: 'Navigation' },
  { keys: ['⌘', 'D'], description: 'Toggle dark mode', category: 'Interface' },
  { keys: ['⌘', 'B'], description: 'Toggle sidebar', category: 'Navigation' },
  { keys: ['⌘', '↑'], description: 'Go to top', category: 'Navigation' },
  { keys: ['⌘', '↓'], description: 'Go to bottom', category: 'Navigation' },
  { keys: ['⌘', '←'], description: 'Previous page', category: 'Navigation' },
  { keys: ['⌘', '→'], description: 'Next page', category: 'Navigation' },
  { keys: ['Esc'], description: 'Close dialogs', category: 'Interface' },
  { keys: ['Tab'], description: 'Navigate elements', category: 'Interface' },
  { keys: ['↑', '↓'], description: 'Navigate search results', category: 'Search' },
  { keys: ['Enter'], description: 'Select search result', category: 'Search' },
];

const KeyboardShortcuts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatKey = (key: string) => {
    if (!isMac) {
      return key.replace('⌘', 'Ctrl');
    }
    return key;
  };

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 h-10 w-10 rounded-full shadow-lg bg-background border hover:shadow-xl transition-all duration-200"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <AnimatePresence>
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="space-y-3"
              >
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <motion.div
                      key={`${category}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <Badge
                            key={keyIndex}
                            variant="secondary"
                            className="text-xs font-mono px-2 py-1 min-w-[24px] text-center"
                          >
                            {formatKey(key)}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-4 border-t text-center"
          >
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <span>Press</span>
              <Badge variant="outline" className="text-xs font-mono">⌘ ?</Badge>
              <span>to toggle this dialog</span>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcuts;