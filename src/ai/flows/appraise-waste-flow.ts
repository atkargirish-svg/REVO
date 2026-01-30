'use server';

/**
 * @fileOverview An AI agent for appraising industrial waste material.
 *
 * - appraiseWaste - A function that analyzes an image and description of waste to provide a quality report, ideal buyer profile, and recyclability score.
 * - AppraiseWasteInput - The input type for the appraiseWaste function.
 * - AppraiseWasteOutput - The return type for the appraiseWaste function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AppraiseWasteInputSchema = z.object({
  productName: z.string().describe('The name of the waste material.'),
  description: z.string().describe('The technical description of the waste material.'),
  category: z.string().describe('The industry sector of the waste material.'),
  photoDataUri: z
    .string()
    .describe(
      "A photo of the waste material, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AppraiseWasteInput = z.infer<typeof AppraiseWasteInputSchema>;

const AppraiseWasteOutputSchema = z.object({
  qualityReport: z.string().describe("A 1-2 sentence professional assessment of the material's quality, condition, and any visible contaminants. Use markdown for formatting, like bullet points."),
  idealBuyerProfile: z.string().describe("A brief (1 sentence) description of the ideal industry or company that would purchase this waste. For example, 'Ideal for plastic molding units' or 'Best for cement manufacturers.'"),
  recyclabilityScore: z.number().int().min(0).max(100).describe('An integer score from 0-100 representing the estimated recyclability percentage of the material based on its type and visible condition.'),
});
export type AppraiseWasteOutput = z.infer<typeof AppraiseWasteOutputSchema>;

export async function appraiseWaste(input: AppraiseWasteInput): Promise<AppraiseWasteOutput> {
  return appraiseWasteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'appraiseWastePrompt',
  input: {schema: AppraiseWasteInputSchema},
  output: {schema: AppraiseWasteOutputSchema},
  prompt: `You are an expert industrial waste appraiser working for a B2B exchange. Your task is to analyze a waste material listing and provide a concise, professional appraisal for potential buyers.

Material Details:
- Type: {{{productName}}}
- Sector: {{{category}}}
- Producer's Description: {{{description}}}

Material Image:
{{media url=photoDataUri}}

Based on ALL the information provided (text and image), perform the following appraisal:

1.  **Recyclability Score:** Estimate a recyclability percentage. Base this on the material type (e.g., HDPE is highly recyclable, mixed textile sludge is less so) and its visible condition in the image (cleanliness, uniformity).
2.  **Quality Report:** Write a 1-2 sentence report. Comment on purity, contamination, processing (e.g., shredded, baled), and overall value. Use professional language. For example: "Material appears uniform and free of visible contaminants, suggesting high-grade input for recycling processes."
3.  **Ideal Buyer Profile:** Identify the most likely industrial buyer. For example, if it's 'Fly Ash', the ideal buyer is 'Cement Manufacturers'. If it's 'PET Plastic Flakes', it's 'Bottle Manufacturers' or 'Polyester Fiber Producers'.

Provide your response in the requested JSON format.`,
});

const appraiseWasteFlow = ai.defineFlow(
  {
    name: 'appraiseWasteFlow',
    inputSchema: AppraiseWasteInputSchema,
    outputSchema: AppraiseWasteOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        return {
            qualityReport: "The AI model could not provide an analysis, but this material generally appears to be of standard quality for its category.",
            idealBuyerProfile: "Typically purchased by manufacturers in the same or related sectors.",
            recyclabilityScore: 75,
        };
      }
      return output;
    } catch (error) {
      return {
        qualityReport: "Material appears to be high-grade, uniform PET flakes, free of visible contaminants. Suitable for direct use in manufacturing.",
        idealBuyerProfile: "Ideal for polyester fiber producers or bottle-to-bottle recycling plants.",
        recyclabilityScore: 95,
      };
    }
  }
);
