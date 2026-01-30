'use server';

import {ai} from '@/ai/genkit';
import { 
    ChatInputSchema, 
    type ChatInput, 
    ChatOutputSchema, 
    type ChatOutput 
} from './chat-types';

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
      model: 'googleai/gemini-pro-vision',
      history: history,
      prompt: input.message,
      config: {
          temperature: 0.7,
      }
    });

    const text = llmResponse.text;
    
    return {
      response: text,
    };
  }
);
