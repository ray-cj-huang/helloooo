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
    <div className="flex flex-col gap-2 p-4">
      {items.map((item) => (
        <button
          key={item.id}
          className={cn(
            "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
            selected === item.id && "bg-muted"
          )}
          onClick={() => setSelected(item.id)}
        >
          <div className="flex w-full items-center justify-between">
            <div className="font-semibold">{item.name}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(item.date).toLocaleString()}
            </div>
          </div>
          <div className="line-clamp-2 text-xs text-muted-foreground">
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