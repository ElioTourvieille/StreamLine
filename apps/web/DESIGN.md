---
name: StreamLine
description: Studio command center for web agencies — projects, clients, deliverables, approvals.
colors:
  violet: "#7c3aed"
  violet-deep: "#6d28d9"
  violet-glow: "#d2bbff"
  bg: "#131317"
  surface: "#1A1A24"
  surface-high: "#1f1f23"
  surface-dim: "#0e0e12"
  line: "#2D2D3D"
  line-dim: "#4a4455"
  ink: "#F1F5F9"
  ink-dim: "#ccc3d8"
  ink-muted: "#8896a8"
  ink-faint: "#958da1"
  success: "#22C55E"
  warning: "#F59E0B"
  danger: "#EF4444"
  info: "#3B82F6"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.06em"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.violet-deep}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-high}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  nav-item-active:
    backgroundColor: "{colors.surface-high}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  badge-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  badge-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
---

# Design System: StreamLine

## 1. Overview

**Creative North Star: "The Studio Monitor"**

StreamLine's visual system is a reference-grade tool — like a calibrated studio monitor used by audio engineers. What you see is project reality without filter or enhancement. The interface does not celebrate itself. It is dark so that the work is visible; it is quiet so that signals are heard; it is dense because professionals need information, not whitespace. A studio owner should be able to open the dashboard, absorb the project health picture in under five seconds, and close the laptop with confidence.

Clean and professional — the kind of tool you show a client during a call without hesitation. Every design decision asks: "does this make the information clearer, or does it add visual noise?" If it doesn't help you see the work, it shouldn't be there. This is not minimalism as aesthetic; it is clarity as function.

This system explicitly rejects the generic purple SaaS scaffold — dark backgrounds plastered with violet accents, gradient blobs, and glassmorphic cards that signal "designed by AI template." Studio Violet exists to mark a single thing at a time: the one action worth taking, the one status that needs attention. Its rarity is the point. Equally rejected: the playful startup aesthetic (rounded everything, emoji-forward, pastel palette) that reads as designed for consumer apps, not for professionals billing at agency rates.

**Key Characteristics:**
- Tonal depth replaces shadow — four surface layers create hierarchy without blur
- Studio Violet appears on ≤15% of any screen, always earning its presence
- Inter at tight tracking creates a precise, focused reading environment
- Semantic color is never decorative — success green and warning amber mean exactly that
- Motion is exponential-ease under 350ms; never decorative choreography

---

## 2. Colors: The Monitor Palette

A near-monochromatic dark foundation with one precisely rationed accent. The palette reads like the inside of a high-end mixing studio — deep void surfaces, subtle tonal layers, and a single violet signal that commands attention because it never competes with itself.

### Primary
- **Studio Violet** (`#7c3aed`): The sole interactive signal. Used exclusively on primary CTAs, active navigation state backgrounds, and critical status markers. Never decorative. If it's not asking you to act or telling you something needs attention, it should not be violet.
- **Violet Deep** (`#6d28d9`): Hover state for Studio Violet elements only. Never used as a standalone color.
- **Violet Echo** (`#d2bbff`): Soft tint for secondary emphasis — initials avatars, in-progress markers, em text in the proposal viewer. The whisper, not the shout.

### Neutral
- **Studio Void** (`#131317`): Page background. The base layer everything else sits on.
- **Surface** (`#1A1A24`): Cards, panels, modals, the sidebar. The primary content surface.
- **Surface High** (`#1f1f23`): Hover states, active nav backgrounds, table row highlights. One step lighter than Surface.
- **Surface Dim** (`#0e0e12`): The sidebar background — one step darker, visually recessed from the content area.
- **Line** (`#2D2D3D`): All borders and dividers between surfaces. Never thicker than 1px.
- **Line Dim** (`#4a4455`): Secondary borders — input focus rings, scrollbar thumbs on hover.
- **Ink** (`#F1F5F9`): Primary text. Headings, labels, active items, values. 4.5:1+ against all surface layers.
- **Ink Dim** (`#ccc3d8`): Secondary text — supporting body copy, proposal prose.
- **Ink Muted** (`#64748B`): De-emphasized text — column headers, placeholder text, supplementary metadata. Minimum 4.5:1 must be maintained against each surface it appears on.
- **Ink Faint** (`#958da1`): Tertiary text — timestamps, actor names, truly de-emphasized labels.

