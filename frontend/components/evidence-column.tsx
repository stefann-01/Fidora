'use client'

import { Evidence } from '@/app/types/db.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiService } from '@/services/api.service'
import Fuse from 'fuse.js'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EvidenceCard } from './evidence-card'
import { EvidenceFormData, EvidenceModal } from './evidence-modal'
interface EvidenceColumnProps {
  title: string
  evidence: Evidence[]
  searchPlaceholder: string
  emptyMessage: string
  claimStatement?: string
  onEvidenceCreated?: (evidence: Evidence) => void
}

export function EvidenceColumn({ 
  title, 
  evidence, 
  searchPlaceholder, 
  emptyMessage,
  claimStatement,
  onEvidenceCreated
}: EvidenceColumnProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false)

  
  const fuse = useMemo(() => {
    return new Fuse(evidence, {
      keys: ['title', 'description'],
      threshold: 0.3,
      includeScore: true
    })
  }, [evidence])

  
  const filteredEvidence = useMemo(() => {
    if (!searchQuery.trim()) return evidence
    
    const results = fuse.search(searchQuery)
    return results.map(result => result.item)
  }, [searchQuery, fuse, evidence])

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedCards(newExpanded)
  }

  const handleEvidenceSubmit = async (data: EvidenceFormData) => {
    if (!claimStatement) {
      console.error('Claim statement is required for evidence validation')
      return
    }
    
    try {
      // Determine if this evidence supports the claim based on the column
      const supportsClaim = title.toLowerCase().includes('support')
      
      const evidenceData = {
        title: data.title,
        description: data.description,
        supportsClaim,
        wellStructuredPercentage: 0,
        evidenceText: data.description, // Use description as evidence text
        statement: claimStatement
      }
      
      const result = await apiService.evidence.create(evidenceData)
      
      // Check if the result is an error
      if ('error' in result) {
        console.error('Evidence validation failed', {
          description: result.error
        })
        return
      }
      
      // Success - evidence was created
      console.log('Evidence created successfully', {
        description: 'Your evidence has been validated and added to the claim.'
      })
      
      // Call the callback to refresh the evidence list
      if (onEvidenceCreated) {
        onEvidenceCreated(result)
      }
      
      setIsEvidenceModalOpen(false)
      
    } catch (error) {
      console.error('Error creating evidence:', error)
      console.error('Failed to create evidence', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    }
  }

  return (
    <div className="flex-1 space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          
          {/* Submit Evidence Button */}
          <Button 
            onClick={() => setIsEvidenceModalOpen(true)}
            className="bg-newPurple-600 hover:bg-newPurple-700 text-white"
          >
            Submit Evidence
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Evidence Cards */}
      <div className="space-y-2">
        {filteredEvidence.length > 0 ? (
          filteredEvidence.map((item, index) => (
            <EvidenceCard
              key={`${item.title}-${index}`}
              evidence={item}
              isExpanded={expandedCards.has(index)}
              onToggle={() => toggleCard(index)}
            />
          ))
        ) : (
          <Card className="w-full">
            <CardContent className="flex items-center justify-center py-6">
              <p className="text-gray-500">{emptyMessage}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Evidence Modal */}
      <EvidenceModal
        open={isEvidenceModalOpen}
        onCloseAction={() => setIsEvidenceModalOpen(false)}
        onSubmitAction={handleEvidenceSubmit}
      />
    </div>
  )
} 
