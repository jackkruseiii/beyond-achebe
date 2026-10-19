# Beyond Achebe — A Literary Atlas of Africa

**Live:** https://beyondachebe.com

One novel and one poem from every country in Africa — 54 in all — telling the continent's history through its fiction. A reading project begun in 2016 by Jack Kruse, Navy Foreign Area Officer. The end goal is a book.

Reviews are written first on the blogs, then excerpted here **verbatim**:

- [fuuo.blogspot.com](https://fuuo.blogspot.com) — Africa / FAO blog
- [kruzoo.blogspot.com](https://kruzoo.blogspot.com) — general reading-list blog
- [Full list of reviews](https://fuuo.blogspot.com/p/after-looking-at-my-reading-lists-from.html)

---

## How the site is built

Plain HTML, CSS and JavaScript. No framework, no build step. GitHub Pages serves the `main` branch; changes are live about a minute after a commit.

```
books.js             ← THE READING LIST. Routine updates touch only this file.
index.html           page markup (header, about, atlas, footer, feedback form)
assets/
  site.css           all styling
  atlas.js           draws the cards, detail panel, filters, stats, ?country= links
  feedback.js        "Suggest a book" form (sends through Web3Forms)
  map.jpg            the future book cover / about-section map
404.html             friendly page for dead links
favicon.svg  robots.txt  sitemap.xml
CNAME                beyondachebe.com  (do not delete — it holds the custom domain)
scripts/validate.js  checks books.js for mistakes
.github/workflows/   runs the checker on every upload
docs/                audit reports and Claude Project setup text
CLAUDE.md            standing instructions for Claude when it works on this repo
```

`books.js` stays at the repo root on purpose: it keeps routine updates to one file, and any outside page that loads it keeps working.

## Updating the reading list

### Fastest: ask Claude in the "Beyond Achebe" Project
Paste the blog review URL and say which country. Claude clones this repo, edits `books.js`, runs the checker, and pushes the change (or opens a pull request if you'd rather review it first). See `CLAUDE.md`.

### By hand, in the GitHub website
1. Get the updated `books.js` (from Claude, or edit it here: open `books.js` → pencil icon).
2. If uploading: **Add file → Upload files**, drop in `books.js`. Make sure the file is named exactly `books.js` — not `books (1).js`.
3. Commit to `main`.
4. Watch the commit for a **green ✓** (the checker passed) or **red ✗** (click it to see the exact problem). The site deploys either way, so fix a red ✗ promptly.

### Checking locally (optional)
```
node scripts/validate.js        # errors fail; warnings are a to-do list
python3 -m http.server          # then open http://localhost:8000
```
Opening `index.html` by double-click also works — no server needed.

## books.js field reference

Each country is one object. There must be exactly **54**, each country once.

| Field | Meaning |
|---|---|
| `country` | Display name; also what `?country=` deep links match exactly |
| `region` | `maghreb` (shown as North Africa), `west`, `east`, `horn`, `central`, `southern` |
| `reviewed` | `true` = read; counts toward "Countries read" |
| `pendingReview` | `true` with `reviewed:true` = read, review not yet written (card shows a green **Read** badge) |
| `book`, `author` | Single-book countries. `"Future read"` with empty author = nothing chosen yet |
| `summary` | **Your review text, copied word for word from the blog.** Never paraphrased, never AI-written |
| `quotes` | List of quotes from the book |
| `link` | The blog post for the full review |
| `books` | Use instead of `book/author/summary/quotes/link` when a country has several books: `[{title, author, summary, quotes, link}]` |
| `tags` | Short themes; clicking one filters the atlas |
| `poem` | `null`, or `{title, author, clip, link}`. In `clip`, `\n` is a line break |

Card badges are computed: **Reviewed** (green), **Read** (green, review not yet written), **Poem** (blue — not read yet but a poem is chosen), **Future** (grey). The hero stats and progress bar count themselves.

### Templates

Single book, reviewed:
```js
{country:"Niger",region:"west",reviewed:true,book:"Title",author:"Author Name",tags:["theme","theme"],summary:"Exact review text from the blog.",quotes:["Quote one.","Quote two."],poem:null,link:"https://fuuo.blogspot.com/..."},
```
Read, review not written yet:
```js
{country:"Niger",region:"west",reviewed:true,pendingReview:true,book:"Title",author:"Author Name",tags:[],summary:"Review pending.",quotes:[],poem:null,link:""},
```
Turning a single-book country into a multi-book one: replace `book/author/summary/quotes/link` with
```js
books:[
  {title:"First",author:"Name",summary:"…",quotes:[],link:"…"},
  {title:"Second",author:"Name",summary:"…",quotes:[],link:"…"}
],
```

Watch the punctuation: every object ends with `},` (no comma after the very last one), and a `"` inside text must be written `\"` or swapped for `'`.

## Deep links

`https://beyondachebe.com/?country=Nigeria` opens Nigeria's entry. Dad's Bookshelf uses these. Opening any card also updates the address bar, so whatever you're looking at can be copied and shared.

## Hosting

- GitHub Pages, `main` branch, root folder.
- `beyondachebe.com` → four A records at Squarespace pointing to GitHub Pages; the `CNAME` file in this repo holds the domain.
- The "Suggest a book" form posts to Web3Forms (key in `assets/feedback.js`; it's meant to be public) and falls back to email.
