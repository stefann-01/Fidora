import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Types for our system
interface Claim {
  id: string;
  content: string;
  block: number;
  method: string;
  claimId: string;
  timestamp: number;
  popularity_score?: number;
  category: string;
}

interface UserInteraction {
  claimId: string;
  type: 'createClaim' | 'bet';
  weight: number;
  timestamp: number;
  block: number;
}

interface UserProfile {
  userId: string;
  profileVector: number[];
  lastUpdated: number;
  interactionCount: number;
}

interface RecommendationOptions {
  topK?: number;
  minBlock?: number;
  maxBlock?: number;
  diversityFactor?: number;
  excludeClaimIds?: string[];
  timeDecayFactor?: number;
}

interface RecommendationResult {
  claimId: string;
  score: number;
  block: number;
  method: string;
  content: string;
  metadata: any;
}

class ClaimRecommender {
  private openai: OpenAI;
  private pinecone: Pinecone;
  private index: any;
  private userProfiles: Map<string, UserProfile> = new Map();
  
  constructor() {
    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
    
    // Check Pinecone environment variables
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY environment variable is not set');
    }
    if (!process.env.PINECONE_INDEX_NAME) {
      // Set default index name if not provided
      process.env.PINECONE_INDEX_NAME = "fidora-recommendations";
    }

