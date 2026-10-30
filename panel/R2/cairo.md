Seat: Cairo
Verdict: PASS

Observed:
- Ran tests/calc.test.cjs: 113 passed, 0 failed.
- R1 corrections landed: sin(1e-20) RAD = 1 × 10⁻²⁰ (no false zero); sin(pi) and cos(pi/2) still 0 with an honest note; tan(pi/2) is 1.63e16 (not hidden); round(-2.5) = −3; 999999999999.5 = 1 × 10¹²; mod(7,-3) = −2; nCr(60,30) = 1.18264581565 × 10¹⁷; nPr(200,171) errors "too big" correctly. guide.html:83 now says "from a trillion up" and "judged after rounding". functions.html:39 "21 entries" and asinh/acosh/atanh/sign documented (line 64, 70). index.html no longer quotes a function count.
- Rival patterns correct. Pattern 1 (implied × after ÷): 6/2(1+2) 9 vs 1; 8/2(2+2) 16 vs 1; 1/2pi 1.5708 vs 0.15915; 1/2(3) 1.5 vs 0.1667; 6/2(1+2)^2 27 vs 0.333. Pattern 2 (leading minus before ^): -2^2 −4 vs 4; -(2)^2 −4 vs 4; -2^-2 −0.25 vs 0.25; -2^2^2 −16 vs 16.
- No false rivals: -2^3 (both −8), (-2)^2, (6/2)(1+2), 6/2*(1+2), 2(3)/4, 2^-2, -3!, 3-2^2, 2^2*3 all show none. Arithmetic of every rival checked by hand: right.
- Prose vs engine: guide table rows (-2^2, 6/2(1+2)) match engine reading, answer and rival; ordering list matches; index.html:117 matches.

Anchor: Cairo, The Truthful Art: truthful, functional, show method and source.
Meaning: the screen now shows its reading and the one honest alternative, and invents nothing.
Artist question: does every disagreement a reader would meet get named?
Neutral question: do printed rules equal engine behaviour? Yes.
Opinion: the rival also fires for number-then-constant/function after ÷ (1/2pi, 1/2sin(30)); correct, but the guide's example shows only the bracket case.

Requested change: none required. Optional: one guide row for 1/2pi.
