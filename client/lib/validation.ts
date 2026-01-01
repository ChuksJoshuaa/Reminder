import { z } from "zod"

const phoneRegex = /^\+[1-9]\d{1,14}$/

export const reminderSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  message: z.string().min(1, "Message is required").max(500, "Message must be less than 500 characters"),
  phoneNumber: z.string().regex(phoneRegex, "Phone number must be in E.164 format (e.g., +18263349907)"),
  scheduledFor: z.string().min(1, "Date and time are required"),
  timezone: z.string().min(1, "Timezone is required"),
})

export type ReminderFormData = z.infer<typeof reminderSchema>

export function validatePhoneNumber(phone: string): boolean {
  return phoneRegex.test(phone)
}

export function formatPhoneNumber(phone: string): string {
  if (!phone.startsWith("+")) {
    return phone
  }

  const cleaned = phone.replace(/\D/g, "")

  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }

  return phone
}

export function maskPhoneNumber(phone: string): string {
  if (phone.length < 4) return phone
  const lastFour = phone.slice(-4)
  const masked = "*".repeat(phone.length - 4)
  return masked + lastFour
}
