---
title: "Testing Image Handling in Markdown Articles"
description: "A dummy article that embeds a local image to verify Astro content-collection image optimization in markdown."
publishedDate: 2026-10-05
tags: ["Astro", "Testing", "Images"]
draft: false
featured: false
---

This is a throwaway article used to confirm that images referenced from
`src/content/attachments/` resolve and get optimized when rendered through the
article layout.

## Relative image import

The image below is referenced with a relative markdown path. Astro resolves it
against the article file and pipes it through the image service.

![Portfolio repository page after the scaffold](./../attachments/Screenshot%202026-10-05%20120206.png)

## What to verify

- The image renders inside the `.prose` container without overflowing.
- The `<img>` output points at an optimized `/_astro/*.webp` asset.
- Width and height attributes are present to prevent layout shift.

If all three hold, markdown image handling is working end to end.
