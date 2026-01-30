'use server';

/**
 * @fileOverview An smart description suggestion AI agent based on product image.
 *
 * - suggestDescription - A function that suggests a product description based on an image and category.
 * - SuggestDescriptionInput - The input type for the suggestDescription function.
 * - SuggestDescriptionOutput - The return type for the suggestDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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


export async function suggestDescription(input: SuggestDescriptionInput): Promise<SuggestDescriptionOutput> {
  return suggestDescriptionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'suggestDescriptionPrompt',
    input: {schema: SuggestDescriptionInputSchema},
    output: {schema: SuggestDescriptionOutputSchema},
    prompt: `You are a factory operations manager listing industrial waste on a B2B exchange platform. Your goal is to write an accurate, professional description for a potential buyer (e.g., a recycling plant).

Analyze the provided image of a waste material from the '{{{category}}}' industry sector.
{{media url=photoDataUri}}

Based on what you see in the image, write a short, technical description (1-2 sentences) of the material's composition and condition.
- Be specific and professional. For example, instead of "looks clean," say "Material appears free of contaminants and is uniformly processed."
- Mention packaging if visible (e.g., "Packaged in 1-ton jumbo bags," "Supplied in 200L drums").
- Highlight key characteristics (e.g., "Consistent shred size," "Low moisture content").
- Do NOT invent chemical properties you cannot see. Stick to the visual information and common knowledge for the material type.

VERY IMPORTANT: Only return the description text. Do not add any introductory text like "Here is the description:" or any markdown formatting. Just the plain text description. In the JSON output, the key should be 'suggestedDescription'.`
});

const suggestDescriptionFlow = ai.defineFlow(
  {
    name: 'suggestDescriptionFlow',
    inputSchema: SuggestDescriptionInputSchema,
    outputSchema: SuggestDescriptionOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        if (!output) {
            return { suggestedDescription: 'Could not generate a description. Please write one manually.' };
        }
        return output;
    } catch (error) {
        console.error("Error with Genkit description suggestion:", error);
        throw new Error(`AI description suggestion failed: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    }
  }
);
