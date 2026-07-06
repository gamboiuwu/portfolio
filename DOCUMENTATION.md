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
under `_gam_analytics_v1` (general events — pageviews, clicks, scroll, exits, and
conversion `goal` milestones) and `_gam_spotlight_v1` (artwork viewport time), plus
`_gam_visitor_v1` (a persistent visitor id that powers Orbit's returning-visitor
analysis). The `/admin/` page is excluded from tracking. Max 3000 general
events / 2000 spotlight events, oldest rotated out.

The tracking answers the questions the portfolio owner actually cares about:

| Question | Event(s) that answer it | Where to read it |
|----------|-------------------------|------------------|
| How often does someone enter the site? | `pv` (pageview) | Analytics tab, Journey → Sessions |
| *When* (what time / day) do they enter? | `pv` timestamp | **Pulse → Weekly Punchcard / Peak Hours** |
| What do they click on? | `click` (element, text, href, x/y) | Analytics → Heatmap |
| Where do they go on the site? | `pv` sequence per session | **Journey → Top Paths / Flow Explorer** |
| Where do they click off / leave? | last `pv` + `exit` | **Journey → Exit Pages & Drop-off** |
| *Where* does traffic come from? | `pv` `refHost` (referrer) | **Compass → Channel Mix / Top Referrers** |
| How far do they scroll / read-through? | `scroll` (25/50/75/100%) | **Depth → Read-Through Funnel** |
| Which artworks hold attention? | `tile_hover`, spotlight viewport time | Artwork Engagement / Spotlight |
| Are visitors *returning*? | `pv` `vid` (persistent visitor id) | **Orbit → New vs. Returning / Loyalty** |
| Do visitors become clients? (conversion) | `goal` (CTA click → form open → submit) | **Beacon → Conversion Funnel** |
| Where do they click *out* to (socials/shops)? | `click` `href` (external targets) | **Relay → Destination Mix / Top Destinations** |
| Where does the site *frustrate* them? | `click` position + target (rage / dead clicks) | **Snag → Rage Hotspots / Dead-Click Elements** |

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
- **Pulse** *(newest)* — **visitor cadence & traffic timing**. Where Journey shows
  *where* visitors go, Pulse shows *when* they arrive. From `pv` timestamps it builds:
  - Stats: total visits, busiest day, peak hour, active days
  - **Weekly Punchcard** — a 7-day × 24-hour canvas heatmap; warmer cells are busier slots
  - **Busiest Days** and **Peak Hours** ranked bars
  - Lets the owner time commission openings / drops for when people are actually browsing.
  - Derived live from `_gam_analytics_v1` — no extra tracking, no new storage key.
- **Compass** — **traffic sources & acquisition**. Buckets every visit by its
  referrer into channels (direct / social / search / referral), with a channel-mix
  donut, top referrers, device mix, and screen sizes. Tells the owner which platform
  (X, Instagram, ArtStation, TikTok…) actually sends traffic. Derived live from `pv`
  `refHost` — no new storage key.
- **Depth** *(newest)* — **scroll reach & read-through**. Where Compass shows where
  traffic comes from and Journey where it goes, Depth shows the *vertical* story: how
  far down each page visitors scroll before leaving. From the `scroll` (25/50/75/100%)
  events analytics already records it builds:
  - Stats: pages tracked, avg read-through %, full-read rate %, deepest page
  - **Read-Through Funnel by Page** — per-page 4-tier reach funnel (25→100%)
  - **Where Readers Drop Off** — pages ranked by % who leave before the halfway point
  - **Average Scroll Depth by Page**
  - Derived live from `_gam_analytics_v1` — no extra tracking, no new storage key.
- **Orbit** — **returning visitors & loyalty**. Uses a persistent visitor id
  (`_gam_visitor_v1`) so a repeat visitor no longer looks brand-new: new vs.
  returning donut, visit-frequency and recency buckets, and a loyalty leaderboard.
  The only analytics tool that needs its own storage key.
- **Beacon** — **conversion funnel & goal tracking**. Where every other
  tool measures attention, Beacon measures *outcome*: how many visitors travel the
  path to a commission inquiry. From lightweight `goal` events (commission CTA clicks,
  form-open, contact-step, submit) plus pageviews it builds:
  - Stats: sessions, reached-commissions, inquiries, conversion rate
  - **Conversion Funnel** — landing → viewed commissions → opened form → reached
    contact → submitted, each as a share of sessions
  - **Biggest Drop-off Points** — stage transitions ranked by visitors lost
  - **Commission CTA Clicks by Page** — which pages do the persuading
  - **Which Sources Convert** — channels ranked by inquiries, not just visits
  - **Recent Inquiries** — latest submissions with type + timestamp
  - Derived live from `_gam_analytics_v1` — no new storage key.
- **Relay** *(newest)* — **outbound reach & link-click tracking**. The outbound
  mirror of Compass: Compass shows where visitors *come from*, Relay shows where
  they *go* when they click a link off the portfolio. From the `href` on every
  `click` event it builds:
  - Stats: outbound clicks, unique destinations, social share %, top destination
  - **Destination Mix** — donut split by kind: social / shop & projects / external / email
  - **Top Destinations** — external hosts ranked (friendly-named: X, Instagram, ArtStation, Yuka…)
  - **Where They Leave From** — which pages generate the most outbound clicks
  - **Recent Outbound Clicks** — latest link-outs with destination, origin page, time
  - Derived live from `_gam_analytics_v1` — no new storage key.
- **Snag** *(newest)* — **UX friction & rage-click detector**. Every other tool
  measures where attention lands or where traffic comes and goes; Snag is the first
  to measure where the site *fights back*. From the position + target already on every
  `click` event it reconstructs two friction signals:
  - **Rage clicks** — 3+ clicks by one session in the same spot within a short window
    (a broken, slow, or misleading element)
  - **Dead clicks** — clicks on a non-interactive element with no link target (the
    visitor expected a response and got none)
  - Sections: friction-rate stats, a clean/rage/dead **composition donut**, **Rage-Click
    Hotspots**, **Dead-Click Elements**, **Friction by Page**, and a tagged **Recent
    Friction Events** feed
  - Derived live from `_gam_analytics_v1` — no new storage key.
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

*Last updated: 2026-07-06*
