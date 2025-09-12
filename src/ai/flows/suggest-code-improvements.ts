'use server';

/**
 * @fileOverview This file implements the SuggestCodeImprovements flow, which provides AI-powered code suggestions.
 *
 * It offers real-time code improvements as the developer types.
 * The flow uses program analysis to intelligently suggest improvements.
 *
 * @exports suggestCodeImprovements - A function that takes code as input and returns suggested improvements.
 * @exports SuggestCodeImprovementsInput - The input type for the suggestCodeImprovements function.
 * @exports SuggestCodeImprovementsOutput - The return type for the suggestCodeImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCodeImprovementsInputSchema = z.object({
  code: z.string().describe('The code to analyze and suggest improvements for.'),
  language: z.string().describe('The programming language of the code.'),
});
export type SuggestCodeImprovementsInput = z.infer<
  typeof SuggestCodeImprovementsInputSchema
>;

const SuggestCodeImprovementsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of code improvement suggestions.'),
});
export type SuggestCodeImprovementsOutput = z.infer<
  typeof SuggestCodeImprovementsOutputSchema
>;

export async function suggestCodeImprovements(
  input: SuggestCodeImprovementsInput
): Promise<SuggestCodeImprovementsOutput> {
  return suggestCodeImprovementsFlow(input);
}

const suggestCodeImprovementsPrompt = ai.definePrompt({
  name: 'suggestCodeImprovementsPrompt',
  input: {schema: SuggestCodeImprovementsInputSchema},
  output: {schema: SuggestCodeImprovementsOutputSchema},
  prompt: `You are an AI-powered code assistant that provides suggestions to improve code quality, readability, and performance.

Analyze the following code and provide specific, actionable suggestions for improvement. Consider aspects such as code style, potential bugs, and opportunities for optimization.

Language: {{{language}}}
Code:
{{{code}}}

Please provide your suggestions in a concise and clear manner. Focus on the most impactful changes that can be made to enhance the code.
`,
});

const suggestCodeImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestCodeImprovementsFlow',
    inputSchema: SuggestCodeImprovementsInputSchema,
    outputSchema: SuggestCodeImprovementsOutputSchema,
  },
  async input => {
    const {output} = await suggestCodeImprovementsPrompt(input);
    return output!;
  }
);
