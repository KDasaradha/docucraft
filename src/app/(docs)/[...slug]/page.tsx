
// src/app/(docs)/[...slug]/page.tsx
import { notFound } from 'next/navigation';
import { getDocumentContent } from '@/lib/docs';
import type { Metadata } from 'next';
import DocClientView from './doc-client-view';

type Props = {
  params: { slug: string[] };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = await getDocumentContent(params.slug);
  if (!doc) {
    return {
      title: 'Not Found | DocuCraft',
      description: 'The page you are looking for does not exist.',
    };
  }
  return {
    title: `${doc.title} | DocuCraft`,
    description: doc.description || `Documentation for ${doc.title}`,
  };
}

export async function generateStaticParams() {
  // Dynamically import to ensure it's treated as server-side
  const { getAllMarkdownPaths: getPaths } = await import('@/lib/docs');
  const paths = await getPaths();
  return paths.map((slugArray) => ({
    slug: slugArray,
  }));
}

export const dynamic = 'force_dynamic'; // Force dynamic rendering

export default async function Page({ params }: Props) {
  const doc = await getDocumentContent(params.slug);

  if (!doc) {
    notFound();
  }

  return <DocClientView initialDoc={doc} params={params} />;
}
