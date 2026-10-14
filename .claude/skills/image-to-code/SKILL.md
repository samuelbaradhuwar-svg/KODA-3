---
name: image-to-code
description: Turn a website screenshot, mockup or generated design image into faithful frontend code. Use when the user shares an image of a site/section to build, or wants a visually led page designed image-first.
---

# Image-to-Code: Design Image First, Then Build

_Adapted from image-to-code-skill by leonxlnx (github.com/Leonxlnx/taste-skill), MIT licence._

The image is the design source. The code is the translation layer. The goal is not "inspired by the image" — it is visually faithful to the image, translated into real frontend.

## 0. Pick the mode

- **Mode A — user supplied the image(s)** (screenshot, mockup, Figma export, competitor site, sketch): skip generation, go straight to deep analysis (Section 3), then build.
- **Mode B — no image, visually led request** (hero, landing page, portfolio, redesign, "make it premium") **and an image-generation tool is available** (e.g. a connected Figma, Canva or Floot image generator): generate reference image(s) first (Section 2), analyze, then build.
- **Mode C — no image and no generator:** write a short visual spec (Section 4 choices + section list + palette + type) as the reference, then build from it with the same discipline.
- Direct code without a reference is fine for bug fixes, structural work, or when the user already gave a precise design system.

Always state in one line which mode you're using.

## 1. Baseline dials (adapt to the prompt)

- DESIGN_VARIANCE 8 (1 rigid, 10 asymmetric/art-directed)
- VISUAL_DENSITY 3 (1 airy, 10 packed)
- ART_DIRECTION 8 (1 safe commercial, 10 bold statement)
- IMPLEMENTATION_CLARITY 9 (1 moodboard, 10 buildable spec)
- SPACING_GENEROSITY 9
- UI_SIMPLICITY_DISCIPLINE 9 (aggressively cut micro-clutter)

"Clean" → less density, more clarity. "Crazy creative" → more variance. "Premium SaaS" → clarity high, art direction controlled. "Editorial" → stronger type, more asymmetry.

## 2. Generating references (Mode B)

- **One large image per section.** 1 section → 1 image, 8 sections → 8 images. Never compress many sections into one board where text, buttons and spacing become unreadable.
- **Don't be lazy with image count.** Better too many clear images than too few compressed ones. Add a detail image (navbar, pricing cards, testimonials, CTA, type/spacing close-up) whenever something is too small to read.
- **Never crop old images** to get a section or detail — cropping destroys spacing, type scale and proportions. Generate a fresh standalone image of that section instead.
- **Regenerate unclear sections** as new images that keep the same palette, type mood, button style, radius logic, image treatment and brand world — just larger and cleaner.
- **Multi-image consistency:** every image must belong to the same website: same type scale, spacing discipline, CTA styling, icon mood, image treatment, component family.
- Every image must read as a real buildable section comp (layout, hierarchy, spacing, type scale, CTA priority, components), not abstract artwork.

## 3. Deep analysis (all modes) — treat the image as a spec

Do not glance; inspect systematically, section by section, and write the findings down before coding:

- **Text:** extract all readable copy — headline, subheadline, CTA labels, section titles, nav, pricing labels, feature names, testimonial names/roles. If too small, ask for / generate a closer image rather than guessing.
- **Typography:** size and weight relationships, serif vs sans, display vs body contrast, line count, line-height and tracking feel, wrapping, calm vs aggressive type. Name likely font matches.
- **Spacing:** headline→subheadline, text→buttons, card gaps, card padding, section top/bottom, side gutters, image→text, navbar spacing, overall cadence. Aim for faithful spacing logic, not pixel OCR — never collapse generous spacing into tight defaults.
- **Buttons & components:** size, shape, radius, fill vs outline, icons, primary/secondary hierarchy, card structure, badges, dividers, borders, shadows, inputs.
- **Color:** background, panels, accents, button fills, text hierarchy, borders, shadow mood, image grade, gradient intensity. Write them as hex values. Never swap a designed palette for generic defaults.
- **Layout:** grid logic, alignment, section order, density, image frames and aspect ratios, repeated motifs, visual rhythm.
- **Unclear:** list what's still ambiguous.

