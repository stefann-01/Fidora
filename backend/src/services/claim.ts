import lighthouse from '@lighthouse-web3/sdk';
import { Group } from '@semaphore-protocol/group';
import axios from 'axios';
import { db_claims } from '../db/db';
import { Claim } from "../models/db.types";
import { UserService } from './user';

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
   */
  async createFromUrl(tweetUrl: string): Promise<Claim> {
    try {
      // Extract tweet ID from URL
      const tweetId = tweetUrl.split('/').pop();
      if (!tweetId) {
        throw new Error('Invalid tweet URL format');
      }

      // Check if claim already exists
      const existing = db_claims.find((c) => c.claimId === tweetId);
      if (existing) {
        throw new Error(`Claim with claimId=${tweetId} already exists`);
      }

      // Fetch tweet data
      const response = await axios.request<TweetResponse>({
        method: 'GET',
        url: 'https://twitter241.p.rapidapi.com/tweet',
        params: { pid: tweetId },
        headers: {
          'x-rapidapi-key': process.env.X_RAPIDAPI_KEY || '',
          'x-rapidapi-host': 'twitter241.p.rapidapi.com'
        }
      });

      console.log("Full Response:", JSON.stringify(response.data, null, 2));

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

      // Create claim data
      const claimData: Claim = {
        url: tweetUrl,
        claimId: tweetId,
        author: response.data.user.legacy.screen_name,
        content: response.data.tweet.full_text,
        category: 'General', // Default category, could be enhanced with AI categorization
        profilePic: '', // Could be fetched from user data
        evidence: [],
        semaphore: new Group(),
        lighthouseHash: uploadResponse.data.Hash
      };

      // Ensure author exists
      UserService.createIfNotExists(claimData.author);

      // Store claim
      db_claims.push(claimData);
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
  create(claimData: Claim): Claim {
    // Ensure uniqueness on `claimId`
    const existing = db_claims.find((c) => c.claimId === claimData.claimId);
    if (existing) {
      throw new Error(`Claim with claimId=${claimData.claimId} already exists`);
    }

    // Check if author exists, create if not
    UserService.createIfNotExists(claimData.author);

    db_claims.push(claimData);
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
   * - Returns all stored claims.
   */
  getAll(): Claim[] {
    return [...db_claims];
  },

  makeJury(claimId: string, userId: string) {
    const claim = this.getOne(claimId);
    if (!claim) {
      throw new Error(`Claim with claimId=${claimId} not found`);
    }
    claim.semaphore.addMember(userId);
  }
};