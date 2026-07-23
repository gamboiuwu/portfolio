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
| `_gam_visitor_v1`      | Object  | Persistent visitor identity (`vid`, `first`, `count`, `last`) — powers the Orbit retention tool |

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
| `pv`         | `ref` (referrer path or "direct"), `refHost` (full referrer hostname, www-stripped, or "direct"), `dev` (mobile/tablet/desktop), `sw`/`sh` (screen size), `vid` (persistent visitor id), `vnum` (visit number, 1 = first ever), `vfirst` (first-seen ts) |
| `click`      | `el` (tag.class), `text`, `href`, `xp`, `yp`                                          |
| `scroll`     | `depth` (25 / 50 / 75 / 100)                                                           |
| `exit`       | `ms` (milliseconds on page)                                                            |
| `tile_hover` | `title` (h2 text of hovered `.tiles article`, up to 60 chars)                         |
| `goal`       | `goal` (milestone name), `vid`, + optional meta. Marks a conversion milestone on the path to a commission inquiry. Auto-fired for commission CTA clicks (`cta_commission`); the commission form fires `form_open`, `form_step3`, and `form_submit` (with `ctype`). Powers the **Beacon** funnel. |

- **`sid`**: session ID (per tab, stored in sessionStorage)
- **`page`**: URL pathname, normalized (trailing slash, no index.html)
- **`ts`**: Unix timestamp (ms)
- **`xp` / `yp`**: click position as 0–1 fraction of viewport width/height
- Max 3000 events; oldest are rotated out automatically
- Admin page is **excluded** from tracking
- `window.GamAnalytics` is the public API (`.get()`, `.clear()`, `.getSpotlight()`, `.clearSpotlight()`, `.goal(name, meta)`)

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
| Depth       | Scroll reach & read-through — per-page scroll funnel, drop-off points, avg depth     |
| Orbit       | Returning visitors & loyalty — new vs returning, visit frequency, recency, loyalty leaderboard |
| Beacon      | Conversion funnel & goal tracking — path-to-inquiry funnel, drop-off points, CTA clicks, converting sources |
| Relay       | Outbound reach & link clicks — destination mix (social/shop/external/email), top destinations, exit pages, recent link-outs |
| Friction    | UX friction & frustration signals — rage clicks (repeated clicks in one spot), unresponsive/dead clicks (non-interactive targets), friction hotspots, friction by page |
| Mosaic      | Artwork affinity & co-view — which pieces get viewed together per visit, top co-viewed pairs, hub/connective artworks, per-artwork companions explorer |
| Tide        | Trends & momentum — recent-window vs prior-window deltas: daily traffic momentum chart, rising/cooling artworks, trending pages & sources |
| Ember       | Engagement quality index — composite 0–100 per-session score from six weighted signals, quality-tier distribution, score drivers, best entry pages & sources, top sessions |

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

## Depth — Scroll Reach & Read-Through (Admin → Depth tab) — NEW TOOL

Answers the *vertical* engagement question: how far down each page do visitors actually scroll before they leave? The analytics family now reads: Compass = where traffic comes from, Journey = where it goes between pages, Pulse = when it shows up, Spotlight = which artwork holds attention, Revenue = money — **Depth = read-through**: which pages get read to the bottom and which lose people above the fold.

**No new storage key** — derived live from `_gam_analytics_v1` `scroll` events, which `analytics.js` already records at the 25 / 50 / 75 / 100 thresholds. Until now those events were only surfaced as a single max-depth value in the Analytics session list; Depth aggregates them into a real read-through funnel.

**How it works:**
1. `buildDepth()` walks all events. For each page it collects the set of sessions that loaded it (`pv` events) and the furthest scroll depth each session reached (`scroll` events, max per `sid`).
2. A session with a `pv` but no `scroll` event counts as **0% reach** (short page that fits the viewport, or an instant bounce) — so reach is a *relative* engagement signal, not a literal pixel measure. This caveat is shown in the tab hint.
3. Per page it derives: `views` (distinct sessions), `reach` at each tier (25/50/75/100), `avgDepth` (mean furthest point), `fullRead` (% reaching 100), `bailedEarly` (% never reaching 50).