## 4. Visual direction (Mode B/C — commit to one coherent combination)

- **Theme:** pristine light / deep dark / bold studio solid / quiet premium neutral
- **Background:** subtle grid or dot field / solid with soft ambient depth / full-bleed cinematic imagery / tactile texture
- **Type:** clean grotesk / refined grotesk / expressive display / compressed statement / editorial serif + sans / Swiss rational
- **Hero:** cinematic centred minimal / asymmetric split / floating polaroid scatter / inline type behemoth / editorial offset / image-first with restrained text
- **Section system:** modular bento / alternating editorial blocks / poster-like stacked story / gallery-led / Swiss grid / asymmetric marketing flow
- **Exactly 4 signature components:** diagonal staggered masonry, 3D cascading card deck, hover-accordion slices, gapless bento, infinite brand marquee, turning polaroid arc, vertical rhythm lines, off-grid editorial layout, product UI panel stack, split testimonial quote wall, layered image crop frames
- **Exactly 2 motion cues:** scrubbing text reveal, pinned narrative section, staggered float-up, parallax image drift, smooth accordion expansion, cinematic fade-through

## 5. Hero rules

- One strong focal point, obvious hierarchy, lots of negative space.
- Headline short: 1 line ideal, 2 very good, 3 max. Cut words rather than add lines. Supporting text concise.
- No pills, fake stats, badges, tiny logos, or pseudo-system labels ("00 orchestration layer").
- First screen must read cleanly on a small laptop: clear headline, readable subtext, visible CTA, balanced visual — not the whole product crammed above the fold.

## 6. Structure rules

- **No box-in-box-in-box.** No giant rounded wrappers around every section, no cards inside cards inside cards. Fewer, stronger containers; open layouts; one framing move per section.
- **Cut micro-UI clutter:** filler chips, status pills, decorative code tags, fake dashboard/operator jargon, meaningless metadata rows. Use real hierarchy and type instead.
- **Images in controlled frames:** fixed aspect ratios, consistent radius, repeatable media modules, stable proportions across similar sections.
- **Vary section rhythm** (density, image/text ratio, alignment, scale, background intensity) while keeping the page coherent and spacing even.
- Default section packs — 4: hero, features, social proof, CTA. 8: hero, trust bar, features, product showcase, use cases, testimonials, pricing, CTA. 12: add feature grid, problem/solution, workflow, metrics/integrations, FAQ, footer.

## 7. Building — anti-drift

- Follow the reference closely: layout, spacing rhythm, section order, text/image balance, type mood, component style.
- Use the extracted copy and hex colors directly.
- Don't "improve" it into a template: no generic rows replacing distinctive sections, no denser spacing, no plainer type, no reintroduced nested boxes, no cloned left-text/right-image blocks the source didn't have.
- Resolve ambiguity in this order: preserve design language → layout/spacing logic → component family → polish level → get a closer image → only then pick the most faithful buildable option.
- Responsive: asymmetric desktop layouts collapse to a clean single column on mobile.

## 8. Anti-slop

- Layout: endless centred sections, identical card rows, giant unreadable collages, fake complexity.
- Visual: purple/blue AI gradients, glowing edges, floating blobs, stacked glassmorphism, noise hiding the layout.
- Type: giant heading + weak tiny subcopy, too many font moods, awkward breaks, all-caps everywhere, gradient headlines.
- Copy: "unleash", "elevate", "revolutionize", "next-gen", "seamless"; fake brands like Acme, Nexus, NovaCore.
- Density: over-packed sections, tiny gaps between major sections.

## 9. Final check

1. Was a reference used (supplied, generated, or written spec) before coding?
2. Was every image analyzed section by section, with copy, type, spacing, components and hex colors written down?
3. Were unclear areas resolved with closer/fresh images rather than guesses or crops?
4. Is the hero clean, short-headlined and readable on a small laptop?
5. Nested boxing and micro-clutter removed?
6. Does the coded result still look like the same website as the reference — not a generic reinterpretation?
7. Free of AI tells, and responsive?
