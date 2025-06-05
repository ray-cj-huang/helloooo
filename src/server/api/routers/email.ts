import { z } from "zod";
import { Resend } from "resend";
import * as React from "react";
import { EmailTemplate } from "@/app/_components/email-template";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
// import { handleInboundEmail } from "@/lib/sendgrid";
// import type { InboundParseData } from "@/lib/sendgrid";

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailRouter = createTRPCRouter({
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
        attachment1: z.string(),
        attachment2: z.string(),
        attachment3: z.string(),
        attachment4: z.string(),
        attachment5: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const email = await handleInboundEmail(input as InboundParseData);
        return { success: true, email };
      } catch (error) {
        console.error('Error processing inbound email:', error);
        throw new Error('Failed to process inbound email');
      }
    }),
}); 