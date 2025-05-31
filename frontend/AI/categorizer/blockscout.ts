import axios from 'axios';

const BLOCKSCOUT_API_KEY = '6b4b5de9-adec-4232-8eba-38d025ffca94';

export interface BlockscoutTransaction {
  blockHash: string;
  blockNumber: string;
  confirmations: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  from: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  hash: string;
  input: string;
  nonce: string;
  timeStamp: string;
  to: string;
  transactionIndex: string;
  value: string;
  isError: string;
  txreceipt_status: string;
}

interface BlockscoutResponse {
  status: string;
  message: string;
  result: BlockscoutTransaction[];
}

export interface TokenTransfer {
  blockHash: string;
  blockNumber: string;
  confirmations: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  from: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  hash: string;
  input: string;
  nonce: string;
  timeStamp: string;
  to: string;
  tokenDecimal: string;
  tokenName: string;
  tokenSymbol: string;
  transactionIndex: string;
  value: string;
}

interface TokenTransferResponse {
  status: string;
  message: string;
  result: TokenTransfer[];
}

export async function getContractInteractions(
  userAddress: string, 
  contractAddress: string,
  options: {
    startBlock?: string;
    endBlock?: string;
    page?: string;
    offset?: string;
  } = {}
) {
  try {
    console.log('Fetching contract interactions for:', {
      userAddress,
      contractAddress,
      options
    });

    const response = await axios.get<BlockscoutResponse>(
      `https://api.blockscout.com/api/v2/addresses/${userAddress}/transactions`,
      {
        params: {
          contract_address: contractAddress,
          start_block: options.startBlock,
          end_block: options.endBlock,
          page: options.page,
          offset: options.offset
        },
        headers: {
          'x-api-key': BLOCKSCOUT_API_KEY
        }
      }
    );

    if (response.data.status === '1') {
      return response.data.result;
    } else {
      throw new Error(`Blockscout API error: ${response.data.message}`);
    }
  } catch (error) {
    console.error('Error fetching contract interactions:', error);
    throw error;
  }
}

export async function getTokenTransfers(
  userAddress: string,
  contractAddress: string,
  options: {
    startBlock?: string;
    endBlock?: string;
    page?: string;
    offset?: string;
  } = {}
) {
  try {
    console.log('Fetching token transfers for:', {
      userAddress,
      contractAddress,
      options
    });

    const response = await axios.get<TokenTransferResponse>(
      `https://api.blockscout.com/api/v2/addresses/${userAddress}/token-transfers`,
      {
        params: {
          contract_address: contractAddress,
          start_block: options.startBlock,
          end_block: options.endBlock,
          page: options.page,
          offset: options.offset
        },
        headers: {
          'x-api-key': BLOCKSCOUT_API_KEY
        }
      }
    );

    if (response.data.status === '1') {
      return response.data.result;
    } else {
      throw new Error(`Blockscout API error: ${response.data.message}`);
    }
  } catch (error) {
    console.error('Error fetching token transfers:', error);
    throw error;
  }
}

export async function getInternalTransactions(
  userAddress: string,
  contractAddress: string,
  options: {
    startBlock?: string;
    endBlock?: string;
    page?: string;
    offset?: string;
  } = {}
) {
  try {
    console.log('Fetching internal transactions for:', {
      userAddress,
      contractAddress,
      options
    });

    const response = await axios.get<BlockscoutResponse>(
      `https://api.blockscout.com/api/v2/addresses/${userAddress}/internal-transactions`,
      {
        params: {
          contract_address: contractAddress,
          start_block: options.startBlock,
          end_block: options.endBlock,
          page: options.page,
          offset: options.offset
        },
        headers: {
          'x-api-key': BLOCKSCOUT_API_KEY
        }
      }
    );

    if (response.data.status === '1') {
      return response.data.result;
    } else {
      throw new Error(`Blockscout API error: ${response.data.message}`);
    }
  } catch (error) {
    console.error('Error fetching internal transactions:', error);
    throw error;
  }
} 