export type ChatMode = "general" | "code" | "image" | "video";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SystemPromptMap {
  general: string;
  code: string;
  image: string;
  video: string;
}

export interface ImageMedia {
  id: string;
  kind: "image";
  base64: string;
  mimeType: string;
  width?: number;
  height?: number;
  meta?: Record<string, unknown>;
}

export interface VideoMedia {
  id: string;
  kind: "video";
  url: string;
  mimeType: string;
  durationSeconds?: number;
  meta?: Record<string, unknown>;
  status?: "queued" | "processing" | "completed" | "failed";
}

export type GeneratedMedia = ImageMedia | VideoMedia;

export interface EjectedConversation {
  conversation: ChatMessage[];
  media: GeneratedMedia[];
}

export const defaultSystemPrompts: SystemPromptMap = {
  general:
    "You are a helpful, concise assistant. Provide clear, direct answers and ask clarifying questions when needed.",
  code: "You are a senior TypeScript engineer. Reply primarily with runnable, well-structured code blocks and minimal prose. Include explanations only when necessary.",
  image:
    "You are an AI creative assistant focused on image generation. Guide the user with brief suggestions. All actual imagery must be created via the image tool only.",
  video:
    "You are an AI creative assistant focused on video generation. Provide concise guidance. All actual video creation occurs via the video tool only.",
};

export interface ImageToolInput {
  prompt: string;
  size?: string;
  aspectRatio?: string;
  n?: number;
  seed?: number;
  providerOptions?: Record<string, unknown>;
}

export interface ImageToolOutput {
  images: Array<{
    base64: string;
    mimeType: string;
    width?: number;
    height?: number;
    meta?: Record<string, unknown>;
  }>;
  warnings?: string[];
  providerMetadata?: Record<string, unknown>;
}

export interface VideoToolInput {
  prompt: string;
  aspectRatio?: string;
  durationSeconds?: number;
  seed?: number;
  provider?: string;
  providerOptions?: Record<string, unknown>;
}

export interface VideoToolOutput {
  status: "queued" | "processing" | "completed" | "failed" | "unavailable";
  url?: string;
  mimeType?: string;
  jobId?: string;
  meta?: Record<string, unknown>;
  message?: string;
}
