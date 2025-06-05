import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavProps {
  isCollapsed: boolean
  links: {
    title: string
    label: string
    icon: LucideIcon
    variant: "default" | "ghost"
  }[]
}

export function Nav({ isCollapsed, links }: NavProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => (
          <button
            key={index}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              link.variant === "default" && "bg-accent text-accent-foreground",
              isCollapsed && "justify-center"
            )}
          >
            <link.icon className="h-4 w-4" />
            {!isCollapsed && (
              <>
                <span>{link.title}</span>
                {link.label && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {link.label}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
} 