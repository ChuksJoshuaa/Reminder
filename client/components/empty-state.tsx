import { Bell, Search } from "lucide-react"

interface EmptyStateProps {
  type: "no-reminders" | "no-results"
}

export function EmptyState({ type }: EmptyStateProps) {
  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Search className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No reminders found</h3>
        <p className="text-muted-foreground max-w-md">
          No reminders match your search or filter criteria. Try adjusting your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-primary/10 p-6 mb-4">
        <Bell className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No reminders yet</h3>
      <p className="text-muted-foreground max-w-md">
        Get started by creating your first reminder. We&apos;ll call you at the scheduled time with your message.
      </p>
    </div>
  )
}
