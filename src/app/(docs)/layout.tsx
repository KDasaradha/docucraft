// src/app/(docs)/layout.tsx
import type { ReactNode } from 'react';
import { getNavigation, type NavItem } from '@/lib/docs';
import DocsLayoutClient from './docs-layout-client'; // Import the new client component

export default async function DocsLayout({ children }: { children: ReactNode }) {
  const navigationItems: NavItem[] = await getNavigation();

  return (
    <DocsLayoutClient navigationItems={navigationItems}>
      {children}
    </DocsLayoutClient>
  );
}
