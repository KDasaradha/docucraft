import { NextRequest, NextResponse } from 'next/server';
import { documentationAssistant } from '@/ai/flows/documentation-assistant-flow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { question, documentationContext, conversationHistory, userLevel } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    // Call the AI documentation assistant flow
    const result = await documentationAssistant({
      question: question.trim(),
      documentationContext: documentationContext || 'DocuCraft documentation - comprehensive guide for modern web development',
      conversationHistory: conversationHistory || [],
      userLevel: userLevel || 'intermediate',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Documentation assistant API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process your question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Documentation Assistant API',
      usage: 'POST /api/ai/documentation-assistant with { question, documentationContext?, conversationHistory?, userLevel? }'
    }
  );
}