**Admin tab sections:**
- **Stats**: Pages Tracked, Avg Read-Through %, Full-Read Rate %, Deepest Page
- **Read-Through Funnel by Page**: per-page 4-tier funnel (25→100), each tier a horizontal bar with reach %. Deeper tiers use progressively darker amber to read as a descent.
- **Where Readers Drop Off**: pages ranked by % of visitors who leave before the halfway point (weakest above-the-fold hooks)
- **Average Scroll Depth by Page**: pages ranked by mean furthest-point reached

**Derived schema (for export):**
```js
{ pages:[{ page, views, reach:{25,50,75,100}, avgDepth, fullRead, bailedEarly }], totalViews, avgReadThrough, fullReadRate }
```

**Technical notes:**
- Funnel bars use the warm amber/clay palette (`rgba(214,190,150…)` → `rgba(150,104,62…)`, lightest→deepest tier) — no blue/pink.
- Reuses the shared `jBarList()` renderer and `analytics-stat-chip` styles; funnel rows use new `.depth-*` classes.
- Tab renders lazily on click, same pattern as Compass/Journey/Pulse/Spotlight/Revenue.

**API:** none new — uses `CommissionData.getAnalytics()`. Logic lives in `renderDepthTab()` / `buildDepth()` inside `admin/index.html`.

---

## Orbit — Returning Visitors & Loyalty (Admin → Orbit tab) — NEW TOOL

Answers the *retention* question the rest of the analytics family structurally cannot: **is the audience coming back?** Compass = where traffic comes from, Journey = where it goes, Pulse = when it shows up, Spotlight = which artwork holds attention, Depth = read-through, Revenue = money — **Orbit = loyalty**: new vs. returning visitors, how often they return, and how recently.

**Why it needed a new storage key:** every other tool keys off `sid` (a per-tab session id in `sessionStorage`), so a visitor returning a week later looks brand-new. Orbit introduces a **persistent visitor id** (`vid`) stored in `localStorage._gam_visitor_v1`, the first and only new storage key in the analytics family. `analytics.js` now stamps every `pv` event with `vid`, `vnum` (the visit number — incremented once per new tab-session), and `vfirst` (first-ever-seen timestamp). Legacy pageviews without a `vid` are folded in as synthetic single-visit visitors keyed by their `sid`, so nothing breaks.

**Persistent visitor object (`_gam_visitor_v1`):**
```js
{ vid: "v…", first: <ms>, count: <visits>, last: <ms> }
```
- `count` increments once per new session (guarded by a `sessionStorage._gam_visit_counted` flag), matching how a "visit" is counted elsewhere.

**How it works:**
1. `buildOrbit()` walks all `pv` events and groups them by `vid` (falling back to `legacy:<sid>` when absent).
2. Per visitor it derives `visits` (max of recorded visit number and distinct sessions seen, min 1), `ageDays` (days since first seen), and `sinceDays` (days since last seen).
3. Aggregates into new-vs-returning counts, a visit-frequency distribution, a recency distribution, and a loyalty leaderboard.

**Admin tab sections:**
- **Stats**: Unique Visitors, Returning, Return Rate %, Avg Visits / Visitor
- **New vs. Returning**: canvas donut + legend; centre shows the return-rate %
- **Visit Frequency**: ranked buckets (1 / 2 / 3–5 / 6–10 / 11+ visits)
- **Recency — Last Seen**: ranked buckets (today / this week / 8–30 days / 30+ days)
- **Most Loyal Visitors**: top returning visitors by visit count, with how long they've followed and when they last dropped in

**Derived schema (for export):**
```js
{ list:[{vid, visits, ageDays, sinceDays, legacy, …}], unique, returning, newCount, totalVisits, returnRate, avgVisits, frequency:[…], recency:[…] }
```

