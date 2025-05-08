
export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "DocuCraft", // Default, will be overridden by user's full_name if provided
  fullName: "Comprehensive Technology Documentation",
  description: "A unified guide covering FastAPI, Application Architecture, DevOps, DevSecOps, CI/CD, and related software engineering practices.",
  author: "KDasaradha",
  url: "https://night-fury.vercel.app", // Base URL of the deployed site
  repo: {
    name: "devdocs",
    url: "https://github.com/KDasaradha/devdocs",
    edit_uri: "edit/main/src/content/docs/", // Path from repo root to docs folder for editing
  },
  copyright: "Copyright © 2025 KDasaradha. All rights reserved.",
  assets: {
    logo: "/assets/toothless_logo.jpg", // Path relative to /public directory
    favicon: "/assets/toothless_icon.ico", // Path relative to /public directory
  },
  social: [
    {
      name: "GitHub",
      icon: "Github", // Lucide icon name
      link: "https://github.com/KDasaradha",
    },
    {
      name: "Email",
      icon: "Mail", // Lucide icon name
      link: "mailto:kdasaradha525@gmail.com",
    },
    {
      name: "LinkedIn",
      icon: "Linkedin", // Lucide icon name
      link: "https://www.linkedin.com/in/dasaradha-rami-reddy-kesari-b8471417b",
    },
  ],
  error_pages: {
    "404_page": "custom_404.md", // Filename in src/content/
  },
};

// Override default DocuCraft name with user's full_name from config
if (siteConfig.fullName) {
  siteConfig.name = siteConfig.fullName;
}
