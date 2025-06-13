import { NextRequest, NextResponse } from 'next/server';
import { explainCode, type CodeExplanationInput } from '@/ai';
import { z } from 'zod';

// Validation schema for the API request
const RequestSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  language: z.string().min(1, 'Language is required'),
  context: z.string().optional(),
  explainLevel: z.enum(['basic', 'detailed', 'expert']).default('detailed'),
  focusAreas: z.array(z.enum([
    'functionality', 'performance', 'security', 'best-practices', 
    'patterns', 'testing', 'debugging', 'optimization'
  ])).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedInput = RequestSchema.parse(body);
    
    // Call the AI explanation flow
    const result = await explainCode(validatedInput as CodeExplanationInput);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
    
  } catch (error) {
    console.error('Code explanation API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to explain code. Please try again.',
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}