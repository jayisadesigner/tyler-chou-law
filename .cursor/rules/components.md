---
description: How to author and modify Bookshop components for the Tyler Chou Law site
globs: component-library/**/*
alwaysApply: false
---

# Bookshop Components

A Bookshop component is the unit of UI in this site. Every reusable section — heroes, content blocks, grids, FAQs, CTAs — is a component. Pages are built by listing component names + their props in markdown frontmatter.

## Anatomy

Every component lives at `component-library/components/<name>/` and ships **two files**:

| File | Purpose |
|---|---|
| `<name>.bookshop.yml` | CloudCannon schema — defines editable fields that show up in the visual editor |
| `<name>.eleventy.liquid` | Liquid template that renders the component to HTML |

## Liquid template — required pattern

Every `.eleventy.liquid` template starts with this idiom:

```liquid
{% assign x = block | default: include %}
```

This handles both invocation paths:
- `{% bookshop "name" block: block %}` from the page layout passes a `block` variable
- `{% include %}` calls pass `include`

After that, every prop is `x.headline`, `x.body`, `x.cta`, etc.

Use a **2-letter alias** matching the component (`hero` → `h`, `content-section` → `cs`, `featured-image` → `fi`) so templates stay scannable.

```liquid
{% assign cs = block | default: include %}
<section class="content-section{% if cs.variant %} content-section--{{ cs.variant }}{% endif %}">
  {% if cs.headline %}
    <h2 class="content-section__headline">{{ cs.headline }}</h2>
  {% endif %}
  ...
</section>
```

## Schema (`.bookshop.yml`) — required fields

```yaml
label: "Human-readable component name"
description: "One-sentence explanation that shows up in the CloudCannon picker."
icon: "<material-symbol-name>"     # e.g. wysiwyg, image, format_quote, ondemand_video
spec:
  structures:
    - content_blocks                # so it appears in the page-builder picker
preview: |
  ## {{ headline }}                 # what the editor sees in the canvas

props:
  headline:
    type: string
    label: Headline
    required: true                  # mark required fields
  body:
    type: array                     # arrays of structured items
    options:
      structures:
        values:
          - label: Paragraph
            value: ""
            fields:
              text: { type: textarea, label: "Paragraph" }
```

## Hard rules

1. **Every image input has a paired alt-text input, and the alt input is `required: true`.** No exceptions. The audit found weak alt text site-wide; the schema is the gate.
2. **Don't hardcode brand strings, contact info, or social URLs.** If the component needs them, accept them as props OR pull from `site.*` global data. Never paste "Tyler Chou Law For Creators" into a Liquid template.
3. **Components are presentational.** They don't fetch data, they don't compute business logic. Data preparation goes in `src/_data/*.js` and is exposed as global data.
4. **CSS for a component lives in `src/styles/components/`** using BEM (`.component-name__element--modifier`). Don't add styles inline to `.eleventy.liquid`.
5. **One component, one job.** If a component has more than ~8 top-level props or three layout variants, split it.
6. **Add an `icon:` and a `preview:`** — Tyler's team picks components from the visual editor; they need both to be useful.
7. **Test in the dev server before declaring done.** `npm run dev`, place the component on a test page, confirm both rendered HTML and the CloudCannon-style preview.

## Adding a new component

1. Create `component-library/components/<name>/<name>.bookshop.yml` and `<name>.eleventy.liquid`
2. Use the component on a real page in `src/content/pages/<page>.md` via `_bookshop_name: <name>`
3. Add CSS in `src/styles/components/<name>.css` and `@import` it from `src/styles/main.css`
4. Verify in `npm run dev`
5. If the component renders a list (testimonials, roster, videos), wire the data source into `src/_data/<name>.js` rather than passing the list inline

## Existing components — reference

The component library covers: `hero`, `content-section`, `content-split`, `featured-image`, `intro`, `philosophy`, `capabilities`, `services-grid`, `roster-grid`, `roster-lists`, `logo-grid`, `testimonials`, `youtube-grid`, `press-grid`, `speaking-grid`, `blog-listing`, `mouse-trail-cta`, `cta`, `contact-form`, `thank-you-panel`, `faq`. Reach for one of these before building new — most page sections are expressible as some combination of `hero` + `content-split` + `capabilities` + `cta`.
