import OpenAI from 'openai';
import * as dotenv from 'dotenv';
// Load environment variables
dotenv.config();
// Define the 25 possible categories
export const CLAIM_CATEGORIES = [
    'Politics', 'Technology', 'Science', 'Finance', 'Health',
    'Environment', 'Sports', 'Entertainment', 'Business', 'Education',
    'Social Issues', 'Law & Legal', 'International Affairs', 'Military & Defense',
    'Transportation', 'Food & Nutrition', 'Crime & Safety', 'Weather & Climate',
    'Real Estate', 'Energy', 'Agriculture', 'Religion', 'Art & Culture',
    'Personal Life', 'Other'
];
export class ClaimCategorizer {
    constructor(apiKey) {
        const key = apiKey || process.env.OPENAI_API_KEY;
        if (!key) {
            throw new Error('OpenAI API key not found. Please set OPENAI_API_KEY environment variable or pass it directly.');
        }
        this.client = new OpenAI({ apiKey: key });
    }
    async categorize(content) {
        const categories = CLAIM_CATEGORIES.join(', ');
        const prompt = `
You are an expert content categorizer. Your task is to categorize the given claim/statement into one of the following ${CLAIM_CATEGORIES.length} categories.

CLAIM/STATEMENT: "${content}"

AVAILABLE CATEGORIES:
${categories}

Please analyze the content and determine the most appropriate category. Here are some guidelines:

- Politics: Political statements, government policies, politicians, elections, political parties
- Technology: Software, hardware, AI, internet, apps, digital innovation, tech companies
- Science: Scientific research, discoveries, experiments, theoretical science, academic studies
- Finance: Economics, banking, investments, markets, cryptocurrency, financial policies
- Health: Medical information, diseases, treatments, public health, mental health, fitness
- Environment: Climate change, pollution, conservation, sustainability, natural resources
- Sports: Athletic events, teams, players, sports statistics, competitions
- Entertainment: Movies, TV, music, celebrities, gaming, social media trends
- Business: Companies, corporate news, entrepreneurship, industry trends, commerce
- Education: Schools, universities, learning, academic policies, educational research
- Social Issues: Equality, human rights, social justice, community issues, demographics
- Law & Legal: Legal cases, legislation, court decisions, legal procedures, regulations
- International Affairs: Foreign relations, global events, international trade, diplomacy
- Military & Defense: Armed forces, national security, defense policies, conflicts
- Transportation: Cars, planes, trains, traffic, transportation infrastructure, logistics
- Food & Nutrition: Diet, cooking, restaurants, food safety, nutrition science
- Crime & Safety: Criminal activities, law enforcement, public safety, security issues
- Weather & Climate: Weather events, meteorology, natural disasters, seasonal changes
- Real Estate: Property markets, housing, construction, urban planning, architecture
- Energy: Power generation, renewable energy, oil & gas, electricity, energy policies
- Agriculture: Farming, livestock, crop production, agricultural technology, food production
- Religion: Religious beliefs, practices, institutions, spiritual matters, faith-based topics
- Art & Culture: Visual arts, literature, cultural events, museums, cultural heritage
- Personal Life: Personal experiences, family matters, lifestyle choices, individual stories
- Other: Content that doesn't clearly fit into any of the above categories

Choose the category that best represents the PRIMARY focus of the claim. If the content spans multiple categories, choose the most prominent one.

Provide your confidence level (0-1) based on:
- 0.9-1.0: Very clear and obvious categorization
- 0.7-0.9: Clear categorization with high certainty
- 0.5-0.7: Moderately certain categorization
- 0.3-0.5: Some uncertainty but reasonable categorization
- 0.0-0.3: High uncertainty, difficult to categorize

Respond in this exact JSON format:
{
    "category": "EXACT_CATEGORY_NAME",
    "confidence": 0-1,
    "reasoning": "Brief explanation of why this category was chosen"
}
`;
        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert content categorizer. Analyze the given content and respond only with valid JSON in the exact format specified.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 500,
                response_format: { type: 'json_object' }
            });
            const resultText = response.choices[0]?.message?.content?.trim();
            if (!resultText) {
                throw new Error('Empty response from OpenAI API');
            }
            try {
                const result = JSON.parse(resultText);
                // Validate required keys
                const requiredKeys = ['category', 'confidence', 'reasoning'];
                const missingKeys = requiredKeys.filter(key => !(key in result));
                if (missingKeys.length > 0) {
                    throw new Error(`Missing required keys in response: ${missingKeys.join(', ')}`);
                }
                // Validate category
                if (!CLAIM_CATEGORIES.includes(result.category)) {
                    throw new Error(`Invalid category: ${result.category}. Must be one of: ${CLAIM_CATEGORIES.join(', ')}`);
                }
                // Validate confidence
                const confidence = parseFloat(result.confidence);
                if (isNaN(confidence) || confidence < 0 || confidence > 1) {
                    throw new Error(`Invalid confidence value: ${result.confidence}. Must be a number between 0 and 1`);
                }
                return {
                    category: result.category,
                    confidence: confidence,
                    reasoning: result.reasoning,
                    content: content
                };
            }
            catch (parseError) {
                console.error('JSON parsing error:', parseError);
                console.error('Raw response:', resultText);
                return this.createErrorResult(content, `Failed to parse AI response as JSON: ${parseError}`);
            }
        }
        catch (error) {
            console.error('OpenAI API error:', error);
            return this.createErrorResult(content, `AI service error: ${error.message}`);
        }
    }
    createErrorResult(content, reasoning) {
        return {
            category: 'Other',
            confidence: 0.0,
            reasoning: reasoning,
            content: content
        };
    }
    async batchCategorize(contents) {
        const results = [];
        for (const content of contents) {
            try {
                const result = await this.categorize(content);
                results.push(result);
            }
            catch (error) {
                console.error(`Failed to categorize content: ${content}`, error);
                results.push(this.createErrorResult(content, `Batch categorization error: ${error}`));
            }
        }
        return results;
    }
}
// Convenience function for single categorization
export async function categorizeClaimContent(content, apiKey) {
    const categorizer = new ClaimCategorizer(apiKey);
    return await categorizer.categorize(content);
}
// Helper function to check if a category is valid
export function isValidCategory(category) {
    return CLAIM_CATEGORIES.includes(category);
}
// Helper function to get all categories
export function getAllCategories() {
    return CLAIM_CATEGORIES;
}
