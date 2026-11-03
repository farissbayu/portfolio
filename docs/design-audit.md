# Audit Desain Portofolio — Faris Bayu Setyawan (farissbay.my.id)

Tanggal audit: 2026-11-03
Metode: situs di-serve dari build produksi (`dist/client`), screenshot headless Chromium pada 1440/768/375 px × dark/light (screenshot lokal, tidak dikomit), Lighthouse CLI dijalankan langsung terhadap build yang sama (kondisi identik untuk before/after).

## Batas verifikasi

| Metode | Status |
|---|---|
| Screenshot 1440/768/375 px, dark + light | ✅ dilakukan |
| Kontras WCAG | ✅ dihitung dari token CSS (relatif luminance) |
| Lighthouse | ✅ desktop + mobile, lokal |
| Preview link LinkedIn/WhatsApp di perangkat sungguhan | ❌ tidak bisa — analisis dari markup OG saja |
| Interaksi hover/keyboard organik di browser sungguhan | ⚠️ via headless saja |

Baseline Lighthouse (server lokal, `dist/client`):

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Desktop | 99 | 100 | 96 | 92 |
| Mobile | 92 (LCP 3,2 s) | 100 | 96 | 92 |

Catatan: skor aksesibilitas 100 bukan jaminan — Lighthouse tidak menilai kontras token yang muncul saat hover, dan skor lokal lebih optimis daripada produksi (tidak ada latensi Cloudflare, Google Fonts, CDN Apple Music).

## Temuan — masalah → kenapa penting → bukti → solusi

### 1. Embed Apple Music: elemen paling terang di halaman, isinya musik
- **Masalah**: iframe Apple Music dirender sebagai kartu putih-oranye ± 450 px, mata terpaksa berhenti di situ, bukan di portfolio. Section ini diposisikan sebelum Skills.
- **Kenapa penting**: satu-satunya bidang putih besar di tema gelap → memancing perhatian dari hal yang menjual (proyek). Bisa jadi kesan "bukan orang serius". Juga beban pihak ketiga yang berkontribusi ke LCP mobile 3,2 s.
- **Bukti**: screenshot lokal: listening section (embed ter-render), urutan section di `src/pages/index.astro`.
- **Solusi**: pindahkan Listening dari urutan ke-4 ke setelah Education, dan kecilkan bobot visual (pertahankan daftar top-artists yang sudah ada sebagai konten utama; embed Spotify/Apple full-height jadi opsional). Tidak kehilangan "human touch", tetapi pengembang tetap di depan.

### 2. Penomoran section melompat dan nav tidak sinkron
- **Masalah**: nomor section yang tampil: 02, 03, 05, 06, 07, 08 — 01 (hero, tidak bernomor) dan 04 (articles, kosong) hilang. Nav hanya memuat about/work/projects/contact.
- **Kenapa penting**: penomoran yang bolong memberi kesan "ada section yang hilang", bukan gaya. Nav tidak memandu ke Skills/Education padahal itu yang pakai data GATE bila dingin. Di mobile, section tidak punya pintasan.
- **Bukti**: `SectionHeader.astro` (index manual per section, `Navbar.astro` baris 6–12), hanya 4 tautan + theme toggle.
- **Solusi**: nomor section dihitung dinamis dari section yang benar-benar dirender; nav dimuat semua pasangan id/label lainnya dari daftar section pada halaman. About dipertahankan, karena hero memang saat ini itu "mengenalkan".

### 3. OG image masih favicon.svg
- **Masalah**: `BaseLayout.astro` baris 15 — `image = "/favicon.svg"`; og:image menunjuk `https://farissbay.my.id/favicon.svg`. Crawler LinkedIn/WhatsApp bermasalah dengan SVG dan butuh raster ≥ 200×200; `twitter:card = summary_large_image` mengharuskan gambar besar.
- **Kenapa penting**: recruiter biasanya klik dari LinkedIn/DM/QR CV — preview link ini jadi bagian dari "kesan pertama".
- **Bukti**: `curl https://farissbay.my.id/` → `og:image` = favicon.svg; tidak ada `og:image:width/height/type` ataupun `twitter:image` terpisah.
- **Solusi**: buat `og.png/jpg` 1200×630 (komposisinya: nama + role + status pill + latar grid matcha, atau snapshot hero), tambah meta `og:image:type/width/height` dan `twitter:image`.