### Semantic
- **Signal Green** (`#22C55E`): Active projects, successful validations, completed milestones. Used with 15% opacity fill (`success/15`) for badge backgrounds.
- **Signal Amber** (`#F59E0B`): Pending validations, in-review projects, follow-up clients. Used with 15% opacity fill (`warning/15`) for badge backgrounds.
- **Signal Red** (`#EF4444`): Errors, destructive actions, failed states.
- **Signal Blue** (`#3B82F6`): Informational — maintenance status, neutral notifications.

### Named Rules
**The One Signal Rule.** Studio Violet marks a single thing at a time: the primary CTA or the active state. Two violet elements on the same screen compete with each other and collapse into decoration. When in doubt, make the other element a ghost.

**The Semantic Lock.** Signal Green means active or approved. Signal Amber means attention needed. Signal Red means error or destructive. These colors never appear for decorative or brand purposes — only as truthful status signals. If a badge would be violet for brand reasons, it should be a ghost badge with a muted border instead.

---

## 3. Typography

**Display / Body Font:** Inter (system-ui, sans-serif fallback)

**Character:** A single geometric sans-serif family working across all weights. Inter's optical corrections at small sizes make it read cleanly at 11px (labels) and as a commanding heading at 32px. The system never pairs fonts — the hierarchy is achieved through weight contrast (400 body → 600 title → 600 display) and size ratios, not family contrast. This is a professional tool, not an editorial publication.

### Hierarchy
- **Display** (600 weight, clamp(1.75rem, 3vw, 2rem), lh 1.15, ls -0.02em): Page-level greetings and primary screen titles only. Used once per view. Never in cards.
- **Title** (600 weight, 1.125rem / 18px, lh 1.3, ls -0.01em): Card headers, section titles, modal headings.
- **Body** (400 weight, 0.875rem / 14px, lh 1.6): Default for all content text, table cell values, descriptions.
- **Label** (600 weight, 0.6875rem / 11px, ls 0.06em, uppercase): Column headers in tables, sidebar section labels. Use sparingly — three or fewer per view.
- **Caption** (400 weight, 0.6875rem / 11px): Timestamps, actor metadata, secondary supporting text.

### Named Rules
**The One Label Rule.** Uppercase tracked label type is reserved for table column headers and true metadata roles — not for stat card categories, not for section eyebrows above every content block. If every section on a page has an uppercase label above it, none of them carry weight. Use prose headings or remove the label entirely.

**The Tight Tracking Floor.** Display headings use `letter-spacing: -0.02em` minimum. Never tighter than `-0.04em` — at that point letters begin to touch. Labels use `letter-spacing: 0.06em` maximum. The gap between these two poles creates the typographic rhythm.

---

## 4. Elevation

StreamLine is flat by design. There are no drop shadows in the system. Depth is conveyed entirely through tonal layering: four named surface levels create a spatial hierarchy without any blur or shadow — **Surface Dim** (sidebar, recessed) → **Studio Void** (page background) → **Surface** (cards, panels) → **Surface High** (hover states, active backgrounds).

This is the Studio Monitor principle applied to elevation: the display doesn't add glow to make colors look better. StreamLine doesn't add shadow to make surfaces feel deeper. The tones are the truth.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are always flat at rest. No box-shadow on cards, no backdrop-filter on overlays, no frosted glass. The only permitted visual depth effect is tonal color — a surface that is one step lighter than its container, with a 1px border at `{colors.line}`. If the element needs more visual separation, use a brighter border color (`{colors.line-dim}`), not a shadow.

