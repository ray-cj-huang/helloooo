import * as React from "react"
import { type Mail } from "@/types/mail"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { sendEmailAction } from "@/app/actions/send-email"

interface MailDisplayProps {
  mail: Mail | null
}

interface AutoResponseResponse {
  response: string;
}

export function MailDisplay({ mail }: MailDisplayProps) {
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleAutoResponse = async () => {
    if (!mail) return

    setIsGenerating(true)
    setError(null)

    try {
      // Generate response using Together AI
      const response = await fetch('/api/auto-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: mail.email,
          subject: mail.subject,
          text: mail.text,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate response')
      }

      const data = await response.json() as AutoResponseResponse
      
      // Send the email using server action
      const result = await sendEmailAction(
        mail.email,
        `Re: ${mail.subject}`,
        data.response
      )

      if (!result.success) {
        throw new Error(result.error ?? 'Failed to send email')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

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
          <Button
            onClick={handleAutoResponse}
            disabled={isGenerating}
            variant="outline"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Auto Response'
            )}
          </Button>
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
      <div className="flex-1 overflow-auto p-4">
        <div className="prose prose-sm max-w-none">
          {mail.text.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  )
} 