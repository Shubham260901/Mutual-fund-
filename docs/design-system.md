# Design System

Tokens live in `tailwind.config.ts`; component classes live in `src/index.css`.

## Principles

1. **Trust before persuasion.** Clear facts, generous space and restrained motion. Nothing flashy.
2. **One idea per section.** Each section has an eyebrow, a heading, at most one supporting line, and one primary action.
3. **Navy frames, ivory reads.** Navy is used for hero bands, the "why us" band, CTAs and the footer. Long reading happens on ivory or white.
4. **Gold is a hairline, not a paint.** Gold appears in eyebrow rules, the logo, numerals and small accents, never as large fills or as body text on light backgrounds.

## Colour

| Token            | Hex       | Use                                                       |
| ---------------- | --------- | --------------------------------------------------------- |
| `navy-900`       | `#101D35` | Primary dark surface, headings, primary text              |
| `navy-950`       | `#0A1324` | Footer                                                    |
| `emerald-600`    | `#087F5B` | Primary actions, links, positive data series              |
| `emerald-700`    | `#06694B` | Hover state, eyebrow text on light (AA contrast)          |
| `ivory`          | `#F8F9F6` | Page background                                           |
| `mist`           | `#E9EDF0` | Dividers, slider tracks, quiet fills                      |
| `gold-400`       | `#C7A66A` | Decorative accents only on light backgrounds              |
| `gold-300`       | `#D7BE8E` | Eyebrows and accents on navy                              |
| `gold-700`       | `#7D6232` | Gold-toned text on light backgrounds (AA)                 |
| `ink-muted`      | `#4A5670` | Body copy (7.0:1 on ivory)                                |
| `ink-subtle`     | `#646E84` | Captions and helper text (≥ 4.5:1 on white)               |
| `chart-value`    | `#087F5B` | Chart: projected value                                    |
| `chart-invested` | `#5B7BC0` | Chart: amount invested                                    |

The two chart colours were validated for colour-vision-deficiency separation (ΔE ≥ 14 under deutan and protan simulation) and contrast against white. Charts also always show a legend, so identity never depends on colour alone.

## Typography

- **Display**: Plus Jakarta Sans 600–800, tight tracking (`-0.02em` to `-0.03em`).
- **Body**: Inter 400–600.

| Class          | Size (fluid)        | Use                     |
| -------------- | ------------------- | ----------------------- |
| `text-display-xl` | 40 → 68 px       | Page H1                 |
| `text-display-lg` | 32 → 48 px       | Section H2              |
| `text-display-md` | 24 → 32 px       | Sub-section / CTA title |
| `.lead`        | 18 px / 1.65        | Intro paragraphs        |
| `.eyebrow`     | 12 px, caps, +0.16em, gold rule | Section labels |

## Spacing & layout

- Container: `container-page`, max 1216 px with 16/24/32 px gutters.
- Section rhythm: `section` = 80 / 96 / 112 px vertical padding.
- Radius: 12 px for inputs, 24 px (`rounded-3xl`) for cards, 32 px (`rounded-4xl`) for feature panels, full for buttons.
- Shadows: `shadow-soft` at rest, `shadow-lift` on hover or for floating elements.

## Components

| Component          | Notes                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| `Button`           | `primary` / `secondary` / `ghost` / `light` / `outline-light`; renders `Link`, `a` or `button` |
| `SectionHeading`   | eyebrow + title + description (+ optional action); `tone="light"` on navy |
| `Reveal`           | fade-up once in view; respects reduced-motion                         |
| `PageHero`         | navy header band for inner pages                                      |
| `IconBadge`        | tinted rounded square for icons (`emerald`, `navy`, `gold`, `glass`)  |
| `Accordion`        | accessible (`aria-expanded`, `aria-controls`), animated height        |
| `SliderInput`      | range + typed input with validation                                   |
| `GrowthChart`      | SVG area/line chart with crosshair tooltip, keyboard support, table view |
| `Value`            | renders config values; flags `[placeholders]` in dev                  |

## Motion

- Easing `cubic-bezier(0.22, 1, 0.36, 1)`, 0.25–0.75 s.
- Entrance: 18 px rise + fade, staggered 60–100 ms. Once only.
- Hover: up to a 4 px lift on cards and 1 px on buttons, with colour shifts. No bouncing or parallax.
- `MotionConfig reducedMotion="user"` disables transforms for users who request it.

## Accessibility

- Skip link, visible focus rings (`emerald-600`), semantic landmarks.
- All text/background pairs meet WCAG AA.
- Forms: labelled fields, `aria-invalid`, errors linked with `aria-describedby`, focus moves to the first error.
- Calculator tabs follow the WAI-ARIA tabs pattern (arrow-key navigation).