**Technical notes:**
- Donut + swatches use the warm amber/sand palette (`rgba(176,122,74…)` returning, `rgba(214,190,150…)` new) — no blue/pink.
- Reuses the shared `jBarList()` renderer, `analytics-stat-chip`, and `.compass-legend` styles; only a small `.orbit-donut-row` wrapper is new.
- Tab renders lazily on click, same pattern as Depth/Compass/Journey/Pulse/Spotlight/Revenue.

**API:** none new on `CommissionData` — uses `CommissionData.getAnalytics()`. Visitor id is written by `analytics.js`; logic lives in `renderOrbitTab()` / `buildOrbit()` inside `admin/index.html`.

---

## Beacon — Conversion Funnel & Goal Tracking (Admin → Beacon tab) — NEW TOOL

Answers the question the rest of the analytics family structurally cannot: **do visitors actually become clients?** Compass = where traffic comes from, Journey = where it goes, Pulse = when it shows up, Spotlight = which artwork holds attention, Depth = read-through, Orbit = loyalty, Revenue = money already earned — **Beacon = conversion**: how many visitors travel the path to a commission inquiry, and exactly where the would-be clients fall away.

**Why it's genuinely new:** every other analytics tool measures *attention* or *audience*. None measures *outcome* against the site's single business goal (the commission inquiry). Journey shows generic page-to-page flow; Beacon defines a named goal funnel and reports drop-off at each step, conversion rate, and which acquisition channels actually produce inquiries.

**No new storage key** — derived live from `_gam_analytics_v1`. This required a new `goal` event type in `analytics.js` and a tiny public API (`GamAnalytics.goal(name, meta)`):
- **`cta_commission`** — auto-fired from the click handler when a visitor clicks any commission CTA (href contains `newcommission` / `#commission-form`, or the link text reads like "commission inquiry / start your inquiry / commission me").
- **`form_open`** — fired by `commissions/index.html` on the first `focusin` anywhere in the inquiry form (genuine engagement).
- **`form_step3`** — fired when the multi-step form advances to the final Contact step.
- **`form_submit`** — fired on a completed submission, carrying `ctype` (commission type).

**Funnel stages (per session):**
1. **Visited the site** — any `pv`
2. **Viewed Commissions** — a `pv` whose page starts with `/commissions`
3. **Opened the form** — `form_open` goal
4. **Reached Contact step** — `form_step3` goal
5. **Submitted inquiry** — `form_submit` goal

**How it works:**
1. `buildBeacon()` groups events by `sid`, sets the five funnel flags per session, captures the session's first-pageview `refHost`, and tallies `cta_commission` clicks by page.
2. Stage counts are sessions matching each flag; drop-off is the loss between consecutive stages.
3. Source conversion classifies each session's `refHost` via the shared `compassClassify()` and compares visits vs. inquiries per channel.

**Admin tab sections:**
- **Stats**: Sessions, Reached Commissions, Inquiries, Conversion Rate
- **Conversion Funnel**: five horizontal bars (share of sessions), amber deepening with depth, each annotated with the count lost from the previous stage
- **Biggest Drop-off Points**: stage transitions ranked by visitors lost (% of the upstream stage)
- **Commission CTA Clicks by Page**: where CTA clicks happen across the site
- **Which Sources Convert**: channels ranked by visits, annotated with inquiries + conversion %
- **Recent Inquiries**: latest `form_submit` events with type + timestamp

**Derived schema (for export):**
```js
{ counts:{visited,comm,open,contact,submit}, total, ctas:{page:count}, sources:{channel:{visited,converted}}, submits:[…], sessionCount }
```

**Technical notes:**
- Funnel bars use the warm amber palette (`rgba(201,168,124,α)`, α deepening per tier) — no blue/pink. New `.beacon-*` CSS classes; reuses `jBarList()`, `analytics-stat-chip`, `compassClassify()`, `jPageLabel()`, `escHtml()`, `fmtDate()`.
- Tab renders lazily on click, same pattern as Orbit/Depth/Compass/Journey/Pulse/Spotlight/Revenue.
- Reach is per session, so one visitor across several tabs may count more than once (noted in the tab hint).

