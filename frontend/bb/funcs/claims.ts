import { Claim } from '../../app/types/db.types';
import { createPost } from '../../back/api';
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
export async function addClaim(url: string): Promise<boolean> {
  try {
    // Extract tweet ID from URL to use as claimId
    const tweetId = url.split('/').pop();
    if (!tweetId) {
      throw new Error('Invalid tweet URL');
    }

    // Check if claim already exists
    if (claims.some(existingClaim => existingClaim.claimId === tweetId)) {
      return false; // Claim already exists
    }

    // Fetch tweet data using the existing API function
    const tweetData = await createPost(url);
    
    // Create the claim object
    const claim: Claim = {
      url: url,
      claimId: tweetId,
      author: tweetData.screen_name,
      content: tweetData.full_text,
      profilePic: "",
      category: "category",
      evidence: [] // Initialize with empty evidence array
    };

    claims.push(claim);
    return true;
  } catch (error) {
    console.error('Error adding claim:', error);
    return false;
  }
}

// updateClaim(claimId,  { category : "new category"} ) 
// Edit an existing claim
export function updateClaim(claimId: string, updatedClaim: Partial<Claim>): boolean {
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
