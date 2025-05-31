'use server'

import { ClaimCategorizer, CategorizationResult } from '../../AI/categorizer'

interface CategorizeClaimParams {
  content: string
}

export async function categorizeClaim(params: CategorizeClaimParams): Promise<CategorizationResult> {
  const categorizer = new ClaimCategorizer()
  
  try {
    const result = await categorizer.categorize(params.content)
    
    return result
  } catch (error) {
    console.error('Claim categorization failed:', error)
    throw new Error('Failed to categorize claim')
  }
} 