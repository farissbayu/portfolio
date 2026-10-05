# Portfolio Architecture & Implementation Plan (Astro + Cloudflare)

Comprehensive blueprint for building the personal developer portfolio and article platform for **Faris Bayu Setyawan**, powered by **Astro**, **Tailwind CSS**, and **Cloudflare Services**.

---

## 1. Project Overview & Vision

| Dimension | Specification |
| :--- | :--- |
| **Developer** | Faris Bayu Setyawan (Fullstack Web Developer & AI/LLM Specialist) |
| **Framework** | **Astro 5** (Content-first, Island Architecture, Zero JS by default) |
| **Deployment Platform** | **Cloudflare Pages & Services** via `@astrojs/cloudflare` adapter |
| **Aesthetic** | Minimalist / Swiss Editorial Style |
| **Color Palette** | Zinc neutrals (`#09090b` to `#fafafa`), True Black (`#000000`), Organic Matcha Green (`#7d8c4e`, `#97a97c`) |
| **Article Format** | **Astro Content Collections** (`src/content/articles/*.md` or `*.mdx`) with Zod schema validation |
| **Primary Data Source** | `data.json` (experiences, projects, education, certifications, skills, personal info) |

---

## 2. Why Astro + Cloudflare is the Ideal Match

### 1. Superior Performance & Zero JavaScript Baseline
- Astro renders HTML on the server/build step. Articles and portfolio sections send **0 KB of JavaScript** to the browser by default.
- Interactive components (e.g., search modal, project filter, contact form) run as **Astro Islands** using React (`client:visible` or `client:idle`), hydrating only what is strictly necessary.

### 2. "Simpler Fullstack" with Cloudflare Edge
- **Hybrid Output Mode**: Astro can build pages as pre-rendered static HTML (SSG) for instantaneous global caching, while enabling on-demand edge endpoints (`src/pages/api/contact.ts`) on Cloudflare Workers.
- **Cloudflare Integration**:
  - **Cloudflare Pages**: Fast global distribution with sub-50ms TTFB across 300+ edge locations.
  - **Cloudflare Turnstile**: Free, non-intrusive smart bot detection for the contact form.
  - **Optional Edge Storage**: Direct access to Cloudflare KV or D1 (SQL) for article view counts or feedback without maintaining an external database.
  - **Cloudflare R2**: Ready for asset/file storage if needed.

### 3. Native Markdown & Shiki Support
- Markdown is a first-class citizen in Astro.
- Built-in syntax highlighting powered by **Shiki** (no external heavy client-side Prism.js scripts required).
- Supports `.mdx` for embedding live React components inside technical articles.

---

## 3. Design System & Aesthetics (Zinc, Black & Matcha)

*(See detailed token reference in `docs/design-system.md`)*

- **Background**: Deep Zinc-950 (`#09090b`) canvas with True Black surfaces for maximum contrast.
- **Micro-Borders**: 1px subtle outlines (`border-zinc-800/80`) defining a sleek modular bento grid.
- **Matcha Accents**:
  - Primary Matcha (`#7d8c4e`) for active states, link hovers, and primary CTA buttons.
  - Soft Matcha (`#97a97c` / `#cfe1b9`) for subtle text emphasis, code block highlights, and badges.
  - Matcha Wash (`rgba(125, 140, 78, 0.12)`) for pill backgrounds.
  - Ambient glow (`matcha-500/20`) on featured project cards.
- **Typography**: Clean modern sans-serif (`Geist Sans` or `Inter`) for editorial readability, paired with `Geist Mono` or `JetBrains Mono` for metadata, dates, and code snippets.

---

## 4. Information Architecture & Content Mapping

