# The Mopane story format

Stories can be written as normal Markdown files and batch-imported in `admin.html`.

```markdown
---
title: The headline readers will see
slug: unique-lowercase-story-name
dek: A one or two sentence summary.
country: Kenya
city: Nairobi
section: Technology
author: Writer Name
published_at: 2026-07-13T14:30:00Z
status: draft
featured_rank:
---

Write the full first paragraph here. Paragraphs can be as long as needed.

Leave a blank line between paragraphs. There is no practical short-story limit.

## Optional subheading

Continue the article here.
```

- `slug` must be unique and use lowercase letters, numbers, and hyphens.
- `status` is `draft` or `published`.
- `featured_rank` can be blank, or a number from 1 upward. Lower numbers appear first.
- Select many `.md` files at once in the admin panel to batch-import them.
- Drafts are invisible to readers. Published stories remain permanently available in the archive even after newer work replaces them on the homepage.
