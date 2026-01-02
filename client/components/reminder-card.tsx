"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Phone, Clock, Calendar, Eye, Timer } from "lucide-react"
import type { Reminder, ReminderStatus } from "@/types"
import { formatDateTime, getTimeRemaining, isReminderDue } from "@/lib/date-utils"
import { maskPhoneNumber } from "@/lib/validation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { ReminderForm } from "./reminder-form"
import { ReminderViewDialog } from "./reminder-view-dialog"
import { useUpdateReminder, useDeleteReminder, useSnoozeReminder } from "@/hooks/use-reminders"
import type { ReminderFormData } from "@/lib/validation"
import { useState } from "react"

interface ReminderCardProps {
  reminder: Reminder
}

const statusConfig: Record<ReminderStatus, { variant: "default" | "success" | "destructive", label: string }> = {
  scheduled: { variant: "default", label: "Scheduled" },
  completed: { variant: "success", label: "Completed" },
  failed: { variant: "destructive", label: "Failed" },
}

export function ReminderCard({ reminder }: ReminderCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false)
  const updateReminder = useUpdateReminder()
  const deleteReminder = useDeleteReminder()
  const snoozeReminder = useSnoozeReminder()

  const handleUpdate = (data: ReminderFormData) => {
    updateReminder.mutate(
      {
        id: reminder.id,
        input: {
          title: data.title,
          message: data.message,
          phoneNumber: data.phoneNumber,
          scheduledFor: data.scheduledFor,
          timezone: data.timezone,
        },
      },
      {
        onSuccess: () => setIsEditOpen(false),
      }
    )
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      deleteReminder.mutate(reminder.id)
    }
  }

  const handleSnooze = (minutes: number) => {
    snoozeReminder.mutate(
      { id: reminder.id, minutes },
      { onSuccess: () => setIsSnoozeOpen(false) }
    )
  }

  const isDue = isReminderDue(reminder.scheduledFor)
  const timeRemaining = getTimeRemaining(reminder.scheduledFor)
  const config = statusConfig[reminder.status]
  const canSnooze = reminder.status === "failed" || reminder.status === "completed"

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{reminder.title}</h3>
            <Badge variant={config.variant} className="mt-2">
              {config.label}
            </Badge>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => setIsViewOpen(true)}>
              <Eye className="h-4 w-4" />
            </Button>
            {canSnooze && (
              <Button variant="ghost" size="icon" onClick={() => setIsSnoozeOpen(true)}>
                <Timer className="h-4 w-4" />
              </Button>
            )}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" disabled={reminder.status !== "scheduled"}>
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Reminder</DialogTitle>
                </DialogHeader>
                <ReminderForm
                  onSubmit={handleUpdate}
                  isLoading={updateReminder.isPending}
                  defaultValues={reminder}
                />
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={handleDelete} aria-label="Delete">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{reminder.message}</p>

        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{maskPhoneNumber(reminder.phoneNumber)}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDateTime(reminder.scheduledFor, reminder.timezone)}</span>
          </div>

          {reminder.status === "scheduled" && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className={isDue ? "text-destructive font-medium" : "text-primary font-medium"}>
                {isDue ? "Overdue" : `in ${timeRemaining}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <ReminderViewDialog
        reminder={reminder}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />

      <Dialog open={isSnoozeOpen} onOpenChange={setIsSnoozeOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Snooze Reminder</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            <Button
              variant="outline"
              onClick={() => handleSnooze(5)}
              disabled={snoozeReminder.isPending}
            >
              5 minutes
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSnooze(15)}
              disabled={snoozeReminder.isPending}
            >
              15 minutes
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSnooze(30)}
              disabled={snoozeReminder.isPending}
            >
              30 minutes
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSnooze(60)}
              disabled={snoozeReminder.isPending}
            >
              1 hour
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsSnoozeOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
