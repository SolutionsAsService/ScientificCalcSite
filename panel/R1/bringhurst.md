Seat: Bringhurst
Verdict: OBJECT
Observed: The numerals are largely right. Answer, tape and tables set tabular figures (font-variant-numeric: tabular-nums on .answer, .t-ans, .ex-out, .data .num) in lining Plex Mono. fmt() writes a true minus (U+2212), × and ÷, never hyphen or x. Exponents are real superscript glyphs (10⁻³⁴), and the keys read sin⁻¹, eˣ, x². The flaws are in the scientific notation. In the 2.6rem mono answer, " × 10²³" uses full 0.6em mono cells either side of ×, so the operator drifts from its operands, and the Unicode superscripts are much smaller and lighter than the mantissa. The key legends (.62rem, about 10 px, mono) put ⁻¹ and ˣ at roughly 6 px, which is illegible on a phone. The x in x², x³ and xʸ is upright, not italic, so a variable looks like a letter.
Anchor: Bringhurst 4.2/6.2, mathematical and scientific composition: operators get proportional, thin space, and superscripts are drawn for their job, not faked.
Meaning: Numbers are shown as quantities, with sign and magnitude readable at a glance.
Artist question: Does the exponent look like part of the number, or like a footnote stuck on it?
Neutral question: Can a student read the ⁻¹ on a 10 px key legend on a phone?
Opinion: Keep the figures. Fix the spacing and size of the exponent and the legends.
Requested change: Make fmt() return the exponent as markup, `mant<span class="x">×</span>10<sup>exp</sup>`. Style .x with margin-inline: .2em, so the thin gap does not depend on mono cells. Style .answer sup with font-size .6em, vertical-align: .45em and font-weight 500. Raise .key[data-alt-label]::before to .72rem. Set x in the x², xʸ and eˣ labels in italic.
