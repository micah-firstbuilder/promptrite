import { streamText } from "ai";
import { NextResponse } from "next/server";
import { defaultSystemPrompts } from "@/types/chat";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode, systemOverride, messages } = body as {
      mode: "general" | "code" | "image" | "video";
      systemOverride?: string;
      messages: Array<{ role: "user" | "assistant"; content: string }>;
    };

    const system =
      systemOverride && systemOverride.trim()
        ? systemOverride
        : defaultSystemPrompts[mode ?? "general"];
    const history = [
      { role: "system" as const, content: system },
      ...(messages || []),
    ];

    const response = await streamText({
      model: "openai/gpt-5-mini", // routed by AI Gateway
      messages: history,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const delta of response.textStream) {
          controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
