'use client'

import { Alchemy, Network, Wallet } from 'alchemy-sdk'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface Web3ContextType {
  alchemy: Alchemy | null
  wallet: Wallet | null
  account: string | null
  chainId: number | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [alchemy, setAlchemy] = useState<Alchemy | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize Alchemy
    const settings = {
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'demo',
      network: Network.ETH_MAINNET,
    }
    const alchemyInstance = new Alchemy(settings)
    setAlchemy(alchemyInstance)
  }, [])

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum && alchemy) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        }) as string[]
        
        // You can still use MetaMask for signing while using Alchemy for data
        const provider = await alchemy.config.getProvider()
        const network = await provider.getNetwork()

        setAccount(accounts[0])
        setChainId(Number(network.chainId))
        setIsConnected(true)
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    }
  }

  const disconnectWallet = () => {
    setAlchemy(null)
    setWallet(null)
    setAccount(null)
    setChainId(null)
    setIsConnected(false)
  }

  useEffect(() => {
    // Check if already connected
    if (typeof window !== 'undefined' && window.ethereum) {
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
  }, [])

  return (
    <Web3Context.Provider value={{
      alchemy,
      wallet,
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