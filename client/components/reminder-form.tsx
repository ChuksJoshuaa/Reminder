"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { reminderSchema, type ReminderFormData } from "@/lib/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COMMON_TIMEZONES, getDefaultTimezone } from "@/lib/date-utils"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import type { Reminder } from "@/types"

interface ReminderFormProps {
  onSubmit: (data: ReminderFormData) => void
  isLoading?: boolean
  defaultValues?: Reminder
}

export function ReminderForm({ onSubmit, isLoading, defaultValues }: ReminderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: defaultValues
      ? {
          title: defaultValues.title,
          message: defaultValues.message,
          phoneNumber: defaultValues.phoneNumber,
          scheduledFor: new Date(defaultValues.scheduledFor).toISOString().slice(0, 16),
          timezone: defaultValues.timezone,
        }
      : {
          timezone: getDefaultTimezone(),
        },
  })

  const timezone = watch("timezone")

  useEffect(() => {
    if (!defaultValues && !timezone) {
      setValue("timezone", getDefaultTimezone())
    }
  }, [defaultValues, timezone, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Reminder Title</Label>
        <Input
          id="title"
          placeholder="Morning standup call"
          {...register("title")}
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          placeholder="This is a reminder for your morning standup meeting..."
          rows={4}
          {...register("message")}
          className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
            errors.message ? "border-destructive" : ""
          }`}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="+14155552671"
          {...register("phoneNumber")}
          className={errors.phoneNumber ? "border-destructive" : ""}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Use E.164 format (e.g., +14155552671)
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="scheduledFor">Date & Time</Label>
          <Input
            id="scheduledFor"
            type="datetime-local"
            {...register("scheduledFor")}
            className={errors.scheduledFor ? "border-destructive" : ""}
          />
          {errors.scheduledFor && (
            <p className="text-sm text-destructive">{errors.scheduledFor.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={timezone}
            onValueChange={(value) => setValue("timezone", value)}
          >
            <SelectTrigger className={errors.timezone ? "border-destructive" : ""}>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timezone && (
            <p className="text-sm text-destructive">{errors.timezone.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {defaultValues ? "Updating..." : "Creating..."}
          </>
        ) : (
          <>{defaultValues ? "Update Reminder" : "Create Reminder"}</>
        )}
      </Button>
    </form>
  )
}