**API:** none new on `CommissionData` — uses `CommissionData.getAnalytics()`. Goal events are written by `analytics.js` (`GamAnalytics.goal`) and the commission form; logic lives in `renderBeaconTab()` / `buildBeacon()` inside `admin/index.html`.

---

## Relay — Outbound Reach & Link-Click Tracking (Admin → Relay tab) — NEW TOOL

The **outbound mirror of Compass**. Compass answers where visitors *come from* (inbound acquisition); Relay answers where they *go* when they click a link off the portfolio — which social platform, shop, or external destination actually pulls the click-throughs, and from which page. For an artist whose portfolio exists partly to funnel an audience to their socials and storefronts, this is the single clearest read on whether that funnel is working and which profile it feeds.

**Why it's genuinely new:** every existing analytics tool measures *on-site* behaviour (attention, flow, timing, scroll, retention, conversion) or *inbound* traffic (Compass). None measures *outbound* click-through — where the portfolio sends people when they leave via a link. Journey's "exit" only marks the last page viewed, not which external link was clicked.

**No new storage key** — derived live from the `click` events `analytics.js` already records. Each click event carries its link target (`href`), so outbound destinations are reconstructed with no schema change, the same read-only pattern as Compass/Journey/Beacon.

**How it works:**
1. `buildRelay()` walks every `click` event and passes its `href` through `relayChannel(href)`.
2. `relayChannel()` skips non-outbound links — empty hrefs, in-page anchors (`#…`), `tel:`/`javascript:`, relative/internal paths, and links back to own hosts (`antryab.com`, `gamboiuwu.github.io`). `mailto:` → **email**.
3. Remaining external hosts (www-stripped) are classified: **social** (reuses `COMPASS_SOCIAL` — X, Instagram, TikTok, ArtStation, Bandcamp, Telegram, Discord, YouTube, …), **project** (`RELAY_PROJECT_HOSTS` — yuka.design, nyfurs.org, Notion commission form, Ko-fi, Patreon, Gumroad), else **external**.
4. Aggregates channel counts, per-host counts, per-page counts, and a recent-clicks list. `relayFriendly(host)` maps known hosts to display names (e.g. `x.com` → "X (Twitter)", `yuka.design` → "Yuka Designs").

**Admin tab sections:**
- **Stats**: Outbound Clicks, Destinations (unique hosts), Social Share %, Top Destination
- **Destination Mix**: canvas donut + legend (social / shop & projects / external / email); centre shows total outbound clicks
- **Top Destinations**: ranked bar list of external destinations (friendly-named), % of outbound each
- **Where They Leave From**: pages ranked by outbound clicks generated
- **Recent Outbound Clicks**: latest link-outs with destination, origin page, and timestamp

**Derived schema (for export):**
```js
{ channels:{social,project,external,email}, hosts:{host:count}, pages:{page:count}, recent:[{host,channel,page,href,text,ts}], total }
```

**Technical notes:**
- Donut + swatches use the warm amber/sand palette (`rgba(176,122,74…)` social, `rgba(201,168,124…)` project, `rgba(214,190,150…)` external, muted olive email) — no blue/pink.
- Reuses `jBarList()`, `analytics-stat-chip`, `compass-legend`/`compass-donut-row` styles, `escHtml()`, `fmtDate()`, `jPageLabel()`, and the `COMPASS_OWN_HOSTS`/`COMPASS_SOCIAL` host lists; only a small `.relay-donut-row` wrapper is new.
- Tab renders lazily on click, same pattern as Beacon/Orbit/Depth/Compass/Journey/Pulse/Spotlight/Revenue.

