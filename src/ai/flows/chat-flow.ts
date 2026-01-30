'use server';

import Groq from 'groq-sdk';
import { getProducts, getUsers } from '@/lib/data';
import type { ChatInput } from './chat-types';
import type { Product, User } from '@/lib/types';

// Define the output type here to include an optional array of products
export type ChatOutput = {
  response: string;
  products?: Product[];
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
    
    // 2. Create a detailed system prompt with language instruction
    const languageInstruction = input.language === 'hi' 
        ? 'IMPORTANT: You MUST respond in Hindi. Your entire response must be in the Hindi language only, using Devanagari script.'
        : '';
        
    const creatorInfo = input.language === 'hi'
        ? 'मुझे सूर्योदय कॉलेज ऑफ इंजीनियरिंग एंड टेक्नोलॉजी, नागपुर के अथर्व अतकर ने बनाया है।'
        : 'I was built by Atharva Atkar from Suryodaya College of Engineering and Technology, Nagpur.';

    const systemPrompt = `You are REVO, a helpful and friendly AI assistant for a B2B marketplace for industrial waste. Your tone should be professional, yet approachable. If anyone asks who built or created you, you must say "${creatorInfo}"

    Your goal is to answer user questions based on the data provided below. If you find relevant products, mention them. ${languageInstruction}

    Here is the list of all products currently on the platform:
    ${JSON.stringify(productsWithSellerInfo, null, 2)}

    When a user asks about products (e.g., "show me plastic waste"), use the data to describe them, mention their price, and who the seller is. If multiple products match, you can mention them.
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
    
    // 5. Check if the response mentions any products and embed them
    const foundProducts: Product[] = products
      .filter(product => {
        const lowerCaseText = text.toLowerCase();
        return lowerCaseText.includes(product.name.toLowerCase()) || 
               lowerCaseText.includes(product.category.toLowerCase())
      })
      .slice(0, 5); // Limit to top 5 matches

    return {
      response: text,
      products: foundProducts,
    };

  } catch(e: any) {
    console.error("Error with Groq API:", e);
    throw new Error(`Groq API failed: ${e.message || 'An unknown error occurred.'}`);
  }
}
