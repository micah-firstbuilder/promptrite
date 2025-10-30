import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { streamText } from "ai";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { ConversationMessage } from "@/lib/services/gateway";
import { scoreConversation } from "@/lib/services/gateway";
import { ensureRelatedToChallengeById } from "@/lib/services/guard";
import type { ChatMessage, ChatMode, GeneratedMedia } from "@/types/chat";
import { defaultSystemPrompts } from "@/types/chat";
import { protectedProcedure, publicProcedure, router } from "../trpc";

interface SessionState {
  id: string;
  mode: ChatMode;
  systemOverride?: string;
  messages: ChatMessage[];
  media: GeneratedMedia[];
  createdAt: number;
}

// Persist sessions across dev HMR and avoid separate maps per module load
function getSessionStore(): Map<string, SessionState> {
  const g = globalThis as unknown as {
    __chatSessions?: Map<string, SessionState>;
  };
  if (!g.__chatSessions) {
    g.__chatSessions = new Map<string, SessionState>();
  }
  return g.__chatSessions;
}

const sessions = getSessionStore();
const SESSION_TTL_MS = 1000 * 60 * 30; // 30 minutes
const MAX_CONVERSATION_CHARS = 16_000;

function getSystemPrompt(mode: ChatMode, override?: string): string {
  if (override && override.trim()) return override;
  return defaultSystemPrompts[mode];
}

function trimConversation(messages: ChatMessage[]): ChatMessage[] {
  let total = 0;
  const reversed: ChatMessage[] = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    total += m.content.length;
    if (total > MAX_CONVERSATION_CHARS) break;
    reversed.push(m);
  }
  return reversed.reverse();
}

export const chatRouter = router({
  start: publicProcedure
    .input(
      z.object({
        mode: z.enum(["general", "code", "image", "video"]),
        systemOverride: z.string().optional(),
      })
    )
    .query(({ input }) => {
      const id = nanoid();
      const state: SessionState = {
        id,
        mode: input.mode as ChatMode,
        systemOverride: input.systemOverride,
        messages: [],
        media: [],
        createdAt: Date.now(),
      };
      sessions.set(id, state);
      return { sessionId: id, mode: state.mode };
    }),

  stream: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        messages: z.array(
          z.object({ role: z.enum(["user", "assistant"]), content: z.string() })
        ),
      })
    )
    .subscription(({ input }) => {
      const state = sessions.get(input.sessionId);
      if (!state) {
        return observable((emit) => {
          emit.error(new Error("Session not found"));
          return () => {};
        });
      }

      // Refresh TTL; do not append here to avoid duplication with push()
      state.createdAt = Date.now();

      // Enforce mode restrictions: only text streaming in general/code modes.
      if (state.mode === "image" || state.mode === "video") {
        return observable<{ type: string; data?: unknown }>((emit) => {
          // In media modes, we stream guidance text only; actual media generation happens via tools router.
          const guidance =
            state.mode === "image"
              ? "You are in image mode. Use the image tool to generate or refine images."
              : "You are in video mode. Use the video tool to generate or refine videos.";
          emit.next({
            type: "message",
            data: { role: "assistant", content: guidance },
          });
          emit.complete();
          return () => {};
        });
      }

      return observable<{ type: string; data?: unknown }>((emit) => {
        void (async () => {
          try {
            const systemPrompt = getSystemPrompt(
              state.mode,
              state.systemOverride
            );
            const history = [
              { role: "system", content: systemPrompt },
              ...state.messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
            ] as Array<{
              role: "system" | "user" | "assistant";
              content: string;
            }>;

            const response = await streamText({
              model: "openai/gpt-5-mini", // routed by AI Gateway; no provider SDK used
              messages: history,
            });

            let assistant = "";
            for await (const delta of response.textStream) {
              assistant += delta;
              emit.next({ type: "token", data: delta });
            }
            state.messages.push({ role: "assistant", content: assistant });
            emit.next({
              type: "message",
              data: { role: "assistant", content: assistant },
            });
            emit.next({ type: "done" });
            emit.complete();
          } catch (err) {
            emit.error(err as Error);
          }
        })();
        return () => {};
      });
    }),

  push: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        message: z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        }),
      })
    )
    .mutation(({ input }) => {
      const state = sessions.get(input.sessionId);
      if (!state) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }
      state.createdAt = Date.now();
      state.messages.push(input.message);
      state.messages = trimConversation(state.messages);
      return { ok: true };
    }),

  eject: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }) => {
      const state = sessions.get(input.sessionId);
      if (!state) {
        throw new Error("Session not found");
      }
      return { conversation: state.messages, media: state.media };
    }),

  reset: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }) => {
      sessions.delete(input.sessionId);
      return { ok: true };
    }),

  submit: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        challengeId: z.string().min(1),
        attemptId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const state = sessions.get(input.sessionId);
      if (!state) {
        throw new Error("Session not found");
      }
      if (!state.messages.length) {
        throw new Error("Conversation is empty");
      }
      const conversation = state.messages as ConversationMessage[];

      // Parse and validate challengeId
      const challengeId = Number.parseInt(input.challengeId, 10);
      if (!Number.isFinite(challengeId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid challenge ID.",
        });
      }

      // Guard: Ensure the latest user message is related to the challenge
      const lastUserMessage = [...conversation]
        .reverse()
        .find((msg) => msg.role === "user");
      if (!lastUserMessage) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No user message found in conversation.",
        });
      }

      const guardResult = await ensureRelatedToChallengeById({
        challengeId,
        message: lastUserMessage.content,
      });

      const result = await scoreConversation({
        conversation,
        challengeId: input.challengeId,
        attemptId: input.attemptId,
        challenge: guardResult.challenge,
      });
      return result;
    }),
});

// simple janitor to evict expired sessions; ensure single interval
(() => {
  const g = globalThis as unknown as { __chatJanitor?: NodeJS.Timer };
  if (!g.__chatJanitor) {
    g.__chatJanitor = setInterval(() => {
      const now = Date.now();
      for (const [id, s] of sessions) {
        if (now - s.createdAt > SESSION_TTL_MS) {
          sessions.delete(id);
        }
      }
    }, 60_000);
  }
})();
