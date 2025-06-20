import { siteConfig } from '@/config/site.config';
import { Github, Mail, Linkedin, Heart, ExternalLink, Copyright, MapPin, Calendar, Code, ChevronDown, ChevronUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const iconMap: { [key: string]: LucideIcon } = {
  Github,
  Mail,
  Linkedin,
};

export default function AppFooter() {
  const currentYear = new Date().getFullYear();
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/30 pt-8 pb-8 mt-12">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Single Accordion Footer */}
        <div className="border border-border/40 rounded-lg overflow-hidden">
          {/* Always visible essential info */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              {/* Logo and site name */}
              <div className="flex items-center gap-3">
                {siteConfig.assets.logo && (
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border">
                    <Image 
                      src={siteConfig.assets.logo} 
                      alt={`${siteConfig.name} logo`}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{siteConfig.name}</h3>
                  <p className="text-sm text-muted-foreground">{siteConfig.description}</p>
                </div>
              </div>
              
              {/* Essential contact and social */}
              <div className="flex items-center gap-4">
                {/* Email contact */}
                <a 
                  href="mailto:kdasaradha525@gmail.com" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Contact</span>
                </a>
                
                {/* Social links */}
                <div className="flex gap-2">
                  {siteConfig.social.slice(0, 2).map((socialLink) => {
                    const IconComponent = iconMap[socialLink.icon] || null;
                    return (
                      <Link
                        key={socialLink.name}
                        href={socialLink.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={socialLink.name}
                        className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors"
                      >
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Expand/Collapse button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-muted/30 hover:bg-muted/50 rounded-md transition-colors"
              aria-expanded={isExpanded}
            >
              <span className="text-sm font-medium">
                {isExpanded ? 'Show Less' : 'Show More Details'}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {/* Expandable detailed content */}
          <div 
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-6 pb-6 border-t border-border/40">
              {/* Detailed sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-6">
                {/* About Section */}
                <div className="space-y-4">
                  <h4 className="text-base font-semibold tracking-tight">About</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Hyderabad, India</span>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Est. {currentYear}</span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Links */}
                <div className="space-y-4">
                  <h4 className="text-base font-semibold tracking-tight">Quick Links</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                        Documentation
                      </Link>
                    </li>
                    {siteConfig.repo?.url && (
                      <li>
                        <Link 
                          href={siteConfig.repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                        >
                          <span>GitHub</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
                
                {/* Contact Details */}
                <div className="space-y-4">
                  <h4 className="text-base font-semibold tracking-tight">Contact</h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <a 
                        href="mailto:kdasaradha525@gmail.com" 
                        className="hover:text-foreground transition-colors"
                      >
                        kdasaradha525@gmail.com
                      </a>
                    </li>
                  </ul>
                </div>
                
                {/* Connect & Newsletter */}
                <div className="space-y-4">
                  <h4 className="text-base font-semibold tracking-tight">Connect</h4>
                  <div className="flex flex-wrap gap-3">
                    {siteConfig.social.map((socialLink) => {
                      const IconComponent = iconMap[socialLink.icon] || null;
                      return (
                        <Link
                          key={socialLink.name}
                          href={socialLink.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={socialLink.name}
                          className="flex items-center justify-center h-10 w-10 rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors"
                        >
                          {IconComponent ? (
                            <IconComponent className="h-5 w-5" />
                          ) : (
                            <span className="text-sm">{socialLink.name}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                  
                  {/* Newsletter */}
                  <div className="mt-4 pt-4 border-t border-border/40">
                    <h5 className="text-sm font-medium mb-2">Stay Updated</h5>
                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="flex-1 h-9 px-3 py-2 rounded-md text-sm bg-background border border-input"
                      />
                      <button className="h-9 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors">
                        Subscribe
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Open Source Section */}
              {siteConfig.repo?.url && (
                <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Code className="h-5 w-5 text-primary" />
                    <span className="text-sm">Open Source Project</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Found an issue or want to contribute?{' '}
                    <Link
                      href={siteConfig.repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Visit the repository</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Copyright - Always visible */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Copyright className="h-3.5 w-3.5" />
            <span>{currentYear} {siteConfig.author || siteConfig.name}. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            <span>by {siteConfig.author}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}