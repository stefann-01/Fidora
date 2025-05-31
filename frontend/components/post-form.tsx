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
}

export function PostForm({ onCloseAction }: PostFormProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      link: "",
    },
  })

  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true)
    
    try {
      console.log("Post submitted:", { ...data, evidence })
      
      // TODO: Add actual submission logic here when backend is ready
      console.log("Claim submission simulated successfully")
      onCloseAction()
    } catch (error) {
      console.error("Error submitting post:", error)
      // You might want to show an error message to the user here
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
                      <Input placeholder="https://example.com/post" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onCloseAction}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-newPurple-600 hover:bg-newPurple-700 text-white"
                >
                  {isSubmitting ? "Submitting..." : "Submit Post"}
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
