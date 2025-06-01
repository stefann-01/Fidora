// src/services/fidoraService.ts
import * as dotenv from "dotenv";
import { Contract } from "ethers";
import FidoraJson from "../config/abi/Fidora.json";
import { provider, signer } from "./ethereum";

dotenv.config({ path: './src/.env' });

// Load the contract address from environment:
const FIDORA_ADDRESS = process.env.FIDORA_ADDRESS!;
if (!FIDORA_ADDRESS) {
  throw new Error("Please set the FIDORA_ADDRESS environment variable");
}

// ABI array is under `abi` key
const FIDORA_ABI = FidoraJson as any[];

export function getFidoraContract(): Contract {
  // If you only need view calls, pass `provider`. If you need to send txs, use `signer`.
  const contractSignerOrProvider = signer ?? provider;
  return new Contract(FIDORA_ADDRESS, FIDORA_ABI, contractSignerOrProvider);
}

/**
 * Example: call the view function `pickJurors` on-chain.
 */
export async function pickJurorsView(claimId: BigInt): Promise<string[]> {
  const fidora = getFidoraContract();
  // We assume `pickJurors` is a `view` that returns `address[]`
  const jurors: string[] = await fidora.pickJurors(claimId);
  return jurors;
}

/**
 * Example: initiate a transaction to `initiateVoting(...)` (non-view).
 */
export async function initiateVotingTx(claimId: BigInt): Promise<string> {
  if (!signer) {
    throw new Error("No signer available; cannot send transaction");
  }
  const fidora = getFidoraContract();
  const tx = await fidora.initiateVoting(claimId);
  // Wait for 1 confirmation before returning
  await tx.wait(1);
  return tx.hash;
}

/**
 * Get the betting deadline for a claim
 * @param claimId The ID of the claim
 * @returns Unix timestamp when betting phase ends
 */
export async function getBettingDeadline(claimId: BigInt): Promise<number | undefined> {
  try {
  const fidora = getFidoraContract();
  return await fidora.getBettingDeadline(claimId);
  } catch (error) {
    console.error("Error getting betting deadline:", error);
    return undefined;
  }
}

/**
 * Get the voting deadline for a claim
 * @param claimId The ID of the claim
 * @returns Unix timestamp when voting phase ends
 */
export async function getVotingDeadline(claimId: BigInt): Promise<number> {
  const fidora = getFidoraContract();
  return await fidora.getVotingDeadline(claimId);
}

/**
 * Try to resolve a claim after voting is complete
 * @param claimId The ID of the claim to resolve
 * @returns true if claim was successfully resolved, false if voting needs to be restarted
 */
export async function tryResolveClaim(claimId: BigInt): Promise<boolean> {
  if (!signer) {
    throw new Error("No signer available; cannot send transaction");
  }
  const fidora = getFidoraContract();
  const tx = await fidora.tryResolveClaim(claimId);
  await tx.wait(1);
  return tx.hash;
}

/**
 * Create a new claim in the contract
 * @param claimId The ID of the claim to create
 * @param bettingDuration Duration in seconds for the betting phase
 * @returns Transaction hash
 */
export async function makeClaim(claimId: BigInt, bettingDuration: number): Promise<string> {
  if (!signer) {
    throw new Error("No signer available; cannot send transaction");
  }
  const fidora = getFidoraContract();
  const claimFee = await fidora.claimFee();
  const tx = await fidora.makeClaim(claimId, bettingDuration, { value: claimFee });
  await tx.wait(1);
  return tx.hash;
}
