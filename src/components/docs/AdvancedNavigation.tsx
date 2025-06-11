"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  Code2, 
  Zap, 
  Play, 
  FileText,
  Clock,
  Users,
  Star,
  TrendingUp,
  Filter,
  Search,
  Tag
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon?: React.ElementType;
  description?: string;
  type: 'guide' | 'reference' | 'tutorial' | 'example' | 'changelog';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: string;
  lastUpdated: Date;
  popularity: number;
  tags: string[];
  children?: NavigationItem[];
  isNew?: boolean;
  isUpdated?: boolean;
}

interface AdvancedNavigationProps {
  items: NavigationItem[];
  currentPath?: string;
  onNavigate?: (href: string) => void;
  className?: string;
}

const typeIcons = {
  guide: BookOpen,
  reference: Code2,
  tutorial: Zap,
  example: Play,
  changelog: FileText
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
};

export default function AdvancedNavigation({ 
  items, 
  currentPath, 
  onNavigate,
  className = '' 
}: AdvancedNavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'popularity' | 'updated'>('title');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filteredItems, setFilteredItems] = useState<NavigationItem[]>(items);

  // Filter and sort items
  useEffect(() => {
    let filtered = items;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(item => item.difficulty === selectedDifficulty);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'updated':
          return b.lastUpdated.getTime() - a.lastUpdated.getTime();
        default:
          return a.title.localeCompare(b.title);
      }
    });

    setFilteredItems(filtered);
  }, [items, searchQuery, selectedType, selectedDifficulty, sortBy]);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleNavigate = (href: string) => {
    onNavigate?.(href);
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isActive = currentPath === item.href;
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const IconComponent = item.icon || typeIcons[item.type];

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <div
          className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
            isActive 
              ? 'bg-primary/10 border border-primary/20 text-primary' 
              : 'hover:bg-muted/50 hover:border-border'
          } ${level > 0 ? 'ml-6' : ''}`}
          onClick={() => hasChildren ? toggleExpanded(item.id) : handleNavigate(item.href)}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          )}

          {/* Type Icon */}
          <div className={`flex-shrink-0 p-1.5 rounded-md ${
            isActive ? 'bg-primary/20' : 'bg-muted/50 group-hover:bg-muted'
          }`}>
            <IconComponent className={`w-4 h-4 ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-medium truncate ${
                isActive ? 'text-primary' : 'text-foreground'
              }`}>
                {item.title}
              </h3>
              
              {/* Status Badges */}
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

            {/* Description */}
            {item.description && (
              <p className="text-xs text-muted-foreground truncate mb-2">
                {item.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.readTime}
              </div>
              
              <Badge 
                variant="outline" 
                className={`text-xs ${difficultyColors[item.difficulty]}`}
              >
                {item.difficulty}
              </Badge>

              {item.popularity > 80 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-orange-500" />
                  <span className="text-orange-600 dark:text-orange-400">Popular</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{item.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Popularity Indicator */}
          {item.popularity > 90 && (
            <div className="flex-shrink-0">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            </div>
          )}
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
              <div className="mt-2 space-y-1">
                {item.children!.map(child => renderNavigationItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Search and Filters */}
      <div className="p-4 border-b space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="guide">Guides</SelectItem>
              <SelectItem value="reference">Reference</SelectItem>
              <SelectItem value="tutorial">Tutorials</SelectItem>
              <SelectItem value="example">Examples</SelectItem>
              <SelectItem value="changelog">Changelog</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Sort by Title</SelectItem>
            <SelectItem value="popularity">Sort by Popularity</SelectItem>
            <SelectItem value="updated">Sort by Last Updated</SelectItem>
          </SelectContent>
        </Select>

        {/* Active Filters */}
        {(searchQuery || selectedType !== 'all' || selectedDifficulty !== 'all') && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="text-xs">
                Search: {searchQuery}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </Button>
              </Badge>
            )}
            {selectedType !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Type: {selectedType}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => setSelectedType('all')}
                >
                  ×
                </Button>
              </Badge>
            )}
            {selectedDifficulty !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Level: {selectedDifficulty}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => setSelectedDifficulty('all')}
                >
                  ×
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => renderNavigationItem(item))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No documentation found</p>
              <p className="text-xs">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Stats Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredItems.length} items</span>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3" />
            <span>Community driven</span>
          </div>
        </div>
      </div>
    </div>
  );
}