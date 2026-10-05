# Design System: Minimalist Zinc, Black & Matcha

A design specification for Faris Bayu's portfolio, combining clean Swiss/editorial minimalism with an earthy, modern matcha accent palette.

---

## 1. Design Philosophy

- **Quiet Confidence**: Understated typography, high whitespace ratio, and crisp structure. Content takes center stage.
- **Precision & Geometry**: 1px micro-borders, subtle grid alignments, mono-spaced metadata badges, and clean rounded corners (`rounded-md` or `rounded-lg`).
- **Tactile Palette**: Deep blacks and slate-infused zinc neutrals balanced by an organic, sophisticated matcha green accent for highlights, hover states, status indicators, and active navigation.

---

## 2. Color Palette & Design Tokens

### The Foundation: Zinc & True Black
| Role | Tailwind Token | Hex / Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Dark Canvas** | `bg-black` / `zinc-950` | `#09090b` | Background in dark mode; creates deep contrast |
| **Surface Raised** | `zinc-900` | `#18181b` | Cards, elevated modals, code blocks |
| **Surface Subtle** | `zinc-800` | `#27272a` | Hover states, secondary buttons |
| **Micro Border** | `zinc-800/60` | `rgba(39, 39, 42, 0.6)` | 1px hairline dividers and card outlines |
| **Muted Text** | `zinc-400` / `zinc-500`| `#a1a1aa` / `#71717a` | Timelines, roles, subtitles, metadata |
| **Primary Text** | `zinc-100` / `white` | `#f4f4f5` / `#ffffff` | Headings, hero statement, core body text |

### The Accent: Matcha Spectrum
Instead of neon greens, the matcha palette uses refined, desaturated botanical tones that feel organic and premium.

| Name | Hex Code | Tailwind Custom Token | Usage |
| :--- | :--- | :--- | :--- |
| **Matcha Leaf** | `#606c38` | `matcha-700` | Deep accents, dark-mode secondary borders |
| **Matcha Pure** | `#7d8c4e` | `matcha-600` | **Primary Accent**: buttons, active links, badges |
| **Matcha Soft** | `#97a97c` | `matcha-500` | Subtle text emphasis, code block keyword highlights |
| **Matcha Tint** | `#cfe1b9` | `matcha-300` | Light badge text, glow effects |
| **Matcha Wash** | `rgba(125, 140, 78, 0.12)` | `matcha-500/12` | Tag backgrounds, subtle hover tints, chip badges |
| **Matcha Glow** | `rgba(125, 140, 78, 0.25)` | `shadow-matcha` | Subtle ambient glow on featured project cards |

---

## 3. Typography Hierarchy

- **Display & Headings**: `font-sans` (e.g. *Geist Sans*, *Inter*, or system neo-grotesque sans).
  - Clean, tight tracking (`tracking-tight`), medium to semi-bold weights (`font-medium` to `font-semibold`).
- **Body & Editorial**: `font-sans` with high legibility line-height (`leading-relaxed`), soft off-white/zinc text for zero eye strain.
- **Technical & Meta**: `font-mono` (e.g. *Geist Mono*, *JetBrains Mono*, or *Fira Code*).
  - Used for dates, technology stack pills, file paths, stats, and git commit-style indicators.

```css
/* Example Tailwind Config Extension */
theme: {
  extend: {
    colors: {
      matcha: {
        50: '#f5f7f2',
        100: '#e8ede1',
        200: '#d3dec4',
        300: '#b4c79f',
        400: '#97a97c',
        500: '#7d8c4e',
        600: '#64723c',
        700: '#4e5a30',
        800: '#3f4829',
        900: '#363d25',
        950: '#1b2011',
      }
    }
  }
}
```

---

## 4. Component Styles

### Status / Availability Pill
A live radar-style indicator at the top of the hero section:
- Outer ring: `bg-matcha-500/20 ring-1 ring-matcha-500/40 animate-pulse`
- Core dot: `bg-matcha-500 w-2 h-2 rounded-full`
- Text: `"Available for select engineering opportunities"`, font-mono, text-xs.

### Technology Badge
- Styling: `text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-matcha-600/50 hover:text-matcha-300 transition-colors`

### Project Showcase Cards
- Background: `bg-zinc-950/60 backdrop-blur-sm`
- Border: `border border-zinc-800/80 hover:border-matcha-600/50`
- Top Accent: Subtle 1px gradient line across the top border transitioning from transparent to `matcha-500/40` to transparent on hover.

### Interactive Micro-Interactions
- Smooth 150–200ms transitions (`transition-all duration-200 ease-out`).
- Minimal hover lifts (`hover:-translate-y-0.5`).
- Underline reveal animations for article links using matcha accent colors.
