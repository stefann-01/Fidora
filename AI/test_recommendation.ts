import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Types for our system
interface Tweet {
  id: string;
  text: string;
  category: string;
  author: string;
  timestamp: number;
  popularity_score?: number; // number of likes, retweets, etc.
}

interface UserInteraction {
  tweetId: string;
  type: 'bet' | 'provide_evidence' | 'popularity';
  weight: number; // how much this interaction should influence the user profile
  timestamp: number;
}

interface UserProfile {
  userId: string;
  profileVector: number[];
  lastUpdated: number;
  interactionCount: number;
}

interface RecommendationOptions {
  topK?: number;
  includeCategories?: string[];
  excludeCategories?: string[];
  minPopularity?: number;
  diversityFactor?: number;
  excludeTweetIds?: string[];
  batchId?: string;
  timeDecayFactor?: number; // NEW: Controls how quickly relevance decays with time (0-1)
}

interface RecommendationResult {
  tweetId: string;
  score: number;
  category: string;
  popularity_score: number;
  metadata: any;
}

class RecommendationSystem {
  private openai: OpenAI;
  private pinecone: Pinecone;
  private index: any;
  private userProfiles: Map<string, UserProfile> = new Map(); // Cache user profiles
  
  constructor() {
    // Initialize OpenAI
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
    
    // Initialize Pinecone
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });
  }
  
  async initialize() {
    // Get the index
    this.index = this.pinecone.index(process.env.PINECONE_INDEX_NAME || "fidora-recommendations");
    console.log("Recommendation system initialized successfully!");
  }

  // 1) Embed a tweet with category information
  async embedTweet(tweet: Tweet): Promise<number[]> {
    try {
      const enrichedText = `${tweet.text} || CATEGORY:${tweet.category} || AUTHOR:${tweet.author}`;
      
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small", // Updated model
        input: enrichedText,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error("Error creating embedding:", error);
      throw error;
    }
  }

  // 2) Store tweet embedding in Pinecone
  async storeTweet(tweet: Tweet, batchId?: string) {
    try {
      const vector = await this.embedTweet(tweet);
      
      await this.index.upsert([
        {
          id: `tweet_${tweet.id}`,
          values: vector,
          metadata: {
            tweetId: tweet.id,
            category: tweet.category,
            author: tweet.author,
            text: tweet.text.substring(0, 200), // Store first 200 chars for reference
            timestamp: tweet.timestamp,
            popularity_score: tweet.popularity_score || 0,
            batchId: batchId || 'default', // Add batch ID for filtering
            type: 'tweet'
          }
        }
      ]);
      
      console.log(`Stored tweet ${tweet.id} in vector database`);
    } catch (error) {
      console.error("Error storing tweet:", error);
      throw error;
    }
  }

  // 3) Build user profile from interactions
  async buildUserProfile(userId: string, interactions: UserInteraction[], tweets: Tweet[]): Promise<UserProfile> {
    try {
      // Create a map for quick tweet lookup
      const tweetMap = new Map(tweets.map(t => [t.id, t]));
      
      // Weight mapping for different interaction types
      const interactionWeights = {
        'bet': 1.0,
        'provide_evidence': 2.5,    // Providing evidence shows strongest engagement
        'popularity': 0.1           // Popularity views are weaker signals
      };
      
      let weightedVectorSum: number[] = [];
      let totalWeight = 0;
      
      for (const interaction of interactions) {
        const tweet = tweetMap.get(interaction.tweetId);
        if (!tweet) {
          console.warn(`Tweet ${interaction.tweetId} not found for user ${userId}`);
          continue;
        }
        
        // Get tweet embedding
        const tweetVector = await this.embedTweet(tweet);
        
        // Calculate interaction weight
        const weight = interactionWeights[interaction.type] * interaction.weight;
        
        // Add to weighted sum
        if (weightedVectorSum.length === 0) {
          weightedVectorSum = tweetVector.map(val => val * weight);
        } else {
          weightedVectorSum = weightedVectorSum.map((val, idx) => val + (tweetVector[idx] * weight));
        }
        
        totalWeight += weight;
      }
      
      // Normalize the vector (create average)
      const profileVector = weightedVectorSum.map(val => val / totalWeight);
      
      const userProfile: UserProfile = {
        userId,
        profileVector,
        lastUpdated: Date.now(),
        interactionCount: interactions.length
      };
      
      // Store user profile in Pinecone for quick retrieval
      await this.index.upsert([
        {
          id: `user_${userId}`,
          values: profileVector,
          metadata: {
            userId,
            lastUpdated: userProfile.lastUpdated,
            interactionCount: userProfile.interactionCount,
            type: 'user_profile'
          }
        }
      ]);
      
      console.log(`Built and stored profile for user ${userId} from ${interactions.length} interactions`);
      
      // Cache the profile for immediate access
      this.userProfiles.set(userId, userProfile);
      
      return userProfile;
      
    } catch (error) {
      console.error("Error building user profile:", error);
      throw error;
    }
  }

  // 4) Get recommendations for a user (excluding tweets they've already interacted with)
  async getRecommendations(
    userId: string, 
    options: RecommendationOptions = {}
  ): Promise<{tweetId: string, score: number, category: string, popularity_score: number}[]> {
    try {
      const { 
        topK = 10, 
        includeCategories, 
        excludeCategories, 
        minPopularity = 0, 
        diversityFactor = 0.3,
        excludeTweetIds = [],
        batchId,
        timeDecayFactor = 0.5 // Default: moderate time decay
      } = options;
      
      // Get user profile - first check cache, then Pinecone
      let userProfile = this.userProfiles.get(userId);
      
      if (!userProfile) {
        // Try to fetch from Pinecone
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
            // Cache it for next time
            this.userProfiles.set(userId, userProfile);
          }
        } catch (fetchError) {
          console.warn(`Could not fetch user profile from Pinecone: ${fetchError}`);
        }
      }
      
      if (!userProfile) {
        throw new Error(`User profile not found for user ${userId}. Make sure to call buildUserProfile() first.`);
      }
      
      // Query for similar tweets (get more than needed for filtering)
      const queryResponse = await this.index.query({
        vector: userProfile.profileVector,
        topK: topK * 3, // Get 3x more for filtering and diversity
        includeMetadata: true,
        filter: {
          type: { $eq: 'tweet' },
          ...(includeCategories && { category: { $in: includeCategories } }),
          ...(excludeCategories && { category: { $nin: excludeCategories } }),
          ...(minPopularity > 0 && { popularity_score: { $gte: minPopularity } }),
          ...(excludeTweetIds && { tweetId: { $nin: excludeTweetIds } }),
          ...(batchId && { batchId: { $eq: batchId } })
        }
      });
      
      if (!queryResponse.matches) {
        return [];
      }
      
      // Process results with time decay
      let recommendations = queryResponse.matches
        .filter((match: any) => match.metadata?.type === 'tweet')
        .filter((match: any) => !excludeTweetIds.includes(match.metadata?.tweetId))
        .map((match: any) => {
          const baseScore = match.score || 0;
          const timestamp = match.metadata?.timestamp || Date.now();
          const ageInHours = (Date.now() - timestamp) / (1000 * 60 * 60);
          
          // Apply time decay: score * e^(-timeDecayFactor * ageInHours)
          const timeDecayScore = baseScore * Math.exp(-timeDecayFactor * ageInHours);
          
          return {
            tweetId: match.metadata!.tweetId as string,
            score: timeDecayScore,
            category: match.metadata!.category as string,
            popularity_score: match.metadata!.popularity_score as number || 0,
            metadata: match.metadata
          };
        })
        .sort((a: RecommendationResult, b: RecommendationResult) => b.score - a.score); // Sort by decayed score
      
      // Apply diversity if requested
      if (diversityFactor > 0) {
        recommendations = this.diversifyRecommendations(recommendations, topK, diversityFactor);
      } else {
        recommendations = recommendations.slice(0, topK);
      }
      
      console.log(`Generated ${recommendations.length} recommendations for user ${userId}`);
      return recommendations;
      
    } catch (error) {
      console.error("Error getting recommendations:", error);
      throw error;
    }
  }
  
  // Helper method to diversify recommendations by category
  private diversifyRecommendations(
    recommendations: any[], 
    topK: number, 
    diversityFactor: number
  ): any[] {
    const categoryGroups = new Map<string, any[]>();
    
    // Group by category
    recommendations.forEach(rec => {
      if (!categoryGroups.has(rec.category)) {
        categoryGroups.set(rec.category, []);
      }
      categoryGroups.get(rec.category)!.push(rec);
    });
    
    // Sort each category group by score
    categoryGroups.forEach(group => {
      group.sort((a, b) => b.score - a.score);
    });
    
    const diversified: any[] = [];
    const categories = Array.from(categoryGroups.keys());
    let categoryIndex = 0;
    
    // Round-robin selection with fallback to highest scores
    while (diversified.length < topK && diversified.length < recommendations.length) {
      let added = false;
      
      // Try to add from each category
      for (let i = 0; i < categories.length && diversified.length < topK; i++) {
        const category = categories[(categoryIndex + i) % categories.length];
        const group = categoryGroups.get(category)!;
        
        // Find next unused item in this category
        const availableItem = group.find(item => 
          !diversified.some(d => d.tweetId === item.tweetId)
        );
        
        if (availableItem) {
          diversified.push(availableItem);
          added = true;
        }
      }
      
      categoryIndex++;
      
      // If we couldn't add anything in this round, break
      if (!added) break;
    }
    
    return diversified;
  }

  // 5) Batch operations for initial data loading
  async batchStoreTweets(tweets: Tweet[], batchSize: number = 100, batchId?: string) {
    console.log(`Storing ${tweets.length} tweets in batches of ${batchSize}...`);
    
    const actualBatchId = batchId || `batch_${Date.now()}`;
    
    for (let i = 0; i < tweets.length; i += batchSize) {
      const batch = tweets.slice(i, i + batchSize);
      const promises = batch.map(tweet => this.storeTweet(tweet, actualBatchId));
      
      try {
        await Promise.all(promises);
        console.log(`Stored batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(tweets.length/batchSize)}`);
      } catch (error) {
        console.error(`Error storing batch starting at index ${i}:`, error);
      }
    }
    
    return actualBatchId; // Return the batch ID for filtering
  }

  // 5) Convenience method: Build profile and get recommendations in one call
  async getRecommendationsForUser(
    userId: string,
    interactions: UserInteraction[],
    tweets: Tweet[],
    options: {
      topK?: number;
      includeCategories?: string[];
      excludeCategories?: string[];
      minPopularity?: number;
      diversityFactor?: number;
      batchId?: string;
    } = {}
  ): Promise<{tweetId: string, score: number, category: string, popularity_score: number}[]> {
    try {
      // Build user profile from interactions
      await this.buildUserProfile(userId, interactions, tweets);
      
      // Extract tweet IDs that user has already interacted with
      const excludeTweetIds = interactions.map(interaction => interaction.tweetId);
      
      // Get recommendations excluding tweets they've already seen
      return await this.getRecommendations(userId, {
        ...options,
        excludeTweetIds
      });
      
    } catch (error) {
      console.error("Error getting recommendations for user:", error);
      throw error;
    }
  }
}

// Export for use in other modules
export { RecommendationSystem, Tweet, UserInteraction, UserProfile };
