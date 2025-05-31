import { Claim, Evidence, User } from '@/app/types/db.types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6900'

export const apiService = {
  // Claim endpoints
  claims: {
    getAll: async (): Promise<Claim[]> => {
      const response = await fetch(`${API_BASE_URL}/api/claims`)
      if (!response.ok) throw new Error('Failed to fetch claims')
      return response.json()
    },
    
    getOne: async (claimId: string): Promise<Claim> => {
      const response = await fetch(`${API_BASE_URL}/api/claims/${claimId}`)
      if (!response.ok) throw new Error('Failed to fetch claim')
      return response.json()
    },
    
    create: async (claimData: Claim): Promise<Claim> => {
      const response = await fetch(`${API_BASE_URL}/api/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData)
      })
      if (!response.ok) throw new Error('Failed to create claim')
      return response.json()
    },

    createFromUrl: async (url: string): Promise<Claim> => {
      const response = await fetch(`${API_BASE_URL}/api/claims/from-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create claim from URL')
      }
      return response.json()
    },
    
    makeJury: async (claimId: string, userId: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/api/claims/${claimId}/jury`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      if (!response.ok) throw new Error('Failed to add user to jury')
    }
  },

  // User endpoints
  users: {
    getAll: async (): Promise<User[]> => {
      const response = await fetch(`${API_BASE_URL}/api/users`)
      if (!response.ok) throw new Error('Failed to fetch users')
      return response.json()
    },
    
    getOne: async (id: string): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`)
      if (!response.ok) throw new Error('Failed to fetch user')
      return response.json()
    },
    
    create: async (userData: Omit<User, 'id'>): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      if (!response.ok) throw new Error('Failed to create user')
      return response.json()
    }
  },

  // Evidence endpoints
  evidence: {
    getAll: async (): Promise<Evidence[]> => {
      const response = await fetch(`${API_BASE_URL}/api/evidence`)
      if (!response.ok) throw new Error('Failed to fetch evidence')
      return response.json()
    },
    
    getOne: async (id: string): Promise<Evidence> => {
      const response = await fetch(`${API_BASE_URL}/api/evidence/${id}`)
      if (!response.ok) throw new Error('Failed to fetch evidence')
      return response.json()
    },
    
    create: async (evidenceData: Omit<Evidence, 'id'> & {
      statement: string;
    }): Promise<Evidence> => {
      const response = await fetch(`${API_BASE_URL}/api/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: evidenceData.title,
          description: evidenceData.description,
          supportsClaim: evidenceData.supportsClaim,
          statement: evidenceData.statement,
          wellStructuredPercentage: evidenceData.wellStructuredPercentage
        })
      })

      const result = await response.json()
      
      // Handle validation errors (400 status)
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create evidence')
      }
      
      return result // Return the created evidence
    }
  },

  // Fidora blockchain endpoints
  fidora: {
    pickJurors: async (claimId: number): Promise<string[]> => {
      const response = await fetch(`${API_BASE_URL}/api/fidora/pick-jurors/${claimId}`)
      if (!response.ok) throw new Error('Failed to pick jurors')
      return response.json()
    },
    
    initiateVoting: async (claimId: number): Promise<string> => {
      const response = await fetch(`${API_BASE_URL}/api/fidora/initiate-voting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId })
      })
      if (!response.ok) throw new Error('Failed to initiate voting')
      const result = await response.json()
      return result.txHash
    }
  }
}
