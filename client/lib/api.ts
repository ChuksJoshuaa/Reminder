import axios from "axios"
import type { Reminder, CreateReminderInput, UpdateReminderInput, CallLog } from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const reminderApi = {
  getAll: async (): Promise<Reminder[]> => {
    const { data } = await api.get<Reminder[]>("/reminders")
    return data
  },

  getById: async (id: string): Promise<Reminder> => {
    const { data } = await api.get<Reminder>(`/reminders/${id}`)
    return data
  },

  create: async (input: CreateReminderInput): Promise<Reminder> => {
    const { data } = await api.post<Reminder>("/reminders", input)
    return data
  },

  update: async (id: string, input: UpdateReminderInput): Promise<Reminder> => {
    const { data } = await api.put<Reminder>(`/reminders/${id}`, input)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/reminders/${id}`)
  },

  getCallLogs: async (id: string): Promise<CallLog[]> => {
    const { data } = await api.get<CallLog[]>(`/reminders/${id}/call-logs`)
    return data
  },

  snooze: async (id: string, minutes: number): Promise<Reminder> => {
    const { data } = await api.post<Reminder>(`/reminders/${id}/snooze`, { minutes })
    return data
  },
}
