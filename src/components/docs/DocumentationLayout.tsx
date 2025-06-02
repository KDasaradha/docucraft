"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Clock, Calendar, User, Tag, Share2, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import TableOfContents from './TableOfContents';
import DocumentationFeedback from './DocumentationFeedback';
import DocumentationNavigation from './DocumentationNavigation';
import ReadingProgress from '../shared/ReadingProgress';

interface DocumentationMeta {
  title: string;
  description?: string;
  author?: string;
  lastUpdated?: string;
  readTime?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  category?: string;
  version?: string;
}

interface NavigationItem {
  title: string;
  href: string;
  description?: string;
  category?: string;
  readTime?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isNew?: boolean;
  isPopular?: boolean;
}

interface DocumentationLayoutProps {
  children: React.ReactNode;
  meta: DocumentationMeta;
  previousPage?: NavigationItem;
  nextPage?: NavigationItem;
  relatedPages?: NavigationItem[];
  showToc?: boolean;
  showFeedback?: boolean;
  showNavigation?: boolean;
  showMeta?: boolean;
  className?: string;
}

const DocumentationLayout: React.FC<DocumentationLayoutProps> = ({
  children,
  meta,
  previousPage,
  nextPage,
  relatedPages = [],
  showToc = true,
  showFeedback = true,
  showNavigation = true,
  showMeta = true,
  className
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    // Simulate view tracking
    setViewCount(Math.floor(Math.random() * 1000) + 100);
    
    // Check if page is bookmarked
    const bookmarks = JSON.parse(localStorage.getItem('docucraft-bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(window.location.pathname));
  }, []);

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('docucraft-bookmarks') || '[]');
    const currentPath = window.location.pathname;
    
    if (isBookmarked) {
      const updated = bookmarks.filter((path: string) => path !== currentPath);
      localStorage.setItem('docucraft-bookmarks', JSON.stringify(updated));
      setIsBookmarked(false);
    } else {
      bookmarks.push(currentPath);
      localStorage.setItem('docucraft-bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: meta.title,
          text: meta.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className={cn("min-h-screen", className)}>
      <ReadingProgress />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Page Header */}
            {showMeta && (
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                        {meta.title}
                      </h1>
                      
                      {meta.description && (
                        <p className="text-lg text-muted-foreground mb-4">
                          {meta.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBookmark}
                        className="gap-2"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                        {isBookmarked ? 'Saved' : 'Save'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {meta.author && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {meta.author}
                      </div>
                    )}
                    
                    {meta.lastUpdated && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Updated {meta.lastUpdated}
                      </div>
                    )}
                    
                    {meta.readTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meta.readTime} read
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {viewCount.toLocaleString()} views
                    </div>
                  </div>

                  {/* Tags and Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {meta.category && (
                      <Badge variant="secondary">
                        {meta.category}
                      </Badge>
                    )}
                    
                    {meta.difficulty && (
                      <Badge className={getDifficultyColor(meta.difficulty)}>
                        {meta.difficulty}
                      </Badge>
                    )}
                    
                    {meta.version && (
                      <Badge variant="outline">
                        v{meta.version}
                      </Badge>
                    )}
                    
                    {meta.tags && meta.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator className="mt-6" />
              </motion.header>
            )}

            {/* Main Content */}
            <motion.main
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="prose prose-gray dark:prose-invert max-w-none"
            >
              {children}
            </motion.main>

            {/* Feedback Section */}
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-12"
              >
                <DocumentationFeedback
                  pageId={typeof window !== 'undefined' ? window.location.pathname : ''}
                  pageTitle={meta.title}
                />
              </motion.div>
            )}

            {/* Navigation */}
            {showNavigation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-12"
              >
                <DocumentationNavigation
                  previousPage={previousPage}
                  nextPage={nextPage}
                  relatedPages={relatedPages}
                  currentPageTitle={meta.title}
                />
              </motion.div>
            )}
          </div>

          {/* Table of Contents Sidebar */}
          {showToc && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden xl:block"
            >
              <TableOfContents />
            </motion.aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentationLayout;