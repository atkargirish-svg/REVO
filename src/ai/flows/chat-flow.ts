'use server';

import Groq from 'groq-sdk';
import { 
    type ChatInput, 
    type ChatOutput 
} from './chat-types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// The main flow function
export async function chat(input: ChatInput): Promise<ChatOutput> {
  if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in the environment.');
  }

  try {
    const messages = [
        ...input.history.map((msg) => ({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.content,
        })),
        {
            role: 'user' as const,
            content: input.message,
        },
    ];

    const llmResponse = await groq.chat.completions.create({
      messages: messages as any,
      model: 'gemma-7b-it',
      temperature: 0.7,
    });

    const text = llmResponse.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    return {
      response: text,
    };
  } catch(e: any) {
    console.error("Error with Groq API:", e);
    throw new Error(`Groq API failed: ${e.message || 'An unknown error occurred.'}`);
  }
}
