# Open decisions

Single checklist of items waiting on Jack. Source: `docs/AUDIT-2026-10-14.md`, section 2.
Claude: check this file before raising an issue, tick items off with a one-line edit when resolved, and add a line to `docs/log.md`. Do not re-ask about anything already listed.

Format: `- [ ]` open, `- [x]` resolved (date + what was decided).

## Visible on the live site

- [ ] 1. **Three dead "Read full review" links.** Cameroon (*Behold the Dreamers*), Tanzania (*Afterlives*), South Africa (*The Promise*) point to old `beyondachebe.com/2021/…` blog paths that 404. **Need:** the current blog URLs for those three posts.
- [ ] 2. **Mauritius shows the wrong book.** *The Restraint of Beasts* (Magnus Mills) is a Scottish novel with no Mauritius link. Options: Nathacha Appanah, *The Last Brother*; Ananda Devi, *Eve Out of Her Ruins*.
- [ ] 3. **Somalia poem doesn't match its link.** Card shows K'Naan, "Somalia"; linked post features Abdirashid Omar's "Fatwo". Pick one and confirm the clip text.
- [ ] 4. **Poem clips to verify against the Poet of the Week posts** (may be paraphrased, not quoted): Soyinka "In the Small Hours", Rabearivelo "9", Konie, Chipasula, Dipoko, El Ouazzani, Mattawa, Tati Loutard, Seboni. Algeria's *Kassaman* is usually rendered "We swear by the lightning…", not "We pledge".
- [ ] 5. **Review text that may not be Jack's.** Nigeria's *Arrow of God* and *Americanah* read like catalogue copy and both link to the Nwaubani post. Ghana's *Transcendent Kingdom* links to the *Homegoing* post. Ethiopia's *Mister Drainpipe* links to the whole 2019 archive. **Need:** the right posts, or mark `pendingReview`.

## Content calls

- [ ] 6. **Rwanda.** Review describes a 2015 longread article; listed book is the 2018 memoir. Keep, or rewrite after reviewing the book.
- [ ] 7. **Sudan review text** says "Lizzy Shackleton"; correct name is Shackelford. It is Jack's text, so left unchanged.
- [ ] 8. **Egypt counts as "still to read"** though *The Cairo Trilogy* is read (`reviewed:false`). Mark read with the existing note, or wait for a formal review.
- [ ] 9. **Author origin vs. the premise** ("a novel by an author from every country"). Non-national primary picks: Sudan (*The Dissent Channel*, American; option Tayeb Salih), Somalia (Hanley / Ripken; option Nuruddin Farah), Congo DRC (Naipaul / Stearns; option Fiston Mwanza Mujila, *Tram 83*), Burkina Faso (*American Spy*, American), Libya (Alessandro Spina; option Hisham Matar), Kenya (*The Zanzibar Chest*; option Ngũgĩ wa Thiong'o), Zambia (Alexandra Fuller memoir), Benin future (Bruce Chatwin). Fine if intentional; needs a deliberate call.
- [ ] 10. **Combined entries.** Tanzania, Congo (DRC), Zimbabwe, Somalia, Angola and Cameroon's Mbue pair two books in one flat field ("A / B"). Convert to `books:[]` once each has its own review text. (High-effort data-model task.)
- [ ] 11. **Regions (editorial).** Cameroon and São Tomé are West Africa here, Central Africa per the UN. Sudan is in the Horn here, North Africa per the UN. Only Angola was moved.
- [ ] 12. **Small things.** Hide "Reviews pending: 0" when zero. Jack's email sits in the page source as the form fallback (spam risk).

## Suggested thread grouping

- Thread A (low effort): items 1 and 7, once URLs are supplied.
- Thread B (mid effort): items 2, 3, 4, 5, 6, 8.
- Thread C (high effort): items 9, 10, 11.
