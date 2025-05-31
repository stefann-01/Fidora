"use client"

import { EvidenceModal } from "@/components/evidence-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { apiService } from "@/services/api.service"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const postSchema = z.object({
  link: z.string().url("Please enter a valid URL"),
})

type PostFormData = z.infer<typeof postSchema>

interface Evidence {
  id: string
  title: string
  description: string
}

interface PostFormProps {
  onCloseAction: () => void
  onSuccess?: () => void
}

export function PostForm({ onCloseAction, onSuccess }: PostFormProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      link: "",
    },
  })

  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const claim = await apiService.claims.createFromUrl(data.link)
      console.log("Claim created successfully:", claim)
      onSuccess?.()
    } catch (error) {
      console.error("Error submitting post:", error)
      setError(error instanceof Error ? error.message : "Failed to create claim")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddEvidence = (newEvidence: Omit<Evidence, "id">) => {
    const evidenceWithId = {
      ...newEvidence,
      id: Date.now().toString(),
    }
    setEvidence([...evidence, evidenceWithId])
    setShowEvidenceModal(false)
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Make a Post</CardTitle>
          <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
            <p className="font-medium text-blue-800 mb-1">How it works:</p>
            <p>To make a post, you need to stake <strong>0.02 ETH</strong>. Your stake will be returned when voting finishes. However, if your case doesn&apos;t gain sufficient voting traction, the stake will be used to compensate jurors for their participation.</p>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="https://x.com/username/status/123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onCloseAction}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-newPurple-600 hover:bg-newPurple-700 text-white"
                >
                  {isSubmitting ? "Creating Claim..." : "Submit Post"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <EvidenceModal
        open={showEvidenceModal}
        onCloseAction={() => setShowEvidenceModal(false)}
        onSubmitAction={handleAddEvidence}
      />
    </>
  )
} 
