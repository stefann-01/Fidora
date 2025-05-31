import { Claim } from '../../frontend/app/types/types';
import { claims } from '../db/db';

// Get claim by claimId
export function getClaim(claimId: string): Claim | undefined {
  return claims.find(claim => claim.claimId === claimId);
}

// Get all claims
export function getAllClaims(): Claim[] {
  return [...claims]; // Return a copy to prevent direct mutation
}

// Get claims by author
export function getClaimsByAuthor(author: string): Claim[] {
  return claims.filter(claim => claim.author === author);
}

// Add a new claim
export function addClaim(claim: Claim): boolean {
  // Check if claim already exists
  if (claims.some(existingClaim => existingClaim.claimId === claim.claimId)) {
    return false; // Claim already exists
  }
  claims.push(claim);
  return true;
}

// Edit an existing claim
export function editClaim(claimId: string, updatedClaim: Partial<Claim>): boolean {
  const claimIndex = claims.findIndex(claim => claim.claimId === claimId);
  if (claimIndex === -1) {
    return false; // Claim not found
  }
  
  // Merge the existing claim with updated fields
  claims[claimIndex] = { ...claims[claimIndex], ...updatedClaim };
  return true;
}

// Remove a claim
export function removeClaim(claimId: string): boolean {
  const claimIndex = claims.findIndex(claim => claim.claimId === claimId);
  if (claimIndex === -1) {
    return false; // Claim not found
  }
  
  claims.splice(claimIndex, 1);
  return true;
} 