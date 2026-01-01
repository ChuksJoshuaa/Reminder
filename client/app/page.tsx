"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ReminderForm } from "@/components/reminder-form"
import { ReminderCard } from "@/components/reminder-card"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeToggle } from "@/components/theme-toggle"
import { useReminders, useCreateReminder } from "@/hooks/use-reminders"
import type { ReminderFormData } from "@/lib/validation"
import type { ReminderStatus } from "@/types"
import { Plus, Search } from "lucide-react"

export default function Home() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<ReminderStatus | "all">("all")

  const { data: reminders, isLoading } = useReminders()
  const createReminder = useCreateReminder()

  const handleCreate = (data: ReminderFormData) => {
    createReminder.mutate(
      {
        title: data.title,
        message: data.message,
        phoneNumber: data.phoneNumber,
        scheduledFor: new Date(data.scheduledFor).toISOString(),
        timezone: data.timezone,
      },
      {
        onSuccess: () => setIsCreateOpen(false),
      }
    )
  }

  const filteredReminders = useMemo(() => {
    if (!reminders) return []

    return reminders
      .filter((reminder) => {
        const matchesTab = activeTab === "all" || reminder.status === activeTab
        const matchesSearch =
          searchQuery === "" ||
          reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          reminder.message.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesTab && matchesSearch
      })
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
  }, [reminders, activeTab, searchQuery])

  const counts = useMemo(() => {
    if (!reminders) return { all: 0, scheduled: 0, completed: 0, failed: 0 }

    return reminders.reduce(
      (acc, reminder) => {
        acc.all++
        acc[reminder.status]++
        return acc
      },
      { all: 0, scheduled: 0, completed: 0, failed: 0 } as Record<ReminderStatus | "all", number>
    )
  }, [reminders])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Call Me Reminder</h1>
              <p className="text-muted-foreground">
                Never miss important moments with automated phone reminders
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <ThemeToggle />
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="flex-1 sm:flex-none">
                    <Plus className="mr-2 h-4 w-4" />
                    New Reminder
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Reminder</DialogTitle>
                  </DialogHeader>
                  <ReminderForm onSubmit={handleCreate} isLoading={createReminder.isPending} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reminders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReminderStatus | "all")}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="all">
              All <span className="ml-1.5 text-xs opacity-60">({counts.all})</span>
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              Scheduled <span className="ml-1.5 text-xs opacity-60">({counts.scheduled})</span>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed <span className="ml-1.5 text-xs opacity-60">({counts.completed})</span>
            </TabsTrigger>
            <TabsTrigger value="failed">
              Failed <span className="ml-1.5 text-xs opacity-60">({counts.failed})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : filteredReminders.length === 0 ? (
              <EmptyState type={searchQuery || activeTab !== "all" ? "no-results" : "no-reminders"} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredReminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
