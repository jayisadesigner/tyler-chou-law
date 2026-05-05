---
name: add-speaking-engagement
description: Adds a new speaking engagement (keynote, panel, conference, or workshop) to the /speaking/ page on the Tyler Chou Law site. Use when the user wants to add a speaking event, keynote, panel, conference appearance, or workshop (e.g. "Tyler is speaking at SXSW 2026", "add the VidCon panel", "she's keynoting 1 Billion Followers Summit").
---

# Add a speaking engagement

Speaking engagements live in `src/content/speaking/<slug>.md` as data-only files. They don't render their own pages — they appear on `/speaking/` via the `speaking-grid` Bookshop component.

## Workflow

1. **Pick a slug** based on event + year. Lowercase, hyphenated. Examples: `sxsw-2024`, `vidsummit-2025`, `1bff-dubai-2026`, `vidcon-2026`.
2. **Gather the required fields** (see template).
3. **Drop the event photo** at `src/assets/images/speaking/<slug>.jpg` (or pick from existing event imagery in `src/assets/images/about/` or `src/assets/logos/`). Use a real on-stage photo if available; an event logo as a fallback.
4. **Write `src/content/speaking/<slug>.md`** using the template.
5. **Verify** at `http://localhost:8080/speaking/`.

## Template

```markdown
---
event: "<Event Name>"
title: "<Talk or Panel Title>"
date: 2026-03-12
location: "<City, State/Country>"
image: /assets/images/speaking/<slug>.jpg
image_alt: "<Description — e.g. Tyler Chou speaking at <event> on <topic>>"
summary: "<1–2 sentences describing the talk and the audience.>"
---
```

## Field guidance

| Field | Notes |
|---|---|
| `event` | The conference / event name (e.g. "SXSW", "VidSummit"). |
| `title` | The talk's actual title or session name. |
| `date` | ISO format `YYYY-MM-DD`. Drives sort order. |
| `location` | "Austin, TX" or "Dubai, UAE" format. |
| `image` | Path under `/assets/`. Square or landscape, ~1200×800px. |
| `image_alt` | Required. Describe what's in the photo, who, where. |
| `summary` | Audience-facing description: what was covered, who attended. |

## Hard rules

- **Speaking entries are data, not pages.** Don't add `permalink:` or `layout:`.
- **Image alt text is required** and should follow the audit pattern: "Tyler Chou speaking at \<event\> on \<topic\>." or "Tyler Chou speaking on stage at \<event\>, \<location\>."
- **Trademark spelling**: `The Creators' Attorney`.
- The audit brief noted Tyler is sending event photos — until they arrive, use a placeholder logo from `/assets/logos/` (e.g. `/assets/logos/vidsummit-logo.png`) and leave a TODO comment so it's easy to swap in the real photo later.
