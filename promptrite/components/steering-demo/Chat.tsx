"use client";

import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/app/utils/trpc";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/src/components/ai-elements/conversation";
import { Loader } from "@/src/components/ai-elements/loader";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/src/components/ai-elements/message";
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  usePromptInputAttachments,
} from "@/src/components/ai-elements/prompt-input";
import { Response } from "@/src/components/ai-elements/response";

type UIMsgImage = {
  id: string;
  url: string;
  mediaType?: string;
  filename?: string;
};

type UIMsg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  images?: UIMsgImage[];
};

type ChatStatus = "idle" | "submitted" | "streaming" | "error";

const STORAGE_KEY = "steering.chat.sessionId" as const;
const PASS_THRESHOLD = 60;

const FileButton = () => {
  const attachments = usePromptInputAttachments();
  return (
    <PromptInputButton
      aria-label="Add images"
      onClick={() => attachments.openFileDialog()}
      type="button"
      variant="ghost"
    >
      +
    </PromptInputButton>
  );
};

type SeedMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function Chat({
  autoFocus,
  seed,
}: {
  autoFocus?: boolean;
  seed?: SeedMessage[];
}) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const pushMutation = trpc.chat.push.useMutation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UIMsg[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const tokensRef = useRef<string>("");
  const [validationScore, setValidationScore] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch user data for navigation
  const { data: me } = trpc.user.me.useQuery(undefined, { staleTime: 30_000 });

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      // If seed is provided, initialize with seed and skip session bootstrap
      if (seed && seed.length > 0) {
        if (!isMounted) return;
        const seededMessages = seed.map((m) => ({
          id: nanoid(),
          role: m.role,
          text: m.content,
        }));
        setMessages(seededMessages);
        // Create a local session ID for seeded conversations
        const localId = `seeded-${nanoid()}`;
        setSessionId(localId);
        return;
      }

      const existing =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      try {
        if (existing) {
          if (!isMounted) return;
          setSessionId(existing);
          try {
            const res = await utils.chat.eject.fetch({ sessionId: existing });
            if (!isMounted) return;
            setMessages(
              res.conversation.map((m) => ({
                id: nanoid(),
                role: m.role,
                text: m.content,
              }))
            );
          } catch {
            // fallback: keep local-only history
          }
          return;
        }
        try {
          const started = await utils.chat.start.fetch({ mode: "general" });
          if (!isMounted) return;
          localStorage.setItem(STORAGE_KEY, started.sessionId);
          setSessionId(started.sessionId);
        } catch {
          // tRPC unavailable: create local session id
          const localId = `local-${nanoid()}`;
          if (!isMounted) return;
          localStorage.setItem(STORAGE_KEY, localId);
          setSessionId(localId);
        }
      } catch (e) {
        if (!isMounted) return;
        setError((e as Error).message);
      }
    };
    void init();
    return () => {
      isMounted = false;
    };
  }, [utils.chat.eject, utils.chat.start, seed]);

  const historyForRequest = useMemo(
    () =>
      messages
        .filter((m) => m.text.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.text })),
    [messages]
  );

  // Note: Scoring is now handled on the completion page for optimistic redirect
  // This mutation is kept for backwards compatibility but not actively used in the redirect flow
  const scoringMutation = trpc.scoring.scoreConversationTest.useMutation({
    onSuccess: (data) => {
      const composite = (data as any)?.compositeScore;
      const score =
        typeof composite === "number" ? Math.round(composite) : null;
      setValidationScore(score);
      setValidationError(null);
    },
    onError: (err) => {
      const maybeData = (err as any).data;
      const errorMsgFromData =
        maybeData && typeof maybeData.message === "string"
          ? maybeData.message
          : null;
      setValidationError(errorMsgFromData ?? err.message ?? "Scoring failed.");
      setValidationScore(null);
    },
  });

  const streamViaHttp = async (payload: {
    mode: "general" | "code" | "image" | "video";
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    systemOverride?: string;
  }) => {
    const res = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      tokensRef.current += chunk;
      setMessages((prev) => {
        const next = prev.slice();
        const last = next.at(-1);
        if (last && last.role === "assistant") {
          last.text = tokensRef.current;
        }
        return next;
      });
    }
  };

  const handleSubmit = async (message: {
    text?: string;
    files?: Array<{
      type: string;
      url?: string;
      mediaType?: string;
      filename?: string;
    }>;
  }) => {
    if (!sessionId) return;
    const text = (message.text || "").trim();
    const images: UIMsgImage[] = (message.files || [])
      .filter((f) => f.mediaType?.startsWith("image/") && f.url)
      .map((f) => ({
        id: nanoid(),
        url: f.url as string,
        mediaType: f.mediaType,
        filename: f.filename,
      }));

    // prevent empty submits
    if (text.length === 0 && images.length === 0) return;

    setError(null);
    setStatus("submitted");

    const userMsg: UIMsg = { id: nanoid(), role: "user", text, images };
    setMessages((prev) => prev.concat(userMsg));

    // persist user message to server history (best-effort)
    try {
      await pushMutation.mutateAsync({
        sessionId,
        message: { role: "user", content: text },
      });
    } catch {
      // ignore when tRPC is unavailable
    }

    // prepare assistant placeholder
    tokensRef.current = "";
    setMessages((prev) =>
      prev.concat({ id: nanoid(), role: "assistant", text: "" })
    );
    setStatus("streaming");

    try {
      // include prior messages for richer context
      const context = historyForRequest.concat({
        role: "user" as const,
        content: text,
      });
      await streamViaHttp({ mode: "general", messages: context });
      const assistantText = tokensRef.current;
      // persist assistant message as well (best-effort)
      try {
        await pushMutation.mutateAsync({
          sessionId,
          message: { role: "assistant", content: assistantText },
        });
      } catch {
        // ignore when tRPC is unavailable
      }
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError((e as Error).message);
    }
  };

  const handleReset = async () => {
    if (!sessionId) return;
    try {
      await utils.chat.reset.fetch({ sessionId });
    } catch {
      // ignore
    }
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
    try {
      const started = await utils.chat.start.fetch({ mode: "general" });
      localStorage.setItem(STORAGE_KEY, started.sessionId);
      setSessionId(started.sessionId);
    } catch {
      const localId = `local-${nanoid()}`;
      localStorage.setItem(STORAGE_KEY, localId);
      setSessionId(localId);
    }
  };

  const handleValidate = () => {
    // Build scoring payload from current conversation
    const conversation = historyForRequest;
    if (conversation.length === 0) return;

    // Generate attempt ID upfront
    const attemptId = `${Date.now()}-${nanoid()}`;

    // Store conversation in sessionStorage immediately for optimistic redirect
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        `scoringConv:${attemptId}`,
        JSON.stringify(conversation)
      );
    }

    // Get user data with strong fallbacks
    const nameCandidate = me
      ? `${me.first_name ?? ""} ${me.last_name ?? ""}`.trim() ||
        me.username ||
        me.email
      : undefined;
    const safeName =
      typeof nameCandidate === "string" && nameCandidate.trim().length > 0
        ? nameCandidate.trim()
        : "You";
    const safeElo = Number.isFinite(Number(me?.elo_rating))
      ? Number(me?.elo_rating)
      : 1200;
    const avatar = "/aipreplogo.png";

    // Navigate immediately to completion page (optimistic redirect)
    const userName = encodeURIComponent(safeName);
    const userElo = encodeURIComponent(String(safeElo));
    const userAvatar = encodeURIComponent(avatar);
    router.push(
      `/dashboard/challenge-completed/${userName}/${userElo}/${userAvatar}?challengeId=1&attemptId=${attemptId}`
    );
  };

  return (
    <div className="flex h-[calc(100dvh-8rem)] w-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h2 className="font-semibold text-sm">Chat Demo</h2>
        <div className="flex items-center gap-2">
          <Button
            aria-busy={(scoringMutation as any).isLoading}
            disabled={
              status === "streaming" || (scoringMutation as any).isLoading
            }
            onClick={handleValidate}
            size="sm"
            type="button"
            variant="outline"
          >
            {(scoringMutation as any).isLoading ? (
              <>
                <Loader className="mr-2" size={14} />
                Scoring...
              </>
            ) : (
              "Submit"
            )}
          </Button>
          <button
            className="rounded border px-3 py-1 text-xs"
            onClick={handleReset}
            type="button"
          >
            Reset
          </button>
        </div>
      </div>

      <Conversation className="min-h-0 flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No messages yet
            </div>
          ) : (
            messages.map((m) => (
              <Message from={m.role} key={m.id}>
                <MessageAvatar
                  name={m.role === "user" ? "You" : "AI"}
                  src={m.role === "user" ? "/aipreplogo.png" : "/vercel.svg"}
                />
                <MessageContent>
                  {m.role === "assistant" ? (
                    <Response>{m.text}</Response>
                  ) : (
                    <div className="space-y-2">
                      {m.text && (
                        <div className="whitespace-pre-wrap">{m.text}</div>
                      )}
                      {m.images && m.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {m.images.map((img) => (
                            <div
                              aria-label={img.filename || "image"}
                              className="h-14 w-14 rounded-md border bg-center bg-cover"
                              key={img.id}
                              role="img"
                              style={{ backgroundImage: `url(${img.url})` }}
                              title={img.filename || "image"}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
        {status === "submitted" && (
          <div
            aria-live="polite"
            className="mx-auto mb-3 flex items-center gap-2 text-muted-foreground text-sm"
            role="status"
          >
            <Loader size={16} />
            <span>The Agent is processing your request ...</span>
          </div>
        )}
        <ConversationScrollButton />
      </Conversation>

      <div className="sticky bottom-0 z-10 border-t bg-background p-2 pb-[env(safe-area-inset-bottom)]">
        <PromptInputProvider>
          <PromptInput accept="image/*" multiple onSubmit={handleSubmit}>
            <PromptInputAttachments>
              {(file) => <PromptInputAttachment data={file} />}
            </PromptInputAttachments>
            <PromptInputBody>
              <PromptInputTextarea
                autoFocus={autoFocus}
                placeholder="Type your reasoning... end with: answer: 3"
              />
            </PromptInputBody>
            <PromptInputFooter>
              <div className="flex items-center gap-1">
                <FileButton />
              </div>
              <PromptInputSubmit
                status={status === "idle" ? undefined : (status as any)}
              />
            </PromptInputFooter>
          </PromptInput>
        </PromptInputProvider>
        {typeof validationScore === "number" && (
          <div className="mt-2 text-xs" role="status">
            Score: {validationScore}/100
          </div>
        )}
        {error && (
          <div className="mt-2 text-destructive text-xs" role="alert">
            {error}
          </div>
        )}
        {validationError && (
          <div className="mt-2 text-destructive text-xs" role="alert">
            {validationError}
          </div>
        )}
      </div>
    </div>
  );
}
