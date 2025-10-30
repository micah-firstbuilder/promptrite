"use client";

import { Loader, Monitor, XCircle } from "lucide-react";
import { nanoid } from "nanoid";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewUrl,
} from "@/src/components/ai-elements/web-preview";
import { ModePreview, type PromptHistoryItem } from "./ModePreview";

type UiPreviewPanelProps = {
  challengeTitle?: string;
  challengeDescription?: string;
  challengeExample?: string;
};

export function UiPreviewPanel({
  challengeTitle = "",
  challengeDescription = "",
  challengeExample = "",
}: UiPreviewPanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);

  const handleSubmit = async (prompt: string) => {
    setIsGenerating(true);
    setPreviewError(null);

    // Add to history
    const newItem: PromptHistoryItem = {
      id: nanoid(),
      prompt,
      timestamp: new Date(),
    };
    setPromptHistory((prev) => [...prev, newItem]);

    try {
      // Build the full prompt with challenge context
      const fullPrompt = `${challengeTitle ? `Create: ${challengeTitle}. ` : ""}${challengeDescription || ""} ${challengeExample || ""} ${prompt}`;

      const response = await fetch("/api/v0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate preview");
      }

      setPreviewUrl(data.demo || "/");
    } catch (error) {
      console.error("Preview generation failed:", error);
      setPreviewError(
        error instanceof Error ? error.message : "Failed to generate preview"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ModePreview
      isLoading={isGenerating}
      onSubmit={handleSubmit}
      promptHistory={promptHistory}
    >
      <div className="h-full w-full overflow-hidden rounded-lg border border-border bg-card">
        {isGenerating ? (
          <div className="flex h-full flex-col items-center justify-center">
            <Loader className="mb-2 size-8 animate-spin" />
            <p className="text-muted-foreground text-sm">
              Generating app, this may take a few seconds...
            </p>
          </div>
        ) : previewError ? (
          <div className="flex h-full flex-col items-center justify-center">
            <XCircle className="mb-2 size-8 text-destructive" />
            <p className="px-4 text-center text-destructive text-sm">
              {previewError}
            </p>
            <Button
              className="mt-3"
              onClick={() => {
                if (promptHistory.length > 0) {
                  handleSubmit(promptHistory[promptHistory.length - 1].prompt);
                }
              }}
              size="sm"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : previewUrl ? (
          <WebPreview defaultUrl={previewUrl}>
            <WebPreviewNavigation>
              <WebPreviewUrl />
            </WebPreviewNavigation>
            <WebPreviewBody src={previewUrl} />
          </WebPreview>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Monitor className="mx-auto mb-3 size-12 opacity-50" />
              <p className="text-sm">Your generated app will appear here</p>
              <p className="mt-1 text-xs">
                Enter a prompt above to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </ModePreview>
  );
}
