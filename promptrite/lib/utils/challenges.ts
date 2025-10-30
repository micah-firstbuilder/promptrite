import type { ChallengeGoal } from "@/types/challenges";

export type TechnicalMode = "ui" | "code" | "image" | "video" | "unsupported";

export const mapCategoryToTechnicalMode = (
  category: string | null
): TechnicalMode => {
  if (!category) return "unsupported";

  const normalizedCategory = category.toLowerCase().trim();

  switch (normalizedCategory) {
    case "design":
      return "ui";
    case "ui":
      return "ui";
    case "general":
      return "ui";
    case "code":
      return "code";
    case "image":
      return "image";
    case "video":
      return "video";
    default:
      return "unsupported";
  }
};

export const normalizeGoals = (raw: unknown): ChallengeGoal[] => {
  if (!raw || typeof raw !== "object") return [];
  if (!Array.isArray(raw as any)) return [];
  const arr = raw as Array<any>;
  const toSlug = (text: string): string =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const normalized: ChallengeGoal[] = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i] ?? {};
    const title: string =
      typeof item.title === "string" && item.title.trim()
        ? item.title.trim()
        : `goal-${i + 1}`;
    const id: string =
      typeof item.id === "string" && item.id.trim()
        ? item.id.trim()
        : toSlug(title) || `goal-${i + 1}`;
    const criteria: string =
      typeof item.criteria === "string" && item.criteria.trim()
        ? item.criteria.trim()
        : typeof item.description === "string" && item.description.trim()
          ? item.description.trim()
          : title;
    const weight: number | undefined =
      typeof item.weight === "number" && Number.isFinite(item.weight)
        ? item.weight
        : undefined;
    const critical: boolean | undefined =
      typeof item.critical === "boolean" ? item.critical : undefined;
    normalized.push({ id, title, criteria, weight, critical });
  }
  return normalized;
};
