/* Show Your Work: the calculator screen, keypad and tape. The maths lives in calc.js. */
(function () {
  "use strict";
  var input = document.getElementById("expr");
  if (!input || !window.Calc) return;

  var readingEl = document.getElementById("reading");
  var rivalEl = document.getElementById("rival");
  var announceEl = document.getElementById("announce");
  var alertEl = document.getElementById("alert");
  var echoEl = document.getElementById("echo");
  var answerEl = document.getElementById("answer");
  var approxEl = document.getElementById("approx");
  var detailEl = document.getElementById("detail");
  var modeFlag = document.getElementById("mode-flag");
  var secondFlag = document.getElementById("second-flag");
  var angleKey = document.getElementById("angle-key");
  var tapeEl = document.getElementById("tape");
  var tapeEmpty = document.getElementById("tape-empty");
  var screen = document.querySelector(".screen");

  function load(key, fallback) { try { var v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } }
  function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }

  var state = { angle: load("syw-angle", "deg"), second: false, ans: load("syw-ans", null), tape: load("syw-tape", []), fresh: false };
  var caret = { start: 0, end: 0 };
  var touch = window.matchMedia && matchMedia("(pointer: coarse)").matches;

  function env() { return { angle: state.angle, ans: state.ans }; }

  // "6.02 × 10²³" from the engine becomes a typeset number: a thin-spaced × and a real superscript.
  var SUPS = { "⁻": "−", "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };
  function num(s) {
    return s.replace(/ × 10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/, function (m, e) {
      return '<span class="x">×</span>10<sup>' + e.split("").map(function (c) { return SUPS[c]; }).join("") + "</sup>";
    });
  }

  // The engine wraps characters it added in  … ; show them as marked seams.
  function seams(s) {
    return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; })
      .replace(/([^]*)/g, function (m, s) {
        var what = { "×": "times", "°": "degrees", "rad": "radians", "(": "opening bracket", ")": "closing bracket" }[s.trim()] || s.trim();
        return '<mark class="seam"><span class="sr-only">(added ' + what + ') </span><span aria-hidden="true">' + s + "</span></mark>";
      });
  }

  function setAngle(a) {
    state.angle = a;
    save("syw-angle", a);
    var deg = a === "deg";
    modeFlag.textContent = deg ? "DEG" : "RAD";
    angleKey.classList.toggle("is-rad", !deg);
    angleKey.setAttribute("aria-label", (deg ? "DEG" : "RAD") + ", angle unit " + (deg ? "degrees" : "radians") + ". Press for " + (deg ? "radians" : "degrees"));
    preview();
  }

  function setSecond(on) {
    state.second = on;
    secondFlag.hidden = !on;
    document.querySelector('[data-act="second"]').setAttribute("aria-pressed", String(on));
    document.querySelectorAll(".key[data-alt]").forEach(function (k) {
      if (!k.dataset.label) { k.dataset.label = k.innerHTML; k.dataset.aria = k.getAttribute("aria-label") || k.textContent; }
      if (on) k.textContent = k.dataset.altLabel; else k.innerHTML = k.dataset.label;
      k.setAttribute("aria-label", on ? (k.dataset.altAria || k.dataset.altLabel) : k.dataset.aria);
    });
  }

  function show(result, committed) {
    screen.classList.toggle("is-preview", !committed);
    screen.classList.remove("is-error");
    readingEl.innerHTML = seams(result.marked);
    if (result.rival) {
      rivalEl.hidden = false;
      rivalEl.innerHTML = '<span class="rival-label">or</span> <span class="rival-ans">' + num(result.rival.display) + '</span> <span class="rival-label">if read</span> <span class="rival-read">' + seams(result.rival.marked) + "</span>";
    } else rivalEl.hidden = true;
    answerEl.innerHTML = num(result.display);
    answerEl.parentElement.classList.toggle("is-long", result.display.length > 11);
    approxEl.hidden = !result.rounded;
    var notes = [];
    if (result.rounded) notes.push("Exact double: " + result.exact);
    notes = notes.concat(result.notes);
    detailEl.textContent = notes.join(" · ");
  }

  function showError(err, committed) {
    readingEl.textContent = "—";
    rivalEl.hidden = true;
    if (committed) {
      screen.classList.add("is-error");
      answerEl.textContent = "Error";
      approxEl.hidden = true;
      detailEl.textContent = err.message + (typeof err.pos === "number" ? " (at character " + (err.pos + 1) + ")" : "");
      alertEl.textContent = "Error: " + detailEl.textContent;
    } else {
      screen.classList.add("is-preview");
      detailEl.textContent = input.value.trim() ? err.message : "";
    }
  }

  function preview() {
    if (!input.value.trim()) {
      readingEl.textContent = "—"; rivalEl.hidden = true; answerEl.innerHTML = state.ans === null ? "0" : num(Calc.format(state.ans));
      approxEl.hidden = true; detailEl.textContent = ""; screen.classList.remove("is-error");
      return;
    }
    try { show(Calc.calculate(input.value, env()), false); }
    catch (e) { if (e instanceof Calc.CalcError) showError(e, false); else throw e; }
  }

  function equals() {
    if (!input.value.trim()) return;
    try {
      var r = Calc.calculate(input.value, env());
      show(r, true);
      state.ans = r.value; save("syw-ans", r.value);
      state.tape.unshift({ x: input.value, reading: r.reading, marked: r.marked, display: r.display, rounded: r.rounded, angle: state.angle, rival: r.rival ? r.rival.display : null });
      state.tape = state.tape.slice(0, 50); save("syw-tape", state.tape);
      renderTape();
      state.fresh = true;
      announceEl.textContent = "Read as " + r.reading + ". Answer " + (r.rounded ? "about " : "") + r.display + "." +
        (r.rival ? " Other calculators may read it as " + r.rival.reading + ", giving " + r.rival.display + "." : "");
      alertEl.textContent = "";
    } catch (e) {
      if (e instanceof Calc.CalcError) showError(e, true); else throw e;
    }
  }

  function remember() { caret.start = input.selectionStart; caret.end = input.selectionEnd; }

  function insert(text) {
    if (state.fresh) {
      // After =, an operator continues from the answer; anything else starts afresh.
      input.value = /^[+−×÷^!%E]/.test(text) && text !== "E" ? "Ans" : "";
      caret.start = caret.end = input.value.length;
      state.fresh = false;
    }
    var v = input.value;
    input.value = v.slice(0, caret.start) + text + v.slice(caret.end);
    caret.start = caret.end = caret.start + text.length;
    preview();
  }

  function back() {
    state.fresh = false;
    var v = input.value;
    if (caret.start !== caret.end) { input.value = v.slice(0, caret.start) + v.slice(caret.end); caret.end = caret.start; }
    else if (caret.start > 0) {
      var cut = /(asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|log\(|exp\(|ln\(|Ans|.)$/.exec(v.slice(0, caret.start))[0].length;
      input.value = v.slice(0, caret.start - cut) + v.slice(caret.start);
      caret.start = caret.end = caret.start - cut;
    }
    preview();
  }

  function clearAll() { input.value = ""; caret.start = caret.end = 0; state.fresh = false; preview(); }

  document.getElementById("keys").addEventListener("click", function (e) {
    var k = e.target.closest(".key");
    if (!k) return;
    var act = k.dataset.act;
    if (act === "second") { setSecond(!state.second); return; }
    if (act === "angle") { setAngle(state.angle === "deg" ? "rad" : "deg"); return; }
    if (act === "back") { back(); return; }
    if (act === "clear") { clearAll(); return; }
    if (act === "eq") { equals(); return; }
    var text = state.second && k.dataset.alt ? k.dataset.alt : k.dataset.ins;
    insert(text);
    // Say which key went in; aria-labels start with the visible key text, so the first part names it.
    echoEl.textContent = (k.getAttribute("aria-label") || k.textContent).split(",")[0];
    if (state.second) setSecond(false);
  });

  input.addEventListener("input", function () { state.fresh = false; remember(); preview(); });
  ["keyup", "click", "select", "focus"].forEach(function (ev) { input.addEventListener(ev, remember); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); equals(); }
    else if (e.key === "Escape") { e.preventDefault(); clearAll(); }
    else if (state.fresh && e.key.length === 1) {
      state.fresh = false;
      if (/[+\-*/^!%]/.test(e.key)) { input.value = "Ans"; input.setSelectionRange(3, 3); }
      else { input.value = ""; }
    }
  });

  function renderTape() {
    tapeEl.textContent = "";
    tapeEmpty.hidden = state.tape.length > 0;
    state.tape.forEach(function (t) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tape-entry";
      b.innerHTML = '<span class="t-x"></span><span class="t-read"></span><span class="t-ans"></span>';
      b.querySelector(".t-x").textContent = t.x + (t.angle === "rad" ? "  (RAD)" : "");
      b.querySelector(".t-read").innerHTML = seams(t.marked || t.reading) + (t.rival ? ' <span class="t-rival">(other reading: ' + t.rival + ")</span>" : "");
      b.querySelector(".t-ans").innerHTML = "= " + (t.rounded ? "≈ " : "") + num(t.display);
      b.setAttribute("aria-label", t.x + " = " + t.display + ", read as " + t.reading + ". Use again");
      b.addEventListener("click", function () {
        if (t.angle !== state.angle) setAngle(t.angle);
        input.value = t.x; caret.start = caret.end = t.x.length; state.fresh = false; preview();
        if (!touch) input.focus();
      });
      li.appendChild(b);
      tapeEl.appendChild(li);
    });
  }
  document.getElementById("tape-clear").addEventListener("click", function () { state.tape = []; save("syw-tape", []); renderTape(); });

  // A link like index.html?x=sin(30)&mode=rad loads that calculation.
  var q = new URLSearchParams(location.search);
  if (q.get("mode") === "rad" || q.get("mode") === "deg") state.angle = q.get("mode");
  setAngle(state.angle);
  if (q.get("x")) { input.value = q.get("x"); caret.start = caret.end = input.value.length; }
  renderTape();
  preview();
})();
