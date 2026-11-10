# Rencana Implementasi — Neon Lime "Calling Card"

Reskin situs (Astro 7 + Tailwind v4) ke sistem **Neon Lime**, deck landing tetap jadi navigasi utama,
plus motion layer gaya Persona 5. Tanpa dependency baru.

Referensi visual: [`neon-lime.html`](neon-lime.html) · [`shots/`](shots/).

---

## 1. Tujuan & batasan

**Tujuan**

- Token warna/tipografi baru menggantikan matcha + zinc.
- Deck landing dipertahankan (mekanik slide yang sudah ada), chrome-nya jadi rail vertikal khas P5.
- Animasi masuk akal banyaknya: transisi slide, reveal konten, hover kartu, page transition.
- Artikel tetap enak dibaca (panel kertas di atas shell gelap).

**Batasan (jangan disentuh)**

- `data.json`, `src/lib/*`, `src/types/*`, `src/content.config.ts` — sumber fakta tidak berubah.
- URL, `id` section, RSS, sitemap, JSON-LD, title/description.
- Tidak ada library animasi baru (GSAP, Motion One, Lenis). CSS + JS ≤ 150 baris tambahan.
- `prefers-reduced-motion` wajib jadi state statis yang tetap enak dilihat.
- Light theme tetap hidup (PRODUCT.md: first-class), dipetakan ke "paper mode".

**Keputusan yang saya ambil (bisa diveto)**

| Topik | Default |
|---|---|
| Light theme | Dipertahankan: kanvas kertas, teks ink, lime hanya sebagai permukaan |
| Label game | Jadi eyebrow; `<h2>` memakai bahasa manusia (`Work record`, bukan `confidant`) untuk a11y + recruiter scan |
| Bintang "rank" | Tidak dipakai. Rating bintang = klaim tanpa bukti; cukup nomor rank |
| Sound / cursor custom | Tidak dipakai |

---

## 2. Token

Ganti blok `:root` dan `:root[data-theme="light"]` di `src/styles/global.css`.

```css
:root {
  /* surfaces */
  --surface: #070a06;
  --surface-raised: #0f130c;
  --surface-sunken: #0a0c09;
  --surface-card: #f6ffe4;          /* kartu baca: putih-gading */
  /* text */
  --text-strong: #f6ffe4;
  --text-body: #c8d1b8;
  --text-muted: #a3ad92;
  --text-faint: #7f8a72;            /* ≥ 4.5:1 di --surface-raised */
  --text-on-card: #14180f;
  --text-on-card-muted: #4a5340;
  /* accent */
  --accent: #c9f73d;                /* PERMUKAAN + teks di atas gelap */
  --accent-ink: #d7ff6b;            /* teks aksen di atas gelap */
  --accent-on-light: #5a7a08;       /* teks aksen di atas kertas */
  --on-accent: #0a0c06;             /* teks di atas blok lime */
  --accent-surface: rgba(201, 247, 61, 0.10);
  --accent-border: rgba(201, 247, 61, 0.34);
  /* signal */
  --signal: #ff4fa3;                /* hanya titik status */
  /* lines & effects */
  --border-hairline: #262c1f;
  --border-strong: #3a4430;
  --shadow-card: 8px 8px 0 rgba(201, 247, 61, 0.42);
  --shadow-hard: 5px 5px 0 rgba(0, 0, 0, 0.8);
  --halftone: rgba(246, 255, 228, 0.9);
  --selection-bg: rgba(201, 247, 61, 0.3);
  --selection-fg: #0a0c06;
}

:root[data-theme="light"] {
  --surface: #f4f7e8;
  --surface-raised: #ffffff;
  --surface-sunken: #e9efd6;
  --surface-card: #ffffff;
  --text-strong: #14180f;
  --text-body: #333c28;
  --text-muted: #4f5a42;
  --text-faint: #666f58;
  --text-on-card: #14180f;
  --text-on-card-muted: #4a5340;
  --accent: #c9f73d;
  --accent-ink: #5a7a08;            /* di kertas, lime terang bukan untuk teks */
  --accent-on-light: #4c6806;
  --on-accent: #0a0c06;
  --accent-surface: rgba(201, 247, 61, 0.35);
  --accent-border: rgba(90, 122, 8, 0.35);
  --signal: #d81b6e;                /* pink digelapkan agar lolos AA di kertas */
  --border-hairline: rgba(20, 24, 15, 0.14);
  --border-strong: rgba(20, 24, 15, 0.28);
  --shadow-card: 8px 8px 0 rgba(90, 122, 8, 0.28);
  --halftone: rgba(20, 24, 15, 0.5);
}
```

