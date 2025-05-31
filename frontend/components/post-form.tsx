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

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      link: "",
    },
  })

  const onSubmit = (data: PostFormData) => {
    console.log("Post submitted:", { ...data, evidence })
    
    onCloseAction()
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Make a Post</CardTitle>
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
                <Button type="submit">Submit Post</Button>
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
