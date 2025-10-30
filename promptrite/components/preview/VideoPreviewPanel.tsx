"use client";

import { Loader, Video, XCircle } from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ModePreview, type PromptHistoryItem } from "./ModePreview";

type VideoStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "unavailable";

export function VideoPreviewPanel() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Poll for video status when queued or processing
  useEffect(() => {
    if (!(currentJobId && ["queued", "processing"].includes(videoStatus || "")))
      return;

    const pollInterval = setInterval(async () => {
      try {
        // In a real implementation, you'd have a status endpoint
        // For now, we'll just check the dummy URL if available
        const response = await fetch("/api/tools/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: promptHistory[promptHistory.length - 1]?.prompt || "",
          }),
        });

        const data = await response.json();
        if (data.status === "completed" && data.url) {
          setVideoUrl(data.url);
          setVideoStatus("completed");
          setIsGenerating(false);
        } else if (data.status === "failed") {
          setVideoStatus("failed");
          setPreviewError(data.message || "Video generation failed");
          setIsGenerating(false);
        } else {
          setVideoStatus(data.status);
        }
      } catch (error) {
        console.error("Video status check failed:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [currentJobId, videoStatus, promptHistory]);

  const handleSubmit = async (prompt: string) => {
    setIsGenerating(true);
    setPreviewError(null);
    setVideoStatus(null);
    setVideoUrl(null);

    // Add to history
    const newItem: PromptHistoryItem = {
      id: nanoid(),
      prompt,
      timestamp: new Date(),
    };
    setPromptHistory((prev) => [...prev, newItem]);

    try {
      const response = await fetch("/api/tools/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate video");
      }

      if (data.status === "completed" && data.url) {
        setVideoUrl(data.url);
        setVideoStatus("completed");
      } else if (data.status === "unavailable") {
        setVideoStatus("unavailable");
        setPreviewError(
          data.message || "Video generation is currently unavailable"
        );
      } else {
        setVideoStatus(data.status);
        if (data.jobId) {
          setCurrentJobId(data.jobId);
        }
      }
    } catch (error) {
      console.error("Video generation failed:", error);
      setPreviewError(
        error instanceof Error ? error.message : "Failed to generate video"
      );
      setVideoStatus("failed");
    } finally {
      if (videoStatus !== "queued" && videoStatus !== "processing") {
        setIsGenerating(false);
      }
    }
  };

  const getStatusMessage = () => {
    switch (videoStatus) {
      case "queued":
        return "Video queued for generation...";
      case "processing":
        return "Generating video, this may take a while...";
      case "failed":
        return previewError || "Video generation failed";
      case "unavailable":
        return previewError || "Video generation is currently unavailable";
      default:
        return "Generating video...";
    }
  };

  return (
    <ModePreview
      isLoading={isGenerating}
      onSubmit={handleSubmit}
      promptHistory={promptHistory}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
        {isGenerating ||
        videoStatus === "queued" ||
        videoStatus === "processing" ? (
          <div className="flex flex-col items-center justify-center">
            <Loader className="mb-2 size-8 animate-spin" />
            <p className="text-muted-foreground text-sm">
              {getStatusMessage()}
            </p>
          </div>
        ) : previewError ||
          videoStatus === "failed" ||
          videoStatus === "unavailable" ? (
          <div className="flex flex-col items-center justify-center">
            <XCircle className="mb-2 size-8 text-destructive" />
            <p className="px-4 text-center text-destructive text-sm">
              {getStatusMessage()}
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
        ) : videoUrl && videoStatus === "completed" ? (
          <video
            aria-label="Generated video preview"
            className="h-full w-full object-cover"
            controls
            src={videoUrl}
            title="Generated video preview"
          />
        ) : (
          <div className="text-center">
            <Video className="mx-auto mb-3 size-12 opacity-50" />
            <p className="text-sm">Generated videos will appear here</p>
            <p className="mt-1 text-xs">Enter a prompt above to get started</p>
          </div>
        )}
      </div>
    </ModePreview>
  );
}
