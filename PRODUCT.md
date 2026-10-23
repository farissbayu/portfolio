# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recruiters and hiring managers screening for full-time product and fullstack engineering roles. They arrive from LinkedIn, a CV, or a referral, often scan on mobile, and need enough evidence to decide whether to start a conversation. Technical interviewers may read project and article pages for depth. Peers and potential collaborators also visit, but are not the primary audience.

## Product Purpose

A personal portfolio and article platform for Faris Bayu Setyawan, a product engineer based in Malang, Indonesia. It presents his work history, shipped projects, technical range, education, and writing in one place. Success means a recruiter or hiring manager can verify fit and begin an interview conversation; the site is not a freelance lead funnel.

## Positioning

End-to-end product engineering, proven in public-sector digitization and practical AI/LLM integration. The differentiator is concrete delivery: a school grant management platform for the Pasuruan Regency Education Office, a TIK asset management system with GitLab integration and AI-assisted reporting, and a digitized HR job-analysis workflow. A neighboring generic fullstack portfolio could not truthfully copy this specific institutional work.

## Operating Context

Visitors evaluate the site alongside a CV, LinkedIn profile, and other candidates. The main scan pattern is: identify role fit, confirm shipped work, check location and availability, contact. The site is a static Astro build deployed on Cloudflare at farissbay.my.id; content is maintained in `data.json` and Markdown/MDX articles. Contact paths are email and LinkedIn. The current status pill states availability for fullstack and AI opportunities, consistent with the confirmed full-time search.

## Capabilities and Constraints

- Astro static site with Tailwind CSS v4, React islands, MDX, and the Cloudflare adapter; build with `bun run build`, deploy with Wrangler.
- `data.json` is the source of truth for personal information, work experience, projects, education, and skills.
- Articles use Astro Content Collections with a Zod schema and an RSS feed. Only a draft `_template.md` exists, so there are no published articles yet.
- Dark theme is default; a light theme is a first-class equivalent, both driven by semantic CSS tokens.
- Public contact paths are email and LinkedIn. `data.json` also contains a phone number, but it is not a confirmed public contact path; future work should not surface it.
- Confirmed availability: open to full-time product/fullstack opportunities.
- Undecided: whether articles become a core channel or stay occasional; whether testimonials or formal case studies will be added.

## Brand Commitments

- Name: Faris Bayu Setyawan.
- Portrait: `src/assets/photo_profile.jpeg` (root and `public/` copies exist).
- Domain: farissbay.my.id.
- Public identity: Product Engineer / Fullstack Developer with AI/LLM specialization.

## Evidence on Hand

- `data.json`: profile summary; two work entries (Dinas Komunikasi dan Informatika Kabupaten Pasuruan, Aug 2025–present; PT Tetanggaku Saling Bantu, Oct–Nov 2023); three projects (SGS Pendidikan, TIK Asset Management System, Personal Dev Log with a live link); education (IPB University, Devscale cohorts, Bangkit Academy); skills across frontend, backend, database, AI/LLM, and infrastructure.
- Portrait photo, site domain, and LinkedIn profile URL.
- Absences future work must not fabricate: no testimonials, client logos, press mentions, published articles, or quantified impact metrics beyond those already in `data.json` (GPA 3.73/4.00, Bangkit Top 65 Capstone, 5,010 students selected from 67,387 applicants).

## Product Principles

1. Evidence over adjectives: every capability claim should trace to a shipped project, role, or real article.
2. Recruiter-first scanning: role fit, proof, location, availability, and contact must be findable without reading everything.
3. One source of truth: update `data.json` for facts instead of hardcoding copy in components.
4. Show applied AI, not AI vocabulary: lead with workflows, integrations, and outcomes.
5. Preserve the delivery story: public-sector digitization plus end-to-end ownership is the durable differentiator.
