'use server';
import Groq from 'groq-sdk';
import { z } from 'zod';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const MonthlyDataSchema = z.object({
  month: z.string(),
  diverted: z.number(),
  profit: z.number(),
});

const AnalyzeImpactInputSchema = z.object({
  monthlyData: z.array(MonthlyDataSchema),
});
export type AnalyzeImpactInput = z.infer<typeof AnalyzeImpactInputSchema>;

const AnalyzeImpactOutputSchema = z.object({
  report: z.string().describe('A 1-2 sentence analysis of the waste diversion and profit trends.'),
});
export type AnalyzeImpactOutput = z.infer<typeof AnalyzeImpactOutputSchema>;

export async function analyzeImpact(input: AnalyzeImpactInput): Promise<AnalyzeImpactOutput> {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not set in the environment.');
    }

    try {
        const systemPrompt = `You are a financial analyst for a B2B circular economy marketplace called REVO.
        You will be given the last 6 months of data, showing the number of waste streams diverted from landfills and the total profit (value in INR) generated from those diversions each month.
        Your task is to provide a very short (1-2 sentences MAX) and insightful summary of the trend.
        - Comment on the growth or decline in both diversions and profit.
        - Be encouraging and professional.
        - Example: "Consistent growth in diversions over the past quarter demonstrates strong platform adoption, with a significant corresponding increase in market value creation."
        - Example: "While diversions dipped slightly in May, the overall profitability remains strong, indicating a healthy market for high-value materials."
        
        VERY IMPORTANT: Only return the analysis text. Do not add any introductory text like "Here is the analysis:". Just the plain text.`;
        
        const userPrompt = `Here is the data for the last 6 months:
        ${JSON.stringify(input.monthlyData, null, 2)}`;

        const llmResponse = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
        });

        const text = llmResponse.choices[0]?.message?.content || 'The platform is seeing steady activity in waste diversion and value creation.';

        return { report: text.trim() };

    } catch(e: any) {
        console.error("Error with Groq API for impact analysis:", e);
        // Provide a fallback report
        return { report: 'The platform continues to facilitate valuable connections, turning waste into profitable resources for businesses nationwide.' };
    }
}
