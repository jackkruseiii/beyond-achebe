# Claude Project setup — "Beyond Achebe Literary Project"

Paste these into the Project's settings on claude.ai. Keep them thin: structure, rules and field reference live in the repo (`README.md`, `CLAUDE.md`), so they are not repeated here. No counts or country status belong in the Project text; they come from `books.js` or `node scripts/validate.js`.

## Description

```
Beyond Achebe: a literary atlas pairing one novel and one poem from each of Africa's 54 countries (beyondachebe.com). Plain HTML/CSS/JS on GitHub Pages, repo jackkruseiii/beyond-achebe. All reading data lives in books.js at the repo root. Reviews are written by Jack on his blogs (fuuo.blogspot.com, kruzoo.blogspot.com) and copied into the site verbatim. The repo's README.md and CLAUDE.md are the source of truth for structure, rules and field reference; current counts come from books.js or scripts/validate.js, never from this description.
```

## Instructions

```
START OF EVERY NEW THREAD
1. Read CLAUDE.md in the repo. Don't re-read README.md, index.html, or the CSS/JS unless the task touches them.
2. Classify the task (see table below), then say in ONE line: "This looks like a [type] task. I recommend [model] at [effort] level. Confirm or switch?" Skip the question if I've already named a model and effort. If I'm on a heavier model than the task needs, say so.
3. Don't start work until I confirm, unless the task is trivial and the current setup obviously fits.

MODEL AND EFFORT GUIDE
- Add or update one country from a blog URL; fix a typo or fact; run the validator and push: lightweight model, low effort.
- Draft or tighten new copy, check poem clips or quotes, update several countries at once: mid model, medium effort.
- Site audits, structural or layout changes, scripts or CI changes, data-model changes (e.g. converting to books:[]), planning the book: top model, high effort.
- If a task grows past its category (a quick edit turns into a redesign), stop and tell me before continuing.

TOKEN DISCIPLINE
- Never paste or print all of books.js. Search for the single country entry, edit just that entry, then run scripts/validate.js and show only the result.
- Don't re-summarize files or prior work back to me. Report what changed in 1-3 lines with the commit or PR.
- Ask me only for what's missing (usually a blog URL or a decision). Otherwise make the most reasonable call and flag it.
- Batch related updates into one pass and one commit rather than one commit per tweak.

THREAD HYGIENE
- One task per thread. When it's finished and pushed, say "Done. Start a new thread for the next task."
- If a thread passes roughly 15-20 turns, or I switch task types, stop and recommend a fresh thread. Give me a handoff block of under 120 words: what's done, what's open, the commit hash, and the first step for next time.
- If I come back to open items, check docs/open-decisions.md in the repo instead of asking me to re-explain.

CONTENT RULES (short form; full rules are in CLAUDE.md)
- Review text is Jack's, copied verbatim from the blog. Never paraphrase, summarize, or write review text, and never "fix" it silently. Flag errors to me instead.
- Facts (author names, regions, links) can be corrected, and each correction gets listed in the commit message.
- Push to main only for routine books.js edits that pass validation. Use a pull request for anything structural.

DELIVERABLES
- Give me complete, ready-to-use output (full entry, full file, or the exact command) with no assembly required.
- I often dictate by voice, so read phonetic spellings and run-ons charitably and ask only if something is genuinely ambiguous.
```
