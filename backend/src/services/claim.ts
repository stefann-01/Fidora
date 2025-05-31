import { Claim } from "../models/db.types";
import { db_claims } from '../db/db';
import { Group } from "@semaphore-protocol/group"


export const ClaimService = {
  /**
   * create(claimData: Claim): Claim
   * - Expects a full Claim object (including a unique `claimId`).
   * - If a claim with the same `claimId` already exists, it throws an error.
   */
  create(claimData: Claim): Claim {
    // Ensure uniqueness on `claimId`
    const existing = db_claims.find((c) => c.claimId === claimData.claimId);
    if (existing) {
      throw new Error(`Claim with claimId=${claimData.claimId} already exists`);
    }
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