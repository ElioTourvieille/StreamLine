---
name: StreamLine
description: Studio command center for web agencies — projects, clients, deliverables, approvals.
colors:
  violet: "#7c3aed"
  violet-deep: "#6d28d9"
  violet-glow: "#5b21b6"
  bg: "#F7F7FB"
  surface: "#FFFFFF"
  surface-high: "#F1F2F6"
  surface-dim: "#EFF0F4"
  line: "#E4E4EA"
  line-dim: "#9193AC"
  ink: "#14141C"
  ink-dim: "#45465A"
  ink-muted: "#6B6C80"
  ink-faint: "#737391"
  success: "#0F6B32"
  warning: "#A34B08"
  danger: "#C81E1E"
  info: "#2563EB"
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
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.violet-deep}"
    textColor: "#FFFFFF"
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
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  badge-warning:
    backgroundColor: "{colors.warning}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "2px 10px"
---

# Design System: StreamLine

## 1. Overview

**Creative North Star: "The Studio Desk"**

StreamLine's visual system is a clean desk under daylight — papers, cards, and panels laid out on a calm, well-lit surface. What you see is project reality without filter or enhancement; the light simply makes it easier to look at for the eight hours a day someone actually uses this tool. The interface does not celebrate itself. It is light so the work is legible at a glance, on a call, on a projector; it is quiet so signals are heard; it is dense because professionals need information, not whitespace. A studio owner should be able to open the dashboard, absorb the project health picture in under five seconds, and close the laptop with confidence.

This replaces the system's original dark "Studio Monitor" identity — a deliberate choice for a hackathon demo, revisited once Origin Studio started using this with real clients daily. The doctrine underneath is unchanged: restraint, semantic honesty, density without clutter. Only the light source changed.

Clean and professional — the kind of tool you show a client during a call without hesitation. Every design decision asks: "does this make the information clearer, or does it add visual noise?" If it doesn't help you see the work, it shouldn't be there. This is not minimalism as aesthetic; it is clarity as function.

This system explicitly rejects the generic purple SaaS scaffold — pastel gradient blobs, glassmorphic cards, and a violet accent smeared over everything that signal "designed by AI template." Studio Violet exists to mark a single thing at a time: the one action worth taking, the one status that needs attention. Its rarity is the point. Equally rejected: the playful startup aesthetic (rounded everything, emoji-forward, candy palette) that reads as designed for consumer apps, not for professionals billing at agency rates.

**Key Characteristics:**
- Tonal depth replaces shadow — four surface layers (page, sidebar, card, hover) create hierarchy without blur
- Studio Violet appears on ≤15% of any screen, always earning its presence
- Inter at tight tracking creates a precise, focused reading environment
- Semantic color is never decorative — success green and warning amber mean exactly that, darkened enough to stay legible on white
- Motion is exponential-ease under 350ms; never decorative choreography
- No dark mode. Light is the only theme — one token set to maintain, one experience to get right

---

## 2. Colors: The Desk Palette

A near-monochromatic light foundation with one precisely rationed accent. The palette reads like a well-organized studio desk in daylight — paper-white surfaces, a soft recessed sidebar, and a single violet signal that commands attention because it never competes with itself.

### Primary
- **Studio Violet** (`#7c3aed`): The sole interactive signal. Used exclusively on primary CTAs, active navigation state backgrounds, and critical status markers. Never decorative. If it's not asking you to act or telling you something needs attention, it should not be violet. Unchanged from the dark system — it already read at 5.7:1 on white.
- **Violet Deep** (`#6d28d9`): Hover state for Studio Violet elements only. Never used as a standalone color.
- **Violet Echo** (`#5b21b6`): Deep violet for text and icons sitting on a violet tint — initials avatars, in-progress markers, `em` text in the proposal viewer, H3 headings. Darkened from the dark system's pale lavender (`#d2bbff`), which only worked on a near-black ground; on white it needs to be dark to stay legible, not light.

