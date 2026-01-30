'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define schema for chat message history
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  message: z.string(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  response: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// The main flow function
export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    // Construct the prompt history from the input
    const history = input.history.map((msg) => ({
        role: msg.role,
        content: [{text: msg.content}],
    }));

    const llmResponse = await ai.generate({
      // We don't need to specify the model here if it's set globally in genkit.ts
      // But it's good practice to be explicit.
      model: 'googleai/gemini-1.5-pro-latest',
      history: history,
      prompt: input.message,
      config: {
          // Lower temperature for more predictable, less "creative" chat responses
          temperature: 0.7,
      }
    });

    const text = llmResponse.text;
    
    return {
      response: text,
    };
  }
);