**API:** none new on `CommissionData` — uses `CommissionData.getAnalytics()`. Logic lives in `renderRelayTab()` / `buildRelay()` / `relayChannel()` inside `admin/index.html`.

---

## Friction — UX Friction & Frustration Signals (Admin → Friction tab) — NEW TOOL

Answers a question the rest of the analytics family structurally cannot: **where does the interface itself fight the visitor?** Compass = where traffic comes from, Journey = where it goes, Pulse = when it shows up, Spotlight = which artwork holds attention, Depth = read-through, Orbit = loyalty, Beacon = conversion, Relay = outbound reach, Revenue = money — every one of those measures *attention* or *audience*. **Friction = obstruction**: the spots where visitors get frustrated on the way through the portfolio.

**Why it's genuinely new:** no existing tool measures *negative* UX signals. Beacon shows *that* a funnel leaks; Friction shows *why* — the concrete elements that stall or mislead people. It reconstructs two industry-standard frustration signals (Hotjar/FullStory-style rage & dead clicks) with zero new instrumentation.

**No new storage key** — derived live from the `click` events `analytics.js` already records (each carries `sid`, `el`, `text`, `href`, `xp`, `yp`, `ts`), the same read-only pattern as Relay/Compass/Journey.

**The two signals:**
- **Rage clicks** — a burst of clicks by one session in nearly the same spot: `≥ RAGE_MIN` (3) clicks, each within `RAGE_MS` (2000 ms) of the previous and within `RAGE_DIST` (0.06 of the viewport) of the cluster origin. Classic "why won't this button work" jabbing. Each click in a qualifying cluster is a rage click; the cluster is one incident.
- **Unresponsive (dead) clicks** — a click that resolved to a non-interactive element (no `href`; element tag not `a`/`button`/`input`/`select`/`textarea`/`label`/`summary`). The click tracker already walks up to the nearest interactive ancestor, so anything still non-interactive almost certainly did nothing when clicked. Often artwork or a card visitors *expect* to open. A rage click is never also counted as dead (rage is the stronger signal).

**How it works:**
1. `buildFriction()` groups `click` events by `sid`, sorts each session by `ts`, and walks them to flag rage clusters (transiently tagging events, then cleaning the tag off the shared event objects so other tabs are unaffected).
2. Non-rage clicks are tested with `frictionIsInteractive()`; failures become dead clicks.
3. Aggregates hotspots (keyed by element + short text via `frictionKey()`), per-page counts, a recent feed, and session-level friction rate.

**Admin tab sections:**
- **Stats**: Rage Clicks, Unresponsive, Friction Sessions, Friction Rate (% of clicking sessions with ≥1 friction event)
- **Signal Mix**: canvas donut + legend (rage vs. unresponsive); centre shows total friction events
- **Friction Hotspots**: the exact elements taking the most frustrated clicks, ranked, each annotated with its rage/dead split
- **Friction by Page**: pages ranked by friction generated
- **Recent Friction**: latest events tagged `RAGE` / `DEAD` with element, page, and time

**Derived schema (for export):**
```js
{ rageCount, rageIncidents, deadCount, total, hotspots:{key:{label,rage,dead,count}}, pages:{page:count}, recent:[{kind,label,page,ts}], sessionsWithClicks, frictionSessions, frictionRate }
```

**Technical notes:**
- Donut + swatches use the warm amber/sand palette (`rgba(176,122,74…)` rage, `rgba(201,168,124,0.55)` unresponsive) — no blue/pink. New `.friction-*` and `.fr-tag-*` CSS classes; reuses `jBarList()`, `analytics-stat-chip`, `compass-legend`/`compass-donut-row` styles, `escHtml()`, `fmtDate()`, `jPageLabel()`.
- Dead-click detection is a heuristic from stored data, not a live DOM check — the tab hint notes these are clicks that *likely* did nothing; generic body/whitespace clicks naturally sort below real repeated hotspots.
- Tab renders lazily on click, same pattern as Relay/Beacon/Orbit/Depth/Compass/Journey/Pulse/Spotlight/Revenue.