### Neutral
- **Studio Desk** (`#F7F7FB`): Page background. The base layer everything else sits on.
- **Surface** (`#FFFFFF`): Cards, panels, modals. The primary content surface — true white, so cards read as paper on the desk.
- **Surface High** (`#F1F2F6`): Hover states, active nav backgrounds, table row highlights. One step darker than Surface.
- **Surface Dim** (`#EFF0F4`): The sidebar background — one step off the page background, visually recessed from the content area.
- **Line** (`#E4E4EA`): All borders and dividers between surfaces. Never thicker than 1px. Decorative-strength only — not for input boundaries.
- **Line Dim** (`#9193AC`): Stronger borders — resting input borders, focus rings, scrollbar thumbs on hover. Verified ≥3:1 against white (WCAG 1.4.11 non-text contrast for UI components).
- **Ink** (`#14141C`): Primary text. Headings, labels, active items, values. 18:1+ against Surface.
- **Ink Dim** (`#45465A`): Secondary text — supporting body copy, proposal prose. ~9:1 against Surface.
- **Ink Muted** (`#6B6C80`): De-emphasized text — column headers, placeholder text, supplementary metadata. 5.1:1 against Surface.
- **Ink Faint** (`#737391`): Tertiary text — timestamps, actor names, truly de-emphasized labels. 4.6:1 against Surface — deliberately close to Ink Muted; a light ground leaves much less headroom between "muted" and "faint" than the dark system had, and the accessibility floor won that tradeoff over visual separation.

### Semantic
- **Signal Green** (`#0F6B32`): Active projects, successful validations, completed milestones. Used with 8% opacity fill for badge backgrounds.
- **Signal Amber** (`#A34B08`): Pending validations, in-review projects, follow-up clients. Used with 8% opacity fill for badge backgrounds.
- **Signal Red** (`#C81E1E`): Errors, destructive actions, failed states.
- **Signal Blue** (`#2563EB`): Informational — maintenance status, neutral notifications.

All four are darkened well past what the dark system used (`#22C55E`, `#F59E0B`, `#EF4444`, `#3B82F6`) — those raw hues sit under 2:1 against white and are unusable as text. Every semantic color here was checked against both `#FFFFFF` and its own 8% tint and holds ≥4.5:1 in both places.

### Named Rules
**The One Signal Rule.** Studio Violet marks a single thing at a time: the primary CTA or the active state. Two violet elements on the same screen compete with each other and collapse into decoration. When in doubt, make the other element a ghost.

**The Semantic Lock.** Signal Green means active or approved. Signal Amber means attention needed. Signal Red means error or destructive. These colors never appear for decorative or brand purposes — only as truthful status signals. If a badge would be violet for brand reasons, it should be a ghost badge with a muted border instead.

**The 8% Tint Rule.** Any badge or chip that pairs a semantic color as both background tint and text color uses `/8` opacity, not the more familiar `/15` — at 15%, a background this light pushes the darkened semantic text under the 4.5:1 floor. Icons and non-text fills (a lone confirmation checkmark, a status dot) aren't bound by this and may use a stronger tint like `/10`–`/15` where it reads better; the rule is about text sitting on the tint, not the tint itself.

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

StreamLine is flat by design. There are no drop shadows in the system. Depth is conveyed entirely through tonal layering: four named surface levels create a spatial hierarchy without any blur or shadow — **Surface Dim** (sidebar, recessed) → **Studio Desk** (page background) → **Surface** (cards, panels) → **Surface High** (hover states, active backgrounds).

This is the Studio Desk principle applied to elevation: papers on a desk are distinguished by their position and a hairline edge, not by a drop shadow underneath each one. The tones are the truth.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are always flat at rest. No box-shadow on cards, no backdrop-filter on overlays, no frosted glass. The only permitted visual depth effect is tonal color — a surface that is one step lighter than its container, with a 1px border at `{colors.line}`. If the element needs more visual separation, use a stronger border color (`{colors.line-dim}`), not a shadow.

**The Modal Exception.** The single allowed shadow is on modal/dialog overlays, using `0 25px 50px rgba(20,20,28,0.18)` to lift the surface above the backdrop dimmer. This is structural, not decorative — on a light ground, a modal has nothing but shadow to separate it from a same-color page, unlike the dark system where the black backdrop did that work.

---

## 5. Components

### Buttons

Tight, intentional, and unambiguous about their role. The primary button is the only violet element on most screens.

