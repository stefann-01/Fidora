import { ethers } from 'ethers'

// Contract ABI - you'll need to add the full ABI here
const FIDORA_ABI = [
  // Core functions
  "function makeClaim(uint256 _claimId, uint256 _bettingDuration) external payable",
  "function makeBet(uint256 _claimId, uint8 _option) external payable",
  "function initiateVoting(uint256 _claimId) external",
  "function castVote(uint256 _claimId, uint8 _vote) external",
  "function tryResolveClaim(uint256 _claimId) external returns (bool)",
  "function signupForJury() external payable",
  "function leaveJury() external",
  "function getMyRewards(uint256 _claimId) external returns (uint256)",
  "function pullProfits() external",
  
  // View functions
  "function getBettingDeadline(uint256 _claimId) external view returns (uint256)",
  "function getVotingDeadline(uint256 _claimId) external view returns (uint256)",
  
  // Events
  "event NewJuror(address indexed adr)",
  "event JurorWithdrawal(address indexed adr)",
  "event NewClaim(uint256 indexed claimId, address indexed owner, uint256 indexed bettingDuration)",
  "event NewBet(uint256 indexed claimId, address indexed user)",
  "event VotingStarted(uint256 indexed claimId)",
  "event VotingFinished(uint256 claimId, uint8 outcome)"
]

// Contract addresses from .env
const FIDORA_ADDRESS = "0x74db9AF5e4b04CE6F1BEDD42a65d37341132CEBF"

// Constants from .env
const JUROR_BUYIN_FEE = "100000000000000000" // 0.1 ETH
const CLAIM_FEE = "200000000000000" // 0.0002 ETH
const MIN_BETTING_AMOUNT = "10000000000000" // 0.00001 ETH

// Vote enum values
export enum Vote {
  Agree = 1,
  Disagree = 2,
  Unprovable = 3,
  Undecided = 4
}

export interface TransactionResult {
  hash: string
  receipt?: ethers.TransactionReceipt
}

export class TxService {
  private contract: ethers.Contract | null = null
  private signer: ethers.JsonRpcSigner | null = null

  constructor(signer: ethers.JsonRpcSigner | null) {
    this.signer = signer
    if (signer) {
      this.contract = new ethers.Contract(FIDORA_ADDRESS, FIDORA_ABI, signer)
    }
  }

  private ensureContract(): ethers.Contract {
    if (!this.contract || !this.signer) {
      throw new Error('Wallet not connected or contract not initialized')
    }
    return this.contract
  }

  // Claim functions
  async makeClaim(claimId: number, bettingDurationHours: number): Promise<TransactionResult> {
    const contract = this.ensureContract()
    const bettingDurationSeconds = bettingDurationHours * 3600
    
    const tx = await contract.makeClaim(claimId, bettingDurationSeconds, {
      value: CLAIM_FEE
    })
    
    return {
      hash: tx.hash,
      receipt: await tx.wait()
    }
  }

  async makeBet(claimId: BigInt, vote: Vote, betAmount: string): Promise<TransactionResult> {
    const contract = this.ensureContract()
    
    // Validate minimum bet amount
    const betAmountWei = ethers.parseEther(betAmount)
    const minBetWei = BigInt(MIN_BETTING_AMOUNT)
      
    if (betAmountWei < minBetWei) {
      throw new Error(`Minimum bet amount is ${ethers.formatEther(minBetWei)} ETH`)
    }
    
    const tx = await contract.makeBet(claimId, vote, {
      value: betAmountWei
    })
    
    return {
      hash: tx.hash,
      receipt: await tx.wait()
    }
  }

  // Jury functions
  async signupForJury(): Promise<TransactionResult> {
    const contract = this.ensureContract()
    
    const tx = await contract.signupForJury({
      value: JUROR_BUYIN_FEE
    })
    
    return {
      hash: tx.hash,
      receipt: await tx.wait()
    }
  }

  async leaveJury(): Promise<TransactionResult> {
    const contract = this.ensureContract()
    
    const tx = await contract.leaveJury()
    
    return {
      hash: tx.hash,
      receipt: await tx.wait()
    }
  }

  async castVote(claimId: number, vote: Vote): Promise<TransactionResult> {
    const contract = this.ensureContract()
    
    const tx = await contract.castVote(claimId, vote)
    
    return {
      hash: tx.hash,
      receipt: await tx.wait()
    }
  }

