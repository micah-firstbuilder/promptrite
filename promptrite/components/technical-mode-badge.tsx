"use client";

import { AlertTriangle, Code, Image, Monitor, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TechnicalMode } from "@/lib/utils/challenges";

interface TechnicalModeBadgeProps {
  mode: TechnicalMode;
  className?: string;
}

const modeConfig = {
  ui: {
    icon: Monitor,
    label: "UI",
    description: "User Interface Design",
  },
  code: {
    icon: Code,
    label: "Code",
    description: "Code Implementation",
  },
  image: {
    icon: Image,
    label: "Image",
    description: "Image Generation",
  },
  video: {
    icon: Video,
    label: "Video",
    description: "Video Generation",
  },
  unsupported: {
    icon: AlertTriangle,
    label: "Unsupported",
    description: "Unsupported Mode",
  },
} as const;

export function TechnicalModeBadge({
  mode,
  className,
}: TechnicalModeBadgeProps) {
  const config = modeConfig[mode];
  const Icon = config.icon;

  return (
    <div
      aria-label={`Technical mode: ${config.description}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-1 font-medium text-xs",
        className
      )}
      role="status"
    >
      <Icon aria-hidden="true" className="size-3" />
      <span>{config.label}</span>
    </div>
  );
}
