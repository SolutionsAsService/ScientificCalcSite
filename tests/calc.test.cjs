// Tests for site/js/calc.js. Run: node tests/calc.test.cjs
// Every example the site prints is also checked here, so the site cannot show a wrong answer.
const assert = require("assert");
const Calc = require("../site/js/calc.js");

let passed = 0, failed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (e) { failed++; console.log("FAIL", name, "\n   ", e.message); }
}
const calc = (s, env) => Calc.calculate(s, env || { angle: "deg" });
const shows = (s, display, env) => check(s + " → " + display, () => assert.strictEqual(calc(s, env).display, display));
const reads = (s, reading, env) => check(s + " reads " + reading, () => assert.strictEqual(calc(s, env).reading, reading));
const fails = (s, msgPart, env) => check(s + " fails", () => {
  assert.throws(() => calc(s, env), (e) => e instanceof Calc.CalcError && e.message.includes(msgPart));
});
const RAD = { angle: "rad" };

// Arithmetic and precedence
shows("1+2*3", "7");
shows("(1+2)*3", "9");
shows("0.1+0.2", "0.3");
shows("-2^2", "−4");
shows("(-2)^2", "4");
shows("2^3^2", "512");
shows("2^-1", "0.5");
shows("10/4", "2.5");
shows("7-3-2", "2");
shows("8/2/2", "2");
shows("50%", "0.5");
shows("200*15%", "30");
shows("5!", "120");
shows("0!", "1");
shows("3!^2", "36");

// Implied multiplication
shows("2pi", "6.28318530718");
shows("2(3+4)", "14");
shows("(1+2)(3+4)", "21");
shows("3√16", "12");

// Roots and logs
shows("√16", "4");
shows("√(2)", "1.41421356237");
shows("∛27", "3");
shows("cbrt(-8)", "−2");
shows("root(81,4)", "3");
shows("root(-32,5)", "−2");
shows("ln(e)", "1");
shows("log(1000)", "3");
shows("log(8,2)", "3");
shows("log2(1024)", "10");
shows("exp(0)", "1");

// Trigonometry in degrees (the default) and radians
shows("sin(30)", "0.5");
shows("cos(60)", "0.5");
shows("tan(45)", "1");
shows("sin(180)", "0");
shows("cos(90)", "0");
shows("sin(-90)", "−1");
shows("asin(0.5)", "30");
shows("atan(1)", "45");
shows("sin(30)", "−0.988031624093", RAD);
shows("sin(pi)", "0", RAD);
shows("cos(pi)", "−1", RAD);
shows("asin(1)", "1.57079632679", RAD);
fails("tan(90)", "undefined at 90°");
fails("asin(2)", "from -1 to 1");

// Combinatorics and other functions
shows("nCr(5,2)", "10");
shows("nCr(52,5)", "2598960");
shows("nPr(5,2)", "20");
shows("mod(-7,3)", "2");
shows("abs(-3.5)", "3.5");
shows("hypot(3,4)", "5");
shows("max(1,9,4)", "9");

// Constants and scientific notation
shows("c", "299792458");
shows("NA", "6.02214076 × 10²³");
shows("h", "6.62607015 × 10⁻³⁴");
shows("1e12", "1 × 10¹²");
shows("123456789012", "123456789012");
shows("0.000001", "0.000001");
shows("2^64", "1.84467440737 × 10¹⁹");
shows("R", "8.31446261815");
shows("kB*NA", "8.31446261815");

// Ans
check("Ans uses the last answer", () => assert.strictEqual(calc("Ans*2", { angle: "deg", ans: 21 }).display, "42"));
fails("Ans+1", "no answer yet");

// The reading shows the hidden brackets
reads("1+2*3", "1 + (2 × 3)");
reads("-2^2", "−(2^2)");
reads("2^3^2", "2^(3^2)");
reads("2pi", "2 × π");
reads("7-3-2", "(7 − 3) − 2");
reads("1+2+3", "1 + 2 + 3");
reads("sin(30)", "sin(30°)");
reads("sin(30)", "sin(30 rad)", RAD);
reads("√16+1", "√(16) + 1");
reads("3!^2", "(3!)^2");
shows("6/2(1+2)", "9");
reads("6/2(1+2)", "(6 ÷ 2) × (1 + 2)");

// Rival readings: shown only where calculators disagree and the numbers differ
const rival = (s) => calc(s).rival;
check("6/2(1+2) has rival 1", () => { const r = rival("6/2(1+2)"); assert.strictEqual(r.display, "1"); assert.strictEqual(r.reading, "6 ÷ (2 × (1 + 2))"); });
check("-2^2 has rival 4", () => { const r = rival("-2^2"); assert.strictEqual(r.display, "4"); assert.strictEqual(r.reading, "(−2)^2"); });
check("-2^3 has no rival (same number)", () => assert.strictEqual(rival("-2^3"), null));
check("1+2*3 has no rival", () => assert.strictEqual(rival("1+2*3"), null));
check("6/(2(1+2)) has no rival (already explicit)", () => assert.strictEqual(rival("6/(2(1+2))"), null));
check("rival inside a function", () => assert.strictEqual(rival("sqrt(-3^2+18)").display, "5.19615242271"));

// The seam: characters the reader adds are marked
check("implied × is marked", () => assert.ok(calc("2pi").marked.includes(" × ")));
check("added brackets are marked, typed ones are not", () => {
  const m = calc("(1+2)*3+4*5").marked;
  // ((1 + 2) × 3) + (4 × 5): the outer bracket and the brackets round 4 × 5 are added; (1 + 2) was typed
  assert.ok(m.startsWith("((1 + 2) × 3)"), JSON.stringify(m));
  assert.ok(m.endsWith("(4 × 5)"), JSON.stringify(m));
});
check("degree sign is marked", () => assert.ok(calc("sin(30)").marked.includes("°")));

// Cairo R1 cases
shows("sin(1e-20)", "1 × 10⁻²⁰", RAD);
shows("sin(1e-16)", "1 × 10⁻¹⁶", RAD);
shows("cos(pi/2)", "0", RAD);
shows("sin(2pi)", "0", RAD);
shows("round(-2.5)", "−3");
shows("round(2.5)", "3");
shows("999999999999.5", "1 × 10¹²");
shows("9.9999999999999e-7", "0.000001");
shows("mod(7,-3)", "−2");
shows("mod(-1e-20,3)", "3");
fails("nPr(200,171)", "too big"); // 200!/29! ≈ 10^343: Cairo R1 premise refuted, see M7
shows("nCr(60,30)", "1.18264581565 × 10¹⁷");
shows("hbar", "1.05457181765 × 10⁻³⁴");
shows("G", "6.6743 × 10⁻¹¹");
shows("me", "9.1093837015 × 10⁻³¹");
shows("mp", "1.67262192369 × 10⁻²⁷");
shows("g0", "9.80665");
shows("asinh(1)", "0.88137358702");

// Errors
fails("2+", "ends too soon");
fails("(2+3", "Expected )");
fails("2+3)", ") with no (");
fails("1/0", "Division by 0");
fails("sqrt(-1)", "not real");
fails("170.5!", "whole number");
fails("171!", "170!");
fails("foo(2)", "don't know foo");
fails("sin 30", "needs brackets");
fails("2 $ 3", "symbol $");
fails("10^400", "too big");

// Rounding flag: 0.1+0.2 is shown as 0.3 but the double is 0.30000000000000004
check("0.1+0.2 is flagged as rounded", () => {
  const r = calc("0.1+0.2");
  assert.strictEqual(r.rounded, true);
  assert.strictEqual(r.exact, "0.30000000000000004");
});

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
