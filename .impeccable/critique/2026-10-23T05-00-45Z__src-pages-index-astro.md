---
target: homepage
total_score: 28
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 3
target_identity: "file:/home/farissbayu/projects/portfolio/src/pages/index.astro"
target_fingerprint: "sha256:eda6322612470b9e9488b1fbecc8b001f5e8071b712bff9b25ac6467f43fcb54"
target_path: /home/farissbayu/projects/portfolio/src/pages/index.astro
timestamp: 2026-10-23T05-00-45Z
slug: src-pages-index-astro
---
⚠️ DEGRADED: single-context (no sub-agent tool exposed)

**Target:** `src/pages/index.astro` (homepage, viewed at 1440px and 390px in dark and light themes)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Active nav, scroll progress, and copy confirmation work; the ARTICLES nav item is a dead control and project filtering gives no result count. |
| 2 | Match System / Real World | 3 | The terminal motif is coherent, but `work_experience`, `0x01`, and `P.01` are developer language for a recruiter audience. |
| 3 | User Control and Freedom | 3 | Filters clear via "all", mobile menu closes after selection, no traps; no back-to-top affordance on a very long page. |
| 4 | Consistency and Standards | 2 | Two numbering systems: nav shows five items [01]–[05], sections show 02–07 and skip 04 when Articles is hidden. Contact is [05] in nav, 07 in its header. |
| 5 | Error Prevention | 4 | No forms or destructive actions; the email address remains available if copy fails. |
| 6 | Recognition Rather Than Recall | 3 | Main sections and actions are visible; Skills and Education are absent from the nav. |
| 7 | Flexibility and Efficiency | 3 | Fixed nav, filters, copy button, both themes; keyboard accelerators are not expected on a portfolio. |
| 8 | Aesthetic and Minimalist Design | 3 | Strong type and color restraint, but grid, noise, scanline, shimmer, and fake window chrome add decoration while long work bullets add density. |
| 9 | Error Recovery | 3 | Copy failure is silent; there are no other error paths. |
| 10 | Help and Documentation | n/a | Self-explanatory one-page portfolio; no task help is required. |
| **Total** | | **28/36** | **Good (78%)** |

Scored 9 of 10 heuristics. H10 is n/a; maximum renormalized to 36.

## Design Specificity Verdict

**LLM assessment:** The visual world is a coherent "developer terminal / OS window" system: `$ whoami`, `~/` section titles, `0x01`, `P.01`, `[01/]` nav numbering, a fake terminal photo frame, scanlines, and a grid background. It is executed consistently across dark and light themes. But it is category-interchangeable: the same shell could wrap any fullstack developer's portfolio. The specific, defensible part is the content — Pasuruan Regency public-sector digitization, SGS Pendidikan, TIK Asset Management with GitLab and MCP, and applied AI/LLM work. The interface does not yet make that evidence the star.

**Deterministic scan:** 2 findings.
- `overused-font` (warning) at `src/layouts/BaseLayout.astro:42` — Google Fonts Inter. Space Grotesk is also a saturated face, though the detector only flags the Inter import.
- `codex-grid-background` (advisory) at `src/styles/global.css:251` — decorative two-axis grid. It is deliberate and almost invisible in light theme; still a generated-UI signature rather than a content-derived pattern.
- No contrast, gradient-text, eyebrow, or other slop-family hits. The detector missed the dead nav, exposed phone, filter overload, small tap targets, and robotic copy; those came from the design review.

**Visual overlays:** Direct headless captures were used at 1440px and 390px, dark and light. The interactive live-server overlay was not injected (no interactive browser automation), so no user-visible overlay exists; this report uses screenshots and source review.

## Overall Impression

The hero is genuinely well built: a large name, immediate availability, a portrait in a workspace frame, and a clear summary. The page is coherent and feels authored rather than assembled. The biggest opportunity is not more visual flourish; it is making the distinctive public-sector and AI delivery evidence scannable, and making the primary conversion action — starting an email — impossible to miss. The phone number and dead ARTICLES control undercut trust.

## What's Working

1. **Hero composition:** The name, availability pill, role chips, profile, and portrait establish identity and fit in one viewport. The portrait frame is a nice piece of world-building that does not obscure the person.
2. **A real design system:** Semantic tokens drive both themes, section rhythm is consistent, and the current role is visibly distinguished without breaking the card language. Light and dark both hold together.
3. **Clear card hierarchy:** Section headers, mono metadata, badges, and card surfaces are consistent. The work and education cards are easy to parse structurally even when the copy is dense.

## Priority Issues

### [P1] Contact publishes a phone number that PRODUCT.md says is not a public path
**Why it matters:** PRODUCT.md explicitly says the phone number is not a confirmed public contact path and future work must not surface it. Publishing it invites spam and violates the project's own product truth. It also exposes personal data that a recruiter does not need.
**Fix:** Remove the phone row from `Contact.astro`; keep email and LinkedIn as the public paths. If a phone is ever needed, put it in a downloadable CV with the owner's consent.
**Suggested command:** `/impeccable harden`

