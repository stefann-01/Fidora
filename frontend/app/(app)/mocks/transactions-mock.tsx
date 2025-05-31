export interface TransactionData {
  id: string
  hash: string
  type: string
  status: 'pending' | 'success' | 'failed'
  timestamp: string
  from: string
  to: string
  value: string
  gasUsed: string
  gasPrice: string
  blockNumber?: number
  description: string
}

export const transactionsMock: TransactionData[] = [
  {
    id: "1",
    hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    type: "Vote",
    status: "success",
    timestamp: "2024-01-15T10:30:00Z",
    from: "0xabc123...def456",
    to: "0x789xyz...123abc",
    value: "0.001 ETH",
    gasUsed: "21,000",
    gasPrice: "20 gwei",
    blockNumber: 18950123,
    description: "Voted 'Agree' on medical accuracy post"
  },
  {
    id: "2", 
    hash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    type: "Stake",
    status: "success",
    timestamp: "2024-01-15T09:15:00Z",
    from: "0xdef789...abc123",
    to: "0x456uvw...789xyz",
    value: "0.05 ETH",
    gasUsed: "45,000",
    gasPrice: "22 gwei",
    blockNumber: 18950089,
    description: "Staked tokens on post verification"
  },
  {
    id: "3",
    hash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
    type: "Evidence",
    status: "pending",
    timestamp: "2024-01-15T11:45:00Z",
    from: "0x123abc...456def",
    to: "0xuvw789...xyz123",
    value: "0.002 ETH",
    gasUsed: "32,000",
    gasPrice: "25 gwei",
    description: "Submitted supporting evidence for post"
  },
  {
    id: "4",
    hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    type: "Dispute",
    status: "failed",
    timestamp: "2024-01-15T08:20:00Z",
    from: "0x789xyz...123uvw",
    to: "0xabc456...def789",
    value: "0.01 ETH",
    gasUsed: "0",
    gasPrice: "18 gwei",
    description: "Failed to dispute post evidence"
  },
  {
    id: "5",
    hash: "0x5555666677778888999900001111222233334444555566667777888899990000",
    type: "Reward",
    status: "success",
    timestamp: "2024-01-14T16:30:00Z",
    from: "0xcontract...address",
    to: "0xuser123...wallet",
    value: "0.025 ETH",
    gasUsed: "28,000",
    gasPrice: "19 gwei",
    blockNumber: 18949876,
    description: "Received reward for accurate post verification"
  }
] 
