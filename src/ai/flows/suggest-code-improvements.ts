
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

Analyze the following code and provide a list of specific, actionable suggestions for improvement. For each suggestion, explain why it's an improvement. Consider aspects such as code style, potential bugs, opportunities for optimization, and best practices.

Language: {{{language}}}
Code:
\`\`\`{{{language}}}
{{{code}}}
\`\`\`

Please provide your suggestions in a clear, concise list. Focus on the most impactful changes.
`,
});

const suggestCodeImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestCodeImprovementsFlow',
    inputSchema: SuggestCodeImprovementsInputSchema,
    outputSchema: SuggestCodeImprovementsOutputSchema,
  },
  async input => {
    if (!input.code.trim()) {
      return { suggestions: ["There's no code to analyze. Open a file and write some code first."] };
    }
    const {output} = await suggestCodeImprovementsPrompt(input);
    return output!;
  }
);
