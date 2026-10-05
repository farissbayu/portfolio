# Creative-Tech Design Guidelines

Implementation guide for the terminal/HUD-inspired portfolio design. Supersedes the visual layer of [`design-system.md`](./design-system.md); the original zinc + matcha token philosophy still applies underneath.

---

## 1. Design Philosophy

- **Terminal as interface**: the UI speaks in shell prompts, file paths, and mono metadata (`~/work_experience`, `0x01`, `P.02`, `$ echo`).
- **HUD layering**: content sits on a dark/light canvas with ambient glow, a faint grid, scanlines, and grain — like a heads-up display, never loud enough to hurt readability.
- **Quiet confidence + precision**: 1px micro-borders, corner brackets, tight display type, generous whitespace.
- **Two first-class themes**: dark (`index.html`) and light (`index-light.html`) are equal citizens, not an afterthought.

---

## 2. Source Files

| File | Theme | Notes |
| :--- | :--- | :--- |
| `index.html` | Dark | Primary. `zinc` canvas, `matcha` + `signal` accents. |
| `index-light.html` | Light | `paper` canvas, `ink` text, darkened matcha accents. |

Both are **standalone single files** (Tailwind CDN + inline config + inline `<style>` + inline `<script>`). Keep them in lockstep: any content or component change should be mirrored across both themes.

---

## 3. Color Tokens

### Dark theme (`index.html`)
| Role | Token | Value |
| :--- | :--- | :--- |
| Canvas | `bg-zinc-950` | `#09090b` |
| Surface / card | `bg-zinc-900/30–60` | translucent `#18181b` |
| Micro border | `border-zinc-800/80` | `rgba(39,39,42,.8)` |
| Primary text | `text-zinc-100` / `text-white` | `#f4f4f5` / `#fff` |
| Muted text | `text-zinc-400/500` | `#a1a1aa` / `#71717a` |
| Matcha primary | `matcha-500` / `matcha-600` | `#7d8c4e` / `#64723c` |
| Matcha soft text | `matcha-300` | `#b6c7a2` |
| Signal (live) | `signal-400` | `#3fe0a0` |

### Light theme (`index-light.html`)
| Role | Token | Value |
| :--- | :--- | :--- |
| Canvas | `bg-paper-100` | `#f5f6f2` |
| Surface / card | `bg-white/70`–`bg-white` | `#ffffff` |
| Micro border | `border-paper-300` | `#dfe2d6` |
| Heading text | `text-ink-900` | `#181816` |
| Body text | `text-ink-600` | `#52524d` |
| Muted text | `text-ink-400` | `#8b8b83` |
| Matcha primary | `matcha-600` / `matcha-700` | `#64723c` / `#4e5a30` |
| Matcha wash | `bg-matcha-50` + `border-matcha-300` | `#f6f7f2` / `#b6c7a2` |
| Signal (live) | `signal-600` | `#0f9d6b` |

**Contrast rule**: on light, never use `matcha-400` or `signal-400` for body/small text — step to `matcha-700` / `signal-600`. On dark, prefer `matcha-300` for emphasis and `matcha-500` for accents/icons.

---

## 4. Typography

| Purpose | Family | Classes |
| :--- | :--- | :--- |
| Display / headings | **Space Grotesk** | `font-display font-semibold tracking-tight` |
| Body | **Inter** | `font-sans font-light` |
| Meta / code / labels | **JetBrains Mono** | `font-mono` |

- Hero name: `text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.02]`.
- Section titles: `text-xl sm:text-2xl`, prefixed with a mono `~/` path.
- Metadata, dates, tags, buttons: `text-[11px]`–`text-xs` mono, often `uppercase tracking-[0.18em]`.
- Terminal strings use `$`, `>`, `//`, `[ ]`, `●`, `▋`, `◆` glyphs — never icon images for these.

---

## 5. Layout & Spacing

- Container: `max-w-6xl mx-auto px-6`.
- Section rhythm: `space-y-24 sm:space-y-32` on `<main>`; anchor offset `scroll-mt-24`.
- Card radius: `rounded-lg` (small) → `rounded-xl` (cards) → `rounded-2xl` (CTA/footer).
- Grid: stats = `grid-cols-2 md:grid-cols-4` with `gap-px` dividers; skills bento = `grid-cols-1 md:grid-cols-6` with `md:col-span-2/6`; projects = `grid-cols-1 md:grid-cols-2`.

---

## 6. Components

### Section header
```html
<div class="flex items-end justify-between gap-4 border-b border-zinc-800/80 pb-4 mb-8">
  <div class="flex items-baseline gap-3">
    <span class="font-mono text-[11px] text-matcha-500">02</span>
    <h2 class="font-display text-xl font-semibold text-ink-900">
      <span class="font-mono text-matcha-500/70 text-base">~/</span>work_experience
    </h2>
  </div>
  <span class="font-mono text-[11px] text-zinc-600">[ 2023 — present ]</span>
</div>
```

