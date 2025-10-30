import { NextResponse } from "next/server";
import { uploadMediaToBlob } from "@/lib/storage/upload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const input = await req.json();
    const provider = input.provider || process.env.VIDEO_PROVIDER;
    if (!provider) {
      return NextResponse.json(
        { status: "unavailable", message: "Video provider is not configured." },
        { status: 200 }
      );
    }
    const url = process.env.VIDEO_DUMMY_URL || "";
    if (url) {
      // Schedule background upload to blob storage (non-blocking)
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        queueMicrotask(() => {
          fetch(url)
            .then((response) => {
              if (!response.ok) {
                throw new Error(
                  `Failed to fetch video: ${response.statusText}`
                );
              }
              return response.arrayBuffer();
            })
            .then((arrayBuffer) => {
              const buffer = Buffer.from(arrayBuffer);
              const base64 = buffer.toString("base64");
              const base64DataUrl = `data:video/mp4;base64,${base64}`;
              const timestamp = Date.now();
              const fileName = `video-${timestamp}.mp4`;

              return uploadMediaToBlob({
                base64: base64DataUrl,
                fileName,
                folder: "generated/videos",
                access: "public",
                allowedKinds: ["video"],
              });
            })
            .catch((error) => {
              console.error("[VIDEO API] Background upload failed:", error);
            });
        });
      }

      return NextResponse.json({
        status: "completed",
        url,
        mimeType: "video/mp4",
        meta: { provider },
      });
    }
    return NextResponse.json({
      status: "queued",
      jobId: `job_${Date.now()}`,
      meta: { provider },
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