**Aturan warna (ditegakkan di review):**

1. Teks di atas `--accent` selalu `--on-accent`. Putih di lime = 1.7:1, dilarang.
2. `--signal` hanya untuk titik 6px, tidak pernah jadi permukaan atau teks panjang.
3. Luas lime per layar ≤ 15% (band kontak + tombol utama + strip meter).
4. Kartu baca selalu `--surface-card` dengan `--text-on-card`; jangan teks gelap di atas kanvas gelap.

---

## 3. Tipografi

```css
@theme {
  --font-display: "Anton", Impact, ui-sans-serif, sans-serif;
  --font-sans: "Barlow", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

- `BaseLayout.astro`: ganti satu tag `<link>` Google Fonts → `Anton`, `Barlow:wght@400;500;600;700`, `JetBrains Mono`.
- `display=swap` + fallback `Impact` supaya CLS kecil; Anton hanya untuk heading, tidak untuk body.
- Skala: H1 `clamp(2.5rem, 6vw, 4.375rem)` / H3 2.25rem / body 0.9375rem / meta 0.5625rem uppercase mono.
- Heading Anton pakai `letter-spacing: .01em`, `text-transform: uppercase`; jangan italic (P5 pakai skew, bukan italic).

---

## 4. Arsitektur layout deck

```
┌────────────┬───────────────────────────────────────────────┐
│  RAIL      │  SLIDE (flex, scroll internal)                │
│  250px     │                                               │
│  fixed     │   max-width 1180, padding 40                  │
│            │                                               │
│  FBS mark  │   eyebrow · H1 · tags · lede · CTA            │
│  About     │   ┌─────────┬─────────┬─────────┐             │
│  Work      │   │ card    │ card    │ card    │             │
│  Projects  │   └─────────┴─────────┴─────────┘             │
│  Skills    │                                               │
│  Contact   │                                               │
│            │                                               │
│  meta      │                                               │
│  flag      │                                               │
└────────────┴───────────────────────────────────────────────┘
   ↑ hidden < 1152px, diganti Topbar + menu
