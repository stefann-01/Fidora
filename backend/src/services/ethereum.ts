// src/services/ethereum.ts
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config({ path: './src/.env' });

const RPC_URL = process.env.RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY; // if you need to send txs

// (1) Create a read-only provider
export const provider = new ethers.JsonRpcProvider(RPC_URL);

// (2) If you need to send transactions (e.g. to call non-view functions):
export const signer = PRIVATE_KEY
  ? new ethers.Wallet(PRIVATE_KEY, provider)
  : null;
