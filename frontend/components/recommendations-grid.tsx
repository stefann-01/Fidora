import { Claim } from '@/app/types/db.types'
import { TweetGrid } from "@/components/tweet-grid"
import { Button } from "@/components/ui/button"
import { apiService } from '@/services/api.service'
import { useEffect, useState } from 'react'
import { useWeb3 } from '@/contexts/Web3Context'

export function RecommendationsGrid() {
  const [recommendations, setRecommendations] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { account: address } = useWeb3()

  const fetchRecommendations = async () => {
    if (!address) return
    
    try {
      setLoading(true)
      const data = await apiService.recommendations.getForUser(address)
      setRecommendations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (address) {
      fetchRecommendations()
    }
  }, [address])

  if (!address) {
    return null
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading recommendations...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">For You</h2>
        <Button 
          onClick={fetchRecommendations}
          variant="outline"
          className="text-sm"
        >
          Refresh Recommendations
        </Button>
      </div>
      {recommendations.length > 0 ? (
        <TweetGrid tweets={recommendations} />
      ) : (
        <div className="text-center py-8 text-gray-500">
          No recommendations yet. Make some posts or interact with others to get personalized recommendations!
        </div>
      )}
    </div>
  )
} 