// backend/src/services/EvidenceService.ts

import { EvidenceAnalyzer } from "../AI/relevance/relevance";
import { db_evidence } from "../db/db";
import { Evidence } from "../models/db.types";

/**
 * We assume your `db.types.ts` defines `Evidence` like this:
 *
 *   export interface Evidence {
 *     id: string;
 *     supportsClaim: boolean;
 *     title: string;
 *     description: string;
 *     wellStructuredPercentage: number;
 *   }
 *
 * So in `create`, we accept everything except `id`.
 */

/** Simple ID‐generator (not a true UUID) */
function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 8)
  );
}

export const EvidenceService = {
  /**
   * create(data: Omit<Evidence, "id">): Promise<Evidence | { error: string }>
   * - Validates evidence using AI relevance checker before creation
   * - Only creates evidence if AI analysis agrees with the claimed relationship
   */
  async create(data: Omit<Evidence, "id"> & { 
    statement: string; 
  }): Promise<Evidence | null> {
    
    try {
      const analyzer = new EvidenceAnalyzer();
      // Analyze the evidence using AI
      const analysisResult = await analyzer.analyze(
        data.description, // evidence text
        data.statement,   // statement to evaluate
        data.supportsClaim // claimed relationship  
      );

      console.log("statement", data.statement)
      
      // Check for non-evidence cases first
      if (analysisResult.predicted_relationship === 'NOT_EVIDENCE') {
        const errorMsg = `Evidence validation failed: The provided text is not considered valid evidence. Reasoning: ${analysisResult.reasoning}`;
        console.log('Validation failed - not evidence:', errorMsg);
        return null;
      }
      
      if (analysisResult.predicted_relationship === 'UNRELATED') {
        const errorMsg = `Evidence validation failed: The evidence is unrelated to the statement. Reasoning: ${analysisResult.reasoning}`;
        console.log('Validation failed - unrelated:', errorMsg);
        return null;
      }
      
      // Check if AI analysis agrees with the claimed relationship
      const aiSupportsStatement = analysisResult.predicted_relationship === 'SUPPORT';
      const aiOpposesStatement = analysisResult.predicted_relationship === 'OPPOSE';
      
      // Validate that AI analysis matches the claimed relationship
      if (data.supportsClaim && !aiSupportsStatement) {
        const errorMsg = `Evidence validation failed: Evidence claims to support the statement, but AI analysis indicates it ${analysisResult.predicted_relationship.toLowerCase()}s it. Confidence: ${analysisResult.confidence}, Reasoning: ${analysisResult.reasoning}`;
        console.log('Validation failed - support mismatch:', errorMsg);
        return null;
      }
      
      if (!data.supportsClaim && !aiOpposesStatement) {
        const errorMsg = `Evidence validation failed: Evidence claims to oppose the statement, but AI analysis indicates it ${analysisResult.predicted_relationship.toLowerCase()}s it. Confidence: ${analysisResult.confidence}, Reasoning: ${analysisResult.reasoning}`;
        console.log('Validation failed - oppose mismatch:', errorMsg);
        return null;
      }
      
      // Ensure we have a valid relationship before proceeding
      if (!aiSupportsStatement && !aiOpposesStatement) {
        const errorMsg = `Evidence validation failed: AI analysis returned unexpected relationship: ${analysisResult.predicted_relationship}`;
        console.log('Validation failed - unexpected relationship:', errorMsg);
        return null;
      }
      
      // ALL VALIDATIONS PASSED - Now create the evidence
      console.log('✅ All validations passed! Creating evidence...');
      
      const newEv: Evidence = {
        id: generateId(),
        supportsClaim: data.supportsClaim,
        title: data.title,
        description: data.description,
        wellStructuredPercentage: analysisResult.quality_score || 0, // Use AI quality score
      };
      
      console.log('Created evidence object:', JSON.stringify(newEv, null, 2));
      
      db_evidence.push(newEv);
      console.log('✅ Evidence saved to database. Total evidence count:', db_evidence.length);
      
      return newEv;
      
    } catch (error) {
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return null;
    }
  },

  /**
   * getOne(id: string): Evidence | undefined
   * - Returns the Evidence with the given `id`, or undefined if none found.
   */
  getOne(id: string): Evidence | undefined {
    return db_evidence.find((e) => e.id === id);
  },

  /**
   * getAll(): Evidence[]
   * - Returns a shallow copy of all stored Evidence items.
   */
  getAll(): Evidence[] {
    return [...db_evidence];
  },
};
