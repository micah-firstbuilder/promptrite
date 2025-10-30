import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

export type MediaKind = "image" | "video";

export interface UploadMediaOptions {
  base64: string;
  fileName?: string;
  folder?: string;
  access?: "public" | "private";
  maxBytes?: number;
  allowedKinds?: MediaKind[];
}

export interface UploadMediaResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

interface DecodedBase64 {
  buffer: Uint8Array;
  contentType: string;
}

const DEFAULT_MAX_BYTES = 50 * 1024 * 1024; // 50MB
const DEFAULT_ALLOWED_KINDS: MediaKind[] = ["image", "video"];

function decodeBase64Input(base64: string): DecodedBase64 {
  let dataString = base64;
  let contentType = "";

  // Handle data URL format: data:image/png;base64,...
  if (base64.startsWith("data:")) {
    const commaIndex = base64.indexOf(",");
    if (commaIndex === -1) {
      throw new Error("Invalid data URL format");
    }
    const header = base64.slice(0, commaIndex);
    dataString = base64.slice(commaIndex + 1);

    // Extract content type from header
    const mimeMatch = header.match(/data:([^;]+)/);
    if (mimeMatch) {
      contentType = mimeMatch[1] || "";
    }
  }

  // Validate base64 content
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(dataString)) {
    throw new Error("Invalid base64 string");
  }

  // Decode base64 to buffer
  let buffer: Uint8Array;
  try {
    const binaryString = atob(dataString);
    buffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      buffer[i] = binaryString.charCodeAt(i);
    }
  } catch (error) {
    throw new Error(
      `Failed to decode base64: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  // Infer content type from buffer if not provided (magic bytes)
  if (!contentType) {
    contentType = inferContentTypeFromBuffer(buffer);
  }

  return { buffer, contentType };
}

function inferContentTypeFromBuffer(buffer: Uint8Array): string {
  // Check for common image/video magic bytes
  if (buffer.length >= 4) {
    // PNG: 89 50 4E 47
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return "image/png";
    }
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return "image/jpeg";
    }
    // GIF: 47 49 46 38
    if (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    ) {
      return "image/gif";
    }
    // WebP: RIFF...WEBP
    if (
      buffer.length >= 12 &&
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return "image/webp";
    }
    // MP4: ftyp box at offset 4
    if (
      buffer.length >= 8 &&
      buffer[4] === 0x66 &&
      buffer[5] === 0x74 &&
      buffer[6] === 0x79 &&
      buffer[7] === 0x70
    ) {
      return "video/mp4";
    }
    // AVI: RIFF...AVI
    if (
      buffer.length >= 12 &&
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x41 &&
      buffer[9] === 0x56 &&
      buffer[10] === 0x49 &&
      buffer[11] === 0x20
    ) {
      return "video/x-msvideo";
    }
    // WebM: EBML
    if (
      buffer[0] === 0x1a &&
      buffer[1] === 0x45 &&
      buffer[2] === 0xdf &&
      buffer[3] === 0xa3
    ) {
      return "video/webm";
    }
  }

  // Default fallback
  return "application/octet-stream";
}

function buildSafeFileName(
  baseFileName: string | undefined,
  contentType: string,
  folder?: string
): string {
  // Generate a unique ID if no filename provided
  const uniqueId = nanoid(12);

  // Extract extension from content type or filename
  let extension = "";
  if (baseFileName) {
    const match = baseFileName.match(/\.([^.]+)$/);
    if (match) {
      extension = match[1].toLowerCase();
    }
  }

  // If no extension from filename, infer from content type
  if (!extension) {
    const contentTypeMap: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/gif": "gif",
      "image/webp": "webp",
      "image/svg+xml": "svg",
      "video/mp4": "mp4",
      "video/webm": "webm",
      "video/x-msvideo": "avi",
      "video/quicktime": "mov",
    };
    extension = contentTypeMap[contentType] || "bin";
  }

  // Sanitize filename: remove special characters, keep alphanumeric, dash, underscore
  let safeName = baseFileName
    ? baseFileName.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.[^.]+$/, "")
    : `file-${uniqueId}`;

  // Ensure filename isn't empty
  if (!safeName || safeName.length === 0) {
    safeName = `file-${uniqueId}`;
  }

  // Truncate if too long
  const maxNameLength = 100;
  if (safeName.length > maxNameLength) {
    safeName = safeName.slice(0, maxNameLength);
  }

  const fileName = `${safeName}-${uniqueId}.${extension}`;

  // Build path with optional folder
  if (folder) {
    // Sanitize folder name
    const safeFolder = folder
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/^\/+|\/+$/g, "");
    return safeFolder ? `${safeFolder}/${fileName}` : fileName;
  }

  return fileName;
}

function validateMediaKind(
  contentType: string,
  allowedKinds: MediaKind[]
): void {
  const isImage = contentType.startsWith("image/");
  const isVideo = contentType.startsWith("video/");

  if (!(isImage || isVideo)) {
    throw new Error(
      `Unsupported media type: ${contentType}. Only image and video types are allowed.`
    );
  }

  const kind: MediaKind = isImage ? "image" : "video";
  if (!allowedKinds.includes(kind)) {
    throw new Error(
      `Media kind '${kind}' is not allowed. Allowed kinds: ${allowedKinds.join(", ")}`
    );
  }
}

export async function uploadMediaToBlob(
  options: UploadMediaOptions
): Promise<UploadMediaResult> {
  const {
    base64,
    fileName,
    folder,
    access = "public",
    maxBytes = DEFAULT_MAX_BYTES,
    allowedKinds = DEFAULT_ALLOWED_KINDS,
  } = options;

  // Validate token exists
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN environment variable is required");
  }

  // Decode base64 input
  const { buffer, contentType } = decodeBase64Input(base64);

  // Validate file size
  if (buffer.length > maxBytes) {
    throw new Error(
      `File size (${buffer.length} bytes) exceeds maximum allowed size (${maxBytes} bytes)`
    );
  }

  // Validate media kind
  validateMediaKind(contentType, allowedKinds);

  // Build safe filename
  const blobPath = buildSafeFileName(fileName, contentType, folder);

  // Upload to Vercel Blob
  // Convert Uint8Array to Buffer for Vercel Blob compatibility
  const blobBuffer = Buffer.from(buffer);
  // Build options object - only include access if public
  const putOptions = {
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    ...(access === "public" ? { access: "public" as const } : {}),
  };
  // Type assertion to handle SDK type strictness
  const blob = await put(blobPath, blobBuffer, putOptions as any);

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType || contentType,
    size: buffer.length,
  };
}
