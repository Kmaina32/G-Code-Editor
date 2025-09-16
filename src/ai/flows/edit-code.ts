
'use server';

/**
 * @fileOverview This file implements the 'editCode' flow, which allows an AI to make
 * direct edits to the project files based on a user's prompt. It takes the user's
 * request and the current state of all project files, and returns a set of
 * file modifications.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FileSchema = z.object({
  path: z.string().describe('The full path of the file.'),
  content: z.string().describe('The content of the file.'),
});

const EditCodeInputSchema = z.object({
  prompt: z.string().describe('The user\'s request for code changes.'),
  files: z.array(FileSchema).describe('An array of all files in the project.'),
});
export type EditCodeInput = z.infer<typeof EditCodeInputSchema>;

const FileChangeSchema = z.object({
    file: z.string().describe('The absolute path of the file to modify.'),
    content: z.string().describe('The entire new content of the file.'),
});

const EditCodeOutputSchema = z.object({
  description: z.string().describe('A concise summary of the overall changes being made.'),
  changes: z.array(FileChangeSchema).describe('An array of file modifications.'),
});
export type EditCodeOutput = z.infer<typeof EditCodeOutputSchema>;


export async function editCode(
  input: EditCodeInput
): Promise<EditCodeOutput> {
  return editCodeFlow(input);
}

const editCodeSystemPrompt = `You are an expert AI software engineer specializing in Next.js, React, Tailwind CSS, and shadcn/ui.
Your task is to modify the user's project based on their instructions.
You have access to the entire file system of the project.
You MUST respond with the complete, final content for every file you change. Do not provide diffs, partial snippets, or explanations.
Your response MUST be in the JSON format defined by the output schema.

Key guidelines:
- Use Next.js App Router.
- Use TypeScript and functional components with hooks.
- Use shadcn/ui components where possible.
- Use Tailwind CSS for styling. Do not use inline styles.
- Ensure all code is clean, readable, and performant.
- Analyze the user's request and all provided files to determine which files need to be created, modified, or deleted.
- For new files, provide the full path and content.
- When modifying a file, you must return its ENTIRE new content.
- If you are adding a new package, modify the 'package.json' file and the AI will handle the installation.
`;

const editCodePrompt = ai.definePrompt({
  name: 'editCodePrompt',
  input: { schema: EditCodeInputSchema },
  output: { schema: EditCodeOutputSchema },
  system: editCodeSystemPrompt,
  prompt: `User Prompt: {{{prompt}}}

Project Files:
{{{json files}}}
`,
});

const editCodeFlow = ai.defineFlow(
  {
    name: 'editCodeFlow',
    inputSchema: EditCodeInputSchema,
    outputSchema: EditCodeOutputSchema,
  },
  async (input) => {
    const { output } = await editCodePrompt(input);
    return output!;
  }
);
