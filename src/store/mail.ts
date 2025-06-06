import { create } from "zustand"
import type { Mail } from "@/types/mail"
import { mails } from "@/app/mail/data"
import { type EmailStatus } from "@prisma/client"

interface MailState {
  selected: Mail["id"] | null
  setSelected: (id: Mail["id"] | null) => void
  selectedStatus: EmailStatus
  setSelectedStatus: (status: EmailStatus) => void
  search: string
  setSearch: (search: string) => void
  selectedLabels: string[]
  setSelectedLabels: (labels: string[]) => void
}

export const useMailStore = create<MailState>()((set) => ({
  selected: mails[0]?.id ?? null,
  setSelected: (id: Mail["id"] | null) => set({ selected: id }),
  selectedStatus: "INBOX" as EmailStatus,
  setSelectedStatus: (status: EmailStatus) => set({ selectedStatus: status }),
  search: "",
  setSearch: (search: string) => set({ search }),
  selectedLabels: [],
  setSelectedLabels: (labels: string[]) => set({ selectedLabels: labels }),
})) 