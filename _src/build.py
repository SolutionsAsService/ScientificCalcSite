"""Build the Scientific Calculator site.

Pages are _src/pages/*.html wrapped in _src/layout.html. The functions,
constants and guide pages are generated from _src/data.json, and every
result they print is computed by the calculator's own engine
(site/js/calc.js) through Node, so the reference can't disagree with the
calculator.

Run:  python _src/build.py   (needs Node; writes into site/)
"""
import html
import json
import pathlib
import re
import subprocess
import urllib.parse

SRC = pathlib.Path(__file__).resolve().parent
SITE = SRC.parent / "site"
NAV = ["calculator", "functions", "constants", "guide"]
SUP = str.maketrans("-0123456789", "⁻⁰¹²³⁴⁵⁶⁷⁸⁹")

data = json.loads((SRC / "data.json").read_text(encoding="utf-8"))
results = json.loads(subprocess.run(["node", str(SRC / "eval-examples.cjs")], capture_output=True, text=True,
                                    encoding="utf-8", check=True).stdout)
esc = html.escape


def result(expr, mode="deg"):
    r = results[f"{expr}|{mode}"]
    assert "error" not in r, f"example {expr} ({mode}) fails: {r['error']}"
    return r


SUBS = str.maketrans("⁻⁰¹²³⁴⁵⁶⁷⁸⁹", "−0123456789")


def num(s):
    """Typeset '6.02 × 10²³' with a thin-spaced × and a real superscript (escapes the rest)."""
    m = re.search(r" × 10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)$", s)
    if not m:
        return esc(s)
    return f'{esc(s[:m.start()])}<span class="x">×</span>10<sup>{m.group(1).translate(SUBS)}</sup>'


def try_link(expr, mode="deg"):
    q = urllib.parse.urlencode({"x": expr, **({"mode": "rad"} if mode == "rad" else {})})
    return f"index.html?{q}"


def example_row(expr, mode="deg"):
    r = result(expr, mode)
    unit = '<span class="mode-tag">RAD</span>' if mode == "rad" else ""
    return (f'<li><a class="ex" href="{try_link(expr, mode)}"><code class="ex-in">{esc(expr)}</code>{unit}'
            f'<span class="ex-read">{seams(r["marked"])}</span><span class="ex-out">= {num(r["display"])}</span></a></li>')


def functions_html():
    out = []
    for g in data["functions"]:
        out.append(f'<section class="ref-group"><h2>{esc(g["group"])}</h2><div class="ref-list">')
        for f in g["items"]:
            mode = f.get("mode", "deg")
            rows = "".join(example_row(e, mode) for e in f["examples"])
            out.append(f'<article class="ref"><h3><code>{esc(f["name"])}</code></h3><p>{esc(f["what"])}</p><ul class="examples">{rows}</ul></article>')
        out.append("</div></section>")
    return "\n".join(out)


def sci(value):
    """The constant's stored value written out in full, as Python's repr gives it."""
    s = repr(float(value))
    if "e" in s:
        m, e = s.split("e")
        return f"{m} × 10{str(int(e)).translate(SUP)}"
    return s.rstrip("0").rstrip(".") if "." in s else s


def constants_html():
    rows = []
    for c in data["constants"]:
        value = results["__constants"][c["token"]]
        rows.append(
            f'<tr><th scope="row"><a href="{try_link(c["token"])}"><code>{esc(c["token"])}</code></a></th>'
            f'<td>{esc(c["name"])}</td><td class="num">{num(sci(value))}</td><td>{esc(c["unit"])}</td><td>{esc(c["kind"])}</td></tr>')
    return "\n".join(rows)


def seams(s):
    def one(m):
        s2 = m.group(1)
        what = {"×": "times", "°": "degrees", "rad": "radians", "(": "opening bracket", ")": "closing bracket"}.get(s2.strip(), s2.strip())
        return f'<mark class="seam"><span class="sr-only">(added {what}) </span><span aria-hidden="true">{s2}</span></mark>'
    return re.sub("([^]*)", one, esc(s))


def guide_html():
    rows = []
    for g in data["guide"]:
        mode = g.get("mode", "deg")
        r = result(g["expr"], mode)
        tag = ' <span class="mode-tag">RAD</span>' if mode == "rad" else ""
        rows.append(
            f'<tr><td><a href="{try_link(g["expr"], mode)}"><code>{esc(g["expr"])}</code></a>{tag}</td>'
            f'<td><code class="reading">{seams(r["marked"])}</code></td><td class="num">{num(r["display"])}</td>'
            f'<td>{('<code class="reading">' + seams(r["rival"]["marked"]) + "</code> = " + num(r["rival"]["display"])) if r["rival"] else "—"}</td>'
            f'<td>{esc(g["why"])}</td></tr>')
    return "\n".join(rows)


def page(layout, meta, body):
    out = layout.replace("{{title}}", meta["title"]).replace("{{description}}", meta["description"])
    for key in NAV:
        out = out.replace("{{cur:%s}}" % key, ' aria-current="page"' if meta.get("nav") == key else "")
    out = out.replace("{{content}}", body.rstrip())
    assert not re.search(r"\{\{.*?\}\}", out), f"unfilled placeholder in {meta['title']}"
    return out


def main():
    layout = (SRC / "layout.html").read_text(encoding="utf-8")
    blocks = {"{{functions}}": functions_html(), "{{constants}}": constants_html(), "{{guide}}": guide_html(),
              "{{fn_count}}": str(sum(len(g["items"]) for g in data["functions"])),
              "{{const_count}}": str(len(data["constants"]))}
    built = []
    for src in sorted((SRC / "pages").glob("*.html")):
        head, body = src.read_text(encoding="utf-8").split("\n---\n", 1)
        meta = dict(line.split(": ", 1) for line in head.strip().splitlines())
        for k, v in blocks.items():
            body = body.replace(k, v)
        (SITE / src.name).write_text(page(layout, meta, body), encoding="utf-8", newline="\n")
        built.append(src.name)
    for name in built:
        text = (SITE / name).read_text(encoding="utf-8")
        for ref in re.findall(r'(?:href|src)="(?![a-z]+:)([^"#?]+)', text):
            assert (SITE / ref).exists(), f"{name} links to missing {ref}"
    print("built", len(built), "pages;", len(results) - 1, "examples evaluated by the engine")


main()