```

- `main.deck` tetap `position: fixed; inset: 0` dan track tetap `translate3d(--deck-index * -100%)`.
- Rail = `position: fixed; left: 0; top: 0; bottom: 0; width: 250px`; `main.deck` diberi `padding-left: 250px` di ≥1152px.
- Slot slide tetap `flex: 0 0 100%`; isi slide dibungkus `.slide-inner { max-width: 1180px; margin-inline: auto; }`.
- Bottom bar: dari 56px jadi strip 44px berisi `01/07`, hint `← →`, tombol prev/next.
- Mobile (<1152px): rail hilang; `Topbar` (logo + status + menu) + menu overlay penuh dengan item Anton 28px.
- Halaman artikel: tidak memakai deck; `BaseLayout` merender `Topbar`, bukan rail.

**Komponen baru** (semua di `src/components/layout/`):

| Komponen | Isi | Dipakai di |
|---|---|---|
| `Rail.astro` | mark, nav Anton, indikator blok aktif, meta, flag status | deck |
| `Topbar.astro` | logo, nav ringkas, toggle theme, tombol menu | artikel, 404, mobile |
| `Wipe.astro` | 1 div overlay untuk transisi slide | deck |

`Navbar.astro` lama dipecah jadi dua file di atas lalu dihapus; `BaseLayout` menerima prop `chrome: "deck" | "page"`.

---

## 5. Perubahan per file

| # | File | Perubahan |
|---|---|---|
| 1 | `src/styles/global.css` | Token baru (§2), font scales, utilities `.p-btn`, `.p-tag`, `.p-card`, `.halftone`, `.rule-skew`, `.rail-item`, motion token. Hapus `.shimmer`, `.tech-card`, `.scanlines`, `.section-rule`, `.marquee-*` (tidak dipakai lagi). Pertahankan blok `.article-prose` dengan warna baru. |
| 2 | `src/layouts/BaseLayout.astro` | `chrome` prop; font link; layer `halftone` + vignette; `theme-color` `#070a06`; `ClientRouter` untuk page transition. |
| 3 | `src/components/layout/Rail.astro` (baru) | Menu slide + `aria-current`, indikator, status flag. |
| 4 | `src/components/layout/Topbar.astro` (baru) | Versi ringkas untuk halaman non-deck + mobile. |
| 5 | `src/components/layout/Deck.astro` | Hapus dot-rail kanan; tambah `data-active` per slide; counter animasi; wipe trigger; logika wheel/keyboard/touch **tidak diubah**. |
| 6 | `src/components/layout/Footer.astro` | Strip mono, border atas hairline, tidak ada jarak 24. |
| 7 | `src/components/common/StatusPill.astro` | Flag lime + titik pink `--signal`, skew -10deg. |
| 8 | `src/components/common/Badge.astro` | `.p-tag` (paper + ink) / `.p-tag.acc` (lime + ink). |
| 9 | `src/components/common/SectionHeader.astro` | Props `index` (romawi), `title`, `eyebrow?`, `meta?`. H2 Anton, eyebrow mono, garis hairline. |
| 10 | `src/components/sections/Hero.astro` | Nama 2 baris Anton, lede, CTA `.p-btn`, portrait calling-card (rotasi -2.4deg, slab "Player 01", stamp status). |
| 11 | `src/components/sections/Experience.astro` | Baris "confidant": rank, perusahaan, periode, garis kiri lime. Tanpa bintang. |
| 12 | `src/components/sections/Projects.astro` + `projects/ProjectCard.astro` | Kartu kertas `--surface-card`, tab `No. 00X`, tag hitam, footer `Case file ↗`. |
| 13 | `src/components/sections/Skills.astro` | Grid 5 kolom kartu gelap, label Anton + garis lime. |
| 14 | `src/components/sections/Education.astro` | Panel gelap, nomor romawi, baris hairline. |
| 15 | `src/components/sections/AppleMusic.astro` | Embed dalam frame hairline; daftar artis dengan nomor + border lime tipis. |
| 16 | `src/components/sections/Contact.astro` | Band lime `clip-path` potongan kertas, tombol ink, email mono. |
| 17 | `src/layouts/ArticleLayout.astro` | Shell gelap; artikel di `.sheet` (kertas) supaya teks panjang nyaman; TOC tetap. |
| 18 | `src/components/articles/ArticleCard.astro` | Kartu kertas + tab nomor. |
| 19 | `src/pages/404.astro` | Panel "GAME OVER" + tombol balik. |
| 20 | `public/og.png` | Render ulang 1200×630 dari HTML yang sama (Neon Lime). |
| 21 | `src/components/islands/CopyButton.tsx` | Class tombol baru (logika tidak berubah). |

Tidak berubah: `src/pages/index.astro` (urutan section), `src/lib/*`, `src/pages/rss.xml.ts`, `articles/*`.

---

## 6. Motion system

Token:

```css
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-punch: cubic-bezier(0.2, 0.9, 0.2, 1.2);
  --dur-slide: 600ms;
  --dur-reveal: 520ms;
  --dur-ui: 180ms;
}
```

| # | Nama | Trigger | Implementasi | Durasi |
|---|---|---|---|---|
| 1 | Slide track | ganti slide | `transform` di `.deck-track` (sudah ada), easing diganti `--ease-out` | 600ms |
| 2 | Lime wipe | ganti slide | div `Wipe.astro`; JS tambah class `.is-running`, `animationend` hapus. `@keyframes` geser sliver 22% lebar, `skewX(-8deg)`, opacity 1→0 | 520ms |
| 3 | Slide enter stagger | slide jadi aktif | `section[data-active] .reveal-item { animation: card-in …; animation-delay: calc(var(--i) * 60ms) }` | 520ms |
| 4 | Heading wipe | slide aktif | `clip-path: inset(0 100% 0 0)` → `inset(0)` + `translateX(-12px)` → 0 | 480ms |
| 5 | Rail indicator | ganti slide | satu elemen `.rail-indicator`; JS set `--rail-y` dari `offsetTop` link aktif; `transform: translateY()` | 320ms |
| 6 | Counter roll | angka berubah | JS 10 baris: `animateNumber(el, from, to)` via `requestAnimationFrame`, 24 frame | 400ms |
| 7 | Card hover | hover/focus | `translate(-2px,-2px)` + `box-shadow` naik + tab `rotate(0)` | 160ms |
| 8 | Button press | hover/active | `translateY(2px)` + shadow mengecil | 120ms |
| 9 | Halftone drift | idle | `background-position` 0→12px, 60s linear infinite | 60s |
| 10 | Portrait breathe | idle | `scale(1.01)` 8s alternate; mati saat hover (halftone turun) | 8s |
| 11 | Page transition | navigasi artikel | `ClientRouter` + `transition:animate="slide"` pada `<main>`; verify API Astro 7 sebelum pakai | 300ms |