### Status pill
Live availability indicator; use a `pulse-ring` + solid dot:
- Dark: `border-matcha-800/60 bg-zinc-900/60 text-matcha-300`, dot `bg-signal-400`.
- Light: `border-matcha-300 bg-matcha-50 text-matcha-700`, dot `bg-signal-500`.

### Terminal window (photo frame)
Title bar with three dots + mono path, body with the image, overlaid `.scanlines` and a `.scanline` sweep, status footer. Keep window chrome copy (`~/profile.jpeg`, `lat/lon`).

### Tech card
Base: `border bg-*-900/30` (dark) / `bg-white/70` (light) + `hover:-translate-y-0.5`, `hover:border-matcha-*`, `transition-all duration-300`. Featured/current cards get the `tech-card` corner brackets and a top gradient hairline on hover:
```html
<div class="pointer-events-none absolute inset-x-6 top-0 h-px
            bg-gradient-to-r from-transparent via-matcha-500/70 to-transparent
            opacity-0 group-hover:opacity-100 transition-opacity"></div>
```

### Tags / pills
Mono, small, `rounded` (stack) or `rounded-md` (skills). Default is neutral; highlight AI/LLM and Cloudflare with the matcha wash. Hover: `hover:border-matcha-* hover:text-matcha-*`.

### Buttons
- Primary: `bg-matcha-700 hover:bg-matcha-600 text-white font-mono text-xs` + `shadow-matcha-subtle hover:shadow-matcha-glow`.
- Secondary: neutral surface + `border`, hover matcha border.
- Icon buttons: square `p-2.5 rounded-md`, always carry `aria-label` / `title`.

### Timeline (experience)
Current role: `border-matcha-300/800` + `bg-gradient-to-b from-matcha-50 to-white` (light) / `from-matcha-950/20 to-zinc-900/40` (dark). Entries indexed `0x01`, `0x02`; bullets use a mono `>` pseudo-element.

### Marquee
Infinite tech ticker. `.marquee-track` with a duplicated `aria-hidden="true"` row; pause on hover. Keep both rows byte-identical.

### Nav, progress bar, toast
- Nav links: `[NN/]label` mono, scrollspy toggles active matcha text + `aria-current`.
- Progress: 1px gradient bar fixed at top, width = scroll %.
- Toast: fixed bottom-center, `role="status" aria-live="polite"`, fades in/out over 2.2s.

---

## 7. Motion & Animation

Custom keyframes live in the inline `<style>`: `drift`, `marquee`, `blink`, `scan`, `pulse-ring`, plus `.reveal` scroll-in. Guidelines:

- Reveal: 0.7s `cubic-bezier(0.22,1,0.36,1)`, `translateY(20px)` → 0, triggered by `IntersectionObserver` at `threshold: 0.12`.
- Hover: 150–300ms; max lift `-translate-y-0.5`.
- Cursor spotlight: desktop `pointer: fine` only, via `requestAnimationFrame`.
- Typewriter: 75ms type / 45ms delete / 1600ms hold.

**Every animation must be disabled** under `@media (prefers-reduced-motion: reduce)` — `.reveal` becomes static, all keyframe classes set to `animation: none`, typewriter/spotlight replaced with a static string.

---

## 8. Accessibility

- No-JS fallback: `<html>` gets `.js` immediately; `.reveal` only hides when `.js` is present.
- Interactive controls expose `aria-expanded` (menu), `aria-current` (nav), `aria-label` (icon links), `aria-live` (toast).
- Decorative overlays (grid, noise, scanlines, glow) are `pointer-events-none` and `aria-hidden` where appropriate.
- Maintain contrast per §3; retest focus states and grayscale→color photo hover with keyboard nav.

---

## 9. Implementation Conventions

- Tailwind via CDN with an inline `tailwind.config`; extend `fontFamily`, `colors` (`paper`, `ink`, `zinc`, `matcha`, `signal`), and `boxShadow` (`matcha-subtle`, `matcha-glow`, `paper`).
- Custom CSS classes: `.bg-grid-pattern`, `.bg-grid-fade`, `.noise`, `.scanlines`, `.marquee-track`, `.cursor-blink`, `.scanline`, `.pulse-ring`, `.tech-card`, `.glow-border`, `.reveal`.
- Keep JS dependency-free and namespaced; content data is mirrored from [`data.json`](../data.json).
- No build step: editing the HTML is the workflow.

---

## 10. Do / Don't

| Do | Don't |
| :--- | :--- |
| Mirror changes across dark + light files | Ship a change to only one theme |
| Use mono for metadata and display sans for headings | Mix the two randomly |
| Tint highlights with matcha wash, keep surfaces neutral | Flood surfaces with saturated green |
| Keep overlays at low opacity | Let grid/scanlines compete with text |
| Darken accents on light surfaces | Reuse dark-theme accent values as-is on light |
| Gate motion behind `prefers-reduced-motion` | Assume animation is always welcome |
