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
        <div className="flex flex-col items-center justify-center gap-4">
          <nav aria-label="Social media" className="flex items-center space-x-4">
            {siteConfig.social.map((socialLink) => {
              const IconComponent = iconMap[socialLink.icon] || null;

              return (
                <Link
                  key={socialLink.name}
                  href={socialLink.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={socialLink.name}
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  {IconComponent ? (
                    <IconComponent className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span className="text-sm">{socialLink.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {siteConfig.repo?.url && (
            <div className="text-center text-xs text-muted-foreground">
              <p>
                This site is open source. Found an issue or want to contribute?{' '}
                <Link
                  href={siteConfig.repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  Visit the repository on GitHub
                </Link>.
              </p>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
