'use server';

/**
 * @fileOverview An smart description suggestion AI agent based on product image.
 *
 * - suggestDescription - A function that suggests a product description based on an image and category.
 * - SuggestDescriptionInput - The input type for the suggestDescription function.
 * - SuggestDescriptionOutput - The return type for the suggestDescription function.
 */

import {z} from 'zod';
import Groq from 'groq-sdk';

const SuggestDescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  category: z.string().describe('The industry sector for the waste material. This will help tailor the description.'),
});
export type SuggestDescriptionInput = z.infer<typeof SuggestDescriptionInputSchema>;

const SuggestDescriptionOutputSchema = z.object({
  suggestedDescription: z.string().describe('The suggested description for the waste material.'),
});
export type SuggestDescriptionOutput = z.infer<typeof SuggestDescriptionOutputSchema>;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function suggestDescription(input: SuggestDescriptionInput): Promise<SuggestDescriptionOutput> {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in the environment.');
    }

    try {
        const prompt = `You are a factory operations manager listing industrial waste on a B2B exchange platform. Your goal is to write an accurate, professional description for a potential buyer (e.g., a recycling plant).

Analyze the provided image of a waste material from the '${input.category}' industry sector.

Based on what you see in the image, write a short, technical description (1-2 sentences) of the material's composition and condition.
- Be specific and professional. For example, instead of "looks clean," say "Material appears free of contaminants and is uniformly processed."
- Mention packaging if visible (e.g., "Packaged in 1-ton jumbo bags," "Supplied in 200L drums").
- Highlight key characteristics (e.g., "Consistent shred size," "Low moisture content").
- Do NOT invent chemical properties you cannot see. Stick to the visual information and common knowledge for the material type.

VERY IMPORTANT: Only return the description text. Do not add any introductory text like "Here is the description:" or any markdown formatting. Just the plain text description.`;
        
        const messages = [
            {
                role: 'user' as const,
                content: [
                    {
                        type: 'text' as const,
                        text: prompt,
                    },
                    {
                        type: 'image_url' as const,
                        image_url: {
                            url: input.photoDataUri,
                        }
                    }
                ]
            }
        ];

        const llmResponse = await groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.1-8b-instant',
            temperature: 0.2, // Lower temperature for more factual description
        });

        const text = llmResponse.choices[0]?.message?.content || 'Could not generate a description at this time.';

        return {
            suggestedDescription: text.trim(),
        };

    } catch (e: any) {
        console.error("Error with Groq API for description suggestion:", e);
        // Fallback or rethrow
        throw new Error(`Groq API failed for description suggestion: ${e.message || 'An unknown error occurred.'}`);
    }
}
