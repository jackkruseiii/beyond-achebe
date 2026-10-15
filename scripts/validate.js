#!/usr/bin/env node
/* Beyond Achebe — books.js checker.
   Run from the repo root:   node scripts/validate.js
   Exit code 1 on ERRORS (the GitHub Action turns red). WARNINGS never fail the build. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FILE = path.join(__dirname, '..', 'books.js');
const REGIONS = ['maghreb', 'west', 'east', 'horn', 'central', 'southern'];
const TOTAL = 54;
const errors = [], warnings = [];
const err = m => errors.push(m), warn = m => warnings.push(m);

let books;
try {
  const ctx = {};
  vm.runInNewContext(fs.readFileSync(FILE, 'utf8') + '\n;this.books = books;', ctx, { filename: 'books.js' });
  books = ctx.books;
} catch (e) {
  console.error('ERROR  books.js does not load: ' + e.message);
  console.error('       Usually a missing comma, quote or bracket near the line above.');
  process.exit(1);
}
if (!Array.isArray(books)) { console.error('ERROR  books is not an array'); process.exit(1); }

const isUrl = s => /^https?:\/\//.test(s);
const seenCountry = new Set();
const quoteHome = new Map();
const linkHome = new Map();

function checkLink(link, where) {
  if (!link) return;
  if (!isUrl(link)) return err(`${where}: link is not a URL → ${link}`);
  if (link.startsWith('http://')) warn(`${where}: use https:// → ${link}`);
  if (/beyondachebe\.com\/\d{4}\//.test(link)) warn(`${where}: old blog path on beyondachebe.com — this 404s now that the domain points at GitHub Pages → ${link}`);
  if (/blogspot\.com\/\d{4}\/?$/.test(link)) warn(`${where}: links to a whole year's archive, not the review post → ${link}`);
}
function trackLink(link, owner) {
  if (!link || /reading-list/.test(link)) return; // roundup posts legitimately cover several books
  const prev = linkHome.get(link);
  if (prev && prev !== owner) warn(`same review link used for "${prev}" and "${owner}" — one of them probably needs its own post → ${link}`);
  else linkHome.set(link, owner);
}
function checkQuotes(quotes, owner, where) {
  if (quotes == null) return;
  if (!Array.isArray(quotes)) return err(`${where}: quotes must be a list`);
  quotes.forEach(q => {
    const prev = quoteHome.get(q);
    if (prev && prev !== owner) warn(`${where}: quote also appears under "${prev}" — check attribution: "${q.slice(0, 60)}…"`);
    else quoteHome.set(q, owner);
  });
}

books.forEach((b, i) => {
  const where = b && b.country ? b.country : `entry #${i + 1}`;
  if (!b || typeof b !== 'object') return err(`${where}: not an object`);
  if (!b.country) err(`${where}: missing country`);
  if (seenCountry.has(b.country)) err(`${where}: listed twice`);
  seenCountry.add(b.country);
  if (!REGIONS.includes(b.region)) err(`${where}: region "${b.region}" must be one of ${REGIONS.join(', ')}`);
  if (typeof b.reviewed !== 'boolean') err(`${where}: reviewed must be true or false`);
  if (b.pendingReview && !b.reviewed) err(`${where}: pendingReview:true needs reviewed:true`);
  if (b.tags && !Array.isArray(b.tags)) err(`${where}: tags must be a list`);

  if (b.books) {
    if (!Array.isArray(b.books) || !b.books.length) err(`${where}: books must be a non-empty list`);
    if (b.book || b.summary) warn(`${where}: has both books:[] and flat book/summary fields — the flat ones are ignored`);
    (b.books || []).forEach((bk, j) => {
      const w = `${where} › ${bk.title || 'book #' + (j + 1)}`;
      if (!bk.title) err(`${w}: missing title`);
      if (!bk.author) err(`${w}: missing author`);
      if (b.reviewed && !bk.summary) warn(`${w}: no review text yet`);
      checkQuotes(bk.quotes, bk.title, w);
      checkLink(bk.link, w);
      trackLink(bk.link, bk.title);
    });
  } else {
    if (b.book === 'Future read' && b.author) warn(`${where}: book is the "Future read" placeholder but an author is set`);
    if (b.reviewed && !b.pendingReview && !b.summary) err(`${where}: reviewed:true but no summary (set pendingReview:true while the review is unwritten)`);
    if (b.reviewed && !b.book) err(`${where}: reviewed:true but no book title`);
    if (b.reviewed && !b.pendingReview && !b.link) warn(`${where}: reviewed but no "Read full review" link`);
    if (b.pendingReview && b.summary && b.summary !== 'Review pending.') warn(`${where}: has review text but is still marked pendingReview`);
    checkQuotes(b.quotes, b.book, where);
    checkLink(b.link, where);
    if (b.book && b.book !== 'Future read') trackLink(b.link, b.book);
  }

  if (b.poem) {
    ['title', 'author', 'clip'].forEach(f => { if (!b.poem[f]) err(`${where} › poem: missing ${f}`); });
    checkLink(b.poem.link, `${where} › poem`);
  }
});

if (books.length !== TOTAL) err(`expected ${TOTAL} countries, found ${books.length}`);

const read = books.filter(b => b.reviewed).length;
const pending = books.filter(b => b.reviewed && b.pendingReview).length;
const poems = books.filter(b => b.poem).length;

warnings.forEach(w => console.log('warn   ' + w));
errors.forEach(e => console.log('ERROR  ' + e));
console.log(`\n${books.length} countries · ${read} read · ${pending} review pending · ${TOTAL - read} to go · ${poems} poems`);
console.log(errors.length ? `✗ ${errors.length} error(s) — fix before uploading` : `✓ books.js is valid${warnings.length ? ` (${warnings.length} warning(s) to tidy when convenient)` : ''}`);
process.exit(errors.length ? 1 : 0);
