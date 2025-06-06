import * as React from "react"
import { type Mail } from "@/types/mail"
import { useMailStore } from "@/store/mail"
import { cn } from "@/lib/utils"

interface MailListProps {
  items: Mail[]
}

export function MailList({ items }: MailListProps) {
  const selected = useMailStore((state) => state.selected)
  const setSelected = useMailStore((state) => state.setSelected)

  return (
    <div className="flex flex-col gap-2 p-4 overflow-y-auto max-h-screen">
      {items.map((item) => (
        <button
          key={item.id}
          className={cn(
            "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
            selected === item.id && "bg-muted",
            item.read && "bg-muted/50"
          )}
          onClick={() => setSelected(item.id)}
        >
          <div className="flex w-full items-center justify-between">
            <div className={cn("font-semibold", item.read && "text-muted-foreground")}>
              {item.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(item.date).toLocaleString()}
            </div>
          </div>
          <div className={cn("line-clamp-2 text-xs text-muted-foreground", item.read && "text-muted-foreground/70")}>
            {item.subject}
          </div>
          <div className="flex gap-2">
            {item.labels.map((label) => (
              <div
                key={label}
                className="rounded-full bg-muted px-2 py-1 text-xs"
              >
                {label}
              </div>
            ))}
          </div>
        </button>
      ))}
    </div>
  )
} 