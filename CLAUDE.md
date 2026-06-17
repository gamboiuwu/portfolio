# Anthony Ryabchikov Portfolio — CLAUDE.md

## Project Overview

Static art portfolio for **Anthony Ryabchikov** (online alias: gamboiuwu), hosted at `antryab.com` via GitHub Pages. The owner is a freelance artist, event director, and creator based in New York, graduating Fall 2026 with a BFA in Studio Art, Business & Liberal Arts Minor, and Japanese Minor.

### Quick Facts
- **Name**: Anthony Ryabchikov (aka gamboiuwu / ギャム)
- **Email**: gamboiuwu@nyfurs.org
- **Discord/Telegram**: @gamboiuwu
- **Social**: @gamboiuwu (Twitter/X), @gamboi.v (Instagram), @gamboiuwu (TikTok)
- **Artstation**: artstation.com/gamboiuwu
- **Fursona**: Protogen, QC Certified #19
- **Specialties**: Kemono/anthro character design, digital illustration (Clip Studio Paint, Photoshop), Telegram stickers, 2D animation, Blender/3D, videography, techwear fashion (Yuka Designs), event coordination (New York Furs), music composition
- **Scale**: 160+ NYFurs events, 100+ monthly Phoenix Bark attendees, 7 years Adobe CC experience
- **Projects**: Yuka Designs (yuka.design) — DIVIDE 2025 collection active, New York Furs (nyfurs.org) — est. 2021, letfexraut (music alias on Bandcamp, lo-fi/breakcore/experimental), Extortia (sci-fi indie game — Resonance Awards 2021: Most Innovative Project & Best Sound Design)
- **Teaching**: Drawing instructor at Anthro Art Academy (NYFurs) covering kemono anatomy, color theory, character design

---

## File Structure

```
/                       — Main homepage (index.html)
/commissions/           — Commission pricing + inquiry form
/featured/              — Featured work detail page (served by ?i= param)
/admin/                 — Password-protected admin dashboard
/newcommission/         — Redirect to Notion commission form
/partials/footer.html   — Shared footer partial (reference only, not auto-included)
/images/                — All artwork, stickers, commission examples, logos
/assets/css/            — main.css (compiled), noscript.css
/assets/js/             — commission-data.js, analytics.js, main.js, util.js, etc.
/assets/sass/           — Source SCSS (main.scss, noscript.scss)
/assets/webfonts/       — Font Awesome webfonts
```

---

## Design System

### Color Palette (Light Mode — all public pages)
| Variable     | Value            | Use                        |
|-------------|------------------|----------------------------|
| `--paper`   | `#f0ede8`        | Background, default        |
| `--paper2`  | `#e5e1db`        | Card backgrounds           |
| `--ink`     | `#2c2926`        | Primary text, headings     |
| `--mid`     | `#57534c`        | Secondary text, body copy  |
| `--lite`    | `#8c887f`        | Tertiary / labels          |
| `--rule`    | `rgba(44,41,38,0.1)` | Light dividers         |
| `--rule-mid`| `rgba(44,41,38,0.2)` | Medium dividers        |

Admin dashboard uses a **dark mode** (near-black background with muted whites and accent pink `#f2849e`).

### Typography
- **Headings**: `Cormorant Garamond` (Google Fonts) — serif, editorial
- **Body/UI labels**: `-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif`
- **Admin monospace**: browser default monospace
- Custom fonts can be applied via the Admin → Fonts tab (Google Fonts or uploaded files)

### Aesthetic Direction
Museum / gallery aesthetic — paper off-white, editorial serif, no loud neon. Cyberpunk/techy dystopian *accents* are introduced as a subtle layer (glitch effects, monospace data labels, circuit-trace decorations) but never compete with the artwork itself. Keep it light-mode and gallery-clean.

---

## Core JavaScript: `commission-data.js`

Single IIFE that exposes `window.CommissionData`. All persistent data is stored in `localStorage`.

