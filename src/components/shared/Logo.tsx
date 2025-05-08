import Link from 'next/link';
import { BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ collapsed, className } : { collapsed?: boolean, className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/90 transition-colors", className)}>
      <BookMarked className="h-6 w-6 shrink-0" />
      {!collapsed && <span className="truncate">DocuCraft</span>}
    </Link>
  );
}
