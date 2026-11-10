# Neon Lime — sistem desain & preview

Satu sistem desain gaya Persona 5 tanpa merahnya. Kanvas hitam kehijauan, aksen lime
(`#C9F73D`) dengan teks ink di atasnya, satu sinyal pink (`#FF4FA3`), tipografi Anton + Barlow,
blok miring, halftone, dan kartu kertas.

- [`neon-lime.html`](neon-lime.html) — cover, lembar spesifikasi, preview homepage (buka di browser).
- [`implementation-plan.md`](implementation-plan.md) — rencana implementasi ke situs Astro (fase, file, motion, QA).
- [`shots/`](shots/) — hasil render: `cover`, `design-system`, `home`, `home-mobile`.

## Palet

| Token | Hex | Pakai |
|---|---|---|
| Accent | `#C9F73D` | Permukaan aksi: band kontak, tombol, tab kartu, item nav aktif, strip meter |
| Canvas | `#070A06` | Latar |
| Paper | `#F6FFE4` | Kartu baca, teks utama di atas kanvas |
| Accent ink | `#D7FF6B` | Teks aksen di atas kanvas gelap |
| Accent on light | `#5A7A08` | Teks aksen di atas kertas (light theme) |
| Signal | `#FF4FA3` | Titik status 6px saja |

Kontras: ink di atas lime 15.6:1 · accent-ink di atas kanvas 17:1 · body 8.4:1.

## Aturan

1. Teks di atas lime selalu ink — putih di `#C9F73D` cuma 1.7:1.
2. Luas lime ≤ 15% layar: satu band, satu tombol utama, strip meter.
3. Pink tidak pernah jadi permukaan, hanya titik status.
4. Kartu baca selalu kertas + teks ink; jangan teks gelap di atas kanvas gelap.
5. Halftone di belakang teks, opacity 0.1–0.4.

## Implementasi

Sistem ini sudah dipakai di situs (landing deck, artikel, 404, OG image). Ringkasan perubahan dan
penyimpangan dari rencana ada di bagian "Status implementasi" pada
[`implementation-plan.md`](implementation-plan.md); screenshot hasilnya di `shots/impl-*.png`
(`impl-deck-home`, `impl-deck-projects`, `impl-deck-mobile`, `impl-deck-light`, `impl-articles`).

## Render ulang

```bash
node scripts/shoot-game-ui.mjs   # butuh playwright-core + chromium (sudah ada di ~/.cache)
```
