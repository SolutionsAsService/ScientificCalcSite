Seat: Mace
Verdict: OBJECT (one small, concrete defect; all seven R1 asks addressed)
Observed:
1 live region on "=" only: fixed (#announce polite, Read as / Answer / Other calculators).
2 seams: fixed (sr-only "(added times) " plus aria-hidden glyph, in screen, tape, guide). No double reading.
3 liveness: PARTLY. #answer/#detail dropped aria-live, but #answer is an <output>, whose implicit role is status (polite live), so it still speaks on every preview keystroke. Errors: role=alert, fixed.
4 2nd-key names: fixed (x³, cubed / cube root).
5 names start with visible text: fixed (DEG, AC, n!, Ans, x²). Italic <i> is harmless because aria-label overrides it.
6 focus: fixed; only a tape click focuses the input, which is fine.
7 ring clipping: fixed (4px padding on .tape-roll, .table-wrap).
New: (a) .answer::before "=" pseudo-content is voiced as "equals" in browse mode (minor, duplicate). (b) Keypad presses are now silent: nothing says what was inserted, and the input is not focused. (c) Tape button label "Use again: x equals n" drops the reading and the seams, and does not start with its visible text. (d) aria-label on the rival <p> has no role, so it is ignored (the visible text is read instead).
Anchor: Mace principle 4, Perceptible Information.
Meaning: The promise "see how it read you" now reaches the ear on "=".
Artist question: Does the live preview stay quiet until asked?
Neutral question: Does each key press give feedback in some channel?
Opinion: Nearly; <output> undoes the quiet.
Requested change:
1. Make #answer a <span> (or output with aria-live="off" role="none"); keep the CSS selectors.
2. Make the "=" pseudo-content silent: content: "=" / "" (alt text), or move it to an aria-hidden span.
3. Add a polite sr-only echo on key press ("7", "plus"), or announce the new expression, cleared before each press.
4. Tape label: "<visible x> = <answer>, read as <reading>".
