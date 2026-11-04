# Recursive viewport independent validation — PASS

2026-11-04, actual Electron 39.8.10 / Chromium 142 / artwork p5 1.4.1. Ran `player/test/recursive-fullscreen.js` with the supplied Node 24 launcher on the Mac mini. Exit code 0; `RECURSIVE_FULLSCREEN_PASS` in `run.log`. Ordinary visible window, fullscreen=false and alwaysOnTop=false asserted; no exhibition native-window code called. The `?exhibition=1` player query only suppresses UI overlays. Exact localhost origin allow-list enforced for every network request.

| Content viewport | Generation canvas | Completion elapsed | Distinct display colors |
|---|---|---|---|
| 800×450 (16:9) | 2000×1125 | 9,900 ms | 70,654 |
| 450×800 (9:16) | 1125×2000 | 9,488 ms | 68,737 |
| 600×600 (1:1) | 2000×2000 | 11,521 ms | 62,603 |

All three use the same fixed fxhash, appended by test-only request redirect; artwork source is not modified/instrumented. Each genuinely reached player `completed: setup`, `drawFinished=true`, and `isLooping()=false`. Visible canvas rectangle is exactly (0,0,viewportWidth,viewportHeight). Generation aspect equals viewport aspect, maintaining the 2000-pixel long-edge budget.

After completion, same-origin iframe evaluation reads the real lexical `mainCanvas`. A fresh reference canvas composites the completed mainCanvas to display dimensions. Every display RGBA pixel matches reference exactly in all cases (differing=0, maxDelta=0), including all edges. This validates final-frame flush without calling artwork draw or sending fake completion. All display pixels opaque; no near-black pixels on any of the four outermost edges. Frames remain byte-identical after another 200 ms. No blocked requests, HTTP failures, or renderer console errors.

Manually inspected `wide.png`, `portrait.png`, and `square.png`: all show complete, nonblank green recursive linework throughout the viewport, reaching all four boundaries, without black bars or the former fixed outer paper margin. Interior light paper areas are intentional shapes, not letterboxing.

Source review: upstream SHA-256 `3a56aa2b1c86a627647b79961ff6e6ff2f97bfa2b8f95ea1ec595bb181e4533b`; tested local SHA-256 `cf5d5dff981b888fd6c6c7dea25c84d295e3e87dfecce899a4ef88363019a9f2`. Both match LOCAL-CHANGES.json. Full recursive algorithms from NYRect through NYNoiseMap, and all sleep/fxRandom/keyboard/redraw helpers, are byte-identical to preserved upstream after CRLF normalization. Reviewed complete source diff: only authorized viewport dimensions, margin removal, composite/final flush, and already-authorized texture-pass skip differ. Feature/RNG setup and helper algorithms unchanged. Changed dimensions naturally change recursion branches and RNG consumption; identical final compositions across different aspect ratios are neither expected nor claimed.

Artifacts: `results.json`, `run.log`, `wide.png`, `portrait.png`, `square.png`. Reviewer wrote only this audit directory and `player/test/recursive-fullscreen.js`; no source changes, commits, pushes, fullscreen takeover, or service changes. This validates three fresh generations, not live resizing during an in-progress generation.
