'use server'

import { EvidenceAnalyzer } from '../../AI/relevance/relevance'
import { AnalysisResult } from '../../app/types/ai-service.types'

interface AnalyzeEvidenceParams {
  evidence: string
  statement: string
  claimed_side: boolean
}

export async function analyzeEvidence(params: AnalyzeEvidenceParams): Promise<AnalysisResult> {
  const analyzer = new EvidenceAnalyzer()
  
  try {
    const result = await analyzer.analyze(
      params.evidence,
      params.statement,
      params.claimed_side
    )
    
    return result
  } catch (error) {
    console.error('Evidence analysis failed:', error)
    throw new Error('Failed to analyze evidence')
  }
} 
