import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex flex-col space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Application and user preferences
        </p>
      </div>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Settings className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
          <p className="text-muted-foreground text-center">
            User preferences and application settings will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}