Semua di atas hanya `transform`, `opacity`, `clip-path`, `background-position` — tidak ada animasi layout,
tidak ada `requestAnimationFrame` loop permanen.

**Reduced motion** — perluas blok `@media (prefers-reduced-motion: reduce)` yang sudah ada:

```css
@media (prefers-reduced-motion: reduce) {
  .deck-wipe, .halftone-drift, .portrait img, .rail-indicator { animation: none !important; transition: none !important; }
  section[data-active] .reveal-item { animation: none; opacity: 1; transform: none; }
}
```

JS Deck sudah punya `matchMedia` dan `dataset.instant`; tambahkan guard yang sama untuk wipe + counter.

---

## 7. Aksesibilitas & performa

- Kontras: `--on-accent` di `--accent` 15.6:1 · `--accent-ink` di `--surface` 17:1 · `--text-body` 8.4:1 ·
  `--text-faint` 4.6:1. Cek dengan axe sebelum merge.
- Focus: `outline: 2px solid var(--accent); outline-offset: 3px`; di atas blok lime pakai `--ink`.
- Deck: `role="group"`, `aria-roledescription="slide"`, `aria-live` status, keyboard ← → / Home / End (sudah ada).
- Rail: `<nav aria-label="Slides">`, item aktif `aria-current="page"`, nomor slide `aria-hidden`.
- Status: titik pink `aria-hidden`; teks "Open to full-time…" tetap terbaca pembaca layar.
- Font swap: `display=swap`; ukur CLS, target < 0.02.
- Budget: JS tambahan ≤ 150 baris, tidak ada gambar baru selain OG; LCP target < 2.0s (4G, Cloudflare).
- `content-visibility: auto` per slide untuk slide non-aktif? **Jangan** — deck butuh ukuran terukur. Skip.

---

## 8. Fase kerja (tiap fase harus bisa di-build & dilihat)

**P0 — Fondasi token (≈45 menit)**
`global.css` token + utilities, font di `BaseLayout`, hapus utility mati.
Cek: `bun run check` && `bun run dev` — semua section masih render, warna baru masuk.

**P1 — Chrome deck (≈1.5 jam)**
`Rail`/`Topbar`/`Wipe` baru, `BaseLayout` prop `chrome`, `Deck` tanpa dot-rail, bottom strip.
Cek: deck 7 slide, keyboard, wheel, swipe, deep link `/#projects`, no-JS fallback tetap scroll normal.

**P2 — Section reskin (≈2 jam)**
Hero → Experience → Projects → Skills → Education → AppleMusic → Contact, lalu Footer.
Cek: paritas konten dengan `data.json` (tidak ada bullet hilang), 390/768/1440.

**P3 — Motion layer (≈1 jam)**
Stagger slide, wipe, rail indicator, counter, hover states, halftone drift.
Cek: reduced-motion (statis, tanpa lompatan), tidak ada scroll jank, DevTools performance 60fps.

**P4 — Halaman lain (≈45 menit)**
ArticleLayout sheet, ArticleCard, 404, `ClientRouter`, OG image baru.
Cek: `/articles/`, `/articles/_template/` (draft), `/404`, RSS, sitemap.

**P5 — QA & rilis (≈45 menit)**
`bun run check`, `bun run build`, `bun run preview`; axe + Lighthouse; uji `wrangler deploy` di preview branch.

---

## 9. QA matrix

