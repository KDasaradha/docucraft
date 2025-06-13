import { NextRequest, NextResponse } from 'next/server';
import { enhancedIntelligentSearch } from '@/ai/flows/enhanced-search';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { query, documentationContent, maxResults, includeSnippets } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Call the enhanced search flow
    const result = await enhancedIntelligentSearch({
      query: query.trim(),
      documentationContent: documentationContent || 'DocuCraft comprehensive documentation content for modern web development, including guides, tutorials, API references, and best practices.',
      maxResults: maxResults || 10,
      includeSnippets: includeSnippets !== false,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Enhanced search API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Enhanced Search API',
      usage: 'POST /api/ai/enhanced-search with { query, documentationContent?, maxResults?, includeSnippets? }'
    }
  );
}