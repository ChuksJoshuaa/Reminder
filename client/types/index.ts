export type ReminderStatus = "scheduled" | "completed" | "failed"

export interface Reminder {
  id: string
  title: string
  message: string
  phoneNumber: string
  scheduledFor: string
  timezone: string
  status: ReminderStatus
  createdAt: string
  updatedAt: string
}

export interface CreateReminderInput {
  title: string
  message: string
  phoneNumber: string
  scheduledFor: string
  timezone: string
}

export interface UpdateReminderInput {
  title?: string
  message?: string
  phoneNumber?: string
  scheduledFor?: string
  timezone?: string
  status?: ReminderStatus
}

export interface ReminderFilters {
  status?: ReminderStatus | "all"
  search?: string
}

export type CallStatus = "success" | "failed"

export interface CallLog {
  id: string
  reminderId: string
  attemptedAt: string
  status: CallStatus
  responseData: string | null
  errorMessage: string | null
}
