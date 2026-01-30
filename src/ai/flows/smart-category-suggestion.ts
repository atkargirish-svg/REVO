
'use server';

/**
 * @fileOverview A smart category suggestion AI agent.
 *
 * - suggestCategory - A function that suggests a product category based on the product name and description.
 * - SuggestCategoryInput - The input type for the suggestCategory function.
 * - SuggestCategoryOutput - The return type for the suggestCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestCategoryInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('The description of the product.'),
  availableCategories: z.array(z.string()).describe('The list of available product categories.'),
});
export type SuggestCategoryInput = z.infer<typeof SuggestCategoryInputSchema>;

const SuggestCategoryOutputSchema = z.object({
  suggestedCategory: z.string().describe('The suggested category for the product.'),
});
export type SuggestCategoryOutput = z.infer<typeof SuggestCategoryOutputSchema>;

export async function suggestCategory(input: SuggestCategoryInput): Promise<SuggestCategoryOutput> {
  return suggestCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCategoryPrompt',
  input: {schema: SuggestCategoryInputSchema},
  output: {schema: SuggestCategoryOutputSchema},
  prompt: `You are an expert in product categorization. Given the name and description of a product, and a list of available categories, you will suggest the most appropriate category for the product.

Product Name: {{{productName}}}
Product Description: {{{productDescription}}}
Available Categories: {{#each availableCategories}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Suggest the best category from the available categories for this product.`,
});

const suggestCategoryFlow = ai.defineFlow(
  {
    name: 'suggestCategoryFlow',
    inputSchema: SuggestCategoryInputSchema,
    outputSchema: SuggestCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
