import type { LucideIcon } from "lucide-react"
import { type EmailStatus } from "@prisma/client"

export interface Mail {
  id: string
  name: string
  email: string
  subject: string
  text: string
  date: string
  read: boolean
  labels: string[]
}

export interface MailAccount {
  label: string
  email: string
  icon: React.ReactNode
}

export interface MailNavItem {
  title: string
  label: string
  icon: LucideIcon
  variant: "default" | "ghost"
}

export interface MailProps {
  accounts: MailAccount[]
  mails: Mail[]
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
  onStatusChange?: (id: string, status: EmailStatus) => void
  onReadToggle?: (id: string, read: boolean) => void
  onLabelsUpdate?: (id: string, labels: string[]) => void
  onDelete?: (id: string) => void
  onSearch?: (search: string) => void
  onLabelsFilter?: (labels: string[]) => void
  onStatusFilter?: (status: EmailStatus) => void
  isLoading?: boolean
} 