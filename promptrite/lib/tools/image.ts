import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { experimental_generateImage as generateImage } from "ai";
import type { ImageToolInput, ImageToolOutput } from "@/types/chat";

export async function generateImages(
  input: ImageToolInput
): Promise<ImageToolOutput> {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const modelString = process.env.IMAGE_MODEL || "openai/gpt-5-image-mini"; // OpenRouter GPT-5 Image Mini
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
    (result as any).images ??
    ((result as any).image ? [(result as any).image] : []);
  const images = imagesArray.map((img: any) => ({
    base64: img.base64,
    mimeType: img.mimeType ?? "image/png",
    width: img.width,
    height: img.height,
    meta: (result as any).providerMetadata ?? undefined,
  }));
  const warnings = (result as any).warnings as string[] | undefined;
  return {
    images,
    warnings,
    providerMetadata: (result as any).providerMetadata,
  };
}
