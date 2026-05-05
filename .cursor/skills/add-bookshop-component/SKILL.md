---
name: add-bookshop-component
description: Creates a new reusable Bookshop component for the Tyler Chou Law site (a section type usable from any page via _bookshop_name). Use when the user wants to create a new component, section type, block, or reusable building block for pages (e.g. "build a new pricing-grid component", "add a quote-block component", "I want a new type of section that does X").
---

# Add a Bookshop component

A Bookshop component is the reusable unit of UI on this site. Pages compose them by listing `_bookshop_name: <name>` in frontmatter. Every component ships two files: a CloudCannon schema (`.bookshop.yml`) and a Liquid template (`.eleventy.liquid`).

**Reach for an existing component first.** The library covers most page sections: `hero`, `content-section`, `content-split`, `featured-image`, `intro`, `philosophy`, `capabilities`, `services-grid`, `client-grid`, `client-lists`, `logo-grid`, `testimonials`, `youtube-grid`, `press-grid`, `speaking-grid`, `blog-listing`, `mouse-trail-cta`, `cta`, `contact-form`, `thank-you-panel`, `faq`. Most "new section" requests are some combination of these.

## When to make a new component (vs reuse)

- You're duplicating the same markup across 2+ pages → make a component.
- You need editable structured fields (lists, image+alt pairs, CTAs) that change per page → make a component.
- You need the section to appear in the CloudCannon visual editor for Tyler's team → make a component.
- It's a one-off layout used on a single page → use raw markup in the page's content section instead.

## Workflow

1. **Pick a name.** Lowercase, hyphenated. Singular noun describing the section. Examples: `pricing-grid`, `quote-block`, `event-banner`.
2. **Create the directory** `component-library/components/<name>/`.
3. **Write the schema** `<name>.bookshop.yml` (see template).
4. **Write the template** `<name>.eleventy.liquid` (see template).
5. **Add CSS** at `src/styles/components/<name>.css` and `@import` it from `src/styles/main.css`.
6. **Use it** on a real page in `src/content/pages/<page>.md`.
7. **Verify** in `npm run dev`.

## Schema template (`<name>.bookshop.yml`)

```yaml
label: "<Human-readable component name>"
description: "<One sentence shown in the CloudCannon picker>"
icon: "<material-symbol>"        # e.g. wysiwyg, image, format_quote, list_alt, ondemand_video
spec:
  structures:
    - content_blocks
preview: |
  ## {{ headline }}

props:
  headline:
    type: string
    label: Headline
    required: true
  body:
    type: array
    label: Body paragraphs
    options:
      structures:
        values:
          - label: Paragraph
            value: ""
            fields:
              text: { type: textarea, label: "Paragraph" }
  image:
    type: image
    label: Image
  image_alt:
    type: string
    label: Alt text
    description: "Required when image is provided. Describes what the image shows."
    required: true
  cta:
    type: object
    label: CTA Button (optional)
    options:
      empty_type: object
    fields:
      label: { type: string, label: "Button label" }
      url: { type: url, label: "URL" }
      external: { type: boolean, label: "Opens in new tab", default: false }
```

## Liquid template (`<name>.eleventy.liquid`)

```liquid
{% assign x = block | default: include %}
<section class="<name>{% if x.variant %} <name>--{{ x.variant }}{% endif %} section section-reveal">
  <div class="container">
    {% if x.headline %}
      <h2 class="<name>__headline line-animate">{{ x.headline | line_animate }}</h2>
    {% endif %}

    {% if x.body and x.body.size > 0 %}
      <div class="<name>__body">
        {% for p in x.body %}<p>{{ p.text }}</p>{% endfor %}
      </div>
    {% endif %}

    {% if x.image %}
      <img class="<name>__image" src="{{ x.image }}" alt="{{ x.image_alt }}" loading="lazy" decoding="async" />
    {% endif %}

    {% if x.cta and x.cta.label and x.cta.url %}
      <a href="{{ x.cta.url }}" class="btn btn--secondary btn--on-dark btn--chuparosa"{% if x.cta.external %} target="_blank" rel="noopener noreferrer"{% endif %}>{{ x.cta.label }}</a>
    {% endif %}
  </div>
</section>
```

## CSS template (`src/styles/components/<name>.css`)

```css
.<name> {
  padding-block: var(--space-12) var(--space-12);
}

.<name>__headline {
  font-family: var(--font-display);
  font-size: var(--text-h2-size);
  color: var(--text-headline-color);
}

.<name>__body p {
  color: var(--text-body-color);
  margin-block: var(--space-3);
}
```

Then append `@import './components/<name>.css';` to `src/styles/main.css`.

## Hard rules

- **Every image input has a `required: true` alt-text companion.** No exceptions.
- **Don't hardcode brand strings or contact info.** Pass them as props or pull from `site.*` global data.
- **Use the `block | default: include` idiom** at the top of every template so it works whether invoked via `{% bookshop %}` or `{% include %}`.
- **CSS uses BEM** — `.component__element--modifier`. Use design tokens from `src/styles/variables.css`.
- **Add `icon:` and `preview:`** so Tyler's team can find the component in the visual editor.
- **One concern per component.** If it has more than ~8 top-level props or three layout variants, split it.

## Animations

- **Line reveals on headlines:** add `class="… line-animate"` and pipe the value through the `line_animate` Liquid filter (`{{ headline | line_animate }}`). The filter splits on `<br>` at build time and emits the per-line span structure. JS (`reveal.js`) flips a CSS class on enter; if JS fails, headlines render fully visible. Don't use the legacy `js-line-animation` attribute — it was removed in the GSAP refactor.
- **Section-level fade-up:** put `class="… section-reveal"` on the outer `<section>`. CSS owns the visible default; `reveal.js` adds `.is-pre-reveal` then `.is-revealed` via IntersectionObserver. Same fail-open contract.
- **Don't set `opacity: 0` from JS** for default-state content. Layout belongs to CSS; JS only enhances.
