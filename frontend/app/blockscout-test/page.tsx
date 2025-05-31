'use client';

import { useState } from 'react';
import { getContractInteractions, getTokenTransfers, getInternalTransactions } from '../../AI/categorizer/blockscout';
import type { BlockscoutTransaction, TokenTransfer } from '../../AI/categorizer/blockscout';

// Popular addresses for testing
const TEST_ADDRESSES = {
  vitalik: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  uniswap: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI token
  weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'  // WETH
};

export default function BlockscoutTest() {
  const [userAddress, setUserAddress] = useState(TEST_ADDRESSES.vitalik);
  const [contractAddress, setContractAddress] = useState(TEST_ADDRESSES.usdc);
  const [result, setResult] = useState<BlockscoutTransaction[] | TokenTransfer[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testType, setTestType] = useState<'transactions' | 'tokenTransfers' | 'internal'>('transactions');

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      switch (testType) {
        case 'transactions':
          data = await getContractInteractions(userAddress, contractAddress);
          break;
        case 'tokenTransfers':
          data = await getTokenTransfers(userAddress, contractAddress);
          break;
        case 'internal':
          data = await getInternalTransactions(userAddress, contractAddress);
          break;
      }
      setResult(data);
    } catch (error) {
      console.error('Test error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Blockscout API Test</h1>
      
      <div className="mb-4 space-y-4">
        <div>
          <label className="block mb-2">User Address:</label>
          <select 
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value={TEST_ADDRESSES.vitalik}>Vitalik's Address</option>
            <option value={TEST_ADDRESSES.uniswap}>UNI Token</option>
            <option value={TEST_ADDRESSES.weth}>WETH</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Contract Address:</label>
          <select 
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value={TEST_ADDRESSES.usdc}>USDC</option>
            <option value={TEST_ADDRESSES.uniswap}>UNI Token</option>
            <option value={TEST_ADDRESSES.weth}>WETH</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Test Type:</label>
          <select 
            value={testType}
            onChange={(e) => setTestType(e.target.value as 'transactions' | 'tokenTransfers' | 'internal')}
            className="p-2 border rounded w-full"
          >
            <option value="transactions">Regular Transactions</option>
            <option value="tokenTransfers">Token Transfers</option>
            <option value="internal">Internal Transactions</option>
          </select>
        </div>

        <button 
          onClick={handleTest}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test API'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="font-bold text-red-700 mb-2">Error:</h2>
          <pre className="text-red-600 whitespace-pre-wrap">
            {error}
          </pre>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 