**API:** none new on `CommissionData` — uses `CommissionData.getAnalytics()`. Logic lives in `renderFrictionTab()` / `buildFriction()` / `frictionIsInteractive()` inside `admin/index.html`.

---

## Mosaic — Artwork Affinity & Co-View Analysis (Admin → Mosaic tab) — NEW TOOL

Answers a curation question no other tool can: **which artworks get looked at *together* in the same visit?** Spotlight ranks each artwork on its own (total viewport time); every other tool measures pages, timing, sources, retention, conversion, or money. None *relates artworks to one another*. Mosaic reads the same viewport events Spotlight records and builds a co-view affinity map — the works that resonate as a set, the connective "hub" pieces most visits pass through, and, for any single piece, what visitors most often view alongside it. A concrete signal for sequencing the portfolio, building a cohesive series, and deciding what to hang next to what.

**No new storage key** — derived live from `_gam_spotlight_v1` (the artwork viewport events Spotlight already records via `IntersectionObserver`), the same read-only pattern as Journey/Depth reading from `_gam_analytics_v1`.

**How it works:**
1. `buildMosaic()` groups spotlight events by `sid` into the **set** of distinct artworks (`artId`) that session viewed, keeping the longest human `label` per `artId`.
2. Sessions with `< 2` distinct artworks are skipped (a lone artwork has no companions).
3. For each qualifying session it forms every unordered artwork **pair** and increments that pair's co-occurrence count; it also records each artwork's per-partner co-view counts (`companions`) and how many multi-art sessions the artwork appears in (`artSessions`).
4. A **hub score** per artwork = the number of *distinct* other artworks it co-views with (breadth of connection), tie-broken by session count.

**Admin tab sections:**
- **Stats**: Multi-Art Sessions, Co-View Pairs (unique), Artworks Linked, Avg Arts / Session
- **Top Co-Viewed Pairs**: artwork pairs ranked by how many sessions viewed both, shown as `A × B` bars
- **Hub Artworks — Most Connective**: artworks ranked by distinct co-view partners (the connective anchors), annotated with companion + session counts
- **Companions Explorer**: pick any artwork → ranked list of what visitors most often view alongside it (shared-visit counts)

**Derived schema (for export):**
```js
{ multiArtSessions, uniquePairs, totalCoViews, artsLinked, avgArts,
  pairs:[{a,b,count}], hubs:[{label,partners,sessions}] }
```

**Technical notes:**
- Reuses the shared `jBarList()` renderer, `analytics-stat-chip`, `spotlight-board`/`sp-*` bar styles, `escHtml()`, and the `journey-select` dropdown style; only a small `.mosaic-pair-lbl` / `.mosaic-x` wrapper (warm amber `×` separator) is new — no blue/pink.
- Co-view is per session (`sid`), so one visitor across several tabs may count as separate sessions (consistent with the rest of the analytics family).
- Tab renders lazily on click, same pattern as Friction/Relay/Beacon/Orbit/Depth/Compass/Journey/Pulse/Spotlight/Revenue.

**API:** none new on `CommissionData` — uses `CommissionData.getSpotlight()`. Logic lives in `renderMosaicTab()` / `buildMosaic()` inside `admin/index.html`.

---

## Tide — Trends & Momentum (Admin → Tide tab) — NEW TOOL

Answers the one question the entire analytics family structurally cannot: **which direction is everything moving?** Every other tool aggregates *all-time* totals — Spotlight ranks artworks, Compass ranks sources, Journey maps flow, Mosaic pairs pieces — none of them compares *now* to *before*. Tide is the only view with a sense of **direction**: it splits the data into a recent window and the equal-length window immediately preceding it and reports the **deltas** — what's rising, what's fading, and whether the portfolio overall is gaining or losing momentum. The single most useful signal for an artist deciding whether a push is working and which pieces are catching on *right now*.

