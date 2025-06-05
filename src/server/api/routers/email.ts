import { z } from "zod";
import { Resend } from "resend";
import * as React from "react";
import { EmailTemplate } from "@/app/_components/email-template";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

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
}); 