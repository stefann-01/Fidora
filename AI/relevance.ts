import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface AnalysisResult {
  reasoning: string;
  predicted_relationship: 'SUPPORT' | 'OPPOSE' | 'UNRELATED' | 'NOT_EVIDENCE';
  confidence: number;
  quality_score: number | null;
  evidence: string;
  statement: string;
  claimed_side: boolean;
}

export interface EvidenceItem {
  evidence: string;
  statement: string;
  claimed_side: boolean;
}

export class EvidenceAnalyzer {
  private client: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key not found. Please set OPENAI_API_KEY environment variable or pass it directly.');
    }
    
    this.client = new OpenAI({ apiKey: key });
  }

  async analyzeEvidenceRelevance(evidence: string, statement: string, claimedSide: boolean): Promise<AnalysisResult> {
    const prompt = `
You are an expert fact-checker and evidence analyst with web search capabilities. Your task is to determine whether the provided evidence actually supports, opposes, is unrelated to, or is not evidence for the given statement.

STATEMENT: "${statement}"

EVIDENCE: "${evidence}"

CLAIMED POSITION: The evidence claims to ${claimedSide ? 'SUPPORT' : 'OPPOSE'} the statement.

Please analyze the evidence, reason about it and determine:

1. ACTUAL RELATIONSHIP: Does the evidence actually:
   - SUPPORT the statement (provides facts/data that confirm it)
   - OPPOSE the statement (provides facts/data that contradict it)  
   - UNRELATED (content is about a completely different topic and has no connection to the statement)
   - NOT_EVIDENCE (personal opinion without supporting materials, unsupported claims, or statements without evidence)

2. CONFIDENCE: How confident are you in this assessment? (from 0 to 1)

3. QUALITY SCORE: If the relationship is SUPPORT or OPPOSE, rate the overall quality of the evidence (from 0 to 1) based on:
   - CREDIBILITY: How reliable and trustworthy is the source/information?
   - USEFULNESS: How relevant and applicable is the evidence to the statement?
   - HELPFULNESS: How valuable is this evidence for understanding the topic?
   
   Consider factors like:
   - Source authority and expertise
   - Recency and relevance of information
   - Strength of the supporting data/facts
   - Clarity and specificity of the evidence
   - Whether it addresses core aspects of the statement
   
   Set to null if relationship is UNRELATED or NOT_EVIDENCE.

4. REASONING: Briefly explain your analysis.

Instructions:
- Evidence can be only text, or text with supporting material in form of links/URLs etc.
- If the evidence contains links/URLs, do search and analyze the actual content of those links.
- CONSIDER BOTH the text of the evidence and linked content, if at least one of them support or oppose the statement, then the evidence is relevant. If they are contradicting each other, then choose the one in which the evidence is more confident. For example if the evidence claims that the statement is false, but the linked content is not related, it is still relevant evidence claiming that the statement is false. Also, if the text is not relevant but the linked content is, then the evidence is relevant. 
- DO CHECK THE LINKED CONTENT even if the text is clearly relevant! For example, do not make a conclusion only based on the text or the website type, even if you can.
- DO NOT ONLY ASSUME what the linked content is about, but actually visit the page and assess. If it is not clear from the page, take the best guess with lower confidence.
- DO NOT consider the credibility of the source for relationship determination, just the content of the evidence! However, DO consider credibility for the quality score.
- If evidence is related to the statement topic and provide valuable information, but you cannot make a clear conclusion about support/oppose, then choose between SUPPORT or OPPOSE with very low confidence (<0.5).

UNRELATED:
- Use this only if the evidence is about a completely different topic with no connection to the statement at all (e.g., statement about vaccines, evidence about cooking recipes).

NOT_EVIDENCE:
- Use this for personal opinions without supporting materials, unsupported claims, or vague statements. Examples:
  * "I believe the statement is false"
  * "It has been shown" (without citing what or where)
  * "It is a fact" (without providing the actual facts)
  * "Everyone knows that..."
  * Pure personal anecdotes without broader relevance
- DO NOT use NOT_EVIDENCE if evidance points to the resources or mention it, than it is an evidence, no matter if it is not providing sepcific details! For example: "it has been shown that this is true, see the article from New York Times on the 1st of January 2021." - this is an SUPPORT evidence.
- Personal experience that can bring value to the discussion is still considered evidence, not NOT_EVIDENCE.

HOW TO GIVE CONFIDENCE:
- The confidence is used to show how confident you are in the category. If you choose:
UNRELATED: give how confident you are the evidence is not related to the statement.
NOT_EVIDENCE: give how confident you are that the evidence is not providing any evidence for the statement.
SUPPORT or OPPOSE: give how confident you are that the evidence supports or opposes the statement based on the sentiment.
- Give high confidence 0.9+ if the relationship is clearly stated in the evidence.
- Give high confidence 0.7-0.8 if you are fairly certain about the relationship and the opinion is stated in the evidence. If you have to assume the opinion, this is not high confidence.
- Give medium confidence 0.3-0.6 if you are not certain about the relationship. For example, if the evidence is about a study, but you cannot understand the study and can only assume what it is about. For example, if you believe something only because the linked website typically has certain information, this is not certain enough!
- Give very low confidence 0.0-0.3 if you are not certain at all about the relationship.
- "it is reasonable to assume" is low confidence!
- If the evidence is only a link, give maximum 0.7 confidence.

HOW TO GIVE QUALITY SCORE:
- Only provide quality score for SUPPORT or OPPOSE relationships
- 0.8-1.0: High quality - Expert sources, peer-reviewed studies, official statistics, clear data with proper methodology
- 0.6-0.8: Good quality - Reputable news sources, well-documented reports, clear logical arguments with some supporting data
- 0.4-0.6: Moderate quality - General sources, some supporting information, reasonable arguments but limited depth
- 0.2-0.4: Low quality - Weak sources, limited supporting information, unclear or poorly presented arguments
- 0.0-0.2: Very low quality - Unreliable sources, no supporting data, misleading or biased presentation

Respond in this exact JSON format:
{
    "reasoning": "Brief explanation of your analysis",
    "predicted_relationship": "SUPPORT|OPPOSE|UNRELATED|NOT_EVIDENCE",
    "confidence": 0-1,
    "quality_score": 0-1 or null
}
`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert fact-checker with web search capabilities. When you encounter URLs in evidence, search and analyze their content. In any case, analyse the text of the evidence itself. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const resultText = response.choices[0]?.message?.content?.trim();
      if (!resultText) {
        throw new Error('Empty response from OpenAI API');
      }

      try {
        const result = JSON.parse(resultText) as any;

        // Validate required keys
        const requiredKeys = ['predicted_relationship', 'confidence', 'reasoning', 'quality_score'];
        const missingKeys = requiredKeys.filter(key => !(key in result));
        if (missingKeys.length > 0) {
          throw new Error(`Missing required keys in response: ${missingKeys.join(', ')}`);
        }

        // Validate predicted_relationship
        const validRelationships = ['SUPPORT', 'OPPOSE', 'UNRELATED', 'NOT_EVIDENCE'];
        if (!validRelationships.includes(result.predicted_relationship)) {
          throw new Error(`Invalid predicted_relationship: ${result.predicted_relationship}. Must be one of: ${validRelationships.join(', ')}`);
        }

        // Validate confidence
        const confidence = parseFloat(result.confidence);
        if (isNaN(confidence) || confidence < 0 || confidence > 1) {
          throw new Error(`Invalid confidence value: ${result.confidence}. Must be a number between 0 and 1`);
        }

        // Validate quality_score
        if (result.quality_score !== null) {
          const qualityScore = parseFloat(result.quality_score);
          if (isNaN(qualityScore) || qualityScore < 0 || qualityScore > 1) {
            throw new Error(`Invalid quality_score value: ${result.quality_score}. Must be a number between 0 and 1 or null`);
          }
          result.quality_score = qualityScore;
        }

        // Check quality_score logic
        if (['SUPPORT', 'OPPOSE'].includes(result.predicted_relationship) && result.quality_score === null) {
          console.warn('Warning: Quality score should be provided for SUPPORT/OPPOSE relationships');
        } else if (['UNRELATED', 'NOT_EVIDENCE'].includes(result.predicted_relationship) && result.quality_score !== null) {
          console.warn('Warning: Quality score should be null for UNRELATED/NOT_EVIDENCE relationships');
          result.quality_score = null;
        }

        return {
          reasoning: result.reasoning,
          predicted_relationship: result.predicted_relationship,
          confidence: confidence,
          quality_score: result.quality_score,
          evidence,
          statement,
          claimed_side: claimedSide
        };

      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Raw response:', resultText);
        return this.createErrorResult(evidence, statement, claimedSide, `Failed to parse AI response as JSON: ${parseError}`);
      }

    } catch (error: any) {
      console.error('OpenAI API error:', error);
      return this.createErrorResult(evidence, statement, claimedSide, `OpenAI API error: ${error.message}`);
    }
  }

  private createErrorResult(evidence: string, statement: string, claimedSide: boolean, reasoning: string): AnalysisResult {
    return {
      predicted_relationship: 'NOT_EVIDENCE',
      confidence: 0,
      quality_score: null,
      reasoning,
      evidence,
      statement,
      claimed_side: claimedSide
    };
  }

  async analyze(evidence: string, statement: string, claimedSide: boolean): Promise<AnalysisResult> {
    return this.analyzeEvidenceRelevance(evidence, statement, claimedSide);
  }

  async batchAnalyze(evidenceList: EvidenceItem[]): Promise<AnalysisResult[]> {
    const promises = evidenceList.map(item => 
      this.analyzeEvidenceRelevance(item.evidence, item.statement, item.claimed_side)
    );
    return Promise.all(promises);
  }
}

// Convenience function for quick analysis
export async function analyzeEvidence(
  evidence: string, 
  statement: string, 
  claimedSide: boolean, 
  apiKey?: string
): Promise<AnalysisResult> {
  const analyzer = new EvidenceAnalyzer(apiKey);
  return analyzer.analyze(evidence, statement, claimedSide);
}

// Example usage
if (require.main === module) {
  async function example() {
    try {
      const analyzer = new EvidenceAnalyzer();
      
      const evidence = "covid vaccines killed so many people, see https://pmc.ncbi.nlm.nih.gov/articles/PMC8875435/";
      const statement = "Covid vaccines are safe and effective";
      const claimedSide = false; // Evidence claims to oppose the statement
      
      const result = await analyzer.analyze(evidence, statement, claimedSide);
      console.log('Analysis Result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  example();
} 