# Local playback modifications

- Skip the expensive NYRandomTextureLines() background-texture pass. Texture function remains in source but is not invoked.
- Generate mainCanvas using the current viewport aspect ratio, keeping the original long-edge resolution budget (4000 * scaler * deviceScaler, default 2000).
- Preserve the original internal paper margin (100 * scaler, default 50 on the 2000-pixel generation buffer); the outer canvas still fills the viewport.
- Composite mainCanvas directly over the full viewport (no fixed 4:3 / 3:4 layout, letterboxing or center-cropping). Draw the final generated buffer before noLoop.

Block/triangle drawing, color and random generator functions are unchanged. Orientation trait RNG is still consumed as before, but no longer determines the drawing dimensions. Texture removal and new composition dimensions intentionally change the output compared with the original fixed-layout version; same fxhash is not a promise of the same original composition. Each new generation uses the viewport dimensions at startup.

SOURCE.json retains the original upstream checksum; upstream/sketch.js is an exact copy of that original and is not loaded by the player. LOCAL-CHANGES.json records upstream and authorized modified sketch checksums, checked by scripts/verify-sources.mjs. Update that metadata deliberately when making future local edits.
