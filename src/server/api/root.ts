import { emailRouter } from "@/server/api/routers/email";
import { togetherRouter } from "@/server/api/routers/together";
import { autoResponseRouter } from "@/server/api/routers/auto-response";
import { automotiveIntegrationRouter } from "@/server/api/routers/automotive-integration";
import { emailCategoryRouter } from "@/server/api/routers/email-category";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  email: emailRouter,
  together: togetherRouter,
  autoResponse: autoResponseRouter,
  automotive: automotiveIntegrationRouter,
  emailCategory: emailCategoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
