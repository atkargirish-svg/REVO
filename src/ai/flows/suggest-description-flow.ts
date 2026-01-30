'use server';

/**
 * @fileOverview An smart description suggestion AI agent based on product name and seller info.
 *
 * - suggestDescription - A function that suggests a product description based on product name, category, and seller info.
 * - SuggestDescriptionInput - The input type for the suggestDescription function.
 * - SuggestDescriptionOutput - The return type for the suggestDescription function.
 */
import Groq from 'groq-sdk';
import { z } from 'zod';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const SuggestDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the waste material.'),
  category: z.string().describe('The industry sector for the waste material.'),
  sellerCompany: z.string().describe('The name of the company selling the waste.'),
  sellerLocation: z.string().describe('The location of the selling company.'),
});
export type SuggestDescriptionInput = z.infer<typeof SuggestDescriptionInputSchema>;

const SuggestDescriptionOutputSchema = z.object({
  suggestedDescription: z.string().describe('The suggested description for the waste material.'),
});
export type SuggestDescriptionOutput = z.infer<typeof SuggestDescriptionOutputSchema>;


export async function suggestDescription(input: SuggestDescriptionInput): Promise<SuggestDescriptionOutput> {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not set in the environment.');
    }

    try {
        const systemPrompt = `You are an expert copywriter for a B2B industrial waste marketplace. Your task is to write a short, professional, and compelling product description.

        You will be given the material name, its category, the seller's company name, and their location.

        Based on this information, generate a description (2-3 sentences) that is:
        - Professional and technical.
        - Includes information about potential uses if appropriate for the category.
        - Mentions the material is supplied by the given company and from their location.
        - Example for 'PET Flakes': "High-purity PET flakes suitable for bottle-to-bottle recycling or polyester fiber production. Material is consistently processed and free of major contaminants. Supplied by Acme Plastics from their facility in Pune, Maharashtra."
        - Example for 'Fly Ash': "Quality fly ash, a byproduct of thermal power generation, suitable for use as a supplementary cementitious material in concrete production. Conforms to industry standards. Available from Synergy Power Ltd, located in Nagpur."
        
        VERY IMPORTANT: Only return the description text. Do not add any introductory text like "Here is the description:" or any markdown formatting. Just the plain text description.`;
        
        const userPrompt = `Material: ${input.productName}\nCategory: ${input.category}\nSeller: ${input.sellerCompany}\nLocation: ${input.sellerLocation}`;

        const llmResponse = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.6,
        });

        const text = llmResponse.choices[0]?.message?.content || 'Could not generate a description. Please write one manually.';

        return { suggestedDescription: text.trim() };

    } catch(e: any) {
        console.error("Error with Groq API for description suggestion:", e);
        throw new Error(`Groq API failed for description suggestion: ${e.message || 'An unknown error occurred.'}`);
    }
}
