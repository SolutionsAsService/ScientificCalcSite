// Evaluate every example the site prints, with the same engine the calculator uses.
// Reads _src/data.json; prints {expr|mode: {display, reading} | {error}} as JSON.
const fs = require("fs");
const path = require("path");
const Calc = require("../site/js/calc.js");

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "data.json"), "utf8"));
const out = {};
const add = (expr, mode) => {
  const key = expr + "|" + mode;
  try {
    const r = Calc.calculate(expr, { angle: mode });
    out[key] = { display: r.display, reading: r.reading, marked: r.marked, rival: r.rival ? { display: r.rival.display, marked: r.rival.marked } : null };
  } catch (e) {
    out[key] = { error: e.message };
  }
};
for (const g of data.functions) for (const f of g.items) for (const ex of f.examples) add(ex, f.mode || "deg");
for (const c of data.constants) add(c.token, "deg");
for (const ex of data.guide) add(ex.expr, ex.mode || "deg");
out.__constants = Object.fromEntries(Object.entries(Calc.CONSTANTS).map(([k, v]) => [k, v.value]));
process.stdout.write(JSON.stringify(out));
