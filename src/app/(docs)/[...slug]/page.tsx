
// src/app/(docs)/[...slug]/page.tsx
import { notFound } from 'next/navigation';
import { getDocumentContent, getAllMarkdownPaths } from '@/lib/docs';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site.config';
import DocClientView from './doc-client-view';

type Props = {
  params: { slug: string[] };
};

// Metadata function needs to fetch data directly.
// This will run on the server for each page request if dynamic.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = await getDocumentContent(params.slug);
  if (!doc) {
    return {
      title: `Not Found | ${siteConfig.name}`,
      description: 'The page you are looking for does not exist.',
    };
  }
  return {
    title: `${doc.title} | ${siteConfig.name}`,
    description: doc.description || siteConfig.description, // Fallback to site description
    openGraph: {
        title: `${doc.title} | ${siteConfig.name}`,
        description: doc.description || siteConfig.description,
        url: `${siteConfig.url}/docs/${params.slug.join('/')}`, // Construct specific page URL
        // You might want specific images per page if available
    },
    twitter: {
        title: `${doc.title} | ${siteConfig.name}`,
        description: doc.description || siteConfig.description,
    }
  };
}

export async function generateStaticParams() {
  const paths = await getAllMarkdownPaths();
  return paths.map((slugArray) => ({
    slug: slugArray,
  }));
}

export const dynamic = 'force-dynamic'; // Ensure pages are dynamically rendered for latest content

export default async function Page({ params }: Props) {
  const doc = await getDocumentContent(params.slug);

  if (!doc) {
    notFound();
  }

  // Construct edit URL
  const relativePath = doc.filePath.substring(doc.filePath.indexOf('/src/content/docs/') + '/src/content/docs/'.length);
  const editUrl = `${siteConfig.repo.url}/${siteConfig.repo.edit_uri}${relativePath}`;


  return <DocClientView initialDoc={doc} params={params} editUrl={editUrl} />;
}