**Why it's genuinely new:** it's a *temporal-derivative* view, not another all-time aggregate. The Analytics tab's existing 30-day chart plots raw daily volume; Tide instead computes period-over-period change across traffic, artworks, pages, and sources, and ranks movers by how much they grew or shrank.

**No new storage key** — derived live from `_gam_analytics_v1` (`pv` events for traffic/pages/sources) and `_gam_spotlight_v1` (viewport events for artwork attention), the same read-only pattern as Journey/Mosaic. No changes to `analytics.js`.

**Window model:** a selectable compare window (**7 / 14 / 30 days**). "Recent" = the last N days; "Prior" = the N days immediately before that. Every metric is `recent − prior`, with `%` = `(recent − prior) / prior` (or `+100%` when prior is zero and recent is non-zero).

**How it works:**
1. `buildTide(windowDays)` timestamps two windows (`recStart = now − N·day`, `priStart = now − 2N·day`) and buckets each `pv`/spotlight event into recent (`r`), prior (`p`), or neither.
2. It tallies per-window visits, distinct sessions, per-page counts, per-channel counts (`compassClassify(refHost)`), and per-artwork viewport counts, plus a daily `views` series spanning both windows.
3. `movers()` unions the recent+prior keys and computes `{recent, prior, delta, pct}` per page / artwork / channel.

**Admin tab sections:**
- **Stats**: Visits (window), Visits vs Prior %, Sessions vs Prior %, Net Visit Δ (each with ▲/▼)
- **Daily Traffic — Momentum**: canvas line of daily visits across both windows; the prior half is drawn muted, the recent half in brighter amber, with a dashed vertical split marker at the boundary
- **Artworks on the Rise** / **Artworks Cooling Off**: pieces gaining / losing the most viewport attention this window (arrows + delta bars sized by absolute change)
- **Pages Trending**: pages moving up then down versus prior
- **Sources Trending**: acquisition channels moving up then down versus prior

**Derived schema (for export):**
```js
{ windowDays, recentVisits, priorVisits, visitsDelta, visitsPct,
  recentSessions, priorSessions, sessionsPct,
  dailyViews:[{day,views,recent}],
  pageMovers:[{key,label,recent,prior,delta,pct}], artMovers:[…], sourceMovers:[…] }
```

**Technical notes:**
- Rising = warm amber (`#c9a87c`), cooling = deep clay (`#96683e`) — differentiated by ▲/▼ arrows and bar tone, no blue/pink. New `.tide-*` CSS classes; reuses the `spotlight-board`/`sp-*` bar styles, `analytics-stat-chip`, `journey-select`, `escHtml()`, `jPageLabel()`, `compassClassify()`, and the canvas-line pattern from the Analytics trend chart.
- Movers is per session/event within each window, consistent with the rest of the family.
- Tab renders lazily on click (and re-renders on window-select change), same pattern as Mosaic/Friction/Relay/etc.

**API:** none new on `CommissionData` — uses `CommissionData.getAnalytics()` + `.getSpotlight()`. Logic lives in `renderTideTab()` / `buildTide()` inside `admin/index.html`.

---

## Ember — Engagement Quality Index & Session Scoring (Admin → Ember tab) — NEW TOOL

Answers the whole-visit question no other tool asks: **how good was this visit, overall?** Every existing analytics tool measures a *single* signal in isolation — Depth = scroll, Spotlight = artwork time, Journey = page flow, Pulse = timing, Compass = source, Beacon = conversion, Orbit = retention, Friction = negative UX, Relay = outbound, Mosaic = co-view, Tide = momentum. None *synthesises* them. Ember is the synthesis layer: it scores every session 0–100 from a weighted blend of six already-tracked signals, then sorts visits into quality tiers — turning a scatter of raw events into one honest read on whether people are genuinely engaging or just glancing and leaving.

