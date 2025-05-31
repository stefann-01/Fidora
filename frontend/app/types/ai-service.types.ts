/**
 * AI Service Types
 * 
 * These types define the interfaces for the Evidence Analyzer AI service
 * to maintain consistency between frontend and backend.
 */

/**
 * The possible relationships between evidence and a statement
 */
export type RelationshipType = 'SUPPORT' | 'OPPOSE' | 'UNRELATED' | 'NOT_EVIDENCE';

/**
 * Input data for analyzing a single piece of evidence
 */
export interface EvidenceAnalysisRequest {
  /** The evidence text (may contain links that the AI can analyze) */
  evidence: string;
  /** The statement to evaluate against */
  statement: string;
  /** True if evidence claims to support the statement, false if it claims to oppose */
  claimed_side: boolean;
}

/**
 * Result of evidence analysis from the AI service
 */
export interface AnalysisResult {
  /** Brief explanation of the AI's analysis */
  reasoning: string;
  /** The actual relationship the AI determined between evidence and statement */
  predicted_relationship: RelationshipType;
  /** Confidence level in the assessment (0-1) */
  confidence: number;
  /** Quality score for SUPPORT/OPPOSE evidence (0-1), null for UNRELATED/NOT_EVIDENCE */
  quality_score: number | null;
  /** The original evidence text that was analyzed */
  evidence: string;
  /** The original statement that was evaluated */
  statement: string;
  /** The original claimed side that was provided */
  claimed_side: boolean;
}

/**
 * Input for batch analysis of multiple evidence items
 */
export interface BatchAnalysisRequest {
  /** Array of evidence items to analyze */
  evidence_list: EvidenceAnalysisRequest[];
}

/**
 * Result of batch analysis
 */
export interface BatchAnalysisResult {
  /** Array of analysis results corresponding to the input evidence list */
  results: AnalysisResult[];
}

/**
 * Error response from the AI service
 */
export interface AIServiceError {
  /** Error message describing what went wrong */
  error: string;
  /** Optional error code for programmatic handling */
  code?: string;
  /** Optional additional details about the error */
  details?: unknown;
}

/**
 * API Response types for the Express server endpoints
 */
export type AnalyzeResponse = AnalysisResult | AIServiceError;
export type BatchAnalyzeResponse = BatchAnalysisResult | AIServiceError;

/**
 * Quality score ranges for evidence assessment
 */
export const QualityScoreRanges = {
  /** High quality: Expert sources, peer-reviewed studies, official statistics */
  HIGH: { min: 0.8, max: 1.0, label: 'High Quality' },
  /** Good quality: Reputable news sources, well-documented reports */
  GOOD: { min: 0.6, max: 0.8, label: 'Good Quality' },
  /** Moderate quality: General sources, reasonable arguments with limited depth */
  MODERATE: { min: 0.4, max: 0.6, label: 'Moderate Quality' },
  /** Low quality: Weak sources, limited supporting information */
  LOW: { min: 0.2, max: 0.4, label: 'Low Quality' },
  /** Very low quality: Unreliable sources, no supporting data */
  VERY_LOW: { min: 0.0, max: 0.2, label: 'Very Low Quality' },
} as const;

/**
 * Confidence level ranges for interpretation
 */
export const ConfidenceRanges = {
  /** Very high confidence in the assessment */
  VERY_HIGH: { min: 0.9, max: 1.0, label: 'Very High Confidence' },
  /** High confidence in the assessment */
  HIGH: { min: 0.7, max: 0.9, label: 'High Confidence' },
  /** Medium confidence in the assessment */
  MEDIUM: { min: 0.3, max: 0.7, label: 'Medium Confidence' },
  /** Low confidence in the assessment */
  LOW: { min: 0.0, max: 0.3, label: 'Low Confidence' },
} as const;

/**
 * Helper function to get quality score label
 */
export function getQualityScoreLabel(score: number | null): string {
  if (score === null) return 'N/A';
  
  for (const [, range] of Object.entries(QualityScoreRanges)) {
    if (score >= range.min && score <= range.max) {
      return range.label;
    }
  }
  return 'Unknown';
}

/**
 * Helper function to get confidence level label
 */
export function getConfidenceLabel(confidence: number): string {
  for (const [, range] of Object.entries(ConfidenceRanges)) {
    if (confidence >= range.min && confidence <= range.max) {
      return range.label;
    }
  }
  return 'Unknown';
}

/**
 * Helper function to get relationship color for UI display
 */
export function getRelationshipColor(relationship: RelationshipType): string {
  switch (relationship) {
    case 'SUPPORT':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'OPPOSE':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'UNRELATED':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'NOT_EVIDENCE':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * Helper function to format confidence as percentage
 */
export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`;
}

/**
 * Helper function to format quality score as percentage
 */
export function formatQualityScore(score: number | null): string {
  if (score === null) return 'N/A';
  return `${(score * 100).toFixed(1)}%`;
}

/**
 * Type guard to check if a response is an error
 */
export function isAIServiceError(response: unknown): response is AIServiceError {
  return typeof response === 'object' && response !== null && 'error' in response && typeof (response as { error: string }).error === 'string';
}

/**
 * Type guard to check if a response is a valid analysis result
 */
export function isAnalysisResult(response: unknown): response is AnalysisResult {
  if (typeof response !== 'object' || response === null) return false;
  
  const r = response as AnalysisResult;
  return (
    typeof r.reasoning === 'string' &&
    ['SUPPORT', 'OPPOSE', 'UNRELATED', 'NOT_EVIDENCE'].includes(r.predicted_relationship) &&
    typeof r.confidence === 'number' &&
    r.confidence >= 0 &&
    r.confidence <= 1 &&
    (r.quality_score === null || 
     (typeof r.quality_score === 'number' && 
      r.quality_score >= 0 && 
      r.quality_score <= 1)) &&
    typeof r.evidence === 'string' &&
    typeof r.statement === 'string' &&
    typeof r.claimed_side === 'boolean'
  );
}

/**
 * Type guard to check if a response is a valid batch analysis result
 */
export function isBatchAnalysisResult(response: unknown): response is BatchAnalysisResult {
  if (typeof response !== 'object' || response === null) return false;
  
  const r = response as BatchAnalysisResult;
  return (
    Array.isArray(r.results) &&
    r.results.every((result: unknown) => isAnalysisResult(result))
  );
}
