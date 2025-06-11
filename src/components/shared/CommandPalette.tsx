"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Settings, 
  Moon, 
  Sun, 
  Github, 
  BookOpen, 
  Code2, 
  Zap,
  ArrowRight,
  Clock,
  Star,
  User,
  Home,
  Command,
  Hash,
  ChevronRight
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  category: string;
  keywords: string[];
  shortcut?: string[];
  badge?: string;
  href?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Load recent commands from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('command-palette-recent');
    if (stored) {
      setRecentCommands(JSON.parse(stored));
    }
  }, []);

  // Save recent commands to localStorage
  const saveRecentCommand = useCallback((commandId: string) => {
    const updated = [commandId, ...recentCommands.filter(id => id !== commandId)].slice(0, 5);
    setRecentCommands(updated);
    localStorage.setItem('command-palette-recent', JSON.stringify(updated));
  }, [recentCommands]);

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'home',
      title: 'Go to Home',
      description: 'Navigate to the homepage',
      icon: Home,
      action: () => router.push('/'),
      category: 'Navigation',
      keywords: ['home', 'main', 'index'],
      shortcut: ['⌘', 'H']
    },
    {
      id: 'docs',
      title: 'Browse Documentation',
      description: 'View all documentation',
      icon: BookOpen,
      action: () => router.push('/docs'),
      category: 'Navigation',
      keywords: ['docs', 'documentation', 'guides'],
      shortcut: ['⌘', 'D']
    },
    {
      id: 'search',
      title: 'Search Documentation',
      description: 'Search through all content',
      icon: Search,
      action: () => {
        onClose();
        // Trigger search dialog
        setTimeout(() => {
          const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
          document.dispatchEvent(event);
        }, 100);
      },
      category: 'Search',
      keywords: ['search', 'find', 'lookup'],
      shortcut: ['⌘', 'K']
    },
    
    // Quick Access
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics',
      icon: Zap,
      action: () => router.push('/docs/getting-started'),
      category: 'Quick Access',
      keywords: ['start', 'begin', 'intro', 'tutorial'],
      badge: 'Popular'
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      description: 'Complete API documentation',
      icon: Code2,
      action: () => router.push('/docs/api'),
      category: 'Quick Access',
      keywords: ['api', 'reference', 'endpoints'],
      badge: 'Reference'
    },
    {
      id: 'examples',
      title: 'Code Examples',
      description: 'Browse code samples',
      icon: FileText,
      action: () => router.push('/docs/examples'),
      category: 'Quick Access',
      keywords: ['examples', 'code', 'samples', 'snippets']
    },

    // Settings
    {
      id: 'toggle-theme',
      title: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      description: 'Toggle between light and dark themes',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      category: 'Settings',
      keywords: ['theme', 'dark', 'light', 'mode'],
      shortcut: ['⌘', 'Shift', 'T']
    },
    {
      id: 'settings',
      title: 'Open Settings',
      description: 'Configure your preferences',
      icon: Settings,
      action: () => router.push('/settings'),
      category: 'Settings',
      keywords: ['settings', 'preferences', 'config']
    },

    // External
    {
      id: 'github',
      title: 'View on GitHub',
      description: 'Open the source code repository',
      icon: Github,
      action: () => window.open('https://github.com/your-repo', '_blank'),
      category: 'External',
      keywords: ['github', 'source', 'code', 'repository']
    },
    {
      id: 'star-github',
      title: 'Star on GitHub',
      description: 'Give us a star on GitHub',
      icon: Star,
      action: () => window.open('https://github.com/your-repo', '_blank'),
      category: 'External',
      keywords: ['star', 'github', 'support']
    }
  ], [theme, router, onClose]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      // Show recent commands first, then popular commands
      const recent = commands.filter(cmd => recentCommands.includes(cmd.id));
      const popular = commands.filter(cmd => cmd.badge === 'Popular' && !recentCommands.includes(cmd.id));
      const others = commands.filter(cmd => !recentCommands.includes(cmd.id) && cmd.badge !== 'Popular');
      return [...recent, ...popular, ...others];
    }

    const searchTerm = query.toLowerCase();
    return commands
      .filter(cmd => 
        cmd.title.toLowerCase().includes(searchTerm) ||
        cmd.description?.toLowerCase().includes(searchTerm) ||
        cmd.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm)) ||
        cmd.category.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => {
        // Prioritize title matches
        const aTitle = a.title.toLowerCase().includes(searchTerm);
        const bTitle = b.title.toLowerCase().includes(searchTerm);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return 0;
      });
  }, [query, commands, recentCommands]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const executeCommand = useCallback((command: CommandItem) => {
    saveRecentCommand(command.id);
    command.action();
    onClose();
  }, [saveRecentCommand, onClose]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Navigation': return Home;
      case 'Search': return Search;
      case 'Quick Access': return Zap;
      case 'Settings': return Settings;
      case 'External': return Github;
      default: return Hash;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl max-h-[80vh] overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b">
            <Command className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 text-base"
              autoFocus
            />
            <Badge variant="outline" className="text-xs">
              ⌘K
            </Badge>
          </div>

          {/* Results */}
          <ScrollArea className="max-h-[60vh]">
            <div className="p-2">
              {Object.keys(groupedCommands).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No commands found for "{query}"</p>
                </div>
              ) : (
                <AnimatePresence>
                  {Object.entries(groupedCommands).map(([category, commands], categoryIndex) => {
                    const CategoryIcon = getCategoryIcon(category);
                    return (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: categoryIndex * 0.05 }}
                        className="mb-4 last:mb-0"
                      >
                        <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          <CategoryIcon className="w-3 h-3" />
                          {category}
                        </div>
                        <div className="space-y-1">
                          {commands.map((command, index) => {
                            const globalIndex = filteredCommands.indexOf(command);
                            const isSelected = globalIndex === selectedIndex;
                            const isRecent = recentCommands.includes(command.id);
                            
                            return (
                              <motion.div
                                key={command.id}
                                whileHover={{ scale: 1.01 }}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'bg-primary/10 border border-primary/20' 
                                    : 'hover:bg-muted/50'
                                }`}
                                onClick={() => executeCommand(command)}
                              >
                                <command.icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                                      {command.title}
                                    </span>
                                    {command.badge && (
                                      <Badge variant="secondary" className="text-xs">
                                        {command.badge}
                                      </Badge>
                                    )}
                                    {isRecent && (
                                      <Badge variant="outline" className="text-xs">
                                        <Clock className="w-2 h-2 mr-1" />
                                        Recent
                                      </Badge>
                                    )}
                                  </div>
                                  {command.description && (
                                    <p className="text-sm text-muted-foreground truncate">
                                      {command.description}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {command.shortcut && (
                                    <div className="flex items-center gap-1">
                                      {command.shortcut.map((key, i) => (
                                        <Badge key={i} variant="outline" className="text-xs px-1.5 py-0.5">
                                          {key}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  <ChevronRight className={`w-3 h-3 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                        {categoryIndex < Object.keys(groupedCommands).length - 1 && (
                          <Separator className="my-3" />
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t bg-muted/30 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">↑↓</Badge>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">↵</Badge>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">Esc</Badge>
                <span>Close</span>
              </div>
            </div>
            <div className="text-right">
              {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}