### Storage Keys
| Key                    | Type    | Contains                                        |
|------------------------|---------|-------------------------------------------------|
| `_gam_data_v1`         | Object  | Gallery images, stickers, featured works        |
| `_gam_fonts_v1`        | Object  | Font assignments (heading, body, custom uploads)|
| `_gam_styles_v1`       | Object  | Accent color, custom CSS                        |
| `_gam_prices_v1`       | Object  | Commission pricing tables (digital/stickers/animation)|
| `_gam_inquiries_v1`    | Array   | Commission inquiry form submissions             |
| `_gam_feedback_v1`     | Array   | Admin feedback / AI guidance notes              |
| `_gam_analytics_v1`    | Array   | Site visitor analytics events (see below)       |
| `_gam_palettes_v1`     | Array   | Saved color palettes (from Palette Extractor)   |
| `_gam_queue_v1`        | Array   | Commission work-order queue (internal tracker)  |
| `_gam_spotlight_v1`    | Array   | Artwork viewport-time events (Spotlight tracker)|

### Public API
```js
CommissionData.get()              // gallery data
CommissionData.save(data)
CommissionData.getFonts()
CommissionData.saveFonts(f)
CommissionData.getStyles()
CommissionData.saveStyles(s)
CommissionData.getPrices()
CommissionData.savePrices(p)
CommissionData.getInquiries()
CommissionData.saveInquiry(inq)
CommissionData.deleteInquiry(id)
CommissionData.markInquiryRead(id)
CommissionData.getFeedback()
CommissionData.addFeedback(item)
CommissionData.updateFeedback(id, changes)
CommissionData.deleteFeedback(id)
CommissionData.getAnalytics()     // returns raw event array
CommissionData.clearAnalytics()
CommissionData.getPalettes()
CommissionData.savePalette(palette)
CommissionData.deletePalette(id)
CommissionData.getQueue()
CommissionData.saveQueueItem(item)
CommissionData.updateQueueItem(id, changes)
CommissionData.deleteQueueItem(id)
CommissionData.getSpotlight()     // artwork viewport-time events
CommissionData.clearSpotlight()
CommissionData.applyAll()         // apply fonts/styles to current page
CommissionData.renderCommissions()
CommissionData.renderStickers()
CommissionData.renderFeatured()
CommissionData.renderPriceTables()
CommissionData.loadGoogleFont(name)
```

---

## Analytics System (`assets/js/analytics.js`)

Lightweight client-side analytics. No external service. All data stays in `localStorage._gam_analytics_v1`.

### Event Schema
Each event is a flat object:
```js
{ sid, type, page, ts, ...extraFields }
```

| Type         | Extra Fields                                                                          |
|--------------|---------------------------------------------------------------------------------------|
| `pv`         | `ref` (referrer path or "direct"), `refHost` (full referrer hostname, www-stripped, or "direct"), `dev` (mobile/tablet/desktop), `sw`/`sh` (screen size) |
| `click`      | `el` (tag.class), `text`, `href`, `xp`, `yp`                                          |
| `scroll`     | `depth` (25 / 50 / 75 / 100)                                                           |
| `exit`       | `ms` (milliseconds on page)                                                            |
| `tile_hover` | `title` (h2 text of hovered `.tiles article`, up to 60 chars)                         |
| `form_start` | *(commissions page)* fired once on first interaction with the `#cif-form` inquiry form |
| `form_step`  | *(commissions page)* `step` (wizard step revealed: `1` / `2` / `3` / `success`)        |

- **`sid`**: session ID (per tab, stored in sessionStorage)
- **`page`**: URL pathname, normalized (trailing slash, no index.html)
- **`ts`**: Unix timestamp (ms)
- **`xp` / `yp`**: click position as 0–1 fraction of viewport width/height
- Max 3000 events; oldest are rotated out automatically
- Admin page is **excluded** from tracking
- `window.GamAnalytics` is the public API (`.get()`, `.clear()`, `.getSpotlight()`, `.clearSpotlight()`)

### Heatmap Visualizer (Admin → Analytics tab)
Canvas-based click density map. Select a page from the dropdown, see click positions as color-coded dots (blue=low density → red=high). Uses proximity bucketing (32×32 grid cells) to aggregate nearby clicks.

### Artwork Viewport Tracking (Spotlight)
In addition to `_gam_analytics_v1`, a second storage key `_gam_spotlight_v1` stores artwork viewport-time events generated by `IntersectionObserver`. Stored separately to keep analytics streams clean.

**Spotlight event schema:**
```js
{ sid, artId, alt, label, page, ms, ts }
```
- `artId`: string key like `feat::Senior Project · 2026` or `tile::Yuka Designs`
- `label`: human-readable display name
- `ms`: milliseconds the element was continuously visible (≥400ms minimum)
- Observed elements: `.featured-card`, `.tiles article`, `.comm-gallery-item img`, `.sticker-gallery-item img`, `.expertise-item`