Data is mapped directly from [data.json](file:///home/farissbayu/projects/portfolio/data.json):

```text
┌─────────────────────────────────────────────────────────────────┐
│                       Header & Navbar                           │
│   [FB. / Faris Bayu]    [About] [Work] [Projects] [Articles]    │
├─────────────────────────────────────────────────────────────────┤
│                         Hero Section                            │
│   • Live Status Indicator ("Available for engineering roles")   │
│   • Headline & Bio (Fullstack Developer & AI Specialist)        │
│   • Quick Contact Links (LinkedIn, Email, GitHub)               │
│   • Optimized Profile Photo (photo_profile.jpeg via Image)      │
├─────────────────────────────────────────────────────────────────┤
│                       Work Experience                           │
│   • Diskominfo Pasuruan (Fullstack Developer)                   │
│   • PT Tetanggaku Saling Bantu (Software Engineer Intern)       │
│   • Clean timeline with bullet points and tech pills            │
├─────────────────────────────────────────────────────────────────┤
│                     Featured Projects                           │
│   • SGS Pendidikan (Grant Management Platform)                  │
│   • TIK Asset Management (GitLab + AI Auto-Report)              │
│   • Job Analysis HR Application                                 │
│   • Besmart (Marketing Activity Web/App)                        │
├─────────────────────────────────────────────────────────────────┤
│                      Articles / Notes                           │
│   • Recent Markdown/MDX articles preview                        │
│   • Reading time, publication date, tags                        │
├─────────────────────────────────────────────────────────────────┤
│                     Skills & Arsenal                            │
│   • Bento Grid: Frontend | Backend | AI & LLM | DevOps & Cloud  │
├─────────────────────────────────────────────────────────────────┤
│               Education, Bootcamps & Awards                     │
│   • IPB University (CS Degree, GPA 3.73)                        │
│   • Bangkit Academy (Top 65 Capstone)                           │
│   • Devscale Bootcamps (AI Python & Next.js)                    │
│   • Gen AI Hackathon APAC Finalist                              │
├─────────────────────────────────────────────────────────────────┤
│                     Contact & Footer                            │
│   • Minimalist contact form / email copy trigger                │
│   • Cloudflare edge deployment badge                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Directory Structure (Astro + Cloudflare)

```text
portfolio/
├── content/                              # (Symlinked or inside src/content)
│   └── articles/
│       ├── ai-automated-reporting.mdx
│       └── scalable-school-grant-management.md
├── docs/                                 # Project documentation & planning
│   ├── PLAN.md                           # Master architectural plan
│   ├── markdown-strategy.md              # Markdown vs. DB analysis
│   └── design-system.md                  # Design system tokens and styling
├── public/
│   ├── favicon.svg
│   └── photo_profile.jpeg                # Source profile photo
├── src/
│   ├── assets/
│   │   └── photo_profile.jpeg            # Optimized via astro:assets
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.astro
│   │   │   ├── StatusPill.astro
│   │   │   └── SectionHeader.astro
│   │   ├── layout/
│   │   │   ├── Navbar.astro
│   │   │   └── Footer.astro
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── Experience.astro
│   │   │   ├── Projects.astro
│   │   │   ├── Skills.astro
│   │   │   └── Education.astro
│   │   ├── articles/
│   │   │   ├── ArticleCard.astro
│   │   │   └── TableOfContents.astro
│   │   └── islands/                      # Interactive React components
│   │       ├── ContactForm.tsx           # Contact form with validation
│   │       ├── ProjectFilter.tsx         # Tag filter for project catalog
│   │       └── CopyButton.tsx            # Interactive copy-to-clipboard
│   ├── content/
│   │   ├── config.ts                     # Zod schema for Content Collections
│   │   └── articles/                     # Markdown/MDX articles
│   ├── layouts/
│   │   ├── BaseLayout.astro              # HTML root with meta tags & fonts
│   │   └── ArticleLayout.astro           # Editorial reading layout for posts
│   ├── pages/
│   │   ├── index.astro                   # Main portfolio home
│   │   ├── articles/
│   │   │   ├── index.astro               # Articles directory / archive
│   │   │   └── [slug].astro              # Dynamic article reader
│   │   ├── api/
│   │   │   └── contact.ts                # Cloudflare Pages Function endpoint
│   │   ├── rss.xml.ts                    # Dynamic RSS feed generator
│   │   └── 404.astro
│   ├── lib/
│   │   ├── portfolio.ts                  # Type-safe loader for data.json
│   │   └── utils.ts                      # Date formatting & reading time calculator
│   └── types/
│       └── portfolio.ts                  # TypeScript types for data.json
├── astro.config.mjs                      # Astro config with Cloudflare & Tailwind
├── tailwind.config.mjs                   # Custom Zinc + Matcha theme
├── tsconfig.json
├── data.json                             # Master portfolio data
└── package.json
```

---

## 6. Cloudflare Configuration & Deployment

### Astro Configuration (`astro.config.mjs`):
```javascript
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

export default defineConfig({
  output: 'hybrid', // Pre-render static pages, allow on-demand API endpoints
  adapter: cloudflare({
    imageService: 'cloudflare', // Optional Cloudflare Image Resizing
  }),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
    mdx(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'vitesse-dark', // Beautiful dark theme with matcha-compatible tones
      wrap: true,
    },
  },
});
```

### Cloudflare Deployment Workflow:
1. **GitHub Connection**: Push code to GitHub repository.
2. **Cloudflare Pages Setup**:
   - Framework preset: `Astro`
   - Build command: `npm run build` or `pnpm build`
   - Build output directory: `dist`
3. **Custom Domain**: Connect domain via Cloudflare DNS with automatic SSL & DDoS protection.

---

## 7. Phased Implementation Roadmap

### Phase 1: Astro Project Scaffolding
- Initialize clean Astro project with TypeScript.
- Install integrations: `@astrojs/cloudflare`, `@astrojs/tailwind`, `@astrojs/react`, `@astrojs/mdx`.
- Configure Tailwind with the Zinc + Black + Matcha color scheme.

### Phase 2: Design System & Base Layout
- Set up `BaseLayout.astro` with font loading (`Geist Sans` & `Geist Mono`), SEO metadata, and open-graph tags.
- Build clean top navigation bar with blur effect (`backdrop-blur-md bg-zinc-950/80`) and responsive mobile menu.
- Build footer with Cloudflare indicator and social links.

### Phase 3: Portfolio Sections (Data Ingestion from `data.json`)
- Create TypeScript types for `data.json`.
- Implement `Hero.astro` with profile photo (`photo_profile.jpeg`), bio, and animated live status indicator.
- Implement `Experience.astro` with clean timeline layout, responsibilities, and tech pills.
- Implement `Projects.astro` showcasing SGS Pendidikan, TIK Asset Management, etc.
- Implement `Skills.astro` categorized into Frontend, Backend, AI/LLM, Database, and DevOps/Cloudflare.
- Implement `Education.astro` with universities, bootcamps, and certifications.

### Phase 4: Markdown Article Engine
- Set up `src/content/config.ts` using Astro Content Collections with Zod schema.
- Implement `ArticleLayout.astro` styled with customized Tailwind Typography (`prose-invert prose-zinc prose-matcha`).
- Build `/articles` archive page with tag filtering.
- Build `/articles/[slug]` with reading time calculation and table of contents.
- Create initial sample articles based on Faris's real projects (e.g., AI automated reporting, school grant management).

### Phase 5: Simpler Fullstack & Cloudflare Endpoints
- Implement `src/pages/api/contact.ts` running as a Cloudflare Pages Function.
- Integrate interactive `ContactForm.tsx` island with toast notifications.
- Generate dynamic `rss.xml.ts` and `sitemap.xml`.

### Phase 6: Testing, Optimization & Cloudflare Deployment
- Test production build (`npm run build`).
- Validate Lighthouse performance score (target: 95+ across Performance, Accessibility, Best Practices, SEO).
- Prepare `wrangler.toml` or Cloudflare Pages build settings for instant deployment.
