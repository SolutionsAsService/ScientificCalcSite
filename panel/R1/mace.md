Seat: Mace
Verdict: OBJECT
Observed: Ring: global :focus-visible 3px, offset 2px; yellow #F2B705 inside .device/.site-header/footer (~8:1 on #262624), green #2F6B3A elsewhere (~6:1 on card/paper); .expr swaps to a 3px yellow underline (10:1). Targets pass (.key min-height 44px, round 57-62px; .tape-clear 36px). Defects: (a) .tape-roll{overflow-y:auto} and .table-wrap{overflow-x:auto} clip the outset ring on full-width .tape-entry buttons and table links. (b) ui.js insert()/back()/clearAll() call input.focus() on every non-touch key press, so a keyboard user loses their place on the keypad. (c) aria-label="squared" on x² and "square root" on √ persist when 2nd swaps text to x³/∛ and inserts ^3/∛: the name lies. (d) Visible text not in accessible name (2.5.3): DEG/RAD key, AC ("All clear"), n! ("factorial"). (e) READ AS (#reading), rival and seams are not in any live region; mark.seam is colour + wavy underline only, so the screen-reader user never hears what the calculator added, the site's core idea. (f) #answer and #detail are both aria-live=polite and update per keystroke (preview errors too): chatty; errors are not role=alert.
Anchor: Mace Principle 4, Perceptible Information.
Meaning: The device's promise is "see how it read you".
Artist question: Does the promise survive without eyes?
Neutral question: Can every user get the same reading by another channel?
Opinion: No; the best feature is sighted-only.
Requested change:
1. Make a visually hidden live region (aria-live=polite) announced only on "=": "Read as: ... Added: bracket, times, degrees. Answer 6. Some calculators read 1."
2. Seams: prefix/suffix sr-only "[added " "]" inside mark.seam.
3. Drop aria-live from #detail and the preview answer; keep it on "=" only; role=alert for committed errors.
4. Update aria-label in setSecond (cubed, cube root).
5. Rename labels to start with the visible text ("DEG, switch to radians", "AC, all clear", "n!, factorial").
6. Remove input.focus() from key handlers (focus only on touch=false AC if wanted).
7. Overflow: padding 4px on .tape-roll and .table-wrap, or inset ring (outline-offset:-3px) there.
