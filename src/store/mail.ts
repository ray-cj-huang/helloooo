import { create } from "zustand"
import type { Mail } from "@/types/mail"
import { mails } from "@/app/mail/data"

interface MailState {
  selected: Mail["id"] | null
  setSelected: (id: Mail["id"] | null) => void
}

export const useMailStore = create<MailState>()((set) => ({
  selected: mails[0]?.id ?? null,
  setSelected: (id: Mail["id"] | null) => set({ selected: id }),
})) 