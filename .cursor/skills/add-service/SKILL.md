---
name: add-service
description: Adds a new service or service-detail page to the Tyler Chou Law site using the standard service-page block recipe (hero + content-split + capabilities + FAQ + CTA). Use when the user wants to create a new service page, service offering, or describe a new practice area (e.g. "add a Brand Deals service page", "create a service for trademark help", "publish the new IP cleanup offering").
---

# Add a service page

Service pages follow a consistent recipe that surfaces well in both Google and AI search: hero → narrative content-split → capabilities grid → FAQ block → closing CTA. The FAQ block automatically emits FAQPage JSON-LD.

## Workflow

1. **Pick a slug.** `/services/brand-deals/`, `/services/trademark/`, `/services/ip-cleanup/`. Or scope under `/creatorarq/` for M&A offerings.
2. **Gather the FAQ.** Tyler should provide 5–7 questions, phrased exactly as a creator would type them into Google or ChatGPT (e.g. "Do I need a trademark for my YouTube channel name?", not "Trademark Considerations").
3. **Write `src/content/pages/services/<slug>.md`** (or `src/content/pages/<slug>.md` if standalone) using the template below.
4. **Internal-link** to this new page from `/services/`, `/creatorarq/`, and any related blog posts.
5. **Verify** in `npm run dev`.

## Template

```markdown
---
layout: page.liquid
permalink: /services/<slug>/
pageClass: service
title: "<Service Name> | Tyler Chou Law For Creators"
description: "<140–155 char description that includes the trademark and primary keyword>"
ogImage: /assets/images/services/<image>.jpg
blocks:
  - _bookshop_name: hero
    variant: inner
    headline: "<Service Name>."
    subheadline: "<One sentence that names the problem this service solves.>"
    background:
      type: none

  - _bookshop_name: content-split
    layout: right
    headline: "<What this service is>"
    body:
      - text: "<Plain-English explanation of the offering.>"
      - text: "<Who it's for and what they get.>"
    media:
      type: image
      image: /assets/images/services/<image>.jpg
      image_alt: "<Description of what the image shows>"
    cta:
      label: "Schedule a Consultation"
      url: "https://calendly.com/tyler-thecreatorsattorney"
      external: true

  - _bookshop_name: capabilities
    aria_label: "What's included in <Service Name>"
    columns: 4
    items:
      - { title: "<Capability 1>", description: "<Short description>" }
      - { title: "<Capability 2>", description: "<Short description>" }
      - { title: "<Capability 3>", description: "<Short description>" }
      - { title: "<Capability 4>", description: "<Short description>" }

  - _bookshop_name: faq
    headline: "Common questions"
    intro: "The questions creators ask most often about <service name>."
    items:
      - question: "<Question phrased exactly as a creator would type it into Google>"
        answer: "<2–4 sentence answer in Tyler's voice.>"
      # 4–6 more items

  - _bookshop_name: mouse-trail-cta
    headline: "Ready to get started?"
    cta:
      label: "Schedule a Consultation"
      url: "https://calendly.com/tyler-thecreatorsattorney"
      external: true
---
```

## Hard rules

- **FAQ questions are the unit of AI visibility.** Each question is the exact phrasing a creator would type. Don't editorialize them into headings.
- **Internal-link** from this service to at least 2 sibling services and 1 blog post that mentions this offering.
- **Update `src/_data/nav.yml`** if the service should appear in the footer.
- **Add to `src/llms.txt.liquid`** indirectly via `src/_data/nav.yml` `llms:` section — this is what AI tools index.
- The FAQ component auto-emits FAQPage JSON-LD. Don't add JSON-LD by hand.