**The Modal Exception.** The single allowed shadow is on modal/dialog overlays, using `0 25px 50px rgba(0,0,0,0.5)` to lift the surface above the backdrop dimmer. This is structural, not decorative.

---

## 5. Components

### Buttons

Tight, intentional, and unambiguous about their role. The primary button is the only violet element on most screens.

- **Shape:** Gently rounded (8px / `rounded-md`). Not pill-shaped — pills read as consumer products.
- **Primary:** Studio Violet background (`#7c3aed`), Ink text, 10px vertical / 16px horizontal padding, 14px / 600-weight label. Hover → Violet Deep (`#6d28d9`). Active → scale(0.98). Transition: `background 150ms ease-out, transform 100ms ease-out`.
- **Ghost / Secondary:** Surface background (`#1A1A24`), 1px Line border, Ink text. Hover → Surface High background. Used for secondary actions on the same screen as a primary CTA.
- **Destructive:** Danger Red background (`#EF4444`) only for final destructive confirms (delete, remove). Never used for first-click actions.
- **Focus:** `outline: 2px solid {colors.violet}; outline-offset: 2px` on all button variants. Visible, brand-consistent.

### Cards / Containers

The primary content surface. Every data panel, stat block, and list lives in a card.

- **Corner Style:** Gently rounded (12px / `rounded-xl`)
- **Background:** Surface (`#1A1A24`)
- **Border:** 1px solid Line (`#2D2D3D`). Never omit the border — without it, cards dissolve into the page background.
- **Shadow Strategy:** None. Tonal separation from the page background (`#131317`) provides all the visual lift needed.
- **Internal Padding:** 20–24px on desktop, 16px on mobile.
- **Hover:** Background transitions to Surface High (`#1f1f23`) at 150ms for interactive cards (project rows, client cards). Non-interactive cards (stat panels) do not change on hover.

### Navigation (Sidebar)

The sidebar is recessed at Surface Dim (`#0e0e12`) against the page body, creating a visual frame without a heavy visual weight.

- **Item default:** Ink Muted text, no background, 8px vertical / 12px horizontal padding, 8px radius.
- **Item hover:** Surface High background (`#1f1f23`), Ink text. 150ms transition.
- **Item active:** Surface High background (`#1f1f23`), Ink text, Studio Violet dot or icon accent. **No border-left stripe.** Active state is communicated through background change and icon color, not a colored vertical rule on the edge.
- **Notification badge:** Studio Violet filled circle (`#7c3aed`), 16px, positioned as a superscript on the icon — small enough to not overpower the nav item.

### Status Badges

Compact, semantic, and consistent. Never decorative.

- **Shape:** Full pill (`border-radius: 9999px`), 11px / 600-weight text, 2px vertical / 10px horizontal padding.
- **Active / Success:** Signal Green background at 15% opacity, Signal Green text, optional 1px Signal Green border at 30% opacity.
- **In Review / Warning:** Signal Amber background at 15% opacity, Signal Amber text, 30% opacity border.
- **Completed / Archived:** White at 5–10% opacity background, Ink Muted text.
- **Draft:** Violet at 15% opacity background, Violet Echo text.

### Data Tables

Used on the Active Projects panel in the dashboard and the clients list.

- **Header row:** Ink Muted text, 11px / 600-weight / uppercase / letter-spacing 0.06em. This is the single permitted use of the uppercase label pattern.
- **Body rows:** 14px Body text, Ink color for primary cell, Ink Muted for secondary cells. Row height 56px on desktop.
- **Row hover:** Surface High background, 150ms transition.
- **Dividers:** 1px Line between rows. No divider below the last visible row.
- **No zebra striping.** Row hover provides sufficient affordance without the visual noise.

### Inputs / Forms

