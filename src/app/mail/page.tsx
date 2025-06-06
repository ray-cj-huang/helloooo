import { cookies } from "next/headers"
import Image from "next/image"

import { Mail } from "./_components/mail"
import { mailLayoutSchema, mailCollapsedSchema } from "@/lib/schemas/mail"
import { MailProvider } from "./_components/mail-provider"

export default async function MailPage() {
  const cookieStore = await cookies()
  const layout = cookieStore.get("react-resizable-panels:layout:mail")
  const collapsed = cookieStore.get("react-resizable-panels:collapsed")

  const defaultLayout = layout ? mailLayoutSchema.parse(JSON.parse(layout.value)) : undefined
  const defaultCollapsed = collapsed ? mailCollapsedSchema.parse(JSON.parse(collapsed.value)) : undefined

  return (
    <>
      <div className="hidden flex-col md:flex h-screen mid-w-screen">
        <MailProvider
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />
      </div>
    </>
  )
}
