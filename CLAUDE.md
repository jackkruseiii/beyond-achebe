# Working on Beyond Achebe

Static site for beyondachebe.com, served by GitHub Pages from `main`. Read `README.md` for structure and the `books.js` field reference.

## Session start (every new thread)

1. Read this file only. Don't re-read `README.md`, `index.html`, or the CSS/JS unless the task touches them. Read the last 5 lines of `docs/log.md` if you need recent context.
2. Classify the task and say in ONE line: "This looks like a [type] task. I recommend [model] at [effort] level. Confirm or switch?" Skip if Jack already named a model and effort. If he is on a heavier model than the task needs, say so. Don't start until he confirms, unless the task is trivial and the current setup obviously fits.

| Task | Model | Effort |
|---|---|---|
| Add or update one country from a blog URL; fix a typo or fact; run the validator and push | lightweight | low |
| Draft or tighten copy, check poem clips or quotes, update several countries at once | mid | medium |
| Audits, structural or layout changes, scripts or CI, data-model changes (e.g. `books:[]`), planning the book | top | high |

If a task outgrows its category (a quick edit turns into a redesign), stop and tell Jack before continuing.

## Token discipline

- Never print all of `books.js`. Search for the one country entry, edit just that entry, run `node scripts/validate.js`, show only the result.
- Don't re-summarize files or prior work. Report what changed in 1-3 lines with the commit or PR, and add a line to `docs/log.md`.
- Ask only for what's missing (usually a blog URL or a decision). Otherwise make the most reasonable call and flag it.
- Batch related updates into one pass and one commit.

## Thread hygiene

- One task per thread. When it's pushed, say "Done. Start a new thread for the next task."
- Past roughly 15-20 turns, or when the task type changes, stop and recommend a fresh thread with a handoff block under 120 words: what's done, what's open, commit hash, first step next time.
- Open items live in `docs/open-decisions.md`. Check it instead of asking Jack to re-explain, and tick items off when resolved.

## Non-negotiables

1. **Review text is Jack's own words, verbatim.** `summary` fields are copied exactly from his blog posts (fuuo.blogspot.com, kruzoo.blogspot.com). Never paraphrase, condense, "tidy", or write a summary yourself — not even a placeholder. If the review isn't written yet, use `reviewed:true, pendingReview:true, summary:"Review pending."`. If you can't fetch the post, ask Jack to paste the text.
2. Quotes must come from the post or the book. Never invent or reconstruct a quote or a poem clip. If unsure of a clip's exact wording, leave it and say so.
3. Fix facts freely (author spelling, dates, wrong links) but say what you changed. Editorial choices — which book represents a country, regions, ratings — are Jack's; propose, don't impose.
4. Exactly 54 countries, one object each. Don't rename `country` values casually: `?country=` deep links (used by Dad's Bookshelf) match them exactly.

## Routine update (new review → site)

1. Clone/pull the repo. Edit only `books.js` unless asked otherwise. Make a targeted edit to the one country entry; don't regenerate the file.
2. Fetch the blog post; copy the review paragraph(s) and quotes exactly.
3. Run `node scripts/validate.js`. Errors must be zero. Mention any new warnings.
4. If you changed `index.html` or `assets/`, serve the folder (`python3 -m http.server`) and check the page in a headless browser at desktop and 390px widths — no console errors, no horizontal scroll.
5. Commit with a plain message ("Add Niger: <Title> review"). Push to `main` when Jack says ship it; otherwise open a pull request. If this session can't push, give Jack the single changed file (`books.js`) to upload, and remind him the file name must be exactly `books.js`.

## Conventions

- No frameworks or build step. Plain JS (ES2017 is fine), no dependencies.
- All rendering goes through `esc()` in `assets/atlas.js`; data is never inserted as raw HTML.
- Colours and fonts live as CSS variables at the top of `assets/site.css`.
- Keep `books.js`, `CNAME`, and `index.html` at the repo root.
- Audit reports live in `docs/`; the live checklist of open decisions is `docs/open-decisions.md`. Check it before suggesting changes Jack has already been asked about.
- Push to `main` only for routine `books.js` edits that pass validation. Anything structural goes through a pull request.
