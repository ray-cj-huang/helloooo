"use client"

import Image from "next/image"

import { api } from "@/trpc/react"
import { Mail } from "./mail"
import { type MailLayout, type MailCollapsed } from "@/lib/schemas/mail"
import { type Mail as MailType } from "@/types/mail"
import { type Email, type EmailStatus } from "@prisma/client"
import { useMailStore } from "@/store/mail"

interface MailProviderProps {
  defaultLayout?: MailLayout
  defaultCollapsed?: MailCollapsed
  navCollapsedSize: number
}

export function MailProvider({
  defaultLayout,
  defaultCollapsed,
  navCollapsedSize,
}: MailProviderProps) {
  const { search, setSearch, selectedLabels, setSelectedLabels, selectedStatus, setSelectedStatus } = useMailStore()

  const { data, isLoading, refetch } = api.email.getAll.useQuery({
    status: selectedStatus,
    limit: 50,
    search: search || undefined,
    labels: selectedLabels.length > 0 ? selectedLabels : undefined,
  })

  const updateStatus = api.email.updateStatus.useMutation({
    onSuccess: () => refetch(),
  })

  const toggleRead = api.email.toggleRead.useMutation({
    onSuccess: () => refetch(),
  })

  const updateLabels = api.email.updateLabels.useMutation({
    onSuccess: () => refetch(),
  })

  const deleteEmail = api.email.delete.useMutation({
    onSuccess: () => refetch(),
  })

  const accounts = [
    {
      label: "Ray Huang",
      email: "ray@toma-mail.org",
      icon: <Image src="/logo.jpeg" alt="LOGO" width={48} height={48} />,
    }
  ]

  const mails: MailType[] = data?.items.map((email: Email) => ({
    id: email.id,
    name: email.name,
    email: email.email,
    subject: email.subject,
    text: email.text,
    date: email.date.toISOString(),
    read: email.read,
    labels: email.labels,
  })) ?? []

  const handleStatusChange = (id: string, status: EmailStatus) => {
    updateStatus.mutate({ id, status })
  }

  const handleReadToggle = (id: string, read: boolean) => {
    toggleRead.mutate({ id, read })
  }

  const handleLabelsUpdate = (id: string, labels: string[]) => {
    updateLabels.mutate({ id, labels })
  }

  const handleDelete = (id: string) => {
    deleteEmail.mutate({ id })
  }

  return (
    <Mail
      accounts={accounts}
      mails={mails}
      defaultLayout={defaultLayout}
      defaultCollapsed={defaultCollapsed}
      navCollapsedSize={navCollapsedSize}
      onStatusChange={handleStatusChange}
      onReadToggle={handleReadToggle}
      onLabelsUpdate={handleLabelsUpdate}
      onDelete={handleDelete}
      onSearch={setSearch}
      onLabelsFilter={setSelectedLabels}
      onStatusFilter={setSelectedStatus}
      isLoading={isLoading}
    />
  )
} 