// backend/src/services/EvidenceService.ts

import { AnalysisResult, EvidenceAnalyzer } from "../AI/relevance/relevance";
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
    evidenceText: string; 
    statement: string; 
  }): Promise<Evidence | { error: string }> {
    try {
      const analyzer = new EvidenceAnalyzer();
      
      // Analyze the evidence using AI
      const analysis: AnalysisResult = await analyzer.analyze(
        data.evidenceText,
        data.statement,
        data.supportsClaim
      );
      
      // Check if AI analysis agrees with the claimed relationship
      const aiSupports = analysis.predicted_relationship === 'SUPPORT';
      const aiOpposes = analysis.predicted_relationship === 'OPPOSE';
      const claimedSupports = data.supportsClaim;
      
      // Evidence is valid only if AI analysis agrees with the claim
      const isValidEvidence = 
        (claimedSupports && aiSupports) || 
        (!claimedSupports && aiOpposes);
      
      if (!isValidEvidence) {
        return {
          error: `Evidence validation failed. AI analysis found the evidence ${analysis.predicted_relationship.toLowerCase()} the statement, but you claimed it ${claimedSupports ? 'supports' : 'opposes'} it. Confidence: ${analysis.confidence}, Reasoning: ${analysis.reasoning}`
        };
      }
      
      // If validation passes, create the evidence with AI quality score
      const newEv: Evidence = {
        id: generateId(),
        supportsClaim: data.supportsClaim,
        title: data.title,
        description: data.description,
        wellStructuredPercentage: analysis.quality_score || data.wellStructuredPercentage,
      };
      
      db_evidence.push(newEv);
      return newEv;
      
    } catch (error) {
      console.error('Error during evidence validation:', error);
      return {
        error: `Failed to validate evidence: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
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