### Artwork Engagement (Admin → Analytics tab)
Bar chart of `tile_hover` events grouped by artwork title. A `tile_hover` fires after a visitor sustains a mouseover on a `.tiles article` for ≥1 second. Provides a qualitative engagement signal per portfolio piece beyond raw click counts.

---

## Admin Dashboard (`/admin/`)

Password-protected (SHA-256 hash in localStorage, 5-attempt lockout). Session tracked via `sessionStorage._gam_sess`.

### Tabs
| Tab         | Description                                                                        |
|-------------|------------------------------------------------------------------------------------|
| Gallery     | Manage commission images and Telegram stickers                                     |
| Fonts       | Load Google Fonts or upload font files; assign to headings/body                    |
| Styles      | Accent color picker, custom CSS injection                                          |
| Featured    | Featured Works cards shown on homepage (cover, title, etc.)                        |
| Pricing     | Commission price tables (columns/rows/add-ons per category)                        |
| Security    | Change admin password; reset gallery/styles to defaults                            |
| Inquiries   | View, read, reply to, delete commission form submissions                            |
| Feedback    | Log issues/ideas for AI routine guidance; track status                             |
| Analytics   | Site visitor stats, session list, artwork engagement, click heatmap visualizer     |
| Palette     | Color palette extractor — sample dominant colors from artwork                      |
| Queue       | Internal commission work-order tracker (see below)                                 |
| Revenue     | Financial analytics dashboard — earnings charts, type breakdown, top clients       |
| Spotlight   | Artwork attention tracker — viewport time per artwork/element                      |
| Journey     | Visitor flow & drop-off map — entry/exit pages, page-to-page paths, flow explorer  |
| Pulse       | Visitor cadence & traffic timing — weekly punchcard, busiest days, peak hours       |
| Compass     | Traffic sources & acquisition — channel mix, top referrers, device & screen breakdown |
| Funnel      | Commission conversion funnel — visit → commissions → form start → contact → submit drop-off |

---

## Commission Queue Board (Admin → Queue tab)

Kanban-style board for tracking every active commission from acceptance to delivery. This is **distinct from the Inquiries tab** (which stores form submissions) — it tracks the actual production workflow.

**Stages (left → right):**
Queue → Sketch → Lineart → Color → Complete → Delivered

**Each card stores:**
- `client` — handle or name
- `type` — `digital` | `stickers` | `animation` | `other`
- `desc` — brief commission description
- `price` — agreed price string (e.g. `$96`)
- `dueDate` — ISO date string (shown in MM/DD/YY format; overdue dates highlighted red)
- `stage` — current Kanban column key
- `priority` — `normal` | `rush` (rush cards show a red left border)
- `notes` — private internal notes
- `id` — timestamp integer (primary key)
- `createdAt` — ISO string

**Storage key:** `_gam_queue_v1` (Array of queue item objects, newest first)

**API (commission-data.js):**
```js
CommissionData.getQueue()               // returns full array
CommissionData.saveQueueItem(item)      // prepend new item, returns saved item
CommissionData.updateQueueItem(id, changes) // partial update by id
CommissionData.deleteQueueItem(id)      // remove by id
```

**Stats row** (above the board): active count, rush count, overdue count, delivered count.

---

## Color Palette Extractor (Admin → Palette tab)

Admin-only tool for extracting and saving color palettes from artwork.

**How it works:**
1. Upload an image or paste an image URL into the tool
2. Image is drawn into a hidden `<canvas>` element
3. Pixels are sampled in a grid (every Nth pixel)
4. Simplified k-means clustering (5 clusters, 8 iterations) finds dominant colors
5. Results shown as swatches with hex codes
6. Each swatch has: "Apply as Accent", copy hex button
7. "Save Palette" stores the set to `localStorage._gam_palettes_v1` with a custom name
8. Saved palettes are listed below with timestamps and quick-apply buttons

**Technical notes:**
- Canvas pixel access requires same-origin or CORS-enabled images
- Data-URI images (uploaded) always work
- External URLs may fail silently due to CORS; the tool shows a friendly warning

---

## Revenue Dashboard (Admin → Revenue tab) — NEW TOOL

