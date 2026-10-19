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
  var searchForm   = document.getElementById('atlas-search');
  var searchInput  = document.getElementById('atlas-search-input');
  var searchClear  = document.getElementById('atlas-search-clear');
  var searchStatus = document.getElementById('atlas-search-status');

  if (typeof books === 'undefined' || !Array.isArray(books)) {
    grid.innerHTML = '<p class="grid-message">The reading list didn’t load. Try refreshing — if it keeps happening, books.js is missing or has a syntax error.</p>';
    return;
  }

  var currentTag = null;
  var queryText = '';     // what the visitor typed
  var queryTerms = [];    // folded words; every one must match
  var openCountry = null; // country shown in the detail panel

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
  function setUrlParam(key, val){
    if (!window.history || !history.replaceState) return;
    var url = new URL(location.href);
    if (val) url.searchParams.set(key, val); else url.searchParams.delete(key);
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
  function setUrlCountry(name){ setUrlParam('country', name); }

  /* ── search ──
     Matches country, book titles, authors, poem titles, poet names and tags.
     Accent- and punctuation-insensitive: "ngugi" finds Ngũgĩ, "thiongo" finds Thiong'o,
     "sao tome" finds São Tomé. Several words narrow the results (all must match). */
  var DIACRITICS = /[\u0300-\u036f]/g;
  function foldChar(ch){
    if (/['\u2018\u2019`.]/.test(ch)) return '';
    if (/[-\u2010-\u2015_\/]/.test(ch)) return ' ';
    var f = ch.normalize ? ch.normalize('NFD').replace(DIACRITICS, '') : ch;
    return f.toLowerCase();
  }
  // Folded text plus, for each folded character, the index of the original character it came from.
  function foldMap(s){
    s = String(s == null ? '' : s);
    var text = '', map = [];
    for (var i = 0; i < s.length; i++){
      var f = foldChar(s[i]);
      for (var k = 0; k < f.length; k++){ text += f[k]; map.push(i); }
    }
    return {text: text, map: map};
  }
  function fold(s){ return foldMap(s).text; }

  function searchFields(b){
    var f = [b.country];
    if (b.books) b.books.forEach(function(x){ f.push(x.title, x.author); });
    else if (hasBook(b)) f.push(b.book, b.author);
    if (b.poem) f.push(b.poem.title, b.poem.author);
    if (b.tags) f = f.concat(b.tags);
    return f;
  }
  var searchIndex = {};
  books.forEach(function(b){ searchIndex[b.country] = ' ' + fold(searchFields(b).join(' | ')) + ' '; });

  function matchesQuery(b){
    if (!queryTerms.length) return true;
    var hay = searchIndex[b.country] || '';
    for (var i = 0; i < queryTerms.length; i++) if (hay.indexOf(queryTerms[i]) === -1) return false;
    return true;
  }
  function setQuery(text){
    queryText = String(text || '');
    queryTerms = fold(queryText).split(/\s+/).filter(Boolean);
  }

  // Escaped text with search matches wrapped in <mark>. Single letters aren't highlighted.
  function hl(s){
    s = String(s == null ? '' : s);
    var terms = queryTerms.filter(function(t){ return t.length > 1; });
    if (!terms.length || !s) return esc(s);
    var fm = foldMap(s), on = [], i;
    terms.forEach(function(t){
      var from = 0, pos;
      while ((pos = fm.text.indexOf(t, from)) !== -1){
        for (var j = pos; j < pos + t.length; j++) on[fm.map[j]] = true;
        from = pos + 1;
      }
    });
    // Bridge ignored characters (the apostrophe in Thiong'o) inside a highlighted run.
    for (i = 1; i < s.length - 1; i++) if (!on[i] && on[i-1] && on[i+1] && foldChar(s[i]) === '') on[i] = true;
    var out = '', run = '', runOn = false;
    for (i = 0; i <= s.length; i++){
      var cur = i < s.length ? !!on[i] : !runOn;
      if (i === s.length || cur !== runOn){
        if (run) out += runOn ? '<mark>' + esc(run) + '</mark>' : esc(run);
        run = ''; runOn = cur;
      }
      if (i < s.length) run += s[i];
    }
    return out;
  }

  /* ── stats ── */
  function updateStats(){
    var read = books.filter(function(b){return b.reviewed;}).length;
    document.getElementById('stat-reviewed').textContent = read;
    document.getElementById('stat-remaining').textContent = TOTAL_COUNTRIES - read;
    document.getElementById('stat-total').textContent = TOTAL_COUNTRIES;
    var fill = document.querySelector('.progress-fill');
    if (fill) fill.style.width = (read / TOTAL_COUNTRIES * 100).toFixed(1) + '%';
  }

  /* ── grid ── */
  var BADGES = {
    pending:  '<span class="ccard-badge badge-reviewed">Read</span>',
    reviewed: '<span class="ccard-badge badge-reviewed">Reviewed</span>',
    poem:     '<span class="ccard-badge badge-poem">Poem</span>',
    future:   '<span class="ccard-badge badge-future">Future</span>'
  };

  function filtered(region){
    var list = region === 'all' ? books : books.filter(function(b){return b.region === region;});
    if (currentTag) list = list.filter(function(b){return b.tags && b.tags.indexOf(currentTag) !== -1;});
    return list.filter(matchesQuery);
  }

  function updateSearchStatus(region, n){
    searchClear.hidden = !queryText;
    if (!queryTerms.length){ searchStatus.textContent = ''; return; }
    var where = region !== 'all' ? ' in ' + (REGION_NAMES[region] || region) : '';
    if (currentTag) where += ' tagged “' + currentTag + '”';
    searchStatus.textContent = n
      ? n + (n === 1 ? ' country matches' : ' countries match') + ' “' + queryText.trim() + '”' + where
      : 'No matches for “' + queryText.trim() + '”' + where;
  }

  function renderGrid(region){
    var list = filtered(region);
    updateSearchStatus(region, list.length);
    if (openCountry && panel.classList.contains('visible') &&
        !list.some(function(b){ return b.country === openCountry; })) closeDetail();
    if (!list.length){
      var msg = 'No countries match this filter.';
      if (queryTerms.length){
        msg = 'Nothing in the atlas matches “' + esc(queryText.trim()) + '”. Try a surname, a single title word, or the country name.';
        if (region !== 'all' || currentTag){
          var saved = currentTag; currentTag = null;
          var elsewhere = filtered('all').length;
          currentTag = saved;
          if (elsewhere) msg = 'No matches here. <button type="button" class="grid-message-btn" data-action="widen-search">Show ' +
            elsewhere + (elsewhere === 1 ? ' match' : ' matches') + ' across all regions</button>';
        }
      }
      grid.innerHTML = '<p class="grid-message">' + msg + '</p>';
      return;
    }
    grid.innerHTML = list.map(function(b){
      var st = status(b);
      var cls = (b.reviewed || b.poem) ? ' has-content r-' + b.region : '';
      var cb = cardBook(b);
      var count = cb.count > 1 ? '<span class="ccard-count">' + cb.count + ' books</span>' : '';
      var bookLine = hasBook(b)
        ? '<div class="ccard-book">' + hl(cb.title) + '</div><div class="ccard-author">' + hl(cb.author) + '</div>'
        : '<div class="ccard-author ccard-unread">Not yet chosen</div>';
      var poem = b.poem
        ? '<div class="ccard-divider"></div><div class="ccard-poem-label">Poem</div>' +
          '<div class="ccard-poem-title">' + hl(b.poem.title) + '</div>' +
          '<div class="ccard-poem-author">' + hl(b.poem.author) + '</div>' +
          '<div class="ccard-poem-clip">' + esc(b.poem.clip) + '</div>'
        : '';
      return '<div class="ccard' + cls + '" role="button" tabindex="0" data-country="' + esc(b.country) + '" aria-label="' + esc(b.country) + ' — open details">' +
        '<div class="ccard-top"><span class="ccard-country">' + hl(b.country) + count + '</span>' + BADGES[st] + '</div>' +
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
    openCountry = b.country;
    setUrlCountry(b.country);
    panel.scrollIntoView({behavior:'smooth', block:'nearest'});
  }

  function closeDetail(){
    panel.classList.remove('visible');
    openCountry = null;
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
    if (queryText){ searchInput.value = ''; setQuery(''); setUrlParam('q', null); }
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
    if (e.target.closest('[data-action="widen-search"]')){
      currentTag = null;
      updateTagBar();
      selectRegion(tabs.querySelector('[data-region="all"]'));
      return;
    }
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
  function selectRegion(btn){
    tabs.querySelectorAll('.tab-btn').forEach(function(x){
      x.classList.remove('active');
      x.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    closeDetail();
    renderGrid(btn.dataset.region);
  }
  tabs.addEventListener('click', function(e){
    var btn = e.target.closest('.tab-btn');
    if (btn) selectRegion(btn);
  });

  function runSearch(text){
    setQuery(text);
    setUrlParam('q', queryText.trim() || null);
    renderGrid(activeRegion());
  }
  searchInput.addEventListener('input', function(){ runSearch(searchInput.value); });
  searchInput.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && searchInput.value){
      e.preventDefault();
      e.stopPropagation();
      searchInput.value = '';
      runSearch('');
    } else if (e.key === 'Enter'){
      e.preventDefault();
      var list = filtered(activeRegion());
      if (list.length === 1) showDetail(list[0].country);
      if (list.length) searchInput.blur(); // closes the phone keyboard so results are visible
    }
  });
  searchForm.addEventListener('submit', function(e){ e.preventDefault(); });
  searchClear.addEventListener('click', function(){
    searchInput.value = '';
    runSearch('');
    searchInput.focus();
  });

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && panel.classList.contains('visible')) closeDetail();
    // "/" jumps to the search box, as on most sites, unless the visitor is typing somewhere.
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey){
      var t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
      var fb = document.getElementById('ba-fb-overlay');
      if (fb && fb.classList.contains('fb-on')) return;
      e.preventDefault();
      searchInput.focus();
      searchInput.scrollIntoView({behavior:'smooth', block:'center'});
    }
  });

  /* ── boot ── */
  // ?q=okri pre-fills the search, so a search can be shared as a link.
  var q0 = new URLSearchParams(location.search).get('q');
  if (q0){ searchInput.value = q0; setQuery(q0); }
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
