# Anthony Ryabchikov Portfolio — CLAUDE.md

## Project Overview

Static art portfolio for **Anthony Ryabchikov** (online alias: gamboiuwu), hosted at `antryab.com` via GitHub Pages. The owner is a freelance artist, event director, and creator based in New York, graduating Fall 2026 with a BFA in Studio Art, Business & Liberal Arts Minor, and Japanese Minor.

### Quick Facts
- **Name**: Anthony Ryabchikov (aka gamboiuwu)
- **Email**: gamboiuwu@nyfurs.org
- **Discord/Telegram**: @gamboiuwu
- **Social**: @gamboiuwu (Twitter/X), @gamboi.v (Instagram)
- **Artstation**: artstation.com/gamboiuwu
- **Specialties**: Character design, digital art, Telegram stickers, animation, videography, techwear fashion (Yuka Designs), event coordination (New York Furs)
- **Projects**: Yuka Designs (yuka.design), New York Furs (nyfurs.org), letfexraut (music alias on Bandcamp), Extortia (sci-fi indie game — Resonance Awards 2021: Most Innovative Project & Best Sound Design)

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

| Type      | Extra Fields                                   |
|-----------|------------------------------------------------|
| `pv`      | `ref` (referrer or "direct")                   |
| `click`   | `el` (tag.class), `text`, `href`, `xp`, `yp`  |
| `scroll`  | `depth` (25 / 50 / 75 / 100)                   |
| `exit`    | `ms` (milliseconds on page)                    |

- **`sid`**: session ID (per tab, stored in sessionStorage)
- **`page`**: URL pathname, normalized (trailing slash, no index.html)
- **`ts`**: Unix timestamp (ms)
- **`xp` / `yp`**: click position as 0–1 fraction of viewport width/height
- Max 3000 events; oldest are rotated out automatically
- Admin page is **excluded** from tracking
- `window.GamAnalytics` is the public API (`.get()`, `.clear()`)

### Heatmap Visualizer (Admin → Analytics tab)
Canvas-based click density map. Select a page from the dropdown, see click positions as color-coded dots (blue=low density → red=high). Uses proximity bucketing (32×32 grid cells) to aggregate nearby clicks.

---

## Admin Dashboard (`/admin/`)

Password-protected (SHA-256 hash in localStorage, 5-attempt lockout). Session tracked via `sessionStorage._gam_sess`.

### Tabs
| Tab         | Description                                                    |
|-------------|----------------------------------------------------------------|
| Gallery     | Manage commission images and Telegram stickers                 |
| Fonts       | Load Google Fonts or upload font files; assign to headings/body|
| Styles      | Accent color picker, custom CSS injection                      |
| Featured    | Featured Works cards shown on homepage (cover, title, etc.)    |
| Pricing     | Commission price tables (columns/rows/add-ons per category)    |
| Security    | Change admin password; reset gallery/styles to defaults        |
| Inquiries   | View, read, reply to, delete commission form submissions        |
| Feedback    | Log issues/ideas for AI routine guidance; track status         |
| Analytics   | Site visitor stats, session list, click heatmap visualizer     |
| Palette     | Color palette extractor — sample dominant colors from artwork  |

---

## Color Palette Extractor (Admin → Palette tab) — NEW TOOL

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

*Last updated: 2026-05-22*