    // Initialize Pinecone client with configuration
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
  }
  
  async initialize() {
    try {
      const indexName = process.env.PINECONE_INDEX_NAME;
      if (!indexName) {
        throw new Error('PINECONE_INDEX_NAME environment variable is not set');
      }

      // Get the index
      this.index = this.pinecone.index(indexName);
      
      // Test the connection with a simple query
      console.log('Testing Pinecone connection...');
      const stats = await this.index.describeIndexStats();
      console.log('Pinecone connection successful. Index stats:', stats);
      
      console.log("Claim recommendation system initialized successfully!");
    } catch (error) {
      console.error("Failed to initialize Pinecone:", error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }

  async embedClaim(claim: Claim): Promise<number[]> {
    try {
      // Enrich text with category and temporal context
      const temporalContext = `BLOCK_${claim.block}`;
      const enrichedText = `${claim.content} || CATEGORY:${claim.category} || ${temporalContext} || METHOD:${claim.method} || CLAIMID:${claim.claimId}`;
      
      console.log('Creating embedding for text:', enrichedText.substring(0, 100) + '...');
      
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: enrichedText,
        dimensions: 1536 // Explicitly set dimensions to match the index
      });
      
      const embedding = response.data[0].embedding;
      console.log('Generated embedding with dimensions:', embedding.length, 'First few values:', embedding.slice(0, 5));
      
      if (embedding.length !== 1536) {
        throw new Error(`Expected embedding dimension 1536, got ${embedding.length}`);
      }
      
      return embedding;
    } catch (error) {
      console.error("Error creating embedding:", error);
      throw error;
    }
  }

  async storeClaim(claim: Claim) {
    try {
      console.log('Storing claim:', claim.claimId);
      
      const vector = await this.embedClaim(claim);
      console.log('Generated vector with dimensions:', vector.length);
      
      if (vector.length !== 1536) {
        throw new Error(`Invalid vector dimensions: expected 1536, got ${vector.length}`);
      }
      
      const upsertRequest = {
        id: `claim_${claim.claimId}`,
        values: vector,
        metadata: {
          claimId: claim.claimId,
          content: claim.content.substring(0, 200),
          block: claim.block,
          method: claim.method,
          timestamp: claim.timestamp,
          popularity_score: claim.popularity_score || 0,
          type: 'claim'
        }
      };
      
      console.log('Upserting to Pinecone:', {
        id: upsertRequest.id,
        vectorDimensions: upsertRequest.values.length,
        metadata: upsertRequest.metadata
      });
      
      await this.index.upsert([upsertRequest]);
      
      console.log(`Stored claim ${claim.claimId} in vector database`);
    } catch (error) {
      console.error("Error storing claim:", error);
      throw error;
    }
  }

  async buildUserProfile(userId: string, interactions: UserInteraction[], claims: Claim[]): Promise<UserProfile> {
    try {
      console.log(`Building user profile for ${userId} with ${interactions.length} interactions`);
      const claimMap = new Map(claims.map(c => [c.claimId, c]));
      
      const interactionWeights = {
        'createClaim': 2.0,    // Creating claims shows strong engagement
        'bet': 1.0            // Bets show moderate engagement
      };
      
      let weightedVectorSum: number[] = [];
      let totalWeight = 0;
      
      for (const interaction of interactions) {
        const claim = claimMap.get(interaction.claimId);
        if (!claim) {
          console.warn(`Claim ${interaction.claimId} not found for user ${userId}`);
          continue;
        }
        
        console.log(`Processing interaction for claim ${interaction.claimId}`);
        const claimVector = await this.embedClaim(claim);
        console.log(`Claim vector dimensions: ${claimVector.length}`);
        
        // Validate claim vector
        if (!claimVector.every(val => typeof val === 'number' && !isNaN(val))) {
          throw new Error(`Invalid claim vector: contains non-numeric values`);
        }
        
        const weight = interactionWeights[interaction.type] * interaction.weight;
        console.log(`Interaction weight: ${weight}`);
        
        if (weightedVectorSum.length === 0) {
          weightedVectorSum = claimVector.map(val => val * weight);
          console.log(`Initialized weighted vector sum with dimensions: ${weightedVectorSum.length}`);
        } else {
          weightedVectorSum = weightedVectorSum.map((val, idx) => val + (claimVector[idx] * weight));
        }
        
        totalWeight += weight;
      }
      
      if (weightedVectorSum.length === 0 || totalWeight === 0) {
        console.warn(`No valid interactions or totalWeight=0 for user ${userId}, using fallback random vector`);
        // Use a small random vector to satisfy Pinecone's requirement
        weightedVectorSum = Array.from({ length: 1536 }, () => Math.random() * 0.01);
        totalWeight = 1; // Prevent division by zero
      }
      
      const profileVector = weightedVectorSum.map(val => val / totalWeight);
      
      // Validate profile vector
      if (!profileVector.every(val => typeof val === 'number' && !isNaN(val))) {
        throw new Error(`Invalid profile vector: contains non-numeric values`);
      }
      
      console.log(`Final profile vector dimensions: ${profileVector.length}, First few values:`, profileVector.slice(0, 5));
      
      const userProfile: UserProfile = {
        userId,
        profileVector,
        lastUpdated: Date.now(),
        interactionCount: interactions.length
      };
      
      console.log(`Storing user profile in Pinecone for user ${userId}`);
      const upsertRequest = {
        id: `user_${userId}`,
        values: profileVector,
        metadata: {
          userId,
          lastUpdated: userProfile.lastUpdated,
          interactionCount: userProfile.interactionCount,
          type: 'user_profile'
        }
      };
      
      // Validate upsert request
      if (!Array.isArray(upsertRequest.values) || !upsertRequest.values.every(val => typeof val === 'number' && !isNaN(val))) {
        throw new Error(`Invalid upsert request: values must be an array of numbers`);
      }
      
      await this.index.upsert([upsertRequest]);
      
      this.userProfiles.set(userId, userProfile);
      console.log(`Successfully built and stored profile for user ${userId}`);
      
      return userProfile;
      
    } catch (error) {
      console.error("Error building user profile:", error);
      throw error;
    }
  }

  async getRecommendations(
    userId: string, 
    options: RecommendationOptions = {}
  ): Promise<RecommendationResult[]> {
    try {
      const { 
        topK = 3,
        minBlock,
        maxBlock,
        diversityFactor = 0.3,
        excludeClaimIds = [],
        timeDecayFactor = 0.5
      } = options;
      
      let userProfile = this.userProfiles.get(userId);
      
      if (!userProfile) {
        try {
          const userProfileResponse = await this.index.fetch([`user_${userId}`]);
          const pineconeProfile = userProfileResponse.vectors?.[`user_${userId}`];
          
          if (pineconeProfile) {
            userProfile = {
              userId,
              profileVector: pineconeProfile.values,
              lastUpdated: pineconeProfile.metadata?.lastUpdated || Date.now(),
              interactionCount: pineconeProfile.metadata?.interactionCount || 0
            };
            this.userProfiles.set(userId, userProfile);
          }
        } catch (fetchError) {
          console.warn(`Could not fetch user profile from Pinecone: ${fetchError}`);
        }
      }
      
      if (!userProfile) {
        throw new Error(`User profile not found for user ${userId}`);
      }

      // Get the latest block number for time decay calculation
      const latestBlock = maxBlock || await this.getLatestBlock();
      
      const queryResponse = await this.index.query({
        vector: userProfile.profileVector,
        topK: topK * 3,
        includeMetadata: true,
        filter: {
          type: { $eq: 'claim' },
          ...(minBlock && { block: { $gte: minBlock } }),
          ...(maxBlock && { block: { $lte: maxBlock } }),
          ...(excludeClaimIds && { claimId: { $nin: excludeClaimIds } })
        }
      });
      
      if (!queryResponse.matches) {
        return [];
      }
      
      let recommendations = queryResponse.matches
        .filter((match: any) => match.metadata?.type === 'claim')
        .filter((match: any) => !excludeClaimIds.includes(match.metadata?.claimId))
        .map((match: any) => {
          const baseScore = match.score || 0;
          const block = match.metadata?.block || 0;
          
          // Calculate block-based time decay
          // More recent blocks (higher numbers) get higher scores
          const blockDifference = latestBlock - block;
          const blockDecayScore = baseScore * Math.exp(-timeDecayFactor * (blockDifference / 1000)); // Normalize by 1000 blocks
          
          return {
            claimId: match.metadata!.claimId,
            score: blockDecayScore,
            block: block,
            method: match.metadata!.method,
            content: match.metadata!.content,
            metadata: match.metadata
          };
        })
        .sort((a: RecommendationResult, b: RecommendationResult) => {
          // First sort by score
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          // Then by block number (more recent first)
          return b.block - a.block;
        });
      
      if (diversityFactor > 0) {
        recommendations = this.diversifyRecommendations(recommendations, topK, diversityFactor);
      } else {
        recommendations = recommendations.slice(0, topK);
      }
      
      return recommendations;
      
    } catch (error) {
      console.error("Error getting recommendations:", error);
      throw error;
    }
  }
  
  private diversifyRecommendations(
    recommendations: RecommendationResult[], 
    topK: number, 
    diversityFactor: number
  ): RecommendationResult[] {
    const methodGroups = new Map<string, RecommendationResult[]>();
    
    recommendations.forEach(rec => {
      if (!methodGroups.has(rec.method)) {
        methodGroups.set(rec.method, []);
      }
      methodGroups.get(rec.method)!.push(rec);
    });
    
    methodGroups.forEach(group => {
      group.sort((a, b) => b.score - a.score);
    });
    
    const diversified: RecommendationResult[] = [];
    const methods = Array.from(methodGroups.keys());
    let methodIndex = 0;
    
    while (diversified.length < topK && diversified.length < recommendations.length) {
      let added = false;
      
      for (let i = 0; i < methods.length && diversified.length < topK; i++) {
        const method = methods[(methodIndex + i) % methods.length];
        const group = methodGroups.get(method)!;
        
        const availableItem = group.find(item => 
          !diversified.some(d => d.claimId === item.claimId)
        );
        
        if (availableItem) {
          diversified.push(availableItem);
          added = true;
        }
      }
      
      methodIndex++;
      
      if (!added) break;
    }
    
    return diversified;
  }

  // Helper method to get the latest block number
  private async getLatestBlock(): Promise<number> {
    try {
      const queryResponse = await this.index.query({
        vector: [0], // Dummy vector, we only care about the filter
        topK: 1,
        includeMetadata: true,
        filter: {
          type: { $eq: 'claim' }
        },
        sort: { block: -1 } // Sort by block number descending
      });

      return queryResponse.matches?.[0]?.metadata?.block || 0;
    } catch (error) {
      console.error("Error getting latest block:", error);
      return 0;
    }
  }

  async batchStoreClaims(claims: Claim[], batchSize: number = 100) {
    console.log(`Storing ${claims.length} claims in batches of ${batchSize}...`);
    
    for (let i = 0; i < claims.length; i += batchSize) {
      const batch = claims.slice(i, i + batchSize);
      const promises = batch.map(claim => this.storeClaim(claim));
      
      try {
        await Promise.all(promises);
        console.log(`Stored batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(claims.length/batchSize)}`);
      } catch (error) {
        console.error(`Error storing batch starting at index ${i}:`, error);
      }
    }
  }

  // Helper method to ensure tweets are stored in Pinecone
  private async ensureTweetsStored(tweets: Claim[]): Promise<void> {
    try {
      console.log('Checking if tweets need to be stored in Pinecone...');
      
      // Get all tweet IDs from Pinecone
      const stats = await this.index.describeIndexStats();
      const storedIds = new Set(stats.namespaces?.default?.vectors || []);
      
      // Filter out tweets that are already stored
      const tweetsToStore = tweets.filter(tweet => !storedIds.has(`claim_${tweet.claimId}`));
      
      if (tweetsToStore.length > 0) {
        console.log(`Found ${tweetsToStore.length} tweets that need to be stored in Pinecone`);
        await this.batchStoreClaims(tweetsToStore);
        console.log('Successfully stored new tweets in Pinecone');
      } else {
        console.log('All tweets are already stored in Pinecone');
      }
    } catch (error) {
      console.error('Error ensuring tweets are stored:', error);
      throw error;
    }
  }

  async getRecommendationsForUser(
    userId: string,
    interactions: UserInteraction[],
    claims: Claim[],
    options: RecommendationOptions = {}
  ): Promise<RecommendationResult[]> {
    try {
      // First ensure all tweets are stored in Pinecone
      await this.ensureTweetsStored(claims);
      
      // Then proceed with building user profile and getting recommendations
      await this.buildUserProfile(userId, interactions, claims);
      
      const excludeClaimIds = interactions.map(interaction => interaction.claimId);
      
      return await this.getRecommendations(userId, {
        ...options,
        excludeClaimIds
      });
      
    } catch (error) {
      console.error("Error getting recommendations for user:", error);
      throw error;
    }
  }

  // Utility: (Re-)embed all claims in the database
  async embedAllClaims(getAllClaims: () => Claim[], batchSize: number = 10) {
    const allClaims = getAllClaims();
    console.log(`Embedding and storing ${allClaims.length} claims in batches of ${batchSize}...`);
    for (let i = 0; i < allClaims.length; i += batchSize) {
      const batch = allClaims.slice(i, i + batchSize);
      const promises = batch.map(claim => this.storeClaim(claim));
      try {
        await Promise.all(promises);
        console.log(`Stored batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allClaims.length / batchSize)}`);
      } catch (error) {
        console.error(`Error storing batch starting at index ${i}:`, error);
      }
    }
    console.log('All claims embedded and stored.');
  }
}

export { ClaimRecommender, Claim, UserInteraction, UserProfile, RecommendationResult }; 