import { notFound } from 'next/navigation';
import { getDocumentContent, getAllMarkdownPaths } from '@/lib/docs';
import MarkdownRenderer from '@/components/docs/MarkdownRenderer';
import type { Metadata } from 'next';

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

export default async function DocPage({ params }: Props) {
  const doc = await getDocumentContent(params.slug);

  if (!doc) {
    notFound();
  }

  return (
    <article className="w-full">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{doc.title}</h1>
        {doc.description && <p className="mt-3 text-lg text-muted-foreground">{doc.description}</p>}
      </header>
      <MarkdownRenderer content={doc.content} />
    </article>
  );
}

export async function generateStaticParams() {
  const paths = await getAllMarkdownPaths();
  return paths.map((slug) => ({
    slug,
  }));
}

// For production, this will be SSG due to generateStaticParams.
// For development, force dynamic to pick up new markdown files without rebuild.
export const dynamic = process.env.NODE_ENV === 'development' ? 'force-dynamic' : 'auto';
// export const revalidate = process.env.NODE_ENV === 'development' ? 0 : false; // Another option instead of force-dynamic for dev
