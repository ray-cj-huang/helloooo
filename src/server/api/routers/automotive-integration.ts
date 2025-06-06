import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

// Mock data for demonstration
const mockAppointments = [
  { id: "1", customerName: "John Doe", date: "2024-03-20T10:00:00", service: "Oil Change" },
  { id: "2", customerName: "Jane Smith", date: "2024-03-21T14:30:00", service: "Tire Rotation" },
];

const mockInventory = [
  { id: "1", make: "Toyota", model: "Camry", year: 2024, vin: "1HGCM82633A123456", status: "Available" },
  { id: "2", make: "Honda", model: "Accord", year: 2024, vin: "2HGES16575H123456", status: "In Service" },
];

const mockServiceStatus = [
  { id: "1", vin: "1HGCM82633A123456", status: "In Progress", estimatedCompletion: "2024-03-20T15:00:00" },
  { id: "2", vin: "2HGES16575H123456", status: "Waiting for Parts", estimatedCompletion: "2024-03-22T12:00:00" },
];

export const automotiveIntegrationRouter = createTRPCRouter({
  // Appointment Booking
  bookAppointment: publicProcedure
    .input(
      z.object({
        customerName: z.string(),
        email: z.string().email(),
        phone: z.string(),
        preferredDate: z.string(),
        service: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Mock API call to scheduling software
      console.log("Booking appointment:", input);
      return {
        success: true,
        appointmentId: "mock-" + Date.now(),
        confirmationNumber: "CONF-" + Math.random().toString(36).substring(7),
        appointmentDate: input.preferredDate,
      };
    }),

  // Appointment Cancellation
  cancelAppointment: publicProcedure
    .input(
      z.object({
        appointmentId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Mock API call to scheduling software
      console.log("Cancelling appointment:", input);
      return {
        success: true,
        cancellationId: "CANCEL-" + Date.now(),
        refundAmount: 0,
      };
    }),

  // Vehicle Status Check
  checkVehicleStatus: publicProcedure
    .input(
      z.object({
        vin: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Mock API call to service management software
      console.log("Checking vehicle status:", input);
      const status = mockServiceStatus.find(s => s.vin === input.vin);
      return status ?? {
        status: "Not Found",
        estimatedCompletion: null,
      };
    }),

  // Inventory Check
  checkInventory: publicProcedure
    .input(
      z.object({
        make: z.string().optional(),
        model: z.string().optional(),
        year: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      // Mock API call to inventory management software
      console.log("Checking inventory:", input);
      return mockInventory.filter(vehicle => {
        if (input.make && vehicle.make !== input.make) return false;
        if (input.model && vehicle.model !== input.model) return false;
        if (input.year && vehicle.year !== input.year) return false;
        return true;
      });
    }),

  // Service Request
  requestService: publicProcedure
    .input(
      z.object({
        vin: z.string(),
        serviceType: z.string(),
        description: z.string(),
        preferredDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Mock API call to service management software
      console.log("Requesting service:", input);
      return {
        success: true,
        serviceId: "SVC-" + Date.now(),
        estimatedCost: Math.floor(Math.random() * 1000) + 100,
        recommendedDate: input.preferredDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }),
}); 