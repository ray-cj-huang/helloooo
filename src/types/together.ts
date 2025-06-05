import { z } from 'zod';

export const TogetherRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  model: z.string().optional().default('mistralai/Mixtral-8x7B-Instruct-v0.1'),
});

export const TogetherResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string(),
        role: z.string(),
      }),
    })
  ),
});

export type TogetherRequest = z.infer<typeof TogetherRequestSchema>;
export type TogetherResponse = z.infer<typeof TogetherResponseSchema>; 