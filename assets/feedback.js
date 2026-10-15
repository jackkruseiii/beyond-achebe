/* Beyond Achebe — feedback / suggestions widget. Loaded at the end of <body>. */
/* ══════════════════════════════════════════════════════════════
   FEEDBACK / SUGGESTIONS WIDGET
   ══════════════════════════════════════════════════════════════
   CONFIG — pick ONE of the three ways to receive messages:

   1. EMAIL ONLY (no setup). Leave ENDPOINT and ACCESS_KEY empty.
      The form opens the visitor's own mail app, pre-filled.

   2. WEB3FORMS (no account). Get a free access key at
      web3forms.com, paste it into ACCESS_KEY. Messages arrive
      in your inbox; nothing else to change.

   3. FORMSPREE (account). Create a form at formspree.io, paste
      its URL (https://formspree.io/f/xxxxxxxx) into ENDPOINT.

   EMAIL is always used as the fallback if a send fails.
   ══════════════════════════════════════════════════════════════ */
(function(){
  var ACCESS_KEY = "b8cf6764-abdb-4b50-b461-55f99ab72543";   // Web3Forms key
  var ENDPOINT   = "";                 // Formspree URL, or leave empty
  var EMAIL      = "jackkruseiii@gmail.com";  // your address

  if(ACCESS_KEY && !ENDPOINT) ENDPOINT = "https://api.web3forms.com/submit";

  var overlay = document.getElementById('ba-fb-overlay'),
      card    = document.getElementById('ba-fb-card'),
      form    = document.getElementById('ba-fb-form'),
      note    = document.getElementById('ba-fb-note'),
      send    = document.getElementById('ba-fb-send'),
      lastFocus = null;

  function val(id){ return (document.getElementById(id).value || '').trim(); }

  window.baFeedbackOpen = function(){
    lastFocus = document.activeElement;
    overlay.classList.remove('fb-sent');
    note.textContent = '';
    overlay.classList.add('fb-on');
    document.body.style.overflow = 'hidden';
    setTimeout(function(){ document.getElementById('ba-fb-kind').focus(); }, 30);
  };
  function closePanel(){
    overlay.classList.remove('fb-on');
    document.body.style.overflow = '';
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function setNote(text, isError){
    note.textContent = text;
    note.className = isError ? 'fb-err' : '';
  }

  document.getElementById('ba-fb-close').addEventListener('click', closePanel);
  document.getElementById('ba-fb-done-close').addEventListener('click', closePanel);
  overlay.addEventListener('mousedown', function(e){ if(e.target === overlay) closePanel(); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay.classList.contains('fb-on')) closePanel();
  });
  /* keep tabbing inside the panel while it's open */
  card.addEventListener('keydown', function(e){
    if(e.key !== 'Tab') return;
    var f = card.querySelectorAll('button, input, select, textarea, a[href]');
    f = Array.prototype.filter.call(f, function(el){
      return el.offsetParent !== null && el.tabIndex !== -1 && !el.disabled;
    });
    if(!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(val('ba-fb-hp')) return;                      /* bot caught by honeypot */

    if(!val('ba-fb-msg')){
      setNote('Add a message first — a title and author is plenty.', true);
      document.getElementById('ba-fb-msg').focus();
      return;
    }

    var kind    = val('ba-fb-kind'),
        country = val('ba-fb-country'),
        body    = val('ba-fb-msg'),
        name    = val('ba-fb-name'),
        email   = val('ba-fb-email'),
        page    = (location.pathname + location.search) || '/';

    if(!ENDPOINT){
      var text = kind + '\n\nCountry: ' + (country || '—') +
                 '\n\n' + body +
                 '\n\n— ' + (name || 'a reader') + (email ? ' (' + email + ')' : '') +
                 '\nSent from ' + page;
      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent('Beyond Achebe — ' + kind) +
        '&body='    + encodeURIComponent(text);
      overlay.classList.add('fb-sent');
      return;
    }

    var payload = {
      subject: 'Beyond Achebe — ' + kind,
      from_name: name || 'A reader',
      kind: kind,
      country: country || '—',
      message: body,
      name: name || '—',
      email: email || '',
      page: page
    };
    if(ACCESS_KEY) payload.access_key = ACCESS_KEY;

    send.disabled = true;
    setNote('Sending…', false);

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(r){
      if(!r.ok) throw new Error('bad status');
      form.reset();
      overlay.classList.add('fb-sent');
    }).catch(function(){
      setNote('That didn\u2019t go through. Email it to ' + EMAIL + ' instead.', true);
    }).then(function(){
      send.disabled = false;
    });
  });
})();
