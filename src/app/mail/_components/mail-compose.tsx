import * as React from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Send } from "lucide-react"
import { sendEmailAction } from "@/app/actions/send-email"
import { type Editor } from "@tiptap/react"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MailComposeProps {
  to: string
  subject: string
  onSend?: () => void
}

export function MailCompose({ to, subject, onSend }: MailComposeProps) {
  const [error, setError] = React.useState<string | null>(null)
  const [isSending, setIsSending] = React.useState(false)
  const editorRef = React.useRef<Editor | null>(null)
  const [fromEmail, setFromEmail] = React.useState("ray@toma-mail.org")
  const [toEmail, setToEmail] = React.useState(to)
  const [emailSubject, setEmailSubject] = React.useState(`Re: ${subject}`)

  const handleSend = async () => {
    if (!editorRef.current) return

    setError(null)
    setIsSending(true)

    try {
      const content = editorRef.current.getHTML()
      
      // Send the email using server action
      const result = await sendEmailAction(
        toEmail,
        emailSubject,
        content,
        fromEmail
      )

      if (!result.success) {
        throw new Error(result.error ?? 'Failed to send email')
      }

      // Clear the editor after successful send
      editorRef.current.commands.setContent('')
      onSend?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {error && (
        <div className="bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="border-b p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="From email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="To email"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Subject"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <SimpleEditor onEditorReady={(editor) => {
          editorRef.current = editor
        }} />
      </div>
      <div className="border-t p-4">
        <div className="flex justify-end">
          <Button
            onClick={handleSend}
            disabled={isSending}
            size="sm"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Reply
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 