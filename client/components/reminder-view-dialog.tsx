"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Reminder } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { Calendar, Clock, Phone, MessageSquare, Globe } from "lucide-react"

interface ReminderViewDialogProps {
  reminder: Reminder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReminderViewDialog({ reminder, open, onOpenChange }: ReminderViewDialogProps) {
  if (!reminder) return null

  const scheduledDate = new Date(reminder.scheduledFor)
  const statusColors = {
    scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    failed: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{reminder.title}</span>
            <Badge className={statusColors[reminder.status]} variant="outline">
              {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Message</p>
                <p className="text-sm mt-1">{reminder.message}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                <p className="text-sm mt-1 font-mono">{reminder.phoneNumber}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Scheduled Date</p>
                  <p className="text-sm mt-1">
                    {scheduledDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Time</p>
                  <p className="text-sm mt-1">
                    {scheduledDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Timezone</p>
                <p className="text-sm mt-1">{reminder.timezone}</p>
              </div>
            </div>
          </div>

          {reminder.status === "scheduled" && scheduledDate > new Date() && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                Reminder will trigger{" "}
                <span className="font-medium text-foreground">
                  {formatDistanceToNow(scheduledDate, { addSuffix: true })}
                </span>
              </p>
            </div>
          )}

          <div className="pt-2 border-t">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Created {formatDistanceToNow(new Date(reminder.createdAt), { addSuffix: true })}</span>
              <span>Updated {formatDistanceToNow(new Date(reminder.updatedAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
