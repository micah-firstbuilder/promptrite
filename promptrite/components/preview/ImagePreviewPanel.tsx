"use client";

import { ImageIcon, Loader, XCircle } from "lucide-react";
import { nanoid } from "nanoid";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModePreview, type PromptHistoryItem } from "./ModePreview";

export function ImagePreviewPanel() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
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
      const response = await fetch("/api/tools/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      // Handle both singular image and images array responses
      const imageData =
        data.image ||
        (data.images && data.images.length > 0 ? data.images[0] : null);

      if (imageData && imageData.base64) {
        const dataUrl = `data:${imageData.mediaType || imageData.mimeType || "image/png"};base64,${imageData.base64}`;
        setImageSrc(dataUrl);
      } else {
        throw new Error("No image data returned from API");
      }
    } catch (error) {
      console.error("Image generation failed:", error);
      setPreviewError(
        error instanceof Error ? error.message : "Failed to generate image"
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
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center">
            <Loader className="mb-2 size-8 animate-spin" />
            <p className="text-muted-foreground text-sm">
              Generating image, this may take a few seconds...
            </p>
          </div>
        ) : previewError ? (
          <div className="flex flex-col items-center justify-center">
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
        ) : imageSrc ? (
          <img
            alt="Generated image preview"
            className="h-full w-full object-cover"
            src={imageSrc}
          />
        ) : (
          <div className="text-center">
            <ImageIcon className="mx-auto mb-3 size-12 opacity-50" />
            <p className="text-sm">Generated images will appear here</p>
            <p className="mt-1 text-xs">Enter a prompt above to get started</p>
          </div>
        )}
      </div>
    </ModePreview>
  );
}
