---
title: "Article Title"
description: "One-sentence summary used for SEO, cards, and RSS."
publishedDate: 2026-01-01
updatedDate: 2026-01-15
tags: ["Tag One", "Tag Two"]
draft: true
featured: false
---

Opening paragraph. Lead with the problem or outcome in one or two sentences.

## First section

Body text. Keep paragraphs short and use `inline code` for identifiers.

```ts
// Code blocks are highlighted automatically via Shiki (vitesse-dark).
export function example(input: string): string {
  return input.trim();
}
```

## Images

Store images in `src/content/attachments/` and reference them relative to this
file. URL-encode spaces as `%20`. Astro fails the build if the referenced file
does not exist, so only add the line below once the image is committed.

<!-- ![Alt text describing the image](./../attachments/your-image.png) -->

## Tables and lists

| Column A | Column B |
| :------- | :------- |
| value    | value    |

- Bullet one
- Bullet two

> Blockquote for callouts or key takeaways.

## Takeaways

Close with what the reader should remember or do next.