### [P1] The ARTICLES nav item is a dead control until articles exist
**Why it matters:** `Navbar.astro` always renders five links, but `Articles.astro` renders nothing when the collection is empty. On the homepage, clicking ARTICLES does nothing (the script returns when the target is missing). From `/articles/`, it points to a `#articles` section that does not exist. This reads as a broken site.
**Fix:** Hide the Articles nav item when there are no published articles, or always render the section with an honest empty state. On the articles index, point the item at `/articles/` and expose a current-page state.
**Suggested command:** `/impeccable harden`

### [P1] The primary conversion action is buried
**Why it matters:** Success for this site is starting a conversation, yet the hero presents "email" as an 11px peer chip next to LinkedIn and three role tags, and the contact section is seven sections down. A recruiter convinced by the hero has to hunt for the action.
**Fix:** Make email the single primary CTA in the hero (solid accent button or strong bordered button with a visible address or "Email me"), keep LinkedIn secondary, and surface location plus availability next to it. Keep the copy button in Contact for convenience.
**Suggested command:** `/impeccable layout` + `/impeccable clarify`

### [P2] Projects is filter-heavy and evidence-light
**Why it matters:** Seventeen technology chips precede the cards, which is a decision point with more than four options and pushes the actual work below the fold on mobile. The cards hide the `responsibilities`/outcome data already in `data.json` and show only short descriptions, so the section repeats the work section instead of proving it.
**Fix:** Reduce filters to a few high-signal categories or put them behind a disclosure; show one or two outcome lines per project; let the first project anchor the section. Keep all existing facts.
**Suggested command:** `/impeccable distill` + `/impeccable layout`

### [P2] Work bullets are robotic and hard to scan
**Why it matters:** Every responsibility is a 30–45 word "Accomplished X as measured by Y, by developing Z" sentence. The outcome is buried after the verb, the formula repeats, and recruiters scan rather than parse. It makes strong work feel like an ATS export.
**Fix:** Rewrite each bullet as action → outcome in 15–20 words, keeping every claim: e.g. "Shipped SGS Pendidikan, digitizing school grant applications and SPJ reporting for the Pasuruan Regency Education Office." This changes factual copy, so confirm before editing `data.json`.
**Suggested command:** `/impeccable clarify`

## Persona Red Flags

**Rina (hiring manager, project-specific):** Identifies role fit and availability quickly, but the email action is visually subordinate to role tags. The phone number is an unexpected privacy signal. The ARTICLES item does nothing. Project cards do not show the outcomes she needs to compare the public-sector work against other candidates.

**Casey (distracted mobile user):** The 17 filter chips wrap into several rows at the top of Projects, with roughly 24px tap targets. The long work bullets require substantial scrolling, and there is no sticky contact action. The fixed header is reachable, but the primary action is not.

**Sam (accessibility-dependent user):** 10–11px mono labels are difficult at 200% zoom. Focus relies on browser defaults rather than a designed focus-visible state. The mobile menu opens without moving focus into it. The theme toggle's aria-label does not announce the next state. Contrast passes, and images have alt text.

## Minor Observations

- Two numbering systems: nav `[01]`–`[05]` versus section headers `02`–`07`. Contact is `[05]` in the nav and `07` in its header; when Articles is hidden, Skills starts at `05` and the gap is visible. Pick one system or make the nav labels non-numeric.
- "Available for fullstack and ai opportunities" — capitalize "AI"; consider "Open to full-time fullstack and AI roles" since availability is confirmed.
- The photo frame's "● online" is decorative and potentially misleading (it is a static portfolio, not a live chat). Replace it with location, "open to work", or remove it.
- 10–11px labels and 24–32px interactive chips are below comfortable mobile reading and tap sizes; bring filter chips and the theme/menu buttons closer to 40–44px on touch.
- Add `:focus-visible` styles for links and buttons; browser defaults vary across the two surfaces.
- Normalize dates: "Aug 2025 - Now" versus "2023 — present"; "Oct 2023 - Nov 2023".
- The implementation quote: production font stack is Inter + Space Grotesk + JetBrains Mono; Inter is saturated and Space Grotesk is close behind. If specificity matters more than safety, swap the body face (IBM Plex Sans would fit the institutional/public-sector story) before touching layout.
- The grid-line background and noise are decorative signatures. The page would lose little if the grid were removed or confined to one intentional surface.
- Project cards re-number by filtered index (`P.01` changes after filtering). If those numbers are meant as identifiers, keep them stable.
- The theme toggle's aria-label is static ("Toggle color theme"); announce the destination ("Switch to light theme").
- The `/articles/` empty state is honest. If articles are not the near-term channel, keep it out of the primary nav until there is content.

## Questions to Consider

- If email were the only button in the hero, what would you remove to make room?
- Does the terminal world earn its place, or is it a costume over the public-sector evidence?
- What would Projects look like if every card had to prove one outcome in one line?
- Could the page be one screen shorter and twice as convincing?
