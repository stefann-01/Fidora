'use client'

import { ethers } from 'ethers'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

interface Web3ContextType {
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  account: string | null
  chainId: number | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize provider if MetaMask is available
    if (typeof window !== 'undefined' && window.ethereum) {
      const ethersProvider = new ethers.BrowserProvider(window.ethereum)
      setProvider(ethersProvider)
    }
  }, [])

  const connectWallet = useCallback(async () => {
    if (typeof window !== 'undefined' && window.ethereum && provider) {
      try {
        // Request account access
        await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        
        // Get signer and account
        const ethersSigner = await provider.getSigner()
        const address = await ethersSigner.getAddress()
        const network = await provider.getNetwork()

        setSigner(ethersSigner)
        setAccount(address)
        setChainId(Number(network.chainId))
        setIsConnected(true)
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    }
  }, [provider])

  const disconnectWallet = () => {
    setSigner(null)
    setAccount(null)
    setChainId(null)
    setIsConnected(false)
  }

  useEffect(() => {
    // Check if already connected
    if (typeof window !== 'undefined' && window.ethereum && provider) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: unknown) => {
          const accountsArray = accounts as string[]
          if (accountsArray.length > 0) {
            connectWallet()
          }
        })
    }

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: unknown) => {
        const accountsArray = accounts as string[]
        if (accountsArray.length === 0) {
          disconnectWallet()
        } else {
          connectWallet()
        }
      })

      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }
  }, [connectWallet, provider])

  return (
    <Web3Context.Provider value={{
      provider,
      signer,
      account,
      chainId,
      isConnected,
      connectWallet,
      disconnectWallet
    }}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
} 
