'use server';

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { revalidatePath } from 'next/cache';

interface SaveResult {
  success: boolean;
  error?: string;
  updatedTitle?: string; 
}

export async function saveDocumentContent(
  filePath: string, 
  newBodyContent: string
): Promise<SaveResult> {
  try {
    const contentRootDir = path.resolve(process.cwd(), 'src', 'content'); // Broader check
    const resolvedFilePath = path.resolve(filePath);

    if (!resolvedFilePath.startsWith(contentRootDir) || !resolvedFilePath.endsWith('.md')) {
      return { success: false, error: 'Invalid file path or type.' };
    }
    
    // Read the original file to get its frontmatter
    const originalFileContent = await fs.readFile(resolvedFilePath, 'utf-8');
    const { data: frontmatter } = matter(originalFileContent);

    // Create new full content with original frontmatter and new body
    const newFullFileContent = matter.stringify(newBodyContent, frontmatter);

    // Write the updated content back to the file
    await fs.writeFile(resolvedFilePath, newFullFileContent, 'utf-8');

    // Revalidate the path for the Next.js cache
    const docsDir = path.resolve(process.cwd(), 'src', 'content', 'docs');
    let relativeToDocsPath = path.relative(docsDir, resolvedFilePath);
    relativeToDocsPath = relativeToDocsPath.replace(/\\/g, '/'); // Normalize slashes

    let slugForRevalidation: string;
    if (relativeToDocsPath.endsWith('index.md') || relativeToDocsPath.endsWith('_index.md')) {
      slugForRevalidation = path.dirname(relativeToDocsPath);
      if (slugForRevalidation === '.') slugForRevalidation = ''; // For root index.md
    } else {
      slugForRevalidation = relativeToDocsPath.replace(/\.md$/, '');
    }
    
    const revalidationUrlPath = slugForRevalidation ? `/docs/${slugForRevalidation}` : '/docs';
    
    revalidatePath(revalidationUrlPath);
    // If it's an index file, also revalidate the path without trailing slash for consistency if it's not root
    if ((relativeToDocsPath.endsWith('index.md') || relativeToDocsPath.endsWith('_index.md')) && slugForRevalidation !== '') {
      revalidatePath(`/docs/${slugForRevalidation.replace(/\/$/, '')}`);
    }
     // Revalidate the home page as well as it depends on the first doc path
    revalidatePath('/');
    revalidatePath('/api/first-doc-path');


    return { success: true, updatedTitle: frontmatter.title };
  } catch (e: any) {
    console.error('Error saving document content:', e);
    return { success: false, error: e.message || 'Failed to save document.' };
  }
}
