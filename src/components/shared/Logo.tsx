
import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/config/site.config';
import { cn } from '@/lib/utils';
import { BookMarked } from 'lucide-react'; // Fallback icon

export function Logo({ collapsed, className }: { collapsed?: boolean; className?: string }) {
  const logoSrc = siteConfig.assets.logo;
  const siteName = collapsed ? siteConfig.name.charAt(0) : siteConfig.name; // Show full name or initial

  return (
    <Link 
      href="/" 
      className={cn(
        "flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/90 transition-colors",
        className
      )}
      aria-label={`${siteConfig.name} homepage`}
    >
      {logoSrc ? (
        <Image
          src={logoSrc} 
          alt={`${siteConfig.name} Logo`}
          width={collapsed ? 28 : 32} // Adjust size as needed
          height={collapsed ? 28 : 32} // Adjust size as needed
          className="rounded-sm object-contain"
          data-ai-hint="toothless dragon"
        />
      ) : (
        <BookMarked className="h-6 w-6 shrink-0" /> 
      )}
      {!collapsed && <span className="truncate">{siteConfig.name}</span>}
       {collapsed && <span className="sr-only">{siteConfig.name}</span>}
    </Link>
  );
}
