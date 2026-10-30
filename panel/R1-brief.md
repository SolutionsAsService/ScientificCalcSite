# Panel R1 brief (WHOLE round, build of 2026-10-30 after moves M1–M4)

Artifact: "Show Your Work", a total revamp of a scientific calculator site (the old one was a single text box handed to math.js; its placeholder invited `sin(30)` and answered −0.988 in radians, unlabelled). Mode: Adaptive, criterion MAYA (Most Advanced Yet Acceptable). Audience: students and anyone checking a sum, many on phones.

The idea: a calm, Rams-like device (graphite body, round keys, one yellow =) whose screen says more than a calculator must (Venturi's both-and): under the input, a "READ AS" line writes your calculation back with every hidden bracket and implied × (`-2^2` → `−(2^2)`, `sin(30)` → `sin(30°)`); under the answer, a ≈ and the exact double when the 12-figure display rounds. A paper tape keeps each calculation and its reading. Reference pages: Functions, Constants, How it reads.

Screenshots (headless Chrome; the width each was laid out at is in the name; phone shots are 500 px because headless Chrome lays out wider below that; at a real 375 px viewport every page measured 371–375 px wide with no horizontal scroll):
H:/UBM/_redo/ScientificCalcSite/panel/shots/index-1280.png (loaded with `6/2(1+2)`), index-rad-1280.png (`sin(30)` in RAD), index-500.png (`0.1+0.2`), functions-1280.png, constants-1280.png, guide-1280.png, guide-500.png.

Source: H:/UBM/_redo/ScientificCalcSite/site/*.html, site/css/styles.css, site/js/calc.js (engine), site/js/ui.js (screen, keys, tape), tests/calc.test.cjs (86 cases, all pass with `node tests/calc.test.cjs`), _src/data.json (every example the site prints; the build evaluates each through the engine).

Measured already: at 1280×860 the = key's bottom is at 839 px (on screen); keys are 62 px at desktop, 57 px at a 375 px phone; no console errors.

## Build note for seats launched after M6 (Holmes, Mace, Krug, Bringhurst)
You are reading the build after M5 and M6 (screenshots retaken). Since the first three seats read it:
- M5: input placeholder on glass 3.44:1 → 5.32:1; the input's focus cue is now a 3 px yellow underline (10.08:1).
- M6: the "seam": characters the calculator added to the READ AS line (brackets, implied ×, °, "rad") are marked in yellow with a wavy underline (10.08:1 on glass; 5.36:1 on cream, 4.98:1 on the tape). In RAD, sin(30) now reads sin(30 rad). The "rival": where calculators disagree (6/2(1+2), -2^2) a dashed box under the reading says "Some calculators read 6 ÷ (2 × (1 + 2)) = 1"; the guide has the same column. READ AS is larger and brighter. Tests: 95 pass.
