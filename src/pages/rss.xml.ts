import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { personal_information } from "../lib/portfolio";

export async function GET(context: APIContext) {
  const articles = (await getCollection("articles", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf()
  );

  return rss({
    title: `${personal_information.name} — Articles`,
    description: "Notes on fullstack engineering, AI/LLM integration, and building practical software.",
    site: context.site ?? "https://farisbayu.dev",
    items: articles.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.publishedDate,
      description: entry.data.description,
      link: `/articles/${entry.id}/`,
    })),
  });
}