### 4. Duplicasi konten Work ↔ Projects
- **Masalah**: SGS Pendidikan dan TIK Asset Management muncul lengkap di `work_experience` (bullet) dan lagi di `projects` (deskripsi + responsibilities) — dari `data.json`, tidak dari kesalahan rendering.
- **Kenapa penting**: membaca isi yang sama dua kali tanpa belajar hal baru — saat 30–60 detik, ini buang waktu; terkesan CV di-input dua kali. Projects kemudian terlihat seperti re-staging work, bukan "teladan teknis".
- **Bukti**: `data.json` respons`work_experience[0].responsibilities[1..2]` vs `projects[0/1]` (SGS/TIK duplikasi semua bullet/roh peran).
- **Solusi (usulan)**: di Work Experience, satu baris saja: role + list proyek sebagai data: nama proyek + satu hasil utama. Detail hanya ada di Projects. Detail teknis unik (semuanya sudah ada di data: GitLab integration, AI-assisted report, MCP tool, custom workflow; STAR format untuk Dev Log) ditampilkan di kartu Projects. Mencantumkan data baru di data.json, bukan hardcode.

### 5. Kontak terlalu pasif
- **Masalah**: "Contact" hanya: 1 kalimat, email + copy, `location`/`linkedin` 2 baris dl. Tidak ada facebook CTA atau LinkedIn tombol solid. Tidak ada klasifikasi jelas apa yang kandidat pengguna cari selain teks headline.
- **Kenapa penting**: section terakhir sebelum menghilang. Kalau tak ada push belajar, recruiter tidak punya cairan menyimpulkan "ya saya masuk".
- **Bukti**: screenshot lokal: full page desktop section 08; `Contact.astro` (44 baris).
- **Solusi (usulan)**: tambah dua tombol: "Email me" (perangai primary) dan "Buka LinkedIn" (secondary, dari `data.json`); tampilkan ulang 3 baris "what I'm looking for" dari PRODUCT (bsteady masih dari data.json, tidak menambah klaim baru).
- **Catatan**: jangan menampilkan data tanpa persetujuan (misal phone) — hanya email/LinkedIn.

### 6. Kontras dark mode gagal AA pada token `accent-deep`
- **Masalah**: `--accent-deep: #97a97c` di atas `--surface-raised: #454c57` = **3,42:1** (butuh ≥ 4,5:1 untuk teks normal):
  - `Education.astro` baris 16, 83, 102 — label `~/bootcamps`, `~/certifications`, `~/achievements` (mono 11 px di atas kartu raised).
  - `SectionHeader.astro` baris 15 — token `~` dalam header section di atas `--surface: #3a404a` = **4,12:1** (tetap di bawah 4,5).
  - `AppleMusic.astro` baris 35, 51 — `$` dan nomor artist di atas permukaan serupa (≈ 4,1–4,5).
- **Kenapa penting**: semua teks mono kecil dan prompt terminals ini adalah elemen yang berulang sedikit demi sedikit; akumulasi membaca rendah terasa seperti kurang nyaman, bukan "estetika pudar".
- **Bukti**: perhitungan rasio WCAG di catatan percakapan (relatif luminance per pasangan token).
- **Solusi**: di dark mode naikkan `--accent-deep` ke nilai (misal) `#c9d6b6` (≈ 5,8–6,3:1) pada semua lihatan yang punya latar raised/sunken; cek juga pasangan `--text-faint` di `ArticleLayout` meski halaman artikel tak terpakai saat ini.

### 7. LCP mobile 3,2 s
- **Masalah**: Lighthouse mobile LCP 3,2 s (server lokal + throttle). Kontributor: CSS render-blocking Google Fonts (3 family, banyak weight), foto profil, iframe Apple Music siap-lazy.
- **Kenapa penting**: recruiter datang dari LinkedIn di mobile; iklan "3x10 detik pertama" malah habis menunggu LCP.
- **Bukti**: `lh-mobile-baseline.json`; `BaseLayout.astro` baris 39–44 (link stylesheet Google Fonts, 3 family).
- **Solusi**: (a) kurangi weight yang benar-benar dipakai setelah audit konsistensi isi (banyak gaya `font-light` boleh jadi 300 + 400 saja jika hanya itu yang dipakai), atau self-host subset latin; (b) `font-display: swap` sudah dipakai; (c) pertimbangkan `<link rel="preload">` untuk foto hero dengan `fetchpriority="high"` — hati-hati, ini opsi terakhir.

### 8. Label nav "about" tidak menunjuk section yang setara
- **Masalah**: `#about` = hero. Tidak masalah besar, tapi label "about" menjanjikan konteks lebih panjang; scaner menyadari itu identik dengan halaman yang sudah dilihat — jadi terasa seperti tautan kosong.
- **Kenapa penting**: kalau nav direvisi, ini kesempatan menyelaraskan.
- **Solusi**: ganti label `about` → `whoami` (tetap dalam tema terminal), atau biarkan (keputusan sorenya saja).