| Uji | Cara | Lulus jika |
|---|---|---|
| Build/tipe | `bun run check` | 0 error |
| Bundle | `bun run build` | tidak ada warning baru |
| Layout | 390 / 768 / 1440 | tidak ada horizontal scroll, rail/topbar sesuai breakpoint |
| Deck | keyboard, wheel, swipe, klik rail | selalu 1 slide, `aria-live` terisi |
| No-JS | disable JS | halaman scroll normal, semua section terbaca |
| Reduced motion | OS setting | tidak ada animasi, konten terlihat penuh |
| Kontras | axe / DevTools | semua teks ≥ 4.5:1 |
| Light theme | toggle | teks kertas gelap, lime hanya permukaan |
| Artikel | buka 1 artikel | prose terbaca, TOC sticky, page transition tidak flicker |
| SEO | view-source | JSON-LD, OG image baru, canonical tidak berubah |

---

## 10. Risiko

| Risiko | Mitigasi |
|---|---|
| Lime terlalu dominan → capek dilihat | Aturan ≤15% luas layar; lime hanya band/tombol/meter; review visual per slide |
| Rail 250px memakan ruang di laptop 1280 | Sembunyikan rail < 1152px, konten max 1180, uji di 1280×800 |
| Slide panjang (Education, Listening) | Scroll internal sudah ada; pastikan hint `↓ scroll` muncul (sudah ada) |
| Anton jatuh ke Impact saat font gagal | Fallback stack sudah; ukur CLS |
| Deck + animasi saling tabrak | Animasi hanya dipicu `data-active`; `dataset.instant` mematikan translate+wipe bersamaan |
| Artikel jadi sulit dibaca di shell gelap | Panel kertas + lebar max 68ch, `--text-on-card` |

---

## 11. Selesai bila

- `bun run check` dan `bun run build` hijau; deploy preview di Cloudflare jalan.
- Landing deck 1440 dan 390 sesuai `neon-lime.html` (rail, band kontak, kartu, tipografi).
- Semua 7 slide, artikel, 404, RSS, sitemap berfungsi.
- axe tanpa violation kontras; reduced-motion bersih; no-JS terbaca.
- Tidak ada dependency baru di `package.json`.

---

## Status implementasi (2026-11-10)

Sudah diterapkan ke situs. `bun run check` dan `bun run build` hijau (0 error/warning), deck dicek di
390 / 1280 / 1440, light theme, reduced-motion, keyboard, dan no-JS.

**Yang dikirim**

- `src/styles/global.css` — token Neon Lime (dark + paper), type scale, primitives (`.p-btn`, `.p-tag`,
  `.p-card`, `.sheet`), deck/rail/topbar, motion + `prefers-reduced-motion`.
- `BaseLayout` — chrome switch `deck`/`page`, font Anton+Barlow+JetBrains, halftone + vignette layer,
  sweep sekali-jalan, scroll progress, theme toggle (dua tombol `data-theme-toggle`).
- `Rail.astro` + `Topbar.astro` baru (menggantikan `Navbar.astro`) + `Deck.astro` dirombak chrome-nya;
  mekanik slide (wheel/keyboard/swipe/deep-link) tidak diubah.
- Semua section, `ProjectCard`, `ArticleCard`, `ArticleLayout`, `TableOfContents`, `404`, `CopyButton`
  mengikuti sistem baru. Section title sekarang bahasa manusia, istilah game pindah ke eyebrow
  (`confidant`, `palaces`, `codex`).
- `public/og.png` + `apple-touch-icon.png` + `favicon.svg` dirender ulang (sumber: `docs/game-ui/og.html`).

**Penyimpangan dari rencana**

1. `ClientRouter` (page transition) tidak dipakai. Menambah SPA navigation di atas deck berisiko
   (script deck tidak di-reinit saat kembali ke halaman utama). Diganti sweep sekali-jalan saat load.
2. Rail indicator meluncur → diganti animasi `rail-pop` pada item aktif. Item aktif sendiri adalah
   blok lime, jadi indikator terpisah hanya menambah JS tanpa efek visual baru.
3. Counter angka: bukan count-up rAF, tapi flip 320ms (lebih murah, hasil visual sama).
4. Tidak ada bintang rank di Experience.

**Cek cepat**

```bash
bun run check && bun run build
node scripts/shoot-game-ui.mjs        # render ulang design system + preview
```

Screenshot hasil implementasi: `docs/game-ui/shots/impl-*.png`.
