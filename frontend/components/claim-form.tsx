"use client"

import { EvidenceModal } from "@/components/evidence-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const claimSchema = z.object({
  link: z.string().url("Please enter a valid URL"),
})

type ClaimFormData = z.infer<typeof claimSchema>

interface Evidence {
  id: string
  title: string
  description: string
}

interface ClaimFormProps {
  onCloseAction: () => void
}

export function ClaimForm({ onCloseAction }: ClaimFormProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      link: "",
    },
  })

  const onSubmit = (data: ClaimFormData) => {
    console.log("Claim submitted:", { ...data, evidence })
    // Handle form submission here
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

  const removeEvidence = (id: string) => {
    setEvidence(evidence.filter((item) => item.id !== id))
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Make a Claim</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCloseAction}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Claim Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/claim" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Evidence</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEvidenceModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Evidence
                  </Button>
                </div>

                {evidence.length > 0 && (
                  <div className="space-y-2">
                    {evidence.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEvidence(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onCloseAction}>
                  Cancel
                </Button>
                <Button type="submit">Submit Claim</Button>
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