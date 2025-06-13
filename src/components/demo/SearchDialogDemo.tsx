"use client";

import React from 'react';
import { ProfessionalSearchDialog } from '@/components/search/ProfessionalSearchDialog';
import { CompactSearchDialog } from '@/components/search/CompactSearchDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock navigation items for demo
const mockNavigationItems = [
  {
    title: "Getting Started",
    href: "/docs/getting-started",
    items: [
      { title: "Installation", href: "/docs/installation" },
      { title: "Quick Start", href: "/docs/quick-start" }
    ]
  },
  {
    title: "API Reference",
    href: "/docs/api",
    items: [
      { title: "Authentication", href: "/docs/api/auth" },
      { title: "Endpoints", href: "/docs/api/endpoints" }
    ]
  },
  {
    title: "Guides",
    href: "/docs/guides",
    items: [
      { title: "Best Practices", href: "/docs/guides/best-practices" },
      { title: "Troubleshooting", href: "/docs/guides/troubleshooting" }
    ]
  }
];

export function SearchDialogDemo() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Dialog Positioning Demo</CardTitle>
          <CardDescription>
            Test the new dialog positioning: Professional Search (top-right) and Compact Search (top-left)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Professional Search Dialog</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Opens in top-right corner with full features
              </p>
              <ProfessionalSearchDialog 
                navigationItems={mockNavigationItems}
                placeholder="Try the professional search..."
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Compact Search Dialog</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Opens in top-left corner with compact interface
              </p>
              <CompactSearchDialog 
                navigationItems={mockNavigationItems}
                placeholder="Try the compact search..."
                className="w-full"
              />
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><kbd className="px-2 py-1 bg-muted rounded text-xs">Cmd/Ctrl + K</kbd> - Open global search</p>
              <p><kbd className="px-2 py-1 bg-muted rounded text-xs">↑ ↓</kbd> - Navigate results</p>
              <p><kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> - Select result</p>
              <p><kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd> - Close dialog</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}