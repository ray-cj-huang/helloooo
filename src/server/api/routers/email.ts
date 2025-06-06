import { z } from "zod";
import { Resend } from "resend";
import * as React from "react";
import { EmailTemplate } from "@/app/_components/email-template";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { type Email, EmailStatus } from "@prisma/client";
import { type EmailCategory } from "./email-category";
import { categorizeEmail, handleCategorizedEmail } from "@/lib/email-category";
// import { handleInboundEmail } from "@/lib/sendgrid";
// import type { InboundParseData } from "@/lib/sendgrid";

const resend = new Resend(process.env.RESEND_API_KEY);

// Types for SendGrid inbound parse data
interface Charsets {
  to?: string;
  from?: string;
  subject?: string;
  text?: string;
  html?: string;
}

interface Envelope {
  to: string[];
  from: string;
}

interface AttachmentInfo {
  filename: string;
  type: string;
  size: number;
  content_id?: string;
}

export const emailRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        status: z.enum(["INBOX", "TRASH", "JUNK", "DRAFT", "ARCHIVE", "SENT"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        search: z.string().optional(),
        labels: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input }) => {
      const { status, limit, cursor, search, labels } = input;

      const items = await db.email.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          AND: [
            status ? { status } : {},
            search ? {
              OR: [
                { subject: { contains: search, mode: "insensitive" } },
                { text: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            } : {},
            labels && labels.length > 0 ? {
              labels: {
                hasSome: labels,
              },
            } : {},
          ],
        },
        orderBy: { date: "desc" },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        if (nextItem) {
          nextCursor = nextItem.id;
        }
      }

      return {
        items,
        nextCursor,
      };
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["INBOX", "TRASH", "JUNK", "DRAFT", "ARCHIVE", "SENT"]),
      })
    )
    .mutation(async ({ input }) => {
      const { id, status } = input;
      return db.email.update({
        where: { id },
        data: { status },
      });
    }),

  toggleRead: publicProcedure
    .input(
      z.object({
        id: z.string(),
        read: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, read } = input;
      return db.email.update({
        where: { id },
        data: { read },
      });
    }),

  updateLabels: publicProcedure
    .input(
      z.object({
        id: z.string(),
        labels: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const { id, labels } = input;
      return db.email.update({
        where: { id },
        data: { labels },
      });
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { id } = input;
      return db.email.delete({
        where: { id },
      });
    }),

  send: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await resend.emails.send({
        from: 'Toma <toma@goldilocks.run>',
        to: ['rayhuang.cj@gmail.com'],
        subject: 'Hello world',
        react: React.createElement(EmailTemplate, { firstName: 'John' }),
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }),

  inboundEmail: publicProcedure
    .input(
      z.object({
        from: z.string(),
        to: z.string(),
        subject: z.string(),
        text: z.string(),
        html: z.string(),
        attachments: z.number(),
        charsets: z.string(),
        envelope: z.string(),
        attachments_info: z.string(),
        headers: z.string(),
        dkim: z.string(),
        SPF: z.string(),
        spam_score: z.string(),
        spam_report: z.string(),
        attachment1: z.string().optional(),
        attachment2: z.string().optional(),
        attachment3: z.string().optional(),
        attachment4: z.string().optional(),
        attachment5: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Parse the charsets JSON string
        const charsets = JSON.parse(input.charsets) as Charsets;
        
        // Parse the envelope JSON string
        const envelope = JSON.parse(input.envelope) as Envelope;
        
        // Parse the headers JSON string
        const headers = JSON.parse(input.headers) as Record<string, string>;
        
        // Parse the attachments_info JSON string
        const attachmentsInfo = JSON.parse(input.attachments_info) as AttachmentInfo[];

        // Extract name from the from field (e.g., "John Doe <john@example.com>" -> "John Doe")
        const nameRegex = /^([^<]+)\s*</;
        const nameMatch = nameRegex.exec(input.from);
        const name = nameMatch?.[1]?.trim() ?? input.from;

        // Categorize the email
        const category = await categorizeEmail(input.subject, input.text);

        // Create email record in database with category as a label
        const email = await db.email.create({
          data: {
            name,
            email: input.from,
            subject: input.subject,
            text: input.text,
            status: "INBOX" as const,
            read: false,
            date: new Date(),
            labels: [category],
          },
        });

        // Handle the categorized email (this will trigger appropriate automotive integrations)
        await handleCategorizedEmail(category, {
          subject: input.subject,
          text: input.text,
          from: input.from,
          name,
        });

        // Return success response
        return { success: true, email };
      } catch (error) {
        console.error('Error processing inbound email:', error);
        throw new Error('Failed to process inbound email');
      }
    }),
}); 