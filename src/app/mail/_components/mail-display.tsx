import * as React from "react"
import { type Mail } from "@/types/mail"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { api } from "@/trpc/react"
import { sendEmailAction } from "@/app/actions/send-email"
import { MailCompose } from "./mail-compose"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

interface MailDisplayProps {
  mail: Mail | null
  onReadToggle?: (id: string, read: boolean) => void
}

export function MailDisplay({ mail, onReadToggle }: MailDisplayProps) {
  const [error, setError] = React.useState<string | null>(null)
  const hasMarkedAsRead = React.useRef(false)

  // Mark as read when email is first displayed
  React.useEffect(() => {
    if (mail && !mail.read && onReadToggle && !hasMarkedAsRead.current) {
      hasMarkedAsRead.current = true
      onReadToggle(mail.id, true)
    }
  }, [mail?.id]) // Only depend on mail.id to prevent unnecessary updates

  // Reset the ref when mail changes
  React.useEffect(() => {
    hasMarkedAsRead.current = false
  }, [mail?.id])

  if (!mail) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No message selected
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">{mail.subject}</h2>
            <p className="text-sm text-muted-foreground">
              {mail.name} &lt;{mail.email}&gt;
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {new Date(mail.date).toLocaleString()}
          </div>
        </div>
      </div>
      {error && (
        <div className="bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={60}>
          <div className="flex-1 overflow-auto p-4">
            <div className="prose prose-sm max-w-none">
              {mail.text.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40}>
          <MailCompose to={mail.email} subject={mail.subject} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
} 