- **Shape:** Gently rounded (8px / `rounded-md`). Not pill-shaped — pills read as consumer products.
- **Primary:** Studio Violet background (`#7c3aed`), white text, 10px vertical / 16px horizontal padding, 14px / 600-weight label. Hover → Violet Deep (`#6d28d9`). Active → scale(0.98). Transition: `background 150ms ease-out, transform 100ms ease-out`.
- **Ghost / Secondary:** Surface background (`#FFFFFF`), 1px Line border, Ink text. Hover → Surface High background. Used for secondary actions on the same screen as a primary CTA.
- **Destructive:** Danger Red background (`#C81E1E`) only for final destructive confirms (delete, remove). Never used for first-click actions.
- **Focus:** `outline: 2px solid {colors.violet}; outline-offset: 2px` on all button variants. Visible, brand-consistent.

### Cards / Containers

The primary content surface. Every data panel, stat block, and list lives in a card.

- **Corner Style:** Gently rounded (12px / `rounded-xl`)
- **Background:** Surface (`#FFFFFF`)
- **Border:** 1px solid Line (`#E4E4EA`). Never omit the border — without it, cards dissolve into the page background.
- **Shadow Strategy:** None. Tonal separation from the page background (`#F7F7FB`) provides the visual lift needed; the border does the rest.
- **Internal Padding:** 20–24px on desktop, 16px on mobile.
- **Hover:** Background transitions to Surface High (`#F1F2F6`) at 150ms for interactive cards (project rows, client cards). Non-interactive cards (stat panels) do not change on hover.

### Navigation (Sidebar)

The sidebar is recessed at Surface Dim (`#EFF0F4`) against the page body, creating a visual frame without a heavy visual weight.

- **Item default:** Ink Muted text, no background, 8px vertical / 12px horizontal padding, 8px radius.
- **Item hover:** Surface High background (`#F1F2F6`), Ink text. 150ms transition.
- **Item active:** Surface High background (`#F1F2F6`), Ink text, Studio Violet icon accent. **No border-left stripe.** Active state is communicated through background change and icon color, not a colored vertical rule on the edge.
- **Notification badge:** Studio Violet filled circle (`#7c3aed`), 16px, positioned as a superscript on the icon — small enough to not overpower the nav item.

### Status Badges

Compact, semantic, and consistent. Never decorative.

- **Shape:** Full pill (`border-radius: 9999px`), 11px / 600-weight text, 2px vertical / 10px horizontal padding.
- **Active / Success:** Signal Green background at 8% opacity, Signal Green text, optional 1px Signal Green border at 30% opacity.
- **In Review / Warning:** Signal Amber background at 8% opacity, Signal Amber text, 30% opacity border.
- **Completed / Archived:** Ink at 5–8% opacity background, Ink Muted text.
- **Draft:** Violet at 15% opacity background, Violet Echo text (Echo is dark enough that 15% is fine here — see the 8% Tint Rule above).

### Data Tables

Used on the Active Projects panel in the dashboard and the clients list.

- **Header row:** Ink Muted text, 11px / 600-weight / uppercase / letter-spacing 0.06em. This is the single permitted use of the uppercase label pattern.
- **Body rows:** 14px Body text, Ink color for primary cell, Ink Muted for secondary cells. Row height 56px on desktop.
- **Row hover:** Surface High background, 150ms transition.
- **Dividers:** 1px Line between rows. No divider below the last visible row.
- **No zebra striping.** Row hover provides sufficient affordance without the visual noise.

### Inputs / Forms

- **Style:** Surface background, 1px Line border, 8px radius, 10px vertical / 12px horizontal padding, 14px Body text.
- **Placeholder:** Ink Faint (`#737391`). Holds 4.6:1 against Surface — verify before shipping if the surface behind an input ever changes.
- **Focus:** Border shifts to Line Dim (`#9193AC`) or Violet (`#7c3aed`) at 50% opacity. `outline: none` — border provides the focus signal.
- **Error:** Danger Red border (`#C81E1E`), small error message in Danger Red below the field at 12px.
- **Disabled:** 50% opacity on the entire input, `cursor: not-allowed`.

### AI Proposal Viewer (Signature Component)

