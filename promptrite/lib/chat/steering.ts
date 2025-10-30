"use client";

import { nanoid } from "nanoid";
import type { trpc } from "@/app/utils/trpc";
import type {
  ChatMessage,
  ChatMode,
  EjectedConversation,
  GeneratedMedia,
  ImageToolInput,
  VideoToolInput,
} from "@/types/chat";

export interface ChatSession {
  sessionId: string;
  mode: ChatMode;
  messages: ChatMessage[];
  media: GeneratedMedia[];
}

export function createChatSteering() {
  const sessions = new Map<string, ChatSession>();

  const createChatSession = async (
    client: ReturnType<typeof trpc.useUtils>,
    opts: { mode: ChatMode; systemOverride?: string }
  ) => {
    const res = await client.chat.start.fetch({
      mode: opts.mode,
      systemOverride: opts.systemOverride,
    });
    const session: ChatSession = {
      sessionId: res.sessionId,
      mode: res.mode,
      messages: [],
      media: [],
    };
    sessions.set(res.sessionId, session);
    return res.sessionId;
  };

  const pushMessage = async (
    client: ReturnType<typeof trpc.useUtils>,
    sessionId: string,
    content: string
  ) => {
    const session = sessions.get(sessionId);
    if (!session) throw new Error("Session not found");
    const userMsg: ChatMessage = { role: "user", content };
    session.messages.push(userMsg);
    // Ensure server holds the message so submit sees non-empty conversation
    // Use fetch directly since we can't use mutation hooks in utility functions
    try {
      await fetch("/api/trpc/chat.push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: { sessionId, message: userMsg },
        }),
      });
    } catch {
      // Ignore errors - best-effort persistence
    }
    return { ok: true } as const;
  };

  const invokeImageTool = async (
    _client: ReturnType<typeof trpc.useUtils>,
    sessionId: string,
    input: ImageToolInput
  ) => {
    const session = sessions.get(sessionId);
    if (!session) throw new Error("Session not found");
    if (session.mode !== "image")
      throw new Error("Image tool can only be used in image mode");
    const res = await fetch("/api/tools/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((r) => r.json());
    const media = res.images.map((img: any) => ({
      id: nanoid(),
      kind: "image" as const,
      base64: img.base64,
      mimeType: img.mimeType,
      width: img.width,
      height: img.height,
      meta: img.meta,
    }));
    session.media.push(...media);
    return media;
  };

  const invokeVideoTool = async (
    _client: ReturnType<typeof trpc.useUtils>,
    sessionId: string,
    input: VideoToolInput
  ) => {
    const session = sessions.get(sessionId);
    if (!session) throw new Error("Session not found");
    if (session.mode !== "video")
      throw new Error("Video tool can only be used in video mode");
    const res = await fetch("/api/tools/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((r) => r.json());
    if (res.status === "completed" && res.url) {
      const media: GeneratedMedia = {
        id: nanoid(),
        kind: "video",
        url: res.url,
        mimeType: res.mimeType || "video/mp4",
        meta: res.meta,
        status: "completed",
      };
      session.media.push(media);
      return [media];
    }
    return [];
  };

  const ejectConversation = async (
    client: ReturnType<typeof trpc.useUtils>,
    sessionId: string
  ): Promise<EjectedConversation> => {
    const res = await client.chat.eject.fetch({ sessionId });
    const session = sessions.get(sessionId);
    if (session) {
      session.messages = res.conversation;
      session.media = res.media;
    }
    return res;
  };

  const resetSession = async (
    client: ReturnType<typeof trpc.useUtils>,
    sessionId: string
  ) => {
    await client.chat.reset.fetch({ sessionId });
    sessions.delete(sessionId);
  };

  const submitForScoring = async (
    client: ReturnType<typeof trpc.useUtils>,
    sessionId: string,
    challengeId: string,
    attemptId?: string
  ) => {
    // Use fetch to call the API directly since we're in a server context
    const response = await fetch("/api/trpc/chat.submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, challengeId, attemptId }),
    });
    return response.json();
  };

  return {
    createChatSession,
    pushMessage,
    invokeImageTool,
    invokeVideoTool,
    ejectConversation,
    resetSession,
    submitForScoring,
  };
}
