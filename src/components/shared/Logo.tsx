
import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/config/site.config';
import { cn } from '@/lib/utils';
import { BookMarked } from 'lucide-react'; 

export function Logo({ collapsed, className }: { collapsed?: boolean; className?: string }) {
  const logoSrc = siteConfig.assets.logo;
  
  return (
    <Link 
      href="/" 
      className={cn(
        "flex items-center gap-2.5 text-lg font-semibold text-primary hover:text-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
        className
      )}
      aria-label={`${siteConfig.name} homepage`}
    >
      {logoSrc ? (
        <Image
          src={logoSrc} 
          alt={`${siteConfig.name} Logo`}
          width={collapsed ? 28 : 32} // Adjusted for slightly larger icon sidebar (28px for 3.5rem/56px bar width)
          height={collapsed ? 28 : 32}
          className="rounded-sm object-contain"
          data-ai-hint="toothless dragon"
          priority // Preload logo if it's above the fold
        />
      ) : (
        <BookMarked className={cn("shrink-0", collapsed ? "h-7 w-7" : "h-8 w-8")} /> 
      )}
      {!collapsed && <span className="truncate">{siteConfig.name}</span>}
       {collapsed && <span className="sr-only">{siteConfig.name}</span>}
    </Link>
  );
}
