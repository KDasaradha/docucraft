
'use server';

import type { ZodError } from 'zod';
import { z } from 'zod';

const FeedbackSchema = z.object({
  documentTitle: z.string().min(1, "Document title is required."),
  documentPath: z.string().min(1, "Document path is required."),
  isHelpful: z.boolean(),
  timestamp: z.string().datetime(),
});

export type FeedbackInput = z.infer<typeof FeedbackSchema>;

interface SubmitFeedbackResult {
  success: boolean;
  message: string;
  errors?: ZodError<FeedbackInput> | null;
}

export async function submitFeedback(feedback: FeedbackInput): Promise<SubmitFeedbackResult> {
  try {
    const validatedFeedback = FeedbackSchema.parse(feedback);

    // For this iteration, we'll just log to the console.
    // In a real application, you would save this to a database.
    console.log('Feedback Received:', validatedFeedback);

    return {
      success: true,
      message: 'Thank you for your feedback!',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Invalid feedback data.',
        errors: error,
      };
    }
    console.error('Error submitting feedback:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while submitting feedback.',
      errors: null,
    };
  }
}
