import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import Together from "together-ai";
import { TogetherRequestSchema, TogetherResponseSchema } from "@/types/together";

if (!process.env.TOGETHER_API_KEY) {
  throw new Error("TOGETHER_API_KEY is not defined");
}

const together = new Together();

export const togetherRouter = createTRPCRouter({
  chat: publicProcedure
    .input(TogetherRequestSchema)
    .mutation(async ({ input }) => {
      const { prompt, model } = input;

      const response = await together.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return TogetherResponseSchema.parse(response);
    }),
}); 