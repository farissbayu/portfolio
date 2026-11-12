import { getCollection } from "astro:content";

export interface SectionLink {
  id: string;
  label: string;
}

/**
 * Single source of truth for the landing page sections, in render order.
 * Used by the navbar and the deck rail so navigation can never drift out of
 * sync with `src/pages/index.astro`.
 */
export async function getSectionLinks(): Promise<SectionLink[]> {
  const hasArticles = (await getCollection("articles", ({ data }) => !data.draft)).length > 0;

  return [
    { id: "about", label: "about" },
    { id: "work", label: "work" },
    { id: "projects", label: "projects" },
    ...(hasArticles ? [{ id: "articles", label: "articles" }] : []),
    { id: "skills", label: "skills" },
    { id: "education", label: "education" },
    { id: "personal", label: "personal" },
    { id: "contact", label: "contact" },
  ];
}
