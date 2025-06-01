import { Router, Request, Response, NextFunction } from "express";
import { ClaimRecommender } from "../AI/recommender/recommender";
import { ClaimService } from "../services/claim";
import { processUserInteraction } from "../blockscout/bsc";

const router = Router();
const recommender = new ClaimRecommender();

// Initialize the recommender and wait for it to be ready
let isInitialized = false;
let initializationError: Error | null = null;

// Function to initialize the recommender
async function initializeRecommender() {
  try {
    await recommender.initialize();
    isInitialized = true;
    console.log("Recommender initialized successfully");
  } catch (error) {
    console.error("Failed to initialize recommender:", error);
    initializationError = error instanceof Error ? error : new Error(String(error));
  }
}

// Start initialization
initializeRecommender();

/**
 * GET /api/recommendations/:userId
 * Get personalized recommendations for a user based on their wallet address
 * Uses BSC data to create user representation
 */
router.get(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Received recommendation request for user:', req.params.userId);
      
      // Check if recommender is initialized
      if (!isInitialized) {
        if (initializationError) {
          console.error('Recommender initialization failed:', initializationError);
          res.status(500).json({ 
            error: "Recommender system failed to initialize",
            details: initializationError.message
          });
        } else {
          console.log('Recommender not ready yet');
          res.status(503).json({ error: "Recommender system is not ready yet" });
        }
        return;
      }

      const { userId } = req.params; // This is the wallet address
      console.log('Getting recommendations for user:', userId);
      
      // Get all claims for context
      const allClaims = ClaimService.getAll();
      console.log('Retrieved', allClaims.length, 'claims for context');

      // Get user's blockchain interactions
      console.log('Fetching user interactions from BSC...');
      const userInteractions = await processUserInteraction(userId);
      console.log('User interactions:', userInteractions);
      
      // Convert BSC interactions to recommender format
      const userClaims = Object.entries(userInteractions).map(([claimId, data]) => ({
        claimId,
        type: data.method as 'createClaim' | 'bet',
        weight: data.method === 'createClaim' ? 1 : 0.5, // Give more weight to claims than bets
        timestamp: Date.now(),
        block: data.block || 0
      }));
      console.log('Converted user claims:', userClaims);

      let recommendations;
      if (userClaims.length > 0) {
        console.log('Getting personalized recommendations...');
        // If user has blockchain interactions, get personalized recommendations
        recommendations = await recommender.getRecommendationsForUser(
          userId,
          userClaims,
          allClaims.map(claim => ({
            id: claim.claimId,
            content: claim.content,
            block: 0,
            method: 'createClaim',
            claimId: claim.claimId,
            timestamp: Date.now(),
            popularity_score: 0
          })),
          {
            topK: 10,
            diversityFactor: 0.3
          }
        );
        console.log('Received personalized recommendations:', recommendations.length);
      } else {
        console.log('No user interactions found, returning trending recommendations');
        // If user has no blockchain interactions, return trending recommendations
        // Sort claims by evidence count (more evidence = more interesting)
        const trendingClaims = allClaims
          .sort((a, b) => b.evidence.length - a.evidence.length)
          .slice(0, 10);

        recommendations = trendingClaims.map(claim => ({
          claimId: claim.claimId,
          score: claim.evidence.length,
          block: 0,
          method: 'createClaim',
          content: claim.content,
          metadata: { evidenceCount: claim.evidence.length }
        }));
        console.log('Generated trending recommendations:', recommendations.length);
      }

      // Convert recommendations back to original claims
      const recommendedClaims = recommendations
        .map(rec => ClaimService.getOne(rec.claimId))
        .filter((claim): claim is NonNullable<typeof claim> => claim !== undefined);
      
      console.log('Sending', recommendedClaims.length, 'recommendations to user');
      res.json(recommendedClaims);
    } catch (err) {
      console.error('Error in recommendation route:', err);
      if (err instanceof Error) {
        console.error('Error details:', err.message);
        console.error('Error stack:', err.stack);
      }
      res.status(500).json({ 
        error: "Internal Server Error",
        message: err instanceof Error ? err.message : String(err)
      });
    }
  }
);

export default router; 