The `.prose-proposal` class renders streamed Markdown from the AI generator — the product's differentiator feature.

- **Container:** Max-width 780px, Ink Dim base text (`#45465A`), 14px / 1.75 line-height.
- **H1:** Full Ink (`#14141C`), 22px / 700 weight, 1rem bottom border at Line color — the only instance of a bottom border on a heading.
- **H2:** Full Ink, 16.8px / 600 weight, 2rem top margin — creates generous sectional breathing room.
- **H3:** Violet Echo (`#5b21b6`), 14px / 600 weight.
- **Code:** Surface-High background, 1px Line border, 4px radius, Violet Echo text.
- **Blockquote:** 3px Studio Violet left border (the single permitted use of a visible colored border), Ink Muted text. This is a semantic callout, not a nav item.

---

## 6. Do's and Don'ts

### Do:
- **Do** use Studio Violet exclusively for the single primary CTA, the active nav state background, and critical status indicators — one per context at most.
- **Do** use `border-radius: 8px` (md) on buttons and inputs, `12px` (lg) on cards and panels. Consistency creates the professional baseline.
- **Do** use semantic color with 8% opacity backgrounds for badges where text sits directly on the tint: green for approved/active, amber for pending/warning, red for errors. Always pair background with matching text color. Icon-only fills (no text on the tint) can go stronger, `/10`–`/15`.
- **Do** use exponential easing (`cubic-bezier(0.16, 1, 0.3, 1)`) for entrances and state transitions, 150–350ms duration. Fast enough to feel instant; slow enough to feel intentional.
- **Do** include `@media (prefers-reduced-motion: reduce)` on all Framer Motion animations — crossfade fallback, no transform.
- **Do** verify any new text/surface pairing against WCAG AA (4.5:1 body text, 3:1 UI components) before shipping — a light ground has far less contrast headroom than the old dark one did, especially on the muted/faint end of the ink scale.
- **Do** use `text-wrap: balance` on all h1–h3 headings to prevent orphans on responsive layouts.
- **Do** keep the sidebar user info section dynamic — name and org loaded from `api.auth.me()`, never hardcoded.

### Don't:
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent on navigation items, cards, or callouts. This is a banned pattern in this system. The single exception is the blockquote in `.prose-proposal`, where the border is semantic (a callout marker), not decorative.
- **Don't** use uppercase tracked label text (`text-[10px] uppercase tracking-widest`) above stat cards, section headings, or dashboard panels as eyebrow decorations. This is the AI scaffold tell. Reserve it exclusively for data table column headers.
- **Don't** use Studio Violet as a fill color on more than one primary action per screen. If two actions need emphasis, one becomes primary (violet) and the other becomes ghost. Two violet buttons cancel each other out.
- **Don't** add decorative gradient text, glassmorphism cards, or backdrop-filter blur effects. This system is flat by doctrine. Any instance of `background-clip: text` or `backdrop-filter: blur` is prohibited.
- **Don't** build identical card grids — same icon, same heading, same body text, same size, repeated three or four times. One onboarding step section with three equal cards is already at the edge. Beyond three steps, differentiate visually or use a list.
- **Don't** use Studio Violet as a background fill on any surface other than the primary button and the notification badge. Violet sections, violet hero backgrounds, violet gradients: all banned. (The landing page's soft violet-tinted glow behind the hero and the CTA card is the one deliberate exception — a `color-mix` radial fade at 15–20% strength, never a solid violet field.)
- **Don't** ship placeholder or hardcoded user data ("Elio Rossi / Origin Studio") in production views. Every dynamic value must come from the API.
- **Don't** add `box-shadow` to cards, or any UI component (except the single permitted modal overlay shadow). Tonal depth is the elevation system; shadows break the Studio Desk aesthetic.
- **Don't** reuse a literal `bg-white/N` or `bg-black/N` overlay copied from the old dark system — on a light page, `white/N` is nearly invisible and was always standing in for "a neutral tint of the page," which is now `bg-ink/N`. A pure black scrim behind a modal is the one overlay that stays literal in either theme.
- **Don't** reintroduce a dark mode without deciding it's worth doubling the token surface again. The system is light-only by choice, not by omission.
