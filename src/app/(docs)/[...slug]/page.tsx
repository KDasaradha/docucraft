
// src/app/(docs)/[...slug]/page.tsx
import { notFound } from 'next/navigation';
import { getDocumentContent, getAllMarkdownPaths, getPrevNextDocs } from '@/lib/docs';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site.config';
import DocClientView from './doc-client-view';

type Props = {
  params: { slug: string[] };
};

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
    description: doc.description || siteConfig.description, 
    openGraph: {
        title: `${doc.title} | ${siteConfig.name}`,
        description: doc.description || siteConfig.description,
        url: `${siteConfig.url}/docs/${params.slug.join('/')}`, 
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

export const dynamic = 'force-dynamic'; 

export default async function Page({ params }: Props) {
  const doc = await getDocumentContent(params.slug);

  if (!doc) {
    notFound();
  }

  const { prev: prevDoc, next: nextDoc } = await getPrevNextDocs(params.slug);

  return <DocClientView initialDoc={doc} params={params} prevDoc={prevDoc} nextDoc={nextDoc} />;
}
