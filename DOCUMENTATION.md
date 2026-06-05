# Portfolio Documentation — antryab.com

A practical, human-readable guide to **Anthony Ryabchikov's** art portfolio: what the
site is, how the analytics work, and how to read every tool on the admin dashboard.

> For deep implementation/architecture detail (storage keys, code structure, design
> tokens), see **`CLAUDE.md`** — that file is the canonical engineering reference.
> This file is the friendlier overview. Keep both in sync when adding features.

---

## 1. What this site is

A static, no-build art portfolio (pure HTML/CSS/JS) hosted on GitHub Pages at
`antryab.com`. It presents Anthony's work as a professional artist — illustration,
kemono/anthro character design, Telegram stickers, animation, techwear fashion
(Yuka Designs), and event direction (New York Furs) — and converts interested
visitors into commission inquiries.

**Aesthetic:** museum / gallery — paper off-white light mode, editorial serif
headings (Cormorant Garamond), with restrained cyberpunk-dystopian *accents*
(monospace data labels, subtle glitch/circuit decoration) that never upstage the
artwork. The palette is fixed (see `CLAUDE.md` → Design System); no blue/pink.

**Public pages:** `/` (home), `/commissions/`, `/featured/?i=`, `/newcommission/`.
**Private:** `/admin/` (password-protected dashboard).

---

## 2. Analytics — what we measure and why

All analytics are **first-party and client-side**. No third-party service, no
cookies sent off-device. Everything lives in the visitor's own `localStorage`
under `_gam_analytics_v1` (general events) and `_gam_spotlight_v1` (artwork
viewport time). The `/admin/` page is excluded from tracking. Max 3000 general
events / 2000 spotlight events, oldest rotated out.

The tracking answers the questions the portfolio owner actually cares about:

| Question | Event(s) that answer it | Where to read it |
|----------|-------------------------|------------------|
| How often does someone enter the site? | `pv` (pageview) | Analytics tab, Journey → Sessions |
| What do they click on? | `click` (element, text, href, x/y) | Analytics → Heatmap |
| Where do they go on the site? | `pv` sequence per session | **Journey → Top Paths / Flow Explorer** |
| Where do they click off / leave? | last `pv` + `exit` | **Journey → Exit Pages & Drop-off** |
| *When* do visits land (day/hour)? | `pv` timestamps | **Cadence → Visit Heatmap / Peak Hours** |
| How many visitors come back? | `pv` grouped by `vid` | **Cadence → New vs Returning** |
| How far do they scroll? | `scroll` (25/50/75/100%) | Analytics tab |
| Which artworks hold attention? | `tile_hover`, spotlight viewport time | Artwork Engagement / Spotlight |

See `CLAUDE.md` → Analytics System for the exact event field schema.

---

## 3. Admin dashboard tools

The admin dashboard is dark-mode (intentionally, to separate it from the public
gallery) and self-contained in `admin/index.html`. Tabs:

**Content management:** Gallery, Fonts, Styles, Featured, Pricing, Security,
Inquiries, Feedback.

**Analytics & insight tools (all stay on the admin page):**

- **Analytics** — visitor stats, session list, scroll depth, **artwork engagement**
  bar chart (sustained `tile_hover`), and a canvas **click heatmap** (pick a page,
  see click density blue→red).
- **Spotlight** — passive attention tracker. Uses `IntersectionObserver` to record
  how long each artwork / featured card / project tile is actually visible in
  viewports. Leaderboard ranks artworks by total view time.
- **Journey** *(newest)* — **visitor flow & drop-off map**. Reconstructs each
  session's page-by-page path from analytics events and shows:
  - Sessions, pages/session, bounce rate, average duration
  - **Entry pages** (where sessions begin)
  - **Exit pages & drop-off** (where sessions end / click off)
  - **Top paths** — most common full sequences, ending in `→ exit`
  - **Flow Explorer** — pick a page, see exactly where visitors go next (or leave)
  - Derived live from `_gam_analytics_v1` — no extra tracking, no new storage key.
- **Cadence** *(newest)* — **traffic rhythm & visitor loyalty**. Answers *when* people
  visit and *how often* they come back (the timing/frequency complement to Journey's
  *where*). Sections:
  - Stats: Unique Visitors, Peak Hour, Busiest Day, Returning Rate
  - **Visit Heatmap (Day × Hour)** — a 7×24 amber grid; warmer cells = more visits land
    then. Time commission openings and posts to your audience's real prime time.
  - **Peak Hours** / **Busiest Days** — ranked bars
  - **New vs Returning & Loyalty** — first-timers vs returners + sessions-per-visitor
  - Derived live from `_gam_analytics_v1` `pv` events. Returning-visitor detection uses a
    persistent visitor id (`localStorage._gam_vid`) set by `analytics.js`; no analytics
    data leaves the browser.
- **Revenue** — financial dashboard derived from the commission Queue: total earned,
  pipeline value, monthly earnings chart, revenue by type, top clients.
- **Palette** — extract dominant colors from an uploaded artwork (k-means), save
  named palettes, apply as accent.
- **Queue** — internal Kanban work-order tracker for active commissions
  (Queue → Sketch → … → Delivered), distinct from the public Inquiries form.

> When adding a new behind-the-scenes tool, **first verify it doesn't already exist**
> in this list and in `CLAUDE.md`, then document it in both files.

---

## 4. Privacy posture

- No analytics data leaves the browser; it is only visualised inside `/admin/`.
- Commission form submissions go out via Web3Forms (email) + ntfy.sh (push) and are
  also stored locally for the owner's records.
- Admin auth is a SHA-256 password hash in localStorage with a 5-attempt lockout.

---

## 5. Working on this repo

- No build step. Edit HTML/CSS/JS directly. Compiled CSS served is
  `assets/css/main.css` (SCSS source exists but isn't auto-compiled).
- `assets/js/commission-data.js` is the single source of truth for every
  localStorage read/write — add new keys/methods there.
- `assets/js/analytics.js` owns all client-side event capture.
- Keep the gallery light-mode and let the artwork lead; cyber accents stay subtle.

*Last updated: 2026-06-05*
