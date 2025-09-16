import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-code-improvements.ts';
import '@/ai/flows/execute-code.ts';
import '@/ai/flows/edit-code.ts';
