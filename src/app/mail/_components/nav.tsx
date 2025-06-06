import * as React from "react"
import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { type MailNavItem } from "@/types/mail"

interface NavProps extends React.HTMLAttributes<HTMLElement> {
  isCollapsed: boolean
  links: (MailNavItem & { onClick?: () => void })[]
}

export function Nav({ isCollapsed, links, className, ...props }: NavProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className={cn(
        "group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2",
        className
      )}
      {...props}
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) =>
          isCollapsed ? (
            <Button
              key={index}
              asChild
              variant={link.variant}
              size="icon"
              className="h-9 w-9"
              onClick={link.onClick}
            >
              <a>
                <link.icon className="h-4 w-4" />
                <span className="sr-only">{link.title}</span>
              </a>
            </Button>
          ) : (
            <Button
              key={index}
              asChild
              variant={link.variant}
              className="justify-start"
              onClick={link.onClick}
            >
              <a>
                <link.icon className="mr-2 h-4 w-4" />
                {link.title}
                {link.label && (
                  <span
                    className={cn(
                      "ml-auto",
                      link.variant === "default" &&
                        "text-background dark:text-white"
                    )}
                  >
                    {link.label}
                  </span>
                )}
              </a>
            </Button>
          )
        )}
      </nav>
    </div>
  )
} 