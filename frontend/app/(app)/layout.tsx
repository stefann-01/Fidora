import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-32 mb-2">
      <Navbar />
      <Card>
        <CardContent className="overflow-y-auto">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}
