"use client";

import { useEffect, useRef } from "react";
import { sumTokens } from "@/lib/utils/tokens";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/src/components/ai-elements/prompt-input";

export type PromptHistoryItem = {
  id: string;
  prompt: string;
  timestamp: Date;
};

type ModePreviewProps = {
  promptHistory: PromptHistoryItem[];
  onSubmit: (prompt: string) => Promise<void>;
  isLoading?: boolean;
  children: React.ReactNode;
};

export function ModePreview({
  promptHistory,
  onSubmit,
  isLoading = false,
  children,
}: ModePreviewProps) {
  const totalMessages = promptHistory.length;
  const totalTokens = sumTokens(promptHistory.map((p) => p.prompt));
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find the form element inside the PromptInput wrapper
    const form = inputWrapperRef.current?.querySelector("form");
    if (form instanceof HTMLFormElement) {
      formRef.current = form;
    }
  }, []);

  const handleSubmit = async (message: { text?: string }) => {
    const trimmed = (message.text || "").trim();
    if (!trimmed || isLoading) return;

    await onSubmit(trimmed);
  };

  const handleHeaderSubmit = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Stats Header */}
      <div className="flex items-center justify-between border-border border-b bg-muted/20 px-4 py-2">
        <h3 className="font-semibold text-sm">Preview</h3>
        <div className="flex items-center gap-4 text-muted-foreground text-xs">
          <span>Messages: {totalMessages}</span>
          <span>Est. tokens: {totalTokens}</span>
          <button
            className="ml-2 inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            disabled={isLoading}
            onClick={handleHeaderSubmit}
            type="button"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Output Preview Area */}
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>

      {/* Prompts History */}
      {promptHistory.length > 0 && (
        <div className="max-h-32 overflow-y-auto border-border border-t bg-muted/10 px-4 py-2">
          <div className="space-y-1">
            <p className="mb-1 font-medium text-muted-foreground text-xs">
              Prompts ({promptHistory.length}):
            </p>
            {promptHistory.map((item) => (
              <div
                className="truncate text-muted-foreground text-xs"
                key={item.id}
                title={item.prompt}
              >
                {item.prompt}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompt Input */}
      <div className="border-border border-t p-2" ref={inputWrapperRef}>
        <PromptInputProvider>
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                disabled={isLoading}
                placeholder="Enter your prompt..."
              />
            </PromptInputBody>
            <PromptInputFooter>
              <div className="flex items-center gap-1">
                {/* Empty space for left side */}
              </div>
              <PromptInputSubmit
                disabled={isLoading}
                status={isLoading ? "submitted" : undefined}
              />
            </PromptInputFooter>
          </PromptInput>
        </PromptInputProvider>
      </div>
    </div>
  );
}
