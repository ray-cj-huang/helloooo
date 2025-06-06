import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { Together } from "together-ai";

if (!process.env.TOGETHER_API_KEY) {
  throw new Error("TOGETHER_API_KEY is not defined");
}

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

const emailCategorySchema = z.object({
  subject: z.string(),
  text: z.string(),
});

export type EmailCategory = 
  | "APPOINTMENT_BOOKING"
  | "APPOINTMENT_CANCELLATION"
  | "VEHICLE_STATUS"
  | "VEHICLE_INVENTORY"
  | "VEHICLE_SERVICE"
  | "OTHER";

export const emailCategoryRouter = createTRPCRouter({
  categorize: publicProcedure
    .input(emailCategorySchema)
    .mutation(async ({ input }) => {
      const { subject, text } = input;

      const prompt = `You are an email categorization assistant. Please analyze the following email and categorize it into ONE of these categories:
- APPOINTMENT_BOOKING: For emails about scheduling or booking appointments
- APPOINTMENT_CANCELLATION: For emails about cancelling or rescheduling appointments
- VEHICLE_STATUS: For emails asking about the status of a vehicle (repair, maintenance, etc.)
- VEHICLE_INVENTORY: For emails asking about available vehicles or inventory
- VEHICLE_SERVICE: For emails asking about vehicle services, maintenance, or repairs
- OTHER: For any other type of email

Email Subject: ${subject}
Email Content: ${text}

Respond with ONLY the category name in UPPERCASE, nothing else.`;

      try {
        const response = await together.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          max_tokens: 50,
          temperature: 0.1, // Low temperature for more consistent categorization
          top_p: 0.1,
          top_k: 10,
          repetition_penalty: 1,
          stop: ["</s>", "Human:", "Assistant:"],
        });

        const category = response.choices[0]?.message?.content?.trim() as EmailCategory;
        
        // Validate the response is one of our expected categories
        if (!["APPOINTMENT_BOOKING", "APPOINTMENT_CANCELLATION", "VEHICLE_STATUS", "VEHICLE_INVENTORY", "VEHICLE_SERVICE", "OTHER"].includes(category)) {
          return { category: "OTHER" as EmailCategory };
        }

        return { category };
      } catch (error) {
        console.error("Error categorizing email:", error);
        throw new Error("Failed to categorize email");
      }
    }),
}); 