  // Admin functions (owner only)
  async initiateVoting(claimId: number): Promise<TransactionResult> {
    const contract = this.ensureContract()
    
    const tx = await contract.initiateVoting(claimId)
    
    return {
      hash: tx.hash,
      receipt: await tx.wait()
    }
  }

  async tryResolveClaim(claimId: number): Promise<{ result: TransactionResult, resolved: boolean }> {
    const contract = this.ensureContract()
    
    const tx = await contract.tryResolveClaim(claimId)
    const receipt = await tx.wait()
    
    // Parse the return value from the transaction receipt
    // Note: This is a simplified approach - you might need to decode logs for the actual return value
    
    return {
      result: {
        hash: tx.hash,
        receipt
      },
      resolved: true // You'll need to parse this from the transaction result
    }
  }

  async pullProfits(): Promise<TransactionResult> {
    const contract = this.ensureContract()
    
    const tx = await contract.pullProfits()
    
    return {
      hash: tx.hash,
      receipt: await tx.wait()
    }
  }

  // Reward functions
  async getMyRewards(claimId: number): Promise<{ result: TransactionResult, amount: string }> {
    const contract = this.ensureContract()
    
    const tx = await contract.getMyRewards(claimId)
    const receipt = await tx.wait()
    
    // You'll need to parse the return value from the transaction logs
    // This is a simplified version
    
    return {
      result: {
        hash: tx.hash,
        receipt
      },
      amount: "0" // Parse actual amount from transaction result
    }
  }

  // View functions (read-only)
  async getBettingDeadline(claimId: number): Promise<Date> {
    const contract = this.ensureContract()
    
    const timestamp = await contract.getBettingDeadline(claimId)
    return new Date(Number(timestamp) * 1000)
  }

  async getVotingDeadline(claimId: number): Promise<Date> {
    const contract = this.ensureContract()
    
    const timestamp = await contract.getVotingDeadline(claimId)
    return new Date(Number(timestamp) * 1000)
  }

  // Event listeners
  onNewClaim(callback: (claimId: number, owner: string, bettingDuration: number) => void) {
    const contract = this.ensureContract()
    
    contract.on("NewClaim", (claimId, owner, bettingDuration) => {
      callback(Number(claimId), owner, Number(bettingDuration))
    })
  }

  onNewBet(callback: (claimId: number, user: string) => void) {
    const contract = this.ensureContract()
    
    contract.on("NewBet", (claimId, user) => {
      callback(Number(claimId), user)
    })
  }

  onVotingStarted(callback: (claimId: number) => void) {
    const contract = this.ensureContract()
    
    contract.on("VotingStarted", (claimId) => {
      callback(Number(claimId))
    })
  }

  onVotingFinished(callback: (claimId: number, outcome: Vote) => void) {
    const contract = this.ensureContract()
    
    contract.on("VotingFinished", (claimId, outcome) => {
      callback(Number(claimId), outcome)
    })
  }

  onNewJuror(callback: (address: string) => void) {
    const contract = this.ensureContract()
    
    contract.on("NewJuror", (address) => {
      callback(address)
    })
  }

  onJurorWithdrawal(callback: (address: string) => void) {
    const contract = this.ensureContract()
    
    contract.on("JurorWithdrawal", (address) => {
      callback(address)
    })
  }

  // Utility functions
  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners()
    }
  }

  // Helper to estimate gas for transactions
  async estimateGas(method: string, ...args: unknown[]): Promise<bigint> {
    const contract = this.ensureContract()
    
    return await contract[method].estimateGas(...args)
  }

  // Helper to get current gas price
  async getGasPrice(): Promise<bigint> {
    if (!this.signer?.provider) {
      throw new Error('Provider not available')
    }
    
    const feeData = await this.signer.provider.getFeeData()
    return feeData.gasPrice || BigInt(0)
  }
}

// Factory function to create TxService with current signer
export const createTxService = (signer: ethers.JsonRpcSigner | null): TxService => {
  return new TxService(signer)
}

// Hook-like function to use with Web3Context
export const useTxService = (signer: ethers.JsonRpcSigner | null): TxService => {
  return new TxService(signer)
} 