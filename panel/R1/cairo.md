Seat: Cairo
Verdict: OBJECT

Observed:
- site/js/calc.js trig() (the `Math.abs(v) < 1e-15 && x !== 0` branch): in RAD, sin(1e-16), tan(1e-16), sin(1e-20) display 0 with a note "sin(1 × 10⁻²⁰) is 1.0000e-20 in floating point; shown as 0". The note is true, the zeroing is not: sin x ≈ x, so the true value is 1e-20. This is a printed falsehood. The guard should only fire when x is within about 1e-15 of a nonzero multiple of pi/2, not whenever |v| is small.
- site/js/calc.js fmt(): 999999999999.5 prints "1000000000000" (13 digits plain). The threshold test uses the unrounded value, so the 12-figure display switches late. Similarly 9.9999999999999e-7 prints "1 × 10⁻⁶" while 1e-6 prints 0.000001. Edge only.
- site/guide.html:83: "switches to × 10ⁿ above a trillion". The engine switches at ≥ 1e12 (1e12 → "1 × 10¹²", test confirms). Say "from a trillion up".
- site/index.html:117 "All 21 functions": the engine has 31 callable names (asinh, acosh, atanh, sign, fact are undocumented). functions.html:39 says "21 entries" (rows, which include operators), correct; index says "functions", not. "15 constants" is correct (16 keys, π alias).
- round(-2.5) → −2 (JS half-up), not −3; functions.html documents only round(2.5)=3. State the rule or implement round-half-away.
- mod(-1e-20,3) → 0 (true ≈ 3). Edge.
- nCr/nPr: nPr(200,171) errors on 171! although the answer is finite; nCr beyond 2^53 is Math.round of a float product (nCr(60,30) exact line 118264581564861420 is unverified against 118264581564861424).

Verified correct: all 86 tests pass; expectations are mathematically right. Constants page: h, hbar (1.0545718176461565e-34), qe, kB, NA, R = 8.31446261815324, g0, G 6.6743e-11, me, mp match SI 2019 / CODATA 2018. Precedence (-2^2, 2^3^2, 2^-1, 6/2(1+2), 3!^2), mod(-7,3)=2, mod(7,-3)=-2, 170!/171!, 2^1024 error, degree exactness (sin 180/720, tan 135) all correct.

Anchor: Cairo, The Truthful Art: truthful, functional, show method and source.
Meaning: the screen promises it never hides what it did; a silent zero breaks that promise.
Artist question: does the ≈ line tell the whole truth about every answer?
Neutral question: are the printed counts and thresholds the ones the engine uses?
Opinion: fix the small-angle zeroing and the two prose claims; the rest is a strong, honest engine.

Requested change:
1. Limit the sub-1e-15 zeroing to results near a multiple of pi/2 (check x against nearest multiple), else return v.
2. guide.html:83 "from a trillion up"; index.html:117 and functions text: say "21 entries" or document asinh/acosh/atanh/sign/fact.
3. Document or fix round for negative halves; add tests: sin(1e-16) RAD, round(-2.5), 999999999999.5, mod(7,-3), hbar/G/me/mp/g0 values, nCr(60,30).
