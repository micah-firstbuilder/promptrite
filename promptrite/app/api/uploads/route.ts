import { NextResponse } from "next/server";
import { uploadMediaToBlob } from "@/lib/storage/upload";

export const runtime = "nodejs";

/**
 * Example API route demonstrating usage of uploadMediaToBlob helper.
 *
 * POST /api/uploads
 * Body: { base64: string, fileName?: string }
 *
 * Example request:
 * {
 *   "base64": "data:image/png;base64,iVBORw0KGgoAAAANS...",
 *   "fileName": "my-image.png"
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { base64, fileName } = body;

    if (!base64 || typeof base64 !== "string") {
      return NextResponse.json(
        { error: "base64 field is required and must be a string" },
        { status: 400 }
      );
    }

    const result = await uploadMediaToBlob({
      base64,
      fileName,
      folder: "uploads",
      access: "public",
      allowedKinds: ["image", "video"],
      maxBytes: 50 * 1024 * 1024, // 50MB
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
