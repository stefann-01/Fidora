import { Claim } from '@/app/types/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface TweetCardProps {
  tweetData: Claim
}

export function TweetCard({ tweetData }: TweetCardProps) {
  
  const supportingEvidence = tweetData.evidence.filter(item => item.wellStructuredPercentage >= 70)
  const contradictingEvidence = tweetData.evidence.filter(item => item.wellStructuredPercentage < 70)
  
  const averageSupporting = supportingEvidence.length > 0 
    ? Math.round(supportingEvidence.reduce((sum, item) => sum + item.wellStructuredPercentage, 0) / supportingEvidence.length)
    : 0
  
  const averageContradicting = contradictingEvidence.length > 0
    ? Math.round(contradictingEvidence.reduce((sum, item) => sum + item.wellStructuredPercentage, 0) / contradictingEvidence.length)
    : 0

  const getMetricColor = (metric: number) => {
    if (metric >= 80) return 'bg-green-100 text-green-800 border-green-200'
    if (metric >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2">
              Post ID: {tweetData.claimId}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <a 
                href={tweetData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Tweet
              </a>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Evidence Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">Supporting Evidence</span>
              <Badge variant="outline" className={getMetricColor(averageSupporting)}>
                {supportingEvidence.length} items
              </Badge>
            </div>
            {averageSupporting > 0 && (
              <div className="text-xs text-gray-600">
                Avg. confidence: {averageSupporting}%
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-700">Contradicting Evidence</span>
              <Badge variant="outline" className={getMetricColor(averageContradicting)}>
                {contradictingEvidence.length} items
              </Badge>
            </div>
            {averageContradicting > 0 && (
              <div className="text-xs text-gray-600">
                Avg. confidence: {averageContradicting}%
              </div>
            )}
          </div>
        </div>

        {/* Top Evidence Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Top Evidence:</h4>
          <div className="space-y-1">
            {tweetData.evidence
              .sort((a, b) => b.wellStructuredPercentage - a.wellStructuredPercentage)
              .slice(0, 2)
              .map((evidence, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1 mr-2">{evidence.title}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getMetricColor(evidence.wellStructuredPercentage)}`}
                  >
                    {evidence.wellStructuredPercentage}%
                  </Badge>
                </div>
              ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link href={`/${tweetData.claimId}`}>
            <Button variant="outline" className="w-full">
              View Full Analysis & Vote
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}   
