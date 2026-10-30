# Show Your Work: a scientific calculator

A scientific calculator for the browser that tells you how it read your maths. Every answer comes with:

- **Read as:** your calculation written back with every hidden bracket and implied × made visible, and the characters the calculator added marked in yellow (`6/2(1+2)` reads `(6 ÷ 2) × (1 + 2)`).
- **The other reading:** where calculators genuinely disagree (a number next to a bracket after ÷, a leading minus before a power), the screen shows what the other reading would give (`or 1 if read 6 ÷ (2 × (1 + 2))`).
- **The exact double:** answers show 12 significant figures; when that rounds, a ≈ appears with the exact value underneath.

Trigonometry is in degrees until you switch to RAD, and the screen always says which. A paper tape keeps your calculations; tap one to use it again.

The original one-box version is kept on the `legacy-2026-10-30` branch.

## Pages

| Page | What |
|---|---|
| `index.html` | The calculator and the tape. `index.html?x=sin(30)&mode=rad` loads a calculation. |
| `functions.html` | Every function, each with worked examples |
| `constants.html` | Mathematical and physical constants (SI 2019 exact, CODATA 2018) |
| `guide.html` | Order of operations, angles and rounding, with readings and rival readings |

## Layout

- `site/js/calc.js`: the engine. A tokenizer, a Pratt parser, an evaluator and a reader that writes the tree back with its brackets. No dependencies; works in the browser and in Node.
- `site/js/ui.js`: the screen, keypad, keyboard input and tape.
- `tests/calc.test.cjs`: the engine's tests.
- `_src/`: the site generator. `data.json` holds every example, constant and guide row the site prints; `build.py` evaluates each one through the same engine (`eval-examples.cjs`), so the reference pages cannot disagree with the calculator.
- `DESIGN-LOG.md`, `panel/`: the DADA design run that produced the site.

## Test and build

```bash
node tests/calc.test.cjs
python _src/build.py
```

The build needs Node and fails if an example errors or a page links to a missing file. Edit `_src/` and `site/js/`, not the generated HTML in `site/`.

## Deploy

Ready for Vercel with no build step: the root `vercel.json` serves `site/`, and `site/vercel.json` does the same if the Vercel Root Directory is set to `site`. The root `index.html` redirects to the site. Nothing is sent anywhere: the calculator runs entirely in the browser, and the tape is kept in the browser's local storage.

## Contributing and licence

See [CONTRIBUTING.md](CONTRIBUTING.md). MIT licensed; see [LICENSE](LICENSE).