Financial analytics layer on top of the Commission Queue. Reads from `_gam_queue_v1` — no new storage key required.

**What it shows:**
- **Total Earned**: Sum of price for all `done` queue items
- **Pipeline Value**: Sum of price for all active (non-done, non-cancelled) items
- **Avg. Commission**: Total earned ÷ completed count
- **Completion Rate**: Completed ÷ (total − cancelled) as a percentage
- **Monthly Earnings Chart**: Canvas bar chart of the past 12 months, derived from `updatedAt` timestamps on done items
- **Revenue by Type**: Canvas donut chart showing earnings split by commission type (Character Art, Stickers, etc.)
- **Top Clients Table**: Sorted by total revenue with per-client commission count and average value

**Technical notes:**
- All data derives from existing `_gam_queue_v1` storage — no new storage key
- Charts use Canvas 2D API, consistent with the heatmap in the Analytics tab
- Color palette uses warm amber/gold tones (`rgba(201,168,124,...)`) matching existing admin aesthetic
- Tab renders lazily (only when clicked), same pattern as Queue and Analytics tabs

---

## Commission Queue Tracker (Admin → Queue tab) — NEW TOOL

Internal work-order tracker for the artist to manage active commission jobs. This is **not** the public inquiry form — it is a private pipeline for tracking work in progress.

**What it does:**
- Add commission jobs with: client name, type, status, price, due date, description, notes
- Kanban-style pipeline view: Queued → In Progress → In Review → Done
- One-click "advance to next status" button on each card
- Summary stats: active count, total pipeline value ($), completed count, overdue count
- Overdue items highlighted in red (past due date, not yet done/cancelled)
- Archive section for Done and Cancelled items
- Badge on the Queue tab showing active work count

**Work order schema:**
```js
{
  id:        String | Number,  // auto-generated
  client:    String,           // client name or alias
  type:      String,           // Character Art / Telegram Stickers / Animation / etc.
  status:    String,           // queued | inprogress | review | done | cancelled
  price:     Number,           // USD amount
  due:       String,           // YYYY-MM-DD date string
  desc:      String,           // short description
  notes:     String,           // internal notes
  createdAt: ISO string,
  updatedAt: ISO string
}
```

**Storage:** `localStorage._gam_queue_v1` (Array of work order objects)

**API:** `CommissionData.getQueue()`, `.saveQueueItem(item)`, `.updateQueueItem(id, changes)`, `.deleteQueueItem(id)`

---

## Spotlight — Artwork Attention Tracker (Admin → Spotlight tab) — NEW TOOL

Admin-only tool that tracks how long individual artworks and portfolio elements are visible in visitors' viewports, using the browser's native `IntersectionObserver` API. No clicks required — just passive attention time.

**How it works:**
1. `analytics.js` attaches an `IntersectionObserver` to tracked elements (featured cards, project tiles, gallery images, expertise grid items)
2. Each element gets a `data-sp-id` attribute encoding its type and label (e.g., `feat::Senior Project · 2026`, `tile::Yuka Designs`)
3. When an element enters the viewport (≥25% visible), a timer starts
4. When it exits or the page unloads, elapsed milliseconds are stored if ≥400ms (filters rapid flicker)
5. Events stored in `_gam_spotlight_v1` (max 2000, oldest rotated)
6. Admin Spotlight tab aggregates by artId, ranks by total viewport time

**Spotlight event schema:**
```js
{
  sid:   String,  // session ID
  artId: String,  // type::label key (e.g. "feat::Senior Project · 2026")
  alt:   String,  // alt text or label
  label: String,  // human-readable display name
  page:  String,  // normalized pathname
  ms:    Number,  // milliseconds visible
  ts:    Number   // timestamp
}
```

**Admin tab sections:**
- **Overview**: total art views, unique artworks tracked, unique sessions, total viewport time
- **Artwork Leaderboard**: ranked by total ms, bar chart, views count, session count
- **By Page**: which page drives most artwork attention
- **Recent Artwork Views**: last 30 events with time/session details
- **Clear/Export** controls

**Storage:** `localStorage._gam_spotlight_v1` (Array, max 2000 events)

**API:** `CommissionData.getSpotlight()`, `.clearSpotlight()`

