import { Evidence } from '@/app/types/db.types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface EvidenceCardProps {
  evidence: Evidence
  isExpanded: boolean
  onToggle: () => void
}

export function EvidenceCard({ evidence, isExpanded, onToggle }: EvidenceCardProps) {
  const getMetricColor = (metric: number) => {
    if (metric >= 80) return 'bg-green-100 text-green-800 border-green-200'
    if (metric >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{evidence.title}</CardTitle>
            <CardDescription className={isExpanded ? '' : 'line-clamp-1'}>
              {evidence.description}
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={`ml-3 ${getMetricColor(evidence.wellStructuredPercentage*100)}`}
          >
            {evidence.wellStructuredPercentage*100}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show More
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
} 
