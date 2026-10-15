# Working on Beyond Achebe

Static site for beyondachebe.com, served by GitHub Pages from `main`. Read `README.md` for structure and the `books.js` field reference.

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
- Audit notes and open decisions live in `docs/`. Check the latest audit's "Open decisions" before suggesting changes Jack has already been asked about.
