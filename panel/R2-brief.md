# Panel R2 brief (WHOLE round, build after M5–M11)

Same artifact as R1 (read panel/R1-brief.md for the idea). Fresh screenshots: H:/UBM/_redo/ScientificCalcSite/panel/shots/ (index-1280.png loaded with `6/2(1+2)`, index-rad-1280.png, index-500.png, functions-1280.png, constants-1280.png, guide-1280.png, guide-500.png; phone shots 500 px wide, see R1 brief). Source: site/*.html, site/css/styles.css, site/js/calc.js, site/js/ui.js, tests/calc.test.cjs (113 pass). Your R1 report: panel/R1/<seat>.md.

What changed since R1:
- M5 placeholder 3.44 → 5.32:1; input focus = 3 px yellow underline (10.08:1).
- M6 the seam: characters the calculator added to READ AS are yellow + wavy underline + hidden "(added opening bracket)" text; RAD reads `sin(30 rad)`. The rival: where calculators disagree and the numbers differ, a dashed line says "or 1 if read 6 ÷ (2 × (1 + 2))"; guide has the same column. Engine-generated, tested.
- M7 (Cairo): RAD zeroing only near non-zero multiples of π/2 (sin(1e-20) = 1 × 10⁻²⁰); display threshold judged after rounding; round halves away from zero; mod sign fix; "from a trillion up"; asinh/acosh/atanh/sign documented; home stops quoting a function count. Cairo's nPr(200,171) premise refuted: 200!/29! ≈ 10³⁴³ > 1.8 × 10³⁰⁸.
- M8 (Krug × Debord): glass order is input → READ AS → answer → rival → exact double. Krug's "answer smallest/dimmest" was read from a preview screenshot: committed answer 41.6 px vs reading 16.8 px; the preview answer is now brighter and an "=" marks preview vs committed. Shift legends printed above keys; EE → ×10ⁿ; angle key shows DEG/RAD with the current one in yellow.
- M9 (Mace): hidden live region speaks only on "=" ("Read as … Answer … Other calculators may read …"); errors to role=alert; #answer/#detail no longer live; 2nd swaps accessible names; names start with visible text; key presses no longer move focus to the input; 4 px padding so rings aren't clipped in the tape and tables.
- M10 (Holmes): shift legends 12 px, 4.74:1 on the key; Ans has a tooltip.
- M11 (Bringhurst): "× 10ⁿ" typeset with a thin-spaced × and a real <sup> (screen, tape, all reference pages); italic variables on keys. Long answers step down a size and stay on one line (−1.18264581565 × 10¹⁷ fits at 375 px).
- Measured: every page 375 px wide at a 375 px viewport; no console errors.