**Why it's genuinely new:** it's a *composite* metric, not another single-signal aggregate. Journey reports bounce rate (one dimension); Depth reports scroll (another); Ember is the first view that combines depth + dwell + breadth + interaction + artwork attention + intent into a per-session index and a tiered distribution, and reports *which signals drive the score* and *which sources deliver the best-quality visits* (not just the most).

**No new storage key** — derived live from `_gam_analytics_v1` (`pv` / `click` / `scroll` / `exit` / `goal`) and `_gam_spotlight_v1` (artwork viewport ms), the same read-only pattern as Journey/Tide. No changes to `analytics.js`.

**Scoring model (per session, weights sum to 100):**

| Signal | Source | Cap (maxes out at) | Max points |
|--------|--------|--------------------|-----------|
| Pages viewed | `pv` count | 5 pages | 20 |
| Time on site | max `exit.ms` / session span | 3 min (180 000 ms) | 25 |
| Scroll depth | max `scroll.depth` | 100% | 20 |
| Interaction | `click` count | 6 clicks | 15 |
| Artwork attention | Σ spotlight `ms` | 60 s (60 000 ms) | 15 |
| Commission intent | any `goal` event | — (boolean) | 5 |

Each signal is capped, normalized to its weight, summed, rounded, and clamped to 100. Constants live in `EMBER_W` / `EMBER_CAP` at the top of the Ember block.

**Quality tiers** (`EMBER_TIERS`, warm amber ramp — no blue/pink): Bounced (0–9), Glancing (10–29), Browsing (30–54), Engaged (55–79), Invested (80–100). "Engaged+" = score ≥ 55.

**How it works:**
1. `buildEmber()` groups events by `sid`, totals spotlight ms per `sid`, and derives each session's six signals.
2. It computes the composite score, assigns a tier via `emberTierOf()`, and accumulates per-signal contribution sums.
3. It aggregates the tier distribution, average score, Engaged+ rate, per-signal average contribution, average score grouped by entry page and by acquisition channel (`compassClassify`), and the top-scoring sessions.

**Admin tab sections:**
- **Stats**: Sessions Scored, Avg Engagement Score, Engaged+ Rate %, Engaged+ Sessions
- **Quality Tier Distribution**: canvas donut + legend across the five tiers; centre shows the average score
- **What Drives the Score**: each signal's average contributed points vs. its max weight (the diagnostic behind the average)
- **Highest-Quality Entry Pages**: landing pages ranked by the average score of visits that started there
- **Engagement by Source**: channels ranked by average visit quality (the *best* source, complementing Compass's *most*)
- **Top Sessions by Quality**: highest-scoring individual visits with the full signal breakdown behind each score

**Derived schema (for export):**
```js
{ total, avgScore, engagedPlus, engagedRate, tierCounts:{…},
  contrib:[{signal,avg,weight,pctOfMax}], byEntry:[{label,avg,count}], bySource:[…],
  sessions:[{score,tier,pv,clicks,scroll,dwellMs,artMs,goal,entry,refHost,ts}] }
```

**Technical notes:**
- Donut + tier swatches use the warm amber/clay ramp (`rgba(176,122,74…)` invested → `rgba(120,116,108…)` bounced) — no blue/pink. New `.ember-*` CSS classes; reuses `jBarList` bar styles (`spotlight-board`/`sp-*`), `analytics-stat-chip`, `compass-legend`/`compass-donut-row`, `jFmtDur()`, `jPageLabel()`, `compassClassify()`, `escHtml()`, `fmtDate()`.
- Score bars use an *absolute* 0–100 scale (bar width = score), unlike the relative bars elsewhere, so tiers read consistently across sections.
- Scoring is per session (`sid`), so one visitor across several tabs may count more than once (consistent with the rest of the family).
- Tab renders lazily on click, same pattern as Tide/Mosaic/Friction/etc.

**API:** none new on `CommissionData` — uses `CommissionData.getAnalytics()` + `.getSpotlight()`. Logic lives in `renderEmberTab()` / `buildEmber()` inside `admin/index.html`.

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

*Last updated: 2026-07-23*
