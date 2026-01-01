import { format, formatDistanceToNow, isPast, isFuture } from "date-fns"
import { formatInTimeZone, toZonedTime } from "date-fns-tz"

export function formatDateTime(date: string | Date, timeZone?: string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  if (timeZone) {
    return formatInTimeZone(dateObj, timeZone, "PPpp")
  }
  return format(dateObj, "PPpp")
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

export function getTimeRemaining(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date

  if (isPast(dateObj)) {
    return "Overdue"
  }

  return formatDistanceToNow(dateObj, { addSuffix: false })
}

export function isReminderDue(scheduledFor: string): boolean {
  return isPast(new Date(scheduledFor))
}

export function isValidFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return isFuture(dateObj)
}

export function convertToUTC(date: Date, timeZone: string): Date {
  const zonedTime = toZonedTime(date, timeZone)
  return zonedTime
}

export const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)" },
]

export function getDefaultTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
