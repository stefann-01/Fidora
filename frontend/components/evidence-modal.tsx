"use client"

import { analyzeEvidence } from "@/app/actions/analyze-evidence"
import { AnalysisResult } from "@/app/types/ai-service.types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const evidenceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
})

type EvidenceFormData = z.infer<typeof evidenceSchema>

export type { EvidenceFormData }

interface EvidenceModalProps {
  open: boolean
  onCloseAction: () => void
  onSubmitAction: (data: EvidenceFormData, analysisResult? : AnalysisResult) => void
}

export function EvidenceModal({ open, onCloseAction, onSubmitAction }: EvidenceModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const form = useForm<EvidenceFormData>({
    resolver: zodResolver(evidenceSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const handleSubmit = async (data: EvidenceFormData) => {
    setIsAnalyzing(true)
    
    try {
      // Use server action instead of API route
      const analysisResult = await analyzeEvidence({
        evidence: data.description,
        statement: "In two months, there has been more Private Investment spoken for, and/or committed to, than in four years of the Sleepy Joe Biden Administration — A fact that the Fake News hates talking about!",
        claimed_side: true
      })
      
      // Pass both the form data and analysis result to parent
      onSubmitAction(data, analysisResult)
      
    } catch (error) {
      console.error('AI analysis error:', error)
      // Still submit the evidence even if analysis fails
      onSubmitAction(data)
    } finally {
      setIsAnalyzing(false)
      form.reset()
      onCloseAction()
    }
  }

  const handleClose = () => {
    form.reset()
    onCloseAction()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Evidence</DialogTitle>
          <DialogDescription>
            Add supporting evidence for your post. The evidence will be analyzed for relevance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Evidence title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the evidence..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isAnalyzing}
                className="bg-newPurple-600 hover:bg-newPurple-700 text-white"
              >
                {isAnalyzing ? "Analyzing..." : "Add Evidence"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 
