import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://farissbay.my.id",
  output: "static",
  adapter: cloudflare({
    imageService: "compile",
    prerenderEnvironment: "node",
  }),
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
      wrap: true,
    },
  },
});
