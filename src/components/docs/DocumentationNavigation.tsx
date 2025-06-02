"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUp, Clock, BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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

interface DocumentationNavigationProps {
  previousPage?: NavigationItem;
  nextPage?: NavigationItem;
  relatedPages?: NavigationItem[];
  currentPageTitle?: string;
  showBackToTop?: boolean;
  className?: string;
}

const DocumentationNavigation: React.FC<DocumentationNavigationProps> = ({
  previousPage,
  nextPage,
  relatedPages = [],
  currentPageTitle,
  showBackToTop = true,
  className
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const NavigationCard: React.FC<{ 
    item: NavigationItem; 
    direction: 'previous' | 'next';
    className?: string;
  }> = ({ item, direction, className }) => (
    <Link href={item.href} className="block">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn("h-full", className)}
      >
        <Card className="h-full hover:shadow-md transition-all duration-200 border-dashed hover:border-solid hover:border-primary/50">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              {direction === 'previous' && <ChevronLeft className="h-4 w-4 text-muted-foreground" />}
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {direction === 'previous' ? 'Previous' : 'Next'}
              </span>
              {direction === 'next' && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
            
            <h3 className="font-semibold text-sm mb-2 line-clamp-2 flex-1">
              {item.title}
            </h3>
            
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {item.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-auto">
              {item.category && (
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              )}
              {item.readTime && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {item.readTime}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );

  const RelatedPageCard: React.FC<{ item: NavigationItem }> = ({ item }) => (
    <Link href={item.href} className="block">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm line-clamp-2 flex-1 pr-2">
                {item.title}
              </h4>
              <div className="flex items-center gap-1 shrink-0">
                {item.isNew && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    New
                  </Badge>
                )}
                {item.isPopular && (
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                )}
              </div>
            </div>
            
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {item.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.category && (
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                )}
                {item.difficulty && (
                  <Badge className={cn("text-xs", getDifficultyColor(item.difficulty))}>
                    {item.difficulty}
                  </Badge>
                )}
              </div>
              
              {item.readTime && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {item.readTime}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );

  return (
    <div className={cn("space-y-8", className)}>
      {/* Previous/Next Navigation */}
      {(previousPage || nextPage) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previousPage ? (
              <NavigationCard item={previousPage} direction="previous" />
            ) : (
              <div /> // Empty div to maintain grid layout
            )}
            
            {nextPage && (
              <NavigationCard 
                item={nextPage} 
                direction="next" 
                className={!previousPage ? "md:col-start-2" : ""}
              />
            )}
          </div>
        </motion.div>
      )}

      {/* Related Pages */}
      {relatedPages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Related Documentation</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedPages.map((page, index) => (
              <motion.div
                key={page.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <RelatedPageCard item={page} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Back to Top */}
      {showBackToTop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center pt-8 border-t"
        >
          <Button
            variant="outline"
            onClick={scrollToTop}
            className="gap-2 hover:bg-accent"
          >
            <ArrowUp className="h-4 w-4" />
            Back to top
          </Button>
        </motion.div>
      )}

      {/* Page Info */}
      {currentPageTitle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-muted-foreground border-t pt-4"
        >
          <p>
            You're reading: <span className="font-medium">{currentPageTitle}</span>
          </p>
          <p className="mt-1">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default DocumentationNavigation;