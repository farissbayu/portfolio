export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const HIGHLIGHT_TECHS = new Set(["AI/LLM", "GitLab"]);

export function isHighlightTech(tech: string): boolean {
  return HIGHLIGHT_TECHS.has(tech);
}
