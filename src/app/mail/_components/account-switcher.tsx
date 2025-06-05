import * as React from "react"
import { type MailAccount } from "@/types/mail"

interface AccountSwitcherProps {
  isCollapsed: boolean
  accounts: MailAccount[]
}

export function AccountSwitcher({ isCollapsed, accounts }: AccountSwitcherProps) {
  const [selectedAccount, setSelectedAccount] = React.useState<MailAccount | null>(
    accounts[0] ?? null
  )

  if (!selectedAccount) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {!isCollapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{selectedAccount.label}</span>
          <span className="text-xs text-muted-foreground">
            {selectedAccount.email}
          </span>
        </div>
      )}
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
        {selectedAccount.icon}
      </div>
    </div>
  )
} 