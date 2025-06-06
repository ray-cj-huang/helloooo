import { Together } from "together-ai";
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/server/api/root';

if (!process.env.TOGETHER_API_KEY) {
  throw new Error("TOGETHER_API_KEY is not defined");
}

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

// Initialize tRPC client for automotive integrations
const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
      transformer: superjson,
    }),
  ],
});

export type EmailCategory = 
  | "APPOINTMENT_BOOKING"
  | "APPOINTMENT_CANCELLATION"
  | "VEHICLE_STATUS"
  | "VEHICLE_INVENTORY"
  | "VEHICLE_SERVICE"
  | "OTHER";

interface EmailContent {
  subject: string;
  text: string;
  from: string;
  name: string;
}

interface BookingDetails {
  preferredDate: string;
  service: string;
  notes: string;
}

interface CancelDetails {
  appointmentId: string;
  reason: string;
}

interface InventoryDetails {
  make: string;
  model: string;
  year: number;
}

interface ServiceDetails {
  vin: string;
  serviceType: string;
  description: string;
  preferredDate: string;
}

export async function categorizeEmail(subject: string, text: string): Promise<EmailCategory> {
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
      return "OTHER";
    }

    return category;
  } catch (error) {
    console.error("Error categorizing email:", error);
    return "OTHER";
  }
}

// Helper function to extract email from "Name <email@example.com>" format
function extractEmail(from: string): string {
  const emailRegex = /<([^>]+)>/;
  const match = emailRegex.exec(from);
  return match?.[1] ?? from;
}

export async function handleCategorizedEmail(category: EmailCategory, email: EmailContent) {
  try {
    switch (category) {
      case "APPOINTMENT_BOOKING":
        // Extract appointment details using Together AI
        const bookingPrompt = `Extract appointment details from this email:
Subject: ${email.subject}
Content: ${email.text}

Return a JSON object with these fields:
{
  "preferredDate": "YYYY-MM-DDTHH:mm:ss",
  "service": "string",
  "notes": "string"
}`;

        const bookingResponse = await together.chat.completions.create({
          messages: [{ role: "user", content: bookingPrompt }],
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          max_tokens: 200,
          temperature: 0.1,
        });

        const bookingDetails = JSON.parse(bookingResponse.choices[0]?.message?.content ?? "{}") as BookingDetails;
        
        // Call automotive integration
        await trpc.automotive.bookAppointment.mutate({
          customerName: email.name,
          email: extractEmail(email.from),
          phone: "", // Would need to extract from email
          preferredDate: bookingDetails.preferredDate,
          service: bookingDetails.service,
          notes: bookingDetails.notes,
        });
        break;

      case "APPOINTMENT_CANCELLATION":
        // Extract cancellation details
        const cancelPrompt = `Extract appointment cancellation details from this email:
Subject: ${email.subject}
Content: ${email.text}

Return a JSON object with these fields:
{
  "appointmentId": "string",
  "reason": "string"
}`;

        const cancelResponse = await together.chat.completions.create({
          messages: [{ role: "user", content: cancelPrompt }],
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          max_tokens: 200,
          temperature: 0.1,
        });

        const cancelDetails = JSON.parse(cancelResponse.choices[0]?.message?.content ?? "{}") as CancelDetails;
        
        // Call automotive integration
        await trpc.automotive.cancelAppointment.mutate({
          appointmentId: cancelDetails.appointmentId,
          reason: cancelDetails.reason,
        });
        break;

      case "VEHICLE_STATUS":
        // Extract VIN
        const statusPrompt = `Extract the VIN (Vehicle Identification Number) from this email:
Subject: ${email.subject}
Content: ${email.text}

Return ONLY the VIN if found, or an empty string.`;

        const statusResponse = await together.chat.completions.create({
          messages: [{ role: "user", content: statusPrompt }],
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          max_tokens: 50,
          temperature: 0.1,
        });

        const vin = statusResponse.choices[0]?.message?.content?.trim() ?? "";
        
        if (vin) {
          // Call automotive integration
          await trpc.automotive.checkVehicleStatus.query({ vin });
        }
        break;

      case "VEHICLE_INVENTORY":
        // Extract inventory query details
        const inventoryPrompt = `Extract vehicle search criteria from this email:
Subject: ${email.subject}
Content: ${email.text}

Return a JSON object with these fields:
{
  "make": "string",
  "model": "string",
  "year": number
}`;

        const inventoryResponse = await together.chat.completions.create({
          messages: [{ role: "user", content: inventoryPrompt }],
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          max_tokens: 200,
          temperature: 0.1,
        });

        const inventoryDetails = JSON.parse(inventoryResponse.choices[0]?.message?.content ?? "{}") as InventoryDetails;
        
        // Call automotive integration
        await trpc.automotive.checkInventory.query({
          make: inventoryDetails.make,
          model: inventoryDetails.model,
          year: inventoryDetails.year,
        });
        break;

      case "VEHICLE_SERVICE":
        // Extract service request details
        const servicePrompt = `Extract service request details from this email:
Subject: ${email.subject}
Content: ${email.text}

Return a JSON object with these fields:
{
  "vin": "string",
  "serviceType": "string",
  "description": "string",
  "preferredDate": "YYYY-MM-DDTHH:mm:ss"
}`;

        const serviceResponse = await together.chat.completions.create({
          messages: [{ role: "user", content: servicePrompt }],
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          max_tokens: 200,
          temperature: 0.1,
        });

        const serviceDetails = JSON.parse(serviceResponse.choices[0]?.message?.content ?? "{}") as ServiceDetails;
        
        // Call automotive integration
        await trpc.automotive.requestService.mutate({
          vin: serviceDetails.vin,
          serviceType: serviceDetails.serviceType,
          description: serviceDetails.description,
          preferredDate: serviceDetails.preferredDate,
        });
        break;
    }
  } catch (error) {
    console.error("Error handling categorized email:", error);
  }
} 