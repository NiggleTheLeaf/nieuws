# Publishing stories at The Mopane

## Recommended: the live newsroom

Set up the authenticated CMS once using `CMS-SETUP.md`. After that, open `admin.html` to write full-length stories, batch-import Markdown, set publication times, reorder the front page, review traffic and answer support tickets. Publishing through the admin panel updates the live site without editing `stories-data.js` or redeploying GitHub Pages.

`stories-data.js` now acts as an offline fallback and seed archive. Do not edit it by hand.

## Add one or many stories

1. Copy `content/story-template.json` once per new article.
2. Give every story a unique lowercase `id` and matching filename, such as `new-trade-agreement.json`.
3. Review every fact, quotation, date, name, and source.
4. Set `status` to `published` only when the article is approved.
5. Add the files under `content/stories/` in the GitHub repository.
6. Commit or upload the changes.

The `Build story catalogue` GitHub Action validates the files, sorts them by `published`, regenerates `stories-data.js`, and commits the catalogue. GitHub Pages then republishes the site.

The homepage displays the newest 12 stories. Older stories remain available through `archive.html` and their existing `story.html?id=...` URLs.

## Use the newsroom assistant

In Codex, invoke `$the-mopane-newsroom` and provide notes, documents, or source URLs. For example:

> Use $the-mopane-newsroom to draft four separate stories from these source links. Save them as review drafts and list any sourcing gaps.

The assistant saves unapproved work as drafts, validates its structure, and waits for explicit approval before preparing files for `content/stories/`.

## If the GitHub Action cannot commit

In the repository, open **Settings → Actions → General → Workflow permissions**, choose **Read and write permissions**, and save. Then rerun the failed workflow.
