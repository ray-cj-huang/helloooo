"use client"

import * as React from "react"
import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
  Loader2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type EmailStatus } from "@prisma/client"

import { AccountSwitcher } from "./account-switcher"
import { MailDisplay } from "./mail-display"
import { MailList } from "./mail-list"
import { Nav } from "./nav"

import { useMailStore } from "@/store/mail"
import { type MailProps, type MailNavItem } from "@/types/mail"

import { MailCompose } from "./mail-compose"

export function Mail({
  accounts,
  mails,
  defaultLayout = [20, 40, 40],
  defaultCollapsed = false,
  navCollapsedSize,
  onStatusChange,
  onReadToggle,
  onLabelsUpdate,
  onDelete,
  onSearch,
  onLabelsFilter,
  onStatusFilter,
  isLoading,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const selected = useMailStore((state) => state.selected)
  const selectedStatus = useMailStore((state) => state.selectedStatus)
  const setSelectedStatus = useMailStore((state) => state.setSelectedStatus)
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch?.(value)
  }

  const handleStatusChange = (status: EmailStatus) => {
    if (selected && onStatusChange) {
      onStatusChange(selected, status)
    }
  }

  const handleReadToggle = () => {
    if (selected && onReadToggle) {
      const mail = mails.find((m) => m.id === selected)
      if (mail) {
        onReadToggle(selected, !mail.read)
      }
    }
  }

  const handleDelete = () => {
    if (selected && onDelete) {
      onDelete(selected)
    }
  }

  const navItems: (MailNavItem & { onClick?: () => void })[] = [
    {
      title: "Inbox",
      label: selectedStatus === "INBOX" ? mails.filter((m) => !m.read).length.toString() : "",
      icon: Inbox,
      variant: selectedStatus === "INBOX" ? "default" : "ghost",
      onClick: () => {
        setSelectedStatus("INBOX")
        onStatusFilter?.("INBOX")
      },
    },
    {
      title: "Drafts",
      label: selectedStatus === "DRAFT" ? mails.filter((m) => !m.read).length.toString() : "",
      icon: File,
      variant: selectedStatus === "DRAFT" ? "default" : "ghost",
      onClick: () => {
        setSelectedStatus("DRAFT")
        onStatusFilter?.("DRAFT")
      },
    },
    {
      title: "Sent",
      label: selectedStatus === "SENT" ? mails.filter((m) => !m.read).length.toString() : "",
      icon: Send,
      variant: selectedStatus === "SENT" ? "default" : "ghost",
      onClick: () => {
        setSelectedStatus("SENT")
        onStatusFilter?.("SENT")
      },
    },
    {
      title: "Junk",
      label: selectedStatus === "JUNK" ? mails.filter((m) => !m.read).length.toString() : "",
      icon: ArchiveX,
      variant: selectedStatus === "JUNK" ? "default" : "ghost",
      onClick: () => {
        setSelectedStatus("JUNK")
        onStatusFilter?.("JUNK")
      },
    },
    {
      title: "Trash",
      label: selectedStatus === "TRASH" ? mails.filter((m) => !m.read).length.toString() : "",
      icon: Trash2,
      variant: selectedStatus === "TRASH" ? "default" : "ghost",
      onClick: () => {
        setSelectedStatus("TRASH")
        onStatusFilter?.("TRASH")
      },
    },
    {
      title: "Archive",
      label: selectedStatus === "ARCHIVE" ? mails.filter((m) => !m.read).length.toString() : "",
      icon: Archive,
      variant: selectedStatus === "ARCHIVE" ? "default" : "ghost",
      onClick: () => {
        setSelectedStatus("ARCHIVE")
        onStatusFilter?.("ARCHIVE")
      },
    },
  ]

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
            sizes
          )}`
        }}
        className="h-full max-h-[800px] items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true
            )}`
          }}
          onResize={() => {
            setIsCollapsed(false)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false
            )}`
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out"
          )}
        >
          <div
            className={cn(
              "flex h-[52px] items-center justify-center",
              isCollapsed ? "h-[52px]" : "px-2"
            )}
          >
            <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={navItems}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="all"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  All mail
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Unread
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search" 
                    className="pl-8" 
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              {isLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <MailList items={mails} />
              )}
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              {isLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <MailList items={mails.filter((item) => !item.read)} />
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60}>
              {selected && (
                <div className="flex h-[52px] items-center justify-between border-b px-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReadToggle}
                    >
                      Mark as {mails.find((m) => m.id === selected)?.read ? "unread" : "read"}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Move to
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStatusChange("INBOX")}>
                          Inbox
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("ARCHIVE")}>
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("TRASH")}>
                          Trash
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
              <MailDisplay
                mail={mails.find((item) => item.id === selected) ?? null}
                onReadToggle={onReadToggle}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