- **Style:** Surface background, 1px Line border, 8px radius, 10px vertical / 12px horizontal padding, 14px Body text.
- **Placeholder:** Ink Faint (`#958da1`). Must maintain 4.5:1 against Surface background — verify before shipping.
- **Focus:** Line color shifts to Line Dim (`#4a4455`) or Violet (`#7c3aed`) at 50% opacity. `outline: none` — border provides the focus signal.
- **Error:** Danger Red border (`#EF4444`), small error message in Danger Red below the field at 12px.
- **Disabled:** 50% opacity on the entire input, `cursor: not-allowed`.

### AI Proposal Viewer (Signature Component)

The `.prose-proposal` class renders streamed Markdown from the AI generator — the product's differentiator feature.

- **Container:** Max-width 780px, Ink Dim base text (`#ccc3d8`), 14px / 1.75 line-height.
- **H1:** Full Ink (`#F1F5F9`), 22px / 700 weight, 1rem bottom border at Line color — the only instance of a bottom border on a heading.
- **H2:** Full Ink, 16.8px / 600 weight, 2rem top margin — creates generous sectional breathing room.
- **H3:** Violet Echo (`#d2bbff`), 14px / 600 weight.
- **Code:** Surface background, 1px Line border, 4px radius, Violet Echo text.
- **Blockquote:** 3px Studio Violet left border (the single permitted use of a visible colored border), Ink Faint text. This is a semantic callout, not a nav item.

---

## 6. Do's and Don'ts

### Do:
- **Do** use Studio Violet exclusively for the single primary CTA, the active nav state background, and critical status indicators — one per context at most.
- **Do** use `border-radius: 8px` (md) on buttons and inputs, `12px` (lg) on cards and panels. Consistency creates the professional baseline.
- **Do** use semantic color with 15% opacity backgrounds for badges: green for approved/active, amber for pending/warning, red for errors. Always pair background with matching text color.
- **Do** use exponential easing (`cubic-bezier(0.16, 1, 0.3, 1)`) for entrances and state transitions, 150–350ms duration. Fast enough to feel instant; slow enough to feel intentional.
- **Do** include `@media (prefers-reduced-motion: reduce)` on all Framer Motion animations — crossfade fallback, no transform.
- **Do** test every Ink Muted text value against its actual surface: `#64748B` on `#1A1A24` ≈ 4.2:1. If a surface variant brings this below 4.5:1, bump the text toward `{colors.ink-dim}`.
- **Do** use `text-wrap: balance` on all h1–h3 headings to prevent orphans on responsive layouts.
- **Do** keep the sidebar user info section dynamic — name and org loaded from `api.auth.me()`, never hardcoded.

### Don't:
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent on navigation items, cards, or callouts. This is a banned pattern in this system. The single exception is the blockquote in `.prose-proposal`, where the border is semantic (a callout marker), not decorative.
- **Don't** use uppercase tracked label text (`text-[10px] uppercase tracking-widest`) above stat cards, section headings, or dashboard panels as eyebrow decorations. This is the AI scaffold tell. Reserve it exclusively for data table column headers.
- **Don't** use Studio Violet as a fill color on more than one primary action per screen. If two actions need emphasis, one becomes primary (violet) and the other becomes ghost. Two violet buttons cancel each other out.
- **Don't** add decorative gradient text, glassmorphism cards, or backdrop-filter blur effects. This system is flat by doctrine. Any instance of `background-clip: text` or `backdrop-filter: blur` is prohibited.
- **Don't** build identical card grids — same icon, same heading, same body text, same size, repeated three or four times. One onboarding step section with three equal cards is already at the edge. Beyond three steps, differentiate visually or use a list.
- **Don't** use Studio Violet as a background fill on any surface other than the primary button and the notification badge. Violet sections, violet hero backgrounds, violet gradients: all banned.
- **Don't** ship placeholder or hardcoded user data ("Elio Rossi / Origin Studio") in production views. Every dynamic value must come from the API.
- **Don't** add `box-shadow` to cards, modals (except the single permitted overlay shadow), or any UI component. Tonal depth is the elevation system; shadows break the Studio Monitor aesthetic.
