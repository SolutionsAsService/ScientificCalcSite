/* Calc: a small scientific-calculator engine.
   tokenize -> parse (Pratt parser, to a tree) -> evaluate, plus read(): the tree written
   back out with every implied bracket and multiplication made visible.
   Works in the browser (window.Calc) and in Node (module.exports). */
(function (root) {
  "use strict";

  // Physical constants: SI 2019 exact values, and CODATA 2018 recommended values.
  var CONSTANTS = {
    pi:   { value: Math.PI, label: "π" },
    "π":  { value: Math.PI, label: "π" },
    e:    { value: Math.E, label: "e" },
    tau:  { value: 2 * Math.PI, label: "τ" },
    phi:  { value: (1 + Math.sqrt(5)) / 2, label: "φ" },
    c:    { value: 299792458, label: "c" },
    h:    { value: 6.62607015e-34, label: "h" },
    hbar: { value: 6.62607015e-34 / (2 * Math.PI), label: "ħ" },
    qe:   { value: 1.602176634e-19, label: "qe" },
    kB:   { value: 1.380649e-23, label: "kB" },
    NA:   { value: 6.02214076e23, label: "NA" },
    R:    { value: 6.02214076e23 * 1.380649e-23, label: "R" },
    G:    { value: 6.67430e-11, label: "G" },
    me:   { value: 9.1093837015e-31, label: "me" },
    mp:   { value: 1.67262192369e-27, label: "mp" },
    g0:   { value: 9.80665, label: "g0" }
  };

  var TRIG = { sin: 1, cos: 1, tan: 1 };
  var ARC = { asin: Math.asin, acos: Math.acos, atan: Math.atan };

  function factorial(n) {
    if (n < 0 || n !== Math.floor(n)) throw new CalcError("! needs a whole number of 0 or more");
    if (n > 170) throw new CalcError("170! is the largest factorial a double can hold");
    var r = 1;
    for (var i = 2; i <= n; i++) r *= i;
    return r;
  }
  function choose(n, k) {
    whole(n, "nCr"); whole(k, "nCr");
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    var r = 1;
    for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r);
  }
  function whole(x, name) {
    if (x !== Math.floor(x)) throw new CalcError(name + " needs whole numbers");
  }

  var FUNCTIONS = {
    sin: [1], cos: [1], tan: [1], asin: [1], acos: [1], atan: [1],
    sinh: [1, Math.sinh], cosh: [1, Math.cosh], tanh: [1, Math.tanh],
    asinh: [1, Math.asinh], acosh: [1, Math.acosh], atanh: [1, Math.atanh],
    ln: [1, function (x) { if (x <= 0) throw new CalcError("ln needs a number above 0"); return Math.log(x); }],
    log: [[1, 2], function (x, b) {
      if (x <= 0) throw new CalcError("log needs a number above 0");
      if (b === undefined) return Math.log10(x);
      if (b <= 0 || b === 1) throw new CalcError("log base must be above 0 and not 1");
      return Math.log(x) / Math.log(b);
    }],
    log2: [1, function (x) { if (x <= 0) throw new CalcError("log2 needs a number above 0"); return Math.log2(x); }],
    sqrt: [1, function (x) { if (x < 0) throw new CalcError("√ of a negative number is not real"); return Math.sqrt(x); }],
    cbrt: [1, Math.cbrt],
    root: [2, function (x, n) {
      if (n === 0) throw new CalcError("root needs a degree other than 0");
      if (x < 0 && n % 2 === 1) return -Math.pow(-x, 1 / n);
      if (x < 0) throw new CalcError("even root of a negative number is not real");
      return Math.pow(x, 1 / n);
    }],
    abs: [1, Math.abs], exp: [1, Math.exp], sign: [1, Math.sign],
    floor: [1, Math.floor], ceil: [1, Math.ceil],
    round: [1, function (x) { return Math.sign(x) * Math.round(Math.abs(x)); }],
    min: [[1, 9], Math.min], max: [[1, 9], Math.max], hypot: [[2, 9], Math.hypot],
    mod: [2, function (a, b) {
      if (b === 0) throw new CalcError("mod by 0");
      var r = a % b;
      if (r !== 0 && (r < 0) !== (b < 0)) r += b;
      return r;
    }],
    nCr: [2, choose],
    nPr: [2, function (n, k) {
      whole(n, "nPr"); whole(k, "nPr");
      if (k < 0 || k > n) return 0;
      var r = 1;
      for (var i = 0; i < k; i++) r *= (n - i);
      return r;
    }],
    fact: [1, factorial]
  };

  function CalcError(message, pos) { this.message = message; this.pos = pos; }
  CalcError.prototype = Object.create(Error.prototype);
  CalcError.prototype.name = "CalcError";

  // ---------- Tokenizer ----------
  var SYMBOLS = { "×": "*", "·": "*", "÷": "/", "−": "-", "–": "-", "√": "√", "∛": "∛", "²": "^2", "³": "^3" };

  function tokenize(src) {
    var tokens = [], i = 0;
    while (i < src.length) {
      var ch = src[i];
      if (/\s/.test(ch)) { i++; continue; }
      var m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(src.slice(i));
      if (m && /[\d.]/.test(ch)) {
        if (m[0] === ".") throw new CalcError("A lone . is not a number", i);
        tokens.push({ t: "num", v: parseFloat(m[0]), s: m[0], pos: i });
        i += m[0].length; continue;
      }
      m = /^[A-Za-zπ_][A-Za-z0-9_]*/.exec(src.slice(i));
      if (m) { tokens.push({ t: "id", v: m[0], pos: i }); i += m[0].length; continue; }
      if (SYMBOLS[ch]) {
        var sub = SYMBOLS[ch];
        if (sub === "^2" || sub === "^3") { tokens.push({ t: "op", v: "^", pos: i }); tokens.push({ t: "num", v: +sub[1], s: sub[1], pos: i }); }
        else tokens.push({ t: "op", v: sub, pos: i });
        i++; continue;
      }
      if ("+-*/^!%(),".indexOf(ch) >= 0) { tokens.push({ t: "op", v: ch, pos: i }); i++; continue; }
      throw new CalcError("I don't know the symbol " + ch, i);
    }
    tokens.push({ t: "end", pos: src.length });
    return tokens;
  }

  // ---------- Parser (Pratt) ----------
  // Binding powers: + - 10, * / and implied multiplication 20, prefix - + 30,
  // ^ 40 (right-associative), prefix √ ∛ 45, postfix ! % 50.
  function parse(src) {
    var tokens = tokenize(src), k = 0;
    if (tokens.length === 1) throw new CalcError("Type a calculation", 0);
    function peek() { return tokens[k]; }
    function next() { return tokens[k++]; }
    function expect(v) {
      var t = next();
      if (t.t !== "op" || t.v !== v) throw new CalcError("Expected " + v + (t.t === "end" ? " before the end" : " here"), t.pos);
    }
    function startsOperand(t) {
      return t.t === "num" || t.t === "id" || (t.t === "op" && (t.v === "(" || t.v === "√" || t.v === "∛"));
    }

    function nud(t) {
      if (t.t === "num") return { k: "num", v: t.v, s: t.s };
      if (t.t === "id") {
        if (FUNCTIONS[t.v] && peek().t === "op" && peek().v === "(") {
          next();
          var args = [];
          if (!(peek().t === "op" && peek().v === ")")) {
            do { args.push(expr(0)); } while (peek().t === "op" && peek().v === "," && next());
          }
          expect(")");
          return { k: "call", f: t.v, args: args, pos: t.pos };
        }
        if (FUNCTIONS[t.v]) throw new CalcError(t.v + " needs brackets, like " + t.v + "(30)", t.pos);
        if (t.v === "Ans" || t.v === "ans") return { k: "ans" };
        if (CONSTANTS[t.v]) return { k: "const", name: t.v };
        throw new CalcError("I don't know " + t.v, t.pos);
      }
      if (t.v === "(") { var e = expr(0); expect(")"); return { k: "group", e: e }; }
      if (t.v === "-") return { k: "neg", e: expr(30) };
      if (t.v === "+") return expr(30);
      if (t.v === "√") return { k: "call", f: "sqrt", args: [expr(45)], sym: "√" };
      if (t.v === "∛") return { k: "call", f: "cbrt", args: [expr(45)], sym: "∛" };
      if (t.t === "end") throw new CalcError("The calculation ends too soon", t.pos);
      throw new CalcError("I didn't expect " + t.v + " here", t.pos);
    }

    function lbp(t) {
      if (t.t === "op") {
        if (t.v === "+" || t.v === "-") return 10;
        if (t.v === "*" || t.v === "/") return 20;
        if (t.v === "^") return 40;
        if (t.v === "!" || t.v === "%") return 50;
        if (t.v === "(" || t.v === "√" || t.v === "∛") return 20; // implied ×
        return 0;
      }
      if (t.t === "num" || t.t === "id") return 20; // implied ×
      return 0;
    }

    function expr(rbp) {
      var left = nud(next());
      while (rbp < lbp(peek())) {
        var t = peek();
        if (t.t === "op" && (t.v === "!" || t.v === "%")) { next(); left = { k: t.v === "!" ? "fact" : "pct", e: left }; continue; }
        if (t.t === "op" && "+-*/".indexOf(t.v) >= 0) { next(); left = { k: "bin", op: t.v, a: left, b: expr(lbp(t)) }; continue; }
        if (t.t === "op" && t.v === "^") { next(); left = { k: "bin", op: "^", a: left, b: expr(39) }; continue; }
        if (startsOperand(t)) { left = { k: "bin", op: "*", implied: true, a: left, b: expr(20) }; continue; }
        break;
      }
      return left;
    }

    var tree = expr(0);
    var rest = peek();
    if (rest.t !== "end") throw new CalcError(rest.v === ")" ? "There's a ) with no ( before it" : "I didn't expect " + rest.v + " here", rest.pos);
    return tree;
  }

  // ---------- Evaluate ----------
  function evaluate(node, env) {
    env = env || {};
    var deg = env.angle !== "rad";
    var notes = [];
    function toRad(x) { return deg ? x * Math.PI / 180 : x; }

    function trig(name, x) {
      if (deg) {
        var r = ((x % 360) + 360) % 360;
        if (name === "sin" && r % 180 === 0) return 0;
        if (name === "cos" && r % 180 === 90) return 0;
        if (name === "tan" && r % 180 === 0) return 0;
        if (name === "tan" && r % 180 === 90) throw new CalcError("tan is undefined at " + fmt(x) + "°");
        if (name === "sin" && r === 90) return 1;
        if (name === "sin" && r === 270) return -1;
        if (name === "cos" && r === 0) return 1;
        if (name === "cos" && r === 180) return -1;
      }
      var v = Math[name](toRad(x));
      if (!deg) {
        // Only an angle sitting on a non-zero multiple of π/2 leaves floating-point residue
        // where the true answer is 0 (sin π, cos π/2). sin(1e-20) is genuinely 1e-20.
        var k = Math.round(x / (Math.PI / 2));
        if (k !== 0 && Math.abs(x - k * Math.PI / 2) <= 1e-12 * Math.abs(x) && Math.abs(v) < 1e-12) {
          notes.push(name + "(" + fmt(x) + ") is " + v.toExponential(4) + " in floating point; shown as 0");
          return 0;
        }
      }
      return v;
    }

    function ev(n) {
      switch (n.k) {
        case "num": return n.v;
        case "const": return CONSTANTS[n.name].value;
        case "ans":
          if (env.ans === undefined || env.ans === null) throw new CalcError("There's no answer yet to use as Ans");
          return env.ans;
        case "group": return ev(n.e);
        case "neg": return -ev(n.e);
        case "pct": return ev(n.e) / 100;
        case "fact": return factorial(ev(n.e));
        case "bin": {
          var a = ev(n.a), b = ev(n.b);
          if (n.op === "+") return a + b;
          if (n.op === "-") return a - b;
          if (n.op === "*") return a * b;
          if (n.op === "/") { if (b === 0) throw new CalcError("Division by 0"); return a / b; }
          if (n.op === "^") {
            var p = Math.pow(a, b);
            if (isNaN(p)) throw new CalcError("A negative number to a fractional power is not real");
            return p;
          }
        }
        // falls through
        case "call": {
          var spec = FUNCTIONS[n.f];
          var arity = spec[0];
          var lo = Array.isArray(arity) ? arity[0] : arity, hi = Array.isArray(arity) ? arity[1] : arity;
          if (n.args.length < lo || n.args.length > hi) {
            throw new CalcError(n.f + " takes " + (lo === hi ? lo : lo + " to " + hi) + " number" + (hi > 1 ? "s" : ""));
          }
          var args = n.args.map(ev);
          if (TRIG[n.f]) return trig(n.f, args[0]);
          if (ARC[n.f]) {
            if ((n.f === "asin" || n.f === "acos") && Math.abs(args[0]) > 1) throw new CalcError(n.f + " needs a number from -1 to 1");
            var r = ARC[n.f](args[0]);
            return deg ? r * 180 / Math.PI : r;
          }
          return spec[1].apply(null, args);
        }
      }
      throw new CalcError("Unknown node " + n.k);
    }

    var value = ev(node);
    if (!isFinite(value)) throw new CalcError(isNaN(value) ? "That isn't a real number" : "The answer is too big for a double (over 1.8 × 10³⁰⁸)");
    return { value: value, notes: notes };
  }

  // ---------- Read back: every implied bracket and × made visible ----------
  // Each operation inside another gets its own brackets, so the reading never relies on
  // precedence. Only plain left-to-right chains of + or × are left unbracketed.
  // Characters the reader adds (brackets, implied ×, angle units) are wrapped in
  // \u0001 … \u0002 so the screen can mark the seam; plain() strips the marks.
  var M0 = "\u0001", M1 = "\u0002";
  function mark(s) { return M0 + s + M1; }
  function plain(s) { return s.replace(/[\u0001\u0002]/g, ""); }
  function read(node, env) {
    var deg = !env || env.angle !== "rad";
    var SYM = { "+": " + ", "-": " − ", "*": " × ", "/": " ÷ ", "^": "^" };
    function inner(n) { return n.k === "group" ? inner(n.e) : n; }
    function atom(n) { n = inner(n); return n.k === "num" || n.k === "const" || n.k === "ans" || n.k === "call"; }
    function br(n) {
      if (atom(n)) return r(n);
      return n.k === "group" ? "(" + r(n) + ")" : mark("(") + r(n) + mark(")");
    }
    function r(n) {
      n = inner(n);
      switch (n.k) {
        case "num": return n.s;
        case "const": return CONSTANTS[n.name].label;
        case "ans": return "Ans";
        case "neg": return "−" + br(n.e);
        case "pct": return br(n.e) + "%";
        case "fact": return br(n.e) + "!";
        case "bin": {
          var a = inner(n.a);
          var left = (a.k === "bin" && a.op === n.op && (n.op === "+" || n.op === "*")) ? r(a) : br(n.a);
          return left + (n.implied ? mark(" × ") : SYM[n.op]) + br(n.b);
        }
        case "call": {
          var args = n.args.map(function (x) { return r(x); }).join(", ");
          var name = n.f === "sqrt" ? "√" : n.f === "cbrt" ? "∛" : n.f;
          var unit = TRIG[n.f] ? mark(deg ? "°" : " rad") : "";
          var open = n.sym ? mark("(") : "(", close = n.sym ? mark(")") : ")";
          return name + open + args + unit + close;
        }
      }
      return "?";
    }
    return r(node);
  }

  // ---------- Rival readings ----------
  // Two places where calculators genuinely disagree. If the input contains one and the other
  // reading gives a different number, report it.
  function rivalTree(n) {
    if (!n || typeof n !== "object") return null;
    var e = n.k === "group" ? n.e : null;
    if (e) { var g = rivalTree(e); return g ? { k: "group", e: g } : null; }
    if (n.k === "bin" && n.op === "*" && n.implied) {
      var a = n.a.k === "group" ? null : n.a;
      if (a && a.k === "bin" && a.op === "/") {
        return { k: "bin", op: "/", a: a.a, b: { k: "group", e: { k: "bin", op: "*", implied: true, a: a.b, b: n.b } } };
      }
    }
    if (n.k === "neg" && n.e.k === "bin" && n.e.op === "^") {
      return { k: "bin", op: "^", a: { k: "group", e: { k: "neg", e: n.e.a } }, b: n.e.b };
    }
    var keys = n.k === "bin" ? ["a", "b"] : (n.k === "neg" || n.k === "pct" || n.k === "fact") ? ["e"] : [];
    for (var i = 0; i < keys.length; i++) {
      var sub = rivalTree(n[keys[i]]);
      if (sub) { var copy = {}; for (var p in n) copy[p] = n[p]; copy[keys[i]] = sub; return copy; }
    }
    if (n.k === "call") {
      for (var j = 0; j < n.args.length; j++) {
        var s2 = rivalTree(n.args[j]);
        if (s2) { var c2 = {}; for (var q in n) c2[q] = n[q]; c2.args = n.args.slice(); c2.args[j] = s2; return c2; }
      }
    }
    return null;
  }

  // ---------- Display ----------
  var SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  function fmt(x, digits) {
    digits = digits || 12;
    if (x === 0) return "0";
    var ax = Math.abs(Number(x.toPrecision(digits)));
    if (ax >= 1e12 || ax < 1e-6) {
      var parts = x.toExponential(digits - 1).split("e");
      var mant = parts[0].replace(/\.?0+$/, "");
      var exp = String(+parts[1]).split("").map(function (c) { return SUP[c]; }).join("");
      return mant.replace("-", "−") + " × 10" + exp;
    }
    var s = String(Number(x.toPrecision(digits)));
    return s.replace("-", "−");
  }
  function exact(x) { return String(x).replace("-", "−"); }

  function calculate(src, env) {
    var tree = parse(src);
    var out = evaluate(tree, env);
    var shown = fmt(out.value);
    var rounded = Number(out.value.toPrecision(12)) !== out.value;
    var marked = read(tree, env);
    var rival = null, alt = rivalTree(tree);
    if (alt) {
      try {
        var av = evaluate(alt, env).value;
        if (Math.abs(av - out.value) > 1e-12 * Math.max(1, Math.abs(out.value))) {
          var am = read(alt, env);
          rival = { value: av, display: fmt(av), reading: plain(am), marked: am };
        }
      } catch (e) { if (!(e instanceof CalcError)) throw e; }
    }
    return { value: out.value, display: shown, rounded: rounded, exact: exact(out.value), reading: plain(marked), marked: marked, rival: rival, notes: out.notes };
  }

  var api = { calculate: calculate, parse: parse, evaluate: evaluate, read: read, plain: plain, format: fmt, CONSTANTS: CONSTANTS, FUNCTIONS: FUNCTIONS, CalcError: CalcError };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Calc = api;
})(this);
