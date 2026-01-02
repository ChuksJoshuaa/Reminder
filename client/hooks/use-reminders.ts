import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { reminderApi } from "@/lib/api"
import type { CreateReminderInput, UpdateReminderInput } from "@/types"
import { toast } from "sonner"

const QUERY_KEY = ["reminders"]

export function useReminders() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: reminderApi.getAll,
    refetchInterval: 10000,
  })
}

export function useReminder(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => reminderApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateReminderInput) => reminderApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success("Reminder created successfully")
    },
    onError: (error) => {
      toast.error("Failed to create reminder")
      console.error("Create reminder error:", error)
    },
  })
}

export function useUpdateReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateReminderInput }) =>
      reminderApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success("Reminder updated successfully")
    },
    onError: (error) => {
      toast.error("Failed to update reminder")
      console.error("Update reminder error:", error)
    },
  })
}

export function useDeleteReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reminderApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success("Reminder deleted successfully")
    },
    onError: (error) => {
      toast.error("Failed to delete reminder")
      console.error("Delete reminder error:", error)
    },
  })
}

export function useCallLogs(reminderId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, reminderId, "call-logs"],
    queryFn: () => reminderApi.getCallLogs(reminderId),
    enabled: !!reminderId,
  })
}

export function useSnoozeReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) =>
      reminderApi.snooze(id, minutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success("Reminder snoozed successfully")
    },
    onError: (error) => {
      toast.error("Failed to snooze reminder")
      console.error("Snooze reminder error:", error)
    },
  })
}
