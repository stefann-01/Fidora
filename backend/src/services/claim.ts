import lighthouse from '@lighthouse-web3/sdk';
import { Group } from '@semaphore-protocol/group';
import axios from 'axios';
import { CategorizationResult, categorizeClaimContent } from "../AI/categorizer/categorizer";
import { db_claims } from '../db/db';
import { Claim } from "../models/db.types";
import { UserService } from './user';
import { getBettingDeadline, initiateVotingTx } from './fidora';
import { SchedulerService } from './scheduler';

interface TweetResponse {
  tweet?: {
    full_text: string;
    id_str: string;
  };
  user?: {
    legacy: {
      screen_name: string;
    };
  };
  data?: any
}

export const ClaimService = {
  /**
   * createFromUrl(tweetUrl: string): Promise<Claim>
   * - Fetches tweet data from the URL and creates a claim
   * - Generates claimId from tweet ID
   * - Creates author if they don't exist
   * - Stores tweet data on IPFS via Lighthouse
   * - Automatically categorizes the claim content using AI
   */
  async createFromUrl(tweetUrl: string): Promise<Claim> {
    try {
      // Extract tweet ID from URL
      const tweetId = tweetUrl.split('/').pop()?.split('?')[0];
      if (!tweetId) {
        throw new Error('Invalid tweet URL format');
      }

      // Check if claim already exists
      const existing = db_claims.find((c) => c.claimId === tweetId);
      if (existing) {
        throw new Error(`Claim with claimId=${tweetId} already exists`);
      }

      // Check if RapidAPI key is set
      const rapidApiKey = process.env.X_RAPIDAPI_KEY;
      if (!rapidApiKey) {
        throw new Error('RapidAPI key is not set. Please set X_RAPIDAPI_KEY in your environment variables.');
      }

      // Fetch tweet data
      const response = await axios.request<TweetResponse>({
        method: 'GET',
        url: 'https://twitter241.p.rapidapi.com/tweet',
        params: { pid: tweetId },
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'twitter241.p.rapidapi.com'
        }
      });

      // Check if we have the expected tweet data structure
      if (!response.data.tweet || !response.data.user) {
        console.error("Unexpected response structure:", response.data);
        throw new Error('Invalid response from Twitter API - tweet data not found');
      }

      // Validate required fields
      if (!response.data.tweet.full_text || !response.data.tweet.id_str) {
        throw new Error('Missing tweet content or ID in API response');
      }

      if (!response.data.user.legacy || !response.data.user.legacy.screen_name) {
        throw new Error('Missing user information in API response');
      }

      // Add timestamp to the data
      const dataWithTimestamp = {
        ...response.data,
        fetchedAt: new Date().toISOString()
      };

      // Upload to IPFS via Lighthouse
      const uploadResponse = await lighthouse.uploadText(
        JSON.stringify(dataWithTimestamp),
        process.env.LIGHTHOUSE_API_KEY || '',
        tweetId
      );

      // Categorize the claim content using AI
      let categorizationResult: CategorizationResult;
      categorizationResult = {
        category: 'Other',
        confidence: 0,
        reasoning: '',
        content: response.data.tweet.full_text
      };
      try {
        console.log('Categorizing claim content with AI...');
        categorizationResult = await categorizeClaimContent(response.data.tweet.full_text);
        console.log(`AI categorized claim as: ${categorizationResult.category} (confidence: ${categorizationResult.confidence})`);
        console.log(`Reasoning: ${categorizationResult.reasoning}`);
      } catch (categorizationError) {
        console.warn('Failed to categorize claim with AI, using default category:', categorizationError);
      }

      // Create claim data
      const claimData: Claim = {
        url: tweetUrl,
        claimId: tweetId,
        author: response.data.user.legacy.screen_name,
        content: response.data.tweet.full_text,
        category: categorizationResult.category, // Keep the original category field for backward compatibility
        profilePic: '', // Could be fetched from user data
        evidence: [],
        semaphore: new Group(),
        lighthouseHash: uploadResponse.data.Hash
      };

      // Ensure author exists
      UserService.createIfNotExists(claimData.author, claimData.content);

      // Store claim
      db_claims.push(claimData);
      // Schedule the betting phase
    const bettingDeadline = await getBettingDeadline(BigInt(claimData.claimId));
    if (!bettingDeadline) {
      console.warn(`No betting deadline found for claim ${claimData.claimId}`);
      return claimData;
    }
    SchedulerService.scheduleTaskAtTimestamp(async () => {
      await initiateVotingTx(BigInt(claimData.claimId));
    }, bettingDeadline + 60000);

    return claimData;

    } catch (error) {
      console.error('Error creating claim from URL:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create claim from URL');
    }
  },

  /**
   * create(claimData: Claim): Claim
   * - Expects a full Claim object (including a unique `claimId`).
   * - If a claim with the same `claimId` already exists, it throws an error.
   * - Ensures the author exists in the database, creates them if not.
   */
  async create(claimData: Claim): Promise<Claim> {
    // Ensure uniqueness on `claimId`
    const existing = db_claims.find((c) => c.claimId === claimData.claimId);
    if (existing) {
      throw new Error(`Claim with claimId=${claimData.claimId} already exists`);
    }

    // Check if author exists, create if not
    UserService.createIfNotExists(claimData.author, claimData.content);

    // Ensure categories field exists (for backward compatibility)
    if (!claimData.category) {
      claimData.category = 'Unknown';
    }

    db_claims.push(claimData);

    // Schedule the betting phase
    const bettingDeadline = await getBettingDeadline(BigInt(claimData.claimId));
    if (!bettingDeadline) {
      console.warn(`No betting deadline found for claim ${claimData.claimId}`);
      return claimData;
    }
    SchedulerService.scheduleTaskAtTimestamp(async () => {
      await initiateVotingTx(BigInt(claimData.claimId));
    }, bettingDeadline + 60000);

    return claimData;
  },

  /**
   * getOne(claimId: string): Claim | undefined
   * - Returns the claim with the given `claimId`, or `undefined` if not found.
   */
  getOne(claimId: string): Claim | undefined {
    return db_claims.find((c) => c.claimId === claimId);
  },

  /**
   * getAll(): Claim[]
   * - Returns all stored claims sorted by claimId.
   */
  getAll(): Claim[] {
    return [...db_claims].sort((a, b) => b.claimId.localeCompare(a.claimId));
  },

  /**
   * getByAuthor(author: string): Claim[]
   * - Returns all claims by a specific author
   */
  getByAuthor(author: string): Claim[] {
    return db_claims.filter((c) => c.author === author);
  },

  makeJury(claimId: string, userId: string) {
    const claim = this.getOne(claimId);
    if (!claim) {
      throw new Error(`Claim with claimId=${claimId} not found`);
    }
    claim.semaphore.addMember(userId);
  }
};