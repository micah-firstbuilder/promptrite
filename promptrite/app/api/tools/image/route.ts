import { createFireworks } from "@ai-sdk/fireworks";
import { experimental_generateImage as generateImage } from "ai";
import { NextResponse } from "next/server";
import { uploadMediaToBlob } from "@/lib/storage/upload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let requestBody: unknown = null;
  try {
    // Check for FIREWORKS_API_KEY
    if (!process.env.FIREWORKS_API_KEY) {
      return NextResponse.json(
        {
          error:
            "FIREWORKS_API_KEY environment variable is required. Please set it in your environment.",
        },
        { status: 400 }
      );
    }

    const contentType = req.headers.get("content-type") ?? "";
    let prompt: string;
    let seed: number | undefined;
    let size: `${number}x${number}` | undefined;
    let aspectRatio: `${number}:${number}` | undefined;
    let n: number | undefined;
    let strength: number | undefined;
    let initImageBytes: Uint8Array | undefined;

    // Parse request based on content type
    if (contentType.includes("application/json")) {
      const body = await req.json();
      requestBody = body;
      prompt = body.prompt;
      seed = body.seed;
      n = body.n;
      strength = body.strength;

      // Type assertions for size and aspectRatio
      if (body.size && typeof body.size === "string") {
        size = body.size as `${number}x${number}`;
      }
      if (body.aspectRatio && typeof body.aspectRatio === "string") {
        aspectRatio = body.aspectRatio as `${number}:${number}`;
      }

      // Handle base64 init image from JSON
      if (body.initImageBase64) {
        const base64Data = body.initImageBase64.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        initImageBytes = Uint8Array.from(atob(base64Data), (c) =>
          c.charCodeAt(0)
        );
      }
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      prompt = String(form.get("prompt") ?? "");
      const seedValue = form.get("seed");
      seed = seedValue ? Number(seedValue) : undefined;
      const sizeValue = form.get("size");
      size = sizeValue
        ? (String(sizeValue) as `${number}x${number}`)
        : undefined;
      const aspectRatioValue = form.get("aspectRatio");
      aspectRatio = aspectRatioValue
        ? (String(aspectRatioValue) as `${number}:${number}`)
        : undefined;
      const nValue = form.get("n");
      n = nValue ? Number(nValue) : undefined;
      const strengthValue = form.get("strength");
      strength = strengthValue ? Number(strengthValue) : undefined;

      // Handle file upload from multipart
      const file = form.get("image");
      if (file && file instanceof File) {
        initImageBytes = new Uint8Array(await file.arrayBuffer());
      }
    } else {
      return NextResponse.json(
        {
          error:
            "Unsupported content type. Use application/json or multipart/form-data.",
        },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    // Validate and set Fireworks model ID
    const envModelId = process.env.IMAGE_MODEL;
    // Validate that IMAGE_MODEL is a valid Fireworks model ID format
    // Fireworks model IDs should start with "accounts/fireworks/models/"
    const isValidFireworksModel =
      envModelId && envModelId.startsWith("accounts/fireworks/models/");
    const fireworksModelId = isValidFireworksModel
      ? envModelId
      : "accounts/fireworks/models/flux-1-dev-fp8";

    // Log request details (sanitized)
    console.error("[IMAGE API] Request details:", {
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? "..." : ""),
      hasInitImage: !!initImageBytes,
      seed,
      size,
      aspectRatio,
      n,
      strength,
      IMAGE_MODEL_ENV: envModelId || "not set",
      IMAGE_MODEL_USED: fireworksModelId,
      modelWasOverridden: !isValidFireworksModel && !!envModelId,
      FIREWORKS_API_KEY: process.env.FIREWORKS_API_KEY
        ? `set (length: ${process.env.FIREWORKS_API_KEY.length})`
        : "not set",
    });

    // Initialize Fireworks provider with explicit API key
    const fireworksProvider = createFireworks({
      apiKey: process.env.FIREWORKS_API_KEY,
    });

    // Initialize Fireworks model
    const model = fireworksProvider.image(fireworksModelId);

    // Prepare provider options for image-to-image if init image is provided
    const providerOptions = initImageBytes
      ? {
          fireworks: {
            init_image: `data:image/png;base64,${Buffer.from(initImageBytes).toString("base64")}`,
            strength: strength ?? 0.8, // Default strength for image-to-image
          },
        }
      : undefined;

    // Generate image(s)
    const result = await generateImage({
      model,
      prompt,
      seed,
      size,
      aspectRatio,
      n,
      providerOptions,
    });

    // Log result structure for debugging
    console.error("[IMAGE API] GenerateImage result:", {
      hasImages: !!(result as any).images,
      imagesLength: Array.isArray((result as any).images)
        ? (result as any).images.length
        : 0,
      hasImage: !!(result as any).image,
      resultKeys: Object.keys(result as any),
      warnings: (result as any).warnings,
    });

    // Extract image(s) from result
    const imagesArray =
      (result as any).images ??
      ((result as any).image ? [(result as any).image] : []);

    if (imagesArray.length === 0) {
      console.error("[IMAGE API] No images in result:", {
        result,
        imagesArray,
      });
      return NextResponse.json(
        { error: "No image generated" },
        { status: 502 }
      );
    }

    // Format response - return base64 directly from AI SDK
    const images = imagesArray.map((img: any) => ({
      base64: img.base64,
      mediaType: img.mediaType ?? "image/png",
      width: img.width,
      height: img.height,
    }));

    const warnings = (result as any).warnings as string[] | undefined;
    const providerMetadata = (result as any).providerMetadata;

    // Schedule background uploads to blob storage (non-blocking)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      queueMicrotask(() => {
        const uploadPromises = images.map(
          (img: { base64: string; mediaType: string }, idx: number) => {
            const base64DataUrl = `data:${img.mediaType || "image/png"};base64,${img.base64}`;
            const timestamp = Date.now();
            const fileName = `image-${timestamp}-${idx}.${img.mediaType === "image/jpeg" ? "jpg" : "png"}`;

            return uploadMediaToBlob({
              base64: base64DataUrl,
              fileName,
              folder: "generated/images",
              access: "public",
              allowedKinds: ["image"],
            }).catch((error) => {
              console.error(
                `[IMAGE API] Background upload failed for image ${idx}:`,
                error
              );
            });
          }
        );

        Promise.all(uploadPromises).catch((error) => {
          console.error("[IMAGE API] Background upload batch failed:", error);
        });
      });
    }

    // Return single image or array based on n parameter
    return NextResponse.json({
      ...(n === 1 || !n ? { image: images[0] } : { images }),
      warnings,
      providerMetadata,
    });
  } catch (err) {
    const error = err as Error & {
      cause?: unknown;
      data?: unknown;
      response?: unknown;
    };
    const isDevelopment = process.env.NODE_ENV === "development";

    // Extract additional error details from AI SDK error
    const errorDetails: Record<string, unknown> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      requestBody,
    };

    // AI SDK errors often include cause, data, or response with API details
    if (error.cause) {
      errorDetails.cause = error.cause;
    }
    if (error.data) {
      errorDetails.data = error.data;
    }
    if (error.response) {
      errorDetails.response = error.response;
    }

    // Log full error details to console
    console.error("[IMAGE API] Error occurred:", errorDetails);

    // Extract API error message if available
    let errorMessage = error.message;
    if (
      error.cause &&
      typeof error.cause === "object" &&
      error.cause !== null
    ) {
      const cause = error.cause as Record<string, unknown>;
      if (cause.message && typeof cause.message === "string") {
        errorMessage = cause.message;
      } else if (cause.error && typeof cause.error === "string") {
        errorMessage = cause.error;
      }
    }

    // Return detailed error in development, simplified in production
    return NextResponse.json(
      {
        error: errorMessage,
        ...(isDevelopment && {
          stack: error.stack,
          name: error.name,
          requestBody,
          cause: error.cause,
          data: error.data,
        }),
      },
      { status: 500 }
    );
  }
}
