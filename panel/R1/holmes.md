Seat: Holmes
Verdict: OBJECT (one small change; everything else passes)
Observed: Strong spectrum work: the seam is a wavy underline plus bold, not colour alone, so a colour-blind reader still sees it. Focus rings are 3 px. Enter evaluates and Esc clears from the input, so a keyboard-only user never has to tab through ~35 keys. The = key sits bottom right for a thumb, and keys are 57 px at 375 px. Every key carries an aria-label, and Ans reads "previous answer" to a screen reader. Weak points: the 2nd-function legends (sin⁻¹, eˣ, 10ˣ, x³, ∛) are .62rem (about 10 px) mono green via ::before in styles.css line 98, which is the first thing to break at 200% zoom or in bright sun on a phone. The visible "Ans" key has no gloss for a sighted novice.
Anchor: Holmes's persona spectrum, from permanent to temporary to situational limits. Low vision, a glare-washed phone and a one-handed grip are one mismatch with three causes. Solve for the smallest legend and everyone gains.
Meaning: the small green legends are the only way to discover the inverse functions, so they are meaning-bearing text, not decoration.
Artist question: can the legend stay a quiet whisper above the label while being readable?
Neutral question: what size and contrast does the legend reach at 375 px and at 200% zoom?
Opinion: yes, raise it to 12 px. Calm and legible are compatible.
Requested change: set .key[data-alt-label]::before to font-size .75rem (12 px) and weight 600, with .key[data-alt-label] padding-top 12px, then check that the ::before does not collide with the label at 57 px keys. Optionally add title="previous answer" to the Ans key so hover and long-press explain it.
