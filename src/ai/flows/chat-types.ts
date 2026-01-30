import { z } from 'zod';

// Define schema for chat message history
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  message: z.string(),
  language: z.enum(['en', 'hi']).optional().default('en'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

// The output type is now more complex and defined directly in the `chat-flow.ts`
// to include product data. We remove the output schema from this shared file.
