import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { Together } from "together-ai";

if (!process.env.TOGETHER_API_KEY) {
  throw new Error("TOGETHER_API_KEY is not defined");
}

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

const autoResponseSchema = z.object({
  email: z.string().email(),
  subject: z.string(),
  text: z.string(),
});

export const autoResponseRouter = createTRPCRouter({
  generate: publicProcedure
    .input(autoResponseSchema)
    .mutation(async ({ input }) => {
      const { email, subject, text } = input;

      const prompt = `You are a professional email assistant. Please write a concise and professional response to the following email:

From: ${email}
Subject: ${subject}
Content: ${text}

Please write a response that is:
1. Professional and courteous
2. Addresses the main points of the email
3. Maintains a helpful and positive tone
4. Is concise but complete

Response:`;

      try {
        const response = await together.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.7,
          top_k: 50,
          repetition_penalty: 1,
          stop: ["</s>", "Human:", "Assistant:"],
        });

        return {
          response: response.choices[0]?.message?.content?.trim() ?? "",
        };
      } catch (error) {
        console.error("Error generating auto-response:", error);
        throw new Error("Failed to generate auto-response");
      }
    }),
}); 