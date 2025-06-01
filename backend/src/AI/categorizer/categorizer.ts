import * as dotenv from 'dotenv';

// Load environment variables from frontend/.env
dotenv.config({ path: '../.env' });

// Define the 25 possible categories
export const CLAIM_CATEGORIES = [
  'Politics', 'Technology', 'Science', 'Finance', 'Health',
  'Environment', 'Sports', 'Entertainment', 'Business', 'Education',
  'Social Issues', 'Law & Legal', 'International Affairs', 'Military & Defense',
  'Transportation', 'Food & Nutrition', 'Crime & Safety', 'Weather & Climate',
  'Real Estate', 'Energy', 'Agriculture', 'Religion', 'Art & Culture',
  'Personal Life', 'Other'
] as const;

export type ClaimCategory = typeof CLAIM_CATEGORIES[number];

export interface CategorizationRequest {
  content: string;
  block?: number;
  method?: string;
  claimId?: string;
}

export interface CategorizationResult {
  category: ClaimCategory;
  confidence: number;
  reasoning: string;
  content: string;
  block?: number;
  method?: string;
  claimId?: string;
}

export class ClaimCategorizer {
  private openaiClient: any = null;

  constructor(private apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key not found. Please set OPENAI_API_KEY environment variable or pass it directly.');
    }
  }

  private async initOpenAI() {
    if (!this.openaiClient) {
      try {
        const openaiModule = await eval('import("openai")');
        this.openaiClient = new openaiModule.default({ 
          apiKey: this.apiKey || process.env.OPENAI_API_KEY 
        });
      } catch (error) {
        console.error('Failed to initialize OpenAI client:', error);
        throw new Error('Could not initialize OpenAI client');
      }
    }
    return this.openaiClient;
  }

  async categorize(content: string, block?: number, method?: string, claimId?: string): Promise<CategorizationResult> {
    const categories = CLAIM_CATEGORIES.join(', ');
    
    const prompt = `
You are an expert content categorizer. Your task is to categorize the given claim/statement into one of the following ${CLAIM_CATEGORIES.length} categories.

CLAIM/STATEMENT: "${content}"

ADDITIONAL CONTEXT:
${block ? `Block Number: ${block}` : ''}
${method ? `Method: ${method}` : ''}
${claimId ? `Claim ID: ${claimId}` : ''}

AVAILABLE CATEGORIES:
${categories}

Please analyze the content and determine the most appropriate category. Here are some guidelines:

- Politics: Political statements, government policies, politicians, elections, political parties
- Technology: Software, hardware, AI, internet, apps, digital innovation, tech companies
- Science: Scientific research, discoveries, experiments, theoretical science, academic studies
- Finance: Economics, banking, investments, markets, cryptocurrency, financial policies
- Health: Medical information, diseases, treatments, public health, mental health, fitness
- Environment: Climate change, pollution, conservation, sustainability, natural resources
- Sports: Athletic events, teams, players, competitions, sports news
- Entertainment: Movies, music, celebrities, TV shows, gaming, pop culture
- Business: Corporate news, startups, industry trends, commerce, trade
- Education: Schools, universities, learning, academic policies, educational research
- Social Issues: Human rights, equality, social justice, community issues
- Law & Legal: Court cases, legislation, legal procedures, justice system
- International Affairs: Foreign policy, diplomacy, global events, international relations
- Military & Defense: Armed forces, national security, defense policies, conflicts
- Transportation: Vehicles, infrastructure, travel, logistics, public transit
- Food & Nutrition: Diet, cooking, restaurants, food safety, nutrition science
- Crime & Safety: Criminal activities, law enforcement, public safety, security
- Weather & Climate: Weather events, climate patterns, meteorology, natural disasters
- Real Estate: Property markets, housing, construction, urban development
- Energy: Power generation, renewable energy, oil & gas, energy policies
- Agriculture: Farming, crops, livestock, agricultural technology, food production
- Religion: Religious practices, beliefs, institutions, spiritual matters
- Art & Culture: Visual arts, literature, cultural events, museums, heritage
- Personal Life: Individual experiences, lifestyle, personal opinions, daily life
- Other: Content that doesn't clearly fit into the above categories

Please respond with a JSON object containing:
{
  "category": "selected_category",
  "confidence": 0.85,
  "reasoning": "Brief explanation of why this category was chosen"
}

The confidence should be a number between 0 and 1, where 1 means completely certain.
`;

    // Retry logic - 3 attempts
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const client = await this.initOpenAI();
        
        const response = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
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
          if (attempt === 3) {
            return this.createErrorResult(content, 'Empty response from OpenAI API after 3 attempts', block, method, claimId);
          }
          continue;
        }

        try {
          const result = JSON.parse(resultText);
          
          // Validate required keys
          const requiredKeys = ['category', 'confidence', 'reasoning'];
          const missingKeys = requiredKeys.filter(key => !(key in result));
          if (missingKeys.length > 0) {
            if (attempt === 3) {
              return this.createErrorResult(content, `Missing required keys in response: ${missingKeys.join(', ')}`, block, method, claimId);
            }
            continue;
          }

          // Validate category
          if (!CLAIM_CATEGORIES.includes(result.category)) {
            if (attempt === 3) {
              return this.createErrorResult(content, `Invalid category: ${result.category}`, block, method, claimId);
            }
            continue;
          }

          // Validate confidence
          const confidence = parseFloat(result.confidence);
          if (isNaN(confidence) || confidence < 0 || confidence > 1) {
            if (attempt === 3) {
              return this.createErrorResult(content, `Invalid confidence value: ${result.confidence}`, block, method, claimId);
            }
            continue;
          }

          return {
            category: result.category as ClaimCategory,
            confidence: confidence,
            reasoning: result.reasoning,
            content: content,
            block,
            method,
            claimId
          };

        } catch (parseError) {
          if (attempt === 3) {
            return this.createErrorResult(content, `Failed to parse AI response as JSON: ${parseError}`, block, method, claimId);
          }
          continue;
        }

      } catch (error: any) {
        if (attempt === 3) {
          return this.createErrorResult(content, `AI service error: ${error.message}`, block, method, claimId);
        }
        continue;
      }
    }

    return this.createErrorResult(content, 'Failed after 3 attempts', block, method, claimId);
  }

  private createErrorResult(content: string, reasoning: string, block?: number, method?: string, claimId?: string): CategorizationResult {
    return {
      category: 'Other',
      confidence: 0.0,
      reasoning: reasoning,
      content: content,
      block,
      method,
      claimId
    };
  }

  async batchCategorize(contents: CategorizationRequest[]): Promise<CategorizationResult[]> {
    const results: CategorizationResult[] = [];
    
    for (const request of contents) {
      const result = await this.categorize(request.content, request.block, request.method, request.claimId);
      results.push(result);
    }
    
    return results;
  }
}

// Convenience function for single categorization with retry logic
export async function categorizeClaimContent(content: string, block?: number, method?: string, claimId?: string, apiKey?: string): Promise<CategorizationResult> {
  const categorizer = new ClaimCategorizer(apiKey);
  return await categorizer.categorize(content, block, method, claimId);
}

// Helper function to check if a category is valid
export function isValidCategory(category: string): category is ClaimCategory {
  return CLAIM_CATEGORIES.includes(category as ClaimCategory);
}

// Helper function to get all categories
export function getAllCategories(): readonly ClaimCategory[] {
  return CLAIM_CATEGORIES;
} 