**Tracked elements:**
| Selector | artId prefix | Notes |
|----------|-------------|-------|
| `.featured-card` | `feat::` | Title from `.featured-title` |
| `.tiles article` | `tile::` | Title from `h2` |
| `.comm-gallery-item img` | `comm::` | From `alt` attribute |
| `.sticker-gallery-item img` | `sticker::` | From `alt` attribute |
| `.expertise-item` | `expertise::` | From `.expertise-item-title` |

---

## Journey — Visitor Flow & Drop-off Map (Admin → Journey tab) — NEW TOOL

Reconstructs each visitor's path through the site and surfaces where people land, how they move between pages, and where they leave. Answers the "how often someone enters, where they go, and where they click off" question directly.

**No new storage key** — derived live from `_gam_analytics_v1` (the same `pv` and `exit` events analytics already records), the same pattern as the Revenue dashboard reading from the queue.

**How it works:**
1. `buildJourneys()` groups all events by `sid`, sorts each session by `ts`
2. Builds an ordered pageview sequence per session (collapsing immediate repeats)
3. Derives per session: `entry` (first page), `exit` (last page), `pvCount`, `bounced` (≤1 pageview), `durMs` (span of session / longest exit `ms`)
4. The tab aggregates these into the sections below

**Admin tab sections:**
- **Stats**: Sessions, Pages/Session, Bounce Rate, Avg. Duration
- **Entry Pages**: ranked bars of first-page landings per session
- **Exit Pages & Drop-off**: ranked bars of last pages, labelled as % drop-off
- **Top Paths**: most common full page sequences, terminated with `→ exit`
- **Flow Explorer**: pick any page → see the next-step distribution (including `✕ exit` = left site)

**Derived journey schema (per session, for export):**
```js
{ sid, seq:[page,…], pvCount, entry, exit, bounced, durMs }
```

**API:** none new — uses `CommissionData.getAnalytics()`. Logic lives in `renderJourneyTab()` / `buildJourneys()` inside `admin/index.html`.

---

## Pulse — Visitor Cadence & Traffic Timing (Admin → Pulse tab) — NEW TOOL

Surfaces the **temporal rhythm** of site traffic — *when* during the week visitors actually arrive. Journey answers *where* people go; Pulse answers *when* they show up. Helpful for timing commission-slot openings, art drops, and social posts to land when the audience is already browsing.

**No new storage key** — derived live from `_gam_analytics_v1` (`pv` event timestamps), the same read-only pattern as Revenue and Journey. Times use the visitor's local clock (`Date.getDay()` / `getHours()`).

**How it works:**
1. `buildPulse()` walks all `pv` events and buckets each into a `grid[dayOfWeek][hourOfDay]` count (7×24), plus `byDay` (7) and `byHour` (24) totals.
2. Distinct calendar days with traffic are counted as **Active Days**; unique `sid`s give session count.
3. The tab renders the aggregates into the sections below.

**Admin tab sections:**
- **Stats**: Total Visits, Busiest Day, Peak Hour, Active Days
- **Weekly Punchcard**: canvas heatmap, 7 weekday rows × 24 hour columns; warmer amber cells = more visits land in that slot (GitHub-punchcard style)
- **Busiest Days**: day-of-week ranked bar list (% of visits)
- **Peak Hours**: top-12 hours ranked bar list (% of visits)

**Derived schema (for export):**
```js
{ grid:[[…24],…7], byHour:[…24], byDay:[…7], total, activeDays, sessionCount }
```

**Technical notes:**
- Canvas punchcard uses the warm amber palette (`rgba(201,168,124,α)`), α scaled by cell-max — consistent with the heatmap/Revenue charts. No blue/pink.
- Reuses the shared `jBarList()` bar renderer and `analytics-stat-chip` styles.
- Tab renders lazily on click, same pattern as Journey/Spotlight/Revenue.

**API:** none new — uses `CommissionData.getAnalytics()`. Logic lives in `renderPulseTab()` / `buildPulse()` inside `admin/index.html`.

---

## Compass — Traffic Sources & Acquisition (Admin → Compass tab) — NEW TOOL

Answers *where* the audience comes from. Spotlight = which artwork holds attention, Journey = where visitors go, Pulse = when they show up, Revenue = money — **Compass = acquisition**: which platform or site delivered each visit. The single most actionable signal for an artist deciding where to post.

