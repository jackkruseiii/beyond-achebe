/* Beyond Achebe — atlas rendering.
   Reads the global `books` array from /books.js (loaded first in index.html).
   Content lives in books.js; this file should rarely need to change. */
(function(){
  'use strict';

  var TOTAL_COUNTRIES = 54;
  var REGION_NAMES = {maghreb:'North Africa & Maghreb',west:'West Africa',east:'East Africa',horn:'Horn of Africa',central:'Central Africa',southern:'Southern Africa'};

  var grid  = document.getElementById('country-grid');
  var panel = document.getElementById('detail-panel');
  var tabs  = document.getElementById('region-tabs');
  var tagBar = document.getElementById('tag-filter-bar');

  if (typeof books === 'undefined' || !Array.isArray(books)) {
    grid.innerHTML = '<p class="grid-message">The reading list didn’t load. Try refreshing — if it keeps happening, books.js is missing or has a syntax error.</p>';
    return;
  }

  var currentTag = null;

  /* ── helpers ── */
  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function hasBook(b){
    if (b.books && b.books.length) return true;
    return !!(b.book && b.book !== 'Future read');
  }
  function status(b){
    if (b.reviewed && b.pendingReview) return 'pending';
    if (b.reviewed) return 'reviewed';
    if (b.poem) return 'poem';
    return 'future';
  }
  function cardBook(b){
    if (b.books) return {
      title: b.books.map(function(x){return x.title;}).join(' · '),
      author: b.books.map(function(x){return x.author.split(' ').pop();}).join(' · '),
      count: b.books.length
    };
    return {title: b.book || '', author: b.author || '', count: 1};
  }
  function findCountry(name){
    for (var i = 0; i < books.length; i++) if (books[i].country === name) return books[i];
    return null;
  }
  function activeRegion(){
    var btn = tabs.querySelector('.tab-btn.active');
    return btn ? btn.dataset.region : 'all';
  }
  function setUrlCountry(name){
    if (!window.history || !history.replaceState) return;
    var url = new URL(location.href);
    if (name) url.searchParams.set('country', name); else url.searchParams.delete('country');
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }

  /* ── stats ── */
  function updateStats(){
    var read = books.filter(function(b){return b.reviewed;}).length;
    var pending = books.filter(function(b){return b.reviewed && b.pendingReview;}).length;
    document.getElementById('stat-reviewed').textContent = read;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-remaining').textContent = TOTAL_COUNTRIES - read;
    document.getElementById('stat-total').textContent = TOTAL_COUNTRIES;
    var fill = document.querySelector('.progress-fill');
    if (fill) fill.style.width = (read / TOTAL_COUNTRIES * 100).toFixed(1) + '%';
  }

  /* ── grid ── */
  var BADGES = {
    pending:  '<span class="ccard-badge badge-pending-review">Review pending</span>',
    reviewed: '<span class="ccard-badge badge-reviewed">Reviewed</span>',
    poem:     '<span class="ccard-badge badge-poem">Poem</span>',
    future:   '<span class="ccard-badge badge-future">Future</span>'
  };

  function renderGrid(region){
    var list = region === 'all' ? books : books.filter(function(b){return b.region === region;});
    if (currentTag) list = list.filter(function(b){return b.tags && b.tags.indexOf(currentTag) !== -1;});
    if (!list.length){
      grid.innerHTML = '<p class="grid-message">No countries match this filter.</p>';
      return;
    }
    grid.innerHTML = list.map(function(b){
      var st = status(b);
      var cls = (b.reviewed || b.poem) ? ' has-content r-' + b.region : '';
      var cb = cardBook(b);
      var count = cb.count > 1 ? '<span class="ccard-count">' + cb.count + ' books</span>' : '';
      var bookLine = hasBook(b)
        ? '<div class="ccard-book">' + esc(cb.title) + '</div><div class="ccard-author">' + esc(cb.author) + '</div>'
        : '<div class="ccard-author ccard-unread">Not yet chosen</div>';
      var poem = b.poem
        ? '<div class="ccard-divider"></div><div class="ccard-poem-label">Poem</div>' +
          '<div class="ccard-poem-title">' + esc(b.poem.title) + '</div>' +
          '<div class="ccard-poem-author">' + esc(b.poem.author) + '</div>' +
          '<div class="ccard-poem-clip">' + esc(b.poem.clip) + '</div>'
        : '';
      return '<div class="ccard' + cls + '" role="button" tabindex="0" data-country="' + esc(b.country) + '" aria-label="' + esc(b.country) + ' — open details">' +
        '<div class="ccard-top"><span class="ccard-country">' + esc(b.country) + count + '</span>' + BADGES[st] + '</div>' +
        bookLine + poem + '</div>';
    }).join('');
  }

  /* ── detail panel ── */
  function quotesHtml(quotes, cls){
    if (!quotes || !quotes.length) return '';
    return quotes.map(function(q){return '<div class="' + cls + '">“' + esc(q) + '”</div>';}).join('');
  }

  function showDetail(name){
    var b = findCountry(name);
    if (!b) return;

    var title = b.reviewed
      ? (b.books ? b.books.length + ' books reviewed' : (b.book || ''))
      : (hasBook(b) ? 'On the list: ' + (b.book || '') : 'Not yet chosen');

    var h = '<div class="detail-top"><div>' +
      '<div class="detail-eyebrow">' + esc(REGION_NAMES[b.region] || b.region) + ' · ' + esc(b.country) + '</div>' +
      '<h3 class="detail-title">' + esc(title) + '</h3>' +
      (!b.books && b.author ? '<div class="detail-author">' + esc(b.author) + '</div>' : '') +
      '</div><button type="button" class="detail-close" data-action="close">✕ Close</button></div>';

    if (b.tags && b.tags.length){
      h += '<div class="detail-tags">' + b.tags.map(function(t){
        return '<button type="button" class="detail-tag" data-tag="' + esc(t) + '">' + esc(t) + '</button>';
      }).join('') + '</div>';
    }

    if (!b.reviewed && !b.summary && !(b.books && b.books.length)){
      h += '<div class="detail-future">On the reading list — review coming.</div>';
    }

    if (b.books && b.books.length){
      h += '<div class="detail-section-label">Books reviewed</div><div class="detail-books">';
      b.books.forEach(function(bk){
        h += '<div class="detail-book-block">' +
          '<div class="detail-book-title">' + esc(bk.title) + '</div>' +
          '<div class="detail-book-author">' + esc(bk.author) + '</div>' +
          (bk.summary ? '<div class="detail-book-review">' + esc(bk.summary) + '</div>' : '') +
          (bk.quotes && bk.quotes.length ? '<div class="detail-book-quotes">' + quotesHtml(bk.quotes, 'detail-book-quote') + '</div>' : '') +
          (bk.link ? '<a href="' + esc(bk.link) + '" class="detail-book-link" target="_blank" rel="noopener">Read full review</a>' : '') +
          '</div>';
      });
      h += '</div>';
    } else {
      if (b.summary) h += '<div class="detail-section-label">Review</div><div class="detail-review">' + esc(b.summary) + '</div>';
      if (b.quotes && b.quotes.length) h += '<div class="detail-section-label">Key quotes</div>' + quotesHtml(b.quotes, 'detail-quote');
      if (b.link) h += '<a href="' + esc(b.link) + '" class="detail-link" target="_blank" rel="noopener">Read full review</a>';
    }

    if (b.poem){
      h += '<div class="detail-poem-coda">' +
        '<div class="detail-poem-coda-label">Poem</div>' +
        '<div class="detail-poem-coda-title">' + esc(b.poem.title) + '</div>' +
        '<div class="detail-poem-coda-author">' + esc(b.poem.author) + '</div>' +
        '<div class="detail-poem-coda-text">' + esc(b.poem.clip) + '</div>' +
        (b.poem.link ? '<a href="' + esc(b.poem.link) + '" class="detail-link" target="_blank" rel="noopener">Read full poem</a>' : '') +
        '</div>';
    }

    panel.innerHTML = h;
    panel.classList.add('visible');
    panel.setAttribute('aria-label', b.country);
    setUrlCountry(b.country);
    panel.scrollIntoView({behavior:'smooth', block:'nearest'});
  }

  function closeDetail(){
    panel.classList.remove('visible');
    setUrlCountry(null);
  }

  /* ── tag filter ── */
  function updateTagBar(){
    if (currentTag){
      tagBar.classList.add('visible');
      tagBar.innerHTML = 'Filtered by tag <span class="tag-filter-chip">' + esc(currentTag) +
        ' <button type="button" data-action="clear-tag" aria-label="Clear tag filter">✕</button></span>';
    } else {
      tagBar.classList.remove('visible');
      tagBar.innerHTML = '';
    }
  }
  function filterByTag(tag){
    currentTag = tag;
    closeDetail();
    updateTagBar();
    renderGrid(activeRegion());
    document.getElementById('atlas').scrollIntoView({behavior:'smooth', block:'start'});
  }
  function clearTag(){
    currentTag = null;
    updateTagBar();
    renderGrid(activeRegion());
  }

  /* ── events (delegated, so re-rendering never loses handlers) ── */
  grid.addEventListener('click', function(e){
    var card = e.target.closest('.ccard');
    if (card) showDetail(card.dataset.country);
  });
  grid.addEventListener('keydown', function(e){
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.closest('.ccard');
    if (!card) return;
    e.preventDefault();
    showDetail(card.dataset.country);
  });
  panel.addEventListener('click', function(e){
    var t = e.target.closest('[data-tag],[data-action]');
    if (!t) return;
    if (t.dataset.action === 'close') closeDetail();
    else if (t.dataset.tag) filterByTag(t.dataset.tag);
  });
  tagBar.addEventListener('click', function(e){
    if (e.target.closest('[data-action="clear-tag"]')) clearTag();
  });
  tabs.addEventListener('click', function(e){
    var btn = e.target.closest('.tab-btn');
    if (!btn) return;
    tabs.querySelectorAll('.tab-btn').forEach(function(x){
      x.classList.remove('active');
      x.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    closeDetail();
    renderGrid(btn.dataset.region);
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && panel.classList.contains('visible')) closeDetail();
  });

  /* ── boot ── */
  renderGrid('all');
  updateStats();
  // Deep link (used by Dad's Bookshelf): ?country=Nigeria opens that entry.
  var c = new URLSearchParams(location.search).get('country');
  if (c && findCountry(c)) showDetail(c);

  // Kept for any old inline handlers or external callers.
  window.showDetail = showDetail;
  window.closeDetail = closeDetail;
  window.filterByTag = filterByTag;
  window.clearTagFilter = clearTag;
})();
