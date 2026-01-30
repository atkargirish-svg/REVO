'use server';

import Groq from 'groq-sdk';
import { getProducts, getUsers } from '@/lib/data';
import type { ChatInput } from './chat-types';
import type { Product, User } from '@/lib/types';

// Define the output type here to include an optional product
export type ChatOutput = {
  response: string;
  product?: Product;
};

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// The main flow function
export async function chat(input: ChatInput): Promise<ChatOutput> {
  if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in the environment.');
  }

  try {
    // 1. Fetch all products and users to provide context to the AI
    const products = await getProducts();
    const users = await getUsers();

    // Create a map of users for easy lookup
    const userMap = new Map<string, User>();
    users.forEach(user => userMap.set(user.id, user));

    // Enhance products with seller info for the AI prompt
    const productsWithSellerInfo = products.map(product => {
        const seller = userMap.get(product.sellerId);
        return {
            ...product,
            sellerInfo: seller ? {
                name: seller.name,
                company: seller.company,
                location: seller.location,
                description: seller.companyDescription,
            } : null
        };
    });
    
    // 2. Create a detailed system prompt
    const systemPrompt = `You are REVO, a helpful and friendly AI assistant for a B2B marketplace for industrial waste. Your tone should be professional, yet approachable. Your creator is Atharva Atkar from Suryodaya College of Engineering and Technology, Nagpur. If anyone asks who built or created you, you must say "I was built by Atharva Atkar from Suryodaya College of Engineering and Technology, Nagpur."

    Your goal is to answer user questions based on the data provided below.

    Here is the list of all products currently on the platform:
    ${JSON.stringify(productsWithSellerInfo, null, 2)}

    When a user asks about a product (e.g., "tell me about the textile sludge"), use the data to describe it, mention its price, and who the seller is.
    When a user asks about a seller (e.g., "who is Acme Manufacturing?"), provide their details.
    
    IMPORTANT: Keep your answers concise, friendly, and to the point. Do not give long, boring paragraphs. If you are describing a product, keep the description to 1-2 sentences.
    `;

    // 3. Construct the messages array for the API call
    const messages = [
        {
            role: 'system' as const,
            content: systemPrompt,
        },
        ...input.history.map((msg) => ({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.content,
        })),
        {
            role: 'user' as const,
            content: input.message,
        },
    ];

    // 4. Call the Groq API
    const llmResponse = await groq.chat.completions.create({
      messages: messages as any,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
    });

    const text = llmResponse.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    // 5. Check if the response mentions a product and embed the product object
    let foundProduct: Product | undefined = undefined;
    for (const product of products) {
        // Use a simple includes check.
        if (text.toLowerCase().includes(product.name.toLowerCase())) {
            foundProduct = product;
            break; // Stop after finding the first match
        }
    }

    return {
      response: text,
      product: foundProduct, // Will be undefined if no product is found
    };

  } catch(e: any) {
    console.error("Error with Groq API:", e);
    throw new Error(`Groq API failed: ${e.message || 'An unknown error occurred.'}`);
  }
}