**No new storage key** — derived live from `_gam_analytics_v1` `pv` events. To make this work, `analytics.js` now records a `refHost` field on every pageview (the full referrer hostname, www-stripped; `"direct"` when there is no referrer). The legacy path-only `ref` field is unchanged; old events without `refHost` are bucketed as `direct`/`unknown` so nothing breaks.

**How it works:**
1. `buildCompass()` walks every `pv` event and reads its `refHost`.
2. `compassClassify(host)` buckets the host into a channel:
   - **direct** — no referrer (typed/bookmarked)
   - **internal** — referred from an own-site host (`antryab.com`, `gamboiuwu.github.io`); folded into *direct* for the channel mix and excluded from the referrer list so same-site navigation doesn't drown real sources
   - **social** — X/`t.co`, Instagram, TikTok, ArtStation, Bandcamp, Telegram, Discord, Reddit, YouTube, Bluesky, Pinterest, Tumblr, Facebook, LinkedIn, Mastodon
   - **search** — Google, Bing, DuckDuckGo, Brave, Yahoo, Ecosia, Yandex, Baidu, Startpage, Qwant
   - **referral** — any other linking host
3. Aggregates channel counts, per-host counts, device counts (`dev`), and screen-size buckets (`sw×sh`).

**Admin tab sections:**
- **Stats**: Total Visits, Direct Share %, Top Channel (excl. direct), Mobile Share %
- **Channel Mix**: canvas donut + legend (direct / social / search / referral), centre shows total visits
- **Top Referrers**: ranked bar list of referring hostnames (Direct shown explicitly)
- **Device Mix**: desktop / mobile / tablet ranked bars
- **Top Screen Sizes**: most common visitor resolutions

**Derived schema (for export):**
```js
{ channels:{direct,social,search,referral,internal}, hosts:{host:count}, devices:{dev:count}, screens:{"WxH":count}, total }
```

**Technical notes:**
- Donut + swatches use the warm amber/sand palette (`rgba(201,168,124…)`, plus muted clay/olive/sand variants) — no blue/pink.
- Reuses the shared `jBarList()` renderer and `analytics-stat-chip` styles.
- Tab renders lazily on click, same pattern as Journey/Pulse/Spotlight/Revenue.

**API:** none new — uses `CommissionData.getAnalytics()`. Logic lives in `renderCompassTab()` / `buildCompass()` inside `admin/index.html`.

---

## Funnel — Commission Conversion (Admin → Funnel tab) — NEW TOOL

Answers the single most important business question the portfolio exists to serve: *of everyone who shows up, how many actually become a commission inquiry — and where do the rest fall out?* Compass = where they come from, Journey = where they roam, Pulse = when, Spotlight = what holds their eye, Revenue = money booked — **Funnel = conversion**: the goal-oriented path from arrival to submitted inquiry.

This is **distinct from Journey**: Journey maps *generic* page-to-page flow; Funnel measures fixed, business-defined goal stages and the step-over-step survival/drop between them.

**No new storage key** — derived live from `_gam_analytics_v1`, the same read-only pattern as Revenue/Journey/Pulse/Compass. To make the form steps measurable, `analytics.js` now emits two new event types on the commissions page only:
- **`form_start`** — fired once when the visitor first interacts with the `#cif-form` inquiry form (focus / input / change).
- **`form_step`** — fired with `step` (`1` / `2` / `3` / `success`) each time the multi-step wizard reveals a step. Captured via a `MutationObserver` on the `hidden` attribute of `.cif-step[data-step]` elements, so it stays decoupled from the form's own JS. `step: "success"` = a completed, submitted inquiry.

**How it works:**
1. `buildFunnel()` groups all events by `sid` into per-session signals: visited commissions (`pv` to `/commissions…`), started form (`form_start`), and the furthest wizard step reached (`form_step`).
2. Stages are computed as session counts, each a subset of the one above:
   - Visited the site (all sessions)
   - Viewed commissions page
   - Started the inquiry form
   - Reached character step (step 2)
   - Reached contact step (step 3)
   - Submitted an inquiry (step `success`)
3. Step-over-step kept % and dropped % (and absolute lost count) are computed against the previous stage.

**Admin tab sections:**
- **Stats**: Sessions, Inquiries Submitted, Visit → Inquiry rate %, Form Completion rate % (submitted ÷ started)
- **Conversion Funnel**: stacked horizontal bars (share of all sessions per stage) with a per-step kept/dropped note between stages
- **Biggest Drop-off**: the single stage transition that loses the most sessions — the highest-leverage place to improve

