Seat: Shklovsky
Verdict: OBJECT
Observed: In index-1280.png, `6/2(1+2)` becomes `(6 ÷ 2) × (1 + 2)`: the inserted bracket and × sit in the same off-white as typed characters, at small size under the input. Nothing marks which glyphs the machine added, so the eye slides over the line as a tidy echo. In index-rad-1280.png, `sin(30)` in RAD reads `sin(30)`, identical to the input, and the dim −0.988 stands as a plain answer. The unit that makes the result strange (radians, not degrees) is not written. Only the unit badge says so, and that is a label rather than a seen act. The tape, keys and graphite body are a well-made familiar calculator.
Anchor: Defamiliarization (Art as Technique): the device must impede perception and lengthen the act of seeing. A line the reader does not have to look at is automatized.
Meaning: READ AS promises to show the machine's silent decisions.
Artist question: Which exact characters did you add, and can I see the seam?
Neutral question: Does the reader notice what was inserted, or only that a line repeats the input?
Opinion: Half-strange. It lands on `6/2(1+2)` and fails on `sin(30)` in RAD.
Requested change: In calc.js and ui.js, wrap every inserted token (bracket, ×, °, rad) in a span styled in the yellow accent with a thick wavy underline. In RAD, write `sin(30 rad)` so a reading never equals the input. Keep typed characters plain.
