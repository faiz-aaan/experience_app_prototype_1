# The Cousin: PRD site design

## Brief

- **Subject:** "The Cousin", an AI app that plans outings, food, communities and events in Chennai. It knows the person, reads today, suggests a few checked ideas, re-plans on follow-ups and remembers.
- **Audience:** the founder and his co-founders. They need to understand what is being built and how, then explain it to others.
- **Job:** a product requirements document as a website. Concise, section by section, plain language, with one animated film per algorithm and one running example.
- **Constraints:** static site on GitHub Pages at `/experience_app_prototype_1/`. Every number comes from the simulation results. Every piece carries an honest status: tested in simulation, designed but untested, or open.
- **Assumptions:** the product name stays "The Cousin". All places, prices and people in examples are invented. Simulation numbers are from synthetic people.

## Concept card

```
Idea:        The site is drawn like a kolam: places are the dot grid, a plan is the one line drawn through them.
Metaphor:    The rice-flour kolam drawn on Chennai doorsteps each morning: a grid of dots (pulli) and a continuous line around chosen dots.
Signature:   "How it works": scrolling turns a field of 3,000 dots into 40, then 12, then one line drawn through the final stops and home (pinned, scrubbed).
Emotion:     Calm, precise, local. A system you can trust.
Motion verb: "Drawn in one stroke": things appear as lines being drawn and dots settling, never bouncing.
Screenshot:  The dark doorstep with one turmeric line threading three dots, the plan and its times beside it.
```

Concepts considered:

| | Idea | Anchor | Signature | O / F / Fe / P |
|---|---|---|---|---|
| A. Kolam (picked) | Places are dots, a plan is the line through them | Chennai's doorstep kolam; route-solving is literally a line through chosen dots | Scroll-drawn line through the surviving dots | 5 / 5 / 4 / 1 |
| B. MTC route board | Each section is a bus stop | Chennai buses | A bus moves along the stops | 3 / 3 / 5 / 3 |
| C. Tiffin carrier | Each layer is a tier | The "tiffin" context packet | Tiers unstack | 3 / 3 / 4 / 3 |

The founder saw all three as a preview and chose A.

## Art direction

**Palette** (Ink + marigold, chosen 15 Nov 2026 after "too poppy" and "too dull" rounds)

| Role | Hex | Note |
|---|---|---|
| ground (reading) | `#FFFFFF` | white page, `#F4F4F2` sand for the rail |
| doorstep (films, hero) | `#0B0B0B` | near-black stage where the kolam is drawn |
| ink | `#0B0B0B` | |
| rice (ink on doorstep) | `#FFFFFF` | |
| muted | `#5C5C5C` (on white, AA) / `#A8A8A8` (on black, AA) | |
| accent: marigold | `#F2A900` (fills, on dark) / `#9A6A00` (text on light) | AI work, chosen stops, play button |
| kumkum red | `#E5484D` (light) / `#FF6B6E` (on dark) | fences and "no" |
| code blue | `#2F5BEA` (light) / `#7C9BFF` (on dark) | code work and magnets |

The warm off-white ground is paired with a grotesk and no terracotta, so it avoids the "cream + serif + terracotta" default.

**Type.** Host Grotesk (400, 500, 700, 800) for everything. Display sizes use tracking of -0.045em and leading of 0.9. Martian Mono for labels, numbers and status chips only, not every label. Body text 17 to 18 px with 1.55 leading and a measure of about 64ch.

**Grid.** 12 columns with a fluid gutter. A left rail on desktop holds the section index. Reading text hangs from column 4. Chapter labels sit in columns 1 to 3. Phones get a single column and a menu overlay.

**Shape.** One radius rule: 10 px for cards and films, 99 px for chips.

**Motion.** One clock (the GSAP ticker drives Lenis, ScrollTrigger and the films). Ease `expo.out`. Reveals are line masks on headings and a single "settle" on blocks. The page transition is a doorstep panel wiping up with a line drawing across it. No loader: a PRD doesn't earn one.

**Idle state.** On doorstep sections, the dot field breathes slightly (radius ±6%, slow) while the pointer is still. It's off under reduced motion.

**Hover.** Nav and primary links: the inner label slides up and is replaced by a copy (a letter roll). Inline links keep their underline, which draws in turmeric. Film buttons fill with turmeric.

## Composition

- **Home:** poster hero on the doorstep (statement plus kolam), then a statement band, an asymmetric pair (problem and answer), and a running example chat.
- **Goals:** data and facts layout (goals, non-goals, success signals with targets).
- **How it works:** a sticky narrative. The stage is pinned on one side while the chapters scroll on the other.
- **Algorithm page:** chapter label, plain explanation, a film on the doorstep, a worked example, an "engineers' note" disclosure and a status line.
- **Footer:** previous and next section, and the site map.
