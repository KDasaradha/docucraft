
import { siteConfig } from '@/config/site.config';
import { Github, Mail, Linkedin, Icon as LucideIcon } from 'lucide-react';
import Link from 'next/link';

const iconMap: { [key: string]: LucideIcon } = {
  Github,
  Mail,
  Linkedin,
};

export default function AppFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {siteConfig.copyright}
          </p>
          <div className="flex items-center space-x-4">
            {siteConfig.social.map((socialLink) => {
              const IconComponent = iconMap[socialLink.icon] || null;
              return (
                <Link
                  key={socialLink.name}
                  href={socialLink.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={socialLink.name}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {IconComponent ? <IconComponent className="h-5 w-5" /> : <span>{socialLink.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>
         {siteConfig.repo.url && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            This site is open source. Found an issue or want to contribute? Visit the{' '}
            <Link href={siteConfig.repo.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
              repository on GitHub
            </Link>.
          </p>
        )}
      </div>
    </footer>
  );
}
