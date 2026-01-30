'use server';

/**
 * @fileoverview This file is the entry point for Genkit's developer UI.
 *
 * It imports all the flows that should be available in the developer UI.
 *
 * This file is not intended to be used in production.
 */

import {config} from 'dotenv';
config();

import '@/ai/flows/appraise-waste-flow.ts';
import '@/ai/flows/smart-category-suggestion.ts';
import '@/ai/flows/suggest-description-flow.ts';
import '@/ai/flows/chat-flow.ts';