### 9. Foto berdiri di frame legacy "profil.jpeg" tapi isilah bag hikking
- **Masalah**: foto = diri dengan hoodie + tas hikking di pegunungan. Untuk recruiter-first (bukan photographer-first), konteks itu tak mendukung klaim “Product Engineer / AI Engineer”.
- **Kenapa penting**: foto formal-bersih meningkatkan kredibilitas CV scan. Ini bukan soal estetika, tapi kontra-proof-of-context.
- **Bukti**: `desktop-dark-hero.png`.
- **Solusi (usulan)**: sediakan foto netral yang di-potong di frame `~/profile.jpeg` yang sama; identitas terminal tetap dari frame + teks dekoratifnya, bukan dari isi foto. Butuh asset dari pemilik.

### 10. SEO: sitemap.xml tidak ada
- **Masalah**: `https://farissbay.my.id/sitemap.xml` → 404; `robots.txt` Cloudflare otomatis ada tapi tidak mereferensikan sitemap.
- **Kenapa penting**: untuk satu-halaman portfolio impact rendah, tapi begitu artikel publish, sitemap dibutuhkan.
- **Solusi**: aktifkan `@astrojs/sitemap` di `astro.config.mjs` (dependency ringan), atau tambahkan sendiri di halaman static.

### 11. Hal kecil yang usahakan sekali jalan
- `.reveal` mulai `opacity: 0` tanpa gate `.js` → jika JS gagal/blok, isi halaman tampil kosong. Solusi: `.js .reveal { opacity: 0 }` di `global.css`.
- Tidak ada `theme-color` meta dan `apple-touch-icon`.
- Tidak ada JSON-LD (`Person` dengan `sameAs` LinkedIn) — untuk SEO screenshot dari LinkedIn yang scraping.
- `og:image` tanpa `og:image:type/width/height` (ikuti #3).

## Verifikasi atas curigaan pemilik situs

| Curigaan | Status | Catatan |
|---|---|---|
| Nomor section melompat (02,03,05..08) dan nav hanya 4 item | ✅ terverifikasi | 01 dan 04 tidak pernah muncul; nav = about/work/projects/contact |
| SGS Pendidikan & TIK Asset Management muncul di Work dan Projects | ✅ terverifikasi | sumber: `data.json` (bukan hanya komponen) |
| Project tanpa visual/demo link | ⚠️ sebagian | hanya Personal Dev Log punya link; SGS/TIK = internal kantor, wajar tak ada link — tapi ini membuat Projects tanpa satu "bukti hidup" |
| OG image masih favicon.svg | ✅ terverifikasi | `BaseLayout.astro` baris 15 |
| Listening panjang & membelakangi kompetensi | ✅ terverifikasi | iframe 450 px ditempatkan sebelum Skills |
| Rentang `2023 – Present` membingungkan | ✅ terverifikasi | meta `[ 2023 – Present ]` (satu rentang meliputi 2 posisi dgn gap 2024); formatnya perlu diperjelas, mis. `[ 2023 · 2025–now ]` |
| Mobile overflow | ✅ tidak jadi masalah | scrollWidth == clientWidth di 3 ukuran |
| Tap target < 44 px | ✅ tidak jadi masalah | `min-h-11/12` untuk mobile; MD+ tidak relevan |
| `prefers-reduced-motion` | ✅ sudah ditangani | `global.css` baris 498–530 |
| Alt text | ✅ lulus | foto pth ada alt; artist images dekoratif `alt=""` |

## Yang sudah bagus — jangan diutak-atik

1. Dark/light flip bersih lewat token CSS semantik.
2. Hierarki heading benar (1×H1, H2 → H3 tidak melompati level).
3. Tanpa link tanpa teks; 26 elemen fokus; `:focus-visible` outline sudah di style.
4. `prefers-reduced-motion` — bukan hanya menyentuh animasi, tapi scroll-behavior.
5. `data.json` sebagai satu sumber data — perbaikan konten selanjutnya bisa tetap satu titik.
6. Grid 2 panel hero rapi, tak ada horizontal overflow di tablet/mobile.

## Prioritas (dampak × usaha)

| # | Temuan | Dampak | Usaha | Kelas |
|---|---|---|---|---|
| 1 | OG image 1200×630 + meta OG lengkap | Tinggi | Kecil | Quick win |
| 2 | Projects jadi "kartu bukti": hapus duplikasi dr Work, tampilkan detail teknis unik | Tinggi | Kecil-sedang | Quick win |
| 3 | Nav muat semua section + nomor section autosinkron | Sedang | Kecil | Quick win |
| 4 | Kontras `--accent-deep` dark mode (naikkan nilai var) | Sedang | Kecil | Quick win |
| 5 | Contact: 2 CTA + ringkasan "apa yg saya cari" dari data.json | Sedang | Kecil | Quick win |
| 6 | Pindahkan Listening ke bawah + kecilkan bobotnya (list top-artists saja tanpa iframe besar) | Sedang | Sedang | Butuh keputusan |
| 7 | Gate `.reveal` pada `.js` | Rendah | Kecil | Hygiene |
| 8 | JSON-LD + theme-color + apple-touch-icon | Rendah | Kecil | Hygiene |
| 9 | Trim/atur font (weight yang benar dipakai saja) | Sedang | Sedang | Performa |
| 10 | Sitemap.xml | Rendah | Kecil | Hygiene |
| 11 | Foto formal (butuh aset dari pemilik) | Sedang | N/A sendiri | Butuh aset |
| 12 | Format rentang tanggal Work lebih jelas | Rendah | Kecil | Copy (usulan saja) |

## 5 perbaikan teratas (urut eksekusi)

1. OG image + meta OG lengkap.
2. Projects jadi kartu bukti (bukan pengulangan Work).
3. Nav semua section + nomor section otomatis.
4. Kontras dark mode token `--accent-deep`.
5. Contact CTA berlapis (email + tombol LinkedIn + mini summary).

---

## Hasil implementasi (after) — 2026-11-03

Semua temuan diimplementasikan kecuali penggantian foto profil. Semua perubahan konten tetap di lapisan render/asset; `data.json` tidak diubah.

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Desktop before → after | 99 → 99 | 100 → 100 | 96 → **100** | 92 → **100** |
| Mobile before → after | 92 → 92 (SI 2,2 s → **1,8 s**; CLS 0,008 → **0**) | 100 → 100 | 96 → **100** | 92 → **100** |

Perubahan yang diimplementasikan:
1. OG image `public/og.png` 1200×630 (76 KB, terminal-styled) + meta `og:image:type/width/height/alt`, `og:site_name`, `twitter:title/description/image`.
2. Work ↔ Projects tidak lagi saling mengulang: bullet yang sudah jadi kartu proyek diganti baris `$ ls ~/projects → …` (filter data-driven di `Experience.astro`; `data.json` utuh). Kartu proyek kini menampilkan SEMUA responsibilitas (sebelumnya hanya 2 terakhir).
3. Nav memuat semua section; nomor section sekuensial 01–06 tanpa lompatan; urutan halaman: work → projects → skills → education → listening → contact.
4. `--accent-deep` dark: `#97a97c` → `#bccaa9` (3,42:1 → 5,02:1 di raised); `--text-faint` dark: `#a4acb8` → `#b8c0ca` (3,78:1 → 4,71:1).
5. Listening pindah ke setelah Education, iframe Apple Music dihapus (kartu putih 450 px hilang), diganti list top-artists 2 kolom + link `$ open replay`.
6. Contact: tombol "Email me" solid + "Open LinkedIn" sekunder + copy email; dl location/email/linkedin.
7. `.reveal`/(.stagger) digate pada `.js` (no-JS = konten selalu tampil).
8. Google Fonts trim: Inter 300–600(→300–500), Space Grotesk 500–700(→600–700), JetBrains Mono 400;500(+600 untuk FB mono semibold sebelumnya faux-bold).
9. Hero image: `loading="eager"` + `fetchpriority="high"`.
10. robots.txt + `@astrojs/sitemap` (sitemap-index.xml 200) + JSON-LD Person + theme-color + apple-touch-icon.png 180×180.

Nota: llms.txt, ard-schema, dan render-blocking fonts masih diperingatkan Lighthouse (v13, audit baru) — dievaluasi terpisah.

---

## Deck mode (Opsi A) — 2026-11-03

Landing page kini bergaya deck: tiap section = satu layar penuh, dengan:

- `main.deck > section` min-height `calc(100svh - 7rem)`, konten di-center; hero di-anchor ke atas.
- `scroll-snap-type: y proximity` (bukan `mandatory`) sehingga section yang lebih tinggi dari layar (Work di tablet, Projects di mobile, Education) tetap bisa dibaca baris per baris tanpa terjebak.
- Rail vertikal di kanan (≥1280 px): 7 titik, nomor slide aktif + garis aksen.
- Kontrol `‹ 02/07 ›` di desktop (pojok kanan bawah, di luar kolom konten) dan counter di navbar untuk mobile (agar tidak menutupi kartu).
- Keyboard: PageDown/PageUp dan ←/→ pindah slide; Home/End ke awal/akhir. ArrowUp/Down tetap scroll native.
- Deep link `/#projects` dan nav atas tetap berfungsi; counter, rail, dan nomor section sekarang sinkron (01 hero, 02 work, … 07 contact).
- `prefers-reduced-motion: reduce` → snap mati, tinggi section normal, animasi nonaktif (diverifikasi: `scroll-snap-type: none`, min-height 0).
- Tanpa JS → `.reveal` tidak menyembunyikan konten; deck tetap halaman scroll biasa.

Lighthouse setelah deck:

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Desktop | 98 (LCP 1,2 s) | 100 | 96 | 100 |
| Mobile | 92 (LCP 3,2 s) | 100 | 100 | 100 |

Catatan jujur:
- Best Practices desktop turun 100 → 96 karena Lighthouse mendeteksi *cookie issue* pihak ketiga dari `embed.music.apple.com` (audit `inspector-issues`, tipe Cookie). Itu bukan cookie situs ini; hilang hanya jika embed dibuang atau dibungkus `credentialless` (berisiko mematahkan player/sign-in Apple Music). Mobile tetap 100.
- LCP desktop 1,0 → 1,2 s: Lighthouse men-scroll halaman, sehingga iframe lazy Apple Music ikut termuat selama audit.
- Slide yang lebih tinggi dari viewport tetap ada (hero tablet 1439 px, Projects mobile 1704 px). Itu konsekuensi mempertahankan konten penuh; alternatifnya memecah Projects jadi beberapa slide.

---

## Deck mode B (Opsi B) — 2026-11-03

Menggantikan Opsi A. Landing page sekarang deck horizontal sungguhan, bukan halaman snap.

Cara kerja:
- `main.deck` = viewport tetap (`position: fixed`, tinggi `100svh` minus bar 56 px) + `.deck-track` berisi 7 slide; track digeser `translate3d(-100% × index)` dengan transisi 520 ms.
- Tiap slide `100% × 100%` dengan scroll internal (`overflow-y: auto`, `touch-action: pan-y`), jadi slide yang lebih tinggi dari layar tetap terbaca tanpa merusak "satu slide satu layar".
- Kontrol: tombol `‹ ›` + counter di deck bar (selalu terlihat, tidak menutupi konten karena bar punya ruang sendiri), rail bernomor di kanan (≥1280 px), keyboard (←/→, PageUp/PageDown, Home/End; ↑/↓ scroll internal dulu lalu pindah), mouse wheel (scroll internal dulu, pindah slide di ujung, cooldown 650 ms), swipe horizontal di sentuh.
- `inert` dipasang pada slide non-aktif; `role="group"` + `aria-roledescription="slide"`; live region mengumumkan "Slide N of 7: …"; fokus dipindah ke slide saat navigasi keyboard.
- Deep link `/#projects` membuka slide yang benar; `hashchange` juga ditangani.
- Naik/turun progress bar mengikuti indeks slide, bukan scroll dokumen.
- `prefers-reduced-motion`: transisi 0 s (diverifikasi), deck tetap bisa dinavigasi.
- Tanpa JS: semua CSS deck di-gate `.js`; bar dan rail disembunyikan, footer tetap tampil, halaman jadi scroll normal 4.894 px (diverifikasi).

Perbaikan yang muncul saat implementasi (semua sudah diverifikasi):
1. Track harus elemen dalam sendiri; mentranslate `main` yang punya `overflow:hidden` membuat slide ter-clip dan tidak bisa di-klik.
2. Section tidak boleh `display:grid` tinggi tetap: kartu ber-`overflow:hidden` menyusut jadi 248 px dan isinya terpotong. Diganti flex dengan `flex: 0 0 auto` pada anak.
3. Label aksesibilitas rail harus memuat teks yang terlihat (`01`) → `aria-hidden` diganti `.sr-only` + nomor.
4. Kontras `text-faint` light mode 4,32:1 (gagal AA) pada hint `↓ scroll`; token dinaikkan ke `#66665f` (4,94:1).
5. Hint `↓ scroll` muncul hanya saat slide masih punya sisa scroll.

Lighthouse deck B:

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Desktop | 97 (LCP 1,3 s, CLS 0,005) | 100 | 100 | 100 |
| Mobile | 93 (LCP 3,2 s, CLS 0,01) | 100 | 96 | 100 |

Catatan: Best Practices mobile 96 karena cookie pihak ketiga dari `embed.music.apple.com` (audit `inspector-issues`), bukan cookie situs ini. Desktop 100 karena iframe tidak sempat dimuat saat audit.