**Derived schema (for export):**
```js
{ total, stages: [ { key, label, count }, … ] }
```

**Technical notes:**
- Bars/accents use the warm amber palette; the loss figure uses a muted clay red (`#c98a7c`) and retention a muted olive (`#96a86e`) — no blue/pink.
- Reuses `analytics-stat-chip` styles; funnel-specific CSS (`.funnel-*`) lives in the admin `<style>` block.
- Tab renders lazily on click, same pattern as Compass/Journey/Pulse/Spotlight/Revenue.

**API:** none new — uses `CommissionData.getAnalytics()`. Logic lives in `renderFunnelTab()` / `buildFunnel()` inside `admin/index.html`.

---

## Commission System

### Pages
- `/commissions/` — Main commissions page with pricing, gallery, form
- `/commissions/?submitted=1` — Post-submission state

### Form Submission
Uses **Web3Forms** (access key in `mail.js`) for email notification plus **ntfy.sh** push notification. Submissions stored locally via `CommissionData.saveInquiry()`.

### Pricing
Stored in `_gam_prices_v1`. Three sections: `digital`, `stickers`, `animation`. Each has `status` (open/closed), `cols` (array of column headers), `rows` (label + prices array), `addons` (label + price string). Updated via Admin → Pricing tab.

---

## Pages Quick Reference

| Page              | Notes                                          |
|-------------------|------------------------------------------------|
| `index.html`      | Homepage: featured works, bio, project tiles   |
| `commissions/`    | Pricing cards, gallery, inquiry form           |
| `featured/`       | Detail view for featured works (`?i=` index)   |
| `admin/`          | Password-protected dashboard                   |
| `newcommission/`  | Meta redirect to Notion commission brief form  |
| `generic.html`    | Template page (unused)                         |
| `elements.html`   | HTML5 UP component reference (unused)          |

---

## Branch Strategy

- **`main`** — Production branch, auto-deployed via GitHub Pages
- Feature branches from `claude/...` pattern, merged via PR

---

## Key External Links

| Service       | URL                                        |
|---------------|--------------------------------------------|
| Live site     | https://antryab.com                        |
| Yuka Designs  | https://yuka.design/                       |
| New York Furs | https://nyfurs.org/                        |
| ArtStation    | https://www.artstation.com/gamboiuwu       |
| Bandcamp      | https://letfexraut.bandcamp.com/           |
| Twitter/X     | https://x.com/gamboiuwu                    |
| Instagram     | https://instagram.com/gamboi.v             |

---

## Development Notes

- No build step — pure HTML/CSS/JS. Edit files directly.
- SCSS source in `/assets/sass/` but the compiled `/assets/css/main.css` is what's actually served. If making design-system changes, edit `main.css` directly unless SCSS compilation is set up.
- jQuery is loaded from `/assets/js/jquery.min.js` (local copy).
- Font Awesome loaded from `/assets/css/fontawesome-all.min.css` (local).
- `commission-data.js` is the single source of truth for all localStorage operations — add new keys/methods there.
- All admin logic is in a self-contained IIFE inside `admin/index.html` (intentional, keeps admin code isolated).

---

## Homepage Sections (index.html)

| Section             | Description                                                              |
|---------------------|--------------------------------------------------------------------------|
| Featured Works      | Dynamic cards rendered by `CommissionData.renderFeatured()`              |
| Commission Status   | Animated pulse badge showing open/closed status; links to /commissions/  |
| Bio Block           | Name, subtitle (BFA/minors/alias), bio paragraphs, discipline chips      |
| Expertise Grid      | 6-cell grid: Illustration, Stickers, Animation, Fashion, Events, Education|
| Works / Projects    | 5 tile cards: Yuka Designs, Commissions, NYFurs, letfexraut, Extortia    |
| Footer              | Contact strip, social icons (Twitter, Instagram, ArtStation, Bandcamp, etc.), sys-status ticker |

**Discipline chips** (`.disc-chip`): small bordered tags listing skills. Styled to match the label aesthetic.  
**Expertise grid** (`.expertise-grid`): 3-column responsive grid, each cell has a monospace label (01 //, 02 //, …), serif title, and short description.  
**Commission status badge** (`.comm-status`): monospace pill with animated green pulse dot. Links to `/commissions/`.

---

*Last updated: 2026-06-17*
