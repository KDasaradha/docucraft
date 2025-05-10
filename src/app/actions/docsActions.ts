'use server';

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { revalidatePath } from 'next/cache';
import { summarizeDocument, type SummarizeDocumentInput, type SummarizeDocumentOutput } from '@/ai/flows/summarize-document-flow';

interface SaveResult {
  success: boolean;
  error?: string;
  updatedTitle?: string; 
  revalidatedSlug?: string; // Added to return the slug used for revalidation
}

export async function saveDocumentContent(
  filePath: string, 
  newBodyContent: string
): Promise<SaveResult> {
  try {
    const contentRootDir = path.resolve(process.cwd(), 'src', 'content'); 
    const resolvedFilePath = path.resolve(filePath);

    if (!resolvedFilePath.startsWith(contentRootDir) || !resolvedFilePath.endsWith('.md')) {
      return { success: false, error: 'Invalid file path or type.' };
    }
    
    const originalFileContent = await fs.readFile(resolvedFilePath, 'utf-8');
    const { data: frontmatter } = matter(originalFileContent);

    const newFullFileContent = matter.stringify(newBodyContent, frontmatter);

    await fs.writeFile(resolvedFilePath, newFullFileContent, 'utf-8');

    const docsDir = path.resolve(process.cwd(), 'src', 'content', 'docs');
    let relativeToDocsPath = path.relative(docsDir, resolvedFilePath);
    relativeToDocsPath = relativeToDocsPath.replace(/\\/g, '/'); 

    let slugForRevalidation: string;
    if (relativeToDocsPath.endsWith('index.md') || relativeToDocsPath.endsWith('_index.md')) {
      slugForRevalidation = path.dirname(relativeToDocsPath);
      if (slugForRevalidation === '.' || slugForRevalidation === 'docs') { // Handle root index.md
        slugForRevalidation = ''; 
      }
    } else {
      slugForRevalidation = relativeToDocsPath.replace(/\.md$/, '');
    }
    
    const revalidationUrlPath = slugForRevalidation ? `/docs/${slugForRevalidation}` : '/docs';
    
    revalidatePath(revalidationUrlPath);
    // If it's an index file within a subdirectory, revalidate the directory path itself without /index
    if ((relativeToDocsPath.endsWith('index.md') || relativeToDocsPath.endsWith('_index.md')) && slugForRevalidation !== '' && slugForRevalidation !== 'docs') {
       revalidatePath(`/docs/${slugForRevalidation.replace(/\/$/, '')}`);
    }
    revalidatePath('/'); 
    revalidatePath('/api/first-doc-path');


    return { success: true, updatedTitle: frontmatter.title, revalidatedSlug: slugForRevalidation };
  } catch (e: any) {
    console.error('Error saving document content:', e);
    return { success: false, error: e.message || 'Failed to save document.' };
  }
}


interface SummarizeResult {
  success: boolean;
  summary?: string;
  error?: string;
}

export async function summarizeCurrentDocument(markdownContent: string): Promise<SummarizeResult> {
  if (!markdownContent.trim()) {
    return { success: false, error: 'Document content is empty.' };
  }

  try {
    const input: SummarizeDocumentInput = { markdownContent };
    const output: SummarizeDocumentOutput = await summarizeDocument(input);
    
    if (output && output.summary) {
      return { success: true, summary: output.summary };
    } else {
      return { success: false, error: 'Failed to generate summary from AI.' };
    }
  } catch (e: any) {
    console.error('Error summarizing document:', e);
    return { success: false, error: e.message || 'An unexpected error occurred while summarizing.' };
  }
}

