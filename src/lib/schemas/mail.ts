import { z } from "zod"

export const mailLayoutSchema = z.array(z.number()).length(3).optional()
export const mailCollapsedSchema = z.boolean().optional()

export type MailLayout = z.infer<typeof mailLayoutSchema>
export type MailCollapsed = z.infer<typeof mailCollapsedSchema> 