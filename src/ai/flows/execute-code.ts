
'use server';

/**
 * @fileOverview A flow for executing code on the backend.
 *
 * - executeCode - A function that takes code and language and returns the execution output.
 * - ExecuteCodeInput - The input type for the executeCode function.
 * - ExecuteCodeOutput - The return type for the executeCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const ExecuteCodeInputSchema = z.object({
  command: z.string().describe('The command to execute.'),
  code: z.string().describe('The code to execute.'),
  language: z.string().describe('The programming language of the code.'),
});
export type ExecuteCodeInput = z.infer<typeof ExecuteCodeInputSchema>;

const ExecuteCodeOutputSchema = z.object({
  output: z.string().describe('The stdout and stderr from the code execution.'),
});
export type ExecuteCodeOutput = z.infer<typeof ExecuteCodeOutputSchema>;

export async function executeCode(
  input: ExecuteCodeInput
): Promise<ExecuteCodeOutput> {
  return executeCodeFlow(input);
}

const executeCodeFlow = ai.defineFlow(
  {
    name: 'executeCodeFlow',
    inputSchema: ExecuteCodeInputSchema,
    outputSchema: ExecuteCodeOutputSchema,
  },
  async (input) => {
    // SECURITY WARNING: Executing arbitrary commands from a client is very
    // dangerous. In a real production application, this execution MUST be
    // sandboxed in a secure environment (e.g., a Docker container with
    // restricted permissions, a gVisor sandbox, or a micro-VM).
    // For this educational MVP, we are executing directly on the server
    // process, which is NOT a safe practice.

    console.log(`Executing command: ${input.command}`);

    if (input.language !== 'shell') {
      // For now, we only support shell commands on the backend.
      // Other languages are handled client-side.
       const mockedOutput = `[INFO] Backend execution for language "${input.language}" is not supported.\n[INFO] This code runs in the browser.\n[INFO] Command "${input.command}" was not executed.`;
       return {
            output: mockedOutput
       }
    }
    
    try {
      // Whitelist safe commands to prevent abuse
      const allowedCommands = ['ls', 'pwd', 'echo', 'node', 'python', 'npm', 'npx', 'tsc', 'git'];
      const commandParts = input.command.trim().split(' ');
      const commandName = commandParts[0];

      if (!allowedCommands.includes(commandName)) {
        return {
            output: `Error: Command not allowed. Only the following commands are permitted: ${allowedCommands.join(', ')}`
        };
      }

      const { stdout, stderr } = await execAsync(input.command);
      
      if (stderr) {
        return { output: `stderr: ${stderr}` };
      }
      return { output: stdout };
    } catch (error: any) {
      return { output: `Error: ${error.message}` };
    }
  }
);

    