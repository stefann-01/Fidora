// src/services/fidoraService.ts
import { Contract } from "ethers";
import { provider, signer } from "./ethereum";
import FidoraJson from "../config/abi/Fidora.json"; // ABI JSON

// Load the contract address from environment:
const FIDORA_ADDRESS = process.env.FIDORA_ADDRESS!;
if (!FIDORA_ADDRESS) {
  throw new Error("Please set the FIDORA_ADDRESS environment variable");
}

// ABI array is under `abi` key
const FIDORA_ABI = FidoraJson.abi as any[];

export function getFidoraContract(): Contract {
  // If you only need view calls, pass `provider`. If you need to send txs, use `signer`.
  const contractSignerOrProvider = signer ?? provider;
  return new Contract(FIDORA_ADDRESS, FIDORA_ABI, contractSignerOrProvider);
}

/**
 * Example: call the view function `pickJurors` on-chain.
 */
export async function pickJurorsView(claimId: number): Promise<string[]> {
  const fidora = getFidoraContract();
  // We assume `pickJurors` is a `view` that returns `address[]`
  const jurors: string[] = await fidora.pickJurors(claimId);
  return jurors;
}

/**
 * Example: initiate a transaction to `initiateVoting(...)` (non-view).
 */
export async function initiateVotingTx(claimId: number): Promise<string> {
  if (!signer) {
    throw new Error("No signer available; cannot send transaction");
  }
  const fidora = getFidoraContract();
  const tx = await fidora.initiateVoting(claimId);
  // Wait for 1 confirmation before returning
  await tx.wait(1);
  return tx.hash;
}
