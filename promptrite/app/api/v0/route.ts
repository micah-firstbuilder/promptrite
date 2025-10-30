import { v0 } from "v0-sdk";

export async function POST(req: Request) {
  try {
    const { prompt }: { prompt: string } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return Response.json(
        { error: "Prompt is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const result = await v0.chats.create({
      system: "You are an expert coder",
      message: prompt,
      modelConfiguration: {
        modelId: "v0-1.5-sm",
        imageGenerations: false,
        thinking: false,
      },
    });

    // Handle union type: ChatDetail | ChatsCreateStreamResponse
    // Use type assertion since we need to access properties that may exist at runtime
    // but aren't in the type definitions
    const resultWithProps = result as Record<string, unknown>;

    const response: Record<string, unknown> = {};

    if (
      "webUrl" in resultWithProps &&
      typeof resultWithProps.webUrl === "string"
    ) {
      response.webUrl = resultWithProps.webUrl;
    }

    if ("demo" in resultWithProps && resultWithProps.demo) {
      response.demo = resultWithProps.demo;
    }

    return Response.json(response);
  } catch (error) {
    console.error("v0 API error:", error);
    return Response.json(
      { error: "Failed to generate preview. Please try again." },
      { status: 500 }
    );
  }
}
