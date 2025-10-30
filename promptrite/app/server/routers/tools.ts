import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { experimental_generateImage as generateImage } from "ai";
import { z } from "zod";
import type {
  ImageToolInput,
  ImageToolOutput,
  VideoToolInput,
  VideoToolOutput,
} from "@/types/chat";
import { publicProcedure, router } from "../trpc";

// Image generation via OpenRouter provider
export const toolsRouter = router({
  image: router({
    generate: publicProcedure
      .input(
        z.object({
          prompt: z.string().min(1),
          size: z.string().optional(),
          aspectRatio: z.string().optional(),
          n: z.number().int().min(1).max(10).optional(),
          seed: z.number().int().optional(),
          providerOptions: z.record(z.any()).optional(),
        }) as unknown as z.ZodType<ImageToolInput>
      )
      .query(async ({ input }) => {
        const openrouter = createOpenRouter({
          apiKey: process.env.OPENROUTER_API_KEY,
        });

        const modelString =
          process.env.IMAGE_MODEL || "openai/gpt-5-image-mini"; // OpenRouter GPT-5 Image Mini
        // Type assertion needed as OpenRouterProvider type may not include .image() in type definitions
        const model = (openrouter as any).image(modelString);
        const result = await generateImage({
          model,
          prompt: input.prompt,
          size: input.size as `${number}x${number}` | undefined,
          aspectRatio: input.aspectRatio as any,
          n: input.n,
          seed: input.seed,
          providerOptions: input.providerOptions as any,
        });

        const imagesArray =
          result.images ?? (result.image ? [result.image] : []);
        const images = imagesArray.map((img: any) => ({
          base64: img.base64,
          mimeType: img.mimeType ?? "image/png",
          width: img.width,
          height: img.height,
          meta: result.providerMetadata ?? undefined,
        }));

        const warnings = (result as any).warnings as string[] | undefined;
        const output: ImageToolOutput = {
          images,
          warnings,
          providerMetadata: result.providerMetadata as any,
        };
        return output;
      }),
  }),

  video: router({
    generate: publicProcedure
      .input(
        z.object({
          prompt: z.string().min(1),
          aspectRatio: z.string().optional(),
          durationSeconds: z.number().int().min(1).max(60).optional(),
          seed: z.number().int().optional(),
          provider: z.string().optional(),
          providerOptions: z.record(z.any()).optional(),
        }) as unknown as z.ZodType<VideoToolInput>
      )
      .query(async ({ input }) => {
        // Env-gated provider selection; return unavailable if not configured
        const provider = input.provider || process.env.VIDEO_PROVIDER;
        if (!provider) {
          const unavailable: VideoToolOutput = {
            status: "unavailable",
            message: "Video provider is not configured.",
          };
          return unavailable;
        }

        // Placeholder adapter: assume an external service returns a URL synchronously
        // In a real adapter, you might enqueue a job and return jobId/status
        const url = process.env.VIDEO_DUMMY_URL || "";
        const output: VideoToolOutput = url
          ? {
              status: "completed",
              url,
              mimeType: "video/mp4",
              meta: { provider },
            }
          : {
              status: "queued",
              jobId: `job_${Date.now()}`,
              meta: { provider },
            };
        return output;
      }